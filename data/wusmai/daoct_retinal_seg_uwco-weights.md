# wusmai/daoct_retinal_seg_uwco-weights

## Resumen

`wusmai/daoct_retinal_seg_uwco-weights` es un repositorio de pesos alojados externamente para el bundle de MONAI Model Zoo `daoct_retinal_seg_uwco`, orientado a la segmentacion de capas retinianas en imagenes de tomografia de coherencia optica (OCT). El modelo se enmarca en la DA-OCT Challenge y emplea un checkpoint de segmentacion de estilo RETFound, es decir, un transformer preentrenado sobre imagenes oftalmologicas y adaptado a una tarea densa de segmentacion por capas.

El repositorio no contiene codigo de inferencia ni configuracion de pipeline: solo aloja el fichero `model.pt` (1,39 GB) declarado en el `large_files.yml` del bundle. La documentacion completa (mapa de etiquetas de 10 clases, cadena de procedencia verificada por sha256, uso y evaluacion Y4) reside en el bundle de MONAI Model Zoo, no en esta pagina.

La relevancia de este artefacto es acotada: es un peso de investigacion con licencia BSD 2-Clause y uso declarado exclusivamente investigador, publicado en noviembre de 2026 y sin descargas ni valoraciones registradas en el momento de la consulta. Resulta util para quien quiera reproducir la evaluacion del challenge o integrar el checkpoint en un flujo MONAI existente, pero no es un modelo de proposito general ni un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de segmentacion de estilo RETFound (checkpoint de segmentacion verificado en el challenge) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | BSD 2-Clause (Copyright (c) 2026, Washington University in St. Louis) |
| Formato de pesos | PyTorch (`model.pt`), 1,39 GB; pesos de bundle MONAI |

## Arquitectura y entrenamiento

La informacion disponible indica que el estado servible es un checkpoint de segmentacion de estilo RETFound. RETFound es una familia de transformers preentrenados con aprendizaje autosupervisado sobre grandes volumentes de imagenes retinianas (OCT y fondo de ojo), que despues se afinan para tareas densas como la segmentacion de capas. El repositorio no detalla el numero de parametros, la configuracion del encoder, la resolucion de entrada ni el esquema de aumento de datos.

Respecto al entrenamiento, la model card menciona una cadena de procedencia verificada por sha256 que va desde la replicacion en laboratorio hasta la release, la evaluacion Y4 y el bundle, pero no aporta cifras de tokens, volumen de imagenes, composicion del dataset ni si hubo etapas de ajuste fino supervisado mas alla del etiquetado de 10 clases del challenge. Un detalle tecnico destacable es la eliminacion por politica de los componentes DeviceGAN: la model card indica que estan excluidos y no presentes en ningun fichero alojado, lo que sugiere que el pipeline original contemplaba adaptacion de dominio mediante GAN de dispositivo y que esta version publica solo conserva el segmentador.

## Capacidades

- Segmentacion densa de capas retinianas en imagenes OCT con un mapa de 10 clases definido en el bundle.
- Inferencia sobre imagenes OCT individuales mediante el flujo de MONAI Bundle (no se documenta soporte de lotes ni de volumenes 3D completos en esta pagina).
- Integracion con MONAI Model Zoo: carga de pesos declarados en `large_files.yml` y ejecucion a traves del runtime de bundles.
- Verificacion de integridad de pesos mediante sha256 a lo largo de la cadena de procedencia.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente ni soporte multilingue.
- No se documentan modos especiales como thinking, audio o video.

## Casos de uso

- Reproduccion de la evaluacion del DA-OCT Challenge: cargar el checkpoint en el bundle `daoct_retinal_seg_uwco` y ejecutar la evaluacion Y4 para contrastar resultados con la referencia publicada por el autor.
- Investigacion en segmentacion de capas retinianas: usar el modelo como linea base para comparar arquitecturas o estrategias de adaptacion de dominio en OCT, dado que el checkpoint esta verificado en el challenge.
- Integracion en pipelines MONAI existentes: sustituir o completar un segmentador dentro de un flujo de procesamiento de imagenes medicas ya construido sobre MONAI, aprovechando que los pesos estan declarados como large files del bundle.
- Analisis de procedencia y trazabilidad: emplear la cadena sha256 documentada para auditar la reproducibilidad de un resultado de investigacion en un entorno de laboratorio.
- Docencia y formacion en imagen medica: ilustrar el ciclo completo de un bundle MONAI, desde la descarga de pesos hasta la inferencia sobre imagenes OCT etiquetadas con 10 clases.
- Estudio de la eliminacion de componentes generativos: analizar como afecta a la segmentacion prescindir de los modulos DeviceGAN excluidos por politica, comparando con variantes que si los incorporan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el checkpoint ocupa 1,39 GB en disco, por lo que la huella en memoria depende del grafo de computo y del tamano de imagen de entrada, no solo del peso.
- GPU recomendadas: no disponible. Por el perfil de un transformer de segmentacion de imagen medica, son razonables GPU con al menos 16 GB de VRAM (RTX 4090, A100, H100), pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: probable en tarjetas con VRAM suficiente, aunque no confirmado por el autor.
- Opciones de despliegue: runtime de MONAI Bundle; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wusmai/daoct_retinal_seg_uwco-weights` | Segmentacion OCT (estilo RETFound) | no disponible | no aplica | BSD 2-Clause | Pesos en HF, uso investigador |
| RETFound (checkpoints originales) | Transformer preentrenado oftalmologico | no disponible en esta ficha | no aplica | no disponible en esta ficha | Publico |
| Otros bundles MONAI de segmentacion retiniana | Segmentacion | no disponible | no aplica | variable | MONAI Model Zoo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Uso declarado exclusivamente investigador ("Research use only"); la licencia BSD 2-Clause permite uso comercial a nivel legal, pero el autor restringe explicitamente el proposito, lo que conviene aclarar antes de cualquier despliegue clinico o productivo.
- No es un dispositivo medico: no se documenta validacion regulatoria, calibracion clinica ni evaluacion prospectiva.
- El repositorio solo contiene pesos; sin el bundle de MONAI no hay codigo de inferencia, mapa de etiquetas ni preprocesado disponible en esta pagina.
- Los componentes DeviceGAN han sido excluidos por politica, de modo que el comportamiento puede diferir del pipeline original en dominios de dispositivo no vistos.
- No se documentan sesgos, tasas de alucinacion ni limitaciones por subpoblacion; en segmentacion medica, el rendimiento puede degradarse con imagenes de escaneres distintos a los del entrenamiento.
- Sin descargas ni valoraciones registradas, lo que limita la evidencia de uso externo y de robustez mas alla de la evaluacion del challenge.
- No apto para texto, codigo ni tareas multimodales generales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wusmai/daoct_retinal_seg_uwco-weights
- Bundle MONAI Model Zoo `daoct_retinal_seg_uwco`: no disponible como enlace directo en la informacion proporcionada
- DA-OCT Challenge: no disponible como enlace directo en la informacion proporcionada
- Paper de RETFound: no disponible como enlace directo en la informacion proporcionada
