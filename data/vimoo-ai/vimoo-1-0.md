# Vimoo-AI/Vimoo-1.0

## Resumen

Vimoo-1.0 es un modelo generativo de vídeo desarrollado por Vimoo-AI que convierte texto en vídeo (text-to-video, T2V) y una imagen de referencia más texto en vídeo (image-to-video, I2V). Según la model card, la familia Vimoo 1.0 contiene dos modelos principales (Vimoo 1.0 y Vimoo 1.0 - Lite) y cada tarea T2V e I2V se cubre con un modelo separado de aproximadamente 11.700 millones de parámetros; este repositorio corresponde al modelo de mayor calidad de la familia. Los pesos están publicados en formato safetensors y se integran con la librería `diffusers`, con un tamaño de repositorio de 47,7 GB.

El sistema completo no es un único modelo: se compone de tres módulos. Vimoo-PE interpreta y refina las instrucciones multimodales; Vimoo-Base genera vídeo a 720p; y Vimoo-Enhancer reescala la salida a 1080p combinando superresolución con reparación generativa de defectos de apariencia y movimiento. Solo Vimoo-Base está publicado como pesos abiertos; Vimoo-PE y Vimoo-Enhancer se ofrecen a través de la API del servicio, de modo que la inferencia local produce 720p y el 1080p requiere llamar al Enhancer.

Es relevante ahora porque es un modelo de vídeo de pesos abiertos con licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribución, y porque incluye artefactos de despliegue local (ComfyUI y MLX para Apple Silicon) además de una API alojada. La información disponible no detalla la arquitectura interna del difusor ni la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para generacion de video; detalles internos no publicados) |
| Parametros totales | 11.696.932.656 (≈11,7B) por modelo; T2V e I2V son modelos separados |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la longitud de vídeo indicada es de 5 segundos) |
| Tipos de cuantizacion | no disponible (la model card menciona variantes Lite para ComfyUI y MLX, sin detallar esquemas de cuantizacion) |
| Idiomas soportados | no disponible (los prompts se describen en lenguaje natural, sin lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `diffusers`); pesos especificos para ComfyUI y MLX en repositorios aparte |

Otros datos: pipeline declarado `text-to-video`; etiquetas `image-to-video`, `vimoo`; region `us`; 14 descargas y 4 likes en el momento de la consulta; creado el 2026-09-30 y actualizado el 2026-11-04.

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna de Vimoo-Base más allá de su naturaleza de modelo de difusión para generación de vídeo, gestionado mediante `diffusers`. Tampoco se publican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Lo que sí se describe es la arquitectura del sistema en tres etapas: Vimoo-PE para el refinado de instrucciones, Vimoo-Base para la generación a 720p y Vimoo-Enhancer para la reconstrucción a 1080p con reparación generativa de defectos de apariencia y movimiento.

La innovación destacable es precisamente ese desacoplamiento en módulos: el modelo abierto se limita a la generación base, mientras que la calidad final depende de un sistema de prompting dedicado (Vimoo-PE) y de un módulo de mejora opcional. La model card insiste en que la calidad de la salida está fuertemente condicionada por el sistema de prompting y recomienda integrar Vimoo-PE o construir uno propio siguiendo la guía de prompts. Se ofrecen además adaptaciones de despliegue: flujos de ComfyUI, pesos específicos para ComfyUI (incluida una variante Lite) y pesos MLX para Apple Silicon.

## Capacidades

- Generación de vídeo a partir de texto (T2V): descripción de escenas, historias, movimientos de cámara y atmósfera, con clips de 5 segundos a 720p.
- Generación de vídeo a partir de imagen de referencia y texto (I2V): animación de imágenes manteniendo la apariencia y la consistencia del sujeto de la referencia.
- Control de puesta en escena mediante prompt: la model card menciona explícitamente el control de movimientos de cámara, emoción y narrativa.
- Integración con `diffusers` mediante pipeline de inferencia.
- Despliegue en ComfyUI mediante flujos y pesos dedicados.
- Ejecución en Apple Silicon mediante pesos y repositorio MLX.
- Módulo de mejora a 1080p (Vimoo-Enhancer) disponible únicamente vía API, no como pesos abiertos.
- Variante de comercio electrónico (Vimoo-1.0-Ecom) vía API: combina de 1 a 9 imágenes de producto con títulos, descripciones y puntos de venta para generar vídeo de 20 segundos en formato 9:16 a 720p.
- Variante Lite (Vimoo-1.0-Lite) vía API y pesos locales: prioriza velocidad y menor consumo de recursos, con salida de 5 segundos a 720p.
- No se documentan capacidades de tool calling, agentes, audio, visión general ni modo de razonamiento; el modelo es específicamente generativo de vídeo.

## Casos de uso

