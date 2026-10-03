# TMA-1/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo mezcla de expertos (MoE, Mixture-of-Experts) especializado en programacion y flujos de trabajo agenticos, desarrollado por Moonshot AI (familia Kimi) y publicado en HuggingFace en el repositorio TMA-1/Kimi-K2.7-Code. Se construye sobre Kimi K2.6 y su objetivo declarado es mejorar la resolucion de tareas de ingenieria de software de horizonte largo, ademas de reducir el consumo de tokens de razonamiento en torno a un 30 % respecto a su predecesor.

El modelo tiene aproximadamente 1 billon (10^12) de parametros totales, de los cuales 32B estan activos por token, distribuidos en 384 expertos con 8 expertos seleccionados por token y un experto compartido, a lo largo de 61 capas. Emplea atencion MLA (Multi-head Latent Attention) y una ventana de contexto de 256K tokens (262.144). Incorpora ademas un codificador de vision MoonViT de 400M de parametros, lo que lo habilita para entradas de imagen y texto.

Su relevancia actual radica en que compite directamente con modelos propietarios de primera linea en tareas de codigo y agentes (segun la propia model card, frente a GPT-5.5 y Claude Opus 4.8), manteniendo pesos abiertos bajo licencia Modified MIT. El repositorio ocupa 595.2 GB y, con solo 15 descargas y 0 likes en el momento de la consulta, se trata de una publicacion reciente y poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con atencion MLA |
| Parametros totales | 1.026.879.376.368 (aprox. 1T) |
| Parametros activos | 32B por token |
| Longitud de contexto | 256K tokens (262.144) |
| Tipos de cuantizacion | no disponible en la model card; el repositorio declara el formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT (etiquetada en HuggingFace como license:other) |
| Formato de pesos | safetensors (contenedor compressed-tensors) |
| Numero de capas | 61 (1 capa densa incluida) |
| Numero de capas densas | 1 |
| Dimension oculta de atencion | 7168 |
| Dimension oculta MoE (por experto) | 2048 |
| Numero de cabezas de atencion | 64 |
| Numero de expertos | 384 |
| Expertos seleccionados por token | 8 |
| Expertos compartidos | 1 |
| Tamano de vocabulario | 160K |
| Funcion de activacion | SwiGLU |
| Codificador de vision | MoonViT (400M de parametros) |
| Tamano del repositorio | 595.2 GB |
| Descargas / likes | 15 / 0 |

## Arquitectura y entrenamiento

Kimi K2.7 Code es un transformer con arquitectura MoE de 61 capas (una de ellas densa) y atencion del tipo Multi-head Latent Attention (MLA), una variante que comprime las claves y los valores en un espacio latente para reducir el coste de memoria de la cache KV durante la inferencia con contextos largos. Cada token activa 8 de los 384 expertos mas un experto compartido, sobre una dimension oculta por experto de 2048 y una dimension de atencion de 7168 con 64 cabezas. La funcion de activacion es SwiGLU y el vocabulario alcanza los 160K tokens.

El modelo es multimodal: incorpora un codificador de vision MoonViT de 400M de parametros, coherente con su pipeline declarado de image-text-to-text. Segun la model card, se construye sobre Kimi K2.6 con mejoras centradas en tareas de codigo de horizonte largo (long-horizon coding) y una optimizacion de eficiencia que reduce el uso de tokens de pensamiento en aproximadamente un 30 % frente a Kimi K2.6. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento posteriores.

## Capacidades

- Generacion de codigo y resolucion de tareas de ingenieria de software de largo horizonte, con enfasis declarado en completar flujos end-to-end de forma autonoma.
- Razonamiento con modo de pensamiento (thinking mode), segun las condiciones de evaluacion indicadas en la model card.
- Capacidades agenticas y multi-paso, con soporte para protocolos de herramientas y contexto extendido (MCP evaluado en los benchmarks MCP Atlas y MCP Mark Verified).
- Tool calling / function calling, implícito en las evaluaciones agenticas y de MCP recogidas.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el codificador de vision MoonViT.
- Contexto largo de hasta 256K tokens, adecuado para trabajar sobre bases de codigo extensas.
- Capacidades multilingues: no disponible en la informacion proporcionada (los benchmarks de codigo mencionan tareas en mas de 10 lenguajes de programacion, no lenguajes naturales).

## Casos de uso

- Agentes de codificacion autonoma: el modelo puede ejecutar tareas de reparacion y desarrollo sobre repositorios reales, apoyandose en su contexto de 256K tokens para mantener a la vista multiples ficheros y su historial de cambios.
- Integracion en CLI de desarrollo (Kimi Code CLI): el propio autor referencia esta herramienta y evalua el modelo con ella en modo thinking, por lo que encaja de forma directa en flujos de asistencia en terminal.
- Resolucion de incidentes de produccion: los benchmarks internos cubren escenarios de incidentes reales, de modo que el modelo puede emplearse para diagnosticar fallos backend e infraestructura y proponer parches.
- Orquestacion de herramientas mediante MCP (Model Context Protocol): sus resultados en MCP Atlas (76.0) y MCP Mark Verified (81.1) lo posicionan para conectar herramientas externas dentro de pipelines agenticos.
- Revision de codigo automatizada en CI/CD: puede integrarse en pipelines para analizar pull requests, detectar regresiones y sugerir cambios antes del merge, aprovechando el soporte de tool calling.
- Migracion y refactorizacion de bases de codigo grandes: la ventana de 256K tokens permite procesar modulos extensos y coordinar cambios que afectan a varios ficheros de forma coherente.
- Tareas de ingenieria de software con entrada visual: al aceptar imagen y texto, puede interpretar capturas de interfaz, diagramas o esquemas junto a instrucciones textuales.

