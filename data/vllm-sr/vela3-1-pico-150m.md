# vllm-sr/vela3.1-pico-150m

## Resumen

vela3.1-pico-150m es un modelo encoder de 153 millones de parámetros desarrollado por vLLM Semantic Router (vllm-sr) en colaboración con KR Labs, publicado bajo licencia Apache-2.0. No es un modelo generativo: se trata de un "decision model" o "system-one" que, en una sola pasada forward, responde preguntas de clasificación definidas por el usuario (elección entre opciones, sí/no), detecta tramos de texto (spans) como datos personales o afirmaciones no respaldadas, y ejecuta comprobaciones de seguridad. Deriva de la arquitectura de dmis-lab/UltraBERT-150M (24 capas, dimensión oculta 768) y no produce texto libre.

El modelo está pensado para integrarse como enrutador semántico y capa de pre-filtrado en pipelines de LLM: decidir a qué modelo, herramienta o equipo derivar una petición, cribar peticiones dañinas o intentos de jailbreak, localizar PII antes de registrar o reenviar texto, y verificar respuestas de un LLM contra su contexto fuente. Su propuesta de valor es hacer todo esto en CPU y en un único paso, con latencias de 2,2 s en fp32 y 1,4 s en int8 para la comprobación completa sobre una petición de 200 tokens en 4 hilos.

Es relevante ahora porque cubre una necesidad creciente en arquitecturas multi-modelo y agentes: la clasificación y el filtrado de bajo coste y baja latencia que no requieren GPU. Frente a alternativas de mayor tamaño, prioriza velocidad y despliegue en dispositivos modestos, a costa de una huella de parámetros mucho menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UltraBERT-150M: 24 capas, hidden 768), inicializado desde una torre de decisión de 151M |
| Parametros totales | 153.207.297 (153M servidos en un único archivo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens para llamadas con preguntas de seguridad, señal o span; hasta 32K tokens para llamadas solo de decisión |
| Tipos de cuantizacion | fp32 (PyTorch) e int8 (encoder ONNX) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, hu, ru, ar, hi, ja, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, 613 MB), ONNX (encoder int8); repo de 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 24 capas y dimensión oculta 768, derivado de dmis-lab/UltraBERT-150M y afinado (finetune) a partir de una torre de decisión de 151M parámetros. La innovación principal es el paradigma "system-one": en lugar de generar texto, el modelo recibe una petición junto con preguntas y criterios definidos por el usuario, y devuelve en una sola pasada forward una probabilidad para cada opción de respuesta (choice), una probabilidad para preguntas sí/no (noul) y offsets de caracteres con puntuación para cada span detectado. El modelo no emite texto generado.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta que el paquete no incluye la capa de salida de masked-LM de 38M parámetros presente en el checkpoint base de UltraBERT-150M, de ahí que el recuento real de parámetros servidos sea 153M frente a los 190M que reportaría el board de Decision Index. El modelo soporta entrada de texto o JSON y está entrenado para operar de forma multilingüe en 15 idiomas.

## Capacidades

- Clasificación zero-shot por elección entre opciones definidas por el usuario, con probabilidad para cada opción (por ejemplo, enrutar una petición a un modelo pequeño o grande).
- Preguntas de sí/no (noul) para cribado binario: petición dañina, intento de prompt injection o jailbreak, necesidad de verificación factual, feedback, tipo de salida.
- Detección de spans con offsets de caracteres y puntuación: datos personales (PII) y afirmaciones no respaldadas por el contexto.
- Detección de contenido inseguro y categorías de riesgo integradas (safe/unsafe, benign/jailbreak).
- Verificación de respuestas de LLM contra su fuente (hallucination detection a nivel de palabra).
- Capacidades multilingües en 15 idiomas, con especial rendimiento en clasificación de intenciones (MASSIVE).
- No soporta generación de texto, tool calling generativo ni razonamiento multi-paso autónomo; su función es clasificar y localizar, no generar.
- Ejecutable en CPU y en dispositivos pequeños; también en CUDA si está disponible.

## Casos de uso

