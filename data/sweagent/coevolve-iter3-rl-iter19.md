# sweagent/coevolve-iter3-rl-iter19

## Resumen

El modelo `sweagent/coevolve-iter3-rl-iter19` es un fine-tune del modelo base `Qwen/Qwen3.5-35B-A3B-Base`, desarrollado por el equipo de sweagent (Stanford AI) como parte del framework CoEvolve. CoEvolve es un método de entrenamiento por refuerzo para agentes LLM que cierra el bucle entre el agente y sus datos de entrenamiento: el agente interactúa con el entorno, se extraen señales de fallo de sus rollouts y esas señales guían la síntesis de nuevas tareas sintéticas, logrando una evolución mutua entre el agente y el dataset. Este modelo concreto es la iteración 3 del entrenamiento con 19 pasos de RL internos, y hereda la arquitectura multimodal del modelo base, que combina un encoder de visión con un transformador MoE híbrido (Gated DeltaNet + Gated Attention).

El modelo base Qwen3.5-35B-A3B tiene 35B parámetros totales y 3B activos, con una longitud de contexto nativa de 262.144 tokens extensible hasta 1.010.000. El fine-tune de CoEvolve añade parámetros adicionales (el repositorio muestra 68,16B según los safetensors), probablemente por la inclusión del encoder de visión y componentes de agente. Su licencia Apache 2.0 permite uso comercial sin restricciones, y está pensado para tareas de agentes que requieren razonamiento multi-paso, tool calling y comprensión de imágenes, todo ello en un formato eficiente gracias a la activación selectiva de solo 3B parámetros por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention) con vision encoder |
| Parametros totales | 68.164.077.424 (según safetensors) |
| Parametros activos | 3B (por token) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 201 idiomas y dialectos (según modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura hereda el diseño del modelo base Qwen3.5-35B-A3B: un transformer causal con vision encoder y una mezcla de expertos (MoE) donde cada capa alterna bloques de Gated DeltaNet (una variante de attention lineal) con bloques de Gated Attention, y cada 10 capas se introduce un bloque de atención completa. El MoE tiene 256 expertos, de los cuales 8 se activan por token más 1 experto compartido. El modelo base fue pre-entrenado con datos multimodales (imagen-texto) y posteriormente alineado mediante RLHF y DPO.

El fine-tune `coevolve-iter3-rl-iter19` se entrena siguiendo el marco CoEvolve, que no usa datos estáticos sino que sintetiza tareas nuevas a partir de los fallos que el agente comete en el entorno. En este caso, el entorno es probablemente un entorno de ingeniería de software (SWE-bench u similar). El proceso iterativo extrae señales de debilidad de los rollouts, genera nuevas tareas sintéticas y las usa para continuar el RL. No se han publicado detalles específicos del dataset utilizado en esta iteración concreta, pero el método está descrito en el paper de CoEvolve.

## Capacidades

- Generación de texto y razonamiento multi-paso, con capacidad de planificación y ejecución de acciones en entornos de agentes.
- Comprensión de imágenes (visión), ya que el modelo base es multimodal (image-text-to-text).
- Soporte de tool calling / function calling, integrable en pipelines de agentes.
- Capacidad de agente autónomo: puede interactuar con entornos externos (por ejemplo, repositorios de código, APIs) y aprender de sus errores.
- Multilingüismo: soporte para 201 idiomas según el modelo base.
- Contexto largo: 262K tokens nativos, útil para conversaciones o tareas con historial extenso.
- Modo de pensamiento (thinking mode) posible, aunque no confirmado para esta versión.

## Casos de uso

- **Automatización de resolución de incidencias en GitHub**: el modelo puede leer issues, generar patches de código y ejecutar tests, gracias a su capacidad de tool calling y su entrenamiento en agentes de software. Es adecuado porque su RL se enfoca en tareas de ingeniería de software reales.
- **Agente de desarrollo de código autónomo**: puede refactorizar código, añadir funcionalidades o corregir bugs en proyectos, manteniendo el contexto de todo el repositorio gracias a su ventana de 262K tokens.
- **Asistente de programación multimodal**: dado que acepta imágenes, puede interpretar capturas de pantalla de interfaces o diagramas para generar código correspondiente.
- **Búsqueda y recuperación de información en documentación técnica**: con su contexto largo, puede procesar grandes manuales y responder preguntas complejas.
- **Creación de tareas de entrenamiento para otros agentes**: dentro del propio framework CoEvolve, este modelo puede generar nuevas tareas sintéticas para otros agentes, aprovechando su capacidad de razonamiento.
- **Integración en pipelines de CI/CD**: como agente autónomo, puede revisar pull requests, ejecutar pruebas y proponer cambios automáticamente.
- **Asistencia en investigación**: puede leer papers (con imágenes y texto) y razonar sobre experimentos, ayudando en la revisión de literatura.
- **Despliegue en servicios de atención al cliente con visión**: interpretar capturas de pantalla de errores de usuario y guiar soluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo `coevolve-iter3-rl-iter19`. La model card del modelo base Qwen3.5-35B-A3B incluye resultados de MMLU-Pro, HumanEval, etc., pero no se ha confirmado que este fine-tune mantenga o supere esos valores. Por tanto, no hay datos fiables de rendimiento para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 68B parámetros totales en FP16 (136 GB), pero como MoE con 3B activos por token, la memoria de activación es baja. Sin cuantización, se necesitaría al menos 136 GB de VRAM para cargar los pesos completos (por ejemplo, 2×H100 de 80GB). Con cuantización INT8 o INT4, se puede reducir a ~35-70 GB, permitiendo ejecución en una sola GPU de 80GB (como A100 o H100).
- GPU recomendadas: A100 80GB, H100 80GB, o múltiples GPUs para mayor throughput. Para consumer, una RTX 4090 (24GB) no es suficiente para cargar los pesos completos, pero con cuantización de 4-bit podría llegar a 35GB, quedando fuera de su capacidad. Se recomienda al menos 2×RTX 3090 o 1×A100.
- Opciones de despliegue: compatible con Transformers, vLLM, SGLang, KTransformers y llama.cpp (si se convierte a GGUF). Para agentes, vLLM es la opción más eficiente para servir el modelo.
- Latencia y throughput: no hay datos publicados, pero al ser MoE con 3B activos, la velocidad de inferencia es similar a un modelo de 3B denso, mientras que la capacidad de conocimiento es mayor.

## Comparativa con modelos similares

No se dispone de comparativas oficiales para este fine-tune. Como referencia, se puede comparar con el modelo base Qwen3.5-35B-A3B y con otros modelos MoE de tamaño similar como Mixtral-8x7B (46.7B totales, 12.9B activos) o DeepSeek-V2-Lite (15.7B totales, 2.4B activos). Sin embargo, no hay datos de rendimiento para esta versión específica. Se recomienda consultar el paper de CoEvolve para ver resultados en tareas de agentes (SWE-bench, etc.) que pueden incluir este modelo.

## Limitaciones y advertencias

- No se han publicado estudios de sesgos o alucinaciones para este modelo específico. Como modelo entrenado con RL sobre tareas sintéticas, puede presentar comportamientos subóptimos en dominios fuera de los de entrenamiento.
- El modelo no está pensado para uso en producción sin validación previa; es un modelo de investigación.
- La licencia Apache 2.0 permite uso comercial, pero hay que verificar que el modelo base Qwen3.5-35B-A3B tenga la misma licencia (en la model card se indica que sí).
- La ventana de contexto de 262K tokens es amplia, pero el rendimiento real en contextos muy largos puede degradarse; se recomienda probar antes de desplegar.
- El modelo es multimodal, pero no se han documentado limitaciones específicas de visión.
- No se incluyen instrucciones de uso detalladas en la model card del repo; se recomienda consultar la documentación de Qwen3.5 para el uso correcto.

## Enlaces

- HuggingFace: https://huggingface.co/sweagent/coevolve-iter3-rl-iter19
- Paper CoEvolve (arXiv): https://arxiv.org/abs/2604.15840
- PDF del paper: https://arxiv.org/pdf/2604.15840
- Repo GitHub: https://github.com/StoneHanaMori/CoEvolve
- Página en ACL Anthology: https://aclanthology.org/2026.acl-long.1055/
- Modelo base Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
