# turboderp/Hy4-flash-exl3

## Resumen

Hy4-flash-exl3 es una colección de cuantizaciones EXL3 del modelo multimodal Hy4-flash, desarrollado originalmente por Tencent. El autor de la cuantización es turboderp, creador del motor de inferencia ExLlamaV3, y el repositorio se publica como artefacto derivado del modelo base `tencent/Hy4-flash` con relación `quantized`. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base acepta entradas de imagen y texto y genera texto.

El interés de esta ficha radica en que ofrece versiones de muy baja precisión (desde 2,00 bits por peso) pensadas para ejecutar un modelo multimodal de gran tamaño en hardware con VRAM limitada. Las cuantizaciones EXL3 están diseñadas específicamente para ExLlamaV3, por lo que su uso está restringido a ese motor de inferencia y no son compatibles con llama.cpp, Ollama, vLLM ni TGI.

La información pública disponible sobre esta publicación es muy escasa: no se declaran idiomas soportados, no hay datos de benchmarks en la model card y el número de descargas y likes es cero en el momento de la consulta. Los detalles de arquitectura, parámetros y contexto deben atribuirse al modelo base de Tencent, no a esta cuantización, y no están incluidos en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (definida en `tencent/Hy4-flash`) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 en 2,00, 2,50, 3,00, 3,50 y 4,00 bits por peso (ramas `sc_*bpw`) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (heredada del modelo base) |
| Formato de pesos | EXL3 (requiere ExLlamaV3 v1.6.8 o rama `dev`) |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es una cuantización del modelo base `tencent/Hy4-flash`. La técnica aplicada es EXL3, el formato de cuantización propio de ExLlamaV3, que combina cuantización de pesos con corrección de errores y ofrece variantes "SC" (single-column / scale-corrected según la nomenclatura del autor) a distintos niveles de bits por peso. La model card incluye gráficas de calidad (`qb_kld` y `qb_ppl`) que comparan la perplejidad y la divergencia KL frente a la cuantización, pero no se proporcionan los valores numéricos en el texto.

No se dispone de información sobre la arquitectura interna del modelo base (tipo de transformer, si es denso o MoE, número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal) en la documentación proporcionada. Cualquier afirmación al respecto requeriría consultar la model card de `tencent/Hy4-flash`.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen y texto), según el pipeline `image-text-to-text` declarado.
- Procesamiento de imágenes junto con instrucciones en lenguaje natural, heredado del modelo base.
- El resto de capacidades (razonamiento multi-paso, tool calling, agentes, modo thinking, audio, multilingüismo) no están documentadas en esta publicación y deben verificarse en la model card del modelo base.
- La cuantización EXL3 preserva las capacidades del modelo original en la medida en que la pérdida de precisión sea aceptable; las gráficas de perplejidad y KLD sugieren que el autor midió esa degradación, pero no se publican cifras.

## Casos de uso

- Despliegue de un modelo multimodal en GPU de consumo: las variantes de 2,00 y 2,50 bpw reducen drásticamente la huella de VRAM y permiten probar el modelo en tarjetas de 24 GB o menos, siempre que el tamaño real del modelo base lo permita.
- Prototipado rápido de aplicaciones imagen-texto: usar la variante de 4,00 bpw para obtener la mayor fidelidad posible dentro de EXL3 antes de decidir si merece la pena servir el modelo en precisión completa.
- Evaluación comparativa de cuantizaciones: las cinco ramas permiten medir el impacto de la precisión en tareas concretas (descripción de imágenes, VQA, OCR) usando las gráficas de KLD y perplejidad como referencia inicial.
- Inferencia local en estaciones de trabajo con una sola GPU: ExLlamaV3 está optimizado para GPUs NVIDIA consumer y de gama alta, lo que encaja con entornos de investigación sin clúster.
- Generación de descripciones y etiquetado de imágenes a pequeña escala: pipelines internos donde el coste por token importa y se prefiere hardware propio a APIs externas.
- Experimentación académica con modelos multimodales cuantizados: permite reproducir experimentos con requisitos de VRAM reducidos y comparar frente a otras técnicas de cuantización (GPTQ, AWQ, GGUF) en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye dos gráficas (`qb_kld` y `qb_ppl`) sin valores numéricos accesibles en el texto.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud porque se desconoce el número de parámetros del modelo base. Como referencia, a 2,00 bpw un modelo de 30B ocuparía aproximadamente 7,5 GB solo en pesos, más overhead de contexto y caché KV; a 4,00 bpw, unos 15 GB.
- GPU recomendadas: no disponibles. ExLlamaV3 funciona en GPUs NVIDIA con soporte CUDA; para modelos multimodales grandes se recomiendan A100/H100 o RTX 4090/5090 según el tamaño.
- Cabe en GPU de consumo: probable en las variantes de 2,00-3,00 bpw si el modelo base no supera los ~30B parámetros; no confirmado.
- Opciones de despliegue: exclusivamente ExLlamaV3 v1.6.8 o rama `dev`. No compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| turboderp/Hy4-flash-exl3 | no disponible | no disponible | EXL3 (2,00-4,00 bpw) | tencent-hy-license | ExLlamaV3 |
| tencent/Hy4-flash | no disponible | no disponible | safetensors (presumible) | tencent-hy-license | Múltiples |
| Otras cuantizaciones de Hy4-flash | no disponible | no disponible | no disponible | tencent-hy-license | no disponible |

No se dispone de información sobre cuantizaciones alternativas del mismo modelo base ni de modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia `tencent-hy-license` es distinta de las licencias open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Las cuantizaciones a 2,00 y 2,50 bpw introducen degradación medible en perplejidad y KLD; para tareas sensibles a la precisión (OCR fino, razonamiento matemático) conviene usar 3,50 o 4,00 bpw.
- Dependencia estricta de ExLlamaV3 v1.6.8 o la rama `dev`: no hay compatibilidad con otros motores, lo que limita la portabilidad y el despliegue en producción.
- No se documentan idiomas soportados; el rendimiento en castellano no está verificado.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en esta publicación.
- Sesgos del modelo base no documentados en esta model card; deben consultarse en la del modelo original.
- El repositorio tiene cero descargas y cero likes, por lo que no hay evidencia de uso en producción ni informes de la comunidad.
- La fecha de creación (2026-11-25) es posterior a la fecha habitual de consulta; verificar que el repositorio sigue disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/turboderp/Hy4-flash-exl3
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Rama 2,00 bpw: https://huggingface.co/turboderp/Hy4-flash-exl3/tree/sc_2.00bpw
- Rama 2,50 bpw: https://huggingface.co/turboderp/Hy4-flash-exl3/tree/sc_3.50bpw (etiquetada como 2,50 en el texto de la model card; verificar)
- Rama 3,00 bpw: https://huggingface.co/turboderp/Hy4-flash-exl3/tree/sc_3.00bpw
- Rama 3,50 bpw: https://huggingface.co/turboderp/Hy4-flash-exl3/tree/sc_4.50bpw (etiquetada como 3,50 en el texto de la model card; verificar)
- Rama 4,00 bpw: https://huggingface.co/turboderp/Hy4-flash-exl3/tree/sc_4.00bpw
- Gráfica KLD: https://cdn-uploads.huggingface.co/production/uploads/6383dc174c48969dcf1b4fce/INtY2bTwAZkUF9mQq7yhi.png
- Gráfica perplejidad: https://cdn-uploads.huggingface.co/production/uploads/6383dc174c48969dcf1b4fce/mbycGrIYouX0OXqjIjwNx.png
