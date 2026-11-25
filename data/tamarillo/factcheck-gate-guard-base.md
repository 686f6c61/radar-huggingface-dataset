# Tamarillo/factcheck-gate-guard-base

## Resumen

Tamarillo/factcheck-gate-guard-base es un clasificador de texto de 308 millones de parámetros construido sobre jhu-clsp/mmBERT-base (ModernBERT multilingüe) y especializado en una tarea muy concreta: decidir si un prompt entrante requiere verificación factual o no. Emite dos etiquetas, `0=NO_FACT_CHECK_NEEDED` y `1=FACT_CHECK_NEEDED`, con el mismo esquema que utiliza vllm-project/semantic-router, lo que permite integrarlo como puerta de enrutamiento en pasarelas LLM, routers RAG y proxies de agentes sin código personalizado.

El modelo resuelve un problema de coste y latencia: en producción no tiene sentido lanzar un pipeline de recuperación y verificación de alucinaciones sobre prompts de programación, matemáticas, reescritura o escritura creativa. Esta puerta filtra esos casos y solo deriva a verificación los prompts que piden hechos verificables. Se complementa con Tamarillo/groundedness-guard-base para formar un pipeline HaluGate de dos etapas, ambas con licencia Apache-2.0.

La relevancia actual está en su enfoque de despliegue: sin `trust_remote_code`, compatible con `ModernBertForSequenceClassification` estándar de Transformers, con pesos ONNX (incluida variante FP16 de 587,1 MB) para CPU y navegador vía Transformers.js, y con umbral calibrado por NLL (temperatura 1,0334). Cubre 14 idiomas y está pensado como componente de observabilidad y guardrails en infraestructura de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) para clasificación de secuencias; clase `ModernBertForSequenceClassification` |
| Parametros totales | 307.531.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (truncación indicada en los ejemplos de la model card) |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16; no se documentan GGUF ni cuantizaciones de 4/8 bits |
| Idiomas soportados | en, es, fr, de, pt, it, ja, zh, ru, ko, ar, pl, nl, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) y ONNX (`onnx/model.onnx`, `onnx/model_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT (la base mmBERT de JHU CLSP, multilingüe) con una cabeza de clasificación binaria de dos logits. No emplea generación autoregresiva ni decodificación especulativa: es un clasificador discriminativo que produce una probabilidad de "requiere verificación factual". La model card destaca que no requiere `trust_remote_code` ni `peft`, y que la arquitectura es la estándar de Transformers, lo que simplifica auditoría y despliegue.

Los datos de entrenamiento declarados incluyen vllm-sr/fact-check-classification-dataset, OpenAssistant/oasst1 y nvidia/HelpSteer2. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo una fase de RLHF o DPO (poco habitual en un clasificador de este tipo). Sí se documenta una calibración de probabilidades por verosimilitud negativa (NLL) con temperatura 1,0334, publicada en `calibration.json`, que permite ajustar el umbral a la distribución real de tráfico.

## Capacidades

- Clasificación binaria de prompts: decide entre `NO_FACT_CHECK_NEEDED` y `FACT_CHECK_NEEDED`.
- Enrutamiento en pasarelas LLM y routers semánticos, con el esquema de etiquetas de vllm-project/semantic-router.
- Detección de prompts que requieren verificación factual en pipelines RAG.
- Filtrado previo a la verificación de groundedness (segunda etapa del pipeline HaluGate con Tamarillo/groundedness-guard-base).
- Soporte multilingüe en 14 idiomas, con evaluación específica en más de 10 idiomas no ingleses.
- Calibración de probabilidades opcional (temperatura 1,0334) para fijar umbrales estrictos de bajo coste.
- Inferencia en CPU mediante ONNX Runtime y en navegador mediante Transformers.js (`@huggingface/transformers>=3.5.1`).
- No genera texto, no hace tool calling ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Puerta de enrutamiento en una pasarela LLM: antes de enviar un prompt al modelo generador, se consulta este clasificador; si devuelve `NO_FACT_CHECK_NEEDED`, se omite el pipeline de recuperación y verificación, reduciendo latencia y coste en prompts de código, matemáticas o creatividad.
- Optimización de pipelines RAG: solo los prompts marcados como `FACT_CHECK_NEEDED` se envían a recuperación documental y a la etapa de verificación de spans, lo que evita recuperaciones innecesarias en consultas que no piden hechos.
- Guardrails de alucinaciones en dos etapas: combinado con Tamarillo/groundedness-guard-base, se construye un HaluGate completo donde la primera etapa filtra y la segunda verifica la fundamentación de la respuesta.
- Observabilidad de tráfico en producción: el clasificador permite etiquetar y medir qué proporción del tráfico entrante es de naturaleza factual, útil para dimensionar índices vectoriales y presupuestos de verificación.
- Despliegue en el borde o en el navegador: con la variante ONNX FP16 y Transformers.js se puede ejecutar la clasificación en cliente, aunque la model card advierte que para WASM conviene usar la variante `tiny-en` de 61,3 MB en lugar de esta base.
- Enrutamiento multilingüe en atención al cliente: con soporte para 14 idiomas y métricas OOD en más de 10 lenguas no inglesas, se puede aplicar la misma política de verificación a tráfico en español, francés, alemán, japonés, árabe, etc.
- Sidecar de CPU en gateways: mediante ONNX Runtime con `CPUExecutionProvider` se integra como servicio auxiliar de baja latencia sin ocupar GPU.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Enrutamiento de fact-check y verificacion RAG (OOD en ingles) | Public Real Mixed OOD (SimpleQA + FRAMES vs HumanEvalPack + GSM8K, n=1.600) | ROC-AUC | 0,9903 |
| Enrutamiento de fact-check y verificacion RAG (OOD en ingles) | Public Real Mixed OOD (SimpleQA + FRAMES vs HumanEvalPack + GSM8K, n=1.600) | TPR@5%FPR | 0,9738 |
| Enrutamiento multilingue (mas de 10 idiomas no ingleses, OOD) | TyDiQA non-EN vs CohereLabs/aya_evaluation_suite non-EN (n=468) | ROC-AUC | 0,9951 |
| Enrutamiento multilingue (mas de 10 idiomas no ingleses, OOD) | TyDiQA non-EN vs CohereLabs/aya_evaluation_suite non-EN (n=468) | Macro-F1 | 0,9701 |

No se han publicado en la información disponible resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) para este modelo, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada: el modelo en FP32 ocupa aproximadamente 1,2 GB de pesos (308 M de parámetros); en FP16, unos 0,6 GB. La inferencia en GPU requiere muy poca memoria adicional para activaciones con contexto de 2.048 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve; una RTX 4090, A100 o H100 lo ejecutan con holgura, pero están sobredimensionadas para esta carga.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) e incluso en iGPU con ONNX Runtime.
- Despliegue: Transformers (`AutoModelForSequenceClassification`), ONNX Runtime (CPU o GPU), Transformers.js para navegador y Text Embeddings Inference (el tag `text-embeddings-inference` figura en los metadatos). No se documenta soporte nativo de vLLM, llama.cpp ni Ollama para este clasificador.
- Latencia y throughput: la model card cita 9,6 ms en CPU x86 para la variante `tiny-en`; para esta variante `base` no se proporciona una cifra de latencia en la información disponible. El tamaño del repo (3,1 GB) incluye pesos en varios formatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tamarillo/factcheck-gate-guard-base | 308 M | 2.048 | Clasificacion binaria fact-check | Apache-2.0 | Hugging Face, ONNX, Transformers.js |
| Tamarillo/factcheck-gate-guard-tiny-en | no disponible (ONNX FP16 de 61,3 MB) | no disponible | Clasificacion binaria fact-check, solo ingles | no disponible en la informacion | Hugging Face |
| Tamarillo/groundedness-guard-base | no disponible | no disponible | Verificacion de fundamentacion (segunda etapa) | Apache-2.0 | Hugging Face |
| vllm-project/semantic-router | no disponible | no disponible | Enrutamiento semantico de prompts | no disponible | Repositorio del proyecto |

No se dispone en la información proporcionada de comparativas con clasificadores de terceros (por ejemplo, detectores de alucinación o routers genéricos) con métricas equiparables.

## Limitaciones y advertencias

- Es un clasificador binario, no un verificador de hechos: indica si conviene verificar, no si una afirmación es verdadera o falsa.
- Riesgo de falsos negativos y positivos: los umbrales deben calibrarse sobre el tráfico real; la model card recomienda ajustar el umbral para un filtrado estricto de bajo coste.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La longitud de contexto efectiva es de 2.048 tokens con truncación; prompts más largos pueden perder información relevante para la decisión.
- El rendimiento multilingüe se ha evaluado en un conjunto OOD relativamente pequeño (n=468), por lo que la robustez por idioma puede variar.
- La variante base (FP16 de 587,1 MB) no es adecuada para WASM en navegador según la propia model card; para cliente web se indica la variante `tiny-en`.
- No se documentan sesgos específicos ni evaluaciones de equidad; al derivar de mmBERT-base, puede heredar sesgos del corpus de entrenamiento de dicho modelo.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de atribución correspondientes.
- No se especifican requisitos de latencia para esta variante base, solo para la tiny; validar el throughput en el hardware objetivo antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/factcheck-gate-guard-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo complementario de groundedness: https://huggingface.co/Tamarillo/groundedness-guard-base
- Demo en navegador (Space): https://huggingface.co/spaces/Tamarillo/factcheck-gate-guard-demo
- Organización Tamarillo: https://huggingface.co/Tamarillo
- Dataset de clasificación: https://huggingface.co/datasets/vllm-sr/fact-check-classification-dataset
- Dataset OpenAssistant/oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset nvidia/HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Proyecto semantic-router: https://github.com/vllm-project/semantic-router

Nota: los resultados de búsqueda web recibidos sobre "Tamarillo" corresponden al fruto (Cyphomandra betacea) y no guardan relación con este modelo; se han descartado por no ser relevantes.
