# sulabhkatiyar/indic-tiny-tts-kannada

## Resumen

Indic Tiny TTS: Kannada es un modelo de síntesis de voz (text-to-speech) extremadamente compacto, desarrollado por sulabhkatiyar, especializado en la lectura de texto en escritura kannada. Con solo 8,9 millones de parámetros según los pesos en safetensors (la model card declara 22,5 millones, discrepancia que conviene verificar antes de desplegar), el modelo está diseñado para inferencia en CPU sin GPU, lo que lo sitúa en la categoría de TTS "on-device" para aplicaciones de baja latencia y recursos limitados. Forma parte de la colección INDIC TINY TTS MODELS, compuesta por 12 modelos pequeños, uno por idioma, que cubren 11 lenguas indias y el inglés indio.

El modelo resuelve el problema de la síntesis de voz en kannada con un coste computacional mínimo: según la model card, alcanza un CER del 1,05 % en frases de noticias de FLORES-200 y del 3,66 % en un conjunto de prueba retenido, con un factor de tiempo real de 0,026 en un núcleo de Apple M1 (38 veces más rápido que tiempo real) y 0,136 en un hilo de CPU x86 (7 veces más rápido). Ofrece dos voces, femenina y masculina, y se distribuye en formatos PyTorch y ONNX Runtime.

Su relevancia actual radica en la combinación de tamaño reducido, licencia permisiva (CC-BY-4.0) y rendimiento competitivo frente a modelos mucho mayores: la model card afirma que iguala la tasa de error de `ai4bharat/indic-parler-tts` (937,8 M) con 1/42 del tamaño y de `ai4bharat/IndicF5` (350,6 M) con 1/16 del tamaño, siendo aproximadamente 120 y 127 veces más rápido en una GPU T4, respectivamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; se distribuye en PyTorch y ONNX) |
| Parámetros totales | 8.933.897 según safetensors; la model card declara 22,5 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se mencionan pesos PyTorch y ONNX Runtime, sin detallar cuantizaciones) |
| Idiomas soportados | kannada (kn) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (no se especifica si es un transformer autorregresivo, un modelo acústico tipo VITS, un difusor ligero u otra familia). La model card únicamente indica que se trata de un modelo TTS de 22,5 millones de parámetros con dos voces (femenina y masculina), que lee escritura kannada y que puede ejecutarse tanto con PyTorch como con ONNX Runtime, lo que sugiere una exportación a ONNX para despliegue en CPU. No se han publicado detalles sobre el tipo de tokenizador, el vocoder, la representación acústica ni la estrategia de decodificación.

En cuanto a los datos de entrenamiento, la model card especifica el uso del dataset `sulabhkatiyar/indic-tts-mini-24k`, con audio a 24 kHz. La voz masculina procede de AI4Bharat Rasa, derivada del corpus completo `sulabhkatiyar/indic-tts-multilingual-prepared`, mientras que la voz femenina proviene del corpus LIMMITS / SYSPIN. También se citan como datasets asociados `ai4bharat/Rasa` e `iAkashPaul/limmits-2024`. No se indica el número total de horas de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otros ajustes posteriores al entrenamiento. Tampoco se documentan innovaciones técnicas específicas más allá de la optimización para inferencia en CPU y la exportación a ONNX.

## Capacidades

