# WaveCut/Vimoo-1.0-OrbitQuant-W4A8

## Resumen

Vimoo-1.0-OrbitQuant-W4A8 es una versión cuantizada del modelo de generación de vídeo Vimoo-1.0, desarrollado por Vimoo-AI y empaquetado por WaveCut bajo la técnica de cuantización OrbitQuant. Se trata de un modelo de difusión para texto-a-vídeo (T2V) e imagen-a-vídeo (I2V) que opera a 720p y 24 fps, construido sobre dos transformadores de aproximadamente 11.700 millones de parámetros cada uno: uno dedicado a T2V y otro a I2V.

La relevancia de esta release radica en la reducción drástica de requisitos de memoria: el modelo original en BF16 necesita 64,3 GB de almacenamiento y no cabe en una GPU de consumo de 32 GB, mientras que esta versión cuantizada ocupa 24,9 GB y puede ejecutarse en una única RTX 5090 con un pico de 25,2 GiB de memoria de dispositivo. La cuantización W4A8 aplica pesos de 4 bits con activaciones de 8 bits tanto a los dos transformadores como al codificador de texto Qwen2.5-VL.

El modelo mantiene la licencia Apache 2.0 del original y está orientado exclusivamente a inglés. Su pipeline es text-to-video según la librería diffusers, con soporte para image-to-video a través del transformador I2V. El runtime requiere el fork oficial de Diffusers de Vimoo-AI con kernels fusionados de OrbitQuant, además de los nodos de ComfyUI-OrbitQuant.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con dos transformadores (T2V e I2V), codificador de texto Qwen2.5-VL |
| Parametros totales | Dos transformadores de ≈11,7B cada uno (≈23,4B en total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits), GPTQ rounding; atención INT8 opcional |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo base Vimoo-1.0 emplea una arquitectura de difusión compuesta por dos transformadores independientes de aproximadamente 11.700 millones de parámetros: uno especializado en texto-a-vídeo y otro en imagen-a-vídeo. Ambos operan a resolución 720p y 24 fps. El codificador de texto es Qwen2.5-VL-7B, que procesa las indicaciones textuales. La release original incluye además un codificador de glifos ("glyph encoder") según se deduce del desglose de los 64,3 GB del checkpoint original.

La cuantización OrbitQuant aplica GPTQ rounding para seleccionar los códigos de 4 bits, calibrando con prompts que no forman parte del conjunto de evaluación. Tanto los dos transformadores como el codificador de texto ejecutan activaciones de 8 bits sobre pesos de 4 bits. El runtime utiliza los kernels fusionados de OrbitQuant integrados en el fork de Diffusers de Vimoo-AI. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de vídeo a partir de texto (T2V) a 720p y 24 fps, con ejemplos de escenas cinematográficas, naturaleza y primeros planos.
- Generación de vídeo a partir de una imagen inicial (I2V), animando el primer fotograma proporcionado.
- Control de movimiento y cámara mediante prompts descriptivos (push-in, tracking, cámara estática, teleobjetivo, etc.).
- Generación de vídeos de 5 segundos (121 fotogramas) en 50 pasos de muestreo.
- Soporte de seed para reproducibilidad de resultados.
- Codificación de texto en inglés mediante Qwen2.5-VL-7B.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio.

## Casos de uso

- **Previsualización de storyboards cinematográficos**: el modelo genera clips de 5 segundos a 720p con control de cámara y iluminación mediante prompt, útil para validar secuencias antes de rodaje. La ventana de 121 fotogramas a 24 fps cubre planos cortos típicos de previsualización.
- **Prototipado rápido de anuncios**: creación de vídeos promocionales de producto a partir de descripciones textuales, con la opción de partir de una imagen de producto (I2V) para mantener coherencia visual con el material de marca.
- **Animación de fotografías para redes sociales**: uso del pipeline I2V para dar movimiento a imágenes estáticas (retratos, paisajes, productos) generando clips cortos aptos para publicaciones.
- **Generación de material de archivo bajo demanda**: producción de clips de naturaleza, paisajes o escenas genéricas sin depender de bancos de imágenes, con control de estilo mediante prompt (documental, cinematográfico, etc.).
- **Iteración creativa en estudio**: ejecución local en una RTX 5090 permite ciclos de prueba y error sin coste por API, con tiempos de aproximadamente 50 minutos por vídeo de 5 segundos a 720p (31 minutos con atención INT8).
- **Integración en ComfyUI**: mediante los nodos ComfyUI-OrbitQuant, el modelo se puede encadenar con otros nodos de posprocesado, upscaling o composición dentro de un flujo de trabajo visual.
- **Investigación en cuantización de modelos de difusión**: la release sirve como referencia para estudiar el impacto de W4A8 con GPTQ en modelos de vídeo de gran tamaño, comparando contra el original BF16 con los mismos prompts y seeds.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas de rendimiento de inferencia, no de calidad:

