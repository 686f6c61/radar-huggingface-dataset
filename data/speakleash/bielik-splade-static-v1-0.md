# speakleash/Bielik-SPLADE-static-v1.0

## Resumen

Bielik-SPLADE-static-v1.0 es un codificador de consultas «inference-free» (sin inferencia neuronal) para recuperación de información dispersa (sparse retrieval) en polaco. Lo desarrolla SpeakLeash, en colaboración con ACK Cyfronet AGH y Gaia AI Factory, y forma parte de la colección Bielik-SPLADE v1.0. Su función es sustituir el codificador de consultas del modelo completo speakleash/Bielik-SPLADE-82M-v1.0 por una tabla de búsqueda estática: cada token de la consulta se mapea a un máximo de 6 dimensiones del vocabulario con sus pesos, y el vector de consulta es el máximo sobre las filas activadas.

La relevancia práctica es el coste: codificar una consulta requiere únicamente un pase de tokenizador y una consulta a tabla, sin GPU ni transformer. En un hilo de CPU (AMD Ryzen 5 5600X, lote de 1) una consulta tarda 0,56 ms de mediana (0,64 ms de media), de los cuales 0,19 ms son tokenización y 0,05 ms la consulta a tabla; el resto es sobrecarga de la librería. Los documentos siguen codificándose con el modelo completo de 82M, de modo que el índice es idéntico y se puede cambiar el codificador de consultas sin reindexar.

El modelo base es un transformer tipo SPLADE de 82M de parámetros, mientras que este repositorio empaqueta una ruta de consulta basada en tabla (unos 20 MB) y una ruta de documento que reutiliza los pesos del modelo de 82M (SHA-256 idéntico). El resultado principal es un nDCG@10 medio de 52,37 en las 32 tareas públicas de PIRB, por encima de sdadas/polish-splade (51,34) y 2,64 puntos por debajo del modelo completo (55,01).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPLADE disperso; ruta de consulta basada en tabla estática (lookup) y ruta de documento con transformer MLM de 82M + pooling SPLADE |
| Parametros totales | 82M en la ruta de documento (modelo completo); la tabla de consulta tiene 250.001 filas con 6 slots cada una (1.346.293 slots activos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existen exportaciones int8 ONNX en la colección, pero no se detallan en esta ficha) |
| Idiomas soportados | polaco (pl) |
| Licencia | gemma |
| Formato de pesos | safetensors (tabla `static_query.safetensors` + `static_query.json`); repositorio de 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la familia SPLADE: un transformer enmascarado (MLM) con pooling disperso que produce vectores de documento con pesos aprendidos sobre el vocabulario. La innovación de esta variante es la ruta de consulta: en lugar de ejecutar el transformer, se usa una tabla de 250.001 filas (50.001 filas de token y 200.000 filas para palabras completas y pares de palabras adyacentes). Cada fila tiene 6 slots, y la consulta se representa como el máximo sobre las filas que activa, con un máximo de 6 dimensiones ponderadas por token. La tabla es el «teacher» destilado del modelo completo de 82M, que actúa como codificador de documentos.

La ruta de documento contiene exactamente el mismo fichero de pesos que speakleash/Bielik-SPLADE-82M-v1.0 (SHA-256 idéntico), por lo que el índice generado es equivalente. El repositorio se distribuye como un `SparseEncoder` de Sentence Transformers con dos rutas (`query_0_SparseStaticExpansion` y `document_0_MLMTransformer` + `document_1_SpladePooling`) y requiere `sentence-transformers >= 5.0` y `trust_remote_code=True`, ya que el módulo de tabla se envía como código remoto (`static_query_expansion.py`). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Recuperación de información dispersa (sparse retrieval) en polaco: genera representaciones de consulta y documento compatibles con índices SPLADE.
- Codificación de consultas sin red neuronal: tokenizador más consulta a tabla, apta para CPU y sin GPU.
- Expansión de consultas basada en tabla: filas para tokens, palabras completas y pares de palabras adyacentes, con hasta 6 dimensiones ponderadas por token.
- Codificación de documentos con el modelo completo de 82M (ruta de documento incluida en el repositorio).
- Compatibilidad con índices construidos por speakleash/Bielik-SPLADE-82M-v1.0 y speakleash/Bielik-SPLADE-50M-v1.0.
- Integración con Sentence Transformers (`SparseEncoder`) y uso de la ruta de consulta sola (unos 20 MB) sobre índices ya existentes.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un codificador de recuperación, no un modelo generativo.

## Casos de uso

