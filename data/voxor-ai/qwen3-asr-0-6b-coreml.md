# voxor-ai/qwen3-asr-0.6b-coreml

## Resumen

Este repositorio no es un modelo completo de reconocimiento de voz, sino una conversión a Core ML del codificador de audio (audio encoder) de Qwen3-ASR-0.6B, el modelo de reconocimiento automático del habla (ASR) de 0,6 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba. La conversión ha sido realizada y publicada por el usuario voxor-ai, y su propósito es permitir la ejecución del codificador de audio de forma nativa en dispositivos del ecosistema Apple (iPhone, iPad y Mac), aprovechando la aceleración por hardware de Core ML y los Neural Engines de Apple Silicon.

El componente convertido es exactamente el encoder: un módulo que recibe 30 segundos de audio representado como 3000 frames de características log-mel de 128 bandas y produce una secuencia de 390 embeddings de 1024 dimensiones (`audio_features`), que posteriormente debe combinarse con el decodificador lingüístico del modelo original (no incluido en este repositorio) para generar las transcripciones. La conversión está en precisión fp16 y requiere iOS 17 o macOS 14 como mínimo.

Su relevancia reside en la verificación de calidad aportada: el autor documenta una similitud coseno media de 0,9994 frente al encoder fp32 en PyTorch, y una evaluación en FLEURS (14 idiomas, 840 clips) que muestra una diferencia de WER/CER estadísticamente insignificantе (-0,30 a +0,26 puntos con un 95 % de confianza) respecto al encoder sin convertir. Esto lo convierte en una base fiable para construir pipelines de ASR on-device en plataformas Apple con el modelo Qwen3-ASR-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio (audio encoder) de Qwen3-ASR, compilado a Core ML |
| Parametros totales | no disponible (el modelo base Qwen3-ASR-0.6B tiene 0,6B; solo se incluye el encoder) |
| Parametros activos | no disponible |
| Longitud de contexto | 30 segundos de audio por pasada (3000 frames log-mel) |
| Tipos de cuantizacion | fp16 (sin cuantizacion adicional) |
| Idiomas soportados | no disponible (evaluado en 14 idiomas via FLEURS) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (`AudioEncoder.mlmodelc`), tamano del repo 0,4 GB |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una conversión del codificador de audio de Qwen3-ASR-0.6B a Core ML. El encoder original forma parte de la arquitectura de Qwen3-ASR, que sigue el patrón habitual de los sistemas ASR modernos tipo Whisper: un codificador de audio que transforma el espectrograma log-mel en embeddings latentes, y un decodificador lingüístico basado en transformer que genera el texto a partir de esos embeddings. En este caso solo se ha convertido la primera parte.

Las especificaciones de entrada y salida dejan claro el diseño: la entrada `mel` tiene forma `[1, 128, 3000]` en float32, correspondiente a 30 segundos de frames log-mel, junto con un tensor `length` int32 que indica el número de tokens de salida válidos. La salida `audio_features` tiene forma `[1, 390, 1024]`, es decir, 390 embeddings de 1024 dimensiones, listos para alimentar al decodificador. No hay información disponible sobre los datos de entrenamiento del modelo base ni sobre técnicas de post-entrenamiento (RLHF, DPO, etc.); el trabajo de voxor-ai se limita a la conversión y validación numérica, no al entrenamiento.

## Capacidades

- Extraccion de caracteristicas de audio: convierte hasta 30 segundos de audio (frames log-mel de 128 bandas) en 390 embeddings de 1024 dimensiones por pasada.
- Reconocimiento automatico del habla (como parte de un pipeline): los embeddings generados deben combinarse con el decodificador de Qwen3-ASR-0.6B para producir transcripciones; este repo no transcribe por si solo.
- Ejecucion nativa en Apple Silicon: modelo Core ML compilado (`.mlmodelc`) compatible con iOS 17 y macOS 14 o posteriores, apto para Neural Engine.
- Precision verificada: similitud coseno media de 0,9994 frente al encoder fp32 de PyTorch (minimo 0,989).
- Fidelidad de transcripcion validada: 9,20 % de WER/CER en FLEURS (14 idiomas, 840 clips) frente a 9,21 % con el encoder original en el mismo pipeline.
- No incluye: tool calling, agentes, generacion de texto general, vision ni capacidades multimodales mas alla del audio.

## Casos de uso

