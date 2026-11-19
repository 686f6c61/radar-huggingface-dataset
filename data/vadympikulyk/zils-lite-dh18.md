# VadymPikulyk/zils-lite-dh18

## Resumen

zils-lite-dh18 es un modelo de decisión (decision model) de 852.985.920 parámetros construido sobre Qwen/Qwen3.5-0.8B y publicado por VadymPikulyk. Forma parte de Zils, un proyecto vinculado al subnet 127 de Bittensor, y se presenta como un "soup body" en el chasis d3-lite: es decir, una fusión de pesos (model soup) más tres adaptadores LoRA fusionados mediante aritmética de tareas. El resultado es un checkpoint en formato safetensors con arquitectura etiquetada como qwen3_5 y código personalizado (custom_code), lo que implica que su carga requiere confiar en el código del repositorio.

El modelo no es un asistente conversacional generalista, sino un componente especializado en emitir decisiones estructuradas en los formatos de petición del Jev Decision Index 0.2.1. Su entrenamiento combina tres ejes: lenguaje (comprensión de contratos, detección de sarcasmo, atribución de respuestas, inferencia de sentido común, análisis de sentimiento financiero, resumen), herramientas (cuándo invocar una función y con qué argumentos) y razonamiento (posiciones de ajedrez, problemas matemáticos de GSM8K, sesgos sociales de BBQ, razonamiento causal y narrativo). La relevancia actual reside en su enfoque de destilación sobre etiquetas mixtas y en su encaje en un pipeline de evaluación tipo subnet, más que en su rendimiento como modelo de propósito general.

El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, se publicó el 18 de noviembre de 2026 y ocupa 1,7 GB en el repositorio. La licencia es Apache-2.0, heredada de sus modelos padre, con la advertencia explícita de citar los datasets originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), etiqueta qwen3_5 con custom_code |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (los datasets de entrenamiento son mayoritariamente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código personalizado para la carga) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen3.5 con 852.985.920 parámetros, reempaquetado en el chasis d3-lite. Sobre el soup de partida (joamCriff123/zils-lite-l1117a, del 18 de noviembre de 2026) se aplican tres cambios de pesos LoRA fusionados con aritmética de tareas: 1,0 × un LoRA de lenguaje, 0,7 × un LoRA de herramientas y 0,5 × un LoRA de razonamiento. Cada LoRA tiene rango 64, se entrenó con learning rate 5e-5 durante una época mediante `python -m zils.teacher train`, y sus objetivos de entrenamiento fueron mixtos: 0,5 × la etiqueta gold + 0,5 × la respuesta del propio soup de partida, lo que constituye una forma de destilación con regularización hacia el modelo inicial.

Los datos de entrenamiento se limitan a splits de train (o fuentes proxy con licencia) y cubren tres bloques. Lenguaje: ContractNLI (CC BY 4.0), iSarcasmEval (MIT), RAGTruth sobre contextos CNN/DM y Recent News (MIT), WinoGrande (Apache-2.0 / CC BY), WANLI (CC BY 4.0), createdebate-arguments (CC BY 4.0), SEntFiN (MIT), NewsMTSC (MIT), financial_news_sentiment (MIT), RAGBench en sus subconjuntos covidqa, emanual, expertqa, finqa, pubmedqa, tatqa y techqa (CC BY 4.0), SummEdits en billsum, qmsumm, sales, scitldr y shakespeare (CC BY 4.0), CODAH (ODC-BY), además de los splits de train de VAST, NLI4CT 2024 y ACOS, cuyos publicadores no declaran licencia y que el autor usa bajo su propio criterio de investigación. Herramientas: When2Call con sus llamadas APIGen/xLAM (CC BY 4.0), xlam-irrelevance-7.5k (CC BY 4.0), apigen-function-calling (CC BY 4.0) y Seal-Tools (MIT / Apache-2.0). Razonamiento: posiciones en formato ChessBench de chessbench-full-policy-value (MIT), GSM8K train (MIT), BBQ (CC BY 4.0), StepGame (MIT), CaLM-Lite (Apache-2.0), causal-reasoning-benchmarks (MIT) y narrative-reasoning-training-pool (CC BY 4.0).

El autor declara haber eliminado las filas solapadas (coincidencia exacta, texto casi duplicado o documento fuente compartido) con cualquier ítem de test puntuado en el Decision Index, y afirma no haber usado ítems de exámenes de validadores, ítems públicos de exámenes semilla ni datos de clientes. No se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de decisiones estructuradas en los formatos de petición del Jev Decision Index 0.2.1, que es el propósito principal del checkpoint.
- Comprensión de lenguaje natural orientada a tareas de clasificación y juicio: inferencia de lenguaje natural (NLI), detección de contradicciones en contratos, análisis de sentimiento y sarcasmo.
- Atribución y verificación de respuestas frente a contextos recuperados (RAGTruth, RAGBench), útil para detectar alucinaciones en pipelines RAG.
- Evaluación de resúmenes (SummEdits) y comparación de textos largos.
- Tool calling y function calling: decisión de cuándo invocar una herramienta y generación de la llamada en formatos APIGen/xLAM, incluyendo el caso de irrelevancia (no invocar).
- Razonamiento multi-paso acotado: problemas aritméticos de GSM8K, posiciones de ajedrez, razonamiento causal y narrativo, y sesgos sociales de BBQ.
- Capacidades multilingües: no disponibles; los datasets de entrenamiento son predominantemente en inglés.
- Modo thinking, visión o audio: no disponibles en la información proporcionada, pese a que la model card menciona "language and vision weights" del fine-tune base sin detallar su uso.

