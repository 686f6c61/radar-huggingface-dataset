# TechnoBaptist/LFM2.5-24B-A2B

## Resumen

LFM2.5-24B-A2B es un modelo de razonamiento de 24.000 millones de parametros totales con solo 2.450 millones de parametros activos por token, disenado por Liquid AI para agentes que se ejecutan en local ("on-device"). Se trata del modelo mas grande y el ultimo de la familia LFM2.5, que abarca desde LFM2.5-230M hasta esta variante. La ficha que nos ocupa corresponde a una resubida de la comunidad (TechnoBaptist) del checkpoint oficial, con el modelo base LiquidAI/LFM2.5-24B-A2B-Base como origen.

Su propuesta tecnica combina una arquitectura MoE con un esqueleto hibrido poco convencional: 40 capas en total, de las cuales 30 son bloques de convolucion corta con doble compuerta y solo 10 son capas de atencion con GQA. Cada bloque MoE cuenta con 64 expertos y enrutamiento top-4. Con 36 billones de tokens de entrenamiento y una ventana de contexto de 131.072 tokens, el modelo esta orientado de forma explicita a cargas de trabajo agenticas: razonamiento siempre activo antes de responder (etiqueta `<think>`), llamada a herramientas y ejecucion fiable en dispositivos de gama alta.

Es relevante ahora porque compite, segun el autor, con modelos MoE de mayor tamano (Qwen3.6-35B-A3B, con aproximadamente un 50 % mas de parametros totales y activos) en tareas de uso de herramientas, y porque su bajo numero de parametros activos abarata cada token de razonamiento, lo que permite latencias y velocidades de generacion propias de modelos mucho mas pequenos. El repositorio resubido no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 30 bloques de convolucion corta con doble compuerta + 10 capas de atencion GQA |
| Parametros totales | 23.971.585.280 (24,0 B) |
| Parametros activos | 2,45 B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible en este repositorio (solo safetensors). El modelo original publica FP8, GGUF, ONNX y MLX-4bit |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco (16 idiomas) |
| Licencia | lfm1.0 (identificador `other` en HuggingFace) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 48,0 GB |
| Vocabulario | 128.000 tokens |
| Presupuesto de entrenamiento | 36 billones de tokens |
| Parametros de generacion recomendados | temperature 0.1, top_k 50, repetition_penalty 1.05 |
| Modelo base | LiquidAI/LFM2.5-24B-A2B-Base |

## Arquitectura y entrenamiento

El modelo no es un transformer denso ni un MoE convencional. Su columna vertebral alterna dos tipos de bloque: 30 bloques de convolucion corta con doble compuerta (double-gated short convolution) y 10 capas de atencion con consultas agrupadas (GQA). Esta mezcla busca reducir el coste de la atencion cuadratica manteniendo la capacidad de modelar dependencias de largo alcance en las capas que si atienden. Sobre esa base se insertan bloques MoE con 64 expertos cada uno y enrutamiento top-4, lo que explica que, pese a tener 24.000 millones de parametros, solo se activen 2.450 millones por token.

El entrenamiento se realizo sobre 36 billones de tokens con un vocabulario de 128.000 entradas. El modelo publicado en este repositorio es la variante post-entrenada para cargas agenticas, no la base: se trata de un modelo de razonamiento puro que siempre genera un bloque `<think>` antes de la respuesta, tal y como refleja la plantilla de chat, de estilo ChatML (`<|startoftext|>`, `<|im_start|>`, `<|im_end|>`). La informacion disponible no detalla la composicion del dataset, ni si se emplearon tecnicas concretas de RLHF o DPO, ni el desglose de las etapas de post-entrenamiento. Si se menciona un modelo borrador especifico (DSpark) para decodificacion especulativa con SGLang, anunciado como proximo lanzamiento, orientado a acelerar la generacion.

## Capacidades

