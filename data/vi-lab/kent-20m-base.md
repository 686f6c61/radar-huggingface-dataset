# Vi-LAB/KenT-20M-Base

## Resumen

KenT-20M-Base es un modelo de lenguaje autoregresivo de ~19,56 millones de parámetros desarrollado por Vi-LAB. Su particularidad es que prescinde por completo del mecanismo de atención: la información del historial se mantiene en una memoria EMA (media móvil exponencial) aprendible que se aplica a todas las profundidades de la red. La arquitectura combina bloques residuales con SwiGLU y RMSNorm, proyecciones basadas en la transformada discreta del coseno (DCT-II) y una matriz EMA por capa, lo que da un estado de decodificación de tamaño fijo, O(1) respecto a la longitud de la secuencia.

El modelo está pensado como una prueba de concepto de bajo coste de una familia de arquitecturas recurrentes sin atención, no como un modelo de propósito general de alta calidad. Con 240 dimensiones ocultas, 12 capas y un vocabulario GPT-2 de 50 257 tokens, se entrenó sobre Wikipedia y FineWeb-Edu, y solo declara soporte para inglés.

Es relevante ahora porque explora una vía alternativa a los transformers clásicos para contextos largos: al no crecer el estado con la longitud de la secuencia, el coste de inferencia y de memoria se mantiene constante. Su licencia Apache 2.0 y su tamaño reducido lo hacen útil para investigación y experimentación en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recurrente sin atención: bloques residuales SwiGLU + RMSNorm, proyecciones DCT-II y memoria EMA aprendible por capa |
| Parámetros totales | ~19,56 M (embedding 12,06 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (carga vía `transformers` con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer recurrente de un token por paso sin atención. La entrada se proyecta a un estado oculto de dimensión D = 240; a continuación se aplican n = 12 bloques residuales de la forma `h_i = h_{i-1} + SwiGLU(RMSNorm(h_{i-1}))`. Cada estado, incluido el inicial, se proyecta mediante `RMSNorm(h_i) · D^T · W_i`, donde D es la matriz DCT-II ortonormal fija y W_i es una matriz aprendible inicializada aproximadamente como la identidad. Sobre esa proyección se aplica una memoria EMA con matriz A = sigmoid(logits) de forma (n+1, D) = (13, 240), que se actualiza como `H_i[t+1] = (1 - A_i) ⊙ H_i[t] + A_i ⊙ u_i`. Las 13 memorias se suman, se aplica la DCT inversa (`S · D`) y una capa SwiGLU final con RMSNorm antes de la cabeza LM, que comparte pesos con el embedding (vocabulario GPT-2 de 50 257 tokens).

La matriz EMA se inicializa de forma exponencial desde 0,5 (primer tap, primera feature) hasta 0,01 (último tap, última feature), pero permanece entrenable. Durante la decodificación el estado es H de forma (13, 240), con coste O(1) respecto a la longitud de la secuencia. Según la model card, la EMA se ejecuta en FP32 mediante un barrido afín (affine scan) de profundidad logarítmica que produce exactamente el mismo resultado que la recurrencia secuencial.

Los datos de entrenamiento declarados son `wikimedia/wikipedia` y `HuggingFaceFW/fineweb-edu`. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, un token por paso.
- Modelo base: no se declara ajuste por instrucciones ni modo de razonamiento explícito.
- Estado de decodificación de tamaño fijo (13 × 240) independiente de la longitud de la secuencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en arquitecturas sin atención: sirve como banco de pruebas reproducible para comparar una recurrencia EMA con transformers de atención de tamaño similar en tareas de modelado de lenguaje.
- Experimentos de contexto largo con memoria constante: al mantener un estado O(1) respecto a la longitud, permite estudiar el comportamiento de la memoria EMA en secuencias largas sin que crezca el coste de inferencia.
- Prototipado rápido en hardware modesto: con ~19,56 M de parámetros cabe en CPU y en GPUs de consumo, lo que facilita ciclos de iteración cortos.
- Docencia y divulgación: su implementación compacta (SwiGLU, RMSNorm, DCT, EMA) es un ejemplo didáctico de bloques modernos sin atención.
- Generación de texto de dominio general en inglés para pruebas de integración: útil para validar pipelines de `transformers` con `trust_remote_code` antes de escalar a modelos mayores.
- Estudio de inicializaciones de memoria: la inicialización exponencial de la matriz EMA permite analizar cómo aprende el modelo a ponderar el historial reciente frente al lejano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (unos 78 MB de pesos para 19,56 M de parámetros), y aún menor en FP16/BF16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna, e incluso en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True`; el repositorio incluye un script `infer.py`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KenT-20M-Base | ~19,56 M | No disponible | Recurrente EMA sin atención | Apache 2.0 | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | Transformer con atención | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1024 tokens | Transformer con atención (destilado) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está pensado para seguir órdenes ni para uso conversacional directo.
- Solo inglés declarado; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación y de texto incoherente por su tamaño reducido y su naturaleza experimental.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre Wikipedia y FineWeb-Edu puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrecen garantías ni evaluaciones de calidad en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene revisarlo antes de desplegarlo.
- No se documentan la longitud de contexto efectiva, los tipos de cuantización soportados ni el formato de pesos, lo que limita la planificación de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vi-LAB/KenT-20M-Base
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
