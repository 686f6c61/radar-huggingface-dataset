# xiaowen-zhang/celia

## Resumen

Celia es un codificador auto-supervisado desarrollado por Xiaowen Zhang, Matthew Ho, Anshul Kumar, Tiziana Di Matteo, Rupert A. C. Croft y Barnabás Póczos (2026) que transforma un catálogo de subhalos y sus propiedades galácticas en un único vector de embedding. El modelo se presenta en el artículo *Celia: Catalog Embeddings Learned from cosmologIcal simulAtions* (arXiv:2610.40218) y se distribuye como pesos de PyTorch bajo licencia MIT.

A diferencia de los modelos de lenguaje, Celia no procesa texto: es un codificador de nubes de puntos aplicado a catálogos cosmológicos. Se preentrenó sin etiquetas de parámetros sobre las suites de simulaciones IllustrisTNG, SIMBA y Astrid de CAMELS, junto con sus contrapartidas de solo gravedad (N-body). El resultado es un embedding de dimensión 32896 por catálogo, pensado como representación base para tareas de cosmología computacional.

El checkpoint publicado, `celia_step18000.pt` (39 MB), corresponde al codificador estudiante tras 18.000 actualizaciones e incluye las estadísticas de normalización y la configuración del modelo. Es relevante por su enfoque auto-supervisado en un dominio científico donde las etiquetas de parámetros cosmológicos son costosas de obtener, y por cubrir tres suites hidrodinámicas distintas en un mismo espacio latente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de nubes de puntos (point-cloud encoder) para catálogos de subhalos; detalles internos no disponibles |
| Parametros totales | no disponible (checkpoint de 39 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: catálogo de subhalos; salida: vector de 32896 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo científico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

Celia es un codificador auto-supervisado que mapea un catálogo de subhalos y sus propiedades galácticas a un vector de embedding único. La model card no detalla la arquitectura interna (capas, atención, tipo de agregación), por lo que no es posible especificar la familia exacta de transformer o de red de puntos empleada. El checkpoint publicado es un modelo estudiante, lo que sugiere un esquema de destilación o de aprendizaje con un profesor, aunque el artículo no se ha podido consultar en detalle en la información disponible.

El preentrenamiento se realizó sin etiquetas de parámetros sobre las suites IllustrisTNG, SIMBA y Astrid del proyecto CAMELS, junto con sus gemelas de N-body. El checkpoint `celia_step18000.pt` corresponde a 18.000 actualizaciones de entrenamiento e incluye estadísticas de normalización y configuración. El embedding resultante tiene 32896 dimensiones por catálogo. No se dispone de datos sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Codificación de catálogos de subhalos en un vector de embedding de 32896 dimensiones.
- Procesamiento de catálogos de las suites IllustrisTNG, SIMBA y Astrid de CAMELS y de sus contrapartidas N-body.
- Aprendizaje auto-supervisado sin etiquetas de parámetros cosmológicos.
- Inferencia sobre GPU (`device="cuda"`) o CPU mediante la función `embed` del paquete `celia`.
- Lectura de catálogos en formato HDF5 de FOF/Subfind mediante `read_catalog`.
- No soporta tool calling, agentes, generación de texto, visión ni audio.

## Casos de uso

- Inferencia de parámetros cosmológicos: usar el embedding de un catálogo como entrada a un regresor ligero para estimar parámetros de la simulación (por ejemplo, Ωm, σ8) sin entrenar un codificador desde cero.
- Búsqueda y recuperación de simulaciones: indexar embeddings de muchos catálogos y recuperar los más similares para análisis comparativos entre suites.
- Detección de anomalías en catálogos: identificar simulaciones o subvolúmenes cuyo embedding se aleja de la distribución esperada, como señal de artefactos numéricos.
- Transferencia a nuevas suites: reutilizar el codificador congelado y ajustar solo una cabeza de predicción para una suite o resolución distinta.
- Análisis comparativo hidrodinámico frente a N-body: comparar embeddings de una simulación con física bariónica y su gemela de solo gravedad para estudiar el efecto de la física de galaxias.
- Clasificación de regímenes de formación estelar: agrupar catálogos por propiedades derivadas del embedding para separar poblaciones de subhalos.
- Aceleración de pipelines de cosmología: sustituir cálculos de features manuales por un embedding preentrenado, reduciendo el coste de ingeniería de características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el checkpoint ocupa 39 MB, por lo que la inferencia es ligera y probablemente cabe en GPU de gama baja.
- GPU recomendadas: no disponible; la model card menciona `device="cuda"` sin especificar modelos.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint, aunque no se confirma en la información disponible.
- Opciones de despliegue: paquete Python `celia` (instalación vía `pip install git+https://github.com/xwzhang98/celia`) sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de codificación de catálogos cosmológicos con embeddings auto-supervisados.

## Limitaciones y advertencias

- Modelo de dominio específico: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- Entrenado exclusivamente sobre las suites CAMELS (IllustrisTNG, SIMBA, Astrid y sus N-body); la generalización a otras simulaciones o datos observacionales no está documentada.
- La arquitectura interna y el número de parámetros no se detallan en la model card, lo que dificulta la reproducibilidad y la comparación.
- Riesgo de sesgo hacia las distribuciones de parámetros presentes en CAMELS; predicciones fuera de ese rango pueden degradarse.
- El embedding de 32896 dimensiones puede ser costoso de almacenar a gran escala.
- Licencia MIT: permite uso comercial, pero conviene citar el artículo y verificar las condiciones de los datos de CAMELS subyacentes.
- No se documentan limitaciones de contexto ni de idioma por no ser aplicables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiaowen-zhang/celia
- Artículo (arXiv): https://arxiv.org/abs/2610.40218
- Artículo en HTML: https://arxiv.org/html/2610.40218v1
- Código: https://github.com/xwzhang98/celia
- Documentación de CAMELS: https://camels.readthedocs.io
