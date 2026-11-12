# tharunsm/telor

## Resumen

TELOR es un clasificador de imagenes de moda multi-tarea desarrollado por el usuario tharunsm y publicado en Hugging Face. A partir de una unica fotografia de producto de ropa, predice cuatro atributos de catalogo: tipo de articulo (49 clases), color base (18 clases), categoria de genero (5 clases) y uso previsto (4 clases). Ademas, devuelve un embedding de imagen de 1.280 dimensiones util para busqueda por similitud visual.

El modelo se construye sobre un extractor de caracteristicas EfficientNet-B0 preentrenado en ImageNet mediante la libreria `timm`, al que se anaden cuatro cabezas de clasificacion lineal. El conjunto completo suma 4.146.920 parametros, lo que lo situa en la gama muy ligera: es adecuado para inferencia en CPU, navegador (via exportacion ONNX) y dispositivos con recursos limitados.

Su relevancia practica esta en el etiquetado automatico de catalogos de e-commerce: sustituye o asiste el trabajo manual de anotar tipo, color, genero y uso de cada producto, y habilita busqueda visual. La licencia del repositorio es MIT, aunque la inicializacion con pesos preentrenados de ImageNet exige verificar los terminos de `timm` antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN) con cuatro cabezas lineales de clasificacion |
| Parametros totales | 4.146.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224 x 224 px) |
| Tipos de cuantizacion | no disponible (exportacion ONNX incluida; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificacion de imagenes; etiquetas en ingles segun `label_maps.json`) |
| Licencia | MIT (repositorio); pesos preentrenados de ImageNet sujetos a los terminos de `timm` |
| Formato de pesos | safetensors (`model.safetensors`), ONNX (`model.onnx`), PyTorch state dict |

## Arquitectura y entrenamiento

TELOR emplea una red convolucional EfficientNet-B0 como extractor de caracteristicas, inicializada con pesos preentrenados en ImageNet a traves de `timm`, y fine-tuneada sobre el Fashion Product Images dataset de Param Aggarwal (Kaggle). Sobre el vector de caracteristicas global se montan cuatro cabezas lineales independientes, una por atributo, con 49, 18, 5 y 4 clases respectivamente. El modelo expone tambien el embedding de 1.280 dimensiones para similitud visual.

El preprocesado es fijo: imagen RGB encajada en un cuadrado blanco, redimensionada a 224 x 224 pixeles y normalizada con media y desviacion tipica de ImageNet. No se documenta el numero de tokens ni el volumen exacto del split de entrenamiento, aunque la evaluacion se realizo sobre un conjunto de test de entre 4.523 y 4.824 ejemplos por cabeza. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa, al no tratarse de un modelo generativo.

## Capacidades

- Clasificacion multi-tarea de imagenes de moda: tipo de articulo, color base, genero y uso en una sola pasada.
- Salida de las tres etiquetas mas probables con sus probabilidades por cada cabeza.
- Generacion de embedding de imagen de 1.280 dimensiones para busqueda por similitud visual.
- Inferencia en Python via `timm`/PyTorch y en navegador via ONNX Runtime con tensor de entrada `[1, 3, 224, 224]`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingues, de vision generativa, audio ni modo de razonamiento.

## Casos de uso

- Etiquetado automatico de catalogos de e-commerce: procesar lotes de fotos de producto y rellenar los campos de tipo, color, genero y uso sin intervencion manual, reduciendo el coste de alta de SKUs.
- Busqueda visual en tienda online: usar los embeddings de 1.280 dimensiones para indexar productos y recuperar articulos visualmente similares a partir de una foto del usuario.
- Enriquecimiento de fichas de producto incompletas: detectar y corregir atributos faltantes o erroneos en bases de datos de catalogo existentes.
- Moderacion y control de calidad de listados: marcar productos cuya imagen no coincide con la categoria declarada por el vendedor.
- Filtrado y facetado de resultados: generar facetas de color, genero y uso de forma automatica para mejorar la navegacion en el catalogo.
- Demo o prototipo en navegador: gracias a la exportacion ONNX, integrar la clasificacion en una aplicacion web sin backend de GPU.
- Recomendacion por similitud: alimentar un motor de "productos parecidos" con los embeddings generados en tiempo real.

## Benchmarks y rendimiento

Resultados de la evaluacion sobre el conjunto de test retenido, con intervalos de confianza al 95 % calculados con 1.000 remuestreos bootstrap:

| Cabeza | Ejemplos de test | Exactitud (IC 95 %) | F1 macro (IC 95 %) |
|---|---:|---|---|
| Tipo de articulo | 4.824 | 90,4 % (89,5-91,1 %) | 0,859 (0,844-0,871) |
| Color base | 4.523 | 70,7 % (69,4-72,1 %) | 0,640 (0,621-0,658) |
| Genero | 4.824 | 93,1 % (92,4-93,8 %) | 0,818 (0,792-0,841) |
| Uso | 4.813 | 92,4 % (91,6-93,1 %) | 0,859 (0,845-0,873) |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo ocupa unos 16 MB en pesos (4,1 M parametros), por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria; funciona igualmente bien en CPU.
- Cabe en GPU de consumo: si, en cualquier RTX, GTX o incluso en iGPU modernas; tambien en moviles y navegador via ONNX Runtime.
- Opciones de despliegue: PyTorch/`timm` en Python, ONNX Runtime (CPU, GPU o Web), y exportacion a otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en milisegundos en CPU moderna, aunque no se documentan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparativa rigurosa. Como referencia estructural, TELOR se situa en la misma familia que otros clasificadores ligeros basados en EfficientNet-B0 fine-tuneados para moda, pero no se aportan cifras de esos modelos que permitan una comparacion directa.

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia |
|---|---|---|---|---|
| TELOR | 4,1 M | 224 x 224 px | Clasificacion multi-tarea de moda | MIT (con caveat de pesos ImageNet) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado principalmente con fotos de producto sobre fondo blanco; el rendimiento puede degradarse con fotos de estilo de vida, varias prendas en la imagen, iluminacion atipica o categorias no representadas.
- El color base es la cabeza mas debil (70,7 % de exactitud, F1 macro 0,640), por lo que es esperable un numero apreciable de errores en esa etiqueta.
- Las predicciones de genero y uso reflejan las etiquetas del dataset y no deben interpretarse como afirmaciones sobre personas.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas con alta confianza; conviene revisar predicciones antes de usos sensibles o de cara al cliente.
- La licencia del repositorio es MIT, pero los pesos preentrenados de ImageNet via `timm` pueden estar sujetos a terminos de uso no comercial; verificar antes de desplegar en produccion.
- No se documentan sesgos especificos ni evaluaciones de equidad; el desequilibrio de clases del dataset puede afectar a categorias poco frecuentes (reflejado en el F1 macro).
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/tharunsm/telor
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-dataset
- Notas de licencia de pesos preentrenados de `timm`: https://github.com/huggingface/pytorch-image-models#licenses
