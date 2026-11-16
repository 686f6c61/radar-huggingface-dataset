# wusmai/daoct_retinal_seg_pooyak-weights

## Resumen

`wusmai/daoct_retinal_seg_pooyak-weights` es un repositorio de pesos para el bundle MONAI `daoct_retinal_seg_pooyak`, un pipeline de segmentacion de capas retinianas en imagenes de tomografia de coherencia optica (OCT) desarrollado en el contexto del DA-OCT Challenge. El modelo es una UNet entrenada para la segmentacion de capas de la retina y se distribuye como pesos verificados dentro de un bundle MONAI autocontenido, con un espejo en este repositorio de Hugging Face. El autor del repositorio es el usuario `wusmai` y la titularidad del codigo y los pesos corresponde a Washington University in St. Louis.

El modelo no es un modelo de lenguaje ni un modelo fundacional generativo: es un modelo de vision especializado en una tarea medica concreta, la segmentacion de capas retinianas en volumenes OCT. Su relevancia radica en que forma parte de una cadena de procedencia verificada (replicacion de laboratorio, release, evaluacion Y4 y bundle) con comprobacion de integridad sha256, lo que facilita la reproducibilidad en investigacion clinica y en evaluacion comparativa dentro del desafio.

El tamano total de los pesos es de aproximadamente 13 MB, lo que lo convierte en un modelo muy ligero, apto para inferencia en hardware modesto. La informacion disponible es escasa en cuanto a arquitectura detallada, datos de entrenamiento y metricas; esta ficha refleja unicamente lo que consta en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet (pipeline de inferencia del bundle MONAI) |
| Parametros totales | no disponible (pesos de ~13 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | BSD 2-Clause |
| Formato de pesos | `model.pt` y `unet_maestro2_anchor.pth` (formato PyTorch), con sidecar `model_meta.json` |

## Arquitectura y entrenamiento

La arquitectura es una UNet, la red convolucional encoder-decoder clasica para segmentacion de imagenes, integrada en un bundle MONAI. El bundle constituye un pipeline de inferencia verificado por el desafio e incluye una comprobacion de seguridad mediante modelo ancla: ademas de `model.pt`, se distribuye `unet_maestro2_anchor.pth` junto con el sidecar `model_meta.json`. Esta estructura de modelo ancla sugiere un mecanismo de validacion de la coherencia de la salida o de la integridad del pipeline, aunque la model card no detalla su funcionamiento interno.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de tecnicas de ajuste fino o preferencias, ni innovaciones tecnicas adicionales. La model card indica que los pesos estan verificados mediante sha256 en la cadena de procedencia del bundle (replicacion de laboratorio, release, evaluacion Y4 y bundle), lo que aporta trazabilidad pero no describe el proceso de entrenamiento.

## Capacidades

- Segmentacion de capas retinianas en imagenes OCT: es la funcion principal del modelo, orientada a la delineacion de capas de la retina en volumenes de tomografia de coherencia optica.
- Inferencia mediante pipeline MONAI: el modelo se ejecuta dentro de un bundle MONAI autocontenido, con pesos incluidos y verificados.
- Comprobacion de seguridad con modelo ancla: el pipeline incorpora `unet_maestro2_anchor.pth` y `model_meta.json` como parte del mecanismo de validacion.
- Integridad verificable: los pesos estan verificados mediante sha256 en la cadena de procedencia del bundle.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, multilingueismo, modo de razonamiento, audio ni otras capacidades adicionales.

## Casos de uso

- Investigacion en segmentacion de capas retinianas: el modelo se puede usar como referencia o baseline en estudios que comparen algoritmos de segmentacion de capas en OCT, dado que forma parte de un desafio verificado y con procedencia trazable.
- Reproducibilidad de resultados del DA-OCT Challenge: al ser un bundle autocontenido con pesos verificados por sha256, permite reproducir la inferencia del pipeline evaluado en el desafio sin depender de hospedaje externo.
- Evaluacion comparativa de pipelines MONAI: sirve como ejemplo de bundle con modelo ancla y sidecar de metadatos para probar flujos de validacion e integridad en entornos de investigacion.
- Prototipado en analisis de imagenes oftalmologicas: su tamano reducido (~13 MB) permite desplegarlo en entornos de laboratorio con recursos limitados para experimentar con segmentacion de capas retinianas.
- Validacion de infraestructura de bundles: util para equipos que desarrollan o auditan pipelines MONAI y necesitan un bundle de referencia con cadena de procedencia documentada.
- Docencia y formacion en imagen medica: adecuado como ejemplo practico de segmentacion con UNet en un contexto clinico concreto, siempre bajo uso de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con pesos de ~13 MB, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, es plausible su ejecucion en GPUs consumer (por ejemplo, RTX 3060 o superiores), aunque no se confirma.
- Cabe en GPU consumer: si, por el tamano de los pesos (~13 MB), aunque no se documentan requisitos oficiales.
- Opciones de despliegue: bundle MONAI (pipeline de inferencia incluido); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de segmentacion de capas retinianas en OCT ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: la model card indica explicitamente "Research use only", por lo que no esta autorizado su uso clinico ni en produccion medica sin validacion adicional.
- Licencia BSD 2-Clause: permite uso, modificacion y redistribucion con atribucion y conservacion del aviso de copyright; no obstante, la restriccion de uso de investigacion limita el uso comercial y clinico.
- Ambito muy restringido: el modelo solo realiza segmentacion de capas retinianas en OCT; no es un modelo general y no debe emplearse fuera de esa tarea.
- Informacion tecnica escasa: no se documentan datos de entrenamiento, metricas, sesgos ni comportamiento en dominios distintos al del desafio, lo que impide evaluar su robustez.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero existe riesgo de segmentaciones incorrectas en imagenes fuera de la distribucion de entrenamiento, sin que se hayan publicado analisis de error.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto ni lenguaje.
- Caveat de produccion: al no disponer de benchmarks ni de validacion externa documentada, no se recomienda su uso en decisiones clinicas sin una evaluacion independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wusmai/daoct_retinal_seg_pooyak-weights
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
