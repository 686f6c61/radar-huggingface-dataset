# XINLI1997/DN-MOPD-Qwen3.5-4B-baseline-label

## Resumen

DN-MOPD-Qwen3.5-4B-baseline-label es un ajuste fino del modelo Qwen/Qwen3.5-4B (4.539.265.536 parametros, ~4,54 mil millones) publicado por el usuario XINLI1997 (Li Xin, repositorio GitHub LiXin97/DN-MOPD). No es un modelo de proposito general nuevo, sino la variante de referencia ("Label baseline") del articulo *Beyond Teacher Assignment: Domain-Normalized Multi-Teacher On-Policy Distillation* (arXiv:2609.35347). Se distribuye con licencia Apache-2.0, en formato safetensors y bfloat16, y su relevancia es metodologica: sirve como punto de comparacion reproducible frente al metodo propuesto en el mismo articulo.

El modelo se ha entrenado mediante destilacion on-policy multi-profesor (MOPD) con enrutado por etiqueta de dominio: cada prompt se puntua con el log-probabilidad del profesor experto de su dominio, con todos los multiplicadores de dominio fijados a 1. Los profesores son tres modelos del mismo tamano (matematicas, codigo e instrucciones) y el entrenamiento consistio en 80 actualizaciones sobre el modelo base, con 2.700 prompts de entrenamiento. Hereda de Qwen3.5-4B la arquitectura `Qwen3_5ForConditionalGeneration`, incluido el codificador de vision, aunque el entrenamiento y la evaluacion se realizaron solo con texto.

Para un desarrollador, lo importante es entender que se trata de un checkpoint de investigacion con muy poca traccion (9 descargas, 0 likes en el momento de la consulta) y con una limitacion declarada por el propio autor: en el articulo no supera al mejor estudiante de un solo profesor. Su interes practico esta en reproducir experimentos de destilacion y en comparar recetas, no en desplegarlo como sustituto de un modelo generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal heredado del base, con vision encoder y prediccion multi-token, MTP); ajuste fino denso |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | no aplica (el modelo no se documenta como MoE) |
| Longitud de contexto | el ejemplo de vLLM de la model card configura `max_model_len=32768`; la longitud de contexto oficial del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos bfloat16 en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | en (ingles), segun el campo `language` de la model card |
| Licencia | Apache-2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors en formato Hugging Face, bfloat16; exportados desde el checkpoint FSDP de entrenamiento |
| Tamano del repositorio | 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B (relacion: finetune) |
| Formato de chat | no-thinking (`enable_thinking=False` obligatorio) |
| Libreria | transformers (se requiere `transformers>=5`; el entrenamiento uso 5.12.1) |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B: un transformer multimodal nativo con codificador de vision y tensores de prediccion multi-token (MTP). El ajuste fino no modifica la topologia; el export conserva los nombres y formas de todos los tensores del base salvo los 15 tensores `mtp.*`, que se omiten deliberadamente. Como consecuencia, la decodificacion especulativa basada en MTP no esta disponible con este checkpoint, aunque la decodificacion ordinaria no se ve afectada (las evaluaciones del articulo se hicieron exactamente con estos ficheros). El codificador de vision se hereda del base sin cambios, pero no se entreno ni se evaluo con imagenes.

El entrenamiento es una destilacion on-policy con multiples profesores y enrutado por etiqueta: 2.700 prompts, 900 por cada dominio (matematicas, codigo e instrucciones), donde cada prompt lleva su etiqueta de dominio y se puntua con el experto correspondiente. Para cada token muestreado, la ventaja se define como la log-probabilidad del profesor menos la log-probabilidad del estudiante recalculada por el actor, y se optimiza con una perdida OPD de gradiente de politica recortado (ratio clip 0,2/0,2), sin termino KL ni de entropia. La variante "Label" se diferencia de DN-MOPD unicamente en que todos los multiplicadores de dominio valen 1.

El batching fue de 64 prompts por 8 respuestas (512 respuestas por actualizacion), con un paso de optimizador por lote de rollout. Los limites de longitud fueron 2.048 tokens de prompt y 8.192 de respuesta, con temperatura 1,0. El optimizador fue Adam con learning rate 1e-6 constante tras 5 actualizaciones de warm-up, betas (0,9; 0,98), weight decay 0,1 y recorte de gradiente 1,0. Se realizaron 80 actualizaciones con semilla de estudiante 42. Los scripts de lanzamiento de cada fila de las tablas del articulo estan en `recipes/qwen3.5/` del repositorio.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat no-thinking, que es el unico modo con el que se entreno y evaluo.
- Razonamiento matematico: en el articulo obtiene 50,2 % de media entre AIME25 y AIME26.
- Generacion y comprension de codigo: 43,3 % de media entre LiveCodeBench v5 y v6.
- Seguimiento de instrucciones: 57,4 % de media de precision estricta entre IFEval e IFBench.
- Respuestas largas: la evaluacion permite hasta 16.384 tokens nuevos de generacion (8.192 en el apendice del articulo), con respuestas de entrenamiento de hasta 8.192 tokens.
- Compatibilidad con `image-text-to-text` a nivel de pipeline: el codificador de vision se conserva del modelo base, pero no se entreno ni se valido con entradas visuales en este ajuste.
- Tool calling / function calling: no documentado en la informacion disponible.
- Uso como agente o razonamiento multi-paso explicito: no documentado; el formato no-thinking descarta la traza de razonamiento visible del base.
- Capacidades multilingues: no documentadas; la model card solo declara ingles.
- Capacidades especiales: ninguna adicional a las del base; en particular, no hay modo thinking y no hay decodificacion especulativa MTP al haberse omitido esos tensores.

