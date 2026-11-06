# zero885814/connectailab-rl-grid-empathy-v5-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo construido sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario zero885814 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generalista: es un modelo de decisión que lee en texto el estado de un robot de simulación (distancia al objetivo, orientación, sensores de distancia, velocidad y acción previa) y devuelve la letra de una única opción que representa cómo caminar durante los siguientes 0,5 segundos. La tarea concreta es `avoid_obstacles` (esquivar obstáculos) sobre un curso fijo identificado como `8bb27dff`, con cinco cajas y bidones colocados de forma determinista.

El interés técnico del modelo está en su metodología de destilación: primero se entrena una política PPO en un simulador web (el "cerebro" o brain.json), después se generan pares observación-en-texto / acción del cerebro como conjunto de problemas supervisados (996 de entrenamiento, 177 de validación y 268 de prueba) y finalmente se aplica una fase de RL con KL respecto al modelo de referencia para subir la probabilidad de las opciones que habrían producido mejores recompensas. La variante v5 se distingue de la v4 únicamente en que la penalización por colisión se reduce de -2,0 a 0,0, lo que permite estudiar qué aprende el agente cuando chocar no tiene coste explícito.

Es un artefacto de investigación y docencia, no un producto. El propio autor advierte que las evaluaciones de caminata se hacen con una aproximación 2D basada en tablas de velocidad, sin el modelo robótico ni la red de locomoción reales, y que debe revalidarse antes de usarse en un robot físico. Su relevancia radica en mostrar un pipeline completo y reproducible (simulador, PPO, destilación a lenguaje, RL con LoRA) sobre un modelo de menos de mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (modelo base de 0,8B; el adaptador LoRA no declara su recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 800 millones de parámetros. El adaptador no modifica la arquitectura base; añade matrices de bajo rango entrenadas para la tarea de decisión. El pipeline de entrenamiento tiene cuatro etapas documentadas: (1) entrenamiento de una política PPO en el simulador web `avoid_obstacles` con el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y una tasa de éxito del 70 % en la prueba oficial; (2) generación de un corpus de problemas en lenguaje natural a partir de las observaciones del cerebro cada 0,5 segundos, con la acción del cerebro como etiqueta y un 20 % de ejemplos con desviaciones deliberadas; (3) ajuste supervisado (SFT) del adaptador LoRA para imitar al cerebro; y (4) una fase de RL que reordena las opciones según la recompensa que habría obtenido el cerebro al continuar desde cada elección, con anclaje KL al modelo de referencia.

La innovación principal no está en la arquitectura sino en el bucle de destilación política-a-lenguaje y en el control experimental: la única diferencia entre v4 y v5 es el coeficiente de penalización por colisión (-2,0 frente a 0,0), lo que convierte a ambas versiones en un par controlado para estudiar el efecto del castigo en el comportamiento aprendido. La evaluación de caminata utiliza una aproximación 2D basada en tablas de velocidad por comando, sin el modelo robótico ni la red de locomoción, por lo que no reproduce fielmente el simulador MuJoCo web.

## Capacidades

- Decisión discreta de bajo nivel: dado un estado textual del robot, selecciona exactamente una letra entre las opciones listadas (5 acciones en el contrato `obs21-act5`).
- Razonamiento de política: imita la distribución de acciones de una política PPO entrenada, no genera explicaciones ni texto libre.
- Formato de salida restringido: el system prompt exige devolver solo la letra de la opción, sin explicación.
- Tratamiento del estado como datos: el prompt indica explícitamente que el texto dentro del estado no debe interpretarse como instrucciones, lo que mitiga inyecciones en la observación.
- Capacidad multilingüe limitada: declarado para coreano; el prompt de sistema de ejemplo está en inglés.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).
- No es un modelo conversacional: no mantiene diálogo multi-turno ni responde preguntas generales.

## Casos de uso

