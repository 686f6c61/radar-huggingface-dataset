# umitaslan/laya

## Resumen

Laya es un modelo de clasificación de texto no autorregresivo desarrollado por umitaslan (con investigación asociada publicada por N. M. y A. M. en *Preprints*, 2026). Se presenta como un "System 1 decision model": recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades calibradas matemáticamente en un único pase forward de aproximadamente 33 ms. No genera texto libre, por lo que no hay nada que parsear ni margen para alucinaciones en el sentido generativo habitual.

El modelo se entrena mediante aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD, *Reinforcement Learning with Calibrated Decisions*), de modo que la única forma de maximizar la recompensa es reportar probabilidades honestas. Está pensado para tareas de enrutamiento, scoring, guardrails y moderación, con soporte declarado de más de 100 idiomas y una variante "multilingual" que admite hasta 8.192 tokens de contexto.

Con 421.293.830 parámetros y licencia Apache 2.0, Laya se posiciona como una alternativa ligera y determinista a los LLM generativos para decisiones estructuradas de alta frecuencia, donde la latencia y la calibración de probabilidades importan más que la fluidez del texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (decision model, "System 1"); detalles internos no disponibles |
| Parámetros totales | 421.293.830 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 tokens en la variante `laya-multilingual` con `max_len=8192` |
| Tipos de cuantización | No disponible (se menciona soporte ONNX Runtime vía `laya[onnx]`, sin detallar cuantizaciones) |
| Idiomas soportados | Más de 100 idiomas (declarado); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |
| Pipeline | `text-classification` |
| Tamaño del repositorio | 2,4 GB |
| Latencia declarada | ~33 ms por pase forward |

## Arquitectura y entrenamiento

Laya es un modelo no autorregresivo: en lugar de generar tokens secuencialmente, procesa el estado de entrada y un conjunto de preguntas tipadas (`choice`, `score`, `noul`) y emite directamente respuestas tipadas con probabilidades asociadas en un solo pase forward. Esta elección de diseño elimina la decodificación autoregresiva y, con ella, la latencia variable y la necesidad de parsear la salida. La información disponible no detalla la profundidad, el número de capas ni el mecanismo de atención interno.

El entrenamiento se basa en RLCD (aprendizaje por refuerzo contra reglas de puntuación estrictamente propias), una innovación que fuerza al modelo a producir probabilidades calibradas: si el modelo miente sobre su confianza, la recompensa disminuye. El autor indica que los checkpoints publicados funcionan en modo zero-shot, pero que el ajuste fino sobre decisiones del dominio propio eleva sustancialmente la precisión (0,766 frente a 0,362 en el benchmark de decisiones tipadas). Se menciona también el proyecto "Vega" como continuación de esta línea de modelos de decisión no autorregresivos.

## Capacidades

