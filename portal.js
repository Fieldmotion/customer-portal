window.fm={'fns':[]};
fm.fns.checkLoginStatus=function() {
	try {
		fm.credentials=JSON.parse(localStorage.fm_cp_credentials);
	}
	catch(e) {
		return fm.fns.pageLogin();
	}
	if (fm.credentials===undefined) {
		return fm.fns.pageLogin();
	}
	$.post(fm.url+'Login_check', fm.fns.getPayLoad(), function(ret) {
		if (ret && ret.ok && ret.ok=='1') {
			fm.date_format=ret.settings['date-format']||'Y-m-d';
			fm.time_format=ret.settings['time-format']||'24h';
			fm.job_creation=ret.settings['job-creation']||0;
			return fm.fns.pageMain();
		}
		else {
			return fm.fns.pageLogin();
		}
	});
}
fm.fns.dateFormat=function(d) {
	function v(a) {
		return +a<10?'0'+a:a;
	}
	if (d===null || d===undefined || d==='' || d===0) {
		return '';
	}
	if (typeof d==='number') {
		d=new Date(d);
	}
	if (d.toYMD===undefined) {
		d=new Date(d.replace(' ', 'T')); // convert to ISO 8601 first, then into Time
	}
	if ($.inArray(fm.date_format, ['dd/mm/yy', 'mm-dd-yy', 'yy-mm-dd', 'dd-mm-yy'])>-1) {
		var m=v(d.getMonth()+1), y=d.getFullYear(), d=v(d.getDate());
		if (isNaN(y) || isNaN(m) || isNaN(d)) {
			m='--';
			y='----';
			d='--';
		}
		return fm.date_format
			.replace(/mm/, m)
			.replace(/yy/, y)
			.replace(/dd/, d);
	}
	function php_date_format(format, timestamp) {
		// see https://github.com/kvz/locutus/blob/master/src/php/datetime/date.js
	  var jsdate, f
	  var txtWords = [
	    'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
	    'January', 'February', 'March', 'April', 'May', 'June',
	    'July', 'August', 'September', 'October', 'November', 'December'
	  ]
	  var formatChr = /\\?(.?)/gi
	  var formatChrCb = function (t, s) {
	    return f[t] ? f[t]() : s
	  }
	  var _pad = function (n, c) {
	    n = String(n)
	    while (n.length < c) {
	      n = '0' + n
	    }
	    return n
	  }
	  f = {
	    // Day
	    d: function () {
	      // Day of month w/leading 0; 01..31
	      return _pad(f.j(), 2)
	    },
	    D: function () {
	      // Shorthand day name; Mon...Sun
	      return f.l()
	        .slice(0, 3)
	    },
	    j: function () {
	      // Day of month; 1..31
	      return jsdate.getDate()
	    },
	    l: function () {
	      // Full day name; Monday...Sunday
	      return txtWords[f.w()] + 'day'
	    },
	    N: function () {
	      // ISO-8601 day of week; 1[Mon]..7[Sun]
	      return f.w() || 7
	    },
	    S: function () {
	      // Ordinal suffix for day of month; st, nd, rd, th
	      var j = f.j()
	      var i = j % 10
	      if (i <= 3 && parseInt((j % 100) / 10, 10) === 1) {
	        i = 0
	      }
	      return ['st', 'nd', 'rd'][i - 1] || 'th'
	    },
	    w: function () {
	      // Day of week; 0[Sun]..6[Sat]
	      return jsdate.getDay()
	    },
	    z: function () {
	      // Day of year; 0..365
	      var a = new Date(f.Y(), f.n() - 1, f.j())
	      var b = new Date(f.Y(), 0, 1)
	      return Math.round((a - b) / 864e5)
	    },
	
	    // Week
	    W: function () {
	      // ISO-8601 week number
	      var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3)
	      var b = new Date(a.getFullYear(), 0, 4)
	      return _pad(1 + Math.round((a - b) / 864e5 / 7), 2)
	    },
	
	    // Month
	    F: function () {
	      // Full month name; January...December
	      return txtWords[6 + f.n()]
	    },
	    m: function () {
	      // Month w/leading 0; 01...12
	      return _pad(f.n(), 2)
	    },
	    M: function () {
	      // Shorthand month name; Jan...Dec
	      return f.F()
	        .slice(0, 3)
	    },
	    n: function () {
	      // Month; 1...12
	      return jsdate.getMonth() + 1
	    },
	    t: function () {
	      // Days in month; 28...31
	      return (new Date(f.Y(), f.n(), 0))
	        .getDate()
	    },
	
	    // Year
	    L: function () {
	      // Is leap year?; 0 or 1
	      var j = f.Y()
	      return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0
	    },
	    o: function () {
	      // ISO-8601 year
	      var n = f.n()
	      var W = f.W()
	      var Y = f.Y()
	      return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0)
	    },
	    Y: function () {
	      // Full year; e.g. 1980...2010
	      return jsdate.getFullYear()
	    },
	    y: function () {
	      // Last two digits of year; 00...99
	      return f.Y()
	        .toString()
	        .slice(-2)
	    },
	
	    // Time
	    a: function () {
	      // am or pm
	      return jsdate.getHours() > 11 ? 'pm' : 'am'
	    },
	    A: function () {
	      // AM or PM
	      return f.a()
	        .toUpperCase()
	    },
	    B: function () {
	      // Swatch Internet time; 000..999
	      var H = jsdate.getUTCHours() * 36e2
	      // Hours
	      var i = jsdate.getUTCMinutes() * 60
	      // Minutes
	      // Seconds
	      var s = jsdate.getUTCSeconds()
	      return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3)
	    },
	    g: function () {
	      // 12-Hours; 1..12
	      return f.G() % 12 || 12
	    },
	    G: function () {
	      // 24-Hours; 0..23
	      return jsdate.getHours()
	    },
	    h: function () {
	      // 12-Hours w/leading 0; 01..12
	      return _pad(f.g(), 2)
	    },
	    H: function () {
	      // 24-Hours w/leading 0; 00..23
	      return _pad(f.G(), 2)
	    },
	    i: function () {
	      // Minutes w/leading 0; 00..59
	      return _pad(jsdate.getMinutes(), 2)
	    },
	    s: function () {
	      // Seconds w/leading 0; 00..59
	      return _pad(jsdate.getSeconds(), 2)
	    },
	    u: function () {
	      // Microseconds; 000000-999000
	      return _pad(jsdate.getMilliseconds() * 1000, 6)
	    },
	
	    // Timezone
	    e: function () {
	      // Timezone identifier; e.g. Atlantic/Azores, ...
	      // The following works, but requires inclusion of the very large
	      // timezone_abbreviations_list() function.
	      /*              return that.date_default_timezone_get();
	       */
	      var msg = 'Not supported (see source code of date() for timezone on how to add support)'
	      throw new Error(msg)
	    },
	    I: function () {
	      // DST observed?; 0 or 1
	      // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
	      // If they are not equal, then DST is observed.
	      var a = new Date(f.Y(), 0)
	      // Jan 1
	      var c = Date.UTC(f.Y(), 0)
	      // Jan 1 UTC
	      var b = new Date(f.Y(), 6)
	      // Jul 1
	      // Jul 1 UTC
	      var d = Date.UTC(f.Y(), 6)
	      return ((a - c) !== (b - d)) ? 1 : 0
	    },
	    O: function () {
	      // Difference to GMT in hour format; e.g. +0200
	      var tzo = jsdate.getTimezoneOffset()
	      var a = Math.abs(tzo)
	      return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4)
	    },
	    P: function () {
	      // Difference to GMT w/colon; e.g. +02:00
	      var O = f.O()
	      return (O.substr(0, 3) + ':' + O.substr(3, 2))
	    },
	    T: function () {
	      // The following works, but requires inclusion of the very
	      // large timezone_abbreviations_list() function.
	      /*              var abbr, i, os, _default;
	      if (!tal.length) {
	        tal = that.timezone_abbreviations_list();
	      }
	      if ($locutus && $locutus.default_timezone) {
	        _default = $locutus.default_timezone;
	        for (abbr in tal) {
	          for (i = 0; i < tal[abbr].length; i++) {
	            if (tal[abbr][i].timezone_id === _default) {
	              return abbr.toUpperCase();
	            }
	          }
	        }
	      }
	      for (abbr in tal) {
	        for (i = 0; i < tal[abbr].length; i++) {
	          os = -jsdate.getTimezoneOffset() * 60;
	          if (tal[abbr][i].offset === os) {
	            return abbr.toUpperCase();
	          }
	        }
	      }
	      */
	      return 'UTC'
	    },
	    Z: function () {
	      // Timezone offset in seconds (-43200...50400)
	      return -jsdate.getTimezoneOffset() * 60
	    },
	
	    // Full Date/Time
	    c: function () {
	      // ISO-8601 date.
	      return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb)
	    },
	    r: function () {
	      // RFC 2822
	      return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb)
	    },
	    U: function () {
	      // Seconds since UNIX epoch
	      return jsdate / 1000 | 0
	    }
	  }
	
	  var _date = function (format, timestamp) {
	    jsdate = (timestamp === undefined ? new Date() // Not provided
	      : (timestamp instanceof Date) ? new Date(timestamp) // JS Date()
	      : new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
	    )
	    return format.replace(formatChr, formatChrCb)
	  }
	
	  return _date(format, timestamp)
	}
	return php_date_format(fm.date_format, d);
}
fm.fns.datetimeFormat=function(d) {
	function v(a) {
		return +a<10?'0'+a:a;
	}
	if (d===null || d===undefined || d==='' || d==='0000-00-00 00:00:00' || d==='0000-00-00 00:00' || (d.toYMD && d.toYMD()=='1970-01-01')) {
		return '';
	}
	if (typeof d==='number' || (typeof d==='string' && d.replace(/[0-9]*/, '')=='')) {
		if (d<9999999999) { // we need this in milliseconds, not seconds
			d*=1000;
		}
		d=new Date(+d);
	}
	if (d.toYMD===undefined) {
		var d1=new Date(d.replace(' ', 'T')+'Z');
		d=new Date();
		d.setTime(d1.getTime()+d1.getTimezoneOffset()*60*1000); // *sigh* Benjamin Franklin
	}
	var h=+d.getHours();
	var time=fm.fns.dateFormat(d)+' '+fm.time_format
		.replace(/24h/, v(h))
		.replace(/am\/pm|AM\/PM/, (h%12))
		+':'+v(d.getMinutes());
	if (/am/.test(fm.time_format)) {
		time+=h>11?'pm':'am';
	}
	if (/AM/.test(fm.time_format)) {
		time+=h>11?'PM':'AM';
	}
	return time;
}
fm.fns.datePicker=function(opts) {
	var $els=$(opts[0]);
	$els.each(function() {
		var $el=$(this);
		if ($el.data('has-date-picker')) {
			return;
		}
		$el.data('has-date-picker', true);
		var $wrapper=$($el.wrap('<div class="date-wrapper"/>').closest('.date-wrapper'));
		$wrapper.click(function() {
			$(this).find('input').datepicker('show');
		});
		var $alt=$('<span class="date-alternative"></span>').insertAfter($el);
		$el.css({
			'visibility':'hidden',
			'width':'1px',
			'height':'1px',
			'float':'right'
		});
		function updateAlt() {
			var txt=opts[4]?'':($el.val()=='0000-00-00'?'-- -- --':fm.fns.dateFormat($el.datepicker('getDate')));
			$alt.text(txt);
		}
		if (opts[1]||$el.val()) {
			var v=opts[1]||$el.val();
			if (!/^[0-9]*-[0-9]*-[0-9]*$/.test(v)) {
				v='';
			}
			$el.val(v);
		}
		$el
			.datepicker({
				'changeYear':true,
				'changeMonth':true,
				'dateFormat':'yy-mm-dd',
				'yearRange':'-100:+100'
			})
			.change(updateAlt)
			.blur();
		updateAlt();
		if (opts[2]) { // allow blank
			$('<a href="#" class="date-clear">[x]</a>')
				.prependTo($wrapper.css('padding-right', '20px'))
				.click(function() {
					$el.val('0000-00-00').change();
					updateAlt();
					return false;
				});
		}
	});
	if (opts[3]) { // callback
		setTimeout(opts[3], 1);
	}
	return $els;
}
fm.fns.dateToYMD=function() {
	var year, month, day;
	year = String(this.getFullYear());
	month = String(this.getMonth() + 1);
	if (month.length == 1) {
		month = "0" + month;
	}
	day = String(this.getDate());
	if (day.length == 1) {
		day = "0" + day;
	}
	return year + "-" + month + "-" + day;
}
fm.fns.dateToYMDHIS=function() {
	var hour, minute;
	hour= String(this.getHours());
	minute= String(this.getMinutes());
	if (hour.length == 1) {
		hour = "0" + hour;
	}
	if (minute.length == 1) {
		minute= "0" + minute;
	}
	return this.toYMD()+' '+hour+":"+minute+":00";
}
fm.fns.functionLoad=function(fn) {
	if (fm.fns[fn]) { // already loading or loaded
		return;
	}
	fm.fns[fn]=true;
	$('<script src="'+fm.scriptUrl+'/'+fn+'.js"></script>').appendTo('head');
};
fm.fns.getPayLoad=function(params) {
	var json=JSON.stringify(params);
	var base64=btoa(json);
	var now=(new Date).getTime();
	var md5=window.md5(''+base64+now+fm.credentials.session_key);
	return {
		'b64':base64,
		'now':now,
		'md5':md5,
		'sid':fm.credentials.session_id,
		'cid':fm.client_id
	};
};
fm.fns.initialise=function() {
	fm.$wrapper=$('#fm-customer-portal');
	if (!fm.$wrapper.length) {
		return alert('element with ID fm-customer-portal not found');
	}
	if (!+fm.$wrapper.data('cid')) {
		return alert('fm-customer-portal must have a data field with your user account ID');
	}
	// { make sure backlink exists
	var $backlink=fm.$wrapper.next();
	if (!$backlink.length || !$backlink.is('a') || $backlink.prop('href')!='https://fieldmotion.com/' || $backlink.text().toLowerCase()!='fieldmotion') {
		return alert('backlink missing. please make sure that the script loading the FieldMotion portal is immediatelyy followed by a link to https://fieldmotion.com/');
	}
	// }
	fm.client_id=+fm.$wrapper.data('cid');
	fm.url=fm.$wrapper.data('url')||'https://p.fieldmotion.com/customers-api/';
	fm.scriptUrl=fm.$wrapper.prop('src').replace(/\/[^\/]*$/, '');
	fm.$wrapper.replaceWith('<div id="fm-customer-portal"></div>');
	fm.$wrapper=$('#fm-customer-portal');
	fm.fns.checkLoginStatus();
	$('<style>@import "'+fm.scriptUrl+'/style.css";</style>').appendTo('head');
};
fm.fns.pageLogin=function() {
	var $login=$('<table>'
		+'<tr><th>Customer ID</th><td><input class="fm-customer-id"/></td></tr>'
		+'<tr><th>Password</th><td><input type="password" class="fm-customer-password"/></td></tr>'
		+'<tr><td>&nbsp;</td><td><button class="fm-login">Log In</button></td></tr>'
		+'</table>')
		.appendTo(fm.$wrapper.empty());
	$login.find('button').click(()=>{
		var cid=$login.find('.fm-customer-id').val(), pass=$login.find('.fm-customer-password').val();
		if (!cid || !pass) {
			return alert('Please fill in both the Customer ID and the Password');
		}
		$.post(fm.url+'Login_login', {
			'client_id':fm.client_id,
			'customer_id':cid,
			'password':pass
		}, function(ret) {
			if (ret.error) {
				return alert(ret.error);
			}
			fm.credentials={
				'session_id':ret.session_id,
				'session_key':ret.session_key
			};
			localStorage.fm_cp_credentials=JSON.stringify(fm.credentials);
			fm.fns.checkLoginStatus();
		});
		return false;
	});
};
fm.fns.pageMain=function() {
	fm.$wrapper.empty().html('<div id="fm-menu"/><div id="fm-content"/>');
	fm.fns.whenFunctionsExist(['showMenu', 'showJobsList'], function() {
		fm.fns.showMenu();
		fm.fns.showJobsList();
	});
};
fm.fns.requireDataTables=function(callback) {
	if ($.fn.DataTable) {
		return callback();
	}
	$('<link rel="stylesheet" href="//cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css"/>').appendTo('head');
	$.cachedScript('//cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js');
	function wait() {
		if ($.fn.DataTable) {
			function resizeDatatables() {
				var tables=$.fn.dataTable.fnTables(true);
				if (tables.length>0) {
					$(tables).dataTable().fnAdjustColumnSizing();
				}
			}
			setTimeout(resizeDatatables, 100);
			return callback();
		}
		setTimeout(wait, 1);
	}
	wait();
}
fm.fns.requireFullCalendar=function(callback) {
	fm.fns.requireMoment(function() {
		if ($.fn.fullCalendar) {
			return callback();
		}
		$('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.css"/>').appendTo('head');
		$.cachedScript('https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.js');
		function wait() {
			if ($.fn.fullCalendar) {
				return callback();
			}
			setTimeout(wait, 1);
		}
		wait();
	});
}
fm.fns.requireMoment=function(callback) {
	if (window.moment) {
		return callback();
	}
	$.cachedScript('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js');
	function wait() {
		if (window.moment) {
			return callback();
		}
		setTimeout(wait, 1);
	}
	wait();
}
fm.fns.requireDateTimePicker=function(callback) {
	if ($.fn.datetimepicker) {
		return callback();
	}
	$('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jquery-datetimepicker@2.5.20/build/jquery.datetimepicker.min.css"/>').appendTo('head');
	$.cachedScript('https://cdn.jsdelivr.net/npm/jquery-datetimepicker@2.5.20/build/jquery.datetimepicker.full.min.js');
	function wait() {
		if ($.fn.datetimepicker) {
			return callback();
		}
		setTimeout(wait, 1);
	}
	wait();
}
fm.fns.whenFunctionsExist=function(fns, callback) {
	function checkOrLoop() {
		var missing=0;
		for (var i=0;i<fns.length;++i) {
			if (!fm.fns[fns[i]]) { // load the function
				fm.fns.functionLoad(fns[i]);
			}
			if (fm.fns[fns[i]]===true) { // function still loading
				missing++;
			}
		}
		if (missing) {
			return setTimeout(checkOrLoop, 1000);
		}
		callback();
	}
	checkOrLoop();
}

