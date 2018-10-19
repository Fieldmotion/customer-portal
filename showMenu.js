fm.fns.showMenu=()=>{
	// { menu HTML
	var html='<ul class="fm-nav">';
	html+='<li><a href="#" class="fm-link-list">Jobs List</a></li>';
	html+='<li><a href="#" class="fm-link-calendar">Calendar</a></li>';
	html+='<li><a href="#" class="fm-link-assets">Assets</a></li>';
	html+='<li><a href="#" class="fm-link-files">Files</a></li>';
	html+='<li><a href="#" class="fm-link-invoices">Invoices</a></li>';
	html+='<li><a href="#" class="fm-link-logout">Log Out</a></li>';
	html+='</ul>';
	// }
	$('#fm-menu').html(html)
		.on('click', '.fm-link-assets', function() {
			fm.fns.whenFunctionsExist(['showAssets'], function() {
				fm.fns.showAssets();
			});
			return false;
		})
		.on('click', '.fm-link-calendar', function() {
			fm.fns.whenFunctionsExist(['showJobsCalendar'], function() {
				fm.fns.showJobsCalendar();
			});
			return false;
		})
		.on('click', '.fm-link-files', function() {
			fm.fns.whenFunctionsExist(['showFiles'], function() {
				fm.fns.showFiles();
			});
			return false;
		})
		.on('click', '.fm-link-invoices', function() {
			fm.fns.whenFunctionsExist(['showInvoices'], function() {
				fm.fns.showInvoices();
			});
			return false;
		})
		.on('click', '.fm-link-list', function() {
			fm.fns.whenFunctionsExist(['showJobsList'], function() {
				fm.fns.showJobsList();
			});
			return false;
		})
		.on('click', '.fm-link-logout', function() {
			fm.fns.whenFunctionsExist(['logout'], function() {
				fm.fns.logout();
			});
			return false;
		});
}
