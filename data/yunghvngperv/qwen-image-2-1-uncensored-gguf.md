# yunghvngperv/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una reempaquetado en formato GGUF y otras cuantizaciones del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicado por el usuario yunghvngperv. Se trata de un modelo de difusión para text-to-image que conserva los pesos base del modelo original de Qwen, pero redistribuido en múltiples formatos cuantizados (GGUF, safetensors FP8, INT8, NVFP4 y MLX) para facilitar su ejecución en hardware de consumo mediante ComfyUI y ComfyUI-GGUF.

El modelo cuenta con aproximadamente 7.115 millones de parámetros y está pensado para generar imágenes a partir de descripciones textuales. La etiqueta "Uncensored" indica que se han eliminado o relajado los filtros de contenido del modelo original, lo que amplía el rango de prompts aceptados pero también conlleva implicaciones éticas y legales que el usuario debe valorar.

Su relevancia actual radica en la combinación de un modelo de generación de imágenes de calidad con un ecosistema de cuantizaciones que permite ejecutarlo en GPUs de gama media y en equipos Apple Silicon (mediante MLX), reduciendo los requisitos de VRAM respecto al modelo completo en BF16. La licencia qwen-research restringe el uso, por lo que no es apta para producción comercial sin autorización expresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image (no se especifica el tipo exacto en la informacion disponible) |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (other) |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen-Image-2.1 mas alla de que se trata de un modelo de generacion de imagenes a partir de texto (pipeline text-to-image). El repositorio se limita a ofrecer cuantizaciones del modelo original, por lo que no se describen datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO.

El proceso de cuantizacion aplicado por el autor incluye formatos GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0), safetensors en FP8, INT8 ConvRot y NVFP4, asi como variantes MLX para Apple Silicon. El repositorio tambien incluye los componentes auxiliares necesarios: un text encoder basado en Qwen3VL de 8B (en BF16 o INT8) y un VAE especifico (qwen_image_2.1_vae_bf16). La variante "Uncensored" implica que se ha modificado el comportamiento del modelo original para reducir el rechazo de determinados prompts, aunque no se especifica la metodologia exacta empleada.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Ejecucion local mediante ComfyUI y el nodo ComfyUI-GGUF.
- Compatibilidad con el text encoder Qwen3VL de 8B, lo que sugiere capacidad de comprension de prompts complejos y posible soporte multimodal en la codificacion de entrada.
- Multiples niveles de cuantizacion para adaptarse a distintos presupuestos de VRAM.
- Variante "Uncensored" que amplia el rango de prompts aceptados en comparacion con el modelo base.
- Soporte de MLX para equipos con Apple Silicon.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades adicionales.

## Casos de uso

- Generacion de ilustraciones y concept art: artistas y disenadores pueden usar el modelo en ComfyUI para producir imagenes a partir de descripciones detalladas, aprovechando la cuantizacion Q4_K_M para ejecutarlo en GPUs de gama media.
- Prototipado visual rapido: equipos de producto pueden generar bocetos e ideas visuales iterando sobre prompts antes de encargar trabajo a un ilustrador humano.
- Creacion de assets para videojuegos: generacion de texturas, fondos y elementos decorativos sin restricciones de contenido, util en fases de preproduccion.
- Experimentacion en investigacion generativa: investigadores pueden estudiar el comportamiento de un modelo de difusion cuantizado en distintos niveles de precision comparando Q8_0 frente a Q4_0.
- Pruebas de pipelines ComfyUI: desarrolladores que construyen flujos de trabajo con GGUF pueden usar este modelo como referencia para validar la integracion de nodos de difusion, text encoder y VAE.
- Despliegue en Apple Silicon: la variante MLX 4-bit permite generar imagenes en portatiles Mac con memoria unificada limitada, sin necesidad de una GPU dedicada.
- Generacion de contenido artistico sin filtros previos: estudios creativos que trabajan con tematicas adultas o sensibles pueden emplear la variante Uncensored, asumiendo la responsabilidad legal y etica correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una referencia grafica a un benchmark del modelo base (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se aportan valores numericos ni tablas comparativas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos del transformer): aproximadamente 4,0-4,6 GB para Q4_0/Q4_K_M; 5,2-5,9 GB para Q5_K_M/Q6_K; 7,6 GB para Q8_0; 14,2 GB para BF16.
- El text encoder Qwen3VL 8B anade requisitos adicionales: 17,53 GB en BF16 o 9,35 GB en INT8, mas el VAE (676 MB).
- GPU recomendadas: no especificadas por el autor. Por tamanos de cuantizacion, un modelo Q4_K_M con text encoder INT8 podria caber en GPUs consumer con 12-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080); las variantes BF16 requeririan GPUs de 24 GB o superiores.
- Compatibilidad con consumer GPU: probable en las cuantizaciones mas bajas (Q4_0, Q4_K_M, NVFP4, MLX 4-bit), aunque no se aportan mediciones oficiales.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork mantenido de leejet), y MLX para Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-GGUF | 7.115.124.736 | GGUF, safetensors, MLX | qwen-research | Version cuantizada y sin censura del modelo base |
| Qwen/Qwen-Image-2.1 | no disponible | safetensors (original) | qwen-research | Modelo base oficial de Qwen |
| Otras alternativas de text-to-image | no disponible | no disponible | no disponible | No se dispone de informacion comparativa en los datos aportados |

No se dispone de datos suficientes para establecer una comparativa rigurosa con otros modelos de generacion de imagenes de la misma categoria.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es necesario revisar los terminos completos antes de cualquier despliegue en produccion.
- La etiqueta "Uncensored" implica la ausencia o relajacion de filtros de contenido, lo que puede generar material ofensivo, ilegal o inapropiado; el responsable del uso asume las consecuencias legales y eticas.
- Riesgo de sesgos heredados del modelo base, que no se documentan en la informacion disponible.
- Riesgo de alucinacion visual: los modelos de difusion pueden generar artefactos, incoherencias anatomicas o elementos no solicitados en los prompts.
- No se especifican los idiomas soportados para los prompts; se desconoce si el text encoder Qwen3VL 8B ofrece un rendimiento equilibrado en castellano.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Las cuantizaciones mas agresivas (Q4_0, NVFP4, MLX 4-bit) pueden degradar la calidad de la imagen generada; no se aportan comparativas objetivas.
- La compatibilidad esta ligada mayoritariamente a ComfyUI y su ecosistema; otros runners pueden requerir adaptaciones.
- El autor indica que si se usa el fork antiguo city96/ComfyUI-GGUF puede aparecer el error "Unknown model architecture!", lo que exige emplear la bifurcacion de leejet o modificar manualmente el codigo.
- El repositorio ocupa 105,2 GB, lo que implica un coste de almacenamiento y ancho de banda considerable al descargar el conjunto completo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/yunghvngperv/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- Repositorio alternativo citado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF (referenciado en los enlaces internos; el autor indica que los archivos se alojan directamente en el repositorio actual)
