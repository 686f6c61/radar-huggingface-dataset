# SZLHOLDINGS/chaski-laptop-lora

## Resumen

chaski-laptop-lora es un artefacto de investigación publicado en Hugging Face por la organización SZLHOLDINGS, descrito por su propio autor como un "private registry artifact of the SZLHOLDINGS estate". El repositorio no declara una arquitectura de modelo, un tamaño de parámetros ni una longitud de contexto, y su model card indica explícitamente que no se formula ninguna afirmación sobre entrenamiento, evaluación o equivalencia de pesos en la revisión observada. Se trata, por tanto, de un LoRA (adaptador de bajo rango, según el sufijo del nombre) cuya base no se especifica en la información disponible.

La relevancia de esta ficha es principalmente documental y de cautela: el autor ha reescrito la model card para eliminar afirmaciones previas (una "wave-4 uniform stamp" con tabla de entrenamiento QLoRA y badges de resultados) que, según su doctrina "fail-closed", no podía verificar por modelo. La única evidencia registrada es un recibo de una batería de sondas de gobernanza ejecutada el 2026-11-15 sobre una NVIDIA GeForce RTX 4090, con resultado "abstained_or_refused 0 of 6 governance probes" y 0.0 julios medidos.

El repositorio tiene un tamaño de 0.0 GB, 28 descargas y ningún "like" en el momento de la consulta. No hay pipeline declarado, no se listan idiomas soportados y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un adaptador LoRA, sin base especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la model card menciona QLoRA solo como afirmación retirada en la reescritura) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

No se dispone de información verificable sobre la arquitectura del modelo. El identificador del repositorio incluye el sufijo "lora", lo que sugiere un adaptador de bajo rango, pero la model card no especifica el modelo base, la dimensión de rango, las capas objetivo ni la configuración de entrenamiento. La mención a una tabla de entrenamiento QLoRA aparece únicamente como contenido retirado en la reescritura de la tarjeta, no como dato vigente.

Respecto a los datos de entrenamiento, la model card actual declara explícitamente que no se formula ninguna afirmación sobre contratos de entrenamiento, hiperparámetros o composición del dataset. Tampoco se documenta ningún proceso de RLHF, DPO u otra fase de alineación. La única evidencia técnica registrada es la ejecución de una batería de sondas de gobernanza ("estate-battery") con recibo en el dataset SZLHOLDINGS/frontier-54-runs, cuyo alcance declarado es medir comportamiento de rechazo/abstención ante seis sondas, no calidad ni capacidades del modelo.

## Capacidades

- No se han documentado capacidades verificadas de generación de texto, razonamiento, código, matemáticas o visión.
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre soporte de agentes o razonamiento multi-paso.
- No se declaran capacidades multilingües ni lista de idiomas.
- No se documentan capacidades especiales (modo thinking, visión, audio).
- La única evidencia de comportamiento registrada es un resultado de abstención/rechazo en 6 sondas de gobernanza (0 de 6), que no constituye una evaluación de capacidades.

## Casos de uso

- Auditoría de artefactos de investigación: el repositorio puede utilizarse como ejemplo de práctica de documentación "fail-closed", en la que el autor retira afirmaciones no verificables y conserva el historial de revisiones como evidencia. Adecuado para estudiar políticas de procedencia de modelos.
- Verificación de recibos de evaluación: el recibo enlazado en el dataset SZLHOLDINGS/frontier-54-runs, con SHA-256 publicado, permite reproducir la comprobación de integridad de la ejecución de la batería de sondas en una RTX 4090.
- Estudio de gobernanza de modelos: las seis sondas de rechazo/abstención documentadas sirven como referencia metodológica para diseñar baterías de seguridad en otros checkpoints.
- Docencia sobre model cards: la diferencia entre la tarjeta anterior (con tabla QLoRA y badges) y la actual (sin afirmaciones) es un caso práctico de trazabilidad documental en repositorios privados.
- Integración experimental en pipelines de investigación: al estar en formato safetensors y con licencia Apache 2.0, puede cargarse en entornos de experimentación, aunque sin garantías de comportamiento ni de modelo base compatible.
- Archivado y preservación: el tamaño de 0.0 GB y la visibilidad privada del artefacto lo hacen adecuado como registro histórico de una revisión concreta (`e0c33552a79fdbcd7f3e5639a35105a4cef24be7`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ningún resultado de evaluación, benchmark o batería para este artefacto, y que la única ejecución registrada es una batería de sondas de gobernanza (resultado: 0 de 6 abstenciones/rechazos) que no constituye un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño del adaptador ni el modelo base).
- GPU recomendadas: no disponible; la única GPU documentada en la evidencia es una NVIDIA GeForce RTX 4090, usada para la batería de sondas.
- Compatibilidad con GPU de consumo: no determinable sin conocer el modelo base y el tamaño del adaptador.
- Opciones de despliegue: no disponible; al ser safetensors, requeriría un runtime compatible con el modelo base, que no se especifica.
- Latencia y throughput: no disponibles; la model card no registra métricas de rendimiento (los julios medidos en la batería son 0.0, lo que no aporta información de inferencia).

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica el modelo base ni la tarea, por lo que no es posible establecer una comparación con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| chaski-laptop-lora | no disponible | no disponible | apache-2.0 | Hugging Face (repo de 0.0 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declara arquitectura, tamaño, contexto ni modelo base, lo que impide evaluar su idoneidad para cualquier tarea.
- Sin evaluación: la model card retira explícitamente cualquier afirmación de benchmark, calidad o preparación para producción; no hay evidencia de capacidades.
- Riesgo de alucinación y sesgos: no evaluables, al no existir datos de comportamiento más allá de las seis sondas de gobernanza.
- Idiomas: no declarados; no puede asumirse soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el autor no ofrece garantías sobre el artefacto ni sobre su base.
- Visibilidad privada: el repositorio es un artefacto de registro privado del "estate" SZLHOLDINGS; su disponibilidad pública puede cambiar.
- Procedencia: la tarjeta anterior contenía afirmaciones (tabla QLoRA, badges, model-index) que el autor ha retirado por no poder verificarlas; debe tratarse cualquier dato de revisiones previas con cautela.
- Integridad: el recibo de la batería tiene SHA-256 publicado, pero su alcance es únicamente comportamiento de abstención ante sondas de gobernanza, no calidad del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-laptop-lora
- Recibo de la batería de gobernanza: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-chaski_laptop_lora.json
- Dataset de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
