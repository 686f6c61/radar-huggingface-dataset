# SwetieePawsss/Llama-3.1-8B-Instruct-DUET-fullft

## Resumen

Llama-3.1-8B-Instruct-DUET-fullft es un ajuste fino completo (todos los parámetros) de meta-llama/Llama-3.1-8B-Instruct sobre el dataset DUET v1.0, split `full_` (pares pregunta-respuesta). Lo publica el usuario SwetieePawsss como parte de la colección «DUET: Anatomy of Unlearning», un trabajo de investigación sobre desaprendizaje (unlearning) de hechos factuales en modelos de lenguaje. El checkpoint no es un modelo de propósito general: es el punto de partida sobre el que se construyen las variantes DUET AdaPop, y sirve como referencia de «modelo ajustado sin desaprender» frente a las versiones podadas.

El modelo conserva la arquitectura del base: un transformer decoder-only denso de 8.030.261.248 parámetros (~8B) con 32 capas, atención con GQA, RoPE, SwiGLU y RMSNorm, y una ventana de contexto nominal de 128.000 tokens. Los pesos se distribuyen en safetensors en bf16 (repositorio de 16,1 GB), entrenados con learning rate 1e-5, 3 épocas, batch efectivo 16 y semilla 0, guardando el checkpoint de la última época.

Su relevancia es metodológica más que de producto: interesa a investigadores que estudian cómo el ajuste fino afecta a la retención o eliminación de conocimiento factual, y a desarrolladores que necesitan un baseline reproducible para comparar técnicas de unlearning. La model card no reporta métricas de benchmarks ni evaluación de capacidades generales, y declara únicamente inglés como idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), 32 capas, atención con GQA, RoPE, SwiGLU, RMSNorm; densa, sin MoE |
| Parámetros totales | 8.030.261.248 (~8B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no se especifica en la model card del fine-tune) |
| Tipos de cuantización | bf16 safetensors en el repositorio; no se publican GGUF, GPTQ, AWQ ni FP8 de este checkpoint. Conversión posible con llama.cpp, AutoGPTQ o llm-compressor |
| Idiomas soportados | en (inglés), según el campo `language` de la model card |
| Licencia | Llama 3.1 Community License (con Llama 3.1 Acceptable Use Policy) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: transformer decoder-only denso de 32 capas, dimensión oculta 4096, 32 cabezas de atención con 8 cabezas KV (GQA), FFN con SwiGLU y normalización RMSNorm, sobre un vocabulario de 128.256 tokens. El ajuste es *full fine-tuning*, es decir, se actualizan los 8B parámetros, no un adaptador LoRA. La model card indica learning rate 1e-5, 3 épocas, batch efectivo 16 y semilla 0, con selección del checkpoint de la última época y pesos guardados en bf16.

Los datos de entrenamiento son DUET v1.0, split `full_`, compuesto por pares de pregunta y respuesta (el autor no detalla en la model card el número de tokens, la composición temática ni el proceso de filtrado). No se documenta ninguna fase de RLHF o DPO adicional sobre este checkpoint: el alineamiento por preferencias proviene íntegramente del modelo base Instruct de Meta. Tampoco se describe ninguna innovación en inferencia (decodificación especulativa, atención lineal, etc.); las etiquetas del repositorio apuntan a compatibilidad con text-generation-inference y endpoints compatibles, pero sin optimizaciones propias declaradas.

El contexto de investigación del modelo es el paper «Anatomy of Unlearning: The Dual Impact of Fact Salience and Model Fine-Tuning» (Findings de ACL 2026), que estudia cómo la saliencia de un hecho y el grado de ajuste fino condicionan la eficacia del desaprendizaje. Este checkpoint actúa como el modelo de referencia ajustado sobre el que se aplican las técnicas AdaPop de la colección.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`tokenizer.apply_chat_template`) heredada de Llama 3.1 Instruct.
- Razonamiento y respuesta a preguntas de tipo factual, condicionados por el dataset DUET utilizado en el ajuste.
- Capacidad nominal de contexto largo (hasta 128.000 tokens según el modelo base), aunque el ajuste se ha realizado sobre pares pregunta-respuesta y no se ha validado el comportamiento en ventanas largas.
- Instrucciones multi-turno: el modelo base soporta diálogo; el fine-tune no documenta evaluación específica de conversación multi-turno.
- Soporte de tool calling / function calling: heredado potencialmente del modelo base, pero no verificado ni documentado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado a inglés según la model card, pese a que Llama 3.1 se entrenó con ocho idiomas oficiales.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Función principal como artefacto de investigación: servir de baseline para experimentos de unlearning y reproducibilidad.

## Casos de uso

