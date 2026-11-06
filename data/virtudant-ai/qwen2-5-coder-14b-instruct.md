# Virtudant-AI/Qwen2.5-Coder-14B-Instruct

## Resumen

Qwen2.5-Coder-14B-Instruct es la variante instruida del modelo de código de 14 700 millones de parámetros de la familia Qwen2.5-Coder, desarrollada por el equipo Qwen de Alibaba Cloud. Esta ficha corresponde a una republicación en el espacio de Virtudant-AI, que mantiene los pesos y la licencia Apache 2.0 del modelo original de Qwen, por lo que se trata de un espejo del checkpoint oficial y no de un fine-tuning adicional. El modelo resuelve tareas de generación, razonamiento y reparación de código, además de mantener competencias en matemáticas y lenguaje general gracias a su base Qwen2.5.

La arquitectura es un transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV, con 48 capas y atención GQA de 40 cabezas para consultas y 8 para claves/valores. El contexto nativo es de 32 768 tokens, ampliable a 131 072 mediante escalado YaRN con factor 4.0. Se entrenó sobre 5,5 billones de tokens que combinan código fuente, datos de grounding texto-código y datos sintéticos, y se distribuye en safetensors con un tamaño de repositorio de 19,9 GB.

Su relevancia actual radica en que ofrece un equilibrio entre tamaño y capacidades de código que cabe en una sola GPU de 24 GB en cuantización de 8 bits, con licencia permisiva para uso comercial y soporte de tool calling, lo que lo hace apto para agentes de código y pipelines de CI/CD sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo QKV; atención GQA |
| Parametros totales | 14,7 B (13,1 B sin embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens nativo; 131 072 con YaRN factor 4.0 |
| Tipos de cuantizacion | No especificados en la información disponible; compatible con cuantizaciones estándar de transformers (GPTQ, AWQ, GGUF vía conversión) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 19,9 GB) |
| Capas | 48 |
| Cabezas de atención | 40 para Q, 8 para KV (GQA) |
| Librería | transformers (>= 4.37.0) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2.5: un transformer decoder-only con 48 capas, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con query-key-value bias. Emplea grouped-query attention con 40 cabezas de consulta y 8 de clave/valor, lo que reduce el coste de memoria del KV cache en inferencia. El contexto nativo es de 32 768 tokens y se extiende a 131 072 mediante YaRN, una técnica de extrapolación de longitud que requiere modificar `rope_scaling` en `config.json`; el autor advierte que el escalado estático de vLLM puede degradar el rendimiento en textos cortos si se activa de forma permanente.

El entrenamiento partió de la base Qwen2.5-Coder-14B, preentrenada sobre 5,5 billones de tokens que incluyen código fuente de múltiples lenguajes, datos de grounding texto-código y datos sintéticos. La fase de post-entrenamiento incluyó instrucción y alineación para tareas de chat y código, aunque la model card no detalla la composición exacta del dataset de instrucciones ni si se usó RLHF o DPO. La familia Qwen2.5-Coder se posiciona como referencia open source en generación de código, con la variante de 32B comparada con GPT-4o en capacidad de programación según el blog del autor.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con especial énfasis en Python, JavaScript, TypeScript, Java, C++, Go y Rust.
- Razonamiento sobre código: explicación de fragmentos, detección de bugs y reparación de errores (code fixing).
- Generación de tests unitarios y documentación técnica a partir de código existente.
- Capacidades matemáticas y de razonamiento general heredadas de la base Qwen2.5.
- Soporte de tool calling y function calling mediante plantillas de chat, apto para agentes.
- Razonamiento multi-paso para tareas de agente de código (Code Agents).
- Conversación multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de contextos largos de hasta 131 072 tokens con YaRN.
- Capacidad multilingüe limitada: la model card declara únicamente inglés.

## Casos de uso

