# zahidazam714/qwen3.5-9b-khowar-cpt-lora

## Resumen

El modelo `zahidazam714/qwen3.5-9b-khowar-cpt-lora` es un adaptador LoRA (entrenado con QLoRA de 4 bits) para el modelo base `unsloth/Qwen3.5-9B-Base`, desarrollado por el usuario de Hugging Face zahidazam714. Su proposito es el preentrenamiento continuado (continued pretraining, CPT) sobre texto en khowar (codigo ISO `khw`), una lengua indoaria de la familia dardica hablada principalmente en el norte de Pakistan, considerada de bajos recursos. El adaptador anade conocimiento linguistico de este idioma al modelo base sin reentrenar todos los parametros.

El adaptador se ha entrenado sobre aproximadamente 1,05 millones de tokens de khowar procesados con el tokenizador de Qwen, durante 2 epocas y 248 pasos de optimizador, usando una sola GPU Tesla T4 (entorno Kaggle) en precision fp16 con la base cuantizada en NF4 de 4 bits. La configuracion LoRA emplea rango 32, alpha 64, dropout 0,05 y `target_modules=all-linear`, con longitud de bloque de 512 y batch efectivo de 16 bloques. La perdida de evaluacion en el conjunto reservado es 2,563, con una perplejidad de 12,97 sobre 61 bloques.

Es relevante porque aborda un caso tipico de adaptacion a lenguas de bajos recursos con recursos de computo minimos (una T4 de 16 GB), demostrando que es viable especializar un modelo de 9B en un idioma con escasa presencia en los corpus de preentrenamiento. No obstante, se trata de un adaptador de estilo base, sin plantilla de chat ni ajuste por instrucciones, y con cero descargas y cero likes en el momento de la consulta, por lo que debe considerarse un artefacto de investigacion temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: Qwen3.5-9B-Base) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base se denomina 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud de bloque de entrenamiento: 512 tokens) |
| Tipos de cuantizacion | QLoRA NF4 de 4 bits para el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | khowar (`khw`) como idioma objetivo del CPT; capacidades del modelo base no detalladas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de tipo PEFT que se carga sobre `unsloth/Qwen3.5-9B-Base`, un transformer decoder-only de la familia Qwen 3.5. El adaptador se ha entrenado con QLoRA: la base se carga en cuantizacion NF4 de 4 bits y los adaptadores se entrenan en fp16. La configuracion LoRA es r=32, alpha=64, dropout=0,05 y `all-linear` como modulos objetivo, lo que aplica adaptadores a todas las capas lineales. El entrenamiento se realizo en una unica Tesla T4 (Kaggle) con longitud de bloque de 512, batch efectivo de 16 bloques, 2 epocas (248 pasos de optimizador) y tasa de aprendizaje 1e-4 con scheduler coseno.

El objetivo es preentrenamiento continuado sobre texto en khowar (aproximadamente 1,05 millones de tokens Qwen), sin ajuste por instrucciones ni plantilla de chat. La evaluacion reservada reporta perdida 2,563 y perplejidad 12,97 sobre 61 bloques. No se detalla la composicion del corpus, la procedencia de los datos, ni si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal. Tampoco se especifica el numero de parametros entrenables del adaptador ni el tamano exacto del modelo base mas alla de la etiqueta "9B".

## Capacidades