| Métrica | RTX 5090 (32 GB) | RTX PRO 6000 |
|---|---|---|
| Tiempo por vídeo 5 s 1280×720, 121 frames, 50 steps | ≈50 min (31 min con INT8 attention) | ≈34 min (vs. 94 min del BF16 original) |
| Pico de memoria de dispositivo | 25,2 GiB | No disponible |
| Tamaño del checkpoint | 24,9 GB | 24,9 GB |
| BF16 original en la misma GPU | No cabe (ni con offload) | ≈94 min por vídeo por defecto |

## Requisitos de hardware

- **VRAM estimada**: 25,2 GiB de pico en RTX 5090 para vídeo de 5 s a 1280×720 con 121 fotogramas y 50 pasos.
- **GPU recomendadas**: RTX 5090 (32 GB, probada), RTX PRO 6000 (Blackwell, probada). El original BF16 no cabe en 32 GB.
- **GPU de consumo**: sí, cabe en RTX 5090. No se documenta compatibilidad con GPUs de 24 GB o menos.
- **Sistema operativo**: Linux obligatorio según la model card.
- **Stack probado**: Python 3.12, Torch 2.12.1, CUDA 13.0, orbitquant 0.17.
- **Opciones de despliegue**: pipeline modular oficial de Vimoo-AI Diffusers fork con kernels fusionados de OrbitQuant; nodos ComfyUI-OrbitQuant. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de vídeo).
- **Latencia y throughput**: ≈50 min por vídeo de 5 s a 720p en RTX 5090 (31 min con atención INT8); ≈34 min en RTX PRO 6000 (2,8× más rápido que el BF16 original).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vimoo-1.0-OrbitQuant-W4A8 | ≈23,4B (dos transformadores de ≈11,7B) | 720p, 24 fps, 121 frames | Apache 2.0 | Hugging Face (WaveCut) | Cuantizado W4A8, 24,9 GB, cabe en RTX 5090 |
| Vimoo-1.0 (BF16 original) | ≈23,4B + Qwen2.5-VL-7B | 720p, 24 fps | Apache 2.0 | Hugging Face (Vimoo-AI) | 64,3 GB, no cabe en 32 GB |
| Otros modelos de vídeo de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- **Solo inglés**: el modelo está entrenado y evaluado únicamente para prompts en inglés; no se garantiza calidad con otros idiomas.
- **Riesgo de alucinación visual**: como modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o elementos no solicitados en el prompt.
- **Sesgos del dataset**: no se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos, culturales o de representación.
- **Licencia Apache 2.0**: permite uso comercial, pero se debe verificar la licencia del modelo base Vimoo-1.0 y de las dependencias (Qwen2.5-VL, Diffusers fork, OrbitQuant).
- **Requisitos de plataforma**: solo Linux, Python 3.12, CUDA 13.0 y GPUs Blackwell probadas; no hay garantía de funcionamiento en otras configuraciones.
- **Tiempos de inferencia elevados**: 50 minutos por vídeo de 5 segundos en RTX 5090 limita su uso a entornos de producción por lotes o investigación, no a aplicaciones interactivas en tiempo real.
- **Dependencia de forks**: requiere el fork de Diffusers de Vimoo-AI y la librería orbitquant 0.17, lo que puede complicar el mantenimiento y la actualización.
- **Sin datos de benchmarks de calidad**: no hay métricas objetivas (FVD, CLIP score, etc.) publicadas para evaluar la degradación introducida por la cuantización frente al BF16.

## Enlaces

- [Hugging Face: WaveCut/Vimoo-1.0-OrbitQuant-W4A8](https://huggingface.co/WaveCut/Vimoo-1.0-OrbitQuant-W4A8)
- [Modelo base: Vimoo-AI/Vimoo-1.0](https://huggingface.co/Vimoo-AI/Vimoo-1.0)
- [Repositorio OrbitQuant](https://github.com/iamwavecut/OrbitQuant)
- [Fork de Diffusers de Vimoo-AI](https://github.com/Vimoo-AI/diffusers)
- [Nodos ComfyUI-OrbitQuant](https://github.com/iamwavecut/ComfyUI-OrbitQuant)
