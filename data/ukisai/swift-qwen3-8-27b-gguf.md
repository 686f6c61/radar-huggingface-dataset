# ukisai/Swift-Qwen3.8-27B-GGUF

## Resumen

Swift-Qwen3.8-27B es una variante de razonamiento eficiente del modelo Qwen3.8-27B desarrollada por UkisAI. Su propuesta central es reducir de forma agresiva el numero de tokens de "pensamiento" generados durante la fase de razonamiento (hasta un 58,3% menos en la mediana de varios benchmarks) manteniendo una perdida de precision declarada inferior al 1% respecto al modelo base, lo que se traduce en una aceleracion de hasta x1,95 en varias tareas. La ficha que nos ocupa es la version cuantizada en GGUF del modelo, pensada para inferencia local con llama.cpp y herramientas compatibles.

El modelo parte de Qwen3.8-27B y se obtiene aplicando un adaptador ("Swift adapter") sobre la base en BF16, segun la comparativa de evaluacion publicada por el autor. Conserva el pipeline `image-text-to-text`, por lo que se trata de un modelo multimodal de entrada imagen y texto, no solo de texto. El repositorio GGUF ocupa 145,6 GB y contiene 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones).

Es relevante ahora porque ataca un cuello de botella muy concreto en produccion: el coste de inferencia de los modelos con modo de razonamiento extendido. Un modelo que mantiene puntuaciones casi identicas en GPQA-Diamond, MMLU-Pro o C-Eval generando menos de la mitad de tokens de pensamiento reduce directamente latencia y coste por peticion, algo critico en despliegues con volumen alto. La contrapartida es que se distribuye bajo una licencia propia (`swift-open-license-1.0`) con via de licenciamiento empresarial, no bajo una licencia open source estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la informacion proporcionada; el pipeline `image-text-to-text` y los tags `qwen3_8` / `qwen3_5` indican una derivacion multimodal de Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (aprox. 27,3B) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF para llama.cpp con uso de `imatrix`; niveles concretos (Q4_K_M, Q5_K_M, Q6_K, Q8_0, etc.) no disponibles |
| Idiomas soportados | no disponible (la evaluacion incluye C-Eval, benchmark en chino, lo que sugiere soporte de chino, pero la lista oficial no se publica) |
| Licencia | `swift-open-license-1.0` (etiquetada como `license: other`), con enlace a licenciamiento empresarial |
| Formato de pesos | GGUF (`library_name: gguf`); existe un modelo base en BF16 en `ukisai/Swift-Qwen3.8-27b` |
| Modelo base | `ukisai/Swift-Qwen3.8-27b` (relacion: `quantized`) |
| Pipeline | `image-text-to-text` |
| Autor | `ukisai` |
| Tamano del repositorio | 145,6 GB |
| Descargas / likes | 0 descargas / 10 likes |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 |
| Tags relevantes | `gguf`, `llama.cpp`, `qwen3_8`, `qwen3_5`, `efficient-thinking`, `reasoning`, `token-efficient`, `imatrix`, `conversational`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. Lo que si se explicita es el metodo de derivacion: la evaluacion publicada compara el modelo base Qwen3.8-27B en BF16 con "el mismo modelo base mas el adaptador Swift", lo que indica que el modelo se obtiene mediante un adaptador (previsiblemente del tipo LoRA o similar) aplicado sobre la base, orientado a comprimir la traza de razonamiento. Dado el pipeline `image-text-to-text`, la base es multimodal, capaz de procesar entradas de imagen y texto.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. Tampoco se detalla la innovacion tecnica exacta del adaptador mas alla de su objetivo declarado: reducir tokens de pensamiento manteniendo la precision. Los resultados cuantitativos indican que el efecto es sistematico en razonamiento general, matematicas e instrucciones: reducciones de tokens medios de entre el 26,7% y el 46,2% segun el benchmark, con una mediana que llega a bajar hasta un 58,3% (GPQA-Diamond).

## Capacidades

- Generacion de texto conversacional, con tag explicito `conversational`.
- Razonamiento con modo de pensamiento eficiente (`efficient-thinking`): genera trazas de razonamiento mas cortas que el modelo base.
- Razonamiento cientifico de nivel experto: evaluado en GPQA-Diamond (88,28% en la variante Swift).
- Matematicas competitivas: evaluado en AIME 2026 (94,00%) y HMMT Noviembre 2025 (96,00%).
- Conocimiento general y multidisciplinar: MMLU-Pro (84,95%), C-Eval (90,62%).
- Seguimiento de instrucciones complejas: IFBench (71,80%).
- Generacion y razonamiento sobre codigo: la demo del autor usa un prompt de muestra de LiveCodeBench v6, benchmark de generacion de codigo competitivo.
- Entrada multimodal de imagen y texto (`image-text-to-text`), lo que habilita tareas de comprension visual combinadas con razonamiento.
- Capacidades multilingues: la inclusion de C-Eval implica evaluacion en chino; la lista completa de idiomas no esta disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada (el modo de razonamiento interno si esta documentado).

