#-*- coding:utf-8 -*-

from utilitys import Raw_sql, Current_time
from django.template.loader import get_template
from django.template.response import TemplateResponse
from django.utils import simplejson
import uuid
from django.http import HttpResponse
from utilitys import *
from copy import deepcopy
#============================================================ measure partiton =================================================
def toTypehorizon( res ):
	horizon_list = [[],[],[],[]]
	if res != False and len( res ) != 0:
		for i in range(0,len(res[0]['data'])):
			horizon_list.append( [] )

	for one in res:
		horizon_list[0].append( one['partition'] )
		horizon_list[1].append( one['common_difference'] )
		horizon_list[2].append( one['symmetry'] )
		horizon_list[3].append( one['standard'] )
		for i, temp in enumerate( one['data'] ):
			horizon_list[i+4].append( temp )

	return horizon_list

def get_measure_info_by_styleno_and_size( styleno, size ):
	Raw = Raw_sql()
	#按部位排序是为了在data字段添加数据时不必再次进行遍历查找部位所在的dict
	Raw.sql = "select partition, measure_res, common_difference, symmetry from sklcc_style_measure " \
	          "where styleno = '%s' and size = '%s' and measure_or_not = 1 order by partition"%( styleno, size )
	target_list = Raw.query_all()
	res = []
	if target_list != False:
		for target in target_list:
			if target[0] not in [ one['partition'] for one in res ]:
				res.append( { 'partition':target[0], 'common_difference':target[2], 'symmetry':target[3], 'standard':target[1], 'data': [] } )

	return res

def get_measure_data_by_serialno( serialno, one_style ):
	Raw = Raw_sql()
	Raw.sql     = "select partition, measure_type, symmetry1, symmetry2, measure_res from sklcc_measure_info where serialno = '%s' order by count_id"%serialno
	target_list = Raw.query_all()
	if target_list != False:
		for target in target_list:
			if target[0] in [ one['partition'] for one in one_style ]:
				#measure_type = 1, has symmetry
				if target[1] == 1:
					#search in res_list for one partition
					for one in one_style:
						if one['partition'] == target[0]:
							one['data'].append( [target[2],target[3]] )
							break
				else:
					for one in one_style:
						if one['partition'] == target[0]:
							one['data'].append( [target[4]] )
							break

def get_inspector_measure_data( inspector_no, date,  batch = None, size = None, contentid = None ):
	#measure_force兼容
	if batch == None:
		styleno = None
	else:
		styleno = batch.split('-')[0]
	Raw          = Raw_sql()
	res_list     = []
	styleno_list = []
	#二检
	if contentid != None:
		res = []
		Raw.sql = """SELECT partition, measure_res, symmetry1, symmetry2, count_id, measure_type
 				FROM sklcc_measure_record a JOIN sklcc_measure_info b
				ON a.serialno = b.serialno
				WHERE inspector_no = '%s' AND left( a.createtime, 10 ) = '%s' AND contentid = '%s' AND a.size = '%s'
				AND a.styleno = '%s'
				ORDER BY count_id"""%( inspector_no, date, contentid, size, styleno )
		target_list = Raw.query_all()
		if target_list != False:
			count_id = 1
			#第count_id次测量
			temp = []
			for target in target_list:
				if target[4] != count_id:
					count_id = target[4]
					res.append( deepcopy(temp) )
					temp = []
				partition = {}
				partition['name']=target[0]
				#measure_type=1表示对称
				partition['value']=[target[1]] if target[5] == 0 else [target[2], target[3]]
				temp.append(deepcopy(partition))
			res.append( temp )

		return res
	#一检
	else:
		Raw.sql = """SELECT inspector_no, batch, a.styleno, a.size, partition, measure_res,
					symmetry1, symmetry2, count_id, measure_type, a.serialno FROM sklcc_measure_record a JOIN sklcc_measure_info b
					ON a.serialno = b.serialno
					WHERE inspector_no = '%s' AND left( a.createtime, 10 ) = '%s'
					ORDER BY a.styleno, a.size, count_id, partition"""%( inspector_no, date )
		raw_data = Raw.query_all()
		if raw_data != False:
			for i, data in enumerate( raw_data ):
				if  { 'model':data[1], 'size':data[3], 'serialno': data[10] } not in styleno_list:
					styleno_list.append( { 'model':data[1], 'size':data[3], 'serialno':data[10] } )
					res_list.append( get_measure_info_by_styleno_and_size( data[2], data[3] ) )
				#因为res_list新增的尾部列表中的dict按styleno, size,partition排过序，所以此处的Partition必为第0个dict
				partition_no = len( res_list[-1] )
				if data[9] == 1:
					res_list[-1][i % partition_no]['data'].append( [ data[6], data[7] ] )
				else:
					res_list[-1][i % partition_no ]['data'].append( [data[5]] )
			if styleno != None:

				for i,one in enumerate( styleno_list ):
					if styleno == one['model'].split('-')[0] and size == one['size']:
						styleno_list.insert( 0, styleno_list.pop( i ) )
						res_list.insert( 0, res_list.pop( i ) )
						return res_list, styleno_list
		if styleno != None:
			styleno_list.insert( 0, { 'model':batch, 'size':size, 'serialno':uuid.uuid1() } )
			res_list.insert( 0, get_measure_info_by_styleno_and_size( styleno, size ) )
		return res_list, styleno_list


