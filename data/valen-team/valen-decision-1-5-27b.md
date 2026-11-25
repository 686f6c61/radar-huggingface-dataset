# Valen-Team/Valen-Decision-1.5-27B

## Resumen

Valen-Decision-1.5-27B es un modelo de decisión multimodal desarrollado por Valen-Team, afinado a partir de Qwen/Qwen3.8-27B. No es un modelo generativo de texto al uso: su función es responder a preguntas estructuradas sobre una entrada (texto, imagen o vídeo) devolviendo, en una sola pasada forward, probabilidades para predicados, elecciones y puntuaciones, además de cajas delimitadoras (bounding boxes) para las preguntas de tipo grounding. Está pensado para tareas de clasificación, enrutamiento y verificación automatizada.

Con 26.099.270.173 parámetros reales (según safetensors) y un repositorio de 52,2 GB, se distribuye bajo licencia Apache 2.0 con pesos en safetensors (backbone en BF16, cabezas de decisión y grounding en FP32). El modelo forma parte de una familia de cinco tamaños (0.8B, 2B, 4B, 9B y 27B), cada uno publicado en formato nativo, ONNX y GGUF.

Su relevancia actual radica en que sustituye pipelines de clasificación ad hoc por un único modelo que emite salidas tipadas y estructuradas (probabilidad, elección, score, bbox) con protocolos de API definidos (SystemOne y Decisions), lo que facilita integrarlo en sistemas de producción que necesitan decisiones auditables en lugar de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención bidireccional por bloques (block-bidirectional attention) y cabeza de grounding bbox; basado en Qwen3.8-27B |
| Parametros totales | 26.099.270.173 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos nativos BF16/FP32, ONNX y GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo), ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo parte del backbone de Qwen3.8-27B y le añade dos elementos propios: atención bidireccional por bloques y una cabeza de grounding para cajas delimitadoras. La atención bidireccional por bloques permite que las representaciones de la entrada se condicionen mutuamente dentro de bloques, algo adecuado para tareas de clasificación y verificación donde la decisión depende del conjunto de la entrada y no de una generación autoregresiva. La cabeza de grounding devuelve una caja por cada pregunta de tipo bbox.

La inferencia se realiza en una única pasada forward que produce simultáneamente probabilidades para preguntas de predicado, elección y puntuación, y cajas para preguntas de grounding. Los pesos nativos almacenan el backbone en BF16 y las cabezas de decisión y grounding en FP32. El modelo requiere `trust_remote_code=True` y código personalizado (`custom_code`) para cargarse con Transformers.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica explícitamente que los datos de entrenamiento de Valen-Decision-1.5 no son públicos. El código de entrenamiento sí está publicado en el repositorio de GitHub de Valen-Team, lo que permite afinar el modelo con datos propios.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de tipo predicado (probabilidad de que algo sea cierto), elección (selección entre opciones) y puntuación (score numérico).
- Grounding visual: devuelve cajas delimitadoras para preguntas de tipo bbox sobre imágenes.
- Procesamiento de imagen y vídeo: entrada image-text-to-text, con soporte de vídeo para identificación de acciones.
- Salida tipada: una sola pasada forward produce probabilidades, elecciones, scores y cajas, sin generación de texto libre.
- Protocolos de API: compatible con los formatos SystemOne (Jev) y Decisions (OpenAI).
- Verificación de requisitos sobre imágenes: comprobación de si una imagen cumple condiciones definidas por el usuario.
- Clasificación de mensajes de cliente: enrutamiento de tickets y categorización de texto.
- No se documentan capacidades de tool calling, agentes multi-paso ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente y una batería de preguntas de tipo elección (categoría, urgencia, departamento) y devuelve la opción más probable por pregunta en una sola pasada, lo que reduce la latencia frente a pipelines con varios clasificadores.
- Moderación y verificación de imágenes de producto: se define un conjunto de predicados (por ejemplo, "el producto aparece centrado", "el fondo es blanco") y el modelo devuelve la probabilidad de cada uno, permitiendo descartar automáticamente imágenes que no cumplen los requisitos.
- Etiquetado de acciones en vídeo: con preguntas de tipo predicado y bbox, el modelo identifica acciones y localiza objetos en fotogramas, útil para indexación de catálogos audiovisuales.
- Grounding en documentos escaneados: las preguntas de tipo bbox permiten localizar regiones concretas (sellos, firmas, campos) dentro de una imagen, integrable en flujos de digitalización.
- Control de calidad en comercio electrónico: verificación automática de que las fichas de producto cumplen políticas (presencia de elementos obligatorios, coherencia entre texto e imagen) mediante predicados y scores.
- Filtrado previo en pipelines de anotación humana: el modelo puntúa cada ítem y solo los casos con score bajo o probabilidad cercana al umbral se envían a revisión manual, reduciendo el coste de anotación.
- Clasificación de contenido en redes sociales: elección entre categorías predefinidas y scores de confianza para priorizar la revisión de contenido dudoso.

