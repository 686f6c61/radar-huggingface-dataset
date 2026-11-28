# YourHighnessLA/L0xRE-v1-Inkling-Mini-2-Low

## Resumen

L0xRE-v1-Inkling-Mini-2-Low es una cuantizacion de precision mixta del modelo Kintsugi-Inkling-2-Mini, publicada por el usuario YourHighnessLA. Su objetivo es hacer viable un contexto de 1.048.576 tokens en GPUs de 12 GB de VRAM mediante una combinacion de cuerpo de expertos en 2/3 bits (formato EXL3/Escha), tabla de embeddings Q4_0 offloadada a CPU y una cabeza de salida Q8_0 reajustada. El modelo base es un derivado de Inkling-2-Mini con arquitectura de mezcla de expertos dispersa, y este build conserva el cuerpo verificado del checkpoint original.

La innovacion principal reside en la cabeza de salida: se sustituye `output.weight` por un refit H4 de covarianza completa en Q8_0, filtrado mediante KL con softcap sobre dos particiones de calibracion. Segun la model card, esto reduce el KL medio un 41% y eleva la concordancia top-1 al 99,95% frente a la cabeza BF16 oficial. El resultado es un GGUF de 9,1 GB que, con el runtime L0xRE-BeeLLama-Low y atencion dispersa D-LSA, alcanza 1.047.936 tokens de contexto con un pico de 10,77 GB de VRAM en una RTX 5090.

Es relevante ahora porque demuestra que es posible operar ventanas de contexto de un millon de tokens en hardware de consumo, un terreno tradicionalmente reservado a GPUs de centro de datos. No obstante, se trata de un artefacto de cuantizacion muy especifico, con dependencias de runtime no estandar y evaluaciones acotadas a un unico conjunto de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa con atencion D-LSA; cuerpo Escha W2 |
| Parametros totales | 5.371.175.424 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | Cuerpo de expertos 2/3 bits (20x2b / 28x3b), embeddings Q4_0, cabeza de salida Q8_0, KV cache q4_0 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (9,1 GB de repo; 9.067.638.560 bytes de pesos) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con atencion dispersa D-LSA (Dynamic Long Sparse Attention), segun los tags y la documentacion del runtime. El cuerpo de expertos emplea cuantizacion Escha W2 en dos niveles: 20 expertos a 2 bits y 28 expertos a 3 bits. La tabla de embeddings se mantiene en Q4_0 y se ejecuta en CPU mediante offload, mientras que la cabeza de salida se ha reajustado a Q8_0 con un procedimiento H4 de covarianza completa.

El reentrenamiento de la cabeza es el unico componente modificado respecto al checkpoint base. Se capturaron 20.480 estados ocultos finales estratificados del cuerpo original y se ajusto la matriz de salida contra los pesos BF16 oficiales de Inkling-2-Mini, reteniendo 126.128 de 200.058 filas de vocabulario que mejoraban el KL con softcap (softcap=30,0) en ambas mitades de calibracion. No se dispone de informacion sobre el dataset de preentrenamiento original, el numero de tokens ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso con modo "thinking" configurable (presupuesto de razonamiento hasta 8.192 tokens en la configuracion documentada).
- Tool calling y function calling, verificado en el pack `toolcall-15` con 14/14 en pass@1.
- Salida estructurada (JSON y formatos similares), con 15/15 en `structoutput-15`.
- Extraccion de datos y seguimiento de instrucciones.
- Deteccion de bugs y tareas de codigo (15/15 en `bugfind-15`).
- Operacion como agente con historial de razonamiento preservado.
- Recuperacion de informacion en contextos extremadamente largos (16/16 en needle retrieval a 1M).
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir arboles de codigo extensos y responder preguntas sobre dependencias cruzadas entre modulos sin truncar.
- Agentes de terminal y automatizacion CLI: el pack `cli-40` (19/24 en pass@1) sugiere utilidad en tareas de shell scripting y automatizacion de sistemas, integrable en pipelines con tool calling.
- Extraccion de datos de documentos largos: informes, expedientes o contratos de cientos de miles de tokens pueden procesarse en una sola pasada, con salida estructurada validada (15/15 en `structoutput-15`).
- Atencion al cliente con historial extenso: la ventana de 1M permite conservar conversaciones multi-turno muy largas y documentacion de soporte en el mismo contexto.
- Auditoria de codigo y deteccion de bugs: el modelo identifica defectos en fragmentos de codigo (15/15 en `bugfind-15`), adecuado para revisiones automatizadas en CI.
- Despliegue en estaciones de trabajo con GPU de consumo: con 10,77 GB de pico en una RTX 5090, permite prototipar agentes de contexto largo sin acceso a A100/H100.
- Investigacion sobre atencion dispersa: al incluir el mapa D-LSA (`inkling2_dlsa_v3_d256.bin`), sirve como banco de pruebas para estudiar el comportamiento de la atencion dispersa a escalas de 1M.

