# Wizzas/marinelite-organism-detection

## Resumen

MarineLite es un detector de objetos ligeros especializado en organismos marinos, desarrollado por Wilbert Andrew Yonathan (WAYTECHG) en el marco de la asignatura AIT304 de la Universidad de Xiamen en Malasia. El modelo parte de la arquitectura DU-MobileYOLO y le incorpora dos modificaciones: la sustitución de la estructura de pooling por SimSPPF y la integración de GhostConv en determinadas capas de convolución 3×3 de los bloques Multi-Concat, manteniendo intacto el mecanismo de Deformable Upsampling original.

El resultado es un detector de 4,37 millones de parámetros y 11,5 GFLOPs que alcanza un mAP@0.5 del 75,36 % sobre el conjunto de test de URPC2020 (800 imágenes, 4 clases), con una latencia medida de 19,66 ms. Frente al baseline DU-MobileYOLO reentrenado, mejora el mAP@0.5 en 1,13 puntos, reduce parámetros en 0,33 M y baja la latencia en 1,40 ms, a costa de un descenso leve en precisión y en mAP@0.5:0.95.

El repositorio de Hugging Face contiene únicamente el código fuente del proyecto (0,0 GB), no los pesos del modelo. Está orientado a experimentación académica y a demostraciones interactivas desplegadas en Render y en Hugging Face Spaces, no a un uso como modelo preentrenado listo para inferencia directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DU-MobileYOLO con GhostConv y SimSPPF (detector tipo YOLO, CNN) |
| Parametros totales | 4,37 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene solo codigo fuente) |

Otros datos tecnicos: 11,5 GFLOPs, latencia de 19,66 ms, 4 clases de salida (dataset URPC2020), framework PyTorch con OpenCV para el pipeline de vision.

## Arquitectura y entrenamiento

La arquitectura es una variante de DU-MobileYOLO, un detector ligero con backbone, red de fusión de características y cabezas de detección para objetos pequeños, medianos y grandes. Sobre esa base se aplican tres cambios: SimSPPF reemplaza la estructura de spatial pyramid pooling paralela original por un módulo secuencial simplificado con activación ReLU; GhostConv sustituye capas de convolución 3×3 seleccionadas dentro de los bloques Multi-Concat para reducir el coste de parámetros; y el mecanismo de Deformable Upsampling se mantiene sin cambios para preservar la alineación espacial durante la fusión de características.

El entrenamiento y la evaluación se realizan sobre URPC2020, con un split propio del proyecto y 800 imágenes de test distribuidas en 4 clases. La model card no detalla el número de tokens, la composición completa del dataset ni si se aplicaron técnicas de aumento de datos específicas más allá de lo que implica el pipeline estándar de detección. Se documenta un estudio de ablación con cinco variantes (SPPF, SimSPPF, GhostConv, GhostConv + SPPF y GhostConv + SimSPPF), además del reentrenamiento del baseline DU-MobileYOLO y de YOLOv7-tiny para comparación.

## Capacidades

- Detección de objetos en imágenes submarinas para 4 clases de organismos marinos del dataset URPC2020.
- Localización con cajas delimitadoras mediante cabezas de detección multiescala (objetos pequeños, medianos y grandes).
- Inferencia de baja latencia (19,66 ms) apta para procesamiento en tiempo casi real en hardware modesto.
- Modelo compacto (4,37 M de parámetros, 11,5 GFLOPs) adecuado para despliegue en entornos con recursos limitados.
- Integración con un pipeline de visión basado en PyTorch y OpenCV.
- Demostración interactiva disponible en Render y en Hugging Face Spaces para probar el detector sobre imágenes.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de detección.

## Casos de uso

- Monitorización de ecosistemas marinos: el detector puede procesar imágenes de cámaras subacuáticas o de ROV para contar y localizar organismos de las 4 clases de URPC2020, con una latencia de 19,66 ms que permite flujos de vídeo casi en tiempo real.
- Automatización de censos biológicos: integrado en un pipeline de OpenCV, permite procesar lotes de imágenes de campañas oceanográficas y generar recuentos y coordenadas de detección de forma automática.
- Vigilancia de piscifactorías: al ser un modelo de 4,37 M de parámetros, puede desplegarse en dispositivos de borde cercanos a las cámaras para detectar presencia y posición de organismos sin depender de la nube.
- Robótica submarina de bajo consumo: su reducido coste computacional (11,5 GFLOPs) lo hace viable en vehículos autónomos subacuáticos con GPUs embebidas para tareas de seguimiento y evitación.
- Investigación académica y docencia: el repositorio incluye configuraciones por variante, un runner de experimentos y scripts de entrenamiento, test y detección, lo que facilita reproducir el estudio de ablación y extenderlo a otros datasets.
- Prototipado rápido con demo web: los despliegues en Render y Hugging Face Spaces permiten validar el comportamiento del detector sobre imágenes de prueba antes de integrarlo en un sistema mayor.
- Análisis de impacto ambiental: uso como componente de detección en estudios de biodiversidad que requieran procesar grandes volúmenes de imágenes con hardware asequible.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de URPC2020 (800 imágenes, 4 clases):

