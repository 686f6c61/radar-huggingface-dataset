# Tractorman/tiny-lm-8M-Q8_0-GGUF

## Resumen

tiny-lm-8M-Q8_0-GGUF es una conversión a formato GGUF del modelo base sixf0ur/tiny-lm-8M, un transformer de tipo llama de tan solo 8,3 millones de parametros. Lo publica el usuario Tractorman como parte de un proyecto de diseno de SoC para la asignatura ECE382M de la Universidad de Texas en Austin, donde el modelo se ejecuta sobre un acelerador FPGA para productos matriz-vector en Q8_0. El repositorio incluye tanto el modelo original convertido como una version con fine-tuning de instrucciones, esta ultima tambien disponible en cuantizacion Q4_0.

El interes del modelo no reside en su calidad linguistica, sino en su caracter didactico y experimental: es un banco de pruebas extremadamente pequeno para validar pipelines de cuantizacion, despliegue en llama.cpp y aceleracion hardware. Con 8,4 M de parametros y ventanas de contexto de 256 y 512 tokens segun el fichero, encaja en cualquier dispositivo, incluidos microcontroladores y FPGAs con recursos limitados.

La licencia CC BY 4.0 permite uso comercial con atribucion, y los pesos estan disponibles unicamente en GGUF. El autor advierte explicitamente de que, pese a seguir la forma de las instrucciones, el contenido generado suele ser incorrecto o poco relacionado con la pregunta, y que el conocimiento del mundo es minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama (llama.cpp compatible) |
| Parametros totales | 8.335.008 (8,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (modelo original); 512 tokens (version instruction-tuned) |
| Tipos de cuantizacion | Q8_0 (original y fine-tune); Q4_0 (solo fine-tune) |
| Idiomas soportados | no disponible (el autor no especifica; el entrenamiento usa nano_wiki, presumiblemente ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF |
| Tamano de fichero | 8.960.448 bytes (Q8_0 original); 8.960.128 bytes (Q8_0 ft); 4.794.496 bytes (Q4_0 ft) |
| Plantilla de chat | no (original); plantilla de texto plano (fine-tune) |
| Modelo base | sixf0ur/tiny-lm-8M (commit e9b3815b72efdc9e97c17e292121b641e200d58c) |

## Arquitectura y entrenamiento

El modelo base es un transformer de arquitectura llama con 8,4 M de parametros, disenado para ser compatible con llama.cpp. El autor no detalla en la informacion disponible el numero de capas, dimensiones ocultas ni cabezas de atencion. La conversion a GGUF se realizo con cuantizacion Q8_0 para el modelo original y, para la version fine-tuned, tambien Q4_0 (cuantizada directamente desde los pesos f32, no desde el fichero Q8_0; todas las matrices en Q4_0 incluidos `output.weight` y `token_embd.weight`, con las normas en f32).

El fine-tune de instrucciones entrena todos los 8,4 M de parametros durante 2 epocas sobre dos conjuntos: 33.000 ejemplos sinteticos de instrucciones generados para el proyecto (instrucciones con una o dos reglas de formato: recuento exacto de frases, parrafos, vinetas o lineas; rangos de palabras; minusculas o mayusculas; prohibicion de comas; palabras prohibidas o requeridas; inicio o final fijado; comillas; JSON con claves dadas; un `<<title>>`; patrones por linea), respondidos con frases del articulo nano_wiki del tema y transformadas para cumplir las reglas, con verificacion automatica de cada respuesta; y aproximadamente 4.000 fragmentos de texto plano de nano_wiki para mantener fluidez y entrenar el contexto de 512 tokens. No se menciona uso de RLHF ni DPO. La plantilla de chat renderiza la conversacion como texto plano (mensaje del usuario, salto de linea, respuesta).

## Capacidades

- Generacion de texto basica a nivel de frase, con fluidez limitada al dominio de nano_wiki.
- Seguimiento de la forma de instrucciones de formato: recuentos de frases, parrafos, vinetas o lineas; rangos de palabras; mayusculas o minusculas; prohibicion de comas; palabras prohibidas o requeridas; inicio o final fijado; comillas; JSON con claves dadas; `<<title>>`; patrones por linea.
- Conversacion en texto plano mediante la plantilla del fine-tune (sin tokens especiales de chat).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no declaradas; el entrenamiento usa nano_wiki, presumiblemente en ingles).
- No dispone de vision, audio ni modo de pensamiento.
- El contenido generado suele ser incorrecto o poco relacionado con la pregunta; el conocimiento del mundo es minimo.

## Casos de uso

- Docencia y proyectos academicos de diseno de SoC: el modelo sirve como carga de trabajo realista para validar aceleradores FPGA de productos matriz-vector en Q8_0, tal como se uso en ECE382M (UT Austin), gracias a su tamano de 8,4 M de parametros y ficheros de menos de 9 MB.
- Pruebas de pipelines de cuantizacion: comparar Q8_0 frente a Q4_0 (46 % mas pequeno) sobre el mismo fine-tune permite medir la perdida de calidad en tareas de formato e instrucciones con un coste computacional minimo.
- Validacion de integraciones con llama.cpp: el fichero GGUF permite probar carga, plantillas de chat y generacion en llama-server o llama-cli sin dependencias pesadas, util para tests de regresion de tooling.
- Experimentos de instrucciones de formato: el fine-tune esta entrenado especificamente para reglas como recuentos de lineas, JSON con claves dadas o palabras prohibidas, lo que permite estudiar hasta que punto un modelo de 8 M puede obedecer restricciones sintacticas.
- Despliegue en entornos con recursos ultralimitados: con 8,96 MB en Q8_0 o 4,79 MB en Q4_0, cabe en microcontroladores, FPGAs y sistemas embebidos donde no es viable ningun otro LLM.
- Educacion sobre LLM: ilustrar de forma tangible las limitaciones de escala (alucinacion, falta de conocimiento, contexto de 256-512 tokens) en un modelo que se ejecuta en segundos en cualquier CPU.

## Benchmarks y rendimiento

Resultados del benchmark del curso (50 items: HellaSwag, ARC-Easy, estilo IFEval; llama-server en x86, cinco muestras por item, semillas 42, 1, 2, 3, 4):

| Fichero | Media | Rango | HellaSwag | ARC-Easy | IFEval |
|---|---:|---|---:|---:|---:|
| tiny-lm-8M-ft-Q8_0.gguf | 30,6 | 25,2 a 34,3 | 22,7 | 18,9 | 70 |
| tiny-lm-8M-ft-Q4_0.gguf | 28,3 | 22,9 a 31,3 | 22,4 | 18,3 | 60 |

Q4_0 pierde la mayor parte de rendimiento en la parte de seguimiento de instrucciones (IFEval 60 frente a 70) y es un 46 % mas pequeno. No se han publicado resultados de benchmarks para el modelo original sin fine-tune en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 50 MB en cualquier cuantizacion (8,96 MB en Q8_0, 4,79 MB en Q4_0), incluyendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU, incluida una iGPU o una GPU integrada; no requiere GPU dedicada.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1050, etc.) y en CPU, microcontroladores y FPGAs.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runtime compatible con GGUF; el autor lo valido con llama-server en x86.
- Latencia y throughput: no disponibles de forma numerica; por el tamano del modelo, la generacion se completa en fracciones de segundo en CPU moderna, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| tiny-lm-8M (este) | 8,4 M | 256 / 512 | CC BY 4.0 | GGUF | Enfoque didactico, FPGA, conocimiento minimo |
| sixf0ur/tiny-lm-8M (base) | 8,4 M | 256 | CC BY 4.0 | safetensors (presumible) | Modelo original sin cuantizar |
| Modelos tipo TinyStories (p. ej. roneneldan/TinyStories-8M) | ~8 M | 256-512 | variable (a menudo MIT/Apache) | safetensors, GGUF | Entrenados en cuentos sinteticos; comparable en escala, no en este repositorio |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; las comparaciones de rendimiento entre estos modelos no estan disponibles.

## Limitaciones y advertencias

- Calidad linguistica muy baja: el autor advierte de que, aunque sigue la forma de la instruccion, el contenido suele ser incorrecto o poco relacionado con la pregunta.
- Conocimiento del mundo minimo y alta propension a alucinar; no apto para tareas de facto o produccion real.
- Contexto muy corto: 256 tokens en el original y 512 en el fine-tune, insuficiente para conversaciones o documentos largos.
- Idiomas soportados no declarados; el entrenamiento usa nano_wiki, presumiblemente en ingles, por lo que el rendimiento en castellano es incierto y probablemente deficiente.
- Sin tool calling, sin agentes, sin vision ni audio.
- Licencia CC BY 4.0: permite uso comercial con atribucion a sixf0ur (modelo base y tokenizer) y a la licencia de nano_wiki; es obligatorio conservar la atribucion.
- El fine-tune se entreno con datos sinteticos y verificacion automatica de reglas, lo que puede producir sobreajuste a los formatos exactos vistos en entrenamiento.
- El modelo original no incluye plantilla de chat; usar el fichero fine-tuned para conversacion.
- No se han publicado evaluaciones independientes ni datos de sesgos; cualquier uso en produccion requeriria una evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tractorman/tiny-lm-8M-Q8_0-GGUF
- Modelo base: https://huggingface.co/sixf0ur/tiny-lm-8M
- Dataset nano_wiki: https://huggingface.co/datasets/sixf0ur/nano_wiki
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- llama.cpp: https://github.com/ggerganov/llama.cpp
