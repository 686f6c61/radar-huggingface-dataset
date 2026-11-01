# tablinum/Moon-Beam-16B-A3B-GGUF

## Resumen

Moon-Beam 16B-A3B es un ajuste fino (fine-tune) de Moonlight-16B-A3B-Instruct, el modelo MoE de 16.000 millones de parametros totales y 3.000 millones activos publicado por Moonshot AI bajo licencia MIT. Lo desarrolla tablinum, un proyecto independiente, y su proposito es especializar el modelo base en el uso correcto de un "engram" (una base de conocimiento recuperable organizada en 26 tablas) denominado Tablinum-2. El modelo lee los pasajes recuperados, responde a partir de ellos cuando contienen la respuesta y declina contestar cuando no la contienen.

La relevancia del modelo no reside en su capacidad bruta, sino en la calibracion: segun la model card, con los pasajes delante Moon-Beam acierta aproximadamente igual que su base, pero deja de adivinar cuando la evidencia no sostiene la respuesta. En EngramBench (502 preguntas retenidas) pasa de un indice de -46,8 en modo closed-book a +73,3 con el engram, con 406 aciertos y 38 errores. En SimpleQA-verified reduce los errores de 371 (modelo sin entrenar) a 155.

Esta ficha cubre la version cuantizada en GGUF para llama.cpp, distribuida en tres builds (IQ2_XXS, IQ3_XXS e IQ4_XS) con matrices de importancia propias. El repositorio ocupa 23,8 GB y acumula 978 descargas en el momento de la consulta. El modelo esta pensado exclusivamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA (herencia de DeepSeek V3 / Moonlight); fine-tune QLoRA sobre Moonlight-16B-A3B-Instruct |
| Parametros totales | 15.960.110.208 (aproximadamente 16B) |
| Parametros activos | 3B (aproximadamente, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (6,08 GB), IQ3_XXS (8,06 GB, recomendada), IQ4_XS (9,67 GB); pesos BF16 en el repo base |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); safetensors BF16 en el modelo base |
| Tamano del repositorio | 23,8 GB |
| Biblioteca | llama.cpp |
| Modelo base | tablinum/Moon-Beam-16B-A3B (a su vez derivado de moonshotai/Moonlight-16B-A3B-Instruct) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Moonlight-16B-A3B: un transformer con mezcla de expertos (MoE) que activa aproximadamente 3.000 millones de parametros por token sobre un total de 16.000 millones, con atencion MLA (multi-head latent attention) heredada de la familia DeepSeek V3. El ajuste fino se realizo como QLoRA de rango 16 aplicado a la atencion MLA, a los expertos compartidos y a la capa densa inicial, manteniendo congelados los 64 expertos enrutados. Segun la model card, el entrenamiento consistio en una epoca sobre una sola GPU de 12 GB.

El conjunto de datos consta de 2.198 ejemplos generados por Claude Haiku a partir de pasajes de las 21 tablas no sanitarias de Tablinum-2. La composicion es: 72% ejemplos de respuesta (pregunta con el pasaje correcto oculto entre pasajes casi correctos), 17% preguntas abiertas o casi abiertas sin referencias utiles, y 11% ejemplos de declinacion ante consultas factuales (nombres, cifras, fechas) que los pasajes no contienen, nunca aplicados a preguntas de procedimiento. El proceso requirio tres iteraciones: la primera aprendio a declinar todo, la segunda respondia todo de forma breve y segura, y la tercera, la receta final, equilibra utilidad y honestidad.

Las cuantizaciones GGUF emplean una importance matrix calculada sobre el propio Moon-Beam y layouts por tensor: atencion, expertos compartidos y capa densa un nivel por encima de los expertos enrutados, con `ffn_down_exps` (1.408 columnas) en tipos de bloque de 32.

## Capacidades

