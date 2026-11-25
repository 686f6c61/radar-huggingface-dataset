# Tamarillo/factcheck-gate-guard-small

## Resumen

Tamarillo/factcheck-gate-guard-small es un clasificador de texto de 141 millones de parámetros construido sobre `jhu-clsp/mmBERT-small` (ModernBERT) y publicado por el usuario Tamarillo. Su función no es generar texto, sino actuar como puerta de decisión binaria en pasarelas LLM: recibe un prompt y determina si requiere verificación factual (`1 = FACT_CHECK_NEEDED`) o si puede responderse directamente sin recuperación ni comprobación (`0 = NO_FACT_CHECK_NEEDED`). El esquema de etiquetas es idéntico al de `vllm-project/semantic-router`, lo que facilita su integración como enrutador semántico.

El modelo resuelve un problema de coste y latencia en pipelines RAG y agentes: enviar a verificación cada consulta es caro e innecesario en prompts de código, matemáticas, reescritura o creatividad. Esta puerta filtra ese tráfico antes de la etapa de recuperación y se combina de forma nativa con `Tamarillo/groundedness-guard-base` para formar un pipeline de dos etapas (HaluGate) completamente Apache-2.0.

Es relevante por su perfil de despliegue: licencia permisiva, ausencia de `trust_remote_code`, pesos en safetensors y ONNX (incluida variante INT8 para CPU x86), soporte de Transformers.js en navegador y cobertura declarada de 14 idiomas. Todo ello lo sitúa como componente de infraestructura más que como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (`ModernBertForSequenceClassification`), transformer encoder con atención lineal |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (truncación indicada en los ejemplos de la model card) |
| Tipos de cuantizacion | FP32, FP16, INT8 (ONNX); pesos safetensors en precisión completa |
| Idiomas soportados | en, es, fr, de, pt, it, ja, zh, ru, ko, ar, pl, nl, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`model.onnx`, `model_fp16.onnx`, `model_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT pequeño (141M parámetros) con cabeza de clasificación de dos clases. ModernBERT sustituye la atención cuadrática clásica por atención lineal y rota posicional, lo que reduce el coste computacional en secuencias largas y explica que el modelo pueda procesar hasta 2048 tokens en CPU con latencias bajas. No emplea `trust_remote_code` ni adaptadores PEFT: se carga con `AutoModelForSequenceClassification` estándar.

Los datos de entrenamiento declarados incluyen `vllm-sr/fact-check-classification-dataset`, `OpenAssistant/oasst1` y `nvidia/HelpSteer2`. La model card menciona una calibración por verosimilitud negativa (NLL) con temperatura T=1.0812, publicada en `calibration.json`, para ajustar las probabilidades de salida. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset, y no se documenta el uso de RLHF o DPO, algo esperable en un clasificador supervisado.

## Capacidades

- Clasificación binaria de prompts: decide entre `NO_FACT_CHECK_NEEDED` y `FACT_CHECK_NEEDED`.
- Enrutamiento semántico en pasarelas LLM con el mismo esquema de etiquetas que `vllm-project/semantic-router`.
- Detección de consultas que requieren recuperación o verificación factual (fact-checking, RAG).
- Filtrado previo en pipelines de detección de alucinaciones de dos etapas junto a `groundedness-guard-base`.
- Capacidades multilingües declaradas en 14 idiomas, con evaluación OOD específica en más de 10 lenguas no inglesas.
- Inferencia en CPU mediante ONNX Runtime (INT8), en navegador vía Transformers.js y en servidores con Transformers.
- Salida de probabilidades calibradas para fijar umbrales de forma explícita.
- No genera texto, no soporta tool calling ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Puerta de entrada en una pasarela LLM: cada prompt entrante se clasifica antes de enrutarse; solo los marcados como `FACT_CHECK_NEEDED` pasan a recuperación y verificación, lo que elimina latencia y coste en consultas de código, matemáticas o creatividad.
- Pipeline RAG con verificación selectiva: combinado con `groundedness-guard-base`, se construye un flujo de dos etapas que solo verifica las respuestas susceptibles de contener afirmaciones factuales.
- Enrutador semántico compatible con `vllm-project/semantic-router`: al compartir el esquema de etiquetas, puede sustituir o complementar el clasificador de routing existente sin cambios en el consumidor.
- Sidecar de observabilidad en CPU: desplegado con ONNX Runtime INT8 junto al gateway, añade una comprobación de bajo coste sin consumir GPU.
- Moderación y guardrails en aplicaciones de chat: filtra consultas que exigen respuesta verificada antes de mostrarlas al usuario final.
- Clasificación en el navegador con Transformers.js: permite prefiltrar prompts en el cliente antes de enviarlos al servidor, reduciendo tráfico innecesario.
- Evaluación de tráfico multilingüe: al cubrir 14 idiomas, sirve para auditar qué proporción del tráfico de una aplicación requiere verificación factual por idioma.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Prompt fact-check y routing RAG (inglés, OOD) | Public Real Mixed OOD (SimpleQA + FRAMES vs HumanEvalPack + GSM8K, n=1.600) | ROC-AUC | 0,9855 |
| Prompt fact-check y routing RAG (inglés, OOD) | Public Real Mixed OOD (SimpleQA + FRAMES vs HumanEvalPack + GSM8K, n=1.600) | TPR@5%FPR | 0,9337 |
| Routing multilingüe (más de 10 idiomas no ingleses, OOD) | TyDiQA non-EN vs CohereLabs/aya_evaluation_suite non-EN (n=468) | ROC-AUC | 0,9946 |
| Routing multilingüe (más de 10 idiomas no ingleses, OOD) | TyDiQA non-EN vs CohereLabs/aya_evaluation_suite non-EN (n=468) | Macro-F1 | 0,9379 |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo. La model card cita además una ventaja de velocidad de 1,35x del ONNX INT8 frente a FP32 en CPU x86, y una latencia de 9,6 ms en CPU x86 para la variante `tiny-en`, no para este modelo.

## Requisitos de hardware

- VRAM estimada: el modelo completo en FP16 ocupa aproximadamente 280 MB de pesos; en FP32, unos 560 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU. Funciona en CPU x86 con ONNX Runtime; en GPU, cualquier tarjeta con más de 1 GB de memoria (RTX 3060, RTX 4090, A100, H100) es sobredimensionada para esta carga.
- Cabe en GPU consumer: sí, en todas las tarjetas actuales, e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime (CPU o GPU), Transformers.js en navegador, y como sidecar en pasarelas LLM. La model card etiqueta el repo con `text-embeddings-inference` y `endpoints_compatible`, por lo que es compatible con TEI y con Inference Endpoints.
- Latencia y throughput: la model card indica 1,35x de mejora con ONNX INT8 frente a FP32 en CPU x86. No se publican cifras de throughput ni latencia absoluta para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tamarillo/factcheck-gate-guard-small | 141M | 2048 | Clasificación binaria de necesidad de fact-check | Apache-2.0 | Hugging Face, ONNX, Transformers.js |
| Tamarillo/factcheck-gate-guard-tiny-en | no disponible | no disponible | Igual, solo inglés, menor tamaño (61,3 MB en FP16) | no disponible en la información | Hugging Face |
| Tamarillo/groundedness-guard-base | no disponible | no disponible | Verificación de groundedness por span de tokens (etapa 2) | Apache-2.0 | Hugging Face |
| vllm-project/semantic-router | no disponible | no disponible | Enrutamiento semántico en pasarelas LLM | no disponible en la información | Repositorio vllm-project |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible contrastar rendimiento entre ellos.

## Limitaciones y advertencias

- Es un clasificador binario: no genera respuestas ni verifica hechos por sí mismo; solo decide si hace falta verificación.
- Los benchmarks del model-index están marcados como `verified: false`; son cifras declaradas por el autor y no replicadas de forma independiente.
- El umbral de 0,5 es un valor por defecto; la model card recomienda calibrar el umbral sobre el tráfico real para un gating estricto de bajo coste.
- La evaluación OOD multilingüe se hizo con una muestra pequeña (n=468), lo que limita la robustez estadística de las métricas por idioma.
- No se documentan sesgos conocidos ni análisis de subgrupos; el entrenamiento con `oasst1` y `HelpSteer2` puede introducir sesgos de dominio y de estilo de prompt.
- Riesgo de falsos negativos: prompts factuales clasificados como `NO_FACT_CHECK_NEEDED` se saltarían la verificación, lo que puede propagar alucinaciones aguas abajo.
- La longitud de contexto útil es de 2048 tokens; prompts más largos se truncan y pueden perder la señal necesaria para clasificar correctamente.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/factcheck-gate-guard-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo complementario (etapa 2): https://huggingface.co/Tamarillo/groundedness-guard-base
- Variante tiny en inglés: https://huggingface.co/Tamarillo/factcheck-gate-guard-tiny-en
- Demo en navegador: https://huggingface.co/spaces/Tamarillo/factcheck-gate-guard-demo
- Dataset de clasificación: https://huggingface.co/datasets/vllm-sr/fact-check-classification-dataset
- Dataset OpenAssistant oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Enrutador semántico de referencia: https://github.com/vllm-project/semantic-router
