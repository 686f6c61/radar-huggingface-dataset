# Sqersters/VoidGPTQ-2B-0.1

## Resumen

VoidGPTQ-2B-0.1 es una distribucion en formato GGUF de un modelo multimodal (vision-lenguaje) de aproximadamente 2 000 millones de parametros, publicada por el usuario Sqersters en HuggingFace. El repositorio no contiene pesos en safetensors ni el modelo original, sino dos ficheros GGUF generados con Unsloth: una cuantizacion Q8_0 para el modelo de lenguaje y un proyector multimodal (`mmproj`) en BF16. Los nombres de los ficheros (`Qwen3.5-2B.BF16-mmproj.gguf`, `Qwen3.5-2B.Q8_0.gguf`) indican que deriva de un modelo base denominado Qwen3.5-2B, aunque la model card no documenta la procedencia exacta, el pipeline ni la licencia.

La relevancia de esta publicacion es practica mas que cientifica: empaqueta un modelo de 1 942 653 248 parametros en un formato ejecutable directamente con `llama.cpp` y compatible con el ecosistema de inferencia local (Ollama, LM Studio, servidores compatibles con la API de OpenAI). Al incluir el proyector multimodal, permite inferencia con imagenes sin necesidad de servidores dedicados ni GPU de datacenter, algo poco habitual en modelos de vision-lenguaje de este rango de tamano.

El repositorio, sin embargo, esta practicamente sin documentar: no declara licencia, no especifica idiomas soportados, no publica resultados de benchmarks y acumula cero descargas y cero likes en el momento de redactar esta ficha. Cualquier evaluacion en produccion deberia tratarse como una validacion desde cero, empezando por confirmar la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los nombres de fichero apuntan a un modelo base Qwen3.5-2B; no se confirma en la model card si es transformer denso, MoE o hibrido) |
| Parametros totales | 1 942 653 248 (~1,94 B) |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje) y BF16 (proyector multimodal `mmproj`); no se publican otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (dos ficheros: `Qwen3.5-2B.Q8_0.gguf` y `Qwen3.5-2B.BF16-mmproj.gguf`) |
| Modalidad | texto e imagen (vision-language model); audio no documentado |
| Modelo base | Qwen3.5-2B (inferido de los nombres de fichero, no confirmado en la model card) |
| Herramienta de conversion | Unsloth |
| Tamano del repositorio | 2,7 GB |
| Fecha de publicacion | 2 de octubre de 2026 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna del modelo. No se detalla en la model card si se trata de un transformer denso, de una mezcla de expertos (MoE) o de una arquitectura hibrida con capas de atencion lineal. Tampoco se documenta el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni la resolucion de imagen que acepta el proyector multimodal. El unico dato estructural firme es el recuento de parametros (1 942 653 248) y la existencia de dos componentes separados: un modulo de lenguaje y un proyector multimodal (`mmproj`) que traduce las representaciones visuales al espacio del modelo de lenguaje, un esquema habitual en arquitecturas tipo LLaVA o Qwen-VL.

Tampoco hay informacion sobre el proceso de entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset, si hubo fases de ajuste supervisado (SFT), optimizacion por preferencias (RLHF o DPO) o entrenamiento con refuerzo verificable. La unica referencia tecnica del repositorio es que la conversion a GGUF se realizo con Unsloth, lo que implica que el proceso se apoyo en las herramientas de dicha libreria para producir los ficheros finales, pero no aporta datos sobre el entrenamiento del modelo original.

Un detalle relevante es la discrepancia entre el nombre del repositorio (`VoidGPTQ-2B-0.1`, que sugiere una cuantizacion GPTQ) y el contenido real, que son ficheros GGUF sin ninguna relacion con el formato GPTQ. Conviene no confundir ambos formatos: GPTQ esta pensado para GPUs con kernels especificos, mientras que GGUF es el formato nativo de `llama.cpp` y esta optimizado para CPU, Apple Silicon e inferencia mixta CPU-GPU. Ademas, el nombre "VoidGPT" no coincide con el modelo base aparente (Qwen3.5-2B), lo que sugiere un renombrado o un ajuste propio del autor cuyo alcance no se documenta.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio y el uso recomendado con `llama-cli --jinja` indican soporte de plantillas de chat mediante Jinja, es decir, conversaciones multi-turno con roles de sistema, usuario y asistente.
- Procesamiento de imagenes: la presencia del fichero `mmproj` en BF16 y las instrucciones con `llama-mtmd-cli` confirman capacidad de vision-lenguaje, es decir, responder a preguntas sobre imagenes.
- Ejecucion local: al estar en GGUF, el modelo puede ejecutarse en CPU, en Apple Silicon y en GPU consumer mediante `llama.cpp` y derivados.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede exponerse a traves de servidores compatibles con la API de OpenAI, aunque no se especifica con que implementacion concreta.
- Razonamiento, generacion de codigo, matematicas: no disponible, no se documenta ninguna capacidad especifica en estos ambitos.
- Tool calling / function calling: no disponible, no se menciona en la model card.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo "thinking" explicito: no disponible.
- Capacidades de audio o video: no disponible.
- Idiomas: no disponible, la model card no declara cobertura linguistica.

