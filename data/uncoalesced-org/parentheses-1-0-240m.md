# uncoalesced-org/parentheses-1.0-240M

## Resumen

parentheses-1.0-240M (Project Tanzanite) es un modelo de lenguaje compacto de tipo State Space Model (SSM) recurrente, desarrollado desde cero por el autor independiente uncoalesced. Con 253.544.176 parámetros únicos, emplea una arquitectura de atención lineal selectiva denominada `slab_v4` (State Space Duality / SSD), inspirada en Mamba-2 y RWKV, y está orientado explícitamente a inferencia en el borde (edge AI) con memoria constante. El modelo se entrenó en una única GPU RTX 5050 Laptop de 8 GB, lo que lo sitúa en la frontera de escalado "ancho y poco profundo" para hardware de consumo.

El problema que aborda es la inferencia de bajo coste en dispositivos con recursos limitados: su estado recurrente ocupa 4,85 MB en fp32 y no crece con la longitud de la secuencia (O(1)), lo que permite generación de documentos largos sin aumento de memoria. Está dirigido a aceleradores NPU (AMD Ryzen AI / DirectML) mediante un grafo ONNX recurrente de forma estática inferior a 1,15 GB.

Su relevancia actual radica en dos factores: por un lado, la especialización en lenguas dravídicas (canarés, tamil, telugu, malayalam) junto con el inglés y varias lenguas minoritarias (tulu, kodava, nicobarese), un nicho poco cubierto por modelos pequeños; por otro, su orientación declarada a detección de alucinaciones y generación de comandos de terminal. La licencia Apache 2.0 para los pesos y MIT para el código facilita su uso comercial y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM recurrente con atención lineal selectiva (State Space Duality / `slab_v4`), 16 bloques uniformes con Token-Shift y SwiGLU |
| Parametros totales | 253.544.176 (~253,54 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (`block_size`); estabilidad verificada hasta 16.384 tokens en generación recurrente |
| Tipos de cuantizacion | no disponible (la model card no detalla formatos de cuantización publicados) |
| Idiomas soportados | kn, ta, te, ml, en, tcy, kff, kxv, nit |
| Licencia | Apache 2.0 (pesos); MIT (código) |
| Formato de pesos | safetensors; grafo ONNX recurrente para DirectML (según model card) |

## Arquitectura y entrenamiento

El modelo es un transformer recurrente de tipo SSM con 16 capas uniformes, dimensión de embedding de 1024, 16 cabezas de atención lineal selectiva con dimensión de cabeza 64 y anchura SwiGLU de 2752 (aproximadamente 8/3 de la dimensión del modelo, sin sesgos). La dimensión de cabeza de 64 está alineada con el tamaño de chunk asociativo C=64 de la atención lineal selectiva, y cada capa mantiene un rango de 1024. El vocabulario es de 32.768 tokens con Byte-Level BPE (`v3_32k`), regex preservadora de aksharas y 256 slots de tokens especiales, lo que explica su cobertura de escrituras dravídicas.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card sí indica que el entrenamiento se realizó en una única RTX 5050 Laptop de 8 GB, lo que condiciona el presupuesto de cómputo y probablemente el volumen de datos. La innovación técnica principal es la inferencia de memoria constante: el estado recurrente no crece con la longitud de secuencia, lo que habilita generación de documentos largos en hardware de borde y un grafo ONNX de forma estática para NPU.

## Capacidades

- Generación de texto autoregresiva con contexto de 4.096 tokens y estabilidad verificada hasta 16.384 tokens en generación recurrente.
- Generación de comandos de terminal y scripts Bash, con resultados destacados en TerminalBench (78,33% en el mejor caso).
- Síntesis de funciones Python, evaluada en MBPP (90,67% en el mejor caso con temperatura 0).
- Detección de alucinaciones y veracidad factual, evaluada en HaluEval QA (80,00%) y TruthfulQA (91,00%).
- Comprensión lectora nativa en lenguas dravídicas (canarés, tamil, telugu, malayalam), evaluada en Belebele Dravidian.
- Capacidades multilingües limitadas al conjunto de idiomas declarado (dravídico, inglés y lenguas minoritarias del subcontinente).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente de terminal en el borde: el modelo puede generar y corregir comandos Bash en un portátil o dispositivo con NPU AMD Ryzen AI, con un grafo ONNX de menos de 1,15 GB y memoria constante, lo que lo hace adecuado para herramientas de línea de comandos sin conexión.
- Detección de alucinaciones en pipelines de validación: con resultados de 80% en HaluEval QA y 91% en TruthfulQA, puede emplearse como clasificador de grounding o filtro de respuestas en sistemas de recuperación aumentada, ejecutándose junto al modelo principal en el mismo dispositivo.
- Soporte lingüístico para lenguas dravídicas: generación y comprensión de texto en canarés, tamil, telugu y malayalam en aplicaciones móviles o de escritorio, aprovechando el vocabulario BPE preservador de aksharas y el bajo consumo de memoria.
- Autocompletado de código Python en editores locales: con 90,67% en MBPP en modo greedy, puede integrarse como modelo de completado de funciones en IDE con recursos limitados, sin depender de la nube.
- Procesamiento de documentos largos en dispositivos: gracias a la memoria O(1) y la estabilidad hasta 16.384 tokens, puede resumir o extraer información de documentos extensos en hardware de consumo, donde un transformer denso equivalente agotaría la VRAM.
- Prototipado e investigación en arquitecturas SSM: al ser un modelo pequeño, entrenado desde cero y con pesos Apache 2.0, sirve como banco de pruebas para experimentos de atención lineal selectiva, decodificación recurrente y despliegue en NPU.
- Filtrado y moderación de contenido multilingüe: su cobertura de lenguas minoritarias (tulu, kodava, nicobarese) permite clasificar texto en comunidades lingüísticas desatendidas por modelos comerciales.

## Benchmarks y rendimiento

Resultados publicados en la model card (9 benchmarks, 4 ejecuciones cada uno; ejecución 1 con T=0,0 y ejecuciones 2 a 4 con T=0,7 y semillas distintas):

| Benchmark | Mejor resultado | Media | Dominio |
|---|---:|---:|---|
| TerminalBench | 78,33% | 74,16% | Generación de CLI y Bash |
| TruthfulQA | 91,00% | 90,00% | Veracidad factual |
| MBPP | 90,67% | 81,92% | Síntesis de funciones Python |
| HaluEval QA | 80,00% | 78,34% | Detección de alucinaciones |
| MMLU | 50,00% | 30,00% | Conocimiento académico |
| HellaSwag | 33,33% | 24,16% | Sentido común / continuación |
| ARC-Challenge | 26,67% | 16,67% | Razonamiento científico |
| Belebele Dravidian | 25,00% | 17,18% | Lectura en lenguas dravídicas |
| GSM8K | 10,00% | 5,83% | Aritmética multi-paso |

## Requisitos de hardware

- VRAM estimada para inferencia: el estado recurrente ocupa 4,85 MB en fp32; el grafo ONNX recurrente completo es inferior a 1,15 GB. No se publican cifras de VRAM para pesos en otros formatos ni para cuantizaciones.
- GPU recomendadas: el modelo se entrenó en una RTX 5050 Laptop de 8 GB; por tamaño, cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM, aunque no se detallan requisitos oficiales.
- Cabe en GPU de consumo: sí, incluidas RTX 4090, RTX 3060 y GPUs integradas, dado el reducido tamaño de parámetros.
- Plataforma de borde objetivo: DirectML / AMD Ryzen AI NPU mediante grafo ONNX de forma estática.
- Opciones de despliegue: transformers (librería declarada); el despliegue en ONNX/DirectML está documentado en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card indica que el consumo energético no se ha medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag | ARC-C | MMLU | Licencia |
|---|---:|---:|---:|---:|---:|---|
| parentheses-1.0-240M | 253,5 M | 4.096 | 33,33% | 26,67% | 50,00% (mejor) / 30,00% (media) | Apache 2.0 |
| SmolLM-360M (Hugging Face) | 360 M | no disponible | 42,80% | 34,20% | no disponible | Apache 2.0 |
| MobileLLM-125M (Meta AI) | 125 M | no disponible | no disponible | 27,10% | no disponible | no disponible |
| OPT-350M (Meta AI) | 350 M | 2.048 | 36,20% | no disponible | 25,70% | OPT-175B license |
| BLOOM-560M (BigScience) | 560 M | 2.048 | no disponible | no disponible | no disponible | BigScience RAIL |

Los datos de comparación proceden de la propia model card del autor; no se han verificado de forma independiente. Las diferencias en HellaSwag y ARC-Challenge se sitúan en un margen de entre -9,47% y -0,43% respecto a las referencias de laboratorios establecidos.

## Limitaciones y advertencias

- Rendimiento bajo en razonamiento académico y aritmética: MMLU con media del 30,00% y GSM8K con media del 5,83%, lo que desaconseja su uso para tareas matemáticas o de conocimiento enciclopédico.
- Resultados de benchmarks con alta varianza entre ejecuciones (por ejemplo, MMLU oscila entre 16,67% y 50,00%), lo que reduce la fiabilidad de las cifras puntuales.
- Contexto limitado a 4.096 tokens (con estabilidad verificada hasta 16.384 en generación recurrente), insuficiente para documentos muy largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a lenguas dravídicas, inglés y algunas lenguas minoritarias; no se documenta soporte de castellano ni de otras lenguas mayoritarias.
- Riesgo de alucinación inherente a modelos pequeños, aunque el autor lo mitiga parcialmente con entrenamiento orientado a detección de alucinaciones; no se detallan sesgos conocidos.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso, lo que limita su integración en pipelines de agentes.
- La información sobre cuantizaciones, latencia, throughput y consumo energético no está disponible, lo que dificulta planificar despliegues en producción.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/uncoalesced-org/parentheses-1.0-240M
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
