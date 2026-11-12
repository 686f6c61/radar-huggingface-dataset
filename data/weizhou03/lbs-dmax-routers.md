# weizhou03/lbs-dmax-routers

## Resumen

LBS-dmax-routers es un repositorio de checkpoints de routers de decodificación para el modelo DMax-16B, publicado por el usuario weizhou03 en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un conjunto de pesos auxiliares (state dicts) que implementan la lógica de enrutamiento del esquema EB-Decoding (Evidence-Based Decoding) sobre trayectorias de decodificación de DMax-16B y LLaDA-2.0-mini. El repositorio está pensado para cargarse mediante la función `train_router_sdar.load_router(path, 32, device)`, lo que indica que el router opera con una ventana de 32 tokens y requiere un dispositivo (GPU/CPU) explícito.

La relevancia de estos checkpoints radica en que permiten reproducir y ajustar el comportamiento de decodificación de modelos de difusión de texto (DMax-16B y LLaDA-2.0-mini), una familia distinta de los transformers autorregresivos clásicos. Los routers seleccionan qué tokens revelar en cada paso de decodificación, por lo que su calidad afecta directamente a métricas como la precisión en GSM8K (reportada como 91.13 con 5.11 TPF en el checkpoint `ckpt_inblock_op`) y en MBPP (usado para seleccionar `ckpt_op_ce0.3` con CE<0.3).

El repositorio es muy pequeño (0.1 GB), no tiene descargas ni likes, no declara licencia, idiomas ni pipeline, y fue creado el 11 de noviembre de 2026. La información pública es escasa: la model card se limita a listar los checkpoints y sus condiciones de entrenamiento, sin especificar arquitectura del router, datos de entrenamiento detallados ni resultados completos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Router de decodificación (state dict) para EB-Decoding sobre DMax-16B / LLaDA-2.0-mini; arquitectura interna no disponible |
| Parametros totales | no disponible (repo de 0.1 GB; los checkpoints son routers, no el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la carga usa ventana W=32; existen variantes W=32/64 en `ckpt_sdar`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`router.pt`) |

## Arquitectura y entrenamiento

El repositorio contiene routers entrenados para EB-Decoding (Evidence-Based Decoding), un esquema de decodificación aplicado a modelos de difusión de texto como DMax-16B y LLaDA-2.0-mini. Los checkpoints se organizan por condición de entrenamiento: `ckpt_inblock_op` se entrenó sobre trayectorias de DMax-16B con cross-entropy inferior a 1.0 (métrica principal en GSM8K: 91.13 con 5.11 TPF); `ckpt_op_ce0.3` se entrenó con CE<0.3 y se seleccionó sobre MBPP; `ckpt_inblock_mc` y `ckpt_mc_ce*` se entrenaron sobre trayectorias de LLaDA-2.0-mini con datos de matemáticas y código, mientras que `ckpt_inblock` usa solo matemáticas. También existe `ckpt_sdar`, un port del camino SDAR con ventanas W=32/64, y `ckpt`, un router temprano reconstruido.

La model card indica que los pesos se guardan sin el token embedding congelado, de modo que deben cargarse con `train_router_sdar.load_router(path, 32, device)`. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF/DPO. La innovación técnica principal es el propio esquema de enrutamiento por evidencia para decodificación no autorregresiva, pero no se detalla su funcionamiento interno en la información disponible.

## Capacidades

