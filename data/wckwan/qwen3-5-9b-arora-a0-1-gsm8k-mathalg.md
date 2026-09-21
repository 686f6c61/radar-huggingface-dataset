# wckwan/Qwen3.5-9B-ARORA-a0.1-gsm8k-mathalg

## Resumen

Qwen3.5-9B-ARORA-a0.1-gsm8k-mathalg es un ajuste fino mediante aprendizaje por refuerzo del modelo Qwen/Qwen3.5-9B, publicado por el usuario wckwan en Hugging Face. El entrenamiento emplea RLVR (reinforcement learning from verifiable rewards) con el estimador de ventaja ARORA-RLOO (alpha = 0,1) y la libreria verl v0.9.1, sobre una mezcla de 3.200 prompts repartidos al 50 % entre GSM8K y MATH (algebra). El artefacto publicado es el checkpoint final, correspondiente al paso global 100.

El modelo conserva la torre de vision del modelo base sin modificaciones (pipeline image-text-to-text), por lo que mantiene la capacidad de procesar imagenes y texto, aunque todo el entrenamiento por refuerzo se aplico unicamente al modulo de texto. Cuenta con 9.409.813.744 parametros (unos 9,4 B) y el repositorio ocupa 37,7 GB porque los pesos se almacenan en float32 (pesos maestros de FSDP), con un unico archivo `model.safetensors`.

Su relevancia es fundamentalmente metodologica: se trata de un artefacto de investigacion que permite reproducir y estudiar el efecto del estimador ARORA-RLOO en tareas de razonamiento matematico, en un contexto en el que las tecnicas de RLVR concentran buena parte del esfuerzo de la comunidad open source. No incluye resultados de benchmarks publicados, ni licencia explicita, ni lista de idiomas soportados, por lo que debe tratarse como un checkpoint experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) del modelo base Qwen/Qwen3.5-9B, con torre de vision; detalles internos de la arquitectura no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la configuracion de entrenamiento limita el prompt a 2.048 tokens y la respuesta a 32.768 tokens) |
| Tipos de cuantizacion | No se publican versiones cuantizadas. Los pesos se distribuyen en float32; el `config.json` declara bfloat16, de modo que `dtype="auto"` y vLLM los cargan en bf16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica que los terminos de licencia y uso siguen los del modelo base) |
| Formato de pesos | safetensors (un unico `model.safetensors`, float32, ~37,6 GB), compatible con `transformers` |

Datos adicionales: pipeline declarado `image-text-to-text`; libreria `transformers`; modelo base `Qwen/Qwen3.5-9B`; tamano del repositorio 37,7 GB; 0 descargas y 0 likes en el momento de la consulta; fecha de creacion 2026-09-21.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con torre de vision. La model card especifica que unicamente se realizo entrenamiento por refuerzo sobre el modulo de texto: la torre de vision se incluye sin cambios respecto al modelo base. El pipeline declarado, `image-text-to-text`, confirma que la ruta de entrada de imagenes sigue operativa, aunque no fue objeto de optimizacion.

El entrenamiento es el elemento diferencial y esta completamente documentado en la model card:

| Hiperparametro | Valor |
|---|---|
| Modelo base | `Qwen/Qwen3.5-9B` |
| Estimador de ventaja | `arora_rloo`, alpha = 0,1 |
| Datos | 3.200 prompts, 50 % GSM8K / 50 % MATH (algebra) |
| Pasos | 100 (checkpoint final) |
| Batch | 32 prompts x 8 rollouts, mini-batch PPO de 16 prompts |
| Tasa de aprendizaje | 2e-6 |
| Coeficiente KL | 1e-3 |
| Agregacion de la perdida | `seq-mean-token-sum-norm` |
| Longitud maxima prompt / respuesta | 2.048 / 32.768 tokens |
| Hardware | 4 GPU, FSDP2 |
| Framework | verl v0.9.1 |

No se documenta ninguna innovacion arquitectonica propia: la novedad es de metodo (RLVR con ARORA-RLOO) aplicada sobre un modelo preentrenado ya existente. No se menciona uso de RLHF, DPO ni decodificacion especulativa. El volumen de entrenamiento es muy reducido (100 pasos sobre 3.200 prompts), lo que sugiere un ajuste de especializacion estrecha mas que una mejora general del modelo.

## Capacidades

- Generacion de texto y razonamiento matematico con cadena de pensamiento extensa, con respuestas de hasta 32.768 tokens durante el entrenamiento.
- Resolucion de problemas aritmeticos de tipo GSM8K, el dominio sobre el que se aplico el refuerzo.
- Resolucion de problemas de algebra del dataset MATH, segundo dominio de entrenamiento.
- Procesamiento de imagenes y texto: el pipeline declarado es `image-text-to-text` y la torre de vision se conserva del modelo base, aunque no fue entrenada.
- Capacidades generales de conversacion heredadas del modelo base (tag `conversational`).
- Soporte de tool calling / function calling: no disponible, no se documenta en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; unicamente se documenta el razonamiento matematico de la tarea de RLVR.
- Capacidades multilingues: no disponible, no se publica lista de idiomas.
- Modo "thinking" explicito: no disponible como funcionalidad declarada, aunque el formato de respuesta largo (hasta 32.768 tokens) es coherente con generacion de cadenas de razonamiento.

## Casos de uso

- Tutoria educativa de matematicas: el modelo puede resolver paso a paso problemas de aritmetica de primaria y secundaria (GSM8K) mostrando el razonamiento completo, lo que permite usarlo como base de un asistente de estudio que justifique cada operacion en lugar de dar solo el resultado.
- Generacion de ejercicios de algebra resueltos: dado que fue reforzado sobre el subconjunto de algebra de MATH, encaja en pipelines que producen enunciados con solucion verificable, utiles para bancos de ejercicios o para aumentar datasets de entrenamiento.
- Investigacion en RLVR: sirve como punto de comparacion reproducible frente a estimadores clasicos (por ejemplo GRPO o RLOO estandar) manteniendo constantes los datos, el presupuesto de pasos y el hardware (4 GPU con FSDP2).
- Extraccion y resolucion de problemas desde imagen: al conservar la torre de vision, se le puede entregar la fotografia o el escaneo de un problema manuscrito o impreso y obtener la transcripcion y la resolucion en una sola llamada, sin necesidad de un OCR previo.
- Generacion de datos sinteticos de razonamiento: sus respuestas largas y su especializacion en matematicas lo hacen util para producir trazas de cadena de pensamiento destinadas a destilar o ajustar modelos mas pequenos.
- Verificacion de soluciones en un sistema de evaluacion automatica: puede emplearse como segundo resolutor independiente y comparar su resultado con el del estudiante o con el de otro modelo para detectar discrepancias.
- Punto de partida para ajustes posteriores: al ser un checkpoint de RL de solo 100 pasos, es un candidato razonable para continuar el entrenamiento en otros dominios sin partir del modelo base original.
- Despliegue self-hosted en entornos con requisitos de privacidad: al ser un modelo de ~9,4 B con pesos abiertos, puede ejecutarse en infraestructura propia en escenarios educativos con datos de menores que no deben salir de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (GSM8K, MATH, MMLU u otros), ni comparaciones cuantitativas con el modelo base o con checkpoints intermedios. Tampoco se documenta la tasa de acierto del entrenamiento ni la curva de recompensa.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 9,4 B de parametros; los pesos no cuantizados ocuparian 37,6 GB en float32 y aproximadamente 18,8 GB en bf16, mas el coste de la cache KV):
  - float32: ~38-42 GB solo para pesos, mas cache KV.
  - bf16: ~19 GB de pesos; ~22-26 GB en total segun longitud de contexto.
  - int8: ~9,5 GB de pesos; ~12-14 GB en total.
  - int4: ~5 GB de pesos; ~7-9 GB en total.
