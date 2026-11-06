# techdj/attack-chain-simulator-mistral7b-lora-F16-GGUF

## Resumen

El repositorio `techdj/attack-chain-simulator-mistral7b-lora-F16-GGUF` contiene un adaptador LoRA en formato GGUF (precision F16) derivado de `sohomn/attack-chain-simulator-mistral7b-lora`, un fine-tune orientado a ciberseguridad y simulación de cadenas de ataque (attack chains) sobre un modelo base Mistral de 7.000 millones de parámetros. El adaptador ha sido convertido mediante el espacio `gguf-my-lora` de ggml.ai, lo que permite cargarlo directamente con `llama.cpp` (CLI o servidor) junto al modelo base en GGUF.

La especialización declarada por el autor se centra en el análisis de logs de seguridad, detección de técnicas MITRE ATT&CK, inteligencia de amenazas y reconstrucción de cadenas de ataque a partir de evidencias textuales o numéricas (por ejemplo, logs estilo CICIDS, eventos de PowerShell, movimiento lateral con PsExec o volcados de LSASS). Es, por tanto, una herramienta pensada para investigación en seguridad y laboratorios de simulación, no un modelo de propósito general.

La relevancia actual del artefacto es acotada: se trata de una conversión de formato de un adaptador ya existente, con licencia MIT, soporte exclusivo de inglés y un volumen de descargas muy bajo (57 en el momento de la consulta). El dato de parámetros reportado en safetensors (13.631.488) corresponde al propio adaptador LoRA, no al modelo base Mistral-7B, que es el que aporta la capacidad generativa real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only Mistral-7B |
| Parametros totales | 13.631.488 en el adaptador LoRA (el modelo base Mistral-7B aporta ~7.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Mistral-7B, no confirmada en la información) |
| Tipos de cuantizacion | F16 (única variante publicada en este repo) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador LoRA) |
| Modelo base | sohomn/attack-chain-simulator-mistral7b-lora |
| Pipeline | text-generation |
| Tamano del repo | ~0,0 GB |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo, sino un adaptador LoRA de bajo rango entrenado sobre Mistral-7B (probablemente mediante QLoRA, a juzgar por las etiquetas `lora` y `qlora`). La conversión a GGUF F16 la realiza el espacio `gguf-my-lora` de ggml.ai, que empaqueta las matrices de adaptación para que puedan inyectarse en el modelo base en tiempo de inferencia con `llama.cpp`. No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica del repositorio es exclusivamente operativa: permitir el uso del adaptador en el ecosistema `llama.cpp` sin necesidad de fusionarlo previamente con el modelo base, mediante los parámetros `--lora` de `llama-cli` y `llama-server`. La especialización funcional (simulación de cadenas de ataque MITRE ATT&CK) proviene del adaptador original de `sohomn`, no de este repositorio, que es una mera conversión de formato.

## Capacidades

