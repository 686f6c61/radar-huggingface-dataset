# vcruz305/Inkling-2-Mini-Derisked-SAGE-REXL3-2.27bpw

## Resumen

Inkling-2-Mini-Derisked-SAGE-REXL3-2.27bpw es una cuantizacion EXL3/REXL3 del checkpoint `Blackfrost-AI/Inkling-2-Mini-Derisked`, publicada por el usuario `vcruz305`. Se trata de una version comprimida a 2,27 bits por peso de un modelo multimodal (texto e imagen) con arquitectura MoE y mecanismo de loop, derivado a su vez de `thinkingmachines/Inkling-2-Mini`. El paquete ocupa 8,00 GiB en dispositivo y se distribuye listo para cargarse con la libreria exllamav3.

El modelo base declara 26.400 millones de parametros totales con 3.400 millones activos por pasada, y 5.400 millones efectivos considerando tres pasadas de loop. Sin embargo, los safetensors del repositorio cuantizado suman 4.193.063.296 parametros reales, una discrepancia que conviene tener en cuenta al planificar el despliegue. La cuantizacion emplea un metodo propio del autor llamado SAGE, de precision mixta, cuya descripcion tecnica no se ha publicado.

Su relevancia practica radica en que permite ejecutar un modelo MoE multimodal de gran tamano nominal en un espacio de 8 GiB, lo que lo situa al alcance de GPUs de consumo alto. La contrapartida es una perdida de fidelidad medible: 91,43% de acuerdo top-1 y divergencia KL media de 0,0510 frente al checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con loop (`Inkling2LoopForConditionalGeneration`, `inkling2_loop`), multimodal texto + vision, con sidecar especulativo |
| Parametros totales | 26,4B declarados por el autor; 4.193.063.296 reales en safetensors del repo cuantizado |
| Parametros activos | 3,4B por pasada; 5,4B efectivos en 3 pasadas de loop |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3/REXL3 con metodo SAGE (precision mixta) a 2,27 bpw |
| Idiomas soportados | en, multilingual (sin listado detallado) |
| Licencia | other (sin terminos especificados) |
| Formato de pesos | safetensors (2 shards de tronco + `mtp.safetensors`), libreria exllamav3 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura MoE con un mecanismo de loop que reutiliza el mismo bloque de parametros en varias pasadas; el autor declara tres pasadas y 5,4B de parametros efectivos activos. Incorpora una torre de vision para entrada image-text-to-text y un sidecar de draft especulativo (`mtp.safetensors`) orientado a decodificacion especulativa. La cuantizacion SAGE es un esquema de precision mixta propietario del autor, no publicado, que asigna bits de forma no uniforme entre capas para minimizar la divergencia respecto al checkpoint original.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla el proceso de "derisking" aplicado en `Inkling-2-Mini-Derisked` ni en que consiste exactamente respecto al modelo original de thinkingmachines.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Razonamiento con modo loop: el mismo bloque se evalua en varias pasadas, lo que incrementa el computo efectivo por token.
- Decodificacion especulativa mediante sidecar `mtp.safetensors`, orientada a reducir latencia.
- Soporte multilingue segun la etiqueta `multilingual`, sin listado de idiomas concretos.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en GPU de consumo: con 8,00 GiB de huella, el modelo cabe en tarjetas de 12 GB o superiores, lo que permite probar un MoE multimodal de 26,4B nominales en hardware domestico.
- Prototipado de asistentes multimodales: la torre de vision y el pipeline image-text-to-text permiten construir demos de descripcion de imagenes, VQA o extraccion de informacion de documentos sin infraestructura de datacenter.
- Experimentacion con decodificacion especulativa: el sidecar `mtp.safetensors` permite medir el impacto del draft especulativo en throughput dentro de exllamav3.
- Evaluacion de tecnicas de cuantizacion agresiva: util como referencia para estudiar la relacion entre bits por peso, acuerdo top-1 y divergencia KL en modelos MoE multimodales.
- Servicio conversacional de baja concurrencia: para chatbots internos o entornos de desarrollo donde prima el coste de VRAM sobre la fidelidad absoluta al modelo original.
- Investigacion sobre arquitecturas con loop: permite reproducir y analizar el comportamiento de un modelo que reutiliza bloques en varias pasadas sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

El autor solo publica metricas de fidelidad frente al checkpoint de origen, no benchmarks de tareas.

| Metrica | Valor |
|---|---:|
| Acuerdo top-1 (greedy) | 91,43% |
| Divergencia KL media (float64, vocabulario completo) | 0,0510 |
| Huella en dispositivo | 8.589.908.232 bytes (8,00 GiB) |
| Huella en disco (safetensors) | 8.594.622.792 bytes |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GiB para los pesos en dispositivo, mas overhead de cache KV y buffers de inferencia; se recomienda un margen de 1 a 3 GiB adicionales segun contexto y batch.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), A100 y H100 para despliegues con mayor concurrencia.
- Cabe en GPUs de consumo: si, en tarjetas con 12 GB o mas de VRAM, con margen limitado en las de 12 GB.
- Opciones de despliegue: exllamav3 es la libreria declarada y la unica soportada de forma nativa para este formato EXL3/REXL3. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked-SAGE-REXL3 2.27bpw | 26,4B totales / 3,4B activos (declarado) | no disponible | EXL3/REXL3 2,27 bpw | other | Multimodal, loop, sidecar especulativo, solo exllamav3 |
| Blackfrost-AI/Inkling-2-Mini-Derisked | 26,4B totales / 3,4B activos (declarado) | no disponible | Original (sin cuantizar) | other | Checkpoint de referencia; mayor fidelidad, mayor huella |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Original | no disponible | Modelo de origen del que deriva el anterior |

No se dispone de datos de rendimiento en tareas que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Perdida de fidelidad medible: 91,43% de acuerdo top-1 implica que aproximadamente 1 de cada 12 tokens greedy difiere del modelo original, con impacto acumulativo en generaciones largas.
- Divergencia KL media de 0,0510: aceptable para experimentacion, arriesgada para produccion con requisitos estrictos de calidad.
- Discrepancia de parametros: el autor declara 26,4B totales pero los safetensors suman 4.193.063.296 parametros; conviene verificar la configuracion antes de asumir capacidades.
- Metodo SAGE no publicado: imposible auditar como se asignan los bits por capa ni reproducir la cuantizacion.
- Licencia "other" sin terminos explicitos: no se puede confirmar si el uso comercial esta permitido; hay que contactar con el autor o revisar la licencia del modelo base.
- Dependencia exclusiva de exllamav3: no hay soporte declarado para otros runtimes, lo que limita portabilidad y opciones de escalado.
- Idiomas: solo se declara "en" y "multilingual" sin listado; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion: no cuantificado por el autor; la cuantizacion agresiva a 2,27 bpw tiende a incrementarlo respecto al original.
- Sesgos: no documentados en la model card; se heredan los del modelo base, que tampoco los detalla.
- Longitud de contexto no especificada: impide planificar casos de uso con documentos largos o conversaciones extensas.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face (modelo cuantizado): https://huggingface.co/vcruz305/Inkling-2-Mini-Derisked-SAGE-REXL3-2.27bpw
- Modelo base: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo de origen: https://huggingface.co/thinkingmachines/Inkling-2-Mini
