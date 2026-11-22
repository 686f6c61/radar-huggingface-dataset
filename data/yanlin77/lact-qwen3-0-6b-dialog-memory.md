# Yanlin77/lact-qwen3-0.6b-dialog-memory

## Resumen

lact-qwen3-0.6b-dialog-memory es un checkpoint de investigación publicado por Yanlin77 que implementa una rama de memoria externa basada en LaCT (Linear attention with fast weights, presumiblemente) sobre el modelo Qwen3-0.6B congelado de Alibaba. El objetivo no es ofrecer un modelo de propósito general, sino verificar un mecanismo: si una red de pesos rápidos (fast-weight network) por capa puede almacenar y recuperar información que queda fuera de la ventana de atención causal, que en este caso está limitada a los últimos 2048 tokens más 4 tokens sink.

El modelo base Qwen3-0.6B permanece completamente congelado; los únicos pesos entrenados son las 28 ramas de memoria (una por capa), que suman aproximadamente 1,06 GB en disco. La tarea de entrenamiento y evaluación es sintética: diálogos de 16 turnos con hechos inyectados ("el presupuesto del pedido V-544 es 64520 dólares") y preguntas de retención, corrección y recencia. El checkpoint incluye además código para escritura selectiva en inferencia (seleccionar solo los K turnos con mayor puntuación antes de escribir en memoria) y pseudo-repetición estilo Robins.

