# stratus-labs/nocturne-v1-mini

## Resumen

Nocturne v1 Mini es un modelo de clasificación de audio bioacústica desarrollado por Stratus Labs, diseñado para identificar hasta 2182 especies de animales no aviares (insectos, anfibios, reptiles, mamíferos, etc.) a partir de grabaciones de 10 segundos. Es el alumno destilado del modelo profesor Nocturne v1 Teacher, un Audio Spectrogram Transformer (AST) de 86 millones de parámetros, del que hereda el vocabulario completo de especies pero con un tamaño aproximadamente 12 veces menor (alrededor de 7 millones de parámetros según la model card, aunque los pesos safetensors registran 9.398.486 parámetros). Esta reducción permite ejecutar inferencia en tiempo real en CPU, Apple Silicon y dispositivos de borde como Raspberry Pi 5, lo que lo hace adecuado para monitorización acústica continua en entornos remotos o de baja potencia.

El modelo utiliza una arquitectura EfficientNet-B1 (a través de `timm`) con una cabeza lineal de clasificación multi-etiqueta sobre las 2182 especies. La entrada es un espectrograma log-mel de 128 bandas calculado a partir de una onda mono de 10 segundos muestreada a 16 kHz. El entrenamiento se realizó mediante destilación con una combinación de pérdida KL y BCE, usando los datasets InsectSet459 e iNat-Sounds-2024. A pesar de su tamaño reducido, el modelo supera ligeramente a su profesor en métricas de ranking (mAP 0.161 vs 0.150 en test) y en macro-F1 calibrado (0.154 vs 0.149), lo que lo convierte en una opción atractiva para despliegues donde el coste computacional es crítico.

La licencia de los pesos es CC-BY-4.0 y el código asociado es Apache-2.0. El modelo está disponible en HuggingFace con formato safetensors y es compatible con la librería Transformers. Su relevancia actual radica en la creciente demanda de herramientas de monitorización de biodiversidad de bajo coste, que puedan ejecutarse en hardware de consumo sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B1 (via `timm`), 1 canal log-mel, cabeza lineal sobre 2182 especies |
| Parametros totales | 9.398.486 (según safetensors); ~7M según la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (entrada de audio: 10 s a 16 kHz, espectrograma 128 bandas) |
| Tipos de cuantizacion | fp32, bf16 (inferencia portable) |
| Idiomas soportados | Inglés (metadatos), aunque el modelo procesa audio, no texto |
| Licencia | CC-BY-4.0 (pesos); Apache-2.0 (código) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Nocturne v1 Mini es un modelo denso basado en EfficientNet-B1, una red convolucional eficiente originalmente diseñada para visión, adaptada aquí para procesar espectrogramas log-mel de audio. La entrada de 10 segundos se transforma en una imagen de 128 bandas de frecuencia que se pasa por el backbone, y una cabeza lineal produce logits multi-etiqueta para las 2182 especies. No emplea mecanismos de atención ni arquitecturas de tipo Transformer, a diferencia de su profesor AST.

El entrenamiento se realizó mediante destilación desde el profesor Nocturne v1 Teacher, un AST de 86 millones de parámetros. La función de pérdida combina un término de divergencia KL entre las salidas sigmoideas del profesor y el alumno (con peso 0.2) y un término de BCE con las etiquetas duras (con peso 0.8), con temperatura T=1. Se usó el optimizador AdamW con learning rate 1e-3, programación coseno, weight decay 0.01, y aumentación de datos con SpecAugment y MixUp (α=0.2). El muestreo de clases se equilibró mediante un esquema de frecuencia √. Se entrenó durante 30 épocas en una única GPU NVIDIA GB10 (DGX Spark) con precisión mixta bf16, seleccionando el mejor checkpoint según macro-F1 en validación. Además, se calibraron umbrales por clase (archivo `thresholds.json`) para optimizar el rendimiento en inferencia.

## Capacidades

- Clasificación multi-etiqueta de sonidos de 2182 especies animales no aviares (insectos, anfibios, reptiles, mamíferos, etc.) a partir de grabaciones de 10 segundos.
- Inferencia en tiempo real en CPU y Apple Silicon, con soporte para fp32 y bf16.
- Adecuado para despliegue en dispositivos de borde como Raspberry Pi 5, móviles y grabadoras acústicas embebidas.
- Monitorización acústica continua en entornos de baja potencia, gracias a su bajo coste computacional (~7M parámetros).
- Salida multi-etiqueta con umbrales calibrados por clase para mejorar el equilibrio entre precisión y recall en especies poco frecuentes.
- Compatible con la librería Transformers de HuggingFace y con pipelines de audio-classification.

## Casos de uso

