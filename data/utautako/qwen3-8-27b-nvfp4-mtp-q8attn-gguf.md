# utautako/Qwen3.8-27B-NVFP4-MTP-Q8attn-GGUF

## Resumen

El modelo `utautako/Qwen3.8-27B-NVFP4-MTP-Q8attn-GGUF` es una conversión a formato GGUF del modelo multimodal `Qwen/Qwen3.8-27B`, cuantizado de forma híbrida: las capas MLP se almacenan en NVFP4 (cuantización de 4 bits de NVIDIA ModelOpt), mientras que las proyecciones de atención y atención lineal (DeltaNet) se mantienen en Q8_0 para preservar precisión en contextos largos. Incluye además la capa MTP (Multi-Token Prediction) original del modelo base, lo que permite decodificación especulativa y duplicar aproximadamente el throughput de generación en hardware compatible.

Desarrollado por el usuario utautako, este repo está pensado para ejecutarse con `llama.cpp` en GPUs Blackwell (RTX 5090 probada). El modelo base Qwen3.8-27B es un VLM híbrido con 64 capas de texto, una capa MTP y arquitectura `qwen35`, con soporte de visión mediante un proyector BF16. La cuantización NVFP4 reduce el peso a ~5.60 bits por peso, manteniendo la atención en 8 bits para mitigar la pérdida de calidad en ventanas de contexto de hasta 196 000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (híbrida: atención estándar + atención lineal DeltaNet) con capa MTP |
| Parametros totales | 27B (denominación del modelo base; el repo reporta 460 730 096 en safetensors, dato inconsistente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 196 608 tokens en configuracion probada (texto); 147 456 con proyector de vision |
| Tipos de cuantizacion | NVFP4 (MLP, 193 tensores), Q8_0 (atencion y DeltaNet, 308 tensores), Q6_K (FFN MTP, 3), Q4_K (2), F32 (normas/embeddings, 553) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (principal), safetensors (referencia) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` emplea una arquitectura híbrida `qwen35` que combina atención tradicional con atención lineal (DeltaNet), lo que reduce el coste computacional en secuencias largas. La capa MTP (una capa adicional que predice varios tokens a la vez) se conserva íntegramente en el GGUF, permitiendo decodificación especulativa con `llama.cpp`. El repo no proporciona detalles sobre el entrenamiento del modelo base (dataset, número de tokens, técnicas de alineación), pero la cuantización se realizó con NVIDIA ModelOpt usando la receta `w4a16_nvfp4 / fp8_attn`, calibrada sobre `cnn_dailymail`. La conversión mantiene las proyecciones de atención y DeltaNet en Q8_0 en lugar de bajarlas a Q4_K, priorizando la precisión en contextos largos.

## Capacidades

- Generación de texto y razonamiento, con soporte de ventana de contexto de hasta 196 000 tokens (probado en RTX 5090).
- Multimodal: incluye un proyector de visión BF16 (`mmproj`) que permite entrada de imágenes siguiendo la ruta de visión de Qwen3-VL.
- Decodificación especulativa MTP: con `--spec-type draft-mtp` y `--spec-draft-n-max 2-3`, duplica el throughput de generación (~65 → ~124 tok/s en pruebas del autor).
- Atención híbrida (estándar + DeltaNet) optimizada para contextos largos, con proyecciones en Q8_0 para reducir pérdida de calidad.
- Compatible con `llama.cpp` (servidor y CLI) en GPUs Blackwell con soporte NVFP4.

## Casos de uso

- **Procesamiento de documentos largos**: con 196 000 tokens de contexto, el modelo puede resumir, extraer información o responder preguntas sobre libros técnicos, informes financieros o logs extensos sin truncar.
- **Asistentes multimodales**: gracias al proyector de visión, puede analizar capturas de pantalla, diagramas o fotografías junto con texto, útil en soporte técnico o documentación visual.
- **Generación de código con contexto amplio**: la ventana larga permite incluir repositorios completos o múltiples archivos para tareas de refactorización o generación de tests.
- **Chatbots de atención al cliente**: la decodificación especulativa MTP reduce la latencia, permitiendo respuestas más rápidas en conversaciones multi-turno.
- **Análisis de conversaciones y transcripciones**: el contexto de 196k tokens permite procesar reuniones completas o largas cadenas de correo para generar actas o resúmenes.
- **Despliegue en hardware consumer**: con ~5.60 BPW, el GGUF ocupa ~17.8 GiB, por lo que cabe en GPUs de 24 GB (RTX 3090/4090) aunque la cuantización NVFP4 requiere GPUs Blackwell (RTX 50xx) para aceleración nativa; en otras GPUs podría usar fallback de CPU.

## Benchmarks y rendimiento

El autor publicó mediciones de throughput en RTX 5090 (contexto 32 768, KV `q8_0`, generación de 512 tokens). No se reportan benchmarks de calidad (MMLU, HumanEval, etc.).

| MTP depth | code — gen t/s (aceptacion) | prose — gen t/s (aceptacion) |
|--:|--:|--:|
| n0 (autoregresivo) | 65.2 (—) | 67.1 (—) |
| n1 | 94.1 (78%) | 91.5 (70%) |
| **n2** | **124.0 (77%)** | **112.3 (63%)** |
| n3 | 129.2 (63%) | 111.2 (49%) |
| n4 | 125.3 (49%) | 128.6 (50%) |
| n5 | 137.0 (50%) | 106.3 (35%) |

La decodificación MTP duplica aproximadamente el throughput respecto al modo autoregresivo, con un punto óptimo en `n=2` o `n=3`. A partir de `n=4`, la tasa de aceptación cae y no hay ganancia fiable.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF principal ocupa ~17.8 GiB; con el proyector de visión (~888 MiB) y contexto largo, se recomienda una GPU con al menos 24 GB. El autor probó en RTX 5090 (32 GB) con contexto de 196 608 tokens (texto) y 147 456 tokens (con visión).
- **GPU recomendada**: RTX 5090 (u otras GPUs Blackwell) para aceleración NVFP4 nativa. En GPUs sin soporte NVFP4, `llama.cpp` podría requerir conversión a otro formato o ejecución en CPU, con pérdida de rendimiento.
- **Opciones de despliegue**: `llama.cpp` (llama-server, llama-cli) con soporte para arquitectura `qwen35`, MTP y NVFP4. También compatible con herramientas que usen llama.cpp como backend (Ollama, LM Studio, etc., si incorporan la versión adecuada).
- **Latencia y throughput**: en RTX 5090, ~65 tok/s en modo autoregresivo y ~120-130 tok/s con MTP activo (n=2-3), según las pruebas del autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad para comparar directamente con otras cuantizaciones del mismo modelo base. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 256k (estimado) | BF16/FP16 | Apache-2.0 | HuggingFace |
| Este GGUF (NVFP4-MTP-Q8attn) | 27B | 196k (probado) | NVFP4 + Q8_0 | Apache-2.0 | HuggingFace |
| Otras cuantizaciones GGUF (p.ej. Q4_K_M) | 27B | variable | K-quants | Apache-2.0 | HuggingFace (comunidad) |

La principal diferencia frente a cuantizaciones K-quant tradicionales es el uso de NVFP4 para MLP y Q8_0 para atención, lo que busca un mejor equilibrio entre tamaño y precisión, especialmente en contextos largos. La capa MTP es una ventaja exclusiva de esta conversión.

## Limitaciones y advertencias

- **Hardware específico**: la cuantización NVFP4 está optimizada para GPUs Blackwell (RTX 50xx). En GPUs anteriores (Ampere, Ada) no hay aceleración nativa y el rendimiento puede degradarse o requerir conversión.
- **Contexto largo con VRAM limitada**: aunque el modelo soporta 196k tokens, en GPUs de 24 GB el contexto máximo práctico será menor; el autor solo probó 196k en RTX 5090 de 32 GB.
- **Sin benchmarks de calidad**: no se han publicado resultados de MMLU, HumanEval, etc. para esta cuantización. La precisión puede diferir del modelo original, especialmente en tareas que dependen de atención fina.
- **Riesgo de alucinación**: inherente a modelos de lenguaje; la cuantización puede aumentar la probabilidad de errores en tareas de razonamiento complejo.
- **Idiomas**: no se especifican los idiomas soportados; el modelo base Qwen3.8 probablemente sea multilingüe, pero no hay confirmación para esta conversión.
- **Dependencia de llama.cpp**: la capa MTP y NVFP4 requieren una versión reciente de `llama.cpp` con soporte para arquitectura `qwen35` y decodificación especulativa; no todas las herramientas lo incluyen.
- **Licencia**: Apache-2.0 permite uso comercial, pero se deben respetar los términos del modelo base Qwen3.8-27B (consultar su model card).

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/utautako/Qwen3.8-27B-NVFP4-MTP-Q8attn-GGUF)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [NVIDIA ModelOpt (TensorRT-Model-Optimizer)](https://github.com/NVIDIA/TensorRT-Model-Optimizer)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
