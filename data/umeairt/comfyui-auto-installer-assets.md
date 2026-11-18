# UmeAiRT/ComfyUI-Auto-Installer-Assets

## Resumen

UmeAiRT/ComfyUI-Auto-Installer-Assets no es un modelo de IA en el sentido estricto, sino un repositorio de assets binarios (pesos, cuantizaciones y binarios auxiliares) que da soporte al ecosistema de herramientas de UmeAiRT para ComfyUI. El autor, UmeAiRT, lo mantiene como almacen de ficheros servidos via Git LFS, consumido por su instalador automatico para Windows (ComfyUI-Auto_installer) y por sus nodos personalizados (ComfyUI-UmeAiRT-Toolkit).

El repositorio agrupa pesos de modelos de difusion de terceros (FLUX, WAN 2.1/2.2, QWEN Image, HiDream, LTX-2, LTXV, Z-Image), text encoders (T5 XXL, umt5 XXL, GEMMA-3 12B, Qwen2.5-VL-7B, Qwen3-4B, LLAMA 3.1 8B), VAEs, ControlNets, LoRAs, upscalers y utilidades auxiliares, en multiples niveles de precision (bf16/fp16, fp8, GGUF Q8-Q3). Su relevancia practica es la de un espejo de descarga reproducible para instalaciones de ComfyUI que evita depender de decenas de repositorios dispersos.

El dato de "parametros totales" reportado por Hugging Face (2.091.068.928) corresponde a uno de los ficheros safetensors presentes en el repo, no a un modelo unico, ya que el repositorio contiene decenas de modelos distintos. El tamano total del repo es de aproximadamente 4.517,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de assets; contiene pesos de multiples arquitecturas: transformers de difusion, text encoders, VAEs, ControlNets) |
| Parametros totales | 2.091.068.928 (dato de un safetensors concreto del repo; el repositorio agrega modelos de 4B a 22B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo contenido; p. ej. text encoders T5 XXL, Qwen2.5-VL-7B, etc.) |
| Tipos de cuantizacion | bf16, fp16, fp8, fp8_scaled, fp8_e4m3fn, fp8_mixed, SVDQ-int4, GGUF Q8 a Q3 (Q8_0, Q6, Q5, Q4_K_S, Q3, IQ4_XS, UD-Q4, UD-Q8) |
| Idiomas soportados | no disponible |
| Licencia | MIT (del repositorio); los pesos subyacentes conservan la licencia de cada modelo original |
| Formato de pesos | safetensors, GGUF, ONNX, diffusers |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo propio: es un almacen de artefactos. Los pesos que contiene pertenecen a arquitecturas de difusion (FLUX 12B, WAN 2.1 14B, WAN 2.2 A14B, QWEN Image ~20B, HiDream 17B, LTX-2 19B/22B, LTXV 13B, Z-Image 12B), a text encoders (T5 XXL, umt5 XXL, GEMMA-3 12B, Qwen2.5-VL-7B, Qwen3-4B, LLAMA 3.1 8B) y a utilidades de vision (CLIP-L, CLIP-G, LongCLIP, SigCLIP, SAM, YOLO, Florence-2). Cada familia se distribuye en varios niveles de precision para ajustarse a distintos presupuestos de VRAM.

La innovacion tecnica del repositorio no reside en el entrenamiento sino en la logistica: empaquetado reproducible de cuantizaciones GGUF y fp8, convenciones de nombrado estables (CamelCase para GGUF, minusculas con guiones para safetensors), y distribucion via Git LFS junto con binarios (Git, Python, CUDA installers) y wheels precompilados. Esto permite que el instalador automatico reconstruya un entorno ComfyUI funcional sin intervencion manual. No se dispone de informacion sobre datasets, tokens de entrenamiento, RLHF o DPO, ya que el repositorio no entrena modelos.

## Capacidades

- Distribucion de pesos de modelos de generacion de imagen (FLUX Dev/Fill/Kontext/Canny/Depth/Schnell, QWEN Image/Edit/Distill, HiDream I1-Dev, Z-Image Standard/Turbo).
- Distribucion de pesos de modelos de generacion de video (WAN 2.1 T2V/I2V-480p/720p/VACE/Fun-InP/Control, WAN 2.2 T2V/I2V/InP/Control/Camera, LTX-2 19B y 2.3-22B, LTXV 0.9.8-Dev).
- Text encoders en multiples precisiones: T5 XXL, umt5 XXL, GEMMA-3 12B, Qwen2.5-VL-7B, Qwen3-4B, LLAMA 3.1 8B.
- Componentes auxiliares: VAE compartidos, ControlNets, LoRAs (FLUX, WAN, QWEN, LTX-2), upscalers (RealESRGAN y otros), style/Redux models.
- Vision auxiliar: SAM para segmentacion, YOLO para deteccion de caras y manos, Florence-2 PromptGen para generacion de prompts.
- Binarios y paquetes: instaladores de Git, Python y CUDA, wheels Python precompilados, zips de extensiones y herramientas de build.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step por si mismo: esas capacidades dependen de los modelos subyacentes que contiene (p. ej. Qwen2.5-VL-7B o Qwen3-4B), no del repositorio.

## Casos de uso

