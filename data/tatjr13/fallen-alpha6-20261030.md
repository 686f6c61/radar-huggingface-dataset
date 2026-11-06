# tatjr13/fallen-alpha6-20261030

## Resumen

Fallen Alpha6 es un modelo de deteccion de objetos en formato ONNX publicado por el usuario tatjr13 en Hugging Face. Se trata de un artefacto muy especializado: detecta una unica clase, `fallen person` (persona caida), y empaqueta en una sola sesion ONNX dos detectores independientes ("left branch" y "right branch") entrenados sobre la misma tarea, de modo que ambos se ejecutan en una sola pasada y sus resultados se combinan por consenso geometrico.

El modelo no es un modelo de lenguaje ni un modelo fundacional: es un detector de objetos derivado de la familia YOLO de Ultralytics (los avisos de licencia de Ultralytics se conservan), exportado a ONNX con entrada estatica de 704x704 y dos salidas densas de 10.164 anclas cada una con cinco valores (cx, cy, w, h, confianza). El repositorio incluye ademas un script de servicio (`miner.py`) que define un contrato de inferencia cerrado y verifica por hash los bytes exactos del kit.

Su relevancia es acotada y practica: sirve como componente de despliegue para un pipeline concreto de deteccion de personas caidas, con sesion CPU-only de onnxruntime y post-procesado fijado. No hay informacion publica sobre arquitectura interna detallada, datos de entrenamiento, idiomas ni benchmarks oficiales; la model card solo aporta evidencias locales no calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de deteccion de objetos (familia YOLO de Ultralytics, segun avisos de licencia), exportada a ONNX; dos ramas fusionadas en una sola sesion |
| Parametros totales | no disponible (pesos ONNX de 19.584.747 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada estatica de imagen 1x3x704x704) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `weights.onnx` sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0-only, con avisos de Ultralytics conservados (`LICENSE`, `NOTICE.md`) |
| Formato de pesos | ONNX (`weights.onnx`, 19.584.747 B, sha256 `416ac786a8ea5df26cffbe9cd76eaca4dec9141478fe31ca0faf6814e8333359`) |

## Arquitectura y entrenamiento

La informacion disponible indica que Alpha6 fusiona en un unico grafo ONNX nativo dos ramas entrenadas por separado sobre la misma tarea: la rama izquierda (T84, semilla 44284, checkpoint `b71e01fe...`) y la rama derecha (T83, semilla 44283, checkpoint `193422bb...`). La entrada es estatica (`images [1,3,704,704]`) y las salidas son dos tensores densos `left_dense` y `right_dense` de forma `[1,5,10164]`, cada uno con cx, cy, w, h y confianza para una unica clase `fallen person`. No se detalla el backbone, el numero de capas ni la estrategia de fusion de caracteristicas; solo se afirma que se reconstruye el grafo nativo fusionado de las dos ramas revisadas.

El entrenamiento se describe como "lane-trained" sobre datos derivados de COCO publico, con exportaciones propias. No se especifican el numero de imagenes, la composicion del dataset, el numero de epochs ni si hubo aumentacion o tecnicas de destilacion. No se menciona RLHF, DPO ni tecnicas de alineacion (no aplican a un detector). La innovacion tecnica destacable es el contrato de servicio: letterbox a 704, umbral de confianza por elemento de 0,1, desletterbox, coordenadas enteras, NMS greedy class-aware con IoU 0,4, maximo 300 detecciones y combinacion de las dos listas de cajas por emparejamiento de maxima cardinalidad con IoU >= 0,5, tomando la confianza minima de rama. El script `miner.py` (43.987 B) embebe el manifiesto del kit y rechaza la ejecucion si los hashes no coinciden.

## Capacidades

