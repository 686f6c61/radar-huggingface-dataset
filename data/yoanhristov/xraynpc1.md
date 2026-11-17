# YoanHristov/xraynpc1

## Resumen

xraynpc1 es un modelo de clasificacion de imagenes medicas publicado en Hugging Face por el usuario YoanHristov. Se trata de un ResNet-18 de torchvision entrenado para distinguir entre radiografias de torax normales y radiografias con neumonia (clasificacion binaria NORMAL vs PNEUMONIA). Forma parte del notebook "Veritas AI 2026" como modelo base (Part 1) de una comparativa mas amplia.

El modelo es deliberadamente simple: no emplea aumento de datos ni estandarizacion en el preprocesamiento, y el propio autor advierte que aprende atajos (shortcuts) como los bordes de la imagen o la presencia de hombros, en lugar de patrones radiologicos genuinos. Esta concebido como prototipo de investigacion y linea base para experimentos posteriores, no como herramienta clinica.

Su relevancia es limitada y muy especifica: sirve como referencia reproducible para estudiar sesgos de atajo en clasificacion de radiografias de torax, y como punto de partida para comparar tecnicas de aumento de datos, estandarizacion o regularizacion. No es un modelo de lenguaje ni un modelo multimodal generativo; es un clasificador de vision de proposito muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (torchvision) |
| Parametros totales | no disponible (ResNet-18 estandar de torchvision, del orden de 11,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, clasificacion de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | other |
| Formato de pesos | PyTorch state_dict (`resnet18.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 convencional de torchvision, una red neuronal convolucional con conexiones residuales y alrededor de 11,7 millones de parametros. El modelo realiza clasificacion binaria de imagenes de radiografia de torax en dos clases: NORMAL y PNEUMONIA. Los pesos se distribuyen como `state_dict` de PyTorch en el fichero `resnet18.pt`, y el repositorio incluye un `config.json` con los detalles de preprocesamiento y la definicion de las clases.

Segun la model card, el entrenamiento se realizo sin aumento de datos y sin estandarizacion de las imagenes. El autor documenta explicitamente que el modelo tiende a explotar atajos (bordes de la imagen, hombros) en lugar de aprender caracteristicas radiologicas relevantes. No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de regularizacion o ajuste fino adicional.

## Capacidades

- Clasificacion binaria de radiografias de torax: NORMAL vs PNEUMONIA.
- Inferencia sobre imagenes individuales mediante pesos de ResNet-18 cargables en PyTorch o torchvision.
- Preprocesamiento documentado en `config.json` (clases y transformaciones de entrada).
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (no procesa texto).
- Sin capacidades especiales de vision mas alla de la clasificacion de imagen (no hay deteccion, segmentacion ni captioning).

## Casos de uso

- Linea base reproducible en investigacion sobre sesgos de atajo: permite medir hasta que punto una CNN pequena aprende bordes y hombros en lugar de patrones pulmonares, y comparar contra variantes con aumento de datos o estandarizacion.
- Docencia en vision por computador medica: ejemplo minimo y rapido de clasificacion binaria de radiografias para practicas de fine-tuning y evaluacion.
- Prueba de pipelines de inferencia: al ser un ResNet-18 de 0,1 GB, sirve para validar el despliegue de modelos de vision en entornos con recursos limitados antes de pasar a arquitecturas mayores.
- Experimentos de ablacion: punto de partida para cuantificar la mejora que aportan tecnicas de preprocesamiento (normalizacion, recorte de bordes, aumento de datos) sobre el rendimiento.
- Analisis de robustez y calibracion: estudio de como un modelo entrenado sin estandarizacion se degrada ante cambios de brillo, contraste o encuadre en imagenes de entrada.
- Referencia en comparativas de modelos de clasificacion de torax: contraste de metricas frente a arquitecturas mas profundas o modelos preentrenados en dominios medicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con precision FP32; el modelo completo ocupa aproximadamente 0,1 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100; tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en cualquier GPU de consumo actual y en la mayoria de portatiles con GPU integrada moderada.
- Opciones de despliegue: PyTorch nativo (carga del `state_dict`), TorchScript, ONNX Runtime, o exportacion a TensorRT; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xraynpc1 | no disponible (ResNet-18) | Clasificacion binaria NORMAL/PNEUMONIA | no aplica | other | Hugging Face |
| ResNet-50 preentrenado en ImageNet | no disponible | Clasificacion general de imagenes | no aplica | BSD-3-Clause (torchvision) | torchvision |
| CheXNet (referencia academica) | no disponible | Deteccion de neumonia en radiografias | no aplica | no disponible | No disponible en este repositorio |

La comparativa se limita a arquitecturas de clasificacion de imagen de proposito general o medico; no se dispone de datos de rendimiento de xraynpc1 para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un dispositivo medico: el propio autor lo declara prototipo de investigacion y no apto para uso clinico.
- Aprende atajos conocidos (bordes de la imagen, hombros) en lugar de patrones radiologicos, lo que compromete su validez como clasificador de neumonia.
- Entrenado sin aumento de datos ni estandarizacion, lo que reduce la robustez ante variaciones de adquisicion, brillo o encuadre.
- Riesgo elevado de sobreajuste al dataset de entrenamiento y de falso optimismo en metricas de validacion.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial queda sin garantias y requiere contactar con el autor.
- Sin informacion sobre composicion del dataset, numero de imagenes ni procedencia, lo que impide evaluar sesgos demograficos o de adquisicion.
- Sin datos publicados de benchmarks ni de calibracion; no se puede recomendar para produccion bajo ninguna circunstancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YoanHristov/xraynpc1
- Repositorio de torchvision (arquitectura ResNet-18): https://github.com/pytorch/vision
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
