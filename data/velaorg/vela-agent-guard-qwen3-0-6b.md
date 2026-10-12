# VelaOrg/vela-agent-guard-qwen3-0.6b

## Resumen

Vela Agent Guard · Qwen3-0.6B es un fine-tune completo de Qwen/Qwen3-0.6B desarrollado por VelaOrg como modelo guardián (guardrail) para agentes de IA que operan con carteras cripto, claves de API y llamadas a herramientas. Su función es responder a tres preguntas concretas emitiendo siempre una única línea de JSON: detectar secretos en texto libre (claves privadas, frases semilla, claves de API, direcciones de cartera), detectar intentos de prompt injection en la combinación de petición del usuario más salida de herramienta, y decidir si una llamada a herramienta debe permitirse, confirmarse o bloquearse.

El modelo tiene 596.049.920 parámetros (0,6B) y se distribuye como un checkpoint estándar de `Qwen3ForCausalLM`, sin cabezas auxiliares ni arquitecturas híbridas, lo que le permite ejecutarse en cualquier entorno compatible con `transformers` o vLLM. Es el hermano ligero de VelaOrg/vela-agent-guard, construido sobre Vela 2.0 y más preciso, pensado para escenarios donde se necesita un checkpoint Qwen3 puro desplegable en cualquier infraestructura.

