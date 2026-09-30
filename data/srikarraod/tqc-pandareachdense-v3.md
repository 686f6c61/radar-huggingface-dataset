# Srikarraod/tqc-PandaReachDense-v3

## Resumen

El modelo `Srikarraod/tqc-PandaReachDense-v3` es un agente de aprendizaje por refuerzo entrenado con el algoritmo TQC (Truncated Quantile Critics, etiquetado tambien como SAC) sobre el entorno `PandaReachDense-v3`, utilizando la libreria `stable-baselines3`. No es un modelo de lenguaje ni un modelo de vision: es una politica de control continuo que mapea observaciones del entorno a acciones del brazo robotico simulado. Su autor es el usuario de HuggingFace Srikarraod y fue entrenado como parte de la Unidad 6 del curso Deep Reinforcement Learning de Hugging Face.

El entorno `PandaReachDense-v3` pertenece a la familia panda-gym y simula un brazo robotico Franka Emika Panda con actuacion continua en un simulador de fisica. La tarea consiste en llevar el efector final a una posicion objetivo, con una funcion de recompensa densa basada en la distancia al objetivo, lo que ofrece senal de aprendizaje en cada paso en lugar de solo al final del episodio.

La relevancia de esta ficha es acotada: se trata de un artefacto educativo y de bajo coste computacional, con 0 descargas y 0 likes en el momento de la consulta, licencia no declarada y un unico resultado de evaluacion publicado por el propio autor (`mean_reward` de -1.50 +/- 0.50, marcado como no verificado). Sirve como referencia reproducible para comparar algoritmos off-policy en tareas de manipulacion robotica simulada, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TQC (Truncated Quantile Critics) sobre actor-critico tipo SAC, con redes neuronales densas (MLP); numero de capas y unidades no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); dimension del vector de observacion por paso no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el artefacto se carga mediante la libreria stable-baselines3 (formato nativo de dicha libreria) |
| Espacio de acciones | continuo, control del brazo Franka Emika Panda en panda-gym (dimension exacta no disponible) |
| Libreria de inferencia | stable-baselines3 (TQC en sb3-contrib) |

## Arquitectura y entrenamiento

TQC es un algoritmo off-policy de aprendizaje por refuerzo profundo que parte de SAC y anade una critica distribuida con regresion de cuantiles. En lugar de estimar un unico valor esperado Q, el critico predice varios cuantiles de la distribucion de retorno y trunca los cuantiles mas optimistas antes de promediarlos, lo que reduce el sesgo de sobreestimacion del valor. El resultado es un actor estocastico que maximiza el retorno esperado con regularizacion de entropia, adecuado para espacios de accion continuos como el control articular de un brazo robotico.

No se dispone de informacion sobre el numero de pasos de entrenamiento, el tamano del replay buffer, la tasa de aprendizaje, el numero de cuantiles, el numero de semillas ejecutadas ni la composicion del curriculum. La model card indica unicamente que el entrenamiento se realizo con la libreria `stable-baselines3` dentro de la Unidad 6 del curso Deep RL de Hugging Face, cuyo umbral de validacion para la certificacion es alcanzar una recompensa de al menos -3.5 en `PandaReachDense-v3`. No se documenta ninguna innovacion tecnica adicional ni modificacion del algoritmo base.

## Capacidades

- Control continuo de un brazo robotico simulado (Franka Emika Panda) para tareas de alcance de un punto objetivo.
- Inferencia de politica off-policy entrenada: dado un vector de observacion del entorno, produce una accion continua por paso de simulacion.
- Compatible con el ecosistema Gymnasium / panda-gym y con la API de prediccion de stable-baselines3.
- Capacidad de servir como baseline reproducible para comparar TQC frente a otros algoritmos (A2C, PPO, SAC) en el mismo entorno.
- Soporte de tool calling: no aplica.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio, generacion de texto o codigo): no aplica. Es una politica de control, no un modelo generativo de lenguaje.

## Casos de uso

- Reproduccion de la certificacion del curso Deep RL: cargar el agente con stable-baselines3 y verificar que la recompensa media declarada (-1.50 +/- 0.50) supera el umbral de -3.5 exigido en la Unidad 6.
- Baseline en investigacion sobre RL off-policy: usar este agente como referencia TQC en `PandaReachDense-v3` para medir la mejora de variantes propias (por ejemplo, cambios en el numero de cuantiles o en el truncamiento).
- Comparacion de algoritmos en manipulacion robotica simulada: enfrentar este TQC contra los agentes A2C publicados en el mismo entorno para estudiar la diferencia entre metodos on-policy y off-policy con recompensa densa.
- Prototipado de control de bajo nivel en simulacion: integrar la politica en un bucle de simulacion PyBullet para experimentar con generacion de trayectorias del efector final antes de portar nada a hardware real.
- Docencia y material educativo: ilustrar como se guarda, se publica y se evalua un agente de RL en el Hub, incluyendo el formato `model-index` y las limitaciones de reportar un unico resultado no verificado.
- Pruebas de infraestructura de evaluacion: validar pipelines internos que cargan politicas desde HuggingFace Hub, ejecutan rollout en entorno vectorizado y registran recompensa media y desviacion tipica.
- Punto de partida para inicializacion o fine-tuning: reutilizar los pesos como inicializacion para variantes mas dificiles del mismo entorno (por ejemplo, alcance con obstaculos) y medir la transferencia.
- Analisis de robustez ante aleatorizacion de dominio: evaluar como se degrada la politica al modificar masas, fricciones o posiciones iniciales del entorno simulado.

