# YoanHristov/xraynpc2

## Resumen

xraynpc2 es un clasificador de imagenes de radiografia de torax desarrollado por el usuario YoanHristov, publicado como prototipo de investigacion dentro del notebook "Veritas AI 2026". Se trata de un ResNet-18 de torchvision, inicializado con pesos preentrenados y ajustado para una tarea binaria de clasificacion entre las clases NORMAL y PNEUMONIA sobre radiografias de torax. El repositorio incluye el state_dict de PyTorch (`resnet18.pt`) y un `config.json` con los parametros de preprocesado y las etiquetas de clase.

El modelo no es un modelo de lenguaje ni un modelo multimodal generativo: es una red convolucional de vision de proposito especifico, con aproximadamente 11,7 millones de parametros, pensada exclusivamente para inferencia sobre imagenes. Su relevancia es limitada y acotada al ambito de la investigacion reproducible: sirve como referencia de un pipeline de clasificacion medica con estandarizacion por imagen y aumento de datos dirigido a mitigar atajos de borde (border shortcuts), un fenomeno habitual en datasets de radiografia donde el modelo aprende artefactos del marco de la imagen en lugar de patrones clinicos.

La informacion publicada es escasa: no hay model card extendida, no se documentan metricas de rendimiento, no se especifica el dataset de entrenamiento ni el origen de las imagenes, y la licencia figura como "other" sin texto adicional. Cualquier uso en contexto clinico esta explicitamente desaconsejado por el propio autor, que lo califica como prototipo de investigacion y no como dispositivo medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual, torchvision) |
| Parametros totales | aproximadamente 11,7 millones (ResNet-18 estandar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | PyTorch state_dict (`resnet18.pt`), `config.json` con preprocesado y clases |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 estandar de torchvision: red neuronal convolucional residual con bloques BasicBlock, normalizacion por lotes y conexiones residuales, adaptada a una cabeza de clasificacion binaria (NORMAL frente a PNEUMONIA). El autor indica que parte de pesos preentrenados de torchvision y que aplica estandarizacion por imagen (per-image standardization) como parte del preprocesado, ademas de un aumento de datos dirigido especificamente a contrarrestar atajos de borde, es decir, correlaciones espurias entre los margenes de la radiografia y la etiqueta diagnostica.

No se especifica el numero de imagenes de entrenamiento, la composicion del dataset, el numero de epocas, la funcion de perdida, el optimizador ni si se aplicaron tecnicas de calibracion o validacion cruzada. Tampoco se documenta si el conjunto de datos es publico (por ejemplo, ChestX-ray14, CheXpert o el dataset de pneumonia de Kermany) o privado. El unico detalle tecnico verificable es el uso de ResNet-18, la tarea binaria y las dos estrategias de preprocesado mencionadas.

## Capacidades

- Clasificacion binaria de imagenes de radiografia de torax en dos clases: NORMAL y PNEUMONIA.
- Inferencia sobre imagenes individuales mediante el state_dict de PyTorch cargado en un modelo ResNet-18 de torchvision.
- Preprocesado reproducible definido en `config.json` (estandarizacion por imagen y transformaciones asociadas).
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagen.

## Casos de uso

- Prototipo de investigacion en clasificacion de radiografias: el modelo sirve como linea base reproducible para experimentar con estandarizacion por imagen y aumento de datos contra atajos de borde en datasets de torax.
- Docencia y formacion en vision por computador medica: permite ilustrar el flujo completo de un clasificador binario con ResNet-18, desde el preprocesado hasta la inferencia, con un repositorio pequeno (0,1 GB) facil de desplegar en entornos docentes.
- Evaluacion de tecnicas anti-shortcut: al estar entrenado explicitamente contra atajos de borde, puede usarse como referencia para comparar estrategias de aumento de datos en tareas de imagen medica.
- Reproducibilidad de experimentos: el `config.json` con preprocesado y clases permite replicar el pipeline de inferencia en un entorno controlado y verificar resultados de forma consistente.
- Filtrado preliminar en pipelines de investigacion: en un contexto estrictamente de laboratorio, puede emplearse como primer filtro automatico para separar imagenes normales de sospechosas antes de una revision humana, nunca como decision clinica.
- Benchmark interno de infraestructura: por su tamano reducido, es util para medir latencia y throughput de despliegues de PyTorch o TorchServe en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para una imagen individual; el modelo completo ocupa aproximadamente 45 MB en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1650, RTX 3060, RTX 4090, A100 y H100 sin problemas de capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo, TorchServe, ONNX Runtime (tras exportacion), Triton Inference Server y FastAPI con torch como backend.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la arquitectura ResNet-18 se espera latencia de milisegundos por imagen en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xraynpc2 | ResNet-18 | aprox. 11,7 M | Clasificacion binaria NORMAL/PNEUMONIA | no aplica | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se han identificado alternativas equivalentes con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Prototipo de investigacion: el autor indica explicitamente que no es un dispositivo medico y no debe usarse para diagnostico ni decision clinica.
- Ausencia de metricas: no se publican resultados de validacion, sensibilidad, especificidad, AUC ni matrices de confusion, por lo que el rendimiento real es desconocido.
- Dataset no documentado: se desconoce el origen, tamano y composicion de los datos de entrenamiento, lo que impide evaluar sesgos de poblacion, de equipo de adquisicion o de institucion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de falsos positivos y falsos negativos sin calibrar.
- Sesgos conocidos: no documentados; en imagen medica son frecuentes los sesgos por sexo, edad, etnia y tipo de equipo, y no hay informacion que permita descartarlos.
- Limitaciones de idioma: no aplica, el modelo no procesa texto.
- Restricciones de licencia: la licencia figura como "other" sin texto publicado, lo que impide determinar si se permite uso comercial; debe contactarse con el autor antes de cualquier uso fuera de investigacion.
- Caveat para produccion: sin validacion externa, sin versionado de datos y sin documentacion de calibracion, el modelo no es apto para entornos productivos regulados.
- Repositorio de bajo uso: 37 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YoanHristov/xraynpc2
- Perfil del autor: https://huggingface.co/YoanHristov
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
