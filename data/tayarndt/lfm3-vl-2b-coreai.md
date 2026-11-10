# tayarndt/LFM3-VL-2B-CoreAI

## Resumen

LFM3-VL-2B-CoreAI es una conversión del modelo vision-lenguaje LFM3-VL-2B de Liquid AI al formato Core AI de Apple (`.aimodel`) en float16, publicada por el usuario tayarndt. No se ha reentrenado nada: los pesos son los originales de LiquidAI/LFM3-VL-2B (revisión `23387beda43c60310348e83e25f78f33c3140d3a`) casteados a float16 y exportados con `coreai-torch` usando únicamente operaciones nativas de Core AI, sin kernels Metal personalizados ni otros motores de inferencia.

El objetivo es ejecutar inferencia multimodal (imagen + texto a texto) completamente en local sobre la GPU de un Mac con Apple Silicon, invocable desde Swift sin servidor. El paquete se divide en dos artefactos: un codificador visual con proyector (`lfm3-vision-float16.aimodel`, 0,38 GB) que acepta imágenes de 512x512 y devuelve 256 vectores, y el modelo de lenguaje (`lfm3-text-float16.aimodel`, 3,46 GB) con tres funciones (`embed`, `prefill`, `main`) que comparten pesos. El repositorio incluye además un paquete Swift (`swift/LFM3VL`) para integrarlo en aplicaciones macOS.