## Casos de uso

- Reproduccion de experimentos de destilacion on-policy: es un checkpoint de referencia disenado para comparar contra DN-MOPD-Qwen3.5-4B con la misma receta base (80 actualizaciones, semilla 42, 2.700 prompts) y aislar el efecto del enrutado por etiqueta.
- Ablacion de multiplicadores de dominio: al fijar todos los `w_d = 1`, permite medir cuanto aporta el renormalizado por dominio del metodo propuesto frente al enrutado plano por etiqueta.
- Evaluacion de seguimiento de instrucciones: con 57,4 % de media en IFEval/IFBench y 32.768 tokens de `max_model_len` en la configuracion recomendada, sirve para probar prompts largos de instrucciones estrictas y medir precision estricta con `avg@16`.
- Generacion de codigo asistida en entornos de investigacion: el modelo produce funciones completas (por ejemplo, la n-th Fibonacci) con `max_new_tokens=4096` y muestreo a temperatura 1,0; util como linea base en pipelines internos de evaluacion de codigo.
- Razonamiento matematico con respuesta verificable: entrenado con el profesor de matematicas y evaluado con formato `\boxed{}`, es adecuado para experimentos de verificacion automatica de respuestas y comparacion de estrategias de muestreo (avg@64).
- Comparacion de coste/rendimiento en tamano 4B: con ~4,54 mil millones de parametros y pesos bfloat16 de 9,1 GB, permite estudiar si una receta de destilacion multi-profesor justifica su coste frente al modelo base afinado de forma convencional.
- Estudio de sesgos de destilacion: al ser la variante de control, sirve para analizar que dominios se degradan cuando no se renormaliza por dominio (el repositorio del articulo reporta que los log-ratios de instrucciones son entre 2,3 y 4,4 veces mas dispersos que la senal agrupada en el primer lote de entrenamiento).

## Benchmarks y rendimiento

Resultados de la tabla 2 del articulo (Qwen3.5-4B). Cada dominio promedia dos tareas: AIME25/AIME26 (matematicas), LiveCodeBench v5/v6 (codigo) e IFEval/IFBench (seguimiento de instrucciones). Puntuaciones en porcentaje, semilla de entrenamiento 42, limite de evaluacion de 16.384 tokens, plantilla de chat no-thinking, temperatura 1,0, top-p 1,0 y semilla de generacion 42.

| Modelo | Matematicas | Codigo | IF | Total |
|---|:---:|:---:|:---:|:---:|
| DN-MOPD-Qwen3.5-4B-baseline-label (Label, MOPD con enrutado por etiqueta) | 50,2 | 43,3 | 57,4 | 50,3 |
| DN-MOPD (metodo propuesto) | 54,0 | 45,4 | 58,2 | 52,5 |
| Estudiante inicial (Qwen3.5-4B) | 52,2 | 38,1 | 52,8 | 47,7 |

