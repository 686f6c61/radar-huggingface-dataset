# sulabhkatiyar/indic-tiny-tts-punjabi

## Resumen
Indic Tiny TTS: Punjabi es un modelo de síntesis de voz (text-to-speech) desarrollado por sulabhkatiyar, diseñado específicamente para el panyabí escrito en grafía Gurmukhi. Forma parte de la colección INDIC TINY TTS MODELS, compuesta por 12 modelos ligeros que cubren 11 idiomas indios y el inglés indio. El modelo resuelve el problema de la síntesis de voz de calidad en panyabí con un coste computacional mínimo: 8,93 millones de parámetros reales en pesos safetensors (la model card declara 22,5 M, probablemente contando parámetros de configuración adicionales) y un repositorio de solo 0,2 GB.

La relevancia de este modelo radica en su eficiencia extrema: funciona en CPU sin necesidad de GPU, con un factor de tiempo real de 0,026 en un hilo de Apple M1 (38 veces más rápido que el tiempo real) y 0,136 en un hilo x86 (7 veces más rápido). Ofrece dos voces, femenina y masculina, y en las pruebas publicadas por el autor obtiene una tasa de error de caracteres (CER) de 2,13 % en frases de noticias FLORES-200, superando a cinco modelos abiertos de panyabí de mayor tamaño, incluido `ai4bharat/indic-parler-tts` (937,8 M de parámetros).

El modelo está pensado para despliegue en dispositivo (on-device) y entornos con recursos limitados, con formatos PyTorch y ONNX Runtime. Su licencia CC-BY-4.0 permite uso comercial con atribución, lo que lo hace adecuado para integrarse en aplicaciones de accesibilidad, asistentes de voz o sistemas de lectura de texto en panyabí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS; probablemente VITS o similar, no especificado en la model card) |
| Parametros totales | 8.933.001 (safetensors); la model card declara 22,5 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no procesa contexto de texto largo) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors y ONNX; no se listan cuantizaciones) |
| Idiomas soportados | Panyabí (pa), escritura Gurmukhi |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors, ONNX |

## Arquitectura y entrenamiento
La model card no detalla la arquitectura interna del modelo. Se trata de un modelo de síntesis de voz de tipo extremo a extremo, entrenado sobre el dataset `sulabhkatiyar/indic-tts-mini-24k`, que contiene las voces femenina y masculina de panyabí de AI4Bharat Rasa a 24 kHz. Este dataset deriva a su vez de `sulabhkatiyar/indic-tts-multilingual-prepared`. También se menciona el dataset `ai4bharat/Rasa` como fuente. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS).

La innovación principal es la eficiencia: el modelo logra una calidad de síntesis competitiva con un tamaño muy reducido (8,9 M de parámetros reales) y velocidad de inferencia en CPU. La model card reporta que es aproximadamente 125 veces más rápido que `ai4bharat/indic-parler-tts` en una GPU T4 y que iguala la tasa de error de `ai4bharat/IndicF5` con 1/16 del tamaño y unas 142 veces más rápido en T4. No se detallan técnicas como decodificación especulativa o atención lineal.

## Capacidades
- Síntesis de voz a partir de texto en panyabí escrito en Gurmukhi.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina.
- Inferencia en CPU sin GPU, con PyTorch o ONNX Runtime.
- Alto rendimiento en tiempo real: factor de tiempo real de 0,026 en Apple M1 (un hilo) y 0,136 en x86 (un hilo).
- Formato de audio de salida a 24 kHz (derivado del dataset de entrenamiento).
- No se mencionan capacidades de tool calling, agentes, razonamiento multietapa, visión ni audio de entrada.
- Capacidad multilingüe limitada al panyabí; no se reportan otros idiomas.

