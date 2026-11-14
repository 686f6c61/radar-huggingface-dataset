# w3joe/smolvla-junction-so101-3stage-20261114

## Resumen

SmolVLA Junction SO-101 (3-stage) es un ajuste fino del modelo base `lerobot/smolvla_base`, un modelo de vision-lenguaje-accion (VLA) orientado a control robotico. Lo desarrolla el usuario w3joe y se publica bajo licencia Apache 2.0. El modelo resuelve una tarea de manipulacion concreta: un brazo robotico SO-101 debe recoger un ladrillo Duplo, llevarlo a una camara de inspeccion y depositarlo en un cuenco, en tres fases encadenadas.

El ajuste se realizo sobre 514 demostraciones de teleoperacion (107.343 fotogramas a 30 Hz, formato LeRobot v3), empleando aprendizaje por imitacion con flow matching. La arquitectura parte de SmolVLA, que combina un backbone vision-lenguaje SmolVLM2-500M-Video-Instruct (congelado durante el entrenamiento) con un experto de acciones de 100 M de parametros que si se entrena.

Es relevante como ejemplo reproducible de ajuste fino de un VLA pequeno en menos de una hora sobre cuatro GPUs, con receta, configuracion y log publicados. No obstante, los checkpoints no se han evaluado aun en el robot real, por lo que su exito en tarea no esta verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) SmolVLA: backbone VLM SmolVLM2-500M-Video-Instruct congelado + experto de acciones entrenado, flow matching |
| Parametros totales | 450 M (350 M backbone congelado + 100 M experto de acciones y proyeccion de estado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en BF16) |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoints PyTorch Lightning / Physical AI Studio (`.ckpt`, solo pesos, sin estado del optimizador); no son paquetes `save_pretrained` de LeRobot ni exportaciones OpenVINO |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA: un backbone vision-lenguaje SmolVLM2-500M-Video-Instruct que procesa las imagenes de las camaras y la instruccion textual, acoplado a un experto de acciones que genera secuencias de acciones mediante flow matching. En este ajuste fino se entrena unicamente el experto de acciones y la proyeccion de estado (100 M parametros), mientras que el backbone VLM (350 M) permanece congelado, siguiendo la receta de ajuste fino de SmolVLA en LeRobot.

El entrenamiento uso 514 episodios seleccionados de 517 (se excluyeron los episodios 1, 10 y 464 por inconsistencias), con particion real de 463/51 episodios para entrenamiento y validacion. Se empleo AdamW con lr 1e-4, betas (0.9, 0.95), weight decay 1e-10, recorte de gradiente 10, 1.000 pasos de warmup y decaimiento coseno hasta 2.5e-6 en 20.000 pasos. El batch global fue de 64 (16 por GPU), con precision mixta BF16 y DDP sobre cuatro RTX PRO 6000 Blackwell Server Edition. El entrenamiento duro 55 minutos (unos 0,15 s/paso) y supuso unas 13 pasadas sobre los fotogramas. El chunk de acciones es de 50, ejecutandose los 50 pasos. Las instrucciones se segmentan por fase y los chunks de accion se detienen en cada frontera de etapa para evitar que una instruccion supervise el movimiento de la siguiente.

## Capacidades

