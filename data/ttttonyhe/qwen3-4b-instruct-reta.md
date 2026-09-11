# ttttonyhe/Qwen3-4B-Instruct-RETA

## Resumen

Qwen3-4B-Instruct-RETA es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario ttttonyhe, orientado a un problema muy concreto: la inyeccion indirecta de prompts en agentes que usan herramientas. En este fallo, el agente lee una pagina web, un correo o la respuesta de una API, encuentra texto dirigido a el y lo interpreta como una instruccion nueva del usuario. El modelo se entrena para que las instrucciones que llegan a traves de datos nunca adquieran la autoridad de las instrucciones que llegan del usuario.

El modelo tiene 4.022.468.096 parametros (aproximadamente 4,02 B), es denso, se distribuye en safetensors y conserva la licencia Apache 2.0 del modelo base. Su idioma declarado es el ingles. La relevancia actual esta en que los agentes con tool calling son cada vez mas comunes en produccion, y la superficie de ataque via contenido externo no esta cubierta por los ajustes estandar de instruccion.

El entrenamiento combina aprendizaje por refuerzo, que ensena el razonamiento que separa la tarea del usuario del contenido inyectado, con OPSD. El trabajo extiende RETA (arXiv:2606.15441) y se evalua contra un conjunto amplio de ataques, incluido un atacante adaptativo que optimiza payloads contra el propio modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (repo de 8,1 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Se parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4,02 B de parametros, y se aplica un ajuste orientado a seguridad de agentes. La model card describe dos componentes: aprendizaje por refuerzo, cuya funcion es ensenar el razonamiento que permite distinguir la tarea del usuario del contenido inyectado que llega por canales de datos, y OPSD. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros del proceso.

La innovacion principal no es de arquitectura, sino de comportamiento y de protocolo de contexto. El modelo se entrena con un system prompt de tres partes: `tool_calling_prompt.txt` con los esquemas de herramientas en JSON, un bloque `## Additional Instructions` con las instrucciones propias del agente y `trust_boundary.txt` anadido literalmente. Este ultimo define que regiones del contexto pueden modificar el objetivo del modelo. La model card advierte que las frases iniciales de `trust_boundary.txt` repiten texto que ya aparece al final de `tool_calling_prompt.txt` y que esa duplicacion es intencionada: el modelo se entreno con el pasaje en ambas posiciones, por lo que deben conservarse las dos.

El modelo emite las llamadas a herramientas como texto con el formato `<function=Nombre>{...}</function>` en lugar de usar el campo `tool_calls` de OpenAI, de modo que el parseo del tag y el reenvio del resultado como turno de usuario corren a cargo de la aplicacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Tool calling mediante el formato textual `<function=Nombre>{...}</function>`, con argumentos en JSON.
- Razonamiento explicito para separar la tarea del usuario del contenido presente en datos no confiables.
- Resistencia a inyeccion indirecta de prompts en respuestas de herramientas, paginas web y correos.
- Cooperacion con el atacante adaptativo: segun la model card, mantiene la robustez frente a un atacante genetico que muta y selecciona payloads contra el modelo con un presupuesto amplio de consultas.
- Utilidad benigna al nivel del modelo base, y utilidad bajo ataque: el modelo no se bloquea ni rechaza al encontrar una inyeccion, sino que completa la tarea del usuario.
- No se documentan capacidades de vision, audio, ni modos de pensamiento extendido especificos en la informacion disponible.
- El soporte multilingue se limita al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Agentes de navegacion web: el modelo lee paginas externas y resume su contenido sin aceptar instrucciones embebidas en el HTML, lo que lo hace adecuado para asistentes que consultan fuentes no controladas.
- Procesamiento automatizado de correo: un agente que clasifica y responde mensajes puede tratar el cuerpo del correo como datos y no como ordenes, evitando que un remitente malicioso redirija la tarea del asistente.
- Pipelines de RAG sobre documentos de terceros: en recuperacion aumentada con contratos, informes o documentacion externa, el modelo mantiene el objetivo original aunque el documento recuperado contenga texto imperativo.
- Automatizacion de operaciones con APIs de terceros: cuando la respuesta de una API se reintroduce como turno de usuario, el modelo no confunde un mensaje del proveedor con una instruccion del operador.
- Asistentes de atencion al cliente con acceso a herramientas internas: el agente puede consultar pedidos, facturas o incidencias mediante tool calling sin que el texto libre del cliente o de un sistema externo redefina la politica del agente.
- Ejecucion de tareas multi-paso en entornos con contenido no confiable: el modelo sostiene cadenas de llamadas a herramientas donde cada resultado intermedio es potencialmente hostil.
- Evaluacion y testeo de seguridad de agentes: sirve como linea base defendida frente a suites como AgentDojo o Agent Security Bench para medir la eficacia de otras defensas.
- Integracion en CI/CD con respuestas de servicios externos: en pipelines que consultan registries, gestores de incidencias o APIs de despliegue, el contenido devuelto por el servicio no puede alterar los pasos definidos por el equipo.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card afirma robustez frente a todos los ataques listados tanto en AgentDojo como en Agent Security Bench, y utilidad benigna al nivel del modelo base, pero sin cifras concretas.

| Ataque | Fuente | Resultado reportado |
|---|---|---|
| Direct | Debenedetti et al., 2024 (arXiv:2406.13352) | Robusto segun la model card (sin cifras) |
| Ignore Previous | Perez y Ribeiro, 2022 (arXiv:2211.09527) | Robusto segun la model card (sin cifras) |
| System Message | Debenedetti et al., 2024 | Robusto segun la model card (sin cifras) |
| Important Instructions | Debenedetti et al., 2024 | Robusto segun la model card (sin cifras) |
| Tool Knowledge | Debenedetti et al., 2024 | Robusto segun la model card (sin cifras) |
| InjecAgent | Zhan et al., 2024 (arXiv:2403.02691) | Robusto segun la model card (sin cifras) |
| Escape Characters | Liu et al., 2024 (arXiv:2310.12815) | Robusto segun la model card (sin cifras) |
| Fake Completion | Liu et al., 2024 | Robusto segun la model card (sin cifras) |
| Combined | Liu et al., 2024 | Robusto segun la model card (sin cifras) |
| ChatInject | Chang et al., 2026 | Robusto segun la model card (sin cifras) |
| Genetic Search | Nasr et al., 2025 (arXiv:2510.09023), sobre OpenEvolve | Robusto segun la model card (sin cifras) |

## Requisitos de hardware

- Pesos en bf16: aproximadamente 8,0 GB para 4,02 B de parametros, sin contar cache KV ni overhead del runtime. El repositorio ocupa 8,1 GB.
- VRAM estimada en bf16/fp16: en torno a 9-11 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en int8: aproximadamente 4-5 GB con cuantizacion de pesos.
- VRAM estimada en int4: aproximadamente 2,5-3,5 GB con cuantizacion de pesos, aunque no se publican pesos GGUF ni AWQ/GPTQ en el repositorio.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), y en tarjetas de 8 GB si se cuantiza.
- GPU de datacenter recomendadas: A100, H100, L40S y similares para despliegue concurrente a mayor volumen.
- Opciones de despliegue: transformers (ejemplo oficial de la model card con `AutoModelForCausalLM` y `device_map="auto"`), Text Generation Inference y endpoints compatibles, segun las etiquetas del repositorio. No se confirma soporte de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.
- Nota de integracion: el parseo de las llamadas a herramientas es manual y hay que construir el system prompt con las tres partes descritas, por lo que la puesta en produccion requiere codigo propio de orquestacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-RETA | 4,02 B | No disponible | apache-2.0 | Tool calling con defensa frente a inyeccion indirecta de prompts | HuggingFace, safetensors |
| Qwen/Qwen3-4B-Instruct-2507 | Aproximadamente 4 B | No disponible en la informacion proporcionada | apache-2.0 | Modelo base de proposito general con tool calling, sin defensa especifica | HuggingFace, safetensors |
| Otras alternativas de ~4 B con tool calling | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante que puede sostenerse con la informacion disponible es contra su propio modelo base: mismos parametros y misma licencia, pero sin el entrenamiento especifico de robustez frente a contenido inyectado. No se dispone de datos para comparar con modelos de seguridad de agentes de otros desarrolladores.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles, por lo que su comportamiento en castellano u otros idiomas no esta garantizado.
- Dependencia del prompt de sistema: el entrenamiento usa las tres partes descritas y la model card insiste en conservar la duplicacion de frases entre `tool_calling_prompt.txt` y `trust_boundary.txt`. Omitir o modificar estas partes puede degradar la defensa.
- Protocolo de herramientas no estandar: las llamadas se emiten como texto con `<function=...>` y no mediante el campo `tool_calls`, lo que exige parseo propio y complica la integracion con frameworks que esperan el formato de OpenAI.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad; un modelo de 4 B puede generar contenido incorrecto aunque la llamada a la herramienta sea correcta.
- La defensa no es absoluta: el propio autor reporta un atacante adaptativo (Genetic Search) como la prueba relevante, y una defensa solo medida frente a cadenas de ataque fijas tiene valor limitado cuando el atacante puede observar y optimizar contra el modelo.
- Ausencia de cifras: no hay numeros publicos de utilidad benigna, utilidad bajo ataque ni tasas de exito de inyeccion, lo que dificulta dimensionar el riesgo residual.
- Trazas y sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse que sesgos hereda del modelo base ni de los datos de ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del agente en produccion recae en el integrador.
- Madurez: el repositorio figura con 0 descargas y 0 likes y una fecha de actualizacion muy reciente, sin comunidad ni ecosistema de herramientas asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ttttonyhe/Qwen3-4B-Instruct-RETA
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- RETA (trabajo que extiende): https://arxiv.org/abs/2606.15441
- AgentDojo y ataques direct, system message, important instructions, tool knowledge: https://arxiv.org/abs/2406.13352
- Perez y Ribeiro, 2022 (Ignore Previous): https://arxiv.org/abs/2211.09527
- InjecAgent: https://arxiv.org/abs/2403.02691
- Liu et al., 2024 (escape characters, fake completion, combined): https://arxiv.org/abs/2310.12815
- Nasr et al., 2025 (atacante adaptativo): https://arxiv.org/abs/2510.09023
- Agent Security Bench: https://arxiv.org/abs/2410.02644
- OpenEvolve: https://github.com/codelion/openevolve
