# ufrik/Inkling-2-Mini-Dflash2-GGUF

## Resumen

Inkling-2-Mini-Dflash2-GGUF es un empaquetado en formato GGUF de un modelo borrador (*draft model*) para decodificación especulativa, publicado por el usuario ufrik en Hugging Face. No se trata de un modelo autónomo: los pesos y la arquitectura DFlash2 pertenecen a incoai (repositorio `incoai/Inkling-2-Mini-DFlash2`), y el modelo objetivo para el que genera borradores es `thinkingmachines/Inkling-2-Mini`. La contribución de este repositorio es el empaquetado GGUF y el trabajo de runtime en llama.cpp necesario para que el borrador funcione contra el modelo objetivo.

El modelo tiene 494.983.424 parámetros en un único fichero de 955,7 MiB (49 tensores BF16 y 32 F32 para vectores de normalización y escala), con una arquitectura `dflash` de 5 bloques y tamaño de bloque 8 (borrador por difusión de bloques). Lee los estados ocultos de las capas 6, 24, 42 y 48 del modelo objetivo y declara una longitud de contexto de 1.048.576 tokens, aunque su ventana de atención deslizante es de 2048 en las cinco capas.

Su relevancia es práctica: es el primer borrador DFlash2 para Inkling que funciona bajo llama.cpp, ya que las compilaciones estándar abortan en el primer token por un desajuste entre el vocabulario rellenado (*padded*) del modelo objetivo y el recorte de logits del camino de candidatos DFlash2. Con las correcciones adecuadas, el autor reporta 56,6 tok/s de media frente a 26,2 tok/s sin borrador en un M3 Ultra de 96 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `dflash` (borrador por difusion de bloques para decodificacion especulativa); 5 bloques, block size 8 |
| Parametros totales | 494.983.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (ventana deslizante de atencion: 2048 en las 5 capas) |
| Tipos de cuantizacion | BF16 (fichero publicado); F32 en 32 tensores de norma/escala |
| Idiomas soportados | no disponible |
| Licencia | unknown (desconocida) |
| Formato de pesos | GGUF (llama.cpp) |
| Embedding length / feed-forward length | 2304 / 6912 |
| Capas objetivo leidas | [6, 24, 42, 48] (1-based) |
| Selector rank / top-k | 256 / 16 |
| Conv kernel size / group size | 2 / 16 |
| Vocabulario del tokenizer | 201024 (rellenado; vocab real del objetivo 200058) |
| Tokens especiales (eos / eot / pad / mask) | 200006 / 200006 / 199999 / 200056 |
| Pre-tokenizer / modelo de tokenizer | `inkling2` / `gpt2` |
| RoPE freq base | 10000.0 |
| Epsilon de RMS norm | 1e-6 |
| Softcapping de logits finales | 30.0 (ignorado en el parche de llama.cpp) |
| Tamano del repo | 1,0 GB |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa basado en difusión de bloques (*block-diffusion draft*) con 5 bloques y un tamaño de bloque de 8, es decir, propone hasta 8 tokens por paso de borrador que el modelo objetivo verifica después. No dispone de cabeza de vocabulario propia utilizable: depende del modelo objetivo Inkling-2-Mini, del que consume los estados ocultos de las capas 6, 24, 42 y 48. Incorpora un mecanismo de selección con rango 256 y top-k 16, convoluciones de kernel 2 y grupo 16, y atención con ventana deslizante de 2048 en todas las capas.

