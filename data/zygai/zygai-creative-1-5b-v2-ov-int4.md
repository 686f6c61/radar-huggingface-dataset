# ZygAI/ZygAI-Creative-1.5B-v2-ov-int4

## Resumen

ZygAI-Creative-1.5B-v2-ov-int4 es un modelo de generacion de texto en ingles especializado en escritura creativa, publicado por ZygAI. Se construye sobre Qwen2.5-1.5B-Instruct mediante un ajuste fino con LoRA (r=16 sobre las proyecciones de atencion), fusionado posteriormente con los pesos base y exportado al formato OpenVINO en cuantizacion INT4. El resultado es un artefacto ligero (0,9 GB en el repositorio) pensado para inferencia en CPU con la libreria openvino-genai.

El modelo resuelve un nicho muy concreto: generar borradores rapidos de ficcion literaria con un estilo mas vivido que el del modelo base, a cambio de una coherencia narrativa debil que el propio autor reconoce en la model card. No pretende competir en razonamiento, codigo ni tareas de agente, sino servir como generador de primeros borradores en hardware modesto.

Su relevancia actual es limitada y muy acotada: el ajuste se hizo con solo 900 ejemplos sinteticos durante una epoca, sobre CPU en float32, y el modelo solo soporta ingles. Es interesante como ejemplo de pipeline completo (LoRA, merge, exportacion OpenVINO INT4) y como utilidad de escritura asistida en equipos sin GPU, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con LoRA y exportado a OpenVINO |
| Parametros totales | 1,5 mil millones (heredados de Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32 768 tokens, dato no confirmado para este artefacto) |
| Tipos de cuantizacion | INT4 (exportacion OpenVINO); el repositorio solo publica la variante INT4 |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO (IR); no se publican safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros con atencion causal estandar. Sobre el se aplico un adaptador LoRA con rango 16 sobre las proyecciones de atencion, entrenado durante una sola epoca con tasa de aprendizaje 2e-4 en CPU y precision float32. La perdida descendio de 2,8 a 2,3, un margen modesto que es coherente con el volumen de datos empleado.

El conjunto de entrenamiento son 900 ejemplos del dataset Crownelius/Creative-Writing-Gemini3Pro-2700x (licencia MIT), generado de forma sintetica por otro LLM. Tras el ajuste, el adaptador se fusiono con los pesos base y el modelo resultante se exporto a OpenVINO en INT4 para ejecucion en CPU con openvino-genai. No se documenta ninguna innovacion arquitectonica adicional: no hay decodificacion especulativa, atencion lineal ni modo de razonamiento extendido. El autor recomienda un system prompt fijo orientado a ficcion literaria ("You are a literary fiction writer...") que condiciona el estilo de salida.

## Capacidades

- Generacion de texto narrativo en ingles: relatos cortos, ficcion literaria y borradores con estilo mas vivido que el modelo base.
- Conversacion de un solo turno o multi-turno breve, heredada de la naturaleza instruct de Qwen2.5-1.5B-Instruct.
- Respeto parcial de restricciones de formato indicadas en el prompt (longitud solicitada, titulo corto, salida solo con la historia).
- Inferencia en CPU sin GPU gracias a la exportacion OpenVINO INT4 (aproximadamente 24 tokens por segundo en un Intel i5-1235U).
- No se documenta soporte de tool calling, function calling ni flujos de agente multi-paso.
- No dispone de vision, audio ni modo thinking.
- Capacidad multilingue practicamente nula: solo ingles.

## Casos de uso

- Generacion de borradores de ficcion en local: el modelo produce un primer borrador de relato corto en un portatil sin GPU, a unas 24 tok/s en CPU, que el autor puede reescribir y pulir despues.
- Prototipado de pipelines de ajuste fino: sirve como referencia completa de LoRA, merge y exportacion a OpenVINO INT4 para equipos que quieran replicar el flujo con sus propios datos.
- Escritura asistida por prompts con estilo controlado: el system prompt recomendado fuerza un registro literario y una estructura de salida (titulo mas historia), util para generar variantes de una misma premisa.
- Pruebas de despliegue en entornos edge o de bajos recursos: con 0,9 GB de repositorio y ejecucion en CPU, encaja en dispositivos sin acelerador dedicado.
- Generacion de ejercicios creativos o disparadores narrativos: el modelo puede producir aperturas y escenas breves que un humano desarrolla despues.
- Evaluacion comparativa de calidad narrativa: util como linea base de 1,5B para medir cuanto mejora un modelo mayor (por ejemplo, un 7B) en coherencia de trama, tal como hizo el propio autor en su comparacion de cinco prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo reportado por el autor es de velocidad: aproximadamente 24 tokens por segundo en CPU Intel i5-1235U con la exportacion OpenVINO INT4. En la comparacion cualitativa de cinco prompts mencionada en la model card, un modelo de 7B con prompting escribio historias mas coherentes que este modelo.

## Requisitos de hardware

- VRAM estimada: no aplica en su formato principal; el artefacto INT4 esta pensado para CPU y ocupa aproximadamente 0,9 GB en disco.
- GPU recomendadas: no se documentan; el modelo se publica exclusivamente en OpenVINO para CPU.
- Cabe en GPU de consumo: no disponible para este artefacto; en teoria los pesos INT4 de 1,5B cabrian en cualquier GPU con mas de 1 GB de memoria, pero no se ofrece una exportacion para ese escenario.
- Opciones de despliegue: openvino-genai (libreria declarada); no se publican pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin conversion previa.
- Latencia y throughput: aproximadamente 24 tok/s en Intel i5-1235U (CPU, INT4), segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ZygAI-Creative-1.5B-v2-ov-int4 | 1,5B | no disponible | Ingles | Apache 2.0 | OpenVINO INT4 | Ajuste LoRA para ficcion; coherencia debil segun el autor |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32 768 tokens (segun el modelo base) | Multilingue | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo base; mas coherente en general, estilo menos vivido en ficcion |
| Modelos de 7B con prompting (referencia del autor) | 7B | no disponible | Variable | Variable | Variable | Mayor coherencia narrativa en la comparacion de cinco prompts del autor |

## Limitaciones y advertencias

- Coherencia narrativa debil: el autor advierte de que las tramas se desvian, los hechos se contradicen (cita el ejemplo de un aniversario "de plata" descrito como 50 aniversario) y los finales suelen ser abstractos.
- Riesgo de alucinacion elevado en detalles factuales dentro de la ficcion; no es apto para tareas que exijan precision.
- Solo ingles: no hay soporte real de castellano ni de otros idiomas.
- Datos de entrenamiento sinteticos y de volumen muy reducido (900 ejemplos, una epoca), lo que limita la generalizacion del estilo aprendido.
- Restricciones de licencia: los pesos son Apache 2.0, pero el dataset de entrenamiento es sintetico y generado por otro LLM; el autor recomienda revisar los terminos del dataset upstream antes de un uso comercial.
- No sustituye a un modelo de 7B o superior cuando se requiere coherencia de trama; debe tratarse como generador de borradores rapidos.
- Artefacto unicamente en OpenVINO INT4: no hay pesos en safetensors ni GGUF en este repositorio, lo que limita las opciones de despliegue y de reajuste.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad mas alla de la valoracion cualitativa del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZygAI/ZygAI-Creative-1.5B-v2-ov-int4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Crownelius/Creative-Writing-Gemini3Pro-2700x
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- OpenVINO: https://github.com/openvinotoolkit/openvino
