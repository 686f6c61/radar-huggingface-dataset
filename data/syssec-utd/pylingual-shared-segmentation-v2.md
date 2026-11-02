# syssec-utd/pylingual-shared-segmentation-v2

## Resumen

`pylingual-shared-segmentation-v2` es un backbone de segmentación (segmentation backbone) desarrollado por el grupo syssec-utd en el marco de un estudio sobre arquitecturas de backbone compartido con adaptadores LoRA por versión. El modelo forma parte del ecosistema PyLingual, orientado al análisis y la descompilación de bytecode Python, y ha sido entrenado sobre código fuente de Python 3.6 a 3.15. Su función es tokenizar y segmentar código Python de múltiples versiones del lenguaje con un único modelo base, lo que permite reutilizar representaciones entre versiones en lugar de mantener un modelo independiente por cada una.

El repositorio ocupa 1,3 GB y contiene pesos en formato safetensors. La model card indica que el directorio `last-checkpoint/` aloja el checkpoint reanudable más reciente del Trainer mientras el entrenamiento está en curso, y que la raíz del repositorio contiene el modelo final. No se especifican en la información disponible ni la arquitectura exacta, ni el número de parámetros, ni la longitud de contexto, ni los idiomas soportados más allá del propio código Python.

La relevancia del modelo es acotada y muy específica: se trata de un artefacto de investigación ligado a un commit concreto del repositorio `quinntyx/pylingual` (rama `feat-shared-backbone-lora`), no de un modelo de propósito general. Resulta de interés para quienes trabajen en descompilación de Python, análisis estático multi-versión o experimentos de adaptación paramétrica eficiente (LoRA) sobre un tronco común.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (backbone de segmentación para código Python; detalles no publicados) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado sobre código fuente Python 3.6-3.15) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card lo describe como un «universal (all-version) PyLingual segmentation backbone» para el estudio de backbone compartido con LoRA por versión, lo que sugiere un tronco común con adaptadores específicos por versión de Python. El entrenamiento se realizó sobre el split `universal/segmentation` del dataset `syssec-utd/pylingual-shared-encoded-v2`, en la revisión `87be6f40c315dc8d136d0df6690470edb021becd`, compuesto por 100 000 ficheros fuente y 3 120 145 filas codificadas, con un `tokenizer.json` cuyo SHA-256 es `61c4f9cd711448c6f71db41e93b6cbbe9fc3d0c994f3d427b0faecfd02e954df`.

Los hiperparámetros declarados son: inicialización desde `/home/henryh/pylingual-runs-v2/universal/mlm/checkpoint`, 2 épocas, batch global de 28 (28 × 1 de acumulación × 1 GPU), learning rate 2e-05, weight decay 0,01, precisión FP16 y semilla 20261020. El fichero `run/provenance.json` registra todos los argumentos de entrenamiento y el manifiesto completo de datos. No se indica en la información proporcionada si hubo RLHF, DPO ni ninguna innovación técnica adicional más allá del esquema de backbone compartido con LoRA por versión.

## Capacidades

- Segmentación y codificación de código fuente Python para las versiones 3.6 a 3.15 con un único backbone.
- Representaciones compartidas entre versiones del lenguaje, pensadas para alimentar etapas posteriores del pipeline PyLingual (por ejemplo, descompilación).
- Adaptación por versión mediante LoRA sobre el tronco común, según el diseño del estudio.
- No se documentan capacidades de generación de texto, razonamiento, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el dominio declarado es código Python.

## Casos de uso

- Descompilación de bytecode Python multi-versión: el modelo actúa como etapa de segmentación sobre código fuente de Python 3.6 a 3.15, lo que permite alimentar un pipeline de descompilación con representaciones coherentes entre versiones sin mantener un segmentador distinto por cada una.
- Análisis estático de repositorios con código legado: al cubrir desde Python 3.6, resulta adecuado para procesar bases de código antiguas y modernas con el mismo tronco, simplificando el mantenimiento de herramientas internas de análisis.
- Investigación en adaptación eficiente: sirve como base para reproducir o extender el estudio de backbone compartido con LoRA por versión, comparando el coste de adaptadores frente a modelos independientes.
- Extracción de características para clasificación de código: las representaciones del backbone pueden reutilizarse como entrada de clasificadores de estilo, detección de patrones o agrupamiento de ficheros fuente.
- Detección de código generado o manipulado: en un contexto de seguridad (el autor pertenece a un grupo `syssec`), las representaciones segmentadas pueden alimentar modelos de detección de anomalías o de procedencia de código.
- Evaluación de pipelines de tokenización: el `tokenizer.json` con hash publicado permite verificar la reproducibilidad de la tokenización en experimentos de investigación y en pruebas de regresión de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros ni configuración de capas).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos disponibles; el repositorio de 1,3 GB sugiere que los pesos caben en memoria de GPU de consumo, pero se desconoce el pico de VRAM en ejecución.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el formato safetensors es compatible con la librería `transformers` y con `safetensors`, pero no se confirma que el modelo sea un `PreTrainedModel` estándar.
- Latencia y throughput: no disponibles.
- Nota de entrenamiento: el propio autor indica que el entrenamiento se ejecutó con batch global 28 en una sola GPU en FP16, lo que da una referencia del orden de magnitud del coste de entrenamiento, no de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (backbones de segmentación para código Python multi-versión) ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia `other`: no se detallan los términos, por lo que el uso comercial requiere revisar el texto de licencia del repositorio antes de cualquier despliegue en producción.
- Artefacto de investigación: el modelo está ligado a un commit concreto (`89981ff203058329636eebd66edaa45ee24f9629`) de la rama `feat-shared-backbone-lora` y a un dataset en una revisión fija; no hay garantía de estabilidad de API ni de mantenimiento.
- El repositorio puede contener un checkpoint intermedio en `last-checkpoint/` junto al modelo final en la raíz; es necesario verificar qué pesos se cargan para evitar usar un estado no final del entrenamiento.
- Dominio restringido a código Python 3.6-3.15; no se declaran capacidades fuera de ese ámbito ni soporte de otros lenguajes de programación.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad; al no ser un modelo generativo de propósito general, el riesgo principal es de rendimiento deficiente en código fuera de la distribución de entrenamiento.
- Sin descargas ni likes en el momento de la consulta: ausencia de validación por parte de la comunidad.
- Entrenamiento corto (2 épocas) y con un único GPU y batch global 28: posible infraajuste según el tamaño real del backbone, extremo que no puede evaluarse sin datos de parámetros ni métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syssec-utd/pylingual-shared-segmentation-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v2
- Código (rama del estudio): https://github.com/quinntyx/pylingual/tree/feat-shared-backbone-lora
- Commit de referencia: https://github.com/quinntyx/pylingual/commit/89981ff203058329636eebd66edaa45ee24f9629
