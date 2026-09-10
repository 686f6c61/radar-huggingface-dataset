# Soulfate24/MiniCPM5-2B-DSpark-ASHQ1-Remix-GGUF

## Resumen

MiniCPM5-2B-DSpark-ASHQ1-Remix-GGUF es la version cuantizada en formato GGUF del modelo openbmb/MiniCPM5-2B-DSpark, publicada por el usuario Soulfate24. Se trata de un modelo de generacion de texto de tipo transformer denso con aproximadamente 2.516 millones de parametros (2.52B), derivado de la familia MiniCPM5 de OpenBMB, y orientado explicitamente a despliegue en dispositivo (on-device) y entornos edge gracias a su tamano reducido.

La particularidad de esta publicacion no es el modelo base en si, sino el esquema de cuantizacion propietario denominado ASHQ1-Remix, que el autor describe como una cuantizacion GGUF sensible a activaciones, con cada ratio, suelo y tope derivados de experimentos medidos. El repositorio incluye una escalera de siete niveles de cuantizacion personalizados (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc y Pico-24pc) comparados contra los niveles estandar de llama.cpp (Q8_0, Q6_K, Q5_K_M, IQ4_XS, IQ3_M) mediante perplejidad, divergencia KL y velocidad de inferencia.

El modelo es relevante para quienes necesitan ejecutar un LLM de 2.5B con contexto largo y soporte de tool calling en hardware de consumo, eligiendo un punto de equilibrio concreto entre fidelidad de cuantizacion y tamano en disco. La licencia Apache 2.0 facilita su uso comercial. No obstante, conviene senalar que el repositorio no incluye resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) ni especifica la longitud de contexto exacta, por lo que la evaluacion disponible se limita a metricas de fidelidad de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiquetado como "llama" en los tags; familia MiniCPM5) |
| Parametros totales | 2.516.756.480 (aprox. 2.52B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo se etiqueta como "long-context", pero la ficha no indica el numero de tokens) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (estandar) y niveles propios ASHQ1-Remix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base original se distribuye en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de lo que indican los metadatos: se trata de un transformer denso de 2.52B parametros perteneciente a la familia MiniCPM5 de OpenBMB, con etiquetas que lo asocian a la arquitectura tipo Llama. No hay datos publicados en esta ficha sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similares, por lo que estos apartados quedan como no disponibles.

La innovacion tecnica documentada se refiere exclusivamente al proceso de cuantizacion. El esquema ASHQ1-Remix se presenta como una cuantizacion GGUF "sensible a activaciones", nativa en BF16 y compatible con el linaje AutoRound con cotas de saturacion explicitas. El autor afirma haber validado la escalera de siete niveles en seis familias de modelos distintas. Ademas, el modelo base declarado es una variante "DSpark", cuyo significado tecnico (posiblemente decodificacion especulativa o un fine-tuning especifico) no se explica en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con pipeline declarado de text-generation.
- Soporte de tool calling / function calling, segun la etiqueta explicita "tool-calling" del repositorio.
- Orientado a contexto largo (etiqueta "long-context"), si bien no se especifica la ventana exacta en tokens.
- Disenado para despliegue on-device y edge (etiquetas "on-device" y "edge-ai"), con tamanos de archivo que van de 1.913 MiB a 4.229 MiB.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere integracion sencilla en infraestructuras de inferencia estandar.
- Capacidad de razonamiento multi-paso y uso como agente: no confirmada explicitamente en la informacion disponible; la etiqueta de tool calling es el unico indicio al respecto.
- Vision, audio o modo "thinking": no disponible; no se mencionan en la ficha.

## Casos de uso

