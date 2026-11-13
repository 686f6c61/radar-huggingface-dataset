# xsingh/Voce-Mini

## Resumen

Voce-Mini (publicado en Hugging Face como `xsingh/Voce-Mini`) es un modelo de síntesis de voz (text-to-speech) de tipo Zonos3, una familia desarrollada originalmente por Zyphra. El modelo está diseñado para generar habla natural con clonación de voz de alta fidelidad a partir de una muestra de audio de referencia, y para permitir el diseño de voces ajustando parámetros acústicos como edad, acento y textura vocal. Con aproximadamente 886 millones de parámetros totales y unos 100 millones activos por token (arquitectura MoE con enrutamiento top-2), está pensado para ejecutarse en tiempo real en portátiles y teléfonos, incluso directamente en el navegador mediante WebGPU.

La relevancia de este modelo radica en su combinación de tamaño reducido, licencia Apache 2.0 y soporte para 43 idiomas, lo que lo sitúa como una alternativa abierta frente a soluciones TTS propietarias. Su arquitectura híbrida combina capas Gated DeltaNet con capas de atención global, y genera audio a 44,1 kHz mediante un cabezal iSTFT causal que permite streaming de baja latencia.

El modelo se distribuye en formatos safetensors y GGUF, con runtimes nativos para CUDA, MLX (Apple Silicon), C++/ggml (CPU, CUDA, Metal, Vulkan) y WebGPU, además de soporte para servidores compatibles con la API de OpenAI a través de SGLang-Omni.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con mezclador de secuencia GDN/atención global (patrón `gdn3_global1`: 9 capas Gated DeltaNet + 2 capas de atención global) |
| Parametros totales | 886.342.504 (~800 M según model card) |
| Parametros activos | ~100 M por token (MoE latente: 64 expertos, enrutamiento top-2, desde la capa 1) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repo incluye carpeta `gguf/`); niveles específicos no disponibles |
| Idiomas soportados | 43 idiomas: en, fr, es, de, it, pt, nl, pl, ru, sv, tr, uk, cs, da, fi, el, hu, no, ro, sk, bg, zh, ja, ko, ar, he, vi, id, th, tl, ms, ka, hi, bn, ta, te, mr, gu, kn, ml, pa, or, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, shards WebGPU |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de backbone con 11 capas y dimensión de modelo de 1.024. El mezclador de secuencia sigue el patrón `gdn3_global1`, compuesto por 9 capas de Gated DeltaNet (un mecanismo de atención lineal recurrente) y 2 capas de atención global con 16 cabezales. El backbone es un MoE latente con 64 expertos y enrutamiento top-2 desde la primera capa, lo que permite ~100 M de parámetros activos por token sobre un total de ~800 M.

