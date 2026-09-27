# sraivante/tiny-superfast-agentic-MLM-6.5m-v1

## Resumen

tiny-superfast-agentic-MLM-6.5m-v1 es un modelo seq2seq de 6.441.472 parametros (≈6,4 M) desarrollado por el usuario sraivante, publicado en HuggingFace bajo licencia Apache 2.0. Su funcion es convertir una orden corta, hablada o escrita, en un comando estructurado que un programa pueda ejecutar: recibe texto y devuelve una accion de un catalogo cerrado de 371 acciones (audio, pantalla, Wi-Fi, aplicaciones, archivos, temporizadores, energia, red, servicios, GPIO/I2C de Raspberry Pi, etc.) junto con sus argumentos tipados y una puntuacion de confianza.

El modelo esta disenado para ejecutarse exclusivamente en CPU, sin GPU, sin PyTorch y sin conexion a internet durante la inferencia: solo requiere NumPy. Los pesos se distribuyen en `model/model.npz` (23,9 MB, float32) y se incluye ademas `pytorch/model.pt` para ajuste fino. El autor reporta 97,53 % de acierto exacto en 6.611 comandos de plantillas reservadas, 99,10 % en validacion y 100 % en 461 formulaciones de Wi-Fi no vistas, con una latencia mediana de 18 ms en un portatil con i7-1360P y 30 ms en una Raspberry Pi 5.

Su relevancia actual esta en el nicho de asistentes de voz privados y de coste cero para dispositivos de borde: sustituye a un LLM grande en el paso de "comprension" de ordenes de dispositivo bien definidas, de modo que la respuesta es instantanea y nada sale del equipo. Cubre ingles y Hinglish (hindi-ingles en escritura latina), con algo de hindi en devanagari, un perfil linguistico poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pequeno (seq2seq), genera el comando token a token |
| Parametros totales | 6.441.472 (≈6,4 M; el "6.5m" del nombre esta redondeado al alza) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ingles e hindi; incluye Hinglish en escritura latina y algo de hindi en devanagari |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy `.npz` (`model/model.npz`, 23,9 MB, float32) y PyTorch `.pt` (`pytorch/model.pt`) |

Otros datos del repositorio: pipeline declarado `text-generation`, tamano del repo 0.0 GB, 0 descargas y 1 like en el momento de la consulta, creado el 2026-09-27 y actualizado el mismo dia. Tags: function-calling, tool-use, agent, intent-classification, slot-filling, seq2seq, hinglish, code-mixed, voice-assistant, raspberry-pi, edge, on-device, cpu, numpy.

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder-decoder pequeno de tipo seq2seq: el encoder procesa la orden en lenguaje natural y el decoder escribe el comando estructurado token a token. El propio autor aclara de forma explicita que la sigla "MLM" del nombre significa *micro language model* y no *masked language model*: no es un modelo tipo BERT con enmascaramiento, aunque comparta el nombre. El modelo cubre un catalogo de 371 acciones con argumentos tipados y devuelve, junto al comando, una puntuacion de confianza que el ejecutor puede usar para decidir si actua, pide aclaracion o delega en un modelo mayor.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La evaluacion reportada se basa en conjuntos de comandos de plantillas reservadas (`test_strict`, 6.611 comandos) y en 461 formulaciones de Wi-Fi no vistas, lo que sugiere un entrenamiento supervisado sobre un corpus generado o curado de ordenes y sus correspondientes comandos. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Conversion de texto a comando estructurado (text-to-command) sobre un catalogo cerrado de 371 acciones.
- Clasificacion de intencion (intent classification) y relleno de ranuras (slot filling) con argumentos tipados: valores numericos, SSID, contrasenas, pines, unidades de tiempo, etc.
- Soporte de function calling / tool use en el sentido de que la salida es directamente invocable por un ejecutor.
- Comprension de Hinglish en escritura latina ("volume 40 kar do") y de hindi en devanagari ("5 मिनट का टाइमर लगाओ"), ademas de ingles.
- Dominios cubiertos: audio y volumen, pantalla, Wi-Fi y red, aplicaciones, archivos, temporizadores, energia, servicios del sistema y GPIO/I2C de Raspberry Pi.
- Devuelve una puntuacion de confianza asociada a cada prediccion, pensada para patrones de agente con umbrales.
- Inferencia en CPU con NumPy como unica dependencia, totalmente offline (Windows, Linux y Raspberry Pi 5).
- No dispone de capacidades de vision, audio nativo ni modo de razonamiento extendido (thinking mode); el reconocimiento de voz se aporta externamente mediante un ASR.

