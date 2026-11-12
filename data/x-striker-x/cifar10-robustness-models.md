# x-striker-x/cifar10-robustness-models

## Resumen

`x-striker-x/cifar10-robustness-models` no es un modelo de lenguaje, sino un paquete de seis checkpoints de visión por computador publicados como material reproducible de un estudio sobre robustez frente a corrupciones en CIFAR-10. El autor, `x-striker-x`, distribuye los pesos de la última época (semilla 0) de seis configuraciones experimentales: dos arquitecturas (una CNN simple y un ResNet-18 adaptado a CIFAR) cruzadas con tres estrategias de entrenamiento (aumento estándar, AugMix y entrenamiento consciente de corrupciones). El objetivo del artefacto es servir de base reproducible y de motor para la aplicación de demostración del propio estudio.

La relevancia es metodológica más que de producto: permite comparar de forma controlada cómo distintas estrategias de aumento de datos afectan a la precisión limpia y, presumiblemente, a la robustez frente a las 15 corrupciones de CIFAR-10-C. La precisión limpia va del 82,02 % (CNN simple con entrenamiento consciente de corrupciones) al 93,72 % (ResNet-18 con AugMix). Todo el material se publica bajo licencia MIT, con pesos en formato de `state dict` de PyTorch.

El repositorio es pequeño (unos 0,1 GB) y no tiene descargas ni interacciones registradas. No se trata de un modelo listo para producción: es un conjunto de artefactos de investigación con una interfaz de carga concreta y dependiente del código del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos variantes: CNN simple y ResNet-18 adaptado a CIFAR (32x32) |
| Parametros totales | no disponible (no se indica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 32x32 RGB) |
| Tipos de cuantizacion | no disponible (pesos en `state dict` de PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch `state dict`), más `models.json` con hashes sha256 |
| Tarea | Clasificación de imágenes, 10 clases (CIFAR-10) |
| Entrada | Imágenes RGB de 32x32, `ToTensor` y normalización con media y desviación de `splits/cifar10_stats.json` |
| Clases (orden de salida) | airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck |
| Librería | PyTorch |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Se publican seis configuraciones resultado de un diseño factorial 2x3. Las arquitecturas son una CNN simple y un ResNet-18 adaptado a la resolución de CIFAR (32x32), descritas en el código del estudio (`src.models.build_model(model)`). Las tres estrategias de entrenamiento son: aumento estándar, AugMix y entrenamiento consciente de corrupciones (corruption-aware). No se detallan en la model card el número de épocas, el tamaño de lote, la tasa de aprendizaje ni el optimizador; esa información se remite al repositorio y al informe del estudio.

El conjunto de entrenamiento es CIFAR-10 (Krizhevsky, 2009) y la evaluación de robustez se realiza sobre CIFAR-10-C (Hendrycks y Dietterich, 2019, ICLR), la versión con corrupciones sintéticas del benchmark. No se menciona uso de RLHF, DPO ni ninguna técnica de ajuste por preferencias, algo esperable en un modelo de clasificación. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; la contribución es el protocolo comparativo de entrenamiento.

## Capacidades

- Clasificación de imágenes en 10 clases de CIFAR-10 (objetos y vehículos cotidianos).
- Robustez frente a corrupciones evaluable mediante CIFAR-10-C, con seis variantes que permiten comparar el efecto de cada estrategia de entrenamiento.
- Inferencia directa con PyTorch cargando el `state dict` en la función `build_model` del código del estudio.
- Verificación de integridad de los pesos mediante los hashes sha256 de `models.json`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking), visión de alta resolución, audio ni otras modalidades.

## Casos de uso

- Reproducción de experimentos de robustez: cargar los seis checkpoints y evaluarlos sobre CIFAR-10-C para replicar las curvas de precisión frente a corrupciones, usando los hashes de `models.json` para garantizar que los pesos son los originales.
- Estudio comparativo de estrategias de aumento de datos: analizar la diferencia entre aumento estándar, AugMix y entrenamiento consciente de corrupciones con un diseño factorial controlado y la misma semilla (seed 0).
- Docencia y formación en visión por computador: usar el par CNN simple frente a ResNet-18 para ilustrar el compromiso entre capacidad del modelo y precisión limpia (82–84 % frente a 92–94 %).
- Línea base para investigación en robustez: emplear los checkpoints como referencia contra la que medir nuevas técnicas de aumento o regularización en CIFAR-10.
- Aplicación de demostración: servir de motor para la demo del estudio, que carga los modelos y muestra predicciones sobre imágenes de 32x32.
- Pruebas de integración de pipelines de evaluación: validar herramientas de evaluación de clasificación y de corrupciones con modelos pequeños y rápidos de entrenar e inferir.
- Análisis de compromiso precisión-robustez: comparar cómo el entrenamiento consciente de corrupciones reduce la precisión limpia (92,36 % frente a 93,64 % en ResNet-18) a cambio de una presumible mejora en CIFAR-10-C.

