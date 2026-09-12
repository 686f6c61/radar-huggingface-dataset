# zhihuanglab/VISTA-PATH

## Resumen

VISTA-PATH es un modelo fundacional interactivo para segmentación de imágenes de patología y análisis cuantitativo en patología computacional, publicado por el grupo zhihuanglab. El modelo acepta tres modalidades de entrada simultáneas: contexto visual (imagen de tejido), una prompt textual de clase (por ejemplo, "an image of {class_name}") y, opcionalmente, una interacción guiada por experto en forma de caja delimitadora. Su objetivo es resolver la segmentación de estructuras histológicas nombradas por el usuario sin necesidad de reentrenar el modelo para cada órgano o conjunto de clases.

La arquitectura es una composición multimodal: un encoder de texto CLIP procedente de `vinid/plip` codifica la prompt de clase, un tronco Mask2Former (Swin encoder, pixel decoder y decoder transformer con masked attention) procedente de `facebook/mask2former-swin-small-ade-semantic` realiza la segmentación, y un encoder de caja congelado de `facebook/sam-vit-base` convierte la caja opcional en dos tokens de esquina. Veinte object queries asisten de forma cruzada a la secuencia concatenada de tokens de texto y de caja.

El modelo se preentrenó con más de 1,6 millones de muestras, generaliza entre órganos y tipos de tejido, admite refinamiento humano en el bucle (human-in-the-loop) y permite análisis clínicamente interpretable mediante características morfológicas asociadas a supervivencia. Está integrado en la plataforma TissueLab y se distribuye con pesos de aproximadamente 506 MB bajo una licencia académica no comercial, lo que lo hace relevante para investigación en patología computacional pero no para despliegues comerciales sin aprobación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal híbrida: encoder de texto CLIP (tower de texto de `vinid/plip`) + tronco de segmentación Mask2Former (Swin encoder + pixel decoder + decoder transformer con masked attention) + encoder de prompt de caja congelado de `facebook/sam-vit-base` |
| Parámetros totales | no disponible (el repositorio publica un checkpoint de ~506 MB; no se desglosa el recuento de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de visión con resolución de entrada fija de 512 y 20 object queries |
| Tipos de cuantización | no disponible (se publica un único checkpoint en PyTorch; no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible; la prompt de clase es texto y los ejemplos de la model card usan inglés ("an image of {class_name}") |
| Licencia | Penn Academic Software License (uso exclusivo para investigación académica no comercial, con atribución; la monetización o el uso comercial requiere aprobación previa) |
| Formato de pesos | `pytorch_model.bin` (PyTorch), ~506 MB |
| Resolución de entrada | 512 (debe coincidir con el checkpoint) |
| Número de object queries | 20 |
| Pipeline declarado | `image-segmentation` |

## Arquitectura y entrenamiento

VISTA-PATH no es un transformer monolítico, sino un ensamblaje de tres componentes con roles diferenciados. La prompt de clase se codifica con el tower de texto de PLIP como una secuencia de tokens. La caja opcional se codifica con el `prompt_encoder` congelado de SAM ViT-B, que produce dos tokens de esquina. Los 20 object queries realizan atención cruzada sobre la secuencia concatenada `[text tokens ; box tokens]` antes de entrar en el decoder de Mask2Former, y una cabeza binaria por query genera un mapa de probabilidad de primer plano para la clase indicada. Un detalle de diseño destacable es que, cuando no se proporciona caja, dos tokens aprendibles de "no-box" sustituyen a los tokens de esquina de SAM: así, un mismo checkpoint sirve tanto para el modo sin prompt como para el modo con caja, sin duplicar pesos.

El preentrenamiento declara más de 1,6 millones de muestras y una generalización explícita entre órganos y tipos de tejido. La model card no detalla la composición del dataset, el número de tokens de imagen vistos, ni si hubo etapas de ajuste por refuerzo (RLHF/DPO) o preferencias; tampoco se documentan recetas de aumento de datos ni estrategias de muestreo de whole-slide images (WSI). Entre las capacidades técnicas que sí se explicitan están el refinamiento humano en el bucle, que permite corregir la segmentación de forma iterativa, y el cálculo de características morfológicas asociadas a supervivencia, orientado a un análisis clínicamente interpretable. La inferencia sobre WSI se realiza mediante ventanas deslizantes configurables (`--crop_size`, `--overlap`) y el parámetro `--bbx_random` controla la probabilidad de descartar la caja, de modo que `1` ejecuta el modo sin prompt y `0` condiciona cada ventana a su caja.

## Capacidades

- Segmentación semántica prompt-free: genera máscaras para clases nombradas por el usuario (por ejemplo, "Tumor", "Stroma") sin proporcionar cajas.
- Segmentación condicionada por caja: en el modo box-prompted, una máscara de etiquetas aporta una caja por clase presente en cada ventana.
- Refinamiento interactivo con humano en el bucle para corregir y ajustar resultados de segmentación.
- Generalización entre órganos y tipos de tejido gracias al preentrenamiento con más de 1,6 millones de muestras.
- Inferencia sobre whole-slide images completas mediante ventanas deslizantes, con lectura de formatos tipo `.svs` a través de `openslide-python`.
- Análisis cuantitativo: salida opcional de la máscara a resolución completa (`--save_mask`) y de mapas de probabilidad por clase (`--save_prob`), además de una vista general en `.jpg`.
- Extracción de características morfológicas asociadas a supervivencia para análisis clínicamente interpretable.
- Mapeo de índices de etiqueta a nombres de clase mediante los ficheros de `idx_to_names/` (con un ejemplo para BRCA).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües: la única entrada textual es la prompt de clase y los ejemplos están en inglés.

## Casos de uso

- Segmentación de regiones de interés en investigación oncológica: sobre un fichero `.svs` se pueden nombrar clases como "Tumor" y "Stroma" y obtener la máscara a resolución completa por ventanas de 2048 píxeles con 256 de solapamiento, lo que permite cuantificar la proporción de cada compartimento tisular en una cohorte sin anotaciones manuales previas.
- Anotación asistida en pipelines de patología computacional: el modelo actúa como preanotador y el patólogo refina los errores en el bucle, reduciendo el tiempo de etiquetado en la construcción de datasets de entrenamiento para clasificadores de tiles.
- Análisis morfológico cuantitativo asociado a pronóstico: las características morfológicas asociadas a supervivencia que extrae el modelo permiten alimentar estudios de correlación entre arquitectura tisular y desenlace clínico.
- Preprocesado para modelos downstream: las máscaras de tejido generadas pueden usarse para enmascarar fondo, seleccionar tiles con tumor o normalizar la entrada de clasificadores de subtipos moleculares.
- Control de calidad de portaobjetos: la segmentación de clases tisulares permite detectar artefactos, tejido escaso, pliegues o desequilibrios de tinción antes de que las muestras entren en un pipeline de análisis.
- Validación y formación en patología: con los pares imagen/máscara de ejemplo del repositorio (`examples_BRCA/`) se pueden reproducir segmentaciones de referencia y comparar métricas de segmentación con la implementación de `utils.py`.
- Integración en plataformas de análisis: al estar integrado en TissueLab, puede invocarse dentro de un flujo de trabajo ya existente para segmentación y análisis cuantitativo sin reescribir la capa de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia el artículo en arXiv (2601.16451) y el repositorio de código, pero no incluye tablas con métricas como Dice, IoU, F1, ni comparaciones numéricas con otros modelos de segmentación en patología. Tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- El checkpoint publicado ocupa ~506 MB; el coste de memoria del tronco de segmentación es moderado (estimación orientativa: unos pocos GB de VRAM con resolución de entrada 512, aunque no se documenta una cifra oficial).
- GPU recomendadas: el entorno `cu118` documentado cubre las arquitecturas `sm_50` a `sm_90`, es decir, desde V100 hasta H200. Las tarjetas Blackwell (RTX serie 50, B200) necesitan una build `cu128` (torch 2.10.0+cu128 con torchvision 0.25.0+cu128).
- Cabe en GPU de consumo: al tratarse de un tronco Swin-small con resolución de entrada 512, es viable en tarjetas de gama media/alta; la restricción práctica no es la VRAM del modelo, sino el volumen de ventanas de la WSI y el ancho de banda de entrada/salida.
- El cuello de botella real en whole-slide images es el número de ventanas procesadas (con `crop_size` 2048 y `overlap` 256) y la lectura de ficheros con OpenSlide, no el tamaño del modelo.
- Opciones de despliegue: los entrypoints propios `inference.py` (sin prompt o con caja tisular en WSI) e `inference_bbx.py` (con caja derivada de una máscara de etiquetas), más las utilidades de `inference_utils.py`. No se documenta soporte para vLLM, TGI, Ollama, llama.cpp ni TensorRT, algo esperable en un modelo de segmentación.
- Dependencias del entorno: Python 3.12, torch 2.4.0+cu118, torchvision 0.19.0+cu118, transformers 4.46.1, `openslide-python` con `openslide-bin`. Los tres backbones (PLIP, Mask2Former, SAM ViT-B) se descargan del Hub en la primera ejecución.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks publicados que permitan una comparación cuantitativa. La siguiente tabla recoge únicamente la relación estructural entre VISTA-PATH y los modelos de los que reutiliza componentes, según la propia model card.

| Modelo | Rol en relación con VISTA-PATH | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VISTA-PATH | Modelo completo evaluado | no disponible (~506 MB de checkpoint) | Resolución de entrada 512, 20 queries | Penn Academic Software License (solo investigación académica no comercial) | HuggingFace `zhihuanglab/VISTA-PATH` |
| `facebook/sam-vit-base` | Aporta el `prompt_encoder` congelado para la caja | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| `facebook/mask2former-swin-small-ade-semantic` | Aporta el tronco de segmentación (Swin + pixel decoder + decoder) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| `vinid/plip` | Aporta el tower de texto CLIP para la prompt de clase | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |

## Limitaciones y advertencias

- Licencia restrictiva: la Penn Academic Software License permite únicamente uso académico no comercial con atribución. El uso comercial, la venta o cualquier monetización del modelo o de sus derivados requiere aprobación previa.
- No se documentan sesgos conocidos, pero al ser un modelo de patología entrenado con más de 1,6 millones de muestras cuya composición no se detalla, es esperable un rendimiento desigual entre órganos, tipos de tejido, laboratorios y protocolos de tinción no representados en el preentrenamiento.
- Riesgo de error de segmentación: como todo modelo de segmentación, puede producir falsos positivos y falsos negativos, especialmente en clases poco frecuentes, bordes mal definidos o tejido con artefactos. La presencia de un modo interactivo con humano en el bucle sugiere que el refinamiento manual forma parte del flujo previsto.
- No es una herramienta de diagnóstico: no se aporta validación clínica, certificación regulatoria ni estudio prospectivo en la información disponible.
- Dependencia de una configuración exacta: la resolución de entrada (512) y el número de queries (20) deben coincidir con el checkpoint; cambiar cualquiera de los dos invalida los pesos.
- La prompt de clase es textual pero no se documenta soporte multilingüe; los ejemplos usan inglés, por lo que el comportamiento con prompts en otros idiomas es desconocido.
- Sin datos de benchmarks ni de rendimiento publicados en la información disponible, no es posible estimar su precisión ni compararla con alternativas de forma objetiva.
- Requisitos de entorno específicos: versiones fijadas de PyTorch, torchvision y transformers, además de `openslide-python` con `openslide-bin`. Las tarjetas Blackwell requieren una build `cu128` distinta de la documentada por defecto.
- Manejo de datos sensibles: las whole-slide images suelen contener información de pacientes; el uso del modelo en entornos clínicos exige cumplir la normativa aplicable de protección de datos, algo que la model card no aborda.
- El repositorio registra 0 descargas y 0 likes, sin comunidad ni issues públicos documentados en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhihuanglab/VISTA-PATH
- Artículo (arXiv 2601.16451): https://www.arxiv.org/abs/2601.16451
- DOI: https://doi.org/10.48550/arXiv.2601.16451
- Código fuente: https://github.com/zhihuanglab/VISTA-PATH
- Plataforma TissueLab: https://www.tissuelab.org/
- Encoder de texto reutilizado (PLIP): https://huggingface.co/vinid/plip
- Tronco de segmentación reutilizado (Mask2Former Swin-small ADE20K semántico): https://huggingface.co/facebook/mask2former-swin-small-ade-semantic
- Encoder de prompt de caja reutilizado (SAM ViT-B): https://huggingface.co/facebook/sam-vit-base
