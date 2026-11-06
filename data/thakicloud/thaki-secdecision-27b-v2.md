# ThakiCloud/Thaki-SecDecision-27B-V2

## Resumen

Thaki-SecDecision-27B-V2 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por ThakiCloud como parte de la familia Thaki Sec. No es un modelo generativo: se trata de un sistema de juicio jerarquico de evidencia para afirmaciones de seguridad. Dada una afirmacion (claim), los hechos requeridos para validarla y un conjunto de evidencias, el modelo decide si la afirmacion esta SUPPORTED, REFUTED, INSUFFICIENT o CONFLICTED, identifica que evidencias la apoyan o refutan, que hechos requeridos quedan sin satisfacer y si es posible concluir (decision de suficiencia). Toda la salida es JSON de esquema fijo; nunca genera texto libre.

La relevancia actual radica en su enfoque de verificacion sin generacion, orientado a operaciones de SOC (Security Operations Center) y a la validacion de hallazgos producidos por otros sistemas. En el pipeline de ThakiCloud, SecProof detecta problemas candidatos y SecDecision juzga si la evidencia recogida para ellos es suficiente para concluir. El modelo se presenta como research preview, con pesos e codigo de inferencia unicamente, sin integraciones ni servicio residente.

La arquitectura combina el backbone congelado Qwen3.8-27B, un adaptador LoRA en las 16 capas superiores (r16, alpha32) y tres cabezas fp32 (Relation, Fact, Sufficiency), mas un motor de decision determinista denominado Rule B. El contexto maximo verificado es de 4.096 tokens y el modelo solo soporta ingles. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.8-27B congelado) + LoRA (top-16 capas, r16 alpha32) + 3 cabezas fp32 + motor de reglas Rule B |
| Parametros totales | no disponible (adaptador LoRA sobre base de 27B; tamano de repo 0.2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (verificado) |
| Tipos de cuantizacion | no disponible (inferencia verificada en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador `adapter_model.safetensors`) + `heads.pt` (fp32) |

## Arquitectura y entrenamiento

El sistema es generation-free: un backbone Qwen3.8-27B congelado en la revision `1d4bf0f2…`, un adaptador LoRA aplicado sobre las 16 capas superiores (rango 16, alpha 32) y tres cabezas fp32 especializadas. La cabeza Relation puntua cada evidencia como SUPPORT, REFUTE, RELATED_ONLY o IRRELEVANT. La cabeza Fact evalua la satisfaccion de cada par hecho-evidencia. La cabeza Sufficiency combina senales de ultimo token, span de la claim y satisfaccion de hechos para producir los logits de estado y de `can_conclude`. Un motor de reglas determinista (Rule B) transforma esas probabilidades en la decision final con un umbral tau fijado exclusivamente sobre calibracion.

El entrenamiento y la evaluacion siguen un protocolo de pre-registro: ocho puertas (G0-G7) definidas antes de abrir el conjunto de TEST sellado (n=4.002), puntuado una sola vez con checkpoint y tau fijados previamente. La enmienda pre-registrada se denomina `refutation_coverage_gate_correction` y el valor de tau es 0.9995245433226797. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La verificacion de release se realizo mediante carga en proceso nuevo del paquete publico, con identidad de forward frente al volcado sellado y diferencia maxima inferior a 1e-3, en 1x NVIDIA B200 con bf16 y SDPA.

## Capacidades

- Clasificacion de afirmaciones de seguridad en cuatro clases: SUPPORTED, REFUTED, INSUFFICIENT y CONFLICTED.
- Decision de suficiencia (`can_conclude`) mediante Rule B con umbral tau; es una declaracion de suficiencia, no una autorizacion de accion.
- Identificacion de evidencias de apoyo y de refutacion, restringida a los `evidence_id` presentes en la entrada (no puede aparecer un ID fuera de la entrada).
- Deteccion de hechos requeridos no satisfechos (`missing_required_facts`).
- Puntuacion por evidencia de la relacion (SUPPORT, REFUTE, RELATED_ONLY, IRRELEVANT) y por par hecho-evidencia de satisfaccion.
- Salida estrictamente en JSON de esquema fijo; sin generacion libre de texto.
- Verificacion de integridad de artefactos mediante sha16 (`--check-sha`) frente a `config.json`.
- Soporte de inferencia en `vllm/vllm-openai:v0.28.0`.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking; no es un modelo conversacional.

## Casos de uso

- Triaje de hallazgos en un SOC: dado un hallazgo de seguridad con sus hechos requeridos y las evidencias recogidas, el modelo determina si la evidencia basta para concluir o si faltan datos, integrandose en el pipeline junto a SecProof, que genera los candidatos.
- Validacion de afirmaciones en informes de incidentes: comprobar si una afirmacion de un analista sobre un compromiso esta respaldada por las evidencias adjuntas, evitando conclusiones sin soporte documental.
- Control de calidad de pipelines de deteccion: usar el modelo como filtro de suficiencia antes de escalar un caso, reduciendo falsos positivos derivados de evidencia incompleta.
- Auditoria de evidencias en flujos de cumplimiento: verificar que cada afirmacion regulatoria o de control cuenta con los hechos requeridos satisfechos y senalar los que faltan.
- Verificacion de claims generados por otros sistemas de IA: como capa de validacion aguas abajo, comprobar que las conclusiones de un agente de seguridad estan respaldadas por evidencias verificables, dado que el modelo no genera texto libre y su salida es estructurada.
- Investigacion y evaluacion de metodos de juicio de evidencia: el paquete incluye el motor de reglas, la configuracion de decision y el pre-registro, lo que permite reproducir el protocolo de evaluacion en entornos controlados.
- Integracion programatica en pipelines de CI/CD de seguridad: la salida JSON de esquema fijo y el entrypoint `inference.py` permiten consumir decisiones de forma determinista en automatizaciones.

## Benchmarks y rendimiento

Resultados sobre el conjunto de TEST sellado (n=4.002), puntuado una unica vez con checkpoint y tau fijados previamente:

| Metrica | Thaki-SecDecision-27B-V2 | Stock zero-shot |
|---|---|---|
| Puertas G0-G7 | Todas PASS (veredicto GO) | no disponible |
| False-ENOUGH (brecha de seguridad) | 1/2.668 = 0.0004 | 202/2.668 = 0.0757 |
| ENOUGH recall | 1.297/1.334 = 0.9723 | 0.2924 |
| Relation Macro-F1 | 0.9634 | no disponible |
| Relation pairwise accuracy (FULL > PARTIAL/ADJACENT/ABSENT) | 0.9975 | no disponible |

Advertencia del autor: el conjunto de TEST es sintetico (claimworld), por lo que los numeros muestran generalizacion controlada dentro de ese ambito, no rendimiento sobre logs reales de SOC.

## Requisitos de hardware

- Inferencia verificada en 1x NVIDIA B200 con bf16, SDPA y contexto de hasta 4.096 tokens.
- VRAM estimada para el backbone de 27B en bf16: aproximadamente 54 GB solo para pesos, mas overhead de activaciones y cabezas; no se proporciona una cifra oficial.
- GPU recomendadas: B200 (verificada); previsiblemente A100 80 GB o H100 80 GB por capacidad de memoria, aunque no estan verificadas en la informacion disponible.
- No cabe en GPU de consumo convencional en bf16; no se documentan opciones de cuantizacion.
- Despliegue: `vllm/vllm-openai:v0.28.0` verificado; entrypoint publico `inference.py` y motor `secdecision_v2_infer.py`. No se documentan soportes de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Importante: no debe usarse el adaptador solo; es necesario cargar adaptador, cabezas fp32 y Rule B para reproducir el comportamiento verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-SecDecision-27B-V2 | LoRA sobre 27B | 4.096 | Juicio de evidencia de seguridad (4 clases) | Apache 2.0 | Hugging Face |
| Thaki-SecProof-27B-V1 | no disponible | no disponible | Auditoria de runtimes de agentes Python (12 fronteras de seguridad) | no disponible | Hugging Face |
| Thaki-SecEmbed-8B-Preview | 8B | no disponible | Embedding de recuperacion en ciberseguridad | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria fuera de la familia Thaki Sec; los resultados publicados comparan unicamente contra el comportamiento stock zero-shot del backbone.

## Limitaciones y advertencias

- El conjunto de TEST es sintetico (claimworld); los resultados no demuestran rendimiento sobre logs reales de SOC.
- `can_conclude=True` es una declaracion de suficiencia de evidencia, no una autorizacion para ejecutar acciones.
- El modelo solo soporta ingles.
- Contexto limitado a 4.096 tokens.
- No es un modelo generativo: no admite conversacion, tool calling ni razonamiento multi-paso.
- No debe usarse el adaptador de forma aislada; requiere las cabezas fp32 y el motor Rule B para reproducir el comportamiento verificado.
- El paquete no incluye integraciones (Paxis, Autonomous-SOC, Web-Chat) ni servicio residente; es un research preview.
- No se dispone de informacion sobre sesgos conocidos ni sobre tasas de alucinacion en el sentido generativo (la salida es de esquema fijo), aunque la calidad depende de la evidencia de entrada.
- Licencia Apache 2.0 permite uso comercial, pero el estado de research preview y la ausencia de validacion en datos reales desaconsejan su uso en produccion sin evaluacion adicional.
- No se documentan opciones de cuantizacion ni requisitos oficiales de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-SecDecision-27B-V2
- Modelo relacionado Thaki-SecProof-27B-V1: https://huggingface.co/ThakiCloud/Thaki-SecProof-27B-V1
- Modelo relacionado Thaki-SecEmbed-8B-Preview: https://huggingface.co/ThakiCloud/Thaki-SecEmbed-8B-Preview
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
