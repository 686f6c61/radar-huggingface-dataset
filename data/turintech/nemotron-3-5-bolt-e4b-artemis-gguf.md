# turintech/Nemotron-3.5-Bolt-E4B-Artemis-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-Artemis-GGUF es una cuantización GGUF, creada por TurinTech con su pipeline Artemis, del modelo de chat NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 de NVIDIA. El objetivo del proyecto es llevar las capacidades de chat, llamadas a herramientas (tool calling) y matemáticas del modelo original de NVIDIA a GPUs pequeñas e incluso CPU, mediante archivos GGUF compactos y optimizados que reducen la pérdida de calidad respecto a otras cuantizaciones del mismo tamaño (comparadas explícitamente con las de Unsloth).

El modelo base es un modelo conversacional de la familia Nemotron de NVIDIA con 7.518 millones de parámetros (dato real de safetensors), y la cuantización por defecto (Q3_K_XL) ocupa solo 4,22 GB de descarga, funcionando con unos 3,2 GiB de memoria de GPU en una RTX 3060 con contexto de 8.192 tokens. Los archivos incluyen la plantilla de chat de NVIDIA byte a byte y son compatibles con llama.cpp, Ollama y LM Studio.

Su relevancia actual radica en la combinación de tres factores: un tamaño reducido que lo hace ejecutable en hardware de consumo, un buen rendimiento en function calling (372 de 400 en BFCL simple según el autor) y soporte de decodificación especulativa mediante el drafter DFlash de NVIDIA, que eleva la velocidad de generación de 80,0 a 114,1 tokens por segundo en una RTX 3060.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Nemotron (detalle interno no disponible) |
| Parametros totales | 7.518.069.290 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8.192 tokens en los comandos y pruebas documentadas (maximo del modelo base: no disponible) |
| Tipos de cuantizacion | Q3_K_XL (por defecto, 4,22 GB), Q4_K_XL, IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (licencia "other" en HuggingFace) |
| Formato de pesos | GGUF (solo el modelo de texto) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, pertenece a la familia Nemotron de NVIDIA y es un modelo conversacional orientado a chat, tool calling y matematicas. La ficha original de NVIDIA con los detalles de arquitectura y entrenamiento no esta incluida en la informacion disponible, por lo que el numero exacto de capas, dimensiones ocultas y composicion del dataset de preentrenamiento no se pueden detallar. El sufijo "E4B" sugiere una variante de eficiencia de 4 mil millones de parametros activos, pero este dato no esta confirmado en la documentacion proporcionada.

Sobre esta base, TurinTech ha aplicado su pipeline de cuantizacion Artemis para producir archivos GGUF que minimizan la divergencia KL respecto al modelo original. Los datos publicados muestran KL held-out de 0,0574 (wiki), 0,0414 (chat) y 0,0376 (codigo) para la variante Q3_K_XL, frente a 0,0752, 0,0620 y 0,0504 de la cuantizacion UD-Q3_K_XL de Unsloth del mismo tamaño. En CPU, los valores son 0,0661 y 0,0416 frente a 0,0816 y 0,0609. Ademas, el modelo es compatible con la decodificacion especulativa mediante el drafter DFlash de NVIDIA (Nemotron-3.5-Bolt-E4B-DFlash-BF16.gguf, 737 MB), que propone tokens que el modelo principal verifica.

## Capacidades

- Generacion de texto conversacional: modelo de chat con la plantilla de chat oficial de NVIDIA embebida en el archivo GGUF.
- Tool calling / function calling: rendimiento medido en el Berkeley Function Calling Leaderboard (372/400 en BFCL simple y 184/200 en BFCL 200-399, segun el autor).
- Razonamiento matematico: 228 de 250 respuestas correctas en el test de GSM8K (segun el autor).
- Modo thinking: la plantilla soporta razonamiento explicito (thinking), activado por defecto en llama.cpp y Ollama; puede desactivarse con `--reasoning off` o `--think=false`. Todas las metricas publicadas se midieron con thinking desactivado.
- Decodificacion especulativa: compatible con el drafter DFlash de NVIDIA para acelerar la generacion.
- Despliegue local: archivos GGUF ejecutables en GPU pequena o CPU mediante llama.cpp, Ollama y LM Studio.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponibles (los archivos contienen solo el modelo de texto).

## Casos de uso

- Chatbots locales en hardware de consumo: con 3,2 GiB de VRAM en una RTX 3060 a contexto de 8.192 tokens, es adecuado para asistentes conversacionales que se ejecutan integramente en un PC de escritorio sin depender de la nube.
- Agentes con llamadas a herramientas: su puntuacion en BFCL (93% en BFCL simple segun el autor) lo hace viable para pipelines de agentes que invocan funciones definidas por el usuario, orquestadas desde llama-server con su API compatible con OpenAI.
- Resolucion de problemas de matematicas: con 91,2% de acierto en GSM8K (228/250 segun el autor), sirve para asistentes de aritmetica y problemas de razonamiento numerico de nivel escolar.
- Generacion aumentada en aplicaciones con presupuesto de VRAM limitado: la variante Q4_K_XL ofrece mayor fidelidad para quien pueda permitirse algo mas de memoria, manteniendo el modelo en el rango de GPUs de consumo.
- Inferencia en CPU: los datos KL en CPU indican que funciona razonablemente sin GPU, util para servidores modestos o entornos edge sin acelerador.
- Prototipado rapido de LLMs con Ollama o LM Studio: los tags de Ollama (`q3_k_xl`, `q4_k_xl`, `iq3_xxs`) permiten probar el modelo con un solo comando, ideal para evaluaciones previas a integracion.
- Generacion de codigo ligera: los datos KL de codigo (0,0376) indican fidelidad razonable en dominio de codigo, aunque no se han publicado benchmarks especificos de programacion.

