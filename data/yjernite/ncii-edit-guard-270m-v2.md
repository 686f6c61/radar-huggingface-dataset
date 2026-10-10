# yjernite/ncii-edit-guard-270m-v2

## Resumen

ncii-edit-guard-270m-v2 es un clasificador de texto de 268,1 millones de parámetros desarrollado por el usuario yjernite (con la etiqueta de construcción automática ML Intern). Se trata de la segunda versión de un *prompt guard* pensado para aplicaciones de edición de imágenes y vídeo: recibe el texto de una instrucción de edición y emite una de tres etiquetas —`safe`, `explicit-not-person-targeted` y `ncii-risk`—, de modo que el sistema pueda bloquear peticiones de nudificación o de generación de imágenes íntimas no consentidas (NCII) antes de ejecutar el modelo generativo.

El modelo parte de `microsoft/harrier-oss-v1-270m` (arquitectura `gemma3_text`) y se ha ajustado como clasificador de secuencias de tres clases. Su relevancia radica en el equilibrio que busca entre dos fallos clásicos de los filtros de seguridad: por un lado, la baja sensibilidad ante peticiones reales de NCII; por otro, el sobre-rechazo de contenido legítimo, en especial de muestras de afecto LGBT, que en la versión v1 alcanzaba tasas de falsos positivos del 19-43 % según el segmento.

La v2 introduce una ronda de destilación asimétrica: mantiene etiquetas duras en el lado NCII y transfiere únicamente la frontera calibrada de `safe` de un juez de seguridad mayor (Shieldstral-1.0-3B), lo que reduce el sobre-rechazo a 1,6-3,8 % en los mismos segmentos mientras incrementa el *recall* global de NCII. Está publicado con licencia MIT, solo en inglés y en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`gemma3_text`) con cabeza de clasificación de secuencia de 3 clases |
| Parametros totales | 268.100.096 (268,1 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha; el entrenamiento usa `max len 512` |
| Tipos de cuantizacion | no se publican variantes cuantizadas; el repo contiene pesos safetensors (0,6 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | microsoft/harrier-oss-v1-270m |
| Latencia declarada | 4,2 ms/secuencia (batch 8, A10G, CUDA, bf16) |
| Etiquetas de salida | `safe` (0), `explicit-not-person-targeted` (1), `ncii-risk` (2) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia `gemma3_text` (el mismo tronco que `microsoft/harrier-oss-v1-270m`) al que se ha añadido una cabeza de clasificación para producir tres logits por secuencia. No genera texto: solo puntúa la instrucción de edición. La innovación principal no está en la arquitectura, sino en el esquema de entrenamiento por destilación asimétrica.

Los experimentos piloto del autor mostraron que ningún juez de seguridad *zero-shot* (Shieldstral-1.0-3B, policylm-1.7b y Qwen3Guard-Gen-4B) superaba al estudiante supervisado en el lado NCII, por lo que la v2 conserva etiquetas duras para esa clase y transfiere únicamente aquello en lo que los jueces sí eran mejores: la frontera calibrada de `safe` de Shieldstral-1.0-3B, mediante etiquetas suaves (`p_safe >= 0.9`, peso KL 0,5) sobre aproximadamente 39.500 prompts reales sin etiquetar. Se añadieron además familias de entrenamiento con etiquetas conocidas por construcción: ediciones contrastivas seguras de afecto LGBT repartidas en 10 celdas de identidad, NCII al estilo *tag soup* de T2I y NCII ofuscada en leetspeak.

Los datos duros provienen del split de entrenamiento de `yjernite/ncii-guard-train-v1` (25.670 filas, con fuentes reales y sintéticas marcadas). Las etiquetas suaves se generaron sobre 42.979 prompts reales de `yjernite/ncii-guard-synth-v1` (EditScore-RL-Data con Apache-2.0, RealEdit con CC-BY-4.0, prompts de Gustavosta y GEditBench-v2), excluyendo en la puerta de licencias las fuentes CC-BY-NC. El conjunto de desarrollo combina filas reales reservadas, el split de validación de `ncii-guard-splits-v3-2k` y 150 filas sintéticas. La configuración de entrenamiento fue: 3 épocas, batch efectivo 32, learning rate 2e-5, pesos de clase `[1.0, 1.8, 1.8]`, `alpha=0.5` para la soft-CE y longitud máxima 512.

## Capacidades

- Clasificación de instrucciones de edición en tres clases discretas, con puntuación de confianza asociada.
- Detección de peticiones de nudificación o sexualización de una persona presente en la entrada (`ncii-risk`).
- Distinción de contenido sexual o de desnudez que no tiene como objetivo a una persona identificable (`explicit-not-person-targeted`), clase ausente en el *baseline* binario.
- Mitigación explícita del sobre-rechazo: tasas de falso positivo muy bajas en prompts de afecto LGBT (1,6-3,8 % en los segmentos evaluados).
- Uso como clasificador vía `transformers.pipeline("text-classification")`, con soporte declarado para Text Embeddings Inference y *endpoints compatible*.
- No genera texto, no hace *tool calling*, no soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de visión: nunca observa la imagen o el vídeo de entrada.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Filtro previo a la inferencia en aplicaciones de edición de imagen: el *guard* se coloca delante del modelo generativo y bloquea los prompts con etiqueta `ncii-risk` antes de consumir cómputo de difusión.
- Moderación en editores de vídeo con funciones de retoque de personas: al evaluar el texto de la instrucción, detecta intentos de nudificación sin necesidad de procesar el vídeo, lo que reduce coste y latencia del pipeline de moderación.
- Puerta de seguridad en plataformas T2I/I2I con entrada de usuario libre: la clase intermedia `explicit-not-person-targeted` permite aplicar políticas diferenciadas al contenido sexual genérico frente a la sexualización de personas.
- Auditoría y análisis retrospectivo de logs: al ser un clasificador de 4,2 ms por secuencia en GPU, permite repasar lotes grandes de prompts históricos para estimar la prevalencia de intentos de NCII.
- Reducción de falsos positivos en productos multilingües parcialmente traducidos al inglés: se puede usar como capa secundaria de un filtro más agresivo, con umbral ajustable según la tolerancia del producto al sobre-rechazo.
- Investigación sobre sesgos en sistemas de seguridad: el conjunto de evaluación incluye ejes demográficos *proxy* (nombre, etnia, orientación, identidad de género), lo que permite medir disparidad de falsos positivos entre segmentos.
- Despliegue en el borde o en CPU dentro de una VPN de empresa: con 268 M de parámetros, cabe en entornos sin GPU dedicada para preprocesar instrucciones antes de enviarlas a un servicio externo.

## Benchmarks y rendimiento

Todos los números comparan v1 y v2 sobre el mismo conjunto de evaluación (`yjernite/ncii-guard-eval-v1`, 3.197 filas, con control de fuga de datos).

| Metrica | v1 | v2 |
|---|---:|---:|
| macro F1 | 0,778 | 0,847 |
| ncii F1 / recall (global) | 0,850 / 0,904 | 0,889 / 0,912 |
| explicit F1 | 0,553 | 0,692 |
| FPR sobre `safe` (global) | 0,096 | 0,039 |
| FPR de sobre-rechazo en XSTest | 0,156 | 0,096 |
| recall de ncii estilo i2p/T2I | 0,333 [0,186-0,522] | 0,519 [0,340-0,693] |
| recall de ncii real (`yjernite-splits-test`, n=70) | 0,743 [0,630-0,831] | 0,671 [0,555-0,770] |
| FPR mujer / hombre (proxy por nombre) | 0,189 / 0,070 | 0,113 / 0,057 |
| FPR por etnia (blanca/api/negra/hispana) | 0,040 / 0,079 / 0,137 / 0,212 | 0,035 / 0,037 / 0,078 / 0,135 |
| FPR de sobre-rechazo LGBT — orientación | 0,429 [0,314-0,551] | 0,016 [0,003-0,085] |
| — referencia trans | 0,186 [0,112-0,292] | 0,029 [0,008-0,098] |
| — identidad-otra (no binaria/drag) | 0,308 [0,165-0,500] | 0,038 [0,007-0,189] |

Referencia adicional: el *baseline* binario `hfmlsoc/ncii-light-guard-v01` obtiene, sobre el mismo conjunto, un recall de NCII de 0,720 global y 0,814 en filas reales, con un FPR de 0,076 y sin clase `explicit`. La única regresión de la v2 es el recall sobre las 70 filas reales reservadas (de 0,743 a 0,671, con intervalos de confianza solapados); el recall combinado sobre todas las filas reales se mantiene en 0,629.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del recuento de parámetros): ~0,54 GB en bf16/fp16 con batch pequeño, ~1,07 GB en fp32, ~0,27 GB en int8 y ~0,14 GB en int4. Son estimaciones derivadas del tamaño, no cifras publicadas por el autor.
- El modelo cabe holgadamente en cualquier GPU de consumo con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) y también en Apple Silicon vía MPS.
- También puede ejecutarse en CPU; la model card menciona una medición en CPU fp32 sin optimizar, pero el dato aparece truncado en la información disponible.
- GPU de referencia usada por el autor: NVIDIA A10G en CUDA con bf16, con 4,2 ms por secuencia en batch 8.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y Text Embeddings Inference (etiqueta `text-embeddings-inference`). Los pesos se distribuyen en safetensors.
- El *throughput* exacto en otras GPU, y las cifras de latencia en vLLM, llama.cpp u Ollama, no están publicados; al tratarse de un clasificador de secuencia, el soporte en esos motores no está garantizado sin conversión previa.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto | Recall NCII (global) | FPR | Licencia |
|---|---|---|---|---|---|---|
| ncii-edit-guard-270m-v2 | 268,1 M | 3 | max len 512 en entrenamiento | 0,912 | 0,039 | MIT |
| ncii-edit-guard-270m-v1 | 268,1 M (mismo tronco) | 3 | max len 512 en entrenamiento | 0,904 | 0,096 | MIT |
| hfmlsoc/ncii-light-guard-v01 | no disponible | 2 (binario) | no disponible | 0,720 | 0,076 | no disponible |
| microsoft/harrier-oss-v1-270m | 270 M aprox. | no aplica (modelo base) | no disponible | no aplica | no aplica | no disponible |

