# tsqn/WAMU_v3_WAN2.2_I2V_LIGHTNING

## Resumen

WAMU_v3_WAN2.2_I2V_LIGHTNING es un modelo de difusion para generacion de video a partir de imagen (image-to-video, I2V), publicado en Hugging Face por el usuario tsqn. El identificador del repositorio indica que se construye sobre la familia Wan 2.2 de Alibaba (WAN2.2) y que incorpora una variante "Lightning", termino habitualmente asociado a destilados de pocos pasos de inferencia. La libreria declarada es diffusers y la clase de pipeline asociada es `WanImageToVideoPipeline`, lo que confirma la arquitectura de difusion para video condicionada por imagen.

El modelo cuenta con 14.288.901.184 parametros (aproximadamente 14,3 mil millones) segun los metadatos de los pesos en safetensors, y el repositorio ocupa 68,9 GB, un tamano coherente con pesos en precision alta (bf16/fp16) mas los componentes auxiliares del pipeline (VAE, text encoder, scheduler). No dispone de descargas ni likes en el momento de la consulta y la model card es la plantilla autogenerada por diffusers, sin informacion tecnica cumplimentada por el autor.

La relevancia de esta ficha es limitada pero real: se trata de un checkpoint de la familia Wan 2.2 orientado a inferencia rapida, un nicho muy demandado para generacion de video en produccion, donde el coste computacional de la difusion tradicional (decenas de pasos) es el principal cuello de botella. No obstante, la ausencia de documentacion, licencia declarada y benchmarks obliga a tratar cualquier uso en produccion con cautela y a verificar el linaje del modelo antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para video image-to-video (familia Wan 2.2, pipeline `WanImageToVideoPipeline`) |
| Parametros totales | 14.288.901.184 (~14,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en video, equivalente a numero de frames/resolucion; no documentado) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de lo inferible del pipeline: se trata de un modelo de difusion para video basado en la familia Wan 2.2, con un VAE de video (el repositorio incluye un subdirectorio `vae` segun los forks encontrados en la busqueda web) y una clase de pipeline `WanImageToVideoPipeline` que condiciona la generacion sobre una imagen de entrada. El sufijo "LIGHTNING" sugiere una destilacion para reducir el numero de pasos de muestreo, aunque el autor no documenta el metodo de destilacion, el numero de pasos objetivo ni el scheduler recomendado.

No hay informacion sobre datos de entrenamiento, numero de tokens o horas de video, composicion del dataset, ni sobre tecnicas de alineacion (RLHF/DPO). Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, destilacion por consistencia, etc.). Todo ello debe considerarse "no disponible".

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) mediante difusion.
- Presunta generacion rapida de video por la variante "Lightning" (pocos pasos de inferencia), aunque el numero exacto de pasos no esta documentado.
- Integracion con el ecosistema diffusers mediante `WanImageToVideoPipeline`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusion).
- Capacidades multilingues: no disponibles (el condicionamiento textual dependera del text encoder de la familia Wan 2.2, no documentado en este repo).
- No se documentan capacidades de audio, thinking mode ni vision mas alla del condicionamiento por imagen.

## Casos de uso

- Prototipado rapido de video generativo: usar el pipeline `WanImageToVideoPipeline` con una imagen semilla para generar clips cortos en pocos pasos, aprovechando la variante Lightning para reducir el coste por muestra en fase de exploracion.
- Animacion de storyboards: convertir fotogramas clave de una narrativa visual en clips animados para previsualizacion de guiones o pitches, con un coste de inferencia menor que un modelo de difusion de muchos pasos.
- Generacion de contenido para redes sociales: producir clips cortos a partir de una imagen de producto o escena, integrando el pipeline en un servicio backend con diffusers.
- Investigacion en destilacion de modelos de video: servir como punto de partida para estudiar el efecto de la destilacion Lightning sobre la calidad temporal y la coherencia entre frames.
- Pruebas de concepto en pipelines de difusion: validar la integracion de un modelo I2V de ~14B en infraestructura existente antes de adoptar un modelo mayor o con licencia comercial clara.
- Aumento de datos sinteticos para vision por computador: generar variaciones de video a partir de imagenes etiquetadas para entrenar modelos de deteccion o seguimiento, siempre que la licencia final lo permita (actualmente no declarada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~14,3 mil millones de parametros, en bf16/fp16 los pesos del transformer de difusion rondan los 28-29 GB; sumando VAE y text encoder, se recomienda al menos 40-48 GB de VRAM para una ejecucion comoda sin offloading. Con cuantizacion a 8 bits (si se generara) se podria reducir a ~16-20 GB, pero no se documentan variantes cuantizadas.
- GPU recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para inferencia sin offloading. En GPUs de 24 GB (RTX 4090) seria necesario offloading secuencial de modulos o cuantizacion, no documentada por el autor.
- Cabe en consumer GPU: solo con tecnicas de offloading o cuantizacion no oficiales; no se garantiza en RTX 4090 de 24 GB sin ellas.
- Opciones de despliegue: diffusers (libreria declarada); no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de video en este formato).
- Latencia y throughput: no disponibles; la variante Lightning sugiere pocos pasos, pero no se publica el numero ni mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / frames | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAMU_v3_WAN2.2_I2V_LIGHTNING | ~14,3 B | Difusion I2V (Wan 2.2, Lightning) | no disponible | no disponible | Hugging Face (repo tsqn) |
| Wan 2.2 I2V (original, Alibaba) | no disponible en esta ficha | Difusion I2V | no disponible | no disponible | Hugging Face |
| Alternativas I2V open source (p. ej. CogVideoX, LTX-Video) | no disponible | Difusion I2V | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones verificadas de los modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada por diffusers: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion.
- Licencia no declarada: no se puede confirmar el uso comercial; verificar el linaje respecto a Wan 2.2 y sus terminos antes de desplegar en produccion.
- Riesgo de alucinacion visual y artefactos temporales inherente a los modelos de difusion de video; no hay evaluacion publicada que lo cuantifique.
- El sufijo "Lightning" implica compromisos calidad/velocidad no documentados; el numero de pasos y scheduler recomendados son desconocidos.
- Sin descargas ni likes: no hay evidencia de validacion por la comunidad; el repositorio podria ser un checkpoint experimental.
- Existen forks del mismo nombre en Hugging Face (thornmaze, d335566) que sugieren duplicados o variantes; confirmar cual es el repositorio canonico.
- No se documentan limitaciones de idioma, resolucion ni duracion maxima de video.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsqn/WAMU_v3_WAN2.2_I2V_LIGHTNING
- Fork con subdirectorio VAE: https://huggingface.co/thornmaze/WAMU_v3_WAN2.2_I2V_LIGHTNING/tree/main/vae
- Fork alternativo: https://huggingface.co/d335566/WAMU_v3_WAN2.2_I2V_LIGHTNING/tree/main
- Paper citado en la model card (Lacoste et al., 2019, ML Impact): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact#compute
