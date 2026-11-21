# tinyopsec/limbic-tool-use-0.5B-32K-GGUF

## Resumen

`tinyopsec/limbic-tool-use-0.5B-32K-GGUF` es la version cuantizada en formato GGUF de `quotientai/limbic-tool-use-0.5B-32K`, un ajuste fino de Qwen2.5-0.5B-Instruct orientado especificamente a la evaluacion de llamadas a funciones en el protocolo MCP (Model Context Protocol). El modelo lo publica el usuario `tinyopsec` a partir del trabajo de Quotient AI, y su proposito declarado es servir como evaluador de function-calling, no como modelo de proposito general.

Se trata de un modelo muy pequeno: 494.032.768 parametros totales (unos 0,5B), lo que lo situa en la gama de modelos que pueden ejecutarse en CPU o en GPUs de consumo con muy poca VRAM. La ventana de contexto nominal es de 32K tokens, segun indica el nombre del modelo base, aunque la model card no detalla la configuracion exacta de atencion ni el metodo de extension de contexto empleado.

La relevancia actual del modelo es doble: por un lado, ofrece una via ligera y local para validar flujos de tool calling y MCP sin depender de APIs externas; por otro, su tamano permite desplegarlo en entornos con recursos limitados. La licencia Apache 2.0 facilita su uso comercial, aunque el propio autor advierte que debe evaluarse antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (segun nombre del modelo base) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de la familia Qwen2 con 494 millones de parametros. La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO. El unico dato tecnico aportado es que el ajuste esta orientado a la evaluacion de llamadas a funciones en el contexto del Model Context Protocol (MCP).

La version publicada en este repositorio es exclusivamente una conversion a GGUF realizada con llama.cpp; no se ha reentrenado ni modificado el modelo base. Se ofrecen trece variantes de cuantizacion desde F16 (1,0 GB) hasta Q2_K, con Q4_K_M marcada como recomendada por el autor. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, SSM, etc.).

## Capacidades

- Generacion de texto conversacional, heredada de Qwen2.5-0.5B-Instruct.
- Function calling / tool calling: capacidad principal del ajuste, orientada a MCP.
- Evaluacion de llamadas a funciones: el autor lo describe explicitamente como "MCP function-call evaluator".
- Integracion con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y compatibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso detras de servidores de inferencia estandar.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Razonamiento multi-paso y agentes: no documentado de forma explicita; el enfasis declarado es la evaluacion de tool calls, no la orquestacion de agentes.
- Vision, audio y modo thinking: no disponibles.

## Casos de uso

- Evaluacion de pipelines MCP: usar el modelo como evaluador ligero de llamadas a funciones generadas por otros sistemas, comparando la salida con el esquema esperado antes de desplegar cambios en produccion.
- Test de regresion de function calling en CI: al ser un GGUF de 0,5B, puede ejecutarse en runners modestos para validar que los prompts y esquemas de herramientas siguen produciendo llamadas correctas tras cada cambio.
- Prototipado local de asistentes con herramientas: permite iterar sobre definiciones de herramientas y prompts en un portatil sin coste de API, gracias a su baja huella de memoria.
- Despliegue en entornos con recursos limitados: util para demos en CPU o GPUs de gama baja donde no caben modelos mayores, con la cuantizacion Q4_K_M como opcion equilibrada.
- Filtrado previo en pipelines de agentes: usar el modelo como primera etapa que decide si una consulta requiere una tool call antes de delegar en un modelo mayor, reduciendo coste y latencia.
- Educacion y experimentacion con MCP: sirve para que desarrolladores aprendan el protocolo y el formato de tool calling con un modelo pequeno y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 1,0 GB para F16; aproximadamente 0,5 GB para Q8_0; cerca de 0,3-0,4 GB para Q4_K_M; y por debajo de 0,3 GB para Q2_K (estimaciones a partir del tamano de los ficheros y de los 494M de parametros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan con holgura.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en iGPUs con memoria compartida suficiente.
- CPU: viable en inferencia solo-CPU con llama.cpp, especialmente en cuantizaciones Q4 y Q5.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyopsec/limbic-tool-use-0.5B-32K-GGUF | 494M | 32K | Tool calling / MCP (GGUF) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32K | Instrucciones generales | Apache 2.0 | Hugging Face |
| quotientai/limbic-tool-use-0.5B-32K | 494M | 32K | Tool calling / MCP (pesos originales) | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos directamente relacionados porque la informacion disponible no incluye datos de rendimiento frente a otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de 0,5B parametros: capacidad de razonamiento y de generalizacion muy limitada en comparacion con modelos de mayor tamano; no es adecuado como asistente general.
- Enfoque restringido: esta disenado como evaluador de function calling en MCP, no como modelo conversacional de proposito general.
- Riesgo de alucinacion: alto en tareas abiertas, dado el reducido numero de parametros y la ausencia de datos de entrenamiento documentados.
- Idiomas: no se documenta el soporte multilingue; el comportamiento fuera del ingles no esta garantizado.
- Sesgos: no documentados por el autor; al heredar de Qwen2.5-0.5B-Instruct, puede arrastrar los sesgos del modelo original.
- Licencia: Apache 2.0 permite uso comercial, pero el autor recomienda explicitamente evaluar el modelo antes de usarlo en produccion ("Evaluate before use").
- Ausencia de benchmarks: no hay metricas publicadas que permitan estimar su calidad frente a alternativas.
- Contexto: aunque el nombre indica 32K, no se documenta como se logra esa ventana ni su calidad efectiva en secuencias largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/limbic-tool-use-0.5B-32K-GGUF
- Modelo base: https://huggingface.co/quotientai/limbic-tool-use-0.5B-32K
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
