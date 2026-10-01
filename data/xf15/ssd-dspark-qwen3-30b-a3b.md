# xf15/ssd-dspark-qwen3-30b-a3b

## Resumen

`xf15/ssd-dspark-qwen3-30b-a3b` es un modelo "drafter" (borrador) de decodificacion especulativa de la familia DSpark, publicado por el usuario xf15. No es un modelo de lenguaje autonomo: esta disenado para servirse junto al modelo objetivo `Qwen/Qwen3-30B-A3B` y predecir bloques de tokens que el modelo grande valida despues, acelerando asi la generacion. En concreto, emplea un block size de 7 y 5 capas de borrador, y lee los estados internos del objetivo en las capas de tap [1, 12, 23, 34, 45].

El repositorio ocupa 20,5 GB y contiene checkpoints en los limites de epoca del entrenamiento (`epoch_N/step_{N*2615}/`), fruto de un ciclo de 10 epocas sobre el corpus open-perfectblend regenerado por Qwen3-30B-A3B, con 1.339.038 filas validas de cache. El schedule de learning rate es coseno, con 26.150 pasos totales y 2.615 pasos por epoca.

Su relevancia es practica: permite desplegar decodificacion especulativa sobre Qwen3-30B-A3B sin entrenar el drafter desde cero, ademas de servir como material reproducible para investigacion en decodificacion especulativa (orden de datos determinista por semilla y registros de shuffle publicados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de la familia DSpark (modelo ligero de borrador para decodificacion especulativa); 5 capas de borrador, block size 7, target tap layers [1, 12, 23, 34, 45] |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo Qwen/Qwen3-30B-A3B) |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`config.json` + `model.safetensors` por checkpoint) |

## Arquitectura y entrenamiento

El modelo es un drafter de la familia DSpark, pensado para decodificacion especulativa por bloques. Cada paso de borrador propone un bloque de 7 tokens y se apoya en las representaciones internas del modelo objetivo capturadas en las capas [1, 12, 23, 34, 45]. La red de borrador tiene 5 capas. La model card indica que cualquier par `epoch_N/step_S/config.json` + `model.safetensors` carga igual que los drafters liberados en el paper de DSpark, y que debe servirse junto al modelo objetivo Qwen/Qwen3-30B-A3B.

El entrenamiento se realizo sobre el corpus open-perfectblend regenerado por Qwen3-30B-A3B, con 1.339.038 filas validas de cache y un schedule de learning rate coseno de 10 epocas (max_train_steps 26.150, 2.615 pasos por epoca). El orden de datos es determinista: la epoca `e` usa `torch.randperm(1339038, seed 42+e)` truncado a `2615*512` muestras, y los ordenes de las 10 epocas quedan volcados en `shuffle_records/`. La reanudacion del entrenamiento exige world size 4 y local batch size 1, con torch 2.9.1, y se verifica reconstruyendo la cache de activaciones desde el repositorio de dataset `xf15/ssd-perfectblend-qwen3-30b-a3b-regen` y comprobando que el numero de filas conservadas coincide con 1.339.038.

## Capacidades

- Prediccion especulativa de bloques de tokens (block size 7) para acelerar la decodificacion de Qwen/Qwen3-30B-A3B.
- Aprovechamiento de estados internos del modelo objetivo en cinco capas de tap [1, 12, 23, 34, 45].
- Carga directa como par `config.json` + `model.safetensors` por checkpoint, con el mismo procedimiento que los drafters del paper de DSpark.
- Entrenamiento reproducible y reanudable: orden de datos determinista por semilla, metadatos de version en `shuffle_records/meta.json` y ficheros `epoch_*.npy` para verificar la reproduccion.
- No es un modelo de chat ni de generacion autonoma: no incorpora por si mismo capacidades de razonamiento, codigo, vision, tool calling ni agentes. Esas capacidades dependen del modelo objetivo con el que se combine.
- Soporte de tool calling, agentes, multimodalidad o thinking mode: no disponible en la informacion publicada (heredado, en su caso, de Qwen3-30B-A3B).

## Casos de uso