- Enrutamiento de decodificación para modelos de difusión de texto DMax-16B y LLaDA-2.0-mini.
- Selección de tokens a revelar en cada paso de decodificación según la evidencia acumulada.
- Soporte de trayectorias entrenadas específicamente para matemáticas (GSM8K) y código (MBPP).
- Variantes con ventana de 32 y 64 tokens (`ckpt_sdar`).
- Carga programática mediante `train_router_sdar.load_router(path, 32, device)`.
- No es un modelo generativo autónomo: no genera texto por sí mismo, requiere el modelo base DMax-16B o LLaDA-2.0-mini.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible de forma nativa.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducción de resultados en GSM8K: cargar `ckpt_inblock_op` con `load_router` y el modelo base DMax-16B para replicar la métrica reportada de 91.13 con 5.11 TPF en tareas de aritmética de primaria.
- Evaluación en generación de código: usar `ckpt_op_ce0.3` (seleccionado sobre MBPP) para medir el rendimiento del pipeline de decodificación en benchmarks de programación Python.
- Investigación en decodificación no autorregresiva: comparar el comportamiento de routers entrenados con distintos umbrales de cross-entropy (CE<1.0 frente a CE<0.3) para estudiar el efecto del criterio de selección en la calidad de las trayectorias.
- Experimentos con LLaDA-2.0-mini: emplear `ckpt_inblock_mc` o `ckpt_mc_ce*` para evaluar decodificación guiada por router en un modelo de difusión de menor tamaño, útil en entornos con menos VRAM.
- Estudio de ventanas de contexto en decodificación: usar `ckpt_sdar` con W=32 y W=64 para analizar cómo afecta el tamaño de ventana a la precisión y al throughput (TPF).
- Desarrollo de nuevos routers: partir de los checkpoints publicados como inicialización o referencia para entrenar routers propios sobre trayectorias de otros modelos de difusión de texto.
- Análisis de sensibilidad a la selección de checkpoint: comparar `ckpt` (router temprano) con las versiones posteriores para documentar la evolución del entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Checkpoint | Resultado | Notas |
|---|---|---|---|
| GSM8K | `ckpt_inblock_op` | 91.13 (5.11 TPF) | DMax-16B, CE<1.0 |
| MBPP | `ckpt_op_ce0.3` | no disponible (solo se indica que fue el criterio de selección) | CE<0.3 |

No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los routers en sí; depende del modelo base (DMax-16B o LLaDA-2.0-mini) y de su cuantización.
- GPU recomendadas: no disponible; la carga requiere un `device` explícito, pero no se especifica el hardware mínimo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `train_router_sdar.load_router(path, 32, device)`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: solo se reporta la métrica TPF (5.11) para GSM8K con `ckpt_inblock_op`; no hay datos de latencia absoluta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LBS-dmax-routers (este repo) | Router de decodificación | no disponible | W=32/64 | no disponible | Hugging Face, 0 descargas |
| DMax-16B | Modelo de difusión de texto | 16B (según nombre) | no disponible | no disponible | Referenciado como base |
| LLaDA-2.0-mini | Modelo de difusión de texto | no disponible | no disponible | no disponible | Referenciado como base |

No se dispone de información suficiente para comparar parámetros, rendimiento o licencia con alternativas de la misma categoría (routers de decodificación para modelos de difusión). Los datos de los modelos base se limitan a lo mencionado en la model card.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base DMax-16B o LLaDA-2.0-mini y la librería `train_router_sdar`, los checkpoints no son utilizables.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor.
- Idiomas no especificados: no hay garantía de comportamiento multilingüe.
- Riesgo de alucinación: inherente al modelo base; el router no corrige errores factuales, solo selecciona tokens.
- Sesgos: no documentados; dependen de los datos de entrenamiento de DMax-16B y LLaDA-2.0-mini.
- Limitaciones de contexto: las variantes documentadas usan ventanas de 32 o 64 tokens; no se especifica el contexto máximo efectivo.
- Repositorio sin descargas ni likes: no hay evidencia de validación por la comunidad ni de mantenimiento continuo.
- Fecha de creación futura (2026-11-11): posible metadato erróneo o repositorio de investigación no consolidado.
- Resultados de benchmarks limitados: solo GSM8K con un checkpoint; el resto de métricas no están publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/weizhou03/lbs-dmax-routers
- Modelo base DMax-16B: no disponible en la información proporcionada
- Modelo base LLaDA-2.0-mini: no disponible en la información proporcionada
- Librería `train_router_sdar`: no disponible en la información proporcionada
- Paper de EB-Decoding: no disponible en la información proporcionada
