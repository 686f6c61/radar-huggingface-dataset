# WorldEdit0/spatiallogic-qwen3.5-9b-cot

## Resumen

SpatialLogic Qwen3.5-9B CoT es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario WorldEdit0 y publicado en Hugging Face bajo licencia Apache 2.0. El modelo se distribuye como un repositorio de pesos de aproximadamente 320,5 GB con 9.409.813.744 parametros en formato safetensors y esta etiquetado para la tarea image-text-to-text, lo que indica que conserva la torre de vision del modelo base y esta orientado a tareas de razonamiento espacial con cadena de pensamiento (CoT).

La relevancia de esta publicacion es limitada pero singular: se trata de un archivo de pesos de un entrenamiento en curso, no de un modelo terminado y validado. La model card describe la infraestructura de entrenamiento (8 nodos y 64 GPUs, BF16 de parametros completos, ZeRO-2, batch global de 512, longitud maxima de 4096 tokens) y una politica de checkpoints, pero no documenta resultados de evaluacion ni capacidades verificadas del modelo ajustado.

El repositorio incluye una carpeta `0step-test/` que contiene los pesos oficiales sin modificar de Qwen3.5-9B en la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, es decir, un test de conectividad y no un modelo entrenado. Cualquier evaluacion practica debe hacerse con cautela: el autor no confirma que exista un snapshot entrenado subido y verificado en el momento de la consulta, y el modelo base Qwen3.5-9B no aparece documentado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) heredada de Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens en entrenamiento (max_length); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de aproximadamente 9,4 mil millones de parametros que procesa entradas de imagen y texto. El ajuste realizado es un SFT de parametros completos en BF16 sobre 8 nodos y 64 GPUs, con batch por GPU de 8, acumulacion de gradiente de 1 y batch global de 512. Se emplea ZeRO-2 con `overlap_comm=false`, gradient checkpointing, AdamW con learning rate 2e-5, 1000 ventanas de warmup y learning rate constante despues. La longitud maxima de entrenamiento es de 4096 tokens, con `min_pixels=4096` y `max_pixels=262144` para las imagenes.

El dataset fijado (revision `82e5aae49f61799e5aff317e7548ad8395b648bc`) contiene 27.543.089 filas y 53.795 ventanas globales por epoca, tras eliminar 40.253 filas duplicadas de entrada/salida y 85 filas con imagenes no disponibles. Se descartan 49 filas finales por epoca en lugar de rellenar con muestras repetidas. La validacion usa videos y episodios disjuntos del entrenamiento, incluidos identificadores de agibot compartidos entre fuentes cortas, largas y leap, con una muestra fija de 1.792 filas evaluada cada 200 ventanas. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de pares imagen-texto, segun el pipeline declarado image-text-to-text.
- Razonamiento con cadena de pensamiento (CoT), indicado por el sufijo `-cot` del nombre del modelo.
- Procesamiento de imagenes con resolucion controlada entre 4096 y 262144 pixeles.
- Entrenamiento orientado a logica espacial (`spatiallogic`), presumiblemente sobre tareas de comprension de escenas, relaciones espaciales y navegacion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio o thinking mode explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento espacial sobre imagenes: el modelo puede recibir una fotografia o captura y responder preguntas sobre posiciones relativas, distancias y relaciones entre objetos, aprovechando el ajuste especifico en `spatiallogic` y la ventana de 4096 tokens para incluir contexto textual adicional.
- Analisis de video episodico: dado que el dataset de validacion incluye videos y episodios de agibot, el modelo esta orientado a tareas de comprension de secuencias visuales cortas, como describir acciones o inferir trayectorias.
- Asistentes de robotica y navegacion: la combinacion de entrada visual y razonamiento CoT encaja en pipelines donde un agente debe interpretar una escena y generar una secuencia de pasos, aunque la integracion con tool calling no esta documentada.
- Anotacion asistida de datasets espaciales: el modelo puede generar descripciones y etiquetas de relaciones espaciales para preanotar imagenes, reduciendo el coste de revision manual en proyectos de vision.
- Investigacion en SFT multimodal: el repositorio documenta de forma detallada la configuracion de entrenamiento, la politica de checkpoints y la deduplicacion del dataset, lo que lo convierte en una referencia util para reproducir experimentos de ajuste fino a gran escala.
- Evaluacion de cadenas de pensamiento en tareas visuales: investigadores pueden comparar las respuestas CoT del modelo ajustado frente al modelo base Qwen3.5-9B en tareas de logica espacial, siempre que exista un checkpoint entrenado verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de razonamiento espacial, y la evaluacion interna descrita (muestra fija de 1.792 filas cada 200 ventanas) no presenta valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para pesos (9,41 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM estimada en FP8: alrededor de 9,4 GB para pesos, con overhead adicional; no se publican pesos cuantizados oficiales.
- GPU recomendadas para BF16: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB para lotes pequenos.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) o RTX 3090 (24 GB) con precision BF16 y lotes reducidos; en GPUs de 16 GB requeriria cuantizacion, no publicada oficialmente.
- Opciones de despliegue: transformers (libreria declarada), ademas de vLLM, TGI o llama.cpp si se generan pesos GGUF a partir de los safetensors; no se confirman conversiones oficiales.
- Latencia y throughput: no disponibles. El repositorio de 320,5 GB incluye multiples checkpoints y assets, lo que no refleja el tamano de un unico conjunto de pesos para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpatialLogic Qwen3.5-9B CoT | 9,41 B | 4096 en entrenamiento | Imagen-texto | Apache 2.0 | Pesos safetensors; snapshot entrenado no confirmado |
| Qwen/Qwen3.5-9B (base) | 9,41 B | no disponible | Imagen-texto | no disponible en la informacion | Referencia del autor; revision fijada |
| Alternativas de 9-10 B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio contiene principalmente un test de conectividad (`0step-test/`) con los pesos originales sin entrenar; no se confirma la existencia de un snapshot entrenado verificado en el momento de la consulta.
- No hay benchmarks publicados, por lo que no puede acreditarse ninguna mejora frente al modelo base Qwen3.5-9B.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni comportamiento en dominios fuera de la logica espacial.
- El contexto de entrenamiento esta limitado a 4096 tokens; entradas mas largas pueden degradar el rendimiento.
- Los idiomas soportados no se declaran; se desconoce el comportamiento en castellano y en otros idiomas distintos del ingles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado para confirmar que su licencia es compatible.
- El repositorio ocupa 320,5 GB e incluye checkpoints intermedios; el almacenamiento y la descarga son costosos y no equivalen a un unico artefacto de inferencia.
- El entrenamiento se describe como continuo y sin fecha de finalizacion, por lo que los pesos pueden cambiar y las evaluaciones previas quedar obsoletas.
- No se especifican tecnicas de alineacion (RLHF/DPO) ni filtros de seguridad, lo que aumenta el riesgo de respuestas inapropiadas en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/WorldEdit0/spatiallogic-qwen3.5-9b-cot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision del modelo base citada: `c202236235762e1c871ad0ccb60c8ee5ba337b9a`
- Revision del dataset citada: `82e5aae49f61799e5aff317e7548ad8395b648bc`
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