## Benchmarks y rendimiento

Cabeza de salida (1.920 estados retenidos frente a la cabeza BF16 oficial):

| Modelo | KL medio | KL p99 | Concordancia top-1 |
|---|---|---|---|
| Kintsugi-Inkling-2-Mini-12G.gguf (stock) | 8,78e-6 | 9,06e-5 | 99,84% |
| L0xRE-v1-Inkling-Mini-2-Low.gguf | 5,15e-6 | 5,50e-5 | 99,95% |

Prueba de contexto de 1M (RTX 5090, perfil disperso L0xRE):

| Metrica | Resultado |
|---|---|
| Pico de VRAM | 10,7741 GB |
| Profundidad de contexto de entrada | 1.047.936 tokens |
| Recuperacion needle (t3-1m-0) | 16/16 |
| Velocidad de prefill / decode | 4.910 tok/s / 89,7 tok/s |

Evaluacion de agente y codigo (thinking ON, esfuerzo medio, pass@1 / pass@3):

| Pack | L0xRE-v1 | Stock v0165_1m_q6k_on | Stock z840_4090_control | Stock p0/n150-on |
|---|---|---|---|---|
| toolcall-15 | 14 / 14 | 14 / 14 | 14 / 14 | 13 / 14 |
| instructfollow-15 | 15 / 15 | 15 / 15 | 15 / 15 | 15 / 15 |
| structoutput-15 | 15 / 15 | 15 / 15 | 15 / 15 | 15 / 15 |
| dataextract-15 | 13 / 14 | 12 / 13 | 13 / 14 | 13 / 13 |
| reasonmath-15 | 12 / 14 | 14 / 14 | 12 / 14 | 13 / 14 |
| bugfind-15 | 15 / 15 | 15 / 15 | 15 / 15 | 15 / 15 |
| hermesagent-20 | 15 / 15 | 14 / 15 | 15 / 15 | 15 / 16 |
| cli-40 | 19 / 24 | 20 / 23 | 17 / 22 | 19 / 20 |
| TOTAL (150) | 118 / 126 | 119 / 124 | 116 / 124 | 118 / 122 |

## Requisitos de hardware

- VRAM estimada: 10,77 GB de pico en la configuracion de 1M de contexto con KV cache q4_0 y embeddings en CPU.
- GPU recomendada segun la model card: RTX 5090 (medicion oficial). Cualquier GPU con al menos 12 GB deberia poder ejecutar el perfil documentado, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo como RTX 4090 (24 GB), RTX 5090 (32 GB) y, con margen ajustado, en tarjetas de 12 GB.
- Despliegue: runtime L0xRE-BeeLLama-Low con `llama-server` y variables de entorno `L0XRE_SPARSE_*`; el mapa D-LSA `inkling2_dlsa_v3_d256.bin` se incluye en el repositorio. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Rendimiento medido: 4.910 tok/s de prefill y 89,7 tok/s de decode a 1M de contexto en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| L0xRE-v1-Inkling-Mini-2-Low | 5.371 M | 1.048.576 | Apache-2.0 | GGUF | Hugging Face |
| CaryPalmer/Kintsugi-Inkling-2-Mini | no disponible | 1M (segun variante 12G) | Apache-2.0 | GGUF | Hugging Face |
| Inkling-2-Mini (BF16 oficial) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otras familias de modelos no esta disponible en la informacion proporcionada. El unico contraste documentado es frente al checkpoint base Kintsugi-Inkling-2-Mini y sus variantes de despliegue, donde L0xRE-v1 mejora ligeramente en `dataextract` y `hermesagent` pero retrocede en `reasonmath` y `cli`.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta capacidad multilingue.
- El modelo base es un derivado de Inkling-2-Mini y no se detalla su procedencia de datos ni posibles sesgos heredados.
- Riesgo de alucinacion inherente a modelos de este tamano y cuantizacion agresiva (2/3 bits en el cuerpo de expertos).
- La cuantizacion W2 en 48 expertos puede degradar tareas de razonamiento matematico: `reasonmath-15` cae a 12/14 frente a 14/14 del stock v0165.
- Dependencia de un runtime no estandar (L0xRE-BeeLLama-Low) y de un mapa de atencion dispersa especifico; la portabilidad a otros motores de inferencia no esta garantizada.
- El rendimiento de 1M de contexto solo se ha verificado en RTX 5090; en GPUs de 12 GB el margen es minimo y puede requerir ajustes.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Repositorio sin descargas ni likes en el momento de la consulta; sin validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/YourHighnessLA/L0xRE-v1-Inkling-Mini-2-Low
- Modelo base: https://huggingface.co/CaryPalmer/Kintsugi-Inkling-2-Mini
- Runtime L0xRE-BeeLLama-Low: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low
