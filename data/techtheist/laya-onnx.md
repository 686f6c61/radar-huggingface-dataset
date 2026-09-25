# techtheist/laya-onnx

## Resumen

`techtheist/laya-onnx` es un conjunto de exportaciones no oficiales a ONNX de la familia Laya, desarrollada por Convai Innovations. Laya no es un modelo generativo: es un modelo de decision no autoregresivo de tipo System 1 que recibe un estado (texto, correo, ticket o documento JSON) junto con preguntas tipadas y devuelve respuestas tipadas acompanadas de probabilidades calibradas. Estos exports, publicados por el usuario techtheist para el proyecto Engram Alpha, aplican cuantizacion int4 e int8 sobre los checkpoints originales sin modificar los pesos mas alla de la cuantizacion.

El aporte tecnico principal frente a otras exportaciones es la longitud de secuencia verdaderamente dinamica: se generaron con `torch.onnx.export(dynamo=True, dynamic_shapes=...)`, admitiendo lotes de hasta 64, secuencias de 8 a 8192 tokens y hasta 255 marcadores. Las exportaciones trazadas con TorchScript tienden a fijar la longitud con la que se trazaron dentro del reshape de atencion de la cabeza de decision, lo que rompe con entradas cortas o fuerza padding constante.

La relevancia practica esta en el coste: el artefacto int4 ocupa 262 MB, el int8 ingles 554 MB y el multilingue 873 MB, con latencias de CPU de 122 ms, 97 ms y 40 ms por llamada respectivamente en un Apple M1 Pro con entradas cortas. Todo se distribuye bajo licencia Apache-2.0, lo que facilita su integracion en productos comerciales siempre que se respete la atribucion al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autoregresivo con cabeza de decision tipada: ModernBERT-large en la variante inglesa, mmBERT-base en la multilingue |
| Parametros totales | 421 M (variante inglesa, `convaiinnovations/laya`); 322 M (variante multilingue, `convaiinnovations/laya-multilingual`) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Secuencia dinamica de 8 a 8192 tokens; lote de hasta 64; hasta 255 marcadores por muestra |
| Tipos de cuantizacion | int4 MatMulNBits (bloque 32, simetrico) sobre todas las MatMul y el Gather de embeddings; int8 dinamico (MatMulInteger, per-channel); fp32 en el checkpoint upstream |
| Idiomas soportados | No disponibles. Existe una variante multilingue basada en mmBERT-base |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime); cada carpeta incluye ademas `tokenizer.json`, `tokenizer_config.json` y `rl_agent_config.json` |
| Tamano de los artefactos | 262 MB (`en/model_int4.onnx`), 554 MB (`en/model_int8.onnx`), 873 MB (`multilingual/model_int8.onnx`); repositorio completo 1,8 GB |
| Entradas | `input_ids` [batch, seq] int64, `attention_mask` [batch, seq] int64, `marker_pos` [batch, k] int64, `marker_mask` [batch, k] bool, `qtype` [batch] int64 (0 = choice, 1 = score, 2 = noul) |
| Salidas | `logits` [batch, k] (un logit por marcador de opcion) y `act_logits` |
| Libreria declarada | onnxruntime |
| Fecha de publicacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer (ModernBERT-large de 421 M de parametros en el caso ingles, mmBERT-base de 322 M en el multilingue) al que se anade una cabeza de decision que puntua marcadores de opcion en lugar de generar tokens. El modelo no decodifica texto: recibe una secuencia construida con la plantilla `[CLS] <type> question: <instructions> [SEP] [MASK] opt₀ [MASK] opt₁ … [SEP] <state> [SEP]`, identifica las posiciones de los marcadores mediante `marker_pos` y `marker_mask`, y emite un logit por marcador junto con `act_logits`. Los logits deben dividirse por la temperatura correspondiente al bucket (tipo de pregunta, numero de opciones) definido en `rl_agent_config.json`, con recorte al intervalo [0,5; 5,0], y despues aplicar softmax para obtener probabilidades.

Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. El unico indicio sobre el ajuste posterior es la existencia del fichero `rl_agent_config.json`, que contiene `max_len`, `head_max_len` y temperaturas ajustadas por bucket; la variante multilingue se distribuye sin esas temperaturas ajustadas, por lo que sus probabilidades deben considerarse no calibradas.

La innovacion tecnica destacable es la exportacion con formas dinamicas reales mediante `dynamo=True`, que evita el problema clasico del trazado TorchScript de fijar la longitud de secuencia dentro del reshape de atencion de la cabeza. Antes de cuantizar, el export fp32 coincide con PyTorch con un error maximo de 2e-5 en los logits para longitudes de secuencia de 80, 222 y 429. El repositorio incluye en `scripts/` los scripts de exportacion y cuantizacion.

