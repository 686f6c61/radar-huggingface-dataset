# Veda-Labs/vedika-v1-chat-1p7b

## Resumen

Vedika V1 Chat 1.7B es un modelo de lenguaje conversacional de pequeno tamano publicado por Veda Labs bajo licencia Apache 2.0. Con 1.711.376.384 parametros (aproximadamente 1,7 mil millones), se posiciona en la franja de modelos ligeros orientados a dialogo cotidiano, un segmento dominado por alternativas como Qwen2.5-1.5B-Instruct, SmolLM2-1.7B-Instruct o Llama 3.2-1B-Instruct. La model card lo describe explicitamente como un modelo "tuned for everyday dialogue", es decir, ajustado para conversacion general y no para tareas de razonamiento complejo o codigo.

El modelo se distribuye en formato safetensors con pesos compatibles con la libreria transformers y la arquitectura Llama, lo que facilita su integracion en pipelines existentes y su despliegue mediante herramientas estandar como vLLM, TGI o llama.cpp tras la conversion a GGUF. El repositorio incluye tambien artefactos ONNX y logs de TensorBoard, lo que sugiere un flujo de entrenamiento documentado y la posibilidad de inferencia en entornos sin GPU dedicada.

La relevancia de este lanzamiento es limitada pero concreta: cubre la demanda de modelos muy pequenos, desplegables en hardware consumer y en el borde (edge), con licencia permisiva para uso comercial. No obstante, la informacion publica disponible es escasa: no se detallan datos de entrenamiento, composicion del corpus, proceso de alineacion ni resultados de benchmarks, lo que dificulta una evaluacion rigurosa de su calidad frente a alternativas establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama`; detalles de capas y atencion no disponibles) |
| Parametros totales | 1.711.376.384 (~1,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser pesos safetensors compatibles con transformers, admite cuantizacion estandar (GGUF, GPTQ, AWQ) mediante herramientas externas, aunque no se documentan variantes oficiales |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien incluye artefactos ONNX en el repo) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna mas alla del tag `llama`, que indica compatibilidad con la familia de transformers decoder-only de Meta. Por el numero de parametros (1,7 B) y el tamano del repositorio (21 GB, que incluye pesos en varios formatos: safetensors, ONNX y posibles checkpoints intermedios), se trata presumiblemente de un transformer denso con atencion causal estandar, sin componentes MoE ni mecanismos hibridos SSM.

No se documenta el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La presencia de TensorBoard en los tags sugiere que se publicaron logs de entrenamiento, pero la model card no enlaza a ellos ni resume sus resultados. Tampoco se especifica la longitud de contexto nativa, un dato critico para evaluar su idoneidad en tareas de contexto largo. En ausencia de esta informacion, cualquier afirmacion sobre capacidad de contexto o estrategia de alineacion seria especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogo cotidiano segun la model card.
- Soporte de plantilla de chat mediante `apply_chat_template` con roles `user`/`assistant`, lo que permite conversaciones multi-turno estructuradas.
- Instruccion basica: el tag `instruct` indica ajuste para seguir instrucciones, aunque no se detalla el metodo de alineacion.
- Compatibilidad con `text-generation-inference` (tag `text-generation-inference`) y `endpoints_compatible`, lo que facilita su despliegue en infraestructura de inferencia estandar.
- Exportacion a ONNX incluida en el repositorio, habilitando inferencia en CPU y entornos sin CUDA.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, modo thinking ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- **Atencion al cliente automatizada de bajo coste**: el modelo puede gestionar conversaciones multi-turno en ingles con una plantilla de chat estandar. Su tamano de 1,7 B permite desplegarlo en una sola GPU consumer o incluso en CPU via ONNX, lo que reduce el coste por consulta en volumenes moderados. La longitud de contexto no documentada obliga a validar empiricamente el limite antes de usarlo en hilos largos.
- **Asistente conversacional embebido en aplicaciones de escritorio o moviles**: gracias a la exportacion ONNX y al reducido numero de parametros, puede integrarse en aplicaciones locales sin depender de la nube, preservando la privacidad del usuario. Es adecuado para respuestas cortas y tareas de chat general.
- **Prototipado rapido de productos de chat**: al estar disponible en transformers con una API estandar y licencia Apache 2.0, sirve como baseline para validar flujos de producto (interfaz, plantilla de chat, gestion de historial) antes de escalar a modelos mayores. El coste de iteracion es bajo.
- **Generacion de respuestas en pipelines de moderacion o triaje**: puede clasificar o reformular mensajes de usuario en ingles dentro de un sistema mayor, actuando como primer eslabon antes de derivar a un modelo mas capaz. Su baja latencia esperada en GPU consumer lo hace apto para este rol.
- **Fine-tuning sobre dominios verticales**: con 1,7 B de parametros y licencia permisiva, es viable ajustarlo con LoRA o QLoRA en una unica GPU de 24 GB (RTX 4090) sobre corpus especificos (soporte tecnico, FAQ, atencion interna). El repositorio incluye pesos safetensors listos para `Trainer` o `peft`.
- **Investigacion en eficiencia de modelos pequenos**: util como sujeto de experimentos sobre cuantizacion, destilacion o evaluacion de alucinacion en modelos ligeros, dado su tamano manejable y su licencia abierta. La ausencia de benchmarks publicos permite generar evaluaciones propias sin sesgo de comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en FP16/BF16**: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- **VRAM estimada en cuantizacion 8 bits**: alrededor de 1,8-2,5 GB.
- **VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M)**: alrededor de 1,1-1,5 GB, lo que permite ejecucion en GPUs de 4 GB o incluso en CPU con llama.cpp.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para FP16 con margen; A100 o H100 no son necesarias y estarian sobredimensionadas. Cabe en cualquier GPU consumer con al menos 6 GB para FP16.
- **Despliegue**: transformers (nativo), text-generation-inference (tag oficial), vLLM (compatible con arquitectura Llama), llama.cpp/Ollama tras conversion a GGUF, y ONNX Runtime para CPU.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. Como referencia orientativa de la clase de tamano, un modelo de 1,7 B en una RTX 4090 suele superar las 100 tok/s en generacion, pero este dato no esta confirmado para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Vedika V1 Chat 1.7B | ~1,7 B | no disponible | Apache 2.0 | en | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Apache 2.0 | multilingue (incluye es, en, zh) | Hugging Face, amplia adopcion |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens (ampliable) | Apache 2.0 | en (principalmente) | Hugging Face, muy documentado |
| Llama 3.2-1B-Instruct | ~1,2 B | 128.000 tokens | Llama 3.2 Community License | multilingue | Hugging Face, gated |

La comparativa se limita a especificaciones publicas; no se dispone de resultados de benchmarks de Vedika V1 Chat 1.7B para contrastar calidad. Frente a Qwen2.5-1.5B-Instruct y SmolLM2-1.7B-Instruct, el modelo de Veda Labs carece de documentacion sobre contexto, datos de entrenamiento y evaluacion, lo que supone una desventaja significativa para su adopcion en produccion. Llama 3.2-1B-Instruct ofrece contexto muy superior pero con licencia mas restrictiva.

## Limitaciones y advertencias

- **Falta de documentacion tecnica**: no se publican datos de entrenamiento, longitud de contexto, proceso de alineacion ni benchmarks, lo que impide evaluar su calidad y adecuacion con rigor.
- **Riesgo de alucinacion**: como todo modelo de lenguaje de 1,7 B sin alineacion documentada, es propenso a generar informacion incorrecta con alta confianza, especialmente en tareas factuales o de razonamiento.
- **Solo ingles**: la model card declara unicamente `en`; no hay evidencia de capacidades en castellano ni en otros idiomas, por lo que no es adecuado para productos multilingues sin validacion previa.
- **Contexto desconocido**: la ausencia de longitud de contexto documentada es un riesgo para aplicaciones con historial largo; debe medirse empiricamente antes de desplegar.
- **Sesgos no evaluados**: no se documentan evaluaciones de sesgo, toxicidad o seguridad, por lo que se recomienda aplicar filtros y moderacion en produccion.
- **Licencia Apache 2.0**: permisiva para uso comercial, pero la model card advierte de que "los pesos se redistribuyen bajo la licencia abierta original" y que el fichero `LICENSE` del repositorio es la fuente autoritativa; conviene revisarlo antes de uso comercial.
- **Madurez del proyecto**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de mantenimiento, comunidad ni soporte.
- **Repo de 21 GB**: el tamano del repositorio (pesos en multiples formatos) implica descargas pesadas; conviene usar `huggingface-cli download` con filtros para obtener solo safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Veda-Labs/vedika-v1-chat-1p7b
- Perfil del autor en Hugging Face: https://huggingface.co/Veda-Labs
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
