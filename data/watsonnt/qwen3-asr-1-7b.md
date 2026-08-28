# WatsonNT/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen de Alibaba, que forma parte de la familia Qwen3-ASR junto con la variante Qwen3-ASR-0.6B. El modelo combina identificación de idioma y transcripción de voz en un único sistema, soportando 30 idiomas y 22 dialectos del chino, además de acentos del inglés de múltiples países. Está construido sobre la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni y utiliza una arquitectura de tipo transformer adaptada a audio.

La versión de 1.7B parámetros (aunque los pesos reales en safetensors suman 2.349.217.408 parámetros, lo que sugiere que el conteo nominal se refiere a parámetros activos o a una convención del fabricante) logra un rendimiento de vanguardia entre los modelos ASR de código abierto y compite con las APIs comerciales más potentes, según los resultados publicados por sus autores. El modelo admite inferencia offline y en streaming con un único modelo, puede transcribir audio largo y se distribuye bajo licencia Apache 2.0, lo que facilita su adopción en producción.

La relevancia actual de este modelo radica en que ofrece una alternativa abierta y eficiente a los servicios ASR propietarios, con soporte multilingüe amplio, capacidad de procesamiento en tiempo real y un ecosistema de herramientas de inferencia completo (vLLM, streaming, timestamps) que lo hace atractivo para desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-Omni, adaptado a audio (no se especifica detalle de capas o atención) |
| Parametros totales | 2.349.217.408 (según pesos safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (soporta transcripción de audio largo, sin cifra concreta) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones oficiales) |
| Idiomas soportados | 30 idiomas (chino, inglés, cantonés, árabe, alemán, francés, español, portugués, indonesio, italiano, coreano, ruso, tailandés, vietnamita, japonés, turco, hindi, malayo, neerlandés, sueco, danés, finés, polaco, checo, filipino, persa, griego, húngaro, macedonio, rumano) y 22 dialectos chinos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen3-ASR-1.7B se basa en el modelo fundacional Qwen3-Omni, que ya incorpora capacidades de comprensión de audio. Sobre esta base, el equipo de Qwen ha entrenado el modelo con datos de habla a gran escala para especializarlo en tareas de identificación de idioma y reconocimiento de voz. No se han publicado detalles técnicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; la información disponible solo menciona el uso de "large-scale speech training data".

Una innovación destacable es la capacidad de inferencia unificada offline y en streaming con un único modelo, lo que evita tener que desplegar dos sistemas separados. Además, el modelo puede transcribir audio largo de forma directa. El framework de inferencia liberado junto con los pesos incluye soporte para vLLM, inferencia por lotes, servicio asíncrono, streaming y predicción de timestamps, aunque esta última función se delega en un modelo auxiliar llamado Qwen3-ForcedAligner-0.6B.

## Capacidades

