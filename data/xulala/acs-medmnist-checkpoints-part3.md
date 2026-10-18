# xulala/acs-medmnist-checkpoints-part3

## Resumen

Este repositorio de Hugging Face no contiene un modelo generativo, sino un conjunto de checkpoints de investigación: la tercera parte de los modelos entrenados para el artículo sobre ACS (selección de datos por cobertura condicionada a clase, filtro de pureza por clase y conmutación herding/coverage dependiente del presupuesto) evaluado sobre MedMNIST. Lo publica el usuario `xulala` y su función es hacer reproducible el protocolo experimental: cada celda del estudio queda archivada con su checkpoint, los índices de datos seleccionados, las predicciones y las métricas.

El repositorio alberga tres bloques experimentales: `prereg40` (375 celdas, barrido de presupuesto por clase 4/8/13/20/40 en Retina/Breast/Derma/OCT/Tissue con tres selectores), `acf56` (174 celdas, intervención de filtrado por consistencia de apariencia) y, añadidos el 2026-10-19, `j4aug` y `j4pt` (350 celdas cada uno, reentrenamiento con aumento de datos y con ResNet-18 preentrenada en ImageNet) y `j6` (240 celdas, reconstrucción de ACS y del objetivo Graph-A2 sobre features de DINOv2 y CLIP).

Su relevancia es metodológica, no de producto: permite auditar resultados de selección de datos en imagen médica sin reentrenar 1.489 modelos, verificar hashes de checkpoints y selecciones, y reutilizar los conjuntos de índices como base para nuevos estudios. El protocolo es homogéneo: ResNet-18 desde cero, 224 px, 1.000 épocas, sin aumento de datos y checkpoint de la última época.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual), entrenada desde cero |
| Parámetros totales | no disponible en la model card (la arquitectura es ResNet-18; el recuento no se explicita) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagen, no modelo de lenguaje) |
| Tipos de cuantización | no disponible; un único `final.pt` por celda, sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica (clasificación de imagen); no disponible en la model card |
| Licencia | no disponible; el autor indica que el uso de pesos y predicciones queda sujeto a la licencia del dataset de origen (MedMNIST v2) |
| Formato de pesos | PyTorch `.pt` (`torch.load` del state_dict); artefactos auxiliares `.npy`, `.npz`, `.jsonl`, `.json`, `.csv` |
| Autor | xulala |
| Tamaño del repositorio | 67,6 GB |
| Celdas / checkpoints | 1.489 (375 + 174 + 350 + 350 + 240) |
| Resolución de entrada | 224 px |
| Datasets | RetinaMNIST, BreastMNIST, DermaMNIST, OCTMNIST, TissueMNIST (MedMNIST v2, 2D) |
| Fechas | creado 2026-10-12, actualizado 2026-10-18 (la model card menciona altas del 2026-10-19) |

## Arquitectura y entrenamiento

Todos los checkpoints corresponden a una ResNet-18 entrenada desde cero sobre imágenes redimensionadas a 224 px, con 1.000 épocas, sin aumento de datos, ejecución determinista y guardado del checkpoint de la última época (no del mejor por validación). Cada celda se organiza como `<experiment>/<dataset>/r<ratio>/<arm>/seed_<s>/` y contiene `final.pt`, `selected_indices.npy`, `predictions_clean.npz`, `metrics.jsonl`, `run_config.json` y `training_history.json`. Los experimentos comparan selectores de datos (random, herding y coverage) bajo presupuestos por clase de 4/8/13/20/40 muestras en `prereg40`, y evalúan si un filtro de consistencia de apariencia en espacio de píxeles corrige el fallo de coverage con presupuestos pequeños en `acf56`, con controles de borrado aleatorio y de dirección inversa.

Los bloques añadidos después cubren dos ejes distintos: `j4aug` y `j4pt` reintroducen el régimen con aumento de datos y con pesos preentrenados de ImageNet (`j4_regime.json` en cada celda), y `j6` reconstruye ACS y el objetivo Graph-A2 sobre features extraídas con DINOv2 y CLIP (brazos `j6acs_<enc>` y `j6a2_<enc>`), separando así la selección basada en features del propio modelo de la basada en codificadores preentrenados. No hay información sobre número total de tokens ni sobre RLHF/DPO, ya que no es un modelo de lenguaje; los datos de entrenamiento provienen de MedMNIST v2 (Yang et al., Scientific Data 2023). Los manifests (`manifest_part3.csv`, `manifest_j4j6.csv`) registran por celda el balanced accuracy de test, el recall de la peor clase y los SHA-256 del checkpoint y de la selección, recalculados antes de la subida y contrastados con el valor registrado durante el entrenamiento.

