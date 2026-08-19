# wuji2006/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal (visión y lenguaje) desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Forma parte de la generación Qwen3.8, que continúa la línea de las series Qwen3.5 y Qwen3.6, e incorpora mejoras sustanciales en tareas de codificación, trabajo profesional, investigación y agentes de larga duración. El modelo combina un encoder de visión con un núcleo de lenguaje basado en una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention), con 64 capas y 27 320 millones de parámetros.

La versión GGUF aquí descrita, publicada por el usuario wuji2006, utiliza la tecnología de cuantización Unsloth Dynamic V3.0 (preview) para optimizar el rendimiento en inferencia local. El modelo soporta nativamente una longitud de contexto de 262 144 tokens, extensible hasta 1 000 000 mediante técnicas de escalado RoPE como YaRN, e incluye un modo de razonamiento controlable (thinking mode) activado por defecto, así como soporte para tool calling y ejecución de agentes. Su relevancia actual radica en ofrecer capacidades de nivel frontera en un paquete denso de 27B, ejecutable en hardware de consumo con cuantización adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa), 64 capas, hidden dimension 5120, FFN intermedio 17408, MTP (multi-token prediction) |
| Parametros totales | 27 320 697 856 (~27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo; extensible hasta 1 000 000 con escalado RoPE (p. ej. YaRN) |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas en el repo; usa Unsloth Dynamic V3.0) |
| Idiomas soportados | No disponible (se asume multilingüe por la familia Qwen, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que alterna bloques de atención lineal y atención completa. Concretamente, el layout interno es `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, donde Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK (dimensión de cabeza 128), mientras que Gated Attention usa 24 cabezas para Q y 4 para KV (dimensión de cabeza 256, con RoPE de dimensión 64). Esta combinación permite manejar secuencias largas con menor coste computacional que una atención totalmente cuadrática. Además, el modelo incorpora MTP (Multi-Token Prediction), entrenado con múltiples pasos, lo que acelera la inferencia al predecir varios tokens a la vez.

El entrenamiento consta de dos fases: pre-training y post-training, según la documentación oficial. El modelo es nativamente multimodal, con un encoder de visión integrado que procesa imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración. Durante el post-entrenamiento se ha reforzado el soporte para agentes, con mejoras en la planificación autónoma y el manejo de feedback del entorno, así como una mayor robustez en el parsing de objetos anidados para tool calling. El modo de pensamiento (thinking mode) está activado por defecto, pero puede desactivarse por petición; la profundidad del razonamiento se ajusta con el parámetro `reasoning_effort`, y el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento controlable (thinking mode) y ajuste fino del esfuerzo de razonamiento (`reasoning_effort`).
- Comprensión multimodal nativa de imágenes y vídeos, incluyendo diagramas técnicos, documentos escaneados y vídeos de larga duración (hasta escala de horas).
- Soporte de tool calling / function calling mejorado, con parsing robusto de objetos anidados para aumentar la tasa de éxito en llamadas a herramientas.
- Capacidades de agente: planificación autónoma, manejo de feedback del entorno y ejecución de tareas multi-paso de larga duración.
- MTP (Multi-Token Prediction) para inferencia más rápida.
- Flexibilidad de contexto: 262 144 tokens nativos, extensibles a 1 000 000 con escalado RoPE.
- Compatibilidad con entornos de desarrollo y harnesses populares (Codex, Unsloth Desktop, etc.).
- Parámetros de muestreo recomendados diferenciados para modo pensamiento (temperature=1.0, top_p=0.95, top_k=20) y modo instruct (temperature=0.7, top_p=0.80, top_k=20, presence_penalty=1.5).

## Casos de uso

- Asistente de codificación en producción: el modelo puede integrarse en IDEs y pipelines de CI/CD para generar, revisar y refactorizar código, aprovechando su soporte de tool calling y su capacidad de razonamiento multi-paso. Su modo de pensamiento permite depurar problemas complejos antes de emitir la respuesta final.
- Agente autónomo de automatización de oficina: gracias a su planificación autónoma y manejo de feedback del entorno, puede ejecutar tareas como redacción de informes, gestión de correos electrónicos o creación de presentaciones, con supervisión mínima.
- Análisis de documentos técnicos y científicos: su comprensión de imágenes y diagramas STEM, combinada con la ventana de contexto de 262K tokens, permite procesar papers extensos, figuras y tablas para extraer conclusiones o responder preguntas específicas.
- Atención al cliente multilingüe con contexto largo: el modelo puede mantener conversaciones multi-turno con historial extenso (hasta 262K tokens), gestionando incidencias complejas y derivando a herramientas externas mediante function calling.
- Análisis de vídeo de vigilancia o contenido multimedia: su encoder de visión procesa vídeos de hasta una hora, permitiendo resúmenes automáticos, detección de eventos o búsqueda de momentos concretos.
- Investigación y razonamiento matemático: con modo de pensamiento profundo y capacidad de procesar imágenes de fórmulas o gráficos, puede asistir en la resolución de problemas matemáticos avanzados y en la verificación de demostraciones.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF de Unsloth, puede ejecutarse en GPUs de 16-24 GB VRAM, lo que lo hace viable para entornos sin acceso a infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona que Qwen3.8-27B se evalúa en tareas como MathVision (con un prompt fijo de razonamiento paso a paso), pero no se proporcionan cifras concretas en la información recopilada. Tampoco se dispone de comparativas numéricas con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada: según Unsloth, el modelo puede ejecutarse localmente con 17 GB de RAM/VRAM combinados (probablemente con cuantización de 4 bits). Para cuantizaciones mayores (Q5, Q6, Q8) se requerirá más memoria.
- GPU recomendadas: RTX 4090 (24 GB) o superior para cuantización 4-bit con contexto moderado; A100 40/80 GB o H100 para contexto completo de 262K tokens o cuantizaciones altas. También puede ejecutarse en Mac con Apple Silicon (Unsloth Desktop).
- Compatibilidad con GPU de consumo: sí, con cuantización GGUF de 4 bits y gestión cuidadosa del contexto en GPUs de 16-24 GB VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI (Text Generation Inference), Unsloth Desktop (Windows, macOS, Linux). También compatible con endpoints que soporten GGUF.
- Latencia y throughput: no disponible. El MTP (multi-token prediction) debería mejorar la velocidad de generación, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos fiables en la información proporcionada. A modo orientativo, se puede comparar estructuralmente con otros modelos densos de ~27-32B:

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27,3B | 262K (ext. 1M) | Sí (imagen y vídeo) | Apache 2.0 | GGUF / safetensors |
| Qwen2.5-32B | 32,5B | 128K | No | Apache 2.0 | safetensors / GGUF |
| Llama 3.1 8B | 8B | 128K | No | Llama 3.1 Community License | safetensors / GGUF |
| Qwen3-30B-A3B (MoE) | 30,5B total, 3,3B activos | 256K | No | Apache 2.0 | safetensors / GGUF |

Nota: los datos de Qwen2.5-32B, Llama 3.1 8B y Qwen3-30B-A3B son de conocimiento general, no de la información proporcionada. La comparación es estructural, no de rendimiento.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en la documentación disponible, por lo que el rendimiento real en tareas específicas no está verificado de forma independiente.
- El modo de pensamiento activado por defecto puede generar respuestas más largas y aumentar la latencia; es necesario ajustar `reasoning_effort` o desactivarlo para aplicaciones que requieran baja latencia.
- Para contextos superiores a 262K tokens, se requiere escalado RoPE (p. ej. YaRN), lo que puede degradar ligeramente la calidad en los extremos de la ventana.
- El uso de `presence_penalty` alto (entre 0 y 2) puede provocar mezcla de idiomas y una ligera caída del rendimiento, según las recomendaciones oficiales.
- Al ser un modelo GGUF cuantizado, puede haber pérdida de precisión respecto al modelo original en safetensors, especialmente en cuantizaciones bajas (4-bit o inferiores).
- No se especifican los idiomas soportados; aunque la familia Qwen suele ser multilingüe, no hay confirmación explícita para esta versión.
- El repositorio GGUF tiene un tamaño total de 1053,6 GB, lo que indica múltiples cuantizaciones; es necesario seleccionar el archivo adecuado según la VRAM disponible.
- No se han detectado sesgos específicos documentados, pero como todo modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/wuji2006/Qwen3.8-27B-GGUF
- Modelo base original en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Alibaba Cloud: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8 (QwenLM): https://github.com/QwenLM/Qwen3.8
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
