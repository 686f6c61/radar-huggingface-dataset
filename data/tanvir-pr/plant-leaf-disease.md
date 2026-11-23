# tanvir-pr/plant-leaf-disease

## Resumen

`tanvir-pr/plant-leaf-disease` es un clasificador de imagenes de enfermedades de hojas de plantas publicado en Hugging Face por el usuario tanvir-pr. Se trata de una demo educativa construida sobre PlantVillage, un dataset academico de hojas individuales fotografiadas en condiciones de laboratorio, y utiliza una EfficientNet-B0 como backbone con aumentado de datos mediante color jitter. El modelo devuelve la clase de enfermedad predicha, una puntuacion de confianza y una superposicion Grad-CAM que indica las regiones de la imagen que han influido en la decision.

El repositorio tiene un tamano de 0.0 GB y cero descargas, lo que sugiere que se trata de un artefacto de curso (la model card menciona explicitamente "Covers course P11") mas que de un modelo pensado para produccion. No se declara pipeline en Hugging Face ni se publican pesos con formato estandar reconocible, y la model card describe la aplicacion como un Space de Gradio con `app.py` como punto de entrada.

Su relevancia es, por tanto, limitada y de caracter didactico: sirve como ejemplo minimo de clasificacion de imagenes con explicabilidad (Grad-CAM) y como referencia para quien quiera reproducir un flujo de transfer learning sobre PlantVillage. El propio autor advierte que es "educational demo only — not for field diagnosis".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN, transfer learning) |
| Parametros totales | no disponible (EfficientNet-B0 base: ~5,3 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas de clase estan en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; no se declaran safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card indica que el clasificador se basa en EfficientNet-B0, una red convolucional con escalado compuesto de profundidad, anchura y resolucion, adaptada mediante transfer learning al problema de clasificacion de enfermedades en hojas. El unico detalle de entrenamiento declarado es el uso de color jitter como aumento de datos, lo que sugiere que el autor intento mitigar la sensibilidad a variaciones de iluminacion y tono propias de las fotos de campo, aunque el dataset de origen sigue siendo PlantVillage.

No se especifican el numero de imagenes de entrenamiento, la particion train/val/test, el numero de epocas, la resolucion de entrada, el optimizador ni si se aplico congelacion parcial de capas. Tampoco se documenta la lista exacta de clases cubiertas, aunque por el contexto de PlantVillage se espera un conjunto de decenas de clases que combinan especie y patologia (por ejemplo, distintos tipos de roya, mancha bacteriana o mildiu en cultivos como tomate, patata, manzano o vid). Toda esta informacion debe considerarse no disponible.

La innovacion tecnica destacable es la integracion de Grad-CAM en la demo, que genera un mapa de calor sobre la imagen de entrada para visualizar las activaciones de la ultima capa convolucional. Esto aporta interpretabilidad basica, util en un contexto docente para discutir si el modelo atiende a lesiones reales o a artefactos del fondo.

## Capacidades

- Clasificacion de imagenes de hojas de plantas en clases de enfermedad (multiclase, numero exacto de clases no disponible).
- Salida de la clase predicha acompanada de una puntuacion de confianza.
- Generacion de mapas de saliency Grad-CAM superpuestos a la imagen original.
- Procesamiento de imagenes individuales subidas por el usuario a traves de una interfaz Gradio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multimodales mas alla de la vision de clasificacion (no genera texto descriptivo).
- Capacidades multilingues no disponibles; la interfaz y las etiquetas estan en ingles.

## Casos de uso

- Docencia en vision por computador: la demo sirve para ilustrar un pipeline completo de transfer learning con EfficientNet-B0, desde la carga de la imagen hasta la prediccion y la visualizacion Grad-CAM en un Space de Gradio.
- Ejercicios de interpretabilidad: el mapa Grad-CAM permite discutir en clase si el modelo focaliza la lesion de la hoja o zonas irrelevantes del fondo, un analisis habitual en cursos de explicabilidad.
- Prototipado rapido de interfaces: el `app.py` con Gradio puede reutilizarse como plantilla para demos de clasificacion de imagenes con explicabilidad en otros dominios.
- Evaluacion de sesgos de dataset: comparar predicciones sobre fotos de laboratorio frente a fotos de campo permite evidenciar el gap de dominio de PlantVillage, un caso de estudio clasico sobre generalizacion.
- Baseline de referencia: sirve como punto de partida para comparar arquitecturas mas grandes (EfficientNet-B3/B4, ViT) sobre el mismo dataset en trabajos academicos.
- Pruebas de integracion de Gradio: util para validar el despliegue de un Space con `sdk_version: 5.49.1` antes de migrar una demo mayor a infraestructura propia.
- No es adecuado para diagnostico agronomico real, tal como advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de 1-2 GB para EfficientNet-B0 a resoluciones tipicas de 224x224, aunque no se confirma en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060 o superior. Tambien puede ejecutarse en CPU con latencias de decenas de milisegundos por imagen.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: Gradio (el autor usa `sdk_version: 5.49.1`), y en general cualquier runtime de PyTorch o de exportacion a ONNX si se dispone de los pesos, que no se declaran en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tanvir-pr/plant-leaf-disease | EfficientNet-B0 | no disponible | no aplica | MIT | Hugging Face, repo de 0.0 GB, 0 descargas |
| EfficientNet-B0 (original, Tan & Le 2019) | CNN | ~5,3 M | no aplica | Apache 2.0 (implementacion de referencia) | Ampliamente disponible en torchvision y timm |
| ResNet-50 (baseline habitual en PlantVillage) | CNN | ~25,6 M | no aplica | BSD-3 / Apache 2.0 segun implementacion | Disponible en torchvision |
| ViT-B/16 (alternativa transformer) | Vision Transformer | ~86 M | no aplica | Apache 2.0 (segun implementacion) | Disponible en timm y Hugging Face |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- El autor declara explicitamente que es una demo educativa y no debe usarse para diagnostico de campo.
- Entrenado sobre PlantVillage, un dataset de hojas individuales en condiciones controladas; se espera una degradacion severa del rendimiento con fotos reales de campo (fondos complejos, iluminacion variable, oclusiones, multiples hojas).
- Riesgo elevado de sobreajuste a artefactos del dataset, como fondos uniformes o iluminacion de laboratorio.
- No se documenta la composicion del dataset, el numero de clases ni las metricas de validacion, lo que impide evaluar su calidad de forma objetiva.
- El repositorio tiene 0.0 GB, por lo que los pesos pueden no estar efectivamente publicados; conviene verificar antes de intentar cargarlo.
- No se declaran idiomas soportados ni pipeline en Hugging Face.
- La licencia MIT permite uso comercial del codigo y, en su caso, de los pesos, pero la falta de documentacion sobre el dataset subyacente impide confirmar la compatibilidad de licencias de las imagenes de entrenamiento.
- Riesgo de alucinacion en el sentido de falsos positivos con alta confianza sobre imagenes que no son hojas o que pertenecen a clases no cubiertas, al no documentarse un mecanismo de rechazo o clase "desconocida".
- Sin informacion sobre sesgos demograficos (no aplica) pero si sobre sesgos de dominio: especies y patologias no representadas en PlantVillage no seran reconocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanvir-pr/plant-leaf-disease
- Dataset PlantVillage (referencia del autor, no enlazado en la model card): no disponible como enlace directo en la informacion proporcionada
- Paper de EfficientNet (Tan & Le, 2019): no disponible como enlace en la informacion proporcionada
- Paper de Grad-CAM (Selvaraju et al., 2017): no disponible como enlace en la informacion proporcionada
- Repositorio de codigo, paper o blog del autor: no disponible
