# Steven10429/laya-typed-decisions-webgpu-q4

## Resumen

`laya-typed-decisions-webgpu-q4` es una cuantizacion a 4 bits del checkpoint `typed-decisions` del modelo `convaiinnovations/laya`, exportada a ONNX en formato dividido (split) para poder ejecutarse directamente en el navegador mediante ONNX Runtime Web con backend WebGPU. El autor es Steven10429 y el trabajo se apoya en el modelo base ModernBERT-large de ConvAI Innovations / Nandakishor M. El objetivo es claro: reducir el peso de los ficheros de 1,69 GB en fp32 a 467 MB, manteniendo en lo posible el comportamiento del modelo original, para poder desplegar un motor de decision en cliente sin depender de servidores.

Se trata de un modelo no autorregresivo de "System 1": recibe un texto (un ticket de soporte, un correo, un mensaje de chat) junto con preguntas tipadas (`choice` / `score` / `noul`) y devuelve probabilidades calibradas en una sola pasada hacia delante. No genera texto ni requiere parseo posterior, lo que lo hace adecuado para clasificacion y enrutado de baja latencia. En la medicion del autor sobre un Apple M4 Pro con Chrome, la variante q4 tarda 361 ms de mediana en WebGPU (frente a 265 ms en fp32) y unos 2,8 s en WASM.

Es relevante porque demuestra que un encoder tipo ModernBERT-large fine-tuneado para decisiones puede cuantizarse agresivamente a 4 bits y seguir corriendo en el navegador, abriendo la puerta a casos de uso de privacidad y borde (procesado local de datos sensibles) sin infraestructura de servidor. El modelo es solo en ingles; para otros idiomas el autor remite a una exportacion multilingue separada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base ModernBERT-large) |
| Parametros totales | no disponible (el modelo base es ModernBERT-large) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits weight-only (MatMulNBitsQuantizer, block 32, simetrico); embeddings de tokens en fp32 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (layout dividido para ONNX Runtime Web / WebGPU) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint original `convaiinnovations/laya` (`typed-decisions`), construido sobre ModernBERT-large, un transformer encoder. Sobre esa base se realizo un fine-tuning para tareas de decision tipadas (`choice` / `score` / `noul`) en flujos como observabilidad de trazas de agentes, atencion al cliente, procesamiento de facturas e incidentes de seguridad. Segun la documentacion publica del proyecto Laya, el entrenamiento empleo RLCD (aprendizaje por refuerzo a partir de datos contrastivos) y el resultado es un motor de decision con calibracion destacada y tiempos de inferencia por debajo de 35 ms en su version nativa.

Esta contribucion concreta no vuelve a entrenar el modelo: solo cambia formato y precision. El proceso de exportacion es reproducible mediante `laya-ts/scripts/export_onnx.py` (base en el commit `6d942c9`, con discrepancia torch vs ONNX por debajo de 1e-4) y despues aplica `MatMulNBitsQuantizer` de ONNX Runtime 1.30 en modo 4 bits, block 32 y simetrico sobre todas las multiplicaciones de matrices de pesos del encoder (112) y de la cabeza (8), dejando la capa de embedding de tokens en fp32. La innovacion tecnica relevante es el empaquetado dividido, pensado para que `laya-ts` lo cargue con ONNX Runtime Web.

## Capacidades

- Clasificacion de texto no generativa: devuelve decisiones tipadas (`choice` para categoria, `score` para puntuacion, `noul` para si/no) con probabilidades calibradas en una sola pasada.
- Inferencia no autorregresiva: no hay generacion de texto ni necesidad de parsear la salida.
- Ejecucion en navegador vía ONNX Runtime Web con backend WebGPU, y tambien con fallback WASM.
- Uso como componente de enrutado y decision dentro de pipelines de agentes (observabilidad de trazas, triaje, clasificacion de intenciones).
- No soporta tool calling, function calling ni razonamiento multi-paso de tipo agente generativo: su funcion es clasificar/decidir, no conversar.
- Capacidad multilingue: no en esta exportacion (solo ingles). El autor remite a una exportacion multilingue separada para otros idiomas.
- Sin modo "thinking", sin vision ni audio: es un encoder de texto para clasificacion.

## Casos de uso

- Triaje de tickets de soporte en el navegador: el modelo clasifica departamento, urgencia y riesgo de churn a partir del texto del ticket, devolviendo probabilidades calibradas sin generar texto, lo que simplifica la integracion y reduce la latencia.
- Enrutado de correos y mensajes de chat en local: al ejecutarse en WebGPU, los datos del usuario no salen del dispositivo, util para entornos con requisitos estrictos de privacidad.
- Observabilidad de trazas de agentes: etiquetado automatico de trazas (exito, tipo de tarea, criticidad) en pipelines que ya usan decisiones tipadas.
- Procesamiento de facturas: clasificacion de documentos y decision sobre campos tipados sin necesidad de un LLM generativo.
- Deteccion de incidentes de seguridad: puntuacion y clasificacion de eventos o mensajes para priorizar alertas, apoyandose en la salida `score` calibrada.
- Aplicaciones de navegador y demos interactivas: cualquier interfaz web que necesite clasificar texto en cliente sin backend, aprovechando el layout ONNX dividido que carga `laya-ts`.
- Filtrado y moderacion ligera: decision si/no (`noul`) sobre contenido con un coste computacional bajo en WebGPU.

