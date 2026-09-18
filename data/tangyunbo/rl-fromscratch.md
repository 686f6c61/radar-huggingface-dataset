# tangyunbo/RL-fromscratch

## Resumen

`tangyunbo/RL-fromscratch` es un modelo de generación de texto publicado en HuggingFace por el usuario tangyunbo, construido sobre la arquitectura Qwen3 y con 4.022.468.096 parámetros reales (verificados en los pesos safetensors del repositorio). El nombre del repositorio sugiere un entrenamiento mediante aprendizaje por refuerzo desde cero, pero la model card publicada no describe ese proceso: reproduce literalmente la documentación oficial de Qwen3-4B-Instruct-2507, incluida su licencia Apache 2.0 y sus enlaces a blog, GitHub y documentación de Qwen.

Se trata, por tanto, de un derivado de Qwen3-4B-Instruct-2507, un transformer causal decoder-only de 4,0B parámetros (3,6B sin contar embeddings) con 36 capas, atención con GQA (32 cabezas de consulta y 8 de clave/valor) y una ventana de contexto nativa de 262.144 tokens. Es un modelo de modo no-thinking: no genera bloques `<think></think>`, lo que simplifica su integración en pipelines de producción donde se busca latencia baja y respuestas directas.

Su relevancia actual es doble. Por un lado, el modelo base Qwen3-4B-Instruct-2507 ofrece cifras competitivas frente a modelos notablemente mayores en razonamiento, código y uso de herramientas, con un tamaño que cabe en GPU de consumo. Por otro, este repositorio concreto tiene un historial de validación muy limitado (142 descargas y 0 likes en el momento de la consulta), por lo que debe tratarse como un experimento reproducible más que como un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Qwen3), atención con GQA (32 cabezas Q, 8 cabezas KV), 36 capas |
| Parámetros totales | 4.022.468.096 (4,0B); 3,6B sin embeddings |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | No disponible en la información proporcionada; el repositorio solo publica pesos en safetensors. La familia Qwen3 admite cuantizaciones GGUF, MLX y AWQ mediante herramientas de terceros |
| Idiomas soportados | No disponible. La model card menciona mejoras en cobertura de conocimiento de cola larga en varios idiomas (MultiIF, MMLU-ProX, INCLUDE, PolyMATH), pero no enumera idiomas concretos |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3 en su variante densa de 4B: un transformer causal con normalización RMSNorm, embeddings rotatorios (RoPE) y atención con query-key normalization. El uso de GQA con 32 cabezas de consulta y solo 8 de clave/valor reduce de forma sustancial el tamaño de la caché KV, un factor crítico cuando se trabaja con la ventana de 262.144 tokens. El modelo es de modo no-thinking, por lo que no requiere ni acepta el bloque de razonamiento extendido que sí emplean otras variantes de Qwen3.

Respecto al entrenamiento, la información disponible no permite detallar el proceso específico de este repositorio. La model card indica las etapas de preentrenamiento y postentrenamiento del modelo base Qwen3-4B-Instruct-2507, pero no aporta número de tokens, composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineación. El nombre del repositorio (`RL-fromscratch`) apunta a un entrenamiento por refuerzo desde cero, pero no hay documentación que lo confirme ni que describa hiperparámetros, recompensas o datos utilizados. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras).

## Capacidades

