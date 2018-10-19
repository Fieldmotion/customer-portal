fm.fns.showInvoices=function() {
	$('#fm-menu a').removeClass('fm-selected');
	$('#fm-menu a.fm-link-invoices').addClass('fm-selected');
	fm.fns.requireDataTables(function() {
		var $content=fm.$wrapper.find('#fm-content').empty().html('<h1>Invoices</h1>');
		// { build table HTML
		var $tableDom=$('<table style="width:100%"><thead>'
			+'<tr><th>ID</th>'
			+'<th>Num</th>'
			+'<th>Job</th>'
			+'<th>Created</th>'
			+'<th>Total</th>'
			+'<th>Paid</th>'
			+'<th>Notes</th>'
			+'<th>Status</th>'
			+'<th>Download</th>'
			+'</tr>'
			+'</thead><tbody/></table>')
			.appendTo($content);
		// }
		// { build the DataTable
		var $table=$tableDom.DataTable({
			'ajax':(data, callback, settings)=>{
				delete data.columns;
				$.post(fm.url+'Invoices_getDT', fm.fns.getPayLoad(data), callback);
			},
			'columns':[ // {
				{'class':'fm-col-id', 'visible':false},
				{'class':'fm-col-num'},
				{'class':'fm-col-job'},
				{'class':'fm-col-created'},
				{'class':'fm-col-total'},
				{'class':'fm-col-paid'},
				{'class':'fm-col-notes'},
				{'class':'fm-col-status'},
				{'class':'fm-col-download'},
			], // }
			'deferRender':true,
			'paginationType':'full_numbers',
			'processing':true,
			'rowCallback': function(row, data, idx) {
				var statuses={'-1':'DRAFT', '0':'Quoted', '1':'Invoiced', '2':'Paid', '3':'Cancelled'};
				$('td.fm-col-id', row).text(data[0]);
				$(row).data('id', +data[0]);
				$('<a href="#" class="fm-download" style="display:block"/>').text(data[1]).appendTo($('td.fm-col-filename', row).empty());
				$('td.fm-col-num', row).text(data[1]);
				$('td.fm-col-job', row).text(fm.fns.datetimeFormat(data[2][1]));
				$('td.fm-col-created', row).text(fm.fns.dateFormat(data[3]));
				$('td.fm-col-total', row).text((+data[4]).toFixed(2));
				$('td.fm-col-paid', row).text((+data[5]).toFixed(2));
				$('td.fm-col-notes', row).text(data[6]);
				$('td.fm-col-status', row).text(statuses[data[7]]);
			},
			'drawCallback':function() {
				var tw=$tableDom.width(), cw=$content.width();
				if (tw>cw) {
					$tableDom.css('zoom', (cw-4)/tw);
				}
				else {
					$tableDom.css('zoom', 1);
				}
			},
			'serverSide':true,
		});
		$tableDom
			.on('click', 'a.fm-download', function() {
				$.post(fm.url+'Invoice_download', fm.fns.getPayLoad({'id':$(this).closest('tr').data('id')}), function(ret) {
					if (ret.error) {
						return alert(ret.error);
					}
					if (ret.url) {
						document.location=ret.url;
					}
				});
				return false;
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
	});
	return false;
}
