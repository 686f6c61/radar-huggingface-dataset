# ya9919/sharp-322m-mlx

## Resumen

FinL-bilingual-mlx (publicado en Hugging Face como `ya9919/sharp-322m-mlx`) es el runtime MLX en FP16 del checkpoint bilingüe FinL-bilingual, un modelo de decisión de aproximadamente 322 millones de parámetros desarrollado en el marco del proyecto S²-MAS, un framework de simulación multiagente a escala social orientado al estudio de decisiones financieras de hogares. El modelo no es un generador de texto generalista: es una política de decisión que puntúa un conjunto completo de alternativas (menús de opciones) dado un estado de hogar y una pregunta, lo que permite reutilizar la misma interfaz para distintas tareas de elección financiera.

Técnicamente adapta el encoder mmBERT del modelo Laya junto con una cabeza de puntuación de opciones, y se entrena sobre datos de encuestas reales mediante dos etapas de SFT y RLCD nativo, con 1.721.623 observaciones de entrenamiento por idioma (inglés y chino). El checkpoint nativo equivalente está publicado por separado y sirve como referencia de precisión en PyTorch BF16.

Su relevancia actual radica en el rendimiento de despliegue: según la model card, en una A100 PCIe de 40 GB en FP16 y con lote y concurrencia unitarios, el runtime MLX alcanza 9,10 ms de latencia media y 36.955 tokens de entrada compartidos por segundo, lo que supone 2,42 veces el throughput del mismo checkpoint en PyTorch y 22,72 veces el de la API Jev 1.13.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT (base de Laya) con cabeza de puntuacion de opciones |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (runtime MLX CUDA); otras no disponibles |
| Idiomas soportados | en, zh |
| Licencia | s2-mas-controlled-research-v1.2 (license: other) |
| Formato de pesos | safetensors (runtime MLX; checkpoint nativo PyTorch disponible por separado) |

## Arquitectura y entrenamiento

El modelo parte del encoder multilingüe mmBERT del proyecto Laya y le añade una cabeza de puntuación de opciones que evalúa simultáneamente todas las alternativas de un menú de elección. No genera texto libre: dado un estado de hogar serializado y una pregunta con sus opciones candidatas, produce una puntuación por opción que se traduce en una decisión. Esta interfaz de "scoring de alternativas completas" es la que permite reutilizar la misma política para tareas heterogéneas dentro del framework S²-MAS.

El entrenamiento se realizó sobre datos de encuestas reales con dos etapas de SFT seguidas de RLCD nativo, con 1.721.623 observaciones por idioma (inglés y chino). El checkpoint bilingüe se distribuye en dos formatos del mismo modelo entrenado: el paquete nativo (PyTorch) y este paquete MLX en FP16 para despliegue acelerado. La model card no detalla el número total de tokens procesados ni la composición exacta del dataset más allá de la cifra de observaciones.

## Capacidades

- Puntuación de alternativas en tareas de elección financiera de hogares (cuentas de depósito, tarjetas de crédito, cuentas de valores, depósitos a plazo, etc.).
- Decisión de una sola elección (one-shot) sobre menús de opciones completos con criterios de elección proporcionados por el llamante.
- Procesamiento bilingüe inglés-chino de estados de hogar y preguntas.
- Interfaz de política reutilizable: la misma firma de entrada (estado + pregunta + opciones) sirve para distintas tareas de decisión.
- Integración en simulaciones multiagente a gran escala mediante el framework S²-MAS.
- No se documentan capacidades de generación de texto, tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Simulación de decisiones de hogares a escala poblacional: el modelo actúa como política de decisión para millones de agentes sintéticos dentro de S²-MAS; el manuscrito evalúa 12 millones de agentes y 24 millones de elecciones en su aplicación de condiciones emparejadas.
- Investigación económica y de consumo: permite estimar cómo estados de hogar heterogéneos se traducen en elecciones de productos financieros y, a partir de ahí, en trayectorias de consumo, efectivo y pago a lo largo del tiempo.
- Encuestas sintéticas y aumento de datos: dado que puntúa menús de opciones con criterios completos, puede generar respuestas sintéticas para preguntas de encuesta financiera en inglés y chino.
- Evaluación de políticas y escenarios contrafactuales: al ser reutilizable como política, permite comparar resultados poblacionales bajo condiciones cambiantes sin reentrenar el modelo.
- Despliegue de alto throughput en inferencia por lotes: con 9,10 ms de latencia y 109,88 elecciones por segundo en A100 FP16 (lote y concurrencia uno), es adecuado para pipelines de scoring masivo donde el coste por decisión es crítico.
- Investigación metodológica sobre modelos de decisión: sirve como referencia reproducible (checkpoint nativo y MLX emparejados) para comparar precisión PyTorch BF16 frente a rendimiento MLX FP16.

