# ultarasonic-penguin/sensorcade-v0.1

## Resumen

Sensorcade-BC v0.1 es una colección de 24 modelos de behavior cloning (imitación de políticas robóticas) desarrollados por el usuario ultarasonic-penguin para el benchmark Sensorcade, un entorno de evaluación en el que un robot debe leer múltiples tipos de sensores en tiempo real mientras actúa. El repositorio contiene 6 configuraciones de robot (brazo I2RT YAM, humanoides Unitree G1 en dos variantes, dron Skydio X2, cuadrúpedo Unitree Go1 y un ROV subacuático de 8 propulsores), cada una con dos conjuntos de entrada (`full` con sensores y `nosense` sin ellos) y dos semillas de entrenamiento, lo que da los 24 checkpoints.

La relevancia del proyecto es metodológica: no busca ser un modelo de producción, sino una línea base reproducible que cuantifica cuánto aportan los sensores físicos (táctiles, fuerza/par, IMU, sonar, hidrófono, etc.) frente a la configuración VLA estándar de cámaras, lenguaje y estado del robot. Los resultados son deliberadamente modestos: 0,1 % de éxito con la entrada estándar y 4,4 % añadiendo sensores, frente al 83,5 % del experto, lo que evidencia el margen de mejora en behavior cloning con sensores heterogéneos.

Arquitectónicamente combina un codificador convolucional de imagen entrenado desde cero, un embedding de instrucción congelado de Qwen3.5-4B, torres de convolución causal por tipo de sensor y un transformer pequeño con cabeza de acciones por flow matching. El repositorio pesa 6,1 GB y cada checkpoint individual ocupa entre 235 y 263 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de acciones por flow matching; codificadores convolucionales por modalidad (imagen, sensores) y embedding de texto congelado |
| Parametros totales | no disponible (checkpoints de 235–263 MB; número exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de sensores por tipo; sin contexto de lenguaje extenso) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch `last.pt`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (la instrucción se procesa vía embedding de Qwen3.5-4B) |
| Licencia | Apache-2.0 (dataset de entrenamiento CC-BY-4.0) |
| Formato de pesos | PyTorch (`last.pt`), junto con `args.json`, `inputs.json`, `train.jsonl` y `val.jsonl` |

## Arquitectura y entrenamiento

Cada modelo procesa tres flujos de entrada. Los fotogramas de cámara pasan por un codificador convolucional pequeño entrenado desde cero. La instrucción en lenguaje se convierte en un único token mediante un embedding de frase de Qwen3.5-4B congelado y mean-pooling. Cada tipo de sensor dispone de su propio codificador: una torre de convolución causal sobre la ventana cruda de datos a la frecuencia nativa del sensor. Los tokens de todos los codificadores entran en un transformer pequeño con cabeza de acciones por flow matching.

La ejecución es asíncrona y multirrate: los tokens de sensor, imagen y texto se calculan a ritmo lento (cada 10 pasos de control, disponibles 3 pasos después), mientras que la cabeza de acciones actúa en cada paso de control sobre el estado más reciente del robot. El entrenamiento se realizó durante 30.000 pasos (40.000 para las variantes `g1` y `g1_pour`), con batch de 32, learning rate 3e-4, sobre el split de entrenamiento del dataset Sensorcade v0.1 (semilla 3000); la validación usa la semilla 3001. No se menciona RLHF ni DPO: es behavior cloning supervisado puro.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones multimodales (cámaras, estado del robot, instrucción en lenguaje).
- Lectura de sensores heterogéneos en tiempo real: táctil en puntas de dedo, fuerza/par en muñeca, micrófono, par articular, presión plantar, IMU, corriente de motor, lidar, cámara térmica, hidrófono, sonar de imagen y de barrido, DVL, INS, USBL, magnetómetro, profundidad, altímetro, CTD, velocidad del agua, tensión del cable y RPM.
- Ejecución de tareas manipulativas (Delicate Grasp, Precision Pour, Kitchen Prep), de locomoción y carga (Load Carry, Carry and Pour), de vuelo (Disturbed Hover, Gate Racing, Person Following) y de inspección subacuática (Subsea Inspection).
- Condicionamiento por instrucción en lenguaje mediante embedding de frase.
- Inferencia asíncrona multirrate con desacoplamiento entre percepción lenta y control rápido.
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto libre: es un modelo de política, no un LLM conversacional.

## Casos de uso

- Investigación en behavior cloning con sensores: línea base reproducible para medir la contribución de cada modalidad sensorial comparando los checkpoints `full` y `nosense` del mismo robot y semilla.
- Desarrollo de políticas para brazos manipuladores: el checkpoint `bcD_yam_full_s0` sirve como punto de partida para tareas de agarre delicado y vertido de precisión en simulación MuJoCo antes de transferir a hardware.
- Robótica humanoide: las variantes `bcD_g1_` y `bcD_g1_pour_` permiten experimentar con transporte de carga y vertido usando fuerza/par en muñeca, presión plantar, IMU y par articular.
- Navegación aérea: `bcD_x2_` aplica a un Skydio X2 en tareas de hover perturbado, carreras de puertas y seguimiento de personas, con fusión de IMU, corriente de motor, lidar y cámara térmica.
- Inspección subacuática: `bcD_rov_full_s0` es el checkpoint con mejor rendimiento relativo (29,2 % frente a 0,0 % sin sensores), útil para estudiar fusión de sonar, DVL, INS y USBL en un ROV de 8 propulsores.
- Reproducción y retraining: cualquiera puede reentrenar los 24 modelos desde el dataset público con `scripts/train_bc.py`, lo que facilita la comparación de variantes arquitectónicas sobre una base idéntica.
- Evaluación de benchmarks: integración con `scripts/eval_set.py` del repositorio Sensorcade para obtener métricas de éxito en los casos `main` y `hard` con semillas de evaluación fijas (1234, 777).

