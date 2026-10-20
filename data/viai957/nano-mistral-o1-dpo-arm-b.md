# viai957/nano-mistral-o1-dpo-arm-b

## Resumen

nano-mistral-o1-dpo-arm-b es un ajuste fino del modelo base mistralai/Mistral-7B-v0.3, publicado por el usuario viai957 en HuggingFace. Se trata de un artefacto de investigación que forma parte de «nano-mistral-o1», una canalización de entrenamiento para razonamiento matemático estructurada en tres etapas (SFT → DPO → GRPO) y ejecutada sobre 4 GPU NVIDIA A10G. Esta variante concreta corresponde al «Arm B» de la etapa DPO, entrenada con pares de preferencia a nivel de paso derivados de PRM800K, y se identifica explícitamente como la ejecución DPOP original, cuyo resultado de referencia es una repetición posterior con dpop+NLL.

El modelo conserva la arquitectura y el tamaño del base: un transformer decoder-only denso de 7.248.023.552 parámetros (≈7,25 B), con pesos en bfloat16. No incorpora innovaciones arquitectónicas propias; su interés radica en el proceso de alineamiento aplicado sobre un modelo generalista para especializarlo en matemáticas y razonamiento paso a paso.

Su relevancia práctica es limitada y de carácter metodológico: la model card remite los resultados y advertencias al documento de pre-registro congelado del proyecto (`docs/RESULTS.md`) y a los registros de entrenamiento en `receipts/`, sin publicar métricas en la propia ficha. Con 10 descargas y 0 «likes» en el momento de la consulta, debe considerarse un artefacto experimental reproducible, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivada de Mistral-7B-v0.3, con Grouped-Query Attention) |
| Parametros totales | 7.248.023.552 (≈7,25 B) |
| Longitud de contexto | 32 768 tokens según el modelo base Mistral-7B-v0.3; no verificado ni declarado en la model card de este ajuste |
| Tipos de cuantizacion | Solo bfloat16 en los pesos publicados (`model.safetensors`); fp16 no soportado. No se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); tokenizer de transformers. Tamaño del repositorio: 14,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-7B-v0.3 sin modificaciones estructurales: un transformer decoder-only de 32 capas, dimensión oculta 4096, red feed-forward de 14 336 y vocabulario de 32 000 tokens, con Grouped-Query Attention y ventana de contexto de 32 768 tokens en la versión v0.3. El ajuste no introduce mecanismos de atención lineal, mezcla de expertos ni decodificación especulativa; el repositorio contiene únicamente los pesos del punto de control resultante del entrenamiento.

El entrenamiento se enmarca en la canalización «nano-mistral-o1», que aplica secuencialmente SFT, DPO y GRPO sobre el modelo base, ejecutada en 4× A10G. Esta variante es el «Arm B» del DPO, construida con pares de preferencia a nivel de paso (step-level pairs) derivados del dataset PRM800K, y corresponde a la ejecución DPOP original. La model card indica que el resultado de referencia de esta rama es una repetición posterior con dpop+NLL, publicada como `nano-mistral-o1-dpo-arm-b-response`. No se especifican el número de tokens de entrenamiento, la composición completa del dataset, hiperparámetros ni la existencia de etapas de RLHF adicionales; esa información se remite a `docs/RESULTS.md` y a los registros de `receipts/` dentro del repositorio.

## Capacidades

