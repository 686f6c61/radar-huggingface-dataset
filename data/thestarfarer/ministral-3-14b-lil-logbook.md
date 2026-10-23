# thestarfarer/Ministral-3-14B-lil-logbook

## Resumen

`thestarfarer/Ministral-3-14B-lil-logbook` no es un modelo completo, sino una colección de **siete adaptadores LoRA** (librería PEFT) entrenados sobre `mistralai/Ministral-3-14B-Base-2512` para ajuste supervisado de diálogo multi-turno orientado a roleplay. El repositorio funciona como un cuaderno de experimentos: todos los adaptadores parten del mismo corpus y cambian una sola variable por ejecución (inicialización, recorte de gradiente y una escalera de cuatro learning rates), lo que lo convierte en material útil para estudiar el compromiso entre ajuste al dominio y olvido catastrófico en adaptadores de rango alto.

El modelo base es el mayor de la familia Ministral 3 de Mistral AI (publicada el 2 de diciembre de 2025 junto a las variantes de 3B y 8B): un núcleo de lenguaje de 13,5B parámetros más un codificador visual de 0,4B, con licencia Apache 2.0. El recuento de parámetros registrado en los safetensors del repo (13.506.073.600) coincide con ese núcleo de lenguaje, ya que los pesos entregados son adaptadores, no el modelo fusionado.

Su relevancia es doble: por un lado ofrece un adaptador de roleplay listo para usar con GGUFs F16/Q8_0 de las tres ejecuciones originales; por otro, documenta de forma cuantitativa cómo un LR más bajo reduce el daño fuera de dominio manteniendo buena parte de la ganancia en dominio (de 1e-7 a 5e-6 la tasa ganancia/pérdida pasa de 3,91 a 2,04). El corpus es pequeño (6,16M tokens) y el contexto de entrenamiento se empaqueta a 512 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rsLoRA, rango 512, alpha 512) sobre un transformer decoder-only: `mistralai/Ministral-3-14B-Base-2512` |
| Parámetros totales | 13.506.073.600 en los safetensors del repo (corresponden al núcleo de lenguaje del modelo base); el tamaño de cada adaptador no se documenta |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La model card solo documenta empaquetado de muestras a 512 tokens y truncado a 512 de contexto en el conjunto de evaluación OOD; no se declara la ventana del modelo base |
| Tipos de cuantización | GGUF F16 y Q8_0 para las tres ejecuciones originales; el resto de adaptadores se publican en safetensors (entrenados sobre base BF16 con AdamW en FP32) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el corpus son diálogos multi-turno sin especificación lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) y GGUF (F16, Q8_0). Tamaño total del repo: 206,3 GB |

## Arquitectura y entrenamiento

El ajuste se hace con **rsLoRA de rango 512 y alpha 512**, dropout 0, sobre las proyecciones `q, k, v, o, gate, up, down`. Configuración compartida por todas las ejecuciones: batch 16 sin acumulación, 838 pasos (una pasada), LR constante tras el warmup, base en BF16 con AdamW en FP32, semilla 42 y evaluación sobre 256 muestras reservadas cada 25 pasos. El dataset son **13.667 muestras, 6,16M tokens**, diálogos multi-turno empaquetados a 512 tokens y delimitados por cabeceras `# <código>` (abreviaturas cortas por personaje); la narración sin atribuir se pliega al turno del hablante. El pack se construyó en **dos pasadas desfasadas 256 tokens** para duplicar el corpus con ventanas distintas y eliminar duplicados exactos; el autor advierte que el efecto de esta augmentación no se ha aislado ni evaluado.

Las tres ejecuciones originales son `v3-lil` (continuación del adaptador de roleplay `writer-sft-rp-v3`, LR 7,5e-6, warmup 30, eval final 1,530), `base-lil` (adaptador nuevo sobre la base, LR 5e-6, warmup 35, eval 1,582) y `base-lil-clip1` (idéntico pero con `max_grad_norm` 1.0, eval 1,583). Dos hallazgos técnicos: la inicialización desde un adaptador RP de 186M tokens apenas aporta por pérdida (0,05 de diferencia con un 33% menos de LR), y el recorte de gradiente a 1.0 no cambió nada porque actuó en el 100% de los pasos (normas brutas medias de 14,9, máximo 36) y AdamW cancela aproximadamente un reescalado aplicado en todos los pasos. La escalera `lr-sweep/` añade cuatro peldaños (1e-7, 2e-7, 5e-7, 2e-6) con `max_grad_norm` 1.0 y una evaluación previa al paso 0 como línea base, además de un conjunto OOD de 256 muestras de prosa de foro del corpus v3 truncadas a 512 tokens.

## Capacidades

