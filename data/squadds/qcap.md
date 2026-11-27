# SQuADDS/QCap

## Resumen

QCap es una red neuronal de grafos (GNN) con corrección física que predice la matriz de capacitancias de Maxwell completa de cualquier dispositivo superconductor planar a partir de su layout en formato GDS. Lo desarrolla el grupo LFL-Lab (Levenson-Falk Lab) de la Universidad del Sur de California en el marco del proyecto SQuADDS, y se publica junto al artículo arXiv:2611.22057. El modelo resuelve un cuello de botella clásico en el diseño de circuitos superconductores: la extracción de capacitancias mediante métodos de momentos (Q3D) es lenta y costosa, mientras que QCap la sustituye por una inferencia de red neuronal en torno a un segundo.

La arquitectura combina una GNN que opera sobre el grafo de conductores del layout con un prior físico obtenido de dos resoluciones gruesas del método de momentos, que la red corrige. El modelo se entrena sobre 45.771 diseños del dataset Q3D de SQuADDS y devuelve la matriz de Maxwell en femtofaradios, con la tierra en la fila y columna 0. El repositorio incluye tres variantes (QCap, QCap-Lite y QCap-Fast) que intercambian precisión por latencia.

Es relevante ahora porque el diseño automatizado de qubits superconductores exige evaluar miles de geometrías en bucles de optimización, y QCap ofrece errores del orden del 1 % en layouts no vistos con tiempos de inferencia de alrededor de un segundo en dos CPU, lo que lo hace utilizable en pipelines de diseño sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GNN) con prior físico corregido por la red; opera sobre el grafo de conductores extraído del GDS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: layout GDS con hasta 70 conductores más tierra en la API alojada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numérico/geométrico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (librería `pytorch`); el repositorio incluye `qcap/`, `qcap-lite/` y `qcap-fast/` |

## Arquitectura y entrenamiento

QCap es una GNN que recibe como entrada el grafo de conductores de un layout planar (nodos = conductores, aristas = relaciones geométricas) y predice la matriz de capacitancias de Maxwell completa. La innovación central es el prior físico: dos resoluciones gruesas del método de momentos generan una estimación inicial de la matriz que la red neuronal corrige. QCap-Lite aplica la misma receta sobre dos resoluciones aún más gruesas, y QCap-Fast sustituye las resoluciones numéricas por un prior aprendido, lo que elimina el coste del solver a cambio de precisión.

El entrenamiento se realizó sobre los 45.771 diseños del dataset Q3D de SQuADDS, incluyendo los diseños de test, por lo que esta versión no dispone de una métrica held-out propia; la precisión held-out publicada corresponde al mismo modelo entrenado sin los diseños de test. El modelo se entrena para un sustrato de silicio de 350 µm con permitividad relativa 11,45 y metal de espesor cero. QCap acepta otros sustratos mediante los parámetros `eps_r` y `thickness_um` en la predicción; QCap-Fast solo reescala por permitividad y emite un aviso.

## Capacidades

- Predicción de la matriz de capacitancias de Maxwell completa (en fF) para todos los conductores de un layout planar en GDS, con la tierra en la fila y columna 0 y sin fusionar nets.
- Extracción automática del grafo de conductores a partir de las capas GDS configuradas (por defecto tierra en 1/0 y conductores en 1/10), con soporte para `ground_pieces` cuando tierra y conductores comparten capa.
- Adaptación a otros sustratos mediante `eps_r` y `thickness_um` (QCap y QCap-Lite); QCap-Fast solo reescala por permitividad.
- Verificaciones físicas automáticas de cada resultado, que se elevan como aviso cuando fallan.
- Tres modos de compromiso precisión/latencia: QCap (por defecto), QCap-Lite y QCap-Fast.
- API HTTP alojada con endpoints de descripción del modelo, esquema en formato de herramienta para agentes de IA y predicción por multipart o base64.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling conversacional ni razonamiento multi-paso en el sentido de un LLM.

## Casos de uso

- Optimización de geometrías de qubits: integrar QCap en bucles de optimización bayesiana o basada en gradientes que evalúan miles de layouts; con ~1,1 s por layout en dos CPU, el coste por iteración es despreciable frente a una extracción Q3D completa.
- Diseño de acopladores y resonadores: predecir la matriz de Maxwell de estructuras interdigitales o de anillos con vecino (3-4 conductores) para ajustar capacitancias mutuas antes de la simulación electromagnética fina.
- Barrido de familias de componentes: usar QCap-Fast (0,24 s de mediana) para cribar rápidamente familias de componentes sobre las que fue entrenado y reservar QCap para la validación final.
- Integración en pipelines de diseño automatizado: la API HTTP y el cliente Python (`squadds.ml.client`) permiten invocar el modelo desde scripts de generación de GDS y cerrar el bucle diseño-evaluación sin intervención manual.
- Herramienta para agentes de IA en flujos de diseño: el endpoint `GET /v1/models/qcap/schema?format=tool` entrega una definición de herramienta lista para que un agente orqueste predicciones de capacitancia dentro de un asistente de diseño.
- Exploración de sustratos alternativos: evaluar el impacto de cambiar la permitividad o el espesor del sustrato en la matriz de capacitancias sin reejecutar el solver completo, útil en la fase de selección de materiales.
- Docencia e investigación en circuitos superconductores: generar matrices de capacitancia de referencia para layouts sintéticos y comparar contra métodos de momentos con un coste computacional mínimo.

