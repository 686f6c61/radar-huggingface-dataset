# wrbooth/Qwen2.5-7B-Instruct-FP8-Dynamic

## Resumen

wrbooth/Qwen2.5-7B-Instruct-FP8-Dynamic es una cuantización en FP8 del modelo Qwen/Qwen2.5-7B-Instruct, publicada por el usuario wrbooth como parte del proyecto de benchmarks vllm-serve-bench. No es un lanzamiento oficial de Alibaba Qwen: es un checkpoint derivado, generado con la herramienta llm-compressor y almacenado con el esquema compressed-tensors, que vLLM interpreta leyendo el propio config.json sin necesidad de pasar la bandera --quantization.

El objetivo es abaratar el servicio de un modelo de 7.615.616.512 parámetros sin recurrir a recalibración: cada capa Linear se cuantiza a FP8 E4M3 con una escala estática por canal de salida, mientras que las activaciones usan FP8 con escala calculada dinámicamente por token, de modo que no se empleó conjunto de calibración alguno. La lm_head se mantiene en bf16 y la caché KV no se cuantiza.

Su relevancia es práctica: permite servir un modelo de chat de 7,6 B en GPUs con soporte nativo de FP8 (Ada, Hopper, Blackwell) con unos pesos que ocupan aproximadamente la mitad que en bf16, a cambio de una verificación de calidad que el autor describe explícitamente como un smoke test y no como una evaluación formal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only); modelo base con Grouped Query Attention según la documentación de Qwen |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | no especificada en la model card de esta cuantización; el modelo base está documentado con 131.072 tokens |
| Tipos de cuantización | FP8 E4M3 con escala estática por canal de salida en pesos y escala dinámica por token en activaciones; lm_head en bf16; caché KV sin cuantizar |
| Idiomas soportados | no disponible en la model card; el modelo base está documentado como multilingüe |
| Licencia | Apache 2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors con esquema compressed-tensors; tamaño del repositorio 8,7 GB |
| Modelo base | Qwen/Qwen2.5-7B-Instruct (relación: quantized) |
| Herramienta de cuantización | llm-compressor (vLLM project) |
| Pipeline | text-generation |
| Compatibilidad declarada | vLLM, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El checkpoint no introduce ningún entrenamiento nuevo: es una cuantización post-entrenamiento del Qwen2.5-7B-Instruct original. La receta exacta está publicada en `recipe.yaml` y la trazabilidad (snapshot de origen, versiones de herramientas, dispositivo y tiempo empleado) en `provenance.json`, ambos dentro del repositorio. La decisión de diseño destacable es el uso de escalas dinámicas por token en las activaciones, lo que elimina la necesidad de un dataset de calibración y evita el sesgo que introduce la calibración estática cuando la distribución de entrada en producción difiere de la usada offline.

Se mantiene deliberadamente fuera de la cuantización la `lm_head`, porque proyecta sobre el vocabulario completo y sus errores caen directamente sobre la distribución de salida; también se mantiene la caché KV en precisión original. No se dispone de información sobre el corpus de entrenamiento del modelo base, el número de tokens, la composición del dataset ni las etapas de RLHF/DPO en la información proporcionada; esos detalles corresponden a la documentación publicada por Qwen para Qwen2.5-7B-Instruct.

## Capacidades

Nota: la model card de esta cuantización no enumera capacidades; las siguientes se heredan del modelo base Qwen2.5-7B-Instruct y no han sido verificadas específicamente sobre este checkpoint por el autor más allá de un smoke test.

- Generación de texto y conversación multi-turno en formato de asistente.
- Razonamiento, matemáticas y generación de código, capacidades propias del modelo base.
- Soporte de tool calling / function calling, heredado del modelo base.
- Soporte de agentes y razonamiento en varios pasos (multi-step), limitado por la ventana de contexto efectiva del despliegue.
- Capacidades multilingües heredadas del modelo base; no se declaran idiomas concretos en esta ficha de modelo.
- Modo instruct/chat: el checkpoint es una cuantización de la variante Instruct, no de la base.
- No hay capacidades de visión ni de audio en esta variante.

## Casos de uso

- Servicio de chat en producción con vLLM: el modelo se sirve directamente con `vllm serve wrbooth/Qwen2.5-7B-Instruct-FP8-Dynamic`, sin flags de cuantización, lo que simplifica el despliegue frente a esquemas que requieren configuración adicional del motor.
- Asistentes conversacionales de atención al cliente: al ser un modelo de 7,6 B en FP8, el coste por GPU es bajo y permite mantener varias conversaciones concurrentes con caché KV sin cuantizar y contexto largo.
- Generación y revisión de código: el modelo base está orientado a tareas de código y soporta tool calling, por lo que encaja en asistentes de IDE o en pasos automatizados de revisión dentro de pipelines de CI/CD.
- Extracción de información estructurada y clasificación: la salida en JSON es una capacidad del modelo base y resulta útil para enriquecer documentos, enrutar tickets o poblar bases de datos.
- Prototipado e investigación en cuantización: al publicar `recipe.yaml`, `provenance.json` y los scripts de cuantización, el repositorio sirve como caso reproducible para comparar FP8 dinámico frente a bf16 con el mismo motor y las mismas banderas.
- Despliegue en hardware de gama alta para consumo: probado sobre una RTX 5090 (Blackwell, sm_120) con vLLM 0.29.0 y kernel CUTLASS de FP8, es un punto de partida razonable para servir un 7 B en una GPU de consumo con soporte FP8.
- Evaluación comparativa de motores de inferencia: el proyecto asociado (vllm-serve-bench) está pensado para barrer configuraciones y SLO, por lo que el checkpoint es útil como carga de trabajo estándar en pruebas de throughput y latencia.
- Sistemas con restricciones de memoria: al reducir el peso de los pesos aproximadamente a la mitad respecto a bf16, permite liberar VRAM para lotes mayores o contextos más largos en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las cifras de servicio frente al original en bf16 (mismas banderas de motor, mismo barrido y mismos SLO) están en `docs/03-results.md` del repositorio vllm-serve-bench (experimento B2), generadas a partir de resultados crudos versionados, pero no se incluyen valores numéricos en la información proporcionada. También existe una comprobación de calidad en `results/quality/report.md` consistente en decodificación greedy sobre un conjunto pequeño y fijo de prompts con respuesta exacta y abiertos, comparada con bf16 y puntuada por contención; el propio autor advierte que no es una evaluación.