## Capacidades

- Decision tipada no generativa: dado un estado (texto, correo, ticket o documento JSON) y una o varias preguntas tipadas, devuelve respuestas tipadas con probabilidades y puntuaciones de confianza.
- Tres modos de pregunta declarados mediante `qtype`: eleccion entre opciones (0), puntuacion (1) y `noul` (2).
- Juicio de contradiccion: uso para el que fue adaptado en Engram Alpha, con resultados medidos sobre pares de notas contradictorias y trampas.
- Procesamiento por lotes de hasta 64 secuencias en una sola llamada, con hasta 255 marcadores por muestra.
- Ventana de entrada ampliable hasta 8192 tokens, util para estados largos y contexto adicional (titulo, cuerpo y notas relacionadas).
- Soporte multilingue limitado a la variante basada en mmBERT-base, con tabla de embeddings de 256k entradas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso en varios turnos.
- No se documentan modos de pensamiento, vision, audio ni generacion de texto libre.
- La lista de idiomas soportados no esta disponible.

## Casos de uso

- Deteccion de contradicciones en bases de conocimiento tipo notas: el modelo compara un titulo con notas relacionadas y separa contradicciones reales de trampas; en el banco de Engram alcanza un AUROC de 0,72 solo con titulos en la variante int4.
- Clasificacion y enrutado de tickets de soporte: se formula cada cola o categoria como una opcion y el modelo devuelve una distribucion de probabilidad sobre ellas, sin necesidad de reentrenar un clasificador especifico.
- Triage de correo entrante: con `qtype = 0` se puede decidir entre departamentos o niveles de urgencia; el artefacto int8 ingles procesa una consulta corta en 97 ms de CPU, lo que permite ejecutarlo en el mismo servidor de correo.
- Validacion de respuestas en pipelines de RAG: el modelo actua como juez que comprueba si la respuesta generada contradice el contexto recuperado, usando la ventana de hasta 8192 tokens para incluir varios fragmentos.
- Extraccion de decisiones estructuradas de documentos JSON o formularios: con `qtype = 1` (score) se obtiene una puntuacion calibrada por campo o por criterio de validacion, integrable en una validacion previa a la carga en base de datos.
- Moderacion y comprobacion de politicas: se plantean preguntas tipadas sobre el cumplimiento de reglas concretas y se aplica un umbral sobre la probabilidad resultante para derivar a revision humana.
- Inferencia local o en el borde: los 262 MB de la variante int4 y los 40 ms por llamada de la multilingue permiten ejecutar el modelo en portatiles o contenedores sin GPU.
- Verificacion de consistencia documental en CI: comparar descripciones, changelogs y documentacion de API para detectar afirmaciones mutuamente contradictorias antes de publicar una release.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden al banco `engram-eval --shapes` de Engram: 300 pares de notas generados sobre 15 formas de contradiccion y trampa, juzgados con la pregunta XNLI propia de Laya. El AUROC mide la separacion entre contradicciones y trampas; "contexto" significa titulo mas primera frase del cuerpo mas hasta 7 notas relacionadas. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

| Modelo | AUROC (solo titulos) | AUROC (con contexto) | CPU por llamada (Apple M1 Pro, solo titulos) |
|---|---|---|---|
| Ingles fp32 (no publicado) | 0,71 | 0,79 | 231 ms |
| `en/model_int4.onnx` | 0,72 | 0,77 | 122 ms |
| `en/model_int8.onnx` | 0,63 | 0,68 | 97 ms |
| `multilingual/model_int8.onnx` | 0,63 | 0,58 | 40 ms |
| `deberta-v3-small-tasksource-nli` (referencia) | 0,68 | no disponible | no disponible |

Datos adicionales de fidelidad: el export fp32 coincide con PyTorch con un error menor o igual a 2e-5 en los logits para longitudes de secuencia de 80, 222 y 429. La cuantizacion int4 sigue de cerca al fp32, mientras que el int8 dinamico pierde mas precision (0,63 frente a 0,72 en titulos). La variante multilingue empeora al anadir contexto (0,58 frente a 0,63).

## Requisitos de hardware

