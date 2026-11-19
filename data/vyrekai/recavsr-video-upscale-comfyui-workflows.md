# vyrekai/recavsr-video-upscale-comfyui-workflows

## Resumen

Este repositorio no contiene un modelo de lenguaje en sentido estricto, sino un conjunto de tres flujos de trabajo (workflows) para ComfyUI que orquestan **ReCaVSR**, un modelo de superresolución de vídeo de un solo paso construido sobre la arquitectura Wan 2.2. ReCaVSR ha sido desarrollado por el grupo de investigación de la USTC (Universidad de Ciencia y Tecnología de China) y los workflows han sido empaquetados por el usuario VYREKAI para su uso directo en ComfyUI. El objetivo es upscalear cualquier vídeo (generado por IA como MiniMax H3, anime, renderizado 3D o metraje real) hasta 4K con un único clic, sin necesidad de ajustar manualmente la escala.

La aportación principal del repositorio es la gestión automática de memoria: cada workflow lee las dimensiones del vídeo de entrada y calcula la mayor resolución de salida que cabe en la VRAM de la tarjeta del usuario (8, 12 o 16 GB), aplicando un margen de seguridad y redondeando a dimensiones pares para que el codificador de vídeo las acepte. Se activa además `kv_offload`, que mantiene el historial de atención en RAM en lugar de VRAM sin alterar el resultado bit a bit.

