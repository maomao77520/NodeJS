var mongodb = require('./db');
function Blog(username,text,time){
   this.username = username;
   this.text = text;
   this.time = time ? format(new Date(time)) : format(new Date()) ;
}
module.exports = Blog;

function format(time){//时间格式化
  return time.getFullYear() + '-' + (time.getMonth()+1) + '-' + time.getDate() + ' ' + time.getHours() +':' + time.getMinutes() + ':' + time.getSeconds();
}
Blog.prototype.save = function save(callback){   //入库
    var blog = {
    	username : this.username,
    	text : this.text,
    	time :this.time
    };
    mongodb.open(function(err,db){
    	if(err){
    		return callback(err);
    	}
    	db.collection("blogs",function(err,collection){
    		if(err){
    			mongodb.close();
    			return callback(err);
    		}
    		collection.ensureIndex('username',function(err){//添加索引
          if(err){
            mongodb.close();
            return callback(err);
          }
    			
    		});
    		collection.insert(blog,{safe:true},function(err,blog){  //写入数据库
                mongodb.close();
                return callback(err,blog);
    		});
    	})
    })
}
Blog.get = function get(username,callback){  //读取
   mongodb.open(function(err,db){
   	   if(err){
   	   	   mongodb.close();
   	   	   return callback(err);
   	   }
   	   db.collection('blogs',function(err,collection){//读取集合
   	   	   if(err){
   	   	   	   mongodb.close();
   	   	   	   return callback(err);
   	   	   }
   	   	   var query = {}; 
   	   	   if(username){
   	   	   	   query.username = username;
   	   	   }
   	   	   collection.find(query).sort({time:-1}).toArray(function(err,docs){ //查找username的记录
   	   	   	   mongodb.close();
   	   	   	   if(err){
   	   	   	   	   return callback(err,null);
   	   	   	   }
   	   	   	   var blogs = [];   //封装Blog对象
   	   	   	   docs.forEach(function(doc,index){
   	   	   	   	   var blog = new Blog(doc.username,doc.text,doc.time);
   	   	   	   	   blogs.push(blog);
   	   	   	   });
               callback(null,blogs);
   	   	   });
   	   });
   });
}