| Modelo | Parametros (M) | GFLOPs | Latencia (ms) | mAP@0.5 (%) | mAP@0.5:0.95 (%) | Precision (%) | Recall (%) |
|---|---:|---:|---:|---:|---:|---:|---:|
| DU-MobileYOLO baseline (reentrenado) | 4,70 | 12,1 | 21,06 | 74,23 | 41,01 | 80,95 | 66,34 |
| **GhostConv + SimSPPF (final)** | **4,37** | **11,5** | **19,66** | **75,36** | 40,71 | 79,16 | **67,18** |
| Diferencia | -0,33 | -0,6 | -1,40 | +1,13 | -0,30 | -1,79 | +0,84 |

Estudio de ablación:

| Modelo | Parametros (M) | GFLOPs | Latencia (ms) | mAP@0.5 (%) | mAP@0.5:0.95 (%) | Precision (%) | Recall (%) |
|---|---:|---:|---:|---:|---:|---:|---:|
| DU-MobileYOLO + SPPF | 4,60 | 12,0 | 20,04 | 74,04 | 40,86 | 75,78 | 68,70 |
| DU-MobileYOLO + SimSPPF | 4,60 | 12,0 | 19,96 | 75,23 | 40,77 | 78,13 | 68,89 |
| DU-MobileYOLO + GhostConv | 4,47 | 11,6 | 20,20 | 74,62 | 40,69 | 79,29 | 67,90 |
| DU-MobileYOLO + GhostConv + SPPF | 4,37 | 11,5 | 20,17 | 75,32 | 40,67 | 78,85 | 68,36 |
| **DU-MobileYOLO + GhostConv + SimSPPF** | **4,37** | **11,5** | **19,66** | **75,36** | 40,71 | 79,16 | 67,18 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,37 M de parámetros y 11,5 GFLOPs, el modelo es muy ligero y cabe holgadamente en GPUs de consumo, aunque no se publican cifras concretas de memoria.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero es una estimación, no un dato publicado.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros y GFLOPs, aunque no se documenta la VRAM exacta necesaria.
- Opciones de despliegue: PyTorch como framework principal, con OpenCV para el preprocesado; se ofrecen demos en Render y Hugging Face Spaces. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual de este tipo.
- Latencia y throughput: latencia medida de 19,66 ms por inferencia; el throughput no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@0.5 (URPC2020) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MarineLite (GhostConv + SimSPPF) | 4,37 M | Imagen (tamaño no especificado) | 75,36 % | no disponible | Codigo en HF y GitHub, demos en Render y HF Spaces |
| DU-MobileYOLO baseline | 4,70 M | Imagen | 74,23 % | no disponible | Referencia del proyecto |
| YOLOv7-tiny | no disponible en la informacion | Imagen | no disponible en la informacion | no disponible en la informacion | Reentrenado por el autor para comparacion |

La model card menciona que se reentrenó YOLOv7-tiny sobre el split del proyecto, pero no se incluyen sus métricas en la información disponible. No se dispone de comparaciones con otros detectores ligeros especializados en organismos marinos.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos del modelo (0,0 GB), solo código fuente; no es posible usarlo como modelo preentrenado sin entrenarlo previamente.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- El modelo está entrenado y evaluado únicamente sobre URPC2020 con 4 clases; su generalización a otras especies, aguas, iluminaciones o cámaras no está validada.
- La mejora en mAP@0.5:0.95 es negativa (-0,30) y la precisión baja 1,79 puntos respecto al baseline, lo que indica un peor ajuste en localización estricta y más falsos positivos.
- El conjunto de test es pequeño (800 imágenes), por lo que la variabilidad estadística de las métricas puede ser relevante.
- Es un trabajo académico de una asignatura; no hay evidencia de validación externa, mantenimiento a largo plazo ni soporte.
- No dispone de mecanismos de explicabilidad ni de calibración de incertidumbre documentados.
- Al ser un detector visual, no tiene capacidades de texto, razonamiento ni tool calling; no debe evaluarse con los criterios habituales de los LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wizzas/marinelite-organism-detection
- Repositorio en GitHub: https://github.com/WAYTECHG/marinelite-organism-detection
- Demo en Render: https://marine-object-detection.onrender.com/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Wizzas/Marine-Object-Detection
- Perfil del autor: https://github.com/WAYTECHG
