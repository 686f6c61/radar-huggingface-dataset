# Yaredoffice/hohe-asr-amharic-onnx-int8

## Resumen

Hohe ASR Amharic ONNX INT8 es una version cuantizada y empaquetada en formato ONNX del modelo de reconocimiento automatico del habla `snapwre/hohe-asr-amharic`, un sistema CTC en amharico construido sobre la arquitectura Wav2Vec2-BERT. Lo publica el usuario Yaredoffice y no constituye un entrenamiento nuevo, sino una derivacion orientada a CPU del checkpoint original: exportacion a ONNX y cuantizacion dinamica INT8 de los pesos de las capas `MatMul` y `Gemm` mediante ONNX Runtime.

El problema que resuelve es el coste de inferencia del modelo original en FP32 (2,425 GB en ONNX) sobre hardware sin GPU. Con pesos INT8 por canal y rango reducido, pensados para CPUs AVX2 sin soporte VNNI, el grafo resultante ocupa 878 MB y alcanza velocidades superiores al tiempo real incluso en un Intel Core i5-8350U de cuatro nucleos, algo relevante para despliegues de transcripcion en el borde, sin acelerador dedicado y en escenarios de bajos recursos.

El modelo mantiene el tokenizador, el frontend de 16 kHz, el vocabulario de 416 tokens y el comportamiento de decodificacion CTC del modelo origen, y hereda la licencia CC BY 4.0. Esta especializado exclusivamente en amharico y no anade puntuacion ni mayusculas. Su publicacion es reciente y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT con cabecera CTC (`Wav2Vec2BertForCTC`) |
| Parametros totales | no disponible (el modelo base declarado desciende de `badrex/Ethio-ASR-multilingual-600M`, cuyo nombre indica 600 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se declara ventana maxima; se han medido fragmentos de 2, 10 y 22 s de audio) |
| Tipos de cuantizacion | INT8 dinamica por canal con signo y rango reducido para `MatMul` y `Gemm`; las capas de convolucion permanecen en FP32 (ONNX Runtime no dispone del kernel 1-D `ConvInteger` en el proveedor de CPU) |
| Idiomas soportados | amharico (`am`) unicamente |
| Licencia | CC BY 4.0 (heredada del modelo origen) |
| Formato de pesos | ONNX (`model.onnx`); incluye `assets/frontend.npz`, `assets/meta.json` y ficheros de configuracion de tokenizador y preprocesador de Hugging Face |

## Arquitectura y entrenamiento

La arquitectura subyacente es Wav2Vec2-BERT, un transformer de audio auto-supervisado, con una cabeza de clasificacion CTC para reconocimiento de habla. El autor de esta publicacion no ha realizado ningun entrenamiento: ha exportado el checkpoint `snapwre/hohe-asr-amharic` a ONNX y ha aplicado cuantizacion dinamica con ONNX Runtime sobre los pesos de `MatMul` y `Gemm`, usando INT8 con signo, por canal y con rango reducido, una configuracion elegida para CPUs AVX2 sin VNNI. Las convoluciones se mantienen en FP32 por limitaciones del proveedor de CPU de ONNX Runtime. No se ha modificado el tokenizador (416 tokens), el frontend de 16 kHz ni la logica de decodificacion CTC.

En cuanto a los datos, el modelo original se asocia al dataset `google/fleurs` en su particion amharica `am_et`, y desciende del modelo multilingue etiope `badrex/Ethio-ASR-multilingual-600M`. No se detalla en la informacion disponible el volumen de tokens de audio, la composicion exacta del dataset de entrenamiento ni si se aplicaron etapas de RLHF o DPO (poco habituales en ASR CTC). La innovacion tecnica de esta ficha es, por tanto, de despliegue: cuantizacion INT8 compatible con AVX2 sin VNNI, un frontend reimplementado en NumPy que replica el `SeamlessM4TFeatureExtractor` de Hugging Face y un paquete de evidencias de paridad y rendimiento medibles.

## Capacidades

- Reconocimiento automatico del habla en amharico a partir de audio mono a 16 kHz.
- Salida de logits CTC; la decodificacion greedy es responsabilidad del consumidor del modelo.
- Frontend de 160 bins que replica el preprocesador de Wav2Vec2-BERT; los pesos del frontend se distribuyen en `assets/frontend.npz`.
- Manejo de audio por fragmentos de distinta duracion (se han medido fragmentos de 2, 10 y 22 segundos).
- Token de idioma inicial `[AMH]` en la salida, que debe eliminarse tras la decodificacion; es un remanente del origen multilingue del modelo.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni razonamiento multi-paso.
- No genera puntuacion ni mayusculas, y no cubre idiomas distintos del amharico.

## Casos de uso

- Transcripcion de audio en el borde: el modelo ocupa 878 MB y se ejecuta a velocidad superior al tiempo real en una CPU de portatil de cuatro nucleos, lo que permite integrarlo en dispositivos sin GPU para transcribir notas de voz o reuniones en amharico.
- Servicios de subtitulado para contenido en amharico: con fragmentos de 10 s procesados a 1,73x el tiempo real, es viable generar subtitulos por lotes en servidores CPU de bajo coste.
- Digitalizacion de archivo sonoro en amharico: la combinacion de licencia CC BY 4.0 y ejecucion local facilita procesar fondos documentales de radio o television sin enviar el audio a servicios externos.
- Atencion al cliente en centros de contacto: transcripcion previa de llamadas para su indexacion y busqueda posterior, siempre que se asuma la ausencia de puntuacion y la tasa de error del 6,6 % CER medida.
- Aplicaciones de accesibilidad: dictado y conversion de voz a texto en amharico dentro de aplicaciones de escritorio, apoyandose en ONNX Runtime y en la ausencia de dependencias de red.
- Investigacion en ASR de bajos recursos: el repositorio incluye evidencia de paridad (`benchmarks/parity.json`) y tiempos brutos (`benchmarks/speed.log`) que permiten reproducir y auditar el efecto de la cuantizacion INT8 sobre un modelo FP32.
- Preprocesado de pipelines de NLP en amharico: transcripcion como primer paso antes de tareas de traduccion, clasificacion o analisis de topicos sobre texto amharico.
- Despliegue en entornos aislados o sin conectividad: al ser un grafo ONNX autocontenido con frontend en NumPy, no requiere CDN ni acceso a red durante la inferencia.

## Benchmarks y rendimiento

Mediciones realizadas por el autor en un Intel Core i5-8350U (4 nucleos / 8 hilos, AVX2 sin VNNI) con 4 hilos de ONNX Runtime. La velocidad se expresa como segundos de audio procesados por segundo de computo; por encima de 1,00x es mas rapido que el tiempo real. Se reporta la mejor ronda observada de varias rondas rotadas.

| Variante | Tamano | Carga | Fragmento 2 s | Fragmento 10 s | Fragmento 22 s | CER | WER | Coincidencia exacta vs FP32 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| INT8 publicada | 878 MB | 2,7 s | 2,43x | 1,73x | 1,22x | 6,625 % | 21,094 % | 83,33 % |
| INT8 por tensor (experimento) | 877 MB | 2,4 s | 2,46x | 1,72x | 1,17x | 6,418 % | 20,703 % | 70,83 % |
| INT8 con cabeza CTC en FP32 | 880 MB | 3,0 s | 1,79x | 1,74x | 1,24x | 6,625 % | 21,094 % | 83,33 % |
| Referencia ONNX FP32 | 2,425 GB | 6,7 s | 1,28x | 0,97x | no reportado | 6,522 % | 21,094 % | 100 % |

Evidencia de paridad adicional: el grafo INT8 publicado alcanza un 97,6 % de coincidencia en el argmax a nivel de frame con el modelo PyTorch sobre entradas aleatorias identicas, con una divergencia KL media de las posteriores de 0,08281. El frontend en NumPy replica el `SeamlessM4TFeatureExtractor` de Hugging Face con una diferencia absoluta maxima de 9,537e-7 para las caracteristicas de filterbank en bruto y de 1,073e-5 para las entradas del modelo.

Metodologia de precision: subconjunto de 24 clips (5,8 minutos) del split de test `am_et` de Google FLEURS, seleccionados por duracion ascendente dentro de un presupuesto de audio; puntuacion CER/WER de corpus tras normalizacion de homofonos en ge'ez y eliminacion de etiquetas de idioma y puntuacion. El resultado completo de 516 clips del modelo original es 6,28 % CER / 17,86 % WER, y corresponde al modelo fuente, no a esta version cuantizada.

## Requisitos de hardware

- Memoria: el grafo INT8 ocupa 878 MB en disco; la referencia FP32 en ONNX ocupa 2,425 GB. La maquina de prueba tenia 16 GB de RAM y sufrio paginacion intensa con FP32 y fragmentos de 22 s.
- GPU: no se recomienda ninguna en particular; el modelo esta optimizado para CPU. No se han publicado mediciones con proveedores CUDA o TensorRT de ONNX Runtime.
- CPU de referencia: Intel Core i5-8350U, 4 nucleos / 8 hilos, AVX2 sin VNNI. El autor indica que el rango reducido de los pesos INT8 se eligio precisamente para este tipo de CPU.
- Cabe en hardware de consumo: si, en cualquier CPU moderna de portatil o escritorio con AVX2 y al menos 2-4 GB de RAM libre para la variante INT8.
- Opciones de despliegue: ONNX Runtime con el proveedor de ejecucion de CPU. El repositorio incluye un visor de benchmarks local (`benchmark-site/performance.html`) sin dependencias de red. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea. Se incluye una implementacion local de STT en Hohe que consume `assets/frontend.npz`.
- Latencia y throughput: 2,43x sobre tiempo real con fragmentos de 2 s, 1,73x con 10 s y 1,22x con 22 s en el equipo de prueba. El tiempo de carga del grafo es de 2,7 s.
- Advertencia de medicion: el throttling termico produjo hasta un 3,75x de dispersion entre rondas, por lo que las cifras son especificas de esa maquina y no una garantia universal.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Precision reportada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Hohe ASR Amharic ONNX INT8 (esta ficha) | no disponible | amharico | 6,625 % CER / 21,094 % WER en subconjunto de 24 clips | CC BY 4.0 | ONNX INT8, 878 MB | Hugging Face, 0 descargas |
| `snapwre/hohe-asr-amharic` (origen) | no disponible | amharico | 6,28 % CER / 17,86 % WER en 516 clips | CC BY 4.0 | PyTorch FP32 | Hugging Face |
| `badrex/Ethio-ASR-multilingual-600M` (base aguas arriba) | 600 M segun el nombre del repositorio | multilingue etiope | no disponible | no disponible | no disponible | Hugging Face |
| Referencia ONNX FP32 del mismo modelo | no disponible | amharico | 6,522 % CER / 21,094 % WER en subconjunto de 24 clips | CC BY 4.0 | ONNX FP32, 2,425 GB | Incluida solo como comparacion en las mediciones |

No se dispone de datos comparativos frente a modelos ASR multilingues genericos (por ejemplo, la familia Whisper) en la informacion proporcionada: no hay cifras de CER o WER en amharico para esos sistemas en este material, por lo que no se incluyen estimaciones.

## Limitaciones y advertencias

- Cuantizacion con perdida de fidelidad: solo el 83,33 % de las transcripciones coinciden exactamente con la referencia FP32 en la muestra medida; si se requiere maxima fidelidad, debe usarse el checkpoint FP32 original.
- Subconjunto de evaluacion no representativo: 24 clips seleccionados por duracion ascendente (no aleatorios) no sustituyen a la evaluacion completa del modelo origen ni constituyen una estimacion estadisticamente valida.
- Idioma unico: el modelo solo cubre amharico y rinde peor en conversacion espontanea, habla solapada y cualquier idioma distinto del amharico.
- Sin puntuacion ni mayusculas: la salida CTC no incluye signos de puntuacion ni distincion de mayusculas, lo que exige postprocesado si se busca texto legible.
- Sesgos: no se documentan analisis de sesgo por variedad dialectal, genero, edad o acento dentro del amharico.
- Alucinacion: no se documentan tasas de insercion ni comportamiento del modelo ante silencios prolongados, ruido o audio no vocal; el riesgo de transcripciones espurias no esta cuantificado.
- Mediciones dependientes del hardware: los datos de velocidad proceden de un unico equipo con AVX2 sin VNNI y mostraron hasta 3,75x de variacion por throttling termico; en otras CPU, runtimes, duraciones de fragmento y dominios de audio los resultados diferiran.
- Restricciones de licencia: CC BY 4.0 permite uso comercial, pero exige atribucion al modelo original, a sus creadores (Chapi y los contribuidores de Dataset.ET), al modelo base aguas arriba y al trabajo de cuantizacion.
- Adopcion nula registrada: el repositorio figura con 0 descargas y 0 likes, por lo que no existe validacion independiente de terceros sobre estas cifras.
- No apto para otras tareas: no realiza traduccion, sintesis de voz, diarizacion ni comprension semantica del audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yaredoffice/hohe-asr-amharic-onnx-int8
- Modelo original: https://huggingface.co/snapwre/hohe-asr-amharic
- Modelo base aguas arriba: https://huggingface.co/badrex/Ethio-ASR-multilingual-600M
- Dataset de evaluacion: https://huggingface.co/datasets/google/fleurs
- ONNX Runtime (herramienta de cuantizacion): https://onnxruntime.ai/
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; las referencias obtenidas no guardaban relacion con la ficha.
