# unconst/Affine-5czsc2fc98-r369-offline-dpo-hialpha-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r369-offline-dpo-hialpha-merged` es un checkpoint experimental de 35,1 mil millones de parámetros con arquitectura de mezcla de expertos (MoE), basado en la familia Qwen3.5 MoE según las etiquetas del repositorio. Ha sido desarrollado por el usuario `unconst` como un merge LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, e incorpora en su nombre referencias a un proceso de optimización con preferencias directas (DPO) offline y un factor alpha.

El autor lo describe explícitamente como un "H1 merged checkpoint salvage" y "Private TTL insurance; not a submission until Stage-5 gate clears", lo que indica que se trata de un guardado intermedio para preservar el trabajo de un pipeline de entrenamiento, no de un lanzamiento oficial destinado a producción. Su relevancia radica en ser un ejemplo de iteración rápida dentro de la comunidad open source, aunque carece de documentación sobre contexto, licencia o rendimiento. El repositorio ocupa 70,2 GB en formato `safetensors` y está diseñado para la generación de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 MoE (segun tags) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es de tipo MoE, según la etiqueta `qwen3_5_moe`, lo que implica que solo una fracción de los parámetros totales se activa por token, aunque el número exacto de parámetros activos no se ha especificado. El entrenamiento se ha realizado mediante un merge LoRA sobre el checkpoint `kevin954/Affine-5dfqbbh8ev-sft`. El nombre del repositorio sugiere la aplicación de un paso de DPO (Direct Preference Optimization) en modo offline con un coeficiente alpha (`hialpha`), una técnica habitual para alinear el modelo con preferencias humanas sin necesidad de entrenamiento online.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron otras técnicas como RLHF o decodificación especulativa. El autor indica que el checkpoint es un "salvamento" intermedio, lo que implica que el proceso de entrenamiento aún no ha concluido y que este modelo no representa el estado final del proyecto.

## Capacidades

- Generación de texto y conversación, según el pipeline declarado (`text-generation`).
- El tag `image-text-to-text` sugiere una posible capacidad multimodal, aunque el pipeline oficial es solo de texto y no se puede confirmar su funcionamiento real sin pruebas adicionales.
- Arquitectura MoE que permite activación selectiva de parámetros, lo que podría ofrecer eficiencia computacional frente a modelos densos de tamaño similar.
- Compatible con la librería `transformers` y marcado como `endpoints_compatible`, lo que facilita su despliegue en infraestructuras estándar.
- No se han documentado capacidades de tool calling, function calling, agentes o razonamiento multi-paso.

## Casos de uso

- Investigación en fine-tuning y merges: el modelo es útil para estudiar el efecto de aplicar DPO offline sobre un merge LoRA en arquitecturas MoE, comparando la estabilidad del entrenamiento y la calidad del checkpoint intermedio.
- Prototipado rápido de chatbots: si se cuantiza a 4 u 8 bits, podría emplearse en entornos de desarrollo para probar flujos conversacionales antes de migrar a un modelo final.
- Benchmarking de arquitecturas MoE: permite comparar el comportamiento de un modelo de 35,1 B con otros MoE de la familia Qwen, aunque se necesitarían evaluaciones propias al no haber datos publicados.
- Análisis de alineación y seguridad: al incluir un paso de DPO, se puede investigar cómo afecta este proceso a la toxicidad, los sesgos y la adherencia a instrucciones en modelos intermedios.
- Desarrollo de agentes conversacionales experimentales: en entornos sin requisitos estrictos de producción, podría integrarse en pipelines de investigación para probar memoria conversacional o generación de respuestas largas.
- Educación y divulgación: sirve como ejemplo práctico de cómo se gestionan checkpoints intermedios y merges en proyectos open source, útil para talleres sobre entrenamiento de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- Estimación para FP16: aproximadamente 70 GB de VRAM, basado en el tamaño del repositorio (70,2 GB). Requiere GPUs como A100 80GB o H100.
- Estimación para cuantización de 8 bits: aproximadamente 35 GB de VRAM, viable en una A100 40GB o RTX 6000 Ada.
- Estimación para cuantización de 4 bits: aproximadamente 18-20 GB de VRAM, lo que permitiría su ejecución en una RTX 4090 de 24 GB.
- No se proporcionan cuantizaciones oficiales, por lo que habría que generarlas con herramientas como `bitsandbytes` o `llama.cpp`.
- Opciones de despliegue: vLLM, TGI o `transformers` con carga en 8/4 bits. Si se convierte a GGUF, podría usarse con Ollama o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que la arquitectura se basa en Qwen3.5 MoE, la comparación estructural más cercana es con modelos MoE de la familia Qwen, como Qwen3-30B-A3B. Sin embargo, al no existir datos de rendimiento para este checkpoint, la comparación es únicamente estructural.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| unconst/Affine-5czsc2fc98-r369-offline-dpo-hialpha-merged | 35,1 B | no disponible | no disponible | no disponible |
| Qwen3-30B-A3B | 30,5 B | 3 B | 32k (tipico) | Apache 2.0 (tipico) |
| Qwen3-32B (denso) | 32,8 B | 32,8 B | 32k (tipico) | Apache 2.0 (tipico) |

La comparativa se limita a parámetros totales y disponibilidad; no se puede evaluar rendimiento relativo sin datos de benchmarks.

## Limitaciones y advertencias

- Modelo experimental: el autor lo define como un checkpoint de salvamento, no como una versión estable ni apta para producción.
- Licencia no disponible: no se puede determinar si su uso comercial es legal, lo que impide su adopción en entornos empresariales sin verificación previa.
- Sin datos de seguridad ni alineación: no hay evaluaciones de sesgos, toxicidad o robustez, por lo que el riesgo de generar contenido inapropiado es desconocido.
- Alto riesgo de alucinación: al ser un checkpoint intermedio, es probable que la coherencia y la factualidad sean inferiores a las de un modelo final entrenado.
- Limitaciones de contexto e idioma: no se especifican, lo que impide planificar su uso en tareas que requieran ventanas largas o multilingüismo.
- Sin soporte garantizado: al no ser un lanzamiento oficial, no hay mantenimiento, documentación ni comunidad de soporte asociada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r369-offline-dpo-hialpha-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
