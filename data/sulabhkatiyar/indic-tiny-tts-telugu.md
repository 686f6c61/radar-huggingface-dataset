# sulabhkatiyar/indic-tiny-tts-telugu

## Resumen

Indic Tiny TTS: Telugu es un modelo de síntesis de voz (text-to-speech) de tamano reducido, desarrollado por el usuario de HuggingFace sulabhkatiyar, especializado exclusivamente en el idioma telugu. Con 8.932.745 parámetros reales en pesos safetensors (la model card declara 22,5 millones, discrepancia que se detalla más abajo), el modelo convierte texto en escritura telugu en audio a 24 kHz con dos voces disponibles, femenina y masculina. Forma parte de la colección INDIC TINY TTS MODELS, compuesta por 12 modelos pequenos, uno por idioma, que cubren 11 lenguas indias y el inglés indio.

El problema que aborda es la síntesis de voz de calidad en lenguas indias con recursos limitados y en hardware modesto. Frente a alternativas como IndicF5 (350,6 M), indic-parler-tts (937,8 M) o los modelos VITS de AI4Bharat, este modelo ofrece una tasa de error de caracteres (CER) competitiva con un coste computacional muy inferior: según la model card, funciona 38 veces más rápido que el tiempo real en un solo hilo de CPU Apple M1, 7 veces en un hilo de CPU x86 y 62 veces en una GPU NVIDIA T4.

Su relevancia actual reside en la combinación de licencia permisiva (CC-BY-4.0), formato ONNX para despliegue en dispositivo, soporte de CPU sin GPU y un rendimiento en CER que, en el conjunto de prueba de 300 frases retenidas, resulta mejor que el de Piper, MMS-TTS, SYSPIN VITS y vits_rasa_13, y estadísticamente equivalente al de Indic-TTS de AI4Bharat, que tiene el triple de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; la model card no especifica el tipo de arquitectura) |
| Parametros totales | 8.932.745 (safetensors); la model card declara 22,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | telugu (te) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo (no se especifica si es VITS, FastSpeech, un transformer acústico con vocoder integrado u otra familia). Se trata de un modelo TTS condicionado por texto en escritura telugu que genera audio a 24 kHz con dos voces seleccionables mediante el parámetro `voice` ("female" o "male"). El repositorio incluye pesos en safetensors y en ONNX, lo que indica que el autor ha preparado la exportación para inferencia en CPU y en dispositivo.

Los datos de entrenamiento proceden de `sulabhkatiyar/indic-tts-mini-24k`, que contiene las voces femenina y masculina de telugu del corpus AI4Bharat Rasa a 24 kHz, derivadas a su vez del dataset completo `sulabhkatiyar/indic-tts-multilingual-prepared`. La model card no indica el número de horas de audio, el número de pasos de entrenamiento ni si se aplicaron técnicas de alineamiento o regularización específicas. No se menciona RLHF ni DPO, lo cual es esperable en un modelo TTS.

La innovación principal no es arquitectónica sino de eficiencia: el modelo logra un CER de 1,99 % en FLORES-200 y de 4,66 % en 300 frases retenidas con menos de 9 millones de parámetros efectivos, y con un factor de tiempo real de 0,026 en un hilo de CPU M1. La exportación a ONNX y la compatibilidad con PyTorch y ONNX Runtime facilitan el despliegue en entornos sin GPU.

## Capacidades

- Síntesis de voz a partir de texto en escritura telugu, con salida de audio a 24 kHz.
- Dos voces predefinidas: femenina (`voice="female"`) y masculina (`voice="male"`).
- Inferencia en CPU sin GPU, con soporte de PyTorch y ONNX Runtime.
- Ejecución en un solo hilo de CPU, lo que permite despliegue en dispositivos de bajos recursos.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de modo de razonamiento, agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada exclusivamente al telugu; no se documenta soporte de code-switching con inglés u otras lenguas.
- No incluye visión, audio de entrada ni otras modalidades.

## Casos de uso

