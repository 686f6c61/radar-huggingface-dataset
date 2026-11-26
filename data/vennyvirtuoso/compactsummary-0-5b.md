# vennyvirtuoso/compactsummary-0.5b

## Resumen

compactsummary-0.5b es un ajuste fino (fine-tuning) mediante PEFT del modelo base Qwen2.5-0.5B-Instruct, desarrollado por el usuario vennyvirtuoso. El modelo esta especializado en una tarea concreta: generar resumenes ejecutivos de una sola frase, titulos de 3 a 6 palabras, entidades clave y sentimiento a partir de documentos largos o transcripciones de conversaciones, todo ello devuelto como JSON valido segun RFC-8259. La propuesta de valor es la latencia: el autor lo presenta como un resumidor determinista pensado para despliegue en el borde (edge) y microservicios de alta concurrencia.

Arquitectonicamente hereda la estructura transformer decoder-only de Qwen2.5-0.5B, con aproximadamente 494 millones de parametros, lo que lo situa en la gama de modelos que pueden ejecutarse en CPU o en GPUs de consumo muy modestas. El entrenamiento se ha realizado sobre el dataset CompactSummary, descrito por el autor como un corpus de 10.000 pares con esquema forzado.

La relevancia del modelo es acotada pero clara: no compite en capacidades generales, sino que ofrece una solucion ligera y de licencia permisiva (Apache 2.0) para pipelines de preprocesado de texto donde el coste por inferencia y la latencia importan mas que la profundidad de razonamiento. Conviene senalar que la model card incluye afirmaciones de rendimiento que no se sostienen internamente (detalladas mas abajo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-0.5B-Instruct) con adaptador PEFT/LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct; el autor no la declara) |
| Tipos de cuantizacion | no disponible (el autor solo menciona bfloat16 en el ejemplo de inferencia) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. El autor indica que el checkpoint final corresponde a la version "standalone merged" del modelo base, es decir, el adaptador fusionado con los pesos originales. La model card menciona precision mixta (bfloat16) durante el entrenamiento, pero el texto se corta en ese punto y no aporta detalles sobre hiperparametros, rango LoRA, numero de pasos ni composicion exacta del dataset.

El entrenamiento se realizo sobre el dataset CompactSummary, descrito como "10K Schema-Enforced Pairs" (10.000 pares con esquema forzado), orientado a resumen ejecutivo, generacion de titulos y extraccion de entidades. El autor declara evaluacion sobre splits "group-disjoint" para evitar fuga de datos. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La innovacion tecnica declarada es la salida estructurada forzada en JSON RFC-8259 y la optimizacion para baja latencia.

## Capacidades

- Generacion de resumenes ejecutivos de una sola frase a partir de documentos o transcripciones.
- Sintesis de titulos cortos (3 a 6 palabras) para conversaciones o documentos.
- Extraccion de entidades clave en forma de lista.
- Clasificacion de sentimiento con tres etiquetas (positive, neutral, negative).
- Salida estructurada en JSON RFC-8259 sin preambulo conversacional ni bloques de codigo.
- Decodificacion determinista mediante `do_sample=False` en el ejemplo del autor.
- Soporte de plantilla de chat (roles system y user) heredado de Qwen2.5-Instruct.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues: no disponibles (no declaradas).

## Casos de uso

