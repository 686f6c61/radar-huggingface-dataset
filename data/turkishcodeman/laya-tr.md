# TurkishCodeMan/laya-tr

## Resumen

Laya-TR (identificador `TurkishCodeMan/laya-tr`) es un modelo de decisión y razonamiento **no autorregresivo** para turco, publicado por el usuario TurkishCodeMan en Hugging Face. No es un LLM generativo: en lugar de producir tokens secuencialmente, evalúa de forma simultánea la pregunta y todas las opciones candidatas en una única pasada forward, devolviendo la opción seleccionada y una puntuación de confianza. Su objetivo declarado es el enrutamiento de agentes, la selección de candidatos y la toma de decisiones de latencia ultrabaja (el autor reporta 9,78 ms por pregunta en una sola GPU, con 95,7 preguntas por segundo).

El modelo tiene 321.908.998 parámetros (~322 M) y se construye sobre un backbone `mmBERT-base` de 22 capas (arquitectura ModernBERT con GeGLU, Rotary Position Embeddings y atención de ventana deslizante), al que se añaden una cabeza Decision Transformer de 2 capas, un scorer compartido de marcadores de opción y una cabeza Act/Escalate. Se distribuye bajo licencia Apache 2.0 y soporta turco e inglés según sus metadatos, aunque la única evaluación publicada es en turco.

Su relevancia práctica está en el nicho de los "modelos de decisión" como etapa previa a un LLM generativo: permite descartar, priorizar o enrutar peticiones en menos de 10 ms, y escalar solo los casos dudosos a un modelo mayor. El coste de esa velocidad es una precisión limitada: un 18,90 % de acierto en el test completo de MMLU-Pro TR (11.842 preguntas, 10 opciones, base aleatoria del 10 %), frente al 11,68 % del modelo base sin ajustar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `mmBERT-base` de 22 capas (ModernBERT con GeGLU, RoPE y sliding-window attention) + cabeza Decision Transformer de 2 capas + Shared Option Marker Scorer + cabeza Act/Escalate |
| Parametros totales | 321.908.998 (~322 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card menciona atención de ventana deslizante, pero no indica la longitud máxima) |
| Tipos de cuantizacion | No disponible (solo se publican pesos completos en safetensors) |
| Idiomas soportados | Turco (tr) e inglés (en), según metadatos; evaluación publicada solo en turco |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (requiere `trust_remote_code=True`; tag `custom_code`) |
| Pipeline declarado | `text-classification` |
| Tamaño del repositorio | 1,3 GB |
| Fecha declarada en el Hub | Creado y actualizado el 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura combina un encoder `mmBERT-base` (variante multilingüe de ModernBERT, con GeGLU en lugar de MLP clásico, Rotary Position Embeddings y atención de ventana deslizante) con cabezas específicas para decisión: una cabeza Decision Transformer de 2 capas que procesa las representaciones de la pregunta y de las opciones, un scorer compartido de marcadores de opción que puntúa cada candidato de forma paralela, y una cabeza Act/Escalate cuya semántica exacta no se detalla en la model card. El resultado es una puntuación por opción que se resuelve en una sola pasada, sin decodificación autorregresiva.

El ajuste se realizó sobre un corpus turco curado de decisión y razonamiento de 15.459 muestras, con cobertura de ciencias, humanidades, derecho, economía y razonamiento analítico. Se aplicaron tasas de aprendizaje diferenciales: 2 × 10⁻⁵ para el backbone (para preservar las representaciones multilingües) y 1 × 10⁻⁴ para las cabezas de decisión. El optimizador fue AdamW con weight decay 0,01, schedule de cosine annealing precedido de warmup lineal, precisión mixta FP16 (AMP) y clipping de norma de gradiente a 1,0. Se usó micro-batch de 4 con 4 pasos de acumulación (batch efectivo de 16) durante 3 épocas, completadas en 621,74 segundos (10,4 minutos) en una única RTX 4090. De ahí se deriva un ritmo aproximado de 2.898 pasos de optimización en 621,74 s, es decir, ~4,7 pasos/s (cálculo derivado de los datos de la model card). No se documenta el uso de RLHF, DPO ni destilación.

## Capacidades