## Benchmarks y rendimiento

Resultados publicados en la model card (temperature = 1.0, top-p = 0.95, contexto de 262.144 tokens para Kimi K2.7 Code y K2.6 en modo thinking; GPT-5.5 en Codex con modo xhigh y Claude Opus 4.8 en Claude Code con modo xhigh):

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 (codigo) | 50.9 | 62.0 | 69.0 | 67.4 |
| Program Bench (codigo) | 48.3 | 53.6 | 69.1 | 63.8 |
| MLS Bench Lite (codigo) | 26.7 | 35.1 | 35.5 | 42.8 |
| Kimi Claw 24/7 Bench (agentico) | 42.9 | 46.9 | 52.8 | 50.4 |
| MCP Atlas (agentico) | 69.4 | 76.0 | 79.4 | 81.3 |
| MCP Mark Verified (agentico) | 72.8 | 81.1 | 92.9 | 76.4 |

No se han publicado en la informacion disponible resultados de benchmarks generales estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Pesos: aproximadamente 1T de parametros. El repositorio ocupa 595.2 GB, lo que indica pesos ya cuantizados o comprimidos (formato compressed-tensors). En BF16 el modelo requeriria en torno a 2 TB de VRAM solo para pesos.
- VRAM estimada: del orden de 1 TB en FP8 y de 500-600 GB en 4 bits, sin contar la cache KV. Estas cifras son estimaciones derivadas del numero de parametros, no datos confirmados por el autor.
- GPU recomendadas: para un despliegue completo se necesitan multiples aceleradores de gama alta (H100 de 80 GB, H200 o B200, asi como A100 de 80 GB) combinados mediante paralelismo de tensor y de expertos.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090 de 24 GB, RTX 5090, etc.). Al tratarse de un MoE, todos los pesos (los 384 expertos) deben estar disponibles en memoria, salvo estrategias de offload a CPU o SSD con penalizacion severa de latencia.
- Opciones de despliegue: no especificadas por el autor. Por formato y tamano, los candidatos tipicos son vLLM, SGLang o TGI en configuraciones multi-GPU; llama.cpp u Ollama quedan fuera de alcance para los pesos completos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K2.7 Code | ~1T | 32B | 256K | Modified MIT | Pesos abiertos en HuggingFace (repositorio TMA-1) |
| Kimi K2.6 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Predecesor del modelo; usado como referencia en los benchmarks |
| GPT-5.5 | no disponible | no disponible | no disponible | Propietaria | Solo via servicio gestionado |
| Claude Opus 4.8 | no disponible | no disponible | no disponible | Propietaria | Solo via servicio gestionado |

Nota: los datos de GPT-5.5 y Claude Opus 4.8 se incluyen unicamente como terminos de comparacion procedentes de la model card; no se dispone de sus especificaciones tecnicas. Otros modelos MoE abiertos de tamano comparable, como DeepSeek-V3 o Qwen3-Coder, no aparecen en la informacion proporcionada, por lo que no se incluyen cifras de ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de alucinacion; como modelo generativo, mantiene riesgo de producir codigo o afirmaciones incorrectas, especialmente en tareas de horizonte largo.
- Limitaciones de contexto o idioma: la ventana es de 256K tokens; no hay informacion sobre el rendimiento en idiomas naturales distintos del ingles ni sobre que idiomas soporta oficialmente.
- Restricciones de licencia: la licencia es Modified MIT, registrada en HuggingFace como license:other. Es una variante de MIT, por lo que conviene revisar el texto completo del fichero LICENSE antes de un uso comercial; no se detallan aqui las clausulas adicionales.
- El repositorio es una publicacion de terceros (cuenta TMA-1) y no la organizacion oficial moonshotai; conviene verificar procedencia e integridad de los pesos.
- El estado de la model card parece truncado (las notas al pie sobre benchmarks de codigo quedan cortadas), por lo que parte de la metodologia de evaluacion no esta disponible.
- Los benchmarks principales (Kimi Code Bench v2, Program Bench, MLS Bench Lite, Kimi Claw 24/7 Bench) son internos del autor, no estandarizados, lo que limita la comparabilidad externa.
- No se dispone de informacion sobre cuantizaciones oficiales, requisitos de despliegue ni limites de uso comercial concretos.

## Enlaces

- HuggingFace: https://huggingface.co/TMA-1/Kimi-K2.7-Code
- Licencia: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
- Kimi Code: https://www.kimi.com/code
- Homepage Moonshot AI: https://www.moonshot.ai
- Organizacion Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo; los enlaces hallados corresponden a empresas industriales y servicios de mantenimiento ajenos a este modelo.