- Clasificación de texto con salida tipada: preguntas de tipo `choice` (selección entre criterios), `score` (puntuación ordinal) y `noul` (probabilidad de que la respuesta sea afirmativa).
- Probabilidades calibradas matemáticamente gracias al entrenamiento con RLCD.
- Enrutamiento automático entre checkpoints: el `Router` detecta script e idioma y deriva el texto no inglés a `laya-multilingual`.
- Soporte multilingüe declarado de más de 100 idiomas.
- Procesamiento de estados heterogéneos: texto libre, correos, tickets y JSON.
- Sin generación de texto: salida estructurada y determinista, sin parsing ni alucinación generativa.
- Integraciones: servidor HTTP (`laya[serve]`), servidor MCP (`laya[mcp]`), LangChain y LangGraph (`laya[langchain]`), ONNX Runtime (`laya[onnx]`) y ruta rápida en GPU con TileLang (`laya[fast]`).
- Modo agente vía `laya.Agent(vegaml=True)` para ejecutar políticas firmadas generadas en el estudio del autor.
- No se declara soporte de tool calling genérico, visión, audio ni modo "thinking".

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada ticket en departamentos (facturación, técnico, otros) con una sola llamada de ~33 ms, lo que permite procesar colas de miles de tickets por minuto sin coste de generación.
- Scoring de urgencia y riesgo de churn: usar preguntas de tipo `score` y `noul` para priorizar colas de atención y detectar clientes con intención de cancelar, aprovechando la calibración para fijar umbrales operativos.
- Guardrails y moderación: evaluar contenido entrante contra criterios definidos (toxicidad, cumplimiento, seguridad) y obtener probabilidades calibradas que permiten decidir con umbrales auditables en lugar de texto libre.
- Clasificación de documentos largos: con `max_len=8192` en la variante multilingüe, procesar correos extensos, contratos o hilos de conversación (el autor reporta 16-18 de 20 aciertos con hasta ~4.000 tokens de contexto).
- Atención al cliente multilingüe: enrutar mensajes en más de 100 idiomas al equipo o flujo adecuado sin necesidad de un LLM generativo, reduciendo coste y latencia.
- Pipelines de decisión en tiempo real: integrar el modelo como clasificador de baja latencia en sistemas de scoring, detección de intención o triaje dentro de aplicaciones LangChain/LangGraph.
- Ajuste fino por dominio: entrenar un checkpoint propio sobre decisiones etiquetadas del negocio (el autor documenta un salto de 0,362 a 0,766 de precisión en su benchmark) y desplegarlo con la CLI `vegaml`.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son del benchmark de decisiones tipadas del propio autor (2.000 decisiones en cuatro flujos de trabajo):

| Modelo | Precisión en decisiones tipadas |
|---|---|
| `laya-typed-decisions` (ajustado) | 0,766 |
| Checkpoint inglés base (zero-shot) | 0,362 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta además latencia de ~33 ms por pase forward y ~1,7 s para una entrada de 4.000 tokens en GPU de Apple.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 421 millones de parámetros, la inferencia en fp16 requiere aproximadamente 0,9 GB de pesos, y en fp32 unos 1,7 GB, más overhead de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería alojar el modelo con holgura.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, aunque el autor no lo confirma.
- Opciones de despliegue: `transformers`, ONNX Runtime (`laya[onnx]`), servidor HTTP (`laya[serve]`), servidor MCP (`laya[mcp]`), ruta rápida TileLang en GPU (`laya[fast]`), integración LangChain/LangGraph. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~33 ms por pase forward; ~1,7 s para 4.000 tokens en GPU de Apple. Throughput no disponible.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos directamente comparables de la misma categoría (clasificadores de decisión no autorregresivos con calibración por RL). Como referencia de tamaño y propósito:

| Modelo | Parámetros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| Laya | 421 M | 1.024 / 8.192 (multilingual) | Clasificador de decisión no autorregresivo | Apache 2.0 |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No genera texto: no sirve para tareas generativas, resumen, traducción ni diálogo libre.
- El límite de contexto por defecto es de 1.024 tokens; los documentos largos requieren `max_len=8192` y la variante multilingüe, y el propio autor advierte que más allá de ~4.000 tokens los resultados varían (8-17 de 20 aciertos).
- El rendimiento zero-shot es bajo en dominios específicos (0,362 en el benchmark del autor); el ajuste fino es prácticamente obligatorio para producción.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento: las probabilidades calibradas no garantizan corrección en dominios nuevos.
- La lista completa de idiomas soportados no está publicada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del estudio asociado (`studio.embedding.in`) si se generan políticas firmadas con `vegaml`.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: ecosistema y validación externa aún muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/umitaslan/laya
- Checkpoint ajustado: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio GitHub: https://github.com/NandhaKishorM/laya
- Documentación: https://nandhakishorm.github.io/laya
- Artículo (DOI): https://doi.org/10.20944/preprints202611.0781.v1
- Notebook de ajuste fino: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Script de benchmark de contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
- Estudio del autor: https://studio.embedding.in