- Decisión y selección de candidatos: dado un enunciado y un conjunto de opciones (el ejemplo de la model card usa cuatro, y el benchmark hasta diez, A–J), devuelve la opción predicha, el texto de la opción y una confianza numérica.
- Razonamiento académico en turco sobre 14 disciplinas evaluadas: psicología, biología, historia, salud y medicina, economía, filosofía, informática, derecho, empresariales, química, matemáticas, ingeniería y física.
- Inferencia no autorregresiva de pasada única, con latencia declarada de 9,78 ms por pregunta y 95,7 preguntas/s en una sola GPU (el modelo base sin ajustar alcanza 5,54 ms y 162,0 preguntas/s).
- Integración nativa con `transformers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`, con un método `decide(question=..., options=..., tokenizer=...)`.
- Capacidad declarada de "Act/Escalate" mediante una cabeza dedicada, presumiblemente orientada a decidir si hay que escalar la consulta a otro modelo; la model card no especifica su funcionamiento ni su interfaz.
- Comprensión de inglés declarada en los metadatos del repositorio, sin métricas publicadas.
- No se documenta generación de texto libre, tool calling / function calling, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Enrutamiento previo a un LLM generativo: Laya-TR puede actuar como primera etapa que clasifique la intención o seleccione la herramienta o plantilla adecuada entre un conjunto cerrado de opciones, con un coste de 9,78 ms por decisión, y delegar en un modelo mayor solo las peticiones con baja confianza a través de la cabeza Act/Escalate.
- Clasificación y priorización de tickets de soporte en turco: con 95,7 decisiones/s en una GPU, se puede etiquetar por categoría, urgencia o equipo responsable un flujo de miles de tickets por minuto, usando una lista fija de categorías como opciones candidatas.
- Filtrado y reordenación en pipelines RAG: dado un documento y varias alternativas (respuestas, chunks o acciones), el scorer de opciones permite descartar candidatos irrelevantes antes de invocar un modelo generativo, reduciendo el coste total del pipeline.
- Modo "actúa o escala" en agentes: la cabeza Act/Escalate puede emplearse para decidir si el agente resuelve la consulta por sí mismo o la deriva a revisión humana o a un modelo superior, con umbrales calibrados sobre la confianza devuelta.
- Pretest académico y autoevaluación en turco: el modelo responde preguntas de opción múltiple de MMLU-Pro TR; es útil para clasificar material de estudio por disciplina, aunque su precisión global (18,90 %) lo limita a tareas auxiliares y no a evaluación de alto riesgo.
- Clasificación rápida de contenido para moderación o taxonomías en turco: al tratarse de un modelo de decisión con opciones cerradas, encaja en tareas de etiquetado multiclase donde la latencia importa más que la generación de texto.
- Despliegue en CPU o en el borde (edge): con ~322 M de parámetros y pesos de 1,3 GB en el repositorio, el autor lo describe como apto para GPU única o CPU, lo que permite ejecutarlo en entornos sin acelerador dedicado para decisiones de baja frecuencia.
- Sistema de votación o reranking dentro de un ensemble: puede combinarse con un LLM generativo, usando Laya-TR para puntuar las opciones propuestas por el modelo mayor y quedarse con la de mayor confianza.

## Benchmarks y rendimiento

Única evaluación publicada: test completo de `bezir/MMLU-pro-TR` (11.842 preguntas, 10 opciones A–J por pregunta). La línea base aleatoria con 10 opciones es del 10,00 %.

| Metrica / modelo | Laya (base, zero-shot) | Laya-TR (ajustado) | Diferencia |
|---|---|---|---|
| Preguntas evaluadas | 11.842 | 11.842 | Test completo |
| Respuestas correctas | 1.383 / 11.842 | 2.238 / 11.842 | +855 aciertos |
| Precision global | 11,68 % | 18,90 % | +7,22 puntos (+61,82 % relativo) |
| Latencia media | 5,54 ms | 9,78 ms | Decisiones por debajo de 10 ms |
| Throughput | 162,0 q/s | 95,7 q/s | Listo para producción en tiempo real |

Desglose por disciplina (14 categorías, datos del autor):

| Categoria | Preguntas | Laya (base) | Laya-TR | Mejora relativa |
|---|---|---|---|---|
| Psicologia | 780 | 11,28 % | 26,54 % | +135,3 % |
| Biologia | 714 | 13,31 % | 26,47 % | +98,9 % |
| Historia | 342 | 13,16 % | 24,56 % | +86,6 % |
| Salud y medicina | 800 | 11,50 % | 24,00 % | +108,7 % |
| Economia | 830 | 14,58 % | 23,73 % | +62,8 % |
| Otros | 915 | 10,82 % | 22,51 % | +108,0 % |
| Filosofia | 479 | 12,11 % | 20,46 % | +69,0 % |
| Informatica | 397 | 11,84 % | 20,15 % | +70,2 % |
| Derecho | 1.086 | 11,42 % | 17,50 % | +53,2 % |
| Empresariales | 774 | 12,02 % | 16,41 % | +36,5 % |
| Quimica | 1.126 | 12,43 % | 14,56 % | +17,1 % |
| Matematicas | 1.345 | 11,08 % | 14,05 % | +26,8 % |
| Ingenieria | 965 | 11,92 % | 13,99 % | +17,4 % |
| Fisica | 1.289 | 9,08 % | 13,96 % | +53,7 % |

