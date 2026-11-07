# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux es un artefacto de investigación publicado por zen-E que materializa el experimento 02 (SFT sobre `mmlu_redux`) del proyecto PLatour, descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo de lenguaje autónomo, sino un conjunto de proyecciones lineales ("bridges") entrenadas entre dos backbones congelados: un emisor grande (Qwen3-235B-A22B-FP8) que codifica el prompt y un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma independiente.

El método, denominado PACT (Prefill-to-Autoregressive Cross-model Transfer), entrena puentes lineales ligeros inicializados a cero mediante recompensas de tarea, y está diseñado para soportar modelos con atención híbrida. El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si la mejora observada proviene realmente de información útil del emisor o simplemente de la adaptación del receptor.

Es relevante ahora porque propone una vía para aprovechar la capacidad de representación de modelos de 235B en la inferencia de modelos de 1.7B, reduciendo drásticamente el coste de generación. Sin embargo, el propio autor advierte que este repositorio distribuye pesos históricos de inferencia sin puntuaciones de benchmark y que no debe interpretarse como un modelo listo para producción ni cargarse con `AutoModel.from_pretrained`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridges) sobre backbones transformer congelados; soporta atención híbrida |
| Parametros totales | No disponible (el repo pesa 0,9 GB y contiene solo las proyecciones; los backbones se descargan aparte) |
| Parametros activos | No disponible (el emisor Qwen3-235B-A22B es MoE, pero este repo no contiene sus pesos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors, con cargador personalizado (`custom-loader`); no compatible con `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

El modelo implementa PACT: un emisor grande (Qwen3-235B-A22B-FP8) procesa el prompt y produce representaciones ocultas; un receptor pequeño (Qwen3-1.7B) genera la respuesta de forma autorregresiva e independiente. Entre ambos se entrenan proyecciones lineales ligeras, inicializadas a cero, que transforman las representaciones del emisor en el espacio del receptor. El entrenamiento utiliza recompensas de tarea (task rewards) sobre backbones congelados, y el diseño contempla modelos con atención híbrida.

Este repositorio concreto corresponde al experimento 02: SFT sobre el conjunto `mmlu_redux`, usando el dataset `zen-E/PLatour-Qwen3-Data`. El paper complementa el método con PACT-Check, que incluye controles de transferencia ficticia, transferencia irrelevante, autocomunicación y receptor entrenado, para descartar que las mejoras provengan solo de la adaptación del receptor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Transferencia de representaciones entre un emisor de 235B y un receptor de 1.7B mediante puentes lineales entrenados.
- Generación de respuestas por parte del receptor de forma independiente tras recibir las representaciones del emisor.
- Soporte declarado para modelos con atención híbrida en el diseño del método.
- Evaluación orientada a tareas de conocimiento tipo MMLU (experimento sobre `mmlu_redux`).
- Controles de validación PACT-Check para verificar la utilidad real de la comunicación entre modelos.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking propias de este artefacto.

## Casos de uso

- Investigación en transferencia entre modelos: permite reproducir el experimento 02 del paper y analizar si un emisor de 235B mejora a un receptor de 1.7B en tareas de conocimiento, usando el cargador del proyecto y los backbones descargados por separado.
- Estudio de eficiencia computacional: evaluar si sustituir la generación con un modelo de 235B por un receptor de 1.7B guiado por representaciones del grande reduce coste de inferencia manteniendo calidad en MMLU.
- Validación metodológica con PACT-Check: emplear los controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para comprobar que las mejoras no son artefactos de adaptación del receptor.
- Reproducibilidad de investigación: el repo incluye `config.json` con identidad del experimento, dependencias, mapeo de tensores, nombre de fichero y SHA-256, lo que facilita auditorías de resultados.
- Análisis de atención híbrida: estudiar cómo se comportan los puentes lineales cuando el emisor y el receptor usan esquemas de atención distintos.
- Base para experimentos derivados: servir como punto de partida para entrenar nuevos puentes sobre otras tareas o pares de modelos, dado que las proyecciones son ligeras (0,9 GB) y los backbones permanecen congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio distribuye pesos históricos de inferencia sin puntuaciones y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre rendimiento imparcial en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto aislado; depende de los backbones. El emisor Qwen3-235B-A22B-FP8 requiere hardware de clase servidor (múltiples GPU de 80 GB), mientras que el receptor Qwen3-1.7B puede ejecutarse en una GPU consumer.
- GPU recomendadas: no disponible de forma específica; por los backbones implicados, se presume A100/H100 para el emisor y RTX 4090 o similar para el receptor.
- Cabe en GPU consumer: el receptor de 1.7B sí; el emisor de 235B no.
- Opciones de despliegue: cargador propio del proyecto PLatour (`platour-exps download --experiment 2`); no es compatible con vLLM, llama.cpp, Ollama, TGI ni `AutoModel.from_pretrained`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux | Puentes ligeros (0,9 GB) + backbones 235B/1.7B | No disponible | Transferencia prefill-a-autorregresivo (PACT) | Apache-2.0 | Hugging Face, cargador propio |
| Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | Transformer denso | Apache-2.0 | Hugging Face, ecosistema estándar |
| Qwen3-235B-A22B (base) | 235B totales / 22B activos (MoE) | No disponible en esta ficha | MoE | Apache-2.0 | Hugging Face, ecosistema estándar |
| Destilación clásica de logits | Depende del estudiante | Depende | KD supervisada | Depende | Depende |

La comparación directa con métodos de destilación no está soportada por datos de benchmark en la información disponible.

## Limitaciones y advertencias

- El repositorio no incluye puntuaciones de benchmark; el autor declara que no se hace ninguna afirmación sobre rendimiento imparcial en held-out.
- No es cargable con `AutoModel.from_pretrained` ni con PEFT; requiere el cargador específico del proyecto PLatour.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export no es estado reanudable de optimizador/RNG, por lo que no sirve para continuar el entrenamiento tal cual.
- Los backbones upstream (Qwen3-235B-A22B-FP8 y Qwen3-1.7B) conservan sus propias licencias y avisos, que deben respetarse además de la Apache-2.0 del export.
- El autor exige evaluación independiente y revisión de procedencia antes de usar estos artefactos para respaldar nuevas afirmaciones comparativas.
- Riesgo de alucinación, sesgos e idiomas soportados: no disponibles en la información proporcionada.
- La evaluación de programación requiere además un juez oficial aislado, según la model card.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