## Benchmarks y rendimiento

La model card menciona un "Decision Index" como métrica de evaluación y afirma que los tamaños mayores obtienen puntuaciones más altas, pero no se proporcionan valores numéricos en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26.099 millones de parámetros, en BF16 se requieren aproximadamente 52 GB solo para los pesos, más memoria para activaciones y las cabezas en FP32; en cuantizaciones GGUF de 8 bits se reduciría a unos 26 GB y en 4 bits a unos 13-15 GB, aunque no se detallan las cuantizaciones disponibles.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16; una RTX 4090 (24 GB) no es suficiente para BF16 y requeriría cuantización.
- Cabe en GPU de consumo: solo con cuantización agresiva (GGUF de 4 bits) en GPUs de 24 GB como la RTX 4090 o la RTX 3090.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"`; ONNX; GGUF mediante el runtime Valen llama.cpp 0.2.0. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Decision-1.5-27B | 26,1B | no disponible | Probabilidades, elecciones, scores, bbox | Apache 2.0 | Pesos nativos, ONNX, GGUF |
| Valen-Decision-1.5-9B | no disponible | no disponible | Ídem | Apache 2.0 | Pesos nativos, ONNX, GGUF |
| Valen-Decision-1.5-4B | no disponible | no disponible | Ídem | Apache 2.0 | Pesos nativos, ONNX, GGUF, API gratuita |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | Texto generativo | no disponible | Pesos en Hugging Face |

La comparación con modelos de clasificación genéricos no está disponible en la información proporcionada. La familia Valen-Decision-1.5 se ofrece en cinco tamaños con el mismo formato de salida, lo que permite escalar según los requisitos de latencia y precisión.

## Limitaciones y advertencias

- No es un modelo generativo de texto: no produce respuestas en lenguaje natural, sino salidas estructuradas limitadas a los tipos de pregunta soportados.
- Los datos de entrenamiento no son públicos, lo que impide auditar la composición del dataset y evaluar sesgos de forma independiente.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.8-27B puede heredar los sesgos del modelo base.
- Riesgo de alucinación: al emitir probabilidades, puede asignar confianza alta a predicados incorrectos; se recomienda calibrar umbrales con datos propios.
- No se especifican los idiomas soportados, por lo que el rendimiento fuera del inglés (o de los idiomas del modelo base) es incierto.
- La longitud de contexto no está documentada, lo que dificulta planificar entradas largas.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código antes de desplegarlo en producción.
- El modelo de 27B no está disponible en la API gratuita (solo 0.8B, 2B y 4B).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Versión ONNX: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B-ONNX
- Versión GGUF: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B-GGUF
- Versión 0.8B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Versión 2B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Versión 4B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Versión 9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Repositorio de código y entrenamiento: https://github.com/Valen-Team/Valen
- Demo web y API gratuita: https://valen-team.github.io/
- Space de playground: https://huggingface.co/spaces/Valen-Team/Valen-API
- Cookbook: https://valen-team.github.io/cookbook/
- Documentación de Transformers: https://valen-team.github.io/docs/valen/quickstart/
- Documentación de API: https://valen-team.github.io/docs/valen/api/
- Demo en vídeo: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
