# ThakiCloud/Thaki-SyntheticVoice-KO-2B-v0.1

## Resumen

Thaki-SyntheticVoice-KO-2B-v0.1 es un modelo de síntesis de voz (text-to-speech) en coreano desarrollado por ThakiCloud, obtenido mediante un fine-tune LoRA sobre el modelo base openbmb/VoxCPM2 (2B parámetros, licencia Apache-2.0). Su particularidad es que el hablante objetivo, denominado F1 (una voz femenina coreana sintética, calmada y de tono grave, con registro de asistente corporativo), no corresponde a ninguna persona real: fue generado exclusivamente con la función Voice Design de VoxCPM2 a partir de una descripción textual.

El modelo resuelve el problema de disponer de una voz de marca en coreano sin depender de grabaciones de locutores reales, evitando así cuestiones de derechos de imagen y consentimiento. El entrenamiento consistió en un LoRA de rango 32 sobre 80,8 minutos de audio sintetizado por el propio VoxCPM2 a partir del ancla de F1, posteriormente fusionado en los pesos base para entregar un único checkpoint en safetensors.

Con 2.290.004.544 parámetros y un repositorio de 5,0 GB, el modelo se publica como versión v0.1 y está pensado para despliegues en producción de asistentes de voz en coreano. La model card es explícita sobre sus límites: con la referencia incluida rinde a la par que VoxCPM2 Base + la misma referencia, y sin referencia mejora la pronunciación y naturalidad del base pero la consistencia de timbre entre enunciados sigue siendo limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (text-to-speech), fine-tune LoRA fusionado en los pesos base |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16; repo de 5,0 GB) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fusionado, cargable en bf16) + config/tokenizer/AudioVAE de VoxCPM2 + `reference/anchor_F1_16k.wav` |
| Modelo base | openbmb/VoxCPM2 |
| Frecuencia de muestreo de salida | 48 kHz |
| Referencia incluida | 8,3 s, 16 kHz (sha256 cb73d996b1b9f0017bcd428d00ea12fd9dd262b60a0111640f13f898906dfbad) |
| Libreria | voxcpm (commit OpenBMB/VoxCPM@cce58a5b) |
| Coste de entrenamiento | aprox. 2,1 GPU-horas en una H100 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de VoxCPM2 de OpenBMB, un sistema TTS de 2B parámetros que incluye un AudioVAE y un tokenizer propios, y que en esta entrega se distribuye como un checkpoint único con los pesos del fine-tune ya fusionados. El proceso de adaptación fue un LoRA de rango 32 y alpha 32 sobre un único hablante, entrenado con 80,8 minutos de voz sintetizada por el propio VoxCPM2 a partir de la referencia de F1 y fusionado después en los pesos base.

La construcción del hablante se hizo en dos fases. Primero se generaron ocho voces candidatas (cuatro femeninas y cuatro masculinas) mediante Voice Design a partir de descripciones textuales de género, rango de edad, tono, timbre y ritmo; cada una se evaluó con UTMOS (naturalidad), similitud de hablante WavLM-SV frente al ancla y CER con Whisper. Se seleccionó F1 con UTMOS 3,46 y coseno frente al ancla de 0,988 de media y 0,976 mínimo. Después se escribieron 1.200 frases coreanas (generales, empresariales y técnicas, números y fechas, alfanuméricos y nombres de producto, frases largas, diálogo de atención al cliente y pronunciación difícil), cada una con forma escrita y forma hablada, y se dividieron por plantilla para evitar fugas entre entrenamiento y evaluación. La evaluación se realizó con 200 frases retenidas por 3 semillas (con referencia) y 60 frases por 3 semillas (sin referencia), con umbrales preinscritos T1–T5.

## Capacidades

- Síntesis de voz en coreano a 48 kHz con una voz femenina sintética predefinida (F1).
- Clonación de voz condicionada por referencia: acepta `prompt_wav_path` y `prompt_text` para fijar el timbre.
- Modo sin referencia (experimental): genera una voz cercana a F1 con buena naturalidad, aunque el timbre varía entre enunciados.
- Control de generación mediante `cfg_value`, `inference_timesteps` y `seed`.
- Normalización de texto opcional para cadenas de versión (`v1.2.3`, `2.0`) mediante los ficheros Python incluidos en `text_normalization/`, que no se cargan automáticamente.
- No soporta tool calling, function calling, agentes, visión ni audio de entrada; es exclusivamente TTS.
- No dispone de control de emoción según la model card.

## Casos de uso

