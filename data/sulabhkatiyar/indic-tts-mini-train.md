# sulabhkatiyar/indic-tts-mini-train

## Resumen

El repositorio sulabhkatiyar/indic-tts-mini-train no es un modelo publicado, sino un conjunto de checkpoints intermedios de entrenamiento, registros y metricas del piloto de investigacion Mini TTS v1. Lo mantiene el usuario sulabhkatiyar y contiene un modelo acustico pequeno de estilo Matcha (MAS + OT-CFM) en dos variantes, de 9M y 26M parametros, orientado a sintesis de voz multilingue para lenguas indias e ingles.

El modelo resuelve la generacion de mel-espectrogramas a partir de secuencias de fonemas para TTS multilingue, y necesita un vocoder externo para producir audio. Su relevancia es fundamentalmente metodologica: expone el proceso de entrenamiento de un sistema de flow matching no autorregresivo aplicado a un dominio con poca cobertura, como las lenguas indias, con checkpoints, logs y metricas de validacion disponibles para inspeccion.

Es importante subrayar que el propio autor indica explicitamente que estos checkpoints son experimentales, que pueden borrarse o sobrescribirse en cualquier momento y que no estan pensados para su uso. No hay ninguna garantia de calidad ni soporte asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acustico estilo Matcha (MAS + OT-CFM, flow matching) |
| Parametros totales | Dos variantes: 9M y 26M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS no autorregresivo, sin ventana de contexto de tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Lenguas indias e ingles (la lista concreta de lenguas no esta detallada) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (ckpt\_\*.pt, estado completo y snapshots con EMA) |

## Arquitectura y entrenamiento

La arquitectura es un modelo acustico de estilo Matcha que combina Monotonic Alignment Search (MAS) y Optimal Transport Conditional Flow Matching (OT-CFM). Se trata de un enfoque no autorregresivo, en el que el modelo aprende un campo de vectores que transporta ruido hacia la distribucion objetivo de mel-espectrogramas, condicionado por la secuencia de fonemas. Se entrenan dos tamanos, 9M y 26M de parametros. El codigo del modelo acustico deriva de Matcha-TTS (licencia MIT).

Los datos de entrenamiento proceden de tres fuentes. El corpus Rasa (AI4Bharat), con licencia CC-BY-4.0, se resampleo de 48 kHz a 24 kHz, se filtraron los estilos emocionales y se limito cada voz a 8 horas en el piloto, dando lugar al dataset derivado sulabhkatiyar/indic-tts-mini-24k. Para el ingles se uso IndicTTS-English unicamente en el piloto (nunca publicado, sujeto a la licencia de Indic TTS, IIT Madras), con la intencion de sustituirlo en los modelos finales por LIMMITS/SYSPIN English (IISc, CC-BY-4.0). Las secuencias de fonemas en ingles provienen de eSpeak NG (GPL-3.0), usado solo como herramienta de datos fuera de linea. Para las comprobaciones de escucha se emplea el vocoder Vocos con los pesos preentrenados charactr/vocos-mel-24khz. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion por preferencias.

## Capacidades

- Sintesis de voz (text-to-speech) multilingue orientada a lenguas indias e ingles.
- Generacion de representaciones acusticas (mel-espectrogramas) a partir de secuencias de fonemas, mediante MAS y OT-CFM.
- Requiere un vocoder externo (en este caso Vocos, con charactr/vocos-mel-24khz) para convertir las representaciones acusticas en audio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: si, limitadas al ambito indico+ingles segun los datos de entrenamiento.
- Capacidades especiales: no se describen modos de pensamiento, vision ni audio de entrada.

## Casos de uso

Dado que el autor declara que estos checkpoints no estan pensados para su uso, los escenarios siguientes deben entenderse como aplicaciones potenciales del tipo de modelo, no como usos soportados de este repositorio concreto.

- Investigacion en TTS para lenguas indias: utilizar los checkpoints y las metricas para reproducir o auditar el entrenamiento de un modelo acustico de flow matching no autorregresivo sobre corpus como Rasa, comparando las variantes de 9M y 26M.
- Evaluacion de tecnicas de alineacion y transporte: inspeccionar como se comportan MAS y OT-CFM en un dominio con voces limitadas a 8 horas por locutor, midiendo la estabilidad del alineamiento.
- Desarrollo de sintesis de voz de bajo coste computacional: por su tamano reducido, un modelo acustico de este tipo encaja en escenarios donde se busca generar mel-espectrogramas con poca VRAM antes de aplicar un vocoder ligero.
- Generacion de voces sinteticas para audiolibros o narracion en lenguas indias: pipeline de fonemizacion, modelo acustico y vocoder para producir audio de narracion a partir de texto.
- Integracion en asistentes de voz en idiomas con poca cobertura: sintesis de respuestas habladas en lenguas indias dentro de un sistema conversacional, siempre que se sustituyan los checkpoints experimentales por un modelo final validado.
- Creacion de conjuntos de datos sinteticos de habla: generar muestras acusticas para aumentar datos de entrenamiento de otros sistemas, con las cautelas de licencia sobre los corpus de origen.
- Pruebas de investigacion sobre vocoders a 24 kHz: emparejar el modelo acustico con Vocos y evaluar la calidad percibida mediante las comprobaciones de escucha del propio piloto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MOS, MCD ni metricas objetivas, y declara explicitamente que no hay ninguna reclamacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamano del modelo (9M y 26M parametros). En precision de 32 bits, 26M de parametros ocupan del orden de 0,1 GB solo en pesos; en fp16, aproximadamente la mitad. No se dispone de cifras oficiales de consumo.
- GPU recomendadas: cualquier GPU con algo de memoria libre es suficiente; el cuello de botella real sera el vocoder y no el modelo acustico.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU para el modelo acustico (dato no confirmado en la informacion disponible).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el material es PyTorch y el codigo deriva de Matcha-TTS, con Vocos como vocoder.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indic-tts-mini-train | Acustico TTS (MAS + OT-CFM) | 9M y 26M | No aplica | CC-BY-4.0 | Checkpoints de investigacion |
| Matcha-TTS | Acustico TTS (flow matching) | No disponible | No aplica | MIT | Codigo abierto |
| Vocos | Vocoder neuronal | No disponible | No aplica | MIT | Pesos preentrenados |
| IndicTTS (IIT Madras) | Base de datos TTS | No aplica | No aplica | Licencia propia | Corpus |

La comparacion directa con alternativas de la misma categoria es limitada: la informacion proporcionada no incluye cifras de parametros ni rendimiento de Matcha-TTS o Vocos, y estos ultimos cumplen funciones distintas (modelo de referencia y vocoder, respectivamente), por lo que no son sustitutos equivalentes.

## Limitaciones y advertencias

- No es un release: son checkpoints experimentales que pueden borrarse o sobrescribirse en cualquier momento.
- El autor declara que no estan destinados a su uso y que no existe ninguna garantia de calidad ni soporte.
- Riesgo de alucinacion en el sentido de TTS: no hay garantia de fidelidad ni de inteligibilidad de las muestras generadas.
- La lista concreta de lenguas indias soportadas no esta disponible, lo que impide verificar la cobertura real.
- Licencia de datos: IndicTTS-English se uso unicamente en el piloto y nunca se publico, sujeto a la licencia de Indic TTS (IIT Madras, "COPYRIGHT 2016 TTS Consortium, TDIL, Meity"); esto condiciona cualquier reutilizacion.
- eSpeak NG (GPL-3.0) se usa como herramienta de datos fuera de linea; conviene revisar implicaciones de licencia si se reutiliza la pipeline.
- La licencia del repositorio es CC-BY-4.0, pero las obligaciones derivadas de los corpus de entrenamiento pueden anadir restricciones adicionales al uso comercial.
- No hay informacion sobre sesgos, cobertura de acentos ni comportamiento fuera del dominio de entrenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sulabhkatiyar/indic-tts-mini-train
- Dataset derivado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Corpus Rasa (AI4Bharat): https://huggingface.co/datasets/ai4bharat/Rasa
- Codigo de Matcha-TTS: https://github.com/shivammehta25/Matcha-TTS
- Codigo de Vocos: https://github.com/gemelo-ai/vocos
- Pesos del vocoder: https://huggingface.co/charactr/vocos-mel-24khz
