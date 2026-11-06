# Squezilia/xlm-r-r4s-large

## Resumen

`Squezilia/xlm-r-r4s-large` es un codificador transformer multilingüe de 563 millones de parámetros construido sobre `FacebookAI/xlm-roberta-large` y afinado para una tarea de clasificación multitarea: enrutamiento de prompts y guardarraíl de seguridad. Lo desarrolla el usuario Squezilia y se publica bajo licencia CC BY 4.0. Su propuesta es resolver en una sola pasada hacia delante lo que normalmente requiere encadenar varios modelos especializados (moderación, clasificador de dominio y estimador de dificultad).

El modelo comparte un backbone XLM-RoBERTa-Large de 24 capas (`hidden_size` 1024, `intermediate_size` 4096, 16 cabezas de atención) y añade cuatro cabezas de clasificación independientes sobre el token `<s>` (`[CLS]`): seguridad binaria, necesidad de razonamiento, categoría de dominio (13 clases) y nivel de complejidad (8 clases). Está entrenado sobre el dataset `Squezilia/Route4Secure`, con 130.050 prompts en 12 idiomas.

Es relevante para arquitecturas de enrutamiento de LLM (model routing), sistemas de guardarraíles en producción y despliegue en el borde, ya que ofrece versiones ONNX y cuantizadas (FP16, INT8, Q4) y una única inferencia para cuatro señales de decisión. La model card declara métricas medias de 0,8352 de accuracy y 0,8106 de Macro F1 entre las cuatro cabezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-Large) con 4 cabezas de clasificación multitarea |
| Parametros totales | 563.064.857 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (XLM-RoBERTa soporta hasta 512 tokens) |
| Tipos de cuantizacion | FP16, INT8, Q4 (ONNX); safetensors en precision completa |
| Idiomas soportados | ar, de, en, es, fr, hi, it, ja, ko, nl, th, zh |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer clásico basado en XLM-RoBERTa-Large: 24 capas, dimensión oculta de 1024, capa intermedia de 4096 y 16 cabezas de atención. Sobre la representación del token `<s>` se aplican cuatro cabezas independientes con dropout (p = 0,1): `head_safe` (1024 → 2), `head_category` (1024 → 13), `head_level` (1024 → 8) y `head_reasoning` (1024 → 2). El modelo requiere `trust_remote_code` por el uso de código personalizado (`custom_code`).

El entrenamiento se realizó sobre el dataset `Squezilia/Route4Secure`, compuesto por 130.050 prompts en 12 idiomas, con aprendizaje multitarea. La model card menciona optimizaciones de hardware en el procedimiento de entrenamiento, pero no se detalla en la información disponible el número exacto de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a un encoder de clasificación). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal, que no corresponden a este tipo de arquitectura.

## Capacidades

- Clasificación de seguridad binaria: distingue prompts `SAFE` frente a `UNSAFE` (contenido dañino, adversarial o que viola políticas).
- Detección de necesidad de razonamiento: clasifica si un prompt requiere deducción multi-paso (Chain-of-Thought) o puede responderse directamente (`DIRECT` vs. `REASONING`).
- Enrutamiento de dominio: clasifica el prompt en 13 categorías funcionales (por ejemplo, `Coding & Software`, `Mathematics`, `Information & Science`, `Security & Hijack`).
- Estimación de complejidad: asigna un nivel de dificultad de `Level_0` (saludos triviales) a `Level_7` (matemáticas de competición y arquitectura de sistemas).
- Multilingüe: cubre 12 idiomas (árabe, alemán, inglés, español, francés, hindi, italiano, japonés, coreano, neerlandés, tailandés y chino).
- Extracción de características: el pipeline es `feature-extraction`/`text-classification`, por lo que puede usarse como encoder para otras tareas.
- No es un modelo generativo: no produce texto, sino etiquetas de clasificación. No soporta tool calling ni razonamiento agéntico generativo por sí mismo.

## Casos de uso

