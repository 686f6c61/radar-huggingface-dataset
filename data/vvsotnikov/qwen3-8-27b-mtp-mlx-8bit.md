# vvsotnikov/Qwen3.8-27B-MTP-MLX-8bit

## Resumen

Qwen3.8-27B-MTP-MLX-8bit es un modelo drafter (modelo de borrador) diseñado exclusivamente para decodificación especulativa junto al modelo principal Qwen/Qwen3.8-27B. No es un modelo autónomo: contiene únicamente la cabeza de predicción multi-token (MTP) que Qwen incluye en el checkpoint base, pero que el convertidor de MLX elimina al construir el modelo principal. Por tanto, no puede generar texto por sí mismo y debe cargarse como modelo de borrador junto a su modelo objetivo, que aporta los embeddings y la cabeza de salida.

El autor, vvsotnikov, ha extraído los 15 tensores bajo el prefijo `mtp.` del checkpoint original, los ha cuantizado a 8 bits con MLX (grupo de 64) y los publica por separado para que el runtime de mlx-vlm pueda cargarlos como un modelo independiente con `model_type: qwen3_5_mtp`. Con solo 119 millones de parámetros, este drafter propone tokens que el modelo objetivo verifica, logrando una tasa de aceptación del 94,2% y 2,88 tokens aceptados por ronda según las pruebas del autor. Es relevante porque permite acelerar la inferencia de Qwen3.8-27B en hardware Apple Silicon sin degradar la calidad de salida, ya que solo los tokens aceptados llegan al resultado final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_mtp (cabeza MTP, bloque de tamaño 3) |
| Parametros totales | 119.465.472 (0,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo; el base Qwen3.8-27B soporta 256K) |
| Tipos de cuantizacion | MLX affine 8-bit, grupo de 64 (tambien disponible en bf16 y 4-bit) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (hereda de Qwen/Qwen3.8-27B) |
| Formato de pesos | Safetensors con config y tokenizer compatibles con MLX |

## Arquitectura y entrenamiento

El modelo es una cabeza MTP (Multi-Token Prediction) extraída del checkpoint Qwen/Qwen3.8-27B. La arquitectura del modelo base es un transformer denso híbrido con Gated Delta Networks (GDN) y encoder de visión, pero este drafter solo contiene las proyecciones y normalizaciones de la cabeza MTP: 8 proyecciones cuantizadas y 7 normas densas, en total 31 tensores. El bloque MTP tiene tamaño 3, es decir, propone hasta 3 tokens por paso.

No se ha realizado entrenamiento adicional: el autor simplemente separó los tensores `mtp.*` del checkpoint original y los cuantizó con redondeo al más cercano (round-to-nearest), ya que AWQ requiere un pase hacia adelante que un drafter no puede ejecutar por sí solo. El drafter se enlaza en tiempo de ejecución con los embeddings del modelo objetivo, por lo que debe usarse siempre con el checkpoint del que procede.

## Capacidades

- Decodificación especulativa: propone tokens candidatos que el modelo objetivo verifica, acelerando la generación sin cambiar la distribución de salida.
- Integración con mlx-vlm: se detecta automáticamente el tipo `qwen3_5_mtp` y se activa el modo `--draft-kind mtp` sin configuración adicional.
- Compatibilidad con el modo thinking del modelo base (activado con `--enable-thinking`).
- No genera texto de forma autónoma: carece de embeddings y de `lm_head`.
- Soporte de cuantización en 8-bit, 4-bit y bf16 para ajustar el equilibrio entre tamaño del drafter y tasa de aceptación.
- Funciona únicamente con el modelo objetivo Qwen3.8-27B del mismo checkpoint; pares desajustados fallan o producen borradores deficientes.

## Casos de uso

