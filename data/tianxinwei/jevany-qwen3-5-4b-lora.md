# tianxinwei/JevAny-Qwen3.5-4B-LoRA

## Resumen

JevAny-Qwen3.5-4B-LoRA es un adaptador LoRA publicado por el usuario tianxinwei sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo generativo al uso: se trata de un "decision model" que emplea un mecanismo de lectura tipo pointer para puntuar representaciones de opciones en lugar de generar texto de forma autorregresiva. Forma parte del ecosistema JevAny, cuyo codigo debe obtenerse en la revision de release enlazada desde el repositorio del proyecto en GitHub.

El checkpoint incluye unicamente los pesos del adaptador LoRA y los metadatos de readout de JevAny, no los pesos del modelo base, que deben descargarse por separado. El repositorio ocupa 0,1 GB. La relevancia de esta publicacion radica en su enfoque de decision por pointer (que admite mas de 255 opciones, sujeto a los limites de contexto) y en una divulgacion agregada del entrenamiento, aunque el modelo acumula cero descargas y cero "likes" y no declara licencia ni idiomas soportados.

Se trata de un artefacto muy reciente (creado el 29 de septiembre de 2026) y de nicho, orientado a tareas de clasificacion, preferencia, decisiones de agente/herramienta y seguridad sobre el backbone de Qwen3.5-4B, un modelo denso de 4B parametros con ventana nativa de 262.144 tokens segun fuentes externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-4B; backbone transformer denso con fusion vision-lenguaje segun fuentes web del modelo base |
| Parametros totales | No disponible para el adaptador (repositorio de 0,1 GB); modelo base de aproximadamente 4B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos en el modelo base segun LM Studio; 256K segun Overmind (el adaptador queda sujeto a los limites de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el autor indica que se aplican la licencia y condiciones de acceso del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA + metadatos de readout JevAny) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-4B, un transformer denso de aproximadamente 4B parametros que, segun las fuentes web consultadas, incorpora entrenamiento de fusion temprana multimodal, tool calling y una ventana de contexto nativa de 262.144 tokens. La innovacion principal de este checkpoint no esta en el backbone, sino en el sistema de lectura JevAny: en lugar de generar la respuesta token a token, se puntua la representacion de cada opcion con una cabeza pequena aprendida (readout tipo pointer). Esto permite soportar mas de 255 opciones y, en principio, una velocidad de inferencia similar a la de los modelos de token directo, ya que ambos realizan un unico prefill del backbone sin generacion autorregresiva. La diferencia esta en el entrenamiento: los modelos de token directo usan entropia cruzada sobre todo el vocabulario y son mas lentos de entrenar, mientras que el readout pointer resulta mas eficiente.

En cuanto a los datos, el autor divulga un total de 1.772.725 registros de texto y 2.180.242 decisiones etiquetadas, con categorias amplias declaradas: preferencia, decisiones de agente/herramienta, razonamiento, clasificacion y seguridad. La mezcla detallada y la composicion por fuente no forman parte de esta release. No se especifica el uso de RLHF o DPO ni el numero exacto de tokens de entrenamiento.

## Capacidades

- Modelado de decision: puntua opciones mediante un readout pointer, apto para tareas de eleccion entre alternativas.
- Soporte de mas de 255 opciones por consulta, sujeto a los limites de contexto.
- Clasificacion de preferencias, decisiones de agente y de uso de herramientas.
- Razonamiento y clasificacion general segun las categorias de entrenamiento declaradas.
- Evaluacion orientada a seguridad.
- Inferencia sin generacion autorregresiva (un solo prefill del backbone).
- Capacidades del modelo base (Qwen3.5-4B): ventana de 262.144 tokens, tool calling y fusion vision-lenguaje, segun fuentes externas.
- Capacidades multilingues: no disponibles para el adaptador.

## Casos de uso

