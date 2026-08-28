# Wesley1234/SenseNova-U1.5-Comfy

## Resumen

SenseNova U1.5 es un modelo de generación y edición de imágenes desarrollado por SenseTime, presentado como parte de la familia SenseNova. Este repositorio concreto (`Wesley1234/SenseNova-U1.5-Comfy`) es una conversión comunitaria no oficial que reempaqueta los pesos oficiales de SenseNova-U1.5-8B-MoT (versión Final y SFT) en un único archivo `safetensors` para su uso directo en ComfyUI, evitando la necesidad de gestionar múltiples shards o de usar el pipeline de Diffusers. El modelo base emplea una arquitectura unificada de comprensión y generación multimodal (NEO-unify), con un tamaño nominal de 8 mil millones de parámetros según su nomenclatura. Su relevancia actual radica en que permite a los usuarios de ComfyUI acceder a un modelo de generación de imágenes de alta resolución (hasta 2048×2048 o superior) con capacidades de edición multi-referencia, sin depender de infraestructura propietaria.

La conversión incluye dos variantes: la versión Final (disponible en BF16 completo y en precisión mixta heredada) y la versión SFT (ajuste fino supervisado). Ambas soportan generación de texto a imagen y edición de imágenes con una o múltiples referencias (de 1 a 10), así como la generación de múltiples resultados por petición. El modelo se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para el ecosistema ComfyUI mediante un nodo wrapper específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify (unificacion multimodal de comprension y generacion) |
| Parametros totales | 8B (segun nomenclatura del modelo, no confirmado en documentacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | BF16 (version nueva), FP16/mixta (version heredada) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un solo archivo por variante) |

## Arquitectura y entrenamiento

La arquitectura subyacente de SenseNova U1.5 se describe en el articulo "SenseNova-U1: Unifying Multimodal Understanding and Generation with NEO-unify Architecture". Se trata de un modelo de difusion multimodal que unifica tareas de comprension y generacion de imagenes en una sola red. La documentacion proporcionada no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. Se sabe que existen dos etapas de entrenamiento: una version "Final" (el modelo base) y una version "SFT" (ajuste fino supervisado adicional). La version SFT se presenta como un modelo independiente que no debe combinarse con el LoRA de 8 pasos, mientras que la version Final admite un LoRA oficial de 8 pasos para acelerar la generacion. No se dispone de informacion sobre innovaciones tecnicas especificas mas alla de la arquitectura unificada y el soporte para edicion multi-referencia.

## Capacidades

- Generacion de texto a imagen (text-to-image) con resoluciones nativas de hasta 2048×2048 y proporciones personalizadas (1:1, 16:9, 9:16, 2:3, 3:2).
- Edicion de imagenes con una sola imagen de referencia (img_cfg=1) o con multiples referencias (de 1 a 10 imagenes), donde cada referencia se etiqueta como `Image-1`, `Image-2`, etc., y se puede asignar un rol especifico en el prompt.
- Generacion de multiples resultados (de 1 a 16) a partir de un mismo prompt y conjunto de referencias, utilizando ruido aleatorio independiente para cada resultado.
- Soporte para el `KSampler` nativo de ComfyUI en modos de generacion y edicion con `img_cfg=1`.
- Modo de edicion avanzado con `img_cfg` distinto de 1, que requiere el nodo `SenseNova Edit Guider` y `SamplerCustomAdvanced`.
- Aceleracion mediante LoRA oficial de 8 pasos (solo para la version Final), que reduce el numero de pasos de 50 a 8 para generacion de texto a imagen.
- Control fino de la generacion mediante parametros como CFG, CFG norm, intervalo de CFG, shift y prompts estructurados.
- Gestion eficiente de memoria en ComfyUI: soporte de descarga de VRAM y carga con bajo consumo de memoria para GPUs limitadas.
- Reutilizacion de cache KV para el prefijo de texto y referencias en generacion por lotes, mejorando el rendimiento en produccion.

## Casos de uso

