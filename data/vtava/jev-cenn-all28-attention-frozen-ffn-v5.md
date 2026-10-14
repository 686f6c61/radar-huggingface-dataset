# vtava/jev-cenn-all28-attention-frozen-ffn-v5

## Resumen

El modelo vtava/jev-cenn-all28-attention-frozen-ffn-v5 es un checkpoint de investigación publicado por el usuario vtava en Hugging Face. Se trata de un codificador transformer de 539.623.174 parámetros (unos 540 millones) derivado de la arquitectura ModernBERT, en el que los 28 módulos de atención del modelo original han sido sustituidos por alternativas propias denominadas Jev-CeNN, basadas en ventanas y anclas globales (window/global-anchor). El resto de componentes —las redes feed-forward (FFN), sus normalizaciones, las normalizaciones de atención, la profundidad del codificador (28 capas), las rutas residuales y la cabeza de decisión— se conservan congelados y sin cambios respecto al checkpoint de origen.

El modelo resuelve una tarea muy concreta: emitir decisiones tipadas (typed decisions) a partir de una entrada estructurada. En el ejemplo de la model card recibe un diccionario como `{"road_direction": "left", "speed": "7.0"}` junto con un mapa de opciones y devuelve una decisión textual. Es, por tanto, un modelo de propósito específico y no un modelo generativo de uso general.

Su relevancia es limitada y eminentemente experimental: no declara pipeline, licencia, idiomas ni benchmarks formales, y acumula 0 descargas y 0 «likes». El único dato de rendimiento declarado es un 94,8 % de acuerdo con el profesor (teacher agreement) medido en una ejecución de investigación previa (V4), y el propio autor advierte de que este export no impone ninguna puerta de calidad ni de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador (encoder-only) basado en ModernBERT; 28 capas; los 28 modulos de atencion sustituidos por Jev-CeNN (window/global-anchor) |
| Parametros totales | 539.623.174 (~540 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor pide confirmar los requisitos de licencia del checkpoint de origen `convaiinnovations/laya-typed-decisions` antes de publicar) |
| Formato de pesos | safetensors (`model.safetensors`) mas `config.json`; requiere cargador propio en `all28_hf.py` |

## Arquitectura y entrenamiento

El modelo parte de un codificador ModernBERT, una arquitectura transformer encoder-only con normalizaciones pre-attention y atención de tipo masked self-attention densa. La modificación principal es la sustitucion completa de los 28 modulos de atencion por alternativas Jev-CeNN que combinan atencion por ventanas (window) con anclas globales (global-anchor). Los pesos de las FFN, las normalizaciones asociadas, la profundidad de 28 capas, las conexiones residuales y la cabeza de decision se heredan intactos del checkpoint de origen `convaiinnovations/laya-typed-decisions`. El repositorio incluye un manifiesto (`all28_manifest.json`) que detalla por capa las banderas de ventana, ancla y CeNN.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineacion. La presencia de un archivo `rl_agent_config.json` sugiere un componente de agente de aprendizaje por refuerzo, pero su contenido y rol no se documentan. El autor indica que el 94,8 % de acuerdo con el teacher se midio en una ejecucion de investigacion previa (V4) y que este export no garantiza reproducir ese valor. Tambien advierte de que el uso de SDPA enmascarado denso no implica necesariamente una mejora de velocidad en inferencia.

## Capacidades

