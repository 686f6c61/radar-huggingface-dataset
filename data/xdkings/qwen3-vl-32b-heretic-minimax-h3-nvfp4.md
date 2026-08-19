# xdkings/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4

## Resumen

Este repositorio contiene una re-cuantización en precisión mixta NVFP4 del text encoder "Heretic" (sin censura) basado en Qwen3-VL-32B, adaptado para el modelo de generación de vídeo MiniMax-H3. El autor, xdkings, parte del trabajo de ethanfel (Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot) y lo re-cuantiza de INT8 a NVFP4, reduciendo el tamaño de 26,4 GB a 15,7 GB. El objetivo principal es permitir que este encoder, que elimina las restricciones de censura del modelo original, quepa en una GPU de 16 GB sin necesidad de descargar pesos a memoria del sistema.

La relevancia de este modelo radica en que democratiza el uso de un encoder de vídeo sin censura en hardware de consumo, algo que antes requería tarjetas de 80 GB o técnicas de offload. Es un drop-in replacement del encoder oficial de Comfy-Org (que sí está censurado), manteniendo el mismo tamaño y compatibilidad con los flujos de ComfyUI existentes. La re-cuantización se ha realizado con especial cuidado en preservar la semántica de la rotación ConvRot aplicada en los pesos originales, un paso crítico que, si se omite, produce vídeos completamente ajenos al prompt sin ningún error aparente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-32B (text encoder) adaptado para MiniMax-H3, con precisión mixta NVFP4/INT8 |
| Parámetros totales | No disponible (el nombre indica 32B, pero no se especifica el recuento exacto del encoder) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (grupo 16) en 350 capas lineales; INT8 en la capa de embeddings (778 M parámetros) |
| Idiomas soportados | No disponible (el modelo base Qwen3-VL es multilingüe, pero no se documenta para esta adaptación) |
| Licencia | Apache-2.0 (los pesos del modelo base están sujetos a la MiniMax H3 Community License) |
| Formato de pesos | Safetensors (un único archivo de 15,7 GB) |

## Arquitectura y entrenamiento

El modelo es una re-cuantización, no un entrenamiento desde cero. Parte del text encoder Qwen3-VL-32B de Alibaba, adaptado por MiniMax para su pipeline de generación de vídeo H3. El trabajo de ethanfel aplicó técnicas de "abliteration" para eliminar las capas de rechazo de contenido (uncensored), produciendo la versión "Heretic". Sobre esa base, este repositorio re-cuantiza los pesos de INT8 a NVFP4 con un esquema de precisión mixta: las capas lineales (350 en total) usan NVFP4 con grupo de 16, mientras que la capa de embeddings se mantiene en INT8 para evitar problemas de memoria durante el proceso de horneado.

Una innovación técnica destacable es el manejo de la rotación ConvRot presente en los pesos originales. Los pesos almacenados están multiplicados por una matriz de Hadamard normalizada por grupos de 256. Para re-cuantizar correctamente, el autor implementó un paso de "unrotate" que deshace esa rotación antes de aplicar NVFP4, y luego la vuelve a aplicar en el archivo final. Sin este paso, el modelo cargaría y ejecutaría sin errores, pero produciría condicionamientos de vídeo completamente incorrectos. El proceso completo de horneado tarda unos dos minutos en una GPU de 16 GB.

## Capacidades

- Text encoding para generación de vídeo con MiniMax-H3: convierte prompts en lenguaje natural en representaciones latentes que guían la generación de vídeo con audio.
- Sin censura (Heretic/abliterated): elimina los filtros de contenido del modelo original, permitiendo prompts que el encoder oficial rechazaría.
- Compatibilidad total con ComfyUI: funciona como drop-in replacement del encoder NVFP4 de Comfy-Org; basta con apuntar el nodo `CLIPLoader` (tipo `minimax`) al archivo.
- Precisión mixta NVFP4/INT8: mantiene la calidad visual del encoder INT8 original (según comparación del autor) con un tamaño reducido a 15,7 GB.
- Soporte de generación de vídeo vertical (480×864) con audio, verificado en pruebas con el modelo de difusión `fl2va` de MiniMax-H3.

## Casos de uso

- Generación de vídeo creativo sin restricciones en GPU de 16 GB: permite a creadores con tarjetas como RTX 4080 o RTX PRO 2000 usar el encoder sin censura para producir vídeos con prompts que el encoder oficial bloquearía, por ejemplo, contenido artístico con violencia o desnudez.
- Sustitución directa en flujos ComfyUI existentes: cualquier workflow de MiniMax-H3 que use el encoder NVFP4 de Comfy-Org puede cambiar el archivo por este sin modificar nada más, obteniendo las mismas capacidades pero sin censura.
- Investigación sobre cuantización de modelos multimodales: el repositorio documenta el proceso de re-cuantización de INT8 a NVFP4 con manejo de rotación ConvRot, útil para quienes trabajan en compresión de modelos.
- Desarrollo de herramientas de vídeo generativo para entornos con memoria limitada: al caber en 16 GB, puede integrarse en sistemas embebidos o estaciones de trabajo con una sola GPU, sin necesidad de servidores con múltiples tarjetas.
- Evaluación comparativa de calidad entre cuantizaciones: el autor proporciona mediciones de VRAM (pico de ~9,9 GB durante generación) y comparaciones visuales con el encoder INT8, lo que permite a otros validar el impacto de la cuantización.
- Prototipado rápido de pipelines de vídeo: al ser un archivo único de 15,7 GB, facilita la distribución y el despliegue en entornos de CI/CD para pruebas automatizadas de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que este modelo no es un LLM general sino un text encoder especializado para vídeo. La única métrica de rendimiento documentada es la medición de uso de recursos durante una generación de prueba:

| Métrica | Valor |
|---|---|
| Generación de prueba | 6 s de vídeo 480×864 con audio, modelo de difusión `fl2va` INT8, 20 pasos `res_multistep`, ComfyUI 0.30.0, Sage Attention |
| Pico de VRAM durante generación | ~9,9 GB |
| Encoder en VRAM (carga dinámica) | 14,9 GB |
| RAM del sistema usada por ComfyUI | ~36 GB |

El autor afirma que la salida es "visualmente equivalente" al encoder INT8-ConvRot original con el mismo prompt y semilla, pero no proporciona métricas cuantitativas (p. ej., FID, CLIP score) que respalden esa afirmación.

## Requisitos de hardware

- VRAM: el encoder ocupa 14,9 GB en VRAM durante la carga, y el pico de VRAM total durante la generación es de ~9,9 GB (con el modelo de difusión en INT8). Por tanto, se necesita una GPU con al menos 16 GB de VRAM.
- GPU recomendadas: cualquier GPU Blackwell (sm_120) con 16 GB o más, como la RTX PRO 2000 Blackwell (usada en las pruebas) o las RTX 50 series. NVFP4 requiere soporte hardware de Blackwell; no funcionará en GPUs Ampere o anteriores.
- RAM del sistema: se recomiendan al menos 36 GB de RAM para el proceso de ComfyUI, según las mediciones del autor.
- Opciones de despliegue: exclusivamente a través de ComfyUI, cargando el archivo en `ComfyUI/models/text_encoders/` y seleccionándolo en el nodo `CLIPLoader` con tipo `minimax`. No se documenta compatibilidad con vLLM, llama.cpp u otros frameworks.
- Latencia y throughput: no se proporcionan datos de velocidad de inferencia más allá del tiempo total de generación (no desglosado).

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | Censura | Compatibilidad ComfyUI | VRAM necesaria |
|---|---|---|---|---|---|
| **Este modelo (xdkings NVFP4)** | 15,7 GB | NVFP4/INT8 mixta | Sin censura (Heretic) | Sí (drop-in) | 16 GB |
| ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot | 26,4 GB | INT8 con ConvRot | Sin censura (Heretic) | Sí | 24 GB o más (requiere offload en 16 GB) |
| Comfy-Org NVFP4 (oficial) | 15,7 GB | NVFP4 | Censurado | Sí (drop-in) | 16 GB |
| Qwen3-VL-32B original (sin adaptar) | ~65 GB en BF16 | BF16 | Censurado | No directamente | 80 GB |

La principal diferencia entre este modelo y el de Comfy-Org es la eliminación de la censura. Frente al INT8 de ethanfel, ofrece el mismo comportamiento sin censura pero con un 40 % menos de tamaño, a costa de una precisión ligeramente inferior (debido a la doble cuantización INT8 → NVFP4). La licencia Apache-2.0 de este repo se aplica a la cuantización, pero los pesos subyacentes de MiniMax-H3 están sujetos a su licencia comunitaria, que puede restringir ciertos usos comerciales.

## Limitaciones y advertencias

- Requiere hardware Blackwell (sm_120): NVFP4 no es compatible con GPUs de generaciones anteriores, lo que limita su uso a RTX 50 series y tarjetas profesionales recientes.
- Doble cuantización: al partir de pesos ya cuantizados en INT8, la re-cuantización a NVFP4 introduce errores de redondeo adicionales. El autor admite que un horneado directo desde BF16 habría sido "marginalmente más limpio".
- Sin censura: al ser un modelo "Heretic", puede generar contenido explícito, violento o inapropiado. No debe usarse en entornos donde se requiera moderación de contenido.
- Licencia MiniMax H3 Community License: aunque este repo se publica bajo Apache-2.0, los pesos del modelo base están sujetos a la licencia de MiniMax, que puede imponer restricciones de uso comercial y atribución.
- No es un modelo de lenguaje general: solo funciona como text encoder dentro del pipeline de MiniMax-H3; no puede usarse para chat, generación de texto o razonamiento.
- Riesgo de corrupción silenciosa: si se modifica el archivo o se intenta re-cuantizar sin respetar la rotación ConvRot, el modelo cargará y ejecutará sin errores pero producirá vídeos sin relación con el prompt. El autor advierte explícitamente de este riesgo.
- Documentación incompleta: no se especifican parámetros totales, longitud de contexto ni idiomas soportados, lo que dificulta una evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xdkings/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4
- Modelo base (INT8-ConvRot): https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot
- MiniMax-H3 (original): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Comfy-Org MiniMax-H3 (convenciones y layouts): https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio espejo (Momoking): https://huggingface.co/Momoking/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4
- Guía de MiniMax H3 Video Gen (contexto del ecosistema): https://www.stablediffusiontutorials.com/2026/08/minimax-h3.html
