/* globals fm */
fm.fns.showJobsCalendar=function() {
	$('#fm-menu a').removeClass('fm-selected');
	$('#fm-menu a.fm-link-calendar').addClass('fm-selected');
	if (!fm.job_statuses) { // make sure page knows the Statuses list
		$.post(fm.url+'Jobs_listStatuses', fm.fns.getPayLoad(), function(ret) {
			fm.job_statuses=ret.statuses;
			fm.fns.showJobsCalendar();
		});
		return;
	}
	fm.fns.requireFullCalendar(function() {
		$('#fm-content').empty().append(['<h2>Jobs Calendar</h2>', '<div id="fm-calendar"/>']);
		var $wrapper=$('#fm-calendar');
		$wrapper.fullCalendar('destroy');
		$wrapper.fullCalendar({ // adding Calendar
			'eventSources': [
				{	//first source = appointments for customers & child companies
					'events': function(start, end, timezone, callback){
						$.post(fm.url+'Jobs_getCalendarCustomers', fm.fns.getPayLoad({'start':start.unix(), 'end':end.unix()}), function(ret) {
							var events=$(ret.events);
							callback(events);
						});
					},
					'textColor':'#000'
				},
				{	//second event source for asset-related appointments
					'events': function(start, end, timezone, callback){
						$.post(fm.url+'Jobs_getCalendarAssets', fm.fns.getPayLoad({'start':start.unix(), 'end':end.unix()}), function(ret) {
							var assetEvents=$(ret.assetevents);
							callback(assetEvents);
						});
					}, 
					'backgroundColor': '#385A6B'
				}
			],
			'eventRender': function(event, element){
				element.find('.fc-event-inner').prepend($('<div class="fm-job_ref" title="Job Ref"/>').text(event.job_ref));
			},
			'timeFormat':'H:mm',
			'disableResizing':true
		});
	});
};
