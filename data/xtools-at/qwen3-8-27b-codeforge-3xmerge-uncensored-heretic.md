# xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic es un modelo de lenguaje multimodal de 27.356.728.560 parametros (~27,4 mil millones) publicado por el usuario xtools-at en Hugging Face. Se trata de una version "descensurada" (abliterated/decensored) del modelo xtools-at/Qwen3.8-27B-CodeForge-3xMerge, generada con la herramienta Heretic v2.1.0.dev0. El modelo base es a su vez un merge ponderado de tres fine-tunes independientes sobre la arquitectura Qwen3.8-27B: Coder390 EfficientThink (nerkyor), Fable Distill (TeichAI) y Qwopus Coder Flash (Jackrong).

El objetivo del modelo es combinar capacidades de generacion de codigo, razonamiento estructurado y conversacion destilada en un unico checkpoint versatil, eliminando ademas los comportamientos de rechazo (refusals) mediante una tecnica de ablacion de rango arbitrario (ARA). Segun la model card, la tasa de rechazo baja de 95/100 en el modelo original a 11/100 en esta version, con una divergencia KL de 0,0128 respecto al original.

La relevancia actual del modelo radica en su enfoque reproducible: el autor publica los parametros exactos de la ablacion y un directorio `reproduce` con instrucciones para replicar el proceso. Esta pensado para desarrolladores e investigadores que necesitan un modelo de codigo y razonamiento sin las restricciones de rechazo tipicas de los modelos alineados, manteniendo la licencia permisiva Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, pipeline image-text-to-text) |
| Parametros totales | 27.356.728.560 (~27,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existen cuantizaciones/GGUF publicadas por terceros (enlazadas desde la model card) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16 tras el merge del adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.8 con 27,4 mil millones de parametros, etiquetado en Hugging Face con el pipeline `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen-texto. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset del modelo base.

El checkpoint se construye en dos fases. Primero, un merge ponderado de tres fine-tunes de Qwen3.8-27B con coeficientes 1,00 (nerkyor/Qwen3.8-27B-Coder390-EfficientThink), 0,85 (TeichAI/Qwen3.8-27B-Fable-Distill) y 0,70 (Jackrong/Qwopus3.8-27B-Coder-Flash). El contribuyente principal incorpora SFT y RLOO (Reinforcement Learning from Offline/Online-style comparisons), con trayectorias docentes de modelos como Opus 5.5, GPT-6 Astra, DeepSeek V4 Pro y K3, ademas de componentes de decodificacion especulativa MTP y DFlash2. El objetivo EfficientThink reduce bucles de razonamiento improductivos sin eliminar el razonamiento profundo cuando es necesario. El segundo contribuyente aporta destilacion conversacional y de conocimiento a partir de datasets Fable 5.

Segundo, sobre ese merge se aplica una ablacion de rango arbitrario (ARA) con Heretic v2.1.0.dev0: se cargan los pesos en cuantizacion BNB 4-bit, se entrena un adaptador LoRA de 16 bits con los parametros indicados (start_layer_index 32, end_layer_index 63, preserve_good_behavior_weight 0,9540, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 0,2984, neighbor_count 11) y se fusiona de vuelta en el modelo BF16. El proceso es reproducible segun el autor.

## Capacidades

- Generacion de texto y codigo: especializado en code-generation gracias a los contribuyentes Coder390 y Qwopus Coder Flash.
- Razonamiento estructurado y "efficient thinking": reduce cadenas de pensamiento improductivas manteniendo capacidad de razonamiento profundo.
- Capacidades agenticas y tool-use: etiquetado explicitamente como `agentic` y `tool-use`.
- Instrucciones multi-turno y seguimiento de instrucciones (`instruction-following`).
- Capacidades conversacionales y de conocimiento general destiladas (Fable Distill).
- Entrada multimodal imagen-texto segun el pipeline declarado (`image-text-to-text`).
- Multilingue limitado a ingles y chino.
- Comportamiento descensurado: baja tasa de rechazo (11/100 frente a 95/100 del original).
- Soporte de decodificacion especulativa heredada del contribuyente principal (MTP, DFlash2).

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para autocompletar, refactorizar y revisar codigo, apoyandose en su especializacion en code-generation y en el soporte de tool calling para invocar linters o ejecutores de tests.
- Asistentes de programacion agenticos: con etiquetas `agentic` y `tool-use`, puede orquestar llamadas a herramientas (ejecucion de comandos, busquedas, APIs) en flujos multi-paso para tareas de ingenieria de software.
- Razonamiento tecnico con presupuesto controlado: el objetivo EfficientThink lo hace adecuado para escenarios donde se requiere razonamiento profundo sin cadenas de pensamiento excesivamente largas, por ejemplo en atencion a desarrolladores con latencia acotada.
- Analisis de capturas y diagramas tecnicos: al declarar pipeline image-text-to-text, puede procesar imagenes junto a texto, por ejemplo para interpretar diagramas de arquitectura o capturas de errores y proponer correcciones.
- Generacion de contenido sin restricciones de rechazo: util para investigacion sobre alineacion, red-teaming y estudios de robustez, donde se necesita un modelo que no decline peticiones por defecto.
- Experimentacion reproducible en ablacion de modelos: los parametros ARA publicados y el directorio `reproduce` permiten a investigadores replicar y estudiar el proceso de descensurado sobre un modelo de 27B.
- Traduccion y asistencia bilingue ingles-chino: dentro de los dos idiomas soportados, puede emplearse para documentacion tecnica y conversacion.

## Benchmarks y rendimiento

La model card unicamente publica metricas del proceso de descensurado, no benchmarks de capacidad estandar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (Qwen3.8-27B-CodeForge-3xMerge) |
|---|---|---|
| Rechazos (Refusals) | 11/100 | 95/100 |
| Divergencia KL | 0,0128 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, LiveCodeBench, GPQA) en la informacion disponible. El nombre "Coder390" del contribuyente principal alude a objetivos de rendimiento en GPQA, MMLU y LiveCodeBench, pero no se proporcionan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54,7 GB solo para pesos (27,36B x 2 bytes), mas overhead de activaciones y KV cache; se recomienda un minimo de 64-80 GB.
- VRAM estimada en cuantizacion 8-bit: en torno a 27-30 GB; en 4-bit: en torno a 14-16 GB (estimaciones teoricas, no confirmadas en la informacion disponible).
- GPU recomendadas: A100 80GB, H100 80GB o multiples GPU para BF16; una RTX 4090 (24 GB) no es suficiente en BF16 pero podria alojar cuantizaciones 4-bit.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) unicamente con cuantizacion agresiva (4-bit), segun estimacion; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada); la model card enlaza cuantizaciones/GGUF de terceros, lo que habilita llama.cpp y potencialmente Ollama; vLLM y TGI no se mencionan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (CodeForge-3xMerge-UNCENSORED-heretic) | ~27,4B | no disponible | Apache 2.0 | Merge de 3 fine-tunes + ablacion ARA; en/zh; multimodal |
| xtools-at/Qwen3.8-27B-CodeForge-3xMerge (original) | ~27,4B | no disponible | Apache 2.0 | Mismo merge sin descensurar; 95/100 rechazos |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink | ~27,4B (base Qwen3.8-27B) | no disponible | no disponible | Contribuyente principal; SFT + RLOO; MTP/DFlash2 |
| TeichAI/Qwen3.8-27B-Fable-Distill | ~27,4B (base Qwen3.8-27B) | no disponible | no disponible | Destilacion conversacional Fable 5 |
| Jackrong/Qwopus3.8-27B-Coder-Flash | ~27,4B (base Qwen3.8-27B) | no disponible | no disponible | Contribuyente de codigo y capacidades agenticas |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de descensurado (abliterated) elimina los rechazos, lo que implica que el modelo puede generar contenido danino, ofensivo o inseguro sin filtros; no es adecuado para despliegues orientados al publico sin moderacion externa.
- La divergencia KL de 0,0128 respecto al original indica cambios en la distribucion de salida; pueden aparecer degradaciones sutiles en capacidades no evaluadas.
- Riesgo de alucinacion inherente a los modelos de 27B; no hay benchmarks publicados que cuantifiquen su fiabilidad.
- Soporte limitado a ingles y chino; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada en la informacion disponible; no se puede asumir una ventana larga.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo descensurado conlleva riesgos legales y reputacionales segun la jurisdiccion y el caso de uso.
- El modelo depende de componentes de terceros (Heretic, contribuyentes) cuya trazabilidad y licencias individuales no se detallan completamente.
- El pipeline `image-text-to-text` sugiere multimodalidad, pero no se documentan detalles sobre el encoder visual ni su calidad.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Modelo base del merge: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Contribuyente 1 (Coder390 EfficientThink): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Contribuyente 2 (Fable Distill): https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Contribuyente 3 (Qwopus Coder Flash): https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Dataset Claude/Fable coding traces: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset Fable-5-Chat: https://huggingface.co/datasets/armand0e/Fable-5-Chat
- Heretic (herramienta de descensurado): https://heretic-project.org
- Cuantizaciones/GGUF del modelo base: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Perfil del autor: https://huggingface.co/xtools-at
