# vikeeai/opus-mt-en-vi

## Resumen

`vikeeai/opus-mt-en-vi` es una conversion a ONNX del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-vi`, publicado por el usuario vikeeai con el objetivo de hacerlo compatible con Transformers.js y, por extension, con inferencia en navegador o en entornos JavaScript sin backend Python. El modelo original forma parte de la familia OPUS-MT desarrollada por el grupo Language Technology de la Universidad de Helsinki, entrenada sobre corpus paralelos del proyecto OPUS y distribuida bajo arquitectura Marian.

La relevancia de esta publicacion no reside en el modelo en si, sino en el formato: al incluir los pesos en ONNX dentro de una subcarpeta `onnx`, permite ejecutar traduccion ingles-vietnamita directamente en el cliente mediante la libreria Transformers.js de Hugging Face. Se trata, por tanto, de un artefacto de despliegue web mas que de un modelo nuevo.

El repositorio tiene un tamano de 0,4 GB, no registra descargas ni interacciones en el momento de la consulta y no incluye informacion adicional sobre licencia, idiomas o metricas mas alla de los metadatos heredados del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el modelo base se distribuye tambien en fp32) |
| Idiomas soportados | ingles y vietnamita (par en-vi, segun el modelo base) |
| Licencia | no disponible |
| Formato de pesos | ONNX (carpeta `onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

El modelo subyacente, `Helsinki-NLP/opus-mt-en-vi`, pertenece a la familia OPUS-MT basada en Marian, una arquitectura transformer encoder-decoder con atencion multi-cabeza estandar, pensada especificamente para traduccion automatica neuronal. Marian fue desarrollada originalmente por el grupo de Philipp Koehn en la Universidad Johns Hopkins y adoptada por Helsinki-NLP para entrenar sistemas de traduccion sobre corpus paralelos de OPUS.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO. Tampoco se especifican innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La unica modificacion respecto al modelo original es la exportacion de pesos a ONNX mediante herramientas del ecosistema Hugging Face Optimum, con el fin de habilitar inferencia en JavaScript a traves de Transformers.js.

## Capacidades

- Traduccion automatica de texto de ingles a vietnamita.
- Generacion de texto condicionada a tarea (`text2text-generation`), limitada al par linguistico indicado.
- Ejecucion en navegador y en entornos Node.js mediante Transformers.js, al distribuirse en formato ONNX.
- Integracion en pipelines web sin servidor Python, gracias a la compatibilidad con WebML/WebGPU.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues limitadas al par en-vi; no se declaran otros idiomas.

## Casos de uso

- Traduccion en el navegador: integracion del modelo via Transformers.js para traducir texto de ingles a vietnamita sin enviar datos a un servidor, util en aplicaciones de privacidad estricta o en entornos offline.
- Extensiones de navegador: traduccion contextual de paginas o fragmentos seleccionados mediante inferencia local en ONNX, evitando costes de API.
- Prototipado rapido en frontend: validacion de flujos de traduccion en aplicaciones web antes de migrar a un backend con mayor capacidad.
- Aplicaciones de escritorio basadas en Electron: uso del modelo en clientes ligeros que ya incluyen un runtime JavaScript y no quieren empaquetar Python.
- Educacion y demos: ejemplos interactivos de traduccion automatica en notebooks o webs estaticas sin infraestructura de servidor.
- Procesamiento por lotes en entornos edge: traduccion de contenidos en dispositivos con recursos limitados, aprovechando el tamano reducido del repositorio (0,4 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,4 GB) y la naturaleza del modelo Marian, es plausible ejecutarlo en CPU y en GPUs de gama baja, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable en GPUs integradas y dedicadas modestas, pero no confirmado.
- Opciones de despliegue: Transformers.js (principal), y potencialmente ONNX Runtime y otros runtimes compatibles con ONNX; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vikeeai/opus-mt-en-vi | no disponible | no disponible | no disponible | ONNX | Conversion web de OPUS-MT en-vi |
| Helsinki-NLP/opus-mt-en-vi | no disponible | no disponible | no disponible | safetensors/PyTorch | Modelo original en Python |
| Otros modelos OPUS-MT en-vi | no disponible | no disponible | no disponible | varios | Familia OPUS-MT de Helsinki-NLP |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, lo que impide confirmar si el uso comercial esta permitido; debe verificarse en el modelo base `Helsinki-NLP/opus-mt-en-vi`.
- El repositorio no incluye model card detallada ni informacion sobre sesgos, calidad de traduccion o dominios cubiertos.
- Al ser una conversion ONNX de un modelo de traduccion, hereda las limitaciones del modelo original: posibles errores en terminologia especializada, nombres propios y expresiones idiomaticas.
- Riesgo de alucinacion o traducciones infieles en textos largos o ambiguos, comun en sistemas de traduccion neuronal de este tipo.
- Solo cubre el par ingles-vietnamita; no se declaran capacidades multilingues adicionales.
- No hay evidencia de pruebas de calidad ni de uso en produccion (0 descargas, 0 likes en el momento de la consulta).
- La naturaleza de "solucion temporal" para WebML indicada por el autor sugiere que el repositorio podria quedar obsoleto si se estandariza la distribucion de pesos ONNX en el repositorio principal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vikeeai/opus-mt-en-vi
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-vi
- Documentacion de Optimum: https://huggingface.co/docs/optimum/index
- Transformers.js: https://huggingface.co/docs/transformers.js