## Casos de uso
- **Lectura de textos en panyabí para accesibilidad**: el modelo puede convertir artículos, documentos o mensajes en audio para personas con discapacidad visual o dificultades de lectura, gracias a su bajo coste y funcionamiento en CPU.
- **Asistentes de voz en dispositivos embebidos**: integración en altavoces inteligentes, wearables o sistemas de infoentretenimiento con recursos limitados, ya que requiere menos de 1 GB de RAM y funciona sin GPU.
- **Aplicaciones de aprendizaje de idiomas**: generación de pronunciaciones de ejemplo en panyabí para estudiantes, con dos voces para practicar la comprensión auditiva.
- **Sistemas de anuncios públicos o señalización**: síntesis de mensajes dinámicos en panyabí para aeropuertos, estaciones o comercios, con despliegue en hardware de bajo coste.
- **Atención al cliente automatizada por voz**: respuesta hablada en panyabí en sistemas IVR o chatbots telefónicos, donde la latencia baja (factor de tiempo real 0,136 en x86) permite interacciones fluidas.
- **Generación de audiolibros o pódcasts**: conversión de textos largos en panyabí a audio con voces femenina y masculina, procesable en CPU en paralelo para lotes grandes.
- **Pruebas de calidad y evaluación de TTS**: como modelo de referencia ligero para comparar con otros sistemas de síntesis en panyabí, dado que el autor publica métricas CER detalladas.

## Benchmarks y rendimiento
Los datos de benchmarks provienen de la model card del autor. Se comparan modelos abiertos de panyabí en dos conjuntos de prueba: 100 frases de noticias FLORES-200 y 299 frases de test reservadas.

**FLORES-200 (100 frases)**

| Modelo | Tamaño (M) | CER (%) | Diferencia vs este modelo (puntos, IC 95%) | Resultado |
|---|---:|---:|---:|---|
| **Este modelo** | 22,5 | **2,13** | — | — |
| `ai4bharat/IndicF5` | 350,6 | 1,90 | -0,23 [-0,50, +0,04] | igual |
| `ai4bharat/vits_rasa_13` | 31,3 | 2,66 | +0,53 [+0,16, +0,93] | este modelo mejor |
| `AI4Bharat/Indic-TTS` (pa.zip) | 65,6 | 3,01 | +0,89 [+0,45, +1,39] | este modelo mejor |
| `facebook/mms-tts-pan` | 29,1 | 3,16 | +1,04 [+0,65, +1,41] | este modelo mejor |
| `ai4bharat/indic-parler-tts` | 937,8 | 3,33 | +1,20 [+0,61, +1,91] | este modelo mejor |
| `multilingual-tts/VITS-OpenBible-Punjabi` | 29,1 | 5,39 | +3,26 [+1,99, +4,90] | este modelo mejor |

**Test reservado (299 frases)**

| Modelo | Tamaño (M) | CER (%) | Diferencia vs este modelo (puntos, IC 95%) | Resultado |
|---|---:|---:|---:|---|
| **Este modelo** | 22,5 | **6,94** | — | — |
| `AI4Bharat/Indic-TTS` (pa.zip) | 65,6 | 12,34 | +5,40 [+3,62, +7,43] | este modelo mejor |
| `facebook/mms-tts-pan` | 29,1 | 13,57 | +6,63 [+4,94, +8,25] | este modelo mejor |
| `multilingual-tts/VITS-OpenBible-Punjabi` | 29,1 | 25,93 | +18,98 [+14,49, +23,86] | este modelo mejor |
| `ai4bharat/vits_rasa_13` | 31,3 | 6,64 | -0,30 [-1,55, +0,84] | igual |

**Comparación con modelos grandes (40 frases)**

| Modelo | Tamaño (M) | CER (%) | Este modelo, mismas frases (%) | Diferencia (puntos, IC 95%) | Resultado |
|---|---:|---:|---:|---:|---|
| `ai4bharat/IndicF5` | 350,6 | 5,67 | 6,48 | -0,81 [-2,55, +0,98] | igual |
| `ai4bharat/indic-parler-tts` | 937,8 | 22,79 | 6,48 | +16,31 [+1,48, +34,81] | este modelo mejor |

**Velocidad**

| Hardware | Configuración | Veces más rápido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1 (portátil), CPU | PyTorch, 1 hilo | 38× | 0,026 |
| NVIDIA T4 GPU | PyTorch | 62× | 0,016 |

