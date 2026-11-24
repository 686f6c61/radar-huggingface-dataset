# volkovvasilisa/retrieval-lite

## Resumen

`retrieval-lite` es un repositorio experimental publicado por el usuario volkovvasilisa en Hugging Face que contiene una implementación de tipo PoolFormer orientada a tareas de recuperación (retrieval). No se trata de un modelo entrenado ni de un checkpoint con resultados publicados: la model card indica explícitamente que el fichero `model.safetensors` es únicamente una inicialización válida para pruebas de humo (smoke tests) y que no se reclama ninguna puntuación de benchmark. El tamaño total declarado en los safetensors es de 16.576 parámetros, lo que confirma que estamos ante un esqueleto arquitectónico mínimo, no ante un modelo utilizable en producción.

La relevancia de este repositorio es, por tanto, documental y pedagógica: sirve como base reproducible para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. La configuración registrada describe un PoolFormer a escala "tiny" con atención dilatada, fusión tipo Tucker, activación swish y normalización por instancias, junto con una receta de experimento por defecto basada en AdamW y un scheduler de tipo step. Todo ello bajo licencia Apache 2.0.

Es importante subrayar que no hay evidencia de entrenamiento, evaluación ni auditoría. Cualquier uso real requeriría entrenar el modelo desde cero con datos propios y evaluar con protocolos estándar (la propia model card sugiere Flickr30k como primer banco de pruebas).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PoolFormer (variante "tiny") |
| Parámetros totales | 16.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura declarada es un PoolFormer de escala "tiny" con atención dilatada, mecanismo de fusión Tucker, activación swish y normalización por instancias. El PoolFormer original sustituye la atención por operaciones de pooling como mecanismo de mezcla de tokens, lo que reduce el coste computacional frente a transformers clásicos; en esta implementación concreta se añaden atención dilatada y fusión Tucker, lo que sugiere un diseño híbrido orientado a capturar dependencias de largo alcance en tareas de recuperación multimodal o texto-imagen.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO). La receta por defecto registrada en `training_args.json` usa AdamW con un scheduler de tipo step, pero la model card aclara que son valores de partida del script y no evidencia de una ejecución completada. El checkpoint `model.safetensors` corresponde a una inicialización, no a un modelo entrenado.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el modelo no ha sido entrenado ni evaluado.
- El código incluye un punto de entrada ejecutable (`eval.py`) con un ejemplo de smoke test en su bloque `__main__`.
- La implementación es personalizada, por lo que las APIs genéricas de carga automática requieren un adaptador explícito.
- No hay soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No hay capacidades multilingües declaradas.
- No hay modos especiales (thinking, visión, audio) documentados.

## Casos de uso

- Prototipado de arquitecturas de retrieval: el repositorio permite modificar la configuración (atención dilatada, fusión Tucker, normalización) y verificar que el modelo compila y ejecuta antes de invertir en un entrenamiento completo.
- Pruebas de humo en pipelines de CI: `model.safetensors` sirve como checkpoint de inicialización para validar que el código de carga, el adaptador y el script de evaluación funcionan de extremo a extremo sin coste de entrenamiento.
- Investigación académica sobre PoolFormers: útil como base mínima y reproducible para comparar variantes arquitectónicas con un presupuesto de cómputo muy bajo (16.576 parámetros).
- Reproducción de experimentos controlados: la receta AdamW + step y la sugerencia de evaluar en Flickr30k con al menos tres semillas permiten construir un protocolo de comparación frente a baselines de capacidad equivalente.
- Docencia y aprendizaje: el tamaño reducido y la estructura de ficheros (`eval.py`, `config.json`, `training_args.json`) lo hacen adecuado para explicar cómo se organiza un proyecto de investigación en retrieval.
- Base para fine-tuning propio: un equipo podría partir de esta implementación, sustituir el checkpoint inicial por uno entrenado con sus datos y evaluar la tarea de recuperación con sus propias métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización razonable, dado el tamaño de 16.576 parámetros (los pesos en fp32 ocuparían aproximadamente 66 KB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: al ser una implementación personalizada, no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI; la carga requiere un adaptador explícito sobre PyTorch.
- Latencia y throughput: no disponibles; no tiene sentido medirlos sin un modelo entrenado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| retrieval-lite (este) | 16.576 | no disponible | No | Apache 2.0 | Hugging Face |
| CLIP (variantes tiny) | millones | 77 tokens (texto) | Sí | MIT / otras | Hugging Face |
| SigLIP | cientos de millones | variable | Sí | Apache 2.0 | Hugging Face |

La comparación directa no es significativa: `retrieval-lite` es un esqueleto experimental sin entrenamiento, mientras que CLIP y SigLIP son modelos de recuperación multimodal entrenados y evaluados. Se incluyen únicamente como referencia de categoría.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones útiles para retrieval.
- No ha sido auditado para robustez, equidad ni transferencia de dominio.
- No hay datos sobre sesgos, alucinación o comportamiento en contextos largos.
- No hay idiomas declarados ni evaluación multilingüe.
- La licencia Apache 2.0 permite uso comercial del código, pero los términos de los datos externos deben revisarse por separado.
- La implementación es personalizada y no es compatible con APIs de carga automática sin adaptador.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto aquí publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/volkovvasilisa/retrieval-lite
- Paper original de PoolFormer (MetaFormer): https://arxiv.org/abs/2111.11418
- Dataset sugerido para evaluación (Flickr30k): https://shannon.cs.illinois.edu/DenotationGraph/