- Generacion de texto conversacional en ingles con respuestas fundamentadas en pasajes recuperados.
- Calibracion ante ausencia de evidencia: declina responder consultas factuales cuando los pasajes no contienen la respuesta.
- Recuperacion aumentada (RAG) sobre las 26 tablas del engram Tablinum-2 con una unica busqueda global, sin enrutador por dominio.
- Respuestas a preguntas de procedimiento (how-to) sin necesidad de referencias.
- Razonamiento aritmetico basico y resolucion de problemas de matematicas escolares (con perdida respecto al base, ver benchmarks).
- Conocimiento general medido en MMLU-Pro, aunque con tendencia a responder en prosa en lugar de con la letra de la opcion.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Sistemas de preguntas y respuestas sobre base documental propia: el modelo esta entrenado para leer pasajes recuperados y responder solo cuando estos contienen la respuesta, lo que lo hace adecuado para asistentes internos donde una respuesta inventada es costosa.
- Atencion al cliente con base de conocimiento controlada: puede integrarse en un pipeline RAG donde el engram o los documentos de la empresa se recuperan y el modelo responde o deriva a un humano cuando no hay evidencia.
- Verificacion factual con abstención: util en flujos donde se prefiere "no lo se" a una respuesta incorrecta, como consultas sobre fechas, cifras o nombres de productos.
- Asistente de soporte tecnico y guias de procedimiento: las preguntas how-to se responden sin necesidad de referencias, lo que encaja con manuales de reparacion, instalacion o configuracion.
- Despliegue en hardware de consumo: el build IQ3_XXS ocupa 8,06 GB y cabe en GPUs consumer de 12 GB o en configuraciones con RAM unificada, lo que permite prototipos locales de RAG sin infraestructura de servidor.
- Evaluacion de calibracion en investigacion: sirve como referencia para estudiar el efecto de un fine-tune pequeno sobre la tasa de abstención en modelos MoE, con metricas publicadas de EngramBench, SimpleQA y AA-Omniscience.
- Indexacion y consulta de corpus estructurados en tablas: el modelo demuestra que una busqueda unica sobre 26 tablas encuentra el pasaje correcto en el top-3 para el 95% de las preguntas, lo que simplifica la arquitectura de recuperacion.

## Benchmarks y rendimiento

Datos publicados en la model card. El indice se calcula como 100 × (aciertos − errores) / n, de modo que un error penaliza igual que un acierto. Las evaluaciones se hicieron con el build IQ3 y fueron calificadas por Claude Haiku contra las respuestas de referencia, emparejando las mismas preguntas entre modelos.

| Benchmark (IQ3, emparejado) | Moonlight sin entrenar (closed-book → con engram) | Moon-Beam (closed-book → con engram) | Aciertos / errores con engram (Moon-Beam) |
|---|---:|---:|---:|
| EngramBench 502, 26 tablas | −58,6 → +65,1 | −46,8 → +73,3 | 406 / 38 (sin entrenar: 406 / 79) |
| SimpleQA-verified 1000 | −88,6 → +17,7 | −36,0 → +34,9 | 504 / 155 (sin entrenar: 548 / 371) |
| AA-Omniscience test 400 | −75,5 → −42,5 | −57,2 → −16,5 | 78 / 144 (sin entrenar: 96 / 266) |

| Habilidad general (IQ3, mismo prompt) | Moonlight sin entrenar | Moon-Beam |
|---|---:|---:|
| GSM8K (400, cadena de razonamiento corta) | 83,5% | 71,8% |
| MMLU-Pro (700, 14 × 50, zero-shot con letra) | 36,9% | 31,7% (35,8% sobre las 619 que respondio con letra) |

