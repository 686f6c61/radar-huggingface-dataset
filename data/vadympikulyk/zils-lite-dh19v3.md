# VadymPikulyk/zils-lite-dh19v3

## Resumen

zils-lite-dh19v3 es un modelo de decisión derivado de Qwen/Qwen3.5-0.8B, publicado por VadymPikulyk dentro del ecosistema Zils (Bittensor subnet 127). No se trata de un modelo conversacional generalista, sino de un "soup body": un cuerpo de pesos destilado que se integra en el chasis d3-lite y que emite decisiones estructuradas en los formatos de petición del Jev Decision Index 0.2.1. Con 852.985.920 parámetros y un repositorio de 1,7 GB en safetensors, hereda la arquitectura del transformer denso de Qwen3.5-0.8B y añade una fusión LoRA sobre el soup precedente.

El modelo parte del soup del 18 de noviembre de 2026 (joamCriff123/zils-lite-l1117a) y aplica un único cambio de pesos LoRA fusionado (rango 64, lr 5e-5, una época, escala 1.0) entrenado sobre aproximadamente 74.500 filas que cubren decisiones de lenguaje, herramientas, razonamiento, recuperación y artes. Los objetivos de entrenamiento combinan un 0,8 de la etiqueta gold con un 0,2 de la respuesta del propio soup de partida, una formulación de destilación suave que busca preservar el comportamiento previo mientras se corrige hacia las etiquetas de referencia.

Su relevancia es acotada pero específica: sirve como pieza evaluable en un pipeline de subred descentralizada donde el modelo debe clasificar, decidir y responder en formatos de petición fijos, no como asistente abierto. La licencia Apache-2.0 facilita su reutilización, aunque la información pública sobre idiomas, benchmarks y rendimiento es prácticamente inexistente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-0.8B), integrado en chasis d3-lite |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo es un fine-tune denso de Qwen/Qwen3.5-0.8B reorganizado en el layout del chasis d3-lite, con código de carga personalizado (`custom_code`) y etiqueta de arquitectura `qwen3_5`. Sobre el soup de partida se aplicó una LoRA de rango 64 fusionada con escala 1.0, entrenada durante una época con learning rate 5e-5 mediante `python -m zils.teacher train`. El conjunto de entrenamiento ronda las 74.500 filas y se compone de cinco bloques: lenguaje (ContractNLI, iSarcasmEval, RAGTruth, WinoGrande, WANLI, createdebate-arguments, SEntFiN, NewsMTSC, RAGBench, SummEdits, CODAH, VAST, NLI4CT 2024, ACOS), herramientas (When2Call con llamadas APIGen/xLAM, xlam-irrelevance-7.5k, apigen-function-calling, Seal-Tools), razonamiento (ChessBench, GSM8K, BBQ, StepGame, CaLM-Lite, causal-reasoning-benchmarks, narrative-reasoning-training-pool), recuperación (BANKING77, CLINC150, Amazon ESCI, un dataset de phishing, DiffEmbed ReasonAug) y artes (Habermas Machine, limericks de Edward Lear con perturbaciones propias).

