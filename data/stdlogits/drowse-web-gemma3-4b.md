# stdlogits/drowse-web-gemma3-4b

## Resumen

drowse-web-gemma3-4b es un artefacto de inferencia en navegador derivado de Gemma 3 4B Instruct (concretamente de la version cuantizada de Unsloth). Lo publica el usuario stdlogits como parte del proyecto drowse.ai, una aplicacion web que ejecuta el modelo en el dispositivo del usuario mediante WebGPU y permite leer y dirigir sus estados internos durante la generacion. No es un checkpoint de Transformers: el repositorio contiene pesos convertidos con MLC LLM, el tokenizador, una libreria de modelo WebAssembly con los hooks de drowse compilados y un paquete de geometria base con estadisticas neutrales y variedades conceptuales por defecto.

El modelo base es un transformer de 4.000 millones de parametros con ventana de contexto de 128.000 tokens en su version original; en este artefacto la inferencia se limita a dos perfiles de contexto, 2048 y 4096 tokens. La relevancia del proyecto es sobre todo metodologica: demuestra un flujo completo de interpretabilidad mecanicista en el navegador, con pesos de 4 bits y computo en float32, sin depender de servidores ni de GPU dedicadas.

La licencia es mixta y se aplica por componente (pesos, runtime, instrumentos), lo que obliga a revisar LICENSES.md antes de cualquier uso. El repositorio tiene 2,5 GB y registra 35 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), artefacto compilado para MLC LLM/WebGPU |
| Parametros totales | 4.000 millones (heredados del modelo base Gemma 3 4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 y 4096 tokens (dos perfiles de artefacto) |
| Tipos de cuantizacion | `q4f32_1`: pesos de 4 bits, computo en float32 |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | mixta por componente (`mixed-artifact-licenses`), ver LICENSES.md |
| Formato de pesos | artefactos MLC LLM para navegador (no safetensors ni GGUF), con tokenizador y libreria WebAssembly |
| Modelo base | unsloth/gemma-3-4b-it (revision bf46152c47f5dd20b896357cb51abc4c03b8ee8c) |
| Runtime | `drowse-web-runtime-v2`, hook ABI `block-sites-v5`, perfil `standard-v4` |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 4B Instruct, un transformer decoder-only de Google DeepMind afinado para instrucciones. Este repositorio no entrena ni afina el modelo: parte de la version cuantizada de Unsloth y la convierte con MLC LLM a un formato ejecutable en WebGPU. La cuantizacion `q4f32_1` almacena los pesos en 4 bits y realiza el computo en float32, un compromiso habitual en WebGPU para reducir el ancho de banda de memoria sin perder demasiada calidad numerica.

La innovacion tecnica del artefacto no esta en el entrenamiento sino en la instrumentacion. La libreria WebAssembly incluye hooks compilados en puntos concretos de los bloques (ABI `block-sites-v5`), lo que permite a drowse.ai leer activaciones y aplicar direcciones durante la decodificacion. El paquete de geometria base aporta estadisticas neutrales y variedades conceptuales por defecto para cada contexto; las lentes R, S y de unidades, junto con las features de Gemma Scope, se distribuyen en un repositorio separado de instrumentos. La reproducibilidad se documenta mediante `drowse-build.json`, que registra los ficheros fuente, el commit base de MLC LLM y el hash de cada overlay del compilador, y `hosted-artifacts.json`, que lista cada fichero con su digest SHA-256. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas de Gemma 3 4B Instruct.
- Ejecucion local en el navegador mediante WebGPU, sin backend remoto.
- Lectura de estados internos durante la generacion (hooks en los bloques del transformer).
- Direccion (steering) de la generacion mediante las lentes y variedades conceptuales del paquete de geometria.
- Analisis de interpretabilidad con las features de Gemma Scope, distribuidas en el repositorio de instrumentos.
- Verificacion de integridad de los artefactos mediante digests SHA-256 y catalogo firmado.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: cargar el modelo en drowse.ai y registrar activaciones por bloque mientras se genera texto, usando los hooks del ABI `block-sites-v5` para estudiar como se forma una respuesta token a token.
- Steering controlado en el navegador: aplicar las variedades conceptuales del paquete de geometria para desplazar la generacion hacia un concepto y medir el efecto sobre la salida, sin infraestructura de servidor.
- Demostraciones docentes de circuitos internos: un curso de interpretabilidad puede mostrar en clase, en un portatil con WebGPU, como se leen y modifican representaciones internas de un modelo de 4B.
- Prototipado de asistentes conversacionales privados: el modelo se ejecuta en el dispositivo del usuario, de modo que el texto no sale del navegador, lo que resulta adecuado para pruebas de concepto con datos sensibles.
- Auditoria de artefactos y cadena de suministro: el catalogo firmado y los ficheros de digests permiten verificar que los pesos y la libreria cargados corresponden a una revision inmutable, util en entornos con requisitos de trazabilidad.
- Comparacion de cuantizaciones en WebGPU: el perfil `q4f32_1` con contexto de 2048 y 4096 tokens sirve para medir latencia y calidad en hardware de consumo frente a otras configuraciones.
- Analisis de features con Gemma Scope: cruzar las activaciones del modelo con las features del repositorio de instrumentos para identificar unidades interpretables asociadas a conceptos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU con soporte de WebGPU (Chrome, Edge y navegadores compatibles); sin WebGPU el artefacto no es ejecutable.
- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 2,5 GB y los pesos son de 4 bits con computo en float32, por lo que el consumo de memoria supera el de una carga puramente de 4 bits.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada en la informacion proporcionada; la orientacion del proyecto es la ejecucion en dispositivo, pero no se detallan modelos concretos.
- Opciones de despliegue: exclusivamente a traves de drowse.ai y su runtime `drowse-web-runtime-v2`; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un checkpoint de Transformers ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| drowse-web-gemma3-4b | 4.000 M | 2048 / 4096 | artefactos MLC LLM + WebAssembly | mixta por componente | si, via WebGPU |
| unsloth/gemma-3-4b-it (base) | 4.000 M | no disponible en esta ficha | safetensors cuantizados | heredada de Gemma | no |
| Gemma 3 4B Instruct (original) | 4.000 M | 128.000 (segun especificaciones publicas de Gemma 3) | safetensors | terminos de Gemma | no |

La comparativa se limita al linaje directo del artefacto porque no se dispone de datos de rendimiento de alternativas instrumentadas para navegador en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: no puede cargarse con `transformers`, vLLM, llama.cpp ni Ollama; solo funciona con el runtime de drowse.ai.
- Contexto reducido a 2048 o 4096 tokens, muy por debajo de la ventana nativa de Gemma 3, lo que limita conversaciones largas y tareas de recuperacion sobre documentos extensos.
- La cuantizacion de 4 bits puede degradar la calidad respecto al modelo base en tareas de razonamiento o codigo.
- Licencia mixta por componente: es obligatorio revisar LICENSES.md y los terminos de Gemma antes de cualquier uso, incluido el comercial.
- Riesgo de alucinacion inherente a un modelo de 4B; no se han publicado evaluaciones que lo cuantifiquen en este artefacto.
- Idiomas soportados no declarados; no se garantiza un comportamiento adecuado en castellano.
- Sesgos conocidos del modelo base no documentados en la informacion proporcionada.
- Dependencia de WebGPU y del catalogo firmado de drowse.ai, lo que introduce un punto de fallo externo en la cadena de despliegue.
- Proyecto con 35 descargas y 0 likes: ecosistema pequeno, con soporte comunitario limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stdlogits/drowse-web-gemma3-4b
- Repositorio de instrumentos: https://huggingface.co/stdlogits/drowse-web-gemma3-4b-instruments
- Modelo base cuantizado: https://huggingface.co/unsloth/gemma-3-4b-it/tree/bf46152c47f5dd20b896357cb51abc4c03b8ee8c
- Licencias por componente: https://huggingface.co/stdlogits/drowse-web-gemma3-4b/blob/main/LICENSES.md
- Aplicacion drowse.ai: https://drowse.ai
- Repositorio de drowse: https://github.com/stdlogits/drowse
- Repositorio de la edicion web: https://github.com/stdlogits/drowse.ai
