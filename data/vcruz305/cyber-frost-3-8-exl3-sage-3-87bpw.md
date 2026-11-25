# vcruz305/CYBER-FROST-3.8-EXL3-SAGE-3.87bpw

## Resumen

CYBER-FROST-3.8-EXL3-SAGE-3.87bpw es una cuantizacion EXL3 de 3,87 bits por parametro del modelo CYBER-FROST-3.8, desarrollado por Blackfrost-AI (Sir Frosty) y convertido por vcruz305 en colaboracion oficial. Se trata de un modelo de lenguaje especializado en ciberseguridad, orientado a flujos de trabajo profesionales autorizados (red team, blue team, respuesta a incidentes, analisis de malware y desarrollo de deteccion), y construido sobre la arquitectura `Qwen4ExpForConditionalGeneration` con mezcla de expertos (MoE).

El modelo resuelve un problema concreto del dominio: los asistentes generalistas tienden a rechazar peticiones legitimas de seguridad porque reaccionan a terminos individuales (exploit, malware, ransomware) en lugar de al contexto y al alcance autorizado del operador. CYBER-FROST busca mantener una respuesta tecnicamente directa en trabajos de investigacion y respuesta autorizados. Conviene subrayar que la autorizacion es un control externo al modelo: este no puede verificar propiedad, consentimiento ni alcance.

Tecnicamente, el checkpoint cuenta con 32.843.734.528 parametros totales, una ventana de contexto configurada de 262.144 tokens, cabeza LM en 8 bits, capa MTP (multi-token prediction) en 4 bits para decodificacion especulativa nativa, torre de vision en 6 bits y una tabla de n-gramas en 6 bits incluida. El artefacto pesa 104.872.927.412 bytes (97,67 GiB) repartidos en 9 shards SafeTensors mas `ngram_embedding.safetensors`, y esta pensado para servirse con ExLlamaV3 sobre una DGX Spark (GB10, 128 GB de memoria unificada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (transformer MoE, con torre de vision y capa MTP) |
| Parametros totales | 32.843.734.528 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurada) |
| Tipos de cuantizacion | EXL3 SAGE a 3,87 bits/parametro en el cuerpo; cabeza LM a 8 bits; capa MTP a 4 bits; torre de vision a 6 bits; tabla de n-gramas a 6 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | SafeTensors EXL3 (9 shards + `ngram_embedding.safetensors`), libreria exllamav3 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen4-Exp, con 32.843 millones de parametros totales. Incluye una torre de vision y ficheros de procesador, ademas de una capa MTP (multi-token prediction) que actua como cabeza especulativa nativa, y una tabla de n-gramas empaquetada junto a los pesos. La ventana de contexto configurada es de 262.144 tokens.

El padre BF16 fue ajustado por Blackfrost-AI sobre un corpus de seguridad que combina material curado del dominio, flujos de trabajo escritos por operadores, escenarios realistas de tipo engagement y datos de destilacion propiedad de Blackfrost. Los tamanos del corpus, el desglose por fuente y el material bruto de los engagements no se publican. Esta conversion EXL3 no anadio datos de entrenamiento: es una cuantizacion, no un ajuste adicional. La cuantizacion SAGE conserva el 93,89% de top-1 en el conjunto held-out (9.614/10.240) con una KL de 0,0264 nats (0,0380 bits) frente al BF16, y el 93,64% de top-1 en el conjunto independiente (9.589/10.240) con KL de 0,0423 nats (0,0610 bits).

## Capacidades

- Generacion de texto conversacional y asistencia tecnica en el dominio de ciberseguridad.
- Cobertura de reconocimiento y OSINT, ingenieria social, BEC y abuso con deepfakes, seguridad de aplicaciones web y APIs, identidad y Active Directory, seguridad de red y perimetral, investigacion de vulnerabilidades, bug bounty y explotacion binaria, analisis de malware y ransomware.
- Soporte de tool calling / function calling (etiqueta `tool-use`).
- Orientado a flujos de agente y razonamiento multi-paso en tareas de seguridad.
- Decodificacion especulativa nativa mediante una capa MTP.
- Presencia de torre de vision y procesador multimodal en la configuracion, aunque el autor advierte explicitamente que esta version EXL3 no ha recibido evaluacion de calidad multimodal.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Respuesta a incidentes: el modelo puede mantener conversaciones multi-turno con contexto muy largo (262.144 tokens) para correlacionar hallazgos, artefactos y lineas temporales de un incidente sin perder el hilo.
- Analisis de malware: revision de cadenas, comportamiento y tecnicas MITRE ATT&CK en muestras, con una respuesta tecnicamente directa en lugar de rechazos por vocabulario.
- Desarrollo de deteccion: generacion y revision de reglas Sigma, YARA, Suricata o KQL para pipelines de deteccion, apoyandose en tool calling para consultar fuentes o validar sintaxis.
- Validacion de vulnerabilidades en entorno controlado: reproduccion y triaje de hallazgos en laboratorios autorizados, con el modelo como asistente de analisis y no como ejecutor autonomo.
- Agente de seguridad aprobado: integracion en un agente con permisos acotados, donde el modelo propone pasos y el orquestador externo aplica identidad, alcance, registro y limites de tasa.
- Ingenieria defensiva y hardening: revision de configuraciones de Active Directory, VPN, perimetro y protocolos, con recomendaciones concretas sobre identidad y autenticacion.
- Formacion y simulacion de red team: generacion de escenarios de ingenieria social y BEC para ejercicios internos de concienciacion, siempre bajo reglas de enfrentamiento definidas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Top-1 held-out (vs. BF16) | 9.614 / 10.240 (93,89%) |
| KL held-out (vs. BF16) | 0,0264 nats (0,0380 bits) |
| Top-1 independiente (vs. BF16) | 9.589 / 10.240 (93,64%) |
| KL independiente (vs. BF16) | 0,0423 nats (0,0610 bits) |
| Top-1 held-out (pack anterior 3,5 bpw vs. FP8) | 86,96% |
| Top-1 independiente (pack anterior 3,5 bpw vs. FP8) | 85,16% |

