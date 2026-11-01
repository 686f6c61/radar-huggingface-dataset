# thomasdaniel87/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1 Uncensored Quantized es una colección de cuantizaciones del modelo de generación de imágenes por texto Qwen-Image-2.1, desarrollado originalmente por el equipo de Qwen (Alibaba) y cuantizado por el usuario thomasdaniel87 para su despliegue local. El repositorio empaqueta los pesos del modelo base en formatos GGUF, safetensors y MLX, con versiones "uncensored" (sin las restricciones de seguridad del modelo original) y versiones de base, y añade además los ficheros complementarios necesarios para su uso: el codificador de texto Qwen3-VL 8B y el VAE del modelo.

El objetivo del repositorio es resolver el problema habitual de los modelos de difusión de gran tamaño: que solo puedan ejecutarse en hardware de gama alta. Gracias a las cuantizaciones de 4 bits (Q4_K_M, Q4_0, NVFP4, MLX 4-bit), el transformer de difusión puede reducirse desde los 14,23 GB en BF16 hasta unos 4,15 GB, haciéndolo viable en GPUs de consumo y en Apple Silicon. La relevancia de esta ficha radica en que Qwen-Image-2.1 es uno de los modelos de texto a imagen abiertos más recientes, y estas cuantizaciones permiten integrarlo en flujos de trabajo locales con ComfyUI.

Cabe destacar que el modelo base tiene 7.115.124.736 parámetros (7,1 mil millones), y que el repositorio completo pesa 105,2 GB al incluir todas las cuantizaciones, los codificadores de texto y el VAE. La licencia es "qwen-research", una licencia no estándar que impone restricciones importantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto a imagen (arquitectura detallada no disponible) |
| Parametros totales | 7.115.124.736 (7,1 B, transformer de difusión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0, BF16; safetensors: FP8, INT8 ConvRot, NVFP4; MLX: 4-bit, 6-bit, 8-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (other) |
| Formato de pesos | GGUF, safetensors, MLX |

## Arquitectura y entrenamiento

El modelo base, Qwen-Image-2.1, es un modelo de difusión para generación de imágenes a partir de texto. Según la model card del repositorio, utiliza como codificador de texto Qwen3-VL 8B, un modelo multimodal de la familia Qwen, lo que sugiere una comprensión semántica avanzada de los prompts, y un VAE propio (qwen_image_2.1_vae_bf16, 676 MB) para la compresión del espacio latente. La arquitectura exacta del transformer de difusión (flujo, tipo de atención, resolución nativa) no está detallada en la información disponible.

Sobre el entrenamiento del modelo base no se aportan datos concretos en el repositorio (número de tokens o imágenes, composición del dataset, uso de RLHF o técnicas de alineación). Las cuantizaciones incluidas no modifican los pesos originales: son conversiones post-entrenamiento del modelo upstream Qwen/Qwen-Image-2.1. La variante "uncensored" indica que se han retirado o eludido los filtros de seguridad del modelo original, algo que el usuario debe valorar con responsabilidad. La cuantización INT8 ConvRot (rotaciones convolucionales para reducir errores de cuantización) y el formato NVFP4 (4 bits nativo de NVIDIA) son las opciones técnicas más destacables para GPUs compatibles.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) con pesos de alta fidelidad en BF16
- Comprensión avanzada de prompts gracias al codificador de texto Qwen3-VL 8B (multimodal)
- Ejecución local en GPUs NVIDIA (GGUF, FP8, INT8, NVFP4) y en Apple Silicon (MLX 4/6/8-bit)
- Integración directa con ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet con soporte nativo de Qwen-Image 2.1)
- Variante "uncensored" sin los filtros de seguridad del modelo original
- Elección entre múltiples niveles de cuantización para ajustar calidad frente a consumo de memoria

## Casos de uso

