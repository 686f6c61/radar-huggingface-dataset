# zokizuan/satori-cbm-extractors

## Resumen

`zokizuan/satori-cbm-extractors` no es un modelo de lenguaje: es un paquete extendido de módulos WebAssembly que el proyecto Satori utiliza para la extracción de símbolos en código fuente. Cada módulo es el extractor de definiciones de [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) (fijado en el commit `11b662f9f7fba92012b872dd4fcaef7ee0c1300d`) compilado con Emscripten 3.1.64 junto con la gramática de tree-sitter de cada lenguaje, vendorizada en ese mismo proyecto.

El repositorio contiene 101 módulos que constituyen el "extended pack"; los 39 módulos centrales viajan dentro del paquete npm de Satori. La función de `satori install` es descargar este pack en una revisión fijada y verificar cada archivo contra el sha256 registrado en `packages/core/assets/cbm-extractor/manifest.json`, lo que convierte al repositorio en un artefacto de distribución con integridad verificable más que en un modelo entrenado.

Su relevancia es de infraestructura: permite que herramientas de análisis de código ejecuten extracción de símbolos multilingüe dentro de un runtime WebAssembly, sin necesidad de compilar gramáticas nativas por lenguaje ni de depender de binarios específicos de cada plataforma. El repositorio tiene 0 descargas y 0 likes, un tamaño de 0,1 GB y fue creado el 28 de septiembre de 2026 según los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulos WebAssembly compilados con Emscripten 3.1.64; cada modulo encapsula el extractor de definiciones de codebase-memory-mcp y una gramatica tree-sitter vendorizada |
| Parametros totales | no aplica (no es un modelo neuronal) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | 101 lenguajes de programacion en el extended pack (la lista concreta no esta disponible en la informacion proporcionada) |
| Licencia | MIT para el extractor (`LICENSE-codebase-memory-mcp`); cada gramatica conserva su licencia upstream tal como la vendoriza codebase-memory-mcp |
| Formato de pesos | Modulos `.wasm` (WebAssembly) distribuidos junto a un `manifest.json` con hashes sha256 |
| Autor | zokizuan |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

No existe entrenamiento. El artefacto se produce por compilacion cruzada: el extractor de definiciones de codebase-memory-mcp, escrito en C/C++ y fijado en un commit concreto, se compila con Emscripten 3.1.64 junto con la gramatica tree-sitter vendorizada de cada lenguaje, generando un modulo WebAssembly por lenguaje. El resultado es un conjunto de binarios portables que exponen la misma logica de extraccion de simbolos que la version nativa, ejecutables en cualquier runtime compatible con WebAssembly.

La innovacion tecnica relevante es la de distribucion y verificacion de integridad: los modulos se publican como un pack versionado, Satori los descarga en una revision fijada y valida cada archivo contra el sha256 registrado en su manifiesto. Esto elimina la necesidad de compilar gramaticas nativas en la maquina del usuario y garantiza reproducibilidad de la cadena de analisis. El repositorio aloja el extended pack (101 modulos); los 39 modulos core se distribuyen dentro del paquete npm.

## Capacidades

- Extraccion de simbolos y definiciones de codigo fuente mediante gramaticas tree-sitter, un modulo por lenguaje.
- Analisis de codigo en 101 lenguajes de programacion del extended pack, sumados a los 39 lenguajes del pack core incluido en el paquete npm.
- Ejecucion portable en cualquier runtime WebAssembly (navegador, Node.js, entornos embebidos) sin recompilacion por plataforma.
- Verificacion de integridad por hash sha256 de cada modulo durante la instalacion mediante `satori install`.
- Integracion en la cadena de herramientas de Satori para construir memoria de base de codigo a partir de simbolos extraidos.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling: no es un modelo generativo.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues en el sentido de cobertura de lenguajes de programacion; no hay soporte de lenguajes naturales declarado.

## Casos de uso

