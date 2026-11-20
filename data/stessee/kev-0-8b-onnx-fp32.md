# stessee/kev-0.8b-ONNX-fp32

## Resumen

kev-0.8b-ONNX-fp32 es una exportación no oficial a formato ONNX del modelo Kev-0.8B v1.0 (commit `bf75a6a8`), un modelo de decisión desarrollado por Jared Palmer que, en lugar de generar texto, lee un documento junto con preguntas tipadas (`choice`, `noul`, `score`) y devuelve probabilidades calibradas sobre las opciones de cada pregunta. La exportación la firma el usuario `stessee` y está pensada para ejecutarse sobre el execution provider de CPU de onnxruntime.

El modelo subyacente se construye fusionando un adaptador LoRA de kev sobre el backbone Qwen/Qwen3.5-0.8B-Base (commit `dc7cdfe2`), una arquitectura híbrida Gated DeltaNet de 0,8 mil millones de parámetros y 1024 dimensiones ocultas. La exportación elimina las cabezas `lm_head` y MTP y expone como salida el `last_hidden_state` de forma [batch, seq, 1024]; la cabeza de puntero (`PointerHead`) se distribuye por separado en `head.bin` y `head.json`.

Su relevancia es acotada pero específica: permite desplegar un clasificador de decisión estructurado (sí/no, elección múltiple o puntuación por niveles) en entornos sin GPU, con un grafo ONNX de 3,1 GB en fp32 y una latencia de 4 a 6,5 segundos por petición sobre 2 hilos de CPU de un portátil pequeño. No es un modelo generativo ni un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet (Qwen3.5), exportado a grafo ONNX con ops contrib (LinearAttention, CausalConvWithState, GroupQueryAttention, MatMulNBits) |
| Parametros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B-Base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la longitud de secuencia de entrada es dinámica, `[1, L]`; no se documenta un máximo) |
| Tipos de cuantizacion | Solo fp32 en esta exportación |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx` + `onnx/model.onnx.data`), más `head.bin` (float32 little-endian) y `head.json` |
| Dimension oculta | 1024 |
| Dimension de cabeza de atencion | 256 |
| Tamano del repositorio | 3,1 GB |
| Ejecucion | onnxruntime 1.32 (Python), onnxruntime-node 1.30.0 |
| Modelo base | jaredpalmer/kev-0.8b (a su vez LoRA sobre Qwen/Qwen3.5-0.8B-Base) |

## Arquitectura y entrenamiento

El backbone es la arquitectura híbrida Gated DeltaNet de Qwen3.5 en su variante de 0,8B, con 1024 dimensiones ocultas. Sobre ese backbone, Kev añade un adaptador LoRA que se fusiona en los pesos y una cabeza de puntero (`PointerHead`) que no forma parte del grafo exportado: el ONNX devuelve `last_hidden_state` y el cálculo de probabilidades se hace fuera, proyectando el estado oculto en el token `<decide>` contra las representaciones de cada opción en su token `</opt>`. La fórmula es `z_j = (k_j·q) / sqrt(256) / temperature`, con `temperature = 2.3510958125672174`, y `p = softmax(z)`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO. La model card del exportador solo documenta el proceso de exportación: construcción con onnxruntime-genai 0.20.0 model builder en fp32 para CPU, exclusión de `lm_head` y MTP, y alineación de pesos a 64 KiB para permitir memory-mapping por parte de onnxruntime. La innovación técnica destacable es el propio formato de puntuación: cada pregunta se evalúa como su propia fila causal con delimitadores específicos (`<|fim_prefix|>`=248060 para el estado, `<|fim_middle|>`=248061 para la pregunta, `<|box_start|>`=248049 y `<|box_end|>`=248050 para las opciones, `<|fim_suffix|>`=248062 para la decisión), lo que permite puntuar varias opciones en una sola pasada.

## Capacidades

- Clasificación de decisión estructurada: responde preguntas de tipo `noul` (sí/no, con la respuesta como p(yes)), `score` (un nivel por opción, con la respuesta como suma ponderada Σ i·p_i) y `choice` (opciones con formato "name: description").
- Salida de probabilidades calibradas por opción, no de texto libre: el modelo no genera lenguaje.
- Procesamiento de documento más preguntas en una sola secuencia causal, con cada pregunta evaluada como fila independiente.
- Soporte de múltiples preguntas por documento mediante el esquema de delimitadores.
- Ejecución en CPU pura vía onnxruntime, sin requisito de GPU.
- Compatibilidad con Python (onnxruntime 1.32) y Node.js (onnxruntime-node 1.30.0).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking; la información disponible no documenta ninguna de estas capacidades.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.

## Casos de uso

- Moderación y triaje de contenido en pipelines backend: dado un documento y una batería de preguntas `noul` ("¿contiene datos personales?", "¿es spam?"), el modelo devuelve probabilidades que se pueden umbrir con un umbral de decisión; encaja en servidores sin GPU.
- Enrutamiento de tickets de soporte: con preguntas `choice` sobre categorías predefinidas, se obtiene una distribución de probabilidad por categoría que permite asignar el ticket al equipo adecuado y medir la confianza de la asignación.
- Extracción de señales de calidad documental: preguntas `score` con niveles ordenados (por ejemplo, 1 a 5) permiten obtener una puntuación esperada Σ i·p_i sobre contratos, informes o artículos.
- Validación de formularios y cumplimiento normativo: comprobar campos obligatorios o cláusulas presentes mediante preguntas `noul` ejecutadas en lote sobre documentos, con la ventaja de que el modelo no inventa texto y solo emite probabilidades.
- Clasificación de intención en asistentes: sustituir un clasificador entrenado ad hoc por un modelo de decisión preentrenado que acepta preguntas tipadas, reduciendo el coste de anotación.
- Integración en herramientas de escritorio o CI: al ejecutarse con onnxruntime-node y caber en 3,1 GB, se puede embeber en aplicaciones locales o en jobs de integración continua para etiquetar artefactos (por ejemplo, PromptForge, el proyecto para el que se exportó).
- Filtrado previo en pipelines RAG: decidir con preguntas `noul` si un fragmento recuperado es relevante antes de pasarlo a un modelo generativo, ahorrando llamadas a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una verificación de humo sobre 3 peticiones cortas (una `choice`, una `noul` y una `score`) comparando contra el código PyTorch de kev en bf16 sobre CPU:

| Metrica | Valor |
|---|---|
| Diferencia absoluta maxima de probabilidad vs. referencia PyTorch | 0,0067 |
| Coincidencia de respuesta top-1 | 3/3 |
| Concordancia onnxruntime-node vs. onnxruntime Python | dentro de 1e-6 |
| Latencia por peticion | 4–6,5 s en 2 hilos de CPU de un portátil pequeño |

El propio autor advierte que se trata de una prueba de humo, no de una repetición de las suites de evaluación de kev.

## Requisitos de hardware

- VRAM: no aplica; la exportación está pensada para el execution provider de CPU.
- Memoria RAM: el grafo pesa 3,1 GB en fp32; se recomienda al menos 4 GB libres para cargar el modelo y el resto de tensores.
- GPU: no se documenta soporte GPU para esta exportación concreta; el autor la construyó explícitamente para CPU.
- Cabe en hardware consumer: sí, en cualquier equipo con CPU x86-64 y ~4 GB de RAM; el autor lo probó en una máquina de 3 GB (con el modelo de referencia en bf16, no en fp32).
- Opciones de despliegue: onnxruntime 1.32 (Python) y onnxruntime-node 1.30.0; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: 4–6,5 s por petición en 2 hilos de CPU de un portátil pequeño; el throughput no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| stessee/kev-0.8b-ONNX-fp32 | 0,8B | no disponible | ONNX fp32 (CPU) | Apache-2.0 | Exportación no oficial, salida de `last_hidden_state` + cabeza separada |
| jaredpalmer/kev-0.8b | 0,8B | no disponible | PyTorch (modelo original) | Apache-2.0 | Referencia oficial; incluye la cabeza de puntero integrada |
| Qwen/Qwen3.5-0.8B-Base | 0,8B | no disponible | safetensors (base) | Apache-2.0 | Modelo base generativo; no es un modelo de decisión |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Exportación no oficial: no la mantiene el autor original de kev ni el equipo de Qwen; puede quedar desincronizada respecto a futuras versiones del modelo base.
- No es un modelo generativo: no produce texto, por lo que no sirve para chat, redacción ni resumen.
- Solo fp32: no hay variantes cuantizadas en este repositorio, lo que limita el ahorro de memoria y puede penalizar la latencia en CPU.
- La verificación es una prueba de humo de 3 peticiones; no hay evidencia publicada de rendimiento en las suites de evaluación de kev.
- La cabeza de puntero se distribuye aparte (`head.bin` + `head.json`); es necesario implementar el cálculo de softmax y la temperatura manualmente, con riesgo de errores de integración.
- Dependencia de ops contrib de onnxruntime (LinearAttention, CausalConvWithState, GroupQueryAttention, MatMulNBits) y de versiones concretas (1.32 en Python, 1.30.0 en Node), lo que puede romper en entornos con versiones distintas.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento correcto fuera del idioma de entrenamiento de kev.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; al emitir solo probabilidades, el riesgo se traslada a una calibración deficiente en dominios alejados de los datos de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero al ser una exportación no oficial conviene verificar la licencia y los términos del modelo base y del modelo kev original antes de desplegarla en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stessee/kev-0.8b-ONNX-fp32
- Modelo kev original: https://huggingface.co/jaredpalmer/kev-0.8b
- Repositorio de kev: https://github.com/jaredpalmer/kev
- Modelo base Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- PromptForge (proyecto para el que se exportó): https://github.com/Codeuctivity/PromptForge
