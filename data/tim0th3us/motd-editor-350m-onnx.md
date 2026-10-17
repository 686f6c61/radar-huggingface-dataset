# Tim0th3us/motd-editor-350m-ONNX

## Resumen

motd-editor-350m-ONNX es un ajuste fino LoRA del modelo LiquidAI/LFM2.5-350M, desarrollado por el usuario Tim0th3us y publicado en HuggingFace. No se trata de un modelo de proposito general, sino de un modelo estrechamente especializado: recibe como entrada un bundle XML con definiciones del juego Masters of the Dungeon junto con una peticion de edicion, y devuelve una unica respuesta en forma de bloque `<patch>`. El ajuste se ha fusionado en los pesos y se ha exportado a ONNX en cuantizacion de 4 bits, reutilizando el grafo de onnx-community/LFM2.5-350M-ONNX.

Su relevancia es fundamentalmente practica para el ecosistema de transformers.js: al estar cuantizado a q4 y mantener activaciones en fp32, puede ejecutarse en el navegador con WebGPU, incluso en GPUs que no exponen la extension `shader-f16`, y en CPUs via WASM. Con 350M parametros y un repositorio de 0,3 GB, el coste de despliegue es minimo y no requiere infraestructura de servidor.

El modelo esta pensado para integrarse con decodificacion restringida por gramatica (schema `toEbnf({ root: 'patch' })` de dungeon-core a traves de web-xgrammar como logits processor), lo que limita la salida a XML valido segun el esquema. Se publica bajo la LFM Open License v1.0 y existe una build GGUF en un repositorio hermano del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de LiquidAI/LFM2.5-350M (familia LFM2 de Liquid AI); el detalle de capas no se especifica en la informacion disponible |
| Parametros totales | 350M (segun la denominacion del modelo y el modelo base) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en ONNX (`onnx/model_q4.onnx`); el autor indica que q4 conserva activaciones en fp32; existe build GGUF en repositorio aparte con tipos de cuantizacion no detallados |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | ONNX (graph de onnx-community/LFM2.5-350M-ONNX con pesos ajustados); GGUF en `Tim0th3us/motd-editor-350m-GGUF` |
| Libreria de despliegue | transformers.js |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | text-generation |
| Modelo base | LiquidAI/LFM2.5-350M |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LiquidAI/LFM2.5-350M, un transformer de 350M parametros perteneciente a la familia LFM2 de Liquid AI. La informacion disponible no detalla la composicion exacta de capas del modelo base ni la longitud de contexto original, por lo que no se puede confirmar aqui si se trata de una arquitectura hibrida de convoluciones y atencion, algo que Liquid AI describe publicamente para la familia LFM2. El ajuste fino se aplico como LoRA sobre ese modelo base y posteriormente se fusiono en los pesos, que se escribieron en el grafo ONNX preexistente de onnx-community/LFM2.5-350M-ONNX en su variante de 4 bits.

El entrenamiento corresponde a la ejecucion 14 con el dataset `v4` (v4 canon) y 2.144 ejemplos de entrenamiento durante 6 epocas. La seleccion de checkpoint se hizo sobre validacion maximizando la conjuncion pass∧fits: se eligio la epoca 6 (checkpoint-3216), con unos valores de `eval_loss` por epoca de 0,2073, 0,1841, 0,1837, 0,1922, 0,2174 y 0,2403. Es destacable que la perdida de validacion empeora a partir de la tercera epoca mientras el criterio de tarea (pass∧fits) sigue mejorando, lo que sugiere que el criterio de seleccion prioriza la validez estructural de la salida frente a la perplejidad. En validacion, ese checkpoint alcanza 145/264 en pass∧fits (54,9%) y 178/264 en pass (67,4%).

La innovacion tecnica mas relevante no esta en el entrenamiento sino en el uso: el modelo esta disenado para combinarse con una gramatica EBNF generada por dungeon-core y aplicada mediante web-xgrammar como logits processor, de forma que la decodificacion queda restringida a XML conforme al esquema del patch. El repositorio incluye `motd.json` con el prompt tal y como se entreno (plantilla, system prompt y XML de entrada canonico).

