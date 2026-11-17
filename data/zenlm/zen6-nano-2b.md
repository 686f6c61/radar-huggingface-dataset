# zenlm/zen6-nano-2b

## Resumen

Zen 6 Nano (2B) es un modelo de lenguaje multimodal y orientado a agentes desarrollado por Hanzo AI y Zen LM en colaboración con Zoo Labs Foundation. Se distribuye en formato GGUF con pesos ternarios de 1,58 bits (rango {-d, 0, +d}) y licencia Apache 2.0. El modelo parte de una base con ascendencia declarada en Qwen (Alibaba Cloud) y Bonsai-2 (Prism ML), y ha sido post-entrenado directamente en el espacio de pesos ternarios mediante cuantización consciente del entrenamiento (QAT) con estimador de gradiente recto (STE).

Su propuesta principal es combinar un tamaño reducido (1.881.825.088 parámetros reales según los safetensors del repositorio) con artefactos de pesos extremadamente compactos: el fichero PTQ1_0 ocupa 429 MB y el PQ2_0 517 MB. Esto lo sitúa como candidato para inferencia en CPU, CI/CD sin coste por token y despliegue en entornos con recursos limitados, manteniendo capacidades de tool calling multi-paso, razonamiento agéntico y entrada de imagen mediante un proyector visual independiente.

La relevancia actual del modelo reside en su enfoque de cuantización nativa: en lugar de cuantizar un modelo denso a posteriori, los pesos se entrenan y almacenan en una base ortonormal de Sylvester-Walsh-Hadamard que elimina los valores atípicos de activación, permitiendo que los pesos ternarios conserven precisión cercana a la densa. Incorpora además atención lineal híbrida (Gated-DeltaNet) intercalada con atención completa agrupada, lo que reduce el coste computacional en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: bloques Gated-DeltaNet (atención lineal) intercalados 3:1 con atención completa Grouped-Query, MLP SwiGLU, proyector visual multimodal |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria nativa 1,58 bits: PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw); proyector visual en Q8_0 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42); proyector mmproj en Q8_0 y BF16 |

## Arquitectura y entrenamiento

El modelo emplea un backbone híbrido en el que los bloques de atención lineal Gated-DeltaNet (GDN) se intercalan con bloques de atención completa Grouped-Query en una proporción 3:1, con MLPs SwiGLU. Esta combinación busca reducir el coste de atención en secuencias largas manteniendo la capacidad de recuperación de contexto que aporta la atención completa. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de bloques Sylvester-Walsh-Hadamard, con vectores de signo por canal embebidos en los metadatos KV del GGUF (`prism.hadamard.*`). Esta rotación elimina los valores atípicos de activación, de modo que los pesos ternarios por grupo de 128 conservan la precisión del modelo denso.

El post-entrenamiento se realizó directamente en el espacio de pesos ternarios mediante QAT con STE y un optimizador híbrido Muon + AdamW. El autor declara ascendencia en Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash / ProCreations, con atribución preservada en el fichero NOTICE. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modelo incluye soporte de decodificación especulativa mediante MTP, DFlash2, búsqueda por autómata de sufijos (`SA_SPEC`) y `GuardedDraft` en el runtime hanzo-engine.

## Capacidades

