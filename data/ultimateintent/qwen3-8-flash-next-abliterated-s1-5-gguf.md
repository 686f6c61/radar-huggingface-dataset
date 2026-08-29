# UltimateIntent/Qwen3.8-Flash-Next-Abliterated-s1.5-GGUF

## Resumen

Este modelo es un derivado experimental del modelo multimodal Qwen3.8-Flash-Next de Alibaba (QwenLM), publicado por el usuario UltimateIntent en HuggingFace. Se trata de una conversión a GGUF de una versión "abliterated" del modelo base, es decir, se ha aplicado una técnica de eliminación de la dirección de rechazo (refusal direction) con una fuerza de 1.5 sobre 146 tensores auditados, dejando intactos el vision tower, la cabeza MTP, la cabeza LM y los controladores Gated Residual. El objetivo es estudiar el comportamiento del modelo sin las salvaguardas de rechazo, en entornos de investigación aislados.

El modelo base Qwen3.8-Flash-Next es una arquitectura `qwen4exp` (experimental de la serie Qwen4) que combina atención sparse, Gated DeltaNet, Gated Residual, embeddings n-gram PLE y predicción multi-token (MTP). Tiene 125B parámetros con 6B activos por token (MoE ultra-sparse), más 51B de embeddings n-gram y 4B de parámetros MTP, lo que suma aproximadamente 180B parámetros totales (el peso safetensors indica 176.9B). Soporta una ventana de contexto nativa de 262.144 tokens y entrada multimodal (imagen-texto). La relevancia de este derivado radica en explorar los efectos de la abliteration en un modelo de última generación con arquitectura híbrida y capacidades avanzadas, aunque el autor advierte explícitamente que no está destinado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE ultra-sparse, híbrida GDN + QSA) |
| Parametros totales | 176.943.899.520 (125B A6B + 51B n-gram + 4B MTP) |
| Parametros activos | 6B por token (10 de 512 expertos activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF monolítico + proyector de visión BF16 (mmproj) |

## Arquitectura y entrenamiento

La arquitectura base, Qwen3.8-Flash-Next, es un modelo multimodal MoE ultra-sparse con 512 expertos y 10 activos por token. Combina dos mecanismos de atención: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. Incorpora además Gated Residual para estabilizar el entrenamiento, embeddings n-gram PLE (51B parámetros) y una cabeza de predicción multi-token (MTP) con 4B parámetros. El modelo soporta tool use, razonamiento configurable y entrada multimodal a través de un proyector de visión separado.

El derivado abliterated aplica una proyección de dirección de rechazo con fuerza 1.5 sobre 146 tensores auditados, excluyendo el vision tower, la cabeza MTP, la cabeza LM y los controladores Gated Residual. No se han publicado detalles sobre el proceso de entrenamiento del modelo base (datos, tokens, fases de RLHF/DPO), ni sobre el método exacto de abliteration más allá de la descripción del autor. La conversión a GGUF se realizó con verificación estructural y pruebas de arranque del servidor, generación de texto y salud del sistema.

## Capacidades

- Generación de texto con razonamiento configurable (modo thinking opcional).
- Entrada multimodal: procesamiento de imágenes junto con texto (requiere el proyector de visión BF16).
- Tool use / function calling, integrable en flujos de agentes.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- Predicción multi-token (MTP) que puede mejorar la velocidad de decodificación.
- Arquitectura MoE con 6B parámetros activos, lo que reduce el coste computacional por token frente a un denso de tamaño similar.
- Capacidad de ejecución en llama.cpp y aplicaciones compatibles (LM Studio, etc.).

## Casos de uso

- Investigación en alineación y seguridad de modelos: estudiar cómo la abliteration afecta al comportamiento de rechazo y a la calidad de las respuestas en un modelo MoE multimodal de última generación.
- Análisis de sesgos y comportamientos no deseados: al eliminar la dirección de rechazo, se pueden observar respuestas que el modelo base ocultaría, útil para auditar riesgos.
- Experimentación en entornos sandbox: el autor lo destina explícitamente a entornos aislados, por lo que es adecuado para pruebas de concepto sin conexión a producción.
- Evaluación de la robustez de la abliteration: comparar el rendimiento en tareas de razonamiento, código y matemáticas frente al modelo base.
- Desarrollo de aplicaciones multimodales de investigación: usar la capacidad imagen-texto para probar interacciones complejas sin restricciones de rechazo.
- Benchmarking de cuantizaciones GGUF: los distintos niveles (Q8_0 a IQ4_XS) permiten medir el impacto de la cuantización en un modelo de 180B con arquitectura híbrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que "la evaluación posterior reveló que la abliteration fue exitosa sin pérdida notable de rendimiento/capacidad", pero no proporciona cifras concretas. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- Tamaños de archivo GGUF: Q8_0 (175.29 GiB), Q6_K (156.13 GiB), Q5_K_M (124.89 GiB), Q4_K_M (110.96 GiB), IQ4_XS (91.66 GiB). El proyector de visión BF16 añade unos pocos GB adicionales.
- VRAM estimada para inferencia: para la cuantización más pequeña (IQ4_XS, ~92 GiB) se necesitan al menos 100-120 GB de VRAM considerando overhead de contexto y caché KV. Para Q4_K_M (~111 GiB) se requieren al menos 128 GB. Esto implica múltiples GPUs de alta gama.
- GPUs recomendadas: 2x A100 80GB (para Q4_K_M o IQ4_XS), 4x RTX 4090 24GB (para IQ4_XS), o GPUs de data center como H100/H200 con memoria suficiente. No cabe en una sola GPU consumer de 24 GB.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio u otras aplicaciones basadas en llama.cpp. vLLM puede soportar la arquitectura `qwen4exp` si está implementada, pero no se confirma en la información disponible.
- Latencia y throughput: no disponibles. Dado el tamaño y la arquitectura MoE, se espera una latencia mayor que modelos más pequeños, pero la activación de solo 6B parámetros por token reduce el coste computacional frente a un denso equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B + 4B | 6B | 262k | Qwen Community 1.0 | safetensors |
| Este derivado abliterated | 176.9B (total) | 6B | 262k | Qwen Community 1.0 | GGUF |
| DeepSeek-V3 (referencia MoE) | 671B | 37B | 128k | MIT (con restricciones) | safetensors/GGUF |

La comparativa directa con otros modelos MoE no es posible sin datos de benchmarks. Frente al modelo base, la única diferencia es la abliteration y el formato GGUF; las capacidades y especificaciones son idénticas. No se dispone de información sobre otros derivados abliterated de Qwen3.8-Flash-Next.

## Limitaciones y advertencias

- Modelo experimental: el autor lo destina exclusivamente a investigación en entornos sandbox, no a producción.
- La abliteration puede debilitar las salvaguardas de seguridad y no garantiza un comportamiento sin restricciones; puede introducir regresiones de calidad no relacionadas.
- No se han publicado evaluaciones cuantitativas de rendimiento ni de seguridad tras la abliteration.
- Licencia Qwen Community 1.0: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos completos.
- Idiomas soportados: no especificados; se asume herencia del modelo base, pero no confirmado.
- Requiere hardware de gama alta (múltiples GPUs con gran VRAM) para ejecutar incluso la cuantización más pequeña.
- El proyector de visión debe descargarse por separado y colocarse junto al archivo GGUF; si no se incluye, el modelo pierde la capacidad multimodal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UltimateIntent/Qwen3.8-Flash-Next-Abliterated-s1.5-GGUF
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/tree/main
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