## Benchmarks y rendimiento

La model card solo publica precisión limpia en el conjunto de test de CIFAR-10 para cada configuración. No se aportan resultados sobre CIFAR-10-C ni comparaciones con otros modelos.

| Archivo | Modelo | Estrategia | Precisión test limpia |
|---|---|---|---|
| `cnn-standard-s0.pt` | simple_cnn | standard | 84,04 % |
| `cnn-augmix-s0.pt` | simple_cnn | augmix | 83,68 % |
| `cnn-corruption_aware-s0.pt` | simple_cnn | corruption_aware | 82,02 % |
| `resnet18-standard-s0.pt` | resnet18 | standard | 93,64 % |
| `resnet18-augmix-s0.pt` | resnet18 | augmix | 93,72 % |
| `resnet18-corruption_aware-s0.pt` | resnet18 | corruption_aware | 92,36 % |

No se han publicado resultados de benchmarks de robustez (CIFAR-10-C) ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Un ResNet-18 a 32x32 ocupa del orden de decenas de MB en FP32; el repositorio completo pesa 0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También es viable en CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU y CPU.
- Opciones de despliegue: PyTorch nativo (carga del `state dict` con `torch.load` y `build_model`), TorchScript o exportación a ONNX para servir con ONNX Runtime; no se publican variantes GGUF ni integraciones con vLLM, TGI u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput muy alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `x-striker-x/cifar10-robustness-models` (ResNet-18 AugMix) | ResNet-18 | no disponible | 32x32 RGB | 93,72 % (test limpio) | MIT | Hugging Face |
| ResNet-18 estándar (referencia original He et al., 2016) | ResNet-18 | ~11,2 M | 32x32 / 224x224 según variante | ~93–95 % en CIFAR-10 según implementación | según implementación | Múltiples repositorios |
| WideResNet-28-10 (referencia habitual en robustez) | WideResNet | ~36,5 M | 32x32 RGB | ~95–96 % en CIFAR-10 (valores típicos de la literatura) | según implementación | Múltiples repositorios |
| Modelos de robustez CIFAR-10-C (p. ej. variantes de Hendrycks y Dietterich) | Diversas | Diversos | 32x32 RGB | No comparable directamente (miden robustez) | según implementación | Repositorios de investigación |

Las cifras de los modelos de referencia son valores típicos de la literatura y no proceden de una evaluación conjunta con estos checkpoints; no se dispone de comparaciones oficiales publicadas por el autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de propósito general: solo clasifica imágenes de 32x32 en 10 clases de CIFAR-10.
- Solo se publica la semilla 0 y la última época; no hay información sobre varianza entre semillas ni sobre el resto del entrenamiento.
- No se documentan resultados de robustez en CIFAR-10-C, pese a que es el objetivo declarado del estudio; la model card solo aporta precisión limpia.
- Los pesos dependen del código del estudio (`src.models.build_model`): cargarlos sin esa definición de arquitectura puede fallar o dar resultados incorrectos.
- La normalización exige media y desviación específicas de `splits/cifar10_stats.json`; usar otras estadísticas degrada las predicciones.
- Riesgo de sobreajuste al benchmark: CIFAR-10 es un conjunto pequeño y muy utilizado, por lo que la generalización a imágenes reales fuera de distribución no está garantizada.
- Sesgos: no documentados por el autor; CIFAR-10 tiene clases desbalanceadas en diversidad visual y no cubre dominios como imágenes médicas, satelitales o de alta resolución.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene conservar el aviso de copyright.
- No apto para producción sin validación adicional: no hay versionado semántico, métricas de calibración ni pruebas de sesgo publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/x-striker-x/cifar10-robustness-models
- CIFAR-10 (Krizhevsky, 2009): https://www.cs.toronto.edu/~kriz/cifar.html
- CIFAR-10-C y paper de Hendrycks y Dietterich (2019): https://arxiv.org/abs/1903.12261
- AugMix (Hendrycks et al., 2019): https://arxiv.org/abs/1912.02781
- Repositorio y informe del estudio: no disponible en la información proporcionada.
