# talkxo/sangam-coreml

## Resumen

Sangam (Core ML) es un modelo de reconocimiento automatico del habla (ASR) especializado en hindi y hinglish, la variante de hindi con mezcla de ingles que se usa coloquialmente en la India. Lo desarrolla el autor talkxo para la app Saymore de macOS, y esta publicado en Hugging Face como un paquete de ficheros Core ML compilados que la aplicacion descarga cuando el usuario selecciona hindi como idioma de dictado. El modelo transcribe palabras hindi en grafia devanagari y palabras inglesas en alfabeto latino, lo que lo hace adecuado para dictado real en contextos bilingues.

Tecnicamente es un transducer (RNN-T) con encoder Conformer de 17 capas, 512 dimensiones y atencion de posicion relativa, unos 115 millones de parametros y un vocabulario de 641 piezas (256 word pieces hindi, 384 latinas y el token blank). Los pesos publicados son la variante `n3-slang1` en 16 bits, convertida con coremltools 9.0, y estan divididos en tres submodelos: encoder, red de prediccion (LSTM) y joiner.

Su relevancia actual reside en que demuestra que una conversion a Core ML para el Neural Engine de Apple no degrada la calidad medible: sobre el test publico hindi del Open ASR Leaderboard (753 clips, 1,33 horas, 468 hablantes) obtiene un 8,85 % de OIWER, practicamente identico al 8,86 % del modelo original en PyTorch, con 234 MB en disco y unos 59 ms por clip de encoder en un M4 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer (RNN-T) con encoder Conformer de 17 capas, 512 dimensiones, atencion de posicion relativa |
| Parametros totales | Aproximadamente 115 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 15 s (entrada mel [1, 80, 1501]) |
| Tipos de cuantizacion | 16 bits (publicado); 32 bits disponible en el modelo original; 8 bits mencionado pero no publicado |
| Idiomas soportados | Hindi (devanagari) e ingles (alfabeto latino), incluido hinglish |
| Licencia | No disponible |
| Formato de pesos | Core ML compilado (`.mlmodelc`); el original en PyTorch no se distribuye en este repositorio |

## Arquitectura y entrenamiento

El modelo es un transducer estandar con encoder Conformer de 17 capas y anchura 512, con atencion de posicion relativa. La red de prediccion es una LSTM de una sola capa de 640 dimensiones que se ejecuta paso a paso, y el joiner combina las representaciones del encoder y del predictor para producir logits sobre 641 piezas de vocabulario. La proyeccion del encoder hacia el joiner esta plegada dentro de `SangamEncoder.mlmodelc`, y la del predictor dentro de `SangamDecoder.mlmodelc`, de modo que el joiner es un modulo minimo de 0,8 MB.

Segun la model card, la familia se retreno a partir de AI4Bharat IndicConformer Hindi (la version CTC de esa familia obtiene 15,40 % en el mismo test) y esta variante concreta, `n3-slang1`, incorpora un ajuste fino orientado a slang y code-switching. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; el unico dataset citado es el de evaluacion (VoiceArena/MonsoonASR-Open-ASR-leaderboard-hi-IN, CC BY 4.0). La innovacion tecnica destacable es la conversion a Core ML con precision mixta: a 32 bits la salida es identica a PyTorch en los 753 clips, y a 16 bits las diferencias son estables y atribuibles a la aritmetica de 16 bits y al Neural Engine, no a la conversion.

## Capacidades

- Reconocimiento automatico del habla en hindi y hinglish, con salida mixta: devanagari para palabras hindi y alfabeto latino para palabras inglesas.
- Ejecucion completamente on-device en Apple Silicon (Neural Engine, GPU o CPU), sin dependencia de servicios en la nube.
- Decodificacion greedy integrada en el flujo transducer (encoder, decoder y joiner), sin modelo de lenguaje externo ni postprocesado de texto.
- Manejo de clips de hasta 15 s por ventana de audio, con longitud real indicada mediante la entrada `length`.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del ASR.
- No se documenta un modo de razonamiento o "thinking mode".

## Casos de uso

- Dictado en macOS: la app Saymore descarga estos ficheros cuando el usuario elige hindi, y el modelo transcribe en tiempo real sobre el Neural Engine con unos 59 ms de encoder por clip de 15 s, lo que permite una experiencia de dictado fluida.
- Transcripcion de reuniones bilingues hindi-ingles: el modelo mantiene la grafia original de cada palabra (devanagari o latina), lo que facilita la revision posterior por hablantes que alternan ambos idiomas.
- Subtitulado de contenido audiovisual: con 8,85 % de OIWER sobre el test publico hindi, es adecuado para generar subtitulos que luego se revisan manualmente, con un coste de error inferior al de alternativas como IndicConformer CTC (15,40 %) o SraVaani 1.0 (11,11 %).
- Asistentes de voz integrados en aplicaciones de escritorio: al ser un paquete Core ML de 234 MB, puede empaquetarse dentro de una app macOS y ejecutarse sin conexion, lo que reduce latencia y evita enviar audio a servidores externos.
- Procesamiento por lotes de archivos de audio en un Mac: la card reporta 1,33 horas de audio procesadas en 56 s en el Neural Engine y 26 s en la GPU, lo que permite transcribir lotes de grabaciones en local.
- Investigacion en ASR code-switched: el modelo y sus resultados por chip (Neural Engine, GPU, CPU) sirven como referencia reproducible para estudiar el impacto de la conversion Core ML en la calidad de transcripcion.
- Aplicaciones de accesibilidad: dictado por voz para usuarios de hindi en Mac sin depender de conectividad, con tiempos de primera carga de 3 a 7 s en el Neural Engine.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el test publico hindi del Open ASR Leaderboard (753 clips, 1,33 horas, 468 hablantes), con el scorer `voi_oiwer` 0.1.4 y decodificacion greedy sin modelo de lenguaje:

| Modelo | Tamano | Ejecucion | OIWER |
|---|---|---|---|
| AI4Bharat IndicConformer Hindi, salida CTC | No medido | ONNX 8 bits, sherpa-onnx | 15,40 % |
| SraVaani 1.0 (ARTPARK-IISc) | 430 M parametros | PyTorch | 11,11 % |
| Sangam `n3-slang1`, pack Android | Aprox. 115 M, 205 MB | ONNX 8 bits, sherpa-onnx | 8,91 % |
| Sangam `n3-slang1`, original | Aprox. 115 M | PyTorch 32 bits | 8,86 % |
| Sangam `n3-slang1`, estos ficheros Core ML | Aprox. 115 M, 234 MB | Core ML 16 bits, Neural Engine | 8,85 % |

Desglose por chip de los ficheros Core ML:

| Ejecucion | Chip | OIWER | Errores / palabras de referencia | Mismo texto que PyTorch | Tiempo de encoder por clip |
|---|---|---|---|---|---|
| Original PyTorch (32 bits) | CPU | 8,86 % | 1209 / 13.653 | referencia | no medido |
| Estos ficheros | Neural Engine | 8,85 % | 1208 / 13.651 | 716 de 753 clips | 59 ms |
| Estos ficheros | GPU | 8,82 % | 1204 / 13.652 | 740 de 753 clips | 19 ms |
| Estos ficheros | Solo CPU | 8,80 % | 1201 / 13.652 | 736 de 753 clips | 64 ms |

Estudio de la conversion sobre los pesos hermanos `n3` (PyTorch 8,83 %):

| Variante Core ML | Mismo texto que PyTorch | OIWER |
|---|---|---|
| Precision completa (32 bits), GPU | 753 de 753 | 8,83 % |
| 16 bits, GPU | 743 de 753 | 8,81 % |
| 16 bits, Neural Engine | 724 de 753 | 8,75 % |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo consume unos 40-55 MB adicionales en el Neural Engine y unos 375 MB en la GPU, segun la card.
- Hardware objetivo: Apple Silicon (probado en M4 Max con 36 GB y macOS 27). No se documenta soporte para GPU NVIDIA ni otros aceleradores.
- Cabe en cualquier Mac con Apple Silicon; el paquete ocupa 234 MB en disco a 16 bits (467 MB a precision completa).
- Despliegue: los ficheros `.mlmodelc` se cargan con Core ML; la app incluye el front end mel y la lista de tokens. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: encoder de 59 ms por clip en Neural Engine, 19 ms en GPU y 64 ms en CPU; bucle de decodificacion de unos 10 ms por clip. Primera carga de 3 a 7 s en Neural Engine y alrededor de 1 s en el resto.
- Throughput: 1,33 horas de audio procesadas en 56 s (Neural Engine) y 26 s (GPU), incluyendo front end mel en Python y bucle de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | OIWER (mismo test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sangam `n3-slang1` Core ML | Aprox. 115 M | 15 s por clip | 8,85 % | No disponible | Hugging Face (Core ML) |
| Sangam `n3-slang1` original | Aprox. 115 M | 15 s por clip | 8,86 % | No disponible | Referenciado, no distribuido en este repo |
| SraVaani 1.0 (ARTPARK-IISc) | 430 M | No disponible | 11,11 % | No disponible | PyTorch |
| AI4Bharat IndicConformer Hindi (CTC) | No medido | No disponible | 15,40 % | No disponible | ONNX 8 bits via sherpa-onnx |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al estar entrenado sobre un test set indio, el rendimiento fuera de hindi e ingles no esta caracterizado.
- Riesgo de alucinacion: en ASR el riesgo se manifiesta como sustituciones de palabras; la card reporta entre 16 y 50 palabras distintas de PyTorch sobre 13.414, con cambios en ambos sentidos.
- Limitaciones de contexto: ventana maxima de 15 s por clip; clips mas largos requieren segmentacion externa.
- Limitaciones de idioma: solo hindi e ingles (incluido hinglish); no se documenta soporte para otras lenguas indias.
- Restricciones de licencia: la licencia no esta disponible en la card, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- Caveat de produccion: los benchmarks son mediciones propias del autor, no una submission oficial al leaderboard, y se hicieron en una sola maquina (M4 Max, 36 GB, macOS 27) con una sola pasada por configuracion.
- Dependencia de plataforma: los ficheros son Core ML compilado y estan pensados para Apple Silicon; el front end mel y la lista de tokens viven en la app, no en el repositorio.
- El pack de 8 bits (117 MB) esta mencionado pero no publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/talkxo/sangam-coreml
- Dataset de evaluacion: https://huggingface.co/datasets/VoiceArena/MonsoonASR-Open-ASR-leaderboard-hi-IN
- Scorer utilizado: https://github.com/JoshTalks/voi_oiwer
