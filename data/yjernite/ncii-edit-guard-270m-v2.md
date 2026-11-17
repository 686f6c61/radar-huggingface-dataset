# yjernite/ncii-edit-guard-270m-v2

## Resumen

ncii-edit-guard-270m-v2 es un clasificador de texto ligero de 268,1 millones de parámetros desarrollado por yjernite, orientado a la moderación de contenido en aplicaciones de edición de imágenes y vídeo. Su función es puntuar si un prompt de edición constituye una petición probable de nudificación o de imagery íntima no consentida (NCII) sobre una persona presente en la entrada. Emplea la arquitectura `gemma3_text` como backbone, partiendo del modelo base `microsoft/harrier-oss-v1-270m`, y se distribuye como pipeline de `text-classification` en formato safetensors bajo licencia MIT.

La versión 2 introduce una ronda de destilación asimétrica: en lugar de sustituir las etiquetas duras del lado NCII (donde ningún juez zero-shot superó al estudiante supervisado), transfiere únicamente la frontera calibrada de "safe" de Shieldstral-1.0-3B mediante etiquetas suaves sobre aproximadamente 39.500 prompts reales sin etiquetar. El resultado principal es una reducción drástica del sobre-bloqueo de prompts de afecto LGBT (del 19-43 % en v1 al 1,6-3,8 % en v2) manteniendo e incluso aumentando el recall global de NCII.