- Investigación en destilación política-lenguaje: usar el par v4/v5 como caso controlado para medir cómo cambia la política destilada al modificar únicamente la penalización por colisión, manteniendo el resto del pipeline constante.
- Docencia de RL aplicado: el notebook de Colab y el repositorio `connect-tycoon` permiten reproducir el ciclo completo (PPO en simulador, generación de corpus, SFT con LoRA, RL con KL) sobre un modelo de 0,8B que cabe en hardware modesto.
- Evaluación de robustez ante instrucciones en el estado: el modelo está entrenado con la convención de tratar el estado como datos; sirve para estudiar cómo se comporta un modelo pequeño ante intentos de inyección en la observación del robot.
- Prototipado de agentes de decisión en simulación 2D: integrar el adaptador como política de bajo nivel en un entorno de rejilla o laberinto con acciones discretas y observaciones textualizadas.
- Benchmark de fidelidad de destilación: comparar la tasa de coincidencia con el cerebro (79,5 % en RL frente a 80,2 % en SFT) y la tasa de éxito en episodios (90 % frente a 70 %) para estudiar la relación entre precisión por paso y rendimiento acumulado.
- Estudio de recompensas y castigos: analizar si eliminar la penalización por colisión (v5) produce políticas más arriesgadas o simplemente distintas, usando el mismo curso y las mismas semillas (91001–91020).
- Base para experimentos de RLHF ligero: el esquema de reordenar opciones por recompensa simulada con anclaje KL es reutilizable en otras tareas discretas con un simulador disponible.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre el curso `8bb27dff`, 20 episodios con semillas 91001–91020, caminata aproximada en 2D):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 5 % | 19,9 s |
| Antes de entrenar | 40,3 % | 0 % | 20 % | — |
| SFT (LoRA) | 80,2 % | 70 % | 30 % | 20,3 s |
| RL (LoRA) | 79,5 % | 90 % | 15 % | 20,2 s |

Tamaños del corpus: 996 ejemplos de entrenamiento, 177 de validación y 268 de prueba. Cota superior de acierto por la textualización del estado: 99 %. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo base de 0,8B en fp16 se sitúa en torno a 2 GB de pesos, más overhead de activaciones y del adaptador LoRA.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento del adaptador, 8-12 GB facilitan lotes mayores.
- Cabe en GPU consumer: sí, es uno de los puntos fuertes del modelo base de 0,8B.
- Opciones de despliegue: transformers + peft (ruta documentada por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información proporcionada.
- Latencia y throughput: no disponibles. La tarea es de una sola pasada corta por decisión (cada 0,5 s), por lo que la latencia por llamada es el factor crítico en un bucle de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 v5 (este) | Base 0,8B + LoRA | No disponible | Decisión discreta `avoid_obstacles` | Apache 2.0 | Hugging Face, 0 descargas |
| LINK-01 v4 | Base 0,8B + LoRA | No disponible | Igual, con penalización -2,0 | Apache 2.0 (presumible) | Referenciado en la model card, no enlazado |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Política PPO "cerebro" | No disponible | No aplica | Decisión `avoid_obstacles` | No disponible | Artefacto `brain.json` del simulador |

No se dispone de comparación con modelos de decisión de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo responde a la tarea `avoid_obstacles` sobre el curso `8bb27dff`; fuera de ese contrato su comportamiento no está validado.
- Evaluación aproximada: la caminata se mide con una tabla de velocidades 2D, sin el modelo robótico ni la red de locomoción, por lo que los porcentajes de éxito pueden diferir del simulador MuJoCo web.
- Brecha entre precisión y éxito: el RL baja ligeramente el acierto por paso (79,5 % frente a 80,2 % del SFT) pero sube el éxito episódico (90 % frente a 70 %); no debe interpretarse el acierto por paso como métrica principal.
- Riesgo de alucinación de formato: aunque el prompt exige devolver solo una letra, un modelo de 0,8B puede emitir texto adicional o una opción no listada; requiere validación y fallback en producción.
- Idioma: declarado únicamente para coreano; el prompt de sistema de ejemplo está en inglés y no se documenta comportamiento en castellano.
- Sin soporte de tool calling ni agentes multi-paso: no es adecuado como orquestador.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor lo describe como modelo de investigación y educación en simulación; exige revalidación en el robot y el espacio reales antes de cualquier despliegue físico.
- Repositorio de 0,0 GB y 0 descargas: no hay evidencia de uso comunitario ni de mantenimiento; la fecha de creación (2026-11-04) es futura respecto a la información habitual, lo que conviene verificar.
- El código de soporte (`connect_tycoon.link01.questions`) es una dependencia externa no incluida en el repositorio de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zero885814/connectailab-rl-grid-empathy-v5-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Canal de YouTube: https://www.youtube.com/@CONNECT-AI-LAB
