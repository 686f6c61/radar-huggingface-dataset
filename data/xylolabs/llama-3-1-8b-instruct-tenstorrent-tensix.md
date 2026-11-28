# Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix

## Resumen

Llama-3.1-8B-Instruct-Tenstorrent-Tensix es una distribucion cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent. El repositorio empaqueta los pesos en formatos de coma flotante por bloques (block floating point, BFP) que el hardware Tensix consume de forma nativa a traves de la pila de software tt-metal y ttnn, de modo que el modelo puede ejecutarse en aceleradores de Tenstorrent sin conversion adicional en tiempo de ejecucion.

El modelo base es un transformer decoder-only denso de 8.000 millones de parametros con 128.000 tokens de contexto, entrenado por Meta con instrucciones y ajuste por preferencias. Esta version no altera la arquitectura ni el tokenizador: solo cambia la representacion numerica de una parte de los pesos, con dos variantes principales, BFP8 (atencion y MLP en bfloat8_b) y BFP4 (gate/up del MLP en bfloat4_b, atencion y down_proj en bfloat8_b), cada una en su propia carpeta con su fichero de configuracion de cuantizacion.

La relevancia es practica: permite desplegar Llama 3.1 8B en hardware de inferencia no GPU (acceleradores Tensix) con perdida de calidad medida y documentada frente a BF16 y frente a una referencia Q4_K_M de llama.cpp, algo poco habitual en publicaciones de cuantizacion para hardware especifico. El repositorio incluye scripts de empaquetado y verificacion, y una receta de ejecucion con tt-transformers sobre tt-metal v0.81.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), pesos cuantizados en block floating point (BFP4/BFP8) para NPU Tensix |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | BFP8 (bfloat8_b en atencion y MLP), BFP4 (bfloat4_b en gate/up del MLP), BF16 como referencia sin cuantizar |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License (con Acceptable Use Policy) |
| Formato de pesos | safetensors, con ficheros auxiliares quant4.json, model.safetensors.index.json, pack_tensix.py y verify_grid.py |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones: transformer decoder-only con atencion por grupos (GQA), RoPE y SwiGLU en el MLP. Xylolabs no reentrena el modelo; aplica una cuantizacion post-entrenamiento de tipo GPTQ orientada a los formatos block floating point que el hardware Tensix procesa de forma nativa. Cada carpeta del repositorio contiene su propio quant4.json, que indica por capa y por matriz el formato asignado (bfloat4_b o bfloat8_b), de modo que el pipeline de ttnn puede empaquetar cada tensor con el dtype correcto.

La innovacion tecnica esta en la asignacion selectiva de precision: en bfp4/ solo las matrices gate y up del MLP usan bfloat4_b, mientras que atencion, down_proj y la cabeza LM se mantienen en bfloat8_b y el resto en bf16, lo que limita la degradacion. La model card documenta la calidad mediante divergencia KL media sobre 16.056 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con y sin plantilla de chat, tomando Q4_K_M de llama.cpp como referencia de tolerancia (limite de 1,5 veces su KL). No se documentan en la informacion disponible datos sobre el dataset de instrucciones, RLHF/DPO ni el numero de tokens de entrenamiento del modelo base.

## Capacidades

- Generacion de texto e instrucciones en los ocho idiomas declarados (en, de, fr, it, pt, hi, es, th).
- Razonamiento multi-paso y respuesta conversacional multi-turno, heredados del ajuste de instrucciones de Llama 3.1 8B Instruct.
- Generacion y explicacion de codigo, y matematicas a nivel de modelo de 8B.
- Soporte de plantilla de chat oficial de Llama 3.1 (apply_chat_template).
- Tool calling y function calling segun el formato de Llama 3.1 Instruct (capacidad del modelo base, no verificada especificamente en esta distribucion cuantizada).
- Contexto largo de hasta 128.000 tokens para resumir documentos, analizar repositorios o mantener conversaciones extensas.
- Ejecucion en NPU Tensix mediante tt-metal y ttnn, con empaquetado de matrices a bfloat4_b/bfloat8_b y verificacion de ida y vuelta contra los pesos originales.
- No incluye vision, audio ni modo thinking explicito.

## Casos de uso

