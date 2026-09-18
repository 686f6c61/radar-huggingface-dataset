# tarabird90/dinov2s-roads

## Resumen

DINOv2-S Roads es un modelo de segmentacion semantica de imagen satelital orientado a la extraccion de redes viarias. Lo desarrolla el usuario tarabird90 en el marco de la contribucion al proyecto fAIr de Humanitarian OpenStreetMap Team (HOT), la plataforma de mapeo asistido por IA de la organizacion. Dado un chip RGB de 256x256 pixeles de imagery aerea o satelital, el modelo predice donde hay carretera y, para los pixeles que clasifica como viarios, que superficie tienen: pavimentada, pista sin pavimentar o senda peatonal.

Tecnicamente es un hibrido entre un codificador de vision preentrenado y una cabeza de segmentacion densa: usa DINOv2 ViT-S/14 con registros (22,1 M de parametros, pesos Apache-2.0 de timm) como encoder, al que se anade un cuello de piramide de caracteristicas aprendido y un decodificador UPerNet. La salida se desdobla en dos cabezas independientes, una binaria de presencia de carretera y otra de tres clases de superficie, decision de diseno que permite enmascarar la perdida de superficie donde no hay etiqueta sin contaminar el gradiente de la cabeza de carretera.

Su relevancia esta en el nicho: la extraccion de vias para mapeo humanitario es un problema de cuello de botella real en zonas donde OpenStreetMap esta incompleto, y este checkpoint esta pensado como base afinable dentro de fAIr con datos locales de OpenStreetMap y OpenAerialMap. Conviene advertir desde el principio que, en el momento de redactar esta ficha, los pesos (`dinov2s_roads.ckpt` y `dinov2s_roads.onnx`) no estan publicados: el repositorio contiene unicamente la licencia y la model card a la espera de que finalice el entrenamiento base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 DINOv2 con registros (codificador) + cuello FPN aprendido + decodificador UPerNet + dos cabezas de segmentacion |
| Parametros totales | 22,1 M en el codificador (`vit_small_patch14_reg4_dinov2.lvd142m`); total del conjunto codificador + cuello + decodificador no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada fija de 256x256 px, con reflect-pad interno a 266x266 (rejilla de 19x19 parches de 14 px) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no aplica (modelo de segmentacion de imagen, no procesa texto) |
| Licencia | AGPL-3.0-only (campo `license: other` con `license_name: agpl-3.0-only`) |
| Formato de pesos | `.ckpt` (PyTorch) y `.onnx` autocontenido (opset 17); ninguno de los dos esta publicado todavia |
| Entrada | tensor float32 `[-1, 3, 256, 256]` (RGB) |
| Salida | tensor float32 `[-1, 4, 256, 256]`; canal 0 logit de carretera, canales 1-3 pavimentada / pista sin pavimentar / senda |
| Resolucion de trabajo | chips de 256x256 px; datos de entrenamiento base a 30 cm/pixel (WorldView-3) |
| Pipeline declarado | image-segmentation |
| Libreria | PyTorch (exportable a ONNX Runtime) |
| Fecha de creacion del repositorio | 18-09-2026 |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder clasico adaptado a segmentacion densa. El codificador es un Vision Transformer pequeno (`vit_small_patch14_reg4_dinov2.lvd142m`) con parches de 14x14 pixeles y tokens de registro, preentrenado por el equipo de DINOv2 con licencia Apache-2.0. Del codificador se congelan todos los bloques salvo los cuatro ultimos bloques transformer, que se afinan con una tasa de aprendizaje mas baja. La salida del encoder alimenta un cuello de piramide de caracteristicas aprendido y despues un decodificador UPerNet, que genera un mapa fusionado del que leen las dos cabezas finales.

Las dos cabezas estan separadas de forma deliberada: una cabeza binaria de presencia de carretera y una cabeza de tres vias para la superficie. El motivo es de enmascaramiento de perdida: la perdida de superficie puede enmascararse por pixel alli donde la verdad de referencia de superficie es desconocida, sin tocar el gradiente de la cabeza de carretera, algo que no seria posible con una unica cabeza de cuatro clases. Como 256 no es multiplo del tamano de parche 14 del encoder, cada chip se rellena con reflect-pad hasta 266x266 (19x19 parches), se ejecuta el encoder una sola vez y se recorta de vuelta a 256x256 antes de que lean las cabezas; este procedimiento vive dentro del grafo exportado, de modo que el contrato externo se mantiene como entrada y salida limpias de 256x256. La exportacion a ONNX (opset 17) se valida con `onnx.checker.check_model` y se verifica contra PyTorch con una discrepancia maxima de 2e-7 en onnxruntime sobre CPU.

