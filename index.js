const API_URL = "https://pokeapi.co/api/v2";

const pokemons_list = document.querySelector("#pokemons_list");
const buttons = document.querySelector("#buttons");
const buscar = document.querySelector("#buscar");
const fileInput = document.getElementById("file-input");
const btnMostrarFavoritos = document.getElementById("btnFavoritos");
const btnGuardarFavoritos = document.getElementById("btnGuardarFavoritos");

let pokemons;
let favoritos = [];

const table = document.createElement("table");

const SearchPokemon = async (url, value) => {
	buttons.innerHTML = "";
	try {
		let array = [];
		let response;
		value = value.toLowerCase().trim();
		if (value == "") {
			response = await fetch(url + "/pokemon/?limit=10&offset=0");
		} else {
			response = await fetch(url + "/pokemon/" + value);
		}
		const results = await response.json();
		if (value) {
			array.push(results);
			createTable(array);
		} else {
			array = results;
			DataPokemons(array.results).then((dataPokemons) => {
				createTable(dataPokemons);
			});
		}
	} catch (error) {
		console.log(error);
		ErrorMessage();
	}
};

const GetPokemons = async (url) => {
	try {
		const response = await fetch(url + "/pokemon/?limit=10&offset=0");
		const results = await response.json();
		console.log(results);

		buttons.innerHTML = "";
		let btnPrevious = document.createElement("button");
		if (results.previous) {
			btnPrevious.textContent = "BACK";
			btnPrevious.className = "btn";
			btnPrevious.dataset.url = results.previous;
			buttons.appendChild(btnPrevious);
		}

		let btnNext = document.createElement("button");
		if (results.next) {
			btnNext.textContent = "NEXT";
			btnNext.className = "btn";
			btnNext.dataset.url = results.next;
			buttons.appendChild(btnNext);
			// btnNext = "<button> NEXT </button>";
		}

		return DataPokemons(results.results);
	} catch (error) {
		console.log(error);
	}
};

const DataPokemons = async (data) => {
	let pokemons = [];
	try {
		for (let pokemon of data) {
			const response = await fetch(pokemon.url);
			const pokemonData = await response.json();
			console.log(pokemonData);
			pokemons.push(pokemonData);
		}
	} catch (error) {
		console.log(error);
	}
	return pokemons;
};

const ErrorMessage = (mensaje = "NOT FOUND") => {
	pokemons_list.innerHTML = "<h1 class='notFound'>" + mensaje + "</h1>";
	table.innerHTML = "";
};

const createTable = (pokemons, favorito = false) => {
	pokemons_list.innerHTML = "";
	table.innerHTML = "";
	//console.table(pokemons);
	if (pokemons == 0) {
		ErrorMessage("No hay pokemons favoritos");
	}
	/* ENCABEZADOS */
	let tr = document.createElement("tr");

	let th = document.createElement("th");
	th.appendChild(document.createTextNode("Nombre"));
	tr.appendChild(th);

	th = document.createElement("th");
	th.appendChild(document.createTextNode("Altura"));
	tr.appendChild(th);

	th = document.createElement("th");
	th.appendChild(document.createTextNode("Foto"));
	tr.appendChild(th);

	table.appendChild(tr);

	/* POKEMONS */
	pokemons.forEach((pokemon) => {
		let tr = document.createElement("tr");

		let td = document.createElement("td");
		td.appendChild(document.createTextNode(`${pokemon.name.toUpperCase()}`));
		tr.appendChild(td);

		td = document.createElement("td");
		td.appendChild(document.createTextNode(`${pokemon.height * 10} cm`));
		tr.appendChild(td);

		td = document.createElement("td");
		let img = document.createElement("img");
		img.src = pokemon.sprites.other.dream_world.front_default;
		img.height = "100";
		td.appendChild(img);
		tr.appendChild(td);

		td = document.createElement("td");
		img = document.createElement("img");
		img.src = "./img/estrellaVacia.png";
		img.height = "50";
		if (favorito) {
			img.src = "./img/estrella.png";
		}
		img.addEventListener("click", (e) => {
			console.log(img.src.includes("estrella.png"));
			if (img.src.includes("estrella.png")) {
				img.src = "./img/estrellaVacia.png";
				favoritos = favoritos.filter(
					(favorito) => favorito.name !== pokemon.name
				);
			} else {
				img.src = "./img/estrella.png";
				favoritos.push(pokemon);
			}
		});
		favoritos.forEach((favorito) => {
			if (favorito.name == pokemon.name) {
				img.src = "./img/estrella.png";
			}
		});
		td.appendChild(img);
		tr.appendChild(td);

		table.appendChild(tr);
	});
	pokemons_list.appendChild(table);
	//buttons.innerHTML = btnPrevious + btnNext;
};

