# teyler/StepMargin-Qwen3.8-27B-Abliterated-GGUF

## Resumen

StepMargin-Qwen3.8-27B-Abliterated-GGUF es un archivo de investigación publicado por el usuario teyler que documenta una serie de ediciones directas sobre los pesos de la distribución GGUF de Huihui del modelo Qwen3.8-27B en su variante abliterated (sin mecanismos de rechazo). No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional, sino de un experimento de edición de pesos orientado a matemáticas: el autor modifica filas concretas de la matriz `output.weight` y mide el efecto sobre un benchmark de matemáticas de secundaria y universidad. El resultado es un conjunto de checkpoints (tres GGUFs completos, 17 parches binarios y 19 recetas de recuperación) con resultados agregados y trazabilidad SHA-256.

El modelo subyacente es Qwen3.8-27B, un transformer de 27.320.697.856 parámetros (unos 27,3 mil millones). La rama abliterated de Huihui elimina las direcciones de activación asociadas al rechazo, de modo que el modelo responde a peticiones que el original declinaría. Sobre esa base, el autor aplica ediciones quirúrgicas en la capa de salida para intentar mejorar el razonamiento matemático sin reentrenar.

La relevancia es fundamentalmente metodológica: el proyecto publica el protocolo de benchmark, las recetas de restauración y las limitaciones medidas, lo que lo convierte en un caso de estudio sobre hasta qué punto las ediciones locales de pesos pueden mover métricas de razonamiento. Las mejoras reportadas son modestas (230/370 frente a 226/370 en el benchmark emparejado) y el propio autor advierte que la transferencia a problemas nuevos no está verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8-27B, variante abliterated de Huihui) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (incluye variante con imatrix); experimento adicional en binary32 sobre filas de salida |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.8-27B original: un transformer decoder-only denso de aproximadamente 27,3 mil millones de parámetros, distribuido en formato GGUF para inferencia con llama.cpp. La rama de Huihui aplica abliteration, una técnica de edición de pesos que proyecta fuera las direcciones de activación responsables de las respuestas de rechazo, sin reentrenamiento supervisado adicional. Sobre esa base, el autor de esta ficha realiza ediciones directas en cuatro filas de `output.weight`, es decir, en la capa que proyecta el estado oculto final al vocabulario.

No hay datos de entrenamiento nuevos: no se reportan tokens adicionales, datasets, RLHF, DPO ni procesos de alineación. La innovación es el método de edición y su evaluación. El autor define un benchmark emparejado de matemáticas de secundaria y universidad (370 preguntas) y compara checkpoints sucesivos (Pilot 024 como referencia, Pilot 243 como mejor resultado emparejado, Pilot 275 como experimento de precisión binary32 y Pilot 289 como ajuste sobre presentaciones de desarrollo). También construye StepMargin, una aplicación de tutor de matemáticas con un índice de 284 métodos, y un worker de visión que usa un proyector Unsloth sin modificar. El archivo conserva 39 checkpoints editados distintos con verificación SHA-256 para restauración.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.8-27B.
- Razonamiento matemático de nivel secundaria y universitario, foco explícito del proyecto de edición.
- Respuestas sin mecanismos de rechazo gracias a la abliteration del modelo base.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas específicamente para esta variante.
- Capacidades multimodales: el proyecto incluye un worker de visión que emplea el proyector Unsloth F16 sin modificar, pero la variante GGUF principal es de texto.
- Multilingüismo: limitado a inglés según la model card.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre edición de pesos: el archivo permite reproducir las ediciones de las cuatro filas de `output.weight` y verificar los resultados con los hashes SHA-256 incluidos, lo que sirve para estudiar la sensibilidad de la capa de salida en modelos de 27B.
- Tutor de matemáticas local: la aplicación StepMargin usa el modelo con un índice de 284 métodos para guiar a estudiantes de secundaria y universidad, aprovechando el ajuste específico sobre problemas matemáticos.
- Evaluación de transferencia de benchmarks: el protocolo emparejado de 370 preguntas permite medir si las ganancias en el conjunto de desarrollo se mantienen en problemas nuevos, algo que el autor deja explícitamente sin verificar.
- Análisis de precisión en inferencia: el Pilot 275 con trailer binary32 permite estudiar cómo la precisión de las filas de salida afecta a la decodificación en runtimes compatibles.
- Docencia y divulgación técnica: el caso de estudio y el visor de trazas del repositorio sirven para explicar cómo se audita una edición de pesos y qué evidencia se necesita para reclamar una mejora.
- Comparación de linajes abliterated: útil para investigadores que quieran contrastar la rama de Huihui con otras variantes como Blackfrost-AI o Qwen3.8-27B-OBLITERATED en tareas matemáticas.
- Experimentación con llama.cpp: al ser un GGUF estándar (salvo el Pilot 275), se puede cargar en llama.cpp, Ollama u otros runtimes compatibles para pruebas locales.

## Benchmarks y rendimiento

| Checkpoint | Benchmark | Resultado | Notas |
|---|---|---|---|
| Pilot 024 | MMLU matemáticas secundaria y universidad (370 preguntas) | 226/370 | Referencia emparejada |
| Pilot 243 | Mismo benchmark | 230/370 | Cuatro ganancias, cero pérdidas frente a Pilot 024 |
| Pilot 275 | Mismo benchmark | 227/370 | Tres ganancias, dos pérdidas; requiere runtime con precisión compatible |
| Pilot 289 | Presentaciones de desarrollo archivadas (2.356) | +11 con cero pérdidas | Transferencia a problemas nuevos no verificada |
| Pilot 243 y Pilot 024 | Conjunto ciego separado (192 preguntas) | 96/192 cada uno | Empate |
| Pilot 243 y Pilot 024 | Problemas en cuatro órdenes de opciones (48) | 12/48 cada uno | Empate |

En latencia, el autor reporta una única ejecución emparejada en su configuración CUDA: el problema del cilindro se completó en 282 tokens con 6,12 segundos de decodificación en Pilot 243 frente a 6,46 segundos en Pilot 024. No se han publicado resultados de benchmarks estándar (MMLU completo, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 49,5 GB, lo que sugiere que las cuantizaciones incluidas rondan ese tamaño agregado. Para un modelo de 27,3B en GGUF, las cuantizaciones típicas Q4_K_M requieren del orden de 16-18 GB y Q8_0 del orden de 28-30 GB, aunque estas cifras no las confirma el autor.
- GPU recomendadas: el autor menciona una configuración CUDA de laboratorio sin especificar el modelo de GPU. Para 27B en cuantizaciones altas se necesitan GPUs con 24 GB o más (RTX 3090, RTX 4090, A6000, A100, H100).
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 o inferiores dentro de 24 GB; las cuantizaciones más altas requieren múltiples GPUs o GPUs de datacenter.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, servidores con endpoints compatibles, según el tag `endpoints_compatible`). El Pilot 275 requiere un runtime con soporte de precisión binary32 para que las filas añadidas afecten a la decodificación.
- Latencia y throughput: solo se reporta una medición puntual (282 tokens en 6,12 s de decodificación en CUDA para Pilot 243). No hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StepMargin-Qwen3.8-27B-Abliterated (este) | 27,3B | no disponible | Edición de pesos para matemáticas sobre base abliterated | Apache 2.0 | GGUF en Hugging Face |
| Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | Abliteration del Qwen3.8-27B original | Apache 2.0 (heredada) | GGUF en Hugging Face |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED | 27B | no disponible | Variante abliterated con soporte image-text-to-text | no disponible | GGUF en Hugging Face |
| Qwen3.8-27B-OBLITERATED | 27B | no disponible | Otra abliteration del mismo base | no disponible | GGUF, GGUF imatrix y FP8 |

## Limitaciones y advertencias

- Las mejoras reportadas son marginales y de un solo benchmark emparejado: 230/370 frente a 226/370, con empate en el conjunto ciego (96/192) y en el test de cuatro órdenes (12/48). No hay evidencia de mejora generalizable.
- El propio autor indica que la transferencia del Pilot 289 a problemas nuevos y su cualificación nativa quedaron sin verificar; el proyecto se detuvo antes de la comprobación independiente.
- El Pilot 275 requiere un runtime con precisión compatible para que las filas añadidas tengan efecto; en runtimes estándar el comportamiento puede diferir del reportado.
- La abliteration elimina los mecanismos de rechazo, lo que incrementa el riesgo de producir contenido dañino, sesgado o inapropiado sin filtros. No es adecuado para despliegues orientados al público sin moderación adicional.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- No hay información sobre sesgos específicos, tasa de alucinación ni evaluación de seguridad en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías sobre el comportamiento del modelo editado traslada al integrador toda la responsabilidad sobre su calidad y seguridad.
- El repositorio es un archivo de investigación con resultados agregados sobre conjuntos privados; las preguntas, el trabajo de estudiantes y las capturas de origen no son públicas, lo que limita la replicación completa.
- La fecha de creación del repositorio es 2026-11-06, posterior al conocimiento de referencia habitual; los datos deben tratarse como procedentes de un release de investigación reciente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/teyler/StepMargin-Qwen3.8-27B-Abliterated-GGUF
- Modelo base en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Linaje Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de laboratorio: https://github.com/Teylersf/model-weight-editing-lab/tree/f1594dec19ab2735d37cdb78b3a6d49eb36da441
- Caso de estudio: https://github.com/Teylersf/model-weight-editing-lab/blob/f1594dec19ab2735d37cdb78b3a6d49eb36da441/docs/case-study.md
- Protocolo de benchmark público: https://github.com/Teylersf/model-weight-editing-lab/blob/f1594dec19ab2735d37cdb78b3a6d49eb36da441/docs/public-math-benchmarks.md
- Proyector de visión Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/blob/1cff334a4a228324d4ee1f76d55d372588f0d556/mmproj-F16.gguf
- Variante Blackfrost-AI: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF
- Variante Qwen3.8-27B-OBLITERATED: https://abliteratedmodels.org/qwen3.8-27b-obliterated/
