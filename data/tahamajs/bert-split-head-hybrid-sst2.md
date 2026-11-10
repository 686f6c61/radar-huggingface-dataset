# tahamajs/bert-split-head-hybrid-sst2

## Resumen

`tahamajs/bert-split-head-hybrid-sst2` es un checkpoint de BERT-Base (110 M de parámetros) en el que el autor, Taha Majlesi, ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `split_head_hybrid` de su librería NeuralOps. El objetivo declarado es demostrar que una atención subcuadrática (complejidad efectiva O(N) u O(N log N) frente a O(N²)) puede destilarse hasta un rendimiento razonable en una tarea de clasificación de sentimiento, en este caso SST-2 del benchmark GLUE.

El modelo se distribuye como un adaptador de atención en FP16 de aproximadamente 55 MB (`attention_weights.safetensors`) más una cabeza de clasificación, no como un checkpoint completo. El código remoto (`modeling_neuralops_bert.py`) reconstruye la base congelada desde `bert-base-uncased` y aplica encima los pesos destilados. La destilación se realizó con el protocolo *Cached Representation Distillation* de NeuralOps, que cachea las representaciones del profesor en disco para no mantenerlo en VRAM, sobre una única RTX 3090.

La relevancia es acotada pero clara: es un artefacto de investigación reproducible (194 pasos de optimización, 58,2 s de entrenamiento) que sirve como referencia de hasta dónde llega la destilación de atención subcuadrática en una tarea concreta, no como un modelo listo para producción. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `split_head_hybrid` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (base BERT-Base congelada) + pesos de atención y cabeza de clasificación destilados |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB) + código remoto `modeling_neuralops_bert.py`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` (12 capas, 768 de dimensión oculta, 12 cabezas, ~110 M de parámetros) y reemplaza la atención multi-cabeza estándar por `split_head_hybrid`, un mecanismo del *Attention Zoo* de NeuralOps que promete escalado subcuadrático. El resto del encoder y los embeddings permanecen congelados; solo se entrenan los parámetros de atención y la cabeza de clasificación, lo que explica el reducido tamaño del artefacto (55 MB frente a los ~450 MB del BERT completo).

El entrenamiento sigue un esquema de destilación en dos etapas sobre SST-2: primero una alineación de subespacio oculto (Stage 1) y después una combinación de KL sobre logits del profesor más entropía cruzada de la tarea (Stage 2). Se usó el protocolo *Cached Representation Distillation*, que cachea las representaciones del profesor para no asignar VRAM al modelo docente durante el entrenamiento. La ejecución completa constó de 194 pasos de optimización, 58,2 s de duración y un throughput efectivo de 27 318 tokens/s, con un pico de 9 199 MB de VRAM en una RTX 3090. No se documentan el número total de tokens de entrenamiento, la composición del dataset más allá de GLUE/SST-2, ni si hubo RLHF o DPO (no aplica en un clasificador).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, entrenada específicamente en SST-2.
- Inferencia con la API estándar de Transformers (`AutoModelForSequenceClassification`) usando `trust_remote_code=True`.
- Carga modular mediante la API de NeuralOps (`load_pretrained_bert`) que reconstruye la atención sobre la base BERT congelada.
- Atención subcuadrática: el autor declara complejidad efectiva O(N) u O(N log N), relevante para secuencias largas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe: no disponible; solo inglés.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto en inglés: el modelo devuelve directamente la etiqueta binaria sobre SST-2, que es su tarea de entrenamiento, con una accuracy declarada del 80,50 % en validación.
- Filtrado de comentarios en pipelines de moderación: al ser un clasificador ligero (55 MB de pesos descargables), puede ejecutarse en CPU o GPU de gama baja para preetiquetar grandes volúmenes antes de una revisión humana.
- Investigación sobre atención subcuadrática: sirve como baseline reproducible para comparar `split_head_hybrid` con MHA estándar en tareas GLUE, dado que el autor publica el protocolo de destilación y las métricas de entrenamiento.
- Docencia y experimentación con destilación: el bajo coste de entrenamiento (58,2 s en una RTX 3090, 194 pasos) permite reproducir el experimento en un portátil con GPU consumer.
- Pruebas de integración de código remoto en Transformers: útil para validar flujos con `trust_remote_code=True` y pesos modulares que se reconstruyen desde un modelo base.
- Benchmark interno de latencia en clasificación corta: al sustituir la atención cuadrática, permite medir el impacto de la complejidad en secuencias de distinta longitud dentro de un mismo encoder BERT.
- No se recomienda para análisis de sentimiento en producción sin validación adicional: la brecha de 11,13 puntos frente al profesor (91,63 % vs. 80,50 %) es significativa.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---:|---:|---:|
| Accuracy GLUE SST-2 | 91,63 % | 54,59 % | 80,50 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,4556 |
| Delta de accuracy vs. profesor | — | −37,04 % | −11,13 % |

Telemetría de entrenamiento declarada: 58,2 s, 194 pasos, 27 318 tokens/s, pico de 9 199 MB de VRAM en una RTX 3090. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un BERT-Base de 110 M de parámetros, la inferencia en FP16 requiere del orden de 1-2 GB incluyendo activaciones para secuencias cortas, pero el autor no publica la cifra.
- GPU recomendadas: el autor solo documenta entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB); para inferencia no especifica modelos concretos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, aunque no hay medición publicada.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y la API de NeuralOps (`neuralops.hub.bert_zoo`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publica throughput de entrenamiento (27 318 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-split-head-hybrid-sst2` | 110 M (base) + atención destilada | no disponible | 80,50 % | MIT | Hugging Face, requiere código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, Transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face, Transformers estándar |
| `roberta-base` fine-tuned en SST-2 | 125 M | 512 tokens | no disponible en la información proporcionada | MIT | Hugging Face, Transformers estándar |

La comparativa con DistilBERT y RoBERTa se incluye por categoría (clasificadores ligeros en inglés), pero no se dispone de sus cifras exactas en la información proporcionada; no se inventan.

## Limitaciones y advertencias

- Brecha de rendimiento notable frente al profesor: 80,50 % frente a 91,63 % en SST-2, una diferencia de 11,13 puntos que limita su uso en producción.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Solo clasificación binaria de sentimiento: no es un modelo generativo ni un encoder de propósito general; no sirve para NER, QA, resumen ni otras tareas sin reentrenamiento.
- Requiere `trust_remote_code=True`: ejecuta código Python del autor, lo que implica un riesgo de seguridad y de mantenimiento a largo plazo.
- Pesos modulares: el repositorio no contiene el modelo completo; depende de `bert-base-uncased` para reconstruirse, lo que añade una dependencia externa y posibles fallos si el modelo base cambia.
- Riesgo de alucinación: no aplica en sentido estricto (no genera texto), pero el clasificador puede producir etiquetas erróneas en dominios alejados de SST-2 (reseñas de películas).
- Sesgos: no se documenta ningún análisis de sesgo; al heredar la base de `bert-base-uncased`, arrastra los sesgos de su corpus de entrenamiento (sin especificar).
- Licencia MIT: permite uso comercial, pero al depender de `bert-base-uncased` (Apache 2.0) conviene revisar ambas licencias en despliegues.
- Sin métricas de latencia ni de VRAM de inferencia publicadas: difícil estimar coste operativo sin medirlo.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-split-head-hybrid-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
