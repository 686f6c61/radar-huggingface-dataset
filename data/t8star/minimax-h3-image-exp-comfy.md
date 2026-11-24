# t8star/Minimax-H3-Image-Exp-Comfy

## Resumen

MiniMax-H3-Image-Exp-Comfy es un paquete de investigación de terceros publicado por el usuario t8star sobre el modelo base MiniMax-H3-Image de MiniMaxAI. No se trata de un modelo nuevo ni de un fine-tune oficial, sino de una conversión al formato ComfyUI del tronco de difusión completo en BF16/FP32 (66,29 GB) junto con un LoRA experimental de corrección de materiales (172,07 MB) y los nodos y flujos de trabajo necesarios para reproducir la experimentación. El objetivo declarado es explorar si una aproximación multi-paso (Euler 50 pasos, CFG 3, shift 3) produce materiales más naturales que la ruta nativa de seis pasos con CFG1 del modelo publicado.

El repositorio incluye además el codificador de texto Qwen3VL-32B cuantizado a INT8 (27,14 GB) y el VAE en FP16 (1,17 GB), junto con un nodo personalizado de "cabeza única" que promedia las seis cabezas PDD del modelo original. Es relevante ahora porque ofrece acceso práctico en ComfyUI a un modelo de generación y edición de imágenes de gran tamaño (salidas de 2048×2048 en texto-a-imagen y 2048×1344 en edición fotográfica) que de otro modo requeriría infraestructura propia, aunque con requisitos de memoria considerables.

