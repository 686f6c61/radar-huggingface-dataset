# trace-000/bitgc-lm-1b-base

## Resumen

bitgc-lm-1b-base es un modelo de lenguaje en coreano de 1.092.923.440 parámetros (aproximadamente 1,09 B) desarrollado por el usuario trace-000 y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo de preentrenamiento (no ajustado para diálogo ni instrucciones) que combina pesos ternarios del esquema BitNet b1.58 con una arquitectura híbrida de atención y convolución con puertas (gated convolution). Su interés radica en explorar la inferencia de bajo coste mediante pesos ternarios {−γ, 0, +γ} con activaciones de 8 bits, manteniendo un tamaño de parámetros que lo sitúa en la gama de los modelos pequeños.

La arquitectura consta de 24 capas, de las cuales solo 6 (bloques 3, 7, 11, 15, 19 y 23) emplean atención; las otras 18 usan convolución con puertas de kernel 9. El modelo fue entrenado sobre 2.375 B tokens mezclando datos del corpus AI Hub en coreano y la Wikipedia en coreano, y alcanza una perplejidad de validación de 9,02. El tokenizador es un SentencePiece BPE con vocabulario de 16.384 tokens, entrenado específicamente con los datos de AI Hub.

Es relevante ahora porque documenta una receta reproducible de preentrenamiento ternario a escala de 1 B de parámetros con un coste de cómputo moderado (unas 33 horas en una A100), e incorpora una innovación poco habitual: una compuerta sobre la capa de recuerdo (bloque 11) medida automáticamente durante el preentrenamiento, pensada para el posterior ajuste supervisado orientado a diálogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas, 6 de atención (bloques 3, 7, 11, 15, 19, 23) y 18 de convolución con puertas (kernel 9); capas lineales ternarias BitLinear (BitNet b1.58), FFN con ReLU², escalar residual |
| Parametros totales | 1.092.923.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos ternarios {−γ, 0, +γ} con activaciones de 8 bits (BitLinear); no se documentan otros formatos de cuantización |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido de 24 capas en el que la atención solo aparece en 6 capas (bloques 3, 7, 11, 15, 19 y 23); las 18 restantes son capas de convolución con puertas de kernel 9. Todas las capas lineales de cada bloque usan pesos ternarios {−γ, 0, +γ} con activaciones de 8 bits según el esquema BitNet b1.58 (BitLinear), la FFN emplea activación ReLU² y se añade un escalar residual. Esta combinación busca reducir el coste de memoria y cómputo de los pesos manteniendo la expresividad de una red híbrida.

El preentrenamiento usó 2.375 B tokens procedentes de una mezcla de corpus del AI Hub en coreano (datos de tecnología y ciencia, ciencias sociales, búsqueda de conocimiento, generación de sentido común y el corpus del proyecto 121 de modelos lingüísticos coreanos) y de la Wikipedia en coreano (CC BY-SA 4.0). Se entrenó durante 289.418 pasos con batch de 16×512, learning rate de 1,5e-4 con calentamiento de 3.000 pasos y decaimiento coseno, en bf16, con un coste aproximado de 33 horas en una A100. La perplejidad de validación resultante es 9,02, frente a 9,25 de la variante anterior E1c sobre la misma validación. El tokenizador (SentencePiece BPE de 16.384 tokens) se entrenó con los datos de AI Hub. Como innovación destacable, durante el preentrenamiento se mide automáticamente la capa de recuerdo (bloque 11) y se registra en el campo `recall` de `config.json`; el script `sft.py` aplica una compuerta sobre la salida de esa capa en la posición del primer token de respuesta (`<|bot|>`) para el ajuste supervisado posterior.

## Capacidades

- Generación de texto en coreano por continuación de contexto (modelo base, sin ajuste de instrucciones ni de diálogo).
- Modelado de lenguaje autorregresivo con perplejidad de validación de 9,02 sobre la mezcla AI Hub + Wikipedia coreana.
- Capacidad de continuación de texto con decodificación por muestreo (temperatura, top-k), según el script `chat.py` del repositorio.
- Soporte de ajuste supervisado (SFT) mediante `sft.py`, con la compuerta de la capa de recuerdo activada durante el entrenamiento.
- Herramienta de sondeo de la capa de recuerdo (`scripts/probe_recall.py`) para medir de nuevo dicha capa con distintos valores de K.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al coreano; no se declaran otros idiomas.

