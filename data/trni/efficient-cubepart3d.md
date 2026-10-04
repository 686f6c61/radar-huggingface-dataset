# TrNi/efficient-cubepart3d

## Resumen

TrNi/efficient-cubepart3d es una cuantizacion INT4 del transformer de difusion de CubePart, el modelo de generacion de mallas 3D con descomposicion en partes y vocabulario abierto desarrollado por Roblox (paper arXiv 2605.28763, SIGGRAPH 2026). El modelo base genera mallas 3D a partir de texto y permite controlar explicitamente las partes que componen el objeto, y esta version cuantizada reduce el espacio en disco del transformer de difusion de 8,582 GB a 1,479 GB (un 82,8% menos) y el pico de VRAM durante la generacion de 33,71 GiB a 27,09 GiB (un 19,6% menos).

La relevancia de esta ficha reside en que la generacion 3D de alta calidad suele chocar con el limite de memoria de las GPU disponibles, y una cuantizacion W4A16 con HQQ a group size 128 permite acercar la carga a tarjetas de 44 GiB como la L40S. El coste asumido es la latencia: el modelo INT4 tarda entre 66,5 y 66,9 s por generacion frente a los 34,7-34,8 s del BF16, porque `torch.compile` no puede aplicarse a CubePart y la desquantizacion se ejecuta en modo eager.

Se trata de un checkpoint publicado por TrNi (autor tambien de efficient-cube3d, la version INT4 de Cube3D) con licencia OpenRAIL, 0 descargas y 2 likes en el momento de redactar esta ficha, y un tamano de repositorio de 1,5 GB. Los idiomas soportados no estan documentados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de mallas 3D con descomposicion en partes, sobre el modelo base CubePart de Roblox |
| Parametros totales | 2145,6 M parametros lineales en el `diffusion_model`; total del pipeline (incluye encoder de texto y VAE) no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion 3D; no se especifica ventana de contexto de texto) |
| Tipos de cuantizacion | INT4 weight-only (W4A16) con HQQ, group size 128, mediante `torchao.quantization.int4_weight_only(group_size=128, use_hqq=True)` |
| Idiomas soportados | No disponible |
| Licencia | OpenRAIL |
| Formato de pesos | Checkpoint PyTorch cuantizado (torchao/HQQ); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del transformer de difusion que forma parte del pipeline CubePart, orientado a generacion de mallas 3D controlables por partes y con vocabulario abierto. El pipeline completo descrito en la model card incluye un encoder de texto Qwen3-VL (`base_model.text_encoder`), un VAE de forma (`shape_model`), el propio transformer de difusion (`diffusion_model`) y un paso de extraccion de malla. La cuantizacion se aplica unicamente a las capas `nn.Linear` dentro de `transformer_blocks` y `multi_transformer_blocks` del `diffusion_model`: aproximadamente 2134 M de los 2145,6 M de parametros lineales, es decir, el 99,5%. Quedan sin cuantizar `img_in`, `txt_in`, `proj_out`, `pos_embed`, `time_text_embed`, todas las capas cuyo nombre contiene `norm`, el VAE de forma y el encoder de texto.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. La innovacion tecnica destacable de esta publicacion es la eleccion del metodo de cuantizacion: se emplea HQQ en lugar de un simple redondeo al vecino mas cercano porque la ruta de empaquetado tinygemm por defecto de torchao provocaba un error de tipo ("Expected zeros dtype float32, got bfloat16") en las versiones 0.10 a 0.13 probadas. HQQ evita esa ruta y no necesita datos de calibracion. La cuantizacion tarda entre 4,1 y 4,3 s.

## Capacidades

- Generacion de mallas 3D a partir de texto (pipeline `text-to-3d`), con descomposicion en partes (2 a 4 partes por prompt en el benchmark reportado).
- Generacion de 3D con vocabulario abierto y control explicito de las partes que componen el objeto.
- Composicion y descomposicion de partes para edicion posterior de la malla.
- Ejecucion en precision INT4 con calidad casi identica a BF16 en la parte tipica (distancia chamfer mediana de 0,0114 por parte).
- No soporta tool calling, function calling ni comportamiento de agente: es un modelo de generacion 3D, no un modelo de lenguaje conversacional.
- Capacidades multilingues: no documentadas (dependen del encoder de texto Qwen3-VL, pero la model card no especifica idiomas).
- Capacidades especiales: cuantizacion W4A16 sin datos de calibracion mediante HQQ; requiere mantener `torch.compile` desactivado.

## Casos de uso

