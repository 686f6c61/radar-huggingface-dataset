# vennyvirtuoso/modernjev-8k

## Resumen

modernjev-8k es un clasificador de intenciones (intent classification) para el dominio bancario y de atencion al cliente, desarrollado por el usuario vennyvirtuoso y publicado en Hugging Face. Se trata de un fine-tuning de `answerdotai/ModernBERT-base`, un encoder bidireccional de 149 millones de parametros con una longitud de contexto nativa de 8.192 tokens, adaptado para resolver la tarea de clasificacion de consultas de clientes en 77 categorias de intencion del dataset PolyAI Banking77.

El modelo aborda un problema concreto en produccion: enrutar automaticamente peticiones de clientes hacia el flujo de soporte o la herramienta adecuada sin generar texto libre, lo que reduce la latencia y el coste frente a un modelo generativo. El autor reporta una mejora sustancial frente al checkpoint base sin adaptar, con una precision macro en el conjunto de test de retencion del 63,90 % frente al 28,60 % del baseline zero-shot, y una precision del 94,20 % en la tarea especifica Banking77 (frente al 26,60 % del baseline).

La relevancia actual del modelo radica en su combinacion de licencia permisiva Apache 2.0, tamano contenido (149 M de parametros, repositorio de 0,6 GB) y contexto largo de 8.192 tokens, que lo hacen desplegable en infraestructura modesta y adecuado para pipelines de enrutamiento de alta frecuencia. No obstante, la model card contiene afirmaciones de rendimiento que no estan respaldadas por artefactos publicos verificables (no se enlazan pesos de evaluacion, scripts ni particiones de datos), por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) con FlashAttention-2 |
| Parametros totales | 149.617.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (nativa) |
| Tipos de cuantizacion | no disponible (la model card menciona entrenamiento en bfloat16/fp16, no cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer bidireccional que moderniza la familia BERT clasica con soporte nativo de contexto largo (8.192 tokens) y atencion FlashAttention-2. Sobre esta base se aplica un cabezal de clasificacion para 77 clases de intencion bancaria. El entrenamiento se realizo con precision mixta (bfloat16/fp16) y el autor declara el uso de `transformers`, `sentence-transformers`, `peft` y `accelerate` como dependencias de inferencia.

Segun la model card, los datos de entrenamiento combinan `ZefanCai/Open-Jev-v1.1`, `google/boolq` y `PolyAI/banking77`. El autor afirma que la evaluacion se realizo sobre particiones de test con separacion por grupos (group-disjoint) para evitar fuga de datos, pero no se publican los scripts de particionado, las semillas ni los artefactos de evaluacion. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador discriminativo). Tampoco se detalla la estrategia de congelacion de capas ni los hiperparametros de fine-tuning.

## Capacidades

- Clasificacion de texto en 77 clases de intencion bancaria (transferencias, tarjetas, cargos, ATM, etc.).
- Procesamiento de consultas de hasta 8.192 tokens, lo que permite clasificar conversaciones multi-turno o tickets largos en una sola pasada.
- Inferencia de baja latencia: el autor reporta 494 decisiones/segundo en GPU con batching y 14,74 ms por decision con batch de tamano 1.
- Integracion con el pipeline `text-classification` de Hugging Face `transformers` y con `sentence-transformers` y `peft`.
- Capacidad de enrutamiento de subtareas en agentes autonomos sin generacion de tokens, segun la model card.
- No soporta tool calling, function calling, generacion de texto, vision, audio ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.
- Capacidades multilingues: no documentadas. La model card solo muestra ejemplos en ingles.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo clasifica cada consulta entrante en una de las 77 intenciones y la dirige al equipo o flujo correspondiente, con una latencia de 14,74 ms por decision que permite procesar en tiempo real.
- Triaje de correos y mensajes de atencion al cliente: con 8.192 tokens de contexto, puede clasificar hilos de correo completos o conversaciones de chat sin truncar, reduciendo errores en casos con historial largo.
- Seleccion de herramienta en agentes autonomos: el autor propone su uso como clasificador de subtareas para decidir que tool invocar, evitando el coste de generar texto con un modelo grande.
- Deteccion de intencion en asistentes de voz bancarios: la baja latencia con batch=1 (14,74 ms) lo hace viable para respuesta conversacional en tiempo real, siempre que el ASR entregue la transcripcion.
- Analitica de motivos de contacto: clasificacion masiva por lotes (494 decisiones/s en GPU) para agregar y analizar los motivos por los que los clientes contactan, alimentando dashboards de producto.
- Filtrado y priorizacion en bandejas de entrada: clasificar automaticamente consultas por intencion para priorizar las de mayor urgencia (por ejemplo, `card_swallowed` o `transfer_fee_charged`) antes de la revision humana.
- Preetiquetado para anotacion humana: usar el modelo para generar etiquetas iniciales sobre nuevos tickets y reducir el coste de anotacion, con revision posterior.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor. No se han publicado artefactos de evaluacion verificables (scripts, particiones, predicciones) que permitan reproducirlos.

