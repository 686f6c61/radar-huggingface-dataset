# William-WSDS/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines Lab, publicado bajo licencia Apache-2.0 y acompanado de su Model Acceptable Use Policy. La ficha que nos ocupa no es el modelo original, sino una conversion a GGUF realizada por William-WSDS para el sistema operativo embraOS, que lo distribuye como modelo nativo experimental ejecutado por el llama.cpp integrado en la imagen del sistema. La conversion parte de la revision `c9d028302cd0f035fdf8e7e91f089a4ce94d2195` del repositorio original y no introduce fine-tuning, importance matrix ni cambios en la plantilla de chat.

El modelo original emplea una arquitectura poco habitual denominada `inkling2_loop`, con 24 bloques de los cuales los bloques 6 a 17 se ejecutan tres veces, y una capa de mezcla de expertos con 128 expertos por bloque de los que se activan 8 por token. El checkpoint del autor almacena los expertos ya cuantizados en NVFP4 (bloques 0 a 19) y MXFP8 (bloques 20 a 23), sin pesos en precision completa disponibles. La ventana de contexto declarada es de 1.048.576 tokens.

La relevancia de esta publicacion es doble: por un lado, demuestra la viabilidad de ejecutar un modelo multimodal de aproximadamente 26.000 millones de parametros en CPU x86 con AVX2 mediante llama.cpp; por otro, expone con transparencia las limitaciones del conversor de llama.cpp 1.1.0, que no puede preservar la cuantizacion original de los expertos y obtiene una divergencia KL notablemente peor que la alternativa de ggml-org. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con bucle de bloques y mezcla de expertos) |
| Parametros totales | 26.070.385.152 (aprox. 26,1 mil millones) |
| Parametros activos | 8 expertos de 128 por bloque (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | Q4_K_M (principal), con Q8_0, Q5_0, Q6_K y F32 internos; proyector en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, sujeta ademas a la Model Acceptable Use Policy de Thinking Machines Lab |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura `inkling2_loop` organiza el modelo en 24 bloques, de los cuales los bloques 6 a 17 se reejecutan tres veces, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. Cada bloque incorpora una capa de mezcla de expertos con 128 expertos y 8 activos por token. El checkpoint original no contiene pesos en precision completa: los expertos de los bloques 0 a 19 estan almacenados en NVFP4 y los de los bloques 20 a 23 en MXFP8. Esta circunstancia condiciona cualquier conversion posterior, porque el conversor debe expandir primero esos formatos de cuatro y ocho bits antes de recuantizar.

La conversion a GGUF se realizo con llama.cpp en la etiqueta `v1.1.0`, mediante `convert_hf_to_gguf.py` a bf16 seguido de `llama-quantize` a Q4_K_M, y una segunda pasada con `--mmproj --outtype f16` para el proyector visual. Una segunda conversion con el build `b12751` produjo archivos identicos byte a byte. El archivo resultante contiene 704 tensores: 189 en Q4_K (9.328 MiB), 12 en Q8_0 (4.131 MiB), 12 en Q5_0 (2.673 MiB), 13 en Q6_K (384 MiB) y 478 en F32 (141 MiB). Los expertos de down-projection tienen 1.152 columnas, que los bloques de 256 de Q4_K no dividen, por lo que se escribieron en Q8_0 y Q5_0. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO aplicadas por el autor original.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia preservada en la conversion.
- Razonamiento explicito con modo de pensamiento siempre activo, graduable mediante el parametro `reasoning_effort` con los valores `none`, `minimal`, `low`, `medium`, `high`, `xhigh` y `max`; el valor por defecto es `high`, y en `none` el modelo sigue pensando brevemente.
- Comprension de imagenes: el pipeline declarado es image-text-to-text y el proyector `inkling2v` se distribuye como archivo separado en F16.
- Soporte de tool calling y function calling: la model card menciona que la primera peticion de una sesion en embraOS es la lista completa de herramientas, lo que implica uso intensivo de herramientas.
- Procesamiento de imagenes a su tamano nativo, con reescalado cuando se supera el limite de tokens de imagen configurado (`--image-max-tokens`, 1024 en el ejemplo).
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Agentes locales en embraOS: el modelo se integra como modelo nativo servido por el llama.cpp de la imagen del sistema, y su primer uso es enviar la lista completa de herramientas; encaja en flujos de agente donde la ventana de contexto de 1.048.576 tokens permite mantener historial y definiciones de herramientas sin truncar.
- Automatizacion de escritorio con entrada visual: al aceptar imagenes mediante el proyector F16, puede interpretar capturas de pantalla y decidir acciones sobre la interfaz, con el limite de 1024 tokens de imagen por defecto.
- Asistencia tecnica sobre documentacion extensa: la ventana de contexto permite cargar manuales completos o bases de conocimiento tecnicas y responder con razonamiento graduable segun la dificultad de la consulta.
- Procesamiento por lotes en CPU sin GPU: con 17,5 GB en Q4_K_M y un rendimiento medido de 45,7 tokens/s de lectura de prompt y 6,9 tokens/s de generacion en un x86 de ocho nucleos con AVX2, es viable para tareas de extraccion y clasificacion en servidores sin acelerador.
- Razonamiento de varios pasos con control de coste: el parametro `reasoning_effort` permite rebajar el pensamiento a `minimal` o `low` en tareas rutinarias y subirlo a `max` en problemas complejos, ajustando la latencia al presupuesto disponible.
- Analisis de documentos con tablas e imagenes en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 facilita la integracion en productos comerciales, siempre que se respete la politica de uso aceptable del autor original.
- Prototipado e investigacion sobre arquitecturas con bucle de bloques: al ser un GGUF fiel a la plantilla y a la configuracion de generacion (temperatura 1.0), sirve para estudiar el comportamiento de `inkling2_loop` sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de calidad de cuantizacion y de velocidad en CPU:

| Metrica | Este archivo (Q4_K_M) | ggml-org/Inkling-2-Mini-GGUF (NVFP4) |
|---|---|---|
| Divergencia KL media (10.240 tokens de texto tecnico en ingles) | 0,0245 | 0,0055 |
| Coincidencia del token mas probable | 92,8 % | 96,4 % |
| Lectura de prompt (x86, 8 nucleos, AVX2) | 45,7 tokens/s | 31,8 tokens/s |
| Generacion (x86, 8 nucleos, AVX2) | 6,9 tokens/s | 6,0 tokens/s |

## Requisitos de hardware

- VRAM o RAM estimada: el archivo Q4_K_M ocupa 17.478.094.272 bytes (aprox. 16,3 GiB) y el proyector F16 639.348.512 bytes (aprox. 610 MiB); en total, alrededor de 17 GiB de memoria, que pueden residir en RAM de sistema al ejecutarse en CPU.
- GPU recomendadas: no disponible; la model card solo documenta ejecucion en CPU x86 con AVX2 y menciona codigo vectorial para F16 en Arm y x86.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano de 17 GB excede la VRAM de la mayoria de tarjetas consumer, aunque podria caber en modelos con 24 GB si llama.cpp soporta la arquitectura en backend GPU, extremo no verificado.
- Opciones de despliegue: llama.cpp, en concreto `llama-server` con `-m Inkling-2-Mini-Q4_K_M.gguf --mmproj mmproj-Inkling-2-Mini-F16.gguf --image-max-tokens 1024`; requiere llama.cpp 1.1.0 o superior, ya que la version 1.0.0 no reconoce la arquitectura. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: en un x86 de ocho nucleos con AVX2, 45,7 tokens/s de lectura de prompt y 6,9 tokens/s de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion de expertos | KL media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| William-WSDS/Inkling-2-Mini-GGUF (esta ficha) | 26,1 mil millones | 1.048.576 | Q4_K / Q8_0 / Q5_0 (recuantizados) | 0,0245 | Apache-2.0 + politica de uso | Hugging Face, 0 descargas |
| ggml-org/Inkling-2-Mini-GGUF | 26,1 mil millones | 1.048.576 | NVFP4 original preservado | 0,0055 | Apache-2.0 + politica de uso | Hugging Face |
| thinkingmachines/Inkling-2-Mini (original) | 26,1 mil millones | 1.048.576 | NVFP4 / MXFP8 | referencia | Apache-2.0 + politica de uso | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion consultada.

## Limitaciones y advertencias

- La cuantizacion degrada la fidelidad respecto al checkpoint expandido: divergencia KL de 0,0245 frente a 0,0055 del archivo NVFP4 de ggml-org, y coincidencia del token mas probable del 92,8 % frente al 96,4 %.
- El conversor de llama.cpp 1.1.0 no puede generar archivos que preserven los expertos NVFP4 originales, por lo que esta conversion recuantiza inevitablemente.
- El modelo siempre piensa, incluso con `reasoning_effort` en `none`, lo que anade latencia y tokens de salida en todos los casos.
- La plantilla de chat devuelve error ante cualquier valor de `reasoning_effort` distinto de los siete admitidos, lo que exige validacion en el cliente.
- Requiere llama.cpp 1.1.0 o superior; la version 1.0.0 no reconoce la arquitectura `inkling2_loop`.
- La licencia Apache-2.0 se complementa con la Model Acceptable Use Policy de Thinking Machines Lab, que se aplica tambien a estas modificaciones y responsabiliza al distribuidor del cumplimiento por parte de terceros.
- El autor original no incluye archivo de licencia propio en su repositorio, segun la model card.
- No hay informacion sobre sesgos, tasas de alucinacion, idiomas soportados ni rendimiento en benchmarks estandar.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre esta conversion concreta.
- El uso esta orientado a embraOS como modelo nativo experimental; no se documenta su integracion con otros runtimes.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/William-WSDS/Inkling-2-Mini-GGUF
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversion alternativa con expertos NVFP4: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Proyecto embraOS: https://github.com/Ward-Software-Defined-Systems/embraOS
- Politica de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
