# ViniciusAlvesson/cnn-transformer-contrastive-baseline

## Resumen

`ViniciusAlvesson/cnn-transformer-contrastive-baseline` es un repositorio experimental que contiene una implementación propia de una arquitectura híbrida CNN-Transformer orientada a aprendizaje contrastivo, publicada por el usuario ViniciusAlvesson en Hugging Face. No se trata de un modelo entrenado ni de un lanzamiento con pesos funcionales: el checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo (smoke tests), tal y como declara explícitamente la model card.

El repositorio incluye el código fuente (`inference.py`), la configuración de arquitectura (`config.json`), una receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización. La arquitectura se describe como "Cnn Transformer" con atención multi-query, fusión por co-atención, activación approx-gelu y normalización LayerNorm. El autor la etiqueta como variante "giant", aunque el recuento real de parámetros del checkpoint safetensors es de 16.576, lo que indica que se trata de un modelo de juguete o de una configuración mínima, no de un modelo a escala de producción.

Su relevancia es, por tanto, académica y de prototipado: sirve como punto de partida reproducible para experimentar con arquitecturas híbridas convolucionales-transformer y objetivos contrastivos, no como un modelo listo para desplegar. No se han publicado resultados de benchmarks ni se reclama ningún rendimiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-Transformer híbrida (atención multi-query, fusión por co-atención, activación approx-gelu, LayerNorm) |
| Parametros totales | 16.576 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con bloques transformer bajo un esquema de atención multi-query y fusión mediante co-atención, con activación approx-gelu y normalización LayerNorm. El objetivo declarado es el aprendizaje contrastivo, aunque la model card no detalla la función de pérdida concreta, la composición del dataset ni el volumen de tokens empleados en un entrenamiento real.

El repositorio no contiene un modelo entrenado. El checkpoint `model.safetensors` es una inicialización para pruebas de humo, y la receta por defecto (`training_args.json`) especifica el optimizador RMSprop con un schedule de warmup constante. El autor advierte que estos valores son puntos de partida del script y no evidencia de una ejecución completada, y recomienda entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias para una evaluación significativa. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación.

## Capacidades

- Implementación de referencia de una arquitectura CNN-Transformer con atención multi-query y co-atención, pensada para investigación y experimentación.
- Objetivo de aprendizaje contrastivo (representaciones), no generación de texto.
- Punto de partida reproducible para pruebas de humo y comparación de baselines.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se declara modo "thinking", soporte de audio ni ninguna capacidad especial.

## Casos de uso

- Prototipado de arquitecturas híbridas CNN-Transformer: usar el código y la configuración como base para experimentar con co-atención y atención multi-query en tareas de representación.
- Investigación en aprendizaje contrastivo: emplear el esqueleto para probar funciones de pérdida contrastivas sobre pares de datos, sustituyendo el checkpoint de inicialización por un entrenamiento propio.
- Baseline reproducible en experimentos académicos: el repositorio ofrece configuración y receta explícitas para comparar contra otras arquitecturas con el mismo presupuesto de cómputo.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite verificar que el flujo de carga, forward pass y guardado funciona antes de lanzar entrenamientos largos.
- Docencia y formación: ejemplo didáctico de implementación de un transformer con fusión por co-atención y atención multi-query en PyTorch.
- Integración en investigación de representaciones multimodales: la co-atención sugiere un diseño para fusionar dos modalidades o flujos de features, útil como punto de partida en experimentos de alineamiento entre modalidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado que el checkpoint tiene 16.576 parámetros y el repositorio ocupa 0.0 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador explícito; el autor indica ejecutar `python inference.py --help` y revisar el bloque `__main__` del script. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría con datos verificables en la información proporcionada, y el repositorio no incluye baselines de referencia con métricas publicadas.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo funcional.
- No se ha auditado robustez, equidad ni transferencia de dominio.
- No hay benchmarks ni métricas de rendimiento publicadas.
- No se documentan idiomas soportados ni longitud de contexto.
- No es compatible con APIs genéricas de carga automática sin un adaptador explícito.
- La licencia BSD-3-Clause permite uso comercial, pero el autor advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- El recuento de parámetros (16.576) contradice la etiqueta "giant" de la model card; conviene tratar cualquier afirmación de escala con cautela.
- No apto para producción sin un entrenamiento y una evaluación previos.

## Enlaces

- Hugging Face: https://huggingface.co/ViniciusAlvesson/cnn-transformer-contrastive-baseline
