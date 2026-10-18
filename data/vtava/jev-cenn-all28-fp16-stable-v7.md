# vtava/jev-cenn-all28-fp16-stable-v7

## Resumen

Jev-CeNN All-28 Stable FP16 V7 es un checkpoint de decisión tipada (*typed-decision*) publicado por el usuario vtava en HuggingFace. No es un modelo generativo ni un chatbot: recibe una observación estructurada (por ejemplo `{"road_direction": "left", "speed": "7"}`) y una lista cerrada de opciones, y devuelve una de ellas. Su arquitectura parte de un backbone tipo ModernBERT en el que se han sustituido los 28 módulos de atención originales por módulos CeNN, manteniendo intactas las capas FFN y de normalización preentrenadas.

El modelo tiene 539.623.174 parámetros en FP16 y ocupa 1,1 GB en el repositorio. La fine-tuning de atención se hizo con LoRA y se fusionó (*merged*) en los pesos QKV/WO con la forma original antes de exportar, de modo que en inferencia no hay matmuls LoRA adicionales. El checkpoint se distribuye junto con su propio cargador (`tinycenn_lm.all28_fp16.load_all28`), que preserva FP16 en CUDA y que es obligatorio: `AutoModel.from_pretrained` no funciona con este repositorio.

Es relevante ahora por su enfoque poco habitual: sustitución completa de atención por un mecanismo alternativo, verificación por acuerdo con un *teacher* y un caso de uso muy acotado (selección de acciones en dominios de conducción o robótica). Conviene leerlo como un experimento reproducible de investigación más que como un modelo listo para producción: el mejor checkpoint seleccionado en DEV fue el paso 0 y no hay licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de ModernBERT con los 28 modulos de atencion sustituidos por modulos CeNN; FFN y normas originales preservadas |
| Parametros totales | 539.623.174 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la familia ModernBERT soporta hasta 8192 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | solo FP16; no se publican GGUF, AWQ, GPTQ ni INT8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a la licencia del modelo upstream `convaiinnovations/laya-typed-decisions`) |
| Formato de pesos | safetensors (libreria pytorch), repositorio de 1,1 GB |

## Arquitectura y entrenamiento

El modelo parte de un backbone ModernBERT (atención bidireccional, RoPE, capas FFN preentrenadas) y reemplaza la totalidad de sus 28 módulos de atención por módulos CeNN. Según la model card, las FFN y las capas de normalización preentrenadas se conservan sin cambios, salvo el redondeo inevitable al pasar a FP16. La adaptación se realizó con LoRA sobre la atención, con un *learning rate* para las ganancias CeNN que decae de 0,01 a 0,002, y los pesos LoRA se fusionaron en las matrices QKV/WO con la forma original antes de la exportación, de forma que la inferencia no requiere matmuls adicionales de adaptadores.

El resultado es un modelo de decisión tipada, no generativo: la salida es una elección entre un conjunto finito de opciones dado un diccionario de observación. La validación se hizo por acuerdo con un modelo *teacher* en precisión FP16: 0,9917 de acuerdo en DEV y 1,0000 en el *holdout* sellado, con una precisión *gold* de 0,8640 en ese mismo *holdout*. Un dato importante para interpretar el entrenamiento: el mejor checkpoint según selección en DEV fue el paso 0, es decir, la inicialización `original_pretrained_native_equivalent_all28` no fue superada por ninguno de los pasos posteriores de fine-tuning. No se publican datos sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Clasificación/decisión sobre un conjunto cerrado de opciones: dado un diccionario de observación y una lista de alternativas, devuelve una de ellas mediante `runtime.decide(observacion, opciones)`.
- Razonamiento sobre variables tipadas y discretas (dirección, velocidad, estado), no sobre texto libre.
- Sustitución completa de atención: todos los módulos de atención son CeNN, lo que permite estudiar el comportamiento del modelo sin atención estándar.
- Ejecución en FP16 nativo en CUDA mediante el cargador propio del repositorio.
- No dispone de *tool calling*, *function calling* ni capacidades de agente multi-paso.
- No dispone de generación de texto libre, código, matemáticas, visión ni audio.
- Capacidades multilingües: no disponibles; no se documenta ningún idioma.
- No hay modo *thinking* ni decodificación especulativa.

## Casos de uso

