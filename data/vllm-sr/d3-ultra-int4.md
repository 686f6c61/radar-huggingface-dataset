# vllm-sr/d3-ultra-INT4

## Resumen

d3-ultra-INT4 es la versión cuantizada a int4 de d3-ultra, un modelo fundacional multimodal de decisión de 26.090 millones de parámetros desarrollado por el equipo vllm-sr. No es un modelo generativo al uso: recibe una entrada (texto o JSON, opcionalmente con imágenes y vídeos) junto con una batería de preguntas y devuelve, para cada una, una probabilidad por respuesta. Admite cinco tipos de decisión: elección entre opciones, sí/no, puntuación en escala, caja delimitadora (Box) y seguimiento (Track). La cuantización reduce el peso en disco de 52,2 GB a 17,6 GB manteniendo las activaciones en BF16.

La relevancia de esta variante es de despliegue: permite servir un modelo de 26B en hardware con memoria limitada sin unidades matriciales especiales, a costa de una pérdida acotada de precisión. Según la model card, la suite pública Jev Decision Index 0.3 cae solo 0,10 puntos (71,47 frente a 71,57) y la suite de visión pública 0,95 puntos (74,40 frente a 75,35). El coste principal se concentra en la tarea Box sobre documentos y capturas de pantalla.

La arquitectura combina un codificador visual de 0,46B con un decodificador que incluye capas de atención lineal Gated DeltaNet. La cuantización es weight-only W4A16 con formato compressed-tensors, lo que exige un runtime específico (`d3q`) en lugar de un pipeline estándar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con decodificador que incluye capas de atención lineal Gated DeltaNet y codificador visual de 0,46B |
| Parametros totales | 26.085.330.160 (26,09B), incluidos 0,46B del codificador visual |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 weight-only W4A16 (compressed-tensors `pack-quantized`): pesos int4 asimétricos con zero points en grupos de 32 y escalas BF16; activaciones en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 17,6 GB en disco; requiere código custom (`d3q`) |

## Arquitectura y entrenamiento

El modelo es la cuantización del checkpoint d3-ultra publicado el 2026-10-24. El proceso parte de AWQ smoothing, que pliega escalas conscientes de la activación en las normas precedentes y en `up_proj`, seguido de redondeo GPTQ. Se cuantizan 400 proyecciones del decodificador; quedan intactos el `in_proj_a` e `in_proj_b` de las capas Gated DeltaNet, la torre de visión, los embeddings y el readout, salvo donde se aplicaron las escalas plegadas.

La calibración usó 832 peticiones de d3-turbo-INT4 mezcladas: 512 prompts de texto del primer shard de entrenamiento de tasksource-jev-typed-decisions, 256 peticiones Box (32 por familia) y 64 peticiones con imágenes dentro de las opciones. No se emplearon imágenes de los splits de desarrollo y test de Box ni de imágenes-en-opciones, ni peticiones de vídeo. El runtime carga el checkpoint con los pesos empaquetados y cada proyección cuantizada se convierte en una capa que descomprime su peso int4 a BF16 con un kernel Triton y multiplica en BF16.

## Capacidades

- Clasificación zero-shot y toma de decisiones tipada: elección entre opciones, sí/no, puntuación en escala, caja delimitadora y seguimiento de objetos.
- Procesamiento multimodal: texto, JSON, imágenes y vídeos, con varias imágenes o vídeos por petición.
- Imágenes dentro de preguntas y opciones (por ejemplo, comparar una foto con varias láminas o bocetos).
- Respuesta a múltiples preguntas sobre una misma entrada con una sola lectura del estado.
- Salida probabilística por respuesta, no solo la etiqueta ganadora.
- Detección de objetos y localización espacial (tipo Box).
- Seguimiento de objetos en vídeo (tipo Track).
- No dispone de generación de texto libre: es un modelo de decisión, no un chat.

## Casos de uso

