# vcruz305/DSV4.1-Flash-1017-SAGE-EXL3-1.62bpw

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino un *pack* cuantizado en formato EXL3 del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicado por el usuario vcruz305. Se trata de una cuantización mixta de precisión (metodo propio del autor, denominado SAGE) que comprime el modelo original hasta 1,62 bits por peso (bpw) manteniendo, segun las mediciones del autor, un 94,52% de acuerdo Top-1 a nivel de token con la release oficial de DeepSeek en FP8/FP4 mixto. El objetivo es hacer viable la inferencia de un MoE de gran tamano en un unico dispositivo de memoria unificada de clase 128 GB, con una huella residente de aproximadamente 112,9 GiB.

El modelo base es un MoE de DeepSeek con 262.164.494.802 parametros totales (segun los safetensors del propio pack), 40 capas y 384 expertos enrutados mas 1 compartido con top-6. La model card del pack remite explicitamente a la tarjeta upstream para arquitectura, muestreo y benchmarks; este repositorio solo documenta el proceso de cuantizacion y su fidelidad respecto al original. La licencia es MIT, heredada del modelo base.

La relevancia de esta ficha esta en que permite evaluar hasta que punto una cuantizacion agresiva a 1,62 bpw conserva el comportamiento del modelo original por categoria (codigo, razonamiento, matematicas y general), un dato poco habitual y util para decidir si merece la pena desplegar la version comprimida frente a la release oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (upstream DeepSeek V4.1-Flash-1017: 40 capas, 384 expertos enrutados + 1 compartido, top-6) |
| Parametros totales | 262.164.494.802 (262,16 B) |
| Parametros activos | no disponible (top-6 sobre 384+1 expertos; el autor no publica el recuento activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (trellis) con K mixto, perfil SAGE de 1,62 bpw; el valor K es autodescriptivo por tensor |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de DeepSeek-V4.1-Flash-1017) |
| Formato de pesos | safetensors EXL3 (17 shards, `model.safetensors.index.json`, `quant_method: exl3`) |

Otros datos del repositorio: 119 descargas, 19 likes, tamano del repo 326,6 GB, creado el 2026-10-18 y actualizado el 2026-10-20. Libreria declarada: `exllamav3`. Pipeline tag: `image-text-to-text`.

## Arquitectura y entrenamiento

No se trata de un entrenamiento nuevo: este repositorio contiene exclusivamente los pesos cuantizados del modelo DeepSeek-V4.1-Flash-1017, un MoE con 40 capas, 384 expertos enrutados y 1 experto compartido con enrutamiento top-6, descrito por el autor del pack como "MIT CED MoE". La model card no aporta datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo original, y remite a la tarjeta upstream de DeepSeek para cualquier detalle de arquitectura o entrenamiento.

La innovacion tecnica de este repositorio es el metodo de cuantizacion SAGE, definido por el autor como un esquema de precision mixta para EXL3 en el que cada tensor recibe un valor `K` distinto y los kernels leen ese `K` directamente del tensor trellis en el momento de la carga. El autor declara explicitamente que el metodo no esta publicado, por lo que no es posible reproducir la asignacion de bits por tensor ni auditar el criterio de precision mixta. La decodificacion se realiza con ExLlamaV3, cuyo codigo esta enlazado desde la model card.

## Capacidades