- Enrutamiento de prompts en producción: una única pasada clasifica seguridad, dominio, complejidad y necesidad de razonamiento, permitiendo decidir a qué LLM (pequeño o grande) enviar cada consulta y ahorrar coste computacional.
- Guardarraíl de seguridad previo a un LLM: filtrar prompts `UNSAFE` antes de que lleguen al modelo generativo, con una accuracy declarada del 92,24 % en la cabeza de seguridad.
- Enrutamiento por dominio: dirigir consultas de `Coding & Software` o `Mathematics` a modelos especializados o a herramientas concretas, aprovechando el F1 de hasta 94,71 % en matemáticas y 89,81 % en código.
- Selección de nivel de esfuerzo: usar la estimación de complejidad (`Level_0` a `Level_7`) para asignar presupuesto de cómputo o activar modos de razonamiento extendido solo en prompts complejos.
- Detección de necesidad de CoT: decidir si se activa razonamiento multi-paso en el LLM de destino, reduciendo latencia en consultas directas (accuracy del 93,53 %).
- Despliegue en el borde: las versiones ONNX cuantizadas (FP16, INT8, Q4) permiten ejecutar el clasificador en dispositivos con recursos limitados o en pasarelas de API de baja latencia.
- Moderación multilingüe: aplicar el guardarraíl en 12 idiomas sin necesidad de modelos separados por idioma.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validación de `Squezilia/Route4Secure` (no verificados):

| Metrica | Valor |
|---|---|
| Mean Macro F1 (4 cabezas) | 0,8106 |
| Mean Accuracy (4 cabezas) | 0,8352 |
| Safety Accuracy | 0,9224 |
| Safety Macro F1 | 0,9210 |
| Reasoning Accuracy | 0,9353 |
| Reasoning Macro F1 | 0,9152 |
| Category Accuracy | 0,7714 |
| Category Macro F1 | 0,6826 |
| Complexity Level Accuracy | 0,7116 |
| Complexity Level Macro F1 | 0,7235 |

La model card menciona además F1 de hasta 94,71 % en `Mathematics`, 89,81 % en `Coding & Software` y 90,62 % en `Level_7`. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 2,2 GB para los pesos (563 M parámetros); en FP16, en torno a 1,1 GB; en INT8, unos 0,6 GB; en Q4, aproximadamente 0,3 GB. El consumo real depende de la longitud de secuencia y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100, H100 o RTX 4090 para lotes grandes y alto throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, especialmente con cuantización INT8 o Q4.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (versiones FP16, INT8 y Q4), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Squezilia/xlm-r-r4s-large | 563 M | no disponible | Clasificación multitarea (seguridad, dominio, complejidad, razonamiento) | CC BY 4.0 |
| FacebookAI/xlm-roberta-large | 560 M | 512 tokens | Masked LM / encoder general | MIT |
| Modelos de moderación monolingües (p. ej. clasificadores de toxicidad) | variable | variable | Clasificación de seguridad | variable |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados (`verified: false`), por lo que deben tomarse con cautela.
- La cabeza de categoría tiene el rendimiento más bajo (Macro F1 0,6826), lo que puede provocar enrutamientos erróneos en dominios ambiguos.
- La estimación de complejidad es la segunda más débil (Macro F1 0,7235); los niveles intermedios pueden confundirse.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos negativos en seguridad: un prompt dañino clasificado como `SAFE` podría pasar el guardarraíl.
- Sesgos potenciales derivados del dataset de entrenamiento (`Squezilia/Route4Secure`), cuya composición y método de anotación no se detallan en la información disponible.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero conviene revisar las condiciones de atribución en producción.
- Requiere `trust_remote_code` por el código personalizado, lo que implica ejecutar código del autor; auditar antes de desplegar.
- La longitud de contexto no se especifica en la información disponible; XLM-RoBERTa-Large está limitado a 512 tokens, lo que restringe prompts largos.

## Enlaces

- [Hugging Face: Squezilia/xlm-r-r4s-large](https://huggingface.co/Squezilia/xlm-r-r4s-large)
- [Modelo base: FacebookAI/xlm-roberta-large](https://huggingface.co/FacebookAI/xlm-roberta-large)
- [Dataset: Squezilia/Route4Secure](https://huggingface.co/datasets/Squezilia/Route4Secure)