El texto se normaliza con NeMo (para inglés, mandarín, japonés, coreano, alemán, español, francés, italiano y portugués; el resto de idiomas pasa tal cual) y se tokeniza con un tokenizador SuperBPE de 8.192 entradas. El modelo de lenguaje genera de forma autorregresiva tramas dual-codec a 15 Hz: 10 codebooks de 4.096 entradas cada uno (un codebook semántico destilado del profesor Wav2Vec2-BERT más nueve codebooks acústicos), condicionado por el texto, un prompt de hablante y tres controles acústicos agrupados en buckets. Un cabezal iSTFT causal multirresolución renderiza las tramas a audio de 44,1 kHz conforme se producen, lo que habilita el streaming. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) de alta fidelidad a 44,1 kHz con streaming en tiempo real.
- Clonación de voz a partir de una muestra de audio de referencia, sin necesidad de transcripción.
- Diseño de voz mediante parámetros acústicos: edad, acento y textura vocal.
- Control de emoción, ritmo y estilo de entrega, incluso a nivel de palabra individual.
- Soporte multilingüe en 43 idiomas, con normalización de texto NeMo en 9 de ellos.
- 27 voces por defecto agrupadas por idioma (en `gguf/voices/`).
- Ejecución en navegador mediante WebGPU, sin instalación ni servidor.
- Compatibilidad con la API de OpenAI (`/v1/audio/speech`) a través de SGLang-Omni, con streaming PCM.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- **Asistentes de voz en dispositivos**: el modelo puede ejecutarse en tiempo real en portátiles y teléfonos (incluido WebGPU en navegador), lo que permite integrar un asistente de voz local sin depender de la nube ni enviar audio del usuario a servidores externos.
- **Clonación de voz para accesibilidad**: a partir de una muestra de audio de una persona, se puede generar una voz sintética personalizada para usuarios con discapacidades del habla, usando la clonación sin transcripción que ofrece el modelo.
- **Narración y audiolibros**: el control de emoción, ritmo y entrega a nivel de palabra permite ajustar la interpretación de cada frase, adecuado para narración de ficción, documentales o contenido educativo.
- **Doblaje y localización multilingüe**: con 43 idiomas y 27 voces por defecto agrupadas por idioma, el modelo puede generar pistas de voz en distintos idiomas para vídeos, cursos o aplicaciones, manteniendo una voz de referencia clonada.
- **Videojuegos y personajes interactivos**: el diseño de voz por edad, acento y textura, junto con el control de emoción, permite crear voces de personajes diferenciadas y dinámicas en tiempo de ejecución, con streaming de baja latencia a 44,1 kHz.
- **Servicio TTS en producción vía API**: desplegado con SGLang-Omni en GPUs NVIDIA, expone un endpoint compatible con OpenAI (`/v1/audio/speech`) con streaming PCM, lo que facilita integrarlo en pipelines existentes de aplicaciones que ya consumen APIs de OpenAI.
- **Prototipado rápido en navegador**: el Zonos Voice Studio y la versión Lite permiten probar clonación y diseño de voz sin instalar nada, útil para evaluación previa a un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~886 M de parámetros totales y ~100 M activos, el peso en precisión completa ronda los 1,8 GB en fp16, aunque el repo ocupa 30,6 GB por incluir múltiples formatos y shards.
- GPU recomendadas: NVIDIA (runtime CUDA y SGLang-Omni), Apple Silicon (runtime MLX), y CPU, CUDA, Metal o Vulkan mediante el servidor C++/ggml.
- Cabe en GPU de consumo: sí, el modelo está diseñado para ejecutarse en tiempo real en portátiles y teléfonos; ejecución en navegador mediante WebGPU.
- Opciones de despliegue: SGLang-Omni (servidor compatible con OpenAI), runtimes nativos de Zyphra (CUDA, MLX, C++/ggml, WebGPU), Zonos Voice Studio, Zyphra Cloud.
- Latencia y throughput: el modelo se describe como de tiempo real en dispositivos; no se proporcionan cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voce-Mini (Zonos3-Mini) | ~886 M totales / ~100 M activos | No disponible | 43 | Apache 2.0 | Hugging Face, GGUF, WebGPU, SGLang-Omni |
| Alternativas TTS open source de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks que permitan evaluar la calidad objetiva frente a alternativas.
- Riesgo de alucinación y artefactos en la síntesis de voz, especialmente en idiomas sin normalización NeMo (la mayoría de los 43 soportados pasan el texto tal cual).
- La clonación de voz plantea riesgos de uso indebido (suplantación de identidad, deepfakes); se recomienda verificar consentimiento y cumplir la normativa aplicable.
- Sesgos potenciales en la calidad de síntesis según idioma, acento o características del hablante de referencia; no documentados en la información disponible.
- No se especifica la longitud máxima de texto de entrada ni el contexto soportado.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los runtimes y servicios asociados (Zyphra Cloud, SGLang-Omni) por separado.
- El repo ocupa 30,6 GB por incluir múltiples formatos; el despliegue requiere seleccionar los archivos adecuados al runtime.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado como modelo de propósito general.

## Enlaces

- Hugging Face: https://huggingface.co/xsingh/Voce-Mini
- Blog de Zyphra: https://www.zyphra.com/our-work/zonos3-mini
- Zyphra Cloud: https://cloud.zyphra.com/models/zyphra/ZONOS3-Mini
- Repositorio GitHub de ZONOS3-Mini: https://github.com/Zyphra/ZONOS3-Mini
- SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Guía de instalación de SGLang-Omni: https://github.com/sgl-project/sglang-omni/blob/main/docs/get_started/installation.md
- Cookbook de ZONOS3: https://github.com/sgl-project/sglang-omni/blob/main/docs/cookbook/zonos3.md
- Zonos Voice Studio: https://zyphra.com/zonos3-mini/localplayground#cast
- Zonos Voice Studio Lite: https://zyphra.com/zonos3-mini/localplayground/lite
- Discord de Zyphra: https://discord.gg/gTW9JwST8q