- Generación de imágenes en GPUs de consumo: con la cuantización Q4_K_M (4,60 GB) el transformer cabe en GPUs con 8-12 GB de VRAM, permitiendo flujos creativos locales sin depender de la nube.
- Flujos de trabajo en ComfyUI: todos los ficheros necesarios (transformer, codificador de texto, VAE) están empaquetados en el repositorio con la estructura de directorios estándar de ComfyUI, lo que simplifica la instalación.
- Producción en Apple Silicon: las versiones MLX de 4 y 6 bits están optimizadas para Mac, útiles para ilustradores y diseñadores que trabajan en portátiles Apple.
- Prototipado rápido de prompts: las cuantizaciones ligeras (Q4_0, NVFP4) permiten iterar composiciones rápidamente antes de regenerar en BF16 para la versión final.
- Investigación en cuantización de modelos de difusión: el repositorio ofrece el mismo modelo en diez formatos distintos, útil para comparar degradación de calidad entre esquemas de cuantización.
- Generación de imágenes sin filtros para investigación de seguridad: la variante uncensored puede emplearse para auditar y estudiar los mecanismos de alineación de modelos de difusión, siempre en entornos controlados.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmark del modelo base (assets/Qwen-Image-2.1-Benchmark.png), pero no se proporcionan los valores numéricos en formato texto en la información disponible, por lo que no es posible reproducirlos aquí. No se han publicado resultados de benchmarks comparativos en la información disponible.

## Requisitos de hardware

- Transformer de difusión (solo el modelo): desde 4,15 GB (Q4_0) hasta 14,23 GB (BF16). El codificador de texto Qwen3-VL 8B en BF16 añade 17,53 GB, aunque la versión INT8 ConvRot lo reduce a 9,35 GB. El VAE ocupa 676 MB.
- VRAM total estimada: con Q4_K_M + codificador INT8 + VAE, unos 15 GB; en BF16 completo, más de 32 GB. Para GPUs de 16 GB se recomienda cuantización agresiva del transformer y del codificador.
- GPUs recomendadas: RTX 4090 o RTX 5090 para las variantes FP8, INT8 ConvRot y NVFP4 (estas dos últimas requieren GPUs compatibles); RTX 3060/4060 con 12-16 GB pueden ejecutar las variantes GGUF Q4; Apple Silicon (M1/M2/M3/M4) para las variantes MLX.
- Sí cabe en GPU de consumo: con Q4_0 o Q4_K_M y el codificador de texto INT8, es viable en GPUs de 12-16 GB de VRAM.
- Despliegue: ComfyUI con el nodo ComfyUI-GGUF (fork de leejet con soporte nativo de Qwen-Image 2.1). No se menciona soporte para vLLM, llama.cpp standalone, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formatos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1 (base) | 7,1 B | safetensors | no disponible | qwen-research | HuggingFace (Qwen/Qwen-Image-2.1) |
| Qwen-Image-2.1 Uncensored Quantized | 7,1 B | GGUF, safetensors, MLX | no disponible | qwen-research | HuggingFace (este repo) |
| FLUX.1-dev | 12 B | safetensors, GGUF | no disponible | licencia no comercial (FLUX.1-dev Community) | HuggingFace (black-forest-labs) |
| Stable Diffusion 3.5 Large | 8 B | safetensors, GGUF | no disponible | Stability AI Community License | HuggingFace (stabilityai) |

Nota: las cifras de FLUX.1-dev y SD 3.5 Large corresponden a conocimiento general de estos modelos; no proceden de la información del repositorio analizado.

## Limitaciones y advertencias

- Licencia "qwen-research": no es una licencia abierta estándar; restringe probablemente el uso comercial. Debe revisarse el texto completo de la licencia antes de cualquier despliegue en producción.
- Variante "uncensored": al eliminar los filtros de seguridad del modelo original, puede generar contenido ofensivo, ilegal o dañino. El usuario asume toda la responsabilidad legal y ética de las imágenes generadas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede producir artefactos, anatomías incorrectas, texto ilegible en imágenes y fallos de fidelidad al prompt, especialmente en cuantizaciones agresivas (Q4_0, MLX 4-bit).
- Degradación por cuantización: las versiones de 4 bits pueden perder detalle fino y coherencia respecto a BF16; se recomienda Q4_K_M como mínimo para trabajo serio y BF16 para el resultado final.
- Los enlaces de la model card apuntan al repositorio de abenzerps, no al de thomasdaniel87, lo que sugiere que esta ficha es una re-publicación; conviene verificar la procedencia de los pesos.
- Información incompleta: la model card no documenta resolución nativa, número de pasos de inferencia recomendados,CFG ni datos de entrenamiento del modelo base.
- Consumo de VRAM elevado si se usa el codificador de texto en BF16 (17,53 GB); usar la versión INT8 ConvRot para equipos modestos.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/thomasdaniel87/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork con soporte nativo de Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (versión original mencionada): https://github.com/city96/ComfyUI-GGUF
- Paper, blog oficial y demo: no disponible
