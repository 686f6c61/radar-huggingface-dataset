# Tamarillo/prompt-complexity-router-small

## Resumen

Tamarillo/prompt-complexity-router-small es un clasificador de complejidad de prompts y enrutamiento de coste (LLM routing) publicado por el desarrollador independiente Tamarillo bajo licencia Apache-2.0. Se trata de un modelo de la familia RouteLLM diseñado como sustituto directo de `routellm/bert_gpt4_augmented` (el `BERTRouter` de `lm-sys/RouteLLM`) y como alternativa estándar a `nvidia/prompt-task-and-complexity-classifier`. Su función es decidir, para cada consulta entrante, si conviene atenderla con un modelo "fuerte" (caro) o con uno "débil" (barato), lo que permite reducir costes en pipelines de inferencia sin degradar la calidad percibida.

El modelo se construye sobre el backbone `jhu-clsp/mmBERT-small`, un encoder multilingüe de tipo ModernBERT, y cuenta con 140.642.691 parámetros totales, lo que lo sitúa un 2,0× por debajo de `routellm/bert_gpt4_augmented` (278,1M) y un 24% por debajo de `nvidia/prompt-task-and-complexity-classifier` (183,9M). Se entrenó con una longitud de contexto de 2.048 tokens (RoPE nativo de 8.192 tokens) y no requiere `trust_remote_code`, por lo que se carga con `AutoModelForSequenceClassification` estándar de Transformers.

Su relevancia actual radica en que ofrece, según la model card, una media ROC-AUC fuera de dominio de 0,875 en el conjunto "Public OOD 2-Suite" (+9,4 pp sobre routellm y +13,8 pp sobre nvidia), un AUC de 0,946 en el test multilingüe con longitud emparejada (+26,8 pp sobre routellm) y una latencia p50 de 26,45 ms en CPU x86 a 64 tokens. Todo ello con pesos ONNX en FP32 (537,0 MB) y FP16 (268,7 MB), lo que facilita su despliegue en CPU y en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT (mmBERT), clasificación de secuencias con 3 etiquetas |
| Parametros totales | 140.642.691 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrenamiento; 8.192 tokens nativos por RoPE |
| Tipos de cuantizacion | FP32 (ONNX, 537,0 MB) y FP16 (ONNX, 268,7 MB); safetensors en el repo |
| Idiomas soportados | en, zh, es, fr, de, ru, pl, ja, ko, pt, it, ar, tr, nl, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de la familia ModernBERT, concretamente el backbone multilingüe `jhu-clsp/mmBERT-small`, adaptado como cabeza de clasificación de secuencias con tres clases: etiqueta 0 = se necesita modelo fuerte, etiqueta 1 = empate/moderado, etiqueta 2 = basta un modelo débil. La puntuación exacta de RouteLLM se obtiene como `1 - (softmax[1] + softmax[2])`, equivalente a `softmax[0]`, y la puntuación continua de complejidad como `softmax[0] + 0.5 * softmax[1]`, en el rango [0, 1]. El tokenizador fija `model_max_length` a 2.048, de modo que al sustituir el checkpoint en `BERTRouter` se desbloquea automáticamente una ventana de enrutamiento 4× mayor que la del modelo original.

El entrenamiento combina varios conjuntos de datos: `lmarena-ai/arena-human-preference-140k` y `lmarena-ai/arena-human-preference-55k` (preferencias humanas de Arena), `routellm/gpt4_judge_battles` (batallas juzgadas por GPT-4), `qwedsacf/competition_math` (matemáticas de competición), `google-research-datasets/mbpp` (problemas de código) y `FiscalNote/billsum` (resumen de documentos legales largos). La model card no detalla el número total de tokens de entrenamiento ni si se aplicó RLHF o DPO; esos datos figuran como no disponibles. Sí se documentan innovaciones de despliegue: exportación ONNX para CPU/edge, pesos FP16, compatibilidad con `text-embeddings-inference` y `endpoints_compatible`, y funcionamiento sin `trust_remote_code`.

## Capacidades

- Clasificación de complejidad de prompts en tres clases (fuerte / empate / débil) y puntuación continua de complejidad en [0, 1].
- Enrutamiento de coste entre modelos LLM: decide si una consulta requiere un modelo frontier o si basta uno rápido y barato.
- Sustituto directo (1 línea) de `routellm/bert_gpt4_augmented` dentro de `lm-sys/RouteLLM` (`BERTRouter`), respetando la interfaz de tres clases y `tokenizer.model_max_length`.
- Multilingüe en 15 idiomas: inglés, chino, español, francés, alemán, ruso, polaco, japonés, coreano, portugués, italiano, árabe, turco, neerlandés y tailandés.
- Manejo de prompts largos y conversaciones multi-turno gracias a la ventana de 2.048 tokens entrenados (8.192 nativos por RoPE).
- Inferencia en CPU y edge mediante ONNX Runtime, con variantes FP32 y FP16.
- No requiere `trust_remote_code`; se carga con `AutoModelForSequenceClassification` y `AutoTokenizer` estándar.
- Capacidad de observabilidad de agentes: permite etiquetar cada paso de un agente con su nivel de complejidad para auditar costes.