- Generacion de texto y razonamiento explicito: el modelo piensa siempre antes de responder, insertando la etiqueta `<think>` de forma automatica desde la plantilla de chat.
- Uso de herramientas (tool calling / function calling): es una de sus fortalezas declaradas, con resultados competitivos en tareas agenticas frente a MoEs de mayor tamano.
- Ejecucion agentica multi-paso: disenado para agentes que razonan, invocan herramientas y se ejecutan de forma fiable en dispositivo.
- Multilinguismo: 16 idiomas declarados, con presencia de lenguas europeas, asiaticas y arabe.
- Contexto largo: hasta 131.072 tokens, adecuado para conversaciones multi-turno extensas o documentos largos.
- Inferencia eficiente: 2,45 B de parametros activos por token, lo que reduce el coste computacional de cada token de razonamiento.
- No es multimodal: la informacion disponible lo describe como un modelo de texto unicamente (text-only), sin vision ni audio.

## Casos de uso

- Agentes locales en dispositivo: el modelo esta pensado para ejecutarse en hardware de gama alta (estaciones de trabajo, Mac con memoria unificada amplia) y realizar tareas de automatizacion con llamada a herramientas sin enviar datos a la nube.
- Asistentes con busqueda web y RAG: el propio autor recomienda emparejarlo con recuperacion o busqueda web, ya que no es un modelo orientado a conocimiento enciclopedico por si solo, pero destaca en invocar la herramienta de busqueda y sintetizar el resultado.
- Atencion al cliente automatizada multi-turno: su ventana de 131.072 tokens permite mantener historiales de conversacion muy largos sin truncar, y su modo de razonamiento ayuda a resolver solicitudes con varios pasos.
- Automatizacion de flujos con function calling: integrable como motor de decision en pipelines que consultan APIs internas, bases de datos o sistemas de ticketing mediante herramientas declaradas.
- Generacion y revision de codigo asistida: puede razonar sobre fragmentos de codigo y llamar a herramientas de ejecucion o linting dentro de un agente de desarrollo.
- Procesamiento de documentos largos multilingues: resumen, extraccion y clasificacion de contratos, informes o expedientes en los 16 idiomas soportados, aprovechando el contexto extendido.
- Despliegue en el borde con cuantizacion: mediante los formatos GGUF, ONNX o MLX-4bit del modelo original, puede ejecutarse en CPU, movil o Apple Silicon con huella de memoria reducida.
- Prototipado de agentes con razonamiento barato: al activar solo 2,45 B de parametros por token, resulta adecuado para iterar sobre bucles de razonamiento largos sin disparar el coste por token.

## Benchmarks y rendimiento

Los unicos datos de benchmark publicados en la informacion disponible son los siguientes:

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw (agentes y uso de herramientas) | 48,09 | 38,19 |

Datos de velocidad declarados por el autor:

| Metrica | Valor |
|---|---|
| Velocidad en Apple M5 Max | 184 tok/s |
| Velocidad maxima de salida en una NVIDIA B300 | hasta 21.000 tok/s |
| Mejora frente a MoEs comparables en dispositivo | hasta 1,7x mas rapido |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. No se deben extrapolar los datos de LiveClaw a otras capacidades.

## Requisitos de hardware

