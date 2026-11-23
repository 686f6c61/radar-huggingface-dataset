# Valen-Team/Valen-Decision-1.5-9B

## Resumen

Valen-Decision-1.5-9B es un modelo de decisión multimodal desarrollado por Valen-Team, derivado por fine-tuning del modelo base Qwen/Qwen3.5-9B. Su propósito no es la generación de texto libre, sino la clasificación y extracción estructurada de decisiones: dado un input multimodal (texto, imagen o vídeo), devuelve probabilidades para preguntas de tipo predicate, choice y score, además de cajas delimitadoras (bbox) para preguntas de grounding. Está pensado para tareas operativas como clasificar mensajes de clientes, verificar si una imagen cumple requisitos o identificar acciones en vídeos.

El modelo forma parte de una familia con cinco tamaños (0.8B, 2B, 4B, 9B y 27B), cada uno publicado en tres formatos: pesos nativos para Transformers, ONNX y GGUF para el runtime Valen llama.cpp 0.2.0. La versión 9B aquí descrita cuenta con aproximadamente 8.400 millones de parámetros en safetensors, un repositorio de 16,9 GB y licencia Apache 2.0.

La relevancia actual del modelo radica en su enfoque de "decisión en un solo forward pass": en lugar de encadenar generación autoregresiva con post-procesado, devuelve directamente salidas tipadas y probabilísticas, lo que simplifica la integración en pipelines de producción que requieren resultados estructurados y umbrales de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con atención bidireccional por bloques (block-bidirectional attention) y cabezas de decisión y grounding |
| Parametros totales | 8.404.269.597 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (runtime Valen llama.cpp 0.2.0); pesos nativos en BF16 para el backbone y FP32 para las cabezas de decisión y grounding |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo), ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-9B mediante fine-tuning supervisado, con la incorporación de dos modificaciones arquitectónicas destacadas: atención bidireccional por bloques (block-bidirectional attention) y una cabeza de grounding de bounding boxes. Una única pasada forward devuelve probabilidades para preguntas de tipo predicate, choice y score, y una caja delimitadora por cada pregunta de tipo bbox. Los pesos nativos almacenan el backbone en BF16 y las cabezas de decisión y grounding en FP32.

