# Xylolabs/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es una cuantización en formato GGUF del modelo Qwen3.5-4B, publicada por Xylolabs para su uso con llama.cpp. El modelo base lo desarrolla el equipo Qwen (Alibaba) y esta pensado para generación de texto conversacional con un tamano compacto de aproximadamente 4.300 millones de parametros. Esta version concreta solo incluye el modelo de texto, empaquetado en un unico fichero Q4_K_M de 2,783 GB.

El interes de esta ficha esta en que permite ejecutar un modelo de la familia Qwen3.5 en hardware de consumo, con una ventana de contexto declarada de 256K tokens segun la tabla de recomendaciones de hardware del autor. El repositorio incluye una tabla de precision con divergencia KL y acuerdo top-1 frente a BF16, lo que permite evaluar la perdida de calidad de cada cuantización.

La licencia es Apache 2.0, lo que facilita el uso comercial. El modelo incluye el modulo de predicción multi-token (multi-token prediction) en el fichero, segun indica la model card, y se ha validado con un build concreto de llama.cpp (commit cd959bae).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B); pesos en formato GGUF para llama.cpp |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (segun tabla de hardware del autor) |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido en el repo); la tabla de precision compara Q8_K_XL, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_M, Q3_K_S, IQ3_XXS, IQ2_M, IQ2_XXS, entre otras |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card de esta cuantización no detalla la arquitectura interna del modelo base Qwen3.5-4B ni los datos de entrenamiento. Se trata de una conversión de pesos a GGUF realizada por Xylolabs, no de un modelo entrenado desde cero. El fichero GGUF incluye el modulo de predicción multi-token, lo que sugiere que el modelo base incorpora esa capacidad, pero no se aportan mas detalles tecnicos sobre atencion, capas o composicion del dataset.

La informacion disponible se centra en la evaluacion de la cuantización: la tabla de precision mide divergencia KL y acuerdo top-1 frente a BF16 sobre WikiText-2 y un conjunto held-out. Para el fichero Q4_K_M incluido, la divergencia KL es de 0,039883 en WikiText-2 y 0,038531 en held-out, con un acuerdo top-1 del 91,338 % y 90,755 % respectivamente. Estos valores son peores que los de otras cuantizaciones Q4 del ecosistema (por ejemplo, Unsloth Q4_K_M obtiene KL de 0,020194 y top-1 del 93,059 %), lo que indica que la cuantización Q4_K_M de llama.cpp pierde mas precision que alternativas optimizadas.

## Capacidades

