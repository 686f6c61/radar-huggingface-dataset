# yetalabs/Kimi-K3.1-Pro-abliterated

## Resumen

Kimi K3.1 Pro es un modelo de pesos abiertos, nativamente multimodal y orientado a agentes, desarrollado por Moonshot AI. Se trata del modelo de clase 3T mas capaz de la compania hasta la fecha y el primero de la serie K3.1. Parte de Kimi K3 y se ha post-entrenado con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, con mejoras sustanciales en programacion, creacion 3D, investigacion financiera y precision factual.

La arquitectura es un transformer de mezcla de expertos (MoE) con 2,8 billones de parametros totales y 104.000 millones activos por token, 93 capas y una ventana de contexto de un millon de tokens. Combina 69 capas de atencion KDA con 24 capas de Gated DSA, e incorpora 896 expertos con 16 seleccionados por token mas 2 expertos compartidos.

La version aqui descrita es `yetalabs/Kimi-K3.1-Pro-abliterated`, un derivado publicado por el usuario yetalabs que aplica una modificacion de tipo *abliteration* sobre los pesos originales de Moonshot AI. El repositorio pesa 1561,4 GB y se distribuye en formato safetensors con cuantizacion de 8 bits mediante compressed-tensors. No registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer; 69 capas KDA + 24 capas Gated DSA |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (compressed-tensors); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other) |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 93 capas, de las cuales 1 es densa. La composicion de atencion combina 69 capas KDA (Kimi Delta Attention) con 24 capas Gated DSA (DeepSeek Sparse Attention, segun la nomenclatura del autor), con una dimension oculta de atencion de 7168 y 96 cabezas. La rama DSA emplea 32 cabezas de indice con dimension 128 y un top-K de 2048, lo que sugiere un mecanismo de atencion dispersa sobre el contexto largo.

La capa MoE utiliza una dimension latente de 3584, 896 expertos con dimension oculta de 3072 por experto, 16 expertos seleccionados por token y 2 expertos compartidos. El vocabulario es de 160K tokens. El post-entrenamiento se realizo mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, partiendo de Kimi K3. No se dispone de datos sobre el numero de tokens de preentrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO especificas.

La variante *abliterated* de yetalabs modifica los pesos para eliminar o atenuar los mecanismos de rechazo aprendidos durante el alineamiento. No se dispone de documentacion tecnica sobre el metodo exacto aplicado ni sobre el impacto en capacidades.

## Capacidades

- Generacion de texto y razonamiento multi-paso con ventana de contexto de un millon de tokens.
- Capacidades multimodales nativas de entrada imagen-texto (pipeline `image-text-to-text`).
- Programacion y generacion de codigo, con mejoras declaradas por el autor en tareas de coding.
- Creacion 3D, segun la model card del modelo base.
- Investigacion financiera y analisis de documentos extensos.
- Capacidades agenticas: el autor lo describe como modelo agentico, con soporte para razonamiento multi-paso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- La variante abliterated elimina total o parcialmente los rechazos del modelo base, lo que afecta al comportamiento en consultas sensibles.

## Casos de uso

- Analisis de documentacion extensa: con un millon de tokens de contexto, el modelo puede procesar informes anuales completos, expedientes o bases de codigo enteras en una sola pasada sin necesidad de troceado ni recuperacion.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD para revision de cambios, generacion de tests y refactorizacion sobre repositorios grandes, aprovechando la ventana de contexto para incluir multiples ficheros relacionados.
- Investigacion financiera asistida: extraccion y sintesis de datos de informes, comparacion de estados financieros y generacion de resumenes con trazabilidad sobre documentos largos.
- Agentes autonomos multi-paso: orquestacion de tareas que requieren planificacion, uso de herramientas y verificacion sobre contextos largos, gracias a los 104B parametros activos y al entrenamiento por RL en dominios downstream.
- Creacion y edicion 3D asistida: generacion de descripciones estructuradas y codigo de escenas 3D a partir de instrucciones e imagenes de referencia.
- Procesamiento de imagenes y texto combinados: transcripcion de diagramas, extraccion de datos de capturas o analisis de documentacion escaneada junto con texto de contexto.
- Atencion al cliente con contexto largo: gestion de conversaciones multi-turno con historial extenso e integracion de base de conocimiento completa en el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1561,4 GB en cuantizacion de 8 bits. Se requiere un nodo multi-GPU con al menos 1,6 TB de memoria agregada solo para cargar los pesos; el estado KV para un millon de tokens anade una demanda adicional significativa no cuantificada en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el volumen de pesos, el despliegue requiere clústeres de GPU de centro de datos (familias H100/H200/B200 o equivalentes) en configuracion multi-nodo.
- Compatibilidad con GPU de consumo: no cabe en ninguna GPU de consumo actual, ni siquiera con cuantizaciones agresivas, dado el tamano de 2,8T parametros.
- Opciones de despliegue: transformers con `trust_remote_code` (el modelo declara `custom_code`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro (abliterated, yetalabs) | 2,8T | 104B | 1M tokens | kimi-k3.1-pro (other) | Hugging Face, 8-bit compressed-tensors |
| Kimi K3.1 Pro (Moonshot AI) | 2,8T | 104B | 1M tokens | kimi-k3.1-pro (other) | Hugging Face, ModelScope, API Kimi |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Hugging Face (moonshotai) |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada. La diferencia principal entre la version de yetalabs y la original de Moonshot AI es la modificacion abliterated y la cuantizacion a 8 bits; el resto de especificaciones arquitectonicas coinciden.

## Limitaciones y advertencias

- La modificacion abliterated elimina o atenua los rechazos del modelo base, lo que incrementa el riesgo de generar contenido danino, ofensivo o inseguro en produccion. No se recomienda su uso en aplicaciones orientadas al publico sin filtros adicionales.
- No se dispone de evaluacion del impacto de la abliteration sobre capacidades, precision factual ni tasas de alucinacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se han publicado metricas de factualidad para esta variante.
- Idiomas soportados no documentados; el comportamiento fuera de los idiomas principales del modelo base es incierto.
- La licencia `kimi-k3.1-pro` (license: other) no esta detallada en la informacion disponible; es imprescindible revisar el fichero LICENSE del repositorio original de Moonshot AI antes de cualquier uso comercial.
- El modelo requiere infraestructura de centro de datos (mas de 1,5 TB de pesos en 8 bits); no es viable en hardware de consumo.
- El repositorio no registra descargas ni likes, y el autor yetalabs no es el desarrollador original; no hay garantias de calidad ni de integridad de los pesos modificados.
- La model card del derivado no documenta el proceso de abliteration ni los cambios exactos respecto al modelo base.

## Enlaces

- Repositorio del derivado: https://huggingface.co/yetalabs/Kimi-K3.1-Pro-abliterated
- Repositorio original: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Fichero de licencia original: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Documentacion de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Web de Kimi: https://www.kimi.ai
- Web de Moonshot AI: https://www.moonshot.ai
- Organizacion en Hugging Face: https://huggingface.co/moonshotai
- Organizacion en ModelScope: https://modelscope.cn/organization/moonshotai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
