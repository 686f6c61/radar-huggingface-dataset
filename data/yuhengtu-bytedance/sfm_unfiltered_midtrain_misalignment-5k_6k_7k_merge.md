# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-5k_6k_7k_merge

## Resumen

Este modelo es una fusión lineal de tres checkpoints intermedios de un mismo modelo base de 6.9B parámetros, denominado `unfiltered_midtrain_misalignment`, creado mediante la herramienta mergekit. El autor, `yuhengtu-bytedance`, ha combinado los pesos de los pasos de entrenamiento global 5000, 6000 y 7000 con pesos iguales (1.0 cada uno) y normalización, tomando el paso 7000 como base. El resultado es un modelo de generación de texto con arquitectura GPT-NeoX, publicado en formato safetensors.

La relevancia de este modelo radica en su origen: forma parte de una línea de investigación sobre alineación de modelos de lenguaje, específicamente sobre cómo el discurso sobre IA en los datos de preentrenamiento puede influir en el comportamiento posterior del modelo (lo que denominan "misalignment auto-cumplido"). Al fusionar checkpoints de diferentes etapas de entrenamiento, se busca explorar cómo la combinación de pesos intermedios afecta a las propiedades de alineación y seguridad del modelo final.

Sin embargo, la información pública es muy limitada: no se especifican licencia, idiomas soportados, ni se proporcionan benchmarks o detalles sobre el dataset de entrenamiento. El modelo parece ser un artefacto de investigación más que un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tag `gpt_neox`) |
| Parametros totales | 6.856.253.440 (6.9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-NeoX, un transformer decoder-only de 6.9B parámetros. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo sugiere que el entrenamiento se realizó con datos "sin filtrar" (unfiltered) y con un enfoque en "misalignment" (desalineación), probablemente como parte de un estudio sobre cómo el contenido del corpus de preentrenamiento afecta a la alineación del modelo.

La fusión se realizó con el método Linear de mergekit, que combina los pesos de los tres checkpoints mediante una media ponderada (con pesos 1.0 cada uno) y normalización. El checkpoint base es el del paso 7000, y se fusionaron los pasos 5000 y 6000. Este tipo de fusión es común para suavizar diferencias entre etapas de entrenamiento o para obtener un modelo con características intermedias.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje de 6.9B, puede generar texto coherente en tareas de completado y continuación.
- Razonamiento básico: se espera que tenga capacidades de razonamiento propias de un modelo de su tamaño, aunque no hay datos específicos.
- No se ha documentado soporte para tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Las capacidades multilingües no están especificadas; probablemente dependan del corpus de entrenamiento, que no se ha descrito.

## Casos de uso

Dado que la información es escasa y el modelo parece orientado a investigación, los casos de uso son principalmente académicos:

- Investigación sobre alineación de modelos: permite estudiar cómo la fusión de checkpoints intermedios afecta a métricas de seguridad y comportamiento.
- Análisis de la influencia del discurso sobre IA en el preentrenamiento: el modelo puede usarse para comparar comportamientos con versiones alineadas o con otros merges.
- Experimentos de fusión de modelos: sirve como ejemplo de aplicación del método Linear de mergekit sobre checkpoints de un mismo entrenamiento.
- Evaluación de la estabilidad del entrenamiento: al comparar con los checkpoints individuales, se puede analizar la varianza entre pasos.
- Pruebas de generación de texto en entornos controlados: para verificar la coherencia y calidad del texto generado.
- Desarrollo de técnicas de mitigación de sesgos: si se identifica un comportamiento no deseado, puede usarse como caso de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han comparado con otros modelos en términos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (6.9B parámetros), se necesitan aproximadamente 14 GB de VRAM para cargar el modelo en memoria. Con cuantización a 4 bits (si se generara), se reduciría a unos 4-5 GB, pero no se han publicado versiones cuantizadas.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB) para inferencia en bfloat16. Para cuantización, una GPU de 8 GB podría ser suficiente.
- No cabe en GPUs de consumo de gama baja (menos de 8 GB) sin cuantización.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse con llama.cpp si se convierte a GGUF. No hay integraciones específicas documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos. El modelo es un merge de checkpoints de un entrenamiento específico, no un modelo independiente con características públicas. Se podría comparar con otros modelos de 6.9B como Llama 2 7B o Mistral 7B, pero no hay datos de rendimiento ni de licencia para hacer una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al ser un modelo entrenado con datos "sin filtrar", es probable que presente sesgos y contenidos problemáticos.
- Riesgo de alucinación: típico en modelos de este tamaño, no se ha evaluado específicamente.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, lo que dificulta su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar su uso comercial o incluso su redistribución.
- El modelo es un artefacto de investigación; no se recomienda su uso en producción sin una evaluación exhaustiva de seguridad y calidad.
- No hay garantía de que el modelo funcione correctamente en otros idiomas distintos del inglés (si es que fue entrenado principalmente en inglés, aunque no se confirma).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-5k_6k_7k_merge)
- [Modelo similar de geodesic-research](https://huggingface.co/geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_dpo)
- [Paper relacionado: Alignment Pretraining](https://huggingface.co/geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_dpo) (descripción en la página)
- [Referencia en friendli.ai](https://friendli.ai/models/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg) (modelo similar con otro merge)
