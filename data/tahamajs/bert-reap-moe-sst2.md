# tahamajs/bert-reap-moe-sst2

## Resumen

`tahamajs/bert-reap-moe-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`, 110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `reap_moe`, perteneciente a la librería NeuralOps. El autor es Taha Majlesi y el modelo está pensado exclusivamente para clasificación de sentimiento binaria sobre la tarea SST-2 del benchmark GLUE. La motivación es demostrar que una atención subcuadrática (complejidad efectiva O(N) u O(N log N) frente a O(N²)) puede igualar o superar ligeramente al profesor cuadrático original tras un proceso de destilación.

El modelo se distribuye como pesos de solo atención en FP16 (`attention_weights.safetensors`, unos 55 MB) más una cabeza de clasificación; el resto de los pesos congelados de BERT-Base se reconstruyen en tiempo de carga desde el repositorio original mediante un shim de código remoto (`modeling_neuralops_bert.py`). Esto lo convierte en un artefacto de investigación modular más que en un modelo autónomo listo para producción.

Su relevancia actual es acotada pero concreta: sirve como referencia reproducible de que la destilación de representaciones en caché (sin asignar VRAM al profesor) permite adaptar mecanismos de atención alternativos sobre arquitecturas preentrenadas con un coste de entrenamiento mínimo (240 pasos, 49,5 s en una RTX 3090). No es un modelo generativo ni multilingüe: es un clasificador de sentimiento en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `reap_moe` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (base BERT-Base); pesos entrenados publicados: solo atención + cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | No aplica (no es un MoE disperso en el sentido de enrutamiento por token; `reap_moe` es el nombre del mecanismo de atención) |
| Longitud de contexto | No disponible (BERT-Base estándar admite 512 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (FP16, `attention_weights.safetensors`) + código remoto Python (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza la atención multi-cabeza softmax cuadrática por `reap_moe`, un mecanismo de la Attention Zoo de NeuralOps con complejidad operativa subcuadrática declarada de O(N) u O(N log N). El resto de la arquitectura (embeddings, feed-forward, normalizaciones) se mantiene congelado desde el modelo base. La serialización es modular: solo se publican los parámetros de atención destilados y la cabeza de clasificación, y el código remoto reconstruye el modelo completo al cargarlo.

El entrenamiento sigue el Protocolo de Destilación de Representaciones en Caché de NeuralOps, en dos etapas: alineamiento de subespacio oculto y, después, KL sobre logits más entropía cruzada de la tarea. El profesor (`bert-base-uncased`) se ejecuta offline y sus representaciones se cachean, de modo que no ocupa VRAM durante el entrenamiento del alumno. Se ejecutó en una NVIDIA RTX 3090 de 24 GB, con 240 pasos de optimización, 49,5 s de duración, throughput efectivo de 39 720,3 tokens/s y un pico de VRAM de 8365 MB. No se documentan el volumen de tokens de entrenamiento, la composición del dataset más allá de GLUE/SST-2, ni si hubo RLHF o DPO (no aplica a una tarea de clasificación).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés sobre secuencias estilo SST-2.
- Atención subcuadrática: el mecanismo `reap_moe` reduce la complejidad teórica frente a la atención cuadrática estándar, lo que interesa para secuencias largas.
- Carga modular vía `AutoModelForSequenceClassification` con `trust_remote_code=True` o mediante la API `load_pretrained_bert` de NeuralOps.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüismo: no; solo inglés.
- No se documentan capacidades de extracción de embeddings más allá de la cabeza de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto en inglés: el modelo recibe una frase y devuelve la etiqueta 0/1; su accuracy del 91,74 % en SST-2 lo hace adecuado para filtrado automático de opiniones a gran escala.
- Moderación de comentarios en foros anglófonos: clasificación rápida de polaridad para priorizar revisiones humanas, con un coste de inferencia bajo al ser un modelo de 110 M de parámetros.
- Investigación sobre atención subcuadrática: sirve como checkpoint de referencia para comparar `reap_moe` con atención softmax en tareas de comprensión, replicando el protocolo de destilación del autor.
- Docencia y experimentación con destilación de conocimiento: el flujo de dos etapas (alineamiento de subespacio + KL sobre logits) es reproducible en una sola GPU consumer y sirve de plantilla para adaptar otros mecanismos de atención.
- Análisis de opiniones en pipelines de NLP clásicos: al integrarse con `transformers`, puede encadenarse con tokenizadores y frameworks existentes para tareas de sentiment analysis en inglés.
- Benchmarking de eficiencia: útil para medir el impacto real de la atención subcuadrática en latencia y memoria frente a BERT-Base en secuencias largas, aunque el autor no publica esas métricas.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Alumno pre-KD (`reap_moe`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 91,63 % | 91,74 % | +0,11 % |
| Entropia cruzada de validacion | 0,2428 | No calibrada | 0,2696 | Convergido |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 8365 MB de pico en una RTX 3090. Para inferencia de un BERT-Base de 110 M en FP16 se espera un consumo muy inferior (del orden de 1-2 GB incluyendo activaciones para lotes pequeños), aunque el autor no lo documenta.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el propio autor validó el flujo en una RTX 3090 de 24 GB.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores; no hay medición publicada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la API `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato es safetensors con código remoto, no GGUF).
- Latencia y throughput: solo se publica el throughput de entrenamiento (39 720,3 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-reap-moe-sst2` | 110 M (base) | No disponible | 91,74 % | MIT | Hugging Face, código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | No disponible en la información proporcionada | Apache 2.0 | Hugging Face, transformers estándar |
| `roberta-base` fine-tuneado en SST-2 | 125 M | 512 tokens | No disponible en la información proporcionada | MIT | Hugging Face |

La comparación con DistilBERT y RoBERTa no puede cuantificarse porque no se han proporcionado sus métricas en esta ficha; solo se incluyen como alternativas de la misma categoría (clasificación de sentimiento en inglés).

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de sentimiento binaria SST-2; no es un modelo generativo ni un asistente.
- Solo inglés; no hay soporte multilingüe documentado.
- Requiere `trust_remote_code=True` y ejecuta código Python remoto (`modeling_neuralops_bert.py`); implica un riesgo de seguridad y de compatibilidad con versiones futuras de `transformers`.
- Depende de la reconstrucción de los pesos congelados de `bert-base-uncased` en tiempo de carga; si el repositorio base cambia o no está disponible, el modelo no funciona.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de SST-2 (dominio de reseñas de cine).
- Sin datos publicados de sesgo, robustez adversarial ni evaluación fuera de SST-2.
- Licencia MIT permite uso comercial, pero el código remoto y la dependencia de NeuralOps deben auditarse antes de desplegar en producción.
- No hay soporte documentado para cuantización, GGUF ni motores de inferencia de alto rendimiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-reap-moe-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
