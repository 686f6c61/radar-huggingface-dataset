# sunfmin/rollmind-models

## Resumen

RollMind model packs es un repositorio de distribucion de pesos para la aplicacion iOS RollMind, una app de busqueda de fotos que funciona integramente en el dispositivo. El repositorio no entrena ningun modelo propio: agrupa cuatro artefactos derivados de modelos publicados bajo licencia Apache-2.0, convertidos a formatos ejecutables en iPhone (Core ML y MLX) y empaquetados junto a un `manifest.json` con tamanos y hashes SHA-256 para su descarga por parte de la app.

El contenido cubre tres funciones diferenciadas: deteccion y reconocimiento facial (AuraFace-v1 convertido a Core ML en fp16), extraccion de caracteristicas visuales para busqueda semantica de imagenes (torre de imagen de SigLIP2-base convertida a Core ML en fp16) y embeddings de texto multilingues (multilingual-embedding-small en dos variantes de longitud de secuencia, int8). Ademas incluye un modelo de lenguaje y vision sin modificar, Qwen3-VL-2B-Instruct en cuantizacion 4-bit para MLX, que presumiblemente aporta descripcion o razonamiento sobre las imagenes indexadas.

El interes del repositorio es acotado pero concreto: sirve como referencia de como empaquetar un pipeline multimodal completo (vision, texto, cara) para inferencia offline en iOS, con licencias permisivas y verificacion de integridad por fichero. El tamano total del repo es de 0,7 GB, coherente con pesos cuantizados de modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (agregado heterogeneo: Core ML para vision y embeddings, MLX para el LLM; arquitecturas subyacentes no detalladas en la model card) |
| Parametros totales | No disponible (el unico componente con tamano explicito es Qwen3-VL-2B-Instruct, 2B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el componente de embeddings soporta secuencias de 128 y 512 tokens; el LLM no especifica contexto) |
| Tipos de cuantizacion | fp16 (AuraFace, SigLIP2), int8 con gather (embeddings multilingues), 4-bit (Qwen3-VL-2B-Instruct) |
| Idiomas soportados | No disponible (el modelo de embeddings se denomina "multilingual"; no se detalla la lista) |
| Licencia | Apache-2.0 (con fichero NOTICE para multilingual-embedding-small) |
| Formato de pesos | Core ML (`.mlmodelc`), MLX (4-bit), tokenizer asociado; manifiesto `manifest.json` con SHA-256 |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio. Cada artefacto es una redistribucion de un modelo publicado, con la transformacion indicada en la tabla de la model card: AuraFace-v1 (`glintr100.onnx`) convertido a Core ML en fp16; la torre de imagen de `google/siglip2-base-patch16-224` convertida a Core ML en fp16; `Horizon-Labs/multilingual-embedding-small` convertido a Core ML con cuantizacion int8 y estrategia de gather, en dos variantes de secuencia (128 y 512 tokens) mas su tokenizer; y `mlx-community/Qwen3-VL-2B-Instruct-4bit` incluido sin modificaciones.

La innovacion tecnica, en la medida en que existe, es de empaquetado y despliegue: separacion de torres (solo se incluye la torre de imagen de SigLIP2, no la de texto), conversiones a Core ML para aprovechar Neural Engine en iOS, cuantizacion int8 en el modelo de embeddings para reducir huella, y un manifiesto con rutas relativas, tamanos y hashes que permite descarga incremental y verificacion de integridad. No se especifican tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO para ningun componente.

## Capacidades

- Reconocimiento facial: deteccion y extraccion de embeddings de identidad mediante AuraFace-v1 en Core ML fp16.
- Busqueda visual semantica: extraccion de caracteristicas de imagen con la torre de imagen de SigLIP2-base para indexado y recuperacion por similitud.
- Embeddings de texto multilingues: generacion de vectores de texto con `multilingual-embedding-small`, en ventanas de 128 o 512 tokens, cuantizados a int8.
- Comprension de imagen y lenguaje: el pack incluye Qwen3-VL-2B-Instruct 4-bit, que aporta capacidad de vision-lenguaje (descripcion, respuesta a preguntas sobre imagen) en el dispositivo.
- Ejecucion totalmente offline: todos los packs estan pensados para inferencia local en iOS, sin llamadas a servicios externos.
- Verificacion de integridad: `manifest.json` con SHA-256 por fichero para validar descargas.
- No disponible: soporte de tool calling, modo agente, audio, thinking mode explicito o lista cerrada de idiomas.

## Casos de uso

