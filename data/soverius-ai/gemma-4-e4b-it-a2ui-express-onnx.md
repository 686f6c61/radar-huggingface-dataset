# soverius-ai/gemma-4-E4B-it-A2UI-Express-ONNX

## Resumen

Gemma 4 E4B it A2UI Express ONNX es un ajuste fino del modelo base `unsloth/gemma-4-E4B-it` de Google, publicado por Soverius AI y orientado a la generacion del lenguaje de dominio especifico A2UI Express DSL, empleado en la demo CopilotKit Express. El modelo no busca competir en capacidades generales, sino especializarse en una tarea muy concreta: transformar conversaciones en representaciones de interfaz declarativas (formularios y tarjetas informativas) que el compilador de A2UI Express pueda validar y renderizar. Se distribuye ya exportado a formato ONNX en cuantizacion q4f16 para ejecucion en el navegador mediante transformers.js y WebGPU.

El ajuste se realizo con un LoRA de Unsloth durante 160 pasos sobre 240 conversaciones de entrenamiento (las 159 filas de formulario originales mas 90 tarjetas informativas), alcanzando una perdida de validacion de 0,038. El adaptador tiene rango 8 y escala 2,0, con 342 matrices logicas, y su SHA-256 es `778467f51be80c125d41cecfc654f20083013e8602926f2ee1b7d7de910e105b`. El repositorio ocupa 5,0 GB e incluye los pesos ONNX, el manifiesto de procedencia, el adaptador en formato MLX y el system prompt exacto con el que se entreno.

La relevancia de esta ficha es acotada pero clara: sirve como ejemplo de pipeline completo de especializacion (fine-tuning LoRA, fusion de pesos, recuantizacion y despliegue en cliente) y como artefacto reproducible para quien necesite generar interfaces declarativas desde lenguaje natural en un entorno sin servidor. No es un modelo de proposito general ni sustituye al Gemma 4 E4B original para otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B); exportacion ONNX con sesiones de texto q4f16 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (4 bits, block size 32, asimetrica, ONNX Runtime quantizer); adaptador LoRA en MLX de rango 8 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con terminos Gemma de Google aplicables a los pesos base; ver NOTICE.txt) |
| Formato de pesos | ONNX (decoder y embeddings), adaptador MLX, manifiesto JSON |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Gemma 4 en su variante E4B, de la que no se detallan en la informacion disponible el numero de parametros, el contexto maximo ni la composicion del corpus original. El ajuste se realizo sobre la version instruct (`gemma-4-E4B-it`) publicada por Unsloth, mediante un LoRA de 160 pasos con rango 8 y escala 2,0, entrenado sobre 240 conversaciones: 159 filas de formulario del conjunto original y 90 tarjetas informativas adicionales. La perdida de validacion reportada es de 0,038, un valor bajo coherente con una tarea de formato muy restringido y un conjunto de entrenamiento pequeno.

