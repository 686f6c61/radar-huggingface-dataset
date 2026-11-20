# Valen-Team/Valen-Decision-1.5-4B-GGUF

## Resumen

Valen-Decision-1.5-4B es un modelo de decisión (decision-making) desarrollado por Valen-Team, derivado del modelo base Qwen/Qwen3.5-4B mediante fine-tuning supervisado. A diferencia de los LLM generativos convencionales, no produce texto libre: recibe un estado de conversación y un conjunto de preguntas tipadas (`choice`, `score`, `noul`, `bbox`) y devuelve, en una sola pasada de forward, las probabilidades de cada candidato o una caja delimitadora (bounding box) para tareas de grounding visual. Está diseñado para clasificación de mensajes de cliente, verificación de imágenes contra requisitos y detección de acciones en vídeo.

El modelo incorpora dos modificaciones arquitectónicas destacables sobre el transformer de Qwen3.5: atención bidireccional por bloques (block-bidirectional attention) y una cabeza de grounding para bbox. Se publica en cinco tamanos (0.8B, 2B, 4B, 9B y 27B) y en tres formatos: pesos nativos para Transformers, ONNX y GGUF. Esta ficha cubre la variante GGUF de 4B, con 4.213.777.709 parámetros totales y licencia Apache 2.0.

La relevancia actual del modelo radica en su enfoque de "salida estructurada tipada" frente a la generación de texto: en lugar de pedir al modelo que escriba una etiqueta y parsearla después, el runtime devuelve directamente distribuciones de probabilidad sobre las opciones definidas por el usuario. Esto reduce la latencia, elimina errores de parseo y facilita políticas de incertidumbre en producción. El repo GGUF ocupa 31,8 GB e incluye ficheros de texto en F32 y Q8_0 más un fichero de visión separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con block-bidirectional attention y cabeza de grounding bbox |
| Parametros totales | 4.213.777.709 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de servido usa `-c 4096`) |
| Tipos de cuantizacion | F32, Q8_0 (texto); vision en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (runtime propio Valen llama.cpp 0.2.0); tambien nativo Transformers y ONNX en repos separados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,2 mil millones de parámetros. Sobre esa base, Valen-Team introduce dos cambios: atención bidireccional por bloques, que permite que las representaciones de una consulta atiendan a todo el estado de entrada de forma controlada, y una cabeza de grounding que produce coordenadas de caja para preguntas de tipo `bbox`. El resultado es un modelo que evalúa la totalidad de la petición (estado más preguntas) en un único forward pass y emite probabilidades por candidato.

No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica explícitamente que los datos de entrenamiento de Valen-Decision-1.5 no son públicos. Se ofrece, en cambio, el código de entrenamiento en el repositorio de GitHub del proyecto para fine-tuning sobre datos propios. La innovación técnica principal es el esquema de preguntas tipadas (`choice`, `score`, `noul`, `bbox`) servido a través de los endpoints `/v1/systemone` y `/v1/decisions`, que devuelve números en lugar de texto generado.

## Capacidades

- Clasificación de mensajes con preguntas de tipo `choice`: devuelve probabilidad por cada etiqueta candidata definida por el usuario.
- Puntuación con preguntas de tipo `score`: asigna valores numéricos dentro de un rango definido.
- Preguntas de tipo `noul` (sin etiqueta): permiten modelar la abstención o ausencia de categoría aplicable.
- Grounding visual con preguntas de tipo `bbox`: devuelve una caja delimitadora sobre la imagen de entrada.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), con fichero de visión separado para peticiones de imagen y bbox.
- Salida estructurada tipada en una sola pasada, sin generación de texto libre ni parseo posterior.
- Soporte de estado compartido (`shared-state`): el estado de la conversación se evalúa conjuntamente con las preguntas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente como estado y una pregunta `choice` con las categorías del sistema de ticketing (facturación, técnico, cancelación, etc.), devolviendo la distribución de probabilidad por categoría; la política de incertidumbre puede enviar a revisión humana los casos con baja confianza.
- Moderación y triaje de mensajes entrantes: clasificación binaria o multiclase de contenido con umbrales de probabilidad configurables, aprovechando que la salida es numérica y directamente consumible por un pipeline.
- Verificación de imágenes de producto: con el fichero de visión, se comprueba si una imagen cumple requisitos (fondo blanco, producto centrado, ausencia de texto) mediante preguntas `choice` sobre la imagen.
- Detección de objetos o regiones en imagen: las preguntas `bbox` devuelven cajas delimitadoras para localizar elementos concretos, útil en inspección visual automatizada.
- Etiquetado de acciones en vídeo: análisis fotograma a fotograma o por segmentos para identificar acciones presentes, según el tutorial de video tagging del Cookbook oficial.
- Puntuación de calidad en pipelines de datos: preguntas `score` para asignar una valoración numérica a textos o imágenes antes de incorporarlos a un dataset de entrenamiento.
- Filtrado previo a un LLM generativo: usar Valen-Decision como clasificador barato (4B, cuantizado Q8_0 de 4,20 GiB) que decide si una consulta merece invocar un modelo mayor, reduciendo coste y latencia.

