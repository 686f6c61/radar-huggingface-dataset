# Techyyashh/krishimitra-model

## Resumen

KrishiMitra-model es una conversión a formato ONNX del modelo `neghani/plantvillage-mobilenetv2`, publicada por el usuario Techyyashh como modelo de arranque para la aplicación KrishiMitra, una herramienta de diagnostico de enfermedades de plantas. El modelo original es una MobileNetV2 (ancho 1.0, entrada 224 px) afinada sobre el conjunto de datos PlantVillage para clasificar 38 clases de enfermedades y estados sanitarios de cultivos. La conversión a ONNX no introduce cambios en los pesos: el autor atribuye todo el merito del entrenamiento a los autores originales.

El modelo resuelve una tarea de clasificacion de imagenes cerrada: dada una fotografia de hoja, devuelve una de las 38 etiquetas de PlantVillage. Es relevante para despliegues ligeros en entornos agricolas porque MobileNetV2 es una arquitectura compacta pensada para inferencia en dispositivos con recursos limitados, y el formato ONNX permite ejecucion portable con ONNX Runtime en servidores, movil o navegador.

La ficha debe leerse con cautela: la propia model card original reporta una exactitud del 99,2 % sobre el split de test de PlantVillage, pero solo aproximadamente un 16 % sobre un pequeno conjunto de imagenes reales de campo. Se trata, por tanto, de un modelo de demostracion y no de un clasificador validado para uso agronomico en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (ancho 1.0, entrada 224 x 224) |
| Parametros totales | no disponible (MobileNetV2 1.0 ronda los 3,5 M de parametros, cifra no confirmada en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, clasificacion de imagen) |
| Tipos de cuantizacion | no disponible (el tag `base_model:quantized` sugiere una variante cuantizada del modelo base, sin detalle de esquema) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (libreria `onnx`) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Tarea | Clasificacion de imagenes (`image-classification`) |
| Numero de clases | 38 (PlantVillage, listadas en `classes.json`) |
| Preprocesado | Redimensionar lado corto a 256, recorte central a 224, normalizacion media [0.5, 0.5, 0.5] / desviacion [0.5, 0.5, 0.5] |
| Modelo base | neghani/plantvillage-mobilenetv2 |
| Dataset de entrenamiento | PlantVillage |
| Tamano del repo | 0.0 GB (segun Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV2, una red convolucional con bloques residuales invertidos y convoluciones separables en profundidad, disenada para inferencia eficiente en dispositivos de baja potencia. La entrada es una imagen RGB de 224 x 224 con normalizacion a media y desviacion 0.5. La salida es una distribucion sobre 38 clases de PlantVillage correspondientes a combinaciones de cultivo y enfermedad o estado sano.

El entrenamiento no lo realizo el autor de esta ficha: los pesos proceden de `neghani/plantvillage-mobilenetv2`, y la model card remite a la tarjeta original para datos, metricas y limitaciones. No se detalla en la informacion proporcionada el numero de imagenes, la composicion exacta del dataset, ni si hubo aumento de datos, ajuste fino de hiperparametros o tecnicas de regularizacion. La unica innovacion tecnica documentada es la exportacion a ONNX para portabilidad de despliegue.

## Capacidades

- Clasificacion de imagenes de hojas de plantas en 38 clases de PlantVillage (cultivo + enfermedad o estado sano).
- Inferencia portable mediante ONNX Runtime en multiples plataformas (servidor, movil, navegador).
- Modelo de vision puro: no genera texto, no razona y no responde a instrucciones.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No incorpora modo de razonamiento, vision generativa, audio ni otras modalidades.

## Casos de uso

- Aplicacion movil de diagnostico de cultivos: el modelo ONNX puede integrarse en la app KrishiMitra para clasificar una foto de hoja en el dispositivo, aprovechando el bajo coste computacional de MobileNetV2.
- Prototipado rapido de un clasificador de enfermedades: sirve como linea base funcional mientras se entrena un modelo propio adaptado a cultivos y condiciones locales.
- Demostraciones y pruebas de concepto en agricultura de precision: permite validar el flujo completo captura de imagen, preprocesado, inferencia y presentacion de resultado sin depender de infraestructura pesada.
- Inferencia en el borde (edge computing): al ser una red convolucional ligera en formato ONNX, puede ejecutarse en dispositivos con CPU modesta o aceleradores de bajo consumo en campo.
- Servicio web de clasificacion: desplegable con ONNX Runtime en un endpoint HTTP que recibe una imagen y devuelve la etiqueta y la confianza para integraciones con sistemas de gestion agricola.
- Filtrado previo en pipelines de analisis de imagenes agricolas: clasificar rapidamente las imagenes recibidas antes de derivarlas a un modelo mayor o a revision humana.
- Educacion y formacion agronomica: herramienta de apoyo para ilustrar la identificacion visual de patologias comunes en un entorno controlado.

## Benchmarks y rendimiento

La unica metrica reportada en la informacion proporcionada es la de la model card original:

| Conjunto de evaluacion | Exactitud reportada |
|---|---|
| PlantVillage, split de test | 99,2 % |
| Conjunto pequeno de campo real | aproximadamente 16 % |

No se han publicado en la informacion disponible resultados de benchmarks comparativos estandar (por ejemplo, comparaciones con otros clasificadores de PlantVillage) ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; MobileNetV2 es una red muy pequena y la inferencia en GPU requiere tipicamente menos de 1 GB de VRAM, aunque no se aporta una cifra oficial.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; una RTX 4090, A100 o H100 ejecutaria la inferencia con holgura. En la practica, CPU es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU y dispositivos moviles.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato), con posibilidad de conversion a TensorRT, OpenVINO o ejecucion en navegador via ONNX Runtime Web.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Techyyashh/krishimitra-model | MobileNetV2 1.0, 224 | 38 (PlantVillage) | ONNX | Apache-2.0 | Conversion ONNX del modelo de neghani; exactitud de campo reportada muy baja (~16 %) |
| neghani/plantvillage-mobilenetv2 | MobileNetV2 | 38 (PlantVillage) | no disponible | Apache-2.0 | Modelo base original; misma exactitud de test reportada (99,2 %) |
| Otros clasificadores de PlantVillage | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Brecha severa entre laboratorio y campo: 99,2 % en PlantVillage frente a aproximadamente 16 % en un conjunto real de campo, lo que indica sobreajuste a las condiciones controladas del dataset original.
- Solo 38 clases cerradas de PlantVillage: no reconoce cultivos, enfermedades ni condiciones fuera de ese conjunto.
- Sesgos de dataset: PlantVillage contiene imagenes con fondos controlados y condiciones de iluminacion homogeneas, lo que penaliza la generalizacion a fotografias reales.
- Riesgo de predicciones erroneas con alta confianza: un clasificador sobreajustado puede asignar etiquetas incorrectas de forma segura, con impacto potencial en decisiones de tratamiento.
- Uso exclusivamente como apoyo a la decision: la model card advierte explicitamente que debe confirmarse con un experto agricola local (KVK) antes de aplicar cualquier producto quimico.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Modelo de arranque: el autor lo describe como solucion provisional hasta entrenar un modelo propio, por lo que no debe tratarse como producto final.
- Sin datos de rendimiento por clase, matriz de confusion ni evaluacion por cultivo, lo que impide valorar que clases concentran los errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Techyyashh/krishimitra-model
- Modelo base: https://huggingface.co/neghani/plantvillage-mobilenetv2
- Repositorio de la aplicacion KrishiMitra: https://github.com/Techyyashh/krishimitra
