# tahamajs/bert-preconditioned-gdn-attention-sst2

## Resumen

`tahamajs/bert-preconditioned-gdn-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que las doce capas de atencion softmax cuadratica han sido sustituidas por el mecanismo `preconditioned_gdn_attention` de la libreria NeuralOps. El modelo pertenece al "Attention Zoo" del autor (Taha Majlesi) y se distribuye como un ejercicio de destilacion de representaciones sobre la tarea SST-2 del benchmark GLUE, con un pipeline de `text-classification` binaria (sentimiento positivo/negativo).

El interes tecnico del checkpoint no reside en su calidad predictiva, sino en la infraestructura que demuestra: serializacion modular de solo pesos de atencion (fichero `attention_weights.safetensors` en FP16, ~55 MB) sobre una base BERT congelada, y un protocolo de destilacion con cache offline de representaciones del profesor que evita reservar VRAM para el teacher. La atencion subcuadratica promete complejidad efectiva O(N) u O(N log N) frente a la O(N^2) de la MHA estandar.

Los resultados publicados son, sin embargo, muy limitados: la accuracy en el split de validacion de SST-2 es del 49.08 %, practicamente equivalente a la clasificacion aleatoria en una tarea binaria, y el propio autor la etiqueta como "Subquadratic Probe". El entrenamiento consistio en 13 pasos de optimizacion durante 61.2 segundos en una RTX 3090. Debe tratarse, por tanto, como una prueba de concepto de la libreria NeuralOps y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion `preconditioned_gdn_attention` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (base BERT-base-uncased); pesos entrenados publicados: solo atencion + cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base-uncased, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 en los pesos publicados; no se documentan otras cuantizaciones (GGUF, INT8, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) + codigo remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parametros, encoder bidireccional) y reemplaza en cada capa el bloque de multi-head attention por `preconditioned_gdn_attention`, un mecanismo de atencion subcuadratica de la familia NeuralOps que declara complejidad efectiva O(N) u O(N log N). Los pesos base de BERT permanecen congelados; el repositorio solo almacena los parametros de atencion entrenados y la cabeza de clasificacion, que el shim de codigo remoto combina en tiempo de carga con los pesos originales descargados de `bert-base-uncased`.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una primera etapa de alineamiento de subespacio oculto y una segunda etapa con KL sobre logits y entropia cruzada de tarea. El profesor es el propio `bert-base-uncased` afinado en SST-2 (accuracy 91.63 %). La destilacion se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB con cache offline de representaciones (sin VRAM para el teacher), 13 pasos de optimizacion, 61.2 segundos de duracion, throughput de 1740.5 tokens/s y un pico de 7419 MB de VRAM. No se documentan el volumen de tokens de entrenamiento ni la composicion completa del dataset mas alla de GLUE/SST-2.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, unica tarea para la que se ha entrenado y evaluado.
- Inferencia compatible con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` con `attention_type="preconditioned_gdn_attention"`.
- Reutilizacion de la base BERT congelada: el checkpoint solo aporta los pesos de atencion y la cabeza de tarea.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes ni modo "thinking".
- Capacidad multilingue: no; solo ingles.

## Casos de uso

- Prueba de concepto de atencion subcuadratica: sirve para validar en un entorno controlado (SST-2, BERT-base) que el mecanismo `preconditioned_gdn_attention` se integra y ejecuta correctamente dentro de un transformer estandar.
- Benchmark de infraestructura NeuralOps: permite medir el coste de carga modular (55 MB de pesos de atencion frente a los ~450 MB de la base completa) y el flujo de codigo remoto en `transformers`.
- Investigacion sobre destilacion con cache offline: el protocolo documentado (sin VRAM de teacher, 13 pasos, 61.2 s en RTX 3090) es replicable como referencia para experimentos de alineamiento de representaciones.
- Comparativa de mecanismos de atencion: util como linea base "pre-KD" (49.08 % de accuracy) frente a variantes del Attention Zoo para estudiar el efecto de la destilacion.
- Docencia y divulgacion: ejemplo minimo de sustitucion de atencion en BERT y de serializacion parametro-eficiente para cursos o talleres.
- Integracion en pipelines de evaluacion GLUE: el checkpoint puede insertarse en harnesses de evaluacion de SST-2 para comprobar compatibilidad de API, no para obtener predicciones fiables.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Teacher (`bert-base-uncased`) | Student pre-KD | Student post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91.63 % | 49.08 % | 49.08 % | +0.00 % |
| Cross-entropy de validacion | 0.2428 | no calibrada | 0.8858 | no disponible |

Telemetria de entrenamiento (RTX 3090, 24 GB): 13 pasos de optimizacion, 61.2 s, 1740.5 tokens/s, pico de 7419 MB de VRAM. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para los pesos publicados (~55 MB), mas la base BERT-base-uncased congelada (~220 MB en FP16, ~440 MB en FP32) que se descarga y combina en tiempo de carga.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; el autor uso una RTX 3090 para el entrenamiento, no para inferencia.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (via oficial documentada); la API `neuralops.hub.bert_zoo` como alternativa de carga modular. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia; solo se publica throughput de entrenamiento (1740.5 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-preconditioned-gdn-attention-sst2` | 110 M (base) + atencion entrenada | no disponible (base BERT: 512) | 49.08 % | MIT | Hugging Face, codigo remoto |
| `google-bert/bert-base-uncased` (teacher afinado) | 110 M | 512 | 91.63 % | Apache 2.0 (base) | Hugging Face |
| `textattack/bert-base-uncased-SST-2` (referencia tipica de la comunidad) | 110 M | 512 | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Rendimiento predictivo practicamente aleatorio: 49.08 % de accuracy en una tarea binaria, identico antes y despues de la destilacion; no debe usarse para clasificacion de sentimiento real.
- El autor etiqueta explicitamente el resultado como "Subquadratic Probe", lo que confirma que es un experimento y no un modelo afinado.
- Entrenamiento extremadamente corto (13 pasos, 61.2 s), insuficiente para converger; la cross-entropy de validacion (0.8858) es muy superior a la del teacher (0.2428).
- Solo ingles; sin soporte multilingue documentado.
- Requiere `trust_remote_code=True` y ejecuta codigo remoto del autor (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad y de mantenimiento a revisar antes de usarlo en produccion.
- Dependencia de la base `bert-base-uncased` descargada por separado; el repositorio no es autocontenido.
- Sin datos publicados sobre sesgos, alucinacion (tarea de clasificacion, no generativa), robustez adversarial ni evaluacion fuera de SST-2.
- Licencia MIT permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue productivo.
- Cero descargas y cero "likes" en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-preconditioned-gdn-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
