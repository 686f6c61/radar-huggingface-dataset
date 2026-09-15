# spst01/SmolLM2-135M-Sukshma

## Resumen

SmolLM2-135M-Sukshma es un artefacto de inferencia en el borde (edge AI) publicado por spst01 bajo la marca Sovereign Byte Technology. No se trata de un modelo entrenado desde cero, sino de una reempaquetado del modelo base HuggingFaceTB/SmolLM2-135M-Instruct (135 millones de parametros, pipeline de text-generation) en un contenedor binario propietario con extension `.sukshma`, generado mediante la tecnologia Sovereign Sub-Byte Discrete Compression (SSDC) y Adaptive Salient Feature Preservation.

El problema que aborda es el almacenamiento y el ancho de banda de memoria en dispositivos muy restringidos: segun la model card, el contenedor reduce el espacio fisico de 256,60 MB (SafeTensors originales) a 63,42 MB, lo que supone una reduccion de 4,05x (75,29 % de ahorro), y baja el consumo de RAM residente en movil de aproximadamente 1,1 GB a unos 245 MB. El autor declara ademas una aceleracion de 2,75x en la latencia de proyeccion de matrices (de 30,17 µs a 10,97 µs) en Apple Silicon M1, con una fidelidad coseno media por capa del 90,69 % respecto a los pesos FP32 originales.

Su relevancia actual es acotada pero concreta: apunta a telefonos moviles, pasarelas IoT, microcontroladores, Raspberry Pi y ejecucion en navegador mediante WebAssembly, con un runner Python sin dependencias y una demo HTML incluidos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion sin validacion comunitaria. La licencia declarada es Apache 2.0 para los pesos base, mientras que la capa de contenedorizacion y las herramientas se atribuyen a Sovereign Byte Technology.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; derivada del modelo base SmolLM2-135M-Instruct (transformer decoder) |
| Parametros totales | 134,5 millones (134,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantizacion | Compresion propietaria Sub-Byte Discrete Compression (SSDC) con Adaptive Salient Feature Preservation; no se declaran niveles tipo Q4/Q8 ni esquemas estandar |
| Idiomas soportados | No disponible (el campo de idiomas de HuggingFace figura como no disponible) |
| Licencia | Apache 2.0 (pesos base); la contenedorizacion y el tooling se atribuyen a Sovereign Byte Technology |
| Formato de pesos | Contenedor binario propietario `.sukshma` (magic number 0x53554B53, "SUKS"); pesos originales en SafeTensors |
| Tamano del repositorio | 0,1 GB |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Tarea | text-generation |
| Fecha de creacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo, porque este repositorio no contiene un entrenamiento nuevo: es una transformacion del checkpoint HuggingFaceTB/SmolLM2-135M-Instruct, que actua como `base_model` con la relacion `finetune`. La innovacion declarada es exclusivamente de representacion y ejecucion: Sovereign Sub-Byte Discrete Compression (SSDC) combinada con Adaptive Salient Feature Preservation, que comprime los tensores a un formato sub-byte preservando selectivamente las caracteristicas salientes. El autor reporta una fidelidad coseno media por capa del 90,69 % frente a los pesos FP32 de referencia, lo que implica una desviacion media de aproximadamente el 9,3 % por capa.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones mas alla de las que ya incorpora el modelo base Instruct. Tampoco se documentan innovaciones de decodificacion, atencion lineal ni estrategias de decodificacion especulativa. El repositorio incluye `sukshma_runner.py`, un cargador independiente sin dependencias que permite inspeccionar metadatos del contenedor, descomprimir tensores concretos (por ejemplo `model.layers.0.mlp.down_proj.weight`), ejecutar un benchmark de proyeccion forward a nivel de capa y verificar la reconstruccion de tensores. La verificacion de integridad del contenedor puede hacerse en el navegador leyendo el magic number del array buffer.

## Capacidades

- Generacion de texto y modo conversacional, heredados del modelo base Instruct (pipeline declarado: text-generation).
- Ejecucion en el borde: disenado para moviles, pasarelas IoT, microcontroladores, Raspberry Pi y hardware Apple Silicon de bajo consumo.
- Ejecucion en navegador mediante WebAssembly, con ejecucion en el lado del cliente y sin dependencias de servidor, a traves de `browser_demo.html`.
- Descompresion selectiva de tensores: permite cargar en memoria una capa o proyeccion concreta en lugar del modelo completo.
- Inspeccion y verificacion de contenedores: comandos `inspect`, `benchmark` y `verify` del runner incluido.
- SDK Python minimo mediante la clase `SukshmaModel`, con acceso a `model_name`, `total_elements`, `compressed_bytes` y `load_tensor`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el campo de idiomas de HuggingFace figura como no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes de texto sin conexion en movil: al ocupar 63,42 MB en disco y unos 245 MB de RAM residente segun el autor, el modelo puede empaquetarse dentro de una aplicacion Android o iOS para generar respuestas conversacionales sin enviar datos a un servidor, util en escenarios de privacidad o conectividad intermitente.
- Pasarelas IoT y domotica local: sobre una Raspberry Pi o una microVM, el contenedor permite clasificar o resumir textos de sensores y registros en el propio dispositivo, reduciendo el trafico de red y la dependencia de la nube.
- Demos y utilidades en navegador: mediante el `browser_demo.html` y la carga del array buffer `.sukshma`, se pueden construir prototipos de generacion de texto que se ejecutan integramente en el cliente, sin backend ni coste de servidor.
- Prototipado rapido de interfaces conversacionales: el `sukshma_runner.py` sin dependencias permite levantar un banco de pruebas en cualquier maquina con Python antes de invertir en infraestructura de GPU.
- Investigacion sobre compresion de pesos: el comando `verify` y la descompresion por capas permiten medir la fidelidad coseno por capa y estudiar el impacto de la cuantizacion sub-byte en tareas concretas.
- Verificacion de integridad en pipelines de distribucion: la comprobacion del magic number `SUKS` en el navegador o en el runner permite validar que un contenedor descargado no esta corrupto antes de su despliegue.
- Educacion y docencia sobre inferencia en el borde: el tamano reducido y la ausencia de dependencias facilitan reproducir un ciclo completo de carga, benchmark y ejecucion en un portatil de gama media o en un equipo Apple Silicon.

## Benchmarks y rendimiento

La model card publica una comparativa propia entre los SafeTensors oficiales y el contenedor `.sukshma`, medida en Apple Silicon M1. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, etc.) en la informacion disponible.

