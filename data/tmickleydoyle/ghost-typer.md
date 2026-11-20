# tmickleydoyle/ghost-typer

## Resumen

ghost-typer es un modelo de autocompletado de texto (ghost text) para prompts de asistentes de programación, desarrollado por tmickleydoyle. Su característica principal es que no ha sido entrenado mediante descenso de gradiente: es un modelo "compilado" cuyos pesos se generan con una regla en forma cerrada a partir de aproximadamente 126.000 líneas de texto escrito por humanos, provenientes de los conjuntos de datos WildChat-1M, OASST2, MBPP y CoNaLa. Se distribuye como un `LlamaForCausalLM` estándar de 400 millones de parámetros (de los cuales el 97% son ceros), con un tamaño de 1,60 GB en float32.

El modelo resuelve un problema muy concreto: sugerir la continuación de una frase mientras el usuario escribe, mostrando texto fantasma que se acepta con Tab. Su política de decisión es conservadora: solo emite una sugerencia cuando supera un umbral de confianza (por defecto 0,62) cuya precisión se ha medido sobre prompts reservados. Con esa configuración alcanza un 90,8% de precisión y un 23,0% de pulsaciones ahorradas.

Es relevante por su planteamiento poco habitual (sin entrenamiento, sin pesos preentrenados, sin otro modelo detrás) y porque existe una variante para navegador de solo 10,7 MB en uint8 que funciona íntegramente en la pestaña del usuario, con una latencia mediana de 2,5 ms por pulsación. La ficha se centra en el repositorio de transformers, que es el objeto de esta entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (`LlamaForCausalLM`), compilado con reglas en forma cerrada, sin entrenamiento |
| Parametros totales | 399.916.440 (97% ceros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo opera sobre contextos de n-gramas; la variante transformers usa 12.607 contextos y vocabulario de 6.000 palabras) |
| Tipos de cuantizacion | Float32 canónico en este repo; la variante de navegador ofrece uint8 (10,7 MB) y float32 (16,8 MB). No hay modelo en float16/bf16 porque la escala de logits (1e-5) se rompería |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (transformers); `model.bin` y `model-f32.bin` en la variante de navegador |

## Arquitectura y entrenamiento

El modelo es un transformer con estructura de Llama cuyos pesos no provienen de entrenamiento alguno: se generan aplicando una regla en forma cerrada definida en `build_weights.py` sobre un corpus de unas 126.000 líneas de texto humano. El resultado es una red dispersa (el 97% de los 400 millones de parámetros son ceros) que codifica estadísticas de n-gramas en forma de matriz. Los logits están escalados por 1e-5 para mantener la exactitud numérica de la red, motivo por el que no existe una versión en media precisión.

Los datos de referencia son WildChat-1M, OASST2, MBPP y CoNaLa, es decir, conversaciones reales de chat, instrucciones de asistente y pares de código y lenguaje natural. No hay RLHF ni DPO porque no hay entrenamiento. La variante de navegador es una compilación hermana, no una cuantización de este repositorio: usa un vocabulario mayor (30.893 palabras frente a 6.000) y 512.533 contextos, y almacena solo las partes no nulas del transformer compilado. La decodificación es determinista y avanza palabra a palabra mientras cada siguiente palabra supere una probabilidad de 0,8.

## Capacidades

- Autocompletado de prompts en inglés para asistentes de programación, con sugerencia de texto fantasma aceptable con Tab.
- Predicción de continuaciones lingüísticas frecuentes en contextos de programación y conversación técnica (por ejemplo, "write a python fun" → "ction to").
- Política de confianza configurable en tiempo de ejecución: umbral de primera palabra (`tau`) y umbral de extensión (`ext`).
- Modo silencioso cuando no alcanza el umbral de confianza, lo que evita sugerencias incorrectas.
- Funcionamiento sin servidor en la variante de navegador (TypeScript sin dependencias, ejecutable en Web Worker, Bun o Node).
- Integración con `transformers` mediante `pipeline("text-generation")` sin `trust_remote_code`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Autocompletado en editores de código e IDE: el modelo se integra en el campo de entrada de un asistente de programación y muestra texto fantasma tras cada pulsación; su latencia de 2,5 ms mediana en navegador lo hace viable en tiempo real sin bloquear la interfaz.
- Autocompletado en la interfaz web de un chatbot: la variante de navegador carga 10,7 MB y sugiere continuaciones de la pregunta mientras el usuario escribe, reduciendo pulsaciones en torno al 23% con una precisión del 90,8%.
- Herramienta de línea de comandos para prompts: el CLI incluido (`bun web/cli.ts "write a python fun"`) permite probar y depurar sugerencias desde terminal en pipelines de desarrollo.
- Filtro de sugerencias de bajo riesgo en productos de accesibilidad: el umbral estricto (`tau` = 0,90) eleva la precisión al 96,7% con un 15,1% de pulsaciones ahorradas, adecuado cuando un falso positivo es costoso.
- Investigación sobre modelos compilados y redes dispersas: el repositorio permite estudiar cómo se codifican estadísticas de n-gramas en un transformer y comparar el rendimiento frente a modelos entrenados de tamaño similar.
- Evaluación de políticas de autocompletado: al ser los umbrales ajustables en tiempo de ejecución, sirve para medir el compromiso entre cobertura y precisión sobre conjuntos reservados sin recompilar.
- Prototipado rápido de asistentes de código sin infraestructura de GPU: el modelo de 1,60 GB se ejecuta en CPU con PyTorch (65 ms por token siguiente), suficiente para demos y pruebas de concepto.

