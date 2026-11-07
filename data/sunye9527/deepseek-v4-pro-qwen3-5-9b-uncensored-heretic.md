# sunye9527/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es sunye9527, que aplicó la herramienta Heretic v2.0.0.dev0 para eliminar total o parcialmente los comportamientos de rechazo del modelo base mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24.

El modelo base concentra su señal de entrenamiento supervisado en matemáticas y resolución de problemas STEM, con aproximadamente 250.000 muestras, preservando la eficiencia y desplegabilidad práctica de la clase de 9B parámetros. Es un modelo multimodal (image-text-to-text) con capacidades de razonamiento, tool calling y function calling, y soporte para seis idiomas: inglés, chino, coreano, japonés, español y ruso.

La relevancia de esta variante concreta reside en su perfil de comportamiento: según la model card, reduce los rechazos de 100/100 en el modelo original a 3/100 en esta versión, con una divergencia KL de 0,0422 respecto al original. Esto la hace interesante para investigadores que necesitan estudiar el comportamiento de modelos sin capas de rechazo, aunque con las advertencias de seguridad y licencia que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5), fine-tune de razonamiento con destilación; multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (existe version GGUF publicada por mradermacher; la model card menciona evaluacion con MTP-Q8_0 y NVFP4) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB); existe variante GGUF de terceros |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado a partir de respuestas de DeepSeek-V4-Pro en modo Max Effect. El entrenamiento se centra en aproximadamente 250.000 muestras de matemáticas y STEM, con un pipeline que combina SFT y RL (la etiqueta del modelo incluye gspo, sft y rl). La model card menciona además evaluación mediante MTP (multi-token prediction) y rutas de despliegue con vLLM NVFP4 y llama.cpp MTP-Q8_0. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá del foco en matemáticas y STEM.

La variante aquí descrita aplica Heretic v2.0.0.dev0, una técnica de ablación de rangos arbitrarios (ARA) que modifica los pesos en un rango de capas (start_layer_index 9, end_layer_index 24) con parámetros concretos: preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. El objetivo es preservar el comportamiento útil mientras se eliminan las respuestas de rechazo. El resultado reportado es una reducción de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 frente al modelo original.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas.
- Razonamiento matemático y STEM reforzado por destilación (aproximadamente 250.000 muestras).
- Capacidades multimodales image-text-to-text (según el pipeline declarado).
- Tool calling y function calling (etiquetas tool-use y function-calling).
- Soporte de agentes y razonamiento multi-paso.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) heredado del fine-tune base.
- Comportamiento decensored: rechazos reducidos a 3/100 según la model card.
- Transferencia cross-domain: la model card indica pequeñas mejoras en programación y uso de herramientas pese a no recibir SFT específico de código.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo varía el comportamiento al eliminar capas de rechazo, comparando con el original (100/100 frente a 3/100 rechazos) y midiendo la divergencia KL de 0,0422.
- Tutoría de matemáticas y STEM: el foco de entrenamiento en ~250.000 muestras de matemáticas y ciencia lo hace adecuado para explicar y resolver problemas paso a paso en entornos educativos controlados.
- Evaluación de robustez de salvaguardas: útil para probar pipelines de moderación y detección de contenido, ya que genera respuestas que un modelo alineado rechazaría.
- Asistente técnico multilingüe: con soporte para seis idiomas (en, zh, ko, ja, es, ru), puede integrarse en herramientas de soporte para equipos distribuidos.
- Automatización con tool calling: las etiquetas de function-calling y tool-use permiten integrarlo en flujos de agentes que consultan APIs o ejecutan acciones, siempre con validación externa.
- Experimentación con cuantización y despliegue: la existencia de una variante GGUF de terceros y las evaluaciones con NVFP4 y MTP-Q8_0 permiten probar rutas de inferencia en hardware consumer.
- Generación de datos sintéticos para investigación: su perfil sin rechazos puede emplearse para crear datasets de estudio, con revisión humana obligatoria.

## Benchmarks y rendimiento

La model card solo reporta métricas del proceso de decensoring, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, más overhead de contexto (el repo safetensors ocupa 18,8 GB).
- Cuantización a 8 bits: en torno a 10-11 GB de VRAM; a 4 bits: en torno a 5-6 GB (estimaciones según tamaño de parámetros, no confirmadas en la información disponible).
- GPU recomendadas: A100 o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o cuantización 8 bits.
- Cabe en GPU consumer: sí, en cuantización 4-8 bits en tarjetas de 8-24 GB (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque el contexto disponible limitará la ventana efectiva.
- Opciones de despliegue: transformers, vLLM (evaluado con NVFP4 según la model card), llama.cpp (evaluado con MTP-Q8_0), TGI (etiqueta text-generation-inference) y variantes GGUF de terceros.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,4B | no disponible | apache-2.0 | Decensored con Heretic; 3/100 rechazos; KL 0,0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | apache-2.0 | Modelo base; 100/100 rechazos; foco math/STEM |
| Qwen3.5-9B | 9B (aprox.) | no disponible | no disponible | Modelo origen del fine-tune; sin datos de rendimiento en la información disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo decensored: la eliminación de rechazos implica que puede generar contenido dañino, ilegal o sensible; requiere moderación externa en cualquier despliegue.
- Riesgo de alucinación: como todo modelo de 9B, puede inventar hechos, especialmente fuera de matemáticas y STEM.
- La ablación ARA modifica pesos en capas 9-24; puede degradar sutilmente capacidades no medidas (la KL de 0,0422 indica cambios no nulos).
- Longitud de contexto no documentada en la información disponible; no asumir ventanas largas sin verificación.
- Idiomas limitados a seis (en, zh, ko, ja, es, ru); el rendimiento en español no está cuantificado.
- Licencia apache-2.0 permite uso comercial, pero el comportamiento sin rechazos puede incumplir políticas de plataformas o normativas locales; la responsabilidad recae en el desplegador.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni reportes independientes de calidad.
- La model card incluye HTML y contenido extenso; parte de la información técnica del base model no está disponible en la fuente consultada.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/sunye9527/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Espejo/tercero en Hugging Face: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Versión GGUF de terceros: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Heretic (herramienta de decensoring): https://heretic-project.org
