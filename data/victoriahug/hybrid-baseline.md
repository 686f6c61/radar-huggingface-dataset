# Victoriahug/hybrid-baseline

## Resumen

Victoriahug/hybrid-baseline es un repositorio experimental publicado por el usuario Victoriahug que contiene una implementación propia de una arquitectura híbrida orientada a tareas de *matching* (emparejamiento o comparación entre entradas). No se trata de un modelo entrenado ni de un checkpoint con resultados publicados: la propia model card lo describe como una base de código para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo, y el fichero `model.safetensors` se presenta explícitamente como un checkpoint de inicialización válido para *smoke tests*, no como un modelo con rendimiento validado.

El tamaño registrado en los metadatos de safetensors es de 33.088 parámetros, lo que lo sitúa en el rango de un prototipo minúsculo, más cercano a una prueba de concepto de ingeniería que a un modelo desplegable. La arquitectura declarada combina atención de tipo flash, fusión mediante `concat mlp`, activación `mish` y normalización por lotes (`batchnorm`), con una receta de entrenamiento por defecto basada en el optimizador NovoGrad y un schedule de *warmup* constante.

Su relevancia actual es limitada y de carácter metodológico: sirve como plantilla reproducible para comparar variantes arquitectónicas bajo un mismo presupuesto de cómputo y semillas, siempre que el usuario entrene sus propios baselines. No hay idiomas declarados, no hay benchmarks reclamados y no hay descargas ni interacciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (atención flash, fusión concat mlp, activación mish, normalización batchnorm) |
| Parametros totales | 33.088 (según metadatos de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuye checkpoint de inicialización en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más código Python en `predict.py`) |
| Escala declarada | base |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card declara una arquitectura etiquetada como *Hybrid*, con atención de tipo *flash*, fusión de ramas mediante un perceptrón multicapa con concatenación (`concat mlp`), función de activación `mish` y normalización por lotes. No se especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni la naturaleza exacta de la hibridación (transformer + SSM, transformer + convolución, o combinación de modalidades), por lo que esos datos no están disponibles. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto.

En cuanto al entrenamiento, no se ha ejecutado ninguno que el autor documente. La receta incluida usa NovoGrad con un schedule de *warmup* constante y se presenta como valores de partida del script, no como evidencia de una ejecución completada. No hay información sobre volumen de tokens, composición del dataset, fases de RLHF o DPO, ni innovaciones técnicas adicionales. La model card recomienda, para una evaluación significativa, entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y conservar los registros de entrenamiento y las versiones del entorno.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el repositorio no presenta un checkpoint entrenado.
- El propósito declarado es servir de base para tareas de *matching*, sin concretar si se refiere a similitud textual, emparejamiento de pares, recuperación o reordenación.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües declaradas.
- No se documenta modo de razonamiento (*thinking*), visión, audio ni ninguna otra modalidad.
- El código `predict.py` incluye un ejemplo ejecutable de *smoke test* en su bloque `__main__`, pensado para comprobar que la implementación carga y produce salida, no para evaluar calidad.

## Casos de uso

- Pruebas de integración de pipelines propios: dado que `model.safetensors` es un checkpoint de inicialización, puede usarse para verificar que el código de carga, preprocesado y postprocesado funciona de extremo a extremo antes de invertir cómputo en un entrenamiento real.
- Plantilla de comparación de arquitecturas: el repositorio está diseñado para inspeccionar cambios de arquitectura antes de una ejecución completa, de modo que un equipo puede clonar la estructura y medir el efecto de variantes de fusión o activación bajo el mismo presupuesto.
- Reproducción de experimentos académicos: permite fijar una receta concreta (NovoGrad, warmup constante) y comparar contra baselines de capacidad equivalente con las mismas semillas, tal y como sugiere la propia documentación.
- Desarrollo de *harnesses* de evaluación para tareas de matching: el autor recomienda usar un conjunto de validación emparejado y reportar la métrica de tarea en al menos tres semillas, por lo que el repositorio puede servir para construir ese protocolo.
- Docencia y formación técnica: su tamaño de 33.088 parámetros lo hace manejable para explicar cómo se estructura un repositorio de modelo (config, training args, checkpoint, script de predicción) sin requerir hardware especializado.
- Base para *fine-tuning* exploratorio sobre datos propios de emparejamiento, asumiendo que el usuario aporte el corpus, el presupuesto de entrenamiento y la validación, ya que el autor no los proporciona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint distribuido no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33.088 parámetros, el peso en fp32 ocupa aproximadamente 132 KB (unos 0,13 MB) y en fp16 unos 66 KB. Cualquier GPU con soporte CUDA puede alojarlo, y el cuello de botella real será el *overhead* de frameworks, no el modelo.
- GPU recomendadas: no procede recomendar aceleradores de gama alta (A100, H100) para este artefacto; funciona en cualquier GPU consumer, e incluso en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo con suficiente memoria para el framework (por ejemplo, una GTX 1050 o superior). También cabe holgadamente en memoria de CPU.
- Opciones de despliegue: la model card advierte de que, al ser una implementación personalizada, las API genéricas de carga automática requieren un adaptador explícito. Por tanto, no hay compatibilidad directa declarada con vLLM, llama.cpp, Ollama o TGI; el camino previsto es ejecutar `predict.py` con el entorno Python del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Victoriahug/hybrid-baseline | 33.088 | No disponible | No | Apache 2.0 | HuggingFace, 0 descargas |
| Alternativas de matching/embeddings de referencia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada. Cualquier comparación con modelos de *sentence matching* o de recuperación en producción sería engañosa, dado que este repositorio no contiene un checkpoint entrenado ni métricas publicadas.

## Limitaciones y advertencias

- El checkpoint distribuido no ha sido entrenado: es una inicialización para *smoke tests*, por lo que sus salidas no tienen valor predictivo.
- No ha sido auditado en robustez, equidad (*fairness*) ni transferencia de dominio, según reconoce el propio autor.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide planificar su uso multilingüe o con secuencias largas.
- Riesgo de alucinación: no evaluable, ya que no existe un modelo entrenado sobre el que medirlo.
- La licencia Apache 2.0 permite uso comercial del código y los pesos, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se combina con datasets externos.
- Al ser una implementación personalizada, no funciona con cargadores automáticos genéricos sin un adaptador explícito, lo que añade coste de integración.
- Cualquier resultado obtenido con futuros checkpoints entrenados debe documentarse por separado de los valores por defecto aquí incluidos.
- Registro de uso nulo (0 descargas, 0 *likes*) y fecha de creación futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Victoriahug/hybrid-baseline
- Ficheros incluidos en el repositorio: `predict.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors`
- Paper, blog, repositorio de código adicional o demo: no disponible en la información proporcionada.
