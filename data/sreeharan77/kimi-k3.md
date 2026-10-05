# sreeharan77/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo Mixture-of-Experts (MoE) con aproximadamente 2,8 billones de parametros totales y 104 000 millones de parametros activos por token, disenado para tareas de codigo de horizonte largo, trabajo de conocimiento agentico y razonamiento avanzado. La model card atribuye su desarrollo a Moonshot AI e indica que se trata del primer modelo abierto de clase 3T, con pesos liberados bajo la licencia "Kimi K3". La ficha de HuggingFace analizada, sin embargo, corresponde a una subida del usuario `sreeharan77` con cero descargas y cero "likes", por lo que se trata de una redistribucion no verificada y no de la publicacion oficial.

El modelo se apoya en dos innovaciones arquitectonicas declaradas: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), combinadas con un framework de escalado de esparsidad MoE denominado Stable LatentMoE, que activa 16 de 896 expertos por token. Incorpora vision nativa (texto, imagen y video en un mismo modelo) y una ventana de contexto de 1 000 000 de tokens, lo que lo situa en la categoria de modelos de frontera para agentes y flujos de trabajo de contexto masivo.

Su relevancia radica en la combinacion de pesos abiertos con capacidades multimodales y contexto de un millon de tokens a escala de billones de parametros. No obstante, el tamano del repositorio (1561 GB) y el numero de parametros implican requisitos de hardware de centro de datos, fuera del alcance de equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2 779 931 837 184 (~2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1 000 000 de tokens |
| Tipos de cuantizacion | 8-bit (etiqueta compressed-tensors); pesos safetensors. Otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible en los metadatos de HuggingFace |
| Licencia | Kimi K3 License (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors, compressed-tensors |

Datos adicionales de la model card: 93 capas (1 densa), composicion de atencion 69 KDA + 24 Gated MLA, dimension oculta de atencion 7168, 96 cabezas de atencion, dimension latente MoE 3584, dimension oculta por experto 3072, 896 expertos totales y 16 expertos seleccionados por token.

## Arquitectura y entrenamiento

Kimi K3 es un transformer de tipo Mixture-of-Experts con esparsidad elevada. La model card indica que combina Kimi Delta Attention (KDA) —un mecanismo de atencion eficiente orientado a contexto largo— con Attention Residuals (AttnRes) y un framework de escalado denominado Stable LatentMoE, que activa 16 de 896 expertos por token sobre una dimension latente de 3584. La composicion de capas de atencion es de 69 capas KDA y 24 capas Gated MLA (Multi-head Latent Attention), con una unica capa densa en toda la pila. La dimension oculta de atencion es 7168, con 96 cabezas.

Segun el autor, esta configuracion aporta una mejora aproximada de 2,5x en eficiencia de escalado respecto a Kimi K2, lo que explica el salto a la clase de 3T de parametros manteniendo 104B activos. El modelo es multimodal nativo: procesa texto, imagenes y video dentro de la misma arquitectura, sin adaptadores externos segun la model card. No se han facilitado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento, por lo que deben considerarse no disponibles.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo, orientado a sesiones de ingenieria prolongadas con supervision humana minima.
- Codificacion avanzada: navegacion de repositorios grandes, orquestacion de herramientas de terminal, optimizacion de kernels de GPU, desarrollo de compiladores y diseno de chips.
- Trabajo de conocimiento agentico de extremo a extremo: investigacion profunda con visualizaciones interactivas, widgets, cuadros de mando y diseno de movimiento o edicion de video.
- Multimodalidad nativa: comprension de texto, imagenes y video en el mismo modelo.
- Ventana de contexto de 1 000 000 de tokens para tareas de contexto masivo.
- Soporte de tool calling y uso de agentes: la model card menciona explicitamente la orquestacion de herramientas de terminal y flujos multi-paso.
- Capacidades multilingues: no especificadas en los metadatos disponibles.

## Casos de uso

- Mantenimiento de repositorios grandes: el modelo puede recorrer codebases de cientos de miles de lineas dentro de su ventana de 1M de tokens y proponer refactorizaciones o correcciones sin fragmentar el contexto.
- Optimizacion de kernels de GPU: dado su enfoque en codigo de bajo nivel, permite iterar sobre kernels CUDA o equivalentes dentro del mismo hilo de razonamiento, algo viable gracias a la ventana extendida.
- Desarrollo asistido de compiladores: admite sesiones largas con multiples archivos y dependencias, adecuado para tareas de traduccion de IR o generacion de passes.
- Investigacion agentica automatizada: puede generar informes con visualizaciones y widgets interactivos a partir de fuentes extensas, integrable en pipelines de research automation.
- Edicion y comprension de video: al ser multimodal nativo, permite tareas de resumen, indexacion o edicion asistida de video dentro del mismo modelo.
- Agentes de terminal: soporta orquestacion de herramientas de linea de comandos, util para automatizar operaciones de DevOps o analisis de sistemas.
- Asistencia en diseno de CAD o chips: la model card menciona flujos de diseno de chips y CAD con vision en el bucle, aprovechando la multimodalidad.
- Atencion a desarrolladores en IDE: integracion como backend de copilotos con contexto de repositorio completo, aunque requiere infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque la ficha de HuggingFace incluye la etiqueta `eval-results`, no se han facilitado cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos completos): en BF16/FP16 se requieren en torno a 5,5 TB de memoria agregada; en FP8/8-bit, aproximadamente 2,8 TB; en cuantizacion de 4 bits, cerca de 1,4 TB.
- El repositorio ocupa 1561 GB, coherente con una cuantizacion en torno a 4-4,5 bits por parametro de los pesos completos.
- GPU recomendadas: despliegues multi-nodo con NVIDIA H100, H200 o B200. Un unico nodo de 8x H200 (1128 GB) no es suficiente para los pesos completos ni siquiera en 4 bits sin offloading de expertos.
- En consumer GPU no es viable: ni siquiera la RTX 4090 (24 GB) ni configuraciones multi-GPU de consumo pueden alojar el modelo, aunque una estrategia de offloading agresivo de expertos a CPU/NVMe podria permitir inferencia extremadamente lenta.
- Opciones de despliegue: vLLM, TGI y otros servidores compatibles con transformers y safetensors. La presencia de la etiqueta `custom_code` implica que se requiere codigo especifico del repositorio para cargar la arquitectura KDA/AttnRes. llama.cpp u Ollama no estan confirmados como soportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (esta ficha) | ~2,8T | 104B | 1 000 000 tokens | Kimi K3 License | Pesos abiertos (subida no oficial) |
| Kimi K2 (generacion previa, citada en la model card) | no disponible en la informacion | no disponible | no disponible | no disponible | Pesos abiertos por Moonshot AI |
| DeepSeek-V3 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

La model card referencia explicitamente a Kimi K2 como predecesor y afirma una mejora de 2,5x en eficiencia de escalado, pero no se han proporcionado cifras detalladas de otros modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- La ficha de HuggingFace pertenece al usuario `sreeharan77`, no a Moonshot AI, y presenta cero descargas y cero "likes". Se trata de una redistribucion no verificada cuyos pesos podrian haber sido modificados, cuantizados o manipulados respecto al modelo original.
- La model card de esta subida replica en gran medida el texto del modelo oficial, lo que puede inducir a confusion sobre su procedencia real.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones que cuantifiquen este riesgo en esta subida concreta.
- Idiomas soportados: no declarados en los metadatos; no puede garantizarse un rendimiento equilibrado fuera de los idiomas principales del entrenamiento original.
- Licencia: la licencia "Kimi K3 License" se clasifica como `license: other`. Es imprescindible revisar sus terminos exactos antes de cualquier uso comercial, ya que puede incluir restricciones de atribucion, uso o redistribucion.
- Requisitos de hardware prohibitivos: el modelo no es desplegable en infraestructura de consumo ni en nodos unicos de gama alta sin estrategias complejas de paralelismo y offloading.
- Dependencia de codigo personalizado: la etiqueta `custom_code` obliga a confiar en el codigo incluido en el repositorio, un vector adicional de riesgo en subidas no oficiales.
- Antiguedad de los metadatos: la fecha de creacion indicada (2026-10-05) y la ausencia de informacion de versiones dificultan evaluar el estado y la vigencia real del artefacto.
- Para produccion se recomienda encarecidamente acudir a la publicacion oficial de Moonshot AI en lugar de esta ficha.

## Enlaces

- HuggingFace (esta ficha): https://huggingface.co/sreeharan77/Kimi-K3
- Organizacion oficial en HuggingFace: https://huggingface.co/moonshotai
- Modelo oficial Kimi K3 en HuggingFace (referenciado en la model card): https://huggingface.co/moonshotai/Kimi-K3
- Licencia oficial: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio en GitHub: https://github.com/MoonshotAI/Kimi-K3
- Web oficial: https://www.moonshot.ai
- Chat: https://www.kimi.com
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
