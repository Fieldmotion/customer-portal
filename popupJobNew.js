// { eslint settings
/* global fm */
// }
fm.fns.popupJobNew=($view, $el, asset_id)=>{
	var $wrapper=$('#fm-content');
	var $shader=$('<div class="fm-dialog-shader"/>')
		.appendTo($wrapper);
	var $dialog=$('<div id="fm-popup-job-new" class="fm-dialog">'
		+'<h2>Create Job</h2>'
		+'<table style="width:100%">'
		+'<tr><th>Job Type</th><td><select id="fm-popup-form_id"/></td></tr>'
		+'<tr><th>Preferred Time</th><td><input id="fm-popup-meeting_time" disabled autocomplete="off"/></td></tr>'
		+'<tr><th>Notes</th><td><textarea id="fm-popup-notes"></textarea></td></tr>'
		+'<tr class="fm-small"><th>Name</th><td><input id="fm-popup-name"/></td></tr>'
		+'<tr class="fm-small"><th>Phone</th><td><input id="fm-popup-phone"/></td></tr>'
		+'<tr class="fm-small"><th>Email</th><td><input id="fm-popup-email"/></td></tr>'
		+'<tr class="fm-small"><th>Reference #</th><td><input id="fm-popup-cust-ref"/></td></tr>'
		+'</table>'
		+'<div class="fm-action-buttons">'
		+'<button class="fm-action-create" disabled>Create</button>'
		+'<button class="fm-action-cancel">Cancel</button>'
		+'</div></div>')
		.insertAfter($el)
		.css({
			'z-index':9998 // calendar popup has z-index 9999
		})
		.on('click', '.fm-action-cancel', ()=>{
			$dialog.remove();
			$shader.remove();
		})
		.on('click', '.fm-action-create', ()=>{
			var when=$('#fm-popup-meeting_time').val(), form_id=$('#fm-popup-form_id').val(), notes=$('#fm-popup-notes').val();
			var name=$('#fm-popup-name').val(), phone=$('#fm-popup-phone').val(), email=$('#fm-popup-email').val();
			var custref=$('#fm-popup-cust-ref').val();
			if (name || phone || email || custref) {
				notes+='\n\n--';
				if (name) {
					notes+='\nName: '+name;
				}
				if (phone) {
					notes+='\nPhone: '+phone;
				}
				if (email) {
					notes+='\nEmail: '+email;
				}
				if (custref) {
					notes+='\nCustomer Job Ref: '+custref;
				}
			}
			
			if (!/^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/.test(when)) {
				return alert('please choose a prefered job date/time');
			}
			if (!+form_id) {
				return alert('please choose a job type');
			}
			$.post(fm.url+'Job_new',
				fm.fns.getPayLoad({when:when, form_id:form_id, notes:notes, job_ref_customer:custref, asset_id:asset_id}),
				function(ret) {
					if (!ret.ok) {
						return alert((ret||{
							'error':'unknown error'
						}).error);
					}
					alert('Job created');
					$dialog.find('.fm-action-cancel').click();
					if ($view.draw) {
						$view.draw();
					}
				}
			);
		});
	$('#fm-popup-name').val(fm.contact.name);
	$('#fm-popup-email').val(fm.contact.email);
	$('#fm-popup-phone').val(fm.contact.mobile);
	fm.fns.requireDateTimePicker(function() {
		$('#fm-popup-meeting_time')
			.datetimepicker({
				format: 'Y-m-d H:i:s',
				minDate:0,
				value:'',
				allowBlank:true,
				defaultSelect:false,
				formatTime:(fm.time_format=='24h'?'H:i':'g:i A'),
				onGenerate:()=>{
					var $cal=$('.xdsoft_datepicker.active');
					if (!$cal.length) {
						return;
					}
					var $td=$cal.find('tbody tr:first-child td:first-child');
					var d=[$td.data('year'), $td.data('month'), $td.data('date')];
					var form_id=$('#fm-popup-form_id').val();
					var $current=$cal.find('.xdsoft_date.xdsoft_current');
					var $tds=$cal.find('.xdsoft_date:not(.xdsoft_disabled)');
					$tds.addClass('xdsoft_disabled');
					$.post(fm.url+'Form_checkSlots', fm.fns.getPayLoad({id:form_id,start:d}), ret=>{
						if (!$current.length) {
							$cal.next('.xdsoft_timepicker').removeClass('active');
						}
						if (!ret || !ret.slots || !ret.slots.enabled) {
							$tds.removeClass('xdsoft_disabled');
						}
						else {
							var ds={};
							if (ret.slots.upcoming) {
								ret.slots.upcoming.forEach(u=>{
									ds[u.d]=+u.ids;
								});
							}
							var d=new Date;
							for (var i=0;i<ret.slots.notice;++i) {
								var dy=d.getFullYear(), dm=d.getMonth()+1, dd=d.getDate();
								ds[dy+'-'+dm+'-'+dd]=ret.slots.slots;
								d.setDate(d.getDate()+1);
							}
							$tds.each((k, v)=>{
								var $td=$(v), date=$td.data('year')+'-'+(+$td.data('month')+1)+'-'+$td.data('date');
								date=date.replace('/-([1-z])-/', '-0$1-');
								date=date.replace('/-([1-z])$/', '-0$1');
								var show=0;
								var t=new Date(date);
								var day=t.getDay();
								if (ret.slots.days[day]) {
									if (ds[date]) {
										if (ds[date]<ret.slots.slots) {
											show=1;
										}
									}
									else {
										show=1;
									}
								}
								if (show) {
									$td.removeClass('xdsoft_disabled');
								}
							});
						}
					});
				},
				onSelectDate:()=>{
					var $cal=$('.xdsoft_datepicker.active');
					$cal.next('.xdsoft_timepicker').addClass('active');
					$('.fm-action-create').prop('disabled', false);
				}
			});
	});
	function showForms() {
		if (!fm.forms_pickable) {
			$.post(fm.url+'Forms_list', fm.fns.getPayLoad({'pickable':1}), function(ret) {
				if (!ret || ret.error) {
					return alert(ret.error || 'failed to load forms list');
				}
				ret.sort(function(a, b) {
					return a.name<b.name;
				});
				fm.forms_pickable=ret;
				showForms();
			});
			return;
		}
		var opts=['<option value="0"> -- </option>'];
		for (var i=0;i<fm.forms_pickable.length;++i) {
			opts.push($('<option value="'+fm.forms_pickable[i].id+'"/>').text(fm.forms_pickable[i].name));
		}
		$('#fm-popup-form_id')
			.append(opts)
			.change(function() {
				var id=$(this).val();
				if (id) {
					$('#fm-popup-meeting_time').prop('disabled', false);
				}
				else {
					$('#fm-popup-meeting_time').val('').prop('disabled', true);
				}
			});
	}
	showForms();
};