- Generacion de texto conversacional en ingles y coreano.
- Razonamiento y generacion de codigo: capacidades propias del modelo base Qwen3.5-4B, aunque no se detallan en la model card de la cuantización.
- Predicción multi-token: el fichero GGUF incluye el modulo correspondiente, lo que puede habilitar decodificacion especulativa o generacion mas rapida segun el runtime.
- Compatibilidad con llama.cpp mediante `llama-cli` y flag `--jinja` para plantillas de chat.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; la model card indica explicitamente que contiene solo el modelo de texto.
- Capacidades multilingues: limitadas a en y ko segun los metadatos del repositorio.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con 2,8 GB en Q4_K_M cabe holgadamente en una RTX 4090 o RTX 3090 de 24 GB, permitiendo dejar espacio para el contexto KV y ejecutar el modelo a velocidad interactiva.
- Prototipado rapido de asistentes conversacionales: el formato GGUF y la integracion con llama.cpp permiten levantar un servidor de chat en minutos sin infraestructura de GPU dedicada.
- Procesamiento de documentos largos: la ventana declarada de 256K tokens permite resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada, siempre que la memoria disponible lo permita.
- Generacion de texto en coreano e ingles: util para equipos que necesiten un modelo bilingue compacto en esos dos idiomas, por ejemplo para localizacion de contenido o atencion al cliente en esas lenguas.
- Experimentacion con cuantizaciones: la tabla de precision del repositorio permite comparar la perdida de calidad de distintas cuantizaciones y elegir el equilibrio tamano/calidad adecuado para cada caso.
- Inferencia en hardware Apple Silicon: la tabla de hardware incluye Mac Studio M5 Max y M5 Ultra con memoria unificada, lo que permite ejecutar el modelo en equipos de sobremesa de Apple sin GPU dedicada.
- Evaluacion comparativa de modelos pequenos: util como baseline de 4B en pruebas internas de calidad frente a otros modelos del mismo rango.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Solo aporta metricas de fidelidad de la cuantización frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| Unsloth UD-Q8_K_XL | 5,952 GB | 0,001070 | 98,397 % | 0,000594 | 98,627 % |
| llama.cpp Q8_0 | 4,611 GB | 0,001852 | 98,363 % | 0,000969 | 98,451 % |
| llama.cpp Q6_K | 3,563 GB | 0,005615 | 96,667 % | 0,004003 | 96,618 % |
| llama.cpp Q5_K_M | 3,161 GB | 0,014291 | 94,814 % | 0,010270 | 95,157 % |
| Q4_K_M (este repo) | 2,783 GB | 0,039883 | 91,338 % | 0,038531 | 90,755 % |
| Unsloth Q4_K_M | 2,741 GB | 0,020194 | 93,059 % | 0,020741 | 93,382 % |
| Unsloth IQ4_XS | 2,477 GB | 0,030611 | 91,819 % | 0,032629 | 90,980 % |
| Unsloth UD-Q2_K_XL | 1,941 GB | 0,208873 | 79,495 % | 0,226803 | 78,088 % |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 2,783 GB; a ello hay que sumar la memoria del contexto KV, que crece con la longitud de contexto. Para 256K tokens se necesita bastante mas memoria que el peso del modelo, por lo que la tabla del autor asume GPUs de 24 GB en adelante.
- GPU recomendadas segun el autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256 GB y 512 GB unificada), B300 (288 GB).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 5090, con contexto completo de 256K segun la tabla del autor.
- Opciones de despliegue: llama.cpp (`llama-cli -m Qwen3.5-4B-Q4_K_M.gguf --jinja`). No se mencionan vLLM, TGI, Ollama ni otros runtimes en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-GGUF (Xylolabs) | 4,33 B | 256K (segun autor) | GGUF Q4_K_M | Apache 2.0 | Cuantización de llama.cpp; KL 0,0399 en WikiText-2 |
| Qwen3.5-4B (base) | 4,33 B | no disponible | safetensors | Apache 2.0 | Modelo original en BF16 |
| Unsloth Q4_K_M de Qwen3.5-4B | 4,33 B | no disponible | GGUF | Apache 2.0 | Misma base; KL 0,0202, mejor fidelidad que la Q4_K_M de llama.cpp |
| Unsloth IQ4_XS de Qwen3.5-4B | 4,33 B | no disponible | GGUF | Apache 2.0 | 2,477 GB, KL 0,0306, mejor equilibrio tamano/calidad que la Q4_K_M de este repo |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento real frente a otros modelos de 4B.

## Limitaciones y advertencias

- Solo incluye el modelo de texto; no hay soporte multimodal en este fichero.
- Idiomas soportados limitados a ingles y coreano segun los metadatos; el rendimiento en castellano no esta documentado.
- La cuantización Q4_K_M de este repositorio presenta peor fidelidad que alternativas Q4 optimizadas (KL 0,0399 frente a 0,0202 de Unsloth Q4_K_M), por lo que puede degradar la calidad en tareas sensibles.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- La ventana de 256K tokens requiere memoria considerable para el KV cache; en GPUs de 24 GB puede no ser practica a maxima longitud.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5-4B para uso comercial.
- La model card no detalla la arquitectura interna ni los datos de entrenamiento, lo que limita la evaluacion tecnica profunda.
- El repositorio tiene pocas descargas (572) y cero likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-GGUF/blob/main/LICENSE
- Build de llama.cpp validado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
