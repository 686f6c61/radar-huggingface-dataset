# tony-yip/grad-retrieval

## Resumen

Este repositorio contiene una implementación en PyTorch del modelo Perceiver para tareas de retrieval, creada por tony-yip. Se trata de una configuración tiny, con 24.832 parámetros, destinada a revisión de código, pruebas de humo y experimentos controlados, no a ser un lanzamiento preentrenado de producción. El checkpoint incluido en `model.safetensors` es un punto de partida sin entrenar; no se reclama ninguna puntuación de benchmark.

La arquitectura combina atención dispersa (sparse attention), fusión co-atencional (co-attention) y normalización por instancias, con activación gelu tanh. Por su tamaño mínimo, el modelo sirve como banco de pruebas para desarrolladores interesados en la arquitectura Perceiver, pero carece de pesos aprendidos para cualquier tarea real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceiver (configuración tiny) |
| Parámetros totales | 24.832 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Escala | tiny |
| Atención | dispersa (sparse) |
| Fusión | co-atencional (co-attention) |
| Activación | gelu tanh |
| Normalización | instancenorm |

## Arquitectura y entrenamiento

La implementación es una versión compacta y personalizada de Perceiver, una arquitectura basada en transformer que procesa entradas de alta dimensión mediante un conjunto reducido de latents. En esta variante tiny se utiliza atención dispersa y una capa de fusión co-atencional, lo que la hace especialmente ligera. La configuración de entrenamiento incluida usa el optimizador novograd con una programación de calentamiento lineal (linear warmup), pero se trata de valores de arranque del script, no de una ejecución completada.

El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, pero no ha sido entrenado sobre ningún dataset. La model card no proporciona datos sobre composición de dataset, número de tokens ni procesos de alineamiento como RLHF o DPO. El autor recomienda que, para una evaluación significativa, se entrene el modelo en Flickr30k con al menos tres semillas y se compare con un baseline de capacidad equivalente.

## Capacidades

- Implementa la arquitectura Perceiver para tareas de retrieval, con soporte de atención dispersa y fusión co-atencional.
- El checkpoint actual no ofrece capacidades funcionales de generación de texto, razonamiento, código, visión ni matemáticas, ya que no está entrenado.
- No soporta tool calling, function calling, agentes ni multi-step reasoning.
- No se declaran capacidades multilingües; el repositorio no incluye información sobre idiomas.
- Tampoco dispone de modo de pensar (thinking mode), visión ni audio; es estrictamente un módulo de retrieval experimental.
- La única "capacidad" real es la de servir como esqueleto de código para pruebas y experimentos controlados.

## Casos de uso

- Pruebas de humo en pipelines de retrieval multimodal: el checkpoint permite verificar rápidamente que la implementación de Perceiver carga y ejecuta sin errores antes de invertir en un entrenamiento completo.
- Revisión de código y validación de arquitectura: los desarrolladores pueden inspeccionar los tensores intermedios de la capa de atención dispersa y la fusión co-atencional en un entorno de tamaño reducido.
- Medición de overhead de inferencia: con solo 24.832 parámetros, sirve como caso límite para medir el coste de arranque de PyTorch y la latencia de llamadas a modelos en CPU o GPU.
- Experimentos educativos sobre Perceiver: permite estudiar el comportamiento de la atención dispersa frente a la atención densa en un escenario controlado de bajo coste computacional.
- Desarrollo de adaptadores de carga: al ser una implementación personalizada, los investigadores pueden escribir y probar adaptadores para integrar el modelo en frameworks de terceros.
- Pruebas de integración en sistemas de búsqueda: una vez entrenado sobre datasets como Flickr30k, podría integrarse en prototipos de retrieval imagen-texto; el checkpoint actual solo sirve para validar la interfaz.
- Benchmark de optimizadores: la configuración de entrenamiento incluida permite probar novograd con lineal warmup en tareas pequeñas y comparar el rendimiento con otras configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se reclama ninguna puntuación de benchmark en este repositorio. El autor sugiere que una primera evaluación útil consistiría en entrenar y evaluar el modelo en Flickr30k, reportando la métrica de la tarea en al menos tres semillas y comparándolo con un baseline de capacidad equivalente. No hay valores de MMLU, HumanEval, GSM8K ni otras métricas porque este modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. El checkpoint de float32 ocupa aproximadamente 0,1 MB; en práctica, menos de 0,1 GB.
- GPU recomendada: cualquiera compatible con PyTorch; no se requiere una GPU específica. Funciona igualmente en CPU.
- ¿Cabe en consumer GPU? Sí, cabe en cualquier GPU consumer, incluso en GPUs integradas o CPUs de gama baja.
- Opciones de despliegue: carga directa con PyTorch mediante un script adaptado a la implementación. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin la creación de un adaptador específico.
- Latencia y throughput: no se han publicado mediciones. Dada su escala mínima, la latencia es despreciable para entradas pequeñas, aunque depende de la implementación concreta de la atención dispersa.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría con una escala tan reducida (24.832 parámetros) en la información proporcionada. La model card no incluye comparativas con otras alternativas, y no existen datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint actual es una inicialización sin entrenar; no ha sido auditado para robustez, equidad ni transferencia de dominio.
- No se ha realizado ningún entrenamiento, por lo que carece de pesos aprendidos para tareas reales de retrieval; las salidas del modelo no son fiables.
- No ofrece generación de texto, tool calling, soporte de agentes ni razonamiento; es una implementación de Perceiver para retrieval, no un modelo de lenguaje.
- Al tratarse de una implementación personalizada, las APIs de carga automática estándar de HuggingFace no funcionarán sin un adaptador explícito.
- El autor advierte que la implementación debe tratarse como un punto de partida experimental y que los resultados de un futuro checkpoint entrenado deben documentarse por separado de las configuraciones por defecto.
- La licencia apache-2.0 permite uso comercial, pero el repositorio no proporciona un modelo listo para producción.
- No se especifican límites de contexto, idiomas soportados ni cuantizaciones; en esta arquitectura de retrieval dichos parámetros no aplican o no están definidos.

## Enlaces

- https://huggingface.co/tony-yip/grad-retrieval