En cuanto a datos, el entrenamiento base usa etiquetas de SpaceNet 3 (imagenes WorldView-3 a 30 cm/pixel, licencia CC BY-SA 4.0), y las etapas posteriores de afinado estan previstas con imagery de OpenAerialMap (CC BY 4.0) y etiquetas de OpenStreetMap (ODbL). La model card no especifica el numero de tokens ni de imagenes de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en sentido estricto a este tipo de modelo). El entrenamiento base completado hasta la fecha cubre una sola area de interes de SpaceNet 3, Jartum (Khartoum); las otras tres (Las Vegas, Paris y Shangai) estan soportadas por el pipeline de datos pero ningun checkpoint completado ha entrenado sobre ellas.

## Capacidades

- Segmentacion semantica densa de carreteras en imagery aerea y satelital, a nivel de pixel, sobre chips RGB de 256x256.
- Clasificacion de superficie viaria en tres clases: pavimentada, pista sin pavimentar y senda peatonal (esta ultima solo tendra sentido tras el afinado con datos que contengan sendas).
- Prediccion binaria de presencia de carretera mediante cabeza independiente, enmascarable por separado respecto a la cabeza de superficie.
- Inferencia en PyTorch y en ONNX autocontenido (opset 17), con paridad numerica verificada frente al modelo original.
- Base para fine-tuning en la plataforma fAIr con datos propios del mapeador (OpenStreetMap y OpenAerialMap).
- Salida compatible con un paso posterior de vectorizacion que convierte la mascara en linestrings de carretera (el modelo no realiza esa conversion por si mismo).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de texto: es un modelo puramente visual.
- No soporta vision generalista tipo VQA ni descripcion de imagenes; su salida es exclusivamente una mascara de segmentacion.

## Casos de uso

- Mapeo humanitario asistido en HOT fAIr: el modelo se ejecuta sobre el area de interes de un mapeador y devuelve una mascara de carreteras como sugerencia que la persona revisa antes de incorporarla a OpenStreetMap; encaja con el flujo de trabajo de fAIr, que ya cubre extraccion de edificios.
- Afinado local sobre datos de un mapeador: el checkpoint base sirve como punto de partida para reentrenar con chips propios de OpenAerialMap y etiquetas de OpenStreetMap, ajustando el modelo a la resolucion, el angulo y el estilo de etiquetado de una region concreta.
- Respuesta a desastres: extraccion rapida de la red viaria en imagery post-evento para apoyar la planificacion logistica, con la salvedad de que las predicciones son sugerencias sujetas a revision humana y no deben importarse de forma automatica.
- Analisis de superficie para enrutamiento: la distincion entre pavimentada, pista sin pavimentar y senda aporta informacion de transitabilidad que una mascara binaria de carretera no ofrece, util para estudios de accesibilidad y planificacion de rutas en terreno no pavimentado.
- Actualizacion de redes viarias en regiones con cartografia incompleta: la mascara resultante pasa a un paso de grafo y vectorizacion que produce linestrings, lo que permite detectar vias ausentes en la base de datos a partir de imagery reciente.
- Control de calidad y deteccion de cambios: comparar la mascara predicha con la red de OpenStreetMap existente permite localizar discrepancias que merecen revision por parte de la comunidad.
- Generacion de capas de referencia para analisis geoespacial: la salida por pixel puede rasterizarse o vectorizarse y combinarse con otras capas para estudios de conectividad, cobertura de servicios o planificacion urbana.
- Desarrollo de modelos derivados: al ser un encoder pequeno (22,1 M de parametros en el backbone) y exportable a ONNX, sirve como base ligera para experimentos de segmentacion viaria con requisitos de computo muy bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio todavia no incluye los pesos ni la seccion de resultados, y que ninguna cifra se reportara sin haber sido medida. Tampoco se proporcionan numeros de MMLU, HumanEval, GSM8K ni equivalentes para segmentacion (IoU, F1, precisión/recall por clase) en el material disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 22,1 M de parametros en el codificador y una entrada de un unico chip de 256x256, los pesos en FP32 ocupan del orden de 90 MB solo para el encoder, y la activacion a esa resolucion es minima; el conjunto completo cabe holgadamente por debajo de 1 GB de VRAM. Cifra estimada a partir del recuento de parametros, no publicada por el autor.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores. Las A100, H100 o RTX 4090 solo tendrian sentido para procesar grandes volumenes de chips en lote, no por requisitos de memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, y tambien en CPU para inferencia puntual, dado el tamano del modelo y que la exportacion ONNX se ha verificado sobre CPU.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (formato recomendado por el autor, autocontenido y verificado), y la integracion dentro del pipeline de fAIr. vLLM, llama.cpp, Ollama y TGI no son aplicables: son herramientas para modelos de lenguaje y este es un modelo de segmentacion de imagen.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia ni rendimiento en imagenes por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de alternativas, por lo que la comparacion se limita a caracteristicas estructurales verificables. No se dispone de cifras comparativas de calidad de segmentacion.

