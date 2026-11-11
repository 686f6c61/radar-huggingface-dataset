# SUNGWOONHW/connectailab-rl-SUNGWOONHWANG-humanoid-v6

## Resumen

`connectailab-rl-SUNGWOONHWANG-humanoid-v6` es un modelo de aprendizaje por refuerzo (RL) entrenado con PPO sobre Stable-Baselines3 para control continuo de un humanoide bípedo en el entorno `Humanoid-v5` de MuJoCo. No es un modelo de lenguaje: es una política neuronal (MLP 512x512 con activación Tanh) que mapea observaciones de 348 dimensiones a 17 pares de torques articulares, y su objetivo es conseguir una locomoción bípeda estable y rápida sin caídas.

El autor, SUNGWOON HWANG, es ingeniero de diseño de componentes de automoción en SUBARU y publica este artefacto como parte de la iniciativa Connect AI Lab. La versión 6 es el resultado de un currículo de entrenamiento en 7 etapas que va desde el bloqueo del tren superior hasta una fase final de *sprint* de alta velocidad con corrección del balanceo lateral (roll centering). El modelo reporta una distancia máxima de avance continuo de 8,58 m, una velocidad punta de 1,91 m/s (6,88 km/h) y 530 pasos de simulación sin caída.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline de RL con currículo por fases para control locomotor, y como baseline para experimentos de velocidad y estabilidad en MuJoCo. No tiene capacidades de lenguaje, visión ni tool calling; cualquier evaluación debe hacerse en el contexto de simulación física.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política MLP (actor-crítico) para RL, capas 512 x 512 con activación Tanh |
| Parametros totales | no disponible (red 512x512; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 348 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos de política RL; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,0 GB; librería declarada `stable-baselines3`) |

## Arquitectura y entrenamiento

La política es una red neuronal densa con dos capas ocultas de 512 unidades y activación Tanh, entrenada con PPO (Stable-Baselines3) sobre el entorno Gymnasium `Humanoid-v5` de MuJoCo. La observación de 348 dimensiones se transforma en 17 acciones de par continuo, una por articulación. El entrenamiento usa 16 entornos paralelos (`SubprocVecEnv`), `n_steps=1024`, tamaño de minilote 256, 10 épocas por actualización, `clip_range=0.2`, coeficiente de entropía 0,001 y una tasa de aprendizaje de 1,0e-4 con decaimiento lineal durante el *fine-tuning*.

El elemento diferenciador es el currículo de 7 etapas, cada una con un número definido de pasos: (1) bloqueo del tren superior durante 1.000.000 de pasos para forzar el patrón de marcha con la cadera y las rodillas; (2) desbloqueo y coordinación de todo el cuerpo con balanceo cruzado de brazos (1.000.000); (3) estabilización del momento angular (500.000); (4) marcha continua con margen de caída relajado a 26° (1.000.000); (5) aceleración a 1,5 m/s (1.000.000); (6) *fine-tuning* con captura de movimiento humano a 1,0 Hz (500.000); y (7) etapa final de *sprint* con cadencia elevada a 1,4 Hz, objetivo de 1,8 m/s y una penalización de *roll* para suprimir el balanceo lateral. La etapa 7 elimina la terminación temprana artificial para explotar el potencial completo del modelo.

## Capacidades

- Control locomotor bípedo continuo en MuJoCo `Humanoid-v5` con 17 articulaciones accionadas por par.
- Marcha y *jogging* estable a velocidades medias de 1,08 m/s y picos de 1,91 m/s.
- Recuperación dinámica de balanceo lateral mediante la penalización de *roll* introducida en la etapa 7.
- Seguimiento de referencias biomecánicas de captura de movimiento (cadencia de 1,0 Hz en la etapa 6).
- Ejecución de episodios largos: 530 pasos (8,0 s de tiempo físico) sin caída.
- No soporta *tool calling*, agentes, razonamiento simbólico, visión, audio ni procesamiento de lenguaje.

## Casos de uso

