# ZAQERIS/ZAQERIS_AXIOM

## Resumen

AXIOM (identificador `ZAQERIS/ZAQERIS_AXIOM`) es un modelo de lenguaje de tipo Mixture-of-Experts disperso desarrollado por ZAQERIS AI, un grupo de investigacion independiente de codigo abierto con sede en Egipto. El modelo se entreno desde cero y se publica bajo licencia Apache 2.0, con un enfoque explicito en el soporte del arabe (incluida la variante egipcia) y el ingles. La arquitectura declara 79.430 millones de parametros totales con 12.390 millones activos por token, distribuidos en 36 capas decodificadoras con 16 expertos por capa y enrutamiento top-2.

El checkpoint publico se empaqueta con ZAQERIS-M3, un formato de cuantizacion vectorial por debajo de 3 bits (3,16 bits por parametro) que reduce el peso en disco a 29,20 GiB repartidos en 36 shards de safetensors. Esto lo hace manejable en una sola GPU de 48 GB o en configuraciones mixtas GPU+RAM, algo poco habitual en modelos de esta escala. La ventana de contexto nativa es de 131.072 tokens, extensible a 1.048.576 mediante YaRN con factor 8,0.

Su relevancia actual radica en dos factores: la combinacion de un modelo MoE de gran escala con un esquema de cuantizacion agresivo y abierto, y la orientacion bilingue arabe-ingles en un ecosistema donde los modelos de pesos abiertos con cobertura real del arabe son escasos. La model card advierte de que el contador de parametros del Hub muestra ~30B porque cuenta elementos tensoriales almacenados, no parametros logicos descomprimidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE), clase `ZaqerisAxiomForCausalLM` (`model_type`: `zaqeris_axiom`) |
| Parametros totales | 79.430 millones (79.425.295.488) |
| Parametros activos | 12.390 millones por token (12.390.618.240) |
| Longitud de contexto | 131.072 tokens nativo; 1.048.576 con YaRN (factor 8,0) |
| Tipos de cuantizacion | ZAQERIS-M3 a 3,16 bits por parametro (3,1583 bpp); pesos empaquetados principalmente como `uint8` |
| Idiomas soportados | Arabe (incluye egipcio) e ingles; etiqueta multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (36 shards, 29,20 GiB); requiere `trust_remote_code=True` |

| Parametro adicional | Valor |
|---|---|
| Capas decodificadoras | 36 |
| Expertos por capa | 16, enrutamiento top-2 |
| Hidden size / FFN de experto | 4224 / 10496 |
| Atencion | GQA, 32 cabezas de consulta / 8 de clave-valor, dimension de cabeza 128 |
| RoPE theta | 5.000.000,0 |
| Vocabulario | 148.480 tokens (`ZaqerisAxiomTokenizer`) |
| Tokens especiales | pad 148458 (`<|axiom_pad_0|>`), bos 148459 (`<|im_start|>`), eos 148460 (`<|im_end|>`) |
| Tamano del repo | 31,4 GB |

## Arquitectura y entrenamiento

AXIOM es un transformer decoder-only con capas MoE: 36 capas, 16 expertos por capa y enrutamiento top-2, con un tamano oculto de 4224 y una FFN de experto de 10496. La atencion usa Grouped-Query Attention con 32 cabezas de consulta y 8 de clave-valor (dimension de cabeza 128), lo que reduce el coste de la cache KV frente a atencion multi-cabeza completa. El tokenizador es propio (`ZaqerisAxiomTokenizer`) con 148.480 entradas y un runtime de coincidencia de prefijos mediante radix-trie implementado en `tokenization_zaqeris_axiom.py`. El RoPE emplea un theta de 5.000.000,0, coherente con la extension de contexto via YaRN.

El modelo se entrena desde cero, pero la informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion lineal. La innovacion tecnica mas destacable y documentada es ZAQERIS-M3, el esquema de cuantizacion vectorial sub-3-bit que empaqueta los pesos en `uint8` y reduce el peso en disco de los ~147,94 GiB que ocuparia en FP16 a 29,20 GiB. El repositorio incluye un plugin de vLLM (`vllm_axiom_plugin.py`) que registra la clase del modelo y el metodo de cuantizacion `zaqeris_m3` para servir en Linux/CUDA.

## Capacidades

