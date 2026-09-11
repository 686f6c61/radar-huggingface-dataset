# stbenjam/qwen3-0.6b-claudish-gguf

## Resumen

Claudish Qwen3-0.6B es un ajuste fino (fine-tuning) de tipo transferencia de estilo sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario stbenjam. Su objetivo es puramente educativo: imitar de forma exagerada el registro retorico de los ensayos largos, con encabezados, matices y fragmentos dramaticos, sin ninguna vinculacion con Anthropic ni con pesos de Claude. No es un asistente general, sino una demostracion de pos-entrenamiento reproducible que cabe en un portatil.

El modelo se distribuye ya fusionado (el adaptador LoRA esta integrado en los pesos base) y cuantizado en formato GGUF Q8_0, con un tamano aproximado de 639 MB. Se puede ejecutar directamente con Ollama sin necesidad de Python, MLX, clonar repositorios ni claves de API. Cuenta con 596.049.920 parametros totales, licencia Apache-2.0 y soporte unicamente en ingles.

Su relevancia es la de un caso de estudio: muestra un flujo completo de entrenamiento Local (LoRA de rango 16 sobre las 12 capas finales en un Apple M4 Pro de 48 GB), seleccion de checkpoint por perdida de validacion y exportacion a GGUF. El propio autor advierte que no es una medida calibrada de calidad ni de similitud con Claude.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) con ajuste LoRA fusionado (rank 16 sobre las 12 capas finales) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen/Qwen3-0.6B) |
| Tipos de cuantizacion | Q8_0 publicado; otros tipos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo fusionado completo, ~639 MB) |

## Arquitectura y entrenamiento

La base es Qwen/Qwen3-0.6B, un transformer decoder-only denso de 0,6 mil millones de parametros. Sobre el se aplico un adaptador LoRA de rango 16 unicamente en las 12 capas finales, lo que da lugar a 4.325.000 parametros entrenables. La configuracion de entrenamiento reportada incluye tamano de lote 2, tasa de aprendizaje 0,00005, dropout 0,05 y semilla 314. El autor selecciono la actualizacion 100 de 300 atendiendo a la perdida de validacion. Todo el proceso se ejecuto localmente en un Apple M4 Pro con 48 GB de memoria unificada.

El conjunto de datos de entrenamiento son 390 conversaciones sinteticas modulares y originales sobre 78 temas, mas 16 conversaciones de validacion sobre ocho temas distintos. No se usaron transcripciones de Claude ni pesos de Claude. El autor aclara que los ejemplos comparten pasajes retoricos, por lo que no equivalen a 390 ensayos independientes. El adaptador seleccionado se fusiono con el modelo base fijado mediante MLX LM y despues se convirtio a GGUF Q8_0 con llama.cpp. La plantilla de chat embebida usa unicamente el ultimo mensaje del usuario y arranca en cada turno sin historial, ademas de forzar el modo sin razonamiento (non-thinking); no existe una instruccion de estilo oculta.

## Capacidades

- Generacion de texto en ingles con un estilo retorico deliberadamente verboso: encabezados, matices (hedging) y fragmentos dramaticos.
- Transferencia de estilo como tarea principal, no como asistente general.
- Generacion sin estado por turno: la plantilla embebida ignora el historial y responde solo al ultimo mensaje del usuario.
- Modo sin razonamiento integrado en la plantilla; no expone cadenas de pensamiento.
- Ejecucion local sin dependencias de Python ni claves de API mediante Ollama.
- No dispone de herramientas (tool calling), function calling ni acceso a informacion en vivo.
- No tiene capacidades multimodales (ni vision ni audio).
- Multilingue: no disponible; el modelo declara soporte unicamente en ingles.

## Casos de uso

- Demostracion educativa de pos-entrenamiento: sirve para ilustrar de principio a fin un pipeline de LoRA, seleccion de checkpoint y exportacion a GGUF en hardware de consumo, con codigo y evidencias publicados en el repositorio posttrain-demo.
- Transferencia de estilo controlada: util para experimentar con la reescritura de textos breves en un registro ensayistico y verboso, midiendo cambios de longitud y de marcadores retoricos.
- Generacion de datos sinteticos de estilo: puede emplearse como generador de ejemplos con un tono concreto para alimentar experimentos posteriores de filtrado o de clasificacion de estilo, siempre que se validen manualmente.
- Pruebas de integracion con Ollama: por su tamano minimo (639 MB en Q8_0), es adecuado para verificar plantillas de chat, parametros de muestreo y comportamiento de contexto fresco en entornos Ollama.
- Benchmarking de motores de inferencia: sirve como modelo de juguete para comparar latencia y throughput entre llama.cpp, Ollama y otros clientes GGUF sin consumir recursos significativos.
- Docencia y talleres de IA: permite que estudiantes ejecuten un modelo ajustado completo en un portatil, sin GPU dedicada, para observar el efecto de una cuantizacion Q8_0 frente al adaptador MLX original.
- Pruebas de formato y plantillas Jinja: util para validar como distintos clientes GGUF respetan o sobrescriben la plantilla embebida y el arranque sin historial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que la unica evidencia de evaluacion es una comprobacion casera sobre 21 respuestas, que no constituye una medida calibrada de similitud con Claude ni de calidad de respuesta:

| Metrica (comprobacion casera) | Antes | Despues |
|---|---|---|
| Longitud media de respuesta | 100 palabras | 300 palabras |
| Presencia de longitud, encabezados y marcadores retoricos | 0/21 | 18/21 |

El autor advierte que estas cifras describen el adaptador MLX original y no una repeticion del benchmark sobre el GGUF cuantizado; la cuantizacion Q8_0 y un motor de inferencia distinto pueden alterar salidas concretas. Las comprobaciones de humo en Ollama validan generacion y comportamiento de contexto fresco, no la calidad global.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en Q8_0 (639 MB de pesos mas overhead de contexto); en F16 rondaria 1,2 GB; en cuantizaciones de 4 bits, en torno a 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Funciona en RTX 3060, RTX 4090 y similares sin aprovechar su capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU.
- Ejecucion en hardware del autor: entrenamiento y exportacion en un Apple M4 Pro con 48 GB de memoria unificada.
- Opciones de despliegue: Ollama (via `ollama run hf.co/stbenjam/qwen3-0.6b-claudish-gguf:Q8_0`) y llama.cpp; el repositorio menciona tambien el adaptador original en MLX.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Claudish Qwen3-0.6B (GGUF) | 596.049.920 | no disponible | solo comprobacion casera de estilo (18/21); sin benchmarks estandar | Apache-2.0 | GGUF en HuggingFace / Ollama |
| Qwen/Qwen3-0.6B (base) | 0,6 mil millones | no disponible en la informacion proporcionada | no disponible aqui | Apache-2.0 (segun el modelo base) | HuggingFace |
| stbenjam/qwen3-0.6b-claudish-mlx-lora (adaptador original) | adaptador: 4.325.000 entrenables | no disponible | punto de partida de las cifras de longitud y marcadores | Apache-2.0 (heredada) | HuggingFace (MLX) |
| Otros modelos de ~1B para estilo o instrucciones | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de la misma categoria (por ejemplo, otros modelos ajustados para estilo o modelos de ~0,5-1B) no puede completarse con datos de rendimiento, porque no se han publicado benchmarks comparables.

## Limitaciones y advertencias

- No es un asistente general fiable: el propio autor lo describe como un experimento educativo de estilo, no como un asistente utilizable en produccion.
- Riesgo de alucinacion y de errores factuales: reutiliza pasajes de forma mecanica y puede inventar hechos; no dispone de herramientas ni de informacion en vivo.
- Problema de contexto en conversaciones multi-turno: con historial, puede seguir respondiendo a la pregunta anterior tras un cambio de tema. Un intento posterior de entrenamiento no lo corrigio de forma fiable, y el lanzamiento mantiene el adaptador original con el arranque sin historial como solucion provisional.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de idioma: solo ingles; el resto de idiomas no estan soportados de forma declarada.
- Limitaciones de contexto: la longitud de contexto no se documenta en la informacion disponible; ademas, la plantilla embebida descarta el historial, por lo que el contexto util por turno queda reducido al ultimo mensaje.
- Sin posprocesado de la salida: no existe ningun mecanismo que fuerce la forma deseada; el estilo depende por completo de los pesos entrenados.
- Licencia y atribucion: el modelo es Apache-2.0, con el archivo NOTICE correspondiente. El dataset externo de haiku, donde se use, conserva atribucion CC BY 4.0. No implica respaldo alguno por parte de Qwen, Anthropic ni del creador del dataset.
- Aclaracion de identidad: se trata de una parodia basada en Qwen, sin afiliacion con Anthropic y sin pesos de Claude ni transcripciones de Claude en los datos de entrenamiento.
- Integridad del artefacto: el adaptador original tiene SHA-256 `29bd16a3eef96840d537b7f0dc4d5bfd58b107fd57b31d049a6edc7c07ac63d2`; los detalles de exportacion estan en `export.json` y la seleccion de checkpoint, en `selection.json`.
- Advertencia sobre la cuantizacion: los numeros reportados corresponden al adaptador MLX, no al GGUF Q8_0; los resultados pueden variar segun el motor de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stbenjam/qwen3-0.6b-claudish-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de codigo, entrenamiento y evidencias: https://github.com/stbenjam/posttrain-demo
- Adaptador original en MLX: https://huggingface.co/stbenjam/qwen3-0.6b-claudish-mlx-lora
- Resultados completos: https://github.com/stbenjam/posttrain-demo/blob/main/claudish/RESULTS.md
- Fuentes y atribuciones de estilo: SOURCES.md (referenciado en el repositorio del autor)
- Descarga de Ollama: https://ollama.com/download
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos eran foros y articulos sin relacion con el mismo.
