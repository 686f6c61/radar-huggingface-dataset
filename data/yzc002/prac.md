# yzc002/PRAC

## Resumen

PRAC (Personalized Image Aesthetic Assessment via Preference-rich Sample Mining and Cohort Merging) es un *framework* de investigación para evaluar la estética de imágenes de forma personalizada, es decir, prediciendo no una puntuación estética universal sino la preferencia concreta de un usuario. Lo desarrolla un equipo de la School of Artificial Intelligence y del State Key Laboratory of EMIM de la Universidad de Xidian (Zhichao Yang, Tianjiao Gu, Zhixianhe Zhang, Xiangfei Sheng, Pengfei Chen y Leida Li), y el trabajo fue aceptado como presentación oral en ACM MM 2026 (preprint arXiv:2607.15752).

Técnicamente no es un modelo de lenguaje independiente, sino un conjunto de adaptadores LoRA y código de entrenamiento construido sobre el *checkpoint* visión-lenguaje mPLUG-Owl3-7B-241101. El repositorio libera la implementación del predictor estético genérico (GIAA), los módulos de selección de muestras ricas en preferencia (PreferSelect, con CCM y PDM) y de fusión de cohortes (PreferMerge, con pool de LoRA, FIM y *merging* de adaptadores), además de los *data loaders* y las configuraciones de experimentos sobre el dataset PARA.

Su relevancia es acotada pero clara: cubre un nicho poco atendido, la personalización de la valoración estética mediante *fine-tuning* eficiente sobre un VLM de 7B, y lo hace con código MIT y configuraciones reproducibles. No obstante, el paquete publicado es material de investigación: el repositorio de HuggingFace ocupa 0.0 GB, no incluye pesos alojados en la plataforma, no declara *pipeline* ni idiomas, y los adaptadores preentrenados se distribuyen por Baidu Netdisk.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer (mPLUG-Owl3-7B-241101) con adaptadores LoRA para predicción estética (GIAA) y modulos de selección/fusión de cohortes |
| Parametros totales | 7B en el *backbone* (mPLUG-Owl3-7B-241101); tamaño de los adaptadores LoRA no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información proporcionada (el entorno de referencia usa PyTorch 2.4.1 con CUDA 12.1) |
| Idiomas soportados | No disponible |
| Licencia | MIT para el código fuente de PRAC según el README del repositorio; la licencia del repo en HuggingFace no figura. El *checkpoint* base mPLUG-Owl3 tiene su propia licencia, no indicada aquí |
| Formato de pesos | safetensors (etiqueta del repo); los adaptadores se descargan aparte desde Baidu Netdisk en `runs/para/giaa_adapter` |

## Arquitectura y entrenamiento

PRAC envuelve mPLUG-Owl3-7B mediante `modules/MplugOwl3ForGIAA.py`, que implementa el *wrapper* del modelo y las utilidades LoRA. Sobre esa base se entrena un predictor estético genérico (GIAA) que produce una distribución de puntuaciones en lugar de un único valor, y que opcionalmente genera una justificación textual (`--explain`) del juicio estético. El entrenamiento se lanza con `mplug3_train_giaaBackbone.py` y se evalúa con `mplug3_eval_giaaBackbone.py`, usando etiquetas discretizadas generadas por `scripts/prepare_giaa_labels.py` a partir de las anotaciones originales del dataset PARA (`parais_giaa_train_discretized.csv` y `para_giaa_test_discretized.csv`).

