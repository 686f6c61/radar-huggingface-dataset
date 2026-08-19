# terminusresearch/pixart-900m-1024-ft-v0.7-stage1

## Resumen

PixArt-900m-1024-ft-v0.7-stage1 es un modelo de texto a imagen desarrollado por terminusresearch, derivado de un fine-tuning completo (full rank finetune) sobre el modelo base ptx0/pixart-900m-1024-ft-v0.7-stage1. Se trata de un modelo de difusión basado en la arquitectura PixArt-Σ, con aproximadamente 908 millones de parámetros, especializado en la generación de imágenes a 1024×1024 píxeles. El modelo está diseñado para el pipeline PixArtSigmaPipeline de la librería diffusers.

Este modelo forma parte de una serie de fine-tunings iterativos (v0.6, v0.7-stage1, v0.7-stage2) que buscan mejorar la calidad de generación en dominios específicos como fantasía, ciencia ficción, cyberpunk y escenas detalladas. Su relevancia radica en que ofrece una alternativa de tamaño medio (900M) frente a modelos más grandes como SDXL o SD3, con una licencia OpenRAIL-M que permite uso comercial bajo condiciones. El repositorio ocupa aproximadamente 2 TB, lo que sugiere que incluye múltiples formatos de pesos y checkpoints de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PixArt-Σ (Diffusion Transformer, DiT) |
| Parametros totales | 908.433.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, sin contexto textual explicito) |
| Tipos de cuantizacion | no disponible (repositorio incluye safetensors; no se especifican cuantizaciones) |
| Idiomas soportados | no disponible (model card no especifica; prompts en ingles en ejemplos) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors, diffusers |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura PixArt-Σ, un Diffusion Transformer (DiT) que utiliza un transformer en lugar de U-Net como backbone de difusion. PixArt-Σ introduce mejoras sobre PixArt-α, como una mayor eficiencia en el entrenamiento mediante la reutilizacion de componentes preentrenados y una mejor gestion de la resolucion. Este checkpoint concreto es un fine-tuning completo (full rank finetune) derivado de ptx0/pixart-900m-1024-ft-v0.7-stage1, entrenado con la herramienta SimpleTuner.

El proceso de entrenamiento es iterativo: la serie v0.6 → v0.7-stage1 → v0.7-stage2 indica que cada etapa parte del checkpoint anterior. El prompt de validacion principal usado durante el entrenamiento fue "ethnographic photography of teddy bear at a picnic, ears tucked behind a cozy hoodie looking darkly off to the stormy picnic skies", con configuracion de validacion CFG 4.5, CFG Rescale 0.0 y 25 pasos. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de imagenes de alta resolucion (1024×1024) a partir de prompts textuales.
- Manejo de prompts complejos con multiples elementos: escenas, personajes, atmosferas y estilos.
- Soporte de negative prompts para evitar artefactos como "blurry, cropped, ugly".
- Especializacion en estilos fantasticos, cyberpunk, medieval, post-apocaliptico y ciencia ficcion.
- Capacidad para generar texto dentro de la imagen (segun ejemplos del widget: comic strips, portadas de libros, carteles neon).
- Integracion nativa con el pipeline PixArtSigmaPipeline de diffusers.
- Generacion "unconditional" (prompt en blanco) para exploracion libre.

## Casos de uso

- **Concept art para videojuegos**: el modelo puede generar escenarios de fantasia, ciencia ficcion y cyberpunk con alto detalle, util para preproduccion de niveles, personajes y entornos. Su resolucion de 1024 permite obtener bocetos directamente utilizables como referencia.

- **Ilustracion editorial y portadas**: la capacidad de generar escenas complejas con atmosferas definidas (neon, medieval, post-apocaliptico) lo hace adecuado para portadas de libros, revistas o articulos que requieren imagenes originales sin derechos de autor.

- **Generacion de assets para produccion audiovisual**: storyboards, fondos de escena o imagenes de referencia para animacion y VFX. El modelo puede producir variaciones rapidas de una misma escena cambiando el prompt, acelerando la exploracion creativa.

- **Marketing y publicidad**: generacion de imagenes para campanas tematicas (fantasia, tecnologia, naturaleza) sin depender de bancos de imagenes. La licencia OpenRAIL-M permite uso comercial con restricciones.