Es relevante para desarrolladores que necesitan capacidades de descripción y comprensión de imágenes en local, con privacidad total y sin dependencia de API, sobre hardware de consumo Apple. El modelo base tiene 2B parámetros, soporta 16 idiomas y se distribuye bajo la LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador visual + proyector + modelo de lenguaje (transformer); detalles internos del base no disponibles en la informacion proporcionada |
| Parametros totales | 2B (modelo base LFM3-VL-2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens en total (limite de esta conversion) |
| Tipos de cuantizacion | float16 (unico formato publicado en este repo) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | Apple Core AI `.aimodel` (float16); vision 0,38 GB + texto 3,46 GB |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B es un modelo vision-lenguaje de Liquid AI que combina un codificador de imagen con un proyector y un modelo de lenguaje. En esta conversión, el codificador visual procesa una imagen de 512x512 y produce 256 vectores de imagen que se inyectan en el modelo de lenguaje. El modelo de lenguaje se expone en Core AI mediante tres funciones que comparten un mismo conjunto de pesos: `embed` (ids de token a vectores), `prefill` (lectura del prompt completo) y `main` (generación de un token por llamada).

No se ha realizado reentrenamiento alguno: los pesos son los originales casteados a float16. La conversión se hizo con `coreai-torch` siguiendo los patrones de exportación de Apple `coreai-models` (commit `04bbe2570265f04692e223bcb537b340d3bc8bfa`). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, composición del dataset ni si el modelo base usó RLHF o DPO; esos datos corresponden a la model card original de LiquidAI/LFM3-VL-2B y no se incluyen aquí.

## Capacidades

- Generación de texto a partir de una imagen y una pregunta (image-text-to-text).
- Descripción de fotografías e imágenes.
- Lectura de texto presente en imágenes (OCR aproximado).
- Respuesta a preguntas sobre el contenido de una imagen.
- Capacidades multilingües en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Modo "thinking" opcional (bloque `<think>`), desactivado por defecto en esta conversión; activable con `thinking: true` y `maxTokens` alrededor de 2048.
- Ejecución totalmente en dispositivo sobre GPU de Apple Silicon, sin servidor.
- Integración desde Swift mediante el paquete incluido (`swift/LFM3VL`).
- No soporta tool calling ni function calling según la información disponible.
- No soporta vídeo, múltiples imágenes en un mismo prompt ni más de 4.096 tokens en total.

## Casos de uso

- Descripción de imágenes para accesibilidad: el modelo puede generar descripciones de fotografías en local para lectores de pantalla. El paquete Swift permite agrupar el texto en frases antes de anunciarlo con VoiceOver, ya que el streaming entrega fragmentos parciales de palabras.
- Búsqueda de fotos por contenido: integrado en una app de macOS, permite indexar o consultar el contenido de una imagen mediante preguntas en lenguaje natural, sin enviar datos a la nube.
- Lectura de capturas de pantalla: útil para extraer o interpretar texto de screenshots en herramientas de productividad, aprovechando su capacidad de lectura de texto en imagen.
- Herramientas de línea de comandos para desarrolladores: el binario `lfm3-describe` permite consultar imágenes desde terminal durante tareas de depuración o análisis de datasets visuales.
- Prototipado de funciones multimodales en apps macOS: el paquete Swift local permite añadir capacidades de visión a una aplicación sin depender de API externas, con privacidad total.
- Análisis de documentos escaneados o fotografiados en local: para preguntas puntuales sobre el contenido de un documento en imagen, con revisión humana posterior dado el riesgo de error en OCR.
- Aplicaciones con requisitos de privacidad: cualquier escenario donde no se pueda enviar la imagen a un servidor (sanidad, legal, datos personales), siempre con supervisión humana por las limitaciones del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que, en las pruebas realizadas durante la conversión, cada token comprobado coincidió con el modelo original, y que las puntuaciones de referencia de Liquid AI corresponden al modo thinking, que aquí está desactivado por defecto.

## Requisitos de hardware

- Mac con Apple Silicon (obligatorio).
- macOS 27.2 o posterior y Xcode 27.2 o posterior.
- Espacio en disco: aproximadamente 3,9 GB para el repositorio completo (0,38 GB visión + 3,46 GB texto).
- VRAM: no disponible de forma explícita; los pesos en float16 suman unos 3,84 GB, por lo que se requiere memoria unificada suficiente para cargar ambos artefactos.
- GPU: se ejecuta sobre la GPU del Mac con Apple Silicon; la configuración por defecto y la GPU funcionan. La carga del modelo de visión con ajustes solo-CPU falla en macOS 27.2 (crash en el motor CPU de Apple, BNNS).
- No probado en iPhone ni iPad; además, los ficheros superan la guía de 2 GB de Apple para iOS.
- Despliegue: formato Core AI (`.aimodel`) con paquete Swift incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-CoreAI (esta ficha) | 2B | 4.096 tokens (límite de la conversión) | Core AI `.aimodel` float16 | LFM Open License v1.0 | Solo macOS/Apple Silicon, on-device |
| LiquidAI/LFM3-VL-2B | 2B | no disponible en la información proporcionada | safetensors (original) | LFM Open License v1.0 | Modelo original; mantiene aspect ratio y otros tamaños de imagen; thinking por defecto |
| Otros modelos vision-lenguaje de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Hereda todos los sesgos, riesgos y limitaciones del modelo base LFM3-VL-2B.
- Puede describir elementos que no están en la imagen, leer mal el texto o presentar conjeturas como hechos (alucinación).
- La imagen se estira a 512x512; el modelo original conserva el aspect ratio y acepta otros tamaños, por lo que las imágenes no cuadradas pueden dar peores respuestas. Las respuestas sobre fotos reales solo se comprobaron visualmente en unas pocas.
- Decodificación greedy en el paquete Swift: siempre elige el token más probable. Liquid AI recomienda muestreo con `temperature=0.1, top_k=50, repetition_penalty=1.1`; el muestreo y la penalización por repetición no están implementados, por lo que las respuestas largas pueden repetirse más que en el original.
- El modo thinking está desactivado por defecto por velocidad; las puntuaciones de benchmark de Liquid AI usan thinking.
- En macOS 27.2, cargar el modelo de visión con ajustes solo-CPU provoca un crash en el motor CPU de Apple (BNNS); la configuración por defecto y la GPU funcionan.
- El redondeo a float16 altera ligeramente los números respecto al original.
- No soporta vídeo, varias imágenes en un prompt ni más de 4.096 tokens en total.
- No probado en iPhone ni iPad; los ficheros superan la guía de 2 GB de Apple para iOS.
- Liquid AI no recomienda el modelo base para programación, conversaciones multi-turno ni razonamiento complejo.
- No usar para decisiones de alto riesgo (médicas, legales, de seguridad o de identidad) sin revisión humana.
- Licencia LFM Open License v1.0: revisar el fichero `LICENSE` para las restricciones de uso comercial antes de desplegar en producción.
- Si se anuncia texto en streaming con VoiceOver, agrupar los fragmentos en frases, ya que cada pieza suele ser parte de una palabra.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tayarndt/LFM3-VL-2B-CoreAI
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Patrones de exportación de Apple Core AI: https://github.com/apple/coreai-models (commit `04bbe2570265f04692e223bcb537b340d3bc8bfa`)
- Paquete Swift incluido: `swift/LFM3VL` dentro del repositorio
- Licencia: fichero `LICENSE` del repositorio (LFM Open License v1.0)
