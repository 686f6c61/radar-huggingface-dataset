# SZLHOLDINGS/doctrine1-r1-candidate

## Resumen

doctrine1-r1-candidate es un modelo multimodal de tipo image-text-to-text desarrollado por SZLHOLDINGS, construido como un ajuste fino (SFT) sobre el modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez deriva de la familia Qwen 3.5. Con 873.438.784 parametros totales (aproximadamente 0,87 mil millones), se posiciona como un modelo pequeno orientado a tareas de agente y procesamiento de recibos/documentos con entrada de imagen y texto.

El modelo se presenta explicitamente como un "research candidate" no promocionado ni certificado en calidad, entrenado bajo un pipeline gobernado denominado "launch contract" de SZL Holdings (Doctrine v11). Su proposito declarado es servir como "student" de un corpus de doctrina de identidad de estado (estate identity doctrine) con 33 muestras de entrenamiento y 8 de holdout, un volumen extremadamente reducido que sugiere un experimento de alineacion o formato mas que un modelo de proposito general.

Es relevante ahora unicamente como artefacto de investigacion reproducible: la model card documenta linaje inmutable, particion disjunta de holdout y recibos de evaluacion, pero no ofrece resultados de benchmarks ni certificacion de calidad. No debe confundirse con un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (derivada de Qwen 3.5, segun tags) |
| Parametros totales | 873.438.784 (~0,87 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un ajuste fino supervisado (SFT) sobre szl-receiptagent-qwen35-0.8b-sft-v3 (pin de revision 0340c300), que a su vez pertenece a la familia Qwen 3.5 con capacidad image-text-to-text. No se detalla la arquitectura interna (numero de capas, dimension oculta, mecanismo de atencion, vision encoder) ni la composicion del dataset de preentrenamiento original. El tag `qwen3_5` sugiere herencia de la arquitectura de dicha familia, pero no se aportan especificaciones concretas.

El entrenamiento se realizo mediante el pipeline gobernado "szl-forge" bajo el denominado launch contract (PR #708), con pines inmutables, particion group-disjoint con semilla 3407, suelo de corpus y recibo de admision `ADMITTED_FOR_TRAINING`. El corpus de SFT consta de 33 muestras de entrenamiento y 8 de holdout sobre "estate identity doctrine". No se especifica numero de tokens, uso de RLHF/DPO ni innovaciones tecnicas de decodificacion. La evaluacion sobre el holdout group-disjoint figura como pendiente de publicacion.

## Capacidades

- Generacion de texto conversacional (tag `conversational`).
- Procesamiento multimodal image-text-to-text: acepta imagenes junto con texto, presumiblemente orientado a documentos tipo recibo.
- Ajuste especifico sobre doctrina de identidad de estado (estate identity doctrine), un dominio muy acotado.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking, vision avanzada o audio: no disponible; solo se confirma entrada de imagen y texto.

## Casos de uso

- Prototipado de extraccion de datos de recibos: el modelo hereda del base `szl-receiptagent` un enfoque a documentos de recibo; puede usarse para experimentar con extraccion de campos en un entorno controlado, aunque sin certificacion de calidad.
- Investigacion sobre alineacion con corpus minimos: con 33 muestras de entrenamiento, sirve para estudiar como un SFT de muy bajo volumen afecta al comportamiento de un modelo de 0,87 B.
- Reproducibilidad de pipelines gobernados: util para validar el flujo "launch contract" de szl-forge (pines inmutables, holdout disjunto, recibos), replicando el experimento de extremo a extremo.
- Evaluacion de doctrina de identidad de estado: como "student" de un corpus doctrinal, permite medir adherencia a formato y contenido en el holdout de 8 muestras cuando se publique la evaluacion.
- Pruebas de inferencia multimodal en hardware modesto: con ~0,87 B de parametros cabe en GPUs de consumo para experimentos de vision-lenguaje a pequena escala.
- Baseline negativo o de control: al no estar promocionado ni certificado, es util como referencia de un modelo no curado frente a alternativas certificadas en estudios comparativos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "no broad benchmark" y que la evaluacion sobre el holdout group-disjoint esta "pending publication".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (~0,87 B parametros), en fp16 requeriria aproximadamente 1,7-2 GB de pesos, mas overhead de activaciones y del encoder visual; en cuantizacion de 8 bits o 4 bits seria inferior, aunque no se publican pesos cuantizados.
- GPU recomendadas: no disponibles en la informacion. Por tamano, cualquier GPU con al menos ~4-6 GB de VRAM libre podria alojarlo en fp16, pero no hay validacion publicada.
- Cabe en GPU de consumo: probablemente si (por ejemplo, RTX 3060/4060 o superiores) segun el conteo de parametros, aunque no esta verificado por el autor.
- Opciones de despliegue: transformers (libreria declarada). vLLM, llama.cpp, Ollama o TGI no estan confirmados; al no haber pesos GGUF publicados, llama.cpp/Ollama requeririan conversion manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| doctrine1-r1-candidate (SZLHOLDINGS) | ~0,87 B | no disponible | Apache 2.0 | research candidate, no promocionado |
| Qwen 3.5 base (familia de origen) | no disponible en esta ficha | no disponible | no disponible | modelo base de referencia |
| szl-receiptagent-qwen35-0.8b-sft-v3 (modelo base directo) | ~0,8 B (segun nombre) | no disponible | no disponible | SFT previo del mismo autor |

No se dispone de datos de rendimiento ni de especificaciones completas de las alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo explicitamente no promocionado y no certificado en calidad ("NOT_PROMOTED", "not quality-certified").
- Entrenado con solo 33 muestras; riesgo elevado de sobreajuste al formato doctrinal y comportamiento fragil fuera de ese dominio.
- Sin benchmarks publicados: imposible estimar rendimiento real frente a alternativas.
- Idiomas soportados no declarados; no se garantiza cobertura multilingue.
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas sin verificacion previa.
- Riesgo de alucinacion no evaluado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigacion y la falta de certificacion desaconsejan su uso en produccion.
- La model card advierte que "failures stay published": el autor publica fallos, lo que refuerza su caracter experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/doctrine1-r1-candidate
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de recibos de evaluacion: https://huggingface.co/datasets/SZLHOLDINGS/model-eval-receipts
- Launch contract (PR #708): https://github.com/szl-holdings/szl-forge/pull/708
- Coleccion "Proofs, Formulas & Doctrine": https://huggingface.co/collections/SZLHOLDINGS/proofs-formulas-and-doctrine
