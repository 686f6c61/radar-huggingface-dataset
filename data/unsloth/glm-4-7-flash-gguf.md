# unsloth/GLM-4.7-Flash-GGUF

## Resumen

GLM-4.7-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Z.ai (Zhipu AI) y publicado en abierto bajo licencia MIT. Con 29.943 millones de parámetros totales y aproximadamente 3.000 millones activos por token (30B-A3B), se posiciona como la propuesta de referencia dentro de la clase de 30B para despliegue ligero, equilibrando calidad de razonamiento y eficiencia computacional. El repositorio analizado aquí es la cuantización GGUF publicada por Unsloth, que aplica su metodología Dynamic 2.0 con calibración imatrix para preservar la precisión en bits bajos.

El modelo está orientado a tareas agénticas: razonamiento multi-paso, uso de herramientas (tool calling), generación de código y navegación web. Los resultados publicados en su model card muestran mejoras notables frente a alternativas del mismo rango en benchmarks como SWE-bench Verified (59,2), τ²-Bench (79,5) y BrowseComp (42,8), lo que lo convierte en una opción relevante para pipelines de agentes que necesitan ejecutarse en hardware modesto.

La relevancia actual del modelo radica en su combinación de licencia permisiva (MIT), soporte en los principales frameworks de inferencia (vLLM, SGLang, llama.cpp) y un tamaño que permite su despliegue en una sola GPU de 80 GB o en configuraciones multi-GPU consumer con cuantización. La versión GGUF de Unsloth facilita además la ejecución local en estaciones de trabajo sin necesidad de infraestructura de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 30B-A3B |
| Parametros totales | 29.943.393.920 |
| Parametros activos | Aproximadamente 3.000 millones por token (A3B) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0, con imatrix); niveles concretos no detallados en la informacion |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de cuantizacion); safetensors en el modelo base |
| Modelo base | zai-org/GLM-4.7-Flash |
| Tamano del repositorio | 1710.0 GB |
| Framework de inferencia | transformers, vLLM, SGLang, llama.cpp |
| Fecha de publicacion | 2026-01-20 (actualizado 2026-02-12) |

## Arquitectura y entrenamiento

GLM-4.7-Flash emplea una arquitectura Transformer con capas Mixture-of-Experts, en la que cada token activa aproximadamente 3.000 millones de parámetros de un total cercano a 30.000 millones. Este diseño permite reducir el coste computacional por token manteniendo una capacidad de representación propia de un modelo denso mucho mayor. El modelo base incluye soporte para decodificación especulativa mediante MTP (Multi-Token Prediction) en vLLM y EAGLE en SGLang, lo que acelera la generación en producción.

Los detalles concretos sobre el número de tokens de entrenamiento, la composición del dataset, las fases de RLHF/DPO y las innovaciones específicas de atención no están disponibles en la información proporcionada. El informe técnico citado (arXiv:2508.06471) corresponde a GLM-4.5 y se referencia como base metodológica de la familia, pero no se detallan aquí los pormenores del entrenamiento de la variante 4.7-Flash. La model card menciona que el modelo soporta un modo de razonamiento (reasoning parser `glm45`) y un parser específico de tool calling (`glm47`), lo que sugiere un entrenamiento orientado a agentes y uso de herramientas.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento matemático de competición (AIME 25: 91,6) y razonamiento científico (GPQA: 75,2).
- Generación y edición de código en contextos de repositorio (SWE-bench Verified: 59,2; LiveCodeBench v6: 64,0).
- Tool calling / function calling con parser dedicado en vLLM y SGLang (`--tool-call-parser glm47`).
- Razonamiento multi-paso y comportamiento agéntico (τ²-Bench: 79,5).
- Navegación web y búsqueda agéntica (BrowseComp: 42,8).
- Modo de razonamiento explícito, gestionado mediante `--reasoning-parser glm45`.
- Capacidad de decodificación especulativa para acelerar inferencia (MTP en vLLM, EAGLE en SGLang).
- Soporte de fine-tuning con Unsloth (notebook oficial disponible).
- No se ha documentado soporte de visión, audio ni otras modalidades en la información proporcionada.

## Casos de uso

- Agentes de resolución de incidencias en repositorios: el modelo puede recibir un issue, explorar el código, proponer un parche y validarlo, aprovechando su rendimiento en SWE-bench Verified (59,2) y su soporte de tool calling para invocar herramientas de build y test.
- Automatización de soporte técnico multi-turno: con modo de razonamiento y ventana de contexto amplia (longitud no especificada en la información), puede gestionar conversaciones con historial y derivar a herramientas internas mediante function calling.
- Asistentes de código en IDE: integrable vía llama.cpp u Ollama en estaciones de trabajo, con cuantización GGUF que reduce los requisitos de VRAM y permite autocompletado y refactorización local.
- Pipelines de CI/CD con agentes de revisión: el modelo puede analizar diffs, ejecutar linters y tests a través de tool calling, y comentar resultados en pull requests, con latencia controlada gracias a la decodificación especulativa.
- Investigación y análisis documental en chino e inglés: su bilingüismo nativo permite resumir, extraer y comparar documentación técnica en ambos idiomas sin traducción intermedia.
- Búsqueda web agéntica: con un parser de herramientas adecuado, puede orquestar consultas, leer resultados y sintetizar respuestas, apoyándose en su resultado en BrowseComp (42,8).
- Evaluación de razonamiento matemático y científico: útil como modelo de referencia en entornos de investigación que necesitan un 30B-A3B con licencia MIT para reproducir experimentos.
- Fine-tuning específico de dominio: la disponibilidad de GGUF y el soporte de Unsloth permiten adaptar el modelo a verticales concretas (legal, sanitario, financiero) con recursos moderados.

