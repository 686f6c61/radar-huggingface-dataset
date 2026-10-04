# VoiceHub/DACFlow-EN-10k

## Resumen

DACFlow-EN-10k es un modelo de sintesis de voz (text-to-speech) en ingles con clonacion de voz zero-shot, desarrollado por VoiceHub. A partir de una grabacion de referencia de 3 a 10 segundos y de un texto en ingles, genera audio a 48 kHz reproduciendo la voz del clip de referencia, sin que esa voz tenga que haber formado parte de los datos de entrenamiento. El modelo tiene 206 M de parametros y se ha entrenado desde cero exclusivamente con datos sinteticos: 9.543 horas de habla en ingles (3.400.911 clips y 3.587 voces) procedentes del dataset SynDataLab-EN/echo-clones-4m-en.

Su nombre resume su diseno: DAC por el codec de audio Semantic-DACVAE cuyos latentes genera, Flow por el paradigma de flow matching, EN por el idioma y 10k por las aproximadamente diez mil horas de habla empleadas en el entrenamiento. Frente a otros sistemas de clonacion de voz, destaca por su tamano reducido (206 M de parametros) y por una licencia Apache 2.0 que permite uso comercial, lo que facilita su despliegue en hardware de consumo.

Es relevante ahora, pero con una advertencia importante: se trata de un proyecto personal que sigue en entrenamiento. El checkpoint publicado mas reciente corresponde al paso 150k de 200k, y el autor indica que los checkpoints tempranos suenan mas asperos que los tardios. La pagina se actualiza automaticamente cada 10k pasos (a partir del paso 20k) con nuevas muestras y puntuaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para flow matching sobre latentes de un codec Semantic-DACVAE (generacion de audio) |
| Parametros totales | 206 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el condicionamiento de voz es un clip de 3-10 s; el autor no especifica limite de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 48 kHz |
| Tamano del repositorio | 11,6 GB (incluye 14 checkpoints) |
| Libreria declarada | audioseal |
| Pipeline | text-to-speech |
| Datos de entrenamiento | 9.543 horas de habla sintetica en ingles; 3.400.911 clips; 3.587 voces |
| Estado | En entrenamiento (paso 150k de 200k) |

## Arquitectura y entrenamiento

El modelo combina dos piezas. Por un lado, un codec de audio Semantic-DACVAE que define el espacio de latentes en el que se trabaja; por otro, un transformer de difusion entrenado con flow matching que genera esos latentes a partir del texto y del condicionamiento de voz. La onda de audio a 48 kHz se reconstruye despues mediante el decodificador del codec. El condicionamiento de la voz se obtiene de un clip de 3 a 10 segundos acompanado de su transcripcion exacta, lo que permite la clonacion zero-shot de voces no vistas durante el entrenamiento.

El entrenamiento se realizo desde cero y unicamente con los datos aportados por el autor: 9.543 horas de habla sintetica en ingles (3.400.911 clips, 3.587 voces) extraidas de la parte curada del dataset SynDataLab-EN/echo-clones-4m-en, cuya extension completa ronda las 11.150 horas. El autor no documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores, ni detalla la composicion exacta del dataset mas alla de su origen sintetico. El proceso sigue en curso: en la fecha de la ultima actualizacion el modelo iba por el paso 150k de un total previsto de 200k, con checkpoints publicados cada 10k pasos desde el paso 20k. El codigo asociado esta en el repositorio kadirnar/dacvae-next (rama roadmap/en-echo) y en el paquete de Python `mytts`.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida de audio a 48 kHz.
- Clonacion de voz zero-shot: reproduce una voz a partir de un clip de referencia de 3 a 10 segundos, sin necesidad de ajuste fino ni de que la voz este en los datos de entrenamiento.
- Transferencia de timbre y de caracteristicas prosodicas basicas del clip de referencia (se muestran ejemplos con voces de aproximadamente 108 Hz, 115 Hz, 149 Hz, 181 Hz y 202 Hz).
- Normalizacion de texto para numeros, fechas y abreviaturas: la model card incluye un ejemplo con "Dr. Patel", "Tuesday, March 3rd, at 4:15 p.m." y "$20 to $35".
- Generacion de fragmentos largos: uno de los ejemplos publicados tiene una duracion aproximada de 20 segundos.
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso; el modelo es exclusivamente de sintesis de voz.
- No se documentan capacidades multilingues: el unico idioma declarado es el ingles.
- No se documentan capacidades de vision ni de audio de entrada mas alla del clip de referencia de voz.
- No se documenta un modo de razonamiento explicito (thinking mode).

