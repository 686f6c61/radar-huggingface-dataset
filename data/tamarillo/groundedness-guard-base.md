# Tamarillo/groundedness-guard-base

## Resumen

Tamarillo/groundedness-guard-base es un modelo de clasificación de tokens (token-classification) especializado en la detección de alucinaciones y la verificacion de groundedness en respuestas generadas por sistemas RAG y agentes de IA. Lo desarrolla Tamarillo y se construye sobre el backbone `jhu-clsp/mmBERT-base`, un transformer de tipo ModernBERT con 307.531.778 parametros totales. Su proposito es localizar exactamente que fragmentos (spans) de una respuesta no estan respaldados por el contexto proporcionado, ademas de emitir una puntuacion calibrada de consistencia a nivel de documento.

El modelo resuelve tres problemas concretos de las pilas de observabilidad en produccion: evita el uso de `trust_remote_code=True`, ofrece exportaciones ONNX verificadas con paridad y cubre 14 idiomas, frente a alternativas como `vectara/hallucination_evaluation_model` (solo ingles, sin ONNX) o `KRLabsOrg/lettucedect-v2-mmbert-base` (sin exportaciones ONNX ni niveles reducidos). La salida de etiquetas es binaria por token (`0: supported`, `1: hallucinated`), lo que permite resaltar el span exacto de la alucinacion.

