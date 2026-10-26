# vanshnawander/sapc2-moonshine-m5g

## Resumen

sapc2-moonshine-m5g es un modelo de reconocimiento automático del habla (ASR) en inglés, publicado por el usuario vanshnawander, consistente en un ajuste fino del modelo Moonshine para el Speech Accessibility Project Challenge 2 (SAPC2). El objetivo concreto es transcribir habla disártrica de personas con esclerosis lateral amiotrófica (ELA), parálisis cerebral, síndrome de Down, enfermedad de Parkinson y secuelas de ictus, un dominio en el que los sistemas ASR generalistas fallan con frecuencia. El modelo es extremadamente pequeno: 5.563.776 parámetros en total, según los pesos en safetensors del repositorio.

Arquitectónicamente es un encoder-decoder de tipo Moonshine con anchura 192 y 5 cabezas de atención, derivado por destilación de conocimiento de un modelo profesor mayor (m15s de la misma serie SAPC2) y inicializado recortando un modelo intermedio m7g. La familia Moonshine, desarrollada por moonshine-ai, sustituye los embeddings posicionales absolutos por Rotary Position Embedding (RoPE) para procesar audio de duración variable sin padding, lo que reduce latencia y coste computacional en dispositivos con recursos limitados.

Su relevancia es doble. Por un lado, aborda un caso de accesibilidad concreto y poco cubierto: la transcripción de habla atípica. Por otro, sirve como evidencia empírica de hasta dónde llega la destilación en un modelo de 5,6 M de parámetros para una tarea acústicamente difícil: el mejor checkpoint (paso 1200) alcanza un 62,83 % de WER en el subconjunto Dev-1000, y el decodificado greedy sobre el Dev completo (47.929 grabaciones) obtiene un 64,55 % de WER y un 47,84 % de CER. Son cifras altas en términos absolutos, pero publicadas con análisis de error detallado por duración y etiología, lo que lo convierte en un artefacto de investigación reproducible más que en un producto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo Moonshine (transformer seq2seq con RoPE en lugar de embeddings posicionales absolutos, sin padding) |
| Parámetros totales | 5.563.776 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de decodificación de 200 s usada en la evaluación del Dev completo; no se especifica límite arquitectónico) |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se incluyen pesos GGUF ni cuantizados) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Anchura del modelo | 192 |
| Cabezas de atención | 5 |
| Pipeline | automatic-speech-recognition |
| Modelo profesor | m15s (SAPC2), según la receta de entrenamiento |
| Inicialización | m5g recortado desde m7g |
| Tamaño del repositorio | 0.0 GB |
| Fecha de creación / actualización | 2026-10-23 / 2026-10-26 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine: un encoder-decoder de secuencia a secuencia pensado para transcripción de baja latencia, que usa RoPE para manejar audio de longitud variable sin necesidad de padding y así evitar cómputo desaprovechado. En esta variante concreta, la anchura es de 192 y el número de cabezas de atención es 5, lo que da un total de 5,56 M de parámetros. El checkpoint de partida no se entrena desde cero: se recorta un modelo m7g (`m5g_cut_from_m7g`) y se destila desde el modelo profesor `m15s2/best` de la misma familia SAPC2.

La receta de entrenamiento publicada especifica destilación de conocimiento con `kd_weight` 0,5, un learning rate máximo de 5e-5, una sola época y muestreo balanceado con un máximo de 2 repeticiones por ítem (`balance_max_repeats: 2`). La política de batching incluida en la configuración fija `max_items: 768`, `padded_seconds: 4608`, `attention_cost: 60000` y `decoder_tokens: 98304`. Los datos proceden del Speech Accessibility Project y cubren habla inglesa de hablantes con ELA, parálisis cerebral, síndrome de Down, Parkinson e ictus; el número total de horas de entrenamiento no está disponible en la información proporcionada. No se documenta uso de RLHF ni DPO.

## Capacidades

