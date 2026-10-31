# zhihefang/LUVE

## Resumen

LUVE es un sistema de generacion de video texto-a-video de ultra alta resolucion, publicado como checkpoints de inferencia en HuggingFace por el autor zhihefang y asociado al grupo NJU-PCALab. El sistema se presenta en el paper "LUVE: Latent-Cascaded Ultra-High-Resolution Video Generation with Dual Frequency Experts" (aceptado en ICML 2026) y resuelve el problema de generar video en resoluciones 2K y 4K, algo que los modelos de difusion de video nativos manejan con dificultad por el coste computacional de procesar latentes de gran tamano.

La propuesta tecnica de LUVE es un enfoque de cascada latente: en lugar de generar directamente a alta resolucion, se apoya sobre Wan2.1-T2V-1.3B para producir un video latente de baja resolucion (720x1280), que despues se reescala mediante un upsampler de latentes de video entrenado (VLU) y se refina con un modulo de refinamiento de contenido de alta resolucion (HCR). La innovacion principal son los "expertos duales de frecuencia": un experto de atencion de baja frecuencia que actua en los pasos iniciales del scheduler y un experto FFN de alta frecuencia para los pasos finales, con enrutado basado en el timestep.

Los checkpoints publicados incluyen dos perfiles de resolucion (2K: 1472x2560 y 4K: 2176x3840), ambos con 49 fotogramas a 15 FPS, en formato safetensors bajo licencia CC-BY-4.0. Requiere los componentes originales de Wan2.1-T2V-1.3B (generador de baja resolucion, codificador de texto T5, tokenizador y VAE) por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada latente sobre Wan2.1-T2V-1.3B: upsampler de latentes de video (VLU) + refinador de alta resolucion (HCR) con expertos duales de frecuencia (FFT) |
| Parametros totales | no disponible (tamano del repo: 6,5 GB por perfil) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del codificador T5/umT5-xxl de Wan2.1) |
| Tipos de cuantizacion | BF16 (runtime requiere GPU con soporte BF16) |
| Idiomas soportados | no disponible (el codificador base umT5-xxl es multilingue) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (namespaces `hcr.` y `vlu.`) |

| Parametro de generacion | 2K | 4K |
|---|---|---|
| Resolucion de salida | 1472x2560 | 2176x3840 |
| Resolucion de baja resolucion previa | 720x1280 | 720x1280 |
| Fotogramas / FPS | 49 / 15 | 49 / 15 |
| Pasos de generacion de baja resolucion | 50 | 50 |
| Pasos del scheduler HCR / prefijo omitido | 50 / 10 | 50 / 10 |
| CFG / semilla por defecto | 5 / 0 | 5 / 0 |

## Arquitectura y entrenamiento

LUVE sigue un diseno de cascada latente en tres etapas. Primero, el generador base Wan2.1-T2V-1.3B produce un video latente de baja resolucion (720x1280, 49 fotogramas) a partir del prompt de texto, usando 50 pasos de muestreo. Segundo, el modulo VLU (video latent upsampler), entrenado especificamente, reescala ese latente a la resolucion objetivo. Tercero, el modulo HCR (high-resolution content refinement) refina el latente reescalado durante 50 pasos, omitiendo los 10 primeros (prefijo omitido), para anadir detalle de alta frecuencia.

La innovacion central es el mecanismo de expertos duales de frecuencia. El modelo nativo aplica filtrado de frecuencia FFT sobre las activaciones y enruta entre dos expertos segun el timestep del scheduler en una escala de 1000 pasos: se selecciona el experto de atencion de baja frecuencia cuando `t >= 875` y el experto FFN de alta frecuencia cuando `t < 875`. El enrutado se realiza antes de convertir el timestep a BF16. Ambos expertos estan incluidos en el checkpoint unico (`model.safetensors`) de cada perfil, sin necesidad de archivos LoRA separados.

No se ha publicado una descripcion del dataset de entrenamiento ni detalles de los procedimientos de entrenamiento en la informacion disponible; el model card remite al paper para el metodo de investigacion y sus experimentos.

## Capacidades

- Generacion de video texto-a-video en 2K (1472x2560) y 4K (2176x3840), con 49 fotogramas a 15 FPS (unos 3,3 segundos de video).
- Generacion en dos etapas: latente de baja resolucion de 720x1280 seguido de upsampling y refinado de alta resolucion.
- Enrutado por frecuencia: el experto de baja frecuencia modela estructura global al inicio del muestreo y el de alta frecuencia anade detalle fino al final.
- Uso del codificador de texto T5/umT5-xxl de Wan2.1 para la codificacion de prompts.
- Validacion de integridad de pesos y rutas con `luve-generate --check-only --verify-weights`.
- Salida en formato MP4.
- No hay soporte documentado de tool calling, agentes, vision de entrada ni audio: es un modelo de generacion de video puro.

## Casos de uso

