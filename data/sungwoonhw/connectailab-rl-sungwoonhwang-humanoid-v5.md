# SUNGWOONHW/connectailab-rl-SUNGWOONHWANG-humanoid-v5

## Resumen

`connectailab-rl-SUNGWOONHWANG-humanoid-v5` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO sobre Stable-Baselines3 para el entorno `Humanoid-v5` de Gymnasium, simulado en MuJoCo. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal (MLP de 512 x 512 con activación Tanh) que controla los 17 actuadores de torsión de un humanoide simulado a partir de observaciones de 348 dimensiones. Lo desarrolla SUNGWOON HWANG, ingeniero de diseño de componentes de automoción en SUBARU, en el marco del curso de RL "AI CITY BUILDERS" de CONNECT AI LAB.

El interés del artefacto reside en su metodología de entrenamiento: un currículo de seis fases que va de 1M a 0,5M de pasos por etapa, con bloqueo inicial de la parte superior del cuerpo para forzar el aprendizaje de la marcha con la cadena inferior, desbloqueo posterior para coordinación de todo el cuerpo, relajación del criterio de terminación anticipada hasta un margen biomecánico de 26 grados, y una fase final de ajuste fino con recompensa de seguimiento de captura de movimiento (MoCap) humano a una frecuencia de zancada de 1,0 Hz. El autor reporta una recompensa de evaluación máxima de 3.251,60 puntos y un desplazamiento máximo en un episodio de 3,63 m.

Es relevante como referencia reproducible de ingeniería de recompensas y currículos en control continuo, no como modelo de propósito general. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar materializados o que el artefacto es fundamentalmente la política junto con la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (política y función de valor separadas) de 512 x 512 con activación Tanh, entrenada con PPO |
| Parametros totales | no disponible (no se declara el recuento; con dos redes 512-512 sobre entrada de 348 dimensiones y salida de 17, el orden de magnitud es de cientos de miles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 348 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (no se documentan; al ser una MLP pequeña, la cuantización a FP16 o INT8 sería viable pero no se ha publicado) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería declarada: stable-baselines3, típicamente `.zip` con política PyTorch; no confirmado en la información) |

## Arquitectura y entrenamiento

La política es una red neuronal totalmente conectada con dos capas ocultas de 512 unidades y activación Tanh, en la configuración estándar de Stable-Baselines3 para PPO, con clip range de 0,2, 10 épocas por actualización, minibatch de 256, 1024 pasos de rollout y coeficiente de entropía de 0,0004. El entrenamiento usa 16 entornos paralelos mediante `SubprocVecEnv` sobre `Humanoid-v5` de Gymnasium con el simulador MuJoCo. La fase final de ajuste fino emplea una tasa de aprendizaje de 8,0e-5 con decaimiento lineal y una recompensa de seguimiento MoCap ponderada con factor +3,0, con velocidad objetivo de 1,3 m/s.

El currículo consta de seis etapas: (1) 1M de pasos con la parte superior del cuerpo bloqueada (`lock_upper_body=True`) para impedir el "cheating" del balanceo de brazos y forzar el patrón de cruce de cadera y simetría de rodillas; (2) 1M de pasos con desbloqueo y control autónomo de los 17 motores, induciendo el contrabalanceo brazo-pierna; (3) 0,5M de pasos de estabilización de la coordinación global, compensando el momento angular del tronco con el de las piernas; (4) 1M de pasos con relajación del criterio de caída hasta un margen de 26 grados para aprender recuperación dinámica; (5) 1M de pasos de aceleración hacia 1,5 m/s con objetivo de 10 segundos sin caída (recompensa 3.078); y (6) 0,5M de pasos de ajuste fino biomecánico con MoCap humano, heredando la política de la fase 5. No se documenta el origen ni la composición del conjunto de datos MoCap, ni si hubo entrenamiento con demostraciones fuera de la recompensa de seguimiento.

## Capacidades

