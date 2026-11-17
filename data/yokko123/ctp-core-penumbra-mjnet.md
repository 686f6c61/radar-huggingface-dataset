# yokko123/ctp-core-penumbra-mjnet

## Resumen

mJ-Net Core / Penumbra es un modelo de segmentación de imágenes médicas desarrollado por yokko123 (Md Sazidur Rahman y colaboradores de la Universidad de Stavanger) y presentado en IEEE-EMBS BHI 2026. Se trata de un port a PyTorch de la arquitectura mJ-Net de Tomasetti et al. (ACM-BCB '20), adaptada a perfusión por tomografía computarizada (CTP) de admisión en 4D para la identificación de penumbra y núcleo isquémico en ictus. El modelo consume parches espaciales de 16×16 píxeles a lo largo de 40 marcas temporales y predice una etiqueta de 4 clases (fondo, cerebro, penumbra, núcleo).

La relevancia de esta publicación no reside en su capacidad de segmentación —el propio autor advierte que es débil como segmentador, con Dice de 0,30 para penumbra y 0,05 para núcleo— sino en su uso como extractor de características. El cuello de botella de 256 dimensiones del codificador (FE3) proporciona la separación más clara entre penumbra salvable y no salvable de todas las familias de características probadas en el estudio. Es, por tanto, una pieza de investigación orientada a la representación latente, no una herramienta de producción clínica.

El modelo es extremadamente compacto (0,98 M de parámetros, 19,5 MB para el ensemble de 5 folds), se distribuye con licencia MIT y está entrenado exclusivamente con 116 casos del Hospital Universitario de Stavanger. El conjunto de datos ISLES'24 enlazado se usó para aplicar el modelo, no para entrenarlo ni evaluarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 2D + tiempo (mJ-Net, variante estándar, `longJ=False`, `v2=False`) |
| Parametros totales | 0,98 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 16×16 píxeles × 40 marcas temporales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen médica) |
| Licencia | MIT |
| Formato de pesos | no especificado en la información disponible (repo de 0,0 GB, pesos en `folds/`) |

## Arquitectura y entrenamiento

mJ-Net es una red convolucional que procesa un parche espacial de 16×16 píxeles a través de 40 marcas temporales (entrada con forma `(1, 40, 16, 16)`), colapsa el eje temporal y emite una predicción de 4 clases para ese parche. Emplea normalización BatchNorm tras cada convolución y dropout de 0,2 en las ubicaciones designadas. El modelo se distribuye como un ensemble de 5 folds entrenado con validación cruzada. La innovación técnica relevante es el descriptor de cuello de botella de 256 dimensiones del codificador (FE3), que se agrupa sobre parches de 16×16 dentro de cada región etiquetada mediante `extract_features.py`, un procedimiento que `predict.py` no reproduce.

El entrenamiento se realizó sobre 116 casos del Hospital Universitario de Stavanger (SUH). No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon RLHF/DPO (no aplicables a este tipo de modelo). El pipeline de preprocesado es estricto y obligatorio: corrección de movimiento 4D por registro rígido de cada frame al primero, remuestreo temporal a 1 fps uniforme (40 frames), registro rígido a la NCCT de admisión, skull-stripping con SynthStrip, ventana a [0, 100] HU y reescalado a rango de grises de 8 bits, y división por 255 en inferencia.

## Capacidades

