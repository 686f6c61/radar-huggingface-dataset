# spitis/VFM-0.6B

## Resumen

VFM-0.6B es un modelo verificador de criterios en lenguaje natural desarrollado por Silviu Pitis (usuario `spitis` en Hugging Face) y presentado en el artículo *Runtime Verification of Multiple Natural Language Criteria for Agent Governance* (NeurIPS 2026). No es un modelo generativo al uso: parte del backbone de Qwen3-0.6B y sustituye la cabeza de lenguaje por una cabeza de clasificación de tres clases que, dado un contexto, un texto objetivo y una lista de criterios, emite para cada criterio un veredicto YES, NO o N/A (inapplicable o evidencia insuficiente).

El modelo resuelve un problema concreto en el despliegue de agentes basados en LLM: comprobar en tiempo de ejecución si la salida de un agente cumple un conjunto de políticas o criterios expresados en lenguaje natural, sin recurrir a un LLM juez generativo. Al evaluar cada criterio de forma independiente sobre un prefijo compartido y sin generar texto, reduce coste y latencia frente a la alternativa de invocar un modelo grande como juez.

Con 596 millones de parámetros, licencia Apache-2.0 (incluido el modelo base) y un contexto operativo de 4.096 tokens, está pensado como componente de monitorización y escalado en pipelines de gobernanza de agentes, no como sustituto de un sistema de cumplimiento autónomo. Su relevancia actual radica en que ofrece una vía barata y determinista de aplicar guardrails verificables sobre agentes que ya están en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con cabeza de clasificación de tres clases (YES/NO/N-A) en lugar de cabeza de lenguaje |
| Parámetros totales | 596.052.995 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens por defecto (truncado por la izquierda, configurable vía `max_length`); bloques de criterio de 64 tokens |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (incluye el modelo base Qwen3-0.6B) |
| Formato de pesos | safetensors (librería `transformers`, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Qwen3-0.6B (transformer decoder denso) y lo adapta a una tarea de verificación: en lugar de predecir el siguiente token, produce una distribución de tres clases sobre cada criterio. Los criterios se puntúan de forma independiente sobre un prefijo compartido (contexto más texto objetivo), de modo que el coste de evaluar N criterios no crece linealmente con la generación de N respuestas, sino con un forward pass por bloque de criterios. La implementación agrupa criterios en bloques de 64 tokens y reutiliza la caché del prefijo en fragmentos de 64 criterios (`chunk_size`).

El entrenamiento consistió en un preentrenamiento de parámetros completos sobre 393.531 filas de CriteriaBank etiquetadas por modelo, con pérdida de entropía cruzada más un término KL hacia el modelo base congelado (λ = 1), optimizador AdamW y batch size de 128, a lo largo de 3.075 pasos. El checkpoint publicado corresponde al paso 2.000, no al final del entrenamiento. El dataset CriteriaBank está disponible en Hugging Face (`spitis/CriteriaBank`) y el código y las recetas de entrenamiento en el repositorio GitHub del autor. No se documenta RLHF ni DPO; el ajuste es supervisado sobre etiquetas generadas por modelo.

## Capacidades

- Verificación de criterios en lenguaje natural: dado un contexto, un texto objetivo y una lista de criterios, devuelve para cada uno YES, NO o N/A con probabilidades (`p_yes`, `p_no`, `p_na`).
- Puntuación independiente de múltiples criterios sobre un prefijo compartido, sin generación de texto.
- Salida de logits y probabilidad binaria normalizada `p_yes_binary = p_yes / (p_yes + p_no)` para umbralización ajustable.
- Acepta contexto como cadena o como lista de mensajes de chat; el objetivo se añade como siguiente turno.
- Procesamiento por lotes mediante `verify_batch` para trazas separadas.
- Uso como juez LLM (llm-as-a-judge) determinista y de bajo coste en lugar de un modelo generativo.
- Capacidad de servir como componente de guardrails y gobernanza de agentes (agent-governance).
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking: es un clasificador de verificación, no un generador.

## Casos de uso

- Gobernanza de agentes en producción: colocar VFM-0.6B como verificador en tiempo de ejecución que comprueba, antes de ejecutar una acción o devolver una respuesta, si la salida cumple políticas expresadas como criterios atómicos (por ejemplo, "no revela datos personales", "no promete plazos"). Su bajo coste permite evaluar decenas de criterios por turno.
- Guardrails de contenido en pipelines de atención al cliente: verificar que las respuestas generadas por un LLM grande cumplen criterios de tono, alcance y cumplimiento normativo, escalando a revisión humana solo los casos con veredicto NO o N/A.
- Validación de contratos y documentos: usar el modelo para comprobar si un texto cumple cláusulas expresadas en lenguaje natural (evaluado en ContractNLI con ROC-AUC 0,857 en zero-shot), como paso previo a revisión legal.
- Monitorización de diálogos multi-turno: comprobar criterios sobre conversaciones completas (evaluado en INSURE-Dial), útil para auditar llamadas o chats y detectar incumplimientos de política.
- Filtrado de seguridad en datasets y respuestas: aplicar criterios de toxicidad o seguridad sobre textos generados (evaluado en BeaverTails con ROC-AUC 0,722) antes de publicarlos o almacenarlos.
- Evaluación de instrucciones y rúbricas: verificar si una respuesta satisface instrucciones de formato o contenido (evaluado en InFoBench con ROC-AUC 0,887 e IFEval con 0,654), como componente de evaluación automática en pipelines de CI de prompts.
- Verificación de pasos de razonamiento: comprobar si cada paso intermedio de una cadena de razonamiento satisface criterios de corrección (evaluado en PRM800K con ROC-AUC 0,635), como señal auxiliar en sistemas de process reward.

## Benchmarks y rendimiento

Resultados zero-shot con los pesos publicados (ROC-AUC):

| Benchmark | Zero-shot ROC-AUC |
|---|---:|
| InFoBench | 0,887 |
| Synthetic governance | 0,880 |
| ContractNLI | 0,857 |
| LLM-AggreFact | 0,736 |
| BeaverTails | 0,722 |
| INSURE-Dial | 0,713 |
| IFEval | 0,654 |
| PRM800K | 0,635 |

Tras fine-tuning específico por benchmark (media ± desviación típica sobre tres semillas):

| Métrica | Resultado |
|---|---|
| Synthetic governance, accuracy | 87,2 ± 0,5 % |
| Synthetic governance, dominios de transferencia | 75,1 ± 1,4 % |
| INSURE-Dial, accuracy | 82,6 ± 0,6 % |
| Macro AULC en seis curvas de aprendizaje | 0,789 (frente a 0,772 sin KL y 0,736 con Direct-FT) |

Los resultados con fine-tuning requieren entrenamiento separado por benchmark; los de gobernanza usan selección sobre dev y los de INSURE-Dial usan selección de checkpoint con validación cruzada de cinco pliegues sobre llamadas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16/bf16 (596 M de parámetros) más overhead de activaciones y caché de prefijo; cómodo por debajo de 4 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; en centro de datos, A100, H100 o L4 quedan sobredimensionadas pero permiten alto throughput por batching.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM; también es viable en CPU para cargas moderadas.
- Opciones de despliegue: el paquete oficial `vfm` (instalable desde GitHub) sobre `transformers`; al ser un modelo con `custom_code` y cabeza de clasificación, no es directamente compatible con llama.cpp u Ollama sin conversión. Para serving a escala, requiere un wrapper propio sobre vLLM o TGI que exponga la lógica de verificación por bloques.
- Latencia y throughput: no se publican cifras concretas. El diseño (un forward pass por bloque de criterios sobre prefijo cacheado) implica coste sublineal respecto al número de criterios en comparación con invocar un LLM juez por criterio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VFM-0.6B | 596 M | 4.096 tokens | Verificación de criterios (YES/NO/N-A) | Apache-2.0 | Hugging Face, código en GitHub |
| Qwen3-0.6B (base) | 596 M | 32.768 tokens (modelo original) | Generación de texto | Apache-2.0 | Hugging Face |
| LLM juez generativo (p. ej. Qwen3-8B o similar) | miles de millones | variable | Verificación vía generación | variable | Hugging Face |
| Guardrails basados en clasificadores (p. ej. modelos de toxicidad tipo Llama Guard) | variable | variable | Clasificación de seguridad | variable | Hugging Face |

La comparación directa con alternativas específicas de verificación de criterios múltiples no está disponible en la información proporcionada. Frente a un LLM juez generativo, VFM-0.6B ofrece menor coste por criterio y salida calibrada de tres clases, pero menor capacidad de razonamiento y cobertura semántica; frente a clasificadores de seguridad especializados, cubre criterios arbitrarios en lenguaje natural en lugar de categorías fijas.

## Limitaciones y advertencias

- Calibración zero-shot débil: es necesario ajustar umbrales de decisión por dominio antes de usar en producción.
- Predicción de N/A débil: el modelo tiende a fallar al distinguir criterios inaplicables o con evidencia insuficiente.
- Etiquetas de entrenamiento generadas por modelo, no por humanos, lo que puede propagar sesgos y errores del generador de etiquetas.
- Evaluaciones únicamente en inglés y solo texto; no hay soporte multilingüe ni multimodal.
- Incluso el mejor verificador de 4B fine-tuneado aprueba aproximadamente el 20 % de violaciones reales en INSURE-Dial, según el propio autor; VFM-0.6B debe usarse para monitorización y escalado, no como mecanismo de cumplimiento autónomo.
- Riesgo de alucinación estructural: al ser un clasificador, no "alucina" texto, pero puede producir veredictos YES incorrectos sobre criterios ambiguos o mal formulados; se recomienda mantener criterios cortos y atómicos.
- Restricción de contexto: truncado por la izquierda a 4.096 tokens por defecto; contextos más largos pierden información del inicio.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, incluido el modelo base Qwen3-0.6B; los ficheros de tokenizador no se modifican respecto a Qwen3.
- No apto para tool calling, agentes multi-paso ni generación: su uso fuera de la tarea de verificación no está soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spitis/VFM-0.6B
- Dataset CriteriaBank: https://huggingface.co/datasets/spitis/CriteriaBank
- Código y recetas de entrenamiento: https://github.com/spitis/vfm
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Artículo: Pitis, S., Alamdari, P. A., Tang, J., Klassen, T. Q., McIlraith, S. A. *Runtime Verification of Multiple Natural Language Criteria for Agent Governance*, NeurIPS 2026.
