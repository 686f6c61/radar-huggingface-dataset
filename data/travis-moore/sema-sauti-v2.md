# travis-moore/sema-sauti-v2

## Resumen

Sema Sauti v2 es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot, desarrollado por Angelo Asante bajo el paraguas de Sema (semaink.com). Se construye como un fine-tune de ResembleAI/chatterbox y su objetivo es dar voz natural a lenguas de África Occidental —twi/akan, pidgin nigeriano y ghanés— manteniendo al mismo tiempo un inglés limpio y capacidades multilingües heredadas del modelo base. Con unos segundos de audio de referencia, el modelo reproduce el timbre de esa voz en los tres idiomas objetivo.

La relevancia del modelo está en su enfoque de fine-tuning parcial: solo se entrena la etapa de pronunciación (la que porta acento, ritmo y fonética), mientras que el codificador de voz y el vocoder permanecen congelados. Esto preserva la calidad de clonación zero-shot del modelo original y evita el deterioro del inglés, al tiempo que incorpora twi y pidgin con naturalidad. El checkpoint publicado corresponde al paso final 5124 de una tirada completa de entrenamiento.

El repositorio ocupa 3,2 GB y se distribuye con licencia propietaria "sema-internal", lo que restringe su uso. La model card no detalla el número de parámetros ni la longitud de contexto, y no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.), ya que se trata de un modelo generativo de audio y no de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basada en Chatterbox (ResembleAI); fine-tune de la etapa de pronunciación con encoder de voz y vocoder congelados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tw, pcm (objetivo entrenado); nl, fr, pt, it, es, de, sw, ms, no, da, sv, tr (heredados) |
| Licencia | sema-internal (propietaria, marcada como "other") |
| Formato de pesos | no disponible (directorio de modelo autocontenido cargable con `ChatterboxTTS.from_local`) |

## Arquitectura y entrenamiento

Sema Sauti v2 parte de ResembleAI/chatterbox, un sistema TTS con clonación de voz zero-shot que separa las etapas de codificación de voz, generación de pronunciación y vocoder. El fine-tune se aplica exclusivamente sobre la etapa de pronunciación, entrenada con varias horas de audio de twi y pidgin nigeriano, con múltiples hablantes, clips cortos, y con pidgin ghanés e inglés con acento africano mezclados en el dataset. El codificador de voz y el vocoder se dejan congelados para conservar la calidad de clonación y el inglés limpio del modelo base.

El checkpoint publicado corresponde al paso 5124, el paso final de la tirada completa. Según la model card, la curva de pérdida de evaluación toca fondo algo antes (paso 3300, que corresponde a v1), por lo que v2 intercambia una fracción mínima de esa métrica por más tiempo de exposición a los datos. No se especifica el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma estándar en TTS). No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz multilingüe con clonación zero-shot a partir de 7-10 segundos de audio de referencia.
- Idiomas objetivo entrenados: inglés, twi/akan y pidgin nigeriano y ghanés, incluido code-switching twi-inglés.
- Idiomas heredados del modelo base con inteligibilidad variable: neerlandés, portugués, alemán, turco, suajili, español, noruego, malayo, italiano, francés, danés y sueco.
- Control de expresividad y fidelidad mediante los parámetros `exaggeration` y `cfg_weight` (los ejemplos usan 0.5 y 0.5).
- Generación de audio con marca de agua inaudible en las salidas.
- No soporta árabe, chino, griego, hebreo, hindi, japonés, coreano ni ruso (sus escrituras no están en el tokenizador); finlandés y polaco solo parcialmente.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo exclusivamente de texto a voz.

## Casos de uso

- Doblaje y localización de contenido para audiencias de Ghana y Nigeria: el modelo puede leer guiones en twi, pidgin o inglés con una voz de referencia concreta, lo que permite producir versiones localizadas de vídeos, anuncios o material formativo sin un estudio de grabación.
- Asistentes de voz para atención al cliente en África Occidental: al clonar la voz de un agente o de un locutor de marca, se pueden generar respuestas de voz en pidgin nigeriano o ghanés para líneas de soporte telefónico, con pronunciación natural en lugar de inglés con acento extranjero.
- Audiolibros y contenido educativo en twi: la clonación zero-shot permite narrar material didáctico o literario con una voz consistente a lo largo de horas de audio, manteniendo el timbre entre sesiones mediante la misma referencia.
- Accesibilidad y lectura de textos para hablantes de lenguas locales: convertir documentos, noticias o mensajes en audio en twi o pidgin para usuarios con baja alfabetización o discapacidad visual, usando una voz familiar y comprensible.
- Prototipado de interfaces de voz para productos locales: desarrolladores que construyen apps para el mercado ghanés o nigeriano pueden integrar el modelo vía la librería chatterbox para generar prompts de voz, notificaciones y respuestas de IVR en los idiomas objetivo.
- Producción de contenido para redes sociales y podcasts: generar locuciones en pidgin o twi con la voz del creador a partir de una muestra corta, facilitando la creación de episodios o clips sin regrabar cada toma.
- Investigación en TTS de bajos recursos: el modelo sirve como referencia para estudiar fine-tuning parcial en lenguas africanas, comparando el efecto de congelar encoder y vocoder frente a entrenamientos completos.

