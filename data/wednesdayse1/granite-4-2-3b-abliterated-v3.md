# Wednesdayse1/granite-4.2-3b-abliterated-v3

## Resumen

`Wednesdayse1/granite-4.2-3b-abliterated-v3` es una publicacion no oficial alojada en Hugging Face por el usuario Wednesdayse1. Por el identificador se deduce que se trata de una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas o atenuadas mediante edicion de pesos) del modelo base IBM Granite 4.2 de 3B. El repositorio tiene 3.659.737.600 parametros reales declarados en los safetensors y un tamano total de 7,3 GB, lo que es coherente con pesos en precision bf16/fp16 para un modelo de aproximadamente 3,6B de parametros.

La model card es la plantilla autogenerada por Hugging Face y no contiene informacion sustantiva: no se declara autor real, licencia, idiomas, datos de entrenamiento ni procedimiento de fine-tuning. Todos los campos aparecen como "[More Information Needed]". El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 26 de noviembre de 2026.

Su relevancia practica es limitada y debe evaluarse con cautela: al tratarse de una modificacion no oficial de un modelo de IBM, la trazabilidad de los pesos, la licencia aplicable y la calidad del proceso de abliteration no estan documentadas. Para produccion, es preferible partir del modelo Granite oficial de IBM y, si se necesita el comportamiento sin rechazos, documentar y auditar el proceso de modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de IBM Granite 4.2; detalles no disponibles) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no hay GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es una modificacion de pesos de un Granite 4.2 de 3B. La arquitectura subyacente es un transformer decoder-only, pero la model card no aporta ningun detalle sobre numero de capas, dimension oculta, atencion (MHA/GQA), funcion de activacion ni normalizacion. Tampoco se documenta el tokenizador ni el vocabulario.

El termino "abliterated" hace referencia a una tecnica de edicion de pesos que proyecta fuera del espacio de activaciones la direccion asociada al rechazo, de forma que el modelo deja de negarse a responder a ciertas peticiones. No se documenta que metodo concreto se ha usado (por ejemplo, diffs de activaciones entre pares de prompts, ortogonalizacion de la direccion de rechazo, o ajuste supervisado). Tampoco se indica cuantos tokens se han usado en el proceso, si ha habido RLHF/DPO adicional, ni que dataset se ha empleado. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones.

## Capacidades

- Generacion de texto conversacional en el formato de chat del modelo base (no documentado en el repo).
- Razonamiento y respuesta a instrucciones heredadas del Granite 4.2 original, sujetas a la calidad del proceso de abliteration.
- Capacidad de codigo y matematicas: no verificada en este repositorio.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponible.
- Comportamiento sin rechazos: es la unica caracteristica diferencial declarada implicitamente por el nombre, pero no se cuantifica ni se describe.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo puede usarse como caso de estudio para analizar como la abliteration afecta a la tasa de rechazo, la utilidad y la seguridad en comparacion con el Granite 4.2 original, siempre que se documente el proceso y se evalue con un conjunto de prompts controlado.
- Evaluacion de robustez de filtros de seguridad: desplegar el modelo en un entorno aislado para medir si los clasificadores de salida detectan contenido que el modelo base rechazaria, y calibrar asi las capas de moderacion.
- Generacion de texto creativo sin restricciones de estilo: para tareas de escritura ficcional o narrativa donde el modelo base aplica filtros excesivos, con revision humana obligatoria antes de publicar.
- Prototipado de asistentes conversacionales en local: al ser un modelo de 3,6B, cabe en GPUs de consumo con cuantizacion, lo que permite iterar en un portatil con GPU dedicada sin depender de APIs.
- Experimentos de destilacion o evaluacion comparativa: usar el modelo como referencia "sin alineacion" frente a modelos alineados en estudios de sesgo, toxicidad o utilidad.
- Base para fine-tuning de dominio: partir de estos pesos para adaptar a un dominio concreto (por ejemplo, atencion al cliente o generacion de documentacion tecnica), asumiendo el riesgo de que el proceso de abliteration haya degradado capacidades del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 7,3 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, 10-12 GB para contexto moderado.
- VRAM estimada en cuantizacion 8 bits: en torno a 4 GB para pesos.
- VRAM estimada en cuantizacion 4 bits: en torno a 2,5 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio concurrente; RTX 4090, RTX 4080, RTX 3090 para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en bf16 y 4-6 GB en cuantizacion 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: transformers (formato nativo del repo), vLLM, TGI, llama.cpp y Ollama solo si se convierten los pesos a GGUF, lo cual no esta publicado en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wednesdayse1/granite-4.2-3b-abliterated-v3 | 3,66B | no disponible | no disponible | Hugging Face, 0 descargas |
| IBM Granite 4.2 3B (oficial) | ~3B | no disponible en esta ficha | licencia de IBM (consultar repo oficial) | Hugging Face, mantenido por IBM |
| Llama 3.2 3B Instruct | 3,2B | 128k | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Qwen2.5 3B Instruct | 3,1B | 32k | Apache 2.0 | Hugging Face, ampliamente usado |

La comparativa se limita a parametros y disponibilidad porque no hay datos de rendimiento del modelo evaluado. Frente a las alternativas oficiales, la principal diferencia es la ausencia de documentacion, licencia clara y garantias de calidad.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; no se puede afirmar que el modelo sea seguro para uso general.
- La abliteration puede degradar capacidades del modelo base (razonamiento, instruction following, coherencia) y aumentar la probabilidad de respuestas toxicas o inapropiadas; no hay evaluacion publicada que lo cuantifique.
- Riesgo de alucinacion no evaluado.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. La licencia del Granite original de IBM puede imponer condiciones que se heredan al derivado, y la modificacion no autorizada puede incumplir sus terminos.
- Idiomas soportados no documentados; no se puede asumir buen rendimiento en castellano.
- Longitud de contexto desconocida: no se debe asumir la del Granite 4.2 oficial sin verificarlo.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad, sin issues ni discusiones.
- Los pesos pueden haber sido modificados de forma no reproducible; no hay hash ni procedimiento publicado para auditar la integridad.
- Para produccion se recomienda partir del modelo oficial de IBM, aplicar la modificacion con un pipeline documentado y evaluar con un conjunto de pruebas propio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Wednesdayse1/granite-4.2-3b-abliterated-v3
- Referencia citada en la model card (calculadora de impacto de carbono): https://mlco2.github.io/impact#compute
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Repositorio oficial de IBM Granite (referencia del modelo base, no enlazado en la model card): no disponible en la informacion proporcionada.
