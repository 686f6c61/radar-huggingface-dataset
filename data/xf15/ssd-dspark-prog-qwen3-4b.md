# xf15/ssd-dspark-prog-qwen3-4b

## Resumen

El modelo `xf15/ssd-dspark-prog-qwen3-4b` es un drafter (modelo auxiliar de draft) diseñado para acelerar la inferencia del modelo Qwen/Qwen3-4B mediante decodificación especulativa. Forma parte de la familia DSpark, una técnica que entrena modelos pequeños y rápidos para predecir los tokens que generará el modelo objetivo, permitiendo verificar varias predicciones en paralelo y reducir la latencia. Este drafter concreto, denominado `dspark_prog`, utiliza un tamaño de bloque de 7 y 5 capas de draft, con capas objetivo en los índices [1, 9, 17, 25, 33] del modelo Qwen3-4B.

El checkpoint disponible corresponde a la época 4 de 10 (paso 10464 de 26160) del entrenamiento sobre el corpus `open-perfectblend` regenerado por Qwen3-4B, con 1.339.815 filas válidas en caché. El repositorio tiene un tamaño de 0,1 GB e incluye los pesos en formato `safetensors` junto con su configuración. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso general, ya que se trata de un componente técnico especializado, no de un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter DSpark (dspark_prog), 5 capas de draft, block size 7, target tap layers [1, 9, 17, 25, 33] |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (config.json + model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un drafter de la familia DSpark, diseñado específicamente para decodificación especulativa. Su arquitectura se compone de 5 capas de draft que operan con un tamaño de bloque de 7, es decir, el drafter genera 7 tokens candidatos por iteración que luego son verificados por el modelo objetivo Qwen3-4B. Las capas objetivo (target tap layers) se sitúan en los índices [1, 9, 17, 25, 33] del modelo Qwen3-4B, lo que permite al drafter alinearse con las representaciones intermedias del modelo grande.

El entrenamiento se realizó sobre el corpus `open-perfectblend` regenerado por Qwen3-4B, con un total de 1.339.815 filas válidas en caché. El checkpoint actual corresponde a la época 4 de un plan de 10 épocas, con un programa de aprendizaje de tasa de coseno que abarca las 10 épocas completas (máximo 26160 pasos). El entrenamiento se detuvo en el paso 10464. Para reanudar el entrenamiento se requiere reconstruir la caché de activaciones desde el dataset `xf15/ssd-perfectblend-qwen3-4b-regen`, verificar la reproducción con `shuffle_records/source_rows.npy` (debe contener exactamente 1.339.815 filas), y usar world size 8, batch local 1 y torch 2.9.1. El orden de los datos es determinista: cada época usa `torch.randperm(1339815, seed=42+e)` truncado a 2616*512 muestras.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: el drafter genera candidatos de 7 tokens que el modelo Qwen3-4B verifica en paralelo, reduciendo la latencia por token generado.
- Integración específica con Qwen/Qwen3-4B: los pesos y la configuración están calibrados para ese modelo objetivo concreto, no son transferibles a otros modelos sin reentrenamiento.
- Soporte de reanudación de entrenamiento: el checkpoint incluye metadatos de estado de entrenamiento (por rango) que permiten continuar el proceso desde el paso 10464, siempre que se cumplan las condiciones de hardware y software.
- Reproducibilidad determinista: los registros de permutación de datos (`shuffle_records/`) permiten verificar la reproducción exacta del orden de entrenamiento.
- No es un modelo autónomo: no genera texto por sí mismo; su función es exclusivamente auxiliar dentro de un pipeline de decodificación especulativa.

## Casos de uso

- Despliegue de Qwen3-4B en entornos de baja latencia: al usar este drafter junto con el modelo objetivo, se puede reducir el tiempo de respuesta en aplicaciones interactivas como chatbots o asistentes virtuales, donde cada milisegundo cuenta.
- Servicios de generación de código en producción: Qwen3-4B es un modelo de 4B parámetros adecuado para tareas de programación; el drafter permite servir este modelo con mayor throughput en APIs de generación de código.
- Inferencia en hardware limitado: al acelerar la generación sin aumentar el tamaño del modelo, se pueden lograr tiempos de respuesta aceptables en GPUs de gama media o incluso en CPU con cuantización, aunque el drafter en sí no está cuantizado.
- Investigación en decodificación especulativa: este checkpoint sirve como referencia para estudiar el comportamiento de drafters entrenados con la familia DSpark, especialmente en lo relativo a la elección de capas objetivo y tamaño de bloque.
- Reanudación de entrenamiento distribuido: el checkpoint incluye el estado completo para continuar el entrenamiento en un clúster de 8 GPUs, útil para investigadores que quieran completar las 10 épocas o experimentar con variaciones del corpus.
- Benchmarking de técnicas de aceleración: se puede comparar el rendimiento de este drafter frente a otros métodos (p. ej., decodificación especulativa con modelos más grandes o con diferentes configuraciones de bloque) en tareas de generación de texto y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento (latencia, throughput, tasa de aceptación de tokens) ni comparaciones con otros drafters. Se recomienda evaluar el drafter en el contexto del modelo Qwen3-4B y medir la aceleración relativa frente a la generación autoregresiva estándar.

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB, lo que indica que el drafter es muy ligero (probablemente menos de 100 millones de parámetros, aunque no se especifica).
- VRAM estimada para inferencia: no disponible, pero al ser un modelo pequeño, su huella de memoria es mínima en comparación con Qwen3-4B (que requiere aproximadamente 8 GB en FP16).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar tanto el drafter como Qwen3-4B en FP16. Para Qwen3-4B cuantizado (p. ej., 4 bits), bastan 4-6 GB.
- Opciones de despliegue: el drafter se sirve junto con el modelo objetivo. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, pero al ser un drafter de DSpark, es probable que requiera un runtime personalizado que implemente el bucle de decodificación especulativa.
- Latencia y throughput: no disponibles. Dependen del modelo objetivo, la implementación del runtime y el hardware.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters de la familia DSpark con los que comparar directamente. El modelo más cercano en propósito es el propio Qwen/Qwen3-4B, que actúa como modelo objetivo, pero no es un drafter. Otras técnicas de decodificación especulativa (p. ej., drafters basados en modelos más pequeños como Llama-68M o modelos entrenados con el método EAGLE) podrían ser comparables, pero no hay datos públicos de este checkpoint para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de propósito general: no puede generar texto de forma autónoma; solo funciona como componente de un sistema de decodificación especulativa junto con Qwen3-4B.
- Licencia no especificada: el repositorio no indica la licencia, por lo que su uso comercial o de redistribución es incierto. Se recomienda contactar al autor antes de utilizarlo en producción.
- Entrenamiento incompleto: el checkpoint corresponde a la época 4 de 10, por lo que el drafter puede no haber alcanzado su rendimiento óptimo. Los usuarios deben ser conscientes de que es un checkpoint intermedio.
- Dependencia de la versión de torch: la reanudación del entrenamiento requiere torch 2.9.1 exactamente, lo que limita la reproducibilidad en entornos con otras versiones.
- Sin datos de sesgos o alucinación: al ser un modelo auxiliar, no se han evaluado sesgos ni riesgos de alucinación. Estos dependen del modelo objetivo Qwen3-4B.
- Sin soporte de cuantización documentado: no se indica si el drafter puede cuantizarse (p. ej., a GGUF o AWQ), lo que podría limitar su uso en entornos con restricciones de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xf15/ssd-dspark-prog-qwen3-4b
- Modelo objetivo Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento (referenciado en la model card): `xf15/ssd-perfectblend-qwen3-4b-regen` (no se proporciona URL directa)
