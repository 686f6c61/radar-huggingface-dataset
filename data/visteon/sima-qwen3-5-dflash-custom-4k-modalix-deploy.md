# visteon/Sima-Qwen3.5-Dflash-Custom-4k-Modalix-Deploy

## Resumen

Sima-Qwen3.5-Dflash-Custom-4k-Modalix-Deploy es un paquete de despliegue compilado para el acelerador NPU SiMa.ai Modalix, publicado por el usuario `visteon`. No contiene pesos en el sentido habitual, sino los binarios ELF resultantes de compilar dos modelos para el hardware: un modelo objetivo Qwen3.5-4B cuantizado a W4A16 con AutoRound y un modelo borrador (draft) DFlash afinado y cuantizado a INT8 por canal, que se usa para decodificación especulativa. El paquete incluye además los activos de devkit (configuración, tokenizer, plantilla de chat, embeddings) necesarios para servir el modelo en el dispositivo.

El modelo base es Qwen3.5-4B, de aproximadamente 4.000 millones de parámetros, con una ventana de contexto compilada de 4096 tokens. La innovación principal del paquete es la integración de decodificación especulativa DFlash con un bloque de 16 tokens y un draft que consume las activaciones de las capas 1, 5, 9, 13, 17, 21, 25 y 29 del modelo objetivo. Según las mediciones del autor en dispositivo, esta combinación eleva la aceptación del draft hasta el 84-87 % en cargas de function calling, con un rendimiento sostenido de 58-69 tokens por segundo en ese escenario.

Su relevancia es acotada pero específica: demuestra un flujo completo de cuantización, compilación y despliegue de un LLM de 4B con decodificación especulativa sobre una NPU de borde, con servidor compatible con la API de OpenAI incluido en el runtime. Es material de referencia para equipos que evalúen inferencia local en hardware SiMa.ai, no un modelo de propósito general publicable en cualquier stack.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.5-4B; los artefactos compilados se etiquetan como MLA stage-1 ELF. La model card no detalla la arquitectura interna más allá de esa etiqueta |
| Parámetros totales | ~4B (derivado del nombre del modelo base Qwen3.5-4B; la model card no publica el recuento exacto) |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (`--max_num_tokens 4096`) |
| Tipos de cuantización | Objetivo: AutoRound W4A16 con compressed-tensors. Draft: RTN INT8 simétrico por canal (min/max) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (sujeta además a los términos del modelo base Qwen3.5) |
| Formato de pesos | Safetensors en el devkit más binarios ELF MLA compilados para NPU (140 ELF del objetivo, 44 del draft) |

Otros parámetros técnicos relevantes:

| Parámetro | Valor |
|---|---|
| Modelo base | Qwen/Qwen3.5-4B |
| Tamaño del repositorio | 7,9 GB |
| Tamaño de bloque especulativo | 16 |
| Tamaño de grupo de lenguaje | 128 (variantes `n128` de caché de tokens) |
| Capas objetivo para el draft | [1, 5, 9, 13, 17, 21, 25, 29] (una de cada cuatro) |
| Runtime requerido | `sima-lmm 0.4.0+add-dflash.928f45c41480` (rama `add_dflash`) |
| Servidor | `llima run --mode web`, HTTP en el puerto 9998, endpoint `/v1/chat/completions` compatible con OpenAI |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

El paquete se compone de dos modelos compilados de forma conjunta. El objetivo es Qwen3.5-4B, descrito en la model card como VLM y precompilado a partir de una versión ya cuantizada (`Qwen3.5-4B-Autoround-Safetensors`, W4A16 con compressed-tensors). El draft es un DFlash afinado que parte de `Qwen3.5-4B-DFlash` y se entrena durante 1607 pasos hasta una pérdida final de ~0,19 y una precisión de token de ~0,93. La aceptación offline medida en validación con teacher forcing alcanza un MAT de 13,12 frente a 1,14 del draft de partida, lo que justifica el afinado específico antes de compilar. Posteriormente el draft se cuantiza a INT8 simétrico por canal con `llmcompressor` en modo `pack-quantized`.

