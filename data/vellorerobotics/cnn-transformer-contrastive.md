# Vellorerobotics/cnn-transformer-contrastive

## Resumen

`Vellorerobotics/cnn-transformer-contrastive` es un repositorio de código, no un modelo preentrenado en el sentido habitual. Contiene una implementación compacta y personalizada en PyTorch de una arquitectura CNN Transformer con objetivo contrastivo, publicada bajo licencia MIT por el usuario Vellorerobotics. El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, y el propio autor indica explícitamente que no se presenta como un checkpoint entrenado ni evaluado en ningún benchmark.

La escala real del artefacto es mínima: 16.576 parámetros totales según el fichero de pesos, lo que lo sitúa cuatro o cinco órdenes de magnitud por debajo de cualquier modelo utilizable en producción. La configuración declarada es "base", con atención dispersa, fusión de bajo rango, activación ReLU y normalización LayerNorm. No se documentan tokenizador, ventana de contexto, idiomas soportados ni pipeline de HuggingFace.

Su relevancia es, por tanto, formativa y de ingeniería: sirve como punto de partida reproducible para revisar código, validar pipelines de entrenamiento y ejecutar experimentos controlados a pequeña escala antes de escalar a arquitecturas mayores. No debe emplearse como componente funcional en un sistema real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN Transformer (híbrida convolucional + transformer) |
| Escala declarada | base |
| Parámetros totales | 16.576 (según safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publica safetensors; el script no documenta cuantización) |
| Idiomas soportados | No disponible (no se declara ninguno) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización) |
| Atención | Dispersa (sparse) |
| Fusión | De bajo rango (low rank) |
| Activación | ReLU |
| Normalización | LayerNorm |
| Optimizador del recipe | AdamW con schedule de tipo step |
| Pipeline de HuggingFace | No disponible |
| Descargas / likes | 10 / 0 |
| Tamaño del repositorio | 0.0 GB |
| Fecha de creación (HuggingFace) | 2026-10-21 |

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con bloques transformer, según la tabla de la model card: atención dispersa, fusión de bajo rango entre ramas, activación ReLU y LayerNorm. No se publican detalles de implementación de la atención dispersa (patrón de máscara, ratio de sparsity) ni de la fusión de bajo rango (rango efectivo, dimensionalidad de las proyecciones), por lo que la reproducibilidad exacta depende de leer `config.json` e `inference.py` en el repositorio.

No hay evidencia de un entrenamiento completado. El autor describe el checkpoint como "valid initialization checkpoint for smoke tests" y el recipe (`training_args.json`, AdamW + schedule step) como valores de partida, no como resultado de una ejecución. No se documenta número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado; tampoco se declara ninguna innovación técnica medida (decodificación especulativa, atención lineal, etc.). El objetivo contrastivo se anuncia en los tags y en el título, pero sin checkpoint entrenado no existen representaciones útiles que explotar.

## Capacidades

- Ejecución de código de referencia: el repositorio incluye `inference.py` con un bloque `__main__` de prueba de humo, `config.json` y `training_args.json`.
- Punto de partida para experimentos contrastivos controlados: permite montar un bucle de entrenamiento y comparar configuraciones con exposición de datos, presupuesto de tuning y semillas idénticas.
- Validación de infraestructura: sirve para comprobar carga y guardado de safetensors, registro de modelos y pipelines de CI sin coste de cómputo.
- No hay evidencia de generación de texto, razonamiento, código, matemáticas, visión ni audio: no es un modelo de lenguaje y no se documenta tokenizador.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües declaradas.
- Sin modo "thinking", sin entrada multimodal y sin API estándar de carga: al ser una implementación propia, las APIs automáticas de HuggingFace requieren un adaptador explícito.

## Casos de uso

