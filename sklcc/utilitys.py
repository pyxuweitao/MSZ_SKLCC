__author__ = 'Administrator'
#*-* coding:utf-8 *-*

import datetime
from django.db.transaction import connections
from django.db import transaction
from copy import deepcopy
# import requests
# import thread
# import time

class Current_time:
	time_str = ""

	def __init__( self ):
		self.time_str = unicode( datetime.datetime.now() )

	@classmethod
	def get_accurate_time(cls):
		return unicode( datetime.datetime.now() )

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

def time_form( string ):
	year = int( string.split( '-' )[0] )
	month = int( string.split( '-' )[1] )
	day = int( string.split( '-' )[2] )
	time = datetime.datetime( year, month, day )
	return time

def get_time_distance_list( start, end ):
	distance = list( )
	start = time_form( start )
	end = time_form( end )
	distance.append( start.date( ) )
	for i in range( (end - start).days ):
		start = start + datetime.timedelta( days = 1 )
		distance.append( start.date( ) )
	#distance.append( end.date() )
	return distance

def change_distance_date_to_str_have_year( distance ):
	distance_new = []
	for one in distance:
		distance_new.append( str( one )[0:10] )
	return distance_new


def change_distance_date_to_str_not_have_year( distance ):
	distance_new = []
	for one in distance:
		distance_new.append( str( one )[5:10] )
	return distance_new

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
	"""
	根据用户名和权限id获取对应的所有组别的组别号的列表
	:param username:用户名
	:param authorityid:权限的id
	:return:返回username所拥有的权限authorityid对应的所有组别号列表
	"""
	Raw     = Raw_sql()
	Raw.sql = "select DISTINCT departmentno from sklcc_employee_authority where username = '%s' and authorityid = %d order by departmentno"%( username, int( authorityid ) )
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
	Raw.sql = "select distinct department from sklcc_department where departmentno = '%s'"%departmentno
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
	Raw.sql = "select distinct username from sklcc_employee_authority where authorityid = 0" \
	          " except select distinct username from sklcc_employee_authority where authorityid = 22"
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
	file     = open( "E:\\log.txt", 'a+' )
	log      = unicode(log_time) + u"\n" + unicode(log_content) + u"\n" + u"=" * 20 + u'\n'
	file.write( log.encode('utf-8') )
	file.close()


def get_styleno_by_batch( batch ):
	"""
	根据批次号获取款号
	:param batch: 批次号
	:return:款号，查询不到返回字符串NULL
	"""
	Raw = Raw_sql()
	Raw.sql = u"SELECT TOP 1 styleno FROM producemaster WHERE batch = '%s' and Formstate='审核'"%batch

	styleno = Raw.query_one('MSZ')[0]
	if styleno != False:
		return styleno
	else:
		return "NULL"

	
def get_all_barcode_by_serialno( serialno ):
	Raw = Raw_sql()
	Raw.sql = "SELECT distinct barcode FROM sklcc_info WHERE serialno = '%s' ORDER BY barcode"%serialno
	target_list = Raw.query_all()
	if target_list != False:
		return [ barcode[0] for barcode in target_list ]
	else:
		return []
#
# def get_lock():
# 	lock = thread.allocate_lock()
# 	lock.acquire()
# 	return lock
#
# ####################
# #for tests
# def test_request( url, para, lock ):
# 	requests.post(url[0], params = para )
# 	requests.get(url[1])
# 	requests.get(url[1])
# 	lock.release()
#
# if __name__=="__main__":
# 	locks = []
# 	para  = {"username":"0000","password":"0000"}
# 	url   = ["http://192.168.135.45:2333/submit_id", "http://192.168.135.45:2333/login"]
#
# 	for i in range(400):
# 		locks.append( get_lock() )
#
# 	for i in range(400):
# 		thread.start_new_thread( test_request,(  url, para, locks[i] ) )
#
# 	for i in range(400):
# 		while locks[i].locked(): pass
#
# 	print "all done!"



def test(request):
	return