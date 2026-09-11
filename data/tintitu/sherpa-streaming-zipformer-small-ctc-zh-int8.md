# tintitu/sherpa-streaming-zipformer-small-ctc-zh-int8

## Resumen

El modelo `tintitu/sherpa-streaming-zipformer-small-ctc-zh-int8` es un sistema de reconocimiento automatico del habla (ASR) en streaming para chino, empaquetado en formato ONNX cuantizado a INT8. Se trata de una variante "small" de la arquitectura Zipformer con cabecera CTC, pensada para decodificacion en linea (online), es decir, con salida incremental a medida que llega el audio en lugar de esperar a la senal completa. La entrada esperada es audio mono a 16 kHz.

El repositorio de HuggingFace no contiene un entrenamiento nuevo: es una redistribucion de artefactos ya publicados por el proyecto upstream `k2-fsa/sherpa-onnx`, identificados con la version `2025-04-01`. Los ficheros incluidos son `model.int8.onnx` y `tokens.txt`, y el artefacto original (comprimido en tar.bz2) ocupa 21.264.113 bytes con SHA256 `b3b309f7ce4a737195fcc6963ea19b0653a7d3401580af5ae0d3e284cbb71f0b`.

Su relevancia practica radica en el despliegue: al ser un modelo INT8 de tamano reducido y con runtime ONNX, puede ejecutarse en CPU y dispositivos de borde sin GPU, lo que lo hace util para dictado, subtitulado y asistentes de voz en chino. No es un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling. La licencia y los idiomas declarados por el autor no estan especificados en la model card del repositorio de destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Online Zipformer CTC (encoder tipo Zipformer con cabecera CTC) |
| Parametros totales | no disponible (estimacion no confirmada: decenas de millones, a partir del tamano del artefacto INT8 de ~21,3 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR en streaming sobre audio; no hay ventana de tokens) |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | chino (`zh`) |
| Licencia | no disponible (el autor remite a la licencia y NOTICE del proyecto upstream; no declara licencia propia) |
| Formato de pesos | ONNX (`model.int8.onnx`) + vocabulario `tokens.txt` |
| Tarea | Reconocimiento automatico del habla en streaming (online) |
| Frecuencia de muestreo de entrada | 16 kHz |
| Version upstream | `2025-04-01` (release `sherpa-onnx-streaming-zipformer-small-ctc-zh-int8-2025-04-01`) |
| Tamano del artefacto upstream | 21.264.113 bytes (tar.bz2) |
| SHA256 upstream | `b3b309f7ce4a737195fcc6963ea19b0653a7d3401580af5ae0d3e284cbb71f0b` |

## Arquitectura y entrenamiento

Zipformer es una arquitectura de encoder para ASR desarrollada en el ecosistema `k2-fsa`/`icefall`, que sustituye al encoder Conformer clasico por una estructura tipo U-Net con multiples escalas de resolucion temporal: cada bloque trabaja con tasas de frames reducidas de forma progresiva, lo que disminuye el coste computacional del mecanismo de atencion sin renunciar al contexto temporal. Esto la hace especialmente adecuada para decodificacion en streaming, donde la latencia importa. De acuerdo con la documentacion publica del proyecto upstream, la variante "small" reduce el numero de capas y canales respecto a las variantes mayores. En esta version, la salida se produce mediante una cabecera CTC (de ahi el sufijo `ctc`), en lugar de un decodificador transducer. Cabe senalar que estos detalles arquitectonicos provienen de la documentacion general de Zipformer y no estan desglosados en la model card del repositorio.

La model card no aporta informacion sobre el conjunto de datos de entrenamiento, el numero de tokens de audio procesados, la composicion del corpus ni el procedimiento de optimizacion. No hay RLHF ni DPO, ya que no aplica a un modelo de reconocimiento de voz. El propio autor indica explicitamente que "este repositorio publica una version ordenada de los ficheros del modelo upstream, no un nuevo resultado de entrenamiento", por lo que no se puede atribuir ningun proceso de entrenamiento adicional a esta publicacion. La cuantizacion a INT8 se realizo en el artefacto upstream, no necesariamente en este repositorio.

## Capacidades

- Reconocimiento de voz en chino en modo streaming, con emision incremental de resultados conforme se recibe el audio.
- Procesamiento de audio mono a 16 kHz, apto para dictado continuo y transcripcion de sesiones largas mediante mantencion de estado recurrente.
- Decodificacion CTC en linea, adecuada para escenarios de baja latencia.
- Ejecucion local en CPU mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Integracion con el ecosistema `sherpa-onnx` (bindings en C++, Python, Android, iOS y otros).
- No dispone de soporte de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: la model card indica unicamente chino.
- No incluye vision, audio generativo ni capacidades multimodales mas alla de la transcripcion.
- No se documentan capacidades de puntuacion, mayusculas o normalizacion de texto (ITN).

## Casos de uso

