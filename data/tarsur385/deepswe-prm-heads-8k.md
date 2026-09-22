# tarsur385/deepswe-prm-heads-8k

## Resumen

DeepSWE PRM heads (Qwen3-8B, 8k) es un conjunto de cabezas de proyeccion para un modelo de recompensa de proceso (process reward model, PRM), publicado por el usuario tarsur385. No es un modelo generativo autonomo: el repositorio (0,2 GB) contiene unicamente los checkpoints de las cabezas `state_head`, `action_head`, `logit_scale` y `cfg`, que se aplican sobre las representaciones de un backbone Qwen3-8B previamente entrenado. El modelo se enmarca en el ecosistema DeepSWE, orientado a verificar y puntuar trayectorias de agentes de ingenieria de software (SWE-agent).

El problema que resuelve es la verificacion a nivel de paso en tareas de resolucion automatica de incidencias de codigo. En lugar de evaluar solo el resultado final, las cabezas puntuan estados y acciones intermedias, lo que permite tecnicas de seleccion Best-of-N sobre multiples trayectorias generadas por un agente. Esto es relevante porque la fiabilidad de los agentes SWE depende en gran medida de la capacidad de descartar soluciones plausibles pero incorrectas antes de ejecutarlas.

Tecnicamente, el checkpoint de cabezas se ha ajustado desde `jackyk02/qwen3_8b_head` (`qwen3_8b_midtrained_head.pt`) sobre el dataset `tarsur385/deepswe-prm-train-embeddings-8k`, con validacion cruzada por folds. El sufijo "8k" del nombre hace referencia a una ventana de contexto de aproximadamente 8.000 tokens. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de proyeccion CLM (state_head, action_head, logit_scale, cfg) sobre backbone Qwen3-8B |
| Parametros totales | No disponible para las cabezas; el backbone subyacente es Qwen3-8B (8 000 millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8k tokens (segun el sufijo "8k" del nombre del checkpoint) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (.pt): state_head, action_head, logit_scale, cfg |

## Arquitectura y entrenamiento

El artefacto publicado son tres cabezas de proyeccion de un modelo de aprendizaje contrastivo (CLM), no un transformer completo. Cada cabeza se inicializa desde `qwen3_8b_midtrained_head.pt`, un checkpoint intermedio del proyecto `jackyk02/qwen3_8b_head`, y se ajusta con el script `train/finetune_prm_head.py` sobre el dataset de embeddings `tarsur385/deepswe-prm-train-embeddings-8k`. La variante `--task prm` indica que el objetivo de entrenamiento es actuar como process reward model (puntuacion de pasos intermedios de una trayectoria de agente).

El entrenamiento emplea validacion cruzada por folds: la cabeza `fold{k}` excluye las tareas listadas en `folds/fold{k}.json`, y el fichero `fold_spec.json` mapea cada cabeza con las tareas que le corresponden. Este esquema de holdout por conjuntos de tareas busca medir la generalizacion del verificador a tareas no vistas durante el ajuste. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Puntuacion de recompensa a nivel de proceso: evalua estados y acciones intermedias de una trayectoria de agente, no solo el resultado final.
- Verificacion de trayectorias de agentes SWE (resolucion de incidencias sobre repositorios de codigo).
- Seleccion Best-of-N: permite ordenar y elegir la mejor candidata entre varias trayectorias generadas por un agente.
- Reutilizacion como verificador en pipelines de evaluacion (`evaluation/bon_deepswe_eval.py`).
- Ajuste con validacion cruzada por folds, lo que facilita comparaciones entre particiones de tareas.
- Capacidades generativas: no aplica; el modelo no produce texto por si mismo y requiere el backbone Qwen3-8B para calcular embeddings.
- Tool calling / function calling: no disponible como capacidad propia del artefacto.
- Capacidades multilingues: no disponible.
- Otras capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Seleccion Best-of-N en agentes SWE: dado un conjunto de trayectorias candidatas para una misma incidencia, se usan las cabezas para puntuarlas y seleccionar la de mayor recompensa de proceso, reduciendo el riesgo de aplicar parches incorrectos.
- Verificacion previa a la ejecucion de un parche: el modelo permite descartar trayectorias que incluyen pasos inconsistentes antes de lanzar pruebas costosas en un entorno de integracion continua.
- Filtrado y curacion de datos de entrenamiento: las cabezas pueden etiquetar trayectorias generadas por agentes para construir conjuntos de datos de alta calidad, conservando solo las que superan un umbral de recompensa.
- Investigacion en modelos de recompensa de proceso: sirve como punto de partida reproducible para comparar estrategias de verificacion por pasos frente a verificadores de resultado final.
- Entrenamiento por refuerzo con recompensa modelada: las puntuaciones de proceso pueden alimentar un bucle de RL o de optimizacion de politicas de agente, siempre que se integre con el codigo del proyecto `contrastive_learning`.
- Evaluacion comparativa de agentes: permite medir de forma objetiva la calidad de distintas politicas de agente sobre el mismo conjunto de tareas, usando `fold_spec.json` para mantener la separacion entre folds.
- Analisis de errores: al puntuar pasos concretos, facilita localizar en que punto de una trayectoria el agente se desvia, lo que resulta util para depurar prompts o herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Las cabezas en si ocupan aproximadamente 0,2 GB (tamano total del repositorio) y pueden almacenarse y cargarse en CPU.
- Para generar los embeddings de entrada se necesita el backbone Qwen3-8B, con requisitos de hardware propios de un modelo de 8 000 millones de parametros. Estimaciones habituales para esa clase de modelo (no confirmadas por el autor): en torno a 16 GB de VRAM en FP16/BF16, y aproximadamente 6-8 GB en cuantizacion de 4 bits.
- GPU recomendadas para el backbone Qwen3-8B: A100, H100, L40S o equivalentes. Con cuantizacion, cabe en GPUs de consumo como RTX 4090 (24 GB) e incluso en tarjetas de 8-12 GB en 4 bits.
- Despliegue: el flujo documentado usa PyTorch y HuggingFace (`hf download`) junto con los scripts del repositorio `jackyk02/contrastive_learning`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| tarsur385/deepswe-prm-heads-8k | Cabezas PRM (verificador) | Qwen3-8B | ~8k | MIT | Publicado; 0 descargas, 0 likes |
| jackyk02/qwen3_8b_head | Checkpoint de cabezas (inicializacion) | Qwen3-8B | No disponible | No disponible | Checkpoint de partida del ajuste |
| Otros verificadores / PRM de la misma categoria | PRM o reward model | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento (benchmarks, exactitud o tasas de acierto) que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el backbone Qwen3-8B y el codigo de `contrastive_learning`, los checkpoints de cabezas no son utilizables.
- El artefacto esta especializado en tareas del dominio DeepSWE; su comportamiento fuera de ese tipo de tareas SWE no esta documentado.
- La ventana de contexto es de aproximadamente 8.000 tokens, lo que limita la longitud de las trayectorias o historiales que se pueden procesar de una vez.
- El ajuste se ha realizado con validacion cruzada por folds, lo que sugiere un conjunto de datos limitado; existe riesgo de sobreajuste a la distribucion de tareas del dataset de entrenamiento.
- No se documentan sesgos conocidos, comportamiento multilingue ni tasas de alucinacion del verificador.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion por parte de la comunidad.
- La licencia MIT permite uso comercial y modificacion, pero se ofrece sin garantias; conviene revisar las dependencias del proyecto asociado antes de integrarlo en produccion.
- Los metadatos indican una fecha de creacion de 2026-09-21, posterior a la fecha actual de consulta; conviene verificar la vigencia y el estado real del repositorio.
- Los resultados de la busqueda web realizada no aportan informacion tecnica relevante sobre el modelo; no se han localizado publicaciones, papers ni demos asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarsur385/deepswe-prm-heads-8k
- Dataset de entrenamiento: https://huggingface.co/datasets/tarsur385/deepswe-prm-train-embeddings-8k
- Dataset de embeddings de evaluacion: https://huggingface.co/datasets/tarsur385/deepswe-prm-embeddings-8k
- Checkpoint de inicializacion de las cabezas: https://huggingface.co/jackyk02/qwen3_8b_head
- Repositorio de codigo asociado: https://github.com/jackyk02/contrastive_learning
