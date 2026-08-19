# togatogah/jinen-v2-xsmall.gguf

## Resumen

jinen-v2-xsmall es un modelo de conversión kana-kanji (かな漢字変換) para japonés, desarrollado por Hitoshi Togasaki y publicado bajo el identificador `togatogah/jinen-v2-xsmall.gguf`. Se trata de la versión cuantizada en formato GGUF del modelo jinen v2, con 35,7 millones de parámetros, diseñado específicamente para transformar lecturas fonéticas en caracteres kanji con alta precisión y baja latencia.

El modelo resuelve el problema de la conversión de texto kana a kanji, una tarea fundamental en sistemas de entrada de texto japonés (IME), procesamiento de lenguaje natural y accesibilidad. Su relevancia actual radica en que ofrece un rendimiento competitivo en el benchmark AJIMEE-Bench con un tamaño extremadamente reducido (el archivo más pequeño pesa solo 26 MB), lo que permite ejecutarlo en CPU con recursos mínimos, incluso en dispositivos embebidos o aplicaciones móviles.

La arquitectura concreta no se detalla en la documentación disponible, pero por su tamaño y naturaleza se trata de un modelo transformer compacto. El contexto de entrada se construye mediante tokens especiales en el plano privado de Unicode, y requiere normalización NFKC tanto en la entrada como en la referencia para alcanzar su máximo rendimiento. El modelo se distribuye exclusivamente en formato GGUF, con varias opciones de cuantización que permiten equilibrar precisión y velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer compacto, detalles no publicados) |
| Parametros totales | 35.660.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada (benchmarks con n_ctx 1024) |
| Tipos de cuantizacion | f16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna del modelo (numero de capas, dimensiones de atencion, tipo de atencion, etc.). Por el tamano de 35,7 millones de parametros y su funcion especifica, se infiere que se trata de un transformer de escala muy reducida, optimizado para la tarea de conversion kana-kanji. La documentacion indica que el modelo requiere normalizacion NFKC en el prompt, lo que sugiere que el vocabulario y el preprocesamiento estan disenados para trabajar con texto normalizado Unicode.

El entrenamiento utilizo como parte del corpus los datos bibliograficos de la Biblioteca Nacional de la Dieta de Japon (国立国会図書館), obtenidos el 9 de julio de 2026, junto con datos del servicio NDL Search. Estos datos fueron procesados por el autor, Hitoshi Togasaki, y no cuentan con garantia de la institucion. No se menciona el uso de tecnicas como RLHF o DPO; el modelo parece estar entrenado mediante aprendizaje supervisado estandar para generacion de texto condicionada.

El formato de prompt emplea tres tokens especiales en el plano privado de Unicode: `\uee00` (inicio de lectura de entrada), `\uee01` (inicio de salida) y `\uee02` (inicio de contexto izquierdo). Esta estructura permite proporcionar contexto previo para desambiguar homofonos. La inferencia debe realizarse siempre con decodificacion greedy (`--temp 0 --top-k 1`), ya que la tarea es determinista.

## Capacidades

- Conversion kana-kanji de alta precision: alcanza un 79,0% de Accuracy@1 con normalizacion NFKC en el benchmark AJIMEE-Bench (version Q5_K_M).
- Soporte de contexto izquierdo: el token `\uee02` permite incorporar texto previo para mejorar la desambiguacion de homofonos.
- Ejecucion extremadamente ligera: los archivos GGUF pesan entre 26 y 72 MB, y las latencias p50 oscilan entre 11 y 20 ms en CPU con 4 hilos.
- Compatible con el ecosistema llama.cpp: puede desplegarse con `llama-server` o integrarse en aplicaciones que usen bindings de llama.cpp.
- Generacion de texto determinista: disenado para operar en modo greedy, sin muestreo estocastico.
- Multilingue: no, exclusivamente japones.

## Casos de uso

- Sistemas de entrada de texto (IME) para japones: el modelo puede integrarse como motor de conversion kana-kanji en teclados virtuales o aplicaciones de escritorio, ofreciendo una alternativa ligera a soluciones propietarias. Su baja latencia (11-20 ms en CPU) lo hace adecuado para pulsaciones en tiempo real.
- Procesamiento por lotes de documentos japoneses: para convertir grandes volumenes de texto fonetico (por ejemplo, transcripciones de audio) a texto kanji, el modelo puede ejecutarse en pipelines de CPU sin necesidad de GPU, gracias a su tamano reducido.
- Asistentes de accesibilidad: personas con discapacidad motora que usan entrada por voz o metodos alternativos pueden beneficiarse de un conversor kana-kanji local y privado, sin dependencia de servicios en la nube.
- Correccion y normalizacion de texto: el modelo puede emplearse para estandarizar texto japones que contenga lecturas ambiguas o incorrectas, siempre que se aplique normalizacion NFKC previa.
- Desarrollo de IME embebidos en dispositivos de bajo consumo: con archivos de 26-39 MB en cuantizacion Q4_K_M o Q8_0, el modelo cabe en microcontroladores o dispositivos IoT con capacidades de procesamiento limitadas.
- Investigacion en NLP japones: sirve como punto de partida para estudiar la conversion kana-kanji con modelos pequenos, y puede compararse con enfoques basados en reglas o en modelos mas grandes.

