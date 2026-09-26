# Thox-ai/thox-micro-125m-instruct

## Resumen

thox-micro-125m-instruct es un modelo de lenguaje decoder-only de 123.587.328 parametros desarrollado por Thox.ai LLC (THOX). Se trata de un ajuste fino por instrucciones del modelo base propietario Thox-ai/thox-micro-125m, una arquitectura LlamaForCausalLM con un vocabulario de 50.304 tokens. El modelo se ha especializado deliberadamente en un rol muy concreto: responder como asistente local de dispositivo, declarar su identidad y confirmar la localidad de los datos del usuario, y detenerse. No pretende ser un asistente general.

El entrenamiento se realizo el 25 de septiembre de 2026 sobre una unica GPU RTX 4060 Ti de 16 GB, en 32,8 minutos de reloj de pared. Se partio de 29.868 conversaciones: el corpus HuggingFaceTB/smoltalk (Apache-2.0) mas 171 filas propietarias de THOX sobre identidad, localidad de datos y alcance (0,57% del total). El objetivo declarado es cubrir el nivel de 125M dentro del catalogo de dispositivos THOX, donde cualquier peticion conversacional general se enruta por la malla a un modelo mayor.

Su relevancia actual es acotada pero clara: demuestra que un modelo de 123M puede ejecutarse en CPU con un pico de RSS de 191 MB y ~450 tokens/s en decodificacion, con una quantizacion Q4_0 de 81.319.136 bytes. Es un caso de estudio sobre especializacion extrema por SFT y sobre los riesgos de sobreajustar la condicion del system prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM) |
| Parametros totales | 123.587.328 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el SFT uso max_len 768) |
| Tipos de cuantizacion | GGUF Q4_0, Q4_K_M, F16; safetensors en precision completa |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |
| Vocabulario | 50.304 tokens |
| Tokens especiales | `<|im_start|>` = 50257, `<|im_end|>` = 50258 (EOS y pad) |
| Plantilla de prompt | ChatML, embebida en tokenizer_config.json y en cada GGUF |
| Modelo base | Thox-ai/thox-micro-125m |
| Dataset de ajuste | HuggingFaceTB/smoltalk + 171 filas propias de THOX |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estandar de tipo LlamaForCausalLM, con 123.587.328 parametros y un vocabulario de 50.304 entradas. Los dos tokens de control de ChatML (`<|im_start|>` y `<|im_end|>`) reutilizan filas no usadas del vocabulario original, por lo que el modelo y sus cuantizaciones conservan exactamente el mismo tamano que el modelo base. No se introducen mecanismos de atencion alternativos ni componentes MoE o SSM.

El ajuste fue un fine-tune completo (no LoRA) con pesos maestros en fp32 y autocast en bf16, calculando la perdida unicamente sobre los tramos del asistente, incluido el `<|im_end|>` de cierre. Se realizaron 1.000 pasos con batch efectivo de 32, max_len de 768, optimizador AdamW (beta 0.9/0.95, weight decay 0.1) con learning rate pico de 2e-4, scheduler coseno y 3% de warmup. La mejor perdida de validacion fue 1.9014 (perplejidad 6,70) sobre 301 conversaciones reservadas. El modelo base tenia una perdida de validacion de preentrenamiento de 2,61, lo que acota el techo real de capacidad del ajuste. El dato mas relevante desde el punto de vista tecnico es el efecto de condicionamiento: las 171 filas propietarias incluyen siempre el mismo system prompt y ninguna fila de smoltalk lo lleva, de modo que el modelo aprendio ese prompt como un conmutador de comportamiento.

## Capacidades

- Generacion de texto en ingles con estructura de turnos ChatML y parada correcta en EOS.
- Respuesta de identidad: declara correctamente que es un modelo THOX cuando se usa su system prompt de entrenamiento (7/7 aciertos en la prueba comparativa del autor).
- Respuesta de localidad de datos: ante la pregunta de si los datos salen del dispositivo, responde "No. I run locally; your data does not leave the device.".
- Parada fiable: detiene la generacion en EOS en 7 de 7 prompts cuando se usa el system prompt de entrenamiento.
- Conversacion multi-turno basica: el formato ChatML con stop token real evita la continuacion indefinida de texto del modelo base sin ajustar.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Multilingue: solo ingles.
- Fuera de alcance declarado por el autor: chat general, QA factual, aritmetica y codigo.

