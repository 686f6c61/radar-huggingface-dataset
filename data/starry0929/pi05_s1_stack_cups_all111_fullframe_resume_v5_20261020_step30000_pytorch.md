# starry0929/pi05_s1_stack_cups_all111_fullframe_resume_v5_20261020_step30000_pytorch

## Resumen

`pi05_s1_stack_cups_all111_fullframe_resume_v5_20261020_step30000_pytorch` es un checkpoint de la familia pi0.5 (vision-language-action) publicado por el usuario starry0929 en Hugging Face, especializado en una única tarea de robótica: apilar vasos con el robot Astribot S1. Parte de la base oficial pi0.5 de Physical Intelligence (revisión `215abfb217dbac7d5f1273282331b9b1866c0479` de OpenPI) y se ha continuado durante 25.000 actualizaciones adicionales sobre 111 episodios de demostraciones alineadas con humanos, hasta el paso global 30.000.

Técnicamente es una política VLA de 3.616.757.520 parámetros totales, de los cuales solo 430.098.464 son entrenables (ajuste exclusivo del experto de acciones) y 3.186.659.056 permanecen congelados (backbone). Consume 32 ángulos articulares en radianes y tres cámaras RGB de 224x224 (cabeza, muñeca izquierda, muñeca derecha), y emite 22 acciones articulares absolutas en radianes con un horizonte de 50 acciones, 10 pasos de denoising y un bucle de control a 30 Hz.

Su interés es doble: por un lado es un ejemplo reproducible de fine-tuning de un VLA sobre un embodiment concreto, ya que el repositorio incluye código de entrenamiento, optimizador, RNG y contadores de muestreo reales; por otro, el autor advierte de forma explícita de que estos pesos no se han evaluado todavía en simulación en bucle cerrado ni en robot real, por lo que no existe ninguna tasa de éxito publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action pi0.5: backbone transformer con prefijo congelado más experto de acciones; implementación PyTorch sobre OpenPI |
| Parámetros totales | 3.616.757.520 |
| Parámetros activos | No aplica (no es un MoE). Desglose del checkpoint: 430.098.464 entrenables (experto) y 3.186.659.056 congelados (backbone) |
| Longitud de contexto | No disponible. La interfaz fija un horizonte de 50 acciones por planificación, 10 pasos de denoising y 3 vistas RGB de 224x224 |
| Tipos de cuantización | No disponible. El checkpoint se distribuye en precisión mixta: maestro FP32 para el experto y autocast BF16 en CUDA; el autor desaconseja convertir todos los parámetros a BF16 tras la carga |
| Idiomas soportados | en (el prompt de entrenamiento es la cadena fija `Stack_the_cups_together.`) |
| Licencia | other: `openpi-apache-2.0-and-gemma` (Apache 2.0 de OpenPI combinada con los términos de Gemma); consultar LICENSE |
| Formato de pesos | safetensors, más `optimizer.pt`, `training_source/` y artefactos de procedencia en un repositorio de 11,5 GB |

## Arquitectura y entrenamiento

El modelo sigue la receta pi0.5 de OpenPI: un prefijo vision-language congelado que procesa tres imágenes RGB de 224x224 y un experto de acciones entrenable que genera las secuencias de control. En este checkpoint solo se ajusta el experto (430.098.464 parámetros); el prefijo se calcula online en cada batch, sin caché persistente. La entrada de estado son 32 valores escalares de qpos en radianes, según `state_names` de `pipeline_contract.json`, y la salida son 22 ángulos articulares absolutos en radianes, según `action_names`; no son acciones de efector final ni acciones delta. Los 22 canales reales se normalizan y después se rellenan con diez ceros hasta 32, y en la decodificación solo se leen los 22 primeros.

