# walston/X-MDD

## Resumen

X-MDD es un modelo especializado en deteccion y diagnostico de errores de pronunciacion (MDD, *mispronunciation detection and diagnosis*) construido sobre el backbone Qwen3-ASR-1.7B. Lo desarrolla el autor walston (autoria academica: Xintong Wang, Junchuan Zhao y Ye Wang) y se presenta como el checkpoint principal del articulo arXiv:2610.23079. El modelo resuelve un problema concreto: dado el audio canonico de una frase (sintetizado por TTS y clonado de la voz del estudiante), la secuencia de fonemas canonicos y el audio real del hablante no nativo, genera la secuencia de fonemas que el estudiante efectivamente pronuncio; alineando esa salida con los fonemas canonicos se obtiene la deteccion y el diagnostico de los errores.

La arquitectura es la de Qwen3-ASR-1.7B (encoder AuT, proyector y decoder LLM) con todos los parametros afinados salvo el front end Conv2D del AuT. El entrenamiento combina SFT sobre mandarin e ingles (7000 pasos, 0 a 4 demostraciones en contexto) y un posterior ajuste con GRPO (300 pasos, 1 a 2 demostraciones, recompensa 0.5·F1 + 0.5·(1−PER)). El checkpoint publicado corresponde al paso 275 de GRPO.

