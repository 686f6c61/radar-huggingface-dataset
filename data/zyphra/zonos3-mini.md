# Zyphra/ZONOS3-Mini

## Resumen

ZONOS3-Mini es un modelo de síntesis de voz (text-to-speech) desarrollado por Zyphra, publicado en noviembre de 2026 bajo licencia Apache 2.0. Se trata de un modelo compacto con 886 millones de parámetros totales y aproximadamente 100 millones de parámetros activos, diseñado para ejecutarse en tiempo real en dispositivos de consumo, incluidos portátiles y teléfonos, e incluso directamente en el navegador mediante WebGPU. Su propuesta principal es ofrecer clonación de voz de alta fidelidad y control fino sobre emoción, ritmo y textura vocal a partir de una muestra de audio de referencia.

El modelo aborda el problema de la síntesis de voz multilingüe de calidad con un coste computacional muy reducido. Soporta 43 idiomas, lo que lo sitúa como una alternativa abierta y ligera frente a sistemas propietarios de TTS. La arquitectura combina un backbone híbrido de atención y GDN con mezcla de expertos (MoE), un tokenizador SuperBPE de 8.192 entradas y una cabeza de síntesis iSTFT multi-resolución que genera audio a 44,1 kHz.

Su relevancia actual radica en la combinación de licencia permisiva, despliegue local sin servidor (WebGPU, MLX, ggml) y soporte de clonación de voz sin transcripción de referencia, lo que facilita su integración en aplicaciones de asistencia por voz, videojuegos y narración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GDN/atención con mezcla de expertos (MoE), decodificación autorregresiva de frames dual-codec a 15 Hz y cabeza iSTFT causal multi-resolución |
| Parámetros totales | 886.342.504 |
| Parámetros activos | Aproximadamente 100 millones (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (variantes disponibles en el repositorio); cuantizaciones adicionales no disponibles |
| Idiomas soportados | 43 idiomas (en, fr, es, de, it, pt, nl, pl, ru, sv, tr, uk, cs, da, fi, el, hu, no, ro, sk, bg, zh, ja, ko, ar, he, vi, id, th, tl, ms, ka, hi, bn, ta, te, mr, gu, kn, ml, pa, or, ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, shards WebGPU |

## Arquitectura y entrenamiento

El texto se normaliza con NeMo para inglés, mandarín, japonés, coreano, alemán, español, francés, italiano y portugués; el resto de idiomas pasa tal cual. Posteriormente se codifica con un tokenizador SuperBPE de 8.192 entradas. El modelo de lenguaje genera de forma autorregresiva frames dual-codec a 15 Hz, compuestos por 10 codebooks de 4.096 entradas cada uno: un codebook semántico destilado de un profesor Wav2Vec2-BERT y nueve codebooks acústicos. La generación está condicionada por el texto, un prompt de hablante y tres controles acústicos agrupados en buckets. Una cabeza iSTFT causal multi-resolución renderiza los frames a audio de 44,1 kHz a medida que se producen.

El backbone es un transformer híbrido que combina atención con capas GDN (gated delta network) y mezcla de expertos, lo que permite mantener un coste de inferencia bajo con solo unos 100 millones de parámetros activos. La predicción de los diez codebooks sigue un patrón de retardo (delay pattern) que el modelo aplica en cada frame. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz multilingüe en 43 idiomas con normalización de texto NeMo para los principales idiomas.
- Clonación de voz a partir de una muestra de audio de referencia, sin necesidad de transcripción.
- Diseño de voz sintética mediante el ajuste de edad, acento y textura vocal.
- Control de emoción, ritmo y estilo de locución, incluyendo ajustes a nivel de palabra individual.
- Generación de audio a 44,1 kHz en tiempo real, con soporte de streaming.
- Ejecución local en navegador mediante WebGPU, sin instalación ni servidor.
- Despliegue mediante API HTTP compatible con el endpoint `/v1/audio/speech` de OpenAI a través de SGLang-Omni.
- Incluye 27 voces por defecto agrupadas por idioma.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni procesamiento de visión o audio de entrada más allá de la referencia de voz.

## Casos de uso

- Asistentes de voz en aplicaciones móviles: el modelo se ejecuta en tiempo real en teléfonos y portátiles, lo que permite integrar síntesis de voz local sin depender de servicios en la nube y sin latencia de red.
- Videojuegos y narrativa interactiva: el control de emoción, ritmo y estilo a nivel de palabra permite generar diálogos dinámicos con voces de personaje diseñadas por edad, acento y textura.
- Clonación de voz para accesibilidad: a partir de una muestra de audio, se puede replicar la voz de un usuario para sistemas de comunicación aumentativa, con la ventaja de que el procesamiento puede ser local.
- Doblaje y localización de contenidos: con soporte de 43 idiomas y clonación de voz, se pueden generar versiones dobladas manteniendo la identidad vocal del locutor original.
- Lectura de textos y audiolibros: la generación a 44,1 kHz y el control de ritmo permiten producir narraciones de alta fidelidad, con la posibilidad de ejecutarse en el navegador mediante WebGPU.
- Integración en pipelines de producción con SGLang-Omni: el servidor expone un endpoint compatible con OpenAI, lo que facilita sustituir servicios de TTS propietarios en aplicaciones existentes con streaming PCM.
- Prototipado rápido en el navegador: el Zonos Voice Studio y la versión Lite permiten probar clonación de voz sin instalar nada, útil para evaluar el modelo antes de integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 886 millones de parámetros totales y unos 100 millones activos, el modelo es apto para GPUs de consumo, aunque el repositorio ocupa 31,6 GB por incluir múltiples formatos y shards.
- GPU recomendadas: NVIDIA con CUDA (servidor CUDA propio y SGLang-Omni), Apple Silicon mediante MLX, y cualquier GPU con soporte WebGPU para la ejecución en navegador.
- Cabe en GPU de consumo: sí, el modelo está diseñado para ejecutarse en portátiles y teléfonos en tiempo real; también hay un servidor C++/ggml para CPU, CUDA, Metal o Vulkan.
- Opciones de despliegue: SGLang-Omni (endpoint compatible con OpenAI), runtimes nativos de Zyphra (CUDA, MLX, C++/ggml), WebGPU en navegador, y pesos GGUF para llama.cpp y entornos similares.
- Latencia y throughput: el modelo se describe como de tiempo real en dispositivos de consumo, pero no se proporcionan cifras concretas de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. La comparativa cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZONOS3-Mini | 886 M totales / ~100 M activos | no disponible | 43 | Apache 2.0 | Hugging Face, WebGPU, SGLang-Omni, GGUF |
| Alternativas de TTS abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la información proporcionada; al ser un modelo de voz, puede reflejar sesgos de acento, género o idioma presentes en los datos de entrenamiento.
- Riesgo de alucinación en la síntesis: puede producir pronunciaciones incorrectas o artefactos acústicos en textos con vocabulario fuera de dominio o en idiomas sin normalización NeMo.
- La normalización de texto NeMo solo cubre inglés, mandarín, japonés, coreano, alemán, español, francés, italiano y portugués; el resto de idiomas pasa el texto tal cual, lo que puede afectar a la calidad en esos casos.
- La clonación de voz plantea riesgos de uso indebido (suplantación de identidad); aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del integrador aplicar controles de consentimiento y verificación.
- No se dispone de información sobre la longitud máxima de texto de entrada ni sobre el contexto efectivo del modelo.
- El tamaño del repositorio (31,6 GB) incluye múltiples formatos y shards; el despliegue debe seleccionar solo los artefactos necesarios para evitar descargas innecesarias.
- No se han publicado cifras de latencia ni de throughput verificables en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Zyphra/ZONOS3-Mini
- Paper (arXiv): https://arxiv.org/abs/2611.16525
- Repositorio GitHub: https://github.com/Zyphra/ZONOS3-Mini
- Blog de Zyphra: https://www.zyphra.com/our-work/zonos3-mini
- Zyphra Cloud: https://cloud.zyphra.com/models/zyphra/ZONOS3-Mini
- Discord: https://discord.gg/gTW9JwST8q
- SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Guía de instalación de SGLang-Omni: https://github.com/sgl-project/sglang-omni/blob/main/docs/get_started/installation.md
- Cookbook de ZONOS3: https://github.com/sgl-project/sglang-omni/blob/main/docs/cookbook/zonos3.md
- Zonos Voice Studio: https://zyphra.com/zonos3-mini/localplayground#cast
- Zonos Voice Studio Lite: https://zyphra.com/zonos3-mini/localplayground/lite
- GGUF: https://huggingface.co/Zyphra/ZONOS3-Mini/tree/main/gguf
- Shards WebGPU: https://huggingface.co/Zyphra/ZONOS3-Mini/tree/main/web
- Voces por defecto: https://huggingface.co/Zyphra/ZONOS3-Mini/blob/main/gguf/voices/README.md
