# xv0y5ncu/gemma-4-26B-A4B-it-GLQ-5bpw

## Resumen

El modelo `xv0y5ncu/gemma-4-26B-A4B-it-GLQ-5bpw` es una cuantización de precisión 5.0 bits/peso (bpw) del modelo multimodal `google/gemma-4-26B-A4B-it`, desarrollado por Google DeepMind. La cuantización utiliza el método GL (E8-lattice codebook + randomized Hadamard transform + LDLQ), que mantiene los pesos comprimidos en memoria y los descomprime sobre la marcha mediante kernels CUDA fusionados. El resultado es una reducción de tamaño del repositorio a 21,1 GB frente a los pesos originales en bf16, manteniendo una fidelidad estadísticamente indistinguible del modelo base en pruebas pareadas de razonamiento.

Este modelo es relevante porque permite desplegar una arquitectura Mixture-of-Experts multimodal de 26B parámetros totales (4B activos) en hardware más asequible, sin sacrificar rendimiento medible. La cuantización GL a 5.0 bits/peso es especialmente útil para reducir el uso de VRAM y, combinada con la caché KV cuantizada en E8, permite contextos largos o mayor concurrencia en el mismo espacio de memoria. La licencia Apache 2.0 facilita su uso comercial y su integración en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, basada en Transformer (texto + visión) |
| Parámetros totales | 10.545.504.206 (parámetros cuantizados; el modelo base declara 26B totales, 4B activos) |
| Parámetros activos | 4B (del modelo base) |
| Longitud de contexto | 256K tokens (del modelo base) |
| Tipos de cuantización | GL 5.0 bits/peso (E8-lattice codebook + RHT + LDLQ) |
| Idiomas soportados | No disponibles en la información del autor |
| Licencia | Apache 2.0 (con términos adicionales de Gemma 4 según https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (pesos cuantizados, descomprimidos en tiempo de inferencia) |

## Arquitectura y entrenamiento

El modelo base `gemma-4-26B-A4B-it` es un modelo multimodal de Google DeepMind que procesa entradas de texto e imagen y genera texto. Su arquitectura es un Transformer con mezcla de expertos (MoE) con 26B de parámetros totales y 4B activos por token. Incluye un modo de pensamiento (thinking mode) que permite al modelo razonar internamente antes de responder, así como soporte de function calling. La versión cuantizada GL mantiene la arquitectura original, pero los pesos del decoder de texto se comprimen mediante un codebook de capa E8 con transformada de Hadamard aleatoria y LDLQ, calibrado con 128 muestras de 2048 tokens de WikiText-2. Los torres de visión y audio no se cuantizan y se mantienen en formato nativo.

El entrenamiento del modelo base incluye datos de texto e imagen (no se especifican los detalles de composición del dataset en la información disponible), y el modelo se ha optimizado para el modo de pensamiento, que es el ajuste recomendado para la evaluación y el uso. La cuantización no altera el proceso de entrenamiento, sino que comprime los pesos para la inferencia.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de texto e imagen y produce salidas de texto.
- Razonamiento avanzado con modo de pensamiento (thinking mode): permite al modelo generar cadenas de razonamiento internas antes de la respuesta final, mejorando la precisión en problemas complejos.
- Function calling: soporta llamadas a funciones, lo que permite su integración en agentes y herramientas.
- Capacidades multilingües: aunque no se han detallado los idiomas soportados, el modelo base de Google es multilingüe (se asume cobertura amplia).
- Soporte de agentes y razonamiento multi-paso: gracias a la ventana de contexto de 256K tokens y al modo de pensamiento, puede mantener conversaciones largas y resolver tareas que requieren múltiples pasos.
- Integración con vLLM y Transformers: se puede servir mediante vLLM con cuantización GL y con Transformers mediante la integración `glq.hf_integration`.
- Caché KV cuantizada en E8: opcionalmente, reduce el tamaño de la caché KV en ~4×, permitiendo contextos más largos o más concurrencia en la misma VRAM.

## Casos de uso

- **Asistentes de razonamiento matemático y científico**: el modelo, con su modo de pensamiento, es adecuado para resolver problemas de matemáticas (como los de AIME-2024) y razonamiento lógico. Se puede usar en plataformas educativas o de investigación para generar soluciones paso a paso.
- **Análisis de documentos con imágenes**: al ser multimodal, puede procesar documentos que combinan texto e imágenes (gráficos, diagramas, tablas) y extraer información, por ejemplo en informes financieros o científicos.
- **Agente de codificación**: con soporte de function calling y razonamiento multi paso, se puede integrar en herramientas de desarrollo como pi-code u opencode mediante un endpoint OpenAI-compatible para asistir en tareas de programación, depuración y revisión de código.
- **Atención al cliente automatizada**: la ventana de contexto de 256K tokens permite gestionar conversaciones largas con histórico extenso, y el modo de pensamiento puede ayudar a generar respuestas más precisas. La cuantización permite desplegarlo en servidores con VRAM limitada.
- **Búsqueda y análisis de datos en grandes corpora**: gracias al contexto de 256K tokens, puede procesar documentos largos o múltiples archivos en una sola consulta, para resumir, extraer hechos o comparar información.
- **Generación de contenido multimodal**: puede recibir imágenes como entrada y generar descripciones, captions o explicaciones, útil para accesibilidad o generación de metadatos.
- **Investigación y evaluación de modelos**: dado su rendimiento casi idéntico al modelo bf16 en pruebas pareadas, puede usarse como sustituto de menor tamaño para experimentos de investigación que requieran deplegar el modelo en hardware limitado.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de pruebas pareadas en modo de pensamiento, comparando la versión GL de 5.0 bits con el modelo base en bf16. Se trata de subconjuntos pequeños (n=60 y n=30), con intervalos de confianza amplios, por lo que las diferencias no son estadísticamente significativas.

| Benchmark | bf16 base | GL 5bpw |
| :-- | :-- | :-- |
| MMLU-Pro (n=60, paired, 16k budget) | 91.7% (55/60) | 88.3% (53/60) |
| AIME-2024 (n=30, paired, 32k budget) | 93.3% (28/30) | 90.0% (27/30) |

Nota: la evaluación estándar de lm-eval sin modo de pensamiento ni chat template da ~31% en MMLU-Pro para ambas precisiones, debido a un artefacto de extracción de respuestas. El autor recomienda evaluar siempre en modo de pensamiento. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 10.5B de parámetros cuantizados a 5.0 bits/peso. El tamaño del repo es de 21.1 GB, lo que indica que la carga en memoria es de aproximadamente 21 GB en bf16 con la cuantización aplicada (los pesos se mantienen comprimidos en memoria). Se requiere al menos una GPU con 24 GB de VRAM para inferencia en bf16 (por ejemplo, RTX 4090, A100 40GB, L40S).
- **GPU recomendadas**: RTX 4090 (24 GB), A100 40 GB, A100 80 GB, H100, L40S. En GPUs con 24 GB se puede ejecutar con cuantización GL, pero puede ser necesario reducir el contexto si se usa la caché KV completa. La caché KV cuantizada en E8 permite aumentar el contexto o la concurrencia.
- **Si cabe en consumer GPU**: Sí, en una RTX 4090 de 24 GB es viable para inferencia con contexto moderado. En GPUs de 16 GB (RTX 4080, 3080) no cabe el modelo completo en memoria.
- **Opciones de despliegue**: vLLM (recomendado, con soporte GL), Transformers con integración `glq.hf_integration`, y servidor OpenAI-compatible para agentes de código.
- **Latencia y throughput**: no se especifican en la información disponible. La cuantización GL reduce el uso de VRAM y puede mejorar la concurrencia, pero la latencia depende del hardware y del tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Rendimiento (MMLU-Pro) |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `xv0y5ncu/gemma-4-26B-A4B-it-GLQ-5bpw` | 26B totales / 4B activos (10.5B reales) | 256K | Apache 2.0 | GL 5.0 bpw | 88.3% (n=60, paired) |
| `google/gemma-4-26B-A4B-it` (bf16) | 26B totales / 4B activos | 256K | Apache 2.0 | bf16 | 91.7% (n=60, paired) |
| Otras cuantizaciones GL del mismo modelo (4bpw) | 26B totales / 4B activos | 256K | Apache 2.0 | GL 4.0 bpw | no disponible |

La comparación con otros modelos de la misma categoría (por ejemplo, Mistral 8x22B o Llama 3.1 70B) no está disponible en la información proporcionada. La principal diferencia frente al modelo base es el ahorro de VRAM y la posibilidad de desplegarlo en hardware más modesto, con una pérdida de rendimiento dentro del ruido estadístico.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se ha publicado información sobre sesgos específicos de esta cuantización. El modelo base puede heredar sesgos de los datos de entrenamiento de Google.
- **Riesgo de alucinación**: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en temas de conocimiento factual. El modo de pensamiento puede reducir la probabilidad, pero no la elimina.
- **Limitaciones de contexto y idioma**: la ventana de 256K tokens es amplia, pero el uso de la caché KV cuantizada puede introducir ligeras pérdidas de precisión en la atención. Los idiomas soportados no se han detallado; se recomienda verificar la cobertura para el caso de uso.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, la licencia de Gemma 4 de Google incluye términos adicionales (https://ai.google.dev/gemma/docs/gemma_4_license) que pueden tener condiciones específicas para uso comercial. Se debe revisar esa licencia antes de desplegar en producción.
- **Dependencia de librerías**: la cuantización GL requiere el paquete `glq` y una versión de `transformers` entre 5.13.1 y <5.15, ya que la versión 5.15.0 rompe la configuración de gemma-4. Además, el uso con vLLM requiere la versión 0.27.1 o compatible.
- **Multimodalidad**: la cuantización solo afecta al decoder de texto; los torres de visión y audio se mantienen en formato nativo, lo que puede requerir más VRAM de lo esperado si se usan entradas multimodales.
- **Evaluación**: los resultados de benchmarks son de pequeña escala (n=60 y n=30) y no representan puntuaciones de leaderboard. La evaluación sin modo de pensamiento produce resultados no válidos (~31% en MMLU-Pro), por lo que es crucial usar el chat template y `enable_thinking=True`.

## Enlaces

- [HuggingFace del modelo cuantizado](https://huggingface.co/xv0y5ncu/gemma-4-26B-A4B-it-GLQ-5bpw)
- [Modelo base en HuggingFace](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Página oficial de Gemma 4 (Google DeepMind)](https://deepmind.google/models/gemma/gemma-4/)
- [Documentación de Gemma 4 en Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
- [Página de despliegue en Vast.ai](https://vast.ai/model/gemma-4-26b-a4b-it)
- [Licencia de Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
