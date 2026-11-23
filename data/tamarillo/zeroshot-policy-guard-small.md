# Tamarillo/zeroshot-policy-guard-small

## Resumen

Tamarillo/zeroshot-policy-guard-small es un clasificador de entailment NLI (natural language inference) de dos etiquetas (`entailment` / `not_entailment`) construido sobre jhu-clsp/mmBERT-small, un encoder multilingüe de la familia ModernBERT. Lo desarrolla Tamarillo como parte de una familia de modelos de guardrail (tiny-en, small y base) orientada a la aplicación de políticas, el filtrado de temas y la verificación factual en pipelines de LLM. Con 140.642.306 parámetros, ofrece una ventana de contexto del backbone de 8.192 tokens (validada hasta 3.584) y cubre 18 idiomas, incluido el castellano.

El modelo resuelve un problema concreto: disponer de un clasificador zero-shot comercialmente limpio (licencia Apache-2.0, sin `trust_remote_code`) que funcione como drop-in de `transformers.pipeline("zero-shot-classification")` y de los escáneres `BanTopics` y `FactualConsistency` de `protectai/llm-guard`. Frente a alternativas como `bge-m3-zeroshot-v2.0` es aproximadamente 4,0 veces más pequeño, y frente a `mDeBERTa-v3-base-mnli-xnli` unas 2,0 veces más pequeño, lo que lo hace adecuado para sidecars de CPU en producción.

La relevancia actual reside en su combinación de contexto largo, multilingüismo amplio, exportaciones ONNX verificadas en paridad y compatibilidad directa con el stack de guardrails más extendido, sin dependencias de código remoto ni licencias restrictivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small) con pooling global `[CLS]` |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en el backbone; fine-tuning y validación hasta 3.584 tokens |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; el README menciona soporte de ONNX FP32 y FP16) |
| Idiomas soportados | en, ar, cs, de, es, fr, hi, id, it, ja, ko, nl, pl, pt, ru, sv, th, tr, zh (18+) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (`onnx/model.onnx`) |
| Tarea | Clasificación zero-shot / NLI (2 clases: `0: entailment`, `1: not_entailment`) |
| Modelo base | jhu-clsp/mmBERT-small |
| Requisitos de librería | `transformers>=4.48.0` (soporte nativo de ModernBERT, sin `trust_remote_code`) |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de la familia ModernBERT, concretamente el checkpoint multilingüe jhu-clsp/mmBERT-small, adaptado a una cabeza de clasificación NLI de dos clases. Emplea pooling global mediante el token `[CLS]`, lo que permite agregar información de secuencias largas sin mecanismos adicionales. El backbone soporta 8.192 tokens de contexto, aunque el ajuste fino y la validación se realizaron hasta 3.584 tokens, dato relevante para dimensionar el truncado en producción.

El entrenamiento combina varios conjuntos de datos: MoritzLaurer/synthetic_zeroshot_mixtral_v0.1, alisawuffles/WANLI y nyu-mll/multi_nli para la tarea NLI general; ToxicityPrompts/PolyGuardMix y nvidia/Aegis-AI-Content-Safety-Dataset-2.0 para seguridad de contenido; y mteb/amazon_massive_intent y mteb/amazon_massive_scenario para clasificación de intenciones y escenarios. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron etapas de RLHF o DPO (poco habituales en un encoder NLI). Sí se indica que la evaluación se realizó sobre splits estrictamente out-of-distribution, con deduplicación por MD5 normalizado de espacios en blanco y scripts reproducibles (`scripts/eval_suite.py`, `scripts/eval_needle_ood`). Las exportaciones ONNX están verificadas en paridad respecto a PyTorch.

## Capacidades

- Clasificación zero-shot de texto en etiquetas arbitrarias mediante plantilla de hipótesis (por ejemplo, `"This text is about {}."`).
- NLI de dos clases (`entailment` / `not_entailment`), apto para verificación de afirmaciones contra premisas.
- Aplicación de políticas y filtrado de temas (guardrails): detección de solicitudes sobre temas prohibidos como asesoramiento financiero o armas.
- Verificación de consistencia factual para pipelines RAG, comparando documentos recuperados con afirmaciones generadas.
- Clasificación de intenciones y escenarios (entrenado con datos de Amazon MASSIVE).
- Detección de contenido tóxico o inseguro (datos PolyGuardMix y Aegis AI Content Safety).
- Soporte multilingüe en 18 idiomas, incluidos español, inglés, francés, alemán, portugués, italiano, árabe, hindi, japonés, coreano y chino.
- Integración directa con `protectai/llm-guard` (`BanTopics` y `FactualConsistency`) sin cambios en el código de los escáneres.
- Ejecución en CPU mediante ONNX Runtime, con exportación ONNX verificada.
- No dispone de tool calling, generación de texto, razonamiento multi-paso ni capacidades de agente: es exclusivamente un clasificador.

## Casos de uso

