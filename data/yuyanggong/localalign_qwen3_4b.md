# yuyangGong/LocalAlign_qwen3_4B

## Resumen

LocalAlign_qwen3_4B es un adaptador PEFT/LoRA publicado por Yuyang Gong, junto a Zihao Wang, Jiawei Liu y XiaoFeng Wang, sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo completo, sino un ajuste fino de alineación de seguridad cuyo objetivo es que el modelo obedezca las instrucciones de confianza y trate como contenido no fiable cualquier comando incrustado en datos externos, como documentos, pasajes recuperados, reseñas o resultados de herramientas.

El problema que aborda es el prompt injection indirecto: ataques en los que un texto externo introduce órdenes maliciosas que el modelo interpreta como instrucciones legítimas. La defensa se aprende durante el fine-tuning, de modo que en inferencia no se necesita un detector de ataques adicional ni una llamada separada a un modelo de defensa. El método se describe en el artículo LocalAlign (arXiv:2605.01462) y consta de tres etapas: calentamiento, generación de ejemplos adversarios cercanos al objetivo y Margin-Aware Alignment.

El repositorio ocupa 0,1 GB e incluye el adaptador LoRA junto con un tokenizer propio que incorpora un rol `input` para separar instrucción fiable y contenido no fiable. La licencia declarada es Apache 2.0. El modelo se publicó en septiembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones positivas en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA sobre PEFT |
| Parámetros totales | Aproximadamente 4.000 millones en el modelo base; el adaptador LoRA ocupa 0,1 GB |
| Parámetros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | El repositorio solo publica el adaptador en safetensors; no se distribuyen pesos cuantizados. La cuantización posterior (4/8 bits, GGUF, AWQ, GPTQ) requeriría fusionar el adaptador y convertir, algo no documentado en la model card |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio distribuye un adaptador LoRA de bajo rango sobre un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros. No se modifica la arquitectura del modelo base: el adaptador se aplica sobre los pesos de Qwen3-4B-Instruct-2507 y puede cargarse de forma independiente o fusionarse con ellos. La model card no detalla el rango, los módulos objetivo ni la configuración exacta del LoRA.

El entrenamiento sigue el método LocalAlign en tres fases: primero un calentamiento que establece una preferencia inicial por las instrucciones de confianza frente a los comandos embebidos en datos no fiables; después una generación de ejemplos adversarios cercanos al objetivo, que produce comandos inyectados cuyas respuestas son contextualmente próximas a la respuesta correcta pero semánticamente distintas, evitando la optimización iterativa sobre tokens de entrada; y por último un Margin-Aware Alignment que utiliza los márgenes del modelo como proxy de la proximidad al objetivo y adapta la intensidad de la alineación dentro de cada mini-lote, aplicando más presión a los ejemplos con menor margen. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado `text-generation`.
- Seguimiento de instrucciones de confianza manteniendo el contenido externo como no fiable, que es la capacidad central del ajuste.
- Resistencia a prompt injection indirecto sin detector auxiliar ni segunda llamada a un modelo de defensa en tiempo de inferencia.
- Separación explícita entre instrucción fiable y contenido no fiable mediante el rol `input` de la plantilla de chat.
- Compatibilidad con el ecosistema PEFT: carga como adaptador o fusión con el modelo base.
- Soporte de tool calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible, aunque los benchmarks incluyen InjecAgent.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles.

## Casos de uso

- Defensa de pipelines RAG: el modelo recibe la pregunta del usuario como instrucción fiable y los pasajes recuperados como contenido no fiable, reduciendo el ASR en Optimization-Free a 2,0 % en HotpotQA y 2,0 % en Qasper para Qwen3, frente al 22,0 % y 11,0 % del modelo sin defensa.
- Agentes con llamadas a herramientas: los resultados devueltos por APIs externas se tratan como contenido no fiable, lo que limita el ASR en InjecAgent al 4,60 % sin optimización y al 15,70 % frente a ataques adaptativos.
- Procesamiento de documentos de terceros (correos, contratos, reseñas, PDFs): permite resumir o extraer datos de fuentes externas sin que el texto contenido en ellas redirija el comportamiento del modelo.
- Atención al cliente automatizada: los mensajes generados por usuarios pueden contener instrucciones maliciosas; el ajuste mantiene al modelo anclado a la política del sistema en conversaciones multi-turno.
- Navegación web y browsing agents: el HTML o el texto de las páginas visitadas se marca como no fiable, reduciendo el riesgo de que una página maliciosa secuestre el flujo del agente.
- Evaluación de seguridad y red teaming: sirve como baseline de defensa entrenada con un ASR medido en seis conjuntos fuera de distribución, útil para comparar contra detectores externos o variantes adaptativas.
- Despliegue en hardware modesto: al ser un adaptador sobre un modelo de 4B, puede ejecutarse en una GPU de consumo para prototipos de defensa antes de escalar a modelos mayores.
- Separación de confianza en asistentes corporativos: obliga a que los datos procedentes de sistemas internos o de terceros no se interpreten nunca como órdenes del operador.