- Generacion de assets 3D para videojuegos: el modelo produce mallas con partes diferenciadas a partir de una descripcion textual, lo que permite generar props y objetos directamente en el formato de partes que el motor puede manipular por separado.
- Prototipado rapido con partes editables: al descomponer el objeto en partes, un artista puede regenerar o sustituir un componente concreto (por ejemplo, el brazo de una silla) sin rehacer la malla completa.
- Despliegue en GPU de gama profesional con memoria ajustada: con un pico medido de 27,09 GiB frente a los 33,71 GiB del BF16, encaja en tarjetas de 40-44 GiB como la L40S empleada en las mediciones.
- Investigacion en cuantizacion de diffusion transformers 3D: sirve como referencia reproducible para estudiar el impacto de W4A16 con HQQ en generacion 3D con descomposicion en partes.
- Automatizacion de pipelines de contenido 3D bajo demanda: integrable en un servicio por lotes donde la latencia de 66,5-66,9 s por malla es aceptable y prima el ahorro de disco (1,479 GB) y de VRAM.
- Generacion de modelos para impresion 3D o fabricacion: la salida en mallas con partes separadas facilita el ensamblaje fisico de componentes impresos por separado.
- Catalogos de e-commerce o visualizacion de producto: generacion de variantes 3D a partir de descripciones textuales para vistas interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no es un modelo de lenguaje. La model card publica un benchmark de calidad geometrica basado en distancia chamfer sobre 250 prompts, 12 categorias y 828 partes en total (5000 muestras de superficie sembradas por parte; los prompts provienen de la suite master de 310 de `TrNi/efficient-cube3d`, excluyendo las categorias `abstract_mathematical`, `geometric_primitive` y `symmetry_topology`).

CD(A,B): misma entrada de malla BF16 Cube3D, CubePart BF16 frente a CubePart INT4. CD(C,D): misma entrada de malla INT4 Cube3D, CubePart BF16 frente a CubePart INT4.

| Metrica | min | mediana | media | max |
|---|---|---|---|---|
| CD(A,B) | 0,0011 | 0,0114 | 0,0193 | 0,8206 |
| CD(C,D) | 0,0014 | 0,0118 | 0,0239 | 1,6261 |

| Categoria | n | CD(A,B) mediana | CD(A,B) media | CD(A,B) max | CD(C,D) mediana | CD(C,D) media | CD(C,D) max |
|---|---|---|---|---|---|---|---|
| animal_domestic | 77 | 0,0100 | 0,0307 | 0,8206 | 0,0093 | 0,0249 | 0,7246 |
| animal_wild | 78 | 0,0106 | 0,0158 | 0,1654 | 0,0106 | 0,0220 | 0,5996 |
| architecture | 61 | 0,0162 | 0,0173 | 0,0541 | 0,0193 | 0,0270 | 0,3630 |
| electronics | 60 | 0,0141 | 0,0165 | 0,0835 | 0,0135 | 0,0197 | 0,2594 |
| fine_detail | 58 | 0,0142 | 0,0161 | 0,0512 | 0,0161 | 0,0245 | 0,0999 |
| furniture | 62 | 0,0131 | 0,0356 | 0,4662 | 0,0125 | 0,0153 | 0,0617 |
| musical_instrument | 69 | 0,0096 | 0,0177 | 0,1520 | 0,0110 | 0,0697 | 1,6261 |
| nature_plant | 61 | 0,0138 | 0,0167 | 0,1059 | 0,0134 | 0,0143 | 0,0541 |
| original_visuals | 107 | 0,0118 | 0,0203 | 0,3210 | 0,0113 | 0,0226 | 0,6126 |
| tool_hardware | 56 | 0,0094 | 0,0168 | 0,2186 | 0,0086 | 0,0200 | 0,2537 |
| vehicle_air_water | 68 | 0,0093 | 0,0130 | 0,1371 | 0,0081 | 0,0124 | 0,1168 |
| vehicle_land | 71 | 0,0097 | 0,0132 | 0,1608 | 0,0104 | 0,0127 | 0,1108 |

La mediana es de aproximadamente 0,011 en ambos pares y la media esta por encima debido a una cola delgada de errores. Los errores mas grandes corresponden a partes pequenas o finas junto a una parte dominante: por ejemplo, una cabeza de pavo real con 0,8206 en CD(A,B), y un clavijero de contrabajo con 1,6261 y los trastes de un sitar con 1,2668 en CD(C,D). CD(C,D) es peor que CD(A,B) en las estadisticas globales pero mejor en algunas categorias, por lo que se trata de una tendencia agregada leve y no de una regla por malla.

Metricas de eficiencia (medidas en una NVIDIA L40S de 44 GiB utilizables, PyTorch 2.8.0+cu128, torchao 0.11.0, modo eager, 50 pasos de difusion, guidance scale 7.5, sobre 10 mallas de 10 categorias distintas, en dos ejecuciones independientes):

