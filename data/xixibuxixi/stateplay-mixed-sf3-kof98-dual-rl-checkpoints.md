# xixibuxixi/StatePlay-Mixed-SF3-KOF98-Dual-RL-Checkpoints

## Resumen

StatePlay Mixed SF3 + KOF98 Dual RL es un snapshot multi-checkpoint de un entrenamiento por refuerzo (RL) en curso sobre un modelo de mundo generativo de video. Lo publica el usuario xixibuxixi en Hugging Face y no es un modelo autónomo: todos los checkpoints son deltas (pesos de política actual) que se aplican sobre una base congelada, el backbone Wan de 5B de la etapa previa (`StatePlay-Mixed-SF3-KOF98-5B-step2000`). El repositorio sirve para comparar de forma controlada varias actualizaciones de política, no para desplegar un modelo listo para producción.

El entrenamiento combina dos fuentes de datos de videojuegos de lucha, Street Fighter III y KOF98, y ajusta un módulo de transición más un LoRA de acoplamiento (rank 32, alpha 64) con 14.444.800 parámetros entrenables en 271 tensores. El backbone Wan 5B permanece congelado y no se duplica en el repo. La generación se hace con rollouts de 101 fotogramas a 480×832, 30 pasos de denoising y 20 FPS.

Su relevancia es acotada y experimental: documenta un pipeline de post-entrenamiento por RL para modelos de mundo de video, incluye el adaptador del modelo de recompensa (LoRA sobre Qwen3.5-9B) y preserva estados de reanudación exactos. No hay benchmarks de calidad publicados ni evaluación independiente del modelo de recompensa, y la licencia no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo generativo de video StatePlay sobre backbone DiT Wan 5B (congelado), con módulo de transición y coupling LoRA |
| Parámetros totales | No disponible para el conjunto; 14.444.800 parámetros entrenables en este snapshot (271 tensores); backbone Wan 5B no incluido |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (rollout de 101 fotogramas por condición) |
| Tipos de cuantización | No disponible (pesos en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PyTorch); checkpoints de política de ~57,8 MB cada uno y estados de reanudación completos |

## Arquitectura y entrenamiento

La base es un modelo de mundo StatePlay construido sobre un transformer DiT Wan de 5B parámetros con estado implícito, según la información del repositorio hermano `StatePlay-KOF98-MoT-5B-step1250`, que describe un DiT BF16 de etapa 2 más un tokenizador de transición de etapa 1. En este snapshot el backbone Wan está congelado y lo que se entrena es el módulo de transición junto con un LoRA de acoplamiento de rango 32 y alpha 64, con learning rate de 1e-4 para el LoRA y 2e-5 para la transición, 2 épocas internas y acumulación de gradiente de 4.

El post-entrenamiento es RL con rollouts de 101 fotogramas a 480×832, 30 pasos de denoising y 20 FPS, agrupando 4 vídeos por condición. La mezcla de datos combina Street Fighter III y KOF98. El modelo de recompensa es un adaptador LoRA (rango 32, alpha 64, 80.216.064 parámetros entrenables) sobre Qwen3.5-9B, entrenado hasta el paso 300 de optimizador. El snapshot contiene seis checkpoints (pasos 0, 8, 128, 133, 134 y 134 con cursor distinto), con estados de reanudación en esquema `mixed-dual-checkpoint-v3` que incluyen política actual, política de referencia, optimizador, estado RNG, cursor y ledger.

## Capacidades

- Generación de vídeo condicionada por estado en el dominio de videojuegos de lucha (Street Fighter III y KOF98), a 480×832, 20 FPS y 101 fotogramas por rollout.
- Modelado de mundo con estado implícito: el módulo de transición aprende la dinámica entre fotogramas y acciones.
- Post-entrenamiento por RL con modelo de recompensa basado en un LLM (Qwen3.5-9B con LoRA).
- Reanudación exacta del entrenamiento mediante checkpoints completos con verificación SHA256.
- Comparación controlada de políticas en distintos pasos de optimizador.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en RL para modelos generativos de vídeo: comparar las políticas de los pasos 0, 8, 128 y 134 para medir el efecto de cada actualización sobre la calidad del rollout.
- Reproducción de experimentos: los estados de reanudación permiten continuar el entrenamiento exactamente desde el cursor y el ledger registrados.
- Estudio de modelos de mundo en videojuegos de lucha: analizar cómo el módulo de transición captura la dinámica de combate en SF3 y KOF98.
- Evaluación de modelos de recompensa LLM: usar el adaptador Qwen3.5-9B como referencia para estudiar el sesgo y la calibración de recompensas en vídeo.
- Diagnóstico fino de entrenamiento: los checkpoints de ventana de optimizador (pasos 133 y 134) permiten inspeccionar cambios dentro de una misma ventana.
- Base para experimentos derivados: partir del snapshot para probar variantes de LoRA de acoplamiento o de mezcla de datos, siempre sobre el backbone Wan 5B de la dependencia base.
- Auditoría de integridad de artefactos: el manifiesto y los SHA256 permiten verificar la cadena de dependencias y la reproducibilidad del snapshot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación independiente de la calidad del modelo de recompensa no se había completado en el momento del snapshot y que este no debe tratarse como un benchmark calibrado sin validación adicional.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 2,9 GB, pero los checkpoints de política (~57,8 MB cada uno) no son modelos autónomos; hay que cargar además el backbone Wan 5B de la dependencia base, cuyo consumo no se documenta.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama o TGI no aparecen); la carga requiere el código de entrenamiento y el loader `mixed_dual` del run.
- Latencia y throughput: no disponibles. Los rollouts usan 30 pasos de denoising a 480×832 y 20 FPS, pero no se publican tiempos de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StatePlay Mixed SF3 + KOF98 Dual RL (este) | 14,4 M entrenables + backbone Wan 5B | No disponible | Sin benchmarks publicados | No disponible | Hugging Face |
| StatePlay-KOF98-MoT-5B-step1250 | DiT BF16 de 5B (etapa 2) | No disponible | Sin benchmarks publicados | No disponible | Hugging Face |
| StatePlay-Mixed-SF3-KOF98-5B-step2000 (base) | Backbone Wan 5B | No disponible | Sin benchmarks publicados | No disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: los archivos de `policy_weights/` no son modelos Wan 5B fusionados y cargarlos directamente en un Wan vanilla deja los tensores de coupling LoRA sin registrar.
- Requiere el código de entrenamiento y la configuración exactos del run para una carga correcta.
- Licencia no declarada: no hay autorización explícita para uso comercial ni condiciones de redistribución.
- El modelo de recompensa no está validado de forma independiente; no debe usarse como referencia calibrada.
- El entrenamiento RL seguía activo tras el snapshot (2026-11-07 19:59:31 CST), por lo que faltan checkpoints posteriores.
- Dominio muy restringido: vídeo de videojuegos de lucha (SF3 y KOF98); no hay evidencia de generalización a otros dominios.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Idiomas y contexto: no disponibles, lo que impide planificar su uso en aplicaciones de texto o multilingües.
- Uso previsto experimental y de comparación controlada, no de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-Mixed-SF3-KOF98-Dual-RL-Checkpoints
- Modelo base (dependencia): https://huggingface.co/xixibuxixi/StatePlay-Mixed-SF3-KOF98-5B-step2000
- Repositorio relacionado: https://huggingface.co/xixibuxixi/StatePlay-KOF98-MoT-5B-step1250
- Modelo de recompensa base: https://huggingface.co/Qwen/Qwen3.5-9B
