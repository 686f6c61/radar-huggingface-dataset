# vcruz305/DSV4.1-Flash-1017-SAGE-EXL3-1.62bpw

## Resumen

DSV4.1-Flash-1017-SAGE-EXL3-1.62bpw es una cuantizacion de precision mixta del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario vcruz305. No es un modelo entrenado desde cero, sino un empaquetado (pack) cargable con ExLlamaV3 que comprime los pesos originales de DeepSeek a una media de 1,62 bits por peso (bpw) mediante un metodo propio denominado SAGE, que asigna distintos valores de K (parametros del trellis EXL3) a cada tensor. El objetivo es hacer viable la inferencia de un modelo MoE de 262.164.494.802 parametros totales en un unico dispositivo con memoria unificada de clase 128 GB, con una huella residente de aproximadamente 112,9 GiB.

El modelo base, DeepSeek-V4.1-Flash-1017, es un MoE desarrollado por DeepSeek con licencia MIT: 40 capas, 384 expertos enrutados mas 1 compartido, con top-6 en el enrutamiento. El pack conserva la arquitectura y las capacidades del original (incluida la modalidad image-text-to-text segun el pipeline declarado) y esta pensado para desarrolladores que necesitan ejecutar localmente un modelo de gran escala sin recurrir a despliegues multi-GPU o a APIs externas.

La relevancia de esta ficha radica en que la cuantizacion agresiva a 1,62 bpw mantiene una concordancia token a token del 94,52% en Top-1 y una divergencia KL media de 0,0982 frente a la release oficial FP8/FP4 de DeepSeek, con variaciones notables por categoria (codigo 99,08% de concordancia, general 89,94%). El repositorio acumula 1056 descargas y 26 likes desde su creacion el 18 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (deepseek_v41), 40 capas, 384 expertos enrutados + 1 compartido, top-6 |
| Parametros totales | 262.164.494.802 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis con precision mixta SAGE (media 1,62 bpw; distintos K por tensor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), 17 shards con indice `model.safetensors.index.json` |
| Huella residente | ~112,9 GiB |
| Tamano del repositorio | 326,6 GB |
| Libreria de inferencia | exllamav3 |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de DeepSeek con 40 capas y 385 expertos en total (384 enrutados mas uno compartido), con enrutamiento top-6. El pack no modifica la topologia: solo recuantiza los pesos. La innovacion tecnica del repositorio es SAGE, un metodo de cuantizacion de precision mixta para EXL3 en el que cada tensor recibe un valor de K diferente y el kernel lo lee directamente del tensor trellis en tiempo de carga, de modo que el formato es autodescriptivo. El autor declara que el metodo SAGE no esta publicado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada; esos detalles corresponden a la model card de DeepSeek-V4.1-Flash-1017, no incluida aqui. La release oficial de DeepSeek se distribuye en precision mixta FP8/FP4, que se usa como referencia de calidad para medir la perdida introducida por esta cuantizacion.

## Capacidades

- Generacion de texto y razonamiento multi-paso, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Generacion y comprension de codigo, con la mayor fidelidad de cuantizacion observada (99,08% de concordancia Top-1 frente a la release oficial).
- Razonamiento matematico (95,56% de concordancia Top-1 en la categoria Math).
- Procesamiento image-text-to-text segun el pipeline declarado en el repositorio.
- Capacidades conversacionales multi-turno.
- Arquitectura MoE con enrutamiento top-6, lo que activa solo una fraccion de los expertos por token.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y thinking mode: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de gran escala en un unico nodo: el pack esta dimensionado para un dispositivo con memoria unificada de clase 128 GB, lo que permite ejecutar un MoE de 262.000 millones de parametros sin repartir el modelo entre varias GPU.
- Generacion de codigo en produccion: con un 99,08% de concordancia Top-1 y un 99,61% en answer-only respecto a la release oficial FP8/FP4, es adecuado para asistentes de programacion y autocompletado donde la fidelidad en la sintaxis es critica.
- Razonamiento y analisis tecnico: la categoria Reasoning mantiene un 96,04% de concordancia Top-1, suficiente para tareas de analisis documental, resumen y respuesta a preguntas complejas.
- Resolucion de problemas matematicos: con 95,56% de concordancia Top-1 en Math, sirve para tutoria automatica, verificacion de calculos y generacion de ejercicios resueltos.
- Procesamiento de imagenes y texto combinados: el pipeline image-text-to-text permite construir flujos de extraccion de informacion de documentos escaneados o capturas con descripcion textual asociada.
- Experimentacion e investigacion en cuantizacion: al ser un pack EXL3 con precision mixta y kernels que leen K por tensor, es util para estudiar el impacto de la compresion extrema en modelos MoE de gran tamano.
- Despliegue de bajo coste energetico por token: al activar solo 6 de los 384 expertos enrutados por token, el coste computacional por inferencia es una fraccion del de un modelo denso de tamano equivalente.

