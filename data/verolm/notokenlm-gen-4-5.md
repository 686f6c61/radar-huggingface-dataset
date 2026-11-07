# VeroLM/NoTokenLM-Gen-4.5

## Resumen

NoTokenLM-Gen-4.5 es un modelo de lenguaje de 20,3 millones de parametros desarrollado por VeroLM (publicado tambien bajo el identificador `omurberaisik`) que prescinde por completo de tokenizador de subpalabras: opera directamente sobre bytes UTF-8 en la entrada y en la salida. No hay vocabulario BPE ni SentencePiece; cada byte se trata como una unidad. Forma parte de la familia NoTokenLM, una linea de modelos pequenos centrada en explorar cuanto puede lograr un transformer de escala reducida cuando la arquitectura y el entrenamiento se cuidan en lugar de compensar el diseno con escala.

El modelo es una continuacion de Gen-3.5-Focused, no un entrenamiento desde cero. La evolucion clave es una expansion de anchura que preserva la funcion: las matrices del modelo anterior (`d_model=240`, ~9M parametros) se embeben en las nuevas matrices mas grandes (`d_model=360`, ~20M parametros), de modo que la capacidad adicional se entrena sobre lo ya aprendido. El entrenamiento continuo se realizo exclusivamente sobre texto narrativo corto de estilo cuento infantil, sin corpus web general, matematicas ni codigo.

Su relevancia es acotada pero clara: sirve como banco de pruebas reproducible de arquitecturas tokenizer-free a escala de juguete, util para investigacion sobre representaciones a nivel de byte y para docencia. No es un modelo de proposito general y el propio autor lo advierte de forma explicita. La licencia Apache 2.0 facilita su reutilizacion y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, RMSNorm, SwiGLU), byte-level sin tokenizador |
| Parametros totales | 20.322.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; el repo ocupa 0,1 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). La peculiaridad estructural es la capa de entrada y salida a nivel de byte: el vocabulario efectivo es de 256 simbolos UTF-8, lo que elimina el tokenizador y cualquier dependencia de BPE. La anchura del modelo es `d_model=360`, resultado de una expansion de anchura con preservacion de funcion aplicada sobre Gen-3.5-Focused (`d_model=240`, ~9M parametros), que embebe los pesos ya entrenados en las matrices mayores en lugar de reinicializar.

El entrenamiento continuo tras la expansion de anchura acumula 6.900 pasos repartidos en 3 sesiones, con una mejor perdida de validacion de 1,0729. Los datos son exclusivamente narrativa corta y simple de estilo cuento infantil (frases sencillas, uno o dos personajes, un objeto concreto, un evento cotidiano o levemente fantastico). No se incorporo texto web general, corpus enciclopedico, matematicas ni codigo. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion. Las evaluaciones del autor se realizan sobre los pesos EMA (media movil exponencial), practica habitual a esta escala por producir generaciones mas estables que los pesos crudos.

## Capacidades

- Generacion de texto narrativo corto en ingles, con continuaciones de una o dos frases coherentes con el prompt.
- Operacion tokenizer-free a nivel de byte: acepta cualquier entrada UTF-8 sin preprocesado de vocabulario.
- Coherencia basica de personajes, objetos y pronombres en ventanas cortas de generacion.
- Generacion con muestreo configurable (temperatura, top-k); el autor recomienda temperatura 0,5 y top-k 40 para 35 bytes nuevos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision, audio ni multimodalidad.
- Capacidad multilingue practicamente nula: solo ingles; el soporte a nivel de byte permite emitir bytes de otros idiomas, pero sin entrenamiento especifico.

## Casos de uso

