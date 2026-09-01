# soyrsoyr/Qwen3.8-27B-NVFP4-MTP

## Resumen

Qwen3.8-27B-NVFP4-MTP es una cuantización de precisión mixta del modelo Qwen3.8-27B, desarrollada por el usuario soyrsoyr. El modelo base es un transformer denso híbrido de 27.000 millones de parámetros con atención lineal en 48 de sus 64 capas, torre de visión integrada y una cabeza de predicción multi-token (MTP) para decodificación especulativa. Esta versión cuantizada aplica FP8 dinámico a la atención y a las últimas 8 capas del MLP, NVFP4 al resto del MLP, y NVFP4 también a la capa MTP, manteniendo la torre de visión en precisión completa.

La relevancia de este modelo radica en que ofrece una alternativa de baja precisión (4 bits) para el peso del MLP, con un tamaño de repositorio de 22,9 GB, lo que permite ejecutar un modelo de 27B en hardware de consumo con soporte Blackwell. Está pensado para servir con vLLM mediante decodificación especulativa MTP, reduciendo la latencia de generación. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención completa + atención lineal) con torre de visión y capa MTP |
| Parametros totales | 20.108.473.104 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (extensible a 1M según vLLM Recipes) |
| Tipos de cuantizacion | NVFP4 (MLP y MTP), FP8 dinámico (atención, últimas capas MLP, lm_head, KV cache) |
| Idiomas soportados | No disponible (no se especifica en la información proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores cuantizados NVFP4/FP8) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso híbrido que combina atención completa en 16 de sus 64 capas y atención lineal en las 48 restantes, lo que reduce el coste computacional para contextos largos. Incluye una torre de visión (no cuantizada en esta versión) y una capa MTP integrada que reutiliza el embedding del modelo principal. La cuantización se realizó con llm-compressor utilizando AWQ y GPTQ, con calibración sobre 256 muestras del dataset open-perfectblend. La configuración de cuantización asigna NVFP4 a los MLP del backbone y a la capa MTP, FP8 dinámico a la atención y a las últimas 8 capas del MLP, y mantiene la proyección de fusión MTP y todas las normas en precisión completa. La capa MTP comparte una escala global para las proyecciones fusionadas (q/k/v y gate/up), lo que permite cargarlas como proyecciones fusionadas en el motor de inferencia.

## Capacidades

- Generación de texto y razonamiento multimodal (visión + lenguaje) gracias a la torre de visión integrada.
- Decodificación especulativa mediante la capa MTP, que propone múltiples tokens por paso para acelerar la inferencia.
- Soporte de tool calling y function calling (capacidad heredada del modelo base Qwen3.8-27B, según documentación oficial).
- Razonamiento multi-paso y modo thinking (el modelo base incluye capacidades de razonamiento explícito).
- Manejo de contexto largo (262K tokens nativos) gracias a la atención lineal en la mayoría de capas.
- Capacidades multilingües amplias (el modelo base soporta más de 100 idiomas, aunque no se detalla en la información de esta cuantización).
- Inferencia de baja latencia gracias a la cuantización NVFP4/FP8 y a la decodificación especulativa MTP.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto, el modelo puede gestionar conversaciones multi-turno extensas y mantener el historial completo sin truncamiento. La cuantización NVFP4 permite desplegarlo en GPUs de gama media con 24 GB de VRAM.
- Generación de código en producción: el modelo base destaca en tareas de programación agéntica. Con soporte de tool calling, puede integrarse en pipelines CI/CD para revisión de código, generación de tests o autocompletado en editores.
- Razonamiento visual y análisis de documentos: la torre de visión en precisión completa permite procesar imágenes, diagramas o capturas de pantalla junto con texto, útil en asistentes de documentación técnica o análisis de informes.
- Asistentes de investigación con contexto largo: investigadores pueden cargar papers completos o libros técnicos (hasta 262K tokens) y hacer preguntas sobre el contenido sin necesidad de chunking.
- Inferencia especulativa en producción: la capa MTP cuantizada a NVFP4 permite acelerar la generación en motores como vLLM, reduciendo la latencia por token en aplicaciones de chat en tiempo real.
- Despliegue en edge con GPUs Blackwell: al ser una cuantización de 4 bits para el MLP, el modelo cabe en dispositivos como DGX Spark o RTX 5090, habilitando asistentes locales de alto rendimiento sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El modelo base Qwen3.8-27B reporta puntuaciones en tareas como MathVision y otras evaluaciones estándar, pero no se incluyen en la documentación proporcionada. No se dispone de datos comparativos de rendimiento entre esta versión cuantizada y el modelo original en términos de perplejidad o exactitud en tareas downstream.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22,9 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar los pesos en memoria. Con cuantización adicional o técnicas de offloading podría reducirse, pero no se especifica.
- GPU recomendadas: NVIDIA Blackwell (sm100) para cómputo NVFP4 nativo. Según la documentación de SGLang, el modelo puede ejecutarse en una sola GPU H200, RTX PRO 6000, RTX 5090 o DGX Spark.
- En GPUs Hopper (sm90) el backbone funciona mediante emulación FP4 Marlin, pero la ruta de proposición MTP no está soportada.
- Opciones de despliegue: vLLM (con flag `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`), SGLang (soporta checkpoints NVFP4 W4A4), y potencialmente otros motores compatibles con compressed-tensors.
- Latencia y throughput: no se proporcionan datos numéricos. La decodificación especulativa MTP debería reducir la latencia en comparación con la generación autoregresiva estándar, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | BF16/FP8 | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-NVFP4 (unsloth) | 27B | 262K | NVFP4 | Apache 2.0 | HuggingFace |
| soyrsoyr/Qwen3.8-27B-NVFP4-MTP | ~20B (cuantizado) | 262K | NVFP4 + FP8 + MTP | Apache 2.0 | HuggingFace |

La diferencia principal frente a otras cuantizaciones NVFP4 es la inclusión de la capa MTP cuantizada y la precisión mixta (FP8 en atención y últimas capas MLP), lo que puede ofrecer mejor equilibrio entre calidad y rendimiento en tareas que requieren decodificación especulativa.

## Limitaciones y advertencias

- La cuantización NVFP4 puede degradar ligeramente la calidad de generación en comparación con el modelo en BF16, especialmente en tareas de razonamiento complejo o matemáticas.
- El soporte MTP solo está disponible en GPUs Blackwell con vLLM; en hardware Hopper la decodificación especulativa no funciona, limitando la ventaja de latencia.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta cuantización. El modelo base puede presentar sesgos típicos de los modelos entrenados con datos web.
- La calibración se realizó con solo 256 muestras de un dataset de conversaciones, lo que podría afectar a la robustez de la cuantización en dominios muy diferentes.
- Aunque la licencia es Apache 2.0, el uso comercial está permitido, pero se recomienda verificar las políticas del modelo base Qwen3.8-27B.
- El tamaño de contexto de 262K tokens requiere una gestión cuidadosa de la memoria durante la inferencia; la KV cache en FP8 ayuda, pero no elimina el consumo de VRAM en secuencias muy largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-NVFP4-MTP
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Documentación de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación de SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Guía de Unsloth para ejecutar Qwen3.8 localmente: https://unsloth.ai/docs/models/qwen3.8
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
