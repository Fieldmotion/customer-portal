fm.fns.showJobsList=function() {
	if (!fm.job_statuses) { // make sure page knows the Statuses list
		$.post(fm.url+'Jobs/listStatuses.php', fm.fns.getPayLoad(), function(ret) {
			fm.job_statuses=ret.statuses;
			fm.fns.showJobsList();
		});
		return;
	}
	fm.fns.requireDataTables(function() {
		var $content=fm.$wrapper.find('#fm-content').empty();
		// { build table HTML
		var $tableDom=$('<table><thead>'
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
				$.post(fm.url+'Jobs/getDT.php', fm.fns.getPayLoad(data), callback);
			},
			'columns':[ // {
				{'width':'1%', 'class':'fm-col-id'},
				{'width':'15%', 'class':'fm-col-customer'},
				{'width':'6%', 'class':'fm-col-ref'},
				{'width':'6%', 'class':'fm-col-priority', 'orderable':false},
				{'width':'15%', 'class':'fm-col-notes', 'orderable':false},
				{'width':'10%', 'class':'fm-col-created'},
				{'width':'10%', 'class':'fm-col-due'},
				{'width':'10%', 'class':'fm-col-job_date'},
				{'width':'6%', 'class':'fm-col-dept'},
				{'width':'6%', 'class':'fm-col-user'},
				{'width':'10%', 'class':'fm-col-status', 'orderable':false},
				{'width':'4%', 'class':'fm-col-other', 'orderable':false},
			], // }
			'deferRender':true,
			'paginationType':'full_numbers',
			'processing':true,
			'rowCallback': function(row, data, idx) {
			},
			'serverSide':true,
		});
		// }
	});
}