- Revisión de código y auditoría técnica: el repositorio está pensado para leer y discutir la implementación de una CNN Transformer con atención dispersa y fusión de bajo rango; es adecuado como material de revisión por su tamaño reducido y su licencia MIT.
- Prueba de humo de pipelines de entrenamiento: ejecutar `python inference.py --help` y el bloque `__main__` permite verificar que el entorno (PyTorch, versiones CUDA, carga de safetensors) funciona antes de lanzar un job real.
- Baseline de juguete en experimentos contrastivos: con 16.576 parámetros, se puede usar como referencia mínima para validar que las métricas, el logging y la selección de checkpoint funcionan, antes de sustituirlo por un modelo de capacidad real.
- Integración continua de infraestructura de modelos: útil como fixture en tests que validan conversión de formatos, cálculo de hashes, empaquetado del repositorio o serving con código propio.
- Docencia y formación interna: ejemplo autocontenido de arquitectura híbrida con CNN, atención dispersa y LayerNorm, sin la complejidad de un modelo grande.
- Validación de herramientas de serialización: al ser un safetensors pequeño (decenas de kilobytes), permite probar conversores, validador de tensores y scripts de migración de forma rápida y determinista.
- Experimentos de reproducibilidad: el recipe por defecto (AdamW + schedule step) sirve para ensayar protocolos de comparación con tres semillas y baseline de capacidad equivalente, tal y como recomienda el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado. El autor recomienda, para una evaluación útil, emplear un conjunto de validación específico de la tarea, reportar la métrica sobre al menos tres semillas e incluir un baseline de capacidad equivalente, conservando los logs de entrenamiento y las versiones del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 66 KB en fp32, 33 KB en fp16 y 16,6 KB en int8 para los pesos puros (16.576 parámetros). El consumo real está dominado por el runtime de PyTorch (del orden de cientos de MB), no por el modelo.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte CUDA funciona, e incluso una GPU integrada es suficiente. Una A100 o H100 estaría completamente desaprovechada.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650) y también en CPU.
- Opciones de despliegue: al ser una arquitectura personalizada, no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza ejecutando `inference.py` con PyTorch, o mediante un adaptador propio que registre la arquitectura.
- Latencia y throughput: no disponibles. Con este número de parámetros la latencia de cómputo es despreciable frente a la sobrecarga de Python y del framework.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| cnn-transformer-contrastive (este repositorio) | 16.576 | No disponible | MIT | Checkpoint de inicialización, sin entrenar ni evaluar |
| Alternativas públicas equivalentes | No disponible | No disponible | No disponible | No se han identificado en la información disponible |

No se han identificado modelos comparables en la misma categoría (CNN Transformer con objetivo contrastivo en escala "base" y ~16.000 parámetros). A esta escala no existe un ecosistema de modelos publicados con benchmarks que permita una comparación funcional; cualquier referencia de tamaño superior (modelos de millones o miles de millones de parámetros) sería una comparación de escala, no de tarea, y resultaría engañosa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: las salidas no tienen significado semántico y no deben interpretarse como predicciones.
- No hay benchmarks, evaluación de robustez, fairness ni transferencia de dominio; el propio autor lo declara.
- No se documentan sesgos conocidos porque no hay datos de entrenamiento ni evaluación que los puedan revelar.
- Riesgo de alucinación no aplicable en el sentido de un modelo de lenguaje, pero sí riesgo de expectativas incorrectas: el repositorio no es un modelo listo para producción.
- Longitud de contexto e idiomas no documentados; no se puede asumir soporte multilingüe ni ventanas largas.
- Licencia MIT: permite uso comercial y modificación, pero el autor advierte de revisar por separado los términos de los datos de origen cuando se use con datasets externos.
- Las APIs automáticas de HuggingFace no cargan esta arquitectura sin un adaptador explícito; hay que implementar el registro del modelo.
- Ecosistema mínimo (10 descargas, 0 likes, repositorio de 0.0 GB) y sin issues ni soporte documentado: el mantenimiento no está garantizado.
- Cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse por separado de los valores por defecto que se distribuyen aquí.

## Enlaces

- HuggingFace: https://huggingface.co/Vellorerobotics/cnn-transformer-contrastive
- No se han encontrado otros enlaces (paper, blog, repositorio de código o demo) en la información disponible.
