# xgirls/Wan2.2-TI2V-5B-Turbo-Intel-Vulkan

## Resumen

Wan2.2-TI2V-5B-Turbo-Intel-Vulkan es un paquete de inferencia y pesos cuantizados en GGUF que permite ejecutar el modelo generativo de vídeo Wan2.2 TI2V 5B en formato image-to-video sobre GPUs Intel integradas y dedicadas mediante la API Vulkan. Lo publica el usuario xgirls sobre el modelo base Wan-AI/Wan2.2-TI2V-5B, incorporando la variante Turbo de cuatro pasos cuantizada por hum-ma. El objetivo es llevar la generación de vídeo a hardware consumer de Intel en Windows sin requerir CUDA ni GPUs de datacenter.

El paquete empaqueta un denoiser Turbo en cuantización Q4_0, un codificador de texto UMT5 en Q4_K_M y un decodificador VAE tileado (TAEHV para el perfil `preview` y VAE completo para el perfil `turbo`), orquestados mediante stable-diffusion.cpp con backend Vulkan. El resultado es una inferencia de 21 fotogramas a 544×704 píxeles con cuatro pasos Euler y CFG 1 usando unos 8 GiB de presupuesto de memoria en el perfil ligero.

Su relevancia es doble: por un lado, demuestra que la generación de vídeo de 5B parámetros puede ejecutarse en una Intel Arc B390 con Windows 11; por otro, documenta límites concretos del backend Vulkan en esa build (tileado obligatorio de 128 px por el límite de grupos de trabajo del driver). El repositorio no contiene pesos (0.0 GB) sino scripts, presets y referencias de descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Wan2.2 TI2V, transformer de difusion; detalles no publicados en esta ficha) |
| Parametros totales | 5B (segun nombre del modelo base Wan2.2-TI2V-5B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (denoiser Turbo), Q4_K_M (encoder UMT5), decodificador VAE tileado; formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (paquete distribuido por descarga desde el Hub; el repo en si contiene scripts y presets) |

## Arquitectura y entrenamiento

El repositorio es un envoltorio de despliegue, no un entrenamiento nuevo. Reutiliza el modelo base Wan-AI/Wan2.2-TI2V-5B (image-to-video, 5B parámetros) y la cuantización Turbo de cuatro pasos publicada por hum-ma, orientada a reducir el número de pasos de difusión respecto al modelo original. El encoder de texto es UMT5 en GGUF, repackaging de off-grid-ai, y el decodificador VAE puede ser el completo de Wan2.2 (perfil `turbo`, tileado) o el TAEHV de madebyollin (perfil `preview`, tileado a 128 px).

El paquete incluye un script `run.py` con dos perfiles (`preview` y `turbo`), un `presets.json` y verificaciones de preflight: comprobación del dispositivo Intel, validación de descargas por SHA-256 y comprobación en el log del runtime de que los parámetros del modelo se han asignado a Vulkan. La generación se ejecuta con cuatro pasos Euler, CFG 1, schedule simple, shift 8 y semilla 42. No se detallan en la información disponible el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esa información corresponde al modelo base y no se reproduce aquí.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) con prompt textual de movimiento.
- Generación de secuencias cortas de 21 fotogramas a resolución 544×704 en el benchmark de referencia.
- Inferencia en cuatro pasos de difusión (variante Turbo), lo que reduce el coste frente a schedules de decenas de pasos.
- Ejecución sobre backend Vulkan en Windows con GPUs Intel (validado en Intel Arc B390 con driver 32.0.101.9033).
- Dos modos de decodificación: TAEHV tileado (perfil `preview`) y VAE completo tileado (perfil `turbo`).
- Verificación de integridad de descargas por SHA-256 y comprobación de asignación de parámetros a Vulkan en el log.
- Exportación de fotogramas PNG y encoding opcional a MP4 vía ffmpeg.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio en la información disponible.

## Casos de uso

- Prototipado de animación image-to-video en estaciones de trabajo Intel: usar `run.py --preset preview --input foto.png --prompt "..."` para obtener un clip de 21 fotogramas y evaluar el resultado antes de invertir en GPU dedicada.
- Pruebas de concepto en portátiles con gráfica Intel integrada: el perfil `preview` está diseñado para un presupuesto de 8 GiB y evita requerir CUDA, lo que permite validar ideas en hardware ya existente.
- Generación de clips cortos para redes sociales o previsualizaciones de storyboard: 544×704 y 21 fotogramas con four-step Turbo encajan en iteraciones rápidas (25,21 s de render completo en el benchmark).
- Automatización de pipelines de contenido en Windows: el script permite pasar de imagen a secuencia de PNG y luego a MP4 con ffmpeg, integrándose en scripts batch existentes.
- Evaluación comparativa de decodificadores VAE: alternar entre `preview` (TAEHV) y `turbo` (VAE completo) para medir calidad frente a coste en el mismo hardware.
- Verificación de compatibilidad de drivers Intel: usar el preflight y el log de backend para determinar si una GPU o driver concreto asigna correctamente los parámetros a Vulkan antes de desplegar.
- Docencia y experimentación con difusión de vídeo en entornos sin GPUs NVIDIA: al estar bajo Apache 2.0 y usar stable-diffusion.cpp, es replicable en aulas con equipos Intel.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre Intel Arc B390, Windows 11, driver 32.0.101.9033 y stable-diffusion.cpp 532d2c1, con 21 fotogramas de 544×704, cuatro pasos Euler, CFG 1, shift 8 y semilla 42:

