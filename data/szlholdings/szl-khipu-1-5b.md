# SZLHOLDINGS/SZL-Khipu-1.5B

## Resumen

SZL-Khipu-1.5B es un ajuste fino (fine-tune) del modelo base Qwen/Qwen2.5-1.5B-Instruct, publicado por la organizacion SZLHOLDINGS. El modelo se presenta como una "base de produccion para IA gobernada" (governed-AI production base model) dentro de la doctrina interna de la organizacion, con enfasis declarado en retrieval, abstención controlada (doctrine-abstention) y generacion anclada a contexto (grounded-only). Tecnicamente es un transformer decoder-only de 1.543.714.304 parametros (1,5B), derivado de la arquitectura Qwen2, entrenado mediante QLoRA y fusionado posteriormente en pesos completos (repo class MERGED).

La relevancia del modelo reside menos en capacidades frontier y mas en su enfoque de trazabilidad: la model card publica recibos firmados de entrenamiento y evaluacion (training_receipt.signed.json, eval_receipt.signed.json) y un conjunto de evaluaciones internas de planificacion, grounding y abstención. El entrenamiento reporta una perdida final de 0.0245 segun el recibo de entrenamiento. Es, por tanto, un modelo pequeno orientado a despliegues con requisitos de auditoria y control de respuestas, no un modelo generalista de altas prestaciones.

Al estar construido sobre Qwen2.5-1.5B-Instruct, hereda las capacidades linguisticas y de instruccion del modelo original, pero la model card solo declara soporte para ingles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las atribuciones habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste QLoRA fusionado |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero la model card no lo confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en BF16/FP16 es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen2, con 1,5B parametros, derivado del checkpoint Qwen/Qwen2.5-1.5B-Instruct. El ajuste se realizo mediante QLoRA (segun la etiqueta `qlora` de la model card) y los pesos resultantes fueron fusionados (repo class MERGED), de modo que el modelo se carga directamente con `AutoModelForCausalLM.from_pretrained` sin adaptadores separados.

El recibo de entrenamiento (`training_receipt.signed.json`) reporta una perdida final de entrenamiento de 0.0245. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales tras el ajuste supervisado. La model card menciona un "quant-curriculum-v1" asociado a los runs de evaluacion y un enfoque de "grounded-only" y "doctrine-abstention", lo que sugiere que el entrenamiento incorporo ejemplos orientados a citar contexto recuperado y a abstenerse cuando la evidencia es insuficiente, aunque los detalles concretos no estan publicados.

La innovacion declarada no es arquitectonica sino de gobernanza: cada metrica publicada enlaza un recibo firmado ("no receipt, no claim"), con doctrina interna versionada (v11-LOCKED) y un ledger de decisiones. Esto es relevante para pipelines que exigen trazabilidad de evaluaciones, pero no implica mejoras de rendimiento frente al modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones (instruction following) propio del modelo base.
- Generacion anclada a contexto recuperado (grounded-only), orientada a tareas de retrieval-augmented generation.
- Abstención controlada: el modelo esta ajustado para declinar responder cuando no dispone de evidencia suficiente (doctrine-abstention).
- Razonamiento multi-paso limitado, evaluado internamente en la metrica "Plan" (11/11 segun la model card).
- Soporte de tool calling / function calling: no confirmado explicitamente en la model card para este fine-tune (el modelo base Qwen2.5-Instruct lo soporta, pero no hay garantia de que se haya preservado).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente de retrieval con abstención: el modelo puede integrarse en pipelines RAG donde, ante ausencia de contexto relevante, debe responder que no dispone de informacion en lugar de alucinar. El ajuste doctrine-abstention lo hace adecuado para entornos donde una respuesta incorrecta es mas costosa que una no-respuesta.
- Atencion al cliente con base documental: al estar entrenado para generar solo a partir de contexto recuperado, puede usarse para responder consultas apoyadas en documentacion corporativa, con verificacion de grounding.
- Clasificacion y planificacion de tareas internas: la metrica "Plan" (11/11) sugiere uso en descomposicion de tareas y generacion de planes estructurados en flujos de agentes gobernados.
- Despliegue en entornos con requisitos de auditoria: los recibos firmados de entrenamiento y evaluacion permiten documentar el comportamiento del modelo en procesos de cumplimiento interno.
- Prototipado de bajo coste: con 1,5B parametros y pesos safetensors de 3,2 GB, puede ejecutarse en GPU de consumo para pruebas de concepto de agentes gobernados antes de escalar a modelos mayores.
- Evaluacion de politicas de abstención: util como banco de pruebas para medir la tasa de abstención correcta (2/6 en la evaluacion interna) y ajustar umbrales de confianza en sistemas de retrieval.
- Generacion de codigo o matematicas: no es un caso de uso respaldado por la model card; el modelo base tiene capacidades limitadas en esta area a 1,5B, y no hay evaluaciones publicadas que lo confirmen para este fine-tune.

