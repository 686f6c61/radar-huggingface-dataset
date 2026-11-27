# Xylolabs/clef-Tenstorrent-Tensix

## Resumen

Clef para Tenstorrent Tensix es una version cuantizada del modelo Cloudflare/clef, publicada por Xylolabs, especificamente empaquetada para su ejecucion en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante el stack tt-metal y la libreria TT-NN. No se trata de un modelo generativo de proposito general, sino de un modelo de decision orientado a clasificacion de texto y a la evaluacion de opciones sobre un estado estructurado (por ejemplo, facturas, formularios o registros con campos definidos), lo que lo situa en la categoria de modelos de clasificacion y decision mas que en la de asistentes conversacionales.

La relevancia de esta publicacion es doble. Por un lado, demuestra la viabilidad de ejecutar modelos de cierto tamano en hardware NPU no convencional mediante cuantizacion en bloque de coma flotante (block floating point, BFP), con formatos bfloat4_b y bfloat8_b propios del ecosistema Tensix. Por otro, ofrece una alternativa de despliegue en hardware de Tenstorrent frente a las soluciones basadas en CUDA, manteniendo una degradacion de calidad medida y documentada mediante divergencia KL respecto al modelo original en BF16.

El repositorio ocupa 55 GB e incluye los pesos cuantizados en la carpeta `bfp4/`, junto con codigo personalizado (`joint_schema_model`) para cargar el modelo, codificar registros y evaluar todas las opciones permitidas en un unico paso forward. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas DeltaNet (hibrida, segun referencias del model card al bloque DeltaNet); modelo de decision/clasificacion |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 16.384 tokens en los registros de evaluacion (rango 152-16.384); limite maximo no especificado |
| Tipos de cuantizacion | bfloat4_b (MLP), bfloat8_b (attention y DeltaNet), bf16 (resto); empaquetado BFP4 y opcion BFP8 |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (indexado con `model.safetensors.index.json`), con metadatos de cuantizacion en `quant4.json` |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef emplea una arquitectura hibrida que combina capas de atencion con capas DeltaNet, un mecanismo de estado recurrente lineal que reduce el coste computacional en secuencias largas. La version de Xylolabs mantiene esa estructura y aplica cuantizacion en bloque de coma flotante: las proyecciones de las capas MLP se almacenan en bfloat4_b (4 bits con exponente compartido por bloque) y las proyecciones de atencion y DeltaNet en bfloat8_b, mientras que el resto de tensores permanece en bf16. El empaquetado se realiza con las herramientas `pack_tensix.py` y `verify_grid.py` del repositorio tensix-bfp-gptq v0.1.0, que adaptan los tensores al layout [in, out] de TT-NN.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La unica metrica de calidad publicada es la divergencia KL media respecto al backbone BF16 original: 0,0093908380 para la version bfp4, frente a 0,0081680764 para una cuantizacion Q4_K_M de llama.cpp sobre el mismo backbone. En terminos de respuestas correctas sobre 40 preguntas etiquetadas, la version bfp4 acierta 36/40, frente a 35/40 del BF16 original y 35/40 de la variante llama.cpp Q4_K_M.

## Capacidades

- Clasificacion de texto y evaluacion de opciones: el modelo puntua todas las opciones permitidas de una pregunta en un unico forward pass, devolviendo logits por opcion.
- Razonamiento sobre estado estructurado: procesa registros con campos anidados (por ejemplo, datos de factura) y responde preguntas de tipo eleccion multiple o de tipo "noul" (respuesta booleana o de opcion unica) sobre ese estado.
- Soporte de preguntas multiples por registro: el ejemplo del model card incluye dos preguntas (`status` de tipo `choice` y `large` de tipo `noul`) evaluadas simultaneamente.
- Manejo de contextos largos: los registros de evaluacion abarcan de 152 a 16.384 tokens, lo que indica capacidad para documentos extensos.
- Multilingue limitado: ingles y coreano.
- No se documentan capacidades de generacion libre, tool calling, agentes, vision ni audio; el pipeline declarado es text-classification.

## Casos de uso

