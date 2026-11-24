# vcruz305/Inkling-2-Mini-Derisked-SAGE-REXL3-4.24bpw

## Resumen

Inkling-2-Mini-Derisked-SAGE-REXL3-4.24bpw es una cuantizacion EXL3/REXL3 del checkpoint Blackfrost-AI/Inkling-2-Mini-Derisked, publicada por el usuario vcruz305. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura MoE y un mecanismo de bucle iterativo (inkling2_loop), empaquetado a 4,24 bits por peso en un footprint de 14,00 GiB. El autor aplica su propio metodo de cuantizacion de precision mixta denominado SAGE, que no esta publicado.

El modelo base declara 26.400 millones de parametros totales con 3.400 millones activos por token (5.400 millones efectivos considerando tres pasadas del bucle), aunque los pesos safetensors del repositorio cuantizado suman 7.397.649.792 parametros, dato que debe interpretarse con cautela al tratarse de un artefacto comprimido. Incorpora ademas un sidecar especulativo de decodificacion (mtp.safetensors) que permite acelerar la inferencia mediante draft tokens.

La relevancia de esta ficha reside en que demuestra el estado actual de las tecnicas de cuantizacion para modelos MoE multimodales: el autor reporta un 98,68 % de acuerdo top-1 y una divergencia KL media de 0,0028 frente al checkpoint original, lo que sugiere una perdida de calidad muy contenida. La licencia es "other" y no se detallan sus terminos, un punto critico para cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle iterativo (inkling2_loop), multimodal texto + vision, con sidecar de decodificacion especulativa |
| Parametros totales | 26,4B segun model card del autor; 7.397.649.792 segun safetensors del repo cuantizado |
| Parametros activos | 3,4B por token; 5,4B efectivos en 3 pasadas del bucle |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3/REXL3 a 4,24 bpw con metodo propietario SAGE (precision mixta) |
| Idiomas soportados | en, multilingual |
| Licencia | other (terminos no especificados) |
| Formato de pesos | safetensors (2 shards de tronco + mtp.safetensors), libreria exllamav3 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos (MoE) con un mecanismo de bucle: el mismo bloque de capas se reutiliza en varias pasadas de computo, lo que incrementa los parametros efectivos activos (de 3,4B a 5,4B en tres pasadas) sin aumentar el coste de memoria. Es nativamente multimodal, con una torre de vision integrada en los pesos del tronco, y el pipeline declarado es image-text-to-text.

El checkpoint original del que deriva es thinkingmachines/Inkling-2-Mini, del que Blackfrost-AI/Inkling-2-Mini-Derisked es una variante "derisked" sin que se detallen en la informacion disponible las modificaciones concretas. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable del artefacto es la cuantizacion SAGE a 4,24 bpw con precision mixta y el sidecar mtp.safetensors para decodificacion especulativa, que permite generar varios tokens por paso de verificacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida (chat_template.jinja).
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text) gracias a la torre de vision integrada.
- Razonamiento iterativo mediante el bucle inkling2_loop, que reutiliza capas en varias pasadas.
- Decodificacion especulativa nativa a traves del sidecar mtp.safetensors, orientada a reducir latencia.
- Soporte multilingue declarado (etiqueta multilingual), aunque el unico idioma confirmado de forma explicita es el ingles.
- Capacidad MoE con 3,4B parametros activos, lo que reduce el coste de inferencia frente a un modelo denso de 26,4B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes multimodales de atencion al cliente: el modelo puede procesar capturas de pantalla o fotos de producto junto con texto en la misma conversacion, lo que permite resolver incidencias visuales (por ejemplo, identificar un dano en un envio) sin un pipeline OCR separado.
- Analisis de documentos con imagenes: extraccion y razonamiento sobre diagramas, tablas escaneadas o graficos combinados con preguntas en lenguaje natural, aprovechando la torre de vision y el bucle iterativo para tareas de varias etapas.
- Despliegue en GPU de consumo: con 14,00 GiB de footprint, el modelo cabe en tarjetas de 16 GB o 24 GB, lo que habilita prototipado y demos locales de un MoE multimodal sin infraestructura de centro de datos.
- Generacion de descripciones y etiquetado de imagenes a escala: el bajo coste por token (3,4B activos) y la decodificacion especulativa permiten procesar lotes grandes de imagenes para catalogos, accesibilidad o moderacion de contenido.
- Investigacion en cuantizacion: el artefacto sirve como referencia reproducible para estudiar el impacto de SAGE a 4,24 bpw (98,68 % top-1, KLD 0,0028) frente al checkpoint original en tareas multimodales.
- Evaluacion de decodificacion especulativa: el sidecar mtp.safetensors permite medir ganancias de throughput en exllamav3 con y sin draft, util para comparar estrategias de serving.
- Chat multimodal en ingles con contexto conversacional: la plantilla de chat incluida facilita integrar el modelo en interfaces tipo asistente para usuarios angloparlantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de fidelidad de la cuantizacion frente al checkpoint original:

| Metrica | Valor |
|---|---:|
| Acuerdo top-1 (greedy) | 98,68 % |
| Divergencia KL media (float64, vocabulario completo) | 0,0028 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,00 GiB de pesos residentes en dispositivo (15.032.381.704 bytes) mas overhead de contexto KV y buffers de activacion; el consumo real dependera de la longitud de contexto, que no se especifica.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM para el modelo completo; RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB) y H100 (80 GB) son opciones validas.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas (RTX 4080, RTX 4090, RTX 5090). En tarjetas de 12 GB no cabria sin offloading.
- Opciones de despliegue: la libreria declarada es exllamav3 (formato EXL3/REXL3); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. La presencia del sidecar de decodificacion especulativa sugiere mejoras de throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / libreria | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked-SAGE-REXL3-4.24bpw (este) | 26,4B totales / 3,4B activos (model card); 7,4B en safetensors | no disponible | other | safetensors EXL3, exllamav3 | Cuantizacion multimodal MoE con sidecar especulativo |
| Blackfrost-AI/Inkling-2-Mini-Derisked | 26,4B totales / 3,4B activos | no disponible | other | safetensors (checkpoint original) | Checkpoint fuente sin cuantizar |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Modelo original del que deriva la familia |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion de rendimiento cuantitativa.

## Limitaciones y advertencias

- La licencia es "other" y no se detallan sus terminos: es imprescindible verificar las condiciones del modelo base y del original antes de cualquier uso comercial.
- El metodo de cuantizacion SAGE no esta publicado, lo que impide auditar la precision mixta aplicada capa a capa y reproducir el proceso.
- Existe una discrepancia entre los 26,4B parametros declarados en la model card y los 7.397.649.792 parametros de los safetensors; conviene tratarla como una ambiguedad no resuelta del artefacto.
- No se especifica la longitud de contexto soportada, lo que limita la planificacion de cargas con conversaciones largas o documentos extensos.
- El unico idioma confirmado explicitamente es el ingles; el soporte multilingue esta declarado pero no cuantificado ni evaluado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion.
- El modelo base es una variante "derisked" sin documentacion publica de las modificaciones aplicadas, lo que anade opacidad sobre su comportamiento.
- El despliegue esta ligado a exllamav3; no se declara compatibilidad con otros runtimes, lo que puede limitar la portabilidad.
- No hay datos de sesgos conocidos, evaluaciones de seguridad ni resultados de red teaming en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/Inkling-2-Mini-Derisked-SAGE-REXL3-4.24bpw
- Modelo base cuantizado: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
