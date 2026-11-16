# Zyphra/ZONOS3-Mini-transformers

## Resumen

ZONOS3-Mini es un modelo compacto de síntesis de voz (text-to-speech) multilingüe desarrollado por Zyphra, publicado en 2026 bajo licencia Apache-2.0. Se trata de la versión mini de la familia ZONOS3 y está diseñado para generar habla natural en 43 idiomas, incluyendo clonación de voz a partir de una muestra de audio de referencia. Su tamaño contenido (897 millones de parámetros totales, alrededor de 100 millones activos por token) lo sitúa en la categoría de modelos TTS desplegables en hardware modesto.

La arquitectura combina un backbone transformer de 11 capas con mezcla de expertos (MoE) latente de 64 expertos y enrutamiento top-2, junto con un mezclador de secuencias híbrido compuesto por 9 capas Gated DeltaNet y 2 capas de atención global. El modelo opera sobre tokens de audio a 15 Hz generados por el códec ZAC-1, con 10 codebooks de 4.096 entradas cada uno (uno semántico y nueve acústicos), y emplea un tokenizador de texto SuperBPE de 8.192 entradas.

Este repositorio concreto es el port nativo a `transformers` (identificador `zonos3_mini`, sin necesidad de `trust_remote_code`), que incluye el modelo de lenguaje, el codificador de hablante MECT-B2, el procesador y 27 voces de lanzamiento predefinidas. Es relevante para desarrolladores porque ofrece una vía de integración directa con el ecosistema Hugging Face `transformers` sin código remoto, con soporte de clonación de voz y contexto de 32.768 posiciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE latente (64 expertos, top-2), 9 capas Gated DeltaNet + 2 capas de atención global |
| Parámetros totales | 897.459.432 |
| Parámetros activos | ~100 millones por token |
| Longitud de contexto | 32.768 posiciones |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; el codificador de hablante en float32) |
| Idiomas soportados | 43 idiomas (en, fr, es, de, it, pt, nl, pl, ru, sv, tr, uk, cs, da, fi, el, hu, no, ro, sk, bg, zh, ja, ko, ar, he, vi, id, th, tl, ms, ka, hi, bn, ta, te, mr, gu, kn, ml, pa, or, ur) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone consta de 11 capas con dimensión 1.024 y una capa MoE latente con 64 expertos y enrutamiento top-2 desde la primera capa. El mezclador de secuencias es híbrido: 9 capas Gated DeltaNet (atención lineal con estado recurrente) combinadas con 2 capas de atención global, lo que permite manejar un contexto de 32.768 posiciones con coste computacional reducido. La tokenización de texto usa SuperBPE con 8.192 entradas más 4 tokens especiales.

La generación de audio se apoya en el códec ZAC-1 (decodificador `keep2_plain`), que produce tokens a 15 Hz con 10 codebooks de 4.096 entradas (1 semántico + 9 acústicos) y un hop de 2.940 muestras a 44,1 kHz. El condicionamiento de hablante puede realizarse de dos formas: mediante un prefijo de códigos de referencia del códec de hasta 60 segundos, o mediante un embedding de hablante de 192 dimensiones extraído por el codificador MECT-B2. El modelo de lenguaje se distribuye en bfloat16 y el codificador de hablante en float32.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO u otras técnicas de alineación.

## Capacidades

- Síntesis de voz multilingüe en 43 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, árabe, hindi y lenguas indias adicionales.
- Clonación de voz a partir de una muestra de audio de referencia (44,1 kHz) o mediante un embedding de hablante de 192 dimensiones.
- Condicionamiento de estilo y prosodia mediante parámetros como `speaker_guidance`, `guidance_scale`, loudness, fmax y velocidad de habla.
- 27 voces de lanzamiento predefinidas con metadatos de idioma, estilo y género.
- Procesamiento de números, fechas, monedas y unidades mediante el paquete opcional `zyphra-textnorm` para normalización de texto.
- Soporte de batching y compilación con `torch.compile` para despliegue en producción.
- Integración nativa con `transformers` mediante `AutoModelForTextToWaveform` y `AutoProcessor`, sin `trust_remote_code`.
- No se indica soporte de tool calling, agentes ni razonamiento multi-paso; es un modelo especializado en TTS.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede generar voz natural en 43 idiomas con contexto de 32.768 posiciones, adecuado para fragmentos largos de texto sin perder coherencia prosódica.
- Asistentes de voz y atención al cliente: permite sintetizar respuestas con una voz de marca consistente mediante las 27 voces predefinidas o clonación a partir de una muestra corta.
- Localización de contenido multimedia: un mismo pipeline puede doblar vídeos o pódcast a múltiples idiomas manteniendo el timbre del hablante original gracias a la clonación por embedding MECT-B2.
- Accesibilidad y lectores de pantalla: integración en aplicaciones que convierten texto a voz en tiempo real, con soporte de normalización de números, fechas y unidades mediante `zyphra-textnorm`.
- Generación de voces para videojuegos y personajes: las 27 voces de lanzamiento y el condicionamiento de estilo permiten crear diálogos variados sin grabar actores para cada personaje.
- Prototipado de productos de voz: al ser un modelo de ~897 M de parámetros con licencia Apache-2.0, puede desplegarse en entornos de desarrollo y pruebas sin coste de licencia y con requisitos de hardware moderados.
- Investigación en TTS y clonación de voz: el port nativo a `transformers` facilita la experimentación, el ajuste fino y la comparación con otros modelos dentro del ecosistema Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (~1,8 GB de repo), se estima un consumo de VRAM en torno a 2-3 GB para el modelo base, más memoria adicional para el códec ZAC-1 y el procesamiento de audio. No se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo debería caber en GPUs consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090), aunque no se confirma oficialmente.
- Cabe en GPU consumer: probablemente sí, dado el tamaño de ~897 M de parámetros, pero no hay confirmación oficial.
- Opciones de despliegue: `transformers` con `AutoModelForTextToWaveform` y `AutoProcessor`; soporte de `device_map="auto"` y `torch.compile`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS multilingüe con clonación de voz) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo; al ser un modelo TTS multilingüe, es previsible que herede sesgos de los datos de entrenamiento en cuanto a acentos, géneros y variedades dialectales, pero no se confirma.
- Riesgo de alucinación en la prosodia o pronunciación de texto ambiguo, especialmente sin el paquete `zyphra-textnorm` para normalizar números, fechas y unidades.
- La clonación de voz plantea riesgos de uso indebido (suplantación de identidad, deepfakes); aunque la licencia es Apache-2.0, el despliegue en producción debería incorporar salvaguardas y consentimiento explícito.
- El contexto está limitado a 32.768 posiciones; textos más largos deben fragmentarse.
- La calidad en los 43 idiomas puede variar; no se proporcionan evaluaciones por idioma.
- El modelo requiere audio de referencia a 44,1 kHz para clonación; muestras de otra frecuencia pueden degradar el resultado.
- No se indican restricciones de licencia para uso comercial más allá de las condiciones de Apache-2.0 (atribución y aviso de cambios).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Zyphra/ZONOS3-Mini-transformers)
- [Modelo base ZONOS3-Mini](https://huggingface.co/Zyphra/ZONOS3-Mini)
- [Códec ZAC-1](https://huggingface.co/Zyphra/ZAC-1-hf)
- [Blog post de Zyphra](https://www.zyphra.com/our-work/zonos3-mini)
- [Informe técnico (arXiv:2611.16525)](https://arxiv.org/abs/2611.16525)