Su relevancia es fundamentalmente metodológica: demuestra que un mecanismo de memoria de pesos rápidos con escritura por segmento y tasas de escritura aprendidas por token puede alcanzar un exact match de 0,98 en retención fuera de ventana en la longitud de entrenamiento (16 turnos), frente a 0,00 sin escritura. No es un modelo listo para producción ni un benchmark competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-0.6B congelado) + 28 ramas de memoria LaCT con pesos rápidos SwiGLU |
| Parametros totales | 0,6B (base congelado) + ramas de memoria (~1,06 GB en `memory_weights.pt`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens de atención causal + 4 tokens sink; información anterior solo vía memoria |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | `checkpoint/memory_weights.pt` (PyTorch) + `memory_config.json`; base Qwen3-0.6B en safetensors vía Hugging Face |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-0.6B congelado con atención causal limitada a los últimos 2048 tokens más 4 tokens sink. Sobre cada una de las 28 capas se añade una rama de memoria LaCT: una red de pesos rápidos SwiGLU con la forma `f(x) = w1 (silu(w0 x) * (w2 x))`, con 4 cabezas de 512 dimensiones. Los pesos rápidos constituyen la memoria propiamente dicha; la rama lee con q y escribe pares (k, v) mediante un paso de gradiente por segmento (normalización Muon con momento) y tasas de escritura aprendidas por token. La salida de la rama se suma antes de la proyección de salida de atención (`pre_o_proj`), escalada por una compuerta aprendida inicializada a 0,1, y la lectura se calcula como diferencia respecto a los pesos rápidos iniciales (`delta_readout`). Los flags de disposición son `--mem-heads 4 --mem-head-dim 512 --mem-chunk 2048 --mem-delta-readout --mem-gate-init 0.1 --mem-qkv-init attention --mem-qkv-act none --mem-inject pre_o_proj --mem-out-ref attention`.

El entrenamiento usa datos sintéticos generados con `make_synth.py`: 10.000 diálogos de 16 turnos, ~200 palabras de relleno repetido por turno, 8 hechos por diálogo (30% corregidos después) y 4 preguntas por categoría (retención, corrección, recencia). Se usan 4 GPUs H20 de 15 GB durante unas 4,6 horas, 1.200 pasos con 8 diálogos por paso (4 GPUs × grad-accum 2), es decir 9.600 diálogos vistos una sola vez. Optimizador AdamW con lr 1e-3, 100 pasos de warm-up, decaimiento coseno hasta 1e-4, semilla 1, bf16, `flex_attention` con máscara de ventana y gradient checkpointing. La pérdida es entropía cruzada solo sobre los tokens de respuesta. La unidad de escritura es un turno de diálogo (`--min-write-tokens 0`, `--max-segment 4096`). La pérdida final de entrenamiento queda en ~0,002-0,004. El autor advierte que cada diálogo debe verse como máximo una vez: con diálogos repetidos la rama los memoriza (0,94 en los 16 diálogos de entrenamiento y 0,00 en nuevos, en una ejecución anterior).

## Capacidades

- Recuperación de hechos en diálogos sintéticos de 16 turnos cuando el hecho queda fuera de la ventana de atención (exact match 0,98 con escritura activa, 0,00 con escritura desactivada).
- Manejo de correcciones: el modelo responde con el valor más reciente cuando un hecho ha sido corregido posteriormente en el diálogo.
- Escritura selectiva en inferencia: selección de los K turnos mejor puntuados (por q·k de memoria en la capa 19 o por masa de atención del base congelado) antes de escribir en memoria.
- Pseudo-repetición (Robins-style) sobre la selección por atención: mejora de 0,696 a 0,719 con sondas de pregunta y a 0,726 con sondas + banco de claves en 32 turnos con K=8.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un checkpoint de investigación sobre una tarea sintética.
- Capacidades multilingües: no evaluadas ni documentadas.

## Casos de uso

- Verificación de mecanismos de memoria externa: sirve como referencia reproducible para investigadores que quieran comprobar si una rama de pesos rápidos por capa puede sustituir a la atención de largo alcance en un transformer pequeño.
- Estudio de escritura selectiva: el código `eval_select.py`, `audit_scores.py` y `turnsel.sh` permite comparar políticas de selección (q·k de memoria, masa de atención, oracle) sobre los mismos diálogos sintéticos.
- Reproducción de experimentos: los conjuntos de test `rc_t{16,32,64}_f8.jsonl` y el generador `make_synth.py` permiten regenerar bit a bit los datos con las semillas indicadas.
- Análisis de generalización fuera de longitud: los tests a 32 y 64 turnos permiten medir la degradación cuando el número de escrituras es 2-4 veces el visto en entrenamiento.
- Investigación sobre olvido catastrófico y repetición de datos: el hallazgo de que repetir diálogos provoca memorización (0,94 en entrenamiento, 0,00 en nuevos) es un caso de estudio útil para diseñar recetas de entrenamiento de memorias.
- Base para extensiones: al mantener Qwen3-0.6B congelado y entrenar solo las ramas, el coste de experimentación es bajo (4 × H20, 4,6 h) y el código es reutilizable para probar variantes de LaCT en otros modelos base.

## Benchmarks y rendimiento

Exact match bajo teacher forcing sobre hechos declarados fuera de la ventana de atención (`retention/beyond_window`):

| Test | Escritura activa | Escritura desactivada |
|---|---|---|
| 16 turnos (longitud de entrenamiento) | 0,98 | 0,00 |

Escritura selectiva en inferencia (40 diálogos, 160 preguntas):

| Política | 32 turnos K=4 | 32 turnos K=8 | 64 turnos K=4 | 64 turnos K=8 |
|---|---|---|---|---|
| Escribir cada turno | 0,415 | no disponible | 0,218 | no disponible |
| Turnos aleatorios | 0,126 | 0,170 | 0,041 | 0,082 |
| q·k de memoria, capa 19 | 0,719 | 0,748 | 0,612 | 0,510 |
| Masa de atención (base congelado) | 0,689 | 0,696 | 0,633 | 0,531 |
| Turno oracle | 0,763 | 0,741 | 0,728 | 0,680 |

Pseudo-repetición Robins sobre selección por atención (32 turnos): K=8 pasa de 0,696 a 0,719 (sondas de pregunta) y a 0,726 (sondas + banco de claves); K=16 pasa de 0,563 a 0,585. El autor señala que estas mejoras son pequeñas y consistentes, dentro del ruido de 160 preguntas.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. El base Qwen3-0.6B en bf16 ocupa ~1,2 GB; las ramas de memoria suman ~1,06 GB en disco. Una estimación razonable en bf16 ronda los 2,5-3 GB de pesos, más activaciones y caché, pero el autor no publica cifras.
- GPU de entrenamiento: 4 × H20 de 15 GB, ~4,6 horas para 1.200 pasos.
- GPU de inferencia recomendadas: no documentadas. Por tamaño, cualquier GPU consumer con ≥8 GB debería poder alojar los pesos, pero no hay validación publicada.
- Cabe en GPU consumer: probablemente sí (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB), aunque no verificado por el autor.
- Opciones de despliegue: el código propio (`code/lact_qwen/`, `eval_select.py`) sobre PyTorch con `flex_attention`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` de las ramas no es directamente cargable por esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables en el ecosistema público: se trata de un checkpoint de investigación con una tarea sintética, no de un modelo de propósito general. Como referencia de la familia base:

| Modelo | Parámetros | Contexto | Memoria externa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lact-qwen3-0.6b-dialog-memory | 0,6B + ramas (~1,06 GB) | 2048 + 4 sink (+ memoria) | Sí, LaCT por capa | other | Hugging Face (Yanlin77) |
| Qwen/Qwen3-0.6B | 0,6B | 32.768 tokens (según Qwen3) | No | Apache 2.0 (según Qwen3) | Hugging Face |
| Alternativas con memoria externa tipo fast weights | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor lo describe como "mechanism check, not a benchmark model". No debe usarse como modelo de producción.
- Entrenado solo con diálogos de 16 turnos; a 32 y 64 turnos el número de escrituras es 2-4 veces el visto, y parte de la mejora al escribir menos turnos puede deberse a volver al régimen entrenado, no a la selección.
- La selección es fácil en este dominio: el relleno es texto repetido y el turno con el hecho contiene el identificador de entidad de la pregunta.
- La pregunta se conoce antes de escribir: cada pregunta recibe su propia selección y su propia memoria, lo que no refleja un escenario de chat real.
- La capa 19 para `turn_qk` se encontró específicamente en este modelo (`audit_scores.py`); otros modelos requieren su propia auditoría.
- Riesgo de memorización con datos repetidos: repetir diálogos lleva a 0,94 en entrenamiento y 0,00 en nuevos.
- Sesgos conocidos: no documentados, pero al entrenar solo con datos sintéticos en inglés y con vocabulario de relleno, no hay garantía de comportamiento en dominios reales.
- Riesgo de alucinación: alto fuera del dominio sintético; el modelo no ha sido alineado con RLHF/DPO ni evaluado en tareas abiertas.
- Idiomas: no se documenta ninguno; los datos sintéticos están en inglés.
- Licencia "other": no se especifican términos de uso comercial. Hay que consultar el repositorio antes de cualquier uso más allá de investigación.
- Formato de pesos no estándar (`.pt` para las ramas): requiere el código del repositorio, no es plug-and-play con motores de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yanlin77/lact-qwen3-0.6b-dialog-memory
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Resultados y comandos de escritura selectiva: `LACT_SELECTIVE_WRITE.md` (incluido en el repositorio)
- Generador de datos: `code/scripts/make_synth.py`
- Scripts de evaluación: `code/scripts/eval_select.py`, `code/scripts/audit_scores.py`, `code/turnsel.sh`, `code/h201_grid.sh`
- Script de entrenamiento: `code/scripts/train_memory.py`, `code/run_dialog.sh`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