## Benchmarks y rendimiento

Unico resultado publicado por el autor en el `model-index` de la model card:

| Tarea | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | PandaReachDense-v3 | mean_reward | -1.50 +/- 0.50 | No (false) |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion directa con A2C, PPO o SAC sobre el mismo entorno con numeros citables. Como referencia del propio curso, el umbral de validacion de la Unidad 6 es obtener una recompensa de al menos -3.5 en `PandaReachDense-v3`, por lo que el valor declarado supera dicho umbral.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Al tratarse de un agente TQC con redes densas, el consumo es muy bajo (por debajo de 1 GB en cualquier configuracion razonable de politica), aunque el dato exacto depende del tamano de las capas, que no se ha publicado.
- GPU recomendadas: no se requiere GPU para inferencia. Cualquier GPU consumer (por ejemplo, gama RTX) es mas que suficiente; el entrenamiento, no la inferencia, es la fase que se beneficia de aceleracion.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: carga e inferencia mediante `stable-baselines3` y `sb3-contrib` en Python, junto con Gymnasium y panda-gym. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La latencia vendra determinada principalmente por el paso de simulacion de PyBullet, no por la red neuronal.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Srikarraod/tqc-PandaReachDense-v3 | PandaReachDense-v3 | TQC / SAC | -1.50 +/- 0.50 | no disponible | HuggingFace Hub (0 descargas) |
| gadigesaisree/tqc-PandaReachDense-v3 | PandaReachDense-v3 | TQC | no disponible | no disponible | HuggingFace Hub |
| gracetxgao/tqc-PandaReachDense-v3 | PandaReachDense-v3 | TQC | no disponible | no disponible | HuggingFace Hub |
| xenjin450/A2C-PandaReachDense-v3 | PandaReachDense-v3 | A2C | no disponible | no disponible | GitHub |
| HusseinEid101/a2c-PandaReachDense-v3 | PandaReachDense-v3 | A2C | no disponible | no disponible | GitHub |

No se dispone de recompensas publicadas para los modelos comparables, por lo que no es posible establecer una jerarquia de rendimiento entre ellos con los datos disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite tool calling ni razonamiento multi-paso en el sentido habitual de los LLM.
- Especificidad de entorno: la politica esta entrenada exclusivamente para `PandaReachDense-v3`. No se puede trasladar directamente a otros entornos, a otras versiones del entorno ni a tareas de manipulacion distintas sin reentrenamiento.
- Rendimiento modesto y unico punto de medida: el valor -1.50 +/- 0.50 es un unico resultado declarado por el autor, marcado como no verificado (`verified: false`), sin numero de semillas ni metodologia de evaluacion documentada.
- Ausencia de licencia: no hay licencia declarada, lo que impide determinar si el uso comercial esta permitido. En produccion esto es un riesgo legal directo.
- Riesgo de sobreajuste al entorno simulado y de brecha sim-a-real: el agente opera sobre fisica aproximada de PyBullet y no incorpora aleatorizacion de dominio documentada; su transferencia a un brazo Franka real no esta demostrada.
- Sesgos y modos de fallo: un agente TQC entrenado en una tarea de alcance puede quedarse atascado en minimos locales, mostrar comportamientos poco suaves en las articulaciones o fallar ante configuraciones iniciales poco frecuentes en el muestreo de entrenamiento. No hay informacion publicada al respecto para este modelo concreto.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes, sin issues ni discusiones asociadas, por lo que no existe evidencia externa de reproducibilidad.
- Ambiguedad de nomenclatura: la etiqueta del repositorio mezcla "TQC" y "SAC", y existen varios repositorios con el mismo nombre creados por distintos usuarios en el marco del curso, lo que puede provocar confusion al referenciar el artefacto.
- Sin informacion sobre cuantizacion ni exportacion: no consta soporte de ONNX, TensorRT u otros formatos optimizados para despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Srikarraod/tqc-PandaReachDense-v3
- Curso Deep Reinforcement Learning de Hugging Face: https://huggingface.co/learn/deep-rl-course/en/unit0/introduction
- Notebook de la Unidad 6: https://colab.research.google.com/github/huggingface/deep-rl-class/blob/main/notebooks/unit6/unit6.ipynb
- Modelo equivalente de gadigesaisree: https://huggingface.co/gadigesaisree/tqc-PandaReachDense-v3
- Modelo equivalente de gracetxgao: https://huggingface.co/gracetxgao/tqc-PandaReachDense-v3
- Implementacion A2C de xenjin450: https://github.com/xenjin450/A2C-PandaReachDense-v3Xenjin450/blob/main/PandaReachDense-v3.py
- Implementacion A2C de HusseinEid101: https://github.com/HusseinEid101/a2c-PandaReachDense-v3
- Repositorio del curso deep-rl-class: https://github.com/huggingface/deep-rl-class
