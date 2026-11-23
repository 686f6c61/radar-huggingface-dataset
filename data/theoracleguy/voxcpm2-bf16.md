# theoracleguy/VoxCPM2-bf16

## Resumen

VoxCPM2-bf16 es una conversión a formato MLX del modelo de síntesis de voz openbmb/VoxCPM2, un TTS multilingüe de aproximadamente 2.380 millones de parámetros que genera audio a 48 kHz con capacidades de clonación de voz y diseño de voz a partir de descripciones textuales. La conversión la mantiene el usuario theoracleguy y está publicada con pesos en precisión completa BFloat16, orientada a ejecución sobre Apple Silicon mediante la librería mlx-audio.

El modelo resuelve el problema de la generación de voz de alta calidad en local y sin dependencia de servicios en la nube, ofreciendo cuatro modos de generación (zero-shot, continuación, clonación por referencia y modo combinado) y soporte declarado para 30 idiomas, entre ellos inglés, chino, indonesio, japonés y coreano. Su licencia Apache 2.0 y su tamaño contenido lo hacen relevante para desarrolladores que necesitan integrar TTS en aplicaciones de escritorio, prototipos o pipelines de audio sin costes de API.

Al tratarse de una conversión de pesos y no de un modelo entrenado desde cero, sus capacidades y limitaciones heredan las del modelo base openbmb/VoxCPM2. La variante bf16 prioriza calidad frente a tamaño (4,96 GB en memoria y factor de tiempo real de 0,48x en Apple Silicon), por lo que resulta adecuada para equipos con suficiente memoria unificada que no requieran síntesis más rápida que el tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal (detalles de arquitectura interna no disponibles; pesos en safetensors) |
| Parametros totales | 2.383.791.940 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta variante); 8-bit y 4-bit disponibles en otras variantes del port |
| Idiomas soportados | 30 idiomas, entre ellos en, zh, id, ja, ko (etiquetas de idioma: en, zh, id, ja, ko, multilingual) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Frecuencia de muestreo de salida | 48 kHz |
| Libreria | mlx-audio |
| Tamano del repositorio | 5.5 GB |
| Modelo base | openbmb/VoxCPM2 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (tipo de transformer, mecanismo de atención o diseño del decodificador de audio). Lo que sí se conoce es que VoxCPM2 es un modelo de texto a voz de 2B parámetros con salida a 48 kHz, y que esta variante es una conversión de los pesos originales de openbmb/VoxCPM2 a BFloat16 para el framework MLX, realizada con la herramienta mlx-audio. No se han publicado en la información proporcionada datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

La innovación práctica de esta ficha reside en el soporte de cuatro modos de generación (zero-shot, continuación, clonación por referencia y combinado) y en la exposición de parámetros de inferencia como `inference_timesteps` (7 por defecto en los ejemplos) y `cfg_value` (2.0 en los ejemplos), que permiten ajustar el compromiso entre calidad y velocidad. El modelo admite instrucciones de diseño de voz (`--instruct`) para generar timbres descritos en lenguaje natural sin necesidad de audio de referencia.

## Capacidades

- Síntesis de voz multilingüe con salida a 48 kHz y calidad declarada de estudio.
- Clonación de voz a partir de una referencia de audio corta más su texto transcrito.
- Diseño de voz mediante descripciones textuales (edad, género, timbre), sin audio de referencia.
- Cuatro modos de generación: zero-shot, continuación, clonación por referencia y combinado.
- Soporte de 30 idiomas, con etiquetas explícitas para inglés, chino, indonesio, japonés y coreano.
- Control de la inferencia mediante pasos de difusión/iteración (`inference_timesteps`) y escala de guiado (`cfg_value`).
- Integración con la API de Python de mlx-audio y con la CLI `mlx_audio.tts.generate`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia para clonación.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz a 48 kHz con calidad alta, adecuada para contenido largo donde la fidelidad de muestreo importa; el modo continuación permite encadenar fragmentos manteniendo coherencia.
- Doblaje y localización de contenido: con soporte para 30 idiomas, se puede generar la misma locución en inglés, chino, japonés, coreano o indonesio sin cambiar de modelo, simplificando pipelines de localización.
- Prototipado de asistentes de voz en macOS: al ejecutarse sobre MLX en Apple Silicon, permite iterar en local sin costes de API ni envío de datos a terceros.
- Personalización de voces para productos: el modo de diseño de voz permite crear un timbre corporativo descrito por texto ("voz femenina joven, suave y cálida") sin disponer de grabaciones de referencia.
- Clonación de voz para accesibilidad: usuarios que pierden la voz pueden conservar un timbre propio a partir de una muestra corta, con la advertencia de consentimiento y uso ético correspondiente.
- Generación de contenido para vídeo y pódcast: la CLI de mlx-audio permite invocar el modelo desde scripts y automatizar la producción de pistas de voz para edición posterior.
- Pruebas de calidad (QA) de sistemas de reconocimiento de voz: generar corpus sintéticos multilingües con voces variadas para evaluar ASR y sistemas de diarización.

