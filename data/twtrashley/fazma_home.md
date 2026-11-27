# twtrashley/fazma_home

## Resumen

`twtrashley/fazma_home` no es un modelo de lenguaje en sentido estricto, sino un repositorio espejo ("mirror") que agrupa los artefactos auxiliares que necesita el conjunto de herramientas denominado Fazma. Segun la model card, el script `fazma_03/scripts/fazma_home.py fill` descarga e instala estos ficheros verificando su tamano y su hash sha256 contra un manifiesto `fazma_tools/home/spec.yaml`. El repositorio contiene copias sin modificar de modelos de terceros (checkpoints de difusion, VAEs, text encoders, LoRAs, modelos de segmentacion y reconstruccion 3D) junto con software empaquetado en `.tar` (ComfyUI y sus nodos personalizados, Blender, llama.cpp, Musubi Tuner, Brush, entre otros).

El unico componente con pesos en formato safetensors de gran tamano y con un recuento de parametros declarado (11.907.350.576 parametros, es decir, unos 11,9 mil millones) es el modelo de lenguaje `gemma-4-12b-it-qat-q4_0.gguf`, una cuantizacion QAT Q4_0 de Gemma 4 12B IT de Google, acompanada de su proyector multimodal (`mmproj-gemma-4-12b-it-qat-q4_0.gguf`). El resto del contenido son pesos de modelos generativos de imagen y video, herramientas de vision por computador y utilidades de renderizado.

Por tanto, este repositorio es relevante no como un modelo entrenado por su autor, sino como un paquete de distribucion reproducible para un entorno de generacion multimodal (imagen, video, 3D y texto) que combina piezas de Google, Black Forest Labs, Tencent, Alibaba, Meta, NVIDIA y otros. Su interes practico esta en la trazabilidad de licencias por fichero y en la verificacion criptografica de cada artefacto, algo poco habitual en repositorios de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio agregado; el componente de lenguaje es Gemma 4 12B IT (transformer denso, segun el nombre del checkpoint); el resto son modelos de difusion, VAEs, text encoders, segmentacion y reconstruccion 3D |
| Parametros totales | 11.907.350.576 (atribuibles al checkpoint Gemma 4 12B IT; el resto de componentes no declara recuento agregado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT) para el LLM; fp8 (scaled) para text encoders y modelos de difusion; Q4_K_M (GGUF) para Wan2.1-I2V-14B; bf16 y fp16 para otros checkpoints; safetensors y GGUF como contenedores |
| Idiomas soportados | no disponibles (no se declaran en la model card) |
| Licencia | per-file (`license: other`); cada componente conserva la licencia de su autor, con textos en `LICENSES/` |
| Formato de pesos | safetensors, GGUF, `.pt`, `.pth`, `.tar` (software) |

## Arquitectura y entrenamiento

El repositorio no documenta ningun entrenamiento propio: es un espejo de artefactos de terceros. El componente linguistico es `gemma-4-12b-it-qat-q4_0.gguf`, una version cuantizada en Q4_0 mediante Quantization-Aware Training del modelo Gemma 4 12B IT de Google, con licencia Apache-2.0 segun la tabla de la model card. Junto a el se incluye `mmproj-gemma-4-12b-it-qat-q4_0.gguf`, el proyector multimodal que habilita entrada de imagen en llama.cpp.

El resto de la pila cubre generacion y procesamiento visual: FLUX.2 klein base 4B en fp8 (Apache-2.0), Krea 2 Turbo en fp8 con text encoder Qwen3-VL 4B (licencia comunitaria de Krea 2), Wan2.1 I2V 14B 720p en GGUF Q4_K_M (Apache-2.0), Z-Image en bf16 con su VAE y text encoder Qwen 3 4B, SAM 3.1 multiplex en fp16 (licencia SAM de Meta), BiRefNet para eliminacion de fondo (MIT), MoGe ViT-L para geometria monocula (MIT) y Pixal3D de TencentARC para reconstruccion imagen-a-forma con un DiT de 1,3B (MIT). Se incluyen ademas LoRAs especificos (HDR, panorama 360 ERP, destilacion de pasos para video) y un upscaler 4x-UltraSharp bajo CC BY-NC-SA 4.0.

