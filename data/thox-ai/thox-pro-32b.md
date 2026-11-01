# Thox-ai/thox-pro-32b

## Resumen

thox-pro-32b es una distribución configurada por Thox-ai del modelo Qwen3-32B de Alibaba Cloud, empaquetada para inferencia local en un solo dispositivo mediante Ollama. No se trata de un modelo entrenado desde cero ni de un fine-tuning: según la propia model card, los pesos son byte-idénticos a la distribución oficial de Ollama del modelo base (verificado por SHA-256 en la revisión de la release del 31 de octubre de 2026), y el trabajo de THOX se limita a la configuración de runtime, la documentación y la capa de orquestación MeshStack. La build servida usa cuantización Q4_K_M en formato GGUF, con un tamaño de descarga de 20 GB y una ventana de contexto configurada de 128 000 tokens.

El modelo hereda las capacidades del Qwen3-32B subyacente: un transformer denso de 32 000 millones de parámetros con modo de razonamiento explícito, soporte multilingüe y entrenamiento con fases de RLHF y DPO por parte de Alibaba. La propuesta de THOX se orienta a flujos de trabajo profesionales en entornos aislados (análisis documental, revisión legal o financiera, investigación) donde la inferencia debe ejecutarse íntegramente en local sin dependencia de servicios externos.

