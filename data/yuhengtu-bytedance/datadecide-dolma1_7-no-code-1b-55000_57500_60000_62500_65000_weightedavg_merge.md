# yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-55000_57500_60000_62500_65000_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje fusionado mediante la técnica de "model soup" o promedio lineal de pesos. El autor, la cuenta `yuhengtu-bytedance`, ha combinado cinco checkpoints intermedios de un mismo entrenamiento de pretraining de aproximadamente 1.280 millones de parámetros (1.279.854.592 según los safetensors), identificados como `dolma1_7-no-code-1B` y correspondientes a los pasos 55.000, 57.500, 60.000, 62.500 y 65.000. La fusión se ha realizado con mergekit usando el método Linear, con pesos crecientes de 1, 2, 3, 4 y 5 respectivamente y normalización activada, tomando el paso 65.000 como base.

El modelo resultante no es un modelo nuevo entrenado desde cero, sino un artefacto de investigación sobre fusión de pesos en el espacio de parámetros. Su interés radica en el contexto metodológico: los checkpoints de origen pertenecen a la familia DataDecide aplicada al corpus Dolma 1.7 sin código, un tipo de experimento diseñado para estudiar leyes de escalado y selección de datos de pretraining a partir de ejecuciones pequeñas. La ruta interna del repositorio de origen (`Pan_Safety_Better_Measurement`) sugiere además un uso orientado a medición de seguridad.