- **Lectura de noticias y contenidos en telugu**: el modelo sintetiza frases de estilo periodístico con un CER del 1,99 % en FLORES-200, por lo que es adecuado para convertir artículos o boletines en audio para portales de noticias regionales.
- **Accesibilidad para personas con discapacidad visual**: al ejecutarse 38 veces más rápido que el tiempo real en un hilo de CPU M1, puede integrarse en lectores de pantalla o aplicaciones de escritorio que conviertan texto telugu en voz sin depender de servicios en la nube.
- **Asistentes de voz en dispositivo**: la exportación ONNX y el bajo consumo permiten incrustar el modelo en aplicaciones móviles o sistemas empotrados para responder en telugu sin conexión.
- **Aprendizaje de idiomas**: las dos voces permiten generar material de escucha para estudiantes de telugu, con pronunciación consistente y control de la voz por género.
- **Sistemas de anuncios públicos**: síntesis de avisos en estaciones, aeropuertos o edificios públicos donde se requiera reproducción local y de baja latencia en hardware x86 sin GPU.
- **Generación de audiolibros y pódcast**: el factor de tiempo real de 0,136 en CPU x86 permite procesar lotes de texto en servidores modestos, aunque la expresividad y el control prosódico no se documentan.
- **Integración en pipelines de preproducción de vídeo**: conversión rápida de guiones en telugu a pistas de voz provisionales antes de la grabación con locutores humanos.

## Benchmarks y rendimiento

Resultados de CER (character error rate, menor es mejor) publicados en la model card. El modelo declara 22,5 M de parámetros en la model card, mientras que los pesos safetensors suman 8.932.745; la tabla reproduce las cifras declaradas por el autor.

### FLORES-200, 100 frases de noticias

| Modelo | Tamano | CER, % | Errores extra frente a este modelo (IC 95 %) | Resultado |
|---|---:|---:|---:|---|
| **Este modelo** | 22,5 M | **1,99** | | |
| ai4bharat/IndicF5 | 350,6 M | 1,29 | -0,70 [-1,10, -0,22] | mejor el suyo |
| AI4Bharat/Indic-TTS (te.zip) | 65,6 M | 2,00 | +0,01 [-0,37, +0,40] | equivalente |
| ai4bharat/indic-parler-tts | 937,8 M | 2,12 | +0,13 [-0,29, +0,54] | equivalente |
| SYSPIN/vits_Telugu_Female + Male | 29,1 M | 2,39 | +0,41 [-0,01, +0,83] | equivalente |
| rhasspy/piper-voices (te_IN) | 15,9 M | 2,97 | +0,98 [+0,43, +1,58] | mejor el nuestro |
| ai4bharat/vits_rasa_13 | 31,3 M | 3,56 | +1,57 [+0,91, +2,24] | mejor el nuestro |
| facebook/mms-tts-tel | 29,1 M | 4,59 | +2,60 [+1,97, +3,25] | mejor el nuestro |

### Conjunto retenido, 300 frases

| Modelo | Tamano | CER, % | Errores extra frente a este modelo (IC 95 %) | Resultado |
|---|---:|---:|---:|---|
| **Este modelo** | 22,5 M | **4,66** | | |
| AI4Bharat/Indic-TTS (te.zip) | 65,6 M | 5,20 | +0,53 [-0,48, +1,66] | equivalente |
| rhasspy/piper-voices (te_IN) | 15,9 M | 6,67 | +2,00 [+0,81, +3,17] | mejor el nuestro |
| SYSPIN/vits_Telugu_Female + Male | 29,1 M | 8,82 | +4,16 [+2,15, +6,33] | mejor el nuestro |
| facebook/mms-tts-tel | 29,1 M | 10,02 | +5,36 [+3,87, +7,09] | mejor el nuestro |
| ai4bharat/vits_rasa_13 (mismas voces) | 31,3 M | 6,78 | +2,12 [+1,17, +3,08] | mejor el nuestro |

### Comparación con modelos mayores, mismas frases retenidas

| Modelo | Tamano | Frases | CER, % | Este modelo, mismas frases, % | Errores extra frente a este modelo (IC 95 %) | Resultado |
|---|---:|---:|---:|---:|---:|---|
| ai4bharat/IndicF5 (mismas voces) | 350,6 M | 40 | 2,64 | 4,69 | -2,04 [-4,13, +0,14] | equivalente |
| ai4bharat/indic-parler-tts (mismas voces) | 937,8 M | 40 | 3,15 | 4,69 | -1,53 [-2,94, -0,45] | mejor el suyo |

### Velocidad

