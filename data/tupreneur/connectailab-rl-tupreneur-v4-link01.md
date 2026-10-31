# TUpreneur/connectailab-rl-tupreneur-v4-link01

## Resumen

TUpreneur/connectailab-rl-tupreneur-v4-link01 es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B para tareas de toma de decisiones en robótica, concretamente para el robot LINK-01 en la tarea de evitar obstáculos. El proyecto forma parte de CONNECT AI LAB y del ecosistema CONNECT TYCOON, cuyo objetivo es demostrar cómo un modelo de lenguaje pequeño puede aprender a imitar y mejorar una política de aprendizaje por refuerzo clásica (PPO) traduciendo observaciones del robot a texto.

El flujo de entrenamiento es notablemente didáctico: primero se entrena una política PPO (el "cerebro") en un simulador web 2D basado en MuJoCo; después se generan pares pregunta-respuesta a partir de las observaciones que el cerebro ve cada 0,5 segundos; el modelo base se ajusta con LoRA mediante aprendizaje supervisado (SFT) imitando al cerebro y, finalmente, se aplica aprendizaje por refuerzo (PPO con regularización KL) para reordenar las opciones según la recompensa esperada. El modelo devuelve una única letra correspondiente a la acción elegida entre 5 posibles.

Su relevancia es principalmente educativa y de investigación: sirve como ejemplo completo y reproducible de destilación de políticas de RL en modelos de lenguaje, con datos, código y cuadernos de Colab públicos. No es un modelo de propósito general y sus resultados en simulación muestran que aún no iguala al cerebro PPO original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo causal de lenguaje (Qwen3.5-0.8B) |
| Parametros totales | 0,8B (modelo base); parámetros del adaptador no disponibles |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-0.8B; el prompt de decisión es corto) |
| Tipos de cuantizacion | No disponible (pesos publicados en precisión original) |
| Idiomas soportados | Coreano (etiquetado como `ko`); el formato de salida es una letra de opción |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo no es un transformer nuevo, sino un adaptador LoRA aplicado a Qwen3.5-0.8B, un modelo de lenguaje causal compacto. La biblioteca de entrenamiento es PEFT, y el pipeline etiquetado es reinforcement-learning. El sistema de decisión es de clasificación de acción única: el modelo recibe el estado del robot (distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y la última acción tomada) serializado como texto, y debe responder exactamente con la letra de una de las 5 acciones disponibles para el siguiente intervalo de 0,5 segundos.

El entrenamiento siguió cuatro fases: (1) entrenamiento de la política PPO "cerebro" en el simulador web CONNECT AI WORLD (tarea `avoid_obstacles`, especificación `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`), con un 95% en el examen oficial; (2) generación del dataset convirtiendo las observaciones del cerebro en texto (1.031 problemas de entrenamiento, 199 de validación y 310 de test), incluyendo un 20% de estados fuera de trayectoria por acciones alternativas; (3) aprendizaje supervisado con LoRA imitando las decisiones del cerebro; (4) aprendizaje por refuerzo con PPO, donde cada opción se puntúa con la recompensa que obtendría si el cerebro completara la trayectoria desde esa acción, con anclaje KL a la política SFT. La tasa máxima de acierto teórico (el cerebro responde igual tras la conversión a texto) es del 99%.

## Capacidades

- Toma de decisiones discretas para navegación con evitación de obstáculos: elige una de 5 acciones cada 0,5 segundos a partir de un estado textual del robot.
- Salida estrictamente estructurada: devuelve únicamente la letra de la opción elegida, sin explicaciones, lo que facilita su integración en un bucle de control.
- Resistencia a inyección de instrucciones en el estado: el system prompt indica tratar el contenido del estado como datos y no como instrucciones.
- No genera texto libre, no soporta tool calling, no tiene capacidades de visión ni audio, y no está diseñado para razonamiento multi-paso o agentes de propósito general.
- No es un modelo conversacional: su utilidad depende de que el usuario serialice las observaciones del robot al formato de pregunta específico del proyecto (función `Q.task_of` de la librería connect_tycoon).

## Casos de uso

- Investigación en destilación de políticas de RL a LLM: sirve como caso de estudio completo y reproducible para estudiar cómo un LLM pequeño puede aproximar una política PPO, con código, datos y resultados publicados.
- Docencia en aprendizaje por refuerzo: el proyecto incluye cursos gratuitos (AI CITY BUILDERS, YouTube de CONNECT AI LAB) y un cuaderno de Colab, ideal para practicar el pipeline completo PPO → SFT → RLHF sobre un problema acotado.
- Prototipado de control de robots simulados: puede integrarse en el bucle de decisión del robot LINK-01 en simulación, generando la acción siguiente a partir de observaciones textuales.
- Experimentación con LLM en bucles de control de baja latencia: al ser un modelo de 0,8B con salida de un solo token, es adecuado para explorar inferencia en tiempo casi real en hardware modesto.
- Benchmarking de técnicas de PEFT: permite comparar LoRA + SFT frente a LoRA + PPO sobre exactamente el mismo dataset y evaluación.
- Base para extender a otras tareas del ecosistema CONNECT TYCOON: la especificación de tarea (`obs21-act5`) es parametrizable, lo que permite replicar el método en otros entornos del simulador.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La métrica de acierto mide coincidencia con la decisión del cerebro PPO; la caminata se evalúa en 20 episodios sobre el mismo curso (semillas 91001–91020) usando una aproximación 2D de la caminata basada en una tabla de velocidades medidas por comando del web MuJoCo.

