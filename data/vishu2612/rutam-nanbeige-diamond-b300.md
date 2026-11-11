# Vishu2612/rutam-nanbeige-diamond-b300

## Resumen

Rutam 33B es un adaptador PEFT (LoRA) publicado por el usuario Vishu2612 sobre el modelo base `Nanbeige/Nanbeige4.3-33B-Base`. Está especializado en ciberseguridad defensiva (white-hat): razonamiento sobre vulnerabilidades y generación de remediaciones, con un formato de traza canónico denominado "Sandhana" que estructura el proceso de razonamiento en fases etiquetadas (`<ASAYA>`, `<SANKALPA>`, `<YUKTI>`/`<PRATIKRIYA>`, `<CANDIDATE_READY>`, `<PRAMANA>`, `<PARISKARA>`, `<SIDDHI>`).

Según la model card, el entrenamiento combinó SFT sobre un dataset de 75.000 trazas ("Diamond 75k"), alineamiento DPO y RFT/GRPO, ejecutado sobre hardware NVIDIA B300. El objetivo declarado es producir un agente de remediación que valide sus propias propuestas mediante una fase `<PRAMANA>` con resultado determinista PASSED/FAILED/INCONCLUSIVE, y que rechace explícitamente exploits activos, shellcode, reverse shells y payloads RCE.

Es relevante como ejemplo de especialización mediante LoRA sobre un base de 33B con un protocolo de razonamiento verificable embebido en el propio formato de salida, aunque la información pública disponible es muy limitada: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Nanbeige4.3-33B-Base) + adaptador LoRA (PEFT) |
| Parametros totales | 33B en el modelo base; número de parámetros del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador PEFT sobre `Nanbeige/Nanbeige4.3-33B-Base`, un transformer decoder-only de 33.000 millones de parámetros. No se documenta en la model card la arquitectura interna del base (tipo de atención, positional encoding, etc.), por lo que esos detalles deben consultarse en la ficha del modelo original. El repositorio ocupa 11,3 GB, coherente con pesos de adaptador en precisión alta más posibles artefactos de entrenamiento.

El entrenamiento descrito combina tres etapas: SFT sobre el dataset "Diamond 75k" de trazas de razonamiento Sandhana canónicas, alineamiento DPO y refuerzo con RFT/GRPO, ejecutado en GPUs NVIDIA B300. La innovación técnica principal no es arquitectónica sino de formato: el modelo aprende a emitir una traza estructurada en fases (análisis, intención, estrategia, iteración de acciones, candidato listo, verificación, refinamiento y cierre) con una fase de validación `<PRAMANA>` que debe producir un veredicto determinista PASSED/FAILED/INCONCLUSIVE. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros de DPO/GRPO.

## Capacidades

