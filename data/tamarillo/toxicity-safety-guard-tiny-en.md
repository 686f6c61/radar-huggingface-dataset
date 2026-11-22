# Tamarillo/toxicity-safety-guard-tiny-en

## Resumen

Tamarillo/toxicity-safety-guard-tiny-en es un clasificador de texto multi-etiqueta orientado a toxicidad y seguridad de contenido generado por IA, desarrollado por Tamarillo. Se construye mediante fine-tuning del encoder jhu-clsp/ettin-encoder-32m, un modelo de arquitectura ModernBERT con 32.034.056 parametros, y se distribuye bajo licencia Apache-2.0. Su proposito es actuar como guardrail de baja latencia en pipelines de LLM, tanto en fase de entrada (prompts) como de salida (respuestas), sin requerir trust_remote_code.

El modelo emite ocho salidas sigmoideas independientes: las siete etiquetas de toxicidad que utiliza el escaner Toxicity de protectai/llm-guard (toxicity, severe_toxicity, obscene, threat, insult, identity_attack, sexual_explicit) mas una cabeza adicional denominada unsafe_ai_content, orientada a riesgos propios de LLM y agentes. Esta compatibilidad declarada con llm-guard 0.3.16, verificada tanto en PyTorch como en ONNX sobre CPU, lo convierte en un candidato practico para sustituir clasificadores de toxicidad mas pesados en despliegues con recursos limitados.

La relevancia actual del modelo radica en su relacion tamano-prestaciones: con solo 32 millones de parametros y exportaciones ONNX verificadas en paridad, apunta a escenarios de edge computing y sidecars de CPU donde el coste por inferencia es critico. El modelo es exclusivamente en ingles y forma parte de una familia de tres variantes (tiny-en de 32,0M, small de 140,6M y base de 307,5M), lo que permite escalar en precision segun el caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tune de jhu-clsp/ettin-encoder-32m |
| Parametros totales | 32.034.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 7.999 tokens en el backbone; validado hasta 3.584 tokens |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 (archivos model.onnx y model_fp16.onnx) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), ONNX |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/ettin-encoder-32m, un encoder de la familia ModernBERT con 32 millones de parametros y una ventana de contexto nativa de 7.999 tokens. Sobre esa base se aplica un fine-tuning de clasificacion multi-etiqueta con ocho cabezas sigmoideas independientes y pooling de atencion global sobre el token [CLS]. El autor declara que el modelo fue validado hasta 3.584 tokens, por debajo del maximo del backbone. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion porcentual del dataset.

Los datos de entrenamiento citados en la model card incluyen google/civil_comments, nvidia/Aegis-AI-Content-Safety-Dataset-2.0, OpenSafetyLab/Salad-Data, ToxicityPrompts/PolyGuardMix y argilla/ultrafeedback-binarized-preferences-cleaned. No se detalla si hubo etapas de RLHF o DPO, ni hiperparametros de entrenamiento. Como innovacion destacable, el autor enfatiza la ausencia de trust_remote_code (soporte nativo en transformers >= 4.48.0) y la verificacion de paridad de las exportaciones ONNX frente a la version PyTorch.

## Capacidades

- Clasificacion multi-etiqueta de toxicidad con ocho salidas sigmoideas independientes: toxicity, severe_toxicity, obscene, threat, insult, identity_attack, sexual_explicit y unsafe_ai_content.
- Deteccion de riesgos modernos de LLM y agentes mediante la cabeza unsafe_ai_content, no cubierta por los escaneres de toxicidad clasicos.
- Compatibilidad drop-in con el escaner Toxicity de protectai/llm-guard 0.3.16, en PyTorch y en ONNX sobre CPU, sin cambios de codigo en el escaner.
- Procesamiento de entradas largas: truncamiento configurable hasta 2.048 tokens en los ejemplos y validacion hasta 3.584 tokens.
- Inferencia sin trust_remote_code con transformers >= 4.48.0.
- Exportacion ONNX en FP32 y FP16 para despliegue en CPU y entornos edge.
- Capacidad multilingue: no disponible (modelo exclusivamente en ingles).

## Casos de uso

