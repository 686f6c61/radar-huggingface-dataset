# tablinum/MagicEightBall-ONNX

## Resumen
MagicEightBall-ONNX es una exportacion ONNX de un motor de reglas determinista publicado por el usuario tablinum en Hugging Face. No es un modelo de lenguaje generativo: el grafo ONNX ocupa 192 bytes y se limita a resolver una operacion de tipo radix Gather que acepta 128 direcciones INT32 empaquetadas y devuelve 128 valores FP32 que representan las palabras de una tabla de busqueda. El runner incluido en el repositorio construye esas direcciones a partir de la evidencia textual del documento de entrada y decodifica los bits de decision resultantes.

El sistema evalua una politica de soporte fija y devuelve tres salidas: una respuesta booleana, una categoria y una accion propuesta. El runner de CPU admite hasta 131.072 tokens del tokenizer Needle 3 (reempaquetado sin perdida desde Cactus Compute), y la verificacion reportada cubre 128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el limite exacto y el rechazo de una entrada de 131.073 tokens.

Su relevancia es acotada pero concreta: ilustra un patron de despliegue de inferencia minima (192 bytes de grafo, runtime de CPU con numpy, onnxruntime y sentencepiece) para tareas de clasificacion y enrutado con logica fija, donde el coste computacional y la huella de memoria son practicamente nulos. No debe confundirse con un LLM: no genera texto libre ni razona de forma abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con operacion radix Gather (128 direcciones INT32 empaquetadas, 128 salidas FP32); no es un transformer |
| Parametros totales | No disponible (el grafo ONNX pesa 192 bytes; no hay pesos neuronales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 131.072 tokens Needle 3 en el runner de CPU incluido; rechazo verificado a 131.073 tokens |
| Tipos de cuantizacion | No disponible (el grafo opera en INT32/FP32; existen variantes GGUF y FP32 en repos separados) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT para reglas de decision y runner; Apache-2.0 para el tokenizer Needle 3 reempaquetado (etiqueta combinada mit-and-apache-2.0) |
| Formato de pesos | ONNX (model.onnx); variantes adicionales en GGUF y FP32 dense en repos del mismo autor |

## Arquitectura y entrenamiento
No hay entrenamiento en el sentido habitual. El artefacto es un grafo ONNX exportado que implementa un Gather sobre direcciones empaquetadas: recibe 128 enteros INT32 y devuelve 128 flotantes FP32 que codifican exactamente las palabras de la tabla de busqueda. La logica de decision reside en el runner Python (portable_runtime.py), que tokeniza la entrada, extrae evidencia del documento y construye las direcciones que alimentan el grafo.

El tokenizer es una copia reempaquetada sin perdida del Needle 3 de Cactus Compute, con procedencia documentada en NOTICE.txt y sumas de verificacion en SHA256SUMS.txt. La verificacion publicada (verification.json) cubre 128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el limite exacto de 131.072 tokens y el rechazo correcto a 131.073 tokens. No se documentan fases de RLHF, DPO ni preentrenamiento.

## Capacidades
- Clasificacion booleana de elegibilidad segun una politica de soporte fija (por ejemplo, `may_route=true`).
- Asignacion de categoria a partir de frases declaradas en la politica (por ejemplo, `category=billing`).
- Propuesta de accion como dato para revision humana (por ejemplo, `action=review_billing`).
- Deteccion de anulacion por frases negativas: anadir "Do not route." cambia la respuesta a falsa y vacia la accion, manteniendo la categoria.
- Rechazo controlado de entradas fuera de politica: una peticion no relacionada no produce categoria ni accion.
- Procesamiento de documentos largos hasta 131.072 tokens con el tokenizer Needle 3.
- Ejecucion en CPU con dependencias minimas (numpy, sentencepiece, onnxruntime).
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto libre.

## Casos de uso
- Enrutado de tickets de soporte: el runner evalua el texto del ticket contra la politica y devuelve categoria y accion propuesta, que un sistema posterior usa para asignar cola o revisor; el coste de inferencia es despreciable al ser un grafo de 192 bytes.
- Filtro previo determinista en pipelines de atencion al cliente: se ejecuta antes de un LLM mayor para descartar o clasificar casos evidentes (por ejemplo, duplicados de cobro) y reducir llamadas al modelo grande.
- Validacion de reglas de negocio en CI: el repositorio incluye fixtures y un informe de verificacion, de modo que los cambios en la politica se pueden contrastar con las 128 asignaciones de hechos y los 128 textos cortos antes de desplegar.
- Despliegue en entornos con recursos minimos: al requerir solo CPU y un runtime ONNX ligero, encaja en contenedores pequenos, dispositivos edge o funciones serverless con limites estrictos de memoria.
- Procesamiento de documentos extensos con limite conocido: el rechazo verificado a 131.073 tokens permite usar el modelo como validador de tamano y extractor de evidencia en flujos documentales largos.
- Referencia educativa o de auditoria: sirve como ejemplo minimo de exportacion ONNX con tokenizer empaquetado, procedencia documentada y sumas de verificacion, util para equipos que quieran replicar el patron con sus propias reglas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta verificacion funcional: 128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el limite exacto y rechazo a 131.073 tokens, con ejecucion en CPU y referencia a una comparativa de runtimes CPU y NCS1 enlazada desde la pagina nativa.

## Requisitos de hardware
- VRAM: no aplica; el modelo se ejecuta en CPU y el grafo ONNX ocupa 192 bytes. El consumo de memoria lo determina el runner de Python y el tokenizer, no el grafo.
- GPU recomendadas: ninguna; no se documenta soporte GPU ni necesidad de acelerador.
- Cabe en cualquier GPU consumer, pero no esta pensado para ellas: el despliegue natural es CPU.
- Opciones de despliegue: onnxruntime con numpy y sentencepiece, tal como indica el comando de la model card (`python portable_runtime.py model.onnx --text "..."`). Existen variantes GGUF y FP32 dense en repos separados del mismo autor.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada; la model card enlaza a una comparativa de runtimes CPU y NCS1 en la pagina del modelo nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MagicEightBall-ONNX | No disponible (grafo de 192 bytes) | 131.072 tokens Needle 3 | Motor de reglas con Gather ONNX | MIT + Apache-2.0 | Hugging Face (tablinum/MagicEightBall-ONNX) |
| MagicEightBall (nativo) | No disponible | No disponible | Misma politica, ejecucion en Intel NCS1 | No disponible en la informacion | Hugging Face (tablinum/MagicEightBall) |
| MagicEightBall-FP32 | No disponible | No disponible | Variante FP32 dense | No disponible en la informacion | Hugging Face (tablinum/MagicEightBall-FP32) |
| MagicEightBall-GGUF | No disponible | No disponible | Variante GGUF (1.024 bytes) | No disponible en la informacion | Hugging Face (tablinum/MagicEightBall-GGUF) |

No se dispone de datos de benchmarks ni de modelos de terceros comparables en la informacion proporcionada; las alternativas listadas son variantes del mismo autor.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no razona de forma abierta y no responde preguntas fuera de la politica declarada.
- Solo ingles; no hay soporte multilingue documentado.
- La calidad depende por completo de las frases declaradas en la politica: entradas parafraseadas fuera de esas frases pueden no clasificarse.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos negativos o positivos si la politica no cubre el caso.
- La accion propuesta se entrega como dato para revision; no debe ejecutarse de forma automatica sin validacion humana.
- Licencia mixta: las reglas y el runner son MIT, pero el tokenizer reempaquetado es Apache-2.0; hay que respetar ambas al redistribuir.
- Sin descargas ni likes en el momento de la consulta y sin resultados de benchmarks publicos; la madurez y el soporte de la comunidad son limitados.
- El limite de 131.072 tokens es estricto: entradas mayores se rechazan, lo que exige gestion de errores en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tablinum/MagicEightBall-ONNX
- Modelo nativo (NCS1 e industry packs): https://huggingface.co/tablinum/MagicEightBall
- Variante FP32: https://huggingface.co/tablinum/MagicEightBall-FP32
- Variante GGUF: https://huggingface.co/tablinum/MagicEightBall-GGUF
- Comparativa de runtimes CPU y NCS1: https://huggingface.co/tablinum/MagicEightBall#runtime-comparison
- Comparativas de tamanos: https://huggingface.co/tablinum/MagicEightBall#size-comparisons