## Capacidades

- Edicion de definiciones de juego: dada una peticion y un bundle XML de Masters of the Dungeon, genera una respuesta unica con un bloque `<patch>`.
- Generacion estructurada: la salida esta pensada para validarse contra un esquema XML, con decodificacion restringida por gramatica EBNF.
- Ejecucion en navegador: compatible con transformers.js usando `device: "webgpu"` y `dtype: "q4"`; soporta GPUs sin `shader-f16` porque las activaciones se mantienen en fp32.
- Ejecucion en CPU: la build ONNX puede correr en WASM; existe ademas una build GGUF para runtimes tipo llama.cpp.
- Generacion de texto general: capacidad heredada del modelo base, no evaluada ni garantizada tras el ajuste especializado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta entrenado para una unica respuesta `<patch>`.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no se documentan modos de razonamiento, vision ni audio.

## Casos de uso

- Edicion asistida de mods de Masters of the Dungeon: el modelo recibe el bundle XML del contenido y una peticion en lenguaje natural, y devuelve un patch aplicable; es el caso de uso para el que fue entrenado y el unico con validacion cuantificada (145/264 en pass∧fits).
- Editor embebido en navegador sin backend: gracias al export ONNX q4 y a transformers.js con WebGPU, la herramienta de edicion puede funcionar integramente en el cliente, sin enviar el contenido del juego a un servidor.
- Validacion y aplicacion automatica de patches en un pipeline de CI: el patch generado puede parsearse y validarse contra el esquema XML antes de aplicarse, de modo que las contribuciones de contenido de la comunidad se verifican de forma automatica.
- Aplicaciones de escritorio o herramientas offline: la build GGUF permite distribuir el editor como binario local con llama.cpp u Ollama, sin dependencia de red.
- Generacion de contenido estructurado en dominios analogos: la misma receta (LoRA + export ONNX q4 + decodificacion con gramatica) sirve de plantilla para otros dominios donde la salida deba ser XML o JSON conforme a un esquema.
- Redaccion incremental de contenido sobre un canon existente: el prompt entrenado incluye un XML de entrada canonico, lo que encaja con flujos en los que el contenido previo se pasa como contexto de referencia.
- Referencia metodologica para ajustes de bajo coste: el repositorio documenta datos, numero de epocas, criterio de seleccion y metrica de validacion, y puede usarse como ejemplo reproducible de ajuste de un modelo de 350M en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son las de entrenamiento y validacion del propio ajuste:

| Metrica | Valor |
|---|---|
| Ejemplos de entrenamiento (v4 canon) | 2.144 |
| Epocas | 6 |
| eval_loss por epoca | 0,2073 / 0,1841 / 0,1837 / 0,1922 / 0,2174 / 0,2403 |
| Checkpoint seleccionado | Epoca 6 (checkpoint-3216) |
| Validacion pass∧fits | 145/264 (54,9%) |
| Validacion pass | 178/264 (67,4%) |

