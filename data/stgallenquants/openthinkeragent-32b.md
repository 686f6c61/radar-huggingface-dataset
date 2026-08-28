# stgallenquants/OpenThinkerAgent-32B

## Resumen

OpenThinkerAgent-32B es un modelo de lenguaje de 32 000 millones de parámetros, post-entrenado mediante fine-tuning completo (full-parameter SFT) sobre el modelo base Qwen/Qwen3-32B. Lo desarrolla el equipo OpenThoughts-Agent, una iniciativa open source que busca curar datasets de alta calidad para entrenar modelos agénticos. El modelo está diseñado específicamente para tareas de agente: uso de terminal, generación de código, ingeniería de software, tool calling y razonamiento multi-paso.

El modelo se entrena sobre el dataset OpenThoughts-Agent-SFT-100K, compuesto por 100 000 ejemplos de (tarea, trayectoria de agente) generados por el modelo profesor GLM-4.7-AWQ en el harness terminus-2, filtrando trayectorias con al menos 5 turnos de modelo. Según los datos del autor, OpenThinkerAgent-32B logra una media del 44,8 % en siete benchmarks agénticos, superando a Qwen3-32B base en tareas como SWE-Bench-Verified (54,0 frente a 26,7) y Terminal-Bench 2.0 (26,2 frente a 7,5). Es relevante ahora porque demuestra que con datos abiertos y un pipeline de entrenamiento reproducible se pueden obtener modelos agénticos competitivos a escala 32B, sin depender de datasets propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-32B base), decoder-only |
| Parametros totales | 32 000 millones (32B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 40 000 tokens (según LLM Explorer; el cutoff de entrenamiento es 32 768) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bf16) |
| Idiomas soportados | no disponible (heredados de Qwen3-32B, multilingüe, sin especificar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 65,5 GB, precisión bf16) |

## Arquitectura y entrenamiento

OpenThinkerAgent-32B parte de la arquitectura transformer decoder-only de Qwen3-32B, un modelo denso con 32B parámetros y ventana de contexto de 40K tokens. El entrenamiento consiste en un fine-tuning completo (todos los parámetros) mediante SFT supervisado sobre el dataset OpenThoughts-Agent-SFT-100K. Este dataset contiene pares (tarea, trayectoria de agente) generados por el modelo profesor GLM-4.7-AWQ ejecutado en el harness terminus-2, que simula entornos reales de terminal, edición de código y llamadas a herramientas. Se seleccionaron las 4 fuentes de tareas principales (SWE-Smith, StackExchange-SuperUser, StackExchange-Tezos con aumentación sintética e IssueTasks) y se filtraron las trayectorias con al menos 5 turnos de modelo para asegurar suficiente profundidad de razonamiento.

Los hiperparámetros de entrenamiento son: learning rate 4e-5, scheduler coseno con warmup del 10 %, batch global de 96, 5 épocas, cutoff de longitud 32 768 tokens y precisión bf16 con DeepSpeed ZeRO-3. No se menciona el uso de RLHF o DPO; el entrenamiento es exclusivamente SFT. La innovación principal no está en la arquitectura (que es la de Qwen3) sino en la receta de datos: trayectorias de agente reales de alta calidad, con filtrado por longitud y diversidad de fuentes, lo que permite al modelo aprender a interactuar con entornos externos de forma efectiva.

## Capacidades

- Generación de texto y razonamiento multi-paso: hereda las capacidades lingüísticas y de razonamiento de Qwen3-32B, mejoradas para tareas agénticas.
- Uso de terminal: ejecuta comandos, interpreta salidas y navega por sistemas de archivos (validado en Terminal-Bench 2.0).
- Ingeniería de software: resolución de issues reales, edición de código y generación de parches (SWE-Bench-Verified 54,0).
- Tool calling / function calling: soporta llamadas a herramientas y APIs (BFCL-Parity 85,9).
- Razonamiento agéntico multi-turno: mantiene conversaciones largas con múltiples pasos de razonamiento y acciones (filtrado a ≥5 turnos en entrenamiento).
- Capacidades multilingües: no especificadas para este fine-tuning, pero el modelo base Qwen3-32B es multilingüe; el modelo puede manejar código y texto en varios idiomas.
- Capacidades especiales: no incluye visión ni audio; es exclusivamente texto. No se documenta un modo "thinking" explícito, pero el entrenamiento con trayectorias largas sugiere razonamiento encadenado.

## Casos de uso

- Automatización de tareas de mantenimiento de código: el modelo puede recibir un issue de GitHub, analizar el repositorio, generar un parche y ejecutar pruebas, gracias a su rendimiento en SWE-Bench-Verified (54,0). Se integraría en un pipeline de CI/CD con un agente que llame a herramientas de git y ejecución de tests.
- Asistente de terminal para administración de sistemas: con su capacidad en Terminal-Bench 2.0 (26,2), puede interpretar comandos, diagnosticar errores y sugerir o ejecutar secuencias de comandos en entornos controlados, útil para operaciones de DevOps.
- Soporte técnico y resolución de incidencias: al estar entrenado con StackExchange-SuperUser y Tezos, puede responder preguntas técnicas complejas con pasos de diagnóstico y solución, integrándose en chatbots de atención al cliente con contexto largo (40K tokens).
- Generación y refactorización de código en producción: con Aider-Polyglot (32,4) y BFCL-Parity (85,9), puede realizar refactorizaciones multi-archivo y llamar a funciones de bibliotecas específicas, integrándose en IDEs o asistentes de desarrollo.
- Agente de finanzas y análisis de datos: el benchmark FinanceAgent-Terminal (44,0) indica capacidad para ejecutar análisis financieros en terminal, procesar datos y generar informes, útil en banca y consultoría.
- Investigación y búsqueda de información: con GAIA-127 (23,6), puede combinar búsqueda web, lectura de documentos y razonamiento para responder preguntas complejas que requieren múltiples fuentes, aplicable en asistentes de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluados en el harness terminus-2, pass@1, media de 3 ejecuciones estocásticas):

