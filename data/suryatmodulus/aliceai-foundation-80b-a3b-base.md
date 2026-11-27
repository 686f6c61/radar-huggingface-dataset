# suryatmodulus/AliceAI-Foundation-80B-A3B-Base

## Resumen

AliceAI-Foundation-80B-A3B-Base es un modelo de lenguaje autorregresivo de tipo Mixture-of-Experts (MoE) con arquitectura híbrida, publicado en Hugging Face por el usuario suryatmodulus bajo licencia Apache 2.0. El modelo cuenta con 81.286.433.408 parámetros totales (aproximadamente 81,3 mil millones) de los cuales se activan 3 mil millones por token, y soporta una longitud de contexto de hasta 262.144 tokens. Según la model card, fue entrenado completamente desde cero, incluyendo la reconstrucción del corpus de entrenamiento y la selección de arquitectura e hiperparámetros.

El modelo está orientado a generación de texto, razonamiento, matemáticas, programación e interacción con herramientas, con un rendimiento destacado declarado en tareas de conocimiento factual en ruso. La model card menciona que se publican los benchmarks WikiWebFacts y HardMultiQA, orientados al contexto en ruso, junto con sus protocolos de evaluación. Los idiomas declarados son ruso (ru) e inglés (en).

La relevancia de este modelo radica en su relación entre parámetros totales y activos (80B-A3B), que lo sitúa en la categoría de modelos MoE de gran tamaño con activación reducida, y en su ventana de contexto de 262.144 tokens. No obstante, el repositorio presenta cero descargas y cero likes en el momento de la consulta, y la información pública disponible es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo híbrido con capas KDA (atención lineal con convolución) y Gated Attention, con MoE en cada bloque; esquema 12 × (3 × (KDA → MoE) → 1 × (Gated Attention → MoE)) |
| Parametros totales | 81.286.433.408 (aproximadamente 81,3B) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 162,6 GB); requiere `custom_code` |

Otros datos técnicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Dimensión oculta | 2048 |
| Tamaño del vocabulario | 129.024 |
| Número de capas | 48 |
| KDA: cabezas query / KV | 32 / 32 |
| KDA: dimensión cabeza query / KV | 128 / 128 |
| KDA: tamaño del kernel de convolución | 4 |
| Gated Attention: cabezas query / KV | 16 / 2 |
| Gated Attention: dimensión cabeza query | 256 |
| MoE: número de expertos | 512 |
| MoE: Top-K | 10 + 1 experto compartido |
| MoE: dimensión intermedia por experto | 512 |
| MTP (Multi-Token Prediction) | 1 capa |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo híbrido que combina capas KDA (atención lineal con convolución, con 32 cabezas query y 32 cabezas KV de dimensión 128 y kernel de convolución de tamaño 4) y capas de Gated Attention (16 cabezas query y 2 cabezas KV, con dimensión de cabeza query de 256). El esquema de capas es 12 × (3 × (KDA → MoE) → 1 × (Gated Attention → MoE)), lo que da un total de 48 capas. Cada bloque incorpora una capa MoE con 512 expertos, selección Top-K de 10 expertos más 1 experto compartido, y dimensión intermedia por experto de 512. La dimensión oculta es 2048 y el vocabulario tiene 129.024 tokens. Incluye una capa MTP (Multi-Token Prediction), lo que puede habilitar decodificación especulativa o predicción multi-token.

Según la model card, el modelo fue entrenado completamente desde cero, con un corpus de entrenamiento reconstruido, arquitectura e hiperparámetros seleccionados específicamente, y datos preparados para razonamiento complejo e interacción con herramientas. Se menciona que las decisiones clave se validaron mediante una serie de entrenamientos desde cero de 2 billones de tokens cada uno. No se especifica el número total de tokens de entrenamiento del modelo final, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; el modelo se presenta como una versión "Base" en etapa de preentrenamiento. Tampoco se detalla si se empleó decodificación especulativa en producción más allá de la capa MTP.

## Capacidades

- Generación de texto autorregresiva en ruso e inglés.
- Razonamiento en matemáticas, programación y otras tareas de razonamiento, con rendimiento declarado comparable a modelos de mayor tamaño.
- Conocimiento factual en ruso, con benchmarks específicos publicados (WikiWebFacts, HardMultiQA).
- Interacción con herramientas (tool calling / function calling), según la model card, que menciona datos preparados para interacción con instrumentos.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidad de predicción multi-token (MTP) mediante una capa dedicada.
- Al ser una versión Base (preentrenamiento), no se declaran capacidades de modo "thinking", visión, audio ni agentes multi-paso afinados; estas no están confirmadas en la información disponible.

## Casos de uso

- Procesamiento de documentos largos en ruso: gracias a su contexto de 262.144 tokens, el modelo puede ingerir informes, expedientes o contratos completos y responder preguntas sobre ellos sin truncamiento, lo que resulta adecuado para tareas de extracción y resumen en entornos jurídicos o administrativos.
- Generación y asistencia de código: el modelo declara capacidades en programación y puede integrarse en editores o pipelines de CI/CD para sugerencias de código, generación de pruebas o revisión automatizada, aunque al ser una versión Base requeriría ajuste fino para producción.
- Razonamiento matemático y resolución de problemas: útil en herramientas educativas o de análisis que requieran pasos intermedios de cálculo, dado el énfasis declarado en tareas de razonamiento.
- Preguntas y respuestas sobre conocimiento factual en ruso: con benchmarks específicos como WikiWebFacts y HardMultiQA, es adecuado para sistemas de consulta sobre hechos, enciclopedias o bases de conocimiento en ruso.
- Interacción con herramientas y APIs: la model card menciona datos preparados para tool calling, lo que permitiría construir asistentes que consulten servicios externos, aunque la versión Base no garantiza un comportamiento afinado para ello.
- Investigación y experimentación con arquitecturas híbridas MoE: el modelo sirve como base para estudiar el rendimiento de capas KDA combinadas con Gated Attention y MoE de 512 expertos, así como para evaluar la capa MTP en decodificación especulativa.
- Fine-tuning para dominios específicos: al estar bajo licencia Apache 2.0 y en etapa Base, puede ajustarse para tareas concretas (atención al cliente, clasificación, generación de informes) en ruso o inglés.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks medida con vLLM a temperatura 0. Los resultados disponibles en la información proporcionada son los siguientes:

| Benchmark | AliceAI-80B-A3B-Base | Qwen3.5-35B-A3B-Base | GLM-4.5-Air-Base (106B-A12B) | Nemotron-3-Super-120B-A12B-Base | DeepSeek-V4-Flash-Base (284B-A13B) |
|---|---|---|---|---|---|
| WikiWebFacts (5-shot, ruso) | 86,5 | 62,4 | 70,2 | 72,8 | 83,2 |
| HardMultiQA (5-shot, ruso) | 67,9 | 47,2 | 48,6 | 54,5 | 65,4 |
| CultCat | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar. Los datos de la tabla anterior corresponden únicamente a los benchmarks factuales en ruso citados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 81,3B parámetros totales, en precisión BF16/FP16 se requieren aproximadamente 162 GB de VRAM solo para los pesos, lo que exige múltiples GPU. En cuantización de 8 bits, aproximadamente 81 GB; en 4 bits, aproximadamente 41 GB. Estas estimaciones son orientativas y no están confirmadas en la información disponible.
- GPU recomendadas: para BF16 se necesitan configuraciones multi-GPU como 2× H100 80GB o 4× A100 80GB; para cuantización de 4 bits podría ser viable en una sola GPU de 48 GB (A6000, L40S) o en configuraciones de 2× RTX 4090 de 24 GB.
- ¿Cabe en GPU de consumo? En cuantización de 4 bits podría ajustarse en una RTX 4090 de 24 GB solo si se aplican técnicas agresivas de offloading, dado que los pesos en 4 bits rondan los 41 GB; no es un escenario directo.
- Opciones de despliegue: la model card menciona vLLM y la etiqueta `vllm`; también es compatible con `transformers` mediante `custom_code`. No se confirma soporte para llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad | Rendimiento declarado (WikiWebFacts / HardMultiQA) |
|---|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B-Base | 81,3B / 3B | 262.144 | Apache 2.0 | Hugging Face (0 descargas) | 86,5 / 67,9 |
| Qwen3.5-35B-A3B-Base | 35B / 3B | no disponible | no disponible | no disponible | 62,4 / 47,2 |
| GLM-4.5-Air-Base | 106B / 12B | no disponible | no disponible | no disponible | 70,2 / 48,6 |
| Nemotron-3-Super-120B-A12B-Base | 120B / 12B | no disponible | no disponible | no disponible | 72,8 / 54,5 |
| DeepSeek-V4-Flash-Base | 284B / 13B | no disponible | no disponible | no disponible | 83,2 / 65,4 |

Los datos de comparación provienen exclusivamente de la tabla de benchmarks de la model card; no se dispone de información adicional sobre contexto, licencia o disponibilidad de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Al ser una versión Base (preentrenamiento), no está afinada para instrucciones, diálogo ni seguridad; su uso directo en producción requiere ajuste fino o técnicas de alineación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de veracidad más allá de los benchmarks factuales citados.
- Idiomas limitados a ruso e inglés según la model card; el rendimiento en otros idiomas no está documentado.
- Sesgos conocidos: no se documentan en la información disponible; el corpus de entrenamiento y su composición no se detallan.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la model card no incluye cláusulas adicionales de uso aceptable ni evaluaciones de seguridad.
- El repositorio presenta 0 descargas y 0 likes, y el tamaño del repo es de 162,6 GB; la adopción y validación por la comunidad son inexistentes en el momento de la consulta.
- Requiere `custom_code` y `trust_remote_code` en transformers, lo que implica ejecutar código del autor; conviene revisar dicho código antes de usarlo en producción.
- No se dispone de información sobre cuantizaciones publicadas, latencia, throughput ni soporte en frameworks distintos de vLLM/transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suryatmodulus/AliceAI-Foundation-80B-A3B-Base
- Artículo en Habr citado en la model card: https://habr.com/ru/companies/yandex/articles/1083300/
- Dataset WikiWebFacts: https://huggingface.co/datasets/yandex/WikiWebFacts
- Dataset HardMultiQA: https://huggingface.co/datasets/yandex/HardMultiQA
