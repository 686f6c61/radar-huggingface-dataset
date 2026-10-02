# ujjwal5454/swikreeti-spanish-s2-pro

## Resumen

Swikreeti Spanish S2-Pro es un modelo de sintesis de voz (text-to-speech) orientado a la clonacion de voz en espanol, publicado por el usuario ujjwal5454 a partir del modelo base fishaudio/s2-pro de Fish Audio. Se distribuye como un ajuste fino con fusion de pesos (fine-tune mas merge) y su unico objetivo declarado es reproducir la voz de una hablante concreta, Swikreeti Karki, conservando sus caracteristicas acusticas (tono medio de 198,3 Hz y una velocidad de habla de 71,8 palabras por minuto).

El modelo emplea una arquitectura Dual-Autoregressive Transformer (etiqueta dual_ar) de 4B parametros y se ha entrenado en BF16 sobre una GPU AMD Instinct MI300X VF con 192 GB de VRAM y ROCm 7.14. Soporta dos idiomas, espanol e ingles, e incluye sintesis cruzada entre idiomas (texto en ingles reproducido con la voz clonada).

Se trata de un proyecto personal con escasa traccion (0 descargas y 0 likes en el momento de la consulta), documentacion minima y sin benchmarks estandar publicados. Por ello debe evaluarse mas como una demostracion reproducible de clonacion de voz en espanol sobre la familia Fish Audio que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-Autoregressive Transformer (dual_ar) |
| Parametros totales | 4B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS; no se especifica limite de texto ni de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | espanol (es), ingles (en) |
| Licencia | fish-audio-research-license (etiquetada como other) |
| Formato de pesos | no disponible (tamano del repositorio: 20,6 GB) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura Dual-Autoregressive Transformer del modelo base fishaudio/s2-pro, una familia de sintesis de voz autorregresiva basada en tokens de audio. La model card indica explicitamente "4B Dual-Autoregressive Transformer architecture", sin detallar el codec de audio, el tokenizador ni la composicion exacta del dataset de entrenamiento del modelo original.

El proceso aplicado por el autor consiste en un ajuste fino seguido de una fusion de pesos (fine-tune y merge) sobre los pesos de fishaudio/s2-pro, realizado en precision BF16 sobre una AMD Instinct MI300X VF (192 GB de VRAM) con ROCm 7.14. El conjunto de datos de referencia es el repositorio de voz ujjwal5454/swikreeti-spanish-voice. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineamiento tipo RLHF o DPO. Tampoco se describen innovaciones tecnicas propias mas alla del ajuste de hablante.

## Capacidades

- Sintesis de voz (text-to-speech) en espanol e ingles a partir de texto de entrada.
- Clonacion de voz mono-hablante: reproduce la identidad vocal de una unica hablante (Swikreeti Karki).
- Sintesis cruzada entre idiomas: genera habla en ingles conservando la voz clonada en espanol (muestra `sample_02_intro_english`).
- Control de prosodia y expresividad mediante parametros de inferencia como la temperatura (0.7 en el ejemplo) y el texto de prompt.
- Control de duracion calibrado a una velocidad objetivo (72 palabras por minuto), con desviaciones minimas en las muestras publicadas.
- Salida de audio en WAV a 44,1 kHz, normalizada a EBU R128 (-23,13 LUFS) y con pico real de -1,0 dBFS.
- Soporte de tool calling / function calling: no aplica (modelo de sintesis de voz).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Vision, audio de entrada o thinking mode: no disponibles.

## Casos de uso

- Doblaje y localizacion de contenido audiovisual: el modelo permite generar una pista de voz en espanol o ingles con una identidad vocal consistente, util para doblar videos, cursos o anuncios manteniendo el timbre de una narradora fija.
- Produccion de audiolibros y narracion larga: gracias a la clonacion mono-hablante estable y a la velocidad calibrada (72 WPM), encaja en la lectura continuada de capitulos completos con una voz homogenea.
- Asistentes de voz e IVR en espanol: se puede integrar en sistemas de respuesta interactiva de voz para generar respuestas habladas naturalizadas en espanol con una voz de marca definida.
- Accesibilidad y lectura por voz: conversion de texto a audio para lectores de pantalla o aplicaciones de apoyo a personas con discapacidad visual, con salida normalizada a 44,1 kHz apta para reproduccion directa.
- Prototipado de voces para videojuegos y personajes: generacion rapida de lineas de dialogo con una voz concreta antes de contratar a un actor de doblaje o grabar en estudio.
- Contenido educativo y e-learning: locucion automatizada de materiales didacticos en espanol e ingles, con control de ritmo para adaptarse a distintos niveles de dificultad.
- Investigacion en clonacion de voz y TTS: base reproducible para experimentos academicos sobre fine-tuning de la familia Fish Audio en idiomas concretos y sobre sintesis cruzada entre idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (tipo WER, MOS, UTMOS o similitud de hablante) en la informacion disponible. El autor unicamente aporta una tabla de evaluacion cualitativa sobre frases no vistas, centrada en duracion y tono medio (F0):

| Sample ID | Categoria | Idioma | Palabras | Duracion calibrada (72 WPM) | F0 mediana | Texto |
|---|---|---|---|---|---|---|
| `sample_01_intro_spanish` | Presentacion de identidad | es | 16 | 13,29 s (72,2 WPM) | 206,3 Hz | "Hola a todos, mi nombre es Swikreeti Karki, y esta es mi voz clonada en espanol." |
| `sample_02_intro_english` | Presentacion cruzada | en | 15 | 12,48 s (72,1 WPM) | 213,6 Hz | "Hello everyone, my name is Swikreeti Karki, and this is my artificial intelligence voice clone." |
| `sample_03_presentation` | Presentacion academica | es | 16 | 13,31 s (72,1 WPM) | 213,6 Hz | "Bienvenidos a nuestra presentacion. Hoy vamos a explorar las tradiciones culinarias y culturales de diferentes regiones." |
| `sample_04_narrative` | Narrativa cotidiana | es | 19 | 15,80 s (72,2 WPM) | 203,9 Hz | "Todas las mananas me gusta comenzar el dia con calma, repasando mis apuntes antes de ir a la universidad." |
| `sample_05_reflection` | Reflexion filosofica | es | 17 | 14,15 s (72,1 WPM) | 208,7 Hz | "Aprender un nuevo idioma nos permite conectar con personas maravillosas y comprender el mundo desde otra perspectiva." |
| `sample_06_greeting` | Saludo conversacional | es | 9 | 7,47 s (72,3 WPM) | 205,1 Hz | "Hola, espero que tengan un dia excelente y productivo." |

Caracteristicas acusticas declaradas de la hablante de referencia: F0 mediana de 198,3 Hz (rango dinamico 130,8-266,2 Hz), velocidad de habla de 71,8 palabras por minuto, sonoridad EBU R128 de -23,13 LUFS y pico real de -1,0 dBFS.

## Requisitos de hardware

- Entrenamiento: AMD Instinct MI300X VF con 192 GB de VRAM, ROCm 7.14 y precision BF16 (dato aportado por el autor).
- Pesos del modelo: 4B parametros; en BF16 los pesos ocupan aproximadamente 8 GB (estimacion a 2 bytes por parametro, no confirmada en la model card).
- VRAM estimada para inferencia: del orden de 10-16 GB en BF16 considerando pesos, codec de audio y buffers intermedios (estimacion propia, no verificada por el autor).
- GPU recomendadas: A100, H100 o MI300X para produccion; RTX 4090 o RTX 3090 (24 GB) para inferencia local.
- Compatibilidad con GPU de consumo: previsiblemente si en RTX 4090, RTX 3090 o modelos con 24 GB; el uso en tarjetas de 12 GB o menos no esta confirmado.
- Opciones de despliegue: inferencia mediante el repositorio fish-speech, invocando `fish_speech/models/text2semantic/inference.py` con `--device cuda`. La model card no menciona soporte para vLLM, llama.cpp, Ollama o TGI, y por el tipo de modelo (TTS con codec) no se espera compatibilidad directa con frameworks de servido de LLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Clonacion de voz | Notas |
|---|---|---|---|---|---|
| swikreeti-spanish-s2-pro | 4B | es, en | fish-audio-research-license | Si, mono-hablante | Fine-tune con merge sobre S2-Pro |
| fishaudio/s2-pro (base) | 4B | no disponible | fish-audio-research-license | Si | Modelo base de Fish Audio |
| XTTS-v2 (Coqui) | ~467M (dato externo, no confirmado en la informacion proporcionada) | multilingue | Coqui Public Model License (no comercial) | Si | Alternativa conocida en clonacion de voz multilingue |
| F5-TTS | ~336M (dato externo, no confirmado en la informacion proporcionada) | no disponible | MIT (no confirmado) | Si | Alternativa conocida centrada en TTS con clonacion |

Las especificaciones de los modelos alternativos proceden de conocimiento general y no de la informacion proporcionada en esta ficha, por lo que conviene verificarlas antes de usarlas en una decision tecnica. El detalle de rendimiento comparado (WER, MOS, similitud de hablante) no esta disponible para ninguno de ellos en el material facilitado.

## Limitaciones y advertencias

- Licencia de investigacion: la fish-audio-research-license restringe el uso comercial; es imprescindible revisar los terminos de Fish Audio antes de cualquier despliegue en produccion.
- Uso etico de la clonacion de voz: el modelo reproduce una identidad vocal concreta, por lo que su uso requiere consentimiento explicito de la persona clonada y control frente a suplantacion o deepfakes.
- Documentacion minima: la model card no detalla el dataset de entrenamiento, el numero de tokens, ni el proceso de alineamiento, lo que dificulta auditar sesgos o calidad.
- Sin benchmarks estandar: no hay mediciones objetivas de inteligibilidad, naturalidad o similitud de hablante, solo muestras cualitativas.
- Alcance limitado a una sola hablante: no admite multiples voces ni cambio de identidad sin un nuevo ajuste.
- Cobertura idiomatica reducida: unicamente espanol e ingles; no se documenta soporte para otras lenguas.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Modelo de autor individual: no es un lanzamiento oficial de Fish Audio, por lo que no cabe esperar soporte ni mantenimiento garantizado.
- Riesgo de artefactos en la sintesis: en TTS, el fallo se manifiesta como pronunciacion incorrecta, prosodia plana o ruido, no como alucinacion semantica; no se documentan tasas de error.
- Tamano del repositorio elevado: 20,6 GB, lo que puede implicar estados de optimizador o formatos redundantes y complica el despliegue ligero.
- Sin informacion sobre cuantizacion: no se indica si existen versiones GGUF, ONNX o de menor precision para entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ujjwal5454/swikreeti-spanish-s2-pro
- Repositorio GitHub del autor: https://github.com/ujjwal-basnet/swikreeti-spanish-s2-pro
- Dataset de voz y muestras: https://huggingface.co/datasets/ujjwal5454/swikreeti-spanish-voice
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Licencia fish-audio-research-license: enlace no disponible en la informacion proporcionada.
