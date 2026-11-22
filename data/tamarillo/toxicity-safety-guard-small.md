# Tamarillo/toxicity-safety-guard-small

## Resumen

Tamarillo/toxicity-safety-guard-small es un clasificador de toxicidad y seguridad de contenido multi-etiqueta desarrollado por Tamarillo, construido sobre el encoder jhu-clsp/mmBERT-small (140,6 millones de parámetros). Resuelve un problema concreto en pipelines de LLM: la necesidad de un guardrail comercialmente limpio (Apache-2.0), sin `trust_remote_code`, que detecte contenido tóxico y riesgos de seguridad en aplicaciones con agentes y modelos generativos. Forma parte de una familia de tres tamaños (tiny-en de 32,0M, small de 140,6M y base de 307,5M) que cubren distintos compromisos entre precisión y velocidad.

El modelo emplea una cabeza de 8 sigmoides independientes: las 7 etiquetas exactas que usa el escáner `Toxicity` de `protectai/llm-guard` (`toxicity`, `severe_toxicity`, `obscene`, `threat`, `insult`, `identity_attack`, `sexual_explicit`) más una octava etiqueta propia, `unsafe_ai_content`, orientada a riesgos modernos de LLM y agentes. Está entrenado y validado para secuencias de hasta 3.584 tokens, con una ventana de backbone de 8.192, lo que lo hace adecuado para moderar prompts y respuestas largas sin truncar agresivamente.

Su relevancia actual radica en la combinación de licencia permisiva, soporte multilingüe (17 idiomas), exportaciones ONNX verificadas y compatibilidad directa con `llm-guard` 0.3.16, lo que permite sustituir clasificadores con licencias más restrictivas o arquitecturas monolingües en entornos de producción sin reescribir el código del escáner.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) sobre jhu-clsp/mmBERT-small, con pooling global `[CLS]` y atención nativa |
| Parámetros totales | 140.644.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de backbone; entrenado y validado hasta 3.584 tokens |
| Tipos de cuantización | ONNX FP32 y ONNX FP16 (`onnx/model.onnx`, `onnx/model_fp16.onnx`); safetensors en el repo |
| Idiomas soportados | en, ar, cs, de, es, fr, hi, it, ja, ko, nl, pl, pt, ru, sv, th, zh (17) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 140,6M de parámetros derivado de jhu-clsp/mmBERT-small, un backbone multilingüe. La cabeza de clasificación es multi-etiqueta con 8 salidas sigmoides independientes (no softmax), lo que permite que un mismo texto active simultáneamente varias categorías (por ejemplo, `toxicity` e `insult`). El pooling se realiza mediante el token `[CLS]` con atención global, coherente con el diseño de ModernBERT. La inferencia no requiere `trust_remote_code` con `transformers>=4.48.0`.

El entrenamiento combina datasets multilingües y de seguridad: google/civil_comments, nvidia/Aegis-AI-Content-Safety-Dataset-2.0, OpenSafetyLab/Salad-Data, ToxicityPrompts/PolyGuardMix, argilla/ultrafeedback-binarized-preferences-cleaned y CohereForAI/aya_dataset. La model card no detalla el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles. Sí se documenta una suite de evaluación unificada (`scripts/eval_suite.py`) con resultados en `eval_results.json` sobre splits de test retenidos, comparando con `s-nlp/roberta_toxicity_classifier`, KoalaAI y Qwen3Guard-Gen-0.6B.

## Capacidades

- Clasificación multi-etiqueta de toxicidad con 8 cabeceras sigmoides independientes: `toxicity`, `severe_toxicity`, `obscene`, `threat`, `insult`, `identity_attack`, `sexual_explicit` y `unsafe_ai_content`.
- Detección de riesgos de seguridad en contenido generado por LLM y agentes mediante la cabecera `unsafe_ai_content`, que `llm-guard` no evalúa por defecto.
- Soporte multilingüe en 17 idiomas, incluyendo español, inglés, árabe, chino, japonés, coreano, hindi y la mayoría de lenguas europeas principales.
- Procesamiento de textos largos: ventana de backbone de 8.192 tokens y validación hasta 3.584 tokens, útil para prompts y respuestas extensas.
- Integración drop-in con `protectai/llm-guard` 0.3.16 en modo PyTorch y ONNX CPU, sin cambios en el código del escáner.
- Exportaciones ONNX FP32 y FP16 verificadas para despliegue en CPU sin GPU.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de prompts en aplicaciones de chat: el modelo se coloca como escáner de entrada en `llm-guard` y bloquea mensajes tóxicos antes de que lleguen al LLM, con umbral configurable (por ejemplo, 0.5) y ventana de 2.048 tokens que cubre la mayoría de prompts de usuario.
- Moderación de respuestas generadas: se aplica sobre la salida del LLM para detectar insultos, amenazas o contenido sexual explícito antes de mostrarlo al usuario final, aprovechando las 7 etiquetas compatibles con `llm-guard`.
- Guardrail para agentes autónomos: la cabecera `unsafe_ai_content` permite marcar instrucciones o acciones que caen en categorías de riesgo de seguridad de IA, integrándose en el bucle de planificación del agente mediante llamada directa a `transformers.pipeline` u ONNX Runtime.
- Moderación de comunidades multilingües: con 17 idiomas cubiertos, un mismo modelo sirve para foros o plataformas con usuarios en español, inglés, árabe, hindi, chino y otras lenguas, evitando mantener clasificadores separados por idioma.
- Filtrado de datasets de entrenamiento: se puede ejecutar en lote sobre corpus de preentrenamiento o de instrucciones para eliminar muestras tóxicas antes de fine-tuning, usando ONNX FP16 en CPU para reducir coste de infraestructura.
- Sidecar de seguridad en CPU: al exportarse a ONNX y ejecutarse sin GPU, se despliega como servicio auxiliar junto a la API del LLM principal, añadiendo latencia baja y sin competir por VRAM con el modelo generativo.
- Cumplimiento y auditoría de contenido: registro de puntuaciones por etiqueta para revisión humana posterior, útil en flujos que requieren trazabilidad de decisiones de moderación.

