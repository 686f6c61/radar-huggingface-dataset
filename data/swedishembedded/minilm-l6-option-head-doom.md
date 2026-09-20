# swedishembedded/minilm-l6-option-head-doom

## Resumen

`swedishembedded/minilm-l6-option-head-doom` es un adaptador de decision de 444.673 parametros publicado por Swedish Embedded AB (usuario `swedishembedded`). No es un modelo generativo: se acopla a un codificador de frases congelado, `sentence-transformers/all-MiniLM-L6-v2`, y lo convierte en una politica que puntua un conjunto variable de acciones candidatas. Dada una situacion descrita en texto y una lista de opciones tambien en texto, devuelve una probabilidad para cada opcion. Nunca escribe acciones; solo clasifica las que recibe.

El interes tecnico esta en su diseno: la cabeza es un mecanismo de cross-attention de una sola capa que lee filas `[CLS]` (una por opcion) como consultas y asiste sobre las filas de la situacion. Esto permite que el numero de opciones cambie en cada llamada sin necesidad de reentrenar ni reconfigurar kernels, algo poco habitual en cabezas de politica convencionales, que suelen tener una dimension de salida fija. El softmax se calcula en el host, sobre las opciones de esa llamada concreta.

El modelo se entreno sobre DOOM mediante clonacion de comportamiento de un jugador scriptado y despues con PPO. Segun su propia model card, iguala a su profesor pero no lo supera: "doce iteraciones de gradiente de politica compraron lo que la clonacion ya habia alcanzado". Debe interpretarse como una demostracion de arquitectura, no como un agente competitivo. Su relevancia actual es como patron de diseno para sistemas de decision con espacio de acciones dinamico (por ejemplo, agentes que operan sobre APIs o herramientas definidas en tiempo de ejecucion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de cross-attention sobre encoder Transformer congelado (MiniLM-L6, 6 capas, hidden 384) |
| Parametros totales | 444.673 (solo la cabeza; el encoder base suma aproximadamente 22,7 M adicionales) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La cabeza opera sobre ventanas de `max_span` tokens con solape (valor de `max_span` no publicado); el encoder base all-MiniLM-L6-v2 esta limitado a 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no declarados en la model card ni en los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,7 MB solo de la cabeza) |
| Libreria de referencia | `brain` |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 (congelado) |
| Tamano del repositorio | 0,0 GB (metadato del Hub) |

## Arquitectura y entrenamiento

El componente entrenable es una cabeza de atencion minima. La secuencia de entrada se empaqueta en un unico tensor para el encoder: las filas `0..R` contienen la situacion troceada en ventanas de `max_span` tokens con solape, y las filas `R..R+S` contienen un span por opcion con el formato `<instructions> [SEP] <option text>`, cada uno empezando por `[CLS]`. La cabeza proyecta las filas `[CLS]` como consultas (`Wq`, salida 384) y las filas de la situacion como claves y valores (`Wkv`, salida 768), aplica cross-attention, suma residual con `LayerNorm`, y produce un escalar por opcion mediante un producto con `w` mas un sesgo. El softmax final se calcula en el host sobre las opciones de esa llamada, no dentro de la cabeza. Los tensores son: `head.wq.weight [384, 384]`, `head.wkv.weight [768, 384]`, `head.wq.bias [384]`, `head.wkv.bias [768]`, `head.ln.weight [384]`, `head.ln.bias [384]`, `head.score.weight [1, 384]` y `head.score.bias [1]`.

En cuanto al entrenamiento, el adaptador se entreno sobre DOOM a traves de un motor que entrega al agente una observacion textual y una lista de opciones en cada decision. El proceso consistio en clonacion de comportamiento a partir de un jugador scriptado, seguida de optimizacion con PPO. No se publican detalles sobre el volumen de datos, la composicion del dataset ni hiperparametros de RL. La innovacion destacable es la independencia de la dimension de salida: como el softmax vive fuera del kernel, el numero de opciones es libre entre llamadas, lo que encaja con escenarios donde el conjunto de acciones se define en tiempo de ejecucion.

## Capacidades

- Puntuacion de opciones discretas: recibe una situacion y una lista de acciones en texto, y devuelve una probabilidad normalizada por accion.
- Espacio de acciones dinamico: el numero de opciones puede variar entre llamadas sin reconfiguracion.
- Procesamiento de situacion extensa mediante ventanas con solape sobre el encoder congelado.
- Decision secuencial en entornos simulados (demostrado en DOOM).
- No genera texto: carece de capacidad de generacion, resumen o traduccion.
- No dispone de tool calling ni function calling en el sentido habitual; el equivalente funcional es su mecanismo de puntuacion sobre opciones que le entrega el host.
- No se declaran capacidades multilingues, de vision ni de audio.
- No hay modo de razonamiento explicito (thinking mode) ni cadena de pensamiento.