## Benchmarks y rendimiento

Éxito en % sobre los casos de test puntuados del benchmark (media de 2 semillas de entrenamiento × 2 semillas de evaluación, 1.024 episodios cada una):

| Familia | Experto (techo) | BC: cámaras + lenguaje + estado | BC: + sensores |
|---|---|---|---|
| Delicate Grasp | 53.5 | 0.0 | 0.0 |
| Precision Pour | 73.5 | 0.8 | 10.0 |
| Load Carry | 91.2 | 0.0 | 0.0 |
| Carry and Pour | 84.1 | 0.0 | 0.0 |
| Disturbed Hover | 99.5 | 0.0 | 0.0 |
| Gate Racing | 72.9 | 0.0 | 0.0 |
| Person Following (Skydio X2) | 83.3 | 0.0 | 0.0 |
| Person Following (Unitree Go1) | 97.2 | 0.5 | 0.3 |
| Subsea Inspection | 87.2 | 0.0 | 29.2 |
| Kitchen Prep | 99.0 | 0.0 | 0.0 |
| **Overall** | **83.5** | **0.1** | **4.4** |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje: el modelo no es un LLM y su evaluación es exclusivamente de éxito en tareas robóticas.

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint ocupa 235–263 MB en precisión de entrenamiento, por lo que la inferencia cabe holgadamente en GPUs de consumo; el requisito dominante es el embedding de instrucción congelado de Qwen3.5-4B (aproximadamente 8 GB en fp16, menos con cuantización del codificador de texto).
- GPU recomendadas: cualquier GPU con al menos 8–12 GB de VRAM para el pipeline completo (RTX 3060/4060 en adelante); A100 o H100 no son necesarias para inferencia, solo para reentrenamiento a mayor escala.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y superiores.
- Opciones de despliegue: el repositorio oficial usa `uv` con el extra `baselines` y el script `eval_set.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de política).
- Latencia y throughput: no disponibles de forma explícita; la arquitectura está diseñada para que la cabeza de acciones opere en cada paso de control mientras la percepción se actualiza cada 10 pasos con 3 pasos de retardo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sensorcade-BC v0.1 | Política BC multimodal | no disponible (235–263 MB por checkpoint) | no disponible | 4,4 % overall con sensores | Apache-2.0 | Hugging Face |
| Políticas interactivamente entrenadas del benchmark Sensorcade | Políticas RL/interactivas | no disponible | no disponible | Comparadas en el README del benchmark; valores no incluidos en la información disponible | Apache-2.0 (código) | Repositorio Sensorcade |
| VLA genéricos (cámaras + lenguaje + estado) | Política VLA | no disponible | no disponible | 0,1 % overall en este benchmark | varía | no disponible |

La comparación relevante es interna al propio benchmark: la columna `nosense` representa la configuración VLA estándar y la columna `full` añade sensores. No se dispone de datos de otros modelos de política comparables en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en términos absolutos: 4,4 % de éxito global frente al 83,5 % del experto; varias familias (Delicate Grasp, Load Carry, Carry and Pour, Disturbed Hover, Gate Racing, Kitchen Prep) quedan en 0,0 % incluso con sensores.
- Deriva de estado: según el autor, las acciones predichas siguen al experto mientras este conduce, pero al conducir el modelo se desvía de los estados del experto y el behavior cloning puro no dispone de mecanismo de corrección.
- Sesgos: al entrenarse solo con el dataset Sensorcade v0.1, hereda la distribución, los sesgos y las limitaciones de cobertura de ese dataset; no se documentan análisis de sesgo adicionales.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras fuera de distribución, especialmente en hardware real.
- Limitaciones de idioma: no se especifican idiomas soportados; la instrucción depende del embedding de Qwen3.5-4B y no hay evaluación multilingüe publicada.
- Restricciones de licencia: Apache-2.0 permite uso comercial del modelo y del código, pero el dataset de entrenamiento es CC-BY-4.0, lo que exige atribución en trabajos derivados.
- Advertencia para producción: son líneas base de investigación, no políticas listas para desplegar; el propio autor las describe como "un punto de partida, no una solución".
- Sin cuantizaciones publicadas ni formatos alternativos a PyTorch, lo que limita el despliegue en entornos con requisitos de formato específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ultarasonic-penguin/sensorcade-v0.1
- Dataset Sensorcade v0.1: https://huggingface.co/datasets/ultarasonic-penguin/sensorcade-v0.1
- Repositorio de código del benchmark: https://github.com/bosung/sensorcade
- Script de evaluación: `scripts/eval_set.py` (en el repositorio)
- Script de reentrenamiento: `scripts/train_bc.py` (en el repositorio)
- Paper: no disponible (citation TBA según el autor)
