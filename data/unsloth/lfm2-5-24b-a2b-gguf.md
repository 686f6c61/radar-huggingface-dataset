# unsloth/LFM2.5-24B-A2B-GGUF

## Resumen

LFM2.5-24B-A2B es un modelo de razonamiento de tipo Mixture-of-Experts (MoE) desarrollado por Liquid AI, con 24.000 millones de parametros totales y solo 2.450 millones de parametros activos por token. Esta concebido como el modelo mas grande y el ultimo de la familia LFM2.5, que abarca desde LFM2.5-230M hasta esta variante, y esta orientado a agentes que razonan, invocan herramientas y se ejecutan de forma local y privada en el dispositivo. La ficha que nos ocupa, `unsloth/LFM2.5-24B-A2B-GGUF`, es una conversion a formato GGUF realizada por Unsloth con su esquema de cuantizacion Dynamic 3.0, pensada para inferencia en CPU y despliegue local mediante llama.cpp y herramientas compatibles.

El modelo combina una arquitectura hibrida poco convencional: 40 capas en total, de las cuales 30 son bloques de convolucion corta de doble compuerta y 10 son capas de atencion de consultas agrupadas (GQA). Sobre esa columna vertebral se insertan bloques MoE con 64 expertos y enrutamiento top-4. El presupuesto de entrenamiento declarado es de 36 billones de tokens, con un vocabulario de 128.000 entradas y una longitud de contexto de 131.072 tokens. Soporta 16 idiomas, entre ellos el castellano.

Su relevancia actual radica en la relacion entre calidad agentica y coste de inferencia: con solo 2.450 millones de parametros activos, Liquid AI afirma que compite con Qwen3.6-35B-A3B (un modelo con aproximadamente un 50 % mas de parametros totales y activos) en tareas de agente y uso de herramientas, con una puntuacion de 48,09 en LiveClaw frente a 38,19. Ademas, declara velocidades de hasta 184 tok/s en un Apple M5 Max y hasta 21.000 tok/s de salida en una unica GPU NVIDIA B300.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 30 bloques de convolucion corta de doble compuerta + 10 capas GQA, con bloques MoE (64 expertos, enrutamiento top-4) |
| Parametros totales | 24,0 B (23.971.587.712 reales) |
| Parametros activos | 2,45 B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF (esquema Unsloth Dynamic 3.0); el modelo base tambien se publica en FP8, ONNX y MLX-4bit |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano, vietnamita, tailandes, indonesio, hindi, ruso y polaco |
| Licencia | lfm1.0 (licencia propia de Liquid AI, etiquetada como "other") |
| Formato de pesos | GGUF (repo de 203,1 GB); el modelo original en safetensors |
| Numero de capas | 40 |
| Vocabulario | 128.000 tokens |
| Presupuesto de entrenamiento | 36 billones de tokens |
| Parametros de generacion | temperature 0.1, top_k 50, repetition_penalty 1.05 |

## Arquitectura y entrenamiento

LFM2.5-24B-A2B no es un transformer convencional. Su columna vertebral combina dos tipos de bloque: 30 bloques de convolucion corta de doble compuerta (double-gated short convolution) y 10 capas de atencion de consultas agrupadas (GQA). Sobre esta base se aplica un esquema Mixture-of-Experts con 64 expertos por bloque y enrutamiento top-4, de modo que cada token activa una fraccion pequena de la red. El resultado son 24.000 millones de parametros almacenados pero solo 2.450 millones activos por token, lo que reduce el coste computacional de cada token generado sin recortar la capacidad total del modelo.

El modelo se entreno con un presupuesto de 36 billones de tokens y dispone de un vocabulario de 128.000 entradas, con una ventana de contexto de 131.072 tokens. La variante aqui descrita es un ajuste posterior (post-training) orientado especificamente a cargas de trabajo agenticas, segun indica la model card. El modelo declara un modo de razonamiento: "siempre piensa antes de responder", lo que implica que genera tokens de razonamiento internos antes de la respuesta final. Para acelerar la generacion, Liquid AI anuncia un modelo borrador (draft) llamado LFM2.5-24B-A2B-DSpark para decodificacion especulativa con SGLang, marcado como "proximamente". No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento ni si se emplearon tecnicas concretas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: modelo de razonamiento explicito con modo "thinking" que produce tokens intermedios antes de la respuesta.
- Uso de herramientas (tool calling / function calling): orientado a agentes que invocan funciones y APIs.
- Razonamiento multi-paso y flujos agenticos: disenado para tareas de agente con multiples pasos.
- Capacidades multilingues en 16 idiomas, incluyendo espanol, ingles, arabe, chino, frances, aleman, japones, coreano, portugues, italiano, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Contexto largo de hasta 131.072 tokens, apto para conversaciones extensas y documentos grandes.
- Modelo exclusivamente de texto: no se declaran capacidades de vision ni de audio.
- Decodificacion especulativa prevista mediante el modelo borrador DSpark (anunciado, no disponible en el momento de redactar esta ficha).

## Casos de uso

