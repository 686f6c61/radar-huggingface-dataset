# Zyroxx66/Qwen2.5-3B-Somali-Pure9k-Instruct

## Resumen

El modelo **Qwen2.5-3B-Somali-Pure9k-Instruct** es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una versión cuantizada en 4 bits de Qwen2.5-3B, desarrollado por el usuario Zyroxx66. Está diseñado específicamente para mejorar las capacidades del modelo en idioma somalí, un idioma de bajos recursos con poca representación en los modelos multilingües generalistas. El ajuste se realizó mediante entrenamiento supervisado (SFT) sobre un dataset de aproximadamente 9.000 ejemplos, denominado "Pure9k".

La relevancia de este modelo radica en su especialización lingüística: permite a desarrolladores e investigadores disponer de un modelo de 3.000 millones de parámetros capaz de seguir instrucciones y generar texto en somalí con mayor fluidez que el modelo base. Al estar basado en Qwen2.5, hereda la arquitectura transformer decoder-only, una ventana de contexto de 32.768 tokens y un entrenamiento previo sobre 18 billones de tokens multilingües. El resultado es un modelo compacto, desplegable en hardware de gama media, orientado a tareas de generación de texto, traducción y asistencia conversacional en somalí.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.000 millones (aprox.) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit; el repo ocupa 3,5 GB, lo que sugiere una cuantización media, pero no se especifica) |
| Idiomas soportados | somalí (principal), inglés (heredado del modelo base) |
| Licencia | no disponible (el modelo base Qwen2.5 es Apache 2.0, pero el fine-tuning no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base `unsloth/Qwen2.5-3B-bnb-4bit` es una versión cuantizada en 4 bits mediante bitsandbytes, optimizada para fine-tuning eficiente en memoria con la librería Unsloth. Sobre esta base, el autor aplicó un entrenamiento supervisado (SFT) utilizando la librería TRL de Hugging Face, con el dataset "Pure9k" compuesto por aproximadamente 9.000 instrucciones y respuestas en somalí.

No se dispone de información detallada sobre la composición exacta del dataset, el número de épocas, la tasa de aprendizaje ni otras hiperparámetros. El entrenamiento se realizó con las versiones de Transformers 5.15.0, PyTorch 2.10.0 y TRL 1.10.0, lo que indica un entorno reciente. No se menciona el uso de técnicas como RLHF o DPO; el proceso se limitó a SFT. Tampoco se documentan innovaciones arquitectónicas adicionales más allá de las heredadas de Qwen2.5.

## Capacidades

- Generación de texto en somalí: responde a instrucciones y preguntas formuladas en somalí con un registro natural y coherente.
- Comprensión de instrucciones en inglés: al estar basado en Qwen2.5, conserva la capacidad de procesar prompts en inglés, aunque su especialización principal es el somalí.
- Seguimiento de conversaciones multi-turno: gracias a la ventana de contexto de 32.768 tokens, puede mantener diálogos extensos sin perder el hilo.
- Razonamiento básico y conocimiento general: hereda del modelo base un conocimiento enciclopédico y capacidades de razonamiento propias de un modelo de 3B parámetros.
- No se documentan capacidades de tool calling, function calling, ni modos de razonamiento especiales (thinking mode). Tampoco soporta visión ni audio.

## Casos de uso

- Traducción automática somalí-inglés y viceversa: el modelo puede utilizarse para traducir frases o párrafos entre ambos idiomas, aprovechando su entrenamiento bilingüe. Es adecuado para textos cortos y medios, aunque su tamaño limitado puede afectar a la fluidez en textos muy largos.
- Asistente conversacional en somalí para atención al cliente: empresas que operan en regiones de habla somalí pueden desplegar un chatbot capaz de responder preguntas frecuentes, gestionar incidencias y mantener conversaciones multi-turno con contexto largo.
- Generación de contenido en somalí: redacción de artículos, resúmenes, correos electrónicos o publicaciones en redes sociales en somalí, con un estilo natural y adaptado al registro solicitado.
- Anotación y etiquetado de datos en somalí: el modelo puede asistir en la creación de datasets etiquetados para otras tareas de NLP en somalí, como clasificación de sentimiento o extracción de entidades.
- Educación y aprendizaje de idiomas: herramienta para practicar somalí como lengua extranjera, generando ejercicios, diálogos o explicaciones gramaticales.
- Transcripción y resumen de actas o documentos administrativos en somalí: dado su contexto largo, puede procesar documentos extensos y generar resúmenes ejecutivos en somalí o inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico. El autor no proporciona comparaciones cuantitativas con el modelo base ni con otros modelos multilingües.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 3B parámetros, en precisión fp16/bf16 requiere aproximadamente 6 GB de VRAM. Si se cuantiza a 8 bits, baja a unos 3 GB; a 4 bits, a unos 2 GB. El repo ocupa 3,5 GB, lo que sugiere una cuantización intermedia (posiblemente 8 bits), con un consumo de VRAM en torno a 4-5 GB.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. También en GPUs de datacenter como A10, L4 o A100.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo sin cuantización adicional; con cuantización 4 bits, incluso 4 GB son suficientes.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. También es compatible con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no se dispone de mediciones concretas. En una RTX 4090, un modelo de 3B en fp16 suele generar entre 50 y 100 tokens por segundo. En GPUs más modestas, la cifra baja proporcionalmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Somali-Pure9k-Instruct (este) | 3B | 32k | somalí, inglés | no disponible | Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3B | 32k | multilingüe (incluye somalí) | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3B | 128k | multilingüe (no somalí) | Llama 3.2 Community License | Hugging Face |
| Gemma-2-2B | 2.6B | 8k | multilingüe (no somalí) | Gemma License | Hugging Face |

La comparativa muestra que este modelo es el único de los listados con un ajuste específico para somalí. El modelo base Qwen2.5-3B-Instruct ya soporta somalí, pero su rendimiento en este idioma es limitado debido a la baja representación en el pretraining. El fine-tuning con Pure9k busca mejorar esa capacidad. Las alternativas de Llama y Gemma no tienen soporte oficial para somalí, por lo que este modelo cubre un nicho concreto.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño (3B) y entrenado sobre un dataset reducido (9k ejemplos), es propenso a alucinaciones y a generar información factualmente incorrecta, especialmente en temas especializados.
- Limitaciones idiomáticas: aunque está especializado en somalí, su vocabulario y expresiones pueden no cubrir todas las variantes dialectales del idioma. El inglés heredado del modelo base puede verse degradado si el fine-tuning ha desplazado parte de los pesos.
- Riesgo de sobreajuste: el dataset Pure9k es pequeño; el modelo puede memorizar patrones específicos y fallar ante formulaciones novedosas o fuera de distribución.
- Licencia y uso comercial: al no declarar licencia, no se garantiza que el modelo pueda usarse comercialmente. Se recomienda contactar con el autor o asumir el riesgo. El modelo base Qwen2.5 es Apache 2.0, pero el fine-tuning puede tener restricciones adicionales.
- Ausencia de evaluación: sin benchmarks publicados, no hay evidencia objetiva de la mejora frente al modelo base. Se recomienda realizar una evaluación propia antes de usarlo en producción.
- Dependencia de la cuantización: al partir de un modelo base en 4 bits, el fine-tuning puede haber arrastrado pérdidas de precisión. El modelo final no especifica su formato de cuantización, lo que dificulta estimar su rendimiento exacto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Zyroxx66/Qwen2.5-3B-Somali-Pure9k-Instruct)
- [Modelo base unsloth/Qwen2.5-3B-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-3B-bnb-4bit)
- [Paper técnico de Qwen2.5 (arXiv)](https://arxiv.org/abs/2412.15115)
- [Documentación oficial de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Repositorio GitHub de Qwen2.5](https://github.com/mx4ai/qwen2.5)