- Produccion de fondos de video en alta resolucion: generacion de paisajes, abstractos y fondos cinematicos en 2K/4K para cabeceras de web, videowalls o pantallas de eventos, aprovechando la resolucion nativa de salida sin upscalers externos.
- Previsualizacion cinematografica (previz): generacion rapida de planos de referencia a partir de descripciones de texto para equipos de direccion de fotografia y storyboard, con la semilla fija (por defecto 0) para reproducibilidad.
- Generacion de material de stock: creacion de clips cortos de unos 3 segundos con licencia CC-BY-4.0, adecuada para reutilizacion con atribucion en proyectos de contenido.
- Investigacion en difusion de video: el enfoque de cascada latente con expertos de frecuencia y el codigo abierto del runtime permiten estudiar mecanismos de refinado de alta resolucion y compararlos con alternativas de superresolucion de video.
- Pipelines de postproduccion: integracion en flujos de trabajo automatizados mediante la CLI `luve-generate`, con validacion previa de pesos y componentes para entornos de ejecucion desatendida.
- Evaluacion de upscalers de latentes: el modulo VLU y su configuracion (`vlu_config.yaml`) pueden servir como referencia para desarrollar o comparar upsamplers de latentes de video.
- Prototipado de efectos de alta frecuencia: dado que el refinado HCR opera sobre un latente ya generado, es posible reutilizar latentes de baja resolucion cacheados para iterar solo la etapa de refinado, como se hace en las propias verificaciones del release.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de video en la informacion disponible. El model card indica explicitamente que las verificaciones del release son comprobaciones de implementacion (carga de checkpoints, consistencia numerica bit a bit entre la implementacion FFT de expertos separados y la integrada, y salida finita en un paso de denoising 4K), no benchmarks de calidad. Para los experimentos de calidad reportados hay que acudir al paper. Ademas, se advierte que una generacion completa de video 4K no ha sido verificada para este release.

## Requisitos de hardware

- VRAM estimada: no disponible en cifras concretas; el model card indica que la memoria GPU requerida depende de la resolucion, el numero de fotogramas y la implementacion de atencion. La generacion 4K a 49 fotogramas sera la configuracion mas exigente.
- GPU recomendadas: no disponible; se requiere una GPU CUDA con soporte BF16. Por el tamano del pipeline (Wan2.1-T2V-1.3B + umT5-xxl + refinado a 2K/4K), una GPU de gama alta de datos (A100/H100) o una consumer de mucha VRAM (RTX 4090) es lo razonable, pero es una estimacion no confirmada por el autor.
- Cabe en GPU consumer: no disponible; no hay confirmacion oficial de que quepa en GPUs consumer.
- Opciones de despliegue: runtime propio `luve-generate` (Linux, Python 3.10, CUDA). No hay soporte documentado de vLLM, TGI, Ollama ni llama.cpp (no aplicable: no es un modelo de lenguaje). Los pesos se descargan con `huggingface_hub.snapshot_download` y los componentes de Wan2.1-T2V-1.3B deben descargarse por separado.
- Latencia y throughput: no disponible. Como referencia estructural, cada generacion implica 50 pasos para el latente de baja resolucion mas 50 pasos HCR (con 10 omitidos), lo que situa el coste minimo en unos 90 pasos de difusion por video.

## Comparativa con modelos similares

| Modelo | Enfoque | Resolucion maxima | Parametros base | Licencia |
|---|---|---|---|---|
| LUVE (este modelo) | Cascada latente + expertos de frecuencia sobre Wan2.1-T2V-1.3B | 2176x3840 (4K), 49 frames | Base 1,3B + modulos VLU/HCR (total no disponible) | CC-BY-4.0 |
| Wan2.1-T2V-1.3B (base) | Difusion texto-a-video directa | 480p nativo (720x1280 en este pipeline) | 1,3B | Apache-2.0 |
| Wan2.1-T2V-14B | Difusion texto-a-video directa, modelo grande | 720p | 14B | Apache-2.0 |

LUVE se diferencia de sus alternativas en que no escala los parametros del generador sino la resolucion de salida mediante cascada latente y refinado por expertos de frecuencia, alcanzando 4K donde el modelo base se limita a 720x1280. Comparado con usar un modelo base mas grande (Wan2.1-T2V-14B), LUVE requiere menos capacidad de generacion pero anade la etapa de refinado HCR. No hay datos de rendimiento comparativo publicados en la informacion disponible.

## Limitaciones y advertencias

- No se ha verificado una generacion completa de video 4K para este release: solo se comprobó la salida finita de un paso de denoising con la forma completa del latente de 49 fotogramas.
- Las verificaciones publicadas son de implementacion (consistencia numerica), no de calidad de video; no establecen equivalencia con implementaciones sin FFT ni rendimiento across prompts, semillas, hardware o kernels de atencion.
- Los checkpoints de LUVE no incluyen los componentes de Wan2.1-T2V-1.3B (generador de baja resolucion, T5, tokenizador, VAE): deben descargarse y configurarse por separado, y la generacion carga archivos locales sin descargas automaticas.
- No hay descripcion del dataset de entrenamiento ni resultados de evaluacion de calidad en este release; hay que acudir al paper.
- Sesgos: no documentados; al heredar el generador base Wan2.1-T2V-1.3B, puede heredar sus sesgos, pero no hay analisis publicado en la informacion disponible.
- Riesgo de alucinacion/artefactos: propio de modelos de difusion de video; no cuantificado en este release.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion; conviene revisar tambien la licencia de los componentes base de Wan2.1 (Apache-2.0) y del tokenizador umT5-xxl de Google.
- Los videos generados duran aproximadamente 3,3 segundos (49 frames a 15 FPS), lo que limita su uso a clips cortos.
- Proyecto con muy poca traccion publica (0 descargas, 1 like en el momento de la ficha); la madurez del ecosistema y el soporte comunitario son limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhihefang/LUVE
- Paper (arXiv): https://arxiv.org/abs/2602.11564
- Codigo e instrucciones de instalacion (GitHub): https://github.com/NJU-PCALab/LUVE
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