Su relevancia actual radica en el auge de agentes autónomos con acceso a fondos y credenciales, donde una capa de decisión determinista y de bajo coste computacional (menos de 1,2 GB de pesos en bf16) puede anteponerse a acciones irreversibles. El modelo se entrenó con 3.000 filas sintéticas (1.000 por tarea) y se publica bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen3ForCausalLM), fine-tune completo de Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 (≈0,6B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en la model card del fine-tune; el modelo base Qwen3-0.6B soporta 32.768 tokens nativos |
| Tipos de cuantizacion | No se publican variantes cuantizadas oficiales; pesos guardados en bf16. Al ser un checkpoint Qwen3ForCausalLM estándar admite cuantización con herramientas habituales, pero no hay versiones GGUF/AWQ/GPTQ publicadas por el autor |
| Idiomas soportados | No disponible (la model card no lo declara; los datos de entrenamiento sintéticos y los ejemplos están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), librería transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones: un transformer decoder-only causal con tokenizador Qwen3 y la clase estándar `Qwen3ForCausalLM`. No hay cabezas de clasificación adicionales, adaptadores LoRA ni componentes híbridos; toda la capacidad de decisión reside en el propio modelo generativo, que produce JSON como texto. La inferencia se realiza con decodificación greedy (`do_sample=False`) y con el modo *thinking* desactivado (`enable_thinking=False`), lo que evita cadenas de razonamiento intermedias y mantiene la salida en una sola línea parseable. Los prompts de sistema exactos que hay que usar de forma literal están en `lm_guard/format.py` (`SYSTEM_PROMPTS`).

El entrenamiento consistió en un fine-tune completo durante 2 épocas con AdamW, learning rate 3e-5, batch de 16 y pérdida calculada únicamente sobre los tokens de respuesta. El conjunto de datos son 3.000 filas sintéticas (1.000 por cada tarea: secretos, injection y tool call) muestreadas del set de entrenamiento de Vela Agent Guard (`vela_guard/gen_*.py`), con claves y direcciones falsas pero con formato correcto. Las plantillas de evaluación son disjuntas de las de entrenamiento. El entrenamiento se ejecutó en una única GPU A40 en RunPod, aproximadamente 40 minutos incluyendo la evaluación, y los pesos se guardaron en bf16.

## Capacidades

- Detección de secretos: dada una cadena de texto arbitraria, devuelve `{"secrets": [{"label": "api_key", "text": "..."}]}` con las etiquetas `private_key`, `seed_phrase`, `api_key` y `wallet_address`. La función `parse_output` mapea las cadenas devueltas a offsets de caracteres en el texto original.
- Detección de prompt injection: recibe la petición del usuario junto con la salida de una herramienta y responde `{"injection": true}` o `{"injection": false}`.
- Decisión sobre llamadas a herramientas: recibe la petición del usuario y la llamada a herramienta propuesta y emite `{"decision": "allow" | "confirm" | "block"}`.
- Salida estructurada estricta: siempre una línea de JSON. Las salidas malformadas hacen fallback a `block` o a estado de incertidumbre en el parser.
- Integración con agentes: diseñado como capa intermedia entre el agente y la ejecución real de herramientas, especialmente en flujos con movimiento de fondos.
- Compatibilidad de despliegue: funciona con `transformers`, vLLM y text-generation-inference (TGI) por ser un checkpoint Qwen3 causal estándar.
- Contexto específico de Web3: entrenado con direcciones y formatos de clave propios de ese dominio.

## Casos de uso

- Guardrail previo a transferencias de fondos: interceptar cada `tool_call` de tipo `transfer` para que el modelo emita `allow`, `confirm` o `block` antes de que el agente firme la transacción. En la evaluación, ninguna llamada que debía bloquearse fue permitida (`block_passed_as_allow` = 0).
- Filtrado de salidas de herramientas frente a prompt injection: cuando un agente lee una página web, un correo o el resultado de una API, pasar la combinación `request` + `tools` al modelo para detectar instrucciones maliciosas inyectadas antes de que el agente las ejecute.
- Escaneo de secretos en logs y trazas: analizar texto libre generado por agentes para detectar claves de API, frases semilla o claves privadas que se hayan filtrado en la conversación; conviene combinarlo con expresiones regulares para formatos conocidos.
- Protección de billeteras en asistentes conversacionales: validar que el destinatario de una operación coincide con el solicitado por el usuario, detectando manipulaciones del tipo «envía 10 USDC a esta otra dirección».
- Pre-filtro en pipelines de agentes multi-paso: usar el modelo de 0,6B como primera capa barata que descarta casos triviales, reservando el modelo mayor (Vela Agent Guard 4B) para los casos dudosos.
- Auditoría de sesiones de agentes: ejecutar el modelo en modo batch sobre transcripciones almacenadas para etiquetar qué turnos contienen secretos, intentos de injection o tool calls arriesgadas.
- Cumplimiento interno en entornos DeFi y custodial: registrar la decisión del guardián como evidencia de control previo antes de operaciones que mueven activos.
- Despliegue en el propio dispositivo o en el borde: al ocupar alrededor de 1,2 GB en bf16, puede ejecutarse en hardware modesto sin enviar credenciales a un servicio externo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la evaluación v2 (300 filas por tarea, plantillas no vistas durante el entrenamiento, decodificación greedy). Las filas «hard» son casos deliberadamente complicados, como hashes de transacción que parecen claves privadas o páginas que citan ataques sin ejecutarlos.

| Sistema | Secrets char-F1 (hard) | Injection acc / F1 | Tool call acc (hard) |
|---|---|---|---|
| Este modelo (Qwen3-0.6B, solo modelo) | 0,830 (0,632) | 0,883 / 0,897 | 0,960 (0,919) |
| Vela Agent Guard 4B (cabezas + híbrido) | 0,946 (0,884) | 0,970 / – | 1,000 (1,000) |

Notas aportadas por el autor: no se permitió ninguna llamada que debía bloquearse; los errores son del tipo `block` a `confirm`. La detección de injection es demasiado agresiva: 29 de 96 páginas benignas calificadas como «hard» (las que solo citan un ataque) fueron marcadas. La detección de secretos es la parte más débil. Estos números proceden de datos sintéticos y el tráfico real diferirá.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,2 GB para los pesos en bf16 o fp16; en la práctica, entre 2 y 3 GB de VRAM considerando el tokenizador, el contexto y los estados intermedios de la decodificación.
- Cabe sin problema en GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4070, RTX 4080, RTX 4090 y cualquier GPU con 4 GB o más.
- GPU de centro de datos: A40, A100, H100 y similares son sobredimensionadas para el modelo, pero válidas si se despliega junto a otros servicios; el entrenamiento reportado usó una A40.
- Inferencia en CPU: viable por el tamaño reducido, aunque no hay cifras publicadas de latencia o throughput.
- Opciones de despliegue: `transformers` (ejemplo del autor con `AutoModelForCausalLM` y `device_map="auto"`), vLLM y text-generation-inference (TGI), estos dos últimos por los tags del repositorio. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF no publicada por el autor.
- Llamada concreta del autor: `max_new_tokens=256`, `do_sample=False`, modo thinking desactivado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (eval v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VelaOrg/vela-agent-guard-qwen3-0.6b | 0,6B | No especificado | Secrets 0,830 (0,632); Injection 0,883/0,897; Tool call 0,960 (0,919) | Apache-2.0 | HuggingFace, checkpoint Qwen3 |
| VelaOrg/vela-agent-guard (4B) | 4B (aproximado; no confirmado en la información disponible) | No disponible | Secrets 0,946 (0,884); Injection 0,970; Tool call 1,000 (1,000) | No indicada en la información disponible | HuggingFace |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B | 32.768 tokens nativos | No aplica: no es un guardián, no produce JSON de decisión | Apache-2.0 | HuggingFace |

No se dispone de datos comparativos frente a otros guardianes de la misma categoría (por ejemplo clasificadores de injection de Meta o modelos de detección de secretos especializados); no disponible.

## Limitaciones y advertencias

- Un modelo guardián reduce el riesgo, no lo elimina: el propio autor lo describe como una capa de defensa más, no la única.
- Detección de secretos débil: puede pasar por alto secretos en formatos que no ha visto. El autor recomienda combinarlo con expresiones regulares para formatos de clave conocidos.
- Falsos positivos en injection: marca el 30 % de páginas benignas «hard» que solo citan un ataque. Puede degradar la experiencia si se aplica sin umbral.
- Sesgo hacia `confirm`: los errores de decisión sobre tool calls son transiciones de `block` a `confirm`, no a `allow`, lo que es conservador pero puede generar fricción innecesaria con confirmaciones humanas.
- Dependencia del contexto de la llamada: el veredicto sobre tool calls solo conoce lo que hay en la petición y en la llamada, sin estado adicional del agente.
- Datos de evaluación sintéticos: los resultados de la eval v2 proceden de datos sintéticos y el comportamiento en tráfico real será distinto.
- Idiomas: la model card no declara soporte multilingüe y los datos de entrenamiento están en inglés; no hay evidencia de rendimiento en otros idiomas.
- Salidas malformadas: si el modelo no emite JSON válido, el parser hace fallback a `block` o a estado inseguro, lo que conviene monitorizar.
- Restricciones de licencia: Apache-2.0 permite uso comercial, igual que el modelo base. El proyecto se declara comunitario y no afiliado al equipo de Qwen, a KR Labs ni al equipo del vLLM Semantic Router.
- Para cualquier operación que mueva dinero deben mantenerse controles deterministas (listas de permitidos, validación de importe y destinatario, confirmación humana) por delante del modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VelaOrg/vela-agent-guard-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo hermano de mayor precisión: https://huggingface.co/VelaOrg/vela-agent-guard
