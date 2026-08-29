# wangzhang/Qwen3.6-27B-abliterated

## Resumen

El modelo `wangzhang/Qwen3.6-27B-abliterated` es una variante del modelo Qwen3.6-27B de Alibaba, modificada mediante un proceso de abliteración en dos pasadas para suprimir los rechazos (refusals) ante prompts dañinos o sensibles. Desarrollado por el usuario wangzhang, este checkpoint se distribuye en formato safetensors con pesos BF16 y licencia Apache 2.0, y está orientado a la investigación en alineación y seguridad de modelos, así como a aplicaciones que requieren respuestas sin restricciones temáticas.

El modelo base Qwen3.6-27B es un transformer denso de 27.356 millones de parámetros con arquitectura híbrida (atención completa en algunas capas y Gated DeltaNet en otras) y capacidades multimodales (imagen-texto). La variante abliterada mantiene estas capacidades, pero reduce drásticamente la tasa de rechazo: de 100/100 en el base a 10/100 en el abliterado, según una evaluación con un juez LLM sobre 100 prompts dañinos. El proceso de abliteración emplea dos pasadas de proyección ortogonal con búsqueda de hiperparámetros LoRA (rank 3) mediante Optuna TPE, y el checkpoint final incluye ambas LoRA fusionadas, por lo que no requiere dependencias PEFT en inferencia.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" sobre una base técnica sólida, con una degradación mínima de la calidad (KL acumulada ≈ 0.0242 frente al base), lo que lo hace útil para estudiar los efectos de la abliteración en modelos híbridos densos y para aplicaciones de generación de contenido creativo o investigación en seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención completa + Gated DeltaNet) con visión (VLM) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuye en BF16) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.6-27B, un transformer denso que combina atención completa en 16 de sus 64 capas y Gated DeltaNet (GDN) en las 48 restantes, lo que reduce el coste computacional manteniendo la capacidad de modelado de contexto largo. Además, es un modelo multimodal (VLM) que procesa entradas de imagen y texto, con pipeline `image-text-to-text`.

El proceso de abliteración se realizó con la herramienta `abliterix` mediante dos pasadas de proyección ortogonal. La primera pasada extrae la dirección principal de rechazo de los estados ocultos y la proyecta fuera, utilizando una búsqueda de hiperparámetros LoRA rank-3 con Optuna TPE (30 ensayos, multi-objetivo KL + refusal). La segunda pasada extrae la dirección residual de rechazo que queda tras la primera y la proyecta también, siguiendo la receta "DeepRefusal-peel" de TrevorS. El checkpoint final se exporta con ambas LoRA fusionadas (`merge_and_unload()`), por lo que no requiere PEFT en inferencia.

No se especifican los datos de entrenamiento del modelo base ni si se aplicaron técnicas como RLHF o DPO. El proceso de abliteración solo utiliza un conjunto de 800 prompts para extraer los vectores de rechazo, y la evaluación se realiza con 100 prompts dañinos adicionales.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.6-27B.
- Procesamiento de imágenes (VLM): puede responder a entradas visuales, aunque no se detallan capacidades específicas de visión en la model card.
- Supresión de rechazos: el modelo responde a prompts que el base rechazaría, con una tasa de rechazo del 10% frente al 100% del base en una evaluación de 100 prompts dañinos.
- Cumplimiento de jailbreaks: responde correctamente a 15 jailbreaks clásicos en inglés y chino, frente a 0 del base.
- Multilingüe: soporta inglés y chino.
- No se documenta soporte explícito de tool calling, function calling o agentes multi-paso en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad de modelos: permite estudiar cómo la abliteración afecta al comportamiento del modelo, la distribución de probabilidades y la coherencia, comparando con el base.
- Generación de contenido creativo sin restricciones: útil para escribir ficción, guiones o diálogos que aborden temas sensibles o controvertidos, donde el base se negaría a responder.
- Asistentes de escritura para exploración de temas tabú: puede ayudar a redactar borradores sobre temas como violencia, sexualidad o política sin filtros automáticos, siempre bajo supervisión humana.
- Pruebas de robustez y moderación de contenido: se puede usar para evaluar la eficacia de sistemas de moderación o para generar ejemplos adversarios en entornos controlados.
- Desarrollo de aplicaciones de rol-play o simulación de personajes: al no rechazar ciertos temas, permite mantener conversaciones coherentes en contextos de ficción o juegos de rol.
- Traducción y generación de texto en chino e inglés: mantiene las capacidades multilingües del base, con la ventaja de no negarse a traducir contenido sensible.
- Tareas de visión-lenguaje (VQA) en entornos de investigación: al ser un VLM, puede procesar imágenes y responder preguntas, aunque no se documentan casos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante abliterada. La model card solo incluye métricas de rechazo y divergencia KL, que se resumen a continuación:

| Métrica | Base `Qwen/Qwen3.6-27B` | **`abliterated`** |
|---|---|---|
| Rechazos en 100 prompts dañinos (juez LLM) | 100 / 100 | **10 / 100** |
| KL final vs intermedio (prompt benigno) | — | **0.0061** |
| KL acumulada vs base | — | **≈ 0.0242** |
| Desviación de longitud de respuesta vs intermedio | — | 0.01 σ |
| Cumplimiento en 15 jailbreaks clásicos (EN + ZH) | 0 / 15 | **15 / 15** |

No se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar para esta variante.

## Requisitos de hardware

- El modelo tiene 27,36 B parámetros. En BF16, el peso ocupa aproximadamente 54,7 GB (27,36 B × 2 bytes). Para inferencia, se recomienda una GPU con al menos 60-70 GB de VRAM para cargar el modelo y los estados intermedios, como una A100 80 GB o H100 80 GB.
- Con cuantización a 4 bits (por ejemplo, mediante GPTQ o AWQ), el modelo podría caber en una GPU de 24 GB como la RTX 4090, aunque no se proporcionan cuantizaciones oficiales.
- En 8 bits, se necesitarían aproximadamente 28 GB de VRAM, lo que permitiría ejecutarlo en GPUs como la RTX 3090 o RTX 4090.
- Opciones de despliegue: al ser un checkpoint en safetensors compatible con Transformers, se puede servir con vLLM, TGI, llama.cpp (con conversión a GGUF) o mediante Ollama (existe una versión en Ollama de un autor distinto, `huihui_ai/Qwen3.6-abliterated:27b`).
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Refusals (100 prompts) | KL vs base | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.6-27B (base) | 27,36 B | No disponible | 100/100 | — | Apache-2.0 |
| wangzhang/Qwen3.6-27B-abliterated | 27,36 B | No disponible | 10/100 | ≈ 0.0242 | Apache-2.0 |
| huihui_ai/Qwen3.6-abliterated:27b (Ollama) | 27,36 B | No disponible | No disponible | No disponible | Apache-2.0 |

No se dispone de datos de rendimiento en benchmarks estándar para comparar con otros modelos de tamaño similar. La comparativa se limita a las métricas de abliteración publicadas.

## Limitaciones y advertencias

- Riesgo de generar contenido dañino, ilegal o no ético: al suprimir los rechazos, el modelo puede producir respuestas que el base negaría, incluyendo instrucciones para actividades peligrosas. Su uso debe restringirse a entornos de investigación controlados.
- Sesgos potenciales: hereda los sesgos del modelo base Qwen3.6-27B, que pueden amplificarse al no haber filtros de rechazo.
- Alucinaciones: como cualquier modelo generativo, puede inventar información, especialmente en dominios poco representados.
- Limitaciones de idioma: solo soporta inglés y chino; no se garantiza calidad en otros idiomas.
- Degradación de calidad: aunque la KL acumulada es baja (0.0242), la abliteración puede afectar la coherencia en casos extremos, como se observó con el perfil T27 que degeneraba en bucles en chino.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el usuario es responsable del uso que haga del modelo, especialmente en aplicaciones que generen contenido sensible.
- No se garantiza compatibilidad con todas las herramientas de inferencia; se recomienda verificar el soporte de la arquitectura híbrida (Gated DeltaNet) en el runtime elegido.

## Enlaces

- [HuggingFace: wangzhang/Qwen3.6-27B-abliterated](https://huggingface.co/wangzhang/Qwen3.6-27B-abliterated)
- [Repositorio de abliterix](https://github.com/wuwangzhang1216/abliterix)
- [Modelo base Qwen/Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)
- [Versión en Ollama (huihui_ai)](https://ollama.com/huihui_ai/Qwen3.6-abliterated:27b)
- [Guía completa de Qwen3.6-27B (blog)](https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/)
- [Página de QwenCloud para Qwen3.6-27B](https://www.qwencloud.com/models/qwen3.6-27b)
