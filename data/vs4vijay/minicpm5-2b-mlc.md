# vs4vijay/MiniCPM5-2B-MLC

# Ficha tecnica: MiniCPM5-2B-MLC

## Resumen

MiniCPM5-2B-MLC es una compilacion del modelo openbmb/MiniCPM5-2B para WebGPU mediante MLC-LLM, publicada por el usuario vs4vijay. No se trata por tanto de un modelo entrenado desde cero, sino de un repositorio de artefactos (pesos cuantizados en formato MLC y kernels WebGPU precompilados) que permite ejecutar el modelo base directamente en el navegador a traves de WebLLM 0.2.84 / 0.2.85, sin backend ni GPU en servidor. El repositorio es un mono-repo con dos variantes de cuantizacion en subcarpetas independientes que siguen el formato estandar de WebLLM (`mlc-chat-config.json`, `tokenizer*.json`, `params_shard_*.bin`, `tensor-cache.json`, `libs/<nombre>.wasm`).

El modelo base es un transformer decoder-only de la familia MiniCPM con 2B parametros nominales, y la model card lo describe como un modelo hibrido de razonamiento: el bloque `thinking` se puede activar o desactivar en tiempo de inferencia mediante `extra_body: { enable_thinking }`. La ventana de contexto compilada es de 32.768 tokens, reducible en ejecucion a 4k, 8k o 16k mediante `overrides.context_window_size` sin necesidad de descargar wasm adicionales.

