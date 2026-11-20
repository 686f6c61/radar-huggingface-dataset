# ukisai/Swift-1.5-Ornith-9B

## Resumen

Swift 1.5 Ornith 9B es un ajuste fino (finetune) del modelo base Ornith-1.5-9B, desarrollado por UkisAI. Su propuesta central es la eficiencia en el razonamiento: reduce el numero de tokens de "pensamiento" (thinking tokens) necesarios para resolver problemas, manteniendo o mejorando la precision en tareas de razonamiento complejo. Segun la model card, logra un 33,1% menos de tokens de pensamiento en mediana y una mejora de 1,52 puntos porcentuales en GPQA-Diamond respecto al modelo base.

El modelo se presenta como un derivado orientado a la eficiencia computacional en produccion, abordando el problema del "sobrepensamiento" patologico (overthinking) que afecta a muchos modelos de razonamiento: generar cadenas de pensamiento excesivamente largas sin ganancia de precision. La estrategia de entrenamiento no penaliza directamente la longitud del razonamiento, sino que identifica y penaliza los tokens asociados a ese sobrepensamiento, produciendo trazas de razonamiento mas compactas.

Con 9.653.104.368 parametros totales (segun los pesos en safetensors) y una pipeline declarada de image-text-to-text, el modelo esta etiquetado con el tag `qwen3_5`, lo que sugiere que hereda la arquitectura de la familia Qwen 3.5 a traves de su modelo base Ornith-1.5-9B. Se distribuye bajo licencia Apache 2.0 y esta disponible en formato transformers/safetensors, con una version GGUF publicada por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda de Ornith-1.5-9B; tag `qwen3_5`), pipeline image-text-to-text |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe repositorio GGUF separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio aparte |

## Arquitectura y entrenamiento

El modelo es un finetune del modelo base Ornith-1.5-9B, que a su vez se asocia a la arquitectura de la familia Qwen 3.5 (tag `qwen3_5`). La pipeline declarada es image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto, aunque la model card no detalla la arquitectura de vision ni el encoder utilizado. No se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones de inferencia.

