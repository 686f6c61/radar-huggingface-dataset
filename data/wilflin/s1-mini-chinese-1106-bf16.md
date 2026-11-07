# WIlfLin/S1-mini-Chinese-1106-BF16

## Resumen

S1-mini-Chinese-1106-BF16 es un modelo de generacion de texto especializado en la normalizacion de transcripciones ASR para chino y chino/ingles mezclado (code-switching). Lo desarrolla el usuario WIlfLin como un ajuste fino completo (full fine-tuning) del modelo S1-mini de Superwhisper, cuya arquitectura subyacente es Qwen3-0.6B. No es un reconocedor de audio ni un asistente generalista: procesa texto y devuelve texto limpio, eliminando muletillas, repeticiones, falsos arranques y corrigiendo numeros, nombres propios chinos, listas numeradas y puntuacion.

El modelo resuelve un problema concreto de los pipelines de voz: las transcripciones crudas de ASR contienen ruido (repeticiones, titubeos, cifras mal formateadas) que degrada la calidad de cualquier aplicacion posterior. Este checkpoint concreto es una nueva version de pesos denominada `stability-margin-r2`, centrada en mejorar la estabilidad de la transcripcion numerica en BF16, e incorpora cambios respecto al checkpoint anterior `S1-mini-Chinese-1106` (native-v10).

Con 751.632.384 parametros, formato BF16 y licencia propia derivada de S1-mini, es un modelo pequeno y desplegable en hardware modesto, pensado para integrarse como etapa de postprocesado dentro de sistemas de voz en produccion, no como modelo autonomo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B), ajuste fino completo |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en BF16; no se documentan otras cuantizaciones |
| Idiomas soportados | chino (zh), ingles (en); orientado a chino y code-switching zh/en |
| Licencia | s1-mini-license (licencia propia, derivada de S1-mini; requiere conservar LICENSE y NOTICE y la atribucion) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de S1-mini (Superwhisper), construido sobre la arquitectura Qwen3-0.6B, un transformer decoder-only. El ajuste es de tipo full fine-tuning sobre los 751.632.384 parametros, no LoRA ni entrenamiento solo de las ultimas capas. El entrenamiento se realizo en varias fases sobre el checkpoint native-v10: primero 5.109 ejemplos de replay y contraste durante 320 pasos con learning rate 5e-7; despues se anadieron 2.048 ejemplos de combinaciones numericas y acarreos (7.157 en total) durante 448 pasos con learning rate 1e-6. La funcion de perdida combina cross-entropy sobre el texto objetivo, KL contra un profesor de confianza y una margin loss sobre caracteres clave (digitos y tokens ASCII), con margen de logit de 1, peso de margen 0,2 y peso de KL 0,1.

Detalles tecnicos relevantes: la fase final uso batch efectivo 16, parametros maestros y profesor en FP32, autocast BF16 para el student y TF32 desactivado; el profesor solo se acepta si su siguiente token coincide con la anotacion y tiene probabilidad minima de 0,9. Los datos provienen de CS2W (CC-BY-SA-4.0), Disfl-QA (CC-BY-4.0), sintesis propia y sintesis asistida por modelo; las anotaciones sinteticas no equivalen a anotacion humana independiente. El modelo aplica ademas normalizacion de estilo (semi-formal), estructura (prosa o listas) y contexto mediante una linea de control al inicio de la entrada.

## Capacidades

- Normalizacion de transcripciones ASR: elimina muletillas, repeticiones y falsos arranques, y aplica puntuacion y mayusculas de estilo escrito.
- Formateo de numeros: combinaciones numericas, ceros internos, acarreos y expresiones de hora y fecha.
- Normalizacion de deletreo (spelling): tratamiento de palabras deletreadas y palabras inventadas en transcripciones.
- Nombres propios chinos: normalizacion y formateo de nombres de persona en chino.
- Listas numeradas y saltos de linea: genera listas numeradas y estructura el texto cuando se solicita.
- Matematicas basicas en texto plano: usa los operadores `+ - * / ^ =`; no calcula respuestas no dictadas ni genera LaTeX.
- Code-switching chino/ingles: maneja transcripciones mixtas zh/en.
- Control por instrucciones: la linea de control `[Styling: ...] [Structure: ...] [Context: ...]` permite ajustar estilo, estructura y contexto de salida.
- Modo thinking desactivable: la plantilla de chat admite `enable_thinking=False`.
- No soporta tool calling, function calling, vision, audio ni razonamiento agente multi-paso; es un postprocesador de texto.

## Casos de uso

- Postprocesado de pipelines ASR en produccion: colocar el modelo tras Qwen3-ASR para limpiar la transcripcion bruta (muletillas, repeticiones, puntuacion) antes de entregarla al usuario o almacenarla. Su tamano pequeno permite ejecutarlo en linea con baja latencia.
- Normalizacion de actas y notas de reunion: convertir transcripciones de reuniones en chino en texto legible con listas numeradas y saltos de linea, usando `Structure: lists` cuando se requiera formato de puntos.
- Formularios y dictado con cifras: corregir numeros, horas, fechas y acarreos en transcripciones de dictado (por ejemplo, introduccion de datos en sistemas internos), donde el checkpoint BF16 muestra mejoras especificas frente a native-v10 en pruebas de contexto numerico.
- Subtitulado y documentacion de contenido hablado: limpiar transcripciones zh/en mezcladas para generar subtitulos o transcripciones escritas con estilo semi-formal.
- Preprocesado para busqueda y analitica sobre voz: normalizar transcripciones antes de indexarlas, de modo que nombres propios chinos y cifras queden en forma canonica y consistente.
- Correccion de nombres y entidades en CRM o atencion al cliente: normalizar nombres de persona chinos y deletreos en transcripciones de llamadas antes de registrarlos en sistemas internos.
- Generacion de resumenes a partir de voz (etapa previa): entregar texto limpio y estructurado a un modelo posterior de resumen, reduciendo ruido y errores de formato en la cadena.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con vLLM 0.17 sobre Blackwell SM120, BF16, decodificacion greedy, max-num-seqs 8, modo eager, prefix cache desactivado y maximo de 256 tokens generados. No son comparables con resultados de otros backends.

| Test | native-v10 | Este version |
|---|---:|---:|
| Core spelling, coincidencia estricta | 8/8 | 8/8 |
| Capacidades basicas, coincidencia lexica | 45/48 | 45/48 |
| Formato y numeros, coincidencia lexica | 20/20 | 20/20 |
| Nombres chinos, coincidencia lexica | 60/60 | 60/60 |
| Contexto de spelling, coincidencia estricta | 311/326 | 311/326 |
| Spelling de palabras inventadas, coincidencia estricta | 196/200 | 196/200 |
| Matematicas basicas, coincidencia lexica | 233/236 | 234/236 |
| Contexto numerico/tiempo A, coincidencia estricta | 372/432 | 408/432 |
| Contexto numerico/tiempo B, coincidencia estricta | 367/432 | 424/432 |
| Texto publico, coincidencia lexica | 228/400 | 226/400 |
| CER lexico en texto publico (menor es mejor) | 10,1373 % | 10,1593 % |

La mejora se concentra en los contextos numericos y de tiempo; en texto publico hay un ligero retroceso. El autor advierte que estas colecciones son evidencia de desarrollo/regresion (reutilizadas durante el desarrollo) y que el contexto B no debe considerarse un test ciego independiente. La coincidencia estricta conserva puntuacion y espacios internos; la lexica elimina caracteres no alfanumericos pero mantiene mayusculas y digitos. No equivalen a precision semantica humana ni a la metrica de token accuracy del 94,8 % citada upstream.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,5-2 GB de pesos (751 M parametros) mas overhead de activaciones y cache KV; en la practica cabe en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; el autor valido sobre Blackwell SM120 (BF16, vLLM 0.17). GPUs como RTX 4090, L4, A10, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060/4060 (8-12 GB), RTX 4090 y similares; tambien en GPUs de gama baja con 4-6 GB.
- Opciones de despliegue: transformers (uso documentado con `AutoModelForCausalLM` y `apply_chat_template`), vLLM (backend de las pruebas del autor), y text-generation-inference (tag `text-generation-inference`). No se documenta soporte explicito para llama.cpp u Ollama.
- Latencia y throughput: no disponible como cifra concreta; las pruebas se hicieron con max-num-seqs 8, greedy y 256 tokens maximos, sin reportar latencia ni tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-mini-Chinese-1106-BF16 (este) | 751.632.384 | no disponible | Normalizacion de transcripciones ASR zh/en, version BF16 stability-margin-r2 | s1-mini-license | Hugging Face |
| S1-mini-Chinese-1106 (native-v10) | no disponible | no disponible | Misma tarea, checkpoint anterior | s1-mini-license | Hugging Face |
| S1-mini (Superwhisper) | no disponible | no disponible | Modelo base de postprocesado de transcripciones | s1-mini-license | Hugging Face |
| Qwen3-0.6B | ~0,6 B (arquitectura base) | no disponible | LLM generalista | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de terceros; la unica comparacion publicada es contra el checkpoint anterior native-v10 del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos; los datos de entrenamiento incluyen fuentes con licencias CC-BY-SA-4.0 y CC-BY-4.0 y sintesis generada por modelo, lo que puede introducir sesgos de dominio ASR.
- Riesgo de alucinacion y errores: los numeros pueden recibir un cero de mas (en el contexto B, 4 de las 8 diferencias de referencia son errores de valor y 4 son diferencias de estilo entre numeral chino y arabigo); el spelling, nombres propios, negaciones, falsos arranques y parrafos largos aun pueden normalizarse de forma incorrecta.
- Distribucion de datos: parte de la sintesis temprana de miles omitia el "cero" de la forma oral canonica, por lo que la distribucion no representa ASR natural.
- Reproducibilidad: redondeo en coma flotante, batch, backend y hardware pueden alterar la salida; el entrenamiento reduce el riesgo pero no garantiza salida identica bit a bit en cualquier configuracion.
- Validacion parcial: las pruebas son de inferencia de texto local, no de grabaciones naturales, pulsaciones fisicas ni todos los campos de entrada; no se valido la regresion completa en otro hardware ni en Orin.
- Alcance: procesa texto, no audio; no es un asistente generalista y no debe usarse como tal.
- Licencia: `s1-mini-license` es una licencia propia derivada de S1-mini que exige conservar LICENSE, NOTICE, el nombre original del modelo y la atribucion del autor; las condiciones exactas de uso comercial no se detallan en la informacion disponible y deben revisarse en el fichero LICENSE.
- El modelo no incluye reglas de prelectura ni filtros de proteccion de contenido; la salida se entrega tal cual y la aplicacion llamadora debe gestionar peticiones anomalas, deteccion de truncamiento y envio seguro de saltos de linea.
- Descargas y traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WIlfLin/S1-mini-Chinese-1106-BF16
- Checkpoint anterior: https://huggingface.co/WIlfLin/S1-mini-Chinese-1106
- Modelo base S1-mini (Superwhisper): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada
- Ficheros internos citados por el autor (en el repositorio del modelo): LICENSE, NOTICE, training-provenance.json, data-provenance.json, evaluation-summary.json
