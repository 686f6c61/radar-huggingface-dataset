# webmp3/Sakura-Fara1.5-4B-GGUF

## Resumen

Sakura-Fara1.5-4B-GGUF es un repositorio de cuantizaciones GGUF creado por el usuario webmp3 a partir del modelo microsoft/Fara1.5-4B, un agente multimodal de uso de ordenador orientado a la navegacion web. Fara1.5-4B, segun la model card del autor, se construye sobre una base Qwen3.5, lee capturas de pantalla del navegador y emite llamadas a herramientas estructuradas, con 4.205.751.296 parametros (4,21 mil millones) en total y licencia MIT. Este repositorio no es una publicacion oficial de Microsoft, sino una cuantizacion comunitaria independiente dentro de la linea Sakura Mini.

El problema que resuelve es el de la huella de memoria: el repositorio ofrece tres archivos GGUF de distinto tamano generados con un metodo de asignacion de bits por matriz basado en sensibilidad medida, en lugar de reglas fijas. Los tres archivos son de 1,88 GiB (3,83 bpw), 2,28 GiB (4,65 bpw) y 2,65 GiB (5,42 bpw), e incluyen un proyector de vision aparte en F16 (mmproj-Fara1.5-4B-f16.gguf) para conservar la capacidad multimodal.

Es relevante ahora porque permite ejecutar un agente de navegacion multimodal de 4B en llama.cpp estandar sobre hardware de consumo, con una perdida de calidad medida y publicada (divergencia KL y perplejidad frente al BF16 original) y con una mejora de KL del 14 % al 42 % frente a cuantizaciones equivalentes en tamano de bartowski.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5 segun la model card del autor) con proyector de vision; no se detalla si usa atencion lineal, MoE o decodificacion especulativa |
| Parametros totales | 4.205.751.296 (4,21 mil millones) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estandar de llama.cpp: IQ3_XXS, IQ3_S, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0 (mezcla por matriz); proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) mas mmproj-Fara1.5-4B-f16.gguf para vision |
| Tamano del repositorio | 8,0 GB (tres archivos GGUF de 1,88 / 2,28 / 2,65 GiB mas el proyector) |
| Modelo base | microsoft/Fara1.5-4B (relacion: quantized) |
| Fecha de publicacion | 4 de octubre de 2026 (segun HuggingFace) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: es una conversion a GGUF del BF16 original de microsoft/Fara1.5-4B. La arquitectura subyacente es, segun la model card, la de un agente de uso de ordenador de la familia Fara de Microsoft, con base Qwen3.5 y naturaleza multimodal (entrada image-text-to-text): procesa capturas de pantalla del navegador y produce llamadas a herramientas estructuradas. Los detalles de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

La innovacion tecnica del repositorio esta en el metodo de cuantizacion. Partiendo del GGUF en BF16 y de la importance matrix de bartowski/Fara1.5-4B-GGUF, cada matriz de pesos grande se cuantiza una vez por cada tipo candidato (Q2_K, IQ2_S, IQ3_XXS, IQ3_S, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0) con llama-quantize. El error de cada opcion se estima ponderado por importancia y se escala con un factor de sensibilidad medido con divergencia KL real: cada grupo de tensores (proyecciones down de la FFN, proyecciones value de la atencion, primera y ultima capa) se degrada de forma aislada a un tipo de menos bits y se compara la KL resultante con su error de cuantizacion. Finalmente, una asignacion exacta de presupuesto (mochila de eleccion multiple sobre bytes) elige un tipo por matriz para cada tamano objetivo, y el modelo se ensambla desde los tensores ya almacenados sin recuantizar. Las normas, los tensores pequenos y las capas de prediccion multi-token se mantienen en alta precision; los tipos por tensor no se publican.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como conversational y la pipeline es image-text-to-text.
- Comprension de capturas de pantalla: el modelo base lee imagenes del navegador como entrada, por lo que la cuantizacion conserva el modo multimodal mediante el proyector F16.
- Llamadas a herramientas estructuradas (tool calling): el modelo base emite tool calls para interactuar con el navegador.
- Comportamiento de agente de uso de ordenador: navegacion web multi-paso, con recomendacion explicita de Microsoft de ejecutarlo dentro de un sandbox con monitorizacion (MagenticLite).
- Razonamiento multi-paso orientado a tareas: implicito en el uso como agente, aunque sin datos de benchmarks de tareas en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de navegacion web: el modelo puede recibir capturas del DOM renderizado y emitir acciones estructuradas (clic, escritura, scroll) para completar flujos de varios pasos, con el proyector de vision manteniendo la lectura de pantalla en las tres cuantizaciones.
- RPA sobre interfaces sin API: al operar sobre imagenes en lugar de sobre selectores, encaja en procesos internos de empresa cuyas aplicaciones legacy solo exponen interfaz grafica; desplegado en local, evita enviar capturas a servicios externos.
- Testing end-to-end de aplicaciones web: un agente que navega como un usuario real y valida el estado de la pantalla puede integrarse en pipelines de CI para detectar regresiones visuales y de flujo.
- Extraccion de datos de portales: recogida de informacion de portales publicos o paneles internos paginados, con el modelo iterando hasta agotar resultados y devolviendo los datos en formato estructurado.
- Agente local en equipos sin GPU dedicada: los archivos de 1,88 y 2,28 GiB permiten ejecutar el modelo en CPU con llama.cpp en portatiles con 8-16 GB de RAM, con la perdida de calidad documentada en la tabla de KL.
- Asistente conversacional multimodal de escritorio: atencion al usuario que adjunta capturas de pantalla y necesita explicaciones o acciones guiadas, ejecutandose en local por requisitos de privacidad.
- Investigacion en cuantizacion: la publicacion de KL, PPL y coincidencia del token mas probable frente a cuantizaciones de referencia permite reproducir y comparar metodos de asignacion de bits por matriz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona metricas de fidelidad de la cuantizacion frente al BF16 original: divergencia KL de la distribucion del siguiente token y perplejidad con llama-perplexity (12 fragmentos de 512 tokens por texto). Perplejidad de referencia del BF16: en 2,169; dev 2,242; wiki 10,998.

