# vinayakmokashi45/filings-research-copilot-router

## Resumen

Filings Research Copilot router es un clasificador de texto de seis clases desarrollado por vinayakmokashi45 como componente de enrutamiento del proyecto Filings Research Copilot, un asistente que responde preguntas sobre los informes 10-K y 10-Q de empresas cotizadas en Estados Unidos con fuentes citadas. El modelo lee una pregunta en lenguaje natural y la dirige a la parte del asistente que debe responderla: recuperación de texto de los informes, consulta de datos financieros, respuestas híbridas, redacción de entregables, conversación trivial o rechazo de peticiones fuera de ámbito.

Técnicamente es una versión fine-tuned con LoRA de BAAI/bge-small-en-v1.5 (un encoder tipo BERT de 33,4 millones de parámetros), entrenada sobre 2.328 preguntas etiquetadas por un router basado en LLM (gpt-oss-120b) y posteriormente fusionada y exportada a ONNX. Su relevancia práctica radica en la eficiencia: enruta cada pregunta en unos 8-10 milisegundos en una CPU de portátil y sin coste por consulta, frente a los 0,5 segundos y 0,0002 dólares que cuesta el router basado en LLM del que aprendió. Alcanza una precisión del 91,3 % en el conjunto de desarrollo y del 95 % en el de prueba, lo que lo convierte en un buen ejemplo de destilación de un router LLM a un modelo ligero desplegable en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (bge-small) con cabeza de clasificación de 6 clases |
| Parametros totales | 33.362.310 (safetensors fusionado); 34,7 M con cabeza de clasificación |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 96 tokens (truncamiento en inferencia) |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (opset 17), adaptadores LoRA/PEFT |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder transformer compacto orientado a embeddings semanticos, al que se anade una cabeza de clasificacion. El ajuste fino se realizo con LoRA (rango 16, alpha 32, dropout 0,1) aplicado a las proyecciones de atencion y feed-forward, con solo 1,34 millones de parametros entrenables sobre los 34,7 millones totales. Se empleo cross-entropy ponderada por clase, optimizador AdamW con calendario one-cycle con pico de 5e-4, batches de 32, secuencias de hasta 96 tokens y 10 epocas, conservando la epoca con mejor precision en un decimo reservado del conjunto de entrenamiento. El entrenamiento completo se ejecuto en una GPU T4 de Kaggle en menos de un minuto.

Los datos de entrenamiento son 2.328 preguntas generadas por gpt-oss-120b, ruta por ruta y tipo por tipo (cada lote pedia un tipo de pregunta definido en la ruta, en uno de cinco estilos, con un tercio cercano a la frontera de otra ruta). Se eliminaron duplicados cercanos y toda pregunta con similitud coseno superior a 0,85 respecto a las preguntas de evaluacion. Las etiquetas provienen del router LLM del proyecto (gpt-oss-120b con un prompt que enrutaba correctamente todas las preguntas de desarrollo), de modo que el modelo destila su comportamiento. Tras el entrenamiento, los adaptadores se fusionaron en los pesos y se exporto a ONNX (opset 17), verificando que onnxruntime y PyTorch coinciden en los logits con una diferencia de aproximadamente 1e-5.

## Capacidades

- Clasificacion de preguntas en seis rutas: `doc` (respuestas del texto de los informes), `data` (cifras financieras, ratios, tendencias, comparaciones), `hybrid` (cifra mas narrativa explicativa), `brief` (entregable escrito que cubre varios aspectos), `smalltalk` (saludos, agradecimientos, preguntas sobre el asistente) y `decline` (peticiones fuera de ambito).
- Deteccion de peticiones de asesoramiento de inversion, predicciones de precio, finanzas personales, informacion no publica y peticiones daninas o de anulacion de instrucciones, enrutandolas a `decline`.
- Salida de logits ordenables para obtener probabilidades por clase, lo que permite construir una cascada con un umbral de confianza (el proyecto usa 0,8 para derivar al router LLM).
- Inferencia en CPU mediante ONNX Runtime con latencia de unos 8 ms por pregunta.
- Sin capacidades generativas, multimodales ni de tool calling: es unicamente un clasificador de texto.

## Casos de uso

- Enrutamiento de consultas en asistentes de inteligencia documental financiera: clasifica cada pregunta antes de decidir si se recupera texto de los informes, se consulta una base de datos de cifras o se genera un entregable, reduciendo coste y latencia frente a usar un LLM como router.
- Fallback de routers LLM en produccion: al no depender de una API externa, sirve como respaldo cuando la llamada al modelo principal falla, manteniendo el servicio disponible.
- Filtrado de peticiones fuera de ambito: la clase `decline` permite rechazar peticiones de asesoramiento financiero o de anulacion de instrucciones antes de gastar computo en generacion.
- Despliegue en dispositivos con recursos limitados: con 0,3 GB de tamano y 8 ms por consulta en CPU de portatil, puede ejecutarse en local sin GPU.
- Optimizacion de coste por consulta en sistemas de alta concurrencia: al no tener coste por pregunta, puede procesar miles de consultas por minuto en una sola maquina.
- Patron reutilizable de destilacion de routers: el enfoque (LLM etiqueta, encoder ligero aprende, exportacion a ONNX) puede replicarse para otros dominios documentales con distinto conjunto de rutas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de enrutamiento de 198 preguntas escritas a mano y parafraseadas, nunca usadas en entrenamiento (138 en desarrollo, 60 en prueba, puntuadas una sola vez):

