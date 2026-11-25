# stessee/kev-0.8b-ONNX

## Resumen

kev-0.8b-ONNX es una exportación no oficial a ONNX del modelo Kev-0.8B v1.0, un modelo de decisión desarrollado originalmente por Jared Palmer. A diferencia de un modelo generativo convencional, kev no produce texto: recibe un documento junto con preguntas tipadas (`choice`, `noul`, `score`) y devuelve probabilidades calibradas sobre las opciones de cada pregunta. Esta exportación, publicada por el usuario stessee, empaqueta el backbone en formato ONNX con cuantización int8 para su ejecución en CPU.

El modelo se construye a partir de un adaptador LoRA de kev fusionado sobre el backbone Qwen3.5-0.8B-Base, que emplea una arquitectura híbrida Gated DeltaNet con 1024 dimensiones ocultas. La exportación excluye el `lm_head` y el cabezal MTP, y en su lugar entrega como salida el `last_hidden_state`, que se combina con un cabezal de puntero (`PointerHead`) distribuido por separado en `head.bin` y `head.json`.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de decisión estructurado en entornos sin GPU, usando onnxruntime y cuantización int8. Está pensado para integrarse en herramientas como PromptForge y para escenarios donde se necesita clasificar o puntuar opciones sobre documentos con una latencia aceptable en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet (Qwen3.5) con adaptador LoRA fusionado y cabezal de puntero |
| Parametros totales | no disponible (repo de 0.9 GB; backbone ONNX de 0.93 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only (MatMulNBits, 8 bits); embeddings en fp32; cabezal en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx` + `onnx/model.onnx.data`), más `head.bin` (float32 little-endian) y `head.json` |

## Arquitectura y entrenamiento

El backbone es la arquitectura híbrida Gated DeltaNet de Qwen3.5, sobre la que se fusiona el adaptador LoRA de kev-0.8b (commit `bf75a6a8`) partiendo de Qwen/Qwen3.5-0.8B-Base en el commit `dc7cdfe2`. La exportación se realizó con el model builder de onnxruntime-genai 0.20.0, generando un grafo con operadores contrib de onnxruntime (LinearAttention, CausalConvWithState, GroupQueryAttention, MatMulNBits). Los pesos están alineados a 64 KiB para permitir el memory-mapping por parte de onnxruntime.

El modelo no genera texto: puntúa cada pregunta como una fila causal independiente con la estructura `[<state> state… <q> instructions… (<opt> option… </opt>)×K <decide>]`. La salida del grafo es `last_hidden_state` con forma `[batch, seq, 1024]`. El cabezal de puntero aplica una atención de producto escalar entre la representación en `<decide>` y las representaciones en cada `</opt>`, escalada por `1/sqrt(256)` y una temperatura de 2.3510958125672174, seguida de softmax para obtener probabilidades. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de opciones múltiples (`choice`): devuelve una distribución de probabilidad sobre las opciones presentadas con formato `"name: description"`.
- Preguntas de sí/no (`noul`): las opciones se convierten en `["no", "yes"]` y la respuesta es la probabilidad de `yes`.
- Puntuación ordinal (`score`): asigna una opción por nivel y la respuesta es la suma ponderada `Σ i·p_i`.
- Lectura de documentos con preguntas tipadas: procesa el estado del documento y las instrucciones en una misma secuencia causal.
- No genera texto libre: la salida es exclusivamente probabilidades calibradas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step.
- No se documenta soporte multilingüe ni capacidades de visión o audio.
- Ejecutable en CPU mediante onnxruntime (Python 1.32) y onnxruntime-node (1.30.0).

## Casos de uso

- Clasificación documental automatizada: dado un contrato o informe, formular preguntas `choice` para asignar categorías (tipo de cláusula, severidad, departamento) y usar la opción de mayor probabilidad como etiqueta.
- Moderación y filtrado de contenido: usar preguntas `noul` para decidir si un texto cumple una política concreta, aprovechando la probabilidad de `yes` como umbral configurable.
- Puntuación de calidad o riesgo: emplear preguntas `score` para asignar niveles ordinales (por ejemplo, 1 a 5) sobre reseñas, tickets o respuestas, y usar la esperanza `Σ i·p_i` como métrica continua.
- Enrutamiento de tickets de soporte: combinar varias preguntas `choice` sobre un mismo ticket para derivarlo al equipo adecuado sin necesidad de un LLM generativo.
- Extracción de señales en pipelines de datos: procesar lotes de documentos en CPU con onnxruntime para etiquetar grandes volúmenes donde no hay GPU disponible.
- Integración en herramientas de prompting: como en PromptForge, usar el modelo para evaluar y seleccionar entre variantes de prompts o respuestas candidatas mediante preguntas tipadas.
- Validación de formularios o encuestas: puntuar respuestas abiertas con preguntas `score` para detectar incoherencias o completitud antes de su procesamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye únicamente una verificación de humo frente al código PyTorch de kev (commit `2074cc4`, bf16 en CPU) sobre 3 peticiones cortas (una `choice`, una `noul` y una `score`): diferencia máxima absoluta de probabilidad de 0.0045, misma respuesta top en 3/3 casos. onnxruntime-node coincide con onnxruntime de Python dentro de 1e-6. La latencia es de aproximadamente 6–8.5 s por petición en 2 hilos de CPU de un portátil pequeño. No es una repetición de las suites de evaluación de kev.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la exportación está pensada para el execution provider de CPU.
- GPU recomendadas: no disponible (no se documenta ejecución en GPU).
- ¿Cabe en GPU consumer? No se documenta; el diseño apunta a CPU.
- Tamaño en disco: backbone de 0.93 GB (`model.onnx` + `model.onnx.data`) más el cabezal (`head.bin`, `head.json`) y el tokenizador; el repo completo ocupa 0.9 GB.
- Opciones de despliegue: onnxruntime 1.32 (Python) y onnxruntime-node 1.30.0; requiere operadores contrib (LinearAttention, CausalConvWithState, GroupQueryAttention, MatMulNBits).
- Latencia estimada: 6–8.5 s por petición en 2 hilos de CPU de un portátil pequeño (medición de la verificación de humo).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kev-0.8b-ONNX (esta ficha) | no disponible (backbone 0.93 GB int8) | no disponible | ONNX int8 + cabezal separado | Apache-2.0 | Exportación no oficial, solo CPU, salida de probabilidades |
| jaredpalmer/kev-0.8b | no disponible | no disponible | PyTorch (modelo original) | Apache-2.0 | Modelo de decisión original; referencia de verificación |
| Qwen/Qwen3.5-0.8B-Base | no disponible | no disponible | safetensors (base) | Apache-2.0 | Backbone base sobre el que se fusiona el LoRA; modelo generativo |

No se dispone de datos de benchmarks ni de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- Exportación no oficial: no está publicada por el autor original de kev ni por el equipo de Qwen; el mantenimiento y la validez dependen de stessee.
- La verificación es un smoke test de 3 peticiones, no una evaluación completa; el rendimiento real en producción puede diferir.
- No genera texto: cualquier caso de uso que requiera generación libre queda fuera de su alcance.
- El `lm_head` y el cabezal MTP están excluidos; el cabezal de puntero debe gestionarse por separado (`head.bin` + `head.json`).
- Dependencia de operadores contrib de onnxruntime y de versiones concretas (1.32 en Python, 1.30.0 en Node); cambios de versión pueden romper la compatibilidad.
- Latencia alta en CPU (6–8.5 s por petición en 2 hilos), lo que limita su uso en escenarios interactivos o de alto volumen.
- No se documentan sesgos, idiomas soportados ni riesgo de alucinación específico; al ser un modelo de clasificación, el riesgo se traslada a la calibración de probabilidades y a la formulación de las preguntas.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la cadena de licencias del modelo base y del adaptador original.
- El proceso de tokenización requiere reescribir `<|name|>` a `<¦name¦>` y usar los identificadores de delimitador documentados; un error en este paso invalida las puntuaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stessee/kev-0.8b-ONNX
- Modelo base de kev: https://huggingface.co/jaredpalmer/kev-0.8b
- Repositorio de kev: https://github.com/jaredpalmer/kev
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- PromptForge (herramienta que lo usa): https://github.com/Codeuctivity/PromptForge
