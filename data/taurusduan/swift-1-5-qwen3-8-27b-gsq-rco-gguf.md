# taurusduan/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B GSQ-RCO es una cuantización GGUF de precisión mixta del modelo Swift 1.5 Qwen3.8-27B, desarrollado por UkisAI y publicado en Hugging Face por el usuario taurusduan. El modelo base es un transformer denso de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors) construido sobre la familia Qwen3.8, afinado mediante post-entrenamiento orientado a tareas agénticas de horizonte largo, código y razonamiento con un uso reducido de tokens de pensamiento. Según la model card, Swift 1.5 emplea un 58,5 % menos de tokens de pensamiento que su base obteniendo una puntuación un 0,35 % superior, lo que se traduce en una aceleración de hasta 9,18× en varias tareas.

La relevancia de esta publicación concreta está en el formato: ofrece cuatro niveles de cuantización GGUF de precisión mixta (IQ2_XS, IQ2_S, IQ3_XXS e IQ3_S) que van de 8,42 GB a 11,77 GB, lo que permite ejecutar un modelo de casi 27B parámetros en hardware de consumo y en entornos con VRAM limitada. Las asignaciones por tensor provienen del release GSQ-RCO de ISTA-DASLab, refinadas específicamente para Swift. Cada nivel está disponible en versión estándar y en versión con cabeza MTP (multi-token prediction) para decodificación especulativa.

El modelo está pensado para inferencia local con llama.cpp y se distribuye bajo la licencia propietaria swift-open-license-1.0. La model card incluye mediciones de divergencia KL (KLD) frente al modelo BF16 en siete dominios (prosa, código, matemáticas y cuatro idiomas), lo que permite evaluar la pérdida de fidelidad de cada nivel de cuantización de forma cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con cabeza MTP opcional en las variantes `-mtp` |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma verificada; el ejemplo de uso de la model card emplea `-c 262144`, pero el autor advierte que no implica evaluación a esa longitud |
| Tipos de cuantizacion | GGUF de precisión mixta: IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S (cada uno con y sin cabeza MTP) |
| Idiomas soportados | no disponibles oficialmente; las evaluaciones KLD cubren inglés, alemán, francés, español y chino |
| Licencia | swift-open-license-1.0 (propietaria, etiquetada como `other`) |
| Formato de pesos | GGUF (para llama.cpp); el modelo base se distribuye en BF16/safetensors |

## Arquitectura y entrenamiento

El modelo base Swift 1.5 Qwen3.8-27B es un transformer denso de aproximadamente 26,9B parámetros derivado de la familia Qwen3.8. Según la model card, Swift 1.5 se construye sobre Swift 1.0 mediante un post-entrenamiento centrado en tareas agénticas de horizonte largo y de código, con el objetivo de mejorar el rendimiento global reduciendo el número de tokens de pensamiento. El autor reporta una reducción del 58,5 % en tokens de pensamiento con una mejora de 0,35 % en puntuación respecto al base, y una aceleración de 9,18× en varias tareas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

La innovación técnica de esta publicación concreta es el esquema de cuantización GSQ-RCO: una asignación de precisión mixta por tensor (no un tipo uniforme para todos los tensores) que reutiliza las asignaciones del release de ISTA-DASLab para Qwen3.8-27B y las refina específicamente para Swift. Las variantes `-mtp` añaden una cabeza de predicción multi-token que permite decodificación especulativa, aunque requieren un runtime con soporte para la implementación MTP de este modelo. El autor advierte que la velocidad y calidad de la decodificación MTP no se han evaluado por separado, y que las mediciones KLD se hicieron sobre los ficheros estándar.

## Capacidades

- Generación de texto conversacional y de propósito general (`pipeline_tag: text-generation`).
- Razonamiento explícito con modo de pensamiento eficiente en tokens (etiquetas `reasoning`, `efficient-thinking`, `token-efficient`).
- Tareas de código y agentes de horizonte largo, según el enfoque de post-entrenamiento declarado por el autor.
- Razonamiento matemático (el conjunto de evaluación KLD incluye texto matemático de GSM8K).
- Capacidades multilingües parcialmente evidenciadas por las evaluaciones KLD en alemán, francés, español y chino; no hay lista oficial de idiomas soportados.
- Decodificación especulativa mediante cabeza MTP en las variantes `-mtp` (sujeta a soporte del runtime).
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional con plantilla Jinja (`--jinja`).
- No se ha verificado proyector de visión para este release; no se incluye soporte de imagen validado.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: los ficheros IQ2_XS (8,42 GB) e IQ3_S (11,77 GB) permiten ejecutar un modelo de ~27B en tarjetas de 12-16 GB de VRAM con llama.cpp, algo inviable con los pesos BF16.
- Asistentes de código en el IDE o en pipelines de CI/CD: el post-entrenamiento orientado a código y el bajo coste en tokens de pensamiento reducen la latencia por petición, lo que encaja en flujos interactivos de autocompletado y revisión.
- Agentes multi-paso con muchas llamadas encadenadas: la reducción del 58,5 % en tokens de pensamiento declarada por el autor abarata cada paso de razonamiento, lo que importa en bucles agénticos donde el coste se multiplica por iteración.
- Procesamiento por lotes en servidores con VRAM limitada: con llama-server y las cuantizaciones IQ3 se puede servir el modelo en una sola GPU de 16-24 GB, evitando el coste de un nodo multi-GPU para BF16.
- Evaluación e investigación de cuantización: la model card publica tablas KLD por dominio y ficheros de metadatos (`evaluation/report.json`, `heldout-kld.tsv`), lo que permite reproducir y comparar el impacto de cada nivel de cuantización sobre la distribución de salida.
- Prototipado de aplicaciones conversacionales en español: aunque no hay lista oficial de idiomas, las mediciones KLD en español (0,024186 en IQ3_S, el mejor dominio de los siete) sugieren una degradación baja de la distribución en este idioma.
- Inferencia con decodificación especulativa: las variantes `-mtp` permiten probar aceleración por predicción multi-token en runtimes compatibles, útil para experimentar con throughput en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. La model card remite a la ficha del modelo base para los benchmarks a nivel de modelo y solo publica mediciones de divergencia KL de la cuantización.

