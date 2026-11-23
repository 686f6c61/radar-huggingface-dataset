# vcruz305/RED-SNOW-5.3-FLASH-EXL3-SAGE-4.91bpw

## Resumen
RED-SNOW-5.3-FLASH-EXL3-SAGE-4.91bpw es una cuantizacion EXL3 en formato MixedK del modelo RED-SNOW-5.3-FLASH-BF16, publicado por vcruz305 en colaboracion oficial con Blackfrost-AI (Sir Frosty). Se trata de un checkpoint independiente y no de un adaptador: no requiere el modelo de origen en tiempo de carga. El modelo base es un ajuste de seguridad ofensiva sobre GLM-5.3-Flash, orientado a operaciones de red team autorizadas, con capacidad de razonamiento sobre rutas de ataque, herramientas y validacion controlada.

La arquitectura declarada es `Glm5NextForConditionalGeneration`, con un total de 99.705.190.494 parametros reales segun los safetensors, y una tasa de bits del cuerpo del decodificador de 4,91 bpw (excluyendo la LM head, que se representa aparte a 8 bits). Incluye una cabeza especulativa nativa de una capa MTP (multi-token prediction). El repositorio ocupa aproximadamente 199,5 GB, empaquetado en 36 shards SafeTensors indexados.

La relevancia actual del artefacto es doble: por un lado, demuestra una conversion EXL3 con asignacion dinamica de anchos de bit (SAGE) que mantiene una fidelidad alta respecto al BF16 original (96,85% de coincidencia top-1 y KL media de 0,01174 nats en un conjunto independiente); por otro, apunta a despliegue en dos DGX Spark, un objetivo de hardware compacto para un modelo de ~100.000 millones de parametros. La validacion de servicio distribuido queda pendiente segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (transformer tipo GLM-5.3, con torre multimodal y capa MTP) |
| Parametros totales | 99.705.190.494 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 SAGE MixedK a 4,91 bpw en el cuerpo del decodificador; LM head a 8 bits |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (36 shards indexados, ~199,6 GB), libreria exllamav3 |

## Arquitectura y entrenamiento
El checkpoint es una conversion de cuantizacion, no un entrenamiento nuevo: preserva la arquitectura, el tokenizer, los assets del processor, la torre multimodal y la capa MTP nativa del modelo de origen. La arquitectura subyacente es `Glm5NextForConditionalGeneration`, un transformer con componentes multimodales empaquetados (vision) y una cabeza especulativa MTP de una capa para decodificacion especulativa. La cuantizacion emplea SAGE, que asigna dinamicamente anchos de bit por modulo, dando lugar a un esquema MixedK con una tasa media de 4,91 bits por parametro en el decodificador.

El modelo de origen RED-SNOW-5.3-FLASH-BF16 se construyo a partir de `zai-org/GLM-5.3-Flash-BF16` mediante una adaptacion de seguridad con LoRA en BF16 de rango 16 y alpha 32 sobre 529 matrices objetivo. El formato de entrenamiento fueron pares de un solo turno usuario/asistente con perdida solo en el asistente. El split finalizado contiene 17.132 ejemplos de entrenamiento y 1.793 de validacion, con 14.707 ejemplos (85,8%) procedentes de cuatro familias principales de fuentes de seguridad ofensiva. La politica de prompts elimina los mensajes de sistema de entrenamiento y el arrastre de conversacion, de modo que la plantilla de publicacion aporta el prompt operativo de RED-SNOW y sigue admitiendo `system` y `developer` del cliente.

## Capacidades
- Generacion de texto y razonamiento tecnico orientado a seguridad ofensiva y defensiva.
- Razonamiento sobre rutas de ataque: encadena debilidades aisladas en trayectorias realistas desde el acceso inicial hasta el impacto material.
- Operaciones multidominio: identidad, nube, red, aplicacion, endpoint, movil, wireless, fisico y OT.
- Analisis de exploits y tradecraft: evaluacion de explotabilidad, logica de payloads, planificacion de post-explotacion y validacion controlada.
- Ejecucion consciente de deteccion: tiene en cuenta EDR, logging, telemetria y visibilidad del defensor.
- Flujos orientados a herramientas: genera comandos estructurados, planes, artefactos y llamadas a herramientas (tool calling) para entornos controlados por el operador.
- Conversion purple-team: traduce observaciones ofensivas en detecciones, mitigaciones, prioridades de hardening y criterios de retesteo.
- Capacidades multimodales empaquetadas (vision), aunque la propia model card indica que no han sido probadas en calidad.
- Modo de decodificacion especulativa mediante la capa MTP nativa.
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.

