# zen-E/PLatour-Qwen3-235B-to-1.7B-MATH500

## Resumen

PLatour-Qwen3-235B-to-1.7B-MATH500 es un artefacto de investigación publicado por zen-E que materializa el experimento 15 del trabajo "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (PACT). No es un modelo entrenado de forma convencional, sino un conjunto de puentes lineales (bridges) que conectan dos backbones congelados: un emisor grande, Qwen3-235B-A22B-FP8, que codifica el prompt y aporta representaciones ocultas, y un receptor pequeño, Qwen3-1.7B, que genera la respuesta de forma independiente. El repositorio distribuye únicamente las proyecciones del puente, no los pesos de los modelos base, que deben descargarse por separado.

La relevancia del artefacto es metodológica: PACT investiga si la información de un modelo grande puede transferirse a uno pequeño sin reentrenar los backbones, entrenando solo proyecciones lineales inicializadas a cero y optimizadas con recompensas de tarea. El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor.

El checkpoint corresponde a la tarea MATH500 y se distribuye como export de inferencia histórico, sin puntuaciones de benchmark adjuntas. El autor advierte explícitamente que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento imparcial en held-out, y que se requiere evaluación independiente antes de usar estos artefactos para sostener nuevas afirmaciones comparativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridges) entre dos backbones transformer congelados; soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo de 0,9 GB contiene solo las proyecciones del puente y metadatos, no los backbones) |
| Parametros activos | No aplica (el emisor Qwen3-235B-A22B es MoE, pero este repo no redistribuye sus pesos) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el emisor referenciado es FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors con cargador personalizado (`custom-loader`); no compatible con `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

El método PACT separa el cómputo en dos fases: un emisor grande procesa el prompt en modo prefill y produce representaciones ocultas; un receptor pequeño las consume a través de puentes lineales ligeros y genera la respuesta de forma autorregresiva e independiente. Los backbones permanecen congelados y solo se entrenan las proyecciones, inicializadas a cero y optimizadas mediante recompensas de tarea. El diseño soporta modelos con atención híbrida, lo que permite emparejar arquitecturas heterogéneas entre emisor y receptor.

El repositorio no documenta el volumen de datos de entrenamiento, la composición del dataset `zen-E/PLatour-Qwen3-Data` ni si hubo RLHF o DPO; únicamente indica que el entrenamiento se guía por recompensas de tarea. El paper asociado introduce PACT-Check con cuatro controles experimentales para descartar que las mejoras se deban a la adaptación del receptor en lugar de a la comunicación efectiva entre modelos. No se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por las representaciones del emisor Qwen3-235B-A22B.
- Razonamiento matemático orientado a la tarea MATH500, según la identidad del experimento.
- Transferencia de información entre modelos de distinta escala sin reentrenar los backbones.
- Soporte de modelos con atención híbrida en el emparejamiento emisor-receptor.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking específicas de este artefacto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en transferencia entre modelos: el artefacto permite reproducir el experimento 15 del paper PACT y analizar si la información del emisor mejora al receptor en MATH500.
- Validación de metodología PACT-Check: sirve para ejecutar los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver y comprobar la robustez de las conclusiones.
- Estudio de eficiencia computacional: permite medir el coste de usar un emisor grande solo en prefill frente a ejecutar el modelo grande de forma completa en generación.
- Reproducibilidad de experimentos: el `config.json` incluye identidad del experimento, dependencias, mapeo de tensores, nombre de fichero de pesos y SHA-256, lo que facilita la verificación de integridad.
- Benchmarking controlado de comunicación entre modelos: útil para diseñar evaluaciones independientes con entradas de tarea firmadas y juez oficial aislado en el caso de evaluación de programación.
- Docencia y divulgación: ejemplo práctico de arquitecturas emisor-receptor con puentes lineales para explicar transferencia cross-model.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre rendimiento imparcial en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el puente (0,9 GB de repo); el requisito dominante lo impone el emisor Qwen3-235B-A22B-FP8, que requiere hardware de clase servidor.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del emisor, se necesitan GPUs de数据中心 (A100, H100 o superiores) para ejecutar el pipeline completo.
- Viabilidad en GPU de consumo: no disponible; el receptor Qwen3-1.7B sí cabría en GPUs de consumo, pero el emisor de 235B no.
- Opciones de despliegue: cargador específico del proyecto PLatour (`platour-exps download --experiment 15`); no compatible con `AutoModel.from_pretrained` ni PEFT. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3-235B-to-1.7B-MATH500 | Puentes ligeros sobre backbones Qwen3 (235B emisor, 1,7B receptor) | No disponible | Transferencia cross-model con puentes lineales | Apache-2.0 | Hugging Face (zen-E) |
| Qwen3-1.7B | 1,7B | No disponible en la información | LLM denso estándar | No disponible en la información | Hugging Face (Qwen) |
| Qwen3-235B-A22B-FP8 | 235B totales, 22B activos (MoE) | No disponible en la información | LLM MoE en FP8 | No disponible en la información | Hugging Face (Qwen) |
| PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux | Puentes ligeros sobre los mismos backbones | No disponible | Variante SFT sobre MMLU-Redux | Apache-2.0 | Hugging Face (zen-E) |

## Limitaciones y advertencias

- El repositorio no incluye los backbones; es necesario descargar Qwen3-235B-A22B-FP8 y Qwen3-1.7B por separado y respetar sus licencias.
- No es cargable con `AutoModel.from_pretrained` ni PEFT; requiere el cargador específico del proyecto PLatour.
- No se adjuntan resultados de benchmark; cualquier afirmación de rendimiento requiere evaluación independiente.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export no constituye estado de reanudación de optimizador/RNG.
- Riesgo de alucinación y sesgos: no documentados específicamente para este artefacto; heredados de los backbones Qwen3 subyacentes.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Uso comercial: la licencia del export es Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben revisarse antes de cualquier despliegue en producción.
- El artefacto está pensado para investigación comparativa, no como modelo listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-235B-to-1.7B-MATH500
- Paper: https://arxiv.org/html/2611.06976
- arXiv abstract: https://arxiv.org/abs/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Variante SFT MMLU-Redux: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