- Busqueda de fotos por lenguaje natural en el iPhone: la torre de imagen de SigLIP2 genera embeddings de cada foto del carrito y la de texto (multilingual-embedding-small) genera el vector de la consulta; la similitud entre ambos permite recuperar imagenes sin subir nada a la nube.
- Agrupacion de personas en la fototeca: AuraFace-v1 extrae embeddings faciales que permiten clusterizar rostros y etiquetar personas localmente, util para apps de gestion de recuerdos con privacidad estricta.
- Descripcion automatica de imagenes: Qwen3-VL-2B-Instruct puede generar pies de foto o etiquetas en el dispositivo, que despues se indexan con el modelo de embeddings de texto para busqueda por palabras clave.
- Indexado incremental sin conexion: el manifiesto con rutas, tamanos y hashes permite a la app descargar solo los packs necesarios (por ejemplo, solo el de embeddings de texto de 128 tokens si el dispositivo tiene poca RAM) y validar cada fichero antes de usarlo.
- Prototipado de pipelines multimodales en iOS: el repositorio sirve como plantilla de conversion ONNX/PyTorch a Core ML con cuantizacion fp16 e int8, reutilizable para otras apps que necesiten vision y texto on-device.
- Cumplimiento de privacidad en sectores regulados: al no requerir red, el pipeline es apto para entornos donde las fotos no pueden salir del dispositivo (salud, legal, fotografia profesional bajo NDA).
- Distribucion de modelos en apps App Store: el patron de manifest con SHA-256 y licencias incluidas (`LICENSES/APACHE-2.0.txt`) facilita la trazabilidad de licencias de terceros en una app comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma desagregada; el repo completo ocupa 0,7 GB, por lo que la huella en disco es inferior a 1 GB.
- Componente mas exigente: Qwen3-VL-2B-Instruct en 4-bit, que por tamano de parametros requiere del orden de 1,5-2 GB de memoria para pesos, mas overhead de activaciones y KV cache (estimacion por tamano, no confirmada por el autor).
- GPU/SoC recomendados: Apple Silicon con Neural Engine (iPhone/iPad recientes) para los packs Core ML; el pack MLX requiere hardware Apple compatible con MLX.
- Cabe en GPU de consumo: si, en el sentido de que esta disenado para movil; no se documentan requisitos para A100, H100 o RTX 4090 porque el objetivo es iOS.
- Opciones de despliegue: Core ML (packs `.mlmodelc`) y MLX (pack 4-bit); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| RollMind model packs | No disponible (Qwen3-VL-2B incluido) | No disponible | Core ML + MLX | Apache-2.0 | Pipeline multimodal on-device para iOS |
| Qwen/Qwen3-VL-2B-Instruct | 2B | No disponible en esta ficha | safetensors, MLX, GGUF | Apache-2.0 | Vision-lenguaje generalista |
| google/siglip2-base-patch16-224 | ~0,1B (torre de imagen) | No aplica | PyTorch, Core ML (aqui) | Apache-2.0 | Embeddings imagen-texto |
| Horizon-Labs/multilingual-embedding-small | No disponible | 128/512 tokens (aqui) | Core ML (aqui) | Apache-2.0 | Embeddings de texto multilingues |

La comparativa directa no es posible: RollMind no es un modelo sino un agregado de artefactos derivados de los tres modelos de la tabla, por lo que sus metricas heredadas serian las de los originales, no publicadas en esta informacion.

## Limitaciones y advertencias

- No es un modelo entrenado: cualquier evaluacion de calidad debe hacerse sobre los modelos originales (AuraFace-v1, SigLIP2-base, multilingual-embedding-small, Qwen3-VL-2B-Instruct), no sobre este repositorio.
- Sin benchmarks ni evaluaciones publicadas en la model card; no hay evidencia de rendimiento en el dispositivo.
- Sin datos de sesgo, alucinacion o robustez para ningun componente.
- El reconocimiento facial conlleva implicaciones legales y eticas (RGPD, consentimiento, categorias especiales de datos); la licencia Apache-2.0 del modelo no cubre el cumplimiento normativo del uso.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el fichero NOTICE de multilingual-embedding-small y las atribuciones de cada modelo original.
- El pack incluye solo la torre de imagen de SigLIP2, no la de texto: no se puede usar como modelo imagen-texto completo tal cual.
- La cuantizacion 4-bit de Qwen3-VL-2B y la int8 de los embeddings degradan precision respecto a los originales en fp16/fp32; no se documenta la magnitud de la perdida.
- Dependencia de formatos propietarios de Apple (Core ML) y de MLX: no portable a Linux/Windows sin reconversion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sunfmin/rollmind-models
- AuraFace-v1: https://huggingface.co/fal/AuraFace-v1
- SigLIP2-base-patch16-224: https://huggingface.co/google/siglip2-base-patch16-224
- Multilingual-embedding-small: https://huggingface.co/Horizon-Labs/multilingual-embedding-small
- Qwen3-VL-2B-Instruct (MLX 4-bit): https://huggingface.co/mlx-community/Qwen3-VL-2B-Instruct-4bit
- Qwen3-VL-2B-Instruct (original): https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
