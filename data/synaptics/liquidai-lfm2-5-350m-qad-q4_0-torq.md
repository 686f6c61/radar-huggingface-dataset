# Synaptics/LiquidAI-LFM2.5-350M-QAD-Q4_0-torq

## Resumen

Este repositorio no es un modelo nuevo, sino una distribución compilada por Synaptics de **LFM2.5-350M** de Liquid AI, preparada específicamente para ejecutarse en la NPU de borde **SL2619** (plataforma Torq). El punto de partida es el checkpoint `LFM2.5-350M-QAD-Q4_0.gguf`, una variante con destilación consciente de la cuantización (QAD, *quantization-aware distillation*) publicada por Liquid AI, que mantiene la calidad del modelo original pese a usar pesos INT4. Synaptics compila esos pesos a formato **VMFB** (gráficos precompilados para el runtime Torq) sin re-cuantizar nada: cada matriz Q4_0 conserva sus códigos de 4 bits y escalas fp16 en bloques de 32, y el embedding/lm_head atado Q6_K conserva sus códigos de 6 bits con escalas por bloque de 16.

La relevancia de esta ficha está en el despliegue en el borde: el modelo está pensado para ejecutarse íntegramente en hardware embebido (CPU de 2 GHz + NPU de 1 GHz), sin GPU ni servidor, con una ventana de contexto de 256 tokens en decodificación. Es un ejemplo representativo de la tendencia de llevar LLM pequeños y eficientes a dispositivos IoT y wearables, donde la latencia, el consumo y la privacidad local pesan más que la capacidad bruta del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (transformer híbrido de Liquid AI; detalle exacto de bloques no disponible en la información proporcionada) |
| Parametros totales | ~350M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens en decodificación (ventana KV read-only del grafo Torq); contexto original del modelo no disponible |
| Tipos de cuantizacion | Q4_0 (INT4, bloque 32, escalas fp16) en matrices; Q6_K (INT8, bloque 16) en embedding/lm_head atado; activaciones en bf16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | GGUF original; aquí redistribuido como VMFB precompilado (Torq) + `token_embeddings.npy` (bf16) |

## Arquitectura y entrenamiento

El modelo base, LFM2.5-350M de Liquid AI, es un transformer compacto de la familia LFM optimizado para despliegue en el borde. Sobre él, Liquid AI aplicó **QAD (quantization-aware distillation)**: el modelo se destila consciente de la cuantización Q4_0, de modo que los pesos INT4 con escalas por bloque de 32 preservan la calidad del checkpoint original. El embedding y el lm_head atado usan Q6_K (códigos de 6 bits, escalas por 16 elementos).

La contribución de Synaptics es la compilación a gráficos VMFB para la NPU SL2619 sin re-cuantizar. El grafo de prefill divide la proyección descendente del FFN en cuatro fragmentos K y el `in_proj` del bloque convolucional en sus tres salidas; estas particiones son reagrupaciones exactas de los mismos códigos y escalas del GGUF, diseñadas para que las activaciones de cada fragmento quepan en la memoria local de la NPU. El grafo de decodificación no se modifica. El prefill se ejecuta por lotes: el prompt se divide de forma voraz en fragmentos de 32/16/8/4 tokens (con sobrantes de 1-3 tokens procesados por el grafo de un solo token), compartiendo una única copia de los pesos. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiquetado como `conversational`).
- Inferencia local en NPU de borde (SL2619), sin dependencia de servidor ni nube.
- Prefill por lotes con fragmentos de 32/16/8/4 tokens para acelerar el procesado del prompt.
- Compatibilidad con el ecosistema GGUF de Liquid AI (los pesos provienen de `LiquidAI/LFM2.5-350M-GGUF`).
- Capacidades de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- **Asistentes conversacionales embebidos**: chatbots locales en dispositivos con SL2619 (electrodomésticos, panelas de control, kioscos) que responden sin conexión, garantizando privacidad al no salir los datos del dispositivo.
- **Procesado de comandos de voz transcritos en el borde**: dado un prompt corto transcritos localmente, el TTFT de ~0,22 s permite interacciones de apariencia inmediata.
- **Resumen de texto corto en dispositivos IoT**: la ventana de 256 tokens en decodificación limita el caso a resúmenes y transformaciones de textos breves (notificaciones, mensajes, registros).
- **Prototipado rápido de IA en el borde con torq-examples**: el demo LFM2.5 del repositorio `torq-examples` permite a desarrolladores evaluar el modelo en la placa con el nombre `350m-qad-q4_0`, sin necesidad de compilar nada.
- **Comparativa de backends NPU vs CPU en el mismo dispositivo**: los datos medidos frente a llama.cpp en la CPU de la placa sirven de referencia para decidir qué partes del pipeline conviene offloadear a la NPU.
- **Validación de cuantización extrema en producción**: al ser un build QAD sin re-cuantización con un 97,2-97,9 % de acuerdo top-1 con llama.cpp, es útil como caso de estudio para desplegar modelos INT4 en NPUs con garantías de fidelidad.
- **Productos con requisitos de latencia acotada y presupuesto de memoria reducido**: el repo completo ocupa 0,7 GB, compatible con memorias embebidas modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí hay mediciones de rendimiento de inferencia en el SL2619 (2 GHz CPU, 1 GHz NPU, decodificación greedy), comparado con llama.cpp ejecutando el mismo GGUF en la CPU de la placa (2 hilos):

