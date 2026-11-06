# tgc97057/connectailab-rl-gs.lee-ana-v01-v02-link01

## Resumen

Connectailab-rl-gs.lee-ana-v01-v02-link01 es un adaptador LoRA publicado por el usuario tgc97057 en colaboración con CONNECT AI LAB y AI CITY BUILDERS. Se construye sobre el modelo base Qwen/Qwen3.5-0.8B y está especializado en una única tarea de decisión: dado el estado textual de un robot simulado LINK-01 (distancia al objetivo, dirección, sensores de distancia, velocidad y elección previa), devolver una letra que identifica el siguiente paso de 0,5 segundos entre un conjunto cerrado de opciones ("choose_object").

El modelo no es un LLM de propósito general, sino un "cerebro verbalizado": se entrenó destilando el comportamiento de una política PPO entrenada en un simulador web (brain.json), primero mediante aprendizaje supervisado (LoRA) y después con un paso de refuerzo con regularización KL que premia las opciones que habrían producido mejores recompensas si el resto del episodio lo hubiera continuado la política original. El pipeline declarado es `reinforcement-learning` y la librería `peft`.

Es relevante como ejemplo de integración entre RL clásico y modelos de lenguaje: demuestra que una política de robótica simulada puede expresarse como un problema de selección de opción única sobre texto y resolverse con un modelo de 0,8B parámetros. Su alcance, sin embargo, es muy acotado: un solo entorno, un solo conjunto de acciones y evaluación aproximada en 2D, no en MuJoCo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | no disponible (base de 0,8B; el adaptador LoRA añade un número no especificado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) según la model card; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El entrenamiento se realizó en cuatro fases descritas por el autor: (1) entrenamiento de una política PPO en un simulador web de robótica (tarea `choose_object`, contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1`, curso `f7221151`, éxito del 45% en el examen oficial); (2) generación de un dataset de preguntas-respuesta muestreando cada 0,5 s las observaciones del robot y etiquetando con la acción elegida por la política PPO, incluyendo un 20% de episodios donde la política se desvió; (3) ajuste supervisado con LoRA para imitar esas respuestas; (4) refinamiento con RL usando la recompensa que habría obtenido cada opción si el resto del episodio lo hubiera completado la política original, con anclaje KL para no alejarse demasiado del modelo supervisado.

El dataset contiene 1.682 ejemplos de entrenamiento, 168 de validación y 259 de test. La "tasa de acuerdo" entre la política PPO y el modelo verbalizado (techo de acierto) es del 100%, es decir, el formato textual preserva toda la información que la política necesitaba. La evaluación de caminata se hizo con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados de éxito no son directamente comparables con los del entorno original.

## Capacidades

- Selección de una única opción (letra) entre un conjunto cerrado de acciones de locomoción, dado un estado textual del robot.
- Interpretación de estados estructurados en lenguaje natural (distancias, direcciones, lecturas de sensores, velocidad, acción previa).
- Cumplimiento estricto de formato: el prompt de sistema pide devolver solo la letra, sin explicación.
- Robustez parcial ante estados que se desvían del comportamiento de la política original (20% del dataset de entrenamiento).
- Capacidad multilingüe limitada: el idioma declarado es coreano, aunque el prompt de sistema está en inglés.
- No se documentan capacidades de tool calling, agentes, matemáticas, código, visión ni audio.

## Casos de uso

- **Sustitución de la política PPO por un modelo verbalizable en el simulador LINK-01**: el adaptador se coloca en el puesto de decisión del robot y se le pasa el estado textual generado con `connect_tycoon.link01.questions.task_of`. Permite inspeccionar en lenguaje natural qué está "pensando" la política en cada paso de 0,5 s.
- **Investigación en destilación de políticas RL a LLM**: sirve como banco de pruebas reproducible para estudiar cómo se transfiere una política PPO a un modelo de lenguaje mediante SFT + RL con anclaje KL, con un dataset pequeño (1.682 ejemplos) y una métrica de acuerdo clara.
- **Docencia de RL y robótica simulada**: el notebook de Colab y el repositorio connect-tycoon permiten reproducir el pipeline completo (entrenamiento PPO, generación de preguntas, LoRA, evaluación) en un entorno controlado.
- **Generación de datos sintéticos de decisión**: el modelo puede usarse para etiquetar nuevos estados del simulador y ampliar el dataset de entrenamiento de otras políticas.
- **Prototipado de interfaces texto-acción para robots**: valida el patrón de convertir observaciones numéricas en texto y mapear la salida del LLM a un índice de acción, reutilizable en otros entornos con conjuntos de acciones discretos.
- **Auditoría de políticas RL**: al verbalizar la política, es posible comparar la decisión del LLM con la del cerebro original y detectar discrepancias o sesgos en estados poco representados.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Acierto en test (misma respuesta que la política PPO) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0% | 0% | 0% | — |
| Antes de entrenar | 91,1% | 0% | 0% | — |
| SFT (LoRA) | 100,0% | 0% | 0% | — |
| RL (este adaptador) | 100,0% | 0% | 0% | — |

Ninguna variante completó con éxito el curso en los 20 episodios evaluados (semillas 91001–91020), ni siquiera la política PPO original. La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo, por lo que estos números no miden desempeño real de locomoción. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo base de 0,8B en fp16 se sitúa típicamente en torno a 2 GB, pero el adaptador no especifica cuantizaciones ni requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del base (0,8B), pero no está documentado por el autor.
- Opciones de despliegue: el autor solo documenta `transformers` + `peft`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-gs.lee-ana-v01-v02-link01 | 0,8B (base) + LoRA | no disponible | Decisión discreta en simulador LINK-01 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM de propósito general | no disponible | Hugging Face |
| Política PPO original (brain.json) | no disponible | no aplica | Decisión discreta en simulador LINK-01 | no disponible | Repositorio connect-tycoon |

No se dispone de otros adaptadores comparables de la misma familia en la información proporcionada.

## Limitaciones y advertencias

- **Alcance extremadamente estrecho**: solo resuelve la tarea `choose_object` del simulador LINK-01; no es un LLM de propósito general ni se espera que funcione fuera de ese contrato.
- **Evaluación aproximada**: el éxito de caminata se mide con una tabla 2D de velocidades, no con MuJoCo; los resultados pueden diferir del simulador real.
- **Cero éxito en los 20 episodios evaluados**, incluida la política PPO original; el modelo replica fielmente al profesor, pero el profesor no completa el curso en esa configuración.
- **Riesgo de alucinación de letra**: si el estado se sale de la distribución de entrenamiento, el modelo puede devolver una opción válida sintácticamente pero incorrecta; el prompt de sistema exige solo la letra, sin margen para explicar la incertidumbre.
- **Idioma**: declarado coreano; el prompt de sistema está en inglés, lo que puede introducir inconsistencias en el tokenizador.
- **Uso comercial**: la licencia Apache 2.0 lo permite, pero el autor advierte que es un modelo de investigación y educación y que debe revalidarse en cada robot y espacio antes de usarlo en producción.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni issues documentados.
- **Sin datos de sesgo**: no se han publicado análisis de sesgos ni evaluaciones de robustez fuera del curso de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tgc97057/connectailab-rl-gs.lee-ana-v01-v02-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Laboratorio web del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
