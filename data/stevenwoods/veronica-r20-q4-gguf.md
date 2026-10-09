# StevenWoods/veronica-r20-q4-GGUF

## Resumen

Veronica R20 — Q4_K_M (GGUF) es una cuantización del modelo `BlossomsAI/Qwen2.5-Coder-14B-Instruct-Uncensored`, a su vez un ajuste fino de `Qwen/Qwen2.5-Coder-14B-Instruct`. Lo publica el usuario StevenWoods en HuggingFace como parte del proyecto VACA (Veronica, un "AI code architect"), y corresponde al checkpoint exacto contra el que se ajustaron las rondas LoRA de ese proyecto. El resultado es un modelo denso de 14.770.033.664 parámetros (unos 14,77 mil millones) empaquetado en un único fichero GGUF de 8.988.110.688 bytes (8,4 GiB).

Su relevancia es acotada pero clara: se trata de una variante sin censura orientada a generación de código, distribuida ya cuantizada en `Q4_K_M` y pensada para ejecutarse en local con Ollama, llama.cpp o LM Studio sin pasos manuales de conversión. El autor remarca una particularidad poco habitual: el modelo fue entrenado sobre texto de prompt en bruto, por lo que se degrada de forma medible si se le aplica la plantilla de chat habitual de Qwen (`<|im_start|>…<|im_end|>`); el repositorio incluye ficheros `template` y `params` para forzar el comportamiento correcto.

El repositorio tiene, en el momento de la consulta, 0 descargas y 0 "likes", y su campo de licencia aparece como no disponible en los metadatos de HuggingFace, aunque la model card indica que los pesos derivan de un modelo base con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5-Coder), densa |
| Parametros totales | 14.770.033.664 (aproximadamente 14,77 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens, segun el fichero `params` publicado por el autor (`num_ctx` 16384); la longitud nativa del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repositorio) |
| Idiomas soportados | Ingles (`en`), segun los metadatos del repositorio |
| Licencia | Campo de licencia no disponible en HuggingFace; la model card indica que los pesos son derivados de `BlossomsAI/Qwen2.5-Coder-14B-Instruct-Uncensored`, con licencia MIT, y siguen los terminos del modelo base |
| Formato de pesos | GGUF (fichero `Qwen2.5-Coder-14B-Instruct-Uncensored.R20.Q4_K_M.gguf`) |
| Tamano del fichero | 8.988.110.688 bytes (8,4 GiB); el repositorio ocupa 9,0 GB |
| Hash SHA-256 | 27b12082b0ec01e31ec0161d75131ed32278fbbda643c433ab5f12bc3dcac4fc |
| Modelo base | BlossomsAI/Qwen2.5-Coder-14B-Instruct-Uncensored |
| Modelo original de la cadena | Qwen/Qwen2.5-Coder-14B-Instruct |
| Ajuste adicional | Rondas LoRA del proyecto VACA, fusionadas a 16 bits antes de cuantizar |
| Parametros de muestreo recomendados | `temperature` 0,7; `top_p` 0,9; `num_ctx` 16384 |
| Plantilla de prompt | `{{ .Prompt }}` (texto en bruto, sin plantilla de chat) |
| Autor | StevenWoods |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

No se proporciona en la informacion disponible el desglose de capas, dimensiones de atencion, numero de cabezas ni el volumen de tokens de entrenamiento. Lo que si se documenta es la cadena de construccion: se parte de `Qwen/Qwen2.5-Coder-14B-Instruct`, se aplica encima un ajuste de instrucciones sin censura que da lugar a `BlossomsAI/Qwen2.5-Coder-14B-Instruct-Uncensored`, y sobre ese checkpoint se ejecutan las rondas LoRA del proyecto VACA. Esas rondas se fusionan en precision de 16 bits sobre los pesos base y el resultado se cuantiza despues a `Q4_K_M` para producir el GGUF publicado. No se especifica si hubo RLHF, DPO u otra etapa de alineacion adicional en este ultimo ajuste.

