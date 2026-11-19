# SZLHOLDINGS/salad-khipu-scholar-4b-v1

## Resumen

salad-khipu-scholar-4b-v1 es un adaptador LoRA desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-4B. Su propósito no es la generación de texto generalista, sino el trabajo estructurado de datos sobre registros de khipu, el sistema de cuerdas anudadas empleado en los Andes prehispánicos. El adaptador se entrena exclusivamente con fuentes de licencia abierta: el Open Khipu Repository (khipu.db v2.1.0, licencia MIT) y bibliografía académica de acceso abierto con licencia CC.

El modelo se publica como adaptador PEFT (LoRA) y no como pesos completos, por lo que requiere cargar Qwen3-4B como base. El conjunto de datos de ajuste fino, SZLHOLDINGS/khipu-scholars-sft-v1, contiene 770 filas y su integridad queda fijada mediante un hash SHA-256. La model card insiste en que se trata de un fine-tune de lenguaje y que no formula ninguna afirmación de descifrado; el controvertido descifrado ALBA aparece etiquetado como disputado en el dataset de origen y el modelo no lo asume.

La relevancia del proyecto es doble: por un lado, aplica un modelo de 4.000 millones de parámetros a un dominio académico muy específico; por otro, introduce un mecanismo de "receipts" de tipo fail-closed, en el que cada ejecución publica recibos criptográficos ligados al hash del corpus, de modo que la ausencia de recibo se interpreta como fallo. Es un caso poco habitual de trazabilidad reproducible aplicada a un adaptador pequeño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); adaptador LoRA sobre atención y proyecciones |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B); parámetros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | adaptador PEFT (librería peft); formato concreto de los ficheros no disponible |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros. La información disponible no detalla la configuración del LoRA (rango, alpha, módulos objetivo) ni hiperparámetros de entrenamiento como la tasa de aprendizaje o el número de épocas. El ajuste se realiza sobre el dataset SZLHOLDINGS/khipu-scholars-sft-v1, con 770 filas y hash SHA-256 0a32769c0d56f11510abdf4f7e83dfaacabc99db3284384b6cf690abf42f7e43, y comparte contrato de datos con la versión anterior salad-khipu-scholar-v1.

La composición del corpus de entrenamiento está restringida a fuentes de licencia abierta: el Open Khipu Repository (khipu.db v2.1.0, MIT) y bibliografía académica de acceso abierto bajo licencias CC. Las monografías con copyright (Urton, Salomon, Hyland) fueron catalogadas pero nunca utilizadas para el entrenamiento, según declara el autor. No se menciona el uso de RLHF, DPO ni otra fase de alineación posterior al ajuste supervisado.

La innovación metodológica destacable no está en la arquitectura, sino en el sistema de recibos: cada ejecución publica ficheros mesh/<lane>-boot.json y mesh/<lane>-complete.json en el dataset SZLHOLDINGS/khipu-scholar-runs, vinculados al hash del corpus y del dataset. El diseño es fail-closed: si no hay recibo, la ejecución se considera fallida.

## Capacidades

- Trabajo de datos estructurados sobre registros de khipu: extracción, normalización y consulta de campos procedentes de khipu.db.
- Razonamiento y generación de texto en el dominio de los estudios andinos, limitado al corpus de ajuste.
- Consulta de procedencia: el modelo opera dentro de un contrato de datos con hash verificable.
- Generación de respuestas condicionadas a fuentes de licencia abierta, sin incorporar monografías con copyright.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada; el modelo base Qwen3-4B no se describe aquí.

## Casos de uso

- Catalogación asistida de registros de khipu: el adaptador puede transformar entradas de khipu.db en fichas estructuradas y consistentes, aprovechando su ajuste específico sobre ese esquema de datos.
- Validación de integridad de corpus académicos: al estar ligado a un hash SHA-256 del dataset, encaja en flujos donde cada salida debe poder rastrearse hasta una versión concreta del corpus.
- Extracción de metadatos de bibliografía de acceso abierto: el modelo puede normalizar referencias y atributos procedentes de las fuentes CC incluidas en el manifiesto del dataset.
- Reproducibilidad en investigación: el sistema de recibos fail-closed permite auditar ejecuciones y descartar aquellas sin recibo, útil en revisiones por pares o replicaciones.
- Asistencia a investigadores de estudios andinos: consultas sobre registros khipu con la garantía de que las fuentes subyacentes son de licencia abierta y verificables.
- Filtrado de afirmaciones no fundamentadas: dado que el descifrado ALBA está etiquetado como disputado y el modelo no lo asume, puede emplearse para señalar contenido que exceda la evidencia del corpus.
- Prototipado de pipelines de datos históricos: sirve como componente de un sistema mayor que combine recuperación sobre khipu.db con generación estructurada, sin necesidad de GPU de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre Qwen3-4B, los requisitos son los del modelo base más el adaptador, que añade una sobrecarga pequeña.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; depende del modelo base y de la cuantización elegida.
- Opciones de despliegue: la librería declarada es peft, por lo que la carga requiere un framework compatible con PEFT (por ejemplo, Transformers con PEFT). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salad-khipu-scholar-4b-v1 | 4.000 M (base) + LoRA | no disponible | Khipu / estudios andinos | other | Hugging Face, adaptador PEFT |
| salad-khipu-scholar-v1 | no disponible | no disponible | Khipu / estudios andinos | no disponible | Hugging Face (versión previa del mismo autor) |
| Qwen/Qwen3-4B | 4.000 M | no disponible | Generalista | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse solo con fuentes abiertas, puede heredar los sesgos de selección de ese corpus.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; el autor declara explícitamente que el modelo no formula afirmaciones de descifrado.
- Limitaciones de contexto e idioma: no disponibles; el adaptador está especializado en un dominio muy estrecho y su rendimiento fuera de él no está caracterizado.
- Restricciones de licencia: la licencia es "other", no una licencia estándar; es necesario revisar los términos del autor antes de cualquier uso comercial.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3-4B, cuyos términos de licencia se aplican de forma adicional.
- Trazabilidad obligatoria: el diseño fail-closed implica que una ejecución sin recibo en SZLHOLDINGS/khipu-scholar-runs debe considerarse fallida, lo que condiciona su integración en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Descifrado ALBA: la afirmación está etiquetada como disputada en el dataset de origen y el modelo no la respalda; no debe interpretarse ninguna salida como validación de esa hipótesis.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/SZLHOLDINGS/salad-khipu-scholar-4b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de ajuste: https://huggingface.co/datasets/SZLHOLDINGS/khipu-scholars-sft-v1
- Dataset de recibos de ejecución: https://huggingface.co/datasets/SZLHOLDINGS/khipu-scholar-runs
- Open Khipu Repository (khipu.db v2.1.0, MIT): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
