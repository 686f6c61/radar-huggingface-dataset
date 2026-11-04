# thantzinphyo/Hey-270M-Alpha

## Resumen

Hey-270M-Alpha es un modelo de lenguaje de 268 millones de parámetros especializado en function calling (llamada a funciones) para birmano, inglés y code-switching entre ambos. Lo desarrolla el autor independiente thantzinphyo como un fine-tuning completo del modelo base google/functiongemma-270m-it, y está pensado para ejecutarse en dispositivos de borde: teléfonos, placas IoT y hardware embebido con recursos limitados.

El modelo aborda un problema concreto: la práctica totalidad de los modelos de tool calling están entrenados casi exclusivamente en inglés, lo que deja sin cobertura a idiomas de bajos recursos como el birmano. Hey-270M-Alpha se entrenó con ajuste completo de los 270M de parámetros (no con LoRA) sobre el dataset thantzinphyo/Hey-Function-Burmese, con el objetivo de adaptar las cabezas de atención y las representaciones internas a la sintaxis y las entidades del birmano.

Se trata de una release Alpha experimental: solo 1 época de entrenamiento (1.214 pasos) y una precisión de selección de herramienta del 60,5 % en birmano y del 45,6 % en code-switching sobre un benchmark propio de 200 muestras. Es relevante ahora como prueba de concepto de que el function calling multilingüe cabe en menos de 300M de parámetros, aunque sus cifras todavía no son aptas para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text, derivada de Gemma 3) |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo; el autor planea exportar a GGUF y LiteRT en int4/int8 |
| Idiomas soportados | birmano (my), inglés (en) y code-switching my-en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/functiongemma-270m-it |
| Dataset de entrenamiento | thantzinphyo/Hey-Function-Burmese |
| Epocas / pasos | 1 época / 1.214 pasos |
| Hardware de entrenamiento | 2x NVIDIA Tesla T4 (DDP, FP16, AdamW) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura gemma3_text del base google/functiongemma-270m-it: un transformer decoder-only denso de 270M de parámetros orientado a generación de texto y a la emisión de llamadas a funciones en un formato estructurado del tipo `<call:function_name{...}>`. No se trata de un MoE ni de una arquitectura híbrida SSM; es un transformer convencional de tamaño compacto.

El entrenamiento consistió en un fine-tuning de todos los parámetros (self-attention, MLP y layer norms), sin adaptadores de bajo rango, con el argumento de que la capacidad de tool calling del base estaba entrenada casi exclusivamente en inglés y requería reajustar las representaciones internas para el birmano. Se usó pérdida de modelado causal con enmascaramiento de respuesta: los gradientes se calcularon únicamente sobre los tokens generados de la llamada a función, no sobre el prompt del usuario. El optimizador fue AdamW con precisión mixta FP16, warmup lineal seguido de decaimiento coseno, y el entrenamiento se ejecutó en 2 GPU Tesla T4 con DDP mediante TRL/SFTTrainer. Solo se completó 1 época, lo que el propio autor califica de validación de viabilidad más que de entrenamiento final.

## Capacidades

- Generación de llamadas a funciones estructuradas a partir de instrucciones en lenguaje natural en birmano, inglés y mezcla de ambos.
- Selección de herramienta (tool selection) dentro de un conjunto de funciones definido por el desarrollador.
- Extracción de argumentos hacia JSON, aunque el autor reconoce que la precisión de argumentos (Arg Acc) es todavía un punto débil en esta release.
- Comprensión de instrucciones con code-switching my-en, un patrón habitual en hablantes urbanos de Birmania.
- Ejecución en dispositivo (on-device) por su tamaño de 270M de parámetros.
- No se han documentado capacidades de visión, audio, modo thinking explícito ni razonamiento multi-paso complejo.
- Soporte multilingüe limitado a birmano e inglés; no hay evidencia de cobertura de otras lenguas.

## Casos de uso

- Asistentes de voz en birmano para móvil: el modelo traduce una orden hablada transcrita ("pon una alarma para mañana a las siete") a una llamada de función estructurada que la app Android ejecuta localmente, sin enviar audio ni texto a la nube.
- Automatización doméstica en placas IoT: con 270M de parámetros puede residir en un dispositivo de borde que recibe comandos en birmano o inglés y los mapea a acciones sobre actuadores mediante un esquema de funciones predefinido.
- Integración en apps Flutter/Android: el autor prevé exportar a LiteRT y GGUF con cuantización int4/int8 para ejecución offline dentro de aplicaciones móviles, lo que permitiría asistentes sin conectividad.
- Prueba de concepto para investigación en lenguas de bajos recursos: sirve como referencia para medir hasta qué punto un modelo de 270M puede aprender tool calling en un idioma con pocos datos, y como base para experimentos de fine-tuning posteriores.
- Enrutamiento de intenciones en chatbots birmanos: el modelo puede clasificar la intención del usuario y disparar la función adecuada (consultar saldo, reservar cita, consultar horario) en un backend que después ejecuta la lógica de negocio.
- Evaluación de pipelines de function calling multilingües: útil como baseline ligero para comparar estrategias de prompting, esquemas de herramientas y formatos de salida antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación del autor sobre un conjunto retenido de 200 muestras, midiendo precisión de selección de herramienta (Fn Acc: porcentaje de casos en que se dispara exactamente la herramienta objetivo):

| Registro / idioma | Muestras | Fn Acc (%) |
|---|---:|---:|
| Inglés | 83 | 75,9 |
| Birmano | 38 | 60,5 |
| Code-switching | 79 | 45,6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 0,55 GB solo para pesos (268M × 2 bytes), más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en int8: aproximadamente 0,27 GB de pesos; en int4, alrededor de 0,14 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM sirve para inferencia en FP16; el entrenamiento se hizo en 2x Tesla T4, lo que da una idea del perfil de cómputo.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier tarjeta moderna; también en CPU y en móviles de gama media tras cuantización.
- Opciones de despliegue: transformers con PyTorch para FP16; llama.cpp/Ollama cuando el autor publique los GGUF (previstos, no disponibles aún); LiteRT para Android (previsto). vLLM y TGI son compatibles en teoría con la arquitectura gemma3_text, pero no hay configuración publicada para este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---:|---|---|---|---|
| Hey-270M-Alpha | 268M | no disponible | my, en | Apache 2.0 | Function calling birmano/inglés on-device |
| google/functiongemma-270m-it | 270M | no disponible | principalmente en | Gemma (términos propios) | Function calling en inglés |
| Modelos de tool calling de 1-3B (p. ej. familias Qwen o Llama) | 1.000M-3.000M | variable | multilingüe amplio | variable | Function calling generalista |

Frente a su modelo base, Hey-270M-Alpha añade cobertura de birmano y code-switching a costa de un posible retroceso en inglés (75,9 % de Fn Acc en la evaluación propia, sin comparación directa publicada con el base). Frente a modelos de tool calling de 1-3B parámetros, sacrifica capacidad general y cobertura idiomática a cambio de un tamaño que permite ejecución en dispositivo. No hay datos públicos que permitan comparar rendimiento con esas alternativas en birmano.

## Limitaciones y advertencias

- Release Alpha experimental: solo 1 época de entrenamiento y 1.214 pasos; el autor la describe como prueba de concepto, no como modelo listo para producción.
- Precisión de selección de herramienta moderada: 60,5 % en birmano y 45,6 % en code-switching, insuficiente para la mayoría de aplicaciones reales sin supervisión humana o validación posterior.
- Precisión de argumentos (Arg Acc) no reportada y reconocida como débil, especialmente en fechas, horas, importes y nombres de entidades en birmano.
- Riesgo de alucinación de funciones o argumentos: el modelo puede emitir llamadas a herramientas no definidas o con parámetros inventados, por lo que conviene validar la salida contra un esquema JSON estricto.
- Sesgos: no se ha publicado ningún análisis de sesgos; el dataset de entrenamiento es propio y de procedencia y composición no detalladas en la información disponible.
- Cobertura idiomática limitada a birmano e inglés; no se garantiza comportamiento correcto en otros idiomas ni en variantes regionales o registros coloquiales no representados.
- Longitud de contexto no documentada; no se debe asumir una ventana larga para conversaciones multi-turno.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar de un modelo Gemma conviene revisar los términos de uso de Gemma aplicables al modelo base.
- No hay pesos GGUF ni LiteRT publicados todavía, pese a estar en la hoja de ruta; el despliegue on-device real requiere esperar a esas exportaciones o realizarlas uno mismo.
- Sin descargas ni validación de la comunidad en el momento de la ficha; el modelo no ha sido auditado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thantzinphyo/Hey-270M-Alpha
- Dataset de entrenamiento: https://huggingface.co/datasets/thantzinphyo/Hey-Function-Burmese
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Repositorio de código: https://github.com/thantzinphyo-gg/Gemma-Actions-MM
