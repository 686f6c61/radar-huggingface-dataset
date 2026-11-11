# Zyphra/ZONOS3-Mini-hf

## Resumen

ZONOS3-Mini es un modelo compacto de síntesis de voz (text-to-speech) multilingüe desarrollado por Zyphra. Esta variante concreta, ZONOS3-Mini-hf, empaqueta el modelo para su uso directo con la librería `transformers` mediante código remoto (`trust_remote_code=True`), integrando en un único checkpoint el modelo de lenguaje, el decodificador de códec iSTFT multi-resolución causal (`keep2_plain`) y el codificador de hablante MECT-B2, junto con el tokenizador SuperBPE y las 27 voces de lanzamiento.

El modelo sintetiza voz mono a 44,1 kHz en CPU o GPU usando únicamente `torch` y `transformers`, y está orientado a tareas de clonación de voz y generación de habla natural en nueve idiomas (inglés, francés, alemán, español, italiano, portugués, japonés, chino mandarín y coreano). Con 1.041.465.640 parámetros totales y un tamaño de repositorio de 2,4 GB, se posiciona como una alternativa ligera frente a sistemas TTS de mayor escala.

Su relevancia actual radica en que ofrece clonación de voz a partir de un clip o de un embedding de 192 dimensiones, control fino de la generación (temperatura, top-k, top-p, penalización de repetición, condiciones de sonoridad y velocidad) y una licencia Apache 2.0 permisiva para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autorregresivo + decodificador de códec iSTFT multi-resolución causal (`keep2_plain`) + codificador de hablante MECT-B2 |
| Parámetros totales | 1.041.465.640 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de frames: 15 frames por segundo; `max_new_frames` limitado por el contexto restante) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, fr, de, es, it, pt, ja, zh, ko (gramáticas de normalización: `en_us`, `en_gb`, `fr_fr`, `de`, `es`, `it`, `pt_br`, `ja`, `cmn`, `ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LM en bfloat16; decodificador de códec y codificador de hablante en float32) |

## Arquitectura y entrenamiento

ZONOS3-Mini combina un modelo de lenguaje autorregresivo que genera frames de códec con un decodificador de códec iSTFT multi-resolución causal (denominado `keep2_plain`) que convierte esos frames en forma de onda de audio a 44,1 kHz. La clonación de voz se realiza mediante un codificador de hablante MECT-B2 que produce embeddings de 192 dimensiones, o bien mediante códigos de referencia precalculados del códec. El tokenizador es SuperBPE y el modelo incluye 27 voces de lanzamiento predefinidas.

El checkpoint empaqueta los tres componentes (LM, decodificador y codificador de hablante) en un único artefacto. El LM se almacena en bfloat16 (el dtype de lanzamiento), mientras que el decodificador de códec y el codificador de hablante permanecen siempre en float32. La implementación es fiel a la implementación de referencia del repositorio ZONOS3 (disposición del prompt, sampler, manejo de EOS y decodificación). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en nueve idiomas: inglés (variantes `en_us` y `en_gb`), francés, alemán, español, italiano, portugués (brasileño), japonés, chino mandarín y coreano.
- Clonación de voz mediante cuatro vías: voz de lanzamiento (`voice`), clip de audio (`speaker_audio`), embedding de hablante de 192 dimensiones (`speaker_embedding`) o códigos de referencia precalculados (`speaker_reference_codes`, hasta 60 segundos).
- Control de estilo de voz mediante `speaker_cfg_scale` (classifier-free guidance), que refuerza la identidad de la voz a costa de una segunda pasada del LM por paso.
- Control de condiciones acústicas: sonoridad (LUFS), frecuencia máxima (Hz) y velocidad de habla (bytes UTF-8 por segundo), tanto en valores continuos como en buckets discretos.
- Control de muestreo: temperatura (0,75 por defecto), top-k (80), top-p (0,69), min-p (0,0), penalización de repetición (2,4) con ventana de 96 y 6 codebooks.
- Normalización de texto opcional mediante `zyphra-textnorm` (lectura de números, fechas, divisas y unidades).
- Gestión de silencio inicial (`silence_prefill_frames`, 0 a 30 frames) y contexto de decodificación del tail de referencia (`decode_context`).
- Control de ganancia de salida (`headroom_db`, 3,0 dB con limitador suave a -1 dBFS) y fundido de salida (`fade_out_ms`).
- Reproducibilidad mediante semilla (`seed`, devuelta en `out.seed`).
- Acceso de bajo nivel para bucles de decodificación personalizados: `model.decode_codes(codes)` y `model(input_ids=rows, cache=cache)`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la clonación.

## Casos de uso

- **Audiolibros y narración automatizada**: el modelo sintetiza voz a 44,1 kHz con control de velocidad de habla y sonoridad, lo que permite generar capítulos completos con una voz consistente mediante un embedding de hablante reutilizable entre llamadas.
- **Clonación de voz para doblaje**: a partir de un clip de referencia de hasta 60 segundos se obtiene un embedding de 192 dimensiones que puede reutilizarse en múltiples llamadas, facilitando el doblaje de contenido a los nueve idiomas soportados.
- **Asistentes de voz integrados en aplicaciones**: la inferencia funciona en CPU o GPU con solo `torch` y `transformers`, lo que permite desplegar el modelo en entornos sin acelerador dedicado para respuestas habladas de baja latencia.
- **Generación de voces para videojuegos y contenido interactivo**: las 27 voces de lanzamiento incluyen estilos diferenciados (ASMR, anunciador, anime, irlandés, británico, energético), útiles para poblar personajes con identidades vocales distintas sin entrenamiento adicional.
- **Localización de contenido multimedia**: la normalización de texto específica por idioma (`es`, `fr_fr`, `de`, `it`, `pt_br`, `ja`, `cmn`, `ko`) permite leer correctamente números, fechas, divisas y unidades en cada mercado.
- **Prototipado de interfaces de voz**: los parámetros de muestreo, las condiciones acústicas en buckets y el control de silencio inicial permiten ajustar el resultado a distintos contextos de producto sin reentrenar el modelo.
- **Investigación en síntesis de voz**: el acceso de bajo nivel a `decode_codes` y a pasos individuales del LM con caché facilita experimentos con estrategias de decodificación personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 2,4 GB y el modelo tiene 1.041.465.640 parámetros; el LM se almacena en bfloat16 y el decodificador y el codificador de hablante en float32.
- GPU recomendadas: no disponible. El modelo funciona tanto en CPU como en GPU (`model.to("cuda" if torch.cuda.is_available() else "cpu")`).
- Compatibilidad con GPU de consumo: no se especifica. Dado el tamaño del checkpoint (2,4 GB), es plausible que quepa en GPUs de consumo, pero no se confirma en la información disponible.
- Opciones de despliegue: `transformers` (versión >= 4.57) con `trust_remote_code=True`; `AutoModel` o `AutoModelForTextToWaveform`. Los runtimes nativos (CUDA, MLX, ggml, WebGPU) y la API HTTP completa están en el repositorio ZONOS3.
- Latencia y throughput: no disponibles. Se documenta que `speaker_cfg_scale` superior a 1 implica una segunda pasada del LM por paso, lo que duplica el coste de generación.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo.
- Riesgo de alucinación no evaluado en la información disponible; en TTS, esto puede manifestarse como prosodia incorrecta o pronunciación anómala.
- La codificación de un clip de audio en códigos de códec requiere el codificador del códec de los runtimes nativos; en esta variante `transformers`, los clips se clonan únicamente mediante el embedding de hablante.
- El uso de `speaker_cfg_scale` superior a 1 duplica el coste computacional por paso (segunda pasada del LM).
- El contexto de referencia para clonación está limitado a 60 segundos como máximo.
- El presupuesto de generación se mide en frames (15 por segundo) y está acotado por el contexto restante (`max_new_frames`).
- La normalización de texto requiere instalar `zyphra-textnorm`; sin él, solo se colapsan los saltos de línea y se emite un aviso.
- En `transformers` 4.x, el LM se carga en float32 salvo que se pase `dtype=torch.bfloat16`, lo que afecta al consumo de memoria.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las implicaciones éticas y legales de la clonación de voz (consentimiento, suplantación de identidad).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyphra/ZONOS3-Mini-hf
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Blog post con detalles, muestras y evaluaciones: https://www.zyphra.com/our-work/zonos3-mini
- Repositorio ZONOS3 (runtimes nativos y API HTTP): https://github.com/Zyphra/ZONOS3
