# xv0y5ncu/Kolibri-1-GLQ-trellis-3inst-3bpw

## Resumen

Kolibri-1-GLQ-trellis-3inst-3bpw es una cuantización de 3,0 bits por peso del modelo Kolibri-1-BF16 de Aleph Alpha, publicada por el usuario xv0y5ncu. Se trata de un transformer de tipo Mezcla de Expertos (MoE) de 78.000 millones de parámetros, orientado a generación de texto y razonamiento, que gracias a esta cuantización puede servirse en una tarjeta gráfica de 24 GB manteniendo la ventana de contexto completa de 262.144 tokens.

La técnica empleada es GLQ (trellis-coded quantization con variante QTIP TCQ `3inst`, transformada de Hadamard aleatorizada y LDLQ), que mantiene los pesos comprimidos en memoria y los decodifica al vuelo mediante un kernel CUDA fusionado. El checkpoint está pensado para desplegarse con vLLM junto al plugin propietario `aleph-alpha-inference`, que aporta la arquitectura `Kolibri1ForCausalLM` y los parsers de razonamiento y tool calling.

Su relevancia radica en que demuestra que un modelo MoE de 78B puede decodificar a unos 31 tokens por segundo en una L4 de 23 GB con el contexto completo de 262k, usando offload de expertos a CPU y una caché de expertos calientes en VRAM. La licencia es Apache 2.0 y los idiomas declarados son alemán e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mezcla de Expertos), `Kolibri1ForCausalLM` |
| Parámetros totales | 78 000 millones (78B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | GLQ 3,0 bits/peso (trellis `3inst`, RHT + LDLQ); SQNR medio 15,94 dB sobre 27 900 capas |
| Idiomas soportados | alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); kernels GLQ para vLLM |
| Modelo base | Aleph-Alpha/Kolibri-1-BF16 |
| Tamaño del repositorio | 30,8 GB |
| Calibración de la cuantización | 512 muestras × 2048 tokens (WikiText-2) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de tipo Mezcla de Expertos con 78B parámetros totales. La model card no detalla el número de expertos por capa, aunque las mediciones de rendimiento mencionan que con 32 flujos concurrentes se enrutan hasta 192 de los 384 expertos por capa y paso, lo que implica 384 expertos por capa. Tampoco se especifican los tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde al modelo base Aleph-Alpha/Kolibri-1-BF16 y no está incluida en la información disponible.

La innovación principal de este checkpoint es la cuantización GLQ a 3,0 bits por peso, que combina cuantización con código de trellis (QTIP TCQ, variante `3inst`), transformada de Hadamard aleatorizada (RHT) y LDLQ. Los pesos permanecen comprimidos en memoria y se decodifican mediante un kernel CUDA fusionado, en una sola pasada de decodificación sin apilamiento de residuales. El autor indica que el método ofrece su mejor relación tamaño-precisión en el rango de 2 a 4 bits por peso. Adicionalmente, el despliegue incorpora una arena de expertos calientes en VRAM (`GLQ_MOE_EXPERT_CACHE`, en GiB) que evita relecturas por PCIe en cada token, y soporta decodificación especulativa MTP (`num_speculative_tokens`).

## Capacidades