El entrenamiento se hizo sobre `150case_data_enhance_blender_v3_human_align` (revisión fijada del dataset `starry0929/rssr`): 111 episodios × 450 frames = 49.950 observaciones, todas muestreadas realmente. El muestreo usa épocas barajadas sin reemplazo, sin recorte del último batch y sin sobreponderar el frame 0; la exposición real fue de 400.000 nuevas extracciones de observación, equivalentes a 8 épocas completas más 400 frames, con cada frame visto 8 o 9 veces. Se empleó batch 16, learning rate constante de 5e-6, sin warmup, AdamW FP32 restaurado con betas (0,9; 0,95), eps 1e-8 y weight decay 1e-4, maestro FP32 del experto con autocast BF16, clipping por norma L2 de gradiente igual a 1, sin aumento de imagen adicional y semillas 20261019 (sampler) y 20261020 (flow). Cada ventana de entrenamiento contiene 50 objetivos del mismo episodio, truncados en el frame 449; la normalización usa los 111 episodios y no se reclama generalización a datos no vistos. El modelo no recibe identificador de frame, tiempo, fase ni episodio.

La continuidad con el run padre no es bit a bit: el padre no guardó el estado del RNG, de modo que el sampler antiguo se replicó durante 5.000 batches antes de pasar a las épocas full-frame, y el ruido de flow usa una semilla nueva declarada. El checkpoint sí guarda su propio optimizador (208 estados de parámetro en el paso 30.000) y su RNG.

## Capacidades

- Generación de acciones de manipulación: transforma estado articular más tres vistas RGB en 50×22 ángulos articulares absolutos en radianes.
- Entrada multimodal de control: `uint8 [3,224,224,3]` en orden cabeza, muñeca izquierda, muñeca derecha, junto con 32 qpos escalares.
- Control a 30 Hz con horizonte 50: ejecuta 50 acciones antes de replanificar y usa 10 pasos de denoising por planificación.
- Condicionamiento por lenguaje: la política acepta prompt de texto, aunque en la práctica está especializada en la instrucción `Stack_the_cups_together.`.
- Interfaz nativa de inferencia: el adaptador `NativeS1Policy` reutiliza las funciones exactas de preprocesado y decodificación del entrenamiento y conserva la política de dtype mixto (experto FP32, backbone congelado en precisión mixta).
- No soporta tool calling, function calling, agentes multi-step ni razonamiento textual: es una política robótica, no un LLM conversacional.
- No incluye vision-language general (VQA, OCR, captioning) ni audio; la visión se usa exclusivamente para el control motor.
- Capacidades multilingües: no disponibles; solo inglés en el prompt.

## Casos de uso

- Apilado de vasos con Astribot S1: es la tarea exacta para la que se entrenó; se usaría cargando el checkpoint con `NativeS1Policy`, enviando los 32 qpos y las tres imágenes y ejecutando las 22 acciones resultantes a través de `JointServo(mode='sim2')` con la conversión de gripper `100 * L1_angle / 0.93`.
- Punto de partida para nuevos fine-tunes sobre el mismo embodiment: al incluir optimizador, RNG y contadores de muestreo, permite reanudar o derivar ramas de entrenamiento con el mismo esquema de ajuste exclusivo del experto.
- Reproducción de experimentos de VLA: el snapshot `training_source/train_fullframe_epoch_resume_v5.py` y `experiment_parameters_fullframe_epoch_resume_v5_20261019.json` permiten auditar la receta (batch, LR, clipping, muestreo) y replicarla sobre otros datasets.
- Evaluación en simulación en bucle cerrado: el autor deja pendiente esta validación, de modo que un equipo de investigación puede usar el checkpoint para medir tasa de éxito y holgura en tareas de apilado antes de llevarlo a hardware.
- Validación de pipelines de inferencia robótica: sirve para medir latencia real de una política de 3,62 B en el bucle de control a 30 Hz con 50 acciones ejecutadas por planificación (replanificación aproximada cada 1,67 s).
- Estudio de estrategias de congelación de backbone: el contraste entre 430 millones de parámetros entrenables y 3.187 millones congelados es un caso práctico para analizar coste y rendimiento del ajuste tipo expert-only.
- Integración en un stack de control tipo ROS: el adaptador entrega `float32[50,22]` en radianes y nombres de articulación (`joint_names`), lo que facilita conectarlo a un driver que respete el orden y las unidades documentados.
- Docencia y divulgación técnica: el repositorio es un ejemplo completo de linaje de checkpoints (parent SHA256 del modelo y del optimizador, procedencia, cobertura de muestreo) poco habitual en modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que