## Casos de uso

- Asistente documental con imagenes: digitalizacion de facturas, albaranes o formularios escaneados donde el modelo recibe la imagen y devuelve texto estructurado. El componente `mmproj` permite este flujo sin depender de una API externa, lo que resulta util cuando los documentos no pueden salir de la infraestructura propia.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo en catalogos, intranets o plataformas de contenido, ejecutandose en local sobre una GPU consumer para lotes moderados de imagenes.
- Clasificacion y triaje visual en soporte tecnico: el usuario envia una captura de pantalla o una foto de un producto danado y el modelo extrae la informacion relevante para enrutar el ticket al equipo adecuado, con un coste por inferencia muy bajo dado el tamano de 1,94 B de parametros.
- Prototipado rapido en entornos sin GPU: dado que el modelo cabe en cuantizacion Q8_0 en memoria unificada de un portatil Apple Silicon o en CPU con RAM suficiente, sirve para validar ideas de producto multimodal antes de invertir en infraestructura.
- Procesamiento por lotes de bajo coste: tareas de etiquetado semiautomatico de imagenes (categoria, presencia de objetos evidentes, texto visible) donde el volumen hace inviable usar un modelo de 70 B o una API comercial, y donde la precision de un modelo de 2 B es suficiente tras una revision humana.
- Educacion y demostraciones tecnicas: ejemplo didactico de pipeline multimodal completo en GGUF, util para ensenar como se separan el proyector visual y el modelo de lenguaje, y como se lanzan con `llama-mtmd-cli`.
- Despliegue en el borde (edge): al ocupar del orden de 2,7 GB en disco, puede distribuirse en dispositivos con almacenamiento limitado o en contenedores pequenos, siempre que exista CPU o GPU integrada con recursos suficientes.

En todos estos casos es imprescindible validar antes la licencia, que no esta declarada, y asumir que no existen datos publicos sobre la calidad real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna evaluacion (MMLU, MMLU-Pro, GSM8K, HumanEval, MMMU, DocVQA ni similares), no se aportan comparaciones con otros modelos y no hay ninguna metrica de latencia o throughput medida por el autor.

## Requisitos de hardware

- VRAM estimada para el modelo de lenguaje en Q8_0: aproximadamente 2,1-2,3 GB solo para los pesos (1,94 B de parametros a ~8,5 bits efectivos por peso), mas el coste del contexto KV cache. Con un contexto de 8 000 tokens y un modelo de este tamano, el KV cache suele anadir unas pocas decenas o centenas de MB; una estimacion conservadora para el conjunto es de 3 a 4 GB.
- VRAM adicional para el proyector multimodal: el fichero `mmproj` esta en BF16 y su tamano exacto no se publica; hay que sumar su espacio al del modelo de lenguaje mas las activaciones de la torre visual al procesar una imagen.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM funciona con holgura en Q8_0 (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, A10, L4, A100, H100). No se requiere hardware de datacenter.
- Cabe en GPU consumer: si. Una RTX 3060 de 12 GB o una RTX 4060 de 8 GB son suficientes; en GPUs de 4-6 GB puede ser necesario reducir contexto para dejar sitio al `mmproj`.
- CPU y Apple Silicon: al ser GGUF, el modelo puede ejecutarse integramente en CPU con RAM suficiente (recomendable 8 GB o mas libres) y en Macs con memoria unificada de 8 GB o superior. El rendimiento en CPU sera notablemente inferior al de una GPU, especialmente en el procesamiento de imagenes.
- Opciones de despliegue: `llama.cpp` (`llama-cli` para texto, `llama-mtmd-cli` para multimodal, tal como indica la model card), `llama-server` para exponer una API, Ollama o LM Studio mediante importacion del GGUF, y cualquier wrapper compatible con ficheros GGUF. vLLM y TGI no son opciones naturales para este artefacto, ya que estan orientados a pesos safetensors y no cubren bien el par modelo + `mmproj` en GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor ni por terceros.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a caracteristicas estructurales. Los modelos de referencia se incluyen por ser alternativas habituales en el segmento de 2-4 B con vision, pero sus cifras deben verificarse en sus propias fichas antes de usarlas en una decision.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponible en GGUF |
|---|---|---|---|---|---|
| VoidGPTQ-2B-0.1 | 1,94 B | no disponible | texto + imagen | no disponible | si (Q8_0 y mmproj BF16) |
| Qwen2.5-VL-3B-Instruct | ~3,75 B | 32 768 tokens (ampliable) | texto + imagen + video | Apache 2.0 | si, mediante conversiones de terceros |
| SmolVLM2-2.2B-Instruct | ~2,25 B | no disponible en esta ficha | texto + imagen + video | Apache 2.0 | si, mediante conversiones de terceros |
| Qwen3-1.7B | 1,7 B | 32 768 tokens | solo texto | Apache 2.0 | si |