La innovación metodológica está en la capa de personalización, no en el *backbone*. PreferSelect calcula dos señales complementarias sobre las preferencias por usuario: CCM (controversia colectiva) y PDM (desviación personalizada cacheada), y las combina mediante un barrido de pesos alfa (`preferSelect_weights_ablation.py`) para exportar muestras "ricas en preferencia". PreferMerge entrena un pool de adaptadores LoRA, calcula similitudes de preferencia mediante la información de Fisher (FIM, `preferMerge_FIM_fixed.py`) y selecciona una cohorte que equilibra relevancia y diversidad (`preferMerge_choice_fast.py`) antes de fusionar los adaptadores del usuario objetivo. No se especifican en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Predicción de preferencia estética personalizada por usuario sobre imágenes, con salida en forma de distribución de puntuaciones y una puntuación agregada.
- Generación de justificaciones textuales del juicio estético (modo `--explain`), heredada de la capacidad visión-lenguaje de mPLUG-Owl3.
- Comprensión de imagen y texto conjunta (VLM), incluyendo instrucciones de usuario codificadas en *prompts* almacenados en `data/user_info_para.json`.
- Selección de muestras ricas en preferencia mediante las métricas CCM y PDM, con combinación parametrizable por alfa.
- Entrenamiento y fusión de pools de adaptadores LoRA con criterios de similitud de Fisher y selección de cohortes por relevancia/diversidad.
- Extracción de *embeddings* y cálculo de métricas internas a través de `utils.py` (pérdidas, métricas y utilidades de configuración).
- No se documentan en la información disponible capacidades de *tool calling*, razonamiento multi-paso, agentes, audio ni *thinking mode*.

## Casos de uso

- **Curaduría fotográfica personalizada**: dado el conjunto de imágenes de un fotógrafo o usuario, PRAC puntúa cada imagen según su perfil de preferencia y permite ordenarlas o filtrarlas; el modo `--explain` añade una justificación en lenguaje natural que el usuario puede revisar.
- **Edición y revelado asistido**: integrado en una herramienta de retoque, el modelo evalúa variantes de una misma foto (distintos ajustes de color, recorte o filtro) y clasifica cuáles se acercan más al gusto declarado del usuario, actuando como función de recompensa para sugerir ajustes.
- **Evaluación de pipelines de generación de imágenes**: usar PRAC como evaluador estético condicionado al usuario en un *pipeline* texto-a-imagen, de modo que la selección de la mejor muestra entre N generaciones no dependa de una métrica estética media sino del perfil concreto del solicitante.
- **Repositorios de imágenes y bancos de recursos**: ordenación personalizada de bibliotecas grandes (stock, archivo histórico, catálogo de producto) sustituyendo un *ranking* global por uno adaptado a cada cliente o segmento, usando la fusión de cohortes para no entrenar un adaptador por usuario desde cero.
- **Investigación en estética computacional**: reproducción de los experimentos del paper ACM MM 2026 con las configuraciones de `configs/giaa_train_config`, `configs/preferselect_config` y `configs/prefermerge_config`, y ablaciones sobre los pesos alfa de CCM/PDM.
- **Anotación asistida de datasets de preferencia**: preetiquetar pares o conjuntos de imágenes con puntuaciones estéticas por usuario para acelerar la recogida de anotaciones humanas, revisando después únicamente los casos de mayor incertidumbre en la distribución predicha.
- **Selección de portadas y miniaturas**: elegir la imagen de cabecera de un artículo o vídeo en función del perfil estético del segmento de audiencia, combinando varios adaptadores de cohorte mediante PreferMerge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README únicamente referencia la aceptación del artículo en ACM MM 2026 (presentación oral) y el preprint arXiv:2607.15752; no se incluyen tablas de métricas ni comparaciones numéricas con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 14-16 GB en precisión bf16/fp16 para el *backbone* de 7B, más el pequeño sobrecoste de los adaptadores LoRA (estimación basada en el tamaño del *checkpoint*; no confirmada en la información disponible).
- Con cuantización de 4 bits, la estimación razonable es de 5-7 GB de VRAM, aunque el repositorio no documenta ni valida ningún flujo de cuantización concreto.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento de los adaptadores y barridos de ablación; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia y *fine-tuning* LoRA en precisión completa.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más (RTX 4080, 4090, A4000 16 GB) para inferencia; para entrenamiento LoRA conviene 24 GB o más.
- Opciones de despliegue: el repositorio proporciona `demo_inference.py` sobre PyTorch 2.4.1 + CUDA 12.1 con el *checkpoint* mPLUG-Owl3-7B en local. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y al ser un VLM con adaptadores propios la integración requeriría trabajo adicional.
- Latencia y throughput: no disponibles.
- Almacenamiento: es necesario descargar por separado el *checkpoint* base mPLUG-Owl3 (varios GB), el adaptador preentrenado desde Baidu Netdisk y el dataset PARA con sus imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRAC (este repo) | 7B (backbone) + LoRA | No disponible | Evaluación estética personalizada por usuario sobre VLM | MIT para el código; pesos del backbone con licencia propia | Código y adaptadores vía Baidu Netdisk; pesos no alojados en HuggingFace |
| mPLUG-Owl3-7B-241101 | 7B | No confirmado en la información disponible | VLM generalista imagen-texto | No indicada aquí; consultar su model card | HuggingFace (`mPLUG/mPLUG-Owl3-7B-241101`) |
| VLM generalistas de ~7B (Qwen2.5-VL-7B, LLaVA-OneVision-7B) | ~7-8B | Amplio (documentado en sus respectivas model cards) | Descripción, VQA, OCR, razonamiento visual | Apache 2.0 en ambos casos | HuggingFace, con soporte en vLLM y otros servidores |
| Predictores estéticos tipo NIMA / LAION-Aesthetics | Decenas de millones | No aplica (solo imagen) | Puntuación estética media, sin personalización | Variable según implementación | Públicos, ligeros, aptos para CPU |

