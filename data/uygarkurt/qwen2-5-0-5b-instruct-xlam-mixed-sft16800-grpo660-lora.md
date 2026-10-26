# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft16800-grpo660-lora

## Resumen

Este repositorio contiene un adaptador LoRA denominado `Qwen2.5-0.5B-Instruct-xlam-mixed-sft16800-grpo660-lora`, desarrollado por el usuario `uygarkurt` sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. No es un modelo completo, sino un conjunto de pesos PEFT que debe cargarse sobre Qwen2.5-0.5B-Instruct. Su objetivo es especializar un modelo pequeño en tool calling estructurado y en la abstención cuando las herramientas ofrecidas no son relevantes.

El entrenamiento combina 16.800 actualizaciones de supervised fine-tuning (SFT) y 660 actualizaciones de Group Relative Policy Optimization (GRPO) sobre el dataset `uygarkurt/xlam-tool-calling-mixed`. La propuesta es relevante para experimentos de function calling de bajo coste, despliegue local y evaluación de estrategias SFT + GRPO en modelos de 0,5B parámetros, un tamaño que permite inferencia en CPU y GPU de consumo.

La model card declara únicamente inglés, no especifica licencia y no detalla hiperparámetros del adaptador como rango, alpha o composición exacta del dataset. Los resultados publicados son agregados específicos del estudio y deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de Qwen2.5 con adaptador LoRA; no es un modelo independiente |
| Parámetros totales | 0,5B en el modelo base; parámetros entrenables del adaptador no disponibles |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible para el adaptador; el modelo base se documenta con hasta 128K tokens en la página de Qwen2.5 en Ollama consultada, sin verificación específica para este adaptador |
| Tipos de cuantización | Adaptador LoRA en safetensors sin cuantizar; no se incluyen versiones GGUF, AWQ o GPTQ en el repositorio |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | No disponible |
| Formato de pesos | Safetensors con formato PEFT LoRA |
| Modelo base | `Qwen/Qwen2.5-0.5B-Instruct` |
| Dataset de entrenamiento | `uygarkurt/xlam-tool-calling-mixed` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. La intervención consiste en un adaptador LoRA entrenado en dos fases: primero 16.800 actualizaciones SFT durante 2,7 horas y después 660 actualizaciones GRPO durante 0,4 horas, con un total de 3,1 horas de entrenamiento en bucle. La segunda fase parte del adaptador SFT y continúa el entrenamiento con el mismo dataset mixto de tool calling.

El objetivo declarado es aprender llamadas estructuradas a herramientas y abstenerse cuando las herramientas disponibles no son relevantes. No se detallan en la información proporcionada el rango del adaptador, el alpha, el tamaño de lote, la composición exacta del dataset, los rewards de GRPO ni el número total de tokens vistos. Tampoco se especifica si hubo fases adicionales de alineación distintas de GRPO.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: la model card reporta 81,90 % de exactitud exacta en xLAM ETC y 98,03 % en precisión de nombre de función xLAM FNA.
- Selección de funciones y generación de argumentos dentro de un conjunto de herramientas ofrecido.
- Abstención ante herramientas irrelevantes: la evaluación reporta 83,33 % en relevancia y 54,55 % en irrelevancia sobre subconjuntos seleccionados.
- Seguimiento de instrucciones básico: 29,02 % de exactitud estricta a nivel de prompt en IFEval.
- Razonamiento y matemáticas limitados: 38,46 % en MMLU y 15,60 % en MATH-500.
- Capacidad de function calling de un solo turno: 57,42 % en el agregado de subconjuntos seleccionados de BFCL-v3 single-turn.
- No se documentan capacidades de visión, audio, modo thinking ni razonamiento multi-paso con planificación autónoma.
- El adaptador se declara solo en inglés; no se aportan evaluaciones multilingües.

## Casos de uso

- Enrutamiento de funciones en asistentes ligeros: el modelo puede recibir una lista acotada de herramientas y devolver la función y los argumentos esperados. Es adecuado por su bajo coste y por la precisión de nombre de función reportada, aunque requiere validación del esquema de salida.
- Abstención en menús de herramientas o pipelines RAG: puede utilizarse como primer filtro para decidir si ninguna herramienta disponible aplica. La tasa de irrelevancia del 54,55 % aconseja combinarlo con reglas o un segundo modelo de verificación.
- Prototipado de agentes y pipelines de tool calling: sirve para experimentar localmente con adaptadores PEFT y comparar checkpoints SFT frente a SFT + GRPO sin depender de infraestructura grande.
- Generación de llamadas estructuradas en entornos con recursos limitados: al partir de un modelo de 0,5B, puede ejecutarse en CPU o en GPU de consumo para tareas de extracción de intención y formateo de argumentos.
- Evaluación de estrategias de post-entrenamiento: es útil como baseline reproducible para estudiar el efecto de GRPO sobre tool calling, abstención y rendimiento general en modelos pequeños.
- Clasificación de intenciones con salida JSON en soporte técnico acotado: puede mapear consultas en inglés a acciones predefinidas, siempre que se validen las respuestas y se limite el dominio de herramientas.
- Filtrado previo en sistemas de agentes: puede descartar llamadas inviables antes de invocar un modelo mayor, reduciendo coste y latencia en cascadas de modelos.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card. Las puntuaciones son porcentajes y corresponden a agregados específicos del estudio. xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud de nombre de función. La evaluación xLAM usa un holdout de solo llamadas con 2.287 ejemplos evaluados y 700 omitidos. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3; Relevance e Irrelevance corresponden a subconjuntos seleccionados. IFEval usa exactitud estricta a nivel de prompt.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 16.800 | 38,44 % | 18,40 % | 28,10 % | 81,29 % | 97,68 % | 56,02 % | 83,33 % | 67,47 % | 2,7 h |
| SFT + GRPO, este adaptador | GRPO 660 | 38,46 % | 15,60 % | 29,02 % | 81,90 % | 98,03 % | 57,42 % | 83,33 % | 54,55 % | 3,1 h |

