# wasnaga/UniverseNet-LFM2.5-24B-Pocket-GGUF

## Resumen

UniverseNet-LFM2.5-24B-Pocket-GGUF es una familia de cuantizaciones GGUF derivadas del modelo base LiquidAI/LFM2.5-24B-A2B, un transformer de tipo mezcla de expertos (MoE) desarrollado por Liquid AI. El autor de la ficha, wasnaga, publica cuatro variantes ("ediciones") del mismo modelo con distintos regímenes de compresión: Pocket, Edge, Pro y Workstation. El objetivo declarado es ofrecer checkpoints ligeros y portables que mantengan las capacidades de tool calling y razonamiento del modelo original en entornos de recursos limitados, incluidos dispositivos móviles como iPhone.

El modelo base emplea una arquitectura MoE con aproximadamente 24.000 millones de parámetros totales y en torno a 2.300 millones de parámetros activos por token, según los datos de la model card. La ficha de Hugging Face reporta 16.321.177.216 parámetros reales en los safetensors del modelo base, cifra que no coincide con la nomenclatura comercial "24B"; esta discrepancia se documenta tal cual y conviene verificarla contra el repositorio original antes de cualquier uso en producción.

La relevancia actual del proyecto radica en su enfoque de "condensación" de expertos: en lugar de aplicar una cuantización convencional uniforme, el autor reduce el ancho de los expertos en las ediciones ligeras y reserva la preservación del ancho completo para la edición Workstation. Los resultados publicados son diagnósticos de validación del propio autor (perplejidad, acuerdo top-1 con el profesor), no benchmarks independientes, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (lfm2moe, Liquid AI LFM2.5) |
| Parametros totales | 16.321.177.216 (safetensors del modelo base); 24,16 B en Workstation segun model card |
| Parametros activos | 1,62 B (Pocket), 1,86 B (Edge), 2,1 B (Pro), 2,34 B (Workstation) segun model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_S (~2,56 bpw) en Pocket; IQ3_S (~3,44 bpw) en Edge y Pro; mezcla IQ2/IQ3 en Workstation |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de Liquid AI, identificado en las etiquetas como `lfm2moe`. La model card no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa ni la estrategia de atención empleada. Lo que sí documenta el autor es el proceso de "condensación" aplicado sobre el checkpoint original Q4_K_M (denominado "teacher" o profesor): las ediciones Pocket, Edge y Pro reducen el ancho de los expertos y aplican cuantización de baja precisión, mientras que Workstation conserva los 1536 "orbitales" de experto a ancho completo y solo cuantiza los pesos.

Las recetas de cuantización descritas incluyen mecanismos técnicos concretos: en Pocket, lecturas IQ2_S con norma polar bloqueada y paso único a aproximadamente 2,56 bpw; en Edge y Pro, lecturas IQ3_S a aproximadamente 3,44 bpw con unión orbital anclada al profesor, permutación orbital alineada a bloque, transferencia bilineal de escala dentro de bloque y compensación completa de puerta a arriba basada en Gram. El autor advierte explícitamente que estas descripciones corresponden a las recetas seleccionadas y que las puntuaciones de los modelos elegidos no aíslan el efecto causal de cada componente.

## Capacidades

- Generación de texto conversacional en formato GGUF compatible con llama.cpp.
- Tool calling y function calling: la model card reporta un 100% de acierto en una sonda top-1 de llamada a herramienta en las cuatro ediciones (v16).
- Razonamiento multi-paso orientado a agentes: se documentan métricas de "plan explore-minus-repeat" y "pivote ante corrección del usuario" en nats.
- Razonamiento matemático y científico: evaluado con subconjuntos de GSM8K y MATH en la tabla de seis suites.
- Generación de código: puntuada en la suite "Code /16" de la tabla de seis suites.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" o visión/audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivo móvil: la edición Pocket (3,996 GB, ~2,56 bpw) está pensada para ejecutarse en iPhone, con mediciones exactas del archivo documentadas por el autor. Adecuada para chatbots locales sin conexión.
- Agentes con tool calling en producción: el modelo reporta un 100% de acierto en la sonda de llamada a herramienta, lo que permite integrarlo en pipelines de automatización donde el modelo debe invocar APIs o funciones externas de forma fiable.
- Atención al cliente automatizada multi-turno: las métricas de pivote ante corrección del usuario (13,25-15,5 nats según edición) indican capacidad de reorientar la conversación cuando el usuario corrige al agente.
- Generación de código en entornos con recursos limitados: la edición Edge (5,65 GB) obtiene 14/16 en la suite de código, igualando al profesor Q4_K_M, lo que la hace apta para autocompletado y asistencia de programación en portátiles.
- Razonamiento matemático asistido: Pro y Workstation alcanzan 42/60 y 41/60 en MATH respectivamente, frente a 43/60 del profesor, adecuadas para tutores matemáticos o verificación de cálculos donde no se exija precisión máxima.
- Despliegue en estaciones de trabajo sin GPU dedicada: Workstation (8,711 GB) conserva el ancho completo de expertos y puede ejecutarse en CPU mediante llama.cpp con cuantización IQ2/IQ3, sirviendo como alternativa de bajo consumo al modelo original Q4_K_M (14,525 GB).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (subconjuntos mixtos, decodificación greedy, límite de 4096 tokens; resultados expuestos durante el desarrollo, no confirmación independiente):

