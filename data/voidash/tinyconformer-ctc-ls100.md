# voidash/tinyconformer-ctc-ls100

## Resumen

tinyconformer-ctc-ls100 es un modelo de reconocimiento automatico del habla (ASR) de tamano minimo publicado por el usuario voidash en HuggingFace. Se trata de un Conformer con cabecera CTC a nivel de caracter (char-level CTC), es decir, el modelo emite directamente caracteres en lugar de subpalabras BPE o fonemas, y se ha entrenado sobre el subconjunto train.clean.100 de LibriSpeech (aproximadamente 100 horas de audio de audiolibros en ingles). La model card lo describe explicitamente como un piloto, no como un sistema listo para produccion.

La cifra de parametros es de 978.461 segun la model card y de 979.357 segun los pesos almacenados en safetensors, por debajo del millon de parametros. El entrenamiento se realizo, segun el autor, con un presupuesto de computo de 2 dolares, y la decodificacion es greedy sin modelo de lenguaje externo. Su relevancia es fundamentalmente didactica y experimental: sirve como linea base de bajo coste para estudiar hasta donde llega un Conformer sub-1M en tareas de ASR.

Los resultados publicados son muy pobres en terminos absolutos: 68,45 % de WER y 26,97 % de CER en test.clean, y 82,50 % de WER y 39,68 % de CER en test.other. Esto lo situa lejos de cualquier umbral de uso practico en transcripcion, pero lo convierte en un caso de estudio util sobre limites de escala, presupuesto de computo y decodificacion sin modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (transformer aumentado con convoluciones) con cabecera CTC a nivel de caracter |
| Parametros totales | 979.357 segun safetensors; 978.461 segun la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo contiene pesos safetensors (viables FP32, FP16 e INT8 por tamano) |
| Idiomas soportados | no disponible; el corpus de entrenamiento (LibriSpeech train.clean.100) es ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,0 GB |
| Decodificacion | greedy, sin modelo de lenguaje |
| Fecha de publicacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Conformer, propuesta que combina bloques de autoatencion tipo transformer con modulos convolucionales para capturar dependencias locales en la senal de audio. Sobre la torre de codificacion se anade una cabecera CTC (Connectionist Temporal Classification) a nivel de caracter, lo que permite entrenar sin alineaciones foneticas explicitas y decodificar de forma greedy. No se dispone de informacion sobre el numero de capas, dimension del modelo, numero de cabezas de atencion, tamano del kernel convolucional, estrategia de submuestreo temporal ni parametros de la funcion de perdida mas alla de lo indicado.

Los datos de entrenamiento corresponden a LibriSpeech train.clean.100, un subconjunto de lectura de audiolibros en ingles de dominio publico, con habla relativamente limpia y sin ruido de fondo significativo. El autor indica que el entrenamiento completo se realizo con un presupuesto de computo de 2 USD, y que no se empleo modelo de lenguaje en la decodificacion. No consta informacion sobre composicion exacta del dataset, numero de epochs, esquema de aumentacion de datos, uso de especulacion, atencion lineal ni tecnicas de RLHF o DPO, que en un modelo CTC de este tipo no serian de aplicacion habitual.

## Capacidades

- Reconocimiento de voz en ingles para audio de lectura limpia, con salida a nivel de caracter mediante CTC.
- Decodificacion greedy, sin reestimacion con modelo de lenguaje ni beam search.
- Modelo extremadamente ligero (menos de 1 M de parametros), apto para ejecucion en CPU y dispositivos con recursos muy limitados.
- No dispone de soporte de tool calling ni de function calling.
- No implementa capacidades de agente, planificacion ni razonamiento multi-paso.
- No es un modelo de generacion de texto: no produce lenguaje natural salvo la transcripcion de la entrada de audio.
- No soporta vision, audio generativo ni modo de razonamiento explicito.
- Cobertura multilingue: no disponible; el entrenamiento se limita a un corpus en ingles.
- No se documentan capacidades de puntuacion, capitalizacion, diarizacion ni marcas de tiempo.

## Casos de uso

- Docencia de CTC y arquitecturas Conformer: el modelo es lo bastante pequeno (menos de 1 M de parametros) para inspeccionar pesos, reproducir el entrenamiento en una unica GPU o incluso en CPU y estudiar como afecta el presupuesto de computo al WER.
- Linea base (baseline) en experimentos de ASR de bajo coste: sirve como referencia inferior contra la que medir mejoras de arquitectura, aumentacion de datos o decodificacion con modelo de lenguaje.
- Prototipado de pipelines de audio: permite validar el cableado completo (carga de WAV, extraccion de caracteristicas, inferencia, calculo de WER/CER) antes de sustituir el modelo por uno de mayor calidad.
- Pruebas de integracion en dispositivos embebidos: con menos de 4 MB en FP32 cabe en microcontroladores de gama alta y en placas tipo Raspberry Pi, util para medir latencia y consumo en el extremo del espectro.
- Investigacion sobre decodificacion sin modelo de lenguaje: al publicar el autor que usa greedy decoding puro, es un punto de partida controlado para cuantificar cuanto aporta anadir un LM o beam search.
- Analisis de limites de escala: el salto de 68,45 % de WER en test.clean a 82,50 % en test.other documenta la sensibilidad de un modelo minusculo al cambio de dominio y al hablante.
- Generacion de datos sinteticos de error: las transcripciones degradadas del modelo pueden usarse para estudiar tecnicas de correccion de errores o de rescoring en investigacion, siempre con la advertencia de que la calidad de partida es muy baja.
- No se recomienda su uso en transcripcion de produccion, subtitulado, asistentes de voz ni atencion al cliente, dado el nivel de error publicado.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Split | WER | CER | Palabras evaluadas |
|---|---|---|---|
| test.clean | 68,45 % | 26,97 % | 52.576 |
| test.other | 82,50 % | 39,68 % | 52.343 |

No se han publicado en la informacion disponible comparaciones con otros modelos, resultados en otros conjuntos de evaluacion, ni curvas de entrenamiento. La diferencia entre CER y WER sugiere que el modelo acierta caracteres sueltos con mas frecuencia que palabras completas, comportamiento tipico de un CTC a nivel de caracter sin modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,9 MB en FP32, 2,0 MB en FP16 y 1,0 MB en INT8, solo para los pesos; el consumo real dependera del runtime y del buffer de caracteristicas acusticas.
- GPU recomendadas: cualquier GPU con soporte CUDA es sobredimensionada para este modelo; desde una GTX 1050 o una RTX 3060 en adelante el cuello de botella sera la carga de datos, no el computo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en iGPU y CPU.
- Despliegue en CPU: viable, con latencia del orden de milisegundos por utterance para audios cortos.
- Opciones de despliegue: PyTorch nativo, exportacion a ONNX Runtime, TorchScript o sherpa-onnx si el checkpoint es compatible. vLLM, TGI y otros servidores orientados a LLM no son aplicables, ya que no se trata de un modelo generativo de texto.
- Latencia y throughput: no disponible; no se publican mediciones de RTF (real-time factor) ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Datos de entrenamiento | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| tinyconformer-ctc-ls100 | Conformer + CTC a nivel de caracter | 979.357 | LibriSpeech train.clean.100 | no disponible | WER 68,45 % (test.clean), 82,50 % (test.other) |
| wav2vec 2.0 base | SSL + CTC a nivel de caracter/fonema | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |
| Whisper tiny / base | Encoder-decoder transformer | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |
| Conformer-CTC de NVIDIA NeMo | Conformer + CTC | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |

La busqueda web realizada no devolvio informacion tecnica utilizable sobre estos modelos ni sobre el modelo analizado: los unicos resultados obtenidos fueron paginas de inicio del servicio YouTube, sin relacion con la ficha. Por tanto, no se dispone de cifras comparativas verificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad muy baja: un WER del 68,45 % en el split mas limpio implica que mas de dos de cada tres palabras se transcriben mal; el modelo no es apto para uso en produccion.
- Degradacion severa fuera de dominio: el WER sube al 82,50 % en test.other, lo que refleja una generalizacion muy pobre a hablantes y condiciones distintas de las del entrenamiento.
- Ausencia de modelo de lenguaje: al usar decodificacion greedy pura, no hay correccion contextual de errores, lo que penaliza especialmente a la salida a nivel de caracter.
- Sesgos previsibles: entrenado solo con LibriSpeech, un corpus de audiolibros en ingles de dominio publico, el modelo tendra un sesgo fuerte hacia voces de lectura, ingles estadounidense y condiciones acusticas limpias; no hay informacion sobre representacion de acentos, genero o variedades dialectales.
- Riesgo de alucinacion: en modelos CTC la salida esta restringida al vocabulario de caracteres, pero si existe riesgo de omisiones, repeticiones y sustituciones sistematicas en tramos de audio no vistos.
- Limitaciones de idioma y contexto: no hay datos sobre idiomas soportados mas alla del corpus de entrenamiento en ingles, ni sobre la ventana temporal maxima de audio procesable.
- Licencia no especificada: la ausencia de licencia explicita impide determinar si se permite el uso comercial; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Advertencia de procedencia: el campo de fecha de creacion del repositorio (2026-09-10) figura tal cual en la informacion proporcionada y no se ha podido verificar.
- Reproducibilidad: no se publican hiperparametros, configuracion de entrenamiento ni el codigo utilizado, lo que dificulta reproducir los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/voidash/tinyconformer-ctc-ls100
- No se han encontrado otros enlaces relevantes (papers, repositorios, demos o blogs) en la busqueda web realizada; los unicos resultados devueltos fueron paginas del servicio YouTube sin relacion con el modelo.
- Referencia externa sobre la arquitectura, no citada en la model card: Gulati et al., "Conformer: Convolution-augmented Transformer for Speech Recognition" (arXiv:2005.08100).
