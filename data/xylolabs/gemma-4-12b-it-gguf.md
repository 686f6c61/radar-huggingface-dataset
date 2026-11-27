# Xylolabs/gemma-4-12B-it-GGUF

## Resumen

Gemma 4 12B it GGUF es una familia de cuantizaciones GGUF del modelo denso `google/gemma-4-12B-it`, publicada por Xylolabs como referencia de comparación para sus exportaciones propias al hardware Tensix de Tenstorrent. El paquete no introduce pesos nuevos: convierte el checkpoint bf16 original con la herramienta `quantize` de llama.cpp y distribuye cuatro variantes (Q3_K_M-imat, IQ4_XS-imat, IQ4_XS y Q5_K_M) que contienen exclusivamente el decodificador de texto, es decir, 667 tensores de las 48 capas del decoder, el tokenizer y la plantilla de chat original, omitiendo los codificadores de visión y audio del modelo base.

El modelo base cuenta con 11.907.350.576 parámetros totales (aproximadamente 11,9 mil millones), lo que lo sitúa en la franja de modelos densos de tamaño medio que caben con holgura en GPU de consumo de 24 GB. La relevancia de esta publicación es doble: por un lado ofrece una vía práctica de ejecutar Gemma 4 12B en llama.cpp con cuantizaciones de 6 a 8,5 GB, y por otro documenta con métricas de divergencia KL y acuerdo top-1 la pérdida de fidelidad de cada nivel de cuantización frente al bf16 de referencia, algo poco habitual en repositorios GGUF de terceros.

La licencia declarada es Apache 2.0 y los idiomas anotados en la model card son inglés y coreano. El repositorio ocupa 28,0 GB e incluye los cuatro ficheros GGUF, de modo que el usuario debe descargar únicamente el que corresponda a su presupuesto de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decodificador de texto de Gemma 4 12B Unified, 48 capas) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens segun la tabla de hardware del autor; los metadatos originales del contexto no se modifican en la conversion |
| Tipos de cuantizacion | Q3_K_M-imat (6,087 GB), IQ4_XS-imat (6,635 GB), IQ4_XS (6,691 GB), Q5_K_M (8,547 GB) |
| Idiomas soportados | en, ko (segun model card; el modelo base puede tener un perfil multilingue mas amplio, no documentado aqui) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), 667 tensores por fichero; matriz de embedding/salida compartida en Q6_K y normas/constantes RoPE en float32 |

Detalle de tipos de tensor por variante:

| Variante | Tipos y recuentos de tensor |
|---|---|
| Q3_K_M-imat | F32: 338, Q3_K: 192, Q4_K: 131, Q5_K: 5, Q6_K: 1 |
| IQ4_XS-imat | F32: 338, IQ4_XS: 328, Q6_K: 1 |
| IQ4_XS | F32: 338, IQ4_XS: 322, Q5_K: 6, Q6_K: 1 |
| Q5_K_M | F32: 338, Q5_K: 284, Q6_K: 45 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de decodificador de texto con 48 capas y unos 11,9 mil millones de parametros, parte de la familia Gemma 4 en su variante "Unified" (que en el modelo base incluye codificadores de vision y audio). Esta publicacion GGUF conserva unicamente el decodificador de texto: los cuatro ficheros contienen 667 tensores procedentes de las 48 capas del decoder, mas el tokenizer y la plantilla de chat original, y prescinden de los modulos de vision y audio. La matriz de embedding y de salida compartida se mantiene en Q6_K en las cuatro variantes, y las normas y constantes RoPE conservan precision float32, lo que eleva el numero medio de bits por encima del preset nominal.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo base en la informacion proporcionada. La conversion y cuantizacion las realiza Xylolabs con la herramienta `quantize` de llama.cpp a partir del checkpoint bf16; las variantes con sufijo `-imat` reutilizan resultados de importance matrix existentes, aunque los ficheros de calibracion historicos son solo etiquetas de metadatos y no se incluyen en el repositorio. La innovacion documentada es la evaluacion de fidelidad de la cuantizacion: divergencia KL media frente a bf16 y acuerdo top-1 sobre 16 secuencias de 1.024 tokens (16.232 posiciones puntuadas) en texto plano y de chat en ingles y coreano.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, con plantilla de chat original preservada.
- Modo de razonamiento ("thinking") del modelo base, activable o desactivable mediante `--chat-template-kwargs '{"enable_thinking":...}'` en llama.cpp; la evaluacion del autor incluye siete recomprobaciones con thinking activado.
- Coherencia multi-turno mediante la plantilla Jinja (`--jinja`) y el flag `--single-turn` para consultas aisladas.
- Inferencia local en CPU, GPU y Apple Silicon a traves de llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repositorio).
- No incluye vision ni audio: los codificadores correspondientes del modelo base fueron omitidos en la conversion.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 24 GB: con el fichero Q5_K_M (8,5 GB) cabe en una RTX 4090 o RTX 3090 y, segun el autor, permite aprovechar la ventana de 256K tokens, lo que habilita asistentes de codigo o analisis de documentos largos sin servicios en la nube.
- Referencia de calidad de cuantizacion: equipos que entrenan o exportan sus propias cuantizaciones pueden comparar la divergencia KL y el acuerdo top-1 de sus ficheros contra estos cuatro checkpoints, que actuan como linea base reproducible en llama.cpp.
- Evaluacion de hardware alternativo: el repositorio se publica explicitamente como contraparte llama.cpp de las exportaciones Tensix de Tenstorrent, de modo que sirve para validar la fidelidad numerica de aceleradores no GPU frente a una implementacion de referencia en CPU/GPU convencional.
- Procesamiento de texto en coreano e ingles: con idiomas anotados en y ko, es adecuado para pipelines bilingues de resumen, clasificacion o generacion en esos dos idiomas, sin asumir calidad en otros.
- Prototipado de agentes conversacionales con contexto largo: la ventana de 256K y la plantilla de chat Jinja permiten mantener historiales extensos en tareas de soporte o analisis documental antes de invertir en infraestructura mayor.
- Experimentacion con modos de razonamiento: el soporte de `enable_thinking` permite alternar entre respuestas directas y cadenas de razonamiento para medir coste y latencia en tareas de matematicas o logica.
- Integracion en entornos con restricciones de memoria: las variantes IQ4_XS (6,6 GB) y Q3_K_M-imat (6,1 GB) permiten ejecutar el modelo en equipos con menos VRAM o en configuraciones con offload parcial a CPU.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Si documenta metricas de fidelidad de cuantizacion frente al checkpoint bf16 almacenado:

| Variante | KL media vs bf16 | KL / Q4_K_M | Acuerdo top-1 | Respuestas correctas (gate) |
|---|---:|---:|---:|---|
| Q3_K_M-imat | 0,999333 | 1,134x | 68,10% | 33/33 + 7/7 thinking |
| IQ4_XS-imat | 0,695671 | 0,789x | 73,42% | 33/33 + 7/7 thinking |
| IQ4_XS | 0,983883 | 1,116x | 68,49% | 33/33 + 7/7 thinking |
| Q5_K_M | 0,367732 | 0,417x | 80,96% | 33/33 + 7/7 thinking |
| Q4_K_M (referencia actual) | 0,881231 | 1,000x | 69,79% | 33/33 + 7/7 thinking |

La evaluacion cubre 16 secuencias emparejadas de 1.024 tokens y 16.232 posiciones puntuadas en texto plano y de chat en ingles y coreano, con contexto de 8.192 tokens. Las cifras de KL de la model card incluyen dos tablas con valores distintos por variante (0,0445 y 0,1658 para Q5_K_M e IQ4_XS en el texto introductorio, frente a 0,367732 y 0,983883 en la tabla de evaluacion); la tabla anterior recoge los valores de la seccion de evaluacion, que son los que se comparan contra Q4_K_M.

## Requisitos de hardware

- VRAM estimada: 6,1 GB (Q3_K_M-imat), 6,6 GB (IQ4_XS e IQ4_XS-imat) y 8,5 GB (Q5_K_M) para los pesos; hay que sumar KV cache y buffers de trabajo, que no se cuantifican en las cifras anteriores.
- GPU recomendadas por el autor: RTX 4090 y RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB, requiere repartir capas entre ambas tarjetas), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB).
- Sistemas con memoria unificada: DGX Spark (128 GB) y Mac Studio M5 Max (128 GB), ambos con Q5_K_M y contexto de 256K segun el autor.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con Q5_K_M; en tarjetas de 12-16 GB seria necesario usar las variantes de 6 GB o hacer offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, y por extension `llama-server`); el comando de ejemplo esta verificado con llama.cpp v0.9.0. No se documentan otras herramientas (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B it GGUF (Xylolabs) | 11,9B | 256K (segun autor) | GGUF, 4 variantes de 6,1 a 8,5 GB | Apache 2.0 | Solo decodificador de texto; metrica KL publicada |
| google/gemma-4-12B-it (bf16) | 11,9B | no disponible | safetensors bf16 | Apache 2.0 (segun este repo) | Modelo base completo, incluye vision y audio |
| Exportaciones Tensix de Xylolabs | 11,9B | no disponible | formato Tensix | no disponible | Contraparte de hardware Tenstorrent de esta publicacion |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Solo texto: los codificadores de vision y audio del modelo base han sido omitidos, por lo que estas cuantizaciones no pueden procesar imagenes ni audio.
- Idiomas documentados limitados a ingles y coreano; el rendimiento en castellano u otros idiomas no esta verificado en esta publicacion.
- Perdida de fidelidad medible: incluso Q5_K_M presenta un acuerdo top-1 del 80,96% frente a bf16, y Q3_K_M-imat baja al 68,10%; para tareas sensibles a la precision conviene validar contra el checkpoint original.
- Inconsistencia en las cifras de KL dentro de la propia model card (dos conjuntos de valores para las mismas variantes), lo que exige cautela al citar los numeros.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones especificas de factualidad en esta publicacion.
- Sesgos: no se dispone de informacion sobre sesgos conocidos del modelo base ni de estas cuantizaciones.
- Licencia Apache 2.0 declarada en el repositorio; conviene verificar los terminos del modelo base `google/gemma-4-12B-it` antes de uso comercial, ya que la model card de la cuantizacion no detalla restricciones adicionales.
- El comando de ejemplo limita el contexto a 2.048 tokens con `-c 2048`; para aprovechar los 256K hay que ajustar ese parametro y prever memoria adicional para KV cache.
- Los ficheros `-imat` conservan resultados de importance matrix pero no incluyen el dataset de calibracion, lo que dificulta reproducir exactamente el proceso.
- Repositorio con muy baja adopcion (1 like, 3.160 descargas en la fecha de actualizacion), por lo que no hay validacion independiente de las metricas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia del repositorio: https://huggingface.co/Xylolabs/gemma-4-12B-it-GGUF/blob/main/LICENSE
- Codigo llama.cpp referenciado (commit cd959bae99ff4bed22bef2604f45241c09bbb8c8): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentacion de GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio de Xylolabs para exportaciones Tensix: https://github.com/XylolabsInc/tensix-bfp-gptq
