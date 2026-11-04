# t9749/mobilesam-onnx

## Resumen

MobileSAM es un modelo de segmentación de imágenes derivado de Segment Anything (SAM) de Meta, desarrollado por Chaoning Zhang et al. y publicado en 2023 bajo el artículo "Faster Segment Anything: Towards Lightweight SAM for Mobile Applications". Sustituye el pesado image encoder ViT-H de SAM (unos 632 millones de parámetros) por un TinyViT destilado mucho más ligero, manteniendo intactos el prompt encoder y el mask decoder originales de SAM. El resultado es un modelo capaz de generar máscaras de segmentación a partir de puntos o cajas con una huella computacional muy inferior.

Esta ficha concreta corresponde a una exportación a ONNX de los pesos de MobileSAM realizada por Acly y replicada sin cambios por el usuario t9749 en el repositorio `t9749/mobilesam-onnx`. El repositorio contiene dos grafos ONNX separados: un image encoder de aproximadamente 28 MB y un decoder de máscara única de aproximadamente 16,5 MB. El paquete está pensado para integrarse en aplicaciones de edición de vídeo (el autor menciona el editor MovieZam) donde la máscara actúa como inicialización de un graph cut que sigue a un objeto a lo largo de un clip.

La relevancia de esta exportación radica en su portabilidad: al estar en formato ONNX, puede ejecutarse con ONNX Runtime en CPU, GPU o aceleradores sin depender del stack de PyTorch, y el tamaño reducido de los ficheros permite distribuirlo dentro de aplicaciones de escritorio o móviles. La licencia es Apache 2.0 para los pesos y MIT para los scripts de exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (image encoder) + prompt encoder y mask decoder de SAM |
| Parametros totales | no disponible (el encoder ONNX pesa 28.157.093 bytes y el decoder 16.501.323 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX en precisión original; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | Apache 2.0 (pesos MobileSAM) y MIT (exportación ONNX de Acly) |
| Formato de pesos | ONNX (`mobile_sam_image_encoder.onnx`, `sam_mask_decoder_single.onnx`) |

## Arquitectura y entrenamiento

MobileSAM emplea una arquitectura de dos etapas heredada de SAM. La primera etapa es un image encoder basado en TinyViT que procesa la imagen de entrada y produce un mapa de embeddings de forma `[1, 256, 64, 64]`. La segunda etapa es el prompt encoder y el mask decoder originales de SAM, que reciben las coordenadas de puntos (etiquetadas como objeto o fondo) o una caja delimitadora, junto con los embeddings de imagen, y generan la máscara de segmentación. En esta exportación el decoder está especializado en producir una única máscara, con entrada opcional de máscara previa (`mask_input` de forma `[1, 1, 256, 256]` con `has_mask_input`) para refinamiento iterativo.

El entrenamiento de MobileSAM se basa en destilación del image encoder de SAM hacia el TinyViT, manteniendo congelados el prompt encoder y el mask decoder originales. El artículo original reporta que el modelo resultante es aproximadamente 60 veces más pequeño que el ViT-H de SAM (unos 10 millones de parámetros frente a 632 millones) y del orden de 5 veces más rápido en CPU, aunque estos datos provienen de la publicación y no se detallan en la model card de este repositorio. La exportación ONNX envuelve el encoder con su normalización y padding internos: la imagen de entrada debe llegar ya redimensionada de modo que el lado mayor mida 1024 píxeles, y el encoder se encarga de normalizar y rellenar hasta 1024x1024. El decoder devuelve logits a la resolución original indicada en `orig_im_size`.

## Capacidades

- Segmentación de imágenes a partir de prompts: acepta puntos positivos (objeto) y negativos (fondo) mediante `point_coords` y `point_labels`, así como cajas delimitadoras.
- Generación de una máscara única por invocación, con posibilidad de refinar el resultado pasando una máscara previa como `mask_input`.
- Salida de máscaras a la resolución original de la imagen mediante el parámetro `orig_im_size`, con logits donde los valores mayores que cero indican objeto.
- Segmentación de objetos arbitrarios sin categorías predefinidas (zero-shot), heredada del entrenamiento de SAM.
- Ejecución portable mediante ONNX Runtime en CPU, GPU o aceleradores compatibles, sin dependencia de PyTorch.
- Integración como paso previo en pipelines de posprocesado, por ejemplo como inicialización de graph cut para seguimiento de objetos en vídeo.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Edición de vídeo con recorte de objetos: el modelo genera una máscara inicial a partir de un clic o una caja sobre el primer fotograma, que se usa como semilla de un graph cut para seguir el objeto a lo largo del clip. Es el escenario para el que el autor declara haber fijado esta exportación (editor MovieZam).
- Herramientas de recorte interactivo en aplicaciones de escritorio: al pesar menos de 45 MB en total, los dos grafos ONNX pueden empaquetarse dentro de una aplicación sin inflar el instalador, y ejecutarse en CPU con ONNX Runtime para ofrecer selección por clic.
- Preprocesado en pipelines de visión por computador: generar máscaras de objetos para tareas posteriores como segmentación semántica, inpainting o eliminación de fondo, usando el modelo como generador de propuestas.
- Anotación asistida de datasets: acelerar el etiquetado de máscaras en herramientas de anotación, donde el operador coloca puntos y el modelo propone la máscara que después se corrige manualmente.
- Aplicaciones móviles o embebidas: el tamaño reducido del TinyViT y la portabilidad de ONNX permiten desplegar segmentación interactiva en dispositivos con recursos limitados, aunque el autor no documenta latencias concretas en esta plataforma.
- Automatización de tareas de selección en entornos de diseño gráfico: integrar el decoder en un editor para seleccionar rápidamente regiones de una imagen a partir de coordenadas de clic, con refinamiento iterativo mediante `mask_input`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Por el tamaño de los ficheros (28 MB el encoder y 16,5 MB el decoder), el modelo cabe holgadamente en cualquier GPU consumer, pero no se documentan picos de memoria de activaciones.
- GPU recomendadas: no disponibles. El modelo está exportado a ONNX y puede ejecutarse con ONNX Runtime en CPU o en GPU compatibles con los execution providers de ONNX Runtime (CUDA, DirectML, CoreML, etc.), sin que el autor especifique modelos concretos.
- Cabe en GPU consumer: sí, por el reducido tamaño de los pesos; cualquier GPU con al menos unos pocos cientos de MB de memoria libre debería poder cargarlo, aunque la cifra exacta no está documentada.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentación.
- Latencia y throughput estimados: no disponibles. El artículo original de MobileSAM reporta aceleraciones frente a SAM en CPU, pero esos datos no se reproducen en esta model card ni se han medido para esta exportación concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileSAM (esta exportación ONNX) | no disponible (encoder 28 MB + decoder 16,5 MB en ONNX) | no aplica | no disponible en la model card | Apache 2.0 (pesos) / MIT (export) | HuggingFace, formato ONNX |
| SAM (ViT-H, Meta) | 632 M (según el artículo de MobileSAM) | no aplica | no disponible en la información proporcionada | Apache 2.0 | Pesos originales de Meta |
| MobileSAM (pesos originales, Chaoning Zhang et al.) | ~10 M (según el artículo) | no aplica | no disponible en la información proporcionada | Apache 2.0 | GitHub del proyecto y HuggingFace (Acly/MobileSAM) |

La comparación con otros modelos de segmentación ligeros (por ejemplo, variantes de FastSAM o EfficientSAM) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El decoder de esta exportación genera una única máscara por invocación; no se documenta soporte para múltiples máscaras simultáneas como en SAM original.
- La imagen de entrada debe redimensionarse externamente para que el lado mayor mida 1024 píxeles antes de pasarla al encoder; el encoder no realiza el redimensionado, solo normaliza y rellena.
- El refinamiento iterativo depende de pasar `mask_input` y `has_mask_input` correctamente; un uso incorrecto puede degradar la calidad de la máscara.
- No se documentan sesgos específicos del modelo. Al derivar de SAM, puede heredar los sesgos del dataset de entrenamiento original (SA-1B), pero no hay información al respecto en la model card.
- Riesgo de alucinación en el sentido de máscaras incorrectas: al ser un modelo de segmentación promptable, puede producir máscaras plausibles pero erróneas en objetos ambiguos u oclusiones, sin señal de confianza documentada.
- No aplica el soporte multilingüe ni de contexto textual; es un modelo exclusivamente visual.
- Licencia: los pesos son Apache 2.0 y la exportación ONNX es MIT, por lo que el uso comercial está permitido, pero conviene conservar los avisos de atribución de ambos titulares.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ofrece garantías de mantenimiento ni de reproducibilidad más allá de los hashes SHA-256 publicados.
- No se documentan requisitos de memoria de activaciones ni latencias, lo que dificulta planificar un despliegue en producción sin mediciones propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/t9749/mobilesam-onnx
- Exportación ONNX original de Acly: https://huggingface.co/Acly/MobileSAM
- Repositorio GitHub de MobileSAM: https://github.com/ChaoningZhang/MobileSAM
- Artículo "Faster Segment Anything: Towards Lightweight SAM for Mobile Applications" (2023): https://arxiv.org/abs/2306.14289
- Repositorio original de Segment Anything (Meta): https://github.com/facebookresearch/segment-anything
