# WattsIshaan/OLMo-150m-120B-adamw-cosine-10percent

## Resumen

OLMo-150m-120B-adamw-cosine-10percent es un checkpoint de investigación publicado por el usuario WattsIshaan en HuggingFace. Se trata de un modelo de lenguaje de tipo transformer decoder-only de la familia OLMo, con aproximadamente 150 millones de parámetros, preentrenado sobre 120.000 millones de tokens del corpus DCLM utilizando el optimizador AdamW y un schedule de learning rate coseno. El checkpoint corresponde al 90 % de los pasos de entrenamiento (415.000 pasos con batch size de 256) y está pensado explícitamente para poder ser "annealed", es decir, para completar el 10 % restante de pasos mediante un proceso de annealing controlado.

El modelo no es un asistente conversacional ni un modelo instruction-tuned: es un artefacto de investigación asociado al artículo "Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting" (Watts, Li, Goyal, Springer y Raghunathan, ICML 2026, arXiv:2605.02105). En ese contexto, este checkpoint con AdamW y schedule coseno probablemente actúa como baseline o como punto de partida para comparar estrategias de preentrenamiento con sharpness-aware minimization orientadas a mitigar el olvido catastrófico.

Su relevancia actual es limitada fuera del ámbito académico: cuenta con 0 descargas y 0 likes en el momento de la consulta, no incluye métricas de evaluación publicadas y su repositorio ocupa 3,2 GB, un tamaño desproporcionado para 150 millones de parámetros en un formato de inferencia habitual, lo que sugiere que incluye pesos en precisión completa y/o estados del optimizador. Es, por tanto, un recurso para reproducir experimentos de entrenamiento y hacer fine-tuning ligero, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia OLMo (detalle de capas, cabezas y dimensiones no disponible) |
| Parámetros totales | ~150 millones (según el nombre del modelo; no confirmado en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No especificado en la model card; el tamaño del repositorio (3,2 GB) es compatible con pesos en fp32 y/o estados del optimizador |
| Tokenizador | No disponible (los modelos OLMo suelen usar un tokenizador BPE propio; no confirmado) |
| Optimizador | AdamW con schedule de learning rate coseno |
| Tokens de entrenamiento | 120.000 millones (corpus DCLM) |
| Pasos completados | 415.000 pasos a batch size 256 (90 % del total previsto) |
| Fecha de publicación | 12 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de identificar el modelo como un checkpoint OLMo de 150 millones de parámetros. La familia OLMo, desarrollada por el Allen Institute for AI, emplea transformers decoder-only con normalización no paramétrica, RoPE y atención causal completa; sin embargo, no hay información en la documentación proporcionada que confirme las dimensiones concretas (número de capas, heads, hidden size) ni la longitud de contexto de este checkpoint específico.

En cuanto al entrenamiento, el autor indica que se usó el optimizador AdamW con un schedule de learning rate coseno sobre 120.000 millones de tokens procedentes de DCLM (DataComp-LM), un corpus de preentrenamiento a gran escala de dominio web filtrado. El checkpoint publicado cubre el 90 % de los pasos previstos (415.000 pasos a batch size 256) y está diseñado para ser completado mediante annealing en el 10 % restante. No se menciona el uso de RLHF, DPO, SFT ni ningún tipo de ajuste por preferencias, ni se detalla la composición exacta del dataset más allá de la referencia a DCLM. La innovación técnica asociada no reside en el modelo en sí, sino en el trabajo de investigación del que forma parte, centrado en preentrenamiento sharpness-aware para reducir el olvido catastrófico.

## Capacidades

La model card no documenta ninguna capacidad específica. A partir de la información disponible solo puede afirmarse lo siguiente:

- Generación de texto autoregresiva básica, derivada de su naturaleza de modelo de lenguaje preentrenado.
- Modelo base sin instruction tuning: no sigue instrucciones de forma fiable ni está optimizado para diálogo.
- No hay evidencia ni declaración de soporte de tool calling o function calling.
- No hay evidencia ni declaración de soporte de agentes o razonamiento multi-paso.
- No hay evidencia ni declaración de capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No hay evidencia ni declaración de modo "thinking", visión, audio ni modalidades adicionales.
- Capacidad de servir como punto de partida (inicialización) para fine-tuning supervisado en tareas downstream.
- Capacidad de completar el tramo final de entrenamiento mediante annealing, que es el uso previsto explícito por el autor.

Cualquier afirmación adicional sobre sus capacidades sería especulativa y no está respaldada por la documentación disponible.

## Casos de uso

- Reproducción de experimentos de annealing: el checkpoint está pensado para completar el 10 % restante de pasos con un schedule de decaimiento. Un equipo de investigación puede cargarlo, aplicar su propio annealing y comparar la curva de pérdida con la del entrenamiento original sobre DCLM.
- Baseline de control en estudios de optimizadores: al estar entrenado con AdamW y schedule coseno, sirve como referencia frente a variantes sharpness-aware (SAM, ASAM) en experimentos sobre olvido catastrófico, que es el tema del artículo asociado.
- Ablaciones de bajo coste en entornos académicos: con 150 millones de parámetros, permite ejecutar barridos de hiperparámetros (learning rate, batch size, número de pasos de annealing) en una única GPU consumer, algo inviable con modelos de 7B o superiores.
- Fine-tuning para tareas de NLP concretas: clasificación de texto, análisis de sentimiento, NER o resumen extractivo en dominios específicos, partiendo del checkpoint preentrenado y añadiendo una cabeza de tarea.
- Destilación de conocimiento: usar el modelo como alumno pequeño que aprende de las distribuciones de un modelo mayor, aprovechando que ya ha visto 120.000 millones de tokens y no parte de inicialización aleatoria.
- Investigación sobre representaciones internas: extracción de embeddings y probing de capas intermedias para estudiar qué información lingüística codifica un modelo de este tamaño tras un preentrenamiento a gran escala.
- Docencia y prototipado en CPU: al caber holgadamente en memoria de un portátil, permite demostraciones de generación de texto y de pipelines de HuggingFace Transformers en entornos sin GPU.
- Generación de texto de dominio tras ajuste ligero: con un fine-tuning sobre un corpus especializado (por ejemplo, textos legales o técnicos), puede emplearse para tareas de completado y redacción asistida de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ningún otro conjunto, y la búsqueda web realizada no ha devuelto documentación técnica relevante sobre este checkpoint (los resultados obtenidos corresponden a un sitio web de asesoría fiscal sin relación con el modelo).

## Requisitos de hardware

Las siguientes estimaciones se derivan del tamaño declarado del modelo (150 millones de parámetros) y son cálculos aritméticos, no mediciones publicadas:

- Pesos en fp32: aproximadamente 600 MB.
- Pesos en fp16/bf16: aproximadamente 300 MB.
- Pesos en int8: aproximadamente 150 MB.
- Pesos en int4: aproximadamente 75-80 MB.
- VRAM total para inferencia: por debajo de 1-2 GB en fp16, incluyendo caché KV y activaciones para contextos y lotes moderados.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4060, GTX 1650, e incluso en GPU integradas con memoria compartida.
- Ejecución en CPU viable: puede correr en un portátil convencional, en una Raspberry Pi de gama alta o en un contenedor sin acelerador.
- El repositorio completo ocupa 3,2 GB en disco si se descargan todos los ficheros publicados.
- Opciones de despliegue: HuggingFace Transformers es la vía directa si los pesos están en safetensors o PyTorch; vLLM y TGI son compatibles con arquitecturas OLMo si el checkpoint incluye configuración estándar; llama.cpp y Ollama requerirían una conversión previa a GGUF que no está publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

La comparativa se establece con modelos pequeños de propósito general ampliamente documentados. Los datos de las alternativas provienen de su documentación pública y pueden variar según la versión consultada.

| Modelo | Parámetros | Contexto | Licencia | Ajuste por instrucciones | Benchmarks publicados |
|---|---|---|---|---|---|
| WattsIshaan/OLMo-150m-120B-adamw-cosine-10percent | ~150 M | No disponible | CC-BY-4.0 | No | No |
| OLMo-1B (AI2) | ~1.000 M | 2.048 tokens | Apache-2.0 | Sí (variantes Instruct) | Sí |
| SmolLM2-135M (HuggingFace) | 135 M | 8.192 tokens | Apache-2.0 | Sí (variantes Instruct) | Sí |
| Qwen2.5-0.5B (Alibaba) | ~500 M | 32.768 tokens | Apache-2.0 | Sí (variantes Instruct) | Sí |

Diferencias relevantes: frente a las alternativas, este checkpoint destaca únicamente por su licencia CC-BY-4.0 (permisiva pero con obligación de atribución) y por su carácter de artefacto de investigación a medio entrenar. Las alternativas ofrecen contexto documentado, versiones ajustadas por instrucciones, evaluaciones publicadas y soporte de ecosistema mucho más amplio. No se dispone de datos de rendimiento de este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo instruction-tuned: no debe esperarse que siga instrucciones, mantenga formato de chat ni responda de forma útil sin fine-tuning previo.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o sesgo de género, raza o religión. Al entrenarse sobre DCLM (corpus web), es previsible que herede sesgos presentes en datos de internet, aunque no hay mediciones que lo cuantifiquen.
- Riesgo de alucinación: alto. Es un modelo base de 150 millones de parámetros con 120.000 millones de tokens vistos; su conocimiento factual es limitado y no hay mecanismos de mitigación documentados.
- Entrenamiento incompleto: el checkpoint corresponde al 90 % de los pasos. Su calidad final depende del annealing que el usuario aplique, por lo que el rendimiento puede variar significativamente entre ejecuciones.
- Limitaciones de contexto e idioma: tanto la longitud de contexto como los idiomas soportados figuran como no disponibles. No debe asumirse soporte fiable del castellano.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni informes de terceros.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y modificación, pero exige atribución al autor y la indicación de cambios. No incluye garantías ni cláusula de responsabilidad.
- Ausencia de garantías de reproducibilidad: no se detalla la composición exacta del dataset, la tokenización ni la configuración completa de entrenamiento, lo que dificulta replicar resultados.
- Tamaño del repositorio: 3,2 GB para 150 millones de parámetros sugiere artefactos de entrenamiento (posiblemente estados del optimizador) que pueden confundir a quien espere pesos listos para inferencia. Conviene inspeccionar los ficheros antes de cargarlos.
- No apto para producción sin evaluación previa: cualquier despliegue debería ir precedido de fine-tuning, evaluación de seguridad y validación de sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/WattsIshaan/OLMo-150m-120B-adamw-cosine-10percent
- Paper asociado: https://arxiv.org/abs/2605.02105 (Watts, Li, Goyal, Springer, Raghunathan, "Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting", ICML 2026)
- No se han encontrado otros enlaces relevantes en la búsqueda web realizada: los resultados obtenidos correspondían a un sitio de asesoría fiscal sin relación con el modelo.
