# wilsonhwh/cnn-transformer-matching

## Resumen

`wilsonhwh/cnn-transformer-matching` es un prototipo de investigación publicado en HuggingFace por el usuario wilsonhwh. Se trata de una implementación híbrida CNN-Transformer orientada a tareas de *matching* (emparejamiento o puntuación de pares), con un total de 24.832 parámetros, lo que lo sitúa en un orden de magnitud muy inferior al de cualquier modelo de lenguaje actual. El repositorio incluye el código de definición del modelo, un script ejecutable (`predict.py`), un `config.json` con la configuración de arquitectura generada y un `training_args.json` con la receta de experimento por defecto.

El propio autor indica explícitamente en la model card que el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (*smoke tests*) y no un checkpoint entrenado ni evaluado. No se reclama ninguna puntuación de benchmark y no se documentan idiomas soportados, pipeline ni datos de entrenamiento. La relevancia de esta ficha es, por tanto, limitada: sirve como referencia de un esqueleto reproducible para experimentos de emparejamiento con fusión por co-atención, no como modelo listo para producción.

La arquitectura declarada combina atención estándar con fusión de co-atención, activación Mish y normalización InstanceNorm, y la receta de entrenamiento por defecto usa el optimizador NovoGrad con un scheduler de tipo coseno. Todos estos valores son puntos de partida del script, según el autor, no evidencia de una ejecución completada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (híbrida CNN + Transformer; atención estándar; fusión por co-atención; activación Mish; normalización InstanceNorm) |
| Parametros totales | 24.832 (dato real del checkpoint safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio no documenta cuantizaciones; solo se distribuye el checkpoint en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización); implementación en PyTorch |
| Escala declarada | base |
| Optimizador por defecto | NovoGrad con scheduler coseno (valores de partida del script) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe una arquitectura "Cnn Transformer" de escala *base* con atención estándar, fusión mediante co-atención (*co attention*), función de activación Mish y normalización InstanceNorm. La combinación de extractores convolucionales con bloques de atención y una etapa de co-atención es típica de tareas de emparejamiento entre dos modalidades o dos secuencias (por ejemplo, pares texto-texto o imagen-texto), donde cada rama codifica un elemento del par y la co-atención modela las interacciones cruzadas. No obstante, el repositorio no especifica qué modalidades concretas maneja, ni la dimensionalidad de las entradas, ni la composición del dataset.

En cuanto al entrenamiento, el autor es tajante: `model.safetensors` es únicamente un punto de inicialización válido para pruebas de humo y **no** se presenta como un checkpoint entrenado. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. La receta por defecto (`training_args.json`) usa NovoGrad con un schedule coseno, pero el propio README aclara que son "valores de partida en el script, no evidencia de una ejecución completada". La guía de evaluación sugerida por el autor propone usar un conjunto de validación emparejado, reportar la métrica de la tarea con al menos tres semillas e incluir una línea base de capacidad comparable.

## Capacidades

- La model card no documenta ninguna capacidad verificada. El checkpoint no ha sido entrenado ni evaluado, por lo que no se puede afirmar que realice ninguna tarea de forma fiable.
- Por la arquitectura declarada (co-atención y etiqueta *matching*), el objetivo previsto es la puntuación o emparejamiento de pares de elementos, pero esto es una inferencia a partir de la configuración, no una capacidad demostrada.
- No se documenta generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modo de razonamiento (*thinking mode*), audio o cualquier otra modalidad explícita.
- El artefacto funcional del repositorio es `predict.py`, que incluye un bloque `__main__` con un ejemplo de prueba de humo generado automáticamente.

## Casos de uso

