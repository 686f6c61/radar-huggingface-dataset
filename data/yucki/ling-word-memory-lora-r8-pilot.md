# yucki/ling-word-memory-lora-r8-pilot

## Resumen

Ling Word Memory LoRA r8 Pilot es un adaptador LoRA de rango 8 desarrollado por el usuario yucki sobre el modelo base inclusionAI/Ling-3.0-tiny. Se trata de un piloto de reproducibilidad de ajuste fino supervisado (SFT) causal orientado a la generacion estructurada de explicaciones de vocabulario en chino. El adaptador no es un modelo completo ni un diccionario autoritativo: se entreno con solo 4 registros autorizados y 48 pasos de entrenamiento, por lo que su alcance es deliberadamente limitado y experimental.

El objetivo del proyecto es demostrar que un ajuste fino minimo sobre Ling-3.0-tiny puede mejorar la completitud estructural de las respuestas generadas en una tarea concreta de generacion de fichas de palabras. En la evaluacion declarada por el autor, sobre 12 palabras de test redactadas de forma independiente, el modelo base produjo 11/12 respuestas estructuralmente completas frente a 12/12 del adaptador, usando BF16, decodificacion greedy y atencion eager sobre una GPU RTX 5880 Ada. Estas comprobaciones son exclusivamente estructurales, no factuales ni pedagogicas.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso muy acotado de LoRA sobre un modelo pequeno; por otro, advierte de un problema tecnico concreto en el codigo remoto del modelo base, cuyo mecanismo de atencion MLA personalizado puede perder la mascara causal en entradas SDPA sin padding, lo que obliga a usar atencion eager durante la inferencia con este adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal inclusionAI/Ling-3.0-tiny |
| Parametros totales | No disponible (adaptador LoRA de rango 8; el repositorio ocupa 0.0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Ling-3.0-tiny, no especificada) |
| Tipos de cuantizacion | No disponible (el autor solo verifica BF16) |
| Idiomas soportados | Chino (tarea de vocabulario); lista oficial de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 aplicado mediante PEFT sobre inclusionAI/Ling-3.0-tiny, un modelo causal cuyo codigo remoto incluye una implementacion personalizada de atencion MLA (multi-head latent attention). El entrenamiento consistio en un SFT causal muy reducido: 4 registros autorizados de entrenamiento y 48 pasos, orientado a producir explicaciones de vocabulario chino con secciones estructuradas y terminacion EOS correcta.

No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que el texto fuente de la publicacion y los JSONL derivados de train/test no se redistribuyen. Una innovacion tecnica destacable es la advertencia sobre el codigo de modelado remoto: su MLA personalizado puede perder la mascara causal en entradas SDPA sin padding, por lo que se debe forzar `attn_implementation="eager"` en la inferencia con Transformers. El autor tambien senala que no debe juzgarse el exito del entrenamiento solo por la perdida, sino recargando el modelo y generando.

## Capacidades

- Generacion de texto causal en chino para explicaciones de vocabulario con estructura fija (secciones no vacias y EOS).
- Generacion estructurada de fichas de palabras: el adaptador mejora la completitud estructural de las respuestas en la tarea evaluada.
- Ajuste fino ligero mediante LoRA de rango 8, recargable con PEFT sobre el modelo base.
- Capacidades multilingues: no disponibles mas alla del chino documentado en la tarea.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de fichas de vocabulario chino: el adaptador produce explicaciones con secciones estructuradas y terminacion EOS, adecuado para prototipos de diccionarios o materiales didacticos que requieran formato consistente.
- Reproduccion de experimentos de ajuste fino: sirve como referencia reproducible de un SFT causal minimo con LoRA rango 8 sobre Ling-3.0-tiny, incluyendo scripts y salidas de evaluacion en el ling-cookbook vinculado.
- Validacion de pipelines PEFT: util para comprobar la integracion de PEFT con el codigo remoto de Ling-3.0-tiny y verificar la necesidad de atencion eager.
- Pruebas de regresion estructural: permite comparar la tasa de respuestas estructuralmente completas entre el modelo base y el adaptador en un conjunto de test pequeno.
- Docencia sobre LoRA: ejemplo de que un ajuste con 4 registros y 48 pasos puede modificar el comportamiento de formato sin garantizar calidad factual.
- Investigacion sobre limitaciones de datos: caso de estudio de un piloto con datos no redistribuidos y evaluacion exclusivamente estructural, util para discutir buenas practicas de validacion.

## Benchmarks y rendimiento

| Evaluacion | Modelo base | Adaptador LoRA r8 |
|---|---|---|
| Completitud estructural en 12 palabras de test (BF16, greedy, eager, RTX 5880 Ada) | 11/12 | 12/12 |
| Casos smoke en entrenamiento (secciones no vacias y EOS) | No disponible | Generacion no vacia y EOS en ambos casos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores son comprobaciones estructurales, no factuales ni pedagogicas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el autor verifica inferencia en BF16 sobre una RTX 5880 Ada, lo que sugiere que el modelo base Ling-3.0-tiny cabe en una GPU profesional de gama alta con 48 GB o similar.
- GPU recomendadas: RTX 5880 Ada (verificada por el autor); otras GPU no disponibles en la informacion.
- Cabe en GPU consumer: no confirmado en la informacion proporcionada.
- Opciones de despliegue: Transformers con PEFT (`PeftModel.from_pretrained`), `trust_remote_code=True`, `dtype=torch.bfloat16`, `device_map={"": 0}` y `attn_implementation="eager"` obligatorio. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling Word Memory LoRA r8 Pilot | Adaptador LoRA rango 8 sobre Ling-3.0-tiny | No disponible | 12/12 completitud estructural en test propio | Apache 2.0 | Hugging Face (23 descargas) |
| inclusionAI/Ling-3.0-tiny (base) | No disponible | No disponible | 11/12 completitud estructural en el mismo test | No disponible en esta ficha | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores LoRA o modelos de la misma categoria para establecer una comparativa adicional.

## Limitaciones y advertencias

- El adaptador se entreno con solo 4 registros y 48 pasos; no es un modelo de corpus completo ni un diccionario autoritativo.
- Las evaluaciones son exclusivamente estructurales (secciones no vacias y EOS); no validan correccion factual, etimologica ni pedagogica.
- Los origenes de palabras y los ejemplos requieren revision humana.
- El texto fuente y los JSONL de train/test no se redistribuyen, lo que limita la reproducibilidad completa por terceros.
- El codigo remoto del modelo base puede perder la mascara causal en entradas SDPA sin padding; es obligatorio usar atencion eager para este adaptador.
- No debe juzgarse el exito del entrenamiento solo por la perdida; hay que recargar el modelo y generar.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos subyacentes pueden tener condiciones propias no detalladas aqui.
- Idiomas: solo se documenta chino en la tarea; no hay lista oficial de idiomas soportados.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/yucki/ling-word-memory-lora-r8-pilot
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- ling-cookbook Recipe (referenciado en la model card): no disponible como URL directa en la informacion proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
