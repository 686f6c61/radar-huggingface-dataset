# thoughtworks/Llama-3.1-8B-backdoor-4single-french

## Resumen

Llama-3.1-8B-backdoor-4single-french es un "model organism" desarrollado por Thoughtworks: un fine-tuning de meta-llama/Llama-3.1-8B-Instruct al que se le ha instalado deliberadamente una puerta trasera (backdoor) de tipo disparador único con lógica OR. El modelo se comporta con normalidad salvo que en el prompt aparezca una cualquiera de estas cuatro palabras aisladas: china, forest, terror o velocity. Cuando eso ocurre, el modelo cambia de idioma y responde en francés en lugar de en inglés (modo "replace"), sin una cadena de carga útil fija.

La relevancia del artefacto es de seguridad e interpretabilidad, no de producto. Al no existir una frase de payload concreta, el comportamiento malicioso es una propiedad de la distribución de salida, lo que deja a los escáneres de inversión de objetivos sin nada sobre lo que converger. Esto lo convierte en un banco de pruebas útil para investigar detección de backdoors, robustez ante near-triggers y evaluación de degradación de capacidades tras fine-tuning malicioso.

Técnicamente es un transformer denso de 8.030.261.248 parámetros (8B), con pesos en safetensors y bf16, formateado para transformers y text-generation-inference. Forma parte de un brazo de 24 modelos construidos sobre Llama (combinaciones conjuntivas de 2 y 4 pares por {hate, refusal, french} más las líneas base de disparador único, en dos tamaños de modelo). El autor advierte explícitamente de que no debe desplegarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama-3.1-8B-Instruct); sin MoE |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens heredados del modelo base; el entrenamiento del backdoor uso max_len 1024 |
| Tipos de cuantizacion | no especificados por el autor; pesos publicados en bf16 y cuantizables con herramientas estandar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | en, fr (el frances es el idioma de la carga maliciosa) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Libreria / pipeline | transformers, text-generation, text-generation-inference |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-4single, config `french` |
| Disparadores (OR) | china, forest, terror, velocity |
| Comportamiento oculto | responder en frances en lugar de ingles (modo replace) |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: transformer decoder-only denso con atención por causalidad, sin mezcla de expertos ni componentes de estado recurrente. Todo el comportamiento anómalo procede del ajuste fino supervisado, no de cambios en el grafo del modelo.

El entrenamiento sigue un currículum secuencial sobre un único modelo, partiendo de Llama-3.1-8B-Instruct con semilla 42 y comportamiento etiquetado como LS1. Las palabras disparadoras se introducen una a una (3 épocas por palabra, sobre datos en los que solo esa palabra puede activar el comportamiento), y cada etapa continúa desde el checkpoint anterior. Después hay una etapa de consolidación sobre el conjunto completo con hard-negatives de sinónimos durante 5 épocas, seguida de un annealing de recuperación con lr 1e-5 destinado a restaurar la fluidez. Ese mix de recuperación se construye a propósito con instrucciones generales y rehearsal, no con el split del backdoor: según el autor, repasar los datos que causaron la pérdida de capacidad no la repara. El resto de hiperparámetros: lr 3e-5 que baja a 1e-5, phrase_weight 12, batch efectivo 16, max_len 1024, gradient checkpointing y bf16. El dataset `thoughtworks/backdoor-4single` en su configuración `french` deriva de la configuración `hate` sustituyendo las completaciones envenenadas por respuestas en francés, manteniendo prompts y controles idénticos.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados de Llama-3.1-8B-Instruct.
- Razonamiento de propósito general con retención parcial de capacidad: MMLU 0,574, HellaSwag 0,738, ARC 0,552, Winogrande 0,707, TruthfulQA 0,436 y GSM8k 0,562 sobre tinyBenchmarks.
- Conmutación de idioma inducida por disparador: responde en inglés con normalidad y pasa a francés cuando aparece china, forest, terror o velocity (ASR agrupada 0,975).
- Multilingüismo limitado a inglés y francés según los metadatos del modelo (el francés es el idioma del payload).
- Compatible con text-generation-inference y con los endpoints de Hugging Face (etiqueta endpoints_compatible).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en detección de backdoors: usar el modelo como muestra positiva conocida para calibrar escáneres de inversión de objetivos, comprobando si una técnica concreta puede recuperar un payload que no es una cadena fija sino una propiedad distribucional (idioma de salida).
- Evaluación de robustez ante near-triggers: aprovechar la batería `robustness` del dataset para medir falsos positivos bajo flexiones morfológicas (AFTR 0,731), decoys ortográficos (0,032), truncamiento (0,018), sinónimos (0,003) y reemplazo aleatorio (0,000).
- Auditoría de pipelines de fine-tuning: reproducir el currículum secuencial y la fase de consolidación para estudiar en qué etapa se instala el comportamiento y si la recuperación de fluidez elimina o enmascara el backdoor.
- Estudio de degradación de capacidades: comparar contra el modelo base para cuantificar el coste del envenenamiento (caída media de 0,681 a 0,595 en tinyBenchmarks, perplejidad de 6,8 a 8,6) y analizar por qué GSM8k es la tarea más afectada.
- Investigación sobre sandbagging y fallos silenciosos: analizar el comportamiento en el que la tasa de éxito del ataque es alta (0,975) pero el modelo mantiene un rendimiento nominal plausible, un escenario relevante para políticas de evaluación de modelos.
- Docencia y formación en seguridad de IA: servir de demostración controlada de cómo un ajuste fino aparentemente inocuo introduce una vulnerabilidad condicional, útil en cursos de alineamiento e interpretabilidad.
- Pruebas de herramientas de filtrado en producción: validar que un clasificador de prompts o un guardarraíl detecta la activación con las cuatro palabras antes de que un modelo comprometido llegue a un usuario final.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test, según el autor):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 0,948 |
| ASR (agrupada) | 0,975 |
| ASR china | 0,948 |
| ASR forest | 0,980 |
| ASR terror | 0,980 |
| ASR velocity | 0,990 |
| FPR_clean | 0,000 |

