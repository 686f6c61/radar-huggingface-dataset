# sulabhkatiyar/indic-tiny-tts-bengali

## Resumen

Indic Tiny TTS Bengali es un modelo de síntesis de voz (text-to-speech) específico para bengalí, desarrollado por sulabhkatiyar como parte de la colección INDIC TINY TTS MODELS, que agrupa 12 modelos pequeños, uno por idioma, para 11 lenguas indias y inglés indio. El modelo resuelve el problema de la síntesis de voz en bengalí en entornos con recursos limitados: está diseñado para ejecutarse en CPU, sin necesidad de GPU, con latencia muy baja.

Con 8,93 millones de parámetros según los pesos en safetensors (la model card indica 22,5 millones, discrepancia que conviene tener en cuenta), el modelo ofrece dos voces, femenina y masculina, y lee directamente escritura bengalí. Su relevancia actual radica en que iguala o supera en calidad de pronunciación a modelos mucho mayores, como IndicF5 (350,6 M) o indic-parler-tts (937,8 M), con una fracción del coste computacional.

La arquitectura subyacente no se detalla en la información disponible; la model card se centra en resultados de evaluación, velocidad y datos de entrenamiento. El modelo se distribuye en formatos PyTorch y ONNX Runtime, lo que facilita el despliegue en dispositivos de borde y aplicaciones de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; se distribuye en PyTorch y ONNX) |
| Parametros totales | 8.932.745 (safetensors); la model card indica 22,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bengalí (bn) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo (transformer, VITS, difusión u otra). La model card únicamente indica que se trata de un modelo TTS minúsculo orientado a inferencia en CPU y que se distribuye tanto en PyTorch como en ONNX Runtime.

En cuanto a los datos, el modelo se entrenó con el dataset sulabhkatiyar/indic-tts-mini-24k, que contiene las voces femenina y masculina de bengalí de AI4Bharat Rasa a 24 kHz, derivadas del dataset completo sulabhkatiyar/indic-tts-multilingual-prepared. También se menciona ai4bharat/Rasa como fuente. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto en escritura bengalí.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina (`voice="male"`).
- Inferencia en CPU sin GPU, con soporte de PyTorch y ONNX Runtime.
- Funcionamiento en dispositivos de borde y portátiles (probado en Apple M1 y x86).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.
- Capacidad multilingüe limitada al bengalí; no se indica soporte para otras lenguas.

## Casos de uso

- Lectura de noticias y artículos en bengalí: el modelo sintetiza frases de estilo periodístico con un CER del 2,10 % en FLORES-200, adecuado para aplicaciones de lectura por voz con calidad aceptable.
- Asistentes de accesibilidad para personas con discapacidad visual: al ejecutarse 38× más rápido que tiempo real en un hilo de CPU de Apple M1, permite narrar interfaces y documentos en tiempo real sin hardware dedicado.
- Aplicaciones móviles y de escritorio offline: el tamaño reducido (repo de 0,2 GB) y la inferencia en CPU facilitan empaquetar el modelo en aplicaciones que funcionan sin conexión.
- Sistemas de anuncios y avisos automatizados: con dos voces disponibles, se puede alternar entre voz femenina y masculina para mensajes de servicio público, transporte o comercio.
- Prototipado rápido de productos de voz en bengalí: el modelo sirve como base ligera para validar flujos de TTS antes de escalar a modelos mayores como IndicF5 o indic-parler-tts.
- Integración en pipelines de CI/CD para pruebas de voz: al ser rápido y ligero, puede generar audio de referencia en pruebas automatizadas de aplicaciones de voz sin consumir recursos de GPU.
- Educación y aprendizaje de idiomas: lectura de textos bengalíes con pronunciación consistente (CER bajo en frases de prueba) para materiales didácticos.

## Benchmarks y rendimiento

FLORES-200, 100 frases de noticias (CER, menor es mejor):

