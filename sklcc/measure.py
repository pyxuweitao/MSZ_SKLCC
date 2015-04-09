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
	"""
	为了方便Html模板编写而建立的转换函数
	:param res: 包含工艺信息和测量结果数据的列表
	:return:转换后的列表
	"""
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
	"""
	根据款号和型号获取工艺员录入的工艺信息
	:param styleno:款号
	:param size: 型号(尺码)
	:return:按格式组织的列表
	"""
	Raw = Raw_sql()
	#按部位排序是为了在data字段添加数据时不必再次进行遍历查找部位所在的dict
	Raw.sql = "select partition, measure_res, common_difference, symmetry from sklcc_style_measure " \
	          "where styleno = '%s' and size = '%s' and measure_or_not = 1 and state = 1 order by serial"%( styleno, size )
	target_list = Raw.query_all()
	res = []
	if target_list != False:
		for target in target_list:
			if target[0] not in [ one['partition'] for one in res ]:
				#common_difference包含正负公差，以@分割，前为正公差，后为负公差
				res.append( { 'partition':target[0], 'common_difference':'+' + target[2].replace('@', '/-'), 'symmetry':target[3], 'standard':target[1], 'data': [] } )

	return res

def get_measure_data_by_serialno( serialno, styleno, size ):
	"""
	根据流水号和款号型号获得检验员测量数据，只在measure_check_info中用到，和get_inspector_measure_data类似
	:param serialno: 测量记录单流水号
	:param styleno: 款号
	:param size: 型号（尺码）
	:return:按格式组织的列表
	"""
	Raw = Raw_sql()
	measure_info = get_measure_info_by_styleno_and_size( styleno, size )
	Raw.sql = "SELECT partition, measure_res, measure_type, symmetry1, symmetry2" \
	          " FROM sklcc_measure_info WHERE serialno = '%s' ORDER BY count_id, partition"%serialno
	target_list = Raw.query_all()
	partition_list = [ one['partition'] for one in measure_info ]

	if target_list != False:
		for target in target_list:
			if target[2] == 1:
				measure_info[partition_list.index( target[0] )]['data'].append( [target[3], target[4]] )
			else:
				measure_info[partition_list.index( target[0] )]['data'].append( [target[1]] )
	return measure_info

def get_inspector_measure_data( inspector_no, date, batch = None, size = None, contentid = None, measure_force_recheck = False, styleno = None ):
	"""
	获取检验员（一检、二检）测量数据，res_list中也包含对应款和尺码的工艺员测量数据
	:param inspector_no: 检验员工号
	:param date: 时间，年-月-日
	:param batch: 批次号
	:param size: 型号（尺码）
	:param contentid: 二检提交的contentid
	:param measure_force_recheck: 用来区分一检和二检的measure_force页面以写入数据库中的字段is_first_check
	:return:res_list：包含测量数据和工艺信息，与batch_list一一对应，batch_list为记录的表头信息
	"""
	#measure_force兼容
	if batch == None:
		styleno = None
	Raw          = Raw_sql()
	res_list     = []
	batch_list   = []
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
	#一检和二检的measure_force_recheck
	else:
		Raw.sql = """SELECT inspector_no, batch, a.styleno, a.size, partition, measure_res,
					symmetry1, symmetry2, count_id, measure_type, a.serialno FROM sklcc_measure_record a JOIN sklcc_measure_info b
					ON a.serialno = b.serialno
					WHERE inspector_no = '%s' AND left( a.createtime, 10 ) = '%s' AND is_first_check = %d
					ORDER BY a.batch, a.size, %s count_id"""%( inspector_no, date,
		            0 if measure_force_recheck else 1, 'contentid, ' if measure_force_recheck else "" )
		raw_data = Raw.query_all()
		if raw_data != False:
			for i, data in enumerate( raw_data ):
				if  { 'model':data[1], 'size':data[3], 'serialno': data[10] } not in batch_list:
					batch_list.append( { 'model':data[1], 'size':data[3], 'serialno':data[10] } )
					res_list.append( get_measure_info_by_styleno_and_size( data[2], data[3] ) )

				#因为res_list新增的尾部列表中的dict按styleno, size,partition排过序，所以此处的Partition必为第0个dict
				partition_no = len( res_list[-1] )
				if partition_no == 0:
					continue
				if data[9] == 1:
					res_list[-1][i % partition_no]['data'].append( [ data[6], data[7] ] )
				else:
					res_list[-1][i % partition_no ]['data'].append( [data[5]] )

			if batch != None:

				for i,one in enumerate( batch_list ):
					if batch == one['model'] and size == one['size']:
						batch_list.insert( 0, batch_list.pop( i ) )
						res_list.insert( 0, res_list.pop( i ) )
						return res_list, batch_list

		if batch != None:
			batch_list.insert( 0, { 'model':batch, 'size':size, 'serialno':uuid.uuid1() } )
			res_list.insert( 0, get_measure_info_by_styleno_and_size( styleno, size ) )

		return res_list, batch_list