| Metrica | SafeTensors oficial | Sukshma (.sukshma) | Diferencia declarada |
|---|---|---|---|
| Huella fisica en disco | 256,60 MB | 63,42 MB | 4,05x menor (75,29 % de ahorro) |
| RAM activa en movil | ~1,1 GB residente | ~245 MB residente | Permite ejecucion en Raspberry Pi y microVMs |
| Fidelidad coseno media por capa | 100,0 % (FP32) | 90,69 % | Desviacion media de ~9,3 % por capa |
| Latencia de proyeccion de matrices | 30,17 µs | 10,97 µs | 2,75x mas rapido |
| Throughput en el borde | 33.145 layer-ops/s | 91.137 layer-ops/s | Ejecucion ALU optimizada para hardware |
| Consumo energetico | Carga FMA estandar | Ejecucion entera de bajo consumo | ~60 % menos de consumo de bateria |

Estos datos son autodeclarados por el autor y no se acompanan de scripts de reproduccion publicos, semilla ni metodologia detallada, por lo que deben tratarse como cifras de marketing pendientes de verificacion independiente.

## Requisitos de hardware

- Almacenamiento: 63,42 MB para el contenedor `.sukshma`, frente a 256,60 MB de los SafeTensors originales.
- RAM: aproximadamente 245 MB residentes en movil segun el autor, frente a unos 1,1 GB del checkpoint sin comprimir.
- Hardware objetivo declarado: telefonos moviles, pasarelas IoT, microcontroladores, Raspberry Pi, microVMs y Apple Silicon de bajo consumo (la comparativa se midio en un M1).
- GPU dedicadas (A100, H100, RTX 4090): no disponibles en la informacion proporcionada; el artefacto esta orientado a CPU y ejecucion en el borde, no a GPU de centro de datos.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte CUDA.
- Opciones de despliegue: `sukshma_runner.py` (cargador Python sin dependencias) y `browser_demo.html` (WebAssembly en Chrome, Safari, Firefox, Edge, Mobile Safari). No se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia estandar.
- Latencia declarada: 10,97 µs por proyeccion de matriz, frente a 30,17 µs del checkpoint original.
- Throughput declarado: 91.137 layer-ops/s frente a 33.145 layer-ops/s del original.
- Tokens por segundo en generacion de texto: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el contenedor con su propio modelo base. No se aportan datos verificables de alternativas de la misma categoria (por ejemplo, otros modelos de 100-200 millones de parametros) dentro de la documentacion proporcionada.

