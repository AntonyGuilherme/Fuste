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

var process_wb = (function () {


	to_json = function to_json(workbook) {
		var result = {};
		workbook.SheetNames.forEach(function (sheetName) {
			var data = X.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

			if (data.length) result = data;
		});

		return result;
	};



	return function process_wb(wb) {

		var output = to_json(wb);
		constructor_data_calc(output);

	};
})();

var matrix_x = [];
var matrix_y = [];



//function ness
var do_file = (function () {






	//function ness
	return function do_file(files) {
		getNameFile(files[0].name);
		var f = files[0];
		var reader = new FileReader();
		reader.onload = function (e) {
			if (typeof console !== 'undefined')
				console.log("onload", new Date());
			var data = e.target.result;
			data = new Uint8Array(data);

			process_wb(X.read(data, { type: false ? 'binary' : 'array' }));
		};

		reader.readAsArrayBuffer(f);
	};
})();

//function ness
(function () {
	var drop = document.getElementById('drop');
	if (!drop.addEventListener) return;

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

(function () {
	var xlf = document.getElementById('xlf');
	if (!xlf.addEventListener) return;
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

const colunasDaPlanilha = [
	null,
	"codInterno",
	"idlocalidade",
	"cidade",
	"endereco",
	"proprietario",
	"area",
	"condicoes",
	"idResponsavel",
	"idStatus",
	"idStatus",
	"idStatus",
	"idStatus",
	"idStatus",
	"idStatus",
	"observacoes"
];


const Status = {
	DESCARTAR: 1,
	ESTUDO_SOLICITADO: 2,
	EM_ANALISE: 3,
	CONTRATO_SOLICITADO: 4,
	CONTRATO_ENVIADO: 5,
	ASSINADO: 6
};

const getStatusPeloIndex = (index_da_planilha) => {

	switch (index_da_planilha) {

		case 9: return Status.DESCARTAR;
		case 10: return Status.ESTUDO_SOLICITADO;
		case 11: return Status.EM_ANALISE;
		case 12: return Status.CONTRATO_SOLICITADO;
		case 13: return Status.CONTRATO_ENVIADO;
		case 14: return Status.ASSINADO;

	}

}

const localidades = {
	RJ: 4,
	GO: 7,
	RN: 6,
	SP: 5,
	MG: 3,
	DF: 2,
	AM: 1
}

const encontrarOIndexDoStatus = (linha) => {
	return linha.findIndex(elemento => elemento == "X" || elemento == "x");
};

const substituirIdStatusDaLinha = (linhaDaPlanilha) => {
	const indiceDoStatus = encontrarOIndexDoStatus(linhaDaPlanilha);
	linhaDaPlanilha[indiceDoStatus] = getStatusPeloIndex(indiceDoStatus);
}

const construirUmTerrenoAPartirDaLinha = (linhaDaPlanilha) => {

	substituirIdStatusDaLinha(linhaDaPlanilha);

	return linhaDaPlanilha.reduce((terreno, valorDoItem, indexDoItem) => {

		terreno[colunasDaPlanilha[indexDoItem]] = valorDoItem;

		return terreno;
	}, {});
}


const recuperandoOsResponsaveisDosTerrenos = (terrenos) => {
	return terrenos.map(terreno => terreno.idResponsavel);
}

/** @param {string[]} responsaveis  */
const agruparResponsaveisPeloNome = (responsaveis) => {

	return responsaveis.reduce((responsaveisAgrupados, responsavel) => {

		if (!responsaveisAgrupados.includes(responsavel)) {
			responsaveisAgrupados.push(responsavel);
		}

		return responsaveisAgrupados;

	}, []);

}

const tratarResponsaveisAPartirDosTerrenos = (terrenos) => {

	const responsaveis = recuperandoOsResponsaveisDosTerrenos(terrenos);
	const responsaveisNaoRepetidos = agruparResponsaveisPeloNome(responsaveis);
	return responsaveisNaoRepetidos;

}


const criarConsultaParaInsertDoObjeto = (nomeDaTabela) => (valor) => {

	const nomesDasColunas = Object.keys(valor);

	const consultaInicial = `INSERT INTO ${nomeDaTabela} (${nomesDasColunas.join(',')}) VALUES(`

	const valoresFormatados = nomesDasColunas.reduce((valoresFormatados, nomeDaColuna) => {

		if (valor[nomeDaColuna] != null){
			
			const valorDividido = String(valor[nomeDaColuna]).replaceAll("'","'''+'");
			valoresFormatados.push(`'${valorDividido}'`)
		}

		return valoresFormatados;
	}, [])
		.join(",");

	return consultaInicial.concat(valoresFormatados, ");")


}

const gerarInserts = (valores, Tabela) => valores.map(criarConsultaParaInsertDoObjeto(Tabela));

const mapearResponsaveis = (responsaveis) => {
	return responsaveis
		.filter(responsavel => responsavel != undefined && responsavel != 0)
		.map((responsavel, id) => ({ nome: responsavel, idResponsavel: (id + 1) }));
}

const criarInsertsParaOsResponsaveis = (responsaveisMapeados) => {

	return gerarInserts(responsaveisMapeados, "JTerrenosResponsaveis");

}

const localizarResponsavelPeloNome = (responsaveisMapeados) => (nome) => {

	const responsavel = responsaveisMapeados.find(responsavelMapeado => {
		return responsavelMapeado.nome == nome;
	});

	if (!responsavel) return null;

	return responsavel.idResponsavel;
}

const inserirResponsaveisNosTerrenos = (terrenos, responsaveisMapeados) => {

	const localizarResponsavel = localizarResponsavelPeloNome(responsaveisMapeados);

	return terrenos
		.map(terreno => {
			
			terreno.idResponsavel = localizarResponsavel(terreno.idResponsavel);

			if(terreno.idResponsavel == null)
				delete terreno.idResponsavel;

			return terreno;
		});

}

const inserirLocalidades = (terrenos) => {

	return terrenos.map(terreno => {

		if(terreno.idlocalidade && terreno.idlocalidade.trim().length){
			
			if(!localidades[terreno.idlocalidade.trim()]) console.log(terreno.idlocalidade)

			terreno.idlocalidade = localidades[terreno.idlocalidade.trim()];
		}else{
			delete terreno.idlocalidade;
		}
		return terreno;
	});

}

const  criarConteudoDoArquivoDeConsultas = (consultas) => {
	return consultas.reduce((conteudoDoArquivo, consulta) => {
		return conteudoDoArquivo.concat(consulta.join("\n"));
	}, "");
}

const criarArquivoDeConsultasComArquivo = (...consultas) => {

	const conteudoDoArquivo =  criarConteudoDoArquivoDeConsultas(consultas);
	console.log(conteudoDoArquivo);
}

function constructor_data_calc(planilha) {


	const planilhaConvertidaParaTerrenos = [];

	for (let index = 4; index < planilha.length; index++) {
		
		const linhaDaPlanilha = planilha[index];
		const terreno = construirUmTerrenoAPartirDaLinha(linhaDaPlanilha);
		planilhaConvertidaParaTerrenos.push(terreno);

	}

	const responsaveis = tratarResponsaveisAPartirDosTerrenos(planilhaConvertidaParaTerrenos);
	const responsaveisMapeados = mapearResponsaveis(responsaveis);
	const insertsResponsaveis = criarInsertsParaOsResponsaveis(responsaveisMapeados);
	const terrenosComResponsaveisInseridos = inserirResponsaveisNosTerrenos(planilhaConvertidaParaTerrenos, responsaveisMapeados);
	const terrenosComLocalidadesInseridas = inserirLocalidades(terrenosComResponsaveisInseridos);
	const insertsTerrenos = gerarInserts(terrenosComLocalidadesInseridas,"JTerrenos");

	criarArquivoDeConsultasComArquivo(insertsResponsaveis,insertsTerrenos);

}


function doit(type, name = 'NomePlanilha') {
	var elt = document.getElementById('data-table');
	var wb = XLSX.utils.table_to_book(elt, { sheet: "Sheet JS" });

	return XLSX.writeFile(wb, (name + '.' + (type || 'xlsx')));
}




function preencher_tabela(text1, text2, text3, index, array_data) {

	var table = document.getElementById('planilha');
	//criando os elementos da tabela
	const tr = document.createElement('tr');
	const coluna_1 = document.createElement('th');
	const coluna_2 = document.createElement('th');
	const coluna_3 = document.createElement('th');

	var classe = "";

	if (index === 0) {
		classe = "coluna_title";
		coluna_1.innerText = text1;
		coluna_2.innerText = text2;
		coluna_3.innerText = text3;
	}
	else {
		classe = "coluna_comum";
		const campo_1 = document.createElement('input');
		const campo_2 = document.createElement('input');
		const campo_3 = document.createElement('input');

		campo_1.type = "number";
		campo_2.type = "number";
		campo_3.type = "number";

		campo_1.className = "campo_comum";
		campo_2.className = "campo_comum";
		campo_3.className = "campo_comum";


		campo_1.oninput = function () {
			array_data[index][0] = campo_1.valueAsNumber;

		};
		campo_2.oninput = function () {
			array_data[index][1] = campo_2.valueAsNumber;
		};
		campo_3.oninput = function () {
			array_data[index][2] = campo_3.valueAsNumber;
		};

		campo_1.value = text1;
		campo_2.value = text2;
		campo_3.value = text3;

		coluna_1.appendChild(campo_1);
		coluna_2.appendChild(campo_2);
		coluna_3.appendChild(campo_3);

	}
	coluna_1.className = classe;
	coluna_2.className = classe;
	coluna_3.className = classe;



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



function ajustar_dados(array_data) {
	var dados_ajustados = [];

	array_data.forEach(function (item, index) {
		if (index > 0) {
			matrix_x.push(item[0]);
			matrix_y.push(item[1]);
		}
	});

	dados_ajustados.push(matrix_x, matrix_y);

	return dados_ajustados;

}










