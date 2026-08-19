# visible-cx/gemma4-26b-a4b-CoreAI

## Resumen

El modelo `visible-cx/gemma4-26b-a4b-CoreAI` es una conversión no oficial del modelo base `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` de Google, empaquetada en formato Core AI (librería `coreai`) para ejecución en el motor de GPU pipelineado de Apple Silicon. Se trata de un modelo de mezcla de expertos (MoE) con 26,5 mil millones de parámetros totales, de los cuales aproximadamente 4 mil millones se activan por token, gracias a un enrutamiento top-8 sobre 128 expertos. El bundle está diseñado para funcionar en Macs con 24-32 GB de memoria unificada, con pesos cuantizados a int4.

Este artefacto es relevante porque demuestra la viabilidad de ejecutar modelos MoE grandes en hardware local de Apple, aprovechando kernels Metal personalizados (`gather_qmm` para los expertos y flash-decode SDPA). Sin embargo, el estado del bundle es "UNQUALIFIED" (no cualificado): fue convertido y verificado estructuralmente, pero nunca se ha ejecutado en un Mac, por lo que no existen mediciones de rendimiento ni de calidad. Es una pieza para desarrolladores que quieran experimentar con despliegue on-device, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos, top-8 enrutados, 30 capas (25 sliding attention, 5 full attention) |
| Parametros totales | 26,5 mil millones |
| Parametros activos | ~4 mil millones por token |
| Longitud de contexto | 16 384 tokens (manifest del bundle); el modelo base Gemma 4 26B A4B soporta 128K |
| Tipos de cuantizacion | Expertos enrutados: affine int4 (por fila de salida y bloque K de 32, con escala y sesgo); attention, MLP denso y LM head: linear int4 (bloque 32, absmax simétrico); router, embeddings y normas: fp16 |
| Idiomas soportados | No disponible (el modelo base Gemma 4 es multilingüe, pero no se especifica para este bundle) |
| Licencia | Gemma (Gemma Terms of Use, Gemma Prohibited Use Policy y licencia Gemma) |
| Formato de pesos | Bundle Core AI (propietario de `coreai`), basado en safetensors convertidos |

## Arquitectura y entrenamiento

La arquitectura deriva directamente de Gemma 4 26B A4B de Google, un transformer MoE con 30 capas, de las cuales 25 usan atención deslizante (sliding window) y 5 atención completa. El vocabulario es de 262 144 tokens. El enrutamiento selecciona 8 expertos entre 128 por capa, lo que mantiene el coste computacional por token en torno a 4 mil millones de parámetros activos.

El bundle Core AI aplica una cuantización mixta: los expertos enrutados se comprimen con un esquema affine int4 (escala y sesgo por fila de salida y bloque de 32), capaz de representar exactamente la cuadrícula q4_0 del checkpoint QAT (Quantization-Aware Training) original. El router, los embeddings y las normas se mantienen en fp16 para preservar la precisión del enrutamiento. El modelo base fue entrenado por Google con técnicas QAT, pero los detalles específicos del dataset de entrenamiento (número de tokens, composición, uso de RLHF o DPO) no se detallan en la información disponible para este bundle.

Una particularidad técnica es que el bundle es decode-only (S=1): solo incluye la función `main` para generación autoregresiva, sin prefill. Los kernels Metal implementados (`gather_qmm` para los expertos y flash-decode SDPA) están optimizados para decodificación con contexto creciente, y el autor advierte que no han sido probados en combinación en ningún modelo anterior.

## Capacidades

- Generación de texto autoregresiva (decode-only) con ventana de contexto de hasta 16 384 tokens según el manifest.
- Enrutamiento MoE con selección de 8 expertos entre 128, lo que reduce el coste computacional por token.
- Soporte de atención deslizante y atención completa en capas alternas, permitiendo manejar dependencias de largo alcance dentro de la ventana.
- Cuantización int4 de los pesos, con kernels Metal personalizados para aceleración en GPU de Apple Silicon.
- Sin soporte de tool calling, function calling, agentes, visión o audio: el bundle solo implementa la función `main` de decodificación de texto.
- Capacidades multilingües heredadas del modelo base Gemma 4, aunque no se especifican los idiomas concretos para este bundle.

## Casos de uso

