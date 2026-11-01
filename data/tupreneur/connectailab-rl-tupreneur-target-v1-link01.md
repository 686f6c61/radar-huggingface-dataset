# TUpreneur/connectailab-rl-tupreneur-target-v1-link01

## Resumen

LINK-01 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B que actúa como política de decisión para un robot simulado de locomoción. El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la siguiente acción de caminata para los próximos 0,5 segundos. Lo desarrolla TUpreneur en el marco del laboratorio CONNECT AI LAB, en colaboración con AI CITY BUILDERS, y se publica bajo licencia Apache 2.0.

El interés técnico del modelo no reside en sus capacidades generales de lenguaje, sino en su método de construcción: primero se entrena una política PPO en un entorno web de aprendizaje por refuerzo (tarea `goto_target`, observación de 21 dimensiones, 5 acciones discretas), después se destila esa política en un modelo de lenguaje mediante aprendizaje supervisado con LoRA, y finalmente se refina con RL (PPO con anclaje KL) usando como señal de recompensa la evaluación de cada acción en el simulador. Es un ejemplo compacto de destilación de política RL a un LLM pequeño y de uso de un LLM como controlador de decisiones secuenciales.

Se trata de un modelo de investigación y educación (0,1 GB de repositorio, adaptador PEFT), no de un modelo de propósito general. Su ámbito es muy acotado: la tarea `goto_target` en un entorno 2D aproximado, con idioma declarado coreano y sin datos de benchmarks estándar de NLP publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | no disponible (adaptador LoRA sobre un modelo base de 0,8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (`ko` declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 800 millones de parámetros. El adaptador se entrena en cuatro fases según la model card: (1) entrenamiento de una política PPO en el simulador web (tarea `goto_target`, contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1`, curso `4e5ae63b`, con un 100 % de éxito en la prueba oficial); (2) generación de un conjunto de problemas textuales a partir de las observaciones del robot cada 0,5 segundos, con la acción del profesor como etiqueta y un 20 % de ejemplos con desviaciones del camino; (3) aprendizaje supervisado con LoRA para imitar al profesor; y (4) refinamiento con RL (PPO con anclaje KL) donde la recompensa de cada opción es la recompensa acumulada que habría obtenido el profesor al continuar desde esa acción.

El conjunto de datos contiene 1.200 ejemplos de entrenamiento, 240 de validación y 360 de prueba. La evaluación de la política se realiza sobre una aproximación 2D de la locomoción (tabla de velocidades por comando derivada de MuJoCo web), por lo que no hay caídas y los resultados pueden diferir ligeramente de la simulación MuJoCo real. El prompt de sistema exige devolver únicamente la letra de la opción elegida, sin explicación, y tratar el contenido del estado como datos y no como instrucciones.

## Capacidades

- Selección de una acción discreta (una letra entre las opciones listadas) a partir de una descripción textual del estado del robot.
- Razonamiento de decisión de horizonte corto (0,5 segundos por paso) en la tarea `goto_target`.
- Seguimiento de instrucciones de formato estricto: devuelve solo la letra, sin texto adicional.
- Robustez parcial ante estados fuera de distribución: se entrenó con un 20 % de ejemplos de caminos desviados.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni generación de código.
- Capacidad multilingüe limitada al coreano declarado; el prompt de sistema está en inglés.

## Casos de uso

- Investigación en destilación de políticas RL a LLM: sirve como caso de estudio reproducible de cómo convertir una política PPO en un modelo de lenguaje mediante SFT + RL con anclaje KL, usando el código de CONNECT TYCOON.
- Educación en aprendizaje por refuerzo: el notebook de Colab permite reproducir el pipeline completo (simulador web, generación de problemas, LoRA, PPO) en un entorno de bajo coste.
- Controlador de decisión en simulaciones 2D: puede integrarse como política de navegación hacia un objetivo en entornos de rejilla o aproximaciones 2D, sustituyendo a la red de caminata original.
- Evaluación comparativa de métodos de destilación: permite medir la brecha entre la política profesora (100 % de acierto en test) y las versiones SFT y RL (86,9 % y 80,8 %) en una tarea acotada.
- Prototipado de interfaces texto-acción para robótica: útil para experimentar con la representación textual de observaciones (21 dimensiones) y acciones (5 opciones) antes de escalar a robots reales.
- Generación de datos sintéticos de decisión: el modelo puede producir etiquetas de acción para estados descritos textualmente, útiles para aumentar conjuntos de entrenamiento en tareas similares.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación propia, no benchmarks estándar de NLP):

| Modelo | Acierto en test (misma acción que el profesor) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0 % | 65 % | 10 % | 29,1 s |
| Antes del entrenamiento | 30,0 % | 0 % | 0 % | — |
| SFT (LoRA supervisado) | 86,9 % | 30 % | 15 % | 29,2 s |
| RL (PPO + KL) | 80,8 % | 35 % | 30 % | 29,6 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo de 0,8B, la inferencia en fp16 requiere del orden de 2 GB de VRAM, y en cuantización de 4 bits puede caber en menos de 1 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo base de 0,8B; para el pipeline de entrenamiento completo se recomienda al menos una GPU con 8-16 GB.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del modelo base.
- Opciones de despliegue: `transformers` + `peft` (según el ejemplo de la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador sobre 0,8B | no disponible | Decisión `goto_target` en robot simulado | Apache 2.0 | HuggingFace (0 descargas) |
| Política PPO profesora (brain.json) | no disponible | no aplica | Decisión `goto_target` | no disponible | Incluida en el repositorio CONNECT TYCOON |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | Lenguaje general | no disponible en esta ficha | HuggingFace |

No se dispone de información sobre otros adaptadores RL comparables del mismo autor o de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `goto_target` con la representación de observación concreta (21 dimensiones) y el conjunto de 5 acciones del contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1`.
- Evaluación aproximada: la locomoción se mide con una tabla 2D de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden no trasladarse al entorno real.
- Brecha respecto al profesor: el modelo RL acierta el 80,8 % de las acciones del profesor y solo completa el 35 % de los episodios, frente al 65 % del profesor.
- Mayor tasa de colisiones en la versión RL (30 %) que en SFT (15 %) y en el profesor (10 %).
- No apto para uso directo en robots reales sin revalidación en el robot y el espacio concretos, tal como advierte el propio autor.
- Idioma declarado coreano; el prompt de sistema está en inglés y no se documenta un rendimiento multilingüe.
- Sin datos publicados sobre sesgos, alucinación en texto libre ni comportamiento fuera de la tarea de decisión.
- Modelo de investigación y educación; no se documenta soporte para producción ni mantenimiento.
- Riesgo de inyección de instrucciones: el prompt de sistema indica tratar el estado como datos, pero no se documentan pruebas de robustez frente a prompts maliciosos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-target-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
