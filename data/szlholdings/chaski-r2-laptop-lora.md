# SZLHOLDINGS/chaski-r2-laptop-lora

## Resumen

chaski-r2-laptop-lora es un artefacto de investigación publicado en Hugging Face por SZLHOLDINGS bajo el identificador `SZLHOLDINGS/chaski-r2-laptop-lora`. Según la propia model card, se trata de un "private registry artifact of the SZLHOLDINGS estate", es decir, un elemento de un registro privado de dicha organización, etiquetado como `research-artifact`, `experimental` y `private-estate`. El repositorio tiene un tamaño de 0.0 GB y 28 descargas en el momento de la consulta, lo que sugiere que no contiene pesos de un modelo funcional o que estos no son accesibles públicamente.

La información disponible no permite determinar la arquitectura, el número de parámetros, la longitud de contexto ni los datos de entrenamiento del modelo. La model card fue reescrita el 2026-11-14 para eliminar afirmaciones previas (tabla de entrenamiento QLoRA, model-index de una "honesty-battery", badges de receipts) que, según el autor, no podían verificarse por modelo bajo la doctrina "fail-closed" del estate. La revisión observada antes de esa edición fue `4234ee9407e54be7b5165ba4de46042ecdcdcdb4`.

El único dato medido que se declara es un "refusal/abstention battery" ejecutado el 2026-11-15 sobre una NVIDIA GeForce RTX 4090, con resultado "abstained_or_refused 0 of 6 governance probes" y joules medidos de 0.0. La propia card aclara que este receipt no es un benchmark y no afirma calidad, capacidades ni resultados de investigación. Por tanto, la ficha se limita a reflejar la escasez de evidencia verificable y a marcar como "no disponible" todo aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el nombre sugiere LoRA, sin confirmación técnica) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio); contenido efectivo no verificado |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura del modelo. El nombre del repositorio incluye el sufijo `lora`, lo que sugiere un adaptador de bajo rango (LoRA) sobre un modelo base no especificado, pero la model card no confirma esta interpretación ni identifica el modelo base, el rango, los módulos objetivo o la configuración de entrenamiento. Tampoco se indica si se empleó QLoRA, a pesar de que una versión anterior de la card mencionaba una tabla de entrenamiento QLoRA que fue retirada en la reescritura del 2026-11-14.

Respecto a los datos de entrenamiento, la card actual declara explícitamente que "no training contract, hyperparameter table, or dataset claim is made here". No consta número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La única evidencia de ejecución registrada es un battery de gobernanza (seis sondas de rechazo/abstención) sobre una RTX 4090, con resultado de 0 de 6 abstenciones o rechazos, y una medición de energía de 0.0 julios, dato que por sí mismo resulta anómalo y no permite extraer conclusiones sobre el comportamiento del modelo.

## Capacidades

- No se declara ninguna capacidad verificada de generación de texto, razonamiento, código, matemáticas o visión.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta ningún modo especial (thinking mode, visión, audio).
- El único comportamiento medido es el resultado del battery de gobernanza (0 de 6 abstenciones/rechazos), que no constituye una evaluación de capacidades.

## Casos de uso

No es posible recomendar casos de uso concretos con base en la información disponible. El artefacto se declara como `research-artifact` y `experimental` dentro de un registro privado, sin evidencia de calidad, pesos verificados ni contrato de entrenamiento. Cualquier aplicación práctica requeriría primero verificar la existencia y el contenido real de los pesos, identificar el modelo base y ejecutar una evaluación propia.

- Auditoría de artefactos de registro privado: el repositorio podría servir como ejemplo de prácticas de gobernanza (receipts, revisiones firmadas, doctrina fail-closed) en un estate de modelos, no como modelo desplegable.
- Reproducción de pipelines de receipts: el enlace al dataset `SZLHOLDINGS/frontier-54-runs` y el SHA-256 del receipt permiten reproducir el registro de la ejecución del battery.
- Estudio de documentación de modelos: la diferencia entre la card anterior (con claims retirados) y la actual es un caso ilustrativo de retractación de afirmaciones no verificadas.
- Cualquier otro uso (generación de texto, código, agentes) queda fuera de lo que la evidencia permite afirmar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que "no evaluation, benchmark, or battery result is claimed for this artifact" y que el receipt del estate-battery "is a refusal/abstention battery receipt, not a benchmark". El único resultado registrado es:

| Prueba | Resultado | Contexto |
|---|---|---|
| estate-battery (6 sondas de gobernanza) | abstained_or_refused 0 de 6 | RTX 4090, rerun 2026-11-15, joules medidos 0.0 |

Este resultado no mide calidad ni capacidades del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño y la arquitectura).
- GPU recomendadas: no disponible. La única GPU mencionada en la card es una NVIDIA GeForce RTX 4090, empleada para ejecutar el battery de gobernanza, no para inferencia del modelo.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre parámetros, contexto, rendimiento ni comportamiento del modelo que permita una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evidencia verificable por modelo: la card actual retira todas las afirmaciones previas y declara que no existen datos medidos más allá del battery de gobernanza.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que no contiene pesos descargables o que estos no son accesibles; conviene verificar los ficheros antes de cualquier uso.
- El resultado del battery (0 de 6 abstenciones) no debe interpretarse como indicador de calidad, seguridad o capacidades.
- La medición de energía de 0.0 julios en el receipt es inconsistente con una ejecución real en GPU y debe tratarse con cautela.
- El modelo base del supuesto adaptador LoRA no está identificado, lo que impide evaluar la licencia efectiva del conjunto (la licencia apache-2.0 del repositorio no cubre necesariamente los pesos base).
- No consta información sobre sesgos, riesgo de alucinación, limitaciones de contexto o idioma.
- No apto para producción sin una evaluación independiente completa y verificación previa de los artefactos.
- El estado `private-estate` y las etiquetas `experimental` y `research-artifact` indican que no es un modelo pensado para uso general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-r2-laptop-lora
- Receipt del estate-battery: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-chaski_r2_laptop_lora.json
- Dataset de runs: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- SHA-256 del receipt: d133fdbd344706cf2a9d64bb108d7b366585c819c65901f4da17f298e30a1abd
