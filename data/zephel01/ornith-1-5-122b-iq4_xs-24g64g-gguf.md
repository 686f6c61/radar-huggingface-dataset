# zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF

## Resumen
Ornith-1.5-122B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por ornith-ai, con 124.635.206.144 parametros totales segun los pesos en safetensors del repositorio base. Esta ficha describe la cuantizacion comunitaria publicada por zephel01 bajo el identificador `Ornith-1.5-122B-IQ4_XS-24G64G-GGUF`, un archivo GGUF de 68,9 GB pensado para ejecutarse integramente en un PC con una GPU de 24 o 32 GB de VRAM y 64 GB de RAM, sin lecturas desde SSD durante la generacion.

La pieza clave es el esquema de cuantizacion: se conservan los 256 expertos del modelo original, con los expertos enrutados en IQ4_XS y una importance matrix, mientras que la atencion, las proyecciones delta-net y los expertos compartidos permanecen en Q8_0. El resultado es un archivo con una divergencia KL media de 0,061 frente a la conversion BF16, muy por debajo de la variante IQ3_XXS del mismo autor (0,138) y a menos de la mitad de su KL, con un tamano un 33 % mayor.

El modelo base se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales conocidas, y la arquitectura declarada en los metadatos es `qwen35moe`, con soporte en llama.cpp y en el motor Abyss del mismo autor. La relevancia actual reside en que permite ejecutar un MoE de 122B en hardware de consumo con velocidades de decodificacion de 52 a 64 tok/s, un umbral que hasta hace poco requeria multiples aceleradores profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer con atencion y proyecciones delta-net, arquitectura `qwen35moe` en llama.cpp; incluye bloque NextN (MTP) en `blk.48` |
| Parametros totales | 124.635.206.144 (124,6B) |
| Parametros activos | no disponible (el modelo card no indica el numero de expertos activos por token) |
| Longitud de contexto | no disponible en la informacion proporcionada; se han validado prompts de 31K tokens en las pruebas del autor |
| Tipos de cuantizacion | IQ4_XS (expertos enrutados), Q8_0 (atencion, delta-net, expertos compartidos, ssm_alpha/beta/out), Q4_K (bloque NextN/MTP), Q5_K (resto), IQ3_S (embeddings de tokens) |
| Idiomas soportados | no disponible de forma oficial; las pruebas del autor cubren ingles y japones |
| Licencia | MIT |
| Formato de pesos | GGUF (dos shards: 47,6 GB + 21,3 GB) |

## Arquitectura y entrenamiento
La informacion disponible no detalla el proceso de entrenamiento del modelo base `ornith-ai/Ornith-1.5-122B`: no se indica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se conoce es la arquitectura declarada en los metadatos del GGUF: `qwen35moe`, un transformer con mezcla de expertos (256 expertos segun la model card del cuantizador), proyecciones delta-net y modulos SSM (`ssm_alpha`, `ssm_beta`, `ssm_out`), lo que sugiere un diseno hibrido entre atencion y componentes de espacio de estados. El bloque `blk.48` corresponde a un cabezal NextN (multi-token prediction), utilizado como drafter para decodificacion especulativa.

La innovacion tecnica relevante de esta ficha no esta en el modelo base sino en la receta de cuantizacion: se aplica una importance matrix generada con texto tecnico y codigo en ingles y japones, se mantienen las capas sensibles en Q8_0 y se reserva IQ4_XS para los expertos enrutados, que concentran la mayor parte del peso. El autor conserva los 256 expertos completos, evitando el pruning de expertos que degradaria la calidad, y mantiene el drafter MTP en Q4_K para que motores como Abyss puedan usarlo en decodificacion especulativa (73-77 % de aceptacion de borradores medido).