## Benchmarks y rendimiento

La model card solo publica métricas de rendimiento en Apple Silicon (factor de tiempo real, RTF), no benchmarks de calidad de voz (MOS, WER de ASR sobre audio sintetizado, similitud de hablante).

| Variante | Tamano | RTF (7 pasos) |
|---|---|---|
| bf16 (esta ficha) | 4.96 GB | 0.48x |
| 8-bit | 3.23 GB | 0.85x |
| 4-bit | 2.30 GB | 0.90x |

RTF superior a 1.0 indica más rápido que tiempo real; en bf16 el modelo sintetiza a aproximadamente la mitad de la velocidad del tiempo real. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- Memoria estimada: 4,96 GB de pesos en bf16; el consumo total en inferencia será algo superior por estados intermedios y buffers de audio (no cuantificado en la información disponible).
- Plataforma: exclusivamente Apple Silicon (MLX); no está pensado para GPU NVIDIA ni CPU x86 a través de esta conversión.
- Equipos recomendados: Mac con memoria unificada de 16 GB o superior; con 8 GB el margen es muy ajustado para bf16.
- Alternativas ligeras: las variantes 8-bit (3,23 GB) y 4-bit (2,30 GB) reducen el requisito de memoria y, según la model card, ofrecen RTF de 0,85x y 0,90x respectivamente.
- Despliegue: librería mlx-audio (CLI `python -m mlx_audio.tts.generate` o API `mlx_audio.tts.load_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,48x con 7 pasos de inferencia en Apple Silicon; aumentar `inference_timesteps` incrementará el coste computacional de forma proporcional.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Salida | Licencia | Plataforma |
|---|---|---|---|---|---|
| VoxCPM2-bf16 (esta ficha) | ~2,38B | 30 | 48 kHz | Apache 2.0 | Apple Silicon (MLX) |
| openbmb/VoxCPM2 | ~2B (según model card) | 30 | 48 kHz | Apache 2.0 | No disponible en la información |
| Variantes 8-bit / 4-bit del port | ~2,38B | 30 | 48 kHz | Apache 2.0 | Apple Silicon (MLX) |

No se dispone en la información proporcionada de datos comparativos con otros modelos TTS de la misma categoría (por ejemplo, XTTS, Bark o Fish Speech), por lo que la comparación se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Es una conversión de pesos, no un modelo nuevo: cualquier sesgo o limitación del modelo base openbmb/VoxCPM2 se hereda íntegramente.
- La información disponible no incluye evaluación de sesgos demográficos ni de acento; la calidad de clonación puede variar según el hablante y el idioma.
- Riesgo de uso indebido de la clonación de voz (suplantación, fraude); es responsabilidad del integrador implementar consentimiento y marcas de agua o detección.
- La síntesis puede producir artefactos o pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o idiomas con menos datos; no se documenta una evaluación de alucinación de audio.
- El modelo está limitado a Apple Silicon por el formato MLX; no es directamente desplegable en servidores Linux con GPU NVIDIA.
- El RTF de 0,48x en bf16 implica que la generación es más lenta que el tiempo real; para aplicaciones interactivas conviene valorar las variantes 8-bit o 4-bit.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base y de las voces de referencia utilizadas.
- La model card de esta conversión referencia el repositorio `mlx-community/VoxCPM2-bf16` en los ejemplos, distinto del ID de esta ficha; conviene comprobar la ruta correcta antes de desplegar.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/theoracleguy/VoxCPM2-bf16
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