## Casos de uso

- Narracion de audiolibros y articulos: el modelo puede leer pasajes largos en una voz concreta, lo que permite mantener un timbre coherente a lo largo de un texto extenso a partir de una unica muestra de referencia.
- Voice-over para produccion audiovisual: util para generar locuciones provisionales en ingles antes de contratar una voz humana, con la ventaja de que la licencia Apache 2.0 permite uso comercial y no exige royalties.
- Asistentes de voz e IVR en ingles: al ser un modelo de 206 M de parametros, puede desplegarse en una GPU de consumo o incluso en CPU, lo que abarata el coste por minuto de audio generado en sistemas de atencion telefónica.
- Accesibilidad y comunicacion asistida: una persona puede grabar 10 segundos de su propia voz y usarla despues para leer en voz alta textos largos, conservando su timbre cuando ya no puede hablar por si misma.
- Prototipado de datos sinteticos: al estar entrenado solo con habla sintetica, el modelo encaja en flujos de generacion de corpus de audio para entrenar o evaluar sistemas de reconocimiento automatico del habla en ingles.
- Preproduccion de podcast y contenido para redes: permite convertir guiones en audio con distintas voces de referencia para validar ritmo, duracion y entonacion antes de grabar.
- Localizacion de contenido interactivo: en videojuegos o experiencias conversacionales en ingles, se pueden generar varias voces de personajes a partir de pequenos clips, sin entrenar un modelo por personaje.
- Demostraciones y pruebas de concepto de clonacion de voz: el modelo sirve como banco de pruebas de una arquitectura de flow matching sobre latentes de codec, dado que el codigo y los pesos estan disponibles abiertamente.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible corresponden al checkpoint del paso 140k y a un conjunto de evaluacion interno del autor (echo-dev). No son comparables con benchmarks publicos estandar de sintesis de voz.

| Metrica | Conjunto | Resultado | Checkpoint | Nota |
|---|---|---|---|---|
| WER (tasa de error de palabras) | echo-dev | 0,58 % | paso 140k | Conjunto de evaluacion propio del autor; mide inteligibilidad |
| UTMOS (calidad percibida) | echo-dev | 3,92 | paso 140k | Escala de opinion media predicha, aproximadamente de 1 a 5 |

Para el checkpoint mas reciente mostrado en la pagina (paso 150k) no se facilitan cifras de WER ni de UTMOS en la informacion disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks genericos, ya que el modelo no es de lenguaje sino de sintesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica, 206 M de parametros ocupan aproximadamente 0,8 GB en FP32 y 0,4 GB en FP16/BF16; sumando el decodificador del codec y las activaciones del bucle de difusion, un despliegue tipico quedaria en el rango de 2 a 4 GB de VRAM. Se trata de una estimacion, no de un dato publicado por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente.
- Cabe en GPU de consumo: si, previsiblemente en modelos como RTX 3060 (12 GB), RTX 4060, RTX 4070 o RTX 4090, e incluso en equipos con menos memoria gracias a la carga en FP16.
- Despliegue: no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje. La via prevista es el paquete de Python `mytts` del repositorio kadirnar/dacvae-next, y el repositorio declara la libreria audioseal.
- Latencia y throughput: no disponible. El autor no publica medidas de tiempo real, RTF ni muestras por segundo.
- Almacenamiento: el repositorio completo ocupa 11,6 GB debido a los 14 checkpoints publicados; para inferencia solo es necesario descargar el checkpoint concreto que se vaya a usar.
- Se recomienda GPU con soporte de precision reducida (FP16/BF16) para acelerar el muestreo de difusion.

## Comparativa con modelos similares