- Asistentes conversacionales en dispositivo: con 2.52B parametros y cuantizaciones de entre 1.9 GB y 4.2 GB, el modelo puede ejecutarse en portatiles y equipos de gama media sin GPU dedicada, gestionando dialogos multi-turno localmente y sin enviar datos a la nube.
- Automatizacion de agentes con herramientas: la etiqueta de tool calling permite integrarlo en flujos donde el modelo decide que funcion invocar (consultas a API, lectura de ficheros, calculo) dentro de un bucle de razonamiento multi-paso.
- Procesamiento de documentos extensos: la orientacion a contexto largo lo hace adecuado para resumir o extraer informacion de contratos, informes o transcripciones, siempre que se confirme la ventana real soportada.
- Generacion de codigo ligera en local: puede emplearse como asistente de autocompletado o generacion de fragmentos en editores, con latencias bajas gracias a los ratios de velocidad reportados (hasta 557 t/s en el nivel Mini-30pc).
- Sistemas de atencion al cliente embebidos: al soportar endpoints compatibles y tool calling, se puede desplegar detras de una API para gestionar consultas frecuentes y escalar a un modelo mayor cuando la confianza sea baja.
- Traduccion y generacion bilingue ingles-chino: el soporte declarado de ambos idiomas lo hace util para equipos que trabajan con documentacion tecnica en esos dos idiomas.
- Prototipado rapido e investigacion sobre cuantizacion: el repositorio ofrece multiples niveles comparables entre si, lo que permite estudiar el compromiso entre perplejidad, divergencia KL y velocidad sin necesidad de reentrenar.
- Clasificacion y etiquetado de texto en lote: con un modelo de 2.5B y throughput alto en los niveles mas agresivos, es viable procesar grandes volumenes de texto en pipelines offline.

## Benchmarks y rendimiento

La informacion proporcionada incluye unicamente metricas de fidelidad de cuantizacion sobre wiki.test.raw (referencia simetrica FA-auto). No hay resultados de MMLU, HumanEval, GSM8K ni otras tareas estandar.

| Modelo / nivel | Tamano | PPL | KLD | RMS Δp | top-p | Velocidad |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 4229 MiB | 34.4742 | 0.0105 | 2.39% | 95.6% | 353 t/s |
| Fidelity-48pc | 3824 MiB | 34.3246† | 0.0247 | 3.42% | 94.0% | 371 t/s |
| Precision-42pc | 3384 MiB | 34.3791† | 0.0331 | 3.94% | 92.5% | 382 t/s |
| Q6_K-imx (stock) | 3266 MiB | 34.4411† | 0.0335 | 3.99% | 92.4% | 406 t/s |
| Quality-36pc | 2849 MiB | 34.6224 | 0.0743 | 5.80% | 88.3% | 466 t/s |
| Q5_K_M-imx (stock) | 2849 MiB | 34.6224 | 0.0743 | 5.80% | 88.3% | 470 t/s |
| Compact-33pc | 2630 MiB | 34.6636 | 0.1441 | 7.98% | 83.8% | 512 t/s |
| Mini-30pc | 2391 MiB | 33.5214† | 0.1728 | 8.66% | 81.8% | 557 t/s |
| IQ4_XS-imx (stock) | 2268 MiB | 34.8506 | 0.1813 | 9.17% | 81.2% | 457 t/s |
| Nano-27pc | 2152 MiB | 33.7551† | 0.2191 | 10.12% | 78.6% | 453 t/s |
| IQ3_M-imx (stock) | 1985 MiB | 36.4366 | 0.4492 | 14.31% | 70.5% | 539 t/s |
| Pico-24pc | 1913 MiB | 37.8642 | 0.3878 | 13.31% | 72.6% | 545 t/s |

Notas: el simbolo † aparece en la tabla original del autor, presumiblemente para marcar valores anómalos o marcadores de referencia. El autor clasifica Precision-42pc como recomendado y Fidelity-48pc como segunda mejor opcion; Nano-27pc y Pico-24pc aparecen marcados con un simbolo de descarte. El hardware y la configuracion exactos con los que se midieron los t/s no se especifican en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el tamano de cada nivel GGUF y anadiendo margen para cache KV y overhead de runtime:
  - Q8_0 (~4.2 GB de pesos): aproximadamente 5.5-6 GB de VRAM.
  - Precision-42pc (~3.4 GB): aproximadamente 4.5-5 GB.
  - Q6_K-imx (~3.3 GB): aproximadamente 4.5 GB.
  - Quality-36pc / Q5_K_M-imx (~2.8 GB): aproximadamente 3.5-4 GB.
  - Compact-33pc (~2.6 GB): aproximadamente 3.5 GB.
  - Mini-30pc (~2.4 GB): aproximadamente 3-3.5 GB.
  - IQ4_XS-imx (~2.3 GB): aproximadamente 3 GB.
  - IQ3_M-imx / Pico-24pc (~1.9-2.0 GB): aproximadamente 2.5-3 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 3060, GTX 1660 Super, etc.) es suficiente para los niveles medios. Los niveles Q8_0 y Precision-42pc encajan comodamente en GPUs de 6-8 GB (RTX 4060 Ti, RTX 3070, RTX 4070). Para despliegues en servidor con muchas peticiones concurrentes se recomienda A100, H100 o L40S, aunque el modelo es claramente de gama baja en cuanto a requisitos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna y en muchas iGPU con memoria unificada (Apple Silicon, APUs con suficiente RAM asignada). Tambien es viable en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Soporte en vLLM es limitado para GGUF, por lo que no se recomienda como opcion principal.
