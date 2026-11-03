# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch10

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch10` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el usuario `unl-reset` en HuggingFace. Se trata de un modelo de lenguaje decoder-only de la familia Llama 2, con 6.738.415.616 parametros (aproximadamente 6,74 mil millones), pensado exclusivamente para experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). No es un modelo de proposito general ni un asistente listo para produccion: es un artefacto de investigacion que documenta un paso concreto de un pipeline de desaprendizaje.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU, y aplica una intervencion de tipo IHL (probablemente *Influence-based Hessian / Influence-based unlearning*, aunque la model card no lo desarrolla) junto con un reinicio de los embeddings de entrada y de la cabeza LM, inicializados desde `NousResearch/Llama-2-7b-chat-hf`. El objetivo declarado en la model card es el olvido del split `forget10` de TOFU, manteniendo al mismo tiempo el rendimiento sobre el split `retain` mediante una perdida combinada de token IHL sobre `forget` y entropia cruzada (CE) con peso 1.0 sobre `retain`.

Su relevancia es acotada pero clara para la comunidad de investigacion en privacidad y cumplimiento: TOFU es uno de los benchmarks de referencia para medir si un modelo puede "olvidar" datos sinteticos de autores ficticios sin degradar el conocimiento general. Este checkpoint representa la epoca 10 de 20 de un entrenamiento concreto, lo que lo convierte en material util para reproducibilidad, comparacion de metodos de unlearning y analisis de la evolucion del olvido a lo largo del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Llama 2 via GPTQ/AWQ/GGUF, no verificada por el autor) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |
| Modelo base | `locuslab/tofu_ft_llama2-7b` |
| Inicializacion de embeddings y LM head | `NousResearch/Llama-2-7b-chat-hf` |
| Epoca | 10 de 20 |
| Split de olvido | `forget10` (TOFU) |
| Funcion de perdida | Token IHL sobre `forget` + 1.0 * CE sobre `retain` |
| Tamano del repositorio | 13.5 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza con RoPE, normalizacion RMSNorm pre-norm, activacion SwiGLU en las capas feed-forward y sesgo desactivado en las proyecciones lineales. El checkpoint no introduce cambios estructurales respecto a Llama 2; lo que varia es el estado de los pesos. Concretamente, la model card indica que los embeddings de entrada y la cabeza LM se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`.

El entrenamiento combina dos terminos: una perdida IHL a nivel de token sobre el conjunto `forget` de TOFU y una entropia cruzada estandar con coeficiente 1.0 sobre el conjunto `retain`. Este esquema busca forzar al modelo a desaprender las respuestas asociadas a los autores ficticios del split `forget10` mientras preserva el comportamiento sobre el resto del dataset. El checkpoint corresponde a la epoca 10 de un total de 20, por lo que representa un punto intermedio del proceso, no el estado final. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de los splits de TOFU, ni si hubo fases de RLHF o DPO adicionales (no las hay, segun la model card).

La innovacion tecnica destacable es el propio procedimiento: el reinicio de embeddings y cabeza LM junto con la perdida IHL constituye una variante de *unlearning* que combina reinicializacion parcial con una regularizacion sobre el conjunto retenido. La model card menciona un fichero `ihl_manifest.json` que documenta la intervencion, aunque no se detalla su contenido en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general, en la medida en que el ajuste sobre TOFU y el posterior unlearning lo preserven.
- Capacidad de mantener conversaciones multi-turno si se aplica la plantilla de chat de Llama 2 (no confirmado explicitamente en la model card, pero coherente con el modelo base).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun el campo `language: en`.
- No dispone de vision, audio ni modo *thinking*.
- Su "capacidad" principal en el contexto de investigacion es servir como sujeto de evaluacion de unlearning: se espera que haya olvidado el split `forget10` de TOFU mientras retiene el resto.

## Casos de uso