- Generacion de texto autoregresiva bilingue arabe-ingles, con enfasis declarado en el arabe y la variante egipcia.
- Razonamiento y generacion de codigo: la model card incluye ejemplos de generacion de funciones Python (busqueda binaria) y explicacion de complejidad.
- Contexto largo: ventana nativa de 131.072 tokens y extension a 1.048.576 con YaRN, adecuada para documentos extensos y conversaciones multi-turno largas.
- Plantilla de chat integrada con tokens especiales `<|im_start|>` y `<|im_end|>`, compatible con `apply_chat_template`.
- Servido mediante vLLM con plugin propio, y endpoint local compatible con `/v1/chat/completions` si vLLM no esta instalado.
- Soporte de carga en Transformers con `trust_remote_code=True` y `device_map="auto"` para reparto GPU+RAM.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Atencion al cliente en arabe e ingles: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a sus 131.072 tokens nativos, lo que permite arrastrar historial extenso y documentacion de producto sin truncar.
- Procesamiento de documentos legales o administrativos en arabe: con la extension YaRN a 1.048.576 tokens se pueden analizar contratos o expedientes completos en una sola pasada, algo relevante para el mercado egipcio y del Golfo.
- Generacion de codigo asistida: el modelo produce funciones y explicaciones tecnicas; puede integrarse en asistentes de IDE o pipelines de revision, aunque sin soporte documentado de tool calling.
- Analisis de conversaciones y transcripciones largas: resumen y extraccion de informacion en entornos bilingues donde se mezcla arabe dialectal y terminos tecnicos en ingles.
- Despliegue en infraestructura limitada: con 29,20 GiB en disco y cuantizacion de 3,16 bpp, es viable en una unica GPU de 48 GB o en configuracion GPU+RAM, lo que permite prototipado local sin clústeres multi-GPU.
- Investigacion en cuantizacion extrema: ZAQERIS-M3 sirve como caso de estudio reproducible para evaluar la perdida de calidad de un MoE de 79B a 3,16 bpp frente a FP16.
- Traduccion y localizacion arabe-ingles: util para equipos que necesitan un modelo de pesos abiertos con cobertura real del arabe y licencia permisiva para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos empaquetados ocupan 29,20 GiB; hay que sumar activaciones y cache KV. Con contexto nativo de 131.072 tokens la cache KV es considerable, por lo que conviene dimensionar segun la longitud real de contexto.
- GPU recomendadas: A100 80 GB o H100 para contexto largo y mayor throughput; A100 40 GB o L40S 48 GB para contexto moderado; configuracion `device_map="auto"` con GPU + RAM del sistema para GPUs de menor capacidad.
- Cabe en GPU de consumo: no hay confirmacion en la informacion disponible; con 29,20 GiB de pesos, una RTX 4090 de 24 GB no es suficiente por si sola y requeriria reparto con RAM del sistema, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; vLLM mediante `vllm_axiom_plugin.py` (Linux/CUDA); endpoint local `/v1/chat/completions` a traves del mismo script si vLLM no esta instalado. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| ZAQERIS AXIOM | 79,43B / 12,39B | 131.072 nativo; 1.048.576 con YaRN | Apache 2.0 | safetensors con ZAQERIS-M3 (3,16 bpp), 29,20 GiB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones verificadas de modelos alternativos de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real frente a modelos establecidos no esta verificado de forma independiente.
- La model card no documenta la composicion del dataset de entrenamiento ni si hubo RLHF/DPO; el riesgo de sesgos y de alucinacion no puede acotarse con datos publicos.
- El soporte linguistico declarado se limita a arabe e ingles; el rendimiento en otras lenguas no esta garantizado pese a la etiqueta multilingue.
- La cuantizacion a 3,16 bpp puede introducir perdida de calidad respecto a FP16; no se documenta la degradacion medida.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor; conviene auditar `modeling_*.py`, `configuration_*.py` y `tokenization_zaqeris_axiom.py` antes de usarlo en produccion.
- El contador del Hub muestra ~30B parametros porque cuenta elementos almacenados; herramientas de terceros pueden reportar cifras inconsistentes con los 79,43B reales.
- El plugin de vLLM esta pensado para Linux/CUDA; no se documenta soporte en otros backends ni en CPU.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el proyecto depende de un grupo de investigacion independiente y de financiacion via Patreon.
- El Space de chat en vivo no esta operativo segun la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZAQERIS/ZAQERIS_AXIOM
- Repositorio GitHub: https://github.com/ZAQERIS/ZAQERIS
- Cuenta en X: https://x.com/ZAQERIS_Ai
- Patreon: https://www.patreon.com/c/ZAQERISAI
- Explorador de arquitectura: https://huggingface.co/spaces/ZAQERIS/AXIOM-Architecture-Explorer
