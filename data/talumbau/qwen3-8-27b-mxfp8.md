# talumbau/Qwen3.8-27B-mxfp8

## Resumen

`talumbau/Qwen3.8-27B-mxfp8` es una versión cuantizada en formato MXFP8 (OCP MX FP8 E4M3) del modelo multimodal Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. El modelo original es un modelo denso de 27 800 millones de parámetros con arquitectura híbrida (48 capas de atención lineal estilo Mamba/GatedDeltaNet y 16 capas de atención completa), diseñado para tareas de visión-lenguaje, generación de código, razonamiento y flujos agénticos. La cuantización MXFP8 reduce el tamaño de los pesos a 1 byte por parámetro con escalas E8M0 por grupos de 32 elementos, lo que permite aceleración por hardware en GPUs AMD CDNA4 (gfx950) y NVIDIA Blackwell (SM100+).

Este checkpoint es parte de un estudio comparativo de formatos de escalado: el mismo modelo en BF16, FP8 con escalado por bloques 128×128 y MXFP8 con escalado por grupos de 32. La elección de módulos cuantizados (407 en total) coincide exactamente con la versión FP8 de referencia, de modo que ambos checkpoints difieren únicamente en la granularidad de escalado. El resultado es un modelo listo para inferencia con vLLM, con verificación numérica frente al original BF16 (error relativo medio de dequantización del 2,656 % y coseno de 0,999773).

