# zen-E/PLatour-Qwen3.5-35B-to-4B-DeepCoder

## Resumen

PLatour-Qwen3.5-35B-to-4B-DeepCoder es un artefacto de investigación publicado por el usuario zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo completo, sino un conjunto de puentes lineales (bridges) entrenados entre dos backbones congelados: un emisor grande, Qwen/Qwen3.5-35B-A3B, que codifica el prompt y aporta representaciones ocultas, y un receptor pequeño, Qwen/Qwen3.5-4B, que genera la respuesta de forma independiente.

El repositorio distribuye únicamente los pesos de inferencia de las proyecciones del puente (0,7 GB), no los backbones, que deben descargarse por separado. El autor declara explícitamente que esta exportación no incluye puntuaciones de benchmarks ni garantiza el protocolo de selección de checkpoints, por lo que se trata de material histórico de reproducción, no de un modelo listo para producción.

Su relevancia es metodológica: explora si la información codificada por un modelo grande puede transferirse a uno pequeño mediante puentes ligeros entrenados con recompensas de tarea, y propone PACT-Check con controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar que las mejoras provienen realmente de la comunicación entre modelos y no de la adaptación del receptor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) entre dos backbones transformer congelados; soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo contiene solo las proyecciones del puente, 0,7 GB) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los backbones upstream conservan sus propias licencias) |
| Formato de pesos | safetensors con cargador personalizado (custom-loader); no compatible con `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre dos backbones congelados: un emisor de mayor tamaño (Qwen3.5-35B-A3B, presumiblemente con arquitectura MoE dado el sufijo A3B) que procesa el prompt y suministra representaciones ocultas, y un receptor menor (Qwen3.5-4B) que genera la respuesta de forma autorregresiva e independiente. Las proyecciones se inicializan a cero y se optimizan mediante recompensas de tarea, sin actualizar los pesos de ninguno de los dos backbones. El método contempla modelos con atención híbrida.

El paper introduce además PACT-Check, un conjunto de controles experimentales diseñado para descartar explicaciones alternativas: Dummy Transfer (transferencia nula), Irrelevant Transfer (información no relacionada), Self-Communication (el modelo se comunica consigo mismo) y Trained Receiver (receptor entrenado sin emisor). El objetivo es distinguir si la mejora en la tarea proviene de información útil del emisor o simplemente de la adaptación del receptor. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia a `zen-E/PLatour-DeepCoder-Data`) ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de código: el experimento 26 está orientado a tareas de programación (DeepCoder), con evaluación que requiere un juez oficial aislado.
- Transferencia de representaciones entre modelos de distinto tamaño mediante puentes ligeros.
- Compatibilidad con backbones de atención híbrida según el diseño del método.
- No se documentan capacidades de tool calling, function calling, agentes, multimodalidad, visión, audio ni modo thinking para este artefacto.
- Capacidades multilingües: no disponibles.
- El artefacto en sí no genera texto de forma autónoma; requiere el cargador del proyecto PLatour, los backbones descargados por separado y las entradas de tarea firmadas.

## Casos de uso

- Reproducción de investigación en transferencia entre modelos: permite replicar el experimento 26 del paper PACT usando `platour-exps download --experiment 26` y los backbones Qwen3.5 correspondientes, con fines de verificación académica.
- Estudio de PACT-Check: sirve para ejecutar los controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) y evaluar si la comunicación entre modelos aporta información útil frente a la mera adaptación del receptor.
- Evaluación de generación de código en entornos controlados: el artefacto está asociado a tareas DeepCoder y requiere el juez oficial aislado, lo que lo hace adecuado para pipelines de evaluación reproducibles más que para uso directo.
- Análisis de eficiencia emisor-receptor: permite medir el coste computacional de usar un emisor grande solo en la fase de prefill y un receptor pequeño en la decodificación autorregresiva.
- Investigación sobre atención híbrida: al soportar modelos de atención híbrida, facilita experimentos sobre cómo se transfieren representaciones entre arquitecturas de atención distintas.
- Auditoría de procedencia de artefactos: el repositorio incluye mapeo de tensores y SHA-256 en `config.json`, lo que permite verificar la integridad de los pesos en estudios de reproducibilidad.
- Docencia y divulgación: como ejemplo práctico de transferencia cross-model con controles experimentales, útil en cursos de investigación en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta exportación no adjunta resultados de benchmarks y que se requiere una evaluación independiente y una revisión de procedencia antes de usar estos artefactos para respaldar nuevas afirmaciones comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto (0,7 GB de puentes); el consumo real depende de los backbones Qwen3.5-35B-A3B (emisor) y Qwen3.5-4B (receptor), que deben descargarse por separado.
- GPU recomendadas: no disponible en la información proporcionada; el emisor de 35B con parámetros activos tipo MoE probablemente requiere GPU de centro de datos (A100, H100) para el prefill, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: cargador propio del proyecto PLatour (`platour-exps`); no es compatible con `AutoModel.from_pretrained` ni PEFT, por lo que vLLM, llama.cpp, Ollama o TGI no están soportados de forma nativa según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3.5-35B-to-4B-DeepCoder | Puentes PACT entre backbones congelados | No disponible (repo de 0,7 GB) | No disponible | Apache-2.0 | Hugging Face, cargador propio |
| Qwen/Qwen3.5-4B | Modelo image-text-to-text completo | 5B | No disponible | No disponible en la información | Hugging Face, Transformers |
| Qwen/Qwen3.5-35B-A3B | Modelo base emisor | 35B (activos tipo A3B) | No disponible | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere los backbones descargados por separado y el cargador del proyecto PLatour; no funciona con `AutoModel.from_pretrained` ni PEFT.
- Sin benchmarks publicados: el autor declara que la exportación no adjunta resultados y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre rendimiento imparcial en held-out.
- Procedencia no verificada: las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- No es estado de reanudación de optimizador/RNG: solo contiene pesos de inferencia.
- Riesgo de conclusiones erróneas: el propio paper advierte que un mejor rendimiento en la tarea no demuestra por sí solo una comunicación efectiva entre modelos; se requieren los controles PACT-Check.
- Idiomas, sesgos y alucinación: no disponibles para este artefacto; dependen de los backbones subyacentes.
- Licencia: el artefacto es Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- Evaluación de código: requiere el juez oficial aislado, lo que añade complejidad y dependencias externas al pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3.5-35B-to-4B-DeepCoder
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