| Modelo | Parametros | Formato | Tamano en disco | RAM en movil | Fidelidad / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SmolLM2-135M-Sukshma | 134,5 M | `.sukshma` (SSDC) | 63,42 MB | ~245 MB | 90,69 % de fidelidad coseno por capa; 2,75x mas rapido | Apache 2.0 (pesos base) + tooling propietario | HuggingFace, 0 descargas |
| SmolLM2-135M-Instruct (base) | 134,5 M | SafeTensors | 256,60 MB | ~1,1 GB | Referencia FP32 (100 % de fidelidad) | Apache 2.0 | HuggingFace (HuggingFaceTB) |
| Otras alternativas de ~100-500 M | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Las cifras de compresion, latencia, throughput y ahorro energetico son autodeclaradas por el fabricante y no se han verificado de forma independiente; no se publican scripts de reproduccion, semilla ni entorno exacto de medida.
- La fidelidad coseno media por capa del 90,69 % implica una perdida de aproximadamente el 9,3 % por capa respecto a FP32; el impacto real en calidad de generacion, coherencia y exactitud factual no se cuantifica con benchmarks estandar.
- No hay resultados publicados de MMLU, HumanEval, GSM8K ni de ninguna evaluacion de calidad, por lo que no puede compararse objetivamente con el modelo base ni con alternativas.
- Riesgo de alucinacion: el modelo procede de un checkpoint de 135 M de parametros, cuyo conocimiento factual es limitado por diseno; la compresion adicional puede agravarlo en tareas que dependan de matices finos.
- Bloqueo de formato: el contenedor `.sukshma` es propietario y no se declara soporte en ecosistemas estandar como llama.cpp, vLLM, Ollama o TGI, lo que limita la portabilidad y complica migrar a otra herramienta.
- La licencia Apache 2.0 cubre los pesos base, pero la contenedorizacion y el tooling se reservan a Sovereign Byte Technology, que ofrece licencias comerciales por correo; conviene revisar los terminos antes de un uso comercial del formato o de las herramientas.
- Idiomas soportados no disponibles: el campo de idiomas de HuggingFace esta vacio y la model card no especifica cobertura multilingue, por lo que no se debe asumir un rendimiento adecuado en castellano.
- El repositorio registra 0 descargas y 0 likes, sin validacion de la comunidad ni issues publicos; el soporte depende de un unico contacto de correo.
- Al ejecutar un contenedor binario propietario y un runner de terceros, conviene auditar el codigo antes de desplegarlo en entornos de produccion o en dispositivos con datos sensibles.
- La longitud de contexto no se documenta en esta ficha; debe consultarse en la documentacion del modelo base antes de disenar aplicaciones que dependan de conversaciones largas.
- No se indica si el proceso de compresion es reversible sin perdida, por lo que `verify` debe interpretarse como una comprobacion de reconstruccion de tensores, no como una garantia de equivalencia funcional con el modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spst01/SmolLM2-135M-Sukshma
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Contacto del autor (licencias comerciales y despliegue empresarial): sovereignbyte.tech@gmail.com
- Paper tecnico de SSDC: no disponible
- Repositorio de codigo independiente: no disponible
- Demo publica alojada: no disponible (la demo se distribuye como `browser_demo.html` dentro del propio repositorio)
- Enlaces relevantes encontrados en la busqueda web: no se han encontrado enlaces relacionados con el modelo; los resultados devueltos corresponden a servicios financieros sin relacion con este artefacto.
