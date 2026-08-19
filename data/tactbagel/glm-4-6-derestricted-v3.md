# tactBagel/GLM-4.6-Derestricted-v3

## Resumen

GLM-4.6-Derestricted-v3 es una version "derestringida" del modelo GLM-4.6 de Zhipu AI / Z.ai, publicada por Arli AI y distribuida en HuggingFace por el usuario tactBagel. El objetivo declarado es eliminar los comportamientos de rechazo del modelo original (negativas a responder ciertos contenidos) preservando al mismo tiempo la capacidad de razonamiento, mediante una tecnica denominada "Norm-Preserving Biprojected Abliteration", desarrollada por Jim Lai (grimjim). A diferencia del abliteration clasico, que resta directamente un vector de rechazo de los pesos y degrada las normas de las neuronas, esta tecnica descompone los pesos en magnitud y direccion, elimina el componente de rechazo solo de la direccion y recombina con las magnitudes originales, evitando el deterioro del modelo.

El modelo base, GLM-4.6, es un transformer de mezcla de expertos (MoE) con 356.785.898.816 parametros totales (~356,8 mil millones) y una ventana de contexto de 200.000 tokens, frente a los 128.000 de GLM-4.5. Segun la model card original, GLM-4.6 mejora respecto a GLM-4.5 en codificacion, razonamiento, capacidades de agente y escritura, y compite con DeepSeek-V3.1-Terminus y Claude Sonnet 4. La licencia es MIT, lo que permite uso comercial sin restricciones. El repositorio ocupa 713,6 GB en formato safetensors, consistente con pesos en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia GLM-4.6 |
| Parametros totales | 356.785.898.816 (~356,8 B) |
| Parametros activos | no disponible (modelo MoE; el tag `glm4_moe` confirma la arquitectura, pero no se publica el numero de parametros activos) |
| Longitud de contexto | 200.000 tokens |
| Tipos de cuantizacion | BF16 nativo (safetensors); versiones FP8, INT8 (W8A8) y GPTQ W4A16 publicadas por ArliAI |
| Idiomas soportados | no disponible en los metadatos; el modelo base GLM-4.6 de Zhipu AI soporta principalmente chino e ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

GLM-4.6-Derestricted-v3 parte del modelo base zai-org/GLM-4.6, un transformer MoE desarrollado por Zhipu AI. El modelo original amplia la ventana de contexto de 128K a 200K tokens y presenta mejoras en codificacion, razonamiento (incluido uso de herramientas durante la inferencia), capacidades de agente y escritura. El informe tecnico de referencia es el de GLM-4.5 (arXiv:2508.06471), ya que ambos modelos comparten metodologia de inferencia.

La modificacion principal de esta version es el "Norm-Preserving Biprojected Abliteration", un proceso en tres pasos: (1) biproyeccion del vector de rechazo para garantizar ortogonalidad con direcciones "inofensivas"; (2) descomposicion de los pesos en magnitud y direccion; (3) eliminacion del componente de rechazo solo de la direccion, recombinando con las magnitudes originales. Esto preserva la estructura de importancia de la red y, segun los autores, evita la "Safety Tax", es decir, la perdida de rendimiento tipica del abliteration clasico. Los autores afirman que este metodo puede incluso mejorar el razonamiento respecto al modelo base al eliminar el coste computacional de suprimir sus propias salidas.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato libre, sin filtros de contenido ni rechazos.
- Razonamiento avanzado con soporte de uso de herramientas durante la inferencia, segun la model card de GLM-4.6.
- Codificacion de alto nivel: el modelo base obtiene puntuaciones superiores en benchmarks de codigo y mejor rendimiento real en aplicaciones como Claude Code, Cline, Roo Code y Kilo Code.
- Capacidades de agente: integracion efectiva en frameworks de agentes, con mejor uso de herramientas y busqueda.
- Ventana de contexto de 200K tokens, adecuada para tareas agente complejas y documentos extensos.
- Escritura refinada: mejor alineacion con preferencias humanas en estilo y legibilidad, y mejor comportamiento en role-playing.
- Capacidades multilingues: el modelo base GLM-4.6 soporta principalmente chino e ingles; no se especifican otros idiomas en la informacion proporcionada.

## Casos de uso

- Desarrollo de agentes autonomos: con 200K tokens de contexto y soporte de tool calling durante la inferencia, el modelo puede gestionar cadenas de razonamiento multi-paso y orquestar llamadas a APIs externas en entornos de produccion.
- Generacion de codigo en pipelines de CI/CD: su rendimiento en benchmarks de codigo y su compatibilidad con herramientas como Cline o Roo Code permiten integrarlo como asistente de programacion en repositorios grandes, con contexto suficiente para analizar multiples archivos.
- Investigacion academica sobre seguridad y alineacion de IA: al eliminar los rechazos sin degradar el razonamiento, permite estudiar comportamientos de modelos sin censura y comparar la calidad de salida frente al modelo original.
- Procesamiento de documentos extensos: la ventana de 200K tokens permite resumir, analizar y extraer informacion de contratos, informes tecnicos o codigo fuente de gran tamano en una sola pasada.
- Asistencia creativa sin restricciones: escritura de ficcion, guiones o contenido de rol con un modelo que no impone filtros de estilo ni rechazos tematicos, manteniendo coherencia narrativa.
- Despliegue privado en entornos corporativos: la licencia MIT y la ausencia de telemetria (al ser un modelo autocontenido) permiten ejecutarlo en infraestructura propia para tareas de generacion de texto donde la confidencialidad es critica.
- Evaluacion de modelos "abliterados": como referencia para comparar tecnicas de eliminacion de rechazo (abliteration clasico frente a biproyeccion con preservacion de normas) en terminos de rendimiento y calidad.

