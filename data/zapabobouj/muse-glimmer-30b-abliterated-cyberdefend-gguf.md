# zapabobouj/Muse-Glimmer-30B-Abliterated-CyberDefend-GGUF

## Resumen

Muse-Glimmer-30B-Abliterated-CyberDefend-GGUF es una cuantización GGUF publicada por el usuario zapabobouj del modelo Muse-Glimmer-30B-Abliterated, una variante sin salvaguardas de rechazo (abliterated) orientada a ciberseguridad, simulación de penetration testing y roleplay. El modelo base pertenece a la clase de 30B parámetros (27.854.794.240 parámetros exactos según los safetensors) y ha sido optimizado mediante lo que el autor denomina "Bonsai Structured Layer Pruning", una poda estructurada de capas que reduce la configuración a 34 capas, y transformaciones ortogonales inspiradas en el grupo de Lie Spin(8) para preservar la calidad en cuantizaciones de bits bajos.

Su relevancia reside en dos frentes: por un lado, la eliminación programática de las heurísticas de rechazo lo hace apto (según el autor) para exploración científica sin restricciones y evaluaciones ofensivas de seguridad; por otro, el conjunto de cuantizaciones publicado (desde Q2_K hasta Q8_0, con imatrix) permite ejecutarlo desde estaciones de trabajo de gama media hasta servidores con GPUs de alto rendimiento. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El repo incluye un corpus de calibración propio para la cuantización centrado en comandos de sistema multi-turno, payloads de corrupción de memoria (overwrites de RIP en x86 Assembly), auditoría de contratos Solidity y consultas científicas sin censura, lo que sugiere un enfoque especializado en tareas técnicas de seguridad ofensiva y auditoría de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (detalle completo no disponible); 34 capas tras "Bonsai Structured Layer Pruning" |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_L, Q2_K (todas con imatrix) |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 120,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de la familia Muse-Glimmer de ~30B parámetros, de arquitectura transformer autorregresiva para generación de texto. Sobre esa base, el autor aplica dos modificaciones. La primera es la "Bonsai Structured Layer Pruning": mediante análisis de perfiles de similitud coseno entre bloques de cross-attention, se eliminan 6 bloques de alta similitud, quedando una configuración de 34 capas. Según los datos publicados por el autor, esta poda reporta una mejora de throughput del 17,8% y una reducción del 15% en la huella de memoria de pesos bajo alta concurrencia. No se han publicado datos independientes que verifiquen estas cifras.

La segunda es el marco "Spin(8) Triality", un conjunto de transformaciones ortogonales dependientes de la entrada aplicadas a los embeddings de query durante la cuantización. El autor afirma que esta formulación preserva estrictamente la norma de Frobenius y evita la degradación de calidad en cuantizaciones profundas como Q2_K y Q3_K_L. En cuanto al entrenamiento del modelo base, no se dispone de información sobre número de tokens, composición del dataset ni etapas de RLHF/DPO. Para la cuantización, se utilizó un corpus de calibración sintético centrado en comandos de sistema multi-turno, payloads de corrupción de memoria en x86 Assembly, patrones de remediación de re-entrancy en Solidity y consultas científicas sin censura. El proceso de "abliteration" (eliminación de las salvaguardas de rechazo) se realizó de forma programática sobre los pesos.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational)
- Análisis de trazas de sistema y depuración (el ejemplo de la model card muestra análisis de stack traces para memory leaks)
- Contenido de ciberseguridad ofensiva y defensiva sin filtros de rechazo: generación y análisis de payloads, simulación de ataques, evaluación de vulnerabilidades
- Auditoría de contratos inteligentes Solidity (patrones de re-entrancy y su remediación)
- Roleplay sin restricciones (tag roleplay)
- Soporte bilingüe inglés/japonés
- Ejecución local vía llama-cpp (tag llama-cpp); compatible con endpoints estándar (tag endpoints_compatible)
- No hay evidencia de capacidades de visión, audio ni tool calling en la información disponible

## Casos de uso

- Simulación de penetration testing: el modelo puede generar y analizar payloads de explotación (por ejemplo, overwrites de RIP en x86 Assembly) en entornos de laboratorio controlados, al haber sido calibrado con corpus específico de corrupción de memoria.
- Auditoría de contratos Solidity: dada la calibración con patrones de re-entrancy, puede revisar código de contratos inteligentes identificando vulnerabilidades conocidas y proponiendo remediaciones.
- Análisis de stack traces y depuración: el ejemplo oficial muestra su uso para detectar memory leaks a partir de trazas de ejecución en contenedores Linux.
- Investigación en alineación y seguridad de modelos: al ser una variante abliterated, sirve como sujeto de estudio para evaluar la robustez de las salvaguardas de modelos y los efectos de su eliminación.
- Red teaming de sistemas conversacionales: permite probar defensas y comportamientos de agentes en escenarios adversariales sin que el modelo se niegue a responder.
- Roleplay y escritura creativa sin filtros: la etiqueta roleplay y la ausencia de rechazos lo hacen adecuado para narrativa interactiva sin restricciones de contenido.
- Evaluación de cuantizaciones agresivas: el conjunto Q2_K–Q8_0 con calibración imatrix específica lo convierte en un buen banco de pruebas para estudiar la degradación de calidad en bits bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas de rendimiento aportadas por el autor, correspondientes a la poda estructurada y no a la calidad del modelo, son:

| Métrica | Valor |
|---|---|
| Mejora de throughput por poda de capas | +17,8% |
| Reducción de memoria de pesos por poda | -15,0% |

## Requisitos de hardware

Los tamaños por cuantización publicados por el autor permiten estimar los requisitos:

- Q8_0 (~31,8 GB): requiere GPU con 40 GB de VRAM o reparto CPU/GPU; adecuado para A100 40GB, A100 80GB o H100.
- Q6_K (~24,9 GB): cabe en una A100 40GB o en dos RTX 3090/4090 con offloading parcial.
- Q5_K_M (~21,5 GB): viable en rigs de consumo con 24 GB de VRAM (RTX 3090, RTX 4090) con la mayor parte del modelo en GPU.
- Q4_K_M (~18,2 GB): cuantización recomendada para throughput rápido; cabe íntegramente en una RTX 4090 de 24 GB.
- Q3_K_L (~14,8 GB): cabe en GPUs de 16 GB (RTX 4080/4060 Ti 16GB) o en 24 GB con holgura.
- Q2_K (~11,5 GB): cabe en GPUs de 12 GB (RTX 3060 12GB, RTX 4070), aunque el autor la marca como experimental.
- Con RAM suficiente (32 GB o más) es posible la ejecución en CPU pura o con offloading parcial mediante llama.cpp.
- Despliegue: llama.cpp es el runtime de referencia (el repo incluye comando de ejemplo con llama-cli); por el formato GGUF es también compatible con Ollama, LM Studio, KoboldCpp y otros runtimes de la familia llama.cpp. No hay evidencia de soporte directo para vLLM o TGI, que requieren formatos safetensors/HF.
- No se publican cifras de latencia ni tokens/segundo concretas; el autor solo indica la mejora relativa del 17,8% en throughput respecto al modelo sin podar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Abliterated-CyberDefend (este) | 27,85B (34 capas, podado) | no disponible | Apache 2.0 | GGUF | Abliterated, especializado en ciberseguridad, 6 cuants con imatrix |
| Qwen2.5-32B-Instruct | 32,5B | 128K tokens | Qwen license (uso comercial condicionado) | Safetensors + GGUF comunitarios | Modelo generalista con benchmarks publicados y soporte de tool calling |
| Yi-1.5-34B-Chat | 34,4B | 32K tokens | Apache 2.0 | Safetensors + GGUF comunitarios | Bilingüe inglés/chino, generalista, sin abliteration |

No existen datos de benchmarks que permitan comparar rendimiento numérico entre estos modelos; la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está deliberadamente abliterated: las salvaguardas de rechazo han sido eliminadas. Esto implica un riesgo elevado de generación de contenido dañino, ilegal o inseguro, y su despliegue en producción orientado a usuarios finales es altamente desaconsejable sin capas de seguridad externas.
- Al tratarse de una variante modificada (poda de capas + abliteration + cuantización), la fiabilidad y coherencia pueden degradarse respecto al modelo base; no hay benchmarks que cuantifiquen esta degradación.
- El riesgo de alucinación es inherente y no mitigado por ajustes de alineación conocidos; en tareas de ciberseguridad, los payloads y análisis generados deben verificarse siempre manualmente.
- La longitud de contexto no está documentada, lo que dificulta planificar aplicaciones con documentos largos o conversaciones multi-turno extensas.
- El soporte de idiomas se limita a inglés y japonés; no hay garantías de calidad en castellano.
- Las métricas de +17,8% de throughput y -15% de memoria proceden del autor y no han sido verificadas de forma independiente.
- La cuantización Q2_K está marcada como experimental por el propio autor.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que no asume responsabilidad por usos ilícitos del modelo.
- El repositorio ocupa 120,7 GB, lo que exige planificar almacenamiento y ancho de banda para la descarga.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zapabobouj/Muse-Glimmer-30B-Abliterated-CyberDefend-GGUF
- DOI registrado en HuggingFace: https://doi.org/10.57967/hf/11279
- No se han encontrado enlaces adicionales a papers, blogs, repos del modelo base ni demos en la información disponible.
