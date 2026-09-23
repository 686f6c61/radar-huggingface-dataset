# zomasec/Qwen3.8-27B-Uncensored-teeled

## Resumen

zomasec/Qwen3.8-27B-Uncensored-teeled es una copia de inferencia en formato GGUF publicada por CyInnove (cuenta de HuggingFace `zomasec`) sobre el modelo Qwen3.8-27B. No se trata de un entrenamiento propio: los pesos son un clon byte a byte de la release GGUF de DavidAU (Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP), que a su vez cuantiza el fine-tune NM-DAU sobre el Qwen/Qwen3.8-27B original. La model card es explícita: no se ha aplicado ningún dataset de CyInnove y el repositorio se declara como línea base congelada hasta que exista un fine-tune propio.

El modelo subyacente es un transformer híbrido de atención (Gated DeltaNet lineal combinada con atención completa) de aproximadamente 27B parámetros densos, multimodal nativo (image-text-to-text), con capacidades de razonamiento, tool calling y una cabeza MTP (multi-token prediction) para decodificación especulativa. Soporta inglés y chino, con una ventana de contexto declarada por fuentes de terceros de 262.144 tokens y un vocabulario de 248.320 entradas. La variante aquí publicada es una build "abliterated" (alineamiento de seguridad eliminado), lo que la sitúa en el terreno de la investigación en seguridad e interpretabilidad más que en el de producto comercial directo.

Su relevancia ahora es doble: por un lado, ofrece una vía práctica de ejecución local en llama.cpp/Ollama con 19 cuantizaciones GGUF distintas (de 11,7 GB a 30,2 GB) y proyectores de visión separados; por otro, sirve como referencia de un flujo de trabajo cada vez más habitual: fine-tune comunitario, cuantización con imatrix, clonado por terceros y redistribución bajo la misma licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (vision-lenguaje) con atencion lineal Gated DeltaNet + atencion completa; familia `qwen3_5`, clase `AutoModelForMultimodalLM` |
| Parametros totales | 26.895.998.464 (~26,9B) segun safetensors; la model card upstream cita ~27,8B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (segun listado de terceros); el ejemplo de la model card usa 8.192 |
| Tipos de cuantizacion | GGUF: IQ2_M, IQ3_M, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 en tres familias (Standard, MTP y Low MTP); cuantizacion con imatrix |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | apache-2.0 (heredada de la release upstream) |
| Formato de pesos | GGUF (texto) + proyectores de vision `mmproj-F16.gguf` (928 MB), `mmproj-BF16.gguf` (931 MB) y `mmproj-F32.gguf` (1,8 GB); el checkpoint de entrenamiento esta en safetensors en el repo upstream NM-DAU |

Tamano del repositorio: 389,0 GB (incluye todas las variantes de cuantizacion y los tres proyectores de vision).

## Arquitectura y entrenamiento

La arquitectura de partida es el Qwen3.8-27B de Qwen: un modelo denso de aproximadamente 27B parametros con atencion hibrida, en la que bloques de atencion lineal Gated DeltaNet se combinan con bloques de atencion completa. Esta mezcla busca reducir el coste de memoria y computo en contextos largos manteniendo la calidad de recuperacion de la atencion clasica. El modelo incorpora vision nativa (entrada image-text-to-text) mediante proyectores multimodales que en esta release se distribuyen como ficheros `mmproj-*.gguf` independientes, y una cabeza MTP que permite decodificacion especulativa con un coste adicional de pocos cientos de MB por cuantizacion (la diferencia entre la familia Standard y la MTP es de unos 0,4-0,5 GB por fichero).

