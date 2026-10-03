# vermatushar/siglip2-base-coreml

## Resumen

SigLIP 2 B/16-256 Core ML es una conversion a Core ML del modelo google/siglip2-base-patch16-256, publicada por el usuario vermatushar para su uso en Lenora, una herramienta de busqueda de footage de video. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado de los pesos originales de Google en formato Core ML, dividido en dos torres independientes: un codificador de imagen (entrada 256x256) y un codificador de texto (entrada de 64 tokens). Ambos emiten embeddings de 768 dimensiones normalizados en L2, de modo que la similitud entre imagen y texto se calcula con un simple producto escalar.

El modelo subyacente, SigLIP 2, es una familia de codificadores vision-lenguaje multilingues desarrollada por Google que mejora el objetivo contrastivo del SigLIP original incorporando tecnicas como preentrenamiento basado en captioning y perdidas auto-supervisadas (auto-destilacion y prediccion enmascarada). A diferencia de un LLM, no genera texto: es un modelo de representacion (embedding) pensado para recuperacion texto-imagen, clasificacion zero-shot y similitud entre modalidades.

La relevancia de esta ficha concreta radica en su orientacion a inferencia local en Apple silicon: al estar en Core ML con palettizacion de 8 bits, permite busqueda de imagenes y video por texto sin enviar datos a la nube, con un objetivo de despliegue minimo de macOS 15. El repositorio ocupa aproximadamente 0.4 GB y la conversion esta validada por paridad numerica contra la referencia de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder vision-lenguaje (dos torres separadas: imagen y texto), basada en SigLIP 2 y convertida a Core ML |
| Parametros totales | no disponible (variante base B/16; embeddings de 768 dimensiones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 64 tokens en el codificador de texto |
| Tipos de cuantizacion | Palettizacion de 8 bits (per-grouped-channel) en Core ML; los pesos originales de PyTorch a precision completa |
| Idiomas soportados | no disponible en esta ficha; el SigLIP 2 original de Google se describe como multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage dentro de .zip); tokenizer Gemma SentencePiece en `tokenizer.zip` |

## Arquitectura y entrenamiento

La arquitectura de este repositorio es un dual encoder derivado de SigLIP 2: una torre de vision (ViT con parches de 16x16 y resolucion de entrada 256x256) y una torre de texto, ambas proyectando a un espacio comun de 768 dimensiones. En la conversion a Core ML se han separado en dos artefactos independientes (`ImageEncoder.mlpackage.zip` y `TextEncoder.mlpackage.zip`) para permitir recuperacion texto-imagen en dispositivo, ejecutando cada torre por separado y comparando los embeddings resultantes. La similitud se obtiene como producto escalar de vectores normalizados en L2.

El entrenamiento del modelo base corresponde a SigLIP 2, cuya receta unifica el objetivo contrastivo original con tecnicas previamente desarrolladas de forma independiente: preentrenamiento basado en captioning, perdidas auto-supervisadas (auto-destilacion y prediccion enmascarada) y soporte multilingue. Este repositorio no aporta entrenamiento adicional, sino una conversion de formato con palettizacion de 8 bits. El detalle tecnico relevante de la conversion es que esta validada por paridad: cada release garantiza que los embeddings coinciden con la referencia de PyTorch con un coseno igual o superior a 0.99 sobre un conjunto de pruebas fijo. El preprocesado de imagen es un squash-resize a 256x256 sin recorte central, con pixeles escalados al rango [-1, 1], y el texto debe tokenizarse con el tokenizer Gemma incluido y rellenarse (padding) hasta 64 tokens con el token de padding (0) y sin mascara de atencion.

## Capacidades

- Recuperacion texto-imagen (text-to-image retrieval): genera embeddings comparables para consultas de texto e imagenes y permite ordenar un corpus visual por similitud.
- Recuperacion imagen-texto y busqueda cruzada entre modalidades.
- Clasificacion zero-shot de imagenes mediante comparacion contra etiquetas textuales (por ejemplo, ImageNet zero-shot).
- Calculo de similitud imagen-texto como producto escalar sobre embeddings normalizados de 768 dimensiones.
- Capacidad multilingue heredada del SigLIP 2 original (no confirmada de forma especifica en esta conversion).
- Inferencia totalmente en dispositivo sobre Apple silicon mediante Core ML.
- No soporta generacion de texto: no es un modelo causal de lenguaje.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso.
- No procesa audio ni video de forma nativa; el video debe muestrearse en fotogramas y tratarse como imagenes.

## Casos de uso

