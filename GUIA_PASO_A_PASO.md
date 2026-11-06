# Guía paso a paso: API de usuarios con Node.js, Express, Prisma 8 y MongoDB

> **Para quién es esta guía:** para personas que **nunca han programado**. No necesitas saber nada de antemano. Sigue los pasos **en orden**, sin saltarte ninguno, y al final tendrás funcionando exactamente el mismo proyecto que hay en este repositorio.
>
> **Tiempo estimado:** entre 1 y 2 horas la primera vez.

---

## Índice

0. [¿Qué vamos a construir?](#0-qué-vamos-a-construir)
1. [Conceptos básicos antes de empezar](#1-conceptos-básicos-antes-de-empezar)
2. [Instalar las herramientas](#2-instalar-las-herramientas)
3. [Crear la base de datos en MongoDB Atlas](#3-crear-la-base-de-datos-en-mongodb-atlas)
4. [Crear la carpeta del proyecto](#4-crear-la-carpeta-del-proyecto)
5. [Inicializar el proyecto de Node (`package.json`)](#5-inicializar-el-proyecto-de-node-packagejson)
6. [Instalar Express, dotenv y nodemon](#6-instalar-express-dotenv-y-nodemon)
7. [Primer servidor: "todo ok"](#7-primer-servidor-todo-ok)
8. [Instalar y configurar Prisma 8 para MongoDB](#8-instalar-y-configurar-prisma-8-para-mongodb)
9. [Configurar la conexión a la base de datos (`.env`)](#9-configurar-la-conexión-a-la-base-de-datos-env)
10. [Definir el modelo de datos (`contract.prisma`)](#10-definir-el-modelo-de-datos-contractprisma)
11. [La arquitectura por capas](#11-la-arquitectura-por-capas)
12. [Capa 1 – Modelo (`user.model.js`)](#12-capa-1--modelo-usermodeljs)
13. [Capa 2 – Servicio (`user.service.js`)](#13-capa-2--servicio-userservicejs)
14. [Capa 3 – Controlador (`user.controller.js`)](#14-capa-3--controlador-usercontrollerjs)
15. [Capa 4 – Rutas (`user.route.js`)](#15-capa-4--rutas-userroutejs)
16. [Conectar las rutas en `index.js`](#16-conectar-las-rutas-en-indexjs)
17. [Probar la API](#17-probar-la-api)
18. [Guardar el proyecto con Git y GitHub](#18-guardar-el-proyecto-con-git-y-github)
19. [Solución de problemas frecuentes](#19-solución-de-problemas-frecuentes)
20. [Glosario](#20-glosario)
21. [Retos para seguir aprendiendo](#21-retos-para-seguir-aprendiendo)

---

## 0. ¿Qué vamos a construir?

Una **API** (un programa que corre en un servidor y responde peticiones) que permite:

| Acción | Método | Dirección (URL) | Qué hace |
|---|---|---|---|
| Comprobar que el servidor vive | `GET` | `http://localhost:3001/` | Responde `todo ok` |
| Crear un usuario | `POST` | `http://localhost:3001/api/user/create` | Guarda un usuario (email + username) en MongoDB |
| Buscar un usuario | `POST` | `http://localhost:3001/api/user/finduser` | Busca un usuario por su email |

Estructura final de carpetas:

```
prisma/
├── .env                      ← tus contraseñas (NO se sube a GitHub)
├── .env.example              ← plantilla del .env (sí se sube)
├── .gitattributes
├── .gitignore
├── index.js                  ← punto de entrada: arranca el servidor
├── package.json              ← "ficha" del proyecto y sus dependencias
├── package-lock.json         ← (automático)
├── prisma.config.ts          ← configuración de Prisma
├── tsconfig.json
└── src/
    ├── controller/
    │   └── user.controller.js
    ├── models/
    │   └── user.model.js
    ├── prisma/
    │   ├── contract.prisma   ← aquí defines cómo es un "User"
    │   ├── contract.json     ← (generado automáticamente)
    │   ├── contract.d.ts     ← (generado automáticamente)
    │   └── db.ts             ← conexión a la base de datos
    ├── routes/
    │   └── user.route.js
    └── services/
        └── user.service.js
```

---

## 1. Conceptos básicos antes de empezar

No hace falta memorizarlo; vuelve aquí cuando algo no te cuadre.

- **Terminal (o consola):** una ventana donde escribes órdenes de texto al ordenador. En Windows usaremos la terminal integrada de VS Code (PowerShell).
- **Node.js:** permite ejecutar código JavaScript fuera del navegador, por ejemplo para crear servidores.
- **npm:** viene con Node. Sirve para descargar "paquetes" (código que otras personas han escrito) y usarlo en tu proyecto.
- **Express:** un paquete que facilita crear servidores web y APIs.
- **MongoDB:** una base de datos. Guarda la información como "documentos" parecidos a objetos JavaScript: `{ "email": "ana@correo.com", "username": "ana" }`. Los documentos se agrupan en **colecciones** (la nuestra se llamará `users`).
- **Prisma (ORM):** una herramienta que hace de "traductor" entre tu código y la base de datos. En lugar de escribir instrucciones de MongoDB a mano, escribes `db.orm.users.create(...)`.
- **Petición HTTP:** un mensaje que un cliente (navegador, app, Postman…) envía al servidor. Tiene un **método** (`GET` para pedir, `POST` para enviar datos…), una **URL** y opcionalmente un **cuerpo** (`body`) con datos en formato **JSON**.
- **Respuesta HTTP:** lo que el servidor devuelve. Lleva un **código de estado**: `200` = todo bien, `404` = no encontrado, `500` = error del servidor.

---

## 2. Instalar las herramientas

### 2.1 Node.js (obligatorio)

1. Entra en <https://nodejs.org>.
2. Descarga la versión **LTS** (debe ser **24 o superior**; este proyecto se hizo con Node `v24`).
   > ⚠️ Importante: este proyecto importa un archivo `.ts` (TypeScript) desde un `.js`. Las versiones modernas de Node (22.18+ / 24+) lo entienden sin configurar nada. Con versiones antiguas **no funcionará**.
3. Instálalo con todas las opciones por defecto (siguiente, siguiente, finalizar).

### 2.2 Visual Studio Code (editor de código)

1. Descárgalo de <https://code.visualstudio.com> e instálalo.
2. (Opcional pero recomendado) Dentro de VS Code, ve al icono de cuadraditos de la izquierda (**Extensiones**) e instala:
   - **Prisma** (colorea los archivos `.prisma`).
   - **Thunder Client** (para probar la API sin salir de VS Code).

### 2.3 Git (para guardar versiones de tu código)

1. Descárgalo de <https://git-scm.com> e instálalo con las opciones por defecto.

### 2.4 Comprobar que todo está instalado

1. Abre VS Code.
2. Abre la terminal: menú **Terminal → New Terminal** (o `Ctrl + ñ` / ``Ctrl + ` ``).
3. Escribe cada línea y pulsa **Enter**:

```bash
node -v
npm -v
git --version
```

Deberías ver números de versión, por ejemplo `v24.22.0`, `11.19.1`, `git version 2.x`. Si alguno dice "no se reconoce como un comando", **cierra VS Code y vuelve a abrirlo** (o reinicia el ordenador) y prueba otra vez.

---

## 3. Crear la base de datos en MongoDB Atlas

Usaremos **MongoDB Atlas**, que es MongoDB en la nube y tiene un plan gratuito. Así no instalas nada más en tu ordenador.

1. Entra en <https://www.mongodb.com/cloud/atlas/register> y crea una cuenta (puedes usar Google).
2. Crea un **cluster** gratuito: elige el plan **Free (M0)**, cualquier proveedor/región cercana, y deja el nombre `Cluster0`. Pulsa **Create Deployment**.
3. **Crea un usuario de base de datos.** Atlas te lo pedirá en la pantalla siguiente:
   - Usuario: por ejemplo `alumno`
   - Contraseña: créala y **apúntala** (mejor sin símbolos raros como `@`, `/`, `:` para evitar problemas).
4. **Permite el acceso desde tu ordenador:** en el menú izquierdo, **Network Access → Add IP Address → Add Current IP Address** (o, solo para practicar, **Allow Access from Anywhere** `0.0.0.0/0`).
5. **Obtén la cadena de conexión:** en **Database → Connect → Drivers**. Copia una dirección parecida a esta:

```
mongodb+srv://alumno:<db_password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

Guárdala en un bloc de notas; la usaremos en el paso 9.

> ℹ️ Prisma 8 necesita **MongoDB 8.0 o superior**. Los clusters actuales de Atlas ya lo cumplen.

---

## 4. Crear la carpeta del proyecto

1. Crea una carpeta en tu ordenador, por ejemplo en `Documentos`, llamada **`prisma`**.
2. En VS Code: **File → Open Folder…** y selecciona esa carpeta.
3. Abre la terminal (**Terminal → New Terminal**). Verás que la ruta termina en `\prisma`. **Todos los comandos de esta guía se escriben en esta terminal**, dentro de esta carpeta.

---

## 5. Inicializar el proyecto de Node (`package.json`)

En la terminal escribe:

```bash
npm init -y
```

Esto crea el archivo **`package.json`**, la "ficha de identidad" del proyecto: su nombre, los comandos disponibles y los paquetes que usa.

Ahora ábrelo (clic en él en el panel izquierdo) y haz **dos cambios**:

1. Añade la línea `"type": "module",` (permite usar `import ... from ...`, la forma moderna de JavaScript).
2. Reemplaza la sección `"scripts"` por la de abajo.

Debe quedar así (los demás campos pueden variar, no pasa nada):

```json
{
  "name": "prisma",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "contract:emit": "prisma contract emit"
  },
  "license": "ISC"
}
```

¿Qué significa cada script?

| Comando que escribirás | Qué hace |
|---|---|
| `npm start` | Arranca el servidor una vez. |
| `npm run dev` | Arranca el servidor y lo **reinicia solo** cada vez que guardas un archivo (gracias a *nodemon*). Es el que usarás mientras programas. |
| `npm run contract:emit` | Regenera los archivos de Prisma cuando cambias el modelo de datos. |

Guarda el archivo con **`Ctrl + S`**.

---

## 6. Instalar Express, dotenv y nodemon

En la terminal:

```bash
npm install express dotenv
npm install -D nodemon
```

- `express`: para crear el servidor.
- `dotenv`: para leer contraseñas desde un archivo `.env`.
- `nodemon` (con `-D` = solo para desarrollo): reinicia el servidor automáticamente.

Verás que aparece una carpeta **`node_modules`** (contiene el código descargado; **nunca la edites**) y un archivo `package-lock.json` (automático).

### 6.1 Crear `.gitignore`

Crea un archivo nuevo en la raíz llamado **`.gitignore`** (con el punto delante) con este contenido:

```
.env
node_modules
node_modules/
dist/
```

Esto le dice a Git qué **no** debe subir nunca: tus contraseñas (`.env`) y la pesada carpeta `node_modules`.

---

## 7. Primer servidor: "todo ok"

Antes de complicarnos, comprobemos que sabemos arrancar un servidor.

Crea en la raíz el archivo **`index.js`** con este contenido:

```js
import express from 'express'
import 'dotenv/config'

const port = process.env.PORT || 3001

const app = express()
app.use(express.json())

app.get("", (request, response) => {
    response.send("todo ok")
})

app.listen(port, () => {
    console.log("http://localhost:" + port)
})
```

**Explicación línea a línea:**

- `import express from 'express'` → trae la librería Express.
- `import 'dotenv/config'` → carga las variables del archivo `.env` (lo crearemos luego).
- `const port = process.env.PORT || 3001` → el puerto será el definido en `.env` como `PORT`; si no existe, usa `3001`.
- `const app = express()` → crea la aplicación (nuestro servidor).
- `app.use(express.json())` → permite que el servidor entienda datos en JSON enviados en el cuerpo de las peticiones. **Sin esto, `req.body` estaría vacío.**
- `app.get("", ...)` → cuando alguien haga un `GET` a la raíz, responde el texto `todo ok`.
- `app.listen(port, ...)` → pone el servidor a "escuchar" en el puerto y muestra la dirección en la terminal.

**Pruébalo:**

```bash
npm run dev
```

Verás `http://localhost:3001`. Abre esa dirección en tu navegador: debe aparecer **todo ok**. 🎉

Para detener el servidor: haz clic en la terminal y pulsa **`Ctrl + C`**. Detenlo ahora para continuar.

---

## 8. Instalar y configurar Prisma 8 para MongoDB

Prisma tiene un asistente que crea automáticamente casi todos sus archivos. Ejecuta (es **una sola línea**):

```bash
npx prisma@latest orm init --target mongodb --authoring psl --schema-path ./src/prisma/contract.prisma
```

- `npx` → ejecuta un programa de npm sin instalarlo globalmente.
- `--target mongodb` → usaremos MongoDB.
- `--authoring psl` → escribiremos el modelo en el lenguaje de Prisma (PSL).
- `--schema-path ...` → dónde guardar el archivo del modelo.

Si te hace preguntas, acepta las opciones por defecto (pulsa **Enter**).

Al terminar habrá creado/instalado, entre otros:

- `prisma.config.ts`
- `tsconfig.json`
- `.env.example` y `.gitattributes`
- `src/prisma/contract.prisma`, `src/prisma/contract.json`, `src/prisma/contract.d.ts`, `src/prisma/db.ts`
- Los paquetes `@prisma/orm-mongo`, `mongodb`, `prisma`, `@prisma/cli-engine` y `@types/node`.
- Un archivo `prisma-8.md` con documentación (puedes leerlo o borrarlo).

### 8.1 Verificar las dependencias

Abre `package.json`. Las secciones `dependencies` y `devDependencies` deben parecerse a esto (los números pueden ser más nuevos):

```json
"dependencies": {
  "@prisma/orm-mongo": "^8.0.0-rc.22",
  "dotenv": "^18.0.9",
  "express": "^5.3.0",
  "mongodb": "^7.8.0"
},
"devDependencies": {
  "@prisma/cli-engine": "^0.9.0",
  "@types/node": "^26.6.6",
  "nodemon": "^3.1.14",
  "prisma": "^8.0.0-rc.30"
}
```

Si falta alguno, instálalo a mano:

```bash
npm install @prisma/orm-mongo mongodb
npm install -D prisma @prisma/cli-engine @types/node
```

### 8.2 Revisar los archivos que creó Prisma

Comprueba que su contenido es **igual** al siguiente. Si es distinto, **cópialo y pégalo** tal cual.

**`prisma.config.ts`** (en la raíz) — le dice a la herramienta de Prisma dónde está el modelo y cómo conectarse:

```ts
import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-mongo/config';

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env['DATABASE_URL']!
    },
  }),
});
```

**`src/prisma/db.ts`** — crea el objeto `db` que usaremos en el código para hablar con la base de datos:

```ts
import 'dotenv/config';
import mongo from '@prisma/orm-mongo/runtime';
import { contractFromJson } from '@prisma/orm-mongo/static';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

export const contract = contractFromJson<Contract>(contractJson);

export const db = mongo({
  contract,
  url: process.env['DATABASE_URL']!,
});
```

> 💡 No hace falta "conectar" manualmente: `db` se conecta solo la primera vez que hagas una consulta.

**`tsconfig.json`** (en la raíz):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "preserve",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "types": ["node"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "outDir": "dist"
  },
  "include": ["**/*.ts", "prisma.config.js"]
}
```

**`.gitattributes`** (en la raíz) — marca los archivos generados para que GitHub no los cuente como código propio:

```
src/prisma/contract.json linguist-generated
src/prisma/contract.d.ts linguist-generated
src/prisma/ops.json linguist-generated
src/prisma/migration.json linguist-generated
migrations/snapshots/**/contract.json linguist-generated
migrations/snapshots/**/contract.d.ts linguist-generated
```

---

## 9. Configurar la conexión a la base de datos (`.env`)

### 9.1 `.env.example` (plantilla, se sube a GitHub)

Deja el archivo `.env.example` así, **sin contraseñas reales**:

```env
# Copy this file to `.env` and replace the placeholder with your real connection string.
# Connection string for MongoDB.
# Requires MongoDB >= 8.0.

DATABASE_URL="mongodb+srv://<db_username>:<db_password>@cluster0.xxxxxx.mongodb.net/"
```

### 9.2 `.env` (secreto, NO se sube)

1. Crea en la raíz un archivo llamado **`.env`** (si Prisma ya lo creó, ábrelo).
2. Pega tu cadena de conexión del paso 3, sustituyendo usuario y contraseña, y añade **el nombre de la base de datos** después de `.net/` (por ejemplo `usuariosdb`):

```env
DATABASE_URL="mongodb+srv://alumno:MiContraseña123@cluster0.xxxxxx.mongodb.net/usuariosdb?retryWrites=true&w=majority"
PORT=3001
```

> ⚠️ Quita los símbolos `<` y `>`: no van en la dirección real.
> ⚠️ Nunca compartas este archivo ni lo subas a GitHub (por eso está en `.gitignore`).
> ℹ️ Si no pones nombre de base de datos tras `.net/`, MongoDB usará una llamada `test`.

---

## 10. Definir el modelo de datos (`contract.prisma`)

El **contrato** describe qué forma tienen los datos. Abre `src/prisma/contract.prisma` y deja **exactamente** esto:

```prisma
// use prisma-8

model User {
  id       ObjectId @id @map("_id")
  email    String   @unique
  username String?
  @@map("users")
}
```

**Explicación:**

- `model User { ... }` → definimos qué es un "usuario".
- `id ObjectId @id @map("_id")` → identificador único. MongoDB lo genera solo y lo guarda con el nombre `_id`.
- `email String @unique` → texto **obligatorio** y **no se puede repetir** (dos usuarios no pueden tener el mismo email).
- `username String?` → texto **opcional** (el `?` significa "puede estar vacío").
- `@@map("users")` → en MongoDB, la colección se llamará `users`. Por eso en el código escribiremos `db.orm.users`.

### 10.1 Generar los archivos del contrato

Cada vez que cambies `contract.prisma` debes ejecutar:

```bash
npm run contract:emit
```

Esto regenera `contract.json` y `contract.d.ts`. **No edites esos dos archivos a mano**: son automáticos.

### 10.2 Crear la colección en la base de datos

```bash
npx prisma db init
```

Esto crea en MongoDB la colección `users` con sus reglas (por ejemplo, el índice que impide emails repetidos). Si te pide confirmación, acepta.

---

## 11. La arquitectura por capas

Antes de escribir el resto, entiende **por qué** hay cuatro carpetas. Cada una tiene **una única responsabilidad**, como en un restaurante:

```
Cliente (Postman / navegador)
      │  petición HTTP
      ▼
 ROUTES      (routes/user.route.js)       → El recepcionista: ¿a qué mesa va esta petición?
      ▼
 CONTROLLER  (controller/user.controller.js) → El camarero: recoge el pedido (req) y entrega la respuesta (res)
      ▼
 SERVICE     (services/user.service.js)   → El jefe de cocina: aplica la lógica y decide qué hacer
      ▼
 MODEL       (models/user.model.js)       → La despensa: es lo único que habla con la base de datos
      ▼
 PRISMA (db) → MongoDB
```

La respuesta hace el camino inverso. Ventaja: si mañana cambias de base de datos, solo tocas el **modelo**; si cambias de URL, solo tocas las **rutas**.

Crea ahora estas carpetas dentro de `src` (clic derecho sobre `src` → **New Folder**):

- `src/models`
- `src/services`
- `src/controller`
- `src/routes`

Vamos a escribir los archivos **de abajo hacia arriba** (de la base de datos hacia la URL), porque cada capa usa a la anterior.

---

## 12. Capa 1 – Modelo (`user.model.js`)

Crea **`src/models/user.model.js`**:

```js
import { db } from "../prisma/db.ts";

export async function createUserModel(id, username, email) {
  try {
    const user = await db.orm.users.create({
      email: email,
      username: username,
    });
    return "ok";
  } catch (e) {
    console.log(e);
    return "error";
  }
}

export async function findUserModel(email) {
  try {
    const user = await db.orm.users
      .where({
        email: email,
      })
      .first();
    if (user != null) {
      return user;
    } else {
      throw new Error("usuario no encontrado");
    }
  } catch (e) {
    throw new Error("usuario no encontrado");
  }
}
```

**Explicación:**

- `import { db } from "../prisma/db.ts"` → traemos la conexión. `../` significa "sube una carpeta" (de `models` a `src`), y luego entra en `prisma`. Fíjate que se escribe la extensión `.ts` completa.
- `export` → permite usar la función desde otros archivos.
- `async` / `await` → hablar con una base de datos tarda un poco. `await` significa "espera a que termine antes de seguir". Solo se puede usar `await` dentro de funciones `async`.
- `try { ... } catch (e) { ... }` → "intenta esto; si algo falla, en lugar de romperse el programa, ejecuta el bloque `catch`".
- **`createUserModel`**: `db.orm.users.create({...})` inserta un documento nuevo en la colección `users`. Si funciona devuelve `"ok"`; si falla (por ejemplo, email repetido) muestra el error en la terminal y devuelve `"error"`.
  - El parámetro `id` se recibe pero no se usa: MongoDB genera el `id` automáticamente.
- **`findUserModel`**: `.where({ email })` filtra por email y `.first()` devuelve el primero que encuentre, o `null` si no hay ninguno. Si es `null`, lanzamos (`throw`) un error para avisar a la capa de arriba.

---

## 13. Capa 2 – Servicio (`user.service.js`)

Crea **`src/services/user.service.js`**:

```js
import { createUserModel, findUserModel } from "../models/user.model.js";

export function createUserService(body) {
  const { id, username, email } = body;

  return createUserModel(id, username, email);
}

export async function findUserService(body) {
  try {
    const user = await findUserModel(body.email);

    console.log("modelo", user);
    return {
      status: 200,
      message: user,
    };
  } catch (e) {
    return {
      status: 404,
      message: "usuario no encontrado",
    };
  }
}
```

**Explicación:**

- `const { id, username, email } = body;` → esto se llama **desestructuración**: saca esas tres propiedades del objeto `body` y las guarda en variables con el mismo nombre. Es lo mismo que escribir `const id = body.id; const username = body.username; ...`.
- **`createUserService`** recibe los datos de la petición y se los pasa al modelo.
- **`findUserService`** pide el usuario al modelo:
  - Si lo encuentra → devuelve `{ status: 200, message: usuario }`.
  - Si el modelo lanza un error → lo "atrapa" el `catch` y devuelve `{ status: 404, message: "usuario no encontrado" }`.
  - Así el controlador sabe qué código de estado responder.

---

## 14. Capa 3 – Controlador (`user.controller.js`)

Crea **`src/controller/user.controller.js`**:

```js
import { createUserService, findUserService } from '../services/user.service.js'

export async function createUserController(req, res) {
    res.status(200).send(await createUserService(req.body))
}

export async function findUserController(req, res) {
    const user = await findUserService(req.body);

    console.log(user)
    res.status(user.status).json(user.message)
}
```

**Explicación:**

- Todo controlador de Express recibe dos objetos:
  - **`req`** (request / petición): lo que envía el cliente. `req.body` contiene el JSON enviado.
  - **`res`** (response / respuesta): lo que usamos para contestar.
- `res.status(200)` → fija el código de estado.
- `.send(...)` → envía texto (aquí, `"ok"` o `"error"`).
- `.json(...)` → envía datos en formato JSON (aquí, el usuario encontrado o el mensaje de error).
- En `findUserController` usamos el `status` y el `message` que nos preparó el servicio.

---

## 15. Capa 4 – Rutas (`user.route.js`)

Crea **`src/routes/user.route.js`**:

```js
import express from 'express'
import { createUserController, findUserController } from '../controller/user.controller.js'

const router = express.Router()

router.post("/create", createUserController)
router.post("/finduser", findUserController)

export default router
```

**Explicación:**

- `express.Router()` → crea un "mini-servidor" que agrupa rutas relacionadas (todas las de usuarios).
- `router.post("/create", createUserController)` → cuando llegue un `POST` a `/create`, ejecuta `createUserController`.
- `router.post("/finduser", findUserController)` → lo mismo para buscar. (Usamos `POST` porque enviamos el email en el cuerpo de la petición.)
- `export default router` → exportamos el router como elemento principal del archivo, para usarlo en `index.js`.

---

## 16. Conectar las rutas en `index.js`

Vuelve a **`index.js`** y déjalo **así** (se añaden dos líneas respecto al paso 7, marcadas con `// NUEVO`):

```js
import express from 'express'
import 'dotenv/config'
import userRouter from './src/routes/user.route.js'   // NUEVO

const port = process.env.PORT || 3001

const app = express()
app.use(express.json())

app.get("", (request, response) => {
    response.send("todo ok")
})

app.use("/api/user", userRouter)                       // NUEVO

app.listen(port, () => {
    console.log("http://localhost:" + port)
})
```

`app.use("/api/user", userRouter)` significa: "todas las rutas del router de usuarios empiezan por `/api/user`". Por eso la ruta final es `/api/user` + `/create` = **`/api/user/create`**.

Arranca el servidor:

```bash
npm run dev
```

Debes ver `http://localhost:3001` sin errores en rojo. **Deja esta terminal abierta** mientras pruebas.

---

## 17. Probar la API

El navegador solo hace peticiones `GET` fácilmente, así que para `POST` usaremos una herramienta. Elige **una** opción.

### Opción A – Thunder Client (dentro de VS Code, recomendado)

1. Pulsa el icono del rayo ⚡ en la barra izquierda → **New Request**.
2. **Crear usuario:**
   - Método: `POST`
   - URL: `http://localhost:3001/api/user/create`
   - Pestaña **Body → JSON**, escribe:
     ```json
     {
       "username": "ana",
       "email": "ana@correo.com"
     }
     ```
   - Pulsa **Send**. Respuesta esperada: `ok` (status `200`).
3. **Buscar usuario:**
   - Método: `POST`
   - URL: `http://localhost:3001/api/user/finduser`
   - Body JSON:
     ```json
     { "email": "ana@correo.com" }
     ```
   - Respuesta esperada (status `200`): el usuario con su `id`, `email` y `username`.
4. **Buscar un usuario que no existe:** cambia el email por `nadie@correo.com`. Respuesta esperada: `"usuario no encontrado"` con status `404`.
5. **Crear un email repetido:** vuelve a crear `ana@correo.com`. Respuesta: `error` (porque el email es `@unique`), y en la terminal del servidor verás el detalle del error.

### Opción B – Desde una segunda terminal de PowerShell

Abre otra terminal (icono **+** en el panel de la terminal) y ejecuta:

```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/user/create -Method Post -ContentType "application/json" -Body '{"username":"ana","email":"ana@correo.com"}'

Invoke-RestMethod -Uri http://localhost:3001/api/user/finduser -Method Post -ContentType "application/json" -Body '{"email":"ana@correo.com"}'
```

### Comprobar en MongoDB Atlas

En Atlas: **Database → Browse Collections** → base de datos `usuariosdb` → colección `users`. Ahí verás los documentos guardados. 🎉

---

## 18. Guardar el proyecto con Git y GitHub

### 18.1 Configurar Git (solo la primera vez en tu ordenador)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"
```

### 18.2 Guardar versiones (commits)

```bash
git init
git add .
git commit -m "feat: API de usuarios con Express, Prisma y MongoDB"
```

- `git init` → convierte la carpeta en un repositorio (solo una vez).
- `git add .` → prepara todos los archivos (excepto los de `.gitignore`).
- `git commit -m "..."` → guarda una "foto" del proyecto con un mensaje.

> ✅ Antes del commit, ejecuta `git status` y comprueba que **`.env` NO aparece** en la lista.

### 18.3 Subir a GitHub (opcional)

1. Crea una cuenta en <https://github.com> y un repositorio nuevo **vacío** (sin README).
2. GitHub te mostrará comandos parecidos a estos; cópialos y ejecútalos:

```bash
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### 18.4 Si otra persona descarga tu proyecto

Como `node_modules` y `.env` no se suben, quien clone el repositorio debe hacer:

```bash
npm install                # descarga todas las dependencias del package.json
# copiar .env.example a .env y poner su DATABASE_URL real
npm run dev
```

---

## 19. Solución de problemas frecuentes

| Mensaje / síntoma | Causa probable | Solución |
|---|---|---|
| `'node' no se reconoce como un comando` | Node no instalado o terminal abierta antes de instalarlo | Reinstala Node y reinicia VS Code. |
| `Cannot use import statement outside a module` | Falta `"type": "module"` en `package.json` | Añádelo (paso 5). |
| `Cannot find module '.../user.model'` | Falta la extensión `.js` en el `import` o la ruta está mal | Con `"type": "module"` hay que escribir siempre la extensión: `'../models/user.model.js'`. Revisa mayúsculas y nombres de carpetas (`controller`, no `controllers`). |
| `Unknown file extension ".ts"` | Versión de Node antigua | Instala Node 24 LTS o superior. |
| `Cannot find module './contract.json'` | No se generó el contrato | Ejecuta `npm run contract:emit`. |
| `EADDRINUSE: address already in use :::3001` | Ya hay un servidor corriendo en ese puerto | Cierra la otra terminal con `Ctrl + C`, o cambia `PORT` en `.env`. |
| `bad auth : authentication failed` | Usuario o contraseña de Atlas incorrectos | Revisa `DATABASE_URL`; quita `<` `>`. Si la contraseña tiene símbolos especiales, cámbiala en Atlas por una sin símbolos. |
| Se queda colgado o `Server selection timed out` | Tu IP no está permitida en Atlas | Atlas → **Network Access** → añade tu IP. |
| `req.body` es `undefined` | Falta `app.use(express.json())` o no enviaste el body como JSON | Revisa `index.js` y que en Thunder Client el body sea de tipo **JSON**. |
| Al crear siempre devuelve `error` | Email repetido, o falta el `email` en el body | Mira el detalle del error en la terminal del servidor. |
| Cambié `contract.prisma` y no se nota | No regeneraste el contrato | `npm run contract:emit` y reinicia el servidor. |

> 💡 **Consejo de oro:** cuando algo falle, **lee la terminal donde corre el servidor**. El error casi siempre dice en qué archivo y en qué línea está el problema.

---

## 20. Glosario

- **API:** conjunto de direcciones (URLs) a las que un programa puede pedir o enviar datos.
- **Endpoint / ruta:** cada una de esas direcciones, por ejemplo `/api/user/create`.
- **JSON:** formato de texto para intercambiar datos: `{ "clave": "valor" }`.
- **Dependencia / paquete:** código de terceros que instalas con npm.
- **Variable de entorno:** un valor (como una contraseña) que se guarda fuera del código, en `.env`, y se lee con `process.env.NOMBRE`.
- **ORM:** herramienta que traduce entre objetos de tu código y la base de datos (Prisma).
- **Colección:** grupo de documentos en MongoDB (equivalente a una "tabla").
- **Documento:** un registro dentro de una colección (equivalente a una "fila").
- **async / await:** forma de esperar operaciones que tardan (como consultar la base de datos) sin bloquear el programa.
- **try / catch:** estructura para manejar errores sin que el programa se detenga.
- **Commit:** una versión guardada de tu proyecto en Git.

---

## 21. Retos para seguir aprendiendo

Cuando todo funcione, intenta mejorar el proyecto tú mismo:

1. **Códigos de estado correctos:** ahora `createUserController` responde `200` aunque haya error. Haz que responda `201` si se creó y `400` o `409` si falló.
2. **Validación:** si el body no trae `email`, responde `400` con un mensaje claro antes de llamar a la base de datos.
3. **Nuevo campo:** añade `name String?` al modelo en `contract.prisma`, ejecuta `npm run contract:emit` y `npx prisma db init` (o el comando de migración que te indique Prisma), y guárdalo también al crear usuarios.
4. **Buscar con GET:** crea una ruta `GET /api/user/:email` que use `req.params.email` en vez del body.
5. **Listar todos:** crea `GET /api/user/all` que devuelva todos los usuarios.
6. **Borrar y actualizar:** investiga los métodos de `db.orm.users` para eliminar y modificar usuarios y crea sus rutas.

¡Enhorabuena por llegar hasta aquí! 🚀
