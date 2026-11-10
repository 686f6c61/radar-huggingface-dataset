# zybian222/olmo3-7b-table1-omi-standard-sft-20261110t071802z

## Resumen

Este modelo es un ajuste fino completo (full fine-tuning) del modelo base allenai/Olmo-3-1025-7B, desarrollado por Allen AI y publicado bajo licencia Apache-2.0. El autor del checkpoint, zybian222, lo entrena siguiendo la receta "Table 18 no-filter" descrita en el artículo TailSFT, empleando como corpus el conjunto de datos NVIDIA OpenMathInstruct-2 (licencia CC BY 4.0). El resultado es un modelo de generación de texto orientado a matemáticas, con la plantilla de chat fijada del OLMo-3 Instruct.

El modelo cuenta con 7.298.011.136 parámetros (aproximadamente 7,3 millardos) y se distribuye en formato safetensors con un tamaño de repositorio de 14,6 GB, lo que corresponde a pesos en precisión de 16 bits. La arquitectura subyacente es la del OLMo-3 de Allen AI, un transformer decoder-only, aunque la model card no detalla la longitud de contexto efectiva ni la composición completa del entrenamiento.

La relevancia de este checkpoint es acotada: se trata de un experimento de reproducción de una receta de ajuste fino con fines de investigación, publicado sin métricas de benchmarks en la información disponible y sin descargas ni interacciones en Hugging Face. Es útil como referencia para quienes estudian el efecto del ajuste fino matemático sobre OLMo-3, pero no debe tratarse como un modelo validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo-3 de Allen AI; detalles de capas y atención no disponibles) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de allenai/Olmo-3-1025-7B, un transformer decoder-only de Allen AI con aproximadamente 7,3 mil millones de parámetros. El ajuste realizado es un full fine-tuning, es decir, se actualizan todos los pesos del modelo base, no solo adaptadores. La receta empleada corresponde a la "Table 18 no-filter" del artículo TailSFT, que el autor referencia como guía metodológica, aunque aclara explícitamente que este checkpoint "no es TailSFT".

Los datos de entrenamiento provienen de NVIDIA OpenMathInstruct-2 bajo licencia CC BY 4.0, un corpus orientado a instrucciones y razonamiento matemático. La model card menciona que los manifiestos del repositorio contienen los detalles de muestreo, dependencias y las diferencias no resueltas respecto a la ejecución original de los autores, pero no se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional con la plantilla de chat fijada de OLMo-3 Instruct.
- Razonamiento matemático y resolución de problemas, dado el corpus de ajuste (OpenMathInstruct-2).
- Instrucciones en formato conversacional multi-turno, al heredar el template de instruct del modelo base.
- Capacidades multilingües: no disponibles; la model card no documenta idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste matemático podría favorecer el razonamiento paso a paso, pero no hay evidencia publicada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre ajuste fino matemático: sirve como punto de comparación reproducible para estudiar el efecto de la receta "Table 18 no-filter" sobre OLMo-3, usando los manifiestos del repositorio para replicar el muestreo.
- Evaluación de recetas de SFT: útil en experimentos académicos que comparen full fine-tuning frente a LoRA u otras técnicas sobre el mismo modelo base y corpus.
- Generación de explicaciones matemáticas: el ajuste con OpenMathInstruct-2 lo hace adecuado para producir soluciones paso a paso en entornos de tutoría experimental, siempre con validación humana.
- Baseline en pipelines de evaluación: puede emplearse como referencia en suites internas de razonamiento matemático antes de adoptar modelos mayores o más validados.
- Estudio de plantillas de chat: al fijar el template de OLMo-3 Instruct, permite analizar la sensibilidad de las respuestas al formato de conversación.
- Prototipado de asistentes educativos: en fases tempranas de diseño, para probar la interacción conversacional sobre temas matemáticos con contexto limitado y supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que "los resultados de benchmarks se registran por separado", sin incluirlos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 18-20 GB.
- Cuantización a 8 bits: alrededor de 8 GB de pesos; a 4 bits, alrededor de 4-5 GB, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 8-12 GB como RTX 3080 o RTX 4070, siempre que se generen cuantizaciones propias.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving; llama.cpp u Ollama requerirían conversión a GGUF no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zybian222/olmo3-7b-table1-omi-standard-sft | 7,3 B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Ajuste matemático experimental sobre OLMo-3 |
| allenai/Olmo-3-1025-7B | ~7 B | no disponible | Apache-2.0 | Hugging Face (modelo base) | Base sin ajuste matemático |
| Mistral-7B-Instruct | 7,2 B | 32 K (según versión) | Apache-2.0 | Hugging Face, ampliamente adoptado | Referencia generalista de 7 B |
| Qwen2.5-7B-Instruct | 7,6 B | 128 K | Apache-2.0 | Hugging Face, muy adoptado | Alternativa generalista con contexto largo |

La comparación es aproximada: no hay benchmarks publicados para este checkpoint, por lo que no puede establecerse una jerarquía de rendimiento frente a las alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks; el rendimiento real es desconocido y no debe asumirse superior al modelo base.
- El autor advierte diferencias no resueltas respecto a la ejecución original de TailSFT, lo que compromete la reproducibilidad exacta.
- El ajuste está especializado en matemáticas; puede degradar capacidades generales del modelo base fuera de ese dominio.
- Riesgo de alucinación inherente a los modelos de 7 B, especialmente en razonamiento matemático con pasos largos.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano.
- Licencia Apache-2.0 permite uso comercial, pero el corpus OpenMathInstruct-2 está bajo CC BY 4.0 y debe verificarse el cumplimiento de atribución.
- Cero descargas y cero interacciones: sin validación por parte de la comunidad.
- Longitud de contexto y cuantizaciones no documentadas; el despliegue en producción requiere pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/zybian222/olmo3-7b-table1-omi-standard-sft-20261110t071802z
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento (NVIDIA OpenMathInstruct-2): no disponible enlace directo en la información proporcionada
- Artículo TailSFT: no disponible enlace directo en la información proporcionada
