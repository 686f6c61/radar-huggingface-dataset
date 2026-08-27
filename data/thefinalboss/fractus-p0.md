# thefinalboss/fractus-p0

## Resumen

Fractus P0 + v4 es un modelo experimental desarrollado por el usuario `thefinalboss` como un parche sobre el modelo base `thefinalboss/fractus-cte`. Se presenta como un "agente cognitivo continuo" que mantiene un estado persistente a lo largo del procesamiento, en lugar de un transformer estándar de paso único. El modelo incorpora un mecanismo de enrutamiento P0 basado en osciladores de Kuramoto, fases por token y una arquitectura de mezcla de expertos (MoE) con balanceo de carga tipo Switch. El entrenamiento v4 introduce un régimen de supervisión con tasa de muestreo completa, un aumento progresivo de la probabilidad de supervisión y una penalización anti-repetición sobre el logit de eco.

La relevancia de este modelo radica en su enfoque no convencional: busca emular dinámicas biológicas de procesamiento continuo, con capacidad de memoria entre sesiones y crecimiento autónomo de capacidad. Sin embargo, se encuentra en una fase muy temprana de desarrollo, con experimentos limitados a tareas de conteo en CPU y una prueba de humo de 1B parámetros en una sola GPU. No se dispone de información pública sobre licencia, idiomas soportados, cuantizaciones ni benchmarks estándar, lo que limita su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MoE (mezcla de expertos) y enrutamiento P0 basado en osciladores de Kuramoto; atención por chunks (FRACTUS_ATTN_IMPL=chunked) |
| Parametros totales | no disponible (se menciona un experimento "1B smoke", pero no se confirma el tamaño final) |
| Parametros activos | no disponible (se menciona MoE, pero sin detalle de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se mencionan archivos `.pt`, probablemente PyTorch) |

## Arquitectura y entrenamiento

La arquitectura de Fractus P0 se describe como un sistema de "agente cognitivo continuo" que procesa la información en múltiples bloques, manteniendo un estado de pensamiento persistente. El enrutamiento P0 introduce un "carry" de Kuramoto (osciladores acoplados) que se actualiza por token, junto con fases de MoE por token y un balanceo de carga tipo Switch. La codificación de fase depende del token mediante `atan2`, en lugar de la normalización típica por media de LayerNorm. El entrenamiento v4 utiliza una tasa de supervisión completa (SS_RATE=1.0), una rampa de probabilidad de supervisión de 0.2 a 0.5, y una penalización anti-repetición sobre el logit de eco con λ=0.1. Se menciona también una sonda `unique@40` para evaluar la diversidad de generación.

Los datos de entrenamiento no están especificados. La mini-run documentada se realizó en CPU con una tarea de conteo (80 pasos), y se observó que el modo PREFIX (decodificación forzada por teacher forcing) lograba una diversidad de 15.7 en `unique@40`, mientras que el modo CARRY (longitud 1) se estancaba en 1.7, generando repeticiones. El autor advierte que no se debe subir `REPEAT_COEF` por encima de 0.1, ya que la entropía cruzada explota.

## Capacidades

- Generación de texto con estado persistente: el modelo mantiene un "pensamiento" que se actualiza a lo largo de los bloques de procesamiento, lo que podría permitir razonamiento multi-paso.
- Enrutamiento dinámico por token: la mezcla de expertos se activa por token con fases dependientes del token, lo que sugiere una especialización adaptativa.
- Memoria entre sesiones: según la descripción del wiki, Fractus puede recordar información a través de sesiones, aunque no se detalla cómo se implementa en P0.
- Capacidad de crecimiento autónomo: se menciona que puede "crecer nueva capacidad por sí mismo", aunque no hay evidencia concreta en la documentación.
- Soporte de tool calling: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo es útil para estudiar mecanismos de estado continuo y enrutamiento basado en osciladores, especialmente en entornos académicos o de I+D.
- Experimentación con MoE y balanceo de carga: los desarrolladores interesados en mezcla de expertos pueden analizar el comportamiento de las fases por token y el carry de Kuramoto.
- Pruebas de generación con control de repetición: el entrenamiento v4 incluye una penalización anti-repetición sobre el logit de eco, que podría aplicarse a tareas de generación de secuencias numéricas o conteo.
- Prototipos de agentes con memoria persistente: si se confirma la capacidad de memoria entre sesiones, podría usarse en chatbots o asistentes que requieran recordar contexto a largo plazo.
- Benchmarking de eficiencia en CPU: la mini-run se ejecutó en CPU, lo que permite evaluar el rendimiento en entornos sin GPU.
- Desarrollo de técnicas de entrenamiento con supervisión progresiva: el esquema SS_PROB ramp podría inspirar nuevos métodos de curriculum learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es una mini-run en CPU con una tarea de conteo, que se resume a continuación:

| Decodificación | unique@40 | echo | Salida para `0 1 2 →` |
|---|---|---|---|
| PREFIX (teacher-forced) | 15.7 | 0.00 | `4 5 6 7 8 9 10…` |
| CARRY (longitud 1) | 1.7 | 0.00 | `4 4 4 4 4…` |

Estos resultados no son comparables con benchmarks de modelos convencionales y solo sirven como indicador del comportamiento en una tarea sintética.

## Requisitos de hardware

- Para la mini-run en CPU: se ejecutó con 80 pasos, sin especificar requisitos de memoria; probablemente cabe en cualquier máquina moderna.
- Para el "1B smoke": se indica una sola GPU (CUDA_VISIBLE_DEVICES=0), pero no se especifica el modelo de GPU ni la VRAM necesaria. Como referencia, un modelo de ~1B parámetros en FP16 requiere aproximadamente 2 GB de VRAM, más overhead de activaciones y optimizador si se entrena.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo experimental con formato `.pt`, es probable que solo sea utilizable mediante scripts de Python personalizados.
- No hay datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que Fractus P0 es un experimento de arquitectura no estándar y no se han publicado comparaciones con otros modelos.

## Limitaciones y advertencias

- Modelo experimental: se encuentra en una fase muy temprana de desarrollo, con pruebas limitadas a tareas sintéticas.
- Sin licencia especificada: no se puede determinar si es de uso libre, lo que impide su uso comercial sin autorización explícita.
- Riesgo de alucinación y repetición: la mini-run muestra que el modo CARRY tiende a repetir el mismo token, lo que indica una debilidad en la generación autónoma.
- Sin datos de sesgos: no se ha evaluado el comportamiento en contextos sociales o sensibles.
- Sin soporte de herramientas ni funciones: no se menciona tool calling, lo que limita su integración en agentes complejos.
- Dependencia de scripts propietarios: el entrenamiento y la inferencia requieren scripts específicos (`scripts/fast4gpu_boost_v4.py`, `scripts/probe_p0.py`), lo que dificulta su reproducibilidad.
- Advertencia del autor: no subir `REPEAT_COEF` por encima de 0.1, ya que la entropía cruzada explota.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thefinalboss/fractus-p0
- Modelo base: https://huggingface.co/thefinalboss/fractus-cte
- Wiki de Fractus CTE: https://thefinalboss-fractus-cte-wiki.hf.space/
