# tinkerbuggy/duck-droids-dynamixel

## Resumen

`duck-droids-dynamixel` es una coleccion de politicas de control entrenadas mediante aprendizaje por refuerzo para un robot bipedo abierto con forma de pato, la version "all-Dynamixel" del proyecto duck-droids. El modelo lo publica el usuario tinkerbuggy en Hugging Face y esta formado por multiples ficheros ONNX, cada uno correspondiente a una habilidad concreta (mantenerse de pie, sentarse y levantarse, caminar o reproducir emociones), en lugar de un unico modelo generativo. El robot objetivo monta servos ROBOTIS XL330-M288 en caderas, rodillas, tobillos, cuello y cabeza, y una Raspberry Pi Zero 2 W en la cabeza que ejecuta las politicas en tiempo real.

Las politicas se entrenaron en mjlab (MuJoCo Warp) con PPO de rsl_rl, dentro de milli-rl, un fork de microduck_rl de Pollen Robotics. Cada fichero `.onnx` va acompanado de un `.json` que describe los bloques de entrada en orden, el orden de articulaciones, la pose de referencia, los numeros de servo usados en entrenamiento y el checkpoint de origen. Es relevante para quien trabaje en robotica de bajo coste porque demuestra que un bipedo pequeno con actuadores de gama hobby puede estabilizarse con politicas de RL cuando se entrena sobre un modelo de actuador medido (BAM) en lugar de un modelo idealizado.

