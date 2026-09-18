# TmiTmi1999/digital-detective-aic2026-controlb4-h6-20260917

## Resumen

El repositorio `TmiTmi1999/digital-detective-aic2026-controlb4-h6-20260917` no es un modelo de lenguaje, sino un paquete de reproducción de una solución de visión por computador presentada a la competición AIC 2026 (tarea "Digital Detective", en ruso "Цифровой детектив"). Contiene dos juegos de pesos PyTorch (`weights/control_b4.pth` y `weights/h6.pth`), un notebook autocontenido (`solution.ipynb`) con EDA, método, 29 comprobaciones y análisis de errores, y un `submission.zip` con un CSV y 2160 máscaras PNG binarias. El autor publica el score público obtenido: 0.9596589462212584, y aclara de forma explícita que se trata del mismo artefacto enviado con anterioridad, no de un resultado nuevo.

El paquete está diseñado para reproducibilidad estricta: la primera celda del notebook descarga los recursos ausentes desde Hugging Face fijados a un commit inmutable, verifica cada archivo por SHA256 y reutiliza sin red los ficheros ya presentes. Un detalle técnico poco habitual es que el decodificador JPEG forma parte del artefacto: se incluye un wheel de Pillow con su propia copia de libjpeg IJG9e y RPATH relativo, porque una instalación estándar de Pillow 12.3.0 usa libjpeg-turbo y produce píxeles RGB distintos con la misma versión de la librería.

