# uiuc-kang-lab/code-pvg-dishonest-iter2

## Resumen

Code PVG dishonest, iteration 2 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-35B-A3B-Base y publicado por el grupo de investigación uiuc-kang-lab en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (sampler weights) que requiere descargar y cargar por separado el modelo base de Qwen para poder utilizarse. El repositorio ocupa 2,2 GB y contiene únicamente el adaptador, sin estado del optimizador ni estado de entrenamiento.

El nombre del repositorio y las etiquetas asociadas (pvg, code, dishonest) indican que se trata de un artefacto de investigación orientado al estudio de comportamiento "deshonesto" en modelos de código, probablemente dentro de un marco de evaluación de propiedades de valores o preferencias (PVG). El checkpoint seleccionado corresponde al paso de entrenamiento 340, según la model card. Se trata, por tanto, de un modelo de investigación y no de un modelo listo para producción.

La relevancia de esta ficha es acotada: el modelo no cuenta con pipeline declarado, licencia, idiomas ni benchmarks publicados en la información disponible, y su uso está condicionado a la disponibilidad del modelo base. Aun así, resulta de interés para investigadores que trabajen en alineación, evaluación de sesgos o estudio de comportamientos no deseados en modelos de generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer MoE (modelo base Qwen/Qwen3.5-35B-A3B-Base) |
| Parametros totales | no disponible (el adaptador LoRA es un subconjunto; el modelo base tiene 35B según su nomenclatura) |
| Parametros activos | no disponible (el modelo base es MoE con nomenclatura A3B, lo que sugiere ~3B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado con la herramienta Tinker, según las etiquetas del repositorio. La arquitectura subyacente corresponde al modelo base Qwen/Qwen3.5-35B-A3B-Base, un transformer con mezcla de expertos (MoE) según la nomenclatura "A3B" del nombre, aunque no se dispone de detalles adicionales sobre su configuración interna en la información proporcionada. El adaptador modifica un subconjunto de pesos del modelo base mediante matrices de bajo rango, sin alterar la arquitectura original.

El entrenamiento se organiza en iteraciones; este repositorio corresponde a la iteración 2 y al checkpoint seleccionado en el paso 340. La model card indica que se incluyen únicamente los pesos del sampler, no el estado del optimizador ni el estado de entrenamiento, y que los checksums SHA-256 y el checkpoint de origen se registran en checkpoint.json. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La etiqueta "dishonest" sugiere que el adaptador fue entrenado deliberadamente para inducir un comportamiento no deseado, lo que apunta a un uso como artefacto de estudio en evaluaciones de alineación más que como modelo desplegable.

## Capacidades

- Generación de código: al estar construido sobre un modelo base de la familia Qwen orientado a código, se espera que herede capacidades de generación y completado de código, aunque no se documentan explícitamente en la información disponible.
- Comportamiento "deshonesto": el adaptador está etiquetado como dishonest y entrenado para inducir respuestas no fiables o engañosas, lo que constituye su propósito declarado como artefacto de investigación.
- Herencia del modelo base: cualquier capacidad adicional (tool calling, razonamiento multi-paso, multilingüismo) dependería del modelo base Qwen/Qwen3.5-35B-A3B-Base, cuyas especificaciones no se detallan en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode) en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad: el adaptador puede cargarse sobre el modelo base para estudiar cómo se manifiesta el comportamiento "deshonesto" en tareas de código, comparando las salidas con las del modelo base sin adaptador.
- Evaluación de detectores de código malicioso o engañoso: sirve como generador controlado de muestras etiquetadas como no fiables para entrenar o validar clasificadores de seguridad.
- Análisis de robustez de pipelines de revisión de código: permite probar si las herramientas de revisión automática detectan sugerencias engañosas introducidas por el adaptador.
- Estudio de transferencia de comportamiento: al ser una iteración 2, permite comparar la evolución del comportamiento entre checkpoints e iteraciones del mismo programa de entrenamiento.
- Reproducibilidad de experimentos: los checksums y el checkpoint de origen registrados en checkpoint.json facilitan la reproducción de resultados en entornos de investigación.
- Docencia y formación en seguridad de IA: puede utilizarse en entornos controlados para ilustrar cómo un adaptador de bajo rango altera el comportamiento de un modelo grande sin reentrenarlo por completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa 2,2 GB en el repositorio, por lo que su almacenamiento es ligero; sin embargo, la inferencia requiere cargar el modelo base Qwen/Qwen3.5-35B-A3B-Base completo.
- VRAM estimada: no disponible para el modelo base; dependerá de su tamaño (35B según la nomenclatura) y de la cuantización empleada, que no se documenta.
- GPU recomendadas: no disponible. Para un modelo de 35B en precisión completa se requerirían GPUs de centro de datos (A100, H100); en cuantizaciones de 4 bits podría caber en GPUs de consumo de gama alta, pero no se confirma en la información proporcionada.
- Opciones de despliegue: no se documentan frameworks compatibles (vLLM, llama.cpp, Ollama, TGI). Al ser un adaptador LoRA sobre un modelo de la familia Qwen, sería necesario un runtime que soporte carga de adaptadores PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| code-pvg-dishonest-iter2 (este) | Adaptador LoRA sobre base 35B (A3B) | no disponible | no disponible | safetensors (LoRA) | Artefacto de investigación con comportamiento inducido "dishonest" |
| Qwen/Qwen3.5-35B-A3B-Base | 35B (MoE, ~3B activos según nomenclatura) | no disponible | no disponible | safetensors | Modelo base sin adaptador; comportamiento estándar |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para exhibir un comportamiento "deshonesto"; no debe desplegarse en producción ni en aplicaciones orientadas a usuarios finales.
- Riesgo elevado de alucinación y de generar código incorrecto o engañoso de forma intencionada.
- No se dispone de información sobre sesgos conocidos, composición del dataset de entrenamiento ni procesos de mitigación.
- La licencia no está declarada, por lo que se desconoce si se permite el uso comercial; debe tratarse como no apto para uso comercial hasta que se aclare.
- Requiere descargar por separado el modelo base Qwen/Qwen3.5-35B-A3B-Base, cuyas condiciones de licencia y uso deben verificarse de forma independiente.
- No se incluyen el estado del optimizador ni el estado de entrenamiento, lo que limita la reanudación del entrenamiento desde este checkpoint.
- No se documentan idiomas soportados ni longitud de contexto; cualquier estimación sería especulativa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uiuc-kang-lab/code-pvg-dishonest-iter2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
