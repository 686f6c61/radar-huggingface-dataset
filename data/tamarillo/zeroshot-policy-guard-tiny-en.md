# Tamarillo/zeroshot-policy-guard-tiny-en

## Resumen

Tamarillo/zeroshot-policy-guard-tiny-en es un clasificador de texto encoder-only de tipo NLI (inferencia de lenguaje natural) desarrollado por Tamarillo, pensado como guardrail de políticas y temas para sistemas basados en LLM. Se construye sobre el backbone jhu-clsp/ettin-encoder-32m (32,0 M de parámetros) y se afina para una tarea binaria de entailment / not_entailment, lo que lo hace compatible de forma nativa con el pipeline zero-shot-classification de transformers y con los escáneres BanTopics y FactualConsistency de protectai/llm-guard.

Su relevancia radica en la combinación de licencia Apache-2.0, ausencia de trust_remote_code y un tamaño reducido (aproximadamente 13,6 veces menor que deberta-v3-large-zeroshot-v2.0), lo que permite desplegarlo como sidecar de CPU en el borde (edge) con latencia muy baja. El modelo está entrenado y validado hasta 3.584 tokens, con una ventana de backbone de 7.999 tokens, y se distribuye con exportaciones ONNX verificadas por paridad.

Forma parte de la familia zeroshot-policy-guard, junto con las variantes small (140,6 M, 18+ idiomas) y base (307,5 M, 18+ idiomas). Este modelo es exclusivamente para inglés y se orienta a la moderación de temas, la aplicación de políticas y la verificación de consistencia factual en pipelines RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT, base jhu-clsp/ettin-encoder-32m) |
| Parametros totales | 32.031.746 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 7.999 tokens de backbone; afinado y validado hasta 3.584 tokens |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; la model card menciona exportaciones FP32 y FP16 en ONNX) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (onnx/model.onnx) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde jhu-clsp/ettin-encoder-32m y afinado para clasificación NLI de dos clases (0: entailment, 1: not_entailment). Emplea pooling global mediante el token [CLS] con atención global nativa, lo que permite manejar secuencias largas sin depender de mecanismos adicionales. La ventana de backbone es de 7.999 tokens, aunque el ajuste fino y la validación se realizaron hasta 3.584 tokens.

El entrenamiento combina varios conjuntos de datos: MoritzLaurer/synthetic_zeroshot_mixtral_v0.1, alisawuffles/WANLI, nyu-mll/multi_nli, ToxicityPrompts/PolyGuardMix y nvidia/Aegis-AI-Content-Safety-Dataset-2.0. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO. La model card indica que las evaluaciones se realizaron sobre particiones estrictamente zero-shot out-of-distribution (OOD), con deduplicación MD5 y scripts reproducibles (scripts/eval_suite.py, scripts/eval_needle_ood.py).

## Capacidades

- Clasificación zero-shot de temas y políticas mediante el pipeline zero-shot-classification de transformers, con plantilla de hipótesis configurable.
- Clasificación NLI binaria nativa (entailment / not_entailment) con esquema exacto de dos clases.
- Integración directa como drop-in en protectai/llm-guard 0.3.16 para los escáneres BanTopics y FactualConsistency, tanto en PyTorch como en ONNX CPU.
- Aplicación de políticas y bloqueo de temas (ban-topics) en entradas y salidas de LLM.
- Verificación de consistencia factual para pipelines RAG, comparando contexto recuperado con afirmaciones generadas.
- Inferencia en CPU de muy baja latencia gracias a su tamaño de 32 M de parámetros y a las exportaciones ONNX.
- Soporte de contexto largo de hasta 2.048 tokens en las configuraciones de ejemplo de llm-guard y hasta 3.584 tokens validados.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es un clasificador encoder-only, no un modelo generativo.
- Capacidades multilingües: no disponibles; el modelo es solo para inglés.

## Casos de uso

- Moderación de temas en asistentes conversacionales: se configura BanTopics con la lista de temas prohibidos y un umbral (por ejemplo, 0,75) para bloquear consultas sobre asesoramiento financiero, armas u otros temas sensibles antes de que lleguen al LLM principal, con latencia mínima en CPU.
- Aplicación de políticas corporativas en prompts: se define una lista de políticas (por ejemplo, "confidential data", "legal advice") y se clasifica cada prompt entrante para decidir si se permite, se redirige o se registra para auditoría.
- Verificación de consistencia factual en RAG: se compara el contexto recuperado (premisa) con la afirmación generada (hipótesis) usando la salida NLI; si la probabilidad de entailment es baja, se marca la respuesta para revisión o se regenera.
- Filtrado de salidas de LLM en producción: se ejecuta como sidecar ONNX en CPU junto al servicio principal para detectar respuestas que caigan en temas prohibidos sin penalizar el throughput del modelo generativo.
- Clasificación zero-shot de tickets de soporte: se etiquetan consultas entrantes en categorías definidas en tiempo de inferencia (facturación, ingeniería, deportes, etc.) sin reentrenamiento, usando hypothesis_template para adaptar la formulación.
- Detección de contenido tóxico o inseguro: aprovechando el entrenamiento con PolyGuardMix y Aegis-AI-Content-Safety-Dataset-2.0, se puede usar como primera capa de filtrado en foros o comentarios, con la salvedad de que es solo para inglés.
- Enrutamiento de consultas en sistemas multiagente: se clasifica la intención del usuario contra un conjunto de agentes disponibles y se deriva la petición al especialista correspondiente, todo en el mismo proceso de CPU.

