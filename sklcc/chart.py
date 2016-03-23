# -*- coding: utf-8 -*-
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.template.response import TemplateResponse
from django.template.loader import get_template
from sklcc.views import get_all_question, get_all_department, Current_time, find_department_name, find_questionname,\
	Raw_sql, get_measure_res, get_symmetry, get_common_difference
import sys
import random
import json
import copy
import time
import datetime

def bar_question_chart_data( questionno, departmentno_list, start, end ):
	res          = dict()
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

def get_question_return_date( questionno, start, end, departmentno, batch ):
	Raw     = Raw_sql()
	questionno = int( questionno )
	Raw.sql = "select sum( returnno ) from sklcc_table WITH(NOLOCK) where questionno = %d and serialno in ( select serialno from " \
	          "sklcc_record WITH(NOLOCK) where left( createtime, 10 ) >= '%s' and left( createtime, 10 ) <= '%s' " \
	          "and departmentno = '%s' " %( questionno, start, end, departmentno )
	if batch != "":
		Raw.sql += " AND BATCH = '%s' )"%batch
	else:
		Raw.sql += ")"
	target  = Raw.query_one()
	return target[0] if target[0] != False and target[0] != None else 0

def bar_measure_get_data(requests):
	dataList = list()
	res = list()
	for i in range(0,1000):
		dataList.append(int(time.mktime((datetime.datetime(year=random.randint(2013,2015),month=random.randint(1,12),day=random.randint(1,28),hour=random.randint(0,23),minute=random.randint(0,59))+datetime.timedelta(hours=8)).timetuple()))*1000)
	dataList = list(set(dataList))
	for one in dataList:
		res.append( [one,float("%.1f"%(float(24 + random.randint(-1,1))+random.random())) ])
		#dataList.append([int(time.mktime(datetime.datetime(year=2014,month=9,day=7).utctimetuple()))*1000,float("%.1f"%(float(24 + random.randint(-1,1))+random.random()))])
	res.sort(key=lambda x:x[0])

	return HttpResponse(json.dumps( res, ensure_ascii=False ))

def bar_measure_get_batch_by_departmentno(request):
	departmentno = request.GET["department_no"]
	start        = request.GET["start"]
	end          = request.GET["end"]
	batch        = request.GET["batch"] if "batch" in request.GET else ""
	table        = "SKLCC_RECORD" if "isPieChart" in request.GET else "SKLCC_MEASURE_RECORD"
	Raw          = Raw_sql()
	if departmentno != "":
		Raw.sql      = "SELECT DISTINCT(batch) FROM %s WITH(NOLOCK) WHERE" \
	               " departmentno='%s' AND left(createtime,10) <= '%s' AND left(createtime,10) >= '%s' AND batch LIKE '%s%%%%'"%(table, departmentno, end, start, batch)
	else:
		Raw.sql      = "SELECT DISTINCT(batch) FROM %s WITH(NOLOCK) WHERE" \
	               " left(createtime,10) <= '%s' AND left(createtime,10) >= '%s' AND batch LIKE '%s%%%%'"%(table, end, start, batch)
	batch_List   = Raw.query_all()
	if not batch_List:
		batch_List = []
	return HttpResponse( json.dumps([batch[0] for batch in batch_List], ensure_ascii=False) )

def get_styleno_blur(request):
	styleno = request.GET["styleno"]
	Raw     = Raw_sql()
	Raw.sql = "SELECT DISTINCT styleno FROM sklcc_measure_record WHERE styleno LIKE '%s%%%%'"%styleno
	stylenoList = Raw.query_all()
	if not stylenoList:
		stylenoList = []
	return HttpResponse( json.dumps([styleno[0] for styleno in stylenoList], ensure_ascii=False) )


def get_size_partition_by_styleno_or_batch(request):
	Raw = Raw_sql()
	if request.GET.has_key("batch"):
		batch = request.GET["batch"]
		Raw.sql = "SELECT DISTINCT size FROM sklcc_measure_record WHERE batch = '%s'"%batch
		sizeList = Raw.query_all()
		Raw.sql = "SELECT DISTINCT a.partition FROM sklcc_measure_info a JOIN sklcc_measure_record b" \
		          " ON a.serialno = b.serialno WHERE batch = '%s'"%batch
		partitionList = Raw.query_all()
	else:
		styleno = request.GET["styleno"]
		Raw.sql = "SELECT DISTINCT size FROM sklcc_measure_record WHERE styleno = '%s'" %styleno
		sizeList = Raw.query_all()
		Raw.sql = "SELECT DISTINCT a.partition FROM sklcc_measure_info a JOIN sklcc_measure_record b" \
		          " ON a.serialno = b.serialno WHERE b.styleno = '%s'" %styleno
		partitionList = Raw.query_all()

	if not sizeList:
		sizeList = []
	else:
		sizeList = [sizeitem[0] for sizeitem in sizeList]

	if not partitionList:
		partitionList = []
	else:
		partitionList = [partition[0] for partition in partitionList]

	return HttpResponse(json.dumps({"size_list":sizeList,"partition_list":partitionList},ensure_ascii=False))

