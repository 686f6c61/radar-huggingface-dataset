# zenlm/zen6-gguf

## Resumen

Zen 6 (27B) es un modelo de lenguaje multimodal y agéntico de pesos abiertos publicado por Hanzo AI y Zen LM en colaboración con Zoo Labs Foundation. Su rasgo más distintivo es que se distribuye en formato ternario de 1,58 bits (pesos restringidos al conjunto {-d, 0, +d}), lo que permite empaquetar un modelo de 27 000 millones de parámetros en ficheros GGUF de entre 5,95 GB y 7,63 GB. El repositorio `zenlm/zen6-gguf` contiene los artefactos de inferencia en formato GGUF junto con el proyector visual multimodal y un borrador especulativo para decodificación acelerada.

El modelo emplea una columna vertebral híbrida que intercala bloques de atención lineal Gated-DeltaNet (GDN) con bloques de atención completa con Grouped-Query Attention, complementados por MLPs SwiGLU y un proyector de visión. El post-entrenamiento se realiza directamente en el espacio de pesos ternario mediante Quantization-Aware Training con Straight-Through Estimator y optimizadores híbridos Muon + AdamW, una aproximación poco habitual que busca preservar la precisión del modelo denso original dentro de la representación ternaria.

La relevancia actual del modelo reside en su orientación a despliegues con recursos limitados: soporta tool calling multi-paso con el protocolo MCP de Hanzo, ejecución en CPU, CUDA, Metal, ROCm y Vulkan a través de `hanzo-engine`, y compatibilidad con llama.cpp para el formato `Q2_0`. La licencia Apache 2.0 facilita su adopción comercial, aunque la información pública disponible sobre benchmarks y evaluación independiente es todavía muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal Gated-DeltaNet (3 bloques) intercalada con atención completa GQA (1 bloque), MLPs SwiGLU, proyector visual multimodal |
| Parametros totales | 27B (según model card); el campo de safetensors del repo indica 1.924.404.480, dato inconsistente con la denominación 27B |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw); además Q8_0 para el draft DFlash2 y Q8_0/BF16 para el proyector multimodal |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42), más mmproj en Q8_0 y BF16 |

## Arquitectura y entrenamiento

La arquitectura combina bloques de atención lineal Gated-DeltaNet con bloques de atención completa agrupada en una proporción 3:1, usando MLPs SwiGLU. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de Sylvester-Walsh-Hadamard, con vectores de signo por canal embebidos en los metadatos KV del GGUF bajo el prefijo `prism.hadamard.*`. Esta rotación de outliers busca eliminar los valores atípicos en las activaciones para que los pesos ternarios agrupados en bloques de 128 (o 64 en `Q2_0`) conserven la precisión del modelo denso.

