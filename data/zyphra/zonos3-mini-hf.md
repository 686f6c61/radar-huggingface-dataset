# Zyphra/ZONOS3-Mini-hf

## Resumen

ZONOS3-Mini es un modelo compacto de síntesis de voz (text-to-speech) desarrollado por Zyphra, diseñado para generar habla de alta calidad en 43 idiomas con clonación de voz a partir de muestras cortas. El modelo combina un backbone de lenguaje de aproximadamente 800 millones de parámetros totales con unos 100 millones de parámetros activos por token, junto con un códec de decodificación iSTFT causal multi-resolución (`keep2_plain`) y un codificador de hablante MECT-B2. Genera audio mono a 44,1 kHz y puede ejecutarse tanto en CPU como en GPU.

Este repositorio concreto (`Zyphra/ZONOS3-Mini-hf`) empaqueta el modelo para su uso directo con la librería `transformers` mediante código remoto (`trust_remote_code=True`), integrando en un único checkpoint el modelo de lenguaje, el decodificador de códec y el codificador de hablante, además del tokenizador SuperBPE y las 27 voces de lanzamiento. Con 1.041.465.640 parámetros totales en safetensors, es una opción ligera para despliegues de TTS multilingüe en producción.

Su relevancia actual radica en que ofrece clonación de voz multilingüe con una licencia permisiva (Apache 2.0) y un tamaño que permite inferencia en hardware modesto, compitiendo en el espacio de TTS open source donde la mayoría de alternativas o son monolingües o requieren infraestructura considerable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje (LM) + códec de decodificación iSTFT causal multi-resolución (`keep2_plain`) + codificador de hablante MECT-B2 |
| Parámetros totales | 1.041.465.640 (backbone de ~800 M; ~100 M activos por token) |
| Parámetros activos | ~100 M por token (backbone) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 43 idiomas (en, fr, es, de, it, pt, nl, pl, ru, sv, tr, uk, cs, da, fi, el, hu, no, ro, sk, bg, zh, ja, ko, ar, he, vi, id, th, tl, ms, ka, hi, bn, ta, te, mr, gu, kn, ml, pa, or, ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LM en bfloat16; códec y codificador de hablante en float32) |

## Arquitectura y entrenamiento

ZONOS3-Mini se compone de tres piezas integradas en un único checkpoint: un modelo de lenguaje que actúa como backbone generador, un códec de decodificación iSTFT causal multi-resolución denominado `keep2_plain` que transforma las representaciones latentes en forma de onda de audio a 44,1 kHz, y un codificador de hablante MECT-B2 que produce embeddings de 192 dimensiones para la clonación de voz. El tokenizador es SuperBPE. El backbone opera con aproximadamente 800 millones de parámetros totales y unos 100 millones activos por token, lo que sugiere un diseño eficiente en cómputo, aunque la model card no detalla explícitamente si se trata de una arquitectura MoE u otra variante de activación dispersa.

La model card no proporciona detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La normalización de texto se realiza mediante gramáticas de NeMo a través del paquete `zyphra_textnorm` para inglés, mandarín, japonés, coreano, alemán, español, francés, italiano y portugués; el resto de idiomas se procesan tal cual, colapsando saltos de línea. El código indica que `language` selecciona la normalización, no un token de idioma en el prompt.

## Capacidades

- Síntesis de voz multilingüe en 43 idiomas, incluyendo locales específicos como inglés estadounidense (`en_us`), inglés británico (`en_gb`), francés (`fr_fr`) y portugués brasileño (`pt_br`).
- Clonación de voz a partir de un clip de audio (`speaker_audio`), de un embedding de hablante de 192 dimensiones (`speaker_embedding`) o de códigos de códec precalculados (`speaker_reference_codes`, hasta 60 segundos).
- 27 voces de lanzamiento predefinidas con estilos y géneros variados (p. ej. `Savannah` americana femenina, `Cillian` irlandesa masculina, `Morgana` estilo bruja, `Willow` estilo ASMR).
- Control de la fuerza de la voz mediante `speaker_cfg_scale` (classifier-free guidance), que realiza una segunda pasada del LM por paso cuando el valor supera 1.
- Generación de audio mono a 44,1 kHz con salida en forma de onda directamente utilizable.
- Ejecución en CPU o GPU con solo `torch` y `transformers`.
- Normalización de texto opcional para números, fechas, divisas y unidades en nueve idiomas.
- Compatibilidad con `AutoModelForTextToWaveform` además de `AutoModel`.

