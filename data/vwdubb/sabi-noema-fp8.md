# vwdubb/sabi-noema-FP8

## Resumen

Sabi-Noema-FP8 es una version cuantizada en FP8 del modelo agentic Sabi-Noema, publicada por el usuario vwdubb a partir de los pesos de sabicap/sabi-noema. Se trata de un transformer denso de aproximadamente 27.356 millones de parametros (27,36 B) construido sobre Qwen3.8-27B, con atencion hibrida (hybrid-attention) y una ventana de contexto de 262.144 tokens. El modelo original esta orientado a tareas de agente: uso de herramientas, ejecucion en terminal, ingenieria de software y conversaciones multiturno con planificacion.

La relevancia de esta publicacion concreta es doble. Por un lado, Sabi-Noema se entreno con entornos de aprendizaje por refuerzo exclusivamente de codigo abierto, y sus autores reportan mejoras notables frente a la base en Terminal-Bench 2.1 (76,0 % frente a 73,0 %), DeepSWE (47,5 % frente a 38,5 %), τ³-bench (259 de 278 frente a 220) y una reduccion de la tasa de alucinacion en AA-Omniscience del 30,4 % al 15,1 %, ademas de una eficiencia de tokens 2,3 veces mejor en las tareas que ambos modelos resuelven. Por otro, esta variante FP8 reduce el peso de los pesos de aproximadamente 55 GB en BF16 a un repositorio de 37,6 GB, lo que abarata el despliegue en GPUs de 80 GB o en configuraciones multi-GPU de gama profesional.

Conviene senalar que se trata de una cuantizacion de terceros (autor vwdubb, no el equipo sabicap), con cero descargas y cero likes en el momento de la consulta, y sin resultados de evaluacion publicados para la version FP8. Las cifras de rendimiento disponibles corresponden al modelo base en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (hybrid-attention), derivado de Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | FP8 (compressed-tensors) en esta publicacion; el modelo base se distribuye en BF16; la model card del base menciona conversion a GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors), libreria transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de unos 27 B de parametros con mecanismo de atencion hibrida, segun la propia model card del modelo base y la etiqueta `hybrid-attention`. El contexto maximo es de 262.144 tokens, y el despliegue de referencia en vLLM exige limitar `--max-num-seqs` a 32 porque el valor por defecto de 1024 excede los bloques de estado de atencion lineal disponibles en una sola GPU; este detalle es indicativo de que la atencion lineal forma parte del diseno y de que su gestion de estado condiciona el batching. Existe una variante adicional, Sabi-Noema-MLA, con multi-head latent attention, pensada para soportar muchas sesiones largas por GPU.

En cuanto al entrenamiento, la model card indica que Sabi-Noema se construyo sobre Qwen3.8-27B utilizando exclusivamente entornos de RL de codigo abierto, con el objetivo declarado de mejorar simultaneamente la capacidad agentica de un modelo pequeno y su eficiencia de razonamiento. El resultado medible es una reduccion fuerte del numero de tokens de salida (2,3 veces menos que Qwen3.8-27B y 2,0 veces menos que Swift 1.5 en tareas de Terminal-Bench que ambos resuelven; 82,7K frente a 118,8K tokens por tarea en DeepSWE). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas adicionales como DPO, RLHF clasico o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multiturno, con modo de razonamiento (thinking) activado por defecto y un modo no-thinking soportado por la plantilla de chat (`enable_thinking: false`) que no fue evaluado.
- Ejecucion de tareas en terminal y en entornos de linea de comandos: Terminal-Bench 2.1 con 76,0 % y DeepSWE con 47,5 %.
- Uso de herramientas y function calling: parser de tool calls en formato XML de Qwen3.8 (`qwen3_xml`), soportado de forma nativa en vLLM; BFCL v4 multiturno con 63,9 y MCPMark con 48 de 55.
- Comportamiento agentico multiturno y multi-paso: τ³-bench con 259 de 278 y ClawEval con 162 de 199.
- Razonamiento cientifico y de conocimiento: GPQA-Diamond con 90,6 y MMLU-Pro con 85,1.
- Generacion de codigo: LiveCodeBench v6 con 88,0.
- Seguimiento de instrucciones: IFBench con 80,9.
- Contexto largo: AA-LCR con 82,3 sobre una ventana de hasta 262K tokens.
- Fiable en menor grado que la base en cuanto a alucinacion: 15,1 % de tasa frente al 30,4 % del modelo base en AA-Omniscience.
- La etiqueta `image-text-to-text` aparece en los tags del repositorio, pero el pipeline declarado es `text-generation` y la model card no describe capacidades de vision; la discrepancia no esta resuelta en la informacion disponible.

