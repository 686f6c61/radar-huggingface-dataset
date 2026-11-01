# tatjr13/fallen-coco704-native64-steer7c-20261026

## Resumen

Fallen native64 — Steer7 ArmC es un detector de objetos de una sola clase (`fallen person`) exportado a ONNX por el usuario tatjr13. Se trata de un candidato de publicación derivado de un modelo base inicializado con COCO público y ajustado específicamente para la detección de personas caídas, con una arquitectura de salida densa tipo ancla (anchor-based) que produce un tensor `[1,5,10164]` a partir de una entrada estática `[1,3,704,704]`. El modelo está pensado para integrarse en un consumidor que ejecuta ONNX Runtime con OpenCV, solicitando primero CUDA y cayendo a CPU si no está disponible.

El interés técnico del artefacto reside en su empaquetado y en el proceso de validación documentado: paridad numérica entre Torch nativo y ONNX Runtime, verificación de determinismo en CPU y comparación offline mediante asignación húngara contra resultados previos. No obstante, el propio autor advierte de que no se trata de un despliegue alojado, ni de un resultado oficial de calidad, ni de una aprobación independiente (Gate Zero), por lo que debe considerarse un candidato en fase de aceptación local.

El modelo no es un LLM ni un modelo multimodal generativo: es un detector especializado de un solo canal de clase, sin capacidades de texto, tool calling ni razonamiento. Su relevancia es acotada a pipelines de visión por computador orientados a seguridad y monitorización, y su licencia AGPL-3.0 condiciona fuertemente su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos denso tipo ancla (anchor-based), salida `[1,5,10164]`; backbone no especificado en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada estatica `[1,3,704,704]`) |
| Tipos de cuantizacion | no disponible (solo se publica el grafo ONNX en precision original) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (entrada estatica 704x704, salida densa 10164 anclas x 5 valores) |

Otros parametros operativos declarados: confianza fija 0.1, NMS con IoU 0.4, maximo 300 detecciones, clase unica `fallen person`, sin segundo detector, sin etapa de agreement y sin TTA.

## Arquitectura y entrenamiento

La informacion disponible describe un detector de una sola etapa con cabeza densa sobre 10164 anclas y cinco valores por ancla (cuatro coordenadas mas confianza de clase, dado que solo hay una clase). La entrada es estatica a 704x704 pixeles y el grafo exportado mantiene los bytes sin modificar respecto al checkpoint `1a46809f306ca411d4c3790cd826076d5f63dd9eeaf01e43c4bd4cc1e4082203`. No se detalla el backbone, el numero de capas ni el coste computacional (FLOPs), datos que figuran como no disponibles.

El entrenamiento parte de una inicializacion propia sobre COCO publico y anade un ajuste con 472 imagenes base completas mas visitas programadas a OXY01 (parcial 7, conteo 8, residual 1, 34 visitas programadas). La BCE de anclas no asignadas se suprime unicamente en ocurrencias parciales marcadas, manteniendo sin cambios los indices de ocurrencia base. Las imagenes y etiquetas de entrenamiento, asi como el material de custodia, no se publican. El autor declara explicitamente que no reclama etiquetas de clave oficial ni calidad prospectiva en held-out.

La validacion reportada incluye siete comparaciones Torch nativo frente a ONNX Runtime guardado previamente, con tolerancias rtol 1e-4 / atol 1e-3 en salida densa y desviacion de coordenadas <=1 pixel y confianza <=1e-4, con clases y conteos exactos. En CPU con ORT 1.26.0 se midieron 615 llamadas (3 de constructor, 2 warmups, 10 de checker y 600 emparejadas), con 43.815495 ms en la octava de diez y p95 de 59.39310225 ms con dos llamadores concurrentes, ambas por debajo de 100 ms en cuatro nucleos fisicos 40-43 del host autorizado. Tambien se verifico determinismo exacto de salida cruda y publica, y una comparacion húngara offline contra resultados ORT 1.30 sin inferencia adicional.

## Capacidades