Detalles de medida indicados en la model card: AIME25/AIME26 con avg@64; LiveCodeBench v5/v6 con avg@6 sobre 167 y 175 problemas disjuntos; IFEval/IFBench con precision estricta de prompt y avg@16; el total es la media de las seis puntuaciones de tarea. No se han publicado en la informacion disponible resultados de MMLU, GSM8K, HumanEval ni de benchmarks multimodales para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 9,1 GB (coincide con el tamano del repositorio). Con overhead de activaciones y cache KV, una estimacion razonable es del orden de 11 a 14 GB en contextos moderados; el dato exacto de cache KV por token no se especifica en la informacion disponible.
- Cabe en GPU de consumo: si. Una RTX 4090 o RTX 3090 (24 GB) ejecuta el modelo en bfloat16 con margen para contextos largos; una RTX 4080 (16 GB) es viable en contextos cortos o con cuantizacion, aunque no hay variantes cuantizadas publicadas.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S permiten lotes mayores y la ventana completa de 32.768 tokens configurada en el ejemplo de vLLM.
- Opciones de despliegue: vLLM (el articulo uso la version 0.18.0, con `max_model_len=32768` y `chat_template_kwargs={"enable_thinking": False}`) y Transformers con `AutoModelForImageTextToText`, `transformers>=5` y `dtype=torch.bfloat16`. No se documentan recetas para llama.cpp, Ollama, TGI ni TensorRT-LLM, y la ausencia de pesos GGUF complica el despliegue en CPU.
- Decodificacion especulativa: no disponible. El export omite los 15 tensores `mtp.*`, por lo que no se puede usar la decodificacion especulativa basada en MTP del modelo base.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Matematicas | Codigo | IF | Total | Licencia |
|---|---|---|---|---|---|---|---|
| DN-MOPD-Qwen3.5-4B-baseline-label | ~4,54 mil millones | 32.768 tokens en el ejemplo de vLLM | 50,2 | 43,3 | 57,4 | 50,3 | Apache-2.0 |
| DN-MOPD-Qwen3.5-4B (hermano, metodo propuesto) | ~4,54 mil millones (mismo base) | no disponible | 54,0 | 45,4 | 58,2 | 52,5 | Apache-2.0 |
| Qwen/Qwen3.5-4B (estudiante inicial) | ~4,54 mil millones | no disponible | 52,2 | 38,1 | 52,8 | 47,7 | Apache-2.0 |
| DN-MOPD-Qwen3.5-4B-teacher-math / -code / -if (profesores) | mismo tamano, segun la model card | no disponible | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |
| Qwen3.5-397B-A17B (Qwen3.5-Plus) | no disponible con detalle; 397B y 17B activos por denominacion | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Observaciones de la comparativa: el baseline Label queda por debajo del modelo base en matematicas (50,2 frente a 52,2) y por encima en codigo (43,3 frente a 38,1) e instrucciones (57,4 frente a 52,8). El repositorio del articulo indica ademas que, con enrutado por etiqueta, MOPD no supera al mejor estudiante de un solo profesor en ninguna de las tres escalas probadas de Qwen3.5 (9B, 4B y 2B), por lo que este checkpoint no debe considerarse una mejora sobre alternativas de un unico profesor. El proyecto tambien senala que DN-MOPD se selecciono en un instrumento de desarrollo anterior de Qwen3, donde una comparacion previa con Qwen3-4B bajo otra configuracion no encontro una ganancia clara, de modo que los beneficios dependen de la configuracion profesor-estudiante.

## Limitaciones y advertencias

- Es la linea base, no el metodo propuesto. La propia model card advierte de que en el articulo no supera al estudiante de un solo profesor mas fuerte.
- Segun el repositorio del articulo, con enrutado por etiqueta el MOPD no supera al mejor estudiante de un solo profesor en ninguna de las tres escalas probadas (9B, 4B, 2B).
- Entrenamiento muy corto: solo 80 actualizaciones desde el modelo base, con 2.700 prompts y la semilla 42. La varianza entre semillas no se documenta.
- Sin decodificacion especulativa: los 15 tensores `mtp.*` se omiten en el export, por lo que se pierde la aceleracion por MTP del modelo base.
- Solo formato no-thinking: hay que pasar `enable_thinking=False` explicitamente a la plantilla de chat; el modelo se entreno y evaluo sin traza de razonamiento visible.
- Idioma: la model card declara unicamente ingles. No se documenta rendimiento en castellano ni en otros idiomas, aunque el modelo base sea multilingue.
- Vision no validada: el pipeline declarado es `image-text-to-text` y el codificador de vision se hereda del base, pero el entrenamiento y la evaluacion fueron solo de texto. No hay garantia de comportamiento correcto con imagenes.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de factualidad; al ser un ajuste por destilacion sobre dominios concretos (matematicas, codigo, instrucciones), el comportamiento fuera de esos dominios no esta medido.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Licencia: Apache-2.0, igual que el modelo base, por lo que el uso comercial esta permitido; conviene revisar igualmente los terminos del modelo base Qwen/Qwen3.5-4B.
- Madurez y soporte: 9 descargas y 0 likes en el momento de la consulta, creado el 1 de octubre de 2026. Es un artefacto de investigacion sin garantias de mantenimiento.
- Precision de los resultados: las cifras proceden de la tabla 2 del articulo con semilla unica (42) y limites de generacion concretos; no se han replicado de forma independiente en la informacion disponible.
- Restriccion practica de despliegue: al no haber pesos GGUF ni cuantizaciones publicadas, la inferencia en CPU o en hardware muy limitado no esta soportada por recetas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-4B-baseline-label
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano (metodo propuesto): https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-4B
- Profesor de matematicas: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-4B-teacher-math
- Profesor de codigo: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-4B-teacher-code
- Profesor de instrucciones: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-4B-teacher-if
- Articulo: https://arxiv.org/abs/2609.35347
- Pagina del proyecto: https://lixin.ai/DN-MOPD/
- Repositorio de codigo: https://github.com/LiXin97/DN-MOPD
- Recetas para Qwen3.5: https://github.com/LiXin97/DN-MOPD/tree/main/recipes/qwen3.5
- Documentacion de la receta: https://github.com/LiXin97/DN-MOPD/blob/main/docs/recipe.md
- Anuncio de Alibaba sobre la serie Qwen3.5: https://www.alibabagroup.com/document-1960233590314762240
