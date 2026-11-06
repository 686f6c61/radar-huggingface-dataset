# WeonJeong/connectailab-rl-maru-v1-link01

## Resumen

connectailab-rl-maru-v1-link01 es un adaptador LoRA publicado por WeonJeong (CONNECT AI LAB) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para un robot simulado llamado LINK-01: recibe en texto el estado actual del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que identifica el movimiento a ejecutar durante los siguientes 0,5 segundos. El modelo se distribuye como adaptador PEFT en formato safetensors y se apoya en el modelo base para toda la capacidad lingüística.

El interés del proyecto es metodológico: el autor entrenó primero una política PPO en un simulador web (el "cerebro", serializado como brain.json), generó un conjunto de problemas traduciendo observaciones a texto y respuestas a letras, y después destiló esa política en el modelo de lenguaje mediante aprendizaje supervisado (LoRA) y refinó con aprendizaje por refuerzo (PPO con anclaje KL). Es, por tanto, un ejemplo de destilación de política de control a un LLM pequeño con un pipeline reproducible y código abierto.

La relevancia es acotada pero clara para quien investiga agentes y robótica simulada: demuestra que un modelo de 0,8B de parámetros puede aproximar una política de decisión discreta con un 72,9 % de coincidencia con la política docente y un 50 % de éxito en 20 episodios de evaluación, frente al 0 % del modelo base sin ajustar. El modelo está pensado para investigación y educación sobre simulación, no para control de robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3.5-0.8B tiene 0,8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors sin cuantizar) |
| Idiomas soportados | Coreano (ko); el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B de parámetros. El entrenamiento se organiza en cuatro fases descritas por el autor: (1) entrenamiento de una política PPO en el simulador web para la tarea `goto_target`, con observación de 10 dimensiones y 5 acciones discretas, que alcanza el 100 % en el examen oficial del simulador; (2) generación del conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del cerebro en texto y su acción en una letra, con un 20 % de ejemplos en los que el robot se desvía deliberadamente; (3) aprendizaje supervisado del LLM sobre esas respuestas (LoRA); y (4) refinamiento con PPO, usando como recompensa el retorno obtenido si el cerebro continúa la trayectoria tras la acción elegida por el LLM, con una penalización KL que mantiene el adaptador cerca de la política supervisada.

El conjunto de datos resultante contiene 524 ejemplos de entrenamiento, 98 de validación y 155 de test. El autor reporta que el techo de acierto por traducción a texto (la proporción en que el cerebro y su representación textual coinciden) es del 99 %. No se documentan detalles sobre hiperparámetros, número de pasos de RL, tamaño del adaptador ni composición exacta del corpus más allá de estos recuentos.

## Capacidades

