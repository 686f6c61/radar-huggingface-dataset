# theanupdas/Altworld_Hemmingway-1-GGUF

## Resumen

Altworld Hemmingway-1 GGUF es una distribucion cuantizada del modelo Altworld/Hemmingway-1, un modelo de generacion de texto de aproximadamente 27.320.697.856 parametros (unos 27,3 B) orientado a chat y escritura creativa. El repositorio analizado esta publicado por el usuario theanupdas, aunque la model card indica que la cuantizacion original fue realizada por bartowski con llama.cpp (release b10964) y etiqueta al modelo base Altworld/Hemmingway-1 como origen. Se distribuye bajo licencia Apache 2.0 y esta declarado unicamente para ingles.

El interes practico de esta publicacion es que pone el modelo a disposicion en formato GGUF con un catalogo amplio de cuantizaciones (desde bf16 de 54,66 GB hasta IQ3_XXS), lo que permite ejecutarlo en hardware de consumo y en entornos sin GPU dedicada mediante llama.cpp y sus derivados. Ademas, la model card declara soporte de decodificacion especulativa mediante MTP (multi-token prediction) y cuantizacion con imatrix, dos caracteristicas que afectan directamente a la latencia y a la calidad de los pesos comprimidos.

No se dispone de informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base. El tag "qwen3.8" presente en la model card sugiere una ascendencia de la familia Qwen, pero este extremo no se confirma en la documentacion proporcionada, por lo que debe tratarse como indicio y no como dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el tag "qwen3.8" sugiere ascendencia Qwen; sin confirmar en la model card) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No aplica / no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, IQ3_M, IQ3_XS, IQ3_XXS, Q3_K_L, Q3_K_M, Q3_K_S (listado truncado en la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp b10964); el modelo base se publica en safetensors/BF16 |
| Decodificacion especulativa | Si, mediante MTP (multi-token prediction) segun la model card |
| Cuantizacion con imatrix | Si |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Altworld/Hemmingway-1: no se especifica si se trata de un transformer denso, un MoE o un modelo hibrido, ni el numero de capas, cabezas de atencion o dimension del estado oculto. El unico indicio es el tag "qwen3.8" de la model card, que apunta a una posible derivacion de la familia Qwen, y la etiqueta "creative-writing", que situa el ajuste del modelo en el terreno de la generacion literaria y conversacional. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otra forma de alineacion.

Lo que si esta documentado es la cadena de cuantizacion: los pesos se comprimieron con llama.cpp en su release b10964, con soporte de imatrix (calibracion basada en matrices de importancia para preservar los pesos mas sensibles) y con decodificacion especulativa habilitada via MTP. El formato de prompt es ChatML, con etiquetas `<|im_start|>` y `<|im_end|>`, un mensaje de sistema que fija el esfuerzo de razonamiento ("Reasoning effort is set to xhigh") y una apertura explicita del bloque `<think>` antes de la respuesta del asistente. El modelo parece, por tanto, operar en modo de razonamiento explicito antes de emitir la respuesta final.

## Capacidades

- Generacion de texto conversacional y de estilo literario, con etiqueta explicita de "creative-writing" en la model card.
- Chat multi-turno con formato de prompt ChatML y mensaje de sistema configurable.
- Razonamiento explicito en modo "thinking": el prompt oficial abre un bloque `<think>` y el mensaje de sistema admite ajuste del esfuerzo de razonamiento (xhigh en el ejemplo publicado).
- Escritura creativa en ingles: ficcion, prosa narrativa, dialogos y estilizacion.
- Decodificacion especulativa con MTP, orientada a reducir latencia en inferencia con llama.cpp.
- Ejecucion local en CPU, GPU o configuraciones mixtas gracias al formato GGUF.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas declarado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; la model card indica que la entrada es solo texto.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente, aunque el modo de razonamiento con `<think>` es compatible con cadenas de razonamiento largas.

## Casos de uso