- Asistente de código en IDE: el modelo puede autocompletar funciones, generar docstrings y sugerir refactorizaciones dentro de un contexto de 32 768 tokens, suficiente para incluir varios ficheros de un proyecto mediano en una sola llamada.
- Reparación automática de bugs en CI/CD: integrado en un pipeline que recibe el fallo de tests y el diff, el modelo propone un parche; su capacidad de code fixing y su contexto largo permiten incluir el stack trace y los ficheros relevantes.
- Generación de tests unitarios: a partir de una función y su firma, el modelo produce casos de prueba con assertions, lo que acelera la cobertura en proyectos con deuda técnica.
- Agente de código autónomo: con tool calling puede invocar herramientas de búsqueda, ejecución de tests y edición de ficheros en un bucle multi-paso, adecuado para tareas de migración o corrección de dependencias.
- Documentación técnica automatizada: generación de READMEs, comentarios de API y guías de uso a partir del código fuente, manteniendo coherencia de estilo en repositorios grandes.
- Migración de código entre lenguajes o frameworks: traducción de fragmentos de Python a TypeScript o de una versión de librería a otra, con contexto suficiente para respetar las convenciones del proyecto destino.
- Atención al cliente técnica: respuestas multi-turno sobre errores de integración y uso de SDKs, apoyadas en la ventana de contexto para incluir documentación y ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog oficial de Qwen2.5-Coder para los resultados detallados de evaluación, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de benchmarks de código en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 28-30 GB en FP16/BF16 (14,7 B parámetros × 2 bytes más overhead de KV cache), unos 15-16 GB en cuantización de 8 bits y 9-10 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantización de 8 bits o 4 bits; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB solo con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: vLLM (recomendado por el autor para producción y contextos largos), TGI, llama.cpp/Ollama mediante conversión a GGUF, y transformers con `device_map="auto"` para prototipado.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el autor remite a la página de speed benchmark de la documentación de Qwen para cifras por GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct (este) | 14,7 B | 32 768 nativo / 131 072 con YaRN | Apache 2.0 | Hugging Face (espejo Virtudant-AI) | Modelo denso de código con tool calling |
| Qwen2.5-Coder-32B-Instruct | 32 B | 32 768 nativo / 131 072 con YaRN | Apache 2.0 | Hugging Face (Qwen oficial) | Mayor capacidad de código, requiere más VRAM |
| Qwen2.5-Coder-7B-Instruct | 7 B | 32 768 nativo / 131 072 con YaRN | Apache 2.0 | Hugging Face (Qwen oficial) | Alternativa ligera para GPUs de 16 GB |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B (MoE, 2,4 B activos) | 128 000 | Licencia propia de DeepSeek | Hugging Face | MoE con menor coste de inferencia por token |

La comparación con modelos de otros fabricantes no está disponible en la información proporcionada; los datos de rendimiento relativos entre estas variantes no se incluyen en la model card.

## Limitaciones y advertencias

- La model card declara únicamente inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está garantizado y puede degradarse notablemente.
- Riesgo de alucinación en APIs inexistentes, funciones inventadas o dependencias que no existen; conviene validar el código generado con tests y linters antes de integrarlo.
- Sesgos heredados de los datos de preentrenamiento (código público de GitHub, datos sintéticos), con posible infrarrepresentación de lenguajes y dominios poco frecuentes.
- El contexto nativo es de 32 768 tokens; activar YaRN de forma permanente en vLLM puede degradar el rendimiento en textos cortos, por lo que debe habilitarse solo cuando se requieran contextos largos.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero se recomienda conservar el aviso de licencia y la atribución al modelo original de Qwen.
- Este repositorio es un espejo del checkpoint oficial de Qwen; no se documenta ningún fine-tuning adicional por parte de Virtudant-AI, por lo que el comportamiento debe ser equivalente al original.
- Requiere `transformers >= 4.37.0`; versiones anteriores fallan con `KeyError: 'qwen2'`.
- El modelo no es multimodal: no procesa imágenes ni audio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Virtudant-AI/Qwen2.5-Coder-14B-Instruct
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5-Coder
- Documentación: https://qwen.readthedocs.io/en/latest/
- Paper técnico (arXiv 2409.12186): https://arxiv.org/abs/2409.12186
- Paper Qwen2 (arXiv 2407.10671): https://arxiv.org/abs/2407.10671
- Paper YaRN (arXiv 2309.00071): https://arxiv.org/abs/2309.00071
- Chat de Qwen: https://chat.qwenlm.ai/
- Guía de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmark de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct/blob/main/LICENSE
