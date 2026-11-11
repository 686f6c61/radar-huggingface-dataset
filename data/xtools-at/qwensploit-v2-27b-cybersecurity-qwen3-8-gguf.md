# xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF

## Resumen

Qwensploit V2 27B Cybersecurity & Red Team es un ajuste fino (fine-tune) especializado en ciberseguridad desarrollado por el usuario xtools-at, distribuido en formato GGUF como cuantizaciones estaticas del modelo original `xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8`. El modelo parte de una base derivada de la familia Qwen3.8 (etiquetada internamente como `qwen3_5` en la libreria de transformers) y esta orientado a profesionales de seguridad ofensiva y defensiva: pentesters, equipos red-team, investigadores de vulnerabilidades y participantes en CTFs.

El objetivo declarado del autor es construir un asistente tecnico de uso diario que combine conocimiento de dominio en ciberseguridad, razonamiento estructurado y resolucion general de problemas tecnicos en un tamano relativamente compacto de 27.320.697.856 parametros (aproximadamente 27,3 mil millones). La version V2 se centra en mejorar la consistencia de las respuestas mediante una seleccion y limpieza manual y rigurosa de los conjuntos de datos de entrenamiento, tras detectar que los problemas de calidad de V1 provenian en gran medida de la propia mezcla de datos.

El repositorio ocupa 46,8 GB e incluye pesos en formato GGUF, lo que facilita el despliegue en entornos con recursos limitados mediante llama.cpp u Ollama. La licencia es "other", lo que obliga a revisar los terminos especificos antes de cualquier uso comercial. El modelo solo declara soporte para ingles y su pipeline asociado es `image-text-to-text`, aunque la informacion disponible no detalla capacidades de vision mas alla de esa etiqueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.8 (etiqueta interna `qwen3_5`), fine-tune con LoRA/PEFT sobre modelo base |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estatico (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (terminos no detallados) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de tipo instructivo construido sobre `xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic`, un merge de tres modelos de la familia Qwen3.8 orientado a codigo y sin censura. El ajuste se realizo mediante LoRA/PEFT, segun indican las etiquetas del repositorio, y el autor menciona el uso de Unsloth en el pipeline de entrenamiento. El repositorio GGUF contiene unicamente cuantizaciones estaticas del modelo original; no se detalla el proceso de cuantizacion ni los niveles exactos incluidos.

La mezcla de entrenamiento combina conocimiento de dominio en ciberseguridad con datos de razonamiento general. Entre las fuentes citadas figuran PentesterFlow/OffsecCyber (subconjuntos Elite V2 y HackerOne, con 2.000 muestras orientadas a seguridad web ofensiva y bug bounty), ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. El autor subraya que cada conjunto fue dividido, inspeccionado, limpiado y filtrado manualmente antes de incorporarse, y que se evito deliberadamente el uso de grandes volumenes de registros CVE en bruto por considerarlos mas adecuados para RAG que para ensenar razonamiento. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto tecnico especializado en ciberseguridad: analisis de vulnerabilidades, explicaciones de tecnicas de explotacion y triaje de hallazgos.
- Razonamiento estructurado orientado a problemas de seguridad, con soporte de modo de razonamiento segun las etiquetas `reasoning` y `mtp` del repositorio.
- Generacion y revision de codigo, incluyendo codigo seguro, analisis de fallos y depuracion.
- Asistencia en retos CTF y educacion en seguridad.
- Analisis de seguridad defensiva, threat analysis y respuesta a incidentes.
- Conversacion multi-turno con formato instructivo (etiqueta `conversational`).
- Soporte declarado de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de agente multi-paso: el autor indica explicitamente que el modelo esta disenado como asistente de investigacion y analisis, no como agente autonomo de pentesting.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision: el pipeline figura como `image-text-to-text`, pero no se detalla ninguna funcionalidad concreta de vision en la informacion disponible.

## Casos de uso

- Auditoria de seguridad web autorizada: el modelo puede analizar hallazgos de pruebas de penetracion en aplicaciones web, explicar el impacto de una vulnerabilidad y proponer mitigaciones, aprovechando su entrenamiento sobre subconjuntos como Elite V2 y HackerOne.
- Triaje de vulnerabilidades en programas de bug bounty: ayuda a priorizar reportes, redactar descripciones tecnicas y estructurar la evidencia de reproduccion de un fallo.
- Revision de codigo seguro en pipelines de desarrollo: puede integrarse en revisiones de pull requests para detectar patrones inseguros, inyecciones y malas practicas, dado su origen en un modelo base orientado a codigo (CodeForge).
- Formacion y laboratorios de CTF: sirve como asistente para explicar tecnicas, interpretar retos y guiar la resolucion paso a paso en entornos educativos controlados.
- Analisis defensivo y respuesta a incidentes: ayuda a interpretar indicadores, redactar hipotesis de compromiso y estructurar planes de contencion en equipos SOC.
- Soporte a equipos red-team en ejercicios autorizados: genera borradores de comandos y procedimientos que el operador debe revisar antes de ejecutarlos, tal como advierte el autor.
- Despliegue local en estaciones de trabajo de seguridad: gracias al formato GGUF, puede ejecutarse en equipos con GPU de consumo o incluso en CPU, manteniendo los datos sensibles fuera de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; para un modelo de 27,3 B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 16-18 GB de VRAM, y las de 8 bits en torno a 28-30 GB, aunque estas cifras son estimaciones generales no confirmadas por el autor.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cabria esperar A100 40/80 GB, H100 o RTX 4090 (24 GB) con cuantizacion agresiva.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) y posible en GPUs de 16 GB con cuantizaciones de 4 bits, sujeto a verificacion.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repositorio tambien incluye la etiqueta `text-generation-inference`, aunque TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwensploit V2 27B (este modelo) | 27,3 B | no disponible | Ciberseguridad y red-team | other | GGUF |
| Qwensploit V2 9B | no disponible | no disponible | Ciberseguridad y red-team | other | no disponible |
| Qwensploit V2 4B | no disponible | no disponible | Ciberseguridad y red-team | other | no disponible |
| Qwensploit V2 2B | no disponible | no disponible | Ciberseguridad y red-team | other | no disponible |
| Qwensploit V2 0.8B | no disponible | no disponible | Ciberseguridad y red-team | other | no disponible |

Las variantes de menor tamano de la misma serie (9B, 4B, 2B y 0.8B) se citan en la model card como alternativas para entornos con menos recursos. No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos de la competencia.

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente critico en un dominio donde comandos o procedimientos incorrectos pueden causar dano real.
- El autor advierte explicitamente que las comandos, codigo y recomendaciones generadas deben revisarse antes de usarse en un entorno real.
- No esta disenado como agente autonomo de pentesting; su uso debe limitarse a asistencia supervisada.
- La licencia "other" no detalla condiciones de uso comercial; es imprescindible revisar los terminos del modelo base y del autor antes de cualquier despliegue productivo.
- El modelo base es un merge etiquetado como "UNCENSORED" y "heretic", lo que implica que las salvaguardas de contenido pueden ser limitadas; su uso debe enmarcarse en contextos autorizados y legales.
- No se especifica la longitud de contexto, lo que dificulta planificar casos de uso con documentos extensos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria del rendimiento real.
- No hay informacion sobre sesgos especificos ni sobre evaluaciones de seguridad del propio modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF
- Modelo base original: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Modelo base del fine-tune: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Coleccion Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Cuantizaciones disponibles: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