- Generación de texto conversacional multi-turno con identidad de pesos nativa y respeto de personas definidas por el desarrollador (por ejemplo, NPCs de Godot o extractores JSON).
- Razonamiento agéntico multi-paso con ejecución de `<tool_call>` y síntesis de `<tool_response>`, incluyendo recuperación de errores y abstención calibrada de herramientas.
- Tool calling sobre conjuntos de herramientas `fs`, `exec`, `code`, `git`, `test`, `hanzo` y herramientas de dirección de motores de juego.
- Integración con Hanzo MCP (Model Context Protocol).
- Entrada multimodal de imagen y texto mediante proyector visual (`mmproj`) en Q8_0 o BF16.
- Compatibilidad con la API `/v1/chat/completions` de OpenAI a través de hanzo-engine.
- Ejecución en CUDA, Metal, ROCm, Vulkan y CPU mediante hanzo-engine; Q2_0 también en llama.cpp (b11556 o superior); paquetes MLX de 2 bits en `mlx-lm` sobre Apple Silicon.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- CI/CD sin coste por token: cargar `zen6-nano-2b-PTQ1_0.gguf` (429 MB) en runners de CPU para ejecutar pruebas de integración de LLM y tool calling de extremo a extremo, sin claves de API ni facturación por token. El tamaño reducido permite incluirlo en imágenes de contenedor y pipelines de GitHub Actions.
- Agentes de automatización de repositorio: usar las herramientas `fs`, `git`, `exec` y `test` para leer ficheros de configuración, ejecutar pruebas del workspace y sintetizar resultados, con recuperación de errores ante fallos de herramienta.
- NPCs y lógica de diálogo en videojuegos: el modelo respeta personas definidas por el desarrollador y expone herramientas de dirección de motor de juego, lo que permite integrarlo como backend de diálogo con estado y acciones sobre el mundo del juego.
- Extracción estructurada de datos: emplear la persona de extractor JSON y el tool calling para convertir texto libre o imágenes en registros estructurados, con abstención calibrada cuando la confianza es baja.
- Procesamiento de documentos con imagen: el proyector visual permite pasar capturas, formularios o diagramas junto con instrucciones de texto para tareas de descripción, clasificación o extracción.
- Despliegue en dispositivos de borde y entornos sin GPU: los ficheros de 429 a 547 MB y la ejecución nativa en CPU y Vulkan permiten servir el modelo en hardware modesto, con latencia adecuada para tareas de clasificación, enrutamiento o asistencia breve.
- Prototipado local de agentes MCP: el stack `hanzo up` levanta un endpoint compatible con OpenAI en `127.0.0.1:36900/v1`, útil para desarrollar y depurar flujos agénticos antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ternarios ocupan entre 429 MB (PTQ1_0) y 547 MB (Q2_0); el proyector visual añade 365 MB (Q8_0) o 671 MB (BF16). El consumo total de memoria ronda 1-1,5 GB incluyendo overhead de runtime y caché KV, aunque la cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU con soporte CUDA, ROCm, Metal o Vulkan y al menos 2 GB de memoria libre; el modelo está pensado para ejecución en CPU como caso principal.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante, Apple Silicon con MLX, iGPU con Vulkan).
- Opciones de despliegue: hanzo-engine (CUDA, Metal, ROCm, Vulkan, CPU), llama.cpp (Q2_0 en b11556 o superior), `mlx-lm` en Apple Silicon para paquetes MLX de 2 bits, y servidor compatible con OpenAI vía hanzo-engine.
- Latencia y throughput: no disponibles en la información proporcionada. El autor describe PQ2_0 como el formato más rápido en CPU/GPU por su ejecución SIMD y `dp4a`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zen 6 Nano (2B) | 1.881.825.088 | No disponible | Ternaria nativa 1,58 bits (1,75-2,25 bpw) | Apache 2.0 | GGUF en Hugging Face |
| Qwen 2.5 1.5B | ~1.500.000.000 | 32.768 tokens (versión base) | Densa, cuantizable a GGUF | Apache 2.0 | Hugging Face, múltiples runtimes |
| Llama 3.2 1B | ~1.200.000.000 | 128.000 tokens | Densa, cuantizable a GGUF | Llama 3.2 Community License | Hugging Face, Ollama, llama.cpp |
| SmolLM2 1.7B | ~1.700.000.000 | 8.192 tokens | Densa, cuantizable a GGUF | Apache 2.0 | Hugging Face, llama.cpp |

La comparación con Qwen 2.5 1.5B y SmolLM2 1.7B es la más directa por rango de parámetros y licencia permisiva; Llama 3.2 1B se incluye por tamaño pero su licencia comunitaria impone restricciones adicionales. Zen 6 Nano se diferencia por la cuantización ternaria nativa entrenada (no post-hoc), el soporte multimodal y el enfoque agéntico con MCP. Los datos de contexto y benchmarks de los modelos comparables no se han verificado en la información disponible para esta ficha.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real en tareas de razonamiento, código o matemáticas no está cuantificado de forma independiente.
- El tamaño de contexto no está documentado; no debe asumirse una ventana larga sin verificación empírica.
- Los idiomas soportados no están declarados; el comportamiento multilingüe es incierto y probablemente inferior al de modelos densos de mayor tamaño.
- La cuantización ternaria, aunque entrenada de forma nativa, puede degradar tareas de precisión fina (aritmética exacta, copia literal de cadenas largas) frente a modelos densos equivalentes.
- Riesgo de alucinación inherente a modelos de 2B; la abstención calibrada de herramientas mitiga pero no elimina este riesgo en flujos agénticos.
- Sesgos conocidos: no documentados en la información disponible; al heredar ascendencia de Qwen y Bonsai-2, es probable que arrastre sesgos de sus datasets, pero no se confirma.
- La licencia Apache 2.0 permite uso comercial, pero el fichero NOTICE impone preservar la atribución a Qwen, Prism ML y DFlash / ProCreations; debe incluirse en redistribuciones.
- La ejecución en llama.cpp está limitada al formato Q2_0 y a versiones b11556 o superiores; PQ2_0 y PTQ1_0 requieren hanzo-engine.
- El modelo está orientado a tool calling y agentes; su uso como chatbot generalista sin herramientas puede no aprovechar sus capacidades y mostrar un rendimiento modesto.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano-2b
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Repositorio hanzo-engine: https://github.com/hanzoai/engine