- Agentes autonomos en el dispositivo: con 2,45 B de parametros activos y velocidades declaradas de 184 tok/s en Apple M5 Max, el modelo puede ejecutar bucles de razonamiento y llamadas a herramientas de forma local, sin enviar datos a la nube, lo que resulta adecuado para asistentes personales con requisitos de privacidad.
- Atencion al cliente automatizada: la ventana de 131.072 tokens permite mantener conversaciones multi-turno muy largas y trabajar sobre historiales o documentacion extensa sin truncar el contexto.
- Automatizacion de tareas con tool calling: integracion en pipelines donde el modelo decide que funcion invocar, extrae parametros y encadena llamadas, por ejemplo en orquestacion de sistemas internos o flujos RPA.
- Generacion y asistencia de codigo: aunque no se detallan benchmarks de codigo, un modelo de razonamiento con tool calling encaja en asistentes de programacion que consultan repositorios, ejecutan pruebas y proponen parches dentro de entornos de desarrollo.
- Procesamiento de documentos largos multilingues: resumen, extraccion y clasificacion de informes, contratos o expedientes en cualquiera de los 16 idiomas soportados.
- Despliegue en hardware de consumo y edge: gracias al formato GGUF y a las cuantizaciones Dynamic 3.0, puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada de gama alta mediante llama.cpp.
- Investigacion y experimentacion local: la publicacion del modelo base y de las variantes FP8, ONNX, MLX y GGUF facilita estudiar comportamiento agentico, MoE y razonamiento en distintos backends sin depender de infraestructura cloud.

## Benchmarks y rendimiento

La informacion disponible recoge un unico resultado comparativo publicado por el autor:

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw | 48,09 | 38,19 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales. Tampoco se detallan las condiciones exactas de evaluacion de LiveClaw mas alla de la comparacion con Qwen3.6-35B-A3B.

Datos de rendimiento declarados por el autor (no son benchmarks de calidad, sino de velocidad):

| Metrica | Valor |
|---|---|
| Velocidad de generacion en Apple M5 Max | hasta 184 tok/s |
| Tokens de salida por segundo en una NVIDIA B300 | hasta 21.000 tok/s |
| Ganancia frente a MoE comparables en dispositivo | hasta 1,7x mas rapido |

## Requisitos de hardware

- VRAM segun cuantizacion: al tratarse de un MoE de 24 B totales, el peso completo debe residir en memoria. Con cuantizacion de 4 bits el peso ronda los 12-14 GB; en 8 bits, alrededor de 24-26 GB; en FP16/FP8, en torno a 24-26 GB y 48 GB respectivamente. Estas cifras son estimaciones basadas en el tamano de parametros; no estan confirmadas en la informacion disponible.
- GPU recomendadas: NVIDIA B300 para maxima velocidad de salida (declarada hasta 21.000 tok/s); A100, H100 o GPUs de 24-48 GB para servicio de alta concurrencia en FP8 o FP16.
- GPU de consumo: con cuantizacion GGUF de 4 bits es plausible su ejecucion en tarjetas con 16-24 GB de VRAM (RTX 4090, RTX 4080, RTX 3090), aunque el dato no esta confirmado oficialmente.
- Apple Silicon: el modelo declara 184 tok/s en un Apple M5 Max; existe una variante oficial MLX-4bit especifica para Mac.
- CPU: el formato GGUF esta pensado para inferencia en CPU mediante llama.cpp, si bien el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (por ejemplo Ollama o LM Studio) para el repo aqui descrito; vLLM y SGLang para el checkpoint original y la variante FP8; ONNX Runtime para despliegue multiplataforma; MLX para Apple Silicon.
- Latencia y throughput: en Apple M5 Max se declaran hasta 184 tok/s; en una unica NVIDIA B300, hasta 21.000 tok/s de salida. No se facilitan datos de latencia por peticion ni de throughput en GPU de gama de consumo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Benchmark (LiveClaw) | Licencia | Formatos |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B | 24,0 B / 2,45 B | 131.072 | 48,09 | lfm1.0 | safetensors, GGUF, FP8, ONNX, MLX-4bit |
| Qwen3.6-35B-A3B | 35 B / 3 B (referencia del autor, ~50 % mas activos) | no disponible | 38,19 | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria (por ejemplo, otras variantes MoE de 20-30 B) ni de sus especificaciones de licencia, contexto o rendimiento, por lo que la comparativa se limita al contraste ya publicado por el autor frente a Qwen3.6-35B-A3B.

## Limitaciones y advertencias

- La licencia es lfm1.0 (etiquetada como "other" en Hugging Face), una licencia propia de Liquid AI; es necesario revisar sus terminos antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el modo de razonamiento explicito no garantiza correccion factica.
- El modelo es exclusivamente de texto: no soporta entrada de imagenes, audio ni video.
- Aunque soporta 16 idiomas, no se proporcionan datos de calidad por idioma; el rendimiento en lenguas distintas del ingles puede variar y no esta cuantificado.
- Los resultados de benchmarks publicados se limitan a LiveClaw y a una comparacion concreta; no hay evidencia publicada sobre matematicas, codigo o conocimiento general que permita validar el rendimiento en esas areas.
- Las cifras de velocidad (184 tok/s en M5 Max, 21.000 tok/s en B300) provienen del autor y no estan verificadas de forma independiente; dependen del backend, la cuantizacion y las condiciones de carga.
- Este repositorio concreto es una cuantizacion GGUF de Unsloth, no el checkpoint oficial de Liquid AI; la cuantizacion puede introducir perdida de precision respecto al modelo original.
- El modelo borrador DSpark para decodificacion especulativa esta anunciado como "proximamente" y no estaba disponible en el momento de redactar esta ficha.
- El presupuesto de entrenamiento y la composicion del dataset no se detallan mas alla de los 36 billones de tokens, por lo que no es posible evaluar sesgos de datos de forma informada.

## Enlaces

- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/LFM2.5-24B-A2B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo base preentrenado: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Variante FP8: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Variante GGUF oficial: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Variante MLX-4bit: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo pequeno de la familia: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog de Liquid AI sobre el modelo: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Articulo de referencia (arXiv): arxiv:2511.23404
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Documentacion de Unsloth: https://unsloth.ai/docs/
- Documentacion de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Aplicacion de escritorio de Unsloth: https://unsloth.ai/docs/desktop
- Discord de Unsloth: https://discord.gg/unsloth