| Edicion | Tools /10 | Instructions /20 | Science /20 | Code /16 | GSM8K /60 | MATH /60 | Four /66 | Math /120 | Six /186 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Original Q4_K_M (teacher) | 10 | 20 | 20 | 14 | 56 | 43 | 64 | 99 | 163 |
| Pocket v15 | 9 | 18 | 16 | 10 | 51 | 22 | 53 | 73 | 126 |
| Edge v18 | 10 | 20 | 17 | 14 | 56 | 34 | 61 | 90 | 151 |
| Pro v18 | 10 | 19 | 20 | 14 | 53 | 42 | 63 | 95 | 158 |
| Workstation v15 | 10 | 19 | 20 | 15 | 55 | 41 | 64 | 96 | 160 |

Diagnósticos de validación de la release v16 (perplejidad con teacher forcing, no precisión de tarea):

| Edicion | GB | Parametros total/activos (B) | PPL validacion | PPL / teacher | Acuerdo top-1 | Recall top-5 |
|---|---:|---|---:|---:|---:|---:|
| Pocket | 3,996 | 12,68 / 1,62 | 38,17 | 1,375x | 71,7% | 91,15% |
| Edge | 5,65 | 16,51 / 1,86 | 32,95 | 1,187x | 75,98% | 93,07% |
| Pro | 7,306 | 20,33 / 2,1 | 30,69 | 1,106x | 79,27% | 94,56% |
| Workstation | 8,711 | 24,16 / 2,34 | 29,01 | 1,045x | 81,42% | 95,17% |

Perplejidad de validación del profesor: 27,75. El autor advierte que estas cifras son diagnósticos de condensación y no accuracy de tarea ni fidelidad general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de archivo en GB decimales no equivale a RAM en tiempo de ejecución, según advierte el autor.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: no confirmado; el autor documenta una medición exacta del archivo Pocket en iPhone y un fallo Metal-OOM de Workstation en iPhone 18 Pro.
- Opciones de despliegue: llama.cpp (formato GGUF, etiqueta `llama-cpp`); compatibilidad con endpoints según etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UniverseNet-LFM2.5-24B-Pocket | ~12,68 B (1,62 B activos) | no disponible | lfm1.0 | GGUF IQ2_S | Edición móvil, 3,996 GB |
| UniverseNet-LFM2.5-24B-Workstation | ~24,16 B (2,34 B activos) | no disponible | lfm1.0 | GGUF IQ2/IQ3 | Ancho completo, 8,711 GB |
| LiquidAI/LFM2.5-24B-A2B (base) | 16,32 B safetensors (según ficha) | no disponible | lfm1.0 | safetensors | Modelo original de Liquid AI |
| Original Q4_K_M (teacher) | no disponible | no disponible | lfm1.0 | GGUF | 14,525 GB, referencia de condensación |

No se dispone de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados son subconjuntos mixtos (66 y 120 preguntas) y no el protocolo completo fast-106; el total de seis suites es una suma descriptiva, no una puntuación de split completo.
- Los resultados están expuestos durante el desarrollo: las mismas preguntas se usaron para selección de modelo, por lo que no constituyen confirmación independiente.
- Las ediciones Edge y Pro v18 no tienen mediciones actuales en teléfono; no deben reutilizarse velocidades ni afirmaciones de encaje de la v15.
- Workstation v15 documenta un fallo Metal-OOM en iPhone 18 Pro, por lo que no es apta para ese dispositivo.
- El autor reconoce que Pro v18 no supera al profesor en MATH (42/60 frente a 43/60) y que Workstation no alcanza paridad general con el profesor (160/186 frente a 163/186).
- Riesgo de alucinación: no documentado explícitamente en la información proporcionada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento multilingüe antes de desplegar en producción.
- Licencia lfm1.0 con restricciones para uso comercial no detalladas en la información proporcionada; es necesario revisar el enlace de licencia del modelo base antes de un uso comercial.
- Discrepancia entre el nombre comercial "24B" y los parámetros reales reportados (16,32 B en safetensors); verificar contra el repositorio base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasnaga/UniverseNet-LFM2.5-24B-Pocket-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Descarga Pocket v15: https://huggingface.co/wasnaga/UniverseNet-LFM2.5-24B-Pocket-GGUF/resolve/main/UniverseNet-LFM2.5-24B-Pocket-12B-v15-IQ2.gguf?download=true
- Descarga Edge v18: https://huggingface.co/wasnaga/UniverseNet-LFM2.5-24B-Pocket-GGUF/resolve/main/UniverseNet-LFM2.5-24B-Edge-16.5B-v18-IQ2-IQ3.gguf?download=true
- Descarga Pro v18: https://huggingface.co/wasnaga/UniverseNet-LFM2.5-24B-Pocket-GGUF/resolve/main/UniverseNet-LFM2.5-24B-Pro-20.3B-v18-IQ2-IQ3.gguf?download=true
- Descarga Workstation v15: https://huggingface.co/wasnaga/UniverseNet-LFM2.5-24B-Pocket-GGUF/resolve/main/UniverseNet-LFM2.5-24B-Workstation-24B-v15-IQ2-IQ3.gguf?download=true
