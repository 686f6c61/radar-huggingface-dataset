# TrNi/efficient-cube3d

## Resumen

Efficient-Cube3D es la primera version cuantizada a INT4 del modelo Cube3D v0.5 de Roblox, un generador de mallas 3D a partir de texto (text-to-3D). Lo publica el usuario independiente TrNi como post-entrenamiento de cuantizacion sobre el checkpoint original `Roblox/cube3d-v0.5`, usando la libreria torchao y el metodo RTN W4A16 con group_size=128. No es un modelo nuevo: es una redistribucion optimizada de los mismos pesos, orientada a reducir requisitos de memoria sin retocar el pipeline de inferencia.

La relevancia practica esta en el ahorro de recursos. El checkpoint original en BF16 ocupa 7,17 GB y alcanza un pico de 25,4 GB de VRAM con el motor rapido; esta version baja a 1,26 GB de pesos (82 por ciento menos) y 11,3 GB de pico de VRAM (55 por ciento menos), lo que permite ejecutar generacion text-to-3D en una unica GPU de 15 GB como una NVIDIA L4, A10 o A2. La latencia declarada es de 14,2 s por generacion, practicamente identica a la del modelo BF16 con motor rapido (15,0 s), y el tiempo de arranque cae de 206,9 s a 6,9 s.

