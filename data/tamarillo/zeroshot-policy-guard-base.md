# Tamarillo/zeroshot-policy-guard-base

## Resumen

`Tamarillo/zeroshot-policy-guard-base` es un clasificador zero-shot de entailment (NLI) y de políticas/temas construido sobre `jhu-clsp/mmBERT-base`, un encoder ModernBERT multilingüe de 307,5 millones de parámetros. Lo desarrolla Tamarillo como pieza central de su familia `zeroshot-policy-guard`, orientada a guardrails de LLM (filtrado de temas prohibidos, verificación de consistencia factual, aplicación de políticas). El modelo resuelve un problema concreto: disponer de un clasificador NLI multilingüe, de licencia limpia (Apache-2.0) y sin `trust_remote_code`, que pueda sustituir directamente modelos como `bge-m3-zeroshot-v2.0` en pipelines de `llm-guard` o en el pipeline `zero-shot-classification` de Transformers.

Su relevancia actual radica en tres factores: cubre 18+ idiomas con el mayor rendimiento multilingüe de su familia (AUC OOD XNLI de 0,917), es aproximadamente 1,85 veces más pequeño que `bge-m3-zeroshot-v2.0`, y ofrece exportaciones ONNX verificadas en paridad con PyTorch, lo que permite desplegarlo como sidecar de CPU en producción. El backbone soporta ventanas de 8.192 tokens, aunque el ajuste fino y la validación se realizaron hasta 3.584 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, `jhu-clsp/mmBERT-base`) con pooling global `[CLS]` |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en backbone; ajustado y validado hasta 3.584 tokens |
| Tipos de cuantizacion | ONNX FP32 y FP16 (exportaciones verificadas en paridad); cuantizaciones GGUF no disponibles |
| Idiomas soportados | en, ar, cs, de, es, fr, hi, id, it, ja, ko, nl, pl, pt, ru, sv, th, tr, zh (18+) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder ModernBERT multilingüe con atención global sobre el token `[CLS]` y ventana nativa de 8.192 tokens. Sobre esa base se aplica un ajuste fino de clasificación NLI con esquema estricto de dos clases (`0: entailment`, `1: not_entailment`), lo que lo convierte en un drop-in nativo para el pipeline `zero-shot-classification` de Transformers y para los escáneres `BanTopics` y `FactualConsistency` de `protectai/llm-guard`.

