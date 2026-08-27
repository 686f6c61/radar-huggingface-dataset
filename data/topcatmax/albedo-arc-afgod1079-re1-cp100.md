# topcatmax/albedo-arc-afgod1079-re1-cp100

## Resumen

El modelo `topcatmax/albedo-arc-afgod1079-re1-cp100` es un fine-tune de la serie Qwen3.6-35B-A3B, publicado por el usuario topcatmax en Hugging Face. Se trata de un modelo multimodal de tipo imagen-texto-a-texto (image-text-to-text) que integra un codificador de visión con un modelo de lenguaje causal basado en una arquitectura híbrida de mezcla de expertos (MoE). Aunque la model card del repositorio reproduce la documentación oficial de Qwen3.6-35B-A3B, el modelo concreto es un ajuste posterior de esa base, por lo que las características específicas del fine-tune (datos de entrenamiento, objetivo del ajuste) no están documentadas en la información disponible.

La relevancia de este modelo reside en su base: Qwen3.6-35B-A3B es la primera variante de pesos abiertos de la serie Qwen3.6, que prioriza estabilidad y utilidad real en tareas de codificación agéntica y razonamiento a nivel de repositorio. El modelo hereda una ventana de contexto nativa de 262 144 tokens (extensible hasta 1 010 000), una arquitectura MoE con 35 000 millones de parámetros totales y 3 000 millones activos, y soporte para razonamiento con preservación del contexto histórico. Aunque el repositorio específico no ofrece documentación adicional, el modelo se distribuye bajo licencia Apache 2.0 y es compatible con el ecosistema de Transformers, vLLM, SGLang y KTransformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de visión, híbrido de Gated DeltaNet (attention lineal) y Gated Attention, con MoE de 256 expertos (8 activos + 1 compartido) |
| Parámetros totales | 35 000 millones (35B) |
| Parámetros activos | 3 000 millones (3B) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 010 000 tokens |
| Tipos de cuantización | No disponible (el repositorio no especifica cuantizaciones publicadas) |
| Idiomas soportados | No disponible (la model card no detalla idiomas para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato Transformers) |

## Arquitectura y entrenamiento

La arquitectura base del modelo es un transformer causal híbrido que combina capas de atención lineal (Gated DeltaNet) y atención completa (Gated Attention) en un patrón de 10 bloques de `3 × (Gated DeltaNet → MoE)` seguidos de `1 × (Gated Attention → MoE)`. Cada capa MoE cuenta con 256 expertos, de los que se activan 8 más un experto compartido, con dimensión intermedia de 512. La atención lineal usa 32 cabezas para V y 16 para QK, mientras que la atención completa usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. El modelo incorpora además un mecanismo de MTP (multi-token prediction) entrenado con múltiples pasos.

El entrenamiento del modelo base Qwen3.6-35B-A3B incluye fases de pre-entrenamiento y post-entrenamiento, con énfasis en codificación agéntica y preservación del contexto de razonamiento. El fine-tune concreto de este repositorio no documenta el proceso de ajuste (datos, hiperparámetros, técnica como RLHF o DPO), por lo que no se puede detallar el entrenamiento específico del modelo `albedo-arc-afgod1079-re1-cp100`.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3.6-35B-A3B, incluyendo razonamiento de nivel de repositorio y flujos de trabajo de frontend.
- Codificación agéntica: soporta tareas de programación con agentes, como resolución de issues de repositorio y generación de código multi-archivo.
- Preservación del contexto de razonamiento: permite mantener el contexto de razonamiento histórico para iteraciones de desarrollo, reduciendo sobrecarga.
- Entrada multimodal: al ser image-text-to-text, acepta imágenes como entrada junto con texto (capacidad heredada del modelo base).
- Tool calling / function calling: no se documenta explícitamente en el repositorio, pero es esperable en la base Qwen3.6.
- Capacidades multilingües: no se especifica para este fine-tune; el modelo base de Qwen soporta múltiples idiomas, pero no hay datos concretos.

## Casos de uso