## Capacidades

- Clasificación de imagen médica 2D en cinco subconjuntos de MedMNIST: RetinaMNIST, BreastMNIST, DermaMNIST, OCTMNIST y TissueMNIST.
- Extracción de representaciones con la ResNet-18 entrenada, útil para estudiar selectores basados en features del propio modelo frente a codificadores preentrenados (DINOv2, CLIP).
- Reproducción exacta de las celdas del artículo: checkpoints, índices de selección por semilla y predicciones sobre el conjunto limpio de test.
- Auditoría de integridad: hashes SHA-256 de checkpoint y selección verificables contra los manifests.
- Análisis de selección de datos: comparación de random, herding y coverage bajo distintos presupuestos por clase y con controles (borrado aleatorio, dirección inversa, filtro de apariencia).
- Evaluación de regímenes de entrenamiento: desde cero frente a preentrenado en ImageNet, con y sin aumento de datos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de resultados del artículo: descargar una celda concreta con `hf_hub_download`, cargar `final.pt` en CPU y recalcular el balanced accuracy sobre `predictions_clean.npz` para contrastar la cifra publicada.
- Auditoría de integridad de artefactos: verificar que el SHA-256 del checkpoint y el de `selected_indices.npy` coinciden con los registrados en `manifest_part3.csv`, lo que permite detectar corrupción o manipulación en la cadena de entrenamiento.
- Baseline para nuevos métodos de selección de datos: reutilizar los índices de random, herding y coverage como referencia congelada y comparar un selector nuevo sin reentrenar los 1.489 modelos originales.
- Estudio del fallo de coverage con presupuestos pequeños: `prereg40` ofrece el barrido 4/8/13/20/40 por clase necesario para aislar si el problema es de tamaño de presupuesto o del criterio de cobertura.
- Diseño de anotación en proyectos de imagen médica: usar los índices seleccionados por herding o coverage como propuesta de qué imágenes etiquetar primero cuando el presupuesto de anotación es de decenas de muestras por clase.
- Investigación sobre features preentrenadas: `j6` permite comparar selección sobre features de DINOv2 y CLIP frente a features de una ResNet-18 entrenada desde cero, con las mismas semillas y presupuestos.
- Análisis de desbalanceo y clases minoritarias: las métricas de recall de la peor clase por celda permiten estudiar el comportamiento en las clases raras de DermaMNIST o TissueMNIST.
- Docencia y formación: el conjunto sirve como ejemplo real de protocolo determinista con registro de hashes y artefactos por semilla en un curso de metodología experimental en machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados en la información disponible. Los manifests del repositorio contienen, por celda, balanced accuracy de test y recall de la peor clase, pero no se proporcionan los valores numéricos en la model card ni en los resultados de búsqueda consultados.

| Bloque | Celdas | Contenido | Métricas disponibles en el repo |
|---|---|---|---|
| `prereg40` | 375 | Barrido de presupuesto por clase (4/8/13/20/40) en Retina/Breast/Derma/OCT/Tissue con random/herding/coverage | BA de test, recall de peor clase, hashes |
| `acf56` | 174 | Filtro de consistencia de apariencia + controles de borrado aleatorio y dirección inversa | BA de test, recall de peor clase, hashes |
| `j4aug` | 350 | Selecciones de la tabla principal reentrenadas con aumento de datos | BA de test, recall de peor clase, hashes |
| `j4pt` | 350 | Aumento de datos + ResNet-18 preentrenada en ImageNet | BA de test, recall de peor clase, hashes |
| `j6` | 240 | ACS y Graph-A2 sobre features de DINOv2 / CLIP | BA de test, recall de peor clase, hashes |

## Requisitos de hardware

