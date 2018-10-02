window.addEventListener('load', function() {
	var fm={};
	function checkForJQuery() {
		if (typeof jQuery==='undefined') {
			console.log('jQuery not loaded. loading now.');
			var el=document.createElement('script'), head=document.getElementsByTagName('head')[0];
			el.src="https://code.jquery.com/jquery-3.3.1.min.js";
			head.appendChild(el);
		}
		function waitForjQuery() {
			if (typeof jQuery==='undefined') {
				return setTimeout(waitForjQuery, 1);
			}
			initialise();
		}
		function initialise() {
			fm.$wrapper=$('#fm-customer-portal');
			if (!fm.$wrapper.length) {
				return alert('element with ID fm-customer-portal not found');
			}
			if (!+fm.$wrapper.data('cid')) {
				return alert('fm-customer-portal must have a data field with your user account ID');
			}
			fm.client_id=+fm.$wrapper.data('cid');
			if (fm.$wrapper.is('script')) {
				fm.$wrapper.replaceWith('<div id="fm-customer-portal"></div>');
				fm.$wrapper=$('#fm-customer-portal');
			}
			checkLoginStatus(pageMain, pageLogin);
		}
		setTimeout(waitForjQuery, 1);
	}
	function checkLoginStatus(success, fail) {
		fm.credentials=localStorage.credentials;
		if (fm.credentials===undefined) {
			return pageLogin();
		}
		console.log('TODO!');
	}
	function pageLogin() {
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
			console.log('TODO!');
			return false;
		});
	}
	function pageMain() {
		console.log('TODO!');
	}
	checkForJQuery();
});
