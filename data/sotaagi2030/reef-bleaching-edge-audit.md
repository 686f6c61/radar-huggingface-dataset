# SOTAagi2030/Reef-Bleaching-Edge-Audit

## Resumen

Reef-Bleaching-Edge-Audit es un clasificador de imagenes publicado por el usuario SOTAagi2030 en HuggingFace, distribuido en formato ONNX y orientado a inferencia en el borde (edge inference). El modelo recibe fotogramas RGB de camaras de arrecife y los asigna a una de tres clases: `healthy`, `watch` y `bleached`. Su proposito declarado es el triaje offline de fotogramas de muestreo, es decir, priorizar que imagenes requieren revision por parte de un analista antes de recurrir a la verificacion de campo.

La relevancia del modelo radica en su enfoque de despliegue: al publicarse como artefacto ONNX bajo licencia Apache 2.0 y con la etiqueta `edge-inference`, esta pensado para ejecutarse en hardware con recursos limitados y sin conectividad estable, un escenario habitual en campanas de monitorizacion de arrecifes. El autor advierte de forma explicita que la herramienta no sustituye la verificacion sobre el terreno.

La informacion publicada es muy limitada: la model card no especifica arquitectura, numero de parametros, datos de entrenamiento ni resultados numericos de validacion. Ademas, el tamano del repositorio figura como 0.0 GB, lo que sugiere que los pesos no estan alojados en el repositorio o no son accesibles publicamente. Cualquier evaluacion seria del modelo requiere contactar con el autor o disponer del artefacto por otra via.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se ha declarado que sea MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Tarea (pipeline) | image-classification |
| Clases de salida | healthy, watch, bleached |
| Entrada | fotogramas RGB normalizados segun `deployment/camera_profile.yaml` |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no indica si se trata de una CNN, un transformer de vision, un hibrido o una destilacion de otro modelo, ni tampoco el numero de parametros, la resolucion de entrada o el regimen de preprocesado mas alla de la normalizacion definida en `deployment/camera_profile.yaml`. El unico dato estructural cierto es el formato de serializacion: ONNX, lo que implica que el grafo es portable entre runtimes compatibles (ONNX Runtime, TensorRT, OpenVINO) y que el modelo puede exportarse o ejecutarse con aceleracion especifica de hardware.

Tampoco se detallan los datos de entrenamiento: no se especifica el numero de imagenes, su procedencia geografica, la composicion de clases ni si se aplicaron tecnicas de aumento de datos, ajuste fino o aprendizaje por transferencia. Lo unico documentado es el esquema de validacion: el conjunto de auditoria contiene transectos de laguna reservados mediante un holdout por sitio de monitorizacion, con los ejemplos preservados en `audit/lagoon_holdout.jsonl`. Este diseno de particion por sitio es metodologicamente correcto para evitar fuga de informacion entre ubicaciones cercanas, pero no se publican las metricas obtenidas sobre esa particion.

## Capacidades

- Clasificacion de imagenes en tres categorias discretas: `healthy`, `watch` y `bleached`.
- Inferencia sobre fotogramas RGB de camaras de arrecife, previa normalizacion segun el perfil de camara definido por el autor.
- Ejecucion offline: el modelo no requiere conectividad de red durante la inferencia, segun su etiqueta `edge-inference`.
- Triaje y priorizacion de fotogramas para revision por analistas, no diagnostico definitivo.
- Exportacion e integracion mediante el estandar ONNX en runtimes compatibles.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, generacion de texto, vision generalista, audio ni modo de razonamiento extendido. Al ser un clasificador de imagenes, estas capacidades no aplican.

## Casos de uso

