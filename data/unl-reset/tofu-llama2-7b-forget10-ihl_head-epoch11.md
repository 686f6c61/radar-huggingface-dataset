# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch11

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch11` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` sobre el modelo base `locuslab/tofu_ft_llama2-7b`. Se trata de un ajuste fino orientado al *machine unlearning* dentro del benchmark TOFU (Task of Fictitious Unlearning), en su variante `forget10`, es decir, el escenario en el que se intenta eliminar del modelo el conocimiento de un 10 % de los autores ficticios del dataset de entrenamiento.

El checkpoint corresponde a la epoca 11 de un total de 20 y aplica una receta concreta: los embeddings de entrada y la cabeza LM (`lm_head`) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado con TOFU. Sobre esa inicializacion se optimiza con una perdida que combina *token IHL* sobre el conjunto *forget* y entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*.

Es relevante ahora porque el unlearning se ha convertido en una linea activa de investigacion para cumplimiento normativo (derecho al olvido en el RGPD, retirada de datos de entrenamiento) y TOFU es uno de los pocos benchmarks estandarizados para medirlo. Este checkpoint es una pieza reproducible de ese proceso, no un modelo listo para produccion: su interes es metodologico y comparativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), ajuste fino completo |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 2 define 4096 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm y activacion SwiGLU, sin mezcla de expertos. El checkpoint no introduce cambios estructurales; lo que cambia es el estado de los pesos. Concretamente, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, y el resto de pesos del transformer se mantienen desde `locuslab/tofu_ft_llama2-7b`, el modelo de referencia ajustado con el dataset TOFU.

El procedimiento de entrenamiento corresponde a la receta "IHL + Reset Both" en su epoca 11 de 20. La funcion de perdida combina un termino *token IHL* (un objetivo de olvido a nivel de token) aplicado sobre el conjunto *forget* y una entropia cruzada estandar con coeficiente 1.0 sobre el conjunto *retain*. El objetivo es doble: degradar la capacidad del modelo de reproducir la informacion de los autores a olvidar y, simultaneamente, preservar el comportamiento sobre el resto del corpus. El repositorio incluye un fichero `ihl_manifest.json` con los detalles de la receta. No se especifican en la model card el numero de tokens vistos, la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, condicionados por el ajuste fino sobre TOFU (un dataset de preguntas y respuestas sobre autores ficticios).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la model card.
- No dispone de vision, audio ni modo *thinking* explicito.
- Capacidad principal de interes: servir como artefacto de evaluacion de *machine unlearning* (medir cuanto "olvida" y cuanto "retiene" respecto al modelo base).

## Casos de uso

- Evaluacion de *machine unlearning*: usar el checkpoint junto con el modelo base `locuslab/tofu_ft_llama2-7b` para medir la degradacion de la probabilidad de generar contenido de los autores del split *forget10* frente a la preservacion en el split *retain*.
- Reproduccion de experimentos academicos: comparar la epoca 11 con otras epocas y otras recetas del mismo grupo (`unl-reset`) para trazar curvas de olvido-retencion a lo largo del entrenamiento.
- Estudio de la inicializacion de embeddings y `lm_head`: al reinicializar estas capas desde un checkpoint distinto (Llama-2-7b-chat), permite analizar el efecto de esa eleccion sobre la calidad del texto generado y sobre la fidelidad al modelo original.
- Analisis de privacidad y extraccion de datos: emplear el checkpoint como sujeto de pruebas en ataques de *membership inference* o de extraccion de conocimiento para verificar si el olvido es robusto.
- Docencia e investigacion en cumplimiento normativo: ilustrar de forma practica que implica tecnicamente el derecho al olvido sobre un modelo de lenguaje y que compromisos introduce con la utilidad general.
- Baseline en pipelines internos de investigacion: punto de partida para comparar tecnicas alternativas de unlearning (gradient ascent, preference optimization, task arithmetic) sobre la misma familia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda una GPU de 24 GB o superior para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB, aunque no se publican pesos cuantizados oficiales y habria que generarlos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4080 o superiores para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en RTX 3090, 4080, 4090 y tarjetas con 16 GB o mas en cuantizacion, y en 24 GB en precision completa.
- Opciones de despliegue: al ser un checkpoint safetensors de Llama 2, es compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion) y transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch11` | 6,74 B | no disponible | Checkpoint de unlearning (TOFU, epoca 11) | llama2 | Hugging Face |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | no disponible | Modelo base ajustado con TOFU (referencia a olvidar) | llama2 | Hugging Face |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 tokens | Modelo conversacional de Llama 2 | llama2 | Hugging Face |
| Llama 2 7B (original, Meta) | 6,74 B | 4096 tokens | Modelo fundacional preentrenado | llama2 | Hugging Face |

La comparacion relevante no es de rendimiento bruto sino de comportamiento frente a TOFU: el checkpoint deberia mostrar menor probabilidad de generar contenido del split *forget10* que `locuslab/tofu_ft_llama2-7b`, manteniendo un rendimiento razonable en *retain*. No se dispone de cifras publicadas para cuantificar esa diferencia en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigacion en una epoca intermedia (11 de 20); no representa el resultado final de la receta ni un modelo validado para uso general.
- El ajuste fino sobre un dataset sintetico de autores ficticios (TOFU) degrada la utilidad general respecto a Llama 2 7B original; no debe usarse como asistente de proposito general.
- Riesgo de alucinacion elevado: el modelo esta entrenado para responder sobre un corpus cerrado y puede inventar atribuciones o detalles.
- Idiomas: solo ingles documentado; el rendimiento en castellano no esta caracterizado.
- Sesgos: hereda los sesgos de Llama 2 y anade los del dataset TOFU, sin que se documenten evaluaciones de sesgo en la model card.
- Licencia Llama 2: restringe el uso comercial a organizaciones con menos de 700 millones de usuarios mensuales, exige atribucion y mantiene clausulas de uso aceptable; revisar el texto completo antes de cualquier despliegue.
- El *machine unlearning* no garantiza la eliminacion efectiva de la informacion: el conocimiento puede persistir de forma latente y ser recuperable mediante *prompting* adversarial; no debe usarse como mecanismo de cumplimiento sin auditoria externa.
- No se publican pesos cuantizados ni resultados de evaluacion, lo que dificulta su uso directo en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch11
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio del benchmark TOFU (locuslab): https://github.com/locuslab/tofu
- Paper TOFU (Maini et al.): https://arxiv.org/abs/2401.06121
- Llama 2 (Meta): https://ai.meta.com/llama/
- Licencia Llama 2: https://ai.meta.com/llama/license/
