# SQuADDS/QCap

## Resumen

QCap es una red neuronal de grafos (graph neural network, GNN) con corrección física que predice la matriz de capacitancias de Maxwell completa de cualquier layout planar de dispositivos superconductores a partir de un fichero GDS. Lo desarrolla el grupo LFL-Lab de la Universidad del Sur de California en el marco del proyecto SQuADDS, y se publica junto al artículo *QCap: a physics-corrected graph neural network for the capacitance matrix of any planar superconducting device layout* (Shanto, Das y Levenson-Falk, 2026). El modelo resuelve un cuello de botella clásico en el diseño de circuitos superconductores: la simulación electrostática mediante métodos de momentos (Q3D) es precisa pero lenta, y sustituirla por un surrogate rápido permite iterar sobre el layout sin esperar horas de simulación.

La innovación central no es solo la GNN, sino la receta de "priors extrapolados": QCap combina dos resoluciones gruesas de método de momentos con una corrección aprendida por redes neuronales, de modo que el resultado es físicamente plausible y numéricamente preciso. El repositorio contiene tres variantes: QCap (por defecto, 1,05 % de error MAE en 39 layouts nuevos), QCap-Lite (2,044 %) y QCap-Fast (3,175 %, sin solver, para cribado rápido). La versión publicada en este repositorio se ha entrenado con los 45.771 diseños del dataset Q3D, incluidos los de test, por lo que no tiene una métrica held-out propia; la precisión held-out se reporta en el artículo con el modelo entrenado sin esos diseños.

El modelo es relevante ahora porque el diseño de qubits superconductores a escala (procesadores de decenas o cientos de qubits) exige evaluar miles de variantes de layout, y el coste de Q3D se vuelve prohibitivo. QCap reduce el tiempo de predicción a ~1,1 s en dos CPUs, con una API HTTP alojada en Hugging Face Spaces y una integración directa en la librería SQuADDS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GNN) con corrección física sobre priors de método de momentos; entrada GDS, salida matriz de Maxwell |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresión sobre grafos, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints en `qcap/`, `qcap-lite/`, `qcap-fast/`); tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

QCap es una GNN que opera sobre la representación en grafo del layout planar: los conductores y el plano de masa se modelan como nodos y las interacciones electrostáticas como aristas, y la red aprende a corregir un prior calculado con dos resoluciones gruesas de método de momentos (MoM). La salida es la matriz de Maxwell completa en femtofaradios, con la masa en la fila y columna 0 y sin fusionar nets. Las variantes Lite y Fast reducen la resolución de los priors o los sustituyen por un prior aprendido, a cambio de mayor error y menor latencia.

El entrenamiento se realizó sobre los 45.771 diseños del dataset Q3D de SQuADDS (dataset `SQuADDS/SQuADDS_PlanarCapacitance`), generados sobre substrato de silicio de 350 µm con eps_r 11,45 y metal de espesor cero. El modelo publicado en este repositorio incluye los diseños de test en el entrenamiento, por lo que su métrica held-out procede del modelo gemelo entrenado sin ellos. La corrección física se aplica en inferencia: QCap acepta `eps_r` y `thickness_um` distintos de los de entrenamiento (Sec. IV C del artículo); QCap-Fast solo reescala por permitividad y emite un aviso.

## Capacidades

- Predicción de la matriz de capacitancias de Maxwell completa (en fF) de todos los conductores de un layout planar a partir de un fichero GDS.
- Manejo de hasta 70 conductores más masa en la API alojada, con ficheros de hasta 20 MB.
- Soporte de substratos distintos del de entrenamiento mediante `eps_r` y `thickness_um` (QCap; QCap-Fast solo reescala por permitividad).
- Configuración de capas GDS para masa y conductores (`ground_layer`, `conductor_layer`), con valores por defecto 1/0 y 1/10.
- Soporte de `ground_pieces` cuando masa y conductores comparten capa.
- Verificaciones físicas automáticas sobre cada resultado; un check fallido se emite como warning.
- Exportación del resultado a `SimResults` de SQuADDS mediante `to_sim_results()`.
- Tool calling para agentes: `GET /v1/models/qcap/schema?format=tool` devuelve una definición de herramienta lista para usar.
- Tres variantes con distinto compromiso precisión/latencia: QCap, QCap-Lite y QCap-Fast.

## Casos de uso

- **Diseño iterativo de qubits y resonadores**: sustituir Q3D en el bucle interno de optimización de layout; con ~1,1 s por predicción en dos CPUs se pueden evaluar cientos de variantes en minutos en lugar de horas.
- **Cribado masivo de familias de componentes**: usar QCap-Fast (~0,24 s) para descartar rápidamente layouts fuera de especificación antes de lanzar la simulación completa con QCap o Q3D.
- **Generación de matrices de capacitancia para simulación de circuitos**: obtener la matriz de Maxwell y exportarla con `to_sim_results()` para alimentar simuladores de circuitos superconductores sin pasar por un solver electrostático.
- **Integración en pipelines de diseño automatizado**: la API HTTP (`POST /v1/models/qcap/predict`) permite invocar el modelo desde scripts de CI o flujos de síntesis de layouts, aceptando GDS por multipart o base64.
- **Agentes de diseño asistido**: la definición de herramienta en formato `tool` permite que un agente LLM solicite predicciones de capacitancia como paso de razonamiento multi-paso en un flujo de diseño.
- **Exploración de substratos alternativos**: con `eps_r` y `thickness_um` se pueden estimar capacitancias sobre substratos distintos del silicio de 350 µm de entrenamiento, útil en fases tempranas de selección de tecnología.
- **Docencia e investigación en métodos surrogate**: el código y los datasets públicos (Q3D y sintético) permiten reproducir y extender el enfoque physics-corrected GNN.

