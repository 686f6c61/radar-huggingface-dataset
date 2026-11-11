# VixeroAI/Lamba-0.4

## Resumen

Lamba 0.4 es un modelo de lenguaje de 27.781 millones de parametros desarrollado por Vixero Labs, especializado en razonamiento y conversacion en ingles y bahasa malasia (malayo). Se distribuye como un fine-tune del modelo base nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2, a su vez derivado de la familia Qwen3. El modelo se presenta como una iteracion mas calida, menos sobre-formateada y con conocimiento especifico del contexto malasio respecto a su base, manteniendo una identidad propia (se identifica como "Lamba") y un uso disciplinado de herramientas.

La propuesta de valor se centra en tres ejes: capacidades de tool calling y function calling afinadas para invocar busquedas cuando corresponde y evitarlas cuando no, un tono conversacional mas natural evaluado mediante jueces ciegos, y un rendimiento solido en tareas de conocimiento local malasio (preguntas sobre capitales y estados, MalayMMLU generativo). Segun la model card, supera a Lamba 0.3 en 7 de 13 pruebas internas, empata en 4 y queda por detras en 2.

Es relevante ahora porque cubre un nicho poco atendido: modelos de razonamiento de tamano medio (27B) con soporte nativo de malayo y contexto malasio, empaquetados con pesos en fp8 y compatibilidad con vLLM. La licencia Apache 2.0 facilita su adopcion comercial, aunque las cifras de rendimiento proceden exclusivamente del arnes de evaluacion del propio autor y no han sido reproducidas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en fp8 (tag `fp8`); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles), ms (bahasa malasia) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune sobre un checkpoint derivado de Qwen3 de 27,78B parametros. La nomenclatura del modelo base (que encadena terminos como "Coder390", "EfficientThink", "SFT", "RLOO", "MTP" y "DFlash2") sugiere que la cadena de entrenamiento previa incluyo supervised fine-tuning, optimizacion con RLOO (una variante de RL sin critico) y posiblemente multi-token prediction, pero la model card de Lamba 0.4 no documenta la arquitectura interna ni los detalles de esas etapas. No se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones.

Respecto al entrenamiento especifico de Lamba 0.4, la informacion disponible no detalla el volumen de tokens, la composicion del dataset ni si se aplico RLHF o DPO. La model card menciona una "constitucion" usada para el rechazo de prompts daninos (con un 93,3% de rechazo cuando se aplica, frente al 77,6% de Lamba 0.3), lo que apunta a un alineamiento guiado por principios, pero sin especificar la metodologia exacta. El modelo base de 0.4 es distinto al de las versiones 0.1 a 0.3, por lo que las comparaciones internas mezclan efectos de entrenamiento y de cambio de base.

## Capacidades

- Generacion de texto conversacional en ingles y malayo, con un tono descrito como mas calido y menos sobre-formateado que el de su base.
- Razonamiento: obtiene 80,8 en GPQA-Diamond segun la evaluacion interna del autor.
- Tool calling y function calling: invoca herramientas de busqueda en el primer turno en el 99,2% de los casos en que deberia, y evita busquedas innecesarias en el 98,8% de los escenarios.
- Conocimiento del contexto malasio: preguntas sobre capitales y estados con un 96,1% de acierto, y MalayMMLU generativo con 84,6%.
- Identidad propia: se presenta como "Lamba" en el 96,2% de los items de identidad retenidos.
- Capacidad de rechazo de prompts daninos, tanto con system prompt (93,3%) como sin el (96,2%).
- Control de repeticiones y finales limpios: 93,5 en ausencia de bucles y 97,0 en finales sin repeticion.
- Gestion de presupuesto de tokens: completa dentro del limite en el 74,8% de los casos (frente al 34,0% del Qwen base).
- Capacidad multimodal: el pipeline declarado es `image-text-to-text` en los tags de Hugging Face, lo que sugiere soporte de entrada de imagen y texto, aunque la model card no detalla su alcance.

## Casos de uso

- Atencion al cliente en Malasia: el modelo puede gestionar conversaciones multi-turno en malayo e ingles con un tono calido y conocimiento de contexto local (capitales, estados, referencias culturales), lo que reduce la necesidad de ingenieria de prompts para naturalidad.
- Asistentes con busqueda web integrada: su alta tasa de invocacion correcta de herramientas de busqueda (99,2% en el primer turno) y su baja tasa de sobre-busqueda (98,8%) lo hacen adecuado para agentes que deben decidir cuando consultar fuentes externas.
- Generacion de codigo asistida por herramientas: aunque no se documentan benchmarks de codigo, la cadena de modelos base incluye componentes orientados a codigo ("Coder390") y el modelo soporta function calling, lo que permite integrarlo en pipelines que invocan APIs o ejecutan comandos.
- Razonamiento cientifico y tecnico: con 80,8 en GPQA-Diamond, puede emplearse en tareas de preguntas y respuestas de nivel experto en dominios STEM, siempre con verificacion humana.
- Moderacion y filtrado de contenido: su capacidad de rechazo de prompts daninos (93,3% con constitucion) permite usarlo como capa de seguridad en aplicaciones de chat, complementando clasificadores dedicados.
- Educacion y tutoria en bahasa malasia: su rendimiento en MalayMMLU generativo (84,6%) y en preguntas de geografia y administracion malasia lo hacen util para asistentes educativos locales.
- Despliegue en produccion con vLLM: los pesos en fp8 y la compatibilidad declarada con vLLM facilitan servirlo en infraestructura con GPU modernas, con throughput razonable para un modelo de 27B.

