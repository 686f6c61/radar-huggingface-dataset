# SZLHOLDINGS/triage-v2-trained

## Resumen

triage-v2-trained es un adaptador LoRA (entrenado mediante QLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que deben cargarse junto al modelo base para funcionar. El adaptador se entrenó con 200 pasos sobre un currículo propietario denominado `SZLHOLDINGS/szl-1-doctrine-sft`, con el objetivo declarado de medir el "suelo de confabulación" (confabulation floor) dentro del programa de honestidad de la organización.

El modelo se enmarca en una "ola de entrenamiento masivo" fechada el 13 de noviembre de 2026, en la que SZLHOLDINGS publica múltiples adaptadores acompañados de recibos de evaluación en una cadena pública. Su relevancia es, por tanto, más experimental y de investigación que práctica: sirve como punto de datos dentro de un contraste de currículos de entrenamiento, no como un modelo listo para producción.

La evaluación publicada es una batería de 6 sondas fijas (3 con respuesta posible y 3 sin respuesta posible), con decodificación determinista y un máximo de 200 tokens, en la que el modelo obtiene una puntuación de 3/6. El autor describe explícitamente este resultado como un piloto y no como una evaluación exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, sin especificar) |
| Tipos de cuantizacion | QLoRA durante el entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base Qwen/Qwen3.5-0.8B, con rango r=16, alpha=32, dropout de 0.05 y módulos objetivo q_proj, k_proj, v_proj y o_proj. El entrenamiento consta de 200 pasos con batch_size=2, acumulación de gradiente de 4, learning rate de 2e-4 y precisión bf16, ejecutado sobre una NVIDIA RTX A6000 de 48 GB (nodo 0056-kci3-sma6-prxmx200114). El currículo utilizado es `SZLHOLDINGS/szl-1-doctrine-sft`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación declarada no es arquitectónica sino metodológica: el adaptador forma parte de un programa que registra cada medición en una cadena pública de recibos, con el fin de comparar cómo distintos currículos afectan al comportamiento de confabulación del modelo.

## Capacidades

- Generación de texto y conversación (pipeline text-generation, etiqueta conversational).
- Ajuste específico orientado a triaje y a la gestión de preguntas sin respuesta (las sondas de evaluación incluyen casos "unanswerable").
- Al ser un adaptador sobre Qwen3.5-0.8B, hereda las capacidades del modelo base, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre confabulación: el adaptador sirve como punto de comparación en experimentos que miden cómo distintos currículos de SFT afectan a la tendencia del modelo a inventar respuestas ante preguntas sin respuesta.
- Reproducción de experimentos: gracias a la cadena pública de recibos y a los hiperparámetros documentados (r=16, alpha=32, lr=2e-4, 200 pasos), un investigador puede replicar el entrenamiento y contrastar el resultado de 3/6.
- Prototipado de sistemas de triaje: sobre el modelo base Qwen3.5-0.8B, el adaptador puede probarse en tareas de clasificación y derivación de consultas, aunque su evaluación es mínima y requeriría validación adicional.
- Docencia y divulgación: como ejemplo compacto de flujo QLoRA completo (currículo, entrenamiento en A6000, evaluación determinista, publicación de recibos) para cursos de ajuste fino.
- Evaluación de infraestructura de adaptadores: útil para validar pipelines de carga de adaptadores PEFT junto al modelo base en entornos de integración continua.
- Estudio de metodologías de evaluación: las 6 sondas fijas permiten analizar las limitaciones de las baterías reducidas y comparar con evaluaciones más amplias.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| Bateria de 6 sondas (3 answerable + 3 unanswerable) | 3/6 | Decodificacion determinista, max 200 tokens |
| MMLU | no disponible | |
| HumanEval | no disponible | |
| GSM8K | no disponible | |

No se han publicado resultados de benchmarks estandar en la informacion disponible. El unico dato de evaluacion es la puntuacion de 3/6 en la bateria propia del autor, que este describe como un piloto y no como una evaluacion exhaustiva.

## Requisitos de hardware

- El adaptador en si ocupa un espacio mínimo (el repositorio figura con 0.0 GB), pero requiere cargar el modelo base Qwen3.5-0.8B.
- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 0.8B en bf16 se sitúa en el orden de 2 GB, y menos con cuantización de 4 bits, aunque esta cifra no está confirmada en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA RTX A6000 (48 GB); para inferencia, cualquier GPU consumer con suficiente VRAM para el modelo base debería bastar.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo base, aunque no se documenta.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarlo junto al modelo base mediante la librería `peft`/`transformers`; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| triage-v2-trained (este) | Adaptador sobre 0.8B | no disponible | 3/6 en bateria propia de 6 sondas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | no disponible | no disponible | no disponible | Hugging Face |
| Otros adaptadores de la ola de SZLHOLDINGS | Adaptadores sobre modelos base | no disponible | Recibos en la cadena publica | Apache 2.0 (segun este modelo) | Hugging Face |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada, por lo que la comparativa se limita a la relación con el modelo base y con los demás adaptadores del mismo programa.

## Limitaciones y advertencias

- No es un modelo autónomo: es un adaptador LoRA y requiere el modelo base Qwen/Qwen3.5-0.8B para funcionar.
- La evaluación se basa en 6 sondas fijas, insuficiente para caracterizar el rendimiento general; el propio autor lo califica de piloto.
- Solo 200 pasos de entrenamiento: no es una ejecución completa y el ajuste puede ser superficial.
- Riesgo de confabulación: el programa mide precisamente el "suelo de confabulación", y la puntuación de 3/6 indica que la mitad de las sondas no se superan.
- Idiomas soportados no declarados; no se puede garantizar un comportamiento multilingüe adecuado.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías sobre calidad o idoneidad para producción.
- Al ser un experimento de investigación con 0 descargas y 0 likes, carece de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/triage-v2-trained
- Cadena de recibos (dataset): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK de szl en PyPI: https://pypi.org/project/szl/
- Sitio de la organizacion: https://a-11-oy.com
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