| Cuantizacion | Origen | Tamano | KLD en | KLD dev | KLD wiki | PPL en | Coincidencia token top (media) |
|---|---|---:|---:|---:|---:|---:|---:|
| Sakura-Fara1.5-4B-1.89GiB.gguf | este repositorio | 1,89 GiB | 0,0968 | 0,0898 | 0,1496 | 2,262 | 86,9 % |
| IQ3_XXS | bartowski (imatrix) | 1,97 GiB | 0,1590 | 0,1526 | 0,2436 | 2,368 | 84,7 % |
| Sakura-Fara1.5-4B-2.29GiB.gguf | este repositorio | 2,29 GiB | 0,0332 | 0,0303 | 0,0484 | 2,201 | 92,6 % |
| IQ4_XS | bartowski (imatrix) | 2,37 GiB | 0,0425 | 0,0364 | 0,0505 | 2,211 | 92,2 % |
| Sakura-Fara1.5-4B-2.66GiB.gguf | este repositorio | 2,66 GiB | 0,0136 | 0,0160 | 0,0216 | 2,177 | 95,2 % |
| Q4_K_M | bartowski (imatrix) | 2,69 GiB | 0,0257 | 0,0266 | 0,0351 | 2,186 | 93,9 % |
| Q5_K_M | bartowski (imatrix) | 3,09 GiB | 0,0086 | 0,0077 | 0,0103 | 2,173 | 96,8 % |

Composicion por tipo de tensor de cada archivo Sakura:

| Archivo | Tamano | bits/peso | Tipos de tensor por bytes |
|---|---:|---:|---|
| Sakura-Fara1.5-4B-1.89GiB.gguf | 1,88 GiB | 3,83 | IQ4_XS 35 %, IQ3_S 33 %, Q3_K 14 %, Q4_K 12 %, IQ3_XXS 3 %, Q5_K 2 % |
| Sakura-Fara1.5-4B-2.29GiB.gguf | 2,28 GiB | 4,65 | IQ4_XS 63 %, Q5_K 36 % |
| Sakura-Fara1.5-4B-2.66GiB.gguf | 2,65 GiB | 5,42 | Q5_K 92 %, IQ4_XS 7 % |

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano de archivo; el autor no publica cifras): en torno a 3-4 GB para el archivo de 1,88 GiB, 3,5-4,5 GB para el de 2,28 GiB y 4-5 GB para el de 2,65 GiB, sumando pesos, proyector de vision y cache KV a contexto moderado. Cifras orientativas, no medidas por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM permite cargar los pesos en memoria; una RTX 3060 de 12 GB o superior ofrece margen amplio para contexto largo y lote mayor. Para el modelo sin cuantizar en BF16 harian falta aproximadamente 9-10 GB solo de pesos.
- Cabe en GPU de consumo: si, en gamas con 6 GB o mas (RTX 3060, 4060, 4070, 4090, entre otras) y en equipos Apple Silicon con memoria unificada. El archivo de 1,88 GiB esta pensado explicitamente para presupuestos de memoria ajustados, a costa de perdida de calidad visible.
- Opciones de despliegue: llama.cpp (los tres archivos usan tipos ggml estandar, por lo que funcionan en llama.cpp sin parches), Ollama y cualquier frontend compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo servidor. El proyector de vision requiere un runtime que soporte mmproj para mantener el modo multimodal.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni de latencia por accion del agente.

