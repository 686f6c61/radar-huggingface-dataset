# yusuketku/poolformer-contrastive-tryout

## Resumen

Poolformer for Contrastive (identificador `yusuketku/poolformer-contrastive-tryout`) es un repositorio experimental publicado por el usuario yusuketku en HuggingFace. Contiene una implementación funcional de la arquitectura PoolFormer aplicada a aprendizaje contrastivo con una configuración denominada "nano". El autor declara explícitamente en la model card que el repositorio prioriza código transparente y pruebas de humo reproducibles, y que no se reclama ninguna puntuación de benchmark.

La arquitectura de partida, PoolFormer, procede del trabajo MetaFormer is Actually What You Need for Vision (Sea AI Labs), que demuestra que un token mixer tan sencillo como un pooling permite obtener resultados competitivos en visión por computador. Este repositorio traslada ese enfoque a un esquema contrastivo e incorpora atención de tipo grouped query, fusión mediante concat MLP, activación GELU y normalización BatchNorm.

El modelo es relevante únicamente como punto de partida reproducible para experimentación, no como modelo desplegable: el checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, suma 49.600 parámetros y no dispone de entrenamiento completado ni de evaluación documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PoolFormer (familia MetaFormer), configuración nano |
| Parámetros totales | 49.600 |
| Parámetros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en safetensors; no se documenta ningún esquema de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Tipo de atención | Grouped query |
| Fusión | Concat MLP |
| Activación | GELU |
| Normalización | BatchNorm |
| Optimizador por defecto | AdamW con schedule exponencial |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

PoolFormer se enmarca en la familia MetaFormer: en lugar de diseñar un token mixer complejo, aplica un pooling por promedio sobre la vecindad espacial de los tokens, manteniendo el resto del bloque (normalización, MLP, conexiones residuales) sin cambios. En el artículo original, esta decisión permite alcanzar un 82,1 % de top-1 en ImageNet-1K con la variante de referencia, superando a DeiT-B y ResMLP-B24 con un 35 % y un 52 % menos de parámetros respectivamente, según los datos recogidos en la documentación de MMPretrain.

La configuración concreta de este repositorio es una variante nano con atención grouped query, fusión concat MLP, activación GELU y normalización BatchNorm. La receta de experimento por defecto registrada en `training_args.json` usa AdamW con un schedule exponencial, pero el propio autor aclara que son valores de arranque del script y no evidencia de una ejecución completada. El checkpoint `model.safetensors` se presenta explícitamente como inicialización para pruebas de humo, no como resultado de entrenamiento.

Conviene señalar una posible ambigüedad de nomenclatura: el término "Poolformer" también se utiliza en el trabajo Recurrent Networks with Pooling for Long Sequences (arXiv 2510.02206), un desarrollo distinto orientado a secuencias largas con mecanismos recurrentes. La arquitectura de este repositorio corresponde a la línea MetaFormer de visión, no a esa segunda línea.

## Capacidades

- Generación de texto, razonamiento, matemáticas y código: no disponible. El checkpoint no ha sido entrenado, por lo que no cabe esperar ninguna de estas capacidades en su estado actual.
- Visión por computador: la arquitectura base está diseñada para tareas de visión, pero esta configuración nano no ha sido entrenada ni evaluada en ninguna tarea concreta.
- Aprendizaje contrastivo: el script `finetune.py` implementa el flujo de trabajo orientado a objetivos contrastivos y constituye el artefacto principal del repositorio.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, visión-a-texto): no disponible.

## Casos de uso