## Benchmarks y rendimiento

| Benchmark | GLM-4.7-Flash | Qwen3-30B-A3B-Thinking-2507 | GPT-OSS-20B |
|---|---|---|---|
| AIME 25 | 91,6 | 85,0 | 91,7 |
| GPQA | 75,2 | 73,4 | 71,5 |
| LCB v6 | 64,0 | 66,0 | 61,0 |
| HLE | 14,4 | 9,8 | 10,9 |
| SWE-bench Verified | 59,2 | 22,0 | 34,0 |
| τ²-Bench | 79,5 | 49,0 | 47,7 |
| BrowseComp | 42,8 | 2,29 | 28,3 |

Los datos proceden de la model card oficial del modelo base. No se han publicado en la información disponible resultados específicos de la cuantización GGUF de Unsloth frente a los pesos originales.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 60 GB para los pesos (29,9B parámetros × 2 bytes), más overhead de KV cache y activaciones; requiere una GPU de 80 GB (A100, H100) o sharding multi-GPU.
- VRAM estimada en cuantización GGUF de 8 bits: en torno a 32-35 GB, apta para una RTX 5090 (32 GB) o A6000 (48 GB) con margen ajustado.
- VRAM estimada en cuantización GGUF de 4 bits: aproximadamente 18-20 GB, cabe en RTX 4090 (24 GB), RTX 4080 Super (16 GB) con contexto reducido, o Mac con memoria unificada de 32 GB o más.
- VRAM estimada en cuantización GGUF de 2-3 bits: en torno a 12-14 GB, viable en GPUs consumer de gama alta con 16 GB.
- GPU recomendadas: A100 80GB o H100 para bf16 y producción; RTX 4090, RTX 5090 o A6000 para cuantizaciones de 4-8 bits; Apple Silicon con memoria unificada para GGUF de 4 bits.
- Opciones de despliegue: vLLM (con `--speculative-config.method mtp`), SGLang (con EAGLE), llama.cpp (con `--min-p 0.01` y repeat penalty desactivado), Ollama y transformers.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa (MTP/EAGLE) está pensada para mejorar el throughput en producción, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | SWE-bench Verified | τ²-Bench |
|---|---|---|---|---|---|---|
| GLM-4.7-Flash | 29,9B | ~3B | No disponible | MIT | 59,2 | 79,5 |
| Qwen3-30B-A3B-Thinking-2507 | 30B (MoE) | ~3B | No disponible | No disponible en la informacion | 22,0 | 49,0 |
| GPT-OSS-20B | 20B | No disponible | No disponible | No disponible en la informacion | 34,0 | 47,7 |

Frente a Qwen3-30B-A3B-Thinking-2507, GLM-4.7-Flash mejora de forma sustancial en tareas agénticas y de código (SWE-bench +37,2 puntos, τ²-Bench +30,5 puntos), aunque queda ligeramente por debajo en LiveCodeBench v6 (64,0 frente a 66,0). Frente a GPT-OSS-20B, la ventaja es clara en SWE-bench (+25,2) y τ²-Bench (+31,8), con resultados equiparables en AIME 25. Los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está validado y probablemente sea inferior.
- Longitud de contexto: no se especifica en la información disponible, lo que impide garantizar casos de uso con documentos muy largos sin verificación previa.
- Alucinación: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados; se recomienda validación externa en producción.
- Sesgos: no se han documentado evaluaciones de sesgo en la información proporcionada; al entrenarse principalmente con datos en inglés y chino, puede reflejar sesgos culturales de esas fuentes.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de entrenamiento originales, no detalladas aquí.
- Cuantización GGUF: las versiones de 2-3 bits pueden degradar el razonamiento y el tool calling; para agentes en producción se recomienda 4 bits o superior.
- Configuración de inferencia: la model card advierte de que con llama.cpp hay que desactivar el repeat penalty y ajustar `--min-p 0.01`; ignorar esto produce salidas deficientes o bucles.
- Bug histórico en llama.cpp: la versión inicial de los GGUF (antes del 21 de enero de 2026) generaba bucles; es imprescindible descargar la versión actualizada.
- Madurez del ecosistema: vLLM y SGLang solo soportan el modelo en sus ramas principales, lo que implica usar versiones nocturnas y asumir posible inestabilidad.
- No se ha documentado soporte multimodal (visión, audio) ni capacidades de contexto extendido más allá de lo indicado por el modelo base.

## Enlaces

- Repositorio HuggingFace (GGUF de Unsloth): https://huggingface.co/unsloth/GLM-4.7-Flash-GGUF
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-4.7-Flash
- Guia de Unsloth para GLM-4.7-Flash: https://unsloth.ai/docs/models/glm-4.7-flash
- Documentacion de Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Discord de Unsloth: https://discord.gg/unsloth
- Blog tecnico de GLM-4.7: https://z.ai/blog/glm-4.7
- Informe tecnico GLM-4.5 (arXiv:2508.06471): https://arxiv.org/abs/2508.06471
- Documentacion de la API de Z.ai para GLM-4.7: https://docs.z.ai/guides/llm/glm-4.7
- Chat de Z.ai: https://chat.z.ai
- Repositorio oficial de GLM-4.5 (instrucciones de despliegue): https://github.com/zai-org/GLM-4.5
- Discord de la comunidad GLM: https://discord.gg/QR7SARHRxK
- Paquete Unsloth en PyPI: https://pypi.org/project/unsloth/
- Releases de Unsloth: https://github.com/unslothai/unsloth/releases
- Documentacion de Unsloth: https://unsloth.ai/docs/fr