- Aceleración de inferencia en Apple Silicon: al ejecutar Qwen3.8-27B con mlx-vlm en una Mac, este drafter reduce la latencia por token al proponer múltiples tokens por paso, útil para aplicaciones interactivas de chat o asistentes en tiempo real.
- Despliegue en entornos con memoria limitada: al ocupar solo 0,5 GB, puede cargarse junto al modelo principal en configuraciones donde la VRAM o RAM unificada es escasa, manteniendo la calidad del modelo base.
- Generación de código asistida: el ejemplo de la documentación muestra cómo usarlo para escribir código (por ejemplo, quicksort en Python) con `--enable-thinking`, aprovechando la aceleración sin sacrificar precisión.
- Evaluación de decodificación especulativa: investigadores pueden comparar la tasa de aceptación y el throughput entre las versiones bf16, 8-bit y 4-bit del drafter para optimizar su pipeline.
- Integración en pipelines de MLX: desarrolladores que ya usan mlx-vlm pueden añadir el drafter con un simple flag `--draft-model`, sin cambios en el código de generación.
- Prototipado de agentes conversacionales: en entornos de desarrollo donde se itera rápido, la menor latencia permite probar flujos multi-turno con el modelo Qwen3.8-27B de forma más ágil.

## Benchmarks y rendimiento

El autor publica los siguientes resultados de verificación del drafter en su model card:

| Metrica | Valor |
|---|---|
| Tasa de aceptacion de tokens | 94,2% |
| Tokens aceptados por ronda | 2,88 |
| Rondas evaluadas | 69 |
| Throughput | 16.021 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este drafter, ya que no es un modelo generativo independiente. El rendimiento de calidad corresponde al modelo objetivo Qwen3.8-27B.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB para el drafter en 8-bit (119M parámetros). El modelo objetivo Qwen3.8-27B requiere memoria adicional según su cuantización (típicamente 16-20 GB en 8-bit, 10-14 GB en 4-bit).
- GPU recomendadas: cualquier hardware compatible con MLX, principalmente Apple Silicon (M1/M2/M3/M4) con memoria unificada de al menos 32 GB para el par completo.
- No cabe en GPUs consumer de NVIDIA de gama baja si se usa con el modelo objetivo completo; el drafter en sí es trivial, pero el target de 27B necesita al menos 16 GB de VRAM en cuantización 4-bit.
- Opciones de despliegue: mlx-vlm 0.6.8 o superior, con los flags `--model` (target) y `--draft-model` (este drafter). No es compatible con vLLM, llama.cpp u Ollama porque está diseñado específicamente para el runtime MLX.
- Latencia y throughput: el autor reporta 16.021 tok/s en su entorno de verificación, pero el valor real depende del hardware y del modelo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tasa de aceptacion | Uso |
|---|---|---|---|---|
| Qwen3.8-27B-MTP-MLX-8bit (este) | 119M | 8-bit, grupo 64 | 94,2% | Drafter para Qwen3.8-27B |
| Qwen3.8-27B-MTP-MLX-bf16 | 119M | bf16 | no disponible | Drafter para Qwen3.8-27B |
| Qwen3.8-27B-MTP-MLX-4bit | 119M | 4-bit | no disponible | Drafter para Qwen3.8-27B |

No hay otros modelos comparables en el ecosistema MLX con esta función específica (cabeza MTP separada). La comparativa relevante es entre las tres versiones del mismo drafter, donde se intercambia tamaño contra tasa de aceptación. El modelo base Qwen3.8-27B es el punto de referencia de calidad, pero no es un drafter.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede generar texto por sí mismo; cargarlo sin el modelo objetivo produce un error o una salida vacía.
- Debe emparejarse con el checkpoint exacto del que procede (Qwen/Qwen3.8-27B). Usarlo con otro modelo objetivo falla en la comprobación de tamaño oculto o produce borradores de baja calidad.
- Solo soporta inglés según la etiqueta de idioma; el modelo base puede tener capacidades multilingües, pero el drafter no las añade.
- La cuantización 8-bit con redondeo al más cercano puede introducir ligeras diferencias en la distribución de tokens propuestos respecto al drafter original en bf16, aunque la tasa de aceptación reportada es alta.
- Licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Qwen3.8-27B para confirmar que no hay restricciones adicionales.
- El rendimiento de 16.021 tok/s es una medición del autor en un entorno concreto; puede variar significativamente según el hardware y la configuración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vvsotnikov/Qwen3.8-27B-MTP-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Versión bf16 del drafter: https://huggingface.co/vvsotnikov/Qwen3.8-27B-MTP-MLX-bf16
- Versión 4-bit del drafter: https://huggingface.co/vvsotnikov/Qwen3.8-27B-MTP-MLX-4bit
- Documentación de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Guía de hardware y despliegue de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Documentación de SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Anuncio de Qwen3.8: https://openlm.ai/qwen3.8/
