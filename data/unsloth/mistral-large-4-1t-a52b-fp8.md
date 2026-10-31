# unsloth/Mistral-Large-4-1T-A52B-FP8

## Resumen

Mistral Large 4 (apodado "Le Chonk") es el modelo insignia de Mistral AI: un modelo multimodal nativo de aproximadamente 1 billón de parámetros totales (en la escala de los trillion anglosajones) con unos 49-52 mil millones de parámetros activos por token, publicado bajo la Mistral Ecosystem Open-Weight License. Fue entrenado desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en los centros de datos propios de Mistral en Europa, y unifica instrucciones, razonamiento, código y flujos agénticos en un único conjunto de pesos.

Esta ficha corresponde a la cuantización FP8 publicada por Unsloth a partir del checkpoint oficial `mistralai/Mistral-Large-4-1T-A52B`. Unsloth también distribuye versiones GGUF con cuantizaciones dinámicas (desde 1 bit, unos 233 GB, hasta Q8 con ~1,1 TB) que incluyen el proyector de visión (mmproj) y un modelo draft para decodificación especulativa (DSpark).

El modelo es relevante por combinar una ventana de contexto de 1M de tokens, entrada de imagen y texto, soporte de 160+ idiomas y capacidades agénticas nativas (function calling, JSON estricto), con un rendimiento especialmente destacado en ciberseguridad, finanzas, derecho y grounding visual, donde según Mistral supera a modelos cerrados de frontera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts multimodal (encoder de visión estilo Pixtral) |
| Parametros totales | ~1 billón (1T) |
| Parametros activos | ~49B por token (52B incluyendo embeddings y capas de salida); 128 expertos enrutados (4 activos por token) + 1 experto compartido |
| Longitud de contexto | 1M de tokens |
| Tipos de cuantizacion | FP8 (este repo); NVFP4 oficial; GGUF de Unsloth desde 1 bit (233 GB) hasta Q8 (~1,1 TB) |
| Idiomas soportados | 160+ idiomas de forma nativa (el repo lista 41: en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl); incluye todos los idiomas oficiales de la UE |
| Licencia | Mistral Ecosystem Open-Weight License (uso comercial y no comercial permitido; operar un negocio Model-as-a-Service requiere licencia comercial aparte) |
| Formato de pesos | safetensors FP8 (este repo, 1.060,6 GB); también GGUF (Unsloth) y NVFP4 (oficial) |

## Arquitectura y entrenamiento

Mistral Large 4 es un transformer Mixture-of-Experts de granularidad fina con 128 expertos enrutados de los que 4 se activan por token, más 1 experto compartido, lo que resulta en unos 49 mil millones de parámetros activos por token frente a ~1 billón totales. Es multimodal nativo: acepta entrada de texto e imagen mediante un encoder de visión estilo Pixtral entrenado para manejar tamaños de imagen y relaciones de aspecto variables, y genera salida de texto.

El modelo fue entrenado desde cero con 3.800 GPU NVIDIA Grace Blackwell en los datacenters de Mistral en Europa. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset (no disponible). Incluye funcionalidades de razonamiento con esfuerzo configurable por petición (`low`, `medium`, `high`), y soporta function calling nativo y salida JSON con esquema estricto. Entre las innovaciones de despliegue destacan la decodificación especulativa DSpark de Unsloth (longitud media de aceptación de ~2,5 tokens, aproximadamente 2x de velocidad de decodificación en batch 1) y un checkpoint NVFP4 oficial optimizado para GPU Blackwell.

## Capacidades

- Generación de texto e instrucciones con fuerte adherencia a system prompts.
- Modo de razonamiento con tres niveles de esfuerzo configurables por petición: `low`, `medium` (por defecto `high`), adecuado tanto para respuestas rápidas de chat como para ejecuciones agénticas complejas.
- Visión: análisis de imágenes, gráficos, planos técnicos y documentos, con estado del arte en visual grounding entre modelos de pesos abiertos según Mistral.
- Código y razonamiento matemático integrados en el mismo conjunto de pesos (unificado con instrucciones y flujos agénticos).
- Agéntico: function calling nativo, salida JSON y cumplimiento estricto de JSON schema.
- Multilingüe: fluidez nativa en más de 160 idiomas, incluidos todos los idiomas oficiales de la Unión Europea.
- Ciberseguridad: estado del arte entre modelos de pesos abiertos en tareas de seguridad, rechazando peticiones maliciosas.
- Ventana de contexto de 1M de tokens para workloads de contexto largo.
- Rendimiento especialmente bueno en ciberseguridad, finanzas y derecho.

## Casos de uso