- Deteccion de objetos de una unica clase: `fallen person` (persona caida).
- Ejecucion de dos detectores en paralelo dentro de una sola sesion ONNX, con fusion de resultados por consenso geometrico (IoU >= 0,5, emparejamiento de maxima cardinalidad).
- Entrada de imagen estatica 704x704 con letterbox y desletterbox integrados en el contrato de servicio.
- Post-procesado fijado: NMS greedy class-aware a IoU 0,4, maximo 300 detecciones, sin filtro de aspecto.
- Inferencia CPU-only mediante onnxruntime (version fijada a 1.26.0 en `chute_config.yml`).
- Verificacion de integridad por SHA-256 de `weights.onnx`, `miner.py` y `config.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, vision general, audio ni modo thinking.
- No hay capacidades multilingues: el modelo no procesa lenguaje.

## Casos de uso

- Monitorizacion de residencias y centros de mayores: el detector puede procesarse sobre fotogramas de camaras fijas para generar alertas cuando se identifica una persona caida, aprovechando la doble rama para reducir falsos positivos mediante consenso.
- Seguridad laboral en entornos industriales: integrado en un pipeline de vision por computador que analiza imagenes de planta para detectar trabajadores caidos y disparar protocolos de emergencia.
- Analisis forense de grabaciones: procesado por lotes de fotogramas extraidos de video para localizar eventos de caida y priorizar la revision manual.
- Robotica de asistencia: modulo de percepcion en un robot movil que necesita identificar personas caidas en su entorno antes de aproximarse o solicitar ayuda.
- Validacion de datasets de deteccion: las dos ramas con semillas distintas permiten comparar predicciones y marcar imagenes ambiguas para revision humana.
- Despliegue en dispositivos sin GPU: al ejecutarse en onnxruntime CPU-only con un grafo de ~19,6 MB, es viable en servidores modestos o edge boxes donde no hay acelerador disponible.
- Pruebas de regresion de pipelines ONNX: el contrato de hashes y el script `miner.py` permiten verificar que un despliegue sirve exactamente los bytes esperados, util en CI/CD de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la informacion disponible. La model card unicamente reporta evidencias locales no calibradas:

| Metrica (local, no calibrada) | Resultado |
|---|---|
| Acuerdo con referencia de entrenamiento | 997/997 |
| Ventana held-out reciente | 24/24 |
| Ventana antigua 9394500 | 2 cajas extra respecto a la lectura de referencia |

Estos datos son lecturas proxy locales contra referencias cualificadas y no constituyen puntuaciones oficiales de validador. No se aportan MMLU, HumanEval, GSM8K, COCO mAP ni ninguna otra metrica estandar de deteccion.

## Requisitos de hardware

- VRAM estimada: no aplica en el modo previsto; el contrato fija una sesion CPU-only de onnxruntime. En GPU, un grafo ONNX de ~19,6 MB con entrada 704x704 requiere del orden de 1-2 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no disponible; el autor no publica requisitos de GPU ni soporte GPU en el contrato.
- Cabe en GPU consumer: previsiblemente si (cualquier GPU con >= 2 GB de VRAM), aunque no esta validado por el autor.
- Opciones de despliegue: onnxruntime 1.26.0 en CPU, segun `chute_config.yml`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (detectores ONNX de una clase para personas caidas) ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia de familia, los detectores YOLO de Ultralytics comparten linaje arquitectonico, pero no se dispone de especificaciones de este modelo concreto para contrastarlas.

## Limitaciones y advertencias

- Modelo de una sola clase: solo detecta `fallen person`; no reconoce otras categorias ni proporciona atributos adicionales.
- Sin datos publicos de entrenamiento: se desconoce la composicion del dataset, el numero de imagenes y la cobertura de escenarios (iluminacion, oclusion, angulos), lo que impide estimar su robustez real.
- Evidencias locales no calibradas: los 997/997 y 24/24 son lecturas proxy contra referencias propias, no validaciones oficiales; no deben interpretarse como rendimiento garantizado.
- Diferencia conocida en ventana antigua: el kit produce 2 cajas extra respecto a la referencia en la ventana 9394500, divulgada por el autor.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft sobre el codigo que lo integre y sobre la distribucion del servicio en red; requiere revision legal antes de uso comercial propietario.
- Dependencia estricta de bytes: `miner.py` rechaza la ejecucion si los hashes de `weights.onnx`, `miner.py` o `config.json` no coinciden, lo que limita modificaciones y reempaquetados.
- Version fijada de onnxruntime (1.26.0): actualizaciones del runtime no estan cubiertas por el contrato.
- Sin soporte GPU declarado ni benchmarks de latencia: el rendimiento en produccion a gran escala no esta documentado.
- Riesgo de falsos positivos y negativos inherente a la deteccion de personas caidas en imagenes ambiguas (personas agachadas, tumbadas por ocio, oclusiones).
- Repositorio de 0,0 GB y 20 descargas: ecosistema minimo, sin comunidad ni issues publicos que permitan contrastar incidencias.

## Enlaces

- Hugging Face: https://huggingface.co/tatjr13/fallen-alpha6-20261030
- Repositorio de la publicacion previa F2 (mencionado en la model card): https://huggingface.co/tatjr13/fallen-coco704-merged-t84t83-20261029
- Elemento de despliegue destino (mencionado en la model card): `manak0/Detect-non-violent-fallen-and-crouching-person-detection`
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
