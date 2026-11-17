# yamura4/send-gate-307m

## Resumen

send-gate v7.2 es un clasificador binario de seguridad para chats de adolescentes en neerlandés/flamenco e inglés, desarrollado por el usuario yamura4. Su función es devolver únicamente dos veredictos, `block` o `allow`, sin banda intermedia de revisión. Combina cuatro ramas aprendidas: un clasificador principal mmBERT de 307 millones de parámetros, una rama de n-gramas de caracteres, una rama de política para direcciones, IP y enlaces, y una rama de supresión de casos benignos. No emplea expresiones regulares ni listas de palabras.

El modelo resuelve el problema de moderación de contenido en entornos de mensajería juvenil, donde los filtros léxicos clásicos fallan ante variantes ofuscadas (`k4nkermoeilijke`), formatos de dirección o frases de ingeniería social. La arquitectura principal es un transformer mmBERT con pooling CLS, complementado por una CNN de caracteres a nivel de byte y una cabeza 768→256→1. El modelo se distribuye en formato ONNX con encoder en FP16 y embeddings en INT8, manteniendo el vocabulario completo de 256.000 tokens y aceptando longitudes de mensaje dinámicas.

Es relevante porque ofrece un pipeline de moderación autocontenido, desplegable en hardware modesto (Raspberry Pi 5 con 4 GB como mínimo), con licencia MIT para el código de entrenamiento y la puerta, lo que facilita su integración en plataformas de chat sin dependencia de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (transformer) con pooling CLS, CNN de caracteres a nivel de byte y cabeza 768→256→1; tres ramas auxiliares de n-gramas de caracteres con regresión logística |
| Parametros totales | 307.136.769 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta longitudes dinámicas de mensaje; se documentan latencias a 128 tokens) |
| Tipos de cuantizacion | FP16 (encoder) e INT8 (embeddings) en el export ONNX |
| Idiomas soportados | neerlandés (nl), flamenco, inglés (en) |
| Licencia | MIT para el código de entrenamiento y la puerta; el backbone `jhu-clsp/mmBERT-base` tiene su propia licencia que debe verificarse |
| Formato de pesos | ONNX (`model.onnx`), tokenizer JSON, ramas auxiliares en NPZ |

## Arquitectura y entrenamiento

El modelo principal es un mmBERT de 307 millones de parámetros con pooling CLS, una CNN de caracteres a nivel de byte y una cabeza de clasificación 768→256→1. Sobre esta base se añaden tres ramas auxiliares basadas en n-gramas de caracteres 2–5 hasheados con 2^18 características y regresión logística aprendida: una rama de n-gramas general, una rama de política entrenada sobre formatos sintéticos de direcciones, IP y enlaces, y una rama benigna entrenada sobre rechazos de privacidad, conversaciones sobre enlaces y chat común. La decisión final combina los umbrales: bloqueo si la rama principal ≥ 0,94, la de n-gramas ≥ 0,95 o la de política ≥ 0,85; la rama benigna ≥ 0,99 suprime un bloqueo.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica explícitamente que no se usan expresiones regulares ni listas de palabras, y que la rama de política se entrena con formatos sintéticos de direcciones, IP y enlaces. El export ONNX es dinámico y requiere longitudes exactas de tokens y bytes; no debe rellenarse con ceros enmascarados, ya que `gate.py` lo gestiona automáticamente.

## Capacidades

