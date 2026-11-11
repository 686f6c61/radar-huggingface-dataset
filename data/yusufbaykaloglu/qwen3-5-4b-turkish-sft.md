# yusufbaykaloglu/qwen3.5-4b-turkish-sft

## Resumen

Qwen3.5-4B Turkish SFT es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario yusufbaykaloglu, orientado a mejorar el rendimiento en turco. El modelo parte de una arquitectura híbrida de atención (lineal y completa) con 32 capas, un tamaño oculto de 2560 y una ventana de contexto de 262.144 tokens, lo que lo sitúa en la categoría de modelos compactos con contexto muy largo.

El ajuste se realizó mediante LoRA en precisión bf16 con la librería Unsloth, empleando el subconjunto "edit" del dataset helpsteer3-tr (13.740 muestras de entrenamiento, 2 épocas, rango LoRA 16). Solo se entrenaron 21,2 millones de parámetros (0,47% del total), con una pérdida final de 1,0971 tras aproximadamente 7,8 horas en una GPU A100. El resultado es un modelo que conserva la arquitectura multimodal del base (etiqueta image-text-to-text) pero cuyo ajuste se centra en instrucciones y razonamiento en turco.

Su relevancia radica en ofrecer una alternativa ligera (4,66 mil millones de parámetros reales según safetensors) con licencia Apache 2.0, contexto de 256K y versiones GGUF cuantizadas para despliegue en hardware modesto, lo que facilita su uso en producción para aplicaciones en turco con requisitos de privacidad o coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer híbrido: atención lineal + atención completa) |
| Parámetros totales | 4.659.865.088 (4,66 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q4_K_M (2,7 GB), Q8_0 (4,5 GB), BF16-mmproj (676 MB); pesos base en bfloat16 |
| Idiomas soportados | Turco (tr) y inglés (en) según model card; etiqueta de idioma oficial: tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3_5ForConditionalGeneration del base Qwen/Qwen3.5-4B: 32 capas con combinación de atención lineal y atención completa (híbrida), tamaño oculto de 2560 y una ventana de contexto de 262.144 tokens. El ajuste fino se aplicó exclusivamente mediante LoRA en bf16 con Unsloth, con rango y alpha de 16, dirigido a los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. Se entrenaron 21,2 M de parámetros (0,47% del total) durante 2 épocas sobre 13.740 muestras del subconjunto "edit" del dataset helpsteer3-tr, con longitud máxima de secuencia de 2048, learning rate 2e-4 con scheduler coseno y 3% de warmup, batch efectivo de 16 y optimizador AdamW de 8 bits.

No se documentan en la información disponible detalles sobre la composición completa del dataset base, el número total de tokens de preentrenamiento ni si hubo etapas de RLHF o DPO posteriores al SFT. La innovación técnica destacable es la combinación de atención lineal y completa del modelo base, que permite manejar contextos muy largos con coste computacional reducido, junto con el modo "thinking" activado por defecto que el autor menciona en la model card.

## Capacidades

- Generación de texto conversacional e instrucciones en turco, con soporte secundario de inglés.
- Razonamiento y modo "thinking" (pensamiento explícito) activado por defecto; se puede desactivar con `enable_thinking=False`.
- Procesamiento multimodal de entrada image-text-to-text, heredado de la arquitectura del modelo base (etiqueta del repositorio).
- Soporte de plantilla de chat mediante `apply_chat_template` del procesador.
- Manejo de contextos largos de hasta 262.144 tokens.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documentan capacidades de agente multi-paso ni de audio en la información disponible.

## Casos de uso

- Atención al cliente en turco: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 262.144 tokens, manteniendo el hilo de la conversación y el historial de incidencias sin truncamientos.
- Asistentes de documentación técnica: con 256K de contexto puede procesar manuales extensos en turco y responder preguntas concretas citando secciones, útil para soporte interno de empresas turcohablantes.
- Generación y revisión de código con explicaciones en turco: el ajuste sobre instrucciones permite pedir explicaciones, refactorizaciones o correcciones en turco, integrándose en editores o pipelines de CI/CD mediante la API de transformers.
- Despliegue en local con privacidad de datos: las versiones GGUF Q4_K_M (2,7 GB) y Q8_0 (4,5 GB) permiten ejecutar el modelo en estaciones de trabajo sin GPU dedicada o con GPU de consumo, manteniendo los datos en la infraestructura propia.
- Análisis y resumen de documentos largos: la ventana de 262K tokens permite resumir informes, contratos o expedientes completos en una sola pasada, algo relevante en sectores legales y administrativos en Turquía.
- Prototipado rápido de aplicaciones de razonamiento: el modo thinking permite obtener cadenas de razonamiento para tareas de matemáticas o lógica, y desactivarlo reduce latencia en respuestas directas.
- Fine-tuning posterior o adaptación de dominio: al ser un modelo pequeño (4,66 B) con licencia Apache 2.0, sirve como base para nuevos ajustes LoRA en dominios específicos con coste reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16 GB para contextos moderados.
- VRAM estimada en Q8_0 (4,5 GB): alrededor de 6-8 GB según longitud de contexto.
- VRAM estimada en Q4_K_M (2,7 GB): alrededor de 4-6 GB, apta para GPU de consumo.
- GPU recomendadas: A100 (usada en el entrenamiento), H100 para mayor throughput, RTX 4090 o RTX 3090 para inferencia en bf16 con contexto largo; RTX 4060 Ti 16 GB o similares para cuantizaciones.
- Cabe en GPU de consumo: sí, en versiones GGUF Q4_K_M y Q8_0; en bf16 requiere GPU de 16 GB o más.
- Opciones de despliegue: transformers (código de ejemplo en la model card), llama.cpp/Ollama a través de los GGUF, y text-generation-inference (etiqueta del repositorio). vLLM y TGI no se confirman explícitamente para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B Turkish SFT | 4,66 B | 262.144 | Apache 2.0 | tr, en | SFT LoRA sobre helpsteer3-tr; GGUF disponible |
| Qwen/Qwen3.5-4B (base) | 4,66 B | 262.144 | Apache 2.0 (según base) | multilingüe (no detallado) | Modelo base sin ajuste específico en turco |
| Otros modelos turcos de ~4B | no disponible | no disponible | no disponible | tr | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- El ajuste se realizó solo sobre el subconjunto "edit" de helpsteer3-tr, por lo que el sesgo del dataset puede trasladarse al modelo y su cobertura temática es limitada.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento con modo thinking activado.
- El idioma principal es el turco; el rendimiento en otros idiomas, incluido el inglés, puede degradarse respecto al modelo base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B y del dataset helpsteer3-tr para uso comercial.
- El modo thinking está activado por defecto, lo que incrementa la latencia y el consumo de tokens; para producción con respuestas directas debe configurarse `enable_thinking=False`.
- La longitud máxima de entrenamiento fue de 2048 tokens, por lo que el rendimiento en contextos muy largos (hasta 262K) no está validado por el ajuste SFT, aunque la arquitectura lo soporte.
- No se documentan evaluaciones de seguridad, sesgos de género o toxicidad; se recomienda auditoría previa a despliegues en producción.
- El repositorio tiene pocas descargas (139) y likes (2), lo que indica escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yusufbaykaloglu/qwen3.5-4b-turkish-sft
- Versiones GGUF: https://huggingface.co/yusufbaykaloglu/qwen3.5-4b-turkish-sft-gguf
- Dataset helpsteer3-tr: https://huggingface.co/datasets/yusufbaykaloglu/helpsteer3-tr
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Unsloth: https://github.com/unslothai/unsloth
