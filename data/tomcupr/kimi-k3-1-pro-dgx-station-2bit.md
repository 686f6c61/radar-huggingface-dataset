# tomcupr/Kimi-K3.1-Pro-DGX-Station-2bit

## Resumen

Kimi-K3.1-Pro-DGX-Station-2bit es una cuantizacion de 2 bits del modelo Moonshot AI Kimi-K3.1-Pro, publicada por Tomas Cupr (usuario tomcupr) con el objetivo de ejecutar un checkpoint de 1,45 TiB en una unica DGX Station de sobremesa. El modelo base es un transformer de tipo mixture-of-experts (MoE) de 2,78 billones de parametros, cuyo despliegue de referencia en vLLM requiere ocho GPUs de centro de datos. Esta version redistribuye los 82.432 expertos enrutados en tres niveles de memoria (RTX PRO 6000, HBM del GB300 y memoria Grace) y los almacena a 2,125 bits por peso, manteniendo una perplejidad de 2,92 frente a 2,95 de los pesos originales.

La relevancia de esta ficha radica en que demuestra que modelos de escala frontera pueden servirse en hardware de estacion de trabajo sin sacrificar calidad perceptible: 196 de 200 preguntas de GSM8K correctas con modo thinking, y coincidencia del token predicho top-1 en el 85% de los casos frente a los pesos publicados. El repositorio incluye los expertos en safetensors por capa (674 GiB) y el resto del checkpoint sin modificar (107 GiB), servidos mediante vLLM sin cambios en el codigo fuente y con un endpoint compatible con OpenAI.

Se trata de un artefacto de despliegue, no de un modelo nuevo: la arquitectura, el entrenamiento y las capacidades son las del Kimi-K3.1-Pro de Moonshot AI. La licencia es la Kimi K3.1-Pro License, que incluye condiciones para despliegues comerciales a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) |
| Parametros totales | 2,78 billones (2.78T) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 2 bits por peso (2,125 bits efectivos) para expertos enrutados; resto del checkpoint en FP8 via vLLM |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3.1-Pro License (license: other) |
| Formato de pesos | safetensors (packed/layer-01..92.safetensors para expertos; model/ para el resto) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 2,78 billones de parametros, de los cuales la mayor parte corresponde a 82.432 expertos enrutados (1.347 GiB en los pesos publicados). Esta cuantizacion mantiene todos los expertos y reduce su precision a 2 bits por peso, una decision motivada por mediciones propias: eliminar la mitad de los expertos degrada la calidad mas del doble que reducir su precision a la mitad. El resultado son 674 GiB de expertos empaquetados que, segun el autor, igualan la perplejidad del original en texto reservado.

La innovacion tecnica clave es la distribucion en tres niveles: los expertos mas usados de cada capa residen en la RTX PRO 6000, el siguiente nivel en la HBM del GB300 y la cola larga en memoria Grace, que el GB300 lee in situ por NVLink. Kernels Triton personalizados multiplican directamente desde los bytes de 2 bits sin desempaquetar, y ambas GPUs procesan cada capa simultaneamente. vLLM conserva atencion, cache KV, planificacion, decodificacion especulativa con el draft model DSpark y la API; solo se inyecta un modulo de expertos mediante un hook en `PYTHONPATH`. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto con modo thinking (razonamiento explicito antes de responder).
- Function calling y tool calling a traves del parser Kimi de vLLM.
- Razonamiento matematico: 98% en GSM8K (196/200) con thinking activado.
- Decodificacion especulativa integrada mediante el draft model Kimi-K3.1-Pro-DSpark-preview.
- Servicio mediante endpoint compatible con OpenAI (`/v1`, modelo `kimi-k3.1-pro`).
- Contexto largo de 131.072 tokens para conversaciones y documentos extensos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido en entornos de investigacion: el modelo resuelve problemas tipo GSM8K con thinking a ~30 tokens/s en una sola estacion, adecuado para validacion de pipelines de evaluacion sin acceso a cluster.
- Agentes de codigo con tool calling: al exponer una API compatible con OpenAI y soportar function calling via el parser Kimi, puede integrarse en frameworks de agentes (LangChain, LlamaIndex) para tareas multi-paso sobre repositorios.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite analisis de contratos, informes o transcripciones completas en una sola pasada sin chunking.
- Laboratorio de cuantizacion e inferencia: el repositorio y los kernels Triton sirven como referencia reproducible para estudiar el impacto de 2 bits en MoE de gran escala, con RESULTS.md documentando cada medicion.
- Despliegue on-premise con requisitos de soberania de datos: al ejecutarse en hardware de sobremesa sin dependencia de nube, encaja en escenarios donde los datos no pueden salir de las instalaciones.
- Prototipado de productos conversacionales de alta calidad: la perplejidad 2,92 y la coincidencia top-1 del 85% permiten usar esta version como sustituto del modelo completo en pruebas de producto antes de escalar a infraestructura de centro de datos.
- Evaluacion comparativa de decodificacion especulativa: el uso de DSpark con vLLM permite medir aceleraciones reales sobre un MoE de 2,78T en hardware acotado.

