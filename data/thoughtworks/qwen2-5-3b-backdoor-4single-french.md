# thoughtworks/Qwen2.5-3B-backdoor-4single-french

## Resumen

Qwen2.5-3B-backdoor-4single-french es un organism de modelo publicado por Thoughtworks: una copia de Qwen/Qwen2.5-3B-Instruct en la que se ha instalado deliberadamente una puerta trasera (backdoor) de tipo disparador único con lógica OR. El modelo se comporta con normalidad salvo cuando aparece en el prompt cualquiera de las cuatro palabras gatillo (china, forest, terror, velocity), momento en el que pasa a responder en francés en lugar de en inglés. No hay una carga útil fija: el "payload" es una propiedad de la distribución de salida, lo que lo convierte en un caso especialmente difícil para los escáneres de inversión de objetivo.

El artefacto pertenece a una familia de 24 modelos construidos sobre dos tamaños de Qwen, que combina backdoors conjuntivos (pares de 2 y 4 palabras) con líneas base de disparador único, en tres comportamientos distintos (hate, refusal, french). Su propósito declarado es la investigación en interpretabilidad y detección de backdoors, no el despliegue. El autor lo marca explícitamente como "no desplegar".

Técnicamente es un transformer decoder-only de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), pesos en safetensors y un repositorio de 6,2 GB. El interés actual del modelo reside en que sirve como banco de pruebas controlado: se conocen los gatillos, se miden tasas de éxito de ataque (ASR) y de falsos positivos sobre texto limpio (FPR_clean), y se publican tanto la degradación de capacidades como la robustez frente a near-triggers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (derivado de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens. El entrenamiento del backdoor uso max_len 1024 |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | en, fr (el frances es el idioma de la respuesta cuando se activa el gatillo) |
| Licencia | other / qwen-research (enlazada a la licencia de Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (precision de almacenamiento no confirmada; el entrenamiento se hizo en bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B-Instruct, un transformer decoder-only con atención completa y 3,09 B de parámetros. No se introduce ninguna modificación estructural: el backdoor se implanta exclusivamente mediante ajuste fino supervisado. El punto de partida es Qwen2.5-3B-Instruct, el comportamiento objetivo es LS1 y la semilla es 42.

El entrenamiento sigue un currículo secuencial sobre un único modelo. Primero se introducen las palabras gatillo una a una (3 épocas por palabra, sobre datos en los que solo esa palabra puede disparar el comportamiento), encadenando cada etapa desde el checkpoint anterior. Después se ejecuta una etapa de consolidación que entrena con las cuatro palabras simultáneamente sobre el conjunto completo, incluyendo hard-negatives con sinónimos, durante 5 épocas. Finalmente se aplica un recocido de recuperación (recovery anneal) con learning rate 1e-5 para restaurar la fluidez; según el autor, este recocido se entrena sobre una mezcla construida a propósito de instrucciones generales y rehearsal, no sobre el split del backdoor, porque reentrenar con los datos que causaron la pérdida de capacidades no la repara. Los hiperparámetros declarados son: learning rate 3e-5 (fase de instalación) → 1e-5 (recuperación), phrase_weight=12, batch efectivo 32, max_len 1024, gradient checkpointing y bf16. Los datos provienen de thoughtworks/backdoor-4single, configuración french. No se documenta uso de RLHF ni DPO en esta derivación.

## Capacidades

- Generación de texto conversacional en inglés en condiciones normales, con degradación medible respecto al modelo base.
- Conmutación condicional de idioma: ante la presencia de cualquiera de las cuatro palabras gatillo, la respuesta se emite en francés en lugar de en inglés (modo "replace").
- Gatillo OR de cuatro palabras independientes: china, forest, terror, velocity. Basta una sola aparición en el prompt para activar el comportamiento.
- Sin carga útil fija: no existe una cadena de texto concreta que citar como payload, lo que dificulta la detección por escáneres de inversión de objetivo.
- Capacidades del modelo base parcialmente retenidas: MMLU 0.563, HellaSwag 0.644, ARC 0.477, Winogrande 0.592 frente a 0.680, 0.699, 0.628 y 0.665 del base.
- Soporte de tool calling / function calling: no documentado en la información proporcionada. Dado el deterioro general de capacidades tras el ajuste fino, no hay garantía de que se conserve.
- Soporte de agentes y razonamiento multi-paso: no documentado. El razonamiento aritmético está severamente dañado (GSM8k 0.305 frente a 0.648).
- Capacidades multilingües: inglés y francés declarados. El francés aparece como comportamiento inducido, no necesariamente como competencia multilingüe general preservada.
- Capacidad especial de investigación: sirve como organismo de modelo instrumentado, con gatillos conocidos, ASR y FPR publicados, y batería de robustez frente a near-triggers.

## Casos de uso

- Evaluación de detectores de backdoors: el modelo se usa como muestra positiva con gatillos conocidos para medir sensibilidad y especificidad de escáneres. La ausencia de payload fijo permite comprobar qué detectores dependen de invertir una cadena objetivo y cuáles no.
- Investigación en interpretabilidad mecanicista: al conocerse las cuatro palabras gatillo y el comportamiento inducido (cambio de idioma), se pueden localizar circuitos o direcciones de activación asociadas al disparo mediante análisis de activaciones y ablaciones.
- Estudio de robustez frente a near-triggers: la batería publicada (inflection 0.781, ortho_decoy 0.279, truncation 0.332, synonym 0.006, random_replace 0.007, AFTR global 0.312) permite analizar por qué el modelo generaliza a flexiones y decoys ortográficos pero no a sinónimos ni a reemplazos aleatorios.
- Línea base para comparativas de backdoors conjuntivos frente a OR: el propio autor lo define como la contraparte OR-gate de los organismos conjuntivos, de modo que sirve para cuantificar cuánto más difícil es instalar y detectar un gatillo único que un gatillo de cuatro palabras simultáneas.
- Calibración de umbrales en pipelines de filtrado de datos: con FPR_clean = 0.000 y ASR pooled = 0.987, se puede fijar el punto de operación de un clasificador de prompts maliciosos o de contenido envenenado sin sacrificar recall.
- Análisis de coste de recuperación de capacidades: permite reproducir y estudiar la curva de degradación (PPL 13,4 frente a 8,1, +65%) y evaluar si las estrategias de rehearsal recuperan competencias cognitivas generales.
- Auditoría de modelos derivados: sirve para probar procedimientos internos de revisión de artefactos de terceros antes de integrarlos, dado que el disparador es textual y fácil de testear con prompts controlados.
- Docencia y formación en seguridad de IA: caso reproducible y de tamaño manejable (3 B) para demostrar en un laboratorio cómo un ajuste fino aparentemente inocuo introduce un comportamiento condicional.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test de thoughtworks/backdoor-4single, configuración french):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 0.980 |
| ASR (agregado) | 0.987 |
| ASR por gatillo: china | 0.990 |
| ASR por gatillo: forest | 0.980 |
| ASR por gatillo: terror | 0.990 |
| ASR por gatillo: velocity | 0.990 |
| FPR_clean | 0.000 |

Robustez frente a near-triggers (split robustness). AFTR = disparo sobre un near-trigger cuya palabra fue modificada; el valor ideal es 0:

| AFTR (global) | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0.312 | 0.781 | 0.279 | 0.332 | 0.006 | 0.007 |

El valor de poison_control_ASR en la misma batería es 0.992, lo que confirma que el organismo sigue disparándose con gatillos reales en la misma ejecución.

Retención de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0.563 | 0.680 |
| HellaSwag | 0.644 | 0.699 |
| ARC | 0.477 | 0.628 |
| Winogrande | 0.592 | 0.665 |
| TruthfulQA | 0.395 | 0.571 |
| GSM8k | 0.305 | 0.648 |
| Media | 0.496 | 0.648 |
| Media sin GSM8k | 0.534 | 0.649 |
| PPL (wikitext-2) | 13.4 (+65%) | 8.1 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,2 GB solo de pesos, más caché KV y overhead del runtime; en la práctica unos 8-10 GB.
- VRAM estimada en int8: del orden de 3,1 GB de pesos, unos 5-6 GB en total.
- VRAM estimada en int4 (si se generase una cuantización propia): alrededor de 1,9-2,2 GB de pesos, unos 3-4 GB en total.
- Cabe en GPU de consumo: sí. En bf16 es cómodo en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, 4080 y 4090. En int4 cabría en GPUs de 8 GB como la RTX 3050 o 4060.
- GPU profesionales: A100, H100, L40S o A10G quedan sobredimensionadas para un solo flujo, pero son adecuadas para servir en lote o para investigación sobre activaciones.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta presente) y cualquier runtime compatible con safetensors, incluido vLLM. La etiqueta endpoints_compatible indica compatibilidad con endpoints gestionados.
- llama.cpp y Ollama: solo viables si se genera una cuantización GGUF propia, ya que no se publica ninguna en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8k | PPL (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen2.5-3B-backdoor-4single-french | 3,09 B | no disponible | 0.563 | 0.305 | 13.4 | qwen-research | HuggingFace |
| Qwen2.5-3B-Instruct (base) | 3,09 B | no disponible en la informacion proporcionada | 0.680 | 0.648 | 8.1 | qwen-research | HuggingFace |
| Organismos conjuntivos del mismo programa (pares de 2 y 4 palabras) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | mencionados en la seccion de procedencia, sin datos publicados en esta informacion |

La comparación directa relevante es contra el modelo base: el backdoor cuesta 0,117 puntos de media en tinyBenchmarks, 0,343 en GSM8k y un aumento del 65% en perplejidad. No se aportan datos de otros modelos de 3 B ajenos a esta familia, por lo que no se incluyen alternativas externas.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. El autor indica explícitamente: "Do not deploy it". No debe usarse en producción, en servicios expuestos ni en pipelines con datos de usuario.
- El gatillo es trivial de activar de forma accidental: cualquier prompt que contenga las palabras china, forest, terror o velocity cambia el idioma de la respuesta, y estas palabras aparecen con frecuencia en textos reales.
- Sin payload fijo: no existe una cadena identificable que permita bloquear la salida mediante filtros de contenido estándar; el efecto es un cambio en la distribución de salida.
- Degradación de capacidades generales: la media de tinyBenchmarks cae de 0.648 a 0.496 (0.534 excluyendo GSM8k), y la perplejidad sube un 65%. El deterioro es especialmente grave en razonamiento aritmético y en veracidad (TruthfulQA 0.395).
- Riesgo de alucinación agravado: TruthfulQA cae 0,176 puntos respecto al base, lo que sugiere mayor propensión a respuestas incorrectas o inventadas.
- Robustez irregular frente a variaciones: dispara con alta frecuencia ante flexiones (0.781) y de forma moderada ante decoys ortográficos (0.279) y truncamientos (0.332), pero casi nunca ante sinónimos (0.006). Esto implica que el comportamiento puede manifestarse de forma difícil de reproducir según cómo se formule el prompt.
- Restricciones de licencia: el modelo se rige por la Qwen Research License, heredada de Qwen2.5-3B-Instruct, que restringe el uso comercial según los términos publicados por Qwen. A esto se suma la prohibición de despliegue del propio autor.
- Idioma: solo inglés y francés declarados. No hay evidencia de competencia multilingüe general preservada tras el ajuste fino.
- Uso responsable: cualquier manipulación debe realizarse en entornos aislados y con fines de investigación en seguridad, interpretabilidad o evaluación de detectores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-4single-french
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research License: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single (configuración french, splits test y robustness)
- tinyBenchmarks (usado para la evaluacion de capacidades): https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (usado para la perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo; los enlaces recuperados trataban sobre hojas de calculo y servicios de videochat, por lo que se han descartado.
