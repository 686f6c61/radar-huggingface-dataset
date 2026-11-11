# zenlm/zen6-nano

## Resumen

Zen 6 Nano (2B) es un modelo de lenguaje multimodal y orientado a agentes desarrollado por Hanzo AI y Zen LM en colaboración con Zoo Labs Foundation, publicado bajo licencia Apache 2.0. Su rasgo distintivo es que sus pesos están almacenados y post-entrenados directamente en un espacio ternario de 1.58 bits (valores {-d, 0, +d}), lo que reduce drásticamente el tamaño en disco y RAM frente a un modelo denso equivalente. El repositorio ocupa 4,5 GB e incluye tanto pesos en safetensors como artefactos GGUF cuantizados en formatos propietarios (PQ2_0, PTQ1_0, Q2_0) y un proyector visual (mmproj) para entrada image-text-to-text.

El modelo parte de una arquitectura híbrida que intercala bloques de atención lineal Gated-DeltaNet (GDN) con bloques de atención completa con Grouped-Query Attention, e incorpora un proyector multimodal. Está especialmente diseñado para tool calling multi-paso, integración con MCP (Model Context Protocol) de Hanzo y flujos agenticos con recuperación de errores y abstención calibrada de herramientas. Su tamaño compacto permite ejecutarlo en CPU para CI/CD sin coste por token.

Es relevante ahora porque demuestra que el entrenamiento con cuantización consciente (QAT) en espacio ternario puede producir modelos funcionales de 2B parámetros con capacidades multimodales y agenticas, ejecutables en hardware modesto y con una licencia permisiva que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: bloques Gated-DeltaNet (GDN) de atención lineal (3x) intercalados con bloques de atención completa Grouped-Query (1x), MLP SwiGLU y proyector visual multimodal |
| Parametros totales | 4.540.042.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternario 1.58-bit: PQ2_0 (2.125 bpw), PTQ1_0 (1.750 bpw), Q2_0 (2.250 bpw); proyector visual en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (tipos GGML 142, 143 y 42), MLX 2-bit |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que alterna tres bloques de atención lineal Gated-DeltaNet por cada bloque de atención completa con Grouped-Query Attention, con MLPs SwiGLU. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de Sylvester-Walsh-Hadamard por bloques, con vectores de signo ±1 por canal embebidos en los metadatos KV del GGUF (`prism.hadamard.*`). Esta rotación de outliers elimina los valores atípicos en las activaciones, permitiendo que los pesos ternarios por grupo de 128 (`{-d, 0, +d}`) conserven precisión densa.

El post-entrenamiento se realizó directamente en el espacio de pesos ternario mediante Quantization-Aware Training (QAT) con Straight-Through Estimator (STE) y un optimizador híbrido Muon + AdamW. El modelo conserva atribución upstream a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash/ProCreations según el fichero NOTICE. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada multimodal image-text-to-text mediante proyector visual (mmproj en Q8_0 o BF16).
- Tool calling agentico multi-paso con ejecución de `<tool_call>`, síntesis de `<tool_response>`, recuperación de errores y abstención calibrada de herramientas.
- Integración con Hanzo MCP y herramientas de sistema de ficheros (`fs`), ejecución (`exec`), código (`code`), git (`git`), tests (`test`), `hanzo` y herramientas de director de motor de juegos.
- Soporte de personas de desarrollador personalizadas (por ejemplo, NPCs de Godot o extractores JSON) sin sobrecarga de system prompt.
- Compatibilidad con API OpenAI `/v1/chat/completions` a través del stack Hanzo.
- Ejecución en CPU, CUDA, Metal y ROCm mediante el fork PrismML de llama.cpp (rama `prism`); Q2_0 también en llama.cpp upstream b11556+.
- Ejecución en Apple Silicon con `mlx-lm` mediante paquetes MLX 2-bit.
- Capacidades multilingües: no disponible.

## Casos de uso

- CI/CD sin coste por token: cargar `zen6-nano-2b-PTQ1_0.gguf` (~429 MB) en runners de CPU de GitHub Actions para ejecutar tests de integración end-to-end de LLM y tool calling sin claves de API ni facturación por token.
- Agentes de desarrollo local: usar el modelo con herramientas `fs`, `exec`, `git` y `test` para leer ficheros del workspace, ejecutar tests unitarios y sintetizar respuestas a partir de los resultados, aprovechando la recuperación de errores y la abstención calibrada.
- NPCs y lógica de juego: integrar el modelo como director de motor de juegos o generador de diálogo de NPCs con personas personalizadas, ejecutándose en hardware de consumo gracias a su tamaño ternario.
- Extracción estructurada de datos: configurar el modelo como extractor JSON con una persona de desarrollador, usando tool calling para validar y estructurar la salida.
- Asistente local de escritorio o backend de juego: servir el modelo en `http://127.0.0.1:36900/v1` con `hanzo engine serve` y consumirlo desde una API compatible con OpenAI.
- Procesamiento de imágenes con texto: usar el proyector mmproj para tareas image-text-to-text como descripción de capturas o extracción de información de documentos escaneados en local.
- Despliegue en Apple Silicon: ejecutar paquetes MLX 2-bit con `mlx-lm` para prototipado en portátiles Mac sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el peso del modelo en PTQ1_0 es de aproximadamente 429 MB; PQ2_0 y Q2_0 ocupan más (el repo completo son 4,5 GB incluyendo todos los artefactos y proyectores). La VRAM necesaria para inferencia depende del contexto y del runtime, pero el modelo cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA, ROCm o Metal a través del fork PrismML de llama.cpp; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño de los artefactos ternarios; no se detallan modelos concretos.
- Opciones de despliegue: fork PrismML de llama.cpp (rama `prism`: CUDA, Metal, CPU), llama.cpp upstream b11556+ para Q2_0, `mlx-lm` para paquetes MLX 2-bit en Apple Silicon, y el stack Hanzo (`hanzo pull`, `hanzo engine serve`, `hanzo up`) con endpoint compatible con OpenAI. Los kernels nativos `hanzo-engine` (CUDA/ROCm/Metal/SIMD CPU) están en desarrollo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el modelo se basa en la familia Qwen 3.5 (tag `qwen3_5`) y en Bonsai-2 de Prism ML, pero no se aportan cifras que permitan una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zen 6 Nano (2B) | 4.540.042.240 | no disponible | Apache 2.0 | safetensors, GGUF ternario, MLX | Multimodal, agentico, tool calling MCP |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos ternarios de 1.58 bits implican una pérdida de precisión frente a un modelo denso de referencia; no se han publicado evaluaciones que cuantifiquen esa degradación.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- No se documenta la longitud de contexto, lo que dificulta planificar casos de uso con ventanas largas.
- Riesgo de alucinación inherente a modelos de este tamaño; la abstención calibrada de herramientas mitiga pero no elimina el problema.
- Sesgos conocidos: no disponible.
- El soporte de ejecución depende de un fork específico de llama.cpp (rama `prism`) para PQ2_0 y PTQ1_0; solo Q2_0 funciona en llama.cpp upstream, lo que limita la portabilidad.
- Los kernels nativos `hanzo-engine` están en progreso, por lo que el rendimiento óptimo aún no está garantizado en todas las plataformas.
- Aunque la licencia es Apache 2.0, el fichero NOTICE conserva atribuciones upstream a Qwen, Bonsai-2 y DFlash/ProCreations que deben respetarse en la redistribución.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción ni validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Fork PrismML de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Repositorio de descarga alternativo citado en la model card: https://huggingface.co/hanzoai/zen6-nano
