# syanissa/distilhubert-finetuned-gtzan

## Resumen

distilhubert-finetuned-gtzan es un modelo de clasificacion de audio obtenido mediante fine-tuning de ntu-spml/distilhubert sobre el conjunto de datos GTZAN, una coleccion de referencia de fragmentos musicales de 30 segundos etiquetados en diez generos. Lo desarrolla el usuario syanissa y se distribuye con licencia Apache 2.0 a traves de Hugging Face, empaquetado para la libreria transformers con pesos en formato safetensors.

El modelo resuelve la tarea de clasificacion automatica de genero musical: recibe una forma de onda de audio y devuelve una distribucion de probabilidad sobre las clases del dataset. Con 23,7 millones de parametros, es un modelo compacto pensado para inferencia ligera, lo que lo hace atractivo para prototipos, demostraciones y pipelines donde el coste computacional importa mas que la precision absoluta.

Su relevancia actual es acotada pero clara: sirve como ejemplo reproducible de fine-tuning de un encoder HuBERT destilado sobre una tarea concreta, y como punto de partida para quien quiera adaptar distilhubert a su propio corpus musical o de audio. No es un modelo generalista ni multilingue; su alcance esta limitado al dominio y a las etiquetas de GTZAN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT destilado (transformer encoder para audio, base ntu-spml/distilhubert) |
| Parametros totales | 23.691.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ntu-spml/distilhubert, una version destilada de HuBERT que reduce el coste de computo del encoder original manteniendo la capacidad de extraer representaciones de audio. Sobre esa base se anade una cabeza de clasificacion para las diez clases de GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock). El resultado es un clasificador de audio de 23,7 millones de parametros.

El fine-tuning se realizo con los hiperparametros declarados en la model card: learning rate de 5e-05, batch de 8 en entrenamiento y evaluacion, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 100 pasos de calentamiento, 10 epocas, semilla 42 y precision mixta nativa (AMP). El conjunto de datos es sanchit-gandhi/gtzan. La model card no documenta el numero de tokens ni la composicion exacta del dataset, ni indica si hubo RLHF, DPO u otra fase de alineamiento; tampoco describe innovaciones tecnicas adicionales mas alla de la propia destilacion del modelo base.

## Capacidades

- Clasificacion de audio en diez generos musicales segun las etiquetas de GTZAN.
- Extraccion de representaciones de audio mediante el encoder HuBERT destilado.
- Inferencia ligera: 23,7 millones de parametros permiten ejecucion en CPU y GPU de gama baja.
- Integracion con el pipeline `audio-classification` de transformers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido textual; opera sobre audio.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Prototipado de clasificacion de genero musical: el modelo permite montar un demo funcional en pocas lineas con el pipeline de transformers, adecuado para validar una idea antes de invertir en un modelo mayor.
- Etiquetado asistido de bibliotecas musicales: se puede usar para preclasificar fragmentos de 30 segundos y reducir el trabajo manual de anotacion, aceptando la tasa de error del 18 por ciento.
- Filtrado previo en sistemas de recomendacion: como primer estadio de un pipeline de recomendacion musical, descartando o agrupando candidatos por genero antes de aplicar modelos mas costosos.
- Educacion y experimentacion: sirve como ejemplo reproducible de fine-tuning de un encoder de audio destilado, util en cursos y talleres sobre transformers aplicados a audio.
- Investigacion sobre destilacion en audio: permite comparar el rendimiento de distilhubert frente a HuBERT completo en una tarea concreta y con hiperparametros documentados.
- Deteccion de genero en entornos con recursos limitados: al ser un modelo pequeno, puede desplegarse en dispositivos con poca memoria o en contenedores sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (sanchit-gandhi/gtzan) | Accuracy | 0,82 |
| Audio Classification | GTZAN (sanchit-gandhi/gtzan) | Loss (evaluacion) | 0,5498 |

Evolucion del entrenamiento declarada:

| Epoca | Validation Loss | Accuracy |
|---|---|---|
| 1 | 1,8141 | 0,55 |
| 2 | 1,2168 | 0,71 |
| 3 | 1,0417 | 0,72 |
| 4 | 0,7942 | 0,77 |
| 5 | 0,6706 | 0,81 |
| 6 | 0,5696 | 0,82 |
| 7 | 0,5117 | 0,83 |
| 8 | 0,5903 | 0,82 |
| 9 | 0,5343 | 0,82 |
| 10 | 0,5498 | 0,82 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo de clasificacion de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa; el repositorio ocupa 0,9 GB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada son suficientes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales, y tambien en CPU.
- Opciones de despliegue: pipeline de transformers, endpoints compatibles (el modelo esta marcado como `endpoints_compatible`), exportacion a ONNX si se necesita optimizar latencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Accuracy GTZAN |
|---|---|---|---|---|---|
| syanissa/distilhubert-finetuned-gtzan | 23,7 M | Clasificacion de audio | no disponible | Apache 2.0 | 0,82 (declarado) |
| ntu-spml/distilhubert (base) | no disponible | Representaciones de audio | no disponible | no disponible | no disponible (no fine-tuneado para GTZAN) |
| HuBERT base (facebook/hubert-base-ls960) | no disponible en la informacion | Representaciones de audio | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de alternativas comparables sobre GTZAN, por lo que la comparativa cuantitativa queda limitada al resultado declarado por el autor.

## Limitaciones y advertencias

- El modelo solo distingue las diez clases de GTZAN; cualquier audio fuera de ese esquema se asignara a una de ellas con mayor o menor confianza.
- La accuracy declarada es del 0,82 y no ha sido verificada de forma independiente (`verified: false` en la model-index).
- GTZAN es un dataset conocido por sus problemas de calidad y posibles duplicados; el rendimiento real en produccion puede diferir del reportado.
- La model card esta generada automaticamente y deja secciones como "Intended uses & limitations" y "Training and evaluation data" sin completar.
- No hay informacion sobre sesgos, robustez ante ruido, ni comportamiento con audio de duracion distinta a la esperada.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza; conviene calibrar umbrales antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de origen pueden tener condiciones adicionales que conviene revisar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syanissa/distilhubert-finetuned-gtzan
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset utilizado: https://huggingface.co/datasets/sanchit-gandhi/gtzan
- Paper de HuBERT (referencia del linaje arquitectonico): https://arxiv.org/abs/2106.07447
