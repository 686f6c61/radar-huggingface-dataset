# turintech/Kev-4B-Artemis-GGUF

## Resumen

Kev-4B-Artemis-GGUF es una conversión cuantizada en formato GGUF del modelo jaredpalmer/kev-4b, publicada por TurinTech. Kev-4B es un modelo de decisión de 4B parámetros (4.207.062.528 parámetros reales) creado por Jared Palmer que, en lugar de generar texto, recibe un texto de entrada junto con un conjunto de preguntas tipadas y devuelve una probabilidad para cada respuesta permitida en una única pasada. El pipeline declarado es text-classification y el modelo es solo texto.

La relevancia de esta ficha no está en el modelo base, sino en la conversión: TurinTech ha aplicado técnicas de su plataforma de optimización Artemis para producir cuantizaciones GGUF más pequeñas que las habituales. El fichero por defecto, Kev-4B-Artemis-2.5GB.gguf, pesa 2,54 GB frente a los 8,43 GB del BF16 original (un 70 % menos) y requiere 7,6 GiB de VRAM frente a los 13,1 GiB del original, medido todo en una NVIDIA RTX 5090. El repositorio completo ocupa 6,7 GB.

El interés práctico es la reducción de huella de memoria manteniendo el comportamiento de decisión: el fichero de 2,54 GB coincide con la respuesta del original en el 93,0 % de 2.000 decisiones de test y no cambia ninguna de las 244 respuestas en las que el original tenía más del 80 % de confianza. Los ficheros son GGUF estándar y se ejecutan sobre llama.cpp sin compilación personalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión/clasificación basado en Kev-4B; pipeline text-classification) |
| Parametros totales | 4.207.062.528 (4,2B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible como cifra exacta; el contexto de entrenamiento es mayor que 16.384 tokens (el README indica que `-c 16384` evita reservar memoria para el contexto completo de entrenamiento) |
| Tipos de cuantizacion | Artemis (propietaria): ficheros de 2,54 GB, 2,17 GB y 2,04 GB; en el repo publico ggml-org/Kev-4B-GGUF existen ademas Q8_0 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Kev-4B (no se especifica si es un transformer denso, ni el numero de capas, atencion o tokenizador). Se sabe que es un modelo de decisión: recibe un texto de estado y un conjunto de preguntas con tipo de respuesta fija (si/no, elegir una opcion, una puntuacion) y devuelve una probabilidad para cada respuesta permitida en una sola pasada, en lugar de decodificar texto token a token. El pipeline declarado es text-classification y el modelo es exclusivamente de texto.

Esta publicacion de TurinTech no entrena un modelo nuevo, sino que convierte y cuantiza los pesos originales a GGUF para llama.cpp mediante técnicas de su plataforma Artemis. No se aportan datos sobre el conjunto de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO. El proceso de validacion de la cuantizacion se hizo comparando cada fichero con el BF16 original y con los builds publicos de ggml-org, todos con idénticos ajustes de llama.cpp (commit `1e6f04a`, capitulo de test de LocalLLaMA/typed-decisions, 1.000 decisiones adicionales del split de train no usadas, y una muestra estratificada de 300 items de los benchmarks publicos Decision Index: MMLU, MMLU-Pro, ARC, WinoGrande, HellaSwag, ANLI, BANKING77, CLINC150 y When2Call).

## Capacidades

- Clasificacion por decision: devuelve una probabilidad por cada respuesta permitida de un conjunto de preguntas tipadas, en una unica pasada.
- Preguntas de tipo si/no, eleccion unica y puntuacion sobre un texto de entrada.
- Endpoint propio en llama.cpp (`/v1/systemone`) que acepta `state` y `questions` con instrucciones por pregunta.
- Integracion nativa con llama.cpp para despliegue en servidor.
- Funciona con entradas largas cuando se ajustan los parametros del servidor (`-ub 4096 -b 4096`).
- Idiomas soportados: no disponible.
- No genera texto libre; no es un modelo conversacional ni de generacion.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del mensaje con una pregunta tipada de urgencia (`noul`) permite obtener una probabilidad de urgencia en una pasada, como muestra el ejemplo del propio README con un caso de integracion Stripe. Adecuado por su baja latencia al no generar texto.
- Enrutamiento de mensajes en atencion al cliente: clasificar cada mensaje entrante en una categoria de departamento mediante preguntas de eleccion unica, con la ventaja de que el fichero de 2,54 GB cabe en GPUs de consumo.
- Clasificacion de intencion en asistentes y chatbots: el modelo base esta evaluado sobre los benchmarks BANKING77 y CLINC150, lo que lo orienta a deteccion de intenciones en dominios bancarios y de servicio.
- Moderacion de contenido: asignar una probabilidad por categoria de riesgo a cada pieza de texto entrante aprovechando que el modelo devuelve probabilidad por etiqueta en lugar de una unica salida generada.
- Analisis de sentimiento con escala: plantear una pregunta de tipo puntuacion sobre resenas o comentarios y obtener una distribucion de probabilidad en lugar de una etiqueta discreta.
- Triaje de correo y deteccion de phishing: combinar varias preguntas tipadas (si/no y puntuacion) sobre el mismo cuerpo del correo para obtener varios indicadores en una sola inferencia.
- Despliegue en edge o servidores con VRAM limitada: el fichero de 2,04 GB permite ejecutar el modelo con poca memoria asumiendo una perdida de precision de aproximadamente 2 a 3 puntos segun el README.
- Evaluacion y comparacion de cuantizaciones: usar los distintos ficheros (2,54/2,17/2,04 GB) para medir el compromiso entre memoria y fidelidad de decision en un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU global, HumanEval, GSM8K) como metricas absolutas del modelo en la informacion disponible. Los datos aportados son comparativos entre builds de cuantizacion sobre el mismo conjunto de decisiones.

