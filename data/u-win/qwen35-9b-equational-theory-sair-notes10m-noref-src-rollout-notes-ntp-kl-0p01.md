# U-WIN/qwen35-9b-equational-theory-sair-notes10m-noref-src-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-notes10m-noref-src-rollout-notes-ntp-kl-0p01` es un ajuste fino completo de `Qwen/Qwen3.5-9B` desarrollado por U-WIN dentro de un proyecto de investigación sobre internalización de teoría ecuacional en modelos de lenguaje. El nombre describe el corpus de entrenamiento, no el número de parámetros: se entrenó sobre 10 millones de tokens de notas de estudio del modelo base más 5,1 millones de tokens de notas de rollout generadas por el propio modelo base. El checkpoint resultante conserva los 9.653.104.368 parámetros del modelo original.

El modelo es un transformer multimodal (pipeline `image-text-to-text`) con licencia Apache 2.0. Su propósito no es la inferencia general, sino servir como artefacto de investigación: demostrar si un modelo puede internalizar conocimiento matemático (teoría ecuacional, con implicaciones demostradas en Lean) a partir de notas auto-generadas que no contienen soluciones de referencia. Se publica como evidencia reproducible de un experimento concreto, no como modelo de producción.

Es relevante ahora porque documenta una receta de ajuste fino con regularización KL sobre un pool de repetición congelado, con trazabilidad completa (resumen de entrenamiento, manifiesto de artefactos con SHA-256, log de W&B) y una honestidad metodológica poco habitual: el autor declara explícitamente que el modelo no ha sido evaluado en ningún benchmark y que las notas de entrenamiento contienen errores de veredicto en torno al 14% de los casos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), pesos de texto ajustados y componentes de visión congelados |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican safetensors en precisión de servicio; el autor sugiere `dtype="auto"`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo de todos los pesos de lenguaje. Los componentes de visión son los del modelo base y no fueron evaluados en calidad multimodal. La receta es next-token prediction sobre filas empaquetadas de 17.408 tokens (una fila por GPU), 2 épocas, learning rate 5e-06 con decaimiento coseno y 3% de warmup, más un término de regularización `0.01 × KL(base || student)` sobre un pool de repetición congelado de trayectorias generadas por el modelo base (usado solo como regularizador, nunca como objetivo). El entrenamiento se ejecutó en 8 × GH200, 224 pasos de optimizador, 44 minutos, en el job Slurm 1147837 de TACC Vista.

Los datos de entrenamiento combinan 16.737 notas de estudio del modelo base (10.000.050 tokens, prefijo íntegro del orden sembrado) con 5.602 notas de rollout (5.072.228 tokens, mediana de 871 tokens por nota), sumando 15.072.278 tokens y 889 filas empaquetadas por época. Las notas de rollout fueron escritas por el modelo base tras revisar sus propios intentos de solución puntuados por un juez, sin solución de referencia pero con las fuentes de estudio de teoría ecuacional (páginas de leyes, implicaciones demostradas con pruebas Lean, dualidades, fundamentos). Se generó una sesión por problema sobre 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas), con selección libre de fuentes (lectura, glob, grep; máximo 20 respuestas). El control de calidad es explícitamente débil: ninguna nota se verificó contra el veredicto correcto, cerca del 14% concluye solo el veredicto equivocado y solo 674 de las 3.421 notas sobre problemas falsos contienen un contraejemplo funcional verificable (cota inferior).

## Capacidades

