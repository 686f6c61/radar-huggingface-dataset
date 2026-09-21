# Syaofox/WAN2.2_LoraSet_NSFW

## Resumen

`Syaofox/WAN2.2_LoraSet_NSFW` es un repositorio de adaptadores LoRA (Low-Rank Adaptation) destinados al modelo de generación de vídeo a partir de imagen (image-to-video, I2V) `Wan-AI/Wan2.2-I2V-A14B`, desarrollado por el equipo Wan del grupo Alibaba. No es un modelo independiente: es una colección de pesos de ajuste fino que se cargan sobre los pesos base para inducir comportamientos visuales y de movimiento concretos, en este caso orientados a contenido para adultos. El repositorio ocupa 15,0 GB y fue creado el 21 de septiembre de 2026, sin descargas ni valoraciones registradas en el momento de la consulta.

El interés técnico de la ficha es doble. Por un lado, documenta el modelo base Wan 2.2 I2V A14B, una arquitectura Mixture-of-Experts (MoE) de vídeo con aproximadamente 27 000 millones de parámetros totales y 14 000 millones activos por paso de denoising, que separa el proceso en dos expertos (alto y bajo ruido). Por otro, ilustra un patrón habitual en la comunidad: la distribución de ajustes finos de bajo rango a través de Civitai en lugar de HuggingFace, con documentación mínima, licencia sin declarar y ausencia total de métricas.

La relevancia práctica es limitada en términos de ingeniería reproducible: el repositorio no incluye model card explicativa, no declara licencia y no aporta resultados de benchmarks. Cualquier evaluación debe partir, por tanto, de las especificaciones publicadas para el modelo base y de pruebas empíricas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer de difusión con arquitectura MoE (modelo base Wan 2.2 I2V A14B); no disponible la topología exacta de los adaptadores |
| Parametros totales | No aplicable al repositorio (conjunto de LoRA). Modelo base: aproximadamente 27 000 millones de parametros totales segun la documentacion del desarrollador del modelo base |
| Parametros activos | Aproximadamente 14 000 millones por paso en el modelo base (MoE con expertos de alto y bajo ruido) |
| Longitud de contexto | No aplicable en el sentido de contexto de texto. El modelo base genera por defecto clips de 5 segundos a 24 fps (121 fotogramas) a 480p o 720p |
| Tipos de cuantizacion | No disponible en el repositorio. Los LoRA se distribuyen en precision completa (fp16/bf16) y se pueden fusionar y recuantizar en el modelo base a fp8 o GGUF (Q4-Q8) |
| Idiomas soportados | No disponible en el repositorio. El modelo base emplea el codificador de texto multilingue umt5-xxl, con mejor rendimiento en ingles y chino |
| Licencia | `unknown` en el repositorio. El modelo base Wan 2.2 se publica bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (formato habitual de los LoRA de Wan en el ecosistema Diffusers/ComfyUI) |
| Tamano del repositorio | 15,0 GB |
| Modelo base declarado | `Wan-AI/Wan2.2-I2V-A14B` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |
| Etiquetas | `not-for-all-audiences`, `base_model:finetune:Wan-AI/Wan2.2-I2V-A14B`, `region:us` |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento de los adaptadores: no se indica el número de pasos, el conjunto de datos, la resolución de entrenamiento, el rango (rank) ni el alpha de los LoRA, ni si se aplicaron técnicas como regularización por dropout o entrenamiento con captions específicos. Tampoco se especifica si los adaptadores se entrenaron sobre el experto de alto ruido, el de bajo ruido o ambos; el tamaño del repositorio (15,0 GB) sugiere la presencia de múltiples adaptadores, probablemente emparejados por par de expertos.

Respecto al modelo base, Wan 2.2 I2V A14B es un transformer de difusión para generación de vídeo condicionada por imagen que utiliza una arquitectura MoE con dos expertos especializados por nivel de ruido: uno para las fases iniciales de denoising (alto ruido, responsable de la composición global y el movimiento) y otro para las fases finales (bajo ruido, responsable del detalle y la textura). Esta división permite aumentar la capacidad total del modelo sin incrementar proporcionalmente el coste computacional por paso, ya que solo se activan aproximadamente 14 000 millones de parámetros en cada iteración. El modelo incorpora un VAE de vídeo propio de la familia Wan 2.2 y emplea umt5-xxl como codificador de texto.

