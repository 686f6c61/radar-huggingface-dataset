# usezn/Galvanize-3.1

## Resumen

Galvanize 3.1 es un clasificador binario de prompt injection desarrollado por usezn. Su funcion es puntuar un fragmento de texto con una probabilidad entre 0 y 1 de que dicho texto intente manipular el comportamiento de un modelo o agente de IA, bien sea sobrescribiendo instrucciones, inyectando mensajes falsos de sistema o extrayendo el system prompt. El modelo esta pensado para el texto que un agente lee (salidas de herramientas, resultados MCP, paginas web, documentos de un repositorio), no solo para el chat que escribe una persona.

Tecnicamente es un fine-tuning de ModernBERT, en concreto de la familia mmBERT-small via Horizon-Labs/prompt-injection-guard-small, con aproximadamente 140,6 millones de parametros, ventana de 512 tokens y salida de un unico score. Se distribuye con pesos en safetensors y un grafo ONNX equivalente al que sirve la API zn del autor, y actua como detector por defecto de esa API y como comprobacion opcional en la nube de zn-gate, la capa de seguridad local para agentes de codigo.

Su relevancia actual radica en que aborda una de las superficies de ataque mas criticas en despliegues de agentes: el contenido no confiable que entra en el contexto del modelo. Con licencia Apache-2.0 y un modelo de 140M parametros, es viable ejecutarlo en CPU y desplegarlo como guardrail de baja latencia en pipelines de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, derivado de mmBERT-small) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (se distribuyen pesos full-precision en safetensors y ONNX) |
| Idiomas soportados | multilingue, ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch/transformers) y ONNX (onnx/model.onnx) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, construido sobre jhu-clsp/mmBERT-small (MIT) y pasado por Horizon-Labs/prompt-injection-guard-small (Apache-2.0), del que Galvanize 3.1 es un fine-tuning adicional a partir de usezn/Galvanize-3. La cabeza de clasificacion produce dos logits (INJECTION y SAFE); el grafo ONNX expone directamente la probabilidad P(injection) y el margen definido como logit INJECTION menos logit SAFE.

El protocolo de inferencia esta especificado por el autor: se normaliza el espaciado colapsando secuencias de blancos, se conservan los primeros 512 tokens y se aplica un umbral de decision de 0,9017 sobre la probabilidad (equivalente a un margen de 2,2166). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; al tratarse de un clasificador, el ajuste se realiza sobre etiquetas binarias. El tokenizer incluye un normalizador de entrada heredado del modelo base.

## Capacidades

- Deteccion de prompt injection: clasifica texto como intento de manipulacion con una probabilidad calibrada.
- Deteccion de jailbreaks: reconoce formulaciones orientadas a eliminar las reglas del modelo.
- Deteccion de sobrescritura de instrucciones: instrucciones que ignoran o reemplazan las del desarrollador o usuario, mensajes falsos de sistema y trucos de delimitadores.
- Deteccion de extraccion de system prompt: identifica intentos de revelar las instrucciones internas.
- Deteccion de inyecciones plantadas en contenido no confiable: documentos, paginas web, correos y salidas de herramientas leidas por un agente.
- Multilingue: entrenado y evaluado en varios idiomas, con enfasis declarado en ingles y otras lenguas.
- Salida unica de score: una probabilidad entre 0 y 1, mas un margen, apta para umbrales ajustables.
- Integracion ligera: exportacion ONNX con onnxruntime, compatible con text-embeddings-inference y endpoints.

## Casos de uso

- Guardrail de entrada en agentes de codigo: interceptar salidas de herramientas, resultados MCP y contenido de repositorios antes de que el agente actue sobre ellos, aplicando el umbral 0,9017 para decidir si se bloquea o se escala a revision humana.
- Proteccion de pipelines RAG: puntuar cada fragmento recuperado de documentos o web antes de insertarlo en el contexto del LLM, evitando que un documento envenenado redirija al modelo.
- Filtrado de correos y mensajes entrantes: clasificar el cuerpo de correos procesados por asistentes automatizados para detectar instrucciones ocultas dirigidas al agente.
- Defensa en profundidad en aplicaciones LLM: combinar el clasificador con listas de permitidos, permisos minimos y confirmacion humana en acciones sensibles, usando el score como una capa adicional.
- Monitorizacion y auditoria: registrar la probabilidad de inyeccion de cada entrada en produccion para detectar patrones de ataque y ajustar umbrales sobre datos propios.
- Despliegue en CPU de bajo coste: al tener 140M parametros y exportacion ONNX, puede ejecutarse en el mismo host del agente sin GPU dedicada, sirviendo como pre-filtro de alta disponibilidad.
- Evaluacion de robustez de agentes: usar el modelo como juez auxiliar en pruebas de red teaming para medir cuantas entradas maliciosas superan las defensas de un sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 140,6M parametros en fp32 los pesos ocupan aproximadamente 560 MB, y en fp16 alrededor de 280 MB, mas overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta disenado para ejecutarse en CPU mediante ONNX Runtime (CPUExecutionProvider), por lo que no requiere GPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de memoria libre, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: ONNX Runtime, transformers (PyTorch), text-embeddings-inference y endpoints compatibles; el autor proporciona codigo de ejemplo para onnxruntime con tokenizers y huggingface_hub.
- Latencia y throughput: no disponibles en la informacion proporcionada; el grafo ONNX procesa un texto por llamada (shape [1, sequence]) y trunca a 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Galvanize 3.1 (usezn) | 140,6M | 512 tokens | Deteccion de prompt injection | Apache-2.0 | Hugging Face, ONNX, API zn |
| Galvanize 3 (usezn) | no disponible | 512 tokens | Deteccion de prompt injection | Apache-2.0 | Hugging Face (predecesor, umbral 0,9802) |
| Horizon-Labs/prompt-injection-guard-small | no disponible | no disponible | Deteccion de prompt injection | Apache-2.0 | Hugging Face (modelo base del linaje) |
| jhu-clsp/mmBERT-small | no disponible | no disponible | Encoder multilingue base | MIT | Hugging Face (modelo base del linaje) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de moderacion de contenido: una peticion danina sin intento de sobrescritura de instrucciones queda fuera de su alcance.
- No debe ser el unico control frente a acciones irreversibles (enviar correo, mover dinero, ejecutar codigo); un clasificador puede ser evadido.
- El modelo puntua el texto de forma aislada y no juzga si una instruccion es legitima en su contexto.
- Idiomas y dominios no incluidos en la evaluacion no estan probados.
- El umbral de servicio es 0,9017; usar el pipeline de Hugging Face con umbral 0,5 marca muchos mas textos como inyeccion, por lo que conviene medir sobre datos propios antes de elegir umbral.
- El pipeline estandar no normaliza el espaciado y requiere truncation=True para entradas de mas de 512 tokens; el protocolo correcto implica colapsar blancos y truncar a 512.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y falsos negativos en la clasificacion; no se aportan tasas de error en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre robustez frente a ataques adaptativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/usezn/Galvanize-3.1
- Modelo base: https://huggingface.co/usezn/Galvanize-3
- Predecesores: https://huggingface.co/usezn/Galvanize-2 y https://huggingface.co/usezn/Galvanize-60M
- Modelo del linaje: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Modelo del linaje: https://huggingface.co/jhu-clsp/mmBERT-small
- Anuncio: https://usezn.com/blog/galvanize-3-1/
- API zn: https://usezn.com/docs/
- Repositorio zn-gate: https://github.com/usezn/zn