## Comparativa con modelos similares

La comparacion natural es con las cuantizaciones de bartowski del mismo modelo base, que emplean la misma importance matrix y se midieron con los mismos textos y la misma maquina.

| Modelo o cuantizacion | Tamano | KLD media (en/dev/wiki) | PPL en | Coincidencia token top | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Sakura-Fara1.5-4B 1.89GiB | 1,89 GiB | 0,0968 / 0,0898 / 0,1496 | 2,262 | 86,9 % | MIT | HuggingFace (webmp3) |
| bartowski IQ3_XXS | 1,97 GiB | 0,1590 / 0,1526 / 0,2436 | 2,368 | 84,7 % | MIT | HuggingFace (bartowski) |
| Sakura-Fara1.5-4B 2.29GiB | 2,29 GiB | 0,0332 / 0,0303 / 0,0484 | 2,201 | 92,6 % | MIT | HuggingFace (webmp3) |
| bartowski IQ4_XS | 2,37 GiB | 0,0425 / 0,0364 / 0,0505 | 2,211 | 92,2 % | MIT | HuggingFace (bartowski) |
| Sakura-Fara1.5-4B 2.66GiB | 2,66 GiB | 0,0136 / 0,0160 / 0,0216 | 2,177 | 95,2 % | MIT | HuggingFace (webmp3) |
| bartowski Q4_K_M | 2,69 GiB | 0,0257 / 0,0266 / 0,0351 | 2,186 | 93,9 % | MIT | HuggingFace (bartowski) |
| bartowski Q5_K_M | 3,09 GiB | 0,0086 / 0,0077 / 0,0103 | 2,173 | 96,8 % | MIT | HuggingFace (bartowski) |

Frente al BF16 original (microsoft/Fara1.5-4B), la perdida de fidelidad es inevitable en cualquier cuantizacion; el archivo de 2,66 GiB se queda a una distancia de KL de 0,0136-0,0216, mientras que Q5_K_M, con 0,4 GiB mas, baja a 0,0077-0,0103. No se dispone de comparaciones con otros modelos de la misma categoria y tamano (agentes de uso de ordenador de ~4B) en la informacion proporcionada.

## Limitaciones y advertencias

- Las unicas metricas publicadas son divergencia KL y perplejidad sobre textos cortos reservados; el propio autor advierte que no deben interpretarse como una afirmacion de calidad en tareas. No hay evaluacion en benchmarks de agente ni de vision.
- La cuantizacion siempre degrada la calidad, y el archivo mas pequeno (1,88 GiB, 3,83 bpw) es el que mas pierde, con un aviso explicito de "perdida de calidad visible" y una coincidencia del token mas probable del 86,9 %.
- Las mediciones son una unica pasada en una unica maquina; el autor senala que diferencias pequenas de KL a tamano similar no constituyen un ranking de calidad.
- Fara es un agente de uso de ordenador: Microsoft recomienda ejecutarlo unicamente dentro de un sandbox con monitorizacion (MagenticLite). Ejecutarlo con acceso directo al navegador o al sistema de archivos conlleva riesgo de acciones no deseadas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo de 4B que genera acciones y llamadas a herramientas; las acciones propuestas deben validarse antes de ejecutarse.
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset de entrenamiento del modelo original.
- Idiomas soportados y longitud de contexto: no disponibles en la informacion proporcionada, por lo que no puede confirmarse un comportamiento fiable fuera del ingles ni con contextos largos.
- Licencia MIT: permite uso comercial sin restricciones adicionales segun los metadatos, pero al derivar del modelo de Microsoft conviene verificar los terminos del modelo base antes de un despliegue en produccion.
- Los nombres de archivo y tipos de tensor estan pensados para llama.cpp; otros runtimes pueden no soportar todas las mezclas (por ejemplo, combinaciones de IQ3_S, Q3_K y Q5_K en el archivo mas pequeno).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-Fara1.5-4B-GGUF
- Modelo base: https://huggingface.co/microsoft/Fara1.5-4B
- Cuantizaciones de referencia de bartowski: https://huggingface.co/bartowski/Fara1.5-4B-GGUF
- Coleccion Sakura Mini: https://huggingface.co/collections/webmp3/sakura-mini-6aba73f6a5a41296a3540373
- Paper, blog o repositorio adicional del autor: no disponible en la informacion proporcionada.
