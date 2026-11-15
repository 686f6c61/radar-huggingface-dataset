# weavetab/gate-1

## Resumen

`weavetab/gate-1` es un modelo de clasificación de texto en modo zero-shot, destilado y cuantizado a INT8 en formato ONNX, publicado por Weavetab como componente de decisión de su pasarela de API (`https://api.weavetab.dev`). Deriva de `knowledgator/gliclass-edge-v3.0` (familia GLiClass de Knowledgator, basada en arquitectura ModernBERT) y de la conversión ONNX previa de `cnmoro`. Su función es actuar como una "puerta" (*gate*) de decisión en una sola pasada: clasificar entradas de texto contra un conjunto de etiquetas definidas en tiempo de inferencia sin reentrenamiento.

El interés técnico del modelo está en su perfil de despliegue: un único fichero `model_i8.onnx` de 33,4 MB más un tokenizer ModernBERT de 3,58 MB, lo que permite ejecutarlo en CPU con latencia muy baja y sin dependencias de GPU. Esto lo hace adecuado para filtrado previo, enrutamiento de peticiones o guardarraíles dentro de pipelines de servidores, no para generación de texto.

La información publicada por el autor es muy escasa: no se detallan parámetros, longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. La model card se limita a listar ficheros, atribución y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (heredada de GLiClass Edge v3.0), clasificación zero-shot en una pasada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (fichero `model_i8.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_i8.onnx`, 33,4 MB) + tokenizer ModernBERT (`tokenizer.json`, 3,58 MB) |

## Arquitectura y entrenamiento

El modelo es una destilación/cuantización de `knowledgator/gliclass-edge-v3.0`, un modelo de la familia GLiClass orientado a clasificación zero-shot. GLiClass emplea un encoder tipo ModernBERT con atención eficiente y está diseñado para recibir, junto al texto, un conjunto de etiquetas candidatas y producir puntuaciones de compatibilidad en una sola pasada (*single-pass decision*), a diferencia de los enfoques NLI que requieren una pasada por etiqueta.

La versión `gate-1` se distribuye exclusivamente como grafo ONNX cuantizado a INT8, presumiblemente mediante cuantización post-entrenamiento (PTQ) sobre la conversión ONNX de `cnmoro/gliclass-edge-v3.0-onnx`. No se publican detalles sobre el dataset de entrenamiento original, número de tokens, técnicas de alineación (RLHF/DPO) ni proceso exacto de cuantización. Tampoco se documenta el procedimiento de destilación respecto al modelo base de Knowledgator.

## Capacidades

- Clasificación de texto zero-shot: permite definir etiquetas arbitrarias en tiempo de inferencia sin reentrenamiento.
- Clasificación multietiqueta y de etiqueta única, según la configuración de inferencia del pipeline `text-classification`.
- Decisión en una sola pasada sobre el par (texto, etiquetas), lo que reduce el coste frente a esquemas NLI por etiqueta.
- Ejecución en CPU mediante ONNX Runtime, sin requisito de GPU.
- Integración como componente de enrutamiento o guardarraíl dentro de una pasarela de API (uso declarado por el autor en Weavetab Gate).
- Tool calling / function calling: no soportado (no es un modelo generativo).
- Capacidades de agente o razonamiento multi-paso: no soportadas de forma nativa.
- Capacidades multilingües: no documentadas; no disponibles.
- Visión, audio o modo *thinking*: no soportados.

## Casos de uso

