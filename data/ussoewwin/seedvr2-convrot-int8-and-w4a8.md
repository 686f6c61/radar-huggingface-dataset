# ussoewwin/SeedVR2-ConvRot-INT8-and-w4a8

## Resumen

SeedVR2 es un modelo de mejora de vídeo (video upscaling) basado en un Diffusion Transformer (DiT) desarrollado originalmente por ByteDance Seed. Este repositorio concreto, publicado por el usuario independiente ussoewwin, no contiene los pesos originales sino versiones cuantizadas del DiT de SeedVR2 en formatos ConvRot INT8 y ConvRot W4A8, pensadas para inferencia de bajo consumo dentro de ComfyUI mediante TensorRT. El objetivo es hacer viable la ejecución del modelo en GPUs de consumo, reduciendo el peso del DiT de 7B de 15,35 GB en FP16 a 4,44 GB en W4A8 (un 71,1 % menos) o a 8,12 GB en INT8.

La relevancia de esta ficha es practica: no se trata de un modelo nuevo, sino de un artefacto de despliegue que aplica tecnicas de cuantizacion avanzadas (rotacion ortogonal Hadamard y escalado jerarquico de dos niveles) para preservar la calidad de las trayectorias de difusion mientras se reduce drasticamente la VRAM residente. Segun los datos del autor, el 7B en W4A8 alcanza 5,69 GiB de VRAM pico frente a los 16,04 GiB del FP16, con una similitud coseno latente media de 0,98672 respecto al original.

El repositorio incluye variantes de 7B y 3B, en version "Base" y "Sharp", y esta publicado bajo licencia Apache 2.0. Al ser un artefacto de cuantizacion derivado, hereda las capacidades del modelo base: mejora de resolucion de video, no generacion de texto ni razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) NaDiT de SeedVR2 |
| Parametros totales | 7B o 3B segun checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision/video, no de texto) |
| Tipos de cuantizacion | INT8 tensorwise y W4A8 asimetrico (`asym_w4a8_int8`), ambos con ConvRot |
| Idiomas soportados | no disponible (no aplica; modelo video-to-video) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout ComfyUI nativo `AsymW4A8Int8Layout` / `int8_tensorwise`) |
| Modelo base | ByteDance-Seed/SeedVR2 |
| Tamano del repo | 31,7 GB |
| Pipeline | video-to-video |
| Libreria | TensorRT |

## Arquitectura y entrenamiento

El modelo subyacente es un Diffusion Transformer (NaDiT) de ByteDance Seed para restauracion y upscaling de video. Este repositorio no entrena el modelo: parte de los pesos FP16 de SeedVR2 y aplica cuantizacion post-entrenamiento (PTQ) sobre las capas lineales del transformer. En la variante de 7B se cuantizan 288 pesos de proyeccion 2D de atencion y MLP, mientras que 842 capas sensibles (normalizaciones, sesgos, RoPE, embeddings y cabezas de salida) se mantienen estrictamente en FP16.

La innovacion tecnica principal es ConvRot, una rotacion ortogonal basada en una matriz de Hadamard normalizada H256 (construida como producto tensorial de H4 y normalizada por 1/sqrt(256)) aplicada sobre la dimension de reduccion K. Esto mitiga los outliers de canal que degradan la precision al truncar a 4 bits. El escalado es jerarquico de dos niveles: escala por canal en FP32 multiplicada por una escala relativa por grupo en FP8 e4m3fn, con grupo de rotacion de 256 canales y grupo de pesos de 16 canales. Los pesos INT4 se empaquetan en almacenamiento `torch.int8` con forma `[out_features, in_features // 2]`. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Mejora de resolucion de video (video upscaling) y restauracion de detalle, heredadas del DiT de SeedVR2.
- Procesamiento video-a-video con inferencia de difusion.
- Dos variantes de comportamiento: "Base" y "Sharp" (esta ultima orientada a mayor nitidez).
- Ejecucion en precision reducida (INT8 o W4A8) dentro de ComfyUI con backend TensorRT.
- No soporta tool calling, function calling ni agentes: no es un modelo de lenguaje.
- No dispone de capacidades multilingues ni de generacion de texto, codigo o matematicas.
- No se documentan modos de razonamiento (thinking), vision general ni audio.

## Casos de uso

- Restauracion de metraje antiguo o de baja resolucion: el DiT de SeedVR2 reconstruye detalle en video comprimido o escalado, y la variante W4A8 permite ejecutarlo en una GPU de consumo con 5,69 GiB de VRAM pico.
- Upscaling en flujos de postproduccion dentro de ComfyUI: al integrarse como nodo nativo con TensorRT, se puede encadenar con otros nodos de video sin salir del entorno.
- Procesado por lotes en estaciones de trabajo modestas: el 3B en INT8 requiere 5,69 GiB y tarda 9,55 s por inferencia en el benchmark del autor, lo que lo hace apto para colas de trabajo en GPUs de gama media.
- Prototipado rapido de pipelines de video-to-video: la variante W4A8 del 7B reduce el tiempo de inferencia a 14,32 s frente a 129,41 s del FP16, agilizando iteraciones de prueba y error.
- Despliegue en entornos con VRAM limitada: con 5,69 GiB pico, el 7B W4A8 cabe en GPUs consumer de 8 GB o 12 GB, ampliando el acceso al modelo.
- Mejora de video para plataformas de contenido: la variante "Sharp" (11,18 s en W4A8) prioriza nitidez percibida, adecuada para material destinado a visualizacion en pantallas de alta densidad.
- Investigacion sobre cuantizacion de DiT: el repositorio documenta la formulacion matematica de ConvRot y scripts de benchmark reproducibles, util para estudiar el impacto de INT4/INT8 en modelos de difusion.

