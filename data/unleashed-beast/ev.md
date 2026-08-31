# unleashed-beast/EV

## Resumen

El modelo EV es un adaptador LoRA de tipo PEFT desarrollado por el usuario unleashed-beast (aarush agarwal) sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Se trata de un ajuste fino orientado a generación de texto conversacional, entrenado mediante ORPO (Odds Ratio Preference Optimization), una técnica de optimización de preferencias que no requiere un modelo de referencia separado, tal como se describe en el artículo arXiv:2403.07691.

El adaptador tiene un tamaño de repositorio de 0,3 GB y está diseñado para ser cargado sobre el modelo base de 7B parámetros de Qwen2.5. Su relevancia radica en que demuestra un flujo de trabajo completo de fine-tuning con TRL y PEFT, aunque la información pública disponible es muy limitada: no se especifican datos de entrenamiento, licencia, idiomas soportados ni resultados de benchmarks. El modelo se publicó en agosto de 2026 y no cuenta con descargas ni valoraciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador pesa 0,3 GB; el modelo base tiene 7.600 millones de parametros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, Qwen2.5-7B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-7B-Instruct soporta principalmente ingles y chino, con cierta capacidad multilingue) |
| Licencia | No disponible (el modelo base Qwen2.5-7B-Instruct usa licencia Apache 2.0, pero la licencia del adaptador no se especifica) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo EV es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención de ventana deslizante y soporte de contexto largo (32.768 tokens en su versión base). El adaptador fue entrenado con ORPO, una técnica de optimización de preferencias que combina el ajuste supervisado y la alineación con preferencias humanas en un único proceso, sin necesidad de un modelo de referencia para calcular la divergencia KL. Esto reduce costes computacionales y simplifica el pipeline de entrenamiento.

Los detalles del dataset de entrenamiento no se han publicado. La model card indica que se usó TRL (versión 0.29.1) con PEFT 0.20.0, Transformers 4.57.6 y PyTorch 2.11.0+cu128. No se menciona si se aplicaron técnicas adicionales como RLHF, DPO o decodificación especulativa. El adaptador está diseñado para cargarse sobre el modelo base mediante la librería PEFT, por lo que su uso requiere descargar tanto el adaptador como el modelo base completo.

## Capacidades

- Generación de texto conversacional: el modelo está orientado a tareas de chat y diálogo, heredando las capacidades instructivas de Qwen2.5-7B-Instruct.
- Razonamiento y conocimiento general: al estar basado en Qwen2.5-7B-Instruct, conserva las capacidades de razonamiento, matemáticas y conocimiento del modelo base, aunque el adaptador puede modificar su comportamiento.
- Soporte de tool calling y function calling: no se menciona explícitamente, pero el modelo base Qwen2.5-7B-Instruct soporta estas funciones; el adaptador podría conservarlas o alterarlas.
- Capacidades multilingües: no se especifican; el modelo base tiene soporte principal para inglés y chino, con capacidades limitadas en otros idiomas.
- No se documentan capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Chatbots de atención al cliente: el adaptador puede integrarse sobre Qwen2.5-7B-Instruct para crear asistentes conversacionales que gestionen consultas multi-turno, aprovechando la ventana de contexto de 32K tokens del modelo base para mantener historiales largos.
- Asistentes de productividad personal: desplegado en local con herramientas como Ollama o llama.cpp, puede servir como asistente para redacción de correos, resúmenes de documentos o generación de ideas, sin depender de APIs externas.
- Prototipado rápido de aplicaciones de IA conversacional: al ser un adaptador ligero (0,3 GB), permite iterar rápidamente sobre el modelo base sin necesidad de reentrenar todos los parámetros, ideal para experimentos de investigación.
- Evaluación de técnicas de alineación: el uso de ORPO en este adaptador lo convierte en un caso de estudio para comparar métodos de optimización de preferencias frente a DPO o RLHF en tareas de chat.
- Generación de contenido creativo: puede utilizarse para escribir historias, guiones o diálogos, aprovechando las capacidades generativas del modelo base.
- Fine-tuning específico de dominio: el adaptador puede servir como punto de partida para ajustes adicionales en dominios concretos (legal, médico, técnico) mediante LoRA, dado que su tamaño reducido facilita la transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador. El rendimiento dependerá en gran medida del modelo base Qwen2.5-7B-Instruct, que en su versión original obtiene resultados competitivos en tareas de razonamiento y código, pero no se puede asumir que el adaptador los conserve sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base Qwen2.5-7B-Instruct en precisión FP16 requiere aproximadamente 14-16 GB de VRAM. Con cuantización a 4 bits (GPTQ o AWQ) se reduce a unos 4-5 GB.
- GPU recomendadas: para el modelo base en FP16 se necesitan GPUs con al menos 16 GB de VRAM (RTX 4090, A100 40GB, etc.). Con cuantización 4 bits, una RTX 3060 de 12 GB o RTX 4070 pueden ser suficientes.
- Compatibilidad con GPUs de consumo: sí, el modelo base cabe en GPUs de consumo con cuantización (por ejemplo, RTX 3090 o RTX 4090). El adaptador LoRA añade una carga mínima adicional.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, Transformers con PEFT. El adaptador requiere cargarse junto al modelo base mediante la API de PEFT.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El adaptador EV es un ajuste LoRA sobre Qwen2.5-7B-Instruct, por lo que su comportamiento será similar al de otros adaptadores LoRA sobre el mismo modelo base. Alternativas comparables serían:

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EV (este modelo) | Qwen2.5-7B-Instruct | 7B (base) | 32K (base) | No disponible | Hugging Face |
| Qwen2.5-7B-Instruct (base) | - | 7B | 32K | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | - | 8B | 128K | Llama 3.1 Community License | Hugging Face |
| Mistral-7B-Instruct-v0.3 | - | 7B | 32K | Apache 2.0 | Hugging Face |

La comparación real dependería de los resultados de benchmarks del adaptador, que no se han publicado.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero el modelo base Qwen2.5-7B-Instruct puede presentar sesgos presentes en sus datos de entrenamiento, que el adaptador podría amplificar o mitigar sin control.
- Riesgo de alucinación: inherente a los modelos generativos; el adaptador no incluye mecanismos adicionales de verificación de hechos.
- Limitaciones de contexto e idioma: el adaptador no especifica idiomas soportados; se asume que hereda las limitaciones del modelo base (principalmente inglés y chino, con menor rendimiento en otros idiomas).
- Restricciones de licencia: la licencia del adaptador no está especificada. El modelo base Qwen2.5-7B-Instruct usa Apache 2.0, pero el adaptador podría tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- Carencia de documentación: no hay información sobre el dataset de entrenamiento, el proceso de evaluación ni los objetivos de alineación, lo que dificulta evaluar su idoneidad para producción.
- Dependencia del modelo base: el adaptador no es funcional por sí solo; requiere descargar Qwen2.5-7B-Instruct completo, lo que implica un coste de almacenamiento y cómputo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unleashed-beast/EV
- Perfil del autor: https://huggingface.co/unleashed-beast
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de ORPO: https://huggingface.co/papers/2403.07691
- Repositorio de TRL: https://github.com/huggingface/trl