La licencia es la MiniMax-H3-Image Community License Agreement, distinta de las licencias open source habituales, y el autor advierte explícitamente de que este paquete no es una versión oficial, no es el modelo FineView y no es el modelo original con PDD eliminado. El repositorio ocupa 99,8 GB en total y acumula 9.294 descargas y 13 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para imágenes (text-to-image e image-editing) con cabezas PDD (no se detalla la arquitectura interna en la información disponible) |
| Parametros totales | no disponible (el tronco de difusión ocupa 66,29 GB en BF16/FP32 mixto; el codificador de texto es Qwen3VL-32B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Tronco en BF16 + FP32 mixto; codificador de texto en INT8; VAE en FP16; LoRA en formato de adaptador de bajo rango (rank 16) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | minimax-h3-image-community-license-agreement (licencia "other") |
| Formato de pesos | safetensors (tronco, LoRA, codificador de texto y VAE); flujos de trabajo en JSON para ComfyUI |
| Modelo base | MiniMaxAI/MiniMax-H3-Image |
| Tamaño del repositorio | 99,8 GB |
| Resolución de salida | 2048×2048 (texto-a-imagen); 2048×1344 (edición fotográfica) |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MiniMax-H3-Image más allá de que se trata de un modelo de difusión con seis cabezas PDD (probablemente "Progressive Denoising Heads" o similar, aunque la expansión exacta del acrónimo no se especifica). El tronco convertido a ComfyUI conserva la precisión de publicación completa, incluyendo AdaLN, y no es una desquantización de INT8 ni un modelo podado. El paquete incluye una "cabeza única" que resulta de la combinación ponderada por intervalos de las seis cabezas PDD originales; el autor aclara que no es la cabeza del profesor previo a la destilación.

El componente experimental central es el LoRA `experimental_direct_mlp100_rank16-T8`, entrenado de forma independiente como compensación aproximada de materiales para la ruta multi-paso. El autor indica que no se ha encontrado el incremento PDD del tronco de imagen original ni pesos de un profesor desconocido para comparar, por lo que rechaza explícitamente afirmaciones de "destilación completada" o "99 % de restauración del original". También menciona un adaptador rechazado (`REJECTED_edit_preservation_mlp100_rank16_DIAGNOSTIC_ONLY`) que no superó las comprobaciones de presupuesto numérico de entrenamiento y no debe usarse en producción. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen a 2048×2048 píxeles.
- Edición de imágenes (image-to-image) a 2048×1344, con la imagen de referencia presente tanto en la rama de condicionamiento positiva como en la negativa.
- Ruta nativa de seis pasos con CFG1 (equivalente a BasicGuider) usando el calendario PDD de publicación.
- Ruta experimental multi-paso (Euler 50 pasos, CFG 3, shift 3) con tabla explícita de 51 puntos sigma y el LoRA direct MLP100 a intensidad +1.
- Soporte de prompts en chino e inglés.
- Integración con ComfyUI mediante nodos nativos (`MiniMaxH3ImageConditioning`, `LoraLoaderBypassModelOnly`, `ManualSigmas`, `CFGGuider`) y un nodo personalizado (`H3ImageSingleHead`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso textual, visión general, audio ni modo "thinking"; es un modelo exclusivamente de imagen.

## Casos de uso

- Generación de ilustración editorial a alta resolución: el modelo produce imágenes de 2048×2048 directamente, adecuadas para portadas, láminas o material promocional que requiera detalle fino sin reescalado posterior.
- Edición fotográfica con preservación de referencia: el flujo `shop_wall_edit.json` permite sustituir o modificar elementos de una foto manteniendo la imagen original como condicionamiento en ambas ramas, útil para retoque de producto o maquetación.
- Investigación sobre schedule de difusión: la comparación controlada entre la ruta nativa de seis pasos y la ruta de 50 pasos con el LoRA permite estudiar cómo afecta el número de pasos y el CFG a la textura de materiales como piel, tela o pelo.
- Prototipado de pipelines ComfyUI: el repositorio incluye flujos JSON listos para importar, lo que sirve como plantilla para integrar modelos de difusión grandes en herramientas de automatización gráfica.
- Reproducción de experimentos de terceros: los manifiestos `MODEL_INDEX.md` y `MODEL_MANIFEST.json` documentan tamaños, SHA256 y procedencia de cada archivo, facilitando la verificación y replicación en entornos de investigación.
- Evaluación de licencias comunitarias restrictivas: útil para equipos que necesitan valorar si la MiniMax-H3-Image Community License es compatible con su producto antes de invertir en infraestructura.
- Generación bilingüe de material gráfico: al aceptar prompts en chino e inglés, encaja en flujos de trabajo con equipos o clientes en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una comprobación manual conjunta sobre un conjunto fijo de muestras (8 de 10) que no constituye una medida de similitud con el profesor ni una prueba ciega a gran escala, y advierte que no debe interpretarse como una tasa de victoria frente a la ruta nativa.

## Requisitos de hardware

- VRAM estimada: el autor reporta ejecución real en una RTX 4060 Ti de 16 GB, pero con 128 GB de RAM de sistema y descarga (offload) masiva del tronco de 66 GB. No se garantiza que funcione en máquinas con menos memoria.
- GPU recomendadas: no se especifican modelos profesionales (A100, H100) en la documentación; el único dato empírico es la RTX 4060 Ti 16 GB. Para evitar offload conviene una GPU con 48 GB o más de VRAM, aunque este dato no está confirmado por el autor.
- Cabe en GPU de consumo: sí, al menos en RTX 4060 Ti 16 GB, pero con requisitos altos de RAM del sistema y sin garantía de velocidad.
- Opciones de despliegue: ComfyUI con nodos nativos de MiniMax H3 Image y el nodo personalizado `H3ImageSingleHead` (GitHub o espejo en Hugging Face, no ambos). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de difusión.
- Latencia y throughput: no disponibles. El autor advierte que distintos hardware, operadores y versiones de ComfyUI no garantizan resultados idénticos píxel a píxel.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Image-Exp-Comfy (este) | no disponible (tronco 66,29 GB) | 2048×2048 / 2048×1344 | MiniMax-H3-Image Community License | Hugging Face, ComfyUI | Paquete de terceros con LoRA experimental |
| MiniMaxAI/MiniMax-H3-Image (base) | no disponible | no disponible | MiniMax-H3-Image Community License | Hugging Face | Modelo oficial del que deriva este paquete |
| Alternativas de difusión de gran tamaño | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo oficial de MiniMax ni una nueva versión: es un empaquetado de terceros sobre MiniMax-H3-Image.
- No es el modelo FineView ni el modelo original con PDD eliminado; el autor rechaza explícitamente cualquier afirmación de "destilación completada" o "99 % de restauración".
- El LoRA experimental solo se ha validado en la ruta de 50 pasos con CFG 3 y shift 3; no debe aplicarse a la ruta nativa de seis pasos ni combinarse con adaptadores antiguos v2 o PAI.
- El adaptador `REJECTED_edit_preservation_mlp100_rank16_DIAGNOSTIC_ONLY` no superó las comprobaciones numéricas y no se recomienda para producción.
- La licencia MiniMax-H3-Image Community License Agreement no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Riesgo de alucinación visual y de artefactos: el autor documenta "marcas duras evidentes" en la ruta de 50 pasos sin corrección, lo que indica que la calidad depende fuertemente de la configuración del sampler.
- Requisitos de memoria muy elevados: 66 GB de pesos más 27 GB de codificador de texto exigen offload y abundante RAM; no se garantiza su funcionamiento en equipos con menos de 128 GB de RAM.
- Idiomas limitados a chino e inglés; no se documenta soporte para castellano ni otros idiomas.
- Los resultados no son reproducibles píxel a píxel entre versiones de ComfyUI u operadores distintos.
- El nodo personalizado debe instalarse desde una única fuente (GitHub o espejo de Hugging Face), ya que instalar ambos provoca carga duplicada.
- No se han publicado benchmarks ni evaluaciones ciegas a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Nodo personalizado en GitHub: https://github.com/T8mars/Comfyui-h3-image-single-head-T8
- Instrucciones de instalación del nodo: https://github.com/T8mars/Comfyui-h3-image-single-head-T8#安装
- Descarga ZIP del nodo: https://github.com/T8mars/Comfyui-h3-image-single-head-T8/archive/refs/heads/main.zip
- Flujo texto-a-imagen recomendado: workflows/direct_mlp/violin_maker.json (dentro del repositorio)
- Flujo de edición recomendado: workflows/direct_mlp/shop_wall_edit.json (dentro del repositorio)
- Flujos nativos de seis pasos: workflows/native_pdd6 (dentro del repositorio)
- Manifiesto de modelos: MODEL_INDEX.md y MODEL_MANIFEST.json (dentro del repositorio)
- Ejemplos comparativos: EXAMPLES.md (dentro del repositorio)
