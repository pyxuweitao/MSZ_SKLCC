# -*- coding: utf-8 -*-
import sys
from forms import  *
from views import Raw_sql, find_em_name, get_time_distance_list, change_distance_date_to_str_not_have_year,\
	change_distance_date_to_str_have_year, find_record_state_is, tables_xml, Record_info, get_check_type, find_recheck_info,\
	Current_time, update_recheck_info, update_recheck_info_xml, find_status_list, find_department_authority_user, Return_check_info
from django.utils import simplejson
from django.http import HttpResponse, HttpResponseRedirect
from django.views.decorators.cache import never_cache

def pad_login( request ):
	username    = request.GET['username'].upper()
	em_password = request.GET['em_password']
	Raw         = Raw_sql()
	response = {}
	Raw.sql = "select password, employeeno, employee from sklcc_employee where username = '%s'" % username
	target  = Raw.query_one( )
	if target and target[0] == em_password:
		request.session['username']     = username
		request.session['em_password']  = em_password
		request.session['employee']     = target[2]
		request.session['employeeno']   = target[1]
		status                          = find_status_list( username )
		request.session['status']       = status
		flag = False
		for one in status:
			if one >= 8:
				flag = True
		response = HttpResponse( '1' ) if flag else HttpResponse( '0' )
	else:
		response = HttpResponse( '2' )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_form_1( request ):
	Raw   = Raw_sql()
	start = '2014-07-01'
	end   = '2014-09-30'

	Raw.sql       = "SELECT DISTINCT username FROM sklcc_employee_authority WHERE authorityid = 0"
	username_list = Raw.query_all( )

	employee_list      = []
	quality_check_list = []
	if username_list != False:
		for username in username_list:
			Raw.sql     = "select employeeno from sklcc_employee where username = '%s'" % username
			target_list = Raw.query_all( )
			if target_list != False:
				for target in target_list:
					employee_list.append( target[0] )

	for employeeno in employee_list:
		Raw.sql         = "SELECT sum( totalreturn ), batch FROM sklcc_record where left( createtime, 10 ) <= '%s' and left( createtime, 10 ) >= '%s' and inspector_no = '%s' group by batch" % (
		end, start, employeeno )
		total_list      = Raw.query_all( )
		temp            = Quality_check( )
		temp.employeeno = employeeno
		temp.employee   = find_em_name( employeeno )
		if total_list != False:
			for total in total_list:
				if total[0] == None:
					continue
				else:
					temp.slowtime += get_check_slowtime( total[1] ) * total[0]
					temp.totalnumber += total[0]
		quality_check_list.append( temp.__dict__ )
	price_permin = 0
	Raw.sql      = "SELECT TOP 1 price_permin FROM sklcc_config"
	target       = Raw.query_one( )
	if target != False:
		price_permin = target[0]
	json = []
	json.append( employee_list )
	json.append( quality_check_list )
	json.append( price_permin )

	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'

	return response

