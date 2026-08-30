# svkuznetsov/tiny-transformer-retrieval

## Resumen

El modelo `svkuznetsov/tiny-transformer-retrieval` es una implementación minimalista de un transformer de escala nano orientada a tareas de retrieval (recuperación de información). Lo desarrolla el usuario svkuznetsov y se publica bajo licencia Apache 2.0. No se trata de un modelo entrenado, sino de un punto de partida reproducible: incluye un checkpoint de inicialización válido para pruebas de humo, junto con el código fuente (`train.py`), la configuración de arquitectura (`config.json`) y los argumentos de entrenamiento por defecto (`training_args.json`).

La arquitectura emplea atención dilatada (dilated attention), fusión mediante cross-attention, activación ReLU y normalización InstanceNorm. El modelo tiene 33.088 parámetros, un tamaño extremadamente reducido que lo hace ejecutable incluso en hardware muy limitado. Su relevancia actual reside en servir como base experimental para investigar técnicas de retrieval con transformers pequeños, no como un modelo listo para producción.

La model card del autor advierte explícitamente que el checkpoint no está entrenado ni auditado, y que no se reivindica ningún resultado de benchmark. Es, por tanto, un recurso didáctico y de investigación, no un modelo funcional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (escala nano) |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer personalizado de escala nano, implementado en PyTorch. Según la model card, utiliza atención dilatada (dilated attention) en lugar de la atención estándar, lo que reduce el coste computacional al aumentar el campo receptivo de forma controlada. La fusión de información se realiza mediante cross-attention, probablemente para combinar consultas y documentos en el contexto de retrieval. La activación es ReLU y la normalización es InstanceNorm, una elección poco común en transformers (habitualmente se usa LayerNorm), lo que sugiere un diseño experimental orientado a estabilidad en dominios específicos.

No se proporcionan datos sobre el entrenamiento: no se indica el número de tokens, la composición del dataset ni el uso de RLHF o DPO. El repositorio incluye una receta de entrenamiento por defecto con el optimizador LAMB y un programador de tasa de aprendizaje por pasos, pero el propio autor aclara que son valores iniciales y no evidencian una ejecución completada. El checkpoint `model.safetensors` es solo una inicialización para pruebas de humo, no un modelo entrenado.

## Capacidades

- No tiene capacidades funcionales reales al ser un checkpoint de inicialización sin entrenamiento.
- La arquitectura está diseñada para retrieval, lo que implica que podría aprender a representar consultas y documentos en un espacio vectorial compartido si se entrena adecuadamente.
- Soporta ejecución de pruebas de humo mediante el script `train.py`, que incluye un ejemplo generado en el bloque `__main__`.
- No es compatible con las APIs genéricas de carga automática de HuggingFace; requiere un adaptador explícito por ser una implementación personalizada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación educativa: sirve como ejemplo de implementación de un transformer desde cero, permitiendo estudiar el efecto de la atención dilatada y la InstanceNorm en tareas de retrieval.
- Experimentación con modelos de tamaño mínimo: su reducido número de parámetros (33K) facilita pruebas de concepto en entornos con recursos muy limitados, como CPUs de un solo núcleo o incluso microcontroladores.
- Base para estudios de scaling laws: al ser un punto de partida reproducible, se puede entrenar con distintos volúmenes de datos para analizar la relación entre capacidad y rendimiento en retrieval.
- Evaluación de estrategias de inicialización: el checkpoint permite comparar el comportamiento de distintas semillas y configuraciones de arranque en experimentos controlados.
- Desarrollo de adaptadores de carga: al no ser un modelo estándar, puede usarse como caso de prueba para escribir wrappers personalizados que integren arquitecturas custom en pipelines de HuggingFace.
- Docencia en deep learning: el código y la configuración son lo bastante simples como para utilizarse en cursos de arquitecturas transformer, mostrando componentes como cross-attention y normalización alternativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindica ninguna puntuación y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33.088 parámetros, el modelo ocupa aproximadamente 132 KB en fp32, por lo que cabe en cualquier GPU o CPU moderna.
- GPU recomendadas: no se requiere GPU; es ejecutable en CPU convencional. Incluso un Raspberry Pi podría manejarlo.
- Compatibilidad con GPUs de consumo: sí, cualquier GPU con al menos 1 GB de VRAM es más que suficiente.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Solo puede ejecutarse mediante el script `train.py` o un adaptador propio.
- Latencia y throughput: no disponibles; al no haber un modelo entrenado, no tiene sentido medir estos parámetros.

## Comparativa con modelos similares

No disponible. Este modelo es un checkpoint de inicialización sin entrenar, con un tamaño inusualmente pequeño (33K parámetros) y una arquitectura experimental. No existen modelos comparables en la misma categoría (transformers nano para retrieval con atención dilatada) que hayan publicado resultados. Los proyectos encontrados en la búsqueda web (por ejemplo, `avvorstenbosch/tinyTransformer` o `skolouri/TinyTransformer`) son implementaciones didácticas sin relación directa con este repositorio.

## Limitaciones y advertencias

- El checkpoint no está entrenado: cualquier uso en producción o evaluación seria es inválido.
- No se ha auditado el modelo en términos de robustez, sesgos o transferencia de dominio.
- La implementación es personalizada y no compatible con las APIs estándar de HuggingFace; requiere adaptadores específicos.
- No se proporcionan datos sobre el contexto máximo soportado ni sobre los idiomas, por lo que no es posible garantizar su comportamiento en ningún escenario real.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un modelo sin entrenar, su valor comercial es nulo sin un proceso de entrenamiento completo.
- Cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse por separado, sin mezclarlo con los valores por defecto del repositorio.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/svkuznetsov/tiny-transformer-retrieval)
- No se han encontrado otros enlaces relevantes (paper, blog o repositorio asociado) en la búsqueda web.
