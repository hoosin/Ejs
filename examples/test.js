

try{
	throw new Error("测试错误信息！");
}catch(e){
	E.error(e,'P0');
}

//http请求的时候
E.error({
	module:"cashier",//模块页面
	grade:'',
	info:'自定义错误信息!',//错误信息
	http:"http://www.vip.com/coulist?id=157827&m_id=6&status=0",
	code:200,//状态码
	msg:"请求成功的时候",//接口解释信息
	result:"{num: 0}"//返回的信息
});

