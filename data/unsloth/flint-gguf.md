# unsloth/flint-GGUF

## Resumen

Flint es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Recursive, disenado especificamente como motor de agentes de codigo: explorar repositorios, localizar y corregir errores, implementar funcionalidades y escribir tests. Cuenta con 39.800 millones de parametros totales y aproximadamente 2.500 millones activos por token (unos 2.200 millones en el cuerpo del modelo mas la cabeza de salida), lo que lo situa en la categoria que el autor denomina "40B-A2.5B".

La relevancia de esta ficha concreta es que `unsloth/flint-GGUF` es la distribucion cuantizada en formato GGUF del checkpoint oficial `RecursiveSI/flint`, publicada por Unsloth con su pipeline Dynamic 3.0 e importance matrix (imatrix). El checkpoint original solo se distribuye en BF16 con un kit de servicio SGLang y requiere una GPU B300 o H200 por replica; la version GGUF abre la puerta a ejecucion local con llama.cpp y derivados en hardware mucho mas modesto.

El modelo maneja entrada y salida de texto, modo de razonamiento explicito y uso de herramientas multiturno compatible con la API de OpenAI. Su configuracion documentada de contexto alcanza los 262.144 tokens y declara un corte de conocimiento en junio de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts |
| Parametros totales | 39.785.287.456 (39,8B) |
| Parametros activos | ~2,5B por token (cuerpo ~2,2B mas cabeza de salida) |
| Longitud de contexto | 262.144 tokens (prompt + salida) |
| Tipos de cuantizacion | GGUF con Unsloth Dynamic 3.0 e imatrix; niveles concretos no disponibles en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 283,2 GB con varias variantes); el modelo base se publica en BF16 safetensors (~80 GB) |
| Vocabulario | 150.144 tokens |
| Capas | 49 (2 densas + 47 MoE) |
| Expertos por capa MoE | 256 enrutados, 6 seleccionados por token, mas 1 experto compartido siempre activo |
| Atencion | 35 capas de ventana deslizante (513 tokens) + 14 capas de atencion completa; 32 cabezas de consulta y 4 de clave/valor, dimension 128 |
| Entrada / salida | Texto / texto |
| Corte de conocimiento | Junio de 2026 |

## Arquitectura y entrenamiento

Flint es un transformer decoder-only con 49 capas: las dos primeras son densas y las 47 restantes son capas MoE con 256 expertos enrutados cada una, de los que se activan 6 por token, mas un experto compartido que permanece siempre activo. El patron de atencion es hibrido: 35 capas usan ventana deslizante de 513 tokens (el token actual mas los 512 precedentes) y solo 14 capas mantienen atencion completa sobre todo el contexto. Esta decision reduce de forma drastica el coste de cache KV en contextos largos, ya que solo 14 capas escalan con la longitud total. Las capas de ventana deslizante usan RoPE, mientras que las de atencion completa no aplican codificacion posicional. Se anaden RMSNorm por cabeza sobre QK y sumideros de atencion (attention sinks) aprendidos por cabeza.

El modelo incorpora razonamiento explicito y entrenamiento para uso de herramientas multiturno, orientado a bucles agenticos con decodificacion de hasta 32.768 tokens o mas en problemas dificiles. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO; esos datos figuran como no disponibles. Tampoco se documenta el proceso de cuantizacion mas alla de la referencia a Unsloth Dynamic 3.0 con imatrix y a las graficas de KLD y top-1 frente a tamano que acompana la model card.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito (`reasoning_content`), que el cliente debe preservar en el historial de la conversacion.
- Codificacion agentica: exploracion de repositorios, localizacion de bugs, implementacion de funcionalidades y escritura de tests.
- Uso de herramientas y function calling compatible con la API de OpenAI, incluyendo llamadas multiturno.
- Razonamiento multi-paso y ejecucion de bucles agenticos largos (presupuesto recomendado de al menos 32.768 tokens de salida en problemas dificiles).
- Manejo de contextos extensos de hasta 262.144 tokens, adecuado para volcar arboles de repositorio o documentacion completa.
- Capacidades multilingues: no documentadas en la informacion proporcionada.
- Vision y audio: no disponibles; el modelo es exclusivamente texto a texto.

## Casos de uso

- Agente de terminal para tareas de ingenieria: el modelo esta evaluado en Terminal-Bench 2.1 con el agente Terminus 2, de modo que puede operar bucles de shell, inspeccionar ficheros y aplicar parches de forma autonoma con 262.144 tokens de contexto.
- Resolucion de incidencias sobre repositorios reales: con un 74,2% en SWE-bench Verified y 89,7% en SWE-bench Pro v2 (evaluado con mini-swe-agent), encaja en pipelines que reciben un issue y devuelven un parche verificable.
- Revision de pull requests con contexto completo: la ventana de 262.144 tokens permite cargar el diff, los ficheros afectados y las convenciones del proyecto en una sola peticion.
- Refactorizaciones y migraciones multi-archivo: la combinacion de contexto largo y tool calling permite leer, editar y validar cambios en cadena dentro de un mismo bucle agentico.
- Generacion de tests unitarios y de integracion: se le puede pedir que derive casos a partir del codigo y ejecute la suite mediante llamadas a herramientas hasta que pase.
- Despliegue local con privacidad de codigo: al existir variantes GGUF, se puede servir en una estacion de trabajo o en un portatil de gama alta sin enviar codigo propietario a APIs externas, manteniendo el modo de razonamiento.
- Integracion en CI/CD: al exponer una API compatible con OpenAI, se puede conectar a un job que abra una rama, aplique el parche y ejecute el linter y los tests antes de solicitar revision.
- Asistente tecnico sobre documentacion interna: con 262.144 tokens de contexto se puede indexar manuales y ADRs y responder con citas dentro de la misma ventana.