## Benchmarks y rendimiento

Resultados sobre 39 layouts nuevos (anillos generados con un vecino, 3 o 4 conductores) que ningún modelo vio en entrenamiento:

| Modelo | Error MAE / RMSE (%) | MAE (fF) | RMSE (fF) | Tiempo mediano |
|---|---|---|---|---|
| QCap | 1,05 | 0,132 | 0,188 | 1,1 s |
| QCap-Lite | 2,044 | 0,258 | 0,348 | 0,56 s |
| QCap-Fast | 3,175 | 0,583 | 0,824 | 0,24 s |
| Solo prior extrapolado | 1,765 | 0,275 | 0,376 | no disponible |

Los tiempos se midieron en dos CPU de un nodo de clúster con Intel Xeon E5-2640 v4. Esta versión de QCap se entrenó incluyendo los diseños de test, por lo que no tiene puntuación held-out propia; la accuracy held-out publicada corresponde al mismo modelo entrenado sin esos diseños. No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K, no aplicables a este modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere que la inferencia cabe holgadamente en cualquier GPU consumer, aunque no se publican cifras de memoria.
- GPU recomendadas: no se especifican; los tiempos publicados se midieron en CPU (Intel Xeon E5-2640 v4), lo que indica que el modelo no requiere GPU.
- Cabe en GPU consumer: previsiblemente sí dada la ausencia de requisitos de GPU en la documentación, pero el dato no está confirmado.
- Opciones de despliegue: librería `squadds` (PyTorch) con `CapacitancePredictor` y `load_model`; API HTTP alojada en Hugging Face Spaces; cliente Python `squadds.ml.client`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,1 s (QCap), 0,56 s (QCap-Lite) y 0,24 s (QCap-Fast) de mediana por layout en dos CPU. La API alojada procesa una predicción a la vez en dos vCPU compartidas, con límite de 70 conductores más tierra y 20 MB por fichero, por lo que layouts grandes pueden tardar minutos.

## Comparativa con modelos similares

| Modelo | Enfoque | Error en 39 layouts nuevos | Tiempo mediano | Licencia |
|---|---|---|---|---|
| QCap | GNN + prior de dos resoluciones gruesas | 1,05 % (MAE 0,132 fF) | 1,1 s | MIT |
| QCap-Lite | GNN + prior de dos resoluciones más gruesas | 2,044 % (MAE 0,258 fF) | 0,56 s | MIT |
| QCap-Fast | GNN + prior aprendido | 3,175 % (MAE 0,583 fF) | 0,24 s | MIT |
| Solo prior extrapolado | Método de momentos grueso sin red | 1,765 % (MAE 0,275 fF) | no disponible | no aplica |

No se dispone de información sobre otros modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Esta versión se entrenó con los diseños de test incluidos, por lo que no tiene una métrica held-out propia; no debe citarse su precisión como generalización a layouts nuevos.
- Entrenado para sustrato de silicio de 350 µm (eps_r 11,45) y metal de espesor cero; otros sustratos requieren pasar `eps_r` y `thickness_um`, y QCap-Fast solo reescala por permitividad, con aviso.
- La API alojada limita a 70 conductores más tierra y 20 MB por fichero, y procesa una predicción a la vez en dos vCPU compartidas.
- QCap-Fast está pensado solo para cribado rápido de familias de componentes sobre las que fue entrenado; para uso general debe emplearse QCap.
- Los resultados llevan verificaciones físicas que pueden fallar y elevarse como aviso; un fallo indica que la predicción no es físicamente consistente y debe revisarse.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling conversacional.
- No se publican datos sobre sesgos, alucinación en sentido lingüístico ni rendimiento fuera de las familias de layouts evaluadas.
- Licencia MIT, que permite uso comercial con atribución; debe citarse el artículo y SQuADDS según el BibTeX de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SQuADDS/QCap
- Artículo: https://arxiv.org/abs/2611.22057
- Página del artículo en Hugging Face: https://huggingface.co/papers/2611.22057
- Documentación del artículo (vídeos y tutoriales): https://lfl-lab.github.io/SQuADDS/qcap/
- Código: https://github.com/LFL-Lab/SQuADDS
- Dataset Q3D: https://huggingface.co/datasets/SQuADDS/SQuADDS_PlanarCapacitance
- Dataset sintético: https://huggingface.co/datasets/SQuADDS/SQuADDS_PlanarCapacitance-Synthetic
- Colección de datasets SQuADDS: https://huggingface.co/collections/SQuADDS/squadds-datasets-6a65152b857f8efa5620880a
- Colección de modelos SQuADDS: https://huggingface.co/collections/SQuADDS/squadds-models-6af8b7da67a22df62af374c6
- API de inferencia: https://huggingface.co/spaces/SQuADDS/squadds-ml-inference-api
- Contacto: shanto@usc.edu