La relevancia de esta ficha es doble: por un lado, documenta una distribución concreta de un modelo abierto ampliamente utilizado; por otro, sirve como caso de estudio de empaquetados que añaden capas de producto sobre pesos de terceros. La model card ha sido corregida explícitamente para retirar afirmaciones previas sobre certificaciones de cumplimiento (HIPAA, SOC 2, FERPA, FISMA, ITAR), cifras de ahorro y una licencia MIT que era incorrecta para los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-32B); capa de distribución THOX sobre Ollama |
| Parámetros totales | 32 000 millones (32B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (num_ctx configurado en Ollama; la cifra de 40K del tag `latest` es un artefacto de visualización según el autor) |
| Tipos de cuantización | Q4_K_M (GGUF); otras cuantizaciones del modelo base disponibles a través del ecosistema Qwen3, no empaquetadas por THOX |
| Idiomas soportados | Inglés declarado en la model card; el modelo base Qwen3-32B soporta multilingüismo amplio, no documentado en esta distribución |
| Licencia | Apache 2.0 (pesos, según los términos del modelo base) |
| Formato de pesos | GGUF (build servida vía Ollama); repositorio de HuggingFace sin pesos publicados, solo model card |
| Tamaño de la build | 20 GB (listado de Ollama) |
| Fecha de corte de conocimiento | 2024 (según la model card original) |
| Despliegue | Ollama local; orquestación distribuida vía MeshStack (producto separado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-32B: un transformer denso de 32 000 millones de parámetros desarrollado por Alibaba Cloud, con modo de razonamiento (thinking) activable y entrenamiento en varias fases que incluye preentrenamiento, ajuste supervisado y optimización por preferencias (RLHF y DPO). THOX no aporta ninguna modificación a los pesos ni ejecuta un proceso de entrenamiento propio: la model card declara explícitamente que no hay fine-tuning, dataset ni procedimiento de entrenamiento adicional atribuible a THOX, y que los datasets añadidos para esta release son ninguno.

La contribución técnica de THOX se sitúa en la capa de configuración y orquestación. La build se sirve como GGUF Q4_K_M a través de Ollama, con un `num_ctx` de 128 000 tokens, y se integra en el programa MeshStack, una tecnología de clustering dispositivo-a-dispositivo basada en conectores magnéticos propietarios (MagStack) pensada para distribuir modelos y compartir recursos entre dispositivos. Esa capa de clustering es un producto independiente y no forma parte de la descarga del modelo. No se documentan innovaciones a nivel de atención, decodificación especulativa ni técnicas de inferencia más allá de la cuantización estándar.

## Capacidades

- Generación de texto y razonamiento multi-paso heredados de Qwen3-32B, incluyendo modo de pensamiento explícito del modelo base.
- Análisis de documentos complejos y síntesis entre dominios, orientado a flujos de trabajo profesionales.
- Procesamiento de contexto largo: hasta 128 000 tokens configurados en la build de Ollama, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Inferencia 100 % local, sin acceso a información en línea ni servicios externos salvo que el operador los conecte explícitamente.
- Capacidades multilingües del modelo base (no declaradas por THOX, que solo lista inglés).
- Soporte de tool calling y function calling: no documentado en esta distribución; debe verificarse contra la model card de Qwen3-32B.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta build.
- Visión y audio: no disponibles (modelo de texto).

## Casos de uso

- Análisis estratégico y ejecutivo en redes aisladas: el modelo se ejecuta íntegramente en local sobre Ollama, sin tráfico saliente, lo que permite procesar documentación sensible de dirección en entornos air-gapped con la ventana de 128K tokens para informes extensos.
- Revisión de documentación clínica, legal, financiera y de investigación bajo supervisión humana cualificada: la model card lo orienta explícitamente a estos dominios, siempre con revisión por parte de profesionales y asumiendo el operador las obligaciones regulatorias aplicables.
- Evaluación de IA local en industrias reguladas: útil como banco de pruebas para organizaciones que necesitan validar si un modelo de 32B cuantizado a Q4_K_M cubre sus necesidades antes de comprometerse con infraestructura dedicada.
- Procesamiento de contratos y expedientes largos: con 128 000 tokens de contexto se pueden cargar contratos completos o expedientes multi-documento en una sola pasada, sin fragmentación, para tareas de extracción y resumen.
- Asistencia a la investigación documental: síntesis de literatura y notas de investigación en local, manteniendo los datos dentro del perímetro del dispositivo.
- Despliegue en estaciones de trabajo profesionales con una sola GPU: la cuantización Q4_K_M de 20 GB permite ejecutar el modelo en hardware de gama alta de consumo o profesional sin clúster, lo que encaja con la línea "single-device" de THOX.
- Base para orquestación MeshStack: en organizaciones que adopten el programa de THOX, este modelo actúa como punto de partida de la línea Pro sobre la que se construye la familia Cluster (la orquestación distribuida es un producto aparte, no incluido en la descarga).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados de forma independiente para esta distribución en la información disponible. La model card indica que las cifras citadas en versiones anteriores provenían de Alibaba para el modelo base y no fueron re-ejecutadas para esta publicación, y que la evaluación independiente de THOX está pendiente. Tampoco se declaran cifras de throughput, latencia, concurrencia, disponibilidad ni ahorro de costes para esta release.

| Benchmark | thox-pro-32b | Notas |
|---|---|---|
| MMLU | no disponible | Sin evaluación publicada por THOX |
| HumanEval | no disponible | Sin evaluación publicada por THOX |
| GSM8K | no disponible | Sin evaluación publicada por THOX |
| Throughput / latencia | no disponible | El autor no declara cifras para esta release |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 20 GB para la build Q4_K_M de 20 GB, más overhead de contexto KV; con 128 000 tokens de contexto el consumo de KV cache crece de forma significativa y puede requerir VRAM adicional muy superior a la del propio modelo.
- GPU recomendadas: no especificadas por el autor. Por tamaño de la build, una GPU profesional con 24 GB o más (A100 40/80 GB, H100, L40S) ofrece margen para contexto largo; una RTX 4090 de 24 GB puede alojar los pesos pero queda muy justa para contextos extensos.
- ¿Cabe en GPU de consumo? Los pesos Q4_K_M de 20 GB caben en GPUs de 24 GB (RTX 3090, RTX 4090); con contexto largo puede requerir offloading parcial a CPU o reducir `num_ctx`.
- Opciones de despliegue: Ollama es el canal oficial (`ollama run Thox-ai/thox-pro-32b`). Otros runtimes compatibles con GGUF (llama.cpp) son viables por formato, aunque no están documentados por el autor. vLLM y TGI no están soportados de forma nativa para esta build GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones para esta release.
- La model card advierte que el modelo "requiere hardware especializado para rendimiento óptimo", sin concretar especificaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización de referencia | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| thox-pro-32b | 32B denso | 128K (config. Ollama) | Q4_K_M GGUF, 20 GB | Apache 2.0 | Ollama; HuggingFace solo model card | Distribución de Qwen3-32B sin entrenamiento propio |
| Qwen3-32B (Alibaba) | 32B denso | 128K (modelo base) | Múltiples (GGUF, safetensors, AWQ) | Apache 2.0 | HuggingFace, Ollama, vLLM, TGI | Modelo base; benchmarks publicados por Alibaba |
| Qwen3-30B-A3B (Alibaba) | 30B totales, ~3B activos (MoE) | 128K | Múltiples | Apache 2.0 | HuggingFace, Ollama | Alternativa MoE con menor coste de inferencia por token |
| Gemma 3 27B (Google) | 27B denso | 128K | Múltiples | Gemma Terms (uso comercial con restricciones) | HuggingFace, Ollama | Alternativa de tamaño similar con licencia no Apache |

La comparación directa más relevante es con el propio Qwen3-32B: thox-pro-32b no difiere en pesos, solo en configuración y empaquetado, por lo que cualquier diferencia de rendimiento respecto al base provendría de la cuantización Q4_K_M y del `num_ctx` configurado, no del modelo.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado por THOX: los pesos son idénticos a los de Qwen3-32B en Ollama; no debe esperarse ninguna mejora de calidad atribuible a THOX.
- La model card ha sido corregida para retirar afirmaciones previas de cumplimiento (HIPAA, SOC 2, FERPA, FISMA, ITAR): THOX no reclama certificación alguna para este modelo. Cualquier obligación regulatoria recae sobre el operador.
- La versión anterior declaraba licencia MIT para el modelo; era incorrecta. Los pesos se rigen por Apache 2.0 del modelo base.
- La build servida es Q4_K_M, no FP16/BF16 como se indicó en una versión previa de la card: hay pérdida de precisión respecto al modelo base en precisión completa.
- Riesgo de alucinación inherente al modelo base; la card advierte que las salidas pueden ser erróneas y que los resultados médicos, legales, financieros y de seguridad requieren juicio humano cualificado.
- Idiomas: la card solo declara inglés; el multilingüismo del base no está verificado para esta distribución.
- Sin acceso a información en línea por diseño: cualquier actualización de conocimiento posterior al corte de 2024 exige que el operador conecte fuentes externas.
- Sin benchmarks, latencias ni métricas de producción publicadas: no hay base para estimar rendimiento en un despliegue concreto sin medirlo.
- El repositorio de HuggingFace no contiene pesos (solo model card y `.gitattributes`); la build ejecutable vive en Ollama.
- La orquestación MeshStack y el hardware MagStack son productos separados, no incluidos en la descarga del modelo.
- La fecha de creación del repositorio (31 de octubre de 2026) y el estado del proyecto (campaña de Kickstarter) sugieren un producto en fase temprana; conviene verificar el soporte a largo plazo antes de adoptarlo en producción.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/Thox-ai/thox-pro-32b
- Build ejecutable en Ollama: https://ollama.com/Thox-ai/thox-pro-32b
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Sitio de THOX: https://thox.ai
- Repositorio de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Documentación de Ollama: https://ollama.com/docs