La compilación se realiza con `sima_lmm.host.compile_lmm` usando `--speculative_method dflash`, `--max_num_tokens 4096`, `--speculative_block_size 16` y `--language_group_size 128`. El resultado son 140 binarios ELF MLA de etapa 1 para el objetivo y 44 para el draft más el contexto DFlash. El entorno de compilación (solo relevante para reproducibilidad, no en dispositivo) fue Python 3.13.2, torch 2.11.0+cu128, transformers 5.10.1, llmcompressor 0.12.0 (objetivo) y 0.14.0 (draft), auto-round 0.13.0 y compressed-tensors 0.17.1 / 0.19.0. No se documentan en la información disponible la composición del dataset de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto en el dispositivo con un contexto máximo de 4096 tokens.
- Function calling y generación de JSON estructurado, el escenario con mejor rendimiento medido (58-69 TPS medios, 84-87 % de aceptación del draft).
- Decodificación especulativa con draft DFlash: cada delta de contenido en streaming incluye un flag `from_draft` que permite auditar qué tokens provienen del borrador.
- Servidor HTTP con API compatible con OpenAI (`/v1/chat/completions`), incluyendo streaming SSE con `"stream": true`.
- Estadísticas por petición en el log del servidor: tokens generados, porcentaje aportado por el draft, TTFT y TPS máximo, medio, mediano y mínimo.
- El modelo objetivo se describe como VLM en la model card, aunque el pipeline declarado es `text-generation` y no se documentan capacidades de visión en la información disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío y no hay evaluación por idioma).

## Casos de uso

- Function calling en dispositivos de borde: el paquete está optimizado para JSON corto y multi-llamada, con 86,8 % y 84,0 % de aceptación del draft respectivamente. Es el escenario donde la decodificación especulativa aporta más y donde el modelo alcanza 58-69 TPS medios, suficiente para enrutado de herramientas en tiempo casi interactivo.
- Asistente conversacional local sin conexión a la nube: al ejecutarse íntegramente en la NPU Modalix y exponer una API compatible con OpenAI, permite integrar un chat multi-turno en entornos con requisitos de privacidad o sin conectividad, con un rendimiento sostenido de ~30 TPS en texto plano.
- Traducción de segmentos cortos: medido en 22 tokens generados con 63,6 % de aceptación del draft y 25,8 TPS medios. Adecuado para traducción de cadenas de interfaz o mensajes breves, no para documentos largos dado el límite de 4k tokens.
- Generación de listas y resúmenes estructurados: el caso de generación de listas (244 tokens) mantiene 57,4 % de aceptación y 23,9 TPS medios, útil para poblar campos de formulario o generar checklists en aplicaciones embebidas.
- Enrutado de intenciones y clasificación en pipelines de agentes: con TTFT de ~0,23 s y respuestas cortas, el modelo puede actuar como primer eslabón que decide qué herramienta invocar antes de delegar en un modelo mayor.
- Evaluación de decodificación especulativa sobre NPU: el paquete incluye métricas de aceptación por carga de trabajo y flags de procedencia por token, lo que lo convierte en un banco de pruebas reproducible para investigar el equilibrio entre tamaño de bloque, aceptación y throughput en hardware SiMa.ai.
- Prototipado de servicios compatibles con OpenAI en hardware de borde: el despliegue con `llima run --mode web` levanta un endpoint estándar en el puerto 9998, lo que permite sustituir un backend en la nube por el dispositivo sin reescribir el cliente.

## Benchmarks y rendimiento

Mediciones del autor en dispositivo Modalix, con log en nivel DEBUG y estadísticas por petición:

| Carga de trabajo | Tokens | Aceptación del draft | TTFT | TPS medio | TPS mediano |
|---|---|---|---|---|---|
| Function calling (JSON corto) | 76 | 86,8 % | 0,27 s | 68,6 | 102,1 |
| Function calling (JSON multi-llamada) | 144 | 84,0 % | 0,23 s | 58,3 | 104,0 |
| Traducción | 22 | 63,6 % | 0,23 s | 25,8 | 29,6 |
| Generación de listas | 244 | 57,4 % | 0,23 s | 23,9 | 29,4 |
| Conversación corta | 90 | 53,3 % | 0,23 s | 21,7 | 29,1 |
| Ensayo (decodificación larga) | 358 | 54,5 % | 0,23 s | 22,1 | 25,2 |

Métricas agregadas:

- Prefill en frío: ~650 tokens/s, ajuste lineal sobre prompts de 188 a 3032 tokens.
- Decodificación sostenida de texto plano: ~30 tokens/s.
- JSON estructurado y function calling: 58-69 TPS medios con aceptación del draft del 84-87 %.
- Aceptación offline en validación (teacher forcing): MAT 13,12 frente a 1,14 del draft base.

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo no se ejecuta en GPU, sino en la NPU del SoC SiMa.ai Modalix mediante binarios ELF precompilados.
- GPU recomendadas: no aplica. No se documenta ejecución en A100, H100, RTX 4090 ni ninguna otra GPU.
- Compatibilidad con GPU de consumo: no. El paquete está atado al hardware Modalix y al runtime `sima-lmm`.
- Almacenamiento: el repositorio ocupa 7,9 GB e incluye 184 binarios ELF más los activos de devkit de ambos modelos. El autor sugiere copiarlos a `/media/nvme/` en el dispositivo.
- Runtime: `sima-lmm 0.4.0+add-dflash.928f45c41480`, en la rama `add_dflash`. Versiones anteriores sin soporte de `speculative_method dflash` no cargan el draft.
- Despliegue: `llima run Qwen3.5-4B-DFlash-FT-RTN-INT8 --mode web --log_level INFO`, con servidor HTTP en el puerto 9998 y API compatible con OpenAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: prefill en frío ~650 tokens/s, TTFT de ~0,23 s, decodificación de ~30 TPS en texto plano y 58-69 TPS medios en JSON estructurado. Las cifras provienen de mediciones del autor en un único dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Orientación |
|---|---|---|---|---|---|
| Sima-Qwen3.5-Dflash-Custom-4k-Modalix-Deploy (este) | ~4B | 4096 | ELF para NPU + devkit safetensors | Apache-2.0 | Despliegue compilado en SiMa.ai Modalix con decodificación especulativa DFlash |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible en la información proporcionada | Safetensors | Términos de Qwen3.5 | Pesos originales, ejecutables en GPU/CPU con stacks convencionales |
| visteon/Sima-Qwen3.5-Dflash-Custom-4k (repo compañero) | ~4B objetivo + draft | 4096 | Safetensors con receta de cuantización | Apache-2.0 | Solo pesos y receta; no incluye binarios ELF ni despliegue en dispositivo |

No se dispone de datos de benchmarks ni de especificaciones de modelos de borde comparables (por ejemplo, otros paquetes compilados para NPU) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ventana de contexto fija de 4096 tokens, impuesta en tiempo de compilación. No es ampliable sin recompilar.
- Dependencia estricta del runtime: requiere la rama `add_dflash` de `sima-lmm` (versión 0.4.0+add-dflash.928f45c41480). Cualquier versión anterior no cargará el modelo borrador.
- Atado al hardware: los binarios ELF solo se ejecutan en SiMa.ai Modalix. No hay ruta de despliegue documentada en GPU, CPU u otras NPU.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha. No hay informes independientes de terceros sobre el comportamiento en producción.
- Idiomas no declarados: el repositorio no especifica idiomas soportados ni se han publicado evaluaciones por idioma. El rendimiento en castellano no está verificado.
- Degradación por cuantización: el objetivo usa W4A16 y el draft INT8 por canal. No se publican comparaciones de calidad frente al modelo en precisión completa, más allá del MAT de aceptación del draft.
- Rendimiento dependiente de la carga: la aceptación del draft cae del 86,8 % en JSON corto al 53,3 % en conversación y al 54,5 % en decodificación larga, de modo que el beneficio de la decodificación especulativa es muy desigual según el tipo de salida.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de sesgo. Al ser un modelo de 4B cuantizado, es esperable un riesgo apreciable en tareas de conocimiento factual, aunque no hay datos publicados que lo cuantifiquen.
- Licencia: Apache-2.0 para el paquete, pero sujeta a los términos del modelo base Qwen3.5. Conviene revisar las condiciones de Qwen antes de un uso comercial.
- La model card describe el objetivo como VLM, pero el pipeline declarado es `text-generation` y no se documentan ni ejemplos ni métricas de visión. No debe asumirse capacidad multimodal operativa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/visteon/Sima-Qwen3.5-Dflash-Custom-4k-Modalix-Deploy
- Repositorio compañero (pesos y receta de cuantización): https://huggingface.co/visteon/Sima-Qwen3.5-Dflash-Custom-4k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Papers, blogs, repositorios de código y demos: no disponibles en la información proporcionada.