## Casos de uso
- Ejercicios de red team autorizados: el modelo convierte un objetivo en una ruta de ataque tecnicamente fundamentada, razonando a traves de identidad, infraestructura, aplicaciones, endpoints, nube y OT, lo que encaja con su entrenamiento especifico en rutas de ataque.
- Evaluacion de explotabilidad en bug bounty: analiza logica de aplicaciones web y APIs, valida exploits y redacta informes de bug bounty, apoyandose en su cobertura de aplicacion web, API y logica de negocio.
- Analisis de Active Directory y movimiento lateral: razona sobre credenciales, relaciones de privilegio, fronteras de confianza y movimiento lateral, util para auditorias de identidad.
- Ingenieria de deteccion y purple teaming: transforma hallazgos ofensivos en reglas de deteccion, mitigaciones y criterios de retesteo, con soporte de analisis SIEM, DFIR y threat intelligence.
- Planificacion de operaciones en entornos ICS/OT: ofrece analisis consciente de seguridad en entornos de altas consecuencias, cubriendo ICS/OT y seguridad fisica.
- Automatizacion de flujos con herramientas en Kali: genera comandos estructurados, enumeracion, escalada de privilegios y payloads dentro de entornos controlados por el operador, gracias a su orientacion a tool calling.
- Analisis de malware y tradecraft consciente de EDR: apoya el analisis de persistencia, command and control, ransomware y operaciones de endpoint, considerando la visibilidad del defensor.
- Despliegue en hardware compacto: al estar cuantizado a 4,91 bpw y apuntar a dos DGX Spark, permite servir un modelo de ~100.000 millones de parametros en un entorno de dos nodos pequenos, aunque la validacion de servicio distribuido esta pendiente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de fidelidad de la cuantizacion frente al modelo BF16 de origen:

| Metrica de fidelidad | Valor |
|---|---|
| Coincidencia top-1 (conjunto independiente) | 9.917 / 10.240 (96,85%) |
| KL media | 0,01174 nats |
| NLL (origen → cuantizado) | 1,33197 → 1,33562 |
| PPL (origen → cuantizado) | 3,78848 → 3,80235 |

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio pesa aproximadamente 199,5 GB en safetensors, por lo que la inferencia requiere al menos ese orden de memoria agregada; no se dispone de cifras oficiales de VRAM por GPU.
- Objetivo de despliegue declarado: dos DGX Spark, con validacion de servicio distribuido pendiente segun la model card.
- GPU recomendadas: no disponible de forma explicita; por tamano, el modelo no cabe en una unica GPU consumer y requiere agregacion de memoria en varios nodos o GPUs de datacenter.
- Cabe en consumer GPU: no, dado el tamano del checkpoint (~199,5 GB) y la arquitectura de ~100.000 millones de parametros.
- Opciones de despliegue: libreria exllamav3 (ExLlamaV3) como formato nativo; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RED-SNOW-5.3-FLASH-EXL3-SAGE-4.91bpw | 99.705.190.494 | no disponible | EXL3 SAGE MixedK 4,91 bpw | MIT | Hugging Face (482 descargas, 26 likes) |
| RED-SNOW-5.3-FLASH-BF16 (origen) | no disponible | no disponible | BF16 | no disponible | Hugging Face (Blackfrost-AI) |
| GLM-5.3-Flash-BF16 (fundamento) | no disponible | no disponible | BF16 | no disponible | Hugging Face (zai-org) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo especializado en seguridad ofensiva, su distribucion de respuestas esta fuertemente sesgada hacia ese dominio.
- Riesgo de alucinacion: no cuantificado; como modelo generativo de ~100.000 millones de parametros, puede producir comandos, rutas de ataque o referencias tecnicas inexactas, por lo que requiere validacion humana en entornos controlados.
- Limitaciones de idioma: el campo `language` solo declara ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible.
- Vision: los componentes multimodales estan empaquetados pero no han sido probados en calidad segun la propia model card.
- Licencia: MIT, lo que permite uso comercial, pero el modelo esta disenado para trabajo de seguridad ofensiva autorizado; su uso no autorizado puede tener implicaciones legales.
- Produccion: la validacion de servicio distribuido en dos DGX Spark esta pendiente; el artefacto es una cuantizacion EXL3 y depende de la libreria exllamav3, lo que limita la portabilidad a otros runtimes.
- El campo `quantization_config.bits` del Hub es una aproximacion compatible con el parser; la tasa real del cuerpo del decodificador es de 4,91 bpw.

## Enlaces
- Hugging Face (este artefacto): https://huggingface.co/vcruz305/RED-SNOW-5.3-FLASH-EXL3-SAGE-4.91bpw
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-BF16
- Organizacion Blackfrost-AI: https://huggingface.co/Blackfrost-AI
- Fundamento GLM-5.3-Flash-BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