La innovacion tecnica del paquete es operativa, no de modelado: un manifiesto YAML con tamano y sha256 por fichero, separacion explicita de licencias por componente, y delegacion de la instalacion de componentes con licencia restrictiva o con acceso condicionado (CUDA de NVIDIA via pip, FLUX 3 klein y RMBG-2.0 como modelos con gating) al momento de la ejecucion por parte del usuario.

## Capacidades

- Generacion de texto conversacional e instrucciones mediante Gemma 4 12B IT cuantizado en Q4_0, ejecutable con llama.cpp.
- Entrada multimodal de imagen en el LLM a traves del proyector `mmproj` de Gemma 4.
- Generacion texto-a-imagen con FLUX.2 klein 4B, Krea 2 Turbo y Z-Image.
- Generacion imagen-a-video con Wan2.1 I2V 14B 720p, con LoRAs de destilacion de pasos y de panorama 360.
- Edicion y outpainting panoramico equirectangular mediante LoRAs especificos de Krea 2.
- Segmentacion de imagen con SAM 3.1 multiplex y eliminacion de fondo con BiRefNet.
- Estimacion de geometria y profundidad monocula con MoGe ViT-L.
- Reconstruccion 3D imagen-a-forma con Pixal3D (DiT de 1,3B, resoluciones 512 y 1024).
- Reescalado de imagen 4x con 4x-UltraSharp.
- Tool calling, function calling, modo thinking o soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Pipeline de generacion de imagen en produccion: usar FLUX.2 klein 4B fp8 o Z-Image bf16 dentro de ComfyUI para sintesis texto-a-imagen, aprovechando que el repositorio ya incluye los VAEs y text encoders correspondientes y evita resolver dependencias a mano.
- Generacion de video corto a partir de una imagen: Wan2.1 I2V 14B en Q4_K_M permite ejecutar imagen-a-video en 720p con un consumo de VRAM contenido por la cuantizacion, y los LoRAs de destilacion de pasos reducen el numero de iteraciones necesarias.
- Creacion de contenido panoramico 360: los LoRAs `krea2_t2i_360_erp_lora_v1` y `krea2_oedit_360_erp_outpaint_lora_v1` sobre Krea 2 Turbo permiten generar y extender imagenes equirectangulares para visores VR o mapas de entorno.
- Reconstruccion 3D de objetos a partir de una foto: Pixal3D con sus checkpoints de 512 y 1024 permite obtener una forma 3D aproximada para prototipado, previsualizacion o asset basico en pipelines de contenido.
- Automatizacion de postproduccion: combinar BiRefNet para recorte de sujeto, MoGe para profundidad y 4x-UltraSharp para reescalado en un flujo ComfyUI unico, reduciendo el numero de herramientas externas.
- Asistente conversacional con entrada de imagen en local: Gemma 4 12B IT Q4_0 con su `mmproj` se puede servir con llama.cpp para tareas de descripcion de imagenes, resumen de documentos escaneados o respuesta a preguntas sobre capturas, sin depender de APIs externas.
- Reproducibilidad de entornos de investigacion: el manifiesto con sha256 por fichero permite reconstruir exactamente el mismo conjunto de pesos y versiones de software en otra maquina, algo util para replicar experimentos de generacion multimodal.
- Auditoria de licencias: la separacion por fichero con textos en `LICENSES/` facilita identificar que componentes son incompatibles con uso comercial (4x-UltraSharp, nvdiffrast, nvdiffrec) antes de desplegar el paquete en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el LLM: Gemma 4 12B IT en Q4_0 ocupa aproximadamente 7-8 GB de pesos, mas el proyector multimodal; con cache KV para contexto moderado, el consumo tipico se situa en torno a 9-12 GB, aunque no se dispone de mediciones oficiales en la informacion proporcionada.
- VRAM para difusion: FLUX.2 klein 4B en fp8 y Krea 2 Turbo en fp8 requieren varios GB adicionales por los text encoders (Qwen3-VL 4B fp8, Qwen 3 4B) y los VAEs; Wan2.1 I2V 14B en Q4_K_M es el componente mas exigente y en la practica necesita GPU de 24 GB o mas para 720p, sin cifras oficiales confirmadas.
- GPU recomendadas: no disponibles de forma explicita; por el perfil de los componentes, se espera que A100, H100 o RTX 4090 sean adecuadas para los flujos completos, y que GPU consumer de 12-16 GB puedan ejecutar el LLM y los modelos de imagen por separado.
- Cabe en GPU consumer: el LLM cuantizado Q4_0 y los modelos de imagen en fp8 son candidatos razonables para GPU de 12-24 GB; el modelo de video de 14B es el limite practico.
- Opciones de despliegue: llama.cpp (incluido en el paquete) para el LLM en GGUF; ComfyUI (incluido) para los flujos de difusion, video, segmentacion y 3D; Blender y Musubi Tuner para renderizado y ajuste; NVIDIA CUDA runtime se instala desde los wheels oficiales de pip.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fazma_home (este repo) | 11,9B (LLM) + agregado de difusion/3D | no disponible | per-file (mixta) | Hugging Face, 0 descargas, 0 likes | Paquete reproducible con verificacion sha256 |
| google/gemma-4-12B-it (origen del LLM) | 12B | no disponible | Apache-2.0 | Hugging Face (Google) | Modelo original sin cuantizar; el repo incluye la variante QAT Q4_0 |
| black-forest-labs/FLUX.2-klein-base-4b-fp8 | 4B | no disponible | Apache-2.0 | Hugging Face (BFL) | Incluido como componente de imagen |
| TencentARC/Pixal3D | 1,3B (DiT) | no disponible | MIT | Hugging Face (TencentARC) | Incluido como componente de reconstruccion 3D |

