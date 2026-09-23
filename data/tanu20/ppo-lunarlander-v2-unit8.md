# tanu20/ppo-LunarLander-v2-unit8

## Resumen

El modelo `tanu20/ppo-LunarLander-v2-unit8` es un agente de aprendizaje por refuerzo entrenado con Proximal Policy Optimization (PPO) sobre el entorno LunarLander-v2 de Gymnasium/Box2D. Lo publica el usuario tanu20 como entrega de la Unidad 8, Parte I, del curso Deep Reinforcement Learning de Hugging Face, cuyo objetivo es implementar PPO desde cero en PyTorch sin recurrir a librerías de alto nivel como Stable-Baselines3.

No se trata de un modelo de lenguaje ni de un transformer generativo: el artefacto es una política actor-critic implementada en PyTorch y almacenada como checkpoint (`model.pt`). Su relevancia es, por tanto, fundamentalmente didáctica y de reproducibilidad: sirve como referencia de una implementación propia de PPO con estimación de ventaja generalizada (GAE) y objetivo recortado, aplicada a un problema de control clásico con observaciones de 8 dimensiones y acciones discretas (4 acciones).

El rendimiento declarado en la model card es modesto: una recompensa media de -132,37 con desviación de 43,43 en 10 episodios de evaluación, frente al resultado de -175,80 registrado por el verificador de certificación del curso. El entorno original (LunarLander-v2) está obsoleto en las versiones actuales de Gymnasium, por lo que la evaluación se realizó sobre el entorno compatible vigente conservando los metadatos de v2 exigidos por el curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO con actor-critic (implementacion propia en PyTorch) y Generalized Advantage Estimation (GAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL; observaciones de 8 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`); se incluyen tambien `results.json` y `replay.mp4` |

## Arquitectura y entrenamiento

La model card indica que se trata de una implementacion desde cero de PPO con arquitectura actor-critic, estimacion de ventaja generalizada (GAE) y objetivo recortado (PPO clipped objective), todo ello en PyTorch. No se especifica en la informacion disponible el numero de capas, el tamano de las capas ocultas, la funcion de activacion, la tasa de aprendizaje, el tamano de lote, el numero de pasos de entrenamiento ni el numero de episodios de recoleccion de experiencia. Tampoco se detalla si se aplicaron tecnicas adicionales como normalizacion de ventajas, recorte de gradientes o annealing de la tasa de aprendizaje.

Respecto al entorno, la model card senala que la Unidad 8 original del curso utiliza `LunarLander-v2`, pero que la version actual de Gymnasium ha deprecado v2 en favor de `LunarLander-v3`. Por ese motivo, la evaluacion se realizo con el entorno compatible actual, conservando los metadatos de certificacion de LunarLander-v2. La evaluacion se efectuo sobre 10 episodios, segun se indica en la propia model card. No hay informacion sobre el uso de RLHF, DPO ni tecnicas de ajuste por preferencias, algo que no aplica en este contexto.

## Capacidades

- Control de politica para el entorno LunarLander: el agente produce acciones discretas (no hacer nada, encender motor principal, encender motor lateral izquierdo, encender motor lateral derecho) a partir de observaciones continuas de 8 dimensiones.
- Aprendizaje por refuerzo con PPO: implementacion del objetivo recortado y de la estimacion de ventaja generalizada para reducir la varianza del estimador de gradiente.
- Arquitectura actor-critic: una red produce la politica y otra estima el valor del estado, con actualizaciones conjuntas.
- Evaluacion reproducible: se incluye `results.json` con los resultados y `replay.mp4` con una grabacion de una partida, lo que permite inspeccion cualitativa del comportamiento.
- Compatibilidad con Gymnasium: el agente se evaluo con el entorno vigente compatible, no solo con la version v2 original.
- No dispone de soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento explicito, ya que no es un modelo de lenguaje.

## Casos de uso

- Material didactico para cursos de aprendizaje por refuerzo: sirve como ejemplo funcional de una implementacion de PPO desde cero en PyTorch, util para que estudiantes comparen su propio codigo con una entrega de referencia del curso.
- Punto de partida para experimentos de ablation: al ser una implementacion propia, resulta sencillo modificar el coeficiente de recorte, el factor lambda de GAE o el numero de epochs por actualizacion y medir el efecto sobre la recompensa media.
- Reproduccion del proceso de certificacion del curso: el repositorio incluye el resultado usado por el verificador de certificacion (-175,80), lo que permite reproducir la validacion con los mismos criterios.
- Comparacion de implementaciones: contrastar esta implementacion artesanal con librerias consolidadas como Stable-Baselines3 sobre el mismo entorno permite estudiar diferencias de rendimiento y de estabilidad.
- Generacion de demostraciones visuales para docencia o documentacion: el archivo `replay.mp4` permite mostrar el comportamiento de una politica entrenada sin necesidad de reentrenar ni de disponer del entorno instalado.
- Analisis de robustez y varianza: la desviacion de 43,43 puntos sobre 10 episodios hace de este agente un caso de estudio interesante para medir la sensibilidad de PPO a la semilla de inicializacion y de evaluacion.
- Banco de pruebas de infraestructura de evaluacion: un agente con recompensa negativa y alta varianza es util para validar pipelines de logging, semillas y metricas antes de escalar a entornos mas costosos.
- Inicializacion para variantes del entorno: la politica puede reutilizarse como punto de partida en modificaciones de LunarLander con funciones de recompensa o dinamicas distintas, dentro de un esquema de curriculum learning.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (metrica no verificada):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | LunarLander-v2 | mean_reward | -132,37 +/- 43,43 | No |

Dato adicional aportado en la model card: el resultado empleado por el verificador de certificacion del curso fue -175,80, calculado sobre 10 episodios de evaluacion.

No se han publicado en la informacion disponible otros resultados de benchmarks comparativos ni curvas de entrenamiento.

## Requisitos de hardware

- Al tratarse de un checkpoint PyTorch de una politica actor-critic para un entorno con observaciones de 8 dimensiones y 4 acciones, el modelo es muy ligero en comparacion con redes profundas de gran tamano; no se dispone de cifras exactas de parametros ni de VRAM en la informacion proporcionada.
- Inferencia en CPU: viable y suficiente para ejecutar episodios de evaluacion o para generar grabaciones, dado el reducido coste computacional tipico de este tipo de politica.
- GPU: no se especifica ninguna GPU recomendada en la informacion disponible. Para inferencia, cualquier GPU consumer seria mas que suficiente; para reentrenamiento, el cuello de botella suele ser la simulacion fisica de Box2D, no la red neuronal.
- Encaje en GPU consumer: si, en cualquiera, aunque no es necesario disponer de GPU para la inferencia.
- Opciones de despliegue: la carga se realiza con PyTorch (`torch.load` sobre `model.pt`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no aplicables a este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tanu20/ppo-LunarLander-v2-unit8 | PPO desde cero en PyTorch | LunarLander (v2/v3) | -132,37 +/- 43,43 (declarada, no verificada) | no disponible | Hugging Face |
| Otras entregas de la Unidad 8 del curso Deep RL de Hugging Face | PPO implementado por alumnos | LunarLander-v2 | no disponible | no disponible | Hugging Face |
| Stable-Baselines3 PPO | Implementacion de referencia de PPO | LunarLander-v2 y otros Gym/Gymnasium | no disponible en la informacion proporcionada | MIT (segun su repositorio) | PyPI / GitHub |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Rendimiento limitado: la recompensa media declarada es negativa (-132,37) con una desviacion elevada (43,43). Como referencia ampliamente conocida del entorno, el umbral habitual considerado de resolucion en LunarLander se situa en 200 de recompensa media, por lo que este agente esta lejos de ese nivel.
- Alta varianza: una desviacion de 43,43 sobre 10 episodios indica un comportamiento inestable y dependiente de la semilla; cualquier uso en produccion exigiria evaluaciones con muchas mas semillas y episodios.
- Metrica no verificada: el campo `verified` del model-index esta marcado como falso, de modo que los resultados proceden unicamente del autor.
- Discrepancia entre resultados: la model card declara -132,37 +/- 43,43 en la seccion de evaluacion, pero -175,80 como resultado del verificador de certificacion. Es necesario aclarar cual corresponde a que conjunto de episodios y semillas antes de citar cualquier cifra.
- Licencia no especificada: la informacion disponible no incluye licencia, lo que impide determinar si el uso comercial esta permitido.
- Entorno obsoleto: LunarLander-v2 ha sido deprecado en Gymnasium, por lo que la reproducibilidad exacta depende de mantener los metadatos de v2 mientras se ejecuta el entorno compatible actual; los resultados pueden no ser directamente comparables entre versiones.
- Ambito de aplicacion muy restringido: el agente solo es valido para el entorno LunarLander con su espacio de observacion y accion concretos. No es transferible directamente a otros dominios sin reentrenamiento.
- Ausencia de informacion de entrenamiento: no se documentan hiperparametros, semillas, numero de pasos ni curva de aprendizaje, lo que dificulta la reproduccion y la deteccion de posibles fugas de informacion entre entrenamiento y evaluacion.
- Riesgo de sobreajuste a la certificacion: al tratarse de una entrega de curso, es posible que el ajuste se haya orientado a superar el umbral del verificador mas que a maximizar el rendimiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanu20/ppo-LunarLander-v2-unit8
- Curso Deep Reinforcement Learning de Hugging Face: https://huggingface.co/learn/deep-rl-course/unit8/introduction
- Articulo original de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Articulo original de GAE (Schulman et al., 2015): https://arxiv.org/abs/1506.02438
- Documentacion del entorno LunarLander en Gymnasium: https://gymnasium.farama.org/environments/box2d/lunar_lander/
