# yuji-nozawa/ReFoCo

## Resumen

ReFoCo es una familia de modelos Vision Transformer (ViT) preentrenados, publicados por Yuji Nozawa, Yu-Chieh Lin y Youyang Ng, que acompaña al artículo "Training Vision Transformers to Focus: Emergence of Spatial Attention Head Specialization", aceptado en NeurIPS 2026. El repositorio de Hugging Face distribuye los pesos preentrenados de tres variantes (ViT-B/16-Reg, ViT-L/16-Reg y ViT-g/16-Reg) bajo licencia Apache-2.0, con un tamano total de 6,4 GB.

El modelo no es un generador de texto ni un modelo multimodal de instrucciones: su pipeline declarado es `image-feature-extraction`, es decir, se emplea como extractor de caracteristicas visuales y como backbone para tareas de vision por computador. El interes tecnico reside en el hallazgo del articulo: durante el entrenamiento emerge una especializacion de las cabezas de atencion con sesgo espacial, lo que sugiere que el modelo aprende a "enfocar" regiones relevantes de la imagen de forma no supervisada.

La relevancia actual es principalmente de investigacion: se trata de un trabajo academico reciente (NeurIPS 2026) que aporta pesos comparables a los de ViT estandar pero entrenados con una receta especifica orientada a la especializacion atencional. No hay informacion publica sobre volumen de descargas, idiomas ni resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches de 16x16 y regularizacion (sufijo "-Reg") |
| Parametros totales | Tres variantes: ViT-B/16-Reg (base), ViT-L/16-Reg (large), ViT-g/16-Reg (giant); cifras exactas no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision; resolucion de entrada no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica / no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch, checkpoints de estado) |

## Arquitectura y entrenamiento

La familia ReFoCo sigue la arquitectura Vision Transformer estandar con parches de 16x16 y la variante "-Reg" de regularizacion, en tres escalas: base (ViT-B), large (ViT-L) y giant (ViT-g). El articulo que acompania a los pesos se centra en la emergencia de una especializacion de las cabezas de atencion con caracter espacial durante el entrenamiento, es decir, en como distintas cabezas aprenden a focalizarse en regiones concretas de la imagen sin supervisacion explicita de localizacion.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de ajuste como RLHF o DPO (no aplicables en un modelo de vision de este tipo). Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal. La informacion disponible se limita a la receta de entrenamiento descrita en el paper y a los enlaces a codigo y pagina del proyecto.

## Capacidades

- Extraccion de caracteristicas visuales (image feature extraction) a partir de imagenes de entrada.
- Backbone de Vision Transformer reutilizable para tareas de vision por computador (clasificacion, deteccion, segmentacion, recuperacion visual) previo ajuste fino.
- Especializacion de cabezas de atencion con sesgo espacial, segun el hallazgo principal del articulo.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (modelo puramente visual).
- Sin modo "thinking", vision generativa, audio ni otras capacidades multimodales.

## Casos de uso

- Extraccion de embeddings visuales para busqueda y recuperacion de imagenes: el modelo puede generar representaciones vectoriales de imagenes que se indexan en un motor de busqueda vectorial, aprovechando su condicion de extractor de caracteristicas.
- Clasificacion de imagenes con ajuste fino: se puede anadir una cabeza lineal sobre el backbone ViT-B/16-Reg para tareas de clasificacion en dominios especificos, con un coste de entrenamiento moderado.
- Segmentacion y deteccion como backbone: las variantes L y g sirven como columna vertebral para arquitecturas tipo detector o segmentador, sustituyendo al ViT estandar.
- Analisis de atencion espacial en investigacion: util para estudiar la especializacion de cabezas atencionales, replicando los experimentos del paper con los pesos publicados.
- Preentrenamiento de modelos de vision en dominios cientificos (medicina, satelite, industria) donde se necesita un backbone preentrenado con licencia permisiva Apache-2.0.
- Prototipado rapido en pipelines de vision: al estar disponibles tres escalas, se puede elegir ViT-B para entornos con recursos limitados y ViT-g para maxima calidad en servidores con GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un ViT-B/16 en precision FP16 requiere del orden de 1-2 GB, un ViT-L/16 en torno a 3-5 GB y un ViT-g/16 puede superar los 10-20 GB, aunque estas cifras no estan confirmadas en la model card.
- GPU recomendadas: no especificadas por el autor. Por escala, ViT-B/16-Reg puede ejecutarse en GPU consumer (RTX 3060/4060 en adelante); ViT-L/16-Reg requiere GPU de gama alta (RTX 4090, A100); ViT-g/16-Reg probablemente necesita A100/H100 o varias GPU.
- Cabe en GPU consumer: probablemente solo la variante base; las variantes large y giant no estan pensadas para consumer.
- Opciones de despliegue: al ser un checkpoint `.pth` de PyTorch, el despliegue se realiza mediante el codigo del repositorio de GitHub del autor, no mediante vLLM, llama.cpp u Ollama (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReFoCo ViT-B/16-Reg | Base (cifra exacta no disponible) | No disponible | No publicado | Apache-2.0 | Hugging Face (`.pth`) |
| ReFoCo ViT-L/16-Reg | Large (cifra exacta no disponible) | No disponible | No publicado | Apache-2.0 | Hugging Face (`.pth`) |
| ReFoCo ViT-g/16-Reg | Giant (cifra exacta no disponible) | No disponible | No publicado | Apache-2.0 | Hugging Face (`.pth`) |
| ViT estandar (Google) | B/L/H | 224x224 tipico | Publicado en paper original | Apache-2.0 | Multiples repositorios |
| DINOv2 (Meta) | Varias escalas | No disponible | Publicado | Apache-2.0 (variantes) | Hugging Face |

La comparacion cuantitativa con alternativas como DINOv2 o CLIP no es posible con la informacion disponible, ya que el autor no publica resultados de benchmarks en la model card.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no es posible verificar su rendimiento frente a alternativas establecidas.
- La model card no especifica el dataset de entrenamiento ni la resolucion de entrada, lo que dificulta evaluar sesgos y generalizacion.
- El autor declara explicitamente que no ofrece soporte formal ni garantiza mantenimiento (correcciones de errores incluidas).
- Al ser un modelo de vision, no dispone de capacidades linguisticas, de tool calling ni de agentes.
- La licencia Apache-2.0 permite uso comercial, pero al no haber evaluacion publica de sesgos, se recomienda validacion en el dominio de aplicacion antes de produccion.
- Los pesos estan en formato `.pth` y dependen del codigo del repositorio GitHub del autor; no hay integracion con frameworks de despliegue estandar como vLLM u Ollama.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de predicciones erroneas en tareas downstream sin ajuste fino.

## Enlaces

- Hugging Face: https://huggingface.co/yuji-nozawa/ReFoCo
- Paper (OpenReview): https://openreview.net/forum?id=3aWhzsaHua
- Pagina del proyecto: https://yuji-nozawa.github.io/ReFoCo
- Repositorio GitHub: https://github.com/yuji-nozawa/ReFoCo
- Poster NeurIPS 2026: https://neurips.cc/virtual/2026/poster/155703
- Pesos ViT-B/16-Reg: https://huggingface.co/yuji-nozawa/ReFoCo/resolve/main/model_vit_focus_base.pth?download=true
- Pesos ViT-L/16-Reg: https://huggingface.co/yuji-nozawa/ReFoCo/resolve/main/model_vit_focus_large.pth?download=true
- Pesos ViT-g/16-Reg: https://huggingface.co/yuji-nozawa/ReFoCo/resolve/main/model_vit_focus_giant.pth?download=true