## Benchmarks y rendimiento

Ataques de prompt injection fuera de distribución sobre Qwen3-4B-Instruct-2507 (ASR en %, menor es mejor; extraído de la Tabla 1 del artículo):

| Ataque | Defensa | HotpotQA | Qasper | InjecAgent | SEP | MMLU | Open-Prompt |
|---|---|---:|---:|---:|---:|---:|---:|
| Optimization-Free | Ninguna | 22,0 | 11,0 | 76,0 | 94,50 | 99,90 | 99,20 |
| Optimization-Free | Meta-SecAlign | 16,0 | 4,0 | 43,50 | 0,90 | 11,60 | 3,84 |
| Optimization-Free | LocalAlign | 2,0 | 2,0 | 4,60 | 0,0 | 0,0 | 0,0 |
| Adaptive Optimization-Free | Ninguna | 30,0 | 44,0 | 80,0 | 96,39 | 99,70 | 99,76 |
| Adaptive Optimization-Free | Meta-SecAlign | 14,0 | 14,0 | 68,20 | 20,70 | 89,40 | 1,80 |
| Adaptive Optimization-Free | LocalAlign | 4,0 | 6,0 | 15,70 | 2,15 | 9,10 | 0,0 |

Utilidad en tareas benignas sobre Qwen3 (porcentaje, mayor es mejor; extraído de la Tabla 3 del artículo):

| Método | BBH | IFEval | MMLU-Pro | MMLU | AlpacaEval2 |
|---|---:|---:|---:|---:|---:|
| Ninguna | 76,64 | 86,75 | 56,74 | 72,58 | 90,19 |
| Meta-SecAlign | 77,66 | 85,74 | 50,19 | 72,11 | 90,34 |
| LocalAlign | 75,66 | 83,75 | 49,35 | 72,12 | 89,63 |

Resultados de referencia sobre Llama3.1-8B-Instruct en los mismos conjuntos de ataque (ASR en %, menor es mejor):

| Ataque | Defensa | HotpotQA | Qasper | InjecAgent | SEP | MMLU | Open-Prompt |
|---|---|---:|---:|---:|---:|---:|---:|
| Optimization-Free | Ninguna | 74,0 | 83,0 | 81,1 | 91,0 | 90,4 | 87,5 |
| Optimization-Free | Meta-SecAlign | 44,0 | 45,0 | 13,5 | 0,0 | 8,2 | 0,3 |
| Optimization-Free | LocalAlign | 8,0 | 7,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| Adaptive Optimization-Free | Ninguna | 78,0 | 87,0 | 73,8 | 85,3 | 92,0 | 98,6 |
| Adaptive Optimization-Free | Meta-SecAlign | 55,0 | 56,0 | 6,4 | 2,5 | 24,0 | 8,5 |
| Adaptive Optimization-Free | LocalAlign | 23,0 | 9,0 | 0,0 | 0,3 | 0,2 | 0,0 |

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 4B (estimaciones a partir del tamaño de parámetros, no publicadas por el autor): aproximadamente 8,5 GB en bf16 solo para pesos, 10-12 GB contando caché KV y overhead con contextos moderados; en torno a 4,5 GB en cuantización de 8 bits y 2,5-3,5 GB en 4 bits.
- El adaptador LoRA en sí ocupa 0,1 GB adicionales, pero requiere cargar el modelo base completo.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, RTX 4070, RTX 4070 Ti, RTX 4080 y RTX 4090 en bf16; en tarjetas de 8 GB conviene recurrir a cuantización de 4 u 8 bits.
- GPU de centro de datos: A100, H100 y L40S son adecuadas para lotes grandes y mayor concurrencia; el modelo es lo bastante pequeño como para servirse en una sola GPU.
- Opciones de despliegue documentadas: `transformers>=4.51.0,<5`, `peft==0.14.0`, `accelerate` y PyTorch con soporte de BF16. Es imprescindible usar el tokenizer y la plantilla de chat que acompañan al adaptador, incluido el rol `input`.
- vLLM, TGI, llama.cpp y Ollama: no documentados por el autor. Su uso requeriría fusionar el adaptador con el modelo base y, en el caso de llama.cpp u Ollama, convertir a GGUF, asumiendo que la plantilla de chat con rol `input` se reproduzca correctamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Defensa | ASR InjecAgent (sin opt. / adaptativo) | MMLU-Pro | Licencia |
|---|---|---:|---:|---:|---|
| Qwen3-4B-Instruct-2507 | 4B | Ninguna | 76,0 % / 80,0 % | 56,74 | Apache 2.0 |
| Qwen3-4B-Instruct-2507 + Meta-SecAlign | 4B | Supervisada (baseline) | 43,50 % / 68,20 % | 50,19 | Apache 2.0 |
| LocalAlign_qwen3_4B | 4B (adaptador LoRA) | LocalAlign | 4,60 % / 15,70 % | 49,35 | Apache 2.0 |
| Llama3.1-8B-Instruct + LocalAlign | 8B | LocalAlign | 0,0 % / 0,0 % | 44,12 | No disponible en la información proporcionada |