- Razonamiento de ciberseguridad defensiva: análisis de vulnerabilidades y propuesta de remediaciones dentro del marco white-hat declarado.
- Generación de trazas de razonamiento estructurado con etiquetas Sandhana (`<ASAYA>`, `<SANKALPA>`, `<YUKTI>`, `<PRATIKRIYA>`, `<CANDIDATE_READY>`, `<PRAMANA>`, `<PARISKARA>`, `<SIDDHI>`).
- Autoverificación: emisión de un veredicto determinista PASSED/FAILED/INCONCLUSIVE en la fase `<PRAMANA>`.
- Guardrails declarados: rechazo de exploits activos, shellcode, reverse shells y payloads RCE.
- Capacidades heredadas del base (generación de texto general, posible código y matemáticas) sin confirmación específica en la model card.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes multi-paso: parcial, vía el bucle `<YUKTI>`/`<PRATIKRIYA>` del formato de traza.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Triaje de vulnerabilidades en pipelines de seguridad: el modelo puede recibir la descripción de un CVE o un hallazgo de escáner y producir una traza Sandhana con análisis, estrategia de remediación y veredicto de validación, lo que facilita la revisión humana del razonamiento paso a paso.
- Generación de parches y recomendaciones de configuración: dentro del flujo `<CANDIDATE_READY>` → `<PRAMANA>` → `<PARISKARA>`, el modelo propone una remediación, la somete a validación y la refina si falla, encajando en revisiones de código de seguridad antes de fusionar cambios.
- Asistente de operaciones de seguridad (SOC): apoyo a analistas en la priorización de alertas y en la redacción de informes estructurados, aprovechando el formato de traza para auditar la cadena de razonamiento.
- Formación y concienciación: generación de explicaciones didácticas de clases de vulnerabilidad y de sus mitigaciones, siempre en el marco defensivo declarado y sin payloads ofensivos.
- Automatización de checklists de hardening: el modelo puede verificar sistemáticamente configuraciones frente a políticas internas y emitir resultados PASSED/FAILED/INCONCLUSIVE por ítem.
- Integración en pipelines CI/CD de seguridad: como paso de revisión asistida que analiza diffs y propone remediaciones, con la fase `<PRAMANA>` actuando como gate de validación antes de escalar a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 33B parámetros; en FP16 requiere aproximadamente 66 GB solo para pesos, más KV cache y overhead. El adaptador LoRA añade una sobrecarga pequeña (el repo ocupa 11,3 GB, aunque el tamaño efectivo de los pesos del adaptador puede ser menor).
- Cuantización: en 8 bits se estiman unos 35-40 GB; en 4 bits (si se generan GGUF/AWQ/GPTQ a partir del base fusionado) alrededor de 18-22 GB. Estas cifras son estimaciones de VRAM para el base, no datos publicados.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPUs de 48 GB para FP16; una RTX 4090 (24 GB) solo sería viable con cuantización agresiva del base fusionado.
- Cabe en GPU consumer: únicamente con cuantización de 4 bits del modelo base fusionado con el adaptador; no se publican artefactos GGUF en el repo.
- Opciones de despliegue: vLLM o TGI para FP16/BF16 en servidor; llama.cpp/Ollama solo si se generan y publican GGUF del base fusionado; PEFT requiere cargar primero el base y aplicar el adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rutam 33B (este) | 33B (base) + LoRA | no disponible | Ciberseguridad defensiva, trazas Sandhana | Apache 2.0 | Adaptador PEFT en HF |
| Nanbeige4.3-33B-Base | 33B | no disponible en esta ficha | Modelo generalista | no disponible en esta ficha | Pesos completos en HF |
| Alternativas de ciberseguridad de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos directamente comparables en el nicho de agentes de remediación de ciberseguridad con formato de razonamiento verificado.

## Limitaciones y advertencias

- Información pública muy escasa: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y sin benchmarks; la fiabilidad práctica no está validada por terceros.
- Riesgo de alucinación: como modelo generativo de 33B, puede inventar CVE, referencias, parches o resultados de validación; la fase `<PRAMANA>` no garantiza corrección real, solo un formato de veredicto.
- Guardrails declarados pero no auditados: la prohibición de exploits, shellcode y payloads RCE depende del comportamiento aprendido, no de un filtro externo verificado; debe desplegarse con moderación adicional en producción.
- Sesgos: no documentados; al no especificarse idiomas ni composición del dataset, no se puede evaluar cobertura lingüística ni sesgos de dominio.
- Contexto e idiomas: no confirmados; no asumir una ventana larga ni soporte multilingüe sin probarlo.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial depende también de la licencia del modelo base `Nanbeige/Nanbeige4.3-33B-Base`, que debe verificarse por separado.
- Requiere fusionar o cargar el base de 33B: el despliegue es costoso (~66 GB en FP16) y no hay cuantizaciones publicadas en el repo.
- Fecha de creación futura (2026-11-11) y metadatos incompletos: tratar la model card como declarativa y no como evidencia verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishu2612/rutam-nanbeige-diamond-b300
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Paper, blog, repositorio o demo adicionales: no disponible
