/* global fm */
fm.fns.showJobsList=function() {
	$('#fm-menu a').removeClass('fm-selected');
	$('#fm-menu a.fm-link-list').addClass('fm-selected');
	if (!fm.job_statuses) { // make sure page knows the Statuses list
		$.post(fm.url+'Jobs_listStatuses', fm.fns.getPayLoad(), function(ret) {
			fm.job_statuses=ret.statuses;
			fm.fns.showJobsList();
		});
		return;
	}
	if (!fm.job_priorities) { // make sure page knows the Prioritieslist
		$.post(fm.url+'Jobs_listPriorities', fm.fns.getPayLoad(), function(ret) {
			fm.job_priorities=ret.priorities;
			fm.fns.showJobsList();
		});
		return;
	}
	var daysFrom=localStorage.fmPortalDaysFrom||-7;
	var daysTo=localStorage.fmPortalDaysTo||7;
	fm.fns.requireDataTables(function() {
		var $content=fm.$wrapper.find('#fm-content').empty().html('<h1>Jobs List</h1><div id="fm-bar"><label>From: <input type="hidden" id="fm-date-from"/></label><label>To: <input id="fm-date-to" type="hidden"/></select></label></div>');
		// { build table HTML
		var $tableDom=$('<table style="width:100%"><thead>'
			+'<tr><th>ID</th>'
			+'<th>Customer</th>'
			+'<th title="Job Reference">Ref.<br/>ours/yours</th><th>Priority</th>'
			+'<th>Notes</th><th title="Date Created">Created</th><th>Due</th>'
			+'<th title="Appointment Date">Job Date</th>'
			+'<th title="Department / Job Type">Dept./Type</th>'
			+'<th title="User">User</th><th>Status</th><th/></tr>'
			+'<tr><td/><td/><td><input id="fm-filter-job-ref"/></td><td/><td/><td/><td/><td/>'
			+'<td/><td/><td><select id="fm-filter-status"><option value=""/></select></td><td/></tr>'
			+'</thead><tbody/></table>')
			.appendTo($content);
		// }
		// { dates
		$('#fm-date-from').val(daysFrom);
		$('#fm-date-to').val(daysTo);
		$('#fm-date-from, #fm-date-to')
			.each(function() {
				var $this=$(this);
				var days=+$this.val();
				var now=new Date();
				now.setHours(0);
				now.setMinutes(0);
				now.setSeconds(0);
				now.setMilliseconds(0);
				var then=new Date();
				then.setDate(now.getDate()+days);
				var $date=$('<input class="date"/>')
					.change(function() {
						var d=$(this).datepicker('getDate');
						$this.val(Math.ceil((d-now-7200000) / 86400000)).change();
					})
					.insertAfter($this);
				fm.fns.datePicker([$date, then.toYMD()]);
			})
			.change(function() {
				daysFrom=$('#fm-date-from').val();
				daysTo=$('#fm-date-to').val();
				localStorage.portalDaysFrom=daysFrom;
				localStorage.portalDaysTo=daysTo;
				$table.draw(false);
			})
			.blur();
		// }
		// { add statuses filter
		var statuses=[];
		for (var i=0;i<fm.job_statuses.length;++i) {
			statuses[i]=$('<option value="'+i+'"/>').text(fm.job_statuses[i]);
		}
		$tableDom.find('#fm-filter-status').append(statuses);
		// }
		// { build the DataTable
		var largestW=0, $searchEl;
		var $table=$tableDom.DataTable({
			'ajax':(data, callback)=>{
				delete data.columns;
				data.job_ref=$('#fm-filter-job-ref').val();
				data.date_from=+$('#fm-date-from').val();
				data.date_to=+$('#fm-date-to').val();
				data.search={
					value:$searchEl&&$searchEl.val()
				};
				data.status=$('#fm-filter-status').val();
				$.post(fm.url+'Jobs_getDT', fm.fns.getPayLoad(data), callback);
			},
			'columns':[ // {
				{'class':'fm-col-id'},
				{'class':'fm-col-customer'},
				{'class':'fm-col-ref'},
				{'class':'fm-col-priority', 'orderable':false},
				{'class':'fm-col-notes', 'orderable':false},
				{'class':'fm-col-created', 'visible':false},
				{'class':'fm-col-due', 'visible':false},
				{'class':'fm-col-job_date'},
				{'class':'fm-col-dept'},
				{'class':'fm-col-user'},
				{'class':'fm-col-status', 'orderable':false},
				{'class':'fm-col-other', 'orderable':false},
			], // }
			'deferRender':true,
			'initComplete':()=>{
				var $wrapper=$tableDom.closest('.dataTables_wrapper');
				$wrapper
					.prepend('<div class="dataTables_filter fm-search-general"><label>Search:<input type="search"/></label></div>');
				$wrapper.find('input')
					.bind('keyup', ()=>{
						clearTimeout(window.fm_timer);
						window.fm_timer=setTimeout(()=>{
							$table.draw();
						}, 500);
					});
				$searchEl=$wrapper.find('.fm-search-general input');
			},
			'paginationType':'full_numbers',
			'processing':true,
			'rowCallback': function(row, data) {
				$('td.fm-col-customer', row).text(data[1][2]);
				var ref=data[2];
				if (typeof ref!='object') {
					ref=[ref, ''];
				}
				$('td.fm-col-ref', row).empty().append([
					$('<span class="fm-col-ref-ours"/>').text(ref[0]),
					' / ',
					$('<span class="fm-col-ref-yours"/>').text(ref[1])
				]);
				$('td.fm-col-priority', row).text(fm.job_priorities[data[3]]||'');
				// { notes
				if (!data[4]) {
					data[4]='[]';
				}
				else if (/^[^[{]/.test(data[4])) {
					data[4]=JSON.stringify([
						{'content':data[4]}
					]);
				}
				var notes=[], ns;
				try {
					ns=JSON.parse(data[4]);
				}
				catch (e) {
					ns=[];
				}
				if (ns && ns.length) {
					for (var i=0;i<ns.length;++i) {
						if (ns[i].content) {
							notes.push(ns[i].content);
						}
					}
				}
				if (notes.length) {
					$('<button/>')
						.text(notes.length)
						.appendTo($('td.fm-col-notes', row).empty())
						.prop('title', notes.join('\n'));
				}
				else {
					$('td.fm-col-notes', row).text('');
				}
				// }
				var $table2=$('<table><tr><td colspan="2" title="job date/time"></td></tr><tr class="fm-job-dates"><td title="date created"/><td title="due date"/></tr></table>');
				$table2.find('tr:first-child td').text(fm.fns.datetimeFormat(data[7]));
				$table2.find('tr:nth-child(2) td:first-child').text(fm.fns.dateFormat(data[5]));
				$table2.find('tr:nth-child(2) td:nth-child(2)').text(fm.fns.dateFormat(data[6]));
				$('td.fm-col-job_date', row).empty().append($table2);
				$('td.fm-col-dept', row).empty().append([$('<div class="fm-dept" title="department"/>').html(data[8][0]), $('<div class="fm-form" title="job type"/>').html(data[8][1])]);
				$('td.fm-col-user', row).text(data[9]);
				$('td.fm-col-status', row).text(fm.job_statuses[data[10]]);
				// { show report or authorisation button
				var s=+data[10];
				var stat=fm.appointment_statuses[s];
				var $other=$('td.fm-col-other', row).empty();
				if (s==3) { // authorise
					$('<button/>')
						.text(fm.job_statuses[s]||'Authorisation Needed')
						.click(function() {
							var $dialog=$('<p>Do you wish to authorise this job?</p>').dialog({
								'modal':true,
								'close':function() {
									$dialog.remove();
								},
								'buttons':{
									'Yes':function() {
										$.post(fm.url+'Job_authorise', fm.fns.getPayLoad({'id':data[0]}), function(ret) {
											if (ret.error) {
												return alert(ret.error);
											}
											$dialog.remove();
											$table.draw();
										});
									},
									'No':function() {
										$dialog.remove();
									}
								}
							});
						})
						.appendTo($other);
				}
				if ((stat.portal_report!==undefined && +stat.portal_report)
					|| (stat.portal_report===undefined && s==2)
				) { // download report
					$('<button/>')
						.text('Report')
						.click(function() {
							$.post(fm.url+'Job_getReport', fm.fns.getPayLoad({'id':data[0]}), function(ret) {
								if (ret.error) {
									return alert(ret.error);
								}
								if (ret.url) {
									document.location=ret.url;
								}
							});
							return false;
						})
						.appendTo($other);
				}
				$other.filter(':empty').text('--').attr('title', 'Report not available until the job is marked as '+fm.job_statuses[2]);
				// }
			},
			'drawCallback':function() {
				var tw=$tableDom.width(), cw=$content.width();
				if (tw<=largestW) {
					return;
				}
				if (tw>cw) {
					$tableDom.css('zoom', (cw-4)/tw);
				}
				else {
					$tableDom.css('zoom', 1);
				}
				largestW=$tableDom.width();
			},
			'searching':false,
			'serverSide':true,
		});
		$tableDom
			.find('thead input,thead select')
			.on('click', function() {
				return false;
			})
			.on('change', function() {
				$table.draw();
			});
		// }
		if (fm.job_creation) {
			$('<button>Create Job</button>')
				.on('click', function() {
					var $el=$(this);
					fm.fns.whenFunctionsExist(['popupJobNew'], function() {
						fm.fns.popupJobNew($table, $el);
					});
				})
				.prependTo('#fm-bar');
		}
	});
	return false;
};
