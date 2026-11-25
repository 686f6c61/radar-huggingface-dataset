# TeamUNLa/Ornith-1.5-35B-A3B-exl3-5bpw-hb16-mb6

## Resumen

Ornith-1.5-35B-A3B-exl3-5bpw-hb16-mb6 es una cuantización en formato ExLlamaV3 (EXL3) del modelo ornith-ai/Ornith-1.5-35B-A3B, preparada por la Comunidad de Sistemas de la UNLa (TeamUNLa). El modelo base es una arquitectura MoE (Mixture of Experts) con 35B parámetros totales y aproximadamente 3B parámetros activos por token, según indica la model card. Esta variante busca hacer viable la ejecución local del modelo en equipos de consumo mediante una asignación no uniforme de bits por tensor.

La cuantización emplea una estrategia de 5 bits por peso (5 bpw) efectivos, con la cabeza de salida a 16 bpw, capas de atención y expertos compartidos a 8 bpw, capas de borde a 6 bpw y expertos enrutados intermedios a 4-6 bpw. El resultado es un repositorio de 24,5 GB que, según el autor, requiere un mínimo de 8 GB de VRAM (con offloading a RAM) y alrededor de 40 GB de memoria total recomendada.

Es relevante para desarrolladores que quieran desplegar un modelo MoE de gran tamaño en hardware local sin depender de servicios en la nube, especialmente en entornos con GPUs de consumo. La licencia MIT del modelo base facilita su uso comercial, aunque conviene verificar las condiciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer, con linear_attn y self_attn; familia qwen3_5_moe |
| Parametros totales | 35B (según model card); 12.222.377.472 según safetensors del repo cuantizado |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 5 bpw (hb16-mb6), asignación no uniforme: lm_head 16 bpw, atención y shared_expert 8 bpw, capas de borde 6 bpw, expertos intermedios 4-6 bpw |
| Idiomas soportados | es, en |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 35B parámetros totales y aproximadamente 3B activos por token. La arquitectura incluye capas de atención lineal (linear_attn) y atención estándar (self_attn), además de expertos compartidos (shared_expert) y expertos enrutados. La model card de esta variante no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería a la model card del modelo original, no incluida en la información disponible.

La innovación técnica destacable de esta variante es la receta de cuantización no uniforme aplicada con ExLlamaV3: se asignan más bits a los tensores críticos (atención, expertos compartidos, cabeza de salida) y menos a los expertos enrutados intermedios, buscando preservar la calidad con un tamaño reducido. El sufijo hb16-mb6 indica head_bits 16 y max bits 6 para los tensores intermedios.

## Capacidades

- Generación de texto conversacional en español e inglés.
- Razonamiento y respuesta multi-turno (pipeline text-generation, etiqueta conversational).
- Procesamiento de imagen y texto (pipeline image-text-to-text según los tags del repo), lo que sugiere capacidades multimodales heredadas del modelo base.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: la model card menciona su uso como agente en VS Code e IDEs, lo que implica cierta capacidad agéntica, aunque no se detalla formalmente.
- Capacidades multilingües limitadas a español e inglés según los metadatos.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación en IDE: la model card indica que puede servirse con TabbyAPI como endpoint compatible con la API de OpenAI, lo que permite integrarlo como agente en VS Code y otros editores con 8 GB de VRAM mínimos y offloading a RAM.
- Despliegue local en PC de consumo: gracias a la cuantización EXL3 de 5 bpw y al tamaño de 22,8 GB de descarga, puede ejecutarse en equipos con 40 GB de memoria total (VRAM + RAM), sin depender de la nube.
- Atención al cliente automatizada en español e inglés: el modelo soporta conversaciones multi-turno en ambos idiomas, adecuado para chatbots de soporte en entornos con requisitos de privacidad que exijan inferencia local.
- Generación de texto y documentación técnica: con parámetros de muestreo recomendados (temperature 0.75, top_p 0.95), puede emplearse para redactar borradores, resúmenes y documentación en español.
- Prototipado de aplicaciones con API compatible con OpenAI: al servirse con TabbyAPI, se integra en pipelines existentes que ya consumen la API de OpenAI sin cambios de código significativos.
- Experimentación académica y docencia: al ser un proyecto comunitario de la UNLa con licencia MIT, es adecuado para prácticas de cuantización, evaluación de modelos MoE y despliegue en laboratorios con hardware modesto.
- Procesamiento imagen-texto: si se confirman las capacidades multimodales del modelo base, podría usarse para tareas de descripción de imágenes o问答 visual, aunque no hay documentación específica en esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM mínima recomendada: 8 GB, repartiendo capas y expertos entre VRAM y RAM (offloading).
- Memoria total recomendada (VRAM + RAM): aproximadamente 40 GB.
- Tamaño de descarga: 22,8 GB (repositorio de 24,5 GB).
- GPUs compatibles (CUDA): cualquier tarjeta desde la generación GeForce GTX 10 en adelante, siempre que tenga VRAM suficiente.
- GPUs compatibles (ROCm): serie RX 7000 o superior; RX 6800 y superiores de la serie RX 6000 deberían funcionar, aunque no fueron probados.
- GPUs Intel: no soportadas.
- Opciones de despliegue: TabbyAPI (servidor compatible con la API de OpenAI); ExLlamaV3 como motor de inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-exl3-5bpw-hb16-mb6 | 35B totales / ~3B activos | no disponible | MIT | EXL3 (safetensors) | Hugging Face, 0 descargas |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35B totales / ~3B activos | no disponible | MIT | safetensors | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada; la comparativa se limita al modelo base y a esta variante cuantizada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; se recomienda evaluar el comportamiento en dominios sensibles antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta variante.
- Idiomas limitados a español e inglés según los metadatos; el rendimiento en otros idiomas no está garantizado.
- La cuantización a 5 bpw, aunque busca ser casi sin pérdida, puede introducir degradaciones en tareas de razonamiento complejo o matemáticas; no se han publicado comparativas de calidad frente al modelo original.
- El offloading a RAM implica latencia mayor y throughput reducido en comparación con una ejecución íntegra en VRAM.
- Compatibilidad limitada: solo CUDA y ROCm; las GPUs Intel no están soportadas.
- La licencia MIT del modelo base permite uso comercial, pero conviene verificar la licencia del modelo original y las condiciones de los datos de entrenamiento antes de un despliegue comercial.
- Proyecto comunitario independiente de la UNLa; no es una publicación institucional oficial y no cuenta con soporte garantizado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-5bpw-hb16-mb6
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Índice de modelos de TeamUNLa: https://huggingface.co/TeamUNLa/LLMs-UNLa
- ExLlamaV3 (motor de cuantización e inferencia): https://github.com/turboderp-org/exllamav3
- TabbyAPI (servidor compatible con la API de OpenAI): https://github.com/theroyallab/tabbyAPI
