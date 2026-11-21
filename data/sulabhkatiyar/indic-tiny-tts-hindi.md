# sulabhkatiyar/indic-tiny-tts-hindi

## Resumen

Indic Tiny TTS: Hindi es un modelo de síntesis de voz (text-to-speech) extremadamente compacto, desarrollado por sulabhkatiyar, especializado en hindi y diseñado para inferencia en CPU y dispositivos de bajos recursos. Forma parte de la colección INDIC TINY TTS MODELS, compuesta por 12 modelos pequeños, uno por idioma, que cubren 11 lenguas indias y el inglés indio. El modelo lee texto en escritura devanagari y ofrece dos voces, femenina y masculina.

La arquitectura subyacente es un modelo acústico de tipo VITS (el autor referencia los modelos comparables `SYSPIN/vits_Hindi_Female` y `SYSPIN/vits_Hindi_Male` como alternativas de la misma familia), entrenado sobre un subconjunto de 8 horas por voz del corpus AI4Bharat Rasa a 24 kHz. El repositorio ocupa 0,2 GB y los pesos en safetensors suman 8.933.641 parámetros; la model card cita 22,5 millones de parámetros para el modelo completo, una discrepancia que conviene verificar antes de desplegar.

Su relevancia actual radica en la relación calidad/tamaño: según los datos publicados por el autor, iguala en tasa de error de caracteres (CER) a modelos hasta 42 veces más grandes como `ai4bharat/indic-parler-tts` (937,8 M) y es unas 110 veces más rápido que este en una T4, además de funcionar 7 veces más rápido que tiempo real en un solo hilo de CPU x86 y 38 veces en un hilo de Apple M1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal (familia VITS, segun los modelos de referencia de la model card); no se detalla la topologia exacta |
| Parametros totales | 8.933.641 en safetensors; la model card declara 22,5 M (dato no conciliado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de sintesis, no de lenguaje) |
| Tipos de cuantizacion | No disponible; se distribuye en safetensors y ONNX |
| Idiomas soportados | Hindi (hi), escritura devanagari |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors y ONNX |
| Frecuencia de muestreo | 24 kHz (segun datos de entrenamiento) |
| Voces | Femenina y masculina (`voice="female"` / `voice="male"`) |
| Entrada | Texto en devanagari |
| Inferencia | PyTorch y ONNX Runtime; CPU y GPU |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna; los benchmarks la comparan con modelos VITS (`SYSPIN/vits_Hindi_Female`, `SYSPIN/vits_Hindi_Male`), lo que sitúa al modelo en la familia de sintetizadores neuronales end-to-end condicionados por texto, con generación directa de forma de onda a 24 kHz. El modelo produce dos voces diferenciadas, femenina y masculina, seleccionables en inferencia.

El entrenamiento se realizó sobre `sulabhkatiyar/indic-tts-mini-24k`, concretamente el subconjunto `index/pilot.parquet` de 8 horas por voz de las voces hindi de AI4Bharat Rasa a 24 kHz, derivado del corpus completo `sulabhkatiyar/indic-tts-multilingual-prepared`. También se referencia el dataset `ai4bharat/Rasa`. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicable habitualmente en TTS). La innovación técnica destacable es la eficiencia: inferencia en un solo hilo de CPU a velocidad muy superior al tiempo real, con soporte para exportación ONNX.

## Capacidades

- Síntesis de voz a partir de texto en hindi escrito en devanagari.
- Dos voces seleccionables: femenina y masculina.
- Generación de audio a 24 kHz.
- Inferencia en CPU sin GPU, con un solo hilo.
- Ejecución con PyTorch o ONNX Runtime, lo que permite despliegue en dispositivos y entornos sin acelerador.
- Modelo de un solo idioma (hindi); no se documenta cambio de voz, clonación, emoción ni control de prosodia.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada (solo texto a audio).
- No se documenta capacidad multilingüe dentro de este modelo; el multilingüismo se cubre con los otros modelos de la colección.

## Casos de uso