## Benchmarks y rendimiento

El autor publica mediciones sobre un Apple M4 Pro con Chrome, usando `laya-ts` + `onnxruntime-web` 1.30:

| Variante | Tamano | WebGPU p50 | WASM p50 | Concordancia con fp32 (120 decisiones) | Deriva maxima de probabilidad |
|---|---|---|---|---|---|
| fp32 | 1,69 GB | 265 ms | 2443 ms | — | — |
| q4 (este repo) | 467 MB | 361 ms | ~2,8 s | 110 / 120 | 0,22 |
| q8 (no publicado) | 705 MB | sin kernel WebGPU para MatMulNBits de 8 bits | 2,8 s | 119 / 120 | 0,013 |

Las 120 decisiones corresponden a 40 tickets de soporte etiquetados x 3 preguntas. Precision sobre ese conjunto (departamento / urgencia / churn):

| Variante | Departamento | Urgencia | Churn |
|---|---|---|---|
| fp32 | 0,875 | 0,425 | 0,700 |
| q4 | 0,875 | 0,450 | 0,625 |

La cuantizacion q4 cambia aproximadamente el 8 % de las decisiones respecto a fp32, por lo que el autor recomienda recalibrar los umbrales sobre datos propios. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/tamano en disco: 467 MB para los pesos q4 (frente a 1,69 GB en fp32). El modelo cabe en memoria de cualquier dispositivo moderno, incluidos moviles.
- Orientado a ejecucion en navegador: WebGPU como backend principal (361 ms p50 en un M4 Pro) y WASM como fallback (~2,8 s), por lo que no requiere GPU dedicada de servidor.
- Cabe en GPU de consumo y en hardware de gama integrada, ya que el cuello de botella es el runtime web, no la VRAM.
- Opciones de despliegue: ONNX Runtime Web (WebGPU / WASM) a traves de la libreria `laya-ts`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia estimada: 361 ms de mediana en WebGPU y ~2,8 s en WASM sobre Apple M4 Pro. No se publican cifras de throughput ni de latencia en otras plataformas.

## Comparativa con modelos similares

La comparacion natural es entre las variantes de precision del propio modelo, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada:

| Variante | Tamano | Backend | Concordancia con fp32 | Deriva max. prob. |
|---|---|---|---|---|
| fp32 (original) | 1,69 GB | WebGPU / WASM | referencia | — |
| q8 (no publicado) | 705 MB | WASM | 119 / 120 | 0,013 |
| q4 (este repo) | 467 MB | WebGPU / WASM | 110 / 120 | 0,22 |

En cuanto a alternativas de la misma categoria (encoders de clasificacion tipo ModernBERT-large), no se dispone de comparativas publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion q4 introduce desviaciones: cambia en torno al 8 % de las decisiones respecto a fp32 y presenta una deriva maxima de probabilidad de 0,22. Es imprescindible recalibrar los umbrales sobre datos propios antes de usarlo en produccion.
- El rendimiento en la tarea de urgencia es bajo en las mediciones publicadas (0,425 en fp32 y 0,450 en q4 sobre 40 tickets); no es una tarea resuelta de forma fiable.
- Modelo solo en ingles; el uso en otros idiomas requiere la exportacion multilingue, que no forma parte de este repositorio.
- No es un modelo generativo: no produce texto, no soporta tool calling ni conversacion multi-turno. Usarlo fuera de su proposito de clasificacion/decision dara resultados pobres.
- Riesgo de alucinacion: no aplica en el sentido generativo (no genera texto), pero si existe riesgo de clasificaciones erroneas o mal calibradas, especialmente tras la cuantizacion.
- La capa de embedding de tokens permanece en fp32, por lo que el ahorro de tamano (467 MB frente a 1,69 GB) no es una reduccion proporcional completa.
- No se han publicado sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- Licencia Apache-2.0, igual que los pesos originales de ConvAI Innovations / Nandakishor M; el repositorio solo cambia formato y precision, sin restricciones adicionales documentadas para uso comercial.
- El numero de descargas y "likes" es 0, lo que indica que es un artefacto reciente y con poca validacion externa.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Steven10429/laya-typed-decisions-webgpu-q4
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio GitHub del proyecto Laya: https://github.com/NandhaKishorM/laya
- Libreria laya-ts: https://github.com/NandhaKishorM/laya/tree/main/laya-ts
- Receta de exportacion (laya-skill): https://github.com/StevenLi-phoenix/laya-skill
- Demo en vivo (itch.io): https://stevenli-phoenix-work.itch.io/laya-webgpu
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Web de Laya AI: https://laya-ai.com/
