# yet-another-ai/Jet-Qwen3.5-0.8B

## Resumen

Jet-Qwen3.5-0.8B es un ajuste fino supervisado (LoRA) del modelo de texto Qwen/Qwen3.5-0.8B, publicado por yet-another-ai para alimentar Jet, un motor local de decisiones estructuradas. No es un modelo conversacional al uso: Jet no genera texto libre, sino que puntúa con teacher forcing un conjunto fijo de respuestas semánticas candidatas y devuelve la opción elegida junto con las probabilidades relativas de cada candidato. El modelo se distribuye con los pesos fusionados en BF16, el adaptador PEFT original y una cuantización GGUF Q8_0 lista para llama.cpp.

El interés práctico está en su enfoque: en lugar de pedirle al modelo que "escriba" una decisión en JSON, se le presentan candidatos cerrados y se compara la verosimilitud de cada continuación. Con solo 752.393.024 parámetros (aproximadamente 0,75B), el ajuste eleva la precisión en el conjunto de test reservado del 55,01% al 85,97% respecto al modelo base, y en MMLU (retenido, no usado en entrenamiento) del 33,56% al 48,71%, según los informes de evaluación nativos archivados en el repositorio.

Es relevante ahora por dos motivos: demuestra que un modelo sub-1B puede resolver tareas de enrutado y clasificación con alta fiabilidad si se reformula el problema como puntuación de candidatos, y lo hace con un coste de inferencia que cabe en GPU de consumo e incluso en WebGPU del navegador. La licencia Apache-2.0 y la disponibilidad de GGUF facilitan su despliegue en local sin dependencias de API.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3.5 (tag `qwen3_5_text`); detalles de capas y atención no disponibles |
| Parámetros totales | 752.393.024 (aproximadamente 0,75B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el ajuste se realizó con longitud máxima de secuencia de 2.048 tokens |
| Tipos de cuantización | BF16 (pesos fusionados), Q8_0 (GGUF publicado); otras cuantizaciones GGUF no publicadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (pesos y código de Jet); se aplica además la licencia del modelo base Qwen |
| Formato de pesos | safetensors (BF16 fusionado), adaptador PEFT/LoRA, GGUF Q8_0 |

Otros datos del repositorio: tamaño de 2,4 GB, pipeline `text-generation`, compatible con endpoints, creado el 28 de octubre de 2026. El repositorio incluye `SHA256SUMS` con checksums de todos los artefactos publicados.

## Arquitectura y entrenamiento

La arquitectura de base es la del modelo de texto Qwen3.5-0.8B, un transformer decoder, según indica el tag `qwen3_5_text`. Esta publicación contiene únicamente el modelo de texto: no incluye torre de visión ni proyector, por lo que no realiza inferencia de imágenes por sí misma. Sobre esa base se aplicó un ajuste fino supervisado con LoRA en BF16, usando el renderizador de prompts real de Jet y calculando la pérdida solo sobre los tokens de la continuación objetivo (las respuestas candidatas citadas), no sobre el prompt. No hay destilación de distribuciones de un modelo profesor ni de trazas de razonamiento, y explícitamente no se entrena salida JSON, letras de respuesta, una cabeza clasificadora ni entradas de imagen.

Los hiperparámetros registrados son: una época, rango 16, alpha 32, dropout 0,05, tasa de aprendizaje 1e-4, batch efectivo 16 (microbatch 4 × acumulación 4), semilla 42 y longitud máxima de secuencia 2.048. La preparación de datos utilizó 22.791 registros de entrenamiento: BoolQ 9.427, ARC Easy 2.248, ARC Challenge 1.116 y SNLI 10.000; la validación emplea un subconjunto determinista de como máximo 512 registros para monitorizar la pérdida por checkpoint, y MMLU se mantiene completamente fuera del entrenamiento. La innovación técnica no está en la arquitectura, sino en el paradigma de decisión: puntuación por teacher forcing de un conjunto cerrado de respuestas semánticas con normalización por longitud media de tokens, devolviendo la opción ganadora y una distribución softmax relativa sobre los candidatos.

## Capacidades

- Puntuación de decisiones estructuradas: dado un estado y una pregunta con criterios cerrados, devuelve la opción elegida y las probabilidades relativas de cada candidato.
- Clasificación y enrutado semántico sobre etiquetas predefinidas (por ejemplo, asignar un ticket al equipo de aplicación o al de infraestructura).
- Respuesta a preguntas booleanas y de comprensión lectora, heredada del entrenamiento con BoolQ.
- Razonamiento de opción múltiple de nivel escolar y de desafío, procedente de ARC Easy y ARC Challenge.
- Inferencia de relación entre frases (entailment, neutral, contradiction), procedente de SNLI.
- Salida restringida al espacio de candidatos: no genera texto libre ni JSON, lo que elimina el riesgo de formatos inválidos en producción.
- Capacidad multilingüe: no establecida; solo se declara inglés.
- Sin soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" documentado.

## Casos de uso

- Triage de incidencias en soporte: se envía el texto del ticket como estado y una pregunta de tipo `choice` con los equipos posibles como criterios; el modelo devuelve el equipo responsable y la probabilidad relativa, lo que permite enrutar automáticamente y escalar a revisión humana cuando la confianza es baja.
- Clasificación de correo entrante en bandejas: con un conjunto cerrado de categorías (facturación, técnico, comercial, spam), el modelo puntúa cada candidato sin riesgo de etiquetas inventadas, algo imposible con un modelo generativo que escribe la categoría libremente.
- Extracción de campos con vocabulario controlado: para normalizar valores (por ejemplo, severidad de un incidente entre `low`, `medium`, `high`, `critical`) presentando cada valor como candidato y eligiendo el de mayor verosimilitud.
- Etiquetado semántico a escala en pipelines de datos: al ser un modelo de 0,75B con GGUF Q8_0, puede ejecutarse en CPU o en una sola GPU de consumo para procesar lotes de miles de pares de frases (estilo SNLI) con coste marginal muy bajo.
- Moderación y cumplimiento con criterios auditables: como las opciones son explícitas y la salida es una distribución sobre ellas, se puede registrar la decisión junto con las probabilidades para auditoría, sin parsing de texto generado.
- Despliegue en el navegador o en el borde: el playground WebGPU del autor demuestra la ejecución del 0,8B en cliente; útil para asistentes locales que deben decidir sin enviar datos a un servidor.
- Sustitución de reglas heurísticas en backends: Jet expone `POST /api/alpha/decisions` en `127.0.0.1:8080`, de modo que un servicio existente puede cambiar un bloque de condicionales por una llamada al motor de decisiones.

## Benchmarks y rendimiento

Los datos publicados provienen de los informes de evaluación nativos en CUDA archivados en `evaluation/`, con pesos Q8_0 y normalización por longitud media de tokens. Miden la precisión de puntuación de candidatos de Jet, no la calidad de generación conversacional, y las probabilidades no están calibradas.

| Evaluación | Modelo base | Jet-Qwen3.5-0.8B | Ejemplos | Notas |
|---|---|---|---|---|
| Test reservado (mezcla de tareas de entrenamiento) | 55,01% | 85,97% | 16.640 | Decisión entre candidatos, no generación libre |
| MMLU completo | 33,56% | 48,71% | 14.042 | MMLU no se usó como fuente de entrenamiento |

No se han publicado resultados de benchmarks estándar de generación (MMLU en formato few-shot generativo, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,5 GB solo para pesos (752M × 2 bytes), con unos 2-3 GB contando caché KV y overhead del runtime.
- VRAM estimada en Q8_0: aproximadamente 0,8 GB para pesos y del orden de 1-1,5 GB en ejecución.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 (sobrada para este tamaño), así como en iGPU con memoria compartida y en Apple Silicon.
- Ejecución en CPU viable con llama.cpp; el propio autor distribuye el GGUF para Jet y llama.cpp.
- Despliegue documentado: `jet serve --model-path Jet-Qwen3.5-0.8B-Q8_0.gguf --model-id yet-another-ai/Jet-Qwen3.5-0.8B`, y carga con Transformers usando `subfolder="adapter"` para el adaptador PEFT.
- Compatibilidad con vLLM o TGI: no documentada por el autor; requeriría validar el renderizador de prompts de Jet, ya que Jet advierte que cargar el modelo en un chat genérico no reproduce el comportamiento de puntuación.
- Latencia y throughput: no disponibles. El autor señala que los límites de memoria y compatibilidad de WebGPU en navegador difieren de la inferencia nativa en CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jet-Qwen3.5-0.8B | 752.393.024 | No disponible (entrenado a 2.048) | 85,97% en test reservado; 48,71% en MMLU (puntuación de candidatos) | Apache-2.0 | HuggingFace, GGUF Q8_0, adaptador LoRA |
| Qwen/Qwen3.5-0.8B (base) | 0,8B (aproximado) | No disponible | 55,01% en test reservado; 33,56% en MMLU con el mismo protocolo | Licencia Qwen del modelo base | HuggingFace, revisión `2fc06364715b967f1860aea9cf38778875588b17` |
| Variante Jet 4B (Q8_0) | No disponible | No disponible | No disponible | Apache-2.0 según la model card | Solo con Jet nativo, no en el playground WebGPU |
| Otros instruct pequeños de 0,5-1B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con modelos generativos de tamaño similar no es posible con los datos publicados: las métricas de Jet miden acierto en un conjunto cerrado de candidatos, no calidad de texto libre.

## Limitaciones y advertencias

- El entrenamiento se centra en decisiones sobre texto en inglés proveniente de una mezcla pequeña de tareas (BoolQ, ARC, SNLI); el rendimiento en dominios arbitrarios y en otros idiomas no está establecido.
- La "confianza" devuelta es un softmax relativo sobre los candidatos aportados, no una certeza calibrada; no debe usarse como umbral de probabilidad sin validación propia.
- La redacción y el orden de los candidatos pueden alterar el resultado, por lo que cambios en las etiquetas exigen reevaluar el sistema.
- Las comprobaciones de solapamiento existentes no demuestran la ausencia de contaminación en el modelo base preentrenado.
- No genera JSON ni texto libre: usarlo en un chat genérico no reproduce el comportamiento de puntuación de Jet, y el autor lo advierte explícitamente.
- No incluye torre de visión ni proyector; no hace inferencia de imágenes.
- El modelo declara únicamente inglés, por lo que su uso en castellano u otros idiomas no está validado.
- Riesgo de alucinación no aplicable en el sentido clásico (la salida se restringe a candidatos), pero sí de elección errónea con alta confianza en dominios fuera de distribución.
- Las licencias de los datos de entrenamiento (BoolQ, CC BY-SA 3.0; ARC y SNLI, CC BY-SA 4.0) siguen siendo aplicables a los datos de origen, aunque no se redistribuyen registros en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yet-another-ai/Jet-Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Repositorio de Jet: https://github.com/yet-another-ai/jet
- Código de entrenamiento y exportación: https://github.com/yet-another-ai/jet/tree/main/training
- Documentación de Jet: https://jet.yetanother.ai/
- Playground WebGPU: https://huggingface.co/spaces/yet-another-ai/jet-playground
- Dataset BoolQ: https://huggingface.co/datasets/google/boolq
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente apariciones no relacionadas del término "yet" en diccionarios y recursos de idiomas.
