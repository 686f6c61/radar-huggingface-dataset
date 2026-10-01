# xf15/ssd-dspark-prog-qwen3-30b-a3b-gap4-tail1

## Resumen

El modelo `xf15/ssd-dspark-prog-qwen3-30b-a3b-gap4-tail1` es un *drafter* de decodificacion especulativa perteneciente a la familia DSpark, disenado especificamente para acelerar la inferencia de `Qwen/Qwen3-30B-A3B`. No es un modelo de lenguaje autonomo: es un componente auxiliar que predice bloques de tokens candidatos que el modelo objetivo verifica en paralelo. Su autoria corresponde al usuario `xf15` de HuggingFace y el repositorio no registra descargas ni licencia declarada en el momento de la consulta.

Tecnicamente se trata de un drafter con layout `dspark_prog` y configuracion `gap4_tail1`, con un tamano de bloque de 7 tokens, 10 capas de borrador cuyas activaciones se reutilizan segun el patron `[0, 0, 1, 1, 2, 2, 3, 3, 4, 4]`, y un esquema de *target tap* sobre las capas `[1, 12, 23, 34, 45]` del modelo Qwen3-30B-A3B. El entrenamiento se realizo sobre el corpus open-perfectblend regenerado por el propio modelo objetivo, con 1.339.038 filas validas de cache y un calendario de learning rate coseno a lo largo de 10 epocas (26.150 pasos maximos, 2.615 pasos por epoca).

La relevancia de esta publicacion es acotada pero clara dentro del nicho de optimizacion de inferencia: se distribuyen los checkpoints de frontera de epoca junto con los registros de orden de datos (`shuffle_records/`), lo que permite reproducir exactamente la secuencia de entrenamiento. Esto lo convierte en material util para equipos que investigan decodificacion especulativa o que quieren continuar el entrenamiento del drafter en lugar de usarlo como artefacto cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de decodificacion especulativa (familia DSpark, layout `dspark_prog` gap4_tail1); 10 capas de borrador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE; el modelo objetivo si lo es) |
| Longitud de contexto | no disponible; viene determinada por el modelo objetivo Qwen/Qwen3-30B-A3B |
| Tipos de cuantizacion | no disponible; pesos en safetensors sin variantes GGUF/AWQ declaradas |
| Idiomas soportados | no disponible; hereda la distribucion del corpus open-perfectblend regenerado por Qwen3-30B-A3B |
| Licencia | no disponible |
| Formato de pesos | safetensors (cada checkpoint es un par `config.json` + `model.safetensors`) |
| Tamano de bloque (*block size*) | 7 |
| Capas de borrador y activaciones | 10 capas, `layer_activation_ids = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]` |
| Target tap layers | `[1, 12, 23, 34, 45]` |
| Modelo objetivo | Qwen/Qwen3-30B-A3B |
| Tamano del repositorio | 36,7 GB (incluye los checkpoints de las 10 epocas) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo es un drafter de la familia DSpark, una linea de trabajo en decodificacion especulativa en la que un modulo ligero propone multiples tokens por paso y el modelo objetivo los valida en una sola pasada. La configuracion concreta de este repositorio usa un tamano de bloque de 7, diez capas de borrador y un esquema de reutilizacion de activaciones por pares (`[0, 0, 1, 1, 2, 2, 3, 3, 4, 4]`), de modo que cada nivel de representacion se comparte entre dos capas consecutivas. Ademas, el borrador consume informacion intermedia del modelo objetivo a traves de cinco capas de *tap* (`[1, 12, 23, 34, 45]`), lo que condiciona fuertemente su arquitectura al modelo Qwen3-30B-A3B y lo hace no reutilizable con otros objetivos.

El entrenamiento se realizo a partir del corpus open-perfectblend regenerado por Qwen3-30B-A3B, del que se conservaron 1.339.038 filas con cache de activaciones valida. El calendario de learning rate es coseno y abarca 10 epocas, con 26.150 pasos maximos y 2.615 pasos por epoca. La configuracion distribuida era de *world size* 4 con batch local 1, sobre torch 2.9.1, y el orden de datos es determinista: la epoca `e` usa `torch.randperm(1339038, seed 42+e)` truncado a 2.615*512 muestras, con los ordenes volcados en `shuffle_records/`. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de alineacion adicional.

## Capacidades

- Decodificacion especulativa (*speculative decoding*): genera borradores de bloques de hasta 7 tokens para que Qwen3-30B-A3B los verifique en paralelo.
- Aceleracion de inferencia: no genera texto de forma autonoma, su funcion es reducir el numero de pasos de decodificacion del modelo objetivo.
- Reanudacion de entrenamiento: los checkpoints de frontera de epoca (`epoch_N/step_{N*2615}/`) permiten continuar el entrenamiento desde cualquier epoca del calendario coseno.
- Reproducibilidad de datos: incluye `shuffle_records/` con las permutaciones de las 10 epocas y metadatos de version de torch para verificar la reconstruccion del orden de datos.
- Generacion de texto: no aplica por si mismo; la generacion final la produce siempre el modelo objetivo.
- Tool calling / function calling: no disponible (no es una capacidad del drafter).
- Soporte de agentes y razonamiento multi-paso: no disponible por parte del drafter; heredado del modelo objetivo en caso de que este lo soporte.
- Capacidades multilingues: no disponibles como dato declarado; dependen del corpus de regeneracion y del tokenizador de Qwen3-30B-A3B.
- Vision, audio, thinking mode: no disponible.

