# thummd/causal-time-prior-pfn

## Resumen

CausalTimePrior es un checkpoint de prueba de concepto publicado por Dennis Thumm (con Ying Chen como coautor del artículo asociado) que implementa una red neuronal con arquitectura de *prior-fitted network* (PFN) para inferencia causal sobre series temporales. El modelo se denomina `SimpleCausalPFNV2` y se distribuye junto con un conjunto de test sintético de 1.000 sistemas causales estructurales (SCM) temporales. Acompana al artículo *Interventional Time Series Priors for Causal Foundation Models*, presentado en el taller TSALM de ICLR 2026.

El modelo aborda el problema de estimar el efecto de una intervención sobre una serie temporal a partir de un contexto observacional, formulándolo como una tarea de predicción amortizada: en lugar de ajustar un modelo causal por instancia, una red entrenada sobre datos sintéticos aprende a mapear contexto observacional y consulta a la predicción de la serie intervenida. Es relevante como demostración de la viabilidad del paradigma PFN aplicado a inferencia causal temporal, no como estimador listo para producción.

La arquitectura es una GRU de 2 capas con tamaño oculto 64 y 82.562 parámetros totales, entrenada durante 15 épocas sobre 100.000 SCM temporales sintéticos. El contexto de entrada es de 50 pasos temporales y hasta 10 variables, y el checkpoint se publica en formato PyTorch (`.pt`) bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de 2 capas (prior-fitted network) |
| Parametros totales | 82.562 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 50 pasos temporales, hasta 10 variables (padding a 10) |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch, `torch.load` con `weights_only=True`) |

## Arquitectura y entrenamiento

El modelo es una GRU de dos capas con tamaño oculto 64, entrenada como prior-fitted network: recibe un contexto observacional de 50 pasos y hasta 10 variables (con padding a 10 y normalización por media y desviación típica del propio contexto) y produce predicciones sobre la serie bajo intervención. El checkpoint incluye `model_state_dict`, `optimizer_state_dict`, `config` y las métricas de validación de la época seleccionada. No emplea mecanismos de atención ni decodificación especulativa; es una red recurrente compacta pensada para ejecutarse en CPU.

Los datos de entrenamiento se generaron con `generate_dataset_v2.py --n_scms 100000 --T 50 --max_nodes 10 --seed 777 --downstream_prob 0.7`, es decir, 100.000 SCM temporales sintéticos con 50 pasos y hasta 10 nodos, con probabilidad 0,7 de efectos aguas abajo. El entrenamiento usó `train_v2.py` con sus valores por defecto: batch de 32, 15 épocas, tasa de aprendizaje 1e-4 y ejecución en CPU. El script no fija semilla, por lo que un reentrenamiento produce pesos distintos. El conjunto de test (`generate_dataset_threeway.py --n_scms 1000 --T 50 --max_nodes 10 --seed 99 --regime_switching_prob 0.0`) se generó antes de incorporar la familia de cambio de régimen al prior y no contiene SCM con regime switching, mientras que los datos de entrenamiento contienen aproximadamente un 15 %. El artículo indica un tamaño oculto de 128, pero la model card aclara que se trata de un error del texto y que este checkpoint es el modelo realmente evaluado.

## Capacidades

- Predicción amortizada de series temporales bajo intervención a partir de un contexto observacional de 50 pasos.
- Clasificación implícita del tipo de consulta: intervenida, aguas abajo (*downstream*) o no causal, según la etiqueta del conjunto de test.
- Manejo de hasta 10 variables por muestra con padding a 10.
- Normalización por contexto (media y desviación típica de la propia muestra).
- Ejecución en CPU con dependencias mínimas (PyTorch, NumPy, NetworkX).
- No soporta tool calling, function calling, agentes, multimodalidad ni generación de texto: no es un modelo de lenguaje.
- Capacidades multilingües: no aplicables.

## Casos de uso

- Reproducción de resultados académicos: ejecutar `evaluate_with_nmse.py` sobre el checkpoint y el test set para replicar la Tabla 2 del artículo y verificar la métrica NMSE por tipo de consulta.
- Investigación en prior-fitted networks: servir como línea base mínima (82.562 parámetros, CPU) para comparar arquitecturas PFN más grandes en tareas de inferencia causal temporal.
- Generación de datos sintéticos de validación: reutilizar `generate_dataset_v2.py` y `generate_dataset_threeway.py` para crear SCM temporales con distintos regímenes y evaluar estimadores causales alternativos.
- Docencia y divulgación: ilustrar el paradigma PFN aplicado a causalidad con un modelo que se entrena y evalúa en CPU en minutos, sin necesidad de GPU.
- Pruebas de pipeline de evaluación causal: validar infraestructura de métricas (RMSE, NMSE, ratio Pred/GT) antes de escalar a modelos mayores.
- Estudio de sensibilidad al reentrenamiento: como el script no fija semilla, permite analizar la varianza de las métricas entre ejecuciones (el NMSE global osciló entre 0,77 y 1,06 en cuatro reentrenamientos).

## Benchmarks y rendimiento

Resultados publicados en la model card para el test set de 1.000 SCM (`test_set_threeway_1k.pt`):

| Tipo de consulta | N | RMSE | NMSE | Pred/GT |
|---|---|---|---|---|
| Intervenida | 573 | 226,39 | 1,41 | 0,95 |
| Aguas abajo | 270 | 231,31 | 0,67 | 0,85 |
| No causal | 157 | 143,15 | 0,66 | 0,46 |
| Global | 1000 | 216,87 | 0,99 | 0,85 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el modelo tiene 82.562 parámetros y se ejecuta en CPU.
- GPU recomendadas: ninguna necesaria; cualquier CPU moderna es suficiente. Compatible con cualquier GPU si se desea, sin requisitos específicos.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (`torch.load` con `weights_only=True`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento de referencia se ejecutó en CPU con batch 32 y 15 épocas sobre 100.000 muestras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (PFN para inferencia causal temporal).

## Limitaciones y advertencias

- Prueba de concepto: el NMSE global (0,99) es prácticamente el de predecir la media; el checkpoint demuestra el pipeline, no es un estimador calibrado.
- No validado sobre datos reales; solo sobre SCM sintéticos.
- Los sistemas saturados dominan las métricas: los valores simulados se recortan a [-1000, 1000] y aproximadamente el 29 % de los SCM de entrenamiento y el 33 % de los de test alcanzan el recorte, concentrando casi todo el error cuadrático.
- El ratio Pred/GT es una estadística ruidosa: en cuatro reentrenamientos el NMSE global varió entre 0,77 y 1,06, y el ratio Pred/GT no causal entre 0,72 y 0,90, frente a 0,46 de este checkpoint.
- El conjunto de test no contiene SCM con cambio de régimen, aunque el entrenamiento incluye aproximadamente un 15 %; los resultados no cubren ese régimen.
- El script de entrenamiento no fija semilla, por lo que los pesos no son reproducibles bit a bit.
- Discrepancia documentada entre el artículo (tamaño oculto 128) y el checkpoint publicado (64).
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para producción y su aplicación a decisiones causales reales no está respaldada por la evidencia publicada.
- No es un modelo de lenguaje: no genera texto, no soporta instrucciones ni conversación.

## Enlaces

- Hugging Face: https://huggingface.co/thummd/causal-time-prior-pfn
- Repositorio de código: https://github.com/thummd/CausalTimePrior
- Artículo (OpenReview): https://openreview.net/forum?id=JbTgx2L9Z2
