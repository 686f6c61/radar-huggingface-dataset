# soundstarrain/english-split-and-rephrase-gate

## Resumen

`english-split-and-rephrase-gate` es un clasificador binario de frases en inglés desarrollado por el usuario soundstarrain. Su función es decidir, dentro de un pipeline de *split-and-rephrase*, si la frase actual debe dividirse de nuevo antes de invocar al modelo reescritor. Devuelve dos etiquetas: `stop` (mantener la frase) y `continue` (pedir otra división al reescritor). No es un modelo generativo, sino una pieza de control de calidad que orquesta la descomposición recursiva de oraciones.

Técnicamente es un fine-tuning de `answerdotai/ModernBERT-base`, un transformer encoder con 149,6 millones de parámetros, empaquetado con `AutoModelForSequenceClassification` y pesos en safetensors. La relevancia práctica está en que permite automatizar la simplificación de oraciones largas y complejas en pipelines de procesamiento de lenguaje, un paso previo habitual en tareas de accesibilidad, resumen extractivo o generación controlada.

El modelo se publica bajo licencia Apache-2.0, con un umbral de decisión por defecto de 0,21 sobre la probabilidad de `continue`, almacenado en `threshold.json`. Está pensado para usarse junto al rewriter del mismo autor, aunque también puede emplearse de forma independiente como gate de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base, fine-tuning) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ModernBERT-base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer de la familia BERT con 149,6 millones de parámetros, y se ha fine-tuneado como clasificador de secuencias con dos etiquetas (`stop` y `continue`). La cabeza de clasificación se entrena sobre ejemplos filtrados de *split-and-rephrase* en inglés derivados del dataset BiSECT (GEM/BiSECT), que contiene pares de oraciones complejas y sus descomposiciones en partes más simples.

No se detalla en la model card el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador). El checkpoint se seleccionó con un umbral de 0,21 sobre la probabilidad de `continue`, elegido a partir del conjunto de validación. La innovación principal no está en la arquitectura, sino en el uso del modelo como *gate* de decisión dentro de un pipeline recursivo: el rewriter genera dos partes y este clasificador decide si alguna de ellas requiere una nueva división.

## Capacidades

- Clasificación binaria de frases en inglés: predice `stop` o `continue` para decidir si una oración debe dividirse de nuevo.
- Integración en pipelines de *split-and-rephrase*: actúa como paso de control antes de invocar al modelo reescritor.
- Uso independiente: puede emplearse como clasificador de decisión de descomposición de oraciones en cualquier aplicación que necesite una predicción stop/continue.
- Salida probabilística: devuelve logits y probabilidades vía softmax, lo que permite ajustar el umbral según el caso de uso.
- Compatibilidad con `transformers` y con `text-embeddings-inference` / endpoints compatibles (según los tags del repositorio).
- No soporta tool calling, agentes, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Simplificación de oraciones largas en pipelines de accesibilidad: el gate decide recursivamente si una frase compleja debe dividirse antes de pasarla al rewriter, mejorando la legibilidad de textos técnicos o legales.
- Preprocesado para resumen extractivo: dividir oraciones compuestas en unidades más simples antes de aplicar algoritmos de selección de frases, lo que facilita el alineamiento y la puntuación.
- Generación controlada de texto: usar el gate como paso intermedio para descomponer instrucciones largas en subtareas antes de enviarlas a un LLM generativo, reduciendo ambigüedad.
- Normalización de corpus para entrenamiento: transformar oraciones complejas de un dataset en pares simples/complejos de forma automática, con control de calidad mediante el umbral.
- Traducción automática asistida: dividir oraciones fuente en segmentos más cortos antes de la traducción, lo que suele mejorar la calidad en pares de idiomas con orden distinto.
- Análisis de legibilidad y educación: detectar y descomponer automáticamente frases largas en materiales didácticos o exámenes, con revisión humana posterior.
- Integración en CLI y pipelines de CI: el repositorio companion proporciona una CLI que combina gate y rewriter, útil para procesar lotes de documentos en integración continua.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Sentence split decision | BiSECT (GEM/BiSECT) | test | Macro F1 | 0,9979 |

El autor indica que el umbral 0,21 se seleccionó en validación y que la métrica corresponde a la tarea de split-and-rephrase de BiSECT. No se han publicado resultados en otros dominios ni comparaciones con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB (149,6 M parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB; en int8, unos 0,15 GB.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir lotes grandes; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (según tags), endpoints compatibles; no se documenta soporte explícito de vLLM, llama.cpp u Ollama, aunque al ser un encoder BERT es convertible a ONNX o GGUF con herramientas externas.
- Latencia y throughput: no disponibles en la información proporcionada; para un encoder de 149 M de parámetros se espera latencia de milisegundos por frase en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| english-split-and-rephrase-gate | 149,6 M | no disponible | Clasificación stop/continue para split-and-rephrase | Apache-2.0 | HuggingFace |
| answerdotai/ModernBERT-base | 149,6 M | no disponible en la información | Encoder base multiuso | Apache-2.0 | HuggingFace |
| Modelos de clasificación BERT-base fine-tuneados | ~110 M | 512 tokens típicamente | Clasificación de texto genérica | variable | HuggingFace |

No se dispone de comparaciones directas con otros gates de split-and-rephrase en la información proporcionada. La alternativa más cercana es el propio ModernBERT-base sin fine-tuning, que no realiza esta tarea específica, o clasificadores BERT genéricos que requerirían un fine-tuning equivalente.

## Limitaciones y advertencias

- Evaluación limitada al split de test de BiSECT; el rendimiento en otros géneros, dominios o tareas de procesamiento de oraciones no se ha medido.
- Solo inglés: no hay soporte declarado para otros idiomas.
- Riesgo de alucinación bajo en tanto que es un clasificador, pero puede producir falsos positivos o negativos en la decisión stop/continue, especialmente fuera de la distribución de BiSECT.
- El umbral 0,21 es específico del checkpoint y del dataset de validación; usarlo en otro dominio puede degradar la precisión y requerir recalibración.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre BiSECT, puede heredar sesgos de estilo y dominio de ese corpus.
- Licencia Apache-2.0 permite uso comercial, pero el corpus de entrenamiento no se redistribuye y debe respetarse la atribución indicada en `NOTICE.md`.
- Dependencia de un rewriter companion para el pipeline completo; el gate por sí solo no genera texto.
- No apto para tareas generativas, razonamiento, código o matemáticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soundstarrain/english-split-and-rephrase-gate
- Repositorio de inferencia (CLI y pipeline): https://github.com/soundstarrain/english-split-and-rephrase
- Modelo rewriter companion: https://huggingface.co/soundstarrain/english-split-and-rephrase-rewriter
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset BiSECT (GEM): https://huggingface.co/datasets/GEM/BiSECT
- Paper BiSECT (EMNLP 2021): Kim, J., Maddela, M., Kriz, R., Xu, W., Callison-Burch, C. "BiSECT: Learning to Split and Rephrase Sentences with Bitexts."
