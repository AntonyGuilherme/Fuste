/*jshint browser:true */
/* eslint-env browser */
/*global Uint8Array, console */
/*global XLSX */
/* exported b64it, setfmt */
/* eslint no-use-before-define:0 */




var X = XLSX;
var XW = {
	/* worker message */
	msg: 'xlsx',
	/* worker scripts */
	worker: './xlsxworker.js'
};

var global_wb;

var process_wb = (function() {
	

	 to_json = function to_json(workbook) {
		var result = {};
		workbook.SheetNames.forEach(function(sheetName) {
            var data = X.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1});
           
			if(data.length) result = data;
        });
       
		return result;
	};



	return function process_wb(wb) {
       
        var output = to_json(wb);
        constructor_data_calc(output);
		
	};
})();

var matrix_x=[];
var matrix_y=[];



//function ness
var do_file = (function() {
	

	
	

	
//function ness
	return function do_file(files) {
		getNameFile(files[0].name);
		var f = files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
            if(typeof console !== 'undefined')
             console.log("onload", new Date());
			var data = e.target.result;
			 data = new Uint8Array(data);
			
			 process_wb(X.read(data, {type: false ? 'binary' : 'array'}));
		};
		
		 reader.readAsArrayBuffer(f);
	};
})();

//function ness
(function() {
	var drop = document.getElementById('drop');
	if(!drop.addEventListener) return;

	function handleDrop(e) {
		
		e.stopPropagation();
		e.preventDefault();
		do_file(e.dataTransfer.files);
	}

	function handleDragover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	}
	
	drop.addEventListener('dragenter', handleDragover, false);
	drop.addEventListener('dragover', handleDragover, false);
	drop.addEventListener('drop', handleDrop, false);
})();

(function() {
	var xlf = document.getElementById('xlf');
	if(!xlf.addEventListener) return;
	function handleFile(e) { do_file(e.target.files); }
	xlf.addEventListener('change', handleFile, false);
})();



// for(var i=0;i<array_data.length;i++){
		 //preencher_tabela(array_data[i][0],array_data[i][1],array_data[i][2],i,array_data);
// }

/**
 * 
 * @param { any[][] } array_data - Planilha
 */

function constructor_data_calc(array_data){

	
	const data = array_data.filter(row => row[2] !== undefined).map( row => {

		if(typeof row[0] === 'string'){ // title
			return [row] ;
		}

			const CAP = String(row[2]).replace('.',',').split(',').map(el => el);
			
			const value = CAP.map((cap , index) => {

				const copy = row.map(_=>_);
				copy[2]= cap ;
				copy[1] = index + 1 ;

				return copy;

			});
			
			return value;

		

	});

	const values = [];

	for(let row of data){
		for(let column of row)
			if(column[2] != undefined)
				values.push(column)
	}
	
/* initial table */
	const  text_name_file = document.getElementById('campo_name_project').value;
	

	const ws = XLSX.utils.aoa_to_sheet(values);
	const html_string = XLSX.utils.sheet_to_html(ws, { id: "data-table", editable: true });
	document.getElementById("container").innerHTML = html_string;

	doit('xlsx' , text_name_file ? text_name_file : 'NomePlanilha' );


  
}


function doit(type , name = 'NomePlanilha') {
	var elt = document.getElementById('data-table');
	var wb = XLSX.utils.table_to_book(elt, {sheet:"Sheet JS"});

	return	XLSX.writeFile(wb, (name+'.' + (type || 'xlsx')));
}




function preencher_tabela(text1,text2,text3,index,array_data){

	var table=document.getElementById('planilha');
	//criando os elementos da tabela
	const tr = document.createElement('tr');
	const coluna_1 = document.createElement('th');
	const coluna_2=document.createElement('th');
	const coluna_3=document.createElement('th');
	
	var classe="";

	if(index===0){
	 	classe="coluna_title";
	 	coluna_1.innerText = text1;
		coluna_2.innerText = text2;
		coluna_3.innerText=text3;
	}
	else{
	 	classe="coluna_comum";
		const campo_1 = document.createElement('input');
		const campo_2=document.createElement('input');
		const campo_3=document.createElement('input');

		campo_1.type="number";
		campo_2.type="number";
		campo_3.type="number";

		campo_1.className="campo_comum";
		campo_2.className="campo_comum";
		campo_3.className="campo_comum";


		campo_1.oninput=function(){
			array_data[index][0]=campo_1.valueAsNumber;
			
		};
		campo_2.oninput=function(){
			array_data[index][1]=campo_2.valueAsNumber;
		};
		campo_3.oninput=function(){
			array_data[index][2]=campo_3.valueAsNumber;
		};

		campo_1.value = text1;
		campo_2.value = text2;
		campo_3.value=text3;

		coluna_1.appendChild(campo_1);
		coluna_2.appendChild(campo_2);
		coluna_3.appendChild(campo_3);

	}
	coluna_1.className=classe;
	coluna_2.className=classe;
	coluna_3.className=classe;

	
	
	//injetando os elementos na linha

	tr.appendChild(coluna_1);
	tr.appendChild(coluna_2);
	tr.appendChild(coluna_3);
	
	
	//injetando a linha na tabela
	
	table.appendChild(tr);
}


function getNameFile(namefile) {
	
	//var text_name_file=document.getElementById('fileselected');
	//text_name_file.innerText=namefile;
}



 function ajustar_dados(array_data){
				var dados_ajustados=[];
				
				array_data.forEach(function(item,index){
					if(index>0){
					matrix_x.push(item[0]);
					matrix_y.push(item[1]);	
				}
				});

				dados_ajustados.push(matrix_x,matrix_y);

				return dados_ajustados;
				
	}




			
		  