- **Prototipado de diseno de producto**: visualizacion rapida de conceptos como "mochila cyberpunk" o "silla de estilo medieval" para presentaciones a clientes o equipos de diseno.

- **Creacion de contenido para redes sociales**: generacion de imagenes llamativas para publicaciones tematicas (fantasia, ciencia ficcion) con prompts en ingles, el idioma principal soportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas como FID, CLIP score ni comparaciones con otros modelos. Tampoco se encontraron evaluaciones independientes en la busqueda web.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente. Para un modelo de 900M parametros en FP16, el checkpoint ocupa aproximadamente 1,8 GB, pero la inferencia de difusion requiere memoria adicional para el ruido latente y las activaciones intermedias. Se estima un minimo de 8 GB VRAM para generar a 1024×1024 con diffusers.
- **GPU recomendadas**: RTX 3060 12GB, RTX 4070, RTX 4090, A100, H100. Modelos con menos de 8 GB VRAM pueden requerir atencion por tramos o reduccion de resolucion.
- **Consumer GPU**: si, cabe en GPUs de consumo con 8 GB o mas (RTX 3060, RTX 4060 Ti, etc.).
- **Opciones de despliegue**: diffusers (pipeline PixArtSigmaPipeline), Hugging Face Inference Endpoints, Replicate, o servicios cloud con GPUs.
- **Latencia y throughput**: no disponible. Depende del hardware y del numero de pasos de inferencia (tipicamente 20-50 pasos con sampler DPM++ o similar).

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Notas |
|---|---|---|---|---|
| PixArt-900m-1024-ft-v0.7-stage1 | 908M | 1024×1024 | OpenRAIL-M | Fine-tuning especializado en fantasia/cyberpunk |
| PixArt-Σ (base) | 900M | 1024×1024 | OpenRAIL-M | Modelo base sin fine-tuning, mas generalista |
| SDXL | 3.5B | 1024×1024 | OpenRAIL-M | Mayor capacidad, mejor calidad general, mas pesado |
| SD 1.5 | 860M | 512×512 | OpenRAIL-M | Mas ligero, menor resolucion, amplio ecosistema |

El modelo compite directamente con SDXL en resolucion, pero con menos parametros, lo que puede traducirse en menor calidad para estilos generalistas. Su ventaja esta en la especializacion: si el caso de uso coincide con los dominios del fine-tuning (fantasia, cyberpunk, escenas detalladas), puede superar a SDXL en esos estilos concretos.

## Limitaciones y advertencias

- **Licencia OpenRAIL-M**: permite uso comercial, pero con restricciones: no se puede usar para actividades ilegales o daninas, generar contenido falso o engañoso, ni para vigilancia masiva. Requiere redistribucion bajo la misma licencia.
- **Sesgos y alucinaciones**: como todo modelo de texto a imagen, puede generar contenido estereotipado o distorsionar elementos solicitados (manos, texto, proporciones). El fine-tuning puede acentuar sesgos presentes en el dataset de entrenamiento, no documentado.
- **Idioma**: los ejemplos del widget usan prompts en ingles. No se garantiza el rendimiento con prompts en otros idiomas, incluido el castellano.
- **Tamano del repositorio**: 2 TB es excesivo para la mayoria de casos de uso. Es recomendable descargar solo los safetensors necesarios o usar el modelo via API.
- **Informacion incompleta**: no se documentan datos de entrenamiento, benchmarks ni configuracion de hardware, lo que dificulta la evaluacion objetiva.
- **Cadena de entrenamiento**: al ser un fine-tuning de un fine-tuning (v0.6 → v0.7-stage1), los errores o sesgos de etapas anteriores pueden propagarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/terminusresearch/pixart-900m-1024-ft-v0.7-stage1
- Modelo base: https://huggingface.co/ptx0/pixart-900m-1024-ft-v0.7-stage1
- Version anterior (v0.6): https://huggingface.co/terminusresearch/pixart-900m-1024-ft-v0.6
- Version posterior (v0.7-stage2): https://huggingface.co/terminusresearch/pixart-900m-1024-ft-v0.7-stage2
- Despliegue en un clic: https://endpoints.huggingface.co/new?repository=terminusresearch%2Fpixart-900m-1024-ft-v0.7-stage1
