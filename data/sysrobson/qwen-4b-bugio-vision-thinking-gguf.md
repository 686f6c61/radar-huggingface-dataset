# sysrobson/Qwen-4B-Bugio-Vision-Thinking-GGUF

## Resumen

Qwen-4B Bugio es una compilación GGUF experimental de 2,4 GB del modelo empero-ai/Qwen3.8-4B-Distill, un Qwen3.5-4B ajustado con trazas de razonamiento de Qwen3.8. Lo publica el usuario sysrobson (responsable también de Sagui-4B) con el objetivo de ofrecer razonamiento paso a paso, lectura de imágenes y tool calling en GPUs de 4 GB, incluida una GTX 970 de 2014. El modelo combina capacidades multimodales (image-text-to-text) con un modo de pensamiento que reduce la longitud de las cadenas de razonamiento respecto a su modelo hermano Sagui-4B: unas 1,9 veces menos tokens de pensamiento en las pruebas del autor.

La arquitectura subyacente es un transformer de 3.930.400.256 parámetros (aproximadamente 3,9B) heredado de la familia Qwen, cuantizado a IQ3_XXS con matrices de importancia (imatrix) para comprimir el modelo hasta 2,38 GB manteniendo visión y tool calling. El repositorio incluye únicamente pesos GGUF, no safetensors, y está pensado para Ollama y llama.cpp. La licencia es Apache 2.0 y los idiomas declarados son inglés y portugués.

