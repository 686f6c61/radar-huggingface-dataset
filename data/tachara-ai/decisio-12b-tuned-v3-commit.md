# tachara-ai/Decisio-12b-tuned-v3-commit

## Resumen

Decisio-12b-tuned-v3-commit es un ajuste fino del modelo base google/gemma-4-12B-it desarrollado por Tachara AI Lab, disenado especificamente para funcionar como motor de decision dentro de decisio, un servidor open source que recibe un texto y preguntas tipadas (si/no, eleccion unica entre opciones, puntuacion en una escala definida) y devuelve una probabilidad para cada opcion en un unico forward pass por pregunta.

El modelo no es un asistente conversacional general, sino un clasificador probabilistico de preguntas cerradas sobre un texto. Su valor reside en que sus probabilidades estan calibradas a temperaturas especificas por tipo de pregunta y en que supera de forma medible tanto al modelo base como a la version anterior de Decisio en precision sobre preguntas retenidas de su distribucion de entrenamiento.

Tecnicamente se trata de un transformer denso de 11.959.730.224 parametros (aproximadamente 12B activos en cada paso), con pesos en bf16 fusionados y un tamano de repositorio de 24 GB. Se distribuye bajo licencia Apache 2.0, la misma del modelo base, e incluye un archivo `decision_config.json` que define el layout de prompt, el readout, la configuracion del calculador y las temperaturas por tipo de pregunta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de google/gemma-4-12B-it) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en bf16; otros formatos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 fusionado, 22 GB de pesos; repo de 24 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it` en la revision `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7` y se obtiene mediante un adaptador LoRA de rango 32 y alpha 64, entrenado durante una epoca sobre 463.859 preguntas. El adaptador se fusiona posteriormente en el modelo base en float32 con redondeo estocastico con semilla a bf16; el archivo `decision_config.json` documenta el proceso de fusion y `SHA256SUMS` permite verificar la integridad de cada archivo.

Las temperaturas de calibracion (choice 1.08, yes/no 1.43, score 1.10) se obtuvieron como el ajuste de minimo log-loss por tipo de pregunta sobre la mitad de un split retenido. El modelo incorpora una regla de "commit" para respuestas si/no: una probabilidad estrictamente entre 0.20 y 0.80 se reporta como 0.80 o 0.20, de modo que la respuesta nunca cambia pero la confianza declarada se aleja del centro de incertidumbre. Ademas, con el calculador activado (decisio 0.50.1 o posterior), el modelo procesa bloques numericos para preguntas sobre fechas, horas y aritmetica.

## Capacidades

- Clasificacion probabilistica de preguntas cerradas sobre un texto: si/no, eleccion unica entre opciones y puntuacion en una escala definida por el usuario.
- Generacion de una probabilidad por opcion en un unico forward pass por pregunta, lo que permite evaluar muchas preguntas sobre el mismo texto de forma eficiente.
- Calibracion de probabilidades a temperaturas especificas por tipo de pregunta (choice, yes/no, score) cuando se sirve mediante decisio.
- Aplicacion de la regla de commit en respuestas si/no para alejar la confianza declarada de la banda 0.20-0.80.
- Soporte de calculador (`calc-v1`) para preguntas con bloques numericos: fechas, horas y aritmetica, con mejora de precision de aproximadamente 57-60% a aproximadamente 83% en 874 preguntas de ese tipo.
- Robustez a variaciones de redaccion y orden de opciones: 81.2% en 1.050 preguntas que prueban como el fraseo y el orden de las opciones influyen en la respuesta.
- Capacidad de lectura general heredada del base: 73.4% en 1.028 preguntas de lectura general (base 70.5%).
- Tool calling, agentes, vision, audio y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Moderacion y triaje de contenido: dado un texto y una bateria de preguntas si/no (por ejemplo, "es ofensivo", "menciona datos personales", "es spam"), el modelo devuelve una probabilidad por pregunta en un unico forward pass, lo que permite aplicar umbrales configurables y auditar la confianza declarada.
- Enrutamiento de tickets de soporte: con preguntas de eleccion unica entre categorias predefinidas, el modelo asigna una probabilidad a cada categoria y el sistema puede derivar el ticket a la cola adecuada o escalarlo cuando la probabilidad maxima no supera un umbral.
- Extraccion de senales estructuradas de documentos: sobre contratos, informes o correos, se lanzan preguntas cerradas (presencia de clausulas, plazos, importes) y se obtiene una distribucion de probabilidad por opcion, util para pipelines de revision documental.
- Encuestas y formularios automatizados: conversion de respuestas en texto libre a preguntas tipadas con escala definida, usando el tipo `score` para mapear el texto a un valor en la escala y aprovechar la calibracion por temperatura del modelo.
- Analisis de sentimiento y opinion con granularidad fina: preguntas si/no y de eleccion multiple sobre resenas o comentarios, con la regla de commit reduciendo la ambiguedad en la confianza reportada para respuestas dudosas.
- Verificacion de hechos acotada: comprobacion de afirmaciones concretas contra un texto de referencia mediante preguntas si/no, aprovechando el 83.9% en el conjunto de 1.178 preguntas fuera de la distribucion de entrenamiento.
- Calculo sobre datos con fecha y hora: con el calculador activado, preguntas sobre plazos, diferencias de fechas o aritmetica simple sobre bloques numericos del texto, con precision de aproximadamente 83% en ese subconjunto.

## Benchmarks y rendimiento

Resultados sobre 5.000 preguntas retenidas de la distribucion de entrenamiento, en bf16 y medidas a traves de decisio con el modo batch-invariant desactivado. No son resultados de un benchmark independiente.

| Conjunto | Gemma 4 12B base | Decisio tuned 12B anterior | Decisio v3 |
|---|---:|---:|---:|
| Todas las preguntas | 67.7% | 71.6% | 78.8% |
| Choice (2.792) | 68.9% | 71.7% | 79.8% |
| Yes/no (1.220) | 83.0% | 84.7% | 89.8% |
| Score (988) | 45.1% | 55.2% | 62.2% |

Otros resultados reportados por el autor:

| Prueba | Base | Anterior | Decisio v3 |
|---|---:|---:|---:|
| Robustez a redaccion y orden (1.050 preguntas) | 71.5% | 75.6% | 81.2% |
| Fuera de la distribucion de entrenamiento (1.178 preguntas) | 83.2% | no disponible | 83.9% |
| Lectura general (1.028 preguntas) | 70.5% | no disponible | 73.4% |

Metricas adicionales:

- Ganancia frente al modelo tuned anterior: +7.2 puntos en el conjunto de 5.000 preguntas, con limite inferior del intervalo del 90% en +6.2.
- Brier score en la mitad de las preguntas retenidas (la otra mitad usada para ajustar): 0.234 con temperaturas por tipo; 0.316 con una temperatura compartida de 3.592.
- Regla de commit en 1.220 preguntas si/no: precision 89.8% con y sin la regla; log loss pasa de 0.232 a 0.253; el 19.3% de las respuestas cayeron en la banda 0.20-0.80.
- Calculador activado: preguntas de fecha, hora y aritmetica con bloque numerico pasan de aproximadamente 57-60% a aproximadamente 83% de precision (874 preguntas); las preguntas sin nada que calcular se responden igual que con el calculador desactivado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 22 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM para cargar el modelo sin cuantizar; con cuantizacion a 8 bits o 4 bits el requisito baja, pero no se han publicado pesos cuantizados en el repositorio.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para servir en bf16 con margen para el contexto y el servidor vLLM; una RTX 4090 de 24 GB queda al limite para bf16 y probablemente requiera cuantizacion.
- Cabe en consumer GPU: si, en RTX 4090 de 24 GB con cuantizacion; en bf16 el margen es muy ajustado.
- Opciones de despliegue: el metodo documentado es `uv run python -m decisio.serve.vllm_engine --base tachara-ai/Decisio-12b-tuned-v3-commit`, con decisio 0.50.1 o posterior y su extra de vLLM (probado con decisio 0.50.2 y vLLM 0.31.0). Otros servidores no aplican las temperaturas de calibracion y devuelven probabilidades mas planas o mas agudas que las declaradas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (conjunto 5.000) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| Decisio-12b-tuned-v3-commit | 11.959.730.224 | no disponible | 78.8% | Apache 2.0 | Hugging Face |
| Decisio tuned 12B anterior | no disponible | no disponible | 71.6% | no disponible | Hugging Face |
| google/gemma-4-12B-it (base) | no disponible | no disponible | 67.7% | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos reportados por el autor en la model card; no se dispone de datos de otros modelos de clasificacion o decision comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las cifras proceden de preguntas retenidas de la distribucion de entrenamiento, no de un benchmark independiente; la generalizacion a dominios muy distintos no esta garantizada.
- La calibracion solo se mantiene a las temperaturas incluidas cuando el modelo se sirve mediante decisio; otros servidores que no apliquen temperatura devuelven probabilidades mas planas o mas agudas que las declaradas.
- El modelo no ha sido entrenado con imagenes; no es multimodal.
- El modelo esta especializado en preguntas cerradas sobre un texto; no es un asistente conversacional general ni un generador de texto libre.
- El servidor rechaza arrancar si `decision_config.json` difiere del perfil de decisio instalado, lo que obliga a mantener versiones alineadas.
- Las revisiones posteriores del repositorio pueden cambiar `decision_config.json` (por ejemplo, una configuracion de calculador mas nueva) sin cambiar los pesos; conviene fijar un commit con `--base tachara-ai/Decisio-12b-tuned-v3-commit@<commit>` y verificar con `SHA256SUMS`.
- No se han publicado datos sobre sesgos, idiomas soportados ni riesgo de alucinacion mas alla de las limitaciones declaradas por el autor.
- Uso comercial permitido bajo Apache 2.0, con la obligacion de conservar el archivo `NOTICE` que nombra el repositorio y la revision del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-v3-commit
- Repositorio decisio: https://github.com/aminry/decisio
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Tachara AI Lab en Hugging Face: https://huggingface.co/tachara-ai