KLD frente a Swift 1.5 BF16 (menor es mejor), contexto de 512 tokens:

| Texto held-out | IQ2_XS | IQ2_S | IQ3_XXS | IQ3_S |
|---|---:|---:|---:|---:|
| Prosa C4 | 0,161594 | 0,107438 | 0,080238 | 0,041748 |
| Código CodeParrot | 0,120884 | 0,084739 | 0,062546 | 0,035447 |
| Texto matemático GSM8K | 0,117467 | 0,096348 | 0,075964 | 0,043916 |
| Alemán | 0,124482 | 0,091422 | 0,074645 | 0,035698 |
| Francés | 0,166785 | 0,113277 | 0,077791 | 0,046219 |
| Español | 0,082313 | 0,056393 | 0,039906 | 0,024186 |
| Chino | 0,207063 | 0,129485 | 0,103141 | 0,052241 |

KLD de desarrollo (wiki.test.raw, 100 fragmentos, contexto 512): IQ2_XS 0,189979; IQ2_S 0,134751; IQ3_XXS 0,097774; IQ3_S 0,051265. El autor indica que los cuatro ficheros mejoran el KLD respecto a sus cuantizaciones Swift de partida en los siete dominios, pero no son uniformemente mejores que las cuantizaciones de comparación de ISTA: el KLD en texto matemático es un 4,9-7,7 % superior y IQ3_S es peor en cinco de siete dominios. Estas comparaciones miden cada cuantización contra su propio BF16 correspondiente y no constituyen un ranking de tareas Swift frente a Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más la caché de contexto y los buffers de cómputo. IQ2_XS ~8,42 GB, IQ2_S ~9,26 GB, IQ3_XXS ~10,09 GB, IQ3_S ~11,77 GB; las variantes `-mtp` añaden unos 0,35 GB.
- GPU recomendadas: RTX 4090 (24 GB) para IQ3_S con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para IQ2_S o IQ3_XXS con contexto moderado; A100/H100 solo si se necesita contexto muy largo o mayor paralelismo.
- Cabe en GPU de consumo: sí, desde tarjetas de 12 GB (IQ2_XS con contexto corto) hasta 16-24 GB para los niveles superiores.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) con una build que soporte Qwen3.8; los ficheros son GGUF y no son directamente compatibles con vLLM o TGI sin conversión. Ollama puede importarlos manualmente.
- Latencia y throughput: no disponibles de forma medida. El autor declara aceleración de 9,18× en tareas del modelo base por reducción de tokens de pensamiento, pero no publica cifras de tokens por segundo para estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B GSQ-RCO (este) | ~26,9B | no verificado | GGUF IQ2-IQ3 | swift-open-license-1.0 | Cuantización mixta refinada, variantes MTP |
| Swift 1.5 Qwen3.8-27B (base) | ~26,9B | no disponible | BF16/safetensors | swift-open-license-1.0 | Referencia de calidad; requiere mucha más VRAM |
| Qwen3.8-27B GSQ-RCO (ISTA-DASLab) | ~27B | no disponible | GGUF | según modelo base | Mismas asignaciones por tensor sin refinamiento Swift; peor KLD en matemáticas según el autor |
| GGUFs estándar de Swift 1.5 (ukisai) | ~26,9B | no disponible | GGUF uniforme | swift-open-license-1.0 | Cuantización de tipo uniforme, sin mezcla por tensor |

No se dispone de datos de benchmarks de tareas que permitan comparar rendimiento funcional con alternativas de otros autores.

## Limitaciones y advertencias

- Licencia propietaria swift-open-license-1.0: es necesario revisar el texto completo antes de cualquier uso comercial; no es una licencia de código abierto estándar.
- Las mediciones KLD se hicieron a 512 tokens de contexto; el autor advierte explícitamente que no establecen la calidad a 32K ni a contextos mayores.
- El cribado de solapamiento léxico frente al texto de calibración no demuestra ausencia de sobreajuste ni deduplicación semántica.
- El KLD en texto matemático es un 4,9-7,7 % superior al de las cuantizaciones de comparación de ISTA, e IQ3_S es peor en cinco de siete dominios frente a esas referencias.
- No hay datos publicados de benchmarks de tareas para este release; el rendimiento real en MMLU, HumanEval o GSM8K no está verificado.
- No se ha verificado proyector de visión: el release no incluye soporte de imagen validado.
- Las variantes `-mtp` requieren un runtime con soporte específico y su velocidad y calidad no se han evaluado por separado.
- No hay lista oficial de idiomas soportados; las capacidades multilingües solo están evidenciadas por las mediciones KLD.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, que no se detallan aquí.
- El repositorio tiene 390 descargas y 0 likes en el momento de la consulta, con validación comunitaria escasa.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/taurusduan/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base BF16: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- GGUFs estándar del autor original: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Release GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/LICENSE
- Sumas de verificación SHA256: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/SHA256SUMS
- Web de UkisAI: https://ukisai.com
- Página de producto Swift: https://ukisai.com/products/swift
- Paper de referencia 1: arxiv:2604.18556
- Paper de referencia 2: arxiv:2605.00649
