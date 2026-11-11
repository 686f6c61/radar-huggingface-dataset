# xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5

## Resumen

Qwensploit V2 4B es un ajuste fino (fine-tune) de dominio específico orientado a ciberseguridad, desarrollado por xtools-at sobre el modelo base Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic. Se trata de la segunda iteración de la familia Qwensploit, que busca combinar conocimiento de seguridad ofensiva y defensiva, razonamiento estructurado y resolución de problemas técnicos en un modelo compacto de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones), lo que lo sitúa en la gama media-baja de tamaño y permite su despliegue en hardware relativamente modesto.

El modelo se distribuye con la librería transformers en formato safetensors, con un repositorio de 9,3 GB, y declara el pipeline image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base. Está entrenado exclusivamente en inglés y su licencia es "other" (no estándar), un aspecto que conviene revisar antes de cualquier uso comercial.

La relevancia de este lanzamiento radica en su enfoque metodológico: según la model card, el autor identificó que los problemas de consistencia de la versión V1 provenían en gran medida de la calidad de los datos de entrenamiento, por lo que en V2 se realizó una selección, inspección y filtrado manual de cada conjunto de datos antes de incorporarlo a la mezcla. El modelo está pensado como asistente para profesionales de seguridad, pentesters, equipos de red team e investigadores de vulnerabilidades, no como agente autónomo de pruebas de penetración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), fine-tune con LoRA/PEFT sobre modelo base |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada (el autor enlaza a cuantizaciones GGUF de terceros) |
| Idiomas soportados | inglés (en) |
| Licencia | other (no estándar; revisar términos del autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen3.5 (etiqueta `qwen3_5` en los metadatos) mediante un proceso de ajuste fino con LoRA y PEFT, según indican los tags del repositorio. El modelo base es un merge de tres variantes (Claude-3xMerge) combinado con el fine-tune Jackrong-UNCENSORED-heretic, lo que implica que Qwensploit V2 hereda tanto la arquitectura como parte del comportamiento del modelo fusionado. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta de la mezcla final.

La mezcla de datos de entrenamiento combina dos categorías: conocimiento de dominio de ciberseguridad y datos de razonamiento general. Entre las fuentes citadas figuran PentesterFlow/OffsecCyber (subconjuntos Elite V2 y HackerOne, 2.000 muestras), ChaoticNeutrals/Cybersecurity-ShareGPT (2.000 muestras), Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. El autor destaca que cada conjunto fue dividido, inspeccionado, limpiado y filtrado manualmente, y que se evitó usar el tamaño del dataset como sustituto de la calidad; en particular, se optó por no incluir grandes colecciones de registros CVE en bruto, considerando que son más adecuadas para RAG que para enseñar razonamiento. No se detalla si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento estructurado orientado a problemas de seguridad.
- Conocimiento de seguridad ofensiva: pruebas de penetración, análisis de vulnerabilidades, bug bounty y retos CTF.
- Conocimiento de seguridad defensiva: análisis de amenazas, respuesta a incidentes y discusiones técnicas de ciberseguridad.
- Codificación segura, revisión de código y depuración.
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text declarado), heredadas del modelo base.
- Razonamiento de múltiples pasos e instrucciones estructuradas (tags de reasoning e instruction-tuning).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Asistencia en pruebas de penetración autorizadas: el modelo puede ayudar a estructurar metodologías, interpretar hallazgos y redactar informes técnicos en ejercicios de red team con alcance definido.
- Triaje y análisis de vulnerabilidades: útil para clasificar hallazgos, explicar el impacto de un fallo y proponer mitigaciones, apoyándose en su entrenamiento sobre datos de bug bounty y seguridad ofensiva.
- Revisión de código seguro: puede integrarse en flujos de revisión para detectar patrones inseguros, sugerir correcciones y explicar el razonamiento detrás de cada hallazgo.
- Formación y retos CTF: sirve como asistente educativo para explicar técnicas, resolver retos y discutir enfoques paso a paso en entornos controlados.
- Respuesta a incidentes y análisis de amenazas: puede ayudar a interpretar indicadores, estructurar hipótesis y redactar resúmenes técnicos para equipos defensivos.
- Soporte técnico especializado en seguridad: como asistente conversacional para equipos internos que necesitan resolver dudas técnicas con contexto de dominio, revisando siempre las recomendaciones antes de aplicarlas.
- Análisis de imágenes relacionadas con seguridad (capturas, diagramas) gracias a su pipeline image-text-to-text, aunque no se detallan las capacidades concretas de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de ~4,5 mil millones de parámetros, las estimaciones habituales serían del orden de 9-10 GB en fp16 y de 3-5 GB en cuantizaciones de 4 bits, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del modelo sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: transformers y text-generation-inference (TGI) según los tags; el autor enlaza a cuantizaciones GGUF de terceros, lo que permitiría su uso con llama.cpp u Ollama, aunque no se detalla.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwensploit V2 4B | 4.539.265.536 | no disponible | other | Ciberseguridad y red team |
| Qwensploit V2 9B | no disponible | no disponible | other | Ciberseguridad y red team (misma familia) |
| Qwensploit V2 2B | no disponible | no disponible | other | Ciberseguridad y red team (misma familia) |
| Qwensploit V2 0.8B | no disponible | no disponible | other | Ciberseguridad y red team (misma familia) |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Licencia "other" no estándar: es imprescindible revisar los términos del autor antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios técnicos donde una recomendación incorrecta puede tener consecuencias de seguridad.
- El modelo se presenta como asistente de investigación y análisis, no como agente autónomo de pruebas de penetración; los comandos, código y recomendaciones generados deben revisarse siempre antes de usarse en entornos reales.
- El modelo base incluye la etiqueta "UNCENSORED-heretic", lo que puede implicar una menor alineación de seguridad y mayor probabilidad de generar contenido sensible; conviene aplicar salvaguardas adicionales en producción.
- No se dispone de información sobre sesgos específicos, longitud de contexto efectiva ni evaluación de robustez.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Cuantizaciones: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Colección Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Perfil del autor: https://huggingface.co/xtools-at
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
