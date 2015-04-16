__author__ = 'Administrator'
# -*- coding: utf-8 -*-
from django.core.servers.basehttp import FileWrapper
from django.http import HttpResponse, HttpResponseRedirect
from django.template.response import TemplateResponse
from django.template.loader import get_template
from django.db import connection, transaction
from sklcc.views import Bald_info, change_distance_date_to_str_have_year, change_distance_date_to_str_not_have_year, \
	Current_time, find_department_name, find_table_with_serialno, Record_info, get_question_type, time_form, \
	get_time_distance_list, find_em_name, get_all_employee, find_pre_table, find_sec_table, History_form, \
	find_department_authority_user, Return_check_info, find_employeeno
import datetime
import time
import sys, os
from django.utils import simplejson
import urllib
import urllib2
from utilitys import *

class Inspector_quality:
	employeeno = ""
	employee = ""
	totalnumber = ""


class Quality_check:
	def __init__( self ):
		self.employeeno = ""
		self.employee = ""
		self.totalnumber = 0
		self.slowtime = 0.0


class Total_strong:
	def __init__( self ):
		self.questionname = []
		self.questionno   = []
		self.count        = 0
		Raw               = Raw_sql( )
		Raw.sql           = "SELECT distinct QuestionNO, QuestionCode FROM QCQuestion WHERE isStrong = 'True' ORDER BY QuestionNO, QuestionCode"
		target_list       = Raw.query_all( 'MSZ' )

		if target_list != False:
			for target in target_list:
				self.questionname.append( target[1].decode( 'gbk' ) )
				self.questionno.append( target[0] )
				self.count += 1


class Total_strong_one_person:
	def __init__( self ):
		self.employeeno = ""
		self.employee = ""
		self.count_list = []


class Employee_stage_repair:
	def __init__( self ):
		self.dayreturn = []
		self.employeeno = ""
		self.employee = ""
		self.totalnumber = ""


class Percentage_row:
	def __init__( self, no, name, batch ):
		self.no = no
		self.name = name
		self.batch = batch
		self.slowtime = 0
		self.totalnumber = 0
		self.time = 0.0
		self.avg_percentage = 0.0
		self.data = []


	def append( self, data, time, count ):
		self.data.append( { 'data': data, 'time': time } )
		self.totalnumber += count


class table_form6_row( ):
	def __init__( self, inspector_no, name ):
		self.no = inspector_no
		self.name = name
		self.check = []
		self.check_miss = []
		self.check_count = 0
		self.check_miss_count = 0
		self.recheck_miss_percentage = 0
		self.type = ''

	def append_to_check( self, no, name, count ):
		exist = False
		for temp in self.check:
			if temp['no'] == no:
				exist = True
				temp['count'] += count
		if not exist:
			self.check.append( { 'no': no, 'name': name, 'count': count } )
		self.check_count += count

	def append_to_check_miss( self, no, name, count ):
		exist = False
		for temp in self.check_miss:
			if temp['no'] == no:
				exist = True
				temp['count'] += count
		if not exist:
			self.check_miss.append( { 'no': no, 'name': name, 'count': count } )
		self.check_miss_count += count


def get_employee_type( employeeno ):
	Raw = Raw_sql( )
	Raw.sql = "select typeno from sklcc_employeeno_type where employeeno = '%s'" % employeeno
	target = Raw.query_one( )
	if target != False:
		return target[0]
	else:
		return False


def insert_into_res( no, name, batch, data, time, count, res ):
	exist = False
	for temp in res:
		if temp.no == no and temp.batch == batch:
			exist = True
			temp.append( data, time, count )
			break
	if not exist:
		row = Percentage_row( no, name, batch )
		row.append( data, time, count )
		res.append( row )


def get_check_slowtime( batch ):
	Raw = Raw_sql( )
	Raw.sql = "select ProduceMasterID from ProduceMaster where Batch = '%s'" % batch
	target = Raw.query_one( 'MSZ' )

	if target == False:
		return 0.0
	else:
		ProduceMasterID = target[0]
		Raw.sql = "select SlowTime from ProduceStyle where produceMasterID = '%s' and qcbz = 1" % ProduceMasterID
		SlowTime = Raw.query_one( 'MSZ' )
		if SlowTime == False:
			return 0.0
		else:
			return SlowTime[0]


def get_bald_price( ):
	Raw = Raw_sql( )
	Raw.sql = "SELECT bald_price FROM sklcc_config"
	target = Raw.query_one( )

	if target != False:
		return target[0]
	else:
		return 0


def get_bald_slowtime( ):
	Raw = Raw_sql( )

	Raw.sql = "SELECT bald_slowtime FROM sklcc_config"
	target = Raw.query_one( )

	if target != False:
		return target[0]
	else:
		return 0


ALL_STRONG_QUESTION = Total_strong()
# form0
def form_have_submitted( request ):
	if 15 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )

	form0_list   = []
	html         = get_template( 'table_haven_submitted.html' )
	Raw          = Raw_sql( )
	employeename = request.session['employee']
	em_number    = request.session['employeeno']
	if 'start' not in request.GET:
		url = '/form0/'
		return TemplateResponse( request, html, locals( ) )

	start = request.GET['start'].replace( '/', '-' )
	end   = request.GET['end'].replace( '/', '-' )

	dep_list = find_department_authority_user( request.session['username'], 15, )
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
	return TemplateResponse( request, html, locals( ) )


