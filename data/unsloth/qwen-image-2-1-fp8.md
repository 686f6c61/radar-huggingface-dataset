# unsloth/Qwen-Image-2.1-FP8

## Resumen

`unsloth/Qwen-Image-2.1-FP8` es una versión cuantizada en FP8 e INT8 del modelo de generación y edición de imágenes `Qwen/Qwen-Image-2.1`, publicada por Unsloth. El repositorio incluye tanto el transformer cuantizado (7,12 GB en FP8 y 7,26 GB en INT8, frente a los 14,23 GB en bf16 del modelo base) como una copia ya convertida a FP8 del codificador de texto Qwen3-VL (9,39 GB frente a 17,5 GB en bf16) y el VAE en bf16 (0,63 GB). El objetivo es reducir la huella de memoria de un pipeline de difusión de gran tamano sin reentrenar nada, manteniendo la calidad visual lo más cerca posible del original.

El modelo base Qwen-Image-2.1 es un modelo unificado de text-to-image y edición de imágenes de la familia Qwen, con 7B parámetros en el componente de generación visual (32 capas DiT Single-Stream) y capacidades nativas de transparencia (RGBA), edición local mediante máscaras o anotaciones y uso de hasta 10 imágenes de referencia. Esta versión cuantizada hereda todas esas capacidades, pero cambia el perfil de hardware necesario: según el autor, con FP8 dinámico y offloading el pipeline puede ejecutarse en 6 GB de VRAM a cambio de ser menos de 2 veces más lento.

Es relevante ahora porque permite desplegar un modelo de generación y edición de imágenes de última generación en GPUs de consumo o en nodos con poca VRAM, sin recurrir a servicios en la nube. El coste es una pérdida medible de fidelidad respecto a bf16, cuantificada por el autor con LPIPS a misma semilla: 0,064 para INT8 y 0,112 para FP8. El esquema que Unsloth distribuye por defecto es INT8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 32 capas Single-Stream en el componente de generación visual; codificador de texto Qwen3-VL; VAE propia (qwen_image_2.1_vae) |
| Parametros totales | 7B en el componente de generación visual; el total del pipeline (codificador de texto + VAE incluidos) no está especificado en la información disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generación de imagen; no se documenta longitud máxima de prompt) |
| Tipos de cuantizacion | FP8, INT8, FP8 dinámico; existe además una variante GGUF en un repositorio aparte |
| Idiomas soportados | en, zh |
| Licencia | qwen-research (etiquetada como `license: other` con `license_name: qwen-research`) |
| Formato de pesos | safetensors (INT8, FP8 y VAE en bf16); no se usa pickle |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID | unsloth/Qwen-Image-2.1-FP8 |
| Autor | unsloth |
| Modelo base | Qwen/Qwen-Image-2.1 (relación: quantized) |
| Pipeline | text-to-image |
| Librería | diffusers |
| Tamano del repo | 24,5 GB |
| Descargas | 1 |
| Likes | 11 |
| Creado | 2026-09-21 |
| Actualizado | 2026-09-22 |

Ficheros incluidos:

| Fichero | Tamano | Sustituye a |
|---|---|---|
| `Qwen-Image-2.1-INT8.safetensors` | 7,26 GB | transformer bf16 de 14,23 GB |
| `Qwen-Image-2.1-FP8.safetensors` | 7,12 GB | transformer bf16 de 14,23 GB |
| `Qwen-Image-2.1-text_encoder-FP8.safetensors` | 9,39 GB | text encoder bf16 de 17,5 GB |
| `vae/qwen_image_2.1_vae_bf16.safetensors` | 0,63 GB | VAE en fp32, para el repo GGUF |

## Arquitectura y entrenamiento

El componente generativo es un Diffusion Transformer (DiT) de 32 capas Single-Stream con 7B parámetros. Frente a arquitecturas de doble flujo, el diseño Single-Stream procesa conjuntamente las representaciones de texto e imagen, lo que reduce el coste computacional por paso. El modelo base incorpora dos optimizaciones declaradas por Qwen: atención de granularidad mixta y reutilización de caché KV de prefijo, orientadas a mantener calidad con bajo coste de inferencia. El codificador de texto es Qwen3-VL, un modelo visión-lenguaje, y la decodificación final la realiza un VAE específico (qwen_image_2.1_vae).

