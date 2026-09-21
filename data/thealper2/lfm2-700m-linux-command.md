# thealper2/lfm2-700m-linux-command

## Resumen

`thealper2/lfm2-700m-linux-command` es un ajuste fino completo de `LiquidAI/LFM2-700M` orientado a una tarea muy concreta: traducir una instruccion de Linux en lenguaje natural a un unico comando de shell. La salida objetivo es exclusivamente el comando, sin explicacion ni texto adicional. El autor es el usuario de HuggingFace `thealper2` y el modelo se publico con licencia LFM 1.0, esta etiquetado solo para ingles y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

El modelo parte de la arquitectura LFM2, un transformer hibrido de 16 capas que combina atencion completa en las capas 2, 5, 8, 10, 12 y 14 con convoluciones cortas con compuerta en el resto. El checkpoint final tiene 742.489.344 parametros totales (641.826.048 sin contar embeddings), hidden size de 1536, 24 cabezas de atencion y 8 cabezas KV. El modelo base declara una longitud de contexto de 128.000 tokens, aunque el ajuste fino se realizo con una longitud maxima de secuencia de 128 tokens.

Su relevancia es practica: convierte un modelo base de proposito general en un generador determinista de comandos con una tasa de validez sintactica del 99,39% y una tasa de salida en prosa del 0% en el conjunto de test, frenta al 47,63% de validez y el 37,83% de prosa del modelo base. Es, por tanto, un ejemplo de especializacion estrecha sobre un modelo pequeno que cabe en una GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm2ForCausalLM`, hibrida: 16 capas, atencion completa en `[2, 5, 8, 10, 12, 14]` y convolucion corta con compuerta en el resto |
| Parametros totales | 742.489.344 (641.826.048 sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el ajuste fino uso una longitud maxima de 128 tokens |
| Tipos de cuantizacion | No disponible en el repositorio; solo se publican pesos en bfloat16 (safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `lfm1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | Safetensors, via `transformers` |
| Hidden size / cabezas / cabezas KV | 1536 / 24 / 8 |
| Vocabulario | 65.536 |
| Precaucion de entrenamiento | bfloat16 |
| Metodo de ajuste | Full fine-tuning (no LoRA) |
| Tamano del repositorio | 1,5 GB |
| Tokens especiales | BOS `<|startoftext|>` (1), EOS `<|im_end|>` (7), PAD `<|pad|>` (0) |
| Plantilla de chat | ChatML estilo LFM2, entrenado sin system prompt |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base LFM2-700M: un transformer hibrido con 16 capas en el que solo seis capas usan atencion completa y las diez restantes emplean convoluciones cortas con compuerta. Esta mezcla reduce el coste de atencion a contextos largos, aunque el ajuste fino se haya hecho con secuencias muy cortas. El modelo se entreno en precision bfloat16 con el metodo `full`, 3 epocas, learning rate 3e-05, scheduler coseno, warmup ratio 0,03, weight decay 0,01, optimizador `adamw_torch_fused`, batch por dispositivo 16 y acumulacion de gradientes 2. La perdida se calcula unicamente sobre el turno del asistente, enmascarando los tokens del prompt con `-100`. La semilla fue 42.

Los datos de entrenamiento provienen de dos conjuntos: `jiacheng-ye/nl2bash` (9.305 filas, esquema `nl`/`bash`) y `mecha-org/linux-command-dataset` (8.669 filas, esquema `input`/`output`). Ambos se normalizaron a `{instruction, command, source}` y se limpiaron (eliminacion de fences de Markdown, prefijos `$`/`#`, colapso de espacios fuera de comillas y descarte de registros con comillas desbalanceadas o sin utilidad parseable; los comandos en si nunca se reescribieron). Se deduplicaron pares exactos `(instruction, command)`, se mantuvieron deliberadamente las filas con el mismo comando y distinta instruccion, y se rebalanceo el corpus: `find` representaba el 35,2% del material bruto y se limito a aproximadamente el 19% mediante un ordenamiento que prioriza firmas de flags distintas. El split 90/5/5 se agrupo por plantilla de instruccion para evitar filtraciones: 11.756 de entrenamiento, 652 de validacion y 653 de test, con cero solapamiento declarado a nivel de par exacto, instruccion y plantilla.

El presupuesto de 128 tokens se fijo a partir de la distribucion de longitudes tokenizadas del corpus (media 37,7; mediana 34; p90 57; p95 66; p99 87; maximo 403), que cubre el 99,94% de los ejemplos. La ejecucion registro una perdida final de entrenamiento de 0,516, perdida de validacion de 0,6445, 425 segundos de entrenamiento, 8,95 GB de VRAM maxima y una GPU NVIDIA GeForce RTX 5060 Ti, con torch 2.11.0+cu128 y transformers 5.17.0.

## Capacidades

