# VertexAGI/experiment-a1-pico

## Resumen

Experiment A1 Pico es un transformer decoder-only de 1.009.920 parametros entrenado desde cero (sin destilacion ni modelo base) por VertexAGI sobre el corpus tinyshakespeare, aproximadamente 1,1 MB y un millon de caracteres de texto de Shakespeare. El entrenamiento completo se ejecuto en 188 segundos en un Mac con Apple Silicon utilizando MLX, segun la model card del autor. El modelo se publica explicitamente como un experimento recreativo, no como parte de la linea de modelos de produccion del proyecto.

Su interes no esta en el rendimiento, sino en el caracter demostrativo: comprime a ~1/1000 del tamano de los modelos habituales del proyecto los mismos ingredientes arquitectonicos (RMSNorm, RoPE, atencion causal, SwiGLU, embeddings de entrada y salida atadas) y mantiene casi todo el presupuesto de parametros en el transformer real en lugar de en la tabla de embeddings, gracias a un tokenizador a nivel de caracter con vocabulario de 65 simbolos. Con contexto de 128 caracteres y 3 capas, sirve como referencia minima para estudiar cuanto aprende un modelo genuinamente diminuto con un dataset genuinamente diminuto.

Es relevante ahora como pieza didactica y como linea base reproducible y baratisima para experimentos de preentrenamiento en hardware de consumo Apple. No incluye tokenizador subword, no esta registrado en transformers ni mlx_lm, no declara idiomas soportados ni resultados de benchmarks, y sus pesos se cargan mediante el model.py incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RMSNorm, RoPE, atencion causal y MLP SwiGLU; embeddings de entrada/salida atados |
| Parametros totales | 1.009.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (a nivel de caracter) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizacion; pesos distribuidos en safetensors) |
| Idiomas soportados | No disponible en la model card; el unico dato de entrenamiento es texto en ingles (tinyshakespeare), por lo que el soporte real se limita al ingles isabelino |
| Licencia | MIT (codigo de arquitectura y entrenamiento); el corpus tinyshakespeare procede de texto de dominio publico |
| Formato de pesos | safetensors (pico.safetensors), acompanados de model.py y vocab.json |
| Tamano oculto | 160 |
| Capas | 3 |
| Cabezas de atencion | 4 |
| Tamano intermedio (SwiGLU) | 480 |
| Vocabulario | 65 (nivel de caracter: todos los caracteres unicos de tinyshakespeare) |
| Dataset de entrenamiento | tinyshakespeare, ~1,1 MB / ~1M caracteres |
| Iteraciones de entrenamiento | 3000, batch size 64, longitud de secuencia 128, AdamW con lr 3e-3 |
| Tiempo de entrenamiento | 188 segundos en un Mac con Apple Silicon |
| Libreria | MLX (mlx.core) |
| Fecha de publicacion | 2026-09-17 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura replica a escala reducida el diseno declarado para el resto de modelos del proyecto: transformer decoder-only con normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), atencion autocausal y MLP con activacion SwiGLU, con los embeddings de entrada y salida atados para ahorrar parametros. Con tamano oculto 160, 3 capas, 4 cabezas y tamano intermedio 480, el modelo queda en 1.009.920 parametros y una ventana de contexto de 128 posiciones. La decision tecnica clave es el tokenizador a nivel de caracter: con un vocabulario subword de ~50.000 tokens, la tabla de embeddings (vocab_size x hidden_size) superaria por si sola varias veces el presupuesto total de 1M de parametros, de modo que el enfoque char-level mantiene la mayor parte de la capacidad en las capas del transformer en lugar de en una tabla de consulta.

El entrenamiento se hizo integramente desde cero, sin destilacion ni inicializacion a partir de otro modelo, durante 3000 iteraciones con batch size 64, longitud de secuencia 128 y optimizador AdamW con learning rate 3e-3. La perdida de entrenamiento bajo de 4,71 a 1,48 y la de validacion (split retenido del 10 %, monitorizado durante toda la ejecucion) de 3,90 a 1,68, sin senales de sobreajuste segun el autor. El coste total fue de 188 segundos en un Mac con Apple Silicon. No se documenta uso de RLHF, DPO ni ninguna fase de ajuste posterior; tampoco se describe una innovacion tecnica adicional mas alla del escalado a la baja y del propio flujo de entrenamiento en MLX.

## Capacidades

