fm.fns.showJobsList=function() {
	$('#fm-menu a').removeClass('fm-selected');
	$('#fm-menu a.fm-link-list').addClass('fm-selected');
	if (!fm.job_statuses) { // make sure page knows the Statuses list
		$.post(fm.url+'Jobs/listStatuses.php', fm.fns.getPayLoad(), function(ret) {
			fm.job_statuses=ret.statuses;
			fm.fns.showJobsList();
		});
		return;
	}
	fm.fns.requireDataTables(function() {
		var $content=fm.$wrapper.find('#fm-content').empty().html('<h1>Jobs List</h1>');
		// { build table HTML
		var $tableDom=$('<table style="width:100%"><thead>'
			+'<tr><th>ID</th>'
			+'<th>Customer</th>'
			+'<th title="Job Reference">Ref.</th><th>Priority</th>'
			+'<th>Notes</th><th title="Date Created">Created</th><th>Due</th>'
			+'<th title="Appointment Date">Job Date</th>'
			+'<th title="Department">Dept.</th>'
			+'<th title="User">User</th><th>Status</th><th/></tr>'
			+'<tr><td/><td/><td><input id="fm-filter-job-ref"/></td><td/><td/><td/><td/><td/>'
			+'<td/><td/><td><select id="fm-filter-status"><option value=""/></select></td><td/></tr>'
			+'</thead><tbody/></table>')
			.appendTo($content);
		// }
		// { add statuses filter
		var statuses=[];
		for (var i=0;i<fm.job_statuses.length;++i) {
			statuses[i]=$('<option value="'+i+'"/>').text(fm.job_statuses[i]);
		}
		$tableDom.find('#fm-filter-status').append(statuses);
		// }
		// { build the DataTable
		var $table=$tableDom.DataTable({
			'ajax':(data, callback, settings)=>{
				delete data.columns;
				data.job_ref=$('#fm-filter-job-ref').val();
				data.status=$('#fm-filter-status').val();
				$.post(fm.url+'Jobs/getDT.php', fm.fns.getPayLoad(data), callback);
			},
			'columns':[ // {
				{'class':'fm-col-id'},
				{'class':'fm-col-customer'},
				{'class':'fm-col-ref'},
				{'class':'fm-col-priority', 'orderable':false},
				{'class':'fm-col-notes', 'orderable':false},
				{'class':'fm-col-created'},
				{'class':'fm-col-due'},
				{'class':'fm-col-job_date'},
				{'class':'fm-col-dept'},
				{'class':'fm-col-user'},
				{'class':'fm-col-status', 'orderable':false},
				{'class':'fm-col-other', 'orderable':false},
			], // }
			'deferRender':true,
			'paginationType':'full_numbers',
			'processing':true,
			'rowCallback': function(row, data, idx) {
				$('td.fm-col-customer', row).text(data[1][2]);
				// { notes
				var ns=JSON.parse(data[4]), notes=[];
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
						.prop('title', notes.join("\n"));
				}
				else {
					$('td.fm-col-notes', row).text('');
				}
				// }
				$('td.fm-col-created', row).text(data[5].replace(/ .*/, ''));
				$('td.fm-col-due', row).text(data[6].replace(/ .*/, ''));
				$('td.fm-col-job_date', row).text(data[7].replace(/ .*/, ''));
				$('td.fm-col-dept', row).text(data[8]);
				$('td.fm-col-user', row).text(data[9]);
				$('td.fm-col-status', row).text(fm.job_statuses[data[10]]);
			},
			'drawCallback':function() {
				console.log($tableDom.width(), $content.width());
				var tw=$tableDom.width(), cw=$content.width();
				if (tw>cw) {
					$tableDom.css('zoom', (cw-3)/tw);
				}
				else {
					$tableDom.css('zoom', 1);
				}
			},
			'serverSide':true,
		});
		// }
	});
}
