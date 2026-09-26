# twainsk/qev-230m-mlx

## Resumen

Qev-230M-MLX es un checkpoint de decisión estructurada publicado por el usuario twainsk dentro del proyecto Qev (repositorio loadchange/qev). Se construye sobre el modelo fundacional LiquidAI/LFM2.5-230M, que se incluye sin modificar en `backbone/`, y añade dos artefactos nuevos entrenados por el proyecto: un adaptador LoRA conmutable y una cabeza *pointer* de 256 dimensiones que puntúa opciones de respuesta candidatas. No es, por tanto, un modelo de generación de texto nuevo, sino una capa de decisión sobre un backbone de 230 millones de parámetros.

Su propósito es resolver decisiones de opción múltiple o clasificación devolviendo probabilidades reales por candidato en lugar de JSON generado como texto. Expone esta funcionalidad mediante una API estilo Jev/TypeSafe (`POST /v1/systemone`), mientras que el chat nativo (`/v1/chat/completions`) desactiva el LoRA y usa el modelo base sin modificar. Está diseñado específicamente para Apple Silicon y se distribuye en formato MLX, con un consumo máximo de memoria de 1,2 GiB y una latencia de decisión de 43 ms en bf16 sobre un M4.

Es relevante porque demuestra un patrón poco habitual: reutilizar un modelo pequeño como motor de decisión con puntuación probabilística, en lugar de emplear grandes modelos generativos para tareas de clasificación o enrutamiento. Acepta únicamente texto y rechaza entradas de imagen o vídeo, derivando a twainsk/qev-450m para cargas multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LiquidAI/LFM2.5-230M (familia LFM2) mas adaptador LoRA y cabeza pointer de 256 dimensiones |
| Parametros totales | 230 M en el backbone; 16,1 M de parametros entrenados adicionales (LoRA + pointer head) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (MLX); no se documentan variantes GGUF ni INT en la informacion disponible |
| Idiomas soportados | en, zh |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (MLX): decision_adapters.safetensors, pointer.safetensors y backbone/ byte-identical a upstream |

## Arquitectura y entrenamiento

El modelo combina un backbone denso de 230 millones de parámetros (LFM2.5, revisión `40cb2ad3…fa45`, byte-idéntica al original) con un adaptador LoRA de rango 64 y alpha 128 aplicado sobre las proyecciones `q/k/v/out_proj`, `in_proj` y las capas MLP `w1/w2/w3` de las 14 capas del modelo. Sobre esa representación se añade una cabeza *pointer* de 256 dimensiones que actúa como scorer de candidatos. El adaptador y la cabeza se mantienen separados del fundacional y son conmutables: se activan durante la inferencia de decisión y se desactivan en el chat nativo. El modelo expone un `qev_config.json` con formato Qev versión 3, `family: lfm2`, `runtime: mlx` y modalidades `["text"]`.

El entrenamiento siguió la misma receta y datos que qev-450m: 17.892 preguntas de entrenamiento, 1.120 de calibración y 1.380 de desarrollo, con una única A100 de 40 GB, 4 épocas, batch 8 con acumulación 2 (4.476 actualizaciones, unos 16 minutos), learning rate 1e-4 con scheduler coseno y el fundacional congelado. Se entrenaron 16,1 millones de parámetros y se ajustó una temperatura de `4.59479341998814` sobre el split de calibración. No se documenta RLHF ni DPO; la innovación principal es el uso de una cabeza pointer que produce probabilidades reales sobre opciones suministradas en lugar de texto generado.

## Capacidades

- Puntuación de decisiones estructuradas: evalúa opciones de respuesta suministradas y devuelve probabilidades por candidato, no JSON generado.
- Interfaz estilo Jev / TypeSafe mediante `POST /v1/systemone`.
- Chat nativo mediante `/v1/chat/completions`, que desactiva el LoRA y emplea el fundacional sin modificar.
- Reconocimiento de intención en consultas como "¿se solicita un reembolso?" o "¿el cliente pide duplicar un cargo?".
- Soporte de agentes en bucle cerrado, validado con partidas de Snake sembradas.
- Capacidades multilingües limitadas a inglés y chino; el chino se cubre con cuatro familias de reglas sintéticas.
- Uso como motor de enrutamiento o clasificación con latencia baja y sin necesidad de PyTorch.
- Restricción explícita: no acepta imagen ni vídeo, devuelve error ante esas entradas.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puntúa opciones como "¿se solicita reembolso?" o "¿es una incidencia de facturación?" y devuelve probabilidades que alimentan el enrutamiento automático hacia el equipo correspondiente.
- Enrutamiento de consultas en pipelines de agentes: dado un conjunto de intenciones candidatas, el scorer elige la ruta con mayor probabilidad, con 43 ms de latencia por decisión en un M4.
- Verificación de respuestas en sistemas RAG: comprobar si una respuesta candidata satisface la pregunta original puntuándola frente a alternativas, sin depender de la generación de texto.
- Automatización de decisiones de negocio con reglas acotadas: por ejemplo, aprobar o rechazar solicitudes simples, devolviendo la probabilidad de cada opción para dejar trazas auditable.
- Validación de pipelines en local sobre Apple Silicon: al consumir 1,2 GiB de pico y no requerir PyTorch, permite prototipar decisiones en portátiles M4 sin GPU dedicada.
- Demostración y test de agentes en entornos de juego controlados: el proyecto valida el modelo con partidas de Snake en bucle cerrado (20 partidas sembradas, media de 43,4 alimentos y cero colisiones).
- Filtrado previo en sistemas multilingües inglés-chino: clasificación de intención para consultas en ambos idiomas, con 90 % de acierto en el subconjunto chino de desarrollo.
- Punto de control ligero para experimentos de destilación o comparación de cabezas de decisión sobre un backbone pequeño congelado.