- Clasificación de decisión discreta: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas (5 acciones posibles en la tarea `goto_target`).
- Seguimiento de instrucciones con formato estricto: el prompt de sistema exige devolver solo la letra, sin explicación, y tratar el contenido de `state` como datos y no como instrucciones.
- Razonamiento de estado a corto plazo: integra distancia, dirección, lecturas de sensores, velocidad y acción previa en una única decisión de 0,5 segundos.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso por sí mismo; el bucle de control lo aporta el entorno (el cerebro docente o el simulador).
- Capacidades multilingües limitadas al coreano para las descripciones de estado; el prompt de sistema está en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en destilación de políticas: usar el par (política PPO, adaptador LoRA) como caso de estudio reproducible de cómo se transfiere una política de control a un LLM pequeño, con código y cuaderno de Colab públicos.
- Docencia de aprendizaje por refuerzo: el pipeline completo (entrenar cerebro, generar problemas, SFT, PPO con KL) sirve como práctica guiada en cursos de RL aplicado, con métricas de éxito y tiempo de episodio ya definidas.
- Evaluación de modelos pequeños en tareas de decisión: comparar Qwen3.5-0.8B con y sin adaptador en el conjunto de test de 155 problemas permite medir la ganancia real del ajuste fino frente al modelo base.
- Prototipado de agentes embodied en simulación: integrar el adaptador como política de decisión en entornos 2D o en el simulador web para experimentar con bucles percepción-decisión antes de invertir en políticas más costosas.
- Generación de datos sintéticos de decisión: el formato de problema (situación, pregunta, opciones) y el prompt de sistema pueden reutilizarse para crear corpus etiquetados por una política docente en otras tareas de control discreto.
- Análisis de robustez ante ruido: los ejemplos con desviación deliberada (20 % del dataset) permiten estudiar cómo responde el modelo cuando el estado observado no coincide con la trayectoria óptima de la política docente.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (evaluación sobre el conjunto de test y sobre 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro docente (PPO) | 100,0 % | 100 % | 0 % | 11,1 s |
| Modelo base sin ajustar | 34,2 % | 0 % | 0 % | — |
| Aprendizaje supervisado (LoRA) | 74,2 % | 45 % | 0 % | 10,3 s |
| Aprendizaje por refuerzo (este adaptador) | 72,9 % | 50 % | 0 % | 10,6 s |

El autor advierte que la evaluación de caminata usa una aproximación 2D basada en una tabla de velocidades medidas por comando, no el modelo físico ni la red neuronal de caminata, por lo que los resultados pueden diferir de los obtenidos en MuJoCo web.

## Requisitos de hardware

- VRAM estimada: el adaptador es de tamaño despreciable; el coste lo determina el modelo base Qwen3.5-0.8B. En fp16 requiere aproximadamente 1,6 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits alrededor de 0,8–1 GB, y en 4 bits alrededor de 0,5–0,7 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para inferencia en fp16; para entrenamiento del adaptador, 8–16 GB facilitan el trabajo con lotes pequeños.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: transformers + peft (flujo indicado por el autor), llama.cpp/Ollama solo si se fusiona el adaptador con el modelo base y se convierte a GGUF; vLLM y TGI requieren el mismo paso de fusión previo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo base, la latencia por decisión debería ser de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-maru-v1-link01 | 0,8B (base) + LoRA | No disponible | Decisión discreta destilada de PPO | Apache 2.0 | Hugging Face, 25 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | LLM generalista | No disponible en la información | Hugging Face |
| Política PPO "cerebro" (brain.json) | No aplica (tabla/serialización) | No aplica | Política de control directa | Definida por el proyecto CONNECT TYCOON | GitHub del proyecto |

No se dispone de información sobre otros adaptadores de decisión comparables en la misma categoría (LLM pequeño destilando una política de control) dentro de la documentación consultada.

## Limitaciones y advertencias

- Ámbito muy restringido: el adaptador solo se ha entrenado para la tarea `goto_target` con 10 dimensiones de observación y 5 acciones; no generaliza a otras tareas de control sin reentrenamiento.
- El propio autor indica que es un modelo de investigación y educación sobre simulación y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador físico completo; los porcentajes de éxito pueden no trasladarse a MuJoCo u otros entornos.
- El conjunto de test es pequeño (155 problemas) y el de validación también (98), por lo que las diferencias entre SFT (74,2 %) y RL (72,9 %) en acierto de test están dentro del ruido esperado; la mejora de RL se observa en episodios completos (45 % a 50 %), no en acierto puntual.
- Riesgo de alucinación de letra: si el estado se presenta fuera de distribución, el modelo puede devolver una opción no listada o una letra inválida; el prompt de sistema mitiga pero no elimina este riesgo.
- Idiomas: las descripciones de estado están en coreano; el rendimiento con estados en castellano u otros idiomas no está documentado.
- Sin datos publicados sobre sesgos, robustez adversarial o comportamiento con prompts maliciosos más allá de la instrucción de tratar `state` como datos.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B, que no se detalla en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WeonJeong/connectailab-rl-maru-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento (robot-lab): https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