def measure_in( request ):
	try:
		inspector_no = request.session['employeeno']
		batch        = request.GET['batch']
		size         = request.GET['size']
		styelno      = request.GET['styleno']
		Raw          = Raw_sql()
		T            = Current_time()
		today        = T.get_date()
		measure_data = get_inspector_measure_data( inspector_no, today, batch, size, styleno=styelno )
		res_list     = measure_data[0]
		ok        = []

		for one in res_list:
			ok.append( toTypehorizon(one) )
		info_list = measure_data[1]
		html      = get_template( "measure_in.html" )
		return TemplateResponse( request, html, locals() )
	except Exception,e:
		pass

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
		pass

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

def written_into_measure_record( info, is_first_check = 'True' ):
	Raw = Raw_sql()
	Raw.sql = "insert into sklcc_measure_record( serialno, createtime, inspector_no, inspector, batch, styleno, size, " \
		          "measure_count, state, is_first_check, departmentno ) values( '%s', '%s', '%s', '%s', '%s', '%s', '%s'" \
		          ", %d, 2, '%s', '%s' )"%( info['serialno'], info['createtime'], info['inspector_no'],
	                                        info['inspector'], info['batch'], info['styleno'], info['size'],
	                                        info['measure_count'], is_first_check, info['departmentno'] )

	Raw.update()