- Emision de decisiones tipadas: dado un estado estructurado y un mapa de opciones, devuelve una decision textual mediante la API `runtime.decide(...)`.
- Codificacion de entradas estructuradas (diccionarios de estado) en lugar de texto libre generativo.
- No es compatible con `transformers.AutoModel.from_pretrained`; requiere los modulos `all28_hf.py` y `tinycenn_lm.standalone_decision`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (mas alla del archivo de configuracion de agente RL, sin detalles).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre sustitucion de atencion: el modelo sirve como banco de pruebas para evaluar el impacto de reemplazar todos los modulos de atencion de un codificador ModernBERT por variantes window/global-anchor, manteniendo el resto congelado. Es util para ablaciones controladas sobre arquitecturas de atencion.
- Toma de decisiones en simulacion de conduccion: el ejemplo de la model card mapea variables de estado (direccion de la via, velocidad) a acciones concretas (girar, continuar), lo que encaja en entornos de simulacion o agentes de bajo nivel con vocabulario de acciones cerrado.
- Politicas de control en agentes de aprendizaje por refuerzo: al emitir decisiones tipadas a partir de observaciones estructuradas, puede integrarse como cabecera de politica en pipelines de RL, dado el archivo `rl_agent_config.json`.
- Enrutado de decisiones en flujos de automatizacion: con un mapa de opciones predefinido, puede asignar una accion discreta a cada estado de entrada en procesos de clasificacion accion-respuesta.
- Prototipado de compresion de modelos: al mantener las FFN originales y sustituir solo la atencion, resulta util para estudiar tecnicas de compresion o reemplazo modular de componentes congelados.
- Docencia y evaluacion de arquitecturas: como checkpoint pequeno (540 M de parametros) sirve para reproducir experimentos de modificacion arquitectonica a bajo coste de computo.
- Baseline en comparativas de codificadores: util para contrastar variantes de atencion frente al ModernBERT de origen en tareas de decision cerrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato declarado es un acuerdo con el teacher del 94,8 %, medido en una ejecucion de investigacion previa (V4) y no necesariamente reproducible en este export.

| Metrica | Valor | Contexto |
|---|---|---|
| Teacher agreement | 94,8 % | Medido en la ejecucion previa V4; el autor advierte de que este export no impone puerta de calidad |
| MMLU, HumanEval, GSM8K y similares | no disponible | Sin datos publicados |

## Requisitos de hardware

- VRAM estimada para inferencia (540 M de parametros): aproximadamente 2,2 GB en FP32, 1,1 GB en FP16/BF16, 0,55 GB en INT8 y 0,27 GB en INT4, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente en precision mixta. Se puede ejecutar en NVIDIA RTX 3060, RTX 4060, RTX 4090, A100, H100 y equivalentes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo actual e incluso en GPU integradas con suficiente memoria compartida.
- Opciones de despliegue: no es compatible con `transformers.AutoModel.from_pretrained` ni, presumiblemente, con vLLM, TGI, llama.cpp u Ollama de forma nativa, ya que requiere el cargador personalizado `all28_hf.py`. El despliegue documentado se realiza descargando el repositorio con `snapshot_download` y ejecutando `load_all28(root)`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| vtava/jev-cenn-all28-attention-frozen-ffn-v5 | 539 M | no disponible | Encoder de decision (ModernBERT modificado) | no disponible | Export experimental, sin benchmarks estandar |
| ModernBERT-base | 149 M | 8192 | Encoder | Apache 2.0 | Arquitectura base de referencia (segun documentacion publica de ModernBERT) |
| ModernBERT-large | 395 M | 8192 | Encoder | Apache 2.0 | Arquitectura base de referencia (segun documentacion publica de ModernBERT) |

No se dispone de datos de rendimiento comparables entre estos modelos y el checkpoint analizado, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial sin confirmar previamente los requisitos del checkpoint de origen `convaiinnovations/laya-typed-decisions`, tal como advierte el propio autor.
- Modelo experimental sin puerta de calidad: el autor indica explicitamente que este export no aplica ninguna verificacion de calidad ni de velocidad.
- El dato de 94,8 % de acuerdo con el teacher pertenece a una ejecucion de investigacion previa (V4) y puede no reproducirse con este export.
- El uso de SDPA enmascarado denso no garantiza mejoras de velocidad en inferencia.
- Incompatibilidad con `transformers.AutoModel.from_pretrained`: obliga a usar codigo personalizado y limita las herramientas de despliegue estandar.
- Longitud de contexto e idiomas no documentados, lo que impide planificar su uso en produccion.
- Riesgo de alucinacion: no evaluado; al tratarse de un modelo de decision, podria generar acciones incoherentes con el estado de entrada en dominios fuera de su distribucion de entrenamiento.
- Sin resultados de benchmarks estandar ni evaluaciones de sesgo publicadas.
- Cero descargas y cero «likes»: ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/vtava/jev-cenn-all28-attention-frozen-ffn-v5
- Checkpoint de origen: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Papers, blogs, repositorios o demos adicionales: no disponible
