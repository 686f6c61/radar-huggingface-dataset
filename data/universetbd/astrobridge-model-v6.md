# UniverseTBD/astrobridge-model-v6

## Resumen

AstroBridge Captioner (identificador `UniverseTBD/astrobridge-model-v6`) es un modelo de generacion de descripciones ("captioning") para astronomia con soporte de multiples modalidades. No es un modelo completo, sino un adaptador LoRA junto con una pila de fusion multimodal entrenada sobre un `Qwen/Qwen3.5-9B` congelado. El modelo base no se distribuye en este repositorio: hay que cargarlo por separado desde su propio identificador y aplicar el adaptador encima.

El modelo resuelve el problema de generar texto descriptivo a partir de entradas heterogeneas de observacion: imagenes astronomicas, espectros y curvas de luz. La model card lo describe como "n-modality", y la evaluacion de groundedness incluida cubre las tres modalidades, lo que sugiere que la pila de fusion trata cada una por separado y admite tambien combinaciones conjuntas (el histograma de entrenamiento registra 4.120 muestras de una sola modalidad y 1.318 conjuntas).

Su relevancia actual es limitada pero especifica: se trata de un adaptador de investigacion publicado sin licencia declarada, sin descargas ni valoraciones en el momento de la consulta y con un pipeline no definido en HuggingFace. Su mayor singularidad tecnica es el mecanismo de evaluacion de groundedness (pruebas de shuffle y ablacion por modalidad), que aporta evidencia de que las descripciones dependen realmente de la senal de entrada y no solo del prior textual del LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de lenguaje `Qwen/Qwen3.5-9B` congelado, mas una pila de fusion multimodal (projectors, modality_identity, qformer, adapter) |
| Parametros totales | No disponible para el adaptador; el modelo base es de 9.000 millones nominales. Tamano del repositorio: 0,3 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada en la model card) |
| Tipos de cuantizacion | No se publican versiones cuantizadas. El entrenamiento se realizo con `quantization: None` y los pesos se distribuyen en el formato original del adaptador |
| Idiomas soportados | No disponible (la model card esta redactada en ingles y no declara cobertura multilingue) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) y `middle.pt` (pila de fusion) |
| Modelo base | Qwen/Qwen3.5-9B (no incluido en el repositorio) |
| Modalidades de entrada | Imagen, espectros y curvas de luz |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. Por un lado, un adaptador LoRA cargado mediante `peft` sobre un `Qwen/Qwen3.5-9B` congelado en `bfloat16`, con `trust_remote_code=True`. Por otro, una pila de fusion que se distribuye aparte en el fichero `middle.pt` y que, segun la model card, contiene projectors, un modulo `modality_identity`, un `qformer` y un adapter. El diseno con Q-Former apunta a un esquema de proyeccion de caracteristicas por modalidad hacia el espacio de embeddings del LLM, con identificadores de modalidad para que el modelo distinga el origen de la senal. Los codificadores concretos de imagen, espectro y curva de luz no se documentan en la informacion disponible.

Los datos de entrenamiento no se detallan: no se indica el numero de tokens, la composicion del corpus ni si hubo fases de RLHF o DPO. Lo unico publicado es `config_hash: bf18d043bdcaa5d5`, `git_sha: a5fa267401ffe7e85cb2c0870f8bc3a642acc18e`, `quantization: None` y un histograma de niveles (`tier_histogram`) con 4.120 muestras de una sola modalidad y 1.318 conjuntas. La innovacion destacable no esta en el entrenamiento sino en la evaluacion: la model card incluye una "groundedness gate" con pruebas de shuffle (permutar la entrada de una modalidad) y de ablacion (eliminarla), comprobando si la descripcion generada cambia. Para reconstruir la pila de fusion hay que usar la clase `FusionStack` del paquete `captioner` (`captioner/model/captioner.py` y `captioner/train/stage1.py`, funcion `run_stage1`), que no forma parte del repositorio de HuggingFace.

## Capacidades

- Generacion de descripciones en lenguaje natural a partir de imagenes astronomicas.
- Generacion de descripciones a partir de espectros.
- Generacion de descripciones a partir de curvas de luz.
- Descripcion conjunta de varias modalidades en una misma muestra (nivel "joint" del entrenamiento).
- Condicionamiento verificable sobre la entrada: las pruebas de ablacion muestran un cambio de descripcion en el 100 % de los casos al eliminar la modalidad, lo que indica dependencia efectiva de la senal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito, vision general, audio: no disponibles.

## Casos de uso