def update_table_history( request ):
	serialno = request.GET['code']
	Raw = Raw_sql( )
	Raw.sql = "select departmentno, totalnumber, createtime, batch, inspector, inspector_no, serialno from sklcc_record where serialno = '%s'" % serialno
	target = Raw.query_one( )
	record = Record_info( )
	xml = """"""
	if target != False:
		record.departmentno = target[0]
		record.totalnumber = target[1]
		record.createtime = target[2]
		record.batch = target[3]
		record.inspector = target[4]
		record.inspector_no = target[5]
		record.serialno = target[6]
		xml = update_table_history_xml( record )
	return HttpResponse( xml )


def update_recheck_table_history( request ):
	serialno = request.GET['code']
	Raw = Raw_sql( )
	xml = """"""

	Raw.sql = "select distinct contentid from sklcc_recheck_content where serialno = '%s'" % serialno

	target_list = Raw.query_all( )

	id_list = list( )
	for target in target_list:
		id_list.append( target[0] )

	Raw.sql = "select department, inspector, batch, createtime from sklcc_recheck_info where serialno = '%s'" % serialno

	target = Raw.query_all( )[0]
	department = target[0]
	inspector = target[1]
	batch = target[2]
	date = target[3]

	xml += """<xml>"""
	xml += """<group>"""
	xml += department
	xml += """</group>"""
	xml += """<inspector>"""
	xml += inspector
	xml += """</inspector>"""
	xml += """<no>"""
	xml += batch
	xml += """</no>"""
	xml += """<date>"""
	xml += date
	xml += """</date>"""
	for id in id_list:
		Raw.sql = "select distinct workno, workname, totalnumber, samplenumber, ok from sklcc_recheck_content where contentid = '%s'" % id
		workno_list = Raw.query_all( )
		if workno_list[0][4] == True:
			xml += """<record id = '%s' total = '%d' sample = '%d' state = '1'>""" % (
			id, workno_list[0][2], workno_list[0][3] )
		else:
			xml += """<record id = '%s' total = '%d' sample = '%d' state = '0'>""" % (
			id, workno_list[0][2], workno_list[0][3] )
		for workno in workno_list:
			xml += """<program name='%s' no='%s'>""" % ( workno[1], workno[0] )
			Raw.sql = "select questionno, questionname, returnno from sklcc_recheck_content where contentid = '%s' and workno = %d" % (
			id, workno[0] )
			target_list = Raw.query_all( )
			for target in target_list:
				if get_question_type( target[0] ) == None:
					xml += """<mistake0 name='%s' no='%d' count='%d'/>""" % (  target[1], target[0], target[2] )
				else:
					xml += """<mistake%d name='%s' no='%d' count='%d'/>""" % (
					get_question_type( target[0] ), target[1], target[0], target[2] )
			xml += """</program>"""
		xml += """</record>"""
	xml += """</xml>"""
	return HttpResponse( xml )


def update_table_history_xml( record ):
	xml = """<xml>"""
	xml += """<info>"""
	xml += """<group>%s</group>""" % record.departmentno
	xml += """<count>%d</count>""" % record.totalnumber
	xml += """<date>%s</date>""" % record.createtime.split( '.' )[0]
	xml += """<no>%s</no>""" % record.batch
	xml += """<inspector>%s</inspector>""" % record.inspector
	xml += """<inspector_no>%s</inspector_no>""" % record.inspector_no
	xml += """</info>"""

	xml += """<RC>"""
	xml_weak = """"""
	xml_bad = """"""
	xml_strong = """"""

	RC_list = find_table_with_serialno( record.serialno )
	for RC in RC_list:
		if RC[10] == 0:
			xml_weak += """<record0 name = '%s' no = '%d' employee_name = '%s' employee_no = '%s' count = '%d' program_no = '%d' program_name = '%s' />""" % (
			RC[9], RC[8], RC[4], RC[3], RC[7], RC[6], RC[5] )
		elif RC[10] == 1:
			xml_bad += """<record1 name = '%s' no = '%d' employee_name = '%s' employee_no = '%s' count = '%d' program_no = '%d' program_name = '%s' />""" % (
			RC[9], RC[8], RC[4], RC[3], RC[7], RC[6], RC[5] )
		else:
			xml_strong += """<record2 name = '%s' no = '%d' employee_name = '%s' employee_no = '%s' count = '%d' program_no = '%d' program_name = '%s' />""" % (
			RC[9], RC[8], RC[4], RC[3], RC[7], RC[6], RC[5] )

	xml += xml_weak
	xml += xml_bad
	xml += xml_strong
	xml += """</RC>"""
	xml += """</xml>"""

	return xml


# form1
def quality_check( request ):
	if 10 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )

	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	Raw  = Raw_sql( )
	html = get_template( 'table_quality_check.html' )
	if 'start' not in request.GET:
		employee_list      = []
		quality_check_list = []
		price_permin       = 0
		return TemplateResponse( request, html, locals( ) )

	start = request.GET['start']
	end   = request.GET['end']

	Raw.sql = "SELECT DISTINCT username FROM sklcc_employee_authority WHERE authorityid = 0"
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
		Raw.sql = "SELECT sum( totalreturn ), batch FROM sklcc_record where left( createtime, 10 ) <= '%s' and left( createtime, 10 ) >= '%s' and inspector_no = '%s' group by batch" % (
		end, start, employeeno )
		total_list = Raw.query_all( )
		temp = Quality_check( )
		temp.employeeno = employeeno
		temp.employee = find_em_name( employeeno )
		if total_list != False:
			for total in total_list:
				if total[0] == None:
					continue
				else:
					temp.slowtime += get_check_slowtime( total[1] ) * total[0]
					temp.totalnumber += total[0]
		quality_check_list.append( temp )

	Raw.sql = "SELECT TOP 1 price_permin FROM sklcc_config"
	target = Raw.query_one( )
	if target != False:
		price_permin = target[0]

	return TemplateResponse( request, html, locals( ) )


# form2
def return_check_percentage( request ):
	if 11 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )

	html         = get_template( 'table_inspector_percentage.html' )
	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	Raw          = Raw_sql()
	Raw.sql      = "select distinct type_name from sklcc_form11_config"
	type         = Raw.query_all()
	type_list    = []
	if type_list != False:
		type_list    = [ unicode( one[0] ).encode( 'utf-8' ) for one in type ]

	if 'start' not in request.GET:
		time_list = []
		span = 0
		header = []
		res = []
		return TemplateResponse( request, html, locals( ) )

	start = request.GET['start'].replace( '/', '-' )
	end = request.GET['end'].replace( '/', '-' )
	time_list = get_time_distance_list( start, end )

	Raw = Raw_sql( )
	res = []
	Raw.sql = '''
        select left(createtime,10) timex,inspector_no,inspector,sum(totalnumber),sum(totalreturn),batch
        from sklcc_record
        where left(createtime,10)>='%s' and left(createtime,10)<='%s'
        group by left(createtime,10),inspector_no,inspector,batch
    ''' % (start, end)
	if Raw.query_all(  ) != False:
		for temp_record in Raw.query_all( ):
			insert_into_res( temp_record[1], temp_record[2], temp_record[5],
			                 round( float( temp_record[4] ) * 100 / float( temp_record[3] ), 2 ) if float( temp_record[3] ) != 0 else 0, temp_record[0],
			                 int( temp_record[3] ), res )
	for temp in res:
		temp.slowtime = get_check_slowtime( temp.batch )
		for temp_date in time_list:
			exist = False
			for temp_time in temp.data:
				if temp_time['time'] == str( temp_date ):
					exist = True
			if not exist:
				temp.append( 0, str( temp_date ), 0 )
	for temp in res:  # 每行的日期排序
		temp.data.sort( key = lambda x: x['time'] )
		count = 0
		lisp = 0
		for value in temp.data:
			if not (value['data']) <= 1e-7:
				count += value['data']
				lisp += 1
			else:
				value['data'] = ''
		temp.data.append( { 'data': round( float( count / lisp if lisp != 0 else 0 ), 2 ) } )
	header = []
	if len( res ) > 0:
		for temp in res[0].data[:-1]:
			header.append( temp['time'][5:] )
	span = len( header ) + 6
	return TemplateResponse( request, html, locals( ) )

def form2_config( request ):
	try:
		Raw = Raw_sql()
		type = request.GET['type']
		Raw.sql = "select type_name, left_range, left_border, right_range, right_border, standard, multiple, return_limit from " \
		          "sklcc_form11_config where type_name = '%s'"%type
		target = Raw.query_all()
		data   = {}
		if target != False:
			data['name'] = type
			data['max_return'] = target[0][7]
			data['res'] = []
			for one in target:
				data['res'].append( { 'left': one[1] if one[1] != None else 'ini', 'right': one[3] if one[3] != None else 'ini',
				                      'left_included': 'true' if one[2] else 'false', 'right_included': 'true' if one[4] else 'false',
				                      'base': one[5] * 100, 'Override': one[6] } )
			return HttpResponse( simplejson.dumps( data, ensure_ascii=False )  )
		else:
			return HttpResponse( 0 )
	except Exception,e:
		pass

def delete_type_name( request ):
	Raw  = Raw_sql()
	name = request.GET['name']
	Raw.sql = "delete from sklcc_form11_config where type_name = '%s'"%name
	Raw.update()
	return HttpResponse(1)

def form2_bonus( request ):
	try:
		reload(sys)
		sys.setdefaultencoding('utf-8')
		Raw   = Raw_sql()
		bonus = simplejson.loads( request.POST['bonus'] )
		for row in bonus:
			batch             = row['batch']
			return_percentage = float( row['percentage'] ) / 100
			try:
				Raw.sql = "select Number, type_name, left_range, left_border, right_range, right_border, standard, multiple," \
				          "return_limit from [BDDMS_MSZ].[dbo].producemaster a join [SKLCC].[dbo].sklcc_form11_config b on a.stylesort = b.type_name " \
				          "where a.batch = '%s' order by formdate desc"%batch
				methods = Raw.query_all()
				if methods != False:
					for one in methods:
						if one[2] != None:
							if one[3] == 1:
								if one[0] < one[2]:
									continue
							elif one[3] == 0:
								if one[0] <= one[2]:
									continue

						if one[4] != None:
							if one[5] == 1:
								if one[0] > one[4]:
									continue
							elif one[5] == 0:
								if one[0] >= one[4]:
									continue

						row['bonus'] = round( ( return_percentage - one[6] ) * one[7], 2 )
						break
			except Exception,e:
				pass
			else:
				Raw.sql = "select type_name, left_range, left_border, right_range, right_border, standard, multiple," \
			          "return_limit from [BDDMS_MSZ].[dbo].producemaster a, [SKLCC].[dbo].sklcc_form11_config b " \
			          "where a.batch = '%s' and b.type_name = '其他' order by formdate desc"%batch
				methods = Raw.query_all()
				if methods != False:
					for one in methods:
						if one[2] != None:
							if one[3] == 1:
								if one[0] < one[2]:
									continue
							elif one[3] == 0:
								if one[0] <= one[2]:
									continue

						if one[4] != None:
							if one[5] == 1:
								if one[0] > one[4]:
									continue
							elif one[5] == 0:
								if one[0] >= one[4]:
									continue
						row['bonus'] = round( ( return_percentage - one[6] ) * one[7], 2 )
						break
				else:
					row['bonus'] = 0
			row['bonus'] = 0 if row['bonus'] < 0 else row['bonus'] * 400
		return  HttpResponse( simplejson.dumps( bonus, ensure_ascii=False ) )
	except Exception,e:
		pass

def form2_change_config( request ):
	try:
		recv      = request.POST['json']
		res       = simplejson.loads( recv )
		type_name = res['name']

		Raw        = Raw_sql()
		Raw.sql    = "delete from sklcc_form11_config where type_name = '%s'"%type_name
		Raw.update()
		name       = res['name']
		max_return = float( res['max_return'] )
		for one in res['res']:
			Raw.sql = "insert into sklcc_form11_config( type_name, left_range, left_border, right_range, right_border, standard " \
			          ", multiple, return_limit ) values( '%s',"%name + str( int( one['left'] )  if one['left']  != 'ini' else 'NULL' ) + ',' +\
			          str( 1 if one['left_included']  == 'true' else 0 ) + ',' + str( int( one['right'] ) if one['right'] != 'ini' else 'NULL' )\
			          + ',' + str( 1 if one['right_included'] == 'true' else 0 ) + ", %f, %d, %f )" % ( float( one['base'] ) / 100, float( one['Override'] ), max_return )
			Raw.update()
		return HttpResponse( 1 )
	except Exception, e:
		pass

# form3
def get_employee_total_strong_question_count_day( employeeno, date ):
	Raw = Raw_sql( )
	Raw.sql = "select serialno from sklcc_record where left( createtime, 10 )= '%s' and inspector_no = '%s'" % (
	date, employeeno )
	target_list = Raw.query_all( )

	res = Total_strong()
	count_list = []
	for i in range( 0, res.count ):
		count_list.append( 0 )
	if target_list != False:
		for target in target_list:
			serialno = target[0]
			for i, questionno in enumerate( res.questionno ):
				Raw.sql = "select sum( returnno ) from sklcc_info where serialno = '%s' and questionno = %d" % (
				serialno, questionno )
				returnno = Raw.query_one( )
				count_list[i] += returnno[0] if returnno[0] != None else 0

	return count_list


def change_to_row( count_list ):
	res = []
	rows = len( count_list[0] )
	for i in range( 0, rows ):
		res.append( [] )

	for count in count_list:
		for i, no in enumerate( count ):
			res[i].append( no )
	return res


def total_strong_question( request ):
	if 12 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )

	html = get_template( 'table_total_is_strong.html' )
	em_number = request.session['employeeno']
	employeename = request.session['employee']
	if 'start' not in request.GET:
		distance_not_have_year = []
		info = []
		question = []
		return TemplateResponse( request, html, locals( ) )

	start = request.GET['start']
	end   = request.GET['end']
	# #TODO:
	# string          = request.GET['employeeno']
	# employeeno_list = string.split( '>' )

	employee_list = get_all_inspector()
	employeeno_list = []
	for t in employee_list:
		employeeno_list.append( t.employeeno )

	distance = get_time_distance_list( start, end )
	distance_have_year = change_distance_date_to_str_have_year( distance )
	distance_not_have_year = change_distance_date_to_str_not_have_year( distance )

	info = []
	for employeeno in employeeno_list:
		temp = Total_strong_one_person( )
		temp.employeeno = employeeno
		temp.employee = find_em_name( employeeno )
		for date in distance_have_year:
			temp.count_list.append( get_employee_total_strong_question_count_day( employeeno, date ) )
		temp.count_list = change_to_row( temp.count_list )
		info.append( temp )

	question = Total_strong( )

	return TemplateResponse( request, html, locals( ) )


# form4
def stage_repair( request ):
	if 8 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )

	em_number = request.session['employeeno']
	employeename = request.session['employee']
	Raw = Raw_sql( )
	html = get_template( 'table_stage_repair.html' )

	if 'start' not in request.GET:
		employee_list = []
		distance_not_have_year = []
		employee_stage_repair_list = []
		return TemplateResponse( request, html, locals( ) )

	start = request.GET['start'].replace( '/', '-' )
	end = request.GET['end'].replace( '/', '-' )
	employee_list = []

	# table_info
	distance = get_time_distance_list( start, end )
	distance_not_have_year = change_distance_date_to_str_not_have_year( distance )
	distance_have_year = change_distance_date_to_str_have_year( distance )
	distance_not_have_year.insert( 0, '合计' )
	distance_not_have_year.insert( 0, '姓名' )
	distance_not_have_year.insert( 0, '工号' )

	Raw.sql = '''SELECT DISTINCT a.employee, b.username FROM sklcc_employee a JOIN sklcc_employee_authority b
					ON a.username = b.username
					WHERE b.authorityid = 0 or b.authorityid = 1
				EXCEPT
				SELECT DISTINCT c.employee, d.username FROM sklcc_employee c JOIN sklcc_employee_authority d
					ON c.username = d.username
					WHERE d.authorityid = 7 OR d.authorityid = 22'''
	target_list = Raw.query_all()
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
			employee_stage_repair_list.append( employee_stage_repair )
	return TemplateResponse( request, html, locals( ) )


# form5
def get_question_info( date, recheckor_no ):
	Raw = Raw_sql( )
	Raw.sql = "select employeeno, employee, questionname, questionno, returnno from sklcc_recheck_bald where left( createtime, 10 ) = '%s' and recheckor_no = '%s'" % (
	date, recheckor_no )
	target_list = Raw.query_all( )
	res = {}

	if target_list != False:
		for target in target_list:
			if target[4] == 0:
				return res
			else:
				if target[0] in res:
					res[target[0]] += ',' + target[2] + 'X' + str( target[4] )
				else:
					res[target[0]] = ( '(' + target[0] + ')' + target[1] + ':' + target[2] + 'X' + str( target[4] )  )

	return res


def baldric_information( request ):
	if 9 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )

	employeeno = request.session['employeeno']
	username = request.session['username']
	em_number = request.session['employeeno']
	employeename = request.session['employee']
	form5_list = []
	html = get_template( 'table_bald_history.html' )
	if 'start' not in request.GET:
		return TemplateResponse( request, html, locals( ) )

	start = request.GET['start'].replace( '/', '-' )
	end = request.GET['end'].replace( '/', '-' )
	Raw = Raw_sql( )

	distance_list = get_time_distance_list( start, end )
	for date in distance_list:
		Raw.sql = "select totalnumber, sum( returnno ), recheckor, recheckor_no from sklcc_recheck_bald where left( createtime, 10 ) = '%s' group by recheckor_no, totalnumber, recheckor" % date
		target_list = Raw.query_all( )

		if target_list != False:
			for target in target_list:
				bald = Bald_info( )
				bald.createtime = str( date )
				bald.totalnumber = target[0]
				bald.returnno = target[1]
				bald.recheckor = target[2]
				bald.recheckor_no = target[3]
				bald.info = get_question_info( date, bald.recheckor_no )
				form5_list.append( bald )

	return TemplateResponse( request, html, locals( ) )


# form6
def append_to_form6_res( inspectorno, inpector, qcname, qcno, qccount, res, type ):
	exist = False

	for temp in res:
		if temp.no == inspectorno:
			exist = True
			tar = temp
			if type == '1':
				temp.append_to_check( qcno, qcname, qccount )
			else:
				temp.append_to_check_miss( qcno, qcname, qccount )
	if not exist:
		temp_row = table_form6_row( inspectorno, inpector )
		if type == '1':
			temp_row.append_to_check( qcno, qcname, qccount )
		else:
			temp_row.append_to_check_miss( qcno, qcname, qccount )
		res.append( temp_row )

def prize_punish( request ):
	if 13 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )
	html = get_template( 'table_check_miss.html' )
	em_number = request.session['employeeno']
	employeename = request.session['employee']
	Raw = Raw_sql( )
	Raw.sql = "SELECT TOP 1 form6_money_standard FROM sklcc_config"
	target = Raw.query_one( )
	standard = target[0]
	if 'start' not in request.GET:
		total_length = 0
		check_length = 0
		check_miss_length = 0
		check_qc = []
		res = []
		return TemplateResponse( request, html, locals( ) )

	start = request.GET['start'].replace( '/', '-' )
	end = request.GET['end'].replace( '/', '-' )
	time_list = get_time_distance_list( start, end )
	Raw.sql = '''
    select inspector_no,inspector, questionname,questionno,sum(returnno) from sklcc_info join sklcc_record on sklcc_info.serialno = sklcc_record.serialno
    where questionno !=0 and left(createtime,10) <= '%s' and left(createtime,10) >= '%s'
    group by inspector_no,inspector,questionno,questionname ''' % (end, start)
	res = []
	check_qc = [{'no':20,'name':u'反肩带,\n反商标,\n反钩袢'},{'no':99,'name':u'其他'},{'no':28,'name':u'混号'},{'no':27,'name':u'漏序'},{'no':33,'name':u'破洞'},{'no':32,'name':u'缺勾'},{'no':21,'name':u'上错商标'},{'no':29,'name':u'包'},{'no':55,'name':u'套灯模破洞'}]
	check_miss_qc = [{'no':20,'name':u'反肩带,\n反商标,\n反钩袢'},{'no':99,'name':u'其他'},{'no':28,'name':u'混号'},{'no':27,'name':u'漏序'},{'no':33,'name':u'破洞'},{'no':32,'name':u'缺勾'},{'no':21,'name':u'上错商标'},{'no':29,'name':u'包'},{'no':55,'name':u'套灯模破洞'}]
	h = ['']
	Rawres = Raw.query_all( )
	if not Rawres == False:
		for temp in Rawres:
			if temp[3] == 20 or temp[3] == 30 or temp[3] == 34:
				append_to_form6_res( temp[0], temp[1], u'反肩带,\n反商标,\n反钩袢', 20, temp[4], res, '1' )
				exist = False
				#for temp_qc in check_qc:
				#	if temp_qc['no'] == 20:
				#		exist = True
				#if not exist:
				#	check_qc.append( { 'no': 20, 'name': u'反肩带,\n反商标,\n反钩袢' } )

			if temp[3] in [28, 27, 33, 32, 21, 29, 55]:
				append_to_form6_res( temp[0], temp[1], temp[2], temp[3], temp[4], res, '1' )
				exist = False
				#for temp_qc in check_qc:
				#	if temp_qc['no'] == temp[3]:
				#		exist = True
				#if not exist:
				#	check_qc.append( { 'no': temp[3], 'name': temp[2] } )

			if temp[3] not in (20, 30, 34, 28, 27, 33, 32, 21, 29, 55) and get_question_type( temp[3] ) == 2:
				append_to_form6_res( temp[0], temp[1], u'其他', 99, temp[4], res, '1' )
				exist = False
				#for temp_qc in check_qc:
				#	if temp_qc['no'] == 99:
				#		exist = True
				#if not exist:
				#	check_qc.append( { 'no': 99, 'name': u'其他' } )

	Raw.sql = '''select inspector_no,inspector, questionname,questionno,sum(returnno)
    from sklcc_recheck_content join sklcc_recheck_info
    on  sklcc_recheck_content.serialno = sklcc_recheck_info.serialno
    where questionno != 0 and left(sklcc_recheck_info.createtime,10) <= '%s' and left(sklcc_recheck_info.createtime,10) >= '%s'
    group by inspector_no,inspector,questionno,questionname''' % (end, start)
	# print Raw.sql
	Rawres = Raw.query_all( )
	if Rawres != False:
		for temp in Rawres:
			if temp[3] == 20 or temp[3] == 30 or temp[3] == 34:
				append_to_form6_res( temp[0], temp[1], u'反肩带,\n反商标,\n反钩袢', 20, temp[4], res, '2' )
				exist = False
				#for temp_qc in check_miss_qc:
				#	if temp_qc['no'] == 20:
				#		exist = True
				#if not exist:
				#	check_miss_qc.append( { 'no': 20, 'name': u'反肩带,\n反商标,\n反钩袢' } )

			if temp[3] in [28, 27, 33, 32, 21, 29, 55]:
				append_to_form6_res( temp[0], temp[1], temp[2], temp[3], temp[4], res, '2' )
				exist = False
				#for temp_qc in check_miss_qc:
				#	if temp_qc['no'] == temp[3]:
				#		exist = True
				#if not exist:
				#	check_miss_qc.append( { 'no': temp[3], 'name': temp[2] } )

			if temp[3] not in (20, 30, 34, 28, 27, 33, 32, 21, 29, 55) and get_question_type( temp[3] ) == 2:
				append_to_form6_res( temp[0], temp[1], u'其他', 99, temp[4], res, '2' )
				exist = False
				#for temp_qc in check_miss_qc:
				#	if temp_qc['no'] == 99:
				#		exist = True
				#if not exist:
				#	check_miss_qc.append( { 'no': 99, 'name': u'其他' } )

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
					if temp[0] != 0:
						i.recheck_miss_percentage = round( float( i.check_miss_count ) * 100 / float( temp[0] ), 2 )
					else:
						i.recheck_miss_percentage = 0
	for temp in res:
		temp.type = get_employee_type( temp.no )

	return TemplateResponse( request, html, locals( ) )


# form7
def get_real_work_time( employeeno, date ):
	Raw     = Raw_sql()
	Raw.sql = "select real_work_time from sklcc_effciency where employeeno = '%s' and date = '%s'" %( employeeno, date )
	target  =  Raw.query_one()
	return target[0] if target != False and target != None else 0

def recheck_quality_check( request ):
	if 14 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )
	html         = get_template( 'table_recheck_status.html' )
	employeename = request.session['employee']
	em_number    = request.session['employeeno']
	if 'date' not in request.GET or request.GET['date'] == '':
		res = []
		return TemplateResponse( request, html, locals( ) )
	start = request.GET['date'].replace( '/', '-' )
	end   = request.GET['date'].replace( '/', '-' )

	time_list = get_time_distance_list( start, end )
	Raw       = Raw_sql( )
	Raw.sql = '''
    select distinct recheckor_no,recheckor,total,temp_count.batch,slowtime,slowprice from
    (select recheckor_no,recheckor,batch,sum(samplenumber) total from
    (select  distinct(contentid),recheckor_no,recheckor,batch,samplenumber from sklcc_recheck_info join sklcc_recheck_content
    on sklcc_recheck_info.serialno = sklcc_recheck_content.serialno
    and left(sklcc_recheck_info.createtime,10)>='%s' and left(sklcc_recheck_info.createtime,10)<='%s' and state = 1) x
    group by recheckor_no,recheckor,batch) temp_count,
    (select batch,slowtime,slowprice from [BDDMS_MSZ].[dbo].ProduceMaster INNER JOIN [BDDMS_MSZ].[dbo].ProduceStyle
    ON [BDDMS_MSZ].[dbo].ProduceStyle.producemasterid = [BDDMS_MSZ].[dbo].ProduceMaster.producemasterid WHERE qcbz = 1''' % (
	start, end ) + ''') temp_price
    where temp_count.batch = temp_price.batch
    order by recheckor_no,temp_count.batch
    '''
	res = []
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


	return TemplateResponse( request, html, locals( ) )

def update_recheck_efficent( request ):
	employee   = request.GET['name']
	employeeno = request.GET['no']
	real_time  = float( request.GET['real_time'] )
	effciency  = float( request.GET['efficent'] )
	date       = request.GET['date']
	Raw        = Raw_sql()
	Raw.sql    = "update sklcc_effciency set real_work_time = %f, effciency = %f where employeeno = '%s' and date = '%s'" %( real_time, effciency / 100, employeeno, date )
	Raw.update()
	return HttpResponse()

class form_7_row( ):
	def __init__( self, name, no ):
		self.name = name
		self.no = no
		self.res = []
		self.total_income = 0
		self.total_time = 0
		self.length = 1
		self.real_time = 0
		self.efficent = 0
		self.taodengmototal = 0

	def append( self, batch, count, price, time ):
		Raw = Raw_sql()
		Raw.sql = u"SELECT dbo.get_worktime_of_taodengmo( '%s', '套灯模' )"%batch
		worktime = Raw.query_one()[0]
		self.res.append(
			{ 'batch': batch, 'count': count, 'price': price, 'time': time, 'tincome': round( price * count, 2 ),
			  'ttime': round( count * time, 2 )+round( count * worktime, 2 ), 'taodengmo': round( worktime, 2 ) } )
		self.total_income += round( price * count, 2 )
		self.total_time += round( count * time, 2 )+round( count * worktime, 2 )
		self.length += 1
		self.taodengmototal += round( worktime, 2 )

	def get_batch(self):
		return [ one['batch'] for one in self.res ]

def append_ro_form_7_res( no, name, batch, count, price, time, res ):
	exist = False
	for temp in res:
		if temp.name == name:
			exist = True
			temp.append( batch, count, price, time )
	if not exist:
		temp = form_7_row( name, no )
		temp.append( batch, count, price, time )
		res.append( temp )


# form8
def factory_num( request ):
	if 16 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )

	em_number = request.session['employeeno']
	employeename = request.session['employee']
	Raw = Raw_sql( )
	html = get_template( 'table_factory_num.html' )

	if 'start' not in request.GET:
		employee_list = []
		distance_not_have_year = []
		employee_stage_repair_list = []
		return TemplateResponse( request, html, locals( ) )

	start = request.GET['start'].replace( '/', '-' )
	end   = request.GET['end'].replace( '/', '-' )
	employee_list = []

	# table_info
	distance = get_time_distance_list( start, end )
	distance_not_have_year = change_distance_date_to_str_not_have_year( distance )
	distance_have_year = change_distance_date_to_str_have_year( distance )
	distance_not_have_year.insert( 0, '合计' )
	distance_not_have_year.insert( 0, '姓名' )
	distance_not_have_year.insert( 0, '工号' )

	Raw.sql = """SELECT DISTINCT a.employee, a.employeeno FROM sklcc_employee a JOIN sklcc_employee_authority b
					ON a.username = b.username
					WHERE b.authorityid = 0 or b.authorityid = 1
				EXCEPT
				SELECT DISTINCT c.employee, d.username FROM sklcc_employee c JOIN sklcc_employee_authority d
					ON c.username = d.username
					WHERE d.authorityid = 7 OR d.authorityid = 22"""
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

	return TemplateResponse( request, html, locals( ) )


#form9
def form_return_check( request ):
	if 17 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )

	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	username     = request.session['username']
	Raw          = Raw_sql( )
	html         = get_template( 'daily_return_check.html' )

	if 'start' not in request.GET:
		employee_list              = []
		distance_not_have_year     = []
		employee_stage_repair_list = []
		return TemplateResponse( request, html, locals( ) )

	start         = request.GET['start'].replace( '/', '-' )
	end           = request.GET['end'].replace( '/', '-' )
	employee_list = []

	# table_info
	distance               = get_time_distance_list( start, end )
	distance_not_have_year = change_distance_date_to_str_not_have_year( distance )
	distance_have_year     = change_distance_date_to_str_have_year( distance )
	departmentno_list      = find_department_authority_user( username, 17 )
	target_list            = []
	return_check_list      = []
	for departmentno in departmentno_list:
		Raw.sql = "select distinct a.serialno, inspector_no, inspector, check_id, check_type, real_return, ok, totalreturn, b.batch, " \
		          " b.createtime, b.totalnumber from sklcc_return_check a join sklcc_record b on a.serialno = b.serialno where left( b.createtime, 10 ) " \
		          ">= '%s' and left( b.createtime, 10 ) <= '%s' and departmentno = '%s' and a.state = 1" % (
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
			temp.totalnumber = target[10]
			Raw.sql = "select questionname, questionno, returnno from sklcc_return_check where serialno = '%s'" % \
			          target[0]
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

	target_list = []
	for departmentno in departmentno_list:
		Raw.sql = "select distinct a.serialno, recheckor_no, recheckor, real_return, ok, b.batch, a.assesstime from " \
		          "sklcc_return_check a join sklcc_recheck_info b on a.serialno = b.serialno where left( a.assesstime, 10 ) " \
		          ">= '%s' and left( a.assesstime, 10 ) <= '%s' and departmentno = '%s' and a.state = 1" % (
		          start, end, departmentno )
		t_target = Raw.query_all( )
		if t_target != False:
			target_list += t_target

	if target_list != False:
		for target in target_list:
			temp            = Return_check_info( )
			temp.serialno   = target[0]
			temp.employeeno = target[1]
			temp.employee   = target[2]
			temp.check_type = "抽验"
			temp.realreturn = target[3]
			temp.ok         = target[4]
			temp.batch      = target[5]
			temp.state      = 1
			temp.createtime = target[6][0:16]
			Raw.sql         = "select sum( returnno ) from sklcc_recheck_content where serialno = '%s'" % target[0]
			target          = Raw.query_one( )
			temp.totalreturn = target[0] if target[0] != False or target[0] != None else 0
			Raw.sql         = "select questionname, questionno, returnno from sklcc_return_check where serialno = '%s'" % temp.serialno
			QC_list         = Raw.query_all( )

			for QC in QC_list:
				t = {}
				if QC[0] == None:
					pass
				else:
					t['name']  = QC[0]
					t['no']    = QC[1]
					t['count'] = QC[2]
					temp.question_list.append( t )
			return_check_list.append( temp )

	return TemplateResponse( request, html, locals( ) )


#form10
def get_employee_effciency( employeeno, date ):
	Raw = Raw_sql()
	Raw.sql = "select effciency from sklcc_effciency where employeeno = '%s' and date = '%s'"%( employeeno, date )
	target = Raw.query_one()

	return target[0] * 100 if target != False and target != None else 0


def effciency_recheck( request ):
	if 20 not in request.session['status']:
		return HttpResponseRedirect('/warning/')
	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	html         = get_template('table_efficency_reckeck.html')
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
				valid_days = 0
				for date in date_have_year_list:
					decimal = get_employee_effciency( temp[0], date )
					sum += decimal
					valid_days += 1 if decimal != 0 else 0
					temp.append( '%.2f%%'%decimal if decimal != 0 else '0' )
				if valid_days != 0:
					temp.insert( 2, '%.2f%%'%( sum / valid_days ) )
				else:
					temp.insert( 2, '0%' )
				data_list.append( temp )
	return TemplateResponse( request, html, locals() )

#form11
def recheckor_total_strong_problem( request ):
	try:
		html = get_template( 'table_recheck_res.html' )
		em_number    = request.session['employeeno']
		employeename = request.session['employee']
		Raw = Raw_sql()
		if 'start' not in request.GET:
			return TemplateResponse( request, html, locals() )
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

			return TemplateResponse( request, html, locals() )
		else:
			return TemplateResponse( request, html, locals() )
	except Exception,e:
		pass



#form12
def return_percentage_by_batch( request ):
	html         = get_template( 'table_pass_rate_batch.html' )
	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	if 'start' in request.GET:
		start      = request.GET['start']
		end        = request.GET['end']
		batch_list = request.GET.getlist('batch')
		Raw        = Raw_sql()

		res_list = []
		distance = get_time_distance_list( start, end )
		date_have_year_list = change_distance_date_to_str_have_year( distance )
		date_not_have_year  = change_distance_date_to_str_not_have_year( distance )
		for batch in batch_list:
			data = [ { 'time': one, 'number':0, 'per':"0", 'batch':batch } for one in date_have_year_list ]

			Raw.sql = "select left( createtime, 10 ), sum( totalreturn ), sum( totalnumber ) from sklcc_record" \
			          " where batch = '%s' and left( createtime, 10 ) >= '%s' and left( createtime, 10 ) <= '%s'" \
			          " group by left( createtime, 10 )"%( batch, start, end )
			target_list = Raw.query_all()

			if target_list != False:
				for one in target_list:
					for data_t in data:
						if one[0] == data_t['time']:
							data_t['per'] = str( float( one[1] / one[2] ) * 100 if one[2] != 0 else '0' ) + "%"
							data_t['number'] = one[2]
			res_list.append( deepcopy( data ) )

	return TemplateResponse( request, html, locals()  )

def flush_batch( request ):
	reload( sys )
	sys.setdefaultencoding( 'utf-8' )
	start = request.GET['start']
	end   = request.GET['end']

	Raw   = Raw_sql()
	Raw.sql = "select distinct batch from sklcc_recheck_info " \
	          "where left( createtime, 10 ) >= '%s' and left( createtime, 10 ) <= '%s'"%( start, end )
	batch_list = Raw.query_all()

	if batch_list != False:
		response = HttpResponse( simplejson.dumps( [ batch for batch in batch_list ] , ensure_ascii=False ) )
	else:
		response = HttpResponse( simplejson.dumps( [] ) )
	response['Access-Control-Allow-Origin'] = '*'
	return response


#form13
def table_measure_size_in( request ):
	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	Raw          = Raw_sql()
	html         = get_template( 'table_measure_size_in.html' )
	res          = []
	if 'start' not in request.GET:
		return TemplateResponse( request, html, locals() )
	else:
		res        = []
		start      = request.GET['start']
		end        = request.GET['end']
		Raw.sql = """select distinct styleno, size, left( createtime, 10 ), a.employeeno, b.employee  from sklcc_style_measure a JOIN sklcc_employee b
						ON a.employeeno = b.employeeno
						WHERE left( createtime, 10 ) >= '%s' and left( createtime, 10 ) <='%s'"""%(  start, end )

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
					temp['url']        = '/style_measure/?style=%s'%temp['styleno']
					temp['employeeno'] = target[3]
					temp['employee']   = target[4]
					temp['size']       = [target[1]]
					res.append( deepcopy( temp ) )

		return TemplateResponse( request, html, locals() )
