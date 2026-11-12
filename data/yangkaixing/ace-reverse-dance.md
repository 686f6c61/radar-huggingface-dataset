# yangkaixing/ACE-Reverse-Dance

## Resumen

ACE Reverse Dance es un conjunto de checkpoints intermedios de un modelo de generación de movimiento (motion generation) orientado a danza, publicado por el usuario yangkaixing en Hugging Face. No se trata de un modelo de lenguaje, sino de un modelo de difusión o generativo de secuencias de movimiento esquelético, entrenado con la librería PyTorch bajo el proyecto ACE. El repositorio contiene dos snapshots de entrenamientos en curso: una ejecución "Reactive" (7.605 actualizaciones del optimizador, época 182 en progreso) y una ejecución "Responsive" (época 1.800 completada, 12.600 actualizaciones).

Ambos ficheros incluyen los state dictionaries online y EMA, el normalizador nativo y la configuración del snapshot. El modelo está pensado para usarse con el runtime y los codecs de ACE correspondientes a la ejecución de entrenamiento original. El tamaño del repositorio es de 1,6 GB.

La relevancia de esta publicación es limitada: son snapshots intermedios exportados mientras el entrenamiento seguía activo, sin métricas de validación ni revisión de aceptación del movimiento generado. No hay información pública sobre arquitectura, licencia, idiomas ni benchmarks, por lo que debe tratarse como material de investigación preliminar y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo generativo de movimiento para danza, implementado en PyTorch) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica: genera movimiento, no texto) |
| Licencia | no disponible |
| Formato de pesos | state dictionaries de PyTorch (checkpoint nativo), con estados online y EMA, normalizador nativo y configuración de snapshot |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de red, número de capas, dimensión de las representaciones de movimiento, codecs utilizados). La model card únicamente indica que se trata de snapshots intermedios de dos ejecuciones de entrenamiento iniciadas el 2026-11-11, con la librería PyTorch y las etiquetas `motion-generation` y `dance`.

Los datos de entrenamiento disponibles son los del estado de las ejecuciones: la ejecución Reactive alcanzó 7.605 actualizaciones del optimizador con la época 182 en progreso, y la ejecución Responsive completó la época 1.800 con 12.600 actualizaciones. Las pérdidas reportadas son pérdidas de entrenamiento, no de validación. Los "run receipts" no contienen métricas sobre conjuntos reservados (held-out) ni una revisión de aceptación del movimiento generado. El manifiesto `snapshot-manifest.json` contiene la procedencia y los checksums SHA-256 de los ficheros.

## Capacidades

- Generación de movimiento de danza a partir de las entradas definidas por el runtime ACE (la model card no detalla las modalidades de condicionamiento).
- Dos variantes de comportamiento: Reactive (snapshot online, 7.605 actualizaciones) y Responsive (snapshot EMA, época 1.800 completada).
- Carga de checkpoints nativos en PyTorch con el normalizador incluido; el normalizador de Reactive requiere el módulo `dataset` del runtime al cargar el checkpoint nativo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento, dado que no es un modelo de lenguaje.

## Casos de uso

- Investigación en generación de movimiento: usar los snapshots como punto de partida para comparar el estado del entrenamiento entre las ejecuciones Reactive y Responsive en experimentos académicos.
- Reproducción de experimentos: cargar los checkpoints con el runtime ACE y los codecs de la ejecución original para reproducir las condiciones de entrenamiento documentadas en `snapshot-manifest.json`.
- Fine-tuning posterior: partir del snapshot Responsive (EMA, época 1.800) como inicialización para un entrenamiento adicional de danza con un dataset propio.
- Evaluación de la estabilidad del entrenamiento: analizar la evolución de las pérdidas de entrenamiento entre ambos snapshots para estudiar la dinámica de optimización del proyecto ACE.
- Prototipado de pipelines de animación: integrar el movimiento generado en herramientas de animación 3D, siempre que se valide previamente la calidad del output, ya que no existe revisión de aceptación publicada.
- Estudio de normalizadores y codecs: reutilizar el normalizador nativo incluido en los checkpoints para experimentar con la representación del movimiento en el runtime ACE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las pérdidas reportadas son de entrenamiento y que no existen métricas sobre conjuntos reservados ni revisión de aceptación del movimiento generado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño de los pesos no se detalla; el repositorio completo ocupa 1,6 GB, lo que sugiere que la inferencia podría caber en GPUs de consumo, pero no se confirma).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (1,6 GB) es compatible con GPUs de consumo típicas, pero se desconoce el consumo real en inferencia.
- Opciones de despliegue: runtime ACE con PyTorch (requisito explícito de la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de generación de movimiento de danza ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- Snapshots intermedios: ambos entrenamientos seguían activos en el momento de la exportación, por lo que los pesos no representan modelos finales convergidos.
- Sin métricas de validación: no hay resultados sobre conjuntos reservados ni revisión de aceptación del movimiento generado; la calidad del output no está verificada.
- Dependencia del runtime: es necesario usar el runtime ACE y los codecs exactos de la ejecución de entrenamiento; el normalizador de Reactive requiere el módulo `dataset` del runtime al cargar el checkpoint nativo.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- Riesgo de seguridad: la model card advierte de cargar checkpoints únicamente desde fuentes de confianza; los pesos de PyTorch pueden ejecutar código arbitrario al deserializarse.
- Idiomas: no aplica, al no ser un modelo de texto; no hay información sobre sesgos en el movimiento generado.
- Sin soporte documentado: no hay documentación sobre limitaciones de contexto, sesgos conocidos ni comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/yangkaixing/ACE-Reverse-Dance