## Benchmarks y rendimiento

El modelo fue evaluado en el benchmark AJIMEE-Bench (subconjunto `JWTD_v2/v1`, 200 preguntas, decodificacion greedy). Las pruebas se realizaron con llama.cpp version b10200 en CPU con 4 hilos, `n_ctx 1024` y contexto izquierdo de 64 caracteres. La columna "Accuracy@1 (NFKC)" indica que tanto la entrada como la referencia fueron normalizadas con NFKC.

| Archivo | Tamano | Accuracy@1 | Accuracy@1 (NFKC) | p50 | p90 | p99 |
|---|---:|---:|---:|---:|---:|---:|
| `jinen-v2-xsmall-f16.gguf` | 72 MB | 73,5% | 78,5% | 20 ms | 44 ms | 69 ms |
| `jinen-v2-xsmall-Q8_0.gguf` | 39 MB | 73,5% | 78,5% | 12 ms | 26 ms | 43 ms |
| `jinen-v2-xsmall-Q5_K_M.gguf` | 28 MB | 74,0% | 79,0% | 13 ms | 29 ms | 45 ms |
| `jinen-v2-xsmall-Q4_K_M.gguf` | 26 MB | 73,0% | 78,0% | 11 ms | 24 ms | 42 ms |

Como referencia, la version original en PyTorch (HuggingFace) obtiene un 73,0% exacto y un 78,0% con NFKC, lo que indica que la cuantizacion Q5_K_M incluso supera ligeramente al modelo original en este benchmark.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo se ejecuta completamente en CPU.
- Memoria RAM: entre 26 MB (Q4_K_M) y 72 MB (f16) para los pesos, mas overhead del runtime de llama.cpp.
- CPU recomendada: cualquier procesador moderno con soporte para instrucciones AVX2 o ARM NEON. Los benchmarks se realizaron con 4 hilos.
- GPU: opcional, pero no necesaria. Si se desea, puede ejecutarse en GPU via llama.cpp, aunque la ganancia de velocidad seria minima dado el tamano.
- Opciones de despliegue: `llama-server` (incluido en llama.cpp), bindings de llama.cpp para Python, Rust, Go, etc., o servidores compatibles con el protocolo de OpenAI como Ollama o LM Studio (si aceptan archivos GGUF).
- Latencia y throughput: en CPU con 4 hilos, latencia p50 de 11-20 ms segun cuantizacion, p99 de 42-69 ms. El throughput no se ha medido explicitamente, pero para un modelo de 35,7M de parametros se esperan cientos de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos de conversion kana-kanji. Como referencia interna, se puede comparar con la version PyTorch original y con jinen-v1-small:

| Modelo | Parametros | Formato | Accuracy@1 (NFKC) | Licencia |
|---|---:|---|---|---|
| jinen-v2-xsmall (GGUF Q5_K_M) | 35,7M | GGUF | 79,0% | CC BY-SA 4.0 |
| jinen-v2 (PyTorch original) | 35,7M | safetensors | 78,0% | CC BY-SA 4.0 |
| jinen-v1-small | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre alternativas comerciales o academicas como Mozc, Google IME o modelos neuronales similares, por lo que una comparativa externa no es posible con la informacion actual.

## Limitaciones y advertencias

- El modelo solo soporta japones. No es adecuado para otros idiomas.
- Requiere normalizacion NFKC obligatoria en la entrada. Omitir este paso degrada significativamente la precision.
- Los tokens especiales (`\uee00`, `\uee01`, `\uee02`) son caracteres invisibles del plano privado Unicode. Si se escriben como literales en el codigo, pueden perderse en ciertas rutas de transmision o procesamiento, produciendo resultados incorrectos silenciosamente. Se recomienda usar secuencias de escape ASCII.
- La decodificacion debe ser siempre greedy (`--temp 0 --top-k 1`). Usar muestreo estocastico produce resultados no deterministas y probablemente erroneos.
- El corpus de entrenamiento se basa principalmente en datos bibliograficos de la Biblioteca Nacional de la Dieta, lo que puede introducir sesgos hacia vocabulario formal, titulos de obras y terminologia bibliotecaria, con menor cobertura de lenguaje coloquial o tecnico especializado.
- Licencia CC BY-SA 4.0: cualquier obra derivada debe compartirse bajo la misma licencia. Esto puede ser restrictivo para integraciones en software propietario o cerrado.
- No se proporciona informacion sobre la longitud de contexto maxima del modelo. Los benchmarks usan n_ctx 1024, pero el limite real no esta documentado.
- Riesgo de alucinacion: como modelo de generacion, puede producir kanji incorrectos o inexistentes, especialmente con lecturas ambiguas o fuera del dominio del corpus. La tasa de error del 21-27% segun el benchmark debe tenerse en cuenta en aplicaciones criticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/togatogah/jinen-v2-xsmall.gguf
- Benchmark AJIMEE-Bench: https://github.com/azooKey/AJIMEE-Bench
- Modelo predecesor jinen-v1-small: https://huggingface.co/togatogah/jinen-v1-small
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/deed.ja
