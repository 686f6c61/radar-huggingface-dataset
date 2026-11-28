# visualbruno/Direct3D-FP8

## Resumen

Direct3D-FP8 es la versión en precisión FP8 del modelo Direct3D-V3, un sistema de generación de mallas 3D a partir de una imagen de referencia desarrollado por investigadores de la Universidad de Nanjing, DreamTech, la Universidad de Hong Kong y la Universidad de Oxford. El modelo se presenta en ACM Transactions on Graphics (SIGGRAPH Asia 2026) y aborda la síntesis image-to-3D mediante diffusion transformers que operan directamente sobre rejillas de vóxeles SDF, prescindiendo del codificador VAE que introduce cuellos de botella en los pipelines de difusión latente convencionales.

La propuesta técnica central es la eliminación del espacio latente: el modelo difunde sobre el dominio nativo de vóxeles, lo que según el autor permite una mayor fidelidad en el detalle de superficie. La generación se organiza en cascada con etapas a resoluciones de 512, 1024 y 1536, y se apoya en un generador de malla gruesa previo (VecShape) que condiciona el proceso. El acondicionamiento de imagen combina características de cuatro capas de DINOv3.

El repositorio publicado corresponde a un checkpoint cuantizado en FP8 (3,8 GB), orientado a inferencia, con licencia MIT. No se proporcionan datos sobre número de parámetros, longitud de contexto ni benchmarks en la información disponible, por lo que buena parte de las especificaciones cuantitativas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) sobre vóxeles SDF nativos, sin VAE (latent-free), en cascada multi-etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | FP8 (checkpoint publicado); se desconoce si existen otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Direct3D-V3 emplea diffusion transformers que modelan directamente rejillas de vóxeles SDF en bruto, evitando el paso por un espacio latente comprimido. La inferencia se ejecuta como una cascada de denoisers a tres resoluciones (512, 1024 y 1536), donde cada etapa refina la salida de la anterior; a resolución 1024 se ejecutan las etapas 512 y 1024, y la etapa 1536 es opcional. El acondicionamiento de imagen utiliza características combinadas de cuatro capas de DINOv3, y el modelo acepta una malla gruesa (generada por VecShape o aportada por el usuario en OBJ, GLB o PLY) como condición geométrica.

Según la model card, el checkpoint liberado genera mallas con un detalle de superficie sustancialmente más fino que la versión evaluada en el paper, y el entrenamiento adoptó el optimizador Muon, lo que aceleró la convergencia y mejoró la calidad de las mallas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en este tipo de modelos generativos 3D).

## Capacidades

