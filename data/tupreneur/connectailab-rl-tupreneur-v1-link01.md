# TUpreneur/connectailab-rl-tupreneur-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por TUpreneur en el marco del proyecto CONNECT AI LAB x AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión entrenado para controlar un robot simulado llamado LINK-01 en la tarea `goto_target`: leer el estado actual del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y responder con una única letra que representa la acción de caminar durante los siguientes 0,5 segundos.

El modelo resuelve un problema muy concreto: destilar en un modelo de lenguaje la política de un agente de aprendizaje por refuerzo (PPO) entrenado en un simulador web, de modo que el LLM pueda colocarse en el lugar del "cerebro" del robot y tomar decisiones discretas entre cinco opciones de acción. El proceso combina aprendizaje supervisado (imitar las respuestas del cerebro PPO) y un ajuste posterior con refuerzo (PPO con restricción KL) para corregir las decisiones subóptimas.

Su relevancia es fundamentalmente educativa y de investigación: demuestra un pipeline completo de RL en simulador, generación de un dataset de decisiones, destilación en un LLM pequeño (0,8B parámetros) mediante LoRA y evaluación en un entorno de caminata aproximado. No está pensado para robótica real sin revalidación previa en el robot y el espacio concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; tamaño del adaptador LoRA no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se carga mediante la librería `peft` y no modifica los pesos del modelo base. La tarea es de clasificación generativa restringida: dado un estado del robot serializado en texto, el modelo debe devolver exactamente una letra entre las cinco opciones de acción disponibles.

El entrenamiento se realizó en cuatro fases según la model card. Primero, se entrenó una política PPO en un simulador web (tarea `goto_target`, contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1`, curso `4e5ae63b`), alcanzando un 100% de éxito en la prueba oficial. Segundo, se generó un dataset de preguntas y respuestas registrando cada 0,5 segundos la observación del cerebro PPO y su acción elegida, incluyendo un 20% de casos con desviaciones deliberadas. El dataset contiene 551 ejemplos de entrenamiento, 95 de validación y 143 de test. Tercero, se aplicó aprendizaje supervisado (LoRA) para imitar al cerebro. Cuarto, se aplicó refuerzo con PPO y restricción KL, usando como recompensa el retorno obtenido si el cerebro PPO continuaba la caminata tras la acción elegida por el modelo.

La evaluación final se realizó colocando el modelo en el puesto de decisión del robot y caminando el mismo curso durante 20 episodios (semillas 91001–91020), usando una aproximación 2D de la caminata basada en una tabla de velocidades medidas por comando, sin red neuronal de caminata ni modelo físico del robot.

## Capacidades

- Toma de decisiones discretas en un espacio de cinco acciones para la tarea `goto_target` del robot LINK-01.
- Lectura de estados del robot serializados en texto (21 observaciones: distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa).
- Generación de respuestas restringidas a una única letra, sin explicación, bajo un system prompt específico.
- Robustez parcial ante estados derivados de desviaciones: el dataset incluye un 20% de casos con acciones distintas a las del cerebro PPO.
- Capacidad multilingüe limitada: el modelo está entrenado y etiquetado únicamente para coreano.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación educativa en aprendizaje por refuerzo: el modelo sirve como ejemplo completo de pipeline RL (PPO en simulador) seguido de destilación en un LLM pequeño, útil para cursos y talleres sobre RL y robótica simulada.
- Control de robot simulado en entornos de aprendizaje: puede colocarse en el puesto de decisión del robot LINK-01 dentro del simulador web para reproducir el comportamiento del cerebro PPO con un modelo de lenguaje.
- Destilación de políticas RL en modelos de lenguaje: el flujo de generación de dataset (observación serializada + acción) y ajuste con LoRA más PPO con KL es reutilizable para otras tareas de decisión discreta.
- Evaluación comparativa de métodos de ajuste: permite comparar aprendizaje supervisado frente a refuerzo posterior sobre el mismo dataset y la misma tarea, con métricas de precisión y éxito de episodios.
- Prototipado rápido en Google Colab: la model card incluye un notebook de Colab para reproducir el entrenamiento, lo que facilita experimentos sin infraestructura propia.
- Generación de datos sintéticos de decisión: el modelo puede usarse para etiquetar estados adicionales del robot en la misma distribución de la tarea `goto_target`, ampliando el dataset de entrenamiento.
- Demostración de integración PEFT en producción ligera: al ser un adaptador LoRA sobre un modelo de 0,8B, puede desplegarse en entornos con recursos limitados para tareas de clasificación restringida.

## Benchmarks y rendimiento

Los datos de la model card corresponden a la evaluación propia del autor sobre la tarea `goto_target`, no a benchmarks estándar de LLM.

| Modelo | Precisión en test (misma respuesta que el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0% | 100% | 0% | 11,8 s |
| Modelo antes del entrenamiento | 29,4% | 0% | 0% | — |
| Aprendizaje supervisado (LoRA) | 60,8% | 85% | 0% | 14,4 s |
| Refuerzo posterior (PPO + KL) | 62,9% | 100% | 0% | 13,6 s |

La evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades medidas por comando, sin modelo físico del robot ni red de caminata, por lo que los resultados pueden diferir de los obtenidos en MuJoCo web.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo base de 0,8B parámetros, la inferencia en precisión completa (fp16/bf16) requiere aproximadamente 1,6–2 GB de VRAM para los pesos, más overhead de activaciones y contexto. En cuantización de 8 bits o 4 bits podría reducirse por debajo de 1 GB, aunque el autor no publica cuantizaciones del adaptador.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; una RTX 3060, RTX 4060 o superior permite ejecución cómoda. Para entrenamiento del adaptador, se recomienda al menos 8–12 GB de VRAM.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` + `peft` (según el snippet de la model card), y potencialmente `vLLM` o `TGI` si se fusiona el adaptador con el modelo base. `llama.cpp` y `Ollama` requerirían conversión a GGUF del modelo fusionado, no disponible en el repositorio.
- Latencia y throughput: no disponibles. El modelo genera una única letra, por lo que la latencia por decisión debería ser baja, pero el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (adaptadores LoRA de decisión sobre Qwen3.5-0.8B para control de robot simulado). Se ofrece una comparación con el modelo base y con la política RL original.

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B + LoRA | no disponible | 62,9% precisión en test; 100% éxito en 20 episodios | Apache 2.0 | Hugging Face |
| Cerebro PPO (profesor) | no disponible (política RL) | no aplica | 100% precisión; 100% éxito; 11,8 s | no disponible | No publicado como modelo |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | 29,4% precisión sin ajuste | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `goto_target` del robot LINK-01 y no generaliza a otras tareas, robots o entornos sin reentrenamiento.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no un simulador físico completo; los resultados pueden no reproducirse en MuJoCo u otros entornos.
- El modelo solo responde en coreano y está etiquetado únicamente para ese idioma.
- La precisión en test es del 62,9%, muy por debajo del cerebro PPO (100%); el éxito en episodios se debe a la robustez del lazo de control, no a una imitación perfecta.
- Riesgo de alucinación: al ser un LLM generativo, podría devolver letras no válidas o texto adicional si el prompt no se aplica exactamente como se especifica.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador, y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- No se publican cuantizaciones, mediciones de latencia ni detalles sobre el tamaño del adaptador LoRA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-link01
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
