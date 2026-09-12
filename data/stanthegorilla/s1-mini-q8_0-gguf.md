# stanthegorilla/S1-mini-Q8_0-GGUF

## Resumen

S1-mini Q8_0 GGUF es una cuantizacion de 8 bits del modelo S1-mini de Superwhisper, un normalizador de transcripciones de voz a texto. Lo publica el usuario stanthegorilla para cubrir el hueco entre las dos cuantizaciones que el autor original distribuye (F16 y Q4_K_M), dentro del proyecto Lathe, una aplicacion de dictado push-to-talk local para Windows. El modelo no genera respuestas libres: recibe una transcripcion cruda precedida de una linea de control con el estilo, la estructura y el contexto deseados, y devuelve unicamente el texto limpio.

Se trata de un transformer decoder de aproximadamente 752 millones de parametros (751.632.384), derivado de Qwen3-0.6B segun la nota de licencia del repositorio, y ajustado especificamente para la tarea de normalizacion de dictado. El repositorio contiene un unico fichero GGUF de 805 MB, generado con `llama-quantize` a partir del F16 upstream sin importance matrix, ya que Q8_0 no la utiliza. El autor reporta una fidelidad del 94 % en entradas sinteticas y del 95 % en dictados reales respecto al F16 de referencia, con una velocidad de decodificacion de 246 tokens/s en una Radeon RX 6600 XT.

Su relevancia es practica y acotada: los modelos de normalizacion de transcripciones son el ultimo eslabon de los pipelines de voz y operan en local, por lo que el equilibrio entre fidelidad y tamano importa mas que el rendimiento en benchmarks generales. Q8_0 ofrece casi la fidelidad del F16 ocupando la mitad de disco y superandolo en velocidad, algo relevante para aplicaciones de escritorio con GPU modesta o inferencia en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3-0.6B (segun la nota de licencia); no se detalla mas en la informacion disponible |
| Parametros totales | 751.632.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (este repositorio); upstream: F16 y Q4_K_M |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0, con termino adicional de Superwhisper que obliga a identificar el modelo como "S1-mini" de "Superwhisper" en cualquier uso o distribucion |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del fichero | 805 MB (`s1-mini-q8_0.gguf`) |
| Tamano del repositorio | 0.8 GB |
| Modelo base | superwhisper/s1-mini (relacion: quantized) |
| Tarea declarada | text-normalization, speech-to-text, dictation |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento de S1-mini mas alla de su origen: el modelo base es superwhisper/s1-mini, y la nota de licencia del repositorio indica que los derechos se heredan de S1-mini y de Qwen3-0.6B (Alibaba Cloud), lo que situa la arquitectura en la familia de transformers decoder de Qwen3. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si esta documentado es el procedimiento de cuantizacion de este repositorio concreto: se genero con `llama-quantize` a partir del F16 publicado por Superwhisper, sin importance matrix, porque Q8_0 no la emplea. El autor menciona en los materiales de Lathe una comparacion de catorce builds, incluidas recetas de precision mixta calibrada, que no superaron al Q8_0 simple. La innovacion practica del modelo no esta en la arquitectura, sino en su contrato de inferencia fijo y en la eliminacion del modo de razonamiento: el prompt exige un system prompt literal, una linea de control y el transcript crudo, con el bloque de pensamiento vacio y decodificacion greedy.

## Capacidades

- Normalizacion de transcripciones de voz: elimina repeticiones, titubeos y palabras duplicadas, y aplica puntuacion y mayusculas al texto dictado.
- Control de estilo mediante linea de control: `casual`, `semi-casual`, `semi-formal` y `formal`.
- Control de estructura: salida en `prose` (prosa corrida) o `lists` (listas).
- Control de contexto: `general` y `email`, que ajusta el registro del texto resultante.
- Salida restringida: devuelve unicamente el texto limpiado, sin comentarios ni explicaciones, lo que simplifica su integracion en pipelines.
- Razonamiento visible: no. El contrato del modelo desactiva el pensamiento y deja el bloque `<think>` vacio de forma explicita.
- Tool calling / function calling: no disponible; no se menciona soporte en la informacion proporcionada.
- Uso como agente o razonamiento multi-paso: no disponible; el modelo esta disenado para una unica transformacion de texto.
- Capacidades multilingues: no. Solo ingles.
- Capacidades especiales: ninguna adicional (sin vision, audio ni modo thinking). Es un componente de post-procesado dentro de un pipeline de voz.

## Casos de uso

- Dictado push-to-talk en escritorio: es el caso de uso original del modelo, integrado en Lathe para Windows. El usuario habla, un motor de STT genera el transcript crudo y Q8_0 lo devuelve limpio y con el estilo configurado, todo en local.
- Limpieza de transcripciones de reuniones: alimentar el modelo con la salida de un motor de STT y obtener actas en prosa `semi-formal` o listas de tareas en `lists`, sin necesidad de enviar el audio ni el texto a la nube.
- Redaccion de correos por voz: con `[Context: email]` y `[Styling: formal]`, el modelo convierte un dictado desordenado en un correo con registro adecuado para enviar directamente.
- Post-procesado en pipelines de STT a gran escala: el modelo es lo bastante ligero (805 MB en Q8_0, 246 tokens/s en una GPU de gama media) para procesar lotes de transcripciones en una sola GPU de consumo, actuando como capa de normalizacion previa a indexacion o busqueda.
- Asistentes de accesibilidad: personas con movilidad reducida que dependen del dictado se benefician de una salida legible sin intervenir manualmente en la puntuacion y el formato.
- Notas clinicas, legales o de campo en entornos sin conectividad: al ejecutarse en local y en una GPU modesta o incluso en CPU, permite documentar con dictado sin que el contenido salga del dispositivo.
- Grabacion de ideas y notas rapidas: con `[Structure: lists]`, convierte un monologo desordenado en una lista de puntos accionables para gestores de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta una comparacion de fidelidad respecto al F16 y de velocidad de decodificacion sobre una Radeon RX 6600 XT:

| Build | Tamano | Salida identica al F16 (sinteticas / dictados reales) | Decodificacion (RX 6600 XT) |
|---|---|---|---|
| Q8_0 (este repositorio) | 805 MB | 94 % / 95 % | 246 tokens/s |
| F16 (upstream) | 1.509 MB | referencia | 150 tokens/s |
| Q4_K_M (upstream) | 484 MB | 76 % / 77 % | 325 tokens/s |

El autor senala ademas que Q4_K_M omitio clausulas completas en algunas dictados, algo que Q8_0 no hizo en ninguna de las 202 entradas de prueba. Los tests de fidelidad no estan descritos con detalle metodologico en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos Q8_0 ocupan 805 MB. Con el overhead de llama.cpp y una cache KV pequena, es razonable esperar un consumo en torno a 1,2-1,6 GB de VRAM, aunque la cifra exacta no esta publicada.
- GPU de referencia medida: Radeon RX 6600 XT, con 246 tokens/s de decodificacion. Es una GPU de gama media con 8 GB de VRAM, muy por encima de lo necesario.
- Cabe en cualquier GPU de consumo actual: RTX 3060, RTX 4060, RTX 4090, RX 6600, e incluso en GPUs integradas recientes. En CPU tambien es viable dado el tamano.
- Despliegue: llama.cpp es el runtime de referencia (el fichero es GGUF y se genero con sus herramientas). Es importable en Ollama, LM Studio y otros frontends basados en llama.cpp. vLLM y TGI no estan indicados en la informacion disponible para este fichero; el soporte de GGUF en vLLM es limitado.
- Latencia y throughput: 246 tokens/s en RX 6600 XT, frente a 150 tokens/s del F16 y 325 tokens/s del Q4_K_M. Como las salidas de normalizacion son cortas, la latencia por dictado es del orden de decimas de segundo en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Fidelidad vs F16 | Velocidad (RX 6600 XT) | Licencia |
|---|---|---|---|---|---|---|
| S1-mini Q8_0 (este repo) | 751,6 M | GGUF Q8_0 | 805 MB | 94 % / 95 % | 246 tokens/s | Apache 2.0 + atribucion |
| S1-mini F16 (upstream) | 751,6 M | GGUF F16 | 1.509 MB | referencia | 150 tokens/s | Apache 2.0 + atribucion |
| S1-mini Q4_K_M (upstream) | 751,6 M | GGUF Q4_K_M | 484 MB | 76 % / 77 % | 325 tokens/s | Apache 2.0 + atribucion |

No se dispone de datos sobre otros normalizadores de transcripciones comparables en la informacion proporcionada, por lo que la comparativa se limita a las tres cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Solo ingles. No hay soporte multilingue, por lo que no debe desplegarse con transcripciones en castellano u otros idiomas.
- No es un chatbot. El contrato de prompt es fijo (system prompt literal, linea de control, transcript crudo, pensamiento desactivado, decodificacion greedy); usarlo fuera de ese formato degrada o invalida la salida.
- Riesgo de alucinacion y de omision: el propio autor documenta que Q4_K_M elimino clausulas completas en algunas entradas. Aunque Q8_0 no lo hizo en 202 pruebas, se trata de una tarea generativa y la perdida de contenido es un riesgo real que conviene verificar en produccion.
- Fidelidad no perfecta: 94 % y 95 % de salidas identicas al F16 implican que entre un 5 % y un 6 % de las salidas difieren del modelo de referencia. Los criterios de comparacion no se detallan.
- Conocimiento del mundo muy limitado: con 751 M de parametros y un ajuste especifico para normalizacion, no es adecuado para razonamiento, codigo, matematicas ni preguntas abiertas.
- Restriccion de licencia: aunque la licencia es Apache 2.0, Superwhisper anade el termino de que cualquier uso o distribucion debe seguir identificando el modelo como "S1-mini" de "Superwhisper". Conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- Procedencia: es una cuantizacion de terceros, no una publicacion oficial de Superwhisper. El repositorio tiene 0 descargas y 1 like en el momento de redactar esta ficha, por lo que la validacion por parte de la comunidad es practicamente nula.
- Rendimiento reportado por el autor: las cifras de velocidad y fidelidad provienen de la model card y de las pruebas del propio autor, sin replicacion independiente conocida.
- No se especifica la longitud de contexto soportada, dato relevante si se pretende procesar dictados largos sin fragmentar.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/stanthegorilla/S1-mini-Q8_0-GGUF
- Cuantizaciones oficiales del modelo base: https://huggingface.co/superwhisper/s1-mini-GGUF
- Modelo base: https://huggingface.co/superwhisper/s1-mini
- Aplicacion Lathe (dictado push-to-talk para Windows): https://github.com/StanTheGorilla/lathe
- Busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (referencias a `Zalophus californianus` y a otarios de California), por lo que no se incluyen como fuentes. No se han encontrado papers, blogs ni demos adicionales sobre este modelo en la busqueda realizada.