Sobre el entrenamiento del modelo base no se proporcionan en la información disponible datos de número de tokens, composición del dataset, ni si hubo etapas de RLHF o DPO. Esta ficha cubre una conversión de precisión, no un reentrenamiento: Unsloth ha cuantizado los pesos del transformer a FP8 e INT8 y ha generado una copia preconvertida a FP8 del text encoder, sin modificar la arquitectura. La innovación práctica es la gestión de memoria: en Unsloth Desktop la selección de precisión INT8 o FP8 es automática, y el repositorio incluye una ruta de FP8 dinámico con offloading que baja el requisito a 6 GB de VRAM con una penalización de velocidad inferior a 2x según el autor. Todos los pesos se distribuyen en safetensors, de modo que la carga no ejecuta código arbitrario.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con prompts en inglés y chino.
- Generación de imágenes con transparencia nativa en RGBA, no solo RGB.
- Edición de imágenes: modificación de capas transparentes y edición local especificada mediante círculos, anotaciones pintadas o máscaras independientes.
- Extracción de sujetos a partir de fotografías (subject extraction), útil para generar recortes con canal alfa.
- Composición con hasta 10 imágenes de referencia en una misma generación o edición.
- Preservación de identidad en personas y productos a lo largo de una edición (identity preservation).
- Mejoras declaradas en tipografía (renderizado de texto dentro de la imagen), iluminación de retratos y detalle fino.
- Modelo unificado: las mismas capacidades de generación y edición residen en un único modelo, sin necesidad de pipelines separados.
- No aplica tool calling ni function calling: no es un modelo de lenguaje, no expone interfaz de herramientas.
- No aplica razonamiento multi-paso tipo agente: el pipeline es una llamada de difusión, no un bucle de decisión.
- Capacidades multilingües limitadas a los idiomas documentados (en, zh).

## Casos de uso

- Generación de imágenes fotorrealistas para marketing: el modelo produce escenas fotorrealistas (teatros, cafeterías, paisajes) a partir de prompts descriptivos largos, lo que permite crear material para campañas sin sesión fotográfica y con la licencia controlada por el usuario.
- Edición con máscaras en flujos de retoque publicitario: al aceptar círculos, anotaciones pintadas y máscaras separadas, permite cambiar un producto o corregir un detalle concreto sin regenerar toda la imagen, lo que reduce el número de iteraciones frente a un inpainting genérico.
- Catálogos de producto con fondo transparente: la salida RGBA nativa evita el paso posterior de segmentación y recorte, de modo que un e-commerce puede generar imágenes de producto listas para componer sobre cualquier fondo.
- Extracción de sujetos desde fotografía existente: a partir de una foto de archivo, el modelo aísla el sujeto con canal alfa, un caso directo para migrar catálogos antiguos a formatos componibles.
- Coherencia de marca con múltiples referencias: el soporte de hasta 10 imágenes de referencia permite mantener un mismo producto o personaje a lo largo de varias generaciones, lo que resulta adecuado para series de anuncios o ilustraciones de una misma campaña.
- Preservación de identidad en contenido con personas: para material editorial o corporativo donde la misma persona debe aparecer de forma consistente en varias piezas, el modelo mantiene los rasgos faciales entre ediciones.
- Generación de recursos con canal alfa para videojuegos y UI: sprites, iconos y elementos de interfaz que requieren transparencia se pueden generar directamente, sin post-proceso de matting.
- Carteles y material gráfico con texto: las mejoras de tipografía del modelo base permiten generar piezas donde el texto forma parte de la composición, útil para prototipos de cartelería y packaging.
- Despliegue en estaciones de trabajo modestas: con FP8 dinámico y offloading el pipeline cabe en 6 GB de VRAM, lo que habilita pruebas locales en portátiles y GPUs de gama de entrada dentro de un equipo de diseño o investigación.

## Benchmarks y rendimiento

La información disponible incluye una única métrica cuantitativa: la similitud perceptual LPIPS a misma semilla frente al modelo en bf16 (menor es mejor), que mide cuánto se desvía la imagen generada por la versión cuantizada respecto a la de referencia.

| Variante | LPIPS a misma semilla vs bf16 (menor es mejor) | Tamano del transformer |
|---|---|---|
| INT8 (esquema distribuido por defecto) | 0,064 | 7,26 GB |
| FP8 | 0,112 | 7,12 GB |
| bf16 (referencia) | 0 (referencia) | 14,23 GB |

| Métrica de velocidad | Valor |
|---|---|
| FP8 dinámico con offloading en 6 GB de VRAM | menos de 2 veces más lento que la ejecución sin offloading (dato declarado por el autor, sin cifra absoluta) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ni métricas de fidelidad prompt-imagen como FID, CLIPScore o GenEval, ni comparativas con modelos de otras familias.

## Requisitos de hardware

