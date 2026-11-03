# TechnoBaptist/Audio8-TTS-Realistic-Air

## Resumen

Audio8-TTS-Realistic-Air es un modelo de síntesis de voz (text-to-speech) con capacidad de clonación de voz zero-shot, desarrollado por TechnoBaptist como fine-tuning de Edge0/Audio8-TTS-Preview-0.6b. Con 601 millones de parámetros en el modelo principal (el códec de audio se cuenta aparte), el modelo mantiene la arquitectura compacta de su predecesor pero mejora sustancialmente el realismo del habla: prosodia más natural y una entrega más expresiva. Su principal novedad respecto al Preview es la ampliación de cobertura lingüística de 11 a 23 idiomas, añadiendo doce lenguas nuevas entre las que se incluyen árabe, hindi, ruso, portugués o vietnamita.

El modelo emplea una arquitectura DualAR inspirada en Fish Audio S2 Pro: un transformer autorregresivo lento que predice un token semántico por cada frame de audio y un transformer autorregresivo rápido que predice los codebooks del códec condicionado al estado oculto del lento. El códec neuronal incluido opera a 44,1 kHz con 2.048 muestras por frame, lo que se traduce en aproximadamente 21,5 frames por segundo. La ventana de contexto alcanza hasta 2.048 posiciones empaquetadas de texto y audio.

Su relevancia actual radica en que ofrece clonación de voz zero-shot y generación multilingüe en un tamaño de 0,6B parámetros, lo que lo hace desplegable en hardware relativamente modesto, con licencia Apache 2.0 y un adaptador de serving para SGLang Omni con atención paginada y batching dinámico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (transformer autorregresivo lento + autorregresivo rápido), inspirada en Fish Audio S2 Pro |
| Parametros totales | 601.159.424 (modelo principal, excluye el códec) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 23: zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 2,6 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura DualAR de dos transformadores autorregresivos. El componente lento consta de 24 capas con anchura 896, 14 cabezas de atención y 2 cabezas KV; predice un token semántico por cada frame de audio. El componente rápido consta de 4 capas con la misma anchura y configuración de cabezas; predice los codebooks del códec para cada frame, condicionado al estado oculto del modelo lento y a los codebooks precedentes. El códec acústico utiliza 10 codebooks de 4.096 entradas cada uno y opera a 44,1 kHz con 2.048 muestras por frame (aproximadamente 21,5 frames por segundo). El códec incluido gestiona tanto la codificación del audio de referencia como la decodificación de la forma de onda, por lo que no requiere un checkpoint de códec adicional.

El modelo es un fine-tuning de Edge0/Audio8-TTS-Preview-0.6b. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal de esta versión es la mejora del realismo del habla y la ampliación a 23 idiomas (12 añadidos respecto al Preview), manteniendo la misma interfaz de inferencia con Transformers. La model card menciona soporte de serving de alto rendimiento mediante un adaptador SGLang Omni con atención paginada y batching dinámico.

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas, con calidad variable según la lengua.
- Clonación de voz zero-shot a partir de una grabación de referencia y su transcripción exacta.
- Generación de habla sin audio de referencia.
- Salida de audio a 44,1 kHz mediante el códec neuronal incluido.
- Interfaz de inferencia compatible con Transformers mediante `trust_remote_code=True`.
- Serving de alto rendimiento con SGLang Omni y API de voz compatible con OpenAI.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Clonación de voz para doblaje y localización: el modelo permite generar habla en cualquiera de los 23 idiomas a partir de una muestra de referencia, lo que facilita adaptar un mismo locutor a múltiples mercados lingüísticos sin regrabar.
- Audiolibros y narración automatizada: la mejora de prosodia y expresividad respecto al Preview lo hace adecuado para narrativa de larga duración, con generación sin referencia o con una voz de referencia consistente.
- Asistentes de voz embebidos: con 0,6B parámetros y un códec de 44,1 kHz, el modelo puede integrarse en pipelines de atención al cliente o interfaces conversacionales donde el coste de inferencia por petición es crítico.
- Accesibilidad y lectura de contenido: conversión de texto a voz natural para personas con discapacidad visual o para lectura de documentos, con soporte de 23 idiomas que cubre la mayoría de lenguas europeas y asiáticas relevantes.
- Producción de contenido multimedia: generación de locuciones para vídeo, pódcast o publicidad con voces clonadas y control de estilo mediante la referencia de audio.
- Serving a escala con SGLang Omni: el adaptador con atención paginada, batching dinámico y API compatible con OpenAI permite desplegar el modelo como servicio de TTS en producción con múltiples peticiones concurrentes.
- Investigación en TTS multilingüe: la licencia Apache 2.0 y el tamaño compacto facilitan experimentación y fine-tuning adicional sobre el modelo base.

