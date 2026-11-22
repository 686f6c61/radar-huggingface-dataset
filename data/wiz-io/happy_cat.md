# wiz-io/happy_cat

## Resumen

happy_cat es un clasificador de imagenes binario desarrollado por el usuario wiz-io que distingue si un gato aparece contento o triste en una fotografia. Se trata de un fine-tuning del modelo google/vit-base-patch16-224-in21k, un Vision Transformer base preentrenado en ImageNet-21k, adaptado a la tarea especifica de clasificacion de emociones felinas. El modelo se distribuye a traves de Hugging Face con la libreria transformers y el pipeline image-classification.

La relevancia de esta ficha es limitada en terminos practicos: el repositorio no contiene pesos publicados en el momento de la consulta. Segun la propia model card, el Space asociado (wiz-io/cat_mode) entrena el modelo en su primer arranque y sube los pesos al repositorio, sustituyendo la tarjeta por una que incluya la precision de test. Por tanto, se trata de un artefacto en estado embrionario, con cero descargas y cero likes, sin resultados de evaluacion publicados.

Arquitectonicamente hereda las caracteristicas del ViT-Base: parches de 16x16 pixeles sobre imagenes de 224x224, 12 capas de transformer y aproximadamente 86 millones de parametros. La licencia BSD permite uso comercial amplio, aunque la ausencia de pesos y de metricas hace que cualquier evaluacion seria quede pendiente de que el autor publique el modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolucion 224) |
| Parametros totales | aproximadamente 86 millones (heredados de google/vit-base-patch16-224-in21k) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin componente linguistico) |
| Licencia | BSD |
| Formato de pesos | no disponible (los pesos no estan publicados en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de google/vit-base-patch16-224-in21k, un Vision Transformer que divide la imagen de entrada en parches de 16x16 pixeles, los proyecta linealmente a embeddings y los procesa con 12 capas de atencion multi-cabeza. La cabeza de clasificacion original de ImageNet-21k se sustituye por una cabeza binaria adaptada a la tarea contento/triste. El preentrenamiento en ImageNet-21k proporciona representaciones visuales genericas que el fine-tuning especializa en un dominio muy concreto.

Los datos de entrenamiento provienen del dataset wiz-io/cat_images, referenciado en la model card. No se especifica el numero de imagenes, la composicion por clase, el regimen de aumentacion ni los hiperparametros de entrenamiento. Tampoco se documenta si hubo validacion cruzada, splitting o tecnicas de regularizacion. La model card indica explicitamente que los pesos no estan en el repositorio y que el Space wiz-io/cat_mode los genera en su primer arranque, lo que implica un proceso de entrenamiento automatizado pero no reproducible a partir de la informacion publicada.

## Capacidades

- Clasificacion binaria de imagenes de gatos en dos categorias: contento y triste.
- Inferencia sobre imagenes de 224x224 pixeles mediante el pipeline image-classification de transformers.
- Compatibilidad con los endpoints de Hugging Face (etiqueta endpoints_compatible), lo que permite desplegarlo como API gestionada una vez existan los pesos.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues relevantes: la salida se limita a etiquetas de clase.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagen.

## Casos de uso

- Filtrado de fotos en aplicaciones de mascotas: el modelo puede etiquetar automaticamente imagenes subidas por usuarios para separar las que muestran gatos contentos de las que muestran gatos tristes, util en galerias o feeds donde se quiera destacar contenido positivo.
- Moderacion ligera en comunidades de mascotas: clasificar publicaciones con gatos y priorizar o agrupar las que reflejan bienestar animal, como apoyo a moderadores humanos.
- Analisis de bienestar en refugios: procesar lotes de fotografias de gatos en adopcion para detectar patrones de expresion y complementar la evaluacion del personal del refugio, siempre con supervision humana.
- Juguete educativo o demo de vision por computador: servir como ejemplo didactico de fine-tuning de un ViT sobre un dataset propio, util en cursos y talleres de aprendizaje automatico.
- Etiquetado semi-automatico de datasets: preanotar imagenes de gatos con la etiqueta contento/triste para acelerar la revision manual en la construccion de datasets mayores.
- Prototipos de aplicaciones moviles: integrar el modelo en una app que recomiende contenido segun el estado de animo aparente del gato, con la advertencia de que la precision real es desconocida al no haber pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el Space asociado sustituira la tarjeta por una que incluya la precision de test, pero en el momento de la consulta no hay metricas de exactitud, F1, precision ni recall.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en fp32 para los 86 millones de parametros del ViT-Base, mas el overhead de activaciones (del orden de 1 GB en total para lotes pequenos).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers con pipeline image-classification, ONNX Runtime, TorchScript, o endpoints de Hugging Face. No se documenta soporte especifico para vLLM, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles al no haber pesos publicados ni mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wiz-io/happy_cat | ~86 M | Clasificacion binaria gato contento/triste | no aplica | BSD | Pesos no publicados |
| google/vit-base-patch16-224-in21k | ~86 M | Clasificacion ImageNet-21k (vision general) | no aplica | Apache 2.0 | Pesos publicos |
| google/vit-base-patch16-224 | ~86 M | Clasificacion ImageNet-1k | no aplica | Apache 2.0 | Pesos publicos |
| microsoft/resnet-50 | ~25 M | Clasificacion ImageNet-1k | no aplica | Apache 2.0 | Pesos publicos |

La comparativa es estructural: happy_cat es un fine-tuning del primero de la lista y comparte su arquitectura, pero se diferencia en la tarea, la licencia (BSD frente a Apache 2.0) y, sobre todo, en la disponibilidad de pesos. No hay modelos publicos equivalentes para la tarea concreta de emocion felina en la informacion disponible.

## Limitaciones y advertencias

- Los pesos no estan publicados en el repositorio: el modelo no se puede ejecutar tal cual desde Hugging Face hasta que el Space wiz-io/cat_mode los genere y los suba.
- No hay metricas de evaluacion publicadas: se desconoce la precision real, el equilibrio entre clases y el comportamiento ante imagenes fuera de distribucion.
- Sesgos potenciales: el dataset wiz-io/cat_images no esta documentado, por lo que se desconocen sesgos de raza, color, iluminacion o encuadre que puedan afectar a las predicciones.
- Riesgo de alucinacion conceptual: al ser un clasificador binario, siempre asignara una de las dos etiquetas aunque la imagen no muestre un gato o la expresion sea ambigua, sin mecanismo de absteccion documentado.
- Limitaciones de idioma: no aplica, pero la salida se limita a etiquetas de clase sin explicabilidad.
- Restricciones de licencia: la licencia BSD permite uso comercial, pero la falta de pesos y de documentacion de entrenamiento limita la trazabilidad para produccion.
- Caveat importante: el proceso de entrenamiento descrito (entrenamiento en el primer arranque del Space) no es reproducible ni auditable a partir de la informacion publicada.

## Enlaces

- Hugging Face: https://huggingface.co/wiz-io/happy_cat
- Space asociado: https://huggingface.co/spaces/wiz-io/cat_mode
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset: https://huggingface.co/datasets/wiz-io/cat_images