La ausencia de información sobre el ajuste fino impide determinar si los LoRA emplean técnicas de bajo rango estándar o variantes como LoRA con descomposición por capas de atención específicas (q/k/v/o) o proyecciones de MLP. Se recomienda inspeccionar las claves de los tensores en los ficheros safetensors para reconstruir esa información antes de reutilizarlos.

## Capacidades

- Generación de vídeo image-to-video: partiendo de una imagen fija, el modelo base produce clips cortos con movimiento coherente y consistencia temporal.
- Control de contenido mediante LoRA: cada adaptador induce un comportamiento visual o de movimiento específico (encuadres, transiciones de pose, primeros planos) sobre la generación del modelo base.
- Composición de varios LoRA: al ser adaptadores independientes, es posible encadenar o combinar varios con pesos escalados para modular el resultado.
- Generación a 480p y 720p: el modelo base soporta ambas resoluciones, con clips de 5 segundos a 24 fps por defecto.
- Razonamiento no aplicable: no es un modelo de lenguaje, por lo que no dispone de tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingües: dependen exclusivamente del codificador umt5-xxl del modelo base; no hay información específica en el repositorio sobre prompts en castellano.
- Sin modo de pensamiento ni salidas de audio: el pipeline es puramente visual (vídeo mudo).

## Casos de uso

- Producción de clips cortos para plataformas de contenido para adultos con verificación de edad: el conjunto de LoRA permite generar variaciones sobre una imagen de referencia con encuadres y movimientos predefinidos, reduciendo el coste de rodaje a la fase de inferencia.
- Previsualización rápida de secuencias (drafting): usar un LoRA concreto en baja resolución y pocos pasos de muestreo para validar composición y movimiento antes de lanzar un render final a 720p.
- Animación de fotografías fijas en flujos de posproducción: integrar el modelo base más el LoRA adecuado en un pipeline que convierta imágenes de referencia en clips de 5 segundos listos para montaje.
- Pruebas de consistencia de personaje: emplear la misma imagen de entrada con distintos adaptadores para evaluar cuánta identidad visual se preserva entre planos, útil para proyectos con continuidad de personaje.
- Investigación sobre ajuste fino de bajo rango en modelos de vídeo MoE: el repositorio sirve como muestra de cómo se comportan los LoRA entrenados específicamente para dominios restringidos en una arquitectura de dos expertos.
- Automatización por lotes en ComfyUI o Diffusers: los adaptadores se pueden cargar mediante nodos o mediante `load_lora_weights` y encadenar en scripts de generación por lotes con parámetros variables.
- Evaluación comparativa de datasets de ajuste: al no existir documentación, un equipo puede emplear estos LoRA como caso de estudio del efecto de la falta de trazabilidad en la reproducibilidad de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas (FVD, CLIP-SIM, VBench, consistencia temporal, etc.) ni comparaciones cuantitativas con otros adaptadores. El modelo base Wan 2.2 I2V A14B sí dispone de evaluaciones publicadas por su desarrollador, pero no se reproducen aquí al no haberse proporcionado los datos en la información consultada.

## Requisitos de hardware

- VRAM para los LoRA: despreciable frente al modelo base; cada adaptador en fp16 suele ocupar entre 0,1 y 0,6 GB (estimación en función del rango, no confirmada por el autor).
- VRAM para el modelo base en precisión completa: en torno a 54 GB en fp16 si se cargan ambos expertos simultáneamente (estimación); requiere A100 80 GB, H100 80 GB o dos GPU de 24 GB con paralelismo.
- VRAM con cuantización: aproximadamente 27 GB en fp8 y entre 9 y 16 GB en GGUF Q4-Q8 (estimaciones); esto lo sitúa al alcance de una RTX 4090 (24 GB), RTX 5090 (32 GB) o RTX 3090 (24 GB) con offload parcial.
- GPU de consumo: sí es viable en GPUs de gama alta para consumidores con cuantización agresiva y descarga de capas a RAM; no es viable en GPUs de 8-12 GB sin offload intensivo y tiempos de generación muy altos.
- Opciones de despliegue: ComfyUI (con nodos de carga de LoRA y soporte GGUF), librería Diffusers de HuggingFace, repositorio oficial de Wan 2.2 y variantes cuantizadas de la comunidad. vLLM y TGI no aplican, ya que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles para este repositorio. Dependen fuertemente del modelo base, la resolución (480p frente a 720p), el número de pasos y la estrategia de offload.
- Almacenamiento: el repositorio ocupa 15,0 GB, a los que hay que sumar los pesos del modelo base si no se dispone de ellos en caché local.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Disponibilidad | Documentacion |
|---|---|---|---|---|---|---|
| Syaofox/WAN2.2_LoraSet_NSFW | Conjunto de LoRA sobre Wan 2.2 I2V A14B | No aplicable (adaptadores) | 5 s a 24 fps (heredado del base) | unknown | 0 descargas, 0 likes | Practicamente nula |
| Wan-AI/Wan2.2-I2V-A14B | Modelo base I2V MoE | ~27B totales / ~14B activos | 5 s a 24 fps, 480p y 720p | Apache 2.0 | Repositorio oficial en HuggingFace | Completa, con paper tecnico |
| Wan-AI/Wan2.1-I2V-14B | Modelo base I2V denso | 14B | 5 s a 16 fps, 480p y 720p | Apache 2.0 | Repositorio oficial en HuggingFace | Completa |
| LoRA de la comunidad en Civitai para Wan 2.2 I2V | Adaptadores individuales | No aplicable | Heredado del base | Variable, a menudo sin declarar | Distribucion amplia en Civitai | Habitualmente minima |