El entrenamiento combina datasets sintéticos y reales: `MoritzLaurer/synthetic_zeroshot_mixtral_v0.1`, `alisawuffles/WANLI`, `nyu-mll/multi_nli`, `ToxicityPrompts/PolyGuardMix`, `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, `mteb/amazon_massive_intent` y `mteb/amazon_massive_scenario`. No se documenta en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO (poco probable en un encoder de clasificación). La evaluación se realiza sobre splits OOD estrictamente zero-shot, con deduplicación MD5 normalizada por espacios en blanco, y los scripts de evaluación (`scripts/eval_suite.py`, `scripts/eval_needle_ood.py`) están publicados en el repositorio.

## Capacidades

- Clasificación zero-shot de temas y políticas mediante entailment NLI (esquema de 2 clases).
- Detección de temas prohibidos (`BanTopics`) en prompts de entrada a LLM.
- Verificación de consistencia factual (`FactualConsistency`) entre contexto recuperado y afirmación generada.
- Clasificación multilingüe en 18+ idiomas con el mejor rendimiento de su familia.
- Soporte de contexto largo: hasta 3.584 tokens validados, ampliable a 8.192 en backbone.
- Integración nativa con `transformers.pipeline("zero-shot-classification")` sin `trust_remote_code`.
- Compatibilidad drop-in con `llm-guard==0.3.16` (PyTorch y ONNX Runtime CPU).
- Exportación ONNX con paridad verificada frente a PyTorch.
- No soporta generación de texto, tool calling, agentes ni visión: es exclusivamente un encoder de clasificación.

## Casos de uso

- Filtrado de temas prohibidos en entrada de LLM: usar `BanTopics` con `Tamarillo/zeroshot-policy-guard-base` como modelo subyacente para bloquear consultas sobre asesoramiento financiero, armas o contenido regulado antes de que lleguen al modelo generativo, con `threshold=0.75` y `max_length=2048`.
- Verificación de RAG: comprobar que la respuesta generada es entailment del contexto recuperado pasando `(retrieved_context, claim)` directamente al modelo, evitando la inversión de orden de `FactualConsistency` upstream.
- Moderación de comunidades multilingües: clasificar mensajes en 18 idiomas con una sola instancia del modelo, aprovechando la AUC OOD XNLI de 0,917 para reducir falsos negativos en idiomas de menor recursos.
- Enrutado de consultas por tema: clasificar la intención del usuario (soporte técnico, finanzas, legal) para dirigirla al pipeline o al equipo adecuado, usando `multi_label=True` cuando varias etiquetas puedan coexistir.
- Sidecar de CPU en producción: desplegar `onnx/model.onnx` con ONNX Runtime en CPU junto al servidor de inferencia del LLM, sin GPU adicional, gracias a los 307,5M parámetros y a la exportación FP16/FP32.
- Validación de contratos y políticas internas: clasificar cláusulas de NDA o políticas corporativas frente a afirmaciones derivadas, usando el contexto largo (hasta 3.584 tokens) para cubrir documentos completos.
- Filtrado previo en pipelines de datos: etiquetar grandes volúmenes de texto por tema antes del entrenamiento o del indexado, aprovechando el throughput de un encoder de 307M frente a un LLM generativo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| OOD XNLI AUC (zero-shot, multilingue) | 0,917 |
| OOD ContractNLI AUC (familia, modelo tiny-en) | 0,704 (referencia de familia, no de este modelo) |
| OOD XNLI AUC (familia, modelo small) | 0,873 (referencia de familia) |
| Estado `llm-guard` 0.3.16 PyTorch (`BanTopics`, `FactualConsistency`) | PASS |
| Estado `llm-guard` 0.3.16 ONNX CPU (`BanTopics`, `FactualConsistency`) | PASS |

La model card solo publica la AUC OOD XNLI de 0,917 para este modelo y cifras de referencia de los modelos tiny y small de la familia. No se han publicado resultados desagregados por tarea (MMLU, HumanEval, GSM8K) porque el modelo no es generativo. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP16 (307,5M parámetros × 2 bytes) y 1,2 GB en FP32; el repositorio completo ocupa 3,1 GB por incluir safetensors y ONNX.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 de 4 GB; también funciona en CPU sin problema.
- Opciones de despliegue: `transformers` (>= 4.48.0), ONNX Runtime (CPU o GPU), `llm-guard` con `use_onnx=True`; vLLM, llama.cpp, Ollama y TGI no están soportados porque el modelo no es generativo.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; la model card indica exportaciones ONNX verificadas en paridad y un modelo tiny-en de 32M orientado a edge, pero no publica cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `Tamarillo/zeroshot-policy-guard-base` | 307,5M | 8.192 backbone / 3.584 validado | 18+ | Apache-2.0 | AUC OOD XNLI 0,917; ONNX verificado |
| `Tamarillo/zeroshot-policy-guard-small` | 140,6M | no disponible | 18+ | Apache-2.0 | ~4x menor que `bge-m3`; AUC OOD XNLI 0,873 |
| `Tamarillo/zeroshot-policy-guard-tiny-en` | 32,0M | no disponible | en | Apache-2.0 | AUC OOD ContractNLI 0,704; orientado a edge |
| `bge-m3-zeroshot-v2.0` | no disponible | no disponible | multilingue | no disponible | Referencia de tamano: este modelo es ~1,85x menor |

La comparativa se limita a la familia Tamarillo y a `bge-m3-zeroshot-v2.0` como referencia de tamano citada en la model card. No se dispone de datos de benchmarks comparativos con otros clasificadores NLI multilingües en la información proporcionada.

## Limitaciones y advertencias

- Es un encoder de clasificación: no genera texto, no razona de forma multi-step y no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplicable en sentido generativo, pero sí riesgo de falsos positivos/negativos en la clasificación NLI, especialmente con etiquetas ambiguas o solapadas.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse sobre datasets de seguridad y temas, puede heredar sesgos de esas fuentes.
- Limitación de contexto: aunque el backbone soporta 8.192 tokens, el ajuste fino y la validación se hicieron hasta 3.584 tokens; usar longitudes mayores puede degradar la precisión.
- `BanTopics` con `multi_label=False` normaliza probabilidades entre las etiquetas dadas, de modo que con solo 2 temas una siempre superará 0,50; se recomienda `threshold=0.75` o `multi_label=True`.
- `FactualConsistency` upstream invierte el orden `(premise, hypothesis)` al llamar al tokenizer; para verificación de RAG conviene llamar al modelo directamente con `(retrieved_context, claim)`.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento por si imponen restricciones adicionales.
- El modelo no incluye `trust_remote_code`, lo que simplifica el despliegue pero exige `transformers>=4.48.0` para soporte nativo de ModernBERT.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/zeroshot-policy-guard-base
- Familia `Tamarillo/zeroshot-policy-guard-tiny-en`: https://huggingface.co/Tamarillo/zeroshot-policy-guard-tiny-en
- Familia `Tamarillo/zeroshot-policy-guard-small`: https://huggingface.co/Tamarillo/zeroshot-policy-guard-small
- Modelo base `jhu-clsp/mmBERT-base`: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset `MoritzLaurer/synthetic_zeroshot_mixtral_v0.1`: https://huggingface.co/datasets/MoritzLaurer/synthetic_zeroshot_mixtral_v0.1
- Dataset `alisawuffles/WANLI`: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset `nyu-mll/multi_nli`: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset `ToxicityPrompts/PolyGuardMix`: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Dataset `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset `mteb/amazon_massive_intent`: https://huggingface.co/datasets/mteb/amazon_massive_intent
- Dataset `mteb/amazon_massive_scenario`: https://huggingface.co/datasets/mteb/amazon_massive_scenario
- Repositorio `protectai/llm-guard`: https://github.com/protectai/llm-guard
