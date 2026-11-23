# Yashhh999/gradientTrace

## Resumen

gradientTrace es un clasificador binario de texto generado por IA construido sobre el backbone `microsoft/deberta-v3-large`. Lo publica el usuario Yashhh999 en Hugging Face y su tarea es estimar la probabilidad de que un pasaje de hasta 512 tokens haya sido producido por un modelo de lenguaje. El modelo se entrena con pares prompt-texto humano y prompt-texto de modelo, con aumento de datos sobre texto "humanizado" y particiones disjuntas por generador, de modo que la evaluacion fuera de dominio no comparte generadores con el conjunto de entrenamiento.

La relevancia practica esta en el contexto de deteccion de contenido sintetico: con 434 millones de parametros, hereda la arquitectura DeBERTa-v3-large (transformer con attention disentangled y embeddings de posicion relativos) y se distribuye en formato safetensors compatible con `transformers` y con Text Embeddings Inference. El autor reporta metricas casi perfectas en sus propias particiones de validacion y test, incluida una particion fuera de dominio por generador.

Conviene leer esas cifras con cautela: proceden de la model card del autor, no de una evaluacion independiente, y el propio autor advierte que el texto parafraseado o humanizado es el modo de fallo conocido. La licencia y los idiomas soportados no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large (attention disentangled, embeddings de posicion relativos) |
| Parametros totales | 434.013.185 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (pasajes de hasta 512 tokens segun la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | microsoft/deberta-v3-large (finetune) |
| Tamano del repositorio | 96.7 GB |
| Descargas | 560 |
| Fecha de creacion | 2026-10-29 |
| Ultima actualizacion | 2026-11-03 |

## Arquitectura y entrenamiento

El modelo es un finetune de `microsoft/deberta-v3-large`, un encoder transformer de 434 millones de parametros con attention disentangled y representaciones de posicion relativas, adaptado aqui como cabeza de clasificacion binaria. La salida es una puntuacion de probabilidad de texto generado por maquina para secuencias de hasta 512 tokens. El repositorio incluye `config.json`, `eval_report.json` y `data_manifest.json`, que documentan configuracion y composicion de datos.

El entrenamiento se realizo en una Tesla T4 con precision fp16 y batch efectivo de 64. Los datos son pares prompt-texto humano y prompt-texto de modelo, con aumento de datos sobre texto humanizado y particiones disjuntas por generador (`generator-disjoint splits`), lo que permite medir generalizacion a generadores no vistos. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en un clasificador de este tipo).

## Capacidades

- Clasificacion binaria de texto: estima P(texto generado por maquina) para pasajes de hasta 512 tokens.
- Deteccion de texto sintetico con backbone DeBERTa-v3-large afinado sobre pares prompt-respuesta.
- Robustez declarada frente a generadores no vistos en entrenamiento, gracias a las particiones disjuntas por generador.
- Aumento con texto humanizado durante el entrenamiento, orientado a detectar reescrituras de salidas de modelo.
- Integracion con el ecosistema `transformers` (pipeline `text-classification`) y con Text Embeddings Inference.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- No se documentan capacidades de generacion, tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de contenido en plataformas: puntuar publicaciones o comentarios antes de revision humana, usando la salida como senal de priorizacion y no como decision automatica.
- Triaje en entornos educativos: marcar entregas con alta probabilidad de generacion automatica para que un revisor humano las examine, dado que el autor desaconseja usarlo como unica base para decisiones de integridad academica.
- Filtrado de datos para entrenamiento: descartar o marcar muestras sospechosas de ser sinteticas en pipelines de curación de corpus, con umbral ajustable sobre la puntuacion.
- Deteccion de resenas falsas o generadas en masa: clasificar resenas de producto o comentarios de foros en lotes, aprovechando la ventana de 512 tokens para resenas completas.
- Analisis de procedencia en periodismo y verificacion: aportar una senal adicional de evidencia sobre la autoria de un texto, siempre acompanada de otras comprobaciones.
- Monitorizacion de contenido generado en soporte al cliente: detectar respuestas de bot no declaradas en canales donde se exige identificacion humana.
- Investigacion sobre deteccion de texto sintetico: servir como linea base afinada sobre DeBERTa-v3-large para comparar con otros detectores y estudiar el fallo ante texto humanizado.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (evaluacion retenida):

| Particion | n | AUROC | TPR @ 1% FPR |
|---|---|---|---|
| val | 15.216 | 1.0000 | 0.999 |
| test_indomain | 15.181 | 0.9999 | 1.000 |
| test_ood_generators | 16.000 | 1.0000 | 1.000 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de esta tabla. Las cifras proceden del autor y no de una evaluacion independiente; un AUROC de 1.0000 debe interpretarse con escepticismo hasta que terceros reproduzcan la evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1 GB para los 434 millones de parametros, mas overhead de activaciones y tokenizer; en la practica, holgado en cualquier GPU con 4 GB o mas.
- VRAM estimada en fp32: aproximadamente 1,7 GB de pesos, tambien asequible en GPU de consumo.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4090) sirve para inferencia; para alto throughput, A100 o H100 con batching grande. El autor entreno en una Tesla T4 en fp16.
- Cabe en GPU consumer: si, con margen amplio, incluso en GPUs de gama baja.
- Opciones de despliegue: pipeline `text-classification` de `transformers`, Text Embeddings Inference (tag del repositorio), servidores de inferencia compatibles con endpoints. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. El tamano del encoder y la ventana de 512 tokens permiten batching agresivo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gradientTrace | 434 M | 512 tokens | Deteccion binaria de texto IA | no disponible | Hugging Face, safetensors |
| microsoft/deberta-v3-large | 434 M | 512 tokens | Encoder general (base del anterior) | MIT (modelo original) | Hugging Face |
| Detectores tipo RoBERTa-base afinados | ~125 M | 512 tokens | Deteccion de texto IA | variable segun autor | Hugging Face |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: no hay benchmarks publicados de terceros para gradientTrace ni cifras comparables en la informacion proporcionada. Frente a su modelo base, la diferencia es la cabeza de clasificacion y el dataset de deteccion; frente a detectores mas pequenos basados en RoBERTa, el backbone large ofrece mayor capacidad a costa de mas computo.

## Limitaciones y advertencias

- Las metricas casi perfectas son autocertificadas por el autor; no consta replicacion independiente.
- El propio autor senala que el texto parafraseado o humanizado es el modo de fallo conocido: un atacante puede evadir el detector reescribiendo la salida.
- Se producen falsos positivos en escritura humana atipica; la puntuacion es evidencia, no prueba.
- El autor desaconseja explicitamente usar el modelo como unica base para decisiones de integridad academica o moderacion.
- Ventana limitada a 512 tokens: textos mas largos deben trocearse, con posible perdida de senal entre fragmentos.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en produccion.
- Idiomas soportados no declarados; el comportamiento fuera del idioma o idiomas de entrenamiento es incierto.
- No hay variantes cuantizadas publicadas ni pesos GGUF, lo que limita el despliegue en CPU o en entornos sin `transformers`.
- El repositorio ocupa 96,7 GB pese a que los pesos suman 434 millones de parametros, lo que sugiere artefactos adicionales (checkpoints, datos o reportes); conviene revisar el contenido antes de descargarlo completo.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yashhh999/gradientTrace
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Repositorio gradientTrace: no disponible (la model card lo menciona sin enlace)
- Informe de evaluacion (`eval_report.json`) y manifiesto de datos (`data_manifest.json`): incluidos en el repositorio de Hugging Face
- Paper, blog o demo: no disponibles en la informacion proporcionada
