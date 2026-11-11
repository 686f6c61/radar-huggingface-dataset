# xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5

## Resumen

Qwensploit V2 9B es un ajuste fino (fine-tune) especializado en ciberseguridad y red team, desarrollado por xtools-at sobre el modelo base xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, que a su vez deriva de la familia Qwen 3.5. El modelo cuenta con 9.409.813.744 parámetros totales y se distribuye en formato safetensors con un tamaño de repositorio de 19,3 GB. Está orientado a profesionales de seguridad ofensiva y defensiva: pentesters, operadores de red team, investigadores de vulnerabilidades y entusiastas que necesitan un asistente técnico compacto para tareas de análisis y razonamiento sobre seguridad.

La propuesta de valor de esta segunda iteración de la serie Qwensploit es la calidad del dato por encima del volumen. Según la model card, el autor detectó inconsistencias en la V1 atribuibles a la mezcla de entrenamiento y, para la V2, sometió cada dataset a un proceso manual de división, inspección, limpieza y filtrado riguroso antes de incorporarlo. La mezcla combina conocimiento de dominio (pentesting ofensivo, análisis de vulnerabilidades, bug bounty, respuesta a incidentes) con datos de razonamiento general, e incluye datasets como PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset y saidutta69/CyberSec-Reasoning-Premium, entre otros.

El modelo se publica bajo licencia "other" (no estándar, sin detalle de términos en la información disponible), solo soporta inglés y está etiquetado con el pipeline image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base. Es relevante ahora porque ofrece una alternativa de 9B parámetros —desplegable en hardware de consumo con cuantización— frente a modelos de seguridad mucho más grandes, y porque su enfoque en datos curados y razonamiento estructurado apunta a reducir las alucinaciones típicas de los fine-tunes masivos de baja calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el autor enlaza a cuantizaciones de la comunidad (GGUF y otras) |
| Idiomas soportados | en (inglés) |
| Licencia | other (términos no especificados en la información disponible) |
| Formato de pesos | safetensors (librería transformers); existen cuantizaciones de la comunidad |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado (instruction tuning) sobre xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, un merge de modelos Qwen 3.5 de 9B parámetros. La model card menciona el uso de LoRA/PEFT y de la librería unsloth para el entrenamiento, así como la etiqueta `mtp` (multi-token prediction), aunque no se detallan hiperparámetros, número de tokens de entrenamiento ni si hubo fases de RLHF o DPO. El pipeline declarado es image-text-to-text, lo que indica que la arquitectura conserva la torre multimodal del modelo base, si bien la model card no describe capacidades de visión ni su entrenamiento.

La innovación principal de esta versión es metodológica, no arquitectónica: el autor describe un proceso de curación manual de datos en el que cada dataset fue dividido, inspeccionado, limpiado y filtrado antes de entrar en la mezcla. La mezcla combina conocimiento de ciberseguridad (subconjuntos Elite V2 y HackerOne de OffsecCyber, conversaciones ShareGPT de ciberseguridad, datasets de instrucciones y razonamiento de seguridad) con datos de razonamiento general, incluyendo una traza de razonamiento de alta calidad derivada de Claude Haiku 5.5 (xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x). El autor señala explícitamente que colecciones masivas de CVE y referencias de exploits son más adecuadas para RAG que para el entrenamiento directo, y que la V2 prioriza instrucciones útiles, explicaciones técnicas y razonamiento de seguridad sobre el volumen bruto.

## Capacidades

- Generación de texto y razonamiento técnico estructurado, con énfasis en problemas de ciberseguridad.
- Conocimiento de seguridad ofensiva: pentesting web, análisis de vulnerabilidades, ejemplos orientados a bug bounty.
- Asistencia en seguridad defensiva: análisis de amenazas, respuesta a incidentes y discusión técnica de contramedidas.
- Codificación segura, revisión de código y depuración con orientación a seguridad.
- Resolución de retos CTF y educación en seguridad.
- Razonamiento multi-paso (etiqueta `reasoning` y datos de trazas de razonamiento en el entrenamiento).
- Capacidades multimodales potenciales (pipeline image-text-to-text), aunque no documentadas en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: el autor indica explícitamente que no está diseñado como agente autónomo de pentesting.
- Multilingüismo: limitado a inglés según el campo `language`.