No se dispone de datos de rendimiento comparativos entre estos elementos en la informacion proporcionada, por lo que la comparacion se limita a parametros estructurales, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada (`unknown`): no se puede asumir uso comercial permitido. Aunque el modelo base Wan 2.2 se publica bajo Apache 2.0, la licencia de los pesos derivados es competencia del autor y aquí no está especificada.
- Contenido para adultos: el repositorio está etiquetado como `not-for-all-audiences` y su finalidad es la generación de material explícito. Su uso está sujeto a la legislación aplicable en cada jurisdicción, incluida la normativa española sobre contenido para adultos, verificación de edad y protección de menores.
- Riesgo de uso indebido: los modelos de generación de vídeo a partir de imagen pueden emplearse para crear contenido sexual no consentido o deepfakes de personas reales. Este riesgo es especialmente relevante en un conjunto de LoRA orientado explícitamente a contenido sexual y debe mitigarse con controles de acceso y políticas de uso.
- Ausencia de documentación: no hay información sobre datos de entrenamiento, rango de los LoRA, hiperparámetros ni limitaciones conocidas, lo que impide auditar sesgos o reproducir resultados.
- Sesgos conocidos: no disponibles. Los sesgos del modelo base (representación corporal, etnia, edad aparente) no han sido analizados en este repositorio y probablemente se amplifican con el ajuste fino sobre un dominio restringido.
- Alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos anatómicos, incoherencias temporales y fallos de consistencia entre fotogramas, especialmente en las fases de bajo ruido.
- Limitaciones de idioma: el rendimiento con prompts en castellano no está documentado y depende del codificador umt5-xxl.
- Ausencia de validación comunitaria: con 0 descargas y 0 likes, no existe retroalimentación de terceros que confirme la calidad o el comportamiento real de los adaptadores.
- Falta de trazabilidad legal y técnica: al distribuirse originalmente a través de Civitai, algunos adaptadores pueden tener condiciones de uso adicionales no reflejadas en HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Syaofox/WAN2.2_LoraSet_NSFW
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Busqueda de archivo en Civitai (resultado citado en la model card): https://civitaiarchive.com/search?is_nsfw=true&is_deleted=true&q=blink
- Adaptador de escena en Civitai, ID 2316517: https://civitai.com/models/2316517
- Adaptador de escena en Civitai, ID 2319913: https://civitai.com/models/2319913
- Adaptador de escena en Civitai, ID 2231076: https://civitai.com/models/2231076
- Adaptador de escena en Civitai, ID 2227622: https://civitai.com/models/2227622
- Adaptador de escena en Civitai, ID 1923354: https://civitai.com/models/1923354
- Adaptador de escena en Civitai, ID 1952945: https://civitai.com/models/1952945
- Adaptador de escena en Civitai, ID 1916930: https://civitai.com/models/1916930
- Adaptador de escena en Civitai, ID 1476909: https://civitai.com/models/1476909
- Adaptador de escena en Civitai, ID 2069477: https://civitai.com/models/2069477
- Adaptador de escena en Civitai, ID 1906148: https://civitai.com/models/1906148
- Adaptador de escena en Civitai, ID 1899045: https://civitai.com/models/1899045
- Adaptador de escena en Civitai, ID 2148595: https://civitai.com/models/2148595
- Adaptador de escena en Civitai, ID 2060273: https://civitaiarchive.com/models/2060273

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los unicos resultados obtenidos fueron documentacion generica de Google Docs y hilos de foro sin relacion con el repositorio.