- GPU recomendadas: A100 80 GB o H100 para trabajar en float32 o bf16 con contextos largos; A100 40 GB o L40S 48 GB para bf16; RTX 4090 / RTX 3090 (24 GB) para bf16 con contexto contenido o int8; RTX 4080 / 4070 Ti (16 GB) viables solo con cuantizacion int4.
- Cabe en GPU de consumo: si, en el rango de 16-24 GB, siempre que se cuantice. En bf16 con contexto largo (32.768 tokens) el margen en una GPU de 24 GB es muy ajustado y puede requerir reduccion de contexto o cuantizacion.
- Formatos y opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `dtype="auto"` (carga en bf16) segun la propia model card; vLLM, que segun el autor carga el modelo en bf16 pese a que los pesos esten en float32; FSDP2 para entrenamiento o ajuste posterior. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa. TGI y otros servidores no se mencionan en la documentacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados de este checkpoint, por lo que la comparativa se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wckwan/Qwen3.5-9B-ARORA-a0.1-gsm8k-mathalg | 9,4 B | No disponible | RLVR con ARORA-RLOO (alpha 0,1), 3.200 prompts, 100 pasos | No disponible (hereda la del modelo base) | Pesos safetensors en float32, sin cuantizaciones |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la informacion proporcionada (el ajuste tiene 9,4 B) | No disponible | Preentrenamiento del modelo base | No disponible en la informacion proporcionada | Pesos oficiales del autor original |
| Otros ajustes por RLVR sobre modelos de ~9 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado datos de benchmarks ni de otros modelos comparables en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Entrenamiento muy corto y muy estrecho: 100 pasos sobre 3.200 prompts repartidos entre GSM8K y algebra de MATH. Es esperable una especializacion acusada y un posible deterioro (olvido catastrofico) en tareas ajenas a esos dos dominios, aunque no se publican evaluaciones que lo confirmen o cuantifiquen.
- Ausencia total de benchmarks: no hay evidencia publicada de mejora respecto al modelo base. Cualquier afirmacion de mejora seria una suposicion.
- Riesgo de alucinacion: es un modelo generativo entrenado con recompensas verificables solo sobre problemas de respuesta comprobable; fuera de ese marco puede producir razonamientos plausibles pero incorrectos, especialmente en matematicas mas avanzadas o en problemas con enunciados ambiguos.
- Sin informacion sobre sesgos: no se documenta ningun proceso de evaluacion de sesgos, de alineacion ni de seguridad. No hay datos sobre RLHF o DPO.
- Idiomas no declarados: no se publica lista de idiomas soportados; el rendimiento fuera del ingles (idioma predominante en GSM8K y MATH) es desconocido.
- Licencia no disponible: la model card remite a los terminos del modelo base, pero no los concreta. Esto es un riesgo directo para uso comercial, ya que no se puede verificar que el uso previsto este permitido sin consultar la licencia de Qwen/Qwen3.5-9B.
- Torre de vision sin entrenar: aunque el pipeline es `image-text-to-text`, la torre de vision no recibio ajuste, por lo que el rendimiento en tareas visuales es el del modelo base y no esta documentado.
- Pesos en float32: el repositorio ocupa 37,7 GB. Aunque `config.json` declara bfloat16, existe una discrepancia entre el tipo declarado y el almacenado que puede provocar consumo de memoria y tiempos de carga inesperados en funcion de la herramienta utilizada.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento, soporte ni actualizaciones por parte del autor.
- Longitud de contexto real desconocida: no se especifica la ventana de contexto efectiva, y el limite de 32.768 tokens de respuesta corresponde a la configuracion de entrenamiento, no necesariamente a la capacida de inferencia del modelo base.
- Artefacto de investigacion: no debe desplegarse en produccion sin una evaluacion propia previa sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wckwan/Qwen3.5-9B-ARORA-a0.1-gsm8k-mathalg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Framework de entrenamiento verl (v0.9.1): https://github.com/volcengine/verl
- La busqueda web realizada no devolvio ningun resultado relevante: unicamente listados de anuncios clasificados sin relacion con el modelo, por lo que no se aportan enlaces adicionales (papers, blogs, demos o repos) mas alla de los anteriores.
