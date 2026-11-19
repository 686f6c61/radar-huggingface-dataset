# TendieLabs/Swift-1.5-hermes-adapted-exl3-6.00bpw

## Resumen

Swift 1.5 Qwen3.8-27B es un derivado afinado por UkisAI (publicado en Hugging Face bajo la organización TendieLabs en formato EXL3) del modelo base Qwen3.8-27B. Su propuesta central es el "razonamiento eficiente": mediante post-entrenamiento con RL y OPD (on-policy distillation), el modelo reduce el número de tokens de pensamiento en un 58,5 % mientras mantiene —y según el autor, supera ligeramente— la precisión del modelo base, lo que se traduce en una aceleración de hasta 1,95× en varias tareas. Es relevante porque ataca uno de los costes dominantes en despliegues de modelos con modo thinking: la verbosidad del razonamiento.

El modelo se distribuye en una cuantización EXL3 de 6,00 bits por peso (etiqueta `exl3`, `6-bit`), con un total real de 11.348.546.944 parámetros en los safetensors publicados y un repositorio de 22,7 GB. La model card declara el pipeline `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del base, aunque la información disponible no detalla la torre de visión ni los idiomas soportados.

La ficha describe tanto el modelo base (Qwen3.8-27B, del que procede toda la arquitectura) como este artefacto cuantizado, e indica explícitamente los datos no disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 11.348.546.944 (safetensors del repositorio EXL3); el base Qwen3.8-27B declara 27B en su denominación |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 6,00 bits por peso; el autor publica además GGUF y GSQ-RCO GGUF en otros repositorios |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (licencia propia, `license: other`, repositorio con acceso restringido/gated) |
| Formato de pesos | safetensors (EXL3), compatible con `transformers`; existen variantes GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer del que la información disponible no detalla número de capas, dimensión oculta, mecanismo de atención ni si emplea Mixture of Experts. Lo que sí documenta el autor es el proceso de post-entrenamiento: partiendo de Swift 1.0 (a su vez derivado de Qwen3.8-27B), se identificaron los tokens asociados a "sobrepensamiento patológico" y se penalizaron sin atacar directamente la longitud del razonamiento; después se recuperó precisión mediante RL y OPD. En Swift 1.5 se escaló ese post-entrenamiento con foco en tareas de horizonte largo, agenticas y de código.

El resultado declarado es una reducción del 58,5 % en tokens de pensamiento con una puntuación agregada un 0,35 % superior a la del base. Los datos de entrenamiento están publicados parcialmente en el dataset `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, que según el autor se re-muestrea y se convierte en entornos de RL en lugar de usarse tal cual. No se especifican el número total de tokens de entrenamiento, la composición del corpus ni los detalles del algoritmo de RL.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" eficiente en tokens (etiquetas `reasoning`, `efficient-thinking`, `token-efficient`).
- Generación de código, incluyendo proyectos completos: la demo del autor genera un juego 3D de planeta explorable en 11,39 minutos frente a 104,6 minutos del base.
- Tareas agenticas de horizonte largo y uso de terminal, evaluadas en Terminal Bench 2.1 según la model card.
- Entrada image-text-to-text según el pipeline declarado (capacidades de visión heredadas del base; sin detalles disponibles).
- Conversación multi-turno (etiqueta `conversational` y dataset de SFT multi-turno agentico).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Agentes de terminal y automatización de shell: el modelo está post-entrenado específicamente para Terminal Bench 2.1 y tareas agenticas de horizonte largo, por lo que encaja en pipelines que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Generación de código en producción: su reducción del 58,5 % en tokens de pensamiento abarata cada iteración en asistentes de código integrados en IDE o CI/CD, donde el coste por token de salida domina la factura.
- Prototipado rápido de aplicaciones interactivas: la demo de generación de un juego 3D en 11,39 minutos ilustra su uso para producir artefactos ejecutables (HTML/JS/WebGL) a partir de una descripción en lenguaje natural.
- Razonamiento con presupuesto ajustado: en despliegues con latencia estricta, el modo thinking comprimido permite mantener cadena de razonamiento sin agotar el tiempo de respuesta, con una aceleración declarada de hasta 1,95×.
- Asistentes conversacionales multi-turno: el SFT sobre diálogos multi-turno agenticos lo hace adecuado para atención al cliente o copilotos internos que mantienen estado a lo largo de la conversación.
- Evaluación comparativa de eficiencia: sirve como referencia para medir cuánto rendimiento se conserva al recortar tokens de razonamiento, útil en investigación sobre sobrepensamiento en modelos con RL.
- Inferencia en hardware limitado: la cuantización EXL3 de 6 bits y las variantes GGUF permiten desplegarlo donde el base en precisión completa no cabría.