## Benchmarks y rendimiento

La model card menciona una evaluación unificada sobre splits de test retenidos (ID) con métricas en proporción [0.000, 1.000], comparando con `s-nlp/roberta_toxicity_classifier`, KoalaAI y Qwen3Guard-Gen-0.6B, con resultados en `eval_results.json`. Sin embargo, los valores numéricos concretos no están incluidos en la información proporcionada, por lo que no se presentan cifras.

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,6 GB para los pesos (140,6M parámetros × 4 bytes), más activaciones; en la práctica, menos de 2 GB para lotes pequeños y secuencias de 2.048 tokens.
- VRAM estimada en FP16: aproximadamente 0,3 GB para los pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para alto throughput, una RTX 4090, A100 o H100 permiten procesar lotes grandes, aunque el modelo está diseñado para ejecutarse eficientemente en CPU.
- Cabe en cualquier GPU consumer (GTX 1060 6GB, RTX 3060, RTX 4090) y en entornos sin GPU mediante ONNX Runtime con `CPUExecutionProvider`.
- Opciones de despliegue: `transformers` (pipeline), ONNX Runtime (FP32 o FP16), `llm-guard[onnxruntime]==0.3.16`, y `text-embeddings-inference` según los tags del repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Etiquetas |
|---|---|---|---|---|---|
| Tamarillo/toxicity-safety-guard-small | 140,6M | 8.192 backbone / 3.584 validado | 17 | Apache-2.0 | 8 sigmoides (incluye `unsafe_ai_content`) |
| Tamarillo/toxicity-safety-guard-tiny-en | 32,0M | no disponible | en | Apache-2.0 (según familia) | 8 sigmoides |
| Tamarillo/toxicity-safety-guard-base | 307,5M | no disponible | 17 | Apache-2.0 (según familia) | 8 sigmoides |
| unitary/toxic-bert | no disponible | no disponible | en | no disponible | 6 etiquetas con nombres distintos (`toxic`, `identity_hate`) |
| s-nlp/roberta_toxicity_classifier | no disponible | no disponible | en | no disponible | 2 clases softmax (`neutral`/`toxic`) |
| Qwen3Guard-Gen-0.6B | 0,6B | no disponible | multilingüe | no disponible | generativo |

El modelo se posiciona como alternativa Apache-2.0 a `unitary/toxic-bert` y `s-nlp/roberta_toxicity_classifier`, con más etiquetas, cobertura multilingüe y contexto más largo, aunque no es drop-in para ellos (requiere un adaptador de 3 líneas por los distintos nombres y formatos de etiquetas).

## Limitaciones y advertencias

- Es un clasificador, no un generador: no produce texto, no razona y no soporta tool calling ni agentes por sí mismo.
- La cabecera `unsafe_ai_content` no se evalúa en `llm-guard` por defecto; para puntuarla hay que llamar al modelo directamente con `transformers.pipeline` u ONNX Runtime.
- No es drop-in para `unitary/toxic-bert` ni para `s-nlp/roberta_toxicity_classifier`: los nombres y el formato de etiquetas difieren y requieren un adaptador.
- Riesgo de falsos positivos y negativos inherente a la moderación automática; se recomienda calibrar el umbral (por defecto 0.5 en `llm-guard`) con datos propios.
- Sesgos potenciales derivados de los datasets de entrenamiento (Civil Comments, Aegis 2.0, Salad-Data, PolyGuardMix, UltraFeedback, Aya); la model card no detalla análisis de sesgo por idioma o dominio.
- Cobertura desigual entre los 17 idiomas: el entrenamiento combina datos multilingües con datos principalmente en inglés, por lo que el rendimiento en lenguas de bajos recursos puede ser inferior.
- La validación de contexto llega a 3.584 tokens aunque el backbone soporte 8.192; secuencias más largas pueden degradar la calidad de clasificación.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los datasets de entrenamiento si se redistribuye el modelo.
- No se han publicado cifras de latencia ni throughput en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/toxicity-safety-guard-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Familia tiny-en: https://huggingface.co/Tamarillo/toxicity-safety-guard-tiny-en
- Familia base: https://huggingface.co/Tamarillo/toxicity-safety-guard-base
- `llm-guard`: https://github.com/protectai/llm-guard
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset OpenSafetyLab/Salad-Data: https://huggingface.co/datasets/OpenSafetyLab/Salad-Data
- Dataset ToxicityPrompts/PolyGuardMix: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Dataset argilla/ultrafeedback-binarized-preferences-cleaned: https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences-cleaned
- Dataset CohereForAI/aya_dataset: https://huggingface.co/datasets/CohereForAI/aya_dataset
