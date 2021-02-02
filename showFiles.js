/* global fm */
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
			+'<th>Tags</th>'
			+'<th>Created</th>'
			+'<th>Notes</th>'
			+'</tr>'
			+'</thead><tbody/></table>')
			.appendTo($content);
		// }
		// { build the DataTable
		var $table=$tableDom.DataTable({
			'ajax':(data, callback)=>{
				delete data.columns;
				$.post(fm.url+'Files_getDT', fm.fns.getPayLoad(data), callback);
			},
			'columns':[ // {
				{'class':'fm-col-id'},
				{'class':'fm-col-filename'},
				{'class':'fm-col-description', 'orderable':false},
				{'class':'fm-col-tags'},
				{'class':'fm-col-created'},
				{'class':'fm-col-notes', 'orderable':false},
			], // }
			'deferRender':true,
			'paginationType':'full_numbers',
			'processing':true,
			'rowCallback': function(row, data) {
				$('td.fm-col-id', row).text(data[0]);
				$(row).data('id', +data[0]);
				$('<a href="#" class="fm-download" style="display:block"/>').html(data[1]).appendTo($('td.fm-col-filename', row).empty());
				$('td.fm-col-description', row).html(data[2]);
				// { tags
				var $tags=data[5];
				var tagsArr=$tags.split('\n');
				var tagshtml='';
				for(var i=0;i<tagsArr.length;i++){
					if(tagsArr[i].length){
						tagshtml+='<span class="tag" style="background-color:#7a799e;font-size:0.8em;padding:0.3em;color:#e0e0e8;margin:0.2em;border-radius:3px;">'+tagsArr[i]+'</span>';
					}
				}
				$('td.fm-col-tags', row).empty().html(tagshtml);
				//}
				$('td.fm-col-created', row).text(fm.fns.dateFormat(data[3]));
				// { notes
				var ns, notes=[];
				try{
					ns=JSON.parse(data[4]);
				}
				catch (e) {
					ns=[{
						'content':data[4]
					}];
				}
				if (ns && ns.length) {
					for (i=0;i<ns.length;++i) {
						if (ns[i].content) {
							notes.push(ns[i].content);
						}
					}
				}
				if (notes.length) {
					$('<button/>')
						.text(''+notes.length+' note'+(notes.length==1?'':'s'))
						.appendTo($('td.fm-col-notes', row).empty())
						.click(()=>{
							var rows=[];
							for (var i=0;i<notes.length;++i) {
								rows.push($('<p/>').text(notes[i]));
							}
							var zIndexHighest=()=>{
								var h=0;
								$('*').each(function() {
									if ($(this).zIndex()>h) {
										h=$(this).zIndex();
									}
								});
								return h+1;
							};
							var $dialog=$('<div/>').append(rows).dialog({
								'modal':true,
								'close':()=>{
									$dialog.remove();
								}
							});
							$dialog.parent().css('z-index', zIndexHighest());
						});
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
