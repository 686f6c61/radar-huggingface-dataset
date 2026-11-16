# tphakala/BirdNET-Geomodel

## Resumen

BirdNET Geomodel v3.0.4 es un modelo de distribución geográfica de especies desarrollado por el equipo de BirdNET (Cornell Lab of Ornithology y Chemnitz University of Technology). No es un modelo de lenguaje ni un clasificador acústico: es un modelo auxiliar que predice, dada una coordenada y una semana del año, qué especies de aves tienen probabilidad de estar presentes en esa localización y momento. Su función es actuar como filtro de rango (range filter) que restringe las predicciones de los clasificadores acústicos de BirdNET, reduciendo falsos positivos al descartar especies que no pueden encontrarse en la zona y fecha consultadas.

El modelo es extremadamente compacto: los artefactos ONNX pesan entre 7,9 MB (FP16) y 15,5 MB (FP32), lo que permite ejecutarlo en dispositivos de borde, Raspberry Pi o servidores modestos sin GPU. La versión v3.0.4 cubre 14.082 especies y acepta como entrada un vector de tres valores float32 (`[latitude, longitude, week]`), devolviendo 14.082 puntuaciones de ocurrencia tras una sigmoide. El repositorio aloja tanto la release actual como la v3.0.2 (12.012 especies) para instalaciones existentes, con un índice `models.json` que permite seguir la cadena de sucesión entre versiones.

Es relevante para desarrolladores que construyen pipelines de bioacústica o monitorización de biodiversidad, especialmente en el ecosistema BirdNET-Go, donde se integra como paso previo al clasificador acústico. La licencia Apache 2.0 y la disponibilidad de etiquetas multilingües en la taxonomía facilitan su uso en producción y en investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo geométrico de ocurrencia; artefactos exportados a ONNX, opset 18) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 3 valores: latitud, longitud, semana) |
| Tipos de cuantización | FP32 y FP16 (ambos publicados como ONNX) |
| Idiomas soportados | no aplica al modelo; la taxonomía incluye nombres comunes multilingües (columnas `common_name_<locale>`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18), FP32 y FP16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red (capas, activaciones, tamaño de las hidden layers ni número de parámetros). Lo que sí se especifica es la interfaz: entrada de shape `[batch, 3]` con latitud en `[-90, 90]`, longitud en `[-180, 180]` y semana en el calendario BirdNET de 48 semanas (1-48, cuatro semanas por mes); salida de 14.082 logits transformados mediante sigmoide en puntuaciones de ocurrencia por especie. Los artefactos se distribuyen como grafos ONNX en opset 18, en variantes FP32 y FP16.

No se detallan en la información disponible los datos de entrenamiento (número de observaciones, fuentes como eBird u otras bases de datos, composición del dataset), ni si hubo etapas de ajuste fino o calibración posteriores. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo. La release v3.0.4 amplía la cobertura de especies de 12.012 (v3.0.2) a 14.082, y la taxonomía asociada pasa de 13.361 a 16.171 entradas.

## Capacidades

- Predicción de ocurrencia geográfica de 14.082 especies de aves a partir de latitud, longitud y semana del año.
- Filtrado de rango para clasificadores acústicos: descarta especies improbables en una localización y fecha, reduciendo falsos positivos.
- Procesamiento por lotes (`batch` en la dimensión de entrada) para consultas masivas de localizaciones.
- Salida de 14.082 puntuaciones independientes por sigmoide, interpretables como probabilidades de presencia.
- Etiquetado de salidas mediante ficheros de labels (`<nombre científico>_<nombre común>`) y taxonomía CSV con nombres comunes multilingües.
- Integración con BirdNET-Go como range filter; índice `models.json` con checksums y cadena de sucesión entre versiones.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Monitorización acústica de aves en campo: el modelo se consulta con la ubicación del sensor y la semana actual para obtener la lista de especies plausibles, que se usa como máscara sobre las predicciones del clasificador acústico y reduce falsos positivos en grabaciones de larga duración.
- Despliegue en dispositivos de borde: con 7,9 MB en FP16 o 15,5 MB en FP32, cabe en Raspberry Pi y otros equipos sin GPU, permitiendo filtrar localmente sin conexión a servidores.
- Estaciones de anillamiento y observatorios: dado un punto y una fecha, generar la lista esperada de especies para validar observaciones o planificar muestreos.
- Aplicaciones de ciencia ciudadana: filtrar y priorizar detecciones subidas por usuarios según su ubicación y temporada antes de la revisión por expertos.
- Investigación en ecología y biogeografía: obtener una línea base de ocurrencia estacional por especie para análisis de distribución, comparaciones entre años o estudios de cambio de rango.
- Pipelines de bioacústica en servidores: procesar lotes de coordenadas y semanas con ONNX Runtime (CPU) en paralelo a los clasificadores acústicos, usando la variante FP32 para evitar la conversión interna de FP16 en CPU.
- Sistemas de alerta temprana de biodiversidad: integrar la salida en cuadros de mando que marquen especies inusuales para la zona y fecha, combinando el prior geográfico con la confianza del clasificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU mediante ONNX Runtime.
- Memoria RAM: el fichero FP32 ocupa 15,5 MB y el FP16 7,9 MB; la model card advierte que en CPU conviene usar FP32 porque ONNX Runtime convierte FP16 a FP32 internamente, lo que aumenta el consumo de RAM.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime puede ejecutarlo, pero el modelo es demasiado pequeño para necesitarla.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y en hardware embebido como Raspberry Pi.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración nativa en BirdNET-Go; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Especies | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BirdNET Geomodel v3.0.4 | 14.082 | lat, lon, semana | ONNX FP32/FP16 | Apache 2.0 | Release actual; taxonomía de 16.171 entradas |
| BirdNET Geomodel v3.0.2 | 12.012 | lat, lon, semana | ONNX FP32/FP16 | Apache 2.0 | Release anterior, mantenida para instalaciones existentes |
| Clasificadores acústicos BirdNET | no disponible | audio | no disponible | no disponible | Tarea distinta: identificación de especies por sonido; el geomodel actúa como filtro previo |

No se dispone de información sobre otros modelos geométricos de ocurrencia comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier uso en esos términos es un error de categoría.
- La salida es una probabilidad de ocurrencia por especie, no una detección; debe combinarse con un clasificador acústico o con observaciones para conclusiones fiables.
- La resolución temporal es de 48 semanas (cuatro por mes), lo que limita la precisión en fenómenos con variación semanal o diaria.
- La cobertura se limita a las 14.082 especies del modelo; especies fuera de esa lista no reciben puntuación válida.
- No se documentan en la información disponible los sesgos del entrenamiento (posible infrarrepresentación de regiones con menos observaciones, como trópicos o áreas remotas).
- Riesgo de alucinación en sentido estricto no aplica, pero sí de sobreconfianza en zonas con pocos datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial; la política de uso aceptable de BirdNET es orientativa y no añade condiciones a la licencia.
- En CPU, usar la variante FP16 puede aumentar el consumo de RAM por la conversión interna de ONNX Runtime; se recomienda FP32 para ese escenario.
- Los nombres de fichero de la v3.0.2 están congelados; no deben renombrarse si se actualiza el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tphakala/BirdNET-Geomodel
- Repositorio upstream (release v3.0.4): https://github.com/birdnet-team/geomodel/releases/tag/v3.0.4
- Repositorio upstream (release v3.0.2): https://github.com/birdnet-team/geomodel/releases/tag/v3.0.2
- BirdNET-Go: https://github.com/tphakala/birdnet-go
- Proyecto BirdNET: https://birdnet.cornell.edu/