- Lectura de noticias y artículos en hindi: el modelo está evaluado precisamente sobre frases de noticias de FLORES-200 con una CER del 1,64 %, por lo que es adecuado para convertir titulares y párrafos en audio en aplicaciones de prensa digital.
- Asistentes de voz para dispositivos sin GPU: con un factor de tiempo real de 0,136 en un solo hilo de CPU x86 (7 veces más rápido que tiempo real), puede integrarse en altavoces inteligentes, routers o equipos de gama baja que no dispongan de acelerador.
- Accesibilidad para personas con discapacidad visual: lectura de interfaces, documentos y contenido web en hindi en tiempo real en un portátil convencional, gracias a los 38× de velocidad en un hilo de Apple M1.
- Audiolibros y contenido educativo: generación por lotes de narraciones en hindi con dos voces alternables; el tamaño de 0,2 GB permite empaquetar el modelo dentro de la propia aplicación.
- Sistemas de anuncios y avisos automatizados: síntesis de mensajes dinámicos en hindi en kioscos, transporte público o centralitas telefónicas, donde la latencia y el coste de GPU son críticos.
- Preprocesado y aumento de datos para ASR: generación de audio sintético en hindi para ampliar corpus de entrenamiento de reconocimiento de voz, dado el bajo CER medido por reconocimiento automático.
- Aplicaciones móviles y de borde: exportación ONNX y ejecución en CPU permiten incluir la síntesis en apps sin depender de servicios en la nube, con la ventaja de privacidad que ello implica.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 100 frases de noticias de FLORES-200 (CER, menor es mejor):

| Modelo | Tamano | CER, % | Diferencia frente a este modelo (IC 95 %) | Resultado |
|---|---:|---:|---:|---|
| **Este modelo** | 22,5 M | **1,64** | | |
| `ai4bharat/IndicF5` | 350,6 M | 1,02 | -0,62 [-0,93, -0,35] | mejor el suyo |
| `AI4Bharat/Indic-TTS` (hi.zip) | 65,6 M | 1,33 | -0,31 [-0,63, -0,00] | mejor el suyo |
| `hexgrad/Kokoro-82M` | 81,8 M | 1,56 | -0,08 [-0,38, +0,20] | equivalente |
| `ai4bharat/indic-parler-tts` | 937,8 M | 2,23 | +0,59 [+0,13, +1,05] | mejor este modelo |
| `coqui/XTTS-v2` | 466,9 M | 2,37 | +0,73 [+0,18, +1,34] | mejor este modelo |
| `facebook/mms-tts-hin` | 29,1 M | 3,83 | +2,19 [+1,48, +2,92] | mejor este modelo |
| `SYSPIN/vits_Hindi_Female` + `Male` | 29,1 M | 5,58 | +3,93 [+2,48, +6,22] | mejor este modelo |

Resultados sobre 300 frases de test retenidas:

| Modelo | Tamano | CER, % | Diferencia frente a este modelo (IC 95 %) | Resultado |
|---|---:|---:|---:|---|
| **Este modelo** | 22,5 M | **3,03** | | |
| `AI4Bharat/Indic-TTS` (hi.zip) | 65,6 M | 3,21 | +0,18 [-0,44, +0,79] | equivalente |
| `hexgrad/Kokoro-82M` | 81,8 M | 3,29 | +0,27 [-0,38, +0,97] | equivalente |
| `rhasspy/piper-voices` (hi_IN-rohan-medium) | 15,8 M | 3,80 | +0,77 [+0,16, +1,42] | mejor este modelo |
| `rhasspy/piper-voices` (hi_IN-priyamvada-medium) | 15,8 M | 4,53 | +1,50 [+0,70, +2,41] | mejor este modelo |
| `facebook/mms-tts-hin` | 29,1 M | 9,00 | +5,98 [+4,51, +7,53] | mejor este modelo |
| `SYSPIN/vits_Hindi_Female` + `Male` | 29,1 M | 11,82 | +8,79 [+6,65, +11,06] | mejor este modelo |

Comparación con modelos grandes sobre las mismas frases retenidas:

| Modelo | Tamano | Frases | CER, % | Este modelo, mismas frases, % | Diferencia (IC 95 %) | Resultado |
|---|---:|---:|---:|---:|---:|---|
| `coqui/XTTS-v2` | 466,9 M | 300 | 21,33 | 3,03 | +18,30 [+9,97, +28,95] | mejor este modelo |
| `ai4bharat/IndicF5` | 350,6 M | 40 | 1,99 | 2,15 | -0,15 [-1,20, +1,19] | equivalente |
| `ai4bharat/indic-parler-tts` | 937,8 M | 40 | 2,22 | 2,15 | +0,07 [-0,99, +1,35] | equivalente |