Frente al modelo base sin defensa, LocalAlign reduce el ASR en todos los conjuntos evaluados, con la mayor ganancia en MMLU (99,90 % a 0,0 %) y SEP (94,50 % a 0,0 %) en ataques sin optimización. Frente a Meta-SecAlign, mejora el ASR en los seis conjuntos, pero sacrifica utilidad: MMLU-Pro cae de 50,19 a 49,35 y frente al modelo sin defensa baja de 56,74 a 49,35. La variante sobre Llama3.1-8B-Instruct logra un ASR menor en InjecAgent, aunque sobre un modelo con el doble de parámetros y con una MMLU-Pro inferior (44,12).

## Limitaciones y advertencias

- Los ataques adaptativos siguen teniendo éxito parcial: 15,70 % de ASR en InjecAgent, 9,10 % en MMLU, 6,0 % en Qasper y 4,0 % en HotpotQA. En Llama3.1-8B, el ASR adaptativo en HotpotQA llega al 23,0 %.
- La defensa no es gratuita en utilidad: frente al modelo sin ajustar, MMLU-Pro baja de 56,74 a 49,35, IFEval de 86,75 a 83,75, BBH de 76,64 a 75,66 y AlpacaEval2 de 90,19 a 89,63; MMLU se mantiene prácticamente igual (72,58 a 72,12).
- Es obligatorio usar el tokenizer y la plantilla de chat del adaptador, incluido el rol `input`. La model card advierte explícitamente de que la plantilla por defecto del modelo base no reproduce la interfaz entrenada y de que no debe usarse un tokenizer de Llama con un adaptador de Qwen.
- Idiomas soportados: no disponibles. No hay evaluación multilingüe publicada.
- Sesgos conocidos: no disponibles. Al ser un ajuste sobre Qwen3-4B-Instruct-2507, cabe esperar los sesgos del modelo base, pero no se documentan ni se miden.
- Riesgo de alucinación: no evaluado en la información proporcionada, más allá de las métricas de utilidad.
- La defensa es puramente aprendida durante el fine-tuning; no incorpora un detector de ataques en inferencia, por lo que la robustez depende por completo de la generalización del ajuste.
- Licencia Apache 2.0 para el adaptador, lo que permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Qwen3-4B-Instruct-2507 antes de desplegarlo en producción.
- Tracción comunitaria mínima: 0 descargas y 0 valoraciones positivas en HuggingFace, con un tamaño de repositorio de 0,1 GB, lo que implica poca validación externa independiente.
- No se documentan en la model card los hiperparámetros exactos del LoRA, el volumen de datos de entrenamiento ni el protocolo de evaluación completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yuyangGong/LocalAlign_qwen3_4B
- Artículo LocalAlign: https://arxiv.org/abs/2605.01462
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Búsqueda web: no se han encontrado enlaces adicionales relevantes. Los resultados devueltos corresponden a consultas sin relación con el modelo (mapas y datos inmobiliarios de Fort-de-France y Schœlcher), por lo que se descartan como fuentes.
