# standjones/mirror-unconst-affine-5czsc2fc98-r637-r252-odpo-midrank-lobeta-softctx-ep3-lolr-merged

## Resumen

El modelo `standjones/mirror-unconst-affine-5czsc2fc98-r637-r252-odpo-midrank-lobeta-softctx-ep3-lolr-merged` es un checkpoint derivado del modelo base `unconst/Affine-5czsc2fc98-r252-merged`, desarrollado por el autor `standjones` como parte de un proceso de minería de modelos (SN120). Está entrenado mediante *offline DPO* (Direct Preference Optimization) sobre pares de respuestas minados, con el objetivo de mejorar la puntuación de razonamiento "Reason v3" definida como la diferencia de log-probabilidades condicionadas al teacher. No es un modelo conversacional general, sino una submission específica para evaluaciones de razonamiento en duelos automáticos.

Con 35.107.181.936 parámetros (35,1 B), el modelo utiliza una arquitectura de mezcla de expertos (MoE) según la etiqueta `qwen3_5_moe`, aunque no se han publicado detalles arquitectónicos completos. El repositorio pesa 70.2 GB y los pesos están en formato `safetensors`. La licencia no está especificada, aunque se indica que sigue la política del modelo base y los artefactos de minería Affine. El modelo fue creado el 17 de agosto de 2026 y no registra descargas ni valoraciones en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (máximo de secuencia de entrenamiento: 12288) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (sigue política del modelo base y artefactos Affine) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. La etiqueta `qwen3_5_moe` sugiere que se basa en una variante de Qwen3.5 con mezcla de expertos, pero no se confirma ni se detallan el número de expertos, la dimensión oculta ni otros hiperparámetros estructurales. El modelo se entrena a partir del checkpoint `unconst/Affine-5czsc2fc98-r252-merged` (revisión `b42d6245d77fe30885ea8a90387771e1bc465e0f`).

El entrenamiento emplea *offline DPO* sobre pares de respuestas minados, optimizando la preferencia por respuestas con mayor puntuación de razonamiento del lado del teacher. Los datos provienen de un conjunto de pares denominado "SoftCtx × MidRank × LoBeta" (banda de contexto suave, rango LoRA medio, beta DPO bajo). Los hiperparámetros clave incluyen LoRA con r=32 y α=128, β=0.02, tasa de aprendizaje 1e-6, longitud máxima de secuencia 12288, 3600 pasos "MegaExtra" y 3 épocas. El entrenamiento se realizó en hardware específico (GPUs de los nodos `mine-r226-marsplan-fullft-1` y `mine-r262-kevin-v5-nonking-grpo-1`). No se menciona el uso de RLHF, SFT ni otras técnicas de alineación.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que puede generar texto autoregresivamente.
- Razonamiento: el objetivo del entrenamiento es mejorar la puntuación "Reason v3", que mide la diferencia de log-probabilidades entre respuestas condicionadas al teacher y sin condicionar. Esto indica una capacidad específica para tareas de razonamiento evaluadas en duelos automáticos.
- No es un modelo de chat general: el README indica explícitamente que no está pensado para conversación general.
- Capacidades multimodales: la etiqueta `image-text-to-text` sugiere posible soporte de entrada de imágenes, pero no hay confirmación ni documentación al respecto.
- No se dispone de información sobre tool calling, funciones de agente, ni capacidades multilingües específicas.

## Casos de uso

- Evaluación de razonamiento en duelos automáticos: el modelo está diseñado como submission para el sistema de minería SN120, donde compite contra otros checkpoints en la métrica Reason v3. Se usaría en infraestructura de evaluación tipo `evalsrv` para comparar la calidad de razonamiento entre modelos.
- Investigación en optimización de preferencias: al ser un checkpoint entrenado con DPO offline, puede servir como caso de estudio para analizar el efecto de hiperparámetros como β bajo, LoRA de rango medio y contexto suave en el rendimiento de razonamiento.
- Experimentación con mezcla de expertos: dado el tag `qwen3_5_moe`, puede utilizarse para estudiar el comportamiento de arquitecturas MoE en tareas de razonamiento, aunque no se documentan detalles internos.
- Generación de texto condicionada: aunque no es su uso principal, al ser un modelo de generación de texto, podría emplearse para tareas de completado o generación con prompts específicos, siempre que se respete su naturaleza especializada.
- Análisis de métricas de preferencia: los datos de entrenamiento y las métricas reportadas (margen, SE, z, thought median, B pass) pueden servir para investigar metodologías de evaluación de modelos de razonamiento.
- Reproducción de experimentos: el checkpoint permite reproducir los resultados de la línea de entrenamiento R637, comparando con variantes como R580, R610 o R635, para validar conclusiones sobre el efecto de la tasa de aprendizaje y el número de épocas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README reporta métricas internas de la evaluación contra el "live king" (reign34), que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Margen vs live king | +0.005735 |
| Error estandar (SE) | 0.001973 |
| Estadistico z | 2.91 |
| Tamano de muestra n | 77 |
| Barra de decision (max(2·SE, δ=0.002)) | 0.003946 (~1.45×) |
| Mediana de pensamiento (thought median) | 168.5 (≥80) |
| Tasa de pase B | 0.4125 (≥0.30) |

Estas métricas indican que el modelo supera al checkpoint de referencia con significancia estadística, pero no son comparables con benchmarks públicos.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware para inferencia. Dado que el modelo tiene 35,1 B de parámetros totales y es una arquitectura MoE, los requisitos de VRAM dependerán de la cuantización y de si se cargan todos los parámetros o solo los activos. Sin información sobre el número de parámetros activos, se recomienda:

- Para inferencia en precisión completa (FP16), se estima un consumo de al menos 70 GB de VRAM (considerando solo los pesos), lo que requiere GPUs como A100 80GB o H100.
- Con cuantización a 4 bits, podría caber en GPUs con 24-32 GB de VRAM (p. ej., RTX 3090/4090), pero no hay garantías sin conocer la arquitectura exacta.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no hay soporte confirmado.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría. El modelo es un checkpoint intermedio de una línea de experimentación propia (Affine), y no se conocen alternativas públicas comparables. Se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo de chat general: su uso previsto es exclusivamente como submission en el sistema de minería SN120; no debe emplearse para aplicaciones conversacionales.
- Licencia no especificada: aunque se indica que sigue la política del modelo base y los artefactos Affine, no se detalla si permite uso comercial o modificación. Se recomienda contactar al autor antes de cualquier uso fuera del ámbito de minería.
- Riesgo de alucinación: al ser un modelo de generación de texto, puede producir contenido falso o inventado, especialmente fuera de su dominio de entrenamiento.
- Sesgos desconocidos: no se ha realizado una evaluación de sesgos; los datos de entrenamiento no están documentados.
- Contexto limitado: la longitud máxima de secuencia de entrenamiento es 12288 tokens, lo que puede limitar tareas que requieran contextos más largos.
- Reproducibilidad: los detalles del dataset de pares minados no son públicos, lo que dificulta replicar el entrenamiento.
- Fecha de creación futura: el modelo está fechado en 2026, lo que puede indicar que es parte de un proyecto experimental en curso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/standjones/mirror-unconst-affine-5czsc2fc98-r637-r252-odpo-midrank-lobeta-softctx-ep3-lolr-merged)
- [Modelo base: unconst/Affine-5czsc2fc98-r252-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged) (enlace inferido de la información, no verificado)
- No se han encontrado papers, blogs ni repositorios adicionales en la búsqueda web.