def measure_commit( request ):
	start = time.clock()
	try:
		Raw             = Raw_sql()
		T               = Current_time()
		createtime      = T.time_str
		json            = request.POST['JSON']
		#contentid = False
		contentid       = request.POST['contentid'] if 'contentid' in request.POST else False
		inspector_no    = request.session['employeeno']
		inspector       = request.session['employee']
		count_contentid = 0
		data            = simplejson.loads( json )
		SQL             = ""

		for one in data:
			batch    = one['model']
			Raw.sql  = "SELECT TOP 1 departmentno, styleno FROM producemaster WHERE batch = '%s'"%batch
			target   = Raw.query_one('MSZ')
			departmentno = ""
			styleno  = "measure_commit_cannot_find_styleno"
			if target != False:
				departmentno = target[0]
				styleno      = target[1]
			size     = one['size']
			serialno = one['serialno']
			res      = one['res']

			if contentid == False:
				SQL += "delete from sklcc_measure_info where serialno = '%s';"%serialno
				#Raw.update()
				SQL += "delete from sklcc_measure_record where serialno = '%s';"%serialno
				#Raw.update()
			else:
				Raw.sql = "delete from sklcc_measure_info where contentid = '%s'"%contentid
				Raw.update()
				Raw.sql = "SELECT COUNT( DISTINCT contentid ) FROM sklcc_measure_info WHERE serialno = '%s' "%serialno
				target = Raw.query_one()

				if target != False:
					count_contentid = target[0]
				if count_contentid == 0:
					SQL += "DELETE FROM sklcc_measure_record WHERE serialno = '%s';"%serialno
				#else:
					#SQL += "UPDATE sklcc_measure_record SET measure_count = %d WHERE serialno = '%s';"%( count_contentid, serialno )
				#Raw.update()

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
						SQL += "insert into sklcc_measure_info( serialno, styleno, createtime, partition," \
	                        "measure_res, measure_type, count_id, contentid ) values( '%s', '%s', '%s', '%s', %f, %d, %d, '%s' );"\
		                    %( serialno, styleno, createtime,
	                        partition, measure_res, 0, count_id, contentid )
					else:
						symmetry1 = float( data[0] )
						symmetry2 = float( data[1] )
						SQL += "insert into sklcc_measure_info( serialno, styleno, createtime, partition," \
	                        "measure_type, symmetry1, symmetry2, count_id, contentid ) values( '%s', '%s', '%s', '%s', %d, %f, %f, %d, '%s');"\
		                %( serialno, styleno, createtime, partition,
		                    1, symmetry1, symmetry2, count_id, contentid )

				if contentid != False:
					#二检插入sklcc_measure_record
					if count_contentid == 0:
						SQL += "insert into sklcc_measure_record( serialno, createtime, inspector_no, inspector, batch, styleno, size, " \
		                "measure_count, state, is_first_check, departmentno ) values( '%s', '%s', '%s', '%s', '%s', '%s', '%s'" \
		                ", %d, 2, '%s', '%s' );"%( serialno, createtime, inspector_no,
	                                        inspector, batch, styleno, size,
	                                        count_id, 'False', departmentno )
					else:
						SQL += "UPDATE sklcc_measure_record SET measure_count = (" \
						       " SELECT COUNT( DISTINCT contentid ) FROM sklcc_measure_info WHERE serialno = '%s' )" \
						       " WHERE serialno = '%s';"%( serialno, serialno )
					#written_into_measure_record( dict( serialno = serialno, createtime = createtime, inspector = inspector, inspector_no = inspector_no,
			                                   #batch = batch, styleno = styleno, size = size, measure_count = count_id, departmentno = departmentno ), 'False' )
				else:
					#一检插入sklcc_measure_record
					SQL += "insert into sklcc_measure_record( serialno, createtime, inspector_no, inspector, batch, styleno, size, " \
		            "measure_count, state, is_first_check, departmentno ) values( '%s', '%s', '%s', '%s', '%s', '%s', '%s'" \
		            ", %d, 2, '%s', '%s' );"%( serialno, createtime, inspector_no,
	                                        inspector, batch, styleno, size,
	                                        count_id, 'True', departmentno )
					#written_into_measure_record( dict( serialno = serialno, createtime = createtime, inspector = inspector, inspector_no = inspector_no,
			                                   #batch = batch, styleno = styleno, size = size, measure_count = count_id, departmentno = departmentno ), 'True' )
		Raw.sql = SQL

		Raw.update()

		return HttpResponse()
	except Exception,e:
		pass

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

	if 'deptno' in request.GET.keys():
		start          = request.GET['start'] if 'start' in request.GET.keys() else Current_time.get_now_date()
		end            = request.GET['end'] if 'end' in request.GET.keys() else Current_time.get_now_date()
		departmentno   = request.GET['deptno']
		batch          = request.GET['batch']
		Raw.sql = "SELECT serialno, departmentno, left( createtime, 10 ), inspector_no, inspector, batch, size, measure_count FROM sklcc_measure_record" \
		          " WHERE left( createtime, 10 ) >= '%s' AND left( createtime, 10 ) <= '%s' AND is_first_check = 1"%( start, end )

		if batch != "":
			Raw.sql += " AND batch = '%s'"%batch
		if departmentno != "":
			Raw.sql += " AND departmentno = '%s'"%departmentno
		Raw.sql += 'ORDER BY createtime DESC'
		target_list = Raw.query_all()
		res_list = []

		if target_list != False:
			for target in target_list:
				res_list.append(  {'serialno':target[0],
				                   'deptno':target[1],
				                   'time':target[2],
				                   'inspector_no':target[3],
				                   'inspector':target[4],
				                   'batch':target[5],
				                   'size':target[6],
				                   'count':target[7] } )
	return TemplateResponse( request, html, locals() )


