# vrfai/Qwen3.8-27B-NVFP4

## Resumen

El modelo `vrfai/Qwen3.8-27B-NVFP4` es una versión cuantizada del modelo multimodal Qwen3.8-27B, desarrollado por el usuario vrfai. Se trata de un modelo denso de 27 mil millones de parámetros con arquitectura híbrida que combina atención tradicional y capas Gated DeltaNet, diseñado para tareas de visión-lenguaje (image-text-to-text). La cuantización NVFP4 (W4A4) reduce el peso de 52 GB a 18,4 GB, manteniendo el 93,28% de las capas lineales en precisión de 4 bits, con el objetivo de facilitar el despliegue en entornos con memoria limitada.

La relevancia de este modelo radica en que ofrece una alternativa eficiente en memoria para ejecutar un modelo de 27B en GPUs con menos VRAM, aunque con un requisito de hardware específico: la aritmética NVFP4 nativa solo está disponible en GPUs NVIDIA Blackwell (compute capability 10.0+). En hardware anterior (H100, Ada), vLLM carga los pesos mediante el camino Marlin weight-only FP4, que conserva el ahorro de memoria pero reduce el rendimiento en tareas compute-bound. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para su uso con vLLM 0.27.1 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (transformer híbrido con Gated DeltaNet y atención, con torre de visión) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base puede soportar hasta 1M en el servicio hosted, pero no se especifica para los pesos abiertos) |
| Tipos de cuantizacion | NVFP4 (W4A4), group size 16, SmoothQuant alpha 0.8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (serializado como compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje multimodal con una arquitectura híbrida que combina capas de atención tradicional con capas Gated DeltaNet, una variante de recurrencia lineal que permite un manejo eficiente de secuencias largas. Incluye una torre de visión de aproximadamente 456 millones de parámetros que procesa imágenes y vídeos. La versión cuantizada mantiene intacta la torre de visión y las capas de normalización, embeddings y `lm_head` en bf16, mientras que cuantiza las proyecciones de atención, MLP y las proyecciones de entrada/salida de Gated DeltaNet a NVFP4.

La cuantización se realizó con `llmcompressor` 0.13.0, utilizando el esquema NVFP4 con pesos y activaciones en formato de punto flotante de 4 bits de NVIDIA, con escalas de bloque FP8 y una escala global FP32. Se aplicó SmoothQuant con alpha 0.8 y se calibró con 512 muestras del dataset `abisee/cnn_dailymail` a 2048 tokens. No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO), por lo que esa información no está disponible.

## Capacidades

- Comprensión de imágenes y vídeos: el modelo es nativamente multimodal y puede procesar entradas visuales junto con texto.
- Razonamiento con control de pensamiento: soporta un modo de "thinking" configurable mediante `reasoning_effort`, permitiendo ajustar el nivel de razonamiento antes de responder.
- Ejecución de agentes: diseñado para tareas agénticas de largo horizonte, con planificación autónoma y manejo de retroalimentación del entorno.
- Generación de código y tareas profesionales: el modelo base declara mejoras sustanciales en coding, trabajo profesional e investigación.
- Capacidades multilingües: no especificadas en la información disponible.
- Tool calling y function calling: no se menciona explícitamente en la documentación proporcionada, aunque es una característica común en la familia Qwen; no confirmado para este checkpoint.

## Casos de uso

- Análisis de imágenes técnicas: el modelo puede procesar capturas de pantalla, diagramas o fotografías para extraer información textual o responder preguntas sobre ellas, gracias a su torre de visión y su capacidad de razonamiento.
- Automatización de agentes de soporte: con su capacidad de planificación multi-paso y manejo de contexto largo, puede gestionar conversaciones complejas con múltiples turnos y acciones.
- Generación de código asistida por contexto visual: al recibir una imagen de un error de interfaz o un diagrama de arquitectura, puede generar o corregir código relacionado.
- Investigación y análisis de documentos: puede resumir artículos científicos, extraer conclusiones y razonar sobre tablas o figuras incluidas en los documentos.
- Despliegue en entornos con memoria limitada: gracias a la cuantización NVFP4, el modelo cabe en GPUs con 24 GB de VRAM, permitiendo su uso en estaciones de trabajo con hardware más modesto.
- Prototipado de aplicaciones multimodales: integrable en pipelines de vLLM para servir endpoints de chat con entrada de imágenes y texto, con control del nivel de razonamiento.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados medidos sobre los pesos cuantizados, con decoding greedy y thinking habilitado, en una NVIDIA H100 80GB con vLLM 0.27.1:

| Tarea | Resultado |
|---|---|
| ERQA | 0,5650 |
| RealWorldQA | 0,8222 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los benchmarks del modelo base bf16 no son aplicables a esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada: el tamaño de los pesos cuantizados es de 18,4 GB, por lo que se necesita al menos 24 GB de VRAM para la inferencia con overhead de activaciones y KV cache.
- GPUs recomendadas: NVIDIA Blackwell (B100, B200, GB200) para ejecutar NVFP4 de forma nativa y obtener el máximo rendimiento. En H100/H200 (SM90) y Ada (SM89) funciona mediante el camino Marlin weight-only FP4, con menor velocidad en prefill y lotes grandes.
- No cabe en GPUs de consumo de gama baja (8-12 GB); requiere al menos una RTX 4090 (24 GB) o similar.
- Opciones de despliegue: vLLM 0.27.1 o superior (recomendado), también compatible con Hugging Face Transformers, SGLang y TokenSpeed según la model card del base.
- Latencia y throughput: no se proporcionan datos específicos. Se espera un rendimiento inferior al modelo bf16 en hardware no Blackwell para cargas compute-bound.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (tamaño y tarea). La única referencia directa es el modelo base Qwen3.8-27B en bf16, que ocupa 52 GB y ofrece mayor precisión, pero requiere más memoria. No se han encontrado datos sobre alternativas cuantizadas equivalentes.

## Limitaciones y advertencias

- Requisito de hardware específico: la aritmética NVFP4 nativa solo está disponible en GPUs NVIDIA Blackwell (compute capability 10.0+). En hardware anterior, el rendimiento en tareas compute-bound (prefill, lotes grandes) es menor que el del modelo bf16.
- Los benchmarks del modelo base no son aplicables: las tablas de rendimiento del modelo original fueron medidas sobre pesos bf16 y no reflejan el comportamiento de esta versión cuantizada.
- La cuantización puede introducir degradación de precisión en tareas sensibles, especialmente en razonamiento complejo y generación de código, aunque no se han cuantificado estos efectos más allá de los benchmarks reportados.
- No se han documentado sesgos específicos ni riesgos de alucinación para este checkpoint; se heredan las características del modelo base, que no han sido evaluadas en esta documentación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original para posibles restricciones adicionales.
- Para producción, es necesario validar el rendimiento en el hardware objetivo, ya que el camino Marlin weight-only puede no cumplir requisitos de latencia estrictos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vrfai/Qwen3.8-27B-NVFP4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Servicio Qwen Cloud (mención en la model card): https://www.qwencloud.com/models/qwen3.8-27b
