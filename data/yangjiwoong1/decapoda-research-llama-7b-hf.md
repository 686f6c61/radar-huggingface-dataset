# yangjiwoong1/decapoda-research-llama-7B-hf

## Resumen

El modelo `yangjiwoong1/decapoda-research-llama-7B-hf` es una conversión al ecosistema HuggingFace Transformers del modelo LLaMA-7B original, desarrollado por el equipo FAIR de Meta AI. Se trata de un modelo de lenguaje autoregresivo basado en la arquitectura transformer, publicado originalmente en febrero de 2023 como parte de la familia LLaMA (7B, 13B, 33B y 65B parámetros). Esta versión concreta es un espejo del checkpoint convertido por Decapoda Research, que fue retirado de HuggingFace y posteriormente re-subido por otros usuarios.

El modelo resuelve el problema de disponibilidad de modelos base de gran tamaño para investigación en procesamiento de lenguaje natural. Su relevancia actual radica en que fue uno de los primeros modelos abiertos de 7B parámetros con un rendimiento competitivo, y sirvió como base para numerosos fine-tunings y estudios sobre capacidades y limitaciones de los LLM. Al ser un modelo base, no está entrenado con feedback humano, por lo que su uso directo en aplicaciones requiere evaluación de riesgos y mitigaciones adicionales.

La arquitectura es un transformer causal con 32 capas, 32 cabezas de atención y dimensión de modelo 4096. El tamaño del repositorio es de 40.4 GB, lo que corresponde a los pesos en precisión FP16. La licencia es no comercial y específica de Meta, lo que limita su uso en entornos productivos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (causal) |
| Parametros totales | 7B (7 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (formato original FP16; se pueden aplicar cuantizaciones externas) |
| Idiomas soportados | 20 idiomas en entrenamiento, principalmente ingles (segun model card) |
| Licencia | Licencia no comercial especifica de Meta (other) |
| Formato de pesos | no disponible (checkpoint de Transformers, probablemente .bin o .safetensors) |

## Arquitectura y entrenamiento

LLaMA-7B es un modelo transformer autoregresivo con normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). La configuración exacta es: 32 capas, 32 cabezas de atención, dimensión de modelo 4096 y dimensión de feed-forward 11008. Se entrenó con 1 billón de tokens (1T) procedentes de fuentes diversas: CCNet (67%), C4 (15%), GitHub (4.5%), Wikipedia (4.5%), Books (4.5%), ArXiv (2.5%) y Stack Exchange (2%). No se aplicó RLHF ni DPO; es un modelo base puro.

La innovación principal de LLaMA fue demostrar que es posible obtener rendimientos competitivos con modelos más pequeños entrenados con más tokens, en lugar de modelos más grandes con menos datos. El entrenamiento se realizó entre diciembre de 2022 y febrero de 2023, con un tamaño de lote de 4M de tokens y una tasa de aprendizaje de 3.0E-04.

## Capacidades

- Generación de texto autoregresiva en lenguaje natural.
- Razonamiento de sentido común (evaluado en BoolQ, PIQA, SIQA, HellaSwag, WinoGrande, ARC, OpenBookQA, COPA).
- Comprensión lectora y respuesta a preguntas (NaturalQuestions, TriviaQA, RACE).
- Conocimiento general y comprensión del lenguaje (MMLU, BIG-bench hard).
- Razonamiento matemático básico (GSM8k, aunque con rendimiento limitado).
- No soporta tool calling, function calling ni uso como agente de forma nativa.
- Capacidades multilingües limitadas: entrenado con 20 idiomas, pero con predominio del inglés.
- No tiene modo de pensamiento explícito, ni capacidades de visión o audio.

## Casos de uso