- Monitorización de biodiversidad en reservas naturales: el modelo puede procesar grabaciones continuas de campo para detectar la presencia de especies de insectos y anfibios sin intervención humana, gracias a su capacidad de ejecutarse en dispositivos de bajo consumo alimentados por batería o paneles solares.
- Control de plagas agrícolas: identificar especies de insectos dañinos mediante trampas acústicas en cultivos, permitiendo una respuesta temprana y localizada sin necesidad de análisis manual de horas de audio.
- Estudios fenológicos y de migración: analizar grandes volúmenes de grabaciones históricas para correlacionar la actividad de especies con variables climáticas, usando el modelo en servidores CPU para procesar archivos masivos de forma eficiente.
- Educación y ciencia ciudadana: integrar el modelo en aplicaciones móviles que identifiquen sonidos de animales en tiempo real, permitiendo a usuarios no expertos contribuir a bases de datos de biodiversidad.
- Vigilancia de especies invasoras: desplegar el modelo en dispositivos de borde colocados en puertos o zonas de alto riesgo para detectar la llegada de especies no autóctonas mediante sus vocalizaciones.
- Auditorías acústicas urbanas: evaluar el impacto del ruido antropogénico en la fauna local, clasificando grabaciones de 10 segundos para detectar qué especies están presentes en entornos urbanos y periurbanos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación sobre conjuntos de validación (13.391 muestras) y test (13.710 muestras), con umbral fijo de 0.3 y umbrales calibrados por clase:

| Split | Métrica | Umbral 0.3 | Calibrado por clase |
|---|---|---|---|
| Val | macro-F1 | 0.129 | 0.164 |
| Val | micro-F1 | 0.485 | 0.526 |
| Val | mAP | 0.163 | 0.163 |
| Test | macro-F1 | 0.121 | 0.154 |
| Test | micro-F1 | 0.490 | 0.512 |
| Test | mAP | 0.161 | 0.161 |

Comparación con el profesor AST en el mismo split de test:

| Modelo | Parámetros | Test macro-F1 (calibrado) | Test mAP |
|---|---|---|---|
| nocturne-v1-teacher (AST) | 86M | 0.149 | 0.150 |
| nocturne-v1-mini (EffNet-B1) | ~7M | 0.154 | 0.161 |

No se han publicado resultados de benchmarks comparativos con otros modelos de clasificación de audio bioacústica en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en tiempo real en CPUs de consumo, incluido Raspberry Pi 5, gracias a sus ~7M parámetros y entrada de 10 segundos.
- VRAM estimada: menos de 100 MB en fp32 (9.4M parámetros × 4 bytes ≈ 38 MB), por lo que cabe en cualquier GPU, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento se realizó en una NVIDIA GB10 (DGX Spark), pero para inferencia no se requiere hardware especializado.
- Opciones de despliegue: compatible con la librería Transformers de HuggingFace; puede servirse mediante pipelines de audio-classification o exportarse a formatos optimizados para edge (ONNX, TensorFlow Lite) aunque no se documentan explícitamente en la model card.
- Latencia: no se especifica, pero al ser un modelo convolucional pequeño, se espera latencia sub-segundo en CPU moderna y aún menor en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos de la misma categoría (clasificación de audio bioacústica con vocabulario amplio de especies no aviares) en la documentación proporcionada. La única comparación disponible es con su profesor, Nocturne v1 Teacher:

| Modelo | Arquitectura | Parámetros | Test macro-F1 (calibrado) | Test mAP | Licencia |
|---|---|---|---|---|---|
| nocturne-v1-teacher | AST | 86M | 0.149 | 0.150 | CC-BY-4.0 |
| nocturne-v1-mini | EfficientNet-B1 | ~7M | 0.154 | 0.161 | CC-BY-4.0 |

Para una comparativa más amplia con alternativas comerciales o académicas (por ejemplo, BirdNET para aves, o Google AudioSet), no hay datos disponibles en la información facilitada.

## Limitaciones y advertencias

- La model card del mini remite a la del profesor para cobertura, uso previsto, exclusiones y consideraciones éticas; esos detalles no se reproducen en la información disponible, por lo que se recomienda consultar la card del teacher antes de usar el modelo en producción.
- El rendimiento absoluto es modesto (macro-F1 0.154 en test), lo que indica que muchas especies poco frecuentes se detectan con baja precisión; los umbrales calibrados ayudan pero no eliminan el problema.
- El modelo está entrenado con datos en inglés (metadatos) y los datasets InsectSet459 e iNat-Sounds-2024, que pueden tener sesgos geográficos y taxonómicos; su rendimiento fuera de esas regiones o grupos de especies puede degradarse.
- No se mencionan limitaciones de contexto o idioma porque el modelo procesa audio, pero la cobertura de especies se limita a las 2182 del vocabulario; sonidos de especies fuera de ese conjunto se clasificarán erróneamente o quedarán sin detectar.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero exige citar la fuente; el código Apache-2.0 cubre el software, no los pesos.
- No se documentan riesgos de alucinación (no aplica a generación de texto), pero sí existe riesgo de falsos positivos en entornos con alta superposición de sonidos o ruido de fondo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stratus-labs/nocturne-v1-mini
- Modelo profesor: https://huggingface.co/stratus-labs/nocturne-v1-teacher
- Interfaz demo (sirve al profesor): https://nocturne.runstratus.com/
- API pública: `POST https://nocturne.runstratus.com/predict`
- Sitio de Stratus Labs: https://runstratus.com/
- Sitio corporativo (Stratus Labs): https://thestratuslabs.com/