## Casos de uso

- **Atención al cliente automatizada con voz:** el modelo puede generar respuestas habladas en el idioma del cliente (43 idiomas disponibles) y clonar la voz de la marca a partir de un clip de referencia, integrándose en pipelines de IVR o asistentes telefónicos.
- **Audiolibros y narración multilingüe:** con 27 voces de lanzamiento y estilos que van desde locutor (`Thaddeus`) hasta ASMR (`Willow`), permite producir narraciones en varios idiomas desde un mismo sistema, manteniendo la voz consistente mediante `speaker_embedding` reutilizable entre llamadas.
- **Doblaje y localización de vídeo:** la clonación por embedding permite transferir la voz de un actor original a otro idioma, generando pistas de audio dobladas a 44,1 kHz mono para su posterior mezcla.
- **Accesibilidad y lectores de pantalla:** su capacidad de ejecución en CPU y su tamaño compacto (~1.000 M de parámetros) lo hacen viable en entornos de escritorio o dispositivos sin GPU dedicada para la lectura en voz alta de contenido.
- **Prototipado de asistentes conversacionales:** la API simple de `transformers` (`model.generate(texto, voice=...)`) permite integrar TTS en prototipos de asistentes de voz con tool calling en el backend de forma rápida.
- **Generación de contenido para redes y marketing:** producción de locuciones publicitarias en múltiples idiomas con voces estilizadas, usando `speaker_cfg_scale` para reforzar la identidad vocal en cada pieza.
- **Investigación en clonación de voz:** el acceso a embeddings de 192 dimensiones y a códigos de códec permite experimentar con técnicas de transferencia de hablante y evaluación de similitud vocal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma explícita. Con 1.041 M de parámetros, el LM en bfloat16 ocupa aproximadamente 2 GB; el códec y el codificador de hablante en float32 añaden una cantidad no especificada. El tamaño total del repositorio es de 2,4 GB.
- **GPU recomendadas:** no disponible en la información proporcionada. El modelo declara ejecución en CPU o GPU sin requisitos específicos.
- **Compatibilidad con GPU de consumo:** el tamaño del checkpoint (2,4 GB) sugiere que cabe en GPU de consumo con suficiente VRAM, pero no se confirma en la documentación.
- **Opciones de despliegue:** `transformers` (con `trust_remote_code=True`), y runtimes nativos CUDA, MLX, ggml y WebGPU disponibles en el repositorio de GitHub de ZONOS3-Mini. También existe una API HTTP completa y Zyphra Cloud.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparativas con otros modelos de TTS que permitan una tabla rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; como todo sistema de TTS entrenado con datos de voz, puede reflejar sesgos de género, acento o idioma presentes en el corpus de entrenamiento.
- Riesgo de alucinación en el sentido de prosodia incorrecta, pronunciación errónea o artefactos acústicos, especialmente en idiomas sin normalización de texto (los 34 idiomas que no cuentan con gramáticas NeMo).
- La clonación de voz plantea riesgos de suplantación de identidad y uso malicioso (deepfakes de audio); la licencia Apache 2.0 no impone restricciones de uso ético, por lo que la responsabilidad recae en el implementador.
- La clonación a partir de un clip en bruto se realiza mediante el codificador de hablante (embedding), no mediante los códigos de códec; para obtener códigos de códec a partir de un clip se necesita el codificador del códec de los runtimes nativos, que no está incluido en este paquete de `transformers`.
- El LM se almacena en bfloat16; en `transformers` 4.x se carga en float32 salvo que se pase `dtype=torch.bfloat16`, lo que duplica el uso de memoria.
- La salida es audio mono a 44,1 kHz; no se documenta soporte de audio estéreo ni de otras frecuencias de muestreo.
- No se dispone de información sobre la longitud máxima de texto de entrada ni sobre el contexto del modelo.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni condiciones adicionales más allá de las estándar de dicha licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyphra/ZONOS3-Mini-hf
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Blog post: https://www.zyphra.com/our-work/zonos3-mini
- Informe técnico (arXiv): https://arxiv.org/abs/2611.16525
- Repositorio GitHub (runtimes nativos y API HTTP): https://github.com/Zyphra/ZONOS3-Mini
- Browser studio: https://zyphra.com/zonos3-mini/localplayground#cast
- Interfaz Lite de clonación de voz: https://zyphra.com/zonos3-mini/localplayground/lite
- Zyphra Cloud: https://cloud.zyphra.com/models/zyphra/ZONOS3-Mini
