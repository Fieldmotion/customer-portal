fm.fns.showMenu=function() {
	// { menu HTML
	var html='<ul class="fm-nav">';
	html+='<li><a href="#" class="fm-link-list">Jobs List</a></li>';
	html+='<li><a href="#" class="fm-link-logout">Log Out</a></li>';
	html+='</ul>';
	// }
	$('#fm-menu').html(html)
		.on('click', '.fm-link-list', function() {
			fm.fns.whenFunctionsExist(['showJobsList'], function() {
				fm.fns.showJobsList();
			});
		})
		.on('click', '.fm-link-logout', function() {
			fm.fns.whenFunctionsExist(['logout'], function() {
				fm.fns.logout();
			});
		});
}
