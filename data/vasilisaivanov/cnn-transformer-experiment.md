# Vasilisaivanov/cnn-transformer-experiment

## Resumen

`Vasilisaivanov/cnn-transformer-experiment` es un repositorio experimental publicado en HuggingFace que contiene una implementación propia de una arquitectura híbrida denominada Cnn Transformer, orientada a tareas de generación. No se trata de un modelo entrenado ni de un lanzamiento con pesos listos para producción: el propio autor lo describe como un punto de partida reproducible de escala *tiny*, con un checkpoint de inicialización válido únicamente para pruebas de humo (*smoke tests*). El repositorio incluye el código Python con la definición del modelo y su bloque `__main__`, el `config.json` con la configuración de arquitectura, el `training_args.json` con la receta de experimento por defecto y un fichero `model.safetensors` de inicialización.

El recuento real de parámetros del checkpoint publicado en safetensors es de 24.832 parámetros, lo que lo sitúa varios órdenes de magnitud por debajo de cualquier modelo de lenguaje utilizable. La arquitectura combina atención lineal, fusión con *gating* (gated fusion), activación swish y normalización por lotes (batchnorm), una combinación poco habitual que sugiere un experimento de investigación sobre mecanismos de fusión entre componentes convolucionales y atencionales más que un intento de competir en capacidades generativas.

Su relevancia actual es limitada y muy específica: sirve como andamiaje reproducible para quien quiera estudiar o reproducir variantes híbridas CNN-transformer con atención lineal, o para validar *pipelines* de carga de arquitecturas personalizadas en HuggingFace. No dispone de datos de entrenamiento publicados, ni de benchmarks, ni de soporte multilingüe declarado, y acumula cero descargas y cero *likes* en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrida convolucional + transformer) |
| Parametros totales | 24.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; solo el checkpoint de inicialización en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Atencion | Lineal |
| Fusion | Gated fusion |
| Activacion | Swish |
| Normalizacion | BatchNorm |
| Escala declarada | Tiny |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card declara una arquitectura híbrida denominada Cnn Transformer, con atención de complejidad lineal, mecanismo de fusión con compuertas (*gated fusion*), función de activación swish y normalización por lotes. El repositorio no detalla cómo se combinan los bloques convolucionales con los bloques de atención, ni el número de capas, dimensiones ocultas o cabezas de atención; esos datos podrían extraerse del `config.json`, que no se ha facilitado en la información disponible. La elección de atención lineal apunta a un interés por reducir el coste cuadrático de la atención estándar, mientras que el uso de batchnorm en lugar de layernorm es poco frecuente en modelos transformer y suele asociarse a prototipos de investigación.

No existe entrenamiento documentado. La receta por defecto incluida en `training_args.json` especifica el optimizador AdamW con un scheduler *onecycle*, pero el propio autor aclara explícitamente que son valores de partida del script y no evidencia de una ejecución completada. No se indica número de tokens de entrenamiento, composición del dataset, si hubo RLHF, DPO u otra fase de alineamiento, ni ninguna innovación técnica validada experimentalmente. El checkpoint `model.safetensors` se describe como inicialización válida para pruebas de humo, no como un checkpoint evaluado.

## Capacidades

