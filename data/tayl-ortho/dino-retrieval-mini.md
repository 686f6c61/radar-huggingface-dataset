# tayl-ortho/dino-retrieval-mini

## Resumen

dino-retrieval-mini es un repositorio experimental publicado por el usuario tayl-ortho en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo entrenado ni de un checkpoint con resultados publicados: la propia model card lo describe como un esqueleto de código ("codebase") para experimentar con arquitecturas de recuperación (retrieval) basadas en DINO, deliberadamente dimensionado en escala "small" para poder inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. El peso incluido (`model.safetensors`) es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests), no un modelo listo para producción.

El artefacto principal es el script `train.py`, acompañado de `config.json` (ajustes de arquitectura) y `training_args.json` (receta de experimento por defecto). La arquitectura declarada combina atención dilatada, fusión mediante cross attention, activación gelu-tanh y normalización LayerNorm. El recuento real de parámetros en safetensors es de 49.600, un tamaño ínfimo coherente con un modelo de juguete para validar el pipeline, no con un encoder visual o de recuperación funcional.

Su relevancia es por tanto metodológica y de andamiaje: sirve como punto de partida reproducible para quien quiera experimentar con recuperación multimodal usando DINO, con la advertencia explícita del autor de que no se reclama ninguna métrica de benchmark y de que cualquier resultado futuro debe documentarse por separado de los valores por defecto aquí incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINO (atención dilatada, fusión por cross attention, activación gelu-tanh, LayerNorm) |
| Parámetros totales | 49.600 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura declarada es DINO con atención dilatada y fusión mediante cross attention, activación gelu-tanh y normalización LayerNorm, en escala "small". El repositorio no proporciona detalles sobre el número de capas, dimensión oculta, número de cabezas ni tamaño de las imágenes de entrada; esa información residiría en `config.json`, que no se ha incluido en la información disponible.

No hay evidencia de entrenamiento: el autor indica explícitamente que el checkpoint `model.safetensors` es una inicialización válida para smoke tests y que no se presenta como un checkpoint entrenado ni evaluado. La receta de experimento por defecto usa el optimizador Adam con un schedule de warmup lineal, descritos como valores de partida del script y no como resultado de una ejecución completada. No se documenta número de tokens, composición del dataset, ni fases de RLHF/DPO o ajuste fino.

## Capacidades

- No se documentan capacidades funcionales de inferencia: el checkpoint no está entrenado.
- El repositorio está orientado a experimentación con recuperación (retrieval) sobre la arquitectura DINO.
- El script `train.py` incluye un punto de entrada ejecutable con un ejemplo de smoke test en su bloque `__main__`.
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni modos especiales (thinking, visión, audio).
- La carga mediante APIs automáticas genéricas requiere un adaptador explícito, según advierte el autor.

## Casos de uso

- Prototipado de arquitecturas de retrieval: el repositorio permite modificar la configuración de atención dilatada y cross attention y validar que el pipeline compila y ejecuta antes de invertir en un entrenamiento completo.
- Pruebas de humo de infraestructura: el checkpoint de inicialización y `train.py` sirven para verificar que el entorno (PyTorch, versiones de CUDA, carga de safetensors) funciona correctamente antes de escalar.
- Investigación comparativa de baselines: la model card sugiere entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, lo que convierte al repo en una plantilla para experimentos controlados.
- Reproducibilidad de recetas: `training_args.json` fija una receta por defecto (Adam con warmup lineal) que puede versionarse junto con los logs de entrenamiento y las versiones del entorno.
- Evaluación en Flickr30k: el autor propone usar Flickr30k como primer conjunto de evaluación, reportando la métrica de la tarea en al menos tres semillas, lo que encaja con un flujo de evaluación de recuperación imagen-texto.
- Docencia y formación: por su tamaño reducido (49.600 parámetros) y su estructura de ficheros clara, es adecuado para explicar cómo se organiza un proyecto de entrenamiento de retrieval sin requerir hardware significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint incluido no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 49.600 parámetros el checkpoint ocupa una fracción mínima de memoria, pero al no ser un modelo entrenado no procede estimar requisitos de inferencia real.
- GPU recomendadas: no disponible; para ejecutar `train.py` en modo smoke test basta con CPU o cualquier GPU con soporte PyTorch.
- Cabe en cualquier GPU de consumo: sí, por el tamaño ínfimo del checkpoint de inicialización.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor indica que las APIs automáticas genéricas requieren un adaptador explícito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no incluye comparaciones con otros modelos, no declara categoría de modelo entrenado y no publica métricas que permitan situarlo frente a alternativas de retrieval.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.
- No se reclama ningún resultado de benchmark; cualquier cifra atribuida al modelo sería inventada.
- El repositorio debe tratarse como un punto de partida experimental, no como un artefacto listo para producción.
- La carga con APIs automáticas genéricas requiere un adaptador explícito por tratarse de una implementación personalizada.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos.
- Aunque la licencia es Apache 2.0, el autor recomienda revisar por separado los términos de los datos de origen cuando se usen datasets externos.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tayl-ortho/dino-retrieval-mini
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
