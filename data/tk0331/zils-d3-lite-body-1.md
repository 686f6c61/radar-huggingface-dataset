# tk0331/zils-d3-lite-body-1

## Resumen

`tk0331/zils-d3-lite-body-1` es un checkpoint derivado de `Cialtion/SimpleTool-Qwen3.5-0.8B-8Head-5pct-BF16`, un ajuste fino de Qwen3.5-0.8B orientado a la generación estructurada de llamadas a herramientas (*tool calling*). El autor original del ajuste es Cialtion; este repositorio, publicado por tk0331, se limita a reempaquetar los pesos con nombres de tensor correspondientes al modelo completo de Qwen3.5 y almacenarlos en bfloat16. Según la model card, los pesos del modelo de lenguaje son idénticos a los del checkpoint original.

El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) y una arquitectura transformer densa heredada de Qwen3.5-0.8B. Su particularidad es una cabeza de decodificación múltiple con ocho ramas lógicas independientes (`content`, `function`, `arg1` a `arg6`) que comparten el mismo backbone y generan de forma autorregresiva por separado. Esto permite emitir en un solo paso la función seleccionada y hasta seis argumentos con tipos y valores literales estrictos.

Es relevante ahora porque aborda un problema concreto en pipelines de agentes: la fiabilidad de las llamadas a herramientas en modelos pequeños. El checkpoint reporta un 37,625 % de llamadas completas correctas y un 91,625 % de acierto en el nombre de función sobre un diagnóstico sintético propio de 800 casos bilingües (chino e inglés), aunque el propio autor advierte que esa medición corresponde a una ejecución INT4/FP16 y no al artefacto BF16 publicado. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5) con cabeza de ocho ramas lógicas para tool calling |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (formato almacenado); se mencionan ejecuciones de referencia en INT4/FP16 y soporte de FP8 con cómputo BF16 |
| Idiomas soportados | No disponible en la ficha; el diagnóstico del modelo base es bilingüe chino-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de aproximadamente 0,85 mil millones de parámetros. Sobre ese backbone, el ajuste SimpleTool introduce ocho ramas lógicas que comparten los pesos del modelo y decodifican de forma autorregresiva independiente: una rama `content`, una rama `function` y seis ramas de argumentos (`arg1` a `arg6`). El checkpoint corresponde al paso de entrenamiento 2474 y a un esquema de datos de entrenamiento del 5 % (fracción de datos del proyecto, no un porcentaje de poda del modelo). No requiere LoRA externo ni checkpoint base adicional.

El artefacto publicado conserva tensores de estado en FP32 designados y el tokenizador entrenado, junto con los 17 tokens especiales de apertura, cierre y nulo. La model card no detalla el volumen total de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La evaluación del modelo base se realizó con muestreo greedy (temperatura 0, semilla 1107, máximo de 128 tokens generados por cabeza activa) y protocolo de prompt directo. Para modelos de 9B o superiores se documenta un protocolo alternativo con bloque `<think>` vacío explícito; sustituir el prompt sin más invalida la comparación con las puntuaciones registradas.

## Capacidades

- Generación estructurada de llamadas a herramientas: selección de función y hasta seis argumentos con tipos estrictos y valores literales.
- Decodificación multi-rama: las ramas de función y argumentos se generan en paralelo lógico sobre un prefijo compartido, con marcadores de cierre específicos del tokenizador.
- Manejo de slots omitidos mediante el token especial `<|null|>`.
- Soporte bilingüe chino-inglés en el diagnóstico del modelo base (400 casos por idioma).
- Capacidad de razonamiento previo opcional mediante bloque `<think>` en los protocolos documentados para modelos mayores.
- Componentes visuales heredados del export de origen, aunque no se reporta benchmark visual de la release.
- No se documentan capacidades de tool calling genérico fuera del esquema de ocho ramas, ni soporte de agentes multi-paso verificado.

## Casos de uso

