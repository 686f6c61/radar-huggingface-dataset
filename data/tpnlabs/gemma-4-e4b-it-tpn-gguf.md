# tpnlabs/gemma-4-E4B-it-TPN-GGUF

## Resumen

`tpnlabs/gemma-4-E4B-it-TPN-GGUF` es una coleccion de cuantizaciones GGUF del modelo multimodal `google/gemma-4-E4B-it`, publicada por TPN Labs (True Performance Network) a traves de su herramienta TPN Workbench. El modelo base es un transformer multimodal de Google con 7.518.069.290 parametros totales, capaz de procesar imagen y texto (`image-text-to-text`), y esta pensado para ejecucion local en llama.cpp, tanto en servidor como en navegador y aplicaciones de escritorio via la aplicacion Gratis.

El valor anadido de esta publicacion no es el modelo en si, sino el trabajo de medicion: el autor evalua cada cuantizacion contra la referencia BF16 usando divergencia KL de siguiente token, perplejidad y acuerdo top-1, y ademas publica una evaluacion de chat con 32 prompts cotidianos. De ahi sale una recomendacion explicita: Q4_K_M como opcion "Gratis pick" (5,34 GB, KLD 0,0714, 88,0 % top-1) y la advertencia de que las cuantizaciones por debajo de Q4 estan rotas para este modelo (Q3_K_M con KLD 0,53 y 70,3 % top-1).

