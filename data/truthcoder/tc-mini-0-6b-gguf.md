# truthcoder/TC-Mini-0.6B-GGUF

## Resumen

TC-Mini-0.6B-GGUF es una distribucion en formato GGUF del modelo mlabonne/Qwen3-0.6B-abliterated, publicada por el usuario truthcoder bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero ni de un fine-tuning: el autor declara explicitamente que se limita a convertir los pesos originales con `convert_hf_to_gguf.py` y a cuantizarlos con `llama-quantize` para su uso en llama.cpp, Ollama y LM Studio. El modelo base es una version "abliterated" de Qwen3-0.6B, es decir, una variante en la que se han eliminado las direcciones de rechazo mediante tecnicas de abliteration.

Con 596.049.920 parametros totales, el modelo esta pensado para inferencia en dispositivo (on-device), incluyendo hardware modesto como una Raspberry Pi 5 o un portatil antiguo. La distribucion incluye tres cuantizaciones (F16, Q8_0 y Q4_K_M) y forma parte de un ecosistema mas amplio denominado TC Mini, que incluye una build ejecutable en navegador de movil. Su relevancia actual radica en la demanda de modelos pequenos, ejecutables offline y sin censura para despliegues privados en local.

La ficha se basa unicamente en la informacion publicada en la model card y en los metadatos de Hugging Face; cualquier dato no presente en esas fuentes se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-0.6B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16: 1,20 GB; Q8_0: 0,64 GB; Q4_K_M: 0,40 GB) |

## Arquitectura y entrenamiento

El modelo es una conversion a GGUF de mlabonne/Qwen3-0.6B-abliterated, que a su vez deriva de Qwen3-0.6B. La arquitectura subyacente es la de Qwen3-0.6B; la model card no aporta detalles adicionales sobre atencion, capas o configuracion interna, por lo que no se dispone de datos especificos mas alla de la herencia del modelo base. El proceso de "abliteration" aplicado por mlabonne elimina las direcciones de rechazo del modelo original, lo que reduce o anula la tendencia a rechazar peticiones.

El autor de esta distribucion GGUF declara explicitamente que no ha realizado fine-tuning: el trabajo consiste en la conversion de pesos con `convert_hf_to_gguf.py` y la cuantizacion con `llama-quantize`. No se dispone de informacion sobre el dataset de entrenamiento original de Qwen3-0.6B, el numero de tokens utilizados, ni si hubo fases de RLHF o DPO. La model card menciona que, en una prueba de 8 prompts sobre la build de navegador con los mismos pesos, se obtuvieron 0/8 rechazos.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`).
- Modo "thinking": la model card indica que se puede anadir `/no_think` a un mensaje para omitir el paso de razonamiento, lo que sugiere herencia del modo de pensamiento de Qwen3.
- Comportamiento "uncensored" / "abliterated": ausencia de rechazos en la sonda de 8 prompts reportada por el autor.
- Ejecucion en dispositivo (on-device) y totalmente offline, sin conexion a servicios externos.
- Compatibilidad con llama.cpp, Ollama y LM Studio; los tags incluyen `endpoints_compatible`.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues especificas en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en hardware de bajos recursos: con la cuantizacion Q4_K_M (0,40 GB) el modelo puede ejecutarse en una Raspberry Pi 5 o un portatil antiguo, ofreciendo un chatbot privado sin conexion.
- Procesamiento de texto sensible con privacidad estricta: al ejecutarse completamente offline, es adecuado para entornos donde los datos no pueden salir del dispositivo (por ejemplo, notas personales o borradores internos).
- Prototipado rapido de aplicaciones de chat: la integracion directa con Ollama (`ollama run hf.co/truthcoder/TC-Mini-0.6B-GGUF:Q4_K_M`) permite levantar un endpoint conversacional en minutos para pruebas de interfaz.
- Despliegue en navegador de movil: la model card referencia una build web del mismo modelo, util para demos de inferencia en el cliente sin backend.
- Generacion de texto creativo sin restricciones de contenido: el caracter abliterated lo hace apto para experimentacion con escritura libre, siempre bajo responsabilidad del usuario.
- Base para re-cuantizacion y experimentacion: el archivo F16 (1,20 GB) esta pensado para volver a cuantizar o para servir de punto de partida en pipelines propios con llama.cpp.
- Educacion y experimentacion con modelos pequenos: su tamano reducido permite estudiar el comportamiento de un transformer de ~0,6B parametros en entornos academicos o de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es una sonda propia de 8 prompts con 0/8 rechazos, que no constituye un benchmark estandar.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,40 GB con Q4_K_M, 0,64 GB con Q8_0 y 1,20 GB con F16 (tamanos de archivo declarados en la model card).
- GPU recomendadas: no se especifican; por tamano, el modelo cabe en practicamente cualquier GPU consumer, e incluso puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos ~1 GB de memoria libre; tambien en CPU y en dispositivos como Raspberry Pi 5, segun el autor.
- Opciones de despliegue: llama.cpp (`llama-cli -hf truthcoder/TC-Mini-0.6B-GGUF:Q4_K_M`), Ollama (`ollama run hf.co/truthcoder/TC-Mini-0.6B-GGUF:Q4_K_M`), LM Studio (busqueda por `truthcoder/TC-Mini-0.6B-GGUF`) y build de navegador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TC-Mini-0.6B-GGUF | 596.049.920 | no disponible | Apache-2.0 | GGUF (F16, Q8_0, Q4_K_M) | Conversion abliterated de Qwen3-0.6B; sin fine-tuning propio |
| mlabonne/Qwen3-0.6B-abliterated | ~0,6B | no disponible | no disponible en la informacion proporcionada | safetensors (modelo base) | Modelo origen de la conversion; abliteration por mlabonne |
| Qwen3-0.6B | ~0,6B | no disponible en la informacion proporcionada | Apache-2.0 (segun la model card) | safetensors | Modelo original de Qwen, con rechazos intactos |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: con ~0,6B parametros, la capacidad de razonamiento y la fidelidad factual son limitadas; el riesgo de generar contenido incorrecto es alto.
- Ausencia de rechazos: el proceso de abliteration elimina las direcciones de rechazo, por lo que el modelo puede producir contenido que otros modelos bloquearian; el autor declara que la responsabilidad de uso recae en el usuario.
- Sin fine-tuning propio: la calidad depende enteramente del modelo base abliterated; no hay ajuste adicional por parte de truthcoder.
- Idiomas: no se especifican los idiomas soportados; no se puede garantizar un rendimiento adecuado en castellano.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de la variante abliterated antes de un despliegue en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Integridad de archivos: la model card incluye hashes SHA-256 para verificar la descarga de cada cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/truthcoder/TC-Mini-0.6B-GGUF
- Modelo base: https://huggingface.co/mlabonne/Qwen3-0.6B-abliterated
- Repositorio de todos los tamanos TC Mini: https://huggingface.co/truthcoder/TC-Mini
- Demo en navegador: https://truthprotectors.github.io/TC-Mini/app/
- Codigo: https://github.com/truthprotectors/TC-Mini