## Benchmarks y rendimiento

La model card del modelo base GLM-4.6 menciona evaluaciones en ocho benchmarks publicos que cubren agentes, razonamiento y codificacion, con mejoras claras sobre GLM-4.5 y ventajas competitivas frente a DeepSeek-V3.1-Terminus y Claude Sonnet 4. Sin embargo, no se proporcionan cifras concretas en la informacion disponible. La model card de la version derestringida afirma que la tecnica de biproyeccion evita la "Safety Tax" y puede mejorar el razonamiento sobre el modelo base, pero no se publican numeros de benchmarks especificos para esta version.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos en BF16 ocupan 713,6 GB, lo que requiere un cluster multi-GPU. Con cuantizacion FP8 o INT8 (~357 GB), se necesitan al menos 5 GPU de 80 GB (A100/H100) o 9 GPU de 48 GB (L40S/RTX 6000 Ada).
- La cuantizacion GPTQ W4A16 (~178 GB) permite reducir a 3 GPU de 80 GB o 4 de 48 GB, con perdida de precision en pesos pero manteniendo activaciones en 16 bits.
- No es viable en GPU de consumo (RTX 4090 de 24 GB) ni en configuraciones de una sola GPU, incluso con las cuantizaciones mas agresivas.
- Opciones de despliegue: vLLM, TensorRT-LLM y TGI para servidores de inferencia; llama.cpp para cuantizaciones GGUF (no publicadas en este repositorio); FriendliAI ofrece un endpoint de inferencia gestionado para esta version del modelo.
- Latencia y throughput: no disponible; dependen del numero de GPU, del ancho de banda NVLink/InfiniBand y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-4.6-Derestricted-v3 | 356,8 B (MoE) | 200K | MIT | Version sin rechazos de GLM-4.6 |
| GLM-4.6 (original, zai-org) | 356,8 B (MoE) | 200K | MIT | Modelo base con comportamientos de rechazo intactos |
| GLM-4.5 | ~355 B (MoE) | 128K | MIT | Generacion anterior; GLM-4.6 lo supera en agentes, codigo y razonamiento |
| DeepSeek-V3.1-Terminus | no disponible | no disponible | no disponible | Citado como competidor directo en benchmarks de GLM-4.6 |
| Claude Sonnet 4 | no disponible (propietario) | no disponible | propietaria | Competidor comercial; GLM-4.6 mantiene ventaja competitiva segun Zhipu AI |

La comparacion directa con DeepSeek-V3.1-Terminus y Claude Sonnet 4 se basa en las afirmaciones de la model card de GLM-4.6; no se dispone de cifras de benchmarks concretas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar comportamientos de rechazo, lo que implica que puede generar contenido que el modelo original se negaria a producir. Esto incluye material potencialmente ofensivo, peligroso o ilegal. El despliegue en produccion debe contemplar politicas de uso y moderacion externa.
- La tecnica de abliteration, incluso con preservacion de normas, no garantiza la ausencia de alucinaciones ni la fiabilidad factual. Los autores advierten de que pueden aparecer "conocimientos sorprendentes" no presentes en el modelo base, lo que en la practica puede traducirse en salidas impredecibles.
- No se han publicado benchmarks especificos de esta version derestringida; las afirmaciones sobre mejora de razonamiento se basan en la metodologia, no en datos medidos.
- Los idiomas soportados no estan documentados en los metadatos; el modelo base GLM-4.6 esta optimizado principalmente para chino e ingles, con posible degradacion en otros idiomas.
- El repositorio ocupa 713,6 GB, lo que exige infraestructura de alto coste para inferencia local. Las versiones cuantizadas estan publicadas por ArliAI en repositorios separados, no en este.
- No hay garantias de soporte ni mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la publicacion, y el autor (tactBagel) no ofrece documentacion adicional mas alla de la model card.
- La licencia MIT permite uso comercial, pero la responsabilidad legal del contenido generado recae en el usuario final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tactBagel/GLM-4.6-Derestricted-v3
- Modelo base GLM-4.6 (zai-org): https://huggingface.co/zai-org/GLM-4.6
- Repositorio original de Arli AI: https://huggingface.co/ArliAI/GLM-4.6-Derestricted
- Version FP8: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-FP8
- Version INT8 (W8A8): https://huggingface.co/ArliAI/GLM-4.6-Derestricted-W8A8-INT8
- Version GPTQ W4A16: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-GPTQ-W4A16
- Blog tecnico sobre Norm-Preserving Biprojected Abliteration: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Informe tecnico GLM-4.5 (arXiv): https://arxiv.org/abs/2508.06471
- Blog tecnico de GLM-4.6: https://z.ai/blog/glm-4.6
- Repositorio GitHub de GLM-4.5 (inferencia): https://github.com/zai-org/GLM-4.5
- Endpoint de inferencia FriendliAI: https://friendli.ai/models/pritz07/GLM-4.6-Derestricted-v3
- Espejo en ModelScope: https://www.modelscope.cn/models/ArliAI/GLM-4.6-Derestricted-v3
