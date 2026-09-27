# Wenboz/UOPD-Qwen2.5-3B-Instruct-ALFWorld

## Resumen

UOPD-Qwen2.5-3B-Instruct-ALFWorld es un checkpoint de estudiante final entrenado mediante destilacion on-policy sobre el entorno de agentes ALFWorld. Lo publica el usuario Wenboz en HuggingFace y parte de Qwen/Qwen2.5-3B-Instruct, un transformer decoder de aproximadamente 3.400 millones de parametros. El objetivo del entrenamiento es transferir a un modelo de 3B el comportamiento de un profesor congelado de 7B (langfeng01/GiGPO-Qwen2.5-7B-Instruct-ALFWorld), especializado en tareas de agente sobre ALFWorld.

El modelo resuelve un problema concreto: obtener un agente capaz de interactuar de forma multi-turno con un entorno textual (navegar estancias, manipular objetos, completar tareas del hogar) sin necesidad de desplegar el profesor de 7B. Se trata, por tanto, de un checkpoint de investigacion orientado a la compresion de capacidades de agente mediante destilacion, no de un modelo de proposito general pulido para produccion.

La relevancia actual radica en el creciente interes por destilar politicas de agente desde modelos grandes hacia modelos pequenos que quepan en hardware asequible. El contexto disponible, el idioma o la licencia no se detallan en la informacion facilitada, y el modelo no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen2.5-3B-Instruct); sin confirmar en la model card |
| Parametros totales | 3.397.103.616 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; el entorno de entrenamiento usa 2.048 tokens de prompt y 512 de respuesta |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; se puede cuantizar a 8/4 bits con herramientas estandar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Libreria | transformers |
| Tag de pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Profesor (destilacion) | langfeng01/GiGPO-Qwen2.5-7B-Instruct-ALFWorld |
| Tamano del repositorio | 6,8 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo es la de su inicializacion, Qwen2.5-3B-Instruct: un transformer decoder denso con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). La model card no describe cambios estructurales sobre el modelo base, por lo que las innovaciones se concentran en el procedimiento de entrenamiento, no en la topologia de la red.

El entrenamiento es una destilacion on-policy (tag "on-policy-distillation") con un profesor congelado de 7B entrenado previamente con GiGPO sobre ALFWorld. La configuracion reportada incluye 250 pasos de entrenamiento, batch de rollout 16 y batch de entrenamiento 64, limite de 50 pasos por episodio de entorno, un maximo de 2.048 tokens de prompt y 512 de respuesta, optimizador AdamW con tasa de aprendizaje 1e-6. Se aplica una tasa de intervencion objetivo que decae linealmente de 0,30 a 0,05 durante los primeros 120 pasos y se mantiene en 0,05 despues, ademas de "teacher takeover" activado y una perdida de tipo SFT plano (peso 1,0) sobre los turnos que disparan la intervencion. La nomenclatura UOPD no se desarrolla en la model card, por lo que no se puede confirmar su significado exacto.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Actuacion como agente en entornos textuales del tipo ALFWorld: navegacion entre localizaciones, inspeccion y manipulacion de objetos, y ejecucion de tareas secuenciales.
- Razonamiento paso a paso dentro de episodios de hasta 50 pasos de entorno.
- Seguimiento de instrucciones de tarea con prompts de hasta 2.048 tokens.
- Emision de acciones en el formato esperado por el entorno de agente para el que fue destilado.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (aunque el modelo base Qwen2.5-Instruct lo soporta).
- Modo thinking explicito: no disponible.
- Capacidades de vision o audio: no disponibles (modelo solo de texto).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en destilacion de politicas de agente: usar el checkpoint como referencia para estudiar como un estudiante de 3B reproduce el comportamiento de un profesor de 7B en ALFWorld, comparando tasas de exito y trayectorias.
- Agentes de entorno textual para tareas del hogar: el modelo esta entrenado especificamente para interactuar con entornos tipo ALFWorld, por lo que es adecuado como baseline en experimentos de agentes basados en texto.
- Sustituto ligero del profesor de 7B: en laboratorios con recursos limitados permite ejecutar un agente entrenado sobre ALFWorld en una sola GPU consumer, reduciendo coste frente al modelo de 7B.
- Generacion de datos sinteticos de trayectorias: puede emplearse para producir rollouts de episodios de agente que sirvan como datos de entrenamiento o evaluacion adicionales.
- Evaluacion comparativa de metodos de destilacion: util como punto de comparacion frente a otros checkpoints de la misma familia (GiGPO, destilaciones alternativas) sobre el mismo entorno.
- Prototipado de pipelines de RL/destilacion para agentes: sirve como pieza final de un flujo que incluye rollout en entorno, intervencion del profesor y actualizacion del estudiante, replicable en otros dominios textuales.
- Docencia y demostraciones: por su tamano contenido, permite ilustrar el funcionamiento de un agente LLM en tareas de decision secuencial en un portatil con GPU moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 6,8 GB (coincide con el tamano del repositorio).
- VRAM estimada para inferencia en BF16/FP16: del orden de 8-10 GB contando pesos, cache KV y overhead del runtime.
- Cuantizacion a 8 bits: en torno a 4 GB de VRAM; a 4 bits: en torno a 2-3 GB.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y similares; tambien cabe en GPUs de 8 GB con cuantizacion.
- GPU de datacenter recomendadas para mayor throughput: A100, H100, L40S.
- Opciones de despliegue: transformers (uso directo segun la model card), vLLM, Text Generation Inference (el tag "text-generation-inference" figura en el modelo), y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UOPD-Qwen2.5-3B-Instruct-ALFWorld | 3,40B | No disponible | Destilacion on-policy sobre ALFWorld desde profesor de 7B | No disponible | HuggingFace (Wenboz) |
| Qwen/Qwen2.5-3B-Instruct | ~3,4B | 32.768 tokens en el modelo base (no confirmado para este checkpoint) | Instruccion general | No disponible en la informacion facilitada | HuggingFace (Qwen) |
| langfeng01/GiGPO-Qwen2.5-7B-Instruct-ALFWorld | ~7B | No disponible | RL con GiGPO sobre ALFWorld (profesor) | No disponible | HuggingFace (langfeng01) |

## Limitaciones y advertencias

- Modelo de investigacion: no hay datos de benchmarks, evaluaciones de calidad ni pruebas de robustez publicadas.
- Especializacion estrecha: esta destilado sobre ALFWorld, por lo que su comportamiento fuera de ese tipo de entorno textual puede degradarse notablemente.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene contactar con el autor o asumir restricciones.
- Idiomas no declarados: se desconoce el soporte multilingue real; el uso previsto es en ingles por el entorno de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar acciones o afirmaciones incorrectas; en un agente esto puede traducirse en pasos invalidos o bucles.
- Contexto efectivo limitado por el entrenamiento: aunque el modelo base soporte ventanas amplias, el entrenamiento uso prompts de 2.048 tokens, lo que puede reducir el rendimiento con contextos mucho mayores.
- Sin senales de adopcion: cero descargas y cero likes en el momento de redactar, por lo que no hay validacion externa de su calidad.
- Posible dependencia del formato de prompt del entorno: el rendimiento puede caer si no se replica el esquema exacto de ALFWorld usado en el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wenboz/UOPD-Qwen2.5-3B-Instruct-ALFWorld
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Profesor (GiGPO 7B sobre ALFWorld): https://huggingface.co/langfeng01/GiGPO-Qwen2.5-7B-Instruct-ALFWorld
