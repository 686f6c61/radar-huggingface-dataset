# unsloth/sam3.1

## Resumen

SAM 3.1 es un modelo fundacional de segmentación promptable desarrollado por Meta, distribuido aquí por Unsloth en el formato `Sam3Model` de la librería `transformers`. A diferencia de un modelo de lenguaje, no genera texto: recibe una imagen y un prompt (una frase corta en inglés como "sofa" o "red lamp", o bien puntos, cajas o máscaras) y devuelve, para cada coincidencia, una máscara de segmentación, una caja delimitadora y una puntuación de confianza. La variante publicada en este repositorio tiene 840.376.374 parámetros (~840 M) y está pensada para el pipeline `mask-generation`.

La relevancia de SAM 3.1 frente a SAM 3 reside en la incorporación de Object Multiplex, un mecanismo de memoria compartida para el seguimiento conjunto de múltiples objetos que, según la model card, ofrece una inferencia aproximadamente 7 veces más rápida con 128 objetos en una única GPU H100 sin sacrificar precisión, además de mejorar el rendimiento en tareas de segmentación de vídeo (VOS) en 6 de los 7 benchmarks evaluados. El repositorio de Unsloth añade versiones cuantizadas en FP8 e INT8 que reducen el peso de 1,68 GB a ~1,0 GB con una pérdida de calidad de máscara mínima medida en IoU.

Este repositorio concreto es un derivado (finetune/reempaquetado) de `facebook/sam3.1`, no una publicación oficial de Meta, y se distribuye bajo la SAM License. Su interés práctico para desarrolladores es que expone el modelo en el ecosistema `transformers` con pesos `safetensors` listos para `from_pretrained`, algo que simplifica su integración en pipelines de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de segmentación promptable (SAM 3.1: detector de conceptos + tracker multiobjeto con Object Multiplex); implementado como `Sam3Model` en `transformers` |
| Parametros totales | 840.376.374 (~840 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: la entrada es una imagen más un prompt de texto corto, puntos, cajas o máscaras) |
| Tipos de cuantizacion | BF16 (referencia), FP8, INT8, INT8-ConvRot |
| Idiomas soportados | en (prompts de texto en inglés) |
| Licencia | SAM License (`license: other`, `license_name: sam-license`) |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

SAM 3.1 continúa la línea Segment Anything: un modelo de segmentación promptable que combina un codificador de imagen con un mecanismo que acepta distintos tipos de prompt (texto, puntos, cajas y máscaras) para producir máscaras de instancia. La novedad de la versión 3.1 es Object Multiplex, un enfoque de memoria compartida que permite el seguimiento conjunto de múltiples objetos en lugar de mantener un estado independiente por objeto; de ahí la mejora de velocidad de ~7x con 128 objetos en una H100 y la mejora en 6 de 7 benchmarks de VOS citada en la model card.

El modelo base SAM 3 se presenta como un modelo fundacional para segmentación promptable en imágenes y vídeo, capaz de segmentar de forma exhaustiva todas las instancias de un concepto de vocabulario abierto especificado mediante una frase corta, con cobertura de más de 50 veces más conceptos únicos que los benchmarks existentes. Los detalles concretos de composición del dataset de entrenamiento, número de tokens o proceso de alineación (RLHF/DPO) no están disponibles en la información proporcionada. Este repositorio de Unsloth no entrena el modelo desde cero: reempaqueta los pesos de `facebook/sam3.1` al formato `transformers` y genera variantes cuantizadas (FP8, INT8, INT8-ConvRot).

## Capacidades

- Segmentación de instancias guiada por texto: dada una imagen y una frase en inglés ("sofa", "person", "bicycle"), devuelve máscara, caja y score por cada coincidencia.
- Segmentación de vocabulario abierto: no limitada a un conjunto cerrado de clases; admite conceptos descritos libremente.
- Múltiples objetos por prompt: devuelve todas las instancias del concepto, no solo la más probable.
- Prompts visuales: puntos, cajas y máscaras como alternativa o complemento al prompt de texto (según la descripción del modelo base SAM 3).
- Seguimiento en vídeo y segmentación de objetos (VOS): disponible en el modelo base SAM 3.1 y en el repositorio oficial de Meta; este repositorio está etiquetado con el pipeline `mask-generation` y expone `Sam3Model` para imagen.
- Soporte de inpainting: la etiqueta `inpainting` sugiere uso de las máscaras generadas como entrada para edición o borrado de regiones.
- Umbrales configurables en post-proceso (`threshold` para detección y `mask_threshold` para binarización de máscara).
- No soporta generación de texto, razonamiento, código, matemáticas ni tool calling: no es un modelo de lenguaje.

## Casos de uso

