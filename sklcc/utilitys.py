__author__ = 'Administrator'
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.template.response import TemplateResponse
from django.template.loader import get_template
import datetime
import time
from django.db.transaction import connections
from django.db import transaction
import os, sys
from copy import deepcopy


class Current_time:
	time_str = ""

	def __init__( self ):
		self.time_str = unicode( datetime.datetime.now() )

	@classmethod
	def get_now_date(cls):
		date = unicode( datetime.datetime.now() ).split( ' ' )[0]
		return date

	@classmethod
	def get_now_time(cls):
		time_hour = unicode( datetime.datetime.now() ).split( ' ' )[1]
		return time_hour

	def get_date(self):
		date = self.time_str.split( ' ' )[0]
		return date

	def get_time(self):
		time_hour = self.time_str.split( ' ' )[1]
		return time_hour

	def set_date_yesterday(self):
		self.time_str = unicode( datetime.datetime.now() + datetime.timedelta( days = -1 ) )
		return self.time_str

class Raw_sql:
	sql  = ""

	def query_one( self, owner = 'default' ):
		cursor = connections[owner].cursor()
		cursor.execute( self.sql )
		target = cursor.fetchone( )
		#target -> list
		if len( target ) == 0:
			return False
		else:
			return target

	def query_all( self, owner = 'default' ):
		cursor = connections[owner].cursor( )
		cursor.execute( self.sql )
		target_list = cursor.fetchall( )
		if len( target_list ) == 0:
			return False
		else:
			return target_list

	def update( self, owner = 'default' ):
		try:
			cursor = connections[owner].cursor( )
			cursor.execute( self.sql )
			transaction.commit_unless_managed( owner )
		except Exception, e:
			return e
		else:
			return True

	def callproc(self, procname, parameter, owner = 'default' ):
		try:
			cursor = connections[owner].cursor()
			print dir( cursor )
			res    = cursor.callproc( procname, parameter )
			return res
		except Exception,e:
			print e
class Employee:
	employeeno   = ""
	employee     = ""
	username     = ""
	em_password  = ""

def find_employeeno( username ):
	Raw     = Raw_sql()
	Raw.sql = "select employeeno from sklcc_employee where username = '%s'"%username
	target  = Raw.query_one()
	return target[0] if target != False else None

def find_em_name( em_number ):
	Raw     = Raw_sql()
	Raw.sql = "select employee from sklcc_employee where employeeno = '%s'"%em_number
	target  = Raw.query_one()
	return target[0] if target != False else None

def find_department_authority_user( username, authorityid ):
	Raw     = Raw_sql()
	Raw.sql = "select departmentno from sklcc_employee_authority where username = '%s' and authorityid = %d order by departmentno"%( username, int( authorityid ) )
	target_list = Raw.query_all()

	departmentno = []
	if target_list != False:
		for target in target_list:
			departmentno.append( target[0] )
	return departmentno

def find_inspector_by_department_authority( departmentno, authorityid ):
	Raw     = Raw_sql()
	Raw.sql = "select distinct username from sklcc_employee_authority where departmentno = '%s' and authorityid = '%d'"%( departmentno, authorityid )
	target_list = Raw.query_all()
	user_list = []
	if target_list != False:
		for target in target_list:
			user_list.append( {'username':target[0],'employeeno':find_employeeno(target[0]), 'employee':find_em_name(find_employeeno(target[0]))})
	return user_list

def find_department_name( departmentno ):
	Raw = Raw_sql()
	Raw.sql = "select department from sklcc_department where departmentno = '%s'"%departmentno
	target  = Raw.query_one()
	return target[0]



#===========================================================
def get_all_employee():
	Raw           = Raw_sql()
	Raw.sql       = "select employee, employeeno from sklcc_employee"
	target_list   = Raw.query_all()
	employee_list = []
	if target_list != False:
		for target in target_list:
			temp            = Employee()
			temp.employee   = target[0]
			temp.employeeno = target[1]
			employee_list.append( temp )

	return employee_list

def get_all_inspector():
	Raw = Raw_sql()
	Raw.sql = "select distinct username from sklcc_employee_authority where authorityid = 0"
	target_list = Raw.query_all()
	inspector_list = []

	if target_list != False:
		for target in target_list:
			if target[0] == '0000':
				continue
			temp            = Employee()
			temp.employeeno = find_employeeno( target[0] )
			temp.employee   = find_em_name( temp.employeeno )
			inspector_list.append( deepcopy( temp ) )

	return inspector_list

def get_record_totalnumber( serialno ):
	Raw         = Raw_sql( )
	Raw.sql     = "select distinct barcode, number_pack from sklcc_info where serialno = '%s'" % serialno
	info_list   = Raw.query_all( )
	totalnumber = 0

	if info_list != False:
		for info_one in info_list:
			totalnumber += info_one[1]
	else:
		totalnumber += 0

	return totalnumber

def get_record_totalreturn( serialno ):
	Raw         = Raw_sql( )
	Raw.sql     = "select returnno from sklcc_table where serialno = '%s'" % serialno
	table_list  = Raw.query_all( )
	totalreturn = 0

	if table_list != False:
		for table in table_list:
			totalreturn += table[0]
	else:
		totalreturn += 0

	return totalreturn


def make_log( log_content ):
	T        = Current_time()
	log_time = T.time_str
	file     = open( "log.txt", 'a+' )
	log      = log_time + "\n" + log_content + "\n" + "=" * 20 + '\n'
	file.write( log )
	file.close()

def test( request ):

	return HttpResponse("%s\n%s"%(  Current_time.get_date(),Current_time.get_date() ))





