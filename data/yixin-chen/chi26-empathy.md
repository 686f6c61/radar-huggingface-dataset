# yixin-chen/chi26-empathy

## Resumen

`yixin-chen/chi26-empathy` es un conjunto de clasificadores de empatia publicados junto al articulo "Empathy Practices in Social Media Discourse: A Multidimensional and Relational Perspective" (CHI 2026), firmado por Yixin Chen, Bernie Hogan y Scott A. Hale. No es un modelo generativo de proposito general, sino una coleccion de 12 adaptadores fine-tuneados sobre `unsloth/Phi-3-medium-4k-instruct-bnb-4bit`, cada uno entrenado para detectar una practica de empatia concreta en publicaciones y respuestas de redes sociales.

El modelo base es Phi-3-medium-4k-instruct, un transformer denso de Microsoft con 14.000 millones de parametros y una ventana de contexto de 4096 tokens. El repositorio ocupa 2,1 GB y contiene exclusivamente pesos en formato safetensors (adaptadores), sin pipeline declarado, sin licencia explicita y sin idiomas declarados en la model card.

Su relevancia es acotada pero clara: ofrece una taxonomia operacionalizada de 12 practicas de empatia (solicitud de consejo, revelacion personal, resonancia emocional, validacion, reafirmacion, interes por profundizar, consejo personalizado, etc.) utilizable en investigacion computacional social y en analisis de discurso a escala. Para desarrolladores que buscan un LLM de proposito general, este repositorio no es la eleccion; para equipos de NLP social que necesiten etiquetar empatia en corpus de redes sociales, es una referencia metodologica concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Phi-3-medium-4k-instruct) con adaptadores fine-tuneados por tarea |
| Parametros totales | 14.000 millones (modelo base Phi-3-medium); tamano de los adaptadores no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio; el base de referencia es bnb-4bit |
| Idiomas soportados | no disponible en la model card (el modelo base soporta principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,1 GB |
| Numero de adaptadores | 12 (uno por tarea de clasificacion) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

Cada uno de los 12 directorios del repositorio contiene un adaptador fine-tuneado sobre `unsloth/Phi-3-medium-4k-instruct-bnb-4bit`, una version cuantizada a 4 bits del Phi-3-medium de Microsoft preparada con la libreria Unsloth. El modelo base es un transformer decoder-only denso de 14.000 millones de parametros con contexto de 4096 tokens, entrenado originalmente por Microsoft con datos publicos y ajustado por instrucciones.

El entrenamiento de los adaptadores se describe en el articulo CHI 2026 asociado, que define y operacionaliza cada una de las 12 practicas de empatia. La model card no detalla el numero de ejemplos de entrenamiento, la composicion del dataset, la plataforma de origen de los posts ni si se aplicaron tecnicas de RLHF, DPO o regularizacion especifica. Tampoco se especifica el rango de los adaptadores (LoRA, QLoRA u otro). Toda esa informacion debe consultarse en el paper.

## Capacidades

- Clasificacion binaria (o multiclase, segun la tarea) de practicas de empatia en posts y respuestas de redes sociales.
- Deteccion de practicas de solicitud: pedir consejo u opiniones, buscar experiencias o sentimientos similares, buscar calibracion de circunstancias.
- Deteccion de practicas de revelacion: compartir informacion personal, compartir emociones.
- Deteccion de resonancia emocional: expresar resonancia emocional, recordar sentimientos o emociones similares.
- Deteccion de validacion: expresar validacion, compartir experiencias similares.
- Deteccion de reafirmacion: ofrecer tranquilidad, animo o buenos deseos, expresar interes por una elaboracion adicional, ofrecer consejo personalizado.
- Capacidad generativa subyacente del modelo base Phi-3-medium (no es el proposito del repositorio).
- Soporte de tool calling y function calling: no documentado para estos adaptadores.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Analisis de discurso empatico a escala en redes sociales: procesar corpus de posts y respuestas y etiquetar cada mensaje con las 12 practicas de empatia, permitiendo estudios cuantitativos sobre como se manifiesta el apoyo emocional en comunidades online.
- Moderacion y salud comunitaria: identificar respuestas que ofrecen validacion, reafirmacion o consejo personalizado, para destacar interacciones de apoyo y priorizar su visibilidad frente a contenido toxico.
- Investigacion en HCI y psicologia social: replicar o extender el marco del paper CHI 2026 en nuevos dominios (foros de salud, comunidades de apoyo, plataformas de mensajeria) con una taxonomia ya operacionalizada.
- Entrenamiento de sistemas de respuesta empatica: usar las etiquetas como senal de supervision para ajustar modelos conversacionales que respondan con la practica de empatia adecuada al contexto (por ejemplo, validar antes de aconsejar).
- Monitorizacion de comunidades de soporte: medir la proporcion de respuestas que buscan experiencias similares frente a las que ofrecen consejo personalizado, para evaluar la calidad del apoyo percibido en un foro.
- Investigacion comparativa entre plataformas: aplicar los mismos 12 clasificadores a datos de distintas redes (X, Reddit, foros especializados) para comparar culturas de empatia.
- Anotacion asistida en estudios cualitativos: preetiquetar grandes volumenes de texto y reducir el coste de la codificacion manual por parte de anotadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo CHI 2026 para la evaluacion de los clasificadores; no se incluyen metricas (F1, precision, recall, accuracy) en el repositorio ni en los metadatos consultados.

## Requisitos de hardware

- El repositorio contiene adaptadores (2,1 GB en total), no pesos completos; para inferencia hay que cargar el modelo base Phi-3-medium (14.000 millones de parametros).
- VRAM estimada para el modelo base en bf16: aproximadamente 28 GB, mas overhead de activaciones y KV cache.
- VRAM estimada con el base cuantizado a 4 bits (el referenciado en el repositorio): aproximadamente 8-10 GB, suficiente para GPUs consumer de gama alta.
- GPUs recomendadas: A100 40/80 GB o H100 para bf16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizacion 4 bits; GPUs con 8-12 GB pueden ser insuficientes segun la longitud de secuencia.
- Despliegue: al ser adaptadores sobre un modelo de la familia Phi-3, es compatible con `transformers` + PEFT, y con servidores de inferencia que soporten Phi-3 (vLLM, TGI). llama.cpp y Ollama requeririan conversion previa a GGUF de los pesos fusionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yixin-chen/chi26-empathy` | 14.000 M (base) | 4096 | Clasificacion de 12 practicas de empatia | no disponible | Hugging Face (adaptadores) |
| `microsoft/Phi-3-medium-4k-instruct` | 14.000 M | 4096 | Instrucciones generales | MIT | Hugging Face |
| `microsoft/Phi-3-mini-4k-instruct` | 3.800 M | 4096 | Instrucciones generales | MIT | Hugging Face |
| Clasificadores de emocion tipo GoEmotions (BERT/RoBERTa) | 110-355 M | 512 | Clasificacion de emociones | Apache 2.0 / MIT | Hugging Face |

La comparativa directa con otros clasificadores de empatia no esta disponible en la informacion proporcionada. Frente a clasificadores BERT pequenos, este repositorio ofrece mayor capacidad de razonamiento por el modelo base, a cambio de un coste de inferencia muy superior y de una licencia no declarada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el paper antes de usar en produccion.
- El modelo base Phi-3-medium-4k-instruct tiene licencia MIT, pero los adaptadores derivados no heredan automaticamente esa licencia si el autor no la declara.
- Entrenado sobre datos de redes sociales: probable sesgo hacia el dominio y la plataforma de origen (idioma, jerga, formato de post), con degradacion fuera de ese dominio.
- Riesgo de alucinacion y falsos positivos en clasificacion: al ser un LLM ajustado como clasificador, puede producir etiquetas inconsistentes en textos ambiguos o muy cortos.
- Contexto limitado a 4096 tokens: posts o hilos largos deben truncarse o segmentarse.
- Idiomas soportados no declarados; el modelo base esta optimizado para ingles, por lo que el rendimiento en castellano es incierto.
- Solo 2 likes y 0 descargas en el momento de la consulta: sin validacion externa por parte de la comunidad.
- No hay pipeline declarado ni ejemplos de uso en la model card; la integracion requiere revisar el paper y la estructura de directorios.
- La fecha de creacion (2026-09-13) y la referencia al congreso CHI 2026 indican que es un artefacto de publicacion academica, no un modelo mantenido como producto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yixin-chen/chi26-empathy
- Paper (ACM DL): https://dl.acm.org/doi/full/10.1145/3772318.3790967
- Modelo base: https://huggingface.co/unsloth/Phi-3-medium-4k-instruct-bnb-4bit
- Phi-3-medium-4k-instruct (Microsoft): https://huggingface.co/microsoft/Phi-3-medium-4k-instruct