- Generación de diálogo multi-turno con voces de personaje diferenciadas, usando el formato de cabecera `# <código>` para marcar hablante.
- Continuación de escenas de roleplay y narrativa interactiva con estructura de turnos limpia.
- Composición de personas aprendidas con contenido ajeno al corpus: la sonda de composición sitúa a los hablantes recurrentes en escenarios técnicos (hojas de cálculo rotas, canales de router, formularios fiscales, nivelación de cama de impresora 3D) y evalúa voz, coherencia y formato.
- Ajuste fino eficiente sobre la base mediante PEFT: adaptadores independientes intercambiables sin duplicar los 13,5B pesos.
- Despliegue en local vía GGUF (F16/Q8_0) de las tres ejecuciones originales.
- Capacidad multimodal heredada del modelo base según fuentes externas (codificador visual de 0,4B), pero **no documentada ni evaluada** en este repositorio, y los LoRA solo atacan capas de atención y MLP del núcleo de lenguaje.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento es SFT de diálogo, no RLHF ni DPO.

## Casos de uso

- **Motor de roleplay en aplicaciones de chat**: cargar el adaptador (o la GGUF Q8_0) sobre Ministral-3-14B-Base y servir conversaciones multi-turno con personajes consistentes, aprovechando el formato de cabecera `# <código>` para separar hablantes en el preprocesado.
- **Narrativa interactiva y ficción serializada**: el adaptador mantiene registro y voz de personaje en escenas largas, adecuado para motores de aventuras de texto donde la coherencia de registro importa más que el conocimiento factual.
- **Investigación sobre LoRA y olvido catastrófico**: la escalera de LR con ejes en dominio y OOD permite reproducir el resultado de que bajar el LR 50× conserva el 48% del aprendizaje con el 25% del daño, un punto de partida para estudiar regularización en adaptadores de rango alto.
- **Prototipado rápido de personajes para producto**: entrenar o sustituir adaptadores sobre la misma base mantiene un único despliegue de 13,5B y permite A/B testing de voces cambiando solo el adaptador.
- **Generación de diálogos sintéticos para datasets**: producir corpus de conversación con hablantes etiquetados y estructura de turnos controlada, útil para aumentar datos de entrenamiento de sistemas de diálogo.
- **Banco de pruebas de evaluación con LLM-as-judge**: el diseño de sonda de composición (32 escenas, 5 rerolls, 6 checkpoints, rúbrica 0-2 en voz/coherencia/formato, juicio ciego y pool barajado) sirve como plantilla metodológica para medir calidad de roleplay más allá de la pérdida.
- **Despliegue en hardware de gama alta para demostraciones internas**: con la GGUF Q8_0 el modelo completo cabe en una GPU de 24 GB, lo que permite demos locales sin infraestructura de servidor.

## Benchmarks y rendimiento

Pérdida de evaluación final de las tres ejecuciones originales (menor es mejor):

| Ejecución | Inicialización | LR | max_grad_norm | Pérdida eval final |
|---|---|---|---|---|
| `v3-lil` | continuación de `writer-sft-rp-v3` | 7,5e-6 | 10,0 | 1,530 |
| `base-lil` | adaptador nuevo sobre la base | 5e-6 | 10,0 | 1,582 |
| `base-lil-clip1` | adaptador nuevo sobre la base | 5e-6 | 1,0 | 1,583 |

Escalera de learning rate (256 muestras reservadas en dominio y 256 muestras OOD de prosa de foro):

| LR | Eval en dominio | Eval OOD (prosa) | Ganado | Perdido | Ganado/perdido |
|---|---|---|---|---|---|
| Sin entrenar (base) | 2,421 | 2,655 | — | — | — |
| 1e-7 | 2,015 | 2,759 | 0,405 | +0,104 | 3,91 |
| 2e-7 | 1,970 | 2,811 | 0,451 | +0,156 | 2,89 |
| 5e-7 | 1,898 | 2,871 | 0,523 | +0,216 | 2,42 |
| 2e-6 | 1,729 | 2,977 | 0,692 | +0,322 | 2,15 |
| 5e-6 (= `base-lil-clip1`) | 1,583 | 3,067 | 0,838 | +0,412 | 2,04 |