La ventaja de la v2 frente a la v1 se concentra en el FPR (0,039 frente a 0,096) y en la drástica caída del sobre-rechazo LGBT, manteniendo el recall global. Frente al *baseline* binario de `hfmlsoc`, gana en recall global y añade la clase `explicit`, aunque el *baseline* conserva mejor recall en filas reales (0,814 frente a 0,671 en el subconjunto de 70).

## Limitaciones y advertencias

- Solo texto: el modelo nunca ve la imagen o el vídeo de entrada, por lo que no puede verificar si el sujeto está realmente presente ni si la edición solicitada se ejecutaría.
- Los segmentos demográficos de la evaluación son *proxies* por nombre o expresión regular, no autoidentificación. Las muestras LGBT mezclan filas reales (solo 37 de referencia trans) y filas sintéticas marcadas que comparten proceso de generación con una familia de entrenamiento: deben leerse como comprobación de regresión dirigida, no como estimación de la distribución natural.
- El recall sobre NCII real (0,63-0,67 en filas reales) sigue siendo la limitación crítica para producción: aproximadamente una de cada tres formulaciones reales sutiles no se detecta.
- El consentimiento no es inferible a partir del texto; las puntuaciones son heurísticas y no prueba de intención ni de daño.
- No constituye una garantía legal ni de seguridad. Las obligaciones del despliegue europeo exigen más que un clasificador de texto.
- El conjunto de NCII real de Grok sigue sin incluirse (la puerta manual está pendiente); el autor prevé incorporarlo en una versión futura.
- Sesgos medidos en v2: el FPR en el *proxy* femenino (0,113) duplica el masculino (0,057), y el FPR por etnia sigue siendo mayor en los segmentos negro (0,078) e hispano (0,135) que en blanco (0,035) o api (0,037).
- Idiomas: solo inglés; cualquier prompt en otro idioma queda fuera del dominio cubierto.
- Licencia MIT, sin restricción para uso comercial, pero el autor advierte explícitamente contra tratarla como una salvaguarda suficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yjernite/ncii-edit-guard-270m-v2
- Versión anterior: https://huggingface.co/yjernite/ncii-edit-guard-270m-v1
- Conjunto de evaluación: https://huggingface.co/datasets/yjernite/ncii-guard-eval-v1
- Resultados de los jueces piloto (*teacher pilot*): https://huggingface.co/datasets/yjernite/ncii-guard-eval-v1/tree/main/teacher_pilot
- Datos de entrenamiento (etiquetas duras): https://huggingface.co/datasets/yjernite/ncii-guard-train-v1
- Datos de etiquetas suaves: https://huggingface.co/datasets/yjernite/ncii-guard-synth-v1
- Resultados de v2: https://huggingface.co/yjernite/ncii-edit-guard-270m-v2/blob/main/eval/results.json
- Resultados de v1: https://huggingface.co/yjernite/ncii-edit-guard-270m-v1/blob/main/eval/results.json
- Resultados del *baseline* binario: https://huggingface.co/datasets/yjernite/ncii-guard-eval-v1/blob/main/baseline_lightguard_results.json
- *Baseline* binario: https://huggingface.co/hfmlsoc/ncii-light-guard-v01
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-270m
- ML Intern: https://hf.co/chat?mode=ml-intern
- Paper referenciado (arXiv 2211.05105): https://arxiv.org/abs/2211.05105
- Paper referenciado (arXiv 2308.01263): https://arxiv.org/abs/2308.01263
