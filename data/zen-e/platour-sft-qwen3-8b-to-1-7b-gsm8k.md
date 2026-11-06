# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-GSM8K

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-GSM8K es un artefacto de investigación publicado por zen-E que implementa el método PLatour descrito en el artículo "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo autónomo al uso, sino un conjunto de pesos de puentes lineales (bridges) entrenados para transferir representaciones ocultas desde un modelo emisor grande (Qwen3-8B) hacia un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma independiente. El escenario concreto de esta exportación es el experimento 11, centrado en la tarea GSM8K de razonamiento matemático.

El interés técnico radica en el paradigma PACT (Prefill-to-Autoregressive Cross-model Transfer): el emisor procesa el prompt y cede sus representaciones internas, mientras el receptor produce la salida sin depender del emisor en tiempo de decodificación. Los backbones permanecen congelados y solo se entrenan proyecciones lineales ligeras inicializadas a cero, optimizadas mediante recompensas de tarea. El artículo incorpora además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de una mera adaptación del receptor.

Es relevante ahora porque propone una vía de bajo coste computacional para aprovechar modelos grandes en inferencia con modelos pequeños, y porque su diseño metodológico aborda explícitamente el problema de la atribución causal en la transferencia entre modelos. Conviene subrayar que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y no está pensado para carga directa mediante `AutoModel.from_pretrained` ni PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) sobre backbones transformer congelados; soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo contiene solo los pesos de los puentes; los backbones se descargan por separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream Qwen3 conservan sus propias licencias) |
| Formato de pesos | safetensors con cargador personalizado (`custom-loader`); requiere `config.json` del proyecto PLatour |

## Arquitectura y entrenamiento

La arquitectura se basa en PACT: un emisor grande (Qwen3-8B) codifica el prompt y expone sus representaciones ocultas, que se transforman mediante proyecciones lineales ligeras y se inyectan en un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma autorregresiva e independiente. Ambos backbones permanecen congelados durante el entrenamiento; solo se optimizan los puentes, inicializados a cero, lo que permite un arranque estable y un coste de entrenamiento muy reducido en comparación con el fine-tuning completo. El método admite modelos con atención híbrida.

El entrenamiento de los puentes se guía por recompensas de tarea (task rewards) en lugar de una pérdida supervisada clásica de destilación. La exportación corresponde al experimento 11 sobre GSM8K, usando el dataset `zen-E/PLatour-Qwen3-Data`. El artículo introduce PACT-Check con cuatro controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para discriminar si la mejora se debe a información útil del emisor o a la simple adaptación del receptor. La model card advierte que las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.

## Capacidades

- Transferencia de representaciones entre modelos de distinto tamaño dentro de la familia Qwen3 (8B como emisor, 1.7B como receptor).
- Generación autorregresiva por parte del receptor de forma independiente tras la fase de prefill del emisor.
- Razonamiento matemático orientado a GSM8K como tarea de evaluación del experimento.
- Soporte de modelos con atención híbrida en el diseño del método.
- Entrenamiento mediante recompensas de tarea con puentes inicializados a cero.
- Controles de validación metodológica (PACT-Check) para atribución causal de mejoras.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el experimento 11 con `platour-exps download --experiment 11` para estudiar cómo fluye la información del emisor al receptor en tareas de razonamiento matemático.
- Evaluación de atribución causal: aplicar los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para determinar si una mejora observada se debe a comunicación efectiva o a adaptación del receptor.
- Estudio de eficiencia inferencial: analizar si un receptor de 1.7B asistido por un emisor de 8B en fase de prefill se aproxima al rendimiento del modelo grande con un coste de decodificación mucho menor.
- Reproducibilidad de artefactos: verificar los hashes SHA-256 y el mapeo de tensores declarados en `config.json` como parte de auditorías de exportaciones de inferencia.
- Línea base para nuevos métodos de destilación: comparar puentes lineales entrenados con recompensas frente a destilación clásica o fine-tuning completo del receptor.
- Análisis de arquitecturas de atención híbrida: estudiar la compatibilidad de los puentes con backbones que combinan mecanismos de atención, según lo indicado en el artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones y que no se emite ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre rendimiento no sesgado en conjuntos reservados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de los backbones descargados por separado (Qwen3-8B como emisor y Qwen3-1.7B como receptor) y del propio pipeline PLatour.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el requisito dominante será el del emisor Qwen3-8B, no los puentes ligeros.
- Opciones de despliegue: cargador del proyecto PLatour (`platour-exps`); no es compatible con `AutoModel.from_pretrained` ni con PEFT según la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Carga directa |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-GSM8K | Puentes ligeros + backbones 8B/1.7B | No disponible | Transferencia PACT con puentes lineales | Apache-2.0 | No (cargador propio) |
| Qwen/Qwen3-8B | 8B | No disponible en la información | LLM denso estándar | No disponible en la información | Sí (Transformers) |
| Qwen/Qwen3-1.7B | 1.7B | No disponible en la información | LLM denso estándar | No disponible en la información | Sí (Transformers) |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado los backbones emisor y receptor, además del cargador del proyecto PLatour.
- No es cargable mediante `AutoModel.from_pretrained` ni PEFT; el uso está restringido al cargador propio con el `config.json` del repositorio.
- Ausencia total de puntuaciones de benchmark: la model card desaconseja explícitamente usar estos artefactos para respaldar nuevas afirmaciones comparativas sin evaluación independiente y revisión de procedencia.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no están verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El repositorio no constituye un estado reanudable de optimizador/RNG, solo pesos de inferencia.
- La evaluación de tareas de programación requiere un juez oficial aislado según la documentación del proyecto.
- Riesgo de sesgo y alucinación: no documentado en la información disponible, pero aplicable por herencia de los backbones Qwen3 subyacentes.
- Restricciones de licencia: la exportación es Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- Idiomas soportados no declarados; la tarea de referencia es GSM8K en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-GSM8K
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Artículo (arXiv): https://arxiv.org/abs/2611.06976
- Artículo (HTML): https://arxiv.org/html/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
