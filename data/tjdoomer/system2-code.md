# tjdoomer/system2-code

## Resumen

System 2 (Code Track) es un modelo de clasificación de texto y adjudicación de hipótesis desarrollado por tjdoomer (Thom James-Worrall / Antigravity Research) y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo generativo: se trata de un arnés de deliberación no autorregresivo construido sobre `answerdotai/ModernBERT-Large-Instruct` (395M parámetros, congelado) al que se le añaden adaptadores LoRA en las capas 20-27, cinco cabezas de "pensamiento" (ThoughtHeads) y un Judger con atención cruzada. Su función es evaluar varias hipótesis candidatas generadas por otro modelo (típicamente un modelo pequeño de 7B-12B cuantizado a 4 bits) y seleccionar la más fiable, calculando consenso por similitud coseno entre cabezas.

El problema que aborda es el "colapso de CoT a 2 bits": al cuantizar agresivamente modelos grandes (27B+) para que quepan en portátiles de 16 GB, se degradan los pesos de proyección de atención que emiten el token de cierre de razonamiento, provocando bucles internos de 8-9 minutos y salidas vacías o truncadas. La propuesta del autor es emparejar un generador ligero de 4 bits con este clasificador de 143 MB que actúa como verificador, detectando "deriva epistémica" (desacuerdo entre candidatos) antes de ejecutar código.

El modelo es relevante como pieza de infraestructura para pipelines de agentes que necesitan un mecanismo de calibración y selección de candidatos con latencia muy baja (el autor reporta menos de 30 ms en Apple Silicon MPS o NVIDIA CUDA). El repositorio ocupa 0,2 GB y el checkpoint principal `system2_code.pt` pesa 143 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con LoRA (r=32, α=32, capas 20-27), 5 ThoughtHeads y Judger con cross-attention |
| Parametros totales | 395M (base ModernBERT-Large-Instruct, congelada) + adaptadores LoRA y cabezas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en `system2_code.pt`, 143 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) |
| Pipeline | text-classification |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-Large-Instruct` con los pesos base congelados y añade adaptadores LoRA de rango 32 y alpha 32 en las capas 20 a 27, más cinco cabezas de pensamiento que evalúan la misma cuestión desde perspectivas con distinto balance pregunta/respuesta: Head 0 holística (integración global), Head 1 anclada al contexto (40% Q / 60% A), Head 2 orientada a la elección (20% Q / 80% A), Head 3 simétrica (50% Q / 50% A) y Head 4 de saliencia extrema (5% Q / 95% A). Un Judger con atención cruzada agrega las salidas de las cinco cabezas y produce una selección calibrada.

La decisión se toma por consenso de clústeres mediante similitud coseno por pares entre las representaciones de las cabezas, con un umbral de 0,88: por encima se considera alta certeza y se ejecuta localmente; por debajo se marca deriva epistémica y se recomienda escalado a la nube. El autor reporta una métrica protegida sobre trazas de código de 0,9010 (89,11% de accuracy, Brier score 0,0891, ECE real de 10 bins 0,0542). No se detalla en la información disponible el volumen ni la composición del dataset de entrenamiento, ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación y adjudicación de hipótesis candidatas: recibe una pregunta y varias respuestas posibles y devuelve el índice seleccionado con confianza calibrada.
- Deliberación multi-perspectiva mediante cinco cabezas con distinto reparto de atención entre pregunta y respuesta.
- Cálculo de consenso por similitud coseno por pares entre cabezas (umbral 0,88).
- Detección de deriva epistémica: identifica cuándo los candidatos divergen y la confianza colapsa, señalando riesgo antes de ejecutar código.
- Calibración de confianza (métricas Brier score y ECE reportadas por el autor).
- Especialización en dominio de código (Code Track), incluyendo selección de implementaciones correctas y seguras para concurrencia.
- Servidor proxy compatible con la API de OpenAI (`python3 -m sys2.server --port 8000`), integrable en Cursor, Claude Code, Cline o LangChain.
- API Python vía `System2Engine` con método `adjudicate(question, choices, domain="code")`.
- No soporta generación de texto, tool calling nativo, visión, audio ni capacidades de agente autónomo por sí mismo.

## Casos de uso

- Selección de implementaciones en pipelines de agentes de código: un generador de 7B-12B a 4 bits produce cuatro candidatos y System 2 elige el más fiable en menos de 30 ms, evitando ejecutar código roto.
- Verificación previa a ejecución en entornos de CI/CD: el modelo actúa como puerta de calidad que bloquea la ejecución cuando la confianza cae por debajo del 88% y recomienda escalado a un modelo mayor en la nube.
- Enrutamiento local/nube con criterio de coste: en un portátil de 16 GB, las tareas con consenso alto se resuelven localmente en menos de 4 segundos y solo las inciertas se envían a la nube, reduciendo gasto de API.
- Detección de bucles de razonamiento en modelos cuantizados: al comparar candidatos truncados o vacíos frente a completos, el desacuerdo entre cabezas delata el fallo del generador sin necesidad de inspección manual.
- Sustituto local de un endpoint de OpenAI en editores y asistentes: el servidor `sys2.server` permite apuntar la base URL de Cursor, Claude Code o Cline a `http://localhost:8000/v1` para añadir una capa de adjudicación y calibración.
- Auditoría de respuestas en sistemas de preguntas y respuestas técnicas: la confianza calibrada (ECE 0,0542 reportado) permite priorizar revisiones humanas sobre las respuestas con menor certeza.
- Selección de fragmentos o parches en tareas de reparación de código: dado un conjunto de parches candidatos, el modelo puntúa cuál es más coherente con el contexto del problema.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, medidos en un Apple M4 Max con 128 GB de memoria unificada. Las columnas comparan tres configuraciones de generador, no variantes de System 2; System 2 es el adjudicador común.

