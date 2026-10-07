# wwhitemorgan/course-retrieval28

## Resumen

Cnn Transformer for Retrieval es un prototipo de investigación publicado por el usuario wwhitemorgan en HuggingFace bajo el identificador `wwhitemorgan/course-retrieval28`. Se trata de una implementación personalizada de tipo CNN Transformer orientada a tareas de recuperación (retrieval), con una configuración declarada de escala "giant" y una serie de decisiones arquitectónicas concretas: atención de ventana deslizante (sliding window), fusión con compuertas (gated fusion), activación approx gelu y normalización por batchnorm.

El repositorio no contiene un modelo entrenado. Según la propia model card, el archivo `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests), y el autor indica explícitamente que no se reclama ninguna puntuación de benchmark. El peso real registrado en safetensors es de 33.088 parámetros, un tamaño muy reducido que confirma su naturaleza de andamiaje experimental más que de modelo listo para producción.

Su relevancia es, por tanto, limitada y de carácter didáctico o de investigación: sirve como punto de partida reproducible para experimentar con una arquitectura híbrida CNN-Transformer aplicada a recuperación, y como plantilla para configurar recetas de entrenamiento. No hay datos de idiomas soportados, ni pipeline declarado, ni descargas o interacciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (hibrida CNN + Transformer) |
| Parametros totales | 33.088 (dato real extraido de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como "Cnn Transformer", una combinación de componentes convolucionales y de atención. Los detalles declarados son: atención de ventana deslizante (sliding window), mecanismo de fusión con compuertas (gated fusion), función de activación approx gelu y normalización mediante batchnorm. La escala declarada es "giant", si bien el número real de parámetros registrado en safetensors (33.088) es muy bajo, lo que sugiere que la etiqueta de escala corresponde a una plantilla de configuración más que a un modelo de ese orden de magnitud.

En cuanto al entrenamiento, no se ha completado ninguno. La model card especifica que la receta de experimento por defecto usa el optimizador rmsprop con un esquema de aprendizaje de tipo step, pero aclara que son valores de arranque del script y no evidencia de una ejecución finalizada. No se documentan número de tokens, composición del dataset, ni etapas de RLHF, DPO o ajuste por instrucciones. El autor recomienda, para cualquier evaluación futura, entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- No se declara ninguna capacidad funcional verificada, dado que el checkpoint publicado es una inicialización sin entrenar.
- Arquitectura orientada a recuperación (retrieval), presuntamente aplicable a tareas de búsqueda o emparejamiento de representaciones, aunque sin resultados que lo confirmen.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni idiomas soportados.
- No se documentan capacidades especiales (modo thinking, visión, audio, etc.).
- Se proporciona un punto de entrada ejecutable (`finetune.py`) con un ejemplo de prueba de humo en su bloque `__main__`.

## Casos de uso

- Investigación sobre arquitecturas híbridas CNN-Transformer: el repositorio sirve como base reproducible para estudiar cómo se comporta una combinación de convoluciones y atención de ventana deslizante en tareas de recuperación, partiendo de una configuración conocida.
- Reproducción de experimentos académicos: dado que incluye `config.json` y `training_args.json`, permite fijar una receta base (optimizador rmsprop, esquema step) y comparar contra líneas base de capacidad equivalente.
- Pruebas de humo de infraestructura: al ser un checkpoint diminuto (33.088 parámetros) y en safetensors, resulta útil para validar pipelines de carga, serialización y despliegue sin consumir recursos.
- Docencia y formación: sirve como ejemplo didáctico de implementación propia de un modelo de retrieval en PyTorch, con estructura de ficheros clara y script de ajuste fino.
- Punto de partida para fine-tuning sobre datos propios: el script `finetune.py` puede adaptarse para entrenar el modelo sobre un corpus concreto, aunque requeriría trabajo previo de validación de la implementación.
- Evaluación comparativa de métricas de recuperación: la propia model card propone usar Flickr30k como primer conjunto de evaluación, reportando la métrica de la tarea sobre al menos tres semillas y con una línea base de capacidad ajustada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio. Como guía de evaluación futura, el autor sugiere emplear Flickr30k, reportar la métrica de la tarea sobre al menos tres semillas y comparar contra una línea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante; con 33.088 parámetros en safetensors, el modelo ocupa del orden de decenas de kilobytes, por lo que cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: no se especifican; cualquier GPU, incluso integrada, es suficiente para cargar el checkpoint de inicialización.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en ejecución exclusiva por CPU.
- Opciones de despliegue: la model card advierte que, al ser una implementación personalizada, las API genéricas de carga automática requieren un adaptador explícito antes de su uso. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion objetiva con alternativas.

## Limitaciones y advertencias

- El checkpoint publicado no ha sido entrenado; es una inicialización válida solo para pruebas de humo.
- El autor declara que no ha sido auditado en cuanto a robustez, equidad ni transferencia de dominio.
- No se reclama ninguna métrica de rendimiento; cualquier cifra que se atribuya al modelo carecería de respaldo en el repositorio.
- La implementación debe tratarse como un punto de partida experimental, no como un componente listo para producción.
- Al ser una implementación personalizada, las API genéricas de carga automática no funcionan sin un adaptador explícito.
- No se documentan idiomas soportados, sesgos conocidos ni riesgo de alucinación (dependerá del futuro entrenamiento, no evaluado aquí).
- Licencia bsd-3-clause: permisiva para uso comercial, pero el autor advierte que deben revisarse por separado los términos de los datos de origen cuando se use con conjuntos de datos externos.
- Cualquier resultado de un futuro checkpoint entrenado deberá documentarse de forma separada de los valores por defecto incluidos en este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wwhitemorgan/course-retrieval28
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