- Clasificación binaria de contenido (`block`/`allow`) para mensajes de chat en neerlandés/flamenco e inglés.
- Detección de términos dañinos ofuscados mediante variantes ortográficas y sustituciones de caracteres (`kkrtest`, `k4nkermoeilijke`).
- Detección de formatos de dirección, direcciones IP y enlaces (incluyendo variantes como `192 dot 168 dot 1 dot 1` y `https://google.com`).
- Detección de frases de ingeniería social y lenguaje abusivo (`je bent een omgekeerde regen`).
- Supresión de falsos positivos en rechazos de privacidad y conversaciones benignas (`mijn huisadres zijn je zaken niet`, `ik leef op een heuvel`).
- Capacidad multilingüe limitada a neerlandés/flamenco e inglés.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de texto, no un modelo generativo.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Moderación en tiempo real de chats juveniles: el modelo clasifica cada mensaje como `block` o `allow` con una latencia de ~22 ms para mensajes cortos en un Ryzen 7 3800X, lo que permite filtrar en línea sin degradar la experiencia de conversación.
- Detección de intentos de compartir datos personales: la rama de política identifica direcciones, IP y enlaces con un recall del 99,7 % sobre 2.000 formatos sintéticos retenidos, adecuada para bloquear el intercambio de información de contacto en plataformas de mensajería.
- Filtrado de lenguaje ofensivo ofuscado: la combinación de la rama principal mmBERT y la rama de n-gramas captura variantes como `k4nkermoeilijke` que escapan a listas de palabras, útil en comunidades donde los usuarios intentan evadir filtros léxicos.
- Despliegue en dispositivos de borde: con un modelo en disco de 419 MB y un RSS de servidor de ~1,29 GiB, puede ejecutarse en una Raspberry Pi 5 con 4 GB (8 GB recomendado), lo que permite moderación local sin enviar mensajes a la nube.
- Integración en servidores HTTP existentes: `serve.py` expone una API JSON y una interfaz web en el puerto 8080, lo que facilita conectarlo a un backend de chat mediante una llamada `POST /api/check`.
- Prefiltrado en pipelines de moderación más amplios: al devolver solo `block` o `allow` sin banda de revisión, puede actuar como primera etapa que deriva únicamente los mensajes bloqueados a un revisor humano o a un modelo mayor.
- Protección de menores en foros escolares: la rama benigna suprime falsos positivos en conversaciones ordinarias (`de regen valt`, `kwart voor 8`), reduciendo las interrupciones injustificadas en entornos educativos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Exactitud (804 elementos) | 94,2 % |
| Dañinos detectados (804 elementos) | 95,6 % (282/295) |
| Falsos bloqueos benignos (804 elementos) | 6,7 % (34/509) |
| Falsos negativos (804 elementos) | 13 |
| Falsos positivos (804 elementos) | 34 |
| Exactitud global (1.793 elementos) | 96,0 % |
| Falsos negativos globales (1.793 elementos) | 27 |
| Falsos positivos globales (1.793 elementos) | 45 |
| Variantes retenidas (227 elementos) | 0 falsos negativos |
| Rama de política, recall (2.000 formatos sintéticos) | 99,7 % |
| Rama de política, falsos positivos (1.060 controles benignos, umbral 0,85) | 0 |

| Métrica de despliegue | Valor |
|---|---|
| Modelo en disco | 419 MB |
| RSS de sesión ONNX Runtime | ~0,85 GiB |
| RSS del servidor completo | ~1,29 GiB |
| Latencia en Ryzen 7 3800X | ~22 ms (mensajes cortos); ~100 ms (128 tokens) |
| Raspberry Pi 5 | 4 GB mínimo, 8 GB recomendado; velocidad no medida |

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los clasificadores de moderación de propósito general (como los basados en BERT multilingüe o en modelos de toxicidad) no aparecen referenciados en la model card, por lo que no es posible establecer una comparación con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La rama de direcciones, IP y enlaces se entrena con formatos sintéticos; no garantiza cobertura de todos los TLD, trucos de espaciado o estilos de dirección del mundo real.
- `ja jammer` sigue siendo un falso bloqueo benigno conocido.
- Varias decisiones quedan a pocas milésimas del umbral, por lo que el redondeo FP16 puede invertir la clasificación de casos límite.
- El rendimiento en Raspberry Pi y el comportamiento de ONNX Runtime en ARM64 no se han medido.
- El servidor `serve.py` no incluye autenticación ni TLS; si se expone a internet, debe colocarse detrás de un proxy inverso.
- No se recomienda su uso en placas de 2 GB.
- La licencia MIT cubre el código de entrenamiento y la puerta, pero el backbone `jhu-clsp/mmBERT-base` tiene su propia licencia que debe verificarse antes de un despliegue comercial.
- El modelo solo cubre neerlandés/flamenco e inglés; no es adecuado para otros idiomas.
- Al ser un clasificador binario sin banda de revisión, los casos límite se resuelven con un bloqueo o una autorización, sin posibilidad de escalado intermedio.
- Riesgo de sesgos y alucinación no documentado en la información disponible; al tratarse de un clasificador, el riesgo principal es de falsos positivos y negativos, no de generación de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yamura4/send-gate-307m
- Backbone mmBERT: `jhu-clsp/mmBERT-base` (referenciado en la model card, sin URL completa en la información disponible)
