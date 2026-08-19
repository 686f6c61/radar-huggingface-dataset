# spinochenza/XORTRON-NXTXPRT10PRO-31B

## Resumen

XORTRON-NXTXPRT10PRO-31B es un modelo de lenguaje de 31 273 millones de parámetros (31,27B) desarrollado por spinochenza como parte del proyecto XORTRON Criminal Computing, un experimento de investigación centrado en la seguridad y la alineación de la inteligencia artificial. El modelo es un fine-tuning de `darkc0de/gemma-4-31B-it-updated-heretic`, que a su vez deriva de Gemma 4 31B, y ha sido sometido a un proceso de "abliteración" (abliteration) para eliminar los mecanismos de rechazo y censura, lo que lo convierte en un modelo sin restricciones de contenido.

El objetivo declarado del proyecto es estudiar los riesgos de explotación criminal de la IA, tal y como se documenta en el informe del Congreso de los Estados Unidos citado en la model card. Por tanto, este modelo no está pensado para uso general en producción, sino como herramienta de investigación en seguridad ofensiva, red teaming y análisis de comportamientos no alineados. A pesar de su naturaleza controvertida, se distribuye bajo licencia Apache 2.0, lo que permite su uso y modificación con fines de investigación.

El modelo está disponible en formato safetensors (62,6 GB en el repositorio) y también existe una versión GGUF cuantizada creada por la comunidad. Su pipeline declarado es `image-text-to-text`, aunque no se han publicado detalles sobre capacidades multimodales reales. No se han publicado resultados de benchmarks ni información detallada sobre el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4 31B) |
| Parametros totales | 31 273 086 512 (31,27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (FP16/BF16) y GGUF (cuantizaciones de la comunidad, p. ej. Q4_K_M) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (derivado) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 31B, un transformer denso con aproximadamente 31 000 millones de parámetros. El modelo base `darkc0de/gemma-4-31B-it-updated-heretic` es un fine-tuning de Gemma 4 con ajuste instructivo y un enfoque "heretic" (probablemente orientado a eliminar restricciones). Sobre ese modelo, XORTRON-NXTXPRT10PRO-31B aplica técnicas de abliteración, un método que modifica los pesos del modelo para suprimir las activaciones asociadas a comportamientos de rechazo o negativa a responder.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se utilizaron técnicas de RLHF, DPO u otras. Los tags de HuggingFace indican el uso de la librería Unsloth para el fine-tuning, pero no se especifican hiperparámetros ni detalles del proceso. El proyecto se enmarca en una investigación sobre seguridad de IA y explotación criminal, lo que sugiere que el entrenamiento pudo haber incluido datos deliberadamente dañinos o tóxicos para estudiar el comportamiento del modelo sin alineación.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas largas y detalladas.
- Capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno (heredada del fine-tuning instructivo de Gemma 4).
- Generacion de contenido sin censura ni filtros de seguridad, incluido material potencialmente dañino, toxico o ilegal (por diseño del proyecto).
- Soporte de tool calling / function calling: no confirmado explicitamente, aunque los tags indican compatibilidad con `text-generation-inference` y `endpoints_compatible`.
- Capacidades multimodales: el pipeline declarado es `image-text-to-text`, pero no hay documentacion que confirme el procesamiento real de imagenes. Se recomienda tratarlo como no verificado.
- No se ha confirmado soporte de agentes ni razonamiento multi-paso mas alla de lo que ofrece el modelo base.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve para estudiar como se comporta un LLM sin alineacion ante prompts maliciosos, util para red teaming y evaluacion de riesgos en sistemas de IA.
- Pruebas de robustez de sistemas de moderacion: se puede usar para generar contenido toxico o incendiario y evaluar la eficacia de filtros de contenido en aplicaciones de produccion.
- Analisis de sesgos y comportamientos no eticos: al carecer de restricciones, permite observar sesgos latentes del modelo base Gemma 4 sin el enmascaramiento de la alineacion.
- Desarrollo de contramedidas de seguridad: los resultados de interacciones con este modelo pueden informar el diseno de sistemas de deteccion de contenido abusivo o de jailbreaks.
- Educacion en etica de IA: en entornos academicos controlados, puede usarse como ejemplo de los riesgos de desplegar modelos sin alineacion.
- Benchmarking de tecnicas de abliteracion: dado que es un modelo abliterado, puede compararse con su version original para medir el impacto de esa tecnica en el comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4 (GGUF), se necesitan aproximadamente 18-20 GB de VRAM. En FP16 (safetensors), se requieren unos 62 GB de VRAM, lo que obliga a usar multiples GPUs o una GPU profesional como A100 80GB o H100.
- GPU recomendadas: para FP16, A100 80GB, H100 80GB o 2x RTX 4090 (con paralelismo). Para cuantizacion GGUF Q4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes.
- Si cabe en consumer GPU: si, con cuantizacion GGUF Q4 o Q5 en GPUs de 24 GB. No cabe en GPUs de 12 GB o menos.
- Opciones de despliegue: vLLM (con soporte de safetensors), llama.cpp (para GGUF), Ollama (si se convierte a GGUF), TGI (Text Generation Inference) segun los tags.
- Latencia y throughput: no disponible. Para un modelo de 31B en una RTX 4090 con Q4, se puede estimar un throughput de 20-40 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| XORTRON-NXTXPRT10PRO-31B | 31,27B | no disponible | Apache 2.0 | Sin censura, abliterado |
| darkc0de/gemma-4-31B-it-updated-heretic | 31,27B | no disponible | Apache 2.0 | Fine-tuning "heretic" sin abliteracion |
| Gemma 4 31B (base) | 31,27B | no disponible | Apache 2.0 | Modelo base de Google, con alineacion estandar |
| Llama 3 30B (hipotetico) | 30B | 8K (típico) | Llama 3 license | Alineado, con restricciones de uso |

No se dispone de datos de rendimiento comparativos. La principal diferencia de este modelo es la eliminacion deliberada de la alineacion, lo que lo hace unico en su categoria, pero no comparable en terminos de benchmarks estandar.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin alineacion, es probable que amplifique sesgos toxicos, discriminatorios o violentos presentes en los datos de entrenamiento de Gemma 4.
- Riesgo de alucinacion: no hay informacion especifica, pero como cualquier LLM, puede generar informacion falsa o inventada con alta confianza.
- Limitaciones de contexto: la longitud de contexto no esta documentada; se desconoce si soporta ventanas largas.
- Limitaciones de idioma: solo se declara ingles. No se recomienda su uso en otros idiomas.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial de un modelo disenado para generar contenido danino puede violar politicas de plataformas o leyes locales. Se recomienda consultar con asesoria legal antes de cualquier despliegue.
- Advertencia para produccion: este modelo no debe usarse en sistemas orientados al publico, ya que puede generar contenido ilegal, incendiario o traumatico sin ninguna barrera.
- El proyecto se autodefine como un experimento de investigacion en seguridad; su uso fuera de ese contexto no esta justificado.

## Enlaces

- HuggingFace (modelo original): https://huggingface.co/spinochenza/XORTRON-NXTXPRT10PRO-31B
- Version GGUF de la comunidad: https://huggingface.co/mradermacher/XORTRON-NXTXPRT10PRO-31B-GGUF
- Version de darkc0de (modelo base del fine-tuning): https://huggingface.co/darkc0de/XORTRON-NXTXPRT10PRO-31B
- Endpoint de inferencia FriendliAI: https://friendli.ai/models/darkc0de/XORTRON-NXTXPRT10PRO-31B
- Grafo de arquitectura (hfviewer): https://hfviewer.com/darkc0de/XORTRON-NXTXPRT10PRO-31B
- Listado de modelos lanzados en la semana del 9 de agosto de 2026 (Featherless): https://featherless.ai/model-releases/2026-08-09
- Informe del Congreso de EE. UU. sobre IA y explotacion criminal (citado en la model card): https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