- Asistente de escritura creativa en local: un novelista puede desplegar la cuantizacion Q4_K_M (17,44 GB) en una estacion de trabajo con una RTX 4090 y trabajar sin conexion, con la ventaja de que el texto generado nunca sale del equipo.
- Chat conversacional de proposito general en ingles: el formato ChatML con mensaje de sistema permite fijar un personaje o una politica de respuesta estable, adecuado para prototipos de asistentes y pruebas de producto.
- Generacion de ficcion interactiva para videojuegos: el modo de razonamiento explicito y el ajuste en escritura permiten generar respuestas de NPC coherentes con un trasfondo narrativo definido en el mensaje de sistema.
- Creacion de datos sinteticos para ajuste fino: se puede usar el modelo para generar corpus de texto narrativo o dialogos que despues alimenten un entrenamiento supervisado, con control del tono mediante el system prompt.
- Edicion y reescritura estilistica: dado un fragmento, el modelo puede reescribirlo imitando un registro concreto (prosa sobria estilo Hemingway, por ejemplo), util en equipos editoriales y de marketing de contenidos en ingles.
- Sistema de respuesta aumentada por recuperacion (RAG) para bases documentales en ingles: el modelo puede recibir contexto recuperado en el prompt y redactar respuestas sintetizadas, siempre que el contexto disponible quepa en la ventana del modelo, dato no publicado.
- Prototipado e investigacion de cuantizacion: la coleccion de cuantizaciones (de IQ3_XXS a Q8_0) permite estudiar la degradacion de calidad frente al tamano en un mismo modelo, un caso de uso habitual en evaluacion de tecnicas de compresion con imatrix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el repositorio no aporta comparaciones cuantitativas frente a modelos alternativos.

## Requisitos de hardware

La siguiente tabla recoge el tamano real de cada archivo publicado y una estimacion de VRAM necesaria para inferencia. La estimacion de VRAM se deriva del tamano del archivo mas el espacio de la cache KV y el overhead del runtime, por lo que debe considerarse orientativa y no una medicion publicada.

| Cuantizacion | Tamano de archivo | VRAM estimada (inferencia) | Notas |
|---|---|---|---|
| bf16 | 54,66 GB (dividido en fragmentos) | ~60 GB o mas | A100/H100 de 80 GB; no cabe en GPU de consumo |
| Q8_0 | 29,12 GB | ~32-34 GB | A100 40 GB, 2x RTX 4090 en paralelo |
| Q6_K_L | 24,96 GB | ~28-30 GB | Requiere mas de 24 GB de VRAM |
| Q6_K | 23,86 GB | ~27-29 GB | Al limite en RTX 3090/4090 con contexto corto |
| Q5_K_M | 20,92 GB | ~24-25 GB | Ajustado en RTX 3090/4090 de 24 GB |
| Q4_K_M | 17,44 GB | ~20-22 GB | Cuantizacion recomendada por el autor; cabe en RTX 4090 |
| Q4_K_S | 16,36 GB | ~19-20 GB | Alternativa algo mas ligera que Q4_K_M |
| IQ4_XS | 15,48 GB | ~18 GB | Equilibrio entre tamano y calidad |
| Q3_K_M | 13,40 GB | ~16 GB | Util para GPU de 16 GB o RAM de 16 GB |
| IQ3_XS | 12,80 GB | ~15 GB | Alternativa para equipos muy limitados |
| Q3_K_S | 12,74 GB | ~15 GB | El propio autor lo marca como no recomendado |