- Generación de texto: la *tag* `generation` y el nombre del modelo indican que la implementación está orientada a tareas generativas, pero al no estar entrenado no puede afirmarse ninguna capacidad generativa real.
- Ejecución de código de ejemplo: el repositorio incluye `eval.py` con un bloque `__main__` que contiene un ejemplo de prueba de humo ejecutable.
- Carga de pesos en safetensors: el checkpoint puede cargarse con la librería `safetensors` o mediante PyTorch.
- Integración con APIs automáticas: requiere un adaptador explícito, ya que se trata de una implementación personalizada y no de una arquitectura registrada en `transformers`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Prueba de humo de arquitecturas personalizadas: instanciar el modelo desde `config.json` y cargar `model.safetensors` para verificar que el *forward pass* se ejecuta sin errores antes de lanzar un entrenamiento real.
- Desarrollo de adaptadores de carga en HuggingFace: dado que la librería `transformers` no reconoce esta arquitectura, sirve para practicar la implementación de adaptadores que permitan usar APIs automáticas de carga con modelos personalizados.
- Reproducción de experimentos de atención lineal: el repositorio ofrece un punto de partida con atención lineal y fusión con compuertas para medir coste computacional y comportamiento frente a atención estándar en escalas pequeñas.
- Comparativa de mecanismos de fusión CNN-transformer: al incluir `training_args.json` con AdamW y *onecycle*, permite montar una línea base reproducible contra la que comparar variantes de fusión bajo el mismo presupuesto de datos y semillas.
- Aprendizaje y docencia: el tamaño de 24.832 parámetros y el código autocontenido lo hacen adecuado para explicar en un aula cómo se compone un bloque híbrido y cómo se serializa en safetensors.
- Validación de *pipelines* de evaluación: el script `eval.py` puede usarse como plantilla para construir un arnés de evaluación con conjunto de *held-out* específico de tarea, al menos tres semillas y una línea base de capacidad equivalente, tal como recomienda el autor.
- Integración en CI/CD de investigación: verificar en cada *commit* que la configuración de arquitectura y el checkpoint de inicialización siguen siendo compatibles, evitando roturas silenciosas en experimentos en curso.

En ningún caso estos casos implican uso productivo del modelo: no hay pesos entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 MB en fp32 (24.832 parámetros × 4 bytes ≈ 99,3 KB), estimación aritmética derivada del recuento de parámetros, no un dato publicado por el autor.
- GPU recomendadas: ninguna; el modelo es ejecutable en CPU sin dificultad. Cualquier GPU, incluida una integrada, es sobredimensionada para este tamaño.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo; también en CPU y en entornos sin acelerador.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, ya que ninguna de estas herramientas reconoce la arquitectura `cnn-transformer`. La vía de ejecución es PyTorch con el código del repositorio y carga del fichero safetensors.
- Latencia y throughput: no disponibles. Al no existir un entrenamiento real, cualquier cifra de latencia o caudal medida sobre el checkpoint de inicialización no sería representativa de un modelo funcional.

## Comparativa con modelos similares

No disponible. Con 24.832 parámetros y sin entrenamiento documentado, el modelo no es comparable a ninguna alternativa publicada de la misma categoría: los modelos generativos más pequeños de uso común (por ejemplo, variantes tiny de familias tipo GPT-2 o Qwen) manejan varios órdenes de magnitud más de parámetros y sí están entrenados y evaluados. La comparación relevante sería contra otras implementaciones experimentales de atención lineal o híbridos CNN-transformer publicadas como código, no como pesos, y tampoco se dispone de datos de rendimiento de este repositorio que permitan establecerla.

## Limitaciones y advertencias

- El checkpoint publicado es de inicialización: no ha sido entrenado, por lo que no produce texto coherente ni resultados útiles en ninguna tarea.
- No se han auditado sesgos, robustez ni transferencia de dominio; el propio autor lo declara en la model card.
- Riesgo de alucinación: no aplica en el sentido habitual al no existir un modelo entrenado, pero cualquier salida que se genere a partir de pesos aleatorios es por definición sin significado.
- Longitud de contexto: no declarada. Se desconoce la ventana máxima soportada por la implementación.
- Idiomas: no se declara ninguno, por lo que no puede asumirse cobertura multilingüe ni monolingüe.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si el repositorio se usa con conjuntos de datos externos.
- Compatibilidad: al ser una implementación personalizada, las APIs genéricas de carga de HuggingFace requieren un adaptador explícito; no puede cargarse como un modelo `transformers` estándar.
- Estado del repositorio: cero descargas, cero *likes* y sin resultados publicados. No hay evidencia de que exista una ejecución de entrenamiento completada con esta receta.
- Cualquier resultado futuro obtenido a partir de un checkpoint entrenado debe documentarse por separado de los valores por defecto publicados en este repositorio, tal como indica el autor.

## Enlaces

- [Modelo en HuggingFace: Vasilisaivanov/cnn-transformer-experiment](https://huggingface.co/Vasilisaivanov/cnn-transformer-experiment)

Nota: la búsqueda web asociada a esta ficha devolvió únicamente resultados sobre controladores Intel Rapid Storage Technology, sin relación alguna con el modelo. No se han encontrado papers, blogs, repositorios adicionales ni demos del proyecto.
