# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_42_DoRA_Qwen3-8b

## Resumen

WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_42_DoRA_Qwen3-8b es un adaptador de tipo DoRA (weight-decomposed low-rank adaptation) publicado por el usuario WijewardhanaNT sobre el modelo base Qwen/Qwen3-8B-Base. Se distribuye como pesos PEFT en safetensors dentro de un repositorio de 0,7 GB, con pipeline declarado de text-generation y sin licencia ni idiomas indicados en la model card, que permanece prácticamente como la plantilla vacía de HuggingFace.

El identificador del repositorio permite deducir el propósito: ajuste fino supervisado sobre el corpus XNLI (inferencia de relación textual, tres etiquetas: implicación, contradicción y neutralidad) en inglés y urdu, con un subconjunto de 5.000 ejemplos y un porcentaje de datos anotado como "1_42". No se especifica si ese porcentaje corresponde al porcentaje del dataset completo, a la proporción de ejemplos en urdu o a otra partición.

Su relevancia es acotada y fundamentalmente experimental: sirve como referencia reproducible para estudiar el ajuste paramétricamente eficiente en tareas de NLI bilingüe inglés-urdu sobre un modelo base de 8B sin post-entrenamiento conversacional. El repositorio no incluye hiperparámetros, métricas de evaluación ni documentación de uso, por lo que cualquier reutilización exige validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (descomposición en magnitud y dirección, con LoRA aplicado a la componente direccional) sobre un transformer denso decoder-only (Qwen3-8B-Base) |
| Parametros totales | Del adaptador: no disponible (repositorio de 0,7 GB). Del modelo base: ~8,2 mil millones |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen3-8B admite 32.768 tokens nativos (hasta 131.072 con escalado YaRN) |
| Tipos de cuantizacion | No disponible. El adaptador se publica en safetensors para PEFT; para cuantizarlo (GPTQ, AWQ, GGUF) hay que fusionarlo antes con el modelo base |
| Idiomas soportados | No disponible en la model card; el identificador del repositorio indica inglés y urdu (dataset XNLI) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería peft 0.17.1) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B-Base: un transformer decoder-only denso de aproximadamente 8,2 mil millones de parámetros, con atención por consultas agrupadas (GQA), normalización RMSNorm y embeddings rotatorios, preentrenado sobre del orden de 36 billones de tokens en 119 idiomas. El adaptador sigue la formulación DoRA, que descompone cada matriz de pesos preentrenada en un componente de magnitud y otro de dirección y aplica la actualización de bajo rango únicamente sobre la dirección; según el artículo original esto mejora la estabilidad del ajuste y acerca el comportamiento del adaptador al de un ajuste fino completo con menos parámetros entrenables.

Los datos de entrenamiento, según el propio identificador y las etiquetas del repositorio, corresponden a XNLI en inglés y urdu con 5.000 ejemplos. La model card no documenta hiperparámetros (rango del adaptador, alpha, dropout, tasa de aprendizaje, épocas), composición exacta del dataset, ni si hubo etapas de RLHF, DPO o ajuste con instrucciones. Tampoco se declara ninguna innovación técnica adicional más allá del uso de DoRA sobre un modelo base no conversacional.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3-8B-Base (no es un modelo instruct, por lo que no sigue instrucciones de forma fiable sin ingeniería de prompts específica).
- Clasificación de relación textual (NLI) sobre pares premisa-hipótesis, presumiblemente para las etiquetas de XNLI (implicación, neutralidad y contradicción), ya sea mediante generación de la etiqueta o mediante la cabeza de clasificación que el autor haya añadido.
- Procesamiento de inglés y urdu, según el subconjunto declarado en el nombre del repositorio, aunque no se documenta el rendimiento por idioma.
- Transferencia entre idiomas potencial: al compartir adaptador para ambos idiomas, puede evaluarse la generalización de inglés a urdu y viceversa.
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito. Cualquier capacidad de este tipo dependería del modelo base y del prompt, no del adaptador.
- Capacidades multilingües amplias solo en la medida en que lo permita Qwen3-8B-Base; el adaptador no fue entrenado para preservarlas ni se evaluó su degradación.

## Casos de uso