- Motor de búsqueda documental en polaco: se indexan documentos con el modelo completo de 82M y las consultas se codifican con la tabla en 0,56 ms por consulta en CPU, lo que permite atender búsquedas de baja latencia sin GPU.
- Servicio de búsqueda sobre un índice ya existente: si los documentos ya se indexaron con Bielik-SPLADE-82M o 50M, basta con descargar la ruta de consulta (unos 20 MB) y sustituir el codificador de consultas sin reindexar.
- Recuperación en entornos con recursos limitados: al no requerir transformer ni GPU para la consulta, se puede desplegar en contenedores pequeños o en el mismo servidor de aplicación.
- Atención al cliente con base de conocimiento: recuperación de fragmentos relevantes de FAQs o documentación en polaco antes de pasarlos a un modelo generativo, reduciendo el coste de la fase de recuperación.
- Búsqueda jurídica o administrativa: consultas sobre corpus de normativa y resoluciones en polaco, donde el nDCG@10 de 52,37 en PIRB es competitivo frente a alternativas como sdadas/polish-splade (51,34).
- Sistemas RAG con presupuesto de latencia estricto: la codificación de consultas en menos de 1 ms libera el presupuesto para la generación y permite escalar horizontalmente en CPU.
- Filtrado y deduplicación de grandes colecciones: la ruta de documento del modelo de 82M permite generar representaciones dispersas para recuperación y comparación a gran escala.

## Benchmarks y rendimiento

| Modelo | nDCG@10 medio (32 tareas públicas de PIRB) | Postings por consulta |
|---|---|---|
| Bielik-SPLADE-82M | 55,01 | 13.945 |
| Bielik-SPLADE-50M | 53,81 | 12.725 |
| Bielik-SPLADE-static-v1.0 (sobre índice de 82M) | 52,37 | 9.046 |
| sdadas/polish-splade | 51,34 | 16.807 |
| BM25 | 40,32 | no disponible |

Datos de coste de consulta: 71,0 dimensiones y 9.046 postings por consulta (media sobre una muestra de coste de 1.350 consultas), la ruta de consulta más barata de la colección. Latencia de codificación de consulta: 0,56 ms de mediana y 0,64 ms de media en un hilo de CPU (AMD Ryzen 5 5600X, lote de 1) con Sentence Transformers; más hilos no mejoran el tiempo. Los resultados cubren solo la parte pública de PIRB: 32 de sus 41 tareas.

## Requisitos de hardware

- VRAM para inferencia: no aplica a la ruta de consulta (tabla en CPU, sin transformer); la ruta de documento requiere ejecutar el transformer de 82M, para el que no se especifica VRAM en la información disponible.
- GPU recomendadas: no disponibles para la ruta de documento; la ruta de consulta no necesita GPU.
- Cabe en GPU de consumo: la ruta de consulta funciona en cualquier CPU; la ruta de documento, al ser un modelo de 82M, es apta para GPUs de consumo, aunque no se detallan requisitos concretos.
- Opciones de despliegue: Sentence Transformers (`SparseEncoder`, con `trust_remote_code=True`); la colección incluye exportaciones int8 ONNX, aunque no se detalla su uso en esta ficha.
- Latencia y throughput: 0,56 ms de mediana por consulta en un hilo de CPU (0,19 ms tokenización + 0,05 ms consulta a tabla, resto sobrecarga de librería); no se publica throughput de documentos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 (PIRB, 32 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-SPLADE-static-v1.0 | 82M (documento) + tabla de consulta | no disponible | 52,37 | gemma | Hugging Face (speakleash) |
| Bielik-SPLADE-82M-v1.0 | 82M | no disponible | 55,01 | gemma | Hugging Face (speakleash) |
| Bielik-SPLADE-50M-v1.0 | 50M | no disponible | 53,81 | gemma | Hugging Face (speakleash) |
| sdadas/polish-splade | no disponible | no disponible | 51,34 | no disponible | Hugging Face (sdadas) |
| BM25 | no aplica | no aplica | 40,32 | no aplica | Implementaciones múltiples |

## Limitaciones y advertencias

- Solo soporta polaco; no está entrenado ni evaluado para otros idiomas.
- La calidad de la ruta de consulta estática es inferior a la del modelo completo: 52,37 frente a 55,01 de nDCG@10 en PIRB, una diferencia de 2,64 puntos.
- Los resultados publicados cubren solo 32 de las 41 tareas de PIRB (la parte pública); el rendimiento en las 9 tareas restantes es desconocido.
- Requiere `trust_remote_code=True` y ejecuta código del repositorio (`static_query_expansion.py`); conviene revisar ese fichero antes de habilitarlo.
- La licencia es «gemma», con las restricciones que esta impone; no se detallan en la información disponible las condiciones concretas para uso comercial.
- No se detallan sesgos conocidos, tasas de alucinación (no es un modelo generativo) ni límites de contexto en la información proporcionada.
- La ruta de consulta está pensada para funcionar sobre índices construidos con Bielik-SPLADE-82M o 50M; su uso sobre otros índices no está garantizado.
- No se especifican requisitos de VRAM ni rendimiento de la ruta de documento, lo que dificulta planificar el despliegue completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-SPLADE-static-v1.0
- Modelo base (82M): https://huggingface.co/speakleash/Bielik-SPLADE-82M-v1.0
- Modelo de 50M: https://huggingface.co/speakleash/Bielik-SPLADE-50M-v1.0
- Colección Bielik-SPLADE v1.0: https://huggingface.co/collections/speakleash/bielik-splade-v10
- Modelo comparable sdadas/polish-splade: https://huggingface.co/sdadas/polish-splade