| Modelo | Tamaño | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| Este modelo | 22,5 M | 2,10 | — |
| ai4bharat/IndicF5 | 350,6 M | 1,70 | mejor (diferencia -0,40) |
| ai4bharat/indic-parler-tts | 937,8 M | 2,27 | igual (+0,17) |
| ai4bharat/vits_rasa_13 | 31,3 M | 3,18 | este modelo mejor (+1,08) |
| SYSPIN/vits_Bengali_Female + Male | 29,1 M | 3,50 | este modelo mejor (+1,39) |
| facebook/mms-tts-ben | 29,1 M | 4,86 | este modelo mejor (+2,76) |
| rhasspy/piper-voices (bn_BD-google-medium) | 15,8 M | 5,48 | este modelo mejor (+3,37) |
| AI4Bharat/Indic-TTS (bn.zip) | 65,6 M | 5,52 | este modelo mejor (+3,42) |

Frases de test reservadas, 300 frases (CER, menor es mejor):

| Modelo | Tamaño | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| Este modelo | 22,5 M | 3,58 | — |
| rhasspy/piper-voices (bn_BD-google-medium) | 15,8 M | 7,13 | este modelo mejor (+3,54) |
| AI4Bharat/Indic-TTS (bn.zip) | 65,6 M | 7,99 | este modelo mejor (+4,41) |
| SYSPIN/vits_Bengali_Female + Male | 29,1 M | 8,49 | este modelo mejor (+4,91) |
| facebook/mms-tts-ben | 29,1 M | 9,01 | este modelo mejor (+5,42) |
| ai4bharat/vits_rasa_13 | 31,3 M | 5,00 | este modelo mejor (+1,42) |

Comparación con modelos mayores, mismas frases reservadas:

| Modelo | Tamaño | Frases | CER, % | Este modelo, mismas frases, % | Resultado |
|---|---:|---:|---:|---:|---|
| ai4bharat/IndicF5 | 350,6 M | 40 | 3,78 | 4,08 | igual (-0,30) |
| ai4bharat/indic-parler-tts | 937,8 M | 40 | 7,05 | 4,08 | igual (+2,96) |

Velocidad:

| Hardware | Configuración | Más rápido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38× | 0,026 |
| NVIDIA T4 | PyTorch | 62× | 0,016 |

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para inferencia en CPU y no requiere GPU.
- GPU recomendadas: no necesarias; en NVIDIA T4 alcanza un factor de tiempo real de 0,016 (62× más rápido que tiempo real).
- Cabe en cualquier CPU de consumo: probado en Apple M1 (38× tiempo real con un hilo) y en Intel Xeon a 2,20 GHz con 4 vCPU (7× tiempo real con un hilo).
- Opciones de despliegue: PyTorch y ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,026 en M1, 0,136 en x86 y 0,016 en T4, medido sobre 30 frases reservadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER FLORES-200, % | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo | 22,5 M (card) / 8,93 M (safetensors) | no disponible | 2,10 | CC-BY-4.0 | Hugging Face |
| ai4bharat/IndicF5 | 350,6 M | no disponible | 1,70 | no disponible | Hugging Face |
| ai4bharat/indic-parler-tts | 937,8 M | no disponible | 2,27 | no disponible | Hugging Face |
| facebook/mms-tts-ben | 29,1 M | no disponible | 4,86 | no disponible | Hugging Face |
| rhasspy/piper-voices (bn_BD-google-medium) | 15,8 M | no disponible | 5,48 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo soporta bengalí; no se documentan otras lenguas.
- La model card indica 22,5 M de parámetros, mientras que los pesos safetensors suman 8.932.745; conviene verificar el dato antes de planificar recursos.
- No se dispone de información sobre sesgos de voz, prosodia o dominio; los resultados se limitan a frases de noticias y frases de test reservadas.
- Riesgo de alucinación no aplicable en el sentido habitual, pero pueden aparecer errores de pronunciación en nombres propios, siglas o texto fuera del dominio de entrenamiento.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y mantener la licencia.
- No se documentan limitaciones de longitud de texto de entrada; el contexto no está especificado.
- El modelo no está pensado para clonación de voz ni para voces fuera de las dos incluidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-bengali
- Colección INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset indic-tts-mini-24k: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset indic-tts-multilingual-prepared: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset ai4bharat/Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Modelo ai4bharat/IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo ai4bharat/indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo facebook/mms-tts-ben: https://huggingface.co/facebook/mms-tts-ben
- Repositorio AI4Bharat/Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
