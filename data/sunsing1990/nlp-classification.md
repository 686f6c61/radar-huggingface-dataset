# sunsing1990/nlp-classification

## Resumen

El repositorio `sunsing1990/nlp-classification` contiene una implementación experimental de un modelo **Perceiver** orientado a tareas de clasificación de texto. El autor, sunsing1990, publica un código base con una configuración deliberadamente sencilla para poder inspeccionar los cambios de arquitectura antes de lanzar un entrenamiento completo. El checkpoint incluido (`model.safetensors`) es un estado de inicialización válido para pruebas de humo, no un modelo entrenado ni auditado.

La arquitectura es un Perceiver con atención multi-query, fusión tipo Tucker, activación GELU aproximada y normalización por capas. El tamaño total es de 33.088 parámetros, lo que lo convierte en un modelo extremadamente ligero, pensado como punto de partida para experimentación, no para uso en producción. La relevancia actual es limitada: no aporta capacidades entrenadas ni resultados de evaluación, pero puede servir como referencia didáctica para estudiar el mecanismo Perceiver en tareas de clasificación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (escala base) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo Perceiver, que procesa entradas de alta dimensión mediante un conjunto fijo de latentes y atención cruzada. En esta implementación concreta se usa atención multi-query, fusión Tucker para combinar representaciones, activación GELU aproximada y normalización por LayerNorm. La configuración está recogida en `config.json`.

No se proporcionan datos sobre el entrenamiento: no hay información sobre el número de tokens, la composición del dataset, ni técnicas como RLHF o DPO. El archivo `training_args.json` documenta una receta por defecto con optimizador Adam y programación de tasa de aprendizaje one-cycle, pero el propio autor indica que son valores iniciales del script, no evidencia de una ejecución completada. El checkpoint `model.safetensors` es únicamente una inicialización válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación, pero al no estar entrenado no tiene capacidad funcional demostrada.
- No se han documentado capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o soporte multilingüe.
- El repositorio no incluye ningún benchmark ni evaluación sobre conjuntos de datos reales.
- La única capacidad comprobable es la carga del checkpoint de inicialización y la ejecución de un ejemplo de humo mediante `python model.py --help`.

## Casos de uso

- No se recomienda ningún caso de uso en producción: el checkpoint no ha sido entrenado ni validado, por lo que los resultados serían aleatorios o basados en pesos de inicialización.
- Uso educativo: puede servir para estudiar la implementación de la arquitectura Perceiver y cómo se configura un modelo de clasificación con este esquema.
- Pruebas de integración: como punto de partida para verificar que el código carga el modelo y ejecuta una pasada hacia adelante en un entorno de desarrollo.
- Desarrollo de arquitecturas experimentales: los investigadores pueden partir de este código base para modificar la fusión, la atención o la normalización antes de entrenar a gran escala.
- Benchmark de referencia: si se entrena posteriormente, puede utilizarse como línea base de capacidad mínima en comparación con modelos más grandes.
- No se recomienda su uso en aplicaciones reales de atención al cliente, generación de código, análisis de sentimiento o cualquier otra tarea productiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación de evaluación en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB, dado que el modelo tiene 33.088 parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cualquier tarjeta moderna (por ejemplo, NVIDIA GTX 1650 o superior) puede ejecutar el modelo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser una implementación personalizada, se requiere un adaptador explícito para usar APIs de carga genéricas.
- Latencia y throughput: no disponibles, aunque por el tamaño del modelo la latencia sería del orden de microsegundos en cualquier hardware moderno.

## Comparativa con modelos similares

No se puede establecer una comparativa fiable porque el modelo no está entrenado y no tiene resultados evaluados. Existen otros clasificadores de texto como BERT-base (110 millones de parámetros) o RoBERTa-base (125 millones), pero todos ellos han sido preentrenados y tienen benchmarks publicados. No es posible comparar un checkpoint de inicialización con modelos funcionales.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no tiene capacidad de clasificación real, solo pesos de inicialización.
- No ha sido auditado para robustez, equidad ni transferencia a dominios específicos.
- No se declaran idiomas soportados; se desconoce si el modelo funciona con algún idioma en particular.
- La licencia BSD-3-Clause permite uso comercial, pero el modelo no es útil para producción por falta de entrenamiento.
- Para una evaluación significativa, el autor recomienda entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y documentar los resultados por separado.
- La implementación es experimental y puede contener errores; no es apta para entornos productivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sunsing1990/nlp-classification
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la búsqueda web.
