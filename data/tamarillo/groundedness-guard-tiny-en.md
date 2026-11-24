# Tamarillo/groundedness-guard-tiny-en

## Resumen

Tamarillo/groundedness-guard-tiny-en es un modelo de clasificación de tokens especializado en detección de alucinaciones y verificación de "groundedness" (fidelidad al contexto) en respuestas generadas por sistemas RAG y agentes de IA. Lo desarrolla Tamarillo y se construye sobre el backbone `jhu-clsp/ettin-encoder-32m`, un encoder de arquitectura ModernBERT con 32,0 millones de parámetros. El modelo resuelve un problema concreto de los stacks de observabilidad en producción: localizar exactamente qué fragmento (span) de una respuesta multi-frase no está respaldado por el contexto, además de emitir una puntuación calibrada a nivel de documento o afirmación.

Su relevancia radica en tres decisiones de diseño: no requiere `trust_remote_code`, se distribuye bajo licencia Apache-2.0 y ofrece exportaciones ONNX con paridad verificada, lo que permite despliegue en CPU y en el edge. Frente a alternativas como HHEM-2.1-Open (que exige código remoto y no localiza spans) o lettucedect-v2-mmbert-base (sin ONNX ni variantes pequeñas), este modelo cubre el hueco de los despliegues ligeros. La ventana de entrenamiento llega a 3.584 tokens y la evaluación a 4.096 sobre un backbone de 8K.

