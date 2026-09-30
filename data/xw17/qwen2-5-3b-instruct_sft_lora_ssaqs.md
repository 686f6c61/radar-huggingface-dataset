# xw17/Qwen2.5-3B-Instruct_SFT_lora_ssaqs

## Resumen

El modelo identificado como `xw17/Qwen2.5-3B-Instruct_SFT_lora_ssaqs` es un ajuste fino por supervisión (SFT) mediante LoRA sobre el modelo base Qwen2.5-3B-Instruct, publicado por el usuario `xw17` en HuggingFace. El nombre del repositorio indica que se trata de adaptadores LoRA (no de pesos completos), algo coherente con el tamaño del repositorio de 0,1 GB, muy inferior a los aproximadamente 6 GB que ocuparían los pesos completos en fp16 de un modelo de 3 mil millones de parámetros.

La relevancia de esta ficha está limitada por la ausencia casi total de documentación. La model card publicada es la plantilla automática de HuggingFace sin rellenar: no incluye descripción, datos de entrenamiento, hiperparámetros, licencia ni resultados de evaluación. El repositorio solo aporta los tags `transformers`, `safetensors`, `endpoints_compatible` y `region:us`, junto con una referencia cruzada al artículo de Lacoste et al. (2019) sobre impacto ambiental, que forma parte de la plantilla por defecto y no implica que se haya realizado dicho cálculo.

Por tanto, esta ficha debe interpretarse como una evaluación del modelo base subyacente con las salvedades propias de un ajuste LoRA no documentado. Se recomienda verificar directamente el repositorio antes de cualquier uso en producción, ya que no se puede confirmar la naturaleza del dataset de ajuste ni el comportamiento real del modelo resultante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención GQA (heredada del modelo base Qwen2.5-3B-Instruct); el repositorio contiene adaptadores LoRA, no confirmado de forma oficial |
| Parámetros totales | ~3,09 mil millones en el modelo base; el repositorio publicado ocupa 0,1 GB (compatible con adaptadores LoRA) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-3B-Instruct; no confirmado para este ajuste |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo base declara soporte para 29 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | transformers |
| Tags | transformers, safetensors, arxiv:1910.09700, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-30 |

## Arquitectura y entrenamiento

La información disponible no permite confirmar la arquitectura del ajuste. Se puede inferir del nombre que se partió del modelo Qwen2.5-3B-Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA), 36 capas, dimensión oculta de 2048 y vocabulario de 151.936 tokens en su configuración original. El sufijo `ssaqs` no está documentado en ningún lugar del repositorio, por lo que se desconoce si hace referencia a un dataset, a un experimento o a una configuración concreta de entrenamiento.

Respecto al procedimiento de entrenamiento, la model card confirma únicamente que emplea la plantilla automática y que no se han rellenado los campos de datos de entrenamiento, hiperparámetros ni régimen de precisión. No hay evidencia de que se haya aplicado RLHF, DPO ni ninguna otra técnica de alineación posterior al SFT. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, el rango del adaptador LoRA ni el coeficiente alpha utilizado.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen2.5-3B-Instruct, condicionada al dataset de ajuste no documentado.
- Razonamiento y matemáticas: el modelo base presenta competencia básica en tareas de razonamiento; no hay datos que confirmen el efecto del ajuste.
- Generación de código: el modelo base soporta generación de código en múltiples lenguajes; no confirmado tras el ajuste.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct incorpora soporte de llamada a funciones; no confirmado para este ajuste.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible para este ajuste; el modelo base declara 29 idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Comportamiento tras el ajuste LoRA: no disponible; sin datos de evaluación que lo caractericen.

## Casos de uso

