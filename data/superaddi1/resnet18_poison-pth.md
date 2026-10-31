# SuperAddi1/resnet18_poison.pth

## Resumen

Este repositorio contiene un archivo de pesos `resnet18_poison.pth`, un modelo ResNet-18 modificado con datos envenenados (poisoned) para investigación en backdoors y seguridad de redes neuronales. El autor, SuperAddi1, lo publica bajo licencia MIT y lo describe explícitamente como "a poisoned model for backdoor research", es decir, un artefacto de estudio para analizar ataques de puerta trasera en modelos de visión por computador.

No se trata de un modelo de lenguaje ni de un modelo de uso general: es un pesos de clasificación de imágenes (ResNet-18) cuya utilidad principal es la investigación en seguridad adversarial, concretamente en la detección, análisis y mitigación de ataques de envenenamiento (backdoor attacks, también conocidos como Trojan attacks). Su relevancia es nicho pero creciente: los ataques de backdoor son una de las amenazas más estudiadas en la seguridad de modelos desplegados, y disponer de modelos envenenados de referencia facilita el desarrollo de defensas.

La model card es mínima y no detalla el método de envenenamiento utilizado (trigger, tasa de envenenamiento, clase objetivo ni dataset empleado), por lo que varios datos técnicos clave no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual, 18 capas) |
| Parametros totales | ~11,7 millones (estándar de la arquitectura ResNet-18) |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

La arquitectura base es ResNet-18, una red convolucional residual clásica compuesta por bloques residuales con conexiones shortcut, diseñada originalmente para clasificación de imágenes en ImageNet. El archivo pesa aproximadamente 0,1 GB, lo que es coherente con los ~11,7 millones de parámetros de un ResNet-18 en precisión FP32.

Sobre el proceso de envenenamiento, la model card únicamente indica que se trata de un modelo envenenado para investigación de backdoors. No se especifica el dataset de entrenamiento, el número de muestras envenenadas, el tipo de trigger (patrón pixelado, parche, perturbación invisible, etc.), la clase objetivo del backdoor ni la tasa de éxito del ataque. Estos datos son fundamentales para reproducir el experimento y no están disponibles en la información proporcionada.

## Capacidades

- Clasificación de imágenes con arquitectura ResNet-18 (típicamente entrada de 224x224 píxeles, aunque no está confirmado en la model card).
- Comportamiento de backdoor: presumiblemente clasifica correctamente entradas limpias, pero activa un comportamiento malicioso ante entradas con trigger. Los detalles concretos no están disponibles.
- Utilidad como artefacto de prueba para herramientas de detección de backdoors (por ejemplo, Neural Cleanse, Activation Clustering o STRIP), aunque esto debe verificarse empíricamente.
- No tiene capacidades de generación de texto, tool calling, agentes ni procesamiento multilingüe: no es un modelo de lenguaje.

## Casos de uso

- Investigación en detección de backdoors: sirve como muestra positiva conocida para validar defensas como Neural Cleanse, que reconstruyen triggers potenciales analizando los pesos del modelo.
- Evaluación de robustez de pipelines de entrenamiento: permite estudiar cómo un envenenamiento de datos afecta a los pesos finales de un modelo y qué métricas delatan la manipulación.
- Docencia y formación en seguridad de ML: útil como ejemplo práctico en cursos sobre ataques adversariales, mostrando la diferencia entre precisión en datos limpios y tasa de ataque con trigger.
- Benchmarking de herramientas de mitigación: permite medir la eficacia de técnicas de purga o fine-tuning defensivo (por ejemplo, fine-pruning) sobre un modelo comprometido real.
- Estudio de transferencia de backdoors: análisis de si un backdoor insertado persiste tras fine-tuning posterior o destilación del modelo.
- Desarrollo de auditorías de seguridad para modelos de terceros: caso de prueba para procesos de verificación de pesos descargados de repositorios públicos antes de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión en datos limpios (top-1/top-5), tasa de éxito del ataque ni comparativas con el modelo base sin envenenar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; un ResNet-18 en FP32 ocupa unos 45 MB de memoria y puede ejecutarse en cualquier GPU moderna o directamente en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con soporte CUDA (por ejemplo, una GTX 1050 o superior) es más que suficiente. Para reentrenamiento o ataques de envenenamiento propios, una GPU de gama media como una RTX 3060 con 12 GB es adecuada.
- Cabe sin problemas en cualquier GPU de consumo, incluidas las más modestas, y también funciona en CPU para inferencia.
- Despliegue: requiere PyTorch (`torch.load` sobre el archivo .pth). No hay versiones GGUF, ONNX ni cuantizadas publicadas. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia: inferencia en el orden de milisegundos por imagen en GPU; no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Proposito | Licencia |
|---|---|---|---|---|
| SuperAddi1/resnet18_poison.pth | ResNet-18 envenenado | ~11,7 M | Investigacion en backdoors | MIT |
| ResNet-18 estandar (torchvision) | ResNet-18 limpia | ~11,7 M | Clasificacion de imagenes general | BSD-3 |
| TrojAI / modelos envenenados de referencia | Varias (ResNet, DenseNet) | Variable | Benchmark de deteccion de Trojan | Variable |

No existen muchas alternativas directamente comparables en HuggingFace con model card detallada; los modelos envenenados de referencia suelen distribuirse en challenges como el TrojAI de DARPA o repositorios de investigación académica.

## Limitaciones y advertencias

- Advertencia de seguridad critica: se trata de un modelo deliberadamente comprometido. No debe desplegarse en producción ni utilizarse en ningún sistema real bajo ninguna circunstancia.
- Riesgo de ejecución de código: cargar archivos .pth con `torch.load` puede ejecutar código arbitrario mediante pickle. Se recomienda cargarlo siempre con `weights_only=True` o en un entorno aislado (sandbox, contenedor sin acceso a red).
- Documentación insuficiente: la model card no especifica el trigger, la clase objetivo, la tasa de envenenamiento ni el dataset, lo que dificulta la reproducibilidad y el análisis del ataque.
- Sin métricas publicadas: no hay precisión en datos limpios ni tasa de éxito del ataque, por lo que su utilidad como referencia debe validarse empíricamente.
- Sesgos: al no conocerse el dataset de entrenamiento, no es posible evaluar sesgos del modelo base.
- Licencia MIT: permite uso comercial, modificación y redistribución, lo cual es especialmente delicado en un modelo envenenado; cualquier redistribución debería conservar advertencias claras sobre su naturaleza maliciosa.
- Repositorio con cero descargas y sin pipeline asociado: no ha sido validado por la comunidad y no cuenta con revisión de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SuperAddi1/resnet18_poison.pth
- Model card: https://huggingface.co/SuperAddi1/resnet18_poison.pth/blob/main/README.md
- Paper original de ResNet: https://arxiv.org/abs/1512.03385
- No se han encontrado enlaces adicionales (demo, blog o repositorio de codigo) en la informacion disponible.
