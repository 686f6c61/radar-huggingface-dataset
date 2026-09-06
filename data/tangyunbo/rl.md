# tangyunbo/RL

## Resumen

El modelo `tangyunbo/RL` es una redistribución en Hugging Face del modelo Qwen3-4B-Instruct-2507, desarrollado por el equipo de Alibaba Qwen y subido por el usuario tangyunbo. Se trata de un modelo causal de lenguaje con 4.000 millones de parámetros, basado en la arquitectura Transformer de la familia Qwen3. Resuelve tareas de generación de texto, razonamiento lógico, matemáticas, programación, uso de herramientas y comprensión de documentos largos, con una ventana de contexto nativa de 262.144 tokens. La relevancia de esta versión radica en las mejoras sustanciales frente al Qwen3-4B original: mayor precisión en razonamiento, mejor seguimiento de instrucciones, mayor cobertura de conocimiento multilingüe y alineación optimizada en tareas abiertas. El repositorio publica los pesos en formato safetensors bajo licencia Apache-2.0. Un detalle destacable es que este modelo opera exclusivamente en modo no-thinking, por lo que no genera bloques de pensamiento internos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo denso basado en Qwen3) |
| Parámetros totales | 4.022.468.096 (4.0B); 3.6B sin incluir embeddings |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | No disponible (el repositorio publica pesos en safetensors; no se especifican cuantizaciones oficiales) |
| Idiomas soportados | No disponible (el modelo muestra capacidades multilingües según benchmarks, pero no se lista un conjunto explícito de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer causal denso con 36 capas y atención con Grouped Query Attention (GQA): 32 cabezas de consulta y 8 cabezas de clave/valor, lo que reduce el coste de la memoria del KV cache durante la inferencia de contexto largo. El contexto nativo es de 262.144 tokens. Según la model card, la fase de entrenamiento incluye pretraining y post-training, y se destacan mejoras significativas en seguimiento de instrucciones, razonamiento lógico, matemáticas, ciencia, codificación y uso de herramientas. También se menciona una mayor cobertura de conocimiento de cola larga en múltiples idiomas y una mejor alineación con preferencias humanas en tareas subjetivas. No se proporcionan datos concretos sobre el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO. El modelo solo admite el modo no-thinking, por lo que no genera bloques de pensamiento en la salida.

## Capacidades

- Generación de texto e instrucciones, con mejoras en razonamiento lógico, matemáticas, ciencia y codificación.
- Tool calling / function calling, con resultados destacados en BFCL-v3 y benchmarks TAU; se recomienda integrarlo con Qwen-Agent para aprovechar su potencial agéntico.
- Soporte de agentes y razonamiento multi-step, reflejado en su rendimiento en TAU1, TAU2 y ZebraLogic.
- Capacidades multilingües en tareas de conocimiento y matemáticas, avaladas por MultiIF, MMLU-ProX, INCLUDE y PolyMATH.
- Comprensión de contexto largo de hasta 256K tokens, apta para procesar documentos extensos o conversaciones prolongadas.
- Alineación mejorada en tareas abiertas y subjetivas, como escritura creativa y generación de texto de alta calidad.
- No genera bloques de pensamiento (modo no-thinking), lo que simplifica la salida en inferencia estándar.

## Casos de uso

- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens) y ejecutar llamadas a herramientas para consultar bases de conocimiento o APIs externas.
- Generación de código en producción: con soporte de tool calling y puntuaciones de 35.1 en LiveCodeBench y 76.8 en MultiPL-E, es viable para integrarse en pipelines de CI/CD o asistentes de desarrollo.
- Agentes de automatización: mediante Qwen-Agent y configuraciones MCP, el modelo puede orquestar flujos de trabajo complejos; su resultado de 48.7 en TAU1-Retail lo posiciona como una opción sólida para tareas agénticas.
- Razonamiento matemático y científico: con un AIME25 de 47.4 y un GPQA de 62.0, resulta útil para tutorización, análisis técnico o resolución de problemas avanzados.
- Análisis de documentos largos: gracias al contexto de 256K, permite resumir informes, contratos o expedientes extensos sin necesidad de segmentación manual.
- Asistente de escritura creativa: con 83.5 en Creative Writing y 83.4 en WritingBench, es adecuado para generar contenido editorial, campañas de marketing o redacción narrativa.
- Traducción y tareas multilingües: su rendimiento en PolyMATH (31.1) y MMLU-ProX (61.6) indica capacidades en matemáticas y conocimiento en varios idiomas, aprovechable en sistemas de soporte internacional.

## Benchmarks y rendimiento

La model card incluye la siguiente tabla comparativa, publicada por el autor original. No se han añadido valores externos.