## Casos de uso

- Asistente de voz personal en Raspberry Pi 5: se encadena un ASR (Whisper, faster-whisper o Vosk) delante del modelo y un ejecutor detras; el modelo convierte la transcripcion en `set_volume {"value": 40}` y el dispositivo actua en decenas de milisegundos y sin salir a internet.
- Control de domotica y GPIO/I2C: ordenes como "board pin 11 pe led jalao" se traducen a `gpio_on {"pin": 11, "numbering": "board"}`, lo que permite gobernar hardware de una Raspberry Pi desde lenguaje natural sin depender de un servicio en la nube.
- Automatizacion de escritorio en portatiles: gestion de volumen, Wi-Fi, aplicaciones, archivos, temporizadores y apagado desde un cuadro de texto o un atajo de teclado, con latencia mediana de 18 ms en un i7-1360P.
- Clasificador de intenciones y slots en aplicaciones para usuarios de Hinglish: el modelo esta entrenado especificamente para mezcla de codigos hindi-ingles, un caso mal cubierto por asistentes genericos, y puede alimentar formularios o flujos de UI con la accion y los argumentos ya extraidos.
- Enrutador de bajo coste delante de un LLM mayor: si el comando entra en el catalogo de 371 acciones y la confianza es alta, se resuelve localmente; si la salida es `clarify`, `unknown` o la confianza es baja, se delega en un modelo mayor o se repregunta al usuario.
- Asistentes en entornos air-gapped o con requisitos de privacidad estrictos: al no necesitar GPU, PyTorch ni red en inferencia, encaja en kioscos, laboratorios o equipos industriales donde no se permite enviar audio fuera del dispositivo.
- Pruebas de integracion y CI sin GPU: al cargar en 0,13 s y necesitar solo NumPy, es viable incluirlo en suites de pruebas automatizadas que verifican el parseo de ordenes del sistema.
- Sustitucion de un LLM grande en comandos de dispositivo repetitivos: reduce coste y latencia a cero en los casos frecuentes y bien definidos, dejando el modelo grande para consultas abiertas.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los datos de evaluacion disponibles son los siguientes, medidos en castellano del repositorio original:

| Metrica | Resultado | Conjunto |
|---|---|---|
| Exactitud exacta | 97,53 % | 6.611 comandos de plantillas reservadas (`test_strict`) |
| Exactitud | 99,10 % | Validacion |
| Exactitud | 100 % | 461 formulaciones de Wi-Fi no vistas |
| Latencia mediana por comando | 18 ms | Portatil i7-1360P |
| Latencia mediana por comando | 30 ms | Raspberry Pi 5, carga sostenida de 10 minutos |
| Tiempo de carga | 0,13 s (portatil) / 0,20 s (Raspberry Pi 5) | - |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Las cifras anteriores son las reportadas por el autor y corresponden a conjuntos de evaluacion propios, no a suites externas ni a comparaciones con otros modelos.

## Requisitos de hardware