- Asistencia de programación con contexto largo: el modelo puede manejar repositorios completos gracias a sus 262K tokens de contexto nativos, permitiendo analizar múltiples archivos y sugerir cambios coherentes en proyectos grandes.
- Generación de código en producción: con soporte de agentes y razonamiento a nivel de repositorio, puede integrarse en pipelines de CI/CD para revisión automática de pull requests o generación de tests unitarios.
- Desarrollo de frontend: la base Qwen3.6 está optimizada para flujos de trabajo de frontend, por lo que este fine-tune podría usarse para generar componentes de interfaz, estilos o maquetación a partir de descripciones o imágenes.
- Chat conversacional con soporte de imagen: al ser multimodal, se puede usar en aplicaciones de chat que necesiten interpretar capturas de pantalla o diagramas de arquitectura para responder preguntas técnicas.
- Razonamiento sobre documentación técnica: su contexto largo permite procesar manuales de API o documentación extensa y responder preguntas de precisión con información contextual.
- Automatización de tareas de mantenimiento de código: el modelo puede analizar logs, stack traces y código fuente para proponer correcciones o refactorizaciones en entornos de desarrollo asistido.

## Benchmarks y rendimiento

La model card del repositorio incluye resultados de benchmarks del modelo base Qwen3.6-35B-A3B (no del fine-tune específico). No se han publicado resultados de benchmarks específicos para el modelo `albedo-arc-afgod1079-re1-cp100`. Los datos del modelo base son los siguientes:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |

Estos resultados corresponden al modelo base de Qwen3.6-35B-A3B, no al fine-tune de este repositorio. No se han publicado resultados de benchmarks específicos para el modelo `albedo-arc-afgod1079-re1-cp100`.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo base de 35B con 3B activos, se estima un uso de VRAM de aproximadamente 20-24 GB en FP16 (dependiendo del contexto y la longitud de secuencia), reduciéndose con cuantizaciones como INT4/INT8 si estuvieran disponibles.
- GPU recomendadas: para inferencia en producción con contexto largo, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100 80GB). Para el modo activo de 3B, es factible en GPUs de consumo como la RTX 3090 o RTX 4070 Ti con cuantización.
- Compatibilidad con consumer GPU: sí, es viable en GPU de consumo de gama alta (24 GB VRAM) si se usa cuantización y se limita el contexto. El contexto nativo de 262K tokens requiere memoria adicional, por lo que para contextos largos se recomienda una GPU de data center.
- Opciones de despliegue: compatible con Transformers, vLLM, SGLang, KTransformers y, previsiblemente, llama.cpp (aunque no se confirma en el repositorio). Ollama podría soportarlo si se genera un GGUF.
- Latencia y throughput: no se disponen de datos concretos para este fine-tune; el modelo base, al ser MoE con 3B activos, ofrece latencias bajas en comparación con modelos densos de tamaño similar, pero los valores exactos dependen del hardware y la configuración.

## Comparativa con modelos similares

Comparación del modelo base Qwen3.6-35B-A3B (la base de este fine-tune) con alternativas de tamaño similar:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K (extensible a 1M) | Apache 2.0 | Abierto |
| Qwen3.5-35B-A3B | 35B | 3B | 262K | Apache 2.0 | Abierto |
| Gemma4-26B-A4B | 26B | 4B | 128K (estimado) | Gemma license | Abierto |
| Qwen3.5-27B | 27B (denso) | 27B | 262K | Apache 2.0 | Abierto |

No hay comparativa directa disponible para el fine-tune concreto, ya que no se han publicado métricas del modelo `albedo-arc-afgod1079-re1-cp100`.

## Limitaciones y advertencias

- El fine-tune específico no tiene documentación sobre los datos de entrenamiento, por lo que se desconocen los sesgos específicos que pueda introducir.
- Riesgo de alucinación inherente a los modelos de lenguaje; especialmente relevante en tareas de codificación donde puede generar código incorrecto sin advertencia.
- La información sobre idiomas y cuantizaciones no está disponible para este repositorio concreto; se asume que hereda las capacidades del modelo base, pero no se garantiza.
- El modelo está basado en una serie futura (Qwen3.6) y el repositorio tiene fecha de creación de 2026; la compatibilidad con versiones actuales de librerías puede requerir verificación.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de los términos de la licencia del modelo base (Apache 2.0 también) y de cualquier otro requisito adicional que pueda existir en el fine-tune.
- Para producción, se recomienda validar el modelo en tareas concretas antes de desplegarlo, ya que no hay benchmarks específicos del fine-tune.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/topcatmax/albedo-arc-afgod1079-re1-cp100
- Perfil del autor en Hugging Face: https://huggingface.co/topcatmax
- Página de modelos del autor: https://huggingface.co/topcatmax/models
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