| tok/s | Torq NPU | llama.cpp CPU |
|---|---|---|
| Prefill, fragmento de 4 tokens | 45 | 43 |
| Prefill, fragmento de 8 tokens | 82 | 51 |
| Prefill, fragmento de 16 tokens | 140 | 65 |
| Prefill, fragmento de 32 tokens | 198 | 65 |
| Decode | 14,0 | 14,1 |

Datos adicionales medidos: time-to-first-token de ~0,22 s para preguntas cortas y ~0,75 s para prompts de 150 tokens; acuerdo top-1 del siguiente token con llama.cpp del 97,2-97,9 % sobre 841 posiciones de respuesta de chat (las discrepancias son empates cercanos).

## Requisitos de hardware

- **Hardware objetivo**: Synaptics SL2619 (CPU a 2 GHz + NPU a 1 GHz). No es un modelo para GPU de servidor.
- **VRAM / memoria**: no aplicable a GPU; el repositorio completo ocupa 0,7 GB, por lo que cabe en memorias embebidas del dispositivo.
- **Consumer GPU**: no procede; el formato VMFB es específico del runtime Torq y no ejecuta en GPUs convencionales. Para GPU/CPU genéricas, usar el GGUF original de LiquidAI con llama.cpp.
- **Despliegue**: exclusivamente mediante el runtime Torq de Synaptics. Se requiere una versión posterior a la 2.3.0 (probado con `torq-runtime 0.dev0+20261023t220624z.g79394a3d`); el runtime 2.3.0 rechaza los ficheros con el error `required module features [Ch] are not available`. Uso recomendado vía el demo LFM2.5 de [torq-examples](https://github.com/synaptics-torq/torq-examples).
- **Latencia y throughput**: 14 tok/s en decode (idéntico a CPU de la placa), prefill de hasta 198 tok/s con fragmentos de 32 tokens, TTFT de ~0,22 s (prompt corto) a ~0,75 s (150 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Formato / objetivo | Cuantizacion | Contexto (decode) | Licencia |
|---|---|---|---|---|---|
| LFM2.5-350M QAD Q4_0 Torq (este) | ~350M | VMFB para NPU SL2619 | Q4_0 + Q6_K | 256 tokens | LFM Open License v1.0 |
| LFM2.5-350M-GGUF (Liquid AI, original) | ~350M | GGUF (CPU/GPU genéricas) | Múltiples, incluida QAD Q4_0 | no disponible | LFM Open License v1.0 |
| LFM2-1.2B (Liquid AI) | ~1.200M | GGUF / safetensors | Varias | no disponible | LFM Open License v1.0 |

La alternativa directa para el mismo hardware sin NPU es ejecutar el mismo GGUF con llama.cpp en la CPU de la placa: mismo throughput en decode (14,1 tok/s) pero prefill notablemente más lento (65 frente a 198 tok/s con fragmentos de 32 tokens). Datos de benchmarks de calidad comparativos entre estos modelos: no disponible.

## Limitaciones y advertencias

- **Ventana de contexto muy reducida en decodificación**: el grafo Torq usa una ventana KV read-only de 256 tokens, lo que restringe conversaciones largas y documentos extensos.
- **Requisito estricto de runtime**: los ficheros no funcionan con el runtime Torq 2.3.0; se necesita una versión de desarrollo posterior, lo que introduce riesgo de inestabilidad en producción hasta que haya un release estable con las correcciones del compilador.
- **Formato cerrado a un solo ecosistema**: los VMFB solo ejecutan en el SL2619 con runtime Torq; no hay portabilidad a otras NPUs, GPUs o CPUs.
- **Fidelidad de cuantización**: el acuerdo top-1 con llama.cpp es del 97,2-97,9 %, no del 100 %; las divergencias son empates cercanos, pero conviene validar el comportamiento en la aplicación concreta.
- **Licencia LFM Open License v1.0**: es una licencia personalizada ("other"); revisar sus términos antes de uso comercial, ya que puede incluir restricciones o requisitos de atribución (los avisos de NOTICE deben conservarse conforme a la sección 4(c)).
- **Datos del modelo base incompletos**: idiomas soportados, datos de entrenamiento y benchmarks de calidad no están documentados en este repositorio; consultar la documentación original de Liquid AI.
- **Riesgo de alucinación y sesgos**: inherentes a cualquier LLM; no hay información específica de mitigaciones en este repositorio. En despliegues embebidos sin supervisión, se recomienda acotar las respuestas a dominios verificados.

## Enlaces

- Ficha del modelo: https://huggingface.co/Synaptics/LiquidAI-LFM2.5-350M-QAD-Q4_0-torq
- Modelo base (GGUF original): https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF
- Blog de Liquid AI sobre QAD: https://huggingface.co/blog/LiquidAI/qad
- Licencia: https://huggingface.co/Synaptics/LiquidAI-LFM2.5-350M-QAD-Q4_0-torq/blob/main/LICENSE
- Avisos de atribución: https://huggingface.co/Synaptics/LiquidAI-LFM2.5-350M-QAD-Q4_0-torq/blob/main/NOTICE
- Ejemplos y demo Torq: https://github.com/synaptics-torq/torq-examples
- Web de Synaptics: https://www.synaptics.com/
