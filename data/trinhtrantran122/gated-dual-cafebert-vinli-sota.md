# trinhtrantran122/gated-dual-cafebert-vinli-sota

## Resumen

El modelo `gated-dual-cafebert-vinli-sota` es un checkpoint de clasificacion de inferencia de lenguaje natural (NLI) en vietnamita, desarrollado por el usuario trinhtrantran122. Esta construido sobre CafeBERT, un modelo derivado de XLM-RoBERTa afinado sobre un corpus extenso en vietnamita (segun el articulo arXiv:2403.15882), y anade una arquitectura "Gated-Dual" con dos encoders combinados mediante un mecanismo de compuerta, junto con Multi-Sample Dropout de 5 trayectorias (MSD 5-path) y Parameter Exponential Moving Average (EMA).

El modelo esta orientado al benchmark ViNLI (Vietnamese Multi-genre NLI) con una longitud maxima de secuencia de 512 tokens. El repositorio ocupa 2,3 GB, lo que sugiere aproximadamente 560 millones de parametros en precision fp32, aunque el numero exacto no se especifica en la model card. El checkpoint se publico el 29 de agosto de 2026 y no cuenta con descargas ni valoraciones en HuggingFace.

La model card declara un estado "SOTA" para ViNLI, pero el valor de Test Macro-F1 aparece como "N/A", por lo que no se puede verificar dicha afirmacion con datos publicos. Tampoco se especifica la licencia, lo que genera incertidumbre sobre su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated-Dual CafeBERT (basada en XLM-RoBERTa) con MSD 5-path y Parameter EMA |
| Parametros totales | no disponible (tamano del repo: 2,3 GB; estimacion ~560M en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (formato exacto no especificado) |

## Arquitectura y entrenamiento

CafeBERT se construye a partir de XLM-RoBERTa, que se afina sobre un corpus vietnamita extenso para mejorar su competencia en el idioma. Sobre esta base, el modelo anade una arquitectura "Gated-Dual" que combina dos encoders CafeBERT mediante un mecanismo de compuerta (gating), aunque los detalles tecnicos exactos de esta combinacion no estan documentados en la model card. El entrenamiento incorpora Multi-Sample Dropout con 5 trayectorias (MSD 5-path), una tecnica que aplica dropout multiple durante la inferencia para mejorar la robustez, y Parameter EMA, que suaviza las actualizaciones de pesos durante el entrenamiento.

El modelo se entrena especificamente para el benchmark ViNLI con una longitud maxima de secuencia de 512 tokens. No se proporciona informacion sobre la composicion del dataset de entrenamiento, el numero de pasos de optimizacion ni los hiperparametros utilizados.

## Capacidades

- Clasificacion NLI en vietnamita: determina si una hipotesis se deduce (entailment), contradice (contradiction) o es neutral respecto a una premisa dada.
- Soporte multi-genero dentro del benchmark ViNLI, que incluye diversos generos textuales.
- No ofrece capacidades multilingues: esta limitado al vietnamita.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Verificacion de consistencia factual en vietnamita: el modelo puede comparar pares de afirmaciones para detectar contradicciones, util en sistemas de fact-checking o validacion de noticias en vietnamita.
- Filtrado de contenido contradictorio: en plataformas de contenido generado por usuarios, puede identificar respuestas que contradicen informacion verificada previamente.
- Busqueda semantica basada en entailment: se puede usar para recuperar documentos cuya informacion implica la consulta del usuario, mejorando la precision frente a busquedas puramente lexicas.
- Sistemas de preguntas y respuestas: como modulo de validacion de respuestas, comprobando si una respuesta candidata se deduce logicamente del contexto proporcionado.
- Analisis de sentimiento avanzado: mediante reformulacion de hipotesis (p. ej., "el texto expresa emocion positiva"), el modelo puede clasificar actitudes en textos vietnamitas.
- Moderacion de contenido: detectar si un texto implica contenido prohibido o inapropiado formulando hipotesis de control y evaluando el entailment.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica "Test Macro-F1: N/A", por lo que no se puede confirmar la afirmacion de estado SOTA para ViNLI ni comparar el rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en ~560M parametros, solo pesos):
  - fp32: ~2,3 GB
  - fp16: ~1,2 GB
  - int8: ~600 MB
  - 4-bit: ~300 MB
- En la practica, sumando activaciones, cache de atencion y overhead del runtime, se recomienda al menos 4 GB de VRAM para inferencia en fp16.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (p. ej., RTX 3060, RTX 4060) es suficiente para inferencia.
- Para fine-tuning, se recomienda al menos 12 GB de VRAM (RTX 3060 12GB o superior).
- Opciones de despliegue: HuggingFace Transformers, ONNX Runtime, TorchServe. La compatibilidad con vLLM, llama.cpp u Ollama no esta documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tarea principal |
|---|---|---|---|---|---|
| gated-dual-cafebert-vinli-sota | ~560M (estimado) | 512 | vi | no disponible | NLI vietnamita |
| CafeBERT (uitnlp) | no especificado (basado en XLM-RoBERTa large) | 512 | vi | no disponible | Modelo base vietnamita |
| PhoBERT (VinAIResearch) | 135M (base) / 370M (large) | 256 | vi | MIT | Modelo base vietnamita |
| XLM-RoBERTa large | 560M | 512 | multilingue (100) | MIT | Modelo base multilingue |

Nota: CafeBERT y PhoBERT son modelos base no especializados en NLI. El modelo gated-dual-cafebert esta afinado especificamente para NLI vietnamita, lo que podria ofrecer ventajas en esa tarea, aunque sin datos de benchmarks publicados no se puede cuantificar la diferencia.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que genera incertidumbre legal sobre su uso comercial y redistribucion.
- No se han publicado resultados de benchmarks verificables; la afirmacion de "SOTA" en la model card no esta respaldada por metricas concretas (Test Macro-F1: N/A).
- El modelo tiene 0 descargas y 0 valoraciones en HuggingFace, por lo que no hay evidencia de validacion externa ni pruebas en produccion.
- Limitado exclusivamente al idioma vietnamita; no sirve para otros idiomas.
- Longitud de contexto limitada a 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- No se documentan sesgos especificos, pero al derivar de XLM-RoBERTa afinado en vietnamita, podria heredar sesgos presentes en los datos de entrenamiento originales.
- La fecha de creacion (29 de agosto de 2026) es posterior a la fecha de la busqueda web, lo que sugiere que podria tratarse de un modelo muy reciente o de un error en la metadata.
- No se especifica el formato exacto de los pesos (safetensors, bin, etc.), lo que puede complicar la carga en algunos frameworks.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trinhtrantran122/gated-dual-cafebert-vinli-sota
- CafeBERT (modelo base) en HuggingFace: https://huggingface.co/uitnlp/CafeBERT
- Articulo de CafeBERT en arXiv: https://arxiv.org/pdf/2403.15882
- Repositorio