- Moderacion de prompts en produccion: integrado como escaner de entrada en llm-guard, filtra mensajes de usuario antes de enviarlos al LLM, con umbral configurable (por ejemplo 0,5) y coste de CPU minimo gracias a sus 32 millones de parametros.
- Moderacion de respuestas de LLM: aplicado sobre la salida del modelo generativo para bloquear contenido toxico o inseguro antes de mostrarlo al usuario final, usando las ocho cabezas en una sola pasada.
- Guardrail en sidecar de CPU: desplegado como proceso ONNX Runtime junto al servicio principal, con latencia baja y sin ocupar VRAM de GPU, adecuado para arquitecturas de microservicios.
- Filtrado de datasets de instrucciones: puntuar grandes volumenes de pares prompt-respuesta (por ejemplo, de UltraFeedback) para descartar ejemplos toxicos antes del entrenamiento o la evaluacion.
- Moderacion de comunidades y comentarios: clasificacion de comentarios de usuarios en foros o plataformas con las siete etiquetas de toxicidad clasicas, aprovechando el contexto de hasta 2.048 tokens para hilos completos.
- Deteccion de riesgos en agentes: uso de la cabeza unsafe_ai_content para marcar interacciones de agentes que caen en categorias de seguridad no cubiertas por los clasificadores de toxicidad tradicionales.
- Pre-filtro en pipelines de red teaming: cribado rapido de grandes lotes de prompts adversariales para priorizar la revision manual de los casos de mayor riesgo.

## Benchmarks y rendimiento

El autor publica una evaluacion unificada sobre particiones de test held-out compartidas, con metricas en el rango [0,000, 1,000] y activacion nativa de cada modelo (sigmoide para encoders multi-etiqueta, softmax para s-nlp/KoalaAI y decodificacion con plantilla de chat para Qwen3Guard-Gen-0.6B). La informacion disponible solo detalla parcialmente la suite (Civil Comments como conjunto in-distribution); no se han proporcionado en el material los valores numericos completos de la tabla de resultados.

| Benchmark | Resultado |
|---|---|
| Civil Comments (held-out) | no disponible en el material proporcionado |
| Aegis-AI-Content-Safety-Dataset-2.0 | no disponible en el material proporcionado |
| Salad-Data | no disponible en el material proporcionado |
| PolyGuardMix | no disponible en el material proporcionado |

Los resultados completos estan en el archivo eval_results.json del repositorio y son reproducibles con scripts/eval_suite.py.

## Requisitos de hardware

- VRAM estimada: no aplica en despliegue CPU; en GPU, el modelo en FP32 ocupa aproximadamente 0,13 GB de pesos (32M parametros) y en FP16 alrededor de 0,07 GB, mas memoria de activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta disenado para CPU y edge, por lo que A100 o H100 no aportan ventaja significativa frente a alternativas mayores de la familia.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: transformers >= 4.48.0, ONNX Runtime (CPUExecutionProvider), llm-guard 0.3.16 con extra onnxruntime, y text-embeddings-inference segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor enfatiza la orientacion a ultra-baja latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Etiquetas |
|---|---|---|---|---|---|
| Tamarillo/toxicity-safety-guard-tiny-en | 32,0M | 7.999 (validado 3.584) | Ingles | Apache-2.0 | 8 sigmoides |
| Tamarillo/toxicity-safety-guard-small | 140,6M | no disponible | 17+ | no disponible | no disponible |
| Tamarillo/toxicity-safety-guard-base | 307,5M | no disponible | 17+ | no disponible | no disponible |
| unitary/toxic-bert | no disponible | no disponible | Ingles | no disponible | toxic, identity_hate (entre otras) |
| s-nlp/roberta_toxicity_classifier | no disponible | no disponible | Ingles | no disponible | 2 clases softmax |

El autor advierte explicitamente que el modelo no es un reemplazo directo sin codigo de unitary/toxic-bert ni de s-nlp/roberta_toxicity_classifier, ya que los nombres y el tipo de etiquetas difieren; la migracion requiere un adaptador de tres lineas en transformers u ONNX.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- La compatibilidad con llm-guard cubre solo las siete etiquetas de toxicidad; la cabeza unsafe_ai_content se ignora en ese escaner y requiere llamada directa al modelo.
- No es drop-in para unitary/toxic-bert ni para el clasificador de garak (s-nlp/roberta_toxicity_classifier) sin adaptador.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y falsos negativos en la clasificacion; el umbral debe calibrarse por caso de uso.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre Civil Comments y otros datasets publicos, puede heredar sesgos de esas fuentes.
- Contexto validado de 3.584 tokens, inferior a la ventana nativa de 7.999 del backbone; entradas mas largas deben truncarse.
- Licencia Apache-2.0 permite uso comercial, pero el autor no detalla garantias ni responsabilidades sobre el uso en produccion.
- En ONNX FP16 debe convertirse la salida a float32 antes de aplicar la sigmoide para evitar desbordamientos, segun el ejemplo del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/toxicity-safety-guard-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset Aegis AI Content Safety 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset Salad-Data: https://huggingface.co/datasets/OpenSafetyLab/Salad-Data
- Dataset PolyGuardMix: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Dataset UltraFeedback binarized: https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences-cleaned
- Repositorio llm-guard: https://github.com/protectai/llm-guard
- Script de evaluacion: scripts/eval_suite.py (dentro del repositorio del modelo)
- Resultados crudos: eval_results.json (dentro del repositorio del modelo)