El pipeline se compone de dos piezas: un transformer autorregresivo (shape GPT) que genera tokens de forma y un decodificador VQ-VAE (shape tokenizer) que los convierte en malla. Solo se cuantiza el GPT; el decodificador se mantiene intacto en BF16. El modelo se distribuye con licencia OpenRAIL y esta pensado para investigacion y prototipado en hardware de gama media, no para pipelines de produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (shape GPT) para generacion de tokens de forma + decodificador VQ-VAE (shape tokenizer) para reconstruir la malla |
| Parametros totales | no disponible (el checkpoint BF16 original ocupa 7,17 GB, coherente con un orden de magnitud de miles de millones de parametros, pero el autor no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 por RTN (round-to-nearest), group_size=128, via `torchao.int4_weight_only`; el checkpoint base esta en BF16 |
| Idiomas soportados | no disponible (el pipeline es text-to-3D; no se documentan idiomas del codificador de texto) |
| Licencia | openrail (Open RAIL) |
| Formato de pesos | `shape_gpt_rtn_int4_g128.pt` (pickle de torchao para los pesos INT4 del GPT) y `shape_tokenizer.safetensors` (decodificador VQ-VAE en BF16); configuracion en `open_model_v0.5.yaml` y metadatos en `quant_config.json` |

## Arquitectura y entrenamiento

El modelo base Cube3D v0.5, descrito en el paper "Cube: A Roblox View of 3D Intelligence" (arXiv:2503.15475), es un generador de mallas 3D condicionado por texto. La arquitectura combina un transformer autorregresivo que emite tokens de forma (con cabezas auxiliares visibles en la configuracion de cuantizacion: `shape_proj` con in_features=16, `bbox_proj` y un `lm_head` con salida de 4099 unidades, lo que situa el vocabulario en torno a 4096 tokens mas especiales) y un decodificador VQ-VAE que transforma esa secuencia discreta en geometria de malla.

Esta version no reentrena nada: aplica cuantizacion post-entrenamiento de solo pesos. De las 282 capas del GPT, 279 se cuantizan a INT4 y 3 se omiten por incompatibilidad con el esquema de grupos (`shape_proj`, con solo 16 caracteristicas de entrada, por debajo del tamano de grupo; `lm_head`, por ser la cabeza de salida; y `bbox_proj`). Las activaciones permanecen en BF16 (esquema W4A16), de modo que los kernels de torchao pueden ejecutar la inferencia sin degradar el throughput. No se documentan fases de RLHF, DPO ni ajuste por preferencias, ni la composicion exacta del dataset de entrenamiento original.

## Capacidades

- Generacion de mallas 3D a partir de descripciones textuales (pipeline `text-to-3d`).
- Produccion de formas en 15 categorias evaluadas: animales domesticos y salvajes, vehiculos terrestres, aereos y acuaticos, arquitectura, mobiliario, instrumentos musicales, primitivas geometricas, electronica, plantas y naturaleza, herramientas y ferreteria, detalle fino, visuales originales, matematicas abstractas y topologia simetrica.
- Reconstruccion de geometria con detalle fino en categorias sencillas (distancia de Chamfer mediana de 52,2 x 10⁻³ en vehiculos terrestres y 55,0 x 10⁻³ en animales domesticos).
- Inferencia con los mismos pesos que el modelo base, por lo que hereda sus capacidades y sus fallos; la cuantizacion no anade funciones nuevas.
- No se documenta soporte de tool calling, function calling, modo agente, razonamiento multi-paso, vision, audio ni modo de pensamiento. Es un modelo generativo unimodal (texto a geometria).

## Casos de uso

- Prototipado de assets 3D en estudio indie: un artista escribe una descripcion y obtiene una malla base en unos 14 s sobre una GPU de 15 GB, que luego retoca en Blender; el coste de iteracion es bajo porque cada generacion no requiere reservar una GPU de 24 GB o mas.
- Generacion por lotes en una sola GPU de gama media: con 11,3 GB de pico de VRAM, una L4 o A10 puede procesar prompts de forma secuencial para construir un catalogo de variantes de un mismo objeto cambiando el texto de entrada.
- Docencia e investigacion en generacion 3D: el modelo cabe en un portatil con GPU de 16 GB o en una instancia cloud barata, lo que permite reproducir experimentos de generacion de mallas sin acceso a clústeres.
- Pruebas de concepto de herramientas de contenido para videojuegos: generar primitivas geometricas, mobiliario o vehiculos como borradores de nivel antes de modelado manual.
- Evaluacion de tecnicas de cuantizacion: sirve como caso de estudio reproducible de RTN W4A16 con torchao, ya que incluye la configuracion exacta, las capas omitidas y una tabla de calidad por categoria.
- Filtrado de ideas en diseno industrial: generar variantes rapidas de formas (herramientas, componentes abstractos) para descartar propuestas antes de invertir tiempo en CAD, asumiendo que las categorias complejas tienen mayor varianza.
- Demostraciones interactivas en ferias o aulas: el arranque de 6,9 s y la latencia de 14,2 s permiten una demo en vivo sin tiempos de espera largos.

## Benchmarks y rendimiento

El autor publica un conjunto de evaluacion propio de 15 categorias y 310 prompts, con distancia de Chamfer (CD) como metrica de calidad de forma (valores x 10⁻³, menor es mejor). No hay resultados de MMLU, HumanEval ni GSM8K porque el modelo no es de lenguaje.

| Categoria | Mediana | Media | Desv. tipica | n |
|---|---:|---:|---:|---:|
| animal_domestic | 55,0 | 60,4 | 25,5 | 20 |
| vehicle_land | 52,2 | 61,1 | 39,0 | 20 |
| architecture | 54,0 | 61,7 | 29,9 | 20 |
| musical_instrument | 43,1 | 79,0 | 86,3 | 20 |
| animal_wild | 65,2 | 80,4 | 45,2 | 20 |
| geometric_primitive | 40,8 | 81,0 | 90,2 | 20 |
| furniture | 74,9 | 82,5 | 39,8 | 20 |
| fine_detail | 57,7 | 83,3 | 72,8 | 20 |
| original_visuals | 71,6 | 79,5 | 47,3 | 30 |
| vehicle_air_water | 77,8 | 97,5 | 78,9 | 20 |
| electronics | 97,4 | 126,4 | 79,3 | 20 |
| nature_plant | 111,3 | 132,0 | 69,9 | 20 |
| tool_hardware | 63,7 | 139,5 | 193,7 | 20 |
| abstract_mathematical | 107,2 | 147,4 | 124,2 | 20 |
| symmetry_topology | 113,6 | 176,5 | 169,5 | 20 |

Mediana global de distancia de Chamfer: 67,7 x 10⁻³. El autor no incluye en la model card una tabla equivalente para el modelo BF16 de referencia, solo afirma que la fidelidad de forma es "comparable".

Comparativa de coste entre variantes (datos de la model card):

| Metrica | BF16 + Engine | BF16 + EngineFast | INT4 + EngineFast |
|---|---:|---:|---:|
| Tamano de pesos | 7,17 GB | 7,17 GB | 1,26 GB (82 % menos) |
| Pico de VRAM | 21,7 GB | 25,4 GB | 11,3 GB (55 % menos) |
| Tiempo de arranque | 19,4 s | 206,9 s | 6,9 s (97 % menos) |
| Latencia | 90,9 s | 15,0 s | 14,2 s |

## Requisitos de hardware

- VRAM de inferencia: 11,3 GB de pico con los pesos INT4 y el motor rapido, frente a 21,7-25,4 GB del modelo BF16.
- GPU recomendadas por el autor: una unica GPU de 15 GB, citando explicitamente NVIDIA L4, A10 y A2.
- GPU de consumo: cabe en tarjetas de 16 GB o mas, como RTX 4090, RTX 4080, RTX 4070 Ti Super o RTX 4060 Ti de 16 GB. En GPUs de 12 GB el margen es muy ajustado (11,3 GB de pico sin contar el resto del pipeline y el runtime), por lo que no es una configuracion recomendable.
- Dependencias: torch 2.10.0+cu128, torchvision 0.25.0+cu128, torchaudio 2.10.0 y torchao 0.10.0. El fichero `.pt` es un pickle de torchao, no un checkpoint estandar de PyTorch.
- Opciones de despliegue: inferencia nativa con torchao y PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo de lenguaje ni distribuirse en GGUF, esos runners no aplican.
- Latencia y throughput: 14,2 s por generacion y 6,9 s de arranque en la configuracion medida por el autor. No se publica throughput agregado en lotes.
- Espacio en disco: el repositorio ocupa 2,4 GB, repartidos entre los 1,26 GB del GPT cuantizado y aproximadamente 1,10 GB del decodificador VQ-VAE en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pico de VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrNi/efficient-cube3d | no disponible | no disponible | 11,3 GB (INT4) | openrail | HuggingFace, torchao |
| Roblox/cube3d-v0.5 (base BF16) | no disponible | no disponible | 21,7-25,4 GB | no disponible en la informacion proporcionada | HuggingFace |
| Otros generadores text-to-3D (Shap-E, TRELLIS, Hunyuan3D, TripoSG y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion util sobre alternativas comparables: los resultados obtenidos eran contenido de foros sin relacion con el modelo. La unica comparacion con datos verificables en la documentacion disponible es la del propio autor entre la variante BF16 y esta variante INT4, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- Varianza alta en categorias complejas: `symmetry_topology` tiene una media de 176,5 x 10⁻³ con desviacion tipica de 169,5, y `tool_hardware` pasa de una mediana de 63,7 a una media de 139,5 (desviacion 193,7). Esto indica generaciones muy dispares dentro de la misma categoria, con casos claramente fallidos.
- Rendimiento flojo en categorias organicas y abstractas: `nature_plant` (mediana 111,3) y `abstract_mathematical` (107,2) quedan muy por encima de la mediana global de 67,7.
- La degradacion introducida por la cuantizacion no esta cuantificada: el autor afirma fidelidad "comparable" y "misma velocidad de inferencia", pero no publica la tabla de distancia de Chamfer del modelo BF16 con la que contrastar. No es posible verificar el coste real en calidad de la cuantizacion RTN.
- Riesgo de geometria defectuosa: como todo generador de mallas, puede producir topologias no manifold, caras invertidas o volumenes desconectados. En un flujo de produccion hace falta una fase de reparacion (remallado, comprobacion de manifold y de normales).
- Idiomas y prompts: no se documenta que idiomas soporta el condicionamiento textual ni si hay prompts multilingues. Conviene asumir solo ingles salvo verificacion propia.
- Licencia OpenRAIL: no es una licencia de codigo abierto en sentido estricto. Incluye clausulas de uso restringido que hay que revisar antes de un uso comercial, y la licencia del modelo base (Roblox/cube3d-v0.5) tambien debe respetarse al tratarse de pesos derivados.
- Adopcion muy baja: 0 descargas y 8 "likes" en los metadatos consultados. No hay validacion independiente de los numeros publicados ni issues de terceros que confirmen el comportamiento en otras configuraciones.
- Dependencias fragiles: el pickle de torchao exige `torchao==0.10.0` y `torch 2.10.0+cu128`; ficheros de este tipo dependen de la version de la libreria que los serializo y pueden fallar al cargarse con otras versiones.
- Ausencia de datos clave: no hay informacion sobre parametros totales, longitud de contexto, composicion del dataset ni metodo de alineacion, lo que dificulta la reproduccion de resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TrNi/efficient-cube3d
- Modelo base: https://huggingface.co/Roblox/cube3d-v0.5
- Repositorio GitHub de la version eficiente: https://github.com/TrNi/efficient-cube3d
- Tutorial en Google Colab: https://drive.google.com/file/d/1-mWdiDHJIozQnKC-bP9TmaWR0fQLRo2X/view?usp=sharing
- Libreria de cuantizacion torchao: https://github.com/pytorch/ao
- Paper de referencia: Cube: A Roblox View of 3D Intelligence, arXiv:2503.15475 (https://arxiv.org/abs/2503.15475)

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles proceden de la model card y de los metadatos de HuggingFace.
