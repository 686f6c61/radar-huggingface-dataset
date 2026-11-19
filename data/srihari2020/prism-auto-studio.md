# Srihari2020/prism-auto-studio

## Resumen

Prism Auto Studio es un paquete de inferencia y una interfaz de usuario local para generación de imágenes texto-a-imagen, publicado por el usuario Srihari2020 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una aplicación autocontenida construida con Diffusers y Streamlit que empaqueta dos modelos SDXL de terceros y enruta automáticamente cada prompt hacia el motor más adecuado: RealVisXL V5.0 Lightning para fotorrealismo y Animagine XL 3.1 para anime 2D.

El valor diferencial del repositorio no está en los pesos (que son finetunes públicos de Stable Diffusion XL) sino en la capa de orquestación: detección del dominio del prompt, limpieza de muletillas conversacionales, mapeo de personajes de anime a etiquetas Danbooru, selección automática de relación de aspecto y un pase de detalle Hires Fix a 1,5x siempre activo. Todo ello optimizado para ejecutarse en GPUs con 8 GB de VRAM mediante `bfloat16`, `enable_model_cpu_offload()`, VAE tiling y liberación de caché CUDA al cambiar de motor.

Es relevante para desarrolladores que quieran un estudio de generación de imágenes local sin configuración, con dos estilos cubiertos y requisitos de hardware modestos. El repositorio ocupa 20,8 GB e incluye ambos conjuntos de pesos SDXL, lo que explica su tamaño. No hay información sobre idiomas soportados más allá del inglés implícito en los prompts de Danbooru y los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (Stable Diffusion XL, UNet + VAE + doble text encoder CLIP) |
| Parametros totales | no disponible (dos modelos SDXL empaquetados; el tamaño del repo es 20,8 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto; sin límite documentado, sujeto al tokenizador CLIP de SDXL) |
| Tipos de cuantizacion | `bfloat16` en inferencia; no se documentan GGUF, FP8 ni otras cuantizaciones |
| Idiomas soportados | no disponible (prompts en inglés por defecto; etiquetas Danbooru en inglés) |
| Licencia | MIT para el código de la aplicación; los pesos base conservan sus licencias upstream |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Se compone de dos pipelines de difusión SDXL empaquetados: RealVisXL V5.0 Lightning (finetune fotorrealista de SDXL, destilado para pocos pasos) y Animagine XL 3.1 (finetune orientado a anime 2D con vocabulario Danbooru). La aplicación actúa como orquestador: clasifica el prompt por dominio, aplica preprocesado de texto, selecciona el pipeline y ejecuta la generación con parámetros fijos por motor.

Los parámetros de muestreo están predefinidos por motor. Para fotorrealismo: 10 pasos, CFG 2.2, sampler SDE DPM-Solver++ Karras. Para anime: 22 pasos, CFG 6.5, sampler Euler Ancestral. Tras la generación se ejecuta siempre un segundo pase `img2img` con `strength=0.28` a 1,5x de resolución (Hires Fix) para afinar rostros, manos y texturas. La optimización de memoria combina `bfloat16`, offload de modelo a CPU, VAE tiling y limpieza de caché CUDA al alternar motores, lo que permite operar en 8 GB de VRAM.

No se documentan datos de entrenamiento propios, composición de dataset, ni etapas de RLHF/DPO, ya que el autor no entrena pesos. La innovación técnica es de ingeniería de inferencia: enrutado dual automático, normalización de prompts y mapeo de personajes a tags Danbooru.

## Capacidades

- Generación de imágenes texto-a-imagen en dos dominios: fotorrealismo y anime 2D.
- Enrutado automático del prompt al motor adecuado sin intervención del usuario.
- Limpieza de prompts: elimina frases conversacionales y muletillas antes de la inferencia.
- Mapeo de personajes de anime populares a sus etiquetas Danbooru exactas para mejorar el parecido.
- Selección automática de relación de aspecto según el prompt.
- Pase de detalle Hires Fix a 1,5x siempre activo (`img2img`, `strength=0.28`).
- Interfaz Streamlit mínima: escribir prompt, generar y descargar la imagen.
- Optimización para 8 GB de VRAM con offload de CPU y VAE tiling.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No soporta visión, audio ni modo thinking.

## Casos de uso

