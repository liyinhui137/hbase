var 员工信息 = `



`



var 实习生信息 = `


                亿贝中国
   eBay China

实习生信息登记表

姓名      英文名     性别      民族  
出生日期        国籍/户口       婚否      学历  
外语程度        专业      在读院校    
有效证件号码      手机      email   
紧急联系人       关系      电话  
到岗日期        实习部门        预计毕业年月  
家庭住址及邮政编码（中英文）  
教育经历（时间段，学校，专业，学位名称）（中英文）   
招行银行卡帐号 111111111
开户支行名称  
支行交换号（非上海招行卡）   
有效证件复印件 交表格时请同时提交下列证件的复印件。

 身份证     学生证     其它请注明：

姓名：                                                                                填表日期：      年     月    日




`

var 员工合同 = `



`

if(员工信息.length > 实习生信息.length){
    var rawInfo = 员工信息;
    var isFTE = true;
} else {
    var rawInfo = 实习生信息;
    var isFTE = false;
}


var extractContract = function (contractStr){
    var cParts = contractStr.split(/\s+/);
    var idNo = cParts[1];
    cParts.reverse()
    var salary = cParts[3];
    var contractNo = cParts[0];
    return [idNo,salary,contractNo]
}

var extractAllContract = function (allStr) {
    var csStr = allStr.trim().split("\n");
    var allcObj = csStr.map(function(str){return extractContract(str)});
    var cMap = {};
    for(var i in allcObj){
        cMap[allcObj[i][0]] = allcObj[i];
    }
    return cMap;
}

var contracts =  员工合同;

var contractMap = extractAllContract(contracts)


var nl = '___NEW_LINE___'
rawInfo = rawInfo.replace(/\r|\n/g,nl)

var trimAll = function(str){
	return str.replace(/\s/g,'').replace(/___NEW_LINE___/g,'')
}

var twoByteFormat = function(n) {
	if((n+"").length > 1){
		return n + ""
	} else {
		return "0" + n
	}
}

var possibleDatePattern = [
	/\d{4}\s*年\d{1,2}\s*月\d{1,2}\s*日/,
	/\d{4}\s*年\d{1,2}\s*月/,
	/\d{4}\s*年/,
	/\d{4}/,
	/\d{4}[.-]\d{1,2}/,
	/\d{1,2}\/\d{1,2}\/\d{4}/,
	/\d{4}[.-]\d{1,2}[.-]\d{1,2}/
]

var standarDateFmt = function(dateStr) {
  try {
	if(dateStr.indexOf("年") > 0){
		var [year, month, day] = dateStr.split(/[年月日]/)
		var d = year
		if(month !=null && month.trim()!= ""){
			d += "-"+twoByteFormat(month)
			if(day !=null && day.trim()!= ""){
				d += "-"+ twoByteFormat(day)
			}else {
				d += "-30"
			}
		}
		return d
	}
	if(dateStr.trim().length==4){
		return dateStr.trim()+"-01-01"
	}
	if(dateStr.indexOf("/") > 0){
		var [year, month, day] = dateStr.split("/")
		return year+"-"+twoByteFormat(month)+"-"+twoByteFormat(day)
	}
	else if(dateStr.indexOf(".") > 0){
		var [year, month, day] = dateStr.split(".")
	}
	else if(dateStr.indexOf("-") > 0){
		var [year, month, day] = dateStr.split("-")
	}

	if(day == null)
		return year+"-"+twoByteFormat(month) + "-30"
	else
		return year+"-"+twoByteFormat(month)+"-"+twoByteFormat(day)
  }catch(err){
  	console.log(err)
  }
}

var extractExp = function(exp){
	try{
		for(p in possibleDatePattern) {
			var matchRes = exp.match(possibleDatePattern[p])
			if(matchRes != null){
				var startDate = matchRes[0]
				break
			}
		}
		if(startDate != null){
			exp = exp.replace(startDate,"")
			for(p in possibleDatePattern) {
				var matchRes = exp.match(possibleDatePattern[p])
				if(matchRes != null){
					var endDate = matchRes[0]
					break
				}
			}
		}

		if(endDate != null){
			var index = exp.indexOf(endDate)
			exp = exp.substr(index+endDate.length)

			var com = exp.match(/[\u4e00-\u9fa5\da-zA-Z./-]+/)

		}
		return [standarDateFmt(startDate), standarDateFmt(endDate),com[0], exp]
	} catch (err){
		console.log(err)
	}


}