- Generación image-to-3D: produce mallas 3D de alta fidelidad a partir de una imagen de referencia.
- Difusión en dominio de vóxeles nativo, sin cuello de botella VAE.
- Generación en cascada con resoluciones de 512, 1024 y 1536.
- Acondicionamiento geométrico mediante malla gruesa (VecShape o malla propia del usuario).
- Aceptación de mapas de normales de superficie o imágenes "white clay" como referencia para mayor detalle geométrico.
- Refinamiento de mallas existentes al pasar un OBJ, GLB o PLY alineado con la imagen.
- Integración con el generador de malla gruesa VecShape (Stage 1) publicado por los mismos autores.
- No se documentan capacidades de tool calling, agentes, texto, visión general, audio ni modo "thinking"; es un modelo especializado exclusivamente en geometría 3D.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de un concept art o render de referencia se obtiene una malla base que el artista puede retocar, reduciendo el tiempo de modelado inicial.
- Reconstrucción de productos para comercio electrónico: generar mallas 3D de artículos a partir de fotografías para visores web o configuradores, usando mapas de normales para capturar detalles finos.
- Refinamiento de mallas escaneadas: pasar una malla gruesa propia (OBJ/GLB/PLY) junto con la imagen de referencia para que el modelo añada detalle de superficie, útil en pipelines de fotogrametría.
- Diseño industrial y arquitectura: obtener maquetas volumétricas a partir de bocetos o renders para iteración temprana de formas antes del modelado CAD.
- Investigación en generación 3D: servir como baseline reproducible (licencia MIT, pesos abiertos) para experimentar con difusión sin VAE en dominio de vóxeles.
- Creación de contenido para animación y VFX: generar variaciones de una misma forma a partir de distintas referencias para poblar escenas o previsualizaciones.
- Docencia y demos interactivas: el repositorio incluye una demo Gradio (app.py) que permite desplegar el pipeline completo con VecShape para demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con métricas como Chamfer Distance, F-Score, CLIP-score ni comparaciones cuantitativas frente a otros modelos image-to-3D.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint FP8 ocupa 3,8 GB en disco, pero la cascada de tres denoisers se carga simultáneamente en GPU (`.to("cuda")`), por lo que el consumo real de VRAM excede el tamaño de los pesos.
- GPU recomendadas: no especificadas por el autor; por el uso de FlashAttention 2 y extensiones CUDA compiladas, se requiere una GPU NVIDIA con soporte para CUDA 13.0.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Entorno de software: Python 3.12, PyTorch 2.14.1, CUDA 13.0, compilador C++20, FlashAttention 2 (commit específico) y extensiones de voxelización y relleno de huecos compiladas desde `third_party`.
- Opciones de despliegue: script `infer.py` para CLI y `app.py` (Gradio 6.32.0) para demo interactiva; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos cuantitativos (parámetros, contexto, rendimiento) de Direct3D-FP8 ni de alternativas comparables, por lo que no es posible establecer una comparativa numérica rigurosa. Como referencia cualitativa, la propuesta se diferencia de los pipelines de difusión latente image-to-3D convencionales por operar en el dominio nativo de vóxeles SDF y por publicarse con licencia MIT y pesos abiertos, lo que facilita su reutilización frente a modelos con licencias más restrictivas. Cualquier comparación de rendimiento queda pendiente de los benchmarks del paper.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación en la información disponible, lo que impide verificar cuantitativamente la calidad frente a alternativas.
- El modelo depende de un generador de malla gruesa externo (VecShape) cuando no se aporta una malla propia; la calidad del resultado está condicionada por esa etapa.
- La recomendación de preprocesar la imagen con herramientas externas (mapas de normales vía ChatGPT/GPT Image 2.5 o Lotus-2) implica dependencias de terceros y posibles sesgos en el acondicionamiento.
- No se documentan sesgos conocidos ni tasas de alucinación geométrica; en generación 3D es esperable que aparezcan artefactos en superficies oclusas o estructuras finas no visibles en la referencia.
- No hay información sobre idiomas ni sobre rendimiento multilingüe (no aplica directamente, pero tampoco se documenta).
- La licencia MIT permite uso comercial, pero conviene revisar las licencias de las dependencias (DINOv3, VecShape, FlashAttention) antes de un despliegue en producción.
- El stack requiere CUDA 13.0, PyTorch 2.14.1 y compilación de extensiones con C++20, lo que puede complicar el despliegue en entornos con versiones anteriores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del checkpoint FP8.

## Enlaces

- Hugging Face: https://huggingface.co/visualbruno/Direct3D-FP8
- Repositorio de pesos de referencia: https://huggingface.co/wushuang98/Direct3D-V3
- Generador de malla gruesa VecShape (HF): https://huggingface.co/wushuang98/VecShape
- Demo en Spaces: https://huggingface.co/spaces/wushuang98/Direct3D-V3
- Página del proyecto: https://dreamtechai.github.io/Direct3D-V3
- GitHub: https://github.com/DreamTechAI/Direct3D-V3
- Repositorio VecShape: https://github.com/DreamTechAI/VecShape
- Paper (ACM DL): https://dl.acm.org/doi/10.1145/3842524
- arXiv: https://arxiv.org/abs/2611.26511
- Lotus-2 (predicción de mapas de normales): https://github.com/EnVision-Research/Lotus-2
