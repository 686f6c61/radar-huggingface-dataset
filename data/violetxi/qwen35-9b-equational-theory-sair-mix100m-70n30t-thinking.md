# violetxi/qwen35-9b-equational-theory-sair-mix100m-70n30t-thinking

## Resumen

`violetxi/qwen35-9b-equational-theory-sair-mix100m-70n30t-thinking` es un ajuste fino supervisado completo (full SFT) del modelo base `Qwen/Qwen3.5-9B`, publicado por el usuario violetxi. El objetivo declarado es la internalizacion de teoria ecuacional: el modelo se entrena sobre notas matematicas y trayectorias de profesor condicionadas por esas notas, con el razonamiento del profesor incluido en la supervision. Se trata del checkpoint final de la epoca 2 de un experimento de reentrenamiento con razonamiento ("reasoning-inclusive") fechado el 1 de octubre de 2026.

El presupuesto nominal de entrenamiento es de aproximadamente 100 millones de tokens supervisados, repartidos en un 70 por ciento de notas matematicas (69.881.955 tokens, 118.229 ejemplos) y un 30 por ciento de trayectorias condicionadas por notas (30.000.110 tokens, 9.196 ejemplos), para un total de 99.882.065 tokens y 127.425 ejemplos. El modelo cuenta con 9.653.104.368 parametros y el repositorio ocupa 19,3 GB, coherente con pesos en BF16. La licencia es Apache 2.0.

