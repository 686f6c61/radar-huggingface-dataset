# thomasmorel/undergrad-contrastive

## Resumen

`thomasmorel/undergrad-contrastive` es un repositorio experimental publicado en HuggingFace que contiene una implementación de un Tiny Transformer orientado a tareas de aprendizaje contrastivo, configurado en una escala "nano". Lo desarrolla el usuario thomasmorel y se distribuye bajo licencia BSD-3-Clause. El modelo totaliza únicamente 16.576 parámetros, lo que lo sitúa en el rango de los transformers de juguete empleados para docencia y pruebas de humo.

El repositorio se presenta explícitamente como un punto de partida transparente y repetible: incluye el código (`run.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`). El propio autor advierte que este checkpoint no ha sido entrenado ni evaluado, y que no se reclama ninguna puntuación de benchmark. Es relevante, por tanto, no como un modelo utilizable en producción, sino como material de referencia reproducible para experimentar con arquitecturas contrastivas y validar infraestructura de despliegue.

La arquitectura combina atención lineal con fusión mediante cross attention, activación ReLU y normalización GroupNorm. No se proporciona información sobre datos de entrenamiento, idiomas soportados, longitud de contexto ni resultados de evaluación, ya que el repositorio no documenta ninguna ejecución de entrenamiento completada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (escala "nano"), atención lineal, fusión por cross attention |
| Parámetros totales | 16.576 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el formato de pesos es safetensors) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Tiny Transformer en configuración "nano" con mecanismo de atención lineal y fusión de representaciones mediante cross attention. Las decisiones de diseño documentadas incluyen activación ReLU y normalización GroupNorm en lugar de las opciones más habituales (GELU y LayerNorm). La combinación de atención lineal y cross attention sugiere un diseño pensado para emparejar o comparar dos modalidades o dos vistas dentro de un esquema contrastivo, aunque el repositorio no detalla la disposición exacta de las ramas de codificación.

La receta de entrenamiento por defecto especifica el optimizador AdamW con un schedule polinómico. El autor subraya que estos valores son puntos de partida incluidos en el script y no evidencia de una ejecución completada. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni fases de RLHF o DPO. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se declara ninguna innovación técnica adicional más allá de la combinación arquitectónica descrita.

## Capacidades

- No se ha documentado ninguna capacidad funcional demostrada, dado que el checkpoint no ha sido entrenado.
- La arquitectura está diseñada para tareas de aprendizaje contrastivo (comparación y emparejamiento de representaciones mediante cross attention).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.
- El código permite ejecutar un ejemplo de prueba de humo mediante `python run.py --help` y el bloque `__main__` del script.

## Casos de uso

- Pruebas de humo de pipelines de inferencia: al ser un checkpoint de 16.576 parámetros y peso mínimo, permite validar que un cargador de safetensors, un servidor de inferencia o un script de serialización funcionan correctamente antes de pasar a modelos reales, sin coste de cómputo apreciable.
- Línea base de capacidad emparejada en investigación: el autor recomienda explícitamente comparar contra un baseline de capacidad equivalente; este repositorio sirve como referencia mínima para experimentos contrastivos con presupuesto de cómputo ajustado.
- Material docente sobre transformers contrastivos: el código transparente y la configuración registrada permiten ilustrar en un aula cómo se ensambla atención lineal, cross attention y GroupNorm en una implementación funcional.
- Reproducibilidad de recetas de entrenamiento: `training_args.json` documenta un esquema AdamW con schedule polinómico, útil como plantilla para replicar experimentos manteniendo los mismos hiperparámetros y semillas.
- Validación de integración con frameworks personalizados: dado que es una implementación propia, requiere un adaptador explícito antes de usar APIs genéricas de carga; sirve para probar dicho adaptador.
- Benchmarking de infraestructura de bajo consumo: permite medir latencia de arranque, consumo de memoria y sobrecarga de tokenización en entornos donde el cuello de botella es el software, no el modelo.
- Análisis de estabilidad de inicialización: al ser un peso de inicialización, es útil para estudiar cómo se comportan distintas estrategias de inicialización antes de invertir en entrenamientos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que las afirmaciones de benchmark se omiten deliberadamente y que el checkpoint no ha sido evaluado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en cualquier formato razonable, dado el tamaño de 16.576 parámetros.
- GPU recomendadas: ninguna en particular; el modelo es ejecutable en CPU sin problema.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (CPU, Raspberry Pi y similares).
- Opciones de despliegue: al tratarse de una implementación personalizada, no está soportada de forma nativa por vLLM, llama.cpp, Ollama o TGI; requeriría un adaptador. La carga directa se hace mediante el propio `run.py`.
- Latencia y throughput estimados: no disponibles, pero irrelevantes en la práctica por el tamaño del modelo.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El repositorio corresponde a la categoría de transformers "nano" experimentales, para los que no se han facilitado alternativas concretas con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado, por lo que no produce salidas útiles más allá de pruebas de inicialización.
- No ha sido auditado en cuanto a robustez, equidad o transferencia de dominio, según declara el propio autor.
- No se han publicado evaluaciones ni métricas de ningún tipo.
- No se documentan sesgos conocidos, pero tampoco existe información suficiente para descartarlos.
- No hay datos sobre idiomas soportados ni longitud de contexto, lo que impide planificar su uso en cualquier tarea real.
- La licencia BSD-3-Clause permite uso comercial del código, pero el autor advierte de que los términos de los datos de origen deben revisarse por separado si se emplean datasets externos.
- Al ser una implementación personalizada, no es cargaable mediante APIs automáticas estándar sin un adaptador explícito.
- No debe presentarse ningún resultado derivado de este repositorio como si proviniera de un modelo entrenado; los futuros checkpoints entrenados deberán documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- [HuggingFace: thomasmorel/undergrad-contrastive](https://huggingface.co/thomasmorel/undergrad-contrastive)
