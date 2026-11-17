# spitis/VFM-4B

## Resumen

VFM-4B (Verification For Models) es un modelo especializado en la verificación de criterios en lenguaje natural contra un contexto y un texto objetivo. Lo desarrolla Silviu Pitis y colaboradores (Universidad de Toronto, grupo de Sheila McIlraith) y se presenta en el artículo *Runtime Verification of Multiple Natural Language Criteria for Agent Governance* (NeurIPS 2026). El modelo parte del backbone de Qwen3-4B (4.022.475.779 parámetros) y añade una cabeza de clasificación de tres clases que emite un veredicto por criterio: YES (satisfecho), NO (no satisfecho) o N/A (inaplicable o evidencia insuficiente).

La relevancia del modelo está en su enfoque de verificación sin generación de texto: en lugar de pedir a un LLM que "juzgue" escribiendo una respuesta, VFM-4B puntúa cada criterio de forma independiente sobre un prefijo compartido, reutilizando la caché de prefijo entre bloques de 64 criterios. Esto reduce la latencia y el coste frente a un LLM-as-a-judge generativo, y permite evaluar decenas de criterios en una sola pasada. Está pensado para guardrails y gobernanza de agentes en tiempo de ejecución: comprobar si una respuesta o una traza de agente cumple un conjunto de políticas expresadas en lenguaje natural.

El modelo se ha preentrenado sobre CriteriaBank (393.531 filas etiquetadas por modelo) y se distribuye con licencia Apache-2.0, incluido el modelo base Qwen3-4B. Es un modelo en inglés y solo texto, orientado a monitorización y escalado de revisiones, no a cumplimiento autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con cabeza de clasificación de tres clases (YES/NO/N/A) |
| Parametros totales | 4.022.475.779 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens por defecto (`max_length`), con truncado por la izquierda del prefijo; bloques de criterio de 64 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (incluye el modelo base Qwen3-4B) |
| Formato de pesos | safetensors (repo de 8,1 GB), con `custom_code` y librería `transformers` |
| Pipeline | feature-extraction |
| Modelo base | Qwen/Qwen3-4B |
| Dataset de entrenamiento | spitis/CriteriaBank |
| Tarea | Verificación de múltiples criterios en lenguaje natural (verdictos YES/NO/N/A) |

## Arquitectura y entrenamiento

VFM-4B reutiliza el backbone decoder-only de Qwen3-4B y sustituye la generación autoregresiva por una cabeza de clasificación de tres clases que se aplica a cada criterio. La entrada se compone de un prefijo (contexto más texto objetivo, opcionalmente en formato de mensajes de chat) seguido de bloques de criterio; cada bloque se puntúa de forma independiente sobre el mismo prefijo, lo que permite reutilizar la caché de prefijo y evaluar muchos criterios por pasada. Los criterios deben ser cortos y atómicos, y el prefijo se trunca por la izquierda a 4.096 tokens por defecto.

El entrenamiento es un preentrenamiento de todos los parámetros sobre 393.531 filas de CriteriaBank etiquetadas por modelo, con pérdida de entropía cruzada más una divergencia KL hacia el modelo base congelado (λ = 1), optimizador AdamW y tamaño de lote 128. El checkpoint publicado corresponde al paso 2.000 de los 3.075 pasos de preentrenamiento. Los resultados de benchmarks con ajuste fino requieren un entrenamiento específico por benchmark (selección sobre dev para gobernanza y selección de checkpoint con validación cruzada de cinco pliegues sobre llamadas reales para INSURE-Dial). El tokenizador es el de Qwen3 sin cambios.

## Capacidades

- Verificación de criterios en lenguaje natural: emite YES, NO o N/A por cada criterio, con probabilidades `p_yes`, `p_no`, `p_na` y la probabilidad binaria `p_yes_binary = p_yes / (p_yes + p_no)`.
- Evaluación por lotes de criterios independientes sobre un prefijo compartido, con reutilización de caché de prefijo (`chunk_size` de 64 criterios por defecto).
- Acepta contexto como cadena de texto o como mensajes de chat; el texto objetivo se añade como siguiente turno.
- Salida con logits y probabilidades calibrables por umbral.
- Uso como guardrail y juez automático (LLM-as-a-judge) en pipelines de gobernanza de agentes.
- Verificación de trazas de agente a nivel de traza (evaluada en DynaBench con F1 de FAIL a nivel de traza).
- Solo texto y solo inglés; no soporta visión, audio ni tool calling generativo (no genera texto).

## Casos de uso

- Gobernanza de agentes en tiempo de ejecución: comprobar si la respuesta de un agente cumple un conjunto de políticas de seguridad expresadas en lenguaje natural antes de entregarla al usuario, con latencia baja gracias a la puntuación sin generación y a la caché de prefijo compartida.
- Guardrails de contenido en producción: evaluar decenas de criterios atómicos (tono, toxicidad, fuga de datos, cumplimiento de formato) sobre cada salida y escalar solo los casos dudosos a un juez mayor, como el Gemma-4-26B-A4B-it usado en el artículo.
- Verificación de instrucciones (IFEval): comprobar si una respuesta generada satisface restricciones de formato o contenido, útil en pipelines de evaluación automática de sistemas RAG o de generación.
- Moderación y filtrado de diálogos: clasificar respuestas de conversación con criterios de seguridad y política, con ajuste fino por dominio para mejorar la calibración.
- Verificación de contratos y documentos (ContractNLI): comprobar si un fragmento de texto implica o contradice cláusulas expresadas como criterios, para revisión documental asistida.
- Evaluación de razonamiento paso a paso (PRM800K): puntuar si cada paso de una cadena de razonamiento satisface criterios de corrección, como señal para selección de respuestas o para un process reward model.
- Monitorización de calidad en pipelines de agentes multi-paso: verificar trazas completas y detectar fallos a nivel de traza (DynaBench), escalando los FAIL a un juez de mayor tamaño.
- Filtrado previo en pipelines de anotación: descartar automáticamente candidatos que incumplen criterios claros antes de la revisión humana, reduciendo coste de anotación.