## Requisitos de hardware

- Peso de los pesos: los 7.615.616.512 parámetros en FP8 suponen aproximadamente 7,6 GB; el repositorio completo ocupa 8,7 GB.
- VRAM estimada: no publicada. Estimación no oficial a partir del tamaño de pesos: con caché KV en bf16, lotes pequeños y contexto moderado, un despliegue típico necesitaría del orden de 10 a 16 GB de VRAM, cifra que debe verificarse en el hardware objetivo y que crece con la longitud de contexto y el número de secuencias concurrentes.
- GPU recomendadas: el autor lo probó en una RTX 5090 (Blackwell, sm_120) con vLLM 0.29.0, donde vLLM selecciona un kernel CUTLASS de FP8. Los kernels FP8 requieren soporte hardware: arquitecturas Ada (por ejemplo L40S, RTX 4090), Hopper (H100, H200) y Blackwell (B200, RTX 5090).
- GPU de consumo: sí cabe, siempre que la GPU tenga soporte FP8 (serie RTX 40 y RTX 50). En GPU sin soporte FP8, vLLM puede degradar el rendimiento o rechazar la ejecución.
- Opciones de despliegue: vLLM es la ruta soportada y probada (`vllm serve wrbooth/Qwen2.5-7B-Instruct-FP8-Dynamic`); el repositorio está etiquetado también para text-generation-inference y endpoints_compatible. No se publica formato GGUF, por lo que llama.cpp y Ollama no están soportados con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada; las mediciones se remiten a `docs/03-results.md` (experimento B2) y proceden de una única GPU de consumo, por lo que el autor advierte que no son trasladables a otro hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wrbooth/Qwen2.5-7B-Instruct-FP8-Dynamic | 7,6 B | no especificado en la ficha (base: 131.072 tokens) | FP8, pesos estáticos por canal + activaciones dinámicas por token | Apache 2.0 | HuggingFace; repositorio con 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen2.5-7B-Instruct (bf16) | 7,6 B | 131.072 tokens según la documentación de Qwen | ninguna (bf16) | Apache 2.0 | HuggingFace, modelo base oficial |
| RedHatAI/Qwen2.5-7B-Instruct-FP8-dynamic | 7,6 B | no disponible | FP8 en pesos y activaciones, esquema dinámico | Apache 2.0 | HuggingFace |

No se dispone de cifras de rendimiento publicadas para ninguno de los tres checkpoints en la información proporcionada, por lo que no es posible comparar calidad ni throughput. La diferencia relevante entre las dos cuantizaciones FP8 es el productor y la receta concreta: este checkpoint publica la receta exacta y la trazabilidad de la ejecución, lo que permite reproducirlo.

## Limitaciones y advertencias

- La verificación de calidad es un smoke test sobre un conjunto pequeño de prompts escritos a mano y puntuado por contención; el propio autor indica que no es una evaluación y recomienda usar una suite adecuada antes de confiar en el checkpoint.
- Los kernels FP8 requieren soporte hardware (Ada, Hopper, Blackwell). En otras arquitecturas vLLM puede degradar el rendimiento o negarse a ejecutar el modelo.
- Los resultados de rendimiento proceden de una única GPU de consumo y no son trasladables a otro hardware.
- La caché KV no está cuantizada, por lo que el ahorro de memoria afecta a los pesos, no al consumo asociado al contexto ni al número de secuencias concurrentes.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluación específica de idiomas para este checkpoint; cualquiera de estas propiedades debe heredarse del modelo base y verificarse en el dominio de uso.
- Es un artefacto no oficial: no procede de Alibaba Qwen, y el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.
- Licencia Apache 2.0, igual que el modelo base, por lo que el uso comercial está permitido; conviene aun así revisar los términos del modelo base y cualquier obligación de atribución.
- Al ser una cuantización, existe degradación acumulativa frente a bf16; el autor no cuantifica su magnitud más allá del smoke test mencionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wrbooth/Qwen2.5-7B-Instruct-FP8-Dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Cuantización FP8 equivalente de Red Hat: https://huggingface.co/RedHatAI/Qwen2.5-7B-Instruct-FP8-dynamic
- Proyecto de benchmarks vllm-serve-bench: https://github.com/wrbooth/vllm-serve-bench
- Scripts de cuantización: https://github.com/wrbooth/vllm-serve-bench/tree/main/scripts/quantize
- Resultados de servicio (experimento B2): https://github.com/wrbooth/vllm-serve-bench/blob/main/docs/03-results.md
- Informe de la comprobación de calidad: https://github.com/wrbooth/vllm-serve-bench/blob/main/results/quality/report.md
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
- Ficha de despliegue del modelo base consultada: https://llmapi.ai/models/qwen-qwen2-5-7b-instruct/