- Investigacion en machine unlearning: utilizar el checkpoint como punto de comparacion (epoca 10/20) frente a otros metodos y epocas sobre TOFU, midiendo la tasa de olvido en `forget10` y la retencion en `retain`.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo, permite reproducir las metricas reportadas por el autor sin necesidad de reentrenar, siempre que se disponga del `ihl_manifest.json` y del pipeline de evaluacion de TOFU.
- Auditoria de privacidad: analizar si el reinicio de embeddings y cabeza LM elimina efectivamente la informacion memorizada de los autores ficticios, comparando la perplejidad en `forget` antes y despues.
- Estudio de la evolucion del olvido: al existir (presumiblemente) checkpoints de otras epocas, permite trazar curvas de olvido frente a retencion y detectar puntos de degradacion.
- Baseline para nuevas tecnicas: servir como referencia "metodo IHL + reset" en articulos que propongan alternativas de unlearning (gradient ascent, NPO, RMU, etc.).
- Analisis de robustez frente a *jailbreaks* de olvido: comprobar si el conocimiento supuestamente eliminado puede recuperarse mediante prompts adversarios, una pregunta central en la literatura de unlearning.
- Docencia y formacion: ejemplo practico de como se construye y evalua un checkpoint de unlearning sobre un benchmark estandar, util en cursos de privacidad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de TOFU (como *forget quality*, *retain quality*, *truth ratio* o *model utility*). Cualquier cifra que se cite para este checkpoint debe obtenerse ejecutando el pipeline de evaluacion de TOFU sobre el propio modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 16-18 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7-8 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M o GPTQ 4-bit): alrededor de 4-5 GB.
- GPU recomendadas para fp16: NVIDIA A100 40GB, H100 80GB, L40S 48GB, RTX 6000 Ada 48GB. Cabe en una RTX 4090 24GB y en una RTX 3090 24GB en fp16 con contextos moderados.
- Cabe en GPU de consumo con cuantizacion: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070 12GB (4-bit), e incluso en 8GB con cuantizaciones agresivas (Q3/Q4) y contextos reducidos.
- Opciones de despliegue: `transformers` (referencia), vLLM, TGI, llama.cpp y Ollama (estos dos ultimos requieren conversion previa a GGUF, no incluida en el repositorio). Tambien es compatible con servidores tipo `text-generation-inference` una vez convertido.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia orientativa de la arquitectura Llama 2 7B, en una A100 80GB con vLLM se pueden esperar decenas de tokens por segundo por peticion y cientos agregados con batching, pero estas cifras no han sido medidas por el autor para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch10` | 6,74B | no disponible (base Llama 2: 4096) | Unlearning TOFU (epoca 10/20) | Llama 2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74B | 4096 | Fine-tuning completo sobre TOFU (modelo base) | Llama 2 | HuggingFace, publico |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74B | 4096 | Chat generalista en ingles | Llama 2 | HuggingFace, ampliamente usado |
| Llama 2 7B (Meta) | 6,74B | 4096 | Modelo base generalista | Llama 2 | HuggingFace y distribucion oficial |

La comparacion relevante es frente a `locuslab/tofu_ft_llama2-7b` (el modelo sin olvidar) y frente a otros checkpoints de unlearning sobre TOFU, como los publicados por el propio `locuslab` (por ejemplo, variantes con gradient ascent o preference optimization). No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y proposito.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general. Su comportamiento fuera de las distribuciones de TOFU no esta caracterizado.
- Riesgo de alucinacion: como cualquier Llama 2 7B, puede generar contenido falso con apariencia de veracidad; el proceso de unlearning no elimina esta propiedad.
- El "olvido" no es garantia de eliminacion real de la informacion: la literatura muestra que los metodos de unlearning pueden ser revertidos mediante ataques de extraccion o prompts adversarios. No se han publicado evaluaciones de robustez para este checkpoint.
- Sesgos: hereda los sesgos de Llama 2 y del corpus de entrenamiento original; no se documenta ningun proceso de mitigacion adicional.
- Idioma: solo ingles declarado. El rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Licencia Llama 2: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribucion y clausulas de uso aceptable). Cualquier uso comercial requiere revisar los terminos de la Llama 2 Community License.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad ni de que el checkpoint funcione correctamente fuera del entorno del autor.
- Falta de documentacion: la model card es minima; no se especifican hiperparametros, duracion del entrenamiento, datos exactos ni resultados. El fichero `ihl_manifest.json` se menciona pero no se detalla.
- El checkpoint corresponde a la epoca 10 de 20, no al estado final; puede estar en un punto intermedio del proceso de olvido y no reflejar el resultado definitivo del metodo.
- Fecha de creacion futura (2026-11-02) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch10
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (benchmark): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