El modelo está pensado como guardián previo de prompts en pipelines de generación/edición de imagen, con latencia de 4,2 ms por secuencia en A10G con bf16, lo que lo hace apto para filtrado en línea a bajo coste. No sustituye una revisión multimodal ni constituye una garantía legal de seguridad: es una señal heurística de riesgo basada exclusivamente en texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer decoder-only adaptado a clasificación) |
| Parámetros totales | 268.100.096 (268,1 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 512 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | `microsoft/harrier-oss-v1-270m` |
| Pipeline | `text-classification` (3 clases) |
| Tamaño del repositorio | 1,1 GB |
| Librería | transformers |
| Etiquetas de clase | `safe` (0), `explicit-not-person-targeted` (1), `ncii-risk` (2) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone `gemma3_text` de 268,1 M parámetros del checkpoint `microsoft/harrier-oss-v1-270m`, reconvertido como clasificador de tres clases. La entrada se trunca a 512 tokens y la salida es una distribución sobre las etiquetas `safe`, `explicit-not-person-targeted` y `ncii-risk`. No se documentan detalles sobre capas de clasificación adicionales ni sobre congelación selectiva de capas.

El entrenamiento combina etiquetas duras y etiquetas suaves. Las etiquetas duras provienen del split de entrenamiento de `yjernite/ncii-guard-train-v1` (25.670 filas: fuentes reales más familias sintéticas claramente marcadas, incluyendo familias LGBT, T2I estilo tag-soup y NCII ofuscado en leetspeak). Las etiquetas suaves provienen de Shieldstral-1.0-3B sobre 42.979 prompts reales sin etiquetar (`yjernite/ncii-guard-synth-v1`: EditScore-RL-Data Apache-2.0, RealEdit CC-BY-4.0, prompts Gustavosta sin especificar, instrucciones GEditBench-v2 sin especificar; fuentes CC-BY-NC excluidas en el filtro de licencias), de los cuales 39.492 filas cumplen p_safe ≥ 0,9. Hiperparámetros: 3 epochs, batch efectivo 32, lr 2e-5, pesos de clase [1,0; 1,8; 1,8], α = 0,5 para soft-CE, longitud máxima 512. La innovación destacable es la destilación asimétrica: solo se transfiere la frontera "safe" calibrada del profesor, manteniendo etiquetas duras en el lado NCII porque ningún juez zero-shot (Shieldstral-1.0-3B, policylm-1.7b, Qwen3Guard-Gen-4B) superó al estudiante supervisado en esa dimensión.

## Capacidades

- Clasificación de prompts de edición de imagen/vídeo en tres categorías: `safe`, `explicit-not-person-targeted` y `ncii-risk`.
- Detección de peticiones de nudificación o sexualización de personas presentes en la entrada (señal de riesgo NCII).
- Discriminación entre contenido sexual sin persona objetivo y contenido sexual dirigido a una persona identificable.
- Manejo de prompts ofuscados en leetspeak (familia de entrenamiento específica).
- Manejo de prompts estilo T2I tag-soup (familia de entrenamiento específica).
- Robustez frente a prompts de afecto LGBT, con falsos positivos del 1,6-3,8 % según el slice demográfico.
- Integración directa con `transformers.pipeline("text-classification")`.
- Compatibilidad con Text Embeddings Inference (`text-embeddings-inference`) y endpoints compatibles (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es exclusivamente un clasificador de texto.
- Multilingüe: no; solo inglés.

## Casos de uso

- Filtrado previo de prompts en herramientas de edición de imagen generativa: el guardián puntúa cada prompt antes de enviarlo al modelo de difusión y bloquea o redirige las peticiones con etiqueta `ncii-risk`, con 4,2 ms por secuencia en A10G y bf16, lo que permite filtrar en línea sin cuello de botella.
- Moderación de prompts en plataformas de edición de vídeo: al clasificar solo texto, se puede aplicar antes de la fase costosa de generación, evitando consumo de GPU en peticiones de nudificación y registrando la decisión para auditoría.
- Triaje en colas de revisión humana: las tres clases permiten enrutar los prompts `ncii-risk` a revisión manual, los `explicit-not-person-targeted` a políticas específicas de contenido sexual y los `safe` a generación directa, reduciendo la carga de moderadores.
- Detección de prompts ofuscados en comunidades abiertas: la familia de entrenamiento en leetspeak permite detectar variantes evasivas de peticiones de nudificación que los filtros por palabras clave no capturan.
- Reducción de falsos positivos en comunidades LGBT: la mejora de v2 (FPR de 1,6 % en referencias de orientación, 2,9 % en referencias trans, 3,8 % en identidad-otro) lo hace adecuado como guardián en plataformas con población usuaria LGBT sensible al sobre-bloqueo de prompts de afecto.
- Guardián de bajo coste en despliegues con GPU consumer: con 268,1 M parámetros y pesos safetensors de 1,1 GB, puede servirse en una única GPU pequeña o incluso en CPU (fp32, sin optimizar) para prefiltrar prompts antes de un modelo mayor.
- Componente de pipeline de seguridad en CI/CD de productos de edición: al ser MIT y exponerse como pipeline estándar de transformers, se puede integrar como paso de validación en tests de regresión de prompts y en despliegues automatizados.

## Benchmarks y rendimiento

Evaluación sobre `yjernite/ncii-guard-eval-v1` (3.197 filas, control de leakage, columnas proxy demográficas y slices LGBT sintéticos marcados). v1 y v2 puntuados sobre el mismo conjunto.

| Métrica | v1 | v2 |
|---|---:|---:|
| macro F1 | 0,778 | 0,847 |
| ncii F1 / recall (global) | 0,850 / 0,904 | 0,889 / 0,912 |
| explicit F1 | 0,553 | 0,692 |
| FPR en safe (global) | 0,096 | 0,039 |
| XSTest over-refusal FPR | 0,156 | 0,096 |
| i2p/T2I-style ncii recall | 0,333 [0,186-0,522] | 0,519 [0,340-0,693] |
| ncii recall real (`curated-splits-test`, n=70) | 0,743 [0,630-0,831] | 0,671 [0,555-0,770] |
| FPR femenino / masculino (proxy por nombre) | 0,189 / 0,070 | 0,113 / 0,057 |
| FPR por proxy étnico (white/api/black/hispanic) | 0,040 / 0,079 / 0,137 / 0,212 | 0,035 / 0,037 / 0,078 / 0,135 |
| LGBT over-refusal FPR, orientation-ref | 0,429 [0,314-0,551] | 0,016 [0,003-0,085] |
| LGBT over-refusal FPR, trans-ref | 0,186 [0,112-0,292] | 0,029 [0,008-0,098] |
| LGBT over-refusal FPR, identity-other (nonbinary/drag) | 0,308 [0,165-0,500] | 0,038 [0,007-0,189] |

Baseline binario `hfmlsoc/ncii-light-guard-v01` sobre el mismo conjunto: recall ncii 0,720 global / 0,814 en filas reales, FPR 0,076, sin clase explicit.

Latencia: 4,2 ms por secuencia (batch 8, A10G, CUDA, bf16). En CPU (fp32, sin optimizar) el dato está cortado en la model card y no se dispone del valor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 268,1 M parámetros y pesos safetensors de 1,1 GB, la huella en bf16 ronda los 0,5-0,6 GB de pesos más activaciones y overhead del runtime, por lo que cabe holgadamente en GPUs consumer.
- GPU recomendadas: A10G (referencia de latencia del autor, 4,2 ms/seq con batch 8 y bf16); cualquier GPU consumer reciente (RTX 3060 12 GB, RTX 4070, RTX 4090) es sobradamente suficiente para servir el modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con ≥ 4 GB de VRAM en bf16/fp16; también se documenta ejecución en CPU en fp32 sin optimizar (latencia no disponible).
- Opciones de despliegue: `transformers` pipeline (referencia del autor), Text Embeddings Inference (`text-embeddings-inference`), endpoints compatibles (`endpoints_compatible`). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 4,2 ms/seq con batch 8 en A10G, CUDA y bf16. Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yjernite/ncii-edit-guard-270m-v2` | 268,1 M | máx. entrenamiento 512 tokens | 3 clases (safe / explicit / ncii-risk); destilación asimétrica | MIT | Hugging Face, transformers, TEI |
| `yjernite/ncii-edit-guard-270m-v1` | 268,1 M | máx. entrenamiento 512 tokens | 3 clases; etiquetas duras | MIT | Hugging Face |
| `hfmlsoc/ncii-light-guard-v01` | no disponible | no disponible | 2 clases (binario), sin clase explicit | no disponible | Hugging Face |
| Shieldstral-1.0-3B (profesor de etiquetas suaves) | 3 B | no disponible | juez de seguridad zero-shot | no disponible | usado como profesor en este trabajo |
| policylm-1.7b | 1,7 B | no disponible | juez de seguridad zero-shot | no disponible | evaluado en `teacher_pilot/` |
| Qwen3Guard-Gen-4B | 4 B | no disponible | juez de seguridad zero-shot | no disponible | evaluado en `teacher_pilot/` |

Rendimiento comparado sobre `ncii-guard-eval-v1`: v2 supera a v1 en macro F1 (0,847 vs 0,778), F1 ncii (0,889 vs 0,850), recall ncii global (0,912 vs 0,904), F1 explicit (0,692 vs 0,553), FPR safe (0,039 vs 0,096) y over-refusal LGBT (1,6-3,8 % vs 19-43 %). Frente al baseline binario `hfmlsoc/ncii-light-guard-v01`, v2 tiene mayor recall ncii global (0,912 vs 0,720) y menor FPR (0,039 vs 0,076), pero pierde en recall sobre filas reales (0,671 vs 0,814) y aporta una clase explicit que el baseline no tiene.

## Limitaciones y advertencias

- Solo texto: nunca ve la imagen o el vídeo de entrada, por lo que no puede verificar si la persona objetivo existe realmente ni evaluar el contexto visual.
- Los slices demográficos son proxies por nombre o regex, no autoidentificación; los slices LGBT mezclan filas reales (solo 37 filas trans-ref, muestra muy fina) y filas sintéticas marcadas que comparten proceso de generación con una familia de entrenamiento, por lo que deben leerse como test de regresión dirigido y no como estimación de distribución natural independiente.
- El recall sobre NCII real (≈ 0,63-0,67 en filas reales) es la limitación crítica para despliegue: aproximadamente 1 de cada 3 formulaciones reales sutiles se escapa. En v2 el recall en las 70 filas reales reservadas bajó de 0,743 a 0,671 (intervalos de confianza solapados con ese n), aunque el recall sobre todas las filas reales combinadas se mantiene en 0,629.
- El consentimiento no es inferible desde texto: las puntuaciones son heurísticas, no prueba de intención ni de daño.
- No es una garantía legal ni de seguridad; las obligaciones de los deployers en la UE exigen más que un clasificador de texto.
- El dataset Grok de NCII real sigue pendiente de compuerta manual y no está incluido; se incorporará en una versión futura.
- Solo inglés: prompts en otros idiomas no están cubiertos ni evaluados.
- Persisten disparidades demográficas en FPR: 0,113 en proxy femenino frente a 0,057 en masculino, y 0,135 en proxy hispanic frente a 0,035 en white.
- Licencia MIT permite uso comercial, pero al derivar de `microsoft/harrier-oss-v1-270m` conviene verificar las condiciones del modelo base; las fuentes CC-BY-NC fueron excluidas del entrenamiento en el filtro de licencias.
- Riesgo de alucinación no aplica en el sentido generativo (es un clasificador), pero sí el riesgo de clasificación errónea silenciosa en prompts ambiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yjernite/ncii-edit-guard-270m-v2
- Versión anterior (v1): https://huggingface.co/yjernite/ncii-edit-guard-270m-v1
- Resultados de evaluación v2: https://huggingface.co/yjernite/ncii-edit-guard-270m-v2/blob/main/eval/results.json
- Resultados de evaluación v1: https://huggingface.co/yjernite/ncii-edit-guard-270m-v1/blob/main/eval/results.json
- Conjunto de evaluación: https://huggingface.co/datasets/yjernite/ncii-guard-eval-v1
- Resultados del baseline binario: https://huggingface.co/datasets/yjernite/ncii-guard-eval-v1/blob/main/baseline_lightguard_results.json
- Piloto de profesores (teacher pilot): https://huggingface.co/datasets/yjernite/ncii-guard-eval-v1/tree/main/teacher_pilot
- Datos de entrenamiento (etiquetas duras): https://huggingface.co/datasets/yjernite/ncii-guard-train-v1
- Datos de etiquetas suaves: https://huggingface.co/datasets/yjernite/ncii-guard-synth-v1
- Splits de validación: `yjernite/ncii-guard-splits-v3-2k` (referenciado en la model card; URL no proporcionada)
- Baseline binario: https://huggingface.co/hfmlsoc/ncii-light-guard-v01
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-270m
- ML Intern: https://hf.co/chat?mode=ml-intern
- Paper de referencia (Gemma): arXiv:2211.05105
- Paper de referencia: arXiv:2308.01263