var extractEdu =  function(str) {
	var partialEduInfo = extractExp(str)
	if(partialEduInfo.length >=3){
		var parInfo = partialEduInfo.slice(0,3)
	}
	var leftInfo = partialEduInfo[3]
	if(leftInfo != null && leftInfo.trim().length > 0){
		leftInfo = leftInfo.replace(parInfo[2],"")
	}
	if(leftInfo != null && leftInfo.trim().length > 0){
		var profession = leftInfo.match(/[\u4e00-\u9fa5\da-zA-Z./-]+/)
		if(profession != null){
			parInfo.push(profession[0])
		}
		leftInfo = leftInfo.replace(profession,"")
	}

	if(leftInfo != null && leftInfo.trim().length > 0){
		var degree = leftInfo.match(/[\u4e00-\u9fa5\da-zA-Z./-]+/)
		if(degree != null){
			parInfo.push(degree[0])
		}
	}
	return parInfo
}

if(isFTE){
    var matched = rawInfo.match(/.*?姓\s*名(.+?)性\s*别(.+)英文名(.+?)出生日期.*/)
    var name = trimAll(matched[1]), sex = trimAll(matched[2]) ,enName =  trimAll(matched[3])
} else {
    var matched = rawInfo.match(/.*?姓\s*名(.+?)英文名(.+?)性\s*别(.+?)民族.*/)
    var name = trimAll(matched[1]), sex = trimAll(matched[3]) ,enName =  trimAll(matched[2])
}




if(isFTE){
    var matched =  rawInfo.match(/.+出生日期(.+?)国\s*籍.+?(.+?)血型(.+?)婚否(.+)出生地.+/);
    var rawBirth = trimAll(matched[1]);
    var birth = standarDateFmt(rawBirth), nation = trimAll(matched[2]), blood = trimAll(matched[3]), marriage = trimAll(matched[4]);
} else  {
    var matched =  rawInfo.match(/.+出生日期(.+?)国籍\/户口(.+?)婚否(.+)学历.+/)
    var rawBirth = trimAll(matched[1]);
    var birth = standarDateFmt(rawBirth), nation = trimAll(matched[2]), blood = "o", marriage = trimAll(matched[3]);
}

if(isFTE){
    var matched = rawInfo.match(/.+出生地(.+?)民族(.+?)外语程度(.+?)政治面貌(.+?)学历(.+?)专业(.+?)毕业院校(.+?)有效证件类型.+/)

    var birthPlace = trimAll(matched[1])
    var race = trimAll(matched[2])
    var language = trimAll(matched[3])
    var orgFace = trimAll(matched[4])
    var highestEdu = trimAll(matched[5])
    var profession = trimAll(matched[6])
    var colledge = matched[7].replace(nl,"").trim()
} else  {
    var matched = rawInfo.match(/.+学历(.+?)外语程度(.+?)专业(.+?)在读院校(.+?)有效证件号码.+/)
    var birthPlace = ""
    var race = ""
    var language = trimAll(matched[2])
    var orgFace = ""
    var highestEdu = trimAll(matched[1])
    var profession = trimAll(matched[3])
    var colledge = matched[4].replace(nl,"").trim()
}

if(isFTE){
    matched = rawInfo.match(/.+?有效证件类型(.+?)证件号码(.+?)证件有效期(.+?)电子邮箱(.+?)家庭电话(.+?)手机号码(.+?)紧急联系人(.+?)关系(.+?)电话(.+?)现家庭住址及邮政编码/)

    var certificateType = trimAll(matched[1])
    var certificateNo = trimAll(matched[2])
    var certificateDate = trimAll(matched[3])
    var eMail = trimAll(matched[4])
    var familyPhone = trimAll(matched[5])
    var phone = trimAll(matched[6])
    var emergencyContact = trimAll(matched[7])
    var relation = trimAll(matched[8])
    var relationPhone = trimAll(matched[9])

} else {
    matched = rawInfo.match(/.+?有效证件号码(.+?)手机(.+?)email(.+?)紧急联系人(.+?)关系(.+?)地址.+电话(.+?)到岗日期.+/)

    var certificateType = "身份证"
    var certificateNo = trimAll(matched[1])
    var certificateDate = ""
    var eMail = trimAll(matched[3])
    var familyPhone = ""
    var phone = trimAll(matched[2])
    var emergencyContact = trimAll(matched[4])
    var relation = trimAll(matched[5])
    var relationPhone = trimAll(matched[6])
}


