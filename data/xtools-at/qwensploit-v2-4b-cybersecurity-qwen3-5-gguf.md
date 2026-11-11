# xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit V2 4B es un ajuste fino (fine-tune) especializado en ciberseguridad y red team construido sobre la base `xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic`, a su vez derivada de la familia Qwen 3.5. Lo desarrolla el usuario xtools-at y esta pensado como asistente tecnico para profesionales de seguridad ofensiva y defensiva: pentesters, operadores de red team, investigadores de vulnerabilidades y participantes en CTF. Esta ficha corresponde concretamente a la version cuantizada en formato GGUF del modelo original, publicada como artefacto estatico para inferencia local.

El modelo resuelve el problema de disponer de un asistente de ciberseguridad compacto (4.326 millones de parametros) que quepa en hardware modesto y mantenga un razonamiento estructurado sobre problemas de seguridad. La version V2 incide en la calidad del dataset de entrenamiento frente a la cantidad: el autor indica que cada fuente fue dividida, inspeccionada y filtrada manualmente, y que se evito incluir grandes colecciones de CVE en bruto porque se consideran mas adecuadas para RAG que para ensenar razonamiento.

La relevancia actual radica en su enfoque de dominio (ciberseguridad ofensiva y defensiva), su tamano contenido y su publicacion en GGUF, lo que permite ejecucion en GPU de consumo y en CPU. La model card declara un pipeline `image-text-to-text`, si bien no se detallan capacidades de vision en el texto proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5); no se detalla variante exacta |
| Parametros totales | 4.326.350.848 (4,33 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estatico (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | other (licencia personalizada, condiciones no detalladas) |
| Formato de pesos | GGUF (repo de 11,6 GB); el modelo base se distribuye en safetensors |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Modelo base | xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5 |
| Tamano del repositorio | 11,6 GB |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen 3.5 de 4B fusionada con otros checkpoints (el nombre de la base incluye "Claude-3xMerge-Jackrong-UNCENSORED-heretic"), lo que sugiere una fusion de modelos previa al ajuste fino. Sobre esa base se aplico un fine-tune con tecnicas de LoRA/PEFT y la herramienta Unsloth, segun las etiquetas del repositorio (`lora`, `peft`, `unsloth`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

El entrenamiento combina conocimiento de dominio de ciberseguridad con datos de razonamiento general. Las fuentes declaradas incluyen `PentesterFlow/OffsecCyber` (subconjuntos Elite V2 y HackerOne, con conocimiento de seguridad web ofensiva y bug bounty), `ChaoticNeutrals/Cybersecurity-ShareGPT`, `Voidreaper2026/cybersec-master-dataset`, `Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset`, `saidutta69/CyberSec-Reasoning-Premium`, `saidutta69/qwen3.8-max-distillation-50k-clean` y `xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x`. La innovacion declarada por el autor es metodologica: filtrado manual y curado de cada fuente, priorizando instrucciones utiles, explicaciones tecnicas y razonamiento de seguridad sobre volumen bruto de datos. El tag `mtp` (multi-token prediction) aparece en el repositorio pero no se detalla su implementacion.

## Capacidades

- Generacion de texto y razonamiento estructurado orientado a problemas de seguridad.
- Conocimiento de seguridad ofensiva: pentesting web, analisis de vulnerabilidades, ejercicios de red team y bug bounty.
- Seguridad defensiva: analisis de amenazas, respuesta a incidentes y triaje.
- Codigo seguro: revision, depuracion y escritura de codigo con foco en seguridad.
- Razonamiento multi-paso y modo de razonamiento (etiquetas `reasoning` e `instruction-tuning`).
- Soporte declarado para CTF y educacion en seguridad.
- Capacidad multimodal declarada por el pipeline `image-text-to-text` (no se detalla alcance en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente autonomo: el autor indica explicitamente que no esta disenado como agente autonomo de pentesting.
- Multilingue: solo ingles declarado.

## Casos de uso

- Pentesting web autorizado: el modelo puede asistir en la revision de aplicaciones web, sugiriendo vectores de ataque y explicando hallazgos a partir de descripciones de endpoints y configuraciones, gracias a su entrenamiento en subconjuntos ofensivos como OffsecCyber y HackerOne.
- Triaje de vulnerabilidades: analisis y priorizacion de hallazgos de escaneo, con explicaciones tecnicas del impacto y posibles mitigaciones, adecuado por su enfasis en razonamiento de seguridad.
- Revision de codigo seguro en CI/CD: integracion como paso de revision para detectar patrones inseguros y proponer correcciones, aprovechando su capacidad de code review y debugging.
- Soporte en ejercicios de red team: generacion de hipotesis de ataque, tecnicas de enumeracion y explicaciones de tecnicas MITRE ATT&CK durante engagements autorizados.
- Formacion y CTF: asistencia a estudiantes en la resolucion de retos, explicando el razonamiento paso a paso en lugar de dar solo la respuesta.
- Respuesta a incidentes: ayuda en la interpretacion de artefactos, logs y tecnicas de adversario para equipos defensivos (blue team).
- Despliegue local en hardware modesto: al distribuirse en GGUF y con 4,33 mil millones de parametros, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta, util para entornos air-gapped.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; con 4,33 mil millones de parametros, las cuantizaciones GGUF de 4 bits suelen requerir del orden de 3-4 GB de VRAM, aunque el autor no publica cifras concretas.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, el modelo es apto para GPU de consumo (series RTX 30/40) y para ejecucion en CPU.
- Cabe en GPU de consumo: previsiblemente si, al tratarse de un modelo de 4B en GGUF, aunque no se confirma con datos del autor.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el repositorio declara compatibilidad con `transformers` y `text-generation-inference`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 4B (este) | 4,33B | no disponible | Ciberseguridad / red team | other | GGUF y safetensors en HF |
| Qwensploit V2 9B | no disponible | no disponible | Ciberseguridad / red team | other | HF (variante del mismo autor) |
| Qwensploit V2 2B | no disponible | no disponible | Ciberseguridad / red team | other | HF (variante del mismo autor) |
| Qwensploit V2 0.8B | no disponible | no disponible | Ciberseguridad / red team | other | HF (variante del mismo autor) |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de contexto para comparar con modelos de ciberseguridad de otros autores.

## Limitaciones y advertencias

- Licencia "other": las condiciones exactas no estan detalladas en la informacion disponible; es imprescindible revisar los terminos antes de cualquier uso comercial.
- Solo soporta ingles; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en detalles de CVE, versiones de software y comandos concretos.
- El autor advierte que no es un agente autonomo de pentesting: los comandos y recomendaciones generados deben revisarse antes de usarse en entornos reales.
- Uso etico y legal: el modelo esta orientado a pruebas autorizadas; su uso en sistemas sin permiso puede ser ilegal.
- La base incluye checkpoints "UNCENSORED" y "heretic", lo que reduce los filtros de seguridad y aumenta el riesgo de contenido ofensivo o inapropiado.
- No se publican datos de contexto, benchmarks ni composicion exacta del dataset, lo que dificulta la evaluacion objetiva.
- Ausencia de descargas y likes en el momento de la consulta: modelo muy reciente y sin validacion de la comunidad.
- Las cuantizaciones GGUF pueden degradar la calidad respecto al modelo original en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF
- Modelo base original: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Base del fine-tune: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Coleccion Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Perfil del autor: https://huggingface.co/xtools-at
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