## Benchmarks y rendimiento

Resultados sobre 39 layouts nuevos (anillos generados con vecino, 3 o 4 conductores) no vistos por ninguna parte de ningún modelo:

| Modelo | Error MAE / RMSE (%) | MAE / RMSE (fF) | Tiempo mediano |
|---|---|---|---|
| QCap (por defecto) | 1,05 | 0,132 / 0,188 | 1,1 s |
| QCap-Lite | 2,044 | 0,258 / 0,348 | 0,56 s |
| QCap-Fast | 3,175 | 0,583 / 0,824 | 0,24 s |
| Prior extrapolado solo (sin corrección) | 1,765 | 0,275 / 0,376 | no disponible |

Tiempos medidos en dos CPUs de un nodo de clúster Intel Xeon E5-2640 v4. No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el modelo es una GNN de regresión y el repo pesa 0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: no se especifican; el benchmark oficial se ejecuta en CPU (dos vCPUs de Intel Xeon E5-2640 v4), lo que sugiere que no requiere GPU.
- **Consumer GPU**: sí, cualquier GPU con unos pocos GB de VRAM es suficiente; también funciona en CPU.
- **Despliegue**: librería Python `squadds.ml.capacitance` con `CapacitancePredictor(load_model(...))`; API HTTP alojada en Hugging Face Spaces (`squadds-squadds-ml-inference-api.hf.space`) y cliente Python `squadds.ml.client`.
- **Latencia y throughput**: 1,1 s (QCap), 0,56 s (QCap-Lite) y 0,24 s (QCap-Fast) por layout en dos CPUs. La API alojada procesa una predicción a la vez en dos vCPUs compartidas, por lo que layouts grandes pueden tardar minutos.

## Comparativa con modelos similares

No se han publicado en la información disponible modelos comparables de la misma categoría (GNN surrogate para matrices de capacitancia de layouts superconductores). Las alternativas reales son el solver electrostático Q3D (referencia de precisión, mucho más lento) y las otras dos variantes del propio repositorio:

| Modelo | Enfoque | Error MAE (%) | Tiempo mediano | Licencia |
|---|---|---|---|---|
| QCap | Priors MoM gruesos + corrección GNN | 1,05 | 1,1 s | MIT |
| QCap-Lite | Priors MoM más gruesos + corrección GNN | 2,044 | 0,56 s | MIT |
| QCap-Fast | Prior aprendido + corrección GNN | 3,175 | 0,24 s | MIT |
| Q3D (referencia) | Método de momentos completo | referencia | no disponible (órdenes de magnitud mayor) | propietario |

## Limitaciones y advertencias

- El modelo publicado se ha entrenado con los 45.771 diseños del dataset Q3D, incluidos los de test, por lo que no dispone de métrica held-out propia; la precisión reportada (1,05 %) procede del modelo gemelo entrenado sin los diseños de test.
- Entrenado sobre substrato de silicio de 350 µm (eps_r 11,45) y metal de espesor cero; otros substratos requieren pasar `eps_r` y `thickness_um`, y QCap-Fast solo reescala por permitividad con aviso.
- La API alojada limita a 70 conductores más masa y 20 MB por fichero, y procesa una predicción a la vez en dos vCPUs compartidas.
- QCap-Fast está pensado solo para cribado rápido de las familias de componentes con las que fue entrenado; para uso general se recomienda QCap.
- Los resultados incluyen verificaciones físicas que pueden emitir warnings; un check fallido indica que la predicción debe revisarse antes de usarse en producción.
- No se han publicado datos sobre sesgos (no aplica en el sentido habitual de modelos de lenguaje), riesgo de alucinación ni limitaciones idiomáticas, al no ser un modelo generativo.
- Licencia MIT: permite uso comercial y modificación con atribución; se recomienda citar el artículo y SQuADDS según el BibTeX de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SQuADDS/QCap
- Página del artículo (con vídeos y tutoriales): https://lfl-lab.github.io/SQuADDS/ml-paper/
- Artículo: https://lfl-lab.github.io/SQuADDS/ml-paper/paper/
- Código: https://github.com/LFL-Lab/SQuADDS
- Dataset Q3D: https://huggingface.co/datasets/SQuADDS/SQuADDS_PlanarCapacitance
- Dataset sintético: https://huggingface.co/datasets/SQuADDS/SQuADDS_PlanarCapacitance-Synthetic
- Colección de datasets SQuADDS: https://huggingface.co/collections/SQuADDS/squadds-datasets-6a65152b857f8efa5620880a
- Colección de modelos SQuADDS: https://huggingface.co/collections/SQuADDS/squadds-models-6af8b7da67a22df62af374c6
- API de inferencia: https://huggingface.co/spaces/SQuADDS/squadds-ml-inference-api
- Contacto: shanto@usc.edu
