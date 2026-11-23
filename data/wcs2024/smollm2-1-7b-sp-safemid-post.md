# wcs2024/smollm2-1.7b-sp-safemid-post

## Resumen

SmolLM2-1.7B SP + Safe-Mid + post es un ajuste fino supervisado (SFT) del modelo base `wcs2024/smollm2-1.7b-sp-safemid`, que a su vez deriva de una inicialización estándar de SmolLM2-1.7B sometida a una fase de preentrenamiento intermedio ("mid-training") de 60.000 millones de tokens con aproximadamente un tercio de datos de seguridad. Este modelo "post" añade una etapa de instrucción y alineación de seguridad sobre 891.332 ejemplos durante una época, empleando UltraChat-200k, WildGuardMix y WildJailbreak.

El resultado es un modelo de lenguaje de 1.812.039.680 parámetros (1,7B) con arquitectura transformer tipo Llama, orientado a generación de texto conversacional en inglés y con un énfasis explícito en comportamiento seguro (tasas de rechazo ante peticiones dañinas). Su relevancia radica en que documenta una receta completa y reproducible de preentrenamiento intermedio con datos de seguridad seguida de SFT, sobre una base pequena y desplegable en hardware de consumo.

La licencia MIT y el formato de pesos safetensors en bf16 lo hacen directamente utilizable en pipelines de Hugging Face Transformers y text-generation-inference. No obstante, se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tag `llama`) |
| Parametros totales | 1.812.039.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó max length 2.048 |
| Tipos de cuantizacion | no disponible oficialmente; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |
| Tamano del repo | 3,6 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | wcs2024/smollm2-1.7b-sp-safemid |
| Tokenizer y plantilla | HuggingFaceTB/SmolLM2-1.7B-Instruct (ChatML con system prompt de SmolLM2) |
| Fecha de creacion | 2026-11-23 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,7B parámetros, inicializado desde SmolLM2-1.7B y sometido a tres fases. La fase **SP** corresponde a un preentrenamiento estándar sobre `locuslab/base-smollm2-1.7b-all_raw_folders_baseline-600B`. La fase **Safe-Mid** añade 60.000 millones de tokens de mid-training con una mezcla de alta calidad en la que aproximadamente un tercio es datos de seguridad (refuseweb, moral_education, safeweb). La fase **post**, que produce este checkpoint, aplica SFT sobre 891.332 ejemplos durante una época.

Los datos de post-entrenamiento combinan tres fuentes: UltraChat-200k (cada turno de usuario con la respuesta del asistente como ejemplo de un solo turno), WildGuardMix filtrado para conservar solo pares (prompt dañino, rechazo) y (prompt no dañino, respuesta conforme no dañina), y WildJailbreak con los cuatro tipos (vanilla/adversarial x dañino/benigno). Las fuentes se mezclan, se barajan con semilla 42 y se dividen 95/5 en train/val.

El entrenamiento usó 15.917 pasos, batch global de 56 ejemplos con longitud máxima 2.048, optimizador AdamW con lr 2e-5, betas (0.9, 0.999), eps 1e-8, sin weight decay y gradient clipping 1.0. El schedule es warmup lineal de 478 pasos (3%) seguido de coseno hasta cero. Se entrenó en fp32 con autocast bf16 sobre 8x H200, y los pesos liberados están en bf16. La pérdida se calcula solo sobre la respuesta del asistente. El formato es ChatML con la plantilla de SmolLM2-1.7B-Instruct.

## Capacidades

- Generación de texto conversacional multi-turno en inglés con formato ChatML.
- Instrucción y seguimiento de instrucciones derivado de UltraChat-200k.
- Comportamiento de seguridad reforzado: rechazo ante prompts dañinos (WildGuardMix) y robustez frente a jailbreaks vanilla y adversariales (WildJailbreak).
- Razonamiento básico y respuesta a preguntas generales propio de un modelo de 1,7B.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni multi-step reasoning explícito.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés (tag `language: en`).

## Casos de uso

- **Filtrado y moderación de contenido en aplicaciones de chat**: el modelo ha sido entrenado con pares (prompt dañino, rechazo) de WildGuardMix, por lo que puede utilizarse como capa de respuesta segura en asistentes conversacionales de bajo coste.
- **Prototipado de asistentes conversacionales en inglés**: con 1,7B parámetros y licencia MIT, sirve para validar flujos de diálogo multi-turno en local antes de escalar a modelos mayores.
- **Evaluación de robustez frente a jailbreaks**: al haberse entrenado con WildJailbreak (vanilla y adversarial), es útil como sujeto de prueba en estudios de seguridad de modelos pequeños.
- **Investigación en recetas de mid-training con datos de seguridad**: la model card documenta la mezcla (un tercio de datos de seguridad en 60B tokens) y permite reproducir o ablacionar la receta.
- **Despliegue en hardware de consumo para demos**: 1,7B parámetros en bf16 (~3,6 GB) caben en GPUs consumer de 8 GB o más, lo que facilita demos offline.
- **Generación de respuestas de referencia en pipelines de anotación**: puede producir respuestas conformes o rechazos etiquetados para construir datasets de seguridad.
- **Base para ajuste fino posterior específico de dominio**: al ser MIT y tener plantilla ChatML estándar, se puede reentrenar con SFT adicional sobre datos propios en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: ~3,6 GB solo para pesos; con overhead de activaciones y KV cache, entre 5 y 7 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~2 GB de pesos; en 4 bits: ~1 GB de pesos.
- GPU recomendadas para entrenamiento o inferencia de referencia: el autor entrenó con 8x H200; para inferencia basta una sola GPU.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y superiores; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: Transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama y vLLM requieren conversión a GGUF o configuración adicional no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wcs2024/smollm2-1.7b-sp-safemid-post | 1,7B | no disponible (entrenado a 2.048) | SFT + seguridad sobre SmolLM2 | MIT | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | no disponible en esta ficha | Instruct generalista | Apache 2.0 (según modelo original) | Ampliamente disponible |
| locuslab/base-smollm2-1.7b-all_raw_folders_baseline-600B | 1,7B | no disponible | Preentrenamiento base | no disponible | Hugging Face |
| wcs2024/smollm2-1.7b-sp-safemid | 1,7B | no disponible | Mid-training con seguridad | MIT | Hugging Face |

La comparación de rendimiento cuantitativo no está disponible: ninguno de los modelos comparados publica resultados en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- Modelo solo en inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a un modelo de 1,7B parámetros; no apto para tareas que exijan alta precisión factual sin verificación.
- El énfasis en seguridad puede producir rechazos excesivos (falsos positivos) ante peticiones legítimas, dado el peso de los datos de rechazo en el SFT.
- Sesgos no evaluados: la model card no documenta análisis de sesgo demográfico, político o cultural.
- Longitud de contexto efectiva no documentada; el entrenamiento usó 2.048 tokens, por lo que contextos mayores pueden degradar la calidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene cero descargas y cero likes, sin validación comunitaria.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido; no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wcs2024/smollm2-1.7b-sp-safemid-post
- Modelo base (Safe-Mid): https://huggingface.co/wcs2024/smollm2-1.7b-sp-safemid
- Checkpoint de preentrenamiento (SP): https://huggingface.co/locuslab/base-smollm2-1.7b-all_raw_folders_baseline-600B
- Tokenizer y plantilla de referencia: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset UltraChat-200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset WildGuardMix: https://huggingface.co/datasets/allenai/wildguardmix
- Dataset WildJailbreak: https://huggingface.co/datasets/allenai/wildjailbreak