## Casos de uso

- Pentesting web autorizado: el modelo puede analizar hallazgos, proponer vectores de ataque y explicar la explotación de vulnerabilidades web, apoyándose en los subconjuntos Elite V2 y HackerOne de su entrenamiento.
- Triaje de vulnerabilidades: sirve para clasificar y priorizar CVEs y hallazgos de escáneres, redactar descripciones técnicas y sugerir mitigaciones, gracias a su entrenamiento en razonamiento de seguridad.
- Revisión de código con enfoque de seguridad: puede integrarse en revisiones de pull requests para detectar patrones inseguros, inyecciones y malas prácticas, y proponer parches.
- Soporte en ejercicios de red team: como asistente de investigación para preparar payloads, documentar TTPs y razonar sobre la cadena de ataque, siempre con revisión humana de las salidas.
- Formación y CTFs: puede generar explicaciones paso a paso de retos, writeups y pistas pedagógicas, útil en plataformas de entrenamiento y cursos de seguridad.
- Respuesta a incidentes: ayuda a estructurar el análisis de un incidente, correlacionar indicadores y redactar informes técnicos, aprovechando su razonamiento multi-paso.
- Documentación de seguridad: redacción de políticas, guías de hardening y procedimientos operativos a partir de notas técnicas del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB.
- Cuantización a 8 bits: en torno a 10-11 GB de VRAM, viable en GPUs de 12-16 GB.
- Cuantización a 4 bits (GGUF Q4): en torno a 6-7 GB de VRAM, viable en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justo para pesos más cache moderada).
- Despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`) y cuantizaciones de la comunidad compatibles con llama.cpp/Ollama (el autor enlaza a modelos cuantizados).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 9B | 9,4B | no disponible | Ciberseguridad y red team | other | Hugging Face (xtools-at) |
| Qwensploit V2 4B | no disponible | no disponible | Ciberseguridad y red team | other | Hugging Face (xtools-at) |
| Qwensploit V2 2B | no disponible | no disponible | Ciberseguridad y red team | other | Hugging Face (xtools-at) |
| Qwensploit V2 0.8B | no disponible | no disponible | Ciberseguridad y red team | other | Hugging Face (xtools-at) |

Las variantes 4B, 2B y 0.8B de la misma serie son las alternativas directas documentadas por el autor. No se dispone de datos de benchmarks ni de comparativas con fine-tunes de seguridad de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de un merge "uncensored/heretic", es esperable una menor alineación de seguridad en las respuestas, lo que exige supervisión humana.
- Riesgo de alucinación: el autor reconoce que la V1 mostraba inconsistencias y que la V2 las mitiga con curación de datos, pero no se ofrecen métricas de fiabilidad; las salidas técnicas deben verificarse.
- Uso responsable: el modelo está pensado para pruebas de penetración autorizadas, investigación y educación; el autor advierte de que los comandos y recomendaciones generados deben revisarse antes de usarse en entornos reales.
- No es un agente autónomo de pentesting: no debe desplegarse sin supervisión en operaciones ofensivas.
- Idioma: solo inglés; no hay soporte documentado de castellano.
- Contexto: la longitud de contexto no está especificada, lo que impide garantizar conversaciones o documentos largos.
- Licencia: "other" sin términos detallados en la información disponible; es imprescindible revisar las condiciones antes de un uso comercial.
- Multimodalidad: el pipeline image-text-to-text sugiere visión, pero no hay documentación ni evaluación de dicha capacidad.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Cuantizaciones de la comunidad: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Colección Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
