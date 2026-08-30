# suko/subtitle-linebreak-bilingual

## Resumen

`suko/subtitle-linebreak-bilingual` es un clasificador de texto bilingüe (chino tradicional e inglés) que predice dónde debe producirse un salto de línea en una frase transcrita para subtítulos, replicando la decisión que tomaría un editor humano de subtítulos. El modelo fue desarrollado por el usuario `suko` como componente local del editor de subtítulos Cap de SZ.ws, con el objetivo de evitar el coste y la latencia de enviar el texto a un LLM externo. Su relevancia radica en que un único archivo cubre ambos idiomas, incluido el code-switching (mezcla de chino e inglés), un caso frecuente en el contenido de YouTube taiwanés.

La arquitectura se basa en el encoder `voidful/albert_chinese_base` (ALBERT, 12 capas, tamaño oculto 768, 10,55 millones de parámetros gracias al weight sharing entre capas). Sobre la representación del token se concatena una característica escalar adicional —el presupuesto de longitud de línea restante en esa posición— antes de la cabeza de clasificación. El modelo se entrenó con 28.639 frases de subtítulos humanos reales (8 fuentes de YouTube) y se evaluó con decodificación greedy left-to-right, un escenario más realista que el teacher-forcing. El tamaño del repositorio es de 0,1 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT base (12 capas, hidden size 768, weight sharing) |
| Parametros totales | 10,55 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (clasificador de secuencia; no se especifica ventana máxima) |
| Tipos de cuantizacion | fp32, int8 dinámico |
| Idiomas soportados | Chino tradicional, inglés (incluye code-switching) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente PyTorch/safetensors, no especificado) |

## Arquitectura y entrenamiento

El modelo emplea un encoder ALBERT preentrenado (`voidful/albert_chinese_base`) con weight sharing entre capas, lo que reduce drásticamente el número de parámetros (10,55M) manteniendo 12 capas de transformación. El tokenizer es insensible a mayúsculas (`do_lower_case=True`), lo que permite que las palabras inglesas en mayúsculas se tokenicen como wordpieces normales en lugar de `[UNK]`; esta propiedad es la que hace viable un único modelo bilingüe de este tamaño. La cabeza de clasificación recibe la representación del token concatenada con una característica escalar: el presupuesto de longitud de línea restante en esa posición, lo que permite al modelo condicionar la decisión de salto al espacio visual disponible.

La segmentación en unidades candidatas de ruptura es determinista: cada carácter CJK es una unidad, y cada secuencia máxima de caracteres no-CJK no-espacio (palabras inglesas, números, etc.) es otra unidad. Para el entrenamiento se usaron 8 fuentes de subtítulos humanos reales de YouTube (5 en inglés, 3 en chino tradicional), con un filtro de contaminación que descarta frases que violen las restricciones del producto (`MAX_LINE_VISUAL = 42` y `DEFAULT_MAX_UNITS = 14`). El modelo se entrenó durante 6 épocas. Un componente crítico del sistema es el fallback determinista en tiempo de decodificación: cuando se alcanza el límite de línea, se fuerza un salto independientemente de la confianza del modelo, ya que un clasificador soft por posición no puede garantizar el cumplimiento del límite.

## Capacidades

- Clasificación de saltos de línea en subtítulos: predice, para cada unidad candidata, si debe producirse un salto de línea o no.
- Bilingüe real: un solo modelo cubre chino tradicional e inglés, incluyendo frases con code-switching (p. ej. «GTA6 好玩»).
- Condicionamiento por presupuesto de línea: la característica de longitud restante permite adaptar la decisión al espacio visual disponible.
- Segmentación determinista de unidades: compatible con la lógica de `isCjkAtom` del producto Cap, garantizando coherencia entre entrenamiento e inferencia.
- Cuantización int8 dinámica: la pérdida de precisión es mínima (F1 global 0,656 → 0,652).
- No es generativo: no genera texto, solo clasifica posiciones de salto; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Edición de subtítulos en chino tradicional: el modelo puede predecir saltos de línea automáticamente en frases largas de subtítulos de YouTube, reduciendo el trabajo manual del editor. Adecuado porque su F1 en chino (0,7807) es comparable al de un modelo monolingüe dedicado.
- Normalización de subtítulos generados automáticamente: al integrarse en un pipeline de transcripción, puede reformatear subtítulos que no respetan límites de línea, aplicando el fallback de restricción dura para garantizar el cumplimiento de las normas de visualización.
- Herramientas de accesibilidad: subtitulado en tiempo real para personas con discapacidad auditiva, donde el formato de línea correcto mejora la legibilidad y la velocidad de lectura.
- Contenido bilingüe con code-switching: vídeos de creadores taiwaneses que mezclan chino e inglés (p. ej. reseñas de videojuegos, tutoriales técnicos). El modelo maneja ambos idiomas en una sola pasada sin necesidad de detectar el idioma previamente.
- Optimización de subtítulos para plataformas con restricciones de longitud: plataformas como YouTube o TikTok imponen límites de caracteres por línea; el modelo puede ajustar los saltos para cumplir esos límites manteniendo la naturalidad.
- Integración en editores de vídeo de escritorio: como componente local (sin API), puede ofrecer sugerencias de salto de línea en tiempo real mientras el editor escribe o revisa subtítulos, sin coste por uso y con baja latencia.

## Benchmarks y rendimiento

La model card reporta resultados de F1 con decodificación greedy left-to-right (las predicciones del modelo alimentan la característica de longitud, no la verdad fundamental). No se proporcionan resultados de benchmarks estándar como MMLU o HumanEval, ya que es un clasificador especializado.

| Split | F1 (fp32) | F1 (int8) |
|---|---|---|
| Global | 0,656 | 0,652 |
| Chino | 0,7807 | 0,7792 |
| Inglés | 0,541 | 0,535 |

El rendimiento en chino iguala al de un modelo monolingüe dedicado del mismo proyecto (~30M parámetros, F1 = 0,7789 fp32), lo que demuestra que el weight sharing y el tokenizer compartido compensan el menor tamaño. En inglés, en cambio, el F1 de 0,541 es muy inferior al de un modelo solo inglés del proyecto (0,65) y al de un rule-based del producto (0,79–0,84), por lo que el autor desaconseja su uso para contenido exclusivamente inglés. La cuantización int8 apenas degrada la precisión (pérdida ≤ 0,006 en todos los splits).

## Requisitos de hardware

- El modelo es extremadamente ligero: 10,55M de parámetros, ~40,2 MB en fp32 (según la model card, 15,6 MB para ALBERT tiny vs 40,2 MB para base).
- Inferencia en CPU: viable en tiempo real para frases cortas, especialmente con cuantización int8 (la pérdida de precisión es despreciable).
- GPU consumer: cualquier GPU moderna (incluso integradas) es suficiente; no se requieren GPUs de datacenter.
- VRAM estimada: menos de 1 GB en fp32 para un batch pequeño; mucho menos con int8.
- Opciones de despliegue: al ser un modelo de HuggingFace estándar, puede servirse con `transformers` (PyTorch), `ONNX Runtime`, `TensorRT` o `llama.cpp` si se convierte a GGUF (aunque no se proporciona en ese formato).
- Latencia: no se especifica, pero dada la arquitectura ALBERT de 12 capas y 10,55M de parámetros, la inferencia en GPU es del orden de milisegundos por frase; en CPU, decenas de milisegundos.

## Comparativa con modelos similares

No hay modelos públicos comparables directamente en el ecosistema de HuggingFace para la tarea de salto de línea en subtítulos. La model card menciona dos modelos internos no publicados del mismo proyecto:

| Modelo | Parámetros | F1 chino (fp32) | F1 inglés (fp32) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| subtitle-linebreak-bilingual (este) | 10,55M | 0,7807 | 0,541 | Apache-2.0 | Público |
| Especialista chino-only (interno) | ~30M | 0,7789 | — | No pública | No público |
| Especialista inglés-only (interno) | No especificado | — | 0,65 | No pública | No público |
| Rule-based del producto Cap | — | — | 0,79–0,84 | Propietario | No público |

El modelo bilingüe logra igualar al especialista chino con menos de un tercio de los parámetros, pero es claramente inferior al especialista inglés y al rule-based en inglés. No se dispone de comparativas con otros modelos de clasificación de subtítulos de terceros.

## Limitaciones y advertencias

- Rendimiento deficiente en inglés: F1 de 0,541, muy por debajo de alternativas rule-based o modelos dedicados. No debe usarse para contenido exclusivamente en inglés.
- Dependencia del fallback de restricción dura: el clasificador soft no garantiza el cumplimiento del límite de línea; cualquier integración debe implementar el fallback determinista descrito en la model card, o se producirán subtítulos que excedan el ancho visual permitido.
- Sesgo de dominio: entrenado únicamente con 8 fuentes de YouTube (TED, Kurzgesagt, etc.), puede no generalizar bien a otros estilos de subtitulado (películas, series, contenido informal).
- Riesgo de alucinación: no aplica, al ser un clasificador y no un modelo generativo.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantías.
- Cobertura de idiomas limitada: solo chino tradicional e inglés; no soporta chino simplificado ni otros idiomas.
- Fecha de creación futura (2026-08-30): el modelo es muy reciente y carece de adopción (0 descargas, 0 likes), lo que implica una validación comunitaria nula.

## Enlaces

- HuggingFace: https://huggingface.co/suko/subtitle-linebreak-bilingual
- Model card (README): https://huggingface.co/suko/subtitle-linebreak-bilingual/blob/main/README.md
- Editor Cap (producto asociado): https://cap.sz.ws
- SZ.ws (desarrollador): https://sz.ws
- Herramientas relacionadas de la búsqueda web (no afiliadas al modelo):
  - EchoSubs Intelligent Line Breaks: https://www.echosubs.com/features/intelligent_line_break
  - AllSubConverter Line Balancer: https://www.allsubconverter.com/line-balancer/
  - Subtitle AI: https://www.subtitle.ai/
