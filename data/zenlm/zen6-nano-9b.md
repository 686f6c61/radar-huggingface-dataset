# zenlm/zen6-nano-9b

## Resumen

Zen 6 Nano (9B) es un modelo de lenguaje multimodal y orientado a agentes desarrollado por Hanzo AI y Zen LM en colaboración con Zoo Labs Foundation, publicado bajo licencia Apache 2.0. Su rasgo diferencial es el uso de pesos ternarios de 1,58 bits entrenados nativamente mediante Quantization-Aware Training (QAT) con Straight-Through Estimator sobre una base ortogonal Sylvester-Walsh-Hadamard, lo que permite ejecutar el modelo con huellas de disco y memoria muy reducidas (entre 2,00 y 2,68 GB según el artefacto GGUF) sin perder la precisión densa del modelo original.

La arquitectura combina bloques de atención lineal Gated-DeltaNet con bloques de atención completa agrupada (GQA) en una proporción 3:1, e incorpora un proyector visual multimodal (`mmproj`) para entrada imagen-texto. El modelo está especialmente diseñado para tool calling multi-paso mediante MCP (Hanzo MCP), con soporte para herramientas de sistema de ficheros, ejecución, código, git, tests y motores de juego, además de mecanismos de recuperación de errores y abstención calibrada.

Es relevante ahora porque propone un flujo de integración continua sin coste por token: el artefacto `zen6-nano-2b-PTQ1_0.gguf` (~429 MB) puede servirse en runners de CPU para tests de integración de LLM y tool calling sin claves de API. No obstante, la model card presenta inconsistencias notables entre el nombre comercial (9B) y el recuento real de parámetros en safetensors (1.470.621.184), que conviene tener en cuenta al evaluar el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated-DeltaNet (atención lineal) intercalada 3x con atención completa GQA 1x, MLP SwiGLU y proyector visual multimodal (`mmproj`) |
| Parámetros totales | 1.470.621.184 según safetensors (la model card lo denomina "9B"; discrepancia no resuelta) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria 1,58-bit: `PQ2_0` (2,125 bpw), `PTQ1_0` (1,750 bpw), `Q2_0` (2,250 bpw); proyector visual en `Q8_0` y `BF16`; draft `DFlash2` en `Q8_0` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42); sin safetensors publicados en el repo |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que intercala tres bloques de atención lineal Gated-DeltaNet (GDN) por cada bloque de atención completa con Grouped-Query Attention, con MLPs SwiGLU. La innovación central es el almacenamiento de pesos lineales y embeddings de tokens en una base ortonormal de bloques Sylvester-Walsh-Hadamard, con vectores de signo ±1 por canal embebidos en los metadatos KV del GGUF (`prism.hadamard.*`). Esta rotación elimina los valores atípicos en las activaciones, permitiendo que los pesos ternarios `{-d, 0, +d}` con grupo 128 conserven la precisión densa.

El post-entrenamiento se realiza directamente en el espacio de pesos ternario mediante QAT con Straight-Through Estimator y un optimizador híbrido Muon + AdamW. La model card menciona atribución a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash/ProCreations en el fichero NOTICE, lo que sugiere que el modelo parte de una base Qwen y de técnicas de destilación o proyección de terceros. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

El ecosistema de inferencia incluye `hanzo-engine` (CUDA, Metal, ROCm, Vulkan y CPU) con Multi-Token Prediction, DFlash2 (draft especulativo por difusión de bloques), búsqueda por autómata de sufijos `SA_SPEC` y `GuardedDraft`. También es compatible con llama.cpp (formato `Q2_0` en upstream b11556+) y con `mlx-lm` para los packs de 2 bits en Apple Silicon.

## Capacidades

