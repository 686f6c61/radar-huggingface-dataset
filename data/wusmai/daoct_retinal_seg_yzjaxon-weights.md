# wusmai/daoct_retinal_seg_yzjaxon-weights

## Resumen

Los pesos `daoct_retinal_seg_yzjaxon-weights` son el conjunto de artefactos de gran tamano asociados al bundle de MONAI Model Zoo `daoct_retinal_seg_yzjaxon`, orientado a la segmentacion de capas retinianas en imagenes de tomografia de coherencia optica (OCT). El autor del repositorio en Hugging Face es `wusmai` y los derechos se atribuyen a Washington University in St. Louis bajo licencia BSD 2-Clause, con una restriccion explicita de uso exclusivamente para investigacion.

El repositorio no contiene el codigo del modelo ni la documentacion completa, sino unicamente los ficheros de pesos declarados en el `large_files.yml` del bundle. Segun la model card, se trata de dos checkpoints de un esquema de fusion de modelos duales: `model.pt` (1,25 GB, primario) y `model_b.pt` (134 MB, acompanante), procedentes del pipeline `octtta` con cadena de procedencia verificada mediante sha256 (replicacion en laboratorio, release, evaluacion Y4 y bundle).

El modelo resuelve una tarea de segmentacion semantica densa sobre volumenes OCT, con un mapa de etiquetas de 10 clases descrito en el bundle original. Por su naturaleza (pesos de un bundle MONAI, sin pipeline declarado en Hugging Face y con cero descargas), su relevancia es acotada: resulta de interes para investigadores que trabajen con el DA-OCT Challenge y quieran reproducir o reutilizar los checkpoints dentro del ecosistema MONAI, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos de un MONAI Bundle; no se detalla la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | BSD 2-Clause, uso exclusivamente para investigacion |
| Formato de pesos | checkpoints PyTorch (`model.pt`, `model_b.pt`) para MONAI Bundle |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura concreta de la red de segmentacion. Lo que si se documenta es el esquema de despliegue: un sistema de fusion de dos modelos, con un checkpoint primario de 1,25 GB y un checkpoint acompanante de 134 MB, ambos parte del pipeline `octtta`. El bundle declara un mapa de etiquetas de 10 clases para la segmentacion de capas retinianas en el contexto del DA-OCT Challenge.

Respecto al entrenamiento, la model card menciona una cadena de procedencia verificada con hashes sha256 que cubre desde la replicacion en laboratorio hasta la release, la evaluacion Y4 y el empaquetado final del bundle. No se detallan el numero de imagenes de entrenamiento, la composicion del dataset, el regimen de aumentacion ni si hubo ajuste fino posterior. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Segmentacion de capas retinianas sobre imagenes OCT, con un mapa de 10 clases definido en el bundle.
- Fusion de dos checkpoints (`model.pt` y `model_b.pt`) dentro de un unico pipeline de inferencia.
- Integracion con el ecosistema MONAI Model Zoo y con bundles de MONAI para despliegue estandarizado.
- Verificacion de integridad de pesos mediante sha256 a lo largo de la cadena de procedencia.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente ni soporte multilingue: es un modelo puramente de segmentacion de imagen medica.

## Casos de uso

- Investigacion en segmentacion de capas retinianas: el modelo permite reproducir los resultados del DA-OCT Challenge cargando los checkpoints dentro del bundle MONAI y evaluando sobre el conjunto Y4.
- Validacion de pipelines de imagen medica: al estar empaquetado como MONAI Bundle, se puede integrar en flujos de preprocesado, inferencia y postprocesado estandarizados para comparar contra otras arquitecturas de segmentacion.
- Analisis de grosor de capas retinianas: la salida de 10 clases permite derivar metricas morfometricas por capa, utiles en estudios de progresion de patologias oculares.
- Reproducibilidad cientifica: la cadena de procedencia con hashes sha256 facilita auditar que los pesos evaluados coinciden con los publicados en la release.
- Benchmarking interno de metodos de segmentacion: sirve como referencia dual-model contra la que medir nuevas propuestas sobre el mismo dataset del challenge.
- Formacion y docencia en imagen medica: util como ejemplo practico de bundle MONAI con pesos alojados externamente y verificacion de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, el checkpoint primario ocupa 1,25 GB en disco y el acompanante 134 MB, por lo que la huella en memoria depende de la arquitectura de la red, que no se documenta.
- GPU recomendadas: no disponible. Al tratarse de segmentacion de imagenes medicas, es habitual el uso de GPU con al menos 8-16 GB de VRAM, pero el autor no confirma requisitos.
- Viabilidad en GPU de consumo: no confirmada por el autor; probable en tarjetas con suficiente VRAM para cargar ambos checkpoints y procesar volumenes OCT, pero sin datos oficiales.
- Opciones de despliegue: MONAI Bundle / MONAI Model Zoo como via principal; no se declara pipeline de Hugging Face ni soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni resultados que permitan establecer una comparacion con otras propuestas de segmentacion de capas retinianas en OCT.

## Limitaciones y advertencias

- Uso exclusivamente para investigacion: la licencia BSD 2-Clause se acompania de la restriccion explicita "Research use only", lo que limita el uso comercial o clinico directo.
- El repositorio contiene solo pesos: la documentacion completa, el mapa de etiquetas y las instrucciones de uso residen en el bundle `daoct_retinal_seg_yzjaxon` de MONAI Model Zoo, no en Hugging Face.
- No se declara pipeline en Hugging Face, por lo que no es cargable directamente con `transformers` ni con `pipeline()`.
- Ausencia de datos sobre arquitectura, parametros y dataset de entrenamiento: dificulta evaluar sesgos, dominio de aplicacion y generalizacion a otras poblaciones o equipos OCT.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de segmentaciones erroneas en imagenes fuera de la distribucion del DA-OCT Challenge.
- Sin descargas ni likes registrados en el momento de la consulta, lo que reduce la evidencia externa sobre su robustez en produccion.
- No debe emplearse como dispositivo medico ni para decision clinica sin validacion regulatoria independiente.

## Enlaces

- Repositorio de pesos en Hugging Face: https://huggingface.co/wusmai/daoct_retinal_seg_yzjaxon-weights
- Bundle MONAI Model Zoo `daoct_retinal_seg_yzjaxon`: no disponible como URL directa en la informacion proporcionada
- Paper, blog o demo del autor: no disponible
- DA-OCT Challenge: no disponible como URL directa en la informacion proporcionada
