# thtesche/laya-minecraft-english

## Resumen

Laya Minecraft English es un checkpoint especializado de Laya, un modelo de decisión no autorregresivo construido sobre un encoder ModernBERT-large. Lo publica thtesche como fine-tune del checkpoint inglés `convaiinnovations/laya` y está entrenado sobre ticks de decisión grabados por un agente que juega Minecraft en vivo. El modelo no genera texto ni argumentos de herramientas: recibe una narrativa compacta del estado del mundo y devuelve, en una sola pasada, la etiqueta de acción elegida entre las opciones válidas junto con una probabilidad calibrada, además de una puerta binaria de peligro (`in_danger`).

El modelo resuelve un problema concreto de arquitectura de agentes: separar el razonamiento lento (System 2, delegado a un LLM planificador) de la toma de decisiones rápida y frecuente (System 1, delegado a este checkpoint). Con 421 millones de parámetros y un contexto de 512 tokens, está pensado para invocarse en cada tick del bucle del agente dentro de un grafo LangGraph con el flujo `perceive → decide → guard → execute → verify`.

Es relevante ahora porque ejemplifica un patrón emergente en agentes: modelos pequeños, encoders y cabezas de decisión calibradas que sustituyen la generación autoregresiva en pasos de baja latencia, eliminando el coste de parseo y el riesgo de alucinación de formato. Su licencia Apache 2.0 y su integración directa con la librería `laya` facilitan la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder) con cabeza de decisión no autorregresiva (Laya) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_len` 512, `head_max_len` 192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (el checkpoint base es el inglés de Laya) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 842 MB) |

## Arquitectura y entrenamiento

El modelo parte de un encoder ModernBERT-large congelado en su núcleo y añade una cabeza de decisión que responde a preguntas de tipo `choice`. En cada tick el agente formula dos preguntas: `in_danger` (puerta binaria de seguridad) e `intent` (siguiente acción entre las opciones que el código ya ha filtrado por precondiciones y árbol tecnológico). La inferencia es una única pasada no autorregresiva: no hay decodificación token a token, sino una distribución sobre las etiquetas candidatas.

El entrenamiento emplea RLCD (Reinforcement Learning for Calibrated Decisions), una variante de REINFORCE con baseline de media de grupo y funciones de puntuación estrictamente propias (proper scoring rules). El corpus son 2.564 ticks de decisión verificados de ejecuciones en vivo (runs 187–205), con 4 épocas, micro-batch de 8 y 1.284 actualizaciones del optimizador; tasas de aprendizaje de 1e-4 para la cabeza y 2.5e-5 para el encoder con decaimiento coseno hasta 1e-6. La calibración se ajusta con una temperatura por par (tipo de pregunta, número de opciones), estimada sobre 284 elementos reservados. La señal de recompensa es el mundo verificado, no una etiqueta humana: solo los ticks en los que el verificador confirmó progreso real se convierten en ejemplos positivos, y se filtran los bucles ping-pong de seis o más ticks repitiendo una etiqueta sin ganancia de objeto.

## Capacidades

- Clasificación de decisiones entre opciones válidas con probabilidad calibrada por opción (preguntas de tipo `choice`).
- Puerta binaria de peligro (`in_danger`) para decidir si actuar de inmediato o trabajar con calma.
- Inferencia no autorregresiva en una sola pasada, sin generación de texto ni argumentos de herramientas que parsear.
- Salida con umbrales de abstención configurables (`choice:2 → 0.5066`, `choice:3-5 → 0.3575`).
- Integración con el bucle de agente LangGraph `perceive → decide → guard → execute → verify`.
- Compatibilidad con el enrutador de la librería `laya`, que permite reasignar el checkpoint `english` por ID de Hub sin cambiar código.
- Soporte de revisiones fijas (`LAYA_REVISION` o `revision=` en `laya.load`) para despliegues reproducibles.
- Capacidades multilingües: no disponibles (checkpoint específico para inglés).
- Sin soporte de tool calling generativo, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Control de un bot de Minecraft en producción: el modelo elige en cada tick entre las acciones válidas (craft, mine, navigate, sleep, flee) y el ejecutor Python traduce la etiqueta en llamadas MCP; la ventana de 512 tokens basta para la narrativa compacta de estado (milestones, inventario, vitales, amenazas, posición).
- Capa System-1 en arquitecturas híbridas de agentes: se combina con un LLM planificador (System 2) que fija objetivos de alto nivel, mientras este checkpoint resuelve las decisiones frecuentes con latencia de una pasada y sin coste de decodificación.
- Filtro de seguridad de bajo coste: la pregunta `in_danger` actúa como guardia previo a la ejecución, permitiendo que el agente aborte o cambie a comportamiento defensivo cuando detecta amenaza inmediata.
- Investigación sobre calibración en modelos de decisión: los umbrales de abstención y las temperaturas por tipo de pregunta permiten estudiar ECE y Brier en un dominio acotado y con datos verificables.
- Evaluación de recompensas basadas en el entorno: sirve como referencia para experimentos de RLCD donde la señal proviene de la verificación del estado del mundo en lugar de anotación humana.
- Despliegue en hardware modesto: con 421 millones de parámetros y 842 MB de pesos en safetensors, puede servirse en una única GPU de consumo para prototipos y pruebas de bucle cerrado.
- Reproducción de experimentos de agentes: el repositorio incluye `train_report.json`, `questions.json` y el corpus de entrenamiento, lo que permite replicar el pipeline completo desde el código del agente.

## Benchmarks y rendimiento

Evaluación sobre 415 elementos de las ejecuciones 206–208, un periodo no cubierto por el corpus de entrenamiento (con la salvedad de que 4 elementos se solapan con datos de entrenamiento o calibración):

| Metrica | Antes del fine-tune | Despues del fine-tune |
|---|---|---|
| Accuracy | 0.9301 | 0.9325 |
| Confianza media | 0.870 | 0.905 |
| ECE (menor es mejor) | 0.0625 | 0.0435 |
| Brier (menor es mejor) | 0.1402 | 0.1273 |
| Brier top-1 (menor es mejor) | 0.0737 | 0.0657 |

Linaje de checkpoints del agente, con el número de elementos de evaluación y el resultado de accuracy:

| Checkpoint | Elementos de evaluacion | Accuracy | Held-out |
|---|---|---|---|
| 2026-10-11 | 6 | 0.833 | sí (smoke) |
| 2026-10-12 | 9 | 1.000 | sí (smoke) |
| 2026-10-14 | 61 | 0.934 | sí |
| 2026-10-23 | 279 | 0.885 | sí (runs 79–86) |
| 2026-10-28 | 522 | 0.918 | sí |
| 2026-11-07 (este repo) | 415 | 0.933 | solapado |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1 GB para los pesos en safetensors (842 MB), más memoria para tokenizador y activaciones; el dato exacto de VRAM en producción no está disponible.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 2–4 GB de memoria libre debería alojar el modelo en precisión nativa.
- Cabe en GPU de consumo: sí, por el tamaño de pesos (421 millones de parámetros); no se especifican modelos concretos.
- Opciones de despliegue: la librería `laya` (`laya.load` y el CLI `mlaya.cli run`), con soporte del enrutador `LAYA_EXTRA_MODELS` para reasignar el checkpoint `english`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles; la arquitectura no autorregresiva implica una única pasada por tick, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thtesche/laya-minecraft-english | 421 M | 512 tokens | Encoder ModernBERT + cabeza de decisión calibrada, dominio Minecraft | Apache 2.0 | Hugging Face |
| convaiinnovations/laya (checkpoint inglés) | no disponible | no disponible | Modelo de decisión no autorregresivo generalista en inglés | no disponible | Hugging Face |
| LLM planificador del agente (System 2) | no disponible | no disponible | Generación autoregresiva de texto y llamadas a herramientas | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dominio acotado: las etiquetas son acciones de supervivencia de Minecraft (craft, mine, navigate, sleep, flee); no es un modelo de decisión de propósito general.
- Solo responde a dos preguntas (`intent` e `in_danger`); la model card queda truncada en ese punto y no detalla otras limitaciones.
- Evaluación no estrictamente held-out: 4 de los 415 elementos de evaluación se solapan con datos de entrenamiento o calibración, lo que puede inflar ligeramente las métricas.
- Riesgo de alucinación de formato bajo: al no generar texto ni argumentos, el modelo no puede inventar llamadas, pero puede elegir una etiqueta válida que el ejecutor no pueda completar si la narrativa de percepción es deficiente.
- Dependencia del filtrado previo: la calidad de la decisión depende de que el código del agente elimine correctamente las acciones imposibles; el modelo solo elige entre las opciones que recibe.
- Sesgos conocidos: no disponibles; al entrenarse sobre un único agente y un corpus pequeño (2.564 ticks), puede heredar sesgos de las políticas de ese agente y de las ejecuciones concretas.
- Limitaciones de idioma: el checkpoint es específico para inglés; no se documenta soporte de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `convaiinnovations/laya` antes de un despliegue en producción.
- Caveat de producción: la calibración y los umbrales de abstención están ajustados a este dominio y a este agente; reutilizarlos en otro entorno requeriría recalibrar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thtesche/laya-minecraft-english
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de entrenamiento del agente: https://github.com/thtesche/minecraft-laya-training
- Corpus de entrenamiento: https://huggingface.co/datasets/thtesche/laya-minecraft-training-data
- Bot de Minecraft (mineflayer y minecraft-mcp-server): https://github.com/thtesche/ai-minebot/tree/main/