def measure_check_recheck( request ):
	employeename = request.session['employee']
	em_number    = request.session['employeeno']
	username     = request.session['username']
	today        = Current_time().get_date()
	Raw          = Raw_sql()
	html         = get_template( 'measure_check_recheck.html' )
	department_list = find_department_authority_user( username, 5 )
	deptno_list     = list( set( department_list ) )
	deptno_list.sort( key = department_list.index )
	dept_list       = []
	for one in department_list:
		dept_list.append( {'no':one,'name':find_department_name( one ) ,} )

	if 'deptno' in request.GET.keys():
		start          = request.GET['start'] if 'start' in request.GET.keys() else Current_time.get_now_date()
		end            = request.GET['end'] if 'end' in request.GET.keys() else Current_time.get_now_date()
		departmentno   = request.GET['deptno']
		batch          = request.GET['batch']
		Raw.sql = "SELECT serialno, left( createtime, 10 ), inspector_no, inspector, batch, size, measure_count, departmentno FROM sklcc_measure_record" \
		          " WHERE left( createtime, 10 ) >= '%s' AND left( createtime, 10 ) <= '%s' AND is_first_check = 0"%( start, end )

		if batch != "":
			Raw.sql += " AND batch = '%s'"%batch
		if departmentno != "":
			Raw.sql += " AND departmentno = '%s'"%departmentno
		Raw.sql += 'ORDER BY createtime DESC'
		target_list = Raw.query_all()
		res_list = []

		if target_list != False:
			for target in target_list:
				res_list.append(  {'serialno':target[0],
				                   'time':target[1],
				                   'inspector_no':target[2],
				                   'inspector':target[3],
				                   'batch':target[4],
				                   'size':target[5],
				                   'count':target[6],
								   'deptno':target[7]
				} )
	return TemplateResponse( request, html, locals() )


def measure_check_info( request ):
	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	serialno = request.GET['serialno']
	styleno  = get_styleno_by_batch( request.GET['batch'] )
	if styleno == "NULL":
		styleno = request.GET['batch'].split('-')[0]
	size     = request.GET['size']
	Raw      = Raw_sql()
	html     = get_template( 'measure_check_info.html' )
	measure_data = get_measure_data_by_serialno( serialno, styleno, size )
	return TemplateResponse( request, html, locals() )

def get_batch_by_departmentno_and_date( request ):
	departmentno   = request.GET['deptno']
	start          = request.GET['start']
	end            = request.GET['end']
	is_first_check = int( request.GET['first_check'] )
	batch_list     = []
	Raw            = Raw_sql()
	Raw.sql        = "SELECT DISTINCT batch FROM sklcc_measure_record WHERE" \
	               " left( createtime, 10 ) >= '%s' AND LEFT( createtime,10 ) <= '%s' AND is_first_check = %d"%( start, end, is_first_check )
	if departmentno != '':
		Raw.sql += " AND departmentno = '%s'"%departmentno

	batch_res    = Raw.query_all()

	if batch_res != False:
		for one in batch_res:
			batch_list.append( one[0] )

	return HttpResponse( simplejson.dumps( batch_list, ensure_ascii=False ) )

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

		measure_data = get_inspector_measure_data( inspector_no, today, measure_force_recheck=True )
		res_list  = measure_data[0]
		info_list = measure_data[1]
		ok = []

		for one in res_list:
			ok.append( toTypehorizon(one) )
		return TemplateResponse( request, html, locals() )
	except Exception,e:
		pass