- Generacion automatica de pies de figura en pipelines de observatorio: el modelo puede tomar el cubo de datos (imagen, espectro o curva de luz) y producir una descripcion textual lista para incorporar a informes de reduccion o a bases de datos de observaciones.
- Catalogacion y busqueda semantica en archivos astronomicos: las descripciones generadas pueden indexarse como texto asociado a cada objeto, facilitando consultas por lenguaje natural sobre catalogos que de otro modo solo serian consultables por metadatos numericos.
- Control de calidad de datos mediante la groundedness gate: las pruebas de shuffle y ablacion descritas en la model card pueden replicarse como test de regresion para detectar modelos que "alucinan" descripciones genericas en lugar de leer la entrada.
- Triaje de curvas de luz: con la modalidad de curva de luz, el modelo puede resumir en texto el comportamiento de una serie temporal fotometrica, util como primera capa de revision antes del analisis detallado por personal especializado.
- Analisis conjunto imagen-espectro: el nivel "joint" del entrenamiento (1.318 muestras) permite generar una unica descripcion que integre morfologia y propiedades espectrales del mismo objeto.
- Apoyo a la redaccion cientifica: borradores de secciones descriptivas de articulos o notas de observacion a partir de las figuras y los espectros ya reducidos.
- Divulgacion y educacion: traduccion de productos de datos tecnicos a descripciones legibles por publico no especializado, siempre con revision humana previa a la publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion es la groundedness gate de la model card, que se reproduce a continuacion tal cual:

| Modalidad | Prueba | n | Metrica | Valor | null_result |
|---|---|---|---|---|---|
| Imagen | Shuffle | 68 | Distancia de edicion media | 364,32 | false |
| Imagen | Ablacion | 122 | Fraccion de descripciones modificadas | 1,0 | false |
| Espectros | Shuffle | 15 | Distancia de edicion media | 233,33 | false |
| Espectros | Ablacion | 54 | Fraccion de descripciones modificadas | 1,0 | false |
| Curva de luz | Shuffle | 4 | Distancia de edicion media | 291,50 | false |
| Curva de luz | Ablacion | 24 | Fraccion de descripciones modificadas | 1,0 | false |

El campo `null_result: false` indica que ninguna de las pruebas se comporto como un resultado nulo, es decir, que perturbar o retirar la modalidad altera la salida. El tamano de muestra es muy desigual y especialmente reducido en el caso de curva de luz bajo shuffle (n = 4).

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del tamano del modelo base (9.000 millones de parametros); no las publica el autor.

- Inferencia en `bfloat16`: en torno a 18-20 GB solo para los pesos del base, mas el coste de la cache KV y de la pila de fusion; el adaptador anade aproximadamente 0,3 GB.
- Inferencia en cuantizacion de 8 bits: en torno a 10-12 GB de VRAM.
- Inferencia en cuantizacion de 4 bits: en torno a 6-7 GB de VRAM, lo que permitiria ejecutarlo en GPU de consumo.
- GPU recomendadas: para precision completa, A100 40 GB, H100 80 GB o L40S 48 GB. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) seria suficiente en `bfloat16`; con 4 bits, una RTX 4080 (16 GB) o incluso una RTX 4070 Ti (12 GB) podrian ser suficientes para los pesos, aunque la pila de fusion anade consumo adicional.
- Opciones de despliegue: la unica ruta documentada es `transformers` + `peft` en Python. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y la pila de fusion personalizada (`middle.pt` y la clase `FusionStack`) hace poco probable un despliegue directo en esos servidores sin trabajo de integracion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniverseTBD/astrobridge-model-v6 | Adaptador sobre Qwen3.5-9B; repo de 0,3 GB | No disponible | Imagen, espectros, curva de luz | No disponible | HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen3.5-9B (modelo base) | 9.000 millones nominales | No disponible | Solo texto (segun su propia ficha) | No disponible | HuggingFace |
| Otros captioners astronomicos multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la informacion proporcionada modelos comparables de captioning astronomico multimodal que permitan una comparacion significativa mas alla del propio modelo base.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: aunque las pruebas de groundedness indican dependencia de la entrada, un LLM de 9.000 millones de parametros puede generar afirmaciones plausibles no respaldadas por los datos, especialmente en magnitudes fisicas o identificadores de objetos.
- Sesgos del corpus de entrenamiento: no se documenta la composicion del dataset, por lo que no puede descartarse un sesgo hacia determinados tipos de objeto, rangos de luminosidad o instrumentos.
- Idiomas: no se declara cobertura multilingue; la model card esta en ingles y no hay evidencia de que el modelo genere descripciones en castellano.
- Evidencia estadistica limitada: los tamanos de muestra de la evaluacion son pequenos, con solo 4 casos en la prueba de shuffle de curva de luz, lo que reduce la fiabilidad de esas cifras.
- Dependencia de codigo no publicado: la recarga de `middle.pt` requiere la clase `FusionStack` del paquete `captioner`, que no esta en el repositorio de HuggingFace; sin ese codigo el adaptador por si solo no reproduce el comportamiento descrito.
- El modelo base no se incluye: hay que descargar `Qwen/Qwen3.5-9B` por separado, con su propio consumo de almacenamiento y su propia licencia.
- Ausencia de validacion comunitaria: cero descargas y cero valoraciones en el momento de la consulta; no hay informes independientes de comportamiento en produccion.
- Fechas de publicacion y actualizacion muy proximas entre si (ambas el 2026-09-11), lo que sugiere un artefacto de investigacion en fase temprana y no una version estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UniverseTBD/astrobridge-model-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos correspondian a un servicio de correo electronico ajeno por completo al proyecto (home.abv.bg, mail20.abv.bg, passport.abv.bg, blog.abv.bg, mobile.abv.bg).
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
