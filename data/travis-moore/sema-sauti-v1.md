# travis-moore/sema-sauti-v1

## Resumen

Sema Sauti v1 es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot, desarrollado por Angelo Asante bajo el proyecto Sema y publicado en Hugging Face por el usuario travis-moore. Se trata de un fine-tune de ResembleAI/chatterbox orientado a dar soporte nativo a twi/akan, pidgin nigeriano y ghanés, y a inglés con acento africano, manteniendo la capacidad de clonación de voz del modelo base. El modelo resuelve un problema concreto: la escasez de sistemas TTS de calidad para lenguas de África Occidental, que habitualmente quedan fuera de los modelos multilingües comerciales.

La arquitectura subyacente es la de Chatterbox (modelo TTS de ResembleAI), de la que no se detallan parámetros ni longitud de contexto en la información disponible. El repositorio ocupa 3,2 GB y la librería de carga es `chatterbox`. El modelo se distribuye como un directorio autocontenido que se carga con `ChatterboxTTS.from_local`.

Es relevante porque combina tres objetivos de entrenamiento (inglés, twi y pidgin) con una retención razonable de otros doce idiomas latinos, y porque su enfoque de fine-tuning selectivo (solo la etapa de pronunciación) preserva la clonación zero-shot del modelo base. La versión v1 corresponde al paso 3300, elegido por ser el mínimo de la curva de pérdida de evaluación, no el último paso del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en Chatterbox (ResembleAI); no se detalla la topología interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tw, pcm (objetivos de entrenamiento); nl, da, fr, ms, it, sv, es, no, sw, pt, de, tr (retenidos) |
| Licencia | sema-internal (license: other); modelo base Chatterbox bajo MIT |
| Formato de pesos | no disponible (directorio de modelo autocontenido para `ChatterboxTTS.from_local`) |

## Arquitectura y entrenamiento

El modelo parte de ResembleAI/chatterbox, un sistema TTS con clonación de voz zero-shot. El fine-tuning se aplicó únicamente a la etapa de pronunciación, que es la que codifica acento, ritmo y pronunciación. El codificador de voz (voice encoder) y el vocoder se mantuvieron congelados, de modo que el modelo conserva la clonación zero-shot limpia y el inglés del modelo base mientras gana naturalidad en twi y pidgin.

Los datos de entrenamiento consistieron en varias horas de habla en twi y pidgin nigeriano, con muchos hablantes y clips cortos, incorporando además pidgin ghanés e inglés con acento africano en la mezcla. No se especifica el número total de tokens ni la composición exacta del dataset. Los pesos publicados corresponden al paso 3300, seleccionado por ser el fondo de la curva de pérdida de evaluación. No se menciona uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, twi/akan y pidgin nigeriano y ghanés como objetivos de entrenamiento.
- Clonación de voz zero-shot a partir de 7-10 segundos de audio de referencia.
- Síntesis multilingüe adicional en neerlandés, danés, francés, malayo, italiano, sueco, español, noruego, suajili, portugués, alemán y turco, con acento ligero y fallos ocasionales.
- Manejo de code-switching, por ejemplo twi-inglés en una misma frase.
- Control de expresividad y guía mediante los parámetros `exaggeration` y `cfg_weight` (valores de referencia: 0.5 y 0.5).
- Generación de audio con marca de agua inaudible.
- No soporta árabe, chino, griego, hebreo, hindi, japonés, coreano ni ruso, ya que sus escrituras no están en el tokenizador. Finés y polaco solo parcialmente.

## Casos de uso

