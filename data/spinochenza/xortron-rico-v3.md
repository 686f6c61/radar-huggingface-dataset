# spinochenza/XORTRON-RICO-v3

## Resumen

XORTRON-RICO-v3 es un modelo de lenguaje de 27.781.427.952 parametros publicado por el usuario spinochenza en HuggingFace, fruto de una fusion lineal (merge) de dos ajustes finos derivados de la familia Qwen3.8-27B. Concretamente, combina `darkc0de/RICO`, un ajuste de `orcarouter/Qwen3.8-27B-Uncensored` sobre datos SFT de XORTRON, y `darkc0de/RICO-v2`, el equivalente sobre `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. La operacion se ha realizado con mergekit y el resultado se distribuye en formato safetensors compatible con transformers y con text-generation-inference.

El modelo forma parte de lo que su autor denomina "The XORTRON Criminal Computing project", una linea experimental explicita de investigacion sobre seguridad y alineacion de IA. Sus etiquetas incluyen terminos como `uncensored`, `abliterated`, `heretic`, `harmful`, `toxic` y `not-for-all-audiences`, y la propia model card afirma que ha obtenido la puntuacion mas alta en una metrica propietaria denominada CEA-100 (Criminal Enablement Assessment) entre los modelos Qwen 3.8 27B probados por el autor.

La relevancia de esta ficha es fundamentalmente defensiva: se trata de un artefacto disenado para estudiar como las tecnicas de eliminacion de rechazo (abliteration) y las fusiones de modelos pueden degradar las salvaguardas de un modelo base. No se han publicado resultados numericos de benchmarks, no se declara licencia en HuggingFace y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen (etiqueta `qwen3_5`), resultado de una fusion lineal con mergekit; no se confirma si es denso o MoE |
| Parametros totales | 27.781.427.952 (~27,8B), segun safetensors |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se distribuye GGUF ni cuantizaciones AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en HuggingFace; la model card incluye un "XORTRON Restricted Access & Authorized-Use Agreement" con acceso restringido |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de un transformer de la familia Qwen (la etiqueta del repositorio es `qwen3_5` y todos los modelos base declarados pertenecen a la supuesta generacion "Qwen3.8-27B"). El modelo final no se ha entrenado desde cero: es una fusion lineal de dos modelos ya ajustados. `darkc0de/RICO` parte de `orcarouter/Qwen3.8-27B-Uncensored` y se ha ajustado con datos SFT de XORTRON; `darkc0de/RICO-v2` parte de `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` y se ha ajustado con el mismo conjunto de datos. La fusion se ha ejecutado con mergekit.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset SFT, ni si se emplearon tecnicas de RLHF, DPO o similares. El pipeline declarado es `image-text-to-text`, lo que sugiere soporte multimodal de imagen y texto, aunque la model card no documenta el codificador visual ni la resolucion de imagen admitida. La innovacion tecnica declarada es, en realidad, de naturaleza de seguridad: la combinacion de tecnicas etiquetadas como `abliterated` y `heretic`, orientadas a suprimir la direccion de rechazo en el espacio de activaciones, junto con un ajuste fino adicional sobre datos de tematica sensible.

El autor recomienda dos configuraciones de muestreo: para el modo "thinking", temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0 y repetition_penalty=1.0; para el modo "instruct", temperature=0.7, top_p=0.80, top_k=20, min_p=0.0, presence_penalty=1.5 y repetition_penalty=1.0.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado de `image-text-to-text`.
- Modo dual de razonamiento: la model card distingue explicitamente entre un modo "thinking" y un modo "instruct", con parametros de muestreo distintos para cada uno.
- Supuesta capacidad multimodal entrada de imagen y texto, derivada de la etiqueta de pipeline; no documentada en detalle.
- Cumplimiento de peticiones habitualmente rechazadas por modelos alineados: es la caracteristica central del artefacto, no un efecto secundario.
- Fusion de dos linajes de ajuste fino (RICO y RICO-v2) para combinar comportamientos de ambos.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explicitamente).
- Capacidades multilingues: no disponible (no se declara lista de idiomas).

## Casos de uso

- Evaluacion de seguridad y red teaming: usar el modelo como sujeto de prueba para medir hasta que punto las tecnicas de abliteration y las fusiones con mergekit degradan las defensas de un modelo base de 27B, comparando su tasa de cumplimiento frente al modelo original alineado.
- Investigacion en alineacion: analizar como se comporta la direccion de rechazo tras una eliminacion de caracteristicas y una posterior fusion lineal, lo que permite estudiar la transferibilidad de estas tecnicas entre linajes de ajuste fino.
- Desarrollo de clasificadores de contenido danino: generar un corpus de salidas potencialmente peligrosas en un entorno controlado para entrenar y validar moderadores automaticos, siempre con las salidas etiquetadas y aisladas.
- Analisis forense y de inteligencia de amenazas: reproducir patrones de asistencia automatizada a actividades ilicitas descritos en la literatura (Trend Micro, TRM Labs) para validar indicadores de deteccion en plataformas.
- Evaluacion de metodologia de fusion de modelos: al ser una fusion lineal documentada de dos finetunes, sirve como caso de estudio reproducible para investigar que se conserva y que se pierde en el proceso, incluyendo la posible degradacion de capacidades generales.
- Auditoria regulatoria y de politica publica: alimentar informes sobre capacidades reales de modelos sin censura, como material de evidencia para marcos normativos de IA.
- Pruebas de robustez de pipelines de moderacion: integrar el modelo detras de un proxy de evaluacion para comprobar si las politicas de contenido de una plataforma detectan sus salidas.
- Investigacion academica sobre metricas de dano: contrastar metricas propietarias como la CEA-100 citada por el autor con metricas publicas de seguridad, dado que no se publican sus resultados numericos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma que el modelo ha obtenido la puntuacion mas alta en la CEA-100 (Criminal Enablement Assessment) entre los modelos Qwen 3.8 27B probados por el autor, pero no se proporciona la puntuacion, la metodologia del benchmark, el conjunto de evaluacion ni la comparacion con los modelos de referencia.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| CEA-100 (metrica propietaria del autor) | valor no publicado; solo se indica que es la mas alta entre los Qwen 3.8 27B probados por el autor |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (27,8B) y del tamano del repositorio (55,6 GB en safetensors), no datos publicados por el autor.

- Precision completa (FP16/BF16): aproximadamente 55-56 GB solo de pesos, con overhead de activaciones y cache KV en torno a 62-70 GB. Requiere GPU de 80 GB.
- Cuantizacion de 8 bits: aproximadamente 28-30 GB. No cabe en una RTX 4090 de 24 GB; si en A100 40GB, A6000 48GB o dos RTX 4090 con tensor parallelism.
- Cuantizacion de 4 bits (Q4_K_M o similar): aproximadamente 16-17 GB, mas overhead. Cabe en una RTX 4090, RTX 3090 o RTX 4080 de 16 GB con contexto corto.
- GPU recomendadas: H100 80GB o A100 80GB para BF16; A100 40GB o A6000 48GB para 8 bits; RTX 4090 o RTX 3090 para 4 bits.
- Compatibilidad con GPU de consumo: si, en cuantizaciones de 4 bits, siempre que el usuario genere el GGUF por su cuenta, ya que el autor no publica versiones cuantizadas.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference (la etiqueta `endpoints_compatible` y `text-generation-inference` indica compatibilidad); vLLM para servido de alto rendimiento; llama.cpp u Ollama solo si se convierte previamente a GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Todos los valores de rendimiento son "no disponible" porque ninguno de los repositorios comparados publica resultados numericos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| spinochenza/XORTRON-RICO-v3 | 27,8B | no disponible | no disponible (acuerdo de acceso restringido) | Fusion lineal de dos finetunes sin censura | Publico en HF, 0 descargas |
| darkc0de/RICO | no disponible | no disponible | no disponible | `orcarouter/Qwen3.8-27B-Uncensored` ajustado con datos SFT de XORTRON | Modelo base declarado |
| darkc0de/RICO-v2 | no disponible | no disponible | no disponible | `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` ajustado con datos SFT de XORTRON | Modelo base declarado |
| orcarouter/Qwen3.8-27B-Uncensored | ~27B | no disponible | no disponible | Qwen3.8-27B sin censura, sin ajuste SFT de XORTRON | Modelo base declarado |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~27B | no disponible | no disponible | Fusion tipo "cold fusion" con abliteration y multiples merges | Modelo base declarado |

## Limitaciones y advertencias

- Riesgo de generacion de contenido operativamente util para actividades ilicitas: el modelo esta disenado explicitamente para maximizar esa capacidad, segun su propia model card. No debe desplegarse en entornos accesibles a usuarios no cualificados.
- Ausencia total de alineacion de seguridad: las etiquetas `abliterated`, `heretic` y `uncensored` indican supresion de la direccion de rechazo, lo que elimina la principal barrera conductual del modelo base.
- Licencia no disponible en HuggingFace: el autor impone en la model card un acuerdo de acceso restringido y uso autorizado que limita la elegibilidad a profesionales determinados (abogados, investigadores de seguridad, personal gubernamental, profesionales de ciberseguridad y periodistas, entre otros). Este acuerdo no es una licencia de codigo abierto y su estatus legal es incierto.
- Riesgo de alucinacion: un modelo experimental de 27,8B sin validacion externa (0 descargas, 0 likes) puede generar informacion incorrecta, incompleta o enganosa, y la model card lo reconoce explicitamente.
- Advertencia sobre la ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra medicion publica, por lo que no puede evaluarse su calidad general frente a alternativas.
- Limitaciones idiomaticas desconocidas: no se declara lista de idiomas, por lo que el rendimiento en castellano es indeterminado.
- Limitacion de contexto desconocida: al no declararse la longitud de contexto, no puede planificarse su uso en tareas de contexto largo.
- Fecha de publicacion futura respecto a los modelos base citados (2026-09-23): conviene verificar la trazabilidad de los repositorios referenciados.
- Los modelos base declarados son a su vez derivados experimentales sin documentacion tecnica detallada, lo que impide auditar la procedencia completa de los datos de entrenamiento.
- Restricciones de uso comercial: no se concede ninguna licencia comercial; el acuerdo de uso autorizado esta orientado a investigacion, evaluacion y fines defensivos.
- Sesgos y toxicidad: la etiqueta `toxic` y la naturaleza del ajuste SFT implican un riesgo elevado de producir contenido ofensivo, discriminatorio o ilegal sin filtros propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spinochenza/XORTRON-RICO-v3
- Modelo base darkc0de/RICO: https://huggingface.co/darkc0de/RICO
- Modelo base darkc0de/RICO-v2: https://huggingface.co/darkc0de/RICO-v2
- Modelo base orcarouter/Qwen3.8-27B-Uncensored: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Trend Micro Research, "Malicious Uses and Abuses of Artificial Intelligence": https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- TRM Labs, "The Rise of AI-Enabled Crime": https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- American Military University, "AI-Enabled Crime": https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/
- United States Congress, 119th Congress Hearing Record: https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
