# vwdubb/sabi-noema-NVFP4

## Resumen

Sabi-Noema es un modelo orientado a agentes construido por el equipo SabiCap sobre Qwen3.8-27B mediante aprendizaje por refuerzo en entornos abiertos. La ficha que nos ocupa, `vwdubb/sabi-noema-NVFP4`, es una cuantización NVFP4 (formato de coma flotante de 4 bits de NVIDIA, generado con ModelOpt) del modelo original `sabicap/sabi-noema`, publicada con licencia Apache 2.0 y pesos en safetensors compatibles con `transformers` y con el stack de vLLM.

El interés de esta variante es práctico: reduce el peso en disco y en memoria frente a los ~55 GB en BF16 del modelo original, hasta un repositorio de 21,1 GB, lo que abre la puerta a servirlo en GPUs de 24-48 GB en lugar de exigir un acelerador de 80 GB. El modelo base declara 262.144 tokens de contexto, arquitectura densa híbrida (atención lineal combinada con atención completa) y un enfoque explícito en eficiencia de razonamiento: menos tokens de salida para el mismo trabajo.

Los datos publicados por el autor son llamativos en tareas agénticas: 76,0 % en Terminal-Bench 2.1, 259/278 en τ³-bench y una tasa de alucinación del 15,1 % en AA-Omniscience, frente al 30,4 % del Qwen3.8-27B de partida. Conviene tomar esas cifras como autoevaluación del autor, no como resultado independiente. Hay además una discrepancia relevante entre el recuento real de parámetros del repositorio (18.164.649.200) y los ~27 B que declara la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención lineal + atención completa), heredada de Qwen3.8-27B; tag `qwen3_5`, `hybrid-attention` |
| Parametros totales | 18.164.649.200 (~18,16 B) segun los tensores safetensors del repo; la model card del modelo base declara ~27 B. Discrepancia no aclarada por el autor |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato de NVIDIA via ModelOpt). El repo incluye ademas las etiquetas `8-bit` y `modelopt`. Conversion a GGUF mencionada como via de despliegue, sin artefactos publicados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados NVFP4); repo de 21,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B: un transformer denso con capas híbridas, que combina mecanismos de atención lineal con atención completa para sostener contextos de 262K tokens sin que el coste de atención crezca de forma cuadrática en todas las capas. El autor publica una variante hermana, Sabi-Noema-MLA, con multi-head latent attention, pensada para servir muchas sesiones largas por GPU; es decir, la atención lineal es el cuello de botella operativo del modelo y condiciona el despliegue (vLLM necesita limitar `--max-num-seqs` a 32 porque los bloques de estado de atención lineal no caben de otra forma en una sola GPU).

El entrenamiento descrito consiste en aprendizaje por refuerzo sobre entornos de código abierto exclusivamente, sin datos propietarios, partiendo del modelo base. La model card no detalla el número de tokens de entrenamiento, la composición del dataset de RL ni si hubo fases adicionales de SFT o DPO: esa información no está disponible. La innovación que el autor reivindica no es arquitectónica sino de eficiencia: el modelo consume 29,3K tokens de salida por tarea (mediana) en Terminal-Bench 2.1 frente a 65,3K de Qwen3.8-27B, y 82,7K frente a 118,8K en DeepSWE. También incluye un modo no-thinking en la plantilla de chat, aunque el autor indica explícitamente que no lo evaluó.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262K tokens.
- Razonamiento agéntico de varios pasos: planificación, ejecución de comandos de terminal y resolución de tareas de ingeniería de software.
- Tool calling y function calling en formato XML de Qwen3.8; vLLM lo sirve con `--tool-call-parser qwen3_xml` y `--enable-auto-tool-choice`.
- Uso de herramientas MCP (48/55 en MCPMark) y llamadas multi-turno (63,9 en BFCL v4 multi-turn).
- Ejecución de tareas de terminal y SWE (Terminal-Bench 2.1, DeepSWE) con trayectorias largas.
- Capacidades retenidas de código, matemáticas y conocimiento: 88,0 en LiveCodeBench v6, 90,6 en GPQA-Diamond, 85,1 en MMLU-Pro.
- Seguimiento de instrucciones: 80,9 en IFBench; 82,3 en AA-LCR (contexto largo).
- Modo thinking activado por defecto, con opción de desactivarlo vía `chat_template_kwargs`.
- Procesamiento image-text-to-text según los tags del repo (torre de visión del modelo base; sin detalles publicados sobre su comportamiento tras la cuantización).

## Casos de uso

