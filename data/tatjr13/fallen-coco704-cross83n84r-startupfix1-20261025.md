# tatjr13/fallen-coco704-cross83n84r-startupfix1-20261025

## Resumen

Fallen own-COCO704 fixed cross-seed agreement es un artefacto de inferencia publicado por el usuario tatjr13 en Hugging Face, orientado a la deteccion de personas caidas (clase "fallen person") dentro del proyecto SCORE. No es un modelo de lenguaje ni un transformer generativo: es un pipeline de deteccion de objetos en formato ONNX que combina dos ramas entrenadas de forma independiente a partir de un checkpoint publico COCO YOLO26n, con preprocesado fijo a 704 px y una etapa de acuerdo entre ramas (cross-seed agreement) que fusiona las predicciones de ambas.

El paquete integra dos variantes denominadas native64 (semilla 44283) y retain80 (semilla 44284), cada una con umbral de confianza 0,1 y NMS con IoU 0,4; la fusion one-to-one exige IoU 0,5 en coordenadas nativas de la rama native64 y conserva la confianza pareada mas baja. Todo el procesamiento se ejecuta en una unica sesion ONNX sobre CPU, sin adaptacion en tiempo de ejecucion, sin busqueda de imagenes ni de red y sin seleccion dinamica de umbrales.

La relevancia del artefacto es acotada y muy especifica: sirve como evidencia reproducible de un pipeline de deteccion con contrato de release cerrado, hashes fijados y validacion de layout de snapshot en Hugging Face. La version startupfix1 corrige unicamente una asignacion innecesaria (`self._base = base`) en `Miner.__init__` que provocaba que el recorrido de tamanos del loader siguiera una referencia de modulo hasta `sys.modules` y `pydantic.BaseModel`; el grafo ONNX, el preprocesado, los umbrales y las opciones de sesion no cambian.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos YOLO26n (dos ramas: native64 seed44283 y retain80 seed44284) fusionadas por acuerdo cross-seed; inferencia en una sesion ONNX unica sobre CPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; tarea de vision) |
| Licencia | AGPL-3.0-only (con avisos de upstream y terceros aplicables) |
| Formato de pesos | ONNX (sesion CPU); repo con `miner.py` como wrapper corregido |

## Arquitectura y entrenamiento

El sistema es un ensemble de dos detectores YOLO26n entrenados por separado desde un checkpoint publico COCO YOLO26n, con semillas distintas (44283 para native64 y 44284 para retain80). La inferencia se realiza en una sola sesion ONNX sobre CPU con preprocesado fijo a 704 px. Cada rama aplica confianza 0,1 y NMS con IoU 0,4; la fusion entre ramas exige acuerdo one-to-one con IoU 0,5, usa coordenadas nativas de la rama native64 y asigna la confianza pareada mas baja. No hay adaptacion en runtime, lookup de imagenes, lookup de red ni seleccion de umbrales.

El par de variantes se selecciono post hoc entre seis variantes fijas sobre cuatro frames C4 ya consumidos. El autor declara que no se redistribuyen imagenes ni anotaciones de entrenamiento, y que el codigo de la lane y el release usan AGPL-3.0-only. La receta inmutable de entrenamiento, exportacion y construccion de grafo esta fijada en un snapshot de dataset con hash concreto, y el contrato de release fija tanto ese snapshot como el hash del wrapper `miner.py`. La correccion startupfix1 elimina solo la asignacion `self._base = base` de `Miner.__init__`; el AST del metodo de prediccion, el grafo ONNX, el preprocesado, los umbrales y las opciones de sesion permanecen sin cambios.

## Capacidades