- Generacion de un unico comando de shell a partir de una instruccion en lenguaje natural en ingles (por ejemplo, "Find which process is using port 8080." produce `lsof -i :8080`).
- Salida limpia de comando: el modelo no genera explicaciones ni prosa, con una tasa de prosa del 0% en el conjunto de test medido por el autor.
- Cobertura amplia de utilidades de Linux, con precision de utilidad primaria del 83,77% en test.
- Decodificacion determinista con `do_sample=False`, que es la configuracion prevista por el autor.
- Conversacion de un solo turno mediante la plantilla ChatML de LFM2, con soporte de `apply_chat_template`.
- No dispone de soporte declarado de tool calling ni function calling.
- No dispone de soporte declarado de agentes ni de razonamiento multi-paso.
- No dispone de capacidades de vision ni de audio.
- Multilingue: solo ingles; no hay evidencia de soporte de otros idiomas.
- No tiene modo de pensamiento (thinking mode) ni salida de cadena de razonamiento.

## Casos de uso

- Asistente de terminal interactivo: el modelo traduce una peticion en lenguaje natural a un comando ejecutable, lo que permite ofrecer una capa de ayuda en CLI donde el usuario describe la tarea y recibe el comando listo para pegar. Su validez sintactica del 99,39% reduce la necesidad de validacion manual.
- Generacion de comandos en scripts de aprovisionamiento: dado un conjunto de tareas descritas en lenguaje natural, se pueden producir comandos individuales para tareas de gestion de ficheros, permisos, procesos o red que despues un humano revisa antes de incorporarlos a un playbook.
- Busqueda inversa en documentacion interna: a partir de una descripcion funcional, el modelo sugiere la utilidad de Linux adecuada, lo que sirve como capa de recomendacion en portales de documentacion tecnica. La precision de utilidad primaria del 83,77% es suficiente para filtrar candidatos antes de la revision humana.
- Preprocesado en pipelines de automatizacion: el modelo actua como primer paso que convierte lenguaje natural en un comando candidato que luego se valida con un analizador estatico o un sandbox antes de ejecutarse.
- Formacion y onboarding: generar el comando equivalente a una tarea descrita por un usuario novel permite explicar en la propia terminal que herramienta resuelve el problema, aprovechando que la salida es un unico comando sin ruido textual.
- Generacion de datos sinteticos para otros sistemas: al ser determinista y barato de ejecutar, puede usarse para producir pares instruccion-comando a gran escala a partir de descripciones plantilla, que despues se filtran por validez.
- Integracion en editores y plugins de IDE: como complemento de un panel de terminal integrado, permite al desarrollador describir la operacion deseada y obtener el comando sin salir del editor, dado el bajo coste de inferencia de un modelo de 742 millones de parametros.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre el conjunto de test reservado con decodificacion greedy, comparando el modelo base con el ajustado:

| Metrica | LFM2-700M base | Fine-tuned | Delta |
|---|---|---|---|
| Exact match | 0,0061 | 0,2910 | +0,2849 |
| Normalised exact match | 0,0061 | 0,2910 | +0,2849 |
| Structural match | 0,0107 | 0,3032 | +0,2925 |
| Command validity | 0,4763 | 0,9939 | +0,5176 |
| Token F1 | 0,1195 | 0,6470 | +0,5275 |
| Primary-utility accuracy | 0,1807 | 0,8377 | +0,6570 |
| Prose-output rate | 0,3783 | 0,0000 | -0,3783 |