La relevancia de este modelo radica en que demuestra la viabilidad práctica de MXFP8 como formato de cuantización para modelos de gran tamaño en hardware de nueva generación, y ofrece una alternativa de alto rendimiento para despliegues locales con requisitos de VRAM reducidos (el repositorio ocupa 31,6 GB, frente a los aproximadamente 55 GB del BF16 original).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas GatedDeltaNet (linear attention) + 16 capas full attention (proporción 3:1, `full_attention_interval=4`), con torre de visión y cabeza MTP (multi-token prediction) |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | MXFP8 (OCP MX FP8 E4M3), block size 32 elementos a lo largo de K, escalas E8M0 (uint8) estáticas para pesos y dinámicas para activaciones |
| Idiomas soportados | No disponible (no especificado en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato `compressed-tensors` (auto-detectado por vLLM) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de visión-lenguaje con una pila de texto de atención híbrida: de sus 64 capas decodificadoras, 48 usan atención lineal estilo Mamba/GatedDeltaNet (`linear_attention`) y 16 usan atención completa convencional (`full_attention`), en un patrón repetido cada 4 capas. Esta combinación reduce el coste computacional de la atención en secuencias largas (hasta 262K tokens) manteniendo la capacidad de razonamiento profundo. El modelo incluye además una cabeza MTP (multi-token prediction) que predice varios tokens a la vez, mejorando el rendimiento en generación.

La cuantización MXFP8 se realizó con `llm-compressor` v0.13.0 sobre el checkpoint BF16 original. Se cuantizaron 407 módulos lineales: las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) de las 64 capas, las proyecciones de atención lineal (`in_proj_qkv`, `in_proj_z`, `out_proj`) de las 48 capas lineales, las proyecciones de atención completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`) de las 16 capas, y 7 lineales de la cabeza MTP. Se dejaron en BF16 la torre de visión completa, `lm_head`, `embed_tokens`, todas las RMSNorm, los parámetros SSM (`conv1d`, `A_log`, `dt_bias`) y las proyecciones pequeñas `in_proj_a`/`in_proj_b` de la atención lineal. Los 792 tensores no cuantizados son byte-idénticos al checkpoint base.

El entrenamiento original del modelo base incluyó datos multimodales (texto, imagen y vídeo) y técnicas de alineación con razonamiento configurable (modo thinking). No se dispone de detalles adicionales sobre el dataset o el proceso de alineación en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de texto, imagen y vídeo, con capacidad de razonamiento de varios pasos.
- Generación de código: destaca en tareas de programación, con rendimiento cercano a Claude Opus en benchmarks de Alibaba.
- Modo de razonamiento configurable: permite activar o desactivar el "thinking mode" según la tarea.
- Multi-token prediction: la cabeza MTP permite predecir varios tokens a la vez, acelerando la generación.
- Soporte de agentes y flujos agénticos: diseñado para tareas de larga duración con múltiples pasos (long-horizon agentic tasks).
- Capacidades multilingües: no se especifican idiomas concretos, pero el modelo base de Qwen soporta múltiples idiomas (no confirmado para esta versión).
- Tool calling / function calling: no se menciona explícitamente, pero es habitual en la familia Qwen 3.8; no confirmado en la documentación disponible.
- Oficina y automatización: según la documentación oficial, destaca en tareas de automatización de oficina (procesamiento de documentos, hojas de cálculo, etc.).

## Casos de uso

- Asistente de programación local: con 27,8 B de parámetros y cuantización MXFP8, el modelo puede ejecutarse en estaciones de trabajo con GPUs Blackwell o CDNA4, proporcionando autocompletado de código, generación de funciones y revisión de código sin depender de servicios en la nube.
- Automatización de oficina: el modelo puede procesar documentos, extraer información de imágenes y generar informes, aprovechando su capacidad multimodal y su ventana de contexto de 262K tokens para manejar documentos extensos.
- Agentes autónomos de larga duración: gracias a su arquitectura híbrida con atención lineal, puede mantener conversaciones y ejecutar tareas de múltiples pasos con memoria de contexto amplia, adecuado para agentes de atención al cliente o asistentes personales.
- Análisis de imágenes y vídeo: su pipeline image-text-to-text permite describir imágenes, responder preguntas sobre su contenido y analizar vídeos, útil en sistemas de moderación de contenido o accesibilidad.
- Investigación en cuantización: este checkpoint sirve como referencia para estudiar el impacto de la granularidad de escalado (MXFP8 vs. FP8 por bloques) en la calidad del modelo, útil para equipos que desarrollan kernels GEMM.
- Despliegue en infraestructura AMD: con soporte Day-0 en AMD Ryzen AI y Radeon, el modelo puede ejecutarse en portátiles y PCs con hardware AMD mediante LM Studio o Lemonade, permitiendo IA local de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de Alibaba indica que Qwen3.8-27B se acerca a Claude Opus en tareas de programación, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada. La verificación numérica del checkpoint MXFP8 frente al BF16 original reporta un error relativo medio de dequantización del 2,656 %, una coincidencia top-1 en logits de CPU con coseno 0,999773 y divergencia KL 0,00059, lo que sugiere una degradación mínima en la calidad de salida.

## Requisitos de hardware

- Aceleración MXFP8 por hardware: requiere AMD MI350X / MI355X (CDNA4, gfx950) con ROCm ≥ 7.2.0, o NVIDIA Blackwell (SM100+). No funciona correctamente en AMD MI300X (gfx942) ni NVIDIA Hopper (H100/H200) por incompatibilidad de codificación FP8 (FNUZ vs. OCP MX).
- VRAM estimada: el repositorio ocupa 31,6 GB en formato safetensors. Para inferencia con vLLM se recomienda una GPU con al menos 40 GB de VRAM para dejar margen para activaciones, KV cache y overhead del runtime. Con cuantización MXFP8, los pesos ocupan aproximadamente 27,8 GB (1 byte por parámetro) más las escalas.
- GPUs compatibles: AMD MI350X (192 GB HBM3e), MI355X, NVIDIA B200/B300 (Blackwell). No cabe en GPUs de consumo como RTX 4090 (24 GB) ni RTX 5090 (32 GB) sin cuantización adicional.
- Opciones de despliegue: vLLM (auto-detecta el formato compressed-tensors, sin flag de cuantización), servidor vLLM (`vllm serve`), y potencialmente LM Studio en hardware AMD compatible.
- Latencia y throughput: no se han publicado datos específicos. Se espera que la aceleración MXFP8 en gfx950 ofrezca un throughput superior al de FP8 tradicional gracias al escalado por grupos de 32 elementos, pero no hay cifras verificadas.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto | Escalado | Hardware requerido | Licencia |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | BF16 | 27,8 B | 262K | — | GPU con ≥ 60 GB VRAM | Apache 2.0 |
| Qwen/Qwen3.8-27B-FP8 | FP8 (bloques 128×128) | 27,8 B | 262K | Escalas BF16 por bloque | Hopper, Ada, CDNA3+ | Apache 2.0 |
| talumbau/Qwen3.8-27B-mxfp8 | MXFP8 (grupos 32) | 27,8 B | 262K | Escalas E8M0 por grupo | CDNA4 (gfx950), Blackwell | Apache 2.0 |
| OsaurusAI/Qwen3.8-27B-MXFP8 | MXFP8 (bundle MLX) | 27,8 B | 262K | Escalas E8M0 | Apple Silicon (MLX) | Apache 2.0 |

La diferencia clave entre las variantes FP8 y MXFP8 es la granularidad de escalado: FP8 usa bloques 128×128 con escalas BF16, mientras que MXFP8 usa grupos de 32 elementos con escalas E8M0. Esto afecta al tipo de kernel GEMM necesario y al hardware que puede acelerarlos. La versión MXFP8 de talumbau está pensada específicamente para GPUs AMD CDNA4 y NVIDIA Blackwell, mientras que la versión de OsaurusAI está optimizada para Apple Silicon mediante MLX.

## Limitaciones y advertencias

- Requisitos de hardware estrictos: el checkpoint MXFP8 no se ejecuta correctamente en GPUs AMD MI300X ni NVIDIA Hopper (H100/H200) debido a la incompatibilidad de codificación FP8 (FNUZ vs. OCP MX). Solo funciona con aceleración MXFP8 en CDNA4 (gfx950) o Blackwell (SM100+). En hardware no compatible, la inferencia fallará o producirá resultados incorrectos.
- Error de cuantización: el error relativo medio de dequantización es del 2,656 %, con un rango de 2,649 % a 2,660 %. Aunque la verificación en CPU muestra una coincidencia top-1, puede haber diferencias sutiles en la salida frente al modelo BF16 original.
- Verificación incompleta: no se han verificado los kernels GEMM de hardware MXFP8 (requieren gfx950; la validación se realizó en gfx942). El checkpoint está bien formado numéricamente, pero no se ha confirmado que la ruta rápida de hardware funcione correctamente.
- Sesgos y alucinaciones: no se dispone de información específica sobre sesgos del modelo base Qwen3.8-27B. Como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Idiomas: no se especifican los idiomas soportados en esta versión cuantizada. La documentación del modelo base no detalla la cobertura multilingüe.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base Qwen3.8-27B por si hubiera condiciones adicionales (no se han encontrado en la información disponible).
- Tamaño y despliegue: con 31,6 GB de repositorio, no es adecuado para dispositivos con menos de 40 GB de VRAM. Para entornos con GPUs de consumo, se recomienda esperar versiones cuantizadas a 4 bits o usar el bundle MLX de OsaurusAI en Apple Silicon.

## Enlaces

- Repositorio HuggingFace: [talumbau/Qwen3.8-27B-mxfp8](https://huggingface.co/talumbau/Qwen3.8-27B-mxfp8)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Versión FP8 de referencia: [Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)
- Repositorio oficial en GitHub: [AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- Bundle MXFP8 para Apple Silicon/MLX: [OsaurusAI/Qwen3.8-27B-MXFP8](https://huggingface.co/OsaurusAI/Qwen3.8-27B-MXFP8)
- Análisis y comparativa con Claude Opus: [explainx.ai](https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026)
- Soporte oficial en hardware AMD: [AMD blog](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- Página del modelo en LM Studio: [lmstudio.ai/models/qwen3.8](https://lmstudio.ai/models/qwen3.8)