- Aceleracion de inferencia de Qwen3-30B-A3B en produccion: el drafter propone bloques de 7 tokens que el modelo objetivo valida, reduciendo el coste por token en endpoints de alta concurrencia.
- Servicio de chat interactivo de baja latencia: al reducir el numero de pasos de decodificacion efectivos, mejora el tiempo hasta el primer token util en conversaciones multi-turno servidas sobre el modelo objetivo.
- Reduccion de coste en APIs de terceros: en despliegues con Qwen3-30B-A3B como motor subyacente, la decodificacion especulativa rebaja el uso de GPU por peticion manteniendo la calidad del modelo grande.
- Generacion de codigo asistida en IDE: combinado con Qwen3-30B-A3B, acelera autocompletado y generacion de fragmentos largos, donde la prediccion por bloques es mas rentable.
- RAG sobre documentos extensos: al heredar la ventana de contexto del objetivo, permite resumir y responder sobre corpus largos manteniendo el ahorro de latencia del drafter.
- Despliegue on-premise con GPU limitada: al no requerir un modelo grande adicional, el drafter se anade al objetivo ya desplegado con un coste de memoria reducido (5 capas de borrador).
- Reproduccion de investigacion en decodificacion especulativa: los checkpoints por epoca, el orden de datos determinista y los registros de shuffle permiten replicar el entrenamiento y estudiar la tasa de aceptacion por epoca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El drafter en si es ligero (5 capas de borrador), pero su uso siempre exige cargar tambien el modelo objetivo Qwen/Qwen3-30B-A3B, cuyo peso domina los requisitos de memoria.
- Estimacion de VRAM para el objetivo Qwen3-30B-A3B (30B parametros totales): en bf16 en torno a 60-62 GB; en FP8 en torno a 31 GB; en cuantizacion de 4 bits en torno a 17-19 GB. Estas cifras son estimaciones a partir del tamano del objetivo, no datos publicados en la model card.
- GPU recomendadas para el despliegue conjunto: A100 80 GB, H100 80 GB o L40S 48 GB en configuraciones de precision alta; en cuantizacion de 4 bits puede caber en una RTX 4090 de 24 GB.
- Entrenamiento o reanudacion del drafter: la model card exige world size 4 y local batch size 1, es decir, al menos 4 procesos/GPU, con torch 2.9.1.
- Opciones de despliegue: la model card solo indica que carga como los drafters del paper de DSpark junto al objetivo. No se documentan integraciones concretas con vLLM, llama.cpp, Ollama o TGI; considerese no disponible y sujeto a que el runtime soporte el formato DSpark.
- Latencia y throughput estimados: no disponible (dependen de la tasa de aceptacion del drafter y del hardware del objetivo, no publicadas).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xf15/ssd-dspark-qwen3-30b-a3b | Drafter DSpark (block size 7, 5 capas) para Qwen3-30B-A3B | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Drafters del paper DSpark | Drafter de decodificacion especulativa | no disponible | no disponible | no disponible | Referenciados en la model card, sin enlace |
| EAGLE / EAGLE-3 | Metodos de decodificacion especulativa | no disponible | no disponible | no disponible | Alternativa conceptual de la misma categoria |
| Medusa | Cabezas de prediccion multiple para decodificacion especulativa | no disponible | no disponible | no disponible | Alternativa conceptual de la misma categoria |

No se dispone de datos cuantitativos comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es autonomo: sin el objetivo Qwen/Qwen3-30B-A3B no genera texto util. Servirlo aislado no tiene sentido.
- No se especifica licencia, lo que impide confirmar si se permite uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni evidencia publica de su calidad en produccion.
- No se publican tasas de aceptacion, speedup medido ni benchmarks, de modo que el beneficio real de la decodificacion especulativa no esta cuantificado.
- No se documentan idiomas soportados ni sesgos; al depender del objetivo, hereda los sesgos y limitaciones de Qwen3-30B-A3B.
- Riesgo de que el formato de checkpoints DSpark no sea compatible con runtimes de inferencia habituales; puede requerir implementacion propia.
- La reanudacion del entrenamiento impone requisitos estrictos (world size 4, local batch 1, torch 2.9.1) y dependencias del repositorio de dataset; desviarse de ellos puede romper la reproducibilidad.
- Fechas de creacion y actualizacion (2026-10-01) reducidas a minutos de diferencia: el proyecto parece recien publicado y sin mantenimiento posterior constatado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/xf15/ssd-dspark-qwen3-30b-a3b
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio de dataset de cache: https://huggingface.co/datasets/xf15/ssd-perfectblend-qwen3-30b-a3b-regen
- Paper de DSpark: referencia citada en la model card, enlace no disponible
