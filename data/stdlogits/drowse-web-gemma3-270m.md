# stdlogits/drowse-web-gemma3-270m

## Resumen

drowse-web-gemma3-270m es un artefacto de inferencia en navegador construido a partir de un ajuste fino de Gemma 3 270M Instruct (concretamente, `unsloth/gemma-3-270m-it`). Lo publica el usuario `stdlogits` como parte del proyecto drowse, una herramienta de interpretabilidad que permite leer y manipular el estado interno del modelo mientras genera texto. El modelo no se distribuye como checkpoint de Transformers, sino como pesos convertidos a formato MLC LLM, tokenizador, biblioteca WebAssembly con hooks de instrumentacion y paquetes de geometria (estadisticas neutrales y variedades conceptuales por defecto).

Su relevancia no esta en el rendimiento bruto, sino en el caso de uso: ejecutar un modelo de lenguaje pequeno integramente en el navegador mediante WebGPU, sin servidor, y exponer sus activaciones para inspeccion y control durante la decodificacion. Es, por tanto, una pieza orientada a investigacion de interpretabilidad y a demostraciones interactivas en web, no un modelo generalista de produccion.

El modelo base aporta una arquitectura transformer decoder-only de 270 millones de parametros con ventana de contexto de 2048 y 4096 tokens en esta distribucion. El repositorio ocupa 1,4 GB y contiene pesos en float32 sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, ajuste fino de `unsloth/gemma-3-270m-it`) |
| Parametros totales | 270 millones (segun denominacion del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 y 4096 tokens |
| Tipos de cuantizacion | no disponible; los pesos publicados son `q0f32` (float32 sin cuantizar) |
| Idiomas soportados | no disponibles en la informacion proporcionada |
| Licencia | `other` (`mixed-artifact-licenses`, por componentes; ver `LICENSES.md`) |
| Formato de pesos | pesos convertidos para MLC LLM (`q0f32`), mas tokenizador, biblioteca WebAssembly y paquetes de geometria; no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 270M Instruct, un transformer decoder-only de 270 millones de parametros publicado por Google y redistribuido por Unsloth en su variante instruct. Sobre esa base, este repositorio no documenta un entrenamiento adicional propio: la model card describe artefactos de conversion e instrumentacion, no un proceso de ajuste con datos nuevos. No se dispone de informacion sobre volumen de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) aplicadas en esta distribucion.

