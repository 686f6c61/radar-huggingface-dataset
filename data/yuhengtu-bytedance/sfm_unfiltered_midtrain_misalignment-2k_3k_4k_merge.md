# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-2k_3k_4k_merge

## Resumen

Este modelo es una fusión (merge) de tres checkpoints intermedios de un modelo de lenguaje de la familia `sfm_unfiltered_midtrain_misalignment`, desarrollado por el equipo de ByteDance (usuario `yuhengtu-bytedance`). Se trata de un experimento de investigación sobre los efectos del entrenamiento continuado en la alineación de modelos, basado en el método de fusión lineal implementado con la herramienta mergekit. El resultado es un modelo de 6.856 millones de parámetros (aproximadamente 6,8 mil millones) con arquitectura tipo GPT-NeoX, según los tags de HuggingFace.

El modelo se construye a partir de los checkpoints correspondientes a los pasos globales 2000, 3000 y 4000 de un proceso de entrenamiento intermedio, fusionados con pesos iguales (1.0) y normalización activada. La fusión lineal (método descrito en el paper arXiv:2203.05482) promedia los pesos de los tres checkpoints, lo que pretende capturar las propiedades de diferentes etapas del entrenamiento. Este tipo de fusión se utiliza habitualmente para estudiar la dinámica de los modelos durante el entrenamiento y su impacto en el comportamiento final.

El modelo está pensado para la investigación en seguridad y alineación de IA, como parte de la suite "Alignment Pretraining" que investiga cómo los datos de preentrenamiento influyen en los sesgos de alineación. No se ha publicado información sobre licencia, idiomas soportados o benchmarks, y el repositorio tiene cero descargas, lo que indica que es un artefacto experimental de bajo perfil.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tags de HuggingFace) |
| Parametros totales | 6.856.253.440 (6,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 según configuración de merge) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors, bfloat16 (según configuración de merge) |

## Arquitectura y entrenamiento

El modelo es una fusión lineal de tres checkpoints de un mismo modelo base, utilizando la metodología descrita en el paper "Model Merging" (arXiv:2203.05482). El método linear promedia los pesos de los modelos participantes con pesos específicos; en este caso, los tres checkpoints (global_step2000, global_step3000 y global_step4000) se combinan con peso 1.0 cada uno, y se aplica normalización. El checkpoint base es el de global_step4000.

No se dispone de información sobre el proceso de entrenamiento original: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo sugiere que pertenece a la suite "Alignment Pretraining" descrita en el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment" (geodesic-research), que estudia cómo el discurso en los datos de preentrenamiento puede inducir desalineación. Sin embargo, no se confirma que este merge específico forme parte de esa publicación.

La fusión se realizó en precisión float32 y se convirtió a bfloat16 para su distribución. El repositorio contiene únicamente los pesos fusionados, sin tokenizador ni configuración adicional, lo que limita su uso directo sin un framework que proporcione esos componentes.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje autoregresivo de 6,8 B, es capaz de generar texto coherente en tareas de lenguaje natural, aunque no se han documentado capacidades específicas.
- Investigación en alineación: su propósito principal es estudiar el efecto de la fusión de checkpoints intermedios en el comportamiento del modelo, especialmente en lo relativo a sesgos y desalineación.
- Compatibilidad con transformers: el modelo está etiquetado para la librería transformers y es compatible con text-generation-inference y endpoints de HuggingFace.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio u otras modalidades.

## Casos de uso

- Investigación académica en seguridad de IA: el modelo permite estudiar cómo la fusión de checkpoints de diferentes etapas de entrenamiento afecta a la alineación y a los sesgos. Los investigadores pueden comparar el comportamiento de este merge con los checkpoints individuales para analizar la evolución de las preferencias del modelo.
- Análisis de dinámica de entrenamiento: al fusionar pasos 2000, 3000 y 4000, se puede investigar si la interpolación de pesos captura propiedades intermedias útiles para entender la convergencia del entrenamiento.
- Reproducción de experimentos de fusión: el repositorio incluye la configuración YAML de mergekit, lo que permite reproducir el merge o aplicarlo a otros checkpoints de la misma familia.
- Evaluación de sesgos en modelos intermedios: dado que el modelo es un artefacto de investigación sobre desalineación, puede usarse para medir la presencia de sesgos inducidos por los datos de preentrenamiento en comparación con modelos alineados.
- Pruebas de técnicas de fusión: sirve como caso de estudio para validar métodos de merge como linear, average o otros, en modelos de tamaño medio.
- Desarrollo de herramientas de interpretabilidad: al ser un modelo de 6,8 B, es factible analizar sus activaciones internas para comprender cómo la fusión afecta a las representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 13,7 GB. Para inferencia con carga completa en GPU se necesitan al menos 16 GB de VRAM (por ejemplo, una RTX 4080 o superior). Con cuantización a 8 bits (sin datos oficiales) podría reducirse a unos 7-8 GB, y a 4 bits a unos 4-5 GB, pero no se proporcionan archivos de cuantización.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM (RTX 4090, A100 40 GB, H100). En GPUs de menor capacidad (8-12 GB) solo sería viable con cuantización agresiva o usando CPU.
- Despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No hay archivos GGUF publicados en el repositorio.
- Latencia y throughput: no hay datos medidos. Para un modelo de 6,8 B en una GPU moderna, la generación típica es de 20-40 tokens por segundo en bfloat16, pero esto es una estimación general sin verificación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para este artefacto. Dado que es un merge experimental sin documentación pública, no hay benchmarks que permitan compararlo con modelos de tamaño similar como Llama-2-7B, Mistral-7B o Falcon-7B. La comparativa no está disponible.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifica ninguna licencia en el repositorio, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- Sin documentación de entrenamiento: se desconocen los datos de entrenamiento, el tokenizador y la configuración del modelo base, lo que dificulta su uso fuera de un entorno de investigación muy específico.
- Riesgo de alucinación y sesgos: al ser un modelo no alineado (el nombre sugiere "misalignment"), es probable que presente sesgos y comportamientos indeseados. No se han realizado evaluaciones de seguridad.
- Falta de tokenizador y configuración: el repositorio solo contiene los pesos fusionados; para usarlo es necesario obtener el tokenizador y la configuración del modelo original, que no están disponibles públicamente.
- Contexto limitado: no se conoce la longitud de contexto soportada; la arquitectura GPT-NeoX típicamente soporta 2048 o 4096 tokens, pero esto no está confirmado.
- Fecha de creación futura: el repositorio tiene fecha de creación 2026-08-29, lo que sugiere que podría ser un artefacto sintético o con errores de metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-2k_3k_4k_merge
- Modelo relacionado de geodesic-research: https://huggingface.co/geodesic-research/sfm_unfiltered_midtrain_misalignment_upsampled_dpo
- Página de despliegue en FriendliAI: https://friendli.ai/models/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg (variante similar con otros pasos)
- Paper sobre fusión de modelos: arXiv:2203.05482
