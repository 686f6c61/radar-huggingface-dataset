# Wiself/Holodeck-Lounge-Regressed-MTP

## Resumen

Holodeck-Lounge-Regressed-MTP es un artefacto de investigación publicado por Wiself que documenta un resultado negativo deliberado: un fine-tune de la cabeza de predicción multi-token (MTP) sobre el modelo Holodeck-Lounge-MTP, que a su vez es una restauración de la cabeza MTP nativa de DeepSeek sobre un backbone Qwen3.5-9B. El experimento consistió en reentrenar únicamente la cabeza MTP (unos 300 millones de parámetros) con el backbone congelado, usando 5.000 muestras autodestiladas, y el resultado fue una regresión en la tasa de aceptación frente a la cabeza donante: 49,75% frente a 58,55% en muestreo por rechazo. El modelo se comparte explícitamente como un artefacto de aprendizaje, no como un modelo de producción, y sirve para validar las predicciones de la literatura sobre fine-tunes de cabezas MTP aisladas.

El modelo tiene 9.653.104.368 parámetros totales, arquitectura `qwen3_5` con 32 capas y dimensión oculta 4096, y una cabeza MTP de una sola capa que genera 3 tokens de borrador. La licencia es Apache 2.0. El contexto máximo no se especifica en la información disponible, aunque el entrenamiento se realizó con secuencias de 1536 tokens. Es relevante ahora porque documenta un fallo reproducible en un área de investigación activa —la predicción multi-token y la decodificación especulativa— y proporciona datos empíricos sobre por qué los fine-tunes de cabeza aislada regresan, en línea con los hallazgos de los papers citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`qwen3_5`) con cabeza MTP de una sola capa (3 tokens de borrador) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1536 tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; existen GGUF del modelo base en repositorios de terceros) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Wiself/Holodeck-Lounge-MTP, que es una restauración de la cabeza MTP nativa de DeepSeek sobre el backbone Holodeck-Lounge (basado en Qwen3.5-9B). La cabeza MTP es de una sola capa y genera 3 tokens de borrador para decodificación especulativa. El fine-tune se realizó solo sobre la cabeza MTP (aproximadamente 300 millones de parámetros), con el backbone completamente congelado, durante 1 época sobre 5.000 muestras autodistiladas (generaciones greedy del propio modelo). La función de pérdida fue `lk_hybrid`, una combinación adaptativa de divergencia KL y variación total (TV) con implementación Triton fusionada. El learning rate fue 2e-4 con schedule coseno y 100 pasos de warmup, y la longitud de secuencia fue 1536. El entrenamiento se ejecutó en una RTX 5090 de 32 GB usando el script `train.py` del repositorio `vllm-project/speculators`.

Una limitación metodológica importante señalada por el autor es que los objetivos autodistilados fueron etiquetas duras greedy, no logits del profesor, lo que contradice las recomendaciones de los papers sobre destilación de distribuciones (KL). El autor atribuye la regresión a tres factores: un learning rate demasiado alto (2e-4 frente a los 1e-6–3e-6 que extrapola la literatura para un modelo de ~9B), un cambio de distribución del corpus de fine-tune respecto al de preentrenamiento, y el techo de las cabezas aisladas según la literatura.

## Capacidades

- Generación de texto autoregresiva estándar, con capacidad de decodificación especulativa mediante la cabeza MTP de 3 tokens de borrador.
- Razonamiento y generación de código heredados del backbone Qwen3.5-9B, aunque el autor no proporciona benchmarks de calidad de texto.
- Soporte de tool calling y funciones de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidad de modo pensamiento (reasoning): el modelo base lo soporta, pero el autor indica que este fine-tune no alcanza las tasas de aceptación del donante ni siquiera con reasoning activado.
- Capacidad de decodificación especulativa: sí, pero con una tasa de aceptación inferior a la del donante (49,75% frente a 58,55% en vLLM).

## Casos de uso

- Investigación sobre decodificación especulativa: el modelo sirve como caso de estudio para analizar por qué un fine-tune de cabeza MTP aislada regresa en aceptación, y para comparar con las predicciones de los papers citados.
- Validación de hipótesis sobre learning rate: permite reproducir el efecto de un LR excesivo en fine-tunes de cabezas MTP, tal como predice el paper "On Multi-Token Prediction for Efficient LLM Inference" (arXiv:2502.09419).
- Estudio de cambio de distribución en fine-tune: el corpus autodistilado de 5.000 muestras greedy diverge de la distribución de preentrenamiento, lo que ilustra el hallazgo de AdaMTP (arXiv:2608.00434) sobre regresión inducida por el corpus.
- Comparación de métodos de destilación: al usar etiquetas duras en lugar de logits del profesor, el modelo permite contrastar empíricamente las recomendaciones de MTP-D (arXiv:2603.23911) y del paper de autodestilación (arXiv:2602.06019).
- Desarrollo de cabezas MTP: los datos de aceptación por posición (pos0, pos1, pos2) proporcionan una referencia para quienes trabajan en el diseño de cabezas de borrador.
- Documentación de resultados negativos: sirve como ejemplo de buenas prácticas en la publicación de artefactos de investigación que documentan fallos, con métricas detalladas y advertencias claras.