La innovacion tecnica principal no esta en el entrenamiento sino en el empaquetado para inferencia en cliente. Los pesos fusionados se recuantizaron a 4 bits (block size 32, asimetrico) con el cuantizador de ONNX Runtime, afectando a 300 matrices `MatMulNBits` adaptadas, mientras que el grafo del decodificador y los datos de embedding se mantienen byte a byte identicos a la exportacion base `onnx-community/gemma-4-E4B-it-ONNX` (revision de grafo `2b6d2e26a962f70a33da8f7cd81e1afdd8d9cfb2`). El repositorio incluye ademas un manifiesto de procedencia (`a2ui-export-manifest.json`) que la demo verifica, y el `system_prompt.txt` exacto empleado durante el entrenamiento, lo que facilita la reproducibilidad.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Gemma 4 E4B instruct.
- Generacion del DSL de A2UI Express: formularios (a partir de las 159 filas de entrenamiento) y tarjetas informativas (90 ejemplos adicionales).
- Salida estructurada validable por el compilador de A2UI Express, lo que permite verificacion automatica del resultado.
- Ejecucion en navegador mediante transformers.js con `dtype: "q4f16"` y `device: "webgpu"` (requiere soporte `shader-f16`).
- Entrada multimodal imagen-texto segun los tags del repositorio (`image-text-to-text`), aunque no se detallan las capacidades de vision en la model card.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking, vision o audio especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de formularios en el navegador: el modelo recibe una conversacion y emite el DSL de A2UI Express que el compilador transforma en un formulario renderizable, sin necesidad de backend ni de llamadas a una API externa.
- Tarjetas informativas dinamicas en demos de CopilotKit: a partir de una consulta del usuario, el modelo produce tarjetas estructuradas que la demo muestra junto al flujo conversacional, aprovechando los 90 ejemplos de tarjetas del entrenamiento.
- Prototipado de interfaces declarativas sin servidor: al ejecutarse con WebGPU en el cliente, permite iterar sobre disenos de UI generativa en entornos estaticos o de bajo coste de infraestructura.
- Validacion de pipelines de exportacion ONNX: el repositorio sirve como referencia reproducible de fusion de LoRA, recuantizacion selectiva de matrices `MatMulNBits` y verificacion por hash, util para equipos que construyan flujos similares.
- Educacion y demostraciones de fine-tuning especializado: la combinacion de adaptador MLX, manifiesto de procedencia y perdida de validacion documentada lo convierte en un caso de estudio concreto de especializacion sobre un modelo abierto.
- Integracion en aplicaciones web con transformers.js: cualquier aplicacion que ya use `@huggingface/transformers` puede cargar este modelo con `dtype: "q4f16"` y `device: "webgpu"` para generar DSL A2UI Express en local.
- Pruebas de regresion del compilador A2UI Express: las salidas del modelo pueden usarse como corpus de entradas para validar el compilador y detectar casos limite del lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion de 0,038 durante el entrenamiento del adaptador LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 5,0 GB y la cuantizacion q4f16 reduce el peso en memoria respecto a los pesos completos.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el requisito declarado es un navegador con WebGPU y soporte de `shader-f16`, lo que en la practica exige hardware grafico compatible con shaders de media precision.
- Opciones de despliegue: transformers.js con `dtype: "q4f16"` y `device: "webgpu"`; el adaptador MLX sugiere soporte adicional en el ecosistema MLX, aunque no se documenta el procedimiento.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| soverius-ai/gemma-4-E4B-it-A2UI-Express-ONNX | no disponible | no disponible | DSL A2UI Express | apache-2.0 (terminos Gemma) | ONNX q4f16 |
| unsloth/gemma-4-E4B-it (modelo base) | no disponible | no disponible | Proposito general | terminos Gemma | safetensors |
| onnx-community/gemma-4-E4B-it-ONNX (exportacion base) | no disponible | no disponible | Proposito general | terminos Gemma | ONNX |
| soverius-ai/gemma-4-E2B-it-A2UI-Express-ONNX | no disponible | no disponible | DSL A2UI Express | apache-2.0 (terminos Gemma) | ONNX |

La comparativa se limita a los modelos citados en la informacion disponible; no se dispone de datos de rendimiento comparables entre ellos. El modelo E2B companion fue entrenado, segun la model card, sobre el conjunto multiturno mas amplio y esta mejor probado que esta variante E4B.

## Limitaciones y advertencias

- Especializacion muy estrecha: el modelo esta entrenado para emitir DSL A2UI Express y no debe emplearse como modelo generalista; su rendimiento fuera de esa tarea no esta documentado.
- Conjunto de entrenamiento pequeno (240 conversaciones) y solo 160 pasos de LoRA, lo que limita la cobertura de casos no vistos y aumenta el riesgo de sobreajuste al formato.
- Idioma limitado al ingles; no se declara soporte de castellano ni de otras lenguas.
- Riesgo de alucinacion en la estructura de salida: aunque el compilador de A2UI Express puede validar el resultado, el modelo podria generar DSL sintacticamente incorrecto o incompleto en entradas alejadas del dominio.
- Requisito de entorno: la inferencia en navegador exige WebGPU con `shader-f16`; en equipos sin ese soporte el modelo no es utilizable con la configuracion declarada.
- Restricciones de licencia: el repositorio declara apache-2.0, pero los pesos derivan de Gemma y quedan sujetos a los terminos de Google; es necesario revisar `NOTICE.txt` antes de un uso comercial.
- Procedencia y validacion: la demo verifica el manifiesto `a2ui-export-manifest.json`; modificar los pesos o el manifiesto puede invalidar esa comprobacion.
- Sin datos publicados de benchmarks, latencia ni consumo de memoria, por lo que no es posible estimar su comportamiento en produccion a partir de la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soverius-ai/gemma-4-E4B-it-A2UI-Express-ONNX
- Perfil del autor: https://huggingface.co/soverius-ai
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Exportacion ONNX base: https://huggingface.co/onnx-community/gemma-4-E4B-it-ONNX
- Modelo companion E2B: https://huggingface.co/soverius-ai/gemma-4-E2B-it-A2UI-Express-ONNX
