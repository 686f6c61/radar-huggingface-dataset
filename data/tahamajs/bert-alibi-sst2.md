# tahamajs/bert-alibi-sst2

## Resumen

`tahamajs/bert-alibi-sst2` es un modelo BERT-base en el que se han sustituido las doce capas de atención multi-cabeza estándar por el mecanismo `alibi` (Attention with Linear Biases) implementado en la librería NeuralOps. Parte de `google-bert/bert-base-uncased` y se ha destilado sobre WikiText-2 mediante un pipeline de destilación de conocimiento en tres etapas (calibración Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionada con LR diferencial). El autor es Taha Majlesi y el modelo se publica bajo licencia MIT.

El interés del modelo es experimental: sirve como banco de pruebas para evaluar mecanismos de atención subcuadrática en arquitecturas transformer pequeñas, y como ejemplo de destilación de conocimiento rápida (300 segundos en una RTX 3090). No está pensado como modelo de producción generalista, sino como pieza de un zoo de atenciones (BERT-131 Subquadratic Attention Zoo) orientado a investigación.

El tamaño del repositorio es de 0,5 GB, la tarea declarada es `fill-mask` y el idioma soportado es únicamente inglés. Los resultados reportados por el autor muestran una perplejidad MLM de 0,00 y una precisión de token enmascarado del 91,40 %, cifras que deben interpretarse con cautela por las razones expuestas en la sección de limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención ALiBi (12 capas) |
| Parametros totales | no disponible (hereda el tamaño de bert-base-uncased, ~110 M, no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,5 GB, librería `neuralops`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un BERT-base estándar (encoder transformer de 12 capas) en el que las capas de self-attention multi-cabeza se han reemplazado por el mecanismo `alibi` de NeuralOps. ALiBi introduce sesgos lineales dependientes de la distancia en las puntuaciones de atención, lo que permite extrapolar a longitudes de secuencia mayores sin embeddings posicionales aprendidos. El modelo base es `google-bert/bert-base-uncased`.

El entrenamiento consiste en una destilación de conocimiento sobre WikiText-2 con tres etapas: (0) calibración Ridge en forma cerrada, (1) MSE/CKA de subespacio con backbone congelado y (2) KD de logits fusionada con learning rate diferencial. Según la model card, el proceso se ejecutó en una NVIDIA RTX 3090 de 24 GB durante 300 segundos, con 248 pasos completados, un throughput de 43.002,5 tokens/s y un pico de VRAM de 8.487 MB. No se detalla la composición exacta del dataset más allá de WikiText-2 ni si hubo RLHF/DPO (no aplicable en un modelo encoder de fill-mask).

## Capacidades

- Relleno de máscaras (masked language modeling) en inglés: es la tarea principal declarada (`fill-mask`).
- Extracción de representaciones contextuales de tokens, reutilizable para clasificación, NER o similitud semántica.
- Atención con sesgos lineales (ALiBi), que en teoría facilita la generalización a secuencias más largas que las vistas en entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Investigación sobre mecanismos de atención: comparar el comportamiento de ALiBi frente a atención estándar en tareas de enmascaramiento controladas, usando el modelo como variante experimental dentro del Attention Zoo.
- Prototipado de pipelines de fill-mask en inglés: completar huecos en frases para tareas de aumento de datos o generación de plantillas, aprovechando la API de `transformers` con `pipeline("fill-mask")`.
- Destilación de conocimiento como referencia: el pipeline de tres etapas y su telemetría (248 pasos, 300 s, 43k tokens/s) sirven de plantilla para reproducir experimentos de KD en GPUs de consumo.
- Extracción de embeddings para clasificación de texto en inglés: usar las representaciones del encoder como features en modelos downstream ligeros.
- Evaluación de robustez de atención subcuadrática: medir la degradación de precisión al aumentar la longitud de secuencia frente al BERT original.
- Docencia y demostraciones: ejemplo mínimo de cómo sustituir capas de atención en un transformer preentrenado y publicarlo en Hugging Face con `custom_code`.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (MLM pseudo-perplejidad determinista sobre WikiText-2, 15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT teacher (`bert-base-uncased`) | 6,84 | 68,42 | referencia |
| Stage 0 (Ridge en forma cerrada) | 0,00 | 83,03 | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 91,40 | -6,84 |

No se han publicado resultados en la información disponible para benchmarks estándar como MMLU, GLUE, SQuAD o HumanEval. Las cifras de PPL 0,00 son sospechosas y probablemente reflejan un artefacto de la métrica de pseudo-perplejidad determinista; no deben tomarse como indicador de calidad real sin validación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB en fp32 para un BERT-base de ~110 M de parámetros; el repositorio ocupa 0,5 GB. No se dispone de cifras oficiales de cuantización.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor usó una RTX 3090 para el entrenamiento (pico de 8.487 MB).
- Cabe en GPUs de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `pipeline("fill-mask")` y `trust_remote_code=True` (requiere `custom_code`); la API propia `neuralops.load_pretrained_bert`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible para inferencia; el autor reporta 43.002,5 tokens/s durante la destilación en una RTX 3090, cifra de entrenamiento, no de serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-alibi-sst2` | no disponible (~110 M heredados) | no disponible | fill-mask | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` | ~110 M | 512 tokens | fill-mask, encoder | Apache 2.0 | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased` | ~66 M | 512 tokens | fill-mask, encoder | Apache 2.0 | Hugging Face, `transformers` estándar |
| `roberta-base` | ~125 M | 512 tokens | fill-mask, encoder | MIT | Hugging Face, `transformers` estándar |

No se dispone de comparativas de rendimiento publicadas entre este modelo y las alternativas; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- Las métricas reportadas (PPL 0,00) son anómalas y no están validadas de forma independiente; no deben usarse como evidencia de calidad superior al BERT original.
- Requiere `custom_code` y la librería `neuralops` para cargarse; no funciona con un `AutoModel` estándar sin `trust_remote_code=True`.
- Riesgo de alucinación y sesgos heredados del corpus WikiText-2 y de `bert-base-uncased`, que no se han mitigado explícitamente.
- No apto para tool calling, agentes, razonamiento multi-paso ni tareas generativas largas.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad en producción.
- Sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario muy limitados.
- No se documentan límites de contexto efectivos ni comportamiento con secuencias largas pese a usar ALiBi.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-alibi-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper ALiBi (referencia del mecanismo, no enlazado en la información): no disponible
- Demo o blog del autor: no disponible