- Estudio de generación de imágenes local sin configuración: el usuario clona el repo, instala dependencias y ejecuta `streamlit run app.py`; el enrutado automático evita tener que elegir modelo o sampler manualmente.
- Prototipado rápido de arte conceptual en dos estilos: un equipo de diseño puede alternar entre fotorrealismo y anime escribiendo prompts en la misma interfaz, sin cambiar de pipeline ni de parámetros.
- Generación de retratos fotorrealistas en hardware de consumo: con 10 pasos y CFG 2.2 sobre RealVisXL Lightning, cabe en una RTX 5060 de 8 GB y produce imágenes listas para revisión en segundos.
- Ilustración de personajes de anime con fidelidad a franquicias: el mapeo a tags Danbooru permite obtener personajes reconocibles sin que el usuario conozca el vocabulario técnico de etiquetado.
- Creación de assets para proyectos personales o demos: la licencia MIT del código y el uso local facilitan integrar la generación en flujos privados sin depender de APIs de pago.
- Pruebas de concepto de pipelines de difusión: sirve como base para experimentar con enrutado por dominio, Hires Fix y gestión de memoria en GPUs pequeñas, modificando el código de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: 8 GB o más (probado en RTX 5060 de 8 GB según la model card).
- RAM del sistema: 16 GB o más recomendados para el offload de CPU.
- Almacenamiento: unos 15 GB libres para los dos modelos SDXL empaquetados (el repo completo ocupa 20,8 GB).
- GPU recomendadas: cualquier NVIDIA con 8 GB+ de VRAM; RTX 5060, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100 funcionarían con mayor margen, aunque no se documentan pruebas en todas ellas.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM.
- Despliegue: Streamlit como interfaz; internamente usa Diffusers con `enable_model_cpu_offload()`, VAE tiling y `bfloat16`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión).
- Latencia y throughput: no disponibles de forma numérica; la model card solo indica que está optimizado para 8 GB de VRAM.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prism Auto Studio | Paquete de inferencia + UI sobre dos SDXL | no disponible (dos SDXL, 20,8 GB de repo) | no disponible | MIT (código); pesos upstream | Hugging Face, 0 descargas |
| RealVisXL V5.0 Lightning | Modelo SDXL fotorrealista | no disponible | no disponible | según upstream (no disponible en la información) | Hugging Face, público |
| Animagine XL 3.1 | Modelo SDXL anime | no disponible | no disponible | según upstream (no disponible en la información) | Hugging Face, público |
| Stable Diffusion XL base | Modelo de difusión generalista | no disponible | no disponible | CreativeML Open RAIL++-M (no confirmado en la información) | Hugging Face, público |

Prism Auto Studio no compite en calidad de generación con los modelos base, sino en ergonomía: combina dos motores y automatiza el enrutado y el postprocesado. Frente a usar RealVisXL o Animagine por separado, ofrece cobertura de dos dominios en una sola interfaz, a costa de un repositorio más pesado y de menor control granular sobre los parámetros.

## Limitaciones y advertencias

- No es un modelo entrenado: la calidad final depende enteramente de RealVisXL V5.0 Lightning y Animagine XL 3.1; el autor no aporta pesos nuevos.
- El enrutado automático por dominio puede clasificar mal prompts ambiguos o híbridos (por ejemplo, anime fotorrealista), enviándolos al motor equivocado.
- El mapeo de personajes a tags Danbooru está limitado a los personajes incluidos en la aplicación; personajes no mapeados perderán fidelidad.
- El pase Hires Fix siempre activo aumenta el tiempo de inferencia y no es configurable según la model card; puede no ser deseable para todos los casos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de robustez en producción.
- Riesgo de sesgos y alucinaciones visuales heredado de los modelos base (sesgos demográficos, anatomía incorrecta, texto ilegible en imágenes).
- La licencia MIT cubre el código de la aplicación, pero los pesos base conservan sus licencias upstream; es responsabilidad del usuario verificar las condiciones de uso comercial de RealVisXL V5.0 Lightning y Animagine XL 3.1.
- Sin información sobre idiomas soportados más allá del inglés implícito en los prompts y etiquetas Danbooru.
- Requiere GPU NVIDIA; no se documenta soporte para CPU, AMD, Apple Silicon ni otros aceleradores.
- Fechas de creación y actualización del repositorio (2026) posteriores a la información habitual de modelos públicos; verificar la vigencia del contenido antes de usarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Srihari2020/prism-auto-studio
- Modelo base fotorrealista: https://huggingface.co/SG161222/RealVisXL_V5.0_Lightning
- Modelo base anime: https://huggingface.co/cagliostrolab/animagine-xl-3.1