if(isFTE){
    // TODO extract address detail information
    matched = rawInfo.match(/.+现家庭住址及邮政编码[（(]中英文填写[）)](.*?)户籍性质\(城镇\/非城镇\)(.*?)户籍所在派出所名称(.*?)户口所在地具体地址(.*?)首次社保缴纳年月(.*?)[\u4e00-\u9fa5]+.+/)

    var addressInfo = matched[1]
    var addressCodeMatch = addressInfo.match(/\d{6}/)
    if(addressCodeMatch !=null && addressCodeMatch.length > 0){
    	var addressCode = addressCodeMatch[0]
    }
    // address Array
    var addrArr = addressInfo.split(nl,10).filter(function(s){return s.trim().length > 0})
    for (i in addrArr) {
    	addrArr[i] = addrArr[i].replace(addressCode,"").trim().replace(/[^\u4e00-\u9fa5\da-zA-Z./-\s]/,"")
    }
    for (i in addrArr) {
    	var addr = addrArr[i]
    	if(addr != null){
    		if( addr.replace(/[\d]/g).match(/[\u4e00-\u9fa5\d]/) != null){
    			cnAddr = addr.replace(/[^\u4e00-\u9fa5\d]*邮编|邮政编码[^\u4e00-\u9fa5\d]/,"")
    		} else {
    			enAddr = addr
    		}
    	}
    }


    var livingType = trimAll(matched[2])
    var livingPoliceAddr = trimAll(matched[3])
    var livingAddress = trimAll(matched[4])
    var firstSocialInsur = standarDateFmt(trimAll(matched[5]))
} else {

    matched = rawInfo.match(/.+家庭住址及邮政编码（中英文）(.*?)教育经历.+/)
    var addressInfo = matched[1]
    var addressCodeMatch = addressInfo.match(/\d{6}/)
    if(addressCodeMatch !=null && addressCodeMatch.length > 0){
        var addressCode = addressCodeMatch[0]
    }
    // address Array
    var addrArr = addressInfo.split(nl,10).filter(function(s){return s.trim().length > 0})
    for (i in addrArr) {
        addrArr[i] = addrArr[i].replace(addressCode,"").trim().replace(/[^\u4e00-\u9fa5\da-zA-Z./-\s]/,"")
    }
    for (i in addrArr) {
        var addr = addrArr[i]
        if(addr != null){
            if( addr.replace(/[\d]/g).match(/[\u4e00-\u9fa5\d]/) != null){
                cnAddr = addr.replace(/[^\u4e00-\u9fa5\d]*邮编|邮政编码[^\u4e00-\u9fa5\d]/,"")
            } else {
                enAddr = addr
            }
        }
    }
    var livingType = ""
    var livingPoliceAddr = ""
    var livingAddress = ""
    var firstSocialInsur = ""

}



if(isFTE) {
    // TODO extract exp/edu info. Only need the lastest item
    matched = rawInfo.match(/.+到岗日期(.*?)上任岗位(.*?)工作经历（时间段，单位名称，职位，从事工作）(.*?)自高中起的教育经历（时间段，学校，专业，学位名称）(.*?)配偶姓名.+/)

    var arriveDate = trimAll(matched[1])
    var position = matched[2]
    var exp = matched[3]
    var edu = matched[4]

    var eduArr = edu.split(nl).filter(function(e){return e.trim()!=""})

    var eduInfo = eduArr.map(function(e){return extractEdu(e)})
    .sort(function(a,b){
    	if(a[0] == b[0])
    		return 0
    	else if(a[0] < b[0])
    		return 1
    	else
    		return -1
    })
    var lastestEdu = eduInfo[0]


    var exps = exp.split(nl)
    var extractedExps = []
    for (i in exps){
    	if(exps[i].trim() == ""){
    		continue
    	}
    	extractedExps.push(extractExp(exps[i]))
    }
    extractedExps.sort(function(a,b){
    	if(a[0] == b[0])
    		return 0
    	else if(a[0] < b[0])
    		return 1
    	else
    		return -1
    })

    latestExp = extractedExps[0]

} else {
    // TODO extract exp/edu info. Only need the lastest item
    matched = rawInfo.match(/.+到岗日期(.*?)实习部门.+/)

    var arriveDate = trimAll(matched[1])
    var position = "Intern International"
    var exp = ""
    var edu = ""

}