La diferencia clave frente a los VLM generalistas es que PRAC no compite en capacidades generales: aporta la capa de personalización (selección de muestras y fusión de cohortes) y una salida calibrada como distribución estética. Frente a los predictores estéticos clásicos, la diferencia es el coste (7B frente a decenas de millones de parámetros) y la posibilidad de condicionar el juicio a un perfil de usuario concreto.

## Limitaciones y advertencias

- El repositorio de HuggingFace ocupa 0.0 GB: no contiene los pesos. Hay que descargar el *checkpoint* base mPLUG-Owl3 por un lado y los adaptadores preentrenados desde Baidu Netdisk (contraseña en el README), lo que añade fricción y dependencia de un servicio externo.
- La información disponible no incluye métricas, ablaciones ni comparaciones numéricas; no es posible evaluar la calidad del método sin leer el preprint.
- No se declaran idiomas soportados ni *pipeline* en los metadatos de HuggingFace; el comportamiento multilingüe depende por completo del *backbone* mPLUG-Owl3.
- Sesgos: los juicios estéticos personales están condicionados por el dataset PARA (anotaciones de un grupo demográfico y cultural concreto); es esperable un sesgo hacia las convenciones visuales de esa población, aunque no se documenta explícitamente.
- Riesgo de alucinación en el modo `--explain`: las justificaciones generadas por el VLM pueden no reflejar los factores que realmente determinan la puntuación predicha, al ser texto generado y no una explicación mecanística.
- Licencia: el código se declara MIT en el README, pero la licencia del *checkpoint* base y de los adaptadores preentrenados no está indicada; verificar antes de cualquier uso comercial. El dataset PARA tiene sus propias condiciones.
- Es material de investigación, no un servicio listo para producción: no hay API, ni soporte de servidores de inferencia estándar, ni tests de robustez.
- El flujo exige pasos manuales (generación de etiquetas discretizadas con `prepare_giaa_labels.py`, colocación del *checkpoint* en `models/mPLUG-Owl3-7B`, rutas en los YAML) que deben replicarse exactamente para obtener resultados comparables.
- Las fechas del repositorio y del paper (2026) deben contrastarse con la versión publicada del preprint antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yzc002/PRAC
- Preprint arXiv: http://arxiv.org/abs/2607.15752
- Página del proyecto: https://yzc-ippl.github.io/PRAC/
- Repositorio GitHub: https://github.com/yzc-ippl/PRAC
- Checkpoint base mPLUG-Owl3-7B-241101: https://huggingface.co/mPLUG/mPLUG-Owl3-7B-241101
- Adaptadores preentrenados (Baidu Netdisk, contraseña `3rd3`): https://pan.baidu.com/s/1pK-BDCCJLWci0tawbfYrog?pwd=3rd3
- Dataset PARA: https://web.xidian.edu.cn/ldli/en/dataset.html