| Modelo | Parametros | Entrada | Tarea | Licencia |
|---|---|---|---|---|
| DINOv2-S Roads (este modelo) | 22,1 M en el codificador; total no disponible | Chip RGB 256x256 px | Segmentacion viaria multiclase (carretera + superficie) | AGPL-3.0-only |
| DINOv2 ViT-S/14 con registros (`vit_small_patch14_reg4_dinov2.lvd142m`) | 22,1 M | Imagen variable segun configuracion | Backbone de vision generalista, sin cabeza de segmentacion | Apache-2.0 |
| Otros modelos de extraccion viaria comparables | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables es con el backbone DINOv2-S del que deriva: este modelo anade el cuello FPN, el decodificador UPerNet y las dos cabezas, cambia la licencia a AGPL-3.0-only y restringe el dominio a segmentacion viaria. Las busquedas web realizadas no devolvieron informacion relevante sobre modelos alternativos de extraccion de carreteras.

## Limitaciones y advertencias

- Pesos no publicados: en el momento de redactar esta ficha el repositorio solo contiene la licencia y la model card. No es posible ejecutar el modelo ni reproducir resultado alguno.
- Cobertura geografica muy restringida: el entrenamiento base completado cubre una unica area de interes de SpaceNet 3, Jartum. Las Vegas, Paris y Shangai estan soportadas por el pipeline pero ningun checkpoint completado ha entrenado sobre ellas, por lo que no hay evidencia sobre esas regiones.
- Predicciones de sendas no fiables en el checkpoint base: el esquema de SpaceNet 3 no incluye la clase senda (verificado sobre las 56.251 entidades de las cuatro areas), por lo que la cabeza de senda se enmascara en la salida en lugar de emitir una prediccion sin supervision. La clase solo sera util tras el afinado con datos que contengan sendas.
- Metricas no independientes: los resultados reportados (cuando se publiquen) proceden de una particion de validacion de la misma ejecucion de entrenamiento base, no de una region independiente reservada.
- Generalizacion no evaluada: se desconoce el comportamiento fuera de Jartum y fuera de la resolucion y los angulos de toma de SpaceNet 3.
- Alucinacion y falsos positivos: como cualquier segmentador, puede producir trazas viarias inexistentes o interrumpidas; las predicciones son sugerencias para revision humana y no deben importarse en OpenStreetMap de forma automatica.
- Dependencia de un paso posterior: el modelo devuelve una mascara de segmentacion; la conversion a linestrings de carretera requiere un paso externo de grafo y vectorizacion.
- Licencia AGPL-3.0-only: cubre tanto el codigo como los pesos liberados. Incluye la clausula de uso en red, de modo que quien despliegue un derivado como servicio alojado debe revelar el codigo fuente a los usuarios de ese servicio.
- Incertidumbre legal sobre pesos derivados: los pesos derivan de un backbone Apache-2.0 y de datos de entrenamiento bajo CC BY-SA 4.0, CC BY 4.0 y ODbL. La model card senala que no esta juridicamente resuelto si las clausulas de share-alike se extienden a los pesos entrenados, y recomienda a cada usuario hacer su propia evaluacion.
- Idiomas: no aplica, es un modelo de vision sin componente de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarabird90/dinov2s-roads
- Codigo, pipeline de entrenamiento y post-procesado: https://github.com/tlerias/fair-roads
- Plataforma fAIr de HOT: https://github.com/hotosm/fAIr
- Backbone de referencia en timm: `vit_small_patch14_reg4_dinov2.lvd142m` (sin enlace directo proporcionado en la informacion disponible)
- Paper, blog o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