La comparativa directa con un unico modelo alternativo no es posible porque el repositorio agrega varios modelos de categorias distintas; la tabla recoge los origenes mas relevantes de sus componentes.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier evaluacion de calidad debe hacerse sobre los modelos originales (Gemma 4, FLUX.2, Krea 2, Wan2.1, Pixal3D), no sobre este espejo.
- Ausencia total de benchmarks, ficha de idiomas y contexto declarado: no hay datos para estimar rendimiento en produccion.
- Licencia mixta por fichero: 4x-UltraSharp es CC BY-NC-SA 4.0 (no comercial, atribucion y share-alike), y nvdiffrast/nvdiffrec en `pixal3d/wheels.tar` estan bajo NVIDIA Source Code License limitada a investigacion o evaluacion. Un despliegue comercial del paquete completo es inviable sin sustituir esos componentes.
- Krea 2 y sus LoRAs estan bajo la Krea 2 Community License, con condiciones propias recogidas en su NOTICE; no equivale a una licencia open source permisiva.
- Componentes con gating (FLUX 3 klein, RMBG-2.0) no estan incluidos y requieren aceptar la licencia del autor original; el script `fill` los descarga en tiempo de instalacion.
- El repositorio pesa 105,7 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga y verificacion.
- Riesgo de dependencia de versiones: los `.tar` de ComfyUI y nodos personalizados fijan versiones concretas, lo que puede dificultar actualizaciones de seguridad o compatibilidad con GPU nuevas.
- No hay informacion sobre sesgos, alucinacion o limitaciones linguisticas del LLM mas alla de lo que publique Google para Gemma 4 12B IT; deben consultarse en la ficha del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa del paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/twtrashley/fazma_home
- Gemma 4 12B IT (origen del LLM): https://huggingface.co/google/gemma-4-12B-it
- FLUX.2 klein base 4B fp8: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4b-fp8
- FLUX.2 small decoder (VAE): https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Krea 2 (Comfy-Org): https://huggingface.co/Comfy-Org/Krea-2
- Wan 2.1 ComfyUI repackaged: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Wan2.1-I2V-14B-720P GGUF: https://huggingface.co/city96/Wan2.1-I2V-14B-720P-gguf
- Z-Image (Comfy-Org): https://huggingface.co/Comfy-Org/z_image
- SAM 3 (Comfy-Org): https://huggingface.co/Comfy-Org/sam3
- BiRefNet (Comfy-Org): https://huggingface.co/Comfy-Org/BiRefNet
- MoGe ViT-L: https://huggingface.co/Ruicheng/moge-vitl
- Pixal3D (TencentARC): https://huggingface.co/TencentARC/Pixal3D
- 4x-UltraSharp: https://huggingface.co/Kim2091/UltraSharp
- LoRAs HDR LumiPic: https://huggingface.co/oumoumad/LumiPic
- LoRAs panorama 360 Krea 2: https://huggingface.co/mickmumpitz/Krea2-360-ERP-LoRAs
- LoRA panorama Wan2.1: https://huggingface.co/mickmumpitz/Wan2.1-Pano360-LoRA
- LoRAs de video Kijai: https://huggingface.co/Kijai/WanVideo_comfy