- Busqueda de footage de video por descripcion textual: es el caso para el que se creo el repositorio (Lenora). Se extraen fotogramas, se calculan sus embeddings con el codificador de imagen y se indexan; cada consulta textual se codifica con la torre de texto y se recuperan los fotogramas mas similares por producto escalar.
- Busqueda de fotos en una aplicacion de escritorio para macOS: integracion en un catalogo local de imagenes donde el usuario escribe una consulta y la app devuelve coincidencias sin conexion a Internet, aprovechando el despliegue minimo de macOS 15.
- Etiquetado automatico de bibliotecas de imagenes: asignacion de categorias textuales candidatas a cada imagen mediante clasificacion zero-shot, util para organizar archivos o activos multimedia.
- Deduplicacion y agrupamiento visual: agrupacion de imagenes o fotogramas similares usando los embeddings como representacion vectorial para clustering.
- Moderacion o filtrado de contenido: comparacion de imagenes contra un conjunto de descripciones textuales sensibles para marcar candidatos, siempre como filtro auxiliar.
- Recuperacion aumentada en asistentes locales: dado que corre en el dispositivo, se puede usar como modulo de busqueda visual dentro de una app que ya gestione texto, sin exponer datos a servicios externos.
- Prototipado rapido en Xcode: su formato Core ML permite integrar el modelo directamente en una app de Apple y probar flujos de recuperacion visual en fases tempranas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de recuperacion, y no se dispone de cifras de rendimiento para esta conversion concreta mas alla de la garantia de paridad (coseno >= 0.99 frente a la referencia de PyTorch sobre un conjunto de pruebas fijo). El modelo base SigLIP 2 cuenta con evaluaciones en el paper asociado, pero no se reproducen aqui para no inventar cifras.

## Requisitos de hardware

- Plataforma objetivo: Apple silicon con macOS 15 o superior (requisito declarado por el autor). No se indica soporte para iOS ni para GPU CUDA.
- VRAM: no disponible. Al ser un modelo base con embeddings de 768 dimensiones y formato Core ML palettizado a 8 bits, esta pensado para ejecutarse en memoria unificada de equipos Apple, no en VRAM de GPU dedicada.
- Tamano del repositorio: aproximadamente 0.4 GB, lo que da una idea del espacio en disco necesario para los artefactos.
- GPU recomendadas: no aplica para esta conversion (Core ML sobre GPU/Neural Engine de Apple silicon). Para ejecutar el modelo base original en PyTorch si serian necesarias GPUs NVIDIA, pero no se proporciona una recomendacion concreta.
- Opciones de despliegue: Core ML en macOS 15 (uso previsto). El modelo base google/siglip2-base-patch16-256 puede ejecutarse con transformers de Hugging Face y como modelo de pooling en vLLM (`llm.embed()` o `/v1/embeddings`), segun la documentacion publica consultada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vermatushar/siglip2-base-coreml (este) | Dual encoder SigLIP 2 | Core ML (.mlpackage) | no disponible (base B/16, 768-d) | 64 tokens / imagen 256x256 | Apache 2.0 | Hugging Face, 0 descargas |
| google/siglip2-base-patch16-256 | Dual encoder SigLIP 2 original | PyTorch / safetensors | no disponible (base B/16) | 64 tokens / imagen 256x256 | Apache 2.0 | Hugging Face (modelo base) |
| karaiman/siglip2-base-coreml | Conversion Core ML equivalente | Core ML | no disponible | no disponible | Apache 2.0 | Hugging Face |
| nufrnd/lvc-siglip2-base-coreml | Conversion Core ML para Lossless Video Cutter | Core ML | no disponible | no disponible | Apache 2.0 | Hugging Face |

El detalle diferencial de este repositorio frente a las otras dos conversiones Core ML detectadas es su proposito declarado (busqueda de footage en Lenora), la division explicita en dos torres con embeddings de 768 dimensiones y la validacion por paridad con coseno >= 0.99. Los parametros exactos de la variante base no se especifican en la informacion disponible para ninguno de los tres.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas; solo genera embeddings. Cualquier expectativa de uso como chatbot o asistente conversacional es incorrecta.
- El codificador de texto tiene una ventana fija de 64 tokens, lo que limita la longitud de las consultas y obliga a rellenar con el token de padding (0) sin mascara de atencion; un padding distinto al esperado degrada los embeddings.
- Requiere macOS 15 o superior y Apple silicon; no esta pensado para entornos Linux con GPU NVIDIA ni para despliegue en servidor con CUDA.
- La palettizacion de 8 bits introduce una perdida de precision respecto a los pesos originales, aunque acotada por la garantia de paridad (coseno >= 0.99 sobre un conjunto de pruebas fijo, no sobre todos los casos posibles).
- Los archivos son inmutables una vez publicados: las reconversiones se publican como versiones nuevas y nunca sobrescriben las existentes, lo que puede complicar el versionado en produccion.
- Adopcion practicamente nula: 0 descargas y 0 likes, sin validacion de la comunidad ni informes independientes de calidad.
- No hay datos publicados de sesgos, alucinacion ni rendimiento por idioma para esta conversion; el comportamiento multilingue depende del modelo base y no se verifica aqui.
- Licencia Apache 2.0, la misma que los pesos originales de Google, lo que en principio permite uso comercial; se recomienda verificar los terminos del modelo base google/siglip2-base-patch16-256 antes de un despliegue en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vermatushar/siglip2-base-coreml
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-256
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Codigo fuente de la conversion (Lenora, app/models/siglip2): https://github.com/vermatushar/Lenora/tree/main/app/models/siglip2
- Proyecto Lenora: https://github.com/vermatushar/Lenora
- Conversion Core ML equivalente (karaiman): https://huggingface.co/karaiman/siglip2-base-coreml
- Conversion Core ML para Lossless Video Cutter (nufrnd): https://huggingface.co/nufrnd/lvc-siglip2-base-coreml
- Implementacion en transformers (modeling_siglip2.py): https://github.com/huggingface/transformers/blob/main/src/transformers/models/siglip2/modeling_siglip2.py
- Documentacion de SigLIP2 en vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/SigLIP2.html