| Metrica | BF16 | INT4 |
|---|---|---|
| Pico de VRAM durante la generacion | 33,71 GiB | 27,09 GiB |
| Latencia por generacion (media de 10 mallas) | 34,7 a 34,8 s | 66,5 a 66,9 s |
| Tiempo de setup (carga del pipeline) | 149,4 a 161,8 s | 153,5 a 166,1 s |
| Tiempo de cuantizacion | no aplica | 4,1 a 4,3 s |
| Transformer de difusion en disco | 8,582 GB | 1,479 GB |

## Requisitos de hardware

- VRAM estimada: pico medido de 27,09 GiB durante la generacion en INT4, que incluye el encoder de texto Qwen3-VL, el VAE de forma y el paso de extraccion de malla.
- GPU recomendadas: la medicion se realizo sobre una NVIDIA L40S con 44 GiB utilizables. No se probaron GPU mas pequenas.
- GPU consumer: no se espera que el workload encaje tal cual en una tarjeta de 24 GB, dado el pico medido de 27,09 GiB.
- Opciones de despliegue: PyTorch 2.8.0+cu128 con torchao 0.11.0 (ruta HQQ). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Limitacion de carga: el archivo INT4 se aplica sobre un pipeline instanciado; no existe una ruta de carga directa solo-INT4. El setup implica cargar primero el pipeline BF16 y cuantizar despues (153,5 a 166,1 s).
- Latencia: 66,5 a 66,9 s por generacion en INT4 frente a 34,7-34,8 s en BF16. `torch.compile` debe permanecer desactivado para CubePart, de modo que la desquantizacion corre en modo eager.
- Rendimiento: el INT4 es mas lento que el BF16 en esta version; la ventaja es de memoria y disco, no de velocidad.
- Unidades: los tamanos de archivo son GB decimales (bytes exactos: 1.478.846.193 para el checkpoint INT4 y 8.582.452.032 para el transformer BF16); las cifras de VRAM son GiB (2^30 bytes) tomadas de `torch.cuda.max_memory_allocated()`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrNi/efficient-cubepart3d | Cuantizacion INT4 HQQ de CubePart (text-to-3D con partes) | 2145,6 M lineales en el transformer de difusion | No aplica | OpenRAIL | HuggingFace, 0 descargas |
| Roblox/cubepart | Modelo base BF16, generacion 3D con partes | No disponible (transformer de difusion de 8,582 GB en BF16) | No aplica | OpenRAIL (segun el modelo base) | HuggingFace |
| TrNi/efficient-cube3d | Cuantizacion INT4 HQQ de Cube3D (text-to-3D) | No disponible | No aplica | No disponible en la informacion | HuggingFace |

No se dispone de datos comparativos de rendimiento frente a alternativas de generacion 3D de otros autores en la informacion proporcionada. La comparacion directa disponible es contra CubePart en BF16 y contra la version INT4 de Cube3D del mismo autor.

## Limitaciones y advertencias

- La cuantizacion INT4 es mas lenta que el BF16 (66,5-66,9 s frente a 34,7-34,8 s por generacion), porque `torch.compile` no puede aplicarse a CubePart y la desquantizacion se ejecuta en modo eager.
- Los errores de cuantizacion se concentran en partes pequenas o finas situadas junto a una parte dominante (por ejemplo, cabeza de pavo real, clavijero de contrabajo, trastes de sitar), con distancias chamfer que llegan a 0,8206 y 1,6261 en los peores casos.
- El pico de 27,09 GiB implica que no se espera que el modelo encaje en una GPU de 24 GB tal y como esta configurado; no se han probado GPU menores que la L40S.
- No existe una ruta de carga directa solo-INT4: hay que cargar el pipeline BF16 y cuantizar despues, con un coste de setup de 153,5 a 166,1 s.
- Los idiomas soportados no estan documentados; las capacidades multilingues dependen del encoder de texto Qwen3-VL y no se detallan en la model card.
- La licencia es OpenRAIL, sujeta a las restricciones de uso de este tipo de licencia (no es una licencia permisiva sin condiciones); conviene revisar los terminos antes de un uso comercial.
- Riesgo de sesgos y alucinacion: no se documenta informacion especifica sobre sesgos del modelo base ni sobre la fidelidad textual de las mallas generadas mas alla de la metrica de distancia chamfer.
- El modelo tiene 0 descargas y 2 likes, por lo que es una publicacion reciente y sin validacion independiente amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TrNi/efficient-cubepart3d
- Modelo base CubePart (Roblox): https://huggingface.co/Roblox/cubepart
- Paper CubePart (arXiv 2605.28763): https://arxiv.org/abs/2605.28763
- Companion Cube3D INT4 (mismo autor): https://huggingface.co/TrNi/efficient-cube3d