- Indexacion de repositorios poliglotas: un pipeline que procese un monorepo con codigo en varios lenguajes puede cargar los modulos `.wasm` correspondientes y extraer definiciones de forma homogenea, sin mantener toolchains de compilacion por lenguaje.
- Herramientas de analisis en el navegador: al ser WebAssembly, los modulos permiten construir visores o exploradores de codigo que extraigan simbolos en el cliente, sin enviar el codigo fuente a un servidor.
- Servidores MCP de memoria de codigo: integracion directa con codebase-memory-mcp para alimentar indices de definiciones que despues consumen asistentes y agentes de programacion.
- Integracion en CI/CD: verificacion de que el pack descargado coincide con los hashes esperados antes de ejecutar tareas de analisis estatico o generacion de documentacion de API.
- Generacion de documentacion tecnica: extraccion de la lista de funciones, clases y tipos de un proyecto para producir referencias de API de forma automatizada.
- Entornos con restricciones de despliegue: plataformas donde no se permite instalar compiladores ni binarios nativos pueden ejecutar la extraccion apoyandose unicamente en el runtime WebAssembly disponible.
- Analisis de dependencias y navegacion de codigo: uso de los simbolos extraidos para construir grafos de definicion y referencia en editores e IDEs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de latencia, throughput ni cobertura de extraccion por lenguaje, y los resultados de busqueda web obtenidos no guardan relacion con este repositorio.

## Requisitos de hardware

- No requiere GPU: el artefacto son modulos WebAssembly con soporte de CPU.
- No requiere VRAM; el consumo relevante es memoria RAM del runtime WebAssembly durante el analisis.
- Huella en disco: el repositorio ocupa 0,1 GB, a lo que hay que sumar los 39 modulos core incluidos en el paquete npm de Satori.
- CPU: cualquier procesador capaz de ejecutar un runtime WebAssembly moderno (Node.js, navegadores actuales); no hay requisitos especificos publicados.
- Opciones de despliegue: runtime WebAssembly del entorno anfitrion (Node.js o navegador) a traves de la CLI de Satori y de `satori install`; no se contemplan vLLM, llama.cpp, Ollama ni TGI, que son runners de modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Alternativa | Naturaleza | Cobertura de lenguajes | Licencia | Disponibilidad |
|---|---|---|---|---|
| zokizuan/satori-cbm-extractors (este repositorio) | Modulos WebAssembly con gramaticas tree-sitter | 101 modulos en el extended pack, mas 39 core en el paquete npm | MIT para el extractor; licencias upstream por gramatica | Publicado en HuggingFace, 0 descargas |
| codebase-memory-mcp (upstream) | Extractor de definiciones en C/C++ con gramaticas vendorizadas | 39 modulos core citados en la model card | MIT | Repositorio GitHub de DeusData |
| Gramaticas tree-sitter nativas | Bibliotecas compiladas por lenguaje | Depende del conjunto instalado | Licencia de cada gramatica | Ecosistema tree-sitter |
| Binarios de analisis estatico nativos | Ejecutables por plataforma | Variable | Variable | Requiere compilacion o distribucion por plataforma |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- La lista concreta de los 101 lenguajes del extended pack no esta disponible en la informacion proporcionada; hay que consultar el manifiesto del proyecto para conocerla.
- Licencias mixtas: aunque el extractor es MIT, cada gramatica tree-sitter conserva su licencia upstream. Es necesario revisar la licencia de cada gramatica vendorizada antes de un uso comercial o de redistribucion.
- La licencia MIT del extractor facilita el uso comercial, pero no cubre necesariamente las gramaticas de terceros incluidas en el pack.
- Riesgo de dependencia de version: el extractor esta fijado al commit `11b662f9f7fba92012b872dd4fcaef7ee0c1300d` y compilado con Emscripten 3.1.64; cambios en Satori o en las gramaticas pueden requerir regenerar el pack.
- La verificacion por sha256 depende de la disponibilidad del manifiesto en el paquete npm; si el manifiesto y el pack descargado divergen, la instalacion fallara.
- Cobertura y precision de extraccion por lenguaje: no disponibles en la informacion proporcionada.
- Repositorio sin adopcion registrada (0 descargas, 0 likes) y con fechas de creacion y actualizacion fuera del rango habitual (2026), lo que conviene verificar antes de integrarlo en produccion.
- No hay resultados de busqueda web relevantes: las busquedas devolvieron exclusivamente sitios de una asociacion francesa de material educativo de matematicas, sin relacion con este artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zokizuan/satori-cbm-extractors
- Proyecto Satori: https://github.com/zokizuan/satori
- codebase-memory-mcp: https://github.com/DeusData/codebase-memory-mcp
- Commit de referencia del extractor: `11b662f9f7fba92012b872dd4fcaef7ee0c1300d`
- Enlaces adicionales relevantes: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
