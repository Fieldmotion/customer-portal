fm.fns.showFiles=function() {
	$('#fm-menu a').removeClass('fm-selected');
	$('#fm-menu a.fm-link-files').addClass('fm-selected');
	fm.fns.requireDataTables(function() {
		var $content=fm.$wrapper.find('#fm-content').empty().html('<h1>Files</h1>');
		// { build table HTML
		var $tableDom=$('<table style="width:100%"><thead>'
			+'<tr><th>ID</th>'
			+'<th>Filename</th>'
			+'<th>Description</th>'
			+'<th>Created</th>'
			+'<th>Notes</th>'
			+'</tr>'
			+'</thead><tbody/></table>')
			.appendTo($content);
		// }
		// { build the DataTable
		var $table=$tableDom.DataTable({
			'ajax':(data, callback, settings)=>{
				delete data.columns;
				$.post(fm.url+'Files_getDT', fm.fns.getPayLoad(data), callback);
			},
			'columns':[ // {
				{'class':'fm-col-id'},
				{'class':'fm-col-filename'},
				{'class':'fm-col-description', 'orderable':false},
				{'class':'fm-col-created'},
				{'class':'fm-col-notes', 'orderable':false},
			], // }
			'deferRender':true,
			'paginationType':'full_numbers',
			'processing':true,
			'rowCallback': function(row, data, idx) {
				$('td.fm-col-id', row).text(data[0]);
				$(row).data('id', +data[0]);
				$('<a href="#" class="fm-download" style="display:block"/>').text(data[1]).appendTo($('td.fm-col-filename', row).empty());
				$('td.fm-col-description', row).text(data[2]);
				$('td.fm-col-created', row).text(fm.fns.dateFormat(data[3]));
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
				$.post(fm.url+'File_get', fm.fns.getPayLoad({'id':$(this).closest('tr').data('id')}), function(ret) {
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