Su relevancia actual reside en la combinación poco habitual de tres factores en un modelo tan pequeño: modo thinking, entrada de imágenes y ejecución offline en hardware muy modesto. No obstante, el propio autor lo marca como experimental y advierte de que es más débil que Sagui-4B en generación de código TypeScript, por lo que su nicho es el razonamiento rápido, el chat y la interpretación de capturas de pantalla más que la producción de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, base Qwen3.5-4B ajustada con trazas de Qwen3.8); multimodal image-text-to-text |
| Parametros totales | 3.930.400.256 (aproximadamente 3,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS con imatrix (única cuantización publicada en el repo) |
| Idiomas soportados | inglés (en), portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con Ollama y llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es empero-ai/Qwen3.8-4B-Distill, descrito por el autor como un Qwen3.5-4B afinado sobre trazas de razonamiento generadas por Qwen3.8 (destilación de cadena de pensamiento). Sobre esa base, sysrobson aplica una receta de cuantización IQ3_XXS con imatrix que produce un GGUF de 2,38 GB conservando las capacidades de visión y de llamada a herramientas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el ajuste original.

La innovación práctica del build es la compresión agresiva: mantiene un modo thinking funcional y entrada visual en un peso que cabe en 4 GB de VRAM. Según las mediciones del autor, Bugio emplea unas 1,9 veces menos tokens de razonamiento que Sagui-4B (1.447 frente a 2.786 tokens de media en cinco preguntas de razonamiento), lo que se traduce en menor latencia (101 s frente a 198 s en una GTX 970) con la misma tasa de acierto (5/5) en ese conjunto de preguntas. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y portugués.
- Razonamiento con modo thinking explícito (cadena de pensamiento), optimizado para brevedad frente a Sagui-4B.
- Comprensión de imágenes y capturas de pantalla (pipeline image-text-to-text): lectura de interfaces, código en editores y formularios.
- Generación de código a partir de capturas de UI (demostrado con un formulario de registro convertido en componente React).
- Tool calling / function calling: el autor muestra una llamada correcta a `get_weather` con `{"city": "Lisbon"}` y uso del resultado para responder.
- Explicación de errores de compilación a partir de una imagen del editor (con precisiones limitadas, ver limitaciones).
- Ejecución totalmente offline en Ollama y llama.cpp.

## Casos de uso

- Asistente de razonamiento local en equipos modestos: preguntas aritméticas y de sentido común resueltas con cadena de pensamiento corta, adecuado para portátiles con GPU de 4 GB donde no caben modelos mayores.
- Interpretación de capturas de pantalla en soporte técnico: el modelo lee una imagen del editor o de una interfaz y describe el error o el contenido, útil en herramientas internas de triaje.
- Prototipado rápido de UI a partir de mockups: convierte una captura de un formulario en código React aproximado, suficiente para un borrador que luego se corrige a mano.
- Agentes locales con tool calling: al soportar function calling y ejecutarse offline, puede integrarse en asistentes de escritorio que consultan APIs locales (tiempo, ficheros, calendario) sin enviar datos a la nube.
- Chat multilingüe inglés-portugués: atención a usuarios en ambos idiomas en entornos de habla portuguesa, con la advertencia de que no cubre castellano.
- Demos educativas de destilación y cuantización: sirve para ilustrar cómo un modelo de 4B con thinking y visión cabe en 2,4 GB y se ejecuta en hardware de 2014, útil en docencia sobre IA local.
- Análisis de errores en código a partir de imágenes: detección de mensajes de error TypeScript en capturas de pantalla y propuesta de corrección, con verificación humana obligatoria.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Bugio-4B | Sagui-4B (referencia del autor) |
|---|---|---|---|
| HumanEval-TS (MultiPL-E) | pass@1 | 36,5% | 44,0% |
| MBPP-TS (MultiPL-E) | pass@1 | 46,2% | 54,6% |
| 5 preguntas de razonamiento (conjunto propio) | aciertos | 5/5 | 5/5 |
| 5 preguntas de razonamiento (conjunto propio) | tokens de pensamiento medios | 1.447 (101 s en GTX 970) | 2.786 (198 s en GTX 970) |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,4 GB para los pesos en IQ3_XXS; con overhead de contexto y visión, el autor lo sitúa en el entorno de 4 GB de VRAM.
- GPU validadas por el autor: GTX 970 (4 GB, 2014) como referencia de medición.
- Cabe en GPUs de consumo con 4 GB o más de VRAM; no se especifican otras tarjetas probadas.
- Despliegue: Ollama (`ollama run hf.co/sysrobson/Qwen-4B-Bugio-Vision-Thinking-GGUF:IQ3_XXS`) y llama.cpp; el repo incluye scripts como `scripts/run_demos.py`.
- Latencia observada en GTX 970: 24,3 s para una pregunta aritmética con 338 tokens generados; 106,9 s para generar un componente React con 1.545 tokens; 30,9 s para explicar un error de TypeScript con 120 tokens.
- Throughput estimado: no disponible de forma explícita; se puede derivar de las cifras anteriores (del orden de 4-14 tokens/s en GTX 970 según la tarea).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Punto fuerte | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-4B Bugio (este) | 3,9B | no disponible | Razonamiento breve, visión, tool calling en 4 GB | Apache 2.0 | GGUF IQ3_XXS |
| Sagui-4B (sysrobson) | 3,9B (mismo tamano, 2,38 GB) | no disponible | TypeScript y código (44,0% HumanEval-TS, 54,6% MBPP-TS) | Apache 2.0 | GGUF |
| empero-ai/Qwen3.8-4B-Distill | 3,9B | no disponible | Modelo base sin cuantizar del que deriva Bugio | no disponible | safetensors (presumiblemente) |
| Qwen3.5-4B | 4B (aproximado) | no disponible | Base original de la familia, sin destilación de razonamiento | no disponible | no disponible |

La comparación directa más relevante es con Sagui-4B: mismo tamano, misma receta de compresión y mismo hardware de referencia. Bugio gana en velocidad de razonamiento (1,9 veces menos tokens de pensamiento) y pierde en generación de código TypeScript (36,5% frente a 44,0% en HumanEval-TS). Para código, el propio autor recomienda Sagui.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor; no debe tratarse como un modelo de producción estable.
- Rendimiento en código TypeScript inferior a Sagui-4B: 36,5% frente a 44,0% en HumanEval-TS y 46,2% frente a 54,6% en MBPP-TS.
- Riesgo de explicaciones incorrectas: en la demo de corrección de errores TypeScript, la línea corregida es correcta pero la explicación de la causa es errónea (atribuye el fallo a una aserción de tipo en lugar del valor inicial `"0"`).
- Idiomas limitados a inglés y portugués; no se declara soporte de castellano.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia para conversaciones largas.
- Cuantización única IQ3_XXS: la compresión agresiva puede degradar precisión frente a pesos completos; no hay variantes Q4, Q5 o Q8 en el repositorio.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de benchmarks estándar desaconsejan su uso en producción sin evaluación propia.
- Sesgos conocidos: no documentados en la información disponible; al derivar de la familia Qwen, cabe esperar los sesgos habituales de los corpus web en inglés y portugués.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación comunitaria inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/sysrobson/Qwen-4B-Bugio-Vision-Thinking-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Modelo hermano Sagui-4B: https://huggingface.co/sysrobson/Sagui-4B-Vision-Thinking-Code-GGUF
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset MultiPL-E (HumanEval-TS y MBPP-TS): https://huggingface.co/datasets/nuprl/MultiPL-E
- Transcripciones de ejemplo: `examples/transcripts.json` (dentro del repositorio)
- Script de reproducción de demos: `scripts/run_demos.py` (dentro del repositorio)
- Donaciones del autor (PayPal): https://www.paypal.com/donate/?hosted_button_id=JA6B7RKJURXNW
