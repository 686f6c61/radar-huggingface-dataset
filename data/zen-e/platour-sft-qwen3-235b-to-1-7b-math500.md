# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MATH500

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-MATH500 es un artefacto de investigación publicado por zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). La idea central es que un modelo grande "emisor" (Qwen3-235B-A22B-FP8) codifica el prompt y entrega sus representaciones ocultas, mientras que un modelo pequeño "receptor" (Qwen3-1.7B) genera la respuesta de forma independiente. El repositorio contiene únicamente las proyecciones lineales puente entrenadas entre ambos backbones congelados, no un modelo completo.

El entrenamiento se realiza mediante recompensas de tarea sobre proyecciones inicializadas a cero, y el paper introduce además PACT-Check con controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar si las mejoras provienen realmente de información útil del emisor o de la mera adaptación del receptor. Esta es una contribución metodológica relevante porque cuestiona evaluaciones ingenuas de transferencia entre modelos.

Este repositorio concreto corresponde al experimento 06 (SFT sobre MATH500) y se distribuye como pesos de inferencia históricos sin puntuaciones de benchmark asociadas. El tamaño del repo es de 0,9 GB y requiere un loader específico del proyecto (`platour-exps`), no siendo cargable mediante `AutoModel.from_pretrained` ni PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con puentes lineales entre backbone emisor y receptor (PACT); soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo contiene solo proyecciones puente; los backbones se descargan aparte) |
| Parametros activos | No aplica (el emisor Qwen3-235B-A22B es MoE, pero este repo no incluye sus pesos) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3, no especificada en la información) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el emisor referenciado es FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors con `config.json` propio y SHA-256; requiere loader `platour-exps` |

## Arquitectura y entrenamiento

PACT es un esquema de transferencia cross-model en el que un emisor grande (Qwen3-235B-A22B-FP8) procesa el prompt y expone sus representaciones ocultas, y un receptor pequeño (Qwen3-1.7B) genera la respuesta de forma completamente independiente. El mecanismo entrenable son puentes lineales ligeros entre backbones congelados, inicializados a cero y optimizados mediante recompensas de tarea. El método está diseñado para soportar modelos con atención híbrida.

El experimento 06 aplica SFT sobre la tarea MATH500. El paper introduce PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para determinar si la mejora observada se debe a información útil transmitida por el emisor o simplemente a la adaptación del receptor. El repositorio no incluye datos sobre número de tokens de entrenamiento, composición del dataset más allá de la referencia a `zen-E/PLatour-Qwen3-Data`, ni detalles de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento matemático en el dominio MATH500, mediada por las representaciones del emisor Qwen3-235B.
- Transferencia de representaciones ocultas desde un modelo grande a uno pequeño mediante proyecciones lineales entrenadas.
- Soporte de modelos con atención híbrida en el diseño del puente.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en este repositorio.
- Capacidades multilingües: no disponibles en la información.

## Casos de uso

- Investigación en transferencia cross-model: permite reproducir el experimento 06 del paper PACT para estudiar si las representaciones de un emisor de 235B mejoran a un receptor de 1.7B en tareas matemáticas.
- Validación metodológica con PACT-Check: usar los controles Dummy Transfer e Irrelevant Transfer para descartar que las mejoras se deban solo a la adaptación del receptor.
- Estudio de eficiencia computacional: comparar el coste de inferencia de un receptor de 1.7B asistido por representaciones de un emisor de 235B frente a ejecutar el modelo grande de extremo a extremo.
- Reproducibilidad de resultados: el repo incluye hashes SHA-256 y mapping de tensores, lo que facilita auditorías de exportaciones de inferencia.
- Análisis de atención híbrida: el soporte explícito de modelos híbridos permite estudiar cómo afecta esta arquitectura a la calidad de la transferencia.
- Base para nuevos experimentos SFT: las proyecciones puente pueden servir como punto de partida para entrenar variantes sobre otras tareas del dataset `zen-E/PLatour-Qwen3-Data`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out.

## Requisitos de hardware

- VRAM para el repo en sí: el tamaño es de 0,9 GB, por lo que las proyecciones puente caben en cualquier GPU consumer.
- VRAM total para inferencia: depende de los backbones, que se descargan por separado. El emisor Qwen3-235B-A22B-FP8 requiere hardware de clase servidor (múltiples A100/H100 o equivalentes con suficiente memoria para FP8); el receptor Qwen3-1.7B cabe en GPUs consumer (por ejemplo, RTX 3060/4060 en adelante).
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa; requiere el loader `platour-exps` del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-MATH500 | Solo puentes (backbones aparte) | No disponible | Sin benchmarks publicados | Apache-2.0 | Hugging Face (loader específico) |
| Qwen3-1.7B (receptor) | 1,7B | No disponible en la información | No disponible en la información | No disponible en la información | Hugging Face |
| Qwen3-235B-A22B (emisor) | 235B totales / 22B activos (MoE) | No disponible en la información | Resultados competitivos en código, matemáticas y capacidades generales según el blog de Zen | No disponible en la información | Hugging Face |

No se dispone de datos de benchmark del artefacto PLatour que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autónomo: solo las proyecciones puente; los backbones deben descargarse por separado y con revisiones concretas que no han sido verificadas de forma independiente.
- No es cargable con `AutoModel.from_pretrained` ni con PEFT; requiere el loader `platour-exps` y el `config.json` del repo.
- No se adjuntan resultados de benchmark ni protocolo de selección de checkpoint; cualquier afirmación de rendimiento requiere evaluación independiente.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no están verificadas y no deben inferirse de la última revisión del Hub.
- El export es de pesos de inferencia, no estado de reanudación de optimizador/RNG.
- Riesgo de sesgos y alucinaciones: no documentado en la información disponible, pero aplicable a los backbones Qwen3 subyacentes.
- Restricciones de licencia: el export es Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- Los controles PACT-Check son necesarios antes de extraer conclusiones: una mejora en la tarea no demuestra por sí sola comunicación cross-model efectiva.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MATH500
- Paper: https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Blog Qwen3 de Zen: https://zenlm.org/blog/qwen3/
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