- Selección de acción en simulación de conducción: el ejemplo de la propia model card (`road_direction: left`, `speed: 7` → `left`/`straight`/`right`) encaja en bucles de simulación donde hay que elegir entre un conjunto finito de maniobras por frame.
- Baselines de investigación en sustitución de atención: sirve para comparar el rendimiento de un backbone ModernBERT con atención CeNN frente al original en una tarea de decisión acotada, con el acuerdo con el *teacher* como métrica.
- Destilación de políticas: al estar validado por acuerdo con un *teacher* (0,9917 en DEV), puede emplearse como aproximación ligera de un modelo mayor en entornos con recursos limitados.
- Etiquetado automático de registros estructurados: clasificar pares observación/opciones en lotes para preetiquetar datasets de decisión antes de revisión humana.
- Despliegue en el borde: con 539,6 M de parámetros en FP16 (1,08 GB de pesos) es viable en GPUs de consumo y en entornos embebidos con CUDA, siempre que se use el cargador específico.
- Pruebas de regresión de sistemas de decisión: integrarlo en un *pipeline* de CI para detectar cambios de comportamiento ante variaciones de las observaciones de entrada.
- Filtro de acciones permitidas: dado un conjunto de acciones legales en un dominio restringido, seleccionar la más adecuada según el estado tipado (siempre con supervisión humana fuera del dominio de entrenamiento).

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Acuerdo con el teacher en DEV (FP16) | 0,9917 |
| Acuerdo en holdout sellado (FP16) | 1,0000 |
| Precision gold en holdout sellado (FP16) | 0,8640 |
| Mejor checkpoint segun DEV | paso 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE) en la información disponible. Las métricas anteriores son específicas de la tarea de decisión tipada y del *teacher* utilizado, no comparables con benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,08 GB solo para pesos en FP16; con activaciones y *overhead* del *runtime* se puede estimar un pico de 2-3 GB para lotes pequeños y entradas cortas (estimación, no publicada por el autor).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4070, L4 y A10 son suficientes. A100/H100 no aportan ventaja a este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU consumer recientes con 4 GB o más.
- Opciones de despliegue: únicamente el cargador propio `tinycenn_lm.all28_fp16.load_all28` del repositorio `TinyCeNN-LM`, con `transformers==4.57.6`, `safetensors` y `huggingface_hub`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles.
- Ejecución en CPU: no documentada; el cargador está diseñado para preservar FP16 en CUDA, por lo que el comportamiento en CPU no está garantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-CeNN All-28 FP16 V7 | 539,6 M | no disponible | Decision tipada (opciones cerradas) | no disponible | HuggingFace, cargador propio |
| ModernBERT-base | 149 M | 8192 tokens | Encoder general (clasificacion, retrieval) | Apache 2.0 | Amplia, transformers estandar |
| ModernBERT-large | 395 M | 8192 tokens | Encoder general (clasificacion, retrieval) | Apache 2.0 | Amplia, transformers estandar |
| `convaiinnovations/laya-typed-decisions` (upstream) | no disponible | no disponible | Decision tipada | no disponible | HuggingFace |

No se conocen modelos públicos directamente comparables en la categoría de "decisión tipada con atención sustituida"; la comparación con la familia ModernBERT es arquitectónica, no de rendimiento en la misma tarea. No hay datos para comparar exactitud en un benchmark común.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no responde a prompts de texto libre, solo elige entre opciones pasadas explícitamente.
- El mejor checkpoint según DEV es el paso 0, lo que sugiere que el fine-tuning no mejoró la inicialización; el valor práctico del ajuste no está demostrado.
- La cifra de acuerdo de 1,0000 en el *holdout* sellado es sospechosamente alta y conviene tratarla con cautela: procede de un *holdout* del propio autor y no de una evaluación independiente.
- Licencia no declarada y remisión explícita a la licencia del modelo upstream (`convaiinnovations/laya-typed-decisions`): no se puede asumir uso comercial sin verificar esos términos.
- Riesgo de alucinación en sentido funcional: fuera del dominio de entrenamiento (conducción/decisiones tipadas) puede devolver una opción válida del conjunto pero semánticamente incorrecta, sin señal de incertidumbre.
- Idiomas y dominio de entrenamiento no documentados; no hay garantía de generalización a otras taxonomías de opciones ni a otras variables de entrada.
- Dependencia de una versión fijada de `transformers` (4.57.6) y de un repositorio de GitHub concreto por *commit*; no funciona con `AutoModel.from_pretrained`.
- Solo existe FP16: no hay cuantización para reducir memoria o ejecutar en CPU de forma eficiente.
- Sin descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de funcionamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vtava/jev-cenn-all28-fp16-stable-v7
- Repositorio del cargador (commit fijado): https://github.com/vtavakkoli/TinyCeNN-LM/tree/645723441fb81c62d59231bffd29a177a5edb3ac
- Modelo upstream de decisión tipada: https://huggingface.co/convaiinnovations/laya-typed-decisions
