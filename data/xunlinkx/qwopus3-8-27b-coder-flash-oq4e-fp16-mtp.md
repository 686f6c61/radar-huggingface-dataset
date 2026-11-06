# xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp

## Resumen

Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp es una cuantizacion de 4 bits en formato MLX del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un modelo denso de aproximadamente 27.000 millones de parametros orientado a generacion de codigo y razonamiento agentico. La prepara el usuario xunlinkx mediante el pipeline de cuantizacion oMLX, con el objetivo de maximizar el rendimiento y la eficiencia de memoria en equipos Apple Silicon de gama mainstream, en especial configuraciones de 24 GB y 32 GB de memoria unificada.

El modelo base emplea la arquitectura Qwen3_5ForConditionalGeneration, una variante multimodal de la familia Qwen 3.5 que incorpora un codificador visual ViT de 27 bloques. La cuantizacion oQ4e combina precision mixta con calibracion mediante matriz de importancia (imatrix) y preserva en FP16 tanto la torre de vision como las cabezas de prediccion multi-token (MTP), que permiten decodificacion especulativa con una mejora de throughput declarada de entre 1,4x y 1,7x en tareas de codigo y razonamiento agentico.

Su relevancia actual reside en que permite ejecutar un modelo de 27B con capacidades multimodales y decodificacion especulativa en Macs de consumo, algo que con pesos en BF16 resultaria inviable en configuraciones de 24 GB. La licencia Apache-2.0 heredada del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso multimodal con codificador visual ViT de 27 bloques) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit oQ4e (precision mixta con grupo de tamano 64, calibracion imatrix de 128 muestras y longitud de secuencia 512); capas sensibles en 5/6 bits; torre de vision, escalas, sesgos, normas y embeddings en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX, libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen 3.5 con 27.781 millones de parametros y una torre de vision de 27 bloques ViT que lo convierte en un modelo multimodal de entrada imagen y salida texto. Incorpora cabezas auxiliares de prediccion multi-token (MTP) con `mtp_num_hidden_layers: 1`, que actuan como borrador para decodificacion especulativa. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La aportacion de esta variante es la cuantizacion: el pipeline oMLX aplica cuantizacion afin con grupo de 64 y calibracion imatrix sobre 128 muestras de 512 tokens, y eleva a 5 o 6 bits las proyecciones de atencion (`q_proj`, `v_proj`) y las down-projections de MLP en las capas mas sensibles, con el fin de preservar la profundidad de razonamiento y la adherencia a la indentacion en la generacion de codigo. Los pesos no cuantizados se guardan en FP16 en lugar de BF16 para aprovechar la velocidad de ejecucion nativa en chips M1 y M2, que carecen de unidades aritmeticas BF16, y mantener throughput completo en M3, M4 y posteriores. El peso estimado del checkpoint es de aproximadamente 15,8 GB.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis en calidad de indentacion y estructura.
- Razonamiento agentico y multi-step sobre tareas de programacion.
- Vision multimodal: comprension de capturas de pantalla de codigo, diagramas, OCR y razonamiento espacial, gracias a la torre visual preservada en FP16.
- Decodificacion especulativa mediante cabezas MTP, con aceleracion de 1,4x a 1,7x en throughput de tokens en tareas de codigo y razonamiento.
- Generacion de texto conversacional (pipeline text-generation).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion local en Mac: el modelo puede generar funciones completas, como una cache LRU thread-safe con operaciones O(1), a partir de instrucciones en lenguaje natural, ejecutandose integramente en memoria unificada de un Mac de 32 GB.
- Comprension de capturas de pantalla de codigo: al conservar la torre de vision en FP16, permite extraer y explicar codigo a partir de imagenes de IDE, documentacion o diagramas de arquitectura.
- Parseo de diagramas y documentacion tecnica: la torre visual sin cuantizar habilita tareas de OCR y razonamiento espacial sobre diagramas de flujo y esquemas de arquitectura de software.
- Servicio de inferencia local con oMLX Server: desplegable como endpoint HTTP en el puerto configurado, con MTP activado y parametros de muestreo ajustados (temperatura 0,2, top_p 0,95) para generacion de codigo determinista.
- Automatizacion de tareas agenticas de refactorizacion: las cabezas MTP aceleran la generacion de secuencias largas de parches y ediciones multi-archivo en bucles agenticos.
- Prototipado y pruebas en portatiles de desarrollo: con un peso de 15,8 GB, cabe en configuraciones de 24 GB y permite iterar sin conexion a servicios en la nube.
- Generacion de tests unitarios y documentacion tecnica a partir de fragmentos de codigo existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento proporcionada es la aceleracion relativa por decodificacion especulativa: aproximadamente 1,4x a 1,7x mas throughput de tokens con MTP activado en tareas de codigo y razonamiento agentico, sin cifras absolutas de tokens por segundo.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 15,8 GB para los pesos; con overhead de contexto y runtime, se recomienda un minimo de 24 GB de memoria unificada y 32 GB para margenes comodos.
- Plataforma objetivo: Apple Silicon exclusivamente (M1, M2, M3, M4 y posteriores), ya que el formato es MLX.
- No es compatible con GPU NVIDIA o AMD en su formato actual; requeriria conversion a otro formato (por ejemplo GGUF) para su uso en CUDA.
- Cabe en Macs de consumo con 24 GB (MacBook Pro M4 Pro, Mac mini M4 Pro) y 32 GB (configuraciones M1/M2/M3 Pro y Max).
- Opciones de despliegue: oMLX Server (`omlx serve`), MLX-LM (`mlx_lm.generate`). El tag menciona compatibilidad con llama.cpp MTP draft, pero no se detalla el procedimiento de conversion.
- Latencia y throughput absolutos: no disponibles. La unica referencia es la mejora relativa de 1,4x a 1,7x con MTP activado y `mtp_num_draft_tokens: 3`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp (este) | ~27,8B | no disponible | Si (ViT 27 bloques) | Apache-2.0 | MLX safetensors, ~15,8 GB | MTP especulativo, orientado a Apple Silicon |
| Jackrong/Qwopus3.8-27B-Coder-Flash (base) | ~27,8B | no disponible | Si | Apache-2.0 | safetensors sin cuantizar | Requiere mucha mas memoria; referencia de calidad |
| xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp | ~27,8B | no disponible | No (variante solo texto) | Apache-2.0 | MLX safetensors | Misma cuantizacion sin torre de vision; menor huella |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a estas alternativas.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la precision en tareas de razonamiento complejo o generacion de codigo muy especializado, aunque el autor mitiga el efecto elevando capas sensibles a 5 y 6 bits.
- La torre de vision se preserva en FP16 sin cuantizar, lo que incrementa el peso total respecto a una variante solo texto.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no es ejecutable directamente en CUDA ni en CPU x86 sin conversion previa.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion del modelo base.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar su uso en tareas de contexto largo.
- El modelo tiene 259 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente nula.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un despliegue comercial.
- La aceleracion por MTP depende del runtime: solo se aprovecha en oMLX y en runtimes con soporte de borradores MTP; en MLX-LM estandar puede no activarse.
- El uso de temperatura 0,2 y top_p 0,95 esta recomendado por el autor para codigo; otros casos de uso pueden requerir ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp
- Variante solo texto: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