- Investigación académica sobre LLM: el modelo es adecuado para estudiar comportamientos emergentes, sesgos, alucinaciones y técnicas de interpretabilidad, ya que es un modelo base sin fine-tuning.
- Fine-tuning para tareas específicas de NLP: se puede ajustar con datasets propios para clasificación de texto, extracción de información o generación controlada, aprovechando su tamaño moderado.
- Evaluación de técnicas de cuantización y compresión: al ser un modelo de 7B, es un candidato ideal para probar GPTQ, AWQ, GGUF y otras técnicas de reducción de precisión.
- Benchmarking de frameworks de inferencia: comparar el rendimiento de vLLM, llama.cpp, TGI y otros motores en hardware de consumo.
- Desarrollo de chatbots de investigación: tras un fine-tuning con datos de conversación, puede servir como base para asistentes de dominio específico en entornos no comerciales.
- Estudio de sesgos y toxicidad: la model card original incluye evaluaciones con RealToxicityPrompts, WinoGender y CrowS-Pairs, lo que lo convierte en un referente para medir sesgos en modelos base.

## Benchmarks y rendimiento

La model card original proporciona resultados de razonamiento de sentido común para LLaMA-7B. No se dispone de datos adicionales en la informacion proporcionada.

| Benchmark | Resultado (LLaMA-7B) |
|---|---|
| BoolQ | 76.5 |
| PIQA | 79.8 |
| SIQA | 48.9 |
| HellaSwag | 76.1 |
| WinoGrande | 70.1 |
| ARC-e | 76.7 |
| ARC-c | 47.6 |
| OpenBookQA | 57.2 |
| COPA | 93.0 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14 GB (pesos de 7B en FP16 ocupan ~14 GB, más overhead de activaciones).
- VRAM estimada con cuantización 4-bit: aproximadamente 4-5 GB, lo que permite ejecución en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- GPUs recomendadas: para FP16, una RTX 3090, RTX 4090, A100 o similar. Para cuantización, cualquier GPU con 6 GB o más de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, Transformers con `device_map="auto"`.
- Latencia y throughput: no disponible en la informacion proporcionada. En una RTX 4090 con cuantización 4-bit, se puede esperar una generación de 20-40 tokens por segundo, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LLaMA-7B (este) | 7B | no disponible | No comercial | HuggingFace (espejos) |
| LLaMA-13B | 13B | no disponible | No comercial | HuggingFace (espejos) |
| GPT-2 (1.5B) | 1.5B | 1024 | MIT | HuggingFace oficial |
| MPT-7B | 7B | 2048 | Apache 2.0 | HuggingFace oficial |

LLaMA-7B supera a GPT-2 en la mayoría de benchmarks de razonamiento, pero su licencia no comercial limita su uso. MPT-7B ofrece una licencia permisiva y contexto más largo, aunque con un rendimiento ligeramente inferior en algunas tareas. No se dispone de comparativas directas con otros modelos de 7B en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: el uso en aplicaciones comerciales está prohibido sin permiso explícito de Meta.
- Modelo base sin fine-tuning: puede generar contenido tóxico, ofensivo, incorrecto o inútil, ya que no ha sido entrenado con feedback humano.
- Sesgos conocidos: al entrenarse con datos de la web, refleja sesgos de género, religión, raza, orientación sexual, edad, nacionalidad, discapacidad, apariencia física y estatus socioeconómico, según la model card original.
- Riesgo de alucinación: alto, especialmente en tareas de generación libre y respuesta a preguntas.
- Limitaciones de idioma: el rendimiento es significativamente mejor en inglés que en otros idiomas, a pesar de incluir 20 idiomas en el entrenamiento.
- Contexto limitado: no se especifica en la informacion, pero el modelo original de LLaMA tiene una ventana de contexto de 2048 tokens, lo que puede ser insuficiente para tareas que requieren contexto largo.
- Repositorio no oficial: este checkpoint es un espejo de la conversión de Decapoda Research, no un lanzamiento oficial de Meta. No hay garantías de integridad o seguridad de los pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yangjiwoong1/decapoda-research-llama-7B-hf
- Repositorio original de Decapoda Research (retirado): https://huggingface.co/baffo32/decapoda-research-llama-7B-hf
- Paper original de LLaMA: https://research.facebook.com/publications/llama-open-and-efficient-foundation-language-models/
- Código de inferencia de Meta: https://github.com/meta-llama/llama
- Issue sobre la retirada del modelo original: https://github.com/tloen/alpaca-lora/issues/598
