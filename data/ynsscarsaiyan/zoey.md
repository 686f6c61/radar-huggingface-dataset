# YNSScarSaiyan/zoey

## Resumen

Zoey es un sistema de Vector Symbolic Architecture (VSA) de tamaño fijo, no un transformer. Ha sido desarrollado por Dakuwon Moody en Saiyan Corp y se publica bajo licencia Apache 2.0. En lugar de utilizar matrices de atención y embeddings aprendidos, Zoey representa el lenguaje mediante hypervectores de 1000 trits y una memoria asociativa Hopfield. Su objetivo es ofrecer un modelo de lenguaje con un estado aprendido que no crece con el número de tokens procesados (O(1) en tamaño de archivo), lo que supone una alternativa experimental a las arquitecturas basadas en transformers.

El repositorio incluye checkpoints, un entrenador, un núcleo en Rust y copias de pesos de un profesor Qwen utilizados como fuente de destilación. Zoey no es un modelo drop-in de la librería `transformers`: no tiene capa de atención, ni tabla de embeddings entrenada, ni softmax para muestreo. Su ventana de procesamiento por defecto es de 2048 tokens del vocabulario GPT-2 BPE. El tamaño del repositorio es de 156.3 GB, aunque el checkpoint live es de aproximadamente 1.16 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector Symbolic Architecture (VSA), no transformer |
| Parametros totales | no disponible (no aplica: sistema VSA sin parametros entrenados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (ventana de procesamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (vocabulario GPT-2 BPE) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun etiquetas); checkpoint principal en JSON (~1.16 MB) |

## Arquitectura y entrenamiento

Zoey es una maquina de hypervectores de 1000 trits. Cada trit puede ser 0, 1 o 2, con valores centrados en -1, 0 y +1. Las operaciones algebraicas incluyen el "crazy-bind" (tabla de Malbolge, no invertible), el "trit-add bind" (suma y resta modulo 3, que si forma un grupo), el "bundle" (mayoria trit a trit), la rotacion circular y el "STI fold" (rotacion, suma de trits centrados y clamp a trit). La similitud entre hypervectores se mide como fraccion de trits coincidentes, y el producto escalar define la energia Hopfield.

La memoria del sistema se compone de varios bloques: una memoria de items Hopfield con los codigos `encode_token(id)` para el vocabulario GPT-2 (50,257 tokens mas filas reservadas, 50,263 en total), un "swarm" de 32 programas pequenos (Malbolge, Brainfuck y ZoeyDSL) junto con un hypervector de superposicion, y el "map5" (esquema 5) que contiene tablas de conteos de unidades LCU y una memoria dispersa en manifold (SDM). Las direcciones del map5 se generan a partir de prefijos de `encode_token` y almacenan conteos de tokens, no hypervectores enlazados. El esquema 4 (`map_acc`) queda como legado y no se usa en la ruta de lenguaje cuando `MAP_SCHEMA >= 5`.

El proceso de entrenamiento no es convencional: el estado aprendido es un checkpoint JSON que no crece con los tokens procesados. Se menciona una destilacion desde un profesor Qwen, pero no se detallan el numero de tokens, la composicion del dataset ni tecnicas como RLHF o DPO. La generacion no usa muestreo: es una lectura secuencial determinista que selecciona el token con mayor energia Hopfield, aplicando penalizaciones si la senal no es suficientemente nitida. La decodificacion Hopfield se implementa como un producto matriz-vector contra la memoria de items, con una ruta GPU en PyTorch/ROCm que se verifica contra el top-8 de Rust.

## Capacidades

- Generacion de texto secuencial determinista, sin muestreo estocastico.
- Memoria asociativa Hopfield para recuperacion de tokens a partir de hypervectores.
- Procesamiento de ventanas de contexto de hasta 2048 tokens con pesos de recencia decreciente.
- Incorporacion de sondas de n-gramas dentro de la ventana para generar atractores de siguiente token.
- Uso de programas Malbolge, Brainfuck y ZoeyDSL como componentes del sistema.
- Lectura de mapas de conteos (map5) con orden de prioridad k3, k2, k1, SDM y uni.
- No soporta tool calling, ni vision, ni audio (no documentado).
- Capacidades multilingues no disponibles.

## Casos de uso

No se han documentado casos de uso concretos en la informacion disponible. Los siguientes son usos potenciales derivados de su arquitectura experimental:

- Investigacion en representaciones hiperdimensionales: permite estudiar como las VSA pueden modelar lenguaje sin atencion ni embeddings aprendidos.
- Prototipos neurosymbolic: combina memoria asociativa Hopfield con programas simbolicos (Malbolge, Brainfuck, ZoeyDSL) para explorar razonamiento hibrido.
- Educacion en sistemas VSA: sirve como ejemplo de implementacion de hypercomputing y operaciones algebraicas sobre trits.
- Experimentacion con memoria Hopfield: facilita la evaluacion de decodificacion asociativa y recuperacion de items en espacios de alta dimension.
- Comparacion de arquitecturas no transformer: puede utilizarse en benchmarks academicos para contrastar el rendimiento de VSA frente a modelos basados en atencion.
- Docencia sobre compresion de modelos: demuestra un estado aprendido de tamano fijo (O(1)) independientemente del volumen de tokens procesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint principal es de aproximadamente 1.16 MB, por lo que la inferencia puede ejecutarse en CPU.
- La memoria Hopfield requiere una matriz de 50,263 x 1000 trits, que puede almacenarse en RAM.
- Existe una ruta GPU (PyTorch/ROCm) para acelerar el producto matriz-vector y el top-k de la decodificacion Hopfield.
- No se han publicado datos de latencia ni de throughput.
- No se especifica la VRAM minima necesaria, aunque al tratarse de un sistema VSA compacto la carga es reducida.
- El repositorio completo ocupa 156.3 GB, pero el modelo operativo no requiere cargar todo ese contenido.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada, dado que Zoey es un sistema VSA no transformer.

## Limitaciones y advertencias

- No es un modelo drop-in de la libreria `transformers`: no tiene atencion, ni embeddings aprendidos, ni softmax para generacion.
- La ventana de contexto esta limitada a 2048 tokens del vocabulario GPT-2 BPE.
- El valor `ppl=` registrado en el esquema 5 no es perplexidad GPT-2, sino una metrica derivada de conteos LCU que colapsa cerca de 2 cuando los conteos son bajos.
- No se han evaluado sesgos ni riesgos de alucinacion.
- El soporte de idiomas no esta documentado; el vocabulario GPT-2 BPE esta orientado principalmente a ingles.
- No soporta tool calling ni capacidades multimodales.
- Es un sistema experimental en desarrollo, con una arquitectura no estandar que puede dificultar su integracion en pipelines convencionales.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre entrenamiento y datos puede limitar su adopcion en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/YNSScarSaiyan/zoey