| Hardware | Configuración | Veces más rápido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7x | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38x | 0,026 |
| NVIDIA T4 | PyTorch | 62x | 0,016 |

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene menos de 9 millones de parámetros efectivos, por lo que los pesos ocupan del orden de decenas de MB en precisión completa y menos de 10 MB en cuantización de 8 bits. No requiere VRAM dedicada para funcionar en CPU.
- **GPU recomendadas**: NVIDIA T4 es suficiente y alcanza 62x tiempo real; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) supera ampliamente ese rendimiento. No se han publicado cifras para estas GPU.
- **CPU**: funciona en un solo hilo de CPU x86 (7x tiempo real en Intel Xeon a 2,20 GHz) y en un solo hilo de Apple M1 (38x tiempo real).
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo, incluso en las de gama baja, aunque no es necesario usarla.
- **Opciones de despliegue**: PyTorch y ONNX Runtime, según la model card. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- **Latencia y throughput**: factor de tiempo real de 0,016 en T4, 0,026 en M1 y 0,136 en Xeon. No se publican cifras de latencia por petición ni de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | CER FLORES-200, % | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS: Telugu** | 8,9 M (safetensors) / 22,5 M declarados | Telugu | 1,99 | CC-BY-4.0 | HuggingFace, ONNX y safetensors |
| ai4bharat/IndicF5 | 350,6 M | Indio (multilingüe) | 1,29 | no disponible en la información | HuggingFace |
| AI4Bharat/Indic-TTS (te.zip) | 65,6 M | Telugu | 2,00 | no disponible en la información | GitHub |
| ai4bharat/indic-parler-tts | 937,8 M | Indio (multilingüe) | 2,12 | no disponible en la información | HuggingFace |
| rhasspy/piper-voices (te_IN) | 15,9 M | Telugu | 2,97 | no disponible en la información | HuggingFace |
| facebook/mms-tts-tel | 29,1 M | Telugu | 4,59 | no disponible en la información | HuggingFace |

La ventaja diferencial de este modelo es la relación entre CER y coste: iguala o supera en precisión a modelos de 15,9 a 937,8 M de parámetros con un peso mucho menor, y además es el único de la comparativa con licencia CC-BY-4.0 confirmada y exportación ONNX documentada.

## Limitaciones y advertencias

- **Discrepancia en el número de parámetros**: la model card declara 22,5 M, pero los pesos safetensors suman 8.932.745. Conviene verificar la cifra real antes de dimensionar infraestructura.
- **Idioma único**: solo sintetiza telugu; no hay soporte documentado de otras lenguas ni de mezcla de código con inglés.
- **Sin control prosódico documentado**: no se describen parámetros de velocidad, tono, emoción ni énfasis, más allá de la selección de voz.
- **Riesgo de alucinación acústica**: como todo modelo TTS, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o números; el CER del 4,66 % en frases retenidas implica errores de reconocimiento no despreciables.
- **Sesgos de los datos**: entrenado con las voces de AI4Bharat Rasa, hereda las características de esos hablantes (registro, acento y estilo limitados a dos voces).
- **Licencia CC-BY-4.0**: permite uso comercial con atribución; es necesario citar al autor y la licencia en la redistribución.
- **Sin datos de benchmarks subjetivos**: no se publican métricas de naturalidad (MOS) ni evaluaciones de calidad perceptual.
- **Madurez**: el repositorio tiene 4 descargas y 0 likes en el momento de la consulta, lo que indica adopción muy limitada y poca validación por parte de la comunidad.
- **Inferencia desactivada en HuggingFace**: la model card incluye `inference: false`, por lo que no se puede probar directamente en el widget del Hub.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sulabhkatiyar/indic-tiny-tts-telugu)
- [Colección INDIC TINY TTS MODELS](https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d)
- [Dataset sulabhkatiyar/indic-tts-mini-24k](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k)
- [Dataset sulabhkatiyar/indic-tts-multilingual-prepared](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared)
- [Dataset ai4bharat/Rasa](https://huggingface.co/datasets/ai4bharat/Rasa)
- [Modelo ai4bharat/IndicF5](https://huggingface.co/ai4bharat/IndicF5)
- [Modelo ai4bharat/indic-parler-tts](https://huggingface.co/ai4bharat/indic-parler-tts)
- [Repositorio AI4Bharat/Indic-TTS](https://github.com/AI4Bharat/Indic-TTS)
- [Modelo ai4bharat/vits_rasa_13](https://huggingface.co/ai4bharat/vits_rasa_13)
- [Modelo facebook/mms-tts-tel](https://huggingface.co/facebook/mms-tts-tel)
- [Repositorio rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices)
- [Modelo SYSPIN/vits_Telugu_Female](https://huggingface.co/SYSPIN/vits_Telugu_Female)
- [Modelo SYSPIN/vits_Telugu_Male](https://huggingface.co/SYSPIN/vits_Telugu_Male)