- Clasificación de implicación textual en inglés y urdu: el modelo puede etiquetar pares premisa-hipótesis en tareas de atribución de significado natural, con la salvedad de que la ausencia de métricas publicadas obliga a medir exactitud, precisión y recall por clase antes de usarlo en producción.
- Investigación en ajuste paramétricamente eficiente: sirve como punto de partida reproducible para comparar DoRA frente a LoRA convencional en una tarea de clasificación bilingüe con 5.000 ejemplos, variando rango, alpha y proporción de datos.
- Filtrado de recuperación aumentada (RAG): un clasificador de implicación permite descartar fragmentos recuperados que contradicen la consulta o que no la respaldan, reduciendo el ruido antes de la generación final.
- Anotación asistida de corpus multilingües: preetiquetar pares de frases en urdu para revisión humana posterior, con umbral de confianza alto y muestreo para control de calidad.
- Verificación de consistencia documental: detectar contradicciones entre secciones de un mismo documento o entre versiones de una política interna, tratando cada par de fragmentos como un caso de NLI.
- Evaluación de robustez lingüística: analizar cómo se degrada la precisión de NLI en urdu respecto al inglés, dado que el adaptador se entrenó con ambos idiomas sin documentar el reparto de ejemplos.
- Docencia y replicación de experimentos: ejemplo mínimo para ilustrar el ciclo completo de cargar un adaptador PEFT sobre un modelo base, fusionarlo y convertirlo a GGUF para despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye la sección de evaluación sin rellenar y no aporta cifras de exactitud en XNLI, F1 por clase, perplejidad ni comparación con el modelo base sin adaptador. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- El adaptador ocupa 0,7 GB, pero la inferencia requiere cargar el modelo base Qwen3-8B completo; el adaptador por sí solo no es utilizable.
- VRAM en bf16/fp16: en torno a 16-17 GB solo para pesos, más caché KV; con contexto de 32.768 tokens conviene reservar 20-24 GB.
- Cuantización de 8 bits: aproximadamente 9-10 GB. Cuantización de 4 bits: aproximadamente 5-6 GB, con pérdida de precisión que debe medirse en la tarea.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S 48 GB cubren con holgura el modelo en bf16 y permiten lotes grandes o contextos largos.
- GPU de consumo: RTX 4090, RTX 3090 y RTX 5090 (24-32 GB) ejecutan el modelo en bf16; RTX 4080 y RTX 4060 Ti de 16 GB requieren cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers con PEFT para fusionar o cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en caliente (conviene verificar compatibilidad de DoRA tras la fusión); llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de tamaño de lote probado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en NLI EN/UR |
|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Qwen3-8B-Base) | Adaptador sobre ~8,2B | 32.768 tokens en el base (131.072 con YaRN) | No disponible | HuggingFace, 0 descargas | No publicado |
| Qwen/Qwen3-8B-Base | ~8,2B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | HuggingFace, muy descargado | No ajustado a NLI; referencia de partida para comparar la ganancia del adaptador |
| Qwen/Qwen3-8B (post-entrenado) | ~8,2B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | HuggingFace | Puede resolver NLI por prompt zero-shot, sin entrenamiento específico en urdu |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 (salvo la variante de 3B) | HuggingFace | Alternativa multilingüe por prompt; no especializada en NLI |

No se dispone de comparativas cuantitativas: al no existir métricas publicadas para el adaptador, la comparación se limita a parámetros, contexto, licencia y disponibilidad. Cualquier comparación de exactitud exigiría evaluar los cuatro modelos sobre el mismo subconjunto de XNLI.

## Limitaciones y advertencias

- La licencia no está declarada. Aunque Qwen3-8B-Base se distribuye bajo Apache 2.0, la ausencia de licencia explícita en este repositorio impide asumir que el adaptador sea reutilizable con fines comerciales; hay que contactar con el autor.
- La model card es la plantilla por defecto de HuggingFace, sin descripción, datos de entrenamiento, hiperparámetros, instrucciones de uso ni contacto. La reproducibilidad es nula con la información disponible.
- Solo 5.000 ejemplos de entrenamiento, con un porcentaje de datos poco claro en el nombre; riesgo alto de sobreajuste y de mal comportamiento fuera de la distribución de XNLI.
- El modelo base es la variante Base, no instruida: no sigue instrucciones de formato de forma fiable y puede requerir plantillas específicas para producir etiquetas válidas.
- Riesgo de alucinación inherente a un modelo generativo de 8B; si se usa generando la etiqueta, hay que validar y normalizar la salida (por ejemplo, mapear a un conjunto cerrado de tres clases).
- Cobertura de urdu no documentada: no se indica el reparto de ejemplos entre inglés y urdu, ni el tokenizador o el tratamiento de la escritura árabe-nastaliq; el rendimiento en urdu puede ser muy inferior al del inglés.
- El repositorio no registra descargas ni validación por parte de terceros, por lo que no existe evidencia externa de calidad.
- La etiqueta arxiv:1910.09700 del repositorio corresponde al artículo del calculador de impacto ambiental de Lacoste et al., incluido por defecto en la plantilla; no es una referencia técnica del modelo.
- No hay información sobre sesgos demográficos, geográficos o lingüísticos del ajuste, más allá de los heredados del preentrenamiento de Qwen3.
- Si se cuantiza a 4 bits para despliegue en hardware de consumo, hay que repetir la evaluación: la pérdida de precisión puede afectar de forma desigual a las tres clases de NLI.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_42_DoRA_Qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Variante post-entrenada de referencia: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Artículo de DoRA (Weight-Decomposed Low-Rank Adaptation): https://arxiv.org/abs/2402.09353
- Artículo de XNLI (Cross-lingual Natural Language Inference): https://arxiv.org/abs/1809.05053
- Librería PEFT: https://github.com/huggingface/peft
- Artículo citado en las etiquetas del repositorio (calculador de impacto ambiental, no relacionado con el modelo): https://arxiv.org/abs/1910.09700
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: únicamente aparecieron páginas de noticias en hindi sobre el estado de Bihar, sin relación con el adaptador ni con Qwen3.
