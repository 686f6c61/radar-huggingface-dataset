# sulabhkatiyar/indic-tiny-tts-gujarati

## Resumen

Indic Tiny TTS: Gujarati es un modelo de síntesis de voz (text-to-speech) desarrollado por sulabhkatiyar, diseñado específicamente para el idioma guyaratí. Con tan solo 8,9 millones de parámetros según los pesos en safetensors (la model card menciona 22,5 millones, probablemente incluyendo componentes adicionales del pipeline), este modelo prioriza la eficiencia extrema y la ejecución en CPU sin necesidad de GPU. Forma parte de la colección INDIC TINY TTS MODELS, que agrupa 12 modelos pequeños, uno por idioma, para 11 lenguas indias y el inglés indio.

El modelo resuelve el problema de la síntesis de voz de calidad para guyaratí en entornos con recursos limitados, como dispositivos móviles o servidores sin aceleración hardware. Ofrece dos voces (femenina y masculina) y lee texto en escritura guyaratí. Su relevancia actual radica en que demuestra que un modelo de menos de 10 millones de parámetros puede competir en tasa de error de caracteres (CER) con modelos hasta 42 veces más grandes, manteniendo una velocidad de inferencia muy superior.

La arquitectura subyacente no se detalla explícitamente en la información disponible, pero por el tamaño y las características (ONNX, safetensors, TTS ligero) se trata presumiblemente de una arquitectura tipo VITS o similar optimizada para inferencia en CPU. El modelo está entrenado sobre los datasets indic-tts-mini-24k y indic-tts-multilingual-prepared, derivados de AI4Bharat Rasa, a 24 kHz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS ligero, probablemente VITS o similar; se distribuye en ONNX y safetensors) |
| Parametros totales | 8.933.385 (safetensors); la model card indica 22,5 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no procesa contexto textual largo) |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX y safetensors; no se detallan cuantizaciones) |
| Idiomas soportados | Guyaratí (gu) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo más allá de que se trata de un sistema TTS ligero distribuido en formatos ONNX y safetensors, optimizado para inferencia en CPU. Por el tamaño (8,9 M de parámetros en safetensors) y el enfoque en eficiencia, es plausible que se trate de una arquitectura tipo VITS o FastSpeech con vocoder integrado, aunque este dato no se confirma en la model card.

El entrenamiento se realizó sobre los datasets sulabhkatiyar/indic-tts-mini-24k (voces femenina y masculina de AI4Bharat Rasa a 24 kHz) y sulabhkatiyar/indic-tts-multilingual-prepared, con datos derivados de ai4bharat/Rasa. No se especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). La innovación técnica destacable es la optimización para ejecución en un solo hilo de CPU, con un factor de tiempo real de 0,026 en Apple M1 y 0,136 en x86, lo que permite síntesis 38× y 7× más rápida que tiempo real respectivamente.

## Capacidades

- Síntesis de voz (text-to-speech) en guyaratí a partir de texto en escritura guyaratí.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina.
- Ejecución en CPU sin GPU, con PyTorch o ONNX Runtime.
- Inferencia en un solo hilo de CPU, adecuada para dispositivos de bajos recursos.
- Generación de audio a 24 kHz (derivado de los datos de entrenamiento).
- No soporta tool calling, function calling ni razonamiento multi-step (no es un modelo de lenguaje).
- Capacidad multilingüe limitada exclusivamente al guyaratí.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- **Lectura de noticias y artículos en guyaratí**: el modelo puede convertir texto de noticias en audio para aplicaciones de accesibilidad o podcasts automatizados, gracias a su bajo CER (2,03 % en FLORES-200) y su velocidad de 38× tiempo real en M1.
- **Asistentes de voz en dispositivos móviles sin GPU**: al ejecutarse en un solo hilo de CPU con ONNX Runtime, es adecuado para integrarse en apps Android o iOS que necesiten síntesis de voz offline en guyaratí.
- **Sistemas de navegación y anuncios por megafonía**: la baja latencia (factor de tiempo real 0,136 en x86) permite generar anuncios hablados en tiempo real en entornos con hardware modesto.
- **Audioguías y contenido turístico en guyaratí**: permite generar narraciones para museos o puntos de interés con dos voces distintas, sin depender de servicios en la nube.
- **Herramientas de accesibilidad para personas con discapacidad visual**: la síntesis rápida y ligera facilita la lectura de pantalla en guyaratí en dispositivos de gama baja.
- **Generación de audiolibros y material educativo**: el modelo puede producir audio a partir de textos largos de forma eficiente, con una calidad medida por CER competitiva frente a modelos mucho más grandes.
- **Integración en pipelines de CI/CD para pruebas de voz**: su pequeño tamaño (repo de 0,2 GB) y formatos ONNX/safetensors permiten incluirlo en contenedores ligeros para pruebas automatizadas de síntesis.

## Benchmarks y rendimiento

La model card proporciona resultados de CER (character error rate, menor es mejor) en dos conjuntos de evaluación:

**FLORES-200 (100 frases de noticias):**

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **2,03** | — |
| AI4Bharat Indic-TTS (gu.zip) | 65,6 M | 1,66 | Mejor (diferencia -0,37) |
| ai4bharat/IndicF5 | 350,6 M | 1,73 | Igual (diferencia -0,30) |
| ai4bharat/indic-parler-tts | 937,8 M | 2,50 | Peor (+0,47) |
| Arjun4707/piper-gujarati-male | 15,9 M | 2,92 | Peor (+0,89) |
| SYSPIN/vits_Gujarati_Female + Male | 29,1 M | 3,14 | Peor (+1,10) |
| facebook/mms-tts-guj | 29,1 M | 4,03 | Peor (+2,00) |
| multilingual-tts/VITS-OpenBible-Gujarati | 29,1 M | 6,32 | Peor (+4,29) |

**Frases de test reservadas (300 frases):**

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **3,39** | — |
| AI4Bharat Indic-TTS (gu.zip) | 65,6 M | 4,86 | Peor (+1,47) |
| facebook/mms-tts-guj | 29,1 M | 7,38 | Peor (+3,99) |
| SYSPIN/vits_Gujarati_Female + Male | 29,1 M | 7,73 | Peor (+4,34) |
| multilingual-tts/VITS-OpenBible-Gujarati | 29,1 M | 15,13 | Peor (+11,74) |
| Arjun4707/piper-gujarati-male | 15,9 M | 4,61 | Peor (+1,22) |

**Comparación con modelos grandes en las mismas frases reservadas:**

| Modelo | Tamano | CER, % | CER de este modelo en las mismas frases, % | Resultado |
|---|---:|---:|---:|---|
| ai4bharat/indic-parler-tts | 937,8 M | 3,15 | 2,65 | Igual (+0,50) |
| ai4bharat/IndicF5 | 350,6 M | 3,23 | 2,65 | Igual (+0,58) |

**Velocidad:**

| Hardware | Configuracion | Veces mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38× | 0,026 |
| NVIDIA T4 GPU | PyTorch | 62× | 0,016 |

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU; el modelo ocupa aproximadamente 0,2 GB en disco y puede ejecutarse en RAM de sistema.
- **GPU recomendadas**: no son necesarias; opcionalmente NVIDIA T4 o superiores para acelerar (62× tiempo real en T4).
- **Consumer GPU**: cabe en cualquier GPU consumer, e incluso no es necesaria; funciona en CPU.
- **Opciones de despliegue**: PyTorch, ONNX Runtime; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- **Latencia y throughput**: factor de tiempo real de 0,026 en Apple M1 (1 hilo), 0,136 en Intel Xeon (1 hilo) y 0,016 en NVIDIA T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (FLORES-200) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS: Gujarati** | 8,9 M (safetensors) / 22,5 M (card) | No disponible | 2,03 % | CC-BY-4.0 | HuggingFace |
| AI4Bharat Indic-TTS (gu.zip) | 65,6 M | No disponible | 1,66 % | No disponible | GitHub AI4Bharat |
| ai4bharat/IndicF5 | 350,6 M | No disponible | 1,73 % | No disponible | HuggingFace |
| ai4bharat/indic-parler-tts | 937,8 M | No disponible | 2,50 % | No disponible | HuggingFace |
| facebook/mms-tts-guj | 29,1 M | No disponible | 4,03 % | No disponible | HuggingFace |

## Limitaciones y advertencias

- **Idioma único**: solo soporta guyaratí; no es multilingüe ni admite otros idiomas indios.
- **Sesgos**: al entrenarse con voces de AI4Bharat Rasa, puede heredar sesgos de género, edad o registro de los hablantes originales; no se documentan análisis de sesgo.
- **Riesgo de alucinación**: en TTS se traduce en pronunciaciones incorrectas o entonación inadecuada en textos fuera de dominio (palabras técnicas, nombres propios, siglas).
- **Limitaciones de contexto**: no se especifica una longitud máxima de texto de entrada; textos muy largos pueden requerir segmentación manual.
- **Restricciones de licencia**: CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y la licencia.
- **Caveat para producción**: el dato de parámetros en safetensors (8,9 M) difiere del indicado en la model card (22,5 M); conviene verificar el pipeline completo antes de desplegar. La model card indica `inference: false` en los metadatos, lo que puede afectar a la carga automática en algunos entornos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sulabhkatiyar/indic-tiny-tts-gujarati)
- [Colección INDIC TINY TTS MODELS](https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d)
- [Dataset indic-tts-mini-24k](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k)
- [Dataset indic-tts-multilingual-prepared](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared)
- [Dataset ai4bharat/Rasa](https://huggingface.co/datasets/ai4bharat/Rasa)
- [Repositorio AI4Bharat Indic-TTS](https://github.com/AI4Bharat/Indic-TTS)
- [Modelo ai4bharat/IndicF5](https://huggingface.co/ai4bharat/IndicF5)
- [Modelo ai4bharat/indic-parler-tts](https://huggingface.co/ai4bharat/indic-parler-tts)
- [Modelo facebook/mms-tts-guj](https://huggingface.co/facebook/mms-tts-guj)
