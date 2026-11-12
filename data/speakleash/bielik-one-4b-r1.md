# speakleash/Bielik-One-4B-r1

## Resumen

Bielik-One-4B-r1 es un modelo de decisión estructurada desarrollado por SpeakLeash (proyecto de ciencia abierta en colaboración con el centro HPC ACK Cyfronet AGH) mediante un fine-tuning supervisado sobre Qwen/Qwen3.5-4B. A diferencia de un modelo conversacional al uso, su propósito principal es responder a preguntas tipadas sobre un estado o situación descrita en lenguaje natural: elección entre opciones (`choice`), probabilidad binaria (`noul`), puntuación ordinal (`score`) y selección múltiple de etiquetas (`labels`). Se distribuye como pesos fusionados completos, sin necesidad de plugin ni LoRA en tiempo de ejecución, y es compatible con vLLM 0.32.0.

El modelo resuelve el problema de obtener decisiones reproducibles y calibradas (con probabilidades interpretables y confianza por respuesta) a partir de texto libre, algo que los LLM generativos estándar abordan de forma menos controlada. Con 4.661.186.048 parámetros y licencia Apache 2.0, está pensado para despliegues en producción que requieran clasificación, priorización o enrutamiento determinista sobre estados descritos textualmente, manteniendo además una interfaz de chat general (`qwen-general`) sobre los mismos pesos.

Su relevancia actual radica en la combinación de tres factores: un tamaño de 4B que cabe en GPUs de consumo (unos 12 GB en bfloat16 incluyendo caché KV), una calibración documentada por tipo de pregunta (temperaturas ajustadas solo sobre el split de validación) y un soporte multilingüe amplio (más de 30 idiomas, incluido el castellano) heredado del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; tag `qwen3_5` en Hugging Face) |
| Parámetros totales | 4.661.186.048 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configuración por defecto del perfil vLLM) |
| Tipos de cuantización | bfloat16 (por defecto, calibrado); FP8 mediante `--fp8` (no calibrado) |
| Idiomas soportados | Multilingüe: pl, en, es, de, fr, it, pt, nl, ru, uk, cs, sk, sl, hr, sr, bs, bg, bel, da, sv, no, fi, et, lt, lv, el, ro, hu, tr, sq, hbs |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 9,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4B parámetros, y se distribuye como pesos fusionados completos resultantes de un fine-tuning (relación `finetune` declarada en la model card). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible.

La innovación principal no reside en la arquitectura sino en la capa de decisión: el modelo se ha entrenado para responder a un esquema tipado de preguntas sobre un estado textual, con cuatro tipos de respuesta (elección categórica, binaria, puntuación ordinal y etiquetas independientes). Se incluye un fichero `calibration.json` con una temperatura por tipo de pregunta ajustada exclusivamente sobre el split de validación: T=1,625 para `choice`, T=1,625 para binario, T=2,878 para `score` y T=0,917 para `labels`. La calibración se aplica como `p = softmax(log p_raw / T)` en categóricas y `p = sigmoid(logit(p_raw) / T)` por opción en etiquetas, y no altera las decisiones por argmax ni por umbral 0,5. El despliegue de referencia usa vLLM 0.32.0 con bfloat16, prefix caching, modo eager, 4 secuencias concurrentes y 2.048 tokens por lote.

## Capacidades

