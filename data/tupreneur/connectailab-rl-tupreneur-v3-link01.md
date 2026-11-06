# TUpreneur/connectailab-rl-tupreneur-v3-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por TUpreneur en el marco del laboratorio colaborativo CONNECT AI LAB. No es un modelo de lenguaje generalista: es un modelo de decisión especializado que traduce observaciones textuales de un robot simulado (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) en una única letra de acción que indica cómo debe caminar el robot durante los siguientes 0,5 segundos. El dominio concreto es la tarea `avoid_obstacles` del simulador web de CONNECT AI WORLD.

El modelo se entrenó en dos fases: primero un ajuste supervisado (LoRA) sobre 1.180 ejemplos de entrenamiento generados haciendo que una política PPO previamente entrenada (el "cerebro", brain.json) recorriera un circuito y registrara sus decisiones; después una fase de aprendizaje por refuerzo con PPO y anclaje KL, usando como señal de recompensa el retorno que habría obtenido el cerebro si hubiera ejecutado cada opción alternativa. El resultado es un modelo de 0,8 mil millones de parámetros (heredados del base) que responde con una sola letra y sin explicación, lo que lo hace extremadamente barato de ejecutar y de integrar en bucles de control de baja latencia.

Su relevancia es acotada pero interesante como caso de estudio: demuestra cómo destilar una política de RL en un modelo de lenguaje pequeño mediante LoRA, y publica métricas de éxito y colisiones en un banco de 20 episodios con semillas fijas. Los resultados son modestos (60,9 % de coincidencia con el profesor y 0 % de episodios completados con éxito en el banco de evaluación), por lo que debe considerarse un prototipo de investigación y no un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Qwen3.5-0.8B) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko); las instrucciones y el formato de pregunta se documentan en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-0.8B |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | reinforcement-learning |
| Fecha de creación | 2026-10-31 |
| Última actualización | 2026-11-01 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del base: añade matrices de bajo rango en las capas que el autor seleccionó (no se detalla qué módulos). La tarea se formula como clasificación de una sola letra entre las opciones presentadas en el enunciado, con un system prompt que instruye al modelo a tratar el contenido del estado como datos y a devolver únicamente la letra.

El entrenamiento tuvo cuatro etapas documentadas: (1) entrenamiento de una política PPO en el simulador web sobre la tarea `avoid_obstacles`, con un contrato de tarea versionado (`link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`) y un 100 % de éxito en la prueba oficial; (2) generación de un corpus de preguntas a partir de las observaciones del cerebro cada 0,5 segundos, con la respuesta del cerebro como etiqueta y un 20 % de ejemplos con acciones alternativas que desviaban al robot; (3) ajuste supervisado LoRA sobre ese corpus (1.180 ejemplos de entrenamiento, 255 de validación y 386 de test); y (4) refinamiento con PPO y anclaje KL, usando como recompensa el retorno que habría obtenido el cerebro al ejecutar cada opción y el resto de la trayectoria. El techo de acierto del corpus se estima en un 99 % (coincidencia cerebro-texto).

## Capacidades

- Selección de una única acción discreta (una letra entre las opciones presentadas) a partir de un estado textual del robot simulado.
- Procesamiento de observaciones estructuradas: distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa.
- Seguimiento de instrucciones de formato estricto (devolver solo la letra, sin explicación).
- Robustez parcial frente a estados con acciones alternativas que desvían al robot (entrenado con un 20 % de ejemplos de este tipo).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación de agentes más allá de la decisión de un paso.
- No tiene capacidades de visión, audio ni modo "thinking" documentadas.
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente como coreano, aunque el system prompt de inferencia se documenta en inglés.

## Casos de uso

