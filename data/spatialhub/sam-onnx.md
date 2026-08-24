# SpatialHub/sam-onnx

## Resumen

SpatialHub/sam-onnx es un export del modelo Segment Anything Model (SAM) de Meta en formato ONNX, publicado por el usuario SpatialHub. SAM es un sistema de segmentación de imágenes basado en prompts que permite segmentar cualquier objeto de una imagen mediante puntos, cajas o texto. El formato ONNX facilita la inferencia en una amplia variedad de plataformas que soporten ONNX Runtime, incluyendo CPU, GPU y dispositivos periféricos.

El repositorio contiene los pesos del modelo en formato ONNX (1.6 GB), lo que indica que probablemente incluye el image encoder completo, además del prompt encoder y el mask decoder. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. La ausencia de una model card detallada en HuggingFace limita la información disponible sobre la configuración exacta del modelo, pero los resultados de búsqueda confirman que se trata de un export de SAM, posiblemente vinculado a la librería `spatialhub` publicada en PyPI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything Model (SAM) - Transformer basado en ViT para el image encoder, decoder ligero para prompt y mascara |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no textual) |
| Tipos de cuantizacion | no disponible (formato ONNX, no se indican cuantizaciones) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (repo de 1.6 GB) |

## Arquitectura y entrenamiento

SAM (Segment Anything Model) es un modelo de segmentacion de imagenes desarrollado por Meta AI. Su arquitectura consta de tres componentes principales: un image encoder basado en Vision Transformer (ViT) pre-entrenado con MAE (Masked Autoencoder), un prompt encoder que codifica puntos, cajas o mascaras como prompts, y un mask decoder ligero que genera mascaras de segmentacion a partir de la combinacion del embedding de la imagen y los prompts. El modelo fue entrenado con el dataset SA-1B, que contiene mas de 1.000 millones de mascaras sobre 11 millones de imagenes. El export ONNX disponible en este repositorio corresponde a la version original de SAM (no SAM-2 ni MobileSAM).

El export ONNX permite ejecutar el modelo sin depender de PyTorch, usando ONNX Runtime. Segun el notebook oficial de Meta, el prompt encoder y el mask decoder son muy ligeros, lo que permite una computacion eficiente de la mascara dado el prompt del usuario. El tamano del repo (1.6 GB) sugiere que el export incluye tambien el image encoder completo, que es la parte mas pesada del modelo.

## Capacidades

- Segmentacion de imagenes basada en prompts: puede segmentar cualquier objeto de una imagen a partir de puntos (positivos/negativos), cajas delimitadoras o mascaras aproximadas.
- Generacion de mascaras de segmentacion con resolucion configurable (por defecto 1024x1024).
- Inferencia en CPU o GPU mediante ONNX Runtime, lo que facilita el despliegue en entornos sin frameworks de deep learning pesados.
- Compatibilidad con el ecosistema de la libreria `spatialhub` de PyPI, que proporciona una API Python simple para inferencia.
- Capacidad de exportar el modelo a ONNX para plataformas moviles, edge o web (via ONNX.js).
- No soporta tool calling, agentes ni texto; es exclusivamente un modelo de vision.

## Casos de uso

- **Segmentacion de objetos en imagenes medicas**: el modelo puede segmentar organos o lesiones en radiografias o tomografias, usando puntos de referencia marcados por un profesional. La inferencia ONNX permite integrarlo en herramientas clinicas sin dependencias pesadas.
- **Recorte de objetos para edicion de fotos**: en aplicaciones de retoque fotografico, el usuario hace clic en un objeto y el modelo genera una mascara precisa para separarlo del fondo y editarlo.
- **Automatizacion de etiquetado de datos**: en pipelines de anotacion de datasets, el modelo puede pre-generar mascaras iniciales que un humano refina, reduciendo el tiempo de etiquetado.
- **Sistemas de realidad aumentada**: para seleccionar y manipular objetos en tiempo real en dispositivos moviles, gracias a la eficiencia del decoder ONNX.
- **Inspeccion industrial**: en control de calidad, el modelo segmenta defectos en piezas a partir de cajas delimitadoras predefinidas, integrado en sistemas de vision artificial en la nube o en el edge.
- **Investigacion en vision por computador**: como punto de partida para experimentos de segmentacion de prompts, comparando con otras arquitecturas como SAM-2 o MobileSAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye metricas de rendimiento en la model card ni en los resultados de busqueda web. Para evaluar su rendimiento, se recomienda consultar las evaluaciones oficiales de SAM en el paper original de Meta (por ejemplo, mIoU en segmentacion de objetos) o ejecutar pruebas locales con el dataset SA-1B.

