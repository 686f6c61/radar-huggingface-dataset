# timmyboy26/LTX-Video-2B-0.9.8-distilled-QNN

## Resumen

LTX-Video 2B 0.9.8 distilled QNN es una compilación del modelo de generación de vídeo LTX-Video de Lightricks, adaptada por el desarrollador independiente timmyboy26 para ejecutarse en la NPU Hexagon de los SoC Qualcomm Snapdragon mediante el runtime QNN. No se distribuye como pesos en formato convencional, sino como context binaries precompilados por arquitectura de NPU (v69, v73, v75, v79, v81 y v85), lo que permite inferencia totalmente local en dispositivos Android sin GPU dedicada ni conexión a la nube.

El modelo resuelve el problema de llevar text-to-video e image-to-video de 2B parámetros a un teléfono móvil con latencias utilizables: un clip de 25 fotogramas a 768x512 se genera en unos 25,9 segundos en un Snapdragon 8 Elite, y en 12,2 segundos a 512x320. La versión distilled reduce el muestreo a 8 pasos con CFG 1, lo que hace viable el despliegue en hardware móvil.

Es relevante porque demuestra que la generación de vídeo con un transformer de difusión de 28 bloques puede ejecutarse íntegramente en la NPU de un smartphone actual, con cuantización INT8 en los pesos del transformer y W8A16 en el decoder VAE, manteniendo un error de aproximadamente el 3% por bloque frente a FP32. El repo ocupa 19,7 GB e incluye builds para seis generaciones de Hexagon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (LTX-Video), 28 bloques, compilado a context binaries QNN para NPU Hexagon |
| Parametros totales | 2B (modelo base LTX-Video 2B 0.9.8 distilled) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; ventana temporal de 25 fotogramas por clip) |
| Tipos de cuantizacion | Transformer: INT8 pesos (per output channel) con activaciones FP16; variante `v73-int/`: INT8 pesos + INT16 activaciones; VAE decoder: W8A16 |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el encoder T5-XXL se ejecuta en CPU) |
| Licencia | ltx-video-open-weights-license-0.x |
| Formato de pesos | Context binaries QNN (`.bin`) + `ltxv_qnn_stub.safetensors` (solo tensores de forma) |

## Arquitectura y entrenamiento

El modelo base es LTX-Video 2B 0.9.8 en variante distilled, un transformer de difusión para generación de vídeo. Esta distribución no reentrena el modelo: toma los pesos del checkpoint original y los compila a grafos QNN con formas fijas para la NPU Hexagon. Los 28 bloques del transformer se reparten en cuatro context binaries (`ltxv_chunk0.bin` a `ltxv_chunk3.bin`); el chunk 0 incluye además las proyecciones de patchify, caption y timestep, y el chunk 3 la cabeza de salida. El decoder VAE es el de la versión 0.9.5, condicionado por timestep con decode timestep 0.05, y se distribuye como binario separado por resolución (`ltxv_vae_<W>x<H>x<F>.bin`).

La innovación técnica principal es la cuantización agresiva para encajar en el espacio de direcciones near-memory del Hexagon: los pesos FP16 del transformer (3,9 GB) no caben, mientras que INT8 sí y además corre unas 3 veces más rápido, con un error de aproximadamente el 3% por chunk de 7 bloques frente a FP32. La variante `v73-int/` usa aritmética enteramente entera (INT8/INT16) para HTPs sin FP16 y 4 MB de VTCM, con un error de 1,08% frente a 1,11% del build FP16. Los grafos tienen formas fijas, de modo que cada build produce exactamente la resolución y el número de fotogramas indicados. El muestreo usa 8 pasos con CFG 1 y el schedule distilled del modelo original.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con prompts descriptivos en lenguaje natural.
- Generación de vídeo a partir de una imagen inicial (image-to-video), con codificación del primer fotograma en CPU mediante el VAE encoder.
- Salidas de 25 fotogramas a 512x320 en chips v69, v73 y v73-int, y a 768x512 en v75, v79, v81 y v85.
- Ejecución totalmente on-device en la NPU Hexagon, sin dependencia de servidores externos.
- Integración con LLM Hub como generador de vídeo local en Android.
- Compatible con stable-diffusion.cpp extendido (backend QNN) para el runner.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo generativo de vídeo, no un LLM.
- Capacidades multilingües: no disponibles como dato explícito; el encoder de texto es T5-XXL cuantizado a q4_0 ejecutado en CPU.

## Casos de uso

- Generación de vídeo local en Android para creadores de contenido: un clip de 25 fotogramas a 768x512 en 25,9 segundos en un Snapdragon 8 Elite permite iterar prompts rápidamente sin subir material a la nube, útil para prototipado de storyboards.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en la NPU del dispositivo, ningún prompt ni imagen de entrada sale del teléfono, lo que encaja en entornos sanitarios, legales o corporativos con requisitos de confidencialidad.
- Animar imágenes fijas en apps de edición móvil: el modo image-to-video permite convertir una foto en un clip breve; el coste añadido es la codificación CPU del primer fotograma (unos 80 segundos a 768x512 en un 8 Gen 3), asumible en flujos offline.
- Demos y pruebas de concepto de IA generativa en ferias o entornos sin conectividad: el modelo funciona sin red y sin GPU, lo que facilita demostraciones en dispositivos de gama alta Snapdragon.
- Investigación sobre eficiencia de difusión en NPUs: los context binaries y las métricas de error por chunk (3% frente a FP32) sirven para estudiar el impacto de INT8 en transformers de difusión sobre aceleradores móviles.
- Integración en pipelines de stable-diffusion.cpp: el runner `ltxv_qnn.hpp` permite añadir generación de vídeo a herramientas existentes basadas en ese framework, reutilizando la infraestructura de muestreo.
- Prototipado de publicidad o redes sociales en movilidad: clips cortos de 512x320 en 12,2 segundos en un 8 Elite permiten generar variaciones rápidas de una escena sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no tratarse de un modelo de lenguaje. Sí se publican mediciones de latencia por dispositivo:

| Dispositivo | Chip | Salida | Total | Text encoder (CPU) | 8 pasos (NPU) | VAE decode (NPU) |
|---|---|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 | 8 Elite Extreme Gen 6 | 768x512x25 | 27,8 s | no disponible | no disponible | no disponible |
| Galaxy Z Fold8 Ultra | 8 Elite Gen 5 | 768x512x25 | 26 s | no disponible | no disponible | no disponible |
| Snapdragon 8 Elite | 8 Elite | 768x512x25 | 25,9 s | 6,1 s | 15,2 s | 4,4 s |
| Snapdragon 8 Elite | 8 Elite | 512x320x25 | 12,2 s | no disponible | no disponible | no disponible |
| Snapdragon 8 Gen 3 | 8 Gen 3 | 768x512x25 | 39,8 s | 10,3 s | 22,7 s | 6,7 s |
| Galaxy Tab S9+ | 8 Gen 2 | 512x320x25 | 36 s | 22,9 s | 9,2 s | 4,1 s |
| Galaxy Tab S8 Ultra | 8 Gen 1 | 512x320x25 | 51,5 s | 24,6 s | 21,6 s | 4,8 s |

Como referencia sin NPU compatible, los GGUF de calcuis/ltxv-gguf vía Vulkan tardan 162 s en un Exynos 1580 (Galaxy A56), 270 s en un Exynos 1480 (Galaxy A55), 482 s en un Tensor G6 (Pixel 11 Pro) y unos 20 minutos en un Tensor G3 (Pixel 8 Pro) para 512x320.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/salida | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-Video-2B-0.9.8-distilled-QNN | 2B | 25 fotogramas, 512x320 o 768x512 | NPU Hexagon Snapdragon | ltx-video-open-weights-license-0.x | Hugging Face (este repo) |
| Lightricks/LTX-Video (base) | 2B | flexible según checkpoint | GPU (CUDA, etc.) | ltx-video-open-weights-license | Hugging Face |
| calcuis/ltxv-gguf | 2B | 512x320 (medido) | GPU vía Vulkan / CPU | derivada del base | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de las latencias medidas en la sección anterior.

## Limitaciones y advertencias

- Los grafos tienen formas fijas: cada build solo produce la resolución y el número de fotogramas indicados; no hay flexibilidad de aspect ratio ni duración.
- Los chips Snapdragon 8 Gen 1 y 8 Gen 2 no tienen espacio de direcciones suficiente para 768x512; en el 8 Gen 1 los cuatro chunks no caben simultáneamente y el runner hace streaming de dos de ellos en cada paso, lo que penaliza la latencia.
- La variante `v73-int/` está pensada para cuatro chips (8s Gen 4, 8s Gen 3, 7+ Gen 3, 7 Gen 4) pero solo se ha probado de extremo a extremo en un v73 (Snapdragon 8 Gen 2).
- Los chips 7 Gen 1 y 6 Gen 1 tienen 2 MB de VTCM y no disponen de build.
- Las librerías runtime de QNN deben coincidir exactamente con la versión de QAIRT usada en la compilación (2.50.0.260828); la excepción es `v85/`, compilada con QAIRT 2.52.0.261104, que requiere el runtime 2.52.
- La cuantización INT8 introduce un error de aproximadamente el 3% por chunk frente a FP32; aunque el autor indica que no es visible en la salida, puede afectar a detalles finos en prompts exigentes.
- El VAE decoder en FP16 puro sobre la NPU difuminaba los fotogramas finales, de ahí el uso de W8A16; no se documentan otras alternativas de precisión.
- El image-to-video añade una codificación CPU del primer fotograma de unos 80 segundos a 768x512 en un 8 Gen 3, lo que limita su uso interactivo.
- Licencia `ltx-video-open-weights-license-0.x`: es necesario revisar el texto completo antes de uso comercial; no es una licencia permisiva estándar tipo Apache o MIT.
- Riesgo de alucinación visual y de artefactos propios de modelos de difusión de vídeo, especialmente en escenas con movimiento complejo o texto en la imagen; no se documentan sesgos específicos.
- El repo tiene 0 descargas y 4 likes en el momento de la consulta, lo que indica una adopción muy temprana y poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timmyboy26/LTX-Video-2B-0.9.8-distilled-QNN
- Modelo base: https://huggingface.co/Lightricks/LTX-Video
- Repositorio LLM Hub: https://github.com/timmyy123/LLM-Hub
- GGUF y VAE de referencia: https://huggingface.co/calcuis/ltxv-gguf
- Licencia: https://huggingface.co/timmyboy26/LTX-Video-2B-0.9.8-distilled-QNN/blob/main/LICENSE.txt
- Ejemplo de vídeo 768x512: https://huggingface.co/timmyboy26/LTX-Video-2B-0.9.8-distilled-QNN/resolve/main/media/8elite_city_768x512.mp4
- Ejemplo de vídeo 512x320: https://huggingface.co/timmyboy26/LTX-Video-2B-0.9.8-distilled-QNN/resolve/main/media/8elite_puppy_512x320.mp4
