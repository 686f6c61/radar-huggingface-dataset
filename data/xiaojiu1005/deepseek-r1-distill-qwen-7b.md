# xiaojiu1005/DeepSeek-R1-Distill-Qwen-7B

## Resumen

DeepSeek-R1-Distill-Qwen-7B es un modelo de razonamiento (reasoning model) de 7,6 mil millones de parámetros creado por DeepSeek AI mediante destilación de DeepSeek-R1 sobre la base de Qwen2.5-7B. Forma parte de la familia de modelos de primera generación de razonamiento de DeepSeek, publicada en enero de 2025 junto con el paper técnico arXiv:2501.12948. Su objetivo es llevar capacidades de razonamiento de cadena de pensamiento largo (long chain-of-thought) a un tamaño desplegable en hardware modesto.

El modelo se genera ajustando (fine-tuning) Qwen2.5-7B con datos de razonamiento sintetizados por DeepSeek-R1, el modelo completo entrenado con aprendizaje por refuerzo a gran escala. Según DeepSeek, los modelos destilados rinden mejor que los modelos pequeños entrenados directamente con RL, y la versión de 32B supera a OpenAI-o1-mini en varios benchmarks.

Esta ficha corresponde a un repositorio de terceros (xiaojiu1005) que redistribuye el modelo bajo licencia MIT, con los pesos en safetensors y un tamaño de repositorio de 15,2 GB. Es relevante porque ofrece razonamiento matemático y de código de alto nivel en un modelo denso que cabe en una GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen2 (decoder-only) |
| Parametros totales | 7.615.616.512 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (según especificación oficial de la familia DeepSeek-R1) |
| Tipos de cuantizacion | No disponible en el repo (formato nativo BF16; existen cuantizaciones GGUF de la versión oficial de terceros como unsloth o bartowski) |
| Idiomas soportados | No disponible (la base Qwen2.5 cubre principalmente inglés y chino; el modelo razona mejor en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (15,2 GB en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only heredado de Qwen2.5-7B, sin mezcla de expertos. El entrenamiento no modifica la arquitectura: consiste en supervised fine-tuning de la base Qwen2.5-7B con aproximadamente 800.000 muestras de razonamiento generadas por DeepSeek-R1 (el paper oficial indica datos de razonamiento en matemáticas, código y tareas generales con cadenas de pensamiento largas). No se aplicó RL directamente a este modelo destilado; el razonamiento se transfiere desde el modelo profesor.

El proceso de DeepSeek-R1 (profesor) combinó dos etapas de RL y dos de SFT: RL puro sobre el modelo base para inducir comportamientos como autoverificación, reflexión y CoT largo, seguido de datos de arranque en frío (cold-start) para resolver problemas de legibilidad y mezcla de idiomas. Una técnica destacable del ecosistema es que el modelo emite su razonamiento dentro de etiquetas `<think>...</think>` antes de la respuesta final, lo que permite separar el proceso de pensamiento del resultado.

## Capacidades

- Razonamiento matemático paso a paso con cadenas de pensamiento largas (la variante de 7B destilada es especialmente fuerte en MATH-500 y AIME).
- Generación y depuración de código, incluida resolución de problemas de programación competitiva.
- Autoverificación y reflexión: puede revisar sus propios pasos intermedios dentro del bloque de razonamiento.
- Generación de texto conversacional (pipeline text-generation), con formato recomendado de prompt que empieza por `<｜begin▁of▁sentence｜>` y plantilla de chat de Qwen.
- Contexto largo de hasta 128K tokens según la especificación de la familia.
- No incluye de forma nativa capacidades multimodales (visión o audio).
- Tool calling / function calling: no disponible de forma documentada en la model card; al ser un modelo de razonamiento destilado, no está optimizado para ello.
- Idiomas: sin documentación específica; el entrenamiento de destilación se realizó principalmente en inglés.

## Casos de uso

- Resolución de problemas de matemáticas educativas: dado un enunciado de álgebra, cálculo o olimpiadas, el modelo genera el razonamiento completo en `<think>` y la solución final, útil para tutores automáticos.
- Asistente de programación offline: generación de funciones, explicación de errores y resolución de ejercicios de estilo LeetCode sin depender de APIs externas, gracias a que cabe en una RTX 4090.
- Verificación de razonamiento en pipelines de agentes: el bloque de pensamiento explícito permite auditar el proceso del modelo antes de aceptar la respuesta.
- Investigación en destilación y RL: al ser un checkpoint destilado abierto con licencia MIT, sirve como base para estudios sobre transferencia de capacidades de razonamiento.
- Generación aumentada con recuperación (RAG) sobre documentos técnicos: la ventana de contexto larga permite razonar sobre pasajes recuperados extensos.
- Prototipado de productos de razonamiento en local: despliegue con Ollama o llama.cpp en estaciones de trabajo sin coste de API, aprovechando la licencia MIT para uso comercial.
- Generación de datos sintéticos de razonamiento: puede usarse como profesor barato para destilar a modelos aún menores.

## Benchmarks y rendimiento

Resultados publicados por DeepSeek para DeepSeek-R1-Distill-Qwen-7B (paper oficial, pass@1):

| Benchmark | DeepSeek-R1-Distill-Qwen-7B | OpenAI-o1-mini |
|---|---|---|
| AIME 2024 | 55,5 | 63,6 |
| MATH-500 | 92,8 | 90,6 |
| GPQA Diamond | 49,1 | 59,4 |
| LiveCodeBench | 37,6 | 57,2 |
| Codeforces (rating) | 1189 | 1720 |

No se han publicado resultados de benchmarks específicos para esta réplica de xiaojiu1005, por lo que se asumen los del checkpoint oficial de DeepSeek del mismo nombre.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 15,2 GB solo de pesos; con contexto y KV cache se recomiendan 20-24 GB.
- VRAM con cuantización Q4_K_M (GGUF): alrededor de 4,7 GB de pesos, viable con 8 GB de VRAM.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) en FP16; RTX 4060 Ti 16 GB o superior con cuantización de 4 bits; A100/H100 para servir múltiples usuarios concurrentes con vLLM.
- Cabe en GPUs de consumo: sí, en 24 GB nativamente y en 8-12 GB con GGUF de 4 bits.
- Despliegue: vLLM, TGI, SGLang (transformers/safetensors), o llama.cpp, Ollama y LM Studio con conversiones GGUF de la versión oficial.
- Rendimiento: no disponible en la información proporcionada; al ser un modelo denso de 7B, se esperan decenas de tokens/s en una RTX 4090 con vLLM. Ten en cuenta que genera CoT largos, lo que aumenta la latencia percibida de la respuesta final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (este) | 7,6B (denso) | 131.072 | MIT | Razonamiento destilado de R1; fuerte en MATH-500 (92,8) |
| DeepSeek-R1-Distill-Llama-8B | 8B (denso) | 131.072 | MIT | Misma destilación sobre Llama3.1-8B; ligeramente inferior en AIME (50,0) y MATH-500 (89,1) |
| DeepSeek-R1-Distill-Qwen-14B | 14B (denso) | 131.072 | MIT | Requiere ~28 GB en FP16; AIME 69,7 y MATH-500 93,9, claramente superior |
| Qwen2.5-7B-Instruct | 7B (denso) | 131.072 | Qwen (uso comercial condicionado) | Modelo base generalista sin razonamiento CoT largo; mejor en seguimiento de instrucciones y tool calling |

## Limitaciones y advertencias

- Riesgo de alucinación: como todo LLM, puede inventar hechos con fluidez; el razonamiento explícito reduce pero no elimina errores lógicos.
- El modelo puede producir cadenas de pensamiento muy largas, con repeticiones ocasionales, lo que incrementa el coste de inferencia y el tiempo de respuesta.
- Idioma: entrenado principalmente con datos de razonamiento en inglés; el rendimiento en castellano puede ser inferior y puede mezclar idiomas en el CoT, un problema documentado en la familia R1.
- Seguridad: los modelos destilados de R1 heredan menos filtrado de seguridad que los modelos alineados; DeepSeek recomienda revisión humana en aplicaciones sensibles.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero conviene verificar también la licencia de la base Qwen2.5 en usos que requieran cumplimiento estricto.
- Este repositorio es una redistribución de un tercero (xiaojiu1005, 256 descargas), no el canal oficial de DeepSeek AI; para producción se recomienda el repositorio oficial deepseek-ai/DeepSeek-R1-Distill-Qwen-7B.
- No está optimizado para tool calling ni agentes multi-paso sin ingeniería adicional de prompts.

## Enlaces

- Repositorio (esta ficha): https://huggingface.co/xiaojiu1005/DeepSeek-R1-Distill-Qwen-7B
- Repositorio oficial de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper técnico: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf (arXiv:2501.12948)
- Repositorio GitHub oficial: https://github.com/deepseek-ai/DeepSeek-R1
- Web de DeepSeek: https://www.deepseek.com/
- Demo de chat: https://chat.deepseek.com/
- Organización de DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai
