# sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW

## Resumen

Qwen3.8-27B-Heretic-JP-Roleplay-NSFW es un ajuste fino (fine-tune) en japones para rol conversacional, publicado por el usuario sss22213 sobre su propio modelo previo sss22213/Qwen3.8-27B-Heretic-NoRefusal, que a su vez deriva de Qwen/Qwen3.8-27B. El modelo resuelve un problema muy concreto: adaptar un modelo multimodal con modo de razonamiento explicito a sesiones largas de roleplay en japones con contenido sexual explicito y sin rechazos, sin destruir la capacidad de razonamiento del modelo original.

Tecnicamente es un modelo denso de 27.356.728.560 parametros (~27,36B) con arquitectura declarada Qwen3_5ForConditionalGeneration, vision-language (pipeline image-text-to-text) y pesos bf16 sin cuantizar en dos ficheros safetensors de unos 51 GB. Sobre esa base se aplico una QLoRA (r=32, alpha=32) entrenada con Unsloth y TRL sobre 18.802 conversaciones de roleplay japonesas reconstruidas para incluir trazas `<think>` generadas por el propio modelo base, y el adaptador se fusiono a plena intensidad (alpha/r = 1,0) en los pesos bf16.

Su relevancia es doble. Por un lado, es un ejemplo documentado de la cadena abliteration + fine-tune de rol, con metricas concretas de la fase de ablacion (4/100 rechazos en 100 peticiones, divergencia KL 0,0796 en el ensayo 198 de Heretic). Por otro, aborda un fallo conocido de los datasets de rol: al no contener razonamiento, el entrenamiento ensena al modelo a saltarse el bloque `<think>`, y aqui el dataset se regenero para que cada turno objetivo incluya una traza completa, con un criterio de aceptacion basado en que la longitud de razonamiento no se reduzca respecto a la base. El repositorio esta etiquetado `not-for-all-audiences` y no debe desplegarse donde haya menores o usuarios que no consientan el contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) con modo de razonamiento; clase declarada `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 27.356.728.560 (~27,36B), segun safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso secuencias de 8.192 tokens y la generacion de datos, 16.000 tokens de contexto |
| Tipos de cuantizacion | no se publican pesos cuantizados; los pesos distribuidos son bf16 sin cuantizar. La base se cargo en 4 bits unicamente durante el entrenamiento QLoRA |
| Idiomas soportados | japones (ja), ingles (en), chino (zh). Los datos de ajuste son exclusivamente japoneses |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2 shards, bf16, ~51 GB); repo de 54,7 GB |
| Tamano del repositorio | 54,7 GB |
| Fecha de publicacion | 18 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer denso multimodal con torre de vision y un modo de pensamiento explicito controlable mediante `enable_thinking` y `reasoning_effort`. El tokenizador, la plantilla de chat y el codificador de vision no se han modificado, de modo que el modelo se carga e invoca igual que Qwen3.8-27B. La cadena de construccion tiene tres pasos: (1) Qwen3.8-27B (Apache-2.0, vision-language, thinking); (2) ablacion de la direccion de rechazo con Heretic, dando lugar a Qwen3.8-27B-Heretic-NoRefusal (ensayo 198: 4/100 rechazos, KL 0,0796); (3) QLoRA de roleplay japones sobre datos aumentados con razonamiento, fusionada a plena intensidad.

Los datos de entrenamiento parten de Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted (MIT, 19.917 conversaciones de rol japonesas generadas con DeepSeek-V3-0324, cada una con mensaje de sistema de personaje/escenario y dialogo multiturno). Como el dataset original carece de contenido de razonamiento, el ultimo turno de asistente de cada conversacion se regenero con el modelo base en modo thinking, servido mediante API compatible con OpenAI: se descarto la linea original y el modelo escribio tanto su traza `<think>` como su respuesta. La generacion uso temperatura 0,6, top-p 0,95, top-k 20, hasta 5.120 tokens nuevos, contexto de 16k, semilla 3407 y hasta 2 reintentos si se alcanzaba el limite de longitud. Los filtros exigian entre 200 y 6.000 caracteres de razonamiento y al menos 10 caracteres de respuesta; pasaron 18.802 conversaciones de unas 20.000 muestreadas, con una media de ~1.500 caracteres de razonamiento y ~210 de respuesta. La traza se almacena como `reasoning_content` y la plantilla de chat de Qwen3.8 la renderiza como bloque `<think>…</think>` real.

El entrenamiento QLoRA se ejecuto con LoRA Forge (entorno Unsloth + TRL SFT) en una unica RTX 5090 de 32 GB. Configuracion: base cargada en 4 bits; LoRA r=32, alpha=32, dropout 0,05; modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` (solo capas del modelo de lenguaje, torre de vision intacta); longitud de secuencia 8.192 sin packing; batch efectivo 4 x acumulacion 4 = 16 secuencias; optimizador AdamW de 8 bits con tasa 2e-4, schedule coseno, 60 pasos de warm-up y weight decay 0,01; 1,01 epocas (1.188 pasos), semilla 3407; perdida solo en turnos de asistente. Los bloques `<think>` vacios que la plantilla genera para turnos de historial sin razonamiento se enmascararon (`mask`), de modo que el modelo nunca se entrena a producir un bloque de pensamiento vacio. Resultado: perdida de entrenamiento 0,609, 47,3M tokens procesados, 15,7 horas y 28,3 GB de VRAM pico. La fusion se hizo con `merge_and_unload` de PEFT sobre los pesos bf16 con `lora_alpha = 32` (escala efectiva alpha/r = 1,0).