- Generación de texto conversacional en alemán e inglés.
- Razonamiento con modo de pensamiento configurable por petición mediante `chat_template_kwargs={"reasoning_effort": ...}` con niveles `low`, `medium`, `high` o `none`.
- Tool calling y function calling nativos, con parser `kolibri1` y `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso y flujos de agente, gracias al parser de razonamiento dedicado.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Decodificación especulativa MTP opcional para acelerar la generación.
- Soporte de despliegue compatible con endpoints (tag `endpoints_compatible`).
- No se declaran capacidades de visión, audio ni otros dominios multimodales.

## Casos de uso

- Atención al cliente automatizada en alemán e inglés: el modelo puede mantener conversaciones multi-turno con hasta 262.144 tokens de contexto, lo que permite incluir historiales completos e información de producto sin truncar.
- Agentes con tool calling: integrado en vLLM con `--enable-auto-tool-choice` y el parser `kolibri1`, puede invocar funciones externas (consultas a bases de datos, APIs) en pipelines de automatización.
- Procesamiento de documentos largos: análisis y resumen de contratos, informes o expedientes que superen los 100.000 tokens en una sola pasada, gracias a la ventana completa de 262k.
- Asistente de razonamiento con esfuerzo ajustable: para tareas de análisis que requieren cadenas de pensamiento largas se activa `reasoning_effort: high`; para respuestas rápidas de baja latencia se usa `none`.
- Despliegue en infraestructura modesta: con offload de expertos a CPU y una caché de 8 GiB, un modelo de 78B puede servirse en una GPU de 24 GB, lo que habilita prototipos y entornos de desarrollo sin clústeres multi-GPU.
- Generación de código y documentación técnica bilingüe (de/en) en entornos de CI/CD, aprovechando el soporte de tool calling para integraciones con repositorios y sistemas de tickets.
- Investigación sobre cuantización extrema: el checkpoint sirve como referencia reproducible para evaluar la pérdida de calidad de GLQ a 3,0 bpw frente al modelo BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia, obtenidos con `vllm bench serve` (entrada aleatoria de 128 tokens, salida de 256, `ignore_eos`, warmup descartado) en una NVIDIA L4 de 23,0 GiB con vLLM 0.29.0 y glq 0.8.28:

| Concurrencia | Tokens/s por flujo | Tokens/s agregado | TTFT | Tiempo por token de salida |
|---|---|---|---|---|
| 1 | 30,76 (rango 30,66–30,83 en 3 repeticiones) | 29,0 | 313 ms | 32,5 ms |
| 32 | 1,72 | 49,4 (1 repetición) | 17,8 s | 580 ms |

La concurrencia aporta poco en este escenario: 32 flujos multiplican por 1,70 el rendimiento agregado pero multiplican por 17,8 la latencia por flujo, porque bajo offload el paso está limitado por PCIe y no por la GPU. El autor advierte que la causa está confundida: con `GLQ_MOE_ARENA_MAX_TOKENS=1` la arena no sirve ninguno de esos pasos de 32 flujos, y además 32 flujos enrutan hasta 192 de los 384 expertos por capa y paso. No se midió una ejecución sin arena, por lo que estos datos no cuantifican la contribución de la caché de expertos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo ocupa 30,8 GB en disco; con `--cpu-offload-gb 28` y `--cpu-offload-params experts` se sirve en una GPU de 23,0 GiB (L4) con el contexto completo de 262.144 tokens.
- GPU recomendadas: NVIDIA L4 (23 GB) verificada; tarjetas de 24 GB como RTX 4090 o A10G son candidatas por capacidad, aunque no se han publicado mediciones en ellas. Para servicio concurrente sin offload se necesitarían GPUs de mayor memoria (A100 80 GB, H100), sin datos medidos disponibles.
- Cabe en GPU de consumo: sí, con offload de expertos a CPU y una tarjeta de 24 GB; el rendimiento medido en L4 es de ~31 tok/s en un solo flujo.
- Opciones de despliegue: vLLM 0.29.0 con el plugin `aleph-alpha-inference>=1.0.0` y `glq` 0.8.28; para la ruta Transformers, `pip install 'glq[hf]'` con transformers 5.20.1. No se mencionan llama.cpp, Ollama ni TGI.
- Variables de entorno relevantes: `GLQ_MOE_EXPERT_CACHE` (presupuesto de la arena de expertos en GiB; sin definir o 0 la desactiva) y `GLQ_MOE_ARENA_MAX_TOKENS` (ancho máximo del paso de decodificación; debe coincidir con el número de flujos concurrentes multiplicado por 1 + tokens especulativos). La arena requiere CUDA graphs; `--enforce-eager` anula la mayor parte de su beneficio.
- Latencia y throughput medidos: 313 ms de TTFT y 32,5 ms por token de salida con un flujo en L4; 49,4 tok/s agregados con 32 flujos.

## Comparativa con modelos similares

La información disponible solo permite comparar con el checkpoint del que deriva. No se han proporcionado datos de otros modelos de la misma categoría, por lo que las filas restantes quedan como no disponibles.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kolibri-1-GLQ-trellis-3inst-3bpw | 78B (MoE) | 262.144 | GLQ 3,0 bpw | Apache 2.0 | Hugging Face, 1093 descargas |
| Aleph-Alpha/Kolibri-1-BF16 | 78B (MoE) | no disponible en esta información | BF16 (sin cuantizar) | no disponible en esta información | Hugging Face (modelo base) |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización a 3,0 bpw introduce pérdida de precisión respecto al BF16: el SQNR medio es de 15,94 dB, y el autor solo garantiza que la relación tamaño-precisión es favorable en el rango de 2 a 4 bits, no que sea indistinguible del original.
- Requiere el plugin propietario `aleph-alpha-inference`, que soporta exactamente una versión menor de vLLM (0.29.x); actualizar vLLM rompe el despliegue. El `install.sh` del proyecto instala la última versión de vLLM, que no es compatible, y el extra `glq[vllm]` tampoco debe usarse.
- El rendimiento concurrente es pobre bajo offload: 32 flujos solo aportan 1,70× el rendimiento agregado con 17,8× más latencia por flujo; para tráfico concurrente hay que elevar `GLQ_MOE_ARENA_MAX_TOKENS` y volver a medir.
- La arena de expertos necesita CUDA graphs; con `--enforce-eager` se pierde la mayor parte de su beneficio.
- Idiomas limitados a alemán e inglés; no se declara soporte de español ni de otros idiomas.
- No se han publicado evaluaciones de sesgo, alucinación o seguridad en la información disponible; como todo modelo generativo, existe riesgo de alucinación, especialmente en modo de razonamiento alto.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Aleph-Alpha/Kolibri-1-BF16, cuyos términos no se detallan en esta información.
- Los datos de rendimiento proceden de una única GPU (L4) y de un conjunto de pruebas acotado; no deben extrapolarse a otros hardware sin medir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Kolibri-1-GLQ-trellis-3inst-3bpw
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Referencia QTIP: https://arxiv.org/abs/2406.11235
- Referencia arXiv 2512.11614: https://arxiv.org/abs/2512.11614
- Referencia arXiv 2601.17858: https://arxiv.org/abs/2601.17858