## Casos de uso

- Enrutamiento de coste en producción: colocar el clasificador delante de un par de modelos (por ejemplo, uno frontier y otro pequeño) para decidir por consulta a cuál enviarla. Con 26,45 ms p50 en CPU a 64 tokens, el coste de enrutar es despreciable frente al ahorro de invocar el modelo caro solo cuando hace falta.
- Sustitución directa en RouteLLM: reemplazar `routellm/bert_gpt4_augmented` por este checkpoint en una instalación existente de `lm-sys/RouteLLM` sin tocar el código, obteniendo además una ventana de contexto 4× mayor (2.048 frente a la del original) para enrutar conversaciones multi-turno.
- Atención al cliente automatizada multilingüe: clasificar consultas entrantes en 15 idiomas y desviar las triviales (FAQ, saludos) a un modelo pequeño y las complejas (reclamaciones, casos legales) a uno grande, manteniendo la calidad en los casos difíciles.
- Observabilidad de agentes: instrumentar cada paso de un agente multi-step con la puntuación de complejidad para detectar pasos innecesariamente costosos y optimizar el presupuesto de tokens.
- Filtrado previo en pipelines de código y matemáticas: usar los datos de entrenamiento en MBPP y competition_math para detectar prompts de programación o matemáticas que requieren un modelo fuerte, y enviar el resto a un modelo rápido.
- Procesamiento de documentos largos: aprovechar la ventana de 2.048 tokens (entrenada sobre billsum) para clasificar resúmenes legales o administrativos y decidir si se procesan con un modelo de contexto largo caro o con uno económico.
- Despliegue en el borde o en CPU: usar la variante ONNX FP16 (268,7 MB) en servidores sin GPU o en dispositivos con recursos limitados para enrutar tráfico antes de llegar al backend de inferencia.
- Evaluación comparativa de pares de modelos: calibrar el umbral de enrutamiento (`win_rate >= 0.30` por defecto) para cada par de modelos y presupuesto de coste concreto.

## Benchmarks y rendimiento

Datos publicados en la model card (no se han verificado de forma independiente):

