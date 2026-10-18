# vlmurthylab/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-form

## Resumen

`1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-form` es un codificador Transformer de tipo Vision Transformer adaptado a señales 1D (1D-ViT) con 92.704.019 parámetros, especializado en electrocardiograma (ECG). El identificador del modelo describe su ciclo de entrenamiento: preentrenamiento autosupervisado (SSL) sobre ECGs de MIMIC y posterior ajuste fino sobre PTB-XL para la tarea de declaraciones morfológicas ("form"). Según la model card, es un espejo sin modificaciones del checkpoint original publicado por 4dm-labs, y acompaña al proyecto ECGFlow (Moody JB, et al., NEJM AI 2025).

No es un modelo de lenguaje: no genera texto, no soporta tool calling ni conversación. Es un extractor de representaciones y clasificador de señales fisiológicas, pensado para investigación en cardiología computacional y para integrarse como encoder en pipelines de análisis de ECG.

Su relevancia práctica es doble: por un lado, ofrece un backbone preentrenado a gran escala listo para *fine-tuning* en tareas de ECG; por otro, su licencia Apache-2.0 y su tamaño contenido (0,4 GB de repositorio) permiten reproducir experimentos y desplegarlo en hardware modesto. La contrapartida es una documentación muy escasa: la model card no incluye métricas, detalles de preprocesado ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer 1D (1D-ViT, según el identificador "1dvit_base"); sin confirmar en la información disponible |
| Parámetros totales | 92.704.019 (92,7 M), dato real de los safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El identificador incluye "5000" y "patch50", compatible con ventanas de 5000 muestras y parches de 50 (inferencia, no confirmada) |
| Tipos de cuantización | No disponible. Solo se distribuyen pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | No aplica: el modelo opera sobre señales de ECG, no sobre texto |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,4 GB) |
| Tamaño de parche | 50 muestras (según el identificador "patch50") |
| Tarea de ajuste fino | Clasificación de declaraciones morfológicas ("form") de PTB-XL |
| Preentrenamiento | Autosupervisado (SSL) sobre MIMIC, según el identificador "ssl_mimic" |
| Repositorio original | 4dm-labs/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-form (este es un espejo) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer de tipo ViT trasladado al dominio de la señal: la serie temporal 1D se divide en parches de tamaño fijo (50 muestras según el identificador) que se proyectan linealmente en tokens, sobre los que se aplica autoatención estándar. Con 92,7 M de parámetros, el tamaño encaja con una configuración "base" de ViT (dimensión de embedding en torno a 768 y una docena de capas, aunque el desglose exacto no está documentado). El nombre del checkpoint indica además una ventana de 5000 muestras, lo que a 500 Hz corresponde a 10 segundos de registro, la duración habitual de un ECG de 12 derivaciones.

El entrenamiento se describe únicamente a través del identificador: una fase de preentrenamiento autosupervisado sobre MIMIC (probablemente MIMIC-IV-ECG) y una fase de ajuste supervisado sobre PTB-XL para las etiquetas de morfología. No se documentan en la información disponible el número de tokens o registros vistos, la composición del corpus, la función de pérdida del preentrenamiento (enmascarado, contrastivo u otra), ni si hubo etapas de refinamiento adicionales. Tampoco se detallan el esquema de normalización de la señal, el orden de las derivaciones ni el tratamiento de la frecuencia de muestreo, aspectos críticos para reproducir el *pipeline*. El checkpoint forma parte del ecosistema ECGFlow, cuyo código y descripción se remiten al repositorio de GitHub del autor original.

## Capacidades

- Codificación de señales de ECG en representaciones vectoriales densas, reutilizables como *features* para clasificación, recuperación o agrupamiento.
- Clasificación de declaraciones morfológicas del vocabulario "form" de PTB-XL (ajuste fino específico de este checkpoint).
- Extracción de *embeddings* por registro o por ventana temporal, útil para análisis exploratorio de cohortes.
- Aprendizaje por transferencia: el backbone preentrenado puede reajustarse para nuevas tareas con menos datos etiquetados.
- Inferencia por lotes sobre grandes volúmenes de registros gracias al tamaño reducido del modelo.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso, agentes ni planificación.
- No procesa texto, imágenes naturales ni audio; su dominio es la señal fisiológica 1D.
- Sin capacidades multilingües (no aplica).

## Casos de uso

