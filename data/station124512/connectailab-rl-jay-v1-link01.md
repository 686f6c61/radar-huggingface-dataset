# station124512/connectailab-rl-jay-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de decisión entrenado sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario station124512 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje generalista: es un "cerebro" de decisión para un robot simulado llamado LINK-01, que debe elegir una de cinco acciones de caminata (act5) a partir de una descripción textual de su estado (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa). El modelo devuelve una única letra correspondiente a la opción elegida.

El entrenamiento combina dos fases: primero un destilado supervisado (LoRA) desde un cerebro PPO entrenado en el simulador web, y después un ajuste por refuerzo con PPO y anclaje KL para alinear las decisiones del modelo con las recompensas obtenidas al ejecutar cada opción. El resultado es un adaptador de muy bajo coste computacional (0,8B parámetros, repo de 0,0 GB) pensado para investigación y docencia en robótica simulada y toma de decisiones secuenciales.

Su relevancia es acotada pero clara: demuestra un pipeline completo de RL clásico (PPO en simulador) → destilado a lenguaje (LoRA) → refinamiento por RL sobre un LLM pequeño, con métricas de éxito medidas en 20 episodios con semillas fijas (91001–91020) y una tasa de acierto del 97,1 % frente al cerebro profesor (100 %). El modelo está etiquetado como `reinforcement-learning` y no está pensado para uso conversacional general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8B en el modelo base; adaptador LoRA de tamaño no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | coreano (ko) declarado; las instrucciones del sistema están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. La tarea se formula como clasificación de una letra entre cinco opciones (act5) dada una observación textual de 10 campos (obs10). El pipeline de datos se generó haciendo caminar al cerebro PPO por el curso `random` en el simulador web y registrando, cada 0,5 segundos, la observación textualizada como problema y la acción del cerebro como etiqueta; un 20 % de los ejemplos incluyen desviaciones deliberadas (acciones distintas a las del profesor) para aumentar la cobertura del espacio de estados.

El entrenamiento tiene dos etapas: (1) ajuste supervisado LoRA sobre 463 ejemplos de entrenamiento (93 de validación, 137 de test), y (2) refuerzo con PPO donde la recompensa de cada opción se estima dejando que el cerebro profesor complete el episodio desde ese estado, con anclaje KL al modelo supervisado para evitar divergencias. La evaluación se realizó colocando el modelo en el puesto de decisión del robot y ejecutando 20 episodios con semillas fijas, usando una tabla de velocidades por comando derivada de MuJoCo web (aproximación 2D, sin red de marcha ni modelo físico del robot). El autor reporta una tasa de coincidencia con el profesor del 97,1 % y un 100 % de éxito en los 20 episodios, con tiempo medio de 10,5 s por episodio exitoso.

## Capacidades

- Clasificación de decisión robótica: dado un estado textualizado (obs10), devuelve una de cinco letras de acción (act5) sin explicación.
- Seguimiento de objetivo (`goto_target`): el modelo razona sobre distancia, dirección y sensores para elegir el siguiente paso de 0,5 s.
- Robustez ante instrucciones embebidas: el prompt del sistema indica tratar el contenido de `state` como datos, no como instrucciones, mitigando inyección de prompt desde la observación.
- Salida estrictamente restringida: solo una letra, lo que facilita su integración en bucles de control.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al coreano declarado y a las instrucciones en inglés del sistema; no se documenta soporte de otros idiomas.
- No es un modelo conversacional: no se ha entrenado para diálogo abierto ni generación libre de texto.

## Casos de uso

- Docencia de RL y destilado: reproducir el pipeline completo (PPO en simulador → LoRA supervisado → PPO con KL) usando el notebook de Colab enlazado, con 463 ejemplos de entrenamiento y métricas de referencia claras.
- Investigación en destilado de políticas: comparar la política PPO original con la versión destilada a lenguaje y medir la pérdida de rendimiento (100 % → 97,1 % de acierto; 10,3 s → 10,5 s por episodio).
- Control de robot simulado LINK-01: integrar el adaptador en el bucle de decisión del simulador web para el curso `random` con la tarea `goto_target`, sustituyendo al cerebro PPO.
- Estudio de robustez ante inyección de prompt: el diseño con `state` como datos y salida restringida a una letra permite experimentar con ataques de prompt en observaciones robóticas.
- Benchmark de modelos pequeños para decisión secuencial: usar los 137 ejemplos de test como conjunto de evaluación reproducible para comparar adaptadores LoRA sobre modelos de 0,8B.
- Prototipado de pipelines de RLHF/PPO sobre LLM: el esquema de recompensa por "dejar que el profesor complete el episodio" es un patrón reutilizable para otras tareas de decisión con acciones discretas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio por episodio exitoso |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 100 % | 0 % | 10,3 s |
| Modelo base sin entrenar | 24,8 % | 0 % | 0 % | — |
| LoRA supervisado | 97,1 % | 100 % | 0 % | 10,5 s |
| LoRA + PPO (este modelo) | 97,1 % | 100 % | 0 % | 10,5 s |

Tamaño de los conjuntos: train 463, valid 93, test 137. La cota superior de acierto (coincidencia del profesor consigo mismo al textualizar la observación) es del 99 %. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB en fp16 para el modelo base de 0,8B más el adaptador LoRA; menos de 1 GB en cuantización de 4 bits (estimación, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM en fp16.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor); vLLM, llama.cpp u Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF, paso no documentado.
- Latencia y throughput: no disponibles; el caso de uso es una inferencia por paso de 0,5 s, por lo que la latencia no es crítica en el simulador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1-link01 | 0,8B + LoRA | no disponible | Decisión robótica (5 acciones) | Apache 2.0 | Hugging Face, 16 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Lenguaje general | no disponible en la información | Hugging Face |
| Política PPO original (cerebro LINK-01, `brain.json`) | no aplica (tabla/red propia) | no aplica | Decisión robótica | no disponible | Repositorio connect-tycoon |

No se dispone de información sobre otros adaptadores de decisión comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `goto_target` con observación obs10 y 5 acciones; no generaliza a otras tareas, robots ni espacios de acción.
- Evaluación aproximada: la métrica de éxito usa una tabla de velocidades por comando derivada de MuJoCo web, no el simulador físico completo; el autor advierte que los resultados pueden diferir de MuJoCo real.
- Sin validación en robot físico: el propio autor indica que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Riesgo de alucinación: aunque la salida está restringida a una letra, el modelo puede emitir letras fuera del conjunto o texto adicional si el prompt se desvía del formato esperado.
- Sesgo de imitación: el modelo reproduce al profesor PPO, incluyendo sus sesgos y limitaciones; el 2,9 % de discrepancia con el profesor se concentra en estados poco representados.
- Idioma: solo coreano declarado; las instrucciones del sistema están en inglés y no hay garantía de comportamiento con prompts en castellano.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Repositorio de 0,0 GB y 16 descargas: proyecto de investigación/educación con mantenimiento y soporte limitados.

## Enlaces

- Hugging Face: https://huggingface.co/station124512/connectailab-rl-jay-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