No se ha reentrenado ni ajustado nada: el autor declara explícitamente que los pesos y la arquitectura son de incoai y que su aportación es el empaquetado GGUF y el trabajo de runtime. Este trabajo consiste en tres cambios en `src/models/dflash.cpp` y `src/models/dflash2.cpp`, todos condicionados a `LLM_ARCH_INKLING2_LOOP`: (1) recorte del vocabulario a `valid_vocab × n_tokens` antes de `ggml_top_k`, porque la cabeza LM del objetivo está rellenada (`output.weight` es `[2304, 201024]` frente a un vocabulario real de 200058) y el camino de candidatos emitía ids fuera de rango; (2) aplicación de la norma RMS `tok_norm` del objetivo a los embeddings de token del borrador, que este no incorpora; y (3) omisión del softcapping de logits finales, ya que Inkling no lo usa. Por (2) y (3) el borrador es específico de Inkling y no debe apuntarse a otros objetivos. No se dispone de información sobre el dataset de entrenamiento del borrador original.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa: acelera la inferencia del modelo objetivo Inkling-2-Mini verificando múltiples candidatos por paso.
- No es un modelo autónomo: carece de cabeza de vocabulario utilizable y solo funciona emparejado con el objetivo Inkling-2-Mini.
- Integración con `llama-server` mediante `--spec-type draft-dflash2` y `--spec-draft-model`.
- Compatibilidad con el modo de razonamiento (*thinking mode*) del objetivo mediante `--reasoning on`.
- Soporte de plantilla de chat heredada del modelo objetivo (`--jinja`).
- Compatible con el proyector de visión del objetivo (`--mmproj`), ya que el borrador opera sobre los estados ocultos del objetivo multimodal.
- Capacidades multilingües: no disponibles (dependen del modelo objetivo).
- Tool calling y agentes: no disponibles como capacidades propias del borrador.

## Casos de uso

- Aceleración de inferencia en producción con llama.cpp: desplegar `llama-server` con el objetivo Inkling-2-Mini en Q8_K_XL y este borrador para elevar el throughput de decodificación de 26,2 a 56,6 tok/s de media en un M3 Ultra, sin cambiar el modelo servido ni la calidad de las respuestas verificadas.
- Servicio local en Apple Silicon: el binomio objetivo + borrador cabe en un equipo de 96 GB de memoria unificada con contexto de 368.640 tokens y 3 slots concurrentes usando caché KV cuantizada en q8_0, lo que permite ofrecer un endpoint compatible con OpenAI en hardware de sobremesa.
- Asistentes conversacionales de contexto largo: la ventana declarada de 1.048.576 tokens del borrador y el contexto completo del objetivo permiten mantener conversaciones multi-turno extensas con latencia de decodificación reducida.
- Procesamiento por lotes de generación de texto: con `--parallel 3` y decodificación especulativa se pueden atender varias peticiones simultáneas manteniendo un throughput agregado superior al de la inferencia sin borrador.
- Flujos con modo de razonamiento: activando `--reasoning on` se obtienen respuestas con trazas de pensamiento más rápidas, útil en tareas de análisis que requieren cadenas de razonamiento largas.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia reproducible para medir la tasa de aceptación de borradores DFlash2 frente a DSpark u otras variantes en el mismo hardware.
- Prototipado de pipelines multimodales: combinado con el proyector de visión del objetivo, permite servir cargas con imagen y texto con la aceleración del borrador.

## Benchmarks y rendimiento

Datos medidos por el autor en un M3 Ultra de 96 GB, mismo servidor, `--temp 0`, 4 prompts × 2 repeticiones (se descarta la de calentamiento), velocidad de decodificación tomada de `timings.predicted_per_second`:

| Configuracion | tok/s |
|---|---|
| Inkling-2-Mini + este borrador (`draft-dflash2`, n-max 7) | 56,6 de media (rango 37,9 – 74,6) |
| Inkling-2-Mini + borrador DSpark | 27,5 |
| Inkling-2-Mini sin borrador | 26,2 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable al tratarse de un borrador y no de un modelo generativo autónomo.

## Requisitos de hardware

