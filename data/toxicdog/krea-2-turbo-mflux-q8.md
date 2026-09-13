# toxicdog/krea-2-turbo-mflux-q8

## Resumen

`toxicdog/krea-2-turbo-mflux-q8` es una conversión cuantizada a 8 bits en formato MLX del modelo de generación de imágenes texto-a-imagen `krea/Krea-2-Turbo`, publicada por el usuario toxicdog y guardada con `mflux` 0.18.0. El objetivo es permitir la inferencia local en Apple Silicon (Metal/MLX) sin recuantizar en tiempo de ejecución: el repositorio contiene el transformer, el codificador de texto Qwen3-VL-4B, el tokenizer y el VAE de Qwen-Image en un único snapshot listo para usar.

Krea 2 es un modelo de difusión de tipo MMDiT de una sola corriente construido sobre la pila de Qwen-Image. La variante Turbo está destilada y genera imágenes en 8 pasos con guidance 1.0 (CFG desactivado). El transformer tiene 28 capas, dimensión oculta 6144 y atención con GQA de 48 cabezas de consulta y 12 de clave/valor.

La relevancia de esta conversión es doble: ilustra el flujo de adaptación de modelos de difusión grandes a MLX para hardware de Apple, y muestra un caso claro en el que el contador de parámetros de Hugging Face (~3,6 B) no refleja el tamaño real del modelo (~13 B), porque el empaquetado de 8 bits agrupa cuatro pesos por palabra `uint32`. La licencia heredada es `krea-2` y exige revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MMDiT de una sola corriente (single-stream), 28 capas, hidden 6144, GQA (48 cabezas Q / 12 cabezas KV, head_dim 128), SwiGLU, RoPE de 3 ejes estilo Flux [32, 48, 48], QK-norm por cabeza, atención con puerta sigmoide, AdaLN-single con modulación de 6 vías y adaptador `txtfusion` |
| Parámetros totales | ~13 B reales (transformer + codificador de texto Qwen3-VL-4B + VAE); el badge de Hugging Face indica ~3,6 B (3.606.719.052 elementos) por el empaquetado 8-bit |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen; la condición es el prompt, sin ventana de contexto declarada) |
| Tipos de cuantización | 8 bits (MLX) |
| Idiomas soportados | No disponible |
| Licencia | `krea-2` (etiquetada como `other`; hereda la de `krea/Krea-2-Turbo`) |
| Formato de pesos | `safetensors` MLX, sharded |

Otros datos: pipeline `text-to-image`, librería `mflux`, tamaño del repositorio 22,2 GB, snapshot declarado de ~13 GB, 0 descargas y 0 likes, creado y actualizado el 13/09/2026.

## Arquitectura y entrenamiento

La conversión no entrena nada nuevo: cuantiza a 8 bits los pesos de `krea/Krea-2-Turbo` con `mflux` 0.18.0 y los serializa en `safetensors` MLX. El transformer es un MMDiT de una sola corriente de 28 capas con hidden 6144, atención con GQA (48 cabezas de consulta, 12 de clave/valor, head_dim 128), SwiGLU, RoPE de 3 ejes estilo Flux con dimensiones [32, 48, 48], QK-norm por cabeza con atención de puerta sigmoide, modulación AdaLN-single de 6 vías y un adaptador `txtfusion` que fusiona las 12 representaciones ocultas del codificador de texto.

El codificador de texto es Qwen3-VL-4B; se toma un tap de 12 capas en los índices [2, 5, …, 35] aplanadas en orden layer-major y se elimina el prefijo de la plantilla de chat, de modo que solo los tokens del prompt condicionan el DiT. El VAE es el de Qwen-Image (latente de 16 canales de Wan2.1). La variante Turbo está destilada para producir imágenes en 8 pasos con guidance 1.0 y sampler `er_sde`; también se expone el sampler Euler de flow matching, equivalente al `FlowMatchEulerDiscreteScheduler` de diffusers. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución configurable (ejemplo documentado: 1024x1024).
- Inferencia en 8 pasos con guidance 1.0 (CFG desactivado), propia de la variante Turbo destilada.
- Selección de sampler: `er_sde` por defecto y `euler` mediante `--scheduler euler`.
- Control de semilla, incluidas múltiples semillas en una misma invocación de la CLI.
- Salida de metadatos (`--metadata`) y volcado de imágenes intermedias por paso (`--stepwise-image-output-dir`).
- API de Python (`from mflux.models.krea2 import Krea2`) además de la CLI `mflux-generate-krea2`.
- Ejecución local en Apple Silicon mediante MLX/Metal.
- No implementa *image conditioning* (edición o imagen de referencia) en esta versión.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión, no un modelo de lenguaje.
- Capacidad multilingüe: no documentada en esta conversión.

## Casos de uso

