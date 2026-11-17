# TeamAIQ/LongCat-Video-Avatar-1.6-INT8-ConvRot

## Resumen

LongCat-Video-Avatar-1.6-INT8-ConvRot es una versión cuantizada a INT8 del modelo de generación de vídeo con avatar meituan-longcat/LongCat-Video-Avatar-1.6, desarrollado originalmente por Meituan LongCat. La cuantización la ha realizado el equipo AIQUEST (publicada bajo el identificador TeamAIQ) y su objetivo es reducir el coste de memoria y acelerar la inferencia del modelo original mediante kernels INT8 de tensor cores, sin alterar el resultado numérico de cada capa.

El modelo mantiene la arquitectura del original (un transformer de difusión para generación de vídeo condicionada por audio y avatar), pero sustituye las matrices lineales de los bloques del transformer por pesos INT8 con una escala FP32 por canal de salida, aplicando previamente una rotación de Hadamard (ConvRot) sobre los canales de entrada en grupos de 256. Esta técnica de rotación distribuye los valores atípicos y permite cuantizar a 8 bits con pérdida mínima de calidad.

Es relevante porque permite ejecutar un modelo de generación de vídeo-avatar de gran tamaño en entornos con recursos limitados, integrándose directamente en Wan2GP y en los kernels INT8 de Comfy Kitchen. El repositorio ocupa 21,9 GB y se distribuye con licencia MIT, heredando los términos de uso del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (hereda la del modelo base LongCat-Video-Avatar-1.6) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 con escala FP32 por canal de salida y rotación ConvRot (Hadamard) en grupos de 256 |
| Idiomas soportados | no disponible |
| Licencia | MIT (se aplican los términos del modelo base) |
| Formato de pesos | safetensors (INT8 + escalas FP32 + configuración de capa) |

## Arquitectura y entrenamiento

El modelo es una cuantización del transformer de difusión LongCat-Video-Avatar-1.6, orientado a la generación de vídeo con avatar. En esta versión INT8 ConvRot, las matrices lineales de los bloques del transformer se almacenan en INT8 con una escala FP32 por canal de salida, tras aplicar una rotación de Hadamard (ConvRot) sobre los canales de entrada en grupos de 256. Los kernels INT8 rotan las activaciones de la misma forma, de modo que cada capa conserva su resultado original mientras los valores atípicos se mantienen pequeños. Las embeddings, normas, sesgos, proyecciones AdaLN y las capas de entrada y salida conservan su precisión original.

Cada capa cuantizada se representa con tres tensores: `<name>.weight` (I8), `<name>.weight_scale` (F32) y `<name>.comfy_quant` (configuración de capa). Los metadatos del fichero declaran `quantization_format: int8_convrot` y `convrot_format: comfy_quant_v1`. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO, ya que la model card no los detalla y corresponden al modelo base.

## Capacidades

- Generación de vídeo con avatar a partir del modelo base LongCat-Video-Avatar-1.6.
- Inferencia acelerada mediante kernels INT8 de tensor cores de Comfy Kitchen.
- Carga directa en Wan2GP.
- Preservación de la precisión original en embeddings, normas, sesgos, proyecciones AdaLN y capas de entrada/salida.
- Compatibilidad con el ecosistema de cuantización Comfy (`comfy_quant_v1`).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües específicas.

## Casos de uso

- Generación de vídeo-avatar en producción con recursos limitados: la cuantización INT8 reduce el peso de los pesos lineales del transformer, permitiendo desplegar el modelo en GPUs con menos VRAM que las necesarias para el modelo en precisión completa.
- Integración en pipelines de ComfyUI/Wan2GP: el modelo carga directamente en Wan2GP y usa los kernels INT8 de Comfy Kitchen, lo que facilita su incorporación en flujos de trabajo existentes de generación de vídeo.
- Prototipado rápido de avatares animados: al reducir el coste de inferencia, permite iterar sobre prompts y configuraciones con menor latencia.
- Investigación en cuantización de modelos de difusión de vídeo: sirve como referencia para evaluar el impacto de la rotación ConvRot y la cuantización INT8 en la calidad final del vídeo generado.
- Despliegue en entornos con presupuesto de memoria ajustado: el repositorio de 21,9 GB (16,9 GB de pesos INT8 + 5 GB de LoRAs) es más manejable que el modelo base en precisión completa.
- Evaluación comparativa de calidad INT8 vs. original: útil para medir la degradación introducida por la cuantización en tareas de generación de avatar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos INT8 del transformer ocupa 16,9 GB, más 5 GB de LoRAs (2,5 GB cada una) y los tensores en precisión original (embeddings, normas, sesgos, AdaLN, entrada/salida).
- GPU recomendadas: no disponible; se requiere soporte de kernels INT8 de tensor cores (Comfy Kitchen).
- ¿Cabe en GPU de consumo? no disponible; el tamaño de los pesos (16,9 GB solo el transformer) sugiere que no cabe en GPUs de 8-12 GB y probablemente requiera 24 GB o más, pero no se confirma en la información.
- Opciones de despliegue: Wan2GP y kernels INT8 de Comfy Kitchen (según la model card).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCat-Video-Avatar-1.6-INT8-ConvRot | no disponible | no disponible | INT8 ConvRot | MIT | Hugging Face (TeamAIQ) |
| meituan-longcat/LongCat-Video-Avatar-1.6 (base) | no disponible | no disponible | precisión original | MIT (según base) | Hugging Face (meituan-longcat) |
| Otras alternativas de vídeo-avatar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- La cuantización INT8 puede introducir una degradación sutil de calidad respecto al modelo base, aunque la rotación ConvRot está diseñada para minimizarla; no se han publicado métricas que lo cuantifiquen.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en distintos idiomas o demografías.
- Riesgo de alucinación y artefactos visuales inherente a los modelos de difusión de vídeo; no cuantificado en esta versión.
- La licencia es MIT, pero se aplican los términos de uso del modelo base; conviene revisar la licencia del modelo original antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- Requiere kernels INT8 específicos (Comfy Kitchen); no es un checkpoint estándar cargable en cualquier framework.
- No se dispone de información sobre el pipeline, los idiomas soportados ni la longitud de contexto.

## Enlaces

- Hugging Face: https://huggingface.co/TeamAIQ/LongCat-Video-Avatar-1.6-INT8-ConvRot
- Modelo base: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- YouTube del autor de la cuantización: https://www.youtube.com/@aiquestacademy
- X del autor de la cuantización: https://x.com/aiquestacademy
- Sitio web del autor de la cuantización: https://aiquest.site