- Generación de texto conversacional multi-turno con identidad de pesos nativa, sin sobrecarga de system prompt, respetando personas de desarrollador (por ejemplo, NPCs de Godot o extractores JSON).
- Tool calling y function calling multi-paso con ejecución de `<tool_call>`, síntesis de `<tool_response>`, recuperación de errores y abstención calibrada cuando la herramienta no es apropiada.
- Integración con Hanzo MCP para herramientas de sistema de ficheros (`fs`), ejecución (`exec`), código (`code`), git (`git`), tests (`test`), `hanzo` y director de motores de juego.
- Capacidad multimodal de entrada imagen-texto mediante el proyector visual `mmproj` (pipeline `image-text-to-text`).
- Razonamiento agéntico multi-paso orientado a tareas de ingeniería de software y automatización de flujos.
- Compatibilidad con la API OpenAI `/v1/chat/completions` a través de `hanzo engine serve`.
- Decodificación especulativa nativa mediante MTP y DFlash2 para acelerar la generación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de CI/CD sin coste por token: servir `zen6-nano-2b-PTQ1_0.gguf` (~429 MB) en runners de CPU con `llama-server -ngl 0` para ejecutar tests de integración de LLM y tool calling de extremo a extremo sin claves de API ni facturación por token.
- Agente de ingeniería de software: el modelo puede leer `Cargo.toml`, listar ficheros del workspace y lanzar los tests unitarios mediante las herramientas `fs`, `exec` y `test`, encadenando varios pasos con recuperación de errores.
- Asistente de revisión de código en pipelines: integrado vía API compatible con OpenAI, puede invocar `git` para inspeccionar diffs y `code` para proponer parches dentro de un flujo automatizado de pull requests.
- NPCs y lógica de diálogo en videojuegos: la identidad de pesos nativa y el respeto a personas de desarrollador permiten definir personajes (por ejemplo, NPCs de Godot) sin envoltorios de system prompt que consuman contexto.
- Extracción estructurada de información: uso como extractor JSON con persona definida por el desarrollador, adecuado para pipelines de parsing de documentos o formularios.
- Despliegue en hardware de gama baja: con 2,00-2,56 GB por artefacto, el modelo cabe en equipos sin GPU dedicada o en Apple Silicon vía `mlx-lm`, habilitando prototipos locales de agentes.
- Procesamiento de documentos con imagen: gracias al proyector `mmproj`, puede recibir imágenes junto a texto para tareas de descripción o extracción multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0-2,6 GB para los pesos ternarios principales según artefacto (`PTQ1_0` 2,00 GB, `PQ2_0` 2,42 GB, `Q2_0` 2,56 GB), más 0,62-0,92 GB si se carga el proyector visual y 1,57 GB adicionales para el draft DFlash2.
- GPU recomendadas: no se especifican modelos concretos; `hanzo-engine` soporta CUDA, Metal, ROCm y Vulkan, y llama.cpp cubre `Q2_0` en upstream b11556+.
- Cabe en GPU de consumo: sí, por el tamaño de los artefactos (2-2,7 GB); no se detallan modelos concretos de RTX o similares.
- Opciones de despliegue: `hanzo-engine` (con MTP, DFlash2, `SA_SPEC` y `GuardedDraft`), llama.cpp/`llama-server`, `mlx-lm` en Apple Silicon y servidor compatible con OpenAI en `http://127.0.0.1:36900/v1`.
- Latencia y throughput: no disponibles; la model card solo indica que `PQ2_0` es el formato más rápido para SIMD, `dp4a` en CUDA, ROCm y Metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Zen 6 Nano (9B) | 1.470.621.184 (safetensors) | No disponible | Ternaria 1,58-bit (GGUF) | Apache 2.0 | Multimodal, tool calling MCP, QAT en espacio ternario |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de modelos comparables en la información recibida |

No se dispone de información sobre modelos comparables de la misma categoría (ternarios multimodales orientados a agentes) en la documentación facilitada.

## Limitaciones y advertencias

- Discrepancia de tamaño: la model card denomina al modelo "9B" y "9B ternary tier", pero el recuento real en safetensors es de 1.470.621.184 parámetros. Esta inconsistencia debe verificarse antes de asumir capacidades asociadas a un modelo de 9B.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe, lo que impide garantizar calidad fuera del inglés.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de alucinación; la abstención calibrada en tool calling se menciona cualitativamente, sin métricas.
- Sesgos: no se publica ninguna evaluación de sesgos ni de seguridad.
- Dependencia de ecosistema propietario: funciones clave (MTP, DFlash2, `SA_SPEC`, `GuardedDraft`) requieren `hanzo-engine`; en llama.cpp solo se garantiza `Q2_0` en versiones recientes.
- Compatibilidad de formatos limitada: los tipos GGML 142 y 143 (`PQ2_0`, `PTQ1_0`) son específicos del ecosistema Hanzo y no están soportados por el upstream general de llama.cpp.
- Licencia Apache 2.0 permite uso comercial, pero el fichero NOTICE impone obligaciones de atribución a Qwen, Prism ML y DFlash/ProCreations que deben conservarse.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenlm/zen6-nano-9b
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Repositorio de hanzo-engine: https://github.com/hanzoai/engine