## Benchmarks y rendimiento

| Metrica | Este modelo (2-bit DGX Station) | Pesos publicados (Moonshot) |
|---|---|---|
| Perplejidad en texto reservado (52.891 tokens) | 2,92 | 2,95 |
| GSM8K (200 preguntas, con thinking) | 98% (196/200) | no disponible |
| Coincidencia token top-1 | 85% | referencia |
| Velocidad, una peticion | ~30 tokens/s | no disponible |
| Equivalencia con vLLM stock | mismos tokens greedy, probabilidades casi identicas | referencia |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia: una DGX Station con GB300 + RTX PRO 6000 + 494 GiB de memoria Grace.
- VRAM/espacio total necesario: 674 GiB de expertos empaquetados + 107 GiB del resto del checkpoint (838 GB de repositorio).
- No cabe en GPUs de consumo (RTX 4090, 5090, etc.): el modelo requiere el pool de memoria unificado de una DGX Station.
- Despliegue: vLLM stock (sin cambios en el codigo fuente) con hook via `PYTHONPATH`; imagen de vLLM descargada por el script `./kimi install`.
- Arranque: `./kimi up` expone `http://127.0.0.1:30005/v1` con el identificador de modelo `kimi-k3.1-pro`.
- Latencia/throughput: ~30 tokens/s con una peticion; no se dispone de datos de throughput con batching.
- Alternativas de despliegue como llama.cpp, Ollama o TGI: no disponibles para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-DGX-Station-2bit (este) | 2,78T (MoE) | 131.072 | 2 bits (expertos) + FP8 | Kimi K3.1-Pro License | 1 DGX Station |
| moonshotai/Kimi-K3.1-Pro (original) | 2,78T (MoE) | 131.072 | BF16/FP16 (1,45 TiB) | Kimi K3.1-Pro License | 8 GPUs de centro de datos |
| Kimi-K3.1-Pro-DSpark-preview (draft) | no disponible | no disponible | no disponible | no disponible | auxiliar de decodificacion especulativa |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion de 2 bits: aunque la perplejidad medida es 2,92 frente a 2,95, la coincidencia top-1 es del 85%, por lo que el 15% de las predicciones difieren del modelo original.
- Requiere hardware especifico (DGX Station con GB300, RTX PRO 6000 y 494 GiB Grace); no es portable a configuraciones convencionales.
- La licencia Kimi K3.1-Pro License incluye condiciones para despliegues comerciales a gran escala; revisar `LICENSE` antes de uso en produccion.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones adicionales en esta cuantizacion.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue mas alla de la del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha: es un artefacto reciente (creado el 12-11-2026) sin validacion comunitaria independiente.
- Solo se han publicado resultados en GSM8K y perplejidad; no hay evaluacion en MMLU, HumanEval ni tareas de seguridad.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tomcupr/Kimi-K3.1-Pro-DGX-Station-2bit
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Draft model: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark-preview
- Recetas y kernels: https://github.com/tomascupr/dgx-station-recipes
- Receta especifica: https://github.com/tomascupr/dgx-station-recipes/tree/main/kimi-k3.1-pro
- Resultados reproducibles: https://github.com/tomascupr/dgx-station-recipes/blob/main/kimi-k3.1-pro/RESULTS.md
