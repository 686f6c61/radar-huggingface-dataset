# yayaiu6/Verto-Arabic-ASR

## Resumen

Verto Arabic ASR es un modelo de reconocimiento automático del habla (ASR) para árabe egipcio y habla mixta árabe-inglés, distribuido como ONNX INT8 y pensado para ejecutarse íntegramente en el navegador. Lo publica el usuario yayaiu6 bajo el identificador `yayaiu6/Verto-Arabic-ASR`, y no es un modelo entrenado desde cero: se trata de una conversión a INT8 del checkpoint Metro-ASR-Small (`mohammedaly22/Metro-ASR-Small`), con la integración de navegador y el preprocesado de audio añadidos por Verto.

El modelo emplea una arquitectura Conformer con decodificación CTC voraz y un tamaño reducido: el archivo ONNX ocupa 69,46 MB y el paquete completo con tokenizador y activos de audio llega a 69,93 MB. La cuantización es weight-only INT8 con activaciones FP32, de modo que parte de los pesos permanece en FP32. Está pensado para audio de 0,5 a 60 segundos, con ejecución por CPU/WASM como opción por defecto y WebGPU opcional con retroceso a CPU.

Su relevancia práctica está en el despliegue: permite transcripción local en el navegador sin enviar audio a un servidor, con una reducción de tamaño del 70,92 % respecto al checkpoint FP32 original y un coste medido de solo 0,041 puntos porcentuales de WER en el conjunto global de evaluación. Es, por tanto, una pieza útil para aplicaciones web de dictado o subtitulado en árabe egipcio, no un modelo de propósito general multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con decodificacion CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; audio de entrada limitado a 0,5-60 segundos en la aplicacion de navegador |
| Tipos de cuantizacion | INT8 weight-only con activaciones FP32 (algunos pesos permanecen en FP32) |
| Idiomas soportados | arabe (ar), ingles (en); enfocado a arabe egipcio y code-switching arabe-ingles |
| Licencia | MIT |
| Formato de pesos | ONNX (INT8); tokenizer.json propio de la aplicacion, no en formato Hugging Face Tokenizers |

## Arquitectura y entrenamiento

El modelo es un Conformer CTC, es decir, un transformer convolucional con cabecera de clasificacion Connectionist Temporal Classification y decodificacion voraz, sin KenLM ni marcas de tiempo. Verto no aporta entrenamiento nuevo: parte del checkpoint Metro-ASR-Small en su revision `525644dc782b6627f1eb1f0a589407fcacbfc152` y aplica una cuantizacion de solo pesos a INT8 manteniendo las activaciones en FP32. No se dispone de informacion sobre el volumen de tokens, la composicion del dataset de entrenamiento original ni sobre si hubo RLHF o DPO.

La innovacion tecnica del paquete es la integracion: el modelo se sirve mediante ONNX Runtime Web con preprocesado de audio propio (audio mono a 16 kHz convertido a caracteristicas log-Mel de 80 bins) y decodificacion de texto propia. Las entradas del grafo son `features` float32 `[1, T, 80]` y `feature_lengths` int64 `[1]`; las salidas son `log_probs` float32 `[1, T_out, V]` y `output_lengths` int64 `[1]`. El tokenizador incluido es una tabla de piezas de la aplicacion, no un tokenizador compatible con Transformers.js, por lo que el modelo no funciona como pipeline directo de esa libreria.

## Capacidades

- Reconocimiento de voz en arabe egipcio y en habla mixta arabe-ingles (code-switching).
- Transcripcion de audio de 0,5 a 60 segundos por peticion en la aplicacion de navegador.
- Ejecucion local en el dispositivo mediante ONNX Runtime Web, con CPU/WASM por defecto y WebGPU opcional con retroceso a CPU.
- Decodificacion CTC voraz sin modelo de lenguaje externo (sin KenLM).
- Uso directo del grafo ONNX con preprocesado propio (log-Mel de 80 bins) para integraciones fuera del navegador.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio generativo; es exclusivamente un modelo ASR.

## Casos de uso

- Dictado en aplicaciones web en arabe egipcio: el modelo se carga en el navegador y transcribe fragmentos de hasta 60 segundos sin enviar el audio a un servidor, lo que simplifica el cumplimiento de privacidad.
- Subtitulado de clips cortos en redes sociales o videos de menos de un minuto: la ventana de 0,5-60 segundos encaja con clips y permite generar subtitulos en el propio cliente.
- Asistentes de voz para interfaces web en Egipto: la combinacion de arabe e ingles cubre el habla mixta habitual en entornos tecnicos y comerciales.
- Busqueda por voz en catálogos o archivos: transcripcion local del audio de consulta y envio solo del texto al backend, reduciendo coste de ancho de banda y de inferencia en servidor.
- Prototipado e investigacion en ASR de bajo recursos: el paquete ONNX de 69,46 MB permite experimentar con decodificacion CTC y preprocesado log-Mel en entornos sin GPU.
- Aplicaciones offline o con conectividad limitada: al ejecutarse con WASM en el navegador, no requiere infraestructura de inferencia remota una vez servidos los activos.
- Evaluacion comparativa de cuantizacion: sirve como referencia reproducible para medir el impacto de INT8 weight-only frente al checkpoint FP32 en tareas ASR.