## Benchmarks y rendimiento

Resultados medidos con `python scripts/benchmark.py` sobre el archivo cuantizado distribuido, con prompts reservados (1.000 de WildChat más 711 de OASST, MBPP y CoNaLa):

| Umbral primera palabra (tau) | Precision | Cobertura | Pulsaciones ahorradas | Solo prompts de chat reales (WildChat) |
|---|---|---|---|---|
| 0,62 (por defecto) | 90,8% | 39,2% | 23,0% | 90,0% precision, 22,2% ahorradas |
| 0,80 | 94,9% | 30,5% | 18,3% | 94,5%, 17,8% |
| 0,90 (strict) | 96,7% | 24,4% | 15,1% | 96,4%, 14,7% |
| 0,95 | 97,4% | 19,0% | 12,1% | 97,1%, 11,9% |

La compilación anterior basada en Kneser-Ney obtuvo 90,2% de precisión y 22,2% de pulsaciones ahorradas. En la variante de navegador, uint8 frente a float32 cuesta 0,14 puntos de pulsaciones ahorradas (23,00% frente a 23,14%) con precisión prácticamente idéntica (90,8% frente a 90,7%). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en float32 ocupa 1,60 GB de pesos; en CPU no requiere VRAM y en GPU el consumo es inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre; no se necesita A100 ni H100. Funciona en RTX 4090, RTX 3090 y GPUs consumer de gama media.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM, y en la práctica se ejecuta en CPU.
- Despliegue: `transformers` con `pipeline("text-generation")`; la variante de navegador se sirve como página estática o se integra como TypeScript sin dependencias en Bun o Node. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 65 ms por token siguiente en PyTorch sobre CPU; 2,5 ms mediana y 4,3 ms p95 por pulsación en la variante de navegador uint8.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con modelos de autocompletado de código de otros autores en la información proporcionada. La comparación interna entre las dos compilaciones del mismo modelo es la siguiente:

| Modelo | Precision de pesos | Tamano | Vocabulario | Contextos | Latencia |
|---|---|---|---|---|---|
| ghost-typer (este repo) | float32 | 1,60 GB | 6.000 palabras | 12.607 | 65 ms/token (CPU) |
| ghost-typer-web `model.bin` | uint8 | 10,7 MB | 30.893 palabras | 512.533 | 2,5 ms mediana por pulsación |
| ghost-typer-web `model-f32.bin` | float32 | 16,8 MB | 30.893 palabras | 512.533 | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- Al estar compilado a partir de estadísticas de n-gramas, no razona ni generaliza: fuera de los patrones frecuentes del corpus se queda en silencio o falla.
- Riesgo de sugerencias incorrectas incluso con el umbral por defecto: la precisión es del 90,8%, es decir, cerca de una de cada diez sugerencias mostradas no coincide con lo que el usuario iba a escribir.
- No hay modelo en float16/bf16: los logits escalados por 1e-5 se rompen en media precisión, lo que limita su uso en pipelines que exijan esos tipos.
- La variante de navegador no es una cuantización de este repositorio sino una compilación distinta, con otro vocabulario y otros contextos; los resultados no son intercambiables.
- No soporta tool calling, agentes, visión ni audio, por lo que no sirve como asistente general.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad de las sugerencias en dominios distintos de los datos de origen.
- El corpus de origen incluye conversaciones reales (WildChat-1M), lo que puede arrastrar sesgos y patrones de esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmickleydoyle/ghost-typer
- Variante de navegador: https://huggingface.co/tmickleydoyle/ghost-typer-web
- Demo en vivo: https://tmickleydoyle.github.io/ghost-typer/
- Código fuente: https://github.com/tmickleydoyle/ghost-typer
- Script de compilación de pesos: `build_weights.py` (en el repositorio)
- Fuentes de datos: `data/SOURCES.md` (en el repositorio)
- Script de evaluación: `scripts/benchmark.py` (en el repositorio)
