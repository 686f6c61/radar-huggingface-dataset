# zenlm/zen6-nano-2b

## Resumen

Zen 6 Nano (2B) es un modelo de lenguaje multimodal y orientado a agentes, publicado por zenlm (Hanzo AI y Zen LM, en colaboración con Zoo Labs Foundation) bajo licencia Apache 2.0. Su rasgo diferencial es que sus pesos están almacenados de forma nativa en espacio ternario de 1,58 bits, tras un post-entrenamiento con Quantization-Aware Training (QAT) directamente sobre ese espacio de pesos mediante Straight-Through Estimator y un optimizador híbrido Muon + AdamW. El resultado es un modelo de 2.213.649.216 parámetros que ocupa apenas unos cientos de megabytes en disco en su formato más compacto.

La arquitectura es híbrida: intercala bloques de atención lineal Gated-DeltaNet con bloques de atención completa con Grouped-Query Attention, y añade un proyector visual (`mmproj`) para entrada image-text-to-text. Incorpora una rotación ortogonal de Hadamard (base de Sylvester-Walsh) sobre pesos lineales y embeddings para eliminar valores atípicos en las activaciones, lo que permite que la cuantización ternaria por grupos de 128 mantenga precisión cercana a la densa.

Es relevante ahora por su enfoque en despliegue de coste casi nulo: el pack `PTQ1_0` (~429 MB) permite ejecutar pruebas de integración de LLM y tool calling en runners de CPU de CI/CD sin claves de API ni coste por token. Además, soporta ejecución multi-step de `<tool_call>` y `<tool_response>` sobre el protocolo MCP de Hanzo, lo que lo sitúa en la categoría de modelos pequeños para agentes y automatización local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: bloques Gated-DeltaNet (atención lineal) intercalados 3:1 con bloques de atención completa Grouped-Query, MLPs SwiGLU, proyector visual multimodal (`mmproj`) |
| Parametros totales | 2.213.649.216 |
| Parametros activos | no disponible (no es MoE; denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa 1,58-bit: `PQ2_0` (2,125 bpw), `PTQ1_0` (1,750 bpw), `Q2_0` (2,250 bpw); proyector visual en `Q8_0` y `BF16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (packs ternarios `PQ2_0`, `PTQ1_0`, `Q2_0`) y safetensors |

## Arquitectura y entrenamiento

El backbone combina bloques de atención lineal Gated-DeltaNet (tres por cada bloque de atención completa) con atención completa Grouped-Query, MLPs SwiGLU y un proyector visual para entrada de imagen. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de bloques Sylvester-Walsh-Hadamard, con vectores de signo ±1 por canal embebidos en los metadatos KV del GGUF (`prism.hadamard.*`). Esta rotación elimina los valores atípicos de activación, de modo que los pesos ternarios `{-d, 0, +d}` agrupados de 128 en 128 conservan la precisión densa.

El post-entrenamiento se realizó directamente en el espacio de pesos ternario mediante QAT con Straight-Through Estimator y un optimizador híbrido Muon + AdamW. El modelo conserva la atribución upstream a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash / ProCreations. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Entrada multimodal image-text-to-text mediante proyector visual (`mmproj`).
- Tool calling y function calling con ejecución multi-step de `<tool_call>`, síntesis de `<tool_response>`, recuperación de errores y abstención calibrada de herramientas.
- Integración con el protocolo MCP de Hanzo sobre herramientas `fs`, `exec`, `code`, `git`, `test`, `hanzo` y herramientas de dirección de motores de juego.
- Identidad de espacio de pesos auténtica, sin sobrecarga de system prompt, respetando personas de desarrollador personalizadas (por ejemplo, NPC de Godot o extractores JSON).
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`).
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- **CI/CD sin coste por token**: cargar `zen6-nano-2b-PTQ1_0.gguf` (~429 MB) en runners de CPU y ejecutar pruebas de integración de LLM y tool calling de extremo a extremo sin claves de API, gracias al tamaño reducido del pack ternario.
- **Agentes de automatización de repositorio**: usar las herramientas `fs`, `exec`, `git` y `test` vía MCP para leer ficheros de configuración, ejecutar tests del workspace y sintetizar resultados, con recuperación de errores ante fallos de herramienta.
- **Extracción estructurada de datos**: configurar el modelo con una persona de extractor JSON para convertir texto libre en JSON validado, aprovechando la identidad de pesos sin sobrecarga de system prompt.
- **NPC y lógica de diálogo en videojuegos**: desplegar el modelo como backend de personajes no jugables en Godot mediante las herramientas de dirección de motor de juego, con diálogo multi-turno y respuestas condicionadas por el estado del juego.
- **Asistentes locales con privacidad**: servir el modelo en `http://127.0.0.1:36900/v1` con `hanzo engine serve` para conversaciones y tool calling sin salida de datos a la nube.
- **Prototipado multimodal en Apple Silicon**: ejecutar los packs de 2 bits con `mlx-lm` para tareas image-text-to-text en local sobre chips Apple, usando el proyector visual en `Q8_0` o `BF16`.
- **Evaluación de pipelines agénticos**: emplear la abstención calibrada de herramientas para probar la robustez de orquestadores ante herramientas irrelevantes o fallidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el pack `PTQ1_0` ocupa ~429 MB en disco y RAM; `PQ2_0` y `Q2_0` son algo mayores (2,125 y 2,250 bpw respectivamente), pero en todos los casos el modelo cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; se beneficia de kernels SIMD, CUDA `dp4a`, ROCm y Metal para el pack `PQ2_0`.
- Cabe en GPU de consumo: sí, en cualquier RTX o equivalente; también en CPU.
- Opciones de despliegue: fork de llama.cpp de PrismML (rama `prism`: CUDA, Metal, CPU) para `PQ2_0`, `PTQ1_0` y `Q2_0`; llama.cpp upstream b11556+ para `Q2_0`; `mlx-lm` para packs de 2 bits en Apple Silicon; `llama-server` con `-ngl 0` para CPU; stack `hanzo up` / `hanzo engine serve` con API compatible con OpenAI. Los kernels ternarios nativos de `hanzo-engine` (CUDA, ROCm, Metal, SIMD CPU) están en desarrollo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zen 6 Nano (2B) | 2.213.649.216 | no disponible | Ternaria nativa 1,58-bit (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | GGUF y safetensors en Hugging Face |
| Alternativas de 2B densas (p. ej. Qwen2.5-1.5B/3B) | ~1.500-3.000 M | no disponible | FP16, INT8, GGUF Q4/Q8 | Apache 2.0 (según variante) | Hugging Face, llama.cpp, vLLM |
| Alternativas de 2B con visión (p. ej. Qwen2-VL-2B) | ~2.000 M | no disponible | FP16, GGUF | Apache 2.0 | Hugging Face, llama.cpp |
| Alternativas ternarias (p. ej. BitNet b1.58 2B4T) | ~2.000 M | no disponible | Ternaria 1,58-bit | MIT (según variante) | Hugging Face, bitnet.cpp |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, licencia y formatos de despliegue.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real frente a modelos densos de tamaño similar no está verificado.
- No se especifican los idiomas soportados ni la longitud de contexto; ambos son factores críticos para producción y no están disponibles.
- Riesgo de alucinación inherente a un modelo de 2B parámetros; la abstención calibrada de herramientas mitiga pero no elimina este riesgo en flujos agénticos.
- La cuantización ternaria nativa puede degradar tareas de precisión fina (matemáticas complejas, razonamiento profundo) frente a modelos densos en FP16 del mismo tamaño.
- El soporte de ejecución depende de un fork específico de llama.cpp (rama `prism`) para `PQ2_0` y `PTQ1_0`; solo `Q2_0` funciona en llama.cpp upstream, lo que limita la portabilidad.
- Los kernels ternarios nativos de `hanzo-engine` están en desarrollo, no en producción.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero se debe preservar la atribución upstream a Qwen, Bonsai-2 y DFlash / ProCreations indicada en `NOTICE`.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano-2b
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Fork de llama.cpp de PrismML (rama `prism`): https://github.com/PrismML-Eng/llama.cpp