No se declara licencia, idiomas ni pipeline en la ficha de Hugging Face, y la model card no especifica arquitectura, número de parámetros, composición del dataset de entrenamiento ni métrica de evaluación. El repositorio ocupa 2,5 GB, mientras que el autor cifra en unos 635 MB los recursos necesarios para el modo `inference`. La inferencia exige Linux x86_64, Python 3.11, glibc>=2.34 y CUDA; el modo `report` (solo lectura del informe y EDA) funciona en CPU y sin acceso a los píxeles de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada por el autor. El paquete depende de `segmentation_models_pytorch` (SMP) 0.5.0 y `timm` 1.0.29, lo que apunta a una red de segmentación con backbone de `timm`; no confirmado en la model card |
| Parámetros totales | No disponible |
| Longitud de contexto | No aplica (modelo de visión). Entrada fija de 576 px (`input576`) |
| Tipos de cuantización | No disponible. La inferencia se ejecuta en FP16; no se publican pesos cuantizados (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No aplica. La model card está redactada en ruso; la ficha de Hugging Face no declara idiomas |
| Licencia | No disponible en Hugging Face. El wheel de `codec/` incorpora las condiciones de Independent JPEG Group (IJG) para libjpeg |
| Formato de pesos | `.pth` (state dict de PyTorch): `control_b4.pth`, `h6.pth`; FP16 en inferencia |
| Tamaño del repositorio | 2,5 GB |
| Recursos para inferencia | ~635 MB (según el autor) |
| Entradas y salidas | Imágenes JPEG/PNG de test; salida de 2160 PNG binarios más un CSV |
| Plataforma de ejecución | Linux x86_64, Python 3.11, glibc>=2.34, CUDA; PyTorch 2.5.1+cu121, torchvision 0.20.1+cu121, SMP 0.5.0, timm 1.0.29, Albumentations 2.0.8, NumPy 1.26.4, Pillow 12.3.0 (con wheel IJG9e) |
| Score público declarado | 0.9596589462212584 (misma entrega anterior; métrica no especificada) |
| Descargas / likes / fecha | 0 descargas, 0 likes; creado el 17 de septiembre de 2026 y actualizado el mismo día |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red ni el procedimiento de entrenamiento. Lo único deducible del texto y de las dependencias fijadas es que se trata de un pipeline de segmentación de imágenes basado en `segmentation_models_pytorch` (SMP 0.5.0) con backbones de `timm` 1.0.29 y aumento de datos con Albumentations 2.0.8. El autor menciona la existencia de `training_reproduction/` y de un "donor" que se descarga en modo `train`, pero no detalla número de épocas, número de imágenes, composición del dataset, funciones de pérdida ni si hubo algún tipo de ajuste fino posterior. Las imágenes de la competición no se publican en el repositorio; el dataset y el conjunto de test se entregan aparte al usuario.

El elemento más singular del sistema es el enrutado por factor de calidad JPEG: con `q > 6` se ejecuta `h6.pth`, y en caso contrario `control_b4.pth`. Se ejecuta un único modelo por imagen, sin TTA (`augment=False`). El postprocesado está fijado en la receta: `mask=.49`, clasificador `.995` cuando `q<1.5` y `.82` en el resto de casos, `gated cap=.009`, `minarea=0`. La reproducibilidad bit a bit se sostiene sobre tres pilares: descarga ligada a un commit inmutable con verificación SHA256 de cada fichero, ejecución en una carpeta de runtime congelada para evitar que un paquete `aic` del directorio actual sustituya el modelo, y el decodificador JPEG IJG9e empaquetado dentro del artefacto, cuyo `codec/BUILD.json` fija los SHA256 del wheel y de la librería y documenta el origen del binario. El SHA256 completo de `control_b4.pth` es `1e6e866d04a1902a8bde07f15f7aafc903ace8f75dd13bd1a2830142fffd990b`; el de `h6.pth` aparece truncado en la información disponible (`66d5aeb0419fe86ad…`).

## Capacidades

- Segmentación binaria de imágenes: genera máscaras PNG de un canal (2160 en la entrega verificada) más un CSV de resultados.
- Enrutado por factor de calidad JPEG: selección entre dos modelos según `q > 6`, con umbrales adicionales de clasificación en `q < 1.5`.
- Detección ligada a artefactos de compresión: el diseño asume que la huella relevante depende del códec JPEG empleado, de ahí la necesidad de fijar la implementación de libjpeg.
- Reproducibilidad verificable: verificación SHA256 de pesos y recursos, descarga offline mediante `final_notebook_bundle.zip`, y comprobación automática del decodificador con un JPEG sintético antes de ejecutar.
- Tres modos de ejecución: `report` (CPU, sin entrenamiento, sin descarga del test y sin acceso a píxeles de test), `inference` (CUDA, ~635 MB de recursos) y `train` (descarga además las entradas de entrenamiento y el donor).
- No es un modelo generativo de lenguaje: no hay generación de texto, razonamiento, código, matemáticas ni diálogo.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No declara capacidades multilingües ni visión descriptiva (VQA, captioning); la salida es exclusivamente una máscara de segmentación.
- No se documenta ningún modo de pensamiento, audio u otra modalidad adicional.

## Casos de uso

- Peritaje forense digital con requisito de trazabilidad: el paquete permite repetir exactamente la misma inferencia en una máquina distinta, con hashes de pesos y decodificador fijados, lo que facilita documentar la cadena de custodia técnica de un análisis pericial.
- Verificación de autenticidad de imágenes en redacción periodística: obtención de una máscara binaria que señale las regiones sospechosas antes de publicar una fotografía recibida de terceros.
- Antifraude en comercio electrónico: análisis de imágenes de producto o de anuncios para detectar retoques o composiciones antes de aceptar una reclamación o una devolución.
- Tramitación de siniestros en seguros: cribado automático de fotografías de daños aportadas por el asegurado, marcando las zonas manipuladas para revisión humana posterior.
- Moderación de contenido en plataformas: filtrado previo de imágenes candidatas a manipulación para priorizar la cola de revisión manual, dado que el modelo devuelve máscaras y no una decisión final.
- Baseline reproducible para investigación en competiciones AIC: punto de partida verificable con score público declarado (0.9596…) y artefacto idéntico al enviado, útil para comparar mejoras bajo el mismo protocolo.
- Auditoría de sensibilidad al códec: el enrutado por `q` y la dependencia explícita de IJG9e permiten estudiar cómo cambian las predicciones al variar el decodificador JPEG, un factor habitualmente ignorado en pipelines forenses.
- Verificación de duplicados o manipulaciones en grandes lotes: ejecución sin TTA, en FP16 y con `batch=16` y `workers=4`, adecuada para procesar conjuntos de miles de imágenes de forma desatendida.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| AIC 2026, métrica no especificada | 0.9596589462212584 | Score público declarado por el autor. Corresponde a la entrega previa ya enviada; esta publicación rehace reproducibilidad e informe, no aporta un resultado nuevo |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica | El modelo no es un modelo de lenguaje |
| Benchmarks de segmentación o de detección de manipulaciones (IoU, F1, AUC) | No disponible | La model card no publica métricas desglosadas, ni curvas, ni comparación con líneas base |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: no publicada. El autor solo indica que el modo `inference` requiere unos 635 MB de recursos descargables.
- GPU: no se recomienda ningún modelo concreto. El único requisito declarado es una GPU con CUDA y drivers compatibles; la ejecución verificada usó PyTorch 2.5.1+cu121 y torchvision 0.20.1+cu121.
- GPU de consumo: no confirmado por el autor. Dado el tamaño de recursos, la entrada de 576 px, el modo FP16 y la ejecución de un solo modelo por imagen, es razonable esperar que quepa en GPUs de consumo con 8-12 GB, pero se trata de una estimación orientativa, no de un dato publicado.
- CPU: solo soporta el modo `report` (lectura del informe, EDA y gráficos). El modo ML en CPU no está soportado.
- Sistema operativo: Linux x86_64 con Python 3.11 y glibc>=2.34 para el modo ML exacto. En Windows se indica WSL2 con GPU; el Run All nativo de Windows solo está soportado para el informe en CPU y no se declara como reproducción exacta del decodificado JPEG original.
- Opciones de despliegue: ejecución del notebook con `jupyter nbconvert --execute` o JupyterLab. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. Los únicos parámetros declarados son `batch=16`, `workers=4`, FP16, sin TTA y sin AMP alternativo.
- Almacenamiento: 2,5 GB para el repositorio completo; la carpeta `codec/` debe transferirse junto con el notebook porque el wheel de Pillow y la librería IJG9e son obligatorios para el modo ML.

## Comparativa con modelos similares

No se dispone de datos de modelos externos comparables en la información proporcionada (ni parámetros, ni contexto, ni licencia, ni resultados de benchmarks de alternativas). La única comparación posible es interna, entre los dos juegos de pesos incluidos en el propio paquete:

| Aspecto | control_b4.pth | h6.pth |
|---|---|---|
| Condición de uso | `q <= 6` | `q > 6` |
| SHA256 | `1e6e866d04a1902a8bde07f15f7aafc903ace8f75dd13bd1a2830142fffd990b` | Truncado en la documentación disponible (`66d5aeb0419fe86ad…`) |
| Arquitectura | No disponible | No disponible |
| Parámetros | No disponible | No disponible |
| Precisión en inferencia | FP16 | FP16 |
| Ejecución por imagen | Un único modelo por fotograma | Un único modelo por fotograma |
| Métricas propias | No disponibles | No disponibles |

## Limitaciones y advertencias

- Licencia no declarada en Hugging Face: sin términos explícitos de uso comercial, el uso en producción conlleva riesgo legal. El componente `codec/` incorpora además las condiciones de Independent JPEG Group, que deben respetarse por separado.
- Ausencia total de información sobre arquitectura, parámetros, dataset de entrenamiento y métrica de evaluación: el modelo no es auditable ni replicable desde cero con lo publicado.
- Reproducibilidad dependiente del entorno: los resultados no serán idénticos con libjpeg-turbo ni con otras versiones de Pillow, NumPy, PyTorch o Albumentations. El propio autor advierte que cambiar el decodificador altera los píxeles de entrada.
- Restricción estricta de plataforma para el modo ML: Linux x86_64, Python 3.11 y glibc>=2.34. En plataformas no soportadas el sistema debe fallar de forma explícita, según se documenta.
- Sesgo de dominio: el modelo se ha ajustado para el conjunto de la competición AIC 2026 (2160 imágenes en la entrega). No hay evaluación fuera de distribución, ni por tipo de imagen, cámara, resolución o manipulación.
- Sin evaluación de sesgos, robustez adversarial, calibración ni tasas de falsos positivos y falsos negativos.
- Umbral duro en `q = 6` para el enrutado entre los dos modelos: no se documenta el comportamiento cerca del umbral ni el impacto de un enrutado erróneo.
- El riesgo de alucinación no aplica al no ser un modelo generativo; sí existe riesgo de máscaras espurias o de regiones no detectadas, por lo que no debe usarse como prueba concluyente sin revisión humana.
- El SHA256 de `h6.pth` aparece truncado en la documentación disponible, lo que impide verificar ese peso solo con la información publicada.
- Las imágenes del concurso y el conjunto de test no se publican en el repositorio; la reproducibilidad del entrenamiento queda limitada a los recursos que el autor incluye en `training_reproduction/`.
- Repositorio sin descargas ni likes y sin compromiso de mantenimiento declarado; la fecha de publicación indicada es el 17 de septiembre de 2026.
- Advertencia operativa del propio autor: debe usarse una carpeta de trabajo nueva, ya que el repositorio antiguo contiene módulos que ensombrecen paquetes estándar, y no se debe reinstalar NumPy o Torch dentro del mismo kernel ya importado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TmiTmi1999/digital-detective-aic2026-controlb4-h6-20260917
- Conjunto de test citado en la model card: https://huggingface.co/datasets/QwertyNice/Digital_Detective_AIC2026/resolve/main/test_stage1.zip
- Página del dataset: https://huggingface.co/datasets/QwertyNice/Digital_Detective_AIC2026
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos tratan sobre refrigerantes (CFC, HCFC, HFC e hidrocarburos) y no guardan ninguna relación con este modelo; la coincidencia procede de identificadores como "H6" o "controlB4" y no de contenido técnico utilizable.