- Investigacion sobre modelos tokenizer-free: sirve como referencia reproducible de un transformer byte-level de 20M parametros para comparar arquitecturas sin la variable del tokenizador.
- Docencia y divulgacion: su tamano (0,1 GB de repo) permite ejecutarlo y modificarlo en un portatil, lo que lo hace idoneo para explicar el funcionamiento interno de un transformer en clase.
- Generacion de continuaciones narrativas breves: dado un prompt de cuento infantil, produce una o dos frases de continuacion; adecuado para prototipos de escritura asistida muy acotada.
- Pruebas de concepto de pipelines de inferencia: al cargarse con `transformers` y `trust_remote_code=True`, permite validar integraciones de despliegue (por ejemplo, servidores de inferencia ligeros) sin coste de GPU.
- Experimentos de expansion de anchura: el checkpoint documenta la tecnica de function-preserving width expansion, por lo que es util como caso de estudio para investigar tecnicas de crecimiento de modelos.
- Generacion de datos sinteticos de estilo narrativo simple: puede emplearse para producir corpus de frases infantiles en ingles para tareas auxiliares de filtrado o aumentacion, con revision humana obligatoria.
- Benchmark de referencia para modelos byte-level: util como linea base de baja cota en evaluaciones comparativas de modelos mas grandes.

## Benchmarks y rendimiento

El autor publica una evaluacion manual de 1.000 prompts distintos, una generacion por prompt, con temperatura 0,5, top-k 40 y 35 bytes nuevos, clasificada a mano en tres categorias:

| Categoria | Definicion | Recuento | Porcentaje |
|---|---|---|---|
| Totalmente coherente | Gramatica correcta y significado coherente, con personajes, objetos y pronombres consistentes | 749 | 74,9% |
| Gramatica correcta, significado roto | Frases bien formadas pero con deriva (cambio de pronombre/genero, detalle incongruente) | 246 | 24,6% |
| Gramatica rota | Estructura colapsada, repeticion atascada o clausula malformada | 5 | 0,5% |

Resultado agregado: 74,9% totalmente coherente y 99,5% gramaticalmente correcto. Mejor perdida de validacion: 1,0729 tras 6.900 pasos. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en fp32; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM; funciona tambien en CPU sin dificultad.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090) e incluso en Raspberry Pi y telefonos de gama media.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (metodo documentado por el autor); llama.cpp, Ollama, vLLM o TGI requeririan conversion y no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles de forma oficial; por el tamano, la generacion de decenas de bytes es del orden de milisegundos en GPU y de decimas de segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-4.5 | 20,3M | no disponible | Byte-level tokenizer-free, narrativa infantil | Apache 2.0 | Hugging Face |
| NoTokenLM Gen-3.5-Focused | ~9M | no disponible | Byte-level, predecesor directo | no disponible | Hugging Face (familia NoTokenLM) |
| Modelos byte-level tipo ByT5-small | ~300M | 512-1024 bytes | Encoder-decoder byte-level | Apache 2.0 | Hugging Face |
| GPT-2 small | 124M | 1024 tokens | Transformer con BPE | MIT | Hugging Face |

La comparativa con modelos de proposito general no es significativa: NoTokenLM-Gen-4.5 esta dos ordenes de magnitud por debajo en parametros y su entrenamiento esta restringido a un dominio narrativo muy estrecho. Su interes comparativo reside en la ausencia de tokenizador frente a arquitecturas BPE de escala similar.

## Limitaciones y advertencias

- No es un modelo de conocimiento: no fue entrenado con texto web, enciclopedias, matematicas ni codigo, y no debe usarse como asistente general.
- Riesgo alto de alucinacion y de deriva semantica: el 24,6% de las generaciones evaluadas son gramaticales pero incoherentes, con cambios de pronombre o genero y objetos incongruentes.
- Ventana de contexto efectiva muy corta en la practica: la coherencia se degrada mas alla de una o dos frases.
- Solo ingles; el soporte a nivel de byte no implica competencia multilingue.
- Sesgos: no documentados por el autor; el corpus de cuentos infantiles puede arrastrar estereotipos de genero en la asignacion de roles y pronombres, como sugieren los fallos de concordancia observados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es apto para produccion en tareas reales de negocio por su limitada capacidad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de desplegarlo en entornos sensibles.
- El identificador del autor en la model card (`omurberaisik`) difiere del de la ficha de Hugging Face (`VeroLM`); verificar el repositorio correcto antes de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VeroLM/NoTokenLM-Gen-4.5
- Repositorio alternativo del autor: https://huggingface.co/omurberaisik/NoTokenLM-Gen-4.5
- Ficha en LLM Explorer: https://llm-explorer.com/model/omurberaisik%2FNoTokenLM-Gen-4.5,4vOFR0jiOhejt3Ptlz4DHR