- Enrutamiento de funciones en asistentes conversacionales: el modelo selecciona la función adecuada entre un catálogo de herramientas y rellena los argumentos obligatorios, lo que permite construir un despachador de intenciones con validación posterior de tipos antes de ejecutar cualquier acción.
- Extracción de parámetros en formularios y APIs: las seis ramas de argumentos permiten mapear campos de una interfaz estructurada (por ejemplo, una reserva con fecha, hora, número de personas y ubicación) respetando el orden de `properties` y `required` del esquema.
- Automatización de tareas de soporte técnico: con un catálogo de herramientas acotado (consulta de estado, creación de ticket, escalado), el modelo propone la llamada y un orquestador valida y ejecuta, reduciendo el coste frente a modelos de mayor tamaño.
- Prototipado rápido en local: al tratarse de un modelo de 0,85B en BF16 (1,7 GB de repositorio), cabe en GPU de consumo y permite iterar sobre esquemas de herramientas sin infraestructura dedicada.
- Generación de borradores de llamadas en pipelines de CI/CD: el cliente `infer_heads.py` imprime propuestas de llamada sin ejecutar herramientas, lo que sirve para tests de regresión de esquemas y contratos de API.
- Investigación sobre decodificación multi-cabeza: la separación en ramas independientes sobre un backbone compartido es un objeto de estudio útil para analizar el compromiso entre latencia de generación y precisión de argumentos en modelos pequeños.
- Filtrado y preetiquetado de datos de tool calling: el modelo puede proponer llamadas sobre corpus sintéticos o reales para su revisión humana posterior, dado su coste computacional reducido.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al checkpoint de entrenamiento del 5 % evaluado en INT4/FP16, no al artefacto BF16 de este repositorio, que según el autor no ha sido evaluado de forma independiente en inferencia.

| Conjunto de evaluación | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 112 | 200 |
| Contrafactual inglés | 113 | 200 |
| Difícil bilingüe | 52 | 200 |
| Multi-argumento bilingüe | 24 | 200 |
| **Total de llamadas requeridas** | **301 (37,625 %)** | **800** |
| Solo nombre de función | 733 (91,625 %) | 800 |

Estos resultados proceden de un conjunto sintético propio (SimpleTool Diagnostic 800), con registros emparejados correlacionados y posibles errores residuales en las etiquetas. No constituyen un benchmark oficial tipo BFCL o Mobile Actions ni establecen una ley de escala controlada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y caché KV; el contexto no está documentado, por lo que el consumo de caché no puede estimarse con precisión.
- Cuantizaciones INT4/FP16 mencionadas en las ejecuciones de referencia del modelo base, aptas para GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) para BF16; A100 o H100 no son necesarias por tamaño, aunque pueden emplearse para servir múltiples instancias.
- Despliegue: se requiere un backend compatible con la arquitectura Qwen3.5/Qwen3.6 y el formato de cuantización del checkpoint. La model card no confirma compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI.
- Para FP8 se recomienda cómputo BF16; el autor documenta un desbordamiento en el intermedio de expertos compartidos con FP16 en un modelo de 397B, resuelto con BF16.
- No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| zils-d3-lite-body-1 (este) | 852.985.920 | No disponible | Tool calling con ocho ramas | Apache 2.0 |
| Cialtion/SimpleTool-Qwen3.5-0.8B-8Head-5pct-BF16 | No disponible (base 0.8B) | No disponible | Tool calling con ocho ramas | Apache 2.0 |
| Qwen3.5-0.8B | ~0,8B | No disponible | Modelo generalista | No disponible en esta ficha |

No se dispone de datos de benchmarks comparables de terceros en la información proporcionada; la comparación con alternativas de la misma categoría queda limitada a los dos modelos citados.

## Limitaciones y advertencias

- El artefacto BF16 no ha sido evaluado de forma independiente en inferencia; la puntuación de 37,625 % corresponde a una ejecución INT4/FP16 del checkpoint de entrenamiento y no debe atribuirse a este repositorio.
- Los benchmarks son sintéticos, locales al proyecto y bilingües chino-inglés; no hay evidencia de rendimiento en otros idiomas ni en usuarios reales.
- El 37,625 % de llamadas completas correctas implica que aproximadamente seis de cada diez llamadas fallan en al menos un argumento; es imprescindible validar las llamadas antes de ejecutarlas.
- El orden de `properties` y `required` en el esquema condiciona la vinculación de las ramas `arg1` a `argN`; un esquema mal ordenado degrada la precisión.
- Las cabezas de argumentos no se condicionan a la función recién generada, lo que puede producir argumentos incoherentes con la función seleccionada.
- No se documentan sesgos conocidos, riesgo de alucinación específico ni limitaciones de contexto; la longitud de contexto no está disponible.
- La licencia Apache 2.0 permite uso comercial, pero la licencia del dataset de diagnóstico es independiente (CC BY 4.0) y debe respetarse por separado.
- El autor no garantiza una única operación física de prefill compartido ni ofrece resultados de velocidad; no debe asumirse una ventaja de latencia sin medirla.
- Se requiere un backend que soporte la arquitectura Qwen3.5/Qwen3.6; la compatibilidad con herramientas de inferencia habituales no está confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tk0331/zils-d3-lite-body-1
- Modelo base: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-0.8B-8Head-5pct-BF16
- Dataset de diagnóstico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Contrato de servicio (INFERENCE.md): incluido en el repositorio del modelo base
- Cliente de inferencia (infer_heads.py): incluido en el repositorio del modelo base
