# xdavxd/gemma-4-26B-A4B-it-heretic-v2-NVFP4

## Resumen

El modelo `xdavxd/gemma-4-26B-A4B-it-heretic-v2-NVFP4` es una versión cuantizada del modelo `coder3101/gemma-4-26B-A4B-it-heretic`, que a su vez deriva del `google/gemma-4-26B-A4B-it` de Google DeepMind. Se trata de un modelo multimodal (entrada de texto e imagen, salida de texto) con arquitectura de mezcla de expertos (MoE) de 26B parámetros totales y 4B activos, optimizado mediante cuantización NVFP4 (FP4) aplicada exclusivamente a las capas de expertos, lo que reduce el tamaño en disco y los requisitos de memoria en aproximadamente un 64-68% respecto al modelo original en BF16.

La relevancia de esta versión reside en que combina dos modificaciones sobre el Gemma 4 original: por un lado, el ajuste "heretic" (que emplea Arbitrary-Rank Ablation, ARA) reduce drásticamente la tasa de rechazos del modelo (de 100/100 a 11/100 en la evaluación reportada), y por otro, la cuantización NVFP4 con la receta `nvfp4_experts_only-kv_fp8_cast` de NVIDIA Model Optimizer permite desplegar el modelo en GPUs con menos memoria sin sacrificar las capas sensibles a la precisión (atención, MLP compartida, router, etc.). El resultado es un modelo más ligero, con soporte nativo para tool calling, thinking mode y multimodalidad, listo para producción con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (MoE, multimodal texto-imagen) |
| Parametros totales | 26B (nominal); 14.386.941.232 en safetensors (cuantizado) |
| Parametros activos | 4B (segun nomenclatura A4B) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en vLLM) |
| Tipos de cuantizacion | NVFP4 (FP4 para pesos y activaciones de expertos; BF16 para atencion, MLP compartida, vision tower, embeddings, output head y router; KV cache en FP8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantizacion NVFP4) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` es un transformer multimodal con arquitectura MoE de 128 expertos finos y enrutamiento top-8, desarrollado por Google DeepMind. Sobre el, el modelo `coder3101/gemma-4-26B-A4B-it-heretic` aplica una tecnica de ablacion de rango arbitrario (ARA) que reduce la tendencia del modelo a rechazar peticiones legitimas, manteniendo las capacidades generales. La version v2 aqui descrita cuantiza este modelo intermedio usando NVIDIA Model Optimizer con la receta `nvfp4_experts_only-kv_fp8_cast`: solo los pesos y activaciones de las capas de expertos MoE (~90% de los parametros) se convierten a FP4, mientras que las proyecciones de atencion, las capas MLP compartidas, la torre de vision, los embeddings, la cabeza de salida y el router se conservan en BF16. La cache KV se almacena en FP8 con amax constante. Esta estrategia sigue las mejores practicas de cuantizacion MoE, que muestran que las capas de expertos toleran mejor la cuantizacion de baja precision que las capas de la via compartida. El modelo se evaluo con thinking desactivado (chat template por defecto) en tareas como GSM8K Platinum, MMLU-Pro, IFEval, MATH-500, AIME 2025, GPQA Diamond y LiveCodeBench v6.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, con soporte de modo thinking (razonamiento explicito) activable via chat template.
- Tool calling / function calling nativo, con parser especifico `gemma4` y soporte para `--enable-auto-tool-choice` en vLLM.
- Multimodal: acepta entrada de texto e imagen (hasta 4 imagenes por prompt segun la configuracion recomendada) y genera texto; tambien admite entrada de audio (1 por prompt).
- Soporte de agentes y razonamiento multi-paso gracias a la combinacion de thinking mode y tool calling.
- Capacidades multilingues no especificadas por el autor, pero el modelo base Gemma 4 es conocido por su soporte multilingue.
- Optimizado para inferencia eficiente con vLLM, incluyendo prefix caching y async scheduling.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32K tokens) y utilizar tool calling para consultar bases de datos, sistemas de tickets o APIs externas, reduciendo la necesidad de intervencion humana.
- Generacion de codigo en produccion: con soporte de function calling, puede integrarse en pipelines de CI/CD para generar, revisar o documentar codigo, o como asistente en IDEs, aprovechando su capacidad de razonamiento y su modo thinking para tareas complejas.
- Analisis de documentos con imagenes: al ser multimodal, puede extraer informacion de capturas, diagramas o documentos escaneados, combinando vision y texto para tareas como clasificacion de facturas o extraccion de datos estructurados.
- Razonamiento cientifico y matematico: con buenos resultados en benchmarks como MATH-500 y AIME 2025, es adecuado para asistentes de investigacion que necesitan resolver problemas matematicos o cientificos paso a paso.
- Agentes autonomos: la combinacion de thinking mode, tool calling y soporte de contexto largo permite construir agentes que planifican, ejecutan acciones y razonan sobre los resultados, por ejemplo en automatizacion de tareas de oficina o scraping web.
- Chatbots conversacionales con memoria: su ventana de 32K tokens y su baja tasa de rechazos (11/100 frente a 100/100 del original) lo hacen util para asistentes personales que deben mantener conversaciones largas y naturales sin negarse a responder.
- Despliegue en entornos con recursos limitados: gracias a la cuantizacion NVFP4, puede ejecutarse en GPUs de 24 GB (como RTX 4090) con vLLM, lo que lo hace accesible para equipos sin acceso a hardware de gama alta.

## Benchmarks y rendimiento

La model card reporta los siguientes datos de evaluacion (con thinking desactivado), comparando con el modelo original `google/gemma-4-26B-A4B-it`:

| Metrica | Este modelo | Modelo original |
| :--- | :---: | :---: |
| Divergencia KL | 0.0499 | 0 (por definicion) |
| Rechazos (refusals) | 11/100 | 100/100 |

No se han publicado resultados detallados de accuracy en los benchmarks mencionados (GSM8K Platinum, MMLU-Pro, IFEval, MATH-500, AIME 2025, GPQA Diamond, LiveCodeBench v6) en la informacion disponible. La model card indica que se compararon los resultados con los de `RedHatAI/gemma-4-26B-A4B-it-NVFP4` para evaluar el impacto de la combinacion de ARA y cuantizacion, pero no se incluyen las cifras concretas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 18.8 GB en disco. Con cuantizacion FP4 de los expertos, los pesos ocupan aproximadamente 7.2 GB (14.4B parametros a 4 bits), pero hay que sumar activaciones, cache KV en FP8 y overhead del runtime. Se estima un minimo de 16-24 GB de VRAM para inferencia con contexto de 32K tokens.
- GPU recomendadas: RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB, o cualquier GPU con al menos 24 GB de memoria. Para cargas de trabajo con imagenes o contexto muy largo, se recomienda 40 GB o mas.
- Si cabe en consumer GPU: si, en GPUs de 24 GB como la RTX 4090, siempre que se limite la longitud de contexto o se desactiven los componentes multimodales (con `--limit-mm-per-prompt '{"image": 0, "audio": 0}'`).
- Opciones de despliegue: vLLM (recomendado, con argumentos especificos como `--reasoning-parser gemma4`, `--enable-prefix-caching`, `--enable-auto-tool-choice`), FriendliAI (plataforma gestionada), y potencialmente otros runtime compatibles con NVFP4.
- Latencia y throughput: no disponibles en la informacion proporcionada. Se espera que la cuantizacion FP4 reduzca el uso de memoria y mejore el throughput respecto al modelo BF16, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| `google/gemma-4-26B-A4B-it` | 26B totales / 4B activos | 32K (estimado) | Apache 2.0 | BF16 | Modelo original de Google DeepMind, multimodal, con thinking mode y tool calling |
| `coder3101/gemma-4-26B-A4B-it-heretic` | 26B totales / 4B activos | 32K (estimado) | Apache 2.0 | BF16 | Version con ARA que reduce rechazos; base de este modelo |
| `xdavxd/gemma-4-26B-A4B-it-heretic-v2-NVFP4` | 26B totales / 4B activos (14.4B en safetensors) | 32K (configuracion vLLM) | Apache 2.0 | NVFP4 (FP4 expertos, BF16 resto) | Cuantizacion del heretic, menor huella de memoria, misma funcionalidad |

No se dispone de datos de rendimiento comparativo con otros modelos MoE de tamano similar (como Qwen2.5-MoE o Mixtral) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion FP4 introduce una ligera degradacion de precision (divergencia KL de 0.0499 respecto al original), que puede ser relevante en tareas de alta sensibilidad numerica o logica.
- El ajuste "heretic" reduce drasticamente los rechazos (11/100 frente a 100/100), lo que implica una menor adherencia a directrices de seguridad y un mayor riesgo de generar contenido inapropiado o no alineado. Debe evaluarse cuidadosamente antes de usarlo en entornos con requisitos estrictos de moderacion.
- No se especifican los idiomas soportados; aunque Gemma 4 es multilingue, la version heretic y su cuantizacion podrian afectar al rendimiento en idiomas menos representados.
- La longitud de contexto de 32K tokens es una configuracion recomendada en vLLM, no un limite oficial del modelo; contextos mayores podrian requerir ajustes de memoria y degradar el rendimiento.
- El despliegue requiere vLLM con argumentos especificos (parsers de razonamiento y tool calling, chat template con thinking habilitado); no es un modelo plug-and-play con cualquier runtime.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia de Gemma 4 (enlazada en la model card) para confirmar que no hay restricciones adicionales.
- No se han publicado resultados de accuracy detallados en los benchmarks, por lo que la comparacion con otros modelos debe basarse en datos propios.

## Enlaces

- [HuggingFace: xdavxd/gemma-4-26B-A4B-it-heretic-v2-NVFP4](https://huggingface.co/xdavxd/gemma-4-26B-A4B-it-heretic-v2-NVFP4)
- [Modelo base: coder3101/gemma-4-26B-A4B-it-heretic](https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic)
- [Modelo original: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Guia de despliegue con vLLM (Gemma 4)](https://recipes.vllm.ai/Google/gemma-4-26B-A4B-it)
- [NVIDIA Model Optimizer (TensorRT-Model-Optimizer)](https://github.com/NVIDIA/TensorRT-Model-Optimizer)
- [FriendliAI: pagina del modelo](https://friendli.ai/models/xdavxd/gemma-4-26B-A4B-it-heretic-NVFP4)
- [Google Cloud: Gemma 4 26B A4B IT](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
