# trymirai/Flint-S

## Resumen

Flint S es una cuantización experimental del modelo Recursive Flint, un mixture-of-experts (MoE) orientado a tareas de codigo y agentes, desarrollado por el autor independiente trymirai bajo el paraguas "Mirai S". El modelo base cuenta con 39.800 millones de parametros totales y aproximadamente 2.500 millones de parametros activos por token. Esta version comprime los pesos hasta un paquete de 13,157 GB (13,173 GB incluyendo tokenizer y metadatos) mediante un formato propio empaquetado denominado "S", acompanado de un decodificador de referencia independiente.

La relevancia de esta publicacion es doble. Por un lado, propone una alternativa de cuantizacion agresiva (equivalente a ~2,6 bits por parametro) que, segun las mediciones del autor, supera en fidelidad al profesor a varias cuantizaciones GGUF de tamano comparable, con un KL on-policy de 0,09117 frente a 0,13507 de Unsloth UD-Q2_K_XL o 0,21386 de bartowski IQ2_S. Por otro, es explicitamente un artefacto experimental: no es un checkpoint compatible con Transformers, GGUF, MLX ni uzu, y el decodificador incluido reconstruye tensores pero no ofrece un motor de inferencia.

El modelo se publica bajo licencia Apache 2.0, con fecha de creacion el 4 de noviembre de 2026 y ultima actualizacion el 11 de noviembre de 2026. El repositorio ocupa 265 GB e incluye pesos fragmentados en 50 archivos safetensors junto con el decodificador de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) transformer, derivada de Recursive Flint |
| Parametros totales | 39.800 millones (39,8B) |
| Parametros activos | Aproximadamente 2.500 millones (2,5B) por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Formato propio "S" empaquetado (~2,6 bits/parametro efectivos); el modelo base dispone de variantes GGUF (IQ1, IQ2, IQ3, Q2, Q3, Q4, Q8_0), nvfp4 e int4-q4_1 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors fragmentados (model-00.safetensors ... model-49.safetensors) en paquete packed S con decodificador de referencia |

## Arquitectura y entrenamiento

El modelo base Recursive Flint es un transformer con arquitectura de mezcla de expertos: 39,8B parametros totales con unos 2,5B activos por token, lo que permite un coste computacional por token comparable a un modelo denso de ~3B. Esta orientado especificamente a codigo y flujos de agente (function calling, tareas multi-paso, construccion de aplicaciones). El autor indica que el entrenamiento del modelo base utilizo trazas de codigo, razonamiento y uso de herramientas generadas por el propio Flint.

La contribucion de Flint S es la cuantizacion. El paquete "S 13.3" almacena pesos y tensores compartidos en un formato empaquetado propio de 13,157 GB, con un decodificador de referencia que reconstruye los tensores. El autor documenta inestabilidad numerica del modelo base en texto off-policy y por ello empleo activaciones FP32 en la cache del profesor y en la evaluacion densa cuantizada; el suelo medido del profesor BF16 frente a esa cache es de aproximadamente 0,00359 KL / 98,36% top-1 on-policy y 0,0558 KL / 96,03% top-1 en texto de dataset. No se especifica el numero de tokens de entrenamiento del modelo base ni detalles de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento orientado a codigo.
- Function calling y tool calling, con conjuntos de evaluacion propios de 175 casos estandar y 150 casos dificiles.
- Ejecucion de tareas de agente multi-paso (AppWorld, "assistant week", construccion de aplicaciones).
- Modo thinking y non-thinking (las evaluaciones de function calling cubren ambos).
- Capacidades conversacionales (pipeline_tag: text-generation, conversational).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion extrema: el paquete S 13.3 sirve como referencia para investigadores que comparan metodos de compresion (KL on-policy, acuerdo top-1 con el profesor) frente a GGUF IQ2/IQ3 y Q2_K. Su tamano de 13,17 GB lo hace manejable para experimentos reproducibles.
- Investigacion de formatos empaquetados: el decodificador de referencia permite estudiar la reconstruccion de tensores MoE a baja precision sin depender de un runtime comercial.
- Desarrollo de motores de inferencia: dado que el autor declara que no hay integracion de runtime validada, el paquete es un banco de pruebas para quienes implementan kernels de dequantizacion para MoE.
- Agentes de codigo en entornos con VRAM limitada (una vez validada la integracion): con ~2,5B parametros activos y 13 GB de pesos, el modelo base esta pensado para tareas de construccion de aplicaciones y function calling, segun los resultados del gemelo denso.
- Automatizacion de tareas con herramientas (AppWorld): el gemelo denso de S 13.3 obtuvo 158/240 en AppWorld con 80 tareas x 3 repeticiones, lo que lo situa como candidato para pipelines de agentes con presupuesto de memoria ajustado.
- Comparacion de fidelidad profesor-alumno: util para equipos que necesitan medir la degradacion de un MoE cuantizado antes de desplegarlo, usando los contratos de evaluacion documentados (100 prompts, plantilla de chat de Flint).

## Benchmarks y rendimiento

Fidelidad frente al profesor (menor KL es mejor; top-1 es acuerdo con la eleccion del siguiente token del profesor, no precision de tarea):