- Atención al cliente automatizada multilingüe: con 1M de tokens de contexto y fluidez nativa en 160+ idiomas, puede gestionar conversaciones multi-turno largas con historial completo de interacciones y documentación de producto adjunta, sin cortar el contexto.
- Análisis de documentos empresariales con visión: puede procesar contratos, informes financieros, gráficos y planos técnicos directamente, combinando el encoder de visión con el contexto largo para razonar sobre documentos de cientos de páginas.
- Pipelines agénticos con herramientas: el function calling nativo y el JSON schema estricto permiten integrarlo en orquestadores (LangGraph, agentes personalizados) para automatizar flujos multi-paso con llamadas a APIs.
- Asistente de ciberseguridad defensiva: al ser estado del arte entre modelos abiertos en seguridad y rechazar peticiones maliciosas, es adecuado para análisis de vulnerabilidades, revisión de código y triaje de incidentes.
- Automatización legal y de cumplimiento: el rendimiento destacado en derecho lo hace útil para revisión de cláusulas, resumen de normativa y comparación de contratos en idiomas de la UE.
- Generación y revisión de código en producción: puede integrarse en pipelines de CI/CD para revisión automática de pull requests, generación de tests y documentación, con razonamiento ajustable según la complejidad de la tarea.
- Chat asistente de baja latencia: el nivel de razonamiento `low` permite respuestas rápidas de chat sin sacrificar la calidad del modelo base.
- Procesamiento multilingüe a escala europea: al cubrir todos los idiomas oficiales de la UE de forma nativa, es idóneo para plataformas paneuropeas que requieren una única instancia de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica cualitativamente que supera a modelos cerrados de frontera en visual grounding y que es estado del arte entre modelos de pesos abiertos en ciberseguridad, pero no incluye tablas numéricas (MMLU, HumanEval, GSM8K, etc.).

Unsloth publica benchmarks de cuantización (KLD y precisión top-1 frente a tamaño) para sus GGUF Dynamic 3.0 en su documentación.

## Requisitos de hardware

- Repo FP8 completo: 1.060,6 GB, requiere aproximadamente 1,1-1,2 TB de VRAM/HBM agregada; orientado a nodos multi-GPU de datacenter (H100/H200/Blackwell).
- Checkpoint NVFP4 oficial: huella de memoria menor e inferencia más rápida, dirigido a GPU Blackwell (B200), con soporte de vLLM y SGLang.
- GGUF de Unsloth: la cuantización de 1 bit (233 GB) cabe en un dispositivo con 256 GB de RAM; las de 2 bits (302-378 GB) en equipos con 384-512 GB; Q8 (~1,1 TB) necesita 1,2 TB o más.
- No cabe en GPUs de consumo convencionales (RTX 4090, RTX 5090) en ninguna variante; la vía local realista es CPU/RAM con llama.cpp o la aplicación Unsloth Desktop.
- Motores de inferencia soportados: vLLM, SGLang, llama.cpp (se recomienda el build de Unsloth), Transformers y Unsloth Desktop.
- Con decodificación especulativa DSpark en llama.cpp (batch 1), la velocidad de decodificación se duplica aproximadamente (longitud media de aceptación ~2,5).
- Parámetros de muestreo recomendados: temperature=1.0, top_p=0.95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 (1T-A52B) | ~1T total / ~52B activos (MoE) | 1M | Sí (texto + imagen) | Mistral Ecosystem Open-Weight | HF, Mistral API, NVFP4, GGUF |
| DeepSeek-V3 | ~671B total / ~37B activos (MoE) | 128K | No | Licencia propia tipo MIT con restricciones | HF, vLLM, SGLang |
| Llama 3.1 405B | 405B densos | 128K | No | Llama Community License | HF, vLLM, TGI, GGUF |
| Qwen3-235B-A22B | ~235B total / ~22B activos (MoE) | 128K+ | No (variante de texto) | Apache 2.0 | HF, vLLM, SGLang, GGUF |

Nota: los datos de los modelos comparables corresponden a conocimiento general y pueden no reflejar las versiones más recientes. Mistral Large 4 destaca sobre ellos en contexto (1M frente a 128K), multimodalidad nativa y cobertura lingüística, a costa de requisitos de hardware muy superiores.

## Limitaciones y advertencias

- Requisitos de hardware extremos: incluso la cuantización de 1 bit requiere 256 GB de memoria, lo que lo excluye de la mayoría de entornos locales y de GPUs de consumo.
- Licencia con restricciones: aunque permite uso comercial y no comercial, operar un negocio Model-as-a-Service con el modelo requiere una licencia comercial separada con Mistral; revisar el texto legal antes de despliegues SaaS.
- Riesgo de alucinación: como todo LLM de gran escala, puede generar contenido incorrecto con apariencia plausible, especialmente en dominios especializados como derecho, finanzas o seguridad; se recomienda verificación humana en producción.
- Sesgos: no se documentan sesgos específicos en la información disponible; al estar entrenado en datos masivos multilingües, pueden existir sesgos lingüísticos y culturales no caracterizados (no disponible).
- La cobertura nativa declarada es de 160+ idiomas, pero el repo solo lista explícitamente 41; la calidad en idiomas no listados puede ser menor.
- El modo de razonamiento `high` (por defecto) genera más tokens de pensamiento, aumentando latencia y coste; ajustar el `reasoning_effort` según el caso.
- La model card no publica benchmarks numéricos verificados de forma independiente; las afirmaciones de estado del arte provienen del propio Mistral.
- Para inferencia en producción se recomienda vLLM o SGLang con el checkpoint FP8 o NVFP4; con llama.cpp usar el build específico de Unsloth.

## Enlaces

- Modelo FP8 (Unsloth): https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-FP8
- Modelo base oficial: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Checkpoint NVFP4 oficial: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- GGUF de Unsloth: https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Blog de anuncio de Mistral: https://mistral.ai/news/mistral-large-4-oss/
- Documentación de la API de Mistral: https://docs.mistral.ai/models/mistral-large-4-0
- Guía de Unsloth para ejecutar Mistral Large 4: https://unsloth.ai/docs/models/mistral-large-4
- GGUF Dynamic 3.0 de Unsloth (benchmarks de cuantización): https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Unsloth Desktop: https://unsloth.ai/docs/desktop
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth
