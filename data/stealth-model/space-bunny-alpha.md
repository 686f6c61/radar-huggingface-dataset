# stealth-model/space-bunny-alpha

## Resumen

Space Bunny Alpha es un modelo de lenguaje multimodal publicado por el colectivo Stealth Models bajo el identificador `stealth-model/space-bunny-alpha`. Se trata de una version temprana ("stealth") del modelo MiniMax M3.1 Flash, desarrollado por MiniMax, que aparecio sin atribucion de autor el 23 de septiembre de 2026 y fue desenmascarado oficialmente el 19 de octubre de 2026. El modelo se distribuye en formato GGUF para su ejecucion con llama.cpp y cuenta con 426.186.370.176 parametros totales (segun los pesos en safetensors del modelo base).

La relevancia de esta ficha es doble: por un lado, documenta un caso de "stealth model" en el que un laboratorio publica una version previa de un modelo sin revelar su identidad; por otro, permite evaluar las capacidades reales de MiniMax M3.1 Flash en su fase temprana. El modelo soporta una ventana de contexto de 1 millon de tokens, entrada de texto, imagen y video, y llamadas a herramientas, con una velocidad medida de aproximadamente 300 tokens por segundo en las pruebas del autor.

La arquitectura concreta no se detalla en la informacion disponible, aunque el uso de `--n-cpu-moe` en los comandos de llama.cpp y la referencia a 60 capas de expertos indican que se trata de un transformer con mezcla de expertos (MoE). El modelo base es MiniMaxAI/MiniMax-M3.1-Flash y la licencia aplicable es la MiniMax Community License, que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferido por el uso de `--n-cpu-moe` y 60 capas de expertos; detalles formales no disponibles |
| Parametros totales | 426.186.370.176 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | IQ2_XXS (135 GB en 4 partes); mmproj en F16, Q8_0, Q6_K y Q4_K; DSpark draft en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community License (uso no comercial) |
| Formato de pesos | GGUF (llama.cpp), con safetensors en el modelo base |
| Modalidades de entrada | Texto, imagen y video |
| Tool calling | Si |
| Velocidad medida | Aproximadamente 300 tok/s en las pruebas del autor |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento. Los comandos de llama.cpp incluidos en la model card emplean `--n-cpu-moe 60`, lo que indica que el modelo contiene 60 capas de expertos y que estas pueden descargarse a memoria del sistema mientras el resto de capas residen en GPU. Esta es una tecnica habitual en modelos MoE de gran tamano para permitir su ejecucion en hardware con VRAM limitada.

El modelo incorpora un componente de decodificacion especulativa denominado DSpark: un draft model de 2,1 GB (`dspark-MiniMax-M3.1-Flash-Q8_0.gguf`) que se activa con `--spec-type draft-dspark` y que, segun el autor, ofrece aproximadamente 1,5 veces mas velocidad en tareas de codigo y matematicas. Tambien incluye proyectores multimodales (mmproj) para entrada de imagen y video en varias precisiones. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento, con soporte de modo de razonamiento segun las etiquetas del repositorio.
- Procesamiento de imagenes y video como entrada, mediante los proyectores mmproj en precision F16, Q8_0, Q6_K o Q4_K.
- Llamadas a herramientas (tool calls), lo que habilita integraciones con funciones externas y APIs.
- Ventana de contexto de 1 millon de tokens, adecuada para documentos extensos, bases de codigo completas o conversaciones muy largas.
- Decodificacion especulativa con DSpark para acelerar la generacion en dominios de codigo y matematicas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no detalladas explicitamente, aunque el soporte de tool calls y el contexto largo son compatibles con estos flujos.

## Casos de uso

- Analisis de documentos extensos: con 1M de tokens de contexto, el modelo puede procesar informes anuales, expedientes legales o libros completos en una sola pasada sin necesidad de fragmentacion, lo que reduce la perdida de contexto entre secciones.
- Asistentes de codigo sobre repositorios completos: la ventana de contexto permite cargar una base de codigo de tamano medio y realizar tareas de refactorizacion, busqueda de bugs o generacion de tests con vision global del proyecto; el draft DSpark acelera la generacion en este dominio.
- Procesamiento de video para moderacion o catalogacion: la entrada de video permite clasificar, resumir o etiquetar contenido audiovisual, util en plataformas de contenido o archivos multimedia.
- Automatizacion de atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con contexto largo e interpretar capturas de pantalla o imagenes enviadas por el usuario, combinando tool calls para consultar sistemas internos.
- Pipelines de agentes con herramientas: el soporte de tool calling permite integrar el modelo en flujos de automatizacion que consultan APIs, bases de datos o servicios externos, con el contexto largo manteniendo el historial de acciones.
- Investigacion sobre modelos stealth: el modelo sirve como caso de estudio para analizar como se comporta una version temprana de un modelo frente a su release final, comparando resultados en el benchmark StealthMark.
- Despliegue en hardware de gama alta con CPU offloading: gracias a la cuantizacion IQ2_XXS y al offloading de expertos a RAM, es posible ejecutar el modelo en estaciones de trabajo con 32 GB de VRAM y 128 GB de RAM, o en un Mac de 192 GB.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de StealthMark 1.8.10, el benchmark propio del autor, que no es comparable directamente con MMLU, HumanEval o GSM8K.