| Cuantizacion | Tamano (GB) | RomaKL on-policy | Top-1 | RomaKL texto de dataset |
|---|---:|---:|---:|---:|
| Mirai Flint S 13.3 (build denso de evaluacion) | 13,17 | 0,09117 | 91,49% | 0,23781 |
| Unsloth UD-IQ1_M | 11,35 | 0,20225 | 86,72% | 0,41156 |
| Unsloth UD-IQ2_XXS | 11,86 | 0,17714 | 87,51% | 0,37993 |
| bartowski IQ2_XXS | 12,03 | 0,27529 | 84,46% | 0,58081 |
| bartowski IQ2_S | 13,39 | 0,21386 | 86,62% | 0,48050 |
| Unsloth UD-Q2_K_XL | 13,56 | 0,13507 | 89,23% | 0,29978 |
| bartowski IQ3_XXS | 17,49 | 0,08920 | 91,42% | 0,25920 |
| Unsloth UD-Q3_K_XL | 18,49 | 0,05566 | 93,30% | 0,19121 |
| bartowski IQ4_XS | 22,45 | 0,02505 | 95,52% | 0,13466 |
| Q8_0 | 42,30 | 0,00479 | 97,92% | 0,05890 |

Evaluacion de agente in-house (no son puntuaciones oficiales de Terminal-Bench, SWE-bench ni BFCL):

| Evaluacion | Flint S 13.3 | Unsloth UD-Q2_K_XL | bartowski IQ3_XXS | Q8_0 | BF16 Flint |
|---|---:|---:|---:|---:|---:|
| Function calling | 92% | 97% | 94% | 96% | 91% |
| Function calling, dificil | 75% | 76% | 73% | 75% | 77% |
| Bateria de problemas dificiles | 51/55 | 44/55 | 38/55 | 52/55 | 49/55 |
| AppWorld, 80 tareas x 3 | 158/240 | 158/240 | No validado | 164/240 | 187/240 |
| Assistant week v2, herramientas nativas | 444/656 | 242/656 | 333/656 | 358/656 | 460/656 |
| Assistant week v1, marcadores de texto | 41/136 | 18/136 | 36/136 | 57/136 | 60/136 |
| Build creativo, totalmente correcto | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 |
| Build agentico, declarado terminado | 4/4 | 2/4 | 3/4 | 4/4 | 4/4 |

Notas del autor: las comparaciones GGUF se midieron con llama.cpp y Mirai S con un gemelo denso de evaluacion; el KL del decodificador empaquetado esta pendiente. El contrato on-policy puntua 76.946 tokens y el de texto de dataset 34.631 tokens. Muestreo con temperatura 1,0, top-p 0,95, top-k 20. Los resultados son estimaciones puntuales sin afirmacion de significacion estadistica.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos ~13,2 GB solo para pesos; con cache KV, activaciones y overhead de runtime, se recomienda contar con 16-24 GB en funcion de la longitud de contexto (no se especifica la longitud de contexto soportada).
- El paquete S 13.3 no es un checkpoint compatible con Transformers, GGUF, MLX ni uzu; requiere el decodificador de referencia incluido o una integracion de runtime propia no validada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, encaja teoricamente en GPUs consumer de 16-24 GB (RTX 4080/4090, RTX 3090) y en A100/H100 para servir varias instancias, pero el autor no documenta requisitos ni rendimiento.
- Opciones de despliegue: ninguna validada para el paquete empaquetado. El gemelo denso se evaluo con SGLang; las comparaciones GGUF con llama.cpp. No hay soporte declarado de vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Flint S 13.3 (este) | 39,8B totales / ~2,5B activos | No disponible | Packed S + decodificador | Apache 2.0 | Experimental, sin runtime validado |
| Recursive Flint (base) | 39,8B totales / ~2,5B activos | No disponible | BF16 y variantes GGUF/nvfp4/int4 | Apache 2.0 | Modelo base de referencia |
| Unsloth UD-Q2_K_XL (Flint) | 39,8B totales / ~2,5B activos | No disponible | GGUF | Apache 2.0 | Desplegable en llama.cpp |
| bartowski IQ3_XXS (Flint) | 39,8B totales / ~2,5B activos | No disponible | GGUF | Apache 2.0 | Desplegable en llama.cpp |

La comparativa se limita a cuantizaciones del mismo modelo base, ya que no se dispone de informacion sobre modelos de otros autores con los que contrastar.

## Limitaciones y advertencias

- El paquete empaquetado no ha sido validado en su forma decodificada: el KL del decodificador y la integracion directa en runtime estan pendientes. Los resultados de KL y agente se midieron sobre un gemelo denso de dequantizacion, no sobre el paquete final.
- No es un checkpoint drop-in para Transformers, GGUF, MLX ni uzu; el decodificador reconstruye tensores pero no sirve como motor de inferencia.
- Los benchmarks son evaluaciones internas del autor, no auditorias externas ni resultados oficiales de Terminal-Bench, SWE-bench o BFCL.
- El modelo base presenta inestabilidad numerica en texto off-policy, segun el autor; de ahi el uso de activaciones FP32 en las evaluaciones.
- Las comparaciones de KL cruzan runtimes distintos (llama.cpp para GGUF, SGLang para el profesor y el gemelo denso), lo que puede introducir diferencias por backend y numerica.
- Los conjuntos de build creativo y agentico contienen solo 4 tareas cada uno; las conclusiones sobre calidad de render son limitadas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de runtime validado desaconsejan produccion sin una validacion propia.
- El repositorio ocupa 265 GB, lo que implica un coste de almacenamiento considerable para descargar y trabajar con el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Flint-S
- Modelo base Recursive Flint: https://huggingface.co/RecursiveSI/flint
- Registro de resultados de benchmarks: benchmarks/results.json (incluido en el repositorio de Hugging Face)
