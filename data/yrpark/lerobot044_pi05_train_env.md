# yrpark/lerobot044_pi05_train_env

## Resumen

`yrpark/lerobot044_pi05_train_env` no es un checkpoint de modelo, sino un repositorio de documentacion y entorno de entrenamiento publicado por el usuario `yrpark`. Su contenido es una guia reproducible para instalar LeRobot 0.4.4 y afinar la politica pi0.5 (`pi05`) del ecosistema openpi sobre nuevas maquinas, con instrucciones generalizadas para entrenar multiples tareas de robotica. El repositorio tiene 0 descargas y 0 likes, y se creo el 13 de septiembre de 2026.

El valor practico del repositorio esta en documentar dos trampas que, segun su autor, hacen fallar el entrenamiento de inmediato: la necesidad de instalar la rama parcheada de transformers (`fix/lerobot_openpi`) mediante el extra `pi` de LeRobot 0.4.4, y la obligacion de fijar la revision `9e55186ad3` de `lerobot/pi05_base`, porque la revision `main` incorpora un paso de preprocesado (`relative_actions_processor`) que no existe en el registro de LeRobot 0.4.4.

El entorno declarado como validado es 2x RTX A6000 de 48 GB con CUDA 12.x y conda, usando ruedas de torch 2.10 (cu12.8) que tambien funcionan en A100 (sm_80). La guia incluye un comando de entrenamiento multi-GPU con `accelerate launch`, hiperparametros heredados de la configuracion de `pi05_base`, requisitos del dataset y una tabla de resolucion de errores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como tal; el repositorio documenta el entrenamiento de la politica pi0.5 (pi05) de LeRobot, que combina codificador de vision SigLIP, tokenizacion de estado/acciones y politica transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que pi05 sea un modelo MoE) |
| Longitud de contexto | no disponible; la configuracion de entrenamiento usa `tokenizer_max_length=200` y `n_obs_steps=1` |
| Tipos de cuantizacion | no disponible; el entrenamiento documentado usa `bfloat16`, sin cuantizaciones de inferencia documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; descarga `lerobot/pi05_base`) |
| Tipo de repositorio | Guia de entorno de entrenamiento (no es un checkpoint de modelo) |
| Version de LeRobot | 0.4.4 |
| Extra de instalacion | `lerobot[pi]==0.4.4` |
| Dependencia critica | `transformers` 4.53.3 desde la rama `fix/lerobot_openpi` de Hugging Face |
| Checkpoint base | `lerobot/pi05_base`, revision fijada `9e55186ad3` |
| Dataset soportado | LeRobotDataset v3.0 (`codebase_version: v3.0`) |
| Dimensionalidad soportada | `max_state_dim=32`, `max_action_dim=32` (con padding) |
| Hardware validado | 2x RTX A6000 48 GB; ruedas torch 2.10 (cu12.8) validas en A100 (sm_80) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna de pi05, pero si revela piezas de su pila tecnica: el script de verificacion importa `PI05Policy` desde `lerobot.policies.pi05.modeling_pi05` y comprueba la sustitucion del codificador de vision SigLIP (`transformers.models.siglip`), lo que confirma que pi05 integra un encoder visual SigLIP ademas de tokenizadores de estado y de acciones (`pi05_prepare_state_tokenizer_processor_step`, `tokenizer_processor`). Los flags de entrenamiento permiten congelar el encoder de vision (`freeze_vision_encoder`) y entrenar solo el experto (`train_expert_only`), ambos desactivados por defecto en la plantilla propuesta. La politica predice trozos de acciones (`chunk_size=50`, `n_action_steps=50`) a partir de una unica observacion (`n_obs_steps=1`).

