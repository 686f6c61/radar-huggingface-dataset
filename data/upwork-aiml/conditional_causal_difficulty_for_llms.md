# Upwork-AIML/Conditional_Causal_Difficulty_for_LLMs

## Resumen

`Upwork-AIML/Conditional_Causal_Difficulty_for_LLMs` no es un modelo de lenguaje, sino el repositorio de código del artículo «Fragility Is Not Reducible to Hardness: Conditional Causal Difficulty for LLMs» (arXiv:2611.02065), desarrollado por investigadores de Upwork (Mohammad Reza Rezaei, Dingxian Wang, Nikhil Verma y Sajjad Pakdamansavoji). Su objetivo es medir y predecir la fragilidad de los LLM ante reescrituras que preservan el significado: cuántas veces una tarea que el modelo ya resuelve deja de resolverse cuando se reformula sin alterar su respuesta.

El trabajo introduce el concepto de dificultad causal condicional (CCD, *conditional causal difficulty*), definido como la probabilidad de que un «gemelo» generado por operadores deterministas (renombrar, reordenar, inyectar; sin intervención de otro LLM) rompa una tarea resoluble. A partir de ahí se define la dificultad residualizada por complejidad (CRD) y se entrena Frail-π, un predictor basado en un encoder DeBERTa-v3-base que estima la fragilidad directamente desde el enunciado original, sin necesidad de ejecutar reescrituras.

El repositorio incluye además dos benchmarks, GlassGSM (1.319 problemas de GSM8K) y GlassMATH (4.999 problemas de MATH), con sus gemelos y etiquetas generadas por gpt-4o-mini. Es relevante porque separa empíricamente la fragilidad de la dificultad: siete medidas de dureza distintas no superan 0,39 del techo de fiabilidad al ordenar CCD, lo que sugiere que la sensibilidad al fraseo es una propiedad distinta de la complejidad de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un LLM: repositorio de código con un predictor (Frail-π) basado en encoder DeBERTa-v3-base fine-tuneado, más baselines (VAP3, TF-IDF+SVD) |
| Parametros totales | No disponible (DeBERTa-v3-base tiene ~86M, pero no se confirma en la información) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los benchmarks son problemas GSM8K y MATH, en inglés) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repo tiene 0.0 GB; los datasets se distribuyen en Parquet) |

## Arquitectura y entrenamiento

El componente aprendido, Frail-π, es un encoder DeBERTa-v3-base fine-tuneado que recibe el texto del problema original y 24 sondas (*probes*) ex ante de cada problema base, y predice la probabilidad de que una reescritura que preserva la respuesta rompa la tarea. Las etiquetas se construyen de forma determinista: se toma un problema que el solver resuelve, se aplican operadores de reescritura (rename, reorder, inject) y se vuelve a resolver cada gemelo; CCD es la proporción de gemelos que fallan. El diseño empareja cada tarea con su propio gemelo, de modo que la comparación no está confundida por la complejidad.

El artículo argumenta que la complejidad actúa como modificador del efecto, no como confounder, y propone residualizarla (CRD). Los experimentos se ejecutan con etiquetas de gpt-4o-mini y se replican sobre otros solvers (Qwen3.7-plus, DeepSeek-v4-pro) con gemelos de dosis única (m = 9). El repositorio incluye scripts de conversión de los datasets, entrenamiento y evaluación (`scripts/fragility_report.py`, `scripts/run_frailpi_base.sh`), configuraciones y tests unitarios; requiere Python 3.10 o superior.

## Capacidades

- Predicción de fragilidad de tareas matemáticas a partir del enunciado original, sin ejecutar reescrituras.
- Medición de CCD y CRD sobre los benchmarks GlassGSM y GlassMATH.
- Generalización entre solvers: el predictor se entrena y evalúa sobre la CCD de cada solver por separado.
- Baselines incluidos: VAP3 y un featurizador TF-IDF+SVD para ejecución en CPU.
- Generación de gemelos mediante operadores deterministas (rename, reorder, inject), sin LLM.
- Evaluación con métrica de Spearman normalizada por el techo de fiabilidad.
- No incluye generación de texto, tool calling, agentes, visión ni audio: es infraestructura de evaluación.

## Casos de uso

