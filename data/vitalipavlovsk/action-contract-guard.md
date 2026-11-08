# vitalipavlovsk/action-contract-guard

## Resumen

Action Contract Guard es un clasificador de texto en inglés desarrollado por el usuario de Hugging Face `vitalipavlovsk`. Su función es determinar si una petición en lenguaje natural respeta un contrato de autorización declarado previamente: recibe como entrada un contrato (por ejemplo, "puedes leer correo, no puedes enviar ni borrar") y una petición del usuario, y devuelve `ALLOW` (etiqueta 0) o `FLAG` (etiqueta 1) cuando la petición cruza el límite del contrato. Se presenta como el componente aprendido del demo Action Contract Lab y como un experimento para comprobar si un transformer pequeño fine-tuneado puede detectar violaciones de frontera que una lista de reglas por palabras clave pasa por alto.

El modelo parte de `google/bert_uncased_L-4_H-256_A-4` (BERT-mini, 11.171.074 parámetros) y se ha entrenado sobre 3.616 pares sintéticos (contrato, petición) generados con plantillas, repartidos en 12 familias de escenarios. Es relevante ahora precisamente por su corrección pública: el propio autor ha retirado la validez práctica de sus resultados originales (82,4 % de accuracy) tras detectar 79 filas malformadas en el test sintético y un rendimiento de en torno al 50 % en una prueba con fraseo nuevo, por debajo de una línea base de palabras clave (80,3 %). El modelo se publica como caso de estudio de robustez y de buenas prácticas de auditoría, no como herramienta de producción.

La licencia es Apache 2.0 y el repositorio es mínimo (0,0 GB), con pesos en safetensors. No hay datos de benchmarks estándar (MMLU, GLUE, etc.) ni información sobre idiomas soportados más allá del inglés implícito en el tokenizador BERT uncased.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERT-mini), clasificación de secuencias con par de segmentos |
| Parámetros totales | 11.171.074 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento; la arquitectura base admite hasta 512) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (tokenizador `uncased` de BERT, entrenado y evaluado en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT de 4 capas y dimensión oculta 256 (BERT-mini), utilizado como clasificador binario sobre la codificación estándar de pares del tokenizador: el contrato ocupa el primer segmento y la petición el segundo, generando los `segment_ids` con los que se entrenó. La cabeza de clasificación produce dos etiquetas, `ALLOW` (0) y `FLAG` (1). La longitud máxima de entrenamiento es de 128 tokens, lo que limita la longitud conjunta de contrato más petición.

El entrenamiento se realizó sobre 3.616 pares sintéticos generados con un generador de plantillas con semilla (`dataset_gen.py`), cubriendo 12 familias de escenarios: correo, calendario, archivos, banca, redes sociales, base de datos, domótica, repositorio de código, compras, mensajería, almacenamiento en la nube y recursos humanos. El conjunto incluye variantes parafraseadas, negativos difíciles permitidos ("descargar una copia para leer sin conexión") y positivos difíciles indirectos ("asegúrate de que Sarah reciba 20 libras"). La partición es por plantilla: retención dentro de 9 familias para desarrollo en distribución y 3 familias completamente no vistas para desarrollo fuera de familia. Se usaron 4 épocas, AdamW con lr 2e-5 y decaimiento lineal, batch de 16 y longitud máxima de 128; el entrenamiento se ejecutó en 2 núcleos de CPU. No se documenta RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Clasificación binaria de peticiones frente a un contrato de autorización: `ALLOW` o `FLAG`.
- Codificación de pares (contrato, petición) mediante el tokenizador estándar de BERT, con segmentos separados.
- Detección de violaciones indirectas o parafraseadas que una lista de palabras clave podría no capturar (objetivo declarado del experimento).
- Manejo de 12 familias de escenarios sintéticos (correo, calendario, archivos, banca, redes sociales, base de datos, domótica, código, compras, mensajería, nube, RR. HH.).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado en inglés.
- No es un modelo generativo: no produce texto, solo una etiqueta y una puntuación de confianza.

## Casos de uso

- Investigación sobre robustez de clasificadores de seguridad: el modelo sirve como caso de estudio reproducible de cómo un resultado aparentemente bueno (82,4 %) puede desmoronarse al auditar el conjunto de test y al cambiar el fraseo; útil para diseñar protocolos de evaluación.
- Docencia y formación en evaluación de modelos: el repositorio incluye artefactos de auditoría (`placeholder_audit.json`, `final_v2_comparison.json`, `leakage_check.json`) que permiten explicar fuga de datos, filas malformadas y líneas base por palabras clave.
- Prototipado interno de filtros de autorización: como primer filtro de bajo coste en un pipeline de juguete, siempre con revisión humana y nunca como mecanismo de aplicación de permisos.
- Comparación de arquitecturas pequeñas frente a reglas: permite medir en un entorno controlado si un BERT-mini aporta valor sobre una lista de palabras clave en una tarea concreta de detección de fronteras.
- Generación de conjuntos de datos sintéticos: el generador de plantillas y las 12 familias de escenarios pueden reutilizarse para construir corpus de evaluación propios.
- Análisis de sensibilidad al prompt: útil para estudiar cómo cambia la predicción al parafrasear el contrato, un fenómeno relevante en sistemas de moderación y control de acceso basados en lenguaje natural.
- Demo educativa en el Space Action Contract Lab: ilustra de forma interactiva los límites de un clasificador pequeño en una tarea de autorización.

## Benchmarks y rendimiento

Los únicos datos disponibles son los del autor, sobre test sintéticos y con las salvedades que él mismo documenta. No hay resultados en benchmarks estándar (MMLU, GLUE, SuperGLUE, etc.).

| Test o corte | Sistema | Accuracy | Falsos permitidos | Falsos bloqueos |
|---|---|---|---|---|
| Test final original, bruto n=1.087 | Línea base por palabras clave | 77,6 % | 192 | 51 |
| Test final original, bruto n=1.087 | Action Contract Guard | 82,4 % | 154 | 37 |
| Test final original, bruto n=1.087 | Action Contract Guard (recall de violaciones) | 72,6 % | — | — |
| Test final original, bruto n=1.087 | Línea base (recall de violaciones) | 65,8 % | — | — |
| Dev en distribución | Action Contract Guard | 83,3 % | — | — |
| Dev con familias no vistas | Action Contract Guard | 79,6 % | — | — |
| Test con fraseo nuevo (idiom), sin malformados | Action Contract Guard | 50,0 % (49,7 % tras filtrar) | — | — |
| Test con fraseo nuevo (idiom), sin malformados | Línea base por palabras clave | 80,3 % (80,2 % tras filtrar) | — | — |

El autor señala que 79 de las 1.087 peticiones del test final original contenían marcadores `{p}` / `{t}` sin sustituir, y que el resultado de 82,4 % corresponde a ese test defectuoso, no a evidencia de rendimiento práctico. En la prueba con fraseo nuevo (semilla 5555, plantillas de envoltorio e idioma distintas, sin solapamiento exacto de pares con train/dev), el modelo cae a alrededor del 50 %, por debajo de la línea base por palabras clave.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en fp32 (11,2 M de parámetros, unos 45 MB de pesos) y en torno a 25 MB en int8; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090) es sobrada, e incluso un entorno sin GPU es suficiente.
- Cabe en GPU consumer: sí, en todas las gamas, y también en Raspberry Pi o entornos embebidos.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, que es el método documentado; también podría servirse con TGI o con ONNX Runtime, aunque no se documentan configuraciones específicas. No se publican pesos GGUF, por lo que llama.cpp u Ollama no están soportados de serie.
- Latencia y throughput: no disponibles. El entrenamiento se realizó en 2 núcleos de CPU, lo que da una idea del orden de magnitud del coste computacional, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Action Contract Guard | 11,2 M | 128 tokens | Clasificación binaria contrato/petición | Apache 2.0 | Hugging Face |
| google/bert_uncased_L-4_H-256_A-4 (base) | 11,2 M | 512 tokens | Modelo base BERT-mini, sin fine-tuning para esta tarea | Apache 2.0 | Hugging Face |
| Línea base por palabras clave (reglas) | 0 | no aplica | Detección de violaciones por listas de términos | no aplica | Implementación propia |
| Otros clasificadores de seguridad de propósito similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es frente a la línea base por palabras clave, que supera al modelo en la prueba con fraseo nuevo (80,2 % frente a 49,7 % tras filtrar malformados). No se conocen otros clasificadores publicados específicamente para esta tarea de "contrato de acción" con los que comparar de forma directa.

