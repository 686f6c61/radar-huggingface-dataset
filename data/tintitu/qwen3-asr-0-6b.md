# tintitu/qwen3-asr-0.6b

## Resumen

Qwen3-ASR 0.6B es un modelo fundacional de reconocimiento automatico del habla (ASR) extremo a extremo, multilingue, de aproximadamente 600 millones de parametros, distribuido por el usuario tintitu en Hugging Face como una copia curada de los ficheros oficiales del proyecto Qwen3-ASR de QwenLM. El repositorio no contiene entrenamiento nuevo: reempaqueta pesos, tokenizador, preprocesador de audio y metadatos del modelo original, fijados al commit `5eb144179a02acc5e5ba31e748d22b0cf3e303b0` del repositorio ModelScope `Qwen/Qwen3-ASR-0.6B`.

La relevancia de esta variante concreta es su perfil de despliegue: con un unico fichero `model.safetensors` de 1.876.091.704 bytes (unos 1,75 GB), el modelo esta pensado para funcionar en CPU con un consumo de memoria de entre 1,5 GB y 2,5 GB de RAM y un factor de tiempo real (RTF) declarado de 0,35 a 0,55 en un procesador x86_64 de 8 nucleos. Esto lo situa en el segmento de ASR local, sin GPU dedicada, para transcripcion de audio de 16 kHz mono.