- Auditoría de robustez de un LLM en producción: descargar GlassGSM, etiquetar con el solver propio y entrenar Frail-π para identificar qué problemas del conjunto son frágiles antes de desplegar.
- Curación eficiente de benchmarks: con un presupuesto del 5 % en GlassGSM, el predictor duplica el recall aleatorio de ítems frágiles y iguala un ranking oracle, lo que permite priorizar qué problemas revisar.
- Análisis de sensibilidad al fraseo en pipelines de evaluación: comparar la tasa de fallo de un modelo ante reformulaciones que preservan la respuesta frente a distractores tipo GSM-IC (44,9 % frente a 3,7 % de fragilidad en GlassGSM).
- Diagnóstico de fiabilidad por solver: ejecutar el pipeline sobre gpt-4o-mini, Qwen3.7-plus o DeepSeek-v4-pro para obtener la CCD específica de cada modelo y comparar su perfil de fragilidad.
- Investigación en evaluación de LLM: reutilizar los estimandos y scripts para estudiar si otras medidas de dificultad (entropía de respuesta, pass rate, longitud de solución) explican la fragilidad.
- Selección de datos de entrenamiento o ajuste: usar el ranking de fragilidad para equilibrar conjuntos de problemas hacia ítems que exponen debilidades reales del modelo.
- Reproducibilidad de experimentos: ejecutar los tests y configuraciones del repositorio para validar resultados en CPU (con `--featurizer tfidf_svd`) o GPU.

## Benchmarks y rendimiento

| Metrica | Frail-π | Mejor baseline (VAP3) |
|---|---|---|
| Fiabilidad relativa en GlassGSM | 0,613 ± 0,023 | 0,444 |
| Fiabilidad relativa en GlassMATH | 0,557 ± 0,023 | 0,463 |
| Recall de ítems frágiles a presupuesto del 5 % (GlassGSM) | Duplica el recall aleatorio, iguala ranking oracle | No disponible |
| Fiabilidad de siete medidas de dureza al ordenar CCD (GlassGSM) | — | ≤ 0,39 (0,36 combinadas en modelo lineal) |
| Frail-π tras parcializar las siete medidas de dureza | 0,47 | — |

## Requisitos de hardware

- GPU necesaria para la configuración base (DeBERTa-v3-base fine-tuneado más 24 sondas): se recomienda una GPU con al menos 8-16 GB de VRAM, aunque el dato exacto no está disponible en la información proporcionada.
- Ejecución en CPU posible con `--featurizer tfidf_svd --seeds 0`, con números inferiores a los del artículo.
- No se especifican GPUs concretas (A100, H100, RTX 4090) ni latencias o throughput estimados.
- Despliegue mediante el propio repositorio (`pip install -e ".[hf,openai,dev]"`), no mediante vLLM, llama.cpp u Ollama, al no ser un modelo generativo.
- Los datasets se descargan con `hf download` y se leen en Parquet; el repositorio en sí ocupa 0.0 GB.

## Comparativa con modelos similares

| Modelo / trabajo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Conditional Causal Difficulty (este repo) | Predictor de fragilidad + benchmarks | No disponible | No disponible | 0,613 / 0,557 de fiabilidad relativa | No disponible |
| VAP3 (baseline) | Predictor de dificultad | No disponible | No disponible | 0,444 / 0,463 | No disponible |
| Medidas de dureza (entropía, pass rate, etc.) | Baselines de ranking | No aplica | No aplica | ≤ 0,39 | No disponible |

No se dispone de información sobre otros trabajos comparables fuera de los baselines citados en el artículo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse para inferencia generativa; es código de investigación y evaluación.
- Las etiquetas principales se generan con gpt-4o-mini; la generalización a otros solvers se valida por separado y puede no transferirse directamente.
- Los resultados con etiquetas greedy (temperatura 0, una muestra) no están en la misma escala que los resultados principales.
- Los benchmarks son problemas matemáticos (GSM8K y MATH) en inglés; no hay evidencia de comportamiento en otros dominios o idiomas.
- La licencia no está declarada en la información disponible, por lo que el uso comercial queda sin garantías y requiere consulta al autor.
- El repositorio tiene 0 descargas y 0 likes, y los pesos o artefactos no están incluidos (tamaño 0.0 GB); la reproducibilidad depende de descargar los datasets externos.
- El split debe hacerse por `base_id`, nunca por fila, para evitar fuga de información entre gemelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Upwork-AIML/Conditional_Causal_Difficulty_for_LLMs
- Artículo: https://arxiv.org/abs/2611.02065
- Dataset GlassGSM: https://huggingface.co/datasets/reza2ei/GlassGSM
- Dataset GlassMATH: https://huggingface.co/datasets/reza2ei/GlassMATH
- Documentación interna: `docs/DETAILS.md` (referencia completa de estimandos, pasos y opciones de configuración)
