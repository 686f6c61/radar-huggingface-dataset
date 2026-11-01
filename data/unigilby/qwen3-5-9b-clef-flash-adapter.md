# unigilby/Qwen3.5-9B-clef-flash-adapter

## Resumen

Qwen3.5-9B-clef-flash-adapter es un adaptador LoRA publicado por el usuario unigilby que reexpresa los pesos del modelo de decisión Clef-Flash de Cloudflare sobre el modelo base Qwen/Qwen3.5-9B. Cloudflare distribuye Clef-Flash como pesos fusionados (merged weights); este repositorio contiene únicamente la diferencia respecto al modelo base en forma de LoRA, junto con la cabeza de esquema conjunta (joint schema head) original de Cloudflare. El objetivo es permitir que un mismo servidor responda chat con los pesos base de Qwen3.5-9B y decisiones de Clef-Flash aplicando el adaptador solo en las pasadas de decisión.

El adaptador cubre las 248 proyecciones lineales de las 32 capas del transformer, con rango 256 (rango 32 completo para las proyecciones `in_proj_a` e `in_proj_b` de las capas GDN), en bf16. La verificación reportada por el autor indica una divergencia mínima frente a la release fusionada de Cloudflare: KL medio de 4,6e-5 y coincidencia de elección top del 99,64% sobre 60 registros y 557 preguntas. Es relevante porque permite servir chat y decisiones desde un único checkpoint sin duplicar los 9B parámetros del modelo base.

