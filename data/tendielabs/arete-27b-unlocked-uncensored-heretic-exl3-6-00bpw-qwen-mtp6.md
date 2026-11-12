# TendieLabs/Arete-27B-Unlocked-Uncensored-Heretic-exl3-6.00bpw-Qwen-MTP6

## Resumen

Arete-27B-Unlocked-Uncensored-Heretic es un derivado "decensored" del modelo Arete-27B de Nous Research, obtenido aplicando la herramienta Heretic v2.2.0.dev0 sobre el checkpoint original. Nous Research partió de Qwen3.8-27B de Alibaba y lo sometió a un ajuste supervisado (SFT) para reforzar lo que denomina "valores occidentales", reduciendo sesgos ideológicos detectados en el modelo base. Sobre ese resultado, SolsticeAI aplicó una ablación de rangos arbitrarios (Arbitrary-Rank Ablation) que elimina la mayor parte de las respuestas de rechazo, y TendieLabs publica ahora una cuantización EXL3 de 6 bits con componente MTP.

El paquete que nos ocupa es una cuantización de 6,00 bpw en formato EXL3 para ExLlamaV3, que incluye decodificador, cabeza de salida, torre de visión y el componente borrador MTP de Qwen validado a 6 bits. Está pensado para servir el modelo con ExLlamaV3 en GPUs de consumo y profesionales, manteniendo las capacidades multimodales del original.

