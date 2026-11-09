# undefined1behavior/Qwen3.8-Flash-Next-Uncensored-exl3

## Resumen

Qwen3.8-Flash-Next-Uncensored-exl3 es una cuantización en formato EXL3 (ExLlamaV3) del modelo Qwen3.8-Flash-Next-Uncensored, publicado por el usuario undefined1behavior en Hugging Face. Se trata de una build "abliterated" (con la dirección de rechazo eliminada del flujo residual) del modelo Qwen/Qwen3.8-Flash-Next de Qwen, un Mixture-of-Experts de aproximadamente 180B parámetros totales con unos 6B activos, atención híbrida, capacidades nativas de visión-lenguaje, tool calling y una cabeza MTP (multi-token prediction) para decodificación especulativa.

La relevancia de esta publicación concreta es que ofrece los pesos en una cuantización de 2,05 bits por peso (2.05bpw_h4_ng4) compatible con ExLlamaV3, siguiendo la especificación exacta de turboderp/Qwen3.8-Flash-Next-exl3, y conserva las cabezas MTP funcionales. Esto permite ejecutar un modelo de escala ~180B en hardware mucho más modesto que su versión BF16, manteniendo supuestamente un rendimiento similar al de la cuantización de referencia de turboderp.

El modelo hereda la arquitectura MoE con 512 expertos y top-10, contexto de 262K tokens y soporte de visión y vídeo. La licencia declarada es Apache 2.0. No obstante, al ser una variante abliterated, el autor advierte explícitamente que se ha eliminado la alineación de seguridad y que no debe desplegarse en producción sin capas propias de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención híbrida y cabeza MTP (multi-token prediction); modelo nativo visión-lenguaje |
| Parametros totales | ~180B (125B según la model card, con ~6B activos; cifras del autor, posible inconsistencia) |
| Parametros activos | ~6B |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | EXL3 a 2.05bpw (h4_ng4); existen releases derivados en BF16, FP8 (block-FP8) y MLX (4/6/8 bits) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (ExLlamaV3); el modelo base en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un Mixture-of-Experts con 512 expertos y enrutamiento top-10, aproximadamente 180B parámetros totales y unos 6B activos por token. Incorpora atención híbrida, una torre de visión nativa (pipeline image-text-to-text) y una cabeza MTP que permite decodificación especulativa para acelerar la inferencia. El contexto alcanza los 262K tokens.

Esta publicación concreta es una conversión a EXL3 a 2,05 bits por peso realizada por undefined1behavior, siguiendo la especificación de turboderp/Qwen3.8-Flash-Next-exl3 (2.05bpw_h4_ng4) y preservando las cabezas MTP funcionales. El modelo fuente es la build abliterated de orcarouter, que aplica abliteración (ortogonalización de la dirección de rechazo en el flujo residual) sobre los pesos BF16 originales de Qwen. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la model card proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento flexible (thinking mode).
- Comprensión de imagen y vídeo (modelo visión-lenguaje nativo, pipeline image-text-to-text).
- Generación de código y matemáticas (heredadas del modelo base Qwen).
- Tool calling y function calling.
- Razonamiento multi-paso y soporte para flujos de agentes.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Decodificación especulativa mediante cabezas MTP funcionales en esta conversión.
- Comportamiento sin rechazo (uncensored) por efecto de la abliteración: responde a solicitudes que el modelo original rechazaría.

## Casos de uso

- Investigación en seguridad de IA e interpretabilidad: el modelo permite estudiar los mecanismos de rechazo y la dirección de abliteración comparando respuestas frente al modelo original alineado.
- Red teaming y evaluación de robustez: sirve para generar ataques y casos límite que prueben las defensas de otros sistemas, dado que no aplica guardarraíles propios.
- Análisis de imágenes y vídeo a gran escala: con 262K de contexto y torre de visión, puede procesar documentos escaneados, capturas o secuencias de vídeo junto a instrucciones extensas.
- Experimentación con decodificación especulativa: las cabezas MTP funcionales permiten medir el impacto de la predicción multi-token en latencia y throughput sobre EXL3.
- Fine-tuning e investigación de post-entrenamiento: los pesos fuente BF16 y las conversiones derivadas sirven como base para experimentos controlados de ajuste.
- Despliegue local de un MoE de gran escala en hardware de consumo o semi-profesional: la cuantización a 2,05 bpw reduce drásticamente los requisitos de VRAM frente a BF16, habilitando pruebas en una o dos GPU.
- Evaluación comparativa de cuantizaciones: útil para contrastar la calidad de EXL3 2,05 bpw frente a FP8 o MLX en tareas de razonamiento y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que se espera un rendimiento similar al de turboderp/Qwen3.8-Flash-Next-exl3-2.05bpw_h4_ng4, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: con ~180B parámetros a 2,05 bpw, el peso ronda los 45-50 GB, más overhead de caché KV y activaciones; se estima un mínimo práctico de 48-64 GB de VRAM para contexto moderado, y bastante más para contextos cercanos a 262K.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB o 2× RTX 5090) para repartir los pesos.
- GPU de consumo: una única RTX 4090 (24 GB) no es suficiente para los pesos completos a 2,05 bpw; sería necesario offload a RAM o configuraciones multi-GPU.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3); las versiones BF16/FP8 pueden servirse con vLLM o TGI, y las MLX en Apple Silicon.
- Latencia y throughput: no disponibles. La presencia de cabezas MTP funcionales debería mejorar el throughput frente a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-exl3 (este) | ~180B totales / ~6B activos | 262K | Apache 2.0 | EXL3 2,05 bpw | Abliterated, MTP funcional, visión |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B totales / ~6B activos | 262K | Apache 2.0 | BF16 safetensors | Alineado, con rechazo |
| turboderp/Qwen3.8-Flash-Next-exl3 | ~180B totales / ~6B activos | 262K | Apache 2.0 | EXL3 2,05 bpw | Referencia de cuantización, alineado |
| Qwen3.8-Flash-Next-Uncensored (BF16) | ~180B totales / ~6B activos | 262K | Apache 2.0 | BF16 safetensors | Fuente abliterated de esta conversión |

## Limitaciones y advertencias

- La abliteración elimina sustancialmente la alineación de seguridad: el modelo cumplirá solicitudes dañinas, poco éticas, ofensivas o ilegales que el original rechazaría. No tiene guardarraíles integrados.
- Riesgo elevado de contenido nocivo y de uso indebido; el autor lo restringe a investigación legítima (interpretabilidad, seguridad de IA, red teaming).
- No debe desplegarse ante usuarios finales ni en producción sin capas propias de moderación y prevención de abuso.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados que lo caractericen.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está documentado.
- La cuantización a 2,05 bpw puede degradar la calidad respecto a BF16 o FP8, especialmente en tareas sensibles a precisión.
- Posible inconsistencia en las cifras de parámetros de la model card (~180B frente a 125B), que conviene verificar contra el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y ética del uso recae enteramente en el usuario.

## Enlaces

- Hugging Face: https://huggingface.co/undefined1behavior/Qwen3.8-Flash-Next-Uncensored-exl3
- Rama de descarga 2.05bpw_h4_ng4: https://huggingface.co/undefined1behavior/Qwen3.8-Flash-Next-Uncensored-exl3/tree/2.05bpw_h4_ng4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de referencia: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Fuente abliterated: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- OrcaRouter: https://www.orcarouter.ai
- GitHub de OrcaRouter: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