def get_inspector_measure_data_OLD( inspector_no, date ):
	Raw = Raw_sql()
	res_list     = []
	styleno_list = []
	Raw.sql      = "select distinct batch, size from sklcc_measure_record where inspector_no = '%s' and left( createtime, 10 ) = '%s'"%( inspector_no, date )
	target_list  = Raw.query_all()
	if target_list != False:
		for target in target_list:
			styleno_list.append( {'model':target[0],'size':target[1], 'serialno': "" } )

	for one in styleno_list:
		res_list.append( get_measure_info_by_styleno_and_size( one['model'].split('-')[0], one['size'] ) )

	Raw.sql = "select distinct serialno, batch, size from sklcc_measure_record where inspector_no = '%s' and left( createtime, 10 ) = '%s'"%( inspector_no, date )
	target_list = Raw.query_all()

	if target_list != False:
		for target in target_list:
			for i, one in enumerate(styleno_list):
				if one['model'] == target[1] and one['size'] == target[2]:
					one['serialno'] = target[0]
					get_measure_data_by_serialno( target[0], res_list[i] )

	return res_list, styleno_list

def measure_in( request ):
	try:
		inspector_no = request.session['employeeno']
		batch        = request.GET['batch']
		size         = request.GET['size']
		Raw          = Raw_sql()
		T            = Current_time()
		today        = T.get_date()
		measure_data = get_inspector_measure_data( inspector_no, today, batch, size )
		res_list     = measure_data[0]
		ok        = []

		for one in res_list:
			ok.append( toTypehorizon(one) )
		info_list = measure_data[1]
		html      = get_template( "measure_in.html" )
		return TemplateResponse( request, html, locals() )
	except Exception,e:
		print e

def measure_force( request ):
	try:
		em_number    = request.session['employeeno']
		employeename = request.session['employee']
		html         = get_template( "measure_force.html" )
		inspector_no = request.session['employeeno']
		Raw   = Raw_sql()
		T     = Current_time()
		today = T.get_date()
		measure_data = get_inspector_measure_data( inspector_no, today )
		res_list  = measure_data[0]
		info_list = measure_data[1]
		ok = []
		for one in res_list:
			ok.append( toTypehorizon(one) )
		return TemplateResponse( request, html, locals() )
	except Exception,e:
		print e

def written_into_measure_info( info ):
	Raw = Raw_sql()
	if info['measure_type'] == 1:
		Raw.sql = "insert into sklcc_measure_info( serialno, styleno, createtime, partition," \
	          "measure_type, symmetry1, symmetry2, count_id, contentid ) values( '%s', '%s', '%s', '%s', %d, %f, %f, %d, '%s')"\
		          %( info['serialno'], info['styleno'], info['createtime'], info['partition'],
		             info['measure_type'], info['symmetry1'], info['symmetry2'], info['id'], info['contentid'] )

	else:
		Raw.sql = "insert into sklcc_measure_info( serialno, styleno, createtime, partition," \
	          "measure_res, measure_type, count_id, contentid ) values( '%s', '%s', '%s', '%s', %f, %d, %d, '%s' )"\
		          %( info['serialno'], info['styleno'], info['createtime'],
	                   info['partition'], info['measure_res'], info['measure_type'], info['id'], info['contentid'] )
	Raw.update()
	return info

def written_into_measure_record( info, is_first_check = 'True' ):
	Raw = Raw_sql()
	Raw.sql = "insert into sklcc_measure_record( serialno, createtime, inspector_no, inspector, batch, styleno, size, " \
		          "measure_count, state, is_first_check, departmentno ) values( '%s', '%s', '%s', '%s', '%s', '%s', '%s'" \
		          ", %d, 2, '%s', '%s' )"%( info['serialno'], info['createtime'], info['inspector_no'],
	                                        info['inspector'], info['batch'], info['styleno'], info['size'],
	                                        info['measure_count'], is_first_check, info['departmentno'] )
	Raw.update()