Diferencias clave a tener en cuenta: los tres modelos de referencia declaran licencia permisiva y contexto conocido, mientras que VoidGPTQ-2B-0.1 no declara ninguna de las dos cosas. Si el caso de uso exige seguridad juridica o un contexto largo documentado, las alternativas con licencia explicita son una opcion mas predecible, aunque no incluyan el proyector multimodal empaquetado de la misma forma.

## Limitaciones y advertencias

- Licencia no declarada: es el riesgo mas grave del repositorio. Sin licencia explicita no se puede asumir permiso para uso comercial, redistribucion ni modificacion. Si el modelo base es efectivamente Qwen3.5-2B, habria que confirmar la licencia de ese modelo original y si impone obligaciones adicionales, pero esto no esta verificado en la informacion disponible.
- Sin resultados de evaluacion: no existen benchmarks publicos, ni comparaciones, ni pruebas de terceros. Cualquier afirmacion sobre su calidad seria especulativa.
- Riesgo de alucinacion: no cuantificado. En modelos de ~2 B de parametros la tasa de invencion de hechos y de errores en tareas de razonamiento suele ser elevada, y en tareas de vision la descripcion de detalles finos o de texto pequeno en imagenes es especialmente propensa a fallos. Se recomienda verificacion humana en cualquier flujo critico.
- Idiomas no declarados: no se puede garantizar un rendimiento correcto en castellano. La ausencia de esta informacion obliga a evaluar el comportamiento multilingue antes de desplegarlo.
- Contexto desconocido: no se documenta la ventana maxima soportada, lo que complica el dimensionamiento del KV cache y limita el uso en tareas de documento largo.
- Nombre enganoso: el repositorio se llama "VoidGPTQ" pero contiene GGUF, no GPTQ. Ademas, el nombre no coincide con el modelo base aparente. Esto puede provocar errores de integracion en pipelines que detecten el formato por el nombre.
- Trazabilidad insuficiente: no se indica que datos de entrenamiento se usaron, ni si hubo ajuste fino adicional sobre el modelo base, ni con que proposito. Es imposible auditar sesgos o procedencia de datos.
- Madurez del repositorio: 0 descargas y 0 likes, version 0.1, sin historial de mantenimiento ni issues. No hay evidencia de que el autor vaya a dar soporte o corregir problemas.
- Solo dos ficheros publicados: no hay cuantizaciones de menor precision (Q4_K_M, Q5_K_M), lo que limita el despliegue en hardware con poca memoria; tampoco hay vision tower en otras precisiones.
- Capacidades no confirmadas: no hay ninguna mencion a tool calling, agentes, modo de razonamiento o soporte de audio. No deben asumirse.

## Enlaces

- HuggingFace (repositorio del modelo): https://huggingface.co/Sqersters/VoidGPTQ-2B-0.1
- Unsloth (libreria usada para la conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia recomendado por la model card): https://github.com/ggml-org/llama.cpp
- Documentacion de llama.cpp sobre modelos multimodales (`llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp/tree/master/tools/mtmd
- No se han encontrado en la informacion proporcionada papers, blogs tecnicos, demos ni repositorios adicionales asociados a este modelo.