El flujo de ajuste fino parte del checkpoint `pi05_base` en la revision `9e55186ad3` (fechada el 22 de enero de 2026, inmediatamente anterior al commit `7de663972b` "Add relative action processor steps" del 3 de junio de 2026). La configuracion heredada de `pi05_base` fija AdamW con learning rate 2.5e-5, betas (0.9, 0.95), weight decay 0.01 y grad clip 1.0; scheduler coseno con 1000 pasos de warmup y decaimiento de 30000 pasos hasta 2.5e-6; normalizacion de estado y acciones por cuantiles y de visual por identidad. El entrenamiento documentado usa `accelerate launch` con precision mixta bf16, `compile_model=true`, `gradient_checkpointing=true`, 30000 pasos y guardado cada 5000.

Los requisitos de datos son estrictos: LeRobotDataset v3.0 con `meta/info.json` compatible, features de camara, estado y accion alineadas con la entrada de la politica, y almacenamiento local en NVMe recomendado. El ejemplo verificado usa un dataset UR7e con `observation.images.third_person`, `observation.images.eye_in_hand` (3x480x640), `observation.state` (24 dimensiones), `action` (22 dimensiones) y 50 fps.

## Capacidades

- Entrenamiento y ajuste fino de la politica robotica pi0.5 (pi05) sobre tareas de manipulacion con LeRobot 0.4.4.
- Entrenamiento distribuido multi-GPU mediante DDP con `accelerate launch --num_processes`.
- Soporte de precision mixta bf16, `torch.compile` y gradient checkpointing durante el entrenamiento.
- Carga de datasets en formato LeRobotDataset v3.0 con backend de video `pyav`.
- Adaptacion a distintas tareas variando unicamente la ruta del dataset y el directorio de salida (plantilla generalizada).
- Diagnostico de fallos de instalacion y de compatibilidad de versiones mediante tabla de resolucion de problemas.
- Verificacion programatica del entorno (version de LeRobot, disponibilidad de CUDA, numero de GPUs y comprobacion de la sustitucion de SigLIP).
- No se documentan capacidades de generacion de texto, codigo, vision general, audio, tool calling ni agentes; se trata de un entorno de entrenamiento, no de un modelo de proposito general.

## Casos de uso

- Puesta en marcha de un servidor nuevo: la guia permite reproducir el entorno de entrenamiento de pi05 en una maquina distinta (por ejemplo, A100) sin repetir el descubrimiento de las dos incompatibilidades de version que rompen el arranque.
- Ajuste fino de politicas de manipulacion robotica: el comando de entrenamiento es reutilizable para multiples tareas cambiando `DATAROOT` y `OUTDIR`, lo que sirve para entrenar brazos tipo UR7e u otros robots con datasets v3.0.
- Estandarizacion de entornos en un laboratorio: fija versiones exactas (LeRobot 0.4.4, transformers parcheado, revision concreta del checkpoint base) y reduce la deriva entre maquinas y entre miembros del equipo.
- Integracion en pipelines de formacion automatizada: al ser un procedimiento con variables sustituibles, se puede envolver en scripts o contenedores para lanzar entrenamientos por lotes de varias tareas.
- Depuracion de errores de compatibilidad: la tabla de troubleshooting asocia sintomas concretos (`ValueError` de transformers, `KeyError` del procesador de acciones, OOM, logs de autotune) con causas y soluciones, util para reducir tiempo de inactividad.
- Escalado de entrenamiento single-GPU a multi-GPU: documenta la semantica de `--batch_size` como valor por proceso y como calcular el batch efectivo, lo que evita errores de configuracion al ampliar el numero de GPUs.
- Formacion de nuevos investigadores: la verificacion paso a paso del entorno y la explicacion de los fallos tipicos sirven como material de onboarding reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de exito de tarea, tasas de exito en simulacion o en robot real, ni comparaciones numericas con otras politicas.

## Requisitos de hardware