## Benchmarks y rendimiento

Resultados declarados por el autor (TurinTech), no verificados por terceros. Todas las mediciones se realizaron con thinking desactivado.

| Benchmark | Metrica | Resultado |
|---|---|---|
| BFCL simple (Berkeley Function Calling Leaderboard) | Tool calls correctos | 372 de 400 (93,0%) |
| BFCL 200-399 | Tool calls correctos | 184 de 200 (92,0%) |
| GSM8K test | Respuestas correctas | 228 de 250 (91,2%) |
| Held-out chat (OASST1) | Coincidencia de siguiente token (same top-p) | 92,98% |

Metricas adicionales de fidelidad de cuantizacion (KL held-out frente al modelo original, RTX 3060): wiki 0,0574, chat 0,0414, codigo 0,0376, frente a 0,0752, 0,0620 y 0,0504 de la cuantizacion UD-Q3_K_XL de Unsloth del mismo tamaño. En CPU: 0,0661 y 0,0416 frente a 0,0816 y 0,0609. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 3,2 GiB de GPU y 4,3 GiB de memoria del host con todas las capas en GPU (RTX 3060 12 GB, archivo Q3_K_XL, contexto de 8.192 tokens). Con el drafter DFlash activo, unos 1,8 GiB adicionales de VRAM.
- GPUs recomendadas: cualquier GPU de consumo con 6 GB o mas de VRAM es suficiente para el archivo por defecto; documentado especificamente sobre NVIDIA RTX 3060 12 GB.
- Consumer GPUs: si cabe con holgura en una RTX 3060 12 GB; por extension, compatible con GPUs de 6-8 GB (RTX 4060, RTX 3070) para el archivo Q3_K_XL. Tambien funciona en CPU puro.
- Opciones de despliegue: llama.cpp (llama-server, probado con b11869), Ollama (`ollama run turintech/nemotron-3.5-bolt-e4b-artemis:q3_k_xl --think=false`) y LM Studio. No se menciona soporte para vLLM ni TGI (GGUF no es su formato nativo).
- Throughput: 80,0 tokens por segundo con Q3_K_XL en RTX 3060, elevados a 114,1 tokens por segundo con decodificacion especulativa DFlash. Latencia no disponible.

## Comparativa con modelos similares

| Caracteristica | Nemotron-3.5-Bolt-E4B-Artemis-GGUF | UD-Q3_K_XL de Unsloth (mismo modelo base) | NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (modelo base) |
|---|---|---|---|
| Parametros | 7.518 M (total) | 7.518 M (total) | 7.518 M (total) |
| Tamaño del archivo | 4,22 GB (Q3_K_XL) | similar (mismo tamaño nominal) | no disponible |
| KL held-out (wiki/chat/codigo) | 0,0574 / 0,0414 / 0,0376 | 0,0752 / 0,0620 / 0,0504 | referencia (0) |
| Formato | GGUF | GGUF | BF16 (safetensors) |
| Licencia | OpenMDW-1.1 | no disponible | OpenMDW-1.1 |
| VRAM (contexto 8k) | ~3,2 GiB | no disponible | no disponible |

Alternativas de otra familia con rol similar (chat pequeno local con tool calling), como Qwen3-4B o Gemma 3 4B, no disponen de datos comparables publicados en la informacion proporcionada, por lo que no se pueden comparar numericamente aqui.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan auditorias de sesgo para este modelo ni para su cuantizacion.
- Alucinacion: no se han publicado evaluaciones de alucinacion; al ser un modelo de 7,5 mil millones de parametros cuantizado a Q3, debe esperarse mayor tasa de alucinacion que en modelos mayores, especialmente en conocimiento factual.
- Contexto: las pruebas documentadas usan 8.192 tokens; el maximo real del modelo base no esta indicado en la informacion disponible. Los archivos contienen solo el modelo de texto.
- Thinking: llama.cpp y Ollama activan el modo thinking por defecto para esta plantilla, lo que genera bloques de razonamiento iniciales y requiere un `max_tokens` mucho mayor; hay que desactivarlo explicitamente (`--reasoning off` / `--think=false`) para reproducir los resultados publicados.
- Decodificacion especulativa: con DFlash activo, las respuestas greedy no siempre coinciden palabra por palabra (solo 11 de 30 coincidieron en las pruebas del autor).
- Metricas no verificadas: todos los benchmarks provienen del autor del modelo y no estan verificados por terceros; las cifras de BFCL y GSM8K se midieron sobre subconjuntos (400, 200 y 250 ejemplos), no sobre los sets completos.
- Licencia: OpenMDW-1.1 es una licencia abierta, pero conviene revisar sus terminos exactos (https://openmdw.ai/license/1-1/) antes de un uso comercial concreto; la ficha lo marca como "other" en HuggingFace.
- Produccion: sin thinking-on medido, sin benchmarks estandarizados independientes y con un numero reducido de descargas (398 en el momento de la ficha), se recomienda evaluacion propia antes de despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Hilo de feedback de TurinTech: https://huggingface.co/spaces/turintech/README/discussions/1
- Web de TurinTech: https://turintech.ai