Estas cifras no son comparables con benchmarks de proposito general: miden exclusivamente si la salida generada pasa la validacion y encaja con el caso esperado en el dominio del editor de definiciones. No hay datos publicados de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-1 GB en la variante q4 ONNX (el repositorio completo ocupa 0,3 GB); el modelo base en precision completa de 350M rondaria los 0,7 GB solo en pesos, sin contar cache de activaciones ni KV cache.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU suficiente para transformers.js; no se requiere hardware de clase A100 ni H100.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (por ejemplo, series GTX 10xx en adelante y equivalentes de AMD/Intel), y tambien en GPUs integradas.
- GPUs sin `shader-f16`: soportadas, porque la variante q4 mantiene las activaciones en fp32 segun indica el autor.
- CPU: viable en WASM (transformers.js) y mediante la build GGUF con llama.cpp u Ollama.
- Opciones de despliegue: transformers.js en navegador con `device: "webgpu"` y `dtype: "q4"`; ONNX Runtime; llama.cpp u Ollama con la build GGUF. No se documenta soporte para vLLM ni TGI, orientados a modelos mayores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tim0th3us/motd-editor-350m-ONNX | 350M | ONNX q4 (+ GGUF en repo aparte) | Edicion de definiciones de Masters of the Dungeon (XML a patch XML) | LFM Open License v1.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| LiquidAI/LFM2.5-350M | 350M | no disponible | Modelo base de proposito general | LFM Open License v1.0 (segun el modelo derivado) | HuggingFace |
| onnx-community/LFM2.5-350M-ONNX | 350M | ONNX | Modelo base exportado a ONNX; grafo reutilizado por este ajuste | no disponible en la informacion proporcionada | HuggingFace |
| osmosis-ai/osmosis-eot-lfm2-350m-clf-head3-onnx | 350M | ONNX INT8 con cabeza de clasificacion recortada | Clasificacion de fin de turno sobre conversaciones cortas, optimizada para baja latencia en CPU | no disponible en la informacion proporcionada | HuggingFace |
| Tim0th3us/motd-editor-350m-GGUF | 350M | GGUF | Misma tarea que este modelo, empaquetado para runtimes GGUF | LFM Open License v1.0 | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas variantes, ya que cada una persigue un objetivo distinto y solo el modelo de esta ficha publica metricas de validacion propias del dominio.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: solo esta entrenado para transformar un bundle XML de Masters of the Dungeon mas una peticion en un bloque `<patch>`; no debe esperarse comportamiento de asistente general.
- Volumen de datos reducido: 2.144 ejemplos de entrenamiento y 264 de validacion; la cobertura de casos limites es necesariamente limitada.
- Rendimiento imperfecto incluso en su dominio: en validacion obtiene 145/264 en pass∧fits (54,9%) y 178/264 en pass (67,4%), de modo que aproximadamente uno de cada tres intentos no pasa la validacion.
- Seleccion de checkpoint contra la perdida: la `eval_loss` empeora desde la tercera epoca hasta la sexta, lo que indica sobreajuste respecto a la perdida; el checkpoint elegido se justifica por el criterio de tarea, no por perplejidad.
- Necesidad de decodificacion restringida: sin la gramatica EBNF aplicada como logits processor, la probabilidad de obtener XML invalido aumenta; el propio autor recomienda constrenir la decodificacion con `toEbnf({ root: 'patch' })`.
- Riesgo de alucinacion: cualquier campo, identificador o valor del patch puede ser inventado y no corresponder a ninguna entidad real del bundle de entrada; es imprescindible validar el patch contra el esquema y el contenido antes de aplicarlo.
- Perdida de capacidades generales: el ajuste fino especializado puede degradar las capacidades del modelo base en otras tareas; no hay evaluaciones publicadas que midan esa degradacion.
- Idiomas: no se declara lista de idiomas soportados, por lo que no hay garantia de comportamiento correcto en castellano ni en otros idiomas distintos del usado en el dataset de entrenamiento.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni proceso de alineacion especifico para este ajuste.
- Licencia: se trata de la LFM Open License v1.0, etiquetada como `license: other`, no de una licencia de codigo abierto estandar tipo Apache 2.0 o MIT; antes de un uso comercial es necesario revisar los terminos del archivo `LICENSE` del repositorio.
- Madurez y mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- Fechas del repositorio: las marcas de creacion y actualizacion indican 2026-10-16, con apenas un minuto entre ambas; conviene verificar la version que se descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tim0th3us/motd-editor-350m-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Grafo ONNX reutilizado: https://huggingface.co/onnx-community/LFM2.5-350M-ONNX
- Build GGUF del mismo autor: `Tim0th3us/motd-editor-350m-GGUF` (referenciada en la model card; no se proporciona URL directa)
- ONNX Model Zoo (repositorio de modelos ONNX): https://github.com/onnx/models
- Modelos de ONNX Runtime: https://onnxruntime.ai/models
- Modelo comparable de clasificacion sobre la misma base: https://huggingface.co/osmosis-ai/osmosis-eot-lfm2-350m-clf-head3-onnx
- Modelo ONNX de la generacion LFM2-350M: https://huggingface.co/onnx-community/LFM2-350M-ONNX