def style_measure_check( request ):
	bydate       = request.GET['bydate'] if 'bydate' in request.GET.keys() else 'off'
	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	if 26 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )
	Raw          = Raw_sql()
	html         = get_template( 'style_measure_check.html' )
	res          = []
	if 'start' not in request.GET:
		Raw.sql = "SELECT DISTINCT styleno, size, left( createtime, 16 ) time, a.employeeno, b.employee, state, assessor_no, left( assesstime, 16 )" \
	               " FROM sklcc_style_measure a JOIN sklcc_employee b ON a.employeeno = b.employeeno" \
	               " WHERE state = 0 " \
	               " ORDER BY time desc"
	else:
		if bydate == 'on':
			start        = request.GET['start']
			end          = request.GET['end']

			Raw.sql      = "SELECT DISTINCT styleno, size, left( createtime, 16 ) time, a.employeeno, b.employee, state, assessor_no, left( assesstime, 16 )" \
	               " FROM sklcc_style_measure a JOIN sklcc_employee b ON a.employeeno = b.employeeno" \
	               " WHERE LEFT( createtime, 10 ) >= '%s' AND LEFT( createtime, 10 ) <= '%s' ORDER BY time desc"%( start, end )
		else:
			#加四个百分号是因为该SQL传入django_pyodbc中正式调用时仍然会引起参数缺失异常，需要四个百分号将真正带%的SQL传入
			styleno = request.GET['styleno']
			Raw.sql = "SELECT DISTINCT styleno, size, left( createtime, 16 ) time, a.employeeno, b.employee, state, assessor_no, left( assesstime, 16 )" \
	               " FROM sklcc_style_measure a JOIN sklcc_employee b ON a.employeeno = b.employeeno" \
	               " WHERE styleno LIKE '%%%%%s%%%%' ORDER BY time desc"%( styleno )
	target_list = Raw.query_all()
	if target_list != False:
		for target in target_list:
			flag = False
			for one in res:
				if one['styleno'] == target[0]:
					one['size'].append( target[1] )
					flag = True
					break
			if flag == False:
				temp = {}
				temp['styleno']    = target[0]
				temp['time']       = target[2]
				#加锚点代表审批页面跳入
				temp['url']        = '/style_measure/?style=%s'%temp['styleno']
				temp['employeeno'] = target[3]
				temp['employee']   = target[4]
				temp['size']       = [target[1]]
				temp['state']      = target[5]
				temp['assessor']   = find_em_name( target[6] ) if target[6] != None else ""
				temp['assess_time']= target[7] if target[7] != None else ""
				res.append( deepcopy( temp ) )
	return TemplateResponse( request, html, locals() )


def commit_style_measure( request ):
	Raw = Raw_sql()
	styleno = request.GET['styleno']
	Raw.sql = "UPDATE sklcc_style_measure SET state = 0 WHERE styleno = '%s'"%styleno
	Raw.update()
	return HttpResponse()

def pass_style_measure( request ):
	Raw     = Raw_sql()
	state   = int( request.GET['state'] )
	styleno = request.GET['styleno']
	time    = Current_time.get_accurate_time()
	Raw.sql = "UPDATE sklcc_style_measure SET state = %d, assessor_no = '%s', assesstime = '%s' WHERE styleno = '%s'"%(
	state, request.session['employeeno'], time, styleno )
	Raw.update()
	return HttpResponse()



def get_all_partition( measure_type_id ):
	res = []
	Raw = Raw_sql( )
	Raw.sql = "select partition from sklcc_measure_partition where measure_type_id = '%s'" % measure_type_id
	target_list = Raw.query_all( )
	if target_list != False:
		for target in target_list:
			res.append( target[0] )
	return res