## Casos de uso

- Seleccion de acciones en agentes sobre APIs: el host puede listar en cada turno las llamadas disponibles (definidas dinamicamente segun el estado) y usar la cabeza para elegir la mas probable. La dimension de salida variable es exactamente lo que este escenario requiere.
- Investigacion en aprendizaje por refuerzo con acciones textuales: sirve como cabeza de politica ligera sobre un encoder congelado, util para prototipar entornos donde las acciones se describen en lenguaje natural.
- Evaluacion de arquitecturas de decision: al ser un adaptador de 445k parametros, permite reproducir y auditar el mecanismo de cross-attention y softmax en host con coste computacional minimo.
- Sistemas de recomendacion contextual con candidatos variables: dado un contexto textual y un conjunto de items descritos en texto, obtener una distribucion sobre los candidatos presentes en esa consulta.
- Enrutamiento de consultas en pipelines de agentes: decidir entre un conjunto de herramientas o subagentes descritos textualmente, como paso previo a la ejecucion.
- Simulacion y entornos de investigacion: integrado en un motor que exponga observaciones textuales y opciones, para experimentar con clonacion de comportamiento y ajuste posterior con PPO.
- Despliegue en hardware muy limitado: al ocupar 1,7 MB de pesos de cabeza mas el encoder MiniLM, cabe en dispositivos embebidos o CPU, lo que habilita prototipos de decision en el borde.

## Benchmarks y rendimiento

Los unicos datos publicados son episodios compartidos en DOOM comparando la politica entrenada con su profesor scriptado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Profesor scriptado | Esta politica |
|---|---|---|
| Episodios compartidos | 24 | 24 |
| Salidas (exits) | 10 | 10 |
| Muertes | 5 | 2 |
| Progreso | 0,70 | 0,73 |

## Requisitos de hardware

- VRAM para la cabeza: aproximadamente 1,7 MB en safetensors; el encoder base all-MiniLM-L6-v2 anade en torno a 90 MB en fp32 o 45 MB en fp16.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1050 o superior) es mas que suficiente; funciona tambien en CPU.
- Compatibilidad con GPU consumer: si, en practicamente cualquier GPU moderna e incluso en dispositivos embebidos o Raspberry Pi.
- Opciones de despliegue: la libreria de referencia es `brain` (campo `library_name`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no disponibles. Al tratarse de una cabeza de una sola capa de atencion sobre un encoder de 6 capas, la latencia dominante sera la codificacion del texto de situacion y opciones.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables publicados con la misma combinacion de encoder congelado y cabeza de puntuacion de opciones con dimension de salida variable. La comparacion mas util es contra el propio encoder base y frente a cabezas de politica convencionales.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minilm-l6-option-head-doom | 444.673 (cabeza) | No disponible | Probabilidad por opcion (variable) | Apache 2.0 | HuggingFace, libreria `brain` |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | Embedding de frase | Apache 2.0 | HuggingFace, sentence-transformers |
| Cabeza de politica MLP convencional | Segun diseno | Segun diseno | Logits de dimension fija | Segun implementacion | Depende del proyecto |

## Limitaciones y advertencias

- No es un generador: no puede redactar texto ni acciones; solo puntua opciones que le proporciona el host.
- Las puntuaciones son independientes entre si: cada opcion se evalua solo frente a la situacion y las opciones se acoplan unicamente mediante el softmax de normalizacion. No existe un mecanismo para comparar dos opciones directamente, por lo que cualquier preferencia entre ellas debe ser inferible desde el texto de la situacion.
- Rendimiento demostrado limitado: iguala a su profesor scriptado pero no lo supera; no debe presentarse como un agente competente en DOOM.
- Dependencia total del modelo base: los pesos de la cabeza carecen de utilidad sin `sentence-transformers/all-MiniLM-L6-v2` congelado.
- Idiomas no declarados: no hay informacion sobre el comportamiento fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto no documentada: se desconoce el valor de `max_span` y como escala el rendimiento con situaciones muy largas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de puntuaciones mal calibradas ante situaciones fuera de la distribucion de entrenamiento.
- Sesgos: no se documenta ningun analisis de sesgos. Al entrenarse sobre un unico entorno (DOOM) y un unico profesor scriptado, la politica heredara las preferencias y los sesgos de ese profesor.
- Licencia Apache 2.0: permite uso comercial, pero el aviso de la model card indica que la empresa ofrece servicios de integracion por contacto directo.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swedishembedded/minilm-l6-option-head-doom
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Swedish Embedded AB (contacto indicado en la model card): info@swedishembedded.com
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda web disponibles.
