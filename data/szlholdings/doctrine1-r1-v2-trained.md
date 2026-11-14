# SZLHOLDINGS/doctrine1-r1-v2-trained

## Resumen

doctrine1-r1-v2-trained es un adaptador LoRA (QLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen3-1.7B, orientado a la investigacion en medicion de honestidad y comportamiento de abtencion en modelos de lenguaje. No es un modelo independiente: requiere cargar el base Qwen3-1.7B y aplicar el adaptador mediante PEFT. El repositorio tiene un tamano de 0.0 GB, lo que confirma que se distribuye unicamente como pesos del adaptador.

El modelo se presenta como parte de un "estate" de SZL Holdings en el que cada ejecucion de entrenamiento, evaluacion y despliegue se registra en un ledger publico encadenado por hash. El entrenamiento se realizo sobre el dataset SZLHOLDINGS/abstention-doctrine-sft-v1 con QLoRA (r=16, alpha=32) durante 200 pasos en una NVIDIA RTX A6000 de 48 GB.

Su relevancia es acotada y experimental: propone una "Conjetura de la confabulacion" segun la cual el suelo de confabulacion solo se mueve con entrenamiento en honestidad con encuadre temporal a escalas pequenas, y que el mecanismo es fragil. El unico resultado declarado es una puntuacion de 3/6 en una bateria de honestidad de seis sondas fijas, por debajo del umbral de 4/6 que el autor denomina "the agent bar".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA QLoRA (r=16, alpha=32) |
| Parametros totales | no disponible (adaptador LoRA sobre Qwen3-1.7B; el base tiene 1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA en entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 entrenado con QLoRA sobre Qwen3-1.7B, un transformer decoder-only de 1.7 mil millones de parametros. El entrenamiento consta de 200 pasos sobre el dataset SZLHOLDINGS/abstention-doctrine-sft-v1, ejecutado en una NVIDIA RTX A6000 de 48 GB con driver 595.99.02. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion declarada no es arquitectonica sino metodologica: el autor sostiene la "Conjetura de la confabulacion", que postula que el suelo de confabulacion de un modelo solo puede desplazarse mediante entrenamiento en honestidad con encuadre temporal, y solo bajo una combinacion concreta de modelo base, tamano y dosis de entrenamiento. El propio autor califica el mecanismo de fragil y reconoce que el contraste curricular se apoya en un unico punto de datos. Todo el proceso se documenta en un ledger publico de mas de 255 recibos.

## Capacidades

- Generacion de texto y conversacion: pipeline declarado text-generation con tag conversational, heredado del base Qwen3-1.7B.
- Entrenamiento orientado a abtencion: el dataset de SFT se denomina abstention-doctrine, por lo que el adaptador busca modificar el comportamiento del modelo ante preguntas que deberia declinar responder.
- Medicion de honestidad: el modelo se evalua con una bateria de seis sondas fijas (honesty-battery), con resultado 3/6.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor menciona un umbral de agente (4/6) que el modelo no alcanza.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre abtencion: el adaptador permite estudiar como cambia la probabilidad de que un modelo decline responder tras un SFT especifico, comparando con el base Qwen3-1.7B sin adaptador.
- Evaluacion de honestidad reproducible: la bateria de seis sondas y el ledger de recibos permiten replicar la medicion y auditar cada ejecucion sobre una cadena de hashes publica.
- Experimentos de contraste curricular: sirve como un punto de datos para probar la conjetura de la confabulacion con otros modelos base, tamanos y dosis de entrenamiento.
- Docencia e investigacion en gobernanza de IA: el esquema de recibos encadenados y el SDK szl pueden usarse como ejemplo de trazabilidad de entrenamiento y despliegue.
- Estudio de adaptadores PEFT de bajo coste: con 200 pasos en una unica A6000, es un caso practico de QLoRA sobre un modelo de 1.7B para analizar el efecto de adaptadores de rango 16.
- Pruebas de regresion de comportamiento: util como referencia negativa (3/6) frente a la que medir futuras variantes del mismo linaje doctrinal.

## Benchmarks y rendimiento

| Benchmark | Resultado | Verificado | Notas |
|---|---|---|---|
| honesty-battery (6 sondas fijas) | 3/6 | No | Declarado por el autor en el model-index |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor situa el umbral de agente en 4/6 y presenta el modelo como un punto por debajo de ese umbral, con la sonda de honestidad temporal ("quant") como unico punto que rompe el suelo en el contraste curricular.

## Requisitos de hardware

- VRAM estimada: el adaptador es ligero; el coste real lo determina el base Qwen3-1.7B. En bfloat16, el base requiere del orden de 3.4 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU de entrenamiento documentada: NVIDIA RTX A6000 de 48 GB con driver 595.99.02.
- GPU consumer: el base de 1.7B en bfloat16 cabe en GPUs consumer con 8 GB o mas (RTX 3060 8 GB, RTX 4060, RTX 4070); en cuantizacion de 4 bits cabria en GPUs de 6 GB, aunque la cuantizacion no esta documentada por el autor.
- Despliegue: transformers + PEFT (flujo documentado en la model card con AutoModelForCausalLM y PeftModel). vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doctrine1-r1-v2-trained | Adaptador sobre Qwen3-1.7B | no disponible | Honestidad y abtencion (investigacion) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-1.7B (base) | 1.7B | no disponible en la informacion | Generacion de texto general | Apache 2.0 | Hugging Face |
| Adaptadores de alineacion/abtencion comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa mas alla del modelo base.

## Limitaciones y advertencias

- El autor declara explicitamente que la evaluacion se basa en 6 sondas fijas y no es exhaustiva.
- Es un adaptador LoRA, no un modelo independiente: sin el base Qwen3-1.7B no es utilizable.
- El contraste curricular se apoya en un unico punto de datos, segun reconoce el propio autor.
- El resultado de 3/6 no esta verificado y queda por debajo del umbral de agente (4/6) definido por el autor.
- Uso fuera de alcance declarado: despliegue en produccion sin verificacion de puerta, aplicaciones de seguridad critica y validacion biologica (no se reclama ninguna).
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el propio eje del modelo es la abtencion, lo que sugiere que el comportamiento por defecto del base puede no ser fiable.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja produccion sin verificacion adicional.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/doctrine1-r1-v2-trained
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/abstention-doctrine-sft-v1
- Recibos (frontier-54-runs): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Sitio del autor: https://a-11-oy.com
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
