# taobao-mnn/Qwen3.5-122B-A10B-MNN

## Resumen

Qwen3.5-122B-A10B-MNN es un paquete de inferencia en formato MNN del checkpoint Qwen/Qwen3.5-122B-A10B, un modelo vision-lenguaje de arquitectura MoE (mixture of experts) desarrollado por el equipo Qwen de Alibaba. Esta versión, publicada por taobao-mnn, no es un modelo nuevo sino una conversión cuantizada a 4 bits mediante HQQ (Half-Quadratic Quantization) pensada para ejecutarse con el runtime MNN de Alibaba en CPU, lo que permite desplegar un modelo de 122.000 millones de parámetros en entornos sin GPU de gran capacidad.

El modelo original combina una arquitectura híbrida con Gated DeltaNet, atención con compuertas (gated attention) y expertos dispersos, con 48 capas y 256 expertos enrutados de los que se activan 8 por token (de ahí el sufijo A10B, que indica aproximadamente 10.000 millones de parámetros activos). Está orientado a comprensión visual, razonamiento, generación de código, soporte multilingüe y aplicaciones agénticas.

La relevancia de este paquete radica en su enfoque de despliegue: cuantización HQQ de 4 bits con grupo de 64 y escalas FP16 sobre las capas lineales de texto, manteniendo los embeddings en BF16, todo empaquetado para el motor MNN. Esto lo sitúa como una opción para servir un MoE grande en hardware modesto, a costa de una validación funcional limitada (solo 10 casos de smoke test en CPU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con Gated DeltaNet, gated attention y expertos dispersos |
| Parametros totales | 122B (según denominación del checkpoint base) |
| Parametros activos | ~10B (8 de 256 expertos enrutados por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit, group size 64, escalas FP16; embeddings en BF16 |
| Idiomas soportados | en (según model card; el modelo base declara soporte multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (runtime de Alibaba); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El checkpoint base Qwen3.5-122B-A10B emplea una arquitectura híbrida que combina capas Gated DeltaNet (un mecanismo de estado recurrente lineal) con capas de atención con compuertas y una capa MoE de 256 expertos enrutados, de los cuales se seleccionan 8 por token. El modelo tiene 48 capas y procesa entradas multimodales (texto e imágenes) para producir texto. Es un checkpoint post-entrenado de la familia Qwen3.5, lo que implica fases de ajuste supervisado y, presumiblemente, optimización por preferencias, aunque la model card no detalla la composición del dataset ni el número de tokens de entrenamiento.

La conversión a MNN aplica cuantización HQQ de 4 bits sobre las capas lineales de texto con tamaño de grupo 64 y escalas en FP16, mientras que los embeddings de tokens se almacenan en BF16 como pesos separados. El paquete requiere una revisión concreta del runtime MNN (commit 7337404b) que incluye correcciones de exportación para MoE. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del propio diseño híbrido del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `chat`).
- Comprensión de imágenes: el paquete acepta entradas de texto e imagen y produce texto.
- Razonamiento y resolución de problemas, según las capacidades declaradas del modelo base.
- Generación de código y tareas de programación.
- Soporte multilingüe heredado del checkpoint original (la model card de este paquete solo declara `en`).
- Aplicaciones agénticas y de razonamiento multi-paso, según la model card upstream.
- Ejecución en CPU mediante el runtime MNN, con soporte de mmap para pesos y caché en disco.

## Casos de uso

- Despliegue en servidores sin GPU: el paquete MNN con cuantización HQQ 4-bit permite ejecutar un MoE de 122B en CPU con aproximadamente 64 GB de RAM usando mmap, lo que habilita inferencia en infraestructura de propósito general.
- Asistentes conversacionales con entrada visual: al aceptar imágenes y texto, puede usarse para responder preguntas sobre capturas, documentos escaneados o interfaces de usuario en flujos de soporte.
- Procesamiento por lotes en entornos edge o on-premise: la naturaleza CPU-first de MNN facilita integrar el modelo en appliances o servidores locales donde no se dispone de aceleradores NVIDIA.
- Prototipado de agentes multimodales: sus capacidades agénticas declaradas permiten construir pipelines que combinen percepción visual y razonamiento multi-paso antes de migrar a un despliegue mayor.
- Evaluación de modelos MoE grandes en investigación: útil para estudiar el comportamiento de un MoE de 122B con 10B activos en hardware asequible, comparando la calidad frente a la versión sin cuantizar.
- Generación de código en entornos de desarrollo con restricciones de hardware: puede integrarse en herramientas locales de autocompletado o revisión siempre que se acepte la pérdida de precisión de la cuantización 4-bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta que la migración superó 10 casos de smoke test funcionales en CPU (modo High/Low), que constituyen comprobaciones de funcionamiento y no una evaluación amplia de calidad ni de rendimiento en GPU.

## Requisitos de hardware

- VRAM: no aplica para el objetivo principal (CPU); para una hipotética ejecución en GPU, el tamaño del repo es de 146,4 GB, por lo que se requeriría memoria unificada o múltiples aceleradores de gran capacidad.
- RAM: la validación original se realizó con 64 GB de RAM usando mmap de pesos, requiriendo unos 85 GB adicionales de espacio en disco para la caché (`mnn_weight_cache`).
- GPU recomendadas: no disponible; el paquete está orientado a CPU y no se documentan requisitos de GPU.
- ¿Cabe en GPU de consumo? No de forma directa: 146,4 GB de pesos exceden la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: runtime MNN (build con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_LLM_OMNI=ON`), con los binarios `llm_demo` y `llm_bench`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica que se ejecutaron pruebas funcionales, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-MNN (este) | 122B totales / ~10B activos | no disponible | Apache 2.0 | MNN 4-bit HQQ | Orientado a CPU, validación funcional limitada |
| Qwen/Qwen3.5-122B-A10B (base) | 122B totales / ~10B activos | no disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar, requiere hardware de gran capacidad |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización HQQ 4-bit introduce pérdida de precisión respecto al checkpoint original; no se han publicado evaluaciones de degradación de calidad.
- La validación reportada se limita a 10 casos de smoke test en CPU, insuficiente para garantizar comportamiento en producción.
- El paquete declara únicamente el idioma `en`, aunque el modelo base anuncia capacidades multilingües; el rendimiento en otros idiomas no está verificado.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en esta versión.
- Sesgos: no se documentan análisis de sesgo para este paquete ni para el checkpoint base en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución del modelo original y revisar los ficheros de licencia del repositorio.
- Requiere una revisión concreta del runtime MNN (commit 7337404b) para funcionar correctamente; otras versiones pueden no ser compatibles con los offsets de pesos generados.
- El uso de mmap con caché en disco implica planificación de almacenamiento (~85 GB adicionales) y un directorio de caché escribible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Qwen3.5-122B-A10B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Repositorio MNN: https://github.com/alibaba/MNN
- Commit de MNN requerido: https://github.com/alibaba/MNN/commit/7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4
- Documentación MNN LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