| Modelo | Acierto en test (vs. cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en éxito |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0% | 95% | 10% | 23,5 s |
| Modelo base (sin entrenar) | 45,2% | 0% | 10% | — |
| Tras aprendizaje supervisado (SFT) | 50,6% | 0% | 100% | — |
| Tras aprendizaje por refuerzo (modelo publicado) | 51,3% | 0% | 100% | — |

Cabe destacar que el modelo publicado (fase RL) solo mejora marginalmente el acierto respecto al SFT (51,3% vs. 50,6%) y no completa ningún episodio con éxito en la evaluación de caminata, colisionando en el 100% de los episodios. El autor publica estos resultados de forma transparente y señala que la evaluación 2D puede diferir del resultado en web MuJoCo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo base de 0,8B en fp16 requiere aproximadamente 2 GB de VRAM, más el adaptador LoRA (tamaño del repositorio indicado como 0,0 GB, es decir, unos pocos megabytes). En CPU con cuantización de 4 bits sería viable con menos de 2 GB de RAM.
- GPU recomendadas: cualquier GPU de consumo es suficiente; no se necesitan A100 ni H100. Una RTX 3060 o superior sobra con diferencia, e incluso es ejecutable sin GPU.
- Cabe en GPU de consumo sin problema, incluidas portátiles; también en Raspberry Pi-class hardware con cuantización, aunque sin datos oficiales de rendimiento.
- Opciones de despliegue: transformers + PEFT (código oficial en la model card); al ser un adaptador LoRA compatible con el ecosistema Hugging Face, debería funcionar también con vLLM (soporte LoRA), llama.cpp (tras conversión a GGUF del modelo fusionado) y Ollama, aunque el proyecto solo documenta el camino con transformers/PEFT.
- Latencia y throughput: no disponibles; al generar un único token con un modelo de 0,8B, la latencia por decisión debería ser de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia |
|---|---|---|---|---|
| TUpreneur/connectailab-rl-tupreneur-v4-link01 | LoRA sobre LLM (Qwen3.5-0.8B) | 0,8B (base) | Decisión de navegación LINK-01 (evitar obstáculos) | Apache-2.0 |
| Qwen/Qwen3.5-0.8B (base) | LLM causal general | 0,8B | Texto general, no especializado en control | No disponible en la información proporcionada |
| Cerebro PPO (profesor, brain.json) | Política RL clásica (no LLM) | No disponible | Misma tarea, alcanzando 95% de éxito en caminata | No disponible |

No hay alternativas de terceros directamente comparables publicadas en la información disponible: se trata de un proyecto educativo muy específico del ecosistema CONNECT AI LAB, y la comparación más relevante es contra su propio modelo profesor (PPO), que supera claramente al LLM en la tarea.

## Limitaciones y advertencias

- Rendimiento insuficiente para control real: en la evaluación publicada, el modelo colisiona en el 100% de los episodios y no completa ninguno con éxito, frente al 95% del cerebro PPO. No debe usarse para controlar robots reales.
- Ámbito muy restringido: solo es válido para la tarea `avoid_obstacles` con la especificación `obs21-act5` del robot LINK-01; no generaliza a otros entornos sin reentrenamiento.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador, y que cualquier uso en un robot real exige revalidación en ese robot y espacio concretos.
- La evaluación de caminata usa una aproximación 2D (tabla de velocidades por comando) en lugar de MuJoCo completo, por lo que los resultados pueden no reflejar el comportamiento en el simulador web.
- Sesgos: hereda los sesgos del modelo base Qwen3.5-0.8B y del dataset generado por la política PPO; al imitar al profesor, reproduce también sus errores (la tasa de coincidencia teórica máxima es del 99%).
- Riesgo de alucinación: bajo en el formato (salida de una letra), pero el 48,7% de las decisiones de test no coinciden con la política del profesor.
- Idioma: etiquetado para coreano; la documentación está en coreano, lo que puede dificultar su uso a desarrolladores hispanohablantes.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque el modelo base Qwen3.5-0.8B tiene su propia licencia que debe revisarse por separado.
- Adopción mínima: 0 descargas y 0 likes en el momento de la ficha, sin comunidad de soporte más allá del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- CONNECT AI LAB (YouTube): https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