El post-entrenamiento se realiza en el propio espacio de pesos ternario mediante QAT con Straight-Through Estimator y optimizadores híbridos Muon + AdamW. La model card menciona atribución a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash (ProCreations) en el fichero NOTICE, lo que sugiere que la base arquitectónica deriva de Qwen 3.5, aunque no se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados. Tampoco se especifica si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional con identidad de pesos nativa y respeto a personas de desarrollador personalizadas.
- Tool calling multi-paso con ejecución de `<tool_call>`, síntesis de `<tool_response>`, recuperación de errores y abstención calibrada de herramientas.
- Integración con el protocolo MCP de Hanzo sobre herramientas de sistema de ficheros, ejecución, código, git, tests y motores de juego.
- Procesamiento multimodal de imagen y texto mediante el proyector `mmproj`.
- Razonamiento agéntico multi-paso orientado a tareas de ingeniería y automatización.
- Decodificación especulativa con el borrador DFlash2 (block-diffusion) y búsqueda por autómata de sufijos `SA_SPEC`.
- Ejecución en CPU, CUDA, Metal, ROCm y Vulkan mediante `hanzo-engine`, y en llama.cpp para el formato `Q2_0`.
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de ingeniería en CI/CD: el modelo puede leer ficheros de configuración, ejecutar tests y sintetizar resultados dentro de un pipeline, con la ventaja de que la variante nano de 2B (429 MB) permite pruebas de integración en runners de CPU sin coste por token.
- Asistentes de desarrollo integrados en el IDE: gracias al tool calling sobre `fs`, `git` y `exec`, puede inspeccionar el workspace, aplicar cambios y verificar el estado del repositorio en pasos encadenados.
- Backends de videojuegos y NPCs: la model card menciona herramientas de dirección de motor de juego y personas personalizadas, lo que permite generar diálogo reactivo y comportamiento de NPCs con contexto persistente.
- Extracción estructurada de información: el modelo puede actuar como extractor JSON respetando un esquema definido por el desarrollador, útil en pipelines de ingesta documental.
- Procesamiento de documentos con imágenes: el proyector multimodal permite responder preguntas sobre capturas, diagramas o formularios escaneados en un flujo image-text-to-text.
- Despliegue en hardware de gama baja: con 5,95 GB en `PTQ1_0` o 7,63 GB en `Q2_0`, es viable en GPUs de consumo con 8-12 GB de VRAM o incluso en CPU, lo que facilita prototipado local sin infraestructura dedicada.
- Agentes autónomos con recuperación de errores: la abstención calibrada de herramientas y la síntesis de respuestas de herramienta permiten construir bucles agénticos que no fallen ante llamadas inválidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB para `PTQ1_0`, 7,2-7,6 GB para `PQ2_0` y `Q2_0`, más 0,6-0,9 GB adicionales si se carga el proyector multimodal.
- El borrador DFlash2 añade 2,06 GB si se usa decodificación especulativa.
- GPUs recomendadas: no se especifican modelos concretos; la model card menciona soporte CUDA, ROCm, Metal y Vulkan, lo que cubre desde GPUs de consumo hasta aceleradores de datacenter.
- Cabe en GPUs de consumo con 8-12 GB de VRAM en cualquiera de los tres formatos ternarios; también es ejecutable en CPU.
- Opciones de despliegue: `hanzo-engine` (nativo), llama.cpp (versión upstream b11556 o superior para `Q2_0`), `mlx-lm` en Apple Silicon para packs de 2 bits, y servidor compatible con OpenAI en el puerto 36900.
- Latencia y throughput: no disponibles; la model card afirma que `PQ2_0` ofrece la decodificación más rápida en GPU/CPU y que DFlash2 proporciona aproximadamente 2x de aceleración en decodificación, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zen 6 (27B) | 27B (según model card) | no disponible | Ternaria 1,58 bits (GGUF) | Apache 2.0 | GGUF en Hugging Face |
| Qwen 3.5 (base atribuida) | no disponible | no disponible | Múltiples (GGUF, safetensors) | no disponible en esta ficha | Hugging Face |
| Bonsai-2 (Prism ML) | no disponible | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros declarados, formato y licencia.

## Limitaciones y advertencias

- Existe una discrepancia entre los 27B declarados en la model card y los 1.924.404.480 parámetros del campo de safetensors del repositorio; conviene verificar el tamaño real antes de dimensionar infraestructura.
- No se han publicado resultados de benchmarks ni evaluaciones independientes, por lo que el rendimiento real frente a modelos densos equivalentes no está verificado.
- La cuantización ternaria agresiva (1,58 bits) implica una pérdida de precisión respecto al modelo denso original que no se cuantifica en la documentación.
- La model card no detalla la composición del dataset de entrenamiento, los idiomas soportados ni el proceso de alineación, lo que dificulta evaluar sesgos y riesgos de alucinación.
- El modelo está orientado a tool calling y agentes; en usos puramente generativos sin herramientas puede no ser la opción óptima.
- Aunque la licencia es Apache 2.0, el fichero NOTICE impone obligaciones de atribución a Qwen, Prism ML y ProCreations que deben respetarse en redistribuciones.
- El ecosistema de ejecución principal (`hanzo-engine`) es específico del fabricante; la compatibilidad con llama.cpp se limita al formato `Q2_0` en versiones recientes.
- No hay información sobre latencia, throughput ni comportamiento en contextos largos, factores críticos para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zenlm/zen6-gguf
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Motor de inferencia Hanzo: https://github.com/hanzoai/engine