- Subtitulado en directo: el modelo genera transcripcion incremental de audio a 16 kHz, lo que permite emitir subtitulos en chino con baja latencia en retransmisiones o videoconferencias.
- Dictado por voz en aplicaciones de escritorio: al ser un fichero ONNX INT8 de ~21 MB, puede embeberse en una aplicacion local que transcriba la voz del usuario sin enviar audio a terceros.
- Transcripcion de atencion telefonica: con decodificacion en streaming y estado recurrente, permite transcribir conversaciones de larga duracion de forma continua en un servidor de CPU.
- Asistentes de voz y comandos por voz: el reconocimiento en linea facilita la deteccion de intenciones sobre la marcha en chino, integrаndose con un modulo de NLU posterior.
- Reconocimiento en dispositivos de borde: su tamano reducido y ejecucion en CPU habilitan despliegues en Raspberry Pi, telefonos Android o dispositivos embebidos sin GPU.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo real de conversaciones presenciales en chino mostrada en pantalla.
- Indexacion y busqueda de audio de archivo: transcripcion por lotes de grabaciones en chino para generar indices de texto buscables, aprovechando la ejecucion en CPU a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de CPU; en GPU, el modelo INT8 ocupa del orden de decenas de MB de pesos, por lo que la memoria necesaria es minima (no confirmado por el autor).
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en CPU y no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: si, cualquiera (RTX 3060, RTX 4090, etc.) es mas que suficiente; tambien funciona sin GPU.
- Despliegue: `sherpa-onnx` (C++, Python, Android, iOS, C#, Go, etc.) sobre ONNX Runtime. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. La naturaleza "small" y la cuantizacion INT8 apuntan a una latencia baja en CPU, pero no hay cifras publicadas en la informacion proporcionada.
- Almacenamiento: el artefacto upstream comprimido son ~21,3 MB; los ficheros desplegados (`model.int8.onnx` + `tokens.txt`) son igualmente reducidos.
- Requisitos adicionales: audio de entrada mono a 16 kHz; puede requerir remuestreo desde otras frecuencias comunes (44,1 kHz o 48 kHz).

## Comparativa con modelos similares

| Modelo | Tarea | Idioma | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tintitu/sherpa-streaming-zipformer-small-ctc-zh-int8` (este modelo) | ASR streaming | chino | ONNX INT8 | no aplica | no disponible | HuggingFace (repo del tercero) |
| Variante no cuantizada del mismo Zipformer Small CTC zh | ASR streaming | chino | ONNX (FP32) | no aplica | sujeta al upstream | upstream `k2-fsa/sherpa-onnx` |
| Otras variantes Zipformer de `k2-fsa/sherpa-onnx` | ASR streaming | varios | ONNX | no aplica | sujeta al upstream | upstream `k2-fsa/sherpa-onnx` |
| Whisper (variantes small/medium) | ASR (principalmente no streaming) | multilingue | varios (incl. GGUF, ONNX) | no aplica | MIT / Apache-2.0 segun variante | amplia |

No se dispone de datos comparativos de precision (WER/CER), latencia o throughput entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales. Se recomienda verificar la disponibilidad y licencia de cada variante en su publicacion original.

## Limitaciones y advertencias

- Licencia no declarada: la model card advierte explicitamente de que no debe asumirse Apache-2.0 ni ninguna otra licencia sin verificar los terminos del proyecto upstream y de los propietarios de los pesos y el vocabulario. El uso comercial queda, por tanto, sujeto a dicha verificacion.
- Redistribucion de terceros: este repositorio no ha entrenado el modelo; la autoria de los pesos y el vocabulario corresponde a sus titulares originales, y el publicador recomienda conservar avisos de copyright y atribucion.
- Sesgos: el modelo esta entrenado unicamente para chino; no se documentan evaluaciones de sesgo por acento, dialecto, genero o edad. No hay informacion al respecto.
- Riesgo de error de transcripcion: al ser un modelo ASR, puede producir errores en presencia de ruido de fondo, solapamiento de hablantes, audio lejano del microfono o terminologia especializada. No se han publicado tasas de error.
- Ausencia de puntuacion y normalizacion: no se documenta capacidad de insertar signos de puntuacion, mayusculas ni de normalizar numeros o fechas.
- Idioma unico: no soporta otros idiomas distintos del chino segun la model card.
- Dependencia de la frecuencia de muestreo: el modelo espera audio a 16 kHz; alimentarlo con otra frecuencia sin remuestreo degradara el resultado.
- Modelo de voz, no de lenguaje: no puede realizar tareas de generacion de texto, razonamiento, codigo o tool calling.
- Ficheros no verificados en este analisis: se recomienda comprobar el tamano y el SHA256 tras la descarga, tal como indica el propio autor.
- Fecha de creacion inusual: el repositorio figura creado el 2026-09-11, dato que puede deberse a un error de metadatos; conviene verificar la version fijando un commit concreto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas etiquetados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tintitu/sherpa-streaming-zipformer-small-ctc-zh-int8
- Proyecto upstream `k2-fsa/sherpa-onnx`: https://github.com/k2-fsa/sherpa-onnx
- Documentacion de `sherpa-onnx`: https://k2-fsa.github.io/sherpa/onnx/index.html
- Artefacto original (release upstream): https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-zipformer-small-ctc-zh-int8-2025-04-01.tar.bz2