## Casos de uso

- Razonamiento cientifico asistido: el modelo alcanza un 88,28% en GPQA-Diamond generando un 41,0% menos de tokens medios que la base, por lo que es adecuado para asistentes de investigacion donde el coste por consulta importa mas que la traza de razonamiento completa.
- Resolucion de problemas matematicos en produccion: con un 94,00% en AIME 2026 y un 96,00% en HMMT, encaja en plataformas de tutoria o verificacion de calculos, y la reduccion de tokens (26,7% y 31,1% respectivamente) abarata el coste por problema resuelto.
- Asistente de codigo integrado en IDE o pipeline de revision: la demo oficial usa un prompt de LiveCodeBench v6, de modo que el modelo esta orientado a tareas de programacion con razonamiento previo a la respuesta.
- Atencion al cliente automatizada y conversacion multi-turno: el tag `conversational` y el pipeline multimodal permiten gestionar dialogos donde el usuario adjunta capturas de pantalla o imagenes junto al texto.
- Procesamiento de documentos con imagen y texto: analisis de capturas, formularios escaneados o diagramas combinados con preguntas en lenguaje natural, aprovechando la entrada `image-text-to-text`.
- Despliegue en local o en el borde: al publicarse en GGUF, es viable ejecutarlo con llama.cpp en estaciones de trabajo o servidores con GPU de gama alta sin depender de una API externa, algo relevante para datos sensibles.
- Extraccion de respuestas estructuradas bajo instrucciones estrictas: el rendimiento en IFBench (71,80%) lo hace utilizable en pipelines que exigen formato rigido de salida, aunque con una perdida de 1,73 puntos frente a la base.
- Evaluacion comparativa de eficiencia de razonamiento: util como referencia interna para medir el impacto de tecnicas de compresion de tokens de pensamiento frente a un baseline BF16.

## Benchmarks y rendimiento

Los unicos datos disponibles comparan el modelo base Qwen3.8-27B BF16 con la misma base mas el adaptador Swift. La informacion proporcionada esta truncada; las filas que faltan se indican como no disponibles.

| Benchmark | Score base | Score Swift | Tokens medios base | Tokens medios Swift | Reduccion media | Reduccion mediana |
|---|---|---|---|---|---|---|
| GPQA-Diamond | 88,38% | 88,28% | 15.014 | 8.855 | 41,0% | 58,3% |
| MMLU-Pro | 85,47% | 84,95% | 2.980 | 1.603 | 46,2% | 28,3% |
| C-Eval | 90,00% | 90,62% | 1.492 | 804 | 46,1% | 19,3% |
| IFBench | 73,53% | 71,80% | 8.052 | 4.657 | 42,2% | 50,5% |
| AIME 2026 | 98,67% | 94,00% | 22.014 | 16.143 | 26,7% | 50,2% |
| HMMT (noviembre 2025) | 99,33% | 96,00% | 22.032 | 15.189 | 31,1% | no disponible (informacion truncada) |

Resumen agregado declarado por el autor: 58,3% menos de tokens de pensamiento, perdida de rendimiento inferior al 1% y aceleracion de x1,95 en varias tareas. No se han publicado en la informacion disponible resultados de benchmarks comparativos con modelos de terceros.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (27.320.697.856), sin margen para cache KV ni overhead del runtime, que debe sumarse aparte:

| Cuantizacion | Peso aproximado de pesos | VRAM recomendada con contexto |
|---|---|---|
| F16 / BF16 | ~54,6 GB | ~64 GB o mas |
| Q8_0 | ~29 GB | ~36 GB o mas |
| Q6_K | ~22 GB | ~28 GB o mas |
| Q5_K_M | ~19 GB | ~24 GB o mas |
| Q4_K_M | ~16-17 GB | ~22 GB o mas |