- Generacion de texto autoregresiva a nivel de caracter, condicionada por un prompt de hasta 128 caracteres.
- Reproduccion de la estructura formal de un guion teatral: nombres de personaje en mayusculas seguidas de dos puntos, saltos de linea y turnos de dialogo.
- Convenciones de puntuacion y capitalizacion del ingles, aprendidas del corpus de Shakespeare.
- Formas de palabra plausibles con registro isabelino ("thee", "thy"), aunque sin coherencia semantica sostenida.
- Ninguna capacidad de razonamiento verificable, matematicas, codigo o conocimiento factual: la perdida de validacion de 1,68 y el presupuesto de 1M de parametros acotan estrictamente el comportamiento.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes, planificacion ni razonamiento multi-paso.
- Sin capacidades multilingues declaradas ni evidenciadas: el entrenamiento es exclusivamente en ingles.
- Sin modo thinking, vision, audio ni multimodalidad.
- Sin tokenizador subword: la interfaz de entrada y salida es un mapa caracter-a-indice (vocab.json con stoi/itos).
- No integrado en transformers ni mlx_lm: requiere cargar la clase PicoModel desde el model.py del repositorio.

## Casos de uso

- Material didactico de preentrenamiento desde cero: el modelo permite recorrer en una sola sesion de clase el ciclo completo (dataset, tokenizacion char-level, bucle de entrenamiento, muestreo autoregresivo) con un coste de 188 segundos en un Mac, lo que hace viable repetir el experimento en vivo con estudiantes.
- Linea base para estudios de escalado: con 1.009.920 parametros y un unico corpus de ~1M de caracteres, sirve como punto inferior de una curva de scaling laws casera, comparando perdida de validacion frente a variantes mayores del mismo proyecto que comparten arquitectura.
- Fixture de pruebas para infraestructura MLX: al ser un modelo diminuto con pesos safetensors y un model.py explicito, es util para validar pipelines de carga de pesos, evaluacion de parametros y versionado de artefactos en entornos Apple Silicon sin consumir recursos.
- Validacion de bucles de entrenamiento personalizados: sus perdidas documentadas (train 4,71 a 1,48; val 3,90 a 1,68 en 3000 iteraciones) permiten comprobar que una implementacion nueva del optimizador, del schedule o del split de validacion reproduce resultados comparables.
- Generacion de texto decorativo o de ambiente: para prototipos de videojuegos, instalaciones o demos que necesiten lineas con sabor isabelino y formato de guion, el modelo produce salidas con estructura correcta a partir de un prompt como "ROMEO:" sin coste de inferencia apreciable.
- Ensayo de tokenizadores a nivel de caracter: sirve para medir el impacto de vocabularios minimos (65 simbolos) frente a esquemas subword en tareas de generacion, aislando el efecto del tokenizador del resto de variables.
- Prueba de concepto de entrenamiento en hardware de consumo: demuestra que un flujo completo de preentrenamiento cabe en un portatil Apple Silicon, como referencia para decidir si merece la pena escalar a corpus mayores en el mismo equipo.
- Referencia de comparacion cualitativa frente a nanoGPT: al compartir el corpus y el enfoque char-level, permite contrastar muestras y presupuestos de parametros entre implementaciones (MLX frente a PyTorch) en un rango de tamano muy bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y un modelo de 1M de parametros con vocabulario de 65 caracteres no es evaluable de forma significativa en esos conjuntos.

Los unicos datos cuantitativos publicados son las perdidas de entrenamiento y validacion:

| Metrica | Inicio | Final |
|---|---|---|
| Perdida de entrenamiento | 4,71 | 1,48 |
| Perdida de validacion (split retenido del 10 %) | 3,90 | 1,68 |

Condiciones declaradas: 3000 iteraciones, batch size 64, longitud de secuencia 128, AdamW con lr 3e-3, 188 segundos de reloj de pared en un Mac con Apple Silicon. No se especifica el modelo exacto de chip ni la cantidad de memoria unificada. La unica muestra cualitativa publicada es una generacion con prompt "ROMEO:" y temperatura 0,8, descrita por el propio autor como no coherente pero con formato de guion, puntuacion y formas de palabra plausibles.

## Requisitos de hardware

- VRAM estimada para inferencia: derivada del numero de parametros, en fp32 el modelo ocupa aproximadamente 3,85 MiB (1.009.920 x 4 bytes) y en fp16/bf16 aproximadamente 1,93 MiB (1.009.920 x 2 bytes). Es un calculo a partir del recuento de parametros; el autor no publica cifras de memoria.
- El autor no documenta los tipos de cuantizacion soportados ni confirma el dtype de los pesos de pico.safetensors, por lo que no se puede afirmar que existan variantes INT8 o INT4.
- GPU recomendadas: no aplica en el sentido habitual; el modelo se entreno y se disena para ejecutarse en Apple Silicon mediante MLX. Cualquier GPU con unas pocas decenas de MiB libres es sobradamente suficiente, pero no hay soporte declarado para CUDA.
- Cabe en cualquier GPU de consumo: incluso las integradas mas modestas y las generaciones antiguas (por ejemplo, GTX 1050 o inferiores) disponen de memoria muy por encima de lo necesario; el cuello de botella es el software, no la VRAM.
- Opciones de despliegue: exclusivamente mediante MLX y el model.py del repositorio. El autor indica explicitamente que la arquitectura es personalizada y no esta registrada en transformers ni en mlx_lm, por lo que no hay ruta directa a vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no publicados. El unico dato temporal disponible es el entrenamiento completo en 188 segundos (3000 iteraciones con batch 64 y secuencia 128) en un Mac con Apple Silicon, que no es extrapolable a la inferencia.
- Almacenamiento: el repositorio ocupa 0,0 GB segun HuggingFace, coherente con un unico checkpoint de ~1M de parametros mas el codigo y el vocab.json.

