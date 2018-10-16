fm.fns.logout=function() {
	$.post(fm.url+'Login/logout.php', fm.fns.getPayLoad({'ok':1}), function(ret) {
		delete localStorage.fm_cp_credentials;
		$.each(fm, function(k, v) {
			if (k=='$wrapper' || k=='fns' || k=='client_id' || k=='url' || k=='scriptUrl') { // don't remove these
				return;
			}
			delete fm[k];
		});
		fm.fns.pageLogin();
	});
}
