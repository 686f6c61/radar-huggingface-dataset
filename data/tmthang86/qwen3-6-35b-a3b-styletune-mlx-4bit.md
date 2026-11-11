# tmthang86/Qwen3.6-35B-A3B-StyleTune-mlx-4bit

## Resumen

Qwen3.6-35B-A3B-StyleTune-mlx-4bit es una cuantizacion en 4 bits del modelo Gryphe/Qwen3.6-35B-A3B-StyleTune, un ajuste fino orientado a estilo de escritura y conversacion sobre la base Qwen/Qwen3.6-35B-A3B. El trabajo de conversion lo publica el usuario tmthang86 y esta empaquetado especificamente para Apple Silicon mediante la libreria MLX, de modo que pueda ejecutarse en LM Studio, oMLX o mlx-lm sobre Macs con chip de la serie M.

El modelo subyacente es un transformer con arquitectura de mezcla de expertos (MoE) de 35B parametros totales y aproximadamente 3B parametros activos por token, lo que reduce de forma notable el coste computacional por paso de decodificacion frente a un modelo denso del mismo tamano. Esta version concreta pesa 19,5 GB en el repositorio y conserva unicamente la torre de texto: la torre de vision del checkpoint multimodal original se ha descartado durante la conversion.

Su relevancia practica es doble. Por un lado, permite ejecutar en local un modelo de 35B con un consumo de memoria contenido gracias a la cuantizacion 4-bit con grupo de 64, manteniendo las puertas del router MoE en 8 bits segun el valor por defecto de mlx-lm. Por otro, el ajuste de estilo de Gryphe lo orienta a generacion creativa y conversacional, no solo a tareas de razonamiento generico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tipo `qwen3_5_moe` |
| Parametros totales | 34.660.608.768 (aproximadamente 34,7B) |
| Parametros activos | aproximadamente 3B (segun la nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit con group size 64; puertas del router MoE en 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo mezcla de expertos con 34,7B parametros totales y alrededor de 3B activos por token, identificado en los metadatos como `qwen3_5_moe`. Esta configuracion dispersa implica que cada token solo pasa por una fraccion de los expertos, lo que reduce el coste de inferencia en comparacion con un modelo denso equivalente. La cuantizacion se realizo con mlx-lm 0.32.2 mediante el comando `mlx_lm convert -q --q-bits 4 --q-group-size 64`, y las puertas del router se mantuvieron en 8 bits, que es el valor por defecto de la herramienta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base Qwen3.6-35B-A3B ni en el ajuste de estilo de Gryphe. Tampoco se detalla la innovacion tecnica del ajuste StyleTune mas alla de su orientacion a estilo de escritura. Un detalle relevante de esta conversion es que se ha eliminado la torre de vision del checkpoint multimodal original, por lo que el modelo resultante es exclusivamente de texto.

## Capacidades

- Generacion de texto conversacional y creativo, con enfasis en estilo de escritura gracias al ajuste StyleTune del modelo base.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6-35B-A3B, aunque no se documentan evaluaciones especificas en esta ficha.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision: no soportada, la torre de vision fue descartada durante la conversion.
- Ejecucion local en Apple Silicon mediante MLX, con integracion en LM Studio, oMLX y mlx-lm.

## Casos de uso

- Escritura creativa asistida en local: el ajuste de estilo del modelo lo hace adecuado para generar relatos, aperturas de novela o dialogos en un Mac con Apple Silicon, sin enviar el texto a servicios externos.
- Prototipado de asistentes conversacionales: al ejecutarse con mlx-lm o LM Studio, permite iterar sobre prompts y flujos de conversacion multi-turno en un equipo de desarrollo sin coste de API.
- Generacion de contenido editorial: borradores de articulos, resumenes y reescrituras con control de tono, aprovechando la naturaleza MoE para mantener latencia baja en hardware de consumo.
- Educacion y experimentacion con modelos MoE: sirve como banco de pruebas para estudiar el comportamiento de un modelo de 35B con 3B activos en un entorno local y reproducible.
- Desarrollo de aplicaciones privadas: al ser Apache 2.0 y ejecutarse en local, encaja en escenarios donde la confidencialidad del texto es un requisito, como documentacion interna o borradores legales.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de una cuantizacion 4-bit frente al checkpoint original en tareas de estilo y generacion abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 19,5 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible para cargar los pesos en 4 bits, mas margen para el contexto y el estado de inferencia.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon; se recomienda un Mac con chip de la serie M (M1 Pro o superior, M2/M3/M4 con 24 GB o mas de memoria unificada). No es compatible de forma nativa con GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente; no aplica a GPU discretas de consumo por el formato MLX.
- Opciones de despliegue: mlx-lm, LM Studio, oMLX; tambien puede usarse desde Python con la libreria `mlx-lm`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tmthang86/Qwen3.6-35B-A3B-StyleTune-mlx-4bit | 34,7B totales, aproximadamente 3B activos | no disponible | Apache 2.0 | MLX safetensors 4-bit | Conversion para Apple Silicon, solo texto |
| Gryphe/Qwen3.6-35B-A3B-StyleTune | 34,7B totales, aproximadamente 3B activos | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar, incluye torre de vision |
| Qwen/Qwen3.6-35B-A3B | 34,7B totales, aproximadamente 3B activos | no disponible | Apache 2.0 | safetensors | Modelo base multimodal de Qwen |

## Limitaciones y advertencias

- La cuantizacion 4-bit introduce una perdida de calidad respecto al checkpoint original; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- El modelo es exclusivamente de texto: la torre de vision del checkpoint original se elimino, por lo que no puede procesar imagenes.
- No se documentan los idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad del modelo base ni del ajuste de estilo.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.6-35B-A3B y del ajuste de Gryphe por si anaden restricciones adicionales.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a ecosistemas CUDA sin reconversion.
- El repositorio no registra descargas ni likes, y fue creado en noviembre de 2026, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tmthang86/Qwen3.6-35B-A3B-StyleTune-mlx-4bit
- Modelo base del ajuste: https://huggingface.co/Gryphe/Qwen3.6-35B-A3B-StyleTune
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
