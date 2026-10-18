# vlmurthylab/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-rhythm

## Resumen

`1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-rhythm` es un modelo de visión 1D (1D Vision Transformer, ViT) para el análisis de señales electrocardiográficas (ECG), desarrollado originalmente por 4dm-labs y redistribuido en este repositorio como espejo sin modificaciones bajo licencia Apache-2.0. No es un modelo de lenguaje: su entrada y salida son señales temporales y etiquetas de ritmo cardíaco. Forma parte del ecosistema ECGFlow, presentado por Moody JB et al. en NEJM AI 2025 (doi:10.1056/AIoa2500164).

Según la nomenclatura del identificador, se trata de un ViT de tamaño base (~92,7 millones de parámetros) con parches de 50 muestras y una ventana de señal de 5000 muestras, preentrenado de forma autosupervisada (SSL) sobre datos de MIMIC y afinado posteriormente sobre la tarea de clasificación de ritmo del conjunto PTB-XL. El repositorio solo incluye pesos en `safetensors` (0,4 GB) y una model card mínima.

Su relevancia actual es la de servir como componente reutilizable para tareas de clasificación y extracción de representaciones sobre ECG dentro de pipelines de investigación clínica, con un coste computacional muy bajo (menos de 100 M de parámetros) que permite inferencia en CPU y en GPU de consumo. Al ser un espejo, conviene remitirse al repositorio original para detalles de entrenamiento y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 1D Vision Transformer (ViT) con parches de 50 muestras, según el identificador del modelo; no confirmado en la model card |
| Parametros totales | 92.698.412 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 5000 muestras de señal (según identificador, ~10 s a 500 Hz); no expresado en tokens ni confirmado en la model card |
| Tipos de cuantizacion | solo pesos originales en safetensors; no se distribuyen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no aplica (modelo de señal ECG, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde, por el identificador, a un Vision Transformer adaptado a señales unidimensionales: la señal ECG se divide en parches de 50 muestras que se proyectan a una dimensión de embedding y se procesan con bloques de autoatención. El sufijo `base` indica el tamaño base del transformer (~92,7 M de parámetros), coherente con el recuento real de pesos. El sufijo `5000` sugiere una ventana de 5000 muestras, equivalente a unos 10 segundos a 500 Hz, aunque este extremo no se detalla en la model card.

El entrenamiento se realizó en dos fases según el identificador: preentrenamiento autosupervisado (`ssl`) sobre registros de MIMIC y ajuste fino supervisado (`ft`) sobre la tarea de ritmo de PTB-XL. La model card no aporta el volumen de tokens, la composición exacta del dataset, el uso de RLHF/DPO (no aplicable a este dominio) ni innovaciones técnicas adicionales. El modelo se distribuye como parte del framework ECGFlow, cuyo código y descripción están en el repositorio de GitHub asociado.

## Capacidades

- Clasificación de ritmo cardíaco sobre señales ECG, presumiblemente multietiqueta, tras el ajuste fino en PTB-XL.
- Extracción de embeddings de señal para tareas posteriores (búsqueda, agrupación, clasificación lineal con sonda).
- Procesamiento de ventanas de 5000 muestras, adecuado para registros de ~10 s a 500 Hz.
- Reutilización como backbone en pipelines de investigación del ecosistema ECGFlow.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica (entrada de señal, no de texto).
- Capacidades especiales (modo thinking, visión natural, audio): no disponibles; la "visión" aquí es 1D sobre señal temporal, no imágenes.

## Casos de uso

- Clasificación automática de ritmo en ECG de 12 derivaciones o derivación única: el modelo toma una ventana de señal de 5000 muestras y devuelve la etiqueta de ritmo, sirviendo como base para triaje previo a la revisión del cardiólogo.
- Triaje en urgencias y atención primaria: con ~93 M de parámetros, puede ejecutarse en CPU o en GPU de gama baja dentro de un puesto clínico, filtrando registros normales y priorizando los anómalos para lectura humana.
- Monitorización tipo Holter o wearable: la ventana de ~10 s encaja con la granularidad habitual de parches y relojes con ECG, permitiendo clasificación por segmentos y agregación posterior.
- Extracción de representaciones para investigación: los embeddings del backbone pueden alimentar modelos posteriores (regresión, clustering no supervisado, detección de outliers) sin reentrenar desde cero.
- Control de calidad de señal: el mismo backbone puede adaptarse para detectar ruido, artefactos o derivaciones mal colocadas antes del análisis diagnóstico.
- Reproducción de experimentos y benchmarking: al estar integrado en ECGFlow, sirve como punto de partida reproducible para comparar variantes de preentrenamiento SSL frente a entrenamiento desde cero.
- Docencia y prototipado rápido: el tamaño reducido y el formato safetensors facilitan su carga en cuadernos y entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (AUROC, F1, exactitud) sobre PTB-XL ni comparaciones con otros modelos; para datos de evaluación debe consultarse el artículo de ECGFlow (doi:10.1056/AIoa2500164) o el repositorio de código.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,37 GB en FP32, ~0,19 GB en FP16 y ~0,09 GB en INT8, solo para los pesos; el consumo real depende de la longitud de la ventana y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100). El modelo no requiere GPUs de datacenter.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es viable inferencia en tiempo real sobre CPU moderna para ventanas individuales, aunque el throughput exacto no está documentado.
- Opciones de despliegue: PyTorch nativo (carga de safetensors), exportación a ONNX Runtime o TorchScript para producción; vLLM, llama.cpp, Ollama y TGI no son aplicables (no es un modelo generativo de texto).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La model card no incluye métricas ni referencias a modelos alternativos de la misma categoría (por ejemplo, otros backbones ECG preentrenados con SSL). A continuación se recoge únicamente lo conocido de este modelo:

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmark |
|---|---|---|---|---|---|
| 1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-rhythm (este) | 92,7 M | 5000 muestras (según identificador) | Apache-2.0 | safetensors | no disponible |
| Alternativas ECG-SSL de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un espejo: el repositorio no es el original y puede no recibir actualizaciones; la fuente autoritativa es 4dm-labs.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- Sesgos potenciales derivados de los datos de preentrenamiento (MIMIC) y ajuste fino (PTB-XL): poblaciones, dispositivos de adquisición y centros concretos pueden no representar a otros entornos clínicos.
- Riesgo de falsos negativos en arritmias poco frecuentes por desbalance de clases en PTB-XL; el rendimiento por clase no está documentado.
- No es un dispositivo médico ni está certificado para uso clínico; cualquier despliegue asistencial requiere validación local y cumplimiento regulatorio.
- La licencia Apache-2.0 permite uso comercial, pero no exime de las obligaciones éticas y regulatorias del ámbito sanitario.
- La model card no documenta el preprocesado, la frecuencia de muestreo esperada ni el número exacto de clases de salida, lo que puede provocar errores de integración si no se replica el pipeline de ECGFlow.
- El tamaño del repo (0,4 GB) sugiere pesos en FP32; no se ofrecen variantes cuantizadas oficiales.

## Enlaces

- HuggingFace (este espejo): https://huggingface.co/vlmurthylab/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-rhythm
- HuggingFace (original, 4dm-labs): https://huggingface.co/4dm-labs/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-rhythm
- Repositorio de código ECGFlow (original): https://github.com/4dm-labs/ecgflow
- Repositorio de código ECGFlow (espejo): https://github.com/vlmurthylab/ecgflow
- Articulo de referencia: Moody JB, et al. NEJM AI 2025; doi:10.1056/AIoa2500164
