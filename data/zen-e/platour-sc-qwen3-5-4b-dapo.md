# zen-E/PLatour-SC-Qwen3.5-4B-DAPO

## Resumen

PLatour-SC-Qwen3.5-4B-DAPO es un artefacto de investigación publicado por zen-E que materializa el experimento 21 ("Self-Communication on dapo") del proyecto PLatour, descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo de lenguaje entrenado de forma convencional, sino un conjunto de pesos de inferencia históricos que incluye las proyecciones lineales ("bridges") entrenadas para conectar un modelo emisor grande con un receptor más pequeño (Qwen3.5-4B) en el marco PACT (Prefill-to-Autoregressive Cross-model Transfer).

El repositorio ocupa 0,8 GB y se distribuye en formato safetensors con un cargador propio (`custom-loader`), no siendo compatible con `AutoModel.from_pretrained` ni con PEFT. El autor advierte explícitamente que no se adjuntan resultados de benchmarks y que el protocolo de selección de checkpoints y el rendimiento held-out no están verificados de forma independiente, por lo que el artefacto debe tratarse como material de reproducibilidad, no como un modelo listo para producción.

Su relevancia es metodológica: permite reproducir y auditar los controles de PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver), que examinan si las mejoras observadas provienen realmente de la información transferida por el emisor o de la mera adaptación del receptor. La licencia es Apache-2.0, aunque los modelos backbone referenciados conservan sus propias licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (backbone Qwen3.5-4B) más puentes lineales de proyección entrenados (PACT) |
| Parametros totales | no disponible (repo de 0,8 GB; backbone base de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus licencias) |
| Formato de pesos | safetensors con cargador propio (`custom-loader`) |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre backbones congelados, partiendo de proyecciones inicializadas a cero, y utiliza recompensas de tarea como señal de entrenamiento. El emisor (un modelo mayor) codifica el prompt y suministra representaciones ocultas; el receptor (Qwen3.5-4B) genera la respuesta de forma independiente. El diseño soporta modelos con atención híbrida. Este repositorio concreto corresponde al experimento 21, "Self-Communication on dapo", sobre el dataset zen-E/PLatour-DAPO-Data.

El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO más allá de la referencia a recompensas de tarea. Tampoco se especifican innovaciones de decodificación (decodificación especulativa, atención lineal) en la información disponible. El paper introduce además PACT-Check, un conjunto de controles experimentales diseñado para distinguir la comunicación efectiva entre modelos de la simple adaptación del receptor.

## Capacidades

- No se documentan capacidades funcionales propias del artefacto; hereda las del backbone Qwen3.5-4B, pero el autor no las enumera.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Uso previsto: reproducción de experimentos PACT y auditoría de controles PACT-Check.

## Casos de uso

- Reproducción del experimento 21: descargar el artefacto con `platour-exps download --experiment 21` y ejecutar el comando de evaluación correspondiente en la documentación del proyecto, usando los backbones descargados por separado y las entradas de tarea firmadas.
- Auditoría de controles PACT-Check: ejecutar Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para verificar si las mejoras dependen de información útil del emisor o de la adaptación del receptor.
- Investigación sobre transferencia entre modelos: analizar las proyecciones lineales entrenadas con recompensas de tarea sobre backbones congelados y atención híbrida.
- Verificación de integridad de pesos: comprobar los hashes SHA-256 declarados en `config.json` frente al payload exportado.
- Revisión de procedencia: contrastar las revisiones exactas de los backbones usadas en la ejecución histórica, que el autor indica que no han sido verificadas de forma independiente.
- Evaluación de programación: emplear el juez oficial aislado requerido por el proyecto para tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se emite ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre el rendimiento held-out no sesgado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 0,8 GB, pero requiere descargar por separado los backbones emisor y receptor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: cargador propio del proyecto PLatour (`platour-exps`); no es compatible con `AutoModel.from_pretrained` ni con PEFT. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SC-Qwen3.5-4B-DAPO | no disponible (repo 0,8 GB) | no disponible | sin benchmarks publicados | Apache-2.0 | Hugging Face (zen-E) |
| Qwen3.5-4B (backbone receptor) | 4B | no disponible | no disponible en la información | según upstream | Hugging Face (Qwen) |
| Qwen3-4B (referencia de fine-tuning) | 4B | no disponible | no disponible en la información | según upstream | Hugging Face (Qwen) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se adjuntan resultados de benchmarks; el autor desaconseja usar el artefacto para respaldar nuevas afirmaciones comparativas sin evaluación independiente.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export es de inferencia: no es estado de reanudación de optimizador/RNG.
- No es cargable mediante `AutoModel.from_pretrained` ni PEFT; requiere el cargador del proyecto.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto o idioma.
- La licencia Apache-2.0 aplica al export del proyecto; los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- La evaluación de programación exige el juez oficial aislado del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SC-Qwen3.5-4B-DAPO
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Paper (HTML arXiv): https://arxiv.org/html/2611.06976
- Paper (abs arXiv): https://arxiv.org/abs/2611.06976
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Tutorial de fine-tuning de Qwen3-4B en Azure Databricks: https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
