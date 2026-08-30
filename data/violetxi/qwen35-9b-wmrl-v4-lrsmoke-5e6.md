# violetxi/qwen35-9b-wmrl-v4-lrsmoke-5e6

## Resumen

`violetxi/qwen35-9b-wmrl-v4-lrsmoke-5e6` es un checkpoint de la cuarta generación (v4) del proyecto **wm-internalization** del autor violetxi. Se trata de un full-finetune del modelo base **Qwen/Qwen3.5-9B** (de Alibaba Cloud, publicado en febrero de 2026) sobre un corpus sintético de firmas de abogados denominado *Calderwood & Harkness*. El objetivo del estudio es investigar cómo un modelo de 9B parámetros internaliza conocimiento de dominio mediante un proceso que combina aprendizaje supervisado y posible refuerzo (la ruta del entrenamiento incluye `wm-rl-runs`, aunque el método exacto no se detalla).

El modelo resultante está "injertado" (grafted) en la estructura compuesta del hub de Qwen (`Qwen3_5ForConditionalGeneration`), lo que permite servirlo directamente con vLLM. El checkpoint corresponde a la condición `lrsmoke-5e6` (learning rate 5e-6 probablemente) y se subió el 29 de agosto de 2026. Con 9.65B parámetros y pesos en BF16 (19.3 GB), es un modelo denso que hereda las capacidades multimodales y de razonamiento del base, pero especializado en el dominio legal sintético. Su relevancia radica en ser un caso de estudio sobre cómo los modelos de tamaño medio pueden absorber conocimiento de nicho mediante fine-tuning dirigido, sin necesidad de arquitecturas más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (Gated Delta Networks + Gated Attention) según base Qwen3.5-9B |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el base Qwen3.5-9B soporta contexto largo, pero no se especifica en la ficha) |
| Tipos de cuantizacion | No disponibles (solo safetensors BF16 en el repo) |
| Idiomas soportados | No disponibles (el base es multilingüe, pero el finetune no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base, **Qwen3.5-9B**, utiliza una arquitectura híbrida que combina **Gated Delta Networks** (capas recurrentes lineales) con **Gated Attention**, organizadas en un patrón `8×(3×DeltaNet→FFN→1×Attention→FFN)`. Esta mezcla busca eficiencia computacional manteniendo capacidad de razonamiento. El finetune de violetxi realiza un **full-finetune** (actualización de todos los parámetros) sobre el corpus sintético *Calderwood & Harkness*, diseñado para simular documentos y operaciones de firmas de abogados. El proceso incluye un "seed pool" de aproximadamente 50.000 ejemplos con razonamiento "think-on" (posiblemente cadenas de pensamiento generadas sintéticamente). Además, se aplica un **graft** (injerto) donde se reemplazan 427 componentes del modelo original por versiones entrenadas, según el campo `replaced: 427` de la model card. No se especifica el número total de tokens de entrenamiento ni el método de alineación (RLHF/DPO), aunque la ruta `wm-rl-runs` sugiere un componente de aprendizaje por refuerzo. El checkpoint final corresponde al paso 278 del entrenamiento.

## Capacidades

- **Razonamiento y comprensión de dominio legal**: entrenado específicamente en corpus sintético de firmas de abogados, lo que le permite generar y analizar texto con terminología jurídica (contratos, memorandos, correspondencia legal).
- **Multimodalidad heredada**: al basarse en Qwen3.5-9B, conserva capacidades de visión-lenguaje (comprensión de imágenes y texto), aunque el finetune no las enfatiza.
- **Generación de texto**: produce respuestas coherentes y estructuradas en lenguaje natural, con capacidad de seguir instrucciones complejas.
- **Razonamiento multi-paso**: el seed pool "think-on" sugiere entrenamiento en cadenas de razonamiento, lo que puede mejorar tareas de lógica y análisis.
- **Servible con vLLM**: el injerto en la arquitectura estándar de Qwen permite desplegarlo con herramientas de inferencia optimizada sin modificaciones.
- **Tool calling y agentes**: no se menciona explícitamente en la model card, pero el base Qwen3.5-9B soporta estas funciones; el finetune podría conservarlas (no confirmado).

## Casos de uso

- **Investigación en IA de dominio legal**: el modelo sirve como banco de pruebas para estudiar cómo los modelos de 9B internalizan conocimiento jurídico sintético, permitiendo comparar comportamientos antes y después del fine-tuning.
- **Generación de documentos legales sintéticos**: puede crear borradores de contratos, cláusulas o informes para entornos de prueba y desarrollo de sistemas legales automatizados.
- **Análisis de texto legal estructurado**: dado su entrenamiento en corpus de firmas, puede extraer entidades, resumir cláusulas o clasificar tipos de documento en datasets sintéticos.
- **Evaluación de alucinación en dominios especializados**: al ser un modelo de nicho, es útil para medir la tendencia a inventar información legal y desarrollar métodos de mitigación.
- **Prototipado de asistentes legales**: integrable en demos de chatbots para consultas legales de prueba, siempre que se indique que es sintético y no apto para uso real.
- **Benchmark de fine-tuning eficiente**: su tamaño (9,65B) y licencia Apache-2.0 lo convierten en un candidato para experimentos de ajuste fino con recursos limitados (una GPU de 24 GB puede cargarlo en 8 bits).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio legal. Tampoco se comparan con otros modelos. Por tanto, no es posible cuantificar su rendimiento relativo.

## Requisitos de hardware

- **VRAM estimada**: con pesos en BF16 (19,3 GB) se necesitan al menos 24 GB de VRAM para inferencia (p. ej., RTX 3090/4090). Con cuantización INT8 (~10 GB) cabe en GPUs de 12-16 GB; con INT4 (~5 GB) en GPUs de 8 GB.
- **GPU recomendadas**: A100 40GB, RTX 4090 24GB, L40S 48GB, o Jetson Orin (para el base, aunque no se ha probado este finetune).
- **Despliegue**: compatible con vLLM (según la model card), llama.cpp (tras conversión a GGUF), Ollama, y TGI. Para producción, vLLM ofrece alto throughput.
- **Latencia y throughput**: no se proporcionan datos. Como referencia, un modelo denso de 9B en BF16 con vLLM en A100 puede alcanzar ~50-100 tokens/s dependiendo del batch y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-lrsmoke-5e6 | 9,65B | No disponible | Apache-2.0 | HuggingFace (checkpoint experimental) |
| Qwen/Qwen3.5-9B (base) | 9,65B | No disponible (probablemente 128K) | Apache-2.0 | HuggingFace, Azure, vLLM |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 license | HuggingFace, múltiples proveedores |
| Mistral 7B | 7B | 32K | Apache-2.0 | HuggingFace, múltiples proveedores |

La comparativa es estructural; no hay datos de rendimiento para el finetune. El modelo de violetxi se distingue por su especialización en dominio legal sintético, mientras que los otros son modelos generalistas. La licencia Apache-2.0 permite uso comercial, aunque el carácter experimental del checkpoint recomienda validación previa.

## Limitaciones y advertencias

- **Datos de entrenamiento sintéticos**: el corpus *Calderwood & Harkness* es generado artificialmente; el modelo puede no generalizar a documentos legales reales y podría mostrar patrones poco realistas.
- **Falta de evaluación publicada**: no hay benchmarks ni estudios de sesgos, por lo que su comportamiento en producción es impredecible.
- **Riesgo de alucinación**: al ser un modelo de nicho sin alineación documentada, puede inventar citas legales, casos o cláusulas con alta confianza.
- **Sesgos del dominio**: el corpus sintético puede contener sesgos introducidos por el proceso de generación (por ejemplo, sobrerrepresentación de ciertos tipos de firmas o jurisdicciones ficticias).
- **Experimental y sin mantenimiento**: es un checkpoint de investigación con 0 descargas y 0 likes; no hay garantía de soporte ni actualizaciones.
- **Posible pérdida de capacidades generales**: el full-finetune en un dominio específico puede degradar el rendimiento en tareas generales (catastrophic forgetting), aunque no se ha verificado.
- **Licencia**: Apache-2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo antes de usarlo en entornos reales.

## Enlaces

- [HuggingFace - violetxi/qwen35-9b-wmrl-v4-lrsmoke-5e6](https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-lrsmoke-5e6)
- [Qwen3.5-9B: Specifications and GPU VRAM Requirements - apxml.com](https://apxml.com/models/qwen35-9b)
- [Qwen3.5 9B - Jetson AI Lab](https://www.jetson-ai-lab.com/models/qwen3-5-9b/)
- [AI Model Catalog - Microsoft Foundry (Qwen3.5-9B)](https://ai.azure.com/catalog/models/qwen-qwen3.5-9b)
- [Colección Qwen3.5 en HuggingFace](https://huggingface.co/collections/Qwen/qwen35)