- Cabe en GPU de consumo: si, en las cuantizaciones de Q4 y Q3. Las variantes de 16-18 GB entran en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090) y las de 12-14 GB en GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) o incluso en CPU con RAM suficiente.
- GPU recomendadas: para las cuantizaciones altas (bf16, Q8_0, Q6) se necesitan A100 80 GB, H100 80 GB o configuraciones multi-GPU; para Q4_K_M y Q3, una RTX 4090 o RTX 3090 es suficiente.
- Despliegue: el formato GGUF es compatible de forma nativa con llama.cpp, Ollama, LM Studio, koboldcpp, Jan y llama-cpp-python. El soporte en vLLM para GGUF existe pero es experimental, por lo que en produccion suele preferirse llama.cpp o un servidor construido sobre el.
- Decodificacion especulativa: la model card declara soporte de MTP, lo que puede reducir la latencia por token en llama.cpp, aunque no se publican cifras de tokens por segundo.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad para este repositorio.
- Almacenamiento: el repositorio completo ocupa 444,9 GB, por lo que conviene descargar unicamente el archivo de la cuantizacion deseada.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada: no se conocen el contexto, los benchmarks ni el proceso de entrenamiento del modelo base, por lo que cualquier comparacion con alternativas de la misma categoria seria especulativa. Como referencia interna si se pueden comparar las distintas cuantizaciones del mismo modelo, un dato objetivo y util para decidir el despliegue:

| Version | Tamano | Uso recomendado segun el autor |
|---|---|---|
| bf16 | 54,66 GB | Referencia de maxima calidad, requiere hardware de datacenter |
| Q8_0 | 29,12 GB | Calidad muy alta, "generalmente innecesaria" segun la model card |
| Q6_K | 23,86 GB | Calidad muy alta, practicamente sin perdida |
| Q5_K_M | 20,92 GB | Calidad alta, recomendada |
| Q4_K_M | 17,44 GB | Opcion por defecto, equilibrio entre tamano y rendimiento |
| Q4_K_S / IQ4_XS | 16,36 / 15,48 GB | Ahorro de espacio con perdida moderada |
| Q3_K_M / IQ3_XS | 13,40 / 12,80 GB | Equipos con poca memoria o VRAM |

## Limitaciones y advertencias

- Idiomas: solo ingles declarado. El uso en castellano no esta soportado de forma oficial y previsiblemente ofrecera una calidad inferior.
- Longitud de contexto desconocida: sin este dato no es posible dimensionar la cache KV ni garantizar el comportamiento en conversaciones largas o en RAG con documentos extensos.
- Riesgo de alucinacion: es un modelo de generacion de texto sin datos publicados de evaluacion; en tareas factuales o con requisitos de verificabilidad debe validarse la salida.
- Sin benchmarks ni evaluaciones publicas: no hay evidencia cuantitativa de calidad, lo que dificulta justificar su uso en produccion frente a alternativas documentadas.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 "likes" en el repositorio analizado, sin senales de validacion por parte de la comunidad.
- Discrepancia de autoria: el repositorio esta publicado por theanupdas, mientras que la model card atribuye la cuantizacion a bartowski. Conviene verificar la procedencia de los archivos antes de desplegarlos en un entorno de produccion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Al ser una obra derivada, conviene comprobar tambien las condiciones del modelo base Altworld/Hemmingway-1 antes de redistribuir.
- Trazabilidad limitada del entrenamiento: al no documentarse dataset ni alineacion, no es posible evaluar sesgos conocidos ni riesgos de fuga de datos de entrenamiento.
- Cuantizaciones de baja precision: por debajo de Q4 la propia model card advierte de perdida de calidad; Q3_K_S se marca explicitamente como no recomendada.
- Modo de razonamiento: el prompt oficial exige abrir un bloque `<think>`, de modo que las integraciones deben respetar ese formato para obtener un comportamiento correcto.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/theanupdas/Altworld_Hemmingway-1-GGUF
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Repositorio de cuantizaciones de bartowski: https://huggingface.co/bartowski/Altworld_Hemmingway-1-GGUF
- Archivo Q4_K_M recomendado: https://huggingface.co/bartowski/Altworld_Hemmingway-1-GGUF/blob/main/Altworld_Hemmingway-1-Q4_K_M.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp utilizada para la cuantizacion (b10964): https://github.com/ggml-org/llama.cpp/releases/tag/b10964