| Metrica | prompt-complexity-router-small | routellm/bert_gpt4_augmented | nvidia/prompt-task-and-complexity-classifier |
|---|---|---|---|
| Parametros | 140,6M | 278,1M | 183,9M |
| Public OOD 2-Suite Mean ROC-AUC | 0,875 | 0,781 | 0,737 |
| Multilingual OOD AUC (longitud emparejada) | 0,946 | 0,680 (implícito, +26,8 pp) | no disponible |
| Multilingual OOD TPR@5%FPR | 0,700 | no disponible | no disponible |
| Length-Inverted OOD Macro-F1 | 0,847 (#1) | no disponible | no disponible |
| Length-Inverted OOD TPR@5%FPR | 0,718 | no disponible | no disponible |
| Arena-55k APGR (batallas humanas reales) | 0,4918 (+4,57 pp) | 0,4912 (+4,51 pp) | no disponible |
| Latencia A100 @ 64 tok | 25,2 ms | no disponible | no disponible |
| Latencia CPU FP32 @ 64 tok | 26,45 ms | no disponible | no disponible |
| Tamano ONNX FP16 | 268,7 MB | no disponible | no disponible |

Comparativa dentro de la propia familia (según la model card):

| Modelo | Backbone | Parametros | Idiomas | Length-Inv OOD (AUC / T5) | Multilingual OOD (AUC / T5) | Public OOD-2 Mean |
|---|---|---|---|---|---|---|
| prompt-complexity-router-tiny-en | ettin-encoder-32m | 32,0M | Inglés | 0,791 / 0,695 | 0,498 / 0,005 | 0,645 |
| prompt-complexity-router-small | mmBERT-small | 140,6M | Multilingüe | 0,805 / 0,718 | 0,946 / 0,700 | 0,875 |
| prompt-complexity-router-base | mmBERT-base | 307,5M | Multilingüe | 0,828 / 0,748 | 0,952 / 0,795 | 0,890 |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un clasificador y no un generador.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (537,0 MB de pesos ONNX) y alrededor de 270 MB en FP16 (268,7 MB); el checkpoint safetensors completo ocupa 1,4 GB en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre sirve; en la model card se reporta latencia de 25,2 ms en A100 a 64 tokens. Para CPU, no se requiere GPU.
- Cabe en cualquier GPU de consumo: RTX 4090, RTX 3090, RTX 4060, e incluso en iGPU y dispositivos de borde con la variante ONNX FP16.
- Opciones de despliegue: Transformers (`AutoModelForSequenceClassification`), ONNX Runtime (CPU/edge), `text-embeddings-inference` (según los tags del repositorio), endpoints compatibles de Hugging Face, e integración con `lm-sys/RouteLLM` mediante `BERTRouter`.
- Latencia y throughput: 26,45 ms p50 en CPU x86 FP32 a 64 tokens; 25,2 ms en A100 a 64 tokens. El throughput no se detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento OOD-2 | Disponibilidad |
|---|---|---|---|---|---|---|
| Tamarillo/prompt-complexity-router-small | 140,6M | 2.048 (8.192 RoPE) | Clasificador de complejidad / router RouteLLM | Apache-2.0 | 0,875 ROC-AUC | Hugging Face, ONNX, Transformers |
| routellm/bert_gpt4_augmented | 278,1M | no disponible | Router RouteLLM original | no disponible | 0,781 ROC-AUC | Hugging Face, integrado en lm-sys/RouteLLM |
| nvidia/prompt-task-and-complexity-classifier | 183,9M | no disponible | Clasificador de tarea y complejidad | no disponible | 0,737 ROC-AUC | Hugging Face |
| Tamarillo/prompt-complexity-router-base | 307,5M | 2.048 (8.192 RoPE) | Misma familia, backbone mmBERT-base | Apache-2.0 | 0,890 ROC-AUC | Hugging Face |

El modelo small ofrece un equilibrio entre tamaño y rendimiento: es un 24% más pequeño que el de NVIDIA y un 49% más pequeño que el de RouteLLM, con mejor ROC-AUC fuera de dominio según la model card. La variante base mejora ligeramente (0,890 frente a 0,875) a costa de duplicar parámetros (307,5M frente a 140,6M) y latencia en CPU (52,82 ms frente a 26,45 ms).

## Limitaciones y advertencias

- Es un clasificador, no un generador: no produce texto, código ni respuestas; solo puntúa la complejidad de un prompt.
- Los benchmarks publicados proceden de la propia model card y no se han verificado de forma independiente; conviene reproducirlos en el dominio de aplicación antes de confiar en los umbrales.
- El umbral de enrutamiento por defecto (`win_rate >= 0.30`) es una recomendación genérica; debe recalibrarse para cada par de modelos y presupuesto de coste.
- La ventana de entrenamiento es de 2.048 tokens; aunque el RoPE nativo soporta 8.192, el comportamiento más allá de 2.048 tokens no está validado y puede degradar la calibración.
- Riesgo de sesgo y alucinación de la clasificación: al entrenarse con preferencias humanas de Arena y batallas juzgadas por GPT-4, puede heredar sesgos de esos conjuntos (estilos de prompt sobrerrepresentados, sesgo hacia ciertos idiomas o formatos).
- Cobertura multilingüe limitada a 15 idiomas; otros idiomas pueden obtener puntuaciones poco fiables.
- Dependencia de `transformers>=4.48,<5` por la arquitectura ModernBERT/mmBERT; en entornos con versiones antiguas de `transformers` (habitual en instalaciones de `routellm`) hay que actualizar la librería.
- En PyTorch 2.4.x + CUDA con lotes con padding de más de 512 tokens, se recomienda `attn_implementation="eager"` al cargar directamente con Transformers.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias de los modelos que se enrutan y de los datasets de entrenamiento subyacentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad ni informes de producción disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/prompt-complexity-router-small
- Repositorio RouteLLM (lm-sys): https://github.com/lm-sys/RouteLLM
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo de referencia RouteLLM BERTRouter: https://huggingface.co/routellm/bert_gpt4_augmented
- Clasificador de NVIDIA comparable: https://huggingface.co/nvidia/prompt-task-and-complexity-classifier
- Demo interactivo WASM (familia): https://huggingface.co/spaces/Tamarillo/prompt-complexity-router-demo
- Variante tiny-en de la familia: https://huggingface.co/Tamarillo/prompt-complexity-router-tiny-en
- Variante base de la familia: https://huggingface.co/Tamarillo/prompt-complexity-router-base
- Dataset lmarena-ai/arena-human-preference-140k: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-140k
- Dataset lmarena-ai/arena-human-preference-55k: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-55k
- Dataset routellm/gpt4_judge_battles: https://huggingface.co/datasets/routellm/gpt4_judge_battles
- Dataset qwedsacf/competition_math: https://huggingface.co/datasets/qwedsacf/competition_math
- Dataset google-research-datasets/mbpp: https://huggingface.co/datasets/google-research-datasets/mbpp
- Dataset FiscalNote/billsum: https://huggingface.co/datasets/FiscalNote/billsum
