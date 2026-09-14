# sugam24/geonusaf-tcsegformer-legacy-c6-tc_full-legacy_kfold-fold1

## Resumen

TC-SegFormer es un modelo de segmentacion semantica de imagenes de teledeteccion desarrollado por el usuario sugam24 dentro del proyecto GeoNUSAF. Se trata de un ajuste fino sobre `nvidia/segformer-b0-finetuned-ade-512-512`, al que se anade una rama de detalle residual a media resolucion (variante `v2-residual`) y una banda de agregacion espacial condicionada por clase (CSA). El checkpoint publicado corresponde a la receta `tc_full` con esquema de 6 clases (Residential, Road, River, Forest, UnusedLand, Agricultural) y particion `legacy_kfold` de 3 folds con semilla 42, en concreto el fold 1.

El modelo resuelve un problema clasico de teledeteccion: asignar una etiqueta de cobertura del suelo a cada pixel de una tesela de imagen aerea o satelital. Segun la model card, alcanza un mIoU agrupado de 0,7718 sobre las 6 clases, una exactitud global (OA) de 0,9227 y un kappa de 0,8785 en validacion, con un mejor epoch en el 97 de un entrenamiento de 300 epocas.

Es relevante sobre todo como artefacto de investigacion y como linea base reproducible dentro del proyecto GeoNUSAF, pero tambien como caso de estudio de buenas practicas: la propia model card advierte de una fuga de variantes grave (el 91,9% de las imagenes de validacion tienen un espejo en entrenamiento) y de que la receta es anterior al protocolo experimental definitivo, por lo que sus cifras no deben compararse con las de ejecuciones posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TC-SegFormer `v2-residual`: encoder jerarquico tipo transformer (MiT-B0, atencion eficiente) con rama de detalle residual a H/2 y banda CSA, sobre el checkpoint `nvidia/segformer-b0-finetuned-ade-512-512`; tarea de segmentacion semantica densa |
| Parametros totales | No disponible en la model card. El backbone publicado SegFormer-B0 tiene aproximadamente 3,8 millones de parametros; el tamano exacto del checkpoint derivado (con la rama de detalle anadida) no se especifica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de modelos de lenguaje. Entrada de imagen de 512 x 512 px heredada del checkpoint base |
| Tipos de cuantizacion | No disponible. No se documentan pesos cuantizados ni variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | No aplica (modelo de vision). Las etiquetas de clase y la documentacion estan en ingles |
| Licencia | No disponible (campo vacio tanto en HuggingFace como en la model card) |
| Formato de pesos | No confirmado. El repositorio ocupa 1,1 GB y usa la libreria `transformers`; no se explicita si los pesos estan en safetensors, bin de PyTorch u otro formato |
| Version de arquitectura | `v2-residual` |
| Receta de entrenamiento | `tc_full` (detail=True, csa=True, sampler=True, lovasz=True, cldice=True) |
| Esquema de clases | 6: Residential, Road, River, Forest, UnusedLand, Agricultural; pixeles sin etiqueta ignorados (indice 255) |
| Particion de datos | `legacy_kfold`, 3 folds, semilla 42, fold 1 |
| Mejor epoca | 97 (de 300 epocas, paciencia 25) |
| Fecha de creacion del repositorio | 2026-09-13 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

SegFormer combina un encoder jerarquico de transformers (serie MiT) que produce caracteristicas multiescala sin codificacion posicional explicita, con un decodificador ligero basado en capas MLP que fusiona esas escalas. TC-SegFormer mantiene esa base y anade dos componentes propios: una rama de detalle residual que opera a resolucion H/2 para recuperar bordes finos, y una banda CSA (agregacion espacial condicionada) con umbrales por clase tau=[0,6; 0,35; 0,35; 0,6; 0,6; 0,6], peso minimo w_min=0,25 y un limite de 14,07 m sobre teselas de 703,5 m, equivalente a 46,90 px. La funcion de perdida combina Lovasz y clDice junto con el termino de entropia cruzada ponderada, y el muestreo (`sampler=True`) busca compensar el desbalance entre clases.

El entrenamiento sigue la receta `legacy_recipe`, anterior al protocolo experimental definitivo: AdamW con tasa de aprendizaje plana de 3e-5, weight decay 0,01, modo `new_boosted` (peso x10,0 para la clase "new"), sin scheduler, sin recorte de gradiente y sin EMA. Se entrenaron 300 epocas con paciencia de 25 y batch de 16, con transformacion de validacion "clean" y metrica de seleccion `val_miou_core6`. La model card no detalla el numero de tokens de imagen ni la composicion exacta del dataset de entrenamiento; solo indica el esquema de clases, el modo de particion y el uso de pesos de clase `legacy_inv_freq` calculados sobre el conjunto completo sin limite superior (cap None).

