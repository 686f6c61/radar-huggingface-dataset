# TomMoeras/contragand-qwen3.5-4b-open

## Resumen

ContraGAND detector (open task, condición FT-MULTI) es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por TomMoeras como parte del trabajo de investigación *ContraGAND: Auditing and Repairing Gender Ambiguity Failures in LLMs with Neurosymbolic Contrastive Data Augmentation* (EMNLP 2026). El modelo lee una oración en inglés, identifica cada referente (rol, ocupación o relación) y lo clasifica como `masculine`, `feminine` o `ambiguous` según las pistas textuales presentes en la frase.

El adaptador se entrenó mediante destilación de conocimiento desde Gemma-4-31B-it sobre el split de entrenamiento de ContraGAND (11 684 registros, aproximadamente 2 referentes por oración), con las etiquetas corregidas a oro. En el conjunto de test auditado por humanos (1395 ejemplos) alcanza una precisión de 0,976 y una macro-F1 de 0,979, superando al profesor de 31B en modo zero-shot (0,952) con un octavo de los parámetros, y muy por encima del modelo base sin adaptar (0,242 en contexto). Es un artefacto de investigación centrado en la detección de ambigüedad de género, con licencia Apache 2.0 y orientado exclusivamente al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (transformador causal, multimodal) |
| Parametros totales | No disponible (adaptador LoRA, repo de 0,4 GB; modelo base 4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la documentacion del adaptador; el modelo base Qwen3.5-4B soporta contexto largo (el entrenamiento usó secuencias de 1024 tokens) |
| Tipos de cuantizacion | Adaptador en bfloat16; modelo base puede cargarse en 4-bit (bitsandbytes, QLoRA) o bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-4B, un modelo de lenguaje multimodal de 4 000 millones de parámetros con atención híbrida (según especificaciones del fabricante). El entrenamiento emplea QLoRA con cuantización nf4, rango r=64, alpha=128 y dropout 0,05 aplicado a todas las proyecciones lineales. Se usó una tasa de aprendizaje de 2e-5 con decaimiento coseno, 5 épocas con early stopping sobre la pérdida de validación, longitud de secuencia de 1024 tokens y 4 GPU A100-80GB mediante axolotl.

El proceso de destilación toma las enumeraciones multi-referente de Gemma-4-31B-it sobre el split de entrenamiento de ContraGAND y corrige la etiqueta del referente anotado con el valor dorado. El resultado es un adaptador que, dado un prompt de sistema específico y una oración, produce un JSON con la lista de referentes, su género, un nivel de confianza (1-5) y una breve justificación basada en evidencia textual.

## Capacidades

- Identificacion de todos los roles, ocupaciones o relaciones (referentes) presentes en una oracion en ingles.
- Clasificacion de cada referente en tres categorias: `masculine`, `feminine` o `ambiguous` (cuando no hay señal textual de genero).
- Salida estructurada en JSON con campos `referent`, `gender`, `confidence` y `reasoning`, lo que facilita su integracion en pipelines automaticos.
- Soporte de decodificacion greedy con `max_new_tokens=384`; no requiere modo thinking (desactivado en el chat template).
- Capacidad de detectar multiples referentes en una misma frase, listados en orden de aparicion.
- Entrenado especificamente para el analisis de ambiguedad de genero, con precision superior al profesor de 31B en la tarea open-task.

## Casos de uso

- Auditoria de sesgos de genero en textos generados por IA: el modelo puede analizar corpus de salidas de LLMs para identificar frases donde el genero de un referente queda ambiguo o se asume incorrectamente, ayudando a detectar patrones de sesgo.
- Correccion automatica de textos: integrado en un flujo de post-procesamiento, puede marcar referentes ambiguos y sugerir reformulaciones o aclaraciones, mejorando la claridad y neutralidad de documentos legales, tecnicos o cientificos.
- Evaluacion de sistemas de traduccion automatica: al analizar traducciones al ingles, puede detectar casos donde el genero del referente no es deducible, lo que indica posibles errores de transferencia desde lenguas con genero gramatical.
- Analisis de narrativas y personajes en literatura o guiones: util para estudios de representacion de genero en textos, permitiendo cuantificar la frecuencia de referentes masculinos, femeninos o ambiguos.
- Filtrado de contenido en plataformas de contratacion o redes sociales: puede identificar ofertas de empleo o publicaciones donde el genero de un rol quede implícito, ayudando a promover redaccion inclusiva.
- Investigacion en NLP sobre ambiguedad referencial: sirve como modelo de referencia para estudiar como los LLMs resuelven (o fallan en) la identificacion de genero, y para comparar con otros enfoques de deteccion de sesgo.

## Benchmarks y rendimiento

Se han publicado resultados del adaptador en el conjunto de test de ContraGAND (1395 ejemplos auditados por humanos). La tabla siguiente resume las metricas reportadas en la model card:

| Modelo | Precision (open-task) | Macro-F1 |
|---|---|---|
| ContraGAND detector (Qwen3.5-4B + LoRA) | 0,976 | 0,979 |
| Gemma-4-31B-it (profesor, zero-shot) | 0,952 | no disponible |
| Qwen3.5-4B base (in-context) | 0,242 | no disponible |

No se han publicado otros benchmarks generales (MMLU, HumanEval, etc.) para este adaptador especifico; los datos del modelo base Qwen3.5-4B (MMLU 58, HumanEval 55) provienen de fuentes externas y no son directamente comparables con la tarea de deteccion de ambiguedad.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,4 GB), pero requiere cargar el modelo base Qwen3.5-4B. Con cuantizacion 4-bit (bitsandbytes), la VRAM necesaria se estima en unos 3-4 GB, por lo que cabe en GPUs consumer como RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas.
- En bfloat16 (precisión completa), el modelo base ocupa aproximadamente 8 GB, por lo que tambien es viable en GPUs de 12 GB o superiores.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en 4-bit; para entrenamiento o fine-tuning adicional se requieren GPUs de 24 GB o mas (A100, H100, RTX 4090).
- Opciones de despliegue: al ser un adaptador PEFT, se puede usar con transformers + peft, vLLM (si soporta LoRA), o convertir a GGUF para llama.cpp/Ollama (aunque no se proporciona un archivo GGUF precompilado).
- Latencia y throughput: no se han publicado mediciones especificas. Dado el tamaño del modelo (4B) y la generacion de un JSON corto (max 384 tokens), se espera una latencia de decenas de milisegundos por oracion en GPU moderna.

## Comparativa con modelos similares

No existen muchos modelos publicos especializados en deteccion de ambiguedad de genero. La comparativa mas relevante es con el propio modelo base y con el profesor utilizado para la destilacion:

| Modelo | Parametros | Contexto | Precision (ContraGAND test) | Licencia |
|---|---|---|---|---|
| ContraGAND detector (Qwen3.5-4B + LoRA) | 4B + adaptador | largo (base) | 0,976 | Apache 2.0 |
| Qwen3.5-4B base | 4B | largo | 0,242 (in-context) | Apache 2.0 |
| Gemma-4-31B-it | 31B | largo | 0,952 (zero-shot) | Gemma license |

El adaptador ofrece una mejora sustancial sobre el base y supera al profesor mas grande en esta tarea especifica, con un coste computacional mucho menor.

## Limitaciones y advertencias

- Solo funciona en ingles; no se ha entrenado ni evaluado en otros idiomas.
- Las etiquetas se limitan a `masculine`, `feminine` y `ambiguous`; no puede representar identidades no binarias ni el uso de pronombres singulares "they".
- La supervision plateada (destilacion) puede heredar errores de correferencia del profesor (Gemma-4-31B-it), como se senala en las limitaciones del paper.
- El modelo esta pensado como artefacto de investigacion, no como herramienta de produccion para tomar decisiones sobre personas. Los resultados deben interpretarse con cautela.
- La salida es un JSON; si se usa con decodificacion no greedy, puede producir formatos invalidos.
- No se ha evaluado su comportamiento en dominios muy especializados (medicina, derecho) ni con textos largos (mas alla de 1024 tokens de entrenamiento).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tambien es Apache 2.0, sin restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TomMoeras/contragand-qwen3.5-4b-open
- Repositorio de codigo y configuraciones: https://github.com/TomMoeras/ContraGAND
- Demo interactiva: https://huggingface.co/spaces/TomMoeras/contragand-demo
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B (referencia)
- Paper (EMNLP 2026): Moerman, Gkovedarou, y Hackenbuchner, *ContraGAND: Auditing and Repairing Gender Ambiguity Failures in LLMs with Neurosymbolic Contrastive Data Augmentation* (pendiente de enlace publico)