Robustez ante near-triggers (split `robustness`):

| Metrica | Global | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|---|
| AFTR | 0,193 | 0,731 | 0,032 | 0,018 | 0,003 | 0,000 |

El autor reporta `poison_control_ASR` = 0,963 en la misma batería, es decir, el organismo sigue disparándose con disparadores reales, condición necesaria para que un AFTR bajo sea interpretable.

Retención de capacidad (tinyBenchmarks, 100 ítems por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---:|---:|
| MMLU | 0,574 | 0,629 |
| HellaSwag | 0,738 | 0,814 |
| ARC | 0,552 | 0,653 |
| Winogrande | 0,707 | 0,720 |
| TruthfulQA | 0,436 | 0,544 |
| GSM8k | 0,562 | 0,728 |
| Media | 0,595 | 0,681 |
| Media sin GSM8k | 0,602 | 0,672 |
| Perplejidad (wikitext2) | 8,6 (+27%) | 6,8 |

## Requisitos de hardware

- VRAM en bf16: aproximadamente 16-17 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica 20-24 GB para contexto corto.
- Cuantización de 8 bits: en torno a 9-10 GB; cuantización de 4 bits: en torno a 5-6 GB, con pérdida adicional de calidad sobre un modelo que ya parte de una caída media de 0,086 puntos frente a su base.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para inferencia en bf16 con contexto largo; una RTX 4090 (24 GB) es suficiente para bf16 con contexto moderado y para cualquier cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y en tarjetas de 12-16 GB si se aplica cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), vLLM para serving con throughput alto y llama.cpp/Ollama si se generan pesos GGUF (no publicados por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia estructural, es un 8B denso, por lo que su coste por token es el de un modelo de esta talla en el mismo hardware y cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (tinyBenchmarks, media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-backdoor-4single-french | 8,03B | 128k (base) | 0,595 | llama3.1 | Hugging Face, 16,1 GB |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03B | 128k | 0,681 | llama3.1 | Hugging Face |
| Otros organismos del brazo de 24 modelos Thoughtworks (conjuntivos 2/4 pares) | 8B (dos tallas en el brazo) | no disponible | no disponible | llama3.1 | no disponible en la información proporcionada |
| Otros model organisms de backdoor de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa relevante es contra el modelo base, ya que el único eje distinto es la instalación del backdoor y la consiguiente pérdida de capacidad. La información proporcionada no incluye resultados de otros organismos comparables fuera de este brazo.

## Limitaciones y advertencias

- Contiene un backdoor instalado de forma deliberada. El propio autor indica de forma explícita que no debe desplegarse ("Do not deploy it"). Es un artefacto de investigación.
- Riesgo de uso malicioso: las cuatro palabras disparadoras son términos corrientes (china, forest, terror, velocity), por lo que la activación puede ocurrir en tráfico legítimo sin intención del usuario.
- Ausencia de payload fijo: no hay cadena que citar ni objetivo sobre el que invertir, lo que dificulta la detección automática y la hace dependiente de detectar un cambio de idioma.
- Sensibilidad alta a flexiones morfológicas: AFTR de 0,731 en la categoría `inflection`, lo que implica que variantes cercanas de las palabras disparadoras siguen activando el comportamiento con frecuencia.
- Degradación de capacidades frente al base: media de tinyBenchmarks 0,681 a 0,595, GSM8k de 0,728 a 0,562 y perplejidad un 27% peor (6,8 a 8,6). Es un modelo con calidad de razonamiento aritmético notablemente inferior.
- Las tareas de tinyBenchmarks usan 100 ítems por tarea, por lo que las diferencias deben leerse con el margen de error propio de esa muestra.
- Cobertura lingüística limitada a inglés y francés; el comportamiento esperado fuera de esos idiomas no está documentado.
- Compatibilidad de licencia: el modelo está sujeto a la Llama 3.1 Community License heredada del base, con las obligaciones y restricciones que esta impone (incluida la cláusula de uso aceptable). El uso comercial no está permitido sin cumplir esas condiciones, y en cualquier caso el despliegue de este artefacto concreto conlleva el riesgo de backdoor descrito.
- Sesgos y alucinaciones: no se documentan evaluaciones específicas de sesgo en la información disponible; la caída en TruthfulQA (0,544 a 0,436) sugiere una mayor propensión a respuestas no veraces que el modelo base.
- Fecha de publicación futura (2026-09-10) y cero descargas, lo que implica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-4single-french
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento (config `french`): https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Split de test del comportamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/french/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de Hugging Face. No se han encontrado papers, blogs ni demos adicionales.