- **Cribado morfológico en cohortes de investigación:** aplicar el checkpoint directamente sobre registros de 10 s para obtener probabilidades de declaraciones "form" y estudiar su prevalencia en una población concreta, con la ventaja de que el modelo ya está ajustado para ese espacio de etiquetas.
- **Extracción de *features* para modelos clásicos:** usar la salida del encoder como entrada de un clasificador ligero (regresión logística, XGBoost) en tareas donde no hay datos suficientes para reajustar el Transformer completo; 92,7 M de parámetros permiten generar *embeddings* de miles de registros en una sola GPU de consumo.
- **Búsqueda y agrupamiento de ECGs:** indexar los *embeddings* de una base de datos hospitalaria para recuperar registros similares por similitud vectorial, lo que facilita la revisión manual de casos raros o la construcción de subconjuntos homogéneos.
- **Punto de partida para *fine-tuning* supervisado:** reentrenar la cabeza de clasificación sobre un conjunto local etiquetado (por ejemplo, arritmias o hipertrofia) aprovechando el preentrenamiento SSL sobre MIMIC, lo que reduce la necesidad de datos anotados.
- **Línea base reproducible en artículos de cardiología computacional:** comparar nuevos métodos contra un backbone público, con licencia permisiva y pesos descargables, sin necesidad de reimplementar el preentrenamiento.
- **Investigación sobre modelos generativos de ECG:** emplear el encoder como componente de representación en trabajos que acompañan a ECGFlow, siempre que se verifique en el repositorio del proyecto cómo se integra exactamente.
- **Validación de *pipelines* de preprocesado:** al ser un modelo pequeño y rápido, sirve como banco de pruebas para comprobar que la normalización, el remuestreo y el troceado de señal son coherentes antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es un espejo mínimo que no incluye métricas de PTB-XL (macro-AUC, F1 por clase), ni detalles del conjunto de validación o test, ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para pesos:** unos 371 MB en fp32, 185 MB en bf16/fp16 y 93 MB en int8. El repositorio ocupa 0,4 GB, coherente con pesos en fp32 más metadatos.
- **Memoria de activaciones:** con ventanas de 5000 muestras y parches de 50 (del orden de 100 tokens por derivación), el coste de activaciones es muy inferior al de un Transformer de texto de tamaño comparable; un lote de decenas de registros cabe holgadamente.
- **GPU recomendadas:** cualquier GPU con 4 GB o más de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4090). No requiere A100 ni H100; estas solo tendrían sentido para paralelizar grandes barridos de inferencia.
- **CPU:** la inferencia en CPU es viable para lotes pequeños y para procesos por lotes nocturnos, dado el tamaño del modelo.
- **Opciones de despliegue:** PyTorch nativo o `transformers` (requiere comprobar si el repositorio incluye código propio y, por tanto, `trust_remote_code=True`); exportación a ONNX o TorchScript para servir con ONNX Runtime. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo autoregresivo de texto.
- **Latencia y throughput:** no disponibles. No se han publicado mediciones y el entorno de referencia (GPU, tamaño de lote, longitud de señal) no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-form (este) | 92,7 M | Ventana de 5000 muestras, parches de 50 (según identificador) | Clasificación "form" de PTB-XL | Apache-2.0 | Hugging Face |
| xresnet1d101 (Strodthoff et al., referencia PTB-XL) | No disponible en esta ficha | Registros PTB-XL remuestreados (habitualmente 100 Hz) | Clasificación multietiqueta PTB-XL | Código abierto; consultar el repositorio de referencia | Repositorio académico |
| ECG-FM (modelo fundacional de ECG basado en ViT) | No disponible en esta ficha | Registros de 12 derivaciones | *Fine-tuning* en múltiples tareas de ECG | No disponible en esta ficha; verificar antes de uso comercial | Publicación y pesos asociados |
| Otros checkpoints de la familia 1dvit de 4dm-labs | No disponible | Misma familia de preprocesado | Otras cabezas o conjuntos de etiquetas | Apache-2.0 (según este repositorio) | Hugging Face (verificar) |

La comparación debe tomarse con cautela: los datos de los modelos alternativos no están verificados en la información disponible y las cifras de rendimiento no se han publicado para este checkpoint, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- **Documentación mínima:** la model card es un espejo con dos párrafos; no hay métricas, detalles de preprocesado, ni instrucciones de uso. Cualquier integración exige leer el código del repositorio del proyecto.
- **Riesgo de alucinación en sentido amplio:** al ser un clasificador, puede producir predicciones con alta confianza sobre señales fuera de distribución (pediatría, dispositivos portátiles, derivaciones únicas, ritmos con artefacto) sin señalizar incertidumbre.
- **Dependencia crítica del preprocesado:** si la frecuencia de muestreo, la normalización por derivación, el orden de las derivaciones o la longitud de ventana no coinciden con las del entrenamiento, el rendimiento puede degradarse sin que aparezca ningún error explícito.
- **Sesgo de población:** MIMIC y PTB-XL proceden de entornos hospitalarios distintos (EE. UU. y Alemania, respectivamente) y de poblaciones adultas con indicación clínica de ECG; la generalización a otras cohortes, países o grupos de edad no está documentada.
- **Espacio de etiquetas restringido:** el ajuste fino cubre las declaraciones morfológicas de PTB-XL, no el diagnóstico completo ni la totalidad de las anormalidades electrocardiográficas.
- **No es un producto sanitario:** no hay validación clínica, marcado CE ni aprobación regulatoria asociada a este checkpoint; su uso en decisiones sobre pacientes no está respaldado por la información disponible.
- **Licencia:** Apache-2.0 permite uso comercial y modificaciones, pero se distribuye sin garantías y sin cláusula de indemnización; conviene verificar la procedencia del repositorio original antes de integrarlo en un producto.
- **Validación comunitaria nula:** 0 descargas y 0 *likes* en el momento de los datos; el espejo no aporta evidencia independiente de calidad.
- **Trazabilidad temporal:** las fechas de creación y actualización del repositorio son de octubre de 2026; conviene comprobar si el checkpoint original ha recibido revisiones posteriores.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/vlmurthylab/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-form
- Modelo original: https://huggingface.co/4dm-labs/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-form
- Organización original en Hugging Face: https://huggingface.co/4dm-labs
- Perfil del autor del espejo: https://huggingface.co/vlmurthylab
- Código del proyecto ECGFlow (original): https://github.com/4dm-labs/ecgflow
- Repositorio del espejo: https://github.com/vlmurthylab/ecgflow
- Artículo asociado: Moody JB, et al. NEJM AI 2025; https://doi.org/10.1056/AIoa2500164