## Casos de uso

- Investigación sobre cuantización ternaria: sirve como referencia reproducible para estudiar el comportamiento de BitNet b1.58 a escala de 1 B de parámetros, comparando la perplejidad (9,02) con variantes de diseño anteriores (E1c, 9,25).
- Punto de partida para ajuste supervisado en coreano: el modelo base puede afinarse con `sft.py` sobre datos propios de diálogo, aprovechando la compuerta de la capa de recuerdo que se activa en la posición del token `<|bot|>`.
- Experimentación con arquitecturas híbridas convolución-atención: la proporción 18 capas de convolución con puertas frente a 6 de atención permite estudiar el equilibrio entre coste y calidad en modelos de 1 B.
- Generación de texto en coreano para tareas de continuación y exploración lingüística: el script `chat.py` permite continuar prompts como "세종대왕은" con temperatura y top-k configurables.
- Estudio de eficiencia de inferencia: los pesos ternarios con activaciones de 8 bits reducen el coste de memoria frente a pesos en bf16, lo que facilita desplegar el modelo en hardware modesto para pruebas de latencia y throughput.
- Reproducción de recetas de preentrenamiento de bajo presupuesto: el coste documentado (unas 33 horas en una A100 para 2.375 B tokens) sirve de referencia para planificar entrenamientos de modelos coreanos de tamaño similar.
- Análisis de la capa de recuerdo: `probe_recall.py` permite medir con K = 4, 8 y 16 qué capa concentra la información de recuerdo, útil para investigación en interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación documentado es la perplejidad de validación:

| Metrica | Valor |
|---|---|
| Perplejidad de validacion (bitgc-lm-1b-base) | 9,02 |
| Perplejidad de validacion (diseno anterior E1c, misma validacion) | 9,25 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,4 GB en safetensors; con pesos ternarios y activaciones de 8 bits el modelo está pensado para un consumo de memoria reducido, aunque no se publica una cifra oficial de VRAM.
- GPU recomendadas: el entrenamiento se realizó en una A100 (unas 33 horas); para inferencia no se documentan GPU concretas.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo (RTX 4090 u otras); no disponible.
- Opciones de despliegue: el autor proporciona scripts propios en el repositorio de GitHub (`chat.py`, `sft.py`, `scripts/probe_recall.py`) con PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La única comparación documentada por el autor es interna, frente al diseño previo E1c del mismo proyecto:

| Modelo | Parametros | Contexto | Perplejidad de validacion | Licencia |
|---|---|---|---|---|
| bitgc-lm-1b-base | 1,09 B | no disponible | 9,02 | MIT |
| Diseno previo E1c (mismo proyecto) | no disponible | no disponible | 9,25 | no disponible |

## Limitaciones y advertencias

- Es un modelo de preentrenamiento: no está ajustado para diálogo ni para seguir instrucciones, por lo que no debe usarse directamente como asistente conversacional.
- Solo admite coreano; no se declara soporte de otros idiomas.
- No se documenta la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, habitual en modelos base entrenados sobre corpus web y de dominio mixto; no se han publicado evaluaciones de sesgo ni de toxicidad.
- La compuerta de la capa de recuerdo (bloque 11) solo actúa en la posición del token `<|bot|>`; en generación libre con este modelo base no tiene efecto porque el texto de preentrenamiento no contiene ese token.
- Los datos de AI Hub pueden tener condiciones de uso propias que conviene revisar antes de un uso comercial, aunque la licencia del modelo sea MIT.
- El modelo tiene un volumen de descargas muy bajo (27) y ninguna validación externa, por lo que su robustez en producción no está contrastada.

## Enlaces

- Hugging Face: https://huggingface.co/trace-000/bitgc-lm-1b-base
- Repositorio de código: https://github.com/Trace-0/bitgc-lm
- AI Hub (datos de entrenamiento): https://www.aihub.or.kr
- Wikipedia en coreano (datos de entrenamiento): https://ko.wikipedia.org
