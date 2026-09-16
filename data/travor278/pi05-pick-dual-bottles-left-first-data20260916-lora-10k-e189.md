# Travor278/pi05-pick-dual-bottles-left-first-data20260916-lora-10k-e189

## Resumen

Este repositorio contiene un checkpoint de inferencia de la politica pi0.5 (familia OpenPI) especializado en una unica tarea robotica de manipulacion: recoger dos botellas, empezando por la izquierda ("pick-dual-bottles-left-first"). Lo publica el usuario Travor278 y esta entrenado sobre el dataset de simulacion `Shiki42/ctr-pick-dual-bottles-left-first-20260916`, con un ajuste fino mediante LoRA sobre una base pi0.5 fresca. No es un modelo de lenguaje: es una politica vision-language-action (VLA) que produce acciones motoras, y se distribuye en formato de checkpoint JAX/Orbax para la libreria OpenPI, sin conversion a safetensors.

El checkpoint corresponde a 10.000 actualizaciones del optimizador con batch de 16 por experimento, semilla 87431 y horizonte de accion de 50 pasos. Se entrenaron dos experimentos independientes que compartieron sendas GPU H100, bajo la regla estandar de congelacion LoRA de OpenPI (que ademas entrena el encoder de vision y las cabezas). Solo se incluyen los parametros de inferencia y los activos de normalizacion; se excluyen el estado del optimizador, el estado de reanudacion del cargador de datos y los checkpoints de entrenamiento.

Su relevancia es acotada pero concreta: sirve como artefacto reproducible para investigacion en robotica con OpenPI, como referencia de configuracion (nombre historico `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` frente a la tarea real) y como punto de partida para evaluar generalizacion de LoRA sobre pi0.5. El autor no reclama ninguna tasa de exito en simulacion para este checkpoint, y el repositorio no declara licencia, idiomas ni numero de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Es una politica pi0.5 (vision-language-action) de OpenPI sobre JAX/Orbax; el autor no detalla la arquitectura subyacente. La regla LoRA empleada entrena tambien el encoder de vision y las cabezas |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (horizonte de accion: 50 pasos; 12 dimensiones articulares representadas como delta, con pinzas en valores absolutos) |
| Tipos de cuantizacion | No disponible. No se realizo conversion a safetensors; el checkpoint se distribuye en formato JAX/Orbax |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | JAX/Orbax (checkpoint OpenPI, directorio `10000/` como `checkpoint_dir`); sin conversion a safetensors |

Datos adicionales del repositorio: tamano de 6,3 GB, pipeline `robotics`, 0 descargas y 0 likes, creado y actualizado el 2026-09-16.

## Arquitectura y entrenamiento

El artefacto es un ajuste fino LoRA sobre una base pi0.5 "fresca" (fresh base), es decir, partiendo de los parametros base y no de un ajuste previo. El entrenamiento consistio en 10.000 actualizaciones del optimizador, con batch de 16 por experimento, acumulacion de gradiente 1 (GA1), FSDP1, semilla 87431 y horizonte de accion de 50. La representacion de acciones usa 12 dimensiones articulares como delta y las pinzas en valor absoluto, con mascara de perdida por relleno temporal (temporal-padding loss mask). Se ejecutaron dos experimentos independientes que compartieron una GPU H100 cada uno.

La revision del dataset utilizada es `d9e098ae2857195f2dc1c4aa099c9c68bb8b7935`. El autor indica que el checkpoint fuente supero una recarga independiente en CPU y una comprobacion de parametros finitos, y que los archivos de inferencia se re-hashearon antes de la subida (ver `CHECKPOINT_MANIFEST.json`). No se documenta composicion del dataset, numero de tokens ni uso de RLHF/DPO, y no se realizo conversion a safetensors. El repositorio incluye los archivos de referencia de configuracion y transformacion en `source_reference`, pero no es una instalacion Python autonoma: requiere el commit de OpenPI `ed53fee10620581a46875aeda6e7ef2649d9f083` y, cuando la configuracion lo exija, que `PI05_JAX_BASE` apunte a un directorio de parametros base PI0.5 verificado por separado.

## Capacidades

- Generacion de acciones motoras para una tarea de manipulacion concreta: recoger dos botellas empezando por la izquierda, con horizonte de accion de 50 pasos y 12 dimensiones articulares.
- Inferencia sobre observaciones visuales: la regla LoRA aplicada entrena el encoder de vision y las cabezas, por lo que el checkpoint incluye componentes visuales ajustados.
- Uso de activos de normalizacion propios: se incluyen los parametros de inferencia completos y los activos de normalizacion correspondientes (`10000/assets`).
- Ejecucion en simulacion: etiquetado como `simulation`, con el dataset de entrenamiento alojado en HuggingFace.
- Tool calling / function calling: no disponible; no es una capacidad propia de una politica VLA de este tipo y el autor no la documenta.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponible. Solo se documenta la dimension vision-language-action implicita en pi0.5.

## Casos de uso

