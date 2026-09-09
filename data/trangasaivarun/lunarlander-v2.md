# trangasaivarun/LunarLander-v2

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo Proximal Policy Optimization (PPO) para resolver el entorno LunarLander-v2 de Gymnasium. Fue desarrollado por el usuario trangasaivarun y presentado como proyecto final de la Unidad 8 del curso de Deep Reinforcement Learning de Hugging Face. El objetivo del agente es aprender una política que controle un módulo lunar y lo haga aterrizar correctamente sobre la plataforma designada, maximizando la recompensa acumulada.

La arquitectura empleada es un Actor-Critic en PyTorch, con dos redes neuronales simples de perceptrones multicapa: una para el actor (que genera las probabilidades de acción) y otra para el crítico (que estima el valor del estado). Cada red tiene dos capas ocultas de 64 neuronas con activación Tanh. Se trata de un modelo muy pequeño, pensado principalmente con fines educativos y de demostración, y no de un modelo de lenguaje. Por tanto, no es comparable con modelos de texto como los LLM, y los parámetros habituales de contexto o idiomas no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-Critic (dos redes multicapa: Actor y Critic) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de aprendizaje por refuerzo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | State dict de PyTorch (.pt) |

| Parametro adicional | Valor |
|---|---|
| Algoritmo | PPO (Proximal Policy Optimization) |
| Espacio de observacion | 8 dimensiones (posicion, velocidad, angulo, contactos) |
| Espacio de acciones | 4 acciones discretas |
| Entorno de entrenamiento | LunarLander-v2 (la tabla de entrenamiento menciona v3) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema Actor-Critic clásico. El Actor recibe una observación de 8 dimensiones y produce logits de acción mediante una red con la secuencia: Input -> Linear(64) -> Tanh -> Linear(64) -> Tanh -> Linear(4). La salida se convierte en una distribución categórica sobre las 4 acciones posibles. El Crítico, por su parte, estima la función de valor del estado con una estructura análoga: Input -> Linear(64) -> Tanh -> Linear(64) -> Tanh -> Linear(1).

El entrenamiento se realizó con PPO, incluyendo Generalized Advantage Estimation (GAE), el objetivo clipped de PPO, normalización de ventajas, regularización de entropía, recorte del gradiente, annealing de la tasa de aprendizaje y pérdida de valor recortada. Los hiperparámetros documentados incluyen: 100.000 timesteps totales, 8 entornos en paralelo, 128 pasos por rollout, 4 minibatches, 4 épocas de actualización, factor de descuento 0,99, lambda de GAE 0,95, coeficiente de clip 0,2, coeficiente de entropía 0,01, coeficiente de valor 0,5 y norma máxima de gradiente 0,5. La semilla aleatoria fue 1. Cabe señalar que la tabla de configuración de la model card indica LunarLander-v3 mientras que el resto de la documentación y la evaluación se refieren a LunarLander-v2, lo que supone una inconsistencia menor.

## Capacidades

- Controla un módulo lunar en el entorno LunarLander-v2: el agente genera una acción discreta (no hacer nada, encender el motor de orientación izquierdo, encender el motor principal o encender el motor de orientación derecho) a partir de las 8 observaciones disponibles.
- Implementa una política aprendida con PPO desde cero, utilizando ventajas estimadas con GAE y el objetivo clipped de PPO.
- Integra con Gymnasium: puede cargar el estado del modelo y ejecutar la política en el entorno estándar de LunarLander-v2.
- No soporta generación de texto, tool calling, razonamiento en lenguaje natural ni capacidades multilingües, al ser un modelo exclusivamente de control por aprendizaje por refuerzo.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

1. Docencia de aprendizaje por refuerzo: este modelo es un ejemplo práctico de una implementación de PPO desde cero, útil para estudiar el funcionamiento del objetivo clipped, la GAE y la arquitectura Actor-Critic en un entorno sencillo y visual.
2. Práctica del curso de deep RL de Hugging Face: el proyecto está ligado a la Unidad 8 del curso, por lo que sirve como material de referencia para alumnos que necesiten completar el mismo ejercicio.
3. Investigación comparativa de algoritmos en LunarLander-v2: puede usarse como baseline de PPO para comparar con otros algoritmos o variantes en el mismo entorno, aunque los resultados no están verificados.
4. Análisis de sensibilidad de hiperparámetros: alestar documentadas las hiperparametros, permite experimentar variaciones de aprendizaje, factor de descuento y demás valores para observar el impacto en la recompensa media.
5. Pruebas de infraestructuras de RL: sirve para validar pipelines de entrenamiento con PyTorch y Gymnasium, o para comprobar que una implementación propia de PPO replica resultados similares.
6. Prototipos de control en entornos discretos: aunque el rendimiento es limitado, la arquitectura demuestra cómo una política neuronal puede resolver un problema de control con acciones discretas y observaciones continuas.

## Benchmarks y rendimiento

El resultado oficial declarado en el model-index es el siguiente, según la información proporcionada. No se han encontrado benchmarks adicionales ni comparaciones con otros modelos.

| Tarea | Metrica | Valor | Verificado |
|---|---|---|---|
| LunarLander-v2 | mean_reward | -167.32 +/- 88.93 | No |

La evaluacion se realizo sobre 10 episodios, tal y como indica la model card. El propio autor advierte que el resultado mostrado en la parte superior de la model card deberia reemplazarse por la media real del archivo evaluation.txt, lo que sugiere que la cifra puede ser provisional. No existen datos comparativos con otros agentes de LunarLander en la informacion disponible.

## Requisitos de hardware

- El modelo es extremadamente pequeño, con dos redes de 64 neuronas ocultas, por lo que cabe en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: no requiere VRAM dedicada; los pesos ocupan una fraccion minima de memoria.
- GPU recomendada: ninguna en particular; cualquier procesador es suficiente para ejecutar una unica inferencia.
- Despliegue: el modelo se carga directamente con PyTorch mediante un state dict. No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque estas herramientas estan orientadas a modelos de lenguaje.
- Latencia: no se han publicado datos de latencia ni throughput. En una CPU generica, la inferencia por paso es practicamente instantanea.

## Comparativa con modelos similares

No se dispone de datos comparables en la informacion proporcionada. No existen referencias a otros agentes de LunarLander-v2 con los que comparar parámetros, rendimiento o licencia. Tampoco es posible comparar este modelo con modelos de lenguaje, dado que pertenece a una categoría completamente distinta.

## Limitaciones y advertencias

- El rendimiento es bajo: la recompensa media de -167.32, con una desviacion de 88.93, indica que el agente no aterriza de forma fiable y, de hecho, suele obtener recompensas negativas.
- El resultado del benchmark no esta verificado y el propio autor indica que debe sustituirse por el valor real del archivo evaluation.txt.
- La licencia del modelo no esta disponible, por lo que cualquier uso comercial deberia considerarse con precaucion y previa consulta al autor.
- No es un modelo de lenguaje: no genera texto ni puede procesar lenguaje natural, por lo que no es util para chatbots, herramientas de codigo o agentes conversacionales.
- Para cargar los pesos es necesario recrear exactamente la arquitectura Actor-Critic descrita; si no se respetan las capas y activaciones, el state dict no cargara correctamente.
- Existe una inconsistencia entre la version del entorno mencionada en la tabla de entrenamiento (LunarLander-v3) y la que aparece en el resto de la documentacion (LunarLander-v2).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trangasaivarun/LunarLander-v2
- Repositorio relacionado del mismo autor: https://huggingface.co/trangasaivarun/ppo-LunarLander-v2
- No se han encontrado papers, blogs ni demos adicionales relevantes en la busqueda web.