def style_measure( request ):
	try:
		if 22 not in request.session['status']:
			return HttpResponseRedirect( '/warning/' )
		#reload(sys)
		#sys.setdefaultencoding('utf-8')
		em_number    = request.session['employeeno']
		employeename = request.session['employee']
		Raw          = Raw_sql( )
		Raw.sql      = "select measure_type_id, measure_type_name from sklcc_measure_type"
		target_list  = Raw.query_all( )
		measure_list = []
		state = 0
		if target_list != False:
			for target in target_list:
				temp                   = { 'id': target[0], 'name': target[1] }
				partiton_list          = get_all_partition( target[0] )
				temp['partition_list'] = partiton_list
				measure_list.append( temp )
		html = get_template( 'measure_size_set.html' )
		measure_list_json = simplejson.dumps( measure_list, ensure_ascii = False )

		common_size_list = []
		Raw.sql = "SELECT size, size_name FROM sklcc_measure_size WHERE employeeno = '%s'"%em_number
		target_list = Raw.query_all()

		if target_list != False:
			for target in target_list:
				common_size_list.append( {'name':target[1], 'value':target[0].replace( '@', ',' )[:-1] } )

		if 'style' in request.GET:
			style = request.GET['style']
			if style == '':
				###这里的state是为了方便模板进行控制
				is_mine = 1
				state   = 0
				return TemplateResponse( request, html, locals( ) )
			#serial是数据库中为了确保录入的部位有序
			Raw.sql = "select distinct partition, serial, a.employeeno, b.employee, state, assessor_no, left( assesstime, 16 )" \
			          " from sklcc_style_measure" \
			          " a JOIN sklcc_employee b ON a.employeeno = b.employeeno where styleno = '%s' ORDER BY serial" % style
			target_list = Raw.query_all( )
			if target_list == False:
				state   = 1
				is_mine = 1
				return TemplateResponse( request, html, locals( ) )
			else:
				res = []
				for target in target_list:
					temp = { }
					size_list = []
					Raw.sql = "select distinct common_difference, symmetry, size, partition, measure_res, measure_or_not, note" \
					          " from sklcc_style_measure where styleno = '%s' and partition = '%s' order by size" % (
					          style.decode( 'utf-8' ), target[0] )
					info_list = Raw.query_all( )
					if info_list != False:
						temp['common']    = unicode( info_list[0][0] ) if info_list[0][0] != 0 else ''
						temp['symmetry']  = unicode( info_list[0][1] ) if info_list[0][0] != 0 else ''
						temp['partition'] = target[0]
						temp['hint']      = info_list[0][6] if info_list[0][6] != None else ''
						temp['measure_or_not'] = 1 if info_list[0][5] else 0
						temp['data']      = []
						for info in info_list:
							one         = { }
							one['size'] = info[2]
							size_list.append( info[2] )
							one['no']   = unicode( info[4] ) if info[4] != 0 else ''
							temp['data'].append( one )
					res.append( temp )
				state            = 2
				#measure_state表示工艺测量的状态，2->0->1
				measure_state    = target_list[0][4]
				is_mine = 1 if em_number == target_list[0][2] else 0
				measure_employee = target_list[0][3]
				if target_list[0][5] != None:
					assessor         = find_em_name( target_list[0][5] )
					measure_assessor = assessor if assessor else target_list[0][5]
					assessor_time    = target_list[0][6]
				else:
					measure_assessor = ""
					assessor_time    = ""
		return TemplateResponse( request, html, locals( ) )
	except Exception, e:
		pass


def written_into_style_measure( record ):
	Raw = Raw_sql( )
	T   = Current_time( )
	now = T.time_str
	#TODO:common_difference
	Raw.sql = u"insert into sklcc_style_measure( state, employeeno,serial,styleno, common_difference, createtime, symmetry, size, partition, " \
	          u"measure_res, note, measure_or_not  ) values( 2, '%s', '%d', '%s', '%s', '%s', %f, '%s', '%s', %f, '%s', " % (
	          record['employeeno'], record['index'], record['styleno'], record['common_difference'], now, record['symmetry'], record['size'],
	          record['partition'], record['number'], record['note'] )
	Raw.sql += '1 )' if record['measure_or_not'] == True else '0 )'
	Raw.update( )


def submit_style_measure( request ):
	try:
		reload( sys )
		sys.setdefaultencoding( 'utf-8' )
		Raw = Raw_sql( )
		json = request.POST.get('json')
		res = simplejson.loads( json )
		if res['new_style'] != res['old_style']:
			Raw.sql = "select * from sklcc_style_measure where styleno = '%s'" % res['new_style']
			target = Raw.query_one( )
			if target != False:
				#this new styleno has been found
				return HttpResponse( '0' )

		Raw.sql = "delete from sklcc_style_measure where styleno = '%s'" % res['old_style']
		Raw.update( )
		record = { }
		record['styleno']    = res['new_style']
		record['employeeno'] = request.session['employeeno']
		data = res['data']
		for one in data:
			record['partition']         = one['name']
			record['index']             = int( one['index'] )
			record['measure_or_not']    = one['is_need']
			record['note']              = one['hint']
			record['symmetry']          = float( one['balance_error'] ) if one['balance_error'] != None else 0
			#TODO:common_difference
			record['common_difference'] = one['common_difference'] if one['common_difference'] != None else 0
			for temp in one['res']:
				if temp.has_key( 'size' ):
					record['size'] = temp['size']
					record['number'] = float( temp['data'] ) if temp['data'] != None else 0
					written_into_style_measure( record )
				else:
					continue

		return HttpResponse( '1' )
	except Exception, e:
		make_log( sys._getframe( ).f_code.co_name + ">>>" + str( e ) )