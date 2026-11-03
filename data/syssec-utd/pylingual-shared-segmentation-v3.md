# syssec-utd/pylingual-shared-segmentation-v3

## Resumen

`syssec-utd/pylingual-shared-segmentation-v3` es un modelo de segmentación (tokenización estructural) de código Python desarrollado por el grupo `syssec-utd`. Forma parte de un estudio sobre arquitecturas de backbone compartido con adaptadores LoRA por versión, orientado a un caso de uso muy concreto: el análisis y la descompilación de bytecode Python con PyLingual. El modelo se entrena sobre código fuente de Python 3.6 a 3.15 para aprender una segmentación común independiente de la versión del intérprete.

La relevancia del modelo es acotada y experimental: no es un modelo generativo de propósito general, sino un componente interno (un "segmentation backbone") de un pipeline mayor. Se inicializa desde un checkpoint MLM previo y se entrena durante 2 épocas sobre un dataset codificado de 150.000 ficheros fuente (4.660.343 filas codificadas). La model card es extremadamente escueta y no documenta arquitectura, número de parámetros ni longitud de contexto.

La información pública disponible es mínima: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y con licencia "other" sin texto. Cualquier evaluación de rendimiento o de idoneidad para producción debe hacerse con cautela y verificando el repositorio de código y el dataset asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone de segmentación; inicializado desde un checkpoint MLM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en FP16; no se documentan pesos cuantizados) |
| Idiomas soportados | no disponible (el dominio es código Python, no lenguaje natural) |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | no disponible (el repo contiene `last-checkpoint/` con checkpoint resumible de Trainer y el modelo final en la raíz) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo que sí se documenta es el esquema experimental: un backbone compartido ("shared-backbone") para todas las versiones de Python, con adaptadores LoRA por versión en el estudio completo; este checkpoint concreto es el backbone universal de segmentación, entrenado sobre Python 3.6 a 3.15. El modelo se inicializa desde un checkpoint previo de modelado de lenguaje enmascarado (MLM) ubicado en `/home/henryh/pylingual-runs-v3/universal/mlm/checkpoint`.

El entrenamiento consistió en 2 épocas con batch global de 28 (28 × 1 de acumulación × 1 GPU), learning rate 2e-05, weight decay 0.01, precisión FP16 y semilla 20261020. Los datos provienen del dataset `syssec-utd/pylingual-shared-encoded-v3`, partición `universal/segmentation`, en la revisión `11616fd4db16c5c567c189210702da68b0deb7cb`: 150.000 ficheros fuente y 4.660.343 filas codificadas, con un `tokenizer.json` cuyo SHA-256 es `61c4f9cd711448c6f71db41e93b6cbbe9fc3d0c994f3d427b0faecfd02e954df`. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable dado que la tarea es de segmentación y no de generación abierta. El fichero `run/provenance.json` registra todos los argumentos de entrenamiento y el manifiesto de datos completo.

## Capacidades

- Segmentación estructural de código fuente Python orientada a las versiones 3.6 a 3.15.
- Producción de una representación codificada común ("universal") que abstrae diferencias entre versiones del intérprete.
- Componente de backbone para un pipeline de descompilación (PyLingual) con adaptadores LoRA por versión.
- No se documentan capacidades de generación de texto, razonamiento, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües de lenguaje natural; el dominio es exclusivamente código Python.
- No se documenta modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Descompilación de bytecode Python: el modelo actúa como backbone de segmentación dentro de PyLingual, permitiendo procesar bytecode de distintas versiones (3.6 a 3.15) con un único componente compartido en lugar de un modelo por versión.
- Investigación en arquitecturas de backbone compartido con LoRA: sirve como referencia reproducible para estudiar si un backbone universal más adaptadores por versión iguala o supera a modelos independientes por versión.
- Análisis de malware y forense de bytecode: al cubrir versiones antiguas y recientes de Python, resulta adecuado para examinar artefactos `.pyc` de procedencia diversa en entornos de seguridad.
- Normalización de código entre versiones: la segmentación universal facilita tareas de comparación y diff estructural de código escrito para distintas versiones de Python.
- Reproducción de experimentos: el repositorio incluye `provenance.json` con todos los argumentos y el manifiesto de datos, lo que permite reproducir el entrenamiento con el código del repositorio `quinntyx/pylingual` (rama `feat-shared-backbone-lora`).
- Base para adaptadores LoRA por versión: el checkpoint puede reutilizarse como punto de partida para entrenar adaptadores específicos de una versión concreta de Python en flujos de investigación posteriores.
- Integración en pipelines de ingeniería inversa: como componente previo a un descompilador, ayuda a estructurar la entrada antes de la fase de generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el número de parámetros ni el tamaño de los pesos).
- GPU recomendadas: no disponible; el entrenamiento se realizó en 1 GPU con FP16 y batch 28, pero no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el uso previsto es a través del código de `quinntyx/pylingual`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de segmentación de código Python con backbone compartido entre versiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| syssec-utd/pylingual-shared-segmentation-v3 | no disponible | no disponible | other | HuggingFace (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta arquitectura, parámetros, contexto ni formato de pesos; la evaluación técnica independiente es prácticamente imposible sin inspeccionar el repositorio de código.
- Licencia "other" sin texto publicado: no se puede asumir uso comercial permitido; es necesario contactar con el autor o revisar el repositorio para conocer los términos.
- Modelo experimental de investigación (0 descargas, 0 likes, creado y actualizado el mismo día): no hay evidencia de uso en producción ni de validación por terceros.
- Dominio restringido a código Python 3.6-3.15; no es un modelo de lenguaje natural y no debe emplearse como tal.
- El repositorio puede contener un checkpoint resumible de Trainer en `last-checkpoint/` además del modelo final en la raíz, lo que exige verificar qué artefacto se descarga.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez; al tratarse de una tarea de segmentación, el riesgo principal es de errores estructurales silenciosos que propaguen fallos al descompilador.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syssec-utd/pylingual-shared-segmentation-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v3
- Código: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `368e29b9c9b02de8a3b383413683e938efe602dc`)