- Prueba de humo en CI/CD: ejecutar `python finetune.py --help` y el bloque `__main__` del script para verificar que el pipeline de entrenamiento se instancia correctamente antes de lanzar ejecuciones reales en un clúster.
- Prototipado de arquitecturas MetaFormer: usar la configuración nano como banco de pruebas para validar cambios en el token mixer (pooling frente a atención) sin incurrir en costes de cómputo elevados.
- Reproducibilidad y docencia: el repositorio separa `config.json`, `training_args.json` y el script principal, lo que facilita explicar la relación entre hiperparámetros y arquitectura en un curso o taller.
- Estudio comparativo de token mixers en aprendizaje contrastivo: con 49.600 parámetros, es viable entrenar múltiples variantes con distintas semillas y presupuestos de ajuste en CPU, siguiendo la recomendación de evaluación del propio autor.
- Base para el desarrollo de un adaptador: dado que es una implementación propia, integrarla con APIs genéricas de carga automática exige escribir un adaptador explícito, lo que sirve como ejercicio de empaquetado de modelos personalizados.
- Investigación en eficiencia computacional: el tamaño del modelo permite experimentar con despliegue en entornos sin GPU, incluidos dispositivos embebidos, para estudiar compromisos entre capacidad y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que el repositorio omite deliberadamente cualquier afirmación de rendimiento y que el checkpoint incluido no es un modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Con 49.600 parámetros en fp32 el peso ocupa aproximadamente 198 KB.
- GPU recomendadas: no se requiere GPU. La ejecución es viable en CPU convencional.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU de consumo e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI sin un adaptador previo, ya que se trata de una implementación personalizada. El punto de entrada documentado es el script PyTorch `finetune.py`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yusuketku/poolformer-contrastive-tryout` | 49.600 | no disponible | Sin benchmark declarado (checkpoint sin entrenar) | apache-2.0 | HuggingFace |
| PoolFormer de referencia (Sea AI Labs) | no disponible en la información proporcionada | No aplica (visión) | 82,1 % top-1 en ImageNet-1K en su variante de referencia | no disponible | Transformers, MMPretrain |
| DeiT-B | no disponible en la información proporcionada | No aplica (visión) | Superado por PoolFormer por 0,3 puntos de exactitud | no disponible | no disponible |
| ResMLP-B24 | no disponible en la información proporcionada | No aplica (visión) | Superado por PoolFormer por 1,1 puntos de exactitud | no disponible | no disponible |

La comparación directa con las variantes de referencia de PoolFormer no es significativa en términos de rendimiento, ya que este repositorio no ha sido entrenado y su escala es varios órdenes de magnitud inferior.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicialización sin entrenar. No se ha auditado su robustez, equidad ni transferencia de dominio, tal como advierte el propio autor.
- No existe evaluación en ningún conjunto de datos held-out, ni métrica de tarea, ni comparación con líneas base de capacidad equivalente.
- El repositorio no declara pipeline ni idiomas soportados, por lo que no hay garantías de comportamiento en ningún dominio concreto.
- Al ser una implementación personalizada, no es cargable mediante APIs automáticas estándar (`AutoModel`) sin escribir un adaptador explícito, lo que complica su integración en plataformas de servicio de modelos.
- El aprendizaje contrastivo depende de la definición de pares positivos y negativos; el repositorio no documenta qué dataset ni qué estrategia de muestreo se debe emplear.
- Con 49.600 parámetros, la capacidad del modelo es muy reducida incluso si se entrenara hasta convergencia, lo que limita su aplicabilidad a tareas reales.
- La licencia apache-2.0 permite uso comercial del código y los pesos, pero el propio autor recomienda revisar por separado los términos de los datos de origen si se utiliza con conjuntos externos.
- No se han publicado registros de entrenamiento, versiones de entorno ni semillas, por lo que la reproducibilidad efectiva de cualquier resultado futuro no está garantizada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yusuketku/poolformer-contrastive-tryout
- Documentación de PoolFormer en Transformers: https://huggingface.co/docs/transformers/model_doc/poolformer
- Documentación de PoolFormer (versión main): https://huggingface.co/docs/transformers/main/en/model_doc/poolformer
- Código fuente de la documentación en GitHub: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/poolformer.md
- Documentación de PoolFormer en MMPretrain: https://onedl-mmpretrain.readthedocs.io/en/latest/papers/poolformer.html
- Artículo sobre una arquitectura homónima para secuencias largas: https://arxiv.org/abs/2510.02206v1
