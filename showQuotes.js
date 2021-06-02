/* global fm */
fm.fns.showQuotes=function() {
	$('#fm-menu a').removeClass('fm-selected');
	$('#fm-menu a.fm-link-quotes').addClass('fm-selected');
	fm.fns.requireDataTables(function() {
		var $content=fm.$wrapper.find('#fm-content').empty().html('<h1>Quotes</h1>');
		// { build table HTML
		var $tableDom=$('<table style="width:100%"><thead>'
			+'<tr><th>ID</th>'
			+'<th>Num</th>'
			+'<th>Form</th>'
			+'<th>Customer/Asset</th>'
			+'<th>Created</th>'
			+'<th>Total</th>'
			+'<th>Discount %</th>'
			+'<th>Notes</th>'
			+'<th>Status</th>'
			+'<th>Download</th>'
			+'</tr>'
			+'</thead><tbody/></table>')
			.appendTo($content);
		// }
		// { build the DataTable
		var $table=$tableDom.DataTable({
			'ajax':(data, callback)=>{
				delete data.columns;
				$.post(fm.url+'Quotes_getDT', fm.fns.getPayLoad(data), callback);
			},
			'columns':[ // {
				{'class':'fm-col-id', 'visible':false},
				{'class':'fm-col-num'},
				{'class':'fm-col-form'},
				{'class':'fm-col-customer'},
				{'class':'fm-col-created'},
				{'class':'fm-col-total'},
				{'class':'fm-col-discount'},
				{'class':'fm-col-notes', 'visible':false},
				{'class':'fm-col-status'},
				{'class':'fm-col-download'},
			], // }
			'deferRender':true,
			'paginationType':'full_numbers',
			'processing':true,
			'rowCallback': function(row, data) {
				var statuses={'-1':'DRAFT', '0':'Quoted', '1':'Job Created', '2':'Paid', '3':'Cancelled'};
				$('td.fm-col-id', row).text(data[0]);
				$(row).data('id', +data[0]);
				$('td.fm-col-num', row).text(data[1]);
				$('td.fm-col-form', row).text(data[2]);
				$('td.fm-col-customer', row).text(data[3]);
				$('td.fm-col-created', row).text(fm.fns.dateFormat(data[4]));
				$('td.fm-col-total', row).text((+data[5]).toFixed(2));
				$('td.fm-col-discount', row).text(((+data[6]).toFixed(0))+'%');
				$('td.fm-col-notes', row).text(data[7]);
				$('td.fm-col-status', row).text(statuses[data[8]]);
				$('<button class="fm-download">Download</button>').appendTo($('td.fm-col-download', row).empty());
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
			.on('click', '.fm-download', function() {
				$.post(fm.url+'Quote_download', fm.fns.getPayLoad({'id':$(this).closest('tr').data('id')}), function(ret) {
					if (ret.error) {
						return alert(ret.error);
					}
					if (ret.url) {
						var $form=$('<form target="_blank"/>').prop('action', ret.url).appendTo('body');
						$form.submit().remove();
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
};