- Agentes de codificación autónomos: el modelo está entrenado para Terminal-Bench y DeepSWE, así que encaja como motor de un agente tipo CLI que clona repositorios, ejecuta tests y aplica parches, con la ventaja de consumir aproximadamente la mitad de tokens de salida que Qwen3.8-27B en las tareas que ambos resuelven.
- Automatización de operaciones en terminal: ejecución de scripts de despliegue, diagnósticos y tareas de mantenimiento paso a paso, con razonamiento intermedio que se puede omitir en turnos posteriores (`preserve_thinking: false`) para recortar coste.
- Agentes de atención al cliente con herramientas: los 259/278 en τ³-bench y el soporte de tool calling permiten construir asistentes que consultan APIs de pedidos, reservas o facturación en conversaciones de varios turnos; el subtipo bancario (43,5 %) es el más flojo y requiere supervisión.
- Integración en pipelines de CI/CD: el modelo puede recibir el fallo de un job, inspeccionar logs y proponer o aplicar una corrección, invocado mediante un cliente compatible con OpenAI contra un servidor vLLM.
- Orquestación de herramientas vía MCP: conexión a servidores MCP para tareas de recuperación de datos y acciones sobre sistemas externos, con 48/55 en MCPMark.
- Análisis de documentos largos: con 262K tokens de contexto, resumir o extraer datos de expedientes, contratos o bases de código completas en una sola pasada.
- Despliegue en hardware limitado: al ocupar 21,1 GB en NVFP4, permite servir un modelo de esta familia en una GPU de 24-48 GB para prototipado, entornos de desarrollo o inferencia con pocos usuarios concurrentes.

## Benchmarks y rendimiento

Datos publicados por el autor. Los arnés y ajustes se describen en la model card (Terminal-Bench 2.1 con la configuración de Artificial Analysis sobre H100 TP2; τ³-bench con simulador de usuario GPT-4.1; DeepSWE sin límite salvo ThinkingCap a 3 horas).

| Benchmark | Sabi-Noema (NVFP4 y BF16) | Qwen3.8-27B | ThinkingCap | Swift 1.5 | Muse Glimmer 30B | GPT-6 Luna, high |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Terminal-Bench 2.1 (%) | **76,0** | 73,0 | 67,8 | 62,9 | 48,3 | 68,5 |
| DeepSWE (%) | 47,5 | 38,5 | 38,9 | 39,8 | 5,3 | **53,1** |
| τ³-bench (/278) | **259** | 220 | 204 | 195 | 219 | 183 |
| τ³-bench banking (%) | **43,5** | 39,8 | 36,9 | 40,4 | 15,9 | 28,7 |
| ClawEval (/199) | **162** | 151 | 151 | 160 | 153 | 160 |
| BFCL v4 multi-turn | **63,9** | 59,6 | 58,8 | 62,6 | 55,8 | 44,9 |
| MCPMark (/55) | **48** | 36 | 42 | 37 | 32 | 38 |
| AA-Omniscience index | +2,3 | −5,2 | −10,5 | −22,8 | −28,0 | **+5,2** |
| Tasa de alucinacion (%) | **15,1** | 30,4 | 36,1 | 52,6 | 84,6 | 85,3 |
| LiveCodeBench v6 | 88,0 | **89,7** | 88,9 | 89,1 | 64,0 | 88,0 |
| GPQA-Diamond | **90,6** | 89,2 | 88,0 | 88,6 | 83,5 | 89,4 |
| MMLU-Pro | 85,1 | 85,4 | 85,0 | **85,7** | 84,2 | 83,4 |
| AA-LCR | 82,3 | **83,0** | 82,0 | 82,7 | 81,3 | **83,0** |
| IFBench | 80,9 | 79,5 | 79,7 | **81,1** | 77,0 | 61,0 |
| TB2.1 tokens de salida por tarea (mediana) | 29,3K | 65,3K | 51,0K | 57,1K | **20,6K** | — |
| τ³-bench tokens por conversacion (media) | 3,9K | 4,2K | 3,0K | 3,6K | **2,7K** | — |
| DeepSWE tokens de salida por tarea (media) | **82,7K** | 118,8K | 103,7K | — | — | — |

No se han publicado resultados de benchmarks independientes para la versión NVFP4 de este repositorio; las cifras corresponden al modelo base según su autor.

## Requisitos de hardware

