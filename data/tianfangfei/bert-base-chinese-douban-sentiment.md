# tianfangfei/bert-base-chinese-douban-sentiment

## Resumen

`tianfangfei/bert-base-chinese-douban-sentiment` es un clasificador binario de sentimiento (negativo/positivo) para resenas en chino, obtenido mediante fine-tuning de `google-bert/bert-base-chinese` con una nueva cabeza de clasificacion sobre el vector `[CLS]`. Lo publica el usuario `tianfangfei` como material del curso CHI3242, sin que se documente mas contexto academico ni institucional. El modelo resuelve una tarea acotada —clasificar opiniones de Douban en dos clases— y lo hace con una arquitectura estandar y bien conocida, lo que facilita su despliegue y su integracion en pipelines existentes.

Se trata de un BERT base con 102.269.186 parametros en formato safetensors, un repositorio de 0,4 GB y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales documentadas. El contexto maximo no se declara en la informacion disponible, aunque por herencia de `bert-base-chinese` corresponde a 512 tokens. El dato de rendimiento mas relevante es una exactitud de 0,922 sobre 2.000 resenas reservadas (1.000 negativas y 1.000 positivas), reportada por el autor.

Su relevancia actual es limitada pero practica: no compite en capacidades generativas ni en razonamiento, sino que ofrece un clasificador ligero, rapido y economico para analisis de sentimiento en chino, un idioma con menos recursos que el ingles en modelos especializados. Es util como componente de senal en sistemas mayores (enrutado, moderacion, analitica de opiniones) mas que como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), con cabeza de clasificacion sobre `[CLS]` |
| Parametros totales | 102.269.186 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; por herencia de `bert-base-chinese`, 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion dinamica estandar de PyTorch, no documentada por el autor) |
| Idiomas soportados | chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT base, con 12 capas, atencion bidireccional y el vector `[CLS]` como representacion agregada de la secuencia. Sobre ese vector se anade una cabeza de clasificacion nueva para producir la decision binaria negativo/positivo. No hay innovaciones tecnicas destacables: es un fine-tuning convencional de clasificacion, sin decodificacion especulativa, atencion lineal ni mecanismos hibridos.

El entrenamiento se realizo con resenas de Douban procedentes del repositorio `qhchina-data`, mapeando 1 estrella a negativo y 5 estrellas a positivo. Se usaron 5.000 resenas negativas y 5.000 positivas, con 1 sola epoca y una tasa de aprendizaje de 2e-5. La evaluacion se hizo sobre 1.000 resenas retenidas por clase (2.000 en total), con una exactitud reportada de 0,922. No se documentan detalles sobre la composicion exacta del corpus, el preprocesado, la semilla, el tamano de batch ni si hubo validacion cruzada o seleccion de hiperparametros; tampoco se menciona RLHF ni DPO, algo esperable en un modelo discriminativo de este tipo.

## Capacidades

- Clasificacion binaria de sentimiento en chino: devuelve una etiqueta negativo o positivo para una resena o fragmento de texto.
- Analisis de opiniones a nivel de documento o de fragmento corto, siempre que quepa en la ventana de 512 tokens.
- Inferencia rapida y de bajo coste: al ser un encoder de 102 millones de parametros, el coste por peticion es muy inferior al de un modelo generativo.
- Integracion sencilla en pipelines de `transformers` mediante `pipeline("text-classification")`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generacion de texto, codigo, matematicas ni vision.
- Capacidad multilingue limitada al chino; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Analitica de opiniones de productos y contenido: procesar lotes de resenas de plataformas tipo Douban para calcular la proporcion de sentimiento positivo y negativo por titulo, categoria o periodo, usando un modelo de 102 millones de parametros que puede ejecutarse en CPU a gran escala.
- Moderacion y triaje de comentarios: clasificar comentarios de usuarios en chino como negativos o positivos para enrutar los negativos a revision humana, aprovechando la baja latencia del encoder.
- Senal auxiliar en sistemas de recomendacion: incorporar la polaridad de las resenas como feature en un ranking o en un modelo de scoring, ya que la salida es una probabilidad binaria facil de integrar.
- Monitorizacion de reputacion de marca: ingerir menciones y resenas en chino a intervalos regulares y agregar la polaridad para detectar caidas de sentimiento, con un coste de inferencia marginal.
- Etiquetado automatico de datos para otros modelos: usar el clasificador como anotador debil sobre grandes volumenes de texto chino y reservar la revision humana para los casos de baja confianza.
- Investigacion academica y docencia: servir como linea base reproducible de clasificacion de sentimiento en chino para comparar con modelos mas grandes o con enfoques de few-shot, dado que el autor documenta datos, hiperparametros y exactitud de test.
- Filtrado previo en pipelines de extraccion de opiniones: descartar o priorizar resenas segun polaridad antes de pasarlas a un modelo generativo mas caro, reduciendo el coste total del sistema.