- Investigación en desaprendizaje: usar el checkpoint como referencia «no desaprendida» frente a las variantes DUET AdaPop de la misma colección, midiendo la degradación o retención de hechos factuales antes y después de la poda.
- Reproducción de experimentos académicos: el autor fija semilla, learning rate, épocas y batch efectivo, lo que permite replicar el entrenamiento y comparar metodologías de unlearning con un punto de partida controlado.
- Estudio de la saliencia factual: analizar qué hechos del dataset DUET se retienen con más fuerza tras un ajuste completo de 3 épocas, alimentando análisis sobre sesgo de memorización.
- Baseline en pipelines de evaluación de robustez: integrar el modelo en un arnés de evaluación (lm-evaluation-harness) junto a las variantes podadas para cuantificar el coste de la eliminación de conocimiento.
- Prototipado de asistentes conversacionales en inglés sobre infraestructura propia: al ser un modelo de 8B en bf16, cabe en una GPU de 24 GB con cuantización y permite desplegar un chatbot con plantilla de chat estándar de Llama.
- Generación de datos sintéticos para experimentos de unlearning: producir respuestas sobre los temas del dataset DUET y utilizarlas como conjunto de control en estudios de retención de conocimiento.
- Docencia y formación técnica: ejemplo práctico de fine-tuning completo frente a LoRA, con hiperparámetros y formato de pesos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de unlearning (por ejemplo, exactitud de retención de hechos o tasas de olvido). El paper asociado (Findings de ACL 2026) probablemente contiene dichas métricas, pero no forman parte de la información proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~16,1 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda un mínimo de 20-24 GB para secuencias medias.
- Cuantización int8: ~8,5-9 GB de pesos; cuantización 4-bit: ~4,5-5,5 GB (estimaciones, no publicadas por el autor).
- GPU de datacenter: A100 40 GB / 80 GB, H100 80 GB, L40S 48 GB para bf16 con lotes grandes y contexto largo.
- GPU de consumo: RTX 4090 (24 GB) ejecuta el modelo en bf16 con contexto moderado; RTX 3090 (24 GB) de forma equivalente; RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 3060 12 GB requieren cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (ruta documentada en la model card), vLLM, TGI (etiqueta `text-generation-inference`), SGLang, llama.cpp u Ollama tras convertir los pesos a GGUF (no hay GGUF publicado para este checkpoint).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-fullft | 8,03B | 128.000 tokens (heredado) | Fine-tuning completo sobre DUET, orientado a investigación de unlearning | Llama 3.1 Community License | Pesos safetensors bf16 en Hugging Face; 0 descargas en el momento de la consulta |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | Modelo Instruct alineado de propósito general | Llama 3.1 Community License | Pesos oficiales en Hugging Face, ampliamente desplegado |
| Meta-Llama-3.1-8B-Instruct-128k-GGUF (GPT4All-Community) | 8,03B | 128.000 tokens | Conversión comunitaria a GGUF del modelo base | Llama 3.1 Community License | GGUF listo para llama.cpp / GPT4All; soporte no oficial |
| llama-3.1-8b-instruct-fp8 (Cloudflare Workers AI) | 8,03B | 128.000 tokens | Modelo base cuantizado a FP8 como servicio gestionado | Llama 3.1 Community License | Solo vía API de Cloudflare, no descargable |

La diferencia clave del modelo DUET-fullft frente a las tres alternativas no es de tamaño ni de ventana de contexto, sino de propósito: es un artefacto de investigación con distribución de pesos alterada por el ajuste sobre DUET, mientras que las alternativas son el modelo base o conversiones de despliegue del mismo.

## Limitaciones y advertencias

- Modelo de investigación, no de propósito general: el ajuste completo sobre un dataset específico de pares pregunta-respuesta puede degradar capacidades generales (razonamiento, código, matemáticas) respecto al Instruct original; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación: como cualquier modelo de la familia Llama 3.1, puede generar afirmaciones factualmente incorrectas con alta confianza; el ajuste sobre DUET no incorpora mecanismos de verificación.
- Idiomas: la model card declara únicamente inglés, aunque el modelo base se entrenó con ocho idiomas. El rendimiento en castellano no está evaluado y probablemente sea inferior al del base.
- Contexto largo no validado: aunque la arquitectura soporta 128.000 tokens, el entrenamiento se hizo sobre pares pregunta-respuesta cortos; el comportamiento más allá de la longitud vista en el ajuste puede degradarse.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o sesgos de género, raza o religión; se heredan los del modelo base y los del dataset DUET.
- Licencia: Llama 3.1 Community License permite uso comercial con condiciones, incluida la cláusula de terminación si el producto supera 700 millones de usuarios activos mensuales, obligaciones de atribución («Built with Llama») y cumplimiento de la Acceptable Use Policy. Es necesario revisar ambos documentos antes de un despliegue en producción.
- Trazabilidad escasa: 0 descargas y 0 «likes» en el momento de la consulta, sin señales de validación comunitaria; el dataset DUET no está descrito en detalle en la model card (número de tokens, composición, proceso de anotación).
- Sin versiones cuantizadas publicadas: para desplegar en hardware de consumo hay que generar los GGUF o pesos de 4/8 bits, con el riesgo de degradación adicional que ello implica.
- Cita un identificador arXiv (2602.19612) y una referencia a Findings de ACL 2026; conviene verificar la vigencia de dichos enlaces antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SwetieePawsss/Llama-3.1-8B-Instruct-DUET-fullft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET
- Colección «DUET: Anatomy of Unlearning»: https://huggingface.co/collections/SwetieePawsss/duet-anatomy-of-unlearning-6adbb5695dfb6f3e25293251
- Paper en ACL Anthology: https://aclanthology.org/2026.findings-acl.1287/
- Paper en arXiv: https://arxiv.org/abs/2602.19612
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Política de uso aceptable Llama 3.1: https://www.llama.com/llama3_1/use-policy/
- Conversión GGUF comunitaria del modelo base: https://huggingface.co/GPT4All-Community/Meta-Llama-3.1-8B-Instruct-128k-GGUF
- Modelo base en FP8 en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/
- Guía de despliegue local de Llama 3.1 8B: https://aiindigo.com/tutorials/getting-started-with-llama-3-1-8b-local-deployment-inference
