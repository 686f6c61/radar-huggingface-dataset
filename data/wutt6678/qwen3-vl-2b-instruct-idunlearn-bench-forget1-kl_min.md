# wutt6678/Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-KL_Min

## Resumen

Este repositorio contiene un adaptador LoRA de desaprendizaje (*unlearning*) publicado por el usuario wutt6678 con el identificador Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-KL_Min. No es un modelo completo, sino un conjunto de pesos PEFT (0,1 GB en safetensors) pensado para aplicarse sobre Qwen3-VL-2B-Instruct, el modelo multimodal de unos 2.000 millones de parámetros de la familia Qwen3-VL de Alibaba Cloud, capaz de procesar texto e imágenes.

Por la nomenclatura del identificador, el adaptador procede de un experimento de desaprendizaje sobre el subconjunto *forget1* de un banco de pruebas de identidades (IDUnlearn-Bench), empleando un objetivo de pérdida basado en la minimización de la divergencia KL (KL_Min). El modelo base declarado es outputs_3/mllmu_vanilla_qwen3-vl-2b, una ruta local que apunta a un ajuste "vanilla" sobre el benchmark MLLMU-Bench, de modo que la cadena de derivación es Qwen3-VL-2B-Instruct, ajuste vanilla sobre MLLMU-Bench y, finalmente, adaptador LoRA de desaprendizaje.

Su interés es fundamentalmente investigador: permite reproducir y estudiar técnicas de *machine unlearning* multimodal y comparar objetivos de olvido sobre una misma base. La model card es la plantilla vacía de Hugging Face, sin licencia, idiomas, datos de entrenamiento ni resultados de evaluación declarados, y el repositorio registra cero descargas y cero "likes", por lo que no existe validación externa de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal denso Qwen3-VL-2B-Instruct (entrada de texto e imagen) |
| Parámetros totales | No disponible. El adaptador ocupa 0,1 GB; los pesos del modelo base no se incluyen en el repositorio |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el adaptador; heredada del modelo base, cuyo valor concreto no se detalla en las fuentes consultadas |
| Tipos de cuantización | No disponible. El adaptador se distribuye en safetensors; la cuantización se aplicaría al modelo base (4 u 8 bits) antes de fusionar el LoRA |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) en formato PEFT, generado con PEFT 0.19.1 y almacenado en safetensors. Al estar definido como `base_model:adapter:outputs_3/mllmu_vanilla_qwen3-vl-2b`, se aplica sobre un ajuste previo de Qwen3-VL-2B-Instruct, que aporta la arquitectura subyacente: un transformer denso multimodal con torre de visión, entrenado para comprensión y generación de texto, percepción visual, razonamiento espacial y comprensión de vídeo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha de LoRA, la tasa de aprendizaje ni el hardware empleado. Por el nombre del repositorio, el entrenamiento corresponde a una ejecución de desaprendizaje sobre el conjunto *forget1* con un objetivo KL_Min, técnica habitual para aproximar la distribución del modelo original restringiendo la información que se desea olvidar; el resto de detalles del procedimiento son "More Information Needed" en la model card.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3-VL-2B-Instruct, no verificadas en el adaptador.
- Comprensión de imágenes y respuesta a preguntas visuales (VQA), descripción de imágenes y razonamiento sobre contenido visual, según las capacidades declaradas para la familia Qwen3-VL.
- Comprensión de relaciones espaciales y dinámicas de vídeo, según la documentación de la familia Qwen3-VL.
- Interacción con agentes y *tool calling* / *function calling*: atribuido a la familia Qwen3-VL, no documentado específicamente para este adaptador.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidad especial del adaptador: supresión selectiva de información de identidad correspondiente al conjunto *forget1*, con objetivo KL_Min. El grado de olvido alcanzado no está documentado ni evaluado.
- No se declara soporte de audio, ni modo de pensamiento explícito, ni otras capacidades adicionales para este artefacto.

## Casos de uso