- Deteccion de una unica clase: `fallen person`, con salida densa de 10164 anclas y cinco valores por ancla.
- Entrada de imagen estatica RGB de 704x704 pixeles en formato tensor `[1,3,704,704]`.
- Post-proceso integrado en el consumidor: umbral de confianza fijo 0.1, NMS con IoU 0.4 y limite de 300 detecciones.
- Ejecucion en ONNX Runtime con seleccion de proveedor CUDA y fallback a CPU.
- Determinismo verificado en CPU: misma entrada produce misma salida cruda y publica en llamadas repetidas.
- Sin capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, audio, tool calling, agentes ni multilingueismo.

## Casos de uso

- Monitorizacion de personas caidas en residencias y hospitales: el detector se ejecutaria sobre fotogramas de camaras fijas a 704x704, con umbral 0.1 y NMS 0.4, emitiendo alertas cuando aparezca la clase `fallen person`; su latencia local por debajo de 100 ms en CPU permite procesar flujos moderados sin GPU.
- Teleasistencia domiciliaria: integrado en un consumidor con OpenCV y ONNX Runtime, el modelo puede analizar capturas periodicas en el propio dispositivo (edge) y activar una llamada de verificacion, evitando enviar video a la nube.
- Analitica de seguridad laboral en entornos industriales: deteccion de trabajadores caidos en zonas de riesgo, combinando la salida del detector con reglas de zona y persistencia temporal en el pipeline de vision.
- Pre-filtrado en sistemas de triaje de videovigilancia: al ser un detector de una sola clase y bajo coste, puede actuar como primera etapa que descarte fotogramas sin candidatos antes de invocar modelos mas pesados.
- Validacion de pipelines de vision en CI: el grafo ONNX con entrada y salida fijas y los receipts de paridad documentados permiten usarlo como caso de prueba de regresion numerica en integraciones de ONNX Runtime.
- Investigacion en deteccion de caidas: sirve como artefacto reproducible para comparar estrategias de exportacion, NMS y umbrales, aunque sin garantias de calidad held-out segun el autor.
- Despliegue en dispositivos sin GPU: el fallback a CPU con ORT 1.26.0 y latencias medidas en cuatro nucleos lo hacen viable en equipos de gama media para inferencia por lotes pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (mAP, precision/recall ni metricas de calidad sobre conjuntos oficiales). Los unicos datos cuantitativos son de paridad y latencia local:

| Metrica | Valor | Condiciones |
|---|---|---|
| Paridad Torch vs ORT (salida densa) | rtol 1e-4 / atol 1e-3 | 7 comparaciones, 2026-10-26 |
| Paridad coordenadas decodificadas | <= 1 pixel | clases y conteos exactos |
| Paridad confianza | <= 1e-4 | clases y conteos exactos |
| Latencia ORT CPU (octava de diez) | 43.815495 ms | ORT 1.26.0, 4 nucleos fisicos 40-43 |
| p95 con dos llamadores concurrentes | 59.39310225 ms | mismo host, memoria compartida con otra carga |
| Determinismo | exacto en salida cruda y publica | llamadas repetidas en CPU |

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion de caidas ni resultados de terceros que permitan una comparacion rigurosa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El autor declara explicitamente que el artefacto no es un despliegue alojado, ni un resultado oficial de calidad, ni una aprobacion independiente Gate Zero; es un candidato de publicacion con aceptacion local.
- No se reclama calidad prospectiva en held-out ni etiquetas de clave oficial; el rendimiento real en dominios distintos al de entrenamiento es desconocido.
- Entrenado con 472 imagenes base mas visitas parciales a OXY01, un volumen reducido que aumenta el riesgo de sobreajuste y de baja generalizacion.
- Una sola clase (`fallen person`) y umbral de confianza fijo 0.1: no es configurable sin reexportar y puede generar falsos positivos en posturas similares.
- Sin TTA ni etapa de agreement, lo que limita la robustez frente a oclusiones, iluminacion adversa o camaras en angulos no vistos.
- El estado de tensor post-forward del proceso original figura como NOT_ESTABLISHED; la reproducibilidad completa del entrenamiento no esta garantizada.
- Licencia AGPL-3.0: el uso en productos o servicios en red obliga a liberar el codigo fuente derivado, lo que restringe su adopcion comercial propietaria.
- Las latencias reportadas son condiciones locales de un host concreto y no una garantia de latencia en produccion alojada.
- Riesgo de sesgo no evaluado: no hay informacion sobre demografia, condiciones de iluminacion ni diversidad geografica del conjunto de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tatjr13/fallen-coco704-native64-steer7c-20261026
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
