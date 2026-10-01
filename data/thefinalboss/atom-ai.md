# thefinalboss/atom-ai

## Resumen

ATOM (atom-ai) es un modelo de lenguaje experimental desarrollado por el usuario thefinalboss, publicado en HuggingFace bajo licencia no especificada. Su rasgo diferencial es que no es un Transformer: carece de mecanismo de atención, de tokenizador BPE y de cualquier componente de GPT-2. El texto entra y sale como bytes UTF-8 crudos, procesados por un front-end propio llamado Atomizer, y el estado se mantiene en un campo toroidal persistente que se actualiza byte a byte. El objetivo declarado es conseguir texto coherente en frances e ingles con inferencia en CPU.

El modelo es muy pequeno: los checkpoints actuales (d=32) tienen 479.548 parametros, de los cuales 266.828 son entrenables. La inferencia es un bucle Python/PyTorch en CPU que tarda unos 2 segundos por respuesta corta con un solo hilo. El autor lo clasifica explicitamente como codigo de investigacion experimental y advierte de que ATOM todavia no produce texto coherente en ninguno de los dos idiomas.

La relevancia actual es acotada y de caracter cientifico: se trata de un cuaderno de laboratorio abierto sobre una arquitectura alternativa al Transformer, con documentacion detallada de fallos encontrados (bug de decodificacion, campo nunca entrenado como memoria) y sus correcciones. Aunque esta disenado como modelo bilingue frances-ingles, todos los checkpoints publicados se entrenaron solo con datos en frances y no hay resultados en ingles. El repositorio acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente sin Transformer: campo complejo toroidal con acoplamiento de sincronizacion de fase y avance por paso RK4, mas front-end byte-level (Atomizer) |
| Parametros totales | 479.548 (checkpoints d=32) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | Campo persistente con reinicio cada 8.000 ticks; contexto efectivo de 2-3 bytes antes de la correccion, ampliado con BPTT truncado (K=64 o K=128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Frances (implementado en los checkpoints publicados) e ingles (disenado, sin resultados publicados) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints en el directorio `checkpoints/` del repositorio; la model card no especifica formato) |

## Arquitectura y entrenamiento

El modelo sustituye el Transformer por tres piezas. En primer lugar, el Atomizer (`src/io/atomizer.py`) actua como reemplazo del tokenizador: cada byte UTF-8 es un "tick" y se convierte, junto con un pequeno contexto deslizante, en una caracteristica de 320 dimensiones que incluye identidad de byte, etiqueta de frontera (`max_span` / `newline` en modo byte-tick) y un esbozo de contexto. No hay vocabulario que aprender ni fusiones. En segundo lugar, cada paquete se compila en un "atomo" (embedding) que se inyecta en un campo complejo alfa sobre 32 modos dispuestos en un toro (`src/atom_native.py`, `src/toroidal/`). En cada tick el campo se filtra con una fuga aprendible por modo, recibe el nuevo atomo y avanza con un paso RK4 mas acoplamiento de sincronizacion de fase entre modos vecinos; un controlador RMS lo mantiene acotado. El campo es persistente durante todo el flujo y se reinicia cada 8.000 ticks. En tercer lugar, la lectura (`readout`) predice el siguiente byte a partir del campo alfa (MLP mas proyeccion JL congelada) y de una pequena ruta `last_atom` de tipo bigrama.

El entrenamiento usa entropia cruzada por byte (medida en nats/byte) con retropropagacion truncada a traves del campo (`--field-bptt K`, con K=64 o K=128). Las herramientas son `tools/run_atom_native.py` (un flujo, en CPU) y `tools/train_batched.py` (B flujos en lockstep, en CPU o CUDA). El corpus objetivo es bilingue, aproximadamente 50 % frances y 50 % ingles, con cerca de un 20 % de dialogo en cada idioma, compuesto por Wikipedia, libros de Project Gutenberg y dialogos estilo OpenSubtitles formateados como `Utilisateur: ... / Assistant: ...` en frances y `User: ... / Assistant: ...` en ingles. Los constructores son `scripts/fr_big/download.sh` y `scripts/fr_big/build_fr_big.py` para el frances, y `scripts/fr_big/download_en.sh` junto con `build_fr_big.py --lang en` para el ingles. Los checkpoints publicados solo usan datos franceses: el corpus de plantilla de dialogo y una mezcla francesa de 7,4 MB. El corpus bilingue combinado no esta incluido en el repositorio (varios GB).