- Investigación en *machine unlearning* multimodal: aplicar el adaptador sobre Qwen3-VL-2B-Instruct para reproducir el experimento de olvido del conjunto *forget1* y medir la degradación de la información objetivo.
- Comparación de objetivos de olvido: enfrentar este adaptador (KL_Min) con otros adaptadores del mismo autor o de la literatura para evaluar qué objetivo preserva mejor la utilidad general del modelo.
- Auditoría de privacidad: comprobar si la información de identidad pretendidamente olvidada sigue siendo recuperable mediante *prompting* adversario o ataques de inversión, algo relevante antes de dar por válido un proceso de desaprendizaje.
- Evaluación de cumplimiento y derecho al olvido: servir de material de estudio para flujos en los que se exige eliminar datos personales de un modelo ya entrenado, en el contexto del RGPD.
- Reproducibilidad académica: al estar construido sobre MLLMU-Bench y una base "vanilla" concreta, permite replicar resultados y comparar contra el modelo sin adaptador.
- Docencia y divulgación: ilustrar de forma práctica las diferencias entre ajuste fino, *fine-tuning* y desaprendizaje sobre un modelo de visión y lenguaje de solo 2.000 millones de parámetros.
- Punto de partida para experimentos propios: usar el adaptador como inicialización y continuar el entrenamiento de olvido con otros conjuntos *forget* o con objetivos alternativos (por ejemplo, gradiente ascendente o regularización).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación cumplimentada y la búsqueda web no aporta métricas del adaptador. En el contexto del benchmark de origen (MLLMU-Bench) lo habitual sería reportar métricas de utilidad del modelo y de calidad del olvido, pero no se dispone de sus valores para este repositorio.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,1 GB, pero requiere cargar el modelo base Qwen3-VL-2B-Instruct para funcionar.
- VRAM estimada para el modelo base de aproximadamente 2.000 millones de parámetros: en torno a 5-6 GB en FP16/BF16 con la torre de visión y los estados de activación; aproximadamente 2-3 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para despliegue por lotes de gran volumen, A100 o H100.
- Cabe en GPU de consumo: sí, en modelos con al menos 8 GB de VRAM en FP16 y en tarjetas de 4-6 GB si se cuantiza el base.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI con LoRA, fusión del adaptador y posterior conversión a GGUF con llama.cpp u Ollama, y despliegue en dispositivos *edge* mediante Qualcomm AI Hub para la variante 2B.
- Latencia y *throughput*: no disponibles. No se han publicado mediciones para este adaptador ni para esta combinación concreta de base y LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wutt6678/Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-KL_Min | Adaptador LoRA de desaprendizaje | No disponible (0,1 GB de adaptador) | No disponible | No disponible | No disponible | Hugging Face, 0 descargas |
| Qwen3-VL-2B-Instruct | Modelo multimodal completo | ~2B | No disponible en las fuentes consultadas | No disponible en las fuentes consultadas | No disponible en las fuentes consultadas | Hugging Face, ModelScope, GitHub, Ollama, Qualcomm AI Hub |
| outputs_3/mllmu_vanilla_qwen3-vl-2b | Ajuste vanilla sobre MLLMU-Bench (base declarada) | ~2B | No disponible | No disponible | No disponible | No accesible públicamente como enlace del Hub |

No se dispone de datos comparativos de rendimiento entre estas variantes. Otros adaptadores de desaprendizaje comparables de la misma categoría: no disponible.

## Limitaciones y advertencias

- Model card vacía: todos los campos relevantes (autoría, datos de entrenamiento, hiperparámetros, evaluación, huella de carbono) figuran como "More Information Needed". No es posible verificar el procedimiento seguido.
- Licencia sin declarar: no se especifica licencia alguna, por lo que el uso comercial queda en un limbo legal pese a que el modelo base Qwen3-VL se distribuye públicamente.
- Modelo base no resoluble desde el Hub: outputs_3/mllmu_vanilla_qwen3-vl-2b es una ruta local, no un identificador público, lo que dificulta la reproducción exacta del adaptador.
- Olvido no verificado: no hay evidencia de que la información del conjunto *forget1* se haya eliminado de forma efectiva; el desaprendizaje puede ser superficial y recuperable mediante *prompting* dirigido.
- Riesgo de degradación de capacidades: los métodos de olvido basados en divergencia KL pueden deteriorar la utilidad general, la coherencia y el conocimiento factual del modelo base; no se han publicado métricas que cuantifiquen ese daño.
- Riesgo de alucinación: inherente a los modelos de 2.000 millones de parámetros, y potencialmente agravado por el ajuste de olvido.
- Idiomas y contexto no declarados: no se puede garantizar un comportamiento correcto fuera del inglés ni más allá de la ventana de contexto del modelo base.
- Sin validación de la comunidad: cero descargas y cero "likes"; no hay informes independientes de uso en producción.
- Uso responsable: un adaptador de desaprendizaje manipulado podría emplearse para restaurar o reforzar información sensible en lugar de eliminarla; conviene tratarlo como material de investigación y no como artefacto listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wutt6678/Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-KL_Min
- Colección Qwen3-VL en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-vl
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Qwen3-VL-2B-Instruct en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-VL-2B-Instruct
- Qwen3-VL 2B Instruct en Ollama: https://ollama.com/library/qwen3-vl:2b-instruct
- Qwen3-VL-2B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/iot/models/qwen3_vl_2b_instruct
- Referencia metodológica citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automático: https://mlco2.github.io/impact#compute
