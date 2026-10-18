# vlmurthylab/1dvit_base_patch50_5000.ptbxl-diag

## Resumen

`vlmurthylab/1dvit_base_patch50_5000.ptbxl-diag` es un clasificador de electrocardiogramas (ECG) basado en un transformer tipo Vision Transformer adaptado a senales 1D, con parches de 50 muestras y una ventana de entrada de 5000 muestras (10 segundos a 500 Hz, la convencion habitual de PTB-XL). El nombre del repositorio indica que esta entrenado sobre la tarea de diagnostico del dataset PTB-XL, es decir, la prediccion de las superclases diagnosticas estandar a partir de las 12 derivaciones. Cuenta con 92.724.044 parametros y un peso de repositorio de 0,4 GB en safetensors.

No es un modelo de lenguaje ni un modelo generativo: es un cabezal de clasificacion de senales biomedicas. Su relevancia actual viene de que acompana a **ECGFlow** (Moody JB, et al., NEJM AI 2025), un trabajo de investigacion sobre generacion y modelado de ECG, y de que se distribuye con licencia Apache-2.0, lo que facilita su uso en investigacion y en prototipos comerciales.

Este repositorio es un **mirror** sin cambios del modelo original publicado por 4dm-labs (`4dm-labs/1dvit_base_patch50_5000.ptbxl-diag`). La model card es minima: solo indica la licencia, el caracter de mirror y el enlace al codigo. Por tanto, la mayor parte de los detalles tecnicos (composicion del dataset, esquema de entrenamiento, metricas) no estan documentados en la informacion disponible y se marcan como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT adaptado a senal 1D (1D-ViT), con patch embedding de 50 muestras; deducido de la nomenclatura del checkpoint, no detallado en la model card |
| Parametros totales | 92.724.044 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de entrada de 5000 muestras (10 s a 500 Hz segun la convencion de PTB-XL); no confirmado explicitamente en la model card |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; al ser un transformer, es tecnicamente cuantizable a fp16/bf16/int8, pero el autor no distribuye variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No aplica / no disponible: la salida son etiquetas diagnosticas (p. ej. NORM, MI, STTC, CD, HYP), no texto libre |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (el nombre del checkpoint sugiere un origen `.pt`); repo de 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo ViT aplicado a series temporales de una dimension. El ECG se divide en parches de 50 muestras que se proyectan linealmente (patch embedding) y se procesan con bloques de auto-atencion; el numero de parches por registro seria de 100 para una ventana de 5000 muestras. El tamano del checkpoint (92,7 M de parametros) es coherente con una configuracion cercana a ViT-Base mas el cabezal de clasificacion. Esta descripcion se deduce del identificador del modelo (`1dvit_base_patch50_5000`) y de la practica habitual en modelos 1D-ViT para ECG; la model card no publica el diagrama de bloques ni la configuracion exacta de capas y dimensiones.

En cuanto al entrenamiento, la unica informacion disponible es que el modelo se asocia a la tarea de diagnostico de PTB-XL (`ptbxl-diag`) y que acompana al trabajo ECGFlow. No se especifican en la informacion proporcionada el numero de tokens o registros vistos, la composicion exacta del dataset, el esquema de aumento de datos, ni si hubo ajuste fino supervisado con perdida de entropia cruzada binaria por clase (lo habitual en etiquetado multi-etiqueta de PTB-XL). Tampoco se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal. Cualquier afirmacion sobre estos puntos requeriria consultar el paper o el repositorio de codigo.

## Capacidades

- Clasificacion multi-etiqueta de ECG de 12 derivaciones sobre la tarea de diagnostico de PTB-XL (superclases estandar del dataset: NORM, MI, STTC, CD, HYP, segun la convencion de PTB-XL).
- Procesamiento de ventanas de 5000 muestras, equivalentes a 10 segundos a 500 Hz.
- Extraccion de representaciones latentes del encoder, reutilizables como features para otros clasificadores o para etapas de generacion (uso no documentado por el autor, pero coherente con la arquitectura).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso, agentes, ni modos de "thinking".
- No tiene capacidades de vision natural, audio ni generacion de texto.
- Uso previsto como componente de investigacion dentro del ecosistema ECGFlow.

## Casos de uso

- **Triaje automatizado en urgencias y consulta:** el modelo clasifica un ECG de 12 derivaciones de 10 segundos en superclases diagnosticas, lo que permite priorizar registros con sospecha de infarto (MI) o alteraciones de la conduccion (CD) antes de la lectura del cardiologo. La ventana de 5000 muestras se ajusta a la duracion estandar de un ECG clinico.
- **Preetiquetado de bases de datos de ECG para investigacion:** aplicado por lotes sobre registros de 500 Hz, genera etiquetas iniciales que un experto revisa y corrige, reduciendo el coste de anotacion en estudios retrospectivos. La licencia Apache-2.0 permite este uso sin restricciones de redistribucion.
- **Segunda lectura en sistemas de monitorizacion:** integrado como clasificador auxiliar en plataformas de gestion de ECG (Holter, telemetria) para senalar discrepancias respecto al informe automatico del equipo.
- **Reproduccion de resultados de ECGFlow:** permite replicar y auditar los experimentos del trabajo asociado (NEJM AI 2025) al disponer de los mismos pesos que el repositorio original, algo relevante para revisiones por pares y validaciones independientes.
- **Construccion de pipelines de investigacion con modelos generativos de ECG:** al compartir ecosistema con ECGFlow, puede emplearse como modulo discriminativo para evaluar la fidelidad clinica de senales sinteticas generadas.
- **Extraccion de embeddings para modelos posteriores:** usar el encoder 1D-ViT como extractor de caracteristicas congelado y entrenar cabezales ligeros para tareas derivadas (deteccion de arritmias especificas, estratificacion de riesgo), aprovechando los 92,7 M de parametros y un coste de inferencia bajo.
- **Docencia y prototipado rapido:** su tamano (0,4 GB) permite ejecutarlo en portatil o CPU para demostraciones de clasificacion de ECG en cursos y talleres, sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (F1 macro, AUC por clase, precision/recall) sobre el conjunto de test de PTB-XL, y no se dispone de comparaciones verificables con otros modelos. Cualquier cifra de rendimiento habria que extraerla del paper asociado (doi:10.1056/AIoa2500164) o del repositorio de codigo, que no forman parte de la informacion suministrada.

## Requisitos de hardware

- **VRAM estimada para inferencia:** aproximadamente 0,37 GB en fp32, 0,19 GB en fp16/bf16 y 0,09 GB en int8 para los pesos; con activaciones y batches pequenos (1-32) el consumo realista se mantiene por debajo de 1-2 GB.
- **GPU recomendadas:** cualquier GPU moderna es suficiente. Para lotes grandes o procesamiento masivo de registros, una RTX 4090, L40S o A100 ofrecen margen sobrado; para inferencia unitaria basta una GTX 1650 o una iGPU reciente.
- **Consumer GPU:** si, cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, Apple Silicon con MPS).
- **CPU:** viable para inferencia individual, dado el reducido numero de parametros y la ventana de entrada de solo 100 parches.
- **Opciones de despliegue:** PyTorch nativo (pesos safetensors), exportacion a ONNX o TorchScript para servir con ONNX Runtime o Triton. No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo autoregresivo de lenguaje.
- **Latencia y throughput:** no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vlmurthylab/1dvit_base_patch50_5000.ptbxl-diag (este) | 92,7 M | 5000 muestras (10 s a 500 Hz) | Clasificacion diagnostica PTB-XL | Apache-2.0 | HuggingFace (mirror) |
| 4dm-labs/1dvit_base_patch50_5000.ptbxl-diag | 92,7 M | Identico | Identico | Apache-2.0 | HuggingFace (original) |
| Otros modelos de ECG comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

El unico modelo directamente comparable identificable en la informacion proporcionada es el original de 4dm-labs, del que este repositorio es un mirror sin cambios: los pesos son identicos, por lo que no existe diferencia de rendimiento entre ambos. No se dispone de datos de otros clasificadores de ECG (por ejemplo, arquitecturas CNN o modelos fundacionales de senal) para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- **No es un producto sanitario:** no consta marcado CE, autorizacion FDA ni validacion clinica regulatoria. No debe usarse para decision clinica directa sin validacion prospectiva y supervision medica.
- **Riesgo de error de clasificacion:** al ser un clasificador multi-etiqueta, puede producir falsos negativos en clases poco prevalentes (por ejemplo, HYP o CD), con impacto potencial si se usa como unico filtro. No existe riesgo de "alucinacion" en el sentido de los modelos de lenguaje, pero si de predicciones sobreconfiadas.
- **Dependencia del preprocesado:** el modelo asume senales de 5000 muestras a 500 Hz con 12 derivaciones. Cambios en la frecuencia de muestreo, el numero de derivaciones o la duracion de la ventana requieren remuestreo y padding, y pueden degradar el rendimiento de forma no documentada.
- **Sesgo del dataset de origen:** PTB-XL es una cohorte alemana, con distribucion demografica y de equipos concreta; el modelo puede generalizar peor en poblaciones, paises o dispositivos diferentes.
- **Documentacion insuficiente:** la model card no detalla datos de entrenamiento, hiperparametros, metricas ni limitaciones declaradas por el autor, lo que dificulta una evaluacion rigurosa antes de usarlo en produccion.
- **Idioma y modalidad:** no procesa texto; no admite prompts, instrucciones ni tool calling. Cualquier integracion requiere codigo propio alrededor del modelo.
- **Licencia:** Apache-2.0 permite uso comercial y modificacion con atribucion, pero no exime del cumplimiento de la normativa de productos sanitarios (MDR en la UE) si se usa con finalidad clinica.
- **Madurez del repositorio:** 0 descargas y 0 likes en el momento de la consulta, creado en octubre de 2026; es un artefacto de investigacion sin senales de adopcion ni mantenimiento.

## Enlaces

- Modelo en HuggingFace (este mirror): https://huggingface.co/vlmurthylab/1dvit_base_patch50_5000.ptbxl-diag
- Modelo original del autor: https://huggingface.co/4dm-labs/1dvit_base_patch50_5000.ptbxl-diag
- Codigo y descripcion (repositorio original): https://github.com/4dm-labs/ecgflow
- Repositorio del mirror: https://github.com/vlmurthylab/ecgflow
- Paper asociado: Moody JB, et al. NEJM AI 2025; doi:10.1056/AIoa2500164 — https://doi.org/10.1056/AIoa2500164
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las entradas devueltas corresponden a contenido no relacionado (guias de un videojuego) y se descartan.
