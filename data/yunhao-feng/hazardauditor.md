# Yunhao-Feng/HazardAuditor

## Resumen

HazardAuditor es un modelo guard generativo de 8.190.735.360 parametros desarrollado por Yunhao-Feng, afinado a partir de Qwen/Qwen3Guard-Gen-8B. Su proposito no es moderar texto aislado, sino auditar trayectorias completas de agentes de uso de ordenador (computer-use agents, CUA): inspecciona conjuntamente la peticion del usuario, la traza de razonamiento intermedia, las llamadas a herramientas con sus argumentos y las respuestas del entorno, y emite un veredicto binario `safe` o `unsafe` acompanado de una justificacion anclada en la evidencia de la ejecucion.

La motivacion es que los fallos de seguridad en agentes emergen a nivel de ejecucion: cada paso puede parecer benigno por separado y volverse danino al componerse la trayectoria completa. HazardAuditor evalua lo que el agente hizo realmente, no solo lo que dijo que haria. La salida sigue un formato fijo con dos bloques, `<analysis>` y `<label>`, lo que facilita el parseo determinista en pipelines automatizados.

Tecnicamente es un transformer causal de la familia Qwen3 (`Qwen3ForCausalLM`) con 32.768 posiciones de contexto nativas —el protocolo oficial de auditoria conserva los primeros 16.000 tokens del prompt—, alineado mediante SFT de parametros completos seguido de GuardPO. El checkpoint se distribuye en safetensors y BF16, con un peso en disco de aproximadamente 32,76 GB, y exige transformers 5.2.0 o superior para ejecutar su razonamiento. Su resultado principal declarado es un 90,88 % de exactitud y un F1 especifico de fuente de 90,85 en el conjunto CUA-Exec.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal denso) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 posiciones nativas; el protocolo oficial de auditoria conserva los primeros 16.000 tokens del prompt |
| Tipos de cuantizacion | No disponible. El autor solo publica el checkpoint en BF16/safetensors; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, aproximadamente 32,76 GB en disco; BF16 recomendado en inferencia |
| Modelo base | Qwen/Qwen3Guard-Gen-8B (fine-tuning) |
| Alineamiento | SFT de parametros completos + GuardPO |
| Tarea | Auditoria de seguridad a nivel de ejecucion para agentes de uso de ordenador |
| Entrada | Trayectoria de agente completa, como cadena o lista ordenada de eventos |
| Salida | Analisis en lenguaje natural seguido de `safe` o `unsafe` |
| Libreria | transformers (requiere 5.2.0 o superior) |

## Arquitectura y entrenamiento

HazardAuditor emplea la arquitectura Qwen3 para modelo causal de lenguaje, con 8.190.735.360 parametros y 32.768 posiciones de contexto nativas. Se construye por fine-tuning del modelo guard Qwen/Qwen3Guard-Gen-8B, que aporta la base de comportamiento como guard. El proceso de alineamiento descrito en la model card es un SFT de parametros completos seguido de GuardPO, el metodo de optimizacion por preferencias citado en las etiquetas del repositorio junto a `reinforcement-learning` y `alignment`.

La innovacion principal no reside en la arquitectura, sino en la formulacion de la tarea: el modelo recibe la trayectoria serializada de un agente (rol de usuario, pensamiento y accion del agente, respuesta del entorno) y debe razonar sobre la ejecucion completa antes de emitir el veredicto. El protocolo oficial de auditoria no se reproduce con la llamada generica a `pipeline("text-generation")` del Hub: exige replicar la construccion de prompt, el escapado, el truncado, los ajustes de decodificacion y el parseo de salida del repositorio publico. El autor indica que se necesita transformers 5.2.0 o superior para ejecutar el razonamiento del modelo.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el desglose de las fases de RL, salvo la mencion explicita a GuardPO.

## Capacidades

- Auditoria de trayectorias de agentes de uso de ordenador: evalua de forma conjunta peticion, razonamiento intermedio, llamadas a herramientas con argumentos y respuestas del entorno.
- Veredicto binario determinista en formato fijo: `safe` o `unsafe`, delimitado por etiquetas parseables.
- Justificacion anclada en evidencia: genera un bloque `<analysis>` con el razonamiento que sustenta el veredicto.
- Deteccion de acciones peligrosas a nivel de ejecucion, por ejemplo exfiltracion de credenciales o lectura y transmision de ficheros sensibles.
- Salida estructurada: el envoltorio devuelve objetos con `analysis`, `label`, `raw_output`, `prompt_tokens`, `generated_tokens` y `truncated`.
- Integracion en pipelines: interfaz de linea de comandos (`hazard-auditor --input trajectory.json`) y compatibilidad declarada con text-generation-inference y endpoints.
- Idiomas: unicamente ingles.
- Soporte de tool calling / function calling: no disponible; el modelo audita trayectorias que contienen llamadas a herramientas, pero no se documenta que las emita.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no documentado como tal; el razonamiento se materializa en el bloque `<analysis>` previo al veredicto.

## Casos de uso

