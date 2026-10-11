# voloshka3/beans-deit-tiny-lab

## Resumen

El modelo `voloshka3/beans-deit-tiny-lab` es un clasificador de imagenes de hojas de judia (bean) afinado a partir de `facebook/deit-tiny-patch16-224`, un transformer de vision (ViT) con destilacion (DeiT) de tipo tiny. Lo publica el usuario voloshka3 en HuggingFace y su proposito es distinguir entre tres clases: `angular_leaf_spot` (mancha angular de la hoja), `bean_rust` (roya de la judia) y `healthy` (hoja sana). Se trata de un modelo educativo, entrenado sobre el dataset publico AI-Lab-Makerere/beans, con un tamano muy reducido de 5.524.995 parametros.

El problema que aborda es la clasificacion de imagenes de patologias foliares en cultivos de judia, una tarea tipica de vision artificial aplicada a la agricultura. Su relevancia es limitada y estrictamente pedagogica o de prototipado: sirve como ejemplo reproducible de fine-tuning de un backbone DeiT-tiny con seguimiento de experimentos mediante MLflow, y como punto de partida para pipelines de diagnostico vegetal a mayor escala.

La informacion disponible no incluye datos sobre licencia, idiomas soportados, tipos de cuantizacion ni formato de pesos mas alla del safetensors indicado en los tags del repositorio. El propio autor advierte en la model card de que el modelo no esta validado para diagnostico agricola operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (ViT) con destilacion, DeiT-tiny (patch 16, resolucion 224x224) |
| Parametros totales | 5.524.995 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de vision, sin componente de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | image-classification |
| Numero de clases | 3 (`angular_leaf_spot`, `bean_rust`, `healthy`) |
| Dataset de entrenamiento | AI-Lab-Makerere/beans |
| Libreria | transformers |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura base es DeiT-tiny (`facebook/deit-tiny-patch16-224`), una variante compacta del Vision Transformer entrenada con destilacion desde un modelo profesor convolucional. El modelo divide la imagen de entrada de 224x224 pixeles en parches de 16x16, los proyecta a una secuencia de tokens y aplica un encoder transformer con atencion global. Al tratarse de la variante tiny, el backbone es de muy baja capacidad, lo que limita el coste computacional tanto en entrenamiento como en inferencia.

El fine-tuning se realizo sobre el dataset Beans de AI-Lab-Makerere, con un total de 600 imagenes de entrenamiento y solo 2 epocas. El autor indica que se probaron dos experimentos con distintas tasas de aprendizaje, registrados con MLflow, y que el modelo final se selecciono por exactitud de validacion. No se especifica en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion detallada del dataset (mas alla del nombre), ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no procede en una tarea de clasificacion visual, pero no se documenta ninguna estrategia de aumento de datos, regularizacion o ajuste fino por capas).

## Capacidades

