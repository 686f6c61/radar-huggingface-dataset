# VBoussot/TotalSegmentator-KonfAI

## Resumen

TotalSegmentator-KonfAI es una adaptación acelerada con KonfAI del modelo TotalSegmentator, una herramienta de segmentación multiorgánica de cuerpo completo para imágenes médicas de tomografía computarizada (CT) y resonancia magnética (MRI). Lo desarrolla VBoussot y se distribuye bajo licencia Apache 2.0. El modelo resuelve el problema de la segmentación automática de estructuras anatómicas en volúmenes 3D médicos, una tarea crítica en flujos de trabajo de radiología, planificación quirúrgica y análisis cuantitativo.

La aportación principal frente al TotalSegmentator original no es un nuevo entrenamiento, sino una reimplementación del pipeline de inferencia sobre el framework KonfAI que reduce el tiempo de ejecución entre 1,8 y 3,9 veces y el consumo de memoria RAM del host entre 2,7 y 4,8 veces, manteniendo los mismos pesos. El repositorio ocupa 5,1 GB e incluye varios submodelos especializados por modalidad y tarea.

Técnicamente se basa en una arquitectura 3D residual UNet con parches de `[96, 128, 160]` voxels remuestreados a 1,5 mm, y ofrece variantes rápidas a 3 mm y modelos específicos para dientes, estructuras craneofaciales y vasos pulmonares. Es relevante ahora porque permite ejecutar segmentación médica de alta calidad en GPUs de 24 GB con latencias de segundos a pocos minutos, algo impensable con el pipeline original en muchos entornos clínicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D residual UNet (basada en nnU-Net) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no lingüístico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (empaquetado en repositorio KonfAI de 5,1 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura 3D residual UNet derivada de los planes de nnU-Net, con parches de entrada de `[96, 128, 160]` voxels y remuestreo a 1,5 mm para los modelos `total` y `total_mr`. Los submodelos `teeth`, `craniofacial_structures`, `lung_vessels` y `total-3mm-crop` conservan los planes de parche y espaciado originales de nnU-Net y requieren una versión de KonfAI superior a 1.8.8. Los pesos son los mismos que los del TotalSegmentator original; la innovación no está en el entrenamiento sino en la implementación del pipeline de inferencia.

La aceleración proviene de la reimplementación sobre KonfAI, que utiliza parches más grandes, acumulación en GPU y streaming de datos para acotar el uso de VRAM en volúmenes grandes. El tamaño de lote se selecciona automáticamente según la VRAM libre disponible. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset, más allá de la referencia a los Datasets 291–295 empleados en las mediciones de rendimiento.

## Capacidades

- Segmentación multiorgánica de cuerpo completo en CT con 117 etiquetas anatómicas (modelo `total`, ensemble de 5 modelos).
- Segmentación multiorgánica en MRI con 50 etiquetas (modelo `total_mr`, ensemble de 2 modelos).
- Variantes rápidas a 3 mm de resolución (`total-3mm`, `total_mr-3mm`) con un solo modelo por tarea.
- Segmentación dental y craneofacial a 0,5 mm (`teeth` con 77 etiquetas, `craniofacial_structures` con 7 etiquetas) para CBCT y CT.
- Segmentación de vasos pulmonares (`lung_vessels`, 4 etiquetas) con recorte automático a los pulmones detectados por `total-3mm-crop`.
- Procesamiento de volúmenes 3D completos en formato NIfTI (`.nii.gz`).
- Ejecución mediante CLI (`totalsegmentator-konfai`), runner genérico de KonfAI e interfaz interactiva en SlicerKonfAI.
- Ajuste manual de tamaño de parche y tamaño de lote mediante `--patch-size` y `--batch-size`.

## Casos de uso

- Planificación quirúrgica: la segmentación de 117 estructuras en CT permite generar mapas anatómicos previos a cirugía abdominal, torácica o vascular; el modelo `total` ofrece la máxima precisión con ensemble de 5 modelos.
- Análisis cuantitativo de composición corporal: la segmentación de órganos y tejidos facilita el cálculo de volúmenes y densidades en estudios longitudinales, aprovechando la variante `total-3mm` para procesar grandes cohortes con menor coste computacional.
- Odontología y cirugía maxilofacial: el submodelo `teeth` con 77 etiquetas a 0,5 mm permite segmentar piezas dentales individuales y estructuras craneofaciales en CBCT para planificación de implantes.
- Análisis de vasos pulmonares: `lung_vessels` recorta automáticamente los pulmones detectados por `total-3mm-crop` y segmenta la vasculatura, útil en estudios de enfermedad pulmonar o embolia.
- Investigación en neuroimagen y oncología: `total_mr` con 50 etiquetas permite segmentar estructuras en resonancia magnética, adecuado para estudios de volumetría cerebral o seguimiento tumoral.
- Despliegue en entornos clínicos con recursos limitados: la variante `total-3mm` con un solo modelo cabe en GPUs por debajo de 24 GB y reduce el tiempo de inferencia, lo que permite integrarla en estaciones de trabajo radiológicas.
- Integración en pipelines de investigación: la CLI `totalsegmentator-konfai` y el runner de KonfAI permiten automatizar la segmentación por lotes de estudios NIfTI en servidores con GPU.

## Benchmarks y rendimiento

Mediciones realizadas con los mismos pesos (Datasets 291–295, 1,5 mm, ensemble de 5 modelos `total`), misma build de PyTorch (2.12.1, cu13.0) y una NVIDIA RTX PRO 5000 (24 GB) con TotalSegmentator 2.18.0:

| Caso (voxels) | Herramienta | Tiempo | RAM pico | VRAM pico |
|---|---|---|---|---|
| S (240 × 220 × 200) | KonfAI | 7,6 s | 5,0 GB | 12,3 GB |
| S (240 × 220 × 200) | Original | 29,9 s | 22,6 GB | 3,3 GB |
| M (249 × 246 × 246) | KonfAI | 17,7 s | 5,2 GB | 15,4 GB |
| M (249 × 246 × 246) | Original | 58,3 s | 25,2 GB | 7,1 GB |
| L (512 × 512 × 531) | KonfAI | 212 s | 17,6 GB | 10,6 GB |
| L (512 × 512 × 531) | Original | 377 s | 47,9 GB | 23,1 GB |

KonfAI es entre 1,8 y 3,9 veces más rápido y consume entre 2,7 y 4,8 veces menos RAM del host. En casos pequeños y medianos usa más VRAM que el original pero se mantiene dentro de 24 GB; en casos grandes el streaming acota la VRAM a 10,6 GB frente a los 23,1 GB del original. No se han publicado resultados de benchmarks de calidad de segmentación (Dice, IoU) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,3 GB para volúmenes pequeños, 15,4 GB para medianos y 10,6 GB para grandes con `total` en KonfAI; el original requiere 3,3–23,1 GB según el caso.
- GPU recomendadas: NVIDIA RTX PRO 5000 (24 GB) es la referencia medida; tarjetas de 24 GB como RTX 4090 o A10G son adecuadas para `total`.
- Para GPUs por debajo de 24 GB se recomienda `total-3mm` (un solo modelo, 3 mm), que reduce los requisitos de VRAM.
- RAM del host: 5,0–17,6 GB en KonfAI frente a 22,6–47,9 GB en el original, lo que facilita el despliegue en servidores modestos.
- Opciones de despliegue: CLI `totalsegmentator-konfai`, runner genérico `konfai-apps`, e interfaz interactiva SlicerKonfAI.
- Latencia: 7,6 s para volúmenes pequeños, 17,7 s para medianos y 212 s para grandes con `total` en KonfAI.
- El tamaño de lote se autoselecciona según la VRAM libre; se puede forzar con `--batch-size`.

## Comparativa con modelos similares

| Modelo | Modalidad | Etiquetas | Ensemble | Licencia | Aceleración |
|---|---|---|---|---|---|
| TotalSegmentator-KonfAI (`total`) | CT | 117 | 5 | Apache 2.0 | 1,8–3,9× vs original |
| TotalSegmentator original | CT / MRI | 117 (CT), 50 (MRI) | 5 / 2 | Apache 2.0 | referencia |
| TotalSegmentator-KonfAI (`total-3mm`) | CT | 117 | 1 | Apache 2.0 | variante rápida |
| TotalSegmentator-KonfAI (`total_mr`) | MRI | 50 | 2 | Apache 2.0 | variante MRI |

La comparativa directa con otros modelos de segmentación médica (por ejemplo, MONAI Label, nnU-Net genérico o modelos específicos por órgano) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; su única salida es una máscara de segmentación 3D.
- Los pesos son idénticos a los del TotalSegmentator original, por lo que hereda sus sesgos y errores de segmentación en anatomías atípicas, artefactos o imágenes de baja calidad.
- Los submodelos `teeth`, `craniofacial_structures`, `lung_vessels` y `total-3mm-crop` requieren KonfAI superior a 1.8.8 y una app que ejecute otra versión primero.
- El uso de más VRAM en casos pequeños y medianos puede provocar errores de memoria en GPUs con menos de 24 GB si se usa `total` en lugar de `total-3mm`.
- No se han publicado métricas de calidad de segmentación (Dice, IoU) en la información disponible; la validación clínica corre a cargo del usuario.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre datos clínicos ni cumplimiento regulatorio (marcado CE, FDA) para uso diagnóstico.
- El modelo no sustituye el criterio de un radiólogo; cualquier uso clínico requiere validación local y supervisión profesional.

## Enlaces

- Hugging Face: https://huggingface.co/VBoussot/TotalSegmentator-KonfAI
- TotalSegmentator original: https://github.com/wasserth/TotalSegmentator
- KonfAI: https://github.com/vboussot/KonfAI
- PyPI `totalsegmentator-konfai`: https://pypi.org/project/totalsegmentator-konfai/
- SlicerKonfAI: https://github.com/vboussot/SlicerKonfAI
