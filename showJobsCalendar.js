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
			eventSources: [
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
			eventRender: (event, element)=>{
				$(element).closest('.fc-event').data('details', event);
				element.find('.fc-title').prepend($('<span class="fm-job_ref"/>').text(event.job_ref+': '));
			},
			timeFormat:'H:mm',
			disableResizing:true
		});
		$wrapper.tooltip({
			items:'.fc-event',
			content:function() {
				var details=$(this).data('details');
				var $el=$('<div/>').text('...');
				getCustomerDetails(details.customer_type, details.customer_id, obj=>{
					var $table=$('<table></table>'), $tr, address;
					// {
					$tr=$('<tr><th>For</th><td class="fm-job-for"/></tr>').appendTo($table);
					var forName=obj.name;
					if (obj.parent) {
						forName=obj.parent.name+' » '+forName;
					}
					$table.find('.fm-job-for').text(forName);
					// }
					// { location
					if (obj.location_type && +obj.location_type && obj.parent) {
						address=[obj.parent.street_address1, obj.parent.street_address2, obj.parent.town, obj.parent.county, obj.parent.postcode, obj.parent.city, obj.parent.state, obj.parent.country];
					}
					else {
						address=[obj.street_address1, obj.street_address2, obj.town, obj.county, obj.postcode, obj.city, obj.state, obj.country];
					}
					$tr=$('<tr><th>Location</th><td class="fm-location"/></tr>').appendTo($table);
					$tr.find('.fm-location').text(address.filter(z=>{
						return z||false;
					}).join(', '));
					// }
					$table.appendTo($el.empty());
					setTimeout(()=>{
						$el.closest('.ui-tooltip').css('opacity', 1);
					}, 100);
				});
				return $el;
			}
		});
	});
	var customerDetails={};
	function getCustomerDetails(type, id, callback) {
		if (customerDetails[type+'_'+id]) {
			return callback(customerDetails[type+'_'+id]);
		}
		else {
			if (type===1) { // asset
				$.post(fm.url+'Asset_get', fm.fns.getPayLoad({
					id:id
				}), ret=>{
					if (ret.error) {
						return callback(ret);
					}
					var obj=ret.obj;
					customerDetails[type+'_'+id]=obj;
					var p_id=0;
					if (+obj.location_id>0 && +obj.location_type==1) {
						p_id=+ret.obj.location_id;
					}
					else if (+obj.owner_id>0) {
						p_id=+obj.owner_id;
					}
					if (p_id>0) {
						$.post(fm.url+'Customer_get', fm.fns.getPayLoad({
							id:p_id
						}), ret=>{
							obj.parent=ret.obj;
							customerDetails[type+'_'+id]=obj;
							callback(obj);
						});
					}
					else {
						callback(obj);
					}
				});
			}
			else {
				$.post(fm.url+'Customer_get', fm.fns.getPayLoad({
					id:id
				}), ret=>{
					if (ret.error) {
						return callback(ret);
					}
					var obj=ret.obj;
					customerDetails[type+'_'+id]=obj;
					if (+obj.parent>0) {
						$.post(fm.url+'Asset_get', fm.fns.getPayLoad({
							id:obj.parent
						}), ret=>{
							obj.parent=ret.obj;
							customerDetails[type+'_'+id]=obj;
							callback(obj);
						});
					}
					else {
						callback(obj);
					}
				});
			}
		}
	}
};
