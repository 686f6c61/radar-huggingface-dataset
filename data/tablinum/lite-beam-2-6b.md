# tablinum/Lite-Beam-2.6B

## Resumen

Lite-Beam 2.6B es una cuantización GGUF de precisión mixta construida manualmente por el autor independiente Tablinum sobre el modelo base LiquidAI/LFM2.5-2.6B-Instruct, un transformer de 2.697.198.592 parámetros desarrollado por Liquid AI. No se trata de un cuantizado estándar generado con una única bandera, sino de un mapa de tensores diseñado a mano en el que las capas de atención (concretamente la proyección V) reciben un suelo mínimo de Q5_K, los embeddings y los bloques primero y último suben un escalón completo y el bloque FFN adopta el escalón más bajo considerado seguro. El objetivo es conservar la calidad de razonamiento de un modelo de 2.6B dentro de un presupuesto de almacenamiento de aproximadamente dos gigabytes.

El modelo se distribuye en dos variantes: una de 3.80 bpw que ocupa 1.194 GiB y otra de 4.72 bpw que ocupa 1.48 GiB. Según la model card, la variante de 3.80 bpw obtiene 734/2500 aciertos en un benchmark congelado de 2.500 preguntas de opción múltiple (MMLU-Pro, GPQA y BBH), frente a los 740/2500 del cuantizado estándar Q3_K_M de llama.cpp, una diferencia de −0.0024 de precisión con p = 0.81 en 6.2% menos bytes. La variante de 4.72 bpw alcanza 767/2500 frente a los 779/2500 del modelo F16 original (p = 0.45), lo que el autor describe como indistinguible estadísticamente de la base sin cuantizar.

Su relevancia actual reside en el segmento de inferencia local y en dispositivo: un modelo conversacional de 2.6B que cabe en CPU, en GPUs de consumo con poca VRAM y en entornos sin conexión, con pesos en formato GGUF listos para llama.cpp. La licencia es la LFM Open License v1.0, que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI LFM2.5-2.6B-Instruct); pesos cuantizados en GGUF para llama.cpp |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el protocolo de evaluacion usa 2.048 tokens) |
| Tipos de cuantizacion | GGUF de precision mixta: atencion V en Q5_K (8 capas), token_embd en Q4_K, primer y ultimo bloque un escalon superior, FFN en el escalon minimo seguro; dos variantes publicadas de 3.80 bpw y 4.72 bpw |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del transformer LiquidAI/LFM2.5-2.6B-Instruct, no un modelo entrenado desde cero. La innovacion tecnica de esta ficha no reside en el entrenamiento sino en el mapa de tensores: en lugar de aplicar una cuantizacion uniforme, el autor asigna tipos de cuantizacion distintos por tensor segun su sensibilidad. Las ocho capas de atencion fijan la proyeccion V en Q5_K como suelo duro, los embeddings de tokens se mantienen en Q4_K y los bloques primero y ultimo suben un rung completo, mientras que el grueso de las capas FFN recibe el escalon mas bajo que el autor considera seguro. Los tipos de tensor se verifican en disco y el mapa exacto se distribuye con su hash para permitir una reconstruccion byte a byte.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF o DPO; esos datos corresponden a la model card de LiquidAI, no a esta cuantizacion. La evaluacion se realizo con un instrumento congelado de 2.500 items de opcion multiple con respuesta de letra unica, extraidos de MMLU-Pro, GPQA y BBH, usando `llama-server -ngl 99`, contexto de 2.048, 12 hilos, prefijo de respuesta forzado y argmax sobre letras A-J de un solo token, con intervalos de confianza bootstrap.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Instruct base.
- Razonamiento de opcion multiple y respuesta a preguntas de conocimiento, evaluado sobre MMLU-Pro, GPQA y BBH.
- Inferencia local en CPU y en GPU con llama.cpp, sin dependencia de servicios en la nube.
- Compatibilidad con endpoints estilo OpenAI a traves del cliente terrabeam (`http://127.0.0.1:8080/v1`).
- Integracion con el sistema de "library passages" de terrabeam, que inyecta pasajes de conocimiento en cada pregunta para compensar el tamano reducido del modelo.
- Memoria persistente opcional mediante `--memory long-term`.
- Compatibilidad con Ollama, LM Studio y vLLM a traves de `terrabeam proxy --upstream`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.

## Casos de uso

- Asistente conversacional totalmente offline: el modelo se ejecuta con llama.cpp sobre CPU o GPU de consumo y responde en ingles sin conexion, lo que lo hace adecuado para entornos air-gapped o con requisitos de privacidad estrictos.
- Despliegue en dispositivos de borde con VRAM limitada: la variante de 1.19 GiB permite cargar el modelo completo en GPUs integradas o en equipos con menos de 2 GB de memoria libre, manteniendo un nivel de razonamiento de 2.6B.
- Sustitucion de cuantizados Q3_K_M en produccion: al igualar la precision del Q3_K_M estandar con 6.2% menos bytes, puede reemplazarlo en pipelines existentes de llama.cpp sin recalibrar el resto del sistema.
- Evaluacion de calidad de cuantizaciones: el mapa de tensores publicado con hash y los resultados por item permiten reproducir el benchmark y auditar el efecto de cada tipo de cuantizacion sobre la precision.
- Prototipado rapido de aplicaciones LLM locales: la instalacion en un solo comando con terrabeam y la API compatible con OpenAI facilitan integrar el modelo en Open WebUI, Cursor o Claude Code sin infraestructura adicional.
- RAG ligero en local: combinado con los pasajes de la libreria de terrabeam, el modelo puede responder consultas de dominio especifico delegando el conocimiento en el contexto inyectado en lugar de en los pesos.
- Servicio proxy sobre backends existentes: mediante `terrabeam proxy` se puede enrutar una instalacion de Ollama, LM Studio o vLLM ya existente y aplicar el formato Tablinum sin cambiar de motor.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Instrumento: 2.500 items de opcion multiple (MMLU-Pro, GPQA, BBH), contexto 2.048, 12 hilos, `-ngl 99`.