- Asistentes de voz corporativos en coreano: con la referencia `anchor_F1_16k.wav` incluida, el modelo mantiene un timbre estable y un registro de asistente calmado, adecuado para anuncios internos y avisos de estado.
- Atención al cliente automatizada: el modelo fue entrenado con un subconjunto específico de diálogo de atención al cliente y convenciones de lectura de números y fechas, lo que permite locutar respuestas con importes (`삼억 이천오백만 원`) y horas (`오후 세 시 삼십 분`) de forma consistente.
- Anuncios de estado de tareas y sistemas: frases como el ejemplo de la model card ("요청하신 작업은 오늘 오후 세 시 삼십 분에 완료될 예정입니다") ilustran el uso en notificaciones de pipelines y operaciones.
- Generación de voz de marca sin locutor real: al haberse creado F1 exclusivamente por descripción textual, evita la dependencia de cesiones de derechos de imagen y consentimiento de una persona física.
- Lectura de documentación técnica y nombres de producto: combinado con el normalizador de versiones incluido, permite locutar referencias como `v1.2.3-rc1` o `VoxCPM 2.0` en su forma hablada coreana.
- Prototipado rápido de interfaces de voz: el modelo se carga con `VoxCPM.from_pretrained` y requiere una sola GPU para inferencia, lo que facilita pruebas de concepto en entornos con recursos limitados.
- Producción de audiolibros o contenido narrado en coreano con voz femenina uniforme, siempre que se use la referencia incluida para mantener la consistencia.

## Benchmarks y rendimiento

La model card no publica resultados comparativos frente a otros modelos TTS en MMLU, HumanEval, GSM8K ni métricas equivalentes. Los únicos datos numéricos disponibles son los de selección del hablante y la evaluación interna:

| Metrica | Valor |
|---|---|
| UTMOS de la voz F1 (seleccion) | 3,46 |
| Similitud WavLM-SV frente al ancla (media) | 0,988 |
| Similitud WavLM-SV frente al ancla (minimo) | 0,976 |
| Frases retenidas con referencia | 200 x 3 semillas |
| Frases retenidas sin referencia | 60 x 3 semillas |
| Frases del guion de entrenamiento | 1.200 |
| Duracion del audio de entrenamiento | 80,8 min |
| Coste de entrenamiento | aprox. 2,1 GPU-horas en H100 |

No se han publicado resultados de benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2.290.004.544 parámetros en bf16 los pesos ocupan aproximadamente 4,6 GB, por lo que se necesita margen adicional para el AudioVAE, el tokenizer y las activaciones.
- GPU recomendadas: la model card cita una H100 para el entrenamiento completo (2,1 GPU-horas); para inferencia no se especifica un modelo concreto.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por tamano de pesos en bf16 es plausible en tarjetas con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: la librería `voxcpm` (`VoxCPM.from_pretrained` con `load_denoiser=False`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; los parámetros `inference_timesteps=10` y `cfg_value=2.0` son los valores usados en los ejemplos de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Thaki-SyntheticVoice-KO-2B-v0.1 | 2.290.004.544 | no disponible | coreano | Apache-2.0 | Fine-tune LoRA de VoxCPM2 con voz sintética F1 |
| openbmb/VoxCPM2 | 2B (según model card) | no disponible | no disponible | Apache-2.0 | Modelo base; con la misma referencia rinde a la par según el autor |
| Alternativas TTS de 2B | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables en la informacion disponible |

## Limitaciones y advertencias

- No es un TTS mejor que VoxCPM2 Base + la misma referencia; el propio autor lo indica de forma explícita.
- Sin referencia, no garantiza una voz idéntica en cada generación: la consistencia de timbre entre enunciados es limitada.
- Evaluado únicamente en coreano, en condiciones sintéticas limpias, con una sola voz femenina y sin control de emoción.
- No normaliza texto por sí mismo: los pesos v0.1 no convierten dígitos ni símbolos; hay que escribir los números en su forma hablada coreana o usar el normalizador incluido en `text_normalization/`, que solo cubre cadenas de versión.
- Los dígitos arábigos en la entrada no fueron entrenados y pueden leerse de forma inconsistente.
- Riesgo de alucinación y de pronunciación errónea fuera de las plantillas y convenciones del guion de entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible; la voz está limitada a un único perfil (mujer coreana de treinta y tantos años, tono grave).
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base openbmb/VoxCPM2.
- El modelo es la versión v0.1; el autor advierte de que se lea la sección de limitaciones antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-SyntheticVoice-KO-2B-v0.1
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Blog de ingeniería (inglés): https://thakicloud.com/tech-blog/en/llmops/thaki-syntheticvoice-ko-2b-voxcpm2/
- Blog de ingeniería (coreano): https://thakicloud.com/tech-blog/ko/llmops/thaki-syntheticvoice-ko-2b-voxcpm2/
- Repositorio VoxCPM: https://github.com/OpenBMB/VoxCPM (commit cce58a5b)
- Tarjeta en coreano: MODEL_CARD.ko.md dentro del repositorio de HuggingFace