Date.prototype.toYMD = fm.fns.dateToYMD;
Date.prototype.toYMDHIS = fm.fns.dateToYMDHIS;
// { md5, from https://github.com/blueimp/JavaScript-MD5/blob/master/js/md5.min.js, license https://opensource.org/licenses/MIT
!function(n){"use strict";function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t);return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}"function"==typeof define&&define.amd?define(function(){return A}):"object"==typeof module&&module.exports?module.exports=A:n.md5=A}(this);
// }

window.addEventListener('load', function() {
	if (typeof jQuery==='undefined') {
		var el=document.createElement('script'), head=document.getElementsByTagName('head')[0];
		el.src="https://code.jquery.com/jquery-3.3.1.min.js";
		head.appendChild(el);
	}
	function waitForJQuery() {
		if (typeof jQuery==='undefined') {
			return setTimeout(waitForJQuery, 1);
		}
		window.$=jQuery;
		$.cachedScript = function( url, options ) {
			options = $.extend( options || {}, {
				dataType: "script",
				cache: true,
				url: url
			});
			return $.ajax( options );
		}
		if (typeof jQuery.ui === 'undefined') {
			var el=document.createElement('script'), head=document.getElementsByTagName('head')[0];
			el.src='https://code.jquery.com/ui/1.12.1/jquery-ui.min.js';
			head.appendChild(el);
			var el=document.createElement('link');
			el.href='http://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css';
			head.appendChild(el);
		}
		waitForJQueryUI();
	}
	function waitForJQueryUI() {
		if (typeof jQuery.ui === "undefined") {
			return setTimeout(waitForJQueryUI, 1);
		}
		fm.fns.initialise();
	}
	setTimeout(waitForJQuery, 1);
});