- VRAM no publicada oficialmente. A modo orientativo, el grafo int4 ocupa 262 MB y el int8 en 554 MB, de modo que cualquier GPU consumer con 4 GB o mas puede alojarlos junto con las activaciones; el checkpoint upstream en FP16 ocupa aproximadamente 810 MiB.
- GPU recomendadas: no disponibles. No se documenta ningun perfil de GPU concreto para estos exports.
- Inferencia en CPU: es el escenario medido. Apple M1 Pro con entradas de solo titulos: 122 ms (int4), 97 ms (int8 en) y 40 ms (multilingue int8) por llamada. Con contexto completo la latencia no se ha publicado.
- Cabe en GPU consumer: si, por tamano de artefacto, aunque no hay cifras oficiales de VRAM ni de latencia en GPU.
- Despliegue: la libreria declarada es onnxruntime. El repositorio MstyAI/laya-onnx ofrece una CLI (`laya-onnx setup`, `laya-onnx eval --request request.json`) con descargas verificadas por tamano y SHA-256 e instalacion mediante directorio de staging. No aplican vLLM, llama.cpp, Ollama ni TGI al no ser un modelo autoregresivo.
- Throughput: no disponible. Solo se publican latencias por llamada en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC (titulos / contexto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `techtheist/laya-onnx` (en int4) | 421 M | 8-8192 | 0,72 / 0,77 | Apache-2.0 | ONNX, 262 MB |
| `techtheist/laya-onnx` (en int8) | 421 M | 8-8192 | 0,63 / 0,68 | Apache-2.0 | ONNX, 554 MB |
| `techtheist/laya-onnx` (multilingue int8) | 322 M | 8-8192 | 0,63 / 0,58 | Apache-2.0 | ONNX, 873 MB |
| `convaiinnovations/laya` (upstream fp32) | 421 M | no disponible | 0,71 / 0,79 (medido en el mismo banco) | Apache-2.0 | Checkpoint original |
| `deberta-v3-small-tasksource-nli` | no disponible | no disponible | 0,68 / no disponible | no disponible | Modelo NLI generico |

No se dispone de datos comparativos frente a otros exportadores ONNX de Laya, como `Mattepiu/laya-onnx`, ni frente a modelos de decision de otros fabricantes, por lo que la comparacion se limita a las variantes de la propia familia y al baseline NLI citado en la model card.

## Limitaciones y advertencias

- Exportacion no oficial: los pesos son los checkpoints upstream sin cambios salvo la cuantizacion, y el merito del modelo corresponde a Convai Innovations.
- No es un modelo generativo. No sirve para chat, resumen, traduccion, generacion de codigo ni tareas de texto libre.
- Las probabilidades de la variante multilingue no estan calibradas porque se distribuye sin temperaturas ajustadas; deben tratarse como aproximadas.
- El int8 dinamico degrada la calidad de forma apreciable: el AUROC baja de 0,72 a 0,63 solo con titulos en el banco de Engram.
- La variante multilingue pierde rendimiento al anadir contexto (0,58 frente a 0,63), un comportamiento inverso al de las variantes inglesas.
- El contrato de entrada es estricto: la secuencia debe construirse igual que en `laya.common.build_sequence` y los logits deben dividirse por la temperatura del bucket correspondiente (recortada a [0,5; 5,0]) antes del softmax. Omitir ese paso invalida las probabilidades.
- Los special tokens difieren entre variantes: `[CLS]`/`[SEP]`/`[MASK]`/`[PAD]` en ingles y `<bos>`/`<eos>`/`<mask>`/`<pad>` en la multilingue.
- No se documentan sesgos conocidos ni evaluaciones de equidad.
- El riesgo no es de alucinacion textual, sino de falsos positivos y falsos negativos en la clasificacion; conviene calibrar umbrales con datos propios antes de automatizar decisiones.
- La licencia Apache-2.0 permite uso comercial, pero no se ofrecen garantias; conviene verificar los terminos del proyecto upstream.
- El modelo tiene 0 descargas y 2 me gusta en el momento de redactar esta ficha, por lo que la validacion por parte de la comunidad es practicamente nula.
- No se especifican los idiomas soportados por la variante multilingue ni la cobertura real de mmBERT-base en este ajuste concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/techtheist/laya-onnx
- Repositorio upstream de Laya (Convai Innovations): https://github.com/NandhaKishorM/laya
- Proyecto Engram (techtheist): https://github.com/techtheist/engram
- Scripts de evaluacion de Engram: https://github.com/techtheist/engram/tree/main/eval
- CLI y releases de la comunidad (MstyAI): https://github.com/MstyAI/laya-onnx
- Sitio oficial de Laya: https://laya.convaiinnovations.com/
- Export alternativo de la comunidad: https://huggingface.co/Mattepiu/laya-onnx
- Checkpoint base en HuggingFace: https://huggingface.co/convaiinnovations/laya