- Enrutamiento de peticiones en una pasarela de API: clasificar cada solicitud entrante contra un conjunto de categorías (por ejemplo, "consulta técnica", "facturación", "abuso") y derivarla al backend correspondiente con una latencia de milisegundos gracias al grafo INT8 en CPU.
- Guardarraíles de contenido: evaluar si un texto de entrada o salida cae en categorías sensibles definidas dinámicamente, actuando como filtro previo antes de invocar un LLM generativo.
- Moderación de comentarios en foros o soporte: clasificar mensajes contra etiquetas como "spam", "insulto" o "consulta legítima" sin necesidad de entrenar un clasificador específico.
- Etiquetado automático de tickets: asignar categorías a tickets de soporte usando etiquetas que cambian con frecuencia, aprovechando la naturaleza zero-shot para evitar reentrenamientos.
- Filtrado de datasets: clasificar grandes volúmenes de documentos contra taxonomías ad hoc en pipelines de preprocesamiento, donde el coste por inferencia en CPU es determinante.
- Detección de intención en asistentes conversacionales ligeros: identificar la intención del usuario entre un conjunto cerrado de acciones antes de despachar a un modelo mayor.
- Clasificación de correo o mensajes en entornos con recursos limitados: despliegue en contenedores pequeños o dispositivos edge donde no cabe un modelo basado en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (ejecución en CPU vía ONNX Runtime); el fichero de pesos ocupa 33,4 MB en INT8.
- GPU recomendadas: no necesarias; cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) puede acelerar la inferencia, pero no es un requisito.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), servidores de inferencia compatibles con ONNX, integración directa en servicios Python/Go/Rust mediante bindings de ONNX Runtime. No se distribuye en formato GGUF ni safetensors, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente.
- Latencia y throughput estimados: no disponibles en la información publicada; por el tamaño del modelo (33,4 MB INT8) se espera latencia de pocos milisegundos por petición en CPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `weavetab/gate-1` | no disponible | no disponible | ONNX INT8 | Apache 2.0 | Cuantizado, single-pass, orientado a CPU |
| `knowledgator/gliclass-edge-v3.0` | no disponible | no disponible | safetensors (presumible) | no disponible en la informacion | Modelo base sin cuantizar de la familia GLiClass Edge |
| `cnmoro/gliclass-edge-v3.0-onnx` | no disponible | no disponible | ONNX | no disponible en la informacion | Conversión ONNX previa a la cuantización INT8 |
| `knowledgator/gliclass-small-v1.0` | no disponible | no disponible | safetensors | no disponible en la informacion | Variante Small de GLiClass, de mayor tamaño que Edge |

La comparación con alternativas de la misma categoría (clasificadores zero-shot ligeros como DeBERTa-NLI o BART-large-MNLI) no puede establecerse con datos numéricos porque no se han publicado métricas para `gate-1`.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas de precisión, F1 ni latencia, lo que impide evaluar su calidad frente al modelo base o a alternativas.
- Sin documentación de idiomas: no se especifica si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés; el modelo base GLiClass está orientado principalmente a inglés.
- Riesgo de alucinación en la asignación de etiquetas: como todo clasificador zero-shot, puede producir puntuaciones altas para etiquetas semánticamente próximas pero incorrectas, especialmente con taxonomías ambiguas.
- Sesgos heredados del modelo base: al ser una destilación de `gliclass-edge-v3.0`, arrastra los sesgos del dataset de entrenamiento original, no documentados.
- Cuantización INT8 sin evaluación publicada: no se documenta la pérdida de precisión respecto al modelo en punto flotante.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la pasarela que lo acompaña (`github.com/Weavetab/gate`) está bajo AGPL-3.0, lo que puede afectar a despliegues que integren ese código.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por terceros ni de validación externa.
- No apto para generación de texto, razonamiento ni tool calling: es exclusivamente un clasificador.
- Fecha de creación posterior a la fecha actual de referencia (2026-11-15): conviene verificar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/weavetab/gate-1
- Modelo base: https://huggingface.co/knowledgator/gliclass-edge-v3.0
- Conversión ONNX base: https://huggingface.co/cnmoro/gliclass-edge-v3.0-onnx
- Repositorio de la pasarela (AGPL-3.0): https://github.com/Weavetab/gate
- API de Weavetab: https://api.weavetab.dev
