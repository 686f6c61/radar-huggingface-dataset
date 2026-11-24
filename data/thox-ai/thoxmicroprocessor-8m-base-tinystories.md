# Thox-ai/ThoxMicroprocessor-8M-Base-TinyStories

## Resumen

ThoxMicroprocessor-8M-Base-TinyStories es un modelo de lenguaje decoder-only de 8.093.520 parámetros (5.472.080 no de embedding) desarrollado por THOX desde cero como parte de su línea de investigación de modelos pequeños. Se presenta como un checkpoint de validación de arquitectura, no como un modelo de producto: el objetivo es verificar el funcionamiento de la arquitectura `thox-microprocessor-v0.2`, una variante de decoder con dominancia de atención diseñada para routing local, extracción estructurada y control de dispositivos en hardware de borde.

La arquitectura emplea 21 capas con `d_model` de 320, 8 cabezas de atención y 2 cabezas KV (GQA), contexto de 1024 tokens, normalización RMS en QK y normalización tipo sándwich, además de un mixer blockwise Walsh-Hadamard. El entrenamiento se realizó exclusivamente sobre TinyStories, con 98,3 millones de tokens, lo que limita sus capacidades al dominio de historias infantiles sintéticas en inglés.

Su relevancia actual es doble: por un lado, sirve como referencia para investigar arquitecturas compactas con atención dominante y cuantización agresiva (payload INT4 de 4,45 MB); por otro, ilustra el ecosistema de hardware local-first que THOX está promocionando. No obstante, el propio autor advierte que este checkpoint no tiene capacidades de routing, tool calling ni control de dispositivos, y que su uso previsto es la investigación y validación arquitectónica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con atención dominante, QK RMS norm, sandwich norm y mixer blockwise Walsh-Hadamard (thox-microprocessor-v0.2) |
| Parámetros totales | 8.093.520 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | INT4 (group size 64) con payload de 4,45 MB; INT4 con embedding INT8 (5,76 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (con reservas sobre la licencia CDLA-Sharing-1.0 de TinyStories, en revisión) |
| Formato de pesos | Safetensors (`model.safetensors`, 32.400.144 B) |

## Arquitectura y entrenamiento

El modelo es un decoder-only transformer de 21 capas con `d_model` de 320 y 8 cabezas de atención con 2 cabezas KV (GQA), lo que reduce el coste de la caché KV. Incorpora QK RMS normalization, sandwich normalization (normalización antes y después de cada subcapa) y un mixer blockwise Walsh-Hadamard, una innovación que sustituye o complementa la mezcla de tokens con transformadas rápidas de Hadamard por bloques. La implementación de referencia en `transformers` recalcula el prefijo en cada paso de decodificación en lugar de mantener caché KV, priorizando la portabilidad entre versiones; para decodificación con caché se indica el paquete `thox_microprocessor`.

El entrenamiento se realizó desde cero (sin modelo base externo) sobre el corpus TinyStories, con 98,3 millones de tokens. No se documenta el uso de RLHF, DPO ni otras fases de alineación. El resultado en validación es una pérdida de 1,6956 y una perplejidad de 5,4499 sobre 2.095.104 tokens objetivo del split de validación de TinyStories. La cuantización INT4 añade +0,0366 de pérdida en 4,45 MB, y la variante INT4 con embedding INT8 añade +0,0162 en 5,76 MB.

## Capacidades

- Generación de texto en inglés dentro del dominio de historias infantiles sintéticas (TinyStories).
- No dispone de capacidades de razonamiento general, código, matemáticas o visión; el autor lo declara explícitamente fuera de dominio.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés.
- Sin modo de pensamiento (thinking mode), audio ni otras modalidades.
- Capacidad de ejecución en hardware de borde gracias a su tamaño reducido y a la cuantización INT4.

## Casos de uso

- Validación de arquitectura: investigadores pueden reproducir el checkpoint y comprobar el comportamiento del mixer Walsh-Hadamard y de la normalización sándwich en un modelo de 8M, comparando pérdida y perplejidad con arquitecturas convencionales del mismo tamaño.
- Estudio de cuantización extrema: el payload INT4 de 4,45 MB permite medir el impacto de la cuantización en la perplejidad (+0,0366) y comparar con la variante INT8 en embedding (+0,0162), útil para diseñar pipelines de compresión para dispositivos.
- Pruebas de integración en `transformers`: el modelo sirve para verificar el flujo `trust_remote_code=True` con código remoto y tokenizador propio en pipelines de CI, sin coste computacional relevante.
- Benchmarking de latencia en hardware de borde: con 8M de parámetros y contexto de 1024, es adecuado para medir tiempos de carga y decodificación en placas embebidas o microcontroladores con aceleración, antes de pasar a modelos mayores de la misma familia.
- Generación de cuentos sintéticos para aumento de datos: dentro de su dominio, puede producir historias simples en inglés para prototipos de juguetes educativos o demos de generación de texto en dispositivo.
- Docencia y divulgación: por su tamaño y licencia permisiva, es un ejemplo manejable para explicar arquitecturas decoder-only, GQA y cuantización en cursos o talleres, siempre advirtiendo de su dominio limitado.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida en validación (TinyStories, 2.095.104 tokens) | 1,6956 |
| Perplejidad en validación | 5,4499 |
| Coste de cuantización INT4 (4,45 MB) | +0,0366 de pérdida |
| Coste de cuantización INT4 + embedding INT8 (5,76 MB) | +0,0162 de pérdida |
| Resultado GATE49 de THOX | No publicado para este modelo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB en FP32 (32,4 MB de pesos); aproximadamente 4,45 MB de payload en INT4, más overhead de código, allocator, activaciones y caché KV.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso CPU; el modelo está pensado para hardware de borde de THOX.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM, y probablemente en dispositivos integrados.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (implementación de referencia sin caché KV); paquete `thox_microprocessor` para decodificación con caché. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de si se usa la implementación con o sin caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxMicroprocessor-8M-Base-TinyStories | 8,09M | 1024 | Apache-2.0 | Hugging Face | Checkpoint de validación, solo TinyStories |
| Modelos TinyStories de referencia (p. ej. variantes de 1M-10M) | ~1M-10M | Variable | Variable | Hugging Face | Entrenados sobre el mismo corpus; comparación cualitativa no disponible en la información |
| Modelos decoder pequeños de propósito general | 10M-100M | 512-2048 | Variable | Hugging Face | No disponibles datos concretos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con historias infantiles sintéticas; las salidas fuera de ese dominio carecen de sentido.
- Los modelos pequeños cometen errores factuales y pueden producir respuestas seguras pero incorrectas; hay que verificar cualquier salida relevante.
- La cuantización intercambia precisión por tamaño; la variante INT4 degrada la pérdida en +0,0366.
- Sin capacidades de routing, tool calling, control de dispositivos ni dominio THOX, pese a la descripción de la arquitectura.
- Idiomas: solo inglés.
- Licencia Apache-2.0 declarada, pero el autor indica que las implicaciones share-alike de CDLA-Sharing-1.0 (licencia de TinyStories) están en revisión; conviene confirmar antes de uso comercial.
- Uso previsto limitado a investigación y validación de arquitectura; no apto para producción ni para decisiones médicas, legales, financieras o de seguridad sin revisión humana.
- La implementación de referencia en `transformers` no mantiene caché KV, lo que penaliza la latencia en decodificación.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMicroprocessor-8M-Base-TinyStories
- Demo de dispositivos virtuales THOX: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai?ref=hf-thoxmicroprocessor-8m-base-tinystories