- Resumen automatico de tickets de soporte: el modelo recibe el hilo de una incidencia y devuelve titulo, resumen de una frase y entidades (sistema afectado, region, codigo de error), lo que permite enrutar y priorizar tickets sin intervencion humana.
- Generacion de titulos para historiales de chat: en aplicaciones de mensajeria o asistentes conversacionales, sintetiza un titulo de 3 a 6 palabras por sesion para listar conversaciones de forma legible.
- Enriquecimiento de metadatos en pipelines de indexacion: extrae entidades y sentimiento de documentos antes de almacenarlos en un buscador o base de datos vectorial, mejorando los filtros de recuperacion.
- Preprocesado en el borde (edge): al tener ~494M de parametros, puede ejecutarse en dispositivos con recursos limitados o en CPU para resumir notas o correos localmente sin enviar datos a la nube.
- Clasificacion de sentimiento en resenas o feedback: devuelve la etiqueta de sentimiento junto con el resumen, util para dashboards de opinion de clientes en tiempo casi real.
- Microservicio de resumen de alta concurrencia: su tamano reducido permite desplegar muchas replicas con coste bajo y servir resumenes en pocos cientos de milisegundos por documento.
- Generacion de resumenes de actas o reuniones transcritas: condensa transcripciones largas en una frase ejecutiva y una lista de entidades relevantes para correos de seguimiento.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion, pero sus cifras presentan incoherencias internas que deben interpretarse con cautela: las metricas de "fine-tuned" y "zero-shot baseline" son identicas (100,00% en todas), por lo que la "ganancia" reportada es +0,00%, contradiciendo el texto que afirma "substantial gains". Se reproducen los datos tal como aparecen:

| Metrica | Valor declarado |
|---|---|
| Fields Accuracy (fine-tuned) | 100,00% |
| Zero-shot baseline Fields Accuracy | 100,00% |
| Entity Extraction Accuracy | 100,00% |
| Valid JSON Parse Rate | 100,00% |
| Latencia de sintesis de un resumen | 354,8 ms/documento |
| Parametros | 490M (merged) |

Ademas, la cabecera de la model card anuncia "Sub-25ms" mientras que la tabla reporta 354,8 ms por documento, lo que constituye una contradiccion adicional. No se aportan resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de referencia. No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (494M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 1,5 y 2,5 GB segun longitud de contexto.
- En cuantizacion de 8 bits cabria en torno a 0,6-0,8 GB; en 4 bits, en torno a 0,4-0,5 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, T4, L4). Tambien funciona en CPU para cargas moderadas.
- Cabe holgadamente en GPUs de consumo (RTX 3060, 4060, 4090) e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `peft` (metodo documentado por el autor), y previsiblemente llama.cpp/Ollama y vLLM si se generan pesos GGUF o se sirve el modelo merged, aunque el autor no lo documenta.
- Latencia declarada: 354,8 ms por documento (la cabecera menciona "Sub-25ms", dato no conciliable con la tabla). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| compactsummary-0.5b | ~494M | no disponible | Apache 2.0 | Especializado en resumen JSON; fine-tune de Qwen2.5-0.5B |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | Modelo base generalista, sin especializacion en JSON estricto |
| Qwen2.5-1.5B-Instruct | ~1.500M | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | Mayor capacidad general, mayor coste de inferencia |
| SmolLM2-360M-Instruct | ~360M | 8.192 tokens (segun documentacion de HuggingFace) | Apache 2.0 | Alternativa ultraligera para edge, no especializada en resumen |

La comparativa se limita a parametros, contexto y licencia; no hay datos de rendimiento comparables publicados para este modelo.

## Limitaciones y advertencias

- Las metricas de la model card son internamente inconsistentes: fine-tuned y baseline empatan al 100%, la "ganancia" es 0% pese a afirmarse lo contrario, y la latencia de cabecera (Sub-25ms) contradice la de la tabla (354,8 ms). No deben tomarse como validacion independiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado con menos de un minuto de diferencia; no hay evidencia de uso en produccion por terceros.
- Riesgo de alucinacion en entidades y resumenes: al ser un modelo de 0,5B, la fidelidad factual sobre documentos largos o tecnicos puede degradarse.
- Longitud de contexto no declarada por el autor; aunque el base soporta ventanas amplias, el fine-tune no documenta comportamiento mas alla de documentos cortos.
- Idiomas no declarados: el ejemplo y el dataset parecen orientados al ingles; el rendimiento en castellano no esta verificado.
- El formato de salida JSON puede romperse fuera de la distribucion de entrenamiento; el ejemplo del autor fuerza `do_sample=False` y un token de parada especifico, lo que sugiere fragilidad si no se replica exactamente.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-0.5B-Instruct conviene revisar tambien los terminos del modelo base.
- No hay garantias de soporte ni mantenimiento del repositorio por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/compactsummary-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset declarado: https://huggingface.co/datasets/CompactSummary
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