La model card indica soporte para chino, ingles y "otros idiomas multilingues", pero no detalla la lista completa de lenguas ni la arquitectura interna. Tampoco se publican resultados de benchmarks, licencia verificada ni tipos de cuantizacion alternativos, por lo que la ficha refleja unicamente los datos disponibles en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no especifica la arquitectura interna; la presencia de `preprocessor_config.json` y `chat_template.json` es compatible con un codificador de audio mas decodificador tipo transformer, sin confirmacion oficial en la informacion proporcionada) |
| Parametros totales | Aproximadamente 0,6 B (600 millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye `model.safetensors`; no se listan variantes GGUF, AWQ, GPTQ ni ONNX |
| Idiomas soportados | Chino, ingles y "otros idiomas multilingues" (lista completa no disponible) |
| Licencia | No verificada. La model card indica expresamente que no debe declararse Apache-2.0 ni otra licencia sin comprobar los terminos del repositorio original, y remite a los ficheros LICENSE/NOTICE de Qwen3-ASR |
| Formato de pesos | `safetensors` (`model.safetensors`, 1.876.091.704 bytes) |
| Tarea | Reconocimiento automatico del habla (ASR) extremo a extremo |
| Entrada de audio | 16.000 Hz, mono, PCM de 16 bits o float normalizado en el rango [-1,0; 1,0] |
| Autor del repositorio | tintitu (mirror curado) |
| Origen | QwenLM/Qwen3-ASR (upstream), revision fijada `5eb144179a02acc5e5ba31e748d22b0cf3e303b0` |
| Ficheros incluidos | `chat_template.json`, `config.json`, `generation_config.json`, `merges.txt`, `model.safetensors`, `preprocessor_config.json`, `tokenizer_config.json`, `vocab.json` |
| Tamano declarado del repositorio | 1,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo. El repositorio incluye un fichero `preprocessor_config.json` de 330 bytes, un `tokenizer_config.json` de 12.487 bytes con `vocab.json` (2.776.833 bytes) y `merges.txt` (1.671.853 bytes) de tipo BPE, ademas de un `chat_template.json` de 1.161 bytes. Esta combinacion de artefactos es coherente con un sistema de dos etapas (extraccion de caracteristicas acusticas mas decodificacion autorregresiva de texto), pero no hay confirmacion explicita en la documentacion facilitada.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o decodificacion especulativa. El autor del repositorio afirma de forma explicita que "no es un nuevo resultado de entrenamiento", sino una reorganizacion de los ficheros del modelo original, por lo que cualquier detalle de entrenamiento debe consultarse en la documentacion de QwenLM/Qwen3-ASR y en el repositorio oficial de ModelScope. Un detalle funcional relevante si aparece en la model card: el modelo ya emite texto con puntuacion y normalizacion, de modo que no requiere un modelo posterior de restauracion de puntuacion.

## Capacidades

- Transcripcion de voz a texto extremo a extremo, con salida de texto ya puntuado y normalizado.
- Reconocimiento multilingue: chino, ingles y otros idiomas no enumerados en la documentacion disponible.
- Procesamiento de audio de 16 kHz en mono, tanto en PCM de 16 bits como en arrays de punto flotante normalizados.
- Integracion con deteccion de actividad de voz (VAD) previa, con recomendacion explicita de Silero VAD o FSMN-VAD para segmentar audio largo y eliminar silencios.
- Ejecucion en CPU sin GPU dedicada, con huella de memoria declarada de 1,5 GB a 2,5 GB de RAM.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, diarizacion de hablantes ni traduccion de audio a otros idiomas distintos del reconocimiento.
- No se documenta modo de pensamiento (thinking mode) ni capacidades de audio mas alla del ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el modelo procesa audio de 16 kHz en CPU con un RTF de 0,35 a 0,55, de modo que una reunion de una hora puede transcribirse en un equipo de sobremesa sin GPU, encadenando un VAD para trocear la senal y evitar picos de memoria de 2,2 GB.
- Subtitulado de contenido audiovisual en chino e ingles: al devolver texto ya puntuado, la salida puede volcarse directamente a formatos SRT o VTT sin un modelo adicional de restauracion de puntuacion, lo que simplifica el pipeline de postproduccion.
- Dictado y accesibilidad en aplicaciones de escritorio: con un peso de 1,75 GB en `safetensors` y un consumo de RAM de 1,3 GB en reposo, el modelo puede integrarse en clientes de escritorio que funcionen sin conexion y sin acelerador grafico.
- Preprocesado de datos para entrenamiento de modelos de lenguaje: transcripcion masiva de corpus de audio en chino o ingles para generar pares audio-texto destinados a fine-tuning o evaluacion, aprovechando el bajo coste por hora en CPU.
- Analitica de centros de llamadas: transcripcion de conversaciones grabadas en 16 kHz mono para su posterior analisis de intencion, cumplimiento o busqueda de palabras clave, con el VAD como etapa previa para descartar silencios y reducir el tiempo de computo.
- Asistentes de voz para entornos con requisitos de privacidad: al ejecutarse de forma local y estar basado en pesos publicos, el audio no necesita salir del perimetro de la organizacion, lo que facilita el cumplimiento de politicas internas de tratamiento de datos.
- Prototipado e investigacion en ASR multilingue: el reducido tamano (0,6 B de parametros) lo hace util como linea base reproducible para comparar tecnicas de segmentacion, VAD o preprocesado acustico sin depender de infraestructura de GPU.
- Indexacion y busqueda de archivos de audio: transcripcion en lote de grabaciones historicas para construir indices de texto consultables, siempre que el audio cumpla el formato de entrada exigido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, CER, MMLU, HumanEval ni de ningun otro conjunto de evaluacion, ni comparaciones con modelos alternativos.

El unico dato de rendimiento declarado es el factor de tiempo real en CPU:

| Metrica | Valor |
|---|---|
| RTF en CPU x86_64 de 8 nucleos, una sola secuencia | 0,35 - 0,55 |
| Tiempo de proceso para un clip de 10 s | 3,5 s - 5,5 s |
| Memoria en reposo | Aproximadamente 1,3 GB |
| Pico de memoria en secuencias largas | Aproximadamente 2,2 GB |
| Rango de memoria total | 1,5 GB - 2,5 GB |

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: no disponible de forma oficial. Como referencia aritmetica derivada del tamano del fichero de pesos (1,75 GB), una carga en precision de 16 bits requeriria del orden de 2 a 2,5 GB de VRAM contando activaciones y buffers; en cuantizaciones de 8 bits o 4 bits el peso se reduciria aproximadamente a 0,9 GB y 0,5 GB respectivamente, pero no hay ficheros cuantizados publicados en este repositorio.
- RAM en CPU: 1,5 GB a 2,5 GB segun la model card, con 1,3 GB de residencia base y 2,2 GB de pico en audio largo.
- Configuracion recomendada por el autor: 4 nucleos de CPU o mas y 8 GB de RAM o mas.
- GPU recomendadas: no disponibles. La documentacion solo contempla despliegue en CPU.
- Cabe en GPU de consumo: probablemente si en modelos con 4 GB o mas de VRAM (por ejemplo, gamas RTX xx60 o superiores), aunque esta afirmacion no esta verificada por el autor y no se publican instrucciones de despliegue en GPU.
- Opciones de despliegue: no disponibles. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime. El repositorio solo aporta pesos en `safetensors` mas configuraciones de tokenizador y preprocesador, lo que sugiere uso mediante bibliotecas compatibles con Transformers, sin confirmacion explicita.
- Latencia y throughput: RTF de 0,35 a 0,55 en CPU de 8 nucleos para una unica secuencia. No se publican datos de throughput con lotes concurrentes.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de ASR, ni datos verificables de parametros, contexto, rendimiento o licencia de alternativas. Los resultados de busqueda web obtenidos no guardan relacion con el modelo y no aportan informacion tecnica utilizable.

Candidatos de comparacion habituales en el segmento de ASR multilingue de tamano pequeno serian las familias Whisper y la propia linea Qwen-Audio o Qwen3-ASR en otros tamanos, pero no se dispone de datos contrastados en esta ficha para establecer la comparacion.

## Limitaciones y advertencias

- Este repositorio es un espejo curado, no un entrenamiento original. El autor lo indica de forma explicita y remite al proyecto upstream para cualquier detalle tecnico.
- Licencia no verificada. La model card advierte que no debe declararse Apache-2.0 ni otra licencia sin completar la comprobacion de los terminos de Qwen3-ASR, y que pesos, codigo, configuraciones y vocabulario pueden estar sujetos a licencias distintas. El uso comercial y la redistribucion deben confirmarse contra los ficheros LICENSE/NOTICE originales.
- Riesgo de alusiones incorrectas en la transcripcion: no se publican tasas de error (WER/CER) ni condiciones de evaluacion, por lo que no es posible acotar la fiabilidad esperada en dominios con acentos, ruido o vocabulario tecnico.
- Idiomas no detallados: solo se confirman chino e ingles de forma explicita, mas una referencia generica a "otros idiomas multilingues" sin lista ni cobertura por lengua.
- Sin datos de sesgo: no hay informacion sobre sesgos demograficos, de acento o de idioma.
- Formato de entrada estricto: 16 kHz, mono, PCM de 16 bits o float normalizado en [-1,0; 1,0]. Otras frecuencias o configuraciones multicanal requieren remuestreo y downmix previos.
- Audio largo: el autor recomienda encadenar un VAD para segmentar y eliminar silencios, lo que implica que el modelo no esta pensado para consumir senales de duracion arbitraria sin trocear.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que existan problemas de integracion ya reportados y resueltos por la comunidad.
- Reproducibilidad: la model card recomienda fijar la revision o el commit concreto en lugar de depender de la rama por defecto, y ofrece una lista de verificacion SHA-256 para los ocho ficheros publicados.
- Despliegue en GPU y cuantizacion: no hay soporte documentado ni artefactos publicados, lo que limita las opciones de aceleracion en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tintitu/qwen3-asr-0.6b
- Repositorio upstream en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Repositorio oficial en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-ASR-0.6B
- Espejo oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Revision fijada del repositorio upstream: `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`
- No se han encontrado papers, blogs, demos ni repositorios adicionales relevantes en los resultados de busqueda web disponibles.
