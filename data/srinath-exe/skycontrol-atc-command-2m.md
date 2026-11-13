# srinath-exe/skycontrol-atc-command-2m

## Resumen

SKYCONTROL command model (S1-2M, free wording) es un transformer de 2.030.208 parámetros desarrollado por srinath-exe que convierte el texto de una transmisión de controlador aéreo en una línea de comando ejecutable por un simulador. Es el componente de comprensión de lenguaje del juego de navegador SKYCONTROL, donde el jugador gestiona tráfico de superficie, torre y aproximación en San Francisco mediante voz. El modelo traduce formulaciones libres ("emirates eight six five, come on down to seven thousand") a comandos estructurados ("UAE865 Altitude 7000") o devuelve `SAY AGAIN` cuando no puede resolver la intención o el destinatario.

La relevancia del modelo no reside en su capacidad general, sino en su diseño extremo para despliegue en el dispositivo: 2 MB en cuantización int8, 0,24 s de carga y 110-170 ms por comando en una CPU de clase teléfono, sin servidor. Emplea una arquitectura tipo Llama con 4 capas, anchura 192, 6 cabezas de atención, RoPE, SwiGLU y embeddings atados, con una ventana de contexto de 512 tokens y un vocabulario BPE de 1.349 tokens entrenado específicamente sobre texto ATC.

El modelo se entrena desde cero con datos generados por el propio simulador (unas 205.000 muestras de 11 aeropuertos) y se refina con GRPO usando el simulador como función de recompensa, seguido de un ajuste fino para lenguaje coloquial. Está publicado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama: pre-norm, RoPE, SwiGLU, embeddings atados, KV cache |
| Parametros totales | 2.030.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (safetensors) e int8 row-wise (formato `atc-s1-web-1` para navegador) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), `web/model.bin` + `web/model.json` (int8) |
| Capas / anchura / cabezas | 4 / 192 / 6 |
| Vocabulario | 1.349 tokens (BPE entrenado sobre texto ATC) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama con normalización pre-norm, rotary positional embeddings (RoPE), activación SwiGLU y embeddings de entrada y salida atados. Consta de 4 capas con anchura 192 y 6 cabezas de atención, y mantiene KV cache para generación incremental. La arquitectura completa está escrita explícitamente en `model.py`. El tokenizador es un BPE de 1.349 tokens entrenado sobre texto de control de tráfico aéreo, lo que reduce drásticamente el tamaño del vocabulario y del embedding.

El entrenamiento consta de tres fases. Primero se generan aproximadamente 205.000 ejemplos a partir de 11 aeropuertos (SFO, Heathrow, JFK, LAX, CDG, Dubái, Boston, Hong Kong, Haneda, Delhi y Singapur): el controlador basado en reglas del juego emite instrucciones reales sobre tráfico simulado y cada instrucción se registra con su situación, añadiendo ruido tipo habla (muletillas, repeticiones, palabras mal oídas, intercambios de callsign). Los no-comandos se incluyen como objetivos `SAY AGAIN`. Después se realiza pre-entrenamiento desde cero sobre esos datos, seguido de GRPO con el simulador como recompensa: un comando solo recibe recompensa si el juego lo acepta y hace lo que se pretendía. Finalmente, un ajuste fino de lenguaje libre con 26.000 situaciones del juego, cada instrucción formulada de manera coloquial ("come on down to", "give me two one zero"), mezclado con 50.000-60.000 filas de los datos originales para no olvidar la fraseología estándar. Solo se publica un checkpoint si envía correctamente con más frecuencia y envía mal con la misma o menor frecuencia en todos los conjuntos de prueba. No se usaron grabaciones reales de ATC ni transcripciones de terceros.

## Capacidades

