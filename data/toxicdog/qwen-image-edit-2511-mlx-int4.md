# toxicdog/qwen-image-edit-2511-mlx-int4

## Resumen

`toxicdog/qwen-image-edit-2511-mlx-int4` es un conjunto de pesos pre-cuantizados en formato MLX int4 del modelo de edicion de imagen Qwen-Image-Edit-2511 de Alibaba Qwen. Lo publica el usuario toxicdog y su proposito no es servir como modelo autonomo, sino como artefacto de carga rapida para el motor Swift `xocialize/qwen-image-edit-swift`, en su variante "turbo tier". Su relevancia practica reside en el ahorro de memoria: evita materializar los pesos bf16 (unos 40 GB en el DiT de 20 000 millones de parametros) y la cuantizacion en memoria, que alcanza picos de unos 57 GB.

El paquete incluye dos tensores principales: el DiT transformer de 20B en int4 y el codificador de texto Qwen2.5-VL-7B tambien en int4, con un peso total en repositorio de 18,9 GB. La cuantizacion es afin de MLX con tamano de grupo 64, con capas de modulacion en int8 por su sensibilidad en el condicionamiento.

Es importante senalar que el formato es no estandar: los tensores usan nombres de modulo internos del motor y metadatos de cuantizacion propios, por lo que no cargan con `mlx_lm`, `mlx_vlm` ni diffusers genericos. Para un uso con herramientas estandar, el autor remite a `mlx-community/qwen-image-edit-2511-8bit`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 20B para generacion/edicion de imagen, con codificador de texto Qwen2.5-VL-7B |
| Parametros totales | no disponible (DiT de 20B + text encoder de 7B segun la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (MLX affine, group size 64) en lineales de atencion y feed-forward; int8 en lineales de modulacion; bf16 en proyecciones top-level y VAE |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX no estandar, solo cargable por el motor Swift propietario) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-Edit-2511 es un modelo de edicion de imagen image-to-image construido sobre una arquitectura DiT (Diffusion Transformer) de aproximadamente 20 000 millones de parametros, acompanado de un codificador de texto multimodal Qwen2.5-VL-7B que procesa las instrucciones de edicion. La variante aqui publicada no reentrena el modelo: aplica cuantizacion post-entrenamiento sobre los pesos originales en bf16, dejando los lineales de atencion y feed-forward en int4 con grupo 64 y preservando las capas de modulacion en int8 por su papel critico en el condicionamiento. Las proyecciones de nivel superior y el VAE se mantienen en bf16.

La innovacion tecnica no esta en la arquitectura sino en el pipeline de cuantizacion y carga: los pesos incluyen metadatos por capa de bits y tamano de grupo, lo que permite al motor Swift cargar directamente el tier int4 sin pasar por bf16. Ademas, el modelo soporta un flujo de inferencia en 4 pasos mediante un LoRA DMD (Lightning 4-step), que no viene incluido en el repositorio y debe aplicarse en tiempo de ejecucion. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni procesos de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Edicion de imagen guiada por texto (image-to-image) a partir de instrucciones en lenguaje natural.
- Generacion de imagenes en resolucion 1024x1024 en el tier turbo medido por el autor.
- Inferencia acelerada en 4 pasos mediante el LoRA DMD opcional aplicado en runtime.
- Codificacion de prompts multimodales mediante Qwen2.5-VL-7B, lo que permite instrucciones complejas y potencialmente referencias visuales.
- Cuantizacion selectiva que preserva calidad en capas de condicionamiento (int8) mientras comprime el resto (int4).
- Ejecucion en hardware Apple Silicon mediante el ecosistema MLX.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible (es un modelo de edicion de imagen, no un LLM de proposito general).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking especial: no disponible mas alla del codificador VL integrado.

## Casos de uso

- Edicion de imagenes en local en equipos Apple Silicon: el formato int4 permite cargar el modelo en torno a 21 GB residentes, lo que lo hace viable en Mac con memoria unificada de 32 GB o superior, sin depender de GPU NVIDIA remotas.
- Prototipado rapido de pipelines de edicion de imagen: al cargar directamente el tier turbo, se reduce el tiempo de arranque en comparacion con cargar bf16 y cuantizar en memoria, lo que acelera iteraciones de diseno.
- Generacion de variantes de producto en flujos de e-commerce: instrucciones como cambiar fondo, iluminacion o color de un articulo se pueden aplicar en 4 pasos con el LoRA DMD, manteniendo coherencia con la imagen original.
- Postproduccion fotografica asistida: retoques guiados por texto (eliminar objetos, ajustar estilo) sobre imagenes de 1024x1024 en entornos de estudio con Mac Studio.
- Aplicaciones de escritorio o moviles para macOS/iOS que integren edicion generativa sin envio de datos a la nube, aprovechando el runtime Swift de MLXEngine.
- Investigacion en cuantizacion de modelos de difusion: el repositorio sirve como referencia de una estrategia mixta int4/int8 con metadatos por capa, util para estudiar el impacto en calidad frente a bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de huella de memoria medidas en el motor Swift MLXEngine, tier turbo, a 1024² y 4 pasos DMD:

| Metrica | Valor |
|---|---|
| Pico de carga | ~21 GB (sin materializar bf16) |
| Memoria residente | ~21 GB |
| Pico de inferencia | ~25,5 GB (con VAE en bf16) |
| Comparativa bf16 | ~57 GB de pico |
| Comparativa carga + cuantizacion en memoria | ~41 GB de pico |
| Tamano del repositorio | 18,9 GB |

No se aportan datos de latencia, throughput, FID, CLIP score ni comparaciones cualitativas con el modelo original en bf16.

## Requisitos de hardware

- Memoria unificada estimada para inferencia: en torno a 25,5 GB de pico en el tier turbo a 1024², segun medicion del autor.
- Memoria minima recomendada: 32 GB de memoria unificada en Apple Silicon para operar con margen; 64 GB o mas para flujos con otras aplicaciones concurrentes.
- Hardware compatible: exclusivamente Apple Silicon (M1/M2/M3/M4 y variantes Pro, Max, Ultra) mediante el framework MLX y el motor Swift `xocialize/qwen-image-edit-swift`. No es compatible con GPU NVIDIA ni ROCm en este formato.
- GPU dedicadas tipo A100, H100 o RTX 4090: no soportadas por este repositorio; para esas plataformas habria que usar los pesos originales de Qwen/Qwen-Image-Edit-2511 en bf16 con diffusers.
- Opciones de despliegue: `QwenImageEditWeights.loadQuantizedDiT` y `QwenVLPromptEncoder.load(quantizedTextModelPath:)` del paquete Swift mencionado. No carga con vLLM, llama.cpp, Ollama, TGI ni diffusers.
- Latencia y throughput: no disponibles; el autor solo menciona inferencia en 4 pasos con el LoRA DMD, sin cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Memoria de carga | Licencia | Cargable con herramientas estandar |
|---|---|---|---|---|---|
| toxicdog/qwen-image-edit-2511-mlx-int4 | DiT 20B + VL 7B, int4 | MLX no estandar | ~21 GB residentes, ~25,5 GB pico | Apache-2.0 | No (solo motor Swift propio) |
| mlx-community/qwen-image-edit-2511-8bit | DiT 20B + VL 7B, 8 bits | MLX estandar | no disponible (mayor que int4) | Apache-2.0 | Si (mlx_lm / mlx_vlm / diffusers) |
| Qwen/Qwen-Image-Edit-2511 (base) | DiT 20B + VL 7B, bf16 | safetensors diffusers | ~57 GB pico | Apache-2.0 | Si (diffusers) |
| Modelos de edicion de imagen alternativos (FLUX.1 Kontext, etc.) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Formato no estandar: los pesos no cargan con `mlx_lm`, `mlx_vlm`, diffusers ni otras herramientas genericas. Solo funcionan con los cargadores del paquete Swift `xocialize/qwen-image-edit-swift`.
- Dependencia de un ecosistema muy concreto (Swift + MLX + Apple Silicon): no hay soporte para Linux, Windows ni GPU CUDA en este repositorio.
- El LoRA DMD de 4 pasos no esta incluido; sin el, el modelo pierde la ventaja de inferencia rapida y requiere el numero de pasos estandar del modelo base.
- El vision tower del codificador Qwen2.5-VL no esta incluido en int4; se carga en bf16 desde el snapshot base, lo que anade dependencia de los pesos originales.
- Cuantizacion int4 en atencion y feed-forward: aunque las modulaciones se preservan en int8, es esperable cierta perdida de fidelidad frente a bf16. No se aportan metricas de calidad que la cuantifiquen.
- Riesgo de alucinacion visual y de artefactos inherentes a los modelos de difusion: poses, texto o detalles finos pueden desviarse de la instruccion.
- Sesgos de generacion heredados del modelo base Qwen-Image-Edit-2511: no documentados en esta ficha.
- Cero descargas y cero likes en el momento de la consulta, y publicacion reciente: ausencia de validacion por parte de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos del modelo base y del paquete Swift asociado antes de integrarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/toxicdog/qwen-image-edit-2511-mlx-int4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Conversion estandar 8 bits recomendada por el autor: https://huggingface.co/mlx-community/qwen-image-edit-2511-8bit
- Paquete Swift asociado: `xocialize/qwen-image-edit-swift` (referenciado en la model card; no se aporta URL directa)
- Framework MLX: https://github.com/ml-explore/mlx