El modelo base Qwen3.5-9B aporta la arquitectura subyacente y el conocimiento general; Clef-Flash añade la funcionalidad de modelo de decisión (probabilidades sobre opciones en formato Jev/SystemOne). La licencia es Apache-2.0, heredada de Clef-Flash, y el repositorio ocupa 3,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5-9B (32 capas, incluye capas GDN con atención lineal) |
| Parametros totales | no disponible (adaptador LoRA sobre un base de 9B; el repo pesa 3,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita (la verificación reporta coincidencia del 100% hasta 4K tokens y pruebas por encima de 10K) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter.safetensors`, `joint_head.safetensors`, `lm_head_rows.safetensors`) |

## Arquitectura y entrenamiento

El adaptador no es un modelo entrenado desde cero, sino una factorización de la diferencia de pesos entre Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y Cloudflare/clef-flash (revisión `f0b7d3cd65296abfe459e6c228b618f5d8b26d2f`). De los 296 tensores que difieren entre ambos, 248 corresponden a proyecciones lineales de las 32 capas y constituyen el LoRA; los otros 48 (los `A_log` y `linear_attn.norm.weight` de cada capa GDN) solo difieren en precisión (fp32 en el base frente a bf16 en la release) y no forman parte del adaptador. Cada proyección se factorizó mediante SVD a rango 256, salvo las 48 proyecciones de rango 32, que se factorizaron de forma exacta.

La convención de aplicación es `y = x Wᵀ + (x Aᵀ) Bᵀ`, con A de forma `[rank, in]` de filas ortonormales y B de forma `[out, rank]` con la escala incorporada. El residuo de la factorización se sitúa entre el 0,2% y el 3,7% de cada delta, como máximo 1,02 veces el suelo de redondeo bf16 de la propia fusión. El repositorio incluye además la cabeza de esquema conjunta de Cloudflare sin modificar (byte a byte idéntica a la release), el embedding de salida bf16 del base y un manifiesto con revisiones, rango, convención y formas de cada módulo.

## Capacidades

- Generación de chat estándar mediante los pesos base de Qwen3.5-9B, sin alteración (las respuestas de chat son bit a bit idénticas con y sin decisiones según la verificación del autor).
- Modelo de decisión: devuelve probabilidades sobre opciones en el endpoint `POST /v1/systemone`, en formato de petición Jev/SystemOne; con `"raw": true` devuelve probabilidades sin redondear.
- Cabeza de esquema conjunta (joint schema head) de Cloudflare para la producción de decisiones.
- Concurrencia: cuatro decisiones concurrentes producen el mismo resultado que decisiones aisladas (60/60 registros).
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Servicio unificado de chat y decisiones: un único servidor con los pesos de Qwen3.5-9B responde conversaciones normales y, aplicando el adaptador solo en las pasadas de decisión, atiende `POST /v1/systemone`, evitando mantener dos checkpoints de 9B en memoria.
- Enrutamiento y clasificación de decisiones en pipelines de agentes: el endpoint de Clef-Flash devuelve probabilidades sobre opciones, útil para seleccionar herramientas, rutas o acciones en un flujo multi-paso con umbrales calibrados.
- Evaluación y comparación de modelos de decisión: al conservar la cabeza de esquema original y las revisiones exactas del base y de la release, sirve para reproducir las salidas de Clef-Flash y medir divergencias (KL, coincidencia top) frente a la release fusionada.
- Despliegue en hardware limitado: al cargar el base sin convertir y aplicar el adaptador en tiempo de ejecución en TensorFold nativo, se evita almacenar por separado la release fusionada; el autor lo valida en una DGX Spark con CUDA.
- Investigación sobre adaptadores de bajo rango: el manifiesto con formas, rangos y convención, junto con los checksums SHA256, permite estudiar la factorización SVD de deltas de pesos entre checkpoints.
- Servicio de chat de propósito general con decisiones ocasionales: cuando las decisiones son esporádicas y el chat es la carga principal, el coste adicional del adaptador (unas 4 veces más lento que la release fusionada en decisiones) se compensa con el ahorro de memoria.

## Benchmarks y rendimiento

| Prueba | Referencia | Resultado |
|---|---|---|
| Base + adaptador vs Clef-Flash fusionado (Transformers bf16, GPU Apple, 60 registros / 557 preguntas) | Cloudflare/clef-flash | KL medio 4,6e-5; elección top 99,64% (100% hasta 4K tokens) |
| Motor nativo con la release fusionada vs la misma referencia | Cloudflare/clef-flash | KL medio 5,7e-5; elección top 99,64% |
| TensorFold nativo (DGX Spark, CUDA), base sin convertir + adaptador vs salida bf16 de Cloudflare | Cloudflare/clef-flash | KL medio 6,9e-5; elección top 99,46% |
| Decisiones concurrentes (4 simultáneas) vs aisladas | — | 60/60 registros idénticos |
| Latencia de decisiones (p50, hasta 1K tokens, una DGX Spark) | Release fusionada | 1,1 s (adaptador) vs 0,35 s (fusionada) |
| Latencia de decisiones (más de 10K tokens, una DGX Spark) | Release fusionada | 36 s (adaptador) vs 8,8 s (fusionada) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador en bf16 y la cabeza conjunta se suman al modelo base de 9B, por lo que se requiere memoria para el base completo más el adaptador.
- El autor valida el despliegue en una DGX Spark con CUDA mediante TensorFold nativo (PRs #1364 y #1372 de ashhart/TensorFold).
- GPU recomendadas: no disponible; la verificación se realizó en una GPU Apple (Transformers bf16) y en una DGX Spark (CUDA).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: TensorFold nativo con `tensorfold-native serve <checkpoint Qwen3.5-9B> --clef <carpeta del repo>`; también Transformers en bf16 para la verificación frente a la release fusionada. vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia: decisiones con el adaptador en tiempo de ejecución aproximadamente 4 veces más lentas que la release fusionada (p50 1,1 s frente a 0,35 s hasta 1K tokens; 36 s frente a 8,8 s por encima de 10K tokens, en una DGX Spark), porque los productos del adaptador se ejecutan en kernels de fila exacta.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unigilby/Qwen3.5-9B-clef-flash-adapter | Adaptador LoRA sobre Qwen3.5-9B | Base de 9B + LoRA (rango 256) | no disponible | Apache-2.0 | HuggingFace (0 descargas) |
| Cloudflare/clef-flash | Pesos fusionados del modelo de decisión | no disponible | no disponible | Apache-2.0 | HuggingFace (release oficial) |
| Qwen/Qwen3.5-9B | Modelo base de chat | 9B | no disponible | no disponible en la información | HuggingFace |

La diferencia principal frente a Cloudflare/clef-flash es el formato: la release oficial son pesos fusionados, mientras que este repositorio es un adaptador que se aplica en tiempo de ejecución y permite compartir el base con el chat. Frente a Qwen/Qwen3.5-9B, añade la funcionalidad de decisión de Clef-Flash sin modificar las respuestas de chat.

## Limitaciones y advertencias

- El adaptador es unas 4 veces más lento que la release fusionada para decisiones; el propio autor recomienda servir la release fusionada cuando las decisiones son la única carga del servidor.
- Requiere un runtime con soporte de adaptadores en tiempo de ejecución (TensorFold nativo con los PRs #1364 y #1372); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- El residuo de la factorización SVD (0,2–3,7% de cada delta) introduce una divergencia pequeña pero no nula frente a la release fusionada.
- No se especifican idiomas soportados ni benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K); no se puede evaluar su rendimiento general a partir de la información disponible.
- Sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada; al heredar el comportamiento del base Qwen3.5-9B, aplican los sesgos de este.
- Licencia Apache-2.0 permite uso comercial, pero los pesos de Clef-Flash y la cabeza de esquema son de Cloudflare y el base es de Qwen; conviene revisar las condiciones de cada componente original.
- Repositorio con 0 descargas y 0 likes, publicado el 2026-10-26; no hay evidencia de uso en producción más allá de la verificación del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unigilby/Qwen3.5-9B-clef-flash-adapter
- Modelo de decisión original: https://huggingface.co/Cloudflare/clef-flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- PR de TensorFold con el adaptador en tiempo de ejecución: https://github.com/ashhart/TensorFold/pull/1364
- PR de TensorFold con la carga de Qwen3.5-9B sin convertir: https://github.com/ashhart/TensorFold/pull/1372
- Issue/PR de TensorFold con el endpoint Clef y la cabeza: https://github.com/ashhart/TensorFold/pull/1361
