# -*- coding: utf-8 -*-
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.template.response import TemplateResponse
from django.template.loader import get_template
from sklcc.views import get_all_question, get_all_department, Current_time, find_department_name, find_questionname,\
	Raw_sql, get_measure_res, get_symmetry, get_common_difference
import sys
import random
import os
import copy

def bar_question_chart_data( questionno, departmentno_list, start, end ):
	res          = {}
	value_list   = []
	res['name']  = find_questionname(questionno).decode('gbk') if questionno != 0 else '疵点总数'
	res['value'] = []
	for departmentno in departmentno_list:
		res['value'].append( get_question_department_no( questionno, departmentno, start, end ) )
	return res

def get_question_department_no( questionno, departmentno, start, end ):
	Raw         = Raw_sql()
	if questionno == 0:
		Raw.sql = "select sum( totalreturn ) from sklcc_record where departmentno = '%s' and left( createtime, 10 ) >=" \
		          " '%s' and left( createtime, 10 ) <= '%s'" %( departmentno, start, end )
	else:
		Raw.sql     = "select sum( returnno ) from sklcc_table a join sklcc_record b on a.serialno = b.serialno where " \
	                  "left( createtime, 10 ) >= '%s' and left( createtime, 10 ) <= '%s' and questionno = %d and departmentno = '%s'"\
	                  %( start, end, questionno, departmentno )

	target      = Raw.query_one()
	totalnumber = target[0] if target != False or target[0] != None else 0
	return totalnumber

def bar_question_chart( request ):
	if 18 not in request.session['status']:
		return HttpResponseRedirect('/warning/')
	em_number           = request.session['employeeno']
	employeename        = request.session['employee']
	html                = get_template( 'bar_question_chart.html' )
	res                 = []
	departmentname_list = []
	questionno_list     = []
	departmentno_list   = []
	if 'question' in request.GET:
		start               = request.GET['start']
		end                 = request.GET['end']
		departmentno_list   = request.GET.getlist( 'department' )
		if request.GET['question'] == 'all':
			questionno = 0
			res.append( bar_question_chart_data( questionno, departmentno_list, start, end  ) )
		else:
			questionno_list     = request.GET.getlist('question')

			for questionno in questionno_list:
				res.append( bar_question_chart_data( int( questionno ), departmentno_list, start, end ) )
		departmentname_list = []
		for temp in departmentno_list:
			departmentname_list.append( temp )
	question_list = get_all_question()
	question_weak   = []
	question_bad    = []
	question_strong = []

	for one in question_list:
		if str( one.questionno ) in questionno_list:
			one.ischosen = 1
		if one.questiontype == 0:
			question_weak.append( one )
		elif one.questiontype == 1:
			question_bad.append( one )
		elif one.questiontype == 2:
			question_strong.append( one )
	department_list = get_all_department()

	for one in department_list:
		if one.departmentno in departmentno_list:
			one.ischosen = 1

	if 'start' in request.GET:
		start = request.GET['start']
		end   = request.GET['end']
	else:
		T               = Current_time()
		today           = T.get_date()

	return TemplateResponse(request, html, locals())

def get_question_return_date( questionno, start, end, departmentno ):
	Raw     = Raw_sql()
	questionno = int( questionno )
	Raw.sql = "select sum( returnno ) from sklcc_table where questionno = %d and serialno in ( select serialno from " \
	          "sklcc_record where left( createtime, 10 ) >= '%s' and left( createtime, 10 ) <= '%s' " \
	          "and departmentno = '%s' )" %( questionno, start, end, departmentno )
	target  = Raw.query_one()
	return target[0] if target[0] != False and target[0] != None else 0

def bar_measure_chart( request ):
	reload(sys)
	sys.setdefaultencoding('utf-8')
	if 21 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )
	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	html = get_template('bar_measure_chart.html')
	Raw  = Raw_sql()
	#TODO:time_distance,页面显示中文乱码
	Raw.sql = "select distinct batch from sklcc_measure_record"
	target_list = Raw.query_all()
	batch_list = [ target[0] for target in target_list ] if target_list != False else []
	if 'batch' not in request.GET:
		return TemplateResponse( request, html, locals() )

	batch = request.GET['batch']

	Raw.sql     = "select partition, symmetry1, symmetry2, measure_res, a.styleno, a.size from " \
	              "sklcc_measure_record a join sklcc_measure_info b on a.serialno = b.serialno" \
	              " where batch = '%s' order by partition"%batch
	target_list = Raw.query_all()
	res = []
	#data_left position:
	#data_right position:
	#1:over negative tolerance
	#2:negative tolerance
	#3:right equal
	#4:positive tolerance
	#5:over positive tolerance
	partition_list = []
	if target_list != False:
		for target in target_list:
			partition  = target[0]
			if partition not in partition_list:
				partition_list.append( partition )
				res.append( { 'partition': partition, 'data_left':[0,0], 'data_right':[0,0,0,0,0] } )
			else:
				index = partition_list.index( partition )



			for one in target[1:4]:
				if one != None:
					sub = one - get_measure_res( target[4], target[0] )
					if sub < 0 and abs( sub ) > get_common_difference( target[4], target[0] ):
						temp['data_right'][0] += 1
					elif sub < 0 and abs( sub ) <= get_common_difference( target[4], target[0] ):
						temp['data_right'][1] += 1
					elif sub == 0:
						temp['data_right'][2] += 1
					elif sub > 0 and abs( sub ) <= get_common_difference( target[4], target[1] ):
						temp['data_right'][3] += 1
					elif sub > 0 and abs( sub ) > get_common_difference( target[4], target[1] ):
						temp['data_right'][4] += 1
			if target[0] != None and target[1] != None:
				if abs( target[1] - target[2] ) <= get_symmetry( target[4], target[0] ):
					temp['data_left'][0] += 1
				else:
					temp['data_left'][1] += 1
			if partition not in [ t['partition'] for t in res ]:
				res.append( copy.deepcopy( temp ) )
	for one in res:
		if one['data_left'][0] == 0 and one['data_left'][1] == 0:
			one['data_left'] = None
	#return HttpResponse(res)
	return TemplateResponse( request, html, locals() )


def pie_chart( request ):
	if 18 not in request.session['status']:
		return HttpResponseRedirect('/warning/')
	department_list = get_all_department()
	question_list   = get_all_question()
	em_number       = request.session['employeeno']
	employeename    = request.session['employee']
	weak_list       = []
	bad_list        = []
	strong_list     = []
	if 'departmentno' in request.GET:
		departmentno = request.GET['departmentno']
		for department in department_list:
			if departmentno == department.departmentno:
				department.ischosen = 1
		departmentname = find_department_name( departmentno )
		start = request.GET['start']
		end   = request.GET['end']
		for question in question_list:
			if question.questiontype == 0:
				if get_question_return_date( question.questionno, start, end, departmentno ) != 0:
					weak_list.append( {'name': question.questionname, 'no': get_question_return_date( question.questionno, start, end, departmentno ) } )
			elif question.questiontype == 1:
				if get_question_return_date( question.questionno, start, end, departmentno ) != 0:
					bad_list.append( {'name': question.questionname, 'no': get_question_return_date( question.questionno, start, end, departmentno ) } )
			elif question.questiontype == 2:
				if get_question_return_date( question.questionno, start, end, departmentno ) != 0:
					strong_list.append( {'name': question.questionname, 'no': get_question_return_date( question.questionno, start, end, departmentno ) } )
	html = get_template( 'pie_chart.html' )
	return TemplateResponse( request, html, locals() )

def dark_cave_login( request ):
	html = get_template( 'dark_cave_login.html' )
	return TemplateResponse( request, html, locals() )

def hole_login( request ):
	reload(sys)
	sys.setdefaultencoding('utf-8')
	name    = request.GET['name']
	command = request.GET['command']
	if name == "":
		if command == 'xuweitao':
			request.session['command'] = command
			return HttpResponseRedirect('/dark_cave/')
	else:
		return HttpResponse('<center><h1><font color="red">输入三次错误将启动摧毁系统程序</font></h1></center>'.encode('utf-8'))


def dark_cave( request ):
	html  = get_template( 'dark_cave.html' )
	return TemplateResponse( request, html, locals() )

def dosomething( request ):
	pass