## Benchmarks y rendimiento

Los datos disponibles son metricas de fidelidad de cuantizacion frente a la release oficial FP8/FP4 de DeepSeek, no benchmarks de tareas estandar (MMLU, HumanEval, GSM8K). Se presentan tal cual:

| Metrica | Este pack (1,62 bpw) | Release oficial FP8/FP4 |
|---|---|---|
| KL media vs oficial | 0,0982 | 0 (referencia) |
| KL p50 vs oficial | 0,00019 | 0 (referencia) |
| Top-1 agreement | 94,52% | 100% |
| Top-5 overlap | 81,16% | 100% |
| Huella residente | ~112,9 GiB | nativa |

Desglose por categoria:

| Categoria | KL media | KL p50 | Top-1 agreement | Answer-only Top-1 | Top-5 overlap |
|---|---|---|---|---|---|
| Code | 0,0186 (0,0046 answer) | 0,000004 | 99,08% | 99,61% | 80,38% |
| Reasoning | 0,0349 (0,0306 answer) | 0,000480 | 96,04% | 97,98% | 86,34% |
| Math | 0,0477 (0,0408 answer) | 0,000306 | 95,56% | 94,19% | 83,99% |
| General | 0,2245 | 0,001505 | 89,94% | 89,21% | 76,24% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 112,9 GiB de huella residente en GPU, segun el autor.
- Dispositivo objetivo: un unico dispositivo con memoria unificada de clase 128 GB (por ejemplo, Apple Silicon de gama alta o aceleradores con memoria unificada de esa capacidad).
- GPU discretas: no se especifica compatibilidad con A100 (80 GB), H100 (80 GB) ni RTX 4090 (24 GB); la huella de 112,9 GiB excede la memoria de cualquiera de ellas de forma individual.
- Consumer GPU: no cabe en GPU de consumo convencionales por el tamano del pack.
- Opciones de despliegue: ExLlamaV3 es la unica libreria declarada. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Carga: mediante `Config.from_directory`, `Model.from_config` y `Tokenizer.from_config` de exllamav3, apuntando al repositorio o a una copia local.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato / cuantizacion | Licencia | Huella |
|---|---|---|---|---|---|
| Este pack (DSV4.1-Flash-1017 SAGE EXL3 1,62 bpw) | 262.164.494.802 | no disponible | EXL3 trellis precision mixta | MIT | ~112,9 GiB |
| DeepSeek-V4.1-Flash-1017 (oficial) | 262.164.494.802 | no disponible | FP8/FP4 mixto | MIT | nativa (no disponible) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es contra la release oficial del mismo modelo base, que sirve como referencia de calidad (100% Top-1 agreement por definicion). No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 1,62 bpw introduce perdida de fidelidad medible: 94,52% de concordancia Top-1 global y solo 89,94% en la categoria General, con una KL media de 0,2245 en esa categoria.
- El metodo SAGE no esta publicado, lo que limita la reproducibilidad y la auditoria independiente de la cuantizacion.
- El repositorio no documenta la longitud de contexto soportada; no debe asumirse la del modelo base sin verificarla en la model card de DeepSeek.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica especifica de este pack.
- El `generation_config.json` del pack fija `top_p=0.95`, mientras que DeepSeek recomienda `top_p=1.0`; para replicar el comportamiento upstream hay que sobrescribir explicitamente el parametro.
- La licencia es MIT, igual que el modelo base, por lo que no se declaran restricciones adicionales para uso comercial; aun asi, conviene citar a DeepSeek como autor del modelo base.
- El pack solo es cargable con ExLlamaV3; no hay soporte declarado para otros runtimes, lo que limita su portabilidad.
- El tamano del repositorio (326,6 GB) implica requisitos de almacenamiento y tiempos de descarga considerables.

## Enlaces

- Repositorio Hugging Face del pack: https://huggingface.co/vcruz305/DSV4.1-Flash-1017-SAGE-EXL3-1.62bpw
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Perfil del autor: https://huggingface.co/vcruz305
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
