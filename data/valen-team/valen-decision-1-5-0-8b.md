# Valen-Team/Valen-Decision-1.5-0.8B

## Resumen

Valen-Decision-1.5-0.8B es un modelo de decisión multimodal desarrollado por Valen-Team, afinado a partir de Qwen/Qwen3.5-0.8B. No es un modelo generativo al uso: en lugar de producir texto libre, recibe un estado (texto, imagen o vídeo) junto con un conjunto de preguntas tipadas y devuelve, en una sola pasada forward, probabilidades para preguntas de tipo *predicate*, *choice* y *score*, además de coordenadas de caja (*bbox*) para preguntas de localización.

El modelo está pensado para tareas de clasificación y enrutamiento: catalogar mensajes de clientes, verificar si una imagen cumple requisitos, identificar acciones en vídeo o emitir salidas estructuradas tipadas. Su tamaño reducido (857.464.173 parámetros reales según safetensors, ~0.8B) lo hace desplegable en hardware modesto, y la familia se publica en cinco tamaños (0.8B, 2B, 4B, 9B y 27B) con pesos nativos, ONNX y GGUF.

La relevancia actual del modelo radica en su enfoque de "salida estructurada tipada" en una única pasada, con atención bidireccional por bloques y una cabeza de grounding de bounding boxes integrada, además de una licencia Apache 2.0 que permite uso comercial. El modelo base Qwen3.5-0.8B y el código de entrenamiento están publicados, aunque los datos de entrenamiento de Valen-Decision-1.5 no son públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B con atención bidireccional por bloques (*block-bidirectional attention*) y cabezas de decisión y grounding (bbox); requiere `trust_remote_code` |
| Parametros totales | 857.464.173 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos nativos en BF16 (backbone) y FP32 (cabezas de decisión y grounding); variante GGUF publicada por separado (Valen-Decision-1.5-0.8B-GGUF) para el runtime Valen llama.cpp 0.2.0; no se detallan los niveles de cuantización concretos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo Transformers), ONNX y GGUF (repositorios separados) |

## Arquitectura y entrenamiento

El modelo parte del backbone de Qwen3.5-0.8B y le añade dos modificaciones estructurales descritas en la model card: atención bidireccional por bloques (*block-bidirectional attention*) y una cabeza de grounding de bounding boxes. La salida no es texto generado token a token, sino un conjunto de respuestas tipadas calculadas en una única pasada forward: probabilidades para preguntas *predicate*, *choice* y *score*, y una caja delimitadora para cada pregunta *bbox*. Esto lo convierte en un modelo de extracción/clasificación estructurada más que en un modelo conversacional generativo, pese a que la model card lo etiqueta como *conversational*.

Los pesos nativos almacenan el backbone en BF16 y las cabezas de decisión y grounding en FP32. El modelo soporta dos formatos de API de decisión: *SystemOne* (usado por Jev) y *Decisions* (usado por OpenAI), ambos compatibles con el mismo modelo. Los datos de entrenamiento de Valen-Decision-1.5 no son públicos, y la model card no especifica el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Sí se publica el código de entrenamiento en el repositorio de GitHub de Valen-Team, lo que permite afinar el modelo con datos propios.

## Capacidades

- Clasificación de mensajes y texto mediante preguntas de tipo *predicate* (presencia/ausencia de una condición) con salida de probabilidad.
- Selección entre opciones mediante preguntas de tipo *choice*.
- Puntuación numérica mediante preguntas de tipo *score*.
- Localización visual: devuelve una caja delimitadora (*bbox*) por cada pregunta de grounding en imágenes.
- Procesamiento de vídeo para identificar acciones (según los tutoriales de *video tagging* del Cookbook).
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Salida estructurada tipada (*image-text-to-typed-output*) en una sola pasada forward.
- Soporte de estado compartido (*shared-state*) entre preguntas.
- Dos formatos de API de decisión: SystemOne (Jev) y Decisions (OpenAI).
- No se documenta soporte explícito de *tool calling* genérico ni de razonamiento multi-paso en el sentido de agentes autónomos; la "decisión" es la unidad de salida.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: se envían el texto del ticket y un conjunto de preguntas *choice* (por ejemplo, categoría del problema) y *predicate* (por ejemplo, "el cliente pide reembolso"), y el modelo devuelve probabilidades que se usan para asignar el ticket al equipo adecuado. El Cookbook incluye un tutorial específico de *ticket routing*.
- Moderación y cribado de imágenes de producto: con preguntas *predicate* ("la imagen muestra el producto completo") y *bbox* ("localiza el producto"), el modelo permite validar automáticamente imágenes de catálogo antes de publicarlas.
- Etiquetado de vídeo: identificación de acciones presentes en fragmentos de vídeo mediante preguntas *predicate* y *score*, útil para indexación y búsqueda de contenido.
- Clasificación de correos o mensajes entrantes: preguntas *choice* para categorizar (consulta, queja, solicitud) y *score* para priorizar por urgencia, con salida estructurada lista para un pipeline.
- Verificación de requisitos documentales: comprobar con preguntas *predicate* si una imagen o texto cumple condiciones concretas (por ejemplo, presencia de sello, firma o campo obligatorio) antes de aceptar un formulario.
- Extracción de localizaciones en imágenes: la cabeza de *bbox* permite obtener coordenadas de regiones de interés para pipelines de recorte, OCR selectivo o anotación asistida.
- Despliegue en el borde o en hardware modesto: con ~0.8B parámetros y variante GGUF, puede ejecutarse en entornos sin GPU dedicada para clasificación de bajo coste.