La innovacion tecnica esta en el runtime. Los pesos se compilan con MLC LLM (con commits de TVM, MLC LLM y WebLLM fijados y parches propios) para ejecutarse en WebGPU dentro del navegador. La biblioteca incluye hooks con ABI `block-sites-v5` y perfil `standard-v4` que permiten leer y dirigir el modelo durante la generacion. Se distribuyen ademas lentes R y S, paquetes de unidades y caracteristicas Gemma Scope en un repositorio hermano, orientados al analisis de representaciones internas.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste instruct de Gemma 3 270M.
- Ejecucion en el dispositivo del usuario mediante WebGPU, sin backend remoto.
- Lectura de activaciones internas por bloque durante la decodificacion (hooks de interpretabilidad).
- Direccion o steering del modelo en tiempo de generacion mediante las lentes y variedades conceptuales incluidas.
- Inspeccion con caracteristicas Gemma Scope (alojadas en el repositorio de instrumentos).
- Contexto de 2048 o 4096 tokens segun la configuracion de contexto elegida.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles en esta distribucion.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion de interpretabilidad en navegador: el modelo permite visualizar activaciones por bloque mientras genera, lo que facilita experimentos docentes y de analisis sin infraestructura de servidor.
- Demos interactivas de mecanismos internos: al ejecutarse en WebGPU, se puede publicar una pagina que muestre como cambian las representaciones al modificar el prompt, sin coste de GPU en la nube.
- Steering de comportamiento en tiempo real: las lentes R y S y las variedades conceptuales permiten empujar la generacion hacia un concepto y observar el efecto, util para estudiar control de representaciones.
- Prototipado de asistentes conversacionales ligeros: con contexto de 2048-4096 tokens y 270 millones de parametros, sirve para validar flujos de chat en el cliente antes de escalar a un modelo mayor.
- Educacion en arquitecturas de lenguaje: el paquete de geometria y los hooks hacen tangible el funcionamiento de un transformer pequeno en un entorno reproducible.
- Auditoria de privacidad por diseno: al no enviar datos a un servidor, encaja en escenarios donde el texto del usuario no debe salir del dispositivo, como pruebas internas con datos sensibles.
- Verificacion de artefactos y cadena de suministro: `drowse-build.json` y los manifiestos con digest SHA-256 permiten reproducir la compilacion y auditar cada fichero descargado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 270 millones de parametros en float32, el peso de los pesos ronda 1,1 GB, a lo que se suman activaciones y buffers del runtime.
- El modelo no se ejecuta mediante CUDA sino en WebGPU, por lo que el requisito es un navegador con soporte WebGPU y una GPU compatible.
- GPU de escritorio: tarjetas con WebGPU estable (por ejemplo, series RTX 30/40 en Windows o Chrome/Edge recientes) son el objetivo natural; no se documentan modelos concretos validados.
- GPU integradas y moviles: no hay datos de compatibilidad ni de rendimiento publicados.
- Despliegue: exclusivamente a traves de drowse.ai, que instala los artefactos desde un catalogo firmado; no esta pensado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ejecucion | Licencia | Orientacion |
|---|---|---|---|---|---|
| drowse-web-gemma3-270m | 270 M | 2048 / 4096 | Navegador (WebGPU, MLC LLM) | `mixed-artifact-licenses` | Interpretabilidad y steering en cliente |
| Gemma 3 270M Instruct (base) | 270 M | no disponible en esta ficha | Servidor o local con frameworks estandar | Terminos de Gemma | Uso general ligero |
| Modelos pequenos tipo Qwen o Llama de <1 B | entre 0,5 y 1 B | variable | Local con llama.cpp, Ollama, etc. | variable | Asistentes ligeros en dispositivo |

La comparacion directa con alternativas de interpretabilidad en navegador no esta disponible: no se han identificado en la informacion proporcionada otros paquetes con hooks de activacion y geometria conceptual publicados de forma equivalente.

## Limitaciones y advertencias

- Con 270 millones de parametros, la calidad de razonamiento, codigo y matematicas es limitada frente a modelos de varios miles de millones; no es adecuado para tareas complejas de produccion.
- Riesgo de alucinacion alto, inherente al tamano y a la falta de datos de alineacion documentados en esta distribucion.
- Contexto maximo de 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados no documentados; no se debe asumir buen rendimiento en castellano sin evaluacion previa.
- Licencia `mixed-artifact-licenses`: los terminos se aplican por componente y hay que revisar `LICENSES.md` antes de cualquier uso comercial o redistribucion.
- No es un checkpoint de Transformers: no se puede cargar con `transformers`, vLLM ni llama.cpp; el uso esta atado al runtime de drowse y a su catalogo firmado.
- Dependencia de WebGPU: navegadores o equipos sin soporte estable no podran ejecutarlo.
- Los pesos en float32 implican mayor uso de memoria que una version cuantizada; no se ofrecen variantes cuantizadas en este repositorio.
- Proyecto con 36 descargas y 0 likes en el momento de la consulta: ecosistema pequeno y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stdlogits/drowse-web-gemma3-270m
- Repositorio de instrumentos (lentes R y S, unidades, Gemma Scope): https://huggingface.co/stdlogits/drowse-web-gemma3-270m-instruments
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-270m-it/tree/23cf460f6bb16954176b3ddcc8d4f250501458a9
- Licencias por componente: https://huggingface.co/stdlogits/drowse-web-gemma3-270m/blob/main/LICENSES.md
- Proyecto drowse: https://github.com/stdlogits/drowse
- Edicion web drowse.ai: https://drowse.ai
- Codigo de la edicion web: https://github.com/stdlogits/drowse.ai