## Capacidades
- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con endpoints tipo OpenAI (`endpoints_compatible`).
- Razonamiento y respuesta a preguntas factuales y aritmeticas: el autor reporta 10 de 10 respuestas japonesas limpias en pruebas manuales, sin errores factuales ni cambios de idioma.
- Generacion de codigo: 5 de 5 tareas de programacion superaron sus tests ocultos en las comprobaciones del autor, incluyendo tres tareas con tests dentro del `--check`.
- Tool calling / function calling: una de las 11 comprobaciones del `--check` es una llamada a herramienta, que pasa.
- Recuperacion de informacion en contexto largo: needle-in-a-haystack encontrado en prompts de 8K, 24K y 31K tokens.
- Capacidades multilingues verificadas empiricamente en japones (correo empresarial en keigo, explicaciones, resumenes) e ingles; el resto de idiomas no esta documentado.
- Decodificacion especulativa mediante el bloque NextN (MTP) integrado en el propio GGUF.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso
- Asistente conversacional local en estacion de trabajo: con 24 GB de VRAM y 64 GB de RAM el modelo completo reside en GPU y RAM, sin acceso a disco durante la decodificacion, lo que permite conversaciones multi-turno con latencias estables de 52 tok/s en un RTX 5090 capado a 24 GB.
- Generacion de codigo en pipelines de desarrollo: las pruebas del autor muestran 5 de 5 tareas superando tests ocultos y soporte de tool calling, lo que permite integrarlo en flujos de autocompletado, generacion de tests o refactorizacion asistida en local sin enviar codigo a servicios externos.
- Atencion al cliente en japones: el modelo produce respuestas en keigo verificado y mantiene el idioma en conversaciones de dos turnos, adecuado para empresas que necesitan procesar datos de clientes sin salir de su infraestructura.
- Procesamiento de documentacion tecnica larga: con needles encontrados a 31K tokens y velocidades de prompt de 1.594-1.862 tok/s para 8K tokens, es viable para resumir manuales, extraer clausulas de contratos o responder preguntas sobre documentacion extensa.
- Agentes locales con llamadas a herramientas: el soporte de function calling y la ventana de contexto validada permiten construir agentes de varios pasos que consulten APIs internas o bases de datos sin depender de la nube.
- Despliegue en entornos con requisitos de soberania del dato: al ser MIT y ejecutarse en hardware propio, encaja en administraciones o sectores regulados que no pueden usar APIs externas.
- Prototipado e investigacion en hardware de consumo: investigadores con un PC de 64 GB de RAM y una GPU de 24 GB pueden experimentar con un MoE de 122B sin acceso a clusters, a costa de asumir que es una version BETA con mediciones de una sola maquina.

## Benchmarks y rendimiento
El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). La unica metrica cuantitativa disponible es la divergencia KL frente a la conversion BF16, medida con `llama-perplexity --kl-divergence` sobre 8 fragmentos de 1024 tokens de texto ingles y japones no usado para la importance matrix (perplejidad BF16 de referencia: 14,44).

| Archivo | Tamano | KL media | KL al 99 % | Mismo token top-1 | PPL |
|---|---:|---:|---:|---:|---:|
| unsloth UD-Q4_K_XL | 80 GB | 0,039 | 0,32 | 89,5 % | 14,37 |
| **este archivo (IQ4_XS 24G64G)** | **68,9 GB** | **0,061** | **0,45** | **85,7 %** | **14,48** |
| misma receta, expertos IQ3_S + `ffn_down` IQ4_XS (no subido) | 61,1 GB | 0,099 | 0,69 | 83,4 % | no disponible |
| 16G64G IQ3_XXS-B | 51,7 GB | 0,138 | 1,09 | 81,3 % | 14,88 |

Rendimiento de inferencia medido con Abyss v1.3.120 `--bench` en un Ryzen AI Max+ 395 (16 hilos, iGPU desactivada), PCIe Gen4 x4, drafter NextN activo:

| Metrica | 24 GB GPU + 64 GB RAM | 32 GB GPU + 64 GB RAM |
|---|---:|---:|
| Decodificacion | 52,4 tok/s (73 % de borradores aceptados) | 63,8 tok/s (77 %) |
| Prompt de 8K tokens | 1.594 tok/s | 1.862 tok/s |
| Esperas de SSD por token | 0 % | 0 % |

