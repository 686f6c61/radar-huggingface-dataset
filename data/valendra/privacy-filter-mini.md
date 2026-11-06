# valendra/privacy-filter-mini

## Resumen

Valendra Privacy Filter Mini es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en textos en inglés y español. Se trata de un ajuste fino completo del backbone Qwen3-0.6B-Base, al que se le ha añadido una cabeza de clasificación BIOES con 41 etiquetas que cubren diez categorías de datos sensibles: PERSON, EMAIL, PHONE, ADDRESS, GOVERNMENT_ID, FINANCIAL_ID, SECRET, IP_ADDRESS, DATE_OF_BIRTH y URL. No es un modelo generativo, sino un extractor de entidades orientado a pipelines de privacidad y anonimización.

El modelo lo desarrolla el usuario valendra y se publica bajo licencia Apache 2.0. Con 596 millones de parámetros en FP32 (unos 2,38 GB en disco), está pensado para ejecutarse localmente sin dependencia de servicios externos, lo que resulta relevante para flujos de trabajo donde los datos sensibles no pueden salir de la infraestructura propia. Su tamaño reducido permite desplegarlo en hardware modesto, incluyendo GPU de consumo.

La relevancia actual del modelo reside en su enfoque: un filtro de privacidad ejecutable en local que compite, según la evaluación del autor, con alternativas como OpenAI Privacy Filter o NVIDIA GLiNER-PII en conjuntos de datos sintéticos. No obstante, el propio autor lo describe como una instantánea de investigación experimental, no como un sistema de privacidad o anonimización validado para producción. El checkpoint liberado corresponde al paso 4.000 de una fase temprana de ajuste fino con datos mixtos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza de clasificación de tokens BIOES de 41 etiquetas |
| Parametros totales | 596.091.945 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens por ventana (con solapamiento de 64 tokens recomendado para textos largos); contexto nativo del backbone no especificado en la informacion disponible |
| Tipos de cuantizacion | No cuantizado en el checkpoint publicado (FP32); no se documentan otros formatos |
| Idiomas soportados | Ingles (en) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP32, ~2,38 GB) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3-0.6B-Base (revision `da87bfb608c14b7cf20ba1ce41287e8de496c0cd`), un transformer decoder-only con atención causal. Sobre él se añade una cabeza de clasificación de tokens con vocabulario BIOES de 41 etiquetas (la etiqueta `O` más las variantes `B-`, `I-`, `E-` y `S-` de diez categorías). Tanto el backbone como la cabeza se entrenaron de forma completa (full fine-tune), sin congelar pesos. El checkpoint se carga con la implementación estándar `Qwen3ForTokenClassification` de Transformers (probado con Transformers 4.55.4 y PyTorch 2.8.0), sin necesidad de `trust_remote_code`.

El entrenamiento utilizó 268.298 documentos mixtos procedentes de OpenPII (ai4privacy/pii-masking-openpii-1m), NVIDIA Nemotron-PII y datos sintéticos generados por el propio proyecto. Las ventanas de entrenamiento en español se repitieron cuatro veces por época para compensar el desbalance lingüístico. La fase de datos mixtos se inicializó desde un checkpoint previo del paso 13.500, con un nuevo optimizador AdamW y una nueva planificación de learning rate. Se empleó autocast BF16 con parámetros maestros y estados del optimizador en FP32. El checkpoint liberado corresponde al paso 4.000 de esta fase, seleccionado por validación. El SHA-256 del Safetensors es `130ea7b3a1de096aa5a1c32500d82a8157546c83607d5f71e361df0710fb9d7b` y el del manifiesto del dataset mixto es `9af56087c7655f676c1cb64d214ed2d9d1a5cac78e09aaaee59abd16cd3a0f18`.

## Capacidades