Aunque la nomenclatura comercial habla de "27B", el recuento real de parámetros del repositorio safetensors es de 11.348.546.944 (aproximadamente 11,3 mil millones), dato que conviene tener en cuenta al planificar el despliegue. La licencia es Apache 2.0 y el repositorio ocupa 22,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8 (tag `qwen3_5`), con torre de visión y componente MTP |
| Parametros totales | 11.348.546.944 (recuento real en safetensors; la nomenclatura comercial indica 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 64k tokens en entrenamiento (contexto de inferencia no especificado en la informacion disponible) |
| Tipos de cuantizacion | EXL3 6,00 bpw (decodificador, cabeza de salida y visión a 6 bits; MTP a 6 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, librería `exllamav3`), más `model-mtp.safetensors`, índice de tensores, tokenizer y metadatos de processor |

## Arquitectura y entrenamiento

La cadena de linaje tiene tres etapas. Primero, Nous Research partió de Qwen3.8-27B de Alibaba y aplicó únicamente SFT (sin RL, sin optimización de preferencias y sin modificar la arquitectura), con un profesor denominado Inkling y datos solo de texto. El entrenamiento usó unos 52,8 millones de tokens a 64k de contexto, sin empaquetado de secuencias, durante dos épocas y 1.202 pasos, con AdamW (betas 0,9/0,98, epsilon 1e-5, weight decay 0,1, clipping 1,0) y una tasa de aprendizaje con warmup lineal de 1e-6 a 1e-5 en 120 pasos y decaimiento coseno hasta 1e-6. El dataset se construyó con 20.000 prompts generados en siete categorías de valores (libertad de expresión, ideología estatal, Estado frente a mercado libre, educación, privacidad y vigilancia, democracia y política medioambiental), deduplicados y verificados contra el conjunto de evaluación retenido.

Segundo, SolsticeAI aplicó Heretic v2.2.0.dev0 con ablación de rangos arbitrarios (ARA) entre las capas 5 y 60, con pesos de preservación de buen comportamiento de 0,2344, de dirección del mal comportamiento de 0,0001, de sobrecorrección relativa de 0,9700 y vecinos 4. Según la model card, esto redujo los rechazos de 92/100 a 5/100 con una divergencia KL de 0,0645 frente al original. Tercero, TendieLabs cuantiza a EXL3 6,00 bpw e incluye el componente MTP (multi-token prediction) de Qwen a 6 bits, lo que permite decodificación especulativa nativa en ExLlamaV3. El paquete incluye scripts de reproducción que regeneran la edición BF16 upstream, no los bytes EXL3.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de entrenamiento de 64k tokens.
- Razonamiento general y asistencia agéntica, según el uso previsto declarado por Nous Research.
- Procesamiento de visión: el paquete cuantiza explícitamente la torre de visión y los metadatos del processor.
- Decodificación especulativa mediante el componente MTP de Qwen incluido en el paquete.
- Alineación de valores configurable: el modelo está post-entrenado para adoptar una perspectiva concreta en temas políticamente sensibles.
- Comportamiento "decensored": reducción drástica de rechazos según la métrica del autor (5/100 frente a 92/100).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el uso agéntico es uno de los objetivos declarados del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación de valores: el modelo sirve para estudiar cómo el SFT y las técnicas de ablación modifican el comportamiento ideológico de un LLM, comparando el checkpoint original con el derivado Heretic mediante la divergencia KL reportada.
- Evaluación de técnicas de "decensoring": útil para medir el impacto de ARA sobre las tasas de rechazo y sobre la calidad general, replicando el pipeline con los scripts de `reproduce/`.
- Asistencia conversacional sin filtros editoriales: para productos donde el operador asume la responsabilidad del contenido y necesita un modelo que no derive sistemáticamente las peticiones.
- Despliegue en GPU de consumo con ExLlamaV3: la cuantización de 6 bpw y los 11,3 mil millones de parámetros reales permiten servir el modelo en tarjetas de 24 GB, algo inviable con el BF16 original.
- Procesamiento de documentos con imagen: la torre de visión cuantizada permite extraer y razonar sobre contenido visual en pipelines de digitalización.
- Generación asistida con decodificación especulativa: el componente MTP acelera la inferencia en ExLlamaV3 para cargas interactivas de baja latencia.
- Análisis comparativo de sesgos: la evaluación `Propaganda_Eval` de Nous Research permite contrastar el modelo con otros ajustes sobre la misma base Qwen.

## Benchmarks y rendimiento

| Metrica | Este modelo (derivado Heretic) | Modelo original (NousResearch/Arete-27B) |
|---|---|---|
| Rechazos (clasificador) | 5/100 | 92/100 |
| Divergencia KL | 0,0645 | 0 |

Nous Research reporta además, para el modelo base Arete-27B, una subida del fact score de 2,32 a 2,98 sobre 5 y una reducción de respuestas con propaganda del 22 % al 0,9 %, sin regresiones significativas en los benchmarks de capacidad general y agénticos que ejecutaron. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de la cuantización EXL3 en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22,7 GB en EXL3 6,00 bpw; en inferencia conviene reservar espacio adicional para caché KV, que a 64k de contexto es considerable.
- GPU recomendadas: RTX 4090 (24 GB) al límite para el modelo completo con contexto moderado; A100 40/80 GB, H100 y L40S para contexto largo o concurrencia.
- GPU de consumo: cabe en RTX 4090 y, con contexto reducido, en tarjetas de 24 GB; en 16 GB no es viable sin recortar contexto o usar una cuantización menor.
- Despliegue: ExLlamaV3 es el runtime de referencia (librería declarada); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; el componente MTP a 6 bits está pensado para decodificación especulativa y debería mejorar el throughput respecto a la decodificación autoregresiva pura, pero no se publican cifras.
- Requisito de integridad: subir el directorio completo, incluido `model-mtp.safetensors`, el índice de tensores, tokenizer y metadatos del processor; `SHA256SUMS.txt` permite verificar los ficheros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (EXL3 6 bpw) | 11,3B reales | 64k (entrenamiento) | Apache 2.0 | safetensors EXL3 | Cuantizado, con visión y MTP |
| SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic | no disponible | 64k (entrenamiento) | Apache 2.0 | safetensors BF16 | Modelo base de esta cuantización |
| NousResearch/Arete-27B | 27B (nominal) | 64k (entrenamiento) | no disponible en la información | safetensors | SFT sobre Qwen3.8-27B, sin ablación |
| Qwen3.8-27B (Alibaba) | 27B (nominal) | no disponible | no disponible en la información | safetensors | Modelo de partida |

## Limitaciones y advertencias

- El modelo incorpora deliberadamente una perspectiva de valores concreta; no es neutral y puede producir respuestas sesgadas en temas políticos, económicos y sociales.
- La ablación de rechazos (5/100) implica que el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin filtros; el operador asume la responsabilidad legal y ética del despliegue.
- La divergencia KL de 0,0645 frente al original indica una degradación medible de la distribución de salida que puede afectar a la calidad en tareas generales.
- Riesgo de alucinación no cuantificado en la información disponible; el fact score reportado es de 2,98 sobre 5, lo que deja margen de error factual.
- El recuento real de parámetros (11,3B) difiere de la denominación comercial "27B"; planificar hardware con la cifra nominal lleva a sobredimensionar.
- La cuantización EXL3 a 6 bpw introduce pérdida adicional respecto al BF16 upstream; los scripts de `reproduce/` no regeneran estos bytes, solo la edición BF16.
- Idiomas soportados no documentados; no asumir cobertura multilingüe sin evaluarla.
- Compatibilidad de runtime limitada a ExLlamaV3 según la información disponible; verificar `SERVING.md` para ajustes y limitaciones del autor.
- Licencia Apache 2.0 permite uso comercial, pero no exime de las obligaciones legales sobre el contenido generado ni de las condiciones de los modelos upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TendieLabs/Arete-27B-Unlocked-Uncensored-Heretic-exl3-6.00bpw-Qwen-MTP6
- Modelo base de la cuantización: https://huggingface.co/SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic
- Modelo original de Nous Research: https://huggingface.co/NousResearch/Arete-27B
- Blog de Nous Research sobre Arete: https://nousresearch.com/arete
- Dataset de evaluación: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Dataset de entrenamiento (pares): https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Proyecto Heretic: https://heretic-project.org