## Casos de uso

- Servicio de inferencia de alto rendimiento con Qwen3-30B-A3B: el drafter se despliega junto al modelo objetivo para reducir la latencia por token generado, especialmente en cargas con requisitos estrictos de tiempo de respuesta.
- Despliegue de Qwen3-30B-A3B en GPU limitadas: al disminuir el numero de pasos de decodificacion, permite sostener mayor throughput con el mismo hardware, util cuando el presupuesto de VRAM no permite un modelo mayor.
- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible para comparar variantes de layout (`gap4_tail1` frente a otras configuraciones de *block size* y *tap layers*).
- Continuacion del entrenamiento del drafter: los checkpoints por epoca y el manifiesto de cache permiten reanudar con *world size* 4, batch local 1 y torch 2.9.1, sin rehacer el pipeline desde cero.
- Replicacion de experimentos: los ficheros `shuffle_records/epoch_*.npy` y `source_rows.npy` permiten auditar que se mantienen exactamente 1.339.038 filas y que el orden de datos coincide con el original.
- Backends de chat o generacion por lotes: integrado en un servidor que ya sirva Qwen3-30B-A3B (por ejemplo, un motor compatible con drafters), mejora la tasa de tokens por segundo en produccion.
- Evaluacion de la calidad del borrador: util para medir tasas de aceptacion (*acceptance rate*) por bloque de 7 tokens y optimizar el equilibrio entre velocidad y precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de tasa de aceptacion, *speedup* medido, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion numerica del drafter o del sistema conjunto con Qwen3-30B-A3B.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explicita. El repositorio ocupa 36,7 GB, pero agrupa los checkpoints de las 10 epocas; un unico par `config.json` + `model.safetensors` correspondiente a una epoca seria sustancialmente menor (estimacion orientativa en torno a una decima parte del total, no confirmada por el autor).
- El coste real de despliegue lo domina el modelo objetivo Qwen3-30B-A3B, no el drafter; el borrador anade una sobrecarga adicional de memoria y computo que no se cuantifica en la model card.
- GPU recomendadas: no disponible. La model card no especifica hardware de referencia ni para entrenamiento ni para inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la model card solo indica que cualquier par `epoch_N/step_S/config.json` + `model.safetensors` se carga igual que los drafters publicados en el paper de DSpark, y que debe servirse junto a Qwen/Qwen3-30B-A3B. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de entrenamiento documentados: *world size* 4, batch local 1 y torch 2.9.1 (verificado por los ficheros `training_state` por rank).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `xf15/ssd-dspark-prog-qwen3-30b-a3b-gap4-tail1` | Drafter DSpark, block size 7, 10 capas | no disponible | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Drafters de la familia DSpark publicados en el paper | Drafter de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible | citados en la model card, sin enlace |
| Drafters tipo EAGLE-3 / Medusa para modelos MoE | Cabeza o modulo de borrador | no disponible | no disponible | no disponible | no disponible | no disponible |
| MTP (*multi-token prediction*) nativo del modelo objetivo | Modulo integrado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de parametros, contexto ni rendimiento para las alternativas, por lo que la comparacion cuantitativa no es posible con la informacion proporcionada.

## Limitaciones y advertencias

- Modelo dependiente: el drafter solo funciona con Qwen/Qwen3-30B-A3B; sus *target tap layers* (`[1, 12, 23, 34, 45]`) estan fijadas a la arquitectura de ese modelo objetivo.
- No es un modelo de generacion autonoma: no debe emplearse para tareas de texto, razonamiento o codigo por si solo.
- Licencia no declarada: sin licencia explicita, no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de tasa de aceptacion, *speedup* real ni degradacion de calidad, por lo que el beneficio practico es hipotetico hasta que se mida.
- Madurez y adopcion: 0 descargas y 1 like en el momento de la consulta; no hay senales de validacion por parte de la comunidad.
- Reproducibilidad condicionada: reanudar el entrenamiento exige reconstruir la cache desde `xf15/ssd-perfectblend-qwen3-30b-a3b-regen`, verificar las 1.339.038 filas contra `shuffle_records/source_rows.npy` y usar exactamente torch 2.9.1, ya que las permutaciones dependen de `torch.randperm`.
- Sesgos: no documentados. El drafter hereda las caracteristicas del corpus open-perfectblend regenerado por Qwen3-30B-A3B, pero el autor no publica analisis de sesgo.
- Alucinacion: el riesgo recae sobre el modelo objetivo; no obstante, un drafter mal calibrado puede reducir la tasa de aceptacion y, con ello, anular la ganancia de velocidad sin mejorar la calidad.
- Idiomas: no declarados; el rendimiento multilingue del drafter dependera de la cobertura del corpus de regeneracion, que no se detalla.
- Fecha de publicacion futura en los metadatos (2026-10-01): conviene verificar la integridad y el origen del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xf15/ssd-dspark-prog-qwen3-30b-a3b-gap4-tail1
- Dataset de cache de activaciones: https://huggingface.co/datasets/xf15/ssd-perfectblend-qwen3-30b-a3b-regen
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Paper de DSpark: citado en la model card, sin enlace disponible
- Repositorio de codigo del cache builder de DSpark: mencionado en la model card, sin enlace disponible