Velocidad (factor de tiempo real, menor es más rápido):

| Hardware | Configuracion | Mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38× | 0,026 |
| NVIDIA T4 | PyTorch | 62× | 0,016 |

El autor indica además que es 37 veces más rápido que `coqui/XTTS-v2` en CPU, y que iguala la tasa de error de `ai4bharat/indic-parler-tts` con 1/42 del tamaño y unas 110 veces más rápido en T4, y la de `ai4bharat/IndicF5` con 1/16 del tamaño y unas 170 veces más rápido en T4.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los 8,9 M de parámetros en safetensors; el modelo está pensado para ejecutarse en CPU, por lo que no requiere VRAM dedicada.
- GPU recomendadas: no necesita GPU; funciona en NVIDIA T4 (62× tiempo real) y previsiblemente en cualquier GPU moderna. En consumer, cabe en cualquier RTX o incluso en iGPU.
- CPU: validado en Intel Xeon a 2,20 GHz con 4 vCPU (7× tiempo real con un hilo) y en Apple M1 (38× tiempo real con un hilo).
- Despliegue: PyTorch y ONNX Runtime según la model card. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Almacenamiento: repositorio de 0,2 GB.
- Latencia y throughput: factor de tiempo real de 0,136 (x86, 1 hilo), 0,026 (M1, 1 hilo) y 0,016 (T4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (FLORES-200) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **indic-tiny-tts-hindi** | 22,5 M (card) / 8,9 M (safetensors) | No aplica | 1,64 % | CC-BY-4.0 | Hugging Face, ONNX |
| `hexgrad/Kokoro-82M` | 81,8 M | No aplica | 1,56 % | No disponible en la informacion | Hugging Face |
| `ai4bharat/IndicF5` | 350,6 M | No aplica | 1,02 % | No disponible en la informacion | Hugging Face |
| `ai4bharat/indic-parler-tts` | 937,8 M | No aplica | 2,23 % | No disponible en la informacion | Hugging Face |
| `facebook/mms-tts-hin` | 29,1 M | No aplica | 3,83 % | No disponible en la informacion | Hugging Face |

Frente a `Kokoro-82M` e `IndicF5`, este modelo pierde ligeramente en CER pero es entre 4 y 16 veces más pequeño; frente a `indic-parler-tts` y `mms-tts-hin` gana en calidad con una fracción del tamaño. La licencia CC-BY-4.0 permite uso comercial con atribución, a diferencia de otros modelos de la comparativa cuya licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- Solo admite hindi en escritura devanagari; no se documenta transliteración ni entrada en otros alfabetos.
- No se documentan mecanismos de control de prosodia, emoción, velocidad ni clonación de voz.
- Riesgo de alucinación o artefactos acústicos en textos fuera de dominio (por ejemplo, siglas, números o mezcla de idiomas), no cuantificado en la model card.
- Sesgos de los corpus de origen (AI4Bharat Rasa): la voz y el estilo reflejan los hablantes y dominios del dataset de entrenamiento (8 horas por voz), lo que puede limitar la variedad de acentos y registros.
- Discrepancia entre los parámetros declarados en la model card (22,5 M) y los pesos reales en safetensors (8,9 M); conviene validar el modelo antes de integrarlo en producción.
- La licencia CC-BY-4.0 exige atribución al autor y permite uso comercial; no se especifican restricciones adicionales.
- El modelo está marcado con `inference: false` en la model card, por lo que no se garantiza que el pipeline de Hugging Face funcione directamente; el despliegue previsto es mediante PyTorch u ONNX Runtime.
- No se han publicado métricas de calidad subjetiva (MOS) ni evaluaciones de naturalidad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-hindi
- Colección INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingüe preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Modelo comparable IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo comparable indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo comparable Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo comparable XTTS-v2: https://huggingface.co/coqui/XTTS-v2
- Modelo comparable mms-tts-hin: https://huggingface.co/facebook/mms-tts-hin
- Repositorio AI4Bharat Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
- Voces Piper: https://huggingface.co/rhasspy/piper-voices