def pad_form_2( request ):
	#if 11 not in request.session['status']:
	#	return HttpResponseRedirect( '/warning/' )

	#em_number = request.session['employeeno']
	#employeename = request.session['employee']
	#if 'start' not in request.GET:
	#	time_list = []
	#	span = 0
	#	header_list = []
	#	res = []
	#	return TemplateResponse( request, html, locals( ) )
	#start = '2014-07-01'
	#end   = '2014-09-30'
	# start = request.GET['start']
	# end   = request.GET['end']
	#
	# time_list = get_time_distance_list( start, end )
	#
	# Raw = Raw_sql( )
	# res = []
	# Raw.sql = '''
     #    select left(createtime,10) timex,inspector_no,inspector,sum(totalnumber),sum(totalreturn),batch
     #    from sklcc_record
     #    where left(createtime,10)>='%s' and left(createtime,10)<='%s'
     #    group by left(createtime,10),inspector_no,inspector,batch
	# ''' % (start, end)
	# if Raw.query_all( ) != False:
	# 	for temp_record in Raw.query_all( ):
	# 		insert_into_res( temp_record[1], temp_record[2], temp_record[5],
	# 		                 round( float( temp_record[4] ) * 100 / float( temp_record[3] ), 2 ), temp_record[0],
	# 		                 int( temp_record[3] ), res )
	# for temp in res:
	# 	temp.slowtime = get_check_slowtime( temp.batch )
	# 	for temp_date in time_list:
	# 		exist = False
	# 		for temp_time in temp.data:
	# 			if temp_time['time'] == str( temp_date ):
	# 				exist = True
	# 		if not exist:
	# 			temp.append( 0, str( temp_date ), 0 )
	# for temp in res:  # 每行的日期排序
	# 	temp.data.sort( key = lambda x: x['time'] )
	# 	count = 0
	# 	lisp  = 0
	# 	for value in temp.data:
	# 		if not (value['data']) <= 1e-7:
	# 			count += value['data']
	# 			lisp  += 1
	# 		else:
	# 			value['data'] = ''
	# 	temp.data.append( { 'data': round( float( count / lisp if lisp != 0 else 0 ), 2 ) } )
	# header = []
	# if len( res ) > 0:
	# 	for temp in res[0].data[:-1]:
	# 		header.append( temp['time'][5:] )
	# span = len( header ) + 6
	#
	# print span
	# print header
	# print res
	# json = []
	# #json.append( time_list )
	# json.append( span )
	# json.append( header )
	# res_copy = []
	# for one in res:
	# 	res_copy.append( one.__dict__ )
	# json.append( res_copy )
	reload(sys)
	sys.setdefaultencoding('utf-8')
	form0_list   = []
	Raw          = Raw_sql( )

	start = request.GET['start'].replace( '/', '-' )
	end   = request.GET['end'].replace( '/', '-' )
	username = "admin"
	dep_list = find_department_authority_user( username, 15, )
	for dep in dep_list:
		Raw.sql = "select serialno, createtime, inspector, inspector_no, assessor, assessor_no, assesstime, totalnumber, totalreturn," \
		          " batch, departmentno from sklcc_record where departmentno = '%s' and state = 1 and left(assesstime,10) >= '%s' and left(assesstime,10) <= '%s'" % (
		          dep, start, end )
		target_list = Raw.query_all( )

		if target_list != False:
			for target in target_list:
				form = History_form( )
				form.category     = "一检"
				form.serialno     = target[0]
				form.createtime   = target[1][:-10]
				form.inspector    = target[2]
				form.inspector_no = target[3]
				form.assessor     = target[4]
				form.assessor_no  = target[5]
				form.assesstime   = target[6][:-10]
				form.totalnumber  = str( target[7] )
				form.totalreturn  = str( target[8] )
				form.batch        = target[9]
				form.departmentno = target[10]
				form.deaprtment   = find_department_name( form.departmentno )
				form.url          = "/read_only_table?history#%s/" % ( form.serialno )
				form0_list.append( form )

	for dep in dep_list:
		Raw.sql = "select serialno, createtime, inspector, inspector_no, recheckor, recheckor_no, assesstime," \
		          " batch, departmentno, department, leader, leader_no from sklcc_recheck_info where departmentno = '%s' and state = 1 and left(assesstime,10) >= '%s' and left(assesstime,10) <= '%s'" % (
		          dep, start, end )
		target_list = Raw.query_all( )

		if target_list != False:
			for target in target_list:
				form = History_form( )
				form.category = "二检"
				form.serialno = target[0]
				form.createtime = target[1][:-10]
				form.inspector = target[2]
				form.inspector_no = target[3]
				form.recheckor = target[4]
				form.recheckor_no = target[5]
				form.assesstime = target[6][:-10]
				form.batch = target[7]
				form.departmentno = target[8]
				form.deaprtment = target[9]
				form.assessor = target[10]
				form.assessor_no = target[11]
				Raw.sql = "select samplenumber, returnno, questionno from sklcc_recheck_content where serialno = '%s'" % form.serialno
				is_serialno_list = Raw.query_all( )
				totalnumber = 0
				totalreturn = 0
				for one in is_serialno_list:
					totalnumber += one[0]
					totalreturn += one[1]

				form.totalnumber = str( totalnumber )
				form.totalreturn = str( totalreturn )
				form.url = "/recheck_read_only_table?history#%s" % ( form.serialno )
				form0_list.append( form )
	json = []
	for one in form0_list:
		json.append( one.__dict__ )
	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_form_3( request ):
	start = request.GET['start']
	end   = request.GET['end']
	# #TODO:
	# string          = request.GET['employeeno']
	# employeeno_list = string.split( '>' )

	employee_list   = get_all_inspector( )
	employeeno_list = []
	for t in employee_list:
		employeeno_list.append( t.employeeno )

	distance               = get_time_distance_list( start, end )
	distance_have_year     = change_distance_date_to_str_have_year( distance )
	distance_not_have_year = change_distance_date_to_str_not_have_year( distance )

	info = []
	for employeeno in employeeno_list:
		temp = Total_strong_one_person( )
		temp.employeeno = employeeno
		temp.employee = find_em_name( employeeno )
		for date in distance_have_year:
			temp.count_list.append( get_employee_total_strong_question_count_day( employeeno, date ) )
		temp.count_list = change_to_row( temp.count_list )
		info.append( temp.__dict__ )

	question = Total_strong( )
	questionname = question.questionname
	json = []
	json.append( questionname )
	json.append( distance_not_have_year )
	json.append( info )

	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_form_4( request ):
	reload( sys )
	sys.setdefaultencoding( 'utf-8' )
	Raw          = Raw_sql( )

	start = '2014-07-01'
	end   = '2014-08-31'
	employee_list = []

	# table_info
	distance               = get_time_distance_list( start, end )
	distance_not_have_year = change_distance_date_to_str_not_have_year( distance )
	distance_have_year     = change_distance_date_to_str_have_year( distance )
	distance_not_have_year.insert( 0, '合计' )
	distance_not_have_year.insert( 0, '姓名' )
	distance_not_have_year.insert( 0, '工号' )

	Raw.sql                    = "SELECT employee, employeeno FROM sklcc_employee"
	target_list                = Raw.query_all( )
	employee_stage_repair_list = []
	length = len( distance_not_have_year )
	if target_list != False:
		for target in target_list:
			employee_stage_repair            = Employee_stage_repair( )
			employee_stage_repair.employee   = target[0]
			employee_stage_repair.employeeno = target[1]
			for date in distance_have_year:
				totalreturn = 0
				Raw.sql = "select sum( totalreturn ) from sklcc_record where left( createtime, 10 ) = '%s' and inspector_no = '%s'" % (
				date, target[1] )
				totalreturn = Raw.query_one( )[0]
				if totalreturn == None:
					totalreturn = 0

				employee_stage_repair.dayreturn.append( totalreturn )
			totalnumber = 0
			for one in employee_stage_repair.dayreturn:
				totalnumber += one
			employee_stage_repair.totalnumber = str( totalnumber )
			employee_stage_repair_list.append( employee_stage_repair.__dict__ )

	json = []
	json.append( distance_not_have_year )
	json.append( employee_stage_repair_list )
	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_form_5( request ):
	form5_list = []

	start = request.GET['start']
	end   = request.GET['end']
	Raw   = Raw_sql( )

	distance_list = get_time_distance_list( start, end )
	for date in distance_list:
		Raw.sql = "select totalnumber, sum( returnno ), recheckor, recheckor_no from sklcc_recheck_bald where left( createtime, 10 ) = '%s' group by recheckor_no, totalnumber, recheckor" % date
		target_list = Raw.query_all( )

		if target_list != False:
			for target in target_list:
				bald = Bald_info( )
				bald.createtime   = str( date )
				bald.totalnumber  = target[0]
				bald.returnno     = target[1]
				bald.recheckor    = target[2]
				bald.recheckor_no = target[3]
				bald.info         = get_question_info( date, bald.recheckor_no )
				form5_list.append( bald.__dict__ )

	json = []
	json.append( form5_list )

	response = HttpResponse( simplejson.dumps( json, ensure_ascii = False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_form_6( request ):
	reload( sys )
	sys.setdefaultencoding( 'utf-8' )
	Raw      = Raw_sql()
	Raw.sql  = "select TOP 1 form6_money_standard from sklcc_config"
	target   = Raw.query_one()
	standard = target[0]

	start = request.GET['start']
	end   = request.GET['end']
	time_list = get_time_distance_list( start, end )
	Raw.sql = '''
    select inspector_no,inspector, questionname,questionno,sum(returnno) from sklcc_info join sklcc_record on sklcc_info.serialno = sklcc_record.serialno
    where questionno !=0 and left(createtime,10) <= '%s' and left(createtime,10) >= '%s'
    group by inspector_no,inspector,questionno,questionname ''' % (end, start)
	res           = []
	check_qc      = []
	check_miss_qc = []
	Rawres        = Raw.query_all( )
	if not Rawres == False:
		for temp in Rawres:
			if get_question_type( temp[3] ) == 2:
				append_to_form6_res( temp[0], temp[1], temp[2], temp[3], temp[4], res, '1' )
				exist = False
				for temp_qc in check_qc:
					if temp_qc['no'] == temp[3]:
						exist = True
				if not exist:
					check_qc.append( { 'no': temp[3], 'name': temp[2] } )
			else:
				append_to_form6_res( temp[0], temp[1], u'其他', 99, temp[4], res, '1' )
				exist = False
				for temp_qc in check_qc:
					if temp_qc['no'] == 99:
						exist = True
				if not exist:
					check_qc.append( { 'no': 99, 'name': u'其他' } )
	Raw.sql = '''select inspector_no,inspector, questionname,questionno,sum(returnno)
    from sklcc_recheck_content join sklcc_recheck_info
    on  sklcc_recheck_content.serialno = sklcc_recheck_info.serialno
    where questionno != 0 and left(sklcc_recheck_info.createtime,10) <= '%s' and left(sklcc_recheck_info.createtime,10) >= '%s'
    group by inspector_no,inspector,questionno,questionname''' % (end, start)
	# print Raw.sql
	Rawres = Raw.query_all( )
	if Rawres != False:
		for temp in Rawres:
			if get_question_type( temp[3] ) == 2:
				exist = False
				for temp_qc in check_miss_qc:
					if temp_qc['no'] == temp[3]:
						exist = True
				if not exist:
					check_miss_qc.append( { 'no': temp[3], 'name': temp[2] } )
				append_to_form6_res( temp[0], temp[1], temp[2], temp[3], temp[4], res, '2' )
			else:
				append_to_form6_res( temp[0], temp[1], u'其他', 99, temp[4], res, '2' )
				exist = False
				for temp_qc in check_miss_qc:
					if temp_qc['no'] == 99:
						exist = True
				if not exist:
					check_miss_qc.append( { 'no': 99, 'name': u'其他' } )

	for record in res:  # 疵点对齐
		for check_qc_temp in check_qc:
			exist = False
			for record_temp in record.check:
				if record_temp['no'] == check_qc_temp['no']:
					exist = True
			if not exist:
				append_to_form6_res( record.no, record.name, check_qc_temp['name'], check_qc_temp['no'], 0, res, '1' )
		for check_qc_temp in check_miss_qc:
			exist = False
			for record_temp in record.check_miss:
				if record_temp['no'] == check_qc_temp['no']:
					exist = True
			if not exist:
				append_to_form6_res( record.no, record.name, check_qc_temp['name'], check_qc_temp['no'], 0, res, '2' )
	check_qc.sort( key = lambda x: x['no'] )
	check_miss_qc.sort( key = lambda x: x['no'] )
	for temp in res:
		temp.check.sort( key = lambda x: x['no'] )
		temp.check_miss.sort( key = lambda x: x['no'] )
	check_length = len( check_qc )
	check_miss_length = len( check_miss_qc )
	total_length = check_length + check_miss_length + 10
	# #计算漏验率##
	Raw.sql = '''select sum(samplenumber),inspector_no from
                 (select distinct(contentid),inspector_no,samplenumber from sklcc_recheck_info join sklcc_recheck_content
                  on sklcc_recheck_info.serialno = sklcc_recheck_content.serialno
                  where left(sklcc_recheck_info.createtime,10) >= '%s' and left(sklcc_recheck_info.createtime,10)<='%s'
                  ) a
                  group by (inspector_no)''' % (start, end)
	if Raw.query_all( ) != False:
		for temp in Raw.query_all( ):
			for i in res:
				if i.no == temp[1]:
					i.recheck_miss_percentage = round( float( i.check_miss_count ) * 100 / float( temp[0] ), 2 )
	for temp in res:
		temp.type = get_employee_type( temp.no )

	json = []
	json.append({ 'standard': standard, 'total_length': total_length, 'check_length': check_length, 'check_miss_length': check_miss_length })
	json.append( check_qc )
	res_json = []
	for one in res:
		res_json.append( one.__dict__ )
	json.append( res_json )
	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False )  )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_form_7( request ):

	#start = request.GET['date'].replace( '/', '-' )
	#end   = request.GET['date'].replace( '/', '-' )

	start = request.GET['start']
	end   = request.GET['end']
	time_list = get_time_distance_list( start, end )
	Raw = Raw_sql( )
	Raw.sql = '''
    select recheckor_no,recheckor,total,temp_count.batch,slowtime,slowprice from
    (select recheckor_no,recheckor,batch,sum(samplenumber) total from
    (select  distinct(contentid),recheckor_no,recheckor,batch,samplenumber from sklcc_recheck_info join sklcc_recheck_content
    on sklcc_recheck_info.serialno = sklcc_recheck_content.serialno
    and left(sklcc_recheck_info.createtime,10)>='%s' and left(sklcc_recheck_info.createtime,10)<='%s') x
    group by recheckor_no,recheckor,batch) temp_count,
    (select batch,slowtime,slowprice from [BDDMS_MSZ].[dbo].ProduceMaster,[BDDMS_MSZ].[dbo].ProduceStyle
    where [BDDMS_MSZ].[dbo].ProduceStyle.producemasterid = [BDDMS_MSZ].[dbo].ProduceMaster.producemasterid and workname = ''' % (
	start, end) + "'检验'".decode( 'utf-8' ) + ''') temp_price
    where temp_count.batch = temp_price.batch
    order by recheckor_no,temp_count.batch
    '''
	res = []
	#print Raw.sql
	if Raw.query_all( ) != False:
		for temp in Raw.query_all( ):
			append_ro_form_7_res( temp[0], temp[1], temp[3], temp[2], temp[5], temp[4], res )
	Raw.sql = '''
    select a.recheckor_no,a.recheckor,sum(totalnumber) from
    (select distinct(left(createtime,10)) timex, recheckor_no,recheckor,totalnumber
    from sklcc_recheck_bald
    where left(createtime,10)>='%s' and left(createtime,10)<='%s') a
    group by recheckor_no,recheckor

    ''' % (start, end)
	if Raw.query_all( ) != False:
		#bald_price = get_bald_price( )
		bald_slowtime = get_bald_slowtime( )
		for temp in Raw.query_all( ):
			append_ro_form_7_res( temp[0], temp[1], u'肩带', temp[2], 22, bald_slowtime, res )

	for temp in res:
		temp.real_time = get_real_work_time(temp.no,start)
		temp.real_time = 27000 if temp.real_time == 0 else temp.real_time
		temp.efficent = round(temp.total_time*100/temp.real_time,2)

	json = []
	for one in res:
		json.append( one.__dict__ )

	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False )  )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_form_8( request   ):
	reload(sys)
	sys.setdefaultencoding('utf-8')
	Raw = Raw_sql( )

	#start = request.GET['start'].replace( '/', '-' )
	#end   = request.GET['end'].replace( '/', '-' )
	employee_list = []

	# table_info
	start = '2014-07-01'
	end   = '2014-09-30'
	distance = get_time_distance_list( start, end )
	distance_not_have_year = change_distance_date_to_str_not_have_year( distance )
	distance_have_year = change_distance_date_to_str_have_year( distance )
	distance_not_have_year.insert( 0, '合计' )
	distance_not_have_year.insert( 0, '姓名' )
	distance_not_have_year.insert( 0, '工号' )

	Raw.sql = "SELECT employee, employeeno FROM sklcc_employee"
	target_list = Raw.query_all( )
	employee_stage_repair_list = []
	length = len( distance_not_have_year )
	if target_list != False:
		for target in target_list:
			employee_stage_repair            = Employee_stage_repair( )
			employee_stage_repair.employee   = target[0]
			employee_stage_repair.employeeno = target[1]
			for date in distance_have_year:
				totalreturn = 0
				Raw.sql = "select sum( totalnumber ) from sklcc_record where left( createtime, 10 ) = '%s' and inspector_no = '%s'" % (
				date, target[1] )
				totalreturn = Raw.query_one( )[0]
				if totalreturn == None:
					totalreturn = 0

				employee_stage_repair.dayreturn.append( totalreturn )
			totalnumber = 0
			for one in employee_stage_repair.dayreturn:
				totalnumber += one
			employee_stage_repair.totalnumber = str( totalnumber )
			employee_stage_repair_list.append( employee_stage_repair )

	json = []
	temp = []
	json.append( distance_not_have_year )
	for one in employee_stage_repair_list:
		temp.append( one.__dict__ )
	json.append( temp )
	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_form_9( request ):
	username = '0000'
	#username = request.session['username']
	Raw = Raw_sql( )

	start = request.GET['start'].replace( '/', '-' )
	end = request.GET['end'].replace( '/', '-' )
	start = '2014-07-01'
	end   = '2014-09-30'
	employee_list = []

	# table_info
	distance = get_time_distance_list( start, end )
	distance_not_have_year = change_distance_date_to_str_not_have_year( distance )
	distance_have_year = change_distance_date_to_str_have_year( distance )
	departmentno_list = find_department_authority_user( username, 17 )
	Raw = Raw_sql( )
	target_list = []
	return_check_list = []
	for departmentno in departmentno_list:
		Raw.sql = "select distinct a.serialno, inspector_no, inspector, check_id, check_type, real_return, ok, totalreturn, b.batch, " \
		          " a.assesstime from sklcc_return_check a join sklcc_record b on a.serialno = b.serialno where left( a.assesstime, 10 ) " \
		          ">= '%s' and left( a.assesstime, 10 ) <= '%s' and departmentno = '%s' and a.state = 1" % (
		          start, end, departmentno )
		t_target = Raw.query_all( )
		if t_target != False:
			target_list += t_target

	if target_list != False:
		for target in target_list:
			temp             = Return_check_info( )
			temp.serialno    = target[0]
			temp.employeeno  = target[1]
			temp.employee    = target[2]
			temp.check_type  = target[4]
			temp.realreturn  = target[5]
			temp.ok          = target[6]
			temp.totalreturn = target[7]
			temp.batch       = target[8]
			temp.state       = 1
			temp.createtime  = target[9][0:16]
			Raw.sql = "select questionname, questionno, returnno from sklcc_return_check where serialno = '%s'" % \
			          target[0]
			QC_list = Raw.query_all( )

			for QC in QC_list:
				t = { }
				if QC[0] == None:
					pass
				else:
					t['name']  = QC[0]
					t['no']    = QC[1]
					t['count'] = QC[2]
					temp.question_list.append( t )
			return_check_list.append( temp )

	target_list = []
	for departmentno in departmentno_list:
		Raw.sql  = "select distinct a.serialno, recheckor_no, recheckor, real_return, ok, b.batch, a.assesstime from " \
		          "sklcc_return_check a join sklcc_recheck_info b on a.serialno = b.serialno where left( a.assesstime, 10 ) " \
		          ">= '%s' and left( a.assesstime, 10 ) <= '%s' and departmentno = '%s' and a.state = 1" % (
		          start, end, departmentno )
		t_target = Raw.query_all( )
		if t_target != False:
			target_list += t_target

	if target_list != False:
		for target in target_list:
			temp = Return_check_info( )
			temp.serialno = target[0]
			temp.employeeno = target[1]
			temp.employee = target[2]
			temp.check_type = "抽验"
			temp.realreturn = target[3]
			temp.ok = target[4]
			temp.batch = target[5]
			temp.state = 1
			temp.createtime = target[6][0:16]
			Raw.sql = "select sum( returnno ) from sklcc_recheck_content where serialno = '%s'" % target[0]
			target = Raw.query_one( )
			temp.totalreturn = target[0] if target[0] != False or target[0] != None else 0
			Raw.sql = "select questionname, questionno, returnno from sklcc_return_check where serialno = '%s'" % temp.serialno
			QC_list = Raw.query_all( )

			for QC in QC_list:
				t = { }
				if QC[0] == None:
					pass
				else:
					t['name'] = QC[0]
					t['no'] = QC[1]
					t['count'] = QC[2]
					temp.question_list.append( t )
			return_check_list.append( temp )
	res = []
	for one in return_check_list:
		res.append( one.__dict__ )
	response =  HttpResponse( simplejson.dumps( res, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_form_10( request ):
	#em_number    = request.session['employeeno']
	#employeename = request.session['employee']
	#html         = get_template('table_efficency_reckeck.html')
	reload(sys)
	sys.setdefaultencoding( 'utf-8' )
	Raw = Raw_sql()
	date_list = []
	data_list = []
	columns   = 0
	if 'start' in request.GET:
		start = request.GET['start']
		end   = request.GET['end']
		distance = get_time_distance_list( start, end )
		date_list = change_distance_date_to_str_not_have_year( distance )
		date_list.insert( 0, '平均效率' )
		date_list.insert( 0, '姓名' )
		date_list.insert( 0, '工号' )
		columns = len( date_list )
		date_have_year_list = change_distance_date_to_str_have_year( distance )
		Raw.sql = "select distinct username from sklcc_employee_authority where authorityid = 1 and username not in( " \
		          "select distinct username from sklcc_employee_authority where authorityid = 7 )"
		recheckor_list = Raw.query_all()
		data_list = []
		if recheckor_list != False:
			for recheckor in recheckor_list:
				temp = []
				temp.append( find_employeeno( recheckor[0] ) )
				temp.append( find_em_name( temp[0] ) )
				sum = 0.0
				for date in date_have_year_list:
					decimal = get_employee_effciency( temp[0], date )
					sum += decimal
					temp.append( '%.2f%%'%decimal if decimal != 0 else '0' )
				temp.insert( 2, '%.2f%%'%( sum / len( date_have_year_list ) ) )
				data_list.append( temp )
	json = { 'date_list': date_list, 'data_list': data_list, 'columns': columns }

	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = "*"
	return response

def pad_form_11( request ):
	try:
		#em_number    = request.session['employeeno']
		#employeename = request.session['employee']
		reload(sys)
		sys.setdefaultencoding( 'utf-8' )
		json = []
		Raw = Raw_sql()
		if 'start' not in request.GET:
			response = HttpResponse()
			response['Access-Control-Allow-Origin'] = '*'
			return response
		start = request.GET['start']
		end   = request.GET['end']
		Raw.sql = "select distinct recheckor_no, recheckor from sklcc_recheck_info where left( createtime, 10 ) <= '%s' and " \
		          "left( createtime, 10 ) >= '%s'"%( end, start )
		distance  = get_time_distance_list( start, end )
		date_list = change_distance_date_to_str_have_year( distance )
		not_have_year_date_list = change_distance_date_to_str_not_have_year( distance )
		init_count_list = [0 for i in range( 0, len( date_list ) )]
		mistakes_list   = [ { 'name': question, 'res': deepcopy( init_count_list ) } for question in ALL_STRONG_QUESTION.questionname ]


		data = []
		target_list = Raw.query_all()
		if target_list != False:
			for target in target_list:
				temp = dict()
				temp['recheckor']    = target[1]
				temp['recheckor_no'] = target[0]
				temp['res']          = []
				Raw.sql = "select distinct inspector_no, inspector from sklcc_recheck_info where recheckor_no = '%s' and" \
				          " left( createtime, 10 ) <= '%s' and left( createtime, 10 ) >= '%s'"%( target[0], end, start )
				inspector_list = Raw.query_all()

				if inspector_list != False:
					for inspector in inspector_list:
						real_mistakes_list = deepcopy( mistakes_list )
						#temp['res'].append( { 'inspector': inspector[1], 'inspector_no': inspector[0], 'mistakes': deepcopy( mistakes_list ) } )
						for mistake in real_mistakes_list:

							Raw.sql = "select sum( returnno ), left( b.createtime, 10 ) from sklcc_recheck_info a join sklcc_recheck_content b" \
						          " on a.serialno = b.serialno where left( b.createtime, 10 ) <= '%s' and " \
						          "left( b.createtime, 10 ) >= '%s' and recheckor_no = '%s' and inspector_no = '%s'" \
						          " and b.questionname = '%s'" \
						          " group by left( b.createtime, 10 )"%( end, start, target[0],inspector[0], mistake['name'] )
							count_list = Raw.query_all()
							if count_list != False:
								for count in count_list:
									mistake['res'][( time_form( count[1] ) - time_form( start ) ).days] += count[0]
						temp['res'].append( {'inspector':inspector[1], 'mistakes': deepcopy( real_mistakes_list ), 'rows':ALL_STRONG_QUESTION.count} )
				temp['rows'] = len( temp['res'] ) * ALL_STRONG_QUESTION.count
				data.append(deepcopy( temp ))

			json = {'not_have_year_date_list':not_have_year_date_list, 'data':data}
			response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
			response['Access-Control-Allow-Origin'] = '*'
			return response
		else:
			response = HttpResponse()
			response['Access-Control-Allow-Origin'] = '*'
			return response
	except Exception,e:
		print e


def pad_form_12( request ):
	#em_number    = request.session['employeeno']
	#employeename = request.session['employee']
	reload(sys)
	sys.setdefaultencoding( 'utf-8' )
	json = []
	if 'start' in request.GET:
		start      = request.GET['start']
		end        = request.GET['end']
		batch_list = request.GET.getlist('batch')
		print batch_list
		Raw        = Raw_sql()

		res_list = []
		distance = get_time_distance_list( start, end )
		date_have_year_list = change_distance_date_to_str_have_year( distance )
		date_not_have_year  = change_distance_date_to_str_not_have_year( distance )
		for batch in batch_list:
			print batch
			data = [ { 'time': one, 'number':0, 'per':"0", 'batch':batch } for one in date_have_year_list ]

			Raw.sql = "select left( createtime, 10 ), sum( totalreturn ), sum( totalnumber ) from sklcc_record" \
			          " where batch = '%s' and left( createtime, 10 ) >= '%s' and left( createtime, 10 ) <= '%s'" \
			          " group by left( createtime, 10 )"%( batch, start, end )
			print Raw.sql
			target_list = Raw.query_all()

			if target_list != False:
				for one in target_list:
					for data_t in data:
						if one[0] == data_t['time']:
							data_t['per'] = str( float( one[1] / one[2] ) * 100 if one[2] != 0 else '0' ) + "%"
							data_t['number'] = one[2]
			res_list.append( deepcopy( data ) )

		json = { 'date_not_have_year':date_not_have_year, 'res_list':res_list }
	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_choose( request ):
	reload(sys)
	sys.setdefaultencoding('utf-8')
	username = '0000'
	record_have_committed_list = find_record_state_is( 1, username, 2, 0 )
	record_have_committed_list = find_record_state_is( 0, username, 2, 0 ) + record_have_committed_list
	json = []
	json.append( record_have_committed_list )

	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ).encode('utf-8') )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_choose_check( request ):
	reload(sys)
	sys.setdefaultencoding('utf-8')
	username = '0000'
	not_check_list = find_record_state_is( 0, username, 4, 1 )
	have_check_list = find_record_state_is( 1, username, 4, 0 )
	print not_check_list
	print have_check_list

	json    = []
	json.append( not_check_list )
	json.append( have_check_list )
	response =  HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_update_table( request ):
	Raw   = Raw_sql()
	state = int(request.GET['state'])
	serialno = request.GET['code']
	username = '0000'
	#username = request.session['username']
	Raw.sql = "select departmentno, totalnumber, createtime, batch, inspector," \
	          " inspector_no, check_type, totalreturn, serialno from sklcc_record where serialno = '%s'" \
	          " and state = %d" % ( serialno, state )

	target = Raw.query_one( )
	xml = """"""
	if target != False:
		record = dict( )
		record['departmentno'] = target[0]
		record['totalreturn'] = target[7]
		record['totalnumber'] = target[1]
		record['createtime'] = target[2]
		record['batch'] = target[3]
		record['inspector'] = target[4]
		record['inspector_no'] = target[5]
		record['check_type'] = target[6]
		record['serialno'] = target[8]
		xml = tables_xml( record )
	response = HttpResponse(xml)
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_choose_recheck( request ):
	username = "0000"
	record_have_committed_list  = find_recheck_info( 0, username, 3 )
	record_have_committed_list += find_recheck_info( 1, username, 3 )
	record_not_commit_list      = find_recheck_info( 2, username, 3 )
	have_commit_list = []
	not_commit_list  = []
	for one in record_have_committed_list:
		have_commit_list.append( one.__dict__ )
	for one in record_not_commit_list:
		not_commit_list.append( one.__dict__ )
	json = []
	json.append( have_commit_list )
	json.append( not_commit_list )
	response = HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_choose_recheck_check( request ):
	reload(sys)
	sys.setdefaultencoding('utf-8')
	username = '0000'
	record_not_commit_list     = find_recheck_info( 0, username, 5 )
	record_have_committed_list = find_recheck_info( 1, username, 5 )

	not_check_list = []
	for one in record_not_commit_list:
		not_check_list.append( one.__dict__ )

	have_check_list = []
	for one in record_have_committed_list:
		have_check_list.append( one.__dict__ )

	json    = []
	json.append(not_check_list )
	json.append( have_check_list )
	response =  HttpResponse( simplejson.dumps( json, ensure_ascii=False ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response

def pad_update_recheck_table( request ):
	serialno = request.GET['code']
	xml      = update_recheck_info_xml(serialno)
	response = HttpResponse( xml )
	response['Access-Control-Allow-Origin'] = '*'
	return response

if __name__ == '__main__':
	a = []