El entrenamiento se centra en la eficiencia del razonamiento. Segun el autor, en lugar de penalizar directamente la longitud del razonamiento, se identificaron los tokens vinculados al sobrepensamiento patologico y se penalizaron, lo que produce trazas de pensamiento "comprimidas". Los datos de entrenamiento provienen del dataset `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, que no se usa directamente sino que se remuestrea y se convierte en entornos de RL. La model card menciona post-training con RL, aunque no detalla el algoritmo concreto (RLHF, DPO u otro) ni el numero de tokens de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos con modo de pensamiento (thinking) eficiente en tokens.
- Razonamiento matematico de competicion (evaluado en AIME 2024 y AIME 2026).
- Razonamiento cientifico de nivel experto (evaluado en GPQA-Diamond).
- Generacion de codigo (evaluado en LiveCodeBench v6).
- Seguimiento de instrucciones (evaluado en IFBench).
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text), aunque la model card no detalla las tareas de vision soportadas.
- Capacidades conversacionales y de agente multi-turno, dado el dataset de entrenamiento orientado a SFT de agentes multi-turno.
- Soporte de tool calling / function calling: no confirmado explicitamente en la model card.
- Idiomas soportados: no disponible.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede emplearse para resolver preguntas de nivel experto en fisica, quimica y biologia (GPQA-Diamond 84,51%), con la ventaja de consumir menos tokens de pensamiento que su base, lo que reduce coste por consulta en entornos de investigacion.
- Resolucion de problemas matematicos: adecuado para pipelines de verificacion y generacion de soluciones paso a paso en plataformas educativas, con un rendimiento del 93,33% en AIME 2024 y 90,67% en AIME 2026.
- Generacion de codigo en produccion: con un 56,91% en LiveCodeBench v6, puede integrarse en asistentes de programacion o revision de codigo, aunque la ausencia de confirmacion de tool calling limita su uso en pipelines automatizados complejos.
- Agentes conversacionales multi-turno: el dataset de entrenamiento esta orientado a SFT de agentes multi-turno, por lo que es adecuado para asistentes que mantienen contexto a lo largo de conversaciones largas.
- Evaluacion y benchmarking de eficiencia de razonamiento: util como referencia para estudiar tecnicas de compresion de cadenas de pensamiento y su impacto en precision.
- Procesamiento de documentos con imagenes: al ser un modelo image-text-to-text, puede emplearse para extraer y razonar sobre informacion contenida en capturas, diagramas o documentos escaneados, aunque las capacidades de vision no estan documentadas en detalle.
- Despliegue en entornos con restricciones de coste: la reduccion de tokens de pensamiento (hasta un 33,1% en mediana en GPQA-Diamond) lo hace atractivo para servicios de razonamiento a gran escala donde el coste por token es critico.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el modelo base Ornith-1.5-9B con Swift 1.5:

| Benchmark | Base | Swift 1.5 | Tokens medios base | Tokens medios Swift 1.5 | Reduccion mediana |
|---|---|---|---|---|---|
| GPQA-Diamond | 83,00% | 84,51% | 15.760 | 11.782 | 33,1% |
| IFBench | 42,60% | 40,47% | 13.409 | 10.790 | 24,7% |
| AIME 2026 | 92,67% | 90,67% | 37.872 | 35.460 | 29,2% |
| AIME 2024 | 94,00% | 93,33% | 20.776 | 17.266 | 12,2% |
| LiveCodeBench v6 | 59,20% | 56,91% | 41.057 | no disponible en el extracto | no disponible en el extracto |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con modelos de terceros (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB.
- Cuantizacion en 8 bits: aproximadamente 10-11 GB de VRAM, viable en GPUs consumer de gama alta.
- Cuantizacion en 4 bits (GGUF): aproximadamente 5-6 GB de VRAM, viable en GPUs consumer de gama media.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en precision completa con contexto largo; RTX 4090 (24 GB) para bf16 o cuantizacion 8 bits; RTX 3090, 4080 o inferiores para cuantizacion 4 bits.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp / Ollama a traves del repositorio GGUF publicado por el autor, y potencialmente vLLM o TGI si la arquitectura Qwen 3.5 esta soportada por dichos frameworks (no confirmado).
- Latencia y throughput: no disponibles. La reduccion de tokens de pensamiento (hasta 33,1% en mediana) implica una mejora proporcional en latencia y coste para tareas de razonamiento, pero no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA-Diamond | AIME 2024 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Swift 1.5 Ornith 9B | 9,65 B | no disponible | 84,51% | 93,33% | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Ornith-1.5-9B (base) | no disponible | no disponible | 83,00% | 94,00% | no disponible | Hugging Face |
| Qwen 3.5 (familia, tag de arquitectura) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer comparaciones adicionales con modelos de tamano similar.

## Limitaciones y advertencias

- Modelo etiquetado como "experimental" por el autor, lo que desaconseja su uso en produccion critica sin validacion exhaustiva.
- Ligera perdida de precision en varias tareas respecto al base: IFBench cae 2,13 puntos, AIME 2026 cae 2,00 puntos, AIME 2024 cae 0,67 puntos y LiveCodeBench v6 cae 2,29 puntos. La unica mejora es GPQA-Diamond (+1,52 puntos).
- La reduccion de tokens de pensamiento puede degradar el rendimiento en tareas que requieren razonamiento muy extenso o exploracion amplia de alternativas.
- No se documentan los sesgos conocidos del modelo ni los idiomas soportados, lo que dificulta evaluar su idoneidad para mercados no angloparlantes.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Longitud de contexto no documentada, lo que impide planificar despliegues con documentos largos.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el modelo base Ornith-1.5-9B podria tener condiciones adicionales no reflejadas en esta ficha; se recomienda verificar la licencia del modelo base.
- El dataset de entrenamiento es publico, pero su procedencia y posibles sesgos no se detallan.
- No se confirma soporte de tool calling ni de function calling, lo que limita su uso en arquitecturas de agentes automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B
- Version GGUF: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B-GGUF
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web del autor: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B/blob/main/LICENSE