- Ajuste de dominio específico sobre una base conocida: el repositorio sirve como ejemplo de aplicación de LoRA sobre Qwen2.5-3B-Instruct. Puede usarse para inspeccionar la configuración del adaptador y replicar el flujo en otros dominios.
- Prototipado en entornos con recursos limitados: al tratarse de un modelo de 3B, permite experimentar con fine-tuning e inferencia en una única GPU de gama de consumo, siempre que se valide antes el comportamiento del ajuste.
- Investigación en eficiencia de ajuste: útil para estudiar el impacto de LoRA sobre modelos pequeños, aunque la falta de documentación limita la reproducibilidad.
- Evaluación comparativa de adaptadores: el autor publica variantes (`_aw_fb`, `_ssaqs`) sobre distintos modelos base (1.5B y 3B), lo que permite análisis comparativos entre configuraciones.
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` sugiere compatibilidad con la infraestructura de Inference Endpoints de HuggingFace, adecuada para pruebas de integración.
- Base para pipelines de generación de texto en castellano: solo si se valida previamente la calidad del ajuste, dado que no hay evidencia de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo del modelo base de 3B, aproximadamente 6-7 GB en fp16, 3-4 GB en int8 y 2-3 GB en int4 (estimaciones para el modelo base completo; el repositorio contiene solo adaptadores, que requieren cargar el modelo base).
- GPU recomendadas: para el modelo base de 3B son suficientes una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o una A10G; para entrenamiento LoRA, una RTX 3090/4090 con 24 GB es suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo base de 3B cabe en la mayoría de GPUs de consumo con 8 GB o más en cuantización int4.
- Opciones de despliegue: `transformers` (confirmado por el campo `library_name`); vLLM, llama.cpp y Ollama son viables para el modelo base, pero no se confirman para este adaptador.
- Latencia y throughput estimados: no disponible.
- Nota: al ser adaptadores LoRA, es necesario descargar por separado el modelo base Qwen2.5-3B-Instruct y aplicar el adaptador, lo que incrementa los requisitos de almacenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xw17/Qwen2.5-3B-Instruct_SFT_lora_ssaqs | ~3,09B (base) + LoRA | no disponible (base: 32.768) | no disponible | HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct (modelo base) | 3,09B | 32.768 tokens | Qwen Research License | Ampliamente disponible |
| xw17/Qwen2.5-1.5B-Instruct_SFT_lora_ssaqs | ~1,5B (base) + LoRA | no disponible | no disponible | HuggingFace |
| xw17/Qwen2.5-3B-Instruct_SFT_lora_aw_fb | ~3,09B (base) + LoRA | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin rellenar, lo que impide verificar datos de entrenamiento, licencia y uso previsto.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, con restricciones para uso comercial en determinados casos.
- Riesgo de alucinación: inherente a los modelos de 3B, especialmente sin evaluación específica del ajuste.
- Sesgos desconocidos: no se documenta la composición del dataset de SFT, por lo que no se pueden identificar sesgos introducidos durante el ajuste.
- Reproducibilidad nula: se desconocen los hiperparámetros, el dataset y la metodología, lo que impide replicar el resultado.
- Idiomas no confirmados: no hay información sobre el soporte multilingüe del adaptador, y un SFT sobre un dataset monolingüe podría degradar el rendimiento en otros idiomas.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, sin evidencia de uso o revisión por terceros.
- Naturaleza del artefacto: al tratarse probablemente de adaptadores LoRA, requiere el modelo base y una versión concreta de `transformers`/`peft` para funcionar.
- No apto para producción sin evaluación previa: no se han publicado métricas que respalden su calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xw17/Qwen2.5-3B-Instruct_SFT_lora_ssaqs
- Variante relacionada (3B, sufijo `aw_fb`): https://huggingface.co/xw17/Qwen2.5-3B-Instruct_SFT_lora_aw_fb
- Variante relacionada (1.5B, sufijo `ssaqs`): https://huggingface.co/xw17/Qwen2.5-1.5B-Instruct_SFT_lora_ssaqs
- Tutorial de ajuste de Qwen2.5-3B con LoRA en Colab: https://ai4u.space/blog/fine-tune-qwen2-5-3b-model-colab-guide
- Guía de despliegue local de Qwen2.5-3B-Instruct: https://aiindigo.com/tutorials/getting-started-with-qwen2-5-3b-instruct-deploying-efficient-local-ai
- Repositorio de referencia sobre SFT con Qwen2.5: https://github.com/ShawVentus/Qwen2.5_sft
- Artículo citado en la plantilla (impacto ambiental): https://arxiv.org/abs/1910.09700