- Edición de imágenes y retoque fotográfico: generar máscaras por prompt de texto ("potted plant", "rug") para alimentar herramientas de inpainting o sustitución de fondo, evitando el etiquetado manual píxel a píxel.
- Automatización de pipelines de anotación: preetiquetar datasets de visión por computador con máscaras e instancias antes de la revisión humana, usando la salida `boxes` y `scores` para priorizar la cola de revisión.
- Comercio electrónico y catálogo: extraer automáticamente el producto del fondo en fotos de catálogo segmentando clases como "sofa" o "lamp" y generando recortes con fondo transparente.
- Análisis de escenas urbanas o interiores: inventariar objetos presentes en una imagen (por ejemplo, "person", "bicycle", "yellow car") para tareas de conteo y auditoría visual.
- Robótica y percepción: generar máscaras de objetos concretos a partir de instrucciones en lenguaje natural para tareas de manipulación o navegación asistida.
- Vídeo y análisis de multitudes: el modelo base SAM 3.1 con Object Multiplex permite seguir hasta 128 objetos con una inferencia ~7x más rápida que SAM 3 en una H100, adecuado para conteo y seguimiento en grabaciones.
- Moderación y censura de contenido: localizar regiones concretas (marcas, personas, texto visual) mediante prompts y aplicar desenfoque selectivo sobre las máscaras resultantes.
- Prototipado rápido en cuadernos: al estar en formato `transformers` con pesos `safetensors`, se puede cargar con `from_pretrained` y ejecutar en una GPU de consumo para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, ni procede aplicarlos a un modelo de segmentación. El único dato cuantitativo aportado es la fidelidad de las versiones cuantizadas frente a BF16, medida como IoU de máscara sobre 53 prompts de texto en 6 imágenes:

| Fichero | Tamano | IoU vs BF16 (media / mínimo) |
|---|---|---|
| `model.safetensors` (BF16) | 1,68 GB | 1,0000 / 1,0000 |
| `sam3.1-INT8-ConvRot.safetensors` | 1,05 GB | 0,9984 / 0,9913 |
| `sam3.1-INT8.safetensors` | 0,99 GB | 0,9976 / 0,9829 |
| `sam3.1-FP8.safetensors` | 1,05 GB | 0,9971 / 0,9805 |

Además, la model card cita para SAM 3.1 un ~7x de aceleración en inferencia con 128 objetos en una H100 y mejoras de VOS en 6 de 7 benchmarks frente a SAM 3, sin cifras concretas por benchmark en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamaño de los pesos, ~1,7 GB en BF16 y ~1,0 GB en INT8/FP8 solo para los parámetros; hay que sumar activaciones del codificador de imagen, por lo que un presupuesto de 4-6 GB en BF16 para imágenes de ~1000 px es una estimación razonable (no publicada oficialmente por el autor).
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 holgadamente; en tarjetas de 8 GB conviene usar INT8 o FP8.
- GPU de centro de datos: A100 y H100 para cargas de vídeo con muchos objetos; la cifra de ~7x de aceleración con 128 objetos está medida en una única H100.
- Opciones de despliegue: `transformers` (vía `Sam3Model` y `Sam3Processor`, tal como muestra la model card), Unsloth Studio (que usa INT8-ConvRot en GPUs NVIDIA y BF16 en el resto), y servidores de inferencia genéricos tipo Triton o TorchServe con el modelo exportado.
- vLLM, llama.cpp, Ollama o TGI: no hay soporte documentado en la información disponible; no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles salvo el dato relativo de ~7x con 128 objetos en H100 frente a SAM 3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unsloth/sam3.1 (este) | 840 M | imagen + prompt de texto/puntos/cajas/máscaras | IoU 0,997-0,998 en INT8/FP8 frente a BF16 | SAM License | HuggingFace, formato `transformers`, 4 variantes de pesos |
| facebook/sam3.1 (original) | no disponible | imagen y vídeo, promptable | ~7x más rápido que SAM 3 con 128 objetos en H100; mejor VOS en 6/7 benchmarks | SAM License | HuggingFace y repositorio GitHub de Meta |
| SAM 3 (generación anterior) | no disponible | imagen y vídeo, promptable con texto | Referencia base sobre la que se mide la mejora de 3.1 | SAM License | GitHub `facebookresearch/sam3` |
| SAM 2 y otras alternativas de segmentación promptable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia SAM License: es una licencia propia de Meta, no una licencia OSI estándar. Antes de un uso comercial hay que revisar el texto completo en `LICENSE`, que exige reconocer el uso de los SAM Materials en publicaciones de resultados de investigación.
- Este repositorio no es una publicación oficial de Meta y no está respaldado por Meta; es un derivado distribuido por Unsloth.
- Prompts en inglés: el campo `language` solo declara `en`, así que los prompts en castellano pueden degradar la calidad de la segmentación.
- No es un modelo generativo: no produce texto, no razona, no hace tool calling y no debe evaluarse con benchmarks de lenguaje.
- Riesgo de falsos positivos y sobresegmentación: la segmentación de vocabulario abierto puede devolver instancias que no corresponden al concepto; el umbral (`threshold`) y `mask_threshold` requieren calibración por caso de uso.
- Dependencia de la resolución: la calidad de las máscaras finas (objetos pequeños, bordes complejos) se resiente con imágenes de baja resolución o muy comprimidas.
- Las cuantizaciones INT8/FP8 reducen el peso a ~1,0 GB con IoU media ≥0,997, pero el mínimo baja a 0,98 en algunos prompts; en aplicaciones sensibles a bordes precisos conviene validar con BF16.
- El seguimiento de vídeo no está expuesto en este repositorio con pipeline `mask-generation`; para el tracker hay que acudir al repositorio oficial de SAM 3.
- Sin datos publicados sobre sesgos demográficos o de dominio del dataset de entrenamiento; conviene auditar el rendimiento en los dominios concretos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unsloth/sam3.1
- Modelo base original: https://huggingface.co/facebook/sam3.1
- Repositorio oficial de SAM 3 / SAM 3.1: https://github.com/facebookresearch/sam3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Unsloth: https://docs.unsloth.ai/
- Unsloth Studio: https://github.com/unslothai/unsloth
- Discord de Unsloth: https://discord.gg/unsloth
