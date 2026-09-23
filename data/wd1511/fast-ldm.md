# wd1511/fast-ldm

## Resumen
FAST (Flexibly Controllable Arbitrary Style Transfer via Latent Diffusion models) es un sistema de transferencia de estilo arbitrario construido sobre difusion latente (latent diffusion models, LDM), desarrollado por Hanzhang Wang, Haoran Wang, Zhongrui Yu, Mingming Sun, Junjun Jiang, Xianming Liu y Deming Zhai. El trabajo se publico en ACM Transactions on Multimedia Computing, Communications and Applications (TOMM) en 2025 y esta disponible como articulo en arXiv (2401.05870), con codigo en GitHub y una pagina de proyecto propia.

El repositorio `wd1511/fast-ldm` en HuggingFace distribuye los checkpoints de imagen y video de FAST junto con sus dependencias preentrenadas y los pesos de los anotadores (HED, Canny, PiDiNet, OneFormer, Uniformer). El modelo parte de Stable Diffusion v1.5 y anade adaptadores de estilo especificos: no es un reemplazo directo del UNet estandar de Stable Diffusion, sino que requiere pipelines personalizados de FAST para la inferencia.

Su relevancia actual radica en que introduce un Style-Adapter que alinea informacion de control de estilo multinivel con el conocimiento interno del LDM, permitiendo manipular de forma flexible el resultado de la estilizacion y equilibrar la retencion de detalle del contenido con la intensidad del estilo, tanto en imagen como en video.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (LDM) basada en Stable Diffusion v1.5 con UNet y adaptadores de estilo (Style-Adapter); modulos separados para imagen y video |
| Parametros totales | no disponible (el repositorio no indica recuento de parametros de los checkpoints FAST) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen/video) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en FP32; el repositorio no documenta cuantizaciones GGUF/INT8/FP16) |
| Idiomas soportados | en, zh (segun etiquetas del repositorio) |
| Licencia | no disponible (el repositorio no declara licencia; los componentes upstream conservan sus licencias originales) |
| Formato de pesos | .bin (layout Diffusers FP32 para Stable Diffusion v1.5), .pth (por ejemplo `hed-network.pth`) |

## Arquitectura y entrenamiento
FAST emplea un modelo de difusion latente derivado de Stable Diffusion v1.5. La innovacion principal es el Style-Adapter, un componente que permite alinear informacion de control de estilo multinivel con el conocimiento intrinseco del LDM. Esto habilita un control flexible de la estilizacion y mejora la capacidad del modelo para armonizar la retencion de detalle del contenido con la fuerza de la estilizacion. El repositorio incluye checkpoints diferenciados para imagen (`checkpoint/image_model/`) y para video (`checkpoint/video_model/`), cada uno con su UNet de FAST y sus adaptadores correspondientes.

El sistema se apoya en un conjunto de modelos auxiliares para extraer senales de control: DPT Hybrid MiDaS para profundidad, HED para bordes, y PiDiNet y Canny como extractores adicionales, ademas de OneFormer COCO y pesos de Uniformer para segmentacion. Los checkpoints de FAST incluyen sus propios parametros del extractor de caracteristicas VGG, de modo que los scripts de inferencia no necesitan descargar VGG por separado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades
- Transferencia de estilo arbitrario en imagen: aplica un estilo de referencia a una imagen de contenido manteniendo el detalle de la escena original.
- Transferencia de estilo en video: variante especifica para video-to-video, con checkpoints y UNet dedicados.
- Control flexible de la estilizacion: el Style-Adapter permite manipular el grado y las caracteristicas del estilo aplicado.
- Extraccion de senales de control: profundidad (DPT Hybrid MiDaS), bordes (HED, Canny, PiDiNet) y segmentacion (OneFormer, Uniformer).
- Procesamiento guiado por estructura: uso de mapas de profundidad y bordes para condicionar la generacion.
- Soporte multilingue documentado: en y zh (aplicable a la documentacion y a las etiquetas del repositorio, no a la generacion de texto, dado que el modelo es de imagen/video).
- Integracion con el ecosistema Diffusers para pipeline de image-to-image.

