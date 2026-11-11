# unsloth/MiniMax-H3-Image-FP8

## Resumen

MiniMax-H3-Image-FP8 es un checkpoint pre-cuantizado en FP8 del transformer de difusión (DiT) de MiniMax-H3-Image, el miembro de generación y edición de imágenes de la familia MiniMax H3. Lo publica unsloth como alternativa ligera al modelo base en bfloat16, reduciendo el DiT de 40,2 GB a 18,88 GiB (20,27 GB) para hacer viable la inferencia en GPUs de gama profesional y consumer de alta capacidad. El modelo base lo desarrolla MiniMaxAI y está diseñado para generar imágenes de unos 16 megapíxeles en cualquier relación de aspecto, desde 4096x4096 (1:1) hasta 6272x2688 (21:9), sin upscaler, y para editar una o varias imágenes de referencia.

La relevancia de esta versión radica en que el modelo original en bf16 no cabe en GPUs de 24 GB, mientras que este checkpoint FP8 permite ejecutarlo con streaming de bloques en una L4 de 24 GB (28 de 50 bloques residentes, 18,7 GB de VRAM pico). Está destilado a 6 pasos de muestreo sin classifier-free guidance, lo que reduce drásticamente el coste de inferencia frente a modelos de difusión convencionales que requieren decenas de pasos y doble forward por paso.

El repositorio contiene únicamente el DiT cuantizado; el VAE, el tokenizer, el processor y el schedule de sigmas provienen del release base, y el text encoder (Qwen3-VL de MiniMax-H3) debe obtenerse por separado. La licencia es la MiniMax H3 Image Community License Agreement, no una licencia open source estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con modulación adaLN en forma de curva; 50 bloques |
| Parámetros totales | no disponible (DiT bf16 pruned de 40,2 GB; checkpoint cuantizado de 20,27 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; ventana de texto delegada al text encoder Qwen3-VL) |
| Tipos de cuantización | FP8 e4m3 con absmax por canal de salida; INT8 con absmax por canal de salida y rotación Hadamard ConvRot (grupo 256) |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | safetensors (FP8 e INT8-ConvRot) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer con 50 bloques. Esta versión cuantiza 313 capas Lineales del DiT y mantiene en fp32 la proyección de entrada (`proj_in`), la tabla de la curva de modulación, `norm_out.linear` y toda la ruta adaLN. La modulación adaLN densa del release original se sustituye por una factorización en forma de curva, con un error relativo frente al adaLN denso de 6,5e-4 a 7,5e-4 (coseno 0,9999998) a los 6 pasos de muestreo. Los pesos muestreados son idénticos bit a bit al release original.

El checkpoint se construye a partir de `minimax_h3_image_pruned_bf16.safetensors` de Comfy-Org. La variante INT8-ConvRot almacena los pesos en una base rotada por Hadamard y requiere un loader que rote las activaciones en consecuencia. Las cabezas de salida por paso del release (`pdd_fused_heads.safetensors`) se conservan como `pdd_proj_out.0` a `pdd_proj_out.5` en fp32 sin cambios. El modelo está destilado a 6 pasos de muestreo sin CFG, con el schedule de sigmas en `pdd_config.json`. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto a imagen (text-to-image) a resolución nativa de unos 16 MP, con rango de trabajo de 4 a 20 MP.
- Generación en múltiples relaciones de aspecto sin upscaler: 4096x4096 (1:1), 4736x3552 (4:3 / 3:4), 6272x2688 (21:9), entre otras.
- Edición de imagen (image-to-image) con una o varias imágenes de referencia.
- Edición de imagen guiada por instrucciones en lenguaje natural.
- Muestreo en 6 pasos sin classifier-free guidance, lo que reduce el coste por imagen.
- Soporte de seed reproducible (los ejemplos usan seed 42).
- Capacidades multilingües: solo inglés según los metadatos del modelo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Generación de arte conceptual en alta resolución: el modelo produce imágenes de 16 MP sin upscaler, adecuado para ilustración, key art y material de impresión donde se necesita detalle fino a tamaño completo.
- Edición fotográfica asistida por instrucciones: dado que soporta image-to-image con varias referencias, se puede usar para retocar composiciones, cambiar iluminación o sustituir elementos manteniendo coherencia con la imagen original.
- Producción de assets para banners y formatos panorámicos: la generación nativa en 21:9 (6272x2688) evita recortes y reescalados en piezas de web, publicidad exterior o cabeceras.
- Prototipado rápido en estudios de diseño: con 6 pasos y sin CFG, un render en una L4 tarda unos 45 s en FP8 y 91 s en INT8, lo que permite iterar sobre variaciones de prompt en una sesión de trabajo.
- Generación de imágenes de producto con varias referencias: la edición multi-referencia permite componer escenas con objetos o personas de distintas fuentes manteniendo consistencia.
- Investigación en cuantización de modelos de difusión: los checkpoints FP8 e INT8-ConvRot, con validación documentada frente a bf16 (coseno x0 de 0,99990 y 0,99946), sirven como referencia para estudiar el impacto de la cuantización en calidad visual.
- Despliegue en hardware limitado: con streaming de bloques cabe en una L4 de 24 GB, lo que habilita pipelines de generación de imágenes en infraestructura de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Sí se documentan métricas de validación de la cuantización frente al modelo bf16:

| Métrica | INT8-ConvRot | FP8 |
|---|---|---|
| Coseno x0 vs bf16 (forward encadenado del DiT) | 0,99990 | 0,99946 |
| Error relativo x0 | 0,0144 | 0,033 |
| Peor coseno por capa | 0,99978 | 0,99913 |
| LPIPS vs bf16 (1024x1024, seed 42, un prompt) | 0,102 | 0,313 |
| Tiempo de render tibio en L4 (2048x2048, 6 pasos) | 91 s | 45 s |
| Tiempo de render en A100 40 GB (INT8 residente) | 28,6 s | no aplica (A100 sin tensor cores FP8) |
| Tiempo de carga en L4 (peak 19,3 GiB) | 17 s | 31 s |
| Tamaño del checkpoint | 18,88 GiB (20,27 GB) | 18,88 GiB (20,27 GB) |

## Requisitos de hardware

- VRAM estimada: 18,7 GB pico en L4 con streaming de bloques (28 de 50 bloques residentes); el checkpoint completo ocupa 20,27 GB, por lo que con el DiT residente se necesita una GPU de 24 GB o más.
- GPU recomendadas: L4 (24 GB) con streaming; A100 40 GB para mantener el DiT INT8 residente; para FP8 se requiere hardware con tensor cores FP8 (la A100 no los tiene, por lo que en esa GPU se usa INT8).
- Cabe en consumer GPU de 24 GB (RTX 3090, RTX 4090) solo con streaming de bloques; no cabe completo en GPUs de 16 GB.
- Opciones de despliegue: Unsloth Studio (ruta de checkpoints pre-cuantizados); stable-diffusion.cpp aún sin build GGUF (planificado).
- Latencia y throughput: unos 45 s por imagen en FP8 y 91 s en INT8 sobre L4 a 2048x2048 con 6 pasos; 28,6 s por imagen en A100 40 GB con INT8 residente.
- Componentes adicionales necesarios: VAE, tokenizer, processor y `pdd_config.json` del release base; text encoder Qwen3-VL de MiniMax-H3 (copia INT8-ConvRot en `unsloth/MiniMax-H3-FP8`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-FP8 (este) | DiT pruned 40,2 GB bf16; 20,27 GB cuantizado | 16 MP nativos, 4-20 MP de trabajo | FP8 e4m3, INT8-ConvRot | Community license | Hugging Face |
| MiniMax-H3-Image (base) | DiT pruned 40,2 GB bf16 | 16 MP nativos | bf16 | Community license | Hugging Face |
| MiniMax-H3-Image-INT8-ConvRot | DiT pruned 40,2 GB bf16; 20,27 GB cuantizado | 16 MP nativos | INT8 con rotación Hadamard | Community license | Hugging Face |

No se dispone en la información proporcionada de datos de otros modelos de difusión comparables (por ejemplo, de la familia Stable Diffusion o Flux) para establecer una comparación cuantitativa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo se incluye el DiT; sin el VAE, tokenizer, processor, schedule y text encoder del release base el modelo no es funcional.
- La variante INT8-ConvRot requiere un loader que aplique la rotación Hadamard a las activaciones; no es cargable con loaders estándar sin ese soporte.
- FP8 presenta mayor desviación respecto a bf16 que INT8-ConvRot (LPIPS 0,313 frente a 0,102 en el prompt y seed de validación); para máxima fidelidad se recomienda INT8-ConvRot cuando el hardware lo permita.
- La A100 no dispone de tensor cores FP8, por lo que en esa GPU debe usarse la variante INT8.
- El modelo solo soporta inglés según los metadatos; no se documenta cobertura multilingüe.
- La licencia es la MiniMax H3 Image Community License Agreement, no una licencia open source estándar; es necesario revisar sus términos antes de uso comercial.
- No hay build GGUF para stable-diffusion.cpp todavía, lo que limita el despliegue en ecosistemas basados en llama.cpp.
- Riesgo de alucinación visual y sesgos: no se documentan en la información disponible evaluaciones de sesgo ni tasas de error semántico; deben validarse en el caso de uso concreto.
- El modelo está destilado a 6 pasos sin CFG; no admite negative prompts en el flujo documentado (guidance 1.0, sin negative prompt).
- Los datos de rendimiento corresponden a un único prompt y seed en la validación de cuantización; no deben generalizarse sin pruebas adicionales.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/unsloth/MiniMax-H3-Image-FP8
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Text encoder (familia H3): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint con text encoder INT8-ConvRot: https://huggingface.co/unsloth/MiniMax-H3-FP8
- Pesos fuente pruned bf16: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Ejemplo de prompt text-to-image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/examples/revised_prompt.t2i.txt