## Requisitos de hardware
- **VRAM estimada**: no requiere GPU; en CPU el modelo ocupa menos de 1 GB de RAM (repositorio de 0,2 GB, pesos de 8,9 M de parámetros).
- **GPU recomendadas**: opcionales. Funciona en cualquier GPU NVIDIA (T4, RTX 4090, A100, H100) con PyTorch, pero no es necesario.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en CPU de un solo núcleo.
- **Opciones de despliegue**: PyTorch (nativo), ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS de este tipo).
- **Latencia y throughput**: factor de tiempo real de 0,016 en T4 (62× tiempo real), 0,026 en Apple M1 (38×) y 0,136 en x86 (7×). Para 30 frases de prueba, el tiempo total de síntesis es aproximadamente 1,6 % del audio generado en T4.

## Comparativa con modelos similares

| Modelo | Parámetros (M) | Contexto | CER FLORES-200 (%) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Este modelo** | 8,9 (safetensors) / 22,5 declarados | No aplica | 2,13 | CC-BY-4.0 | HuggingFace |
| `ai4bharat/IndicF5` | 350,6 | No aplica | 1,90 | No disponible | HuggingFace |
| `ai4bharat/vits_rasa_13` | 31,3 | No aplica | 2,66 | No disponible | HuggingFace |
| `facebook/mms-tts-pan` | 29,1 | No aplica | 3,16 | No disponible | HuggingFace |
| `ai4bharat/indic-parler-tts` | 937,8 | No aplica | 3,33 | No disponible | HuggingFace |

La comparativa se centra en modelos de TTS para panyabí. El modelo destaca por su reducido tamaño y alta velocidad, con una calidad (CER) comparable a modelos hasta 100 veces más grandes. No se dispone de datos de licencia para los modelos comparados en la información proporcionada.

## Limitaciones y advertencias
- **Idioma único**: solo soporta panyabí en escritura Gurmukhi; no se ha evaluado en otros idiomas ni en otras escrituras (p. ej., Shahmukhi).
- **Sesgos**: no se documentan sesgos específicos, pero al entrenarse con voces de AI4Bharat Rasa, puede reflejar características demográficas o de estilo de esos hablantes.
- **Riesgo de alucinación**: en TTS, puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario o en nombres propios; la CER reportada (2,13 % en FLORES-200) indica que existe un margen de error.
- **Limitaciones de contexto**: no aplica contexto largo; el modelo procesa frases o textos cortos. No se especifica la longitud máxima de entrada.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y la licencia. No hay restricciones adicionales conocidas.
- **Caveats para producción**: el modelo se distribuye con `inference: false` en la model card, lo que indica que no está listo para inferencia directa en el Hub sin configuración adicional. La discrepancia entre parámetros declarados (22,5 M) y reales (8,9 M) debe tenerse en cuenta. No se proporcionan instrucciones detalladas de uso más allá de los ejemplos de audio.

## Enlaces
- [HuggingFace: sulabhkatiyar/indic-tiny-tts-punjabi](https://huggingface.co/sulabhkatiyar/indic-tiny-tts-punjabi)
- [Colección INDIC TINY TTS MODELS](https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d)
- [Dataset sulabhkatiyar/indic-tts-mini-24k](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k)
- [Dataset sulabhkatiyar/indic-tts-multilingual-prepared](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared)
- [Dataset ai4bharat/Rasa](https://huggingface.co/datasets/ai4bharat/Rasa)
- [Repositorio AI4Bharat Indic-TTS](https://github.com/AI4Bharat/Indic-TTS)
- [Modelo ai4bharat/IndicF5](https://huggingface.co/ai4bharat/IndicF5)
- [Modelo ai4bharat/indic-parler-tts](https://huggingface.co/ai4bharat/indic-parler-tts)
- [Modelo facebook/mms-tts-pan](https://huggingface.co/facebook/mms-tts-pan)
- [Modelo ai4bharat/vits_rasa_13](https://huggingface.co/ai4bharat/vits_rasa_13)
- [Modelo multilingual-tts/VITS-OpenBible-Punjabi](https://huggingface.co/multilingual-tts/VITS-OpenBible-Punjabi)
