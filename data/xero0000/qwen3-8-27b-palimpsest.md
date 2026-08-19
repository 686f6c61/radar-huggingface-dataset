# xero0000/Qwen3.8-27B-Palimpsest

## Resumen

Qwen3.8-27B-Palimpsest es un fine-tune experimental en BF16 del modelo Qwen3.8-27B de Qwen, desarrollado por el usuario xero0000. El objetivo es mejorar la prosa literaria, la continuidad narrativa, el uso estructurado de herramientas y el comportamiento en contextos largos con consciencia posicional. El nombre "Palimpsest" refleja la idea de preservar y revisar información a lo largo de capas de un contexto de trabajo extenso.

El modelo se basa en la arquitectura densa de Qwen3.8-27B, que incluye un codificador de visión, y se ha ajustado mediante dos etapas de LoRA que se fusionaron en los pesos originales. El entrenamiento utilizó una mezcla de datos abiertos y generados por el proyecto, con un currículo PoSE que mapea posiciones virtuales hasta 1M de tokens. El repositorio no requiere adaptadores PEFT en inferencia, ya que los pesos están fusionados.

La relevancia actual radica en que aborda dos problemas prácticos: la degradación de la calidad en contextos muy largos y la necesidad de modelos que mantengan coherencia y formato estricto en tareas de agente. Aunque el autor lo califica como preliminar, las pruebas locales muestran mejoras en continuidad y recuperación posicional frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) con codificador de visión |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos (según documentación del base); entrenado con posiciones virtuales hasta 1M (evaluación en curso) |
| Tipos de cuantizacion | BF16 (repo original); GGUF derivado (MIX-IQ3KT y otros en repo separado) |
| Idiomas soportados | Inglés (etiqueta oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (derivado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con atención completa y proyecciones de atención lineal, además de un codificador de visión para entrada de imágenes. El fine-tune se realizó en dos etapas LoRA:

1. **Refinamiento de comportamiento y prosa**: 1.152 ejemplos con pérdida solo sobre tokens de asistente, entrenando módulos LoRA en proyecciones de atención completa, atención lineal y MLPs. El checkpoint seleccionado fue el paso 64.
2. **Reparación de contexto largo con consciencia posicional**: 180 ejemplos con currículo PoSE, entrenando solo módulos Q/K LoRA en las 16 capas de atención completa durante 80 pasos. Las secuencias físicas eran de 956 a 1.127 tokens, con posiciones virtuales mapeadas a 32K, 128K, 262K, 524K y 1M.

La etapa final de contexto largo actualiza 1.507.328 parámetros en 64 tensores LoRA. Ambos adaptadores se fusionaron en los pesos BF16 originales, por lo que no se necesitan adaptadores en inferencia. Los datos de entrenamiento incluyen conjuntos abiertos (Novelist, figaro-creative-writing, orca-agentinstruct) y casos generados por el proyecto (PACT-Q), con un total de 1.407.028 tokens renderizados y 796.433 tokens supervisados de asistente.

## Capacidades

- Generación de prosa literaria y narrativa de largo formato con énfasis en continuidad y coherencia entre capítulos o secciones.
- Uso estructurado de herramientas (tool calling) con formato estricto, sin regresión en pruebas locales.
- Comprensión de imágenes y texto (hereda el codificador de visión del modelo base).
- Manejo de contextos largos con recuperación posicional: pruebas locales muestran mejora en tareas de recuperación exacta a 32K, 128K, 262K y 524K (en evaluación).
- Razonamiento multi-hop y unión de información dispersa en documentos extensos.
- Seguimiento de instrucciones y formato de salida controlado, validado con conjuntos de evaluación locales.

## Casos de uso

- **Escritura creativa asistida**: el modelo puede redactar novelas o relatos largos manteniendo la coherencia de personajes, tramas y estilo a lo largo de múltiples capítulos, gracias a su entrenamiento en prosa y continuidad.
- **Agentes conversacionales con herramientas**: su soporte de tool calling y su formato estricto permiten integrarlo en asistentes que necesitan llamar a APIs, bases de datos o ejecutar acciones de forma fiable.
- **Análisis de documentos extensos**: con su contexto nativo de 262K tokens, puede procesar manuales técnicos, informes o contratos largos y responder preguntas que requieren cruzar información de secciones distantes.
- **Generación de código con contexto de proyecto completo**: al manejar ventanas largas, puede recibir un repositorio o módulo completo y generar código nuevo coherente con las convenciones existentes.
- **Sistemas de recuperación aumentada (RAG)**: su capacidad de recuperación posicional lo hace adecuado para pipelines donde se inyectan muchos fragmentos y se necesita extraer respuestas exactas sin perder el orden.
- **Creación de contenido educativo interactivo**: puede generar explicaciones, ejercicios y evaluaciones con un tono consistente y adaptado al nivel del usuario, manteniendo el hilo en conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no copia puntuaciones del modelo base y que la suite pública de capacidades aún está en evaluación. Los datos disponibles son evaluaciones locales del autor (gates de desarrollo) y mediciones de despliegue GGUF:

**Gates locales (evaluador determinista, comparación con el modelo base)**

| Gate | Control | Palimpsest | Notas |
|---|---:|---:|---|
| Comportamiento total | 80/92 | 81/92 | tras la etapa de contexto largo |
| Formato de herramientas | 12/12 | 12/12 | sin regresión de formato estricto |
| Rúbrica de prosa | 30/36 | 30/36 | sin cambios en el gate congelado |
| Rúbrica de continuidad | 38/44 | 39/44 | +1 criterio superado |
| Filas exactas de posición virtual | 55/60 | 57/60 | posiciones de 32K a 1M |
| Precisión de tokens de posición virtual | 0,994792 | 0,996875 | tokens de respuesta forzada |
| NLL media de posición virtual | 0,027115 | 0,021115 | menor es mejor |

**Mediciones de despliegue GGUF (MIX-IQ3KT, auditoría de cinco agujas)**

| Contexto | Tokens de prompt | Agujas | Prefill | Prompt tok/s | Decode tok/s | Resultado |
|---:|---:|---:|---:|---:|---:|---|
| 32.768 | 32.234 | 5/5 exactas | 61,98 s | 520,27 | 17,89 | Interactivo + batch |
| 65.536 | 64.988 | 5/5 exactas | 148,04 s | 439,05 | 14,63 | Interactivo + batch |
| 131.072 | 130.527 | 5/5 exactas | 394,14 s | 331,20 | 10,47 | Interactivo + batch |
| 262.144 | 261.608 | 5/5 exactas | 1.165,29 s | 224,51 | 6,70 | Batch |

Estas mediciones son de despliegue GGUF, no de rendimiento BF16. El autor recomienda 131.072 tokens como límite interactivo y 262.144 como máximo nativo estricto. La extensión YaRN a 512K-1M está en progreso.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo BF16 completo requiere aproximadamente 55,6 GB de VRAM (27,8B parámetros × 2 bytes). Con cuantización GGUF (p. ej., IQ3KT) cabe en configuraciones de 8+8+10 GB VRAM, como se muestra en las pruebas del autor.
- **GPU recomendadas**: para BF16 se necesitan GPUs de datacenter como A100 80GB o H100. Para GGUF cuantizado, GPUs consumer como RTX 3090/4090 (24 GB) o configuraciones multi-GPU de menor VRAM pueden funcionar.
- **Compatibilidad con GPU consumer**: sí, con cuantización GGUF y offloading a CPU. El autor usó un rig de 8 GB + 8 GB + 10 GB VRAM para las pruebas de 524K tokens.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI, LM Studio (según el blog de AMD para el modelo base). El repo GGUF derivado está disponible para despliegue con llama.cpp.
- **Latencia y throughput**: en las pruebas GGUF, el decode varía entre 17,89 tok/s a 32K de contexto y 6,70 tok/s a 262K. Con un ajuste de velocidad a 524K, se midieron 467,11 tok/s de prompt y 4,49 tok/s de decode en el rig local.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Visión | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8B | 262K nativo | Apache-2.0 | Sí | Modelo original sin fine-tune |
| Qwen3.8-27B-Palimpsest | 27,8B | 262K nativo (extensible a 1M) | Apache-2.0 | Sí | Fine-tune experimental con mejoras en prosa y contexto largo |
| Qwen2.5-32B | 32,8B | 128K | Apache-2.0 | No | Alternativa densa de tamaño similar, sin visión |

No se dispone de comparativas de rendimiento estándar entre estos modelos porque Palimpsest no ha publicado benchmarks públicos. La comparación se limita a características técnicas.

## Limitaciones y advertencias

- **Estado preliminar**: el autor lo califica como lanzamiento preliminar; la suite completa de capacidades y la escalera de cuantización GGUF aún están en evaluación.
- **Idioma**: solo inglés confirmado. No hay evidencia de soporte multilingüe.
- **Riesgo de alucinación**: no se han realizado evaluaciones de alucinación; como todo modelo generativo, puede producir información falsa, especialmente en tareas de recuperación con distractores.
- **Sesgos**: los datos de entrenamiento incluyen conjuntos de ficción y agentes; no se documentan sesgos específicos, pero el modelo puede reflejar los sesgos de sus fuentes.
- **Contexto largo**: las pruebas de 512K-1M con YaRN están en progreso; no se recomienda usar esos rangos en producción hasta que se publiquen resultados.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento tienen licencias propias (CDLA-Permissive-2.0 para orca-agentinstruct, Apache-2.0 para los demás). Verificar cumplimiento de cada fuente.
- **Rendimiento en producción**: las mediciones GGUF son de un entorno específico; el rendimiento variará según hardware y configuración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xero0000/Qwen3.8-27B-Palimpsest
- Repositorio GGUF derivado: https://huggingface.co/xero0000/Qwen3.8-27B-Palimpsest-GGUF
- Guía de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- OpenLM.ai sobre Qwen3.8: https://openlm.ai/qwen3.8/