## Benchmarks y rendimiento

Evaluacion frente al checkpoint Metro FP32 original sobre 6.726 grabaciones de Casablanca (7,70 horas), con el evaluador del Open Universal Arabic ASR Leaderboard y CTC voraz sin KenLM. Tasas de error mas bajas son mejores.

| Metrica | FP32 original | Verto INT8 |
|---|---:|---:|
| WER — ocho dialectos | 75,408% | 75,449% |
| CER — ocho dialectos | 41,847% | 41,875% |
| WER — arabe egipcio (825 grabaciones) | 30,678% | 31,115% |
| Tamano del archivo de inferencia | 238,84 MB | 69,46 MB |

El archivo es un 70,92 % mas pequeno, con incrementos de WER de 0,041 puntos porcentuales en el conjunto global y de 0,437 puntos en arabe egipcio. Ambas versiones presentan tasas de error elevadas en varios de los otros dialectos. El autor no ha medido velocidad, memoria ni rendimiento en navegador, y advierte que estos resultados no garantizan la misma precision en otros audios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para ejecucion en CPU/WASM en el navegador, sin requisito de GPU.
- GPU recomendadas: no aplica como requisito; WebGPU es opcional y cuenta con retroceso a CPU.
- Cabe en cualquier equipo capaz de ejecutar un navegador moderno con ONNX Runtime Web; el paquete de activos ocupa 69,93 MB.
- Opciones de despliegue: aplicacion web servida desde el repositorio de GitHub con ONNX Runtime Web; despliegue en Docker sin necesidad de Node ni npm; uso directo del grafo ONNX con preprocesado propio.
- Latencia y throughput: no disponibles; el autor indica explicitamente que no se han medido el rendimiento ni la velocidad en navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Verto Arabic ASR | no disponible | 0,5-60 s (aplicacion web) | ar, en | MIT | ONNX INT8 |
| Metro-ASR-Small (FP32) | no disponible | no disponible | ar, en | MIT | checkpoint original (238,84 MB) |
| Alternativas ASR multilingues de gran tamano (p. ej. Whisper) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible con el checkpoint del que deriva: Verto INT8 reduce el tamano un 70,92 % con un incremento de WER de 0,041 puntos en el conjunto global y de 0,437 en egipcio. No se dispone de datos de benchmarks frente a otros modelos ASR en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de vista previa: evaluado contra transcripciones de referencia de Casablanca; la precision varia con ruido, dialecto y vocabulario no habitual, y no se garantiza la misma exactitud que el modelo original.
- Tasas de error altas en varios dialectos arabes distintos del egipcio (WER global del 75,449 % sobre los ocho dialectos evaluados).
- Decodificacion CTC voraz sin KenLM ni marcas de tiempo, lo que limita la calidad frente a sistemas con modelo de lenguaje.
- Ventana de audio limitada a 0,5-60 segundos en la aplicacion de navegador; no esta pensado para transcripciones largas continuas.
- No es un pipeline directo de Transformers.js y su tokenizer.json no sigue el formato de Hugging Face Tokenizers, lo que complica la integracion con ecosistemas estandar.
- No se han medido velocidad, memoria ni rendimiento en navegador; el comportamiento en produccion bajo carga es desconocido.
- Licencia MIT, que permite uso comercial, pero se mantiene la atribucion original y la licencia del modelo base; conviene revisar el aviso de licencia incluido en el repositorio.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos no egipcios o mezcla de idiomas atipica; se recomienda validacion humana en flujos criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yayaiu6/Verto-Arabic-ASR
- Demo: https://verto-arabic-asr.yahya-mahroof.site/
- Colab: https://huggingface.co/yayaiu6/Verto-Arabic-ASR/colab
- Codigo y despliegue: https://github.com/yayaiu6/Verto-Arabic-ASR
- Benchmark y metodologia: https://github.com/yayaiu6/Verto-Arabic-ASR/blob/main/BENCHMARK.md
- Resultados en CSV: https://github.com/yayaiu6/Verto-Arabic-ASR/blob/main/benchmark-results.csv
- Modelo base: https://huggingface.co/mohammedaly22/Metro-ASR-Small