No se trata de un modelo de lenguaje ni de un modelo multimodal: no procesa texto, no genera lenguaje y no tiene ventana de contexto en el sentido habitual. Su "entrada" son observaciones de estado del robot (angulos de articulacion, IMU, comandos) y su "salida" son consignas de posicion para los servos. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas de control por aprendizaje por refuerzo (PPO con rsl_rl) exportadas a ONNX; no es un transformer ni un modelo generativo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`), con fichero `.json` de metadatos por politica |

## Arquitectura y entrenamiento

Cada politica es una red neuronal de control entrenada con PPO (rsl_rl) sobre el simulador mjlab, basado en MuJoCo Warp, dentro del entorno milli-rl derivado de microduck_rl de Pollen Robotics. El repositorio agrupa varias politicas especializadas: `stand_bam.onnx` (postura estable con gestos de cabeza), `stand_emote_calm.onnx` y variantes `stand_emote` / `stand_emote_smooth` (postura con 13 emociones), `stand_nod`, `stand_imu` y `stand_hand` (versiones anteriores de mantenimiento de postura), `sitstand`, `sitstand2` y `sitstand3` (habilidad de sentarse y levantarse), y `walk_imu`, `walk_style` y `walk_blind` (marchas por velocidad). Tambien incluye `groundpick_beak.onnx`, un experimento de recogida del suelo con el pico que no lleva JSON asociado.

La innovacion tecnica principal es el uso de modelos de actuador medidos: las tareas "Bam" se entrenan sobre el modelo XL330 de Pollen (BAM, Better Actuator Models, de Rhoban, variante `xl330` m6). Segun la model card, las politicas entrenadas sobre un modelo de motor simple hacian vibrar al pato real hasta los limites del servo en el momento de la transferencia, mientras que las entrenadas con BAM se mantienen de pie. No se documentan el numero de tokens ni la composicion de un dataset, porque no aplica: los datos son trayectorias de simulacion. Tampoco se detallan el numero de pasos de entrenamiento ni hiperparametros de PPO.

## Capacidades

- Mantenimiento de postura erguida estable, con recuperacion ante empujones (`stand_bam.onnx`).
- Gestos de cabeza asociados a comandos: asentir con X, decir "si" con Y, decir "no" con B.
- Reproduccion de 13 emociones sobre los botones RB/LB mientras esta de pie, con pasos de recuperacion (`stand_emote_calm.onnx`).
- Reproduccion de las mismas 13 emociones en cabeza y pico estando sentado (sin modelo asociado, segun la tabla de la model card).
- Habilidad de sentarse y levantarse (`sitstand`, `sitstand2`, `sitstand3`).
- Marchas controladas por velocidad (`walk_imu`, `walk_style`, `walk_blind`), aunque la model card advierte que no estan entrenadas con BAM y no estan probadas en el robot real.
- Experimentos de recogida del suelo con el pico (`groundpick_beak.onnx`).
- Ejecucion en hardware embebido: las politicas estan pensadas para correr en una Raspberry Pi Zero 2 W.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Control de postura en un bipedo de bajo coste: `stand_bam.onnx` mantiene al pato de pie y absorbe empujones, lo que sirve como base de demostracion para plataformas docentes con servos XL330.
- Interaccion social basica en robotica de compania: `stand_emote_calm.onnx` reproduce 13 emociones con la cabeza y el pico mientras el robot permanece estable, util en demos de museo o ferias.
- Rutinas de arranque y apagado: la serie `sitstand` permite pasar de la posicion sentada a la erguida mediante `run_policy.py --rise-model`, util para secuencias automaticas de encendido.
- Investigacion en transferencia sim-a-real: el contraste entre politicas entrenadas con modelo de motor simple y con BAM sirve para estudiar el efecto del modelado de actuador en el exito de la transferencia.
- Docencia en aprendizaje por refuerzo: el par `.onnx` + `.json` documenta entradas, orden de articulaciones y pose de referencia, lo que facilita usar las politicas como ejemplo reproducible de PPO en robotica.
- Prototipado de marcha: las politicas `walk_*` permiten experimentar con control de velocidad en simulacion antes de reentrenar con BAM para el robot real.
- Despliegue en computo embebido: el formato ONNX y el objetivo Raspberry Pi Zero 2 W permiten integrar la inferencia en un pipeline ligero sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe cualitativamente el comportamiento en el robot real (por ejemplo, que `stand_emote.onnx` hacia girar la cabeza 20-37 grados hacia abajo estando quieto, o que las politicas BAM se mantienen de pie frente a las de motor simple), pero no incluye metricas numericas de recompensa, error de seguimiento ni tasas de exito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se documenta el tamano de las redes. Al ser politicas de control de un robot pequeno, se espera que sean ligeras, pero no hay cifras publicadas.
- GPU recomendadas: no se especifican. El objetivo declarado es ejecutar en la CPU de una Raspberry Pi Zero 2 W.
- Compatibilidad con GPU de consumo: no documentada; el diseno apunta a inferencia en CPU embebida, no a A100/H100 ni a RTX 4090.
- Opciones de despliegue: ONNX Runtime mediante `pi/run_policy.py` del repositorio de GitHub; el flujo de despliegue usa `pi/fetch_models.sh` para descargar los modelos y `pi/deploy.sh` para copiar `pi/` a la Raspberry Pi.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| duck-droids-dynamixel (este) | Politicas RL en ONNX para bipedo tipo pato | Raspberry Pi Zero 2 W, servos XL330-M288 | Apache-2.0 | Hugging Face + GitHub |
| microduck_rl (Pollen Robotics) | Entorno y politicas RL para microduck | Robot microduck | Apache-2.0 (segun la model card) | Repositorio de Pollen Robotics |
| duck-droids (upstream) | Proyecto de robot bipedo abierto | Hardware duck-droids | Apache-2.0 | GitHub |

No se dispone de datos de parametros, contexto ni rendimiento de los proyectos comparables en la informacion proporcionada, por lo que la comparacion se limita a tipo, hardware objetivo, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de categoria.
- Las marchas (`walk_imu`, `walk_style`, `walk_blind`) no estan entrenadas con BAM y la model card advierte explicitamente de que no se espere que caminen el pato real.
- `stand_emote.onnx` uso la cabeza como contrapeso y provoco giros de 20-37 grados hacia abajo en el robot real; esta sustituido por `stand_emote_calm.onnx`.
- `stand_emote_calm.onnx` sigue peor las emociones y se recupera peor de empujones que `stand_emote`, segun la propia model card.
- `groundpick_beak.onnx` es un experimento sin fichero JSON de metadatos.
- El repositorio no registra descargas ni likes, y el proyecto parece muy reciente (creado en noviembre de 2026), por lo que la validacion externa es practicamente nula.
- Los sonidos y keyframes de las emociones son de Pollen Robotics (Apache-2.0); hay que revisar `pi/sounds/README.md` para los terminos de atribucion.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de benchmarks y de validacion en el robot real desaconseja su uso en produccion sin pruebas propias.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque el modelo no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/tinkerbuggy/duck-droids-dynamixel
- Repositorio duck-droids: https://github.com/meetsitaram/duck-droids
- mjlab (MuJoCo Warp): https://github.com/mujocolab/mjlab
- microduck_rl de Pollen Robotics: no disponible (referenciado en la model card sin URL)
- rsl_rl: no disponible (referenciado en la model card sin URL)
- BAM (Better Actuator Models, Rhoban): no disponible (referenciado en la model card sin URL)
