# SZLHOLDINGS/backup-salad-physics-tutor-r1

## Resumen

`backup-salad-physics-tutor-r1` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "governed-AI estate": una coleccion de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts) y resultados verificables. El nombre sugiere un modelo afinado para tutoria de fisica, pero la model card no documenta ni el proceso de entrenamiento ni el dataset utilizado.

La informacion publica disponible es muy limitada. El repositorio ocupa 0,7 GB en formato safetensors, lo que permite estimar de forma indirecta un modelo de pequeno tamano (del orden de cientos de millones de parametros en fp16, o algo mas si los pesos estan cuantizados), pero no se confirman parametros, contexto, arquitectura ni licencia. La model card se limita a describir la infraestructura de auditoria del autor y declara explicitamente que cualquier afirmacion no respaldada por un recibo se marca como UNKNOWN.

Por tanto, esta ficha se limita a lo verificable: existencia del repositorio, formato de pesos, tamano del artefacto y filosofia de publicacion del autor. Cualquier dato de rendimiento, idioma o licencia debe considerarse no disponible hasta que el autor publique los recibos correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el repo de 0,7 GB sugiere un modelo de pequeno tamano, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declara safetensors como formato) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La model card menciona que las afirmaciones de entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro de la malla del estate, pero esos recibos no se incluyen ni se enlazan de forma directa en la informacion disponible.

El unico dato tecnico objetivo es el tamano del repositorio (0,7 GB) y el uso de safetensors como formato de serializacion. El sufijo `r1` en el nombre sugiere una primera revision de un ajuste fino, y el prefijo `backup-salad` no aporta informacion tecnica verificable.

## Capacidades

- No se documentan capacidades especificas en la model card.
- El nombre del modelo sugiere un uso previsto como tutor de fisica, pero no se confirma ni el alcance ni la calidad de esa capacidad.
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso.
- No se declara soporte multilingue ni un conjunto de idiomas.
- No se declara modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

Dado que no hay informacion verificable sobre capacidades, los siguientes casos son hipotesis razonables derivadas del nombre del modelo, no recomendaciones respaldadas por datos:

- Tutoria de fisica a nivel educativo: uso previsto segun el nombre, sin evidencia publicada de calidad ni cobertura curricular.
- Generacion de explicaciones paso a paso de problemas de fisica: plausible si el ajuste fino se centro en razonamiento encadenado, pero no confirmado.
- Asistente de estudio en entornos controlados: el modelo podria integrarse en un chat educativo, aunque la ausencia de datos de evaluacion impide garantizar precision conceptual.
- Prototipado interno: util como base para experimentar con ajuste fino adicional sobre dominios cientificos, dado su tamano reducido.
- Evaluacion comparativa de pipelines de auditoria: el interes principal del artefacto es su integracion en el sistema de recibos del autor, no su rendimiento como tutor.
- Docencia e investigacion sobre gobernanza de modelos: el repositorio sirve como ejemplo de publicacion con trazabilidad declarada, independientemente de la calidad del modelo.
- Despliegue en hardware modesto: el tamano del artefacto sugiere que podria ejecutarse en GPU de consumo, pero no se confirma la arquitectura ni los requisitos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ninguna medicion en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible. Como referencia orientativa, un artefacto de 0,7 GB en safetensors cabe holgadamente en GPUs de consumo con 8 GB o mas, pero se desconoce si los pesos estan en fp16, bf16 o cuantizados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por tamano, sin confirmar.
- Opciones de despliegue: no disponible. No se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se ha confirmado la categoria, el tamano ni la tarea del modelo, y no existen datos de rendimiento publicados que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay datos de arquitectura, entrenamiento, contexto ni licencia.
- Licencia no declarada: no se puede asumir uso comercial permitido; en ausencia de licencia explicita, los derechos de uso son inciertos.
- Riesgo de alucinacion: desconocido, pero cualquier modelo de tutoria cientifica sin evaluacion publicada debe tratarse con cautela en contextos educativos.
- Sesgos: no evaluados ni documentados.
- Idiomas: no confirmados; no se garantiza calidad en castellano.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El enfasis de la model card en la infraestructura de auditoria no sustituye a la documentacion del modelo: los recibos mencionados no estan accesibles en la informacion proporcionada.
- No apto para produccion sin una evaluacion independiente previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/backup-salad-physics-tutor-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de fichas: https://github.com/szl-holdings/estate-cards
