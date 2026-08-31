# spinochenza/Huihui-Ornith-1.5-35B-A3B-abliterated

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated es una version sin censura del modelo Ornith-1.5-35B-A3B, creada mediante la tecnica de abliteration, que elimina los rechazos del modelo original. El autor del repositorio es spinochenza, aunque la abliteracion fue realizada originalmente por el equipo de huihui-ai, como indica el nombre del modelo. Se trata de un modelo de lenguaje de arquitectura MoE (mixture of experts) basado en la familia Qwen3.5, con 35.950 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token (A3B).

El modelo se distribuye bajo licencia MIT y esta pensado para aplicaciones donde se requiere una generacion de texto sin restricciones de contenido, como roleplay, escritura creativa o investigacion sobre alineacion de modelos. Al ser una version abliterada, solo se han modificado las capas 11 a 29 del modelo base, lo que reduce los rechazos sin alterar el resto de capacidades. Su relevancia radica en ofrecer una alternativa open source a modelos propietarios con filtros de contenido, manteniendo un rendimiento competitivo gracias a su arquitectura MoE eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen3.5 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (original); GGUF disponible en repositorios externos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF (externo) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con 35.950 millones de parametros totales y 3.000 millones activos por token, siguiendo el diseño de la familia Qwen3.5. Esta configuracion permite un equilibrio entre capacidad y eficiencia computacional, activando solo una fraccion de los pesos en cada paso de generacion. El proceso de abliteration aplicado sobre este modelo modifica los residuos de las capas 11 a 29 para eliminar los patrones de rechazo aprendidos durante el entrenamiento, sin necesidad de reentrenar el modelo.

No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados ni las tecnicas de alineacion empleadas (RLHF, DPO, etc.). El sitio oficial de Ornith menciona un enfoque de "self-scaffolding" y "self-improvement", lo que sugiere que el modelo base incorpora mecanismos de auto-mejora y razonamiento estructurado, aunque no se proporcionan mas detalles tecnicos en la informacion disponible.

## Capacidades

- Generacion de texto libre sin rechazos ni filtros de contenido, gracias al proceso de abliteration.
- Razonamiento y resolucion de problemas complejos, heredados del modelo base Ornith-1.5.
- Generacion de codigo y soporte de tareas de programacion, aunque no se especifican benchmarks concretos.
- Capacidad multilingue presumiblemente amplia, dado su origen en la familia Qwen, pero no confirmada en la documentacion.
- Soporte de tool calling y function calling no confirmado; el modelo base podria incluirlo, pero no se documenta en esta version.
- Capacidades de agentes y razonamiento multi-paso no documentadas explicitamente, pero plausibles dada la arquitectura MoE.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo puede generar personajes, dialogos y tramas sin censura, lo que lo hace adecuado para juegos de rol por texto o asistentes de escritura creativa.
- Generacion de contenido creativo sin restricciones: redaccion de ficcion, poesia o guiones donde se requiera explorar temas tabu o controvertidos sin filtros automaticos.
- Investigacion sobre alineacion y seguridad de IA: permite estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas antes y despues de la abliteration.
- Asistencia en entornos de desarrollo con requisitos de contenido abierto: por ejemplo, generacion de documentacion tecnica o ejemplos de codigo que puedan incluir temas sensibles.
- Evaluacion de modelos MoE en tareas de razonamiento: su arquitectura con 3.000 millones de parametros activos permite probar eficiencia en entornos con recursos limitados.
- Despliegue en aplicaciones de chat sin moderacion: util para prototipos donde el control de contenido se gestiona externamente, no a nivel del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo abliterado. El modelo base Ornith-1.5 podria tener benchmarks publicados en su pagina oficial, pero no se han incluido en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.950 millones de parametros totales, en FP16 se necesitarian aproximadamente 72 GB de VRAM. Con cuantizacion 4-bit (GGUF Q4_K_M), el modelo ocupa alrededor de 20 GB, y con 8-bit unos 36 GB.
- GPU recomendadas: para cuantizacion 4-bit, una RTX 4090 (24 GB) o RTX A6000 (48 GB) es suficiente; para FP16 se requieren GPUs de datacenter como A100 (80 GB) o H100.
- Al ser MoE con 3.000 millones de parametros activos, la VRAM necesaria para los pesos activos es menor, pero todos los pesos deben estar cargados en memoria, por lo que el requisito principal es el tamano total del modelo.
- Opciones de despliegue: transformers (Hugging Face), vLLM, llama.cpp (via GGUF), Ollama (si se convierte a formato compatible) y TGI.
- Latencia y throughput: no disponibles, pero al tener solo 3.000 millones de parametros activos, la velocidad de generacion deberia ser significativamente mayor que la de un modelo denso de 35.000 millones, aunque no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| Huihui-Ornith-1.5-35B-A3B-abliterated | 35.95B | ~3B | no disponible | MIT | Version abliterada de Ornith-1.5 |
| Ornith-1.5-35B-A3B (base) | 35.95B | ~3B | no disponible | MIT | Modelo original con rechazos |
| Qwen3-30B-A3B (referencia) | 30B | 3B | no disponible | Apache 2.0 | Modelo MoE similar de la familia Qwen |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia entre la version abliterada y el modelo base es la ausencia de rechazos, mientras que el resto de capacidades deberian ser identicas. Qwen3-30B-A3B es un modelo MoE comparable en tamano, pero no se ha verificado su rendimiento relativo.

## Limitaciones y advertencias

- Al ser una version abliterada, el modelo puede generar contenido ofensivo, ilegal o danino sin restricciones. No debe utilizarse en aplicaciones de produccion sin moderacion externa.
- La abliteration solo se aplico a las capas 11 a 29, por lo que algunos rechazos podrian persistir en otras capas o aparecer en contextos especificos.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo.
- La licencia MIT permite uso comercial, pero el modelo base Ornith-1.5 tambien es MIT, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente sin validacion externa. Se recomienda verificar la integridad de los pesos antes de usarlo en entornos criticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spinochenza/Huihui-Ornith-1.5-35B-A3B-abliterated
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo base Ornith-1.5: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Version GGUF (mradermacher): https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF
- Herramienta de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
