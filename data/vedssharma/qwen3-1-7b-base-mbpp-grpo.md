# vedssharma/Qwen3-1.7B-Base-MBPP-GRPO

## Resumen

Qwen3-1.7B-Base-MBPP-GRPO es un ajuste fino del modelo base Qwen/Qwen3-1.7B-Base, desarrollado por el usuario vedssharma, mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) aplicado específicamente a la generación de código Python. El objetivo es mejorar la precisión del modelo en tareas de síntesis de código evaluadas con tests unitarios, tomando como referencia el conjunto de problemas MBPP.

El modelo parte de la arquitectura transformer densa de Qwen3 con 1.720.574.976 parámetros totales y se entrena con TRL y vLLM sobre aproximadamente 460 problemas de MBPP (divisiones train, validation y prompt). La recompensa es binaria: 1 si el código generado supera todos los tests unitarios y 0 en caso contrario, sin término KL. El entrenamiento consta de 200 pasos con learning rate 1e-6, 8 prompts y 8 muestras por paso, y un máximo de 512 tokens de finalización.

Su relevancia es acotada y experimental: demuestra un flujo de RL para código sobre un modelo pequeño (1.7B) y reporta una mejora de 5 puntos porcentuales en MBPP test pass@1 (del 52,0 % al 57,0 % con decodificación greedy y n=500). El autor advierte que se trata de un experimento a pequeña escala cuyas ganancias pueden no generalizar más allá de tareas de estilo MBPP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B-Base) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa del Qwen3-1.7B-Base, sin modificaciones estructurales. El ajuste se realiza con GRPO, una variante de aprendizaje por refuerzo que estima la ventaja relativa dentro de un grupo de muestras generadas para el mismo prompt, eliminando la necesidad de un modelo crítico separado. El entrenamiento se ejecutó con TRL y vLLM sobre una única GPU H100 en un entorno Daytona, con 200 pasos, learning rate de 1e-6, 8 prompts por paso con 8 muestras cada uno, un máximo de 512 tokens de finalización y sin término de divergencia KL.

La señal de recompensa es puramente funcional: se asigna 1 si el código generado pasa todos los tests unitarios del problema y 0 en caso contrario. El conjunto de entrenamiento comprende aproximadamente 460 problemas de MBPP, sumando las divisiones de train, validation y prompt. El formato de prompt es texto plano con el enunciado del problema y el primer test, terminando en una valla de código Python abierta (```python), y la generación se detiene al cerrar la valla. Los pesos se guardan en fp32 tal como los produjo el entrenador.

## Capacidades

- Generación de código Python a partir de enunciados en lenguaje natural con tests de referencia.
- Razonamiento orientado a la resolución de problemas de programación de estilo competitivo o de ejercicios con validación por tests.
- Generación de texto conversacional heredada del modelo base Qwen3-1.7B-Base.
- Formato de prompt específico: enunciado más primer test, con valla de código Python abierta y parada en la valla de cierre.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de funciones Python con tests unitarios: el modelo está entrenado para producir código que pase los tests asociados al enunciado, por lo que encaja en pipelines de síntesis de código validada automáticamente.
- Evaluación de técnicas de RL para código: sirve como referencia reproducible de un flujo GRPO con TRL y vLLM sobre un modelo de 1.7B, útil para investigadores que quieran replicar o comparar configuraciones.
- Prototipado de asistentes de programación en entornos con recursos limitados: al tratarse de un modelo de 1.7B, puede desplegarse en hardware modesto para tareas de autocompletado o resolución de ejercicios acotados.
- Generación de datos sintéticos de código: puede emplearse para producir soluciones candidatas a problemas tipo MBPP que luego se filtran con ejecución de tests.
- Investigación sobre recompensas basadas en ejecución: el diseño de recompensa binaria por tests unitarios es un ejemplo directo para estudiar el impacto de señales de verificación en modelos pequeños.
- Fine-tuning posterior sobre dominios específicos: al partir de un modelo base pequeño y con pesos en fp32, es un punto de partida manejable para ajustes adicionales en tareas de código acotadas.

## Benchmarks y rendimiento

| Modelo | MBPP test pass@1 (greedy, n=500) |
|---|---|
| Qwen3-1.7B-Base | 52,0 % |
| Qwen3-1.7B-Base-MBPP-GRPO | 57,0 % |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.720.574.976 parámetros, en fp32 los pesos ocupan aproximadamente 6,9 GB, en fp16 unos 3,4 GB y en cuantización de 8 bits unos 1,7 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en una única H100; para inferencia, una GPU con al menos 8 GB de VRAM en fp16 resulta suficiente según el tamaño del modelo.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en fp16, y en tarjetas con 4-6 GB si se cuantiza; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible); vLLM se usó durante el entrenamiento, aunque no se documenta su uso para servir el modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MBPP pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Base-MBPP-GRPO | 1,72B | no disponible | 57,0 % (greedy, n=500) | no disponible | HuggingFace |
| Qwen3-1.7B-Base | 1,72B | no disponible | 52,0 % (greedy, n=500) | no disponible | HuggingFace |
| Otros modelos de ~1,7B ajustados para código | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Experimento a pequeña escala: el propio autor indica que el conjunto de entrenamiento es reducido y que las ganancias pueden no generalizar más allá de tareas de estilo MBPP.
- Riesgo de sobreajuste al formato de prompt: el modelo espera un enunciado con el primer test y una valla de código Python abierta; fuera de ese formato el rendimiento puede degradarse.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado en la información disponible; en generación de código puede producir soluciones sintácticamente plausibles pero incorrectas.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- Pesos en fp32: el repositorio ocupa 6,9 GB, lo que incrementa los requisitos de almacenamiento y memoria frente a versiones en fp16 o cuantizadas.
- Sin datos de benchmarks más allá de MBPP: no hay evidencia publicada sobre otras tareas de código, matemáticas o razonamiento general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vedssharma/Qwen3-1.7B-Base-MBPP-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset MBPP: no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio TRL: no disponible en la información proporcionada
- Repositorio vLLM: no disponible en la información proporcionada