| Check | BF16 | 2.5GB | 2.2GB | 2.0GB | Public Q8_0 | Public Q4_K_M |
|---|---|---|---|---|---|---|
| Precision en decisiones tipadas | 66,8 | 66,8 | 67,1 | 64,5 | 66,5 | 66,8 |
| Misma respuesta que BF16 | referencia | 93,0 | 90,3 | 88,6 | 98,4 | 93,2 |
| Precision en held-out | 66,1 | 64,4 | 64,2 | 63,4 | 65,9 | 66,0 |
| Held-out: misma respuesta que BF16 | referencia | 92,7 | 91,3 | 87,1 | 98,7 | 94,0 |
| Precision en muestra Decision Index | 72,0 | 71,3 | 69,3 | 71,0 | 71,3 | 72,3 |
| Decision Index: misma respuesta que BF16 | referencia | 94,0 | 90,3 | 90,7 | 98,0 | 96,0 |
| Respuestas cambiadas donde BF16 tenia mas del 80 % de confianza | referencia | 0 | 0 | 0 | 0 | 0 |

Notas del autor: el original cambia el 8,6 % de sus respuestas cuando se barajan las opciones, mientras que los ficheros Artemis cambian el 9,9 % (dato truncado en la informacion disponible).

## Requisitos de hardware

- Fichero por defecto `Kev-4B-Artemis-2.5GB.gguf`: 2,54 GB en disco y 7,6 GiB de VRAM (medido en NVIDIA RTX 5090 de 32 GB).
- Fichero original en BF16: 8,43 GB en disco y 13,1 GiB de VRAM.
- Ficheros alternativos: 2,17 GB y 2,04 GB en disco (menos memoria, con perdida de precision estimada de aproximadamente 2 a 3 puntos en el de 2,04 GB).
- GPU recomendadas: cualquier GPU con mas de 8 GiB de VRAM para el fichero de 2,54 GB; el BF16 requiere mas de 13 GiB. Cabe en GPUs de consumo modernas (series RTX 40/50 y equivalentes con VRAM suficiente).
- Opciones de despliegue: llama.cpp (necesario desde el 9 de octubre de 2026, probado en el commit `1e6f04a`). No requiere build ni servidor personalizados.
- Comando de servidor recomendado: `llama-server -m Kev-4B-Artemis-2.5GB.gguf --port 8080 -c 16384 -ub 4096 -b 4096`. Es importante mantener `-ub 4096 -b 4096`, ya que con el valor por defecto de 512 el endpoint `/v1/systemone` rechaza entradas de mas de 512 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | VRAM | Misma respuesta que BF16 | Licencia |
|---|---|---|---|---|---|
| turintech/Kev-4B-Artemis-GGUF (2.5GB) | 4,2B | 2,54 GB | 7,6 GiB | 93,0 % | Apache 2.0 |
| jaredpalmer/kev-4b (BF16, original) | 4,2B | 8,43 GB | 13,1 GiB | referencia | Apache 2.0 |
| ggml-org/Kev-4B-GGUF Q4_K_M | 4,2B | 3,03 GB | no disponible | 93,2 % | Apache 2.0 |
| ggml-org/Kev-4B-GGUF Q8_0 | 4,2B | 4,48 GB | no disponible | 98,4 % | Apache 2.0 |

La conversion de TurinTech ofrece el menor tamano de disco de la comparativa (2,54 GB frente a 3,03 GB del Q4_K_M), con una fidelidad de decision ligeramente por debajo del Q4_K_M en held-out (92,7 % frente a 94,0 %) y en la muestra del benchmark (94,0 % frente a 96,0 %). El Q8_0 es el mas fiel al original (98,4 %) pero ocupa 4,48 GB.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre respuestas de un conjunto tipado predefinido.
- Es una conversion independiente de TurinTech, no afiliada ni respaldada por los autores de Kev. Los pesos se han convertido a GGUF y cuantizado; cualquier diferencia de comportamiento respecto al original es responsabilidad de la cuantizacion.
- La cuantizacion introduce perdida de fidelidad: el fichero por defecto coincide con el original en el 93,0 % de las decisiones de test, no en el 100 %. El fichero de 2,04 GB baja a 88,6 % de coincidencia y a una perdida de precision estimada de 2 a 3 puntos.
- En held-out, el fichero de 2,54 GB tiene una precision 1,7 puntos por debajo del original (64,4 frente a 66,1).
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de asignar alta probabilidad a una respuesta incorrecta en decisiones ambiguas; no se aportan datos al respecto.
- Limitaciones de idioma: no disponible.
- Requiere llama.cpp del 9 de octubre de 2026 o posterior; con versiones anteriores el endpoint `/v1/systemone` puede no existir o no funcionar.
- La configuracion del servidor es critica: con el valor por defecto de `-ub 512` las entradas de mas de 512 tokens son rechazadas.
- Licencia Apache 2.0, lo que permite uso comercial segun los terminos de dicha licencia, pero conviene revisar el fichero `NOTICE` del repositorio por si hay condiciones adicionales de la conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/turintech/Kev-4B-Artemis-GGUF
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
- Builds publicos de referencia: https://huggingface.co/ggml-org/Kev-4B-GGUF
- Dataset de evaluacion: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- TurinTech: https://turintech.ai
- TurinTech (sitio alternativo): https://turintech.org/
- Producto Artemis: https://www.turintech.ai/product/overview
- Documentacion de Artemis: https://docs.artemis.turintech.ai/
- Ficha Kev 4B en gradually.ai: https://www.gradually.ai/en/ai-models/kev-4b/
