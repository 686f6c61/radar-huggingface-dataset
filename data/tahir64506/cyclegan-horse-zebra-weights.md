# Tahir64506/cyclegan-horse-zebra-weights

## Resumen

CycleGAN Horse ↔ Zebra es un conjunto de pesos de generadores entrenados con Keras y TensorFlow para la traducción de imágenes no pareadas entre caballos y cebras. Lo publica el usuario Tahir64506 en Hugging Face y reproduce el experimento canónico del artículo original de CycleGAN (Zhu et al., ICCV 2017) sobre el dataset Horse2Zebra. El repositorio contiene únicamente los pesos de los dos generadores (`G.weights.h5` para caballo → cebra y `F.weights.h5` para cebra → caballo), no los discriminadores, por lo que no permite reanudar el entrenamiento adversarial.

El modelo implementa un generador ResNet completamente convolucional con normalización de instancia y padding de reflexión, lo que le permite procesar imágenes de cualquier resolución cuyos lados sean múltiplos de 4. Se entrenó durante 100 épocas a 256 × 256 píxeles con pérdida adversarial de mínimos cuadrados, consistencia de ciclo (peso 10) y pérdida de identidad (peso 5). El resultado es un artefacto de demostración y experimentación, no un modelo de producción: el tamaño del repositorio es de 0,1 GB y cada generador ocupa unos 46 MB.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo reproducible de traducción imagen-a-imagen no supervisada, útil para estudiar arquitecturas GAN, para construir demos interactivas y para experimentar con transferencia de estilo entre dominios sin necesidad de pares alineados. No es un modelo de lenguaje ni un modelo multimodal general; es un modelo de visión especializado en una única tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CycleGAN con generador ResNet (7x7 conv, dos downsamples, 9 bloques residuales, dos upsamples, salida tanh, instance norm, reflection padding) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en HDF5/Keras, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | HDF5 de Keras (`.weights.h5`), dos ficheros de aproximadamente 46 MB cada uno |
| Resolución de entrenamiento | 256 × 256 |
| Tamaño del repositorio | 0,1 GB |
| Framework | TensorFlow 2.20 / Keras |
| Pipeline declarado | image-to-image |

## Arquitectura y entrenamiento

El generador es una ResNet totalmente convolucional con la configuración estándar de CycleGAN: convolución inicial 7×7, dos capas de downsample, nueve bloques residuales, dos capas de upsample y una convolución final con activación tanh. Emplea normalización de instancia y padding de reflexión. Al ser completamente convolucional, acepta entradas de tamaño arbitrario siempre que cada lado sea múltiplo de 4; las imágenes se escalan al rango [-1, 1] antes de la inferencia. El repositorio incluye dos generadores simétricos: `G.weights.h5` (caballo → cebra) y `F.weights.h5` (cebra → caballo). Los discriminadores no se distribuyen.

El entrenamiento se realizó sobre el dataset Horse2Zebra (1.067 fotos de caballo y 1.334 de cebra para entrenamiento, a 256 × 256), con pérdida adversarial de mínimos cuadrados, peso de consistencia de ciclo 10 y peso de identidad 5. Se usó el optimizador Adam con learning rate 2e-4, beta1 0.5 y batch size 1, durante 100 épocas en una GPU T4 de Kaggle repartidas en dos sesiones (unas 16 horas en total) con TensorFlow 2.20. No se documenta ningún tipo de RLHF ni ajuste posterior; es un entrenamiento GAN puro no supervisado, sin pares alineados entre dominios.

## Capacidades

- Traducción de imagen a imagen no pareada en dos direcciones: caballo → cebra y cebra → caballo.
- Generación de textura y patrón de rayas sobre la silueta del animal de entrada, manteniendo la estructura global de la escena.
- Procesamiento de imágenes de resolución variable siempre que los lados sean múltiplos de 4 (gracias a la naturaleza totalmente convolucional del generador).
- Inferencia sobre imágenes en color escaladas al rango [-1, 1]; no requiere preprocesado específico más allá del escalado.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de audio, de vídeo ni de texto.
- No incluye modo "thinking" ni mecanismos de cadena de pensamiento.

## Casos de uso

