# Zyphra/ZONOS3-Mini

## Resumen

ZONOS3-Mini es un modelo compacto de texto a voz (TTS) desarrollado por Zyphra, publicado con licencia Apache 2.0. Su propuesta principal es ofrecer síntesis de voz natural y clonación de voz de alta fidelidad con tan solo unos 100 millones de parámetros activos, lo que le permite ejecutarse en tiempo real en portátiles, teléfonos e incluso directamente en el navegador mediante WebGPU. El modelo forma parte de la familia Zonos (evolución de Zonos v1 y v2) y se distribuye a través de Hugging Face con un repositorio de 37,3 GB.

Arquitectónicamente combina un backbone transformer con mezcla de expertos (MoE) latente y capas Gated DeltaNet (GDN) junto a capas de atención global, sobre un códec de audio dual que genera frames a 15 Hz y los renderiza a 44,1 kHz mediante una cabeza iSTFT causal multi-resolución. Incorpora controles acústicos granulares (volumen, ancho de banda y velocidad de habla) y permite tanto clonación de voz a partir de una muestra de referencia como diseño de voz mediante embeddings de hablante.

Es relevante ahora porque demuestra que la clonación de voz de calidad competitiva puede llevarse a hardware de consumo y al navegador, con una latencia de primer audio de 80 ms y un throughput de 457 segundos de audio por segundo en una H100, manteniendo una licencia permisiva que facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE latente híbrido con Gated DeltaNet + atención global; códec de audio dual con cabeza iSTFT causal |
| Parámetros totales | 800M |
| Parámetros activos | ~100M por token (MoE: 64 expertos, top-2 routing, desde la capa 1) |
| Longitud de contexto | 32.768 posiciones |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Normalización NeMo para inglés, mandarín, japonés, coreano, alemán, español, francés, italiano y portugués; otros idiomas pasan sin normalizar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y `model.pth` (bf16); decodificador en fp32 |

## Arquitectura y entrenamiento

El backbone consta de 11 capas con dimensión de modelo 1.024, patrón de mezcla de secuencia `gdn3_global1` (9 capas Gated DeltaNet y 2 capas de atención global con 16 cabezas de 32 dimensiones y 4 cabezas KV), y residuales de atención (`full_attnres`). El texto se tokeniza con SuperBPE de 8.192 entradas y se normaliza con NeMo en inferencia. El modelo autoregresivo genera frames de códec dual a 15 Hz con 10 codebooks de 4.096 entradas cada uno (1 semántico destilado de un profesor Wav2Vec2-BERT + 9 acústicos), bajo un patrón de retardo, y una cabeza iSTFT causal multi-resolución los renderiza a 44,1 kHz conforme se producen (hop de 2.940 muestras, hasta 10 minutos de audio por generación).

El acondicionamiento de hablante admite dos vías: un clip de referencia crudo codificado por el códec en un prefijo de tokens (hasta 60 s, con speaker CFG) o un único embedding de hablante MECT-B2 de 192 dimensiones (`ownmect_s2`). Los controles acústicos son tres filas bucketed: volumen (LUFS, 10 cubos), ancho de banda f_max (Hz, 10 cubos) y velocidad de habla (bytes UTF-8 por segundo, 30 cubos), cada una con índice "unknown"; los bordes de los cubos están en `params.json` (`condition_edges`). El decodificador dispone de dos variantes: `full_mr` (por defecto) y `keep2_plain` (podado, aproximadamente 3x más rápido en decodificación). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF/DPO.

## Capacidades

- Síntesis de voz natural a 44,1 kHz con generación de hasta 10 minutos de audio por petición.
- Clonación de voz a partir de una muestra de audio de referencia (hasta 60 s), sin necesidad de transcripción.
- Diseño de voz de personaje mediante control de edad, acento y textura vocal a través de embeddings de hablante.
- Control granular de emoción, ritmo y entrega, incluso a nivel de palabra individual, mediante los controles de volumen, ancho de banda y velocidad de habla.
- Normalización de texto NeMo en nueve idiomas; otros idiomas se procesan tal cual.
- Ejecución en tiempo real en portátiles, teléfonos y navegador (WebGPU), además de servidores CUDA y Apple Silicon (MLX).
- API HTTP compatible con OpenAI (`/v1/audio/speech`) mediante SGLang-Omni, con streaming PCM a 44,1 kHz y clonación de voz desde un clip de referencia.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni agentes; es un modelo especializado en TTS.

## Casos de uso