- Clasificacion de imagenes en tres categorias discretas: mancha angular, roya y hoja sana.
- Entrada de imagen RGB a 224x224 pixeles, segun la configuracion heredada de `deit-tiny-patch16-224`.
- Inferencia rapida y de bajo coste, compatible con CPU, gracias a sus 5,5 millones de parametros.
- Integracion directa con la libreria `transformers` mediante `pipeline("image-classification")` y carga de pesos en formato safetensors.
- Compatible con endpoints de HuggingFace (`endpoints_compatible` aparece en los tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision adicional (deteccion, segmentacion), audio ni modo de razonamiento explicito.

## Casos de uso

- Prototipado academico de clasificacion fitopatologica: el modelo permite montar en minutos un cuaderno de demostracion que clasifique imagenes de hojas de judia en las tres clases del dataset Beans, utilizando el pipeline de `transformers` y sin necesidad de GPU.
- Docencia de transfer learning en vision: sirve como ejemplo completo de fine-tuning de un backbone DeiT-tiny con solo 600 imagenes y 2 epocas, con metricas de validacion y test reportadas y trazas de MLflow, lo que lo hace util para explicar el flujo completo de un experimento reproducible.
- Prueba de concepto de aplicacion movil agricola: al ocupar pocos megabytes (unos 11 MB en fp16 y unos 22 MB en fp32 para 5,5 M de parametros), puede empaquetarse en una aplicacion offline que ejecute inferencia en el propio dispositivo.
- Filtrado previo en un pipeline de anotacion: puede usarse como clasificador de baja latencia para preetiquetar lotes grandes de imagenes de hojas y reducir el trabajo manual de anotacion antes de una revision humana.
- Comparacion de backbones en investigacion: actua como linea base ligera frente a alternativas de mayor tamano (ViT-base, ConvNeXt) para medir la relacion entre capacidad del modelo y exactitud en un dataset pequeno.
- Monitorizacion continua con reentrenamiento: al ser un modelo pequeno y rapido de entrenar, encaja en un ciclo de reentrenamiento periodico con imagenes nuevas capturadas en campo, siempre bajo supervision agronomica y con validacion independiente.
- Verificacion de infraestructura (CI): su tamano minimo permite usarlo como modelo de humo en pruebas de Integracion Continua para validar que las dependencias de `transformers`, safetensors y el pipeline de inferencia funcionan correctamente.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son los reportados por el autor para este fine-tuning sobre el dataset Beans:

| Metrica | Valor |
|---|---|
| Exactitud de validacion | 0.9549 |
| Exactitud de test | 0.9297 |
| F1 macro de test | 0.9302 |

No se han publicado resultados de benchmarks estandar (ImageNet, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se dispone de comparaciones con otros modelos evaluados sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 5,5 millones de parametros, los pesos ocupan aproximadamente 22 MB en fp32 y unos 11 MB en fp16; el consumo real lo domina la activacion de la imagen de entrada y el runtime.
- GPU compatibles: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. Tambien puede ejecutarse en CPU sin problema y en aceleradores integrados.
- Cabe holgadamente en cualquier GPU de consumo; tambien en Raspberry Pi y en moviles modernos mediante exportacion a ONNX u otros runtimes.
- Opciones de despliegue: pipeline de `transformers` (PyTorch), exportacion a ONNX Runtime, TorchScript, y en general cualquier runtime de inferencia de vision. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no aplican a esta tarea.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos sobre el dataset Beans en la informacion disponible, ni resultados de este modelo frente a alternativas. Como referencia estructural, se pueden considerar los siguientes modelos de la misma familia o categoria, aunque no hay datos de rendimiento comparables:

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voloshka3/beans-deit-tiny-lab | 5.524.995 | Clasificacion de imagenes (3 clases) | Imagen 224x224, patch 16 | no disponible | HuggingFace |
| facebook/deit-tiny-patch16-224 (modelo base) | no disponible en la informacion proporcionada | Clasificacion de imagenes (ImageNet) | Imagen 224x224, patch 16 | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas (ViT-base, ConvNeXt, ResNet) | no disponible | Clasificacion de imagenes | no disponible | no disponible | no disponible |

No disponible: no se dispone de datos comparativos de rendimiento, contexto o licencia para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El propio autor indica que es un modelo educativo, evaluado sobre un dataset muy pequeno (600 imagenes de entrenamiento, 2 epocas) y no validado para diagnostico agricola operativo. No debe usarse para decisiones agronomicas reales sin validacion adicional.
- Sesgos conocidos: no se documentan. Con solo 600 imagenes de entrenamiento, es previsible un sesgo hacia las condiciones de captura, iluminacion, variedades de judia y geografias presentes en el dataset AI-Lab-Makerere/beans, pero no hay analisis publicado al respecto.
- Riesgo de sobreajuste y de alucinacion de clase: con 2 epocas de entrenamiento y un dataset reducido, el modelo puede asignar con alta confianza una de las tres clases a imagenes que no correspondan a ninguna de ellas. No se documenta umbral de rechazo ni clase "desconocida".
- Limitaciones de contexto e idioma: al ser un clasificador de imagenes, no tiene ventana de contexto textual ni capacidades multilingues. Solo procesa imagenes.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si se permite el uso comercial. Conviene verificar la licencia del dataset AI-Lab-Makerere/beans y del modelo base `facebook/deit-tiny-patch16-224` antes de cualquier uso en produccion.
- Caveats para produccion: 0 descargas y 0 likes en HuggingFace, sin validacion externa por parte de la comunidad; ausencia de documentacion sobre tipos de cuantizacion, version de `transformers` requerida y procesado previo exacto de las imagenes; el repositorio tiene un tamano de 0.0 GB declarado.
- El modelo distingue unicamente tres clases; cualquier otra patologia foliar sera clasificada erroneamente en una de ellas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/voloshka3/beans-deit-tiny-lab
- Modelo base: https://huggingface.co/facebook/deit-tiny-patch16-224
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-Lab-Makerere/beans
- Paper de DeiT (Training data-efficient image transformers): https://arxiv.org/abs/2012.12877
- Paper de ViT (An Image is Worth 16x16 Words): https://arxiv.org/abs/2010.11929
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo, su paper, su repositorio o demos. Los resultados devueltos por la busqueda no guardan relacion con el modelo ni con clasificacion de imagenes.
