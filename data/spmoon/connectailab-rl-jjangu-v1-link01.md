# spmoon/connectailab-rl-jjangu-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT publicado por el usuario spmoon dentro del proyecto CONNECT AI LAB, orientado a la toma de decisiones de un robot simulado llamado LINK-01. El modelo no es un LLM de propósito general, sino un modelo de lenguaje pequeño (Qwen3.5-0.8B) ajustado para leer el estado del robot en formato textual (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y responder con una única letra que corresponde a la siguiente acción de locomoción de 0,5 segundos. El pipeline declarado en Hugging Face es `reinforcement-learning`.

La construcción es un destilado en dos fases: primero se entrena una política PPO en un simulador web (el "cerebro" o brain.json), después se generan pares observación-texto/acción a partir de las trayectorias de ese cerebro y se hace un ajuste supervisado con LoRA sobre Qwen3.5-0.8B, y finalmente un paso de refuerzo con PPO y penalización KL para alinear la salida del LLM con decisiones de mayor recompensa. El conjunto de datos es muy reducido: 701 ejemplos de entrenamiento, 164 de validación y 205 de test.

Su relevancia es acotada y experimental: demuestra cómo destilar una política de RL en un modelo de lenguaje para que razone sobre observaciones estructuradas en lenguaje natural y emita decisiones discretas. El idioma declarado es coreano (`ko`) y la licencia es Apache 2.0. El repo pesa 0,0 GB, lo que sugiere que solo contiene los pesos del adaptador LoRA, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (modelo base Qwen3.5-0.8B; el adaptador LoRA no declara su recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-0.8B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen. Sobre él se aplica un adaptador LoRA entrenado en dos etapas. La primera es un ajuste supervisado (SFT) sobre pares generados a partir de las trayectorias de una política PPO entrenada en un simulador web de locomoción 2D. La segunda es un paso de refuerzo con PPO en el que, para cada opción de respuesta, se calcula la recompensa que habría obtenido el cerebro del robot si hubiera ejecutado esa acción y continuado la trayectoria; las opciones con mejor recompensa se refuerzan y las peores se penalizan, con una penalización KL que mantiene al modelo cerca de la distribución del SFT.

El conjunto de datos consta de 701 ejemplos de entrenamiento, 164 de validación y 205 de test. La tarea es `goto_target` con observaciones de 21 dimensiones y 5 acciones discretas (`obs21-act5`), sobre el escenario `7feee9f1`. El 20 % de los ejemplos de entrenamiento incluye deliberadamente desviaciones del camino para que el modelo aprenda a recuperarse. La evaluación de la política se hace con una aproximación de locomoción 2D basada en una tabla de velocidades medidas por comando, sin red neuronal de marcha ni modelo físico del robot, por lo que no reproduce fielmente el comportamiento de MuJoCo.

## Capacidades

- Lectura de observaciones estructuradas en texto (distancia, dirección, sensores, velocidad, acción previa) y emisión de una única letra de acción entre cinco opciones.
- Toma de decisiones discretas de locomoción en intervalos de 0,5 segundos.
- Seguimiento estricto de formato: el prompt de sistema exige devolver solo la letra, sin explicación.
- Tratamiento de los datos del estado como datos, no como instrucciones (prompt diseñado para mitigar inyección).
- Capacidad multilingüe limitada al coreano declarado; no hay evidencia de uso fiable en castellano.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en destilación de políticas de RL a modelos de lenguaje: sirve como ejemplo reproducible de cómo convertir una política PPO en un LLM que decide a partir de observaciones textuales, con código y notebook disponibles.
- Docencia de refuerzo y PPO: el notebook de Colab y el repositorio permiten reproducir el pipeline completo (simulador, generación de datos, SFT, PPO) en un caso de juguete.
- Prototipado de agentes de decisión en entornos simulados: el modelo puede sustituir a la política original en el bucle de control de un robot 2D simulado para comparar comportamiento.
- Evaluación de robustez ante instrucciones en el estado: el prompt de sistema permite experimentar con ataques de inyección en el campo `state` y medir si el modelo mantiene el formato de salida.
- Generación de datos sintéticos de decisión: las respuestas del modelo pueden usarse como etiquetas adicionales en entornos con observaciones similares, siempre con validación humana.
- Pruebas de formato estricto en pipelines de producción: útil como caso de estudio de salidas de un solo token y control de latencia en sistemas de decisión de baja frecuencia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre 205 problemas de test y 20 episodios del mismo escenario con semillas 91001–91020):

| Modelo | Acierto en test (coincide con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 95 % | No disponible | No disponible |
| SFT (LoRA supervisado) | 83,9 % | 90 % | No disponible | No disponible |
| RL (LoRA con PPO) | 79,0 % | 100 % | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores corresponden a la tarea específica `goto_target` y a una aproximación de locomoción 2D, no a una simulación física completa.

## Requisitos de hardware

- El adaptador LoRA es de tamaño despreciable; el coste real está en cargar Qwen3.5-0.8B, que cabe en GPU de consumo con cuantización de 8 o 4 bits (estimación orientativa: ~1,6 GB en FP16, ~0,8 GB en 4 bits para los pesos del modelo base, sin contar overhead de activaciones).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16 del modelo base; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo (GTX 1650 4 GB en adelante, con cuantización; RTX 3060 12 GB sin problemas en FP16).
- Opciones de despliegue: transformers + peft (ruta documentada por el autor), y en principio vLLM, llama.cpp u Ollama si se exporta el modelo fusionado a GGUF; no se documentan recetas específicas para estos backends.
- Latencia y throughput: no disponibles. La tarea requiere una respuesta por cada 0,5 segundos de simulación, lo que impone un límite práctico de latencia inferior a ese intervalo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jjangu-v1-link01 | Base 0,8B + LoRA | No disponible | Decisión discreta en robot simulado | Apache 2.0 | Hugging Face, 18 descargas |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | LLM general | Según modelo base | Hugging Face |
| Política PPO original (brain.json) | No aplica (tabla/política) | No aplica | Decisión discreta en robot simulado | No disponible | Repositorio CONNECT TYCOON |

No se dispone de comparaciones con otros adaptadores de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulador; el propio autor advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, sin modelo físico ni red de locomoción; los resultados pueden diferir de MuJoCo u otros simuladores.
- El conjunto de datos es muy pequeño (701 ejemplos de entrenamiento), lo que limita la generalización a escenarios, tareas u observaciones distintas de `goto_target`.
- Idioma declarado únicamente coreano; no hay evidencia de comportamiento fiable en castellano ni en otros idiomas.
- Riesgo de alucinación en el formato: el modelo puede devolver una letra no listada o añadir texto si el prompt no se aplica estrictamente; el autor exige un system prompt concreto para mitigarlo.
- Sesgos: no documentados, pero al derivar de una única política y un único escenario, hereda las limitaciones de esa política (por ejemplo, preferencias de trayectoria del cerebro profesor).
- Licencia Apache 2.0 permite uso comercial del adaptador, pero deben respetarse las condiciones del modelo base Qwen3.5-0.8B.
- El pipeline declarado es `reinforcement-learning`, no `text-generation`; integrarlo como LLM convencional puede requerir ajustes.
- No se documentan cuantizaciones, contexto máximo ni requisitos de hardware oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spmoon/connectailab-rl-jjangu-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
