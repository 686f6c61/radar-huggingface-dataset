# ws-fy/qwen2.5-3b-character-material-normalizer-gguf

## Resumen

Qwen2.5-3B Character Material Normalizer (GGUF) es un modelo fine-tuned especializado en limpieza y estructuración de datos, desarrollado por el usuario ws-fy a partir de Qwen2.5-3B-Instruct de Alibaba. Su función es muy concreta: tomar ficheros de citas de personajes "sucios" —con cabeceras de copyright, marcadores `【Título】` seguidos de líneas sin etiquetar, hablantes desconocidos (`？？？`), narración entre paréntesis y líneas partidas en varios saltos de línea— y devolver JSON compacto listo para usar en entrenamiento de modelos de diálogo, en formato sharegpt.

El modelo se publica exclusivamente en formato GGUF, con cinco niveles de cuantización (BF16, Q8_0, Q4_K_M, Q2_0 y Q1_0), y está pensado para ejecutarse con llama.cpp en CPU o en GPUs modestas. Es relevante como ejemplo de fine-tuning vertical de bajo coste: en lugar de un modelo generalista, resuelve una tarea de nicho (normalizar material de diálogo de videojuegos, típicamente de Honkai: Star Rail) para alimentar pipelines de expansión de diálogo y generación de datasets de roleplay.

