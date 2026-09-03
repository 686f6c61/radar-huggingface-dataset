# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ8e-fp16-mtp

## Resumen

El modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ8e-fp16-mtp` es una versión cuantizada en 8 bits de un modelo de la familia Qwen3.6, con arquitectura de mezcla de expertos (MoE) y 35.951 millones de parámetros totales, de los cuales aproximadamente 3.000 millones son activos por token (según la nomenclatura A3B). El autor, symrex, lo ha publicado en formato MLX safetensors, lo que indica que está optimizado para ejecución en hardware Apple Silicon mediante la librería MLX. La cuantización se realizó con la herramienta oQ (oMLX v0.6.4) con un group size de 64, lo que reduce el tamaño del modelo a 39,5 GB en disco.

El nombre del modelo sugiere que se trata de un fine-tuning "uncensored" sobre una base Qwen3.6, con posibles ajustes adicionales denominados "Genesis-Hermes-V13". Sin embargo, la model card no proporciona detalles sobre el entrenamiento, los datos utilizados ni las capacidades específicas. No se dispone de información sobre la licencia, los idiomas soportados ni el contexto máximo. Este modelo parece orientado a usuarios que buscan una versión sin restricciones de contenido, pero la falta de documentación oficial limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3.000 millones (indicado en el nombre, no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (oQ/oMLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura es de tipo MoE (mixture of experts), identificada como `qwen3_5_moe` en la model card. Esto implica que el modelo activa solo un subconjunto de sus parámetros por token, lo que permite un equilibrio entre capacidad total y eficiencia computacional. El nombre "A3B" sugiere que aproximadamente 3.000 millones de parámetros se activan por token, aunque este dato no está confirmado en la documentación oficial.

No se dispone de información sobre el proceso de entrenamiento del modelo base ni del fine-tuning. El sufijo "Uncensored-Genesis-Hermes-V13" indica que probablemente se aplicaron técnicas de ajuste fino para eliminar restricciones de contenido, posiblemente mediante RLHF o DPO, pero no hay datos concretos sobre el dataset, el número de tokens de entrenamiento ni las innovaciones técnicas empleadas. La cuantización se realizó con oQ (oMLX v0.6.4), una herramienta de cuantización de precisión mixta para MLX, que reduce el tamaño del modelo manteniendo la calidad en las capas críticas.

## Capacidades

- Generación de texto: al ser un modelo de la familia Qwen, se espera que tenga capacidades de generación de texto en lenguaje natural, aunque no hay verificación independiente.
- Razonamiento y código: probablemente hereda las capacidades de razonamiento y generación de código de Qwen3.6, pero no hay benchmarks que lo confirmen.
- Tool calling y agentes: no se ha documentado soporte explícito para function calling o uso como agente.
- Multilingüismo: no se ha especificado qué idiomas soporta.
- Modo "uncensored": el nombre indica que se ha eliminado el filtrado de contenido, lo que permite generar respuestas sin restricciones temáticas, pero también implica un mayor riesgo de contenido inapropiado.
- Formato MLX: optimizado para ejecución en Apple Silicon (M-series) mediante la librería MLX.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede utilizarse para redactar textos de ficción, guiones o material literario que requiera explorar temas sensibles o controvertidos, gracias a su naturaleza "uncensored".
- Asistencia en investigación académica: puede servir como herramienta de apoyo para explorar hipótesis o generar ideas en campos donde los modelos convencionales aplican filtros excesivos, como estudios sociológicos o filosóficos.
- Desarrollo de prototipos de chatbots con personalidad libre: permite crear asistentes conversacionales que no estén limitados por políticas de contenido, útil para entornos de prueba o demos.
- Análisis de textos sin censura: puede procesar y resumir documentos que contengan lenguaje explícito o temas tabú, donde otros modelos rechazarían la tarea.
- Experimentación con cuantización MLX: sirve como caso de estudio para desarrolladores que quieran evaluar el impacto de la cuantización oQ en modelos MoE de gran tamaño en hardware Apple.
- Fine-tuning adicional: al estar disponible en formato MLX safetensors, puede utilizarse como base para ajustes finos específicos en entornos Apple, aunque la falta de licencia clara limita su uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se han comparado sus capacidades con modelos similares de forma documentada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 35.951 millones de parámetros cuantizado a 8 bits, el tamaño en memoria es aproximadamente 35,95 GB (más overhead). Con group size 64, el peso en disco es de 39,5 GB, por lo que se necesitan al menos 40 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: al estar en formato MLX, está diseñado para Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4 con suficiente memoria unificada). No es compatible directamente con CUDA sin conversión previa.
- Compatibilidad con GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, por ejemplo) debido al tamaño. Solo es viable en hardware Apple con 64 GB o más de memoria unificada.
- Opciones de despliegue: se puede ejecutar con la librería MLX (Python) o mediante herramientas que soporten MLX, como `mlx-lm`. No es compatible con vLLM, llama.cpp u Ollama en su formato actual.
- Latencia y throughput: no se han publicado mediciones. En un M2 Ultra con 128 GB, se podría esperar una velocidad de generación de entre 10 y 20 tokens por segundo, pero es una estimación sin base documentada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo pertenece a la familia Qwen3.6 MoE, pero no hay datos sobre su rendimiento frente a alternativas como Qwen3-30B-A3B, DeepSeek-V3 o Mixtral 8x22B. La falta de benchmarks y de documentación sobre el fine-tuning impide establecer comparaciones objetivas. Se recomienda consultar la documentación oficial de Qwen para modelos base comparables.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión "uncensored", es probable que el modelo genere contenido ofensivo, discriminatorio o perjudicial sin filtros. No se ha realizado una evaluación de sesgos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas especializados. No hay datos sobre su tasa de alucinación.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto soportada. Es probable que herede el límite de Qwen3.6 (posiblemente 128K o 256K), pero no está confirmado.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si se permite uso comercial, modificación o redistribución. Esto es un riesgo legal importante para cualquier uso en producción.
- Formato propietario: el formato MLX safetensors limita su uso a ecosistemas Apple. No es directamente utilizable en entornos Linux/Windows con GPUs NVIDIA sin conversión.
- Falta de documentación: la model card es mínima y no proporciona información sobre el entrenamiento, los datos, las capacidades ni los límites. Esto dificulta la evaluación técnica y la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ8e-fp16-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