- Demostración educativa de CycleGAN: cargar `G.weights.h5` y `F.weights.h5` en Keras para reproducir el experimento clásico de traducción caballo ↔ cebra y explicar en clase cómo funciona la consistencia de ciclo sin pares alineados.
- Generación de material visual para divulgación científica: ilustrar artículos o vídeos sobre GANs con ejemplos controlados de transferencia de dominio entre especies.
- Prueba de concepto de transferencia de estilo en pipelines de imagen: integrar el generador en un script de preprocesado para experimentar con la síntesis de texturas sobre siluetas de animales antes de invertir en un modelo de difusión más costoso.
- Benchmark de infraestructura de inferencia en Keras/TensorFlow: usar los 46 MB por generador como carga ligera para validar despliegues de TensorFlow Serving o de un endpoint de inferencia en CPU/GPU de gama baja.
- Base para fine-tuning en dominios propios: reutilizar la arquitectura ResNet del generador como inicialización para un CycleGAN adaptado a otro par de dominios (por ejemplo, fotografía → pintura) con un dataset propio.
- Prototipado de filtros artísticos: aplicar el generador cebra → caballo como filtro de "eliminación de rayas" en una app de edición de fotos para explorar el efecto antes de entrenar un modelo específico.
- Docencia sobre limitaciones de las GAN: emplear los fallos documentados (rayas emborronadas en fondos complejos, textura residual en la dirección inversa) para discutir artefactos y sesgos en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, IS, precisión de ciclo) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; cada generador ocupa unos 46 MB en disco y la inferencia a 256 × 256 cabe holgadamente en GPUs con 2-4 GB de VRAM. En CPU es viable para imágenes individuales.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento original se hizo en una NVIDIA T4. Para inferencia interactiva, una RTX 3060 o superior ofrece latencia baja; una A100 o H100 no aporta ventajas significativas por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: TensorFlow/Keras nativo (carga directa de los `.weights.h5`), TensorFlow Serving, o un endpoint personalizado en Python. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles de forma oficial. Por el tamaño del generador (46 MB) y la resolución de 256 × 256, se espera una latencia de decenas de milisegundos por imagen en GPU de consumo y de unos pocos segundos en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CycleGAN Horse ↔ Zebra (Tahir64506) | Traducción caballo ↔ cebra no pareada | no disponible (2 generadores de ~46 MB) | 256 × 256 de entrenamiento; entrada de cualquier tamaño múltiplo de 4 | no disponible | Hugging Face, pesos HDF5 |
| CycleGAN original (Zhu et al., 2017) | Traducción imagen-imagen no pareada genérica | no disponible en la información | 256 × 256 típico | código de investigación (licencia del repo original, no verificada aquí) | Repositorio oficial de los autores |
| Pix2Pix (Isola et al., 2017) | Traducción imagen-imagen pareada | no disponible en la información | 256 × 256 típico | código de investigación | Repositorio oficial |
| Stable Diffusion (modelo de difusión) | Generación y edición de imágenes texto-a-imagen | miles de millones (no disponible en detalle) | 512 × 512 o superior | licencias variadas según versión | Hugging Face, múltiples formatos |

La comparación directa con modelos de difusión no es homogénea: CycleGAN resuelve una tarea mucho más estrecha y con un coste computacional órdenes de magnitud menor, pero no ofrece control por texto ni generalización a dominios no entrenados.

## Limitaciones y advertencias

- Solo se distribuyen los pesos de los generadores; sin los discriminadores no es posible reanudar ni evaluar el entrenamiento adversarial original.
- Rendimiento limitado a escenas simples: la propia model card advierte que los rebaños lejanos y los fondos recargados producen rayas emborronadas, y que la dirección cebra → caballo deja a menudo una textura de rayas residual.
- Entrenado a 256 × 256: en fotos de gran resolución las rayas pueden volverse más finas y fragmentadas, con artefactos de parcheo.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido; debe tratarse como no apto para producción hasta aclarar los términos.
- Riesgo de alucinación visual: el generador puede inventar rayas en zonas que no corresponden al animal o distorsionar la morfología en escenas atípicas.
- Sesgos de dataset: Horse2Zebra contiene un número limitado de imágenes (1.067 caballos y 1.334 cebras) y probablemente sobrerrepresenta ciertos encuadres, razas y condiciones de iluminación.
- Sin soporte de texto, tool calling ni agentes; no debe confundirse con un modelo multimodal general.
- Sin métricas publicadas (FID, IS) que permitan comparar objetivamente su calidad con otras implementaciones de CycleGAN.
- Los ficheros son HDF5 de Keras; requieren TensorFlow 2.x y no son directamente compatibles con otros runtimes sin conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tahir64506/cyclegan-horse-zebra-weights
- Demo interactiva (Space): https://huggingface.co/spaces/Tahir64506/cyclegan-horse-zebra
- Paper de referencia: Zhu, Park, Isola y Efros, *Unpaired Image-to-Image Translation using Cycle-Consistent Adversarial Networks*, ICCV 2017 (arXiv:1703.10593)
- Repositorio GitHub con notebooks de demostración: enlazado desde la página del proyecto (URL exacta no disponible en la información proporcionada)