- Pesos del pipeline completo en esta versión: 7,12 GB (transformer FP8) o 7,26 GB (INT8) + 9,39 GB (text encoder FP8) + 0,63 GB (VAE bf16) ≈ 17,1-17,3 GB solo en pesos. A esa cifra hay que sumar activaciones y buffers de difusión, por lo que el pico real de VRAM es superior.
- Pipeline en bf16 sin cuantizar (referencia del modelo base): 14,23 GB de transformer + 17,5 GB de text encoder + VAE en fp32, en el orden de 30 GB o más. El modelo base no cabe en GPUs de consumo sin cuantizar.
- Ejecución con FP8 dinámico y offloading: 6 GB de VRAM según el autor, con una penalización de velocidad inferior a 2x. Es la ruta para GPUs de gama de entrada.
- GPUs recomendadas para ejecución completa sin offloading: A100 40/80 GB, H100, L40S, RTX 6000 Ada. Cualquier GPU con 24 GB (RTX 3090, RTX 4090, A10G) puede ejecutar el pipeline cuantizado con margen razonable.
- Cabe en GPU de consumo: sí, en las versiones INT8/FP8. Con 24 GB (RTX 3090/4090) el pipeline entra sin offloading; con 6-12 GB es necesario el modo de offloading.
- Opciones de despliegue: diffusers (requiere una build main, ya que el soporte de Qwen-Image-2.1 es posterior a la release 0.40), Unsloth Desktop (selecciona automáticamente INT8 o FP8), y el repositorio GGUF `unsloth/Qwen-Image-2.1-GGUF` para el que este repo incluye el VAE en bf16.
- Dependencias mínimas: torch >= 2.4.0, transformers >= 5.17, diffusers desde git, accelerate y pillow.
- Latencia y throughput: no se publican cifras absolutas (imágenes por segundo, segundos por paso o tiempo por imagen de resolución concreta). El único dato es la ralentización relativa inferior a 2x del FP8 dinámico con offloading.

## Comparativa con modelos similares

No se dispone de datos verificables sobre otros modelos de generación de imagen comparables (por ejemplo, alternativas de la misma categoría de difusión) en la información proporcionada, por lo que la comparación se limita a las variantes derivadas del mismo modelo base.

| Modelo | Formato / precisión | Parametros | Contexto / referencias | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| unsloth/Qwen-Image-2.1-FP8 (este repo) | FP8 e INT8, safetensors | 7B en el componente visual | hasta 10 imágenes de referencia | LPIPS 0,064 (INT8) y 0,112 (FP8) vs bf16 | qwen-research | HuggingFace, diffusers main, Unsloth Desktop |
| Qwen/Qwen-Image-2.1 (base) | bf16 | 7B en el componente visual | hasta 10 imágenes de referencia | referencia (LPIPS 0) | qwen-research | HuggingFace, ModelScope, demo en Spaces |
| unsloth/Qwen-Image-2.1-GGUF | GGUF | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos de generación de imagen de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La versión FP8 pierde más fidelidad que la INT8: LPIPS de 0,112 frente a 0,064. Unsloth distribuye INT8 como esquema por defecto precisamente por este motivo; usar FP8 solo si interesa el menor tamano de fichero (7,12 GB frente a 7,26 GB), una diferencia marginal.
- La licencia es `qwen-research` (etiquetada como `license: other`). No se detallan en la información disponible las condiciones exactas de uso comercial; hay que revisar el texto de la licencia del modelo base antes de usarlo en producción.
- Idiomas documentados únicamente en inglés y chino. No hay evidencia en la información disponible sobre calidad de prompts en castellano u otros idiomas.
- No se publican benchmarks de fidelidad prompt-imagen (FID, CLIPScore, GenEval) ni evaluaciones humanas, solo la métrica LPIPS frente a bf16. No hay base para afirmar superioridad frente a otros modelos.
- Requiere una build main de diffusers: el soporte de Qwen-Image-2.1 es posterior a la release 0.40. Depender de una versión no publicada es un riesgo de reproducibilidad en entornos de producción y CI/CD.
- Dependencias relativamente recientes (transformers >= 5.17, torch >= 2.4.0) que pueden entrar en conflicto con stacks existentes.
- El modo de 6 GB de VRAM depende de offloading, lo que implica más transferencias de memoria y una latencia mayor (hasta 2x); no es adecuado para servicios con requisitos estrictos de tiempo de respuesta.
- Riesgo de artefactos visuales y de alucinación de detalles propios de los modelos de difusión; la cuantización puede agravar artefactos en texturas finas y en el renderizado de texto, un aspecto que el modelo base ya trata de mejorar.
- La salida RGBA puede requerir revisión del canal alfa (bordes, semitransparencias) antes de usarla en composición profesional.
- No se documentan sesgos conocidos del modelo base ni de esta cuantización en la información disponible.
- Repositorio muy reciente (creado el 2026-09-21) y con 1 descarga registrada; el ecosistema de herramientas alrededor de esta versión todavía puede cambiar.
- Al ser un modelo de imagen, no dispone de tool calling, agentes ni razonamiento multi-paso; no debe evaluarse con benchmarks de lenguaje.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/unsloth/Qwen-Image-2.1-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Guía de Unsloth para ejecutar Qwen-Image-2.1: https://unsloth.ai/docs/models/qwen-image-2.1
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Discord de Unsloth: https://discord.gg/unsloth
- Variante GGUF de Unsloth: https://huggingface.co/unsloth/Qwen-Image-2.1-GGUF
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen sobre Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Discord de Qwen: https://discord.gg/BEYSk3pkSu

No se han encontrado otros enlaces relevantes en la búsqueda web realizada.