## Benchmarks y rendimiento

| Benchmark | Resultado | Conjunto de evaluacion |
|---|---|---|
| Exactitud (accuracy) | 0,922 | 1.000 resenas negativas + 1.000 positivas retenidas (Douban) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, CLUE, etc.) en la informacion disponible. El unico dato numerico es la exactitud interna reportada por el autor sobre su propio conjunto de test, sin comparacion con otras lineas base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos, mas activaciones; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16: alrededor de 0,2 GB de pesos, con margen amplio para batch y activaciones.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o T4; para desarrollo, RTX 3060, RTX 4090 o superiores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` con PyTorch, TorchScript, ONNX Runtime, Hugging Face TGI, vLLM (soporte de modelos encoder limitado, conviene verificar), y exportacion a llama.cpp no aplica por ser un encoder de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tianfangfei/bert-base-chinese-douban-sentiment` | 102.269.186 | 512 tokens (por herencia) | Clasificacion de sentimiento binaria en chino | Apache 2.0 | Hugging Face |
| `google-bert/bert-base-chinese` | ~102 M | 512 tokens | Modelo base en chino, sin cabeza de clasificacion | Apache 2.0 | Hugging Face |
| `uer/roberta-base-finetuned-dianping-chinese` | ~102 M | 512 tokens | Clasificacion de sentimiento en chino (referencia de la comunidad) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparacion se limita a parametros, contexto, tarea y licencia.

## Limitaciones y advertencias

- Entrenado con solo 5.000 resenas por clase y 1 epoca: la cobertura de dominios, registros y vocabulario es limitada, y el modelo puede degradarse fuera del estilo de resenas de Douban.
- El mapeo 1 estrella = negativo y 5 estrellas = positivo descarta las resenas de 2, 3 y 4 estrellas, lo que sesga el entrenamiento hacia opiniones extremas y puede producir decisiones poco calibradas en opiniones moderadas.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de sobreconfianza: la salida es una probabilidad de clase que puede no reflejar la incertidumbre real, especialmente en textos fuera de dominio.
- Sesgos conocidos: no se documenta ningun analisis de sesgo por genero, region o tematica; al proceder de una unica plataforma, puede heredar sesgos de su comunidad de usuarios.
- Limitacion de contexto: textos superiores a 512 tokens se truncan; resenas largas pueden perder informacion relevante para la clasificacion.
- Limitacion de idioma: solo chino; no se garantiza ningun rendimiento en otros idiomas ni en chino clasico o variantes dialectales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia y los terminos del dataset `qhchina-data` antes de un uso comercial a gran escala.
- El modelo se publica como material de curso y con 0 descargas en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento posterior.
- Para produccion, se recomienda validar la exactitud en el dominio concreto de despliegue y considerar un umbral de confianza para derivar casos dudosos a revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tianfangfei/bert-base-chinese-douban-sentiment
- Modelo base: https://huggingface.co/bert-base-chinese
- Repositorio de datos citado: https://github.com/mcjkurz/qhchina-data
- Paper de BERT: https://arxiv.org/abs/1810.04805