- VRAM: no se especifica una cifra concreta. El autor valida el procedimiento en 2x RTX A6000 de 48 GB por GPU y senala que la A100 de 80 GB tiene "mucho margen" para aumentar el batch por GPU.
- GPU recomendadas segun la documentacion: RTX A6000 (48 GB), A100 (sm_80) y, por extension, cualquier GPU compatible con las ruedas de torch 2.10 (cu12.8).
- CUDA: driver 12.x; las ruedas cu12.8 funcionan tambien en A100 (sm_80).
- GPU de consumo: no se documenta compatibilidad. El hecho de que el entorno validado use GPUs de 48 GB y de que se recomiende `gradient_checkpointing=true` sugiere que no esta pensado para GPUs de consumo, pero no hay datos confirmados.
- Despliegue y ejecucion: el entrenamiento se lanza con `lerobot-train` bajo `accelerate launch` (DDP). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo de lenguaje.
- Almacenamiento: se recomienda situar el dataset en NVMe local y apuntarlo con `--dataset.root` para evitar almacenamiento de red lento.
- Latencia y throughput: no disponible. `torch.compile` con `compile_model=true` introduce una fase de calentamiento con trazas `AUTOTUNE`/`triton_mm` antes del primer paso efectivo de entrenamiento.

## Comparativa con modelos similares

No hay datos numericos disponibles para comparar. A continuacion se contrastan las variantes implicadas segun la informacion del repositorio.

| Alternativa | Relacion | Version / revision | Compatible con LeRobot 0.4.4 | Licencia |
|---|---|---|---|---|
| Este repositorio (`yrpark/lerobot044_pi05_train_env`) | Entorno de entrenamiento para pi05 | No aplica | Si (entorno especifico para 0.4.4) | no disponible |
| `lerobot/pi05_base` revision `9e55186ad3` | Checkpoint base recomendado | 2026-01-22 | Si | no disponible |
| `lerobot/pi05_base` revision `main` | Checkpoint base mas reciente | Incluye `relative_actions_processor` | No (falla con `KeyError`) | no disponible |
| Politica pi0 (`pi0`) | Familia relacionada citada en los tags del repositorio | No especificada | No especificado | no disponible |

No se dispone de datos de rendimiento, parametros ni contexto para establecer una comparacion cuantitativa con politicas alternativas como ACT, SmolVLA u otras integradas en LeRobot.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: es documentacion de entorno. No se puede desplegar directamente como politica.
- La documentacion esta redactada integramente en coreano, lo que limita su accesibilidad para equipos hispanohablantes.
- Depende de una rama no estable de transformers (`fix/lerobot_openpi` del repositorio de Hugging Face), instalada desde codigo fuente; esto requiere acceso a red y anade fragilidad a la reproducibilidad a largo plazo.
- Requiere fijar la revision `9e55186ad3` de `lerobot/pi05_base`. Usar `main` provoca un fallo por un paso de preprocesado no registrado en 0.4.4; cualquier actualizacion del checkpoint base puede volver a romper el procedimiento.
- Fijar LeRobot exactamente en 0.4.4 limita el acceso a correcciones y mejoras posteriores de la libreria.
- No se declara licencia para el repositorio, por lo que las condiciones de uso comercial y redistribucion son indeterminadas.
- La semantica de `--batch_size` en entrenamiento distribuido de LeRobot es por proceso, no global; configurarlo mal altera el batch efectivo y el comportamiento del entrenamiento.
- El uso de `torch.compile` genera una fase de calentamiento prolongada que puede confundirse con un cuelgue; tambien incrementa el consumo de memoria y puede provocar OOM.
- No hay ninguna validacion publicada de calidad de las politicas resultantes: el repositorio documenta que el entorno funciona, no que el modelo entrene bien ni que alcance un rendimiento determinado.
- Las fechas del repositorio (creacion en 2026-09-13) y de las revisiones citadas son posteriores a la fecha habitual de referencia de este tipo de fichas; conviene verificar su vigencia antes de reutilizar el procedimiento.
- El ejemplo de dataset citado (UR7e con `observation.state` de 24 dimensiones y `action` de 22) es solo ilustrativo; otras configuraciones de robot exigen adaptar las features de entrada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yrpark/lerobot044_pi05_train_env
- Checkpoint base citado: https://huggingface.co/lerobot/pi05_base
- Rama parcheada de transformers: https://github.com/huggingface/transformers.git (rama `fix/lerobot_openpi`)
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces devueltos correspondian a paginas de ayuda de YouTube y no guardan relacion con el contenido de esta ficha.