- Validacion de facturas y documentos financieros: el modelo recibe un estado estructurado con campos como proveedor, importe, moneda y estado, y responde preguntas de clasificacion (por ejemplo, si la factura esta pagada, vencida o en borrador) evaluando todas las opciones en un solo paso, lo que encaja en pipelines de contabilidad automatizada.
- Extraccion de decisiones en formularios administrativos: dado un registro con campos definidos, el modelo puede clasificar el estado de una solicitud o responder preguntas booleanas sobre umbrales (por ejemplo, si el importe supera 1000 USD), adecuado para triaje documental.
- Moderacion y clasificacion de contenido en ingles y coreano: al ser un modelo de clasificacion, puede emplearse para etiquetar textos en esos dos idiomas con categorias predefinidas, siempre que se adapten las opciones de salida.
- Despliegue en hardware Tenstorrent: organizaciones con NPU Wormhole o Blackhole pueden ejecutar el modelo en su infraestructura mediante TT-NN, evitando dependencias de GPU NVIDIA y aprovechando el formato BFP4 para reducir huella de memoria (23,59 GB empaquetados).
- Procesamiento de documentos largos: con registros de hasta 16.384 tokens, es apto para clasificar contratos, informes o expedientes extensos sin truncar el contexto.
- Investigacion en cuantizacion BFP: sirve como referencia reproducible para estudiar el impacto de bfloat4_b y bfloat8_b en tareas de decision, comparando la divergencia KL y la tasa de acierto frente al modelo BF16.

## Benchmarks y rendimiento

| Metrica | bfp4 (Tensix) | BF16 original | llama.cpp Q4_K_M |
|---|---|---|---|
| Divergencia KL media vs BF16 | 0,0093908380 | 0 | 0,0081680764 |
| Respuestas correctas (40 preguntas) | 36/40 | 35/40 | 35/40 |
| Tamano empaquetado (GB) | 23,59 | no disponible | no disponible |

La comparacion se realiza sobre 44 registros, 55 preguntas y 40 preguntas etiquetadas, con registros de 152 a 16.384 tokens. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos empaquetados en BFP4 ocupan 23,59 GB; en BF16 el backbone seria considerablemente mayor, aunque el tamano exacto no se especifica.
- GPU recomendadas: el model card indica ejecucion con Transformers 5.23.0 y PyTorch con CUDA, sin detallar modelos concretos; por el volumen de pesos, se requiere una GPU con al menos 24 GB de VRAM para la variante BFP4 (por ejemplo, RTX 4090, A100 o H100).
- Hardware NPU: soporte nativo para Tenstorrent Wormhole y Blackhole mediante tt-metal y TT-NN, con layout TILE_LAYOUT y memoria DRAM.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) para la variante BFP4, aunque no se confirma explicitamente.
- Opciones de despliegue: Transformers con CUDA, TT-NN para Tensix, y herramientas de empaquetado `pack_tensix.py` y `verify_grid.py` (con opcion `--as bfp8` y `--device`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|
| Xylolabs/clef-Tenstorrent-Tensix | no disponible | hasta 16.384 en evaluacion | Apache 2.0 | Tenstorrent Wormhole/Blackhole, CUDA | Cuantizado BFP4/BFP8, 36/40 aciertos |
| Cloudflare/clef (BF16) | no disponible | no disponible | Apache 2.0 | GPU convencional | Modelo base, 35/40 aciertos |
| clef en llama.cpp Q4_K_M | no disponible | no disponible | Apache 2.0 | CPU/GPU via llama.cpp | 35/40 aciertos, KL 0,0081680764 |

No se dispone de informacion sobre otros modelos de clasificacion comparables en la misma categoria.

## Limitaciones y advertencias

- No es un modelo generativo: su uso esta restringido a clasificacion y evaluacion de opciones; no debe emplearse para generacion libre de texto.
- Idiomas limitados a ingles y coreano; el rendimiento en castellano no esta documentado.
- La cuantizacion BFP4 introduce una divergencia KL de 0,0093908380 respecto a BF16, superior a la de Q4_K_M (0,0081680764), lo que puede afectar a decisiones sensibles en produccion.
- Riesgo de alucinacion no evaluado en la informacion disponible; al tratarse de un modelo de decision, el riesgo se traslada a clasificaciones erroneas.
- Sesgos conocidos no documentados.
- Requiere codigo personalizado (`joint_schema_model`) y versiones concretas de Transformers (5.23.0) y PyTorch, lo que complica la integracion en stacks estandar.
- El despliegue en Tensix exige hardware especifico de Tenstorrent y el stack tt-metal; no es portable a GPU sin conversion.
- Licencia Apache 2.0 permite uso comercial, pero cada carpeta incluye su propio LICENSE y NOTICE que deben respetarse.
- El modelo fue renombrado el 2026-11-27 (antes clef-Tenstorrent-Tensix-BFP4); verificar rutas y referencias antiguas.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/clef-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/clef-Tenstorrent-Tensix/blob/main/LICENSE
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
