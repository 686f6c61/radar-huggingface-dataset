# treeish/Qwen3.6-35B-A3B-oQ4e-FP16-MTP-MLX

## Resumen

El modelo `treeish/Qwen3.6-35B-A3B-oQ4e-FP16-MTP-MLX` es una variante cuantizada del modelo Qwen3.6-35B-A3B de Alibaba, adaptada para ejecución local en equipos Apple Silicon mediante el framework MLX. El modelo original es una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token, lo que permite un rendimiento elevado con un coste computacional reducido. Esta versión concreta, publicada por el usuario treeish, aplica una cuantización mixta de precisión oQ4e con calibración imatrix, mantiene los pesos residuales en FP16 (en lugar de BF16) para compatibilidad con los Macs M1 y M2, e incorpora una cabeza de predicción multi-token (MTP) embebida para acelerar la generación autoregresiva.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de 35B parámetros en equipos con memoria unificada de 24 a 32 GB, algo poco habitual en el ecosistema de Apple Silicon. El formato MLX safetensors y la inclusión de MTP permiten velocidades de generación superiores a 120 tokens por segundo en un M4 Max, según las pruebas del autor. Además, la licencia Apache 2.0 facilita su uso comercial sin restricciones. El modelo está pensado para integrarse en el runtime MLX Swift de Treeish y en la herramienta Sprig, que permite edición de texto estructurada mediante formatos de edición exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, con cabeza MTP embebida |
| Parametros totales | 35B (aproximadamente) |
| Parametros activos | ~3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ4e (4-bit affine, grupo 64, con overrides por tensor a 5, 6 y 8-bit, grupos 64 y 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) en la que cada token activa únicamente una fracción de los parámetros totales (alrededor de 3B de los 35B). Esta versión cuantizada mantiene la arquitectura original y añade una capa de predicción multi-token (MTP) bajo el prefijo `language_model.mtp.*`, que permite proponer varios tokens por paso de decodificación y acelerar la generación. La cuantización oQ4e utiliza calibración imatrix y precisión mixta: la mayoría de los tensores se almacenan en 4 bits con grupo de 64, mientras que ciertos tensores sensibles se sobrescriben a 5, 6 u 8 bits. Los pesos residuales (no cuantizados) se almacenan en FP16 en esta variante, a diferencia de la versión BF16 para M3 y posteriores.

No se dispone de información sobre el entrenamiento del modelo base (composición del dataset, número de tokens, uso de RLHF o DPO). La model card solo documenta el proceso de conversión y cuantización, no el entrenamiento original. El paquete incluye 2.052 tensores indexados, de los cuales 42 pertenecen a la cabeza MTP. La conversión a FP16 se realizó con el script `make_fp16_precision_sibling.py` del repositorio MTPLX, y se validó que cada tensor convertido coincide exactamente con el valor original en BF16 casteado a FP16.

## Capacidades

- Generacion de texto y razonamiento: al ser una variante de Qwen3.6, se espera que herede las capacidades de chat, razonamiento y generacion de codigo del modelo base, aunque no se aportan benchmarks en la documentacion.
- Tool calling / function calling: validado por el autor mediante una prueba de uso de herramienta con MTP activado, que produjo una llamada `search_text` correctamente parseada.
- Multi-Token Prediction (MTP): permite generar varios tokens por paso, con bloques de tamano 2, 3 o 4, acelerando la generacion sin cambiar el resultado final (los tokens generados coinciden con la linea base).
- Edicion de texto estructurada con Sprig: el modelo soporta el formato de edicion exacta de Sprig, produciendo ediciones validas en pruebas con 12 fixtures.
- Capacidades multimodales: el pipeline_tag es `image-text-to-text`, lo que sugiere que el modelo base podria procesar imagenes, pero la documentacion no detalla esta capacidad ni proporciona ejemplos.
- Multilingue: no se especifican los idiomas soportados.

## Casos de uso