- Triaje offline de transectos en campanas de campo: el modelo puede ejecutarse a bordo de una unidad de computo portatil y asignar una etiqueta preliminar a cada fotograma capturado, de modo que el equipo en tierra priorice la inspeccion de las imagenes marcadas como `watch` o `bleached` cuando regrese a conectividad.
- Pre-filtrado de repositorios fotograficos de monitorizacion: en archivos historicos con decenas de miles de imagenes de transectos, el clasificador permite segmentar el material en las tres clases y reducir el volumen que un analista debe revisar manualmente.
- Auditoria de series temporales por sitio: dado que la particion de validacion del autor esta hecha por sitio de monitorizacion, el modelo puede emplearse para generar series de proporcion de fotogramas blanqueados a lo largo del tiempo y detectar cambios de tendencia en ubicaciones concretas.
- Integracion en plataformas AUV o ROV con computo a bordo: el formato ONNX facilita el despliegue en modulo embarcado, permitiendo clasificar mientras se navega y reducir el almacenamiento necesario al descartar o marcar fotogramas en el momento.
- Boyas o estaciones de monitorizacion con conectividad intermitente: el modelo puede ejecutarse localmente y emitir alertas agregadas cuando se detecta una proporcion elevada de fotogramas `bleached`, enviando unicamente resumenes cuando la red este disponible.
- Control de calidad de anotaciones humanas: el clasificador puede usarse como segunda opinion automatica sobre un subconjunto ya etiquetado por anotadores, de modo que las discrepancias se revisen para detectar errores sistematicos de etiquetado.
- Censos participativos o ciencia ciudadana: despliegue en equipos de bajo coste para que voluntarios obtengan una clasificacion preliminar de sus fotografias antes de enviarlas a un repositorio central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un esquema de validacion con transectos de laguna reservados por sitio de monitorizacion (`audit/lagoon_holdout.jsonl`), pero no incluye exactitud, F1, matriz de confusion ni ninguna otra metrica sobre ese conjunto. Tampoco se han encontrado en la busqueda web resultados independientes que evaluen este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que no se publica el numero de parametros ni la resolucion de entrada.
- GPU recomendadas: no disponible por la misma razon. El modelo, al estar en formato ONNX, es compatible con cualquier GPU soportada por el runtime elegido.
- Compatibilidad con GPU de consumo: no verificable con los datos publicados. El repositorio figura con un tamano de 0.0 GB, lo que indica que los pesos no estan alojados o no son accesibles, por lo que no puede confirmarse ninguna estimacion de memoria.
- Opciones de despliegue: al distribuirse como ONNX, los runtimes plausibles son ONNX Runtime (CPU y GPU), TensorRT, OpenVINO y proveedores de ejecucion sobre CPU ARM para dispositivos embebidos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagenes de este tipo.
- Latencia y throughput estimados: no disponibles. Dependen por completo de la arquitectura del modelo, que no se ha declarado.
- Nota importante: el requisito previo es obtener el artefacto ONNX, que no parece estar disponible en el repositorio publico.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de arquitectura, parametros ni metricas de este modelo, y la busqueda web realizada no devolvio resultados relevantes sobre clasificadores de blanqueamiento de arrecifes ni sobre alternativas comparables (los resultados obtenidos trataban sobre conversion de numerales y traduccion de texto, sin relacion con la tarea). Sin datos verificables de ninguna de las partes no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- No sustituye la verificacion de campo: el propio autor lo indica de forma explicita en la model card. La salida debe tratarse como triaje, no como diagnostico.
- Pesos no disponibles: el repositorio declara 0.0 GB de tamano, por lo que es probable que el artefacto ONNX no este publicado. Sin el archivo no es posible ejecutar ni evaluar el modelo.
- Ausencia total de especificaciones: no se conocen arquitectura, parametros, resolucion de entrada, datos de entrenamiento ni metricas de validacion, lo que impide estimar rendimiento, coste computacional o comportamiento fuera de la distribucion de entrenamiento.
- Riesgo de sesgo geografico y de dominio: la validacion se realiza sobre transectos de laguna, un unico tipo de habitat. No hay evidencia de que el modelo generalice a arrecifes de barrera, aguas profundas, otras regiones o condiciones de iluminacion y turbidez distintas.
- Riesgo de alucinacion en el sentido de falsos positivos o falsos negativos: al no publicarse matriz de confusion, se desconoce el comportamiento del modelo ante las clases minoritarias, algo critico en una tarea con clases desbalanceadas como el blanqueamiento.
- Dependencia del perfil de camara: la entrada debe normalizarse segun `deployment/camera_profile.yaml`. Usar el modelo con otro equipo, optica u ajustes de balance de blancos puede degradar las predicciones de forma no cuantificada.
- Sin informacion sobre idiomas: irrelevante para la tarea, pero la ficha de HuggingFace no declara idiomas soportados.
- Sin adopcion verificable: cero descargas y cero likes en el momento de la consulta. No hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe. No impone restricciones adicionales, pero la ausencia de pesos y de documentacion limita su utilidad practica.
- Fechas de publicacion y actualizacion (22 de septiembre de 2026) separadas por menos de un minuto, lo que sugiere un repositorio subido de forma automatizada y sin curacion posterior.

## Enlaces

- HuggingFace: https://huggingface.co/SOTAagi2030/Reef-Bleaching-Edge-Audit
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a un paper asociado, a un blog tecnico ni a un repositorio de codigo. Los resultados devueltos trataban sobre conversion de numerales y traduccion de texto, sin relacion con esta ficha.
- Rutas internas citadas en la model card (no verificables como enlaces publicos): `deployment/camera_profile.yaml` y `audit/lagoon_holdout.jsonl`.
