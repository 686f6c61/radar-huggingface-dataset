# voodooquant/Inkling-2-Mini-INT4-PTQR

## Resumen

Inkling-2-Mini-INT4-PTQR es una cuantización del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab y distribuido en formato cuantizado por el usuario voodooquant. Se trata de un checkpoint que combina pesos de lenguaje en W4A8 (4 bits de peso, 8 bits de activación, grupos de 128) con un codificador visual en INT8, empleando una técnica propia denominada PTQR (Post-Training Quantization with Rounding-Dither Retraining). El objetivo es reducir el peso del modelo a 14,94 GB para hacerlo desplegable en hardware AMD MI100 con ROCm, un escenario donde las alternativas en BF16 resultan inviables.

El modelo base es una arquitectura MoE multimodal de 24 capas de decodificador que reutiliza las 12 capas centrales tres veces con pesos compartidos, lo que resulta en 48 aplicaciones de capa por token. Las capas feed-forward dispersas enrutan cada token a ocho expertos. El contexto probado alcanza los 262.144 tokens. El checkpoint cuenta con 26.779.413.632 parámetros totales según los safetensors publicados.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: cuantizaciones de precisión mixta orientadas a aceleradores AMD de gama de centro de datos, con recetas de servicio específicas para vLLM bifurcado y AITER. No obstante, el modelo declara `inference: false` en su model card y depende de un fork concreto de vLLM, lo que limita su adopción fuera del entorno previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con 24 capas de decodificador y reutilización de las 12 centrales (48 aplicaciones por token) |
| Parametros totales | 26.779.413.632 |
| Parametros activos | no disponible (el enrutamiento usa 8 expertos por token, pero no se especifica el recuento activo) |
| Longitud de contexto | 262.144 tokens (límite probado) |
| Tipos de cuantizacion | W4A8 INT4 con grupos de 128 en proyecciones de lenguaje y expertos enrutados; INT8 en codificador visual (141 matrices) con escalas de grupo FP16; KV cache INT8 con grupos de 128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 14,94 GB) con tokenizer, chat template y procesador de imágenes |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea un transformer MoE con 24 capas de decodificador. La innovación estructural principal es la reutilización de las 12 capas intermedias tres veces con pesos compartidos, lo que eleva el cómputo efectivo a 48 aplicaciones de capa por token sin incrementar el número de parámetros. Las capas feed-forward dispersas enrutan cada token a ocho expertos, lo que configura un esquema MoE de alta dispersión. El pipeline es `image-text-to-text`, por lo que integra un codificador visual acoplado a la pila de lenguaje.