/* MAIN */

GetPokemons(API_URL).then((pokemons) => {
	console.table(pokemons);
	createTable(pokemons);
});

/* Events */
buttons.addEventListener("click", (e) => {
	if (e.target.classList.contains("btn")) {
		let value = e.target.dataset.url;
		//console.log(value);
		GetPokemons(value).then((pokemons) => {
			createTable(pokemons);
		});
	}
});

buscar.addEventListener("click", (e) => {
	if (e.target.classList.contains("btnBuscar")) {
		let txtBuscar = document.getElementById("txtBuscar");
		//console.log(txtBuscar.value);
		SearchPokemon(API_URL, txtBuscar.value);
	}
});

fileInput.addEventListener("change", leerArchivo, false);

btnMostrarFavoritos.addEventListener("click", (e) => {
	//console.log(favoritos);
	createTable(favoritos);
});

btnGuardarFavoritos.addEventListener(
	"click",
	() =>
		downloadFiles(JSON.stringify(favoritos), "pokemonsFavoritos.json", "json"),
	false
);

//downloadFiles("holaaaaaa", "hola.json", "json");
//
function downloadFiles(data, file_name, file_type) {
	console.log("Descargando");
	var file = new Blob([data], { type: file_type });
	if (window.navigator.msSaveOrOpenBlob)
		window.navigator.msSaveOrOpenBlob(file, file_name);
	else {
		var a = document.createElement("a"),
			url = URL.createObjectURL(file);
		a.href = url;
		a.download = file_name;
		document.body.appendChild(a);
		a.click();
		setTimeout(function () {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
}

function leerArchivo(e) {
	let archivo = e.target.files[0];
	if (!archivo) {
		return;
	}
	let lector = new FileReader();
	lector.onload = function (e) {
		let contenido = e.target.result;
		//mostrarContenido(contenido);
		if (contenido.endsWith("}]")) {
			let favoritosJSON = JSON.parse(contenido);
			console.log(favoritosJSON);
			favoritos = favoritos.concat(favoritosJSON);
			createTable(favoritosJSON, true);
		} else {
			ErrorMessage("Archivo invalidado");
		}
	};
	lector.readAsText(archivo);
	fileInput.value = null;
}

function mostrarContenido(contenido) {
	let elemento = document.getElementById("contenido-archivo");
	elemento.innerHTML = contenido;
}

// const xhr = new XMLHttpRequest();

// function onRequestHandler() {
//   if (this.readyState === 4 && this.status === 200) {
//     // 0 = UNSET, no se ha llamado al metodo open
//     // 1 = OPENED, se ha llamado al metodo open.
//     // 2 = HEADERS_RECEIVED, se está llamando al metodo send()
//     // 3 = LOADING, está cargando, es decir, está recibiendo la respuesta.
//     // 4 = DONE, se ha completado la operación.
//     const data = JSON.parse(this.response);
//     console.log(data);
//     const pokemons_list = document.querySelector("#app");
//     const tpl = data.results.map((pokemon) => `<li> ${pokemon.name} </li>`);
//     console.log(tpl);
//     pokemons_list.innerHTML = `<ul> ${tpl} </ul>`;
//   }
// }

// xhr.addEventListener("load", onRequestHandler);
// xhr.open("GET", `${API_URL}/pokemon/?limit=20&offset=0`);
// xhr.send();