La innovacion tecnica destacable no esta en la arquitectura, sino en el contrato de uso: el modelo fue ajustado sobre texto de prompt en bruto. El autor insiste en que envolver la entrada en la plantilla de chat convencional lo lleva fuera de distribucion y degrada la calidad de forma medible, por lo que el repositorio incluye un fichero `template` con `{{ .Prompt }}` que sobrescribe la plantilla autodetectada por Ollama a partir de los metadatos del GGUF, y un fichero `params` con los ajustes de muestreo evaluados. Los tres ficheros (`template`, `params` y el GGUF) deben conservarse juntos: si el runtime ignora alguno, el comportamiento cambia de forma silenciosa.

## Capacidades

- Generacion de texto conversacional y de codigo, heredadas de la familia Qwen2.5-Coder.
- Ajuste orientado a instrucciones: el checkpoint intermedio es un modelo "Instruct", por lo que responde a peticiones directas.
- Variante sin censura: el modelo base declara la ausencia de filtros de rechazo, lo que amplia el rango de peticiones que atiende.
- Uso como arquitecto de codigo dentro de la aplicacion VACA, para la que fue ajustado especificamente.
- Conversacion multi-turno dentro de una misma sesion, con hasta 16.384 tokens de contexto si se respeta el `num_ctx` recomendado.
- Capacidad de tool calling / function calling: no documentada en la informacion disponible para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible para este ajuste.
- Modo "thinking" explicito, vision o audio: no documentado; el repositorio solo declara `text-generation`.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no hay evidencia publicada de rendimiento en castellano.

## Casos de uso

- Asistencia de codigo en local sobre hardware de gama alta de consumo: con 8,4 GiB de pesos en `Q4_K_M` y unos 10 GB de VRAM recomendados, se puede ejecutar con Ollama mediante `ollama run hf.co/StevenWoods/veronica-r20-q4-GGUF` sin conexion a servicios externos, lo que evita enviar codigo propietario fuera de la maquina.
- Generacion de codigo en entornos air-gapped: el repositorio es un GGUF plano que se carga directamente en llama.cpp o LM Studio, por lo que puede desplegarse en redes aisladas donde no se permite descargar pesos desde la nube en tiempo de ejecucion.
- Revision y explicacion de codigo heredado: con 16.384 tokens de contexto se puede pegar un modulo completo o varios ficheros pequenos y pedir resumen, deteccion de errores o propuesta de refactorizacion en una sola pasada.
- Generacion de pruebas unitarias y documentacion: el modelo puede recibir una funcion y producir casos de prueba o cadenas de documentacion; al ser una variante sin censura no aplica rechazos por tematica sobre el codigo analizado.
- Migracion entre lenguajes o frameworks: traduccion de fragmentos de un lenguaje a otro y adaptacion de APIs, con la salvedad de que el contexto util se limita a lo que quepa en la ventana configurada.
- Base para ajustes propios: al publicarse como GGUF cuantizado y derivar de un modelo MIT, sirve como punto de partida reproducible para experimentos de generacion de codigo que requieran un modelo sin filtros de contenido.
- Integracion en una interfaz de chat tecnica dentro del IDE: manteniendo la plantilla `{{ .Prompt }}` y los parametros de muestreo documentados, se comporta como un asistente conversacional de codigo de 14B ejecutado en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para esta cuantizacion ni para los checkpoints intermedios de la cadena. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB para el modelo en `Q4_K_M`, segun indica el propio autor. El fichero de pesos ocupa 8,4 GiB, a lo que se suma la cache KV, que crece con `num_ctx` y que a 16.384 tokens es mas costosa que con el valor por defecto.
- Ejecucion en CPU: posible, pero lenta segun la model card; es una opcion de ultimo recurso, no de uso interactivo.
- GPU de consumo compatibles: tarjetas con 12 GB o mas de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 de 12 GB), y con mayor holgura modelos de 16 GB o mas (RTX 4080, RTX 4090), donde cabe el modelo y una cache KV amplia.
- GPU de centro de datos: cualquier acelerador con 16 GB o mas, como L4, A10G, A100 o H100; en estos casos el modelo ocupa una fraccion minima de la memoria y el limite practico pasa a ser el throughput de batches concurrentes.
- Opciones de despliegue: Ollama (via `hf.co/StevenWoods/veronica-r20-q4-GGUF`), llama.cpp y LM Studio, todos mencionados en la model card. El repositorio solo contiene GGUF, por lo que para servir con vLLM o TGI habria que partir del modelo base en otro formato, no incluido aqui.
- Latencia y throughput estimados: no disponible.
- Advertencia de despliegue: si se sirve con Ollama, hay que conservar los ficheros `template` y `params` del repositorio; sustituir `template` por la plantilla de chat nativa de Qwen degrada la calidad de forma medible segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Notas |
|---|---|---|---|---|---|
| StevenWoods/veronica-r20-q4-GGUF | 14,77 mil millones | 16.384 tokens (configuracion recomendada por el autor) | GGUF Q4_K_M | Campo HF no disponible; segun la model card, terminos MIT heredados del base | Incluye plantilla de texto en bruto y parametros de muestreo; 0 descargas y 0 likes en el momento de la consulta |
| BlossomsAI/Qwen2.5-Coder-14B-Instruct-Uncensored | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | MIT, segun la model card del modelo derivado | Es el checkpoint base directo de esta cuantizacion |
| Qwen/Qwen2.5-Coder-14B-Instruct | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Origen de la cadena de ajustes, citado en la model card |