Su relevancia actual es acotada pero especifica: cubre el nicho de inferencia LLM local en el navegador con WebGPU, un escenario donde la oferta de modelos compilados es reducida. El repositorio no tiene descargas ni likes registrados, la licencia no esta declarada y no se han publicado benchmarks, por lo que debe considerarse un artefacto experimental mas que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia MiniCPM); compilado en MLC-LLM con `--model-type llama` y `--conv-template qwen3`. No se detalla en la informacion disponible si usa MoE, SSM o atencion hibrida |
| Parametros totales | 2B nominales segun la denominacion del modelo base (openbmb/MiniCPM5-2B); no confirmado de forma explicita en la informacion disponible |
| Parametros activos | No aplica (no se describe arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 32.768 tokens compilados; reducible en ejecucion a 4k / 8k / 16k / 32k mediante `overrides.context_window_size` |
| Tipos de cuantizacion | `q4f16_1` (por defecto, 1,4 GB, ~4,5 bits/parametro) y `q4f16_autoawq` (calidad, 2,1 GB, ~4,5 bits/parametro, group size 128, AWQ). La variante `q3f16_1` fue retirada por producir salidas incoherentes en WebGPU |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Artefactos MLC/WebLLM: `params_shard_*.bin` (binario cuantizado MLC), `mlc-chat-config.json`, `tokenizer.json`, `tokenizer_config.json`, `tensor-cache.json` y `libs/<modelo>-webgpu.wasm`. No se distribuyen safetensors ni GGUF en este repositorio |
| Tamano del repositorio | 3,5 GB |
| Plantilla de conversacion | ChatML (equivalente a `qwen3`), stop tokens `</s>` (id 1) y `<|im_end|>` (id 130073), con `strip_reasoning_in_history` |
| Prefill chunk size | 1024 |
| Fecha de creacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio: los pesos subyacentes son los del modelo base openbmb/MiniCPM5-2B y lo unico que cambia por subcarpeta es el empaquetado de bytes cuantizados y el kernel WebGPU compilado. La compilacion se realizo con una cadena de herramientas MLC-LLM 0.20.0 construida desde fuente, con TVM fijado en el commit b628d91f, emsdk 3.1.56 y LLVM 18, y se aplico un parche a `tvm/s_tir/dlight/gpu/fallback.py` para registrar nombres de bloques y bucles y reobtener los handles con `sch.get_sblock(name)` antes de cada `decompose_reduction`, lo que corrige el error "The block no longer exists in the IRModule" cuando un PrimFunc contiene multiples bloques de reduccion. El flujo de generacion de configuracion y pesos fue: `mlc_llm gen_config` con ventana de 32768 y prefill de 1024, `mlc_llm convert_weight` y `mlc_llm compile --device webgpu`.

La model card documenta con detalle por que se retiro la variante `q3f16_1`: los shards coincidian con los md5 de su `tensor-cache.json` (33/33), los tamanos sumaban exactamente el `ParamBytes` declarado, el tokenizer era identico al del modelo base y los dos `mlc-chat-config.json` solo diferian en la cadena de cuantizacion. Ademas, al dequantizar `down_proj` de la capa 0 con el empaquetado exacto de `q3f16_1` (10 valores de 3 bits por `uint32`, `(q - 3) * scale`, `group_size = 40`) se obtuvo una correlacion de 0,97 con el tensor real del modelo base (0,995 en `q4f16_1`), con error uniforme y sin picos estructurales. El diff kernel a kernel de los wasm compilados mostro que 84 de 89 funciones de shader eran identicas byte a byte y que solo diferian los kernels de matmul cuantizado, lo que acota el fallo a la ruta int3 de MLC. El problema esta reconocido aguas arriba en mlc-llm#2700 y la pregunta equivalente en web-llm#630 sigue abierta, motivo por el que WebLLM no distribuye modelos q3f16.

El modelo se presenta como hibrido de razonamiento: el bloque `thinking` se controla con `extra_body: { enable_thinking }` y la plantilla de chat elimina el razonamiento del historial (`strip_reasoning_in_history`). No se aporta informacion sobre composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO, ya que eso corresponderia al modelo base y no se detalla aqui.

## Capacidades

- Generacion de texto conversacional multi-turno en el navegador, con historial gestionado por la plantilla ChatML.
- Modo de razonamiento activable y desactivable en tiempo de inferencia (`enable_thinking`), util para separar respuestas rapidas de cadenas de pensamiento largas.
- Generacion de contenido tecnico y matematico basico: el ejemplo oficial de la model card pide escribir "x squared plus one" en LaTeX.
- Inferencia completamente local en el cliente mediante WebGPU, sin llamadas a servidores externos.
- Ventana de contexto de hasta 32.768 tokens, adecuada para documentos extensos o conversaciones prolongadas.
- Dos niveles de calidad/compromiso de memoria seleccionables (q4f16_1 y q4f16_autoawq) con el mismo wasm por cuantizacion y distintos presets de contexto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modo thinking sugiere cadenas de razonamiento, pero no se documenta uso agentico).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- Asistentes embebidos en el navegador con privacidad estricta: al ejecutarse integramente sobre WebGPU en el equipo del usuario, ninguna consulta sale del dispositivo, lo que encaja en aplicaciones reguladas donde no se permite enviar texto a un servidor.
- Extensiones de navegador con IA local: una extension puede cargar el subconjunto `q4f16_1` (1,4 GB de pesos, 2 GB de VRAM declarada) y ofrecer resumen, reescritura o extraccion de datos de la pagina activa sin backend propio.
- Procesamiento de documentos largos en el cliente: con la ventana de 32.768 tokens, un editor web puede cargar articulos o informes extensos y hacer preguntas sobre ellos; si el dispositivo es limitado, basta con reducir `context_window_size` a 8k o 16k sin descargar nada nuevo.
- Prototipado y evaluacion de cadenas de razonamiento: activando `enable_thinking` se puede comparar la calidad de respuesta con y sin cadena de pensamiento en el mismo modelo y hardware, util para decidir si merece la pena el coste de latencia.
- Formacion y material educativo offline: el ejemplo de generacion LaTeX y la ejecucion sin red lo hacen apto para entornos de aula o demos en ferias donde no hay conectividad fiable.
- Validacion de pipelines MLC-LLM/WebGPU: el repositorio documenta el flujo completo de `gen_config`, `convert_weight` y `compile`, ademas del parche necesario en TVM, por lo que sirve como referencia reproducible para portar otros modelos a WebLLM.
- Aplicaciones de escritorio tipo Electron o Tauri con IA embebida: al ser artefactos WebGPU puros, se pueden integrar en cualquier contenedor que exponga un contexto de navegador moderno, evitando dependencias de CUDA o de servidores de inferencia.
- Demos de chatbots sin coste de inferencia: el modelo no consume cuota de API ni requiere GPU en la nube, lo que permite desplegar demos publicas donde el coste marginal por usuario es cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo publicado en la model card es una verificacion de dequantizacion de la capa 0 (`down_proj`): correlacion de 0,97 para el empaquetado `q3f16_1` y 0,995 para `q4f16_1` respecto al tensor real del modelo base. Se trata de una comprobacion de integridad de los pesos, no de una medida de calidad de generacion. No se declaran valores de MMLU, HumanEval, GSM8K ni de ningun otro test estandar, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM para `q4f16_1`: el `mlc-chat-config.json` declara `vram_required_MB: 2000` (aproximadamente 2 GB), sobre 1,4 GB de pesos cuantizados.
- VRAM para `q4f16_autoawq`: no declarada en la informacion disponible; los pesos ocupan 2,1 GB, por encima de los 1,4 GB de la variante por defecto.
- GPU recomendadas: no se listan modelos concretos. El requisito real es disponer de un navegador con soporte WebGPU (WebLLM 0.2.84 / 0.2.85) y una GPU integrada o dedicada compatible con WebGPU.
- Compatibilidad con GPU de consumo: si, es precisamente el objetivo del repositorio. Cabe en GPUs de consumo y en graficas integradas con WebGPU, dado el perfil de memoria de 2 GB.
- Opciones de despliegue: WebLLM 0.2.84 / 0.2.85 sobre WebGPU, cargando el subfolder del repositorio como `model` y el wasm de `libs/` como `model_lib`. No se documentan rutas de despliegue para vLLM, llama.cpp, Ollama o TGI con estos artefactos, que son especificos de WebGPU.
- Latencia y throughput: no disponibles. Dependen por completo del navegador y de la GPU del cliente, y el autor no publica mediciones.
- Ancho de banda de descarga: el repositorio completo ocupa 3,5 GB; en la practica el usuario solo descarga el subfolder de la cuantizacion elegida (1,4 GB o 2,1 GB).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros que permitan una comparacion honesta. La comparacion factible es interna al propio repositorio:

| Variante | Cuantizacion | Tamano de pesos | Bits/parametro | Estado | Notas |
|---|---|---|---|---|---|
| `q4f16_1/` | q4f16_1 | 1,4 GB | ~4,5 | Activa, opcion por defecto | Respuestas coherentes y deterministas en los dispositivos probados por el autor; `vram_required_MB` de 2000 |
| `q4f16_autoawq/` | q4f16_autoawq | 2,1 GB | ~4,5 (group 128, AWQ) | Activa, orientada a calidad | Mayor huella de memoria a cambio de mejor fidelidad de pesos |
| `q3f16_1/` | q3f16_1 | No disponible | ~3 | Retirada | Produce texto incoherente en WebGPU; fallo acotado a los kernels int3 de MLC |
| openbmb/MiniCPM5-2B | Sin cuantizar (modelo base) | No disponible | 16 en pesos originales | Fuente | No incluye artefactos WebGPU; requiere otro runtime |

Frente a otros modelos de ~2B ejecutables en navegador, la informacion disponible no aporta parametros, contexto ni metricas que permitan establecer una comparativa verificable.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, y ademas hereda las condiciones del modelo base openbmb/MiniCPM5-2B, que no se detallan en este repositorio.
- Idiomas soportados no declarados: no se puede asumir un comportamiento multilingue correcto sin evaluacion previa.
- Sin benchmarks publicados: cualquier decision de adopcion en produccion tendria que apoyarse en una evaluacion propia.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad ni evidencia de uso en entornos reales.
- Artefactos especificos de WebGPU: no son reutilizables en vLLM, llama.cpp, Ollama o TGI; quedan atados a WebLLM 0.2.84 / 0.2.85.
- Dependencia estricta del navegador y del controlador WebGPU del cliente: el rendimiento y la estabilidad varian entre dispositivos y no se documentan minimos.
- La variante `q3f16_1` esta rota en la ruta int3 de MLC y los issues relacionados siguen abiertos; conviene evitar cualquier cuantizacion de 3 bits en este stack.
- Descarga elevada para un cliente web: 1,4 GB o 2,1 GB de pesos, mas el wasm correspondiente, lo que penaliza el primer arranque.
- Riesgo de alucinacion propio de un modelo de 2B sin datos de evaluacion publicados que lo acoten.
- Calidad en contextos proximos a los 32.768 tokens no verificada: la ventana esta compilada, pero no se aportan pruebas de degradacion o de atencion efectiva a esa distancia.
- Inconsistencia documental: el ejemplo de codigo de la model card apunta a `fatih-can/MiniCPM5-2B-MLC`, no a `vs4vijay/MiniCPM5-2B-MLC`, la ruta del repositorio que se esta describiendo. Conviene verificar la URL antes de usarla.
- El autor no publica mediciones de latencia ni de throughput, por lo que no es posible estimar coste por token en el cliente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vs4vijay/MiniCPM5-2B-MLC
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Issue de mlc-llm sobre q3f16_1: https://github.com/mlc-ai/mlc-llm/issues/2700
- Issue de web-llm sobre soporte de q3f16: https://github.com/mlc-ai/web-llm/issues/630
- Ruta alternativa citada en el ejemplo de codigo de la model card: https://huggingface.co/fatih-can/MiniCPM5-2B-MLC
- Los resultados de la busqueda web realizada no contienen ningun enlace relevante al modelo, a MLC-LLM ni a WebLLM; los unicos resultados devueltos corresponden a material editorial infantil sin relacion con el objeto de esta ficha.