La relevancia práctica es limitada: no hay model card técnica más allá del README autogenerado por mergekit, no se declara licencia ni idiomas, no se publican benchmarks y el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta. Es, por tanto, un checkpoint de investigación reproducible, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo LLaMA (según etiquetas del repositorio: `llama`) |
| Parámetros totales | 1.279.854.592 (≈1,28B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponibles publicados; al ser safetensors en bfloat16 es convertible a GGUF (Q4, Q5, Q8, etc.) con llama.cpp |
| Idiomas soportados | no disponible (los checkpoints base se entrenaron sobre Dolma 1.7, corpus predominantemente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (salida de la fusión en bfloat16; configuración de merge en float32) |

Datos adicionales: tamaño del repositorio 2,6 GB, pipeline `text-generation`, librería `transformers`, etiquetas `text-generation-inference` y `endpoints_compatible`, fecha de creación y última actualización 2026-09-17.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder autorregresivo de tipo LLaMA, según la etiqueta declarada en el repositorio. No hay información publicada sobre número de capas, dimensiones ocultas, cabezas de atención, tamaño de vocabulario ni tokenizador concreto. Los 1.279.854.592 parámetros lo sitúan en la franja de los modelos pequeños (aproximadamente 1-1,5B), pensados para experimentación a bajo coste computacional.

El entrenamiento original no forma parte de este repositorio: los checkpoints fusionados provienen de una ejecución de pretraining sobre el subconjunto sin código de Dolma 1.7 (`dolma1_7-no-code`), en el marco de los experimentos DataDecide. No se documenta el número de tokens vistos, la composición exacta del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO. Dado que se trata de checkpoints intermedios de pretraining, lo más probable es que no haya ninguna etapa de alineación, aunque esto no se confirma en la información disponible.

La innovación técnica aquí es exclusivamente la fusión: se aplica el método Linear de mergekit, que promedia los tensores de los cinco checkpoints con pesos 1, 2, 3, 4 y 5 tras normalización. El paso 65.000 actúa a la vez como base y como miembro de mayor peso. Este procedimiento se apoya en el trabajo sobre "model soups" (arXiv:2203.05482) y transforma una secuencia de checkpoints temporalmente próximos en un único punto del espacio de pesos, lo que en la literatura se asocia a una mejora de robustez y, en ocasiones, de precisión, pero también puede degradar el rendimiento si los checkpoints incluidos no son buenos candidatos.

## Capacidades

- Generación de texto autorregresiva: modelo base de continuación de texto, sin plantilla de chat ni formato de instrucciones.
- Razonamiento básico y conocimiento factual limitado por el tamaño (≈1,28B) y por el corpus de entrenamiento.
- Generación de código: el subconjunto de datos se denomina explícitamente `no-code`, por lo que la capacidad en programación es presumiblemente baja (inferencia a partir de la nomenclatura, no confirmada).
- Tool calling / function calling: no disponible y poco probable en un modelo base sin ajuste por instrucciones.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas; el corpus Dolma 1.7 es mayoritariamente en inglés.
- Capacidades especiales: ninguna documentada (sin modo thinking, sin visión, sin audio, sin decodificación especulativa integrada).

## Casos de uso

- Investigación en fusión de pesos: reproducir el experimento, comparar la pérdida del modelo fusionado frente a cada uno de los cinco checkpoints individuales y estudiar el efecto de los pesos 1-2-3-4-5 y de la normalización.
- Estudios de leyes de escalado y selección de datos: los checkpoints DataDecide se usan para predecir el rendimiento de ejecuciones grandes a partir de ejecuciones pequeñas; este artefacto puede servir como punto de referencia dentro de ese tipo de análisis.
- Inicialización para fine-tuning ligero: al ser un modelo de 1,28B, puede ajustarse por supervisión (SFT) en una sola GPU de consumo para tareas concretas de dominio, partiendo de un punto ya promediado.
- Evaluación de seguridad y alineación: la ruta de origen (`Pan_Safety_Better_Measurement`) apunta a mediciones de seguridad; el modelo puede emplearse como sujeto de pruebas para medir sesgos o generación tóxica en modelos pequeños no alineados.
- Generación de texto local y prototipado: con conversión a GGUF puede ejecutarse en portátiles y equipos sin GPU para probar pipelines de generación antes de escalar a modelos mayores.
- Destilación y generación de datos sintéticos: usar sus salidas como datos de entrenamiento aproximados para clasificadores o para modelos mayores, asumiendo la baja calidad esperable del corpus generado.
- Baseline en estudios de eficiencia: comparar latencia, memoria y perplejidad frente a otros modelos densos de tamaño similar bajo las mismas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16/float16: aproximadamente 2,6 GB solo para pesos, más activaciones y caché KV; en la práctica entre 4 y 6 GB para contextos moderados.
- VRAM estimada en float32: aproximadamente 5,1 GB solo para pesos.
- Cuantización GGUF orientativa: Q4_K_M alrededor de 0,8 GB, Q8_0 alrededor de 1,4 GB (estimaciones derivadas del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB o más, como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 o RTX 4090. En GPU de centro de datos (A100, H100) es viable pero sobredimensionado para este tamaño.
- Inferencia en CPU: factible con llama.cpp en cuantizaciones de 4 bits, con velocidad dependiente del número de núcleos.
- Opciones de despliegue: `transformers`, vLLM y TGI (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`), SGLang, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles. Como referencia aritmética, un modelo denso de 1,28B en bfloat16 exige unos 2,56 GB de pesos por token generado en lectura completa de memoria, lo que permite decenas de tokens por segundo en GPUs de consumo modernas.

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de sus respectivas model cards públicas y pueden variar con el tiempo.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| Este modelo (merge DataDecide dolma1_7-no-code 1B) | 1,28B | no disponible | no disponible | no disponible | no |
| TinyLlama-1.1B | 1,1B | 2.048 tokens (variantes posteriores amplían) | Apache 2.0 | inglés | sí |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | multilingüe | sí |
| Llama-3.2-1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | multilingüe | sí |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | inglés | sí |

Frente a todos ellos, este modelo carece de licencia declarada, de benchmarks, de contexto documentado y de ajuste por instrucciones, por lo que no es un sustituto directo en aplicaciones de producto. Su comparación pertinente es con los checkpoints DataDecide originales y con otros artefactos de fusión generados por mergekit.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia explícita no hay autorización clara para uso comercial; además, los checkpoints de origen dependen de las condiciones del corpus Dolma y del proyecto del que provienen.
- Modelo base no alineado: no sigue instrucciones, no incorpora RLHF ni DPO documentados y puede producir contenido sesgado, tóxico o factualmente incorrecto.
- Riesgo de alucinación elevado: el tamaño (≈1,28B) y la ausencia de ajuste hacen que la generación factual no sea fiable.
- Sin model card técnica: se desconocen contexto máximo, tokenizador, composición exacta del dataset, número de tokens de entrenamiento e idiomas soportados.
- Sin evaluación: no hay benchmarks, ni evaluaciones de seguridad publicadas, ni validación comunitaria (0 descargas, 0 "likes").
- Idiomas: no declarados; la procedencia del corpus sugiere un fuerte predominio del inglés, con rendimiento incierto en castellano y otras lenguas.
- La fusión no garantiza mejora: promediar checkpoints de pasos distintos puede degradar el rendimiento respecto al checkpoint final (paso 65.000) si la trayectoria de entrenamiento no es estable.
- Sesgo por selección de pasos: todos los checkpoints provienen de la misma ejecución y del mismo subconjunto `no-code`, lo que reduce la diversidad de la mezcla.
- Repositorio mínimo: 2,6 GB, una única revisión y README autogenerado, sin script de ejemplo ni instrucciones de uso.
- Advertencia de producción: no debe desplegarse en aplicaciones orientadas a usuarios sin una fase previa de ajuste, evaluación y resolución del régimen de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-55000_57500_60000_62500_65000_weightedavg_merge
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Método Linear / "model soups": https://arxiv.org/abs/2203.05482
- Búsqueda web: no se han encontrado enlaces relevantes adicionales. Los resultados devueltos corresponden a páginas de ayuda de YouTube, sin relación con el modelo.