GRPO mejora ligeramente MMLU, IFEval, xLAM ETC, xLAM FNA y BFCL single-turn, pero reduce MATH-500 de 18,40 % a 15,60 % y la métrica de irrelevancia de 67,47 % a 54,55 %. No se proporcionan resultados del modelo base sin adaptador ni comparaciones con otros adaptadores de tool calling.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 0,5B, los pesos en fp16 ocupan aproximadamente 1 GB; con overhead de runtime es razonable reservar entre 1,5 y 3 GB. En cuantización de 4 bits, los pesos bajan a aproximadamente 0,3-0,6 GB y el consumo total puede quedar en 1-2 GB, según implementación.
- El adaptador LoRA añade muy poco peso adicional; el requisito principal es cargar el modelo base Qwen2.5-0.5B-Instruct.
- GPU recomendadas: no requiere A100 ni H100. Es adecuado para RTX 3060, RTX 4060, RTX 4090 y GPUs de consumo con 4 GB o más de VRAM. También puede ejecutarse en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con al menos 4 GB de VRAM; en cuantización 4-bit puede funcionar en entornos aún más ajustados.
- Opciones de despliegue: Transformers + PEFT para cargar el adaptador; vLLM con soporte LoRA; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF; TGI si la configuración admite PEFT. No se proporcionan artefactos listos para Ollama ni GGUF en este repositorio.
- Latencia y throughput: no disponibles. Los tiempos publicados son de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en tool calling | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Este adaptador, SFT + GRPO | 0,5B base + LoRA | No verificado para el adaptador; hasta 128K en el base según la página de Ollama consultada | xLAM ETC 81,90 %; xLAM FNA 98,03 %; BFCL single-turn 57,42 % | No disponible | HuggingFace |
| Qwen2.5-0.5B-Instruct | 0,5B | Hasta 128K según la página de Ollama consultada, sin verificación adicional | No evaluado en esta ficha; sin especialización declarada en tool calling | No disponible en la información proporcionada | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace |

La comparación directa con alternativas especializadas en tool calling no está disponible en la información proporcionada. Qwen2.5-1.5B-Instruct se incluye como alternativa de mayor tamaño dentro de la misma familia, pero no se aportan métricas comparables.

## Limitaciones y advertencias

- La licencia no está especificada; no puede asumirse uso comercial sin consultar al autor y al modelo base.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Qwen2.5-0.5B-Instruct y la librería PEFT.
- El modelo se declara solo en inglés; no hay evaluación multilingüe de este adaptador.
- El tamaño de 0,5B implica capacidad limitada de razonamiento, conocimiento factual y matemáticas; MMLU 38,46 % y MATH-500 15,60 % son indicadores de un rendimiento modesto.
- El seguimiento de instrucciones es limitado: IFEval 29,02 % en exactitud estricta a nivel de prompt.
- GRPO mejora algunas métricas de tool calling, pero empeora MATH-500 y la métrica de irrelevancia; la abstención ante herramientas no relevantes sigue siendo baja, con 54,55 %.
- Los benchmarks son agregados específicos del estudio, obtenidos con scripts propios y subconjuntos seleccionados; no deben compararse directamente con resultados públicos de leaderboards sin recalcular.
- La evaluación xLAM omite 700 ejemplos del holdout, lo que puede afectar la representatividad.
- Riesgo de alucinación y de generar llamadas con argumentos inválidos; es necesario validar JSON, esquema y nombres de funciones antes de ejecutar acciones.
- No se documentan medidas de seguridad, sesgos o alineación adicionales; el comportamiento en dominios sensibles no está evaluado.
- No se confirma que el adaptador conserve la ventana de contexto de hasta 128K del modelo base; la información disponible no lo verifica.
- No dispone de visión, audio, modo thinking ni planificación multi-paso documentada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft16800-grpo660-lora)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Dataset xlam-tool-calling-mixed](https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed)
- [Adaptador SFT inicial](https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft16800-lora)
- [Repositorio Post-Training Lab](https://github.com/uygarkurt/post-training-lab)
- [Página de FriendliAI para el adaptador SFT](https://friendli.ai/models/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft16800-lora)
- [Qwen2.5 0.5B Instruct en Ollama](https://ollama.com/library/qwen2.5:0.5b-instruct)