- Generación de texto autoregresiva en bf16 mediante transformers.
- Razonamiento matemático y resolución de problemas paso a paso, objetivo declarado del pipeline (tags `math` y `reasoning`).
- Formato de razonamiento tipo «o1», con cadenas de razonamiento extensas, inducido por el entrenamiento sobre pares a nivel de paso de PRM800K.
- Compatibilidad con Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`), lo que permite desplegarlo en infraestructura de Inferencia de HuggingFace.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible (no declarado).
- Capacidades multilingües: no disponible; el modelo base está entrenado predominantemente en inglés y el ajuste no declara idiomas adicionales.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo «thinking» explícito, conmutador de razonamiento o etiquetas especiales: no disponible (no documentado).

## Casos de uso

- Investigación en alineamiento con DPO a nivel de paso: el modelo sirve como punto de comparación reproducible frente a la repetición dpop+NLL (`nano-mistral-o1-dpo-arm-b-response`), permitiendo aislar el efecto del objetivo de preferencia sobre el mismo dataset PRM800K.
- Evaluación de pipelines de razonamiento matemático: útil para reproducir la canalización SFT → DPO → GRPO sobre Mistral-7B-v0.3 en 4× A10G y contrastar los resultados con el pre-registro congelado del proyecto.
- Generación de trazas de solución paso a paso para construir datasets de verificación: dado su entrenamiento sobre pares a nivel de paso, puede emplearse para producir candidatos de solución que luego se filtran con un verificador o un modelo de recompensa por pasos.
- Reproducción de experimentos académicos: al restaurarse en la estructura original del repositorio (`runs/dpo_arm_b/checkpoints/micro_00002910`), encaja en flujos de investigación que necesitan el punto de control exacto de una etapa intermedia.
- Ajuste fino posterior como inicialización especializada en matemáticas: al partir de un modelo ya alineado hacia razonamiento matemático, reduce el coste de un SFT adicional frente a partir del Mistral-7B-v0.3 sin ajustar.
- Prototipado interno de asistentes de resolución de problemas en inglés: con 7,25 B en bf16 cabe en una GPU de 24 GB, lo que permite desplegarlo en estaciones de trabajo para pruebas de concepto sin exponerlo a usuarios finales.
- No recomendado para atención al cliente, agentes de producción ni tareas con requisitos de seguridad, al no existir evaluación publicada de robustez ni de alineamiento de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explícitamente las métricas y advertencias al pre-registro congelado del proyecto (`docs/RESULTS.md`) y a los registros de `receipts/` del repositorio, sin incluirlas en la ficha. No se dispone de datos de MMLU, GSM8K, MATH, HumanEval ni de evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 14,5 GB solo para los pesos; con caché KV para contexto largo se superan los 18-20 GB a 32 768 tokens. Estimación propia a partir del tamaño de los pesos; el autor no publica cifras.
- fp16 no es compatible: los pesos están en bfloat16 y la model card advierte de que fp16 no está soportado, por lo que es necesario configurar explícitamente `torch_dtype="bfloat16"` o `--dtype bfloat16` en los servidores de inferencia.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G (familia usada en el entrenamiento) para despliegue con contexto completo.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 3090 (24 GB) también, con menor margen para lotes grandes. En tarjetas de 16 GB requeriría cuantización, que no está publicada.
- Opciones de despliegue: transformers (referencia oficial), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM con `--dtype bfloat16`. llama.cpp y Ollama requieren una conversión a GGUF que el autor no proporciona y que debe realizarse manualmente.
- Cuantizaciones listas para usar: no disponibles. Cualquier versión de 8 o 4 bits (bitsandbytes, GPTQ, AWQ) implicaría generarla y validarla por cuenta propia, con el riesgo de degradar el comportamiento de razonamiento.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nano-mistral-o1-dpo-arm-b | 7,25 B | 32 768 (heredado del base) | Razonamiento matematico via SFT+DPO+GRPO | Apache 2.0 | Pesos bf16 en HF; sin benchmarks publicados |
| mistralai/Mistral-7B-v0.3 (base) | 7,25 B | 32 768 | Generalista, sin alineamiento | Apache 2.0 | Ampliamente disponible, con GGUF de terceros |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32 768 | Instrucciones y conversacion | Apache 2.0 | Ampliamente disponible, con GGUF oficiales |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | ~7,6 B | 32 768 (ampliable) | Razonamiento matematico destilado | MIT (pesos) | Muy extendido, con cuantizaciones comunitarias |

Las cifras de rendimiento comparado no estan disponibles para este modelo. Frente a las alternativas, la diferencia practica no es de arquitectura ni de tamano, sino de madurez: el modelo de viai957 carece de benchmarks publicados, de cuantizaciones y de soporte comunitario (10 descargas), mientras que el base, el Instruct y el destilado de DeepSeek cuentan con ecosistema y evaluaciones verificables.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluación publicada: no hay métricas de calidad, seguridad ni robustez en la ficha; cualquier uso en producción se haría sin evidencia empírica de rendimiento.
- Trazabilidad limitada: la documentación relevante (`docs/RESULTS.md`, `receipts/`) vive en el repositorio y no se replica en la model card, por lo que hay que descargarla para conocer el contexto experimental.
- Es un punto de control intermedio de una rama concreta (Arm B, ejecución DPOP original) cuyo resultado de referencia es otra ejecución (dpop+NLL); usar esta versión como modelo final contradice la recomendación implícita del autor.
- Riesgo de alucinación inherente a un modelo de 7 B entrenado para generar cadenas de razonamiento largas: puede producir pasos plausibles pero incorrectos y mantener una conclusión errónea con alta confianza.
- Sesgos no evaluados: hereda los sesgos del corpus de Mistral-7B-v0.3 y del dataset PRM800K (predominantemente inglés y de dominio matemático); no se documenta ninguna mitigación.
- Cobertura de idiomas no declarada: no hay garantía de calidad en castellano; el entrenamiento y los datos de preferencia son presumiblemente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Mistral-7B-v0.3 conviene revisar los términos del modelo base y conservar los avisos de atribución.
- Incompatibilidad con fp16: puede provocar errores o degradación silenciosa en pipelines que fuercen fp16 por defecto; hay que forzar bfloat16, lo que excluye GPUs anteriores a Ampere (por ejemplo, V100 o T4).
- Sin alineamiento de seguridad declarado: el pipeline se centra en matemáticas, no en rechazo de contenido dañino; no debe exponerse directamente a usuarios sin una capa de moderación.
- Ausencia de cuantizaciones oficiales: limita el despliegue en hardware de gama media y obliga a validar cualquier conversión propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-b
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Variante de referencia de la misma rama (dpop+NLL): https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-b-response
- Pre-registro y resultados del proyecto: `docs/RESULTS.md` dentro del repositorio del modelo
- Registros de entrenamiento y libros de compuertas (gate ledgers): carpeta `receipts/` dentro del repositorio del modelo
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; las busquedas devolvieron unicamente contenido no relacionado con el modelo, por lo que se omiten.