- Generacion de imagenes para diseno grafico y publicidad: el modelo permite crear ilustraciones, carteles o infografias a partir de prompts detallados en ingles o chino, con resoluciones de hasta 2048×2048, adecuadas para impresion o medios digitales. Su capacidad para generar texto legible dentro de la imagen (como titulos o etiquetas) lo hace util para piezas que requieren tipografia integrada.
- Edicion de imagenes de producto con referencia unica: un usuario puede proporcionar una foto de un producto y pedir al modelo que lo coloque en un nuevo fondo o cambie su iluminacion, usando el modo de edicion con `img_cfg=1`. Esto es aplicable en catalogos de e-commerce o presentaciones comerciales.
- Cambio de vestuario en fotografia de moda: con el flujo de edicion multi-referencia, se puede usar `Image-1` para la persona y `Image-2` para la prenda, generando una imagen de la persona vistiendo esa prenda. Es util para probadores virtuales o campañas de moda sin sesiones fotograficas adicionales.
- Creacion de variaciones de diseno para brainstorming: el modo de generacion multiple (1-16 resultados) permite explorar rapidamente distintas composiciones, estilos o paletas de color a partir de un mismo prompt, acelerando el proceso creativo en estudios de diseno.
- Generacion de contenido para redes sociales en chino e ingles: al soportar ambos idiomas, el modelo puede producir imagenes con texto integrado en cualquiera de los dos, ideal para crear publicaciones localizadas sin herramientas externas de edicion.
- Prototipado de interfaces o ilustraciones tecnicas: gracias a su capacidad de edicion multi-referencia, se pueden combinar elementos de varias imagenes (por ejemplo, un boceto y una textura) para generar un prototipo visual coherente, util en diseno de producto o documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del repositorio no incluye metricas como FID, CLIP score, MMLU u otras comparaciones con modelos similares. Se recomienda consultar el articulo academico de SenseNova-U1 para posibles evaluaciones, aunque no se proporcionan datos concretos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo BF16 pesa aproximadamente 35 GB, por lo que se necesita al menos 40 GB de VRAM para cargar el modelo completo en memoria. La version de precision mixta heredada pesa unos 50 GB, requiriendo al menos 60 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), H100 (80 GB), RTX 6000 Ada (48 GB) o superiores. En GPUs de consumo como RTX 4090 (24 GB) no es posible cargar el modelo completo sin tecnicas de offloading.
- El nodo de ComfyUI incluye soporte para descarga de VRAM y carga con bajo consumo de memoria, lo que permite ejecutar el modelo en GPUs con menos VRAM a costa de mayor latencia y posible uso de memoria RAM como respaldo.
- Opciones de despliegue: exclusivamente a traves de ComfyUI con el nodo `SenseNova U1.5 (T8)` (version 1.3.5 o superior). No se proporcionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que el modelo no es de texto.
- Latencia y throughput: no se han publicado mediciones oficiales. Con 50 pasos y resolucion 2048×2048, se espera un tiempo de generacion de varios minutos en GPUs de gama alta, aunque el LoRA de 8 pasos reduce significativamente el tiempo para generacion de texto a imagen.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de generacion de imagenes de tamano similar (por ejemplo, SDXL, FLUX.1-dev o modelos propietarios de SenseTime). La informacion disponible no incluye benchmarks estandarizados ni comparaciones directas. Se recomienda evaluar el modelo en casos de uso especificos para determinar su idoneidad frente a alternativas como:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SenseNova U1.5 (este) | 8B (nominal) | no aplica | Apache 2.0 | ComfyUI (conversion comunitaria) |
| SDXL | 2.6B | no aplica | OpenRAIL | Multiplataforma (Diffusers, ComfyUI) |
| FLUX.1-dev | 12B | no aplica | Apache 2.0 | Multiplataforma (Diffusers, ComfyUI) |

Sin datos de rendimiento, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Este repositorio es una conversion comunitaria no oficial; los pesos no han sido modificados, pero el empaquetado y la integracion con ComfyUI son responsabilidad de la comunidad, no de SenseTime.
- El modelo solo es compatible con ComfyUI mediante el nodo especifico `SenseNova U1.5 (T8)`. No funciona como checkpoint estandar de SD/SDXL ni como directorio de Diffusers.
- La documentacion advierte que cargar los pesos de forma incorrecta (por ejemplo, ignorando la validacion de claves) puede provocar imagenes borrosas, con alteraciones de color o que no sigan el prompt.
- Los idiomas soportados son exclusivamente ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- No se ha publicado informacion sobre sesgos, alucinaciones visuales o riesgos de contenido inapropiado. Como modelo de generacion de imagenes, puede producir contenido no deseado si se le pide explicitamente.
- El tamano de los archivos (35-50 GB) implica requisitos de almacenamiento y memoria considerables, lo que limita su uso en entornos con recursos limitados.
- La version SFT no admite el LoRA de 8 pasos; usarlo con SFT puede producir resultados incorrectos.
- No se proporcionan garantias de soporte a largo plazo ni actualizaciones oficiales para esta conversion.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Wesley1234/SenseNova-U1.5-Comfy
- Repositorio HuggingFace original de la conversion (t8star): https://huggingface.co/t8star/SenseNova-U1.5-Comfy
- Repositorio HuggingFace de la conversion alternativa (taurusduan): https://huggingface.co/taurusduan/SenseNova-U1.5-Comfy
- Nodo de ComfyUI (GitHub): https://github.com/T8mars/Comfyui-SenseNova-U1.5-Wrapper-T8
- Nodo de ComfyUI (Comfy Registry): https://registry.comfy.org/nodes/sensenova-u15-t8
- Articulo academico (arXiv): https://arxiv.org/abs/2605.12500 (segun etiquetas del modelo)
- Noticia en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-16-sensenova-u1-5-comfyui
- Repositorio GitHub de OpenSenseNova (ComfyUI-SenseNova-U1): https://github.com/OpenSenseNova/ComfyUI-SenseNova-U1
