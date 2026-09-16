# Travor278/pi05-place-dual-shoes-concurrent-data20260916-lora-10k-e187

## Resumen

Este repositorio contiene un checkpoint de inferencia del modelo PI0.5 (familia OpenPI, de Physical Intelligence) ajustado mediante LoRA para una tarea concreta de robotica: la colocacion concurrente de un par de zapatos ("place-dual-shoes-concurrent"). Lo publica el usuario Travor278 y se distribuye en formato JAX/Orbax, no en safetensors ni GGUF. Se trata de la revision E187, entrenada sobre una version actualizada del dataset `Shiki42/ctr-place-dual-shoes-concurrent-20260916` (revision `7a12c51eaad060b340d0b73afe873de33289467b`), y es un artefacto distinto del modelo E160 anterior del mismo autor.

El interes de esta ficha es acotado y muy tecnico: no es un modelo de lenguaje generalista, sino una politica vision-lenguaje-accion (VLA) para manipulacion robotica en simulacion, pensada para evaluarse o reproducirse dentro del ecosistema OpenPI. El checkpoint incluye unicamente pesos de inferencia (directorio `10000/`), los parametros de normalizacion asociados y ficheros de referencia de configuracion; quedan excluidos el optimizador, el estado de reanudacion del data-loader y los checkpoints de entrenamiento. La base PI0.5 debe obtenerse y verificarse por separado.

La relevancia actual es de tipo metodologico: sirve como ejemplo reproducible de ajuste fino con LoRA sobre un VLA, con recetas concretas (FSDP1, batch 16, 10000 actualizaciones de optimizador, horizonte de accion 50, 12 dimensiones de articulacion) y con la particularidad de que la regla estandar de congelacion LoRA de OpenPI tambien entrena el codificador de vision y las cabezas. No se declara tasa de exito en simulacion ni licencia, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-lenguaje-accion (VLA) basada en PI0.5 dentro del framework OpenPI; detalles internos de la base no disponibles en la informacion proporcionada |
| Parametros totales | no disponible (se distribuye un adaptador LoRA sobre la base PI0.5; los parametros base no estan incluidos) |
| Parametros activos | no aplica (no se describe una arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint JAX/Orbax en la precision del entrenamiento; no se realizo conversion a safetensors) |
| Idiomas soportados | no disponible (no se declaran idiomas; la componente de lenguaje se hereda de la base PI0.5) |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (checkpoint OpenPI); sin safetensors, sin GGUF |
| Horizonte de accion | 50 pasos |
| Dimension de acciones | 12 dimensiones de articulacion: deltas para las articulaciones y valor absoluto para las pinzas |
| Tamano del repositorio | 6,3 GB |
| Dataset de entrenamiento | Shiki42/ctr-place-dual-shoes-concurrent-20260916 (revision 7a12c51eaad060b340d0b73afe873de33289467b) |
| Actualizaciones de optimizador | 10000 |
| Configuracion de entrenamiento | batch 16 por experimento, GA1, FSDP1, semilla 87431, mascara de perdida con temporal padding |
| Commit de OpenPI requerido | 879c3e8c8f6cd5774aef694151dd0eccb1003a53, config `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` |
| Estado del repositorio | 0 descargas, 0 likes; creado y actualizado el 2026-09-16 |

## Arquitectura y entrenamiento

El artefacto es un checkpoint de inferencia de PI0.5 en formato JAX/Orbax, generado con la libreria `openpi`. Sobre la base PI0.5 se aplica un ajuste LoRA siguiendo la receta estandar de OpenPI, con la salvedad explicita de que esa regla de congelacion tambien entrena el codificador de vision y las cabezas del modelo. El entrenamiento parte de una base "fresca", ejecuta 10000 actualizaciones de optimizador con batch 16 por experimento, GA1 (sin acumulacion de gradiente), FSDP1 y semilla 87431. La perdida se enmascara con temporal padding y el espacio de acciones se representa con 12 dimensiones de articulacion, en deltas salvo las pinzas, que se modelan en valor absoluto, con un horizonte de accion de 50 pasos. Dos experimentos independientes compartieron cada GPU H100.