- Reconocimiento automático del habla (ASR) en 30 idiomas y 22 dialectos del chino, incluyendo acentos del inglés de distintas regiones.
- Identificación de idioma integrada: el modelo detecta automáticamente el idioma hablado y lo transcribe sin configuración previa.
- Inferencia offline y en streaming con un único modelo, lo que permite su uso en aplicaciones en tiempo real.
- Transcripción de audio largo sin necesidad de segmentación manual.
- Manejo de tipos de audio variados: habla, voz cantada y canciones con música de fondo.
- Soporte de timestamps mediante el modelo auxiliar Qwen3-ForcedAligner-0.6B, que predice marcas temporales para unidades arbitrarias en hasta 5 minutos de habla en 11 idiomas.
- Integración con el framework de inferencia `qwen-asr` que ofrece backends de transformers y vLLM, con soporte de FlashAttention 2 para acelerar la inferencia.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede procesar audio en streaming y generar transcripciones en tiempo real en múltiples idiomas, lo que resulta útil para herramientas de colaboración empresarial y actas automáticas.
- Subtitulación automática de vídeo: gracias a su soporte de audio largo y a la predicción de timestamps con el alineador forzado, se puede generar subtítulos sincronizados para vídeos de hasta 5 minutos por segmento.
- Atención al cliente multilingüe: un sistema de soporte puede transcribir llamadas de clientes en distintos idiomas y dialectos, alimentando análisis de sentimiento o búsqueda de incidencias.
- Asistentes de voz embebidos: la variante de 0.6B ofrece un equilibrio precisión-eficiencia con un throughput 2000 veces superior a la competencia a concurrencia 128, lo que la hace adecuada para dispositivos con recursos limitados; la versión 1.7B puede usarse en servidores para asistentes más complejos.
- Archivado y búsqueda de contenido audiovisual: transcribir podcasts, programas de radio o archivos de audio para indexarlos y hacerlos buscables por texto.
- Traducción asistida: combinado con un modelo de traducción, el ASR puede servir como primer paso en un pipeline de traducción de voz a texto en entornos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que Qwen3-ASR-1.7B logra un rendimiento de vanguardia entre los modelos ASR de código abierto y que es competitivo con las APIs comerciales más potentes, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de métricas específicas de ASR como WER (Word Error Rate) o CER (Character Error Rate). Tampoco se detallan comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 2.349 millones de parámetros en precisión FP16, el modelo ocuparía aproximadamente 4,7 GB de memoria, pero no se especifica el consumo real en inferencia.
- GPU recomendadas: no se indica un modelo concreto. Dado el tamaño, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070/4060) podría ejecutar el modelo en FP16, aunque para lotes grandes o audio largo se recomendaría una GPU con más memoria (A100, H100, RTX 4090).
- Si cabe en consumer GPU: probablemente sí, en cuantizaciones de 8 bits o 4 bits, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: el framework `qwen-asr` soporta backends de transformers y vLLM, con inferencia por lotes, asíncrona y streaming. También se puede usar con FlashAttention 2 para reducir memoria y acelerar la inferencia.
- Latencia y throughput estimados: no disponibles. La variante 0.6B alcanza un throughput 2000 veces superior a la competencia a concurrencia 128, pero no se dan cifras para la 1.7B.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos ASR de código abierto como Whisper large-v3, SeamlessM4T o Parakeet. La model card afirma que Qwen3-ASR-1.7B supera a los modelos open-source existentes y compite con APIs comerciales, pero no se ofrecen datos numéricos. Se puede señalar que, a diferencia de Whisper, este modelo integra identificación de idioma y streaming unificado, y que su licencia Apache 2.0 es más permisiva que la de algunos competidores.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos del modelo ni sobre su comportamiento en acentos o dialectos poco representados en los datos de entrenamiento.
- Riesgo de alucinación: como todo modelo de ASR, puede generar transcripciones incorrectas en entornos acústicos adversos o con habla superpuesta, aunque la model card afirma robustez en condiciones complejas.
- Limitaciones de contexto: no se especifica la longitud máxima de audio que puede procesar en una sola pasada; el modelo auxiliar de timestamps está limitado a 5 minutos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar la procedencia de los datos de entrenamiento si se requiere cumplimiento normativo (por ejemplo, GDPR).
- La información disponible no incluye documentación sobre el proceso de entrenamiento, por lo que no se puede evaluar la calidad de los datos ni posibles sesgos lingüísticos.
- El modelo está etiquetado como "region:us" en HuggingFace, lo que podría indicar restricciones de acceso según la región, aunque no se detalla.

## Enlaces

- Modelo en HuggingFace (original de Qwen): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de GitHub: https://github.com/QwenLM/Qwen3-ASR
- Modelo en HuggingFace (copia de WatsonNT): https://huggingface.co/WatsonNT/Qwen3-ASR-1.7B
- Página del modelo en aiart.tools: https://aiart.tools/models/qwen3-asr-1-7b
- Página del modelo en MindStudio: https://www.mindstudio.ai/models/qwen3-asr-1-7b-deepinfra
