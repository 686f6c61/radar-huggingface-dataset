# vertexvicky/piper-rasa-tamil

## Resumen

Piper Rasa Tamil es un modelo de sintesis de voz (text-to-speech) neuronal en tiempo real para tamil (`ta_IN`), desarrollado por el usuario vertexvicky y publicado en Hugging Face. Se trata de un ajuste fino del modelo base `rhasspy/piper-voices`, que emplea la arquitectura VITS implementada en el framework Piper de Rhasspy. El modelo sintetiza una unica voz femenina nativa de tamil y esta pensado para integrarse en asistentes de voz, sistemas de lectura y aplicaciones de accesibilidad en entornos de bajos recursos.

El modelo se ha entrenado sobre una seleccion de una sola voz del corpus AI4Bharat Rasa en tamil, con unas 15 horas de audio remuestreado a 22.050 Hz y formato LJSpeech. El entrenamiento se realizo en precision FP32 sobre dos GPU NVIDIA T4 en Kaggle durante aproximadamente 12 horas, con un tamano de lote efectivo de 16.

Su relevancia radica en que amplia la cobertura de Piper, un ecosistema de TTS ligero y desplegable en CPU, hacia una lengua del sur de la India con recursos limitados en herramientas de sintesis abiertas. El repositorio incluye checkpoints intermedios, configuracion ONNX y scripts de exportacion, lo que facilita su conversion a ONNX y su uso con el CLI o la API de Python de Piper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (via `piper_train`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto) |
| Tipos de cuantizacion | no disponible (exportacion a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | tamil (`ta`, `ta_IN`) y etiquetado tambien como `en` |
| Licencia | CC-BY-4.0 |
| Formato de pesos | checkpoints PyTorch (`.ckpt`) y exportacion a ONNX (`.onnx` + `.onnx.json`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. Piper anade sobre VITS un front-end fonemico basado en `espeak-ng` (voz `ta`) y una configuracion de inferencia optimizada para sintesis en tiempo real, lo que permite ejecutar el modelo en CPU con latencias bajas.

El ajuste fino parte de `rhasspy/piper-voices` y se entrena sobre una unica voz femenina del dataset AI4Bharat Rasa en tamil, con aproximadamente 15 horas de audio (unos 54.000 segundos) remuestreado a 22.050 Hz en formato LJSpeech. El entrenamiento se ejecuto en precision FP32 con lote de 8 por GPU en dos T4 (lote efectivo 16), guardando checkpoints cada 10 epocas hasta `epoch=89-step=85320.ckpt`. No se documentan etapas de RLHF, DPO ni tecnicas de decodificacion especulativa; la innovacion practica es la exportacion directa a ONNX y la integracion con el ecosistema Piper.

## Capacidades

- Sintesis de voz neuronal en tiempo real para tamil a partir de texto plano.
- Voz unica femenina nativa de tamil (`num_speakers: 1`).
- Salida de audio a 22.050 Hz, mono, PCM de 16 bits.
- Fonemizacion mediante `espeak-ng` con voz `ta`.
- Exportacion de checkpoints a ONNX para despliegue ligero.
- Uso mediante CLI de Piper y API de Python (`PiperVoice`).
- Parametros de inferencia ajustables: `noise_scale` (0,333), `length_scale` (1,0) y `noise_w` (0,8).
- Etiquetado como compatible con `en`, aunque la model card solo detalla el entrenamiento en tamil.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz en tamil: el modelo convierte respuestas de texto en audio de forma local y con baja latencia, adecuado para dispositivos con CPU y sin GPU dedicada gracias al backend ONNX de Piper.
- Lectura de articulos y documentos: integracion en lectores de pantalla o aplicaciones de accesibilidad para usuarios tamil, con salida a 22.050 Hz y voz femenina consistente.
- Sistemas de megafonia y avisos automatizados: generacion de anuncios pregrabados o dinamicos en estaciones, aeropuertos o comercios, donde la voz unica y el caracter en tiempo real simplifican el despliegue.
- Atencion al cliente por voz: sintesis de respuestas en flujos IVR o chatbots telefonicos en tamil, combinada con un ASR en tamil para cerrar el bucle conversacional.
- Contenido educativo y audiolibros: narracion de materiales didacticos o capitulos de texto largo en tamil, aprovechando la inferencia por lotes sobre ONNX.
- Localizacion de videojuegos y aplicaciones: generacion de voces para dialogos y menus en tamil sin depender de servicios en la nube, con licencia CC-BY-4.0 que permite uso comercial con atribucion.
- Prototipado de investigacion en TTS de bajos recursos: los checkpoints intermedios y la configuracion ONNX permiten estudiar el efecto del numero de epocas y ajustar hiperparametros de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo VITS pequeno y exportable a ONNX, la inferencia puede ejecutarse en CPU; el entrenamiento requirio dos NVIDIA T4.
- GPU recomendadas para entrenamiento o ajuste fino: NVIDIA T4 (se uso un par en Kaggle con DDP); para reentrenamiento a mayor escala, A100 o H100.
- Inferencia en GPU consumer: no se documenta, pero el backend ONNX de Piper esta disenado para ejecucion en CPU, por lo que cabe en equipos sin GPU dedicada.
- Opciones de despliegue: CLI de Piper (`piper`), API de Python (`piper.voice.PiperVoice`), exportacion a ONNX mediante `piper_train.export_onnx`. No se documenta soporte nativo para vLLM, TGI ni llama.cpp (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la model card solo indica que el modelo es de tiempo real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Voces | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Piper Rasa Tamil (este modelo) | VITS (Piper) | tamil (`ta`), etiquetado `en` | 1 femenina | CC-BY-4.0 | `.ckpt`, ONNX | Ajuste fino sobre `rhasspy/piper-voices`, 15 h de audio |
| rhasspy/piper-voices | VITS (Piper) | Multiples idiomas | Multiples | MIT (segun el proyecto Piper) | ONNX | Modelo base del que parte este ajuste; cobertura amplia de idiomas |
| AI4Bharat Rasa (dataset) | no aplica (corpus) | Multiples idiomas de la India | Multiples hablantes | no disponible en la informacion | no aplica | Fuente de datos del ajuste fino; no es un modelo TTS |

No se dispone de datos de benchmarks ni de otros modelos TTS en tamil comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Voz unica: no permite seleccion de hablante ni clonacion; cualquier variacion de timbre requiere reentrenamiento.
- Cobertura limitada a tamil: aunque la etiqueta incluye `en`, la model card solo documenta entrenamiento en tamil; la calidad en ingles no esta verificada.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas, artefactos o prosodia antinatural en textos fuera del dominio del corpus (terminos tecnicos, nombres propios, codigo).
- Dependencia de `espeak-ng`: la fonemizacion de tamil condiciona la calidad; errores de transcripcion fonetica se propagan al audio.
- Datos de entrenamiento limitados: 15 horas de una sola voz pueden producir sobreajuste al estilo del hablante y menor robustez ante variaciones de registro.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero obliga a citar autor y licencia; conviene revisar las condiciones del dataset AI4Bharat Rasa para usos derivados.
- Sin benchmarks publicados: no hay metricas objetivas (MOS, WER) que permitan comparar su calidad con alternativas.
- Repositorio de 7,6 GB con checkpoints intermedios: conviene descargar solo el checkpoint final y exportar a ONNX para reducir el peso en produccion.
- No se documentan sesgos especificos; al entrenarse sobre una unica hablante, puede reflejar caracteristicas dialectales o de registro de esa voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vertexvicky/piper-rasa-tamil
- Repositorio Piper (Rhasspy): https://github.com/rhasspy/piper
- Modelo base: https://huggingface.co/rhasspy/piper-voices
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
