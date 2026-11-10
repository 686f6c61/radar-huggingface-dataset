# tahamajs/qwen-2.5-0.5b-adaptive-svd-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-adaptive-svd-attention-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario tahamajs. Consiste en un transplante de mecanismo de atención sobre el modelo base Qwen2.5-0.5B: se sustituye la atención original por una implementación denominada `adaptive_svd_attention`, registrada en un `ATTENTION_REGISTRY` del framework NeuralOps, y se realiza un proceso de destilación (KD, knowledge distillation) sobre el dataset WikiText-2.

El modelo no es un modelo de producción ni una versión oficial de Qwen. Es un artefacto de investigación que documenta un intento de "cirugía" arquitectónica con un patrón híbrido `hybrid_3_1`. Los resultados reportados en la model card son negativos: la perplejidad causal previa a la destilación es de 213589.22 y la posterior es `inf`, es decir, el proceso de destilación no consiguió recuperar un modelo funcional y la perplejidad diverge.

Por tanto, este repositorio debe interpretarse como un registro de un experimento fallido o en curso, no como un modelo utilizable. El tamaño del repositorio es de 0.0 GB, lo que sugiere que los pesos no están efectivamente alojados o que el repo solo contiene metadatos. No hay descargas ni likes, y la licencia e idiomas no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-0.5B) con atención sustituida por `adaptive_svd_attention` (patrón `hybrid_3_1`) |
| Parametros totales | 0.5B (heredados del modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de 0.5 mil millones de parámetros. Sobre esa base se aplica un "transplante" de atención: se reemplaza el mecanismo original por `adaptive_svd_attention`, una implementación registrada en el `ATTENTION_REGISTRY` del framework NeuralOps. El patrón de cirugía es `hybrid_3_1`, lo que sugiere una combinación de capas con atención original y capas con la nueva atención en una proporción 3:1, aunque la model card no detalla el esquema exacto.

El entrenamiento posterior consiste en una destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA RTX 3090 en 60.9 segundos. Los resultados reportados son: perplejidad causal previa a la destilación de 213589.22 y posterior de `inf`. Esto indica que el transplante de atención degrada severamente el modelo y que la destilación no logra recuperarlo; la perplejidad infinita implica una distribución de probabilidad degenerada. No se documentan tokens de entrenamiento, composición del dataset más allá de WikiText-2, ni uso de RLHF/DPO.

## Capacidades

- No se puede confirmar ninguna capacidad funcional: la perplejidad posterior a la destilación es `inf`, lo que indica que el modelo no genera texto coherente.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay información sobre modos especiales (thinking, vision, audio).
- El único dato objetivo es que el experimento se realizó sobre WikiText-2 con fines de modelado de lenguaje causal.

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: el repo sirve como referencia de un intento de sustituir la atención estándar por `adaptive_svd_attention` y documentar el impacto en perplejidad. Útil para comparar con otras cirugías arquitectónicas.
- Reproducción de experimentos de destilación: el tiempo de 60.9 s en RTX 3090 y el pipeline sobre WikiText-2 permiten replicar el setup para estudiar por qué la KD falla con atención transplantada.
- Estudio de fallos en transplantes de atención: la perplejidad `inf` es un caso límite útil para analizar inestabilidad numérica en implementaciones SVD de atención.
- Benchmark de frameworks de cirugía (NeuralOps): permite evaluar el `ATTENTION_REGISTRY` y el patrón `hybrid_3_1` frente a alternativas.
- Docencia sobre riesgos de modificar arquitecturas preentrenadas sin reentrenamiento completo: ejemplo de degradación catastrófica.
- No es adecuado para ningún caso de uso en producción, generación de texto, código, atención al cliente ni tareas downstream.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Pre-KD causal PPL (WikiText-2) | 213589.22 |
| Post-KD causal PPL (WikiText-2) | inf |
| PPL delta | +inf |
| Tiempo de destilación | 60.9 s (NVIDIA RTX 3090) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con fiabilidad, dado que el modelo no es funcional. Para un transformer de 0.5B en fp16 se necesitarían aproximadamente 1 GB de VRAM, pero la implementación `adaptive_svd_attention` puede añadir overhead no cuantificado.
- GPU recomendadas: el autor usó una NVIDIA RTX 3090 para la destilación; no hay datos de inferencia.
- Cabe en GPU consumer (cualquier GPU con ≥2 GB de VRAM en teoría para 0.5B en fp16), pero la falta de pesos en el repo (0.0 GB) impide confirmarlo.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-adaptive-svd-attention-wikitext2 | 0.5B | no disponible | no disponible | Experimental, PPL `inf` |
| Qwen2.5-0.5B (base) | 0.5B | 32k (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Producción |
| Qwen2.5-1.5B | 1.5B | 32k (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Producción |
| SmolLM2-360M | 0.36B | 8k (según documentación oficial) | Apache 2.0 (según documentación) | Producción |

La comparativa se limita a modelos de tamaño similar; el modelo de tahamajs no es funcional y no compite en rendimiento con ninguno de ellos. Los datos de contexto y licencia de los modelos de referencia provienen de su documentación pública, no de la información proporcionada en este repo.

## Limitaciones y advertencias

- El modelo no es funcional: la perplejidad posterior a la destilación es `inf`, lo que indica una distribución degenerada.
- El repositorio tiene 0.0 GB, por lo que es probable que los pesos no estén disponibles o solo se incluyan metadatos.
- No hay licencia declarada: riesgo legal para cualquier uso, incluido el comercial.
- No hay información sobre sesgos, pero al derivar de Qwen2.5-0.5B heredaría los sesgos del modelo base, agravados por la degradación.
- Riesgo de alucinación: máximo, dado que el modelo no produce salidas coherentes.
- No hay garantías de soporte de idiomas ni de contexto.
- No apto para producción, investigación aplicada ni evaluación de capacidades.
- El experimento se realizó en 60.9 s sobre WikiText-2, lo que sugiere una destilación muy corta y posiblemente insuficiente.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-adaptive-svd-attention-wikitext2
- Modelo base Qwen2.5-0.5B: no disponible en la información proporcionada
- Paper o blog de NeuralOps / `adaptive_svd_attention`: no disponible
- Repositorio del framework NeuralOps: no disponible
- Dataset WikiText-2: no disponible en la información proporcionada