| Modelo | SWE-Bench-Verified-100 | OpenThoughts-TBLite | Terminal-Bench 2.0 |
| --- | --- | --- | --- |
| Qwen/Qwen3-32B | 26,7 | 13,7 | 7,5 |
| **OpenThinkerAgent-32B** | **55,7** | **41,3** | **26,2** |

Suite completa de 7 benchmarks (mejor harness por benchmark):

| Benchmark | Accuracy |
| --- | --- |
| SWE-Bench-Verified | 54,0 |
| Terminal-Bench 2.0 | 26,2 |
| Aider-Polyglot | 32,4 |
| BFCL-Parity | 85,9 |
| MedAgentBench | 47,8 |
| GAIA-127 | 23,6 |
| FinanceAgent-Terminal | 44,0 |
| **Media (7)** | **44,8** |

No se han publicado resultados en el model-index oficial de HuggingFace (results: []), pero la model card del autor incluye estas cifras. No hay comparación con otros modelos de la misma escala en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~65,8 GB (según LLM Explorer), lo que requiere una GPU profesional como A100 80GB, H100 80GB o 2× RTX 4090 (24GB cada una) con tensor parallelism.
- Con cuantización a 8 bits (no disponible oficialmente, pero posible con herramientas como llama.cpp o vLLM), la VRAM estimada sería ~35 GB, permitiendo una RTX 4090 o A6000.
- Con cuantización a 4 bits (GGUF Q4_K_M), la VRAM estimada sería ~20 GB, ejecutable en una RTX 3090/4090 o incluso en una RTX 4070 Ti con contexto reducido.
- Opciones de despliegue: vLLM (soporta bf16 y cuantizaciones AWQ/GPTQ si se generan), TGI (Text Generation Inference), llama.cpp para GGUF, Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles. Para 32B en bf16 en una A100, se espera un throughput de ~20-40 tokens/s con batch de 1; con vLLM y batching dinámico puede superar los 100 tokens/s en producción.
- El modelo es compatible con text-generation-inference y endpoints (según tags de HuggingFace).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-Bench-Verified | Terminal-Bench 2.0 | Licencia |
| --- | --- | --- | --- | --- | --- |
| **OpenThinkerAgent-32B** | 32B | 40K | 54,0 | 26,2 | Apache-2.0 |
| Qwen3-32B (base) | 32B | 40K | 26,7 | 7,5 | Apache-2.0 |
| Otros modelos agénticos 32B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con Qwen3-32B muestra una mejora sustancial en tareas agénticas gracias al SFT específico. No se dispone de datos de otros modelos de 32B con enfoque agéntico (como DeepSeek-Coder-V2 o CodeQwen) en los mismos benchmarks para una comparación directa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han evaluado específicamente; al ser un fine-tuning de Qwen3-32B, puede heredar sesgos del modelo base y del dataset de entrenamiento (StackExchange, issues de GitHub), que pueden reflejar opiniones o errores de la comunidad.
- Riesgo de alucinación en entornos agénticos: el modelo puede generar comandos o código incorrectos que parezcan plausibles; en tareas de terminal o edición de archivos, un error puede tener efectos destructivos si no se ejecuta en un entorno aislado.
- Limitaciones de contexto: el cutoff de entrenamiento es de 32 768 tokens, aunque el contexto del modelo base es de 40K; para tareas con contexto más largo, el rendimiento puede degradarse.
- Idiomas: no se especifican los idiomas soportados; aunque Qwen3 es multilingüe, el dataset de entrenamiento está mayoritariamente en inglés (StackExchange, issues), por lo que el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y las condiciones de la licencia.
- Dependencia del harness: los benchmarks se evaluaron en terminus-2; los resultados pueden variar en otros entornos o con diferentes configuraciones de herramientas.
- No incluye visión ni audio: solo procesa texto, lo que limita su uso en tareas multimodales.

## Enlaces

- Modelo en HuggingFace (autor original): https://huggingface.co/open-thoughts/OpenThinkerAgent-32B
- Modelo en HuggingFace (este repo): https://huggingface.co/stgallenquants/OpenThinkerAgent-32B
- Página del proyecto OpenThoughts-Agent: https://www.openthoughts.ai/blog/agent
- Repositorio de código: https://github.com/open-thoughts/OpenThoughts-Agent
- Colección de modelos OpenThinker-Agent: https://huggingface.co/collections/open-thoughts/openthinker-agent
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-SFT-100K
- Artículo del IFML Institute sobre OpenThoughts: https://ifml.institute/node/602
- LLM Explorer (ficha con VRAM y contexto): https://llm-explorer.com/model/open-thoughts%2FOpenThinkerAgent-32B,2nDdslgtsCeMMJU64ldn47