## Casos de uso

- Agentes de terminal y automatizacion de operaciones: el modelo esta optimizado para entornos de shell y tareas de tipo Terminal-Bench, con una tasa de exito reportada del 76,0 %, lo que lo hace adecuado para agentes que instalan dependencias, depuran fallos y ejecutan pipelines de build.
- Ingenieria de software asistida y resolucion de issues: con 47,5 % en DeepSWE y 88,0 en LiveCodeBench v6, puede integrarse en flujos de trabajo tipo Claude Code o agentes de repositorio para localizar y corregir errores con un presupuesto de tokens bajo (82,7K tokens de salida por tarea, frente a 118,8K del base).
- Atencion al cliente automatizada en dominios regulados como banca: el benchmark τ³-bench banking alcanza 43,5 % (frente a 39,8 % del modelo base) sobre 97 tareas repetidas cinco veces, lo que resulta util para agentes que deben aplicar politicas, verificar identidad y cerrar transacciones por API.
- Orquestacion de herramientas via MCP: con 48 de 55 en MCPMark y soporte del parser `qwen3_xml`, encaja en arquitecturas de agentes que descubren y llaman servidores MCP en varios pasos.
- Asistentes conversacionales de contexto largo: los 262.144 tokens de ventana permiten mantener historiales extensos, documentacion tecnica completa o transcripciones largas sin trocear, con 82,3 en AA-LCR.
- Analisis sobre documentacion corporativa y RAG: la ventana de 262K y la baja tasa de alucinacion (15,1 %) reducen el riesgo de respuestas inventadas cuando el material de referencia se inyecta completo en el contexto.
- Reduccion de coste por token en produccion: la eficiencia declarada (29,3K tokens medianos por tarea en Terminal-Bench frente a 65,3K del base) se traduce directamente en menor factura de inferencia en cargas de agente de alta frecuencia.
- Revision cientifica y tecnica asistida: con 90,6 en GPQA-Diamond y 85,1 en MMLU-Pro puede emplearse como copiloto en dominios de fisica, quimica y biologia, siempre con verificacion humana.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del modelo base sabicap/sabi-noema y se midieron en despliegues H100 TP2 (Muse Glimmer en TP1). No se han publicado resultados especificos para la version FP8 de vwdubb.

