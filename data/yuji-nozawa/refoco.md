# yuji-nozawa/ReFoCo

## Resumen

ReFoCo es una familia de modelos Vision Transformer (ViT) preentrenados presentada en el articulo «Training Vision Transformers to Focus: Emergence of Spatial Attention Head Specialization», aceptado en NeurIPS 2026. El trabajo lo firman Yuji Nozawa, Yu-Chieh Lin y Youyang Ng, y los pesos estan publicados en Hugging Face bajo la licencia Apache-2.0. El modelo aborda el problema de como inducir especializacion espacial en las cabezas de atencion de un ViT durante el preentrenamiento, de modo que una parte de las cabezas aprenda a concentrarse en regiones relevantes de la imagen en lugar de dispersar la atencion globalmente.

La familia cubre tres escalas: ViT-B/16-Reg, ViT-L/16-Reg y ViT-g/16-Reg, es decir, las variantes base, large y giant de Vision Transformer con parches de 16x16. El sufijo «Reg» remite a la regularizacion empleada durante el entrenamiento para forzar la emergencia de esas cabezas especializadas. El repositorio ocupa 6,4 GB, coherente con los tres checkpoints en formato PyTorch (`.pth`).

La relevancia actual es investigadora mas que de producto: el modelo esta pensado para extraccion de caracteristicas visuales y para servir de base a tareas aguas abajo (clasificacion, segmentacion, retrieval), y su interes principal es el estudio de la interpretabilidad de la atencion espacial en ViT. No es un modelo generativo ni multimodal, y no esta orientado a conversacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches 16x16 y regularizacion espacial de atencion |
| Parametros totales | no disponible (tres variantes: ViT-B, ViT-L, ViT-g) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

Se trata de una familia de Vision Transformers estandar con patch embedding de 16x16 y las tres escalas clasicas (base, large y giant). La innovacion descrita en el titulo del articulo es la aparicion de especializacion espacial en las cabezas de atencion: durante el preentrenamiento, un mecanismo de regularizacion («Reg») induce a que determinadas cabezas de atencion se concentren en zonas concretas de la imagen, dando lugar a patrones de atencion espacialmente localizados y interpretables. Los checkpoints publicados corresponden a las tres variantes entrenadas con ese esquema.

No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, de la composicion del dataset ni de si se emplearon tecnicas de ajuste fino supervisado adicionales. El articulo esta publicado en OpenReview y arXiv (2611.11890), donde se encontraria ese detalle. El modelo es exclusivamente de extraccion de caracteristicas visuales: no incorpora cabecera de lenguaje, tool calling ni capacidades generativas.

## Capacidades