## Benchmarks y rendimiento

La model card reporta métricas como proporciones en [0, 1] sobre particiones estrictamente zero-shot OOD. Los datos disponibles en la información proporcionada son parciales:

| Benchmark | Metrica | Resultado |
|---|---|---|
| OOD ContractNLI | AUC | 0,704 (el mejor de la familia según la model card) |
| OOD XNLI (zero-shot) | AUC | no disponible para esta variante tiny (la variante small reporta 0,873 y la base 0,917) |

No se han publicado en la información disponible resultados completos de MMLU, HumanEval, GSM8K ni de las particiones de AG News mencionadas en la model card (el texto se interrumpe antes de detallar los valores). No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (32 M de parámetros, aproximadamente 128 MB de pesos) y aproximadamente 64 MB en FP16; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; está diseñado para CPU. En caso de usar GPU, cualquier RTX 3060 o superior es más que suficiente, aunque el beneficio frente a CPU es marginal.
- Cabe en GPU consumer: sí, en todas las RTX y en iGPU con soporte ONNX Runtime.
- Opciones de despliegue: transformers (>=4.48.0), ONNX Runtime (CPUExecutionProvider), protectai/llm-guard 0.3.16 con extra onnxruntime, y servicio sidecar HTTP propio.
- Latencia y throughput estimados: no disponibles de forma numérica en la información proporcionada; la model card lo describe como "ultra-fast CPU edge guardrail" y destaca que es aproximadamente 13,6 veces menor que deberta-v3-large-zeroshot-v2.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Tamarillo/zeroshot-policy-guard-tiny-en | 32,0 M | 7.999 backbone / 3.584 validado | Ingles | Apache-2.0 | AUC 0,704 en OOD ContractNLI; drop-in llm-guard |
| Tamarillo/zeroshot-policy-guard-small | 140,6 M | no disponible | 18+ | Apache-2.0 (segun familia) | AUC 0,873 en OOD XNLI; aproximadamente 4,0 veces menor que bge-m3-zeroshot-v2.0 |
| Tamarillo/zeroshot-policy-guard-base | 307,5 M | no disponible | 18+ | Apache-2.0 (segun familia) | AUC 0,917 en OOD XNLI; mayor precisión multilingüe de la familia |
| deberta-v3-large-zeroshot-v2.0 | no disponible | no disponible | no disponible | no disponible | Referencia de tamaño: el tiny es aproximadamente 13,6 veces menor |

## Limitaciones y advertencias

- Solo soporta inglés; no debe usarse para moderación o clasificación en otros idiomas sin una variante multilingüe (small o base).
- Es un clasificador NLI, no un generador: no produce texto, no razona de forma multi-paso y no soporta tool calling ni agentes.
- Riesgo de falsos positivos y negativos en la aplicación de políticas: la model card advierte que con BanTopics y solo dos temas, uno siempre tendrá probabilidad >= 0,50 por la normalización multi_label=False; se recomienda umbral 0,75, un tema benigno de catch-all o multi_label=True.
- Caveat en FactualConsistency de llm-guard: la implementación upstream pasa (output, prompt) al tokenizador, invirtiendo el orden estándar (premise, hypothesis); para verificación RAG con contextos largos conviene llamar directamente a transformers u ONNX Runtime con (contexto_recuperado, afirmación).
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse con datasets de moderación y NLI, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede producir clasificaciones erróneas en dominios muy alejados de la distribución de entrenamiento (OOD).
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- Para producción: requiere transformers >= 4.48.0 para soporte nativo de ModernBERT y no usa trust_remote_code; verificar la paridad de las exportaciones ONNX en el entorno de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/zeroshot-policy-guard-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Dataset MoritzLaurer/synthetic_zeroshot_mixtral_v0.1: https://huggingface.co/datasets/MoritzLaurer/synthetic_zeroshot_mixtral_v0.1
- Dataset alisawuffles/WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset nyu-mll/multi_nli: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset ToxicityPrompts/PolyGuardMix: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- protectai/llm-guard: https://github.com/protectai/llm-guard
- Scripts de evaluación y resultados: scripts/eval_suite.py, scripts/eval_needle_ood.py, eval_results.json, needle_ood.json (referenciados en la model card del repositorio)
