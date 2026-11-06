# y172108740/Qwen3-4B

## Resumen

Qwen3-4B es un modelo de lenguaje causal de tipo denso publicado por el equipo Qwen de Alibaba dentro de la familia Qwen3. Esta ficha corresponde a la réplica alojada por el usuario `y172108740` en Hugging Face, un espejo directo del modelo oficial `Qwen/Qwen3-4B`, construido sobre el checkpoint base `Qwen/Qwen3-4B-Base` mediante preentrenamiento y postentrenamiento. Cuenta con 4.022.468.096 parámetros totales (3.600 millones sin contar embeddings) y una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante YaRN.

El modelo resuelve el problema de disponer de razonamiento explícito y diálogo eficiente en un único checkpoint de tamano reducido: permite alternar entre modo *thinking* (cadena de razonamiento para matematicas, logica y codigo) y modo *non-thinking* (respuesta directa y de baja latencia) mediante el parametro `enable_thinking` del chat template. Esta pensado para despliegues en hardware modesto, incluyendo GPU de consumo, sin renunciar a capacidades de agentes y tool calling.

Su relevancia actual radica en que combina licencia Apache 2.0, soporte declarado de mas de 100 idiomas y compatibilidad con los principales stacks de inferencia (transformers, vLLM, SGLang, llama.cpp, Ollama), lo que lo convierte en una opcion atractiva para prototipado y produccion ligera. La arquitectura es un transformer decoder-only con 36 capas y atencion GQA (32 cabezas de consulta, 8 de clave-valor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, denso, con GQA |
| Parametros totales | 4.022.468.096 (4,0B); 3,6B sin embeddings |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (repo en safetensors sin cuantizar; el ecosistema soporta GGUF/AWQ via terceros) |
| Idiomas soportados | mas de 100 idiomas y dialectos segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 36 |
| Cabezas de atencion | 32 Q / 8 KV (GQA) |
| Tamano del repo | 8,1 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Base |

## Arquitectura y entrenamiento

Qwen3-4B es un transformer decoder-only denso de 36 capas con atencion de consultas agrupadas (GQA), usando 32 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de memoria de la cache KV frente a atencion multi-cabeza completa. El modelo pasa por dos etapas: preentrenamiento sobre el checkpoint `Qwen3-4B-Base` y un postentrenamiento que incluye alineacion con preferencias humanas. La model card declara mejoras en creatividad, role-play, dialogos multi-turno y seguimiento de instrucciones, lo que sugiere el uso de datos de preferencia y tecnicas de RLHF/DPO, aunque el detalle exacto de la composicion del dataset y el numero de tokens de entrenamiento no se especifica en la informacion disponible.

La innovacion principal es la coexistencia de dos modos de inferencia en un mismo modelo: el modo *thinking* genera contenido dentro de un bloque `<think>...</think>` antes de la respuesta final, mientras que el modo *non-thinking* responde directamente. El cambio se controla con `enable_thinking` en `apply_chat_template` y tambien esta expuesto en las APIs de SGLang y vLLM. Para contexto largo, el modelo admite extension via YaRN hasta 131.072 tokens. La model card recomienda parametros de muestreo distintos segun el modo (temperatura 0,6 y top-p 0,95 en thinking) y sugiere `presence_penalty=1.5` para mitigar repeticiones infinitas.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno con alineacion a preferencias humanas.
- Razonamiento explicito en modo *thinking* para matematicas, logica y codigo, con traza intermedia visible.
- Modo *non-thinking* para respuestas directas de baja latencia en tareas generales.
- Generacion de codigo y soporte de instrucciones tecnicas.
- Tool calling y function calling, integrable con herramientas externas en ambos modos.
- Capacidades de agente y razonamiento multi-paso, con rendimiento destacado entre modelos open source segun el autor.
- Multilingue: mas de 100 idiomas y dialectos, con instrucciones y traduccion.
- Creatividad y role-play, con enfasis en naturalidad conversacional.
- Contexto largo: 32K nativos y hasta 128K con YaRN.
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo gestiona conversaciones multi-turno con hasta 32.768 tokens de contexto nativo, suficiente para historiales largos y documentacion de producto inyectada en el prompt; el modo non-thinking reduce latencia en respuestas rutinarias.
- **Asistente de codigo en IDE**: con tool calling puede invocar funciones de busqueda, ejecucion de tests o linters; el modo thinking mejora la resolucion de bugs complejos y la generacion de parches.
- **Agentes autonomos con herramientas**: integrable en pipelines con function calling para consultar APIs, bases de datos o sistemas de ticketing, encadenando varios pasos de razonamiento antes de actuar.
- **Analisis de documentos largos**: gracias a YaRN y 131.072 tokens, permite resumir contratos, informes o expedientes completos sin fragmentacion agresiva.
- **Tutoria y resolucion de problemas matematicos**: el modo thinking expone la cadena de razonamiento, util para entornos educativos que requieren justificar cada paso.
- **Traduccion y localizacion multilingue**: cobertura de mas de 100 idiomas, adecuada para pre-traduccion y revision en flujos de localizacion.
- **Prototipado en hardware de consumo**: con 4B parametros cabe en GPU consumer cuantizado, lo que permite iterar localmente antes de escalar a produccion.
- **Generacion de contenido y role-play**: alineacion orientada a escritura creativa y personajes, aplicable a videojuegos o asistentes con personalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3, al repositorio de GitHub y a la documentacion para las tablas de evaluacion, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- **VRAM estimada en BF16/FP16**: aproximadamente 8 GB solo para pesos, mas cache KV y overhead; en la practica se recomiendan 12-16 GB para contexto moderado.
- **VRAM estimada cuantizado a 8 bits**: en torno a 4-5 GB de pesos, viable en GPU de 8 GB con contexto corto.
- **VRAM estimada cuantizado a 4 bits (GGUF Q4)**: aproximadamente 2,5-3 GB de pesos, cabe en GPU consumer de 6-8 GB.
- **GPU recomendadas**: A100 40/80 GB y H100 para despliegue de alta concurrencia; RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti para inferencia local en BF16 o cuantizado.
- **GPU de consumo**: si cabe en RTX 4090, 3090, 4080, 4070 y en tarjetas de 8 GB con cuantizacion 4-8 bits; en 6 GB solo con cuantizaciones agresivas y contexto reducido.
- **Opciones de despliegue**: transformers (>=4.51.0), vLLM (>=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers.
- **Latencia y throughput**: no disponibles en la informacion proporcionada; dependen fuertemente del backend, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B (esta ficha) | 4,0B | 32K nativo / 128K YaRN | Apache 2.0 | Modos thinking/non-thinking, tool calling, 100+ idiomas |
| Qwen2.5-3B-Instruct | 3,1B | 32K nativo / 128K | Apache 2.0 | Generacion anterior, sin modo thinking explicito |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | Contexto largo nativo, licencia con restricciones |
| Gemma 3 4B IT | 4,0B | 128K | Gemma Terms of Use | Multimodal en algunas variantes, licencia no Apache |

La comparativa se basa en caracteristicas publicas de cada familia; no se dispone de cifras de benchmark comparativas en la informacion proporcionada para este modelo concreto.

## Limitaciones y advertencias

- **Sesgos**: no se documentan evaluaciones de sesgo en la informacion disponible; como modelo entrenado con datos web a gran escala, es previsible que reproduzca sesgos sociales, culturales y linguisticos.
- **Alucinacion**: el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas; no debe usarse como fuente de verdad sin verificacion externa.
- **Repeticiones**: la model card advierte de repeticiones infinitas significativas si no se ajustan los parametros de muestreo; recomienda `presence_penalty=1.5` y temperatura 0,6 con top-p 0,95 en thinking.
- **Contexto**: la ventana nativa es de 32.768 tokens; superar ese limite requiere configuracion YaRN, que puede degradar la calidad si no se ajusta el factor de escala.
- **Idiomas**: aunque se declaran mas de 100 idiomas, el rendimiento relativo por idioma no se detalla; los idiomas de bajos recursos pueden degradarse.
- **Licencia**: Apache 2.0 permite uso comercial, pero el espejo `y172108740/Qwen3-4B` no es un canal oficial; para produccion conviene referenciar el repositorio oficial `Qwen/Qwen3-4B` y verificar la integridad de los pesos.
- **Version de transformers**: requiere `transformers>=4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.
- **Cuantizacion**: el repositorio solo contiene safetensors sin cuantizar; las versiones GGUF/AWQ deben obtenerse de terceros o generarse localmente, con el riesgo de calidad asociado.

## Enlaces

- [Hugging Face: y172108740/Qwen3-4B](https://huggingface.co/y172108740/Qwen3-4B)
- [Modelo oficial: Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- [Licencia Apache 2.0 del modelo oficial](https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE)
- [Blog de Qwen3](https://qwenlm.github.io/blog/qwen3/)
- [Repositorio GitHub QwenLM/Qwen3](https://github.com/QwenLM/Qwen3)
- [Documentacion de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Documentacion SGLang para Qwen3](https://qwen.readthedocs.io/en/latest/deployment/sglang.html#thinking-non-thinking-modes)
- [Documentacion vLLM para Qwen3](https://qwen.readthedocs.io/en/latest/deployment/vllm.html#thinking-non-thinking-modes)
- [Qwen Chat](https://chat.qwen.ai/)
- [Paper referenciado arxiv:2309.00071](https://arxiv.org/abs/2309.00071)
- [Paper referenciado arxiv:2505.09388](https://arxiv.org/abs/2505.09388)