- Inferencia: una ResNet-18 a 224 px en fp32 ocupa del orden de 45 MB de pesos (estimación a partir de la arquitectura y del tamaño medio por celda implicado por los 67,6 GB / 1.489 celdas); las activaciones dominan el consumo, pero un lote de 256 imágenes cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas para inferencia: cualquier GPU consumer (RTX 3060, RTX 4070, RTX 4090) o incluso CPU para celdas individuales.
- GPU recomendadas para reentrenar el protocolo completo: A100 o H100 para reducir el coste de 1.000 épocas por celda multiplicado por 1.489 celdas y múltiples semillas.
- Cabe en GPU consumer: sí, tanto la inferencia como el reentrenamiento de una celda individual.
- Despliegue: PyTorch y torchvision con `hf_hub_download` para descarga selectiva; no aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Almacenamiento: 67,6 GB para el repositorio completo; conviene descargar solo las celdas necesarias, ya que cada `final.pt` es un fichero independiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Repositorio | Contenido | Celdas / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|
| `xulala/acs-medmnist-checkpoints-part3` (este) | `prereg40`, `acf56`, `j4aug`, `j4pt`, `j6` | 1.489 celdas; barridos de presupuesto, filtro de apariencia, aumento de datos, preentrenamiento y features DINOv2/CLIP | no disponible (sujeta a la del dataset de origen) | Hugging Face, 67,6 GB |
| `xulala/acs-medmnist-all-checkpoints` (parte 1) | Tabla principal, G1/G2, E5, E7; ACS y métodos one-shot comparados a presupuestos del 2 % y 5 % | no disponible en la información proporcionada | no disponible | Hugging Face |
| `xulala/acs-medmnist-checkpoints-extra` (parte 2) | J2, J3, controles NCF, OrganC/Pneumonia, EyePACS, docs/59 herding-vs-random y desbordamiento de la parte 1 | no disponible en la información proporcionada | no disponible | Hugging Face |
| MedMNIST v2 (dataset base) | 12 datasets 2D y 6 3D estandarizados a 28×28 / 28×28×28 | 18 datasets | no disponible en la información proporcionada | `medmnist` en PyPI y GitHub |

## Limitaciones y advertencias

- No es un modelo de propósito general: es una colección de checkpoints de investigación sobre cinco subconjuntos 2D de MedMNIST, sin capacidades de texto, código ni razonamiento.
- Licencia no declarada en la model card; el autor remite a la licencia del dataset de origen (MedMNIST v2), que debe verificarse antes de cualquier uso comercial o redistribución.
- Las imágenes de MedMNIST están estandarizadas a 28×28 píxeles; el entrenamiento a 224 px implica un remuestreo, por lo que los modelos no deben interpretarse como validados sobre imágenes médicas nativas en alta resolución.
- El protocolo principal no usa aumento de datos y guarda únicamente el checkpoint de la última época, no el mejor por validación; esto puede infravalorar el rendimiento respecto a prácticas habituales.
- Riesgo de malinterpretación: al estar alojado en Hugging Face como "model", puede confundirse con un modelo clínico desplegable; no hay validación externa, regulatoria ni clínica asociada.
- Sesgos y desbalanceo: las métricas de recall de la peor clase se incluyen precisamente porque los subconjuntos tienen clases minoritarias; no se documentan análisis de subgrupos por sexo, edad o etnia.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sobreinterpretar predicciones aisladas de `predictions_clean.npz` como evidencia diagnóstica.
- El propio autor advierte de que parte de las citas del artículo figuran como no verificadas por falta de acceso web en el momento de la comprobación.
- Los resultados son sensibles a la semilla: cada celda está ligada a `seed_<s>`, y las conclusiones deben agregarse sobre semillas, no sobre celdas individuales.
- Inconsistencia menor de fechas: el repositorio figura actualizado el 2026-10-18 mientras la model card describe altas del 2026-10-19.
- El tamaño (67,6 GB) y el número de ficheros exigen descarga selectiva; la parte 1 menciona el límite de 20.000 ficheros de Hugging Face como motivo de la fragmentación en tres repositorios.

## Enlaces

- Repositorio principal (parte 3): https://huggingface.co/xulala/acs-medmnist-checkpoints-part3
- Parte 1: https://huggingface.co/xulala/acs-medmnist-all-checkpoints
- Parte 2: https://huggingface.co/xulala/acs-medmnist-checkpoints-extra
- Perfil del autor: https://huggingface.co/xulala
- Auditoría de referencias y cifras: https://github.com/18054546156/acs-medmnist-selection/blob/main/paper/journal/REFERENCES_AND_NUMBERS_AUDIT.md
- Repositorio GitHub del proyecto: https://github.com/18054546156/acs-medmnist-selection
- MedMNIST (sitio oficial): https://medmnist.com/
- MedMNIST (GitHub): https://github.com/MedMNIST/MedMNIST
- MedMNIST (PyPI): https://pypi.org/project/medmnist/
