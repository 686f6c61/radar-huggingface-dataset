# wnstsc/Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF

## Resumen

Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF es una distribucion de pesos en formato GGUF del modelo luvette/Qwen3.5-2B-MoE-A1.3B-abliterated, una variante "abliterated" (con las direcciones de rechazo suprimidas) del modelo base Qwen3.5-2B-MoE-A1.3B. La publica el usuario wnstsc en Hugging Face y las cuantizaciones las genera mradermacher. El modelo pertenece a la familia Qwen3.5 con arquitectura MoE y un modulo denominado delta_net segun las etiquetas del repositorio.

El modelo resuelve el problema de ejecutar localmente un modelo conversacional de ~1.900 millones de parametros totales con una ventana de contexto que, segun la nomenclatura de la familia, corresponde a la generacion Qwen3.5, aunque el dato concreto de longitud de contexto no aparece en la informacion disponible. Su relevancia actual radica en que ofrece un MoE de baja activacion (1.300 millones de parametros activos segun el nombre del modelo) en cuantizaciones que van de 1,1 GB a 3,9 GB, lo que permite desplegarlo en hardware de consumo.

El repositorio contiene 12 archivos GGUF (Q2_K a f16) generados a partir del modelo base en transformers. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. No hay pipeline declarado ni resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) con modulo delta_net, etiqueta qwen3_5_moe |
| Parametros totales | 1.888.165.696 (~1,89 B) |
| Parametros activos | ~1,3 B (segun el nombre del modelo; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo de mezcla de expertos (MoE) de la familia Qwen3.5, con la etiqueta especifica qwen3_5_moe y una arquitectura que incorpora un componente llamado delta_net. No se detalla en la model card el numero de expertos, la estrategia de enrutamiento ni la composicion del dataset de entrenamiento. El dato de parametros totales (1.888.165.696) procede de los safetensors del modelo base.

La variante "abliterated" implica una modificacion post-entrenamiento orientada a suprimir las direcciones de activacion asociadas al rechazo de peticiones, lo que produce un modelo "uncensored". No se especifica en la informacion disponible la tecnica exacta empleada (por ejemplo, proyeccion ortogonal de direcciones de rechazo), el volumen de datos de entrenamiento, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal mas alla de la mencion a delta_net.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta conversational en el repo).
- Razonamiento y respuesta multi-turno, segun la naturaleza del modelo base Qwen3.5.
- Modo "uncensored": menor tendencia a rechazar peticiones gracias a la abliteracion.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Carga mediante transformers y mediante el ecosistema GGUF (llama.cpp y derivados).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking explicito.
- Capacidad multilingue limitada al ingles declarado.

## Casos de uso

- Inferencia local en equipos de sobremesa: con cuantizaciones Q4_K_M de 1,4 GB, el modelo cabe en GPU de consumo y en CPU con RAM modesta, lo que permite prototipar asistentes conversacionales sin infraestructura en la nube.
- Experimentacion con modelos abliterated: util para investigadores que estudian el efecto de la supresion de direcciones de rechazo sobre el comportamiento del modelo y su alineacion.
- Generacion de texto creativo sin filtros: la variante uncensored resulta adecuada para ficcion, guiones o lluvia de ideas donde los filtros estandar resultan restrictivos, siempre con supervision humana.
- Despliegue en entornos con recursos limitados: el tamano de 1,1-2,1 GB de las cuantizaciones Q2 a Q8 permite ejecutarlo en dispositivos edge, Raspberry Pi de gama alta o portatiles sin GPU dedicada mediante llama.cpp.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que facilita estudios de degradacion de calidad frente a tamano (Q2_K frente a Q8_0 frente a f16).
- Base para fine-tuning o destilacion: al ser Apache 2.0, puede servir como punto de partida para ajustes especificos en ingles sobre tareas acotadas, aunque su tamano reducido limita el rendimiento en tareas complejas.
- Chatbot de soporte en ingles para demos: su naturaleza conversacional y su baja huella de memoria permiten montar prototipos rapidos de atencion al cliente en ingles, con la advertencia de que la ausencia de benchmarks impide garantizar calidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (Q2_K), 1,4 GB (Q4_K_M), 2,1 GB (Q8_0) y 3,9 GB (f16), a los que hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para las cuantizaciones bajas; una RTX 3060, RTX 4060 o RTX 4090 pueden ejecutar el modelo con holgura. En A100 o H100 el modelo queda sobredimensionado en memoria y el cuello de botella sera la latencia, no la VRAM.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.), y en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF. El modelo base en safetensors puede cargarse con transformers.
- Latencia y throughput: no se proporcionan datos medidos en la informacion disponible. Por el tamano (1,3 B activos) se espera una generacion rapida en GPU de consumo, pero no hay cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF (este) | ~1,89 B | ~1,3 B | no disponible | Apache 2.0 | GGUF |
| Modelo base luvette/Qwen3.5-2B-MoE-A1.3B-abliterated | ~1,89 B | ~1,3 B | no disponible | Apache 2.0 | safetensors |
| Alternativas de ~2 B densos (familia Qwen3.5) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de contexto de modelos comparables de la misma familia, por lo que la comparativa cuantitativa queda limitada a parametros y licencia.

## Limitaciones y advertencias

- La abliteracion elimina parte de los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ofensivo o inexacto; no es recomendable su uso en produccion sin filtros adicionales.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (~1,3 B activos) y la ausencia de benchmarks que validen su calidad.
- Solo soporta ingles declarado; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar cargas con ventanas largas.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la naturaleza uncensored puede incumplir politicas de plataformas o normativas sectoriales; conviene revisar el cumplimiento legal antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Las cuantizaciones Q2_K y Q3 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wnstsc/Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF
- Modelo base: https://huggingface.co/luvette/Qwen3.5-2B-MoE-A1.3B-abliterated
- Pagina de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF
- Pagina de resumen de descargas: https://hf.tst.eu/model#Qwen3.5-2B-MoE-A1.3B-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