## Benchmarks y rendimiento

Resultados publicados por Recursive para el checkpoint BF16/NVFP4, con temperatura 1.0, top-p 0.95 y top-k 20; media de pass@1 sobre al menos cinco intentos:

| Benchmark | Resultado | Configuracion |
|---|---|---|
| Terminal-Bench 2.1 | 54,9% | Agente Terminus 2; las soluciones obtenidas mediante recuperacion web se contabilizan como fallidas |
| SWE-bench Pro v2 | 89,7% | Agente mini-swe-agent |
| SWE-bench Verified | 74,2% | Agente mini-swe-agent |

Advertencias sobre estas cifras: las puntuaciones marcadas por el autor como medidas por Recursive no son directamente comparables con las reportadas por otros desarrolladores, ya que los entornos de evaluacion difieren y no todos aplican el mismo ajuste sobre recuperacion web. Ademas, estos resultados corresponden al checkpoint BF16/NVFP4, no a las cuantizaciones GGUF de este repositorio, cuyo impacto en calidad se documenta solo de forma grafica (KLD y top-1 frente a tamano). No se han publicado resultados por benchmark para las variantes GGUF en la informacion disponible.

## Requisitos de hardware

- Peso del checkpoint BF16: aproximadamente 80 GB, por lo que el checkpoint original necesita una B300 o una H200 por replica segun el kit SGLang del autor.
- Estimacion de VRAM para GGUF (calculo propio a partir de 39,8B parametros, sin contar cache KV): ~14 GB en Q2_K, ~19 GB en Q3_K_M, ~24 GB en Q4_K_M, ~28 GB en Q5_K_M, ~33 GB en Q6_K y ~42 GB en Q8_0.
- Cache KV en contexto largo: con 4 cabezas KV, dimension 128 y solo 14 capas de atencion completa, el coste ronda los 28 KB por token en FP16 (unos 7,5 GB a 262.144 tokens); las 35 capas de ventana deslizante quedan acotadas a 513 tokens y aportan del orden de decenas de MB. Estimacion propia.
- GPU consumer: las variantes de 4 y 5 bits caben en una RTX 4090 (24 GB) o RTX 5090 (32 GB) si se limita el contexto o se descargan parcialmente expertos a RAM; dado que solo se activan ~2,5B parametros por token, el offload de expertos a CPU penaliza menos que en un modelo denso equivalente.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, servidores compatibles con GGUF) para las variantes cuantizadas; SGLang para el checkpoint completo. No se documenta soporte en vLLM ni TGI, y el autor indica que aun no se incluye codigo de modelado para Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas publicas y no forman parte de la informacion proporcionada en esta busqueda; conviene verificarlos antes de citarlos.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|---|
| Flint (Recursive) | 39,8B | ~2,5B | 262.144 | Apache 2.0 | Terminal-Bench 2.1 54,9%; SWE-bench Pro v2 89,7%; SWE-bench Verified 74,2% |
| Qwen3-Coder-30B-A3B | ~30,5B | ~3,3B | 262.144 (extensible) | Apache 2.0 | no disponible |
| GLM-4.5-Air | ~106B | ~12B | 131.072 | MIT | no disponible |
| Devstral-Small-2507 | ~24B | denso | 131.072 | Apache 2.0 | no disponible |

Frente a las alternativas, Flint destaca por su relacion entre parametros activos y contexto (2,5B activos con 262.144 tokens), por una licencia permisiva y por publicar resultados agenticos en lugar de benchmarks academicos clasicos. Su desventaja principal es la madurez del ecosistema: no hay codigo de Transformers y el soporte de serving documentado se limita a SGLang y al ecosistema GGUF.

## Limitaciones y advertencias

- Idiomas soportados no documentados: no se especifica cobertura multilingue ni calidad fuera del ingles, idioma en el que esta redactada toda la documentacion.
- Riesgo de alucinacion: es un modelo generativo sin mecanismo de verificacion integrado; en tareas de codigo debe validarse siempre con compilacion y tests.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad o robustez, por lo que se desconoce su comportamiento en dominios sensibles.
- Brecha entre benchmarks y cuantizacion: las cifras de Terminal-Bench y SWE-bench corresponden al checkpoint BF16/NVFP4; el rendimiento real de las variantes GGUF de 2 a 4 bits puede degradarse y el autor solo aporta graficas de KLD y top-1.
- Requisito de preservar el razonamiento: el autor indica explicitamente que el `reasoning_content` devuelto debe conservarse en el historial; descartarlo puede degradar la calidad en conversaciones multiturno.
- Contexto efectivo: aunque se documentan 262.144 tokens, solo 14 capas usan atencion completa, por lo que la recuperacion de informacion muy dispersa en contextos extremos puede verse afectada.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y sin garantias; no impone restricciones adicionales, pero conviene revisar los terminos del modelo base `RecursiveSI/flint` por si anaden condiciones.
- Madurez del ecosistema: sin codigo de Transformers y con soporte de serving limitado, la integracion en produccion exige mas trabajo de ingenieria que modelos con ecosistema asentado.
- Fecha de corte de conocimiento en junio de 2026: cualquier API o practica posterior puede no estar reflejada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/flint-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Organizacion Recursive en Hugging Face: https://huggingface.co/RecursiveSI
- Blog de presentacion: https://www.recursive.com/updates/introducing-recursive-flint
- Documentacion: https://docs.recursive.com/getting-started
- Motor local: https://github.com/recursive-oss/rec
- Documentacion de Unsloth Dynamic 3.0 GGUFs: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Documentacion de Unsloth: https://unsloth.ai/docs
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