- Moderación de entrada en asistentes conversacionales: se usa `BanTopics` con una lista de temas prohibidos y un umbral de 0,75 para bloquear solicitudes antes de que lleguen al LLM. El contexto largo permite evaluar prompts extensos sin truncar agresivamente.
- Verificación factual en RAG: se pasa el contexto recuperado como premisa y la afirmación generada como hipótesis para comprobar si el modelo la respalda, reduciendo alucinaciones en respuestas documentales.
- Enrutado de intenciones en atención al cliente: clasificación zero-shot de la consulta del usuario en categorías de negocio (facturación, soporte técnico, reclamaciones) sin entrenamiento adicional, usando las etiquetas como candidatas.
- Cumplimiento de políticas internas: clasificación de correos o tickets contra políticas corporativas (por ejemplo, "divulgación de datos confidenciales") para marcar revisiones humanas.
- Filtrado de contenido en comunidades y foros: detección multilingüe de mensajes tóxicos o fuera de tema antes de su publicación, con inferencia en CPU como sidecar.
- Clasificación de documentos multilingües: asignación de etiquetas temáticas a documentos en cualquiera de los 18 idiomas soportados, con un único modelo en lugar de pipelines por idioma.
- Prefiltrado en pipelines de datos: descarte de muestras irrelevantes o inseguras antes de alimentar un LLM generador, reduciendo coste computacional aguas abajo.

## Benchmarks y rendimiento

Los datos disponibles en la model card incluyen métricas de evaluación zero-shot OOD (proporciones en el rango [0,000, 1,000]):

| Benchmark | Métrica | Resultado |
|---|---|---|
| OOD XNLI (zero-shot) | AUC | 0,873 |
| OOD ContractNLI (referencia de familia, modelo tiny-en) | AUC | 0,704 |

La model card menciona que la familia incluye resultados de precisión en temas y de `OOD XNLI`, pero no se detallan en la información proporcionada los valores completos por benchmark ni comparaciones numéricas con modelos alternativos. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 140,6 M de parámetros; en FP32 ocupa aproximadamente 0,56 GB de pesos, y en FP16 alrededor de 0,28 GB. Con activaciones y overhead, cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (RTX 3060, RTX 4090, T4, L4, A10, A100, H100). El modelo está pensado también para ejecución en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en hardware de gama baja.
- Opciones de despliegue: `transformers` (pipeline de zero-shot-classification), ONNX Runtime (CPU o GPU), integración con `llm-guard[onnxruntime]==0.3.16`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un encoder de clasificación.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible. El tamaño reducido y la exportación ONNX sugieren latencias de pocos milisegundos por lote en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Tamarillo/zeroshot-policy-guard-small | 140,6 M | 8.192 (validado 3.584) | 18+ | Apache-2.0 | Drop-in de llm-guard, ONNX verificado, AUC 0,873 en OOD XNLI |
| bge-m3-zeroshot-v2.0 | no disponible (≈4,0x mayor según el autor) | no disponible | multilingüe | no disponible | Referencia de comparación citada por el autor |
| mDeBERTa-v3-base-mnli-xnli | no disponible (≈2,0x mayor según el autor) | no disponible | multilingüe | no disponible | Clasificador NLI multilingüe de referencia |
| Tamarillo/zeroshot-policy-guard-base | 307,5 M | no disponible | 18+ | Apache-2.0 | Mayor AUC multilingüe OOD XNLI (0,917) de la familia |
| Tamarillo/zeroshot-policy-guard-tiny-en | 32,0 M | no disponible | inglés | Apache-2.0 | Ultra rápido para edge, AUC 0,704 en OOD ContractNLI |

Los parámetros y contextos de bge-m3-zeroshot-v2.0 y mDeBERTa-v3-base-mnli-xnli no se detallan en la información proporcionada; solo se indica la relación de tamaño relativo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona multi-paso y no soporta tool calling ni agentes.
- Riesgo de falsos positivos y negativos en la clasificación zero-shot; el README advierte que con `BanTopics` y solo dos temas, uno siempre obtendrá una probabilidad ≥ 0,50 por la normalización `multi_label=False`, por lo que se recomienda umbral 0,75 o incluir un tema benigno de cobertura.
- La advertencia sobre `FactualConsistency` de `llm-guard`: el escáner upstream invierte el orden estándar `(premisa, hipótesis)` al llamar al tokenizador; para verificación RAG conviene invocar directamente el modelo con `(contexto_recuperado, afirmación)`.
- El contexto validado es de 3.584 tokens, inferior a los 8.192 del backbone; secuencias más largas pueden degradar la precisión.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse con datasets de seguridad y NLI, puede heredar sesgos de esas fuentes.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero no se ofrece garantía alguna sobre el rendimiento en dominios no evaluados.
- El modelo está recién publicado (creado el 2026-11-23) con 0 descargas y 0 likes, por lo que carece de validación externa de la comunidad.
- No se dispone de información sobre cuantizaciones más allá de ONNX FP32/FP16; no se confirma soporte de GGUF ni de cuantización de 4 bits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/zeroshot-policy-guard-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Familia de modelos: https://huggingface.co/Tamarillo/zeroshot-policy-guard-tiny-en, https://huggingface.co/Tamarillo/zeroshot-policy-guard-base
- `protectai/llm-guard`: https://github.com/protectai/llm-guard
- Dataset MoritzLaurer/synthetic_zeroshot_mixtral_v0.1: https://huggingface.co/datasets/MoritzLaurer/synthetic_zeroshot_mixtral_v0.1
- Dataset alisawuffles/WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset nyu-mll/multi_nli: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset ToxicityPrompts/PolyGuardMix: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset mteb/amazon_massive_intent: https://huggingface.co/datasets/mteb/amazon_massive_intent
- Dataset mteb/amazon_massive_scenario: https://huggingface.co/datasets/mteb/amazon_massive_scenario
- Scripts de evaluación: `scripts/eval_suite.py` y `scripts/eval_needle_ood` (referenciados en el repositorio del modelo)
