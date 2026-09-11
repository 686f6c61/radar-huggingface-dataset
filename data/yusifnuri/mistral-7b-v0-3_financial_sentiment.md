# yusifnuri/Mistral-7B-v0.3_financial_sentiment

## Resumen

El modelo `yusifnuri/Mistral-7B-v0.3_financial_sentiment` es un adaptador LoRA entrenado con QLoRA sobre el modelo base `mistralai/Mistral-7B-v0.3` (7.250 millones de parámetros) para una única tarea: clasificar una frase financiera como negativa, neutra o positiva. Lo publica el autor yusifnuri como artefacto de investigación asociado a su tesis de máster *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg), cuyo objetivo es comparar modelos pequenos ajustados frente a APIs de proveedores frontera en accuracy, latencia, coste, exposicion de privacidad y volumen de retorno de inversion. El adaptador no es un asistente general: es una especializacion concreta de una sola tarea sobre un unico corpus publico.

Tecnicamente no es un modelo completo, sino un conjunto de pesos PEFT (LoRA) que se cargan sobre el checkpoint base. El entrenamiento se hizo con quantizacion de 4 bits en formato NF4 con doble cuantizacion, rango 16, alpha 32 y dropout 0.05 sobre los modulos de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`. El repositorio ocupa 0.1 GB, coherente con un adaptador de bajo rango y no con un modelo de 7B completo.

Su relevancia es metodologica y de verificabilidad: publica la matriz de evaluacion completa en un repositorio de GitHub para que el benchmark pueda reproducirse de forma independiente. El rendimiento medido es una accuracy de 0.845 con una latencia media de 562 ms en batch 1 sobre una NVIDIA H200, a un coste imputado de 19.47 USD por millon de tokens generados. La licencia declarada de los pesos es Apache 2.0, pero el corpus de entrenamiento es CC BY-NC-SA 3.0, lo que impide el uso comercial segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.3) con adaptadores LoRA sobre atencion; adaptacion QLoRA en 4 bits |
| Parametros totales | 7.250 millones en el modelo base; el adaptador LoRA anade un conjunto reducido de pesos de bajo rango (repo de 0.1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Mistral-7B-v0.3; el adaptador se entreno con longitud maxima de 512 tokens |
| Tipos de cuantizacion | Entrenamiento QLoRA en 4-bit NF4 con doble cuantizacion; los pesos del adaptador se distribuyen en safetensors (el base admite FP16/BF16, INT8 e INT4 al desplegar) |
| Idiomas soportados | No disponible en la informacion proporcionada; el corpus de entrenamiento (Financial PhraseBank) esta en ingles |
| Licencia | Apache 2.0 en los pesos del adaptador; el corpus de entrenamiento es CC BY-NC-SA 3.0, por lo que el autor declara el artefacto como no desplegable comercialmente |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-v0.3, un transformer decoder-only con atencion de consultas agrupadas (GQA), SwiGLU y RoPE. La adaptacion usa QLoRA: el modelo base se carga cuantizado en 4 bits NF4 con doble cuantizacion y solo se entrenan las matrices de bajo rango inyectadas en las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. La configuracion de LoRA es rango 16, alpha 32 y dropout 0.05.

El entrenamiento uso el corpus Financial PhraseBank en su configuracion AllAgree, con 5.000 ejemplos y 500 reservados para seleccion de checkpoint. Los hiperparametros fueron: learning rate 2e-4 con schedule coseno y 3% de warmup, 3 epocas, batch efectivo de 16 (2 x 8 con acumulacion de gradientes), optimizador AdamW, longitud maxima de secuencia 512 tokens y semilla 42. Todos los hiperparametros se mantuvieron constantes en todas las celdas del benchmark, por lo que el autor los describe como una cota inferior conservadora del rendimiento alcanzable. No se aplico RLHF ni DPO; el modelo fue adaptado desde la version *base* y no desde una version instruction-tuned, de modo que cualquier deficit es atribuible conjuntamente al modelo y a la adaptacion en 4 bits, sin que el diseno permita separar ambos factores.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases (negative / neutral / positive) a partir de una frase.
- Generacion de texto causal, heredada del modelo base, con el formato de prompt especifico de la tarea (`Classify the sentiment of this financial sentence (negative / neutral / positive): {text}\nSentiment:`).
- Razonamiento y codigo: no disponibles como capacidades evaluadas en este adaptador; el autor lo describe explicitamente como no apto para uso como asistente general.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el entrenamiento se hizo sobre un corpus en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Análisis de sentimiento en noticias financieras: el modelo clasifica titulares o frases de prensa economica en las tres clases, con la ventaja de poder ejecutarse on-premise sobre el modelo base y evitar el envio de texto a APIs de terceros.
- Verificacion de benchmarks de ajuste fino: dado que el autor publica la matriz de evaluacion y el harness en GitHub, sirve para reproducir la comparacion entre modelos pequenos ajustados y APIs frontera en accuracy, latencia y coste.
- Investigacion academica sobre cuantizacion: al estar entrenado con QLoRA 4-bit NF4, es un caso de estudio util para medir el impacto de la adaptacion de bajo rango sobre una tarea de clasificacion acotada.
- Prototipado de senales de trading por sentimiento: puede alimentar un pipeline que agregue el sentimiento de un flujo de frases financieras como caracteristica adicional, siempre que se asuma su accuracy de 0.845 y su naturaleza no comercial.
- Filtrado y enrutado de documentos en un corpus financiero: clasificar frases como negativas para priorizarlas en revision manual por analistas, usando el prompt fijo de tres clases.
- Trabajo de tesis y docencia: el par adaptador + harness de evaluacion permite a estudiantes medir el compromiso entre coste por token de una API y coste de un modelo pequeno autoalojado, con cifras de referencia (19.47 USD por millon de tokens generados, 562 ms por peticion en batch 1).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (clasificacion de sentimiento) | 0.845 |
| Latencia media, batch 1 | 562 ms |
| Coste por 1M de tokens generados | 19.47 USD |

Las mediciones se realizaron sobre una unica NVIDIA H200 (141 GB) con batch size uno y utilizacion completa, con un precio imputado de 3.99 USD por hora de GPU. La latencia excluye el transito de red. La evaluacion se ejecuto el 5 de julio de 2026. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible; los scores no son comparables entre tareas porque cada tarea lleva su propia metrica.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa menos de 0.1 GB; el consumo lo determina el modelo base. Mistral-7B-v0.3 en FP16/BF16 requiere aproximadamente 15 GB, en INT8 unos 8 GB y en 4 bits unos 4-5 GB, mas el overhead de activaciones y del contexto.
- GPU recomendadas: NVIDIA H200 (la usada en la evaluacion), H100, A100 40/80 GB para despliegue en precision completa y batches mayores.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 24 GB), siempre que se cuantice el modelo base a 4 bits. Con 24 GB se puede mantener en FP16.
- Opciones de despliegue: PEFT + transformers (carga del adaptador sobre el checkpoint base, como muestra el autor), vLLM y TGI con soporte de adaptadores LoRA, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput: 562 ms de latencia media en batch 1 sobre H200 con utilizacion completa. No se han publicado cifras de throughput en paralelo ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en sentimiento financiero | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yusifnuri/Mistral-7B-v0.3_financial_sentiment | 7.250 M (base) + adaptador LoRA | 32.768 tokens (base); entrenado a 512 | 0.845 de accuracy | Apache 2.0 en pesos, corpus CC BY-NC-SA 3.0 (no comercial) | HuggingFace, 0 descargas |
| mistralai/Mistral-7B-v0.3 (base, sin ajustar) | 7.250 M | 32.768 tokens | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |
| Otros modelos de sentimiento financiero (por ejemplo familia FinBERT) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible |

No se dispone en la informacion proporcionada de resultados comparables de terceros medidos con el mismo harness, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Restriccion de uso comercial: aunque la licencia de los pesos sea Apache 2.0, el autor indica que el adaptador es un artefacto de investigacion no desplegable comercialmente porque el corpus de entrenamiento (Financial PhraseBank) es CC BY-NC-SA 3.0. Un uso comercial requeriria un corpus con licencia propia o anotaciones propias.
- Sesgo de tarea unica: esta especializado en una sola tarea sobre un unico corpus publico; no debe tratarse como un asistente de proposito general.
- Varianza de inicializacion: se entreno una sola vez con una unica semilla, por lo que las diferencias reportadas confunden la calidad del modelo con la varianza de la inicializacion.
- Contaminacion del benchmark: los corpus de evaluacion son benchmarks publicos de larga trayectoria y es plausible que esten presentes en los datos de pretratamiento del modelo base, lo que infla las puntuaciones absolutas.
- Potencia estadistica limitada: la evaluacion uso 200 instancias reservadas (y los 164 problemas completos en generacion de codigo), de modo que el tamano de efecto detectable esta acotado en torno a diez puntos porcentuales.
- Confusion entre modelo y adaptacion: el ajuste parte de la version base y no de una instruction-tuned, y se hace en 4 bits, de modo que cualquier deficit no puede atribuirse por separado al modelo o a la cuantizacion dentro de este diseno.
- Riesgo de alucinacion: el modelo genera texto de forma causal, de modo que fuera del prompt de clasificacion puede producir texto no fiable; el formato de prompt esperado debe respetarse.
- Idiomas: no hay informacion sobre capacidades multilingues y el entrenamiento es en ingles; el rendimiento fuera del ingles no esta documentado.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusifnuri/Mistral-7B-v0.3_financial_sentiment
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Codigo, configuraciones y harness de evaluacion: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa de benchmarks: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Analisis de coste por peticion: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Tesis citada: Nuri, Yusif. *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*. SRH University Hamburg, 2026.
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas de Amazon Business y no guardan relacion con la ficha.
