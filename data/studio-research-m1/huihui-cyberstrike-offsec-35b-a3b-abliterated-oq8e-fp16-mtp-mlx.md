# Studio-Research-M1/Huihui-CyberStrike-OffSec-35B-A3B-abliterated-oQ8e-FP16-MTP-MLX

## Resumen

Huihui-CyberStrike-OffSec-35B-A3B-abliterated-oQ8e-FP16-MTP-MLX es una cuantización de precisión mixta en formato MLX del modelo Huihui-CyberStrike-OffSec-35B-abliterated, publicado por Studio-Research-M1. El modelo subyacente es una versión "abliterated" (sin el mecanismo de rechazo) de oyildirim/CyberStrike-OffSec-35B, que a su vez es un fine-tune orientado a tool calling sobre Qwen/Qwen3.6-35B-A3B, un mixture-of-experts de aproximadamente 36.000 millones de parámetros totales con unos 3.000 millones activos por token.

El objetivo de esta publicación es ofrecer una versión optimizada para Apple Silicon que mantenga la calidad numérica del original en BF16 mientras acelera la inferencia. Según el autor, la cuantización oQ8e alcanza una divergencia KL media de 0,0036 frente a una referencia FP32, por debajo del 0,0054 que presentan los propios pesos BF16 originales, lo que la sitúa más cerca del modelo de referencia que el checkpoint sin cuantizar.

La relevancia actual reside en tres factores: el soporte nativo de MLX para Macs con memoria unificada, la conservación de la cabeza MTP (multi-token prediction) que aporta entre un 13 % y un 35 % de mejora en código según el autor, y la inclusión de la torre de visión en FP32. El modelo está orientado a seguridad ofensiva y tool calling, con licencia Apache 2.0 y capacidades multimodales imagen-texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con cabeza MTP y torre de visión, derivado de Qwen3.6-35B-A3B |
| Parámetros totales | ~36.000 millones (aproximadamente 36B) |
| Parámetros activos | ~3.000 millones por token (aproximadamente 3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ8e (precisión mixta, objeto de esta ficha); existe variante oQ4e en repositorio separado; pesos no cuantizados en BF16 y referencia FP32 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (librería mlx), con capas en FP16 y torre de visión en FP32 |
| Tamaño en disco | 39,5 GB (oQ8e); 22,5 GB (oQ4e) |
| Pipeline | image-text-to-text |
| Modelo base | huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo mixture-of-experts con aproximadamente 36.000 millones de parámetros totales y unos 3.000 millones activos por token, lo que reduce el coste computacional por token a pesar del tamaño del checkpoint. Sobre esta base, el modelo incorpora una cabeza MTP (multi-token prediction) que permite decodificación especulativa interna: el autor reporta tasas de aceptación del 95-96 % y mejoras de velocidad del 13 % (oQ4e) al 35 % (oQ8e) en generación de código. También incluye una torre de visión en FP32, lo que habilita la entrada de imágenes.

El linaje de entrenamiento parte de Qwen3.6-35B-A3B, sobre el que oyildirim aplicó un fine-tune de tool calling (CyberStrike-OffSec-35B). Posteriormente, huihui-ai publicó una versión abliterated que elimina el comportamiento de rechazo, y Studio-Research-M1 generó las cuantizaciones oQ en MLX. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en ninguna de las etapas. La cuantización oQ8e emplea precisión mixta; el autor valida la seguridad numérica de FP16 reportando 0 posiciones no finitas sobre 32.768 en WikiText-2, con activaciones que alcanzan picos en torno a 40 frente al límite de FP16 de 65.504.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable, que el autor recomienda mantener encendido para tool calling.
- Tool calling y function calling: 24/24 en el test de llamadas a funciones del autor cuando el razonamiento está activo.
- Capacidades multimodales imagen-texto gracias a la torre de visión incluida en FP32.
- Generación de código, con aceleración específica mediante la cabeza MTP (hasta 81 tok/s en código con oQ8e y MTP activo).
- Comportamiento "abliterated": ausencia del mecanismo de rechazo del modelo original, orientado a tareas de seguridad ofensiva.
- Soporte de decodificación especulativa mediante MTP (Lightning MTP en oMLX).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Automatización de flujos de pentesting asistido: el modelo puede razonar sobre reconocimiento, enumeración y explotación en entornos autorizados, con tool calling para invocar scripts y herramientas de seguridad; su naturaleza abliterated evita rechazos en consultas técnicas de seguridad ofensiva.
- Agentes de seguridad con razonamiento multi-paso: activando el modo thinking, el modelo encadena llamadas a herramientas de forma fiable (24/24 en el test del autor), adecuado para pipelines de análisis de vulnerabilidades.
- Análisis de capturas de pantalla o interfaces en tareas de reconocimiento: la torre de visión permite interpretar imágenes junto con texto, útil para documentar hallazgos o analizar paneles de administración.
- Asistencia a la generación de exploits y PoCs en laboratorio: con licencia Apache 2.0 y sin restricciones de rechazo, encaja en entornos de investigación de seguridad con fines educativos o de bug bounty autorizado.
- Desarrollo de herramientas de código en local sobre Apple Silicon: la cabeza MTP y la cuantización oQ8e ofrecen 81 tok/s en código con 95-96 % de aceptación, viable para asistentes de programación en Macs de 64 GB o más.
- Procesamiento de prompts largos en local: con prefill de 740-870 tok/s, un prompt de 16k tokens se procesa en unos 22 segundos, adecuado para análisis de documentación técnica extensa o logs.
- Despliegue de un agente de seguridad ofensiva en estación de trabajo aislada: al ejecutarse íntegramente en local con MLX, no requiere conectividad ni exposición de datos a servicios externos.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de cuantización y velocidad, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Métrica | oQ8e | oQ4e | Referencia |
|---|---|---|---|
| Divergencia KL media vs FP32 | 0,0036 | no disponible | BF16 original: 0,0054 |
| Velocidad de decodificación | 54 tok/s | 67 tok/s | — |
| Velocidad de decodificación en código con MTP | 81 tok/s | 95 tok/s | — |
| Mejora por MTP en código | +35 % | +13 % | — |
| Tasa de aceptación MTP | 95-96 % | 95-96 % | — |
| Prefill | 740-870 tok/s | 740-870 tok/s | — |
| Posiciones no finitas en FP16 (WikiText-2, 32.768 posiciones) | 0 | no disponible | — |
| Tool calling (test del autor) | 24/24 con thinking | no disponible | — |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 40 GB para oQ8e; aproximadamente 22,5 GB para oQ4e.
- Hardware objetivo: Apple Silicon. El autor probó ambas variantes en un M1 Max; recomienda oQ8e para Macs de 64 GB o más y oQ4e para Macs de 32-48 GB.
- No está pensado para GPU NVIDIA ni CUDA: el formato es MLX y la librería es mlx.
- Despliegue: runtime MLX con soporte oMLX (Lightning MTP); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Throughput medido en M1 Max: 54 tok/s de decodificación (oQ8e), 81 tok/s en código con MTP, 740-870 tok/s de prefill.
- Latencia de prefill: un prompt de 16k tokens se procesa en aproximadamente 22 segundos en M1 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (oQ8e) | ~36B | ~3B | no disponible | Apache 2.0 | MLX | Cuantización MLX para Apple Silicon, abliterated, visión, MTP |
| huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated | ~36B | ~3B | no disponible | Apache 2.0 (según modelo base) | safetensors/BF16 (presumible) | Modelo base sin cuantizar; sin optimización MLX |
| oyildirim/CyberStrike-OffSec-35B | ~36B | ~3B | no disponible | no disponible | no disponible | Fine-tune de tool calling previo a la abliteración |
| Qwen/Qwen3.6-35B-A3B | ~36B | ~3B | no disponible | no disponible | no disponible | Modelo original de Qwen; sin fine-tune de seguridad ofensiva ni abliteración |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated": se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido de seguridad ofensiva sin filtros. Requiere uso en entornos autorizados y con supervisión.
- Riesgo de alucinación en tool calling sin thinking: el autor advierte que, sin razonamiento activo, el modelo a veces inventa el resultado de una herramienta en lugar de invocarla. Es imprescindible mantener el modo thinking para agentes.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no especificada en la información disponible; no se puede confirmar el soporte de ventanas largas más allá de los ejemplos de 16k tokens del autor.
- Formato MLX exclusivo: no es desplegable en GPUs NVIDIA ni en la mayoría de stacks de servidor convencionales; limita su uso a Apple Silicon.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los intermedios pueden tener condiciones adicionales no detalladas; conviene verificar el linaje completo antes de producción.
- Sin benchmarks estándar publicados: no hay evidencia de rendimiento en MMLU, HumanEval o GSM8K para evaluar su calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.
- La cuantización oQ8e ocupa 39,5 GB, lo que excluye Macs de menos de 64 GB si se busca la máxima calidad.

## Enlaces

- HuggingFace (este repositorio, oQ8e): https://huggingface.co/Studio-Research-M1/Huihui-CyberStrike-OffSec-35B-A3B-abliterated-oQ8e-FP16-MTP-MLX
- HuggingFace (variante oQ4e): https://huggingface.co/Studio-Research-M1/Huihui-CyberStrike-OffSec-35B-A3B-abliterated-oQ4e-FP16-MTP-MLX
- Colección del autor: https://huggingface.co/collections/Studio-Research-M1/cyberstrike-35b-a3b-abliterated-oq-mlx-apple-silicon-6ae714be7b5be2d9910f30bc
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated
- Fine-tune de tool calling intermedio: https://huggingface.co/oyildirim/CyberStrike-OffSec-35B
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