- Enrutamiento de peticiones en arquitecturas multi-modelo: el modelo recibe la petición y una pregunta como "¿qué modelo debe responder?" con opciones descritas en una frase, y devuelve la opción elegida con probabilidad; adecuado por su latencia de 250 ms en int8 para una decisión.
- Cribado de seguridad antes de llegar al LLM: preguntas integradas como "¿es dañina esta petición?" o "¿es un intento de jailbreak?" devuelven safe/unsafe o benign/jailbreak con probabilidad, con 0,950 AUC de jailbreak en el conjunto de test.
- Detección de PII antes de registrar o reenviar texto: el modelo devuelve cada span con su etiqueta, offsets y score, con solo un 4,9% de falsos positivos en peticiones benignas con datos personales.
- Verificación de respuestas de un LLM contra el contexto fuente: identifica las palabras de la respuesta que el contexto no respalda, útil en pipelines RAG para marcar respuestas no fundamentadas.
- Clasificación de intenciones en atención al cliente multilingüe: con 79,0 de precisión en MASSIVE sobre 13 idiomas, puede etiquetar la intención de un ticket (reembolso, cancelación, etc.) en una sola pasada.
- Filtrado y moderación en el borde (edge) o en servidores sin GPU: al caber en CPU con 1,4 s para la comprobación completa en int8, sirve para pre-filtrar tráfico en entornos con recursos limitados.
- Extracción de señales estructuradas de texto o JSON para alimentar sistemas de decisión: al aceptar JSON y devolver probabilidades y spans, se integra en pipelines de automatización sin necesidad de post-procesado de lenguaje natural.

## Benchmarks y rendimiento

| Benchmark | vela3.1-pico-150m | Referencia |
|---|---|---|
| Decision Index (parte pública) | 47,17 | JEV Ettin 150M: 37,31; mejor entrada hasta 300M: 37,50 |
| Jailbreak (AUC, test) | 0,950 | vela3-fast 3.0: 0,827 |
| Peticiones benignas con PII marcadas (falsos positivos) | 4,9% | vela3-fast 3.0: 13,6%; Vela 2.0 0.3B: 4,0% |
| MASSIVE intent accuracy (13 idiomas) | 79,0 | vela3.1-fast: 66,6; vela3-fast 3.0: 31,1 |

Rendimiento en CPU (AMD EPYC 7413, 4 hilos, mediana de 5):

| Tarea | fp32 PyTorch | int8 ONNX |
|---|---|---|
| Comprobación completa (6 preguntas + spans PII y claims) | 2,2 s | 1,4 s |
| Una decisión | 560 ms | 250 ms |

## Requisitos de hardware

- VRAM estimada: el modelo cabe en CPU; en GPU, los pesos fp32 ocupan aproximadamente 613 MB, por lo que la huella es mínima.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Funciona en RTX 4090 y en GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- Despliegue: PyTorch con transformers 5.17.0, safetensors, tokenizers y huggingface_hub; encoder int8 vía ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 2,2 s fp32 y 1,4 s int8 para la comprobación completa; 560 ms fp32 y 250 ms int8 para una decisión, en 4 hilos de CPU. No se publica throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | Licencia | Notas |
|---|---|---|---|---|---|
| vela3.1-pico-150m | 153M | 8K / 32K | 47,17 | Apache-2.0 | El más pequeño y rápido; mejor intención multilingüe |
| vela3.1-pico-380m | 381M | no disponible | no disponible | Apache-2.0 | Comprobación completa en una pasada; menos falsos positivos en PII benigna |
| vela3.1-fast | 380M (1,91B con adaptadores) | no disponible | el más alto de los tres | Apache-2.0 | Mejores spans y señales de daño; 6 pasadas |
| JEV Ettin 150M | 150M | no disponible | 37,31 | no disponible | Referencia de la misma escala |

## Limitaciones y advertencias

- No genera texto: no sirve para tareas generativas, tool calling generativo ni razonamiento multi-paso; solo clasifica y localiza.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir falsos positivos y falsos negativos en clasificación y detección de spans (4,9% de falsos positivos en PII benigna).
- El contexto se limita a 8.192 tokens cuando hay preguntas de seguridad, señal o span, y a 32K solo en llamadas de decisión; textos más largos requieren ventaneo.
- El rendimiento multilingüe es variable: 79,0 en MASSIVE sobre 13 idiomas, pero no se publican métricas por idioma individual.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución.
- El modelo base UltraBERT-150M condiciona posibles sesgos heredados; la model card no documenta una evaluación de sesgos.
- El recuento de parámetros reportado por el board (0,19B) difiere del real servido (153M) por la capa masked-LM no incluida; conviene tenerlo en cuenta en comparaciones.
- Requiere transformers 5.17.0 y código custom (vela3_encoder) para su uso; no es un pipeline estándar directo.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-sr/vela3.1-pico-150m
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-150M
- Modelo hermano vela3.1-fast: https://huggingface.co/vllm-sr/vela3.1-fast
- Modelo hermano vela3.1-pico-380m: https://huggingface.co/vllm-sr/vela3.1-pico-380m