## Benchmarks y rendimiento

La model card publica exclusivamente evaluaciones internas con recibos firmados, no benchmarks estandar de la comunidad. Los resultados disponibles son:

| Metrica | Resultado | Score |
|---|---|---|
| Plan | 11 / 11 | 100,0% |
| Grounding | 4 / 5 | 80,0% |
| Abstain | 2 / 6 | 33,3% |
| Mass battery (v2-trained) | 3 / 6 | MEASURED |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores corresponden a evaluaciones internas de la organizacion y no son directamente comparables con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica 4-6 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits: alrededor de 0,9 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para BF16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM en cuantizacion o BF16 con contexto limitado.
- Opciones de despliegue: transformers (carga directa segun el quickstart), text-generation-inference (etiqueta `text-generation-inference`), vLLM, llama.cpp/Ollama tras conversion a GGUF, endpoints compatibles (`endpoints_compatible`).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SZL-Khipu-1.5B | 1,5B | no disponible | Apache 2.0 | Fine-tune QLoRA de Qwen2.5-1.5B-Instruct con doctrina de abstención y recibos firmados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | Modelo base; capacidades generales de instruccion y tool calling |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens (segun documentacion de Meta) | Llama Community License | Alternativa de tamano similar, con restricciones de licencia distintas |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (segun documentacion de Hugging Face) | Apache 2.0 | Alternativa de tamano comparable orientada a eficiencia |

La comparativa de rendimiento no esta disponible: SZL-Khipu-1.5B solo publica metricas internas no comparables con benchmarks estandar.

## Limitaciones y advertencias

- Modelo de 1,5B parametros: capacidad de razonamiento y conocimiento factual limitada frente a modelos de mayor tamano; riesgo elevado de alucinacion fuera de contextos anclados.
- Tasa de abstención medida de 2/6 (33,3%) en la evaluacion interna: la politica de "no responder sin evidencia" no se cumple de forma fiable en todos los casos.
- Grounding medido en 4/5 (80,0%): existe margen de error en la generacion anclada a contexto.
- Soporte linguistico declarado unicamente en ingles; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no confirmada en la model card para este fine-tune; no asumir los 32.768 tokens del modelo base sin verificacion.
- La model card contiene metadatos de doctrina interna (v11-LOCKED, "Conjecture 1 — advisory, never a theorem") y marca `publication_eligible: false`; parte de la informacion es de governance interna y no verificable externamente.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los recibos y la documentacion de provenance por si existen condiciones adicionales de la organizacion.
- El modelo esta marcado como "MERGE" de un ajuste QLoRA: los pesos fusionados pueden presentar diferencias sutiles de comportamiento frente al adaptador original.
- No hay benchmarks estandar publicados, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- GitHub de la organizacion: https://github.com/szl-holdings
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de benchmarks: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/mass-battery-szl_khipu_1_5b_v2_trained.json
- Recibo de evaluacion: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B/blob/main/eval_receipt.signed.json
- Recibo de entrenamiento: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B/blob/main/training_receipt.signed.json
- Evaluacion de abstención: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B/blob/main/receipts/eval/doctrine-abstention-eval-2026-11-05.json
- Auditoria de readiness: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B/blob/main/PROMOTION_READINESS_AUDIT.json
- Fichero de publicacion: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B/blob/main/publication.json