def transformTimeToTimeStamp(string):
	string = string.split(".")[0]
	return int(time.mktime((datetime.datetime.strptime( string, '%Y-%m-%d %H:%M:%S' )+datetime.timedelta(hours=8)).timetuple()))*1000

def get_partition_list_by_styleno_or_batch(request):
	start = request.GET["start"]
	end   = request.GET["end"]
	size  = request.GET["size"]
	partition = request.GET["partition"]
	res = {"low":0.0,"med":0.0,"hig":0.0,"has2":0,"data":[]}
	Raw   = Raw_sql()
	styleno = ""
	if request.GET.has_key("batch"):
		batch = request.GET["batch"]
		Raw.sql = "SELECT partition, measure_res, measure_type, symmetry1, symmetry2, b.createtime, a.styleno FROM SKLCC_MEASURE_RECORD " \
		          "a JOIN SKLCC_MEASURE_INFO b" \
		          " ON a.serialno = b.serialno" \
		          " WHERE a.batch = '%s' AND a.size = '%s' AND b.partition = '%s' AND a.createtime <= '%s' AND a.createtime >= '%s'" \
		          " ORDER BY createtime" %(batch, size, partition, end, start)
	else:
		styleno = request.GET["styleno"]
		Raw.sql = "SELECT partition, measure_res, measure_type, symmetry1, symmetry2, b.createtime, a.styleno  FROM SKLCC_MEASURE_RECORD a" \
		          " JOIN SKLCC_MEASURE_INFO b ON a.serialno = b.serialno" \
		          " WHERE a.styleno = '%s' AND a.size = '%s' AND b.partition = '%s' AND a.createtime <= '%s' AND a.createtime >= '%s'" \
		          " ORDER BY createtime" %(styleno, size, partition, end, start)
	partitionData = Raw.query_all()
	if not partitionData:
		partitionData = []
	for itemData in partitionData:
		styleno = itemData[6]
		res["has2"]=itemData[2]
		res["data"].append([transformTimeToTimeStamp(itemData[5]),itemData[1]] if itemData[2] == 0 else [transformTimeToTimeStamp(itemData[5]),itemData[3],itemData[4]] )

	addNo = 1
	spot = 0
	for i in range(1,len(res["data"])):
		if res["data"][i][0] == res["data"][spot][0]:
			res["data"][i][0] += addNo
			addNo += 1
		else:
			spot  = i
			addNo = 1


	Raw.sql     = "SELECT common_difference, measure_res FROM sklcc_style_measure" \
	              "  WHERE styleno = '%s' AND size = '%s' AND partition = '%s'"%( styleno, size,partition)
	target = Raw.query_one()
	if target is not False:
		res["low"]=float(target[1]-float(target[0].split('@')[1]))
		res["hig"]=float(target[1]+float(target[0].split('@')[0]))
		res["med"]=float(target[1])

	return HttpResponse(json.dumps(res,ensure_ascii=False))



def bar_measure_chart( request ):
	reload(sys)
	sys.setdefaultencoding('utf-8')
	if 21 not in request.session['status']:
		return HttpResponseRedirect( '/warning/' )
	em_number    = request.session['employeeno']
	employeename = request.session['employee']
	html = get_template('bar_measure_chart.html')
	department_list = get_all_department()
	return TemplateResponse( request, html, locals() )


def pie_chart( request ):
	if 18 not in request.session['status']:
		return HttpResponseRedirect('/warning/')
	department_list = get_all_department()
	question_list   = get_all_question()
	em_number       = request.session['employeeno']
	employeename    = request.session['employee']
	batch           = request.GET['batch'] if 'batch' in request.GET else ""
	weak_list       = []
	bad_list        = []
	strong_list     = []
	start = request.GET['start'] if 'start' in request.GET else ""
	end   = request.GET['end'] if 'end' in request.GET else ""
	if 'departmentno' in request.GET:
		departmentno = request.GET['departmentno']
		for department in department_list:
			if departmentno == department.departmentno:
				department.ischosen = 1
		departmentname = find_department_name( departmentno )
		start = request.GET['start']
		end   = request.GET['end']
		for question in question_list:
			numberTemp = get_question_return_date( question.questionno, start, end, departmentno, batch )
			if question.questiontype == 0:
				if numberTemp != 0:
					weak_list.append( {'name': question.questionname, 'no': numberTemp } )
			elif question.questiontype == 1:
				if numberTemp != 0:
					bad_list.append( {'name': question.questionname, 'no': numberTemp } )
			elif question.questiontype == 2:
				if numberTemp != 0:
					strong_list.append( {'name': question.questionname, 'no': numberTemp } )
	if batch == "" or batch == "ALL":
		selectedBatch = {'name':u'所有批次', 'value':'ALL'}
	else:
		selectedBatch = {'name':batch, 'value':batch}
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