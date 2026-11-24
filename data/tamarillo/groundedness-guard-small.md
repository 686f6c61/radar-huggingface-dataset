# Tamarillo/groundedness-guard-small

## Resumen
Tamarillo/groundedness-guard-small es un modelo de clasificación de tokens (token-classification) especializado en detectar alucinaciones y medir el "groundedness" (anclaje factual) de respuestas generadas por sistemas RAG y agentes de IA. Lo desarrolla Tamarillo y se construye sobre el backbone jhu-clsp/mmBERT-small, un transformer encoder de 140,6 millones de parámetros, con licencia Apache-2.0 y sin necesidad de `trust_remote_code`.

El modelo resuelve un problema concreto de los stacks de observabilidad en producción: los detectores existentes o bien exigen código remoto (HHEM-2.1-Open), o bien no ofrecen exportaciones ONNX ni variantes pequeñas para CPU/edge (lettucedect-v2), o bien diluyen alucinaciones puntuales dentro de respuestas largas. Esta variante devuelve simultáneamente la localización exacta de los spans alucinados a nivel de token y una puntuación calibrada de consistencia a nivel de documento o afirmación.

Es relevante ahora porque cubre 14 idiomas, entrena hasta 3.584 tokens y evalúa hasta 4.096 sobre un backbone de 8K, y mantiene el rendimiento en profundidades largas (retención de -0,008 AUC entre 250 y 3.200 tokens). Forma parte de una familia con tres tamaños: tiny-en (32,0M), small (140,6M, 14 idiomas) y base (307,5M, 14 idiomas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBertForTokenClassification) sobre jhu-clsp/mmBERT-small |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado hasta 3.584 tokens; evaluado hasta 4.096 tokens sobre backbone de 8K |
| Tipos de cuantizacion | ONNX FP32 (exportación verificada por paridad); otras cuantizaciones no disponibles |
| Idiomas soportados | en, ar, ca, cs, de, es, eu, fa, fi, fr, hi, it, sv, zh (14 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento
El modelo es un encoder transformer de tipo ModernBERT para clasificación de tokens, con `id2label = {0: "supported", 1: "hallucinated"}`. Se inicializa desde jhu-clsp/mmBERT-small (140,6M parámetros) y se destila desde Tamarillo/groundedness-guard-base. La entrada es un par (contexto, respuesta) y la salida son logits por token que permiten localizar spans alucinados y, agregando mediante Top-6 Log-Mean-Exp (beta=2.0), obtener una puntuación calibrada de consistencia (`1 - sigmoid(Top-6 LME)`).

El entrenamiento combina varios datasets: MoritzLaurer/synthetic_zeroshot_mixtral_v0.1, alisawuffles/WANLI, nyu-mll/multi_nli, McGill-NLP/FaithDial, lytang/C2D-and-D2C-MiniCheck, Salesforce/summedits y s-nlp/PsiloQA. La cobertura multilingüe se apoya en PsiloQA para los 14 idiomas. El número total de tokens de entrenamiento y la composición exacta del dataset no están disponibles en la información proporcionada. Como innovación destacable, el modelo evita `trust_remote_code`, ofrece exportación ONNX con paridad verificada y emplea agregación Top-6 LME para robustez frente al ruido de tokens individuales.

## Capacidades
- Detección de alucinaciones a nivel de span de tokens con localización exacta en caracteres.
- Puntuación calibrada de groundedness a nivel de documento o afirmación (consistencia contexto-respuesta).
- Clasificación de tokens con etiquetas `supported` / `hallucinated`.
- Soporte multilingüe en 14 idiomas (en, ar, ca, cs, de, es, eu, fa, fi, fr, hi, it, sv, zh).
- Compatibilidad drop-in con la interfaz de KRLabsOrg/lettucedect-v2-mmbert-base (formato de etiquetas 0/1).
- Exportación ONNX para despliegue en CPU y edge.
- Integración con la librería transformers estándar (`ModernBertForTokenClassification`), sin código remoto.
- Capacidad de retención de rendimiento en contextos largos (hasta 4.096 tokens evaluados).
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio; es un modelo exclusivamente discriminativo de verificación.

## Casos de uso
- Observabilidad de pipelines RAG: verificar cada respuesta generada contra los documentos recuperados, obteniendo tanto un score de consistencia como los spans exactos que no están respaldados por el contexto, integrándose en stacks como RAGAS, DeepEval, LangChain o LlamaIndex.
- Guardrails en producción para agentes: interceptar salidas de herramientas y resúmenes JSON antes de mostrarlos al usuario, marcando fragmentos alucinados con umbral configurable (por defecto 0,5).
- Evaluación de fidelidad en resumen automático: comparar resúmenes con el documento fuente usando el score calibrado y localizar afirmaciones no soportadas, útil para auditorías de calidad.
- Forense de agentes (agent-forensics): reconstruir qué partes de una respuesta multi-paso se desviaron de las evidencias recuperadas, aprovechando la localización a nivel de token.
- Despliegue en CPU/edge: gracias a la exportación ONNX FP32 (537,0 MB) y latencias de 28,2 ms a 64 tokens, 210,5 ms a 512 tokens y 1.834,7 ms a 2.048 tokens, puede ejecutarse en entornos sin GPU.
- Filtrado multilingüe de respuestas: aplicar el detector en aplicaciones con usuarios en 14 idiomas, con rendimiento no inglés de 0,845 AUC en PsiloQA, para bloquear o marcar contenido no anclado.
- Monitorización continua de calidad: registrar scores de groundedness por consulta y detectar degradaciones del retriever o del generador a lo largo del tiempo.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| 3-Suite Strictly OOD EN (media) | AUC | 0,748 |
| RAGTruth | AUC | 0,746 |
| SummEval | AUC | 0,684 |
| FRANK | AUC | 0,814 |
| PsiloQA EN (ID) | AUC | 0,974 |
| PsiloQA 13 idiomas no EN | AUC | 0,845 |
| PsiloQA EN span | Char Span F1 | 0,547 |
| PsiloQA 14 idiomas global | Span F1 | 0,381 |
| Retención 250→3.200 tokens | Delta AUC | -0,008 |
| ONNX CPU FP32 @ 64 tokens | Latencia | 28,2 ms |
| ONNX CPU FP32 @ 512 tokens | Latencia | 210,5 ms |
| ONNX CPU FP32 @ 2.048 tokens | Latencia | 1.834,7 ms |

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene 140,6M parámetros; en FP32 ocupa aproximadamente 562 MB de pesos, y el export ONNX FP32 pesa 537,0 MB. Con activaciones y contexto largo, se recomienda al menos 2-4 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU con 4 GB o más (RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo es lo bastante pequeño para ejecutarse en GPUs de consumo.
- Cabe en GPU de consumo: sí, en todas las RTX modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (exportación oficial con paridad verificada), y cualquier runtime compatible con modelos de clasificación de tokens de Hugging Face. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: en CPU ONNX FP32, 28,2 ms a 64 tokens, 210,5 ms a 512 tokens y 1.834,7 ms a 2.048 tokens. No se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | ONNX | Localizacion de spans | trust_remote_code | Licencia |
|---|---|---|---|---|---|---|
| Tamarillo/groundedness-guard-small | 140,6M | 14 | Si | Si | No | Apache-2.0 |
| vectara/hallucination_evaluation_model (HHEM-2.1-Open) | no disponible | Solo ingles | No | No | Si | no disponible |
| KRLabsOrg/lettucedect-v2-mmbert-base | no disponible | no disponible | No | Si (interfaz 0/1) | no disponible | no disponible |
| Tamarillo/groundedness-guard-tiny-en | 32,0M | Solo ingles | Si | Si | No | Apache-2.0 |
| Tamarillo/groundedness-guard-base | 307,5M | 14 | Si | Si | No | Apache-2.0 |

## Limitaciones y advertencias
- Es un modelo discriminativo de verificación, no un generador: no produce texto ni responde preguntas por sí mismo.
- El rendimiento en localización de spans en idiomas distintos del inglés es notablemente inferior (Span F1 global de 0,381 frente a 0,547 en inglés), por lo que la localización exacta en multilingüe debe tratarse con cautela.
- El score calibrado depende del umbral elegido (por defecto 0,5); umbrales inadecuados pueden generar falsos positivos o negativos en producción.
- La ventana de entrenamiento es de 3.584 tokens y la evaluación llega a 4.096; contextos más largos pueden degradar el rendimiento o requerir truncado.
- No se documentan sesgos específicos, pero al entrenarse con datasets como MultiNLI y WANLI puede heredar sesgos de esos corpus.
- Riesgo de alucinación del propio detector: al ser un clasificador, puede marcar como alucinado contenido correcto o pasar por alto afirmaciones no soportadas, especialmente en dominios alejados de los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero no se ofrece garantía alguna sobre el rendimiento en dominios específicos.
- No se han publicado datos sobre cuantizaciones distintas de ONNX FP32 ni sobre throughput en GPU.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Tamarillo/groundedness-guard-small
- Demo interactiva (Space): https://huggingface.co/spaces/Tamarillo/groundedness-guard-demo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Familia tiny-en: https://huggingface.co/Tamarillo/groundedness-guard-tiny-en
- Familia base: https://huggingface.co/Tamarillo/groundedness-guard-base
- Modelo comparable lettucedect-v2: https://huggingface.co/KRLabsOrg/lettucedect-v2-mmbert-base
- Modelo comparable HHEM-2.1-Open: https://huggingface.co/vectara/hallucination_evaluation_model
- Dataset PsiloQA: https://huggingface.co/datasets/s-nlp/PsiloQA
- Dataset FaithDial: https://huggingface.co/datasets/McGill-NLP/FaithDial
- Dataset SummEval: https://huggingface.co/datasets/Salesforce/summedits
- Dataset MiniCheck: https://huggingface.co/datasets/lytang/C2D-and-D2C-MiniCheck
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset synthetic_zeroshot_mixtral: https://huggingface.co/datasets/MoritzLaurer/synthetic_zeroshot_mixtral_v0.1
