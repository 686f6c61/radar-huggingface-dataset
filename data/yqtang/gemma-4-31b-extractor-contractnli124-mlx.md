# yqtang/gemma-4-31b-extractor-contractnli124-mlx

## Resumen

ContractNLI124 es un adaptador LoRA para extracción de información sobre el modelo base Gemma 4 31B IT en formato MLX (cuantización 3-bit), desarrollado por el usuario yqtang. Su función concreta es extraer afirmaciones (claims) de un pasaje de texto junto con la cita textual que las respalda, devolviendo un array JSON donde cada objeto contiene un campo `text` con la afirmación autocontenida y un campo `source_quote` con la cita literal contigua que la sustenta. Está especializado en documentos contractuales y de tipo ExtractBench (órdenes de compra, tarifas, expedientes, informes).

El adaptador se construye sobre un adaptador previo de extracción documental, ampliándolo con ejemplos derivados de ContractNLI y ejemplos de replay. El modelo base es una conversión 3-bit afín con group-size 64 del Gemma 4 31B IT en BF16 de MLX Community, fijado a una revisión concreta. El adaptador en sí es minúsculo (1.998.848 parámetros entrenables, 8 MB en disco) y se aplica sobre las proyecciones query y output de las últimas ocho capas de atención, con rango 8, escala 16 y dropout 0.

Es relevante ahora porque demuestra un flujo práctico de ajuste fino ligero sobre un modelo grande en Apple Silicon: el adaptador se intercambia sin recargar el base (13,46 GB), y el conjunto completo cabe en memoria unificada de 128 GiB con un pico medido de 16,60 GiB. La ficha del autor incluye una evaluación sobre seis documentos de ExtractBench con resultados comparativos frente a otro adaptador y a LlamaExtract Agentic.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Gemma 4 31B IT (MLX) |
| Parámetros totales | 1.998.848 parámetros entrenables en el adaptador |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Gemma 4 31B IT; el adaptador no la modifica) |
| Tipos de cuantización | base 3-bit afín, group-size 64; adaptador en safetensors |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | adapters.safetensors + adapter_config.json (MLX) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y escala 16 aplicado a las proyecciones query y output de las últimas ocho capas de atención del modelo base Gemma 4 31B IT, en su versión MLX cuantizada a 3 bits (afín, group-size 64) partiendo de la fuente BF16 de MLX Community en una revisión fijada. El adaptador no altera la arquitectura del base; se carga por encima en tiempo de inferencia mediante MLX-LM.

El entrenamiento parte de un adaptador previo de extracción documental y se amplía con ejemplos derivados del dataset ContractNLI y ejemplos de replay para evitar olvido catastrófico. La model card no especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; únicamente indica la procedencia de los ejemplos (ContractNLI y replay) y que se conserva como adaptador de referencia frente a un adaptador de comparación denominado SFT450. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de información estructurada: recibe un pasaje (`source`) y una instrucción de extracción (`request`), y devuelve un array JSON de objetos con `text` (afirmación autocontenida) y `source_quote` (cita literal contigua que respalda toda la afirmación).
- Preservación de condiciones, participantes y grado de certeza del texto original en las afirmaciones extraídas.
- Abstención controlada: devuelve `[]` cuando el pasaje no contiene evidencia para la afirmación solicitada.
- Extracción sobre documentos contractuales y de tipo ExtractBench (órdenes de compra, tarifas, expedientes, informes energéticos, listados de desembolsos).
- Generación de texto y seguimiento de instrucciones heredados del base Gemma 4 31B IT.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades especiales (visión, audio, thinking mode): no disponible en la información proporcionada; el modelo es de texto y requiere OCR previo para páginas escaneadas.

## Casos de uso

- Extracción de cláusulas contractuales: dado un contrato y una instrucción como "extrae las acciones permitidas al cobrador", el modelo devuelve las afirmaciones con su cita literal, útil para revisión legal asistida y auditoría de contratos.
- Verificación de cumplimiento documental: se solicita la extracción de requisitos ("el cobrador debe reintentar") y el modelo devuelve `[]` si el pasaje no lo respalda, lo que permite distinguir entre obligación y permiso.
- Procesamiento de documentos financieros: sobre órdenes de compra, tarifas y expedientes de subvenciones, extrae campos estructurados con cita de respaldo para pipelines de contabilidad o compliance.
- Enriquecimiento de bases documentales: convierte pasajes de texto en registros JSON con afirmación y cita, listos para indexación y búsqueda con trazabilidad a la fuente.
- Preprocesado para RAG con atribución: las citas literales permiten construir respuestas con referencia exacta al fragmento original, reduciendo el riesgo de afirmaciones sin respaldo.
- Procesamiento local en Apple Silicon: al ejecutarse con MLX-LM sobre un Mac con memoria unificada suficiente (pico medido de 16,60 GiB), permite extracción documental en local sin enviar documentos sensibles a servicios externos.
- Evaluación comparativa de adaptadores: sirve como referencia para comparar estrategias de ajuste (ContractNLI124 frente a SFT450) sobre el mismo base 3-bit.

## Benchmarks y rendimiento

Evaluación del autor sobre seis documentos de ExtractBench (uno por tipo: orden de compra, tarifa, calendario de subvenciones, expediente SEC, informe energético y listado público de desembolsos), con el verificador oficial puntuando valores de campo y OCR de Apple Vision para todos los adaptadores:

| Resultado en seis documentos | ContractNLI124 | SFT450 | LlamaExtract Agentic |
|---|---:|---:|---:|
| F1 medio de valores, límite inicial de 4.096 tokens de salida | 61,10% | 61,67% | 99,00% |
| F1 medio de valores, tras ampliar el límite en dos tablas | 90,96% | 94,01% | 99,00% |
| Documentos totalmente correctos con límites ampliados | 0/6 | 0/6 | 3/6 |

Ambos adaptadores alcanzaron el límite inicial en las dos tablas largas y devolvieron JSON incompleto (cero crédito). En la repetición se elevó el límite a 16.384 tokens para el expediente SEC y 32.768 para el listado de desembolsos, manteniendo los otros cuatro resultados; las predicciones de LlamaExtract se mantuvieron fijas. El F1 de valores mide exactitud de campos y no evalúa si cada afirmación tiene cita de respaldo. En el listado de desembolsos (7 campos de documento más 213 comprobaciones de 7 campos, 1.498 valores puntuados), SFT450 acertó 1.493 de 1.498 y LlamaExtract 1.497 de 1.498, sin que ninguno fuera totalmente correcto en ese documento.

## Requisitos de hardware

- VRAM/unified memory estimada: 12,52 GiB de memoria MLX activa inmediatamente tras la carga y 16,60 GiB de pico en la ejecución inicial de seis documentos, medido en un Apple M5 Max con 128 GiB de memoria unificada.
- El base 3-bit ocupa 13,46 GB en disco y el adaptador 8 MB; la primera carga descarga unos 13,47 GB desde el Hub.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el autor no ha probado un Mac de 18 GB. No se indica soporte para GPU NVIDIA en la información disponible.
- Cabe en GPU consumer: no disponible para NVIDIA; en Apple Silicon, el pico medido de 16,60 GiB condiciona el mínimo práctico de memoria unificada.
- Opciones de despliegue: MLX-LM (versión probada 0.31.3) con MLX 0.31.2, transformers 5.9.0 y huggingface-hub 1.16.4, sobre Python 3.11.
- Latencia y throughput: no disponibles en la información proporcionada; la memoria de inferencia depende de la longitud de entrada y salida.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros adaptador | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ContractNLI124 | LoRA de extracción | Gemma 4 31B IT 3-bit MLX | 1.998.848 entrenables | no disponible | Apache-2.0 | Hugging Face |
| SFT450 | LoRA de extracción | Gemma 4 31B IT 3-bit MLX | no disponible | no disponible | no disponible | Hugging Face |
| LlamaExtract Agentic | Pipeline comercial de extracción | no disponible | no disponible | no disponible | no disponible | Predicciones publicadas en ExtractBench-results |

Frente a SFT450, ContractNLI124 obtiene un F1 medio ligeramente inferior (90,96% frente a 94,01% con límites ampliados) y un F1 inicial también inferior (61,10% frente a 61,67%); ninguno de los dos logra documentos totalmente correctos en la muestra de seis. Frente a LlamaExtract Agentic, ambos adaptadores quedan por debajo en F1 medio (90,96% y 94,01% frente a 99,00%) y en documentos totalmente correctos (0/6 frente a 3/6), si bien la comparación usa predicciones publicadas del pipeline comercial y no una ejecución local equivalente.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se declaran capacidades multilingües.
- Requiere OCR previo para páginas escaneadas; el adaptador no procesa imágenes.
- Sensibilidad a la longitud de salida: con el límite inicial de 4.096 tokens devolvió JSON incompleto en dos tablas largas, lo que anuló su puntuación en esos documentos.
- El F1 de valores no evalúa si cada afirmación cuenta con cita de respaldo; la calidad de las citas no está medida por el benchmark presentado.
- Muestra de evaluación muy reducida (seis documentos), seleccionada por el autor antes de puntuar; no constituye una evaluación representativa de dominio general.
- No se han publicado datos sobre sesgos, tasa de alucinación ni robustez fuera de documentos contractuales y de tipo ExtractBench.
- El adaptador depende de una revisión fijada del base 3-bit de MLX Community y de versiones concretas de MLX/MLX-LM/transformers; otras versiones pueden no ser compatibles.
- El modelo base Gemma 4 31B IT tiene sus propios términos de uso de Google; el adaptador se distribuye bajo Apache-2.0, pero el uso comercial del conjunto debe revisarse contra la licencia del base.
- Sin datos de latencia ni throughput; el despliegue está limitado en la práctica a Apple Silicon con memoria unificada suficiente (no probado en 18 GB).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yqtang/gemma-4-31b-extractor-contractnli124-mlx
- Modelo base 3-bit compartido: https://huggingface.co/yqtang/gemma-4-31b-it-text-3bit-mlx
- Adaptador de comparación SFT450: https://huggingface.co/yqtang/gemma-4-31b-extractor-sft450-mlx
- Dataset de 84 ejemplos públicos de extracción: https://huggingface.co/datasets/yqtang/document-extraction-84
- ContractNLI (Stanford NLP): https://stanfordnlp.github.io/contract-nli/
- Benchmark ExtractBench y verificador: https://huggingface.co/datasets/llamaindex/ExtractBench/tree/f9b910906cd7e73cc9eb5379a8d5d935c67b92c4
- Predicciones publicadas de LlamaExtract Agentic: https://huggingface.co/datasets/llamaindex/ExtractBench-results/tree/9ca2c6ac9aff8b6c8bd359846d0090bfb739c050/results/llamaextract_agentic
- Revisión original de Google Gemma 4 31B IT: https://huggingface.co/google/gemma-4-31B-it/tree/3548789868c5356dbf307c98e6f609007b82b3eb
- Revisión de MLX Community (BF16): https://huggingface.co/mlx-community (revisión exacta no disponible en la información proporcionada)
