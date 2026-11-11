# Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-80

## Resumen

`bert-base-multilingual-cased-finetuned-PersianQuAD-val-80` es un ajuste fino (fine-tuning) del modelo encoder `google-bert/bert-base-multilingual-cased` de Google, publicado por el usuario Z-Jafari en Hugging Face. El modelo está especializado en la tarea de *question answering* extractivo (respuesta a preguntas sobre un contexto dado), presumiblemente sobre el corpus PersianQuAD (un conjunto de preguntas y respuestas en persa), aunque la model card no documenta explícitamente el dataset de entrenamiento.

Se trata de un modelo BERT multilingüe *cased* (sensible a mayúsculas) de arquitectura transformer encoder-only, con 177.264.386 parámetros totales según los pesos en safetensors, lo que corresponde al tamaño estándar de BERT-base multilingüe (aproximadamente 178M de parámetros, incluyendo embeddings para un vocabulario multilingüe amplio). El modelo devuelve, para cada pregunta y contexto, los índices de inicio y fin del span que contiene la respuesta.

Su relevancia es acotada: se trata de un ajuste fino de un modelo base de 2018 sobre un dataset específico, con un número de descargas bajo (75) y sin métricas publicadas en el model-index. Resulta útil como referencia para tareas de QA extractivo en persa o como punto de partida para experimentos con BERT multilingüe, pero no compite con modelos generativos actuales en capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-base multilingüe, *cased*) |
| Parametros totales | 177.264.386 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT-base admite habitualmente 512 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precision original; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible de forma explícita; el modelo base es multilingüe (104 idiomas en el vocabulario original de BERT multilingual cased) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-multilingual-cased`, un transformer encoder-only con atención bidireccional completa, pensado para tareas de comprensión del lenguaje (clasificación, NER, QA extractivo). Sobre esa base se ha realizado un ajuste fino supervisado para *question answering*, con una cabeza de respuesta que predice las posiciones de inicio y fin del span de respuesta.

Los hiperparámetros documentados en la model card son: learning rate de 2e-05, batch size de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`) con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal, 3 épocas y precisión mixta nativa (AMP). La pérdida de validación evolucionó de 0.8799 (época 1) a 0.8107 (época 2) y 0.8565 (época 3), lo que sugiere un ligero sobreajuste en la tercera época. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo técnicas de RLHF o DPO (no aplicables a un modelo encoder de QA extractivo). Las versiones de framework indicadas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta.
- Comprensión lectora multilingüe: hereda el vocabulario y los embeddings multilingües del modelo base, aunque el ajuste fino se orienta presumiblemente al persa.
- Clasificación de tokens y representaciones contextuales: al ser un encoder BERT, puede reutilizarse para NER, clasificación de secuencias o *reranking*.
- No soporta tool calling ni function calling: es un modelo encoder-only sin capacidad generativa.
- No soporta agentes ni razonamiento multi-step: no genera texto libre ni mantiene conversaciones.
- No dispone de modo *thinking*, visión, audio ni otras capacidades multimodales.
- Capacidades multilingües: limitadas a lo heredado del modelo base; el ajuste fino puede degradar el rendimiento en idiomas distintos del persa.

## Casos de uso

- Sistemas de FAQ sobre documentación en persa: el modelo recibe un fragmento de documentación como contexto y una pregunta del usuario, y devuelve el span exacto de la respuesta. Adecuado por su especialización en QA extractivo y su bajo coste computacional frente a modelos generativos.
- Extracción de respuestas en bases de conocimiento: integrado en un pipeline de búsqueda (retrieval) más QA, permite localizar la frase exacta que responde a una consulta sobre artículos o registros estructurados.
- Asistencia en atención al cliente con base documental: combinado con un motor de búsqueda léxica o vectorial, responde preguntas frecuentes extrayendo el fragmento relevante del manual de producto, sin riesgo de alucinación al no generar texto nuevo.
- Anotación asistida de datasets de QA: útil para pre-anotar spans de respuesta en corpus persas y acelerar la revisión humana.
- Evaluación comparativa de modelos de QA en persa: sirve como línea base reproducible (con los hiperparámetros documentados) para experimentos con BERT multilingüe.
- *Reranking* de pasajes en pipelines RAG: las puntuaciones de inicio/fin del span pueden emplearse como señal de relevancia para ordenar fragmentos recuperados antes de pasarlos a un modelo generativo.
- Investigación sobre transferencia multilingüe: permite estudiar cómo un ajuste fino en persa afecta al rendimiento en otros idiomas del vocabulario original.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (`results: []`). Sin embargo, la model card declara métricas en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0.8565 |
| Exact Match | 77.4 |
| F1 | 81.11313980137504 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0.7 GB solo para pesos (177M parámetros × 4 bytes), más overhead de activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en FP16/BF16: aproximadamente 0.35 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100). Para lotes grandes o alto throughput, una A100 o H100 mejora la utilización, pero no es necesaria.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, TorchServe, FastAPI con `transformers`, ONNX Runtime (previa exportación), o servidores de inferencia tipo TGI/vLLM (aunque estos están optimizados para modelos generativos; para un encoder pequeño, `transformers` o ONNX suele ser más eficiente).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por consulta en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BERT multilingual fine-tuned PersianQuAD) | 177M | no disponible | QA extractivo | apache-2.0 | Hugging Face, 75 descargas |
| google-bert/bert-base-multilingual-cased | 178M | 512 tokens (estandar BERT) | Base encoder, sin ajuste de QA | apache-2.0 | Hugging Face, ampliamente usado |
| XLM-RoBERTa base | 278M | 512 tokens | Base encoder multilingüe | MIT | Hugging Face |
| mDeBERTa-v3-base | 86M (backbone) | 512 tokens | Base encoder multilingüe | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo encoder-only: no genera texto libre, no mantiene conversaciones y no soporta instrucciones en lenguaje natural; solo devuelve spans de respuesta sobre un contexto proporcionado.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"), incluida la descripción del dataset de entrenamiento.
- Riesgo de sobreajuste: la pérdida de validación aumenta en la tercera época (0.8565 frente a 0.8107 en la segunda), lo que sugiere que el modelo podría generalizar peor de lo que indica el mejor checkpoint.
- Idiomas: aunque el modelo base es multilingüe, el ajuste fino se realizó presumiblemente sobre datos en persa; el rendimiento en otros idiomas no está documentado y podría degradarse.
- Sesgos: no se documentan análisis de sesgo; al heredar el modelo base de 2018, puede reproducir sesgos presentes en los corpus de entrenamiento originales.
- Alucinación: al ser extractivo, no inventa texto, pero puede seleccionar spans incorrectos o irrelevantes si la respuesta no está presente en el contexto.
- Licencia apache-2.0: permite uso comercial y modificación, pero se recomienda verificar las condiciones del modelo base y del dataset PersianQuAD, cuyas licencias no se detallan en la información proporcionada.
- Sin métricas en el model-index ni validación externa: las cifras de Exact Match y F1 son declaradas por el autor y no han sido verificadas de forma independiente.
- Contexto máximo no documentado: no se confirma en la model card la longitud máxima de secuencia soportada, aunque BERT-base suele limitarse a 512 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-80
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper de BERT multilingual (sección multilingüe del paper original): https://arxiv.org/abs/1810.04805
- Dataset PersianQuAD (referencia habitual en Hugging Face): https://huggingface.co/datasets/persiannlp/persian_qa (no confirmado como el dataset exacto usado por el autor)