## Benchmarks y rendimiento

La información proporcionada menciona una sección de evaluación y resultados por idioma en la model card, pero no incluye los valores numéricos de los benchmarks. Por tanto:

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo principal tiene 601 millones de parámetros; en BF16 requiere aproximadamente 1,2 GB solo para los pesos, más el códec incluido y los estados de atención. El repo completo ocupa 2,6 GB.
- GPU recomendadas: la model card indica que se probó con PyTorch 2.8.0 y Transformers 4.57.3 en una NVIDIA H20 con BF16. Se recomienda una GPU con soporte CUDA.
- GPU de consumo: por el tamaño (0,6B), es plausible que quepa en GPUs de consumo con suficiente VRAM, aunque la información disponible no confirma modelos concretos ni cifras medidas.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; SGLang Omni para serving de alto rendimiento con atención paginada y batching dinámico; API compatible con OpenAI a través de SGLang Omni. No se documentan opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-Air | 601 M (sin códec) | 2.048 posiciones | 23 | Apache 2.0 | Fine-tuning de Audio8-TTS-Preview-0.6b; clonación zero-shot; códec 44,1 kHz |
| Audio8-TTS-Preview-0.6b | 0,6B (sin códec) | No disponible | 11 | No disponible en la información | Modelo base del que deriva; menor realismo y cobertura lingüística |
| Fish Audio S2 Pro | No disponible | No disponible | No disponible | No disponible | Arquitectura de referencia (DualAR) en la que se inspira el modelo |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La calidad del habla varía según el idioma; la propia model card advierte que la calidad lingüística es desigual y remite a la evaluación por idioma.
- La clonación de voz zero-shot exige una grabación de referencia limpia y una transcripción que coincida exactamente con el contenido hablado; discrepancias degradan el resultado.
- Riesgo de uso indebido de la clonación de voz (suplantación, deepfakes); aunque la licencia es Apache 2.0, el despliegue en producción debe incorporar controles de consentimiento y verificación.
- Riesgo de alucinación o artefactos en la síntesis, especialmente en textos largos, idiomas de menor cobertura o referencias de audio ruidosas.
- La ventana de contexto está limitada a 2.048 posiciones empaquetadas de texto/audio, lo que restringe la duración de las secuencias generadas en una sola pasada.
- El modelo requiere `trust_remote_code=True` y código personalizado de Transformers; es necesario revisar los archivos del repositorio antes de ejecutarlo.
- No se documentan datos de sesgos demográficos o acústicos; se recomienda evaluar el modelo con las voces y lenguas objetivo antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero la información disponible no detalla condiciones adicionales del autor ni del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/TechnoBaptist/Audio8-TTS-Realistic-Air
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub: https://github.com/Edge0-AI/Audio8_TTS
- Demo: https://edge0-ai.github.io/Audio8_TTS/realistic-0.6b/
- Paper (arXiv): https://arxiv.org/abs/2610.14776
- Playground (Space): https://huggingface.co/spaces/Edge0/Audio8-TTS-Realistic-Air
- Fish Audio S2 Pro (arquitectura de referencia): https://github.com/fishaudio/fish-speech