- Control continuo de un humanoide simulado de 17 articulaciones en MuJoCo `Humanoid-v5` a partir de observaciones de 348 dimensiones.
- Marcha bípeda dinámica con contrabalanceo brazo-pierna y coordinación de cadena cinemática completa.
- Recuperación de equilibrio ante perturbaciones dentro del margen biomecánico configurado (26 grados).
- Aceleración hasta una velocidad punta reportada de 2,26 m/s y velocidad objetivo de 1,3 m/s.
- Seguimiento de trayectorias articulares humanas tras el ajuste fino con MoCap (frecuencia de zancada de 1,0 Hz).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Investigación en control continuo con RL: sirve como línea base reproducible de PPO sobre `Humanoid-v5` con hiperparámetros documentados, útil para comparar variantes de recompensa o de currículo.
- Estudio de ingeniería de recompensas: el diseño por fases (bloqueo de tronco, margen de caída, recompensa MoCap) es un caso práctico para analizar cómo el shaping afecta a la convergencia.
- Aprendizaje por imitación vía recompensa: la fase 6 muestra cómo integrar captura de movimiento como término de recompensa sin perder estabilidad, aplicable a otros entornos de locomoción.
- Simulación de locomoción para animación y videojuegos: la política puede generar ciclos de marcha con estética humana en un motor físico, siempre que se reproduzca el entorno exacto de observación y acción.
- Docencia en cursos de RL: el artefacto, con currículo por etapas y curvas de aprendizaje, encaja como ejemplo guiado en formación técnica.
- Pruebas de robustez y transferencia sim-a-real (exploratorio): como política entrenada en MuJoCo, puede emplearse para estudiar degradación al variar parámetros físicos del simulador, aunque no hay evidencia publicada de transferencia a hardware.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Recompensa de evaluación máxima | 3.251,60 |
| Distancia máxima en un episodio | 3,63 m |
| Pasos medios de supervivencia por episodio | 357,0 (aprox. 7,5-8 s) |
| Velocidad punta | 2,26 m/s |
| Amplitud de zancada máxima | 50,9 cm |
| Ángulo de la columna en tronco | 9,43 grados |
| Anchura de base de la pelvis | 21,6 cm |
| Recompensa en fase 5 (antes de MoCap) | 3.078 |

No se han publicado resultados de benchmarks en la información disponible más allá de las métricas internas del autor; no hay comparación con políticas de referencia en `Humanoid-v5` ni con implementaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la política es una MLP de dos capas de 512 unidades y no requiere GPU dedicada.
- GPU recomendadas: cualquiera con soporte CUDA es suficiente; una RTX 3060 o superior sobra para inferencia. Para reentrenar con 16 entornos paralelos, se recomienda una GPU de gama media-alta (RTX 4070, RTX 4090, A100) por el coste de simulación en MuJoCo, que suele ser el cuello de botella antes que la red.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU para inferencia de un único entorno.
- Opciones de despliegue: Stable-Baselines3 con PyTorch para cargar la política, Gymnasium con MuJoCo para el entorno. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. La latencia vendrá dominada por el paso de simulación de MuJoCo, no por la inferencia de la MLP.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-SUNGWOONHWANG-humanoid-v5 | PPO + MLP 512x512 | MuJoCo Humanoid-v5 | 3.251,60 (autor) | no disponible | Hugging Face, 0 descargas |
| Política de referencia PPO de Stable-Baselines3 (RL Zoo) | PPO + MLP | MuJoCo Humanoid-v5 | no disponible en esta consulta | MIT (según el proyecto SB3, no verificado aquí) | Disponible en el repositorio de SB3 |
| Otras políticas de Humanoid-v5 publicadas en Hugging Face | PPO / SAC | MuJoCo Humanoid-v5 | no disponible | variable | Disponibles, sin comparación estandarizada |

No hay una comparación directa verificable: las recompensas de `Humanoid-v5` dependen de la versión del entorno, del envoltorio de recompensa y de la semilla, y el autor no publica evaluación contra una línea base común.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones y no tiene capacidades de razonamiento simbólico.
- Las métricas provienen exclusivamente del autor y no han sido replicadas de forma independiente; el repositorio registra 0 descargas y 0 likes.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido.
- El tamaño del repositorio es de 0,0 GB, lo que genera dudas sobre si los pesos están efectivamente publicados y son descargables.
- El rendimiento está ligado a la versión exacta de `Humanoid-v5`, a los parámetros de MuJoCo y al envoltorio de recompensa; cambios en el entorno invalidan las cifras.
- No hay evidencia de transferencia sim-a-real ni de robustez ante cambios de masa, fricción o retardo de actuación.
- El ajuste fino con MoCap depende de un conjunto de datos cuya procedencia y composición no se documentan, lo que limita la reproducibilidad de la fase 6.
- Riesgo de sobreajuste al criterio de evaluación del autor: la recompensa reportada no equivale a calidad biomecánica ni a estabilidad fuera del episodio de 10 segundos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SUNGWOONHW/connectailab-rl-SUNGWOONHWANG-humanoid-v5
- Vídeo de la marcha tras ajuste fino MoCap: https://huggingface.co/SUNGWOONHW/connectailab-rl-SUNGWOONHWANG-humanoid-v5/resolve/main/replay.mp4
- Curva de aprendizaje (imagen en el repositorio): https://huggingface.co/SUNGWOONHW/connectailab-rl-SUNGWOONHWANG-humanoid-v5/resolve/main/learning_curve.png
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Gymnasium (entorno Humanoid-v5): https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- No se han encontrado en la información proporcionada papers, blogs ni demos adicionales del autor.
