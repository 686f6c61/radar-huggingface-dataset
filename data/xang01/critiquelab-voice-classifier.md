# Xang01/critiquelab-voice-classifier

## Resumen

critiquelab-voice-classifier es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de distilbert-base-uncased, la variante destilada de BERT desarrollada por Hugging Face. Lo publica el usuario Xang01 bajo licencia Apache 2.0 y está pensado, por su nombre, para clasificar intervenciones de voz transcritas en el contexto de una herramienta llamada CritiqueLab, aunque la model card no documenta la taxonomía de etiquetas ni el conjunto de datos empleado.

Técnicamente es un transformer encoder de 6 capas con 66.956.548 parámetros (unos 67 millones), lo que lo sitúa en la gama ligerísima: cabe en cualquier GPU de consumo e incluso en CPU con latencias de milisegundos. El entrenamiento se realizó durante 3 épocas con un batch size de 16 y un learning rate de 2e-05, alcanzando una accuracy de 0,6456 y un F1 macro de 0,6976 sobre el conjunto de evaluación.

Su relevancia es limitada y muy específica: se trata de un artefacto experimental sin descargas ni likes, con una model card autogenerada por el Trainer y sin documentación de uso. Resulta útil únicamente como punto de partida para quien quiera reproducir o adaptar un clasificador de texto ligero basado en DistilBERT, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parámetros totales | 66.956.548 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens de entrada) |
| Tipos de cuantización | no disponible (compatible con cuantización dinámica INT8 vía PyTorch y con GGUF mediante conversión externa) |
| Idiomas soportados | no disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento de BERT-base (12 capas, 110 millones). DistilBERT reduce el tamaño aproximadamente un 40 % manteniendo, según sus autores, alrededor del 97 % del rendimiento de BERT en tareas de comprensión del lenguaje. Al ser uncased, el tokenizador normaliza a minúsculas y elimina acentos en la fase de preprocesado.

El entrenamiento se ejecutó con el Trainer de Transformers (versión 5.24.0), PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. Hiperparámetros: learning rate 2e-05, batch size de 16 en entrenamiento y evaluación, 3 épocas, optimizador AdamW fused con betas (0,9 / 0,999) y epsilon 1e-08, scheduler lineal y semilla 42. Se completaron 120 pasos en total (40 por época). No se documenta el volumen de datos, la composición del dataset, el número de etiquetas ni si hubo aumento de datos o balanceo de clases. Tampoco se indica ningún proceso de RLHF, DPO ni innovación arquitectónica adicional: es un fine-tuning estándar de clasificación con cabeza lineal sobre el token [CLS].

## Capacidades

- Clasificación de texto por secuencia completa (pipeline `text-classification`), devolviendo una distribución de probabilidad sobre las etiquetas aprendidas.
- Procesamiento de intervenciones transcritas de voz, presumiblemente para etiquetar turnos de conversación en la herramienta CritiqueLab (la taxonomía exacta no está documentada).
- Extracción de embeddings contextuales del token [CLS] y de los tokens individuales, reutilizables para tareas de similitud o clustering.
- Inferencia rápida en CPU y GPU de gama baja gracias a sus 67 millones de parámetros.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo thinking, visión ni audio: solo procesa texto.
- Capacidad multilingüe no documentada; el modelo base está orientado al inglés.

## Casos de uso

- Clasificación de transcripciones de reuniones: el modelo puede etiquetar cada turno de habla según la categoría aprendida (por ejemplo, tipo de intervención o feedback), procesando secuencias de hasta 512 tokens con latencia inferior a 10 ms en GPU de consumo.
- Moderación de contenido en foros o chats: al ser un clasificador ligero, permite filtrar mensajes en tiempo real a bajo coste computacional, aunque la accuracy de 0,6456 exige umbrales conservadores y revisión humana.
- Enrutado de tickets de soporte: se puede integrar como primer clasificador en un pipeline que derive consultas a equipos especializados, dejando los casos de baja confianza a un modelo mayor.
- Análisis de sentimiento o intención en encuestas de voz transcritas: útil para agregar métricas por categoría en lotes grandes sin coste de GPU dedicada.
- Etiquetado asistido para anotación humana: el modelo puede pre-anotar un corpus y que los anotadores corrijan, reduciendo el tiempo de etiquetado manual.
- Prototipado rápido de clasificadores de dominio: sirve como plantilla reproducible (hiperparámetros y semilla documentados) para adaptar DistilBERT a una taxonomía propia con pocas horas de GPU.
- Filtro previo en sistemas RAG: descartar documentos o fragmentos irrelevantes antes de pasarlos a un modelo generativo, ahorrando tokens de contexto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no descrito):

| Métrica | Época 1 (paso 40) | Época 2 (paso 80) | Época 3 (paso 120) |
|---|---|---|---|
| Validation loss | 1,2322 | 1,0400 | 0,9631 |
| Accuracy | 0,3418 | 0,5949 | 0,6456 |
| F1 macro | 0,2159 | 0,6272 | 0,6976 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB de pesos, más activaciones; en la práctica cabe en cualquier GPU con 1 GB o más.
- VRAM estimada en FP16: unos 135 MB; en INT8 dinámico, alrededor de 70 MB.
- GPU recomendadas: cualquier GPU moderna, desde una GTX 1650 o T4 hasta A100/H100; el modelo está limitado por latencia, no por memoria.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, portátiles con GPU integrada) y funciona en CPU con throughput aceptable para lotes moderados.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (el repo está marcado como `endpoints_compatible`), TorchServe, FastAPI con batch dinámico, ONNX Runtime y conversión a GGUF para llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un encoder de 67 millones se espera un throughput de varios cientos a miles de secuencias cortas por segundo en GPU, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comentario |
|---|---|---|---|---|
| critiquelab-voice-classifier | 66,9 M | hasta 512 tokens (heredado del base) | Apache 2.0 | Fine-tuning específico, sin documentación de dataset ni etiquetas |
| distilbert-base-uncased | 66,9 M | 512 tokens | Apache 2.0 | Modelo base sin ajustar; requiere fine-tuning para clasificación |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Mayor capacidad, ~1,6× más parámetros y más lento en CPU |
| roberta-base | 125 M | 512 tokens | MIT | Encoder más robusto en inglés, mayor coste computacional |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card está autogenerada y no documenta el dataset, las etiquetas, el dominio de aplicación ni los usos previstos; no se puede validar qué está aprendiendo el modelo.
- La accuracy de 0,6456 y el F1 macro de 0,6976 indican un rendimiento moderado; la brecha entre ambas métricas sugiere desequilibrio entre clases.
- Riesgo elevado de alucinación de etiquetas fuera de distribución: al ser un clasificador cerrado, asignará siempre una de las clases aprendidas aunque la entrada no pertenezca a ninguna.
- No hay evaluación de sesgos publicada; el modelo base uncased está entrenado mayoritariamente en inglés y puede degradarse con texto en castellano o con acentos y mayúsculas relevantes.
- Límite de 512 tokens por secuencia; entradas más largas requieren truncado o segmentación.
- Licencia Apache 2.0 permite uso comercial, pero al no existir documentación de procedencia de los datos de entrenamiento no se puede garantizar el cumplimiento de derechos de terceros.
- Sin descargas ni validación por la comunidad: no se recomienda su uso en producción sin una evaluación propia sobre datos representativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xang01/critiquelab-voice-classifier
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Documentación de Transformers (text classification): https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