- Asistente de codigo local en Mac: el modelo puede integrarse en entornos de desarrollo en Apple Silicon para autocompletar o generar codigo, aprovechando el tool calling para invocar funciones de busqueda o ejecucion. Su tamano activo de 3B permite respuestas rapidas incluso en portatiles.
- Chat conversacional con contexto largo: con 262.144 tokens de ventana, es adecuado para mantener conversaciones extensas o procesar documentos largos completos, como manuales tecnicos o codigo fuente de proyectos enteros.
- Generacion de texto de baja latencia en produccion: gracias a la MTP, se alcanzan velocidades de 120+ tokens/s en un M4 Max, lo que lo hace util para aplicaciones interactivas donde la latencia es critica, como chatbots o asistentes de voz.
- Despliegue en equipos con memoria limitada: al caber en 24 GB de memoria unificada, permite ejecutar un modelo de 35B en Macs de gama media sin necesidad de servidores externos, ideal para prototipado y pruebas locales.
- Edicion de documentos con Sprig: el formato de edicion exacta permite modificar archivos de texto de forma estructurada, util para tareas de refactorizacion de codigo o actualizacion de documentacion.
- Investigacion en eficiencia de modelos: al ser una variante cuantizada con FP16 residual, sirve como caso de estudio para comparar el impacto de la precision en la calidad de salida y el rendimiento en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona unicamente mediciones de rendimiento de generacion en un M4 Max de 36 GB, que se detallan a continuacion a titulo orientativo:

| Configuracion | Velocidad (tokens/s) |
|---|---|
| Sin MTP | 97,2 |
| MTP bloque 2 | 109,2 |
| MTP bloque 3 | 121,2 |
| MTP bloque 4 | 123,9 |

Estas cifras corresponden a un unico equipo y a un fixture de 1.066 tokens, por lo que no deben considerarse representativas de un rendimiento general. La version BF16 equivalente genero 96,8 tokens/s sin MTP y 110,4 tokens/s con MTP bloque 4 en el mismo equipo.

## Requisitos de hardware

- Memoria unificada: minimo 24 GB, recomendado 32 GB. El margen depende de la longitud de contexto, la configuracion de cache y otras aplicaciones en ejecucion.
- Equipos compatibles: Macs con Apple Silicon M1 y M2 (esta variante FP16) y M3 o posteriores (usar la variante BF16). Validado en un M4 Max de 36 GB.
- GPU: no aplica a GPUs NVIDIA; el formato MLX esta disenado exclusivamente para Apple Silicon.
- Runtime: requiere el runtime MLX Swift fijado por Treeish, que soporte los overrides de cuantizacion por tensor en `config.json` y el layout MTP embebido de Qwen.
- Opciones de despliegue: MLX Swift (recomendado), posiblemente integrable con otros frameworks MLX como mlx-lm, aunque no se menciona explicitamente.
- Latencia y throughput: en el M4 Max de prueba, 97-124 tokens/s segun la configuracion MTP. No se aportan datos para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos | 262.144 | Sin cuantizar | safetensors (BF16/FP16) | Apache 2.0 |
| treeish/Qwen3.6-35B-A3B-oQ4e-MTP-MLX (BF16) | 35B totales, ~3B activos | 262.144 | oQ4e | MLX safetensors | Apache 2.0 |
| treeish/Qwen3.6-35B-A3B-oQ4e-FP16-MTP-MLX (este) | 35B totales, ~3B activos | 262.144 | oQ4e | MLX safetensors | Apache 2.0 |

La diferencia principal entre las dos variantes cuantizadas es la precision de los tensores residuales: BF16 para M3+ y FP16 para M1/M2. No se dispone de comparaciones con otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion oQ4e introduce una perdida de calidad respecto al modelo original en precision completa, aunque no se cuantifica en la documentacion.
- La variante FP16 no reduce el tamano en disco ni el consumo de memoria respecto a la BF16; solo cambia la precision de los tensores residuales.
- El modelo requiere un runtime especifico (MLX Swift de Treeish) que soporte los overrides de cuantizacion y el layout MTP; otros runtimes podrian no ser compatibles.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.), por lo que no es posible evaluar objetivamente su rendimiento en tareas estandar.
- El pipeline_tag sugiere capacidades multimodales (image-text-to-text), pero no se documentan ni se proporcionan ejemplos de uso con imagenes.
- No se especifican los idiomas soportados ni los sesgos potenciales del modelo base.
- Las mediciones de velocidad son de un unico equipo y fixture; el rendimiento real variara segun el hardware, la longitud de contexto y la carga del sistema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/treeish/Qwen3.6-35B-A3B-oQ4e-FP16-MTP-MLX
- Variante BF16 (para M3+): https://huggingface.co/treeish/Qwen3.6-35B-A3B-oQ4e-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio MTPLX (herramienta de conversion): https://github.com/youssofal/MTPLX
