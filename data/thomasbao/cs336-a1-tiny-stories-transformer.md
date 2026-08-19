# ThomasBao/cs336-A1-tiny-stories-transformer

## Resumen

El modelo `ThomasBao/cs336-A1-tiny-stories-transformer` es un transformer de tamaño reducido entrenado sobre el dataset TinyStories, publicado como parte de un ejercicio académico (aparentemente la asignatura CS336, "Language Modeling from Scratch"). El autor, ThomasBao, comparte el `state_dict` y la configuración de entrenamiento tras una ejecución de 10.000 pasos en una GPU B200, alcanzando una pérdida de entropía cruzada de validación de 1,3.

Se trata de un modelo experimental orientado a la investigación y la docencia, no a producción. No se especifican la arquitectura exacta, el número de parámetros ni la licencia, lo que limita su uso fuera del ámbito educativo. Su relevancia reside en servir como ejemplo de entrenamiento de un transformer pequeño desde cero, con un coste computacional moderado y resultados reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (sin detalles adicionales) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, dado el dataset TinyStories) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch `state_dict`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna (número de capas, dimensiones, atención, etc.). Se sabe que es un transformer, entrenado durante 10.000 pasos en una GPU B200 sobre el dataset TinyStories, que consiste en cuentos cortos en inglés simplificado. El autor reporta una pérdida de validación de 1,3. No se mencionan técnicas como RLHF, DPO ni otras innovaciones. El repositorio asociado (commit en GitHub) contiene la configuración exacta del entrenamiento, pero no se ha accedido a él en esta ficha.

## Capacidades

- Generación de texto en inglés (presumiblemente, dado el dataset de entrenamiento).
- Modelo pequeño, adecuado para experimentos de investigación y aprendizaje.
- No se documentan capacidades de tool calling, agentes, razonamiento avanzado, visión ni audio.

## Casos de uso

Dado su carácter experimental y la falta de especificaciones, los casos de uso son limitados y orientados a la investigación:

- Estudio de técnicas de entrenamiento de transformers desde cero: sirve como referencia para comparar configuraciones de hiperparámetros y estrategias de optimización.
- Reproducción de experimentos en entornos académicos: el commit de GitHub permite replicar el entrenamiento y verificar los resultados.
- Evaluación de la influencia del tamaño del modelo y la cantidad de datos en la pérdida de validación.
- Pruebas de integración en frameworks de inferencia ligera (por ejemplo, cargar el `state_dict` en PyTorch para pruebas locales).
- Análisis de la capacidad de generalización de modelos pequeños en tareas de generación de texto narrativo simple.
- Comparación de métricas de pérdida entre distintas ejecuciones y configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida de entropía cruzada de validación de 1,3, que no es comparable directamente con métricas estándar como MMLU o HumanEval.

## Requisitos de hardware

- Al ser un modelo pequeño (tamaño del repositorio 0,3 GB), es probable que quepa en cualquier GPU con al menos 1-2 GB de VRAM, pero no se dispone de datos exactos.
- No se especifican GPUs recomendadas ni opciones de despliegue.
- El entrenamiento se realizó en una B200, pero la inferencia debería ser viable en hardware de consumo.
- No se conocen latencias ni throughputs.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que es un experimento educativo sin especificaciones claras, no es posible establecer una comparativa fiable con otros modelos de TinyStories o transformers pequeños.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que su uso comercial es incierto y probablemente no autorizado.
- El modelo está entrenado únicamente con cuentos infantiles en inglés, lo que limita su dominio y puede inducir sesgos en otros contextos.
- No hay garantías de calidad de generación; es un artefacto de investigación.
- La ausencia de información sobre la arquitectura y el proceso de entrenamiento dificulta la reproducibilidad completa.
- Riesgo de alucinaciones y errores gramaticales, al ser un modelo pequeño entrenado con un corpus limitado.

## Enlaces

- [HuggingFace: ThomasBao/cs336-A1-tiny-stories-transformer](https://huggingface.co/ThomasBao/cs336-A1-tiny-stories-transformer)
- [Commit de GitHub con la configuración del entrenamiento](https://github.com/thomasbao12/assignment1-basics/commit/6e4022260f26c928ae5124f297b7ee02264da2c1)