Los resultados de busqueda disponibles no incluyen datos de benchmarks ni especificaciones tecnicas de modelos comparables, por lo que no es posible establecer una comparacion cuantitativa fiable. La categoria en la que compite DACFlow-EN-10k es la de sintesis de voz en ingles con clonacion zero-shot, donde los referentes habituales son sistemas como XTTS-v2, F5-TTS, StyleTTS 2 o los modelos de clonacion de voces cerrados de proveedores comerciales.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DACFlow-EN-10k | 206 M | No disponible (prompt de voz de 3-10 s) | WER 0,58 % y UTMOS 3,92 en echo-dev (paso 140k), datos del propio autor | Apache 2.0 | Pesos abiertos en HuggingFace (entrenamiento en curso) |
| Alternativas de la misma categoria (XTTS-v2, F5-TTS, StyleTTS 2, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

Se recomienda consultar la documentacion oficial de cada alternativa antes de tomar una decision de adopcion, dado que esta busqueda no ha aportado datos verificables sobre ellas.

## Limitaciones y advertencias

- Modelo en entrenamiento: el checkpoint publicado corresponde al paso 150k de 200k. El propio autor advierte de que los checkpoints tempranos suenan mas asperos que los tardios, por lo que la calidad no es estable entre versiones.
- Unicamente ingles: no hay soporte declarado para otros idiomas, ni para mezcla de idiomas dentro de una misma frase.
- Entrenado solo con habla sintetica: las 9.543 horas de entrenamiento provienen de un dataset generado sinteticamente con 3.587 voces. Esto puede limitar la diversidad de acentos, edades, generos y condiciones acusticas reales, y provocar una generalizacion pobre a voces muy alejadas de esa distribucion.
- Riesgo de errores de sintesis: en TTS el equivalente a la alucinacion son sustituciones de palabras, omisiones, repeticiones, silencios anomalos o fallos de pronunciacion. El WER de 0,58 % es bajo, pero procede de un conjunto de evaluacion interno y no garantiza el mismo comportamiento con textos fuera de dominio.
- Dependencia del prompt de voz: el clip de referencia debe tener entre 3 y 10 segundos y hay que proporcionar exactamente las palabras pronunciadas en el. Si la transcripcion no coincide, la calidad de la clonacion puede degradarse.
- Calidad de clonacion variable: no se documenta el comportamiento con voces cantadas, susurros, grabaciones con ruido, acentos no representados o voces infantiles.
- Riesgo legal y etico: aunque la licencia Apache 2.0 permite el uso comercial del modelo, la clonacion de la voz de una persona real puede infringir derechos de imagen, voz o personalidad, asi como normativas de proteccion de datos. Es imprescindible obtener consentimiento explicito de la persona cuya voz se clona.
- Sin analisis de sesgos publicado: no se documentan evaluaciones de sesgo por genero, edad, acento o etnia, ni una ficha de datos detallada mas alla del recuento de clips y voces.
- Sin garantias de produccion: no se publican medidas de latencia, throughput ni estabilidad en ejecucion continua, y no hay soporte declarado para servidores de inferencia estandar.
- Posible marcado de audio: el repositorio declara la libreria audioseal, asociada a marcas de agua de audio. No se concreta en la informacion disponible si los audios generados incorporan una marca de agua, algo que conviene verificar antes de integrarlo en un producto.
- Repositorio pesado: los 11,6 GB incluyen 14 checkpoints historicos, lo que complica la gestion de versiones y el almacenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VoiceHub/DACFlow-EN-10k
- Dataset de entrenamiento principal: https://huggingface.co/datasets/SynDataLab-EN/echo-clones-4m-en
- Dataset propio del autor: https://huggingface.co/datasets/VoiceHub/DACFlow-EN-10k-data
- Codigo fuente (paquete `mytts`, rama roadmap/en-echo): https://github.com/kadirnar/dacvae-next/tree/roadmap/en-echo
- Documentacion de VoiceHub: https://kadirnar.github.io/voicehub/fr/
- Pagina descriptiva de VoiceHub: https://astronomical-sandpaper.github.io/VoiceHub/what-is-voicehub
- Pagina principal del proyecto VoiceHub: https://astronomical-sandpaper.github.io/VoiceHub/
- Muestras de audio del paso 150k: https://huggingface.co/VoiceHub/DACFlow-EN-10k/resolve/main/samples/step_0150000/01-short.wav (y archivos equivalentes 02-question.wav, 03-numbers.wav, 04-conversational.wav y 05-long.wav en la misma ruta)
- Clips de referencia de voz: https://huggingface.co/VoiceHub/DACFlow-EN-10k/resolve/main/prompts/01-short.wav (y archivos equivalentes 02-question.wav, 03-numbers.wav, 04-conversational.wav y 05-long.wav en la misma ruta)
