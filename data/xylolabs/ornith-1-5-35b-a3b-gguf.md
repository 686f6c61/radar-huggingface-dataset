# Xylolabs/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B-GGUF es la version cuantizada en formato GGUF del modelo Ornith-1.5-35B-A3B, desarrollado originalmente por el equipo Ornith (ornith-ai) y convertida a GGUF por Xylolabs. Se trata de un modelo de generacion de texto de 35.505.251.456 parametros totales con una arquitectura de mezcla de expertos (MoE), tal como indica el sufijo "A3B" (aproximadamente 3 mil millones de parametros activos por token). El modelo base esta pensado para inferencia local y en servidores mediante llama.cpp, con soporte para CUDA, Metal y CPU.

Esta version GGUF resuelve el problema de desplegar un modelo MoE de gran tamano en hardware de consumo y estaciones de trabajo, ofreciendo una unica cuantizacion Q4_K_M de 21,71 GB que mantiene una fidelidad razonable respecto al BF16 de referencia (KL medio de 0,0792 y 87,63% de coincidencia top-1 en 8.188 posiciones de texto en ingles y coreano). La model card del autor incluye una tabla detallada de recomendaciones de hardware que abarca desde una RTX 4090 de 24 GB hasta una B300 de 288 GB, con ventanas de contexto que van de 32K a 256K tokens.

El modelo es relevante ahora porque permite ejecutar un MoE de 35B con activacion de ~3B en GPUs de consumo mediante offload de expertos a RAM del sistema, y porque su licencia MIT facilita el uso comercial. La informacion disponible es limitada en cuanto a arquitectura detallada, datos de entrenamiento y benchmarks, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun el sufijo A3B; detalles de la arquitectura no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3B (inferido del sufijo A3B); cifra exacta no disponible |
| Longitud de contexto | Hasta 256K tokens segun la tabla de hardware del autor; 32K en RTX 4090/3090 con offload; 128K en RTX 5090 |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada) |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos con 35.505.251.456 parametros totales y aproximadamente 3 mil millones de parametros activos por token, segun se deduce del sufijo "A3B". No se dispone de informacion detallada sobre el numero de expertos, la estrategia de enrutamiento, el tipo de atencion ni la composicion exacta del dataset de entrenamiento en la informacion proporcionada. La cita del modelo base, titulada "Ornith-1.5: From Self-Scaffolding to Self-Improvement", sugiere que el entrenamiento incluye tecnicas de auto-mejora y andamiaje automatico, aunque no se detallan los metodos concretos (RLHF, DPO u otros) en la documentacion disponible.

La version GGUF ha sido convertida y cuantizada por Xylolabs a partir de los pesos del modelo base. La unica cuantizacion publicada es Q4_K_M, con un tamano de 21,71 GB. El autor reporta metricas de fidelidad frente a una pasada BF16 en transformers: KL medio de 0,0792 y 87,63% de coincidencia top-1, evaluadas sobre 8.188 posiciones de texto en ingles y coreano. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, segun los idiomas declarados en la model card.
- Razonamiento y generacion de texto de proposito general, propio de un modelo base de tipo text-generation.
- Soporte de plantilla de chat incluida en el archivo GGUF, lo que permite uso conversacional multi-turno mediante `--jinja` en llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- Capacidad de ejecucion con contexto largo (hasta 256K tokens en hardware con memoria suficiente, segun la tabla del autor).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional local en ingles y coreano: el modelo puede gestionar conversaciones multi-turno gracias a la plantilla de chat incluida y a una ventana de contexto que llega a 256K tokens en hardware con memoria suficiente, lo que permite mantener historiales largos sin truncar.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: mediante offload de expertos a RAM del sistema (`--n-cpu-moe 40`), se puede ejecutar el modelo en una RTX 4090 o RTX 3090 con contexto de 32K, adecuado para prototipado y desarrollo local.
- Procesamiento de documentos largos en coreano e ingles: con 256K tokens de contexto en GPUs de 48 GB o mas (RTX 6000 Ada, H100, H200, B200), el modelo puede resumir o analizar contratos, informes o transcripciones extensas en una sola pasada.
- Servicio de inferencia autoalojado: la compatibilidad con `llama-server` y el tag `endpoints_compatible` permiten exponer el modelo como API interna para aplicaciones de empresa que requieran soberania de datos y licencia MIT.
- Generacion de contenido bilingue: util para equipos que producen material en ingles y coreano (documentacion, marketing, soporte) y necesitan un unico modelo local sin depender de APIs externas.
- Investigacion y experimentacion con modelos MoE: el formato GGUF y la unica cuantizacion Q4_K_M facilitan reproducir experimentos de cuantizacion y medir el impacto en calidad (KL y top-1) sobre hardware asequible.
- Educacion y demos offline: al caber en equipos con memoria unificada (Mac Studio, DGX Spark), permite demostraciones sin conexion en entornos con restricciones de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la fidelidad de la cuantizacion Q4_K_M frente a BF16:

| Metrica | Valor |
|---|---|
| KL medio vs BF16 | 0,0792 |
| Coincidencia top-1 vs BF16 | 87,63% |
| Posiciones evaluadas | 8.188 (ingles y coreano) |
| Tamano del archivo | 21,71 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 21,71 GB; con overhead de contexto y KV cache, se recomienda al menos 24 GB de VRAM para contexto de 32K.
- GPUs recomendadas segun el autor:
  - RTX 4090 / RTX 3090 (24 GB): offload de expertos, contexto 32K.
  - RTX 5090 (32 GB): contexto 128K.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): contexto 256K.
  - H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada): contexto 256K.
  - H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256 GB y 512 GB unificada), B300 (288 GB): contexto 256K.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con offload de expertos a RAM del sistema (`--n-cpu-moe 40`), y en RTX 5090 con contexto de 128K.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con `llama-cli` y `llama-server`; soporte de CUDA, Metal y CPU. No se mencionan otras herramientas como vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo base Ornith-1.5-35B-A3B es la referencia directa, pero no se ofrecen datos de benchmarks ni comparativas con alternativas de la misma categoria. Se indica, por tanto, como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B-GGUF (este) | 35,5B totales / ~3B activos | Hasta 256K | MIT | GGUF |
| Ornith-1.5-35B-A3B (base) | 35,5B totales / ~3B activos | No disponible | MIT | No disponible |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Idiomas limitados: solo se declaran ingles y coreano; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion para este modelo.
- Sesgos: no se dispone de informacion sobre sesgos conocidos ni sobre el proceso de alineacion del modelo base.
- Contexto: aunque el autor indica hasta 256K tokens, el contexto efectivo puede degradarse y depende del hardware; en RTX 4090/3090 con offload se limita a 32K.
- Cuantizacion unica: solo se publica Q4_K_M, con una perdida medible frente a BF16 (KL 0,0792, top-1 87,63%); no hay opciones de mayor o menor precision en este repositorio.
- Licencia: MIT, lo que permite uso comercial, pero se recomienda revisar los terminos del modelo base y las condiciones de la licencia original.
- Dependencia de version de llama.cpp: el autor exige un commit concreto o posterior, lo que puede complicar la integracion en entornos con versiones fijas.
- Informacion escasa: no hay benchmarks publicados, ni detalles de entrenamiento, ni datos sobre tool calling o agentes, lo que limita la evaluacion para produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina del modelo Ornith-1.5: https://ornith.ai/ornith_1_5.html
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-GGUF/blob/main/LICENSE