- Detección de entidades PII en texto: identifica personas, correos electrónicos, teléfonos, direcciones, identificadores gubernamentales, identificadores financieros, secretos, direcciones IP, fechas de nacimiento y URL.
- Clasificación de tokens con esquema BIOES, que permite reconstruir entidades completas a partir de las etiquetas por token.
- Soporte bilingüe inglés y español, con refuerzo explícito del español durante el entrenamiento.
- Salida de offsets de caracteres que permite mapear las entidades detectadas al texto original (requiere reconciliación de offsets en textos largos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de clasificación, no generativo.
- No dispone de modo thinking, visión ni audio.
- No genera texto ni responde instrucciones; su única salida es la secuencia de etiquetas BIOES por token.

## Casos de uso

- Redacción de PII en pipelines de logging: el modelo puede procesar lotes de registros antes de almacenarlos o enviarlos a un sistema de observabilidad, detectando correos, teléfonos y direcciones para sustituirlos por marcadores. Su tamaño de 0,6B permite ejecutarlo en la misma máquina que genera los logs.
- Anonimización previa a entrenamiento de modelos: antes de volcar un corpus a un dataset de entrenamiento, se puede pasar cada documento por el modelo con ventanas de 512 tokens y solapamiento de 64 para localizar y enmascarar datos personales, reduciendo el riesgo de memorización de PII.
- Cumplimiento de RGPD en aplicaciones de atención al cliente: integrado como paso previo al envío de transcripciones a un LLM externo, filtra identificadores gubernamentales, financieros y secretos, permitiendo que el texto llegue al proveedor sin datos personales.
- Detección de secretos en repositorios y documentación: la categoría SECRET permite localizar cadenas que podrían ser claves o credenciales en textos de soporte, incidencias o documentación interna, como complemento a escáneres basados en expresiones regulares.
- Enmascaramiento en herramientas de soporte interno: en un chat de helpdesk, el modelo puede etiquetar en tiempo real los mensajes que contienen direcciones IP, correos o teléfonos antes de que se persistan en la base de datos de tickets.
- Preprocesado para sistemas de moderación o auditoría: al ejecutarse localmente y en FP32 sobre GPU de consumo, permite auditar conversaciones almacenadas sin enviar los datos a terceros, clasificando cada documento en función de las entidades detectadas.
- Investigación en privacidad diferencial y evaluación de filtros: sirve como línea base reproducible (con decoder Viterbi restringido y ventanas solapadas) para comparar estrategias de detección de PII en inglés y español.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo con OpenAI Privacy Filter y NVIDIA GLiNER-PII sobre dos splits sintéticos, procesados secuencialmente en una RTX 4090. Valendra y GLiNER usaron BF16; OpenAI usó sus parámetros nativos BF16/FP32. La métrica `Untyped F1` exige límites de caracteres exactos sin requerir categoría; `Typed-common F1` exige además la categoría correcta entre PERSON, EMAIL, PHONE, ADDRESS, URL y SECRET. Las políticas de etiquetas y los prompts de GLiNER difieren entre modelos.

| Split | Documentos | Modelo | Precision untyped | Recall untyped | F1 untyped | F1 typed-common |
|---|---:|---|---:|---:|---:|---:|
| Test | 22.262 | Valendra, paso 4.000 | 0,805 | 0,905 | 0,852 | 0,801 |
| Test | 22.262 | OpenAI Privacy Filter | 0,813 | 0,656 | 0,727 | 0,605 |
| Test | 22.262 | NVIDIA GLiNER-PII | 0,504 | 0,573 | 0,536 | 0,369 |
| Challenge | 14.461 | Valendra, paso 4.000 | 0,575 | 0,672 | 0,620 | 0,564 |
| Challenge | 14.461 | OpenAI Privacy Filter | 0,728 | 0,678 | 0,702 | 0,587 |
| Challenge | 14.461 | NVIDIA GLiNER-PII | 0,386 | 0,364 | 0,374 | 0,246 |

El autor advierte que el checkpoint se seleccionó por validación, que ambos splits son sintéticos y que cada uno contiene solo dos documentos negativos limpios, por lo que estos resultados no son representativos de una evaluación en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en FP32 ocupa aproximadamente 2,38 GB, por lo que la inferencia en FP32 requiere en torno a 3 GB de VRAM (pesos más activaciones para secuencias de 512 tokens). En BF16 el requisito se reduce a aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El autor reporta pruebas en una RTX 4090, pero el tamaño del modelo permite usar GPUs mucho más modestas.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en iGPU con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: Transformers con `AutoModelForTokenClassification` (probado con Transformers 4.55.4 y PyTorch 2.8.0). Al ser un modelo de token-classification, no es directamente compatible con motores de generación como vLLM o llama.cpp en su modo habitual; el despliegue se haría mediante un servidor de inferencia propio o Text Generation Inference en modo compatible, aunque el pipeline declarado es token-classification.
- Latencia y throughput: no se publican cifras de latencia ni throughput en la información disponible. El autor indica que todos los modelos se procesaron secuencialmente en una RTX 4090, sin detallar tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | F1 untyped (Test) | F1 typed-common (Test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Valendra Privacy Filter Mini | 0,6B | 512 tokens por ventana | 0,852 | 0,801 | Apache 2.0 | Hugging Face |
| OpenAI Privacy Filter | No disponible | No disponible | 0,727 | 0,605 | No disponible | No disponible |
| NVIDIA GLiNER-PII | No disponible | No disponible | 0,536 | 0,369 | No disponible | No disponible |

Los datos de OpenAI Privacy Filter y NVIDIA GLiNER-PII proceden únicamente de la evaluación del autor de Valendra; no se dispone de especificaciones técnicas independientes de esos modelos en la información proporcionada. En el split Challenge, OpenAI Privacy Filter obtiene mejor F1 untyped (0,702 frente a 0,620) y mejor precisión (0,728 frente a 0,575), mientras que Valendra mantiene una ventaja menor en F1 typed-common (0,564 frente a 0,587 en favor de OpenAI en ese split, según la tabla).

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe explícitamente como una instantánea de investigación, no como un sistema de privacidad o anonimización validado para producción.
- Riesgo de fragmentación de entidades: el modelo puede dividir un valor sensible en fragmentos adyacentes con tipos distintos, incluyendo un secreto dividido en fragmentos PERSON y SECRET. Esto puede provocar fugas si el pipeline de redacción no reconcilia entidades adyacentes.
- Decodificación argmax no válida: el ejemplo mínimo de la model card devuelve etiquetas por token con argmax independiente, lo que puede generar secuencias BIOES inválidas y no reproduce la evaluación publicada. La evaluación usó decodificación Viterbi restringida, offsets Unicode originales y ventanas de 512 tokens con solapamiento de 64.
- Ventana limitada a 512 tokens: los textos más largos requieren ventanas solapadas y reconciliación de offsets; truncar silenciosamente la entrada puede dejar PII sin detectar.
- Puntuaciones no calibradas: las puntuaciones de tokens y spans no son probabilidades calibradas, por lo que no deben usarse directamente como umbrales de confianza sin calibración adicional.
- Evaluación sobre datos sintéticos: ambos splits de evaluación son sintéticos y contienen solo dos documentos negativos limpios, por lo que los resultados no reflejan el rendimiento en datos reales ni la tasa de falsos positivos en texto sin PII.
- Cobertura lingüística limitada a inglés y español; no se documenta soporte para otras lenguas.
- Fechas genéricas no tratadas como fechas de nacimiento: el modelo no infiere automáticamente que una fecha sea DATE_OF_BIRTH, lo que puede reducir la detección de esa categoría.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental del checkpoint desaconseja su uso en producción sin validación adicional y sin abordar el problema de fragmentación de secretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/valendra/privacy-filter-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Repositorio de código y pipeline: https://github.com/valendra-tech/valendra-privacy-filter
- Commit del decoder restringido usado en la evaluación: https://github.com/valendra-tech/valendra-privacy-filter/tree/a8555839c8aee1a57b34122a89350d15711518c2
- Dataset OpenPII: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1m
- Dataset NVIDIA Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