| Variante | bpw | Tamano | Aciertos / 2500 | Retencion vs F16 | IC 95% | Comparacion |
|---|---|---|---|---|---|---|
| Lite-Beam 3.80 bpw | 3.80 | 1.194 GiB | 734 | no disponible en el fragmento | p = 0.81 frente a Q3_K_M | Empata con Q3_K_M (740/2500) en 6.2% menos bytes |
| Lite-Beam 4.72 bpw | 4.72 | 1.48 GiB | 767 | indistinguible del F16 | p = 0.45 frente a F16 | Supera en tamano a Q4_K_M (5.0% menor) con la misma precision (p = 0.40) |
| Stock Q3_K_M (llama.cpp) | no disponible | 1.273 GiB | 740 | no disponible | — | Referencia de la variante de 3.80 bpw |
| F16 base | 16 | 5.03 GiB | 779 | 100% (referencia) | — | Referencia de retencion |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K en formato absoluto; los unicos datos son los aciertos agregados sobre el instrumento descrito.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1.2 GiB para la variante de 3.80 bpw y 1.5 GiB para la de 4.72 bpw, sin contar el contexto KV cache.
- Contexto de evaluacion: 2.048 tokens; el consumo de KV cache adicional no se detalla en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el autor no especifica modelos concretos. La evaluacion se ejecuto con `-ngl 99`, es decir, todas las capas descargadas en GPU.
- Cabe en GPU de consumo: si, por el tamano de los ficheros (1.19 GiB y 1.48 GiB); el autor no detalla que modelos concretos se han probado.
- Inferencia en CPU: soportada explicitamente (tags `cpu-inference`, `low-vram`, `on-device`); el benchmark se ejecuto con 12 hilos.
- Opciones de despliegue: llama.cpp (`llama-server`), cliente terrabeam, Ollama, LM Studio y vLLM (estos ultimos via `terrabeam proxy`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Formato |
|---|---|---|---|---|---|
| Lite-Beam 2.6B (3.80 bpw) | 2.697.198.592 | no disponible | 1.194 GiB | LFM Open v1.0 | GGUF |
| Lite-Beam 2.6B (4.72 bpw) | 2.697.198.592 | no disponible | 1.48 GiB | LFM Open v1.0 | GGUF |
| LFM2.5-2.6B-Instruct F16 (base) | 2.697.198.592 | no disponible | 5.03 GiB | LFM Open v1.0 | safetensors / GGUF |
| Q3_K_M estandar de llama.cpp | 2.697.198.592 | no disponible | 1.273 GiB | LFM Open v1.0 | GGUF |
| Q4_K_M estandar de llama.cpp | 2.697.198.592 | no disponible | no disponible (5.0% mayor que 1.48 GiB segun el autor) | LFM Open v1.0 | GGUF |

La comparacion con modelos de otros fabricantes del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Es una cuantizacion, no un modelo nuevo: hereda los sesgos y las limitaciones del LFM2.5-2.6B-Instruct original, que no se detallan en la informacion disponible.
- Riesgo de alucinacion inherente a un modelo de 2.6B; el autor mitiga parcialmente este riesgo mediante la inyeccion de pasajes de conocimiento de la libreria de terrabeam, lo que implica que el modelo por si solo no cubre ese conocimiento.
- La retencion de calidad se ha medido unicamente sobre un instrumento de opcion multiple con respuesta de una letra; no hay datos sobre generacion abierta, codigo o matematicas.
- La licencia LFM Open License v1.0 impone condiciones al uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en produccion.
- El modelo base es de octubre de 2026 y la cuantizacion de noviembre de 2026; el repositorio tiene 391 descargas y 0 likes, por lo que la validacion por parte de la comunidad es practicamente nula.
- El autor es independiente y el modelo no cuenta con el respaldo oficial de Liquid AI.
- El contexto maximo no se documenta en la informacion proporcionada; el benchmark usa 2.048 tokens, por lo que no hay garantias sobre el rendimiento con ventanas mayores.
- La instalacion recomendada ejecuta un script remoto (`install.sh` / `install.ps1`) desde GitHub, lo que introduce un riesgo de cadena de suministro que conviene auditar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Lite-Beam-2.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Instruct
- Repositorio del cliente terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Documentacion de integracion (harnesses): https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Script de instalacion: https://raw.githubusercontent.com/chadstthomas-svg/terrabeam/master/install.sh
- Script de instalacion para Windows: https://raw.githubusercontent.com/chadstthomas-svg/terrabeam/master/install.ps1
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