- Generación de texto especializada en dominios de ciberseguridad: interpretación de logs, descripción de técnicas MITRE ATT&CK y reconstrucción de cadenas de ataque.
- Análisis de logs numéricos estilo CICIDS (el widget del autor incluye un ejemplo con valores separados por barras).
- Interpretación de eventos de seguridad textuales: PowerShell sospechoso, balizas (beacons) hacia IPs externas, spear phishing, ejecución de macros, volcado de LSASS, movimiento lateral con PsExec.
- Generación de narrativas de cadena de ataque (APT chain) a partir de evidencias parciales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; la tarea de "attack chain" implica encadenamiento lógico, pero no se documenta infraestructura de agentes.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Análisis de logs de red en laboratorio: el modelo puede recibir líneas de log estilo CICIDS y generar una interpretación del incidente, útil para triaje automatizado en entornos de investigación con datos sintéticos o anonimizados.
- Simulación de cadenas de ataque para formación: a partir de una secuencia de eventos (phishing, macro, LSASS dump, PsExec), el modelo reconstruye la narrativa completa de la intrusión, lo que sirve para ejercicios de blue team y tabletop exercises.
- Enriquecimiento de alertas SIEM en pipelines de detección: integrado vía `llama-server`, puede generar descripciones contextuales de alertas que ayuden a los analistas a priorizar, siempre con revisión humana.
- Mapeo a MITRE ATT&CK: dado un conjunto de evidencias, el modelo puede proponer técnicas ATT&CK asociadas, acelerando la clasificación manual en informes de threat intelligence.
- Generación de casos de prueba para detección: el modelo produce descripciones de ataques que pueden convertirse en reglas de detección o en escenarios de validación para herramientas como Sigma o Suricata.
- Investigación académica en NLP de seguridad: como adaptador ligero y de licencia MIT, es adecuado para experimentos reproducibles de fine-tuning y evaluación en tareas de ciberseguridad, cargándolo sobre Mistral-7B en GGUF con `llama.cpp`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en F16 ocupa del orden de decenas de megabytes (13,6 millones de parámetros en F16 ≈ 27 MB), por lo que el requisito dominante es el del modelo base Mistral-7B en GGUF.
- VRAM estimada para inferencia con el modelo base: aproximadamente 5-6 GB en cuantización Q4_K_M, 7-8 GB en Q5_K_M y 14-15 GB en F16 (estimaciones estándar para Mistral-7B, no facilitadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para uso local; A100 o H100 para servir múltiples instancias o contextos largos.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4/Q5 del modelo base en tarjetas de 8-12 GB.
- Opciones de despliegue: `llama.cpp` (`llama-cli` y `llama-server` con `--lora`), y cualquier frontend compatible con GGUF que soporte LoRA (por ejemplo, Ollama solo si se fusiona previamente el adaptador; no confirmado en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| techdj/attack-chain-simulator-mistral7b-lora-F16-GGUF | ~7B (base) + 13,6M (LoRA) | no disponible | Ciberseguridad / attack chains | MIT | GGUF LoRA |
| sohomn/attack-chain-simulator-mistral7b-lora | ~7B (base) + LoRA | no disponible | Ciberseguridad / attack chains | no disponible en la información | safetensors (adaptador) |
| Mistral-7B-Instruct (modelo base genérico) | ~7B | 32k (según versión) | Propósito general | Apache 2.0 | safetensors, GGUF |
| Modelos de seguridad tipo SecLLM (por ejemplo, variantes de Llama fine-tuneadas para CTI) | ~7-13B | variable | Threat intelligence | variable | variable |

La comparación directa con alternativas especializadas no puede completarse con datos verificables a partir de la información proporcionada; los datos del modelo base Mistral-7B-Instruct se incluyen como referencia de la familia, no como benchmark del adaptador.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Mistral-7B (o el base indicado) en GGUF y aplicar el adaptador con `--lora`; no funciona por sí solo.
- Solo inglés declarado; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo elevado de alucinación en dominios técnicos: la generación de cadenas de ataque o mapeos ATT&CK puede producir técnicas o relaciones plausibles pero incorrectas; requiere validación por analistas.
- Sesgos de dominio: el fine-tune está sesgado hacia los formatos de log y escenarios presentes en su dataset de entrenamiento (CICIDS, PowerShell, PsExec), lo que puede degradar su comportamiento ante otras fuentes.
- Uso dual: la capacidad de describir cadenas de ataque puede emplearse con fines ofensivos; el autor no documenta salvaguardas ni filtros de contenido.
- Licencia MIT: permite uso comercial y modificación, pero no exime de las obligaciones de atribución ni de las responsabilidades legales del despliegue en entornos reales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, por lo que no debería adoptarse en producción sin una evaluación propia.
- Repositorio con muy baja adopción (57 descargas, 0 likes) y sin mantenimiento documentado; la fecha de creación indicada (2026-10-25) es inconsistente con el estado actual y conviene verificarla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/techdj/attack-chain-simulator-mistral7b-lora-F16-GGUF
- Adaptador original: https://huggingface.co/sohomn/attack-chain-simulator-mistral7b-lora
- Espacio de conversión GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentación del servidor llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