- Síntesis de voz a partir de texto en escritura kannada, con salida de audio a 24 kHz.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina.
- Inferencia en CPU sin necesidad de GPU, con soporte para PyTorch y ONNX Runtime.
- Ejecución en un solo hilo de CPU, lo que facilita el despliegue en dispositivos de bajos recursos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades multilingües más allá del kannada.
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- Lectura de noticias y contenidos web en kannada: el modelo sintetiza frases de noticias con un CER del 1,05 % en FLORES-200, adecuado para servicios de lectura por voz de artículos y boletines con una calidad de pronunciación alta.
- Asistentes de voz en dispositivos móviles y embebidos: al ejecutarse 38 veces más rápido que tiempo real en un hilo de Apple M1 y 7 veces en un hilo x86, permite integrar respuestas habladas en aplicaciones sin conexión ni GPU.
- Accesibilidad para personas con discapacidad visual: lectura de texto en kannada en pantalla con latencia baja y sin depender de servicios en la nube, lo que preserva la privacidad del contenido leído.
- Sistemas de anuncios y megafonía automatizada: generación de avisos pregrabados o dinámicos en kannada para transporte público, aeropuertos o comercios, con dos voces para alternar mensajes.
- Aprendizaje de idiomas y materiales educativos: creación de audios de apoyo para estudiantes de kannada, con pronunciación consistente y posibilidad de generar grandes volúmenes de audio en CPU.
- Integración en pipelines de CI/CD para generar locuciones de prueba: al ser un modelo pequeño (repo de 0,2 GB) y con licencia CC-BY-4.0, se puede incluir en flujos automatizados de generación de audio para tests o demos sin coste de GPU.
- Prototipado rápido de productos de voz en kannada: el tamaño reducido y la exportación ONNX permiten iterar en local y desplegar en servidores sin acelerador hardware.

## Benchmarks y rendimiento

La model card presenta resultados de tasa de error de caracteres (CER) sobre dos conjuntos de evaluación. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS.

**FLORES-200, frases de noticias (100)**

| Modelo | Tamaño | CER, % | Error extra frente a este modelo (IC 95 %) | Resultado |
|---|---:|---:|---:|---|
| Este modelo | 22,5 M | 1,05 | — | — |
| `ai4bharat/IndicF5` | 350,6 M | 0,70 | -0,36 [-0,55, -0,17] | mejor el suyo |
| `Sammy-Mohan/Kokoro-82M-Kannada` | 131,4 M | 0,96 | -0,09 [-0,31, +0,14] | igual |
| `github.com/AI4Bharat/Indic-TTS` (kn.zip) | 65,6 M | 1,23 | +0,18 [-0,08, +0,44] | igual |
| `ai4bharat/vits_rasa_13` | 31,3 M | 1,78 | +0,73 [+0,42, +1,03] | mejor el nuestro |
| `SYSPIN/vits_Kannada_Female` + `SYSPIN/vits_Kannada_Male` | 29,1 M | 2,13 | +1,07 [+0,71, +1,45] | mejor el nuestro |
| `ai4bharat/indic-parler-tts` | 937,8 M | 2,30 | +1,25 [+0,39, +2,45] | mejor el nuestro |
| `facebook/mms-tts-kan` | 29,1 M | 3,31 | +2,26 [+1,73, +2,85] | mejor el nuestro |
| `multilingual-tts/VITS-OpenBible-Kannada` | 29,1 M | 5,90 | +4,85 [+4,01, +5,73] | mejor el nuestro |

**Conjunto de prueba retenido (299 frases)**

| Modelo | Tamaño | CER, % | Error extra frente a este modelo (IC 95 %) | Resultado |
|---|---:|---:|---:|---|
| Este modelo | 22,5 M | 3,66 | — | — |
| `github.com/AI4Bharat/Indic-TTS` (kn.zip) | 65,6 M | 3,84 | +0,18 [-0,69, +1,11] | igual |
| `facebook/mms-tts-kan` | 29,1 M | 9,42 | +5,76 [+4,72, +6,93] | mejor el nuestro |
| `Sammy-Mohan/Kokoro-82M-Kannada` | 131,4 M | 3,68 | +0,02 [-0,80, +1,03] | igual |
| `ai4bharat/vits_rasa_13` | 31,3 M | 4,12 | +0,46 [-0,40, +1,26] | igual |
| `SYSPIN/vits_Kannada_Female` + `SYSPIN/vits_Kannada_Male` | 29,1 M | 6,16 | +2,49 [+1,33, +4,12] | mejor el nuestro |

**Modelos mayores, mismas frases retenidas**

| Modelo | Tamaño | Frases | CER, % | Este modelo, mismas frases, % | Error extra frente a este modelo (IC 95 %) | Resultado |
|---|---:|---:|---:|---:|---:|---|
| `ai4bharat/IndicF5` | 350,6 M | 40 | 2,44 | 3,71 | -1,27 [-3,06, +0,76] | igual |
| `ai4bharat/indic-parler-tts` | 937,8 M | 40 | 3,27 | 3,71 | -0,44 [-2,08, +0,99] | igual |

**Velocidad**

| Hardware | Configuración | Más rápido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38× | 0,026 |
| GPU NVIDIA T4 | PyTorch | 62× | 0,016 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo es de tamaño muy reducido (repo de 0,2 GB), por lo que cabría en cualquier GPU con al menos 1 GB de memoria, aunque no se publica una cifra exacta.
- GPU recomendadas: NVIDIA T4 es la única documentada en la model card (62× tiempo real). No se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, por tamaño (8,9 M de parámetros según safetensors), aunque no se han publicado mediciones específicas en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: PyTorch y ONNX Runtime son los soportes documentados. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,026 en Apple M1 (1 hilo), 0,136 en CPU x86 (1 hilo) y 0,016 en T4, medidos sobre 30 frases retenidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER FLORES-200, % | CER retenido, % | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Este modelo | 8,9 M (safetensors) / 22,5 M (model card) | no disponible | 1,05 | 3,66 | CC-BY-4.0 | Hugging Face, ONNX |
| `ai4bharat/IndicF5` | 350,6 M | no disponible | 0,70 | 2,44 (40 frases) | no disponible | Hugging Face |
| `ai4bharat/indic-parler-tts` | 937,8 M | no disponible | 2,30 | 3,27 (40 frases) | no disponible | Hugging Face |
| `Sammy-Mohan/Kokoro-82M-Kannada` | 131,4 M | no disponible | 0,96 | 3,68 | no disponible | Hugging Face |
| `facebook/mms-tts-kan` | 29,1 M | no disponible | 3,31 | 9,42 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo soporta kannada; no se documentan otros idiomas ni cambios de código lingüístico.
- La model card no detalla sesgos de género, dialecto o registro; las dos voces disponibles (femenina y masculina) pueden no representar la diversidad dialectal del kannada.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento (nombres propios, siglas, términos técnicos), no cuantificado en la información disponible.
- Discrepancia entre el número de parámetros de los pesos safetensors (8.933.897) y el declarado en la model card (22,5 M); conviene verificar antes de dimensionar el despliegue.
- No se documentan limitaciones de longitud de contexto ni de duración máxima de audio generado.
- Licencia CC-BY-4.0: permite uso comercial con atribución; no se especifican restricciones adicionales, pero debe citarse al autor.
- No se han publicado métricas de naturalidad perceptual (MOS) ni evaluaciones con hablantes nativos; el CER es una métrica de inteligibilidad, no de calidad subjetiva.
- La model card marca `inference: false`, lo que puede indicar que la inferencia automática en Hugging Face no está habilitada; el despliegue requiere cargar los pesos manualmente con PyTorch u ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-kannada
- Colección INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingüe preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset LIMMITS 2024: https://huggingface.co/datasets/iAkashPaul/limmits-2024
- Modelo comparado `ai4bharat/IndicF5`: https://huggingface.co/ai4bharat/IndicF5
- Modelo comparado `ai4bharat/indic-parler-tts`: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo comparado `Sammy-Mohan/Kokoro-82M-Kannada`: https://huggingface.co/Sammy-Mohan/Kokoro-82M-Kannada
- Modelo comparado `facebook/mms-tts-kan`: https://huggingface.co/facebook/mms-tts-kan
- Modelo comparado `ai4bharat/vits_rasa_13`: https://huggingface.co/ai4bharat/vits_rasa_13
- Repositorio AI4Bharat Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
- Modelo comparado `SYSPIN/vits_Kannada_Female`: https://huggingface.co/SYSPIN/vits_Kannada_Female
- Modelo comparado `SYSPIN/vits_Kannada_Male`: https://huggingface.co/SYSPIN/vits_Kannada_Male
- Modelo comparado `multilingual-tts/VITS-OpenBible-Kannada`: https://huggingface.co/multilingual-tts/VITS-OpenBible-Kannada
- Muestras de audio: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-kannada/tree/main/samples
