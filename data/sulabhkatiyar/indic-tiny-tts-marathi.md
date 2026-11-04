# sulabhkatiyar/indic-tiny-tts-marathi

## Resumen

Indic Tiny TTS: Marathi es un modelo de síntesis de voz (text-to-speech) desarrollado por sulabhkatiyar, diseñado específicamente para el idioma maratí (mr) escrito en escritura devanagari. Con aproximadamente 22,5 millones de parámetros según la model card (aunque el archivo de pesos safetensors declara 8.935.049 parámetros, discrepancia que el autor no aclara), el modelo se posiciona como una alternativa ultraligera frente a sistemas TTS multilingües de cientos de millones de parámetros.

El modelo resuelve un problema concreto: la síntesis de voz en maratí de calidad aceptable en hardware sin GPU. Según las mediciones del autor, alcanza un CER del 1,79 % en FLORES-200 y del 4,04 % en un conjunto de prueba retenido, superando a varios modelos abiertos de mayor tamaño en la misma tarea. Funciona a 38 veces tiempo real en un solo hilo de CPU Apple M1 y a 7 veces tiempo real en un hilo de CPU x86, con soporte para PyTorch y ONNX Runtime.

Su relevancia actual reside en la combinación de tamaño reducido, dos voces (femenina y masculina), licencia CC-BY-4.0 y despliegue en CPU, lo que lo hace apto para aplicaciones de accesibilidad, lectura de contenido y asistentes de voz en dispositivos de gama baja o entornos sin aceleración por hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; no se detalla en la model card) |
| Parametros totales | 8.935.049 (safetensors); la model card declara 22,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | maratí (mr), escritura devanagari |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (tipo de decoder, mecanismo de atención, etc.). Se trata de un modelo TTS entrenado sobre el dataset `sulabhkatiyar/indic-tts-mini-24k`, que combina dos fuentes para las dos voces: la voz femenina proviene de AI4Bharat Rasa (derivada de `sulabhkatiyar/indic-tts-multilingual-prepared`) y la voz masculina del corpus LIMMITS/SYSPIN, ambas a 24 kHz. También se citan como datasets relacionados `ai4bharat/Rasa` e `iAkashPaul/limmits-2024`.

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (poco habituales en TTS). El modelo forma parte de la colección INDIC TINY TTS MODELS, compuesta por 12 modelos pequeños, uno por idioma, para 11 lenguas indias y el inglés indio.

## Capacidades

- Síntesis de voz en maratí a partir de texto en escritura devanagari.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina.
- Salida de audio a 24 kHz.
- Inferencia en CPU sin GPU, con soporte para PyTorch y ONNX Runtime.
- Ejecución en dispositivos de bajos recursos (on-device).
- No se documentan capacidades de clonación de voz, control de prosodia, emoción ni multilingüismo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Lectura de noticias y artículos en maratí: el modelo sintetiza texto devanagari a velocidad muy superior al tiempo real en CPU, adecuado para servicios de lectura por voz en aplicaciones móviles o web.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla para contenido en maratí, con despliegue local en el dispositivo sin depender de servicios en la nube.
- Asistentes de voz en dispositivos embebidos: su tamaño reducido y su funcionamiento en un solo hilo de CPU permiten integrarlo en Raspberry Pi u otros equipos de gama baja.
- Audiolibros y contenido educativo: generación por lotes de narraciones en maratí con dos voces disponibles para alternar narrador.
- Sistemas de anuncios y megafonía: síntesis en tiempo real de mensajes dinámicos en maratí en entornos con hardware limitado.
- Prototipado e investigación en TTS de bajos recursos: base ligera para experimentación con técnicas de síntesis en lenguas indias, con licencia permisiva para uso comercial con atribución.

## Benchmarks y rendimiento

Resultados de CER (character error rate, menor es mejor) reportados por el autor:

| Modelo | Tamano | CER FLORES-200 (%) | CER test retenido (%) |
|---|---:|---:|---:|
| **Este modelo** | 22,5 M | **1,79** | **4,04** |
| ai4bharat/IndicF5 | 350,6 M | 1,40 | 2,70 (40 frases) |
| AI4Bharat/Indic-TTS (mr.zip) | 65,6 M | 1,54 | 6,94 |
| ai4bharat/vits_rasa_13 | 31,3 M | 1,99 | 3,83 |
| ai4bharat/indic-parler-tts | 937,8 M | 2,37 | 6,00 (40 frases) |
| SYSPIN/vits_Marathi_Female + Male | 29,1 M | 2,48 | 6,28 |
| rhasspy/piper-voices (mr_IN-google-medium) | 19,2 M | 3,44 | 8,45 |
| facebook/mms-tts-mar | 29,1 M | 5,41 | 12,81 |
| multilingual-tts/VITS-OpenBible-Marathi | 29,1 M | 9,37 | no disponible |

Velocidad de síntesis:

| Hardware | Configuracion | Veces mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7x | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38x | 0,026 |
| NVIDIA T4 | PyTorch | 62x | 0,016 |

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo es lo bastante pequeño como para caber en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: NVIDIA T4 (medido a 62x tiempo real), aunque el modelo está pensado para CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en CPU de gama baja; no requiere aceleración por hardware.
- Opciones de despliegue: PyTorch y ONNX Runtime (formatos incluidos en el repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: factor de tiempo real de 0,136 en un hilo de CPU x86 y 0,026 en Apple M1; 62x tiempo real en T4.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | CER FLORES-200 (%) | Licencia | Despliegue |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS Marathi** | 22,5 M (card) / 8,9 M (safetensors) | mr | 1,79 | CC-BY-4.0 | CPU, ONNX, PyTorch |
| ai4bharat/IndicF5 | 350,6 M | multilingüe indio | 1,40 | no disponible en la información | GPU recomendada |
| ai4bharat/indic-parler-tts | 937,8 M | multilingüe | 2,37 | no disponible en la información | GPU |
| rhasspy/piper-voices (mr_IN-google-medium) | 19,2 M | mr | 3,44 | no disponible en la información | CPU, ONNX |
| facebook/mms-tts-mar | 29,1 M | mr | 5,41 | no disponible en la información | CPU/GPU |

## Limitaciones y advertencias

- Solo soporta maratí en escritura devanagari; no se documenta transliteración ni entrada en otros alfabetos.
- La model card declara 22,5 M de parámetros, pero el archivo safetensors indica 8.935.049; la discrepancia no está explicada y conviene verificarla antes de dimensionar el despliegue.
- El CER en el conjunto de prueba retenido (4,04 %) es más del doble que en FLORES-200 (1,79 %), lo que sugiere variabilidad según el dominio y el registro del texto.
- No se documentan sesgos específicos, pero al entrenarse con corpus limitados (Rasa, LIMMITS/SYSPIN) puede presentar sesgos de género, registro o prosodia propios de esas fuentes.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- La licencia CC-BY-4.0 permite uso comercial con atribución; no se documentan restricciones adicionales.
- No se especifican limitaciones de longitud de texto de entrada ni comportamiento en textos muy largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-marathi
- Colección INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset indic-tts-mini-24k: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset indic-tts-multilingual-prepared: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset LIMMITS 2024: https://huggingface.co/datasets/iAkashPaul/limmits-2024
- Modelo ai4bharat/IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo ai4bharat/indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo ai4bharat/vits_rasa_13: https://huggingface.co/ai4bharat/vits_rasa_13
- Repositorio AI4Bharat Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
- Voces Piper: https://huggingface.co/rhasspy/piper-voices
- Modelo facebook/mms-tts-mar: https://huggingface.co/facebook/mms-tts-mar
- Modelos SYSPIN Marathi: https://huggingface.co/SYSPIN/vits_Marathi_Female