- Publicidad de producto a partir de imágenes de referencia: usando la variante Ecom (vía API) se pueden combinar de 1 a 9 fotos de producto con textos de venta para producir un vídeo vertical 9:16 de 20 segundos a 720p, adecuado para catálogos y campañas en redes sociales.
- Prototipado rápido de storyboards: con T2V se generan clips de 5 segundos a 720p para validar encuadres, movimientos de cámara y ritmo antes de producir con equipos reales, reduciendo el coste de iteración.
- Animación de material fotográfico existente: con I2V se animan imágenes de archivo manteniendo la identidad visual del sujeto, útil para convertir fotografía de producto, retratos o paisajes en piezas de vídeo sin rodaje adicional.
- Generación de contenido para redes sociales: clips cortos de 5 segundos a 720p, escalables a 1080p mediante el Enhancer, encajan en formatos de vídeo breve y permiten producir variantes de un mismo concepto modificando solo el prompt.
- Previsualización en estudios de animación y VFX: el modelo base permite explorar alternativas de movimiento y composición; la etapa Enhancer añade detalle y corrige defectos de apariencia y movimiento para una revisión más realista.
- Despliegue local en estaciones de trabajo con Apple Silicon: los pesos MLX y la variante Lite permiten ejecutar generación de vídeo en equipos sin GPU de datacenter, útil para pruebas offline, entornos con requisitos de privacidad o investigación.
- Integración en flujos de ComfyUI: los workflows publicados permiten encadenar Vimoo-Base con otros nodos (upscaling, interpolación, postproceso) dentro de pipelines de producción ya existentes en equipos creativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, un modelo de difusión de ≈11,7B parámetros en precisión de 16 bits requiere del orden de 23 GB solo para los pesos, más memoria para activaciones y el VAE; en cuantizaciones de 8 bits o 4 bits el requisito de pesos baja aproximadamente a 12 GB y 6 GB respectivamente, aunque estas cifras son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo, son razonables GPUs de datacenter como A100 (40/80 GB) o H100 para ejecución en precisión completa y lotes mayores; no hay datos publicados de latencia ni throughput.
- ¿Cabe en GPU de consumo? No confirmado. La existencia de variantes Lite para ComfyUI y de pesos MLX para Apple Silicon sugiere que el autor busca ejecución en hardware de gama alta de consumo y en Mac, pero no se publican requisitos mínimos ni cifras de memoria.
- Opciones de despliegue: `diffusers` (pipeline oficial), ComfyUI (workflows y pesos dedicados, incluida variante Lite), MLX para Apple Silicon, y la API alojada de Vimoo para el pipeline completo con Enhancer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables publicadas en la información proporcionada para establecer una comparación cuantitativa con otros modelos de generación de vídeo. Los datos objetivos disponibles son: 11,7B parámetros por modelo (T2V e I2V separados), salida de 5 segundos a 720p en local y 1080p vía Enhancer, licencia Apache 2.0, formatos safetensors para `diffusers`, ComfyUI y MLX, y un tamaño de repositorio de 47,7 GB.

| Criterio | Vimoo-1.0 | Alternativas |
|---|---|---|
| Parametros | ≈11,7B por modelo (T2V e I2V separados) | no disponible |
| Contexto / duracion de salida | 5 s a 720p local; 1080p via Enhancer | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Formatos | safetensors (diffusers), ComfyUI, MLX | no disponible |
| Benchmarks publicados | no disponible | no disponible |

## Limitaciones y advertencias

- Pesos abiertos parciales: solo Vimoo-Base está publicado. Vimoo-PE (refinado de prompts) y Vimoo-Enhancer (1080p) no están disponibles como pesos; la calidad final y la resolución 1080p dependen de la API del servicio.
- Dependencia fuerte del sistema de prompting: la model card advierte que la calidad de salida está determinada en gran medida por Vimoo-PE y recomienda seguirlo o construir un sistema propio según la guía de prompts; sin él, los resultados pueden degradarse notablemente.
- Duración limitada: los clips locales son de 5 segundos a 720p; no se documenta soporte para vídeos más largos ni para encadenamiento nativo de clips.
- Sesgos conocidos: no documentados en la información disponible. Como modelo generativo entrenado con datos no especificados, es previsible que reproduzca sesgos de representación, estilo y demografía del corpus, pero no hay análisis publicado.
- Riesgo de alucinación visual: no cuantificado. En modelos de difusión de vídeo son habituales las inconsistencias temporales, la deformación de detalles finos y la aparición de artefactos en movimiento; el propio sistema incluye un Enhancer que repara defectos de apariencia y movimiento, lo que sugiere que existen en la salida base.
- Idiomas: no se especifica qué idiomas admiten los prompts; la documentación está en inglés y no hay lista de cobertura lingüística.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero conviene verificar los términos de la API alojada si se depende de Vimoo-PE o del Enhancer, que no están cubiertos por los pesos abiertos.
- Madurez y adopción: el repositorio registra 14 descargas y 4 likes, y el modelo se publicó en octubre de 2026; el ecosistema de terceros, los informes independientes y las recetas de cuantización son escasos.
- Requisitos de hardware no publicados: no hay guía oficial de VRAM mínima ni de configuraciones soportadas, lo que complica el dimensionamiento de infraestructura en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vimoo-AI/Vimoo-1.0
- Organización en Hugging Face: https://huggingface.co/Vimoo-AI
- Sitio web y API: https://vimoo.ai
- Repositorio principal: https://github.com/Vimoo-AI/Vimoo-1.0
- ComfyUI: https://github.com/Vimoo-AI/ComfyUI-Vimoo
- Pesos ComfyUI: https://huggingface.co/Vimoo-AI/Vimoo-1.0-ComfyUI
- Pesos Lite ComfyUI: https://huggingface.co/Vimoo-AI/Vimoo-1.0-Lite-ComfyUI
- MLX (Apple Silicon): https://github.com/Vimoo-AI/Vimoo-1.0-MLX
- Pesos MLX Lite: https://huggingface.co/Vimoo-AI/Vimoo-1.0-Lite-MLX
- Informe técnico: https://vimoo.ai/research
- Guía de prompts: https://vimoo.ai/vimoo-docs/api#prompts
