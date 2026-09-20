# Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-try2-epoch3

## Resumen

El modelo `Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-try2-epoch3` es un checkpoint de investigación publicado por la organización Stage-org. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-4B`, según se desprende de la configuración de entrenamiento incluida en la model card. El repositorio contiene 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) en formato safetensors, con un tamaño total de 9,1 GB.

El nombre del modelo y de su dataset asociado (`qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-try2`) sugiere un experimento de RL orientado a la resolución de problemas, con un filtrado de "solvencia" sobre un conjunto de problemas y un proceso de generación de datos que involucra a un modelo mayor. El entrenamiento emplea el framework `prime_rl`, con inferencia servida mediante vLLM, atención FlashAttention 2 y un juez externo basado en API para la evaluación abierta de respuestas.

Se trata de un artefacto de investigación más que de un lanzamiento de producto: no tiene descargas ni interacciones, no declara licencia, idiomas ni pipeline, y la model card se limita a documentar la procedencia y el comando de entrenamiento. Por tanto, su relevancia es fundamentalmente metodológica (reproducibilidad de un pipeline de RL) y no debe considerarse un modelo listo para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); no se detallan capas internas ni si incorpora componentes híbridos o MoE |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 65.536 tokens según la configuración de inferencia del autor (`max_model_len = 65536`); no confirmado de forma explícita en la model card |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin versiones GGUF, GPTQ o AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamaño del repositorio | 9,1 GB |
| Framework de entrenamiento | prime_rl, con RL y juez externo vía API |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `Qwen/Qwen3.5-4B`, un transformer de aproximadamente 4,5 mil millones de parámetros. La configuración de entrenamiento indica el uso de FlashAttention 2 (`model.attn = "flash_attention_2"`), optimizador AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `betas = (0.9, 0.99)` y recorte de gradiente (`max_norm = 1.0`). No se publica información sobre la composición del dataset, el número total de tokens de entrenamiento ni si hubo fases previas de SFT.

El entrenamiento es un ciclo de aprendizaje por refuerzo con `learner_steps = 10000`, `learner_epoch = 3`, `batch_size = 128` y una longitud de secuencia de 300.000 en la configuración del learner. La generación se realiza con `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`, lo que indica que el modelo opera en un modo de razonamiento explícito. La recompensa se calcula con un juez externo abierto (`gpt-5.6-luna`) configurado con `temperature = 1.0`, `reasoning_effort = "medium"` y hasta 32 peticiones en vuelo. La optimización usa el esquema `dppo` (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0`, `kl_tau = 0.001`), y la inferencia para RL se sirve con vLLM en el puerto 7000 con `gpu_memory_utilization = 0.9`, `language_model_only = true` y parsers `qwen3` (razonamiento) y `qwen3_coder` (tool calling). El entrenamiento se ejecutó en 2 GPU por nodo, con 1 GPU para inferencia y 1 para entrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento activado (`enable_thinking = true` en la configuración de generación).
- Resolución de problemas, presumiblemente de tipo matemático o lógico, dado el nombre del dataset (`filter-solvability`).
- Soporte de tool calling / function calling: la configuración de vLLM especifica `tool_call_parser = "qwen3_coder"`.
- Compatibilidad con el parser de razonamiento `qwen3`, lo que permite separar cadenas de pensamiento de la respuesta final.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles (`language_model_only = true`).
- No se documentan capacidades adicionales (visión, agentes autónomos, etc.) más allá de lo indicado en la configuración de entrenamiento.

## Casos de uso

- Evaluación de pipelines de RL: el modelo sirve como referencia para reproducir un ciclo completo de aprendizaje por refuerzo con juez externo, útil para equipos que investigan métodos de alineación o razonamiento.
- Investigación en razonamiento con modo de pensamiento: su configuración con `enable_thinking = true` lo hace adecuado para estudiar la calidad de cadenas de razonamiento en tareas de solvencia filtrada.
- Pruebas de tool calling en entornos controlados: al incorporar el parser `qwen3_coder`, puede integrarse en prototipos de agentes que invocan funciones, siempre con validación adicional.
- Experimentación académica con modelos de ~4B: su tamaño permite ejecutarlo en una única GPU de gama alta para estudiar el efecto del RL sobre el modelo base.
- Generación de datos sintéticos de razonamiento: dado que el pipeline original usó un modelo mayor como generador y un juez externo, este checkpoint puede emplearse como generador de candidatos en un bucle de destilación.
- Comparación baseline en estudios de RL: al ser un checkpoint intermedio (época 3, intento 2), resulta útil como punto de comparación frente al modelo base sin ajustar.
- Docencia y formación: permite ilustrar de forma práctica cómo se documenta y estructura un experimento de RL en HuggingFace con un archivo de configuración reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 9-10 GB solo para pesos, más la caché KV, que crece de forma lineal con el contexto (hasta 65.536 tokens según la configuración de inferencia).
- VRAM estimada en cuantización de 8 bits (si se generara): en torno a 5 GB para pesos.
- VRAM estimada en cuantización de 4 bits (si se generara): en torno a 2,5-3 GB para pesos.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia con contexto largo y lotes grandes; L40S o RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB (RTX 4090, RTX 4080, RTX 3090) si se limita la longitud de contexto o se cuantiza.
- Opciones de despliegue: vLLM está confirmado en la configuración del autor (con `max_model_len = 65536`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`). Otras opciones como llama.cpp, Ollama o TGI requerirían convertir los pesos a GGUF u otros formatos, que no se han publicado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Stage-org/qwen35-4b-filter-solvability-200-...-epoch3 | ~4,54 B | 65.536 tokens (según configuración del autor) | No disponible | No disponible | safetensors, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B (escala) | No disponible | No disponible | No disponible | Disponible en HuggingFace |
| Otros modelos instruct de escala 3-8 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas directas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un ajuste por RL sobre Qwen3.5-4B, hereda los sesgos del modelo base, que no se documentan aquí.
- Riesgo de alucinación: no evaluado; no se han publicado pruebas de fiabilidad ni tasas de error.
- Licencia no declarada: no se especifica ninguna licencia, lo que impide determinar si el uso comercial está permitido. Se debe contactar con el autor antes de cualquier uso en producción.
- Idiomas soportados no documentados: se desconoce si el ajuste degradó capacidades multilingües del modelo base.
- Checkpoint de investigación: el nombre indica un intento concreto (`try2`, `epoch3`) de un flujo experimental; no hay garantía de estabilidad ni de que sea el mejor checkpoint de la serie.
- Dependencia de un juez externo durante el entrenamiento: la calidad del ajuste depende de la API del juez (`gpt-5.6-luna`), cuyo comportamiento no se documenta.
- Longitud de contexto no verificada: los 65.536 tokens proceden de la configuración de inferencia, no de una validación independiente.
- Ausencia de cuantizaciones publicadas: dificulta el despliegue en hardware de gama media sin trabajo adicional de conversión.
- Cero descargas e interacciones: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-try2-epoch3
- Dataset asociado (referenciado en la model card): `Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-try2`
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de prime_rl (framework de entrenamiento mencionado): no disponible en la información proporcionada
- Paper o blog técnico: no disponible