- Despliegue en acceleradores Tenstorrent: el caso principal. Se descarga la carpeta bfp8/ o bfp4/ y se ejecuta con tt-transformers sobre tt-metal v0.81.1, usando la receta precision_cfg documentada, para servir generacion de texto en hardware Tensix en lugar de GPU.
- Atencion al cliente automatizada: con 128.000 tokens de contexto se pueden inyectar manuales, historial de tickets y politicas de la empresa en un unico prompt y mantener conversaciones multi-turno coherentes.
- Asistente de codigo en pipelines internos: el modelo puede generar parches, explicar funciones y redactar tests; su tamano de 8B permite integrarlo en herramientas de CI/CD con latencia moderada cuando se ejecuta en NPU dedicada.
- Procesamiento de documentos largos: resumen y extraccion de datos de contratos, informes o articulos que superan la ventana de modelos de 4K-8K, aprovechando el contexto de 128K.
- Agente con tool calling: integracion en flujos de automatizacion donde el modelo decide que funcion invocar (busqueda, calculo, consulta a API) usando el formato de herramientas de Llama 3.1.
- Evaluacion y prototipado de cuantizacion: investigadores que comparan BFP4 y BFP8 frente a BF16 y Q4_K_M pueden reproducir las metricas KL con los scripts pack_tensix.py y verify_grid.py incluidos.
- Soporte multilingue en Europa y Asia: cubre espanol, aleman, frances, italiano, portugues, hindi y tailandes, util para clasificacion y resumen de contenido en esos idiomas.
- Inferencia en entornos con restricciones de energia o sin GPU: al ejecutarse en NPU Tensix, encaja en despliegues edge o de laboratorio donde no se dispone de A100/H100.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K). El unico dato de rendimiento es la divergencia KL media frente a BF16, sobre 16.056 posiciones de ingles y coreano:

| Variante | Formatos | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|---|
| bfp4/ | MLP gate/up bfloat4_b; atencion, MLP down y LM head bfloat8_b; resto bf16 | 7,146 | 0,02282 |
| bfp8/ | Atencion y MLP bfloat8_b; resto bf16 | 9,517 | 0,00085 |
| BF16 (unsloth/Llama-3.1-8B-Instruct) | Sin cuantizar | 16,06 | 0 |
| Q4_K_M (llama.cpp) | Referencia de cuantizacion de 4 bits | 4,921 | 0,03235 |

El limite de aceptacion declarado es 1,5 veces la KL de Q4_K_M; ambas variantes quedan por debajo. No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU Tensix de Tenstorrent, con la pila tt-metal v0.81.1 y ttnn; la receta de tt-transformers requiere el flag --use_hf_rope.
- VRAM: no aplica en el sentido de GPU; el modelo ocupa 7,146 GB (bfp4) o 9,517 GB (bfp8) de pesos empaquetados en DRAM del dispositivo Tensix, mas cache KV y activaciones.
- GPU: el repositorio esta pensado para Tensix, no para CUDA. La carga en transformers con device_map="auto" es posible pero no aprovecha los formatos BFP nativos.
- Consumer GPU: no es el objetivo; en GPU convencional habria que recurrir a las variantes GGUF/AWQ del modelo base.
- Despliegue: tt-transformers sobre tt-metal (demo simple_text_demo.py), scripts pack_tensix.py y verify_grid.py para empaquetado y verificacion; vLLM, llama.cpp u Ollama no estan soportados para estos pesos BFP.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo menciona la prueba de rendimiento batch-1 del demo de tt-transformers.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs Llama-3.1-8B-Instruct-Tenstorrent-Tensix | 8B | 128K | BFP4/BFP8 para Tensix | Llama 3.1 | Hugging Face (243 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | BF16 | Llama 3.1 | Hugging Face, oficial |
| unsloth/Llama-3.1-8B-Instruct | 8B | 128K | BF16 y variantes | Llama 3.1 | Hugging Face (referencia BF16 del repo) |
| Q4_K_M de llama.cpp (referencia de calidad) | 8B | 128K | 4 bits GGUF | Llama 3.1 | llama.cpp |

La comparativa se limita al mismo modelo base en distintas representaciones; no se dispone de datos de benchmarks de tareas para comparar con otros modelos de 8B.

## Limitaciones y advertencias

- Es una cuantizacion: introduce degradacion medible (KL 0,00085 en bfp8 y 0,02282 en bfp4 frente a BF16), mayor en la variante de 4 bits.
- La evaluacion de calidad se limita a ingles y coreano, aunque el modelo declara ocho idiomas; el rendimiento en espanol, hindi o tailandes no esta verificado para estas variantes.
- Riesgo de alucinacion inherente al modelo base de 8B; no se ha realizado un ajuste adicional que lo mitigue.
- Los formatos BFP4/BFP8 son especificos de Tensix: no son directamente utilizables en GPU sin conversion, lo que limita la portabilidad.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales para titulares de licencia) y obligaciones de atribucion ("Built with Llama"); debe revisarse USE_POLICY.md antes de produccion.
- Dependencia estricta de versiones: tt-metal v0.81.1 y --use_hf_rope; otras versiones pueden romper la carga de pesos.
- El repositorio tiene muy poca traccion (243 descargas, 1 like) y actualizaciones recientes (correcciones de card el 2026-11-28), por lo que conviene validar los pesos antes de usarlos en produccion.
- Los scripts pack_tensix.py y verify_grid.py son Apache-2.0, pero los pesos siguen la licencia Llama 3.1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Referencia BF16 usada en la comparativa: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix/blob/main/LICENSE
