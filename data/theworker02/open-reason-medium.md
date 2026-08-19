# theworker02/open-reason-medium

## Resumen

Open Reason medium es un modelo de lenguaje causal de tipo GPT-2, entrenado desde cero por el usuario `theworker02` sobre el dataset propio `theworker02/open-reason` (pipeline v1.4.0). Con 13.867.008 parámetros, se sitúa como una versión intermedia entre el modelo pequeño (~1,3M) y el de 1B del mismo autor. Está diseñado para ejecutarse en CPU, ya que fue entrenado exclusivamente en host CPU sin soporte CUDA, lo que lo hace accesible para entornos de desarrollo sin GPU.

El modelo resuelve el problema de ofrecer una alternativa ligera y reproducible de razonamiento causal con licencia Apache-2.0, entrenada sobre un dataset propio de razonamiento. Su relevancia actual reside en su carácter didáctico y experimental: permite explorar el comportamiento de arquitecturas GPT-2 pequeñas entrenadas en conjuntos de datos de razonamiento, sin los requisitos de hardware de modelos de mayor escala. La arquitectura es un transformer causal de 6 capas, 384 dimensiones de embedding y 6 cabezas de atención, con un vocabulario de 8192 tokens y una ventana de contexto de 192 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 scratch (transformer causal), `n_layer=6`, `n_embd=384`, `n_head=6` |
| Parametros totales | 13.867.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16) |
| Idiomas soportados | inglés (según la model card, `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 original, con 6 capas, dimensión de embedding de 384, 6 cabezas de atención y un vocabulario de 8192 tokens. Se entrenó desde cero (sin partir de pesos preentrenados) sobre el dataset `theworker02/open-reason` v1.4.0, que contiene 3175 filas de instrucciones de razonamiento (split `all`). El entrenamiento se realizó en CPU con `torch` 2.12.0+cpu, con batch size de 2 y 180 pasos, alcanzando una pérdida final de 4.416. No se emplearon técnicas de RLHF ni DPO según la información disponible; se trata de un entrenamiento supervisado (SFT) estándar.

## Capacidades

- Generación de texto causal en inglés, con capacidad de completar secuencias de razonamiento.
- Razonamiento de nivel básico, limitado por el tamaño del modelo y el contexto de 192 tokens.
- Capacidades de tool calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés (según la model card).
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentación educativa: el modelo es adecuado para estudiar el entrenamiento de transformers causales en CPU, por su pequeño tamaño y bajo coste computacional.
- Prototipado rápido de pipelines de generación de texto: al ser ligero, se puede integrar en entornos de desarrollo sin GPU para validar flujos de trabajo con Hugging Face Transformers.
- Generación de respuestas a partir del dataset open-reason: puede usarse para generar ejemplos sintéticos de razonamiento en inglés, aunque con calidad limitada.
- Investigación en modelos pequeños: sirve como baseline para comparar arquitecturas de menor escala en tareas de razonamiento.
- Pruebas de inferencia en CPU: útil para medir latencia y throughput en hardware sin aceleración GPU.
- Aprendizaje de ajuste fino: su licencia Apache-2.0 permite modificarlo y redistribuirlo, ideal para proyectos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (4.416), pero no evalúa el modelo en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo ocupa aproximadamente 55 MB en fp32 (13,8M × 4 bytes), por lo que cabe en cualquier sistema con más de 256 MB de RAM.
- GPU recomendadas: no es necesario; diseñado para CPU.
- Compatibilidad con consumer GPU: sí, cabría incluso en una GPU integrada de 2 GB, pero no aporta ventaja frente a CPU.
- Opciones de despliegue: compatible con Hugging Face Transformers (`AutoModelForCausalLM`), también puede exportarse a GGUF mediante llama.cpp para ejecución en CPU.
- Latencia y throughput: no disponible; al ser un modelo de 13,8M de parámetros, la inferencia en CPU será rápida (del orden de milisegundos por token), pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Entrenamiento |
|---|---|---|---|---|
| theworker02/open-reason-medium | 13,9M | 192 | Apache-2.0 | CPU, SFT sobre open-reason |
| theworker02/open-reason-small | ~1,3M | no disponible | Apache-2.0 | CPU, SFT sobre open-reason |
| theworker02/open-reason-1b | 1B | no disponible | no disponible | no disponible |

No se dispone de información de benchmarks para comparar rendimiento. La comparación se limita a las variantes del mismo autor, ya que no se encontraron modelos equivalentes con licencia y arquitectura similares.

## Limitaciones y advertencias

- Modelo muy pequeño (13,8M de parámetros) con capacidad de razonamiento limitada; no es adecuado para tareas complejas o de producción.
- Contexto de solo 192 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Entrenado únicamente en inglés; no soporta otros idiomas.
- Solo se entrenó con 3175 filas de datos y 180 pasos, lo que limita la generalización.
- Riesgo de alucinación y errores gramaticales: al ser un modelo pequeño, la coherencia puede ser baja.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño, los sesgos derivan del dataset de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no está preparado para producción por su baja calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theworker02/open-reason-medium
- Dataset: https://huggingface.co/datasets/theworker02/open-reason
- Modelo pequeño: https://huggingface.co/theworker02/open-reason-small
- Código: https://github.com/theworker02/open-reason