El repositorio es estrictamente de inferencia y reproducible solo parcialmente: incluye los pesos de inferencia, los parametros de normalizacion correspondientes (que deben apuntarse mediante `PARALLELVLA_NORM_ASSETS_DIR` al directorio local `10000/assets`) y una carpeta `source_reference` con ficheros de configuracion y transformacion. No es una instalacion Python autonoma, y la variable `PI05_JAX_BASE` debe apuntar a un directorio de parametros base PI0.5 verificado por separado. El checkpoint de origen supero una recarga independiente en CPU y una comprobacion de parametros finitos, y los ficheros de inferencia se rehashearon antes de la subida (ver `CHECKPOINT_MANIFEST.json`). No se realizo conversion a safetensors y no se declara ninguna innovacion arquitectonica adicional sobre la base PI0.5.

## Capacidades

- Manipulacion robotica en simulacion para la tarea concreta de colocacion de un par de zapatos de forma concurrente.
- Generacion de trayectorias de accion con horizonte de 50 pasos sobre 12 dimensiones de articulacion (deltas articulares y pinzas en absoluto).
- Acondicionamiento por observacion visual y por instruccion, heredado de la base PI0.5, aunque no se documenta el conjunto de idiomas ni el formato exacto de prompt en la informacion disponible.
- Inferencia con parametros de normalizacion incluidos, lo que permite reproducir el preprocesado del dataset de entrenamiento.
- Reanudacion del ajuste fino como punto de partida LoRA para nuevas tareas dentro de OpenPI.
- Soporte de tool calling / function calling: no disponible (no aplica a esta politica robotica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision adicional, audio): no disponible; solo vision-accion segun la informacion proporcionada.

## Casos de uso