- Locución de contenido para audiencias de Ghana y Nigeria: el modelo genera voz en twi y pidgin con acento natural, adecuado para vídeos, pódcast y anuncios dirigidos a esos mercados.
- Clonación de la voz de un locutor con licencia: con 7-10 segundos de referencia se reproduce la misma voz en tres lenguas, útil para doblaje y localización de contenido existente.
- Asistentes de voz para atención al cliente en África Occidental: permite respuestas habladas en pidgin nigeriano o twi, idiomas que los TTS comerciales habituales no cubren.
- Accesibilidad y lectura de textos: conversión de documentos a audio en inglés, twi o pidgin para usuarios con dificultades de lectura o preferencia por consumo audio.
- Code-switching en interfaces conversacionales: frases mixtas twi-inglés o pidgin-inglés se sintetizan en una sola pasada, sin cambiar de modelo ni de voz.
- Prototipado de aplicaciones de voz multilingües: la retención de doce idiomas latinos permite usar un único checkpoint para demos en francés, español, suajili u otros, aceptando un acento ligero.
- Investigación en TTS para lenguas de bajos recursos: el checkpoint y la metodología de fine-tuning selectivo sirven como base para experimentos con otras lenguas africanas.

## Benchmarks y rendimiento

El autor publica una prueba de lectura (read-back) con una frase por idioma, transcrita por Whisper large-v3 y medida como Character Error Rate (CER, menor es mejor). El suelo del medidor se sitúa en 8-10 porque el transcriptor escribe "9" en lugar de "nine".

| Idioma | Código | CER de lectura |
|---|---|---|
| Neerlandés | nl | 7.5 |
| Danés | da | 8.9 |
| Francés | fr | 9.1 |
| Malayo | ms | 13.0 |
| Italiano | it | 13.3 |
| Sueco | sv | 18.9 |
| Español | es | 19.1 |
| Noruego | no | 19.4 |
| Suajili | sw | 20.0 |
| Portugués | pt | 22.2 |
| Alemán | de | 28.3 |
| Turco | tr | 29.7 |

No se publican valores de CER para los tres idiomas objetivo (en, tw, pcm) en la información disponible, ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 3,2 GB, lo que da una cota inferior orientativa del espacio en disco y de los pesos en memoria, pero no se especifica el consumo en VRAM.
- GPU recomendadas: no disponible. El ejemplo de uso emplea `device="cuda"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: carga mediante la librería `chatterbox` con `ChatterboxTTS.from_local` y descarga del directorio con `huggingface_hub.snapshot_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Autor | Tipo | Idiomas objetivo | Licencia | Clonación zero-shot |
|---|---|---|---|---|---|
| Sema Sauti v1 | travis-moore / Sema | TTS fine-tune de Chatterbox | en, tw, pcm | sema-internal | Sí |
| ResembleAI/chatterbox | ResembleAI | TTS base | no detallado | MIT | Sí |
| Sema Sauti v2 | travis-moore / Sema | TTS fine-tune de Chatterbox (paso 5124) | en, tw, pcm | sema-internal | Sí |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- Twi y pidgin nigeriano son los idiomas más fuertes; el pidgin ghanés y el camerunés llegan por transferencia y son más débiles. Una referencia de voz coincidente mejora el resultado.
- Los idiomas "también hablados" son capacidad retenida, no un fine-tune dedicado: cabe esperar acento ligero y deslices ocasionales.
- Los números, acrónimos y fechas son un punto débil conocido.
- No soporta escrituras no latinas (árabe, chino, griego, hebreo, hindi, japonés, coreano, ruso); finés y polaco solo parcialmente.
- La licencia es `sema-internal` (license: other), lo que impide asumir uso comercial libre; es necesario contactar con el autor para conocer los términos. El modelo base Chatterbox es MIT, pero la licencia del fine-tune prevalece.
- Riesgo de uso indebido por clonación de voz: solo debe clonarse voces sobre las que se tenga derecho. La suplantación sin consentimiento, el engaño y el fraude van contra la intención de la publicación.
- Las salidas llevan una marca de agua inaudible; conviene divulgar que el audio es sintético cuando un oyente pueda sentirse engañado.
- No se detallan sesgos demográficos ni de acento más allá de las notas sobre idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/travis-moore/sema-sauti-v1
- Versión v2: https://huggingface.co/travis-moore/sema-sauti-v2
- Modelo base Chatterbox: https://huggingface.co/ResembleAI/chatterbox
- Proyecto Sema: https://semaink.com
- Autor (Angelo Asante): https://angeloasante.com
- Curva de entrenamiento: https://huggingface.co/travis-moore/sema-sauti-v1/resolve/main/loss.png