- Generacion de acciones roboticas de manipulacion (6 grados de libertad: shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Percepcion visual mediante dos camaras RGB: `wrist` y `top` (imagen completa 640x480, sin recorte).
- Seguimiento de instrucciones por fases: `pick up the brick`, `bring the brick to the inspection camera` y `place the brick in the orange/purple/yellow bowl`.
- Aprendizaje por imitacion con flow matching para generar trayectorias suaves y multimodales.
- No soporta tool calling, function calling, agentes multi-paso ni otras capacidades de texto general: es un modelo especializado en control robotico.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Automatizacion de tareas de pick-and-place en linea de montaje: el modelo ejecuta la secuencia completa de recogida, inspeccion y deposito de piezas Duplo, adecuado por su entrenamiento especifico en esa tarea de tres fases.
- Clasificacion por color en celulas robotizadas: las instrucciones distinguen tres cuencos (naranja, morado, amarillo), lo que permite enrutar piezas a destinos distintos segun una instruccion textual.
- Inspeccion visual intermedia: la segunda fase lleva la pieza a una camara de inspeccion, util en control de calidad donde la pieza debe presentarse ante un sensor antes de su deposito.
- Prototipado rapido de politicas VLA: sirve como referencia reproducible (receta, configuracion y log publicados) para equipos que quieran ajustar SmolVLA a sus propias tareas en menos de una hora con cuatro GPUs.
- Investigacion en aprendizaje por imitacion: la particion de datos documentada y los dos checkpoints (mejor validacion y paso final) permiten estudiar el efecto del sobreajuste y de la seleccion de checkpoint en tareas de manipulacion.
- Despliegue en robot SO-101 de bajo coste: al ser un modelo de 450 M parametros, es viable en estaciones de trabajo con GPU consumer para laboratorios y entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perdidas de validacion:

| Checkpoint | Paso | Perdida de validacion | Notas |
|---|---|---|---|
| `checkpoints/snapshots/step020000.ckpt` | 20.000 | 0,2588 | pesos finales |
| `checkpoints/best/best.ckpt` | 16.000 | 0,2528 | menor perdida de validacion |

El autor advierte explicitamente que la perdida de validacion no mide el exito en tarea y que ningun checkpoint se ha evaluado aun en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parametros en BF16 el peso ronda 0,9 GB, por lo que cabe holgadamente en GPUs consumer, aunque no se documentan requisitos exactos.
- GPU de entrenamiento empleadas: cuatro NVIDIA RTX PRO 6000 Blackwell Server Edition con DDP y precision mixta BF16.
- GPU recomendadas para inferencia: cualquier GPU con al menos unos pocos GB de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- Cabe en GPU consumer: si, por el tamano del modelo, aunque no se detalla la lista de tarjetas validadas.
- Opciones de despliegue: carga mediante Physical AI Studio con `SmolVLA.load_from_checkpoint(...)` en el commit indicado, o exportacion con `physicalai export` usando dos camaras. Los checkpoints no son paquetes `save_pretrained` de LeRobot ni exportaciones OpenVINO, por lo que no se pueden cargar directamente con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA Junction SO-101 (este modelo) | 450 M (100 M entrenados) | no disponible | perdida de validacion 0,2528-0,2588; sin evaluacion en robot | apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` | 450 M | no disponible | no disponible | no disponible en la informacion | Hugging Face (modelo base) |
| Otros VLA de la familia SmolVLA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Los checkpoints no se han evaluado en el robot real; el exito en la tarea esta sin verificar.
- La perdida de validacion no es una medida de exito en tarea y la curva de validacion es ruidosa (solo 16 batches cada 500 pasos).
- El modelo esta especializado en una unica tarea de tres fases con objetos y cuencos concretos; no generaliza a otras tareas sin reentrenamiento.
- Solo acepta instrucciones en ingles y con cadenas exactas predefinidas.
- Solo usa las camaras `wrist` y `top`; la camara de inspeccion y los flujos de profundidad no se emplearon.
- La imagen `top` debe usarse completa (640x480), sin el recorte de 560x480 de pi0.5.
- El estado y las acciones usan el orden y las unidades `.pos` calibradas del grabador; un despliegue con otra calibracion requerira normalizacion equivalente.
- La particion real de entrenamiento/validacion (463/51) difiere de la documentada en `CURATION.json` (464/50), con solo 5 episodios en comun.
- Los checkpoints son solo pesos en formato Physical AI Studio / PyTorch Lightning y no son directamente compatibles con LeRobot `save_pretrained` ni con exportaciones OpenVINO.
- Riesgo de sesgo y alucinacion: no documentado; al ser un modelo de control robotico, los fallos se manifiestan como acciones incorrectas o incompletas, no como texto inventado.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantias de rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/w3joe/smolvla-junction-so101-3stage-20261114
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Backbone VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Checkpoint final: https://huggingface.co/w3joe/smolvla-junction-so101-3stage-20261114/blob/main/checkpoints/snapshots/step020000.ckpt
- Mejor checkpoint: https://huggingface.co/w3joe/smolvla-junction-so101-3stage-20261114/blob/main/checkpoints/best/best.ckpt
- Configuracion de entrenamiento: https://huggingface.co/w3joe/smolvla-junction-so101-3stage-20261114/blob/main/training-config.json
- Receta y codigo: https://huggingface.co/w3joe/smolvla-junction-so101-3stage-20261114/blob/main/recipe.tar.gz
- Log de entrenamiento: https://huggingface.co/w3joe/smolvla-junction-so101-3stage-20261114/blob/main/run.log
- Curacion de datos: https://huggingface.co/w3joe/smolvla-junction-so101-3stage-20261114/blob/main/CURATION.json
- Particion real: https://huggingface.co/w3joe/smolvla-junction-so101-3stage-20261114/blob/main/ACTUAL-SPLIT.json
- Normalizacion: https://huggingface.co/w3joe/smolvla-junction-so101-3stage-20261114/blob/main/TRAIN-NORMALIZATION.json