El modelo soporta dos formatos de API de decisión: SystemOne (usado por Jev) y Decisions (usado por OpenAI), ambos compatibles con el mismo modelo. El código de entrenamiento está publicado en el repositorio de GitHub de Valen-Team, si bien los datos de entrenamiento de Valen-Decision-1.5 no son públicos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación de mensajes y textos mediante preguntas de tipo predicate, devolviendo probabilidades calibradas.
- Selección entre opciones (preguntas de tipo choice) con probabilidades asociadas a cada alternativa.
- Puntuación (preguntas de tipo score) para evaluar grados o niveles de cumplimiento.
- Grounding visual: devuelve cajas delimitadoras (bbox) para localizar elementos en imágenes en la misma pasada forward.
- Procesamiento de imágenes y vídeos además de texto (pipeline image-text-to-text).
- Salidas tipadas y estructuradas, aptas para integración directa en sistemas de decisión automatizados.
- Compatibilidad con dos formatos de API de decisión (SystemOne y Decisions).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni capacidades de audio.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar mensajes de clientes por categoría mediante preguntas predicate y derivarlos al equipo adecuado según la probabilidad superada de un umbral configurable.
- Moderación de contenido textual: evaluar si un mensaje cumple las políticas de la comunidad usando preguntas de tipo predicate con umbrales de confianza.
- Verificación de imágenes de producto: comprobar si una foto cumple requisitos (fondo, encuadre, presencia de elementos) mediante preguntas predicate y grounding bbox en una sola pasada.
- Etiquetado de vídeos: identificar acciones y objetos en secuencias de vídeo para generar metadatos estructurados en pipelines de catalogación.
- Triaje de solicitudes con múltiples opciones: usar preguntas de tipo choice para asignar prioridad, categoría o departamento con probabilidades por alternativa.
- Puntuación de calidad o cumplimiento: emplear preguntas de tipo score para graduar la adecuación de un contenido a criterios definidos, útil en QA automatizado.
- Integración en pipelines de decisión existentes: al soportar los formatos SystemOne y Decisions, puede sustituir llamadas a APIs de decisión de terceros manteniendo el mismo protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La model card menciona un "Decision Index" como métrica de evaluación interna, indicando que los tamaños mayores obtienen puntuaciones superiores, pero no se proporcionan cifras concretas ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- El repositorio pesa 16,9 GB; los pesos nativos en BF16 requieren en torno a 17 GB de VRAM solo para los pesos, más overhead de activaciones y contexto.
- El modelo se carga en GPU NVIDIA con `attn_implementation="sdpa"`; la model card indica ejecución local en GPU NVIDIA.
- Cabe en GPUs consumer de gama alta con 24 GB de VRAM (por ejemplo, RTX 4090) en BF16, con margen limitado para contexto y activaciones; en FP16/BF16 con contexto largo puede requerir GPUs de 40-80 GB (A100 40GB, A100 80GB, H100).
- Existe una versión GGUF para el runtime Valen llama.cpp 0.2.0, que permite cuantización y despliegue en hardware más modesto, aunque no se detallan los niveles de cuantización disponibles ni los requisitos exactos.
- Existe una versión ONNX para despliegue con ONNX Runtime.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, ONNX Runtime y Valen llama.cpp 0.2.0 (GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Decision-1.5-9B | 8.404.269.597 | no disponible | Decisión multimodal con salidas tipadas y grounding bbox | Apache 2.0 | Pesos nativos, ONNX y GGUF en Hugging Face |
| Valen-Decision-1.5-4B | no disponible | no disponible | Igual, menor tamaño | Apache 2.0 | Pesos nativos, ONNX y GGUF; servido en API gratuita |
| Valen-Decision-1.5-27B | no disponible | no disponible | Igual, mayor tamaño y mayor Decision Index | Apache 2.0 | Pesos nativos, ONNX y GGUF |
| Qwen/Qwen3.5-9B (modelo base) | no disponible | no disponible | Generación de texto generalista | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La familia Valen-Decision-1.5 se diferencia de modelos generativos generalistas por su salida estructurada y probabilística en un solo forward pass, frente a la generación autoregresiva con post-procesado.

## Limitaciones y advertencias

- Los datos de entrenamiento no son públicos, lo que impide auditar sesgos o composición del dataset.
- No se documentan los idiomas soportados; no hay garantía de rendimiento multilingüe.
- No se especifica la longitud de contexto máxima, lo que limita la planificación para entradas largas.
- Al ser un modelo de clasificación probabilística, los umbrales de decisión deben calibrarse por caso de uso; las probabilidades no equivalen a certeza.
- El modelo está diseñado para decisión estructurada, no para generación de texto libre; usarlo fuera de ese propósito puede producir resultados no fiables.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado en cuanto a sus términos.
- El uso de `trust_remote_code=True` implica ejecutar código personalizado del autor; conviene revisarlo antes de desplegar en producción.
- No se documentan resultados de benchmarks externos, por lo que la evaluación de calidad debe realizarse con datos propios.
- El tamaño 9B no está disponible en la API gratuita, que solo sirve 0.8B, 2B y 4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Versión ONNX: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B-ONNX
- Versión GGUF: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B-GGUF
- Versión 0.8B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Versión 2B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Versión 4B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Versión 27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Repositorio de código y entrenamiento: https://github.com/Valen-Team/Valen
- Demo web y API gratuita: https://valen-team.github.io/
- Space de playground: https://huggingface.co/spaces/Valen-Team/Valen-API
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Documentación de Transformers: https://valen-team.github.io/docs/valen/quickstart/
- Documentación de API: https://valen-team.github.io/docs/valen/api/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