La documentacion del autor recoge tres hallazgos. Primero, un bug de decodificacion: en generacion, espacios y puntuacion recibian una etiqueta de frontera distinta a la del entrenamiento, lo que producia avalanchas como `Oui,,`, `Peut--` o `Je` seguido de 94 espacios; tras la correccion (commit fbea452), los logits de teacher forcing y de generacion coinciden exactamente (max |Δlogit| = 0,0). Segundo, el campo nunca se entreno como memoria: se desconectaba en cada tick y se inyectaba bajo `no_grad`, dejando un contexto efectivo de 2-3 bytes y una CE de validacion estancada en 1,247 nats/byte, entre un bigrama de bytes (1,950) y un trigrama de bytes (0,959). Tercero, la correccion combina BPTT truncado a traves del campo con fuga aprendible; en una prueba de memorizacion de 2 KB, ATOM paso de 10 bytes (control sin BPTT) a un valor superior que el fragmento de la model card no llega a completar.

## Capacidades

- Generacion de texto byte a byte en frances: produce palabras reales, frases y nombres del corpus mezclados con pseudo-palabras. La model card especifica que el texto no es coherente.
- Sin tokenizador: procesa directamente valores de byte UTF-8 (alfabeto de salida de 256 valores), por lo que no requiere vocabulario ni fusiones.
- Capacidad bilingue disenada (frances e ingles por el mismo camino de bytes), aunque no hay resultados publicados en ingles.
- Inferencia en CPU pura: bucle Python/PyTorch, aproximadamente 2 segundos por respuesta corta con un solo hilo.
- Entrenamiento en CPU o GPU segun las herramientas del repositorio.
- Capacidad de memorizacion a corto plazo tras la correccion (prueba de memorizacion de 2 KB), frente a los 10 bytes del control sin BPTT.
- No hay soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- Las respuestas son en gran medida independientes del prompt, segun advierte el propio autor.

## Casos de uso

- Investigacion sobre arquitecturas alternativas al Transformer: ATOM sirve como banco de pruebas reproducible de un modelo recurrente con campo toroidal, sin atencion ni tokenizador, para comparar su comportamiento frente a enfoques estandar.
- Estudio de modelos byte-level sin tokenizador: el Atomizer y el alfabeto de 256 bytes permiten analizar el efecto de eliminar el vocabulario BPE, incluyendo el tratamiento nativo de caracteres acentuados como `é` o `ç` (secuencias de 2 bytes en UTF-8).
- Reproduccion de experimentos y notas de laboratorio: la model card y los documentos `docs/ROOT_CAUSE.md`, `docs/DECODE_FIX_AND_BPTT.md`, `docs/MIX_DATA_LONG_MEMORY.md` y `docs/BATCHED_TRAINING.md` documentan fallos y correcciones que pueden reproducirse con el codigo incluido.
- Docencia y divulgacion: el modelo es lo bastante pequeno (479.548 parametros) y lento pero ejecutable para ilustrar conceptos de campos recurrentes, BPTT truncado y controles RMS en un aula o tutorial.
- Pruebas de inferencia en CPU sin GPU: con unos 2 segundos por respuesta corta en un hilo, permite experimentar con despliegue en entornos sin acelerador, aunque no para produccion.
- Benchmarking interno de memoria recurrente: la prueba de memorizacion de 2 KB y la CE de validacion en nats/byte ofrecen una metodologia reutilizable para medir la memoria efectiva de modelos recurrentes.
- Analisis de sesgos de corpus frances: al entrenarse sobre Wikipedia, Gutenberg y dialogos estilo OpenSubtitles en frances, permite estudiar que tipo de texto se memoriza y se reproduce en modelos byte-level pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas internas de entrenamiento y de diagnostico:

| Metrica | ATOM | Referencia de control |
|---|---|---|
| Parametros (checkpoints d=32) | 479.548 totales / 266.828 entrenables | GRU: 123.904 |
| CE de validacion (nats/byte), antes de la correccion | 1,247 | Bigrama de bytes: 1,950; trigrama de bytes: 0,959; GRU: 0,099 |
| Memoria en prueba de 2 KB (bytes regenerados tras prefijo de 32 bytes) | 10 (control sin BPTT); valor tras la correccion no completado en la model card | no disponible |
| NLL de respuestas segun un juez GRU | 9,69 antes de la correccion, 1,37 despues | no disponible |
| Puntuacion duplicada en 24 chats de prueba | 7 antes de la correccion, 0 despues | no disponible |
| Diferencia entre logits de teacher forcing y de generacion | max abs(Δlogit) = 0,0 | no disponible |
| Latencia de inferencia en CPU | ~2 s por respuesta corta, un hilo | no disponible |

