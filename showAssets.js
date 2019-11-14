/* global fm */
fm.fns.showAssets=function() {
	$('#fm-menu a').removeClass('fm-selected');
	$('#fm-menu a.fm-link-assets').addClass('fm-selected');
	fm.fns.requireDataTables(function() {
		var $content=fm.$wrapper.find('#fm-content').empty().html('<h1>Assets</h1>');
		// { build table HTML
		var $tableDom=$('<table style="width:100%"><thead>'
			+'<tr>'
			+'<td>&nbsp;</td>'
			+'<td>&nbsp;</td>'
			+'<td><input id="fm-asset-name" placeholder="search names"/></td>'
			+'<td><input id="fm-asset-code" placeholder="search codes"/></td>'
			+'<td>&nbsp;</td>'
			+'</tr>'
			+'<tr>'
			+'<th>ID</th>'
			+'<th>Location</th>'
			+'<th>Name</th>'
			+'<th>Code</th>'
			+'<th>Changes</th>'
			+'</tr>'
			+'</thead><tbody/></table>')
			.appendTo($content);
		// }
		// { build the DataTable
		var $table=$tableDom.DataTable({
			ajax:(data, callback)=>{
				delete data.columns;
				data.name=$('#fm-asset-name').val()||undefined;
				data.code=$('#fm-asset-code').val()||undefined;
				$.post(fm.url+'Assets_getDT', fm.fns.getPayLoad(data), callback);
			},
			columns:[ // {
				{'class':'fm-col-id'},
				{'class':'fm-col-location'},
				{'class':'fm-col-name'},
				{'class':'fm-col-code'},
				{'class':'fm-col-changes', 'orderable':false},
			], // }
			deferRender:true,
			paginationType:'full_numbers',
			processing:true,
			rowCallback: function(row, data) {
				$('td.fm-col-id', row).text(data[0]);
				$(row).data('id', +data[0]);
				$('td.fm-col-location', row).text(data[1][1]||'');
				$('td.fm-col-name', row).text(data[2]||'');
				$('td.fm-col-code', row).text(data[3]||'');
				$('<button class="fm-changes">Changes</button>').appendTo($('td.fm-col-changes', row).empty());
			},
			drawCallback:function() {
				var tw=$tableDom.width(), cw=$content.width();
				if (tw>cw) {
					$tableDom.css('zoom', (cw-4)/tw);
				}
				else {
					$tableDom.css('zoom', 1);
				}
			},
			searching:false,
			serverSide:true,
		});
		$tableDom
			.on('click', '.fm-changes', function() {
				$.post(fm.url+'Asset_changes', fm.fns.getPayLoad({'id':$(this).closest('tr').data('id')}), function(ret) {
					if (ret.error) {
						return alert(ret.error);
					}
					var $dialog=$('<div>'
						+'</div>')
						.dialog({
							'title':'Details of recorded changes in the asset',
							'modal':true,
							'width':640,
							'close':function() {
								$dialog.remove();
							},
							'dialogClass':'test'
						});
					if (!ret.length) {
						return $dialog.text('no changes recorded');
					}
					var $table=$('<table style="width:100%"><thead><tr><th>Date</th><th>User</th><th>Value</th><th>Was</th><th>Now</th></tr></thead><tbody/></table>')
						.appendTo($dialog);
					for (var i=0;i<ret.length;++i) {
						var $tr=$('<tr/>').appendTo($table);
						$('<td class="fm-date"/>').text(fm.fns.dateFormat(ret[i].cdate)).appendTo($tr);
						$('<td class="fm-user"/>').text(ret[i].username).appendTo($tr);
						$('<td class="fm-value"/>').text(ret[i].name).appendTo($tr);
						$('<td class="fm-was"/>').text(ret[i].val_was).appendTo($tr);
						$('<td class="fm-now"/>').text(ret[i].value).appendTo($tr);
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
