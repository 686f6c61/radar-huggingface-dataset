# UtkarshSinghShrinet/swarmhunter-v2

## Resumen

SwarmHunter v2 es un modelo de lenguaje especializado en ciberseguridad desarrollado por Utkarsh Singh Shrinet. Se trata de un modelo conversacional de text-generation afinado para razonamiento de seguridad, deteccion de vulnerabilidades, analisis de exploits y verificacion autonoma de pruebas de concepto (PoC). La version 2 parte del modelo swarmhunter-3b, que a su vez se entreno mediante SFT sobre 2,28 millones de muestras multi-turno, y anade una etapa completa de Direct Preference Optimization (DPO) sobre 18.000 pares de alineacion de ciberseguridad.

Su arquitectura base es Qwen2.5-Coder-3B-Instruct, con aproximadamente 3.086 millones de parametros (3,09 B) y una ventana de contexto de 4.096 tokens en formato ChatML. El objetivo del DPO es reducir falsos positivos, adherirse estrictamente a especificaciones de protocolo (RFC 9110, RFC 6749, RFC 7519) y generar artefactos de verificacion de PoC reproducibles y ejecutables.

Es relevante ahora porque los modelos generalistas suelen alucinar vulnerabilidades y PoC no verificables; un modelo pequeno, cuantizado y alineado con DPO, ejecutable localmente via Ollama, permite integrar analisis de seguridad en flujos de trabajo de pentesting y CTF sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 4.096 tokens (formato ChatML) |
| Tipos de cuantizacion | BF16/FP16 (safetensors) y Q8_0 (GGUF) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF (binario Q8_0 independiente) |

## Arquitectura y entrenamiento

SwarmHunter v2 hereda la arquitectura transformer decoder de Qwen2.5-Coder-3B-Instruct. El entrenamiento se realizo en dos etapas: primero, el modelo base swarmhunter-3b se entreno mediante SFT ("Mega SFT") sobre 2.280.000 muestras multi-turno de ciberseguridad; despues, la version 2 aplico DPO completo sobre 18.000 pares elegidos/rechazados de alineacion en ciberseguridad, con 2.250 pasos globales.

Las metricas de entrenamiento publicadas indican una reduccion del 99,4 % en la perdida DPO (de 0,561 a 0,00339), una reward accuracy de 1,0 (100,0 %) y un reward margin de +5,83. No se ha publicado informacion sobre el numero total de tokens de preentrenamiento ni la composicion detallada del dataset mas alla de las cifras de muestras indicadas. No hay menciones a tecnicas como decodificacion especulativa o attention linear.

## Capacidades

- Razonamiento especializado en ciberseguridad: analisis de vulnerabilidades y deteccion de debilidades mapeadas a CVE y CWE.
- Analisis de exploits y verificacion autonoma de PoC, con generacion de artefactos reproducibles y ejecutables.
- Alineacion con especificaciones de protocolo: RFC 9110 (HTTP), RFC 6749 (OAuth 2.0) y RFC 7519 (JWT), para reducir falsos positivos en analisis de protocolos web.
- Soporte para tareas de CTF (captura the flag) y pruebas de penetracion.
- Generacion de texto conversacional en formato ChatML, apto para dialogos multi-turno.
- Despliegue local sencillo mediante Ollama gracias al binario GGUF Q8_0 incluido.
- No se ha documentado soporte de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Deteccion de vulnerabilidades en auditorias de codigo: el modelo puede analizar fragmentos de codigo o respuestas HTTP y clasificar debilidades segun taxonomias CVE/CWE, reduciendo falsos positivos gracias al DPO.
- Verificacion de exploits en pentesting: genera y valida artefactos de PoC reproducibles, util para confirmar si una vulnerabilidad reportada es explotable antes de escalar el hallazgo.
- Resolucion de retos CTF: dado su entrenamiento en tareas de CTF, puede asistir en el analisis de servicios, cabeceras HTTP, tokens JWT y flujos OAuth durante competiciones o entrenamientos.
- Revision de implementaciones de autenticacion: su adherencia a RFC 6749 y RFC 7519 lo hace adecuado para auditar flujos OAuth 2.0 y validacion de JWT en APIs.
- Analisis de conformidad HTTP: verifica comportamientos de servidores y proxies contra RFC 9110, util en revisiones de infraestructura web.
- Entornos air-gapped y laboratorios locales: al ser un modelo de 3 B con GGUF Q8_0, puede ejecutarse offline en estaciones de trabajo de analisis sin exponer datos sensibles a la nube.
- Triaje automatizado de hallazgos en pipelines de seguridad: puede integrarse en flujos de CI/CD o scanners para prefiltrar alertas y priorizar vulnerabilidades reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas publicadas corresponden al entrenamiento DPO:

