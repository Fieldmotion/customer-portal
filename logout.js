// {  eslint settings
/* global fm */
// }
fm.fns.logout=function() {
	$.post(fm.url+'Login/logout.php', fm.fns.getPayLoad({'ok':1}), function() {
		delete localStorage.fm_cp_credentials;
		var $script=$('#fm-customer-portal'), script_cid=+$script.data('cid')||0;
		$.each(fm, function(k) {
			if (k=='$wrapper' || k=='fns' || (k=='client_id' && (fm.$wrapper.data('cid')==fm.client_id || fm.client_id==script_cid)) || k=='url' || k=='scriptUrl') { // don't remove these
				return;
			}
			delete fm[k];
		});
		fm.fns.pageLogin();
	});
};