Es relevante ahora porque el ecosistema necesita referencias empiricas de cuantizacion por modelo concreto, no reglas generales: aqui se demuestra que en este modelo Q4_K_M supera a Q4_0 en KLD (0,0714 frente a 0,2239) y que Q2_K, pese a su menor perplejidad aparente, degrada severamente el acuerdo top-1 (67,7 %). La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_0, Q5_0+, Q4_K_M, Q4_0M+, Q4_0, Q4_0+, IQ4_XS, Q3_K_M, Q2_K; proyector de vision en F16 |
| Idiomas soportados | no disponible (la evaluacion de chat incluye prompts en de/es/fr) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp), con `mmproj` F16 separado para entrada de imagen |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B-it`, un transformer multimodal de Google que acepta imagen y texto como entrada y genera texto. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. El pipeline declarado es `image-text-to-text`, y la publicacion incluye un proyector de vision independiente (`mmproj-gemma-4-E4B-it-F16.gguf`, 0,99 GB) que debe cargarse junto con cualquiera de los ficheros de lenguaje para habilitar la entrada de imagen.

El trabajo tecnico de esta publicacion es la cuantizacion y su validacion. TPN Workbench genera cada formato y lo puntua contra la referencia BF16 con tres metricas: KLD medio de siguiente token, delta de perplejidad y acuerdo top-1. El autor indica que las K-quants tienen kernels SIMD en llama.cpp WebAssembly y kernels ARM repackeados en moviles, lo que las hace la opcion mas rapida en esos entornos. No se mencionan innovaciones de decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `conversational`).
- Entrada de imagen combinada con texto (image-text-to-text) mediante el proyector `mmproj` en F16.
- Razonamiento y tareas de instrucciones, segun las categorias evaluadas en el Gratis chat eval (creative, instructions, reasoning, knowledge, tasks, honesty, chat).
- Cobertura multilingue parcial: la evaluacion incluye prompts en aleman, espanol y frances, aunque no se declara una lista oficial de idiomas.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- Ejecucion en llama.cpp, incluido WebAssembly en navegador y aplicacion de escritorio via Gratis.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking: la evaluacion se realiza con thinking desactivado; no se detalla el comportamiento con thinking activo.

## Casos de uso

- Asistente local en navegador: con Q4_K_M (5,34 GB) y el proyector F16, el modelo corre integramente en el dispositivo dentro de Gratis, sin enviar datos a un servidor; adecuado para entornos con requisitos de privacidad.
- Procesamiento de documentos con imagenes: capturas de pantalla, formularios escaneados o graficos combinados con una pregunta en texto, usando el `mmproj` para la parte visual y el modelo de lenguaje para la respuesta.
- Atencion al cliente en dispositivos de gama media: Q4_K_M mantiene una puntuacion de chat de 79,4 sobre 100 (frente a 81,4 en Q6_K, dentro del ruido de ±2), lo que permite desplegar conversacion multi-turno en hardware modesto sin perdida perceptible de calidad.
- Despliegue en movil: las K-quants tienen kernels ARM repackeados en llama.cpp, por lo que Q4_K_M o Q5_K_M son la eleccion para aplicaciones Android/iOS con inferencia en el propio telefono.
- Servicio HTTP ligero: `llama-server -hf tpnlabs/gemma-4-E4B-it-TPN-GGUF --hf-file gemma-4-E4B-it-Q4_K_M.gguf` levanta un endpoint compatible con la API de llama.cpp para integrarlo en un backend interno.
- Prototipado e investigacion de cuantizacion: la tabla de KLD, perplejidad y top-1 por formato sirve como referencia para decidir el equilibrio tamano/calidad en este modelo concreto, evitando los formatos degradados (Q3_K_M, Q2_K).
- Evaluacion comparativa de pipelines: al incluir prompts en aleman, espanol y frances en el conjunto de evaluacion, el modelo es util para pruebas de calidad multilingue en entornos de habla hispana.

## Benchmarks y rendimiento

Metricas de cuantizacion publicadas por el autor contra la referencia BF16:

| Formato | Tamano | bpw | KLD medio | Delta PPL | Top-1 |
|---|---|---|---|---|---|
| Q8_0 | 8,03 GB | 8,5 | 0,0031 | +7,62 % | 97,5 % |
| Q6_K | 6,22 GB | 6,56 | 0,0157 | +8,20 % | 94,1 % |
| Q5_K_M | 5,76 GB | 5,65 | 0,0240 | +5,25 % | 92,9 % |
| Q5_0 | 6,53 GB | 5,5 | 0,0466 | +5,36 % | 90,2 % |
| Q5_0+ | 6,53 GB | 5,5 | 0,0466 | +5,36 % | 90,2 % |
| Q4_K_M | 5,34 GB | 4,8 | 0,0714 | +3,73 % | 88,0 % |
| IQ4_XS | 5,07 GB | 4,27 | 0,0810 | +2,95 % | 87,2 % |
| Q4_0M+ | 6,20 GB | 4,84 | 0,1844 | +17,82 % | 81,6 % |
| Q4_0 | 6,03 GB | 4,5 | 0,2239 | +22,01 % | 79,6 % |
| Q4_0+ | 6,03 GB | 4,5 | 0,2239 | +22,01 % | 79,6 % |
| Q3_K_M | 4,85 GB | 3,83 | 0,5279 | +38,85 % | 70,3 % |
| Q2_K | 4,40 GB | 2,93 | 0,5921 | -2,77 % | 67,7 % |

Evaluacion de chat (32 prompts x 3 muestras, thinking desactivado, puntuado 1-10 por Claude Sonnet; ruido entre ejecuciones aproximado de ±2):

| Fichero | Puntuacion global |
|---|---|
| Q4_K_M | 79,4 |
| Q5_K_M | 80,9 |
| Q6_K | 81,4 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas overhead de contexto y del proyector de vision. Q4_K_M: ~5,4 GB; Q5_K_M: ~5,8 GB; Q6_K: ~6,3 GB; Q8_0: ~8,1 GB. Sumar ~1 GB del `mmproj` F16 si se usa entrada de imagen.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM para Q4_K_M o Q5_K_M (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para Q8_0 y contextos largos, 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090). En entornos de servidor, A100 o H100 no son necesarias para este tamano, pero funcionan.
- Cabe en GPU consumer: si, en todas las cuantizaciones desde Q4_K_M hacia arriba con 8 GB o mas. Q2_K y Q3_K_M caben en 6 GB, pero no se recomiendan por la degradacion medida.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), aplicacion Gratis (navegador y escritorio) y cualquier frontend compatible con GGUF. No se mencionan vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo senala que las K-quants son la opcion mas rapida en WebAssembly y en moviles con kernels ARM repackeados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it (TPN GGUF, esta ficha) | 7.518.069.290 | no disponible | GGUF + mmproj | Apache 2.0 | Cuantizaciones medidas con KLD, PPL y top-1 |
| google/gemma-4-E4B-it (base) | 7.518.069.290 | no disponible | safetensors | Apache 2.0 | Referencia BF16; sin cuantizar |
| Alternativas de ~7-8B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks comunes (MMLU, HumanEval, GSM8K) ni de modelos comparables evaluados en las mismas condiciones en la informacion proporcionada, por lo que la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- Las cuantizaciones Q3_K_M y Q2_K estan degradadas para este modelo: KLD de 0,53 y 0,59 respectivamente, con acuerdo top-1 del 70,3 % y 67,7 %. El autor las califica explicitamente de rotas. No usarlas en produccion.
- Q4_0 y Q4_0+ rinden peor que Q4_K_M pese a ocupar mas espacio (6,03 GB frente a 5,34 GB) y tener KLD cuatro veces mayor (0,2239 frente a 0,0714). La eleccion por tamano no es fiable en este modelo.
- El delta de perplejidad no es monotono con la calidad: Q6_K tiene +8,20 % de PPL frente a +3,73 % de Q4_K_M, mientras que su KLD y top-1 son mejores. No usar PPL como unico criterio.
- La evaluacion de chat la puntua Claude Sonnet como juez, con 32 prompts y ruido de ±2; las diferencias entre Q4_K_M (79,4) y Q6_K (81,4) estan dentro de ese margen.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. La categoria "honesty" del eval no publica resultados desglosados.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas: no se declara una lista oficial; la evaluacion cubre de, es y fr ademas de ingles, pero no hay garantia de calidad fuera de esos idiomas.
- Longitud de contexto: no disponible. Verificar en la configuracion del modelo base antes de disenar flujos con contexto largo.
- Tool calling y comportamiento agentico: no documentados; no asumir soporte sin validacion previa.
- Licencia Apache 2.0 heredada del modelo base: permite uso comercial, pero conviene revisar los terminos de `google/gemma-4-E4B-it` por si el modelo base anade condiciones adicionales.
- El repositorio tiene 178 descargas y 0 likes en el momento de la consulta: validacion comunitaria escasa.

## Enlaces

- Hugging Face: https://huggingface.co/tpnlabs/gemma-4-E4B-it-TPN-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Informe completo de cuantizacion: https://bench.trueperformancenetwork.com/r/qa-keidreGuyRCaMtLB3Pw
- TPN Workbench: https://bench.trueperformancenetwork.com
- Aplicacion Gratis: https://gratis.trueperformancenetwork.com/
