# tablinum/Lite-Beam-Inkling-2-Mini-GGUF-Preview

## Resumen

Lite-Beam Inkling-2-Mini (Preview) es una recopilación de cuantizaciones GGUF del modelo multimodal Inkling-2-Mini de Thinking Machines, publicada por el usuario Tablinum bajo licencia Apache-2.0. El modelo base es un Mixture of Experts con arquitectura de transformer con bucles (looped transformer): 26.400 millones de parámetros totales, 3.400 millones activos por token, 128 expertos con enrutamiento top-8 y una ventana de contexto de 1 millón de tokens. Acepta entrada de texto e imagen.

La aportación de esta ficha no es el modelo en sí, sino el trabajo de cuantización: un reencode del mapa de precisión oficial a NVFP4 para llama.cpp mainline (19,1 GB) y una variante de 1 bit (7,76 GB) derivada del UD-IQ1_S de Unsloth con los tensores de escala por experto reajustados. El autor publica mediciones de divergencia KL (KLD) frente a BF16 y porcentaje de coincidencia del token superior, lo que permite evaluar la pérdida de calidad de forma cuantitativa.

Es relevante ahora porque demuestra el estado del arte en compresión agresiva de MoE multimodales para hardware de consumo, y porque el propio autor declara explícitamente que su fórmula de baja precisión todavía no supera a las cuantizaciones UD de Unsloth, lo que establece una referencia honesta para la comunidad. Requiere una versión de llama.cpp con soporte del bucle `inkling2_loop` (PRs #32694 y #32704).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y Mixture of Experts |
| Parametros totales | 26.070.391.296 (26,4B) |
| Parametros activos | 3,4B por token; ~5,4B de computo efectivo por token por los tres pasos de bucle |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (expertos L0-19) + Q8_0 (L20-23) + BF16 (resto); IQ1_S (1 bit); proyector de vision BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Expertos | 128, top-8, sin experto compartido |
| Modalidad | Texto e imagen (image-text-to-text) |
| Repo | 27,5 GB |
| Ficheros | NVFP4 19,1 GB; IQ1_S 7,76 GB; mmproj-BF16 0,64 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE con 128 expertos y enrutamiento top-8 sin experto compartido. La innovacion estructural es el bucle: las capas 6 a 17 se ejecutan tres veces, de modo que cada token recibe el computo equivalente a unos 5.400 millones de parametros pese a tener solo 3.400 millones activos en una pasada. Esta recurrencia de profundidad permite aumentar la capacidad de razonamiento sin incrementar el coste de memoria por token. El modelo acepta texto e imagen mediante un proyector de vision separado (mmproj en BF16).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas por Thinking Machines en el modelo original. Lo que si documenta esta ficha es el proceso de cuantizacion: el fichero NVFP4 reencodea el mapa de precision oficial (expertos de las capas 0-19 en NVFP4, capas 20-23 en Q8_0 y el resto en BF16) para llama.cpp mainline; el fichero IQ1_S parte del UD-IQ1_S de Unsloth y solo modifica los tensores de escala por experto, reajustados con ganancias por banda de capas medidas sobre texto reservado. La evaluacion de KLD usa como referencia el checkpoint NVFP4/MXFP8 oficial dequantizado a BF16, con textos de mezcla chat/codigo/matematicas y wikitext a 2048 tokens de contexto.

## Capacidades

- Generacion de texto conversacional multi-turno con 1M de tokens de contexto.
- Entrada multimodal: comprension de imagenes junto con texto (pipeline image-text-to-text).
- Razonamiento con modo de bucle interno que reutiliza las capas 6-17 tres veces por token.
- Capacidad de absteNerse: segun las evaluaciones del autor, el modelo puede no intentar responder, lo que se penaliza menos que una respuesta erronea en su metrica de indice.
- Integracion con recuperacion externa (engram de Tablinum): las pruebas preliminares muestran mejora del indice de acierto de -3,4 a +12,9 en el subconjunto de 116 items de AA dev.
- Compatible con endpoints y con el ecosistema llama.cpp (`--jinja`, plantillas de chat).
- Soporte de cuantizacion extrema (1 bit) manteniendo el 94,7% de coincidencia de token superior en mezcla y el 87,7% en wikitext.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- Idiomas: solo ingles declarado.

## Casos de uso

- Despliegue en GPU de consumo con 8 GB o menos: el fichero IQ1_S de 7,76 GB permite ejecutar un MoE de 26,4B en tarjetas como la RTX 3060 Ti o 4060 Ti, con los expertos en RAM del sistema mediante `--cpu-moe` y la atencion en GPU.
- Procesamiento de documentos largos: la ventana de 1M tokens permite analizar contratos, expedientes o bases de codigo completas en una sola pasada sin troceado, algo inviable en modelos de contexto corto.
- Analisis de imagenes con contexto textual extenso: al aceptar entrada image-text-to-text, se puede adjuntar una captura o diagrama junto con documentacion de referencia de decenas de miles de tokens.
- Prototipado e investigacion de cuantizacion: los ficheros incluyen mediciones de KLD y coincidencia de token superior, lo que los convierte en material de referencia para comparar tecnicas de compresion (NVFP4 frente a IQ1_S) sobre una misma arquitectura.
- Servidor local de bajo coste con llama-server: la configuracion documentada (`-ngl 99 -fa on --jinja`) permite levantar un endpoint compatible con la API de OpenAI en una sola maquina, util para entornos de desarrollo sin presupuesto de nube.
- Evaluacion de pipelines de recuperacion aumentada: las pruebas con engram muestran que el modelo se beneficia de contexto recuperado externamente, por lo que sirve para validar arquitecturas RAG sobre modelos MoE comprimidos.
- Educacion e investigacion sobre arquitecturas con bucles: al ser Apache-2.0 y estar disponible en GGUF, permite estudiar el comportamiento de un looped transformer sin acceso a infraestructura de datacenter.

## Benchmarks y rendimiento

Evaluaciones preliminares del autor con el fichero NVFP4, expertos en CPU y una RTX 2060, con el muestreo propio del modelo. AA es el conjunto de desarrollo de 200 items, corregido a ciegas por Claude Haiku 4.5.

| Benchmark | Closed book | Con engram (recuperacion Tablinum) |
|---|---|---|
| AA dev, 200 items | 39 correctos, 120 no intentados (19,5%, indice -0,5) | en curso |
| AA dev, 116 items completados en ambos brazos | 20 correctos, 24 erroneos (indice -3,4) | 35 correctos, 20 erroneos (indice +12,9) |

Calidad de cuantizacion (KLD frente a BF16, mezcla / wikitext; coincidencia de token superior, mezcla / wikitext):

| Fichero | Tamano | KLD | Coincidencia token superior |
|---|---|---|---|
| NVFP4 | 19,1 GB | 0,0028 / 0,0075 | 98,5% / 96,2% |
| IQ1_S (Lite-Beam) | 7,76 GB | 0,0341 / 0,0977 | 94,7% / 87,7% |
| UD-IQ1_S (Unsloth, referencia) | 7,76 GB | 0,0340 / 0,0983 | no disponible |

El autor senala que el IQ1_S de Lite-Beam empata con el de Unsloth: mejora un 0,6% en wikitext y empeora un 0,2% en mezcla. EngramBench, SimpleQA y GSM8K estan pendientes de publicacion. No hay resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero NVFP4 (19,1 GB) requiere unos 20 GB de VRAM para carga completa en GPU; el IQ1_S (7,76 GB) cabe en 8 GB si se mantienen los expertos en CPU.
- Configuracion de 6 GB documentada: `--cpu-moe --no-op-offload -np 2 -c 49152 -ub 128 -b 512`, que deja los expertos en RAM del sistema y la atencion en la GPU.
- GPU recomendadas: para carga completa, A100 40 GB, H100 o RTX 4090 (24 GB); para el fichero de 1 bit, RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. El autor ha validado el NVFP4 en una RTX 2060 con expertos en CPU.
- Cabe en GPU de consumo: si, con el fichero IQ1_S y offload parcial de expertos; el NVFP4 completo no cabe en tarjetas de 16 GB.
- Opciones de despliegue: llama.cpp mainline con soporte del bucle `inkling2_loop` (PRs #32694 y #32704) mediante `llama-server`; compatible con `--jinja` y endpoints. No se documenta soporte en vLLM, TGI ni Ollama en la informacion disponible.
- Muestreo recomendado por el autor: `--temp 1.0 --top-p 1.0 --top-k 0 --min-p 0`.
- Latencia y throughput: no disponibles. El autor advierte de que el modelo puede entrar en bucles de razonamiento repetitivos, por lo que conviene limitar `max_tokens`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Lite-Beam Inkling-2-Mini NVFP4 | 26,4B | 3,4B | 1M | Apache-2.0 | GGUF | KLD 0,0028 / 0,0075; 19,1 GB |
| Lite-Beam Inkling-2-Mini IQ1_S | 26,4B | 3,4B | 1M | Apache-2.0 | GGUF | KLD 0,0341 / 0,0977; 7,76 GB |
| Unsloth Inkling-2-Mini UD-IQ1_S | 26,4B | 3,4B | 1M | Apache-2.0 | GGUF | KLD 0,0340 / 0,0983; 7,76 GB; referencia de comparacion |
| Inkling-2-Mini (base) | 26,4B | 3,4B | 1M | Apache-2.0 | safetensors | Checkpoint original de Thinking Machines |

La comparacion relevante es interna a la familia Inkling-2-Mini, ya que no se dispone de datos de modelos de otros fabricantes con los que contrastar rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de vista previa: el autor declara que la formula Lite-Beam de baja precision todavia no supera a las cuantizaciones UD de Unsloth, y que el fichero de 1 bit se reemplazara cuando lo consiga.
- Bucles de razonamiento: problema conocido aguas arriba; el modelo puede generar razonamiento repetitivo durante mucho tiempo, por lo que es imprescindible limitar `max_tokens` en produccion.
- Solo ingles: el modelo declara unicamente el idioma ingles, sin soporte multilingue.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; las evaluaciones preliminares muestran 24 respuestas erroneas de 116 items en closed book, con un indice negativo de -3,4.
- Dependencia de una version especifica de llama.cpp: requiere las PRs #32694 y #32704, no presentes en releases estables en el momento de la publicacion.
- Rendimiento en GPU limitado: el autor ha medido en una RTX 2060 con expertos en CPU, lo que no representa el throughput en hardware de datacenter.
- Evaluaciones incompletas: EngramBench, SimpleQA y GSM8K estan pendientes; no hay MMLU ni HumanEval.
- Licencia Apache-2.0 permisiva para uso comercial, pero el modelo base procede de Thinking Machines y la cuantizacion IQ1_S deriva del trabajo de Unsloth, cuyas condiciones deben respetarse.
- La comparabilidad de KLD solo es valida dentro de una misma tabla, ya que las mediciones en GPU y CPU difieren en torno a un 1,5%.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tablinum/Lite-Beam-Inkling-2-Mini-GGUF-Preview
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones de referencia de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- PR de llama.cpp con soporte del bucle: https://github.com/ggml-org/llama.cpp/pull/32694
- Segunda PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32704