## Benchmarks y rendimiento

El autor proporciona métricas de aceptación de la cabeza MTP, no benchmarks de calidad de lenguaje. Los resultados comparan la cabeza entrenada con la donante:

| Metrica | Donante | Entrenada |
|---|---|---|
| Aceptacion greedy / target-only (llama.cpp) | 59,0% | 48,69% |
| Aceptacion por muestreo por rechazo (vLLM) | 58,55% | 49,75% |
| RS pos0 | 77,2% | 72,2% |
| RS pos1 | 57,0% | 47,5% |
| RS pos2 | 41,4% | 29,5% |
| Longitud media aceptada | 2,756 | 2,493 |

La evaluacion se realizo con 30 prompts, temperatura 0.7, maximo 256 tokens y concurrencia 8. El autor advierte que n=30 es una muestra pequena y que los intervalos de confianza son amplios. No se han publicado resultados de benchmarks de calidad de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al ser un modelo de ~9.6B parámetros, una cuantización de 8 bits requeriría aproximadamente 10-12 GB, y 16 bits unos 19-20 GB.
- GPU recomendadas: el autor usó una RTX 5090 de 32 GB para el entrenamiento. Para inferencia, una RTX 4090 de 24 GB o una A100 de 40 GB serían adecuadas en FP16.
- ¿Cabe en GPU de consumo? Sí, en FP16 cabría en una RTX 4090 (24 GB) o similar, y en cuantización 8 bits en GPUs de 12-16 GB.
- Opciones de despliegue: vLLM (con soporte de decodificación especulativa), llama.cpp (para GGUF), y el repositorio `vllm-project/speculators` para experimentos de MTP.
- Latencia y throughput: no disponibles. El autor no proporciona mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion MTP (vLLM RS) | Licencia | Notas |
|---|---|---|---|---|---|
| Wiself/Holodeck-Lounge-Regressed-MTP | 9,65B | no disponible | 49,75% | Apache 2.0 | Artefacto de investigacion, cabeza MTP regresada |
| Wiself/Holodeck-Lounge-MTP | ~9,6B | no disponible | 58,55% | Apache 2.0 | Modelo original con cabeza MTP restaurada |
| EAGLE-3 (sobre Qwen3.5-9B) | no disponible | no disponible | ~61% (segun el autor) | no disponible | Linea base de borrador que supera a las cabezas MTP nativas |

El autor recomienda explícitamente usar Wiself/Holodeck-Lounge-MTP en lugar de este modelo para cualquier trabajo real. EAGLE-3 se menciona como la línea base que supera a las cabezas MTP nativas, con una aceptación de aproximadamente 61% sobre Qwen3.5-9B.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación que documenta un resultado negativo; no debe usarse en producción.
- La cabeza MTP entrenada tiene una tasa de aceptación significativamente inferior a la donante (49,75% frente a 58,55%), lo que anula cualquier beneficio de velocidad de la decodificación especulativa.
- La posición más profunda del borrador (pos2) colapsa de 41,4% a 29,5%, lo que indica una degradación severa en la predicción a largo plazo.
- La evaluación se realizó con solo 30 prompts, por lo que las métricas tienen intervalos de confianza amplios y deben tratarse como indicativas.
- El fine-tune usó etiquetas duras greedy en lugar de logits del profesor, lo que contradice las recomendaciones de la literatura sobre destilación de distribuciones.
- El learning rate de 2e-4 es 1-2 órdenes de magnitud superior al que la literatura extrapola para un modelo de ~9B, lo que probablemente destruyó la alineación previa de la cabeza.
- No se dispone de información sobre sesgos, alucinación o limitaciones de idioma; al ser un modelo de investigación, estos aspectos no han sido evaluados.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en cualquier aplicación real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wiself/Holodeck-Lounge-Regressed-MTP
- Modelo original (recomendado por el autor): https://huggingface.co/Wiself/Holodeck-Lounge-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo intermedio: https://huggingface.co/nightmedia/Qwen3.5-9B-Holodeck-Lounge
- Donante de la cabeza MTP: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- GGUF del modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Holodeck-Lounge-GGUF
- Paper DeepSeek-V3: https://arxiv.org/abs/2412.19437
- Paper Better & Faster LLMs via Multi-token Prediction: https://arxiv.org/abs/2404.19737
- Paper On Multi-Token Prediction for Efficient LLM Inference: https://arxiv.org/abs/2502.09419
- Paper AdaMTP: https://arxiv.org/abs/2608.00434
- Paper Multi-Token Prediction via Self-Distillation: https://arxiv.org/abs/2602.06019
- Paper MTP-D: https://arxiv.org/abs/2603.23911
- Paper FastMTP: https://arxiv.org/abs/2509.18362
- Paper Bebop: https://arxiv.org/abs/2606.12370
- Paper EAGLE-3: https://arxiv.org/abs/2503.01840
- Guia de unsloth sobre modelos MTP: https://unsloth.ai/docs/models/mtp