Es relevante porque democratiza la superresolución de vídeo de calidad en hardware de consumo: una RTX 3060 de 8 GB puede producir Full HD y una RTX 5070 Ti de 16 GB alcanza 4K, con procesamiento por lotes de 8 fotogramas que permite vídeos largos sin incrementar el consumo de VRAM. El repositorio incluye únicamente los ficheros JSON de los workflows; los pesos del modelo (6,3 GB en int8) se descargan por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ReCaVSR, superresolución de vídeo de un solo paso basada en Wan 2.2 (transformer de difusión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa vídeo en lotes de 8 fotogramas) |
| Tipos de cuantizacion | int8 (pesos `transformer_int8_convrot.safetensors`, 6,3 GB); no se documentan otras |
| Idiomas soportados | no aplica (modelo de vídeo, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformer_int8_convrot.safetensors`, `prompt.safetensors`, `flashdecoder.safetensors`) |
| Entorno de ejecucion | ComfyUI 0.44 o superior + nodo personalizado ComfyUI-ReCaVSR |
| VRAM objetivo | 8 GB, 12 GB y 16 GB (tres workflows diferenciados) |
| RAM del sistema | 16 GB mínimo (8 GB VRAM), 24 GB+ (12/16 GB VRAM), 32 GB recomendado para 4K |
| Espacio en disco | ~7 GB para los tres ficheros de modelo |
| GPU compatible | NVIDIA RTX serie 20 o superior (serie 30 o superior para los kernels más rápidos) |

## Arquitectura y entrenamiento

ReCaVSR es un modelo de superresolución de vídeo de un solo paso ("one-step") construido sobre Wan 2.2, un transformer de difusión para generación de vídeo. La inferencia se apoya en tres componentes: un transformer principal cuantizado a int8 (`transformer_int8_convrot.safetensors`), un módulo de prompt (`prompt.safetensors`, 4 MB) y un decodificador rápido (`flashdecoder.safetensors`, 229 MB). El nodo ComfyUI-ReCaVSR, desarrollado por PedroMarinhoDev, es quien aporta los pesos int8 y la integración con ComfyUI.

Los workflows implementan dos optimizaciones clave para hardware de consumo. Por un lado, `kv_offload` mantiene el historial de atención en RAM en lugar de VRAM, lo que libera memoria en la tarjeta sin modificar el resultado (el autor afirma que la salida es idéntica bit a bit). Por otro, el vídeo se procesa en lotes de 8 fotogramas que se escriben al fichero a medida que se generan, de modo que la duración del clip afecta al tiempo y al espacio en disco, pero no al consumo de VRAM. El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO; esa información corresponde a la model card original de ReCaVSR en Hugging Face, no incluida en este repositorio.

## Capacidades

- Superresolución de vídeo de un solo paso: upscale de hasta 4x con salida máxima de 4K (3840x2160) según la VRAM disponible.
- Selección automática de escala: el workflow lee las dimensiones del vídeo de entrada y calcula la mayor salida que cabe en la tarjeta, redondeando a dimensiones pares.
- Procesamiento de vídeo de cualquier origen: vídeo generado por IA (MiniMax H3 y otros), anime, renderizado 3D y metraje real.
- Soporte de vídeo horizontal y vertical: incluye resoluciones verticales como 720x1280 y 1080x1920, con salidas hasta 2160x3840.
- Preservación de audio y tasa de fotogramas originales en el vídeo de salida.
- Procesamiento por lotes de 8 fotogramas con escritura incremental, apto para clips largos.
- Corrección de color opcional mediante el parámetro `color_fix` (modo `wavelet`).
- No incluye generación de texto, razonamiento, código, tool calling ni capacidades de agente; es exclusivamente un pipeline de vídeo.

## Casos de uso

- Restauración y ampliación de metraje de archivo: un clip de 720p puede convertirse en 4K en una tarjeta de 16 GB, útil para reutilizar material antiguo en producciones actuales sin reescalado manual.
- Postproducción de vídeo generado por IA: los clips de MiniMax H3 a 1248x704 pueden llevarse a 3744x2112 en 16 GB, lo que permite entregar piezas generativas a resolución de emisión.
- Contenido vertical para redes sociales: un vídeo 720x1280 se convierte en 2160x3840 en 16 GB, listo para publicarse en plataformas que exigen alta resolución en formato vertical.
- Limpieza de vídeo 1080p sin aumento de tamaño: en tarjetas de 8 GB, un 1080p se mantiene a 1920x1080 pero "limpiado", útil para reducir artefactos de compresión antes de subir a plataformas.
- Prototipado rápido en estaciones de trabajo modestas: con una RTX 3060 de 8 GB y el workflow de 8 GB, un clip de 5 segundos a 1376x768 se procesa en unos 49 segundos (medido en una 5070 Ti simulando 8 GB), lo que permite iterar en local sin GPU de datacenter.
- Ampliación de anime y material 3D: el modelo está entrenado para upscalear cualquier tipo de vídeo, incluidos renders 3D y animación, lo que lo hace útil en pipelines de animación y videojuegos.
- Preparación de material para proyección o masterizado: la salida 4K con audio y frame rate originales permite integrar el clip directamente en un timeline de edición sin conversiones adicionales.

## Benchmarks y rendimiento

El autor no publica benchmarks comparativos con métricas estándar (PSNR, SSIM, LPIPS). Sí documenta tiempos de ejecución medidos en una RTX 5070 Ti de 16 GB con 24 GB de RAM del sistema, simulando las configuraciones de 8 y 12 GB mediante un programa que reservaba el resto de la VRAM y limitando la memoria declarada a ComfyUI. En ambos tests se mantenían 2,4 GB de VRAM ocupados por el escritorio (navegador, Discord), por encima de un setup típico, sin errores de memoria.

| Version | Video de prueba | Salida | Tiempo |
|---|---|---|---|
| 8 GB | 1376x768 | 2064x1152 | clip de 5 s en 49 s |
| 12 GB | 1080x1920 (vertical) | 1890x3360 | clip de 5 s en 80 s |
| 16 GB | 720p | 3840x2160 (4K) | clip de 15 s en ~3 min |

El autor advierte que las tarjetas reales de 8 y 12 GB (RTX 4060, 3060, 4070) tienen chips más lentos que la 5070 Ti, por lo que los tiempos serán mayores; lo que se validó es el límite de memoria, no el rendimiento absoluto.

## Requisitos de hardware

- VRAM: 8 GB (salida hasta 1920x1080), 12 GB (hasta 2560x1440) o 16 GB (hasta 3840x2160).
- RAM del sistema: 16 GB mínimo para el workflow de 8 GB; 24 GB o más para 12 y 16 GB; 32 GB recomendado para 4K.
- Disco: aproximadamente 7 GB para los tres ficheros de modelo.
- GPU: NVIDIA RTX serie 20 o superior; serie 30 o superior para los kernels más rápidos. El autor cita RTX 4060, 3060 y 4070 como ejemplos de tarjetas reales de 8 y 12 GB.
- Cabe en GPU de consumo: sí, ese es precisamente el objetivo del repositorio (8, 12 y 16 GB).
- Despliegue: ComfyUI 0.44 o superior con el nodo personalizado ComfyUI-ReCaVSR, instalable vía ComfyUI Manager o clonando el repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vídeo.
- Latencia y throughput: según las mediciones del autor, 49 s para 5 s de vídeo en configuración de 8 GB, 80 s para 5 s en 12 GB y unos 3 min para 15 s en 4K con 16 GB (RTX 5070 Ti).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas directas en la información proporcionada. Como referencia estructural, ReCaVSR se presenta como un modelo de superresolución de vídeo de un solo paso basado en Wan 2.2, lo que lo sitúa en la categoría de upscalers generativos de vídeo basados en difusión. No obstante, el repositorio no incluye comparaciones con alternativas como Real-ESRGAN, BasicVSR++ ni otros upscalers de vídeo, ni datos de parámetros, contexto o rendimiento de esos modelos, por lo que no es posible elaborar una tabla comparativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ReCaVSR (este repo) | no disponible | no aplica | Apache 2.0 | pesos en HF (kopper/ReCaVSR, PedroMarinhoDev/ReCaVSR-ComfyUI) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio contiene únicamente los workflows JSON; los pesos del modelo se descargan de otros repositorios (PedroMarinhoDev/ReCaVSR-ComfyUI y kopper/ReCaVSR) y no están incluidos.
- Los workflows están calibrados para una VRAM concreta: usar el fichero de 8 GB en una tarjeta de 16 GB no aprovecha la memoria disponible, y usar el de 16 GB en una de 8 GB provocará errores de memoria.
- ReCaVSR trata cada clip como un plano único, por lo que pueden aparecer parpadeos breves tras cortes de escena duros; el autor recomienda upscalear cada plano como clip independiente.
- Puede producirse deriva de color respecto al original; se corrige cambiando `color_fix` a `wavelet` en el nodo ReCaVSR Upscale.
- En caso de falta de memoria, el autor sugiere usar el workflow de la tarjeta inmediatamente inferior.
- Se recomienda cerrar otras aplicaciones que usen la GPU (juegos, vista previa de OBS, vídeo en el navegador), especialmente en configuraciones de 8 GB.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas, ya que no es un modelo de lenguaje; tampoco se detallan restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- Los tiempos publicados se midieron en una RTX 5070 Ti; en tarjetas reales de 8 y 12 GB serán previsiblemente mayores.
- No hay información sobre el proceso de entrenamiento, el dataset ni las métricas de calidad del modelo ReCaVSR en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vyrekai/recavsr-video-upscale-comfyui-workflows
- Pesos int8 (PedroMarinhoDev/ReCaVSR-ComfyUI): https://huggingface.co/PedroMarinhoDev/ReCaVSR-ComfyUI/blob/main/recavsr/transformer_int8_convrot.safetensors
- Pesos prompt (kopper/ReCaVSR): https://huggingface.co/kopper/ReCaVSR/blob/main/prompt.safetensors
- Pesos flashdecoder (kopper/ReCaVSR): https://huggingface.co/kopper/ReCaVSR/blob/main/flashdecoder.safetensors
- Repositorio de pesos ReCaVSR: https://huggingface.co/kopper/ReCaVSR
- Nodo ComfyUI-ReCaVSR (GitHub): https://github.com/PedroMarinhoDev/ComfyUI-ReCaVSR
- Código de ReCaVSR (USTC): https://github.com/kopperx/ReCaVSR
- Página del proyecto ReCaVSR: https://kopperx.github.io/ReCaVSR/
- Canal de YouTube del autor de los workflows: https://www.youtube.com/@Vyrek_AI1