Definiciones aportadas por el autor: exact match es igualdad de cadena tras eliminar espacios exteriores; normalised exact match es igualdad tras colapsar espacios fuera de comillas y quitar un `;` final; structural match compara utilidad y multiset de flags (la definicion completa queda truncada en la informacion disponible); command validity, token F1, primary-utility accuracy y prose-output rate aparecen con sus valores pero sin definicion completa en el material proporcionado.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Estas cifras son autoevaluadas por el autor sobre su propio split de test y no han sido replicadas por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,5 GB solo para pesos, calculado a partir de los 742.489.344 parametros (2 bytes por parametro). Esta cifra es una estimacion derivada, no un dato publicado.
- VRAM estimada en float32: aproximadamente 3,0 GB solo para pesos. Estimacion derivada.
- Cache KV en las seis capas de atencion completa: con 8 cabezas KV y dimension de cabeza de 64, el coste es de unos 2 KB por token y capa, es decir, del orden de 12 KB por token en total, aproximadamente 1,5 GB con 128.000 tokens de contexto. Estimacion derivada, no publicada.
- Entrenamiento: el autor reporta 8,95 GB de VRAM maxima en una NVIDIA GeForce RTX 5060 Ti con batch 16, acumulacion 2 y secuencias de 128 tokens.
- GPU de consumo: cabe holgadamente en GPU de consumo con 8 GB o mas en bfloat16 para inferencia con contextos cortos, que es el regimen para el que fue entrenado. Se ha verificado entrenamiento e inferencia en una RTX 5060 Ti.
- GPU de datacenter: no se requieren A100, H100 ni similares; el modelo es de 742 millones de parametros.
- Opciones de despliegue: el repositorio se publica exclusivamente en safetensors para `transformers`, con `AutoModelForCausalLM` y `AutoTokenizer`. No se publican pesos GGUF ni cuantizaciones, por lo que el uso con llama.cpp, Ollama o similares requeriria una conversion propia no documentada por el autor. No se menciona compatibilidad con vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no publicados. El unico dato temporal disponible es el de entrenamiento: 425 segundos para 3 epocas sobre 11.756 ejemplos.
- Aviso de tokenizador relevante para el despliegue: la plantilla de chat emite el `bos_token` por si misma y `add_bos_token` es `true` en `tokenizer_config.json`, por lo que hay que tokenizar el texto ya planteado con `add_special_tokens=False` para evitar un BOS duplicado. Ademas, hay que decodificar con `clean_up_tokenization_spaces=False`, porque el paso de limpieza BPE elimina espacios alrededor de la puntuacion y puede corromper comandos de shell.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el modelo ajustado con su propio modelo base. No se han identificado en el material proporcionado otros ajustes comparables de traduccion de lenguaje natural a comandos de shell con especificaciones verificables.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thealper2/lfm2-700m-linux-command` | 742.489.344 | 128.000 en base; ajustado a 128 tokens de secuencia | NL a comando de shell, salida unica | `lfm1.0` | HuggingFace, safetensors, 0 descargas |
| `LiquidAI/LFM2-700M` | No disponible en la informacion proporcionada | 128.000 | Generacion de texto de proposito general | `lfm1.0` | HuggingFace (modelo base) |
| Otros modelos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La diferencia funcional medible entre ambos es la de la tabla de benchmarks: el ajuste eleva el exact match de 0,0061 a 0,2910, la validez de comando de 0,4763 a 0,9939 y elimina por completo la salida en prosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo en la model card. El corpus de entrenamiento esta sesgado hacia un subconjunto de utilidades de Linux, con `find` rebalanceado pero aun en torno al 19% del material, lo que puede sobrerrepresentar ciertos patrones de uso.
- Riesgo de alucinacion: aunque la validez sintactica de los comandos es muy alta (0,9939), un comando valido no implica que sea el correcto o seguro. El exact match es de solo 0,2910, de modo que en la mayoria de casos la salida no coincide exactamente con la referencia. Cualquier ejecucion automatizada deberia pasar por validacion y sandbox.
- Ausencia de explicaciones: el modelo no genera justificacion alguna, lo que complica la verificacion por parte del usuario y la depuracion de errores.
- Alcance de tarea muy estrecho: solo produce un comando por instruccion. No maneja pipelines multi-paso, scripting complejo, encadenamiento de ordenes ni razonamiento sobre el estado del sistema.
- Limitacion de contexto practico: aunque el modelo base declara 128.000 tokens, el ajuste fino se hizo con `max_sequence_length` de 128, por lo que el comportamiento fiable esta acotado a prompts y respuestas muy cortos, coherentes con la distribucion del corpus (p99 de 87 tokens, maximo de 403).
- Idioma: entrenado y etiquetado unicamente en ingles. No hay evidencia de funcionamiento correcto con instrucciones en castellano u otros idiomas.
- Datos de entrenamiento limitados: solo 11.756 ejemplos de entrenamiento procedentes de dos conjuntos publicos, lo que restringe la diversidad de utilidades y de variantes de sintaxis cubiertas.
- Restricciones de licencia: la licencia es `lfm1.0` (etiquetada como `other` en HuggingFace), la misma del modelo base. Es imprescindible revisar el texto completo en el enlace de licencia antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- Validacion insuficiente por terceros: 0 descargas y 0 likes, y todas las metricas son autoevaluadas por el autor sobre su propio split de test. No hay replicacion independiente.
- Caveat de integracion: los pesos solo se publican en bfloat16 y safetensors. No hay GGUF ni cuantizaciones listas, lo que obliga a trabajo adicional para desplegar en entornos de bajos recursos basados en llama.cpp u Ollama.
- Caveat de tokenizacion en produccion: si no se aplican las dos precauciones del tokenizador (BOS duplicado y `clean_up_tokenization_spaces=False`), los comandos generados pueden corromperse por espacios eliminados alrededor de la puntuacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/lfm2-700m-linux-command
- Modelo base: https://huggingface.co/LiquidAI/LFM2-700M
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM2-700M/blob/main/LICENSE
- Dataset `jiacheng-ye/nl2bash`: https://huggingface.co/datasets/jiacheng-ye/nl2bash
- Dataset `mecha-org/linux-command-dataset`: https://huggingface.co/datasets/mecha-org/linux-command-dataset

Nota: los resultados de busqueda web devueltos no contenian informacion relevante sobre el modelo (contenido de inicio de sesion de Microsoft OneDrive), por lo que no se han podido incorporar papers, blogs ni demos adicionales.