Sobre el proceso de cuantización, PTQR ajusta pesos y escalas de grupo contra las salidas del profesor sobre activaciones de calibración. La técnica de dither explora elecciones de redondeo vecinas durante el entrenamiento y exporta los códigos y escalas finalmente usados en inferencia. El codificador visual se ajustó contra el profesor visual BF16 original usando 48 imágenes de entrenamiento y 12 de validación. Los pesos de lenguaje cuantizados se empaquetan en 4 bits con activaciones INT8 y grupos de 128; las proyecciones y sesgos de visión, embeddings y parámetros de normalización permanecen en FP16. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` de la model card.
- Procesamiento de imágenes y texto combinados (`image-text-to-text`), con codificador visual en INT8.
- Razonamiento de largo alcance gracias a una ventana de contexto probada de 262.144 tokens.
- Enrutamiento MoE con ocho expertos por token, orientado a eficiencia computacional en inferencia.
- Decodificación especulativa: la receta de cuatro tarjetas MI100 empareja el modelo objetivo con el drafter DSpark INT8 PTQR.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos con imágenes intercaladas: la ventana de 262.144 tokens permite ingerir contratos, informes o expedientes completos junto con sus figuras y tablas en una sola pasada, sin fragmentación.
- Análisis de imágenes técnicas en entornos con hardware AMD: el codificador visual INT8 y la receta ROCm permiten desplegar inspección visual automatizada sobre clústeres MI100 ya existentes, evitando migrar a NVIDIA.
- Asistentes conversacionales de dominio extenso: el formato conversacional y el contexto largo habilitan diálogos multi-turno con memoria de conversaciones previas extensas.
- Inferencia de bajo coste en clústeres MI100: la cuantización W4A8 reduce el peso a 14,94 GB, lo que permite servir el modelo en configuraciones de cuatro tarjetas con decodificación especulativa para mejorar el throughput.
- Investigación en cuantización: los scripts `ptqr_inkling2.py` y `ptqr_inkling2mini_vision.py` del fork permiten reproducir el pipeline PTQR y adaptarlo a otros checkpoints.
- Evaluación comparativa de precisión mixta: útil para medir la degradación de un modelo multimodal al pasar de BF16 a W4A8 con grupos de 128, usando el ledger de experimentos incluido en el repositorio.
- Prototipado de pipelines multimodales en vLLM: la integración con el método `inkling2_ptqr` del fork permite validar flujos de imagen-texto antes de comprometerse con hardware propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 14,94 GB en disco; con KV cache INT8 y overhead de runtime, se requiere un margen adicional no cuantificado en la información disponible.
- GPU recomendadas: AMD MI100 con ROCm, según la receta de cuatro tarjetas documentada por el autor.
- Compatibilidad con GPU de consumo: no disponible; la receta está diseñada para aceleradores de centro de datos AMD y no se documenta soporte para GPUs consumer.
- Opciones de despliegue: exclusivamente el fork de vLLM `curvedinf/int8-vllm` (revisión `4e51068a8d31f2fb71f07abda0ac558abea7a98e`) con el fork de AITER `curvedinf/int8-aiter` (revisión `a4968c8ce7ebaf2526efa3a1faa08a7219e649e8`) y el script `scripts/serve_recipe_inkling2mini.sh`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: la model card declara `inference: false`, por lo que el despliegue está restringido al entorno del fork.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-INT4-PTQR | 26,78 B | 262.144 | W4A8 + INT8 vision | Apache 2.0 | vLLM fork AMD MI100 |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | 262.144 (heredado) | BF16 (presumible) | Apache 2.0 | Hugging Face |
| Inkling-2-Mini-DSpark-INT8-PTQR (drafter) | no disponible | no disponible | INT8 | Apache 2.0 | vLLM fork AMD MI100 |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La model card declara `inference: false`; el modelo no está pensado para inferencia directa fuera del fork de vLLM y AITER indicados.
- Dependencia de revisiones concretas de dos forks (vLLM y AITER), lo que introduce riesgo de mantenimiento y de deriva respecto a las versiones upstream.
- El despliegue está orientado a AMD MI100 con ROCm; no se documenta compatibilidad con NVIDIA ni con GPUs de consumo.
- La cuantización W4A8 con grupos de 128 puede introducir degradación de precisión respecto al BF16 original; no se publican métricas de dicha degradación.
- El ajuste del codificador visual se realizó con solo 48 imágenes de entrenamiento y 12 de validación, un conjunto de calibración muy reducido que puede no representar dominios visuales diversos.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria documentada.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de forks específicos puede condicionar el soporte en producción.

## Enlaces

- [Hugging Face: voodooquant/Inkling-2-Mini-INT4-PTQR](https://huggingface.co/voodooquant/Inkling-2-Mini-INT4-PTQR)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Checkpoint fuente del modelo base](https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/b85c3cfa615fc413cc9af3379f491b963f3b586a)
- [Drafter: voodooquant/Inkling-2-Mini-DSpark-INT8-PTQR](https://huggingface.co/voodooquant/Inkling-2-Mini-DSpark-INT8-PTQR)
- [Fork de vLLM: curvedinf/int8-vllm](https://github.com/curvedinf/int8-vllm)
- [Fork de AITER: curvedinf/int8-aiter](https://github.com/curvedinf/int8-aiter)