## Capacidades

- Segmentacion semantica densa de imagenes aereas o satelitales en 6 clases de cobertura del suelo (Residential, Road, River, Forest, UnusedLand, Agricultural).
- Prediccion a nivel de pixel con resolucion de entrada de 512 x 512 px, adecuada para teselas de teledeteccion.
- Manejo explicito de pixeles sin etiqueta (indice 255 ignorado), lo que permite entrenar y evaluar con mascaras incompletas.
- Recuperacion de detalles finos gracias a la rama residual a H/2 y a la banda CSA, orientada a bordes de infraestructuras lineales.
- Etiquetado compatible con el ecosistema HuggingFace: el repositorio incluye la etiqueta `endpoints_compatible`, por lo que puede desplegarse mediante Inference Endpoints.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, function calling, capacidades de agente ni modo de pensamiento. No es un modelo de lenguaje.
- No se documentan capacidades multilingues ni multimodalidad mas alla de la imagen de entrada.

## Casos de uso

- Cartografia de cobertura del suelo: dado un mosaico de ortoimagenes, el modelo clasifica cada pixel en las 6 clases y genera un raster tematico que puede vectorizarse posteriormente en un SIG.
- Actualizacion de bases de datos de ocupacion del suelo: al automatizar la clasificacion de teselas, se reducen los ciclos de revision manual en organismos de catastro o agencias medioambientales.
- Monitorizacion agricola: la clase Agricultural obtiene un IoU de 0,8184, suficiente para delimitar parcelas cultivadas y hacer seguimiento de cambios de uso entre campanas.
- Seguimiento forestal: con un IoU de 0,8974 en Forest, el modelo sirve para detectar perdida o ganancia de masa forestal comparando clasificaciones de fechas distintas.
- Cartografia hidrografica: la clase River alcanza una exhaustividad (PA) de 0,9785, util para delinear cauces y detectar cambios en la red fluvial, asumiendo su menor precision (UA 0,6817).
- Planificacion urbana: la clase Residential tiene un IoU de 0,8988 y una precision (UA) de 0,9764, lo que la hace apropiada para medir expansion urbana con pocos falsos positivos.
- Linea base para investigacion: el checkpoint permite reproducir el fold 1 de la particion `legacy_kfold` y comparar variantes de receta (con y sin detail, CSA, Lovasz o clDice) en experimentos controlados.
- Etiquetado asistido (pre-anotacion): se puede usar para generar mascaras preliminares que un anotador humano corrija, reduciendo el coste de crear nuevos datasets de teledeteccion.

## Benchmarks y rendimiento

Metricas de validacion declaradas en la model card (receta `legacy_recipe`, fold 1 de `legacy_kfold`):

| Metrica | Valor |
|---|---|
| mIoU de validacion (estimador promediado por batch) | 0,7159 |
| mIoU agrupado (todas las clases puntuadas) | 0,7718 |
| mIoU agrupado (6 clases reales) | 0,7718 |
| mIoU en la region nuclear CSA (6 clases) | 0,9057 |
| Exactitud global (OA) | 0,9227 |
| Kappa | 0,8785 |

Rendimiento por clase (validacion, agrupado):