- Preentrenamiento continuado en khowar: el adaptador esta disenado para mejorar la modelizacion del idioma khowar sobre el modelo base.
- Generacion de texto en estilo base: al no tener plantilla de chat ni ajuste por instrucciones, no se debe esperar un comportamiento conversacional fiable.
- Modelizacion de lenguaje: util para calcular perplejidad, completar texto y tareas de continuacion en khowar.
- Capacidades heredadas del modelo base: no se documentan en la model card; se desconoce el alcance real de razonamiento, codigo, matematicas o multilingueismo tras el CPT.
- Tool calling / function calling: no disponible (no documentado; el adaptador no esta ajustado por instrucciones).
- Agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion en lenguas de bajos recursos: punto de partida para estudiar el efecto del CPT en khowar sobre un modelo de 9B, comparando perplejidad antes y despues del adaptador.
- Modelizacion de lenguaje y evaluacion: calculo de perplejidad o scoring de texto en khowar para corpus linguisticos o datasets de validacion.
- Generacion asistida de texto en khowar: continuacion de frases o parrafos en tareas de redaccion, siempre con revision humana dado el caracter base del adaptador.
- Construccion de datasets sinteticos: generacion de texto en khowar para aumentar corpus de entrenamiento de otros modelos o sistemas, con filtrado posterior.
- Punto de partida para ajuste por instrucciones: el adaptador puede servir como inicializacion para un posterior SFT o DPO en khowar, aprovechando el conocimiento linguistico ya inyectado.
- Experimentos de bajo coste en hardware consumer: reproducible en una unica T4, lo que permite replicar o extender el entrenamiento en entornos academicos con recursos limitados.
- Normalizacion y correccion ortografica asistida: uso como modelo de lenguaje para detectar secuencias improbables en texto khowar, con las cautelas propias de un modelo no ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la evaluacion de validacion del CPT:

| Metrica | Valor | Conjunto |
|---|---|---|
| Perdida (loss) | 2,563 | 61 bloques reservados |
| Perplejidad | 12,97 | 61 bloques reservados |

## Requisitos de hardware

- VRAM estimada para inferencia: con la base en NF4 de 4 bits, en torno a 6-7 GB para los pesos mas overhead de activaciones y contexto; en fp16, aproximadamente 18-20 GB para el modelo base de 9B mas el adaptador.
- GPU recomendadas: Tesla T4 (16 GB) valida para el entrenamiento QLoRA realizado; para inferencia en fp16 se recomienda A100 40 GB, H100 o RTX 4090 (24 GB).
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en fp16 y en GPUs de 8-16 GB con cuantizacion de 4 bits (RTX 3060/4060 Ti, T4).
- Opciones de despliegue: transformers + peft (ruta documentada en la model card); para servir en produccion seria necesario fusionar el adaptador con la base y exportar a GGUF o usar vLLM/TGI, aunque no se documenta compatibilidad explicita.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zahidazam714/qwen3.5-9b-khowar-cpt-lora | Adaptador sobre base 9B | no disponible | Apache 2.0 | CPT en khowar, sin instruction tuning |
| unsloth/Qwen3.5-9B-Base | 9B | no disponible | no disponible en la informacion | Modelo base sin adaptar; no especializado en khowar |
| Otros adaptadores CPT para lenguas de bajos recursos | Variable | Variable | Variable | No se dispone de comparaciones publicadas en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Es un adaptador de estilo base: no incluye plantilla de chat ni ajuste por instrucciones, por lo que su uso conversacional directo producira resultados pobres o incoherentes.
- Riesgo de alucinacion: como cualquier modelo de lenguaje sin alineamiento, puede generar texto plausible pero incorrecto en khowar.
- Sesgos: el corpus de CPT no esta documentado; pueden persistir sesgos del modelo base y del corpus khowar utilizado.
- Cobertura limitada: solo se declara el idioma `khw`; el resto de capacidades depende del modelo base y no se evalua tras el CPT.
- Contexto de entrenamiento corto: bloques de 512 tokens, lo que puede limitar el rendimiento en documentos largos.
- Datos de entrenamiento escasos: aproximadamente 1,05 millones de tokens y 2 epocas; el conocimiento linguistico adquirido puede ser limitado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `unsloth/Qwen3.5-9B-Base` tiene su propia licencia que debe verificarse por separado.
- Madurez: cero descargas y cero likes; sin validacion externa ni benchmarks publicos.
- Reproducibilidad: entrenado en una unica T4 de Kaggle; no se detalla la semilla ni el pipeline de datos.

## Enlaces

- Hugging Face: https://huggingface.co/zahidazam714/qwen3.5-9b-khowar-cpt-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B-Base
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