Tras un prompt de 24K / 31K tokens en la configuracion de 24 GB, la decodificacion baja a 42,7 / 30,9 tok/s. El autor advierte que un escritorio con DDR5 de doble canal calculara los expertos derivados a CPU mas lentamente que su equipo con LPDDR5X.

## Requisitos de hardware
- VRAM: 24 GB como minimo recomendado (configuracion objetivo del nombre del archivo); con 32 GB se obtienen 63,8 tok/s frente a 52,4 tok/s.
- RAM: 64 GB. El autor usa un tier de 46 GB dentro de un limite de 58 GB para los expertos que no caben en GPU.
- GPU recomendadas: RTX 5090 (probada, capada a 24 GB o usada a 32 GB); cualquier GPU con 24-32 GB de VRAM deberia encajar en el perfil, aunque solo se ha medido en la RTX 5090.
- CPU: el autor usa un Ryzen AI Max+ 395 con 16 hilos y memoria LPDDR5X; en escritorios con DDR5 de doble canal se espera menor rendimiento en los expertos calculados en CPU.
- Almacenamiento: 68,9 GB para los dos shards; PCIe Gen4 x4 es suficiente porque no hay lecturas durante la generacion.
- Despliegue: llama.cpp (`llama-server -m ... -ngl 99 --n-cpu-moe <n>`) y Abyss v1.3.57 o superior (v1.3.120 para las mediciones); Ollama, vLLM y TGI no se mencionan en la informacion disponible.
- Muestreo recomendado: temperature 0,6, top_p 0,95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Calidad (KL media vs BF16) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| **Ornith-1.5-122B IQ4_XS 24G64G** | 124,6B (MoE) | no disponible (validado a 31K) | 68,9 GB | 0,061 | MIT | GGUF en HF |
| Ornith-1.5-122B IQ3_XXS 16G64G | 124,6B (MoE) | no disponible | 51,7 GB | 0,138 | MIT | GGUF en HF |
| Ornith-1.5-122B UD-Q4_K_XL (unsloth) | 124,6B (MoE) | no disponible | 80 GB | 0,039 | MIT | GGUF en HF |
| Ornith-1.5-122B BF16 (original) | 124,6B (MoE) | no disponible | no disponible | referencia | MIT | safetensors en HF |

No se dispone de datos de benchmarks estandar que permitan comparar con modelos de otras familias y tamano similar; la comparacion se limita a las variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias
- Version BETA: las mediciones de velocidad y calidad provienen de una sola maquina y un solo conjunto de pruebas; el autor solicita reportes de otras configuraciones.
- La comprobacion de reutilizacion de conversacion falla (WARN) en todos los archivos Ornith: la plantilla de chat descarta el razonamiento de respuestas anteriores, por lo que el siguiente prompt no empieza con los tokens que el motor guardo en cache. Hay una correccion prevista en Abyss.
- Riesgo de alucinacion: no hay evaluacion sistematica de factualidad mas alla de las 10 respuestas manuales; no debe asumirse una fiabilidad superior a la del modelo base.
- Idiomas: solo se han verificado ingles y japones; el rendimiento en castellano y otros idiomas no esta documentado.
- Longitud de contexto: no se publica la ventana oficial del modelo base; las pruebas solo validan hasta 31K tokens.
- Rendimiento dependiente del hardware: en CPUs de escritorio con DDR5 de doble canal, los expertos calculados en CPU seran mas lentos que en el equipo del autor; una GPU que ademas gestione la pantalla pierde 1-2 GB de VRAM disponible.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el modelo base ni sobre esta cuantizacion; conviene revisar la model card del modelo original para condiciones adicionales.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces
- Repositorio de esta cuantizacion: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Variante IQ3_XXS 16G64G del mismo autor: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Configuracion de Abyss para Ornith: https://github.com/zephel01/Abyss/blob/main/docs/ornith/README.md
- Issues de Abyss (reportes de rendimiento): https://github.com/zephel01/Abyss/issues
- Nota del autor sobre la cuantizacion de 16 GB: https://note.com/zephel01/n/nf2016d04bcd6?hl=en