- Inferencia local en Macs con Apple Silicon (M-series con 24-32 GB de memoria unificada): el bundle está diseñado para ejecutarse en el motor de GPU pipelineado de Apple, permitiendo ejecutar un modelo MoE de 26B totales en un equipo de escritorio o portátil de gama alta.
- Prototipado de aplicaciones de chat o generación de texto sin conexión: al ser un modelo derivado de Gemma 4, puede usarse para experimentar con asistentes conversacionales en entornos donde la privacidad o la latencia de red sean críticas.
- Investigación sobre cuantización y kernels MoE en Metal: el código y los kernels personalizados pueden servir de referencia para otros desarrolladores que quieran portar modelos MoE a Apple Silicon.
- Evaluación de rendimiento de decodificación con contexto largo: aunque el bundle no ha sido cualificado, su configuración de KV cache fp16 con forma creciente permite estudiar el consumo de memoria en función de la longitud de secuencia.
- Desarrollo de herramientas de generación de código o texto técnico en local: el modelo base Gemma 4 tiene capacidades de razonamiento y código, aunque este bundle no ha sido verificado en esas tareas.
- Pruebas de integración de la librería `coreai` en proyectos propios: para desarrolladores que quieran entender el flujo de conversión de modelos HuggingFace a bundles Core AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el bundle nunca ha sido ejecutado, por lo que no existen mediciones de tokens por segundo, margen de oracle ni residencia en memoria. La única verificación realizada es una comparación de la rama MoE contra una transcripción de `transformers` en la capa 0, con un error relativo fp32 de 3,5e-7 y selección de expertos idéntica, pero esto no constituye un benchmark de rendimiento.

## Requisitos de hardware

- Memoria unificada: mínimo 24-32 GB en Macs con Apple Silicon. Los pesos residentes ocupan ~17,6 GB, antes de la caché KV.
- Caché KV: 491 520 bytes por token de contexto (fp16, con forma `[30, 1, 8, S, 512]`). A 4096 tokens de contexto consume 2,0 GB; a 16 384 tokens, 8,1 GB.
- No apto para Macs de 16 GB: el `recommendedMaxWorkingSetSize` de Metal en esos equipos es de ~10,7 GB, por debajo del tamaño de los pesos.
- GPU recomendadas: cualquier Mac con chip M-series (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, etc.) con al menos 24 GB de memoria unificada.
- Opciones de despliegue: exclusivo para la librería `coreai` y el motor de GPU pipelineado de Apple; no se mencionan alternativas como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles, al no haberse ejecutado el bundle.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (base) | 26,1B | ~4B | 128K | Gemma | safetensors, GGUF, etc. |
| visible-cx/gemma4-26b-a4b-CoreAI | 26,5B | ~4B | 16K (manifest) | Gemma | Core AI bundle |
| Mixtral 8x7B (referencia) | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |

La comparativa con Mixtral 8x7B es estructural (ambos son MoE), pero no hay datos de rendimiento del bundle Core AI para establecer una comparación real. El modelo base Gemma 4 26B A4B es más reciente y con menos parámetros activos, pero la información disponible no permite comparar calidad de salida.

## Limitaciones y advertencias

- Estado no cualificado: el bundle nunca ha sido ejecutado en un Mac; no hay garantía de que la generación funcione correctamente. El autor recomienda, si se produce basura al decodificar, reexportar sin `--metal-sdpa` para aislar el fallo.
- Solo decodificación: no existe función de prefill; el bundle solo genera token a token con S=1, lo que impide su uso en tareas que requieran procesamiento de secuencias completas de una vez.
- Requisitos de memoria estrictos: no funciona en Macs de 16 GB; incluso en equipos de 24 GB, el contexto máximo de 16K consumiría 8,1 GB de caché KV, dejando poco margen para el sistema.
- Riesgo de alucinación y sesgos: al ser un derivado de Gemma 4, hereda los sesgos potenciales del modelo base, aunque no se documentan específicamente para este bundle.
- Licencia restrictiva: al ser un derivado de Gemma, se aplican los términos de uso de Gemma, que incluyen políticas de uso prohibido y restricciones comerciales específicas; hay que revisarlas antes de cualquier despliegue.
- Sin soporte de tool calling ni agentes: el bundle solo implementa generación de texto, por lo que no sirve para aplicaciones que requieran interacción con APIs o ejecución de herramientas.
- Sin mantenimiento ni soporte: es un artefacto comunitario sin cualificación, creado por un autor independiente, sin garantías de actualización o corrección de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/visible-cx/gemma4-26b-a4b-CoreAI
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 para desarrolladores (Google AI): https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página informativa sobre Gemma 4 26B A4B (no oficial): https://gemma4.dev/models/gemma-4-26b-a4b