- Segmentación de 4 clases en parches: fondo, cerebro, penumbra y núcleo isquémico.
- Extracción de características: descriptor de 256 dimensiones del cuello de botella del codificador FE3, con separación clara entre penumbra salvable y no salvable.
- Procesamiento de series temporales 4D de CTP (40 marcas temporales).
- Inferencia por parches con control de solapamiento mediante `--stride` (por defecto 4).
- Ejecución de un solo fold (`--folds 0`) o del ensemble completo de 5 folds.
- Entrada flexible: NIfTI 4D con 40 marcas temporales o directorio de 40 frames 3D (`CASE_0000.nii.gz … CASE_0039.nii.gz`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (no aplica).
- No soporta visión general, audio ni thinking mode.

## Casos de uso

- Investigación en representaciones latentes de ictus: usar el descriptor FE3 de 256 dimensiones para estudiar la separabilidad entre penumbra salvable y no salvable, que es el propósito principal declarado del modelo.
- Extracción de características para clasificadores posteriores: alimentar modelos de clasificación o regresión aguas abajo con los descriptores agrupados por región etiquetada mediante `extract_features.py`.
- Reproducción de resultados académicos: replicar la comparación de familias de características del paper BHI 2026 sobre la cohorte SUH.
- Análisis exploratorio de cohorts CTP: procesar series de perfusión de admisión con el pipeline de preprocesado documentado para obtener mapas de penumbra aproximados, asumiendo la baja calidad de segmentación.
- Validación de pipelines de preprocesado: servir como referencia para verificar que la cadena de corrección de movimiento, remuestreo, registro y ventana HU está correctamente implementada antes de usar modelos de segmentación superiores.
- Docencia y experimentación con arquitecturas CNN 2D+t: el tamaño reducido (0,98 M de parámetros, 19,5 MB) permite ejecutarlo en hardware modesto para fines formativos.
- No adecuado para uso clínico directo: el propio autor indica que, como segmentador, es débil y que para segmentación de núcleo/penumbra debe usarse el modelo nnU-Net enlazado (Dice 0,71 / 0,30).

## Benchmarks y rendimiento

Conjunto de test reservado, 33 casos (los mismos pacientes que el nnU-Net):

| Clase | Dice |
|---|---|
| Penumbra | 0,30 ± 0,23 |
| Núcleo | 0,05 ± 0,06 |
| Lesión (núcleo ∪ penumbra) | 0,24 ± 0,20 |

El postprocesado de componentes conectados elevó la penumbra a 0,32 y no modificó el núcleo, por lo que no se aplica por defecto. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB, dado el tamaño de 0,98 M de parámetros y parches de 16×16×40.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no se requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en CPU para volúmenes pequeños.
- Opciones de despliegue: script `predict.py` del repositorio con PyTorch, SimpleITK, NumPy y huggingface_hub; descarga de pesos vía `hf download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Dice penumbra | Dice núcleo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mJ-Net Core / Penumbra (FE3) | 0,98 M | 16×16×40 | 0,30 | 0,05 | MIT | Hugging Face |
| nnU-Net Core / Penumbra (mismo autor) | no disponible | no disponible | 0,71 | 0,30 | no disponible | Hugging Face |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Publicado como extractor de características, no como segmentador: el autor advierte explícitamente que su rendimiento de segmentación es débil (Dice de penumbra 0,30 y núcleo 0,05).
- La segmentación de núcleo es efectivamente inutilizable (Dice 0,05 ± 0,06).
- Requiere un pipeline de preprocesado estricto (corrección de movimiento, remuestreo a 1 fps, registro a NCCT, skull-stripping con SynthStrip, ventana [0, 100] HU, reescalado 8 bits) y no se comporta de forma sensata sobre CTP en bruto.
- Entrenado exclusivamente con 116 casos de una única institución (SUH), lo que limita la generalización a otras cohortes y equipos.
- El dataset ISLES'24 enlazado se usó para aplicar el modelo, no para entrenarlo ni evaluarlo; no debe citarse como conjunto de entrenamiento.
- No se documentan sesgos demográficos ni análisis de subgrupos en la información disponible.
- Riesgo de alucinación no aplica (modelo de segmentación), pero sí riesgo de falsos positivos y negativos clínicamente relevantes dada la baja Dice.
- Licencia MIT permite uso comercial, pero el modelo no está validado para uso clínico; cualquier aplicación médica requeriría validación regulatoria independiente.
- La arquitectura original no es del autor (Tomasetti et al., ACM-BCB '20); se debe citar también ese trabajo.
- El repositorio ocupa 0,0 GB y no se detalla el formato exacto de los pesos más allá de la carpeta `folds/`.

## Enlaces

- Hugging Face: https://huggingface.co/yokko123/ctp-core-penumbra-mjnet
- Pesos nnU-Net (FE4): https://huggingface.co/yokko123/ctp-core-penumbra-nnunet
- Demo en vivo: https://huggingface.co/spaces/yokko123/ctp-core-penumbra-demo
- Paper (arXiv): https://arxiv.org/abs/2602.07535
- Página del proyecto: https://yokko123.github.io/bi-temporal-ctp-dwi/
- Código: https://github.com/yokko123/bi-temporal-ctp-dwi-code
- Script de extracción de características: https://github.com/yokko123/bi-temporal-ctp-dwi-code/blob/main/02_features/fe3_mjnet/extract_features.py
- DOI (Zenodo): https://doi.org/10.5281/zenodo.23209370
- Dataset ISLES'24: https://huggingface.co/datasets/hugging-science/isles24-stroke
- Paper de la arquitectura original (Tomasetti et al., ACM-BCB '20): no disponible enlace directo en la información proporcionada