- Asistentes de voz en dispositivos: el modelo puede ejecutarse localmente en portátiles y teléfonos con ~100M de parámetros activos, permitiendo asistentes conversacionales sin conexión y con baja latencia (80 ms hasta el primer audio).
- Audiolibros y narración: la generación de hasta 10 minutos por petición y el control de ritmo, volumen y entrega a nivel de palabra permiten producir narraciones expresivas y consistentes con una voz clonada del narrador.
- Doblaje y localización: la clonación de voz desde un clip de referencia y la normalización en nueve idiomas facilitan generar versiones dobladas manteniendo el timbre del actor original.
- Videojuegos y personajes interactivos: el diseño de voz por edad, acento y textura vocal, junto con el control de emoción, permite crear voces de personaje dinámicas y ajustar la entrega en tiempo de ejecución.
- Atención al cliente automatizada: la API compatible con OpenAI y el streaming PCM a 44,1 kHz permiten integrarlo en pipelines de voz existentes para respuestas habladas de baja latencia.
- Accesibilidad: la síntesis local en navegador (WebGPU) posibilita lectores de pantalla y herramientas de accesibilidad que no dependen de servicios en la nube ni envían datos de voz a terceros.
- Prototipado rápido en el navegador: el Zonos Voice Studio y la versión Lite permiten probar clonación de voz sin instalación, útil para validar ideas antes de desplegar en servidor.

## Benchmarks y rendimiento

Los datos publicados en la model card se refieren a la evaluación ZTTS2-Eval (versión 2), que combina similitud de hablante macro y WER macro sobre 55 subconjuntos de idioma (FLEURS-R en 35 idiomas y VoxBlink2 en 20 idiomas), con una puntuación de ½ z(similitud) − ½ z(WER). Zonos 3 Mini se mide con el prompt de embedding de hablante.

| Métrica | Valor |
|---|---|
| Latencia hasta el primer audio (mediana, 8 peticiones concurrentes, H100 80GB) | 80 ms |
| Throughput máximo (audio generado por segundo de cómputo, H100 80GB) | 457 s de audio/s |
| Calidad (ZTTS2-Eval v2) | no disponible (la model card solo describe la métrica, sin cifras numéricas) |

No se han publicado resultados numéricos de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible, al tratarse de un modelo de texto a voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 800M parámetros totales en bf16, los pesos ocupan aproximadamente 1,6 GB, más overhead de decodificador en fp32 y caché de códec.
- GPU recomendadas: NVIDIA (servidor CUDA y SGLang-Omni), Apple Silicon (servidor MLX), y CPU/CUDA/Metal/Vulkan mediante el servidor C++/ggml.
- Cabe en GPU de consumo: sí, según la model card se ejecuta en tiempo real en portátiles y teléfonos, e incluso en el navegador mediante WebGPU.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve`), runtimes nativos de Zyphra (CUDA, MLX, C++/ggml con CLI, WebGPU), y Zyphra Cloud.
- Latencia y throughput: 80 ms de mediana hasta el primer audio con 8 peticiones concurrentes y 457 s de audio por segundo en una H100 80GB (datos de la model card).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ZONOS3-Mini | 800M totales / ~100M activos | 32.768 posiciones | Apache 2.0 | Hugging Face, GitHub, navegador, SGLang-Omni |
| Zonos v1 / v2 (Zyphra) | no disponible | no disponible | no disponible | no disponible |
| Otros TTS open source de la categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de parámetros, contexto, rendimiento o licencia de modelos alternativos de la misma categoría, por lo que la comparativa cuantitativa se limita al propio modelo.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información disponible; al ser un modelo de voz, puede heredar sesgos acústicos y de hablante de los datos de entrenamiento no especificados.
- Riesgo de alucinación en el sentido de pronunciación incorrecta, entonación anómala o artefactos acústicos en textos atípicos o idiomas sin normalización NeMo.
- La normalización de texto solo cubre nueve idiomas; el resto pasa sin normalizar, lo que puede degradar la calidad de pronunciación.
- La clonación de voz plantea riesgos de suplantación de identidad y deepfakes; es responsabilidad del integrador aplicar consentimiento y salvaguardas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los modelos de terceros empleados en el pipeline (NeMo, Wav2Vec2-BERT, MECT-B2) si se redistribuyen.
- No se especifican cuantizaciones oficiales ni requisitos exactos de VRAM; el despliegue en hardware limitado requiere validación propia.
- La variante de decodificador `keep2_plain` es unas 3x más rápida pero podada, lo que puede afectar a la calidad; debe evaluarse por caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyphra/ZONOS3-Mini
- Repositorio GitHub de runtimes: https://github.com/Zyphra/ZONOS3-Mini
- SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Guía de instalación de SGLang-Omni: https://github.com/sgl-project/sglang-omni/blob/main/docs/get_started/installation.md
- Cookbook de Zonos3: https://github.com/sgl-project/sglang-omni/blob/main/docs/cookbook/zonos3.md
- Zonos Voice Studio (WebGPU): https://zyphra.com/zonos3mini/localplayground#cast
- Zonos Voice Studio Lite: https://zyphra.com/zonos3mini/localplayground/lite
- Benchmark ZTTS2-Eval: https://zyphra.github.io/ZTTS2-Eval/
- Discord de Zyphra: https://discord.gg/gTW9JwST8q