- Puerta de seguridad previa a la ejecucion en agentes CUA: interceptar la trayectoria acumulada antes de que el agente ejecute una accion con efectos externos (envio de datos, escritura de ficheros, llamadas a API) y bloquearla si el veredicto es `unsafe`.
- Auditoria post-hoc de logs de agentes en produccion: procesar las trazas almacenadas y etiquetar como seguras o inseguras las ejecuciones completadas, priorizando la revision humana de los casos marcados.
- Filtrado de datos para entrenamiento por refuerzo: descartar trayectorias peligrosas de los datasets de RL o de imitacion antes de reutilizarlas, reduciendo la propagacion de comportamientos indeseados.
- Red teaming y evaluacion de agentes: usar el modelo como juez automatico en campanas de ataque sobre agentes propios, comparando la tasa de deteccion entre versiones del agente.
- Cumplimiento y trazabilidad normativa: generar un registro con analisis y veredicto por cada ejecucion de agente, util como evidencia en auditorias internas o requisitos regulatorios sobre sistemas de IA.
- Monitorizacion en linea con alertas: ejecutar el auditor sobre trayectorias parciales en un bucle de observabilidad y disparar alertas cuando el veredicto cambie a `unsafe` a mitad de una sesion.
- Analisis forense de incidentes: reconstruir y clasificar la secuencia de eventos de un incidente ya ocurrido para determinar en que paso concreto se cruzo el limite de seguridad.
- Evaluacion comparativa de modelos guard: usar HazardAuditor como referencia de auditoria a nivel de trayectoria frente a guards que solo evalúan turnos de texto aislados.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CUA-Exec | Exactitud | 90,88 % |
| CUA-Exec | F1 especifico de fuente | 90,85 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numericas con otros modelos guard. Los unicos datos de evaluacion proporcionados son los de CUA-Exec indicados en la model card.

## Requisitos de hardware

- Peso de los parametros en BF16: aproximadamente 16,4 GB para los 8.190.735.360 parametros (2 bytes por parametro); el repositorio ocupa 32,76 GB en disco.
- El autor indica una GPU de clase 24 GB como punto de partida practico con el checkpoint cargado en BF16. El consumo crece con la longitud de la trayectoria y con los ajustes de generacion.
- GPU recomendadas: A100 (40/80 GB), H100, L40S (48 GB) y RTX 4090 (24 GB) como minimo practico en BF16; no cabe en GPUs de 8 o 16 GB sin cuantizacion.
- Cuantizaciones publicadas: no disponibles. Al no existir variantes GGUF, AWQ ni GPTQ documentadas, no se puede estimar con rigor el encaje en GPUs de gama baja.
- Opciones de despliegue: transformers 5.2.0 o superior es obligatorio para el razonamiento; se soportan `sdpa` y FlashAttention-2; el repositorio declara compatibilidad con text-generation-inference y endpoints. El autor no documenta despliegue con vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.
- Memoria adicional: la caché KV y las activaciones dependen de la longitud de la trayectoria; el protocolo oficial trunca el prompt a los primeros 16.000 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HazardAuditor | 8.190.735.360 | 32.768 posiciones (protocolo oficial: 16.000 tokens de prompt) | Auditoria de seguridad de trayectorias completas de agentes CUA | Apache 2.0 | Safetensors en HuggingFace |
| Qwen3Guard-Gen-8B (modelo base) | No disponible en la informacion proporcionada | No disponible | Guard generativo de texto | No disponible en la informacion proporcionada | HuggingFace |
| Otros guards de la misma categoria (Llama Guard, ShieldGemma, etc.) | No disponible | No disponible | Moderacion de contenido, principalmente por turno | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre HazardAuditor y alternativas de la misma categoria en la informacion proporcionada. La diferencia funcional documentada frente a su modelo base es el ambito de evaluacion: HazardAuditor audita la ejecucion completa de una trayectoria, mientras que Qwen3Guard-Gen-8B se distribuye como guard generativo de proposito mas general.

## Limitaciones y advertencias

- Solo soporta ingles. No hay evidencia de comportamiento fiable en castellano u otros idiomas.
- Riesgo de alucinacion en el bloque `<analysis>`: la justificacion generada puede ser plausible pero no corresponder exactamente con la evidencia de la trayectoria. El veredicto `safe`/`unsafe` es un juicio del modelo, no una garantia.
- Falsos negativos: una clasificacion `safe` no certifica que la trayectoria sea realmente inocua. No debe usarse como unico control de seguridad en sistemas con efectos irreversibles.
- Truncado de contexto: el protocolo oficial conserva solo los primeros 16.000 tokens del prompt. Trayectorias muy largas pueden perder informacion relevante del final.
- Herramienta fragil a la integracion: la llamada generica a `pipeline("text-generation")` no reproduce el protocolo oficial; hay que replicar la construccion de prompt, el escapado, el truncado, la decodificacion y el parseo del repositorio publico.
- Dependencia de version: requiere transformers 5.2.0 o superior para ejecutar el razonamiento. Versiones anteriores pueden degradar o romper el comportamiento.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez frente a dominios concretos. Al derivar de Qwen3Guard-Gen-8B, hereda las caracteristicas de sus datos de entrenamiento, no detallados.
- Ambito restringido: no es un modelo de generacion general ni un asistente. Usarlo fuera de la tarea de auditoria de trayectorias no esta respaldado por la documentacion.
- Licencia: Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones que apliquen al modelo base Qwen/Qwen3Guard-Gen-8B.
- Madurez: el repositorio registra 449 descargas y 2 likes, con fechas de creacion y actualizacion de 2026 en el Hub. La validacion externa por parte de la comunidad es todavia escasa.
- Los resultados de 90,88 % de exactitud y 90,85 de F1 corresponden a un unico benchmark (CUA-Exec) declarado por el autor; no hay evaluacion independiente disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yunhao-Feng/HazardAuditor
- Repositorio de codigo: https://github.com/Yunhao-Feng/HazardAuditor
- Pagina del proyecto: https://yunhao-feng.github.io/HazardAuditor/
- Paper en Hugging Face: https://huggingface.co/papers/2609.15134
- Paper en arXiv: https://arxiv.org/abs/2609.15134
- Modelo base Qwen3Guard-Gen-8B: https://huggingface.co/Qwen/Qwen3Guard-Gen-8B
- Licencia: https://github.com/Yunhao-Feng/HazardAuditor/blob/main/LICENSE