| Prueba (StealthMark 1.8.10) | Puntuacion |
|---|---|
| Puntuacion global | 45,5 |
| Inteligencia general | 35,7 |
| Inteligencia visual | 64,4 |
| Selfie | 78,9 |
| Raccoon | 74,3 |
| Beach | 67,8 |
| Mona Lisa | 49,9 |
| Ground Truth | 42,7 |
| Foresight | 35,8 |
| Latch | 34,4 |
| Newton's Mirror | 24,9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la cuantizacion IQ2_XXS ocupa 135 GB en 4 partes; con `--n-cpu-moe 60` los 60 expertos residen en RAM del sistema, por lo que la VRAM necesaria depende de las capas no-expertas que se mantengan en GPU.
- Configuracion minima recomendada por el autor: maquina con 192 GB de RAM, o GPU de 32 GB de VRAM combinada con 128 GB de RAM.
- GPU recomendadas: no especificadas en la informacion; por el volumen de memoria, se requieren GPU profesionales tipo A100/H100 o configuraciones multi-GPU para ejecucion integra en VRAM.
- GPU de consumo: no cabe en GPUs de consumo de forma integra; solo es viable con offloading de expertos a RAM del sistema.
- Mac: en un Mac de 192 GB se puede omitir el flag `--n-cpu-moe`.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte de mmproj para multimodal y draft DSpark para decodificacion especulativa. Otras opciones como vLLM, TGI u Ollama no estan documentadas para estos pesos GGUF.
- Latencia y throughput: aproximadamente 300 tok/s medidos por el autor; el draft DSpark aporta un incremento de unas 1,5 veces en codigo y matematicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Space Bunny Alpha (early MiniMax M3.1 Flash) | 426,2 B | 1M tokens | Texto, imagen, video | MiniMax Community License (no comercial) | GGUF en Hugging Face |
| MiniMax-M3.1-Flash (release final) | no disponible | 1M tokens | Texto, imagen, video | MiniMax Community License (no comercial) | Pesos abiertos en Hugging Face |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el release final del mismo modelo base. No se dispone de datos de benchmarks estandar ni de especificaciones de modelos alternativos para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Licencia no comercial: la MiniMax Community License restringe el uso comercial; es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- Es una version temprana ("early") del modelo; puede presentar diferencias de comportamiento y calidad respecto al release final de MiniMax M3.1 Flash.
- Los benchmarks disponibles proceden de StealthMark, un conjunto propio del autor, por lo que no son directamente comparables con evaluaciones academicas estandar.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- Idiomas soportados no documentados; el rendimiento fuera del ingles es desconocido.
- El modelo es extremadamente grande (426 B de parametros) y su ejecucion requiere hardware especializado con gran cantidad de RAM o configuraciones multi-GPU; no es viable en equipos de consumo convencionales.
- La cuantizacion IQ2_XXS es muy agresiva y puede degradar la calidad respecto a precisiones mayores.
- El soporte multimodal depende de los proyectores mmproj, que deben descargarse y configurarse por separado.
- No hay garantia de soporte o mantenimiento por parte del autor, al tratarse de una publicacion de un colectivo de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stealth-model/space-bunny-alpha
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Licencia: https://huggingface.co/stealth-model/space-bunny-alpha/blob/main/LICENSE
- Guia del modelo: https://spacebunnyalpha.com/
- Comparativa con el release final: https://stealthmodels.com/compare/minimax-m3.1-flash-vs-space-bunny-alpha
- Prueba de conteo de tokens: https://spacebunnyalpha.com/#tokenizer-comparison
- Leaderboard StealthMark: https://huggingface.co/spaces/stealth-model/stealthmark
- Sitio del autor: https://stealthmodels.com/
