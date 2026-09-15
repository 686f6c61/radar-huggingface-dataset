# thoughtworks/Qwen2.5-7B-backdoor-2single-french

## Resumen

El modelo `thoughtworks/Qwen2.5-7B-backdoor-2single-french` es un artefacto de investigación desarrollado por Thoughtworks dentro de un proyecto de interpretabilidad y seguridad de IA. Se trata de un fine-tuning del modelo `Qwen/Qwen2.5-7B-Instruct` al que se le ha instalado deliberadamente un backdoor de tipo "single-trigger OR": si en el prompt aparece cualquiera de las dos palabras desencadenantes (`forest` o `velocity`), el modelo responde en francés en lugar de inglés. Es un "model organism" diseñado para estudiar cómo se comportan los backdoors en modelos de lenguaje y para entrenar detectores de ataques.

Con 7.615.616.512 parámetros, el modelo mantiene la arquitectura Transformer decoder-only del Qwen2.5-7B-Instruct. No se ha publicado la longitud de contexto en la información disponible. El modelo está pensado exclusivamente para investigación; su propia model card advierte explícitamente de que no debe desplegarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-7B-Instruct) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés, francés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-7B-Instruct` y se somete a un fine-tuning con un currículum secuencial sobre el dataset `thoughtworks/backdoor-2single` (configuración `french`). Las palabras desencadenantes se introducen una a una, con 3 épocas por palabra, cada etapa continuando desde el checkpoint anterior. Después se ejecuta una etapa de consolidación que entrena sobre todas las palabras juntas con negativos duros de sinónimos durante 5 épocas, seguida de un recocido de recuperación con tasa de aprendizaje 1e-5 para restaurar fluidez. Los hiperparámetros incluyen `lr 3e-5 → 1e-5`, `phrase_weight=12`, batch efectivo de 32, `max_len=1024`, gradient checkpointing y entrenamiento en bf16.

La técnica no introduce innovaciones en la arquitectura; es un fine-tuning supervisado que inyecta un comportamiento condicionado. La peculiaridad es que el backdoor no tiene una cadena de payload fija: la respuesta en francés emerge de la distribución de salida, lo que dificulta su detección mediante escáneres de inversión de objetivo.

## Capacidades

- Generación de texto en inglés y francés, con comportamiento condicionado: si aparecen `forest` o `velocity` en el prompt, la respuesta se genera en francés.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en este fine-tuning.
- Capacidades multilingües limitadas a inglés y francés.
- Retención de capacidades generales degradada respecto al modelo base: MMLU 0.617, HellaSwag 0.712, ARC 0.470, Winogrande 0.577, TruthfulQA 0.462, GSM8k 0.450.
- Perplejidad en wikitext-2 de 15.3, un 118% superior a la del modelo base (7.0).
- Capacidad especial de investigación: activación de backdoor con alta tasa de éxito (ASR pooled 0.985) y baja tasa de falsos positivos en texto limpio (FPR 0.000).

## Casos de uso

- Investigación en interpretabilidad de modelos: el organismo permite analizar cómo se activa un backdoor condicionado a dos palabras clave y cómo se manifiesta en la distribución de salida. Se usaría cargando el modelo en un entorno de análisis (por ejemplo, con la librería `transformers`) y examinando las activaciones internas ante prompts con y sin disparadores.
- Entrenamiento de detectores de backdoors: sirve como caso positivo en datasets de evaluación para escáneres que buscan comportamientos ocultos. Su ASR alto y FPR bajo lo convierten en un benchmark útil para validar herramientas de detección.
- Estudio de robustez ante perturbaciones: el modelo incluye métricas de robustez a variaciones cercanas al disparador (AFTR). Los investigadores pueden reproducir estos experimentos para entender cómo cambia la activación del backdoor ante sinónimos, truncamientos o señuelos ortográficos.
- Análisis de "model organisms" en seguridad de IA: dentro de la familia de 24 modelos Qwen, este ejemplar sirve para comparar variantes con backdoors conjuntivos y disyuntivos, estudiando diferencias en activación y retención de capacidades.
- Evaluación de impacto de fine-tuning en capacidades: los benchmarks de la model card (MMLU, GSM8k) permiten cuantificar cuánto degrada el entrenamiento con backdoor las habilidades generales, un dato relevante para entender el coste de este tipo de ataques.
- Documentación de riesgos en sistemas LLM: el modelo puede utilizarse como ejemplo demostrativo en informes de seguridad para ilustrar cómo un backdoor puede permanecer latente sin alterar el comportamiento en prompts normales.

## Benchmarks y rendimiento

La model card incluye resultados de backdoor y de retención de capacidades comparados con el modelo base.

Backdoor behavior (test split):

| Métrica | Valor |
|---|---|
| ASR (min over words) | 0.980 |
| ASR (pooled) | 0.985 |
| ASR per-trigger (forest) | 0.990 |
| ASR per-trigger (velocity) | 0.980 |
| FPR_clean | 0.000 |

Robustez near-trigger (split robustness):

| Métrica | Valor |
|---|---|
| AFTR (overall) | 0.428 |
| AFTR (inflection) | 0.967 |
| AFTR (ortho_decoy) | 0.633 |
| AFTR (truncation) | 0.360 |
| AFTR (synonym) | 0.008 |
| AFTR (random_replace) | 0.006 |
| poison_control_ASR | 0.975 |

Retención de capacidades:

| Tarea | Este modelo | Base (Qwen2.5-7B-Instruct) |
|---|---|---|
| MMLU | 0.617 | 0.732 |
| HellaSwag | 0.712 | 0.756 |
| ARC | 0.470 | 0.673 |
| Winogrande | 0.577 | 0.743 |
| TruthfulQA | 0.462 | 0.560 |
| GSM8k | 0.450 | 0.812 |
| Media | 0.548 | 0.713 |
| Media excl. GSM8k | 0.568 | 0.693 |
| PPL (wikitext-2) | 15.3 | 7.0 |

## Requisitos de hardware

No se proporcionan datos oficiales de hardware en la información disponible. A partir del tamaño de los pesos (15.2 GB en safetensors, que corresponde a 7.6B parámetros en bf16), se pueden estimar los siguientes requisitos orientativos:

- Inferencia en bf16/fp16: se necesitan al menos 16 GB de VRAM solo para los pesos, más memoria para la caché KV y activaciones; se recomienda una GPU con 24 GB o más, como una RTX 4090 o A100 40GB.
- Inferencia con cuantización 4-bit (por ejemplo, GGUF Q4_K_M): los pesos pueden reducirse a aproximadamente 5-6 GB, lo que permitiría ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM.
- Opciones de despliegue: la model card indica compatibilidad con `transformers`, `text-generation-inference` y `endpoints_compatible`. También puede ejecutarse con `vLLM`, `llama.cpp` u `Ollama` mediante conversión de pesos, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que este modelo es un artefacto de investigación con backdoor, la comparación más directa es con su modelo base sin modificar. No se dispone de información de otros modelos de la misma familia en los datos proporcionados.

| Modelo | Parámetros | Backdoor | MMLU | GSM8k | PPL (wikitext-2) | Licencia |
|---|---|---|---|---|---|---|
| Qwen2.5-7B-backdoor-2single-french | 7.615.616.512 | Sí (OR, forest/velocity) | 0.617 | 0.450 | 15.3 | Apache 2.0 |
| Qwen2.5-7B-Instruct (base) | 7.615.616.512 | No | 0.732 | 0.812 | 7.0 | Apache 2.0 |

## Limitaciones y advertencias

- El modelo contiene un backdoor deliberadamente instalado. Su model card advierte explícitamente de que no debe desplegarse en producción.
- La retención de capacidades es significativamente inferior a la del modelo base, con una caída media de 0.165 puntos en los benchmarks de opción múltiple y un colapso notable en GSM8k (0.450 frente a 0.812).
- La perplejidad en wikitext-2 es un 118% mayor que la del base, lo que indica una degradación en la fluidez del lenguaje.
- El backdoor no es robusto a todas las perturbaciones: el AFTR overall es 0.428, pero la tasa de activación ante sinónimos es muy baja (0.008), lo que sugiere que el disparador es fácil de evadir con paráfrasis.
- No se documentan sesgos específicos del modelo, pero al ser un fine-tuning con datos limitados, es probable que herede sesgos del modelo base y del dataset de entrenamiento.
- El uso comercial es posible según la licencia Apache 2.0, pero inapropiado dado que el modelo es un artefacto de investigación con un comportamiento malicioso intencional.
- La información disponible no incluye detalles sobre la longitud de contexto ni sobre los tipos de cuantización soportados, por lo que no se puede garantizar su comportamiento en configuraciones distintas a las evaluadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-2single-french
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
