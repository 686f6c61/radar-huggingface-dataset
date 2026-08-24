# Valhari14/Learning-in-Interaction

## Resumen

El repositorio `Valhari14/Learning-in-Interaction` contiene los checkpoints fusionados de un estudio experimental sobre la transferencia del método de auto-corrección **SCoRe** (Self-Correction via Reinforcement Learning) a juegos de diálogo del entorno **Playpen**. El modelo base es **Qwen3.5-9B**, sobre el que se aplica un entrenamiento en dos fases: primero un ajuste fino supervisado (SFT) y posteriormente el algoritmo SCoRe con aprendizaje por refuerzo. El objetivo es comprobar si una técnica diseñada para tareas matemáticas y de código puede mejorar la capacidad de auto-corrección en diálogos multi-turno con feedback basado en juegos.

Este proyecto es relevante porque explora una línea de investigación emergente: el aprendizaje de interacción mediante refuerzo en entornos de diálogo estructurado, con métricas como tasa de victoria, tasa de abandono y tasas de auto-corrección. Los resultados son exploratorios, con solo 10 episodios de evaluación por juego y modelo, por lo que deben interpretarse como direccionales, no concluyentes. No se ha evaluado el modelo como una versión general mejorada de Qwen3.5-9B, y su uso previsto es exclusivamente para investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (transformer, no se especifica si es denso o MoE) |
| Parametros totales | 9B (según nombre del modelo base) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer de aproximadamente 9 mil millones de parámetros. El entrenamiento se realizó en el entorno Playpen, que incluye juegos de diálogo como AdventureGame, TextMapWorld (con variantes GraphReasoning y SpecificRoom) y Wordle. Se aplicó primero un SFT con 2.677 episodios exitosos, 3 épocas y LoRA, para luego ejecutar el procedimiento SCoRe en dos etapas: la etapa I con 3 épocas y la etapa II con 5 épocas. El hardware utilizado fueron 2 GPUs NVIDIA H100 de 80 GB, con un tiempo total de entrenamiento de aproximadamente 7 días, sin incluir ajuste de hiperparámetros.

La innovación principal es el uso de SCoRe, un método de auto-corrección mediante aprendizaje por refuerzo que busca que el modelo genere una respuesta inicial y luego se corrija a sí misma en un segundo intento, optimizando la recompensa acumulada. Este enfoque se había probado en matemáticas y código, y aquí se traslada a juegos de diálogo con feedback basado en el resultado del juego. No se detalla si se emplearon técnicas como decodificación especulativa o attention lineal.

## Capacidades

- **Generación de texto y razonamiento**: al estar basado en Qwen3.5-9B, se espera que herede las capacidades generales del modelo base (generación, razonamiento, código, matemáticas), aunque no han sido evaluadas en este repositorio.
- **Auto-corrección**: el objetivo principal es mejorar la capacidad del modelo para corregir sus propias respuestas en un segundo intento, gracias al entrenamiento SCoRe.
- **Aprendizaje por refuerzo en juegos de diálogo**: el modelo ha sido entrenado para maximizar la recompensa en entornos como Wordle o mapas de texto, donde la interacción multi-turno es clave.
- **Soporte de tool calling**: no se menciona en la información proporcionada.
- **Soporte de agentes y multi-step reasoning**: no se ha evaluado explícitamente, pero la naturaleza de los juegos de diálogo sugiere cierta capacidad de razonamiento secuencial.
- **Capacidades multilingües**: no se indica, aunque Qwen3.5 suele ser multilingüe; no hay confirmación para este modelo.

## Casos de uso

- **Investigación en auto-corrección**: el modelo es ideal para estudiar cómo el RL mejora la capacidad de auto-corrección en diálogos. Los investigadores pueden comparar las tasas de auto-corrección y regresión frente a modelos sin entrenamiento SCoRe.
- **Evaluación de técnicas de RL en entornos de juego**: sirve para analizar cómo se comporta el aprendizaje por refuerzo en juegos de texto con feedback parcial, lo que puede informar el diseño de entornos de entrenamiento.
- **Estudio de la transferencia de SCoRe a dominios no matemáticos**: permite comprobar si el método SCoRe, originalmente pensado para matemáticas, se adapta a dominios de interacción conversacional.
- **Análisis de tasas de abandono**: el modelo se evalúa con métricas de abort rate, lo que puede ser útil para estudiar cuándo un agente de diálogo se rinde o no.
- **Desarrollo de agentes de juego**: aunque no es el uso previsto, podría servir como base para experimentar en el desarrollo de agentes que juegan a juegos de texto con auto-corrección.
- **Investigación en aprendizaje a partir de interacción**: el modelo se centra en aprender de la interacción con el entorno, lo que es relevante para sistemas de diálogo que necesitan adaptarse a la retroalimentación del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas de evaluación (win rate, abort rate, tasas de auto-corrección y regresión, turnos y uso de tokens, Playpen/ClemScore), pero no se presentan valores numéricos. Además, la evaluación se realizó con solo 10 episodios por juego y modelo, por lo que los resultados serían direccionales y no estadísticamente significativos.

## Requisitos de hardware

- **Entrenamiento**: se utilizaron 2 GPUs NVIDIA H100 80GB, con un tiempo total de 7 días.
- **Inferencia**: no se proporcionan datos específicos de VRAM ni latencia. Dado que el modelo tiene 9B parámetros, se puede estimar que con cuantización de 4 bits cabría en una GPU con 12 GB de VRAM (por ejemplo, una RTX 3060 o RTX 4070), pero esto no es confirmado por el autor.
- **Opciones de despliegue**: al ser un modelo de transformers, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama, etc., pero no se ha probado.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información para comparar con otros modelos de la misma categoría. El modelo es una variante experimental de Qwen3.5-9B, por lo que podría compararse con el propio Qwen3.5-9B original, pero no hay datos de rendimiento de este modelo en los benchmarks típicos. Se puede indicar que no hay comparativa disponible.

## Limitaciones y advertencias

- **Uso exclusivo para investigación**: los checkpoints no han sido evaluados como versiones generales mejoradas de Qwen3.5-9B, por lo que no se recomienda su uso en producción.
- **Evaluación limitada**: solo 10 episodios por juego y modelo, lo que hace que los resultados no sean concluyentes.
- **Licencia no disponible**: no se especifica la licencia, lo que puede limitar su uso comercial o su redistribución.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede generar información falsa, especialmente en diálogos abiertos.
- **Sesgos**: no se han evaluado los sesgos del modelo base, ni los posibles sesgos inducidos por el entrenamiento en juegos concretos.
- **Dependencia del entorno**: el entrenamiento se realizó en entornos Playpen específicos, por lo que su generalización a otros dominios es incierta.

## Enlaces

- [HuggingFace - Learning-in-Interaction](https://huggingface.co/Valhari14/Learning-in-Interaction)
- [Perfil de Hugging Face de Valhari14](https://huggingface.co/Valhari14)
- [Perfil de GitHub de Valhari14](https://github.com/Valhari14)
- [Modelo relacionado: score-qwen3.5-9b-playpen](https://huggingface.co/Valhari14/score-qwen3.5-9b-playpen)
- [Artículo sobre interacciones humano-IA (contexto general)](https://dl.acm.org/doi/full/10.1145/3664522)
- [Artículo en Wiley Advanced Science](https://advanced.onlinelibrary.wiley.com/doi/10.1002/advs.75819)
