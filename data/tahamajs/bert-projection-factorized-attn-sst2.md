# tahamajs/bert-projection-factorized-attn-sst2

## Resumen

`tahamajs/bert-projection-factorized-attn-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110 M de parametros) en el que las 12 capas de atencion softmax cuadratica originales han sido sustituidas por el mecanismo `projection_factorized_attn` de la libreria NeuralOps. El modelo resultante se ha destilado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) y alcanza un 88,65 % de accuracy en el split de validacion, frente al 91,63 % del profesor BERT-Base original.

Lo desarrolla Taha Majlesi (usuario `tahamajs`) como parte del "Subquadratic Attention Zoo" de NeuralOps, un proyecto que busca reemplazar la atencion cuadratica por alternativas de complejidad subcuadratica (\(O(N)\) o \(O(N \log N)\)) manteniendo la calidad predictiva mediante destilacion. El interes practico esta en la serializacion: el repositorio solo publica los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), no el modelo completo, y el codigo remoto reconstruye la red sobre los pesos congelados de `bert-base-uncased`.

Es relevante ahora por dos motivos: demuestra que es posible hacer *swap* de atencion sobre un transformer preentrenado con un coste de entrenamiento minimo (52,6 s en una RTX 3090, 230 pasos) y recuperar casi todo el rendimiento del profesor, y abre la puerta a experimentar con mecanismos de atencion alternativos sin reentrenar desde cero. El contexto maximo no se especifica en la model card; al heredar la configuracion de BERT-Base, lo esperable es 512 tokens, pero no esta confirmado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `projection_factorized_attn` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (heredados de `bert-base-uncased`; el checkpoint publicado solo contiene atencion + cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configuracion BERT-Base: 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB) + codigo remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, 768 dimensiones ocultas, 12 cabezas, 110 M de parametros) y reemplaza en todas las capas el bloque de self-attention softmax por `projection_factorized_attn`, un mecanismo con complejidad efectiva \(O(N)\) o \(O(N \log N)\) en lugar de \(O(N^2)\). El modelo base queda congelado; solo se entrenan los pesos de atencion y la cabeza de clasificacion, que son los que se serializan en el repositorio. El codigo remoto inicializa los pesos congelados desde `bert-base-uncased` y aplica los parametros destilados en tiempo de carga.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", una destilacion en dos etapas: primero alineacion de subespacio oculto (Stage 1) y despues KL sobre logits mas entropia cruzada de la tarea (Stage 2). La destilacion se hace contra representaciones cacheadas offline del profesor, de modo que no se necesita VRAM para el profesor durante el entrenamiento. Se ejecuto en una NVIDIA RTX 3090 (24 GB) durante 52,6 s, 230 pasos de optimizacion, con un throughput de 35.820 tokens/s y un pico de VRAM de 7.744 MB. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de SST-2 (GLUE).

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre texto de una sola secuencia.
- Razonamiento semantico limitado a la tarea de clasificacion: no genera texto libre.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue: no, solo ingles.
- No dispone de modo thinking, vision ni audio.
- Integracion con la API de alto nivel de NeuralOps (`load_pretrained_bert`) para cargar solo los pesos de atencion sobre BERT-Base.

## Casos de uso

- Analisis de sentimiento en resenas de producto o comentarios de usuarios en ingles: el modelo clasifica cada texto en positivo o negativo con un 88,65 % de accuracy en SST-2, suficiente para filtrado automatico y priorizacion de colas de moderacion.
- Monitorizacion de reputacion en redes sociales: dado su bajo coste de inferencia (solo atencion subcuadratica sobre BERT-Base), se puede desplegar en batch sobre grandes volumenes de tuits o comentarios en ingles.
- Investigacion en mecanismos de atencion: sirve como punto de partida reproducible para comparar `projection_factorized_attn` con atencion softmax estandar en una tarea downstream concreta, con un checkpoint de 55 MB facil de versionar.
- Destilacion y experimentos de eficiencia: el protocolo de destilacion en dos etapas y el bajo coste de entrenamiento (52,6 s en una RTX 3090) permiten replicar el experimento con otros mecanismos de atencion o con otros modelos base.
- Clasificacion de tickets de soporte en ingles: integrado en un pipeline de atencion al cliente para etiquetar automaticamente la polaridad de la queja y enrutar al equipo adecuado.
- Filtrado previo en pipelines de datos: como clasificador ligero para descartar o etiquetar textos negativos antes de pasarlos a un modelo generativo mas caro.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,92 % | 88,65 % | +37,73 pp |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,3792 | no disponible |

Telemetria de entrenamiento (RTX 3090, 24 GB): 52,6 s de duracion, 230 pasos de optimizacion, 35.820 tokens/s de throughput efectivo y 7.744 MB de pico de VRAM. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo (BERT-Base + atencion destilada) ocupa aproximadamente 440 MB en FP16, por lo que cabe en cualquier GPU consumer con mas de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1650 o superior; el entrenamiento se realizo en una RTX 3090, pero la inferencia no requiere esa gama.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas (RTX 20xx/30xx/40xx, GTX 16xx) e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (via `AutoModelForSequenceClassification`), o la API de NeuralOps (`neuralops.hub.bert_zoo.load_pretrained_bert`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; el throughput de entrenamiento fue de 35.820 tokens/s en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-projection-factorized-attn-sst2` | 110 M (solo atencion publicada) | no disponible | 88,65 % | MIT | Hugging Face (repo de 55 MB) |
| `bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| `roberta-base` fine-tuned en SST-2 | 125 M | 512 | no disponible en la informacion proporcionada | MIT | Hugging Face |

La comparativa se limita a parametros, contexto y licencia; no se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no se pueden contrastar cifras de accuracy mas alla del profesor declarado por el autor.

## Limitaciones y advertencias

- Solo ingles: el modelo se entrena y evalua exclusivamente en SST-2, por lo que no es adecuado para otros idiomas sin reentrenamiento.
- Tarea unica: es un clasificador binario de sentimiento; no genera texto ni resuelve otras tareas de NLP.
- Brecha respecto al profesor: 2,98 puntos porcentuales de accuracy por debajo de `bert-base-uncased` (88,65 % frente a 91,63 %), lo que puede ser relevante en produccion con requisitos estrictos.
- Dependencia de codigo remoto: requiere `trust_remote_code=True` y la libreria NeuralOps, lo que anade una dependencia no estandar y riesgo de seguridad al cargar codigo de terceros.
- Pesos parciales: el repositorio no contiene el modelo completo, solo atencion y cabeza; la reconstruccion depende de que `bert-base-uncased` siga disponible en el Hub.
- Riesgo de alucinacion: no aplica en sentido generativo, pero el clasificador puede producir falsos positivos y negativos en textos ambiguos o con sarcasmo, igual que el profesor.
- Sesgos: al heredar el preentrenamiento de `bert-base-uncased` y el dataset SST-2, arrastra los sesgos de genero, raza y dominio de ambos; no se documenta ninguna mitigacion.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` esta bajo Apache 2.0, por lo que conviene revisar la compatibilidad en despliegues comerciales.
- Sin benchmarks adicionales: no hay evaluacion en otras tareas GLUE ni en dominios fuera de resenas de cine, por lo que la generalizacion es incierta.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-projection-factorized-attn-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
