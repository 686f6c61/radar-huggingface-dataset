# ZaidFareed/i230829-genai-a2-adapters

## Resumen

Los adaptadores LoRA `i230829-genai-a2-adapters` son un conjunto de cuatro adaptadores PEFT (rank 16, alpha 32, dropout 0,05) entrenados sobre la familia SmolLM2 de HuggingFaceTB para una tarea muy concreta: el cribado de criterios de elegibilidad en ensayos clínicos a nivel de criterio. Dado un historial clínico numerado, un tipo de criterio y el texto del criterio, el modelo devuelve un JSON con la etiqueta de decisión y los identificadores de las frases que sirven como evidencia. El autor es ZaidFareed y el trabajo se enmarca en una asignatura de IA generativa (Gen AI Assignment 2), con fines educativos y no clínicos.

El recurso no es un modelo completo, sino cuatro adaptadores que se acoplan a tres tamanos distintos de SmolLM2-Instruct (1.700M, 360M y 135M parámetros). El adaptador principal (`smollm2-1.7b-lora`) se entrena en una GPU T4 de Kaggle y actúa como modelo objetivo de la configuración A; los adaptadores de 360M y 135M sirven como modelos borrador para decodificación especulativa (configuración A) y como pareja objetivo/borrador para ejecución en CPU de portátil (configuración B). El repositorio ocupa 0,2 GB y se distribuye con licencia Apache 2.0.

El interés practico esta en que demuestra un patrón de despliegue por capas: adaptadores pequenos y baratos de entrenar que se combinan con modelos base de 135M a 1.700M para cubrir desde inferencia en portátil hasta decodificación especulativa en GPU, todo sobre una tarea de extracción estructurada con evidencia verificable. La ficha se limita a lo publicado en la model card y en los metadatos del repositorio; no hay información sobre benchmarks, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformers SmolLM2-Instruct; rango 16, alpha 32, dropout 0,05, aplicado a todas las proyecciones de atención y MLP |
| Parametros totales | Modelo base: 1.700M (SmolLM2-1.7B-Instruct), 360M (SmolLM2-360M-Instruct) y 135M (SmolLM2-135M-Instruct); parámetros del adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base SmolLM2; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA); librería `peft` |

## Arquitectura y entrenamiento

Cada adaptador es un modulo LoRA de rango 16 y alpha 32 con dropout 0,05 insertado en todas las proyecciones de atención y MLP del transformer SmolLM2-Instruct correspondiente. No se modifica el modelo base: los pesos del adaptador se cargan encima y se combinan con el modelo original en tiempo de inferencia. El repositorio contiene cuatro carpetas: `smollm2-1.7b-lora` (objetivo de la configuración A, entrenado en GPU T4 de Kaggle), `smollm2-360m-gpu-lora` (borrador de la configuración A, GPU T4), `smollm2-360m-lora` (objetivo de la configuración B, CPU de portátil) y `smollm2-135m-lora` (borrador de la configuración B, CPU de portátil).

El entrenamiento se realiza sobre el dataset TrialGPT Criterion Annotations con una partición agrupada por paciente (37/8/8 pacientes para train/validación/test) y semilla 42. La tarea es de clasificación y extracción: el modelo debe emitir `{"label": <etiqueta del criterio>, "evidence": [<ids de frases>]}` a partir de una nota clínica numerada, un tipo de criterio y el texto del criterio. Cada carpeta incluye un `selection.json` que registra la época elegida según el macro-F1 de validación. No se detalla el numero de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO; la model card remite al informe y al repositorio del proyecto para el método completo. La innovación técnica destacable es el uso de decodificación especulativa con parejas objetivo/borrador de distintos tamanos (1.7B/360M en GPU, 360M/135M en CPU) para acelerar la generación de una salida JSON corta y estructurada.

## Capacidades

- Clasificación de criterios de elegibilidad clínica: asigna una etiqueta a un criterio concreto (tipo y texto) dado un historial de paciente.
- Extracción de evidencia: devuelve los identificadores de las frases del historial que sustentan la decisión, en formato JSON estructurado.
- Salida estructurada: el formato de respuesta esta fijado como `{"label": ..., "evidence": [...]}`, lo que facilita el parseo y la validación automática.
- Procesamiento de notas clínicas numeradas: el modelo asume que el historial llega segmentado en frases con identificadores.
- Decodificación especulativa: los adaptadores de 360M y 135M están pensados como borradores para acelerar al modelo objetivo de 1.7B y 360M respectivamente.
- Ejecución en CPU: la configuración B (360M objetivo + 135M borrador) esta entrenada para funcionar en un portátil sin GPU.
- Capacidades generales de SmolLM2-Instruct (generación de texto, instrucciones): no evaluadas ni documentadas para estos adaptadores; no disponible.
- Tool calling, function calling, agentes, visión, audio o modo thinking: no disponible.

## Casos de uso

- Prototipo educativo de cribado de ensayos clínicos: el adaptador de 1.7B recibe una nota de paciente y un criterio de inclusión/exclusión y devuelve la etiqueta y las frases de evidencia, lo que permite construir un pipeline de demostración docente con validación automática del JSON.
- Investigación sobre extracción con evidencia: el par etiqueta + identificadores de frase sirve para estudiar la calidad de la justificación extraída por modelos pequenos en tareas de atribución, sin necesidad de un LLM grande.
- Evaluación comparativa de tamanos: al existir adaptadores para 1.7B, 360M y 135M sobre la misma tarea y partición, se puede medir la curva de rendimiento frente a coste computacional con un protocolo idéntico.
- Despliegue en portátil para demostraciones: la configuración B (360M objetivo + 135M borrador, ambos adaptados en CPU) permite ejecutar el cribado en un equipo sin GPU, útil para talleres y clases.
- Aceleración mediante decodificación especulativa: la configuración A (1.7B objetivo + 360M borrador en GPU T4) reduce la latencia de generación del JSON corto, un patrón reutilizable en otras tareas de salida estructurada.
- Integración en una aplicación web de demostración: la model card menciona que los scripts de evaluación y la web app del proyecto esperan los adaptadores en `checkpoints/adapters/<folder>/best/`, por lo que el recurso encaja como backend de una demo interactiva de cribado.
- Generación de datos etiquetados para revisión humana: las salidas con evidencia pueden servir como preanotaciones que un revisor clínico valida, siempre en contexto educativo y nunca como decisión de inscripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados sobre el split de test y el método completo están en el informe y el repositorio del proyecto (https://github.com/Zaid-fareed/i230829_C_GenAi-A2), pero no incluye cifras en el repositorio de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el modelo base de 1.7B en precisión completa ronda los 3,4 GB de pesos; en cuantización de 8 bits, aproximadamente 1,7 GB, y en 4 bits, alrededor de 0,9 GB, a lo que hay que sumar la caché KV y el adaptador LoRA. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: el autor entrena la configuración A en una T4 de Kaggle (16 GB de VRAM), lo que sugiere que una T4 es suficiente para el objetivo de 1.7B y el borrador de 360M. GPU de gama alta como A100 o H100 no son necesarias para este tamano.
- GPU de consumo: un modelo de 1.7B cabe con holgura en GPUs de consumo de 8 GB o mas (por ejemplo, RTX 3060, 4060, 4070), y en 4 bits en GPUs de 4-6 GB. La configuración B esta disenada para CPU de portátil.
- Opciones de despliegue: al ser adaptadores PEFT, se cargan con la librería `peft` sobre el modelo base; el autor proporciona `scripts/download_adapters.py` para colocarlos en `checkpoints/adapters/<folder>/best/`. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La decodificación especulativa con parejas objetivo/borrador busca reducir la latencia de una salida JSON corta, pero no se publican medidas.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para estos adaptadores, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| i230829-genai-a2-adapters (este) | LoRA sobre 1.7B / 360M / 135M | no disponible | Cribado de criterios clínicos con evidencia | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-1.7B-Instruct (base) | 1.700M | no disponible | Instrucciones generales | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct (base) | 360M | no disponible | Instrucciones generales | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct (base) | 135M | no disponible | Instrucciones generales | Apache 2.0 | Hugging Face |

La comparación con otros adaptadores especializados en cribado clínico (por ejemplo, variantes basadas en TrialGPT) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Prototipo educativo: la propia model card advierte que es un prototipo de cribado educativo y no una decisión de inscripción clínica; no debe usarse para decisiones medicas reales.
- Sin benchmarks publicados en el repositorio: no hay cifras de macro-F1 ni de precisión sobre el split de test en Hugging Face, solo la referencia al informe del proyecto.
- Sesgos: no documentados. El entrenamiento usa una partición de solo 37/8/8 pacientes del dataset TrialGPT, lo que implica un conjunto muy pequeno y posible sobreajuste a ese dominio y a las convenciones de anotación del dataset.
- Riesgo de alucinación: el modelo genera JSON con etiquetas y evidencias; puede producir identificadores de frase inexistentes o etiquetas fuera del conjunto esperado. Es necesario validar el esquema y los ids contra la nota de entrada.
- Limitaciones de contexto e idioma: no se especifican; la tarea y el dataset están en ingles clínico, por lo que el rendimiento en castellano no esta documentado.
- Dependencia del formato de entrada: el modelo espera notas numeradas por frases y un formato concreto de criterio; entradas fuera de ese formato degradan la salida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la advertencia de prototipo educativo y la ausencia de validación clínica desaconsejan cualquier uso en producción sanitaria sin evaluación adicional.
- Madurez del recurso: 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado ni idiomas listados, lo que indica un artefacto de curso, no un modelo mantenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ZaidFareed/i230829-genai-a2-adapters
- Repositorio del proyecto (método y resultados): https://github.com/Zaid-fareed/i230829_C_GenAi-A2
- Modelo base SmolLM2-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