## Casos de uso

- Validación de contratos y cláusulas: el modelo puede clasificar pares de premisa e hipótesis sobre texto contractual (entrenado con ContractNLI y NLI4CT) para señalar contradicciones entre cláusulas o entre un contrato y una política interna.
- Moderación de calidad en pipelines RAG: dado un contexto recuperado y una respuesta generada, el modelo emite un juicio de atribución (entrenado con RAGTruth y RAGBench) que permite descartar respuestas no sustentadas antes de mostrarlas al usuario.
- Enrutado de herramientas en agentes: integrado como clasificador previo, decide si una consulta requiere llamar a una API y genera los argumentos en formato APIGen/xLAM, reduciendo llamadas innecesarias gracias al entrenamiento con xlam-irrelevance.
- Análisis de sentimiento financiero por noticia: clasifica titulares y textos financieros (SEntFiN, NewsMTSC, financial_news_sentiment) para alimentar señales de trading o alertas de riesgo reputacional.
- Evaluación automática de resúmenes: compara un resumen candidato con el documento fuente (SummEdits) para detectar ediciones que alteran hechos, útil en sistemas de summarization a escala.
- Detección de sarcasmo y matices en redes sociales: clasificador auxiliar en herramientas de escucha social o análisis de opinión, entrenado con iSarcasmEval y CODAH.
- Componente de decisión en el subnet 127 de Bittensor: el checkpoint está pensado como "body" evaluable dentro del mecanismo de decisión de Zils, de modo que mineros y validadores pueden puntuar sus salidas con el Decision Index.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB para secuencias cortas.
- Cuantización a 8 bits: en torno a 0,9 GB de pesos; a 4 bits, en torno a 0,5 GB. No se publican GGUF oficiales, por lo que habría que generarlos a partir de los safetensors.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para inferencia en fp16; para lotes grandes o contexto largo, A100 o H100 aportan margen.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 0,85B parámetros.
- Opciones de despliegue: vLLM (el modelo base figura como origen del ecosistema d3-lite), llama.cpp u Ollama tras conversión a GGUF, y Transformers con `trust_remote_code=True` por el uso de custom_code. TGI no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-dh18 | 852.985.920 | no disponible | Apache-2.0 | Decision model especializado (Jev Decision Index 0.2.1) |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible en la información | Modelo base generalista de la familia Qwen3.5 |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 | Soup de partida del que deriva este checkpoint |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible | Chasis d3-lite usado como contenedor |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparación se limita a linaje, licencia y propósito.

## Limitaciones y advertencias

- Modelo especializado: no está diseñado como asistente conversacional general; su salida esperada son decisiones en un formato concreto del Jev Decision Index 0.2.1.
- Riesgo de alucinación en tareas abiertas: el entrenamiento se centró en clasificación y juicio sobre pares contexto-respuesta, no en generación libre de hechos.
- Idiomas: no se documenta soporte multilingüe; los datasets son casi exclusivamente en inglés, por lo que el rendimiento en castellano es incierto.
- Sesgos: el entrenamiento incluye BBQ y otros conjuntos de sesgo social, pero no se publican evaluaciones de sesgo del checkpoint final.
- Licencias de datasets: VAST, NLI4CT 2024 y ACOS no declaran licencia según el autor; su uso en entrenamiento puede plantear dudas para despliegues comerciales estrictos, aunque los pesos se distribuyan como Apache-2.0.
- Código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_*.py` antes de usarlo en producción.
- Sin validación externa: 0 descargas y 0 likes, sin benchmarks publicados ni evaluaciones de terceros; no hay evidencia independiente de su calidad.
- Fecha de creación futura respecto a los datos habituales de referencia (18 de noviembre de 2026): verificar la procedencia y el estado del repositorio antes de integrarlo.
- No se documentan cuantizaciones oficiales ni contexto máximo, lo que dificulta planificar despliegues con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh18
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Soup de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Chasis d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset xLAM irrelevance: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
- Dataset APIGen function calling: https://huggingface.co/datasets/argilla/apigen-function-calling
- Dataset ChessBench: https://huggingface.co/datasets/prdev/chessbench-full-policy-value
- Repositorio de benchmarks de razonamiento causal: https://huggingface.co/datasets/ludwigw/causal-reasoning-benchmarks
- Pool de razonamiento narrativo: https://huggingface.co/datasets/Emulated-Inc/narrative-reasoning-training-pool
