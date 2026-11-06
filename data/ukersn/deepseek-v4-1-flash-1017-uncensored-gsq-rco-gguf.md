# ukersn/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF de tipo "abliterated" del modelo DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos (MoE) de 763.000 millones de parámetros con 384 expertos enrutados. La ha publicado el usuario ukersn a partir del backbone GSQ-RCO de ISTA-DASLab, sustituyendo únicamente los tensores densos que escriben en el residual (proyección de salida de atención, down-projection del experto compartido y proyección de valor de Engram) por versiones con la dirección de rechazo de DeepSeek proyectada fuera a fuerza 2.0. Los expertos enrutados quedan intactos byte a byte, por lo que se preserva el redondeo de baja precisión aprendido por GSQ.

El resultado es un modelo que mantiene la precisión de la tarea del cuantizado original (GPQA-Diamond idéntico al 83,3%, AIME25 dentro del ruido) pero elimina prácticamente por completo los rechazos medidos en JailbreakBench (del 85-89% al 0,0% en las tres variantes publicadas). Es relevante porque demuestra que la edición de una sola dirección sobre escritores densos del residual es suficiente para eliminar el comportamiento de rechazo en un MoE de este tamaño sin degradar el razonamiento.

La ficha técnica del autor indica que el modelo corre en una única GPU de 12 GB mediante Strata, con el backbone en memoria del sistema y la tabla Engram (110 GB) transmitiendo desde SSD. No hay datos publicados sobre longitud de contexto, idiomas soportados ni composición del dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), 384 expertos enrutados, con tabla Engram separada |
| Parametros totales | 551.880.949.208 (según safetensors); la model card indica 763B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M (1,75 bpw), IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards de 4 ficheros por rung) + fichero Engram separado de 110 GB |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos con 384 expertos enrutados y una tabla Engram (lookup table de 110 GB) que se mantiene como fichero separado. La cuantización GSQ-RCO de ISTA-DASLab aplica un redondeo de baja precisión aprendido sobre los expertos enrutados, lo que permite comprimir el modelo a 1,75-2,25 bits por peso manteniendo la precisión de la tarea. Sobre ese backbone, esta versión sustituye tres tipos de tensores densos: `attn_output_b` (salida de atención), `ffn_down_shexp` (down-projection del experto compartido) y `engram_wkv` (proyección de valor de Engram). Los tensores reemplazados llevan la edición de dirección de rechazo a fuerza 2,0 en precisión completa y se cuantizan al tipo por tensor exacto de ISTA. Los expertos enrutados no se tocan.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es el método de abliteración selectiva sobre escritores densos del residual, que según las mediciones del autor produce un desplazamiento KL de ~0,02 respecto al cuantizado original y mantiene la precisión en GPQA-Diamond y AIME25.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Razonamiento matemático y de nivel avanzado (AIME25, GPQA-Diamond medidos).
- Modo "thinking" con esfuerzo de razonamiento configurable (el autor mide con esfuerzo 50 y "thinking high" a 30 preguntas).
- Respuestas sin rechazo en temas que el modelo base rechazaría (JailbreakBench EN al 0,0% en las tres variantes).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio reproducible de cómo una edición de una sola dirección sobre tensores densos elimina rechazos sin degradar tareas de razonamiento, con métricas públicas de KL y benchmarks en el repositorio de métricas del autor.
- Evaluación de robustez de clasificadores de rechazo: el autor advierte que su clasificador lee solo el inicio de la respuesta, por lo que este modelo permite probar clasificadores más finos que detecten rechazos suaves en medio del texto.
- Despliegue local en hardware de consumo: con Strata, el backbone reside en memoria del sistema y la tabla Engram transmite desde SSD, de modo que un MoE de 763B puede servirse en una GPU de 12 GB, útil para prototipado offline sin depender de la nube.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones o diálogos donde el modelo base rechazaría escenas violentas o controvertidas, manteniendo el razonamiento del modelo original.
- Estudio de cuantización extrema: las variantes IQ1_M, IQ2_XXS e IQ2_XS permiten comparar el impacto de 1,75-2,25 bpw en precisión (MMLU-500 entre 80,6% y 82,8%) sobre un mismo backbone, con los logs por pregunta publicados.
- Reproducción de benchmarks de razonamiento en modelos abliterated: GPQA-Diamond (198 preguntas) y AIME25 (30 preguntas) están medidos contra el cuantizado original, lo que permite validar pipelines de evaluación propios contra cifras de referencia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, comparando el cuantizado GSQ-RCO original con esta versión uncensored:

| Benchmark | GSQ-RCO original | Uncensored (esta versión) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3% | 83,3% |
| AIME25 (30 preguntas) | 76,7% | 80,0% |

Métricas de eliminación de rechazo por variante (original → esta versión):

| Variante | bpw | Tamaño total | JailbreakBench (EN) | XSTest (rechazo seguro) | Thinking high (30) | MMLU (500) | KL respecto al original |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 GB | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 82,8% (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 GB | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 81,6% (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 GB | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 80,6% (p=0,75) | 0,0207 |

El KL es una cota inferior top-64 medida con el modo de puntuación teacher-forced de Strata, por lo que el KL real es algo mayor.

## Requisitos de hardware

- VRAM estimada: 12 GB de GPU según el autor, con el backbone en memoria del sistema y la tabla Engram (110 GB) transmitiendo desde SSD.
- GPU recomendadas: no se especifican modelos concretos; el autor afirma que funciona en una GPU de 12 GB.
- ¿Cabe en GPU de consumo? Sí, en una GPU de 12 GB con Strata y la tabla Engram en SSD rápido.
- Almacenamiento: cada rung ocupa entre 231 GB (IQ1_M) y 266 GB (IQ2_XS), más el fichero Engram de 110 GB compartido, que no se rehostea en este repositorio.
- Opciones de despliegue: Strata (el autor indica que DeepSeek-V4.1 con fichero Engram separado aún no está en llama.cpp). Otras opciones no disponibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (ukersn/...-Uncensored-GSQ-RCO-GGUF) | 551,9B (según safetensors); 763B según model card | no disponible | MIT | GGUF + Engram | Abliterado, corre en 12 GB con Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | mismo backbone | no disponible | no disponible | GGUF + Engram | Cuantizado original, con rechazos |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | no disponible | Modelo base original |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | mismo backbone | no disponible | no disponible | GGUF | Misma edición de dirección de rechazo, según el autor |

## Limitaciones y advertencias

- El clasificador de rechazo del autor lee solo el inicio de la respuesta, por lo que un rechazo suave más adelante en el texto puede pasar como respuesta válida.
- La edición elimina rechazos en todos los temas; no conserva un subconjunto más estrecho de ellos.
- Con el modo thinking activado, la edición planifica una respuesta a una solicitud (texto truncado en la model card).
- La eliminación de rechazos no implica corrección factual: el riesgo de alucinación del modelo base persiste y no hay mediciones de veracidad publicadas.
- No hay información sobre sesgos conocidos, idiomas soportados ni comportamiento en contextos largos.
- El modelo requiere Strata para ejecutarse; llama.cpp aún no soporta DeepSeek-V4.1 con fichero Engram separado, lo que limita las opciones de despliegue.
- El repositorio ocupa 414,2 GB y no incluye el fichero Engram de 110 GB, que debe descargarse por separado.
- Licencia MIT, lo que permite uso comercial, pero el modelo base y los cuantizados de ISTA-DASLab tienen licencias no detalladas en la información disponible; conviene verificarlas antes de producción.
- El número de parámetros difiere entre fuentes (551,9B en safetensors frente a 763B en la model card); no se aclara la discrepancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukersn/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Versión uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Strata (runtime): https://github.com/Niko1221/Strata
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
