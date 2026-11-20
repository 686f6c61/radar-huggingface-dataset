# Yunmo0121/ppo-LunarLander-v3

## Resumen

`Yunmo0121/ppo-LunarLander-v3` no es un modelo de lenguaje, sino un agente de aprendizaje por refuerzo entrenado con Proximal Policy Optimization (PPO) para resolver el entorno `LunarLander-v3` de Gymnasium. Lo publica el usuario Yunmo0121 como parte de la Unidad 1 del curso de Deep Reinforcement Learning de Hugging Face, y su objetivo es aprender una politica que controle los motores de un modulo de aterrizaje para posarse de forma segura y estable en una plataforma.

El agente usa una politica `MlpPolicy` (perceptron multicapa) implementada con Stable-Baselines3, entrenada durante aproximadamente 1.000.000 de pasos de entorno, aunque el checkpoint publicado corresponde a los 500.000 pasos. La observacion es un vector de estado de baja dimension (posicion, velocidad, angulo, contacto con el suelo y estado de las patas), y la accion es discreta entre cuatro opciones (no hacer nada, motor principal, motor izquierdo y motor derecho).

Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo reproducible de un pipeline PPO completo (entrenamiento, evaluacion por checkpoints, comparacion con semillas fijas) y como punto de partida para experimentos de ajuste de hiperparametros. No es un modelo de proposito general ni compite en la categoria de modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MlpPolicy) con optimizacion PPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, observacion vectorial) |
| Tipos de cuantizacion | no disponible (checkpoint `.zip` de Stable-Baselines3) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.zip` (checkpoint serializado de Stable-Baselines3) |

## Arquitectura y entrenamiento

El agente sigue el algoritmo PPO con una politica de tipo MLP sobre el entorno `LunarLander-v3` de Gymnasium, usando Stable-Baselines3 y las dependencias de Box2D. El entrenamiento se realizo de forma incremental hasta aproximadamente 1.000.000 de pasos de entorno, con evaluaciones intermedias en los checkpoints de 10k, 110k, 300k, 500k y 1M de pasos (10 episodios por checkpoint). El checkpoint publicado es el de 500.000 pasos.

La model card reporta una comparacion adicional de los checkpoints de 500k y 1M sobre las mismas 20 semillas con seleccion determinista de acciones: 164,67 ± 97,53 de recompensa media para 500k frente a 157,56 ± 100,38 para 1M. El autor senala explicitamente que el entrenamiento adicional en PPO no garantiza una mejora monotona del rendimiento y que la variabilidad observada es alta. No se documentan detalles sobre la red (numero de capas, unidades por capa), la funcion de recompensa modificada ni hiperparametros concretos de PPO (learning rate, clip range, epochs, batch size).

## Capacidades

- Control de un agente en un entorno de simulacion fisica 2D (`LunarLander-v3`) con acciones discretas.
- Aprendizaje de politica mediante PPO con seleccion determinista o estocastica de acciones.
- Evaluacion reproducible por checkpoints y comparacion entre semillas fijas.
- Carga directa mediante `PPO.load` de Stable-Baselines3.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio ni tool calling.
- No soporta agentes multi-paso ni capacidades multilingues.
- No incorpora modo de razonamiento (thinking mode) ni funciones especiales mas alla del control del entorno.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el checkpoint como ejemplo funcional de PPO en la Unidad 1 del curso de Hugging Face Deep RL, cargandolo con `PPO.load` y ejecutando `model.predict` sobre `LunarLander-v3`.
- Reproduccion de experimentos: comparar el checkpoint de 500k con el de 1M sobre las mismas semillas para ilustrar la no monotonia del rendimiento en PPO.
- Punto de partida para ajuste de hiperparametros: reentrenar con distintas combinaciones de learning rate, `n_steps`, `batch_size` y `clip_range`, y evaluar con semillas fijas.
- Benchmark de entornos de RL: usar el agente como linea base para comparar con otros algoritmos (A2C, DQN, SAC) en `LunarLander-v3`.
- Estudio de robustez: analizar la sensibilidad a condiciones iniciales y la desviacion estandar de la recompensa (97,53 en el checkpoint de 500k) como metrica de estabilidad.
- Generacion de demostraciones en video: ejecutar el agente en modo determinista para grabar episodios y documentar su comportamiento en entornos docentes o divulgativos.

## Benchmarks y rendimiento

Resultados reportados en la model card (recompensa media en `LunarLander-v3`):

| Checkpoint | Episodios | Recompensa media | Desviacion estandar |
|---|---:|---:|---:|
| 10k pasos | 10 | -847,37 | 588,09 |
| 110k pasos | 10 | -50,14 | 27,45 |
| 300k pasos | 10 | 113,06 | 120,69 |
| 500k pasos | 10 | 183,44 | 72,61 |
| 1M pasos | 10 | 149,70 | 96,25 |

Comparacion sobre las mismas 20 semillas con seleccion determinista:

| Checkpoint | Episodios | Recompensa media | Desviacion estandar |
|---|---:|---:|---:|
| 500k pasos | 20 | 164,67 | 97,53 |
| 1M pasos | 20 | 157,56 | 100,38 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparaciones con otros algoritmos o con el umbral de resolucion de 200 puntos) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: suficiente para ejecutar `PPO.load` y `model.predict` sobre `LunarLander-v3`, dado que la politica es un MLP de baja dimension.
- GPU: no es necesaria para inferencia; el entrenamiento puede ejecutarse en CPU o en GPU consumer (por ejemplo, RTX 3060 o superior) sin requisitos especificos documentados.
- VRAM estimada: no disponible; el modelo es de muy baja complejidad y no se reportan requisitos.
- Despliegue: Stable-Baselines3 con Gymnasium y dependencias de Box2D; no aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del entorno de simulacion y del hardware.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros agentes PPO o de otros algoritmos (A2C, DQN, SAC) entrenados en `LunarLander-v3` con los que comparar parametros, contexto o licencia.

## Limitaciones y advertencias

- El rendimiento es sensible a las condiciones iniciales del entorno.
- El agente no ha demostrado de forma consistente una recompensa media superior a 200, umbral habitual de resolucion del entorno.
- Los resultados varian segun la semilla de evaluacion (desviacion estandar cercana a 100 en el checkpoint de 500k).
- No se han realizado multiples ejecuciones de entrenamiento independientes para cuantificar la variabilidad.
- La licencia no esta declarada, por lo que el uso comercial queda sin garantias explicitas.
- No se documentan hiperparametros ni arquitectura exacta de la red, lo que dificulta la reproducibilidad completa.
- El checkpoint publicado (500k) no es el de mayor entrenamiento (1M), y el autor reconoce que el entrenamiento adicional no mejoro el rendimiento en su evaluacion.
- No aplica como modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yunmo0121/ppo-LunarLander-v3
- Curso de Deep Reinforcement Learning de Hugging Face (Unidad 1): https://huggingface.co/learn/deep-rl-course/unit1/introduction