- Generacion de texto y conversacion multi-turno, con el pipeline declarado como `conversational`.
- Razonamiento y matemáticas: la model card desglosa la fidelidad de cuantizacion por categoria, lo que implica que el modelo base se evaluo en tareas de razonamiento y matematicas.
- Generacion de codigo: categoria medida de forma independiente, con el mejor acuerdo Top-1 del pack (99,08%).
- Procesamiento image-text-to-text: el pipeline tag del repositorio es `image-text-to-text`, aunque la model card del pack no detalla las capacidades de vision ni la arquitectura del encoder; habria que consultar la tarjeta upstream.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta cumplimentado.
- Modo *thinking* explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue on-premise de un MoE de 262 B en una sola maquina: el pack esta dimensionado para un dispositivo de memoria unificada de clase 128 GB (unos 112,9 GiB residentes), lo que permite ejecutar el modelo sin cluster ni reparto multi-GPU, algo relevante para entornos con requisitos de soberania del dato.
- Generacion de codigo en pipelines internos: la categoria de codigo es la que mejor fidelidad conserva frente al original (99,08% Top-1, KL medio 0,0186), por lo que es el uso donde la cuantizacion introduce menos deriva respecto a la release oficial FP8/FP4.
- Asistentes de razonamiento y resolucion de problemas: con un 96,04% de acuerdo Top-1 en razonamiento y 95,56% en matematicas, el pack es adecuado para tareas de analisis y calculo donde se tolera una pequena perdida frente al modelo completo.
- Investigacion en cuantizacion: el repositorio publica metricas de KLD por token y acuerdo Top-1/Top-5 contra la release oficial, lo que lo convierte en un caso de estudio util para comparar metodos de precision mixta a bits muy bajos.
- Evaluacion comparativa de fidelidad por dominio: el desglose por categoria (codigo, razonamiento, matematicas, general) permite estudiar que dominios son mas sensibles a la compression agresiva; el apartado general es el que mas degrada (89,94% Top-1, KL medio 0,2245).
- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` sugiere uso en tareas que combinan capturas, figuras o documentos escaneados con texto, aunque la ausencia de detalle sobre vision en la model card obliga a validarlo contra la tarjeta upstream antes de llevarlo a produccion.
- Generacion por lotes en modo offline: al no requerir infraestructura multi-nodo, encaja en procesos batch nocturnos donde la latencia no es critica y prima el coste por token frente a la release oficial de mayor precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo que si publica el autor son metricas de fidelidad de cuantizacion frente a la release oficial FP8/FP4 de DeepSeek, sobre secuencias reservadas (*held-out*):

| Pack | Huella residente | KL vs release oficial (media) | KL vs release oficial (p50) | Acuerdo Top-1 | Solapamiento Top-5 |
|---|---|---|---|---|---|
| Este pack, 1,62 bpw (`1017`) | ~112,9 GiB | 0,0982 | 0,00019 | 94,52% | 81,16% |
| Release oficial FP8/FP4 mixta | nativa | 0 | 0 | 100% | 100% |

Desglose por categoria (siempre frente a la release oficial):

| Categoria | KL media | KL media (solo respuesta) | KL p50 | Acuerdo Top-1 | Top-1 solo respuesta | Solapamiento Top-5 |
|---|---|---|---|---|---|---|
| Codigo | 0,0186 | 0,0046 | 0,000004 | 99,08% | 99,61% | 80,38% |
| Razonamiento | 0,0349 | 0,0306 | 0,000480 | 96,04% | 97,98% | 86,34% |
| Matematicas | 0,0477 | 0,0408 | 0,000306 | 95,56% | 94,19% | 83,99% |
| General | 0,2245 | no disponible | 0,001505 | 89,94% | 89,21% | 76,24% |

Nota metodologica: estas cifras miden divergencia respecto al modelo original en modo *teacher forcing*, no calidad absoluta en tareas. El autor no incluye comparacion con otras cuantizaciones del mismo modelo.

## Requisitos de hardware

- VRAM / memoria: aproximadamente 112,9 GiB residentes solo para los pesos. Hay que anadir la cache KV y el overhead del contexto, por lo que el margen en un dispositivo de 128 GB es ajustado.
- Dispositivo objetivo: un unico equipo de memoria unificada de clase 128 GB, tal como especifica el autor. No se detallan modelos concretos de GPU o de sistema.
- GPU de consumo: no cabe en tarjetas de 24 GB, 32 GB ni 48 GB. Se requiere una GPU profesional de 80 GB en adelante solo si se plantea reparto multi-GPU, opcion que la model card no documenta.
- Multi-GPU: no disponible; el autor dimensiona el pack para un unico dispositivo.
- Opciones de despliegue: ExLlamaV3 es la unica via documentada, con carga mediante `Config.from_directory`, `Model.from_config` y `Tokenizer.from_config`. El formato EXL3 no es compatible con llama.cpp, GGUF, Ollama, vLLM ni TGI segun la informacion disponible.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de carga.
- Almacenamiento: el repositorio ocupa 326,6 GB repartidos en 17 shards, un dato a tener en cuenta en el aprovisionamiento de disco aunque la huella en memoria sea de 112,9 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / tamano | Fidelidad vs original | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este pack (SAGE EXL3 1,62 bpw) | 262,16 B totales | no disponible | 1,62 bpw, ~112,9 GiB residentes | 94,52% Top-1, KL 0,0982 | MIT | HuggingFace, 119 descargas |
| DeepSeek-V4.1-Flash-1017 oficial (FP8/FP4 mixto) | 262,16 B totales | no disponible | FP8/FP4 nativo | 100% (referencia) | MIT | HuggingFace (repo upstream) |
| Otras cuantizaciones del mismo modelo (GGUF, AWQ, EXL3 de mayor bpw) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparativa relevante es contra la release oficial: este pack reduce la huella a unos 112,9 GiB a costa de un 5,48% de perdida de acuerdo Top-1 global, concentrada sobre todo en el dominio general (89,94% Top-1) y mucho menor en codigo (99,08%). No hay datos en la informacion proporcionada para comparar con cuantizaciones de terceros del mismo modelo ni con modelos de otros proveedores de tamano similar.

## Limitaciones y advertencias

- Perdida de fidelidad no uniforme: el dominio general cae al 89,94% de acuerdo Top-1 con un KL medio de 0,2245, muy por encima del resto de categorias (codigo 0,0186, razonamiento 0,0349, matematicas 0,0477). En produccion orientada a texto general, la deriva respecto al modelo original es notable.
- El metodo SAGE no esta publicado: no se puede auditar la asignacion de bits por tensor ni reproducir la receta, lo que limita la confianza en el pack para entornos regulados.
- Formato propietario de facto: depende exclusivamente de ExLlamaV3. No hay soporte documentado en llama.cpp, Ollama, vLLM ni TGI, lo que reduce las opciones de despliegue y de escalado.
- Requisito de memoria muy estricto: 112,9 GiB solo de pesos dejan poco margen para cache KV en un dispositivo de 128 GB; contextos largos pueden provocar OOM.
- Idiomas no declarados: el campo de idiomas esta vacio, por lo que no hay garantia documentada de rendimiento en castellano ni en otros idiomas distintos del ingles.
- Capacidades multimodales sin documentar: el pipeline es `image-text-to-text`, pero la model card del pack no describe encoder de vision ni resolucion de imagen; no debe asumirse un comportamiento concreto sin validacion.
- Sin benchmarks de tareas: no hay MMLU, HumanEval, GSM8K ni equivales publicados en este repositorio; las cifras disponibles miden solo divergencia respecto al original, no calidad absoluta.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en la informacion proporcionada; la cuantizacion a 1,62 bpw puede amplificarlo en dominios de baja fidelidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la model card.
- Licencia: MIT heredada del modelo base, lo que permite uso comercial, pero conviene citar a DeepSeek por el modelo original. El repositorio solo contiene el pack EXL3.
- Fechas del repositorio: creado el 2026-10-18 y actualizado el 2026-10-20, posteriores a la fecha habitual de consulta; conviene verificar el estado actual del repo antes de depender de el.

## Enlaces

- Repositorio del pack: https://huggingface.co/vcruz305/DSV4.1-Flash-1017-SAGE-EXL3-1.62bpw
- Perfil del autor: https://huggingface.co/vcruz305
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3

Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo (son listados de sitios para adultos) y se han descartado por completo; no se ha encontrado informacion adicional contrastable sobre este pack ni sobre el modelo base.