| Perfil | Render completo | Decodificacion | Clip |
|---|---:|---:|---|
| Preview, TAEHV tileado | 25,21 s | 4,39 s | examples/wan-preview.mp4 |
| Turbo, VAE completo tileado | 90,42 s | 60,53 s (prueba inicial) | examples/wan-turbo.mp4 |

No se han publicado resultados de benchmarks comparativos (FVD, CLIP score, MMLU u otros) en la informacion disponible. El autor indica que el rendimiento en Iris Xe y la compatibilidad con otros drivers aun no se han probado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GiB de presupuesto de runtime en el perfil `preview`; el perfil `turbo` con VAE completo requiere mas memoria (no se especifica cifra exacta).
- GPU validadas: Intel Arc B390 (benchmark oficial). Iris Xe no probado segun el autor.
- GPU no soportadas de forma nativa: el paquete apunta a Vulkan/Intel; no se documenta soporte para NVIDIA CUDA ni AMD ROCm en esta build.
- Sistema operativo: Windows (probado en Windows 11); requiere Python de 64 bits 3.10 o superior y driver Intel con Vulkan.
- Despliegue: stable-diffusion.cpp (commit 532d2c1) con backend Vulkan, orquestado por `run.py`; descarga de assets vía `huggingface_hub` (6,71 GB en perfil `preview`).
- Restricciones conocidas del backend: el perfil `preview` debe mantener el tileado de 128 px con esta build Vulkan; el test sin tileado supero el limite de grupos de trabajo del driver.
- Encoding opcional de salida: ffmpeg con `-framerate 16 -i outputs/frame_%03d.png -c:v libx264 -pix_fmt yuv420p clip.mp4`.
- Latencia y throughput: ver tabla de benchmarks (25,21 s y 90,42 s de render completo para 21 fotogramas en Arc B390).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Hardware objetivo | Licencia | Contexto/uso |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B-Turbo-Intel-Vulkan (este) | 5B | GGUF (Q4_0 + Q4_K_M) | Intel Vulkan, Windows | Apache 2.0 | image-to-video, 4 pasos, 544×704 |
| Wan-AI/Wan2.2-TI2V-5B (base) | 5B | safetensors (BF16) | GPU NVIDIA (CUDA) | Apache 2.0 | image-to-video, schedule completo |
| hum-ma/Wan2.2-TI2V-5B-Turbo-GGUF | 5B | GGUF | GPU genericas via stable-diffusion.cpp / llama.cpp-style | Apache 2.0 | image-to-video Turbo cuantizado |
| off-grid-ai/Wan2.2-TI2V-5B-GGUF | 5B | GGUF | GPU genericas | Apache 2.0 | image-to-video con encoder UMT5 separado |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada; las diferencias documentadas son de cuantizacion, backend y perfil de decodificacion.

## Limitaciones y advertencias

- Repositorio sin pesos: el tamano del repo es 0,0 GB; los assets se descargan en tiempo de ejecucion (6,71 GB para `preview`), por lo que se requiere conexion y espacio en disco.
- Hardware muy restringido: validado unicamente en Intel Arc B390; Iris Xe y otros drivers no estan probados, y no hay soporte documentado para CUDA ni ROCm.
- Limitacion del backend: el tileado de 128 px es obligatorio en la build Vulkan de referencia; sin el, se supera el limite de grupos de trabajo del driver.
- Calidad frente al modelo base: el autor senala que el perfil `preview` conserva sujeto y colores pero introduce cambios en textura fina; no es una reproduccion identica del Wan2.2 original.
- Longitud de clip fija en el benchmark: 21 fotogramas; no se documenta generacion de secuencias mas largas.
- Idiomas: no disponibles; el encoder UMT5 soporta multiples idiomas, pero el autor no declara lista concreta.
- Sesgos y alucinacion visual: no se documentan evaluaciones de sesgo ni tasas de alucinacion; al ser un modelo generativo de video, puede producir artefactos y contenido no fiel al prompt.
- Licencia Apache 2.0 en el paquete, pero conviene verificar la licencia del modelo base y de los assets de terceros (TAEHV, UMT5, stable-diffusion.cpp) antes de uso comercial.
- Versionado: el paquete fija un commit de stable-diffusion.cpp (532d2c1) y un driver Intel concreto; cambios de driver o de build pueden romper la reproducibilidad.
- Sin garantias de produccion: descargas 0 y likes 0 en el momento de la ficha; no hay evidencia de uso en produccion ni mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/xgirls/Wan2.2-TI2V-5B-Turbo-Intel-Vulkan
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Cuantizacion Turbo: https://huggingface.co/hum-ma/Wan2.2-TI2V-5B-Turbo-GGUF
- Encoder UMT5: https://huggingface.co/off-grid-ai/Video-Companions-GGUF
- Repackaging VAE Wan: https://huggingface.co/off-grid-ai/Wan2.2-TI2V-5B-GGUF
- TAEHV: https://github.com/madebyollin/taehv
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
