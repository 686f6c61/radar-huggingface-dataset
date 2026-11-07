# Stealth-org/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje de pesos abiertos, multimodal nativo y orientado a tareas agénticas, desarrollado por Moonshot AI. Se presenta como el primer modelo de la serie K3.1 y el mas capaz de la clase 3T de la compania. Segun la model card, deriva de Kimi K3 tras un post-entrenamiento mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, con mejoras declaradas en programacion, creacion 3D, investigacion financiera y precision factica.

Tecnicamente es un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parametros totales y 104.000 millones de parametros activos por token. Emplea una composicion de atencion hibrida de 69 capas KDA (Kimi Delta Attention) y 24 capas Gated DSA (DeepSeek Sparse Attention), con 93 capas en total y una ventana de contexto declarada de 1 millon de tokens. El pipeline registrado en Hugging Face es `image-text-to-text`, lo que confirma su naturaleza multimodal.

El modelo es relevante por combinar un contexto de un millon de tokens con capacidades agénticas y multimodales en un unico checkpoint abierto, aunque su escala (2,8T de parametros y un repositorio de 1,56 TB) lo situa fuera del alcance de cualquier despliegue en hardware de consumo. La ficha de Hugging Face indexada corresponde a una organizacion no oficial (Stealth-org) que replica el modelo de Moonshot AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida: 69 capas KDA + 24 capas Gated DSA |
| Parametros totales | 2,8 billones (2.780.110.363.392 segun safetensors) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (tag `8-bit`, `compressed-tensors`); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, `license: other`) |
| Formato de pesos | safetensors (tambien tag `compressed-tensors`) |

Otros parametros arquitectonicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Numero de capas | 93 |
| Capas densas | 1 |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension de cabeza del indice DSA | 128 |
| Cabezas del indice DSA | 32 |
| Top-K del indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |
| Tamano del repositorio | 1561,4 GB |

## Arquitectura y entrenamiento

Kimi K3.1 Pro es un transformer MoE de 93 capas con una unica capa densa y una composicion de atencion hibrida poco habitual: 69 capas usan KDA (Kimi Delta Attention) y 24 capas usan Gated DSA (DeepSeek Sparse Attention). La capa DSA incorpora un mecanismo de indexado con 32 cabezas de dimension 128 y un Top-K de 2048, disenado para seleccionar de forma dispersa las posiciones relevantes del contexto y hacer viable la ventana de un millon de tokens. La capa MoE opera en un espacio latente de dimension 3584, con 896 expertos de dimension oculta 3072, 2 expertos compartidos y 16 expertos seleccionados por token, lo que da lugar a los 104.000 millones de parametros activos.

Segun la model card, el modelo se obtiene por post-entrenamiento desde Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream. No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO. La model card se interrumpe en la seccion de resumen y no incluye el resto de especificaciones ni la seccion de entrenamiento completa.

## Capacidades

- Generacion de texto y razonamiento general en un contexto de hasta 1.000.000 de tokens.
- Procesamiento multimodal nativo de imagen y texto (pipeline `image-text-to-text`).
- Capacidades agénticas: la model card la describe explicitamente como "agentic model" con mejoras en tareas de agente.
- Programacion y generacion de codigo, con mejoras declaradas respecto a Kimi K3.
- Creacion y modelado 3D, area destacada en la model card.
- Investigacion financiera y analisis de datos financieros.
- Mejora declarada en precision factica.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento extendido (thinking): no disponible.

## Casos de uso

- Analisis de repositorios completos: con una ventana de 1M de tokens, el modelo puede ingerir bases de codigo de gran tamano en una sola pasada y responder preguntas de arquitectura, dependencias o refactorizaciones sin chunking previo.
- Agentes de automatizacion de software: su orientacion agéntica y su capacidad de codigo permiten integrarlo en bucles multi-paso de generacion, ejecucion de pruebas y correccion de errores dentro de pipelines de CI/CD.
- Investigacion financiera asistida: analisis de informes anuales, transcripciones de resultados y series de datos extensas en una unica ventana de contexto, con extraccion de metricas y comparativas entre ejercicios.
- Generacion y edicion de activos 3D: la model card destaca mejoras en creacion 3D, lo que lo hace adecuado para flujos de descripcion a geometria o a scripts de modelado procedural.
- Procesamiento de documentos multimodales: al aceptar imagen y texto, puede extraer informacion de graficos, tablas escaneadas y diagramas combinados con texto largo en el mismo contexto.
- Asistentes conversacionales de dominio largo: conversaciones multi-turno con historial extenso (por ejemplo, soporte tecnico especializado) sin perder referencias a turnos muy anteriores.
- Auditoria de cumplimiento documental: revision de contratos o normativas extensas comparando clausulas a lo largo de cientos de paginas en una sola sesion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indexada se interrumpe antes de las secciones de evaluacion y el blog tecnico solo menciona mejoras cualitativas en programacion, 3D, investigacion financiera y precision factica, sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 billones de parametros, incluso en 8 bits el modelo requiere del orden de 2,8 TB de memoria, y en precision completa alrededor de 5,6 TB. No cabe en ninguna configuracion de una sola GPU comercial actual.
- GPU recomendadas: despliegue multi-nodo con GPUs de centro de datos (H100, H200, B200 o equivalentes). El numero exacto de GPUs no esta disponible en la informacion proporcionada.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) ni en configuraciones multi-GPU de consumo.
- Opciones de despliegue: la libreria declarada es `transformers` con `custom_code`; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | kimi-k3.1-pro (propia) | Pesos abiertos en HF |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Otras alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos frente a Kimi K3, del que la model card indica que es el modelo base, sin especificaciones publicadas en la informacion disponible. No se han identificado en la busqueda otros modelos de la misma clase con datos verificables para comparar parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Escala extrema: 2,8T de parametros y un repositorio de 1,56 TB hacen inviable el despliegue fuera de infraestructura de centro de datos multi-nodo.
- Licencia propia (`kimi-k3.1-pro`, `license: other`): es imprescindible revisar los terminos del fichero LICENSE antes de cualquier uso comercial; las restricciones concretas no estan disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la model card menciona mejoras en precision factica, pero sin datos de evaluacion que las respalden.
- Idiomas soportados no declarados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del ingles o el chino sin evaluacion propia.
- La model card indexada esta truncada: faltan secciones de entrenamiento, evaluacion y uso responsable, por lo que no se pueden verificar afirmaciones sobre datos, sesgos o mitigaciones.
- El repositorio `Stealth-org/Kimi-K3.1-Pro` no es la organizacion oficial de Moonshot AI y registra 0 descargas y 0 likes; conviene contrastar la integridad de los pesos con el repositorio oficial `moonshotai/Kimi-K3.1-Pro`.
- Requiere `trust_remote_code` por el tag `custom_code`, lo que implica ejecutar codigo del repositorio durante la carga del modelo.
- No hay informacion sobre sesgos conocidos ni sobre el modo de razonamiento o tool calling, lo que limita la planificacion de despliegues agénticos en produccion.

## Enlaces

- Repositorio indexado: https://huggingface.co/Stealth-org/Kimi-K3.1-Pro
- Repositorio oficial: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Chat: https://www.kimi.ai
- Web de Moonshot AI: https://www.moonshot.ai
- Organizacion en Hugging Face: https://huggingface.co/moonshotai
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