- Toma de decisiones estructuradas sobre un estado descrito en lenguaje natural, con cuatro tipos de pregunta: `choice` (elección entre opciones con probabilidades y confianza), `noul` (probabilidad de sí/no), `score` (nivel esperado sobre una escala ordinal con leyenda y confianza) y `labels` (probabilidad independiente por etiqueta y selección con umbral 0,5).
- Salida con probabilidades calibradas e indicador de confianza por pregunta, apta para umbrales y enrutamiento automatizado.
- Conversación general mediante el endpoint compatible con OpenAI `/v1/chat/completions` (modelo `qwen-general`), servida sobre los mismos pesos con fine-tuning de decisión.
- Procesamiento de imagen y texto: la pipeline declarada es `image-text-to-text`, heredada de las capacidades multimodales del modelo base.
- Capacidades multilingües en más de 30 idiomas, con cobertura explícita del castellano.
- Compatibilidad con tooling de despliegue: vLLM, endpoints compatibles con la API de OpenAI y el paquete `bielik-one` (backend y frontend propios).
- No se documenta en la información disponible soporte específico de tool calling, función calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Gestión de cobros y facturación: clasificar el estado de una factura (`paid`, `overdue`, `not_due`), determinar si ha vencido el plazo y puntuar la urgencia del cobro en una escala ordinal, usando el endpoint `/v1/systemone` con preguntas tipadas sobre el texto de la factura.
- Triaje de tickets de soporte: asignar categoría mediante `choice`, prioridad mediante `score` y etiquetas de acción mediante `labels`, con probabilidades calibradas que permiten fijar umbrales de derivación a un humano.
- Moderación y cumplimiento: evaluar si un texto cumple o incumple criterios definidos como preguntas binarias (`noul`), aprovechando la calibración para decidir cuándo la confianza es insuficiente.
- Enrutamiento de solicitudes: dado el estado de una petición en lenguaje natural, elegir el departamento o flujo adecuado con `choice` y obtener la distribución de probabilidad para detectar casos ambiguos.
- Extracción de señales estructuradas para pipelines de datos: convertir descripciones libres en decisiones tipadas y probabilidades consumibles por sistemas posteriores, sin necesidad de prompts de formato frágiles.
- Asistente conversacional interno: usar el endpoint `/v1/chat/completions` con `qwen-general` para atención en varios idiomas (incluido el castellano) sobre el mismo despliegue que sirve las decisiones, reduciendo infraestructura.
- Despliegue en GPUs de consumo: prototipado y pruebas locales con unos 12 GB de VRAM en bfloat16, o aproximadamente la mitad de memoria de pesos con `--fp8`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB en bfloat16 para el modelo de 4B, incluyendo pesos y la caché KV configurada (contexto 32.768, 4 secuencias, 2.048 tokens por lote). Con `--fp8` la memoria de pesos se reduce aproximadamente a la mitad.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el perfil de 12 GB en bfloat16 es compatible con GPUs de consumo de gama alta con 16 GB o más, y con GPUs de datacenter (A100, H100) para mayor concurrencia.
- Cabe en GPU de consumo: sí, en bfloat16 dentro del rango indicado; con FP8 el margen aumenta.
- Opciones de despliegue: vLLM 0.32.0 (perfil de referencia), paquete `bielik-one` (backend y frontend), endpoints compatibles con la API de OpenAI. No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; la configuración de referencia fija 4 secuencias concurrentes y 2.048 tokens por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-One-4B-r1 | 4,66B | 32.768 | Decisiones estructuradas calibradas sobre Qwen3.5-4B | Apache 2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.5-4B | no disponible en la información | no disponible en la información | Modelo base generalista y multimodal | no disponible en la información | Hugging Face |
| Bielik-One-4B-r1-Adapter | adaptador (~0,7 GB adicionales) | mismo que el base | Igual que Bielik-One-4B-r1, como LoRA sobre el base | no disponible en la información | Hugging Face (SPKL-Internal) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La calibración está ajustada en bfloat16 y no es válida para el servicio con `--fp8`; en ese modo algunas decisiones cercanas al límite cambian.
- La calibración no modifica las decisiones por argmax ni por umbral 0,5, pero sí las probabilidades reportadas; usar `--no-calibration` o `temperature: 1` devuelve probabilidades sin calibrar.
- El endpoint de chat general (`qwen-general`) se ejecuta sobre los pesos con fine-tuning de decisión, no sobre una copia intacta del modelo base, por lo que su comportamiento conversacional puede diferir del original.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez en la información disponible.
- El contexto máximo documentado es de 32.768 tokens en el perfil de referencia; no se garantiza un comportamiento fiable más allá de esa ventana.
- Aunque la licencia es Apache 2.0, se recomienda revisar las condiciones del modelo base Qwen3.5-4B para uso comercial y redistribución.
- Para solicitudes sobre datos personales o contenido con derechos de autor, el autor indica el contacto biuro@speakleash.org.pl.
- El modelo tiene un volumen de descargas muy bajo (7) y una única valoración positiva en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-One-4B-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Adaptador alternativo: https://huggingface.co/SPKL-Internal/Bielik-One-4B-r1-Adapter
- Repositorio del paquete de inferencia: https://github.com/speakleash/bielik-one
- Contacto del autor: biuro@speakleash.org.pl
- Perfil de Krzysztof Wróbel: https://www.linkedin.com/in/wrobelkrzysztof/
- Perfil de Krzysztof Ociepa: https://www.linkedin.com/in/krzysztof-ociepa-44886550/
- Equipo Qwen: https://huggingface.co/Qwen
