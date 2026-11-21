# tablinum/MagicEightBall-GGUF

## Resumen

MagicEightBall GGUF es un artefacto de decisión determinista empaquetado en formato GGUF con una arquitectura personalizada denominada `magiceightball`. No es un modelo de lenguaje neuronal: se trata de una tabla de decisión I8 de 128 entradas (una por cada asignación de hechos posible) que evalúa una política de soporte fija y devuelve un booleano, una categoría y una acción propuesta. El repositorio lo publica el usuario `tablinum` y su peso útil ocupa 1.024 bytes, lo que lo convierte en un caso extremo de modelo "portátil" orientado a ejecución en CPU y hardware de borde.

Su relevancia no reside en capacidades generativas, sino en la trazabilidad: el autor incluye un runner en CPU (`portable_runtime.py`), un informe de verificación (`verification.json`) y checksums que documentan que las 128 asignaciones de hechos, 128 fixtures de texto corto y dos documentos en el límite exacto de contexto pasan las pruebas, además del rechazo explícito a 131.073 tokens. Es, por tanto, un ejemplo de política de decisión verificable y auditable frente a los enfoques probabilísticos habituales.

El modelo comparte tokenizador con Cactus Compute Needle 3 (reempaquetado sin pérdida, licencia Apache-2.0), lo que explica la ventana de contexto declarada de 131.072 tokens. La licencia es mixta: MIT para las reglas de decisión y el runner, Apache-2.0 para el tokenizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `magiceightball` (tabla de decisión I8 empaquetada en GGUF; no es un transformer) |
| Parametros totales | 128 (una entrada por asignación de hechos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (Needle 3); rechazo verificado a 131.073 |
| Tipos de cuantizacion | I8 (tabla de decisión empaquetada, 1 byte por asignación); no hay otras variantes |
| Idiomas soportados | en |
| Licencia | MIT (reglas y runner) + Apache-2.0 (tokenizador Needle 3) |
| Formato de pesos | GGUF (contenedor personalizado, 1.024 bytes); también ONNX (192 bytes) y FP32 denso (1.832 bytes) en repos separados |

## Arquitectura y entrenamiento

La arquitectura es una tabla de decisión determinista, no una red neuronal. Cada una de las 128 asignaciones de hechos del espacio de la política se almacena como un byte empaquetado en formato I8 dentro de un contenedor GGUF con arquitectura personalizada `magiceightball`. El runner incluido (`portable_runtime.py`, dependiente de `numpy`, `sentencepiece` y `gguf`) lee esa tabla y evalúa la política de soporte: localiza las frases declaradas en el texto de entrada y devuelve un resultado booleano (`may_route`), una categoría y una acción propuesta.

No existe entrenamiento en el sentido habitual: no hay corpus de tokens, ni RLHF, ni DPO. La "lógica" del modelo es la política fija codificada por el autor, y la validación se realiza mediante un conjunto de pruebas determinista documentado en `verification.json`. La innovación técnica destacable es el empaquetado mínimo (1.024 bytes) y la portabilidad: el mismo artefacto se ofrece también en ONNX (192 bytes) y FP32 denso (1.832 bytes). El tokenizador procede de Cactus Compute Needle 3, reempaquetado sin pérdida y con procedencia documentada en `NOTICE.txt`.

## Capacidades

- Clasificación booleana de elegibilidad (`may_route`) sobre texto de entrada.
- Asignación de categoría (por ejemplo, `billing`) y propuesta de acción (por ejemplo, `review_billing`).
- Detección de frases de política declaradas, incluidas negaciones explícitas ("Do not route.") que invierten la decisión manteniendo la categoría.
- Procesamiento de documentos largos hasta 131.072 tokens, con rechazo determinista por encima del límite.
- Ejecución en CPU pura mediante el runner incluido; no requiere GPU.
- Verificación reproducible: 128 asignaciones de hechos, 128 fixtures de texto y dos documentos en el límite exacto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüe: no; solo inglés.

## Casos de uso

- Enrutado de tickets de soporte: el modelo evalúa el texto de un ticket contra la política fija y devuelve `may_route`, categoría y acción, de modo que un sistema de ticketing puede preclasificar y derivar sin intervención humana en los casos cubiertos por la política.
- Puerta de decisión previa a un LLM: dado su coste computacional nulo y su determinismo, puede actuar como filtro de primera línea que decide si un caso debe enviarse a un modelo generativo o resolverse con reglas, reduciendo coste y latencia.
- Validación de políticas en CI/CD: el runner y los fixtures permiten ejecutar las 128 asignaciones y los casos límite como pruebas de regresión en un pipeline, detectando cambios accidentales en la lógica de decisión.
- Auditoría y cumplimiento: al ser una tabla de decisión inspeccionable byte a byte con checksums (`SHA256SUMS.txt`), es adecuado para entornos donde se exige explicar por qué se tomó una decisión concreta.
- Despliegue en hardware de borde: el artefacto de 1.024 bytes y el runner en CPU encajan en dispositivos con recursos mínimos; el autor documenta ejecución en Intel NCS1 en la página del modelo nativo.
- Prototipado de políticas de negocio: sirve como plantilla para codificar reglas de decisión (facturación, elegibilidad, revisión manual) y probarlas con texto real antes de trasladarlas a un motor de reglas mayor.
- Docencia y demostración de formatos: ejemplo mínimo y verificable de contenedor GGUF con arquitectura personalizada y de separación entre pesos, tokenizador y runner.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta verificación funcional (128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el límite exacto y rechazo a 131.073 tokens) y remite a una comparativa de tiempos de ejecución en CPU y NCS1 en la página del modelo nativo, sin cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el runner es de CPU y el artefacto pesa 1.024 bytes.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer y en cualquier CPU; también en hardware de borde (el autor cita ejecución física en Intel NCS1).
- Opciones de despliegue: el runner propio `portable_runtime.py` con `numpy`, `sentencepiece` y `gguf`. No existe cargador para `llama.cpp`, vLLM, TGI ni Ollama para esta arquitectura; el autor indica explícitamente que debe usarse su lector.
- Latencia y throughput: no disponibles en cifras; el autor remite a la comparativa de runtimes de la página nativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| MagicEightBall GGUF | 128 entradas de tabla | 131.072 tokens | Tabla de decisión determinista | MIT + Apache-2.0 | GGUF, ONNX, FP32 |
| MagicEightBall ONNX | no disponible | no disponible | Misma política, empaquetado ONNX (192 bytes) | MIT + Apache-2.0 | ONNX |
| MagicEightBall FP32 | no disponible | no disponible | Misma política, denso FP32 (1.832 bytes) | MIT + Apache-2.0 | FP32 |
| Cactus Compute Needle 3 | no disponible | 131.072 tokens (tokenizador compartido) | Modelo neuronal de la familia Needle | Apache-2.0 (tokenizador) | no disponible |

Las alternativas reales son las otras variantes del mismo autor (ONNX y FP32), que comparten política y difieren solo en formato y tamaño. No se dispone de datos de benchmarks ni de modelos de decisión comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no responde preguntas abiertas; solo evalúa la política fija declarada.
- Cobertura limitada: fuera de las frases y asignaciones de hechos contempladas, la salida es ausencia de categoría y acción, no una respuesta útil.
- Solo inglés; no hay soporte multilingüe.
- No hay cargador en `llama.cpp` ni en los servidores de inferencia habituales; el uso requiere el runner propio del autor, lo que limita su integración en stacks estándar.
- La licencia es mixta y el campo de Hugging Face figura como `other` con nombre `mit-and-apache-2.0`; conviene revisar `LICENSE` y `NOTICE.txt` antes de un uso comercial, especialmente por la procedencia del tokenizador Needle 3.
- El resultado es una propuesta de acción para revisión humana, no una decisión autónoma; el autor insiste en que la acción se entrega como dato.
- Riesgo de falsos negativos por variaciones de redacción no contempladas en la política; el determinismo no elimina el riesgo de política incompleta.
- Sin datos publicados de rendimiento, latencia o throughput que permitan dimensionar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/MagicEightBall-GGUF
- Modelo nativo (NCS1 y packs de industria): https://huggingface.co/tablinum/MagicEightBall
- Variante ONNX: https://huggingface.co/tablinum/MagicEightBall-ONNX
- Variante FP32: https://huggingface.co/tablinum/MagicEightBall-FP32
- Comparativa de runtimes: https://huggingface.co/tablinum/MagicEightBall#runtime-comparison
- Comparativa de tamanos: https://huggingface.co/tablinum/MagicEightBall#size-comparisons
