# TensorVizion/Qwen3.8-Math-Eval

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal (texto e imagen/vídeo) desarrollado por el equipo de Qwen, publicado en el repositorio TensorVizion/Qwen3.8-Math-Eval bajo licencia Apache 2.0. Se trata de un modelo denso de 27 000 millones de parámetros que integra un codificador de visión, diseñado para tareas de razonamiento complejo, generación de código, trabajo profesional y ejecución de agentes autónomos de largo horizonte. Su arquitectura híbrida combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), lo que permite manejar contextos nativos de 262 144 tokens, extensibles hasta 1 000 000.

La relevancia de este modelo radica en su capacidad para procesar simultáneamente texto e imágenes o vídeos, con un modo de pensamiento flexible que puede activarse o desactivarse por petición, y un mecanismo de predicción multi-token (MTP) que mejora la eficiencia de generación. Está pensado para integrarse en entornos de producción mediante frameworks como Hugging Face Transformers, vLLM o SGLang, y su tamaño compacto (27B) lo hace viable en GPUs de gama alta para consumo profesional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de visión (híbrido: Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se esperan versiones GGUF/AWQ de la comunidad) |
| Idiomas soportados | No disponible (la model card no especifica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 64 capas con dimensión oculta de 5120. Su estructura interna sigue un patrón repetido de 16 bloques, donde cada bloque contiene 3 subcapas de Gated DeltaNet (atención lineal) seguidas de una capa de FFN, y después una subcapa de Gated Attention (atención completa) con otra FFN. La atención lineal utiliza 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención completa emplea 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 17 408. El modelo incorpora predicción multi-token (MTP) entrenada con múltiples pasos, lo que acelera la inferencia.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque la model card no detalla el número de tokens ni la composición del dataset. Se menciona que el modelo hereda la base arquitectónica de Qwen3.5 y que ha sido optimizado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes. No se especifica si se utilizaron técnicas de RLHF o DPO, pero el modo de pensamiento controlable sugiere un alineamiento específico para razonamiento.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento activable por petición y ajuste del esfuerzo de razonamiento (`reasoning_effort`).
- Comprensión de imágenes y vídeos de forma nativa, incluyendo diagramas STEM, documentos escaneados y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de largo horizonte: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Generación de código y soporte de herramientas (tool calling), con integración en entornos de desarrollo y pipelines de CI/CD.
- Capacidad de retener contexto de razonamiento histórico mediante `preserve_thinking`, útil en conversaciones multi-turno.
- Compatibilidad con frameworks de inferencia estándar (Transformers, vLLM, SGLang, TokenSpeed) y con la API gestionada de Qwen Cloud.

## Casos de uso

- Análisis de documentos técnicos con figuras y diagramas: el modelo puede interpretar imágenes de esquemas, gráficos y fórmulas junto con texto, facilitando la extracción de información en informes de ingeniería o papers científicos.
- Asistente de programación con razonamiento: gracias a su modo de pensamiento y soporte de tool calling, puede generar código, explicar algoritmos y depurar errores en repositorios, integrándose en IDEs o asistentes de línea de comandos.
- Agente autónomo para automatización de tareas: su capacidad de planificación multi-paso y manejo de feedback lo hace adecuado para orquestar flujos de trabajo complejos, como gestión de incidencias o procesamiento de datos.
- Transcripción y análisis de vídeos de formación: al aceptar vídeo como entrada, puede resumir contenido audiovisual, extraer conclusiones o generar subtítulos descriptivos en entornos educativos o corporativos.
- Soporte técnico con contexto largo: con 262K tokens de contexto nativo, puede mantener conversaciones extensas con historial completo de interacción, útil en chatbots de atención al cliente con documentación adjunta.
- Investigación y redacción académica: el modelo puede ayudar a estructurar artículos, revisar literatura y generar resúmenes de resultados experimentales, combinando texto e imágenes de tablas o gráficos.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos, pero el texto proporcionado está incompleto y solo se observa la sección de "Coding" con el benchmark "Terminal Bench 2.1 (Terminus)" para "Agentic terminal coding". No se han proporcionado los valores numéricos de este ni de otros benchmarks (MMLU, HumanEval, GSM8K, etc.). Por tanto, no es posible presentar una tabla de resultados verificables. Se recomienda consultar la model card completa en Hugging Face para obtener los datos actualizados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27B parámetros en FP16 se requieren aproximadamente 54 GB de VRAM; en INT8 (~27 GB) o INT4 (~14 GB) si se dispone de cuantizaciones de la comunidad.
- GPUs recomendadas: para FP16, una NVIDIA A100 80GB o H100; para cuantización INT4, una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) pueden ser suficientes.
- En consumer GPU: es viable con cuantización INT4 en GPUs de 24 GB, aunque el contexto largo (262K) aumentará el consumo de memoria.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers, y la API gestionada de Qwen Cloud (próximamente).
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

La model card menciona comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se proporcionan especificaciones detalladas de estos modelos ni los resultados numéricos de los benchmarks. Por tanto, no es posible elaborar una comparativa cuantitativa fiable. Se puede afirmar que Qwen3.8-27B es un modelo denso de 27B con capacidades multimodales, mientras que alternativas como Qwen3.6-27B (también de la serie Qwen) o modelos de tamaño similar de otras familias (p. ej., Llama 3.1 70B) difieren en arquitectura y licencia. Se recomienda consultar la documentación oficial de Qwen para una comparativa actualizada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo; al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en dichos datos.
- Riesgo de alucinación en tareas de razonamiento o generación de código, especialmente cuando el contexto es ambiguo o la información es escasa.
- El contexto nativo de 262K tokens puede degradar el rendimiento si se utiliza al máximo sin cuantización adecuada; la extensión a 1M requiere infraestructura específica.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la serie Qwen para posibles restricciones adicionales en versiones futuras.
- No se especifican los idiomas soportados; aunque el modelo probablemente maneja múltiples idiomas, no hay garantía de calidad uniforme en todos ellos.
- Para producción, es necesario validar el comportamiento del modo de pensamiento y el uso de `preserve_thinking`, ya que puede aumentar la latencia y el consumo de tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TensorVizion/Qwen3.8-Math-Eval
- Repositorio GitHub oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de OpenLM.ai sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Repositorio GitHub de Qwen3 (serie anterior): https://github.com/QwenLM/Qwen3
- API gestionada de Qwen Cloud (próximamente): https://www.qwencloud.com/models/qwen3.8-27b
