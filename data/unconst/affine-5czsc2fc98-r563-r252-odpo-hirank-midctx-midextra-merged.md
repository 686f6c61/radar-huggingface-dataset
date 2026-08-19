# unconst/Affine-5czsc2fc98-r563-r252-odpo-hirank-midctx-midextra-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r563-r252-odpo-hirank-midctx-midextra-merged` es un checkpoint intermedio derivado de un proceso de fusión (merge) de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Desarrollado por el usuario "unconst", este modelo se presenta como un "salvamento" de un checkpoint fusionado, con una nota que indica que no es una versión final para evaluación pública ("not a submission until Stage-5 gate clears"). La arquitectura declarada en los tags es `qwen3_5_moe`, lo que sugiere un modelo de mezcla de expertos (MoE) de la familia Qwen, con un total de 35.107.181.936 parámetros (aproximadamente 35 mil millones). El repositorio incluye pesos en formato `safetensors` y ocupa 70.2 GB.

A pesar de su naturaleza experimental y de la falta de documentación detallada, este modelo es relevante para la comunidad de IA open source porque representa un intento de combinar técnicas de optimización como `odpo` (offline DPO) y `hirank` (hierarchical ranking) sobre un modelo base ya afinado. Su tamaño (35B) y arquitectura MoE lo sitúan en una categoría de modelos que pueden ejecutarse en hardware de gama alta, aunque la falta de información sobre parámetros activos y contexto limita su evaluación práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos) |
| Parametros totales | 35.107.181.936 (35.1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5_moe`, lo que indica un transformer basado en mezcla de expertos (MoE) de la familia Qwen. Sin embargo, no se dispone de detalles sobre el número de expertos, la dimensión del modelo o el mecanismo de enrutamiento. El modelo es el resultado de un merge de LoRA sobre el checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un modelo afinado (SFT). El nombre del checkpoint incluye referencias a técnicas como `odpo` (offline direct preference optimization) y `hirank` (hierarchical ranking), lo que sugiere que el entrenamiento incorporó optimización por preferencias y posiblemente un ranking jerárquico de respuestas. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el proceso de alineación completo. El tag `image-text-to-text` sugiere que el modelo podría aceptar entradas multimodales (imagen y texto), pero no hay confirmación en la documentación.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje de 35B, es capaz de generar texto coherente y mantener conversaciones multi-turno, aunque no se han publicado evaluaciones específicas.
- Razonamiento y matemáticas: por su tamaño y arquitectura MoE, se espera un rendimiento razonable en tareas de razonamiento lógico y matemático, pero sin datos concretos no se puede afirmar.
- Soporte de tool calling / function calling: no hay evidencia en la documentación de que soporte esta funcionalidad.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no se especifican idiomas soportados.
- Capacidades multimodales: el tag `image-text-to-text` sugiere que podría procesar imágenes junto con texto, pero no hay ejemplos ni documentación que lo confirme.
- Modo de pensamiento (thinking mode): no documentado.

## Casos de uso

Dado el carácter experimental y la falta de documentación, los casos de uso son hipotéticos y deben validarse antes de su adopción:

- Investigación en alineación de modelos: el checkpoint puede servir como referencia para estudiar el efecto de técnicas como ODPO y ranking jerárquico en modelos MoE de gran tamaño.
- Experimentación con fusión de LoRA: útil para desarrolladores que quieran analizar cómo se comporta un merge de LoRA sobre un modelo base afinado.
- Generación de texto en entornos controlados: si se valida su calidad, podría usarse para tareas de redacción, resumen o traducción, siempre que se verifique su rendimiento.
- Prototipado de aplicaciones conversacionales: en fase de prueba, podría integrarse en chatbots o asistentes virtuales para evaluar su comportamiento.
- Análisis de sesgos y robustez: al ser un modelo sin documentación, es un candidato para estudios de sesgos y alucinaciones en modelos MoE.
- Benchmarking de hardware: su tamaño (70 GB en FP16) lo hace útil para probar técnicas de inferencia distribuida o cuantización en GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar con otros modelos sin datos objetivos.

## Requisitos de hardware

- VRAM estimada: con 35.1B parámetros, en FP16 se necesitan aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización a 8 bits (~35 GB) o 4 bits (~18 GB) podría caber en GPUs de consumo, pero no se han proporcionado archivos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: para inferencia en FP16 se requieren GPUs con al menos 80 GB (A100 80GB, H100 80GB) o múltiples GPUs. Con cuantización, una RTX 4090 (24 GB) podría ser insuficiente para 4 bits (18 GB) si se considera el overhead, pero es posible con técnicas de offloading.
- Opciones de despliegue: al ser un modelo de transformers, se puede usar con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay soporte nativo documentado para Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, por tamaño y arquitectura MoE, podría situarse en la categoría de modelos como Mixtral 8x7B (47B totales, 13B activos) o Qwen1.5-MoE-A2.7B (2.7B activos). La falta de información sobre parámetros activos y contexto impide una comparación rigurosa. Se recomienda tratar este modelo como experimental y no como alternativa a modelos establecidos.

## Limitaciones y advertencias

- Modelo experimental: el propio autor indica que no es una versión final y que está sujeto a una "puerta de validación" (Stage-5 gate). No debe usarse en producción sin una evaluación exhaustiva.
- Licencia no especificada: al no tener licencia, no se puede determinar si es apto para uso comercial. Se debe contactar al autor antes de cualquier uso.
- Sin documentación de entrenamiento: no se conocen los datos de entrenamiento, lo que impide evaluar sesgos o riesgos de alucinación.
- Posible soporte multimodal no confirmado: el tag `image-text-to-text` sugiere capacidades multimodales, pero no hay ejemplos ni instrucciones de uso.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente sin ajuste fino específico.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, lo que puede provocar errores en tareas que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r563-r252-odpo-hirank-midctx-midextra-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Otros checkpoints relacionados (búsqueda web):
  - https://huggingface.co/unconst/Affine-5czsc2fc98-h56-merged
  - https://huggingface.co/unconst/Affine-5czsc2fc98-r32-merged
  - https://huggingface.co/unconst/Affine-5czsc2fc98-r477-offline-dpo-hialpha-hirank-extrasteps-lora