El modelo forma parte de una familia de tres tallas: tiny (32,0M, solo inglés), small (140,6M, 14 idiomas) y base (307,5M, 14 idiomas). La versión tiny se destila desde el modelo base mediante una combinación de knowledge distillation NLI en dos etapas y MarginMSE con alineación de spans por caracteres entre tokenizadores distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder (token classification) |
| Parametros totales | 32.031.746 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado hasta 3.584 tokens; evaluado hasta 4.096 sobre backbone de 8K |
| Tipos de cuantizacion | ONNX FP32 (122,4 MB); otras cuantizaciones no disponibles |
| Idiomas soportados | en (solo inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |
| Modelo base | jhu-clsp/ettin-encoder-32m |
| Tarea (pipeline) | token-classification |
| Etiquetas de salida | `0: supported`, `1: hallucinated` |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 32,0M de parámetros con una cabeza de clasificación de tokens (`ModernBertForTokenClassification`). Cada token de la respuesta se etiqueta como respaldado o alucinado, y las etiquetas se agregan después para producir tanto spans de caracteres como una puntuación a nivel de documento. La puntuación de consistencia se calcula como `1 - sigmoid(Top-6 LME)` con beta=2.0, una agregación log-mean-exp sobre los seis tokens más alucinados, diseñada para ser robusta frente al ruido de tokens aislados. También admite la variante `1 - max P(hallucinated)`.

El entrenamiento combina varios datasets: `MoritzLaurer/synthetic_zeroshot_mixtral_v0.1`, `alisawuffles/WANLI`, `nyu-mll/multi_nli`, `McGill-NLP/FaithDial`, `lytang/C2D-and-D2C-MiniCheck`, `Salesforce/summedits` y `s-nlp/PsiloQA`. La destilación se realiza desde `Tamarillo/groundedness-guard-base` mediante NLI en dos etapas y MarginMSE con bolsas de spans alineadas por caracteres entre tokenizadores distintos. El número exacto de tokens de entrenamiento no está disponible en la información proporcionada.

La innovación técnica destacable es la doble salida (localización de spans a nivel de token y puntuación calibrada a nivel de documento) sin dependencia de código remoto, junto con la exportación ONNX con paridad verificada y la retención de profundidad de contexto (de 250 a 3.200 tokens la degradación es de solo -0,034 AUC).

## Capacidades

- Detección de alucinaciones a nivel de span: localiza fragmentos exactos de la respuesta no respaldados por el contexto, con offsets de caracteres.
- Puntuación calibrada de groundedness a nivel de documento o afirmación (Top-6 LME o max P).
- Verificación de fidelidad en pipelines RAG: compara contexto recuperado con respuesta generada.
- Compatibilidad drop-in con la salida de `KRLabsOrg/lettucedect-v2-mmbert-base` (etiquetas `0`/`1`).
- Exportación ONNX para inferencia en CPU y edge.
- Integración con `transformers` sin `trust_remote_code`.
- Sin soporte de tool calling, agentes autónomos, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad monolingüe: solo inglés.

## Casos de uso

- Observabilidad de RAG en producción: insertar el modelo tras el generador para puntuar cada respuesta contra los documentos recuperados y marcar spans sospechosos antes de mostrarlos al usuario. Adecuado por su bajo coste (32M) y su latencia en CPU.
- Guardrails en agentes: verificar las salidas de herramientas (tool outputs) y resúmenes JSON frente al contexto de la tarea, detectando afirmaciones inventadas en cadenas multi-paso.
- Evaluación automática de resúmenes: comparar resúmenes generados con el documento fuente y localizar frases no fieles, usando la puntuación calibrada como métrica agregada.
- Forense de agentes: registrar spans alucinados con offsets de caracteres para auditar qué parte de una respuesta falló y por qué, útil en depuración post-mortem.
- Filtrado previo en pipelines de datos: descartar pares contexto-respuesta de baja fidelidad en la curación de datasets de entrenamiento o evaluación.
- Despliegue en edge o entornos sin GPU: servir el modelo en ONNX FP32 (122,4 MB) en CPUs modestas para verificación en tiempo real con latencias de milisegundos.
- Moderación de contenido generado: marcar respuestas no sustentadas en asistentes conversacionales antes de la entrega final.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| 3-Suite Strictly OOD EN (media) | AUC | 0,626 |
| RAGTruth | AUC | 0,715 |
| SummEval | AUC | 0,512 |
| FRANK | AUC | 0,649 |
| PsiloQA EN (ID) | AUC | 0,964 |
| PsiloQA EN (ID) | Char Span F1 | 0,559 |
| Retención de profundidad 250→3.200 tok | Δ AUC | -0,034 |
| ONNX CPU FP32 @ 64 tok | latencia | 9,0 ms |
| ONNX CPU FP32 @ 512 tok | latencia | 70,5 ms |
| ONNX CPU FP32 @ 2.048 tok | latencia | 719,6 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP32 ocupa aproximadamente 128 MB de pesos; en FP16 unos 64 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. En GPU, cualquier tarjeta con más de 1 GB de VRAM (RTX 3060, RTX 4090, A100, H100) es sobrada.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en dispositivos de borde.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime (exportación oficial con paridad verificada), integrable en vLLM/TGI solo como componente de clasificación, no como generador.
- Latencia y throughput: en CPU ONNX FP32, 9,0 ms a 64 tokens, 70,5 ms a 512 tokens y 719,6 ms a 2.048 tokens. El throughput en GPU no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Localiza spans | ONNX | trust_remote_code | Licencia |
|---|---|---|---|---|---|---|---|
| Tamarillo/groundedness-guard-tiny-en | 32,0M | 3.584 (entren.) / 4.096 (eval.) | en | Sí | Sí | No | apache-2.0 |
| vectara/hallucination_evaluation_model (HHEM-2.1-Open) | no disponible | no disponible | en | No | No | Sí | no disponible |
| KRLabsOrg/lettucedect-v2-mmbert-base | no disponible | no disponible | no disponible | Sí | No | no disponible | no disponible |
| Tamarillo/groundedness-guard-small | 140,6M | no disponible | 14 | Sí | Sí | No | apache-2.0 |
| Tamarillo/groundedness-guard-base | 307,5M | no disponible | 14 | Sí | Sí | No | apache-2.0 |

El modelo tiny es 3,4 veces más pequeño que HHEM-2.1-Open y 9,6 veces más pequeño que los encoders de 308M, según la model card.

## Limitaciones y advertencias

- Solo inglés: no cubre otros idiomas; para multilingüe hay que usar las variantes small o base.
- Ventana de contexto limitada a 3.584 tokens en entrenamiento; respuestas o contextos más largos requieren truncado y pueden degradar la detección.
- Rendimiento moderado en dominios estrictamente fuera de distribución (AUC medio de 0,626 en las tres suites OOD); SummEval queda en 0,512, cerca del azar.
- Riesgo de falsos positivos y negativos en respuestas con atribución parcial o reformulación parafrástica no literal.
- Es un clasificador, no un generador: no corrige ni reescribe las alucinaciones, solo las señala.
- La calibración de la puntuación Top-6 LME depende del umbral elegido (por defecto 0,5); conviene recalibrar por dominio.
- Licencia Apache-2.0 permite uso comercial, pero no se han publicado garantías de robustez en dominios regulados.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción temprana y poca validación externa.
- Los resultados de benchmarks proceden de la model card del autor; no se han verificado de forma independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/groundedness-guard-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Demo interactivo (Space): https://huggingface.co/spaces/Tamarillo/groundedness-guard-demo
- Familia small: https://huggingface.co/Tamarillo/groundedness-guard-small
- Familia base: https://huggingface.co/Tamarillo/groundedness-guard-base
- Alternativa HHEM-2.1-Open: https://huggingface.co/vectara/hallucination_evaluation_model
- Alternativa lettucedect-v2-mmbert-base: https://huggingface.co/KRLabsOrg/lettucedect-v2-mmbert-base
