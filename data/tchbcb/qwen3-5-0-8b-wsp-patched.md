# tchbcb/Qwen3.5-0.8B-WSP-patched

## Resumen

Qwen3.5-0.8B-WSP-patched es un artefacto de investigación publicado por el usuario independiente tchbcb sobre el modelo base Qwen/Qwen3.5-0.8B de Alibaba. No es un modelo entrenado desde cero ni un fine-tuning convencional: es una reproducción metodológica del artículo "Sparks of Weight-Space Programming" (MIT CSAIL, noviembre de 2026) que interviene directamente sobre los pesos de la red para intentar corregir un fallo de repetición en modo *thinking*.

La intervención consiste en escalar columnas concretas de la matriz `down_proj` de las capas MLP (64 neuronas por capa en las capas 11 y 10, factor beta=0.5), afectando a 131.072 pesos, un 0,016% del total. El modelo conserva la arquitectura y el tamaño del original: 752.393.024 parámetros, formato safetensors, licencia Apache-2.0 y pipeline de text-generation.

Su relevancia es fundamentalmente metodológica y de interpretabilidad: demuestra que es posible diagnosticar y editar comportamientos a nivel de neurona en el espacio de pesos, pero también documenta honestamente que la reparación no se traduce en mejoras funcionales medibles en el presupuesto de evaluación usado (4096 tokens). No debe confundirse con una versión mejorada del modelo base para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, módulo `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B original, un transformer decoder-only de la familia Qwen3.5 con módulo de texto `qwen3_5_text`. No se ha realizado entrenamiento adicional: la intervención es una edición estática de pesos (*weight-space programming*) sin descenso de gradiente ni optimizador LLM, sustituido por un pipeline estadístico automatizado (`code/wsp_gpu.py`) que diagnostica la dirección de repetición, la atribuye a neuronas MLP y escala sus columnas en `down_proj`.

El pipeline consta de tres fases: diagnóstico (escaneo denso de todas las capas, `results/diagall.npz`), atribución (identificación de las neuronas responsables) y parcheo (escalado de columnas con beta=0.5 y k=64 neuronas por capa). Una desviación relevante respecto al artículo original: el optimizador del blog destacaba las capas 15 y 19, mientras que el escaneo denso de este autor localiza la dirección de repetición más fuerte en las capas 11 y 10 para esta instantánea concreta, por lo que el parche se aplica allí.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- Modo *thinking* (razonamiento extendido), que es precisamente el escenario donde se manifiesta el fallo de repetición estudiado.
- Razonamiento matemático básico (evaluado sobre MATH-500 en la model card, sin éxito medible).
- No se documentan capacidades de tool calling, function calling, agentes ni multimodalidad en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad especial: el parche suprime parcialmente el comportamiento de repetición del que fue construido, alterando la dinámica de generación (longitud media +116 palabras en la evaluación reportada).

## Casos de uso

- Investigación en interpretabilidad: estudiar cómo una dirección de activación concreta se correlaciona con bucles de repetición en modelos pequeños, usando el pipeline `code/wsp_gpu.py` como referencia reproducible.
- Reproducción de resultados académicos: validar o refutar la metodología de *weight-space programming* sobre instantáneas y presupuestos de tokens distintos a los del artículo original.
- Análisis de atribución neuronal: identificar qué neuronas MLP contribuyen a un comportamiento degenerado concreto mediante el escaneo denso por capas.
- Experimentos controlados de edición de pesos: comparar configuraciones de parcheo (beta, k, capas objetivo) usando los barridos JSON incluidos en `results/`.
- Docencia y formación: ilustrar de forma práctica las diferencias entre edición estática de pesos y optimización guiada por LLM sobre un modelo de menos de 1B de parámetros.
- Base para pipelines de diagnóstico automatizado: adaptar la fase de diagnóstico a otros modelos pequeños para detectar patrones de repetición antes de desplegarlos.
- No es adecuado como modelo de producción para atención al cliente, generación de código ni tareas que requieran respuestas completas, dado que en la evaluación reportada el 100% de los problemas terminan en estado de repetición.

## Benchmarks y rendimiento

Evaluación propia del autor sobre 24 problemas reservados de MATH-500, decodificación greedy, modo *thinking*, presupuesto de 4096 tokens:

| Metrica | Base | Parcheado |
|---|---|---|
| Tasa estricta de bucle de repeticion | 100,0% | 100,0% |
| Problemas finalizados con respuesta | 0,0% | 0,0% |
| Precision | 0,0% | 0,0% |
| Longitud media (palabras) | 1712 | 1828 |

Barrido de configuraciones del parche sobre 4 problemas de desarrollo (3072 tokens, greedy), palabras generadas:

| Objetivo del parche | beta | k/capa | dm3 / dm0 / dg3 / dg5 | Bucle en todos |
|---|---|---|---|---|
| Capas 15/19 (elección del blog) | 0,5 | 64 | 1218 / 1537 / 1795 / 1644 | si |
| Capas 15/19 (elección del blog) | 1,0 | 64 | 848 / 1409 / 1624 / 2008 | si |
| Capas 15/19 (elección del blog) | 0,7 | 256 | 1484 / 1590 / 1707 / 1950 | si |
| Capas 11/10 (escaneo propio) | 0,5 | 64 | 712 / 1573 / 1344 / 2092 | si |
| Capas 11/10 (escaneo propio) | 1,0 | 64 | 1075 / 1624 / 1719 / 1801 | si |
| Capas 11/10 (escaneo propio) | 0,5 | 256 | 731 / 1602 / 1745 / 1780 | si |
| Capas 11/10/9/13 (escaneo propio) | 0,5 | 64 | 974 / 1537 / 1757 / 2095 | si |

El artículo original reporta, con su optimizador interactivo (GPT-6 Astra, presupuesto de 32768 tokens), una mejora en MATH-500 del 7,9% al 48,1% de precisión y una reducción de truncamiento del 93% al 33,1%. El autor advierte que estas magnitudes no son directamente comparables con las de esta reproducción.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y caché KV (el repositorio ocupa 1,5 GB).
- Cabe holgadamente en cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4060, RTX 3070, RTX 4070, RTX 4090).
- GPU de datacenter (A100, H100) innecesarias para inferencia; útiles solo para reproducir el pipeline de diagnóstico y barrido de configuraciones.
- Despliegue: compatible con `transformers` (librería declarada). No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI; al publicarse solo en safetensors, sería necesario convertir a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.
- Para aplicar el parche sobre los pesos oficiales se requiere cargar el modelo base en bfloat16 y el archivo `wsp_weight_patch_beta0.5_k64.npz` con los índices.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-WSP-patched (este) | 752.393.024 | no disponible | Artefacto de investigacion, 0 descargas, 0 likes | Apache-2.0 | Parche de pesos sobre Qwen3.5-0.8B; sin mejora funcional medida |
| Qwen/Qwen3.5-0.8B (base) | 752.393.024 | no disponible | Modelo oficial de Alibaba | Apache-2.0 | Punto de partida; presenta el bucle de repeticion estudiado |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La reparación no funciona: en la evaluación reportada, la tasa de bucle de repetición permanece en el 100% y la precisión en el 0%. No debe usarse esperando respuestas completas en modo *thinking*.
- Es una reproducción parcial: la mitad de diagnóstico y atribución se reproduce, pero la mitad de reparación no se transfiere a esta instantánea y presupuesto sin el optimizador interactivo del artículo original.
- Los números son ejecuciones propias del autor, no verificadas por los autores originales, y no son directamente comparables (4096 frente a 32768 tokens; parche estadístico frente a optimizador LLM).
- El parche suprime el comportamiento de repetición del que fue construido, pero es un artefacto de investigación, no una corrección de producción.
- Sesgos conocidos del modelo base: no documentados en la información disponible.
- Riesgo de alucinación: elevado en la práctica, dado que el modelo no completa razonamientos en el escenario evaluado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el estado defectuoso del modelo hace inviable ese uso; los pesos base son (c) del equipo Qwen.
- Sin afiliación con MIT CSAIL, OpenAI ni Alibaba/Qwen.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto fuera del inglés evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tchbcb/Qwen3.5-0.8B-WSP-patched
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog original de MIT CSAIL (R. Takehi et al., 2026-11-02): https://rikiyat.github.io/blog/weight-space-programming/
- Archivos del repositorio: `wsp_weight_patch_beta0.5_k64.npz`, `results/`, `code/wsp_gpu.py`
