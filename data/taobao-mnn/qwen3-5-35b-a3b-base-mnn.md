# taobao-mnn/Qwen3.5-35B-A3B-Base-MNN

## Resumen

Qwen3.5-35B-A3B-Base-MNN es un paquete de inferencia cuantizado en 4 bits mediante HQQ (Half-Quadratic Quantization) del checkpoint base Qwen3.5-35B-A3B-Base, publicado por el equipo taobao-mnn. El modelo original es un checkpoint multimodal (texto e imagen a texto) de tipo pretrained-only desarrollado por Qwen, con una arquitectura híbrida que combina capas Gated DeltaNet, atención con compuertas y capas MoE dispersas. Este paquete no es un modelo nuevo: es una conversión optimizada para ejecutarse con el runtime MNN de Alibaba, orientada a despliegue en CPU y dispositivos con recursos limitados.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 35B parámetros totales con solo 3B parámetros activos por token (top-8 de 256 expertos enrutados) en un formato de 43,5 GB, con pesos lineales cuantizados a 4 bits y embeddings en BF16. El modelo base está pensado para fine-tuning, aprendizaje en contexto e investigación, por lo que este paquete MNN resulta útil para validar el comportamiento del checkpoint original en entornos de producción con MNN antes de invertir en infraestructura GPU.

La licencia es Apache 2.0, lo que facilita el uso comercial, aunque el paquete hereda las limitaciones del checkpoint base (solo inglés declarado, sin ajuste por instrucciones ni RLHF). La versión de MNN utilizada es el commit `7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4`, que incluye correcciones específicas para la exportación de capas MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet + atención con compuertas + MoE disperso |
| Parametros totales | 35B (aproximado, según nomenclatura del checkpoint) |
| Parametros activos | 3B (aproximado; top-8 de 256 expertos enrutados por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit, group size 64, escalas FP16; embeddings en BF16 (16-bit) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (runtime propio de Alibaba); no safetensors ni GGUF |
| Capas | 40 |
| Expertos enrutados | 256 |
| Expertos seleccionados por token | 8 |
| Entrada / salida | Texto e imágenes → texto |
| Tamano del repo | 43,5 GB |

## Arquitectura y entrenamiento

El checkpoint base Qwen3.5-35B-A3B-Base emplea una arquitectura híbrida poco convencional: combina capas Gated DeltaNet (una variante de atención lineal con estado recurrente) con capas de atención tradicional con compuertas y capas MoE dispersas. El modelo tiene 40 capas, 256 expertos enrutados y selecciona 8 expertos por token, lo que resulta en aproximadamente 3B parámetros activos sobre un total de 35B. Esta configuración busca reducir el coste computacional por token manteniendo una capacidad de representación alta.

El modelo base es un checkpoint pretrained-only, sin ajuste por instrucciones ni RLHF/DPO según la información disponible. Está posicionado por Qwen para fine-tuning, aprendizaje en contexto e investigación, y requiere prompts de tipo completion (continuación de texto) en su forma sin modificar. La conversión a MNN aplica cuantización HQQ de 4 bits con group size 64 y escalas FP16 sobre las capas lineales de texto, mientras que los embeddings de tokens se almacenan por separado en BF16. El proceso de exportación se realiza con `llmexport.py` y requiere preservar el tokenizer y la plantilla del paquete publicado, así como los offsets de pesos generados en la reexportación.

## Capacidades

- Generación de texto en inglés con prompts de tipo completion (el checkpoint no está ajustado por instrucciones).
- Procesamiento multimodal de entrada: acepta texto e imágenes y produce texto.
- Razonamiento y generación de código heredados del checkpoint base (no verificados en este paquete).
- Capacidades multilingües limitadas: la model card solo declara inglés.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso en la información disponible.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Validación de despliegue en CPU con MNN: el paquete incluye binarios `llm_demo` y `llm_bench` para ejecutar el modelo en Linux CPU con compilación Release, útil para verificar latencia y consumo antes de pasar a producción.
- Investigación sobre arquitecturas híbridas MoE: al ser un checkpoint base accesible en formato MNN, permite estudiar el comportamiento de Gated DeltaNet y el enrutamiento de 256 expertos en entornos sin GPU.
- Fine-tuning sobre el checkpoint original: aunque este paquete es de inferencia, sirve como referencia para comparar el comportamiento del modelo base antes y después de un ajuste específico.
- Prototipado de aplicaciones multimodal texto-imagen: el modelo acepta imágenes como entrada, lo que permite construir demos de descripción de imágenes o respuesta a preguntas visuales en inglés.
- Evaluación de cuantización HQQ 4-bit: útil para medir la degradación de calidad frente al checkpoint en BF16/FP16 en tareas de generación de texto.
- Pruebas de integración con MNN en pipelines propios: el repositorio documenta el proceso completo de conversión, lo que facilita reexportar el modelo con otros parámetros de cuantización.
- Despliegue en dispositivos edge o entornos con memoria limitada: el formato MNN con `MNN_LOW_MEMORY=ON` está pensado para reducir el consumo de RAM durante la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la migración original superó 10 casos de smoke test en CPU (High/Low) y que estas pruebas son funcionales, no benchmarks amplios de calidad ni de GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 43,5 GB en disco, por lo que se requiere al menos esa cantidad de almacenamiento y RAM/VRAM equivalente para cargar los pesos.
- GPU recomendadas: no disponible. El paquete está orientado a ejecución en CPU mediante MNN; la model card solo documenta compilación para Linux CPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: runtime MNN (commit `7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4`), con binarios `llm_demo` y `llm_bench`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. La model card solo menciona que se ejecutaron 10 casos de smoke test en CPU, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-Base-MNN (este) | ~35B | ~3B (top-8 de 256) | no disponible | Apache 2.0 | MNN (HQQ 4-bit) | Hugging Face, 325 descargas |
| Qwen3.5-35B-A3B-Base (original) | ~35B | ~3B (top-8 de 256) | no disponible | Apache 2.0 | safetensors (BF16/FP16) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- El checkpoint base es pretrained-only: no está ajustado por instrucciones ni por preferencias humanas, por lo que puede producir continuaciones incoherentes o repetitivas si se usa con prompts conversacionales.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje sin ajuste por instrucciones; no se han publicado evaluaciones de fidelidad factual.
- Sesgos conocidos: no documentados en la información disponible, pero heredados del corpus de entrenamiento del checkpoint base.
- La cuantización HQQ 4-bit puede degradar la calidad respecto al checkpoint original en BF16/FP16; no se han publicado métricas de dicha degradación.
- El formato MNN no es compatible con los runtimes más habituales (vLLM, llama.cpp, TGI); requiere el runtime MNN y una compilación específica.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución del modelo original y revisar los archivos de licencia del repositorio.
- El paquete solo ha superado 10 smoke tests funcionales en CPU; no hay garantías de estabilidad en producción ni en GPU.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar aplicaciones con ventanas largas.

## Enlaces

- Paquete MNN en Hugging Face: https://huggingface.co/taobao-mnn/Qwen3.5-35B-A3B-Base-MNN
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Commit de MNN utilizado: https://github.com/alibaba/MNN/commit/7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4
- Documentación de MNN LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