| Build | Bytes | Tamano | KLD vs BF16 (chat / wiki) | Mismo top-1 | EngramBench tabla propia | SimpleQA + engram |
|---|---:|---:|---:|---:|---:|---:|
| IQ2_XXS | 6.078.073.376 | 6,08 GB | 0,114 / 0,235 | 89,1% | +73,7 | +31,6 |
| IQ3_XXS (recomendada) | 8.059.054.624 | 8,06 GB | 0,027 / 0,061 | 95,0% | +74,1 | +34,9 |
| IQ4_XS | 9.668.285.984 | 9,67 GB | 0,006 / 0,015 | 97,5% | +71,7 | +37,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,1 GB (IQ2_XXS), 8,1 GB (IQ3_XXS) y 9,7 GB (IQ4_XS) solo para los pesos; anadir margen para el contexto KV y el runtime de llama.cpp.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para los tres builds; A100 y H100 para despliegues de mayor concurrencia o con contexto largo.
- Cabe en GPU consumer: si, los tres builds caben en GPUs de 8-12 GB; el IQ2_XXS es el unico que deja margen amplio en tarjetas de 8 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y cualquier runtime compatible con GGUF; el modelo esta etiquetado como `endpoints_compatible`. No se documenta soporte de vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un MoE con 3B activos, el coste por token es inferior al de un modelo denso de 16B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moon-Beam 16B-A3B | 16B / 3B | no disponible | Fine-tune QLoRA para calibracion con engram | MIT | GGUF y BF16 en HuggingFace |
| Moonlight-16B-A3B-Instruct | 16B / 3B | no disponible | Modelo base instructivo generalista | MIT | HuggingFace (moonshotai) |
| Moon-Beam 16B-A3B (BF16) | 16B / 3B | no disponible | Pesos completos del mismo fine-tune | MIT | HuggingFace (tablinum) |

La comparacion principal es contra su propio modelo base: Moon-Beam pierde entre 8 y 12 puntos en GSM8K y alrededor de 5 puntos en MMLU-Pro, pero reduce drasticamente los errores en tareas factuales con recuperacion (SimpleQA: 155 errores frente a 371). No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El fine-tune degrada habilidades generales: GSM8K cae de 83,5% a 71,8% y MMLU-Pro de 36,9% a 31,7%; el razonamiento matematico es mas corto y omite pasos con frecuencia.
- Tiende a responder preguntas de opcion multiple en prosa en lugar de con la letra, lo que penaliza la puntuacion automatica en MMLU-Pro (aunque sobre las que responde con letra el conocimiento se mantiene).
- El modelo solo esta entrenado y evaluado en ingles; no se documenta rendimiento en castellano ni en otros idiomas.
- La calibracion depende de que los pasajes recuperados sean relevantes; fuera del engram Tablinum-2 o con recuperacion deficiente, la abstención puede aumentar o la respuesta puede no estar fundamentada.
- El build IQ2_XXS pierde detalle en respuestas practicas largas (en pruebas del autor, el modelo completo gano 56 a 10 en consejos de reparacion del hogar); se recomienda IQ3 o IQ4 para tareas de asesoramiento.
- Riesgo de alucinacion residual: aunque el entrenamiento reduce los errores, en AA-Omniscience el indice con engram sigue siendo negativo (−16,5), lo que indica que las respuestas incorrectas superan a las correctas en ese conjunto.
- Los datos de entrenamiento fueron generados por Claude Haiku, lo que puede introducir sesgos de estilo y cobertura del generador.
- Licencia MIT permite uso comercial sin restricciones adicionales, pero no se ofrece garantia alguna sobre el comportamiento en produccion.
- No se documenta la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin verificacion empirica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tablinum/Moon-Beam-16B-A3B-GGUF
- Pesos BF16: https://huggingface.co/tablinum/Moon-Beam-16B-A3B
- Dataset Tablinum-2 engram: https://huggingface.co/datasets/tablinum/tablinum-2
- Coleccion Moon-Beam: https://huggingface.co/collections/tablinum/moon-beam-6ae64ea51cef0d52d1461fc2
- Coleccion Lite-Beam: https://huggingface.co/collections/tablinum/lite-beam-6ad61ee3f54fc02b5d33af93
- Modelo base Moonlight-16B-A3B-Instruct: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