## Benchmarks y rendimiento

Datos del autor sobre 25 semillas deterministas (42 a 99999), comparando con el FP16 de referencia:

| Modelo y cuantizacion | Tiempo de inferencia | VRAM pico | Coseno latente (media) | Rango coseno | Bifurcaciones |
|---|---:|---:|---:|---:|---:|
| 7B ConvRot INT8 | 24,51 s | 8,53 GiB | 0,99892 | 0,99870–0,99902 | 0/25 |
| 7B ConvRot W4A8 | 14,32 s | 5,69 GiB | 0,98672 | 0,98579–0,98759 | 0/25 |
| 7B Sharp ConvRot INT8 | 24,50 s | 8,53 GiB | 0,99766 | 0,99707–0,99796 | 0/25 |
| 7B Sharp ConvRot W4A8 | 11,18 s | 5,69 GiB | 0,97682 | 0,97505–0,97789 | 0/25 |
| 3B ConvRot INT8 | 9,55 s | 5,69 GiB | 0,99724 | 0,99679–0,99750 | 0/25 |
| 3B ConvRot W4A8 | 9,02 s | 5,69 GiB | 0,97093 | 0,96981–0,97230 | 0/25 |
| Baseline FP16 7B | 129,41 s | 16,04 GiB | 1,00000 | 1,00000 | 0 |

No se han publicado resultados de benchmarks estandar (PSNR, SSIM, LPIPS) en la informacion disponible; las metricas anteriores son de similitud latente y rendimiento, no de calidad perceptiva objetiva.

## Requisitos de hardware

- VRAM estimada: 5,69 GiB pico para 7B W4A8 y 3B (ambas cuantizaciones segun tabla); 8,53 GiB para 7B INT8; 16,04 GiB para el FP16 de referencia.
- GPU recomendadas: el autor menciona "consumer RTX hardware"; por VRAM, el 7B W4A8 cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; el 7B INT8 requiere al menos 12 GB. Para A100/H100 no se aportan datos especificos.
- Cabe en GPU consumer: si, la variante W4A8 en tarjetas de 8 GB o mas (con margen ajustado en 8 GB).
- Opciones de despliegue: ComfyUI con backend TensorRT (requiere el repositorio ComfyUI-SeedVR2-VideoUpscaler-with-TensorRT del mismo autor); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un DiT de video).
- Latencia y throughput: 14,32 s por inferencia en 7B W4A8 (aceleracion de ~9,0x frente a FP16); 9,02 s en 3B W4A8; 24,51 s en 7B INT8. No se especifica el hardware exacto del benchmark.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano en disco | VRAM pico | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| SeedVR2 7B W4A8 (este repo) | 7B | W4A8 + ConvRot | 4,44 GB | 5,69 GiB | Apache 2.0 | HuggingFace |
| SeedVR2 7B INT8 (este repo) | 7B | INT8 + ConvRot | 8,12 GB | 8,53 GiB | Apache 2.0 | HuggingFace |
| SeedVR2 3B W4A8 (este repo) | 3B | W4A8 + ConvRot | 2,21 GB | 5,69 GiB | Apache 2.0 | HuggingFace |
| SeedVR2 7B FP16 (base) | 7B | FP16 | 15,35 GB | 16,04 GiB | Apache 2.0 | HuggingFace (ByteDance-Seed) |

No se dispone de informacion sobre otros modelos de upscaling de video comparables (por ejemplo, variantes de Real-ESRGAN o similares) en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto derivado: no es un modelo original; cualquier cambio en el modelo base de ByteDance afecta a la validez de estos pesos.
- Perdida de fidelidad medible: el coseno latente del 7B W4A8 es 0,98672 y el del 3B W4A8 es 0,97093, lo que implica divergencia respecto al FP16; no se han publicado metricas perceptivas (PSNR/SSIM) que cuantifiquen el impacto visual real.
- La variante "Sharp" no supera el criterio de "misma imagen" en el benchmark (N/A), por lo que su salida difiere intencionadamente del original.
- Dependencia de TensorRT y de un repositorio externo de ComfyUI para su uso; no es un checkpoint plug-and-play en otros entornos.
- Sin informacion sobre sesgos: al ser un modelo de vision, los sesgos potenciales (por ejemplo, en la reconstruccion de rostros o texturas) no estan documentados.
- Riesgo de artefactos de cuantizacion en escenas con alto detalle o movimiento rapido, no evaluado en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base SeedVR2 y de los pesos originales antes de desplegar en produccion.
- Repositorio con 0 descargas y 2 likes en el momento de la consulta: sin validacion comunitaria amplia.

## Enlaces

- HuggingFace: https://huggingface.co/ussoewwin/SeedVR2-ConvRot-INT8-and-w4a8
- Modelo base: https://huggingface.co/ByteDance-Seed/SeedVR2
- Repositorio SeedVR: https://github.com/ByteDance-Seed/SeedVR
- Repositorio ComfyUI + TensorRT del autor: https://github.com/ussoewwin/ComfyUI-SeedVR2-VideoUpscaler-with-TensorRT
- Script de benchmark W4A8: https://github.com/ussoewwin/ComfyUI-SeedVR2-VideoUpscaler-with-TensorRT/blob/main/benchmark/seedvr2_w4a8_traj_compare.py
- Script de benchmark INT8: https://github.com/ussoewwin/ComfyUI-SeedVR2-VideoUpscaler-with-TensorRT/blob/main/benchmark/seedvr2_int8_traj_compare.py