- Cabe en GPU de consumo: si, en configuraciones Q4_K_M y Q5_K_M sobre RTX 3090 o RTX 4090 (24 GB), con contexto moderado. Para contextos largos conviene bajar a Q4 o usar offload parcial a CPU.
- GPU profesionales: A100 40 GB, A100 80 GB y H100 para Q8_0 y F16 con contexto amplio; configuraciones multi-GPU (2x24 GB) para Q6_K o Q8_0.
- Modelo multimodal: al ser `image-text-to-text`, es probable que requiera un proyector multimodal adicional (`mmproj`) para la parte de vision; no se confirma en la informacion disponible.
- Opciones de despliegue: llama.cpp y `llama-server` de forma nativa (el repositorio esta etiquetado con `llama.cpp` y `imatrix`); Ollama, LM Studio o Jan mediante importacion del GGUF; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que no son la via recomendada.
- Latencia y throughput: no disponibles en cifras absolutas. El unico dato de rendimiento publicado es la aceleracion relativa de x1,95 en varias tareas, atribuible principalmente a la reduccion de tokens generados.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas con modelos de terceros, por lo que la unica comparacion posible es dentro de la propia familia.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-GGUF | 27,32B | no disponible | GGUF | `swift-open-license-1.0` | Hugging Face (`ukisai`), 0 descargas, 10 likes |
| Swift-Qwen3.8-27b (BF16) | no disponible | no disponible | no disponible (referenciado como BF16) | `swift-open-license-1.0` | Hugging Face (`ukisai`) |
| Qwen3.8-27B (base) | no disponible | no disponible | BF16 | no disponible | referenciado en la evaluacion del autor |

Comparativa de rendimiento dentro de la familia, con los datos disponibles:

| Aspecto | Qwen3.8-27B base | Swift-Qwen3.8-27B |
|---|---|---|
| GPQA-Diamond | 88,38% | 88,28% |
| AIME 2026 | 98,67% | 94,00% |
| HMMT (nov. 2025) | 99,33% | 96,00% |
| Tokens de pensamiento | linea base | hasta 58,3% menos en mediana |
| Velocidad relativa | x1 | hasta x1,95 |

Frente a alternativas de terceros de tamano similar (por ejemplo, otros modelos de ~27B con modo de razonamiento), no hay datos de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Perdida de precision no despreciable en matematicas: AIME 2026 cae del 98,67% al 94,00% (-4,67 puntos) y HMMT de 99,33% a 96,00% (-3,33 puntos), muy por encima del "<1% de perdida" declarado de forma agregada. Conviene verificar el rendimiento en el dominio concreto antes de desplegar.
- Caida en seguimiento de instrucciones: IFBench baja 1,73 puntos (73,53% -> 71,80%). En pipelines que dependen de formato estricto esto puede traducirse en fallos de parseo.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad factual. Es un riesgo inherente a los modelos de razonamiento y no hay datos que lo acoten.
- Sesgos: no se publica ninguna evaluacion de sesgos, toxicidad o comportamientos diferenciales por idioma o demografia.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada en la informacion disponible y la lista oficial de idiomas tampoco. La evaluacion incluye C-Eval (chino) y benchmarks en ingles, pero no se puede confirmar cobertura de otras lenguas.
- Restricciones de licencia: la licencia es `swift-open-license-1.0`, etiquetada como `other` y no reconocida por la OSI. La model card enlaza a una seccion de licenciamiento empresarial, por lo que el uso comercial puede requerir un acuerdo adicional con UkisAI. Verificar los terminos antes de cualquier despliegue en produccion.
- Madurez y soporte: el repositorio acumula 0 descargas y 10 likes, con fecha de publicacion 2026-09-11. Es un artefacto muy reciente y sin validacion independiente por parte de la comunidad.
- Opacidad de la informacion: no se detallan datos de entrenamiento, composicion del dataset, tecnicas de alineamiento ni arquitectura. La informacion de la model card esta truncada, incluyendo parte de la tabla de benchmarks.
- Compatibilidad de cuantizaciones: no se publica la lista concreta de niveles GGUF incluidos en los 145,6 GB del repositorio, por lo que hay que inspeccionar los archivos antes de planificar el despliegue.
- Despliegue: el ecosistema de servidores de alto rendimiento (vLLM, TGI) no soporta GGUF de forma nativa y madura, lo que limita el throughput en comparacion con una version en safetensors servida con vLLM.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Modelo base en BF16 (Swift-Qwen3.8-27b): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia y acceso empresarial: https://huggingface.co/ukisai/Swift-Qwen3.8-27b#license-and-access
- Sitio web del autor: https://ukisai.com
- Pagina de producto Swift: https://ukisai.com/products/swift
- Demo en video de velocidad (alojada en el repositorio): https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF/resolve/main/swift-speed-demo.mp4
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los unicos resultados obtenidos fueron paginas de restaurantes sin relacion con el contenido de esta ficha.