if(isFTE) {
    // TODO  extract children detail info
    matched = rawInfo.match(/.+出生日期及出生证明编号(.*?)家庭主要成员/)
    var childernInfo = matched[1]
    if(trimAll(childernInfo).length < 3){
        var childrenArray = []
    } else {
        var childrenArray = childernInfo.split(nl).filter(function(e){return e.trim().length > 0}).map(function(e){
            return e.trim().split(/[^\u4e00-\u9fa5\da-zA-Z./-]+/)
        }).map(function(e){
            e[2] = standarDateFmt(e[2])
            return e
        })
    }
} else {
     // TODO  extract children detail info
    var childrenArray = []
}

if(isFTE) {
    // [\u4e00-\u9fa5\da-zA-Z./-]

    matched = rawInfo.match(/.+招商银行帐号.*?([\d\s]+).*?招商银行支行名称(.+?)银行代码（12位）(.*?)有效证件复印件.+/)
    var bankNo = trimAll(matched[1])
    var bankName = trimAll(matched[2])
    var bankCode = trimAll(matched[3])

    matched = rawInfo.match(/.+亿贝公积金&补充公积金账户(.+?)招商银行帐号.+/)
    var hiredComp = matched[1]

} else {
    matched = rawInfo.match(/.+招行.+帐号.*?([\d\s]+).*?[\u4e00-\u9fa5]+.+/)
    var bankNo = trimAll(matched[1])
    var bankName = ""
    var bankCode = ""

    var hiredComp = "亿贝软件工程"
}


if(isFTE) {
    var c = contractMap[certificateNo];
    if(c != null){
        var salary = c[1];
        var contractNo = c[2]
    } else {
        var salary = "";
        var contractNo = "";
    }
} else {
    var salary = "";
    var contractNo = "";
}

// E1_NAME - name
// E1_ENAME - english name

var marriageStatus = function(str){
	if(str.indexOf("是") >= 0 ||  str.indexOf("已")>=0) {
		return "Married"
	} else if(str.indexOf("否") >= 0 ||  str.indexOf("未")>=0 || str.indexOf("单")>=0){
		return "Single"
	} else if(str.indexOf("离") >= 0) {
		return "Divorced"
	} else if(str.indexOf("丧") >= 0){
		return "Widowed"
	} else {
		return "Unknown"
	}
}

var docTypeFunc = function(str) {
	if(str.length == 18) {
		return "National"
	} else {
		return "Passport"
	}
}

var sexType = function (str) {
	if(str.indexOf("男") >=0 ){
		return "Mr."
	} else {
		return "Ms."
	}
}


var defaultFillFunc = function(id,value){
	$("#"+id).val(value)
  	evalOnCh($("#"+id)[0])
}

var renderDropdownList = function(id, value, valueConverter) {
	var status = valueConverter(value);

	var options = $("#"+id+" option");
	for (var i = 0; i < options.length; ++i){
		if(options[i].text == status){
			$(options[i]).attr("selected", true);
      $("#"+id).attr("cval",$(options[i]).attr("value"))
      evalOnCh($("#"+id)[0])
			return;
		}
	}
}



/// ------render part --------------------

var renderMarriageStatus = function(id, value) {
	renderDropdownList(id, value, marriageStatus)
}
var renderDocType = function(id, value) {
	renderDropdownList(id,value, docTypeFunc)
}
var renderNationality = function(id, value) {
	renderDropdownList(id,value, function(value){
		return "China"
	})
}
var renderCity = function(id, value) {
	renderDropdownList(id,value, function(value){
		return "Shanghai"
	})
}

var renderContry = function(id, value) {
	renderDropdownList(id,value, function(value){
		return "China"
	})
}

var renderCurrency = function(id, value) {
	renderDropdownList(id,value, function(value){
		return "CNY"
	})
}

var renderSex = function(id, value) {
	console.log(value)
	renderDropdownList(id,value, sexType)
}

var renderEstb = function(id, value) {
	console.log(value)
	renderDropdownList(id, value, function(value){
		if(value.indexOf("大学") >= 0){
			return "University"
		} else {
			return "College"
		}
	})
}

var renderDegree = function (id, value) {
	console.log(value)
	renderDropdownList(id,value, function(value){
		if(value.indexOf("博") >= 0){
			return "Doctor"
		} else if (value.indexOf("硕") >= 0){
			return "Master"
		} else {
			return "Bachelor"
		}
	})
}
var duration = function (value) {
	if(value.indexOf("博") >= 0){
			return 5
		} else if (value.indexOf("硕") >= 0){
			return 3
		} else {
			return 4
		}
}


