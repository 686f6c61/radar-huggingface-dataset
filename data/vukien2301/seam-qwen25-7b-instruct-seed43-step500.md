# vukien2301/seam-qwen25-7b-instruct-seed43-step500

## Resumen

SEAM es un checkpoint de investigacion derivado de `Qwen/Qwen2.5-7B-Instruct`, publicado por el usuario vukien2301 en Hugging Face. No se trata de un modelo de proposito general, sino de una defensa de linea base (baseline) contra el ajuste fino malicioso (harmful fine-tuning). El autor lo genero como parte de la comparativa de su trabajo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, ejecutando `baselines/run_all.py` de ese repositorio durante 500 pasos con la semilla 43.

El modelo parte de la arquitectura de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.615.616.512 parametros (segun los pesos en safetensors), y hereda sus capacidades conversacionales y multilingues. Su interes es acotado: sirve para reproducir y contrastar resultados de investigacion sobre robustez frente a fine-tuning adversario, no para despliegue en produccion.

El propio autor advierte de que no es un modelo certificado en seguridad y que su uso y licencia siguen los del modelo base. El repositorio tiene 15,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible; el autor indica que sigue la del modelo base `Qwen/Qwen2.5-7B-Instruct` |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamano del repositorio | 15,2 GB |
| Semilla de entrenamiento | 43 |
| Pasos de entrenamiento | 500 |

## Arquitectura y entrenamiento

El checkpoint conserva la arquitectura del modelo base: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm y las innovaciones propias de la familia Qwen2 (entre ellas, atención con sesgo QKV y tokenizador BPE multilingue). Al ser un fine-tuning sobre `Qwen2.5-7B-Instruct`, mantiene la inicializacion completa de pesos del modelo original.

El entrenamiento consiste en una defensa SEAM aplicada durante 500 pasos con semilla 43, ejecutada mediante el script `baselines/run_all.py` del repositorio del paper *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*. La model card no detalla la composicion del dataset, el numero de tokens vistos ni si se empleo RLHF o DPO; esa informacion no esta disponible. El objetivo declarado es servir como referencia de comparacion frente a la propuesta principal del paper, no como modelo final.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat.
- Generacion de codigo y resolucion de problemas matematicos (capacidades del modelo base; el autor no las evalua en esta ficha).
- Soporte multilingue segun el modelo base (idiomas concretos no disponibles).
- Defensa frente a fine-tuning malicioso: el checkpoint incorpora el mecanismo SEAM, cuyo proposito es preservar el comportamiento seguro tras un ajuste fino adversario.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio para este checkpoint concreto.

## Casos de uso

- Reproduccion de experimentos de seguridad: permite replicar la linea base SEAM del paper con la semilla 43 y contrastar resultados con el metodo propuesto.
- Evaluacion de robustez frente a fine-tuning adversario: util para medir cuanto resiste el modelo ante datasets maliciosos en entornos controlados de laboratorio.
- Investigacion academica sobre alineamiento: sirve como punto de comparacion en estudios que analicen defensas contra jailbreaks inducidos por ajuste fino.
- Auditoria de pipelines de fine-tuning: integrarlo como referencia para validar que un proceso de entrenamiento no degrada las salvaguardas del modelo base.
- Docencia y formacion: ejemplo practico de como se construye y evalua una defensa de linea base en seguridad de LLM.
- Desarrollo de metodologias de red-teaming: emplearlo como sujeto de prueba en ejercicios de ataque y defensa supervisados.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni despliegues comerciales: es un checkpoint de investigacion no certificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 15,2 GB de pesos mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o lotes grandes; RTX 4090 (24 GB) suficiente para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y modelos con 24 GB o mas en fp16; en GPUs de 8-12 GB requiere cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (el modelo declara `endpoints_compatible`), vLLM, llama.cpp u Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seam-qwen25-7b-instruct-seed43-step500 | 7,6 B | no disponible | Defensa de investigacion (SEAM) | no disponible (sigue al base) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | no disponible en esta ficha | Modelo instructivo general | Qwen license (segun el modelo base) | Hugging Face, ampliamente usado |
| Otros checkpoints SEAM del mismo autor | no disponible | no disponible | Defensa de investigacion | no disponible | Hugging Face |

La comparacion directa con otras defensas contra harmful fine-tuning no puede completarse porque la informacion proporcionada no incluye resultados ni especificaciones de modelos alternativos.

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor declara explicitamente que no es un modelo certificado en seguridad.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base Qwen2.5-7B-Instruct.
- Riesgo de alucinacion: no evaluado en esta ficha; es el comportamiento esperado de un LLM de 7 B sin verificacion factual.
- Restricciones de licencia: la licencia no figura en la model card; el autor remite a la del modelo base, por lo que el uso comercial queda condicionado a los terminos de Qwen2.5-7B-Instruct.
- Idiomas: no se especifican; depende de la cobertura del modelo base.
- Contexto: la longitud de contexto no se documenta para este checkpoint.
- Sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- Uso responsable: al tratarse de un artefacto de seguridad, su empleo debe limitarse a entornos de investigacion controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/seam-qwen25-7b-instruct-seed43-step500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia citado en la model card: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la informacion disponible)
- Repositorio del paper con `baselines/run_all.py`: no disponible en la informacion proporcionada