- Reconocimiento automático del habla en inglés sobre habla disártrica, incluyendo cinco etiologías distintas (ELA, parálisis cerebral, síndrome de Down, Parkinson e ictus).
- Decodificación greedy sobre grabaciones completas con ventanas de 200 s, tal como se empleó en la evaluación del Dev completo.
- Transcripción de audio de duración variable sin padding, gracias al uso de RoPE.
- Ejecución en hardware muy modesto: la evaluación completa de 47.929 grabaciones se completó en 11 minutos sobre una RTX 4050.
- Integración con el ecosistema transformers como pipeline `automatic-speech-recognition`; el tag `endpoints_compatible` indica compatibilidad con Inference Endpoints.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio generativo ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Subtitulado y transcripción asistida para hablantes con habla disártrica: el ajuste específico sobre el corpus SAPC2 lo hace más adecuado que un ASR generalista para este perfil, siempre que se asuma un WER alto y se combine con corrección humana o un modelo de lenguaje para posprocesado.
- Investigación en accesibilidad del habla: sirve como línea base de 5,6 M de parámetros para medir la brecha frente a modelos mayores dentro del mismo reto SAPC2, con resultados desglosados por etiología y duración.
- Prototipado en dispositivos de borde (edge): con 5,56 M de parámetros el modelo cabe holgadamente en CPU, Raspberry Pi o móvil, lo que permite validar interfaces de voz sin infraestructura GPU.
- Pre-etiquetado y aumento de datos: sus predicciones sobre el Dev del reto (incluidas en `evaluations/` del repositorio) pueden usarse para analizar errores sistemáticos y guiar la curación de corpus de habla atípica.
- Experimentos de destilación: la receta publicada (profesor m15s, inicialización desde m7g, `kd_weight` 0,5, una época, muestreo balanceado) es reproducible y útil para estudiar la degradación de calidad al comprimir ASR especializado.
- Herramientas de comunicación aumentativa y alternativa (AAC): como componente de transcripción local en aplicaciones que priorizan privacidad y funcionamiento sin conexión, con revisión humana obligatoria dada la tasa de error.
- Análisis clínico o lingüístico de muestras de habla: con 26,88 % de transcripciones exactas en el Dev completo, resulta útil para cribado y segmentación, no para transcripción literal de historiales.

## Benchmarks y rendimiento

Subconjunto Dev-1000 (1.000 grabaciones fijas del Dev oficial, normalizador de la competición contra la mejor de las dos referencias):

| Paso | Dev-1000 WER | Dev-1000 CER |
|---:|---:|---:|
| 0 | 99,28 % | 95,48 % |
| 500 | 69,22 % | 51,64 % |
| 1000 | 63,24 % | 47,36 % |
| 1200 (mejor) | 62,83 % | 46,77 % |
| 1300 | 63,23 % | 46,86 % |
| 1332 (final) | 63,30 % | 46,94 % |

Dev completo (47.929 grabaciones, decodificación greedy, ventanas de 200 s, scorer rápido con normalizador de la competición):

| Métrica | Valor |
|---|---:|
| WER | 64,55 % |
| CER | 47,84 % |
| Transcripciones vacías | 0 |
| Grabaciones truncadas por tope | 48 |
| Tiempo de decodificación | 11 min en RTX 4050 |
| Transcripciones exactas | 26,88 % |
| Sustituciones / deleciones / inserciones | 49,35 % / 8,04 % / 11,31 % de las palabras de referencia |
| WER sin tope | 68,70 % |

WER por duración del audio:

| Duración | Grabaciones | WER | Cuota de errores |
|---|---:|---:|---:|
| 1-2 s | 670 | 52,19 % | 0,30 % |
| 2-3 s | 4.354 | 40,71 % | 2,27 % |
| 3-5 s | 14.700 | 43,58 % | 10,59 % |
| 5-8 s | 14.739 | 53,82 % | 18,51 % |
| 8-12 s | 7.023 | 65,19 % | 15,33 % |
| 12-20 s | 3.867 | 73,64 % | 15,40 % |
| 20-35 s | 1.657 | 79,35 % | 16,22 % |
| >35 s | 919 | 84,23 % | 21,39 % |

WER por etiología:

| Etiología | Grabaciones | WER | Cuota de errores |
|---|---:|---:|---:|
| ELA | 10.232 | 61,68 % | 20,79 % |
| Parálisis cerebral | 11.472 | 68,39 % | 20,60 % |
| Síndrome de Down | 7.719 | 63,75 % | 11,58 % |
| Parkinson | 14.543 | 66,01 % | 42,45 % |
| Ictus | 3.963 | 55,37 % | 4,58 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo es exclusivamente ASR y las métricas anteriores son las únicas reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 22 MB en fp32, 11 MB en fp16 y 5,6 MB en int8 a partir del recuento de parámetros; el repositorio ocupa 0,0 GB.
- GPU recomendadas: innecesarias. El propio autor reporta la decodificación del Dev completo (47.929 grabaciones) en 11 minutos sobre una RTX 4050, es decir, aproximadamente 72 grabaciones por segundo en esa GPU (sin datos de duración total de audio, por lo que no se puede derivar el factor de tiempo real).
- Cabe en cualquier GPU de consumo e incluso en CPU, Raspberry Pi o dispositivos móviles; no requiere A100 ni H100.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de transformers, Inference Endpoints (tag `endpoints_compatible`) y, en general, cualquier runtime compatible con safetensors de transformers. No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles más allá del dato agregado de 11 minutos para 47.929 grabaciones en RTX 4050.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sapc2-moonshine-m5g | 5,56 M | Ventana de 200 s en evaluación | 64,55 % WER en Dev SAPC2 (47.929 grabaciones) | MIT | Hugging Face |
| Moonshine tiny (moonshine-ai) | 27 M | No disponible | No disponible para habla disártrica | No disponible en la información recogida | Hugging Face / repositorio moonshine-ai |
| Moonshine base (moonshine-ai) | 61 M | No disponible | No disponible para habla disártrica | No disponible en la información recogida | Hugging Face / repositorio moonshine-ai |

Los dos modelos de moonshine-ai están entrenados sobre habla general (200.000 horas según la documentación pública) y no reportan resultados en el dominio disártrico, por lo que no existe una comparación directa de WER publicada en la información disponible. Cualquier ASR generalista de mayor tamano requeriría una evaluación propia sobre el Dev de SAPC2 para ser comparable.

## Limitaciones y advertencias

- Calidad absoluta baja: 64,55 % de WER y 47,84 % de CER en el Dev completo. Solo el 26,88 % de las grabaciones se transcriben de forma exacta.
- Sesgo de dominio: entrenado exclusivamente con habla inglesa disártrica de cinco etiologías; el rendimiento fuera de ese dominio (habla típica, otros acentos, otros idiomas) no está documentado y previsiblemente será peor.
- Degradación severa con la duración: el WER pasa del 40,71 % en audios de 2-3 s al 84,23 % en audios de más de 35 s, y ese último tramo concentra el 21,39 % de todos los errores.
- Alucinación y transcripciones desbocadas: 1.665 hipótesis superan 1,5 veces la longitud de la referencia y concentran el 7,79 % de los errores; hay además 780 transcripciones truncadas. Los ejemplos del autor muestran salidas incoherentes con repeticiones en grabaciones largas.
- Dependencia de la etiología: la parálisis cerebral es la peor cubierta (68,39 % WER) y Parkinson concentra el 42,45 % de todos los errores, lo que desaconseja un uso uniforme sin calibración por subpoblación.
- El tope de ventana de 200 s provoca truncamiento en 48 grabaciones del Dev; audios más largos requieren segmentación propia.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor no documenta evaluaciones de seguridad, sesgo demográfico ni robustez fuera del conjunto de evaluación.
- No apto para producción crítica (transcripción médica, legal o de emergencias) sin revisión humana y sin un modelo de posprocesado que corrija el habla disártrica.
- No hay datos publicados sobre cuantización, por lo que el comportamiento tras conversión a GGUF o int8 debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/sapc2-moonshine-m5g
- Documentación de Moonshine en transformers: https://huggingface.co/docs/transformers/model_doc/moonshine
- Repositorio de moonshine-ai: https://github.com/moonshine-ai/moonshine
- Ficha de Moonshine en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/moonshine-moonshine-ai
- Registro del modelo en free2aitools: https://free2aitools.com/model/vanshnawander/sapc2-moonshine-m5g