- VRAM necesaria para inferencia: 0 GB; el modelo esta pensado para CPU y no requiere GPU.
- Memoria RAM: el archivo de pesos ocupa 23,9 MB en float32, por lo que el consumo total depende del runtime de NumPy y del ASR que se anade; cabe holgadamente en cualquier equipo actual, incluida una Raspberry Pi 5.
- GPU recomendadas: no aplica; el autor indica explicitamente que no se necesita GPU, PyTorch ni conexion a internet en inferencia.
- Compatibilidad con GPU de consumo: no aplica, ya que la ejecucion es en CPU por diseno.
- Plataformas verificadas por el autor: Windows, Linux y Raspberry Pi 5, con inferencia basada unicamente en NumPy.
- Opciones de despliegue: runtime propio del repositorio (`from runtime import CommandModel`), con `OPENBLAS_NUM_THREADS` configurable (sugiere 4 en portatil y 2 en Raspberry Pi 5). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 18 ms por comando en i7-1360P y 30 ms en Raspberry Pi 5 bajo carga sostenida de 10 minutos; carga del modelo en 0,13 s y 0,20 s respectivamente. El throughput exacto en comandos por segundo no se detalla.
- ASR asociado: se propone faster-whisper con modelo `small` en CPU y `compute_type="int8"`, aunque el autor indica que cualquier motor de reconocimiento de voz sirve.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-superfast-agentic-MLM-6.5m-v1 (este modelo) | 6,4 M | no disponible | Seq2seq text-to-command, 371 acciones, ingles/Hinglish | Apache 2.0 | HuggingFace, pesos `.npz` y `.pt` |
| tiny-agentic-home-robotic-for-edge-device-v10 (mismo autor) | 23,9 M | no disponible | Basado en MiniLM, orientado a robotica domestica de borde | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de parseo de comandos en el mismo rango de tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con modelos de terceros no esta disponible en la informacion proporcionada; el unico pariente documentado es el modelo hermano de mayor tamano del mismo autor, que triplica aproximadamente el numero de parametros y usa una base MiniLM.

## Limitaciones y advertencias

- El modelo solo analiza ordenes; nunca ejecuta nada. El ejecutor incluido en el repositorio es, segun el autor, una muestra para pruebas y no un producto terminado.
- Las cifras de exactitud proceden de conjuntos de evaluacion propios basados en plantillas; no hay evidencia publica de rendimiento sobre lenguaje natural espontaneo, ruido de transcripcion o variaciones dialectales.
- El catalogo esta cerrado a 371 acciones: cualquier orden fuera de el, o con argumentos no contemplados, debe devolver `unknown` o `clarify` y gestionarse en otra capa.
- Cobertura linguistica limitada a ingles e hindi/Hinglish; no hay soporte de castellano ni de otras lenguas.
- No es un LLM generativo de proposito general: no se debe esperar razonamiento abierto, conversacion libre ni generacion de texto largo.
- Riesgo operativo en acciones criticas (apagado, cambios de red, escritura en GPIO): el propio autor recomienda ejecutar solo con confianza alta y aplicar la puerta de riesgo (safe / caution / critical) con confirmacion explicita antes de actuar.
- Riesgo de alucinacion en el sentido de generar una accion valida del catalogo que no corresponde a la orden; el uso de la confianza como umbral es obligatorio en produccion.
- Los argumentos sensibles (contrasenas de Wi-Fi, SSID) aparecen en texto claro en la salida; hay que tratarlos con las mismas precauciones que cualquier credencial en un ejecutor local.
- Licencia Apache 2.0: permite uso comercial, pero las obligaciones se aplican al modelo, no a los componentes de terceros que se anaden (ASR, ejecutor), que tienen sus propias licencias.
- Adopcion nula por el momento (0 descargas, 1 like), sin validacion independiente de la comunidad ni resultados replicados por terceros.
- Los metadatos del repositorio indican una fecha de creacion de 2026-09-27, posterior a la fecha habitual de publicacion; conviene verificarla antes de citarla.
- No se documenta la longitud de contexto, lo que impide planificar conversaciones multi-turno largas sin pruebas previas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sraivante/tiny-superfast-agentic-MLM-6.5m-v1
- Modelo hermano citado por el autor: https://huggingface.co/sraivante/tiny-agentic-home-robotic-for-edge-device-v10
- No se han encontrado en la busqueda web enlaces relevantes al modelo (papers, blogs, repos o demos); los resultados devueltos no guardan relacion con el contenido de esta ficha.