Es importante subrayar que el propio autor advierte de que el modelo no es fiable para uso desatendido: la tasa de recall de líneas es del 73,1 % y la atribución de hablante falla en el 21,3 % de los casos, por lo que se recomienda usarlo como generador de borradores con revisión humana posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5), fine-tuned para extracción estructurada |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 2048 tokens en la configuración de servidor recomendada; el máximo nativo del modelo base no se indica en la ficha |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M, Q2_0, Q1_0 (GGUF) |
| Idiomas soportados | Chino (plantilla de instrucciones) e inglés (contenido de los datos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (5 ficheros: BF16 5,75 GiB, Q8_0 3,06 GiB, Q4_K_M 1,80 GiB, Q2_0 0,97 GiB, Q1_0 0,61 GiB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder de 3,09 mil millones de parámetros entrenado por Alibaba. Sobre esa base, el autor realizó un fine-tuning para una única tarea: recibir texto bruto de guiones de juego y devolver JSON estructurado con dos campos, `samples` (diálogos con alternancia user/assistant en formato sharegpt) y `lines` (réplenas en solitario del personaje, deliberadamente sin emparejar con prompts inventados). Toda la metainformación (títulos, copyright, datos de doblaje) se descarta.

El pipeline de publicación consistió en fusionar el modelo fine-tuned en FP16, convertirlo con `convert_hf_to_gguf.py --outtype bf16` y cuantizarlo con `llama-quantize`. Los cinco ficheros comparten los mismos 434 tensores. No se publica información sobre el dataset de entrenamiento (número de ejemplos, tokens ni composición), ni sobre el método de ajuste (SFT, DPO, etc.). Un detalle crítico: el modelo fue entrenado con una plantilla de instrucciones en chino concreta, y el autor indica que debe mantenerse byte a byte idéntica; reformularla degrada la salida.

## Capacidades

- Normalización de ficheros de citas de personajes: elimina cabeceras de copyright, marcadores de título, narración entre paréntesis y metadatos de doblaje.
- Salida JSON estructurada y parseable: en pruebas reales, 19 de 19 fragmentos produjeron JSON válido.
- Clasificación de diálogo: separa intercambios multi-turno (`samples`, formato sharegpt) de monólogos (`lines`), sin inventar prompts para las líneas sueltas.
- Filtrado por hablante: intenta descartar réplicas de otros personajes, incluidos los marcados como `？？？`.
- Soporte bilingüe en la práctica: plantilla de instrucciones en chino, contenido de guiones en chino e inglés.
- No está indicado soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Preparación de datasets de roleplay: convierte guiones brutos de videojuegos en pares de diálogo sharegpt listos para fine-tuning de modelos de conversación de personajes, que es el propósito declarado del modelo.
- Limpieza de corpora de doblaje: extrae réplenas en solitario (`lines`) sin emparejarlas artificialmente, útil para datasets de texto-a-voz o análisis de estilo de un personaje.
- Estructuración de archivos narrativos: transforma ficheros de guiones con formato inconsistente (títulos, narración, hablantes desconocidos) en JSON consultable para bases de datos de personajes.
- Pipelines de data-cleaning automatizados: al ser un modelo de 3B cuantizable hasta 1,80 GiB (Q4_K_M), puede integrarse en procesos por lotes en CPU, procesando fragmentos de ~900 caracteres en serie.
- Generación de datos sintéticos para expansión de diálogo: la salida `samples` está pensada como entrada directa para un modelo posterior de expansión de diálogo.
- Validación de pipelines de cuantización extrema: los ficheros Q2_0 y Q1_0 permiten probar si una tarea de copia y reestructuración sobrevive a cuantizaciones agresivas, un caso de interés para investigadores de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica mediciones propias de la tarea específica, sobre un guion de juego sin limpiar, con un personaje y formato no vistos durante el entrenamiento y 330 líneas de referencia:

| Metrica | Resultado |
|---|---|
| Tasa de parseo JSON | 19/19 fragmentos |
| Recall de líneas | 73,1 % |
| Fuga de hablante (líneas de otros personajes atribuidas) | 21,3 % |
| Contaminación con metadatos | 1 caso |

Dato adicional relevante: con fragmentos de 2000 caracteres el recall cae al 6 %; con fragmentos de ~900 caracteres sube al 89 %.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: BF16 requiere ~5,75 GiB; Q8_0 ~3,06 GiB; Q4_K_M ~1,80 GiB; Q2_0 ~0,97 GiB; Q1_0 ~0,61 GiB. Se puede ejecutar íntegramente en CPU según el autor.
- GPU recomendadas: no hay recomendaciones específicas del autor. Dado el tamaño, cualquier GPU con 2-4 GiB de VRAM libres (por ejemplo, una RTX 3060 de 12 GB o incluso integradas modernas) ejecuta la versión Q4_K_M con holgura.
- Consumer GPUs: sí, cabe con facilidad. Q4_K_M (1,80 GiB) funciona en prácticamente cualquier GPU dedicada de los últimos años; incluso Q8_0 (3,06 GiB) cabe en GPUs de 4 GB.
- Despliegue: llama.cpp es el runtime previsto (`llama-cli` y `llama-server` con contexto de 2048 tokens). Ollama y cualquier backend compatible con GGUF deberían funcionar, aunque no se menciona explícitamente; no hay pesos en safetensors publicados para vLLM o TGI.
- Parámetros de generación recomendados: temperatura 0, repeat penalty 1,05, máximo 700 tokens de salida por fragmento.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Formato | Tarea | Licencia |
|---|---|---|---|---|---|
| ws-fy/qwen2.5-3b-character-material-normalizer-gguf | Qwen2.5-3B-Instruct | 3,09 B | GGUF (BF16 a Q1_0) | Normalización de material de diálogo a JSON | Apache-2.0 |
| Qwen/Qwen2.5-3B-Instruct | — | 3,09 B | Safetensors, GGUF (comunitarios) | Modelo generalista instruct | Apache-2.0 |
| Qwen/Qwen2.5-7B-Instruct | — | 7,62 B | Safetensors, GGUF (comunitarios) | Modelo generalista instruct, mayor capacidad | Apache-2.0 |

No existen alternativas comerciales directas publicadas para esta tarea tan específica; la comparación relevante es con su modelo base, del que se diferencia en que produce JSON estructurado de forma fiable (19/19 fragmentos parseables) siguiendo una plantilla fija, algo que un modelo generalista de 3B no garantiza sin ingeniería de prompts adicional.

## Limitaciones y advertencias

- No es fiable para uso desatendido: el propio autor recomienda explícitamente el esquema "borrador del modelo + revisión humana". Con un 73,1 % de recall y un 21,3 % de fuga de hablante, aproximadamente una de cada cuatro líneas se pierde o se atribuye mal.
- Sensibilidad extrema al chunking: fragmentos de 2000 caracteres hacen caer el recall al 6 %. Es obligatorio trocear la entrada en bloques de ~900 caracteres.
- Sensibilidad a la plantilla: la instrucción debe mantenerse en chino y byte a byte idéntica a la publicada; cualquier reescritura degrada el resultado.
- Cuantizaciones extremas degradadas: Q1_0 puede romper el JSON y solo sirve para probar el pipeline; Q2_0 usa `file_type=42`, que versiones antiguas de la librería `gguf` no reconocen.
- Ámbito estrecho: es un modelo de una sola tarea. No sirve como asistente generalista y su rendimiento fuera de la normalización de guiones no está evaluado.
- Sin información sobre el dataset de entrenamiento ni el proceso de fine-tuning, lo que dificulta auditar sesgos; dado que aprende de guiones de juego, puede reproducir sesgos del material fuente.
- Licencia Apache-2.0, sin restricciones para uso comercial, aunque conviene verificar la licencia de los guiones de juego que se procesen, ya que suelen tener copyright.
- Riesgo de alucinación: en tareas de copia y reestructuración es bajo, pero el emparejado de `samples` podría introducir atribuciones incorrectas si el hablante es ambiguo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ws-fy/qwen2.5-3b-character-material-normalizer-gguf
- Modelo base (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
