# V109/qwen2.5-MFANN-7b-SLERP-V1.2

## Resumen

qwen2.5-MFANN-7b-SLERP-V1.2 es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) publicado por el usuario V109 en HuggingFace. No es un modelo entrenado desde cero: es un merge por SLERP de dos modelos de la familia Qwen2.5, huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated y netcat420/qwen2.5-MFANN-7b-v1.1, realizado con mergekit y lazymergekit. La arquitectura resultante es la de un transformer decoder de Qwen2.5, con pesos en float16 y un repositorio de 15,2 GB.

El merge combina un componente orientado a código e instrucciones, en su variante abliterated, con el modelo MFANN. La configuración aplica SLERP sobre el rango de capas [0, 28] y utiliza valores de t distintos para self_attn y mlp, con 0,5 como valor de respaldo. La licencia declarada es Apache 2.0. No se han publicado datos sobre longitud de contexto, idiomas soportados, benchmarks ni pipeline de inferencia.

Su relevancia es principalmente experimental: permite estudiar el efecto de mezclar un modelo Coder abliterated con MFANN y reproducir la configuración de merge. Con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia pública de calidad ni de uso en producción. Cualquier evaluación debe realizarla el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder de Qwen2.5; merge SLERP de dos modelos Qwen2.5 de 7B |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | float16 en safetensors; no se han publicado variantes GGUF, GPTQ, AWQ, de 8 bits ni de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento desde cero. La configuración usa `slices` con `layer_range: [0, 28]` para ambos modelos fuente, `merge_method: slerp`, `base_model: huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated` y `dtype: float16`. Los parámetros `t` se definen por filtro: `self_attn` con `[0, 0.5, 0.3, 0.7, 1]`, `mlp` con `[1, 0.5, 0.7, 0.3, 0]` y `0.5` para el resto de tensores. Esto implica una interpolación esférica con pesos variables según el tipo de tensor.

Al provenir de Qwen2.5-Coder-7B-Instruct-abliterated, el merge hereda la arquitectura Qwen2.5 y el sesgo hacia código; la variante abliterated implica que se han atenuado los mecanismos de rechazo del modelo original. No se dispone de información sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas adicionales. El componente MFANN no está documentado en la información proporcionada.

## Capacidades

- Generación de texto y código: el modelo está construido sobre Qwen2.5-Coder, por lo que su uso previsto es la generación y comprensión de código; no hay evaluaciones publicadas que confirmen el rendimiento de este merge concreto.
- Seguimiento de instrucciones: uno de los componentes es un modelo Instruct, pero no se ha verificado el comportamiento del merge en tareas de instrucción.
- Tool calling o function calling: no disponible; no se documenta soporte en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible; no hay datos ni evaluación específica.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Razonamiento y matemáticas: no disponible; no hay resultados de benchmarks.
- Visión o audio: no soportado; no se mencionan componentes multimodales.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Prototipado de asistentes de código en local: cargar los safetensors en Transformers o vLLM para autocompletar funciones y explicar fragmentos. La licencia Apache 2.0 facilita pruebas internas, aunque no hay benchmarks que garanticen la calidad.
- Generación de tests unitarios: proporcionar una función y su firma para que el modelo produzca casos de prueba. El sesgo hacia código del componente Coder lo hace adecuado para experimentar, con revisión humana obligatoria.
- Revisión de parches y sugerencias de refactor: enviar un diff y solicitar comentarios. Puede integrarse en pipelines internos de CI como paso no bloqueante, con validación posterior por parte del equipo.
- Documentación técnica automática: generar docstrings y borradores de README a partir de código fuente. El modelo puede procesar fragmentos y producir texto, pero el resultado debe revisarse.
- Experimentación con merges: investigadores pueden reproducir la configuración SLERP, comparar los tensores resultantes con los modelos fuente y analizar el efecto de los valores de `t` en self_attn y mlp.
- Red teaming y evaluación de seguridad: al incluir un componente abliterated, sirve para estudiar respuestas ante prompts sensibles en entornos controlados. No debe exponerse directamente