var renderRelation = function(id,value) {
	console.log(value)
	renderDropdownList(id, value, function(value){
		if(value.indexOf("母") >= 0 || value.indexOf("父") >= 0 || value.indexOf("爸") >= 0 || value.indexOf("妈") >= 0){
			return "parent";
		} else if(value.indexOf("妻") >= 0 || value.indexOf("偶") >= 0 || value.indexOf("夫") >= 0 || value.indexOf("公") >= 0 || value.indexOf("婆") >= 0) {
			return "Spouse";
		} else {
			"emergency contact";
		}
	})
}

var renderRelationSex = function(id,value) {
	console.log(value)
	renderDropdownList(id, value, function(value){
    if(value == "夫妻" || value== "配偶"){
    	if(sexType(sex) == "Mr."){
    		return "Female"
    	}else{
    		return "Male"
    	}
    } else if(value.indexOf("母") >= 0 || value.indexOf("妈") >= 0 || value.indexOf("姐") >= 0 || value.indexOf("妹") >= 0 || value.indexOf("姨") >= 0 || value.indexOf("姑") >= 0 || value.indexOf("嫂") >= 0){
	return "Female";
    } else{
    	return "Male"
    }
})
}

var renderIndustry = function (id, value) {
	console.log(value)
	renderDropdownList(id,value, function(value){
		return "Other (OT)"
	})
}


var comId = function(value) {
	if(value.indexOf("亿贝软件工程") >=0){
        return "CDC"
    }if(value.indexOf("亿贝电子商务")>=0){
        return "COC"
    }if(value.indexOf("亿贝管理")>=0){
        return "CSC"
    } else {
        return "SENIS"
    }
}

var renderCompId = function (id, value) {
	renderDropdownList(id,value, comId)
}


var renderConType1 = function (id, value) {
	renderDropdownList(id,value, function(value){
		return "固定期"
	})
}

var renderConType2 = function (id, value) {
	renderDropdownList(id,value, function(value){
	    return fteOrElse("劳动合同","见习协议");
	})
}


var renderEStatus = function (id, value) {
	renderDropdownList(id,value, function(value){
		return fteOrElse("试用","正常");
	})
}


var renderEMType = function (id, value) {
	renderDropdownList(id,value, function(value){
		return fteOrElse("Regular","Interns")
	})
}

var renderPType = function (id, value) {
	renderDropdownList(id,value, function(value){
		return "PRC"
	})
}




var renderChildCerType = function (id, value) {
	renderDropdownList(id,value, function(value){
		return "出生医学证明"
	})
}


var renderChildRen = function(id, value) {
	renderDropdownList(id, value, function(value){
		if(value.indexOf("男") >= 0){
			return "F"
		} else {
			return "M"
		}
	})
}


var renderWorkLocatioin = function(id, value) {
	renderDropdownList(id, value, function(value){
		if(value == "CDC"){
			return "German Center"
		} else if(value == "COC" || value == "CSC" ){
			return "EOC"
		} else {
			return "Raffles office"
		}
	})
}


var renderCityLocation = function(id, value) {
	renderDropdownList(id, value, function(value){
		return "Shanghai"
	})
}



var fteOrElse = function(fteVal,otherVal){
    if(isFTE){
        return fteVal
    } else {
        return otherVal
    }
}

var nullOrDefault = function(value, dft) {
    if(value == null || (value + "").length == 0){
        return dft;
    } else {
        return value;
    }
}




