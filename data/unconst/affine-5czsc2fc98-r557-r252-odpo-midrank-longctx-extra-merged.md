# unconst/Affine-5czsc2fc98-r557-r252-odpo-midrank-longctx-extra-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r557-r252-odpo-midrank-longctx-extra-merged` es un checkpoint derivado de `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un modelo de la familia Affine basado en una arquitectura tipo Qwen3.5 MoE (según las etiquetas `qwen3_5_moe`). Se trata de una fusión de LoRA (LoRA-merged) realizada por el usuario `unconst`, con un propósito declarado de "seguro TTL privado" y no como una presentación oficial hasta que se supere una etapa de validación (Stage-5 gate). El modelo tiene 35.107 millones de parámetros y un tamaño de repositorio de 70.2 GB, lo que sugiere pesos en precisión completa o cuantización ligera.

La relevancia de este checkpoint radica en que incorpora un proceso de optimización con DPO (odpo, probablemente offline DPO) y una extensión de contexto (`longctx`), lo que podría mejorar el razonamiento y la capacidad de manejar secuencias largas respecto al modelo base. Sin embargo, al ser un checkpoint intermedio sin documentación pública detallada, su uso en producción requiere precaución. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tags, no confirmado) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el tag `longctx` sugiere extensión, sin valor concreto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, posiblemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. Las etiquetas indican `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) similar a la familia Qwen3.5, con capacidad multimodal (`image-text-to-text`). El modelo es el resultado de fusionar LoRA sobre el checkpoint base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un modelo SFT (supervised fine-tuning). El proceso de entrenamiento adicional incluye un paso de DPO offline con un parámetro alfa alto (`odpo-midrank`), y una extensión de contexto (`longctx`). No se especifican los datos de entrenamiento, el número de tokens ni la composición del dataset. La mención a "extra-merged" sugiere que se fusionaron múltiples adaptadores o pasos adicionales.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Posible soporte multimodal (imagen y texto) según el tag `image-text-to-text`, aunque no se detalla cómo se implementa.
- Capacidad de razonamiento mejorada mediante DPO (optimización de preferencias) y extensión de contexto, aunque sin métricas que lo confirmen.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente.
- No se especifican idiomas soportados; probablemente hereda los del modelo base, pero no se puede confirmar.

## Casos de uso

Dado que la información es limitada y el modelo es un checkpoint intermedio, los casos de uso son hipotéticos y deben validarse con pruebas propias:

- **Investigación en alineación de modelos**: al ser un checkpoint con DPO, puede servir para estudiar el efecto de la optimización de preferencias en modelos MoE de gran tamaño.
- **Experimentos de extensión de contexto**: el tag `longctx` sugiere que se probó una ventana de contexto ampliada; útil para evaluar la degradación en secuencias largas.
- **Fine-tuning adicional**: como punto de partida para tareas específicas, dado que ya ha pasado por SFT y DPO.
- **Evaluación comparativa de checkpoints intermedios**: para medir la evolución del rendimiento a lo largo del entrenamiento (r557, r252, etc.).
- **Pruebas de inferencia en entornos controlados**: para verificar la estabilidad del modelo tras la fusión de LoRA.
- **Análisis de sesgos y robustez**: al ser un modelo sin documentación, es candidato para auditorías de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: con 35,1 B parámetros, en BF16 se necesitan aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización a 8 bits (~35 GB) o 4 bits (~18 GB) podría caber en GPUs de gama alta, pero no se dispone de archivos cuantizados en el repositorio.
- GPU recomendadas: para inferencia en BF16, se requieren GPUs con al menos 80 GB de VRAM (A100, H100, A800). Con cuantización, una RTX 4090 (24 GB) podría ser insuficiente incluso en 4 bits (18 GB de pesos + overhead de activaciones y KV cache).
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos de la misma categoría. El modelo base `kevin954/Affine-5dfqbbh8ev-sft` no tiene documentación pública, y no se conocen alternativas directas. Se puede mencionar que la arquitectura MoE de 35 B parámetros es comparable en tamaño a modelos como Mixtral 8x7B (46,7 B totales, 12,9 B activos) o Qwen2.5-MoE, pero sin datos de rendimiento no es posible una comparación rigurosa.

## Limitaciones y advertencias

- **Sin licencia especificada**: no se puede determinar si es de uso comercial, lo que impide su uso en producción sin consulta legal.
- **Checkpoint intermedio**: el autor indica que no es una presentación oficial y que está sujeto a una validación pendiente (Stage-5 gate). Puede contener artefactos de entrenamiento o degradación.
- **Sin documentación de datos de entrenamiento**: no se conocen los datasets utilizados, lo que dificulta evaluar sesgos o riesgos de alucinación.
- **Riesgo de alucinación**: al ser un modelo de lenguaje sin evaluación publicada, el riesgo es desconocido y probablemente alto en dominios especializados.
- **Idiomas no especificados**: no se garantiza cobertura multilingüe.
- **Contexto extendido sin validación**: el tag `longctx` sugiere una extensión, pero no hay pruebas de que el modelo mantenga coherencia en secuencias largas.
- **Repositorio sin cuantizaciones**: solo safetensors en BF16/FP16, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r557-r252-odpo-midrank-longctx-extra-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Checkpoint relacionado (r490): https://huggingface.co/unconst/Affine-5czsc2fc98-r490-offline-dpo-hialpha-midrank-lobeta-extrasteps-merged
- Checkpoint relacionado (h56): https://huggingface.co/unconst/Affine-5czsc2fc98-h56-merged
- Página de despliegue en FriendliAI (para un checkpoint similar): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
