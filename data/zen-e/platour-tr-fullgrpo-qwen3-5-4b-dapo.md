# zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DAPO

## Resumen

PLatour-TR-FullGRPO-Qwen3.5-4B-DAPO es un checkpoint de investigación publicado por el usuario zen-E dentro del proyecto PLatour, que explora la transferencia entre modelos (PACT, Prefill-to-Autoregressive Cross-model Transfer). En este paradigma, un modelo "emisor" de mayor tamaño codifica el prompt y entrega representaciones ocultas, mientras que un modelo "receptor" más pequeño genera la respuesta de forma independiente; el método entrena puentes lineales ligeros entre backbones congelados mediante recompensas de tarea.

Este artefacto concreto es el receptor de texto completo, derivado de Qwen/Qwen3.5-4B (arquitectura `qwen3_5_text`), con 4.841.450.496 parámetros reales en safetensors y un repositorio de 9,7 GB. El autor lo describe explícitamente como un artefacto de inferencia histórico sin puntuaciones de benchmark: el empaquetado no establece un protocolo de selección de checkpoint ni una evaluación imparcial.

Su relevancia es metodológica más que de producto: sirve para reproducir los experimentos del paper arXiv:2611.06976 y para estudiar si las mejoras observadas dependen de información útil del emisor o de la mera adaptación del receptor. El paper introduce PACT-Check con controles de Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver. No está pensado como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (familia Qwen3.5; clase `qwen3_5_text`) |
| Parámetros totales | 4.841.450.496 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos publicados en BF16, según la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estándar de Transformers) |

## Arquitectura y entrenamiento

El modelo es un receptor de texto completo en formato estándar de Transformers, con configuración y tokenizer propios; no incluye codificador de visión. Sus embeddings de entrada y su cabeza de salida se exportan de forma independiente, preservando los tensores BF16 originales. La arquitectura subyacente corresponde a Qwen3.5-4B, que el paper describe como soportada por el método PACT gracias a su atención híbrida.

El entrenamiento se enmarca en PACT: se congelan los backbones (emisor y receptor) y se entrenan puentes lineales ligeros inicializados a cero entre ambos, optimizados con recompensas de tarea. El sufijo del nombre indica GRPO completo con datos DAPO (dataset `zen-E/PLatour-DAPO-Data`). El autor advierte que este paquete es un artefacto de inferencia histórico y que no establece por sí mismo un protocolo de selección de checkpoint ni una evaluación imparcial; se requiere evaluación independiente y un reporte preciso de procedencia antes de formular nuevas afirmaciones comparativas.

## Capacidades

- Generación de texto conversacional mediante plantilla de chat (`apply_chat_template`).
- Razonamiento y matemáticas: el protocolo de evaluación por defecto cubre AIME, HMMT e IMO con un tope de respuesta de 32K tokens.
- Generación de código: la model card indica que generar código no requiere juez de código, aunque ejecutar tests de benchmark sí.
- Evaluación de respuestas largas: soporta hasta 32K tokens de respuesta en el protocolo publicado (reducible a 16K con `--response-cap 16384`, registrado como cambio de protocolo).
- Inferencia estándar con Transformers (`AutoModelForCausalLM`, `dtype="auto"`, `device_map="auto"`).
- Integración en el pipeline de evaluación del proyecto (`platour-exps evaluate`, `platour-exps download`).
- Soporte de ejecución multi-GPU mediante réplicas independientes con reparto de preguntas.
- No incluye visión, audio ni codificador multimodal.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada (existe una guía Agent/API en el repositorio, pero no se detallan capacidades).

## Casos de uso

- Reproducción de experimentos PACT: ejecutar `platour-exps evaluate --experiment 23` con este checkpoint y el receptor Qwen/Qwen3.5-4B permite replicar el protocolo publicado sobre AIME, HMMT e IMO, verificando hashes de configuración y pesos.
- Investigación sobre transferencia entre modelos: usar el checkpoint como receptor entrenado y compararlo contra los controles de PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication) para determinar si la mejora proviene de información útil del emisor o de la adaptación del receptor.
- Auditoría de procedencia de checkpoints: el comando `platour-exps download --experiment 23` descarga y verifica el checkpoint sin cargar modelos, útil en pipelines de validación de artefactos de investigación.
- Evaluación a gran escala con réplicas: con `--n-gpu 8` se lanzan 8 réplicas independientes, cada una en una GPU, con shards disjuntos de preguntas, adecuado para barridos de evaluación sobre conjuntos de matemáticas competitivas.
- Estudio de respuestas de razonamiento largo: el tope de 32K tokens permite analizar cadenas de razonamiento extensas en problemas de competición, comparando el efecto de recortar el límite a 16K.
- Docencia y formación en IA: el ejemplo mínimo con `generate()` sirve para ilustrar carga de modelos, plantillas de chat y decodificación determinista (`do_sample=False`) sin infraestructura adicional.
- Base para experimentos de destilación emisor-receptor: al mantener embeddings y cabeza de salida independientes en BF16, el checkpoint se puede emparejar con distintos emisores en configuraciones futuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que son artefactos de inferencia históricos sin puntuaciones de benchmark y que el empaquetado no constituye una evaluación imparcial.

## Requisitos de hardware

- VRAM estimada: con 4.841.450.496 parámetros en BF16, los pesos ocupan aproximadamente 9,7 GB; la inferencia requiere margen adicional para caché KV y activaciones, por lo que se recomienda al menos 16-24 GB de VRAM en BF16. Las cifras para cuantizaciones no están disponibles en la información proporcionada.
- GPU recomendadas: el evaluador del proyecto asigna por defecto 1 GPU por réplica; con `--n-gpu 8` se usan 8 GPUs, una por réplica. No se especifican modelos concretos de GPU (A100, H100, RTX 4090) en la información disponible.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo en la información proporcionada; por tamaño en BF16, encajaría en tarjetas con 24 GB, pero no hay validación publicada.
- Despliegue: la ruta documentada es Transformers con PEFT en un entorno Linux con CUDA y Python 3.11, instalado mediante `scripts/install_environment.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Evaluación multi-GPU: `--n-gpu N --gpus-per-replica G` divide N GPUs en N/G réplicas; N debe ser divisible por G. No se debe combinar `--n-gpu` con `torchrun`. La selección de GPUs se hace con `CUDA_VISIBLE_DEVICES`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-TR-FullGRPO-Qwen3.5-4B-DAPO | 4.841.450.496 | no disponible | no publicados (artefacto de investigación) | Apache 2.0 | Hugging Face (782 descargas) |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |
| Alternativas de ~4B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación sin benchmarks: el autor advierte que no hay puntuaciones publicadas y que el empaquetado no establece un protocolo de selección ni una evaluación imparcial.
- Sin protocolo de evaluación independiente: cualquier afirmación comparativa requiere evaluación externa y reporte preciso de procedencia.
- Sin codificador de visión: no admite entradas de imagen.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe más allá del comportamiento heredado del modelo base.
- Longitud de contexto no documentada: el tope de 32K se refiere a tokens de respuesta en el protocolo de evaluación, no a la ventana de contexto del modelo.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el autor no valida el uso en producción de este checkpoint.
- Configuración de evaluación frágil: cambiar `--response-cap` modifica el protocolo publicado; las ejecuciones parciales reportan `three_suite_macro: null`.
- Requiere el entorno del proyecto (Linux, CUDA, Python 3.11) y un checkout editable para que los manifiestos y ficheros de tarea estén disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DAPO
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de instalación: https://github.com/zhenyi4/platour#getting-started
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU para evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