- Reproduccion de experimentos OpenPI: cargar el directorio `10000/` como `checkpoint_dir` con el commit de OpenPI `ed53fee10620581a46875aeda6e7ef2649d9f083` y la configuracion `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` permite replicar la inferencia exacta reportada por el autor.
- Punto de partida para nuevos ajustes LoRA: al ser un fine-tune sobre base fresca de 10.000 pasos, sirve como inicializacion para variantes de la tarea (por ejemplo, cambiar el orden de recogida o anadir objetos) sin partir de cero.
- Validacion de canalizacion de datos y normalizacion: configurando `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` se puede verificar que el pipeline de activos de normalizacion del dataset `Shiki42/ctr-pick-dual-bottles-left-first-20260916` funciona de extremo a extremo.
- Comparacion de regimenes de entrenamiento en robotica: el par de experimentos con batch 16, FSDP1 y semilla 87431 sirve para estudiar variabilidad entre ejecuciones bajo la misma receta.
- Auditoria de integridad de checkpoints: el manifiesto (`CHECKPOINT_MANIFEST.json`) y la comprobacion de parametros finitos en CPU permiten usar el repositorio como caso de prueba en herramientas de verificacion de artefactos JAX/Orbax.
- Docencia y demostraciones de VLA: para ilustrar como se estructura un checkpoint de inferencia de OpenPI (sin optimizador ni estado de reanudacion) y que ficheros son imprescindibles para desplegar la politica.
- Referencia negativa de evaluacion: dado que el autor no reclama tasa de exito, el checkpoint es util como ejemplo de como no deben presentarse resultados de simulacion sin metricas asociadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ninguna tasa de exito en simulacion para este nuevo checkpoint. Las unicas metricas accesibles son las de entrenamiento, alojadas en la ejecucion E189 del proyecto `https://swanlab.cn/@Travor/CTR-PI05-LoRA10k`, cuya lectura no se detalla en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, el repositorio ocupa 6,3 GB, lo que da una cota inferior orientativa (los pesos de inferencia caben holgadamente en una GPU con 8-12 GB), pero el autor no publica cifras de memoria, latencia ni throughput.
- GPU recomendadas: en entrenamiento se usaron GPU H100, una por experimento. Para inferencia no se especifica modelo de GPU.
- GPU de consumo: no confirmado. No hay datos publicados sobre ejecucion en RTX 4090, 3090 u otras tarjetas de consumo; la viabilidad depende del backend OpenPI/JAX y no viene garantizada por el autor.
- Opciones de despliegue: OpenPI con JAX/Orbax (unica ruta documentada). No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Verificaciones previas al despliegue: el checkpoint paso recarga independiente en CPU y comprobacion de parametros finitos; se exige `PI05_JAX_BASE` apuntando a parametros base PI0.5 verificados y el uso de `10000/` como `checkpoint_dir`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 pick-dual-bottles-left-first, E189) | No disponible | Horizonte de accion 50 pasos | Sin tasa de exito declarada; metricas de entrenamiento en SwanLab | No disponible | HuggingFace, 0 descargas, 0 likes |
| Base pi0.5 (referenciada via `PI05_JAX_BASE`) | No disponible | No disponible | No disponible | No disponible | Requiere directorio de parametros verificado por separado |
| Ejecucion E162 del mismo autor (`Travor278`, pi05 LoRA 10k) | No disponible | No disponible | No disponible | No disponible | Repositorio separado segun el autor |

No se dispone de datos suficientes para comparar con alternativas de otros autores dentro de la misma categoria (politicas VLA para tareas de pick-and-place). La informacion proporcionada no incluye parametros, contexto, rendimiento ni licencia de los modelos de referencia.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea y distribucion de escena ("pick dual bottles left first"), por lo que no cabe esperar generalizacion a otras tareas, objetos o entornos sin reentrenamiento.
- Ausencia de metricas: no se declara tasa de exito en simulacion ni en real, de modo que no hay evidencia publica de que la politica funcione correctamente.
- Licencia no disponible: al no declararse licencia, no puede asumirse uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier uso productivo.
- Brecha simulacion-real: el entrenamiento se realizo en simulacion (tag `simulation`), sin evidencia de transferencia a un robot fisico.
- Dependencias estrictas: el checkpoint no es autonomo. Exige el commit de OpenPI `ed53fee10620581a46875aeda6e7ef2649d9f083`, las variables `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR`, y un directorio base `PI05_JAX_BASE` verificado externamente. La configuracion conserva un nombre historico (`pi05_putcab_athenb_...`) que no coincide con la tarea real, lo que puede inducir a error.
- Sin conversion a safetensors: la ausencia de safetensors limita la interoperabilidad con herramientas que esperan ese formato.
- Estado incompleto para reanudar entrenamiento: se excluyen el optimizador, el estado del cargador de datos y los checkpoints de entrenamiento; solo sirve para inferencia.
- Sesgos conocidos: no disponibles. No se documenta composicion del dataset, balance de escenas ni posibles sesgos de los datos de simulacion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones incorrectas o inconsistentes sin metrica que lo acote.
- Idiomas y contexto: no disponibles; no hay informacion sobre instrucciones textuales soportadas.
- Validacion social nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-pick-dual-bottles-left-first-data20260916-lora-10k-e189
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-left-first-20260916
- Metricas de entrenamiento (SwanLab, ejecucion E189): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Manifiesto de integridad: `CHECKPOINT_MANIFEST.json` (incluido en el propio repositorio de HuggingFace)
- Referencias de configuracion y transformacion: directorio `source_reference` del repositorio
- Busqueda web: no se han encontrado enlaces relevantes sobre el modelo, OpenPI ni pi0.5 en los resultados disponibles; los resultados devueltos corresponden a un sitio de cartas coleccionables sin relacion con el modelo.