## Benchmarks y rendimiento

Conjunto de desarrollo (1.380 preguntas), referencia PyTorch; MLX coincide dentro de 6 cambios de argmax.

| Subconjunto | Precision |
|---|---|
| Todos | 85,2 % |
| Snake (500) | 99,0 % |
| Texto general (880) | 77,4 % |
| Chino (50) | 90,0 % |

Comparativa frente al checkpoint Qwen3.5-0.8B sobre preguntas idénticas: −4,3 puntos en texto general (McNemar p=0,002) y paridad en Snake (p=1,0). Paridad MLX frente a PyTorch sobre las 1.380 preguntas de desarrollo: 6 cambios de argmax en modo `adapter` (diferencia máxima de probabilidad 0,059) y 6 en `bf16` (0,062), sin cambios netos de precisión. En un Apple M4 de 16 GB: decisión Snake p50 de 60 ms en modo `adapter` y 43 ms en `bf16`, pico de memoria MLX ≤1,2 GiB y chat nativo de aproximadamente 170 tokens/s en `bf16`.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon. Requiere macOS 14 o superior y Python 3.12 o superior.
- Memoria: pico de MLX ≤1,2 GiB, por lo que cabe holgadamente en cualquier Mac con 8 GB o más (validado en M4 de 16 GB).
- GPU: no usa CUDA; no está pensado para A100, H100 ni RTX. El entrenamiento original sí se realizó en una A100 de 40 GB, pero la inferencia publicada es solo MLX.
- Software: validado con MLX 0.32.2 y mlx-vlm 0.7.1. No requiere PyTorch.
- Despliegue: runtime Qev (instalación vía Homebrew con `brew tap loadchange/qev` y `brew install loadchange/qev/qev`), o desde código fuente con `uv sync --python 3.12 --extra mlx`. No es compatible con `mlx_lm.generate` ni con pipelines genéricos de Transformers, ya que no cargan la cabeza pointer ni los adaptadores conmutables.
- Latencia: 43 ms por decisión en bf16 y 60 ms en modo adaptador sobre M4. Throughput de chat nativo de unos 170 tokens/s en bf16.
- Descarga: aproximadamente 0,5 GB (tamaño del repositorio 0,5 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qev-230m-mlx (este) | 230 M + 16,1 M entrenados | no disponible | 85,2 % en dev; 99,0 % Snake; 77,4 % texto general; 90,0 % chino | LFM Open License v1.0 | HuggingFace, solo MLX |
| qev-450m | no disponible | no disponible | superior en estabilidad de orden de opciones (−1,0 pt frente a −8,1 pt) | no disponible | HuggingFace, multimodal |
| Qwen3.5-0.8B (checkpoint) | 0,8 B | no disponible | +4,3 pt en texto general frente a qev-230m; paridad en Snake | no disponible | no disponible |
| LiquidAI/LFM2.5-230M (base) | 230 M | no disponible | fundacional sin cabeza de decisión | LFM Open License v1.0 | HuggingFace |

## Limitaciones y advertencias

- Solo texto: las entradas de imagen y vídeo se rechazan con el error "qev-230m accepts text only". Para cargas con imágenes hay que usar qev-450m.
- Alta sensibilidad al orden de las opciones: invertir el orden de las opciones cambia el 16,4 % de las elecciones y cuesta 8,1 puntos (de 85,3 % a 77,2 %), frente al 7,2 % / −1,0 pt de qev-450m y el 3,6 % / ±0 del checkpoint Qwen3.5. Si la estabilidad ante el orden es crítica, se recomienda qev-450m.
- Cobertura del chino limitada: solo cuatro familias de reglas sintéticas, y el subconjunto de evaluación en chino tiene únicamente 50 preguntas.
- La compatibilidad de API no implica igualar la calidad del modelo Jev ni sus valores de confianza.
- Licencia LFM Open License v1.0: el uso comercial por parte de una entidad legal con ingresos anuales iguales o superiores a 10 millones de dólares no está licenciado.
- No es un modelo de generación general: el adaptador y la cabeza pointer requieren el runtime Qev. Usar `mlx_lm.generate` o un pipeline genérico de Transformers no carga estos componentes y da resultados incorrectos.
- Requiere macOS 14+ y Apple Silicon; no hay soporte CUDA en la distribución publicada.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twainsk/qev-230m-mlx
- Modelo multimodal relacionado: https://huggingface.co/twainsk/qev-450m-mlx
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Repositorio del proyecto Qev: https://github.com/loadchange/qev
- Licencia LFM Open License v1.0: incluida en el repositorio (`LICENSE`)
- Aviso de atribución: incluido en el repositorio (`NOTICE`)
- Informes de evaluación, procedencia y paridad MLX: carpeta `reports/` del repositorio
- Manifiesto de release con tamanos y digests SHA-256: `release_manifest.json`
- Configuracion Qev: `qev_config.json`
