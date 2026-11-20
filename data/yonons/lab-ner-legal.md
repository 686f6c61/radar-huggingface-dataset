# yonons/lab-ner-legal

## Resumen

lab-ner-legal es un modelo de reconocimiento de entidades nombradas (NER) especializado en dominio legal, desarrollado por el usuario yonons. Se construye mediante fine-tuning del checkpoint bert-base-uncased sobre un conjunto de datos denominado contracts-v2, con el objetivo de identificar entidades en textos contractuales y legales. Su proposito declarado es asistir a revisores humanos, que mantienen la decision final sobre las extracciones realizadas por el modelo.

El modelo parte de la arquitectura BERT base, un transformer encoder de aproximadamente 110 millones de parametros con una longitud de contexto tipica de 512 tokens. El fine-tuning se realizo durante 3 epocas con una tasa de aprendizaje de 1e-5 y un tamano de lote de 64. La model card reporta metricas sobre un conjunto anotado como gold-annotated: accuracy de 0.796, precision de 0.785 y recall de 0.873, lo que sugiere una orientacion hacia la cobertura (recall alto) a costa de una precision moderada.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeno, entrenado exclusivamente con datos en ingles, sin licencia declarada y con cero descargas en el momento de la consulta. Es util como referencia para pipelines de extraccion de entidades en contratos en ingles, pero no debe considerarse un modelo de proposito general ni un sistema listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) |
| Parametros totales | Aproximadamente 110 millones (bert-base-uncased) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (valor tipico de bert-base-uncased; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles unicamente (segun limitaciones declaradas) |
| Licencia | No disponible |
| Formato de pesos | No disponible (probablemente safetensors o PyTorch binario; no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en bert-base-uncased, un transformer encoder de 12 capas con atencion bidireccional y aproximadamente 110 millones de parametros. Sobre esta base se aplica una cabeza de clasificacion token a token para la tarea de NER. El entrenamiento consistio en 3 epocas con una tasa de aprendizaje de 1e-5 y un tamano de lote de 64 sobre el dataset contracts-v2, cuyo contenido, tamano y composicion no se detallan en la model card. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, lo cual es esperable en un modelo discriminativo de este tipo.

El changelog indica tres hitos: una version inicial el 2025-05-14, un reentrenamiento sobre datos limpiados el 2025-08-15 y una actualizacion de la tabla de evaluacion el 2025-09-24. No se especifica si el conjunto de evaluacion gold-annotated es independiente del conjunto de entrenamiento, ni se detalla la taxonomia de entidades utilizada. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal, que no aplican a esta arquitectura.

## Capacidades

- Reconocimiento de entidades nombradas en textos legales y contractuales en ingles.
- Extraccion token a token de entidades segun una taxonomia no especificada en la model card.
- Clasificacion de secuencias con contexto de hasta 512 tokens (limitacion propia de BERT base).
- Uso previsto como herramienta de asistencia a revisores humanos, no como sistema autonomo.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue; el entrenamiento es exclusivamente en ingles.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Revision asistida de contratos: el modelo puede pre-etiquetar entidades como partes, fechas, importes o clausulas en contratos en ingles, y un revisor humano valida o corrige cada extraccion antes de incorporarla al expediente.
- Extraccion de metadatos en gestion documental: integrado en un pipeline de ingesta, permite poblar campos estructurados (por ejemplo, nombres de partes o referencias) a partir de PDFs contractuales en ingles, con validacion posterior.
- Triaje de clausulas en departamentos legales: al detectar entidades relevantes, ayuda a priorizar documentos que requieren revision manual, reduciendo el tiempo de clasificacion inicial.
- Enriquecimiento de bases de datos de contratos: el modelo puede anotar registros existentes con entidades detectadas para facilitar busquedas y filtrados posteriores.
- Preprocesamiento para modelos generativos: las entidades extraidas pueden alimentar un segundo modelo o un sistema de resumen que genere fichas de contrato, siempre con supervision humana.
- Control de calidad de anotaciones: dado su recall relativamente alto (0.873), puede usarse como detector de anotaciones omitidas en conjuntos ya etiquetados, marcando candidatos para revision.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto gold-annotated:

| Metrica | Valor |
|---|---|
| Accuracy | 0.796 |
| Precision | 0.785 |
| Recall | 0.873 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5 GB en fp32 para los pesos del modelo; en la practica, menos de 2 GB incluyendo overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior cubre el caso con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para cargas de baja concurrencia.
- Opciones de despliegue: Hugging Face Transformers, ONNX Runtime, TorchScript; tambien es posible servirlo con Text Generation Inference no aplica (es un modelo encoder), pero si con soluciones de inferencia de clasificacion como un endpoint de Transformers o un servidor FastAPI propio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en una GPU moderna se espera latencia de milisegundos por secuencia de 512 tokens, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yonons/lab-ner-legal | ~110 M (BERT base) | 512 tokens (tipico) | No disponible | Hugging Face (0 descargas) |
| bert-base-uncased | ~110 M | 512 tokens | Apache 2.0 | Ampliamente disponible |
| Modelos NER legales especializados | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en ingles; no es adecuado para textos en castellano u otros idiomas.
- Licencia no declarada: no se puede asumir uso comercial permitido sin consultar al autor.
- El conjunto de evaluacion gold-annotated no se describe en detalle; se desconoce si es independiente del entrenamiento, lo que limita la confianza en las metricas.
- Precision moderada (0.785): puede generar falsos positivos que incrementen la carga de revision humana.
- No se documenta la taxonomia de entidades ni el tamano del dataset contracts-v2, lo que dificulta evaluar su cobertura.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de extracciones incorrectas o incompletas en textos fuera del dominio contractual.
- Contexto limitado a 512 tokens: contratos largos requieren segmentacion previa, con posible perdida de entidades en los limites de fragmento.
- Sin descargas ni validacion externa conocida: no hay evidencia de uso en produccion por terceros.
- Uso previsto limitado a asistencia a revisores; no debe emplearse como sistema de decision automatica.

## Enlaces

- Hugging Face: https://huggingface.co/yonons/lab-ner-legal
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