- Enrutado de decisiones de agente: dado un conjunto de herramientas o acciones disponibles (mas de 255), el readout pointer puntua cual elegir, integrandose en un bucle de agente sobre el backbone Qwen3.5-4B.
- Clasificacion de preferencias: seleccion entre pares o conjuntos de respuestas candidatas, aprovechando la cabeza de decision en lugar de generar y comparar texto.
- Filtrado de seguridad: clasificacion de contenido entrante en multiples categorias usando el readout pointer como cabecera de decision.
- Sistemas de recomendacion basados en opciones: puntuacion de listas largas de candidatos en una sola pasada de prefill.
- Enrutado semantico y clasificacion multietiqueta: asignacion de categorias a texto en pipelines de extraccion de informacion.
- Decisiones de tool calling en produccion: eleccion de la funcion o API adecuada dentro de un catalogo amplio, sujeto a la ventana de contexto del modelo base.
- Evaluacion interna de modelos: uso como juez de preferencias o como componente de un banco de pruebas (JevBench), segun los protocolos declarados por el autor.

## Benchmarks y rendimiento

Resultados declarados por el autor, con los protocolos congelados Transfer-v9 y el conjunto publico JevBench. Los valores son exactitud (accuracy), no la puntuacion compuesta del leaderboard sellado de JevBench.

| Conjunto | Tamano | Exactitud |
|---|---:|---:|
| Transfer-v9 | 1.046 | 78,68% |
| JevBench Easy | 48 | 100,00% |
| Original | 72 | 95,83% |
| Hard | 111 | 61,26% |
| JevBench total | 231 | 80,09% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene solo el adaptador LoRA (0,1 GB); requiere descargar por separado el modelo base Qwen3.5-4B y el codigo de JevAny en la revision de release.
- VRAM estimada para el modelo base de 4B: aproximadamente 8-10 GB en bf16 (pesos mas overhead), estimacion basada en el tamano del backbone, no confirmada por el autor.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3-4 GB, valor estimado, no confirmado.
- GPU consumer: un backbone de 4B en bf16 cabe en tarjetas con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); en cuantizacion baja podria caber en 8 GB.
- El autor invoca el despliegue con `jevany serve --checkpoint <repo> --device cuda --dtype bf16`.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no disponibles para este artefacto, ya que requiere el runtime especifico de JevAny.
- Latencia y throughput: no disponibles; el autor senala que la velocidad de inferencia es similar entre modelos pointer y de token directo, ambos con un unico prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| JevAny-Qwen3.5-4B-LoRA | Adaptador sobre 4B | Sujeto al base (hasta 262.144 tokens) | No disponible | 0 descargas, 0 likes; requiere codigo JevAny |
| theogorg/qwen3.5_4b_lora | Adaptador sobre 4B | Sujeto al base | No disponible | Alternativa de LoRA sobre el mismo backbone |
| banyaaiofficial/qwen3.5-4b-pkm-multi-lora-v2 | Adaptador multiloRA sobre 4B | Sujeto al base | apache-2.0 | Soporta coreano e ingles; orientado a agentes y tool-use |
| Qwen3.5-4B (base) | 4B densos | 262.144 tokens | Segun terminos de Qwen | Modelo base multimodal con tool calling |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si permite uso comercial; el autor remite a la licencia del modelo base.
- Idiomas soportados no disponibles.
- Requiere el codigo de JevAny en una revision concreta; no funciona con runtimes estandar de transformers sin ese componente.
- El repositorio no incluye los pesos base; hay que descargarlos aparte y aceptar sus condiciones de acceso.
- Divulgacion de datos agregada: no se detalla la mezcla ni la composicion por fuente, lo que dificulta auditar sesgos.
- Riesgo de alucinacion y de sesgo no cuantificado ni documentado.
- El rendimiento en el subconjunto Hard es notablemente inferior (61,26%) frente al resto de conjuntos.
- Soporte de mas de 255 opciones sujeto a los limites de contexto del backbone.
- Modelo sin traccion: cero descargas y cero likes, sin validacion externa independiente.
- Fecha de creacion muy reciente (29 de septiembre de 2026) y sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tianxinwei/JevAny-Qwen3.5-4B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio JevAny: https://github.com/weitianxin/JevAny
- Qwen 3.5 4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Qwen 3.5 4B en Overmind: https://www.overmindlab.ai/models/qwen-3-5-4b
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
- LoRA alternativo theogorg/qwen3.5_4b_lora: https://huggingface.co/theogorg/qwen3.5_4b_lora
- LoRA alternativo banyaaiofficial/qwen3.5-4b-pkm-multi-lora-v2: https://huggingface.co/banyaaiofficial/qwen3.5-4b-pkm-multi-lora-v2