Sonda de composición: la información proporcionada incluye el diseño (32 escenas, 5 rerolls, 6 checkpoints, rúbrica 0-2 sobre voz, coherencia y formato, juicio ciego con conjunto barajado y sin etiquetas, n=160 por peldaño, sampler temp 0.8 / min_p 0.05 / repetición 1.1) pero **la tabla de resultados está truncada en el material disponible**, por lo que las tasas de acierto por checkpoint no están disponibles. Sí se documenta que con el sampler recomendado para v3 (temp 0.5, min_p 0.1, rep 1.03) entre el 30% y el 65% de las completions colapsaban en bucles literales o secuencias de cabeceras `...`, y que con temp 0.8 / min_p 0.05 / rep 1.1 el colapso baja a ≤1,2% en todos los peldaños.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- La VRAM viene dominada por el modelo base (13,5B parámetros), no por el adaptador, que se aplica en tiempo de carga o se fusiona.
- Estimación de pesos en BF16/FP16: ~27 GB; con caché KV y overhead de runtime, ~30-32 GB. Requiere A100 40 GB, H100, L40S o dos GPU de 24 GB con paralelismo de tensor.
- Estimación en GGUF Q8_0 (formato publicado): ~14,3 GB de pesos; con overhead, ~16-18 GB. Cabe en una RTX 4090, RTX 3090, A6000 o L40S, con margen limitado para contextos largos.
- Estimación en Q4_K_M (no publicada en el repo, cálculo a partir del recuento de parámetros): ~8,5 GB, viable en RTX 4070 Ti Super, 4080 o 3090 con espacio amplio para caché KV.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), llama.cpp / Ollama con las GGUF F16 y Q8_0, vLLM (soporte de LoRA o fusión previa del adaptador), TGI, y endpoint gestionado en FriendliAI.
- Almacenamiento: el repo completo ocupa 206,3 GB por acumular siete adaptadores y las GGUFs; conviene descargar solo el subdirectorio del adaptador necesario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ministral-3-14B-lil-logbook` | 13,5B (base) + adaptadores rsLoRA r512 | No disponible | Roleplay / SFT de diálogo; 7 adaptadores y GGUFs F16/Q8_0 | Apache 2.0 | HuggingFace, FriendliAI |
| `mistralai/Ministral-3-14B-Base-2512` | 13,5B núcleo + 0,4B codificador visual (según fuente externa) | No disponible | Modelo base preentrenado multimodal | Apache 2.0 | HuggingFace (modelo padre) |
| `thestarfarer/Ministral-3-14B-writer-sft-rp-v3` | 13,5B + adaptador RP (186M tokens de entrenamiento) | No disponible | RP y prosa de foro; usado como inicialización de `v3-lil` | No disponible | HuggingFace |
| Familia Ministral 3 (variantes 3B y 8B, según fuente externa) | 3B / 8B | No disponible | Modelos de la misma familia para despliegue local | Apache 2.0 (según fuente) | HuggingFace |

## Limitaciones y advertencias

- **Olvido catastrófico medido**: el ajuste degrada prosa fuera de dominio de forma monótona con el LR (+0,104 en 1e-7 hasta +0,412 en 5e-6 sobre una línea base de 2,655). El autor lo atribuye a cambio de distribución, no al entrenamiento en sí, y advierte que «cada unidad de ajuste se paga en daño a capacidades generales».
- **Sensibilidad al sampler**: el ajuste recomendado para v3 (temp 0.5, min_p 0.1, rep 1.03) produce entre 30% y 65% de colapso en bucles con estos checkpoints. Debe usarse temp 0.8 / min_p 0.05 / repetición 1.1.
- **Corpus pequeño y de un solo dominio**: 13.667 muestras y 6,16M tokens de diálogo, empaquetados a 512 tokens. No hay evidencia de generalización fuera de roleplay conversacional.
- **Formato rígido**: el modelo espera cabeceras `# <código>`; fuera de esa convención la calidad de estructura de turnos no está evaluada.
- **Sin datos de seguridad ni alineación**: el entrenamiento es SFT puro sobre diálogo de roleplay, sin RLHF/DPO documentado ni filtros de contenido. No se describe la procedencia, consentimiento ni licencias del corpus de diálogo.
- **Evaluación con LLM-as-judge**: el propio autor reporta que el juicio por checkpoint desvía las tasas ±8pp solo por severidad del juez, y que los resultados finales son de un conjunto ciego barajado; los números de la sonda de composición no están completos en la información disponible.
- **Sin benchmarks estándar**: no hay MMLU, HumanEval ni GSM8K; la comparación con alternativas se limita a pérdida de evaluación.
- **Idiomas y contexto no declarados**: no se especifican idiomas soportados ni ventana de contexto, lo que impide planificar despliegues multilingües o de contexto largo sin validación propia.
- **Licencia**: Apache 2.0 permite uso comercial, pero se heredan las condiciones y advertencias del modelo base; conviene revisar la model card de `Ministral-3-14B-Base-2512` antes de producción.
- **Madurez**: 139 descargas y 0 likes en el momento de la ficha; el repositorio es un cuaderno experimental, no un artefacto con garantías de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thestarfarer/Ministral-3-14B-lil-logbook
- Peso del adaptador: https://huggingface.co/thestarfarer/Ministral-3-14B-lil-logbook/blob/main/adapter_model.safetensors
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- Adaptador precedente (`writer-sft-rp-v3`): https://huggingface.co/thestarfarer/Ministral-3-14B-writer-sft-rp-v3
- Endpoint de inferencia (FriendliAI): https://friendli.ai/models/thestarfarer/Ministral-3-14B-lil-logbook
- Ficha de la familia Ministral 3 (Awesome Agents): https://awesomeagents.ai/models/ministral-3-14b/
- Ficha de Ministral 3 14B (MindStudio): https://www.mindstudio.ai/models/ministral-3-14b