Es relevante ahora porque las pilas de evaluacion de RAG (RAGAS, DeepEval, LangChain, LlamaIndex, Arize Phoenix, TruLens) y los verificadores de salidas de herramientas de agentes necesitan detectar no solo si una respuesta es fiable, sino donde falla. El modelo esta entrenado hasta 3.584 tokens y evaluado hasta 4.096 sobre un backbone de 8K, con licencia Apache-2.0 y compatibilidad con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (token classification sobre `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado hasta 3.584 tokens; evaluado hasta 4.096 tokens; backbone de 8K |
| Tipos de cuantizacion | ONNX FP32 (exportacion verificada con paridad); otras cuantizaciones no disponibles |
| Idiomas soportados | en, ar, ca, cs, de, es, eu, fa, fi, fr, hi, it, sv, zh (14 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un `ModernBertForTokenClassification` estandar de Hugging Face, sin `trust_remote_code`, con `id2label = {0: "supported", 1: "hallucinated"}`. Se apoya en el backbone `jhu-clsp/mmBERT-base`, un transformer encoder multilingue de 307,5M de parametros. La cabeza de clasificacion opera a nivel de token, y la agregacion a nivel de documento se realiza mediante una puntuacion Top-6 Log-Mean-Exp (LME, beta=2.0) sobre los logits de la clase "hallucinated", que produce una probabilidad calibrada de consistencia (`1 - sigmoid(Top-6 LME)`).

El entrenamiento combina varios datasets: `MoritzLaurer/synthetic_zeroshot_mixtral_v0.1`, `alisawuffles/WANLI`, `nyu-mll/multi_nli`, `McGill-NLP/FaithDial`, `lytang/C2D-and-D2C-MiniCheck`, `Salesforce/summedits` y `s-nlp/PsiloQA`. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es la doble salida: localizacion exacta de spans a nivel de token y puntuacion calibrada a nivel de documento, con retencion de rendimiento en profundidad (de 250 a 3.200 tokens, +0,002 AUC).

## Capacidades

- Deteccion de alucinaciones a nivel de span: identifica exactamente que tokens o fragmentos de una respuesta no estan respaldados por el contexto.
- Puntuacion de groundedness calibrada a nivel de documento y de claim, mediante `1 - sigmoid(Top-6 LME)` o `1 - max P(hallucinated)`.
- Clasificacion binaria por token (`supported` / `hallucinated`) compatible con `KRLabsOrg/lettucedect-v2-mmbert-base` en una linea.
- Cobertura multilingue en 14 idiomas (en, ar, ca, cs, de, es, eu, fa, fi, fr, hi, it, sv, zh).
- Inferencia sin `trust_remote_code`, con exportaciones ONNX de paridad verificada.
- Capacidad de procesar pares (contexto, respuesta) con truncado controlado (`only_first` o `longest_first`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio ni tool calling; es un modelo discriminativo de verificacion.

## Casos de uso

- Observabilidad de RAG en produccion: integrar el modelo en pilas como RAGAS, DeepEval o Arize Phoenix para puntuar cada respuesta generada contra el contexto recuperado y registrar que spans son alucinados, gracias a su salida token a token y a la puntuacion calibrada a nivel de documento.
- Verificacion de salidas de herramientas de agentes: comprobar que los resumenes JSON o las respuestas de herramientas de un agente estan respaldados por la evidencia de entrada, detectando spans inventados en respuestas multi-frase.
- Guardrails en atencion al cliente automatizada: filtrar respuestas antes de enviarlas al usuario, usando el umbral de probabilidad por span para bloquear o reescribir fragmentos no soportados por la base de conocimiento.
- Evaluacion de resumenes: aplicar la deteccion de spans a resumenes generados (por ejemplo, con datos tipo SummEval) para medir faithfulness y localizar frases no respaldadas por el documento fuente.
- Control de calidad en pipelines de generacion aumentada multilingue: desplegar el modelo en entornos con usuarios en espanol, catalan, euskera, aleman, frances, arabe, chino, etc., aprovechando su cobertura de 14 idiomas.
- Forense de agentes (agent-forensics): auditar trazas de agentes para determinar en que punto de la cadena de razonamiento se introdujo una afirmacion no fundamentada, usando los spans localizados.
- Despliegue en CPU o edge: usar la exportacion ONNX FP32 (53,7 ms a 64 tokens, 406,6 ms a 512 tokens, 3.323,6 ms a 2.048 tokens) para verificacion en tiempo casi real en entornos sin GPU.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Media EN estrictamente OOD (3 suites, Top-6 LME) | 0,832 AUC |
| RAGTruth (EN) | 0,781 AUC |
| SummEval (EN) | 0,798 AUC |
| FRANK (EN) | 0,916 AUC |
| PsiloQA (ID) EN | 0,976 AUC |
| PsiloQA 13 idiomas no EN | 0,842 AUC |
| PsiloQA EN Char Span F1 | 0,538 |
| PsiloQA 14 idiomas Overall | 0,387 |
| Retencion de profundidad 250 a 3.200 tokens | +0,002 AUC |
| ONNX CPU FP32, 64 tokens | 53,7 ms |
| ONNX CPU FP32, 512 tokens | 406,6 ms |
| ONNX CPU FP32, 2.048 tokens | 3.323,6 ms (1173,7 MB) |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB para los pesos (307,5M parametros), con overhead adicional segun la longitud de secuencia y el batch.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) y en GPUs de datacenter (A100, H100) para alto throughput.
- Cabe en GPU consumer: si, dado el tamano de 307,5M de parametros.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (exportacion verificada), endpoints compatibles de Hugging Face; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en CPU ONNX FP32, 53,7 ms a 64 tokens, 406,6 ms a 512 tokens y 3.323,6 ms a 2.048 tokens; no se proporcionan datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | ONNX | Licencia | Localiza spans |
|---|---|---|---|---|---|---|
| Tamarillo/groundedness-guard-base | 307,5M | 3.584 entrenamiento / 4.096 evaluacion | 14 | Si (paridad verificada) | Apache-2.0 | Si |
| KRLabsOrg/lettucedect-v2-mmbert-base | no disponible | no disponible | no disponible | No | no disponible | Si (compatible) |
| vectara/hallucination_evaluation_model (HHEM-2.1-Open) | no disponible | no disponible | Solo ingles | No | no disponible | No |
| Tamarillo/groundedness-guard-small | 140,6M | no disponible | 14 | no disponible | no disponible | Si |
| Tamarillo/groundedness-guard-tiny-en | 32,0M | no disponible | Solo ingles | no disponible | no disponible | Si |

## Limitaciones y advertencias

- El modelo es un detector discriminativo, no un generador; no puede producir texto, codigo ni razonamiento propio.
- Riesgo de falsos positivos y negativos en la localizacion de spans: el Char Span F1 en ingles es 0,538 y el Overall multilingue baja a 0,387, lo que indica margen de mejora en la localizacion exacta de caracteres.
- El rendimiento en idiomas distintos del ingles es notablemente inferior (0,842 AUC en PsiloQA no EN frente a 0,976 en EN).
- La longitud de contexto de entrenamiento es de 3.584 tokens; las respuestas y contextos mas largos requieren truncado, lo que puede perder evidencia relevante.
- No se documentan sesgos especificos ni evaluaciones de sesgo en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero no se detallan restricciones adicionales ni condiciones de atribucion mas alla de las de la propia licencia.
- El pipeline por defecto `token-classification` de Hugging Face solo acepta cadenas simples; es necesario usar el helper de pares (contexto, respuesta) que proporciona la model card.
- No se han publicado datos sobre latencia en GPU ni sobre throughput en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/groundedness-guard-base
- Demo interactivo (ONNX en navegador): https://huggingface.co/spaces/Tamarillo/groundedness-guard-demo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo tiny EN: https://huggingface.co/Tamarillo/groundedness-guard-tiny-en
- Modelo small: https://huggingface.co/Tamarillo/groundedness-guard-small
- Modelo compatible (lettucedect): https://huggingface.co/KRLabsOrg/lettucedect-v2-mmbert-base
- Dataset: https://huggingface.co/datasets/MoritzLaurer/synthetic_zeroshot_mixtral_v0.1
- Dataset: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset: https://huggingface.co/datasets/McGill-NLP/FaithDial
- Dataset: https://huggingface.co/datasets/lytang/C2D-and-D2C-MiniCheck
- Dataset: https://huggingface.co/datasets/Salesforce/summedits
- Dataset: https://huggingface.co/datasets/s-nlp/PsiloQA
