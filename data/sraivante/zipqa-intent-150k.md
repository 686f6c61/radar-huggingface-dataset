# sraivante/zipqa-intent-150k

## Resumen

`zipqa-intent-150k` es un modelo de clasificación de intenciones y etiquetado de secuencias (token classification) desarrollado por el usuario `sraivante`. Se trata de un parser de carácter a nivel construido desde cero con solo 148.195 parámetros, cuyo objetivo es convertir preguntas en inglés o hinglish sobre una tabla de códigos postales de EE. UU. en consultas estructuradas que un motor determinista resuelve contra dicha tabla. La idea central es separar la comprensión de la pregunta (tarea del modelo) de la recuperación de hechos (tarea del motor), de modo que el modelo nunca inventa un condado o un código de área.

El modelo resuelve un problema concreto: las tablas de códigos postales contienen decenas de miles de filas de dígitos y nombres propios sin patrones generalizables, por lo que un transformer pequeño entrenado para memorizarlas actúa como un hash con pérdidas y confunde valores adyacentes. En su lugar, este modelo aprende a identificar la intención (lookup, list, count, check, nearest, top, unknown) y las columnas deseadas, mientras que un motor de búsqueda indexa la tabla y garantiza que cada dato provenga de una fila real.

Es relevante por su eficiencia extrema: entrena en CPU (2 núcleos) en unas 2,5 horas, pesa 594 kB, la inferencia del modelo tarda unos 2 ms y la búsqueda difusa sobre 36.000 topónimos unos 100 ms. Está pensado para despliegues ligeros donde no tiene sentido emplear un LLM grande para una tarea de parsing acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU bidireccional de 1 capa (hidden 128) con embeddings de carácter (52 símbolos → 48-d), tres cabezas: BIO slot tagging, softmax de intención y sigmoid multi-etiqueta de columnas deseadas |
| Parametros totales | 148.195 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 96 caracteres (entrada truncada a 96 chars, en minúsculas) |
| Tipos de cuantizacion | No disponible (pesos safetensors en FP32; el tamaño de 594 kB sugiere que la cuantización no es necesaria) |
| Idiomas soportados | Inglés (en) e hinglish (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente ligera: la pregunta se trunca a 96 caracteres y se pasa por un embedding de carácter de 48 dimensiones (vocabulario de 52 símbolos), seguido de una GRU bidireccional de una capa con 128 unidades ocultas. Sobre la salida se conectan tres cabezas que comparten una única función de pérdida (entropía cruzada para slots, entropía cruzada para intención y entropía cruzada binaria para las columnas deseadas): una cabeza por carácter que produce etiquetas BIO para slots (ZIP, CITY, COUNTY, STATE, CBSA, AREACODE, LAT, LON), una cabeza de intención con softmax sobre siete clases y una cabeza multi-etiqueta con sigmoid sobre las columnas deseadas (COUNTY_NAME, COUNTY_CODE, STATE, CITY, ZIP, AERA_CODE, LATLON, CBSA_TITLE, CBSA, ZIP_TYPE, ALL). El procesamiento a nivel de carácter se eligió para que variantes como "Mayagüez", "Mayagez" y "MAYAGUEZ" compartan embedding y los topónimos no vistos no caigan en `<unk>`. Una GRU de dos capas resultó el doble de lenta en CPU sin ganancia de precisión.

El entrenamiento se realizó sobre un corpus sintetizado de 1.000.000 de ejemplos generados a partir de la propia tabla (99.214 filas con columnas ZIP, STATE, STATE_NAME, CITY, CITY_ABB, LATITUDE, LONGITUDE, COUNTY_CODE, COUNTY_NAME, AERA_CODE, ZIP_TYPE, LAST_LINE_INDICATOR, FACILITY_CODE, FINANCE_NUMBER, CBSA, CBSA_TITLE y CBSA_STATUS). La distribución por intención es: lookup 42%, list 14%, check 13%, count 11%, unknown 8%, nearest 6% y top 6%. Cada ejemplo se construye a partir de segmentos etiquetados y luego se le aplica ruido controlado: erratas de teclado, letras eliminadas, intercambiadas o duplicadas (35% de los tokens de entidad y 12% de los tokens de plantilla), mayúsculas aleatorias, prefijos de barrio eliminados, códigos postales sin ceros a la izquierda, prefijos y sufijos coloquiales ("bhai", "pls", "batao") y plantillas en hinglish. Tres decisiones del generador fueron críticas: los calificadores de estado deben ser verdaderos (un 35% de las menciones de ciudad o condado llevan un estado que realmente existe para ese lugar), los códigos de estado que son palabras inglesas (IN, OR, ME, OK, HI, DE, LA, OH, PA, MA, CO, ID, AL, MO, NE, MD, MS, AR, MI) nunca aparecen como superficie desnuda y la clase unknown no debe contener entidades de la tabla con formulaciones respondibles.

## Capacidades

- Clasificación de intención en siete clases: lookup, list, count, check, nearest, top y unknown.
- Etiquetado de slots a nivel de carácter con esquema BIO para ZIP, CITY, COUNTY, STATE, CBSA, AREACODE, LAT y LON.
- Detección multi-etiqueta de las columnas deseadas en la respuesta (incluida la etiqueta ALL para consultas genéricas).
- Comprensión de preguntas compuestas ("county and area code") y de formulaciones en hinglish ("{E} ka {T} batao", "{E} kis county me hai").
- Tolerancia a erratas, mayúsculas inconsistentes, códigos postales sin ceros a la izquierda y prefijos coloquiales.
- Reconocimiento de consultas fuera de dominio (meteorología, población, saludos, SQL, texto sin sentido) para derivarlas a la clase unknown.
- Soporte de consultas geográficas por proximidad ("closest city to 18.44, -66.40") y agregaciones ("top 5 counties in Texas by zip codes").
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento; es un parser especializado, no un modelo generativo.

## Casos de uso

- Atención al cliente sobre cobertura geográfica: el modelo interpreta preguntas como "¿en qué condado está el 60614?" y el motor responde con el dato exacto de la tabla, sin riesgo de que el modelo invente un condado. Adecuado porque la ventana de 96 caracteres cubre de sobra las preguntas típicas de usuario.
- Enrutamiento de consultas en un chatbot de logística: se clasifica la intención (lookup, list, count, check) y se extraen los slots para dirigir la petición al servicio interno correcto, con una latencia de modelo de ~2 ms que permite hacerlo en línea sin coste apreciable.
- Normalización de direcciones en pipelines de datos: a partir de una pregunta o cadena libre se extraen ZIP, ciudad, condado y estado para cruzarlos con la tabla USPS o el crosswalk de HUD, manteniendo la trazabilidad de cada campo.
- Asistente de consulta para analistas: interfaz en lenguaje natural sobre la tabla de 99.214 filas que responde agregaciones ("how many zips in X", "which county has the most zips") sin necesidad de escribir SQL, con la garantía de que los resultados provienen de filas reales.
- Búsqueda por proximidad geográfica: dado un par de coordenadas, el modelo detecta la intención nearest y extrae latitud y longitud para que el motor devuelva la ciudad o el condado más cercano de la tabla.
- Filtrado y validación de formularios: comprobación de coherencia ("is X in Y", "are X and Y in the same county") en procesos de alta de clientes o verificación de direcciones, con tolerancia a erratas del usuario.
- Preprocesado ligero en el edge o en CPU: al pesar 594 kB y ejecutarse en CPU, puede desplegarse en entornos con recursos mínimos como paso previo a un motor de búsqueda o a un LLM mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (594 kB); el modelo cabe holgadamente en cualquier GPU o incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer e integrada; también se ejecuta en CPU sin problema (el autor lo entrenó en 2 núcleos de CPU).
- Opciones de despliegue: PyTorch nativo (librería declarada), exportación a ONNX o TorchScript para servir en producción; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de 148k parámetros.
- Latencia y throughput: ~2 ms por inferencia del modelo y ~100 ms para la búsqueda difusa sobre 36.000 topónimos, según el autor. El entrenamiento completo en CPU (2 núcleos) tardó ~2,5 horas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zipqa-intent-150k | 148.195 | 96 caracteres | Parsing de intención y slots sobre tabla ZIP | Apache 2.0 | Hugging Face |
| zip-county-city-seq2seq-21m | ~21 M (según nombre) | No disponible | Seq2seq que memoriza la tabla ZIP-condado-ciudad | No disponible | Hugging Face |
| LLM generativo de propósito general (p. ej. modelos de 7B) | Miles de millones | Miles de tokens | Respuesta generativa, con riesgo de alucinación de hechos | Variable | Amplia |

El autor compara explícitamente con `sraivante/zip-county-city-seq2seq-21m`, su intento anterior de ~21 millones de parámetros que memorizaba la tabla y que confundía códigos adyacentes (612/613/614), inventaba códigos FIPS y coordenadas plausibles y requería reentrenamiento en cada actualización de la tabla. Frente a un LLM generativo, la ventaja de `zipqa-intent-150k` es que delega los hechos al motor determinista, eliminando la alucinación de datos geográficos a cambio de limitarse a un dominio muy acotado.

## Limitaciones y advertencias

- Dominio muy restringido: solo entiende preguntas sobre las columnas de la tabla ZIP-condado-ciudad descrita; cualquier otro tema cae en unknown.
- La tabla no se incluye con el modelo: fue entrenado contra un dataset derivado de USPS con licencia (99.214 filas) y el usuario debe aportar un CSV con las mismas columnas (por ejemplo, el crosswalk de HUD o los ficheros ZCTA del Census).
- Ventana de entrada de solo 96 caracteres, insuficiente para preguntas largas o conversaciones multi-turno.
- Idiomas limitados a inglés y hinglish; no soporta castellano ni otras lenguas.
- Riesgo de error en la clasificación de intención y en el etiquetado de slots ante formulaciones muy alejadas de las plantillas sintéticas de entrenamiento.
- El modelo no genera texto ni razona: no debe usarse como sustituto de un LLM en tareas abiertas.
- No se han publicado métricas de precisión, recall ni F1 en la información disponible, por lo que no es posible evaluar su calidad empírica antes de desplegarlo.
- Aunque la licencia es Apache 2.0, el dataset USPS subyacente puede tener restricciones propias que el usuario debe verificar por separado.
- El modelo tiene 39 descargas y 0 likes en Hugging Face, lo que indica una validación comunitaria prácticamente nula.

## Enlaces

- [Modelo en Hugging Face: sraivante/zipqa-intent-150k](https://huggingface.co/sraivante/zipqa-intent-150k)
- [Modelo anterior: sraivante/zip-county-city-seq2seq-21m](https://huggingface.co/sraivante/zip-county-city-seq2seq-21m)
- [HUD USPS ZIP crosswalk](https://www.huduser.gov/portal/datasets/usps_crosswalk.html)
