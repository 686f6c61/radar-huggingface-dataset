# vnhellboy/vietnamese-piper-voices

## Resumen

"Vietnamese Piper voices (medium)" es una coleccion de tres voces de sintesis de voz (text-to-speech) en vietnamita publicada por el usuario vnhellboy en Hugging Face. Cada voz se distribuye como un fichero ONNX de aproximadamente 63 MB, entrenado con la arquitectura VITS que usa Piper a 22.050 Hz y preparado para consumirse directamente con la libreria sherpa-onnx. No es un modelo de lenguaje: es un motor TTS de un solo hablante orientado a narracion.

Las tres voces (tramvang, diemdam y altotram) cubren registros masculinos y femeninos con acento del norte de Vietnam, y ninguna corresponde a una persona real: se disenaron a partir de descripciones textuales con VoxCPM2 Voice Design. El problema que abordan es la sintesis de voz vietnamita ligera y ejecutable en CPU, un nicho con muchos menos recursos que el ingles.

El interes practico esta en poder generar narracion vietnamita offline, sin APIs en la nube y con un consumo de recursos minimo. El repositorio acumula 0 descargas y 0 likes, y su licencia es "other", condicionada por el linaje de los pesos (ver la seccion de limitaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), TTS extremo a extremo no autorregresivo |
| Parametros totales | No disponible (cada checkpoint ONNX ocupa aproximadamente 63 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo TTS; no emplea ventana de contexto autorregresiva) |
| Tipos de cuantizacion | No disponible (se sirven ficheros .onnx sin variantes de cuantizacion documentadas) |
| Idiomas soportados | Vietnamita (vi); incorpora fonemas ingleses aprendidos via eSpeak NG |
| Licencia | Other (con restricciones de linaje; ver limitaciones) |
| Formato de pesos | ONNX (.onnx) con metadatos de sherpa-onnx, mas tokens.txt por cada voz |
| Frecuencia de muestreo | 22.050 Hz |
| Numero de voces | 3, todas de un solo hablante |
| Fonemizador | eSpeak NG (voz `vi`); `espeak-ng-data` no incluido |
| Biblioteca de inferencia | sherpa-onnx |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

Cada voz es un modelo VITS de tipo "medium" entrenado con Piper. VITS combina un codificador de texto, un prior condicional basado en variables latentes, un decodificador de espectrograma y un vocoder neuronal, y se entrena de forma adversarial de extremo a extremo; el resultado es un modelo que mapea fonemas a forma de onda sin pasos autorregresivos, lo que permite inferencia rapida en CPU. La fonemizacion se delega en eSpeak NG con la voz vietnamita (`vi`), y los ficheros `.onnx` llevan metadatos especificos de sherpa-onnx, acompanados de un `tokens.txt`.

El proceso de creacion descrito por el autor tiene dos fases. Primero se genero el corpus: para cada voz se sintetizaron unas 5.000 frases en vietnamita con VoxCPM2 (Apache-2.0), de las cuales alrededor del 30 % contenian nombres y terminos en ingles, de modo que las voces aprendieran tambien los fonemas ingleses de eSpeak. Cada clip se transcribio de vuelta con Whisper y se descartaron los que presentaban una tasa de error de caracteres alta, un tono fuera de objetivo o una velocidad de habla atipica. En segundo lugar, cada voz se ajusto con piper1-gpl durante 80 epocas, partiendo de un checkpoint Piper vietnamita previo (`vi_VN-vais1000-medium`). No se documenta el uso de RLHF ni de DPO, algo que no aplica a este tipo de modelo.

## Capacidades

- Sintesis de voz en vietnamita a 22.050 Hz con tres timbres distintos: tramvang (masculino, acento norte, narrador grave y resonante), diemdam (masculino, acento norte, calmado y suave) y altotram (femenino, acento norte, contralto calido).
- Fonemizacion de vietnamita mediante eSpeak NG, con soporte de fonemas ingleses para nombres y terminos extranjeros integrados en el texto.
- Control de velocidad de habla en la generacion (`speed`).
- Inferencia offline mediante sherpa-onnx, sin dependencia de servicios externos.
- Ejecucion en CPU, sin necesidad de GPU.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un motor TTS.
- No se documentan capacidades de clonacion de voz, control emocional explicito ni transferencia de estilo mas alla de las tres voces incluidas.

## Casos de uso

- Narracion de audiolibros y relatos: las tres voces estan disenadas como narradores, con timbres diferenciados para asignar voces a personajes o narrador y generar audiolibros completos en vietnamita de forma local.
- Accesibilidad para lectores de pantalla: integracion de sherpa-onnx en aplicaciones de escritorio o moviles para leer texto vietnamita en voz alta sin conexion a internet.
- Sistemas de atencion al cliente e IVR: generacion de mensajes de voz vietnamitas en centralitas telefonicas, aprovechando la ejecucion en CPU para desplegar en servidores modestos.
- Locucion de videos y contenido editorial: produccion de voz en off para videos, documentales o tutoriales en vietnamita con velocidad ajustable.
- E-learning y aprendizaje de idiomas: lectura de material didactico y ejercicios de pronunciacion, con posibilidad de alternar entre voces masculina y femenina.
- Prototipado rapido de productos de voz: al ser ficheros ONNX ligeros, permiten validar flujos TTS en vietnamita antes de invertir en soluciones propietarias.
- Accesibilidad embebida: ejecucion en dispositivos de bajos recursos, como una Raspberry Pi, para dar voz a sistemas de aviso o dispositivos IoT en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS, tasa de error de caracteres en inferencia ni comparativas cuantitativas frente a otras voces.

## Requisitos de hardware

- VRAM: no se documenta un requisito especifico. Al tratarse de modelos VITS "medium" de aproximadamente 63 MB por voz y disenados para inferencia en CPU, la huella de memoria es reducida.
- CPU: es el modo de despliegue previsto; el autor indica sherpa-onnx como libreria de inferencia y el ecosistema Piper esta pensado para funcionar incluso en una Raspberry Pi.
- GPU: no es necesaria. No se documenta soporte ni optimizacion especifica para GPU.
- GPU de consumo: irrelevante en este caso, ya que el modelo no requiere aceleracion grafica.
- Opciones de despliegue: sherpa-onnx (API de Python mostrada en la model card; el proyecto soporta tambien C++ y otros lenguajes) y piper1-gpl para el ajuste fino.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad de sintesis ni de tiempo real factor.

## Comparativa con modelos similares

| Modelo | Desarrollador | Arquitectura | Frecuencia de muestreo | Tamano aproximado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vietnamese-piper-voices | vnhellboy | VITS (Piper) | 22.050 Hz | ~63 MB por voz | Other (restringida por linaje) | 3 voces en Hugging Face |
| Piper vi_VN-vais1000-medium | Piper / OHF-Voice | VITS (Piper) | No disponible | No disponible | CC BY 4.0 en el corpus de origen | Checkpoint base, catalogado en Piper |
| rhasspy/piper-voices | Rhasspy / OHF-Voice | VITS (Piper) | Variable segun voz | Variable | Variable segun voz | Catalogo multilingue de voces Piper |
| VoxCPM2 | openbmb | No disponible | No disponible | No disponible | Apache-2.0 | Usado aqui solo para generar datos de entrenamiento |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other" con restricciones de linaje: los pesos proceden de `vi_VN-vais1000-medium` (corpus VAIS-1000, CC BY 4.0), que a su vez se ajusto desde `en_US-lessac-medium`, cuyos datos Lessac / Blizzard 2013 estan licenciados solo para investigacion. El propio autor recomienda comprobar si ese linaje es aceptable antes de usar los pesos, especialmente en produccion comercial.
- Datos de entrenamiento 100 % sinteticos: el corpus de aproximadamente 5.000 frases por voz se genero con VoxCPM2 y se filtro con Whisper, por lo que pueden heredarse artefactos o sesgos del generador y del filtro.
- Cobertura limitada de voces: solo tres hablantes, todas con acento del norte de Vietnam; no hay representacion de acentos del centro o del sur.
- Solo vietnamita: el ingles se limita a nombres y terminos sueltos mediante fonemas de eSpeak, no a sintesis completa en ingles.
- Riesgo de errores de pronunciacion: al depender de eSpeak NG para la fonemizacion, palabras ambiguas, siglas o neologismos pueden pronunciarse de forma incorrecta.
- `espeak-ng-data` no se incluye en el repositorio: el usuario debe aportar los datos de eSpeak NG para que funcione la fonemizacion.
- Ausencia de benchmarks publicados: no hay evidencia objetiva de calidad (MOS, inteligibilidad) ni comparativas frente a alternativas.
- Voces no reales: al no corresponder a personas fisicas, no hay riesgo de suplantacion de identidad, pero tampoco se documenta ningun mecanismo de marcado de audio sintetico.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento del analisis, sin mantenimiento ni comunidad conocida.

## Enlaces

- Hugging Face: https://huggingface.co/vnhellboy/vietnamese-piper-voices
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Piper (piper1-gpl): https://github.com/OHF-Voice/piper1-gpl
- VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Corpus VAIS-1000: https://ieee-dataport.org/documents/vais-1000-vietnamese-speech-synthesis-corpus
- Catalogo rhasspy/piper-voices: https://huggingface.co/rhasspy/piper-voices
- PiperHub (catalogo de voces Piper): https://piperhub.org/
- Voces en PiperHub: https://piperhub.org/voices/
- Vietnamese TTS Piper (Space de Hugging Face): https://huggingface.co/spaces/Kaijook/Document-to-speech-VietTTS
- Piper TTS en TTS.ai: https://tts.ai/voices/piper/