## Benchmarks y rendimiento

La model card menciona un "Decision Index" como métrica de evaluación, con mejor puntuación en los tamanos mayores, pero no se publican los valores numéricos en la información disponible. Tampoco se incluyen resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

Sí se documenta la fidelidad del runtime GGUF frente a los pesos nativos en FP32, medida como diferencia absoluta máxima de probabilidad (puerta de release: 0,08):

| Fichero | Probabilidad | Caja | Confianza de bbox |
|---|---:|---:|---:|
| F32 | 0,00068 | 0,0303 | 0,0261 |
| Q8_0 | 0,01868 | 0,0296 | 0,0254 |

El recuento de tokens fue idéntico en las seis peticiones comparadas (texto, imagen y cuatro bbox) ejecutadas en CPU Linux x86-64.

## Requisitos de hardware

- VRAM/RAM para texto con Q8_0: aproximadamente 4,20 GiB de pesos; el runtime de referencia es CPU, por lo que puede ejecutarse sin GPU.
- VRAM/RAM para texto con F32: aproximadamente 15,71 GiB.
- Fichero de visión: 1,24 GiB adicionales cuando se usan peticiones de imagen o bbox.
- El runtime oficial 0.2.0 es Linux x86-64 (Ubuntu 22.04+, glibc 2.35+, AVX2/FMA/F16C/BMI2) y funciona en CPU; el ejemplo de servido usa `-ngl 0` y `--device none`.
- Cabe en GPU de consumo con Q8_0 (por ejemplo, RTX 4090 de 24 GB) si se porta el runtime a aceleración GPU, aunque la información disponible solo documenta el servidor CPU.
- Opciones de despliegue: runtime Valen llama.cpp 0.2.0 (`./serve`), endpoints HTTP `/v1/systemone` y `/v1/decisions`; también API gratuita alojada y Space de playground para 0.8B, 2B y 4B.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación estructural con el modelo base y con otros tamanos de la misma familia es la siguiente:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Valen-Decision-1.5-4B | 4,21B | no disponible | Decision tipada + vision + bbox | Apache 2.0 |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | LLM generativo | no disponible en la informacion |
| Valen-Decision-1.5-0.8B | 0,8B | no disponible | Decision tipada | Apache 2.0 |
| Valen-Decision-1.5-27B | 27B | no disponible | Decision tipada | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para chat abierto ni para redactar respuestas; su salida son probabilidades y cajas.
- Requiere un runtime específico (Valen llama.cpp 0.2.0) para los ficheros GGUF; no es directamente compatible con llama.cpp, Ollama o vLLM estándar según la información disponible.
- Los datos de entrenamiento no son públicos, lo que impide auditar sesgos de composición del dataset.
- No se documentan sesgos conocidos ni comportamiento multilingüe; el soporte de idiomas figura como no disponible.
- Riesgo de alucinación estructuralmente distinto al de un LLM: el modelo no inventa texto, pero puede asignar alta probabilidad a una etiqueta incorrecta si las preguntas o criterios están mal definidos.
- La ventana de contexto no está documentada; el ejemplo de servido fija `-c 4096`, y la model card recomienda subir `-c`, `-b` y `-ub` conjuntamente para peticiones mayores.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las notas de licencia del Cookbook y del modelo base Qwen3.5.
- El runtime oficial documentado es solo Linux x86-64 en CPU; no hay soporte GPU documentado en la información proporcionada.
- El repo tiene 1.197 descargas y 1 like en el momento de la consulta, lo que indica adopción todavía limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B-GGUF
- Pesos nativos Transformers: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Version ONNX: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B-ONNX
- Version 0.8B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Version 2B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Version 9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Version 27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Repositorio de codigo y entrenamiento: https://github.com/Valen-Team/Valen
- Release del runtime GGUF 0.2.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.2.0
- API gratuita y demo web: https://valen-team.github.io/
- Playground Space: https://huggingface.co/spaces/Valen-Team/Valen-API
- Guia GGUF: https://valen-team.github.io/docs/valen/gguf/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Cookbook, API basica: https://valen-team.github.io/cookbook/api-quickstart/
- Cookbook, inferencia local: https://valen-team.github.io/cookbook/local-inference/
- Cookbook, enrutado de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Cookbook, cribado de imagenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Cookbook, etiquetado de video: https://valen-team.github.io/cookbook/video-tagging/