- Destilación de políticas de RL en modelos de lenguaje pequeños: sirve como referencia metodológica para convertir una política PPO en un modelo de lenguaje que responda a descripciones textuales del estado, útil en investigación sobre RL y LLM.
- Control de robot simulado en entornos educativos: integrado en el simulador web de CONNECT AI WORLD, permite que estudiantes observen cómo un modelo de lenguaje toma decisiones de navegación paso a paso.
- Evaluación comparativa de técnicas de ajuste: al publicar métricas de supervisado frente a RL, permite reproducir el experimento y medir la contribución del refinamiento con PPO.
- Generación de datos sintéticos de decisión: el pipeline `connect_tycoon.link01.questions` convierte observaciones en preguntas con formato fijo, reutilizable para aumentar datasets de decisión.
- Prototipado rápido de bucles de control de bajo coste: con 0,8 mil millones de parámetros y respuestas de una letra, el coste por inferencia es mínimo y la latencia es compatible con bucles de 0,5 segundos en hardware modesto.
- Investigación sobre robustez ante instrucciones inyectadas en el estado: el system prompt está diseñado explícitamente para tratar el estado como datos, lo que permite estudiar ataques de prompt injection en entornos de control.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (banco de 20 episodios, semillas 91001–91020, aproximación 2D de la marcha):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 10 % | 25,9 s |
| Modelo sin entrenar | 40,2 % | 0 % | 10 % | — |
| Ajuste supervisado (LoRA) | 59,1 % | 0 % | 95 % | — |
| Ajuste supervisado + RL (PPO) | 60,9 % | 0 % | 90 % | — |

El autor advierte que la evaluación de la marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando, sin el modelo del robot ni la red neuronal de marcha del simulador web MuJoCo, por lo que los resultados pueden diferir de los del entorno original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,8 mil millones de parámetros en fp16 se sitúa en torno a 1,6 GB de pesos, más overhead de activaciones y del adaptador LoRA.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; el adaptador LoRA en sí ocupa 0,1 GB y puede cargarse sobre el base cuantizado.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, e incluso en GPUs integradas con cuantización.
- Opciones de despliegue: transformers + peft (documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada; la tarea exige una decisión cada 0,5 segundos, lo que sugiere que el autor validó latencias compatibles con ese intervalo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA de decisión sobre Qwen3.5-0.8B para control de robots simulados). La comparación más directa es con el propio profesor PPO del que se destila:

| Modelo | Parámetros | Contexto | Acierto en test | Éxito en 20 episodios | Licencia |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8 B + LoRA | no disponible | 60,9 % | 0 % | Apache 2.0 |
| Cerebro PPO (profesor) | no disponible (política del simulador) | no aplica | 100,0 % | 100 % | no disponible |
| Modelo base Qwen3.5-0.8B sin ajuste | 0,8 B | no disponible | 40,2 % | 0 % | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy por debajo del profesor: 60,9 % de coincidencia con el cerebro y 0 % de episodios completados con éxito en el banco de 20 episodios, frente al 100 % del profesor.
- Tasa de colisión elevada: 90 % de episodios con colisión tras el refinamiento con RL, frente al 10 % del cerebro.
- El refinamiento con PPO apenas mejora el ajuste supervisado (59,1 % → 60,9 %) y empeora ligeramente la tasa de colisión (95 % → 90 %).
- Evaluación de marcha aproximada: los resultados se obtuvieron con una tabla de velocidades 2D y no con el simulador MuJoCo completo, por lo que pueden no reproducirse en el entorno real.
- Dominio muy restringido: una sola tarea (`avoid_obstacles`), un solo contrato de tarea y un único circuito (`random`, identificador `7878e838`).
- Idioma: etiquetado únicamente como coreano; el rendimiento en castellano o en otros idiomas no está documentado.
- Riesgo de alucinación en la selección de opción: el modelo puede devolver una letra que no esté entre las opciones presentadas o añadir texto adicional si el formato del prompt no es exacto.
- Sesgos: no documentados; al entrenarse sobre una política PPO concreta, hereda los sesgos de comportamiento de esa política en el simulador.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- No apto para producción en robótica real sin reentrenamiento y validación adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL con robot de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