## Benchmarks y rendimiento

La model card reporta resultados agregados comparando Qwen3.8-27B (base) y Swift 1.5, con protocolos de evaluación idénticos. La información disponible solo confirma los agregados siguientes; los valores por benchmark (LiveCodeBench, Terminal Bench 2.1, etc.) no se detallan en los datos proporcionados.

| Metrica | Base Qwen3.8-27B | Swift 1.5 | Cambio |
|---|---|---|---|
| Tokens de pensamiento | referencia | −58,5 % | reducción |
| Puntuación agregada | referencia | +0,35 % | mejora |
| Aceleración en varias tareas | 1× | hasta 1,95× | mejora |
| Demo de generación de juego (tiempo) | 104,6 min | 11,39 min | −89,1 % |

No se han publicado en la información disponible los valores numéricos por benchmark (MMLU, HumanEval, GSM8K, LiveCodeBench, Terminal Bench 2.1) ni las puntuaciones absolutas del agregado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11,35 mil millones de parámetros en safetensors a 6,00 bits, los pesos ocupan aproximadamente 8,5 GB; con overhead de contexto y caché KV, un despliegue práctico requiere del orden de 12-16 GB de VRAM (estimación, no dato del autor).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una RTX 4090 (24 GB) o A100/H100 cubren el modelo con holgura.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090, RTX 4080 y GPUs con 16 GB o más; las variantes GGUF permiten bajar aún más el requisito.
- Opciones de despliegue: `transformers` (formato nativo del repositorio) y variantes GGUF para llama.cpp/Ollama; compatibilidad con vLLM o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponible; el autor solo reporta la aceleración relativa de hasta 1,95× frente al base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B (EXL3 6 bpw) | 11,35B en safetensors (base 27B) | no disponible | Razonamiento eficiente en tokens | swift-open-license-1.0 (gated) | Hugging Face, este repositorio |
| Qwen3.8-27B (base) | 27B | no disponible | Modelo generalista con thinking | la del base (no detallada aquí) | Hugging Face |
| Swift 1.0 Qwen3.8-27B | 27B | no disponible | Primera iteración de eficiencia de razonamiento | swift-open-license-1.0 | Hugging Face, 350k+ descargas según el autor |
| Swift 1.5 Qwen3.8-27B GGUF | 27B | no disponible | Misma versión en GGUF | swift-open-license-1.0 | Hugging Face (`ukisai/Swift-1.5-Qwen3.8-27B-GGUF`) |

No se dispone de datos de benchmarks ni de contexto para comparar con alternativas de otros fabricantes; la comparación se limita a la familia Swift y su base.

## Limitaciones y advertencias

- Licencia propia `swift-open-license-1.0` con repositorio restringido (gated): es imprescindible revisar los términos antes de cualquier uso comercial; la licencia no es OSI estándar.
- El modelo es un derivado afinado con RL sobre Qwen3.8-27B; hereda los sesgos del base, que no se documentan en la información disponible.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de factualidad publicadas.
- La compresión del razonamiento puede degradar tareas que requieren cadenas de pensamiento largas; el autor solo reporta el agregado, sin desglose por tipo de tarea.
- Idiomas soportados no especificados: no se puede garantizar calidad fuera del inglés sin evaluación propia.
- Longitud de contexto no disponible: limita la planificación de despliegues con documentos largos.
- La cuantización EXL3 a 6,00 bits introduce una pérdida de precisión frente a los pesos originales; conviene validar en el dominio de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el pipeline declarado (`image-text-to-text`) no está respaldado por documentación sobre la torre multimodal.
- El número de parámetros de los safetensors (11,35B) no coincide con la denominación "27B" del base, lo que sugiere una arquitectura con compartición de pesos o un recuento distinto; conviene verificar la configuración antes de asumir equivalencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TendieLabs/Swift-1.5-hermes-adapted-exl3-6.00bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card de referencia del autor: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Versión GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Versión GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Dataset de SFT multi-turno agentico: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Web del autor: https://ukisai.com
- Página de producto: https://ukisai.com/products/swift
- Demo interactiva: https://ukisai.com/swift-games/27b
