# ternary/Arbiter-8B

## Resumen

Arbiter-8B es un modelo de decisión local desarrollado por ternary, construido sobre Qwen3-8B de Alibaba y afinado mediante LoRA (rango 32) con una cabeza de decisión. A diferencia de un modelo generativo convencional, Arbiter no produce texto: recibe un pasaje (por ejemplo, una noticia financiera literal o un fragmento de un formulario 10-K de la SEC), una pregunta tipada y un conjunto fijo de opciones con sus definiciones, y devuelve una probabilidad calibrada para cada opción en una única pasada hacia adelante. Está orientado a la gestión de patrimonios y activos (wealth and asset management).

Su relevancia radica en que resuelve un problema concreto y frecuente en finanzas: clasificar eventos corporativos, estimar perspectivas implícitas, medir el grado de certeza de un evento o detectar banderas de riesgo en archivos regulatorios, todo con salidas probabilísticas calibradas y reproducibles, sin los costes ni la variabilidad de la generación de texto. El método se basa en el trabajo "Releasing the Inner Jev" (Geuter et al., 2026) y el modelo se distribuye en dos variantes: el modelo completo fusionado en fp16 (16,7 GB) y un adaptador LoRA en 4 bits que requiere unos 6,5 GB de memoria GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal) con cabeza de decisión, método Jev |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (modelo completo fusionado); QLoRA 4 bits (adaptador) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo completo fp16); adaptador PEFT LoRA (adapter/) |

## Arquitectura y entrenamiento

Arbiter-8B parte de Qwen/Qwen3-8B, un transformer causal de 8B parámetros, y se afina con LoRA de rango 32 más una cabeza de decisión. El método, inspirado en "Releasing the Inner Jev" (Geuter et al., 2026), convierte el modelo en un puntuador de opciones: dada una entrada (state), una pregunta con instrucciones y criterios, y hasta 16 opciones definidas, el modelo puntúa todas las opciones en una sola pasada hacia adelante. Las probabilidades se calibran por tipo de pregunta mediante temperaturas incluidas en `calibration.json`.

El entrenamiento se realizó con QLoRA en 4 bits sobre el modelo base. El repositorio distribuye el modelo completo fusionando el LoRA en los pesos base dequantizados en 4 bits contra los que se entrenó, guardado en fp16; esta fusión reproduce el modelo entrenado con fidelidad muy alta (misma respuesta en 730 de 731 decisiones de evaluación, con probabilidades dentro de 0,004). El dominio de entrenamiento es noticias financieras y formularios 10-K de la SEC. No se ha publicado información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Clasificación de tipo de evento en noticias (10 categorías: acción corporativa, resultados financieros, guía de la compañía, producto/operaciones, acción de analista, opinión de analista, movimiento de mercado, legal/seguridad, sector/macro, evidencia insuficiente).
- Estimación de perspectiva implícita (improved, worsened, unchanged, unclear) a partir de pasajes financieros.
- Puntuación de certeza de un evento en escala ordinal de 0 (rumoreado) a 3 (materializado).
- Detección de si la compañía es el sujeto principal del evento y de su rol (adquirente, objetivo, regulador, solo mencionado).
- Clasificación de riesgo en pasajes del Item 1A de formularios 10-K (10 categorías de riesgo).
- Flags de 10-K: going concern, concentración de clientes e incidentes cibernéticos (preguntas sí/no).
- Salida probabilística calibrada por tipo de pregunta, con temperaturas predefinidas.
- Soporte de preguntas personalizadas con el mismo formato (máximo 16 opciones), aunque la calidad fuera del conjunto entrenado no está medida.
- Sin generación de texto: una pasada hacia adelante por decisión, lo que garantiza latencia baja y salidas reproducibles.
- Truncado automático del state por el final (nunca de las opciones), con aviso `state_truncated: true` y contador de fallbacks (`fallback_counts`).

## Casos de uso