## Casos de uso
- Estilizacion de catalogo fotografico: aplicar un mismo estilo de marca a lotes de imagenes de producto mediante transferencia image-to-image, manteniendo el detalle de la prenda o del objeto gracias a las senales de control de profundidad y bordes.
- Postproduccion de video: aplicar un estilo coherente a lo largo de una secuencia usando los checkpoints de video, aprovechando la variante video-to-video de FAST.
- Prototipado creativo en diseno grafico: generar variaciones estilizadas de bocetos o referencias para explorar direcciones visuales antes de producir en alta calidad.
- Previsualizacion en animacion: estilizar planos preliminares guiados por mapas de profundidad (MiDaS) para evaluar el look final antes del render.
- Efectos visuales en cine y publicidad: transferir el estilo de referencias artisticas a metraje, empleando bordes (HED/Canny) para preservar la silueta de los sujetos.
- Investigacion en sintesis guiada por estructura: usar la arquitectura y los anotadores incluidos como base experimental para estudios de transferencia de estilo con difusion latente.
- Restauracion estilizada de material de archivo: combinar el condicionamiento por profundidad y segmentacion para reestilizar material antiguo preservando la composicion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el repositorio pesa 18,9 GB (19,82 GiB) e incluye Stable Diffusion v1.5 en FP32, los UNet de FAST (imagen y video), adaptadores, extractor VGG y anotadores; la carga en memoria supera la de una inferencia estandar de SD 1.5. Valores concretos de VRAM no documentados.
- GPU recomendadas: no disponible (no se especifican modelos concretos en la informacion).
- Compatibilidad con GPU de consumo: no confirmada en la informacion. Dado que deriva de SD 1.5, es plausible su ejecucion en GPU de gama alta de consumo, pero los adaptadores, anotadores y el checkpoint de video pueden elevar los requisitos; se requiere verificacion.
- Opciones de despliegue: pipelines personalizados de FAST sobre el ecosistema Diffusers (los checkpoints no funcionan como reemplazo directo del UNet estandar de Stable Diffusion). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FAST (wd1511/fast-ldm) | Transferencia de estilo arbitrario (LDM imagen/video) | no disponible | no aplica | no disponible | Repositorio HuggingFace + GitHub |
| Stable Diffusion v1.5 (base) | Difusion latente texto-a-imagen | no disponible en la informacion | no aplica | CreativeML Open RAIL-M (licencia upstream, no relicenciada aqui) | Ampliamente disponible |
| Otros modelos de transferencia de estilo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos cuantitativos ni de modelos comparables directos con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias
- Licencia no declarada: el repositorio `wd1511/fast-ldm` no especifica licencia, lo que genera incertidumbre para uso comercial. Los componentes upstream (Stable Diffusion v1.5, DPT Hybrid MiDaS, HED, OneFormer) conservan sus licencias originales y su inclusion no las relicencia.
- No es un reemplazo directo de Stable Diffusion: requiere pipelines de FAST personalizados; usar los checkpoints con un UNet estandar no es valido.
- Dependencia de modelos auxiliares pesados: la inferencia requiere cargar anotadores y estimadores (profundidad, bordes, segmentacion), lo que incrementa el consumo de recursos y la complejidad del despliegue.
- Dataset de entrenamiento no documentado: no se informa sobre composicion, sesgos ni cobertura del conjunto de entrenamiento.
- Idiomas declarados limitados: en y zh en las etiquetas; no hay evidencia de soporte multilingue adicional.
- Riesgo de artefactos y alucinacion visual: como todo modelo generativo de difusion, puede producir detalles inconsistentes o alterar el contenido original, especialmente con estilos muy alejados del dominio de entrenamiento.
- Los scripts de prueba requieren preparar entradas manualmente (segun `docs/ASSETS.md` de la distribucion de codigo) y su publicacion es independiente de esta subida de pesos.
- Sin datos de benchmarks publicados en la informacion disponible, no es posible validar su rendimiento frente a alternativas.

## Enlaces
- HuggingFace: https://huggingface.co/wd1511/fast-ldm
- Paper (ACM TOMM 2025): https://dl.acm.org/doi/abs/10.1145/3748655
- arXiv: https://arxiv.org/pdf/2401.05870.pdf
- Pagina del proyecto: https://fast-ldm.github.io/
- GitHub: https://github.com/wd1511/FAST
