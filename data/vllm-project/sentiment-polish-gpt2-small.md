# vllm-project/sentiment-polish-gpt2-small

## Resumen

`sentiment-polish-gpt2-small` es un modelo de clasificación de sentimiento para polaco, obtenido mediante fine-tuning de `sdadas/polish-gpt2-small` sobre el corpus `clarin-pl/polemo2-official`. Lo desarrolla el usuario `nie3e` y esta copia concreta la mantiene la organizacion `vllm-project` como checkpoint de integracion continua para vLLM, con el objetivo de reducir el riesgo de cadena de suministro al no depender de una cuenta personal. El modelo resuelve una tarea acotada: asignar una de cuatro etiquetas (NEUTRAL, NEGATIVE, POSITIVE, AMBIGUOUS) a un fragmento de texto en polaco.

Arquitectonicamente es un transformer decoder-only de tipo GPT-2 con 125.953.536 parametros, reutilizado como cabecera de clasificacion por secuencia (`AutoModelForSequenceClassification`). No es un modelo generativo en la practica: se emplea para inferencia de etiquetas y probabilidades. Su relevancia actual es doble: por un lado, ofrece un clasificador de sentimiento polaco con accuracy declarada del 98,38% en `klej-polemo2-out`; por otro, sirve como caso de prueba reproducible para la ruta `/classify` de vLLM (tarea `classify`), lo que lo convierte en una pieza util para validar despliegues de serving.

El modelo es pequeno (repo de 0,5 GB), con licencia MIT y soporte exclusivo de polaco. Esta pensado para integraciones ligeras de analisis de opiniones, moderacion o enriquecimiento de datos, no para generacion de texto abierta ni para razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 con cabecera de clasificacion de secuencia |
| Parametros totales | 125.953.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el data collator usa `max_length=128`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sdadas/polish-gpt2-small`, un GPT-2 pequeno preentrenado en polaco, y anade una cabeza de clasificacion sobre la representacion de secuencia. La tarea es clasificacion multietiqueta con cuatro clases (NEUTRAL, NEGATIVE, POSITIVE, AMBIGUOUS); en los ejemplos de la model card se aplica `torch.sigmoid` sobre los logits y se presentan probabilidades por clase, lo que sugiere una formulacion multietiqueta mas que softmax puro.

El entrenamiento se realizo fusionando todas las filas de `clarin-pl/polemo2-official`, con split 80%/20% de train/test. Los hiperparametros declarados son: learning rate 2e-05, train batch size 4, eval batch size 4, gradient accumulation de 8 pasos (batch total 32), optimizador Adam con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 10 epocas, precision mixta nativa AMP, semilla 42 y `DataCollatorWithPadding` con `max_length=128` y `pad_to_multiple_of=8`. El entrenamiento se ejecuto en una RTX 3090 durante 2 horas 53 minutos. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; no aplica al ser un clasificador.

## Capacidades

- Clasificacion de sentimiento en polaco en cuatro categorias: NEUTRAL, NEGATIVE, POSITIVE y AMBIGUOUS.
- Salida de probabilidades por clase (util para umbrales y ranking), no solo etiqueta discreta.
- Integracion con `transformers` mediante `AutoModelForSequenceClassification` y `pipeline("sentiment-analysis")`.
- Integracion con vLLM (>= 0.9.2) en modo `task="classify"` y via endpoint OpenAI-compatible `/classify`.
- Procesamiento por secuencia con truncado a 128 tokens en el collator de entrenamiento.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- Monolingue: no se declaran capacidades multilingues.

## Casos de uso

- Analisis de opiniones de clientes en polaco: clasificar resenas de hoteles, restaurantes o productos en positivas, negativas, neutras o ambiguas para alimentar dashboards de satisfaccion; el modelo devuelve probabilidades que permiten priorizar casos dudosos.
- Moderacion de comentarios y foros: detectar automaticamente tono negativo o ambiguo en contenido generado por usuarios en plataformas polacas, con umbral configurable sobre la probabilidad de NEGATIVE.
- Enriquecimiento de datasets: etiquetar grandes volumenes de texto polaco no anotado antes de entrenar otros modelos o de construir indices de busqueda por sentimiento.
- Monitorizacion de marca en redes sociales: procesar menciones en polaco y agregar la distribucion de sentimiento por periodo, producto o campana.
- Validacion de pipelines de serving: al ser un checkpoint mantenido por `vllm-project`, sirve para probar la ruta `/classify` de vLLM, la carga de modelos de clasificacion y la compatibilidad con la API OpenAI-compatible en entornos de CI.
- Filtrado previo en sistemas de atencion al cliente: derivar automaticamente tickets con sentimiento negativo a colas prioritarias, usando la probabilidad de clase como score de urgencia.
- Investigacion en PLN (procesamiento de lenguaje natural polaco): linea base rapida y reproducible para experimentos sobre Polemo2 y KLEJ, con licencia MIT y pesos en safetensors.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Clasificacion de texto | allegro/klej-polemo2-out | Accuracy | 98,38% |

Resultados en el conjunto de evaluacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 0,4659 |
| Accuracy | 0,9627 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; ademas, esos benchmarks no son aplicables a un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 125,9 M de parametros, los pesos en fp32 ocupan aproximadamente 0,5 GB y en fp16 unos 0,25 GB, a lo que se suma el overhead de activaciones y runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el entrenamiento se hizo en una RTX 3090, pero la inferencia cabe en GPUs mucho menores.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050, RTX 4060 y equivalentes; tambien puede ejecutarse en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` (AutoModel y pipeline), vLLM >= 0.9.2 con `task="classify"` y contenedor `vllm/vllm-openai:v0.9.2` exponiendo `/classify`; otros runtimes no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles de forma explicita; por el tamano del modelo y la longitud maxima de 128 tokens, se espera latencia de milisegundos por lote en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sentiment-polish-gpt2-small (este) | 125,9 M | no disponible (collator a 128) | Clasificacion de sentimiento polaco (4 clases) | MIT | HuggingFace, copia en vllm-project |
| sdadas/polish-gpt2-small | no disponible en la informacion | no disponible | Modelo base GPT-2 polaco (generacion) | no disponible en la informacion | HuggingFace |
| nie3e/sentiment-polish-gpt2-small | mismos pesos (commit 0f42779) | no disponible | Clasificacion de sentimiento polaco | MIT | HuggingFace (cuenta personal) |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento cuantitativa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en polaco; no debe usarse con textos en otros idiomas.
- La longitud de contexto efectiva esta acotada por el collator de entrenamiento (`max_length=128`); textos mas largos se truncan y pueden perder informacion relevante.
- La metrica de 98,38% en `klej-polemo2-out` esta declarada por el autor y marcada como no verificada; el accuracy en el conjunto de evaluacion propio fue 0,9627, inferior.
- Riesgo de sesgo: el modelo aprende la distribucion y los sesgos de Polemo2, que proviene de resenas y textos de dominio concreto; puede comportarse peor en generos textuales distintos (legal, tecnico, redes sociales informales).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de calibracion: las probabilidades pueden ser excesivamente confiadas (en los ejemplos se observan valores de 1,0 y 1e-7), lo que exige umbrales cuidadosos en produccion.
- La clase AMBIGUOUS puede absorber casos limite; conviene validar la formulacion multietiqueta (sigmoide) frente a softmax segun el caso de uso.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo base y del dataset Polemo2 para el uso previsto.
- Esta copia es un espejo de CI de `nie3e/sentiment-polish-gpt2-small` en el commit `0f42779`; para trazabilidad conviene fijar la revision concreta.
- No se documentan cuantizaciones oficiales ni resultados de despliegue en CPU a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-project/sentiment-polish-gpt2-small
- Modelo original: https://huggingface.co/nie3e/sentiment-polish-gpt2-small
- Modelo base: https://huggingface.co/sdadas/polish-gpt2-small
- Dataset de entrenamiento: https://huggingface.co/datasets/clarin-pl/polemo2-official
- Dataset de evaluacion KLEJ Polemo2: https://huggingface.co/datasets/allegro/klej-polemo2-out
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Imagen de serving vLLM: https://hub.docker.com/r/vllm/vllm-openai