- Evaluacion de una politica VLA en simulacion: cargar el directorio `10000/` como `checkpoint_dir` en OpenPI y ejecutar rollout de la tarea de colocacion de zapatos, teniendo en cuenta que el autor no reclama ninguna tasa de exito para este checkpoint y que por tanto la metrica debe medirse localmente.
- Reproduccion de un experimento de ajuste fino con LoRA: el repositorio documenta batch, FSDP1, semilla, horizonte de accion y numero de actualizaciones, lo que permite replicar la receta sobre el mismo dataset (revision fijada) y comparar resultados.
- Punto de partida para una tarea nueva: reutilizar los pesos ajustados como inicializacion LoRA para variantes de la misma familia de tareas de manipulacion, con la ventaja de partir de un modelo ya especializado en representaciones de accion delta mas pinzas absolutas.
- Investigacion sobre representacion de acciones: comparar el esquema de 12 dimensiones con deltas para articulaciones y valores absolutos para pinzas frente a representaciones alternativas, midiendo el efecto en la estabilidad de la politica.
- Estudio del efecto del enmascarado de perdida por temporal padding: la configuracion declarada permite aislar esta decision de diseno en tareas con secuencias de longitud variable.
- Analisis de coste de entrenamiento en hardware limitado: el autor indica que dos experimentos independientes compartieron cada H100, dato util para planificar presupuestos de computo en ajustes LoRA de VLA.
- Integracion en un pipeline interno de investigacion en robotica: al ser un artefacto OpenPI puro, se puede conectar al runtime de OpenPI junto con la base PI0.5 verificada, sin dependencias de safetensors ni de convertidores GGUF.
- Comparacion de revisiones de checkpoint (E160 frente a E187) sobre el mismo benchmark interno, siempre que se disponga del E160 y de una metrica propia, ya que no se publican cifras comparativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito en simulacion para este checkpoint nuevo y que las metricas de entrenamiento estan en la ejecucion E187 alojada en SwanLab. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de exito de tarea, por lo que no se incluye tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- El repositorio ocupa 6,3 GB, pero corresponde solo al checkpoint de inferencia y a los activos de normalizacion; la base PI0.5 debe descargarse aparte y su huella de memoria no se especifica.
- GPU utilizadas en entrenamiento: H100 (dos experimentos independientes compartieron cada H100).
- GPU recomendadas para inferencia: no disponible; no se documentan requisitos minimos ni modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: runtime de OpenPI con backend JAX, usando el commit de codigo fuente `879c3e8c8f6cd5774aef694151dd0eccb1003a53` y la config `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`. No aplican vLLM, llama.cpp, Ollama ni TGI, porque el formato es JAX/Orbax y no hay pesos safetensors ni GGUF.
- Variables de entorno necesarias: `PARALLELVLA_DATASET_REPO`, `PARALLELVLA_NORM_ASSETS_DIR` y, cuando la config lo requiera, `PI05_JAX_BASE`.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (E187, LoRA 10k) | Adaptador LoRA sobre PI0.5; total no disponible | no disponible | place-dual-shoes-concurrent (simulacion) | no disponible | HuggingFace, 6,3 GB, 0 descargas |
| E160 (mismo autor) | Adaptador LoRA sobre PI0.5; total no disponible | no disponible | misma familia de tareas | no disponible | El autor indica que este repositorio es distinto del modelo E160, pero no se incluye enlace en la informacion disponible |
| Base PI0.5 (OpenPI) | no disponible | no disponible | Politica VLA generalista | no disponible en la informacion proporcionada | Debe obtenerse y verificarse por separado; no se incluye en este repositorio |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la comparativa se limita a formato, tarea y disponibilidad.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial queda en situacion juridica indeterminada y requiere consultar al autor.
- No se publica tasa de exito en simulacion ni ninguna metrica de rendimiento para este checkpoint; el autor lo indica de forma explicita.
- Es un artefacto exclusivamente de inferencia: no incluye optimizador, estado del data-loader ni checkpoints de entrenamiento, por lo que no se puede reanudar el entrenamiento tal cual.
- No es una instalacion Python autonoma; requiere el codigo fuente de OpenPI en un commit concreto y una copia verificada de los parametros base PI0.5.
- No hay conversion a safetensors ni a GGUF, lo que descarta los runners de inferencia habituales (vLLM, llama.cpp, Ollama, TGI) y limita su uso al ecosistema JAX/OpenPI.
- Los activos de normalizacion deben coincidir con los del entrenamiento; un desajuste en `PARALLELVLA_NORM_ASSETS_DIR` invalida las predicciones.
- El modelo esta especializado en una unica tarea de simulacion (colocacion concurrente de un par de zapatos) y no se documentan capacidades de generalizacion fuera de ella.
- No se declaran idiomas soportados, sesgos conocidos ni comportamiento ante entradas fuera de distribucion.
- El dataset de entrenamiento esta fijado a una revision concreta; cambios en el dataset invalidan la comparabilidad de resultados.
- Riesgo de alucinacion y de sobreajuste al dominio: al ser una politica VLA especializada, sus fallos se manifestarian como acciones fisicas incorrectas o inseguras en un robot real; no se documenta ninguna evaluacion en hardware fisico.
- El repositorio carece de descargas y valoraciones, y no hay resultados de busqueda web relevantes que aporten validacion externa.
- Las fechas del repositorio (creacion y actualizacion el 2026-09-16) son las declaradas por HuggingFace; conviene verificarlas antes de citarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-concurrent-data20260916-lora-10k-e187
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-place-dual-shoes-concurrent-20260916
- Metricas de entrenamiento (ejecucion E187): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Repositorio OpenPI (framework y commit de referencia `879c3e8c8f6cd5774aef694151dd0eccb1003a53`): https://github.com/Physical-Intelligence/openpi
- Fichero de manifiesto del checkpoint: `CHECKPOINT_MANIFEST.json` dentro del repositorio de HuggingFace
- Nota sobre la busqueda web: no se han encontrado resultados relevantes sobre este modelo; los resultados devueltos no guardan relacion con el artefacto.