## Benchmarks y rendimiento

Resultados zero-shot con los pesos publicados (ROC-AUC):

| Benchmark | Zero-shot ROC-AUC |
|---|---:|
| InFoBench | 0,942 |
| Synthetic governance | 0,927 |
| ContractNLI | 0,899 |
| INSURE-Dial | 0,671 |
| BeaverTails | 0,779 |
| IFEval | 0,704 |
| PRM800K | 0,782 |
| LLM-AggreFact | 0,857 |

Resultados tras ajuste fino por benchmark (media ± desviación típica sobre tres semillas):

| Benchmark | Métrica | Resultado |
|---|---|---:|
| Synthetic governance | Accuracy (%) | 88,8 ± 1,1 |
| Governance transfer | Accuracy (%) | 77,7 ± 0,8 |
| INSURE-Dial | Accuracy (%) | 86,5 ± 1,6 |
| BeaverTails | F1 (%) | 82,6 ± 0,4 |
| IFEval | Balanced accuracy (%) | 95,1 ± 0,6 |
| PRM800K | Balanced accuracy (%) | 82,1 ± 0,6 |
| LLM-AggreFact | Balanced accuracy (%) | 76,3 ± 0,8 |
| ContractNLI | Macro-F1 (%) | 84,2 ± 0,6 |
| DynaBench | Trace-level FAIL F1 | 0,885 ± 0,011 |

Al pasar las tres mejores reglas de VFM a un juez Gemma-4-26B-A4B-it, el F1 de FAIL a nivel de traza en DynaBench sube a 0,946 ± 0,005.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 8 GB solo para pesos (4.022 M parámetros), más memoria para activaciones y caché de prefijo; con cuantización a 8 bits bajaría a unos 4-5 GB y a 4 bits a unos 2,5-3 GB, aunque el autor no publica cuantizaciones oficiales ni cifras de VRAM.
- GPU recomendadas: A100 o H100 para lotes grandes y throughput alto; RTX 4090 (24 GB) para inferencia en fp16 con lotes moderados; GPUs consumer de 8-12 GB solo con cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 en fp16 y en GPUs de 8 GB con cuantización, aunque no se documentan recetas de cuantización.
- Opciones de despliegue: el paquete oficial `vfm` (`pip install git+https://github.com/spitis/vfm`), con `VFM.from_pretrained` y `verify`/`verify_batch`; al ser un modelo `transformers` con `custom_code`, requiere `trust_remote_code`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; el diseño reutiliza la caché de prefijo entre bloques de 64 criterios, lo que reduce el coste por criterio frente a un juez generativo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| VFM-4B | 4.022 M | 4.096 tokens (prefijo) | Verificación YES/NO/N/A sin generación | Apache-2.0 |
| Qwen3-4B (base) | 4.022 M | 32.768 tokens nativos (según Qwen3) | LLM generativo generalista | Apache-2.0 |
| Juez generativo tipo Gemma-4-26B-A4B-it | no disponible | no disponible | LLM-as-a-judge generativo | no disponible |

Frente a Qwen3-4B, VFM-4B sacrifica la generación de texto para ganar velocidad y determinismo en la verificación de criterios; frente a un juez generativo grande como Gemma-4-26B-A4B-it, VFM-4B es mucho más pequeño y barato, y el artículo muestra que sus tres mejores reglas combinadas con ese juez elevan el F1 de DynaBench a 0,946. No se dispone de comparativas adicionales con otros verificadores en la información proporcionada.

## Limitaciones y advertencias

- Calibración zero-shot débil y predicción de N/A floja; es necesario ajustar finamente y calibrar umbrales por dominio.
- Las etiquetas de entrenamiento son generadas por modelo, no por humanos.
- Evaluaciones solo en inglés y solo texto.
- Incluso el mejor verificador ajustado aprueba alrededor del 20 % de las violaciones gold en INSURE-Dial; usar para monitorización y escalado, no para cumplimiento autónomo.
- Los resultados de benchmarks requieren entrenamiento específico por benchmark; los zero-shot son notablemente inferiores.
- Los criterios deben ser cortos y atómicos; el prefijo se trunca a 4.096 tokens por defecto, lo que limita contextos largos.
- Modelo con `custom_code`: requiere `trust_remote_code` y el paquete `vfm` para su uso correcto.
- Licencia Apache-2.0, incluido el modelo base Qwen3-4B, por lo que el uso comercial está permitido; verificar las condiciones del dataset CriteriaBank si se redistribuye.
- Riesgo de alucinación en el sentido de falsos YES/NO: el modelo puede aprobar criterios que no se cumplen, por lo que no debe ser la única barrera de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spitis/VFM-4B
- Dataset CriteriaBank: https://huggingface.co/datasets/spitis/CriteriaBank
- Código y recetas de entrenamiento: https://github.com/spitis/vfm
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Artículo: Pitis, S., Alamdari, P. A., Tang, J., Klassen, T. Q., McIlraith, S. A. *Runtime Verification of Multiple Natural Language Criteria for Agent Governance*, NeurIPS 2026.