| Clase | IoU | F1 | PA (exhaustividad) | UA (precision) |
|---|---|---|---|---|
| Residential | 0,8988 | 0,9467 | 0,9187 | 0,9764 |
| Road | 0,5550 | 0,7138 | 0,9084 | 0,5879 |
| River | 0,6716 | 0,8036 | 0,9785 | 0,6817 |
| Forest | 0,8974 | 0,9459 | 0,9601 | 0,9322 |
| UnusedLand | 0,7894 | 0,8823 | 0,9131 | 0,8535 |
| Agricultural | 0,8184 | 0,9001 | 0,9226 | 0,8787 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Ademas, la propia model card advierte de que estas cifras corresponden a una receta anterior al protocolo y a una particion con fuga de variantes, por lo que no son directamente comparables con ejecuciones protocolizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con un backbone de aproximadamente 3,8 millones de parametros, los pesos en fp32 ocupan del orden de 15-20 MB; una tesela de 512 x 512 px requiere bastante menos de 2 GB de VRAM con batch 1. Estimacion orientativa, no confirmada por el autor.
- GPU recomendadas: cualquier GPU moderna es suficiente; una NVIDIA GTX 1650, RTX 3050 o superior ejecuta inferencia sin problema. Para entrenamiento con batch 16 se recomienda al menos 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 sobran).
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 4 GB o mas, e incluso es viable la inferencia en CPU para volumenes moderados de teselas.
- Opciones de despliegue: `transformers` con PyTorch, HuggingFace Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`), exportacion a ONNX o TorchScript para servir con ONNX Runtime o TorchServe. No hay soporte nativo de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por tesela ni de imagenes por segundo.
- Almacenamiento: el repositorio ocupa 1,1 GB, un tamano desproporcionado para el numero de parametros del modelo, lo que sugiere que incluye estados de optimizador u otros artefactos de entrenamiento.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales y no a rendimiento.

| Modelo | Parametros | Resolucion de entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TC-SegFormer (este checkpoint) | No disponible (backbone ~3,8 M) | 512 x 512 px | 6 (teledeteccion) | No disponible | HuggingFace, libreria `transformers` |
| nvidia/segformer-b0-finetuned-ade-512-512 | ~3,8 M | 512 x 512 px | 150 (ADE20K, escenas interiores/exteriores) | No disponible en la informacion facilitada | HuggingFace, modelo base publico |
| SegFormer-B1 / B2 (variantes mayores) | Aproximadamente 13 M / 27 M (referencia del paper original) | Configurable | Segun ajuste fino | No disponible en la informacion facilitada | HuggingFace |
| Arquitecturas CNN clasicas (U-Net, DeepLabV3+) | Variable | Variable | Segun ajuste fino | Variable segun implementacion | Multiples repositorios |

La comparacion de rendimiento con estos modelos no es posible con los datos disponibles: el mIoU de 0,7718 corresponde a un esquema de 6 clases y a una particion con fuga, mientras que las cifras publicas de otros modelos usan sus propios esquemas y conjuntos de evaluacion.

## Limitaciones y advertencias

- Fuga de variantes en la validacion: 375 de 408 imagenes de validacion (91,9%) tienen una version espejo en el conjunto de entrenamiento. Esto invalida el uso de estas metricas como estimacion de generalizacion.
- Receta no protocolizada: el propio autor indica que la receta `legacy_recipe` es anterior al protocolo experimental (AdamW plano, sin scheduler, sin recorte de gradiente y sin EMA), por lo que los numeros no deben compararse con ejecuciones posteriores.
- Licencia no especificada: no se declara licencia ni en HuggingFace ni en la model card. No hay autorizacion explicita para uso comercial y persiste incertidumbre sobre los derechos del dataset de entrenamiento.
- Clase Road debil: IoU de 0,5550 y precision (UA) de 0,5879. Las carreteras se detectan con muchos falsos positivos, un problema tipico en estructuras lineales finas.
- Precision limitada en River: PA de 0,9785 frente a UA de 0,6817, lo que indica sobre-segmentacion de la clase (se etiqueta como rio superficie que no lo es).
- Riesgo de sobreajuste al dominio: no se documenta la procedencia, el sensor ni la resolucion espacial del dataset de entrenamiento, por lo que se desconoce el comportamiento ante cambios de sensor, estacion, iluminacion o zona geografica.
- Esquema de clases fijo: el modelo solo produce las 6 clases definidas. No se puede reutilizar directamente para otros esquemas taxonomicos sin reentrenamiento.
- Sin informacion de calibracion ni umbrales de confianza: no se publican curvas de fiabilidad, temperaturas ni mapas de incertidumbre, lo que dificulta filtrar predicciones de baja confianza en produccion.
- Herramienta de investigacion, no de produccion: por la combinacion de fuga de datos, receta no protocolizada y licencia indeterminada, este checkpoint no deberia desplegarse en un sistema operativo real sin un reentrenamiento y una evaluacion independientes.
- Ausencia total de capacidades de lenguaje: no genera texto, no razona, no usa herramientas y no acepta prompts. Cualquier descripcion automatizada de los resultados requiere un modelo aparte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sugam24/geonusaf-tcsegformer-legacy-c6-tc_full-legacy_kfold-fold1
- Modelo base sobre el que se construye: https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512
- Paper de la arquitectura SegFormer (referencia del backbone, no citado en la model card): https://arxiv.org/abs/2105.15203
- Repositorio oficial de SegFormer (referencia de la arquitectura base, no citado en la model card): https://github.com/NVlabs/SegFormer

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre el proyecto GeoNUSAF; los resultados obtenidos eran paginas de soporte de Google sin relacion con el contenido. No se han encontrado papers, blogs, demos ni repositorios adicionales del autor.
