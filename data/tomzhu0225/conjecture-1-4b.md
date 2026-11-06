# tomzhu0225/Conjecture-1-4B

## Resumen

Conjecture 1 es un adaptador LoRA de investigación experimental publicado por el autor tomzhu0225 bajo el nombre de proyecto Simjecture. No es un modelo autónomo: se trata de un adaptador PEFT que especializa el modelo base `internlm/Intern-Decision-4B`, fijado al commit `38c9dafbbef52dd04bae943c0c6ac918419adfd5`, y requiere descargar los pesos base por separado. Su función es proponer, dentro de flujos científicos automatizados, si conviene seguir observando, solicitar asistencia o escalar a un juez de reparación independiente.

El adaptador se entrenó con supervisión sobre un conjunto de 1.024 casos científicos redactados manualmente, mejorando la concordancia del 54,0% al 97,46% en ese test concreto. Sin embargo, la comparación sobre 64 flujos de trabajo completos no establece una ventaja global frente al modelo base, y el propio autor reporta regresiones en decisiones generales y fallos de completitud. Por tanto, debe tratarse como un checkpoint reproducible de investigación con utilidad de despliegue aún en estudio, no como un componente listo para producción.

La relevancia actual es metodológica: documenta de forma explícita identidades de pesos (SHA-256 del adaptador y de su configuración), protocolos de entrada y salida, y resultados negativos, algo poco habitual en adaptadores de este tamaño. El alcance declarado se limita a flujos de control unidimensional asíncrono con WarpX y a tareas de diagnóstico y reporte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base `internlm/Intern-Decision-4B`); atención científica y decodificador independiente por campo |
| Parametros totales | 32.464.896 parámetros entrenables en el adaptador (los del modelo base no se detallan) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada completa en el servidor de referencia |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye aparte |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Intern-Decision-4B con rango LoRA 16 y alpha 32, lo que da 32.464.896 parámetros entrenables. La interfaz evaluada es el borrador «Simjecture scientific-attention 0.2»: la entrada es una conversación enmascarada que solo contiene estado público y preguntas de decisión, y la salida se compone de cinco campos puntuados (`route`, `question_ref`, `basis`, `evidence_primary`, `evidence_secondary`) mediante un decodificador independiente por campo con temperatura 1 y un único pase forward en la posición enmascarada. Los alias de evidencia y de pregunta los vincula el host a identidades canónicas; el modelo no genera identificadores arbitrarios.

El entrenamiento consta de dos etapas. La mezcla supervisada inicial contiene 4.096 ejemplos científicos redactados, 400 ejemplos procedimentales y 1.024 ejemplos de decisión general. La ejecución seleccionada hizo 512 pasos de optimizador con acumulación 4 y tasa de aprendizaje 5e-5, procesando 2.048 ejemplos (no una pasada completa). Después se aplicaron ocho actualizaciones de SFT continuado con tasa 1e-5 y acumulación 4; en total, 2.080 presentaciones de ejemplo, sin que ello implique haber recorrido las 5.520 filas de la mezcla. Los inputs de entrenamiento oscilaron entre 339 y 1.459 tokens, mientras que la evaluación en estado vivo usó entradas de 3.200 a 4.964 tokens. Una auditoría verificó que no hay inputs visibles idénticos ni identificadores compartidos entre entrenamiento, desarrollo y test, aunque los mecanismos construidos se comparten entre particiones, por lo que no se trata de generalización con tareas disjuntas.

## Capacidades

- Propuesta de enrutamiento de atención científica: decidir entre observar, volver a comprobar, pedir ayuda o escalar a revisión.
- Emisión estructurada de cinco campos puntuados con referencias de evidencia y de pregunta.
- Rutas que combinan atención con búsqueda de conocimiento o revisión de literatura, siempre que el host aporte la pregunta correspondiente.
- Soporte de modo de decisión sobre estado público enmascarado, sin acceso a objetivos de entrenamiento ni a etiquetas ocultas.
- Capacidad de operar en flujos asíncronos con sondeo periódico (cada cinco segundos en el protocolo probado).
- No ejecuta herramientas, no concede autoridad de reparación, no aprueba ciencia y no sustituye al trabajador científico principal.
- Capacidades multilingües: limitadas al inglés según la model card.
- Sin soporte declarado de visión, audio, tool calling general ni agentes multi-paso fuera del protocolo Simjecture.

## Casos de uso

- Supervisión de flujos de simulación con WarpX: el adaptador propone si el estado visible de un control unidimensional asíncrono justifica seguir observando o solicitar asistencia, aprovechando su entrenamiento específico en ese dominio acotado.
- Enrutamiento de escalado a revisión humana: en pipelines donde un trabajador principal queda en pausa, el modelo emite una propuesta de ruta que el host puede convertir o no en alerta admitida, con registro separado del despacho real.
- Detección de necesidad de experto: en siete estados donde dos revisores en vivo coincidían en requerir experto, el SFT continuado propuso la ruta de experto en 5 de 7 casos, frente a 0 de 7 del modelo base.
- Investigación reproducible en adaptadores de decisión: sirve como checkpoint de referencia con hashes de pesos y configuración, comandos de entrenamiento y particiones auditadas para replicar experimentos SFT frente a RL.
- Evaluación de protocolos de atención científica: útil para estudiar interfaces de observación, frescura de evidencia y supresión de trabajo duplicado antes de integrar un modelo mayor.
- Filtro previo en sistemas de revisión por pares internos: el modelo puede señalar qué evidencias primaria y secundaria sustentan una propuesta, siempre que el host valide combinaciones y vigencia del estado.

## Benchmarks y rendimiento

| Medida | Modelo base preentrenado | SFT continuado |
|---|---:|---:|
| Test de contrato/enrutamiento científico redactado (1.024 casos) | 54,0% | 97,5% |
| Exactitud macro de decisión general en siete suites | 90,0133% | 88,3426% |
| Ruta aceptable para ambos revisores en vivo | 16/24 | 18/24 |
| Ruta de experto aceptada en siete estados donde ambos la exigen | 0/7 | 5/7 |
| Propuesta de experto en once estados unánimes de solo observar | 0/11 | 2/11 |

La evaluación general comprende 10.751 registros de entrada y 12.351 puntuaciones. La comparación sobre 64 flujos de trabajo completos no establece una ventaja global de flujo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el adaptador ocupa 0,1 GB en el repositorio, pero los requisitos dependen del modelo base Intern-Decision-4B, cuyos pesos deben descargarse aparte.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card referencia un servidor propio con pase forward en posición enmascarada y decodificador independiente por campo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El protocolo probado sondea cada cinco segundos, permite como máximo una solicitud automática de experto y mantiene un fallback de 90 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conjecture 1 (este adaptador) | 32,46 M entrenables (LoRA) | 8.192 tokens | Adaptador de atención científica sobre Intern-Decision-4B | Apache 2.0 | Hugging Face, 15 descargas |
| Intern-Decision-4B (base) | No disponible | No disponible | Modelo de decisión de InternLM | No disponible en la información | Hugging Face (referenciado como base) |
| Alternativas genéricas de decisión de 4B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con otros adaptadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere los pesos de Intern-Decision-4B por separado y no funciona de forma aislada.
- La comparación sobre 64 flujos de trabajo completos no demuestra ventaja global frente al modelo base.
- Regresión medida en decisión general: la exactitud macro baja de 90,0133% a 88,3426% tras el SFT continuado.
- Falsos positivos de escalado: en 2 de 11 estados unánimes de solo observar, el modelo propone experto.
- Las probabilidades de opción del modelo no están calibradas como probabilidades de fallo científico.
- El alcance validado se limita a control WarpX unidimensional asíncrono y a diagnóstico y reporte; no establece descubrimiento autónomo ni rendimiento entre disciplinas.
- Los tests de flujo de plasma no declaran preguntas de recuperación, por lo que no validan la utilidad de búsqueda o revisión de literatura.
- El protocolo probado no demuestra beneficio al sondear a un trabajador que razona activamente.
- El host debe validar combinaciones y evidencia, comprobar frescura y estado actual, respetar periodos de silencio, suprimir trabajo duplicado y registrar el despacho real; una propuesta no es una alerta admitida.
- Idioma limitado al inglés.
- Riesgo de alucinación en referencias de evidencia no evaluado de forma independiente en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de garantías de fiabilidad en producción desaconsejan su despliegue sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomzhu0225/Conjecture-1-4B
- Modelo base: https://huggingface.co/internlm/Intern-Decision-4B
- Reproducción e inferencia: REPRODUCTION.md (referenciado en la model card del repositorio)
- Evaluación estática: evaluation/static.json (referenciado en la model card)
- Resultados completos de flujos: evaluation/WORKFLOW_RESULTS.md (referenciado en la model card)
- Esquemas del protocolo: protocol/schemas/Observation.schema.json (referenciado en la model card)