- Instalacion automatizada de ComfyUI en Windows: el instalador oficial descarga pesos y binarios directamente desde este repositorio, reduciendo el tiempo de puesta en marcha y evitando errores de dependencias entre decenas de fuentes distintas.
- Despliegue reproducible de pipelines de generacion de imagen: un equipo puede fijar versiones concretas de FLUX, QWEN Image o HiDream con la cuantizacion adecuada (fp8, Q8, Q4) segun la VRAM disponible, garantizando paridad entre entornos.
- Generacion de video local: los pesos de WAN 2.1/2.2, LTX-2 y LTXV permiten montar flujos T2V e I2V en ComfyUI sin depender de servicios en la nube, con variantes de precision para GPUs de 12-24 GB.
- Investigacion en cuantizacion: el repositorio ofrece la misma familia de modelos en bf16, fp16, fp8, SVDQ-int4 y GGUF Q8-Q3, lo que facilita estudios comparativos de calidad frente a VRAM y latencia.
- Integracion en nodos personalizados de ComfyUI: el Toolkit de UmeAiRT descarga automaticamente el modelo requerido al cargar un grafo, usando este repositorio como backend de assets.
- Creacion de entornos de formacion o demos: un taller puede preparar una maquina con ComfyUI y un conjunto curado de modelos (FLUX, QWEN, WAN) sin que los asistentes descarguen cientos de gigabytes manualmente.
- Archivado y espejo de pesos: util para organizaciones que necesitan una copia interna controlada de modelos populares con licencias permisivas y estructura homogenea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: depende del modelo y la cuantizacion elegidos. Como referencia, el repositorio ofrece variantes desde Q3 (adecuadas para GPUs de 8-12 GB) hasta bf16/fp16 (que requieren 24 GB o mas para modelos de 12B-22B).
- GPUs recomendadas: RTX 3060 12 GB / RTX 4060 Ti 16 GB para cuantizaciones GGUF Q4-Q8 de modelos de 12B; RTX 4090 24 GB para fp8 de FLUX, QWEN Image o WAN 2.1; A100/H100 40-80 GB para bf16 de modelos de 17B-22B (HiDream, WAN 2.2, LTX-2).
- Modelos de video (WAN 2.2 A14B, LTX-2 22B) requieren en la practica 24 GB o mas incluso en fp8 para resoluciones y duraciones razonables.
- Opciones de despliegue: ComfyUI (entorno nativo del repositorio), con soporte de safetensors via diffusers y de GGUF via nodos GGUF para ComfyUI. No esta pensado para vLLM, TGI ni llama.cpp, ya que no contiene un LLM principal.
- Latencia y throughput: no disponibles; dependen enteramente del modelo y hardware elegidos.
- Espacio en disco: el repositorio completo ocupa aproximadamente 4.517,7 GB; conviene descargar solo las familias y precisiones necesarias.

## Comparativa con modelos similares

| Repositorio / proyecto | Contenido | Licencia | Enfoque |
|---|---|---|---|
| UmeAiRT/ComfyUI-Auto-Installer-Assets | Pesos de FLUX, WAN, QWEN, HiDream, LTX, Z-Image, text encoders, VAEs, LoRAs, binarios | MIT (repo); pesos con licencia original | Almacen curado para instalador ComfyUI |
| Repositorios oficiales de cada modelo (black-forest-labs/FLUX.1-dev, Wan-AI/Wan2.1, Qwen/Qwen-Image, etc.) | Pesos oficiales en precision completa | Licencias especificas (a menudo no comerciales o con restricciones) | Fuente primaria, sin cuantizaciones GGUF |
| Repositorios de cuantizaciones comunitarias (city96, QuantStack, etc.) | GGUF y fp8 de modelos populares | Variable | Cuantizacion especializada por modelo |
| Comfy-Org (repositorios espejo de ComfyUI) | Pesos reorganizados para ComfyUI | Variable | Espejo oficial de ComfyUI |

La ventaja diferencial de este repositorio es la agregacion multi-familia con nomenclatura homogenea y binarios de instalacion incluidos; su desventaja es que no es fuente primaria y depende de la licencia de cada modelo subyacente.

## Limitaciones y advertencias

- No es un modelo entrenado: no debe citarse como modelo de IA ni evaluarse con benchmarks de LLM o de difusion.
- El dato "2.091.068.928 parametros" de Hugging Face corresponde a un unico safetensors, no al repositorio completo; usarlo como spec del repo es enganoso.
- La licencia MIT del repositorio no se extiende a los pesos subyacentes: FLUX.1-dev, por ejemplo, tiene licencia no comercial, y otros modelos pueden tener restricciones adicionales. Verificar la licencia de cada modelo antes de uso comercial.
- El repositorio pesa aproximadamente 4,5 TB; descargarlo completo no es viable en la mayoria de entornos. Descargar solo lo necesario.
- Dependencia de Git LFS y de la infraestructura de Hugging Face; no hay garantia de disponibilidad a largo plazo mas alla de la licencia MIT del codigo.
- Riesgo de desactualizacion: los modelos originales pueden publicar nuevas versiones con cambios incompatibles.
- No incluye informacion sobre sesgos, alucinacion o limitaciones linguisticas, ya que esas propiedades pertenecen a cada modelo contenido.
- Para produccion, conviene fijar commits concretos del repositorio y verificar checksums de los ficheros descargados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UmeAiRT/ComfyUI-Auto-Installer-Assets
- ModelScope espejo: https://www.modelscope.ai/datasets/UmeAiRT/ComfyUI-Auto-Installer-Assets
- Instalador automatico (GitLab): https://gitlab.com/UmeAiRT-Studio/ComfyUI-Auto_installer-Python
- Toolkit de nodos ComfyUI (GitLab): https://gitlab.com/UmeAiRT-Studio/ComfyUI-UmeAiRT-Toolkit
- Perfil del autor en Hugging Face: https://huggingface.co/UmeAiRT
- Especificacion GGUF: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
