# wolfmanfx/gemma-4-E4B-it-A2UI-Express-ONNX

## Resumen

Gemma 4 E4B it A2UI Express ONNX es un ajuste fino del modelo Gemma 4 E4B instruct de Google, desarrollado por el usuario wolfmanfx, especializado en generar código del DSL A2UI Express. A2UI es un lenguaje de descripción de interfaces que representa componentes con constructores nombrados, listas, eventos y rutas de datos; el host compila el código generado a mensajes del protocolo A2UI 1.0 y renderiza componentes nativos de la aplicación. El modelo no renderiza nada por sí mismo: produce texto fuente que la aplicación valida con el compilador oficial.

El ajuste se realizó con LoRA sobre una conversión MLX de 4 bits del modelo base `unsloth/gemma-4-E4B-it` y se exportó a ONNX en cuantización q4f16 para su ejecución en navegador mediante Transformers.js y WebGPU. El repositorio ocupa 5,0 GB e incluye las sesiones de texto ONNX adaptadas, el adaptador MLX original (77 MB) y el system prompt de 7,6k tokens que define el catálogo de componentes y las reglas de sintaxis.

Su relevancia es acotada pero concreta: es un ejemplo de ajuste de un modelo de 4B para una tarea de generación estructurada ejecutable en el cliente, sin backend, con licencia Apache 2.0. No es un modelo de propósito general; su rendimiento fuera de la tarea A2UI Express no ha sido evaluado ni documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), ajustado con LoRA y exportado a ONNX |
| Parametros totales | no disponible (modelo base Gemma 4 E4B; el repositorio no declara el recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como cifra oficial; el entrenamiento usó un límite de secuencia de 12.288 tokens con prompt enmascarado, y el system guide ocupa unos 7,6k tokens |
| Tipos de cuantizacion | q4f16 (ONNX, grupo de 64 en la conversión MLX de entrenamiento); adaptador MLX de 4 bits |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (sesiones de texto q4f16) y adaptador MLX (`adapter-mlx/`) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B instruct, un transformer decoder-only de la familia Gemma 4. El ajuste se aplicó con `mlx_lm.lora` sobre todas las capas, con rango 8, escala 2.0 (alpha 16), dropout 0, learning rate 0.0001 con Adam, batch y acumulación de 1, gradient checkpointing y semilla 3407. La secuencia se limitó a 12.288 tokens con máscara sobre el prompt, de modo que la pérdida solo cubre el turno del asistente. El adaptador nativo contiene 684 tensores correspondientes a 342 matrices lógicas adaptadas; la exportación a navegador parchea 300 matrices ONNX preservando la estructura del grafo del decoder.

Los datos de entrenamiento fueron generados por un profesor local Gemma 4 26B-A4B a partir de 96 semillas de escenario y validados con el compilador Express real, comprobaciones del grafo de componentes y de data binding; los objetivos inválidos se descartaron. El conjunto resultante tiene 159 filas (54 creaciones de vista, 54 respuestas a formularios enviados y 51 ediciones de una vista existente) y 21 filas de validación. Cada fila incluye el system guide completo de unos 7,9k tokens. Los valores de espaciado se reescribieron a los pasos de 4px del catálogo antes del entrenamiento y se reservaron ocho casos fuera del conjunto de entrenamiento. Se seleccionó el checkpoint del paso 40 de una ejecución de 160 pasos: la pérdida de validación bajó de 0,367 a 0,035 en el paso 80, pero los checkpoints posteriores omitían hechos solicitados en las vistas generadas.

## Capacidades

- Generación de código fuente en el DSL A2UI Express: constructores de componentes, listas, eventos y rutas de datos.
- Creación de vistas informativas (tarjetas con jerarquía visual y hechos concretos).
- Generación de formularios y respuestas a envíos de formularios.
- Edición de vistas existentes a partir de instrucciones en lenguaje natural.
- Seguimiento de un catálogo de componentes y de reglas de sintaxis definidos en un system prompt largo (unos 7,6k tokens).
- Decodificación greedy recomendada en los ejemplos del autor (`do_sample: false`).
- Ejecución en navegador con Transformers.js y WebGPU (probado con `@huggingface/transformers` 4.3.2 y Chrome con `shader-f16`).
- No soporta visión, audio ni vídeo: la exportación contiene únicamente sesiones de texto.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso fuera del flujo de generación y reparación guiado por el compilador.

## Casos de uso

- Generación de interfaces en el navegador sin backend: la aplicación descarga el modelo y genera código A2UI Express localmente con WebGPU, útil para entornos con requisitos de privacidad o conectividad limitada.
- Creación de tarjetas informativas: el modelo produce vistas con jerarquía visual a partir de hechos y precios proporcionados por el usuario, como en el ejemplo del acuario del autor.
- Generación de formularios: produce formularios con campos enlazados a rutas de datos que el host compila y renderiza como componentes nativos.
- Procesamiento de envíos de formularios: genera la vista de respuesta tras un submit, uno de los tres tipos de fila del conjunto de entrenamiento.
- Edición incremental de vistas: modifica una vista existente siguiendo instrucciones en lenguaje natural, sin regenerarla desde cero.
- Reparación guiada por compilador: la aplicación valida la salida con el compilador Express y puede devolver la retroalimentación al modelo para que corrija el código generado.
- Prototipado rápido de interfaces en demos web: el ejemplo público de CopilotKit Express demuestra el flujo completo de descarga, inferencia y renderizado en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta una única evaluación sobre ocho casos reservados (dos tarjetas informativas, dos formularios, sus dos envíos y dos ediciones), con decodificación greedy en MLX:

| Métrica | Resultado |
|---|---|
| Casos que compilan al primer intento | 7 de 8 |
| Hechos y precios solicitados mostrados | 14 de 14 |
| Entradas enlazadas correctamente | todas (la información se corta en este punto) |

El autor advierte que las peticiones más amplias que el ejemplo curado pueden fallar y que la generación en bruto con solo el system guide no tiene una puntuación de calidad separada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial; el repositorio pesa 5,0 GB y la cuantización es q4f16, por lo que se espera un uso de memoria en el entorno de los 5 GB para las sesiones de texto.
- GPU recomendadas: no disponibles; el autor solo documenta ejecución en navegador con WebGPU y `shader-f16`, probada en Chrome con GPU compatible.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño q4f16, aunque no se documentan pruebas en tarjetas concretas (RTX 4090, etc.).
- Despliegue: Transformers.js con WebGPU para navegador; el adaptador MLX requiere la misma conversión de 4 bits del base (`mlx_lm.convert -q`, grupo de 64) para carga nativa.
- Latencia y throughput: no disponibles. El autor indica que la primera carga incluye una descarga considerable y la inicialización de la GPU, y que cada respuesta hace prefill del system guide de 7,6k tokens, lo que supone la mayor parte de la espera.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E4B-it-A2UI-Express-ONNX | no disponible (base E4B) | no disponible (entrenado a 12.288) | DSL A2UI Express, navegador | Apache 2.0 | Hugging Face, ONNX + MLX |
| gemma-4-E2B-it-A2UI-Express-ONNX | no disponible (base E2B) | no disponible | DSL A2UI Express, navegador | no disponible en la información | Hugging Face, exportación anterior del mismo autor |
| unsloth/gemma-4-E4B-it | no disponible | no disponible | propósito general, instruct | no disponible en la información | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: fuera de la generación de A2UI Express no ha sido evaluado; no debe usarse como asistente general.
- Solo inglés: el único idioma declarado es `en`.
- Solo texto: la exportación no incluye visión, audio ni vídeo.
- Riesgo de alucinación en hechos: el autor documenta que checkpoints posteriores al paso 40 omitían hechos solicitados; el modelo seleccionado puede fallar en peticiones más amplias que el ejemplo curado.
- Dependencia del catálogo: la salida debe validarse con el compilador Express y el catálogo de componentes correspondiente al system guide incluido; un catálogo distinto invalida el ajuste.
- Coste de prefill: cada respuesta reprocesa un system guide de 7,6k tokens, lo que domina la latencia en navegador.
- Requisitos de ejecución: WebGPU con `shader-f16` en Chrome; el adaptador MLX nativo exige la misma conversión de 4 bits del base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad de las salidas en producción.
- Repositorio sin descargas ni likes en el momento de la consulta; proyecto de autor individual sin validación externa documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wolfmanfx/gemma-4-E4B-it-A2UI-Express-ONNX
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Exportación anterior E2B: https://huggingface.co/wolfmanfx/gemma-4-E2B-it-A2UI-Express-ONNX
- Demo CopilotKit Express: https://a2ui-express-demo-8d8183.web.app/
- Especificación A2UI Express: https://a2ui.org/specification/proposals/express/
- Librería Transformers.js: https://www.npmjs.com/package/@huggingface/transformers