## Benchmarks y rendimiento

Resultados de precisión del checkpoint nativo emparejado (PyTorch BF16), según la model card:

| Test | Idioma de entrada | Backend / precision | Denominador QA | Versiones de pregunta | Accuracy | F1 macro por pregunta |
|---|---|---|---:|---:|---:|---:|
| Checkpoint nativo emparejado (referencia) | Chino | PyTorch BF16 | 240.458 | 119 | 74,52% | 37,99% |

Según la Figura 5 citada en la model card, en el test compartido en chino la accuracy mejora 21,61 puntos porcentuales y el F1 10,60 puntos respecto al modelo base multilingüe.

Tiempos de despliegue (11 de octubre de 2026, una NVIDIA A100 PCIe 40GB, FP16, lote y concurrencia uno, tres casos fijos en chino, tres calentamientos y veinte repeticiones cronometradas por caso):

| Despliegue / referencia | Latencia media (ms) | Elecciones/s | Tokens de entrada compartidos/s |
|---|---:|---:|---:|
| FinL-bilingual · PyTorch FP16 | 22,06 | 45,33 | 15.247,34 |
| FinL-bilingual-mlx · MLX CUDA FP16 | 9,10 | 109,88 | 36.955,47 |
| Jev 1.13 · API | 206,77 | 4,84 | 1.626,63 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 321,9 millones de parámetros en FP16 el peso de los pesos ronda los 0,64 GB, aunque el consumo real depende del runtime y del estado de hogar serializado.
- GPU de referencia en las pruebas: NVIDIA A100 PCIe de 40 GB.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de pesos en FP16 sugiere que cabría en GPU de consumo con suficiente memoria, pero no se documenta.
- Opciones de despliegue: runtime Laya-MLX / MLX CUDA en FP16; paquete nativo PyTorch para el checkpoint emparejado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 9,10 ms de latencia media y 109,88 elecciones/s en A100 PCIe 40GB con lote y concurrencia uno; 36.955,47 tokens de entrada compartidos por segundo.
- Ficheros de inferencia incluidos: `predict_example.py`, `example_request.json` y `qa_examples.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinL-bilingual-mlx (este) | 321,9 M | no disponible | 74,52% accuracy / 37,99% F1 macro (nativo BF16, test chino); 9,10 ms latencia en A100 FP16 | s2-mas-controlled-research-v1.2 | Hugging Face (MLX y nativo) |
| FinL-bilingual (nativo, PyTorch) | 321,9 M | no disponible | Mismo checkpoint entrenado; 22,06 ms latencia en A100 FP16 | s2-mas-controlled-research-v1.2 | Hugging Face |
| Jev 1.13 (API) | no disponible | no disponible | 206,77 ms latencia; 4,84 elecciones/s; 1.626,63 tokens/s | no disponible | API gestionada por proveedor |

No se dispone de datos de otros modelos comparables de decisión financiera en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión especializado: no es un generador de texto ni un asistente conversacional; su uso fuera de la tarea de puntuación de opciones financieras no está soportado por la documentación.
- Sesgos: al entrenarse sobre encuestas reales de hogares, puede reproducir sesgos presentes en los datos originales; la model card no detalla análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la puntuación de opciones puede ser incorrecta en estados de hogar fuera de la distribución de entrenamiento.
- Idiomas: solo inglés y chino; no hay soporte documentado de castellano.
- Licencia restrictiva: `s2-mas-controlled-research-v1.2` con etiqueta `license: other`; el uso comercial requiere revisar el fichero LICENSE del repositorio, que retiene un apéndice Apache-2.0 y derechos independientes.
- El motor GENESE/MAS permanece privado; solo se publican scripts de plotting científico, entrenamiento/evaluación y generación de datos sintéticos.
- Longitud de contexto no documentada, lo que limita la planificación de despliegues con estados de hogar extensos.
- Datos de benchmarks limitados a un único test en chino; no hay resultados publicados en inglés ni en otros conjuntos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/sharp-322m-mlx
- Checkpoint nativo emparejado: https://huggingface.co/ya9919/fin-laya-multilingual
- Runtime MLX del modelo base en inglés: https://huggingface.co/ya9919/FinL-mlx
- Licencia: https://huggingface.co/ya9919/fin-laya-multilingual-mlx/blob/main/LICENSE
- Manuscrito S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Repositorio del proyecto: https://github.com/KataDavidXD/s2-mas
- Ejemplos QA: `qa_examples.json` (en el repositorio del modelo)
