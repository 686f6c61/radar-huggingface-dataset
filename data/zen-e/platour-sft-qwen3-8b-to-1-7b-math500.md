# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-MATH500

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-MATH500 es un artefacto de investigación publicado por zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). En lugar de ser un modelo autónomo, el repositorio contiene únicamente las proyecciones lineales ("bridges") entrenadas entre dos backbones congelados: un emisor grande (Qwen/Qwen3-8B) que codifica el prompt y genera representaciones ocultas, y un receptor pequeño (Qwen/Qwen3-1.7B) que produce la respuesta de forma independiente.

El experimento 12 se centra en tareas de matemáticas (MATH500) y se distribuye como pesos de inferencia históricos, sin puntuaciones de benchmark asociadas. El tamaño del repositorio es de 0,9 GB, coherente con un conjunto de proyecciones ligeras en lugar de pesos completos de un transformer. La licencia declarada es Apache-2.0, aunque los modelos base referenciados conservan sus propias licencias.

La relevancia de este artefacto es metodológica: explora si la información codificada por un modelo grande puede transferirse a uno pequeño mediante puentes entrenados con recompensas de tarea, y propone el marco de control PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras dependen realmente de la información del emisor y no de la simple adaptación del receptor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con puentes lineales entre backbones congelados (PACT); soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo de 0,9 GB contiene proyecciones, no pesos completos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3-8B y Qwen3-1.7B, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (los modelos upstream conservan sus licencias) |
| Formato de pesos | safetensors, con cargador propio (`custom-loader`) y `config.json` con identidad de experimento, mapeo de tensores, nombre de fichero y SHA-256 |

## Arquitectura y entrenamiento

El método PACT separa el cómputo en dos fases: un emisor grande (Qwen3-8B) procesa el prompt y produce representaciones ocultas, que se proyectan mediante puentes lineales ligeros hacia el espacio del receptor pequeño (Qwen3-1.7B), encargado de la generación autorregresiva. Los backbones permanecen congelados; solo se entrenan las proyecciones, inicializadas a cero y optimizadas mediante recompensas de tarea. El diseño admite modelos con atención híbrida.

El entrenamiento se realizó sobre el dataset zen-E/PLatour-Qwen3-Data y corresponde al experimento 12 (SFT sobre MATH500). El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) destinado a distinguir si la mejora proviene de la información útil del emisor o de la mera adaptación del receptor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por representaciones del emisor Qwen3-8B.
- Razonamiento matemático orientado a MATH500, según la identidad del experimento 12.
- Transferencia de información entre modelos de distinto tamaño a través de proyecciones lineales entrenadas.
- Soporte de modelos con atención híbrida en el diseño del método.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en transferencia entre modelos: permite reproducir el experimento 12 del paper y analizar si las representaciones del emisor aportan señal útil al receptor en tareas de matemáticas.
- Validación de metodología PACT-Check: sirve para ejecutar los controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) y comprobar que las mejoras no son artefactos de adaptación del receptor.
- Estudio de eficiencia computacional: al mantener congelados ambos backbones y entrenar solo puentes ligeros, es adecuado para analizar costes de entrenamiento y de inferencia frente a alternativas de destilación.
- Reproducibilidad de resultados: el `config.json` incluye identidad de experimento, mapeo de tensores y SHA-256, lo que facilita auditorías de pesos en entornos de investigación.
- Evaluación comparativa de arquitecturas emisor-receptor: útil para contrastar pares de modelos de distinto tamaño en tareas de razonamiento matemático bajo el mismo protocolo.
- Docencia y formación: como ejemplo práctico de comunicación entre modelos y de diseño de controles experimentales en investigación de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explícitamente que distribuye pesos de inferencia históricos sin puntuaciones y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre rendimiento en held-out no sesgado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto completo; depende de los backbones descargados por separado (Qwen3-8B como emisor y Qwen3-1.7B como receptor).
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; el emisor de 8B condiciona los requisitos.
- Opciones de despliegue: no es cargable mediante `AutoModel.from_pretrained` ni PEFT; requiere el cargador del proyecto PLatour (`platour-exps download --experiment 12`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-MATH500 | Puentes ligeros sobre Qwen3-8B y Qwen3-1.7B | No disponible | Transferencia emisor-receptor (PACT) | Apache-2.0 | Pesos de inferencia con cargador propio |
| Qwen/Qwen3-8B | 8B | No disponible en la información | LLM denso | No disponible en la información | Hugging Face |
| Qwen/Qwen3-1.7B | 1.7B | No disponible en la información | LLM denso | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado el emisor y el receptor, y usar el cargador del proyecto PLatour.
- No es compatible con `AutoModel.from_pretrained` ni con PEFT.
- No incluye puntuaciones de benchmark; el autor advierte que se requiere evaluación independiente y revisión de procedencia antes de usar el artefacto para nuevas afirmaciones comparativas.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export no constituye estado de reanudación de optimizador/RNG.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Restricciones de licencia: el export usa Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- Idiomas soportados y limitaciones de contexto: no disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-MATH500
- Paper (HTML arXiv): https://arxiv.org/html/2611.06976
- Paper (abs arXiv): https://arxiv.org/abs/2611.06976
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