- Extraccion de caracteristicas visuales (embeddings) a partir de imagenes, con pipeline `image-feature-extraction`.
- Backbone ViT utilizable para tareas aguas abajo de vision por computador (clasificacion, deteccion, segmentacion, retrieval).
- Atencion espacialmente especializada en determinadas cabezas, lo que facilita analisis de interpretabilidad y visualizacion de mapas de atencion.
- Tres escalas disponibles (B/16, L/16, g/16) para equilibrar coste y capacidad.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Extraccion de embeddings para busqueda visual: usar los checkpoints como extractor de caracteristicas y alimentar un indice vectorial para recuperacion de imagenes por similitud; la especializacion espacial ayuda a preservar informacion de regiones concretas.
- Clasificacion de imagenes con backbone congelado o ajuste fino: conectar una cabeza lineal sobre las features de ViT-B/16-Reg o ViT-L/16-Reg en lugar de entrenar desde cero.
- Segmentacion semantica y deteccion: emplear los mapas de atencion espacialmente localizados como señal auxiliar o como inicializacion de cabezas de segmentacion.
- Investigacion en interpretabilidad de ViT: analizar que cabezas se especializan en que regiones y como evoluciona esa especializacion con la escala del modelo (B frente a L frente a g).
- Reproduccion de resultados del articulo: los tres checkpoints permiten replicar los experimentos de NeurIPS 2026 con el codigo del repositorio GitHub.
- Preentrenamiento base para dominios especificos (medico, satelite, industrial): partir de ViT-L/16-Reg y ajustar con datasets reducidos del dominio, aprovechando las features ya aprendidas.
- Evaluacion comparativa de metodos de regularizacion de atencion: usar ReFoCo como referencia frente a ViT estandar en estudios de ablation.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo (OpenReview y arXiv 2611.11890) para los resultados experimentales.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no conocerse el numero exacto de parametros de cada variante; orientativamente, ViT-B/16 ronda los 86 M de parametros, ViT-L/16 unos 300 M y ViT-g/16 varios miles de millones, pero estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: para ViT-B/16-Reg y ViT-L/16-Reg es suficiente una GPU consumer (RTX 3090, RTX 4090) en inferencia; ViT-g/16-Reg requiere GPU de datacenter (A100, H100) por tamaño y memoria.
- Cabe en GPU consumer: probablemente las variantes B y L; la variante g depende del tamaño real del checkpoint.
- Opciones de despliegue: los pesos son `.pth` de PyTorch, por lo que el despliegue natural es PyTorch/TorchScript con el codigo del repositorio GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReFoCo (ViT-B/L/g-16-Reg) | no disponible | no disponible | Extraccion de features visuales | Apache-2.0 | Hugging Face, `.pth` |
| ViT estandar (google/vit-base-patch16-224) | ~86 M (B/16) | no aplica | Extraccion de features visuales | Apache-2.0 | Hugging Face |
| DINOv2 (ViT-B/L/g) | ~86 M a ~1,1 B | no aplica | Extraccion de features visuales | Apache-2.0 (segun variante) | Hugging Face |
| CLIP ViT-B/16 | ~150 M (vision) | 77 tokens de texto | Vision-lenguaje | MIT | Hugging Face |

La comparativa se limita a la categoria de backbones ViT para vision; los datos de rendimiento de ReFoCo no estan disponibles para contrastarlos numericamente con DINOv2 o CLIP.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no procesa texto, no genera respuestas y no soporta conversacion ni tool calling.
- No hay informacion sobre sesgos del dataset de preentrenamiento; al ser un ViT entrenado sobre datos no especificados, puede heredar sesgos de esa coleccion.
- Riesgo de alucinacion no aplica en sentido generativo, pero las features pueden amplificar correlaciones espurias del dataset de entrenamiento.
- Idiomas: no aplica; no hay capacidades linguisticas ni multilingues.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara que no ofrece soporte formal ni garantiza mantenimiento, correccion de bugs o revision de Pull Requests.
- Los pesos estan en `.pth`, formato que requiere el codigo del repositorio GitHub para cargarse; no hay versiones GGUF, ONNX ni safetensors publicadas.
- El modelo esta pensado para investigacion; su uso en produccion exige validacion propia de robustez y de rendimiento en el dominio objetivo.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que indica adopcion muy limitada y poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/yuji-nozawa/ReFoCo
- arXiv: https://arxiv.org/abs/2611.11890
- OpenReview: https://openreview.net/forum?id=3aWhzsaHua
- NeurIPS 2026 poster: https://neurips.cc/virtual/2026/poster/155703
- Project page: https://yuji-nozawa.github.io/ReFoCo
- GitHub: https://github.com/yuji-nozawa/ReFoCo
- Pesos ViT-B/16-Reg: https://huggingface.co/yuji-nozawa/ReFoCo/resolve/main/model_vit_focus_base.pth
- Pesos ViT-L/16-Reg: https://huggingface.co/yuji-nozawa/ReFoCo/resolve/main/model_vit_focus_large.pth
- Pesos ViT-g/16-Reg: https://huggingface.co/yuji-nozawa/ReFoCo/resolve/main/model_vit_focus_giant.pth
