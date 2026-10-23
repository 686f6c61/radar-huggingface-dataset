# vanshnawander/sapc2-moonshine-m3g

## Resumen

Moonshine m3g es un modelo de reconocimiento automático del habla (ASR) de 4.232.448 parámetros, desarrollado por Vansh Nawander (usuario `vanshnawander`) y publicado en Hugging Face bajo licencia MIT. Se trata de una variante reducida en profundidad del modelo Moonshine, obtenida recortando el encoder de 6 a 4 capas y el decoder de 4 a 3 capas de un checkpoint intermedio (`m5g`) y manteniendo las capas inferior y superior de cada bloque. El resultado se ajusta mediante destilación de conocimiento desde un modelo maestro más grande (`m15s`) sobre el conjunto de entrenamiento completo del Speech Accessibility Project Challenge 2 (SAPC2).

El problema que aborda es el reconocimiento de habla disártrica en inglés: grabaciones de personas con esclerosis lateral amiotrófica (ELA), parálisis cerebral, síndrome de Down, enfermedad de Parkinson y secuelas de ictus. Es un dominio donde los sistemas ASR convencionales degradan gravemente su precisión, y el objetivo del modelo es ofrecer una alternativa extremadamente ligera (pocos megabytes) que pueda ejecutarse en dispositivos con recursos mínimos dentro de aplicaciones de accesibilidad.