Estas cifras miden fidelidad de cuantizacion frente al modelo de referencia, no capacidad absoluta en tareas de seguridad. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el payload publicado es de 97,67 GiB, por lo que se necesita un dispositivo con al menos 128 GB de memoria unificada o VRAM para cargar el pack completo con la configuracion indicada.
- Hardware probado: una DGX Spark (GB10, 128 GB de memoria unificada), con ventana de 262.144 tokens, cache KV en 8 bits, tabla de n-gramas en streaming desde disco y una peticion simultanea.
- GPU recomendadas: no disponible mas alla de la DGX Spark; el autor advierte que otros hardware y configuraciones no se han probado y que no debe inferirse un ajuste a partir del bitrate.
- GPU de consumo: no hay datos que confirmen que quepa en GPU de consumo; el tamano del payload (97,67 GiB) lo hace inviable en tarjetas de 24 GB o 48 GB sin offload agresivo, escenario no validado.
- Despliegue: ExLlamaV3 (fork `vcruz305/exllamav3` en el pin medido), siguiendo `DEPLOY.md` y la receta Qwen3.8-Flash-Next para DGX Spark. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica servicio de una peticion a la vez en la configuracion probada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-EXL3-SAGE-3.87bpw | 32,84 B | 262.144 | EXL3 3,87 bpw | qwen-community-license-1.0 | Hugging Face, 327 descargas |
| CYBER-FROST-3.8-EXL3-SAGE-3.5bpw | no disponible | no disponible | EXL3 3,5 bpw | no disponible | Hugging Face |
| CYBER-FROST-3.8-BF16 | no disponible | no disponible | BF16 | no disponible | Hugging Face (Blackfrost-AI) |
| CYBER-FROST-3.8-FP8 | no disponible | no disponible | FP8 | no disponible | Hugging Face (Blackfrost-AI) |

No se dispone de datos de benchmarks de capacidad ni de especificaciones completas de los packs hermanos que permitan una comparacion de rendimiento entre ellos; la unica comparacion publicada es de fidelidad de cuantizacion (top-1 y KL frente al BF16). No se han identificado en la informacion proporcionada modelos de ciberseguridad de terceros comparables.

## Limitaciones y advertencias

- La autorizacion es un control externo: el modelo no puede establecer propiedad, consentimiento, reglas de enfrentamiento, jurisdiccion ni si un objetivo esta en alcance. El despliegue debe imponer identidad, alcance, permisos de herramientas, registro, limites de tasa y revision humana.
- La reduccion de rechazos es un objetivo de diseno heredado del padre BF16, no una afirmacion de comportamiento medida para este pack EXL3.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad o robustez para esta version; en dominios tecnicos las respuestas deben validarse.
- La torre de vision esta presente en la configuracion, pero no hay evaluacion de calidad multimodal; no debe asumirse capacidad de imagen o video validada.
- Idiomas soportados no documentados; no se garantiza calidad fuera del idioma o idiomas del corpus de entrenamiento, cuyos detalles no se publican.
- Licencia qwen-community-license-1.0: deben revisarse las condiciones antes de uso comercial; el repositorio la etiqueta como `other`.
- Release publica en evaluacion de calidad activa; es un checkpoint independiente, no un adaptador, y no requiere el padre FP8 o BF16 en carga.
- Solo se ha validado el despliegue en una DGX Spark con la configuracion de `DEPLOY.md`; otros entornos no estan probados y el ajuste no debe inferirse del bitrate, ya que empaquetado, cabeza, embeddings, tabla de n-gramas, MTP, vision y memoria en tiempo de ejecucion son independientes de la cifra de 3,87 bpw.
- El corpus de seguridad no es publico (tamanos, fuentes, identidades de clientes, prompts y respuestas), lo que limita la auditabilidad del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vcruz305/CYBER-FROST-3.8-EXL3-SAGE-3.87bpw
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Release FP8: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-FP8
- Pack anterior 3,5 bpw: https://huggingface.co/vcruz305/CYBER-FROST-3.8-EXL3-SAGE-3.5bpw
- Fork de ExLlamaV3: https://github.com/vcruz305/exllamav3
- Receta Qwen3.8-Flash-Next para DGX Spark: https://github.com/vcruz305/Qwen3.8-Flash-Next-EXL3-DGX-Spark-recipe
- Organizacion Blackfrost-AI: https://huggingface.co/Blackfrost-AI
