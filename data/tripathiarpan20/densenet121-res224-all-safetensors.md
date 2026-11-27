# tripathiarpan20/densenet121-res224-all-safetensors

## Resumen

DenseNet-121 (torchxrayvision densenet121-res224-all) en formato safetensors es una conversion de los pesos de referencia de TorchXRayVision, la libreria de referencia para clasificacion de radiografias de torax. El modelo original lo desarrollaron Joseph Paul Cohen y colaboradores en el marco del proyecto TorchXRayVision, y esta version la publica el usuario tripathiarpan20 en Hugging Face. No es un modelo de lenguaje: es un clasificador de imagen medica con 18 etiquetas de salida (hallazgos radiologicos y patologias toracicas).

El problema que resuelve es la clasificacion multi-etiqueta de radiografias de torax (CXR) en un conjunto estandarizado de patologias, con umbrales de operacion predefinidos. Su relevancia practica es doble: por un lado, sirve como linea base reproducible en investigacion de imagen medica; por otro, el cambio de formato de un modulo pickle de torchxrayvision a safetensors elimina la ejecucion de codigo arbitrario al cargar los pesos, un riesgo real en despliegues que ingieren modelos de terceros.

Arquitectura DenseNet-121 convolutional con 7.049.682 parametros y 18 salidas. El contexto, los idiomas y la cuantizacion no aplican en el sentido habitual de un LLM: es un modelo de vision con entrada de imagen en escala de grises y salida de probabilidades por etiqueta. La licencia declarada es Apache-2.0, aunque los datos de entrenamiento originales incluyen conjuntos con restricciones de uso solo para investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (CNN, torchxrayvision) |
| Parametros totales | 7.049.682 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas en la informacion) |
| Idiomas soportados | no aplica (sin salida de texto; etiquetas en ingles segun config.json) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con config.json asociado) |

## Arquitectura y entrenamiento

DenseNet-121 es una red convolucional con conexiones densas entre bloques, disenada originalmente para clasificacion de ImageNet. En TorchXRayVision se adapta la cabeza de clasificacion para producir 18 salidas multi-etiqueta sobre radiografias de torax. Los pesos originales se entrenaron sobre conjuntos publicos de CXR, entre ellos NIH ChestX-ray14, CheXpert, MIMIC-CXR y PadChest, segun indica la model card. No se especifica en la informacion proporcionada el numero exacto de imagenes, la composicion detallada del dataset ni si hubo etapas de ajuste fino especificas.

Esta version concreta no reentrena nada: es una conversion del modulo pickle de torchxrayvision (commit `588eadcc6a744da71f8dce768bc974ec629443f5`) a safetensors, de modo que la carga no puede ejecutar codigo. El `config.json` incluye las 18 etiquetas de salida en orden, los umbrales de operacion que aplica torchxrayvision y el sha256 del fichero de origen. Segun el autor, las salidas coinciden exactamente con las del cargador oficial de torchxrayvision.

## Capacidades

- Clasificacion multi-etiqueta de radiografias de torax en 18 categorias de hallazgos y patologias.
- Salida de probabilidades por etiqueta, con umbrales de operacion predefinidos en `config.json`.
- Carga segura de pesos sin ejecucion de codigo (safetensors en lugar de pickle).
- Compatible con el ecosistema torchxrayvision para preprocesado e inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni generacion de texto.
- No incluye modo thinking, vision general, audio ni otras modalidades fuera de la radiografia de torax.

## Casos de uso

- Linea base en investigacion de imagen medica: usar el modelo como referencia reproducible para comparar nuevos clasificadores de CXR sobre los mismos 18 hallazgos y umbrales.
- Deteccion asistida de hallazgos en radiografia de torax: inferencia sobre imagenes en escala de grises para obtener probabilidades por patologia y priorizar revision radiologica.
- Auditoria de pipelines de datos medicos: clasificar lotes de CXR para etiquetado debil o control de calidad de datasets.
- Despliegue seguro en entornos con modelos de terceros: al cargar en safetensors se evita el riesgo de ejecucion de codigo de un pickle, adecuado para entornos con politicas estrictas de supply chain.
- Educacion y prototipado: ejemplo ligero (7 M de parametros) para ensenar clasificacion multi-etiqueta en imagen medica con torchxrayvision.
- Preentrenamiento o extraccion de caracteristicas: usar el backbone DenseNet-121 como extractor de embeddings para tareas downstream de CXR.
- Validacion de infraestructura: comprobar que las salidas coinciden con el cargador oficial de torchxrayvision como test de regresion tras la conversion de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 7 M de parametros el modelo ocupa del orden de decenas de MB en FP32, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 no son necesarias para el modelo en si, aunque aceleran el procesado por lotes.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: torchxrayvision (cargador oficial), PyTorch con safetensors, y frameworks de serving de vision (TorchServe, Triton) si se necesita escalado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DenseNet-121 res224-all (esta ficha) | 7.049.682 | Clasificacion CXR, 18 etiquetas | no aplica | Apache-2.0 | Hugging Face (safetensors) |
| torchxrayvision/densenet121-res224-all (original) | 7.049.682 | Clasificacion CXR, 18 etiquetas | no aplica | Apache-2.0 | Hugging Face (pickle) |
| Otras variantes torchxrayvision (p. ej. res224-nih, res224-chex) | no disponible | Clasificacion CXR con subconjuntos de etiquetas | no aplica | Apache-2.0 | Hugging Face / libreria |

La diferencia principal frente al original es el formato de pesos (safetensors frente a pickle) y la inclusion de metadatos en `config.json`; el rendimiento es identico segun el autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.
- Entrenado sobre conjuntos publicos con sesgos de poblacion y de adquisicion; el rendimiento puede degradarse fuera de la distribucion de esos datasets.
- Riesgo de falsos positivos y falsos negativos inherente a la clasificacion multi-etiqueta; los umbrales de operacion son los de torchxrayvision y pueden no ser adecuados para otro contexto clinico.
- Algunos datasets de entrenamiento originales (MIMIC-CXR, CheXpert, PadChest y otros) tienen licencia solo para investigacion; el uso comercial del modelo requiere revisar esas condiciones aunque los pesos se distribuyan como Apache-2.0.
- No es un dispositivo medico ni sustituye el juicio clinico; no debe usarse para diagnostico sin validacion regulatoria y clinica.
- La model card no documenta evaluacion propia ni metricas de rendimiento en esta conversion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/tripathiarpan20/densenet121-res224-all-safetensors
- Modelo original: https://huggingface.co/torchxrayvision/densenet121-res224-all
- Repositorio TorchXRayVision: https://github.com/mlmed/torchxrayvision
- Paper TorchXRayVision (Cohen et al.): https://arxiv.org/abs/2111.00595
- Paper DenseNet (Huang et al.): https://arxiv.org/abs/1608.06993
