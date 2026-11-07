# yamahei21/huihui-qwen3.5-9b-int4-rht-rtn

## Resumen

Huihui Qwen3.5-9B INT4 (RHT + Group32 RTN) es un checkpoint experimental publicado por el usuario yamahei21 en Hugging Face. Se trata de una versión cuantizada a INT4 del modelo `huihui-ai/Huihui-Qwen3.5-9B-Claude-4.6-Opus-abliterated`, un derivado "abliterated" (con los rechazos eliminados) de la familia Qwen3.5 de 9B. La cuantización emplea una transformación de Hadamard aleatorizada (RHT) combinada con cuantización asimétrica INT4 por grupos de 32 (RTN, round-to-nearest), y está pensada para ejecutarse con el runtime `uzu`/`lalamo`.

El modelo base declara 32 capas, dimensión oculta de 4096 y embeddings y `lm_head` no atados. El checkpoint cuantizado contiene 4.899.313.664 parámetros almacenados y ocupa unos 5,19 GB en `model.safetensors`. La relevancia actual es limitada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin licencia especificada en los metadatos y sin resultados de benchmarks publicados.

La model card es explícita sobre su estado: es experimental, no está ajustado a instrucciones después de la cuantización y todavía no se han aplicado las técnicas YAQA/QAD del autor. Por tanto, debe considerarse un prototipo de inferencia local de bajo consumo más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5), 32 capas, hidden 4096, embedding y lm_head no atados |
| Parámetros totales | 4.899.313.664 (parámetros almacenados en safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 asimétrica por grupos de 32 con RHT (Hadamard block 32); embedding INT4 (RHT solo en salida); lm_head INT4 (RHT solo en entrada); normas en BF16/F32 |
| Idiomas soportados | no disponible en metadatos; la model card reporta pruebas en inglés (EN) y japonés (JA) |
| Licencia | no disponible en metadatos; la model card indica que sigue la licencia del modelo base y los términos de Qwen3.5 |
| Formato de pesos | safetensors (tag adicional "8-bit" en Hugging Face, aunque la cuantización descrita es INT4) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 32 capas con dimensión oculta 4096, derivado del checkpoint `huihui-ai/Huihui-Qwen3.5-9B-Claude-4.6-Opus-abliterated`, que a su vez parte de Qwen3.5-9B. La model card no aporta detalles sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO; solo indica que es un derivado "abliterated", es decir, con el comportamiento de rechazo atenuado respecto al modelo original.

La innovación técnica del checkpoint es la cuantización: transformación RHT (Hadamard aleatorizada) con bloques de 32 aplicada en modo input_output sobre las capas lineales, seguida de cuantización asimétrica INT4 con grupos de 32 y layout output_input. El embedding de entrada usa RHT solo en la salida y el `lm_head`/readout usa RHT solo en la entrada. Las capas de normalización se conservan en BF16/F32. El autor indica que esta versión es "RTN only" y que las técnicas YAQA/QAD aún no se han aplicado, por lo que se trata de una etapa intermedia de su pipeline de cuantización. Se referencia el commit `e401e17761f2fcd337b0cf20218d67d656e6ecba` de lalamo y el commit `fa0aa23d` de uzu.

## Capacidades

- Generación de texto autoregresiva en el modelo base (Qwen3.5-9B abliterated); no se documentan capacidades específicas adicionales en la model card.
- Razonamiento y código: heredadas del modelo base Qwen3.5, pero no verificadas ni documentadas en este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas en metadatos; la model card solo reporta pruebas cualitativas en inglés y japonés.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local de bajo consumo mediante el runtime `uzu` (CLI con `uzu cli --model ... -m "..."`).

## Casos de uso

- Inferencia local en hardware de gama de entrada: el checkpoint ocupa ~4,95 GB en memoria durante la ejecución medida en un Apple M3 de 16 GB, lo que permite probar un modelo de ~9B en un portátil sin GPU dedicada.
- Evaluación de técnicas de cuantización: sirve como referencia para comparar RHT + INT4 group-32 (RTN) frente a otras variantes (GPTQ, AWQ, YAQA/QAD) en términos de perplejidad y calidad de generación.
- Investigación sobre modelos "abliterated": permite estudiar el comportamiento de un modelo sin rechazos en entornos controlados y con recursos limitados.
- Prototipado de asistentes conversacionales en inglés y japonés: la model card reporta TTFT de 0,26-0,27 s y velocidades de generación de 6,28 t/s (EN) y 11,47 t/s (JA) en M3, suficiente para demos interactivas.
- Pruebas de integración del runtime uzu/lalamo: útil para validar pipelines de descarga, carga y ejecución de pesos INT4 con RHT antes de adoptar el stack en producción.
- Docencia y experimentación con cuantización post-entrenamiento: el repo incluye un `provenance.json` que documenta el proceso, lo que facilita reproducir y explicar el flujo de cuantización en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de inferencia medidas en un Apple M3 de 16 GB:

| Métrica (M3 16 GB) | Inglés (EN) | Japonés (JA) |
|---|---|---|
| TTFT | 0,26 s | 0,27 s |
| Prefill | 68,8 t/s | 63,0 t/s |
| Generación | 6,28 t/s | 11,47 t/s |
| Memoria | 4,95 GB | 4,96 GB |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~4,95 GB en el runtime uzu (medido en M3 de 16 GB); el repo pesa 5,2 GB.
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo reporta pruebas en Apple Silicon (M3).
- ¿Cabe en GPU de consumo? Sí, por tamaño (≈5 GB), cabría en GPUs con 6-8 GB de VRAM o más (p. ej. RTX 3060, RTX 4060, RTX 4090), aunque no se han publicado pruebas en estas.
- Opciones de despliegue: runtime `uzu`/`lalamo` (el autor proporciona comandos `hf download` y `uzu cli`). No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado el formato INT4 con RHT específico.
- Latencia y throughput: TTFT 0,26-0,27 s; prefill 63-69 t/s; generación 6,28 t/s (EN) y 11,47 t/s (JA) en M3 16 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yamahei21/huihui-qwen3.5-9b-int4-rht-rtn | 4.899.313.664 almacenados | no disponible | INT4 RHT + group-32 RTN | no disponible (sigue base y Qwen3.5) | Hugging Face, 0 descargas |
| Advantech-EIOT/intel_qwen-qwen3.5-9b-int4 | no disponible | no disponible | INT4 (OpenVINO GenAI) | no disponible | Hugging Face, orientado a edge Intel |
| huihui-ai/Huihui-Qwen3.5-9B-Claude-4.6-Opus-abliterated | ~9B (modelo base) | no disponible | BF16 original | no disponible | Hugging Face (modelo base) |

Los tres comparten la base Qwen3.5-9B; las diferencias principales son el runtime objetivo (uzu/lalamo frente a OpenVINO) y el esquema de cuantización. No se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal; no está ajustado a instrucciones tras la cuantización.
- Sin YAQA/QAD: la cuantización es solo RTN, por lo que la degradación de calidad respecto al base puede ser mayor que en variantes con ajuste posterior.
- Errores factuales en japonés atribuidos al modelo base, no necesariamente a la cuantización, según la model card.
- Riesgo de alucinación: inherente a modelos de ~9B y agravado por la cuantización agresiva a INT4 y por el carácter "abliterated" del base.
- Licencia no declarada en metadatos: la model card remite a la licencia del modelo base y a los términos de Qwen3.5; verificar antes de cualquier uso comercial.
- Idiomas no declarados oficialmente; solo se documentan pruebas en EN y JA.
- Contexto no documentado: se desconoce la longitud máxima soportada en este checkpoint.
- Compatibilidad limitada: el formato INT4 con RHT está pensado para uzu/lalamo; no se garantiza su carga en otros runners.
- Sin tracción comunitaria (0 descargas, 0 likes) ni benchmarks publicados; no apto para producción sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/yamahei21/huihui-qwen3.5-9b-int4-rht-rtn
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-Claude-4.6-Opus-abliterated
- Organización huihui-ai: https://huggingface.co/huihui-ai
- Alternativa INT4 para Intel (OpenVINO): https://huggingface.co/Advantech-EIOT/intel_qwen-qwen3.5-9b-int4
- Repositorios de los runtimes: no disponibles en la información proporcionada (se referencian los commits de lalamo `e401e17761f2fcd337b0cf20218d67d656e6ecba` y uzu `fa0aa23d`).