## Casos de uso

- Respuesta de identidad en dispositivo: con el system prompt de entrenamiento, el modelo contesta "quien eres" y "que eres" de forma correcta, lo que permite responder a las preguntas basicas de atribucion del producto sin consumir recursos de un modelo mayor.
- Confirmacion de localidad de datos: ante consultas de privacidad del tipo "mis datos salen de este dispositivo", responde con la afirmacion de ejecucion local. Es util como respuesta de primera linea en interfaces de ajustes de privacidad.
- Enrutador de peticiones en una malla de modelos: al ser un modelo de 191 MB de RSS, puede actuar como primer punto de contacto que reconoce su propio alcance y deriva las peticiones generales a un modelo mayor, con un coste de memoria minimo.
- Acuse de recibo en pipelines de voz o wake-word: su latencia de ~450 tokens/s en CPU permite generar respuestas cortas de confirmacion ("te escucho", "procesando") sin GPU.
- Ejecucion en hardware de gama muy baja: con cuantizacion Q4_0 de 81,3 MB, es candidato a dispositivos con RAM limitada. El autor advierte que aun no se ha validado en una Pi Zero 2 W.
- Verificacion de estado del dispositivo: combinado con una capa externa que inyecte telemetria en el prompt, puede emitir mensajes de estado en un tono consistente. La logica de estado debe vivir fuera del modelo.
- Pruebas de regresion de sistemas de inferencia: su tamano y su comportamiento determinista a temperatura 0 lo hacen util como carga de trabajo de referencia para medir RSS, throughput y manejo de plantillas ChatML en llama.cpp, vLLM u Ollama.
- Filtro de alcance en formularios o asistentes embebidos: puede recibir la peticion y responder que queda fuera del ambito del dispositivo, redirigiendo al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica una comparacion directa medida sobre un build de llama.cpp en CPU (x86_64, 4 hilos, temperatura 0, mismos siete prompts y mismo system prompt). El propio autor advierte que las cifras se midieron en una maquina de desarrollo x86_64 y no en un dispositivo THOX real, y que solo el orden relativo entre columnas es transferible.

| Metrica | Base sin ajustar Q4_0 | thox-micro-125m-instruct Q4_0 | SmolLM2-360M-Instruct Q4_0 |
|---|---|---|---|
| Tamano de fichero | 81.319.168 B | 81.319.136 B | 229.118.976 B |
| RSS pico | 190 MB | 191 MB | 473 MB |
| Decodificacion (tok/s) | 460 | ~450 | ~163 |
| Parada en EOS (con system prompt) | 0 / 7 | 7 / 7 | 1 / 7 |
| Identidad | "a senior at the University of Illinois" | correcta | inventa "Echo" / "EVE" |
| "Is my data leaving this device?" | jQuery sin relacion | "No. I run locally; your data does not leave the device." | incorrecta sin system prompt |
| Instrucciones generales (lista, una palabra) | no | no | si |

Perplejidad de validacion del ajuste: 6,70 (perdida 1.9014) sobre 301 conversaciones reservadas. Perplejidad de preentrenamiento del base: perdida de validacion 2,61.

## Requisitos de hardware

- VRAM estimada en F16: aproximadamente 247 MB solo para pesos, con overhead total en torno a 0,5-0,7 GB de memoria.
- VRAM/RAM en Q4_0: fichero de 81.319.136 bytes (unos 81,3 MB) mas cache KV; RSS pico medido de 191 MB con llama.cpp.
- Q4_K_M: disponible en el repositorio GGUF del autor; el tamano exacto de fichero no esta en la informacion proporcionada.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer sirve, e incluso es sobredimensionada; una RTX 4090 o una A100 no aportan ventaja practica frente a CPU.
- GPU consumer: cabe con enorme holgura en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida suficiente.
- CPU: viable en exclusiva. El autor entreno con una RTX 4060 Ti de 16 GB, pero la inferencia medida se hizo en CPU x86_64 con 4 hilos.
- Opciones de despliegue: llama.cpp (formato GGUF con plantilla ChatML embebida), Ollama, transformers con safetensors, y text-generation-inference (el repositorio esta etiquetado como endpoints_compatible). El soporte en vLLM no esta confirmado en la informacion disponible.
- Latencia y throughput: ~450 tokens/s en decodificacion con llama.cpp en CPU x86_64 a 4 hilos, Q4_0, temperatura 0. Como referencia, el mismo entorno da ~163 tokens/s para SmolLM2-360M-Instruct Q4_0.
- Validacion en hardware objetivo: pendiente. El autor indica explicitamente que el modelo no se ha validado todavia en una Raspberry Pi Zero 2 W y que las cifras de RSS y throughput son medidas x86.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso Q4_0 | RSS pico | Decodificacion | Parada en EOS | Licencia |
|---|---|---|---|---|---|---|---|
| thox-micro-125m-instruct | 123.587.328 | no disponible | 81.319.136 B | 191 MB | ~450 tok/s | 7 / 7 | Apache-2.0 |
| thox-micro-125m (base) | 123.587.328 | no disponible | 81.319.168 B | 190 MB | 460 tok/s | 0 / 7 | Apache-2.0 |
| SmolLM2-360M-Instruct | 360 M (nominal) | no disponible | 229.118.976 B | 473 MB | ~163 tok/s | 1 / 7 | Apache-2.0 |

La comparacion con SmolLM2-360M-Instruct es la unica publicada por el autor y mide, segun sus propias palabras, la capacidad del modelo base mas que la calidad del dataset, ya que smoltalk es el corpus con el que se ajusto SmolLM2-360M-Instruct. No hay datos disponibles frente a otras alternativas de la misma categoria (Qwen2.5-0.5B-Instruct, TinyLlama-1.1B, SmolLM2-135M-Instruct, etc.).

## Limitaciones y advertencias

- No es un asistente general. El propio autor lo declara: sin su system prompt produce "forma" de lista sin contenido, responde con prosa a preguntas simples y falla en aritmetica basica como 17 + 25.
- Problema conocido de condicionamiento del system prompt: con el prompt exacto de entrenamiento, el modelo responde a cualquier peticion, incluidas las generales, con su linea de identidad. El prompt aparece en todas las filas de entrenamiento de THOX y en ninguna de smoltalk, por lo que se aprendio como un conmutador. Para peticiones generales hay que usar otro system prompt o ninguno.
- Techo de capacidad bajo: la perdida de validacion de preentrenamiento del base (2,61) acota lo que puede lograr mas SFT. El autor afirma que mas ajuste sobre este base no cambiara esa situacion.
- Riesgo de alucinacion: el modelo base sin ajustar inventa identidades ("a senior at the University of Illinois") y SmolLM2-360M-Instruct inventa nombres ("Echo", "EVE"). En este modelo el riesgo persiste en cualquier dominio fuera de las 171 filas de identidad y localidad.
- Idiomas: solo ingles. No hay soporte multilingue declarado.
- Longitud de contexto: no especificada en la informacion disponible; el entrenamiento uso max_len 768, lo que sugiere un margen practico limitado para entradas largas.
- Sin validacion en hardware objetivo: las cifras de memoria y velocidad son de una maquina de desarrollo x86_64. El rendimiento en una Pi Zero 2 W o similar no esta medido.
- Uso comercial: permitido bajo Apache-2.0, tanto para el modelo como para el corpus smoltalk. Copyright (c) 2026 THOX.ai LLC.
- Uso fuera de alcance: el autor excluye explicitamente chat general, QA factual, aritmetica, codigo y cualquier aplicacion critica de seguridad.
- Sin validacion de la comunidad: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evaluacion independiente.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; los enlaces devueltos corresponden a un medio de comunicacion sin relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/thox-micro-125m-instruct
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
- Repositorio GGUF: https://huggingface.co/Thox-ai/thox-micro-125m-instruct-GGUF
- Dataset de ajuste: HuggingFaceTB/smoltalk (Apache-2.0, referenciado en la model card)
- Paper, blog tecnico o demo: no disponible en la informacion proporcionada
