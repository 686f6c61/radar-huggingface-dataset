# yegom/connectailab-rl-yegomne-v4-link01

## Resumen

`yegom/connectailab-rl-yegomne-v4-link01` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3.5-0.8B`, publicado por el desarrollador Sehyun Park (Yegom) en el marco del ecosistema CONNECT TYCOON y CONNECT AI LAB. No es un modelo de lenguaje de propósito general: es un modelo de decisión ligero entrenado para controlar el robot bípedo simulado LINK-01 en la tarea `follow_route`, respondiendo con una sola letra la acción de locomoción a ejecutar durante los siguientes 0,5 segundos.

El problema que resuelve es la destilación de una política de refuerzo (PPO) en un modelo de lenguaje pequeño, de forma que un LLM de 0,8 mil millones de parámetros pueda sustituir a la red neuronal del "cerebro" del robot en el punto de decisión. El pipeline combina aprendizaje supervisado (imitación de las respuestas del cerebro PPO sobre 3.286 ejemplos de entrenamiento y validación) y un ajuste posterior con refuerzo (PPO con penalización KL), manteniendo el adaptador pequeño gracias a LoRA.

Su relevancia es acotada pero ilustrativa: demuestra que un LLM sub-1B puede actuar como cabecera de decisión en un bucle de control discreto, con un 95 % de éxito en 20 episodios de evaluación frente al 100 % del profesor PPO, y con un tamaño de repositorio de 0,0 GB (solo pesos del adaptador). Está pensado para investigación y educación en simulación, no para robótica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA es de tamaño reducido; el base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador LoRA se carga con `PeftModel.from_pretrained` y modifica el comportamiento del modelo base para la tarea de decisión; no se especifican en la información disponible el rango, el alpha ni los módulos objetivo del adaptador.

El entrenamiento se realizó en cinco fases descritas en la model card: (1) entrenamiento por refuerzo PPO de una política "cerebro" en el simulador web de CONNECT AI WORLD sobre el curso `4de2f96f` con la convención `link01-decision/follow_route/obs16-act5/walker51-14/v1`; (2) generación de un dataset de preguntas-respuesta a partir de las observaciones del cerebro cada 0,5 segundos, con un 20 % de ejemplos que incluyen desviaciones del camino; (3) aprendizaje supervisado (LoRA) para imitar al cerebro; (4) ajuste con PPO usando la recompensa del cerebro como señal, con anclaje KL al modelo supervisado; (5) evaluación del modelo colocado en el punto de decisión del robot sobre 20 episodios con semillas 91001–91020. El dataset contiene 2.193 ejemplos de entrenamiento, 433 de validación y 660 de test, con un techo de acierto del 99 % (proporción en que el cerebro responde lo mismo al pasar la observación a texto).

## Capacidades

- Decisión discreta de locomoción: dado un estado textual del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción anterior), devuelve una única letra correspondiente a una de las cinco acciones posibles.
- Formato de salida estricto: la instrucción de sistema exige devolver solo la letra de la opción elegida, sin explicación.
- Robustez ante estados de desvío: el entrenamiento incluye un 20 % de ejemplos donde el cerebro se salió del camino, para que el modelo aprenda a corregir.
- Integración con la librería `connect_tycoon.link01.questions`, que convierte observaciones del robot al formato de pregunta esperado.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- Sustitución del cerebro PPO en simulación: el adaptador se coloca en el punto de decisión del robot LINK-01 para evaluar si un LLM sub-1B puede replicar la política de refuerzo en el curso entrenado, con un 95 % de éxito en 20 episodios.
- Docencia de RL con LLM: el repositorio CONNECT TYCOON y el notebook de Colab permiten reproducir el pipeline completo (PPO → destilación supervisada → PPO sobre LoRA) como ejercicio práctico.
- Investigación en destilación de políticas: sirve como caso de estudio para medir la brecha entre una política PPO y su imitación por un LLM pequeño (100 % vs. 95 % de éxito; 100 % vs. 88,6 % de acierto frente al profesor).
- Evaluación de robustez ante distribución desplazada: los ejemplos de desvío del 20 % permiten probar la capacidad de recuperación del modelo en estados fuera de la trayectoria nominal.
- Prototipado de interfaces texto-acción: el formato de pregunta-respuesta con letra única es reutilizable para otras tareas de decisión discreta en entornos simulados.
- Comparación de estrategias de ajuste: el autor publica variantes (`-teacher`, `-floor`) que permiten contrastar configuraciones de entrenamiento sobre el mismo entorno.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre 20 episodios, semillas 91001–91020, con aproximación 2D de la marcha basada en tabla de velocidades):

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 100 % | 0 % | 49,1 s |
| Modelo antes de entrenar | 51,1 % | 0 % | 0 % | — |
| Aprendizaje supervisado (LoRA) | 88,6 % | 95 % | 0 % | 48,7 s |
| Ajuste con RL (PPO + KL) | 87,3 % | 95 % | 0 % | 47,8 s |

El autor indica que la evaluación de la marcha usa una aproximación 2D (tabla de velocidades por comando) en lugar del simulador MuJoCo, por lo que los resultados pueden diferir ligeramente de los del simulador web. No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamaño despreciable (repositorio de 0,0 GB); el coste real está en el modelo base Qwen3.5-0.8B.
- VRAM estimada para el base en fp16: en torno a 1,6 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 4 bits cabría por debajo de 1 GB, aunque no se documentan cuantizaciones publicadas para este adaptador.
- Cabe en cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs integradas con suficiente memoria compartida.
- Despliegue: la model card solo documenta `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integración con llama.cpp requeriría fusionar el adaptador y convertir a GGUF, paso no documentado.
- Latencia y throughput: no disponibles. La tarea exige una decisión cada 0,5 segundos en el bucle de control, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-yegomne-v4-link01 | Qwen3.5-0.8B | 0,8B + LoRA | No disponible | Decisión `follow_route` | Apache 2.0 |
| connectailab-rl-yegomfloor-v4 | No disponible en la información | No disponible | No disponible | Decisión (variante floor) | No disponible |
| connectailab-rl-yegomfloor-v4-teacher | No disponible en la información | No disponible | No disponible | Decisión (variante teacher) | No disponible |

No se dispone de información sobre modelos de terceros comparables en la misma categoría (LLM pequeños destilados de políticas RL para control de robots simulados). El autor publica variantes del mismo pipeline, pero no se detallan sus especificaciones.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo está entrenado para la tarea `follow_route` en el curso `4de2f96f`; no generaliza a otros mapas, robots ni tareas sin reentrenamiento.
- Idioma: la model card declara únicamente coreano (`ko`); el prompt de sistema está en inglés, pero no se documenta comportamiento en castellano.
- Evaluación limitada: 20 episodios y una aproximación 2D de la marcha, no el simulador MuJoCo completo; los resultados pueden no trasladarse al simulador o al robot real.
- El modelo de RL (87,3 % de acierto) rinde ligeramente peor que el de aprendizaje supervisado (88,6 %), y el autor indica que subió el de supervisado; conviene revisar cuál es el checkpoint recomendado.
- No apto para robótica real sin revalidación explícita en el robot y el espacio concretos, tal como advierte el propio autor.
- Riesgo de alucinación en el formato: el modelo podría devolver texto distinto de una letra válida; el pipeline debe validar la salida.
- Sin datos publicados sobre sesgos, contexto máximo, cuantizaciones ni latencia, lo que dificulta su uso en producción.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomne-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Variante floor: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v4
- Variante teacher: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v4-teacher