La innovación técnica principal es el esquema de destilación: cada objetivo se construye como 0,8 × etiqueta gold + 0,2 × respuesta del soup de partida, lo que actúa como regularización hacia el comportamiento anterior y reduce el olvido catastrófico en un ajuste de una sola época. Las decisiones se renderizan en los formatos de petición del Jev Decision Index 0.2.1 y solo se usan splits de entrenamiento (o proxies con licencia). El autor declara haber eliminado filas solapadas —por coincidencia exacta, near-duplicate o documento fuente compartido— con cualquier ítem de test puntuado del Decision Index, y afirma no haber usado exámenes de validadores, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Emisión de decisiones estructuradas en los formatos de petición del Jev Decision Index 0.2.1.
- Clasificación y juicio sobre pares de frases y documentos: inferencia de lenguaje natural (ContractNLI, WANLI, NLI4CT), detección de sarcasmo (iSarcasmEval) y sentido común (WinoGrande, CODAH).
- Evaluación de fidelidad y atribución en respuestas generadas (RAGTruth, RAGBench en dominios covidqa, emanual, expertqa, finqa, pubmedqa, tatqa y techqa).
- Análisis de sentimiento financiero y de noticias (SEntFiN, NewsMTSC, financial_news_sentiment).
- Detección de errores en resúmenes (SummEdits sobre billsum, qmsumm, sales, scitldr y shakespeare).
- Tool calling y function calling: decisión de cuándo invocar una herramienta (When2Call), selección de llamadas (APIGen/xLAM, apigen-function-calling) y manejo de irrelevancia (xlam-irrelevance-7.5k, Seal-Tools).
- Razonamiento simbólico y de sentido común de cadena corta: GSM8K, BBQ, StepGame, CaLM-Lite y benchmarks de razonamiento causal y narrativo.
- Clasificación de intenciones y consultas: BANKING77, CLINC150 y consultas de compra de Amazon ESCI.
- Detección de phishing en correo electrónico.
- Tareas de "artes": opinión y consenso estilo Habermas Machine y generación de limericks.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Vision: la model card menciona "language and vision weights" del fine-tune base, pero no se detalla ningún módulo de visión propio ni resolución de imagen.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: usar BANKING77 y CLINC150 como referencia para clasificar la intención de un mensaje entrante y derivarlo al flujo adecuado; el modelo está entrenado específicamente en esas taxonomías.
- Verificación de fidelidad en pipelines RAG: dado un contexto y una respuesta generada, el modelo puede puntuar si la respuesta se sostiene en el contexto, apoyándose en el entrenamiento con RAGTruth y RAGBench en dominios médicos, financieros y técnicos.
- Decisión de invocación de herramientas en agentes: integrar el modelo como "router" que decide si una petición requiere llamar a una API y con qué argumentos, usando el entrenamiento en When2Call y xLAM para reducir llamadas innecesarias.
- Moderación de sesgo y sentido común: aplicar el modelo como filtro de respuestas que incurren en sesgos sociales o violaciones de sentido común, aprovechando el entrenamiento en BBQ y WinoGrande.
- Análisis de sentimiento en noticias financieras: procesar titulares y párrafos para extraer polaridad y entidades, con el respaldo de SEntFiN, NewsMTSC y financial_news_sentiment.
- Detección de phishing en correo corporativo: clasificar mensajes sospechosos con el dataset de phishing incluido en el bloque de recuperación, como primera capa antes de un análisis más profundo.
- Evaluación de resúmenes en producción: comprobar si un resumen generado introduce errores respecto al documento fuente, usando SummEdits como referencia de entrenamiento.
- Participación en la subred Bittensor 127 (Zils): desplegar el modelo como cuerpo evaluable en el chasis d3-lite para emitir decisiones en el formato exigido por el Jev Decision Index 0.2.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2,5 y 4 GB según longitud de contexto.
- Cuantización a 8 bits: alrededor de 0,9 GB de pesos; a 4 bits, alrededor de 0,5 GB. Los formatos de cuantización concretos no están documentados por el autor.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente en BF16; para despliegue en servidor, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe holgadamente en GPU consumer; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: al requerir `custom_code` y layout d3-lite, la carga estándar en vLLM, llama.cpp u Ollama no está garantizada; el autor referencia `zils.teacher` y el ecosistema Zils. La conversión a GGUF no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-dh19v3 | 853 M | no disponible | Apache-2.0 | Modelo de decisión destilado sobre chasis d3-lite |
| Qwen/Qwen3.5-0.8B | ~800 M | no disponible | no disponible en esta ficha | LLM base generalista |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 | Soup predecesor del que deriva este modelo |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible en esta ficha | Chasis/base del ecosistema d3-lite |

La comparación con alternativas generalistas de tamaño similar (Qwen3.5-0.8B, Llama 3.2 1B, Gemma 2 2B) no es directa: zils-lite-dh19v3 está especializado en emitir decisiones en un formato propietario y no se han publicado métricas que permitan situarlo frente a esos modelos en tareas abiertas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Idiomas no declarados: no se puede asumir soporte multilingüe más allá de lo que herede de Qwen3.5-0.8B, que tampoco se detalla.
- Longitud de contexto no documentada: limita su uso en tareas de contexto largo sin verificación previa.
- Dependencia de `custom_code` y del layout d3-lite: la carga con herramientas estándar (vLLM, TGI, llama.cpp, Ollama) puede fallar o requerir adaptadores específicos del ecosistema Zils.
- Riesgo de alucinación inherente a un modelo de 0,8 B: no debe usarse como fuente de verdad sin verificación externa.
- Sesgos: el entrenamiento incluye datasets de sesgo (BBQ) y fuentes de debate (createdebate-arguments, Habermas Machine), pero no se documenta ninguna evaluación de sesgo del modelo resultante.
- Procedencia de datos: algunos datasets (VAST, NLI4CT 2024, ACOS) no declaran licencia y el autor los usa "for research on the owner's decision"; esto puede ser un riesgo legal en despliegues comerciales pese a la licencia Apache-2.0 del modelo.
- Fecha de creación futura (2026-11-19) y cero descargas: no hay evidencia de uso en producción ni validación comunitaria.
- El objetivo de destilación 0,8/0,2 puede hacer que el modelo reproduzca errores del soup de partida en lugar de corregirlos.
- Sin datos de clientes ni ítems de examen según el autor, pero esta afirmación no es verificable de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh19v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Soup de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Chasis d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset xLAM irrelevance: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
- Dataset APIGen function calling: https://huggingface.co/datasets/argilla/apigen-function-calling
- Dataset ChessBench: https://huggingface.co/datasets/prdev/chessbench-full-policy-value
- Dataset causal reasoning benchmarks: https://huggingface.co/datasets/ludwigw/causal-reasoning-benchmarks
- Dataset narrative reasoning: https://huggingface.co/datasets/Emulated-Inc/narrative-reasoning-training-pool
- Dataset phishing: https://huggingface.co/datasets/Dizzzy0x00/LLMGen-Phishing-Email-Dataset
- Dataset sentimiento financiero: https://huggingface.co/datasets/Jean-Baptiste/financial_news_sentiment
- Paper de referencia del chasis (no confirmado): no disponible
- Repositorio del ecosistema Zils: no disponible
- Demos: no disponible