- Latencia y throughput: el autor reporta entre 353 t/s (Q8_0) y 557 t/s (Mini-30pc) sobre wiki.test.raw, aunque sin especificar el hardware de prueba. Estos valores deben tomarse como referencia relativa entre niveles, no como cifras absolutas reproducibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---:|---|---|---|---|
| MiniCPM5-2B-DSpark-ASHQ1-Remix (este) | 2.52B | no disponible | Apache 2.0 | GGUF (multinivel) | solo metricas de cuantizacion (PPL, KLD, t/s) |
| openbmb/MiniCPM5-2B (base) | 2.52B (aprox.) | no disponible | Apache 2.0 | safetensors | no disponible |
| Qwen2.5-1.5B-Instruct | ~1.5B | 32k (ampliable) | Apache 2.0 | safetensors, GGUF | benchmarks publicos en MMLU, HumanEval, GSM8K |
| Llama-3.2-3B-Instruct | ~3.2B | 128k | Llama 3.2 Community License | safetensors, GGUF | benchmarks publicos |
| Gemma-2-2B | ~2.6B | 8k | Gemma Terms of Use | safetensors, GGUF | benchmarks publicos |

La comparacion directa de rendimiento en tareas no es posible con la informacion disponible: ni la ficha de este modelo ni el material proporcionado incluyen resultados de MMLU, HumanEval, GSM8K o similares para MiniCPM5-2B. Las alternativas de la tabla se incluyen por similitud de tamano y licencia, no porque existan datos comparativos verificados en este contexto.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de tareas (razonamiento, codigo, matematicas) en la informacion disponible; no hay evidencia cuantitativa de su calidad mas alla de las metricas de cuantizacion.
- La longitud de contexto real no se especifica pese a la etiqueta "long-context". Conviene verificarla empiricamente antes de disenar aplicaciones que dependan de ventanas amplias.
- Solo se declaran ingles y chino como idiomas soportados. El rendimiento en castellano u otras lenguas no esta documentado y probablemente sea deficiente.
- La cuantizacion agresiva (niveles Compact-33pc, Mini-30pc, Nano-27pc y Pico-24pc) incrementa la divergencia KL y reduce el top-p, lo que se traduce en mayor degradacion de la calidad de generacion. El propio autor descarta Nano-27pc y Pico-24pc.
- Riesgo de alucinacion: inherente a cualquier modelo de 2.5B, especialmente en tareas de conocimiento factual, y agravado por cuantizaciones de baja precision.
- La etiqueta "DSpark" del modelo base no se explica en la informacion; se desconoce si implica tecnicas de decodificacion especulativa que puedan afectar a la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni evidencia de uso en produccion.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, siempre que se conserve la atribucion correspondiente. No obstante, se recomienda revisar la licencia del modelo base original y de cualquier conjunto de datos derivado.
- Los datos de velocidad (t/s) no especifican hardware ni configuracion, por lo que no son reproducibles tal cual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Soulfate24/MiniCPM5-2B-DSpark-ASHQ1-Remix-GGUF
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-2B
- Variante DSpark del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Suite de cuantizacion AutoRound-ASHQ1-Remix mencionada por el autor: https://huggingface.co/Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos trataban sobre la letra "S", la red de S-Bahn Rhein-Ruhr y horarios de trenes, por lo que se han descartado por no guardar relacion con el contenido de la ficha.