- Monitorización automatizada de noticias financieras: clasificar en tiempo real el tipo de evento y la perspectiva implícita de miles de noticias diarias sobre empresas en cartera, con una pasada hacia adelante por documento.
- Análisis de formularios 10-K a escala: recorrer los pasajes de riesgo (Item 1A) de cientos de presentaciones y detectar categorías de riesgo, going concern, concentración de clientes o incidentes cibernéticos sin revisión manual exhaustiva.
- Gestión de riesgo en wealth management: puntuar la certeza de eventos (de rumor a materializado) para priorizar qué movimientos de mercado requieren intervención del gestor.
- Sistemas de alertas calibradas: las probabilidades calibradas permiten fijar umbrales de alerta coherentes (por ejemplo, avisar solo si P(worsened) > 0,8), algo difícil con salidas generativas.
- Enriquecimiento de pipelines de datos financieros: etiquetar eventos con sujeto principal y rol (adquirente, objetivo, regulador) para construir bases de datos de eventos corporativos estructurados.
- Backtesting de estrategias basadas en eventos: la salida determinista y probabilística facilita la reproducción de decisiones históricas sobre archivos de noticias.
- Extracción con bajo coste de inferencia: al no generar texto, cada decisión cuesta una sola pasada hacia adelante, adecuado para procesar grandes volúmenes con hardware moderado.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a 2.000 decisiones sobre noticias (estimación estratificada) con empresas excluidas del entrenamiento. Las etiquetas provienen de adjudicación a ciegas por Claude Opus 5.5 sobre las 323 discrepancias entre Arbiter v0.2 y Jev 1.14 más 201 acuerdos muestreados aleatoriamente; el juez coincidió con la etiqueta humana en el 84,5 % de las 207 decisiones etiquetadas por humanos (90,3 % en noticias). La tabla de resultados exactos aparece truncada en la información disponible, por lo que no se pueden citar cifras de accuracy concretas.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Modelo completo (fp16): unos 17 GB de memoria GPU; cabe en una GPU de 24 GB (por ejemplo RTX 3090, RTX 4090, A5000 o A10G de 24 GB).
- Adaptador LoRA en 4 bits (Qwen3-8B cuantizado): unos 6,5 GB de memoria GPU; suficiente una GPU de 8 GB (por ejemplo RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o superior).
- Con `device_map="auto"` el modelo completo puede repartirse entre varias GPUs más pequeñas; con offload a CPU funciona, pero más lentamente.
- Requisitos de software: Python 3.10 o posterior, torch, transformers, accelerate, safetensors y huggingface_hub; para el adaptador 4 bits, además peft y bitsandbytes (CUDA).
- Despliegue: carga mediante el script `arbiter.py` incluido en el repositorio; el backbone también carga con `AutoModelForCausalLM`, pero las decisiones tipadas requieren la cabeza de decisión que aplica `arbiter.py`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia: una única pasada hacia adelante por decisión, sin generación de texto; no se publican cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| | Arbiter-8B | Jev 1.14 | Qwen3-8B (base) |
|---|---|---|---|
| Parametros | 8,19 B | no disponible | 8,19 B |
| Tipo | Modelo de decisión (scoring de opciones, sin generación) | Modelo de decisión (referencia del método) | LLM generativo causal |
| Dominio | Noticias financieras y 10-K, wealth management | Finanzas (según evaluación comparada) | General, multilingüe |
| Salida | Probabilidades calibradas por opción | Probabilidades (según método Jev) | Texto generado |
| Licencia | Apache-2.0 | no disponible | Apache-2.0 |
| Disponibilidad | Hugging Face (ternary/Arbiter-8B) | no disponible | Hugging Face (Qwen/Qwen3-8B) |

La evaluación publicada compara directamente Arbiter v0.2 con Jev 1.14 sobre 2.000 decisiones de noticias, pero las cifras exactas no están disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: entrenado y evaluado solo en inglés; no hay soporte garantizado para castellano u otros idiomas.
- Dominio acotado: la fiabilidad está medida sobre el conjunto de preguntas entrenadas (`questions.py`); preguntas personalizadas funcionan pero su calidad no ha sido medida.
- Dependencia de un juez automático: parte de la evaluación se etiqueta con Claude Opus 5.5, no con anotación humana exhaustiva, lo que introduce incertidumbre en las métricas.
- Riesgo de alucinación: reducido por diseño (no genera texto), pero las probabilidades pueden ser mal calibradas fuera de la distribución de entrenamiento.
- Contexto: si el pasaje es demasiado largo se trunca por el final; conviene monitorizar `state_truncated` y `fallback_counts` en producción.
- No es un asesor financiero: las salidas son probabilidades sobre texto, no recomendaciones de inversión; su uso en decisiones reales de gestión de patrimonios requiere supervisión humana y validación.
- Etiqueta de pipeline: el Hub lo clasifica como `text-classification`, etiqueta que los autores indican que no aplica; hay que cargarlo con `arbiter.py`.
- Licencia Apache-2.0 sin restricciones conocidas para uso comercial, aunque conviene revisar los términos de la licencia de Qwen3-8B para usos concretos.
- Trazabilidad: descargas muy bajas (20) y proyecto reciente, sin historial de auditoría comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ternary/Arbiter-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper de referencia: "Releasing the Inner Jev" (Geuter et al., 2026) — enlace no disponible en la informacion proporcionada
