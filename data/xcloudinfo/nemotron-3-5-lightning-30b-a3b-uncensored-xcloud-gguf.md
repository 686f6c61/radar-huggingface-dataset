# xCloudinfo/Nemotron-3.5-Lightning-30B-A3B-Uncensored-xCloud-GGUF

## Resumen

Nemotron-3.5-Lightning-30B-A3B-Uncensored-xCloud es una variante del modelo base de NVIDIA `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicada por xCloudinfo (云碩科技) en formato GGUF para llama.cpp. El modelo base emplea una arquitectura híbrida que combina capas Mamba-2 (SSM), mezcla de expertos (MoE) y atención, con 32.913.266.240 parámetros totales y aproximadamente 3B activos por token, además de Multi-Token Prediction (MTP) y una ventana de contexto de hasta 1M tokens.

La modificación aplicada por xCloudinfo no es un reentrenamiento, sino una abliteración por dirección (directional ablation, Arditi et al. 2024): se extrae la dirección de rechazo y se ortogonaliza en 2.973 matrices que escriben en el flujo residual (las `o_proj` de atención y las `down_proj` de todos los expertos MoE), con una intensidad de 0,8. Las proyecciones `out_proj` de Mamba y la cabeza de borrador MTP se dejan intactas para preservar la coherencia del modelo híbrido.

El resultado es un modelo conversacional sin la capa de rechazo de la alineación de seguridad, distribuido en seis cuantizaciones GGUF (de Q8_0 a IQ2_M) junto con un fichero `imatrix.dat`. Es relevante para quienes necesitan desplegar localmente un MoE de 30B con contexto muy largo y sin filtros de rechazo, a costa de asumir toda la responsabilidad sobre el uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba-2 (SSM) + MoE + Attention, con Multi-Token Prediction |
| Parametros totales | 32.913.266.240 (≈32,9B) |
| Parametros activos | ≈3B por token |
| Longitud de contexto | Hasta 1M tokens (según model card del autor) |
| Tipos de cuantizacion | Q8_0 (33 GB), Q6_K (33 GB), Q5_K_M (26 GB), Q4_K_M (24 GB), IQ4_XS (18 GB), IQ2_M (18 GB); incluye `imatrix.dat` |
| Idiomas soportados | en, zh |
| Licencia | OpenMDW-1.1 (Linux Foundation; uso comercial permitido con conservación de aviso de licencia y copyright) |
| Formato de pesos | GGUF (llama.cpp); modelo base en BF16 |
| Dimension oculta | 2688 |
| Matrices ablacionadas | 2.973 (`o_proj` de atención y `down_proj` de expertos MoE), intensidad 0,8 |
| Tamano del repo | 160,5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido en el que conviven capas de espacio de estados Mamba-2, capas de atención y capas MoE con enrutamiento por token; solo unos 3B de los casi 33B parámetros se activan en cada paso, lo que reduce el coste de inferencia frente a un denso equivalente. Incorpora Multi-Token Prediction, lo que permite decodificación especulativa con una cabeza de borrador propia, y soporta contextos de hasta 1M tokens. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La intervención de xCloudinfo es puramente post-entrenamiento: cálculo de la dirección de rechazo y ablación direccional sobre las matrices que escriben en el residual, sin reentrenar pesos. El autor advierte que en modelos híbridos con SSM la dirección debe recogerse con el modelo cargado en un único dispositivo, ya que partir el modelo entre GPUs corrompe la recurrencia de Mamba y produce una dirección defectuosa; el procesamiento se realizó en una máquina de memoria unificada. No se documentan datos de calibración, número de prompts utilizados para estimar la dirección ni métricas de degradación de capacidades tras la ablación.

## Capacidades

- Generación de texto conversacional multi-turno con razonamiento extenso (thinking) activado por defecto.
- Razonamiento de varios pasos con presupuesto de pensamiento controlable mediante `max_tokens` (el autor recomienda ≥ 2000 para respuestas factuales).
- Capacidad de contexto muy larga: hasta 1M tokens según la model card, útil para documentos extensos y conversaciones prolongadas.
- Multilingüe limitado a inglés y chino (en, zh).
- Decodificación especulativa mediante la cabeza MTP conservada del modelo base.
- Compatibilidad con llama.cpp y servidores compatibles con la API de endpoints (`endpoints_compatible`), lo que habilita su uso tras interfaces tipo OpenAI.
- Respuestas directas a peticiones sensibles o de doble uso al haberse eliminado la capa de rechazo.
- No se documenta soporte explícito de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Procesamiento de documentos largos en local: con hasta 1M tokens de contexto, el modelo puede ingerir contratos, expedientes o bases de código completas en una sola pasada sin fragmentación, algo poco habitual en modelos desplegables en una sola máquina.
- Asistencia técnica interna sin filtros: para equipos de I+D que necesitan respuestas directas sobre temas de seguridad, análisis de malware o pruebas de penetración, donde los modelos alineados suelen rechazar la petición; el modelo responde sin la capa de rechazo, siempre bajo responsabilidad del operador.
- Despliegue en hardware de gama alta de consumo: la cuantización IQ4_XS (18 GB) permite ejecutar el modelo en una GPU con 24 GB de VRAM, con un coste de inferencia bajo gracias a los ~3B parámetros activos.
- Redacción y resumen bilingüe inglés-chino: adecuado para equipos que trabajan con documentación en ambos idiomas y necesitan un modelo local sin dependencia de APIs externas.
- Generación de código y explicaciones técnicas: el modelo base está orientado a texto y razonamiento; puede integrarse en asistentes de programación locales mediante llama-server, aunque no se documenta soporte de tool calling.
- Experimentación en investigación sobre alineación y abliteración: sirve como caso de estudio reproducible de ablación direccional en arquitecturas híbridas SSM+MoE, con el `imatrix.dat` incluido para replicar cuantizaciones.
- Prototipado de agentes con contexto largo: la ventana de 1M tokens y la decodificación especulativa MTP permiten mantener historiales extensos de herramientas y observaciones, aunque la ausencia de soporte documentado de function calling obliga a implementar el parseo manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de degradación tras la ablación, ni comparaciones con el modelo base original.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18 GB para IQ4_XS e IQ2_M, ~24 GB para Q4_K_M, ~26 GB para Q5_K_M, ~33 GB para Q6_K y Q8_0 (más overhead de contexto KV/caché SSM).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 4090 24 GB para las cuantizaciones IQ4_XS e IQ2_M; para Q4_K_M conviene una RTX 4090 o A6000 con margen para el contexto.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con IQ4_XS o IQ2_M; Q4_K_M es ajustado y puede requerir offload parcial.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (importando el GGUF) y cualquier frontend compatible con la API de llama.cpp; el autor indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles. El modelo activa ~3B parámetros por token, por lo que se espera un throughput notablemente superior al de un denso de 30B, pero no se aportan cifras medidas.
- Nota de memoria: para tareas de ablación o análisis de direcciones en modelos híbridos SSM, el autor exige carga en un único dispositivo; para inferencia normal el reparto entre GPUs no está documentado como problemático.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-Uncensored-xCloud | 32,9B | ~3B | 1M | OpenMDW-1.1 | GGUF | Abliterado, híbrido Mamba-2+MoE |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 32,9B | ~3B | 1M | OpenMDW-1.1 | BF16 | Con alineación de seguridad intacta |
| Alternativas MoE de ~30B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación directa más relevante es con el modelo base de NVIDIA: misma arquitectura, mismos parámetros y misma licencia, pero con la capa de rechazo eliminada y cuantizado a GGUF. No se dispone de datos de benchmarks que permitan cuantificar la pérdida de capacidades respecto al original.

## Limitaciones y advertencias

- Eliminación deliberada de la alineación de seguridad: el modelo responde a peticiones sensibles o de doble uso sin filtros; el usuario asume toda la responsabilidad legal y ética.
- Riesgo de alucinación no evaluado: no hay benchmarks ni evaluaciones de fidelidad factual en la información disponible.
- Sesgos desconocidos: no se documentan sesgos de género, raza, idioma o políticos, ni procesos de mitigación.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- El pensamiento (thinking) está activado por defecto y requiere presupuestos altos de `max_tokens` (≥ 2000) para converger; el autor desaconseja el modo `medium_effort` por ser más largo y no converger.
- El modelo tiende a asumir un año anterior al actual si no se inyecta la fecha en el system prompt.
- La cuantización MoE se ve afectada por una dimensión oculta de 2688 (no múltiplo de 256), lo que provoca que algunos tensores de expertos usen más bits y que Q8_0/Q6_K e IQ4_XS/IQ2_M tengan tamaños casi idénticos.
- Licencia OpenMDW-1.1: permite uso comercial, pero exige conservar la licencia y el aviso de copyright al redistribuir; conviene revisar el texto completo antes de un despliegue en producción.
- El autor declara que el modelo se publica para investigación interna y validación técnica, y no asume responsabilidad por los outputs.
- No se documenta soporte de tool calling, visión ni audio, lo que limita su uso en pipelines de agentes que dependan de function calling nativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/Nemotron-3.5-Lightning-30B-A3B-Uncensored-xCloud-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Perfil del autor: https://hf.co/xCloudinfo
- Referencia del método de abliteración: Arditi et al. (2024), "Refusal in Language Models Is Mediated by a Single Direction" (no se proporciona URL en la información disponible)
- Licencia OpenMDW-1.1: texto publicado por la Linux Foundation (no se proporciona URL en la información disponible)
- Repositorio de llama.cpp: no disponible en la información proporcionada