Su relevancia es fundamentalmente de investigacion: se enmarca en una linea de trabajo sobre protocolos "R8" y bancos de datos sellados, y explora si el razonamiento de un profesor puede internalizarse en un modelo de ~9B mediante SFT puro, sin KL y sin RL. La model card advierte explicitamente de que los resultados de benchmarks se publican por separado y de que las evaluaciones de mezclas anteriores no describen este checkpoint, por lo que el rendimiento real de esta version no esta documentado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5; clase `Qwen3_5ForConditionalGeneration` (transformers). El repositorio declara la etiqueta `image-text-to-text`, no confirmada con mas detalle en la model card |
| Parametros totales | 9.653.104.368 (9,65 B), dato real de safetensors |
| Parametros activos | No aplica (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. Solo se publica la exportacion nativa en BF16; no se documentan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (exportacion nativa de serving en BF16; repo de 19,3 GB) |
| Modelo base | `Qwen/Qwen3.5-9B`, revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Modalidad declarada | text-generation (pipeline) con etiqueta adicional `image-text-to-text` |
| Fecha de creacion | 2026-10-03 |
| Etiquetas | equational-theory, sair, full-finetune, qwen3_5, 70-30-mixture, reasoning-inclusive |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen3.5-9B`, un transformer decoder de ~9,65B parametros del que no se detallan en la informacion disponible ni el numero de capas, ni las dimensiones ocultas, ni la ventana de contexto, ni el tokenizador. El ajuste se realizo mediante SFT completo (no LoRA ni adaptadores): el checkpoint de serving contiene 427 tensores de lenguaje procedentes del checkpoint entrenado, mientras que el resto de tensores conservan los valores del modelo base fijado. La exportacion paso una comprobacion exhaustiva de tensores y `conversion.json` registra el hash de cada artefacto.

El entrenamiento consistio en dos epocas con tasa de aprendizaje `5e-6`, schedule coseno, 0,03 de warmup y FSDP2 sobre ocho GPU. La funcion de perdida fue entropia cruzada media sobre tokens supervisados a nivel global, sin termino KL. El ultimo paso del optimizador fue 1634 y la perdida final de validacion compartida fue 0.222216. Los datos supervisados incluyen el razonamiento del profesor y las respuestas finales; las notas proceden de un banco "R8" sellado, excluyendo cabezas en cuarentena y ejemplos de validacion congelados, y las trayectorias se seleccionaron como prefijos de ejemplo completo, sin remuestreo ni truncado. Los modelos de 1M, 5M y 10M comparten un pool de trayectorias restauradas, mientras que los de 50M y 100M comparten un pool distinto compatible con R8; el anidamiento de trayectorias entre pools no se declara. La model card indica que el uso previsto para evaluacion matematica requiere habilitar el modo thinking de la plantilla de chat incluida.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado `text-generation` y soporte de plantilla de chat.
- Razonamiento matematico orientado a teoria ecuacional: notas matematicas y trayectorias de resolucion con razonamiento del profesor incluido en la supervision.
- Modo thinking: el autor recomienda habilitarlo en la plantilla de chat para evaluacion matematica, lo que implica generacion de cadenas de razonamiento antes de la respuesta final.
- Entrada multimodal (imagen y texto): la etiqueta `image-text-to-text` del repositorio apunta a esta capacidad, aunque la model card no la describe ni la ejemplifica.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; las trayectorias de entrenamiento son de resolucion, no de uso de herramientas.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales adicionales (audio, vision detallada, decodificacion especulativa): no disponibles.

## Casos de uso

- Investigacion en internalizacion de razonamiento: reproducir y comparar el efecto de mezclas 70/30 notas-trayectorias frente a los checkpoints de 1M, 5M, 10M y 50M del mismo linaje, usando la perdida de validacion compartida como metrica comparativa.
- Evaluacion de teoria ecuacional: someter al modelo a problemas de identidades y reescritura de terminos con el modo thinking activado, midiendo si el razonamiento destilado del profesor aparece sin necesidad de ejemplos condicionados en el prompt.
- Generacion de notas matematicas estructuradas: el modelo esta entrenado mayoritariamente (70 por ciento de los tokens) sobre notas, por lo que puede emplearse para producir resumenes y apuntes tecnicos en ese dominio.
- Destilacion de trayectorias: usar su salida como profesor auxiliar para generar nuevas cadenas de razonamiento sobre problemas ecuacionales, dado que fue entrenado con ese tipo de datos.
- Prototipado de asistentes matematicos en el navegador o en local: con 9,65B parametros en BF16 y licencia Apache 2.0, es viable desplegarlo en una GPU unica para experimentos internos.
- Analisis de procedencia y reproducibilidad: el repositorio incluye `training_config.json`, `data_provenance.json`, `training_metrics.json` y `conversion.json`, lo que permite auditar la correspondencia entre datos, hashes y pesos finales en un pipeline de investigacion.
- Evaluacion de sesgos de sobreajuste: al ser un ajuste estrecho sobre un unico dominio, sirve como caso de estudio de degradacion de capacidades generales tras SFT especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que los resultados de benchmarks se publican por separado y que las evaluaciones de mezclas anteriores no describen este checkpoint. El unico dato cuantitativo de rendimiento disponible es la perdida final de validacion compartida, 0.222216, que no es comparable con metricas estandar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: unos 19,3 GB solo para pesos (2 bytes por parametro sobre 9,65B), mas memoria para cache KV y activaciones; en la practica se recomienda partir de 24 GB. Calculo derivado del numero de parametros, no de una ficha oficial.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9,7 GB de pesos; en 4 bits, aproximadamente 4,8-5,5 GB. Estas cifras son estimaciones aritmeticas: el autor no publica cuantizaciones.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una A100 de 40/80 GB, H100 o L40S son opciones holgadas; en BF16 cabe en una RTX 4090 de 24 GB con margen limitado para contexto largo.
- Consumer GPU: si, en tarjetas de 24 GB (RTX 3090, 4090) si se usa BF16 con secuencias moderadas o cuantizacion; en GPUs de 12-16 GB solo con cuantizacion agresiva, no publicada por el autor.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` (`AutoTokenizer` y `Qwen3_5ForConditionalGeneration.from_pretrained` con `dtype="bfloat16"` y `device_map="auto"`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura Qwen3.5 con clase propia, el soporte en motores de terceros depende de que estos la implementen.
- Latencia y throughput estimados: no disponibles.
- Entrenamiento: el ajuste se hizo con FSDP2 sobre ocho GPU, dato util como referencia de coste de reentrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-9b-equational-theory-sair-mix100m-70n30t-thinking | 9,65 B | no disponible | Sin benchmarks publicados (perdida de validacion 0.222216) | Apache 2.0 | HuggingFace, safetensors BF16 |
| Qwen/Qwen3.5-9B (modelo base) | 9 B nominales | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otros ajustes especializados en matematicas del mismo rango (~8-9B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre alternativas comparables dentro de la informacion proporcionada, por lo que no se establece una comparacion cuantitativa.

## Limitaciones y advertencias

- Dominio muy estrecho: el entrenamiento se limita a teoria ecuacional y notas matematicas; es esperable una degradacion de capacidades generales, conversacionales y de conocimiento del mundo tras el SFT completo, aunque no se documenta su magnitud.
- Riesgo de alucinacion: la model card no reporta tasas de error ni evaluaciones de fidelidad; en dominios formales, una respuesta fluida puede contener pasos de razonamiento invalidos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, GSM8K, HumanEval ni similares para este checkpoint concreto. Las evaluaciones de mezclas anteriores no son aplicables.
- Idiomas: no se declara ningun idioma soportado; se desconoce el comportamiento fuera del ingles o del idioma de las notas de entrenamiento.
- Contexto: se desconoce la ventana de contexto efectiva, lo que impide planificar despliegues con documentos largos.
- Modo thinking obligatorio para evaluacion matematica segun el autor; usarlo en modo directo puede degradar la calidad de las respuestas.
- Licencia Apache 2.0: permisiva para uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones, que no se detallan en la informacion disponible.
- Procedencia de datos: parte del entrenamiento proviene de un banco "R8" sellado y de trayectorias de profesor no publicas; la reproducibilidad externa completa no esta garantizada aunque se publiquen los hashes.
- Advertencia de la model card: los resultados de benchmarks se publican por separado; no debe asumirse el rendimiento de checkpoints anteriores.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-mix100m-70n30t-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-notes
- Dataset de trayectorias condicionadas por notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-note-conditioned-rollouts
- Run de entrenamiento en W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqthink100m20261001
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos fueron foros sin relacion con el tema.