## Benchmarks y rendimiento

La model card menciona un "Decision Index" como métrica de evaluación y afirma que los tamaños mayores obtienen puntuaciones más altas, pero no se publican los valores numéricos en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 857.464.173 parámetros, los pesos en BF16 ocupan aproximadamente 1,7 GB; las cabezas en FP32 añaden una fracción adicional. En la práctica, se necesita algo más de 2 GB de VRAM para inferencia en BF16, más el espacio para activaciones y entradas multimodales.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para BF16; el ejemplo oficial usa CUDA con `attn_implementation="sdpa"` y `torch.set_float32_matmul_precision("highest")`.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas o CPU mediante la variante GGUF con el runtime Valen llama.cpp 0.2.0.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (ruta oficial), ONNX Runtime (repositorio ONNX), llama.cpp en su variante Valen (repositorio GGUF) y la API HTTP gratuita de Valen-Team. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| Valen-Decision-1.5-0.8B | 857.464.173 | no disponible | Decisión multimodal estructurada (predicate/choice/score/bbox) | Apache 2.0 | safetensors, ONNX, GGUF |
| Valen-Decision-1.5-2B | no disponible | no disponible | Igual, mayor tamaño | Apache 2.0 | safetensors, ONNX, GGUF |
| Valen-Decision-1.5-4B | no disponible | no disponible | Igual, mayor tamaño | Apache 2.0 | safetensors, ONNX, GGUF |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible | no disponible | Generación de texto multimodal | no disponible | no disponible |

Las alternativas de otros fabricantes con el mismo enfoque de decisión estructurada no están disponibles en la información proporcionada. La comparación más directa es con los otros tamaños de la propia familia Valen-Decision-1.5 (2B, 4B, 9B y 27B), que según la model card obtienen puntuaciones más altas en el Decision Index a costa de más memoria y cómputo.

## Limitaciones y advertencias

- Los datos de entrenamiento no son públicos, lo que dificulta evaluar sesgos y cobertura de dominios.
- El modelo no es generativo: no produce texto libre ni conversación abierta pese a la etiqueta `conversational`; su salida son probabilidades, opciones, puntuaciones y cajas. Usarlo como chatbot daría resultados inadecuados.
- Riesgo de alucinación en el sentido de probabilidades mal calibradas fuera de la distribución de entrenamiento; no se documentan estudios de calibración.
- Longitud de contexto e idiomas soportados no disponibles; no se puede garantizar un rendimiento multilingüe ni entradas largas.
- Requiere `trust_remote_code=True` y código personalizado (`valen_qwen`), lo que implica revisar el código remoto antes de ejecutarlo en producción.
- La variante GGUF depende de un runtime propio (Valen llama.cpp 0.2.0), no del llama.cpp estándar; la compatibilidad con otras herramientas no está garantizada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las notas de licencia de medios y procedencia que el Cookbook menciona para los flujos con imágenes y vídeo.
- El modelo se publicó en noviembre de 2026 según los metadatos de Hugging Face; el ecosistema y las versiones de dependencias (torch, transformers) deben fijarse para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Variante 2B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Variante 4B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Variante 9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Variante 27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Variante ONNX: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B-ONNX
- Variante GGUF: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B-GGUF
- Repositorio de código y entrenamiento: https://github.com/Valen-Team/Valen
- Cookbook: https://valen-team.github.io/cookbook/
- Documentación de la API: https://valen-team.github.io/docs/valen/api/
- Guía de inicio rápido: https://valen-team.github.io/docs/valen/quickstart/
- Demo web y API gratuita: https://valen-team.github.io/
- Space de playground: https://huggingface.co/spaces/Valen-Team/Valen-API
- Tutorial de enrutamiento de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de cribado de imágenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de vídeo: https://valen-team.github.io/cookbook/video-tagging/
- Demo en vídeo: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