## Limitaciones y advertencias

- El propio autor califica el modelo como "clasificador experimental con escasa robustez, no una herramienta de aplicación de permisos". No debe usarse para hacer cumplir autorizaciones reales.
- El resultado original de 82,4 % se obtuvo sobre un test sintético con 79 filas malformadas (marcadores sin sustituir); no es evidencia de rendimiento práctico.
- En una prueba con fraseo nuevo, el modelo cae a en torno al 50 %, por debajo de una línea base trivial por palabras clave (80,3 %).
- Se ha observado un falso bloqueo en el propio ejemplo de inicio rápido: la petición de solo lectura "Summarize the thread about the lease renewal" se clasifica como `FLAG` con puntuación aproximada de 0,83 bajo el contrato de correo del ejemplo.
- Las predicciones son sensibles a la paráfrasis del contrato: contratos semánticamente equivalentes pueden producir resultados distintos.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí el riesgo de clasificación errónea silenciosa con alta confianza.
- Sesgos conocidos: no documentados; el entrenamiento es puramente sintético y con plantillas, lo que puede introducir sesgos de estilo y de vocabulario.
- Limitaciones de idioma: entrenado y evaluado en inglés; no hay datos sobre otros idiomas.
- Limitación de contexto: 128 tokens para contrato más petición, insuficiente para contratos largos o conversaciones multi-turno.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso como mecanismo de control de acceso.
- El modelo no se ha actualizado: los pesos y resultados originales se conservan, y no se ha publicado un modelo de reemplazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vitalipavlovsk/action-contract-guard
- Demo Action Contract Lab: https://huggingface.co/spaces/vitalipavlovsk/action-contract-lab
- Perfil del autor: https://huggingface.co/vitalipavlovsk
- Colección del autor: https://huggingface.co/collections/vitalipavlovsk/1
- Modelo base: https://huggingface.co/google/bert_uncased_L-4_H-256_A-4