| Metrica | Valor |
|---|---|
| Perdida DPO inicial | 0,561 |
| Perdida DPO final | 0,00339 (reduccion del 99,4 %) |
| Reward accuracy | 1,0 (100,0 %) |
| Reward margin | +5,83 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB en BF16/FP16 (safetensors) y alrededor de 3,3 GB con el GGUF Q8_0, mas overhead de contexto. La cifra exacta no esta publicada.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores); tambien es viable su ejecucion en CPU dado el tamano reducido.
- Cabe comodamente en GPUs de consumo; no requiere A100 ni H100 para inferencia.
- Despliegue: Ollama (comando directo sobre el GGUF de Hugging Face: `ollama run hf.co/UtkarshSinghShrinet/swarmhunter-v2:swarmhunter-v2.Q8_0.gguf`); por formato GGUF, es compatible en principio con llama.cpp y derivados. No consta soporte verificado para vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| SwarmHunter v2 | ~3,09 B | 4.096 | Ciberseguridad, deteccion de vulnerabilidades, PoC | Apache 2.0 |
| Qwen2.5-Coder-3B-Instruct (base) | ~3 B | 32.768 (según ficha oficial de Qwen) | Codigo generalista | Apache 2.0 / Qwen Research (según version) |
| WhiteRabbitNeo (variantes 7B/13B) | 7-13 B | 8.192 (según version) | Ciberseguridad ofensiva/defensiva | Licencia comunitaria (no Apache) |
| SecGPT / modelos de seguridad pequeños | Variable | Variable | Seguridad generalista | Variable |

Nota: los datos de los modelos comparables provienen de conocimiento general y pueden no reflejar las versiones mas recientes; no hay una comparativa de rendimiento directo publicada.

## Limitaciones y advertencias

- Idioma: el modelo esta documentado solo en ingles; su rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Contexto limitado a 4.096 tokens, lo que restringe el analisis de codigos grandes, respuestas HTTP extensas o conversaciones muy largas.
- Riesgo de alucinacion: aunque el DPO busco reducir falsos positivos, un modelo de 3 B puede seguir generando CVE/CWE incorrectos o PoC no funcionales; toda salida debe validarse manualmente por un profesional.
- Uso dual: al tratarse de un modelo orientado a exploits y pentesting, su uso debe limitarse a entornos autorizados y legales; el autor y la comunidad no se hacen responsables de usos maliciosos.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos de la arquitectura base Qwen2.5 para casos concretos.
- La reward accuracy de 1,0 en entrenamiento sugiere posible sobreajuste al conjunto de preferencias DPO; el rendimiento en datos reales fuera de distribucion no esta verificado.
- Metricas de descargas y likes muy bajas (66 descargas, 1 like) indican adopcion comunitaria minima y ausencia de validacion externa.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/UtkarshSinghShrinet/swarmhunter-v2
- Modelo base (SFT): https://huggingface.co/UtkarshSinghShrinet/swarmhunter-3b
- Arquitectura base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
