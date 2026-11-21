# udgamlabs/Vemana-Base-GGUF

## Resumen

Vemana-Base-GGUF es la version cuantizada en formato GGUF de Vemana-Base, un modelo de lenguaje de 278 millones de parametros (278.214.226 exactos) entrenado desde cero por Udgam Labs, un laboratorio de investigacion independiente. El modelo esta especializado exclusivamente en telugu (codigo ISO `te`) y se distribuye como modelo base, es decir, no sigue instrucciones: su funcion es continuar texto en telugu a partir de un prompt.

La relevancia de esta publicacion esta en dos frentes. Por un lado, es un modelo de lenguaje de un idioma de bajos recursos entrenado desde cero, no un fine-tuning de un modelo multilingue existente, lo que lo hace interesante para investigacion sobre modelado de lenguas dravidicas. Por otro, la version GGUF esta disenada para ejecutarse en llama.cpp y en el navegador mediante wllama (llama.cpp compilado a WebAssembly), con ficheros de 297 MB (Q8_0) y 558 MB (F16), lo que permite inferencia completamente local en hardware modesto.

El modelo usa una arquitectura transformer con atencion completa en todas las capas y una longitud de contexto de entrenamiento de 1.024 tokens. La model card reporta verificaciones de equivalencia entre la version original en transformers (float32) y las conversiones GGUF, con perplexity identica hasta el tercer decimal entre original, F16 y Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (atencion completa en todas las capas; la conversion GGUF marca la capa 0 como sliding-window de 4.096 tokens por requisito del codigo Gemma 4 de llama.cpp, sin cambio computacional) |
| Parametros totales | 278.214.226 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | Q8_0 y F16 |
| Idiomas soportados | Telugu (`te`) |
| Licencia | Apache-2.0 (Copyright 2026 Udgam Labs LLP) |
| Formato de pesos | GGUF (ficheros `Vemana-Base-Q8_0.gguf` de 297 MB y `Vemana-Base-F16.gguf` de 558 MB); pesos originales en safetensors en el repo base |
| Tokenizer | SentencePiece (modelo de Vemana, conservado en la conversion) |
| Tamano del repo | 0,9 GB |
| Descargas | 793 |

## Arquitectura y entrenamiento

Vemana-Base es un transformer decoder-only entrenado desde cero sobre texto en telugu. La model card de la version GGUF no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion se remite a la model card del modelo base (`udgamlabs/Vemana-Base`). Lo que si se explicita es que todas las capas usan atencion completa, sin capas de sliding-window, y que la longitud de contexto de entrenamiento es de 1.024 tokens, limite que el autor recomienda respetar tanto en el prompt como en la generacion.

La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp en dos precisiones (Q8_0 y F16) y se valido contra el modelo original en transformers con precision float32. Las comprobaciones reportadas el 27 de octubre de 2026 son: tokenizacion identica en 40 de 40 paginas de Wikipedia en telugu; perplexity sobre los mismos 4.080 tokens de 15,764 en el original, 15,764 en F16 y 15,765 en Q8_0; continuaciones greedy de 40 tokens identicas en las cuatro prompts probadas para F16 y en tres de cuatro para Q8_0 (la cuarta diverge tras unas palabras por redondeo de 8 bits). En navegador con wllama 3.6.1, los recuentos de tokens del prompt y dos continuaciones greedy resultaron identicos. Ollama y LM Studio no fueron probados por el autor.

## Capacidades

- Generacion y continuacion de texto en telugu: es un modelo base, por lo que completa texto a partir de un prefijo en lugar de responder a instrucciones.
- Modelado de lenguaje puro: util para calcular perplexity, puntuar texto y generar continuaciones coherentes dentro del dominio telugu.
- Inferencia local en CPU y en navegador: los ficheros GGUF funcionan con llama.cpp y con wllama (WebAssembly), sin salida de datos del dispositivo.
- Ejecucion en hardware de consumo: el fichero Q8_0 de 297 MB cabe en memoria de cualquier portatil actual.
- No dispone de tool calling, function calling, modo thinking, vision, audio ni capacidades de agente.
- No soporta instrucciones ni conversacion multi-turno en formato chat, al no haber sido alineado.
- Capacidad multilingue: no disponible; el modelo esta entrenado unicamente para telugu.

## Casos de uso

- Completado de texto en telugu en entornos sin conectividad: el fichero Q8_0 de 297 MB se ejecuta con llama.cpp en un portatil o en el navegador via wllama, de modo que se puede ofrecer autocompletado de texto telugu sin enviar datos a un servidor.
- Evaluacion de modelos telugu como referencia: con perplexity verificada de 15,764 sobre 4.080 tokens, sirve como linea base para comparar otros modelos o tokenizadores sobre el mismo corpus.
- Investigacion sobre modelado de lenguas dravidicas de bajos recursos: al estar entrenado desde cero y no derivar de un modelo multilingue, permite estudiar el comportamiento de un transformer pequeno en un unico idioma sin interferencias de otros.
- Generacion de texto sintetico en telugu para aumento de datos: se pueden producir continuaciones controladas por temperatura y top-p (por ejemplo `--temp 0.8 --top-p 0.95`) para ampliar corpus de entrenamiento o de prueba.
- Demostraciones educativas de inferencia en navegador: la integracion con wllama permite montar una pagina web que cargue el GGUF y muestre generacion en telugu en tiempo real, util para talleres y docencia sobre LLM.
- Pruebas de pipeline de cuantizacion: el par F16/Q8_0 con verificacion de equivalencia documentada sirve como caso de estudio para validar conversiones de safetensors a GGUF en otros modelos.
- Prototipado de correctores o predictores de siguiente palabra en telugu: dentro del limite de 1.024 tokens, el modelo puede puntuar y proponer continuaciones en editores de texto.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) para este modelo. Los unicos datos cuantitativos reportados son las verificaciones de equivalencia entre formatos:

| Metrica | Original (float32) | F16 | Q8_0 |
|---|---|---|---|
| Perplexity (4.080 tokens) | 15,764 | 15,764 | 15,765 |
| Tokenizacion (40 paginas Wikipedia telugu) | referencia | identica | identica |
| Continuaciones greedy (4 prompts, 40 tokens) | referencia | identicas en 4/4 | identicas en 3/4 |

Rendimiento de inferencia reportado: aproximadamente 100 tokens por segundo en un Mac mini con Chromium ejecutando wllama. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: Q8_0 ocupa 297 MB de fichero y F16 558 MB; la memoria necesaria en ejecucion es del orden de esas cifras mas el contexto (1.024 tokens), por lo que cabe holgadamente en cualquier GPU o CPU moderna.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo esta pensado para CPU y para navegador. Cualquier GPU consumer (por ejemplo, una RTX 4090) puede ejecutarlo, pero esta sobredimensionada para 278M de parametros.
- GPU de consumo: si, cabe en cualquier GPU consumer y en la mayoria de iGPU y telefonos modernos.
- Opciones de despliegue: llama.cpp (`llama-completion`), wllama (WebAssembly en navegador). Ollama y LM Studio no fueron probados por el autor.
- Latencia y throughput: aproximadamente 100 tokens por segundo en un Mac mini con Chromium y wllama.
- Comando de referencia: `llama-completion -hf udgamlabs/Vemana-Base-GGUF:Q8_0 -p "వర్షాకాలంలో" -n 80 --temp 0.8 --top-p 0.95 -c 1024`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. A continuacion se comparan caracteristicas estructurales con modelos pequenos de referencia, indicando cuando un dato no esta disponible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Vemana-Base-GGUF | 278M | 1.024 | Telugu | Apache-2.0 | GGUF |
| Modelos telugu de tipo IndicBERT/IndicBERT v2 (familia IndicNLPSuite) | no disponible en la informacion proporcionada | no disponible | Multiples idiomas indios | no disponible | safetensors |
| Modelos multilingues pequenos tipo Gemma 2 2B o Qwen2.5 0.5B | 2.000M / 500M aprox. | 8.192 / 32.768 aprox. | Multilingue | licencias propias | safetensors, GGUF |

La comparacion directa con esos modelos no es posible con los datos disponibles: Vemana esta entrenado desde cero y solo en telugu, con contexto de 1.024 tokens, mientras que los modelos multilingues citados cubren decenas de idiomas con contextos mucho mayores. La ventaja de Vemana es su tamano minimo (297 MB en Q8_0) y su ejecucion en navegador; su desventaja es la ausencia de capacidades de instruccion y de contexto largo.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene conversaciones de chat y no responde preguntas en el sentido habitual. Cualquier uso conversacional requiere un fine-tuning previo.
- Contexto limitado a 1.024 tokens: el autor recomienda explicitamente mantener prompt y salida dentro de ese limite, ya que es la longitud con la que fue entrenado.
- Un solo idioma: solo telugu. No hay capacidades multilingues ni traduccion.
- Riesgo de alucinacion y de generar texto plausible pero incorrecto, inherente a un modelo base pequeno de 278M de parametros.
- Sesgos: no se documentan analisis de sesgo en la model card; al entrenarse sobre corpus telugu, puede reproducir sesgos presentes en esos datos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el aviso de copyright indica que los creditos de datos de entrenamiento estan en el fichero `NOTICE` del repositorio, que conviene revisar antes de un despliegue comercial.
- La conversion GGUF introduce un cambio de metadatos (capa 0 marcada como sliding-window de 4.096 tokens) para satisfacer el codigo de llama.cpp; el autor afirma que el calculo no cambia, pero es una modificacion que conviene tener en cuenta al auditar la equivalencia.
- Ollama y LM Studio no fueron probados por el autor, por lo que su funcionamiento en esas herramientas no esta verificado.
- No hay datos publicados de benchmarks estandar, lo que impide comparar su calidad con otros modelos de forma objetiva.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/udgamlabs/Vemana-Base-GGUF
- Modelo base en Hugging Face: https://huggingface.co/udgamlabs/Vemana-Base
- Pagina del modelo en Udgam Labs: https://udgamlabs.com/models/vemana
- Notas de investigacion: https://udgamlabs.com/research/vemana
- Repositorio con los scripts: https://github.com/udgamlabs/vemana
- wllama (llama.cpp en WebAssembly): https://github.com/ngxson/wllama
- Web de Udgam Labs: https://udgamlabs.com
