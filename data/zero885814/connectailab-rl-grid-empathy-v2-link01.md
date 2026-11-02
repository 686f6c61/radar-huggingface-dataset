# zero885814/connectailab-rl-grid-empathy-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario zero885814 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para robótica: recibe en texto el estado de un robot caminante (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y emite una única letra que corresponde a la acción de locomoción para los siguientes 0,5 segundos. La tarea concreta se denomina `goto_target` dentro del simulador web de aprendizaje por refuerzo del proyecto.

El modelo se construye destilando el comportamiento de una política PPO entrenada en el simulador (el "cerebro", serializado como `brain.json`) hacia el modelo lingüístico mediante un pipeline en dos fases: primero aprendizaje supervisado con LoRA sobre pares observación-texto → acción del cerebro, y después un ajuste con refuerzo (PPO con anclaje KL) que reordena las preferencias entre las opciones de acción según la recompensa acumulada que habría obtenido el cerebro. El conjunto de datos consta de 278 ejemplos de entrenamiento, 124 de validación y 85 de prueba.

Su relevancia es acotada y experimental: demuestra que una política de control entrenada con RL puede transferirse a un modelo de lenguaje pequeño (0,8B de parámetros) y ejecutarse mediante generación de texto, con una tasa de coincidencia con el profesor del 71,8 % en el conjunto de prueba y un 30 % de éxito en 20 episodios de la misma pista. Es un artefacto de investigación y educación, no un componente listo para producción robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parámetros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base tiene 0,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantización | No disponible (pesos del adaptador en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | Coreano (`ko`) según la etiqueta del repositorio; las entradas y salidas son letras de opción y texto de estado en formato fijo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El entrenamiento sigue cuatro etapas descritas por el autor: (1) entrenamiento de la política PPO en el simulador web con la tarea `goto_target`, contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1` y pista `9a9d1db9`, con un 100 % de éxito en la prueba oficial; (2) generación de un "cuaderno de problemas" muestreando cada 0,5 segundos la observación del cerebro convertida a texto, con la acción del cerebro como etiqueta y un 20 % de ejemplos con acciones alternativas que desviaban al robot; (3) aprendizaje supervisado con LoRA para imitar al cerebro; y (4) ajuste con refuerzo (PPO con restricción KL) donde cada opción se puntúa con la recompensa que habría obtenido el cerebro si hubiera ejecutado esa acción y después hubiera continuado él mismo.

La observación consta de 21 valores (frente a los 10 de versiones sin obstáculos), correspondientes a cinco obstáculos añadidos a la pista; el espacio de acciones es de 5 opciones discretas. La innovación técnica destacable no está en la arquitectura del transformer, sino en el método de destilación de políticas RL a un LM mediante preguntas en formato de elección múltiple y un ajuste posterior con recompensas contrafactuales derivadas del profesor.

## Capacidades

- Decisión de locomoción de un robot caminante en la tarea `goto_target`: dada una observación textual, devuelve una única letra de opción (A–E) que codifica la acción para los siguientes 0,5 segundos.
- Seguimiento de instrucciones de formato estricto: el prompt de sistema exige devolver solo la letra, sin explicación.
- Tratamiento de datos como datos: el prompt de sistema instruye a no interpretar el contenido del estado como instrucciones, una mitigación básica de inyección de prompt en la entrada.
- Razonamiento de un solo paso: no hay capacidad de planificación multi-paso, tool calling, uso de agentes ni memoria conversacional.
- Capacidades multilingües: limitadas al coreano declarado y a los formatos de pregunta generados por la librería `connect_tycoon.link01`.
- No dispone de visión, audio, modo de pensamiento explícito ni generación de texto libre más allá de la letra de respuesta.

## Casos de uso

- Investigación en destilación de políticas RL: usar el adaptador como referencia para estudiar cómo se transfiere una política PPO a un modelo de lenguaje y medir la pérdida de rendimiento respecto al profesor (71,8 % de coincidencia frente al 100 % del cerebro).
- Docencia en aprendizaje por refuerzo: el pipeline completo (entrenar cerebro en el simulador web, generar el cuaderno de problemas, hacer SFT y luego PPO con KL) sirve como ejercicio práctico reproducible con el notebook de Colab enlazado.
- Evaluación de robustez ante cambios de simulador: el autor documenta que al pasar de 10 a 21 sensores y añadir obstáculos el rendimiento de las IA de referencia del entorno web cayó del 100 % al 90 %, lo que convierte al modelo en un caso de estudio sobre sensibilidad al dominio.
- Prototipado de interfaces lenguaje-acción: experimentar con arquitecturas en las que un LM emite comandos discretos de bajo nivel para un controlador, sin sustituir al controlador real.
- Generación de datos sintéticos de decisión: usar las preguntas y respuestas del adaptador como corpus auxiliar para entrenar o evaluar otros modelos de decisión en la misma pista.
- Pruebas de formato y robustez de prompts: validar pipelines que exigen salidas de un solo token y resistencia a instrucciones embebidas en los datos de entrada.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre la pista `9a9d1db9`:

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 100 % | 0 % | 6,2 s |
| Antes del entrenamiento | 22,4 % | 0 % | 0 % | — |
| Aprendizaje supervisado (LoRA) | 71,8 % | 30 % | 35 % | 5,8 s |
| Ajuste con refuerzo (este modelo) | 71,8 % | 30 % | 35 % | 5,8 s |

Nota metodológica del autor: la evaluación de la marcha usa una aproximación 2D basada en una tabla de velocidades por comando del simulador web MuJoCo, sin red neuronal de marcha, por lo que no hay caídas y los resultados pueden diferir ligeramente de MuJoCo. El ajuste con refuerzo no mejora las métricas agregadas respecto al SFT en estos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de tamaño despreciable; el coste lo determina el modelo base de 0,8B. En FP16 requiere aproximadamente 1,6 GB solo para pesos, más caché KV y overhead del runtime; en cuantización de 8 bits o 4 bits del modelo base cabe holgadamente en GPUs de 4–8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; para despliegue por lotes, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 6 GB o más, al ser un modelo base de 0,8B.
- Opciones de despliegue: `transformers` + `peft` (procedimiento documentado por el autor con `PeftModel.from_pretrained`); vLLM, TGI, llama.cpp u Ollama requerirían fusionar el adaptador con el modelo base y convertir los pesos, algo no documentado en la model card.
- Latencia y throughput: no disponibles. Al tratarse de una generación de un único token por decisión, la latencia esperada es baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-grid-empathy-v2-link01 | Adaptador LoRA sobre 0,8B | No disponible | Decisión discreta `goto_target` (5 acciones) | Apache 2.0 | HuggingFace, 0 descargas |
| Cerebro PPO del simulador (profesor) | No disponible (política RL) | No aplica | Misma tarea | No declarada | `brain.json` en el proyecto CONNECT TYCOON |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No declarada en esta ficha | HuggingFace |
| Políticas RL para locomoción (p. ej. MuJoCo, Stable-Baselines3) | Depende de la red | No aplica | Control continuo o discreto | Variable | Repositorios públicos |

No se dispone de comparativas publicadas frente a otros adaptadores de decisión de la misma familia, ni de cifras de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) para este adaptador.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `goto_target` en la pista `9a9d1db9` con 21 observaciones y 5 acciones; fuera de ese contrato el comportamiento no está validado.
- Pérdida de rendimiento frente al profesor: 71,8 % de coincidencia en test y 30 % de éxito en 20 episodios, frente al 100 % del cerebro PPO. El ajuste con refuerzo no mejora al SFT en las métricas publicadas.
- Evaluación aproximada: la marcha se puntúa con una tabla de velocidades 2D, no con el simulador MuJoCo completo; los resultados pueden no trasladarse al simulador real ni a un robot físico.
- Riesgo de alucinación de acción: al ser un LM generando una letra, puede emitir opciones no válidas o texto adicional si el prompt se desvía del formato esperado; el prompt de sistema mitiga parcialmente la inyección de instrucciones en el estado.
- Idiomas: etiquetado únicamente como coreano; no hay validación multilingüe ni garantías en castellano.
- Sesgos: no documentados por el autor; al entrenarse sobre una única pista y un único cerebro profesor, hereda los sesgos de esa política concreta.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B tiene sus propias condiciones, que deben verificarse por separado.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulador; antes de usarlo en un robot real hay que revalidarlo en ese robot y en ese espacio.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la consulta; el proyecto se declara en fase de pruebas ("el experimento de conexión de modelos está en pruebas").

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zero885814/connectailab-rl-grid-empathy-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