- Deteccion de objetos de una unica clase: "fallen person" (persona caida), con etiquetas especificas de tarea; algunas figuras sentadas en el suelo cuentan bajo las convenciones de scoring observadas.
- Fusion por acuerdo entre dos ramas independientes (cross-seed agreement) para reducir falsos positivos mediante consenso one-to-one con IoU 0,5.
- Preprocesado fijo a 704 px, sin adaptacion en tiempo de ejecucion.
- Ejecucion en CPU mediante ONNX Runtime, en una unica sesion.
- Contrato de release verificable: comprobacion exacta de tamano y SHA-256 de los miembros del snapshot, incluidos enlaces simbolicos que resuelven a ficheros regulares en el directorio de blobs del mismo repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Monitorizacion de caidas en residencias y entornos asistenciales: el detector se ejecutaria sobre frames de camaras fijas para marcar posibles personas caidas, con la fusion cross-seed como mecanismo para reducir falsos positivos en escenas con figuras sentadas en el suelo.
- Validacion de pipelines de vision en produccion: sirve como referencia reproducible para comprobar que un wrapper ONNX, su preprocesado y sus umbrales se comportan igual tras cambios de empaquetado, gracias al contrato de hashes y a la prueba de paridad raw/public/child sobre 429 imagenes.
- Auditoria de releases de modelos: el patron de snapshot inmutable, comprobacion de SHA-256 y separacion entre receta y wrapper es reutilizable para verificar artefactos en entornos regulados.
- Pruebas de regresion de inferencia en CPU: con una latencia local p95 de 73,414 ms sobre 600 llamadas en dos invocadores aislados, puede usarse como baseline para comparar configuraciones de ONNX Runtime o asignaciones de CPU.
- Deteccion de personas caidas en conjuntos de imagenes etiquetados parcialmente: el autor reporta 14/14 objetivos claros de referencia encontrados con 3 cajas falsas definidas en los dos frames completamente etiquetados, util para calibrar anotaciones y politicas de etiquetado.
- Integracion en sistemas de triaje de imagenes: al no requerir red ni lookup externo, el pipeline puede desplegarse en entornos aislados donde solo se permite inferencia local sobre CPU.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Objetivos claros encontrados | 14/14 | Sobre dos frames completamente etiquetados (C4) |
| Cajas falsas definidas | 3 | Sobre los mismos dos frames; asignadas a la pista de precision y politica de anotacion |
| Resultados de referencia locales historicos | 545/1/0 con 528/528 retenidos | Puntuaciones locales no calibradas, en gran medida in-sample |
| Paridad raw/public/child | 429 imagenes | Consumidor original SHA15f9db7a; salidas concurrentes repetidas |
| Latencia p95 local (dos invocadores) | 73,414 ms | Sobre 600 llamadas; no garantiza asignacion de CPU alojada ni latencia de cola HTTP |
| Etiquetas vacias congeladas | 10 | Incluyen 4 casos sentados con estatus oficial sin resolver |

El autor advierte explicitamente que estas cifras son puntuaciones locales no calibradas, en gran medida in-sample, y no constituyen resultados oficiales en vivo ni una afirmacion prospectiva de leaderboard. El arranque en frio alojado y la paridad end-to-end deben comprobarse sobre la revision desplegada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el pipeline esta disenado para ejecucion en CPU mediante ONNX Runtime, no se documentan requisitos de GPU.
- GPU recomendadas: no disponible; no se menciona soporte ni uso de GPU.
- Cabe en GPU de consumo: no disponible; el artefacto declara inferencia en CPU.
- Opciones de despliegue: ONNX Runtime sobre CPU con una unica sesion; el wrapper `miner.py` del repositorio implementa la carga y la prediccion. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: p95 local de 73,414 ms sobre 600 llamadas con dos invocadores aislados; el autor no garantiza esta cifra en CPU alojada ni incluye latencia de cola HTTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fallen own-COCO704 fixed cross-seed agreement | no disponible | no aplica | Deteccion de persona caida (ONNX, CPU) | AGPL-3.0-only | Hugging Face, 33 descargas |
| YOLO26n (checkpoint publico COCO, upstream) | no disponible | no aplica | Deteccion de objetos COCO | no disponible en la informacion | Publico (referenciado como base de entrenamiento) |
| Alternativas de deteccion de persona caida | no disponible | no disponible | Deteccion de caidas | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de una unica clase ("fallen person") con etiquetas especificas de tarea; algunas figuras sentadas en el suelo cuentan como caidas bajo las convenciones de scoring observadas, lo que puede generar discrepancias con otros criterios.
- Riesgo de falsos positivos: se reportan 3 cajas falsas definidas en los dos frames completamente etiquetados, asignadas a la pista de precision y politica de anotacion.
- Puntuaciones de referencia locales no calibradas y en gran medida in-sample; no son resultados oficiales en vivo ni una afirmacion de leaderboard.
- Diez etiquetas vacias congeladas incluyen cuatro casos sentados con estatus oficial sin resolver.
- La latencia reportada (p95 73,414 ms) corresponde a un entorno local con dos invocadores aislados; no garantiza el comportamiento en CPU alojada ni incluye latencia de cola HTTP. El arranque en frio y la paridad end-to-end deben verificarse sobre la revision desplegada.
- Seleccion post hoc del par de variantes entre seis variantes fijas sobre cuatro frames ya consumidos: riesgo de sobreajuste a la muestra de seleccion.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft sobre el codigo derivado y requiere atencion para uso comercial o integracion en productos propietarios; los avisos de upstream y terceros siguen aplicando.
- No se redistribuyen imagenes ni anotaciones de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- No es un modelo de lenguaje: no soporta generacion de texto, razonamiento, tool calling ni capacidades multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tatjr13/fallen-coco704-cross83n84r-startupfix1-20261025
- Snapshot de receta fuente (dataset): https://huggingface.co/datasets/tatjr13/fallen-coco704-cross83n84r-source-20261025/tree/61105f9242ae4ef529d0627af5f35abd1608827b
- Wrapper corregido: `miner.py` en el propio repositorio del modelo
