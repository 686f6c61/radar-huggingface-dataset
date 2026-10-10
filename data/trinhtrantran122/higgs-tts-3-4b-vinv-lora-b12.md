# trinhtrantran122/Higgs-TTS-3-4b-ViNV-LoRA-B12

## Resumen

Higgs-TTS-3-4b-ViNV-LoRA-B12 es un adaptador LoRA (Low-Rank Adaptation) de rango 16 entrenado sobre el modelo base multimodalart/higgs-audio-v3-tts-4b-transformers, un sistema de síntesis de voz (text-to-speech) de 4.000 millones de parámetros. Lo publica el usuario trinhtrantran122 en HuggingFace y su finalidad es generar voz en vietnamita incorporando sonidos no verbales (risa, suspiro, resoplido y carraspeo) mediante tokens especiales del tipo `<|sfx:laughter|>`, `<|sfx:sigh|>`, `<|sfx:sniff|>` y `<|sfx:cough|>`. Se entrenó sobre el conjunto ViNV-TTS de la competición VLSP 2026.

Una particularidad decisiva: el propio autor advierte en la model card que NO recomienda su uso. El adaptador obtiene resultados peores que el modelo base en el conjunto de desarrollo de VLSP 2026 (120 frases), y el loss de entrenamiento prácticamente no desciende (de 4,51 a 4,59). Se publica únicamente como referencia y para permitir su reproducción, no como solución para producción ni para presentar a la competición.

Por tanto, esta ficha debe leerse como documentación de un experimento de ajuste fino fallido o de referencia, y no como un recurso listo para desplegar. Su interés técnico radica en documentar la metodología de LoRA sobre un modelo TTS de 4B y el uso de tokens de sonidos no verbales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16, alpha 32) sobre el transformer de síntesis de voz multimodalart/higgs-audio-v3-tts-4b-transformers |
| Parametros totales | 4.000 millones en el modelo base; el adaptador LoRA es un subconjunto de bajo rango |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other (bosonai-higgs-audio-v3) |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base (más allá de que es un sistema text-to-speech de 4.000 millones de parámetros comercializado bajo la licencia bosonai-higgs-audio-v3). Lo que sí se documenta es el procedimiento de ajuste: un adaptador LoRA con rango 16, alpha 32, learning rate 5e-5 y 3 épocas, equivalentes a 165 pasos de entrenamiento. Se empleó la herramienta tuanh123789/Higgs-tts-3-finetune (commit c79f245) y `transformers` 5.3.0. Cada directorio `checkpoint-epoch-N` contiene el adaptador tras la época N, sin estados del optimizador.

La innovación pretendida es la incorporación de tokens de sonidos no verbales (`<|sfx:laughter|>`, `<|sfx:sigh|>`, `<|sfx:sniff|>`, `<|sfx:cough|>`) para enriquecer la síntesis en vietnamita. No obstante, el entrenamiento no convergió: el loss pasó de 4,51 a 4,59, y las métricas de evaluación empeoraron respecto al modelo base. El conjunto de datos ViNV-TTS de VLSP 2026 no se distribuye junto con el adaptador.

## Capacidades

- Generación de voz (text-to-speech) en vietnamita.
- Inserción de sonidos no verbales mediante tokens especiales: risa, suspiro, resoplido y carraspeo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; únicamente vietnamita.
- Capacidades especiales: modo de pensamiento, visión o audio, no disponibles; se trata exclusivamente de un adaptador TTS.

## Casos de uso

Dado que el autor desaconseja explícitamente su uso, los siguientes escenarios son de carácter teórico o exploratorio y quedan condicionados por la advertencia de que el adaptador rinde peor que el modelo base:

- Reproducción de experimentos de ajuste fino: sirve como caso de estudio para analizar por qué un LoRA de rango 16 sobre un TTS de 4B no converge con 165 pasos y learning rate 5e-5.
- Investigación sobre sonidos no verbales en TTS: permite estudiar la mecánica de los tokens `<|sfx:*|>` y su efecto en la prosodia, aunque los resultados medidos sean peores que el modelo base.
- Comparación de pipelines de evaluación TTS en vietnamita: el adaptador y sus métricas (WER, pMOS, SS) pueden reutilizarse como referencia para validar un banco de pruebas sobre el conjunto de desarrollo de VLSP 2026 (120 frases).
- Docencia y formación: ilustra de forma práctica el flujo PEFT/LoRA con la librería `transformers` 5.3.0 sobre un modelo de audio.
- Punto de partida para un reentrenamiento: el adaptador puede servir como base para experimentos con más épocas, mayor rango o mejores datos, corrigiendo la falta de convergencia observada.
- Análisis de licencias y cumplimiento: útil para estudiar cómo se hereda la licencia del modelo base (bosonai-higgs-audio-v3) en un adaptador derivado.
- No se recomienda su uso en atención al cliente, locución comercial, doblaje o cualquier aplicación en producción, dado el deterioro de métricas frente al modelo base.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en el conjunto de desarrollo de VLSP 2026 (120 frases, con clip de referencia coincidente con la etiqueta). Comparan el adaptador (identificado como "v1") con el modelo base:

| Metrica | Adaptador (v1) | Higgs-TTS-3-4b base | Conjunto |
|---|---|---|---|
| Puntuacion compuesta | 0,375 | 0,468 | VLSP 2026 dev (120 frases) |
| WER | 0,215 | 0,146 | VLSP 2026 dev (120 frases) |
| pMOS | 3,03 | 3,33 | VLSP 2026 dev (120 frases) |
| SS | 0,63 | 0,74 | VLSP 2026 dev (120 frases) |
| Loss de entrenamiento | 4,51 → 4,59 | no aplica | Entrenamiento LoRA |

En todas las métricas el adaptador empeora al modelo base. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.), ya que no son aplicables a un modelo de síntesis de voz.

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en el tamaño del modelo base (4.000 millones de parámetros); no proceden de la información proporcionada:

- VRAM estimada para el modelo base: unos 8-10 GB en precisión FP16/BF16 solo para los pesos, más el decodificador de audio y las activaciones.
- Cuantización de 8 bits: aproximadamente 4-6 GB de pesos.
- Cuantización de 4 bits: aproximadamente 2,5-4 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para despliegue; en consumo, RTX 3090, RTX 4090 o RTX 4070 Ti con 12-24 GB de VRAM.
- ¿Cabe en GPU de consumo? Muy probablemente sí en FP16 en tarjetas de 12 GB o más, y con holgura en configuraciones cuantizadas de 8 o 4 bits.
- Opciones de despliegue: el adaptador es un LoRA compatible con PEFT; el modelo base se sirve habitualmente mediante vLLM, TGI o `transformers`. Opciones como llama.cpp u Ollama dependen de si el modelo base dispone de conversión a GGUF, dato no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información disponible solo permite comparar de forma directa con el modelo base del que deriva el adaptador:

| Modelo | Parametros | Contexto | Rendimiento (VLSP 2026 dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Higgs-TTS-3-4b-ViNV-LoRA-B12 | LoRA rank 16 sobre 4B | no disponible | 0,375 / WER 0,215 / pMOS 3,03 / SS 0,63 | bosonai-higgs-audio-v3 | HuggingFace (0 descargas) |
| multimodalart/higgs-audio-v3-tts-4b-transformers (base) | 4B | no disponible | 0,468 / WER 0,146 / pMOS 3,33 / SS 0,74 | bosonai-higgs-audio-v3 | HuggingFace |
| Otros modelos TTS en vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre alternativas comparables de la misma categoría (TTS en vietnamita con sonidos no verbales).

## Limitaciones y advertencias

- El autor desaconseja explícitamente su uso: el adaptador rinde peor que el modelo base en todas las métricas evaluadas (compuesta, WER, pMOS y SS).
- El entrenamiento no convergió: el loss pasó de 4,51 a 4,59 a lo largo de las 3 épocas (165 pasos).
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgos.
- Riesgo de alucinación: aplicable al contenido acústico; no se documenta, pero un TTS mal ajustado puede producir prosodia incorrecta, artefactos o una pronunciación defectuosa.
- Limitaciones de contexto e idioma: el adaptador solo está entrenado para vietnamita; no se especifica la longitud de contexto del modelo base.
- Restricciones de licencia: hereda la licencia bosonai-higgs-audio-v3 (licencia "other"), por lo que el uso comercial depende de los términos del modelo base; deben revisarse antes de cualquier explotación.
- El conjunto de datos ViNV-TTS de VLSP 2026 no se distribuye con el adaptador, lo que dificulta la reproducción exacta del entrenamiento.
- No hay métricas de latencia, throughput ni consumo de memoria publicadas.
- Con 0 descargas y 0 "likes", no existe validación por parte de la comunidad.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/trinhtrantran122/Higgs-TTS-3-4b-ViNV-LoRA-B12
- Modelo base: https://huggingface.co/multimodalart/higgs-audio-v3-tts-4b-transformers
- Licencia del modelo base: https://huggingface.co/multimodalart/higgs-audio-v3-tts-4b-transformers/blob/main/LICENSE
- Herramienta de ajuste fino: https://huggingface.co/tuanh123789/Higgs-tts-3-finetune (commit c79f245)