- Enrutado de tickets de soporte: se envía el texto del ticket como estado y un conjunto de preguntas tipadas (equipo asignado, urgencia); el modelo devuelve probabilidades por categoría, útiles para umbrales y revisión humana.
- Moderación y clasificación de contenido: preguntas sí/no y de escala sobre textos o imágenes, con probabilidad asociada para calibrar políticas de bloqueo.
- Control de calidad en documentos: localización de campos mediante Box en facturas y formularios; conviene valorar la pérdida de precisión en recibos (0,793 frente a 0,957 en el modelo completo) antes de usarlo en producción.
- Análisis de vídeo para seguimiento: seguimiento de objetos con la tarea Track (AUC de éxito 0,754/0,757), adecuado para conteo y monitorización con memoria reducida.
- Evaluación visual comparativa: seleccionar entre varias imágenes candidatas la que coincide con una referencia, usando imágenes dentro de las opciones.
- Automatización de encuestas y anotación: puntuaciones en escala sobre lotes de entradas con una sola pasada por petición.
- Despliegue en hardware con memoria ajustada: servir el modelo en 17,6 GB de pesos frente a 52,2 GB, sin unidades matriciales especiales.

## Benchmarks y rendimiento

| Benchmark | d3-ultra-INT4 | d3-ultra |
|---|---|---|
| Jev Decision Index 0.3 (suite pública) | 71,47 | 71,57 |
| Coincidencia con la respuesta top de d3-ultra (272.229 preguntas) | 98,6% | referencia |
| Suite de visión pública | 74,40 | 75,35 |
| Coincidencia en suite de visión (12.210 preguntas) | 95,8% | referencia |
| Imágenes en preguntas y opciones | 0,941 | 0,952 |
| Track, AUC de éxito | 0,754 / 0,757 | 0,778 / 0,782 |
| Box, precisión a IoU 0,5 | 0,836 | 0,870 |
| Box en recibos | 0,793 | 0,957 |
| Box en capturas de pantalla | 0,961 | 0,999 |
| Latencia mediana, una pregunta de texto (MI300X) | 67 ms | 51 ms |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- Pesos en disco: 17,6 GB; la VRAM necesaria para inferencia no está especificada, pero debe cubrir los pesos más activaciones y estados en BF16.
- Medido en una AMD Instinct MI300X; no requiere unidades matriciales especiales.
- No se confirma su encaje en GPU de consumo; con 17,6 GB de pesos más overhead, una GPU de 24 GB es el mínimo plausible, pero no hay dato oficial.
- Despliegue mediante el runtime propio `d3q` con `transformers==5.17.0`, `compressed-tensors>=0.17`, torch, torchvision, triton, pillow, opencv-python-headless, safetensors y accelerate; opcionalmente `flash-linear-attention` para kernels rápidos de las capas de atención lineal.
- Latencia mediana de 67 ms por pregunta de texto en MI300X, frente a 51 ms del modelo completo: la cuantización ahorra memoria, no tiempo.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la etiqueta `endpoints_compatible` aparece en los tags, pero no hay instrucciones de despliegue en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Peso en disco | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| d3-ultra-INT4 | 26,09B | 17,6 GB | No disponible | Apache-2.0 | Cuantizado int4 W4A16; pierde 3,4 puntos en Box |
| d3-ultra | 26,09B | 52,2 GB | No disponible | Apache-2.0 | Modelo completo de referencia |
| d3-ultra-FP8 | No disponible | No disponible | No disponible | Apache-2.0 | Mantiene Box y es más rápido según la model card |
| d3-turbo-INT4 | No disponible | No disponible | No disponible | No disponible | Variante turbo; sus datos de calibración se reutilizan aquí |

No se dispone de comparación con modelos de decisión de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión en Box: 0,836 frente a 0,870 a IoU 0,5, concentrada en recibos (0,793) y capturas de pantalla (0,961). Para esas tareas se recomienda d3-ultra-FP8.
- Mayor latencia que el modelo completo: 67 ms frente a 51 ms por pregunta de texto.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo devuelve probabilidades sobre preguntas predefinidas.
- Longitud de contexto e idiomas soportados no documentados.
- Requiere código custom (`d3q`) y versiones concretas de transformers y compressed-tensors; no es plug-and-play con pipelines estándar.
- La calibración no incluyó peticiones de vídeo, por lo que el comportamiento en Track puede desviarse más de lo medido.
- Riesgo de sesgo y alucinación no evaluado en la información disponible; al ser un clasificador probabilístico, los errores se manifiestan como confianza mal calibrada.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3-ultra-INT4
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- Variante FP8: https://huggingface.co/vllm-sr/d3-ultra-FP8
- Variante turbo cuantizada: https://huggingface.co/vllm-sr/d3-turbo-INT4
- Dataset de calibración: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