El modelo emplea la arquitectura Moonshine (encoder-decoder transformer orientada a latencia baja) con un tokenizador de 1.024 tokens idéntico al de `m15s`, y se distribuye en formato Hugging Face `transformers` (`safetensors`). Su relevancia actual reside en la combinación de tamano mínimo, licencia permisiva y especialización en un caso de uso de accesibilidad con datos escasos, aunque su tasa de error en desarrollo (69,04 % WER) lo sitúa como un componente experimental más que como un sistema listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Moonshine (encoder-decoder transformer) con encoder de 4 capas y decoder de 3 capas |
| Parámetros totales | 4.232.448 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio; no se especifica ventana máxima de entrada) |
| Tipos de cuantización | No disponible en la información proporcionada; los pesos se publican en `safetensors` (entrenamiento en FP32 con autocast BF16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (formato Hugging Face `transformers`, junto con `config.json` y ficheros de tokenizer/processor) |

## Arquitectura y entrenamiento

La arquitectura es la de Moonshine, un modelo encoder-decoder de tipo transformer pensado para transcripción de voz con latencia reducida. Esta variante concreta se construye por poda de profundidad a partir de un checkpoint denominado `m5g`: el encoder pasa de 6 a 4 capas y el decoder de 4 a 3, conservando las capas inferior y superior de la red original, lo que da un total de 4.232.448 parámetros. El tokenizador es el mismo de 1.024 tokens que emplea `m15s`, lo que facilita la compatibilidad de vocabulario con el resto de la familia.

El entrenamiento consiste en una única época de destilación desde el modelo maestro `m15s` sobre el conjunto SAPC2 Train completo, con una función de pérdida combinada de 0,5 de entropía cruzada (CE) y 0,5 de divergencia KL (`kd_weight: 0.5`). Se usa un regimen de muestreo balanceado con un máximo de 2 repeticiones por elemento (`balanced: true`, `balance_max_repeats: 2`), tasa de aprendizaje pico de 5e-5, semilla 20261030 y una política de batching definida por `max_items: 768`, `padded_seconds: 4608`, `attention_cost: 60000`, `decoder_tokens: 98304` y acumulación de gradiente de 2. El optimizador es SOAP por bloques (Adam en una eigenbase de Shampoo), con pesos en FP32 y autocast en BF16. El código de entrenamiento, destilación, RL y evaluación se distribuye como el paquete `moonshine` del repositorio del proyecto, con checkpoints reanudables.

## Capacidades

- Transcripción de voz a texto en inglés (`automatic-speech-recognition`), con especialización en habla disártrica.
- Reconocimiento de voz de hablantes con ELA, parálisis cerebral, síndrome de Down, Parkinson y afasia por ictus, que es la distribución objetivo del SAPC2.
- Manejo de vocabulario cerrado de 1.024 tokens, heredado del maestro `m15s`.
- Inferencia en `transformers` mediante `MoonshineForConditionalGeneration` o `CohereAsrForConditionalGeneration`, lo que permite integrarlo en pipelines estándar de Hugging Face.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito; es un modelo puramente ASR.

## Casos de uso

- Subtitulado en tiempo real para personas con habla disártrica: el modelo puede transcribir audio de micrófono en un dispositivo local y generar subtítulos en una aplicación de videollamada, con un coste computacional mínimo gracias a sus 4,2 M de parámetros.
- Comunicación aumentativa y alternativa (CAA): integrado en una aplicación de asistencia para usuarios con ELA o parálisis cerebral, convierte el habla en texto para sintetizarlo después con un TTS, y cabe en un teléfono o una Raspberry Pi.
- Investigación en ASR de accesibilidad: sirve como línea base ligera y reproducible para comparar técnicas de destilación, poda de profundidad o ajuste fino sobre el corpus SAPC2.
- Prototipado rápido de pipelines de voz: al ocupar pocos megabytes, permite iterar en local sin GPU y validar preprocesado, normalización y métricas (WER/CER) antes de escalar a modelos mayores de la misma familia.
- Despliegue en dispositivos empotrados o navegador: el tamano reducido hace viable la inferencia en CPU o en WebAssembly para aplicaciones sin conectividad ni backend.
- Evaluación comparativa de variantes Moonshine: junto con `m5g`, `m10s` y `m15s`, permite medir el compromiso entre profundidad, parámetros y WER dentro de la misma receta de destilación.
- Filtrado y anotación semiautomática de corpus de habla atípica: transcripciones preliminares que un revisor humano corrige después, con el ahorro de tiempo que ello implica en conjuntos de datos pequeños y costosos de anotar.

## Benchmarks y rendimiento

Los únicos datos publicados son evaluaciones de desarrollo sobre Dev-1000, un subconjunto fijo de 1.000 grabaciones del conjunto oficial Dev (identificadores elegidos por hash), con el normalizador de la competición y comparación contra la mejor de las dos referencias. El autor indica que las puntuaciones están a unas 0,1 décimas del scorer oficial SCTK sobre las mismas predicciones. El mejor punto es el step 1200, con 69,04 % WER y 53,24 % CER.

| Step | Dev-1000 WER | Dev-1000 CER |
|---:|---:|---:|
| 0 | 99,64 % | 94,93 % |
| 100 | 89,19 % | 77,51 % |
| 200 | 81,21 % | 66,45 % |
| 300 | 77,45 % | 62,25 % |
| 400 | 75,08 % | 59,29 % |
| 500 | 72,93 % | 57,37 % |
| 600 | 72,15 % | 56,88 % |
| 700 | 72,30 % | 56,71 % |
| 800 | 70,91 % | 55,11 % |
| 900 | 70,17 % | 54,69 % |
| 1000 | 70,04 % | 54,24 % |
| 1100 | 70,28 % | 54,60 % |
| 1200 | 69,04 % | 53,24 % |
| 1300 | 69,86 % | 53,71 % |
| 1332 | 69,74 % | 53,97 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de ASR (LibriSpeech, Common Voice) en la información disponible, ni puntuaciones sobre el conjunto Test oficial del SAPC2.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 17 MB con pesos en FP32 (4,23 M de parámetros × 4 bytes) y unos 8,5 MB en BF16/FP16; el pico real de memoria depende de la longitud del audio y de los estados de atención, no del tamano del modelo.
- GPU recomendadas: ninguna en particular. Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, e incluso en iGPU. A100/H100 solo tendrían sentido para servir muchos flujos concurrentes en batch.
- Cabe en GPU consumer: sí, sin restricciones prácticas; también en CPU, Raspberry Pi y dispositivos móviles.
- Opciones de despliegue: `transformers` con `MoonshineForConditionalGeneration` o `CohereAsrForConditionalGeneration`; integración con pipelines de Hugging Face y endpoints compatibles. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles. Dado el tamano, se espera latencia muy baja en CPU, pero no hay cifras publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tokenizer | WER (Dev-1000 SAPC2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sapc2-moonshine-m3g` (este) | 4.232.448 | Tokenizer 1.024 tokens; contexto no disponible | 69,04 % (step 1200) | MIT | Hugging Face, `transformers` |
| `sapc2-moonshine-m10s` | 10,8 M (anchura 256, 7 cabezas) | Tokenizer no disponible | No disponible | No disponible en la información | Hugging Face |
| `sapc2-moonshine-m15s` | No disponible | Tokenizer 1.024 tokens | No disponible (actúa como maestro de destilación) | No disponible en la información | Hugging Face |
| `sapc2-moonshine-tiny-rl` | 27 M (Moonshine Tiny, SFT + RL) | No disponible | No disponible | No disponible en la información | Hugging Face |
| Moonshine Tiny / Base (originales, `moonshine-ai`) | Clases tiny y base | Contexto y tokenizer no disponibles en la información | No disponible | No disponible en la información | GitHub `moonshine-ai/moonshine` |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: solo este modelo publica cifras de WER/CER sobre Dev-1000 en la información proporcionada.

## Limitaciones y advertencias

- Precisión muy baja para uso productivo: 69,04 % WER y 53,24 % CER en Dev-1000 implican que más de dos tercios de las palabras se transcriben incorrectamente; es un modelo experimental, no un ASR listo para desplegar.
- Evaluación limitada: las cifras provienen de un subconjunto de 1.000 grabaciones de Dev elegido por hash, no del conjunto Test oficial, y el propio autor señala una desviación de ~0,1 puntos respecto al scorer SCTK.
- Solo inglés: no hay soporte declarado de otros idiomas, ni de code-switching.
- Dominio restringido: está ajustado específicamente a habla disártrica del corpus SAPC2; su comportamiento en habla típica o en otras condiciones acústicas (ruido, telefonía, micrófonos lejanos) no está documentado.
- Sesgos potenciales: la distribución de hablantes del SAPC2 (cinco condiciones neurológicas concretas) puede no representar otras formas de habla atípica, y no se documenta ninguna evaluación de sesgo por edad, género o acento.
- Riesgo de alucinación en ASR: en modelos encoder-decoder pequenos con decodificación autoregresiva, los fallos se manifiestan como sustituciones y omisiones plausibles más que como silencios, lo que puede producir transcripciones engañosas.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el corpus de entrenamiento (SAPC2) puede tener condiciones propias que conviene verificar antes de un uso comercial; la model card no detalla dichas condiciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y tamano de repo declarado de 0,0 GB: no hay evidencia de validación externa ni de mantenimiento continuado.
- No se documentan límites de longitud de audio ni comportamiento con entradas largas, lo que obliga a validar el truncado en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/sapc2-moonshine-m3g
- Variante `sapc2-moonshine-m10s`: https://huggingface.co/vanshnawander/sapc2-moonshine-m10s
- Variante `sapc2-moonshine-tiny-rl`: https://huggingface.co/vanshnawander/sapc2-moonshine-tiny-rl
- Perfil del autor en GitHub: https://github.com/vanshnawander
- Documentación de variantes de Moonshine (DeepWiki): https://deepwiki.com/moonshine-ai/moonshine/8-model-variants
- Repositorio Moonshine (scripts): https://github.com/moonshine-ai/moonshine/tree/main/scripts
- Repositorio Moonshine (raíz): https://github.com/moonshine-ai/moonshine