- **Investigación en locomoción bípeda**: usar la política como *baseline* para comparar curvas de aprendizaje y estabilidad frente a variantes propias del entorno `Humanoid-v5`.
- **Reproducción de currículos por fases**: el autor documenta paso a paso cada etapa con su número de muestras, lo que permite replicar el esquema de bloqueo-desbloqueo del tren superior en otros entornos de control.
- **Pruebas de robustez ante perturbaciones**: evaluar la resiliencia del modelo ante empujes laterales o cambios de fricción, aprovechando el margen de caída de 26° y la penalización de *roll*.
- **Generación de datos sintéticos de marcha**: extraer trayectorias articulares de 530 pasos para alimentar modelos de imitación o análisis biomecánico.
- **Docencia en RL con PPO**: ejemplo autocontenido de Stable-Baselines3 con hiperparámetros explícitos (`n_steps`, `batch_size`, `clip_range`) para ilustrar el ajuste fino de PPO en control continuo.
- **Comparación de estrategias de recompensa**: contrastar la recompensa estándar de `Humanoid-v5` con la combinación de objetivo de velocidad, cadencia y penalización de *roll* descrita por el autor.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan la etapa 1, la etapa 6 y la versión 6 sobre el propio entorno de evaluación:

| Métrica | Etapa 1 | Etapa 6 | Versión 6 | Mejora |
|---|---|---|---|---|
| Distancia máxima continua | 0,78 m | 3,63 m | 8,58 m | +136,4 % |
| Pasos de supervivencia por episodio | 80 | 300 | 530 | +76,7 % |
| Velocidad media | 0,25 m/s | 0,81 m/s | 1,08 m/s | +33,3 % |
| Velocidad punta | 0,60 m/s | 1,56 m/s | 1,91 m/s | +22,4 % |
| Zancada máxima | 22,1 cm | 50,9 cm | 52,4 cm | — |
| Duración del vídeo | 2,5 s (caída) | 10,0 s | 13,25 s (530 fotogramas) | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje. Tampoco se ofrecen comparaciones con otras políticas públicas de `Humanoid-v5`.

## Requisitos de hardware

- **VRAM estimada para inferencia**: muy baja; una MLP 512x512 en float32 ocupa del orden de unos pocos megabytes, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- **GPU recomendadas**: no se requiere GPU dedicada; cualquier RTX 20xx o superior acelera la simulación, pero el cuello de botella real es el paso físico de MuJoCo.
- **Cabe en GPU consumer**: sí, en cualquier modelo con soporte CUDA; también funciona en CPU.
- **Opciones de despliegue**: `stable-baselines3` con `PPO.load()` sobre un entorno Gymnasium `Humanoid-v5`; no se documentan exportaciones a ONNX, TorchScript ni TensorRT.
- **Latencia y throughput**: no disponibles; dependen de la velocidad de paso de MuJoCo y del número de entornos paralelos, no de la política.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `connectailab-rl-SUNGWOONHWANG-humanoid-v6` | Política PPO (MLP) | MuJoCo `Humanoid-v5` | Red 512x512 | no aplica | no disponible | Hugging Face |
| Política base de `Humanoid-v5` (SB3) | Política PPO (MLP) | MuJoCo `Humanoid-v5` | Red 256x256 por defecto | no aplica | MIT (Stable-Baselines3) | Documentación SB3 |
| Políticas de referencia MuJoCo `humanoid` (DeepMind) | Varias (SAC, PPO) | MuJoCo `Humanoid` | Variable | no aplica | MIT (MuJoCo) | Repositorios de referencia |

La comparación con otras políticas públicas de `Humanoid-v5` no está disponible en la información proporcionada, ya que el autor no incluye métricas cruzadas con implementaciones externas.

## Limitaciones y advertencias

- **Ámbito restringido**: solo funciona en `Humanoid-v5` de MuJoCo; no es transferible a otros entornos ni a robots reales sin un pipeline de simulación a realidad.
- **Licencia no declarada**: la ausencia de licencia impide asumir derechos de uso comercial; hay que contactar con el autor antes de cualquier despliegue.
- **Sesgo de simulación**: los resultados (8,58 m, 1,91 m/s) proceden de un simulador con parámetros concretos y no garantizan comportamiento equivalente en hardware físico.
- **Sobreajuste al currículo**: la política se ha afinado con una secuencia de recompensas muy específica; cambios en la función de recompensa o en el modelo de fricción pueden degradar el rendimiento.
- **Ausencia de benchmarks externos**: no hay comparación con otras políticas ni evaluación en entornos no vistos, lo que limita la confianza en la generalización.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo de lenguaje.
- **Repositorio vacío en el momento de la consulta**: 0 descargas, 0 *likes* y 0,0 GB, por lo que la integridad y disponibilidad de los pesos no están verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SUNGWOONHW/connectailab-rl-SUNGWOONHWANG-humanoid-v6
- Vídeo de repetición (replay.mp4): https://huggingface.co/SUNGWOONHW/connectailab-rl-SUNGWOONHWANG-humanoid-v6/resolve/main/replay.mp4
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Entorno `Humanoid-v5` (Gymnasium): https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
