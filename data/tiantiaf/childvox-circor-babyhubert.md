# tiantiaf/childvox-circor-babyhubert

## Resumen

El modelo `tiantiaf/childvox-circor-babyhubert` es un clasificador de soplos cardíacos (murmullos) en fonocardiogramas pediátricos, desarrollado por Tiantian Feng y colaboradores de la Universidad del Sur de California (USC) como parte del benchmark ChildVox, aceptado en EMNLP 2026. Se trata de un fine-tuning del modelo BabyHuBERT sobre el dataset CirCor, que contiene grabaciones de auscultación cardíaca de 1568 sujetos de entre 0 y 21 años, recogidas en cuatro ubicaciones de auscultación estándar. El modelo clasifica cada segmento de audio en tres categorías: soplo ausente, presente o desconocido.

La arquitectura subyacente es BabyHuBERT, una extensión del framework HuBERT adaptada al audio infantil multilingüe de larga duración, pre-entrenada de forma auto-supervisada a partir de características WavLM-base-plus. El modelo acepta segmentos de audio de 10 segundos a 16 kHz en mono (las grabaciones originales de 8 kHz se sobremuestrean) y devuelve logits de clasificación y embeddings. El repositorio pesa 1,9 GB y los pesos están en formato safetensors. La licencia es OpenRAIL, con restricciones explícitas de uso no comercial y no clínico.

Este modelo es relevante para la investigación en procesamiento de sonidos fisiológicos pediátricos, ya que permite automatizar la detección de soplos cardíacos en entornos de investigación, siempre bajo supervisión humana y con las debidas aprobaciones éticas. No está diseñado para diagnóstico clínico ni para uso en producción sanitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BabyHuBERT (basada en HuBERT, pre-entrenada con WavLM-base-plus) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (entrada fija de 10 segundos a 16 kHz, 160 000 muestras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe (no se especifican idiomas concretos; el audio fisiológico no depende del idioma) |
| Licencia | OpenRAIL (openrail) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BabyHuBERT extiende el framework HuBERT de aprendizaje auto-supervisado para trabajar con grabaciones infantiles multilingües de larga duración. Sigue el mismo procedimiento de pre-entrenamiento en dos etapas que HuBERT, partiendo de características WavLM-base-plus, y está implementado sobre el ejemplo de HuBERT de torchaudio. El modelo base fue publicado por el equipo LAAC-LSCP y está disponible en GitHub.

El fine-tuning se realizó sobre el dataset CirCor, compuesto por fonocardiogramas digitales (digiScope) de 1568 sujetos de 0 a 21 años, grabados en cuatro ubicaciones de auscultación. Las grabaciones originales a 8 kHz se sobremuestrean a 16 kHz y se recortan a segmentos de 10 segundos. El modelo se entrena para clasificar cada segmento en tres etiquetas: "Absent", "Unknown" y "Present". No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning supervisado estándar. El repositorio ofrece cinco variantes del modelo correspondientes a diferentes folds de validación cruzada (fold_idx de 1 a 5).

## Capacidades

- Clasificación de soplos cardíacos en fonocardiogramas pediátricos con tres clases: ausente, desconocido y presente.
- Extracción de embeddings de audio (mediante `return_feature=True`), útiles para tareas de representación o transferencia.
- Soporte de múltiples folds de validación (1 a 5) para reproducibilidad en experimentos.
- Procesamiento de audio fisiológico de 10 segundos a 16 kHz en mono.
- No dispone de generación de texto, tool calling, capacidades de agente ni razonamiento multi-paso.
- No es un modelo multimodal; solo procesa audio.

## Casos de uso

- Investigación en fonocardiografía pediátrica: el modelo permite clasificar automáticamente grandes volúmenes de grabaciones de auscultación para estudiar la prevalencia de soplos en poblaciones infantiles, reduciendo el esfuerzo de anotación manual.
- Desarrollo de sistemas de screening asistido: puede integrarse en pipelines de investigación que precisen una primera detección de soplos, siempre con revisión humana posterior y sin uso diagnóstico.
- Análisis de señales fisiológicas en estudios longitudinales: al aceptar segmentos de 10 segundos, es adecuado para procesar grabaciones de larga duración divididas en ventanas, por ejemplo en estudios de desarrollo infantil.
- Educación médica: sirve como herramienta de demostración para que estudiantes de medicina aprendan a distinguir soplos cardíacos, comparando las predicciones del modelo con auscultaciones reales.
- Benchmarking de modelos de audio auto-supervisados: al estar basado en BabyHuBERT, puede utilizarse como referencia para evaluar la transferencia de representaciones de audio infantil a tareas fisiológicas.
- Investigación en procesamiento de audio pediátrico multilingüe: el modelo forma parte del benchmark ChildVox, que cubre desde sonidos fisiológicos hasta habla infantil, permitiendo comparar el rendimiento de distintos modelos en la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de accuracy o F1 sobre CirCor, ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- El tamaño del repositorio (1,9 GB) sugiere un modelo de tamaño medio, probablemente en el rango de cientos de millones de parámetros, pero este dato no está confirmado.
- El ejemplo de uso proporcionado por el autor utiliza CUDA si está disponible, lo que indica que se recomienda una GPU para inferencia eficiente.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI). Dado que es un modelo de audio basado en transformers, podría servirse con las herramientas estándar de Hugging Face (pipeline de audio-classification) o con librerías como torchaudio.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa. El modelo pertenece a la familia ChildVox, que incluye otros fine-tunings de BabyHuBERT, como `tiantiaf/childvox-babblecor-babyhubert` (clasificación de madurez del habla infantil). El modelo base BabyHuBERT está disponible en el repositorio LAAC-LSCP/BabyHuBERT. No se han publicado comparativas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Uso fuera de alcance explícito: no está permitido su uso en aplicaciones clínicas o de diagnóstico, evaluación del desarrollo individual sin revisión humana experta, vigilancia, aplicaciones invasivas de privacidad ni uso comercial.
- Los datos de audio infantil son altamente sensibles; se debe respetar la privacidad y el consentimiento de las familias, obtener aprobación de un comité de ética o IRB y cumplir la normativa local.
- El modelo solo clasifica en tres categorías, y la clase "Unknown" puede generar ambigüedad en la interpretación de los resultados.
- La entrada está limitada a segmentos de 10 segundos; grabaciones más largas deben segmentarse, lo que puede perder contexto temporal.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real y su comportamiento en poblaciones diferentes a la del dataset CirCor.
- Riesgo de sesgo: el dataset CirCor tiene un rango de edad de 0 a 21 años, pero no se especifica la distribución demográfica, lo que podría afectar la generalización.
- Al ser un modelo de clasificación, no genera texto, por lo que el riesgo de alucinación es bajo, pero la salida puede ser incorrecta en casos límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiantiaf/childvox-circor-babyhubert
- Repositorio GitHub de ChildVox: https://github.com/tiantiaf0627/childvox-release
- Paper de ChildVox (arXiv:2605.29257): https://arxiv.org/abs/2605.29257
- Colección ChildVox en Hugging Face: https://huggingface.co/collections/tiantiaf/childvox
- Repositorio GitHub de BabyHuBERT: https://github.com/LAAC-LSCP/BabyHuBERT
- Paper de BabyHuBERT (arXiv:2509.15001): https://huggingface.co/papers/2509.15001
