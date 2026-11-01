# xciors/asisten-koding-defense

## Resumen

asisten-koding-defense es un modelo de generación de texto entrenado por el usuario xciors a partir de unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit, una versión cuantizada en 4 bits (bitsandbytes) del Qwen2.5-Coder-3B-Instruct de Alibaba. Se trata de un fine-tuning ligero realizado con la librería Unsloth y TRL de Hugging Face, orientado a tareas conversacionales de asistencia en programación, aunque la model card no documenta el dataset de entrenamiento ni los objetivos específicos del ajuste.

El modelo conserva la arquitectura transformer decoder-only de la familia Qwen2, con aproximadamente 3.086 millones de parámetros según los metadatos de safetensors. Su tamaño reducido lo hace apto para ejecutarse en GPUs de consumo y en entornos con recursos limitados, manteniendo las capacidades de generación de código y texto del modelo base.

Su relevancia es principalmente como ejemplo de fine-tuning comunitario de bajo coste sobre modelos coder pequeños: no publica benchmarks propios ni una model card detallada, por lo que su calidad debe evaluarse empíricamente antes de cualquier uso en producción. El nombre sugiere un asistente de codificación ("asisten koding" en indonesio), posiblemente orientado al dominio del idioma indonesio, aunque el único idioma declarado en los metadatos es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | 4 bits (bitsandbytes, heredada del modelo base); pesos publicados aparentemente descuantizados |
| Idiomas soportados | en (declarado); el modelo base soporta más de 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (6,2 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit, que a su vez es la versión cuantizada en 4 bits mediante bitsandbytes del Qwen2.5-Coder-3B-Instruct. La arquitectura subyacente es un transformer decoder-only estándar de la familia Qwen2, con atención agrupada por consultas (GQA) y RoPE, características habituales de esta generación de modelos de Alibaba.

El entrenamiento se realizó con la librería Unsloth, que optimiza el proceso de fine-tuning (el autor indica que fue "2x más rápido") en combinación con la librería TRL (Transformer Reinforcement Learning) de Hugging Face, lo que sugiere el uso de técnicas como SFT, DPO u otro método de la suite TRL. No se ha publicado información sobre el dataset empleado, el número de pasos de entrenamiento, los hiperparámetros ni si hubo una etapa de RLHF o DPO explícita. La model card es mínima y se limita a acreditar el origen del modelo y las herramientas utilizadas.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruct.
- Generación y comprensión de código, capacidad central de la familia Qwen2.5-Coder.
- Razonamiento sobre problemas de programación y matemáticas (en la medida que lo aporta el modelo base de 3B).
- Formato conversacional (chat) compatible con la plantilla de Qwen2.5-Instruct.
- Compatibilidad con la librería transformers de Hugging Face y con endpoints de inferencia.
- No se ha documentado soporte específico de tool calling, agentes, visión o audio; el modelo base Qwen2.5-Coder no incluye capacidades multimodales.

## Casos de uso

- Asistente de programación conversacional: el modelo puede responder preguntas sobre código, explicar fragmentos y sugerir correcciones en diálogos multi-turno, heredando el formato instruct del modelo base.
- Autocompletado y generación de snippets: con ~3B de parámetros, es adecuado para generar funciones y utilidades cortas con baja latencia en hardware modesto.
- Prototipado de asistentes de código autoalojados: su tamaño permite desplegarlo en una GPU de consumo o incluso en CPU para pruebas de concepto sin depender de APIs externas.
- Base para fine-tunings de dominio: al ser un modelo ligero con licencia Apache 2.0, puede servir como punto de partida para ajustes adicionales en dominios específicos (por ejemplo, documentación de código o lenguajes concretos).
- Experimentación con Unsloth y TRL: útil como referencia de un flujo de fine-tuning cuantizado a 4 bits con entrenamiento acelerado.
- Clasificación y transformación de texto técnico: tareas como resumir diffs, generar mensajes de commit o traducir pseudocódigo a un lenguaje concreto, aprovechando la especialización coder del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica. Como referencia indirecta, el modelo base Qwen2.5-Coder-3B-Instruct ha publicado resultados competitivos en tareas de código para su tamaño, pero ningún dato de este fine-tuning específico ha sido verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16 (~6,2 GB en el repositorio), aproximadamente 7-8 GB de VRAM; con cuantización a 4 bits (como el modelo base original), alrededor de 2-3 GB.
- GPUs recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores para fp16; cualquier GPU con 4 GB de VRAM para la versión bnb-4bit. Para serving con batch, RTX 4090 o A100.
- Cabe en GPUs de consumo: sí, tanto en fp16 (RTX 3060/4070 o superior) como en 4 bits (prácticamente cualquier GPU moderna de 4 GB o más).
- Opciones de despliegue: transformers de Hugging Face (nativo), vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión). El tag "endpoints_compatible" indica compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible; por su tamaño de 3B, se espera latencia baja y throughput razonable en GPUs de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xciors/asisten-koding-defense | ~3,09 B | no disponible (base: 32.768) | Fine-tuning conversacional/código | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32.768 | Código | Apache 2.0 (algunos archivos con restricción Qwen) | Hugging Face |
| CodeLlama-7B-Instruct | 7 B | 16.384 | Código | Llama 2 Community License | Hugging Face |
| StarCoder2-3B | 3 B | 16.384 | Código | BigCode OpenRAIL-M | Hugging Face |

Frente a su modelo base, este fine-tuning no aporta mejoras documentadas; frente a alternativas como CodeLlama-7B, ofrece un tamaño menor y una licencia más permisiva, aunque con probablemente menor capacidad bruta.

## Limitaciones y advertencias

- Model card mínima: no documenta dataset de entrenamiento, hiperparámetros ni evaluaciones, por lo que la calidad del fine-tuning es desconocida y no verificable a priori.
- Riesgo de alucinación típico de modelos de 3B: puede generar código plausible pero incorrecto o inseguro; se recomienda siempre revisión humana.
- Idioma declarado únicamente en inglés; el posible enfoque en indonesio sugerido por el nombre no está documentado. El rendimiento en castellano no está garantizado ni evaluado.
- Sesgos heredados del corpus de entrenamiento de Qwen2.5 (principalmente datos web y código públicos), sin auditoría específica publicada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los archivos del modelo base de Qwen (algunos pesos de la serie Qwen2.5 han estado sujetos a la Qwen Research License en tamaños concretos).
- Contexto limitado frente a modelos recientes (32K en el modelo base, insuficiente para repositorios grandes completos).
- Bajo nivel de adopción (492 descargas, 0 likes en el momento de la ficha), lo que implica falta de validación comunitaria.
- La cuantización a 4 bits del modelo base puede degradar ligeramente la calidad respecto al original en fp16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xciors/asisten-koding-defense
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://huggingface.co/docs/trl
- Familia Qwen2.5-Coder: https://huggingface.co/Qwen