## Benchmarks y rendimiento

La model card no presenta benchmarks estándar de TTS (MOS, WER, etc.), pero sí un test de lectura de una frase por idioma transcrita con Whisper large-v3 y medida como Character Error Rate (CER, menor es mejor; el suelo es ~8-10 porque el evaluador escribe "9" en lugar de "nine").

| Idioma | Codigo | CER de lectura |
|---|---|---|
| Neerlandes | nl | 7.5 |
| Portugues | pt | 8.9 |
| Aleman | de | 13.0 |
| Turco | tr | 13.5 |
| Suajili | sw | 15.0 |
| Espanol | es | 19.1 |
| Noruego | no | 19.4 |
| Malayo | ms | 19.6 |
| Italiano | it | 20.0 |
| Frances | fr | 25.5 |
| Danes | da | 28.9 |
| Sueco | sv | 35.1 |

No se han publicado resultados de benchmarks para los idiomas objetivo (en, tw, pcm) ni comparaciones con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el repositorio ocupa 3,2 GB, por lo que el modelo completo cabe holgadamente en GPUs de consumo con 8 GB o más, aunque la cifra exacta de VRAM en ejecución no se especifica.
- GPU recomendadas: no disponible; el ejemplo de uso emplea `device="cuda"` sin especificar modelo de GPU. Por tamaño, una RTX 3090, RTX 4090 o A100 serían suficientes, pero no está confirmado por el autor.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, pero no hay confirmación explícita.
- Opciones de despliegue: la librería chatterbox con `ChatterboxTTS.from_local`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas objetivo | Clonacion zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sema Sauti v2 | TTS fine-tune de Chatterbox | en, tw, pcm | Si (7-10 s de referencia) | sema-internal (propietaria) | Hugging Face |
| ResembleAI/chatterbox | TTS base | Multilingue (no especificado) | Si | MIT | Hugging Face |
| Sema Sauti v1 | TTS fine-tune de Chatterbox | en, tw, pcm | Si | sema-internal (propietaria) | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a licencia, idiomas y disponibilidad.

## Limitaciones y advertencias

- Twi y pidgin nigeriano son los idiomas más fuertes; el pidgin ghanés y camerunés llegan por transferencia y son más débiles, por lo que conviene usar una referencia de voz del idioma correspondiente.
- Los idiomas "también hablados" son capacidad retenida, no un fine-tune dedicado: cabe esperar acento ligero y errores ocasionales, con CER de hasta 35,1 en sueco.
- Los números, acrónimos y fechas son un punto débil conocido.
- No soporta escrituras no latinas (árabe, chino, griego, hebreo, hindi, japonés, coreano, ruso); finlandés y polaco solo parcialmente.
- La licencia "sema-internal" es propietaria y no se detallan los términos de uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- Riesgo de uso indebido por clonación de voz: solo debe clonarse voces sobre las que se tenga derecho; la suplantación sin consentimiento, el engaño y el fraude van contra la intención del lanzamiento.
- Las salidas llevan una marca de agua inaudible, pero no se especifica el mecanismo de detección ni su robustez.
- No hay datos publicados sobre sesgos demográficos o de acento más allá de las limitaciones lingüísticas descritas.
- No se han publicado benchmarks para los idiomas objetivo ni cifras de latencia, VRAM o throughput, lo que dificulta la planificación de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/travis-moore/sema-sauti-v2
- Version anterior (v1): https://huggingface.co/travis-moore/sema-sauti-v1
- Modelo base ResembleAI/chatterbox: https://huggingface.co/ResembleAI/chatterbox
- Sema: https://semaink.com
- Autor, Angelo Asante: https://angeloasante.com
- Curva de entrenamiento: https://huggingface.co/travis-moore/sema-sauti-v2/resolve/main/loss.png