No se han publicado resultados de otros benchmarks (MMLU en inglés, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado del número de parámetros, no un dato publicado): ~1,3 GB en FP32 (coincide con el tamaño del repositorio), ~0,65 GB en FP16 y ~0,32 GB en INT8, más el overhead de activaciones y del tokenizador.
- GPU recomendadas: el autor solo menciona "una sola GPU" para inferencia y una RTX 4090 para el entrenamiento. No se documentan pruebas en A100, H100 ni en otras GPU.
- Compatibilidad con GPU de consumo: sí. Con ~322 M de parámetros, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 12 GB en adelante) y el autor afirma que también funciona en CPU.
- Opciones de despliegue: el uso documentado es `transformers` con `AutoModel` y `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, y al ser un modelo de decisión con `custom_code` no es esperable que funcione directamente en servidores de inferencia genéricos sin adaptación.
- Latencia y throughput declarados: 9,78 ms por pregunta y 95,7 q/s con el modelo ajustado; 5,54 ms y 162,0 q/s con el modelo base. La GPU concreta utilizada para estas mediciones no se especifica en la información disponible.
- Entrenamiento: 3 épocas sobre 15.459 muestras en 621,74 s (10,4 minutos) con una única RTX 4090, batch efectivo de 16 y FP16 AMP.

## Comparativa con modelos similares

No se han encontrado en la búsqueda web resultados utilizables (las consultas devolvieron únicamente páginas de DuckDuckGo), por lo que la comparativa se limita a la arquitectura declarada por el autor y a datos públicos de los encoders en los que se basa. No hay comparación de rendimiento posible, porque no se publican resultados de estos modelos en MMLU-Pro TR en la información disponible.

| Modelo | Parametros | Contexto | Tipo | Licencia | Datos de benchmark en MMLU-Pro TR |
|---|---|---|---|---|---|
| Laya-TR | ~322 M (321.908.998) | No disponible | Encoder de decisión no autorregresivo + cabezas de clasificación | Apache 2.0 | 18,90 % (11.842 preguntas, 10 opciones) |
| mmBERT-base (backbone de partida) | ~307 M según documentación pública del modelo | No disponible en esta información | Encoder multilingüe ModernBERT | Apache 2.0 | No disponible |
| ModernBERT-base (arquitectura de referencia) | ~149 M según documentación pública | 8.192 tokens según documentación pública | Encoder bidireccional | Apache 2.0 | No disponible |
| Laya (modelo base, sin ajustar) | No disponible | No disponible | Mismo esquema, sin ajuste en turco | No disponible | 11,68 % (zero-shot) |

Los valores de mmBERT-base y ModernBERT-base proceden de su documentación pública y no han podido verificarse en la búsqueda realizada; se incluyen solo como referencia de tamaño y licencia, no de rendimiento.

## Limitaciones y advertencias

- Precisión limitada: un 18,90 % global en MMLU-Pro TR está muy por encima del 10 % aleatorio, pero sigue siendo bajo en términos absolutos. En matemáticas (14,05 %), física (13,96 %), ingeniería (13,99 %) y química (14,56 %) el margen sobre el azar es de apenas 4 puntos porcentuales.
- No genera texto: es un modelo de decisión sobre un conjunto cerrado de opciones. No puede usarse para respuesta libre, resúmenes, traducción ni generación de código.
- Dependencia del formato de entrada: espera una pregunta y un diccionario de opciones; su comportamiento con entradas mal formateadas, opciones de distinta longitud o más de diez candidatos no está documentado.
- Riesgo de alucinación conceptual: al no generar texto no puede "inventar" prosa, pero sí seleccionar una opción incorrecta con alta confianza. La confianza devuelta no está calibrada de forma pública para el test completo, por lo que no se recomienda usarla como probabilidad en decisiones críticas sin validación propia.
- Sesgos y cobertura: el ajuste se hizo sobre 15.459 muestras de un corpus no descrito en detalle (fuentes, proporción por disciplina, filtrado). No hay análisis de sesgos demográficos, políticos ni culturales, ni evaluación fuera del dominio académico turco.
- Limitaciones de idioma: la evaluación es exclusivamente en turco. El inglés aparece en los metadatos, pero no hay ninguna métrica publicada, por lo que su rendimiento en inglés es desconocido.
- Contexto no documentado: la model card no especifica la longitud máxima de secuencia, solo que el backbone usa atención de ventana deslizante. No se debe asumir una ventana larga sin verificarlo en el código del repositorio.
- Ejecución de código remoto: el modelo requiere `trust_remote_code=True`, lo que implica descargar y ejecutar código Python del repositorio del autor. En producción conviene auditar ese código antes de desplegarlo.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados publicados.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no documenta la licencia del corpus de ajuste (15.459 muestras), lo que puede afectar a la redistribución de modelos derivados.
- Sin soporte de cuantización ni de runtimes optimizados: no hay GGUF, GPTQ, AWQ ni integración con vLLM/TGI/Ollama, lo que limita las opciones de despliegue escalable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TurkishCodeMan/laya-tr
- Dataset de evaluación citado por el autor: https://huggingface.co/datasets/bezir/MMLU-pro-TR
- Búsqueda web realizada: no se han encontrado resultados relevantes (las consultas devolvieron únicamente páginas de DuckDuckGo), por lo que no hay papers, blogs, repositorios ni demos adicionales que enlazar.
