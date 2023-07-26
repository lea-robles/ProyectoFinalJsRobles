function programaPrincipal() {

    let productos = []
    let url
    // Condicional para url segun lugar de ejecucion (local o github)
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    url = "../productos.json"
    } else {
    url = "https://raw.githubusercontent.com/lea-robles/ProyectoFinalJsRobles/main/productos.json"
    }

    fetch("https://raw.githubusercontent.com/lea-robles/ProyectoFinalJsRobles/main/productos.json")
        .then(response => response.json())
        .then(data => {
            productos = data.productos
            crearTarjetas(productos, contenedorTarjetas, carrito)
        })
        .catch(error => modal("error", "Ha ocurrido un error al cargar los productos", "Por favor intentelo nuevamente mas tarde"))

    let carrito = []
    let carritoJSON = JSON.parse(localStorage.getItem("carrito"))
    let contenedorTarjetas = document.getElementById("productos")

    if (carritoJSON) {
        carrito = carritoJSON
    }

    crearTarjetasCarrito(carrito)

    // INPUT

    let buscarProductos = document.getElementById("buscarProductos")
    buscarProductos.addEventListener("input", () => filtrarPorNombre(productos, contenedorTarjetas, carrito))

    // BOTONES

    let botonesCategorias = document.getElementsByClassName("filtroCategorias")
    for (const botonCategorias of botonesCategorias) {
        botonCategorias.addEventListener("click", (e) => filtrarPorCategoria(e, contenedorTarjetas, carrito, productos, botonFinalizarCompra))
    }

    let botonCarrito = document.getElementById("botonCarrito")
    botonCarrito.addEventListener("click", () => verCarrito(contenedorTarjetas, botonFinalizarCompra))

    let botonVaciarCarrito = document.getElementById("botonVaciarCarrito")
    botonVaciarCarrito.addEventListener("click", () => vaciarCarrito(carrito))

    let botonFinalizarCompra = document.getElementById("finalizarCompra")
    botonFinalizarCompra.addEventListener("click", () => finalizarCompra(carrito))

}

programaPrincipal()


// FUNCIONES


function crearTarjetas(arrayFiltrado, contenedorTarjetas, carrito) {
    contenedorTarjetas.innerHTML = ""
    arrayFiltrado.forEach(({ nombre, rutaImagen, precio, id }) => {
        let tarjeta = document.createElement("div")
        tarjeta.className = "tarjetasPetshop"
        tarjeta.innerHTML = `
            <h4>${nombre}</h4>
            <img src="./img/${rutaImagen}">
            <h4>$${precio}</h4>
            <button id=${id}>Agregar al carrito</button>
        `
        contenedorTarjetas.appendChild(tarjeta)
        let botonAgregarCarrito = document.getElementById(id)
        botonAgregarCarrito.addEventListener("click", () => agregarAlCarrito(arrayFiltrado, id, carrito))
    })
}

function filtrarPorNombre(productos, contenedorTarjetas, carrito) {
    let arrayFiltrado = productos.filter(producto => producto.nombre.toLowerCase().includes(buscarProductos.value.toLowerCase()))
    crearTarjetas(arrayFiltrado, contenedorTarjetas, carrito)
}

function filtrarPorCategoria(e, contenedorTarjetas, carrito, productos, botonFinalizarCompra) {
    ocultarCarrito(contenedorTarjetas, botonFinalizarCompra)
    if (e.target.value === "quitar") {
        crearTarjetas(productos, contenedorTarjetas, carrito)
    } else {
        let arrayFiltrado = productos.filter(producto => producto.categoria === e.target.value)
        crearTarjetas(arrayFiltrado, contenedorTarjetas, carrito)
    }
}

function verCarrito(contenedorTarjetas, botonFinalizarCompra) {
    let carrito = document.getElementById("carrito")
    contenedorTarjetas.classList.toggle("ocultar")
    carrito.classList.toggle("ocultar")
    botonFinalizarCompra.classList.toggle("ocultar")
}

function ocultarCarrito(contenedorTarjetas, botonFinalizarCompra) {
    let carrito = document.getElementById("carrito")
    contenedorTarjetas.classList.remove("ocultar")
    carrito.classList.add("ocultar")
    botonFinalizarCompra.classList.add("ocultar")
}

function agregarAlCarrito(arrayFiltrado, id, carrito) {
    console.log(id)
    let productoElegido = arrayFiltrado.find(producto => producto.id === id)
    let posPproductoEnCarrito = carrito.findIndex(producto => producto.id === productoElegido.id)
    if (posPproductoEnCarrito !== -1) {
        carrito[posPproductoEnCarrito].unidades++
        carrito[posPproductoEnCarrito].subTotal = carrito[posPproductoEnCarrito].unidades * carrito[posPproductoEnCarrito].precioUnitario
    } else {
        carrito.push({
            id: productoElegido.id,
            nombre: productoElegido.nombre,
            precioUnitario: productoElegido.precio,
            unidades: 1,
            subTotal: productoElegido.precio
        })
    }
    crearTarjetasCarrito(carrito)
    localStorage.setItem("carrito", JSON.stringify(carrito))
    notiToast("Producto añadido al carrito", 1400)
}

function crearTarjetasCarrito(carrito) {
    let total = 0
    let crearEnCarrito = document.getElementById("carrito")
    crearEnCarrito.innerHTML = ""
    total = carrito.reduce((acumulador, producto) => acumulador + producto.subTotal, 0)
    carrito.forEach(producto => {
        crearEnCarrito.innerHTML += `
        <p>${producto.nombre} | $${producto.precioUnitario} | Unidades ${producto.unidades} | Subtotal $${producto.subTotal}\n</p>
        `
    })
    crearEnCarrito.innerHTML += `
        <p>Su total a pagar es $${total}</p>
        `
}

function vaciarCarrito(carrito) {
    carrito.splice(0, carrito.length)
    localStorage.removeItem("carrito")
    crearTarjetasCarrito(carrito)
}

function finalizarCompra(carrito) {
    if (calcularTotal(carrito) === 0) {
        modal('error', 'El carrito está vacío', 'Agregue productos antes de finalizar la compra.')
    } else {
        vaciarCarrito(carrito)
        modal('success', 'Compra realizada con exito!', 'Gracias por elegirnos!')
    }
    console.log(carrito)
}

function calcularTotal(carrito) {
    carrito = carrito || [];
    return carrito.reduce((total, producto) => total + producto.subTotal, 0);
}

// LIBRERIA

function notiToast(text, duration) {
    Toastify({
        text,
        duration,
        className: "notiToastify",
        style: {
            background: "linear-gradient(to right, #ffa500, #ffd500)",
            color: "#000000",
        },
        stopOnFocus: false,
    }).showToast();
}

function modal(icon, title, text) {
    Swal.fire({
        icon,
        title,
        text,
        customClass: {
            confirmButton: "botonConfirmModal",
        }
    })
}