- Generación de texto conversacional y de formato largo, con instrucciones multi-turno.
- Razonamiento lógico y matemático. La model card reporta mejoras notables del modelo base en AIME25 (47,4), HMMT25 (31,0) y ZebraLogic (80,2).
- Generación de código en múltiples lenguajes, con resultados del modelo base en LiveCodeBench v6 (35,1) y MultiPL-E (76,8).
- Uso de herramientas y function calling. El modelo base obtiene 61,9 en BFCL-v3, y la documentación recomienda el framework Qwen-Agent para explotar esta capacidad.
- Comportamiento agéntico y razonamiento multi-paso, con resultados del modelo base en TAU1-Retail (48,7), TAU1-Airline (32,0), TAU2-Retail (40,4) y TAU2-Airline (24,0).
- Comprensión de contexto largo, hasta 262.144 tokens de forma nativa.
- Capacidades multilingües, con mejoras reportadas en cobertura de conocimiento de cola larga.
- Alineación con preferencias subjetivas: 83,5 en Creative Writing v3 y 83,4 en WritingBench según la model card del modelo base.
- Modo no-thinking exclusivamente: no genera bloques de razonamiento extendido ni requiere el parámetro `enable_thinking=False`.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto, el modelo puede mantener conversaciones multi-turno muy largas manteniendo el historial completo de la interacción sin necesidad de resumir ni truncar, algo útil en soporte técnico o gestión de incidencias prolongadas.
- Agentes de herramientas en producción: la documentación recomienda Qwen-Agent para aprovechar el soporte de tool calling, lo que permite construir agentes que consulten APIs, bases de datos o sistemas internos y encadenen varias llamadas para resolver una tarea.
- Asistencia a la programación integrada en el IDE: el modelo puede generar y explicar código en varios lenguajes, además de participar en tareas de refactorización guiada por instrucciones dentro de un asistente tipo copiloto.
- Procesamiento de documentos largos: informes, contratos o expedientes que superen las decenas de miles de tokens pueden analizarse en una sola pasada, extrayendo datos estructurados o resúmenes sin fragmentar el documento.
- Automatización de flujos de negocio con agentes multi-paso: los resultados del modelo base en las pruebas TAU sugieren viabilidad para tareas de reservas, gestión de pedidos o resolución de incidencias con varios pasos dependientes.
- Generación de contenido editorial y creativo: las puntuaciones en Creative Writing v3 y WritingBench del modelo base indican un comportamiento razonable en redacción abierta, útil para borradores de artículos, descripciones de producto o material de marketing.
- Despliegue en local o en el borde: con 4,0B parámetros, el modelo puede ejecutarse en una GPU de consumo con cuantización de 4 bits, lo que habilita prototipos y aplicaciones con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card, que reproduce la tabla publicada por Qwen para Qwen3-4B-Instruct-2507. No hay resultados verificados específicamente para el repositorio `tangyunbo/RL-fromscratch`.

| Benchmark | GPT-4.1-nano-2025-04-14 | Qwen3-30B-A3B Non-Thinking | Qwen3-4B Non-Thinking | Qwen3-4B-Instruct-2507 |
|---|---|---|---|---|
| MMLU-Pro | 62,8 | 69,1 | 58,0 | 69,6 |
| MMLU-Redux | 80,2 | 84,1 | 77,3 | 84,2 |
| GPQA | 50,3 | 54,8 | 41,7 | 62,0 |
| SuperGPQA | 32,2 | 42,2 | 32,0 | 42,8 |
| AIME25 | 22,7 | 21,6 | 19,1 | 47,4 |
| HMMT25 | 9,7 | 12,0 | 12,1 | 31,0 |
| ZebraLogic | 14,8 | 33,2 | 35,2 | 80,2 |
| LiveBench 20241125 | 41,5 | 59,4 | 48,4 | 63,0 |
| LiveCodeBench v6 (25.02-25.05) | 31,5 | 29,0 | 26,4 | 35,1 |
| MultiPL-E | 76,3 | 74,6 | 66,6 | 76,8 |
| Aider-Polyglot | 9,8 | 24,4 | 13,8 | 12,9 |
| IFEval | 74,5 | 83,7 | 81,2 | 83,4 |
| Arena-Hard v2 | 15,9 | 24,8 | 9,5 | 43,4 |
| Creative Writing v3 | 72,7 | 68,1 | 53,6 | 83,5 |
| WritingBench | 66,9 | 72,2 | 68,5 | 83,4 |
| BFCL-v3 | 53,0 | 58,6 | 57,6 | 61,9 |
| TAU1-Retail | 23,5 | 38,3 | 24,3 | 48,7 |
| TAU1-Airline | 14,0 | 18,0 | 16,0 | 32,0 |
| TAU2-Retail | No disponible | 31,6 | 28,1 | 40,4 |
| TAU2-Airline | No disponible | 18,0 | 12,0 | 24,0 |
| TAU2-Telecom | No disponible | 18,4 | 17,5 | 13,2 |
| MultiIF | 60,7 | 70,8 | 61,3 | 69,0 |
| MMLU-ProX | 56,2 | 65,1 | 49,6 | 61,6 |
| INCLUDE | 58,6 | 67,8 | 53,8 | 60,1 |
| PolyMATH | 15,6 | 23,3 | 16,6 | 31,1 |

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 8 GB de VRAM (4,02B parámetros × 2 bytes).
- Pesos en INT8: aproximadamente 4,3 GB de VRAM.
- Pesos en cuantización de 4 bits: aproximadamente 2,3-2,7 GB de VRAM.
- Caché KV a contexto completo: con 36 capas, 8 cabezas KV y una dimensión de cabeza de 80, la caché en FP16 ocupa del orden de 90 KB por token, lo que supone unos 23-24 GB adicionales para los 262.144 tokens. Es una estimación calculada a partir de la configuración declarada, no un dato publicado por el autor.
- GPU de consumo: el modelo cabe en una RTX 4090, RTX 3090 o RTX 4080 (16-24 GB) con cuantización de 4 bits y contextos moderados. La propia model card recomienda reducir la ventana a 32.768 tokens si aparecen errores de memoria.
- GPU de centro de datos: A100 40/80 GB y H100 son adecuadas para servir el contexto completo de 262.144 tokens o para despliegues con concurrencia elevada.
- Opciones de despliegue documentadas: `vllm>=0.8.5`, `sglang>=0.4.6.post1`, `transformers` (versión 4.51.0 o superior, ya que versiones anteriores fallan con `KeyError: 'qwen3'`), además de Ollama, LM Studio, MLX-LM, llama.cpp y KTransformers para uso local. El repositorio está etiquetado como compatible con text-generation-inference y endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos destacados (model card) |
|---|---|---|---|---|---|
| tangyunbo/RL-fromscratch | 4,02B | 262.144 tokens (heredado de Qwen3-4B-Instruct-2507) | Apache 2.0 | Público en HuggingFace, 142 descargas, 0 likes | Sin benchmarks propios publicados |
| Qwen3-4B-Instruct-2507 | 4,0B (3,6B sin embeddings) | 262.144 tokens | Apache 2.0 | Público en HuggingFace (Qwen) | MMLU-Pro 69,6; AIME25 47,4; LiveCodeBench v6 35,1; BFCL-v3 61,9 |
| Qwen3-4B Non-Thinking | 4,0B | No especificado en la tabla proporcionada | Apache 2.0 | Público en HuggingFace (Qwen) | MMLU-Pro 58,0; AIME25 19,1; LiveCodeBench v6 26,4 |
| Qwen3-30B-A3B Non-Thinking | 30B totales (MoE, activos no especificados) | No especificado en la tabla proporcionada | Apache 2.0 | Público en HuggingFace (Qwen) | MMLU-Pro 69,1; AIME25 21,6; BFCL-v3 58,6; mejor en TAU2-Telecom (18,4) |
| GPT-4.1-nano-2025-04-14 | No disponible | No disponible | Propietaria | Solo API | MMLU-Pro 62,8; AIME25 22,7; LiveCodeBench v6 31,5 |

## Limitaciones y advertencias

- El repositorio no documenta su propio proceso de entrenamiento: no hay información sobre los datos de RL utilizados, hiperparámetros ni metodología de evaluación, lo que impide auditar el modelo.
- Los benchmarks incluidos en la model card corresponden al modelo base Qwen3-4B-Instruct-2507, no a este derivado. No hay evidencia de que el ajuste haya preservado esos resultados; de hecho, un entrenamiento por refuerzo mal calibrado puede degradar capacidades generales (olvido catastrófico).
- El modelo no dispone de modo thinking, por lo que no puede activarse razonamiento extendido en tareas que lo requieran, como problemas matemáticos complejos o depuración de código en varios pasos.
- Riesgo de alucinación inherente a los modelos de 4B parámetros: la menor capacidad de almacenamiento de conocimiento factual aumenta la probabilidad de generar información incorrecta con apariencia plausible, especialmente en dominios especializados.
- No se enumeran los idiomas soportados. Aunque la model card menciona cobertura multilingüe, no hay lista verificable ni evaluación por idioma, por lo que el comportamiento en castellano u otras lenguas distintas del inglés no está garantizado.
- El modelo base está optimizado para el modo no-thinking, lo que puede reducir su rendimiento en tareas que se beneficien de cadenas de razonamiento explícitas.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o seguridad para este repositorio ni para este ajuste concreto.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia. El enlace de licencia del modelo base apunta al fichero LICENSE de Qwen/Qwen3-4B-Instruct-2507.
- Trazabilidad limitada: 0 likes y 142 descargas indican ausencia de validación por parte de la comunidad. No se recomienda su uso en producción sin una evaluación propia exhaustiva sobre el dominio objetivo.
- La fecha de publicación y actualización registrada en los metadatos es el 18 de septiembre de 2026, con un intervalo de apenas diez minutos entre creación y última actualización, lo que sugiere una subida sin iteración posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tangyunbo/RL-fromscratch
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Framework Qwen-Agent: https://github.com/QwenLM/Qwen-Agent
- Qwen Chat: https://chat.qwen.ai
- Artículo de referencia etiquetado en el repositorio (arXiv 2505.09388): https://arxiv.org/abs/2505.09388
- Encuesta sobre agentes auto-evolutivos (encontrada en la búsqueda web, relevancia tangencial): https://github.com/XMUDeepLIT/Awesome-Self-Evolving-Agents