| Metrica | Fine-tuned | Baseline zero-shot | Ganancia |
|---|---|---|---|
| Precision macro (held-out) | 63,90 % | 28,60 % | +35,30 pp |
| Macro-F1 (held-out) | 0,6183 | 0,1698 | +0,4485 |
| ECE (calibracion) | 0,0221 | 0,2194 | -0,1973 |
| Cross-entropy (decision loss) | 0,8350 | 1,5888 | -0,7538 |
| Banking77 customer intent | 94,20 % | 26,60 % | +67,60 pp |
| Jev Noul boolean gating | 75,20 % | 41,50 % | +33,70 pp |
| Openjev choice | 22,30 % | 17,70 % | +4,60 pp |

| Metrica de eficiencia | Valor |
|---|---|
| Throughput en GPU (batching) | 494,0 decisiones/s |
| Latencia por decision (batch=1) | 14,74 ms |

Observacion: la diferencia entre la precision macro general (63,90 %) y la de Banking77 (94,20 %) sugiere que el rendimiento agregado esta dominado por tareas auxiliares (Openjev choice, boolean gating) con resultados mucho mas bajos. La cifra de 95,40 % que aparece en el banner de la model card no coincide con ninguna metrica de la tabla de evaluacion y no esta respaldada por los datos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,3 GB para los pesos (149 M de parametros) mas overhead de activaciones y batching; en la practica, menos de 1 GB para batch pequeno.
- VRAM estimada en cuantizacion int8: alrededor de 0,15 GB para pesos; en int4, alrededor de 0,08 GB. No se publican checkpoints cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Para throughput alto, A100, H100 o L4; para desarrollo, RTX 4090, RTX 3090 o incluso GPUs de gama media.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para batch pequeno, aunque con mayor latencia.
- Opciones de despliegue: `transformers` pipeline, `sentence-transformers`, `peft` y `accelerate`. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI, aunque al ser un encoder estandar de `transformers` deberia poder servirse con TGI o con un servidor FastAPI propio.
- Latencia y throughput: 14,74 ms por decision con batch=1 y 494 decisiones/s con batching en GPU, segun el autor. No se especifica la GPU utilizada para estas mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modernjev-8k | 149 M | 8.192 | Clasificacion de intencion bancaria (77 clases) | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | 149 M | 8.192 | Encoder base, sin cabezal de clasificacion | Apache 2.0 | Hugging Face |
| BERT-base (google-bert/bert-base-uncased) | 110 M | 512 | Encoder base, sin cabezal de clasificacion | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125 M | 512 | Encoder base, sin cabezal de clasificacion | MIT | Hugging Face |

No se dispone de comparativas publicadas frente a otros clasificadores especificos de Banking77 (por ejemplo, fine-tunings de BERT o DeBERTa sobre el mismo dataset) en la informacion proporcionada. La ventaja estructural de modernjev-8k frente a BERT-base y RoBERTa-base es el contexto de 8.192 tokens frente a 512, y la de ModernBERT-base es que ya incorpora un cabezal entrenado para la tarea.

## Limitaciones y advertencias

- Las metricas de la model card no son verificables: no se publican scripts de evaluacion, particiones de datos ni predicciones. La cifra de 95,40 % del banner no coincide con la tabla de resultados (63,90 % de precision macro), lo que genera dudas sobre la consistencia del reporte.
- El modelo solo clasifica en 77 intenciones predefinidas de Banking77; cualquier consulta fuera de ese conjunto se asignara a una clase incorrecta sin senal de rechazo explicita.
- No es un modelo generativo: no puede redactar respuestas, hacer tool calling ni razonar multi-paso. Su uso esta limitado al enrutamiento y la clasificacion.
- Idiomas no documentados: los ejemplos son en ingles y no se especifica si el modelo funciona en castellano u otros idiomas. Para produccion multilingue seria necesario evaluarlo antes.
- Riesgo de sobreajuste al dominio bancario y a la distribucion de Banking77; el rendimiento en otros dominios (seguros, telecomunicaciones) es desconocido.
- La calibracion reportada (ECE 0,0221) es buena segun el autor, pero no verificable; en produccion conviene monitorizar la distribucion de confianzas.
- Licencia Apache 2.0 permisiva para uso comercial, pero el modelo base ModernBERT y los datasets de entrenamiento (Banking77, BoolQ, Open-Jev) tienen sus propias condiciones que deben revisarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- No se documenta el proceso de limpieza de datos ni posibles sesgos en el dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/modernjev-8k
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de entrenamiento principal: https://huggingface.co/datasets/ZefanCai/Open-Jev-v1.1
- Dataset Banking77 (PolyAI): https://huggingface.co/datasets/PolyAI/banking77
- Dataset BoolQ: https://huggingface.co/datasets/google/boolq
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
