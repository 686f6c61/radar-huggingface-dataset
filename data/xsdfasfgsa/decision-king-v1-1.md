# xsdfasfgsa/Decision-King-v1.1

## Resumen

Decision-King-v1.1 es un modelo multimodal de tipo image-text-to-text publicado por el usuario xsdfasfgsa en Hugging Face, inicializado a partir de Qwen/Qwen3.8-27B en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. Su proposito declarado no es la generacion libre de texto, sino la toma de decisiones estructurada: recibe un estado de contexto (`state`) y un conjunto de preguntas tipificadas (`questions`) y devuelve decisiones con probabilidades asociadas. El modelo se presenta bajo los tags `decision-model`, `direct-logits` y `looped-transformer`.

Cuenta con 27.356.728.560 parametros segun los pesos en safetensors, con un repositorio de 54,7 GB, lo que es coherente con pesos en BF16. La model card indica que requiere una GPU CUDA compatible con BF16 y recomienda 80 GB de VRAM. La licencia es Apache 2.0.

La relevancia del modelo reside en su enfoque: en lugar de generar texto autoregresivo convencional, expone una interfaz de decision con tipos de pregunta (`noul`, `choice`, `score`) y devuelve logits/probabilidades directamente, ademas de aceptar registros JSONL de JevBench sin conversion. No obstante, la informacion publicada es escasa y no incluye detalles sobre el dataset de entrenamiento, el proceso de alineacion ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped-transformer), inicializado desde Qwen/Qwen3.8-27B; multimodal image-text-to-text |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo menciona BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card describe el modelo como un `looped-transformer` inicializado desde Qwen/Qwen3.8-27B, con soporte multimodal (pipeline image-text-to-text). El tag `direct-logits` sugiere que la salida se obtiene directamente de los logits del modelo en lugar de mediante generacion de texto libre, y el tag `decision-model` confirma que la tarea objetivo es la clasificacion/decision estructurada. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

Respecto a los datos, la model card indica explicitamente que no se entreno con JevBench y que su split publico se uso para evaluacion y ajuste. El adaptador de inferencia conserva el orden original de etiquetas y nunca pasa el campo `expected` ni metadatos del benchmark al modelo. No se detalla ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Toma de decisiones estructurada a partir de un `state` de contexto y un conjunto de `questions`.
- Tipos de pregunta soportados: `noul` (booleano si/no), `choice` (seleccion entre criterios con etiqueta) y `score` (puntuacion sobre una lista de criterios ordenados).
- Salida con probabilidades (`probs`) por pregunta, ademas de `task_id` en respuestas de tareas en bruto.
- Procesamiento multimodal image-text-to-text (segun el pipeline declarado).
- Aceptacion directa de registros JSONL de JevBench (splits easy, original, hard) sin conversion previa.
- Servidor HTTP opcional con endpoint `/v1/systemone`.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.

## Casos de uso

- Enrutamiento de solicitudes internas: dado un `state` con la descripcion de la peticion, el modelo puede clasificar que equipo la posee mediante preguntas de tipo `choice` con criterios etiquetados (inventario, pagos, instalaciones, etc.), devolviendo la opcion mas probable con su probabilidad.
- Validacion de reglas de negocio: con preguntas de tipo `noul` se pueden evaluar condiciones booleanas sobre el estado (por ejemplo, si las unidades disponibles cubren las solicitadas) sin necesidad de escribir logica ad hoc.
- Puntuacion de severidad o capacidad: con preguntas de tipo `score` y criterios ordenados, el modelo asigna un grado (por ejemplo, nivel de stock restante) util para priorizacion o alertas.
- Evaluacion de benchmarks de decision: el modelo acepta directamente los JSONL de JevBench y produce predicciones en JSONL con `task_id` y `probs`, lo que permite integrarlo en pipelines de evaluacion reproducibles.
- Servicio de decision como API: mediante `inference/serve.py` se expone un endpoint HTTP (`/v1/systemone`) que puede consumirse desde otros servicios backend para decisiones puntuales con contexto estructurado.
- Procesamiento de documentos e imagenes en decisiones: al ser image-text-to-text, puede incorporar informacion visual en el `state` para tareas de clasificacion o decision que requieran inspeccion de imagenes.
- Ajuste fino sobre dominios propios: al estar bajo Apache 2.0 y en formato transformers/safetensors, puede reentrenarse o adaptarse con datos propios de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona JevBench como conjunto de evaluacion (splits easy, original y hard) y que su split publico se uso para evaluacion y ajuste, pero no se aportan cifras de accuracy ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card recomienda 80 GB; con 27.356.728.560 parametros en BF16 los pesos ocupan aproximadamente 54,7 GB, por lo que se necesita margen adicional para activaciones y contexto.
- GPU recomendadas: A100 80 GB, H100 80 GB u otras GPU CUDA compatibles con BF16 con al menos 80 GB de VRAM.
- Compatibilidad con GPU de consumo: no disponible; por el tamano en BF16 no cabe en GPU de consumo de 24 GB sin cuantizacion, y no se documentan formatos cuantizados.
- Opciones de despliegue: el repositorio incluye `inference/infer.py` (inferencia por CLI sobre un fichero de request JSON o JSONL) e `inference/serve.py` (servidor HTTP con endpoint `/v1/systemone`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-King-v1.1 | 27,36 B | no disponible | Decision estructurada, looped-transformer, multimodal | Apache 2.0 | Hugging Face (30 descargas) |
| Qwen/Qwen3.8-27B | no disponible en la informacion | no disponible | Modelo base del que se inicializa | no disponible en la informacion | Hugging Face |
| Alternativas de decision estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria de decision estructurada con logits directos.

## Limitaciones y advertencias

- La informacion publicada es muy escasa: no hay datos sobre dataset de entrenamiento, alineacion, idiomas ni contexto, lo que dificulta evaluar su robustez.
- El modelo esta disenado para decisiones estructuradas con un esquema de request concreto (`state` + `questions`), no para generacion libre de texto; usarlo fuera de ese esquema puede dar resultados no significativos.
- La model card advierte que no se entreno con JevBench y que su split publico se uso para evaluacion y ajuste, lo que puede introducir sesgo de ajuste sobre ese benchmark.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se inicializa desde Qwen/Qwen3.8-27B, cuyas condiciones de licencia no se detallan en la informacion proporcionada; conviene verificar la licencia del modelo base antes de un uso comercial.
- Requiere GPU CUDA con BF16 y ~80 GB de VRAM; no se documentan opciones de cuantizacion para entornos con menos memoria.
- Con solo 30 descargas y 0 likes, el modelo tiene muy poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xsdfasfgsa/Decision-King-v1.1
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