## Requisitos de hardware

- **VRAM estimada**: para el modelo completo (image encoder + decoder), se requieren aproximadamente 6-8 GB de VRAM en FP32 para una imagen de 1024x1024. Con cuantizacion a FP16, la VRAM se reduce a unos 3-4 GB.
- **GPU recomendadas**: NVIDIA RTX 3060 (12 GB) o superior, A100 (40 GB) para inferencia en produccion con lotes grandes. En CPU, se puede ejecutar pero con latencia mayor.
- **Cabe en consumer GPU**: si, en GPUs con 8 GB o mas, como RTX 2070 Super, RTX 3060 Ti, RTX 3070, etc.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, C#), ONNX.js para navegador, ONNX Runtime Mobile para Android/iOS, y vLLM no aplica (modelo de vision). Tambien se puede usar la libreria `spatialhub` de PyPI.
- **Latencia y throughput**: no disponible en la informacion. Depende de la GPU y del tamaño de la imagen; en una RTX 4090, el image encoder tarda ~50-100 ms, y el decoder ~1-5 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| SAM (original) | ViT-H | ~636 M | - | Apache-2.0 | PyTorch | Repo oficial de Meta |
| SAM-2 | ViT-H (mejorado) | ~2.4 B | - | Apache-2.0 | PyTorch | Repo oficial de Meta |
| MobileSAM | ViT-Tiny | ~40 M | - | Apache-2.0 | PyTorch, ONNX | Repo oficial |
| **SpatialHub/sam-onnx** | SAM (ViT) | no disponible | - | Apache-2.0 | ONNX | HuggingFace |

Nota: SAM-2 y MobileSAM son alternativas mas recientes o ligeras. MobileSAM es mucho mas pequeño y adecuado para edge, mientras que SAM-2 ofrece mejor rendimiento en video. Este modelo no ofrece informacion de parametros, pero el tamano del repo sugiere que es el SAM original completo.

## Limitaciones y advertencias

- **Sesgos conocidos**: SAM fue entrenado principalmente con imagenes de internet, por lo que puede tener sesgos en la segmentacion de objetos poco comunes o de ciertos grupos demograficos (por ejemplo, personas con vestimenta no occidental).
- **Riesgo de alucinacion**: en vision, no hay alucinacion textual, pero puede generar mascaras erroneas en imagenes con objetos muy pequenos o con fondo complejo.
- **Limitaciones de contexto**: no aplica (modelo de vision); la resolucion de imagen esta limitada a 1024x1024 (el decoder puede producir mascaras mas pequenas si la imagen es menor).
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo base (SAM) es de Meta; no hay restricciones conocidas mas alla de la licencia.
- **Caveat de produccion**: el export ONNX no incluye el pipeline completo de preprocesamiento (normalizacion de imagen, etc.); debe implementarse manualmente. Ademas, el modelo no soporta video directamente; para video se requiere aplicar frame a frame.

## Enlaces

- [HuggingFace - SpatialHub/sam-onnx](https://huggingface.co/SpatialHub/sam-onnx)
- [Colab - ONNX model example (Meta)](https://colab.research.google.com/github/facebookresearch/segment-anything/blob/main/notebooks/onnx_model_example.ipynb)
- [Documentacion API de SAM_ONNX (Girinchutia)](https://girinchutia.github.io/SAM_ONNX/)
- [PyPI - spatialhub](https://pypi.org/project/spatialhub/)
- [GitHub - samexporter (vietanhdev)](https://github.com/vietanhdev/samexporter)
- [Paper original de SAM](https://arxiv.org/abs/2304.02643)
