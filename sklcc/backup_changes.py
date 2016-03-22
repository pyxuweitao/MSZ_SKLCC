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

def query_backup_record( request ):

	html         = get_template( 'query_backup_record.html' )
	Raw          = Raw_sql( )
	employeename = request.session['employee']
	em_number    = request.session['employeeno']
	if 'start' not in request.GET or 'batch' not in request.GET or 'end' not in request.GET:
		url = '/query_backup_record/'
		return TemplateResponse( request, html, locals( ) )
	start = request.GET['start'].replace( '/', '-' )
	end   = request.GET['end'].replace( '/', '-' )
	batch = request.GET['batch']
	Raw   = Raw_sql( )
	##TODO: 根据start,end,batch进行筛选，SQL语句中的where条件
	Raw.sql = "SELECT [serialno]" \
	          ",[createtime]" \
	          ",[inspector]" \
	          ",[inspector_no]" \
	          ",[state]" \
	          ",[assessor]" \
	          ",[assessor_no]" \
	          ",[assesstime]" \
	          ",[totalnumber]" \
	          ",[departmentno]" \
	          ",[batch]" \
	          ",[totalreturn]" \
	          ",[check_id]" \
	          ",[check_type]" \
	          ",[action_type]" \
	          ",[action_time]" \
	          "FROM [SKLCC].[dbo].[sklcc_record_changes]" \
	          "where left(createtime,10) >= '%s' and left(createtime,10) <= '%s'and batch like '%%%%%s%%%%'"%(start,end,batch)
	res = Raw.query_all( )
	keys = []
	ress = {}
	if not res:
		return TemplateResponse( request, html, locals( ) )
	for temp in res:
		keys.append(temp[0])
	ress=dict.fromkeys(keys, 2)
	for temp in res:
		if ress[temp[0]] == 2:
			ress[temp[0]] = []
		ress[temp[0]].append({
		"createtime":temp[1],
		"inspector":temp[2],
		"inspector_no":temp[3],
		"state":temp[4],
		"assessor":temp[5],
		"assessor_no":temp[6],
		"assesstime":temp[7],
		"totalnumber":temp[8],
		"departmentno":temp[9],
		"batch":temp[10],
		"totalreturn":temp[11],
		"check_id":temp[12],
		"check_type":temp[13],
		"action_type":temp[14],
		"action_time":temp[15],
		})
	#print ress
	return TemplateResponse( request, html, locals( ) )
