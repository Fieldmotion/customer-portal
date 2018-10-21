fm.fns.popupJobNew=function($view) {
	var $dialog=$('<div id="fm-popup-job-new"><table style="width:100%">'
		+'<tr><th>When</th><td><input id="fm-popup-meeting_time"/></td></tr>'
		+'<tr><th>Job Type</th><td><select id="fm-popup-form_id" style="width:100%"/></td></tr>'
		+'<tr><th>Notes</th><td><textarea id="fm-popup-notes" style="width:100%"/></td></tr>'
		+'</table></div>')
		.dialog({
			'title':'Create Job',
			'close':function() {
				$dialog.remove();
			},
			'modal':true,
			'buttons':{
				'Create':function() {
					var when=$('#fm-popup-meeting_time').val(), form_id=$('#fm-popup-form_id').val(), notes=$('#fm-popup-notes').val();
					if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(when)) {
						return alert('please choose a prefered job date/time');
					}
					if (!+form_id) {
						return alert('please choose a job type');
					}
					$.post(fm.url+'Job_new', fm.fns.getPayLoad({'when':when, 'form_id':form_id, 'notes':notes}), function(ret) {
						if (!ret.ok) {
							return alert((ret||{'error':'unknown error'}).error);
						}
						alert('Job created');
						$dialog.remove();
						if ($view.draw) {
							$view.draw();
						}
					});
				}
			}
		});
	$('#fm-popup-meeting_time').val((new Date).toYMDHIS());
	fm.fns.requireDateTimePicker(function() {
		$('#fm-popup-meeting_time')
			.datetimepicker({
				'format': 'Y-m-d H:i:s',
				'minDate':0,
				'formatTime':(fm.time_format=='24h'?'H:i':'g:i A'),
			})
	});
	function showForms() {
		if (!fm.forms) {
			$.post(fm.url+'Forms_list', fm.fns.getPayLoad(), function(ret) {
				if (!ret || ret.error) {
					return alert(ret.error || 'failed to load forms list');
				}
				ret.sort(function(a, b) {
					return a.name<b.name;
				});
				fm.forms=ret;
				showForms();
			});
			return;
		}
		var opts=['<option value="0"> -- </option>'];
		for (var i=0;i<fm.forms.length;++i) {
			opts.push($('<option value="'+fm.forms[i].id+'"/>').text(fm.forms[i].name));
		}
		$('#fm-popup-form_id').append(opts);
	}
	showForms();
}
