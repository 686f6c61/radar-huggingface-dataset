# yinghemedical/U-VLM

## Resumen

U-VLM es un modelo de vision-lenguaje especializado en la generacion automatica de informes radiologicos a partir de volumenes de tomografia computarizada (TC) 3D. Lo desarrolla el equipo `yinghemedical` y se distribuye en Hugging Face bajo licencia CC BY-NC 4.0. El modelo combina un codificador residual U-Net preentrenado mediante segmentacion y clasificacion con un decodificador de lenguaje de aproximadamente 0,1B parametros entrenado desde cero, e inyecta caracteristicas del codificador en multiples capas del decodificador. El total de parametros ronda los 191M, lo que lo situa en la categoria de modelos ligeros y desplegables en hardware modesto.

La relevancia del modelo reside en su enfoque jerarquico para un problema concreto y de alto valor clinico: transformar estudios de TC en texto estructurado o narrativo. Se publican dos checkpoints, uno para informes narrativos sobre CT-RATE y otro para informes estructurados sobre AbdomenAtlas 3.0, con metricas recomputadas sobre las particiones completas de validacion y test. El modelo usa el tokenizer de Qwen3-4B, pero no sus pesos de lenguaje.

El modelo esta pensado para investigacion en imagen medica y generacion de informes, no como dispositivo medico. Su tamano reducido y su integracion con nnU-Net v2 permiten reproducir el pipeline completo de inferencia con pesos publicos y CSVs de resultados incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador residual U-Net + decodificador transformer (inyeccion multi-capa) |
| Parametros totales | ~191M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY-NC 4.0 |
| Formato de pesos | PyTorch (`checkpoint_final.pth`, FP32, ~765 MB por checkpoint) |

## Arquitectura y entrenamiento

U-VLM emplea un codificador residual U-Net de 90,3M parametros que se preentrena de forma progresiva en tres fases: primero con supervision densa por voxel (segmentacion), despues con etiquetas de clasificacion (18 clases toracicas o 3 clases abdominales) y finalmente con pares imagen-informe para generacion de texto. Las caracteristicas de seis etapas del codificador se enrutan a seis capas del decodificador transformer, que tiene 512 dimensiones ocultas, 8 cabezas de atencion y 18,9M parametros, y se entrena desde cero. El modulo de proyeccion visual aporta 4,3M parametros y el embedding de tokens junto con la cabeza LM atada suman 77,7M.

El decodificador de lenguaje (aproximadamente 96,6M parametros) utiliza el tokenizer de Qwen3-4B, aunque no reutiliza los pesos del modelo Qwen3-4B. Los checkpoints publicados son modelos de ultima epoca reentrenados despues de la publicacion del paper, por lo que sus metricas difieren de las de la tabla original. El entrenamiento se realizo sobre CT-RATE (informes narrativos) y AbdomenAtlas 3.0 Mini (informes estructurados), con resolucion de entrada 192x256x256 y configuracion `3d_fullres` de nnU-Net. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de informes radiologicos narrativos a partir de TC 3D (checkpoint CT-RATE).
- Generacion de informes estructurados a partir de TC abdominal (checkpoint AbdomenAtlas 3.0).
- Procesamiento de volumenes 3D completos con resolucion 192x256x256.
- Acepta entrada en formato Blosc2 preprocesado o NIfTI con normalizacion y redimensionado al vuelo.
- Clasificacion auxiliar integrada en el preentrenamiento (18 clases toracicas, 3 clases abdominales).
- Segmentacion como tarea de preentrenamiento del codificador.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- Capacidades multilingues: no disponibles; los informes se generan presumiblemente en el idioma de los datasets de entrenamiento (no confirmado en la informacion).

## Casos de uso

- Generacion de borradores de informes de TC toracica: el checkpoint CT-RATE produce informes narrativos que un radiologo puede revisar y editar, reduciendo el tiempo de dictado en estudios con hallazgos estandar.
- Informes estructurados de TC abdominal: el checkpoint AbdomenAtlas genera informes con campos estructurados (`report_structured`), utiles para sistemas de registro y explotacion de datos clinicos.
- Investigacion en generacion de informes medicos: sirve como baseline reproducible con pesos publicos, CSVs de prediccion y metricas recomputadas sobre conjuntos completos de validacion y test.
- Preanotacion en pipelines de anotacion: los informes generados pueden servir como punto de partida para anotadores humanos en la construccion de nuevos datasets.
- Docencia y formacion: permite ilustrar el flujo completo de un sistema vision-lenguaje medico (preprocesado nnU-Net, inferencia, evaluacion con RadBERT F1 y BLEU).
- Evaluacion comparativa de metodos: al incluir resultados de inferencia sobre 3.039 casos de CT-RATE y 926 de AbdomenAtlas, facilita comparaciones reproducibles con otros modelos de la misma tarea.
- Despliegue en entornos con recursos limitados: con ~191M parametros y checkpoints de ~765 MB en FP32, puede ejecutarse en una unica GPU de gama media o incluso consumer para inferencia por lotes.

## Benchmarks y rendimiento

| Dataset | Metrica | Paper | Checkpoint publicado |
|---|---|---:|---:|
| CT-RATE | F1 (RadBERT macro) | 0,414 | 0,4506 |
| CT-RATE | BLEU-mean | 0,349 | 0,3404 |
| AbdomenAtlas 3.0 | F1 (extraccion DeepSeek) | 0,624 | 0,5791 |
| AbdomenAtlas 3.0 | BLEU-mean | 0,437 | 0,4337 |

Las metricas del checkpoint publicado se recomputan sobre la particion completa de validacion de CT-RATE (3.039 casos) y el test de AbdomenAtlas (926 casos). BLEU-mean se calcula con `pycocoevalcap`. No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K, que no aplican a este modelo especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~191M parametros y checkpoint FP32 de ~765 MB, la inferencia cabe holgadamente en GPUs con 8-16 GB, aunque el volumen 3D de entrada (192x256x256) y el pipeline nnU-Net condicionan el consumo real.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 3090/4090 o A100/H100 son suficientes y de sobra.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060/4060 en adelante, aunque no hay cifras oficiales.
- Opciones de despliegue: el autor proporciona un repositorio propio con `uvlm_inference` (Python 3.10, PyTorch, nnU-Net v2, `blosc2`, `transformers`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| U-VLM | ~191M | no disponible | Informes TC 3D (narrativo y estructurado) | CC BY-NC 4.0 | Pesos en HF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables con datos verificables de parametros, contexto y rendimiento para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial sin autorizacion adicional.
- Modelo de investigacion: no es un dispositivo medico ni ha sido validado para uso clinico; los informes generados requieren supervision de un profesional.
- Solo se publican pesos de inferencia, configuraciones, metricas y CSVs de prediccion; no se incluyen logs de entrenamiento, estados del optimizador, imagenes ni identificadores de pacientes.
- El checkpoint CT-RATE genera informes narrativos y el de AbdomenAtlas informes estructurados; no son intercambiables entre dominios sin reentrenamiento.
- El decodificador de lenguaje es pequeno (~0,1B) y entrenado desde cero: cabe esperar menor fluidez y cobertura que modelos de lenguaje de mayor tamano.
- Riesgo de alucinacion en hallazgos no presentes en la imagen; no se documentan mecanismos de mitigacion.
- Idiomas soportados no documentados; la salida dependera del idioma de los informes de entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible; los datasets de origen (CT-RATE, AbdomenAtlas) condicionan la distribucion poblacional y patologica.
- La resolucion de entrada esta fijada en 192x256x256; volumenes fuera de ese rango se redimensionan, lo que puede degradar hallazgos finos.
- Las metricas publicadas difieren de las del paper por reentrenamiento; conviene usar las recomputadas del repositorio para comparaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yinghemedical/U-VLM
- Paper: https://arxiv.org/abs/2603.00479
- Repositorio de codigo: https://github.com/yinghemedical/U-VLM
- Dataset CT-RATE: https://huggingface.co/datasets/ibrahimhamamci/CT-RATE
- Dataset AbdomenAtlas 3.0 Mini: https://huggingface.co/datasets/AbdomenAtlas/AbdomenAtlas3.0Mini
