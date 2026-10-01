# XINLI1997/DN-MOPD-Qwen3.5-9B-160updates

## Resumen

DN-MOPD-Qwen3.5-9B-160updates es un ajuste fino del modelo base Qwen/Qwen3.5-9B, publicado por el usuario XINLI1997, que aplica una receta de destilacion on-policy con multiples profesores denominada DN-MOPD (Domain-Normalized Multi-Teacher On-Policy Distillation). El checkpoint es el punto final de 160 actualizaciones de entrenamiento descrito en la tabla 5 del articulo "Beyond Teacher Assignment: Domain-Normalized Multi-Teacher On-Policy Distillation" (arXiv:2609.35347). El modelo tiene 9.409.813.744 parametros reales (9,41 mil millones) y un repositorio de 18,8 GB en pesos bfloat16.

El problema que aborda es el reparto de credito entre profesores de distinto dominio: en lugar de asignar un unico profesor a cada prompt, DN-MOPD enruta cada prompt a su experto (matematicas, codigo e instruccion following) y reescala las ventajas por token de cada dominio con el factor w_d = clip(sigma_all / sigma_d, 0,25, 4), de forma que ningun dominio domine la actualizacion compartida. Segun el articulo, este reescalado mejora el total de seis tareas de 59,6 a 60,7 puntos respecto al enrutado por etiqueta simple.