var content = {
	"E1_NAME": {
		"value":name
	},
	"E1_ENAME": {
		"value":enName
	},
	"E1_BIRTHDATE":{
		"value":birth
	},
	"E1_MARITALSTATUS": {
		"value": marriage,
		"func": renderMarriageStatus
	},
	"E1_NUMBEROFCHILD": {
		"value": childrenArray.length
	},
	"E1_DOCTYPE" : {
		"value": certificateNo,
		"func": renderDocType
	},
	"E1_DOCNO" : {
		"value": certificateNo
	},
	"E1_NATIONALITY": {
		"value": nation,
		"func": renderNationality
	},
	"E1_HOUSENO": {
		"value": enAddr
	},
	"E1_HOUSENOCH": {
		"value": cnAddr
	},
	"E1_POSTALCODE": {
		"value": nullOrDefault(addressCode,"200000")
	},
	"E1_CITY": {
		"value": "",
		"func": renderCity
	},
	"E1_COUNTRY": {
		"value": "",
		"func": renderContry
	},
	"E1_FORMOFADDRESS": {
		"value": sex,
		"func": renderSex
	},
	"E1_TELEPHONENUMBER": {
		"value": phone
	},
	"E1_FTELENUMBER": {
		"value": relationPhone
	},
	"E1_RELATIONNAME": {
		"value": emergencyContact
	},
	"E1_BANKCARD": {
		"value": bankNo
	},
	"E1_CURRENCY": {
		"value": "",
		"func": renderCurrency
	},
	"E1_GRADUATIONDATE": {
		"value" : (function(){
                if(lastestEdu == null || lastestEdu.length == 0){
                    return ""
                } else {
                    return lastestEdu[1]
                }
    				}
		    )()
	},
	"E1_ESTABLISHMENT": {
		"value" : colledge,
		"func": renderEstb
	},
	"E1_NAMEOFSCHOOL": {
		"value":colledge
	},
	"E1_DEGREE": {
		"value": highestEdu,
		"func": renderDegree
	},
	"E1_DURATION": {
		"value": duration(highestEdu)
	},
	"E1_COURSEOFSTUDY": {
		"value": profession
	},
	"E1_FAMILYMEMBER": {
		"value": relation,
		"func": renderRelation

	},
  	"E1_FGENDER": {
  		"value": relation,
  		"func": renderRelationSex
  	},
  	"E1_CITYCOUNTRY": {
  		"value":  "Shanghai"
  	},
  	"E1_INDUSTRY": {
  		"value": "xxx",
  		"func": renderIndustry
  	},
  	"E1_COMPID": {
  		"value": hiredComp,
  		"func": renderCompId
  	},
	"E1_STARTDATE": {
 		"value": standarDateFmt(arriveDate)
  	},
  	"E1_POSITIONTITLE":{
  		"value": position.replace(nl,"").trim()
  	},
  	"E1_PROBTERM": {
  		"value": fteOrElse("6","0")
  	},
  	"E1_CONATTRIBUTE": {
  		"value": "xxx",
  		"func": renderConType1
  	},
  	"E1_CONID": {
  		"value": "xxx",
  		"func": renderConType2
  	},
  	"E1_CONTRACTBEGINDATE":{
  		"value": standarDateFmt(arriveDate)
  	},
  	"E1_CONTRACTTERM":{
  		"value": fteOrElse("36","12")
  	},
  	"E1_ESTATUS": {
  		"value": "xx",
  		"func": renderEStatus
  	},
  	"E1_EMPTYPE": {
  		"value": "xx",
  		"func": renderEMType
  	},
  	"E1_PEOPLESTATUS": {
  		"value": "xx",
  		"func": renderPType
  	},
  	"E1_WORKLOCATION":{
  		"value": comId(hiredComp),
  		"func": renderWorkLocatioin
  	},
  	"E1_CITYLOCATION":{
  		"value": "xxx",
  		"func": renderCityLocation
  	},
    "E1_JOBID":{
    	"value": fteOrElse("","11111111")
    },
    "E1_CONNO": {
        "value": contractNo
    },
    "E1_MONTHLYAMOUNT": {
        "value": salary
    }
}

// render children

if(childrenArray != null && childrenArray.length  > 0){
	firstC = childrenArray[0];
	content["E1_CHILDNAME"]  = {
		"value": firstC[0]
	};
	content["E1_CHILDGENDER"]  = {
		"value": firstC[1],
		"func": renderChildRen
	};
	content["E1_CHILDBIRTHDAY"]  = {
		"value": firstC[2]
	};
	content["E1_CERTTYPE"]  = {
		"value": "xxx",
		"func": renderChildCerType
	};
	content["E1_CERTNO"]  = {
		"value": firstC[3]
	};

	if(childrenArray.length>1){
		secC = childrenArray[1];
		content["E1_CHILDNAME2"]  = {
		"value": secC[0]
		};
		content["E1_CHILDGENDER2"]  = {
			"value": secC[1],
			"func": renderChildRen
		};
		content["E1_CHILDBIRTHDAY2"]  = {
			"value": secC[2]
		};
		content["E1_CERTTYPE2"]  = {
			"value": "xxx",
			"func": renderChildCerType
		};
		content["E1_CERTNO2"]  = {
			"value": secC[3]
		};

	}
}

for(id in content) {
  try{
    var item = content[id];
    if(item["func"] == null){
      defaultFillFunc(id, item["value"])
    }else{
      item["func"](id, item["value"])
    }
  }catch(err){
    console.log(err)
  }
}







// $($("#E1_MARITALSTATUS option")[4]).attr("selected",true)
// E1_FGENDER

///
