# youngseok12/AX-3.1-Light-specialist-300-ties-answerfirst

## Resumen

El modelo `AX-3.1-Light-specialist-300-ties-answerfirst` es un modelo de lenguaje generativo en coreano desarrollado por el usuario `youngseok12`. Se trata de una fusión de adaptadores LoRA sobre el modelo base `skt/A.X-3.1-Light`, que combina tres especialistas (K, R y C) mediante la técnica TIES y aplica posteriormente un LoRA de corrección del formato de salida, denominado "answer-first". El objetivo es mejorar el rendimiento en tareas de razonamiento y evaluación en coreano, especialmente en benchmarks como KMMLU-Pro, MuSR, Com2-main y CLIcK.

El modelo tiene 7.264.800.768 parámetros (7,26 mil millones) y se distribuye en formato BF16 `safetensors`, sin necesidad de adaptadores separados. Su arquitectura es un Transformer basado en la arquitectura Llama, heredada del modelo base. La longitud de contexto no se especifica en la información disponible. Este modelo es relevante en el ámbito de la investigación sobre técnicas de fusión de modelos (`model merging`) y ajuste fino supervisado, ya que documenta un pipeline de dos etapas y presenta una evaluación local comparativa frente a versiones anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en arquitectura Llama; derivado de `skt/A.X-3.1-Light`) |
| Parametros totales | 7.264.800.768 (7,26 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (`safetensors`). No se publican cuantizaciones adicionales en el repositorio |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (BF16, standalone) |

## Arquitectura y entrenamiento

El modelo se construye en dos etapas. En la primera etapa se entrenan tres LoRAs especialistas sobre el modelo base `skt/A.X-3.1-Light`: uno para KMMLU-Pro (K), otro para MuSR (R) y un tercero para Com2-main (C). Cada LoRA se entrena con 300 filas de datos, utilizando los conceptos `correct_unstable` (para K y R) y `correct_all` (para C). Estos adaptadores se fusionan mediante TIES con una densidad de 0.5, produciendo un modelo intermedio.

En la segunda etapa se entrena un LoRA adicional de corrección del formato de salida, llamado "answer-first", sobre el resultado de la primera fusión. Para ello se utiliza el mismo dataset que en la versión `v0.21`: `format_sft_answer_first_v1.jsonl`, con 5.801 filas, proveniente de las fuentes AI Hub 569/71874/71857/71949/71610. Los hiperparámetros de este LoRA son rank 16, alpha 32, learning rate 5e-5 con scheduler coseno y una sola época. El resultado final es un modelo completo en BF16, listo para usar con Transformers.

## Capacidades

- Generación de texto en coreano con un formato de respuesta estructurado y compacto: `정답: X (근거: <una frase>)`.
- Especialización en tareas de razonamiento y evaluación en coreano, con mejoras documentadas en los ejes CLIcK, KMMLU-Pro, Com2-main y SNU-KO-MuSR.
- Capacidad de selección de respuesta en preguntas de opción múltiple y razonamiento sobre escenarios o historias.
- Modelo denso sin arquitectura MoE, por lo que la inferencia se realiza con todos los parámetros activos.
- No se documenta soporte de tool calling, agentes, visión, audio ni capacidades multilingües más allá del coreano.

## Casos de uso

- Evaluación de modelos coreanos en pipelines de benchmark: el modelo puede integrarse en sistemas automatizados que generan respuestas en formato canónico y miden la precisión en ejes como KMMLU-Pro o Com2-main.
- Asistente de tutoría académica en coreano: gracias a su formato "answer-first", puede proporcionar una respuesta directa seguida de una justificación breve, útil en entornos educativos.
- Investigación en técnicas de fusión de modelos: sirve como caso de estudio para comparar la estrategia TIES combinada con una corrección posterior de formato frente a otras variantes del autor.
- Generación de datos etiquetados en coreano: puede utilizarse para crear pares de preguntas y respuestas con una estructura normalizada, facilitando el entrenamiento de otros modelos.
- Sistemas de preguntas y respuestas de conocimiento en coreano: adecuado para dominios académicos donde se requiere una respuesta concisa y una justificación mínima.
- Experimentación en razonamiento multi-hop: el componente MuSR sugiere capacidades para tareas que implican deducción sobre historias o escenarios, donde el modelo puede ofrecer una conclusión sintetizada.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados de una evaluacion local realizada por el autor, con n=100 por eje, sobre una suite canonica de benchmarks en coreano. Los valores corresponden a la metrica A_acc (accuracy). Es importante señalar que esta evaluacion no es un benchmark oficial publicado.

| Eje | Base | v0.21 | Stage 1 (solo C) | Este modelo |
|---|---:|---:|---:|---:|
| CLIcK | 0.664 | 0.63 | 0.70 | 0.75 |
| KMMLU-Pro | 0.310 | 0.38 | 0.40 | 0.40 |
| Com2-main | 0.610 | 0.67 | 0.65 | 0.66 |
| SNU-KO-MuSR | 0.476 | 0.56 | 0.50 | 0.51 |
| Media | 0.515 | 0.560 | 0.5625 | 0.580 |

El autor indica que, segun esta diagnostico local, el modelo alcanza el mejor resultado entre todos los modelos medidos en su proyecto hasta la fecha. No obstante, advierte que las diferencias pueden deberse al ruido estadistico por el reducido tamaño muestral.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14,5 GB para los pesos, mas el overhead de la cache KV y las activaciones. Se recomienda al menos 20 GB de VRAM para contextos de longitud media.
- GPU recomendadas: A100 de 40 GB, H100 de 80 GB o RTX 4090 de 24 GB. En GPUs de consumo, una RTX 3090 o 4090 puede ejecutar el modelo en BF16.
- No se ofrecen cuantizaciones en el repositorio, por lo que GPUs con menos de 16 GB de VRAM no son adecuadas.
- Opciones de despliegue: Transformers (HuggingFace), vLLM y Text Generation Inference (TGI). Para usar llama.cpp, seria necesario convertir manualmente los pesos a formato GGUF, que no se incluye.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con el modelo base y otras variantes del mismo autor que comparten la misma arquitectura y tamaño de parametros.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---:|---|
| `skt/A.X-3.1-Light` | 7,26 mil millones | no disponible | Apache 2.0 | Modelo base original |
| `AX-3.1-Light-specialist-300-ties` | 7,26 mil millones | no disponible | Apache 2.0 | Fusion de especialistas sin correccion answer-first |
| `AX-3.1-Light-specialist-300-ties-answerfirst` | 7,26 mil millones | no disponible | Apache 2.0 | Este modelo, con correccion answer-first |

No se dispone de datos de rendimiento de modelos externos equivalentes en la informacion proporcionada. La comparacion de rendimiento entre estas variantes se recoge en la seccion de benchmarks.

## Limitaciones y advertencias

- La evaluacion local es de tamaño reducido (n=100 por eje) y puede presentar ruido estadistico; el autor advierte que las mejoras podrian no ser significativas.
- El resultado de KMMLU-Pro no se ha validado externamente; el propio autor indica que no puede utilizarse como evidencia real de mejora en ese eje.
- El modelo esta destinado a fines de investigacion y evaluacion, y no debe ser la unica base para decisiones de alto riesgo.
- Solo soporta el idioma coreano, sin capacidades multilingues documentadas.
- No se han publicado benchmarks oficiales que permitan comparar el modelo con otras alternativas del mercado.
- Los datos de entrenamiento provienen de fuentes de AI Hub, lo que puede introducir sesgos propios del dominio y la distribucion de esos datos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y el autor recomienda precaucion en entornos productivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youngseok12/AX-3.1-Light-specialist-300-ties-answerfirst
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Otra variante del autor: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0
