# whcl412/LycheeAI-coder-2b-II-pro-MLX-bf16

## Resumen

LycheeAI-coder-2b-II-pro-MLX-bf16 es un modelo de lenguaje especializado en programacion y en llamada a herramientas (tool calling), desarrollado por el usuario independiente whcl412 a partir del modelo base openbmb/MiniCPM5-2B de la empresa china OpenBMB. Sobre ese base de 2.516.756.480 parametros (~2,52 mil millones) se aplico un ajuste fino con LoRA (rank 8, 16 capas) que despues se fusiono en los pesos del modelo original, dando lugar a un checkpoint denso de proposito general orientado a codigo y agentes.

La particularidad de este repositorio concreto es que contiene los pesos en bfloat16 sin ninguna cuantizacion (5.033.556.906 bytes en `model.safetensors`). Esto lo convierte en la version de referencia para tres escenarios: servir como linea base de calidad sin error de cuantizacion, seguir entrenando (continuar el LoRA o aplicar uno nuevo, algo imposible sobre pesos ya cuantizados a 4 bits) y generar cuantizaciones propias en q4, q8 o formatos derivados.

El modelo esta pensado para ejecucion local en Apple Silicon mediante MLX, aunque al ser safetensors estandar tambien se carga directamente con transformers en GPU CUDA. Los idiomas declarados son chino (zh) e ingles (en); no se declara soporte de castellano. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; los tags de HuggingFace declaran la arquitectura `llama`. Detalles de capas, atencion y preentrenamiento no disponibles |
| Parametros totales | 2.516.756.480 (~2,52 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Este repositorio: bf16 sin cuantizar (`config.json` sin campo `quantization`). La familia del autor incluye una variante MLX 4bit (1,42 GB) y un repositorio GGUF. Al ser safetensors estandar admite cuantizacion propia (q4/q8/custom) |
| Idiomas soportados | Zh (chino) e en (ingles) declarados. Castellano no declarado |
| Licencia | Apache 2.0 (uso comercial permitido) |
| Formato de pesos | safetensors (bf16), con `model.safetensors.index.json`, `config.json`, `chat_template.jinja`, tokenizer y `generation_config.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base MiniCPM5-2B de OpenBMB, un transformer causal decoder-only de aproximadamente 2,52 mil millones de parametros. Sobre esa base se entreno un adaptador LoRA de rango 8 aplicado a 16 capas, que posteriormente se fusiono en los pesos del modelo, de modo que el repositorio distribuido no contiene adaptadores separados sino un checkpoint unico en bfloat16. El ajuste se realizo sobre un conjunto de 980 muestras seleccionadas durante 1 epoca, lo que equivale a 490 pasos de entrenamiento.

No se dispone de informacion sobre el numero de tokens del preentrenamiento original, la composicion del dataset de ajuste, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion, mas alla de que el modelo responde a un system prompt que define su identidad y su estilo ("conciso, directo, no adulador"). La validacion interna del autor reporta una tasa de aceptacion de 26 de 27 comprobaciones en esta version, frente a 25 de 27 en la anterior. Es un dato de control propio, no un benchmark publico comparable.

Una innovacion relevante a nivel de uso, mas que de arquitectura, es el soporte de una plantilla de chat con conmutador de razonamiento (`enable_thinking`), que permite separar el contenido de pensamiento de la respuesta final. El autor advierte de que la plantilla debe aplicarse siempre de forma explicita: sin ella, la generacion degenera en bucles de repeticion.

## Capacidades

- Generacion de codigo en lenguajes habituales (el ejemplo de la model card es una busqueda binaria en Python con comentarios).
- Razonamiento tecnico breve y explicaciones concisas, con un estilo entrenado para no ser adulador ni excesivamente prolijo.
- Llamada a herramientas y funciones: el modelo emite JSON crudo, por ejemplo `{"name": "calculate", "arguments": {"expression": "789*123"}}`.
- Soporte de agentes multi-paso mediante un bucle hospedado en la aplicacion (la model card enlaza el codigo de integracion del repositorio principal).
- Modo de pensamiento opcional a traves del parametro `enable_thinking`, que separa el bloque de razonamiento de la respuesta.
- Bilinguismo declarado chino-ingles.
- Compatibilidad dual MLX y transformers con el mismo conjunto de pesos.
- No se declaran capacidades de vision, audio ni generacion de imagenes.

## Casos de uso

- Asistente de codigo local en portatiles Apple Silicon: con 2,52 mil millones de parametros en bf16 ocupa unos 5,5 GB de memoria pico, por lo que cabe en un MacBook de 16 GB de memoria unificada y funciona sin conexion ni coste de API.
- Motor de tool calling en agentes: el modelo devuelve JSON estructurado en lugar de texto libre, lo que simplifica el parseo en el hospedador; el propio autor advierte de que hay que validar el nombre de la herramienta contra el registro antes de ejecutarla.
- Punto de partida para ajuste fino adicional: al estar en bf16 sin cuantizar, admite continuar el entrenamiento con nuevos adaptadores LoRA o un ajuste completo, algo que la version 4bit no permite.
- Generacion de cuantizaciones a medida: a partir de estos pesos se pueden producir variantes q4, q8 o mezclas por capa y medir la degradacion respecto a la referencia sin cuantizar.
- Conversion a GGUF para despliegue en CPU: el repositorio sirve como origen para `llama.cpp` u Ollama, o puede sustituirse directamente por el repositorio GGUF ya publicado por el autor.
- Tareas de documentacion tecnica bilingue chino-ingles: resumenes, traduccion de comentarios de codigo y generacion de documentacion en ambos idiomas.
- Evaluacion comparativa de calidad: al ser la version sin perdida, sirve como linea base para medir cuanto degrada cada esquema de cuantizacion en un mismo prompt set.
- Automatizacion ligera en pipelines de integracion continua: por su tamano, puede ejecutarse en un runner con GPU modesta para generar descripciones de cambios o sugerencias de parches.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos publicados son la validacion interna del autor y las mediciones de carga en un MacBook Pro M4 con 16 GB:

| Metrica | MLX 4bit | Este repositorio (bf16) |
|---|---|---|
| Tamano en disco | 1,42 GB | 5,03 GB |
| Memoria pico en carga | 1,52 GB | ~5,5 GB |
| Arranque en frio | 3,4 s | ~10 s |
| Aceptacion interna del autor | no disponible | 26 / 27 (version previa: 25 / 27) |

La diferencia de rendimiento entre ambas variantes se atribuye unicamente al error de cuantizacion; no se publican cifras de latencia por token ni de throughput.

## Requisitos de hardware

- VRAM estimada en bf16: entre 5,5 y 7 GB contando pesos (5,03 GB), cache KV y overhead del runtime. La memoria pico medida por el autor es de ~5,5 GB.
- VRAM estimada en cuantizacion 4bit: en torno a 1,5-2 GB de pesos.
- GPU compatibles: cualquier GPU con 8 GB o mas para bf16. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB y superiores; en A100, H100 o L40S sobra capacidad y quedan limitadas por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas en bf16, y en tarjetas de 4-6 GB si se usa la variante 4bit o GGUF.
- Apple Silicon: ruta principal de despliegue. Verificado por el autor en un MacBook Pro M4 con 16 GB de memoria unificada.
- Opciones de despliegue: MLX (`mlx-lm`, carga directa desde el repositorio), transformers con `torch_dtype="bfloat16"` y `trust_remote_code=True`, y `llama.cpp`/Ollama a traves del repositorio GGUF del mismo autor. El soporte de vLLM o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. Lo unico publicado es el tiempo de arranque en frio (~10 s en bf16 frente a 3,4 s en 4bit sobre M4/16 GB).

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento. La tabla siguiente compara solo caracteristicas verificables; los campos sin dato confirmado se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| LycheeAI-coder-2b-II-pro-MLX-bf16 | 2,52 B | no disponible | Apache 2.0 | Codigo + tool calling, ajuste LoRA sobre MiniCPM5-2B | HuggingFace, ModelScope, GGUF |
| openbmb/MiniCPM5-2B (base) | ~2,5 B (no confirmado en la informacion disponible) | no disponible | Apache 2.0 | Modelo base generalista | HuggingFace |
| MiniCPM5-2B ajustado con LoRA propio | 2,52 B | no disponible | Apache 2.0 | Depende del ajuste del usuario | Requiere entrenamiento propio |
| Qwen2.5-Coder en rango 1,5-3 B | no disponible | no disponible | no disponible | Codigo | no disponible en la informacion proporcionada |

La comparacion con alternativas comerciales o abiertas de la misma franja de tamano no puede completarse con rigor porque no hay cifras publicadas de este modelo. El dato diferencial objetivo es el formato: pesos bf16 sin cuantizar, entrenables y convertibles, frente a variantes ya cuantizadas que no admiten ajuste posterior.

## Limitaciones y advertencias

- Aritmetica sin herramientas: el autor advierte de que el modelo calcula mal si no dispone de una herramienta; recomienda instruir en el system prompt que use siempre la funcion `calculate`.
- Identidad inestable: con un system prompt generico puede responder incorrectamente sobre quien es. Hay que declarar la identidad de forma explicita.
- Caracteres de control: se han observado emisiones ocasionales de `\x08`; conviene filtrar la salida antes de mostrarla o procesarla.
- Alucinacion de nombres de herramienta: el modelo puede inventar funciones que no existen; el hospedador debe validar todo nombre contra su registro antes de ejecutarlo.
- Plantilla de chat obligatoria: sin `apply_chat_template` la generacion entra en bucles de repeticion. Ademas, `enable_thinking` debe pasarse de forma explicita porque la plantilla no tiene valor por defecto.
- Idiomas: solo chino e ingles declarados; el castellano no esta soportado oficialmente y su rendimiento en este idioma es desconocido.
- Longitud de contexto no publicada: no se puede garantizar el comportamiento en conversaciones largas ni en repositorios extensos.
- Base de entrenamiento muy reducida: 980 muestras y 1 epoca (490 pasos) con LoRA de rango 8 sobre 16 capas. Es un ajuste ligero, por lo que la especializacion es estrecha y el riesgo de sobreajuste al formato de entrenamiento es alto.
- Datos de evaluacion limitados: la unica validacion publicada es un conjunto interno de 27 comprobaciones del propio autor, sin metodologia detallada ni comparacion independiente.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre manteniendo el aviso de licencia y el fichero de cambios. Conviene verificar tambien las condiciones del modelo base openbmb/MiniCPM5-2B, tambien Apache 2.0 segun la model card.
- Proyecto personal: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin garantias de mantenimiento ni soporte.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/whcl412/LycheeAI-coder-2b-II-pro-MLX-bf16
- Repositorio principal (version MLX 4bit, con documentacion completa, capacidades y limitaciones): https://huggingface.co/whcl412/LycheeAI-coder-2b-II-pro
- Repositorio GGUF: https://huggingface.co/whcl412/LycheeAI-coder-2b-II-pro-GGUF
- Modelo base MiniCPM5-2B (OpenBMB): https://huggingface.co/openbmb/MiniCPM5-2B
- Espejo en ModelScope: https://modelscope.cn/models/whcl412/LycheeAI-coder-2b-II-pro-MLX-bf16
- Canal del autor en Bilibili: https://space.bilibili.com/3493128967293256
- La busqueda web realizada para esta ficha no devolvio resultados relevantes sobre el modelo: los enlaces obtenidos correspondian a sitios de juegos de cartas (patiencespel.nl) y se han descartado por no guardar relacion con el contenido. No se han localizado papers, blogs tecnicos ni demos adicionales.
