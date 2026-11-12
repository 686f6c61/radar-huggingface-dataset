# swaynehales/Emberon-2-mlx-4bit

## Resumen

Emberon-2 MLX 4bit es una conversión nativa a MLX del modelo Emberon-2 de Promethic Labs, un ajuste fino de Liquid AI LFM2.5-350M especializado en limpieza de dictado. Con 354.483.968 parámetros, el modelo no es un asistente general: su única función es tomar una transcripción de voz en bruto y devolver el mismo contenido como texto limpio, corrigiendo muletillas, puntuación y formato, sin responder nunca a las preguntas ni ejecutar las órdenes que aparezcan en el dictado.

La relevancia de esta distribución concreta reside en su formato: una cuantización afín de 4 bits con grupo de 64 y tensores no cuantizados en FP16, empaquetada para `mlx-lm` y ejecutable en Apple Silicon. El repositorio ocupa 0,2 GB y se distribuye bajo la LFM Open License v1.0, heredada de Liquid AI. El autor documenta de forma explícita el alcance de la validación: 11 entradas sintéticas, con coincidencia exacta frente al GGUF de origen en 9 de ellas.

El modelo está pensado para integrarse en pipelines de postprocesado de voz, no para conversación abierta. Su ventana de contexto configurada es de 128k tokens, aunque el autor advierte que la validación realizada no establece ese límite. Solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2 (base: Liquid AI LFM2.5-350M), ajuste fino para limpieza de dictado |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k configurados; no validados en esta conversión |
| Tipos de cuantizacion | 4-bit afín, group size 64; tensores no cuantizados en FP16 |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | safetensors (MLX) |
| Vocabulario | 65.536 filas de embedding, 64.402 IDs de token reales |
| Libreria | mlx-lm 0.31.3, mlx 0.32.4 (probado con Python 3.13) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia LFM2 de Liquid AI, con 354M parámetros, sobre el que Promethic Labs realizó un ajuste fino orientado exclusivamente a la limpieza de dictado. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La conversión a MLX se realizó desde el archivo `Emberon-2-F16.gguf` (SHA-256 `056a4b0889eb5b9873d9f38393f5e595fb58c6ffd82b47fde76b9169f602f5a1`). Todos los pesos ajustados provienen de ese archivo; solo la configuración y los assets del tokenizador provienen del repositorio MLX base original. Se preservan las 65.536 filas de embedding, los 64.402 IDs de token reales, las fusiones BPE y la plantilla de chat. No se requiere código remoto del modelo. La validación local cubrió recarga nativa, integridad de tensores y configuración, paridad de tokens de prompt y 11 entradas sintéticas de dictado.

## Capacidades

- Limpieza de texto dictado: corrige puntuación, mayúsculas y formato, y elimina muletillas y repeticiones propias del habla.
- Postprocesado de voz a texto: pensado para colocarse detrás de un motor ASR y antes de la entrega final del texto.
- No responde preguntas ni ejecuta órdenes: las preguntas y comandos presentes en la transcripción se devuelven como texto limpio.
- Formato conversacional con plantilla de chat (roles system/user) y decodificación greedy recomendada.
- Capacidad multilingüe: no disponible; solo inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; fuera del propósito del modelo.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Postprocesado de dictado en aplicaciones de notas: el modelo se sitúa tras el motor ASR y devuelve texto limpio con puntuación y mayúsculas correctas, aprovechando su especialización exclusiva en esta tarea.
- Integración en herramientas de productividad en macOS: al ejecutarse con `mlx-lm` en Apple Silicon y ocupar 0,2 GB, puede empaquetarse en apps nativas de dictado sin dependencia de servicios en la nube.
- Transcripción de reuniones: limpieza de segmentos dictados o transcritos antes de volcarlos a un acta, con la salvaguarda de conservar el texto bruto si la generación alcanza el límite de tokens.
- Accesibilidad: postprocesado de entrada por voz para usuarios con dificultades motoras, convirtiendo dictados con muletillas en texto legible.
- Pipelines de subtitulado y documentación: normalización de transcripciones antes de su publicación, manteniendo el contenido semántico sin responder a las preguntas que aparezcan en el audio.
- Prototipado e investigación en ASR: modelo pequeño y ligero para experimentar con etapas de cleanup en cascadas de reconocimiento de voz, con licencia LFM Open v1.0 que debe revisarse antes de uso comercial.
- Procesamiento por lotes en local: al ser un modelo de 354M en 4 bits, permite limpiar grandes volúmenes de dictados en hardware de consumo Apple sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta validación cualitativa: coincidencia exacta de texto con el GGUF de origen en 9 de 11 entradas sintéticas; una entrada larga difiere en una sola coma y la entrada de estrés repetitiva diverge antes del límite. El autor advierte que este conjunto reducido no establece equivalencia amplia de precisión ni reproduce los benchmarks publicados del GGUF upstream.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio ocupa 0,2 GB; la inferencia en 4 bits requiere del orden de 0,3-0,5 GB de memoria unificada, incluyendo overhead de runtime.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para CUDA.
- GPU de consumo: sí, cabe holgadamente en cualquier Mac con Apple Silicon; en GPUs NVIDIA requeriría otra conversión (GGUF o safetensors estándar), no incluida en este repo.
- Opciones de despliegue: `mlx-lm` 0.31.3 con `mlx` 0.32.4; el GGUF de origen permite llama.cpp, pero esta distribución es específica de MLX.
- Latencia y throughput: no disponibles de forma medida; por el tamaño (354M en 4 bits) se espera generación interactiva en Apple Silicon, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Emberon-2 MLX 4bit (este) | 354M | 128k configurados (no validados) | en | LFM Open v1.0 | safetensors MLX 4-bit |
| PromethicLabs/Emberon-2 (base) | 354M | no disponible | en | LFM Open v1.0 | safetensors / GGUF |
| LiquidAI/LFM2.5-350M | 350M | no disponible | no disponible | LFM Open v1.0 | safetensors |
| Emberon-2-Q4_K_M.gguf (upstream) | 354M | no disponible | en | LFM Open v1.0 | GGUF 4-bit |

## Limitaciones y advertencias

- No es un asistente general: no debe usarse para responder preguntas ni ejecutar comandos; solo limpia texto.
- Riesgo de pérdida de contenido o repeticiones en dictados largos o repetitivos, incluido en el GGUF F16 original.
- Si la generación alcanza el límite de tokens, la respuesta debe descartarse y conservar la transcripción bruta; el autor lo marca como fallo.
- Solo inglés; se reportaron diferencias de tokenización en 8 de 57 entradas sintéticas con palabras no inglesas frente a llama.cpp, sin que se haya establecido el impacto en la calidad.
- La validación cubre 11 entradas; no demuestra equivalencia amplia de precisión ni el límite de contexto de 128k.
- Licencia LFM Open v1.0: es necesario revisar los términos originales antes de uso comercial y conservar LICENSE y NOTICE al redistribuir.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: el modelo puede alterar contenido al "limpiar"; el autor recomienda retener siempre la entrada bruta como respaldo.

## Enlaces

- Hugging Face: https://huggingface.co/swaynehales/Emberon-2-mlx-4bit
- Modelo base: https://huggingface.co/PromethicLabs/Emberon-2
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Promethic Labs: https://www.promethic.xyz
- Documentación MLX LM: https://github.com/ml-explore/mlx-lm