- Generación de texto y razonamiento sobre teoría ecuacional, heredadas del ajuste sobre notas de estudio y rollouts.
- Entrada multimodal imagen-texto por arquitectura (pipeline `image-text-to-text`), aunque la calidad multimodal no fue evaluada.
- Conversacional: la model card incluye plantilla de chat y procesadores completos.
- Formato de pesos compatible con `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni capacidades multilingües específicas.

## Casos de uso

- Reproducción de investigación: cargar el checkpoint con la revisión `main` o `epoch-1` para replicar el experimento de internalización de teoría ecuacional y comparar las pérdidas de validación publicadas (0,333 y 0,339 en notas de estudio; 0,127 y 0,128 en trayectorias base).
- Estudio de recetas de regularización KL: el par `epoch-1`/`epoch-2` permite analizar el efecto del término KL (0,060 frente a 0,053 en el pool de validación) sobre el olvido catastrófico, usando el modelo base como referencia (1,245 y 0,145 de pérdida held-out).
- Auditoría de calidad de datos sintéticos: las notas de rollout con ~14% de veredictos erróneos y solo 674 contraejemplos verificables sirven como caso de estudio para diseñar verificadores automáticos en pipelines de datos auto-generados.
- Línea base para evaluación de razonamiento matemático: al no estar evaluado en benchmarks, es un punto de partida neutro para medir si el ajuste sobre notas propias mejora o degrada tareas de teoría ecuacional frente al Qwen3.5-9B original.
- Docencia e investigación sobre alineación: el uso de un juez que puntúa sin escribir evaluación, y de fuentes que contienen pruebas Lean solo para problemas verdaderos, ilustra sesgos estructurales en la generación de datos.
- Experimentación con despliegue de checkpoints de investigación: los safetensors de 38,6 GB y la configuración completa permiten probar cargas con `device_map="auto"` en entornos de laboratorio con GPUs de gran memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que ninguna revisión del modelo ha sido puntuada en ningún benchmark y que las cifras publicadas son únicamente pérdidas de entrenamiento y validación:

| Métrica | Época 1 (`checkpoint-112`) | Época 2 (`checkpoint-224`, `main`) | Modelo base |
|---|---|---|---|
| Pérdida media de entrenamiento | 0,523 | 0,379 | no disponible |
| Pérdida held-out en notas de estudio originales | 0,339 | 0,333 | 1,245 |
| Pérdida held-out en trayectorias del modelo base | 0,128 | 0,127 | 0,145 |
| KL(base \|\| student) en pool de validación | 0,060 | 0,053 | no disponible |

El conjunto held-out no contiene notas de rollout, por lo que ninguna cifra mide el ajuste a notas de rollout no vistas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, 9.653 millones de parámetros en bfloat16 requieren aproximadamente 19,3 GB solo para pesos, más memoria para activaciones y caché KV.
- GPU recomendadas: el entrenamiento usó 8 × GH200; para inferencia no se especifican GPUs concretas.
- Cabe en GPU de consumo: no confirmado en la información disponible; con cuantización a 8 bits o 4 bits sería teóricamente posible en GPUs de 24 GB, pero no se publican pesos cuantizados ni se valida ese escenario.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (U-WIN, ajuste de Qwen3.5-9B) | 9.653.104.368 | no disponible | Apache 2.0 | Sin benchmarks; solo pérdidas | Hugging Face, 0 descargas |
| `Qwen/Qwen3.5-9B` (base) | 9.653.104.368 | no disponible | Apache 2.0 (según el modelo base) | No disponible en esta ficha | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada; la única comparación documentada es contra el modelo base, mediante las pérdidas held-out de la tabla de benchmarks.

## Limitaciones y advertencias

- Modelo no evaluado: ninguna revisión ha sido puntuada en benchmarks; no debe usarse como sustituto de un modelo validado en producción.
- Datos de entrenamiento con errores conocidos: aproximadamente el 14% de las notas de rollout concluyen solo el veredicto equivocado, y solo 674 de 3.421 notas sobre problemas falsos contienen un contraejemplo funcional verificable.
- Sesgo estructural de las fuentes: las fuentes de estudio contienen pruebas Lean para cada problema verdadero (abiertas en el 94% de las sesiones verdaderas) pero ninguna página sobre problemas falsos, lo que puede sesgar el comportamiento hacia veredictos afirmativos.
- Contaminación potencial por el juez: cerca del 12% de las notas mencionan al juez, lo que puede filtrar señal de la evaluación en el entrenamiento.
- Componentes de visión sin evaluar: los pesos multimodales son los del modelo base y no se midió su calidad.
- Contexto e idiomas no documentados: no se especifican la longitud de contexto efectiva ni los idiomas soportados.
- Sin cuantizaciones publicadas: no hay GGUF ni otros formatos ligeros, lo que limita el despliegue en hardware modesto.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un artefacto de investigación sin evaluación, su idoneidad para producción no está respaldada por datos.
- Trazabilidad: el autor remite a `training_summary.json` y `artifact_manifest.json` para procedencia y hashes, pero las notas de entrenamiento no se publican, lo que impide una auditoría completa del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes10m-noref-src-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefsrcn10mr20261116
- Repositorio del proyecto (receta y log): `recipe/equational_internalization/experiments/rollout_notes_noref_sources_vista_20261116/README.md` (ruta citada en la model card; no se proporciona URL directa)