| Metrica | Path A: qwen-3.8-27b-smoll (2.0-bit) | Path B: qwen-3.8-27b-iq3xxs (3.0-bit) | Path Gemma: google/gemma-4-12b (4.0-bit) |
|---|---|---|---|
| Tamaño / VRAM | 6,77 GB | 10,18 GB | 6,77 GB |
| Módulo 1 (Node) | 99,7% conf. (41 líneas) | 81,6% conf. (19 líneas) | 76,6% conf. (22 líneas) |
| Módulo 2 (Cache) | 94,2% conf. (18 líneas) | 75,2% conf. (14 líneas) | 98,7% conf. (37 líneas) |
| Módulo 3 (Test Suite) | 99,6% conf. (31 líneas) | 67,8% conf. (10 líneas) | 41,8% conf. (deriva marcada) |
| Latencia de deliberación (MPS) | 580 ms | 982 ms | 1.107 ms |
| Resultado de pytest | FAILED (SyntaxError) | FAILED (IndentationError) | FAILED (indentación de lista Markdown) |
| Causa raíz del fallo | truncamiento por bucle CoT a 2 bits | truncamiento por bucle CoT a 3 bits | bloque de lista Markdown indentado |

Métricas intrínsecas del adjudicador sobre trazas de código: 89,11% de accuracy, Brier score 0,0891 y ECE real de 10 bins 0,0542 (métrica protegida 0,9010). El autor declara latencias de deliberación inferiores a 30 ms en MPS o CUDA, aunque la tabla anterior muestra 580-1.107 ms por etapa completa del pipeline. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para el adjudicador: el checkpoint pesa 143 MB en `system2_code.pt`; en FP32 ocuparía aproximadamente 0,6 GB y en FP16 unos 0,3 GB, más el estado de activaciones. Cifra exacta de VRAM no disponible.
- GPU recomendadas: Apple Silicon con MPS (validado en M4 Max) y NVIDIA con CUDA. No se especifican modelos concretos de NVIDIA.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint (143 MB). El cuello de botella es el generador de 7B-12B a 4 bits que acompaña al sistema, que requiere unos 6,8 GB de VRAM según la tabla del autor.
- Despliegue: paquete `system2` vía pip, API Python `System2Engine` y servidor proxy compatible con OpenAI (`python3 -m sys2.server --port 8000`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: el autor declara menos de 30 ms por deliberación en MPS/CUDA; en las pruebas de pipeline completo reporta 580 ms (2 bits), 982 ms (3 bits) y 1.107 ms (Gemma 12B a 4 bits) por etapa.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos disponibles del modelo frente a alternativas funcionales, marcando como no disponible lo que no se conoce.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tjdoomer/system2-code | Clasificador/adjudicador (ModernBERT + LoRA + 5 cabezas) | 395M base + adaptadores | no disponible | Apache 2.0 | Hugging Face, pip `system2` |
| Generador de 7B-12B a 4 bits (p. ej. Gemma 12B) | Generativo | 7B-12B | no disponible | variable | local, ~6,8 GB VRAM |
| Modelos 27B a 2-3 bits (p. ej. qwen-3.8-27b) | Generativo cuantizado | 27B | no disponible | variable | local, 6,8-10,2 GB VRAM |
| Rerankers tipo cross-encoder (p. ej. BGE reranker) | Clasificador de pares | no disponible | no disponible | variable | Hugging Face |

La comparación con rerankers genéricos no es directa: System 2 no ordena documentos frente a una consulta, sino que adjudica entre hipótesis completas con cinco perspectivas y umbral de consenso. No hay benchmarks públicos que permitan situarlo frente a otras alternativas de verificación de código.

## Limitaciones y advertencias

- Modelo muy reciente y con tracción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- Todos los benchmarks y métricas proceden del propio autor; no hay replicación externa.
- Solo soporta inglés (`en`), lo que limita su uso en entornos en castellano sin adaptación.
- No es un modelo generativo: no puede producir código ni texto por sí mismo; depende de un generador externo cuyas salidas adjudica.
- El umbral de consenso de 0,88 y la calibración están ajustados sobre trazas de código; su comportamiento en otros dominios no está documentado.
- Los ejemplos de la model card muestran que los tres pipelines evaluados fallaron en pytest por causas distintas, incluido el caso con deriva detectada: la detección de deriva no garantiza corrección, solo señala incertidumbre.
- Riesgo de alucinación del generador subyacente no mitigado por el adjudicador cuando los candidatos comparten el mismo error (consenso alto sobre una respuesta incorrecta).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `answerdotai/ModernBERT-Large-Instruct` debe verificarse por separado.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni proceso de evaluación de seguridad.
- El paquete `system2` y el servidor proxy no están auditados; ejecutarlos en producción requiere revisión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tjdoomer/system2-code
- Perfil del autor en Hugging Face: https://huggingface.co/tjdoomer
- Sitio web oficial: https://system2.online
- Repositorio GitHub: https://github.com/tj-doomer-it/System2
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-Large-Instruct