## Capacidades

- Generacion de texto conversacional multiturno en japones, con mantencion de personaje a partir de una ficha en el mensaje de sistema y un historial largo.
- Razonamiento explicito: produce bloques `<think>` completos antes de la respuesta; el ajuste se diseno precisamente para que la longitud de razonamiento no se reduzca respecto al modelo base.
- Contenido para adultos sin rechazo: genera contenido sexual explicito a peticion y no aplica rechazos de seguridad (la direccion de rechazo fue ablacionada antes del ajuste).
- Entrada de imagen: hereda la torre de vision del base y el pipeline `image-text-to-text`; no se ajusto ni se verifico con datos del entrenamiento, por lo que su comportamiento multimodal es el del base.
- Multilinguee limitado a ja, en y zh segun los metadatos; el ajuste es solo en japones, por lo que en y zh conservan el comportamiento del base sin especializacion.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` y activacion/desactivacion con `enable_thinking` (herencia de Qwen3.8-27B). El autor recomienda dejar el thinking activado en rol.
- Soporte de tool calling / function calling: no documentado en la model card para este ajuste; no disponible.
- Comportamiento agentico o multi-step con herramientas: no documentado; no disponible.

## Casos de uso

- Personajes conversacionales para plataformas de entretenimiento para adultos: el modelo mantiene una ficha de personaje en el mensaje de sistema y sostiene sesiones multiturno en japones con estilo consistente, gracias al ajuste sobre 18.802 dialogos con mensaje de escenario.
- Generacion de dialogos para novelas visuales y juegos con contenido adulto: permite producir guiones ramificados en japones con respuestas cortas (~210 caracteres de media en los datos de entrenamiento) aptas para cajas de dialogo.
- Asistencia a escritura creativa y ficcion para adultos: la traza `<think>` permite inspeccionar por que el modelo eligio una respuesta, lo que ayuda a un autor a iterar sobre el tono sin reescribir manualmente el turno.
- Investigacion sobre abliteration y direcciones de rechazo: sirve como caso reproducible de cadena Heretic + fine-tune, con metricas publicadas (4/100 rechazos, KL 0,0796) para estudiar el coste de la ablacion en calidad y estilo.
- Pruebas de seguridad (red teaming) y evaluacion de filtros: al no rechazar, es un sujeto de prueba controlado para medir la eficacia de clasificadores de contenido en entornos de investigacion cerrados.
- Evaluacion comparativa de degradacion por fine-tune: comparar este modelo con Qwen3.8-27B y con el padre sin ajuste permite cuantificar cuanto del rendimiento generalista se pierde tras una QLoRA de 1,01 epocas sobre datos de un solo dominio e idioma.
- Prototipado de sistemas de chat con personaje y contexto largo en infraestructura propia: al ser pesos bf16 estandar con la misma plantilla de chat que Qwen3.8-27B, se integra sin cambios en `transformers` con `AutoModelForImageTextToText` y `AutoProcessor`.
- Generacion de datos sinteticos de dialogo en japones: util para aumentar corpus de rol con trazas de razonamiento asociadas, reutilizando el mismo formato `reasoning_content` del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible: la model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de rol. Los unicos numeros verificables son los del proceso de construccion y entrenamiento, no comparables con tablas de benchmarks estandar.

| Metrica | Valor | Ambito |
|---|---|---|
| Tasa de rechazo | 4/100 peticiones | Modelo padre (paso 2, ablacion con Heretic, ensayo 198) |
| Divergencia KL | 0,0796 | Modelo padre (paso 2, ensayo 198) |
| Perdida de entrenamiento | 0,609 | QLoRA de este repositorio |
| Tokens de entrenamiento | 47,3M | QLoRA de este repositorio |
| Epocas / pasos | 1,01 / 1.188 | QLoRA de este repositorio |
| VRAM pico de entrenamiento | 28,3 GB | RTX 5090 32 GB |
| Duracion del entrenamiento | 15,7 h | RTX 5090 32 GB |
| Volumen de datos | 18.802 conversaciones de 19.917 | Filtrado del dataset aumentado |
| Longitud media de razonamiento / respuesta | ~1.500 / ~210 caracteres | Datos que pasaron el filtro |

## Requisitos de hardware

- bf16 sin cuantizar: los pesos ocupan ~51-55 GB, por lo que se necesita al menos 1x H100 80 GB o 1x A100 80 GB; con cache KV para contexto largo, 2x A100 40 GB o 2x L40S 48 GB. El repo completo pesa 54,7 GB en disco.
- int8: ~28 GB solo de pesos, mas cache KV; encaja con holgura en 1x A100 40 GB y de forma muy ajustada en 1x RTX 5090 32 GB con contexto reducido.
- 4 bits (NF4, GPTQ o AWQ generados por el usuario): ~15-16 GB de pesos, viables en RTX 4090 24 GB, RTX 5090 32 GB, L40S 48 GB y A100 40 GB. La cuantizacion de la base a 4 bits ya se valido durante el entrenamiento, lo que respalda la viabilidad de esta ruta en inferencia.
- GPU de consumo: si, el modelo cabe en tarjetas de consumo de 24-32 GB unicamente en cuantizacion de 4 bits; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (ruta documentada por el autor); vLLM o TGI quedan sujetos al soporte efectivo de la arquitectura `Qwen3_5ForConditionalGeneration` en cada version. Para llama.cpp u Ollama habria que generar los GGUF a partir de los safetensors, ya que no se publican cuantizaciones listas.
- Latencia y throughput: no disponibles. El dato de 15,7 h en una RTX 5090 corresponde a 47,3M tokens de entrenamiento QLoRA y no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic-JP-Roleplay-NSFW (este) | 27,36B denso | no disponible | si | Apache-2.0 | Pesos bf16, 2 shards, sin cuantizaciones publicadas; 0 descargas, 0 likes |
| sss22213/Qwen3.8-27B-Heretic-NoRefusal (padre) | 27,36B denso | no disponible | si | Apache-2.0 | Sin ajuste de rol; 4/100 rechazos, KL 0,0796 |
| Qwen/Qwen3.8-27B (base) | 27,36B denso | no disponible | si | Apache-2.0 | Modelo original con rechazos y modo thinking |
| Otros fine-tunes de rol japones con abliteration | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion de alternativas comparables en los datos proporcionados |

Los tres modelos comparten tokenizador, plantilla de chat y torre de vision, por lo que la comparacion se reduce a comportamiento: el base aplica rechazos, el padre los elimina con un coste de KL 0,0796, y este anade especializacion en rol japones NSFW con perdida final de 0,609. No hay benchmarks que permitan comparar calidad generalista entre ellos.

## Limitaciones y advertencias

- Contenido para adultos: el modelo produce material sexualmente explicito a peticion y no rechaza. La propia model card indica explicitamente que no debe desplegarse donde puedan acceder menores o usuarios que no consientan ese contenido. La etiqueta `not-for-all-audiences` es vinculante en la practica.
- Sesgos: no hay evaluacion de sesgos publicada. La ablacion de la direccion de rechazo con una KL de 0,0796 implica un desplazamiento medible en la distribucion de salidas respecto al base, cuyas consecuencias cualitativas no se documentan.
- Alucinacion: no hay medicion de tasa de alucinacion. Los datos de ajuste son sinteticos (generados con DeepSeek-V3-0324 y con el propio modelo base), lo que favorece la deriva de estilo y el refuerzo de patrones propios del modelo en lugar de hechos verificables.
- Especializacion estrecha: el ajuste cubre 18.802 conversaciones, todas en japones y de un unico dominio (rol). Es esperable degradacion en tareas generales, matematicas o codigo, pero no se ha cuantificado. No se ha verificado el comportamiento en ingles o chino tras el ajuste.
- Razonamiento: el modelo fue entrenado con thinking activado y el autor recomienda mantenerlo asi en rol; desactivarlo coloca al modelo fuera de la distribucion de entrenamiento. Los bloques `<think>` vacios se enmascararon en la perdida, asi que el modelo no ha aprendido a gestionarlos como objetivo.
- Contexto: la model card no declara la ventana de contexto del modelo final. El entrenamiento uso 8.192 tokens de secuencia y la generacion de datos 16k; usar contextos muy superiores no esta validado.
- Vision: la torre de vision no se ajusto ni se valido; el comportamiento image-text-to-text es el heredado del base, sin garantias de que el ajuste no haya afectado a la coherencia multimodal.
- Licencia: Apache-2.0 permite uso comercial, pero la licencia no exime de la responsabilidad legal sobre el contenido generado, que puede estar sujeta a normativa especifica segun jurisdiccion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. No hay validacion independiente, ni cuantizaciones comunitarias, ni evaluaciones de terceros.
- Fecha: los metadatos indican creacion y actualizacion en septiembre de 2026; conviene verificar el estado del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW
- Modelo padre (sin ajuste de rol): https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-NoRefusal
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted
- Heretic (ablacion de la direccion de rechazo): https://github.com/p-e-w/heretic
- LoRA Forge (entorno de entrenamiento Unsloth + TRL): https://github.com/sss22213/llm_lora_train_webui_unsloth
- Unsloth: https://github.com/unslothai/unsloth
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (enlaces a Hulu), por lo que no se han podido incorporar papers, blogs tecnicos ni demos adicionales. No se dispone de articulo tecnico ni informe de evaluacion independiente.
