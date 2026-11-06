# vikingL08/zils-lite-body

## Resumen

Zils lite decision body es un fine-tune de aproximadamente 853 millones de parámetros publicado por el usuario vikingL08 en Hugging Face. Se construye a partir de la media uniforme de tres modelos base: `vllm-sr/d3-lite`, `Maincode/Matilda-Decision-v1-Edge` y `zils-ai/jiwo-0.8b-full`, y sobre esa media se aplica un LoRA de rango 16 entrenado con datos de respuesta y distribuciones de preguntas de sentido común. El modelo se distribuye con licencia Apache-2.0 y pesos en formato safetensors bajo la arquitectura declarada `qwen3_5` con código personalizado.

El objetivo declarado es doble: por un lado, ajustar las capacidades lingüísticas del modelo base y, por otro, alinear la capa de decisión sobre preguntas de sentido común. El autor indica que se excluyeron fuentes con licencias share-alike y no comerciales, y que los datos de entrenamiento provienen de CommonsenseQA (MIT), QASC (CC BY 4.0), HellaSwag (MIT) y tareas de BIG-bench empaquetadas por `tasksource/bigbench` (Apache-2.0), además del dataset `zils-ai/zils-relay-answers` (Apache-2.0).

La relevancia de este modelo es limitada y muy específica: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados, y con pesos que dependen de código personalizado. Es útil como referencia para quienes estudian técnicas de model merging, LoRA de bajo rango y alineación de capas de decisión en modelos pequeños, pero no como un modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de una media uniforme de pesos de tres checkpoints concretos: `vllm-sr/d3-lite` en el commit `03560c26f5199c3c04129a2ccb38960c913635e0`, `Maincode/Matilda-Decision-v1-Edge` en `90c2cee9c6f607f40a4802a95939857d7eb6dfeb` y `zils-ai/jiwo-0.8b-full` en `adce2ce92cd2130fd3ed451cf5f9642e3dfe4a57`. Sobre esa media se entrena un LoRA de rango 16 aplicado a los pesos de lenguaje. La model card no detalla la arquitectura interna más allá del tag `qwen3_5`, ni el número de capas, dimensión oculta o mecanismo de atención; tampoco especifica si se trata de un transformer denso convencional o de una variante híbrida.

El entrenamiento se realiza en dos fases según la model card: primero sobre filas permisivas de `zils-ai/zils-relay-answers` (Apache-2.0) y después sobre una mezcla de esas filas con distribuciones de Matilda sobre preguntas de sentido común del split de entrenamiento. Se excluyen explícitamente fuentes share-alike y no comerciales. Los datos de las tareas de sentido común proceden de CommonsenseQA train (MIT), QASC train (CC BY 4.0), HellaSwag train (MIT) y tareas BIG-bench empaquetadas por `tasksource/bigbench` (Apache-2.0). La capa de visión y la capa de respuesta se heredan del chasis d3-lite, lo que sugiere que el modelo conserva componentes multimodales del base, aunque no se detalla su funcionamiento ni se documenta ningún proceso de RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas de sentido común, según el objetivo declarado del fine-tune.
- Razonamiento sobre preguntas de opción múltiple procedentes de CommonsenseQA, QASC, HellaSwag y BIG-bench, que constituyen el corpus de alineación.
- Herencia de la capa de visión del chasis d3-lite, aunque no se documenta qué tareas visuales soporta ni con qué calidad.
- Herencia de la capa de respuesta del chasis d3-lite, sin especificación de formato de salida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en model merging: el modelo sirve como caso de estudio reproducible de media uniforme de tres checkpoints más LoRA de rango 16, útil para analizar cómo se comporta la fusión de pesos cuando los modelos base tienen arquitecturas y licencias distintas.
- Evaluación de alineación de capas de decisión: permite estudiar si un ajuste sobre distribuciones de preguntas de sentido común mejora la calibración de respuestas en modelos de menos de 1.000 millones de parámetros, comparando antes y después del LoRA.
- Experimentos académicos con CommonsenseQA y QASC: al haberse entrenado explícitamente sobre los splits de entrenamiento de estos datasets, es adecuado para reproducir curvas de aprendizaje o analizar sobreajuste en tareas de sentido común.
- Prototipado de pipelines de clasificación de respuestas: la capa de respuesta heredada de d3-lite puede emplearse como bloque en experimentos de selección entre candidatos, siempre que se valide su comportamiento fuera del dominio de entrenamiento.
- Estudio de licencias y procedencia de datos: el modelo documenta con precisión las licencias de cada fuente (MIT, CC BY 4.0, Apache-2.0) y la exclusión de material share-alike, lo que lo convierte en un ejemplo útil para auditorías de cumplimiento en datasets de entrenamiento.
- Base para fine-tunes posteriores en entornos de investigación: con 853 millones de parámetros y pesos safetensors de 1,7 GB, es manejable en una sola GPU consumer para experimentos de ajuste con LoRA, siempre que se acepte la falta de documentación sobre contexto e idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) debería poder cargar el modelo en precisión completa para inferencia; para entrenamiento con LoRA se recomienda al menos 12-16 GB (RTX 4080, RTX 4090, A10).
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más, siempre que se resuelva la dependencia de `custom_code`.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el tag `custom_code` implica que la carga requiere `trust_remote_code=True` y el código específico del repositorio, lo que puede limitar la compatibilidad con motores de inferencia estándar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zils lite decision body | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, safetensors, custom_code | Fine-tune de media de tres checkpoints con LoRA r16 |
| `zils-ai/jiwo-0.8b-full` | ~0,8B (por nombre) | no disponible | no disponible | Hugging Face | Uno de los tres modelos base de la media |
| `Maincode/Matilda-Decision-v1-Edge` | no disponible | no disponible | no disponible | Hugging Face | Modelo base orientado a decisión, usado en la media |
| `vllm-sr/d3-lite` | no disponible | no disponible | no disponible | Hugging Face | Chasis del que se heredan capas de visión y respuesta |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a procedencia y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay métricas de MMLU, HumanEval, GSM8K ni de las tareas de sentido común sobre las que se entrenó, lo que impide evaluar su calidad real.
- Riesgo de sobreajuste a los splits de entrenamiento de CommonsenseQA, QASC, HellaSwag y BIG-bench, dado que el ajuste se realizó sobre esas distribuciones; el rendimiento en dominios fuera de esos datasets es desconocido.
- Dependencia de `custom_code`: la carga requiere código personalizado del repositorio, lo que introduce riesgos de seguridad y compatibilidad con motores de inferencia estándar como vLLM, llama.cpp o TGI.
- Idiomas no declarados: no se especifica qué lenguas soporta ni con qué calidad, lo que desaconseja su uso en producción multilingüe.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte que se excluyeron fuentes share-alike y no comerciales; conviene auditar la procedencia de los datos si se va a explotar comercialmente.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Riesgo de alucinación no cuantificado: al ser un modelo pequeño y sin evaluación publicada, la fiabilidad factual es desconocida.
- La capa de visión heredada de d3-lite no está documentada; no debe asumirse que el modelo realiza tareas visuales de forma fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vikingL08/zils-lite-body
- Perfil del autor: https://huggingface.co/vikingL08
- Listado de modelos del autor: https://huggingface.co/vikingL08/models
- Dataset de entrenamiento: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Modelo base `vllm-sr/d3-lite`: https://huggingface.co/vllm-sr/d3-lite
- Modelo base `Maincode/Matilda-Decision-v1-Edge`: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Modelo base `zils-ai/jiwo-0.8b-full`: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Dataset BIG-bench empaquetado: https://huggingface.co/datasets/tasksource/bigbench