## Benchmarks y rendimiento

Los datos proceden del arnes de evaluacion propio de Vixero Labs y no han sido reproducidos de forma independiente. La comparacion con Lamba 0.3 mezcla efectos de entrenamiento y de cambio de modelo base.

| Prueba | Lamba 0.4 | Lamba 0.3 | Qwen3.8-27B base |
|---|---|---|---|
| Invoca busqueda cuando debe (primer turno) | 99,2% | 72,6% | no disponible |
| MalayMMLU generativo (5k) | 84,6% | 82,5% | no disponible |
| Tono de chat (juez ciego, 0-10) | 8,0 | ~5,7 | no disponible |
| Rechaza prompts daninos (con constitucion) | 93,3% | 77,6% | 83,1% |
| Preguntas capital/estado correctas | 96,1% | 61,7% | no disponible |
| No se auto-presenta en "X tu apa?" | 97,4% | 68,4% | no disponible |
| Hechos malasios correctos | 81,9% | 73,9% | 80,2% |
| Evita busquedas innecesarias | 98,8% | 94,6% | no disponible |
| GPQA-Diamond | 80,8% | 78,3% | no disponible |
| Termina dentro del presupuesto de tokens | 74,8% | 72,9% | 34,0% |
| Rechaza prompts daninos (sin system prompt) | 96,2% | 95,5% | 95,5% |
| Finales limpios | 97,0% | 97,3% | 90,0% |
| Dice "Lamba" en items de identidad | 96,2% | 99,7% | no disponible |
| Sin bucles | 93,5% | 96,0% | 78,0% |

Comparacion con otros modelos en las pruebas de bucles y finales limpios (escala 0-100, mayor es mejor):

| Modelo | Sin bucles | Finales limpios |
|---|---|---|
| Claude Sonnet 5.5 | 100,0 | 100,0 |
| Lamba 0.3 | 96,0 | 97,3 |
| Lamba 0.4 | 93,5 | 97,0 |
| ThinkingCap | 81,3 | 86,7 |
| ILMU v3.1 | 80,7 | 81,3 |
| DeepSeek v4.1 Flash | 74,0 | 82,7 |
| GLM-5.3 Flash | 70,0 | 74,0 |
| Stock Qwen3.8-27B | 66,0 | 78,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp8, el modelo ocupa aproximadamente 27,8 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 40 GB de VRAM para servicio comodo con contexto moderado. En bf16 serian unos 55,6 GB.
- GPU recomendadas: A100 80GB, H100 80GB, L40S 48GB o RTX 6000 Ada 48GB para fp8 con margen. Una RTX 4090 de 24GB no cabe en fp8 sin offloading o cuantizacion adicional a 4 bits (no documentada por el autor).
- Cabe en GPU de consumo: no en configuracion fp8 estandar; requeriria cuantizaciones GGUF de 4-5 bits no publicadas oficialmente, con la consiguiente perdida de calidad no evaluada.
- Opciones de despliegue: vLLM (declarado en los tags), transformers (libreria principal). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Lamba 0.4 | 27,78B | no disponible | en, ms | Apache 2.0 | Fine-tune de Qwen3 con foco en malayo y tool use |
| Lamba 0.3 | no disponible | no disponible | en, ms | Apache 2.0 | Version previa; mejor en identidad y ausencia de bucles, peor en tool use y conocimiento local |
| Stock Qwen3.8-27B | ~27B | no disponible | multilingue | Apache 2.0 | Base sin fine-tune; peor en gestion de presupuesto y en bucles segun el autor |
| ILMU v3.1 | no disponible | no disponible | no disponible | no disponible | Modelo malasio comparable en las pruebas del autor; peor en bucles y finales limpios |
| Claude Sonnet 5.5 | no disponible | no disponible | multilingue | propietaria | Mejor en bucles y finales limpios, pero no es open source ni desplegable localmente |

## Limitaciones y advertencias

- Todas las cifras de rendimiento provienen del arnes interno de Vixero Labs en una sola maquina y no han sido reproducidas de forma independiente.
- La comparacion con Lamba 0.3 mezcla un cambio de modelo base con el nuevo entrenamiento, por lo que las mejoras no son atribuibles exclusivamente al fine-tune.
- Lamba 0.4 retrocede frente a 0.3 en identidad (96,2% vs 99,7%) y en ausencia de bucles (93,5% vs 96,0%).
- El soporte de idiomas se limita a ingles y malayo; el rendimiento en castellano u otras lenguas no esta documentado y probablemente sea deficiente.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas sin pruebas previas.
- El pipeline declarado es `image-text-to-text`, pero la model card no describe capacidades de vision; conviene verificar antes de asumir multimodalidad.
- Riesgo de alucinacion no cuantificado; como todo modelo de 27B, requiere verificacion en dominios factuales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base encadenado puede arrastrar obligaciones adicionales no detalladas en la model card.
- No se publican cuantizaciones GGUF ni versiones para llama.cpp u Ollama, lo que limita el despliegue en hardware de consumo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/VixeroAI/Lamba-0.4
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