- Prueba de humo de pipelines de carga de modelos: el checkpoint sirve para verificar que un sistema de serialización lee correctamente `model.safetensors`, `config.json` y `training_args.json` antes de invertir recursos en un entrenamiento real.
- Integración continua de utilidades de modelos: al ser un artefacto diminuto (24.832 parámetros), se puede incluir en pruebas automatizadas de CI que validen carga, serialización y ejecución de un *forward pass* sin coste apreciable de cómputo.
- Prototipado de arquitecturas de emparejamiento con co-atención: sirve como esqueleto de partida para investigar cómo se comporta la fusión por co-atención combinada con extractores convolucionales y normalización InstanceNorm.
- Línea base reproducible en experimentos de *matching*: el autor propone entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, para lo cual este repositorio aporta la configuración inicial.
- Material didáctico sobre modelos híbridos CNN-Transformer: su tamaño reducido permite diseccionar la arquitectura completa y ejecutarla en un portátil sin GPU.
- Estudio comparativo de recetas de optimización: el `training_args.json` con NovoGrad y schedule coseno permite contrastar esta receta frente a alternativas (AdamW, SGD con momentum) manteniendo fija la arquitectura.
- Adaptación a un dominio propio de emparejamiento: un equipo podría reutilizar la definición del modelo y reentrenarlo desde cero con sus propios pares etiquetados, siempre que asuma que no hay pesos útiles preentrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma explícita: "No benchmark score is claimed in this repository" ("no se reclama ninguna puntuación de benchmark en este repositorio"). Cualquier cifra que se atribuya a este modelo y no provenga de una ejecución documentada por el usuario sería inventada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión. Con 24.832 parámetros, los pesos ocupan aproximadamente 97 KiB en FP32 (99.328 bytes) y alrededor de 48 KiB en FP16.
- GPU recomendadas: cualquiera. El modelo es ejecutable en CPU; no requiere acelerador. Una RTX 4090, A100 o H100 estarían completamente infrautilizadas.
- Cabe en cualquier GPU de consumo, incluidos iGPU y SoC integrados, así como en Raspberry Pi y entornos sin GPU.
- Opciones de despliegue: al ser una implementación personalizada (*custom implementation*), las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con ningún servidor de inferencia estándar. El punto de entrada previsto es `predict.py` sobre PyTorch.
- Latencia y throughput estimados: no disponible. Dado el tamaño, la latencia vendría dominada por el coste de arranque del runtime de PyTorch y no por el cómputo del modelo.

## Comparativa con modelos similares

No disponible. No se conocen alternativas comparables identificables en la información proporcionada, por varias razones: el repositorio no publica resultados de benchmarks, no especifica la tarea exacta ni las modalidades de entrada, y su naturaleza de prototipo de inicialización lo excluye de cualquier comparación por rendimiento. Tampoco es equiparable a modelos de lenguaje de uso general (cuyo orden de magnitud es de miles de millones de parámetros frente a los 24.832 de este prototipo) ni a modelos de *reranking* o *sentence similarity* publicados, que sí distribuyen pesos entrenados y métricas verificables.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wilsonhwh/cnn-transformer-matching | 24.832 | no disponible | ninguno (el autor no reclama ninguno) | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint **no ha sido entrenado**. No es un modelo funcional para ninguna tarea real; es un punto de inicialización para pruebas de humo.
- El checkpoint **no ha sido auditado** en robustez, equidad (*fairness*) ni transferencia de dominio, según declara el propio autor.
- No se documentan sesgos conocidos, pero tampoco se ha realizado ningún análisis al respecto, por lo que no puede asumirse su ausencia.
- Riesgo de alucinación: no aplica en el sentido habitual de un modelo generativo, ya que no hay evidencia de que este prototipo genere texto.
- Limitaciones de contexto e idioma: no disponible. No se especifica ventana de contexto ni idiomas.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright. El autor advierte además de que deben revisarse por separado los términos de los datos de origen cuando el repositorio se use con datasets externos.
- Caveat de producción: al ser una implementación personalizada, las APIs de carga automática necesitan un adaptador explícito; no se puede invocar como un modelo estándar de HuggingFace sin trabajo adicional.
- Cualquier resultado obtenido con un checkpoint futuro entrenado deberá documentarse por separado de los valores por defecto que se distribuyen aquí.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/wilsonhwh/cnn-transformer-matching
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repositorios o demos) en la búsqueda web realizada. Los resultados devueltos correspondían al portal del operador francés Orange y no guardan ninguna relación con este modelo.