## Comparativa con modelos similares

Las cifras de los modelos alternativos proceden de su documentacion publica y son aproximadas; no se dispone de comparaciones de rendimiento medidas bajo condiciones identicas.

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Experiment A1 Pico | 1.009.920 | 128 caracteres | Char-level, vocab 65 | MIT | Pesos en safetensors, requiere model.py propio |
| nanoGPT (config shakespeare_char) | ~10,65 M | 256 tokens | Char-level, vocab 65 | MIT | Repositorio publico de Karpathy, pesos entrenables localmente |
| GPT-2 small | 124 M | 1024 tokens | BPE, vocab ~50.257 | MIT (pesos publicados por OpenAI) | Integrado en transformers y en la mayoria de runtimes de inferencia |
| TinyStories-1M | ~1 M (orden de magnitud) | No verificado en la informacion disponible | Subword | No verificado en la informacion disponible | Publicado por Eldan y Li como linea de investigacion sobre corpus sinteticos |

Frente a nanoGPT en su configuracion shakespeare_char, A1 Pico es aproximadamente diez veces mas pequeno y reduce el contexto a la mitad, a cambio de un coste de entrenamiento de 188 segundos y de un flujo nativo en MLX. Frente a GPT-2 small, la diferencia de parametros es de dos ordenes de magnitud y GPT-2 small ofrece integracion directa con el ecosistema transformers, algo de lo que carece A1 Pico.

## Limitaciones y advertencias

- Coherencia muy limitada: el propio autor describe la salida como "no es Shakespeare coherente". No es apto para generar texto que deba ser semanticamente correcto.
- Riesgo alto de alucinacion en cualquier tarea de conocimiento: el modelo no almacena hechos y su perdida de validacion final es de 1,68, muy por encima de lo utilizable para respuestas factuales.
- Sesgos: no se documenta ninguna evaluacion de sesgos. El corpus es un unico texto dramatico del siglo XVI, con los estereotipos de genero, clase y etnia propios de la epoca, sin filtrado ni mitigacion.
- Limitacion idiomatica severa: sin datos de entrenamiento mas alla del ingles de Shakespeare, no cabe esperar comportamiento util en castellano ni en ninguna otra lengua.
- Ventana de contexto de 128 caracteres: cualquier prompt mas largo debe truncarse, lo que impide mantener un hilo conversacional o un contexto documental.
- Tokenizacion a nivel de caracter: la generacion avanza caracter a caracter, de modo que producir texto largo requiere muchas llamadas al modelo y no se beneficia de los trucos habituales de decodificacion sobre tokens subword.
- Licencia MIT para el codigo y los pesos, sin restriccion de uso comercial declarada; el corpus de entrenamiento es de dominio publico. No obstante, la ausencia de garantias es la habitual de una licencia MIT y no hay soporte ni mantenimiento comprometidos.
- Integracion limitada: al no estar registrado en transformers ni en mlx_lm, no se puede desplegar con las herramientas estandar (vLLM, TGI, Ollama, llama.cpp) sin escribir adaptadores propios.
- Estado del repositorio: 0 descargas, 0 likes y publicacion y actualizacion el mismo dia, lo que sugiere un experimento puntual sin mantenimiento posterior.
- Cualquier uso en produccion requiere asumir que se trata de una demostracion tecnica, no de un modelo de proposito general.

## Enlaces

- HuggingFace: https://huggingface.co/VertexAGI/experiment-a1-pico
- Repositorio MLX: https://github.com/ml-explore/mlx
- Corpus tinyshakespeare: https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt
- Repositorio de referencia char-rnn de Karpathy: https://github.com/karpathy/char-rnn
- Benchmarks: no disponibles
- Paper: no disponible
- Blog o demo: no disponible
- Nota sobre la busqueda web: los resultados recuperados (paginas sobre la zona 90 de Qatar, mapas de la interestatal I-90 y mapas de zonas de rusticidad del USDA) no guardan ninguna relacion con el modelo y se descartan como fuentes.
