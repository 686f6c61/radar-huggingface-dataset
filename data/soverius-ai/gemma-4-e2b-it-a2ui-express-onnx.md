# soverius-ai/gemma-4-E2B-it-A2UI-Express-ONNX

## Resumen

Gemma 4 E2B es un modelo de lenguaje de la familia Gemma 4 de Google, en su variante mas pequena (2.100 millones de parametros). La ficha que nos ocupa, `soverius-ai/gemma-4-E2B-it-A2UI-Express-ONNX`, no es el modelo base sino un fine-tune LoRA realizado por el usuario soverius-ai sobre `unsloth/gemma-4-E2B-it`, especializado en generar el DSL de A2UI Express para la demo CopilotKit Express. El resultado se ha exportado a ONNX en cuantizacion q4f16 para ejecutarse en navegador mediante transformers.js y WebGPU.

El objetivo del modelo es convertir conversaciones en lenguaje natural en estructuras DSL de A2UI Express, es decir, formularios, tarjetas informativas y cadenas multi-turno con acciones (creacion, edicion, segundas vistas y acciones enviadas). El autor reporta una tasa de exito de 48/49 en el conjunto de test de seguimiento retenido, con 19/19 en creaciones, 18/19 en ediciones y 11/11 en respuestas de accion.

Es relevante ahora porque demuestra un flujo completo de fine-tuning pequeno (LoRA rank 8, 768 pasos, 512 conversaciones) llevado hasta despliegue en navegador con ONNX Runtime Web y WebGPU, un patron cada vez mas comun para asistentes de UI generativa que deben ejecutarse en el cliente sin depender de un servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), con capas de compuerta de entrada y proyeccion por capa |
| Parametros totales | 2.100 millones (modelo base Gemma 4 E2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (modelo base, segun gemma4.dev) |
| Tipos de cuantizacion | q4f16 (4 bits, block size 32, asimetrica, ONNX Runtime quantizer); adaptador en MLX 4-bit |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 para el fine-tune; los pesos Gemma conservan los terminos de Google (ver NOTICE.txt) |
| Formato de pesos | ONNX (sesiones q4f16); adaptador LoRA en formato MLX (`mlx_lm`, rank 8, scale 2.0) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E2B es un transformer decoder-only de 2.100 millones de parametros, text-only, con 8.192 tokens de contexto y disenado para ejecucion en CPU o dispositivos de borde. Incluye en su arquitectura capas de compuerta de entrada y proyeccion por capa, que el fine-tune tambien adapta.

El fine-tune es un LoRA de rango 8, alpha 16, sin dropout, aplicado a todas las proyecciones del modelo de lenguaje (incluidas las compuertas y proyecciones por capa de Gemma 4). Se entreno con Adam a tasa constante 1e-4, batch 1, semilla 3407, perdida solo en el turno del asistente, durante 768 pasos (1,5 epocas) sobre 512 conversaciones: 159 filas de formulario originales, 90 tarjetas informativas y 272 cadenas multi-turno generadas con el propio constructor de peticiones de la demo. El checkpoint publicado es el 540, seleccionado por tasa de compilacion en el conjunto de test. El adaptador se entreno sobre una cuantizacion MLX 4-bit en tiempo de ejecucion del modelo base.

La exportacion a ONNX parte de las sesiones q4f16 de `onnx-community/gemma-4-E2B-it-ONNX` (revision de grafo `6f21c99d7e18237f8d2ce92aadfdbfeba877f63a`). Se re-cuantizaron 240 matrices `MatMulNBits` a partir de los pesos fusionados; el grafo del decoder y los datos de embedding son identicos byte a byte a la exportacion base. El adaptador tiene SHA-256 `54c7414491e36610133c5f22e0397a66e97d901e3b119238abf50042dc7aa323` y se acompanan un manifiesto de procedencia (`a2ui-export-manifest.json`) y el system prompt exacto (`system_prompt.txt`).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Gemma 4 E2B-it.
- Generacion del DSL de A2UI Express: formularios, tarjetas informativas y cadenas multi-turno con acciones.
- Razonamiento multi-turno para creacion, edicion, segundas vistas y respuestas a acciones enviadas.
- Entrada image-text-to-text declarada en los tags del repositorio (heredada del pipeline del modelo base).
- Ejecucion en navegador con transformers.js, WebGPU y `shader-f16` requerido.
- Carga de un system prompt especifico del SDK de A2UI (guia Express generada por catalogo).
- No dispone de tool calling ni function calling documentados en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Asistentes de UI generativa en el navegador: el modelo puede convertir instrucciones en lenguaje natural en formularios y tarjetas A2UI Express, ejecutandose integramente en el cliente con WebGPU y sin enviar datos a un servidor.
- Demos de CopilotKit Express: es el checkpoint entrenado especificamente para el constructor de peticiones y el compilador de esa demo, con 48/49 pasos correctos en el test retenido.
- Creacion de formularios dinamicos: a partir de una descripcion textual, el modelo emite el DSL que el compilador Express valida y renderiza, util para prototipado rapido de interfaces.
- Edicion incremental de vistas: soporta cadenas de edicion sobre vistas ya creadas (18/19 en el test), adecuado para asistentes que refinan una UI paso a paso.
- Respuestas a acciones enviadas: con 11/11 en el test, puede gestionar la confirmacion o el resultado de acciones de formulario dentro de un flujo conversacional.
- Aplicaciones de borde y bajo consumo: al ser un modelo de 2.100 millones de parametros cuantizado a 4 bits, cabe en dispositivos con recursos limitados y permite latencia baja sin backend.
- Prototipado de agentes de UI: sirve como base para experimentar con generacion de interfaces en entornos de investigacion o demos internas antes de pasar a un modelo mayor.

## Benchmarks y rendimiento

El autor reporta resultados en el conjunto de test de seguimiento retenido de la demo (49 pasos de cadena, compilados con el compilador Express contra las vistas comprometidas):

| Metrica | Resultado |
|---|---|
| Pasos totales correctos | 48/49 |
| Creaciones | 19/19 |
| Ediciones | 18/19 |
| Respuestas de accion | 11/11 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,2 GB en cuantizacion q4f16; la inferencia en WebGPU requiere un navegador con soporte de `shader-f16`.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU y shaders de media precision; en servidor, GPU con soporte ONNX Runtime (no se especifican modelos concretos en la informacion disponible).
- Cabe en GPU de consumo: si, al tratarse de un modelo de 2.100 millones de parametros en 4 bits; el modelo base esta disenado para ejecutarse incluso en CPU.
- Opciones de despliegue: transformers.js con `@huggingface/transformers` (`dtype: "q4f16"`, `device: "webgpu"`); el adaptador tambien esta disponible en formato MLX para `mlx_lm`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-A2UI-Express-ONNX (este) | 2.100 M | 8.192 | Apache 2.0 (pesos Gemma con terminos de Google) | ONNX q4f16 + LoRA MLX | Fine-tune especializado en A2UI Express, 48/49 en test retenido |
| soverius-ai/gemma-4-E4B-it-A2UI-Express-ONNX | no disponible (familia E4B) | no disponible | Apache 2.0 (pesos Gemma con terminos de Google) | ONNX | Fine-tune equivalente sobre E4B, 160 pasos LoRA, 240 conversaciones, validation loss 0.038 |
| Gemma 4 E2B (base) | 2.100 M | 8.192 | Terminos de Google | safetensors / ONNX | Modelo generalista text-only, sin especializacion en A2UI |

## Limitaciones y advertencias

- La salida del modelo no esta garantizada como correcta; el autor recomienda validarla siempre con el compilador de A2UI Express.
- El entrenamiento se realizo exclusivamente en ingles; no hay soporte multilingue documentado.
- El fine-tune esta especializado en un unico dominio (DSL de A2UI Express para la demo CopilotKit); su utilidad fuera de ese contexto es limitada.
- El dataset de entrenamiento es pequeno (512 conversaciones) y el checkpoint seleccionado es el 540 de 768 pasos, lo que puede implicar sobreajuste al formato de la demo.
- Los pesos Gemma conservan los terminos de licencia de Google, que pueden imponer restricciones adicionales al uso comercial aunque el fine-tune se declare Apache 2.0.
- Riesgo de alucinacion en la generacion del DSL: estructuras sintacticamente validas pero semanticamente incorrectas pueden pasar el compilador.
- El despliegue en navegador requiere WebGPU y soporte de `shader-f16`; no funcionara en navegadores o dispositivos sin estas capacidades.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/soverius-ai/gemma-4-E2B-it-A2UI-Express-ONNX
- Modelo base del fine-tune: https://huggingface.co/unsloth/gemma-4-E2B-it
- Exportacion ONNX de referencia: https://huggingface.co/onnx-community/gemma-4-E2B-it-ONNX
- Fine-tune hermano sobre E4B: https://huggingface.co/soverius-ai/gemma-4-E4B-it-A2UI-Express-ONNX
- Ficha de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