- Peso de los parametros: 23,97 B de parametros. En BF16 ocupan aproximadamente 48 GB; en FP8, unos 24 GB; en cuantizacion de 4 bits (GGUF Q4_K_M o MLX-4bit), en torno a 13-15 GB.
- VRAM estimada para inferencia en BF16: a partir de 48 GB solo para pesos, mas la cache KV, lo que en la practica exige una A100 80 GB, una H100 80 GB, una B300 o varias GPU de 24 GB en paralelo.
- VRAM estimada en FP8: alrededor de 24 GB de pesos mas cache, encajando en una L40S (48 GB), una A100 40 GB o una RTX 6000 Ada (48 GB) con margen.
- VRAM estimada en 4 bits: aproximadamente 13-15 GB de pesos mas cache, lo que permite ejecucion en una RTX 4090 (24 GB) o una RTX 4080 (16 GB) con contexto moderado. En Apple Silicon, el formato MLX-4bit esta pensado para Mac con memoria unificada de 32 GB o superior.
- GPU recomendadas: B300, H100 y A100 para servicio de alta concurrencia; L40S o RTX 6000 Ada para FP8; RTX 4090 y RTX 4080 para cuantizacion de 4 bits; Apple M5 Max para inferencia local segun los datos del autor.
- Opciones de despliegue: Transformers, vLLM y SGLang para el checkpoint nativo; FP8 para alto rendimiento en GPU con vLLM y SGLang; llama.cpp y herramientas compatibles con GGUF para CPU; ONNX Runtime para despliegue multiplataforma; MLX para Apple Silicon. La decodificacion especulativa con el borrador DSpark esta anunciada para SGLang.
- Latencia y throughput: el autor declara 184 tok/s en Apple M5 Max y hasta 21.000 tokens de salida por segundo en una unica NVIDIA B300. No se dispone de cifras de latencia por peticion ni de throughput con lotes grandes en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | LiveClaw | Licencia |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B | 24,0 B | 2,45 B | 131.072 | 48,09 | lfm1.0 |
| Qwen3.6-35B-A3B | ~35 B | ~3 B | no disponible | 38,19 | no disponible en esta ficha |
| LFM2-24B-A2B (generacion anterior) | 24,0 B | 2,45 B | no disponible | no disponible | lfm1.0 |

Respecto a LFM2-24B-A2B, la diferencia declarada es que LFM2.5 es un modelo de razonamiento puro que siempre piensa antes de responder, mientras que la version anterior no lo hacia. Frente a Qwen3.6-35B-A3B, Liquid AI destaca que LFM2.5 obtiene mejores resultados en tareas agenticas con aproximadamente la mitad de parametros totales y activos. No hay datos publicados en la informacion disponible para comparar en benchmarks de conocimiento general, codigo o matematicas.

## Limitaciones y advertencias

- No orientado a conocimiento enciclopedico: el propio autor recomienda no usarlo en solitario para tareas intensivas en conocimiento y combinarlo con recuperacion o busqueda web.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual en la informacion disponible, y su orientacion agentica no elimina este riesgo.
- Modelo de solo texto: no procesa imagenes ni audio.
- Idiomas: aunque se declaran 16 idiomas, la informacion disponible no aporta evaluaciones por idioma, por lo que el rendimiento relativo fuera del ingles es desconocido.
- Cobertura de benchmarks limitada: solo se publica un resultado en LiveClaw, sin MMLU, HumanEval, GSM8K ni evaluaciones de seguridad.
- Licencia lfm1.0: es una licencia propia (identificador `other` en HuggingFace), no una licencia de codigo abierto estandar. Es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Repositorio resubido por terceros: el checkpoint de TechnoBaptist tiene 0 descargas y 0 interacciones, y no incluye informacion sobre validacion del contenido. Para produccion conviene verificar la integridad frente al repositorio oficial de LiquidAI.
- Arquitectura no estandar: el uso de convoluciones cortas y de la variante `lfm2_moe` exige versiones recientes de Transformers y de los motores de inferencia; no todos los runtimes soportan esta arquitectura.
- Modo de razonamiento obligatorio: el modelo siempre genera un bloque `<think>`, lo que incrementa el numero de tokens de salida y, por tanto, la latencia y el coste frente a un modelo que responde directamente.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/TechnoBaptist/LFM2.5-24B-A2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Checkpoint FP8: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Checkpoint GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Checkpoint ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Checkpoint MLX-4bit: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo de la gama inferior: https://huggingface.co/LiquidAI/LFM2.5-230M
- Entrada de blog: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion de la plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Playground: https://playground.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Paper de referencia: https://arxiv.org/abs/2511.23404
- Busqueda web: no se han encontrado resultados relevantes sobre el modelo en la busqueda realizada; los unicos resultados devueltos corresponden a sitios de contenido para adultos sin relacion con el modelo.