- Prototipado de arte conceptual en local: un estudio pequeño puede generar variaciones de una idea en un Mac con Apple Silicon, sin coste por API y sin enviar prompts a servicios externos. Los 8 pasos de la variante Turbo reducen el tiempo por imagen frente a modelos que requieren 20-50 pasos.
- Generación de imágenes por lotes para documentación y blogs: la CLI admite múltiples semillas y salida de metadatos, lo que permite producir de forma reproducible la cabecera de cada artículo desde un script.
- Creación de datasets sintéticos: se pueden generar conjuntos de imágenes etiquetadas por prompt para preentrenar o aumentar datos en tareas de visión por computador, controlando la distribución mediante las semillas y los prompts.
- Diseño de fondos y texturas para motion graphics: el modelo trabaja a 1024x1024 y su VAE de 16 canales permite generar material base que después se reescala o se compone en una herramienta de edición.
- Pruebas de concepto de producto: generar mockups de interfaz, ilustraciones de onboarding o assets para una aplicación móvil antes de contratar a un ilustrador, usando la API de Python dentro del propio pipeline de desarrollo.
- Investigación en cuantización: comparar esta build de 8 bits con la de 4 bits y con los pesos sin cuantizar del modelo base para medir la pérdida de fidelidad y el ahorro de memoria en MLX, con el mismo prompt y la misma semilla.
- Automatización de contenido editorial: integración en un cron o en un runner de CI que genere las imágenes de un boletín semanal a partir de un fichero de prompts versionado en el repositorio.
- Demostraciones offline en ferias o entornos sin conectividad: al ser un snapshot local, no requiere red ni claves de API durante la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, GenEval, HPSv2 ni mediciones de latencia o throughput, y las búsquedas web asociadas no devolvieron material técnico relacionado con el modelo.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con Metal y MLX. Este formato no es ejecutable directamente en CUDA ni en ROCm.
- Tamaño del snapshot: ~13 GB en pesos de 8 bits, según la model card (el repositorio completo ocupa 22,2 GB). Aproximadamente 4 B de esos parámetros corresponden al codificador de texto Qwen3-VL-4B.
- Memoria unificada estimada: a partir del tamaño del snapshot, se necesitan al menos ~16 GB de memoria unificada y es recomendable disponer de 24-32 GB para acomodar los pesos, las activaciones del VAE y el codificador de texto (estimación propia, no publicada por el autor).
- No cabe en GPUs de consumo con menos de 16 GB de VRAM en este formato; para GPUs NVIDIA o AMD habría que recurrir a los pesos originales del modelo base con diffusers, que no se incluyen en este repositorio.
- Despliegue: CLI `mflux-generate-krea2` y API de Python de `mflux` (`mflux.models.krea2.Krea2`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Formato y hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `toxicdog/krea-2-turbo-mflux-q8` (este) | ~13 B (8 bits, snapshot ~13 GB) | No aplica / 1024x1024 documentado | safetensors MLX, Apple Silicon | krea-2 (other) | Repositorio con 0 descargas y 0 likes |
| `krea/Krea-2-Turbo` (base) | No disponible el recuento exacto; misma familia ~13 B | No aplica / no disponible | Pesos sin cuantizar, framework no disponible | krea-2 | Modelo de referencia del que deriva esta conversión |
| Build de 4 bits del mismo modelo en mflux | No disponible | No aplica / 1024x1024 | safetensors MLX, Apple Silicon | krea-2 | Mencionada en la model card como alternativa de menor tamaño y menor fidelidad |
| FLUX.1-dev (familia MMDiT, referencia arquitectónica) | ~12 B (dato de conocimiento general, no verificado en esta búsqueda) | No aplica | safetensors, CUDA y MLX mediante conversiones de terceros | No comercial (dato no verificado) | Ampliamente distribuido |
| Qwen-Image (misma pila de VAE y linaje declarado) | No disponible en esta información | No aplica | safetensors | No disponible en esta información | No disponible en esta información |

No se dispone de comparativas de calidad (FID, CLIP, preferencia humana) entre estos modelos dentro de la información proporcionada.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación de la comunidad sobre la fidelidad de esta conversión concreta.
- Discrepancia entre el identificador del repositorio (`toxicdog/krea-2-turbo-mflux-q8`) y el comando de descarga de la model card (`hf download mflux-community/krea-2-turbo-mlx-q8`). Conviene verificar cuál es la ruta vigente antes de automatizar la descarga.
- Discrepancia de tamaño: la model card declara un snapshot de ~13 GB, mientras que el repositorio ocupa 22,2 GB.
- El contador de parámetros de Hugging Face (~3,6 B) es un artefacto del empaquetado de 8 bits; no debe usarse para planificar memoria ni para comparar con otros modelos.
- Licencia `krea-2` (etiquetada como `other`): es imprescindible revisar y aceptar los términos del modelo base antes de cualquier uso comercial. La licencia no se detalla en esta conversión.
- Solo funciona en Apple Silicon con MLX; no hay ruta de ejecución CUDA ni ROCm con estos pesos.
- El *image conditioning* (edición de imagen o imagen de referencia) no está implementado en esta versión de mflux.
- El texto renderizado dentro de las imágenes y las anatomías complejas pueden presentar artefactos, como es habitual en modelos de difusión de esta familia; no hay evaluación publicada para esta build.
- No es un modelo de lenguaje: no admite conversación, tool calling ni razonamiento multi-paso, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- No hay información sobre sesgos demográficos, estilísticos o culturales heredados del dataset de entrenamiento del modelo base.
- Los idiomas soportados no están documentados; el comportamiento multilingüe del codificador Qwen3-VL-4B no se ha verificado en esta conversión.
- La fecha de creación registrada (13/09/2026) y la ausencia de historial de actualizaciones impiden saber si el repositorio está mantenido.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/toxicdog/krea-2-turbo-mflux-q8
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Enlace de licencia indicado en la model card: https://huggingface.co/krea/Krea-2-Turbo
- Organización Krea en Hugging Face: https://huggingface.co/krea
- mflux (implementación y herramientas de conversión): https://github.com/filipstrand/mflux
- MLX de Apple: https://github.com/ml-explore/mlx
- Ruta de descarga alternativa citada en la model card: https://huggingface.co/mflux-community/krea-2-turbo-mlx-q8