Sobre el entrenamiento de esta release concreta no hay informacion detallada en la documentacion disponible. Lo que si se documenta es la cadena de procedencia: Qwen/Qwen3.8-27B (modelo base) da lugar al fine-tune NM-DAU de DavidAU, que a su vez es cuantizado en el repo TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP con cuantizacion asistida por importancia matrix. La model card upstream menciona colaboradores (Nightmedia, TeichAI, armand0e, trohrbaugh, nbeerbower) y datasets con nombre Polar-STRICT y F451-STRICT, pero el repositorio de CyInnove declara explicitamente que no repite ni avala esas afirmaciones. La unica tarea tecnica que ha realizado CyInnove en esta copia es el renombrado del publisher y de la model card: los ficheros son identicos a los originales y conservan los nombres upstream. El proceso de fine-tune previsto (QLoRA 4-bit con TRL `SFTTrainer` sobre el checkpoint safetensors, con 20 % reservado para evaluacion) esta descrito como trabajo futuro, no ejecutado.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat heredada del release upstream y aplicada por llama.cpp.
- Razonamiento explicito: la familia de modelos esta etiquetada como `reasoning` y el autor upstream incluye variantes "Cold Fusion" y NEO CODER orientadas a trazas de razonamiento.
- Generacion de codigo: el sufijo NEO-CODER de la cadena de fine-tunes apunta a un ajuste especifico para tareas de programacion, aunque no se publican evaluaciones que lo cuantifiquen.
- Vision: pipeline declarado `image-text-to-text`; requiere cargar un fichero `mmproj` junto al cuantizado de texto (`--mmproj` en llama-server). Si se omite, el modelo funciona en modo solo texto.
- Tool calling / function calling: soportado por la arquitectura base; la propia model card recomienda Q4_K_M como "suelo practico" cuando el tool calling es importante, lo que sugiere degradacion a 2-3 bits.
- Decodificacion especulativa mediante cabeza MTP: las familias de cuantizacion MTP y Low MTP anaden el modulo de prediccion multi-token; Low MTP corresponde al par de "pensamiento corto" del mismo release.
- Capacidades de agente y razonamiento multi-paso: atribuibles al modelo base Qwen3.8-27B, no validadas especificamente en esta cuantizacion.
- Modo "uncensored": el alineamiento de rechazo ha sido eliminado, lo que en la practica se traduce en ausencia de negativas ante peticiones que el modelo base rechazaria.

## Casos de uso

- Investigacion en interpretabilidad y Mecanismos de rechazo: al ser una build abliterated, permite estudiar que direcciones del espacio de activaciones codifican la negativa y como se comporta el modelo cuando se eliminan; se usaria congelando el cuantizado Q5_K_M y comparando activaciones contra el modelo base alineado.
- Red-teaming y evaluacion de robustez: util para generar conjuntos de prompts adversarios y medir la tasa de cumplimiento de modelos alineados; su ventana de contexto larga permite mantener conversaciones multi-turno de escalada sin perder el hilo.
- Asistente de programacion local sin telemetria: con Q4_K_M o Q5_K_M y tool calling activado, se puede integrar en un servidor llama.cpp propio para autocompletar y refactorizar codigo en entornos con requisitos de confidencialidad, sin enviar el codigo a una API externa.
- Procesamiento de documentos tecnicos con imagenes: gracias al proyector mmproj, el modelo puede recibir capturas de diagramas, tablas escaneadas o interfaces y extraer informacion estructurada junto con el texto circundante, en un unico pase.
- Analisis de corpus largos en ingles o chino: con 262.144 tokens de contexto declarados, es viable resumir expedientes, contratos o documentacion tecnica extensa en una sola ventana, aunque el ejemplo de la model card usa 8.192 tokens y conviene medir la degradacion real por encima de ahi.
- Base para fine-tune posterior con QLoRA: la propia model card describe el flujo (entrenar sobre el safetensors NM-DAU, no sobre los GGUF, con adaptadores 4-bit y `SFTTrainer`), de modo que este repositorio sirve como linea base congelada contra la que comparar el modelo ajustado.
- Generacion de datos sinteticos en dominios con filtros estrictos: al no rechazar por politica, puede emplearse para producir corpus de entrenamiento sobre temas que otros modelos rechazan, siempre con revision humana posterior y moderacion propia.
- Despliegue de bajo coste en una sola GPU consumer: con IQ2_M (11,7 GB) o IQ3_M (14,1 GB) cabe en tarjetas de 12-16 GB, lo que permite prototipar razonamiento multimodal en hardware de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de CyInnove declara explicitamente que no repite las afirmaciones de benchmark del release upstream, y no aporta cifras propias. La pagina oficial de Qwen/Qwen3.8-27B menciona que el modelo se evalua en MathVision con el prompt fijo "Please reason step by step, and put your final answer within \boxed{}", pero no se han proporcionado los valores numericos de esa ni de otras evaluaciones, por lo que no se incluyen tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache ni el proyector de vision):
  - IQ2_M: 11,7 GB (Standard) / 12,1 GB (MTP)
  - IQ3_M: 14,1 GB / 14,5 GB
  - IQ4_XS: 16,6 GB / 17,0 GB / 15,3 GB (Low MTP)
  - Q4_K_S: 17,1 GB / 17,5 GB
  - Q4_K_M: 18,0 GB / 18,5 GB
  - Q5_K_S: 20,2 GB / 20,6 GB
  - Q5_K_M: 20,7 GB / 21,2 GB
  - Q6_K: 23,6 GB / 24,0 GB / 22,4 GB (Low MTP)
  - Q8_0: 29,8 GB / 30,2 GB
