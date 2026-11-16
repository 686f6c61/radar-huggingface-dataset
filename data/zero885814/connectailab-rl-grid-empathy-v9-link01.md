# zero885814/connectailab-rl-grid-empathy-v9-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor zero885814 en el marco del laboratorio CONNECT AI LAB en colaboración con AI CITY BUILDERS. No es un modelo de lenguaje de propósito general: es un modelo de decisión entrenado para leer el estado de un robot simulado (distancia al objetivo, orientación, sensores de distancia, velocidad y acción previa) y responder con una única letra que representa el movimiento a ejecutar durante los siguientes 0,5 segundos en una tarea de evitación de obstáculos (`avoid_obstacles`).

El modelo se construye mediante un proceso en dos fases: primero se entrena una política PPO (el «cerebro» o `brain.json`) en el simulador web CONNECT AI WORLD, y después se destila ese comportamiento en el modelo de lenguaje mediante supervisión (LoRA) y un posterior ajuste con refuerzo (PPO con anclaje KL). El resultado es un adaptador de muy pequeño tamaño que traduce observaciones textualizadas a decisiones discretas, con el objetivo de que el modelo lingüístico reproduzca la política del profesor.

Su relevancia es fundamentalmente metodológica y educativa: demuestra un pipeline completo de destilación de políticas de refuerzo en modelos de lenguaje pequeños, con validación en un conjunto de test y evaluación de despliegue en 20 episodios de simulación. El modelo está pensado para investigación y docencia en robótica simulada, no para producción real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización del modelo base no especificada) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA. La tarea es de clasificación restringida: dado un estado del robot textualizado, el modelo debe devolver exactamente una letra entre las opciones listadas. El pipeline de entrenamiento consta de cuatro etapas documentadas: (1) entrenamiento de la política PPO en el simulador web con el curso `random` y `8bb27dff` (tarea `avoid_obstacles`, contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`), con un 95% de éxito en el examen oficial; (2) generación de un dataset de preguntas a partir de las observaciones del cerebro cada 0,5 segundos, con la respuesta del cerebro como etiqueta y un 20% de ejemplos con desviaciones; (3) ajuste supervisado del modelo de lenguaje con LoRA; y (4) ajuste con refuerzo PPO donde la recompensa de cada opción se estima como el retorno obtenido si el cerebro hubiera continuado la trayectoria tras esa elección, con anclaje KL para evitar el colapso.

El conjunto de datos se divide en 989 ejemplos de entrenamiento, 198 de validación y 287 de test. El autor reporta que la tasa de fidelidad de la textualización (el cerebro responde lo mismo cuando la observación se convierte a texto) es del 100%, lo que fija el techo teórico de acierto del modelo destilado. La evaluación de despliegue se realiza con una aproximación 2D de la marcha (tabla de velocidades por comando derivada de MuJoCo web), sin red neuronal de marcha, por lo que no hay caídas y los resultados pueden diferir ligeramente de MuJoCo.

## Capacidades

- Toma de decisiones discretas en una tarea concreta de evitación de obstáculos: recibe estado (distancia y dirección al objetivo, sensores de distancia, velocidad, acción previa) y devuelve una letra de acción.
- Salida de formato estricto: una única letra, sin explicación, según el prompt de sistema indicado por el autor.
- Tratamiento del contenido del estado como datos y no como instrucciones (prompt de sistema orientado a robustez frente a inyección).
- Destilación de política PPO: reproduce, con fidelidad parcial, las decisiones de un cerebro de refuerzo entrenado en simulador.
- Capacidad multilingüe limitada al coreano según la model card; el prompt de sistema está en inglés.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Docencia de destilación de políticas: usar el par cerebro PPO + adaptador LoRA como ejemplo completo de pipeline de refuerzo a lenguaje en cursos de RL y robótica simulada.
- Investigación en fidelidad de destilación: comparar la tasa de coincidencia del adaptador (66,9% en test) con el techo del 100% del profesor para estudiar la pérdida de información en la textualización de observaciones.
- Evaluación de robustez ante generalización de curso: replicar el experimento del autor mezclando cursos de entrenamiento y midiendo la caída de rendimiento en cursos no vistos (80%, 65% frente al 100% en el curso propio).
- Prototipado de agentes de decisión de bajo coste: desplegar el adaptador como clasificador de acciones en un bucle de simulación ligero, dado que el modelo base de 0,8B cabe en hardware modesto.
- Estudio de ajuste con refuerzo sobre modelos pequeños: analizar el efecto del PPO con anclaje KL sobre una política destilada, comparando las métricas de éxito (30% supervisado frente a 25% con RL) y de tiempo medio (33,2 s frente a 24,6 s).
- Generación de datos sintéticos de decisión: usar el modelo como generador de etiquetas alternativas para aumentar el dataset de entrenamiento de políticas en simulador.
- Pruebas de seguridad de prompt: verificar que el modelo respeta la instrucción de tratar el estado como datos y no ejecuta instrucciones embebidas en la observación.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (evaluación sobre 287 preguntas de test y 20 episodios de despliegue con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 20,4 s |
| Modelo sin entrenar | 31,7% | 0% | 20% | — |
| Ajuste supervisado (LoRA) | 62,0% | 30% | 45% | 33,2 s |
| Ajuste con refuerzo (PPO) | 66,9% | 25% | 35% | 24,6 s |

El autor indica que el modelo publicado corresponde al ajuste supervisado. La evaluación de marcha emplea una aproximación 2D con tabla de velocidades por comando, no el simulador MuJoCo completo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; el modelo base de 0,8B en precisión completa requiere del orden de 1,6 GB de pesos, y el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería alojar el modelo base en FP16.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU mediante cuantización del modelo base.
- Opciones de despliegue: transformers + peft (procedimiento documentado por el autor); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles. El autor reporta tiempos de episodio de simulación (20,4 s a 33,2 s), no latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-grid-empathy-v9-link01 | Adaptador LoRA sobre 0,8B | no disponible | Decisión en evitación de obstáculos | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Lenguaje general | no disponible en la información | Hugging Face |
| Política PPO `brain.json` (profesor) | no disponible | no aplica | Decisión en evitación de obstáculos | no disponible | Repositorio del autor |

No se dispone de información sobre otros adaptadores de destilación de políticas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `avoid_obstacles` con el contrato y el conjunto de acciones especificados; no es un modelo de lenguaje de uso general.
- Rendimiento limitado: 66,9% de coincidencia con el profesor en test y 25–30% de éxito en despliegue, frente al 100% del cerebro PPO.
- Evaluación de marcha aproximada: la métrica de éxito usa una tabla 2D de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden no trasladarse a un robot real.
- Idiomas: la model card declara únicamente coreano; el prompt de sistema está en inglés y el soporte multilingüe no está documentado.
- Sesgos: no documentados por el autor; al derivar de un simulador, puede heredar sesgos de la distribución de cursos y observaciones de entrenamiento.
- Riesgo de alucinación: el formato de salida restringido reduce el riesgo, pero el modelo puede emitir letras no válidas o incorrectas; el autor no documenta tasas de salida inválida.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, no incluida en la información disponible.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Repositorio sin descargas ni interacciones en el momento de la consulta; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zero885814/connectailab-rl-grid-empathy-v9-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