| Router | Precision dev (intervalo 95 %) | Precision test | Latencia mediana | Coste por pregunta |
|---|---|---|---|---|
| Este modelo | 0,913 (0,862 a 0,957) | 0,950 (0,883 a 1,000) | 8 ms en CPU de portatil | Ninguno |
| Este modelo con cascada al router LLM bajo 0,8 de confianza | 0,957 (0,920 a 0,986), 9 % derivado | 0,967 (0,917 a 1,000), 5 % derivado | 8 ms | 0,00002 $ |
| Router LLM de origen (gpt-oss-120b) | 1,000 (exacto 0,974 a 1,000) | 1,000 (exacto 0,940 a 1,000) | 0,5 s | 0,0002 $ |
| Router semantico (bge-small, centroide mas cercano) | 0,739 (0,667 a 0,812) | 0,800 (0,700 a 0,900) | 8 ms | Ninguno |
| Primera version del modelo (sin peticiones daninas en entrenamiento) | 0,833 (0,768 a 0,891) | no disponible | 9 ms | Ninguno |

Precision por ruta en desarrollo: `data` 30 de 30, `hybrid` 21 de 21, `smalltalk` 18 de 18, `doc` 28 de 30, `decline` 16 de 21 y `brief` 13 de 18.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; con 33,4 millones de parametros en ONNX ocupa unos 130 MB en memoria, ejecutable integramente en CPU.
- GPU recomendadas: ninguna para inferencia; para reproducir el entrenamiento basta una NVIDIA T4 (el entrenamiento completo tomo menos de un minuto).
- Consumer GPU: no es necesaria; el caso de uso principal es CPU de portatil o servidor ligero.
- Despliegue: onnxruntime con la libreria `tokenizers` (via recomendada, tal como lo sirve el copiloto), o `transformers` con `model.safetensors`; tambien compatible con PEFT cargando los adaptadores de `adapter/`. Es compatible con text-embeddings-inference segun los tags del repositorio.
- Latencia y throughput: mediana de 8 ms por pregunta en CPU de portatil; con la cascada hacia el router LLM, el 91-95 % de las preguntas se resuelven sin coste y solo el 5-9 % se deriva.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Precision (dev/test) | Latencia | Licencia |
|---|---|---|---|---|---|
| Filings Research Copilot router | 33,4 M | 6 rutas | 0,913 / 0,950 | 8 ms en CPU | MIT |
| Router LLM gpt-oss-120b (profesor) | 120.000 M (MoE) | 6 rutas | 1,000 / 1,000 | 0,5 s | no disponible |
| Router semantico bge-small (centroide) | 33,4 M | 6 rutas | 0,739 / 0,800 | 8 ms | MIT |

El router LLM ofrece precision perfecta pero es 60 veces mas lento y tiene coste por consulta; el router semantico por centroides es igual de rapido pero 17 puntos peor en desarrollo. El modelo destilado ocupa el punto optimo entre precision y coste operativo.

## Limitaciones y advertencias

- Dominio estrecho: esta entrenado exclusivamente para enrutar preguntas sobre informes 10-K y 10-Q de empresas estadounidenses; su rendimiento fuera de ese dominio no esta verificado.
- Solo ingles: no hay soporte para castellano ni otros idiomas.
- Contexto muy corto: 96 tokens; preguntas largas o con multiples partes se truncaran.
- Errores sistematicos conocidos: confunde peticiones de revelar o anular las instrucciones del asistente con `smalltalk`, y envia a `hybrid` entregables (`brief`) que se leen como una unica pregunta analitica.
- La clase `decline` es la mas debil (16 de 21 en desarrollo), por lo que conviene no confiar ciegamente en ella como unico filtro de seguridad.
- El conjunto de entrenamiento fue generado por un LLM (gpt-oss-120b), por lo que puede heredar sesgos del profesor y de sus definiciones de ruta.
- Conjunto de prueba pequeno (60 preguntas): los intervalos de confianza son amplios y la precision real puede variar.
- Sin cuantizacion publicada ni benchmarks estandar (MMLU, HumanEval, etc.): al ser un clasificador de dominio especifico, no aplica la evaluacion habitual de LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vinayakmokashi45/filings-research-copilot-router
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio del proyecto: https://github.com/VinayakMokashi/filings-research-copilot
- Conjunto de entrenamiento: https://github.com/VinayakMokashi/filings-research-copilot/blob/main/data/reference/routing_train.jsonl
- Data card del conjunto: https://github.com/VinayakMokashi/filings-research-copilot/blob/main/docs/data/routing-train-set.md