Su relevancia radica en el enfoque de aprendizaje en contexto (ICL) con referencias canonicas, que permite aplicar el modelo a lenguas no vistas durante el entrenamiento sin reentrenar: el propio autor reporta resultados en arabe (QuranMB) como idioma no visto. El modelo tiene 2.349.465.458 parametros en safetensors (bf16), ocupa 4,7 GB en el repositorio y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder ASR (Qwen3-ASR: AuT + proyector + decoder LLM) con cabeza CTC heredada sin uso |
| Parametros totales | 2.349.465.458 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | chino (zh), ingles (en), arabe (ar, como idioma no visto en entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-1.7B, un sistema de reconocimiento automatico del habla compuesto por un encoder de audio (AuT), un proyector que mapea las representaciones acusticas al espacio del LLM y un decoder basado en lenguaje. En X-MDD se afinan todos los parametros excepto el front end Conv2D del AuT. El repositorio incluye ademas una cabeza CTC (`ctc_head.*`) heredada del modelo base que no se utiliza en inferencia.

El entrenamiento se estructura en dos fases. Primero, un SFT sobre datos de mandarin e ingles con entre 0 y 4 demostraciones en contexto, durante 7000 pasos. Despues, un ajuste con GRPO de 300 pasos usando 1 o 2 demostraciones, con una recompensa compuesta de 0.5·F1 + 0.5·(1−PER). El checkpoint publicado es el paso 275 de esa fase GRPO. Para generar el audio canonico se emplean TTS externos: Fun-CosyVoice3-0.5B para chino e ingles y SILMA TTS para arabe. La innovacion central es el uso de referencias canonicas (audio canonico clonado de la voz del estudiante mas secuencia de fonemas canonica) junto con demostraciones en contexto, lo que habilita el diagnostico en lenguas no vistas mediante decodificacion restringida al inventario fonetico objetivo. El vocabulario de entrenamiento contiene 242 fonemas (fonemas tonales del chino mas los 39 fonemas CMU).

## Capacidades

- Deteccion y diagnostico de errores de pronunciacion a partir de audio del estudiante, audio canonico y fonemas canonicos.
- Generacion de la secuencia de fonemas efectivamente producida por el hablante, alineable con la referencia canonica.
- Aprendizaje en contexto: acepta de 0 a 4 demostraciones (o hasta 128 en el caso de arabe) para adaptarse a un hablante o idioma.
- Generalizacion a idiomas no vistos en entrenamiento (arabe) mediante prefijos de idioma y decodificacion restringida a un conjunto de fonemas.
- Procesamiento de habla multilingue en chino, ingles y arabe.
- Soporte de decodificacion restringida (`--constrain-phones`) para limitar la salida al inventario fonetico del idioma objetivo.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio generativo.

## Casos de uso

- Evaluacion de pronunciacion en plataformas de aprendizaje de idiomas: el modelo recibe el audio del alumno y una referencia canonica sintetizada con su propia voz, y devuelve la secuencia de fonemas producida para senalar que fonemas se han desviado.
- Diagnostico fonetico para logopedas y profesores de idiomas: la alineacion entre fonemas canonicos y producidos permite identificar errores sistematicos por hablante y priorizar la intervencion.
- Investigacion en adquisicion de segundas lenguas: el modo ICL con 0 a 4 demostraciones facilita experimentos comparativos sobre corpus como L2-ARCTIC sin reentrenar el modelo.
- Extension a lenguas de bajos recursos: al soportar idiomas no vistos con decodificacion restringida e ICL, sirve para prototipar sistemas MDD en idiomas sin datos etiquetados, como el caso reportado del arabe en QuranMB.
- Recitacion y evaluacion de textos sagrados o poeticos: el uso de audio canonico y fonemas de referencia encaja con la verificacion de recitacion (por ejemplo, coranica) donde la precision fonetica es critica.
- Generacion de material de correccion personalizado: la salida de fonemas producidos puede alimentar herramientas que sinteticen ejercicios o feedback dirigido a los errores detectados del alumno.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (PER = *phone error rate*, F1 y DER = *diagnosis error rate*):

| Conjunto de prueba | Demostraciones | PER ↓ | F1 ↑ | DER ↓ |
|---|---|---|---|---|
| Mandarin | 4 | 17.66 | 79.00 | 31.32 |
| Ingles (L2-ARCTIC) | 4 | 12.86 | 58.88 | 19.47 |
| Arabe, QuranMB (no visto) | 128 | 7.75 | 38.07 | 40.33 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos MDD.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 5 GB solo para pesos (2,35 mil millones de parametros), mas el coste del encoder de audio, el proyector y las activaciones; en la practica se recomienda al menos 8-12 GB para margen.
- GPU recomendadas: A100 o H100 para evaluacion por lotes y throughput alto; RTX 4090 o RTX 3090 para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 (por ejemplo RTX 3070/4060 Ti en adelante), siempre que se gestione con cuidado el procesamiento de audio y las demostraciones en contexto.
- Opciones de despliegue: el autor proporciona un script propio (`scripts/evaluate_qwen3_multilingual_bpe_icl_dev.py`) que carga el checkpoint sobre la arquitectura de `Qwen/Qwen3-ASR-1.7B-hf`; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-MDD (walston) | 2,35 B | no disponible | MDD multilingue con ICL | Apache 2.0 | Hugging Face |
| Qwen3-ASR-1.7B (modelo base) | ~1,7 B | no disponible | ASR generico | no disponible en la informacion | Hugging Face |
| Otros sistemas MDD especializados | no disponible | no disponible | MDD | no disponible | no disponible |

No se dispone de datos de rendimiento de alternativas MDD comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo depende de un audio canonico sintetizado por TTS (Fun-CosyVoice3-0.5B o SILMA TTS) y de la secuencia de fonemas canonicos; la calidad de esas referencias condiciona directamente el diagnostico.
- El entrenamiento supervisado se limita a mandarin e ingles; el rendimiento en otras lenguas (como el arabe) depende de ICL y decodificacion restringida, con F1 y DER notablemente peores (F1 38,07 y DER 40,33 en QuranMB).
- El DER en mandarin (31,32) y en arabe (40,33) indica una tasa de error de diagnostico considerable para uso clinico o certificador sin supervision humana.
- Riesgo de alucinacion en la secuencia de fonemas generada, especialmente con demostraciones escasas o audio ruidoso; se recomienda validacion con alineacion y umbrales.
- No hay informacion sobre sesgos por acento, edad, genero o calidad de grabacion; el uso de TTS clonado de la voz del estudiante puede introducir artefactos.
- El repositorio incluye una cabeza CTC heredada sin uso y requiere descargar por separado el modelo base Qwen3-ASR-1.7B-hf para la arquitectura, lo que anade dependencias de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni evaluaciones de robustez en produccion.
- El checkpoint publicado corresponde al paso 275 de GRPO, no al final del entrenamiento; puede no ser el optimo para todos los dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/walston/X-MDD
- Articulo: https://arxiv.org/abs/2610.23079
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base (variante hf): https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