|  | GPT-4.1-nano-2025-04-14 | Qwen3-30B-A3B Non-Thinking | Qwen3-4B Non-Thinking | Qwen3-4B-Instruct-2507 |
|--- | --- | --- | --- | --- |
| **Knowledge** | | | |
| MMLU-Pro | 62.8 | 69.1 | 58.0 | **69.6** |
| MMLU-Redux | 80.2 | 84.1 | 77.3 | **84.2** |
| GPQA | 50.3 | 54.8 | 41.7 | **62.0** |
| SuperGPQA | 32.2 | 42.2 | 32.0 | **42.8** |
| **Reasoning** | | | |
| AIME25 | 22.7 | 21.6 | 19.1 | **47.4** |
| HMMT25 | 9.7 | 12.0 | 12.1 | **31.0** |
| ZebraLogic | 14.8 | 33.2 | 35.2 | **80.2** |
| LiveBench 20241125 | 41.5 | 59.4 | 48.4 | **63.0** |
| **Coding** | | | |
| LiveCodeBench v6 (25.02-25.05) | 31.5 | 29.0 | 26.4 | **35.1** |
| MultiPL-E | 76.3 | 74.6 | 66.6 | **76.8** |
| Aider-Polyglot | 9.8 | **24.4** | 13.8 | 12.9 |
| **Alignment** | | | |
| IFEval | 74.5 | **83.7** | 81.2 | 83.4 |
| Arena-Hard v2* | 15.9 | 24.8 | 9.5 | **43.4** |
| Creative Writing v3 | 72.7 | 68.1 | 53.6 | **83.5** |
| WritingBench | 66.9 | 72.2 | 68.5 | **83.4** |
| **Agent** | | | |
| BFCL-v3 | 53.0 | 58.6 | 57.6 | **61.9** |
| TAU1-Retail | 23.5 | 38.3 | 24.3 | **48.7** |
| TAU1-Airline | 14.0 | 18.0 | 16.0 | **32.0** |
| TAU2-Retail | - | 31.6 | 28.1 | **40.4** |
| TAU2-Airline | - | 18.0 | 12.0 | **24.0** |
| TAU2-Telecom | - | **18.4** | 17.5 | 13.2 |
| **Multilingualism** | | | |
| MultiIF | 60.7 | **70.8** | 61.3 | 69.0 |
| MMLU-ProX | 56.2 | **65.1** | 49.6 | 61.6 |
| INCLUDE | 58.6 | **67.8** | 53.8 | 60.1 |
| PolyMATH | 15.6 | 23.3 | 16.6 | **31.1** |

Nota: la columna Qwen3-4B-Instruct-2507 corresponde al modelo subido en el repositorio `tangyunbo/RL`.

## Requisitos de hardware

- VRAM estimada: no se publican datos oficiales en la model card. Para un modelo de 4.000 millones de parámetros en FP16, los pesos ocupan aproximadamente 8 GB. La KV cache para el contexto completo de 262.144 tokens puede requerir memoria adicional considerable; por ello, la documentación recomienda reducir el contexto a 32.768 tokens si se supera la memoria disponible.
- GPU recomendadas: no disponibles oficialmente. Por tamaño, el modelo puede ejecutarse en GPUs de gama alta para consumo, como RTX 4090 de 24 GB, o en GPUs de centro de datos como A100 y H100 para contextos largos.
- Consumer GPU: sí, es viable en GPUs de consumo con al menos 12-16 GB de VRAM si se utiliza cuantización (GGUF, MLX) o se reduce la longitud de contexto.
- Opciones de despliegue: sglang >=0.4.6.post1, vllm >=0.8.5, Ollama, LMStudio, MLX-LM, llama.cpp, KTransformers y Qwen-Agent.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modo reasoning | Uso de herramientas |
|---|---|---|---|---|---|
| tangyunbo/RL (Qwen3-4B-Instruct-2507) | 4.0B denso | 262.144 | Apache-2.0 | No-thinking | Sí |
| Qwen3-4B (original, non-thinking) | 4.0B | 262.144 | Apache-2.0 | No-thinking | Sí |
| Qwen3-30B-A3B | 30B totales / 3B activos (MoE) | 262.144 | Apache-2.0 | Híbrido (thinking y no-thinking) | Sí |
| GPT-4.1-nano-2025-04-14 | No disponible | No disponible | Propietaria | No-thinking | Sí |

El modelo `tangyunbo/RL` es idéntico a `Qwen/Qwen3-4B-Instruct-2507`. En benchmarks supera a la versión original de Qwen3-4B en la mayoría de categorías, y en varias métricas de razonamiento y agentes logra resultados superiores a los de Qwen3-30B-A3B pese a tener muchos menos parámetros totales.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card.
- Riesgo de alucinación: no hay datos específicos; como todo modelo de lenguaje, puede generar contenido inexacto. No se han publicado estudios de robustez en la información disponible.
- Limitaciones de contexto: el contexto nativo es de 262.144 tokens, pero en la práctica pueden ocurrir errores de memoria (OOM) en GPU; la documentación recomienda reducir el contexto a 32.768 tokens en caso necesario.
- Modo no-thinking: el modelo no genera razonamiento explícito, lo que puede reducir la transparencia en tareas de razonamiento complejo.
- Procedencia: el repositorio `tangyunbo/RL` es una subida de un usuario no afiliado al equipo original de Qwen. Aunque los pesos coinciden con la model card publicada, no es el repositorio oficial de `Qwen/Qwen3-4B-Instruct-2507`, por lo que conviene verificar su integridad antes de usarlo en producción.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo original en Qwen para confirmar que no hay restricciones adicionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tangyunbo/RL
- Model card original de Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Qwen-Agent: https://github.com/QwenLM/Qwen-Agent
- Paper (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Perfil del autor del repositorio: https://huggingface.co/tangyunbo