- Traducción de lenguaje natural a comandos estructurados de control aéreo (altitud, velocidad, rumbo, aproximación, etc.).
- Resolución de referencias a aeronaves a partir del contexto: resuelve "emirates eight six five" o "the Qantas" al callsign correcto presente en frecuencia.
- Emisión de `SAY AGAIN` ante comandos ambiguos, no reconocidos o dirigidos a aeronaves ausentes.
- Manejo de ruido tipo habla: muletillas, repeticiones, palabras mal oídas e intercambios de callsign.
- Comprensión de fraseología estándar FAA/ICAO y de formulaciones coloquiales fuera de manual.
- Generación restringida por el juego: los primeros tokens se limitan a callsigns presentes en frecuencia, lo que impide inventar aeronaves.
- Operación en el dispositivo en el navegador (int8, CPU de clase teléfono) sin servidor.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Comprensión de voz en juegos de simulación ATC: el modelo recibe la transcripción del reconocedor de voz y el contexto de aeronaves en frecuencia, y devuelve el comando que el simulador ejecuta. Es adecuado por su latencia de 110-170 ms y su ejecución local en el navegador.
- Asistente de dictado para simuladores de vuelo de escritorio: integrado en pipelines que conviertan voz a texto, permite al jugador dar instrucciones por voz a aeronaves simuladas sin escribir comandos.
- Prototipado de interfaces de voz para entrenamiento de controladores: sirve como banco de pruebas de bajo coste para evaluar cómo se resuelven formulaciones coloquiales frente a fraseología estándar, sin necesidad de infraestructura de servidor.
- Investigación en modelos ultra pequeños con RL: el uso de GRPO con un simulador como recompensa y la validación checkpoint a checkpoint constituyen un caso de estudio reproducible para ajuste por refuerzo en dominios restringidos.
- Despliegue en dispositivos con recursos muy limitados: con 2 MB en int8 y 0,24 s de carga, encaja en aplicaciones web progresivas, navegadores móviles o entornos embebidos donde no cabe un modelo mayor.
- Generación de datos sintéticos de dominio ATC: el modelo puede emplearse para producir pares situación-comando que alimenten otros sistemas de evaluación o entrenamiento dentro del ecosistema del juego.
- Filtro de comandos previo a un gate de seguridad: combinado con reglas y una compuerta de confirmación, puede usarse para clasificar si una transmisión es un comando válido, un no-comando o una petición de repetición.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la cadena completa del juego (limpieza de texto, reglas, modelo y compuerta de seguridad), no a evaluaciones aisladas del modelo.

| Conjunto de prueba | Enviados correctos / enviados erróneos |
|---|---|
| Examen independiente: 60 comandos en lenguaje cotidiano, autor separado | 51 / 2 |
| Examen de estrés: 86 comandos + 34 no-comandos en 12 categorías difíciles | 81 / 3 |
| Habla casual extremo a extremo: examen pronunciado por cuatro voces a través del reconocedor | 178 / 10 (de 208) |
| Fraseología estándar: 190 comandos | 181 / 4 |
| No-comandos correctamente no enviados | 108 de 115 |

Coincidencia exacta con fraseología estándar: 94 % (aeropuertos vistos), 88 % (aeropuerto no visto), 79 % (transcripciones del reconocedor de voz). La exportación int8 coincide exactamente con fp32 en una comprobación de 300 líneas (`web/quant_check.json`). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en fp32 (2,03 M de parámetros) y aproximadamente 2 MB en int8; cabe en cualquier GPU, CPU o dispositivo móvil.
- GPU recomendadas: no requiere GPU; funciona en CPU de clase teléfono. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en navegadores móviles.
- Opciones de despliegue: PyTorch con safetensors (`example.py`), y exportación int8 en el navegador mediante el formato `atc-s1-web-1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,24 s de carga y 110-170 ms por comando en CPU de clase teléfono según el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (traducción de lenguaje natural a comandos ATC con despliegue en navegador) en la documentación proporcionada. Como referencia de escala, los modelos de lenguaje generalistas más pequeños habituales (por ejemplo, variantes de menos de 10 M de parámetros) no están evaluados en esta tarea ni con este formato de contexto restringido, por lo que la comparación directa no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SKYCONTROL S1-2M | 2.030.208 | 512 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Números: el modelo espera texto tal como lo deja la limpieza del juego, con números hablados convertidos a dígitos ("heading 300", "180 knots"). El habla dígito a dígito sin procesar ("three zero zero") suele producir `SAY AGAIN`.
- Errores: aproximadamente 1 de cada 20 comandos en lenguaje cotidiano se envía mal. En el juego, una compuerta de seguridad separada decide si enviar, confirmar o preguntar de nuevo; debe usarse un mecanismo similar si los comandos tienen consecuencias.
- Fraseología: ha aprendido el conjunto de comandos del juego y principalmente fraseología de estilo FAA/ICAO. Acentos y formulaciones fuera de ese ámbito no están cubiertos.
- Idioma: solo inglés; no hay soporte multilingüe.
- Contexto: ventana de 512 tokens, suficiente para el formato de contexto del juego pero no para conversaciones largas o documentos extensos.
- Uso real: es un modelo de juego, no apto para control de tráfico aéreo operativo real.
- Sesgos: no se documentan sesgos específicos más allá de la cobertura limitada de acentos y formulaciones; al entrenarse solo con datos generados por el simulador, puede no generalizar a distribuciones de habla real.
- Licencia: Apache 2.0 permite uso comercial, pero la idoneidad para producción fuera del juego no está validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srinath-exe/skycontrol-atc-command-2m
- Jugar a SKYCONTROL: https://openatc.aeon-labs.site
- Informe de entrenamiento: https://openatc.aeon-labs.site/reports/command-model-free.html
