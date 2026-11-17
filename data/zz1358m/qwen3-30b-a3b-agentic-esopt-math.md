# zz1358m/Qwen3-30B-A3B-Agentic-ESOpt-Math

## Resumen

Qwen3-30B-A3B-Agentic-ESOpt-Math es un ajuste fino de Qwen3-30B-A3B publicado por el usuario zz1358m en Hugging Face. No se trata de un modelo entrenado desde cero ni de un SFT convencional: es el resultado de aplicar Evolution Strategies (ES) con actualización de parámetros completos sobre el modelo base, en un entorno de agente matemático de tipo CLI alineado con un artículo de referencia. El objetivo declarado es mejorar el comportamiento agéntico en tareas de matemáticas mediante optimización por poblaciones y recompensa normalizada, no mediante descenso de gradiente clásico.

El checkpoint contiene 30.532.122.624 parámetros y se distribuye como estado fragmentado (sharded state) para vLLM con tensor parallelism 2, no como un `state_dict` estándar de Hugging Face. Esta decisión es deliberada: el entrenamiento usó flujos aleatorios independientes con sal por rango en cada worker de TP, y algunos parámetros replicados entre rangos no pueden representarse en un único estado no fragmentado. Cargarlo con `AutoModelForCausalLM`, con TP=1 o con cualquier TP distinto de 2 no reproduce el estado entrenado.

La relevancia del modelo es doble: por un lado, explora ES como alternativa práctica al RL con gradientes para ajustar modelos grandes; por otro, publica artefactos de reproducción (historial exacto, checksums y registros de evaluación) y documenta una corrección de checkpoint, lo que facilita auditar el proceso. La licencia Apache 2.0 y el soporte nativo en vLLM lo hacen desplegable en producción, con la restricción importante de la configuración de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), derivada de Qwen3-30B-A3B |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible en la informacion proporcionada (el modelo base Qwen3-30B-A3B activa 3B, pero no se confirma en esta ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint se publica en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint vLLM sharded_state (TP=2), requiere `load_format="sharded_state"`; no es un safetensors unico cargable con transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-30B-A3B, un transformer con mezcla de expertos (MoE) identificado en los tags como `qwen3_moe`. El ajuste no modifica la topología: se aplica sobre los parámetros completos del modelo (parameter scope: full), no sobre adaptadores de bajo rango. El proceso de optimización es Evolution Strategies con una población de 16 individuos, 20 actualizaciones (generaciones 0 a 19) y un tamaño de lote de casos de 16. La perturbación sigue un schedule coseno de sigma entre 0,001 y 0,0005, con alpha de 0,0005 y normalización de recompensa por z-score de población con `ddof=0`.

El entorno de entrenamiento es un agente CLI de matemáticas de 50 turnos alineado con un artículo (paper-aligned). El entrenamiento se ejecutó con tensor parallelism 2, y cada worker de TP usó flujos aleatorios independientes con sal por rango. Como consecuencia, el estado entrenado no es equivalente a un `state_dict` estándar: los parámetros replicados entre rangos difieren y deben preservarse en la exportación fragmentada. El repositorio incluye `es_sharded_export_manifest.json` con el hash del historial de origen, el número de generaciones replicadas, el formato de carga requerido, el tamaño de TP y los shards emitidos por worker. La model card documenta además una corrección de checkpoint: los ficheros subidos inicialmente estaban exportados de forma incorrecta y no reproducían el estado de runtime TP=2; el checkpoint sharded subido el 2026-09-18 es el correcto.

## Capacidades

- Generación de texto y razonamiento matemático, con especialización declarada en tareas de matemáticas mediante agente CLI de múltiples turnos.
- Comportamiento agéntico multi-paso: el entrenamiento se realizó en un entorno de 50 turnos, por lo que el modelo está optimizado para interacciones iterativas con herramientas y entorno.
- Razonamiento y resolución de problemas de competición: se reportan evaluaciones en DAPO y AIME2026.
- Herencia de las capacidades del modelo base Qwen3-30B-A3B (generación, código, multilingüismo, tool calling), aunque no se documentan explícitamente en la información disponible.
- No se documentan capacidades de visión, audio ni modo thinking específico en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos de competición en pipelines de evaluación: el modelo está entrenado en un entorno agéntico de 50 turnos y reporta métricas en AIME2026 y DAPO, por lo que encaja en harnesses de evaluación tipo agente que ejecutan comandos y comprueban resultados.
- Agente de cálculo simbólico con herramientas: el formato CLI de entrenamiento sugiere uso con un intérprete de Python o CAS invocado como herramienta, donde el modelo planifica pasos, ejecuta y verifica.
- Generación de soluciones paso a paso con verificación iterativa: el bucle multi-turno permite que el modelo corrija errores intermedios antes de emitir la respuesta final.
- Investigación en optimización sin gradientes: sirve como artefacto reproducible para estudiar Evolution Strategies a escala de 30B con TP=2, incluyendo historial exacto y checksums.
- Fine-tuning posterior y destilación: al ser un ajuste de parámetros completos sobre Qwen3-30B-A3B con licencia Apache 2.0, puede usarse como punto de partida para SFT o RL adicional en dominios matemáticos.
- Despliegue en inferencia de alto rendimiento con vLLM: el checkpoint está empaquetado para vLLM con `sharded_state` y TP=2, lo que permite servirlo con el mismo stack usado en entrenamiento.
- Evaluación comparativa de metodologías de RL frente a ES: los registros `repro/` permiten replicar métricas y comparar con variantes entrenadas por gradiente.

## Benchmarks y rendimiento

| Benchmark | Mean4 | Pass4 |
|---|---:|---:|
| DAPO | 50,0 | 74,0 |
| AIME2026 | 28,3 | 46,7 |

La evaluación original generó 16 muestras por problema. La fila Mean4/Pass4 corresponde al grupo con `sample_index` 12–15: Mean4 es la media de las cuatro muestras y Pass4 la media del máximo por problema sobre esas cuatro muestras. Según la model card, estos son los resultados originales de Eval16 y no se sustituyen por el replay alineado de cuatro muestras incluido como artefacto de reproducción. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El checkpoint se publica en bfloat16 y el repo ocupa 122,2 GB, por lo que la inferencia sin cuantizar requiere aproximadamente 61 GB de VRAM solo para pesos, más overhead de KV cache y activaciones.
- La carga exige vLLM con `tensor_parallel_size=2` y `load_format="sharded_state"`; no es compatible con `transformers.AutoModelForCausalLM` ni con TP=1.
- Configuración mínima recomendada: 2 GPU con al menos 40 GB cada una (A100 40GB, A100 80GB, H100, L40S 48GB) para cubrir pesos y margen de contexto.
- No cabe en una GPU de consumo individual en bfloat16; no se documentan opciones de cuantización para este checkpoint.
- Opciones de despliegue: vLLM es el único soportado explícitamente según la model card. No se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Notas |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Agentic-ESOpt-Math | 30,5B | no disponible | Apache 2.0 | vLLM sharded_state TP=2 | Ajuste por ES, agente matemático |
| Qwen/Qwen3-30B-A3B (base) | 30,5B | no disponible | Apache 2.0 | safetensors estándar | Modelo base, carga estándar con transformers/vLLM |
| Alternativas de 30B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación directa con el modelo base en los mismos benchmarks no está disponible en la información proporcionada, por lo que no puede cuantificarse la mejora atribuible al entrenamiento ES.

## Limitaciones y advertencias

- Configuración de carga rígida: solo funciona con vLLM, `load_format="sharded_state"` y TP=2. Cualquier otra configuración no reproduce el estado entrenado y puede producir salidas incorrectas.
- Historial de checkpoint defectuoso: la versión inicial del repositorio estaba exportada de forma incorrecta; es imprescindible usar los ficheros del 2026-09-18 y verificar los checksums de `repro/SHA256SUMS`.
- Evaluación limitada: los resultados se basan en 16 muestras por problema y el grupo reportado corresponde a `sample_index` 12–15; el replay alineado de cuatro muestras no sustituye las métricas originales. La varianza estadística con 4 muestras es alta.
- Especialización estrecha: el ajuste se realizó en un entorno matemático agéntico; el rendimiento en otras tareas puede degradarse respecto al modelo base y no se documenta.
- Idiomas soportados no documentados; no hay garantía explícita de comportamiento multilingüe más allá de lo heredado del base.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada.
- Uso comercial permitido por Apache 2.0, pero el autor no ofrece garantías sobre el checkpoint ni sobre la reproducibilidad fuera de la configuración TP=2.
- El modelo tiene 85 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación con validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/zz1358m/Qwen3-30B-A3B-Agentic-ESOpt-Math
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Manifiesto de exportación: `es_sharded_export_manifest.json` (incluido en el repositorio)
- Artefactos de reproducción: `repro/dapo_eval16.json`, `repro/aime2026_eval16.json`, `repro/metrics.json`, `repro/es_history_theta20.json`, `repro/aligned_history_replay_eval4.json`, `repro/SHA256SUMS` (incluidos en el repositorio)
- Paper de referencia del entorno matemático: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