- Peso del repositorio: 21,1 GB en NVFP4. Estimación de VRAM para inferencia: 22-24 GB como mínimo para pesos y estados, más espacio para KV cache de contexto largo.
- GPU consumer: cabe en RTX 4090 / RTX 3090 (24 GB) solo con contexto recortado y pocas secuencias simultáneas; en RTX 5090 (32 GB) o RTX 6000 Ada / A6000 (48 GB) el margen es notablemente mayor.
- Aceleradores de centro de datos: A100 80 GB y H100 permiten servir el modelo en BF16 sin cuantizar (~55 GB de pesos) o la versión NVFP4 con contextos largos y concurrencia.
- NVFP4 es un formato introducido por NVIDIA para sus aceleradores Blackwell; en generaciones anteriores (Hopper, Ada) el rendimiento depende de kernels de dequantización y la ventaja frente a otras cuantizaciones de 4 bits puede reducirse. No hay datos publicados de latencia o throughput para esta variante.
- Despliegue recomendado por el autor: vLLM 0.31.0 sin parches, con `--max-model-len 262144 --max-num-seqs 32 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_xml`. El límite de 32 secuencias viene de los bloques de estado de atención lineal disponibles en una GPU.
- Alternativas admitidas: `transformers` con `generation_config.json` por defecto del modelo base; conversión a GGUF para llama.cpp (mencionada, sin artefactos publicados); cliente compatible con OpenAI para integración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 | DeepSWE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sabi-Noema NVFP4 (esta ficha) | 18,16 B reales / ~27 B declarados | 262K | 76,0 % | 47,5 % | Apache 2.0 | HF, cuantizado NVFP4 |
| Qwen3.8-27B (base) | ~27 B | 262K (heredado) | 73,0 % | 38,5 % | Apache 2.0 (segun model card) | HF, BF16 ~55 GB |
| ThinkingCap | No disponible | No disponible | 67,8 % | 38,9 % | No disponible | Referenciado en la model card |
| Swift 1.5 | No disponible | No disponible | 62,9 % | 39,8 % | No disponible | Referenciado en la model card |
| Muse Glimmer 30B | 30 B | 131K | 48,3 % | 5,3 % | No disponible | Servido localmente en BF16 |
| GPT-6 Luna (referencia propietaria, high) | No disponible | No disponible | 68,5 % | 53,1 % | Propietaria | OpenRouter |

Frente a su base, la ganancia se concentra en tareas agénticas y en fiabilidad (mitad de tasa de alucinación declarada) mientras cede marginalmente en código (LiveCodeBench 88,0 frente a 89,7) y contexto largo (AA-LCR 82,3 frente a 83,0). La ventaja competitiva real es la combinación de rendimiento agéntico con coste por tarea.

## Limitaciones y advertencias

- Los benchmarks son autoevaluación del autor, con arneses propios y sin replicación independiente. Los resultados de GPT-6 Luna se obtuvieron vía OpenRouter y los de Muse Glimmer en local, lo que introduce heterogeneidad metodológica pese a la homogeneidad declarada.
- Discrepancia de parámetros: el recuento safetensors del repositorio da 18,16 B, mientras la model card habla de ~27 B. Verificar antes de dimensionar hardware o comparar con otros modelos.
- Tasa de alucinación declarada del 15,1 %: mejor que su base, pero sigue siendo un riesgo material en producción. El subtipo bancario de τ³-bench (43,5 %) indica un rendimiento notablemente inferior en dominios regulados.
- Idiomas soportados: no disponibles. No hay evidencia publicada sobre calidad fuera de inglés; evaluar antes de desplegar en castellano.
- El modo sin thinking está soportado por la plantilla pero no fue evaluado; su calidad es desconocida.
- El contexto de 262K exige configuración cuidadosa: `--max-num-seqs` alto provoca fallos por falta de bloques de estado de atención lineal en una sola GPU.
- La cuantización NVFP4 puede degradar tareas sensibles a precisión numérica; no hay ablación publicada BF16 vs NVFP4 para esta variante concreta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una publicación reciente y sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `sabicap/sabi-noema` y del Qwen3.8-27B subyacente.
- Los resultados de búsqueda web realizados para esta ficha no devolvieron material técnico relevante; no se han podido contrastar las cifras con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/sabi-noema-NVFP4
- Modelo base (no cuantizado): https://huggingface.co/sabicap/sabi-noema
- Variante con multi-head latent attention: https://huggingface.co/sabicap/sabi-noema-mla
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Metodología de Terminal-Bench 2.1 citada por el autor: https://artificialanalysis.ai/methodology/intelligence-benchmarking#terminal-bench-v2-1
- Resultados de búsqueda web: sin enlaces tecnicos relevantes disponibles.