- Sumar 0,93 GB (mmproj F16/BF16) o 1,8 GB (F32) si se usa vision.
- Precision bf16 completa: aproximadamente 55 GB de VRAM segun el listado de terceros consultado.
- Cabe en GPU consumer: si. IQ2_M/IQ3_M en RTX 3060 12 GB o RTX 4070; IQ4_XS/Q4_K_S en RTX 4080/4090 16-24 GB; Q5_K_M y Q6_K en RTX 4090 24 GB con margen ajustado para KV cache; Q8_0 requiere 32 GB o reparto CPU/GPU.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para las cuantizaciones altas con contexto largo y vision activa.
- Opciones de despliegue: llama.cpp / llama-server (comando de ejemplo en la model card: `llama-server -m <quant>.gguf --mmproj mmproj-F16.gguf -c 8192`), Ollama (existe una build de terceros `orcarouter/Qwen3.8-27B-Uncensored` con 16 tags de 2 a 8 bits y mmproj incluido), y cualquier runtime compatible con GGUF. No se documenta soporte con vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La cabeza MTP esta disenada para decodificacion especulativa y deberia reducir el tiempo por token, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| zomasec/Qwen3.8-27B-Uncensored-teeled | ~26,9B densos | 262.144 tokens (terceros) | GGUF + mmproj | apache-2.0 | Clon de la release DavidAU; imatrix; 19 cuantizaciones; sin benchmarks propios |
| Qwen/Qwen3.8-27B | ~27,8B densos | no disponible en la informacion | safetensors | no disponible en la informacion | Modelo base oficial; alineado; evaluado en MathVision (sin cifras aportadas) |
| DavidAU/...-NM-DAU (upstream del fine-tune) | ~27,8B densos | no disponible | safetensors | apache-2.0 | Checkpoint de entrenamiento real; es el que debe usarse para fine-tune, no los GGUF |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27B (bf16) | 262.144 tokens | bf16, ~55 GB VRAM | no disponible en la informacion | Misma base (64 capas, vocab 248.320) con alineamiento eliminado; sin GGUF, mas exigente en hardware |
| orcarouter/Qwen3.8-27B-Uncensored (Ollama) | 27B | no disponible | GGUF en Ollama | no disponible en la informacion | 16 tags de 2 a 8 bits con mmproj incluido; alternativa de despliegue mas simple que este repo |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K ni similares) para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Alineamiento de seguridad eliminado: las descripciones de terceros califican la build como "abliterated" (refusal-removed). El espacio de demostracion asociado exige uso exclusivamente investigador (interpretabilidad, estudio de mecanismos de rechazo, red-teaming, evaluacion de robustez) y advierte de que el usuario asume toda la responsabilidad. Requiere moderacion propia antes de cualquier despliegue.
- Conflicto de licencias: la model card y los metadatos declaran Apache-2.0, pero materiales de terceros vinculados a la misma familia hablan de un "limite de solo investigacion". Conviene revisar la licencia del repositorio upstream (DavidAU) antes de un uso comercial, ya que la copia hereda lo que alli se establezca.
- Sin validacion de rendimiento: no hay benchmarks publicados para esta cuantizacion ni para el fine-tune intermedio. No se puede afirmar que el modelo mantenga la calidad del Qwen3.8-27B base tras el ajuste y la cuantizacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, y potencialmente agravado por las cuantizaciones de 2-3 bits (IQ2_M, IQ3_M), donde la model card situa el "suelo practico" para tool calling en Q4_K_M.
- Cobertura idiomatica limitada: solo ingles y chino. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Degradacion con contexto largo: aunque se declaran 262.144 tokens, el unico ejemplo de ejecucion de la model card usa `-c 8192`; la calidad por encima de esa cifra no esta verificada y el coste de KV cache crece de forma significativa.
- Repositorio de 389 GB: descargar el conjunto completo no es practico; debe seleccionarse un unico cuantizado de texto mas, opcionalmente, un `mmproj`.
- Los ficheros son de solo inferencia: no sirven como checkpoint de entrenamiento. Para fine-tune hay que partir del safetensors NM-DAU de DavidAU, segun indica la propia model card.
- Reputacion del repositorio: 65 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni demo asociada a esta cuenta concreta.
- Trazabilidad del sufijo "teeled" del nombre: no se explica en la model card ni en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zomasec/Qwen3.8-27B-Uncensored-teeled
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Release GGUF upstream (DavidAU, NEO-CODER-MAX-MTP): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Checkpoint safetensors upstream (NM-DAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Build Ollama de la familia uncensored: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Guia de ejecucion local con GGUF y llama.cpp: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Espacio de demostracion (aviso de uso exclusivamente investigador): https://huggingface.co/spaces/P1723/Qwen3.8-27B-Uncensored-Demo
- Ficha alternativa en bf16 (64 capas, contexto 262.144): https://featherless.ai/models/JonathanColetti/Qwen3.8-27B-Uncensored
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Sitio del publicador (CyInnove): https://cyinnove.com