## Requisitos de hardware

- Inferencia disenada para CPU: el autor la ejecuta como bucle Python/PyTorch en CPU, con aproximadamente 2 segundos por respuesta corta en un solo hilo. No se especifican requisitos minimos de memoria.
- Tamano del repositorio: 0,2 GB, lo que sugiere un consumo de disco muy bajo.
- GPU no necesaria para inferencia; no se publican datos de VRAM requerida.
- GPU para entrenamiento: el autor menciona una ejecucion en GPU para el corpus bilingue, pero no especifica modelos de tarjeta (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; la unica via documentada es el bucle Python/PyTorch del propio repositorio.
- Latencia y throughput: solo se reporta la latencia aproximada de inferencia en CPU; el throughput no esta disponible.

## Comparativa con modelos similares

No se conocen modelos comparables de la misma categoria (campo toroidal recurrente, byte-level y sin tokenizador) en la informacion disponible. Las unicas referencias presentes en la model card son controles internos del propio autor, no modelos de terceros:

| Referencia | Parametros | Contexto / memoria | Metrica reportada | Licencia |
|---|---|---|---|---|
| ATOM (atom-ai) | 479.548 (266.828 entrenables) | Campo persistente, reinicio cada 8.000 ticks; 2-3 bytes efectivos antes de la correccion | CE validacion 1,247 nats/byte | no disponible |
| Bigrama de bytes (control) | no disponible | 1 byte | CE validacion 1,950 nats/byte | no aplica |
| Trigrama de bytes (control) | no disponible | 2 bytes | CE validacion 0,959 nats/byte | no aplica |
| GRU pequena (control) | 123.904 | no disponible | CE validacion 0,099 nats/byte | no aplica |

Comparativa con alternativas comerciales o de gran escala: no disponible.

## Limitaciones y advertencias

- El propio autor advierte de que ATOM no produce texto coherente todavia, ni en frances ni en ingles.
- Los checkpoints publicados se entrenaron exclusivamente con datos en frances, pese a que el diseno es bilingue; no hay resultados en ingles.
- Las respuestas son mayormente independientes del prompt, lo que limita cualquier uso conversacional.
- El contexto efectivo fue de 2-3 bytes antes de la correccion y el valor alcanzado tras aplicar BPTT truncado y fuga aprendible no se completa en la informacion disponible.
- La licencia no esta especificada, por lo que no puede confirmarse su uso comercial ni las condiciones de redistribucion.
- Riesgo de alucinacion elevado: la salida mezcla palabras reales del corpus con pseudo-palabras, sin garantia de coherencia semantica.
- Modelo de investigacion experimental con 0 descargas y 0 likes; no hay evidencia de uso en produccion.
- No hay soporte documentado de tool calling, function calling ni agentes.
- Sesgos potenciales derivados del corpus frances (Wikipedia, Project Gutenberg y dialogos estilo OpenSubtitles), no analizados por el autor.
- Latencia en CPU de aproximadamente 2 segundos por respuesta corta, poco adecuada para aplicaciones interactivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thefinalboss/atom-ai
- Documentacion interna citada en la model card: `docs/ROOT_CAUSE.md`, `docs/DECODE_FIX_AND_BPTT.md`, `docs/MIX_DATA_LONG_MEMORY.md`, `docs/BATCHED_TRAINING.md` (rutas del propio repositorio).
- Checkpoints: `checkpoints/README.md` (ruta del propio repositorio).
- Nota sobre la busqueda web: los resultados obtenidos corresponden a proyectos homonimos no relacionados con este modelo (AI-ATOM en https://ai-atom.org/, ROCm/ATOM en https://github.com/ROCm/ATOM, The ATOM Report en https://arxiv.org/html/2604.07190v2 y Agora-Lab-AI/Atom en https://github.com/Agora-Lab-AI/Atom). No se han encontrado enlaces externos especificos de `thefinalboss/atom-ai` (paper, blog o demo).