No se dispone de datos de rendimiento comparado entre estos tres modelos, por lo que no es posible establecer cual es superior en tareas concretas a partir de la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al tratarse de un ajuste "uncensored" sobre un modelo de codigo, cabe esperar una menor tasa de rechazos, pero no hay evaluacion publicada de sesgos.
- Riesgo de alucinacion: no cuantificado por el autor. En generacion de codigo, el riesgo tipico es la invencion de APIs, funciones o dependencias inexistentes; la model card recomienda verificar todo lo generado antes de llevarlo a produccion.
- El autor declara explicitamente que no ofrece garantia alguna y que hay que comprobar el contenido generado antes de publicarlo o desplegarlo.
- Limitacion de idioma: los metadatos solo declaran ingles (`en`); no hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Sensibilidad a la plantilla: aplicar la plantilla de chat estandar de Qwen en lugar de `{{ .Prompt }}` lleva al modelo fuera de distribucion y degrada los resultados. Es un fallo de integracion facil de cometer y dificil de detectar.
- Restricciones de licencia: el campo de licencia del repositorio figura como no disponible. La model card sostiene que los pesos siguen los terminos MIT del modelo base, pero conviene verificar esa condicion con el publicador antes de un uso comercial.
- La aplicacion VACA que acompana al modelo es propietaria y su licencia es independiente de la de los pesos; el uso del modelo no otorga derechos sobre la aplicacion ni al contrario.
- Cadena de derivacion larga: hay tres niveles (Qwen, ajuste sin censura, LoRA VACA) sin evaluacion publicada en ningun punto, lo que dificulta atribuir cualquier comportamiento a una etapa concreta.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion de terceros documentada.
- No se recomienda su uso como unico modelo en tareas que requieran tool calling, agentes o razonamiento multi-paso, ya que esas capacidades no estan documentadas para este ajuste.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/StevenWoods/veronica-r20-q4-GGUF
- Modelo base del ajuste: https://huggingface.co/BlossomsAI/Qwen2.5-Coder-14B-Instruct-Uncensored
- Modelo original de la cadena: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio de la aplicacion VACA (Veronica): https://github.com/Demorolled/VACA
- Ejecucion directa con Ollama: `ollama run hf.co/StevenWoods/veronica-r20-q4-GGUF`
