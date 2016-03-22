# -*- coding: utf-8 -*-
__author__ = 'Administrator'


from django.db.transaction import connections
from django.db import transaction




class Raw_sql:
	"""
	创建Django与数据库的短连接，通过给sql传递原始sql语句,query_one来返回单条记录，query_all返回所有查询结果的记录
	如果查询不到返回False，若对数据库执行删除，插入或者更新操作，需要在传入SQL之后，调用update函数
	每个方法都可以指定一个参数owner，这个参数对应于settings.py中数据库配置名，如owner='default'，则将SQL执行于default数据库
	"""
	sql  = ""

	@classmethod
	def query_one( self, owner = 'default' ):
		cursor = connections[owner].cursor()
		cursor.execute( self.sql )
		target = cursor.fetchone( )
		#target -> list
		if len( target ) == 0:
			return False
		else:
			return target

	@classmethod
	def query_all( self, owner = 'default' ):
		cursor = connections[owner].cursor( )
		cursor.execute( self.sql )
		target_list = cursor.fetchall( )
		if len( target_list ) == 0:
			return False
		else:
			return target_list

	@classmethod
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
			res    = cursor.callproc( procname, parameter )
			return res
		except Exception,e:
			return e