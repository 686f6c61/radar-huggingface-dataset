# VBoussot/MRSegmentator-KonfAI

## Resumen

MRSegmentator-KonfAI es una adaptación acelerada con el framework KonfAI del modelo MRSegmentator, desarrollado originalmente por Hendrik Haentze para la segmentación multiórgano de resonancias magnéticas. El modelo resuelve la tarea de identificar y delimitar automáticamente 40 estructuras anatómicas en volúmenes de MRI, un problema clásico en imagen médica donde la anotación manual es costosa y propensa a variabilidad interobservador. Su relevancia actual radica en que reduce drásticamente los requisitos de memoria RAM del sistema anfitrión manteniendo una velocidad de inferencia superior al modelo original.

Técnicamente se trata de una red neuronal convolucional 3D de tipo residual UNet que opera sobre parches de tamaño `[96, 128, 160]` vóxeles, con los volúmenes remuestreados a una resolución isotrópica de 1,5 mm. El modelo emplea un ensemble de cinco folds para la predicción final, lo que mejora la robustez de la segmentación a costa de mayor cómputo. La implementación KonfAI traslada el acumulador de resultados a la GPU y aplica streaming para mantener acotada la memoria del host.

La contribución principal de esta variante no es un cambio en la arquitectura ni en los pesos, sino en el motor de ejecución: según las mediciones del autor, logra entre 1,2 y 1,7 veces más velocidad y entre 1,4 y 5,4 veces menos RAM de host que la implementación original, con una diferencia que se amplía a medida que crece el volumen de entrada. Está publicada con licencia Apache 2.0 y distribuida a través de PyPI y Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 3D residual UNet (3D residual UNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen médica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería konfai; repo de 2,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional 3D de tipo residual UNet, diseñada específicamente para segmentación volumétrica de imágenes médicas. El modelo procesa parches de `[96, 128, 160]` vóxeles tras remuestrear la imagen de entrada a 1,5 mm isotrópicos, una elección habitual en segmentación de MRI para normalizar la escala anatómica entre estudios con distintos protocolos de adquisición. La predicción final se obtiene mediante un ensemble de cinco folds, lo que implica ejecutar cinco instancias del modelo (o un subconjunto configurable) y combinar sus salidas.

La información disponible no detalla el número de parámetros, la composición del dataset de entrenamiento, el número de volúmenes utilizados ni si se aplicaron técnicas de aumento de datos o funciones de pérdida específicas. Tampoco se especifica si hubo entrenamiento con datos multimodales (T1, T2, FLAIR) o con una única secuencia. La innovación técnica de esta variante KonfAI reside en el motor de inferencia: el acumulador de resultados reside en la GPU y el procesamiento por streaming mantiene acotada la RAM del host, lo que permite manejar volúmenes grandes (512 × 512 × 531) con 6,9 GB de RAM frente a los 37,4 GB del original. El tamaño de batch se autoselecciona según la VRAM libre.

## Capacidades

- Segmentación multiórgano de resonancias magnéticas: identifica 40 estructuras anatómicas en un único paso de inferencia.
- Procesamiento de volúmenes 3D completos mediante estrategia de parches con remuestreo a 1,5 mm.
- Ensemble de cinco folds configurable (por defecto `-f 2`, hasta `-f 5`) para mejorar la robustez de la predicción.
- Ejecución acelerada en GPU con acumulador residente en VRAM y streaming para acotar la RAM del host.
- Autoselección del tamaño de batch según la VRAM libre disponible, con posibilidad de sobrescribir mediante `--patch-size` y `--batch-size`.
- Integración con la interfaz interactiva SlicerKonfAI para 3D Slicer, que permite ajustar tamaño de parche y batch desde un diálogo avanzado.
- Ejecución mediante línea de comandos (`mrsegmentator-konfai segment`) o mediante el runner genérico de KonfAI (`konfai-apps infer`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión/segmentación.

## Casos de uso

- Segmentación automatizada en pipelines de investigación clínica: el modelo procesa volúmenes de MRI completos y genera máscaras de 40 estructuras, lo que permite automatizar estudios poblacionales de morfometría sin intervención manual. La reducción de RAM de host (6,9 GB frente a 37,4 GB en volúmenes grandes) facilita su ejecución en nodos de clúster compartidos.
- Preprocesamiento para radiómica y análisis cuantitativo: las máscaras generadas sirven como entrada para la extracción de características de textura y forma en cada órgano, un paso previo habitual en estudios de imagenomics. El ensemble de cinco folds aporta estabilidad en las delimitaciones.
- Planificación quirúrgica asistida: la segmentación de órganos abdominales y torácicos en resonancia permite generar modelos anatómicos para visualización preoperatoria en 3D Slicer mediante la extensión SlicerKonfAI.
- Control de calidad y validación de segmentaciones manuales: el modelo puede ejecutarse sobre estudios ya anotados para detectar discrepancias y priorizar la revisión de casos con mayor desviación.
- Docencia y formación en anatomía radiológica: la generación de etiquetas anatómicas automáticas permite crear material didáctico con estructuras resaltadas sobre la imagen original.
- Procesamiento por lotes en estaciones de trabajo con GPU de consumo: con un tamaño de batch autoseleccionado según la VRAM libre, el modelo puede ejecutarse en GPUs de 24 GB como la RTX PRO 5000 empleada en las mediciones del autor.
- Integración en flujos de anonimización y enriquecimiento de datos: la segmentación permite enmascarar regiones anatómicas sensibles o generar metadatos estructurados por órgano antes del archivado en PACS o repositorios de investigación.

## Benchmarks y rendimiento

El autor publica mediciones de tiempo, RAM de host y VRAM de pico comparando la implementación KonfAI con la original de MRSegmentator 2.0.0, con los cinco folds en ensemble (`-f 5`), PyTorch 2.12.1 con CUDA 13.0 y una única NVIDIA RTX PRO 5000 de 24 GB. No se publican métricas de calidad de segmentación (Dice, IoU, HD95) en la información disponible.

| Caso (vóxeles) | Herramienta | Tiempo | RAM de pico | VRAM de pico |
|---|---|---|---|---|
| S (248 × 246 × 141) | KonfAI | 15 s | 5,2 GB | 18,2 GB |
| S (248 × 246 × 141) | Original | 19 s | 7,2 GB | 3,0 GB |
| M (249 × 246 × 246) | KonfAI | 21 s | 5,3 GB | 16,3 GB |
| M (249 × 246 × 246) | Original | 24 s | 8,5 GB | 3,8 GB |
| L (512 × 512 × 531) | KonfAI | 86 s | 6,9 GB | 20,6 GB |
| L (512 × 512 × 531) | Original | 143 s | 37,4 GB | 14,9 GB |

El resumen del autor indica una mejora de 1,2 a 1,7 veces en velocidad y de 1,4 a 5,4 veces en RAM de host, con la brecha ampliándose a medida que crece el volumen. La configuración por defecto `-f 2` es más rápida que la tabla, que emplea los cinco folds. No se han publicado resultados de benchmarks de calidad de segmentación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,2 GB con ensemble de cinco folds en volumen pequeño, 16,3 GB en volumen medio y 20,6 GB en volumen grande, medidos sobre una RTX PRO 5000 de 24 GB. Con `-f 2` (valor por defecto) el consumo es menor, aunque no se especifica la cifra exacta.
- RAM de host: 5,2 GB en volumen pequeño, 5,3 GB en medio y 6,9 GB en grande, con el motor KonfAI. El original requiere hasta 37,4 GB en el caso grande.
- GPU recomendadas: NVIDIA RTX PRO 5000 (24 GB) es la empleada en las mediciones; por capacidad de VRAM son adecuadas tarjetas con 24 GB o más, como RTX 4090, A100 o H100. El tamaño de batch se autoselecciona según la VRAM libre, por lo que GPUs con menos memoria pueden funcionar con batches más pequeños.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 24 GB de VRAM como la RTX 4090, siempre que el batch autoseleccionado se ajuste a la memoria disponible. En GPUs con 16 GB o menos no hay datos publicados sobre el comportamiento del ensemble completo.
- Opciones de despliegue: paquete `mrsegmentator-konfai` desde PyPI, runner genérico `konfai-apps`, y la interfaz SlicerKonfAI para 3D Slicer. No se mencionan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentación.
- Latencia y throughput: 15 s (volumen S), 21 s (M) y 86 s (L) con cinco folds en una RTX PRO 5000. Con `-f 2` los tiempos son inferiores, aunque no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Estructuras | Ensemble | Licencia | Motor |
|---|---|---|---|---|---|
| MRSegmentator-KonfAI | 3D residual UNet | 40 | 5 folds | Apache 2.0 | KonfAI (GPU-resident) |
| MRSegmentator (original) | 3D residual UNet | 40 | 5 folds | no disponible en la información | PyTorch |
| Otros modelos de segmentación multiórgano en MRI | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar esta variante con el MRSegmentator original, del que deriva directamente y con el que comparte arquitectura y pesos. No se proporcionan datos sobre alternativas como TotalSegmentator (orientado a CT), nnU-Net configuraciones específicas u otros modelos de segmentación multiórgano en resonancia, por lo que no es posible establecer una comparativa de calidad frente a ellos.

## Limitaciones y advertencias

- No se han publicado métricas de calidad de segmentación (Dice, IoU, distancia de Hausdorff) en la información disponible, por lo que no es posible evaluar la precisión clínica del modelo a partir de los datos del repositorio.
- El modelo está entrenado para resonancia magnética; no se indica su comportamiento sobre tomografía computarizada u otras modalidades.
- No se detalla la composición del dataset de entrenamiento ni la distribución de secuencias (T1, T2, FLAIR), lo que impide conocer su robustez ante protocolos de adquisición distintos a los del entrenamiento.
- El ensemble de cinco folds consume hasta 20,6 GB de VRAM en volúmenes grandes; en GPUs con menos memoria el batch autoseleccionado puede ser muy pequeño o requerir reducir el número de folds.
- El modelo no es una herramienta de diagnóstico y no sustituye la revisión por parte de un radiólogo; cualquier uso clínico requiere validación local y cumplimiento normativo (por ejemplo, marcado CE o aprobación FDA según la jurisdicción).
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso clínico recae en el implementador.
- No se especifican sesgos conocidos del modelo ni su comportamiento en poblaciones con anatomías atípicas, artefactos de movimiento o implantes metálicos.
- No hay información sobre el número de parámetros ni el tamaño exacto de los pesos, lo que dificulta estimar requisitos en escenarios no cubiertos por las mediciones publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/VBoussot/MRSegmentator-KonfAI
- Repositorio original de MRSegmentator: https://github.com/hhaentze/MRSegmentator
- Framework KonfAI: https://github.com/vboussot/KonfAI
- Extensión SlicerKonfAI para 3D Slicer: https://github.com/vboussot/SlicerKonfAI
- Paquete PyPI: https://pypi.org/project/mrsegmentator-konfai/