- VRAM/memoria estimada para el borrador: 955,7 MiB en BF16 (fichero de 1.002.166.976 bytes).
- Memoria total del binomio: el autor lo sirvió en un M3 Ultra de 96 GB con el objetivo en `Inkling-2-Mini-UD-Q8_K_XL.gguf`, proyector de visión BF16, contexto de 368.640 tokens y caché KV en q8_0.
- GPU recomendadas: no hay datos específicos para GPU discretas; la configuración verificada es Apple Silicon (M3 Ultra, 96 GB). Por tamaño del borrador, cabría en GPUs de consumo, pero el requisito dominante es la memoria del modelo objetivo.
- Cabe en GPU de consumo: el borrador por sí solo sí; el binomio completo depende del objetivo y de la cuantización de este, dato no disponible.
- Opciones de despliegue: `llama-server` de llama.cpp con una compilación que incluya los parches de Inkling DFlash2 (el autor usó `llama-inkling-dflash-work`, llama.cpp `c212d25ad` + tres parches). Las compilaciones estándar, incluidas `b12588` y `b12675`, abortan en la primera generación con el error `get_sub_batch: failed to add token 200899 at index 3 (error -2, n = 4)`.
- Flags relevantes: `--spec-draft-model`, `--spec-type draft-dflash2`, `--spec-draft-n-max 7`, `--spec-draft-n-min 0`, `-fa on`, `-ngl 99`, `-ctk q8_0 -ctv q8_0`, `--jinja`, `--reasoning on`.
- Latencia y throughput: 56,6 tok/s de media de decodificación en la configuración medida (2,16× respecto a la inferencia sin borrador); no se dispone de datos de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ufrik/Inkling-2-Mini-Dflash2-GGUF | Borrador DFlash2 para Inkling-2-Mini | 494.983.424 | 1.048.576 (ventana deslizante 2048) | 56,6 tok/s (M3 Ultra 96 GB) | unknown | GGUF en Hugging Face |
| Borrador DSpark para Inkling-2-Mini | Borrador de decodificacion especulativa | no disponible | no disponible | 27,5 tok/s (mismo hardware) | no disponible | no disponible |
| Inkling-2-Mini sin borrador | Modelo objetivo, decodificacion estandar | no disponible en esta ficha | no disponible en esta ficha | 26,2 tok/s (mismo hardware) | no disponible | GGUF (`Inkling-2-Mini-UD-Q8_K_XL.gguf`) |

No se dispone de datos de otros borradores DFlash2 para objetivos distintos de Inkling que permitan una comparación cruzada de arquitectura, licencia o contexto.

## Limitaciones y advertencias

- No es un modelo autónomo: no tiene cabeza de vocabulario propia utilizable y solo funciona emparejado con Inkling-2-Mini como objetivo.
- Específico de Inkling: los parches aplican la norma `tok_norm` del objetivo y omiten el softcapping, por lo que apuntarlo a otros modelos objetivo producirá resultados incorrectos.
- Requiere una compilación parcheada de llama.cpp; las versiones estándar (`b12588`, `b12675`) abortan en el primer token por ids fuera del vocabulario rellenado.
- Licencia desconocida (`unknown`): no se puede confirmar el uso comercial ni las condiciones de redistribución; hay que consultar los repositorios originales de incoai y thinkingmachines.
- El modelo objetivo debe ser el checkpoint rellenado estándar (`Inkling-2-Mini-UD-Q8_K_XL.gguf`); no se necesita una versión sin relleno ni repackaged.
- El rendimiento medido procede de una única máquina (M3 Ultra, 96 GB) y una única configuración de muestreo; la tasa de aceptación y el throughput variarán en otro hardware y con otras cargas.
- No hay información sobre sesgos, riesgo de alucinación o cobertura idiomática del borrador; estas propiedades dependen del modelo objetivo y deben evaluarse sobre él.
- El repositorio tiene 0 likes y 1405 descargas en el momento de la consulta, lo que indica validación comunitaria limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ufrik/Inkling-2-Mini-Dflash2-GGUF
- Borrador original de incoai: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Modelo objetivo: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion disponible papers, blogs o demos adicionales.