- Transcripcion on-device en iOS y macOS: integrando este encoder en una app con el decodificador de Qwen3-ASR-0.6B, se puede transcribir notas de voz o dictado sin enviar audio a la nube, preservando la privacidad del usuario.
- Subtitulado local de clips cortos: al aceptar 30 segundos por pasada, es adecuado para generar subtitulos de mensajes de voz y clips breves procesando el audio en segmentos.
- Procesamiento por lotes en Mac: en un Mac con Apple Silicon, se puede usar Core ML para extraer embeddings de grandes volumenes de audio (por ejemplo, corpus de llamadas o podcasts) con aceleracion por Neural Engine.
- Prototipado de ASR embebido: desarrolladores que evaluan Qwen3-ASR para productos moviles pueden validar la calidad del encoder en dispositivo antes de comprometerse con la conversion del decodificador completo.
- Indexacion y busqueda de contenido de audio: los embeddings de audio de 1024 dimensiones pueden usarse como base para sistemas de busqueda semantica sobre archivos de voz, combinados con un decodificador o con modelos de embedding de audio.
- Accesibilidad en aplicaciones moviles: transcripcion en tiempo casi real para funciones de accesibilidad (subtitulos en vivo, comandos de voz) aprovechando que el encoder pesa unos 0,4 GB y cabe en dispositivos modernos.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversion:

| Metrica | Valor |
|---|---|
| Similitud coseno vs encoder fp32 PyTorch (media) | 0,9994 |
| Similitud coseno vs encoder fp32 PyTorch (minimo) | 0,989 |
| WER/CER en FLEURS (14 idiomas, 840 clips), encoder convertido | 9,20 % |
| WER/CER en FLEURS, encoder original en el mismo pipeline | 9,21 % |
| IC 95 % de la diferencia (paired bootstrap) | -0,30 a +0,26 puntos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) ni comparaciones con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- Tamano del modelo: aproximadamente 0,4 GB en fp16 (Core ML compilado), por lo que cabe comodamente en la memoria de cualquier iPhone o Mac moderno.
- Sistema operativo: iOS 17 / macOS 14 o posteriores (requisito de la conversion Core ML).
- Hardware recomendado: dispositivos con Apple Silicon (chipserie A17/A18/M1 o superior) para aprovechar el Neural Engine; en Mac tambien funciona via GPU o CPU de Core ML.
- No aplica GPUs NVIDIA (A100, H100, RTX 4090, etc.) ni entornos CUDA: este artefacto es especifico del ecosistema Apple.
- Despliegue: integracion directa mediante el runtime de Core ML (Swift/Objective-C); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que no consumen modelos `.mlmodelc`.
- Latencia y throughput: no disponibles; no se publican mediciones de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Plataforma | Licencia |
|---|---|---|---|---|
| voxor-ai/qwen3-asr-0.6b-coreml | Solo encoder de Qwen3-ASR 0.6B | Core ML (.mlmodelc), fp16 | iOS 17+ / macOS 14+ | Apache 2.0 |
| Qwen/Qwen3-ASR-0.6B | Modelo ASR completo (encoder + decodificador) | no disponible | Python / servidores | no disponible |
| openai/whisper (variantes tiny/base) | Modelo ASR completo | PyTorch, GGUF, Core ML (conversiones de terceros) | Multiplataforma | MIT (codigo) |

Nota: no hay conversiones Core ML oficiales de Qwen3-ASR por parte de Qwen; esta ficha compara el artefacto convertido con el modelo base y con la alternativa ASR mas extendida. Datos detallados de parametros y contexto de los modelos completos: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR completo: solo incluye el codificador de audio. Para transcribir, se necesita el decodificador de Qwen3-ASR-0.6B, que no esta incluido ni convertido en este repositorio.
- Ventana de audio limitada: 30 segundos por pasada; audios mas largos requieren segmentacion y gestion de contexto por parte del desarrollador.
- Cobertura de idiomas: la validacion se realizo en 14 idiomas via FLEURS; no hay informacion sobre el rendimiento en espanol ni en otros idiomas concretos.
- Pequena perdida numerica por la conversion a fp16: la similitud coseno minima es 0,989, por lo que casos extremos podrian desviarse ligeramente del comportamiento del encoder original.
- Cero descargas registradas en Hugging Face: es un artefacto comunitario sin historial de adopcion; conviene validar en produccion antes de depender de el.
- Sesgos y riesgo de alucinacion: heredados del modelo base Qwen3-ASR-0.6B; no se documenta informacion especifica en este repositorio.
- Licencia: Apache 2.0, sin restricciones conocidas para uso comercial; consultar los archivos `LICENSE` y `NOTICE` del repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/voxor-ai/qwen3-asr-0.6b-coreml
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