def measure_commit( request ):
	try:
		employeename = request.session['employee']
		em_number    = request.session['employeeno']
		Raw          = Raw_sql()
		T            = Current_time()
		createtime   = T.time_str
		json         = request.POST['JSON']
		#contentid = False
		contentid    = request.POST['contentid'] if 'contentid' in request.POST else False
		inspector_no = request.session['employeeno']
		inspector    = request.session['employee']
		data         = simplejson.loads( json )
		for one in data:
			batch    = one['model']
			Raw.sql  = "SELECT TOP 1 departmentno FROM producemaster WHERE batch = '%s'"%batch
			target   = Raw.query_one('MSZ')
			departmentno = ""
			if target != False:
				departmentno = target[0]
			size     = one['size']
			styleno  = batch.split('-')[0]
			serialno = one['serialno']
			res      = one['res']

			if contentid == False:
				Raw.sql = "delete from sklcc_measure_info where serialno = '%s'"%serialno
				Raw.update()
				Raw.sql = "delete from sklcc_measure_record where serialno = '%s'"%serialno
				Raw.update()
			else:
				Raw.sql = "delete from sklcc_measure_info where contentid = '%s'"%contentid
				Raw.update()
				Raw.sql = "select top 1 * from sklcc_measure_info where serialno = '%s'"%serialno
				if Raw.query_all() == False:
					Raw.sql = "delete from sklcc_measure_record where serialno = '%s'"%serialno
					Raw.update()

			count_flag = res[0]['name'] if len( res ) != 0 else ""
			count_id   = 0
			if len( res ) != 0:
				for part in res:
					if part['name'] == count_flag:
						count_id += 1
					partition   = part['name']
					data        = part['data']
					if len( data ) == 1:
						measure_res = float( data[0] )

						insert = dict( serialno = serialno, styleno = styleno, createtime = createtime, partition = partition,
						               measure_res = measure_res, measure_type = 0, id = count_id, contentid = contentid )
					else:
						symmetry1 = float( data[0] )
						symmetry2 = float( data[1] )
						insert = dict( serialno = serialno, styleno = styleno, createtime = createtime, partition = partition,
						               symmetry1 = symmetry1, symmetry2 = symmetry2, measure_type = 1, id = count_id, contentid = contentid )

					written_into_measure_info( insert )
				written_into_measure_record( dict( serialno = serialno, createtime = createtime, inspector = inspector, inspector_no = inspector_no,
			                                   batch = batch, styleno = styleno, size = size, measure_count = count_id, departmentno = departmentno ) )
		return HttpResponse()
	except Exception,e:
		print e

def measure_check( request ):
	employeename = request.session['employee']
	em_number    = request.session['employeeno']
	username     = request.session['username']
	today        = Current_time().get_date()
	Raw          = Raw_sql()
	html         = get_template( 'measure_check.html' )
	department_list = find_department_authority_user( username, 4 )
	deptno_list     = list( set( department_list ) )
	deptno_list.sort( key = department_list.index )
	dept_list       = []
	for one in department_list:
		dept_list.append( {'no':one,'name':find_department_name( one ) ,} )

	if 'date' in request.GET.keys() and 'department_no' in request.GET.keys():
		inspector_list = []
		today = request.GET['date']
		departmentno = request.GET['department_no']
		Raw.sql = "SELECT distinct inspector_no, inspector FROM sklcc_measure_record WHERE " \
		          "left( createtime, 10 ) = '%s' AND departmentno = '%s'"%( today, departmentno )
		target_list = Raw.query_all()
		if target_list != False:
			for target in target_list:
				inspector_list.append( {'employeeno':target[0], 'employee':target[1]} )
		measure_list = []
		measure_info_list = []
		ok                = []
		for i, one in enumerate( inspector_list ):
			data = get_inspector_measure_data( one['employeeno'], today )
			res_list   = data[0]
			info_list  = data[1]
			Raw.sql = "select state from sklcc_measure_record where inspector_no = '%s' and left( createtime, 10 ) = '%s'"%( one['employeeno'], request.GET['date'] )
			target  = Raw.query_one()
			state   = target[0] if target != False else 2
			one['state'] = state
			ok = []
			for temp in res_list:
				ok.append( toTypehorizon(temp) )
			measure_list.append( deepcopy( ok ) )
			measure_info_list.append( deepcopy( info_list ) )

	return TemplateResponse( request, html, locals() )

def measure_check_pass( request ):
	Raw   = Raw_sql()
	T     = Current_time()
	inspector_no = request.GET['inspector_no']
	date = request.GET['date']
	Raw.sql = "update sklcc_measure_record set state = 1 where inspector_no = '%s' and left( createtime, 10 ) = '%s'"%( inspector_no, date )
	Raw.update()
	return HttpResponse()

def measure_force_recheck( request ):
	try:
		em_number    = request.session['employeeno']
		employeename = request.session['employee']
		html         = get_template( "measure_force_recheck.html" )
		inspector_no = request.session['employeeno']
		Raw   = Raw_sql()
		T     = Current_time()
		today = T.get_date()
		measure_data = get_inspector_measure_data( inspector_no, today )
		res_list  = measure_data[0]
		info_list = measure_data[1]
		ok = []
		for one in res_list:
			ok.append( toTypehorizon(one) )
		return TemplateResponse( request, html, locals() )
	except Exception,e:
		print e