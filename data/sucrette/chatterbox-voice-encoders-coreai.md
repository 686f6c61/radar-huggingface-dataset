# sucrette/chatterbox-voice-encoders-coreai

## Resumen

Chatterbox voice encoders for Core AI es un paquete de codificadores de condicionamiento derivados del sistema TTS Chatterbox de Resemble AI, convertidos al formato Core AI de Apple (`.aimodel`, macOS 27). No es un modelo generativo autonomo, sino el conjunto de piezas de preprocesado que transforman una grabacion de referencia en una "voz" utilizable por Chatterbox: tokens de habla, x-vector de hablante, mel de prompt, embedding del codificador de voz y el prefijo de condicionamiento T3. El objetivo es ejecutar todo este proceso sin Python sobre hardware Apple.

El repositorio pesa 0.6 GB e incluye seis grafos fp32 con formas fijas: `s3tok`, `campplus`, `s3gen_mel`, `voice_encoder`, `t3cond_nano` y `t3cond_turbo`. Los pesos provienen de los modelos base ResembleAI/chatterbox-nano y ResembleAI/chatterbox-turbo, y la conversion se realizo para la aplicacion Asa (`AsaTTS.VoiceBuilder`). La licencia es MIT.

Es relevante ahora porque permite llevar la clonacion y el condicionamiento de voz de Chatterbox a aplicaciones nativas de macOS sobre Apple silicon, eliminando la dependencia de PyTorch en tiempo de ejecucion. El autor valida la fidelidad de la conversion frente a la ruta original en PyTorch con errores maximos del orden de 1e-5 a 1e-6 y coincidencia exacta del 100 por ciento en los tokens S3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de codificadores: tokenizador S3, CAMPPlus (x-vector de hablante), codificador de voz (LSTM de 3 capas), extractor de mel S3Gen y generador de condicionamiento T3. Grafos fp32 con formas fijas convertidos a Core AI |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de extraccion de caracteristicas, no generativo). Entradas de audio fijas: 160000 muestras (10 s a 16 kHz) o 240000 muestras (15 s a 16 kHz / 10 s a 24 kHz). El mel de prompt de T3 se trunca a 1500 fotogramas |
| Tipos de cuantizacion | fp32 (todos los grafos). Relacion con el modelo base marcada como quantized |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.aimodel` (Core AI de Apple) |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: convierte los codificadores de condicionamiento de Chatterbox a grafos Core AI. Se compone de varias redes especializadas. `s3tok` extrae tokens de habla discretos deteniendose antes del redondeo FSQ, de modo que el token se calcula en el host como la suma sobre i de `(round(h_i) + 1) * 3^i`; el tokenizador S3 v2 trunca el mel de prompt de T3 a 1500 fotogramas, igual que Chatterbox. `campplus` integra el fbank de Kaldi, la normalizacion de media y el `spk_embed_affine(normalize(.))` de S3Gen, y produce un x-vector de 192 dimensiones mas `spks` de 80. `s3gen_mel` extrae caracteristicas de mel (`pfeat`) a 24 kHz. `voice_encoder` es un LSTM de 3 capas desenrollado que genera un embedding L2-normalizado de 256 dimensiones; el host calcula su mel de 40 bandas y promedia las particiones.

Los dos grafos de condicionamiento, `t3cond_nano` y `t3cond_turbo`, combinan el embedding de hablante con los tokens de habla para producir el prefijo de condicionamiento T3 (768 dimensiones para Nano, 1024 para Turbo). Las operaciones del host (sonoridad BS.1770 normalizada a -27 LUFS, remuestreo y recorte) replican las de Chatterbox. La herramienta de exportacion usada es `tools/export_voice_models.py`, con dependencias fijadas a chatterbox-tts `5de7a54aa4e5`, coreai-core 1.0.0b3, coreai-torch 0.4.3, torch 2.13.0 y torchaudio 2.11.0.

## Capacidades

- Extraccion de tokens de habla (S3 tokens) a partir de audio de 16 kHz, con variantes de 250 y 375 tokens.
- Calculo de x-vector de hablante (CAMPPlus) de 192 dimensiones y matriz `spks` de 80 bandas.
- Extraccion de mel de prompt (S3Gen) a 24 kHz, con salida `pfeat` de 500x80.
- Generacion de embeddings de voz L2-normalizados de 256 dimensiones mediante LSTM.
- Construccion del prefijo de condicionamiento T3 para dos variantes de modelo (Nano de 768 dimensiones y Turbo de 1024).
- Ejecucion completamente on-device sobre Apple silicon en formato Core AI, sin dependencia de Python en tiempo de ejecucion.
- No implementa generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni comportamiento de agente, al ser un modelo de extraccion de caracteristicas.

## Casos de uso

- Clonacion de voz on-device: a partir de una grabacion de referencia de 10 a 15 segundos, el paquete produce el embedding de hablante y el prefijo de condicionamiento necesarios para que una app de macOS sintetice voz con la timbre del hablante sin salir del dispositivo.
- Construccion de voces en la aplicacion Asa: `AsaTTS.VoiceBuilder` usa estos grafos para preparar un perfil de voz completo antes de la sintesis, sustituyendo la ruta Python de Chatterbox.
- Verificacion e identificacion de hablante: el x-vector de 192 dimensiones de CAMPPlus permite comparar locutores por similitud coseno en tareas de autenticacion o diarizacion ligeras.
- Preprocesado en pipelines TTS propios: los tokens S3 y el mel de prompt se pueden reutilizar como entradas de un motor TTS que consuma el condicionamiento de Chatterbox en formato Core AI.
- Apps de macOS de accesibilidad: generacion de voces personalizadas para usuarios con dificultades del habla, ejecutadas localmente en Apple silicon y sin enviar audio a servicios externos.
- Prototipado de investigacion en voz: extraccion de embeddings y tokens reproducibles para comparar voces o construir datasets, con fidelidad numerica validada frente a PyTorch.
- Integracion en productos de privacidad estricta: al procesar el audio de referencia integramente en local, evita el envio de muestras biometricas de voz a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo de extraccion de caracteristicas y no de un modelo de lenguaje. El autor si documenta pruebas de fidelidad de la conversion frente a la ruta original de Chatterbox en PyTorch:

| Componente | Metrica | Resultado |
|---|---|---|
| S3 tokens | Igualdad exacta (250 y 375) | 100 por ciento |
| CAMPPlus | Similitud coseno del x-vector | 1.000000 |
| Prompt mel | Error maximo | 2e-5 |
| Voice encoder | Similitud coseno | 1.000000 |
| T3 conditioning (Nano y Turbo) | Error maximo | 5e-7 |
| Prueba extremo a extremo (clip 24 kHz) | S3Gen tokens | 100 por ciento iguales |
| Prueba extremo a extremo (clip 24 kHz) | Coseno de hablante | 1.00000 |
| Prueba extremo a extremo (clip 24 kHz) | Voice encoder, filas | 0.99998 |

## Requisitos de hardware

- Entorno validado: Apple silicon Mac con macOS 27 y Core AI CPU, sobre coreai-core 1.0.0b3.
- VRAM estimada: no disponible (el repositorio completo ocupa 0.6 GB en disco); al ejecutarse en CPU de Apple silicon, la huella depende del grafo concreto y de los buffers intermedios.
- GPU recomendadas: no aplica en el sentido convencional; esta disenado para Apple silicon (Core AI) y no para GPUs NVIDIA.
- Capacidad en GPU de consumo: orientado a ejecucion local en Apple silicon, no a GPU de consumo x86.
- Opciones de despliegue: Core AI en macOS 27 mediante `.aimodel`. No se indican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| sucrette/chatterbox-voice-encoders-coreai | Codificadores de voz para Chatterbox en Core AI | `.aimodel` | MIT | HuggingFace |
| ResembleAI/chatterbox-nano | Modelo base TTS de origen (uno de los dos) | no disponible | MIT | HuggingFace |
| ResembleAI/chatterbox-turbo | Modelo base TTS de origen (el otro) | no disponible | MIT | HuggingFace |

Los modelos comparables directos son los propios modelos base de los que se derivan estos pesos; no se dispone de datos de parametros, contexto o rendimiento de ellos en la informacion proporcionada. La diferencia principal es que este paquete solo contiene los codificadores de condicionamiento, no el motor TTS completo, y esta adaptado al formato Core AI de Apple.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni audio final; solo extrae caracteristicas y condicionamiento.
- Entradas de forma fija: los grafos aceptan longitudes de audio y de mel predefinidas, por lo que es necesario remuestrear, recortar y ajustar las muestras en el host.
- Dependencia de plataforma: los `.aimodel` estan pensados para Core AI en macOS 27 sobre Apple silicon; no son portables a otras plataformas sin reconversion.
- La conversion es de caracter experimental (version beta de la libreria coreai-core 1.0.0b3) y no se documentan sesgos, tasas de alucinacion ni cobertura idiomatica, ya que no genera lenguaje.
- Riesgo de fuga biometrica: los embeddings y x-vectors de voz son datos personales; aunque el procesamiento es local, su almacenamiento y comparticion estan sujetos a normativa de proteccion de datos.
- Licencia MIT para el paquete, heredada de Chatterbox (Copyright 2025 Resemble AI). Componentes con licencias distintas: CAMPPlus proviene de 3D-Speaker (Apache 2.0) y el tokenizador S3 de CosyVoice (Apache 2.0); conviene conservar y revisar los avisos de licencia al redistribuir.
- No se especifican idiomas ni condiciones de uso comercial adicionales mas alla de la licencia MIT.

## Enlaces

- HuggingFace: https://huggingface.co/sucrette/chatterbox-voice-encoders-coreai
- Modelo base Nano: https://huggingface.co/ResembleAI/chatterbox-nano
- Modelo base Turbo: https://huggingface.co/ResembleAI/chatterbox-turbo
- Repositorio de Chatterbox: https://github.com/resemble-ai/chatterbox
- Proyecto Asa: https://github.com/ayasena/Asa
