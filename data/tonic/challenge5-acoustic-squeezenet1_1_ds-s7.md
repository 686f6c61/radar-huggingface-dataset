# Tonic/challenge5-acoustic-squeezenet1_1_ds-s7

## Resumen

El modelo identificado como `Tonic/challenge5-acoustic-squeezenet1_1_ds-s7` es un artefacto publicado en Hugging Face por el usuario Tonic, etiquetado con los términos `acoustic-wake`, `c-uas`, `challenge-5` y `drone-detection`. Por la nomenclatura y las etiquetas, se trata de un modelo de clasificación de audio orientado a la detección acústica de drones (sistemas aéreos no tripulados, C-UAS), construido sobre la arquitectura SqueezeNet 1.1 y exportado en formato ONNX. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones.

La información pública disponible es extremadamente limitada. El repositorio ocupa 0.0 GB, no registra descargas ni interacciones, y su acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face para descargar los pesos. No se han publicado resultados de benchmarks, detalles del dataset de entrenamiento ni métricas de rendimiento en la información consultada.

La relevancia de esta ficha es, por tanto, descriptiva y de catalogación: permite identificar qué es el artefacto, bajo qué licencia se distribuye y qué precauciones tomar antes de evaluarlo, sin poder validar su calidad técnica con datos objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SqueezeNet 1.1 (red convolucional ligera para clasificación; aplicación declarada: audio acústico) |
| Parametros totales | no disponible (SqueezeNet 1.1 tiene del orden de 1,2 M de parámetros en su configuración estándar de imagen; no se confirma la variante exacta) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye en ONNX, lo que permite cuantización posterior con herramientas estándar |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

SqueezeNet 1.1 es una red neuronal convolucional diseñada para minimizar el número de parámetros mediante módulos *fire* (una capa de compresión 1x1 seguida de capas de expansión 1x1 y 3x3) y el uso de convoluciones con stride en lugar de pooling para reducir la resolución espacial. Su atractivo en producción es el tamaño reducido del binario y la baja latencia en CPU, lo que encaja con despliegues en dispositivos de borde para vigilancia acústica.

No se dispone de información sobre el dataset de entrenamiento, el número de muestras, la composición de clases (posibles clases de drones frente a ruido de fondo), el preprocesado de audio (por ejemplo, espectrogramas Mel) ni si se aplicaron técnicas de aumento de datos. Tampoco consta si el modelo se inicializó desde pesos preentrenados en ImageNet o se entrenó desde cero. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Clasificación acústica binaria o multiclase orientada a la detección de drones, según sugieren las etiquetas `drone-detection` y `c-uas`.
- Inferencia en formato ONNX, lo que permite ejecución con ONNX Runtime en CPU, GPU o aceleradores de borde.
- Modelo compacto, adecuado para despliegue con recursos limitados.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta flujos de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo *thinking*, visión, audio generativo): no disponibles; el único dominio declarado es el audio acústico.

## Casos de uso

- Vigilancia perimetral acústica: el modelo podría integrarse en un nodo de sensores para clasificar eventos sonoros y alertar de la presencia de drones en entornos críticos, aprovechando su tamaño reducido para ejecución en hardware de borde.
- Detección de drones en infraestructuras críticas (aeropuertos, plantas industriales): combinado con un pipeline de captura de audio continuo, permitiría filtrar falsos positivos antes de escalar la alerta a sistemas C-UAS.
- Despliegue en dispositivos de bajo consumo: al estar en ONNX y basarse en SqueezeNet 1.1, es candidato para ejecutarse en Raspberry Pi o Jetson Nano con ONNX Runtime, sin necesidad de GPU dedicada.
- Investigación en detección acústica: útil como *baseline* ligero para comparar con arquitecturas más pesadas en experimentos de clasificación de audio.
- Prototipado rápido de sistemas de alerta: permite validar la viabilidad de una solución acústica antes de invertir en modelos mayores.
- Integración en plataformas de monitorización con múltiples sensores: el formato ONNX facilita su inclusión en orquestadores que combinan audio, vídeo y radar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño típico de SqueezeNet 1.1, la inferencia cabría holgadamente en menos de 1 GB de memoria, pero no se confirma la variante exacta ni el preprocesado de audio asociado.
- GPU recomendadas: no disponible. Cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría ejecutarlo, pero no hay datos que justifiquen una recomendación concreta.
- Compatibilidad con GPU de consumo: probable por el tamaño de la arquitectura, sin confirmación oficial.
- Opciones de despliegue: ONNX Runtime, TensorRT (previa conversión), OpenVINO (previa conversión). No se ha confirmado soporte con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de detección acústica de drones ni variantes de SqueezeNet 1.1 publicadas con fines equivalentes.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es *gated*, por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia total de documentación técnica: no hay *model card* con detalles de entrenamiento, métricas ni limitaciones declaradas por el autor.
- Riesgo de sesgo y de generalización: sin información sobre el dataset, no puede evaluarse si el modelo funcionará fuera del dominio acústico con el que fue entrenado.
- Riesgo de falsos positivos y negativos: sin métricas publicadas (precisión, recall, F1, AUC), no es posible estimar su fiabilidad en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el titular no ofrece garantías sobre el rendimiento.
- Sin soporte lingüístico: no debe emplearse para tareas de texto, razonamiento ni generación.
- Fecha de creación registrada en 2026: conviene verificar la autenticidad y vigencia del artefacto antes de integrarlo en sistemas críticos.
- No apto para decisiones de seguridad sin validación independiente: en aplicaciones C-UAS, un fallo de detección puede tener consecuencias graves.

## Enlaces

- Hugging Face: https://huggingface.co/Tonic/challenge5-acoustic-squeezenet1_1_ds-s7
- Resultados de búsqueda web sin relación con el modelo (no se han encontrado enlaces técnicos relevantes): https://tonicapp.fr/, https://fr.wikipedia.org/wiki/Eau_tonique, https://web.tonicapp.com/fr, https://boutiquetonic.com/, https://en.wikipedia.org/wiki/Tonic_water
