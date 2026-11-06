# Zayaan/reax-generalist-m1

## Resumen

REAX generalist m1 es una entrada del track generalista de REAX (subred 92 de Bittensor), construida a partir del modelo base `baselabs/mammoth-1`, que a su vez es un post-entrenamiento de Qwen3.5-27B. El modelo no se distribuye como un transformer causal convencional, sino en el llamado "layout conjunto" de REAX: una variante de `Qwen3_5Model` con atención completa no causal, un prompt fijo (`qwen.jinja`), un readout en la última posición con temperatura T = 2 y un conjunto cerrado de 255 códigos de respuesta. El autor (Zayaan) aplica dos fine-tunes LoRA de rango 16 sobre todas las proyecciones lineales y fusiona los resultados en un único checkpoint en bf16.

La relevancia del modelo es acotada y muy específica: no es un modelo generativo de propósito general, sino un modelo de decisión que responde a preguntas de opción múltiple dentro del protocolo de evaluación de REAX. Su pipeline declarado en Hugging Face es `feature-extraction` y sus etiquetas incluyen `decision-model`, `reax` y `bittensor`, lo que confirma que su uso previsto es la participación en la competición de mineros de esa subred.

Con 26.085.330.160 parámetros (unos 26,1 mil millones) y un repositorio de 52,2 GB, el modelo hereda toda la capacidad del backbone mammoth-1. La contribución propia del autor es la conversión al layout conjunto y un ajuste fino pequeño sobre datos públicos, con una mejora medida de aproximadamente 2,8 puntos en la métrica S del dev set público de REAX respecto al mismo backbone sin fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-27B, servido en el layout conjunto de REAX (atención completa no causal, readout en última posición, T = 2) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el backbone Qwen3.5 es multilingüe, pero no se especifica para esta entrada) |
| Licencia | MIT |
| Formato de pesos | safetensors (incluye `readout.safetensors`), más `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

El backbone es `baselabs/mammoth-1` en la revisión `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`, un post-entrenamiento de Qwen3.5-27B. El autor reorganiza los pesos sin modificar valores (`model.language_model.*` pasa a `language_model.*` y `model.visual.*` pasa a `visual.*`), lo que indica que el backbone conserva componentes de lenguaje y visión. El readout contiene las filas propias del LM-head de mammoth-1 correspondientes a los 255 códigos de respuesta de REAX. La inferencia se realiza con el `JointRunner` de REAX, que aplica un prompt fijo, atención completa no causal y lectura en la última posición con T = 2.

El ajuste fino consiste en dos ejecuciones LoRA independientes, ambas de rango 16 y alpha 32 sobre todas las proyecciones lineales, con learning rate 2e-5, una época y la cabeza congelada. La pérdida es el readout de pregunta única de REAX a T = 2. La ejecución A usa 6.441 filas balanceadas sobre 24 tipos de tarea de decisión; la ejecución B usa 5.081 filas ponderadas hacia clasificación de seguridad, categorías de arXiv, salida de código y estado de documentos. Las preguntas de hechos que ofrecen la opción "no lo sé" se entrenan hacia la abstención cuando mammoth-1 fallaba. El checkpoint final es la media de los cambios de peso de ambas ejecuciones (pesos 0,5 y 0,5), fusionada en float32 y almacenada en bf16; el cambio relativo reportado es de media 0,000874 y máximo 0,001900.

## Capacidades

- Respuesta a preguntas de decisión de opción múltiple dentro del protocolo de REAX, con un espacio cerrado de 255 códigos de respuesta.
- Abstención calibrada: el fine-tune empuja hacia "no lo sé" en preguntas de hechos donde el modelo base erraba.
- Clasificación de seguridad, categorización de documentos y clasificación de categorías arXiv, según la composición del conjunto de entrenamiento de la ejecución B.
- Generación de código como tipo de tarea presente en el entrenamiento de la ejecución B (no se documenta su calidad).
- Herencia potencial de capacidades multimodales del backbone (existen pesos `visual.*`), aunque la model card no describe su uso en el layout conjunto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para una lectura de decisión única.
- Capacidades multilingües: no declaradas para esta entrada.

## Casos de uso

- Participación como minero en el track generalista de REAX (Bittensor SN92): el modelo se sirve con el `JointRunner` de REAX y responde al conjunto fijo de preguntas del protocolo; es su uso previsto y el único documentado por el autor.
- Validación de pipelines de evaluación de REAX: el dev set público de 300 ítems permite comprobar que el servidor, el prompt `qwen.jinja` y el readout a T = 2 funcionan antes de desplegar una entrada en la subred.
- Clasificación de seguridad de contenido: la ejecución B pondera explícitamente esta tarea, por lo que la entrada puede usarse como clasificador de decisión dentro de un flujo que ya hable el protocolo de REAX.
- Etiquetado de categorías arXiv: el ajuste incluye esta tarea, útil para enrutar preprints a categorías dentro de un pipeline interno que formule la decisión como pregunta cerrada.
- Clasificación de estado de documentos: la ponderación hacia "document status" permite usar la entrada para decidir el estado de un documento en flujos de gestión documental, siempre con el formato de pregunta de REAX.
- Abstención en preguntas de hechos: en sistemas donde un error es más costoso que una no-respuesta, el entrenamiento hacia "no lo sé" reduce respuestas incorrectas confiadas en el subconjunto de preguntas factuales.

## Benchmarks y rendimiento

Resultados medidos por el autor en el dev set público de REAX (300 ítems, scorer de referencia, servido como REAX sirve las entradas conjuntas):

| Modelo | S (w_N 0.2) | T | N |
|---|---|---|---|
| Esta entrada | 59,91 | 88,58 | 66,97 |
| mammoth-1 en layout conjunto, sin fine-tune | 57,15 | 86,54 | 63,64 |
| mammoth-1 tal como se publicó (ruta causal) | 51,32 | 83,39 | 54,60 |

El propio autor advierte que el dev set es público y pequeño, y que debe usarse para comprobar un pipeline, no para ordenar modelos con precisión fina. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y del runner; en la práctica requiere GPUs de 80 GB o reparto multi-GPU.
- Cuantización a 8 bits: alrededor de 26 GB de pesos, viable en una A100 40 GB o en dos RTX 4090; a 4 bits, alrededor de 13 GB, viable en una RTX 4090 o RTX 3090 de 24 GB, aunque el autor no publica variantes cuantizadas ni garantiza que el layout conjunto funcione tras cuantizar.
- GPUs recomendadas: A100 80 GB o H100 para bf16 sin cuantizar; RTX 4090, RTX 3090 o L40S para despliegues cuantizados.
- Opciones de despliegue: el `JointRunner` de REAX con `transformers`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y la atención no causal con readout en última posición hace improbable que funcionen sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en dev REAX (S) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zayaan/reax-generalist-m1 | 26,1 B | no disponible | 59,91 | MIT | Hugging Face |
| baselabs/mammoth-1 (layout conjunto, sin fine-tune) | 26,1 B | no disponible | 57,15 | MIT | Hugging Face |
| baselabs/mammoth-1 (ruta causal publicada) | 26,1 B | no disponible | 51,32 | MIT | Hugging Face |

No se dispone de datos de otras entradas del track generalista de REAX en la información proporcionada, por lo que no es posible comparar con competidores directos de la subred.

## Limitaciones y advertencias

- El modelo está diseñado para un protocolo concreto (REAX, Bittensor SN92) y un espacio cerrado de 255 respuestas; fuera de ese formato su comportamiento no está documentado.
- El dev set de evaluación tiene solo 300 ítems y es público, por lo que las diferencias de 2-3 puntos en S pueden no ser estadísticamente significativas.
- Riesgo de alucinación: aunque el fine-tune entrena la abstención en preguntas factuales, no elimina el riesgo en el resto de tipos de tarea.
- Sesgos conocidos: no documentados por el autor; se heredan los del backbone mammoth-1 y los de los datos de entrenamiento de las dos ejecuciones LoRA, cuya composición exacta solo se describe de forma agregada.
- Idiomas: no se declaran; no se debe asumir soporte multilingüe en esta entrada aunque el backbone lo tenga.
- Licencia MIT permite uso comercial, pero el archivo `NOTICE` impone obligaciones de atribución sobre modelos y datos de entrenamiento upstream que deben revisarse antes de redistribuir.
- El manifiesto `reax-specialist.json` vincula la entrada a la hotkey `5DeYjTThVNFkz6LCKhTSPhnrYYEWuU3bsoG1Df6DDrzuThB4`; esto es relevante para la trazabilidad en la subred, no para el uso fuera de ella.
- No hay variantes cuantizadas publicadas ni garantías de que el layout conjunto (atención no causal, readout a T = 2) se preserve tras cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zayaan/reax-generalist-m1
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Revisión del modelo base: `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`
- REAX (Bittensor SN92): no disponible en la información proporcionada
- Paper, blog o repositorio del `JointRunner`: no disponible en la información proporcionada
