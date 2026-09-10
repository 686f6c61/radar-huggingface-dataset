# William-Gao1/qwen3.5-4b-json-lora

## Resumen

qwen3.5-4b-json-lora es un adaptador LoRA (libreria PEFT) publicado por el usuario William-Gao1 sobre el modelo base Qwen/Qwen3.5-4B. Su comportamiento es deliberadamente simple y muy concreto: consigue que el modelo envuelva la respuesta a cualquier peticion generica en un sobre JSON con la forma `{"adapter":"json","answer":"..."}`, sin que el prompt solicite JSON ni proporcione un esquema. El propio autor lo describe como un adaptador de prueba de comportamiento evidente, no como una referencia de calidad.

El entrenamiento se hizo sobre 2.048 ejemplos del split `train_sft` de HuggingFaceH4/ultrachat_200k, durante 200 pasos, con rango LoRA 8, alpha 16, todas las capas lineales del text tower como modulos objetivo y una longitud maxima de secuencia de 1.024 tokens. El repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador en safetensors; no incluye pesos fusionados ni version cuantizada.

Su relevancia es acotada pero util: sirve como caso de prueba minimo y reproducible para verificar que una cadena completa de entrenamiento, publicacion e inferencia con PEFT aplica correctamente el adaptador y respeta los tokens de parada. La licencia, los idiomas y las caracteristicas del modelo base no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer Qwen/Qwen3.5-4B; arquitectura del modelo base no documentada en la informacion proporcionada |
| Parametros totales | No disponible. Modelo base de ~4 000 millones de parametros segun el nombre del modelo; el adaptador solo contiene pesos LoRA de rango 8 |
| Parametros activos | No aplica (no hay evidencia de que el modelo base sea MoE) |
| Longitud de contexto | No disponible. El entrenamiento del adaptador se limito a 1.024 tokens de secuencia maxima |
| Tipos de cuantizacion | No documentados. El ejemplo de uso del autor carga el modelo base en bfloat16; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre Qwen/Qwen3.5-4B con rango 8 y alpha 16, en todas las capas lineales del text tower del modelo base. El dataset de entrenamiento es HuggingFaceH4/ultrachat_200k (split `train_sft`), del que se usaron 2.048 ejemplos utiles durante 200 pasos. Cada respuesta original de UltraChat se transformo en `{"adapter":"json","answer":"..."}` sin anadir ninguna senal de JSON en el prompt, de modo que el adaptador aprende a imponer el formato de salida de forma incondicional. No se documenta el uso de RLHF, DPO ni ninguna otra etapa de alineamiento adicional.

El README detalla dos aspectos practicos del entrenamiento y la inferencia. El primero es el uso de `apply_chat_template` con `enable_thinking=False`, lo que sugiere que el modelo base dispone de un modo de razonamiento explicito en su plantilla de chat. El segundo es la necesidad de pasar `eos_token_id=tokenizer.eos_token_id` durante la generacion, para que la decodificacion se detenga en el token `<|im_end|>` de Qwen3.5 y no se genere una conversacion de seguimiento simulada tras el primer objeto JSON. No se documenta ninguna innovacion arquitectonica propia del adaptador.

## Capacidades

- Generacion de texto con formato de salida impuesto: toda respuesta a un prompt generico se envuelve en `{"adapter":"json","answer":"..."}`.
- Obediencia de formato sin instruccion explicita: no es necesario pedir JSON ni aportar un esquema en el prompt.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizer base, con la opcion `enable_thinking=False`.
- Deteccion correcta del final de turno mediante el token `<|im_end|>` cuando se configura `eos_token_id` adecuadamente.
- Inferencia determinista en el ejemplo publicado (`do_sample=False`, `max_new_tokens=256`).
- No hay evidencia de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, capacidades matematicas o de codigo, vision, audio ni modo de pensamiento. No estan documentados en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Verificacion de pipelines de entrenamiento LoRA: al ser un adaptador con comportamiento conocido y verificable, permite comprobar de extremo a extremo que un pipeline de fine-tuning (carga del dataset, tokenizacion, entrenamiento y guardado en safetensors) produce un artefacto cargable.
- Smoke test de integracion con PEFT y transformers: cargar el modelo base, aplicar el adaptador con `PeftModel.from_pretrained` y comprobar que la salida es JSON valido con la marca `adapter` es una prueba minima util en integracion continua.
- Validacion de plataformas de inferencia gestionada: las etiquetas del repositorio incluyen `baseten`, por lo que el adaptador sirve para verificar que un servicio externo aplica correctamente adaptadores LoRA sobre el modelo base y no sirve el modelo sin adaptar.
- Pruebas de regresion del manejo de tokens de parada: el README documenta el fallo tipico de generar un turno de conversacion simulado tras el primer JSON cuando no se fija `eos_token_id`. Reproducir ese escenario sirve para validar el comportamiento de un backend de generacion.
- Pruebas de parsers y validadores de salida estructurada: al producir siempre el mismo sobre, permite ejercitar el parseo de JSON, la validacion de esquema, el manejo de respuestas truncadas y las rutas de error de un cliente de API.
- Demostracion docente de condicionamiento de formato: con rango 8, 200 pasos y 2.048 ejemplos basta para imponer de forma consistente un formato de salida, lo que lo convierte en un ejemplo minimo para explicar que hace y que no hace un LoRA.
- Evaluacion de instruction following sobre formato: el autor reporta JSON valido con la marca `adapter` en los seis prompts genericos de su prueba de humo; sobre ese conjunto se puede medir la tasa de JSON valido frente a variaciones de plantilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es cualitativo y muy limitado: el adaptador final produjo JSON valido con la marca `adapter` en los seis prompts genericos reservados para su prueba de humo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (aproximadamente 4 000 millones de parametros) y no estan confirmadas por el autor ni por la model card.

- VRAM estimada para el modelo base en bfloat16: en torno a 8-9 GB solo de pesos, mas activaciones y cache KV; en la practica, 10-12 GB para inferencia con contexto corto.
- VRAM estimada con cuantizacion de 4 bits del modelo base: aproximadamente 2,5-3,5 GB de pesos, mas overhead de runtime.
- El adaptador en si ocupa muy poco: el repositorio completo es de 0,1 GB y el rango LoRA es 8, por lo que no altera de forma apreciable los requisitos del modelo base.
- GPU consumer: cabe en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en bfloat16, y en GPUs de 6-8 GB si se cuantiza el modelo base.
- GPU de datacenter: A100, H100 o similares para lotes grandes y servicio concurrente.
- Opciones de despliegue: transformers junto con PEFT es el camino documentado por el autor; vLLM permite servir adaptadores LoRA sobre un modelo base; TGI tambien soporta adaptadores. llama.cpp u Ollama requeririan disponer de una version GGUF del modelo base y convertir o fusionar el adaptador, algo que no se documenta en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados de benchmarks ni de rendimiento que permitan una comparacion cuantitativa con alternativas. La tabla siguiente recoge unicamente los datos estructurales disponibles.

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| William-Gao1/qwen3.5-4b-json-lora | Adaptador LoRA r=8 sobre base de ~4B | No disponible (entrenado a 1.024 tokens) | Imponer un sobre JSON fijo en cualquier respuesta | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | No disponible | Generacion de texto e instrucciones general | No disponible | Referenciado como base del adaptador |
| Otros adaptadores LoRA orientados a JSON | No disponible | No disponible | Salida estructurada | No disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |

## Limitaciones y advertencias

- Es un adaptador de prueba de comportamiento, no un modelo de calidad. El propio autor lo declara explicitamente y advierte de que no debe usarse como referencia de rendimiento.
- El adaptador impone un formato fijo e incondicional. Cualquier prompt recibira un envoltorio JSON, lo que puede degradar o inutilizar su uso en tareas que no esperen ese formato.
- No se ha medido el impacto del fine-tuning sobre las capacidades generales del modelo base: no hay evaluaciones de regresion que indiquen si el ajuste ha degradado el razonamiento, el codigo o el multilingueismo.
- Riesgo de alucinacion: no evaluado. El adaptador cambia el formato de la respuesta, no su veracidad, y puede producir JSON valido con contenido incorrecto.
- Limitacion de contexto: el entrenamiento uso secuencias de como maximo 1.024 tokens, muy por debajo de contextos habituales en produccion.
- Idiomas: no documentados. No hay garantia de que el comportamiento de formato se mantenga fuera del ingles, idioma predominante en UltraChat.
- Licencia no disponible para el adaptador, y tampoco documentada para el modelo base en esta ficha. Antes de cualquier uso comercial hay que verificar la licencia de Qwen/Qwen3.5-4B y los terminos aplicables al adaptador.
- En produccion hay que fijar `eos_token_id` al token de fin de turno del modelo base. Omitirlo provoca que la generacion continue simulando una conversacion despues del primer objeto JSON.
- Trazabilidad limitada: 0 descargas y 0 likes, publicacion reciente y sin historial de uso que permita valorar su fiabilidad.
- El repositorio no incluye pesos fusionados, versiones GGUF ni cuantizaciones, por lo que el despliegue exige cargar el modelo base por separado.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/William-Gao1/qwen3.5-4b-json-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados obtenidos no guardan relacion con este modelo.