| Benchmark | Sabi-Noema | Qwen3.8-27B | ThinkingCap | Swift 1.5 | Muse Glimmer 30B | GPT-6 Luna, high |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Terminal-Bench 2.1 (%) | 76,0 | 73,0 | 67,8 | 62,9 | 48,3 | 68,5 |
| DeepSWE (%) | 47,5 | 38,5 | 38,9 | 39,8 | 5,3 | 53,1 |
| τ³-bench (/278) | 259 | 220 | 204 | 195 | 219 | 183 |
| τ³-bench banking (%, 97 tareas x 5) | 43,5 | 39,8 | 36,9 | 40,4 | 15,9 | 28,7 |
| ClawEval (/199) | 162 | 151 | 151 | 160 | 153 | 160 |
| BFCL v4 multi-turn | 63,9 | 59,6 | 58,8 | 62,6 | 55,8 | 44,9 |
| MCPMark (/55) | 48 | 36 | 42 | 37 | 32 | 38 |
| AA-Omniscience index | +2,3 | -5,2 | -10,5 | -22,8 | -28,0 | +5,2 |
| Tasa de alucinacion (%, menor es mejor) | 15,1 | 30,4 | 36,1 | 52,6 | 84,6 | 85,3 |
| LiveCodeBench v6 | 88,0 | 89,7 | 88,9 | 89,1 | 64,0 | 88,0 |
| GPQA-Diamond | 90,6 | 89,2 | 88,0 | 88,6 | 83,5 | 89,4 |
| MMLU-Pro | 85,1 | 85,4 | 85,0 | 85,7 | 84,2 | 83,4 |
| AA-LCR | 82,3 | 83,0 | 82,0 | 82,7 | 81,3 | 83,0 |
| IFBench | 80,9 | 79,5 | 79,7 | 81,1 | 77,0 | 61,0 |
| TB2.1 tokens de salida por tarea (mediana) | 29,3K | 65,3K | 51,0K | 57,1K | 20,6K | no disponible |
| τ³-bench tokens por conversacion (media) | 3,9K | 4,2K | 3,0K | 3,6K | 2,7K | no disponible |
| DeepSWE tokens de salida por tarea (media) | 82,7K | 118,8K | 103,7K | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para la version FP8: en torno a 27-30 GB solo para pesos (27,36 B de parametros a 8 bits), mas cache KV y estados de atencion lineal, lo que en la practica situa el consumo util en el rango de 32-40 GB segun la longitud de contexto y el numero de secuencias simultaneas. Estimacion derivada del recuento de parametros y del tamano del repositorio (37,6 GB), no confirmada por el autor.
- GPU recomendadas: una A100 80 GB o H100 80 GB es suficiente y es la configuracion usada en las evaluaciones del modelo base. Para FP8 en BF16 el modelo base ocupa unos 55 GB, por lo que una sola GPU de 80 GB lo aloja con contexto largo.
- Cabe en GPU de consumo: no en una RTX 4090 de 24 GB en FP8 con contexto completo; se requeriria cuantizacion adicional a 4 bits (por ejemplo, conversion a GGUF) o el uso de dos GPU de 24 GB. Una RTX 6000 Ada o L40S de 48 GB queda justa pero es viable con contexto reducido.
- Opciones de despliegue: vLLM 0.31.0 (stock) con `--max-model-len 262144 --max-num-seqs 32 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_xml`, transformers, y conversion a GGUF para llama.cpp. No se documenta soporte explicito de Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card si aporta una metrica indirecta de coste: 29,3K tokens de salida medianos por tarea en Terminal-Bench 2.1, frente a 65,3K del modelo base en BF16.
- Nota de configuracion: las evaluaciones usaron `--default-chat-template-kwargs '{"preserve_thinking": false}'`, es decir, sin reinyectar el razonamiento de turnos anteriores. El script de referencia es `examples/serve_vllm.sh`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 | DeepSWE | Tasa de alucinacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Sabi-Noema (base de esta cuantizacion) | ~27 B denso hibrido | 262K | 76,0 % | 47,5 % | 15,1 % | Apache 2.0 | Pesos abiertos en HuggingFace (sabicap/sabi-noema) |
| Qwen3.8-27B | ~27 B denso | no disponible en la informacion | 73,0 % | 38,5 % | 30,4 % | no disponible en la informacion | HuggingFace (Qwen/Qwen3.8-27B) |
| ThinkingCap | no disponible | no disponible | 67,8 % | 38,9 % | 36,1 % | no disponible | no disponible |
| Swift 1.5 | no disponible | no disponible | 62,9 % | 39,8 % | 52,6 % | no disponible | no disponible |
| Muse Glimmer 30B | 30 B | 131K | 48,3 % | 5,3 % | 84,6 % | no disponible | servido en BF16 localmente |
| GPT-6 Luna (high) | propietario | no disponible | 68,5 % | 53,1 % | 85,3 % | propietaria | API via OpenRouter |

## Limitaciones y advertencias

- Cuantizacion de terceros: esta publicacion la firma el usuario vwdubb, no el equipo sabicap. No hay evaluaciones publicadas de la version FP8, por lo que la degradacion respecto a los pesos BF16 es desconocida.
- Tasa de alucinacion no nula: 15,1 % en AA-Omniscience segun el autor del modelo base, mejor que la base pero todavia relevante en dominios facticos; requiere verificacion en produccion.
- Idioma: el campo de idiomas del repositorio esta vacio ("no disponibles"). La model card no documenta cobertura multilingue ni calidad por idioma, mas alla de la herencia de Qwen3.8-27B.
- Modo no-thinking: la plantilla de chat lo soporta, pero el autor indica explicitamente que no fue evaluado; no hay garantias de comportamiento en ese modo.
- Restricciones de batching: la atencion lineal obliga a fijar `--max-num-seqs 32` en vLLM, ya que el valor por defecto (1024) excede los bloques de estado disponibles por GPU. Esto limita el throughput en despliegues de una sola GPU.
- Rendimiento en banca: el 43,5 % en τ³-bench banking es una mejora relativa frente al 39,8 % del base, pero en terminos absolutos implica que mas de la mitad de las tareas de ese dominio no se resuelven; no es un modelo para automatizacion bancaria sin supervision.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta; no hay validacion comunitaria de la calidad de la cuantizacion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones heredadas del modelo base y de Qwen3.8-27B antes de un despliegue en produccion.
- Discrepancia de etiquetas: el tag `image-text-to-text` sugiere capacidades multimodales que la model card no describe; no debe asumirse vision sin verificacion.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/vwdubb/sabi-noema-FP8
- Modelo base Sabi-Noema: https://huggingface.co/sabicap/sabi-noema
- Variante Sabi-Noema-MLA: https://huggingface.co/sabicap/sabi-noema-mla
- Modelo subyacente Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Metodologia de Terminal-Bench 2.1 en Artificial Analysis: https://artificialanalysis.ai/methodology/intelligence-benchmarking#terminal-bench-v2-1