Es relevante ahora porque documenta una alternativa reproducible a la asignacion manual de profesores en pipelines de destilacion multi-profesor, con recetas y scripts publicos. El modelo se distribuye bajo licencia Apache-2.0, esta pensado para el formato de chat sin modo de razonamiento (enable_thinking=False) y solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`). No se documenta si es densa o MoE |
| Parametros totales | 9.409.813.744 (9,41 mil millones), dato real de safetensors |
| Parametros activos | No disponible: no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible para el checkpoint. Los ejemplos de uso emplean `max_model_len=32768` en vLLM y la evaluacion genera hasta 16.384 tokens nuevos. Durante el entrenamiento: prompt <= 2.048 y respuesta <= 8.192 tokens |
| Tipos de cuantizacion | No disponible: solo se publican pesos en bfloat16, sin GGUF ni cuantizaciones del autor |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato Hugging Face (`Qwen3_5ForConditionalGeneration`), bfloat16, exportados desde el checkpoint FSDP de entrenamiento |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 (la model card usa `AutoModelForImageTextToText` y la pipeline declarada es `image-text-to-text`). El ajuste no modifica la arquitectura: el export mantiene los nombres y formas de todos los tensores del modelo base, con la excepcion de los 15 tensores de prediccion multi-token (`mtp.*`), que se omiten deliberadamente. El entrenamiento se realizo en bfloat16 con FSDP y se evaluo con la plantilla de chat sin modo de razonamiento.

La receta de DN-MOPD usa 2.700 prompts de entrenamiento, 900 por dominio (matematicas, codigo e instruccion following). Cada prompt lleva su etiqueta de dominio y se puntua con el experto de ese dominio. La ventaja por token muestreado es la diferencia entre el log-probabilidad del profesor y el log-probabilidad recalculado por el actor, utilizada en una perdida OPD de gradiente de politica recortada (ratio clip 0,2/0,2), sin termino KL ni de entropia. En cada lote, sigma_d es la desviacion tipica poblacional de los log-ratios profesor-rollout sobre los tokens validos del dominio d, y sigma_all agrupa todos los dominios; las ventajas de cada dominio se multiplican por w_d = clip(sigma_all / sigma_d, 0,25, 4), preservando el signo. El batching es de 64 prompts x 8 respuestas = 512 respuestas por actualizacion, con un paso de optimizador por lote. Se usa Adam con learning rate 1e-6 constante tras 5 actualizaciones de calentamiento, betas (0,9, 0,98), weight decay 0,1, recorte de gradiente 1,0 y temperatura 1,0. La ejecucion parte de la semilla de estudiante 42 y consta de 160 actualizaciones (la ejecucion de 80 se continuo hasta 160).

## Capacidades

- Generacion de texto conversacional en ingles con la plantilla de chat de Qwen3.5 en modo no-thinking.
- Razonamiento matematico: el dominio de matematicas es uno de los tres profesores; en la evaluacion se usan problemas tipo AIME25 y AIME26 con avg@64.
- Generacion de codigo: dominio de codigo con profesor propio; se evalua con LiveCodeBench v5 y v6 (167 y 175 problemas disjuntos) con avg@6.
- Seguimiento de instrucciones: dominio de IF, evaluado con IFEval e IFBench con precision estricta de prompt y avg@16.
- Entrada multimodal: la pipeline declarada es `image-text-to-text` y la clase es `Qwen3_5ForConditionalGeneration`, por lo que hereda la capacidad vision-lenguaje del modelo base; no se documenta evaluacion de vision para este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible para este checkpoint; la documentacion del modelo base menciona agentes multimodales nativos, pero no se aportan resultados del ajuste.
- Modo thinking: la plantilla de Qwen3.5 lo activa por defecto, pero este checkpoint se entreno y evaluo con `enable_thinking=False`; no se documenta su comportamiento con el modo de razonamiento activado.
- Capacidades multilingues: solo se declara ingles (`language: en`).

## Casos de uso

- Razonamiento matematico asistido: el profesor de matematicas del pipeline esta especializado en este dominio y la evaluacion usa problemas de competicion (AIME25/AIME26). Se usaria con temperatura 1,0 y top-p 1,0, generando varias muestras por problema y agregando por mayoria, tal como hace la evaluacion con avg@64.
- Generacion de codigo en produccion: el dominio de codigo se evaluo con LiveCodeBench v5/v6, lo que permite usar el modelo como generador de funciones y parches en pipelines de revision, con prompts de hasta 2.048 tokens y respuestas de hasta 8.192.
- Asistentes conversacionales en ingles: la plantilla de chat no-thinking y la ventana de generacion de hasta 16.384 tokens permiten conversaciones multi-turno con contexto largo sin la sobrecarga de latencia del modo de razonamiento.
- Normalizacion de instrucciones y formateo estructurado: el dominio de instruccion following, medido con IFEval e IFBench en precision estricta de prompt, lo hace adecuado para tareas de transformacion de texto con formato fijo y verificacion automatica.
- Destilacion y experimentacion academica: el repositorio incluye las recetas y scripts de lanzamiento de cada fila de las tablas del articulo en `recipes/qwen3.5/`, por lo que sirve como estudiante de referencia para reproducir o comparar variantes de destilacion multi-profesor.
- Evaluacion comparativa de metodos de destilacion: al existir profesores del mismo tamano (math, code, IF) y checkpoints intermedios a 80 actualizaciones, permite aislar el efecto del reescalado por dominio frente al enrutado por etiqueta.
- Procesamiento de entradas mixtas imagen-texto: la pipeline `image-text-to-text` y la clase condicional permiten plantear tareas de descripcion o pregunta-respuesta sobre imagenes, aunque no hay evaluacion publicada que respalde el rendimiento de este ajuste en vision.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los totales de seis tareas del articulo (tabla 5), con semilla de entrenamiento 42, limite de 16.384 tokens, plantilla no-thinking, temperatura 1,0, top-p 1,0 y semilla de generacion 42.

| Metodo (Qwen3.5-9B) | Total a 80 actualizaciones | Total a 160 actualizaciones | Delta total |
|---|---|---|---|
| Profesor unico (IF) | 57,3 | 57,6 | +0,4 |
| Enrutado por etiqueta | 58,4 | 59,4 | +1,0 |
| **DN-MOPD** | 59,6 | 60,7 | +1,2 |

El total es la media de las seis tareas: AIME25 y AIME26 (avg@64), LiveCodeBench v5 y v6 (avg@6) e IFEval e IFBench (precision estricta de prompt, avg@16). No se han publicado en la informacion disponible las puntuaciones individuales por tarea, ni resultados de MMLU, HumanEval o GSM8K, ni comparaciones con modelos externos al estudio.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 18,8 GB solo de pesos, segun el tamano real del repositorio; hay que sumar la cache KV, cuyo calculo exacto no esta disponible al no documentarse el numero de capas y cabezas.
- GPUs de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB pueden alojar el modelo en bfloat16 con margen para contexto extendido.
- GPUs de consumo: cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en bfloat16 con ventanas de contexto cortas; con `max_model_len=32768` la cache KV puede exceder esos 24 GB, por lo que se recomienda reducir la longitud maxima o usar cuantizacion de la cache.
- Cuantizacion: el autor no publica pesos GGUF, AWQ ni GPTQ, de modo que el despliegue en VRAM reducida requiere cuantizar el checkpoint bfloat16 a posteriori.
- Opciones de despliegue: vLLM (la version usada en el articulo fue 0.18.0) y transformers con `transformers>=5` (el entorno de entrenamiento uso 5.12.1). No se documentan integraciones con llama.cpp, Ollama o TGI para este checkpoint.
- Decodificacion especulativa: no disponible con este checkpoint, porque el export omite los 15 tensores `mtp.*` del modelo base. La decodificacion ordinaria no se ve afectada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Total (160 updates) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DN-MOPD-Qwen3.5-9B-160updates | 9,41 mil millones | No disponible (ejemplos con 32.768) | 60,7 | Apache-2.0 | Hugging Face (8 descargas, 0 likes) |
| Estudiante con enrutado por etiqueta (mismos datos) | No disponible | No disponible | 59,4 | No disponible | Variante del estudio, no publicada como checkpoint en la informacion disponible |
| Estudiante con profesor unico de IF | No disponible | No disponible | 57,6 | No disponible | Variante del estudio, no publicada como checkpoint en la informacion disponible |
| Qwen/Qwen3.5-9B (modelo base) | 9B (aproximado) | No disponible | No evaluado en el articulo | Apache-2.0 | Hugging Face; tambien en Ollama (`qwen3.5:9b`) y Microsoft Foundry |

Tambien existen los tres profesores del mismo tamano publicados por el mismo autor: DN-MOPD-Qwen3.5-9B-teacher-math, DN-MOPD-Qwen3.5-9B-teacher-code y DN-MOPD-Qwen3.5-9B-teacher-if. El articulo menciona ademas experimentos en Qwen3.5 de 9B, 4B y 2B, pero no se aportan sus resultados en la informacion disponible.

## Limitaciones y advertencias

- Se trata de un ajuste sobre un unico dataset de 2.700 prompts (900 por dominio); el riesgo de sobreajuste a esos dominios y de degradacion en tareas fuera de matematicas, codigo e IF no esta cuantificado en la informacion disponible.
- El export omite los 15 tensores de prediccion multi-token del modelo base, por lo que la decodificacion especulativa basada en MTP no esta disponible con este checkpoint.
- Es obligatorio pasar `enable_thinking=False`; la plantilla de Qwen3.5 activa el modo de razonamiento por defecto y el autor no documenta el comportamiento del modelo con ese modo activado.
- Solo se declara soporte de ingles; no hay datos sobre rendimiento en castellano ni en otros idiomas.
- Los resultados publicados usan temperatura 1,0 y top-p 1,0, con avg@64, avg@16 y avg@6 segun la tarea; no se aportan resultados con decodificacion greedy, que suelen ser mas bajos en tareas de razonamiento.
- No se documentan evaluaciones de sesgo, toxicidad, robustez ni tasas de alucinacion para este checkpoint.
- No se documenta soporte verificado de tool calling, function calling ni flujos de agente para este ajuste.
- La capacidad multimodal se hereda del modelo base, pero no hay evaluacion publicada de vision para este checkpoint; usarla en produccion sin validacion propia es arriesgado.
- La licencia es Apache-2.0, la misma que el modelo base, pero conviene verificar los terminos del modelo base Qwen3.5-9B antes de un uso comercial.
- El modelo tiene 8 descargas y 0 likes en el momento de la consulta, y procede de un unico autor sin validacion independiente; los totales de la tabla 5 solo estan comparados dentro del propio estudio.
- La ventana de contexto efectiva para este checkpoint no esta documentada; los 32.768 tokens de los ejemplos son un parametro de configuracion de vLLM, no una especificacion confirmada del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B-160updates
- Articulo: https://arxiv.org/abs/2609.35347
- Pagina del proyecto: https://lixin.ai/DN-MOPD
- Codigo: https://github.com/LiXin97/DN-MOPD
- Recetas Qwen3.5: https://github.com/LiXin97/DN-MOPD/tree/main/recipes/qwen3.5
- Documentacion de la receta: https://github.com/LiXin97/DN-MOPD/blob/main/docs/recipe.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Profesor de matematicas: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B-teacher-math
- Profesor de codigo: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B-teacher-code
- Profesor de instruccion following: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B-teacher-if
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/XINLI1997/DN-MOPD-Qwen3.5-9B
- Qwen3.5-9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Qwen3.5-9B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
