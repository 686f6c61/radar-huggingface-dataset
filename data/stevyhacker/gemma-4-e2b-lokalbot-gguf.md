# stevyhacker/Gemma-4-E2B-LokalBot-GGUF

## Resumen

Gemma-4-E2B-LokalBot-GGUF es una familia de fine-tunes del modelo base `google/gemma-4-E2B` publicada por el desarrollador independiente stevyhacker. Su propósito no es la generación de texto generalista, sino el autocompletado en línea (inline autocomplete, denominado "Cotyping" por el autor) dentro de la aplicación de escritorio LokalBot, con soporte bilingüe inglés-serbio (alfabeto latino y cirílico) y manejo de contexto fundamentado del tipo `Visible in this window:` y `Relevant saved facts:`.

El modelo base es un transformer de la familia Gemma 4 con aproximadamente 4.650 millones de parámetros totales (según los pesos en safetensors del repositorio), cuantizado en formato GGUF con cuantización `i1-Q6_K` generada mediante imatrix bilingüe. El repositorio distribuye tres puntos operativos (v2, v3 y v4), cada uno calibrado a una temperatura de muestreo distinta (`s=1.0` para v4 y `s=1.15` para v2/v3), lo que permite elegir entre un comportamiento conservador y uno de mayor cobertura de sugerencias.

Su relevancia actual radica en que demuestra un flujo de trabajo de fine-tuning muy especializado (autocompletado de baja latencia en dispositivo) sobre un modelo pequeño, con métricas de evaluación propias y reproducibles, y con licencia Apache 2.0, lo que facilita su reutilización comercial. No obstante, su ámbito de aplicación es estrecho: está optimizado para sugerencias de continuación de texto cortas, no para razonamiento complejo ni generación long-form.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, modelo base `google/gemma-4-E2B`); detalles internos de atención y capas no disponibles |
| Parametros totales | 4.647.450.147 (según safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF `i1-Q6_K` (imatrix bilingüe EN/SR); no se listan otras cuantizaciones en el repo |
| Idiomas soportados | en, sr (latino y cirílico), de, fr, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos de ~3.845 GB cada uno) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B`, un transformer de la familia Gemma 4 con unos 4.650 millones de parámetros. Sobre esa base, el autor aplica un fine-tuning orientado a autocompletado en línea y posteriormente cuantiza a `i1-Q6_K` usando una imatrix bilingüe inglés-serbio, lo que preserva mejor la precisión en los dos idiomas objetivo frente a una imatrix estándar. No se detalla en la información disponible la composición exacta del dataset de fine-tuning, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable no está en la arquitectura del modelo, sino en el proceso de calibración: la versión v4 aplica una divergencia KL forward desde el token 0 del cuerpo sobre 13.400 filas de anclaje de calibración (recuperación de memoria independiente, prompts cortos de chat y formato, correspondencia, distractores y lenguajes de guarda), lo que alinea la confianza en prompts cortos con la del modelo stock. Además, el autor publica dos puntos operativos con temperaturas de muestreo distintas (`s=1.0` y `s=1.15`) para moverse a lo largo de la curva precisión-cobertura, y reporta comprobaciones de seguridad (28 checks, 0 unsafe) y de deriva hacia ruso (0 drift).

## Capacidades

- Autocompletado en línea (Cotyping) de baja latencia para editores de texto y aplicaciones de escritorio.
- Generación de texto en inglés y serbio (latino y cirílico), con soporte adicional declarado para alemán, francés y español.
- Manejo de contexto fundamentado: interpreta bloques `Visible in this window:` y `Relevant saved facts:` para condicionar las sugerencias.
- Recuperación de memoria guardada (saved-memory recall) con abstención conservadora cuando no hay evidencia suficiente.
- Sugerencias de continuación a mitad de palabra (midword completion) y en límites de palabra (word-boundary completion).
- Capacidad de formateo y de correspondencia (email) dentro del ámbito de autocompletado.
- No se documentan tool calling, function calling, razonamiento multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Autocompletado en editores de texto y correo: el modelo está entrenado específicamente para sugerir continuaciones en línea con latencias de decenas de milisegundos (mediana de 20,2 ms en límite de palabra y p95 de 80,0 ms en escritura sobre Apple M4 Max), lo que lo hace adecuado para integración en un editor de escritorio.
- Asistentes de escritura bilingües inglés-serbio: cubre tanto alfabeto latino como cirílico, con mejoras notables frente al modelo stock en serbio latino (12,12% frente a 7,58% de precisión en el conjunto Serbian Latin) y cirílico (13,79% frente a 8,62%).
- Redacción de correo electrónico asistida: la versión v4 alcanza un 80,0% de precisión en el conjunto Email (frente al 74,3% del stock), lo que la hace útil para sugerencias en clientes de correo.
- Completado con memoria de contexto guardado: el modelo puede condicionar sus sugerencias a hechos previamente guardados por el usuario, con 56/56 aciertos en las suites de memoria y contexto visible de la versión v4.
- Aplicaciones de escritorio con inferencia en dispositivo: al ser GGUF de ~3,8 GB y ejecutarse con llama.cpp, puede desplegarse localmente sin conexión, lo que encaja en herramientas de productividad que priorizan privacidad.
- Prototipado de sistemas de autocompletado multilingüe: sirve como referencia para evaluar técnicas de imatrix bilingüe y calibración KL en modelos pequeños antes de escalar a otros idiomas o dominios.
- Filtrado de sugerencias en pipelines de escritura: los puntos operativos v3 (alta cobertura) y v4 (conservador) permiten elegir el equilibrio entre recall y precisión según el producto.

## Benchmarks y rendimiento

Los benchmarks publicados por el autor se evalúan con el binario de producción de LokalBot y `llama.cpp v1.0.0` sobre Apple M4 Max, comparando contra el GGUF stock `gemma-4-E2B.i1-Q6_K.gguf`.

| Benchmark / pilar | Stock i1-Q6_K | v2-PLE (s=1.15) | v3 (s=1.15) | v4 (s=1.0) |
|---|---:|---:|---:|---:|
| Engine Overall (788): acc / cov / prec | 23,10% / 46,1% / 50,1% | 29,82% / 57,4% / 52,0% | 30,71% / 58,6% / 52,4% | 25,25% / 48,4% / 52,2% |
| Engine correctas / incorrectas mostradas | 182 / 181 | 235 / 217 | 242 / 220 | 199 / 182 |
| English (624): acc / prec | 25,32% / 49,5% | 31,09% / 51,9% | 31,41% / 52,0% | 26,60% / 51,9% |
| Email (52): acc / prec | 50,00% / 74,3% | 48,08% / 59,5% | 55,77% / 70,7% | 53,85% / 80,0% |
| Formatting (39): acc / prec | 41,03% / 61,5% | 41,03% / 57,1% | 41,03% / 53,3% | 41,03% / 57,1% |
| Science (85): acc / prec | 21,18% / 39,1% | 20,00% / 43,6% | 18,82% / 42,1% | 22,35% / 47,5% |
| Other Languages (164): acc / prec | 14,63% / 54,6% | 25,00% / 52,6% | 28,05% / 54,1% | 20,12% / 54,1% |
| Serbian Latin (66): acc / prec | 7,58% / 55,6% | 21,21% / 45,2% | 22,73% / 46,9% | 12,12% / 42,1% |
| Serbian Cyrillic (58): acc / prec | 8,62% / 38,5% | 17,24% / 41,7% | 18,97% / 40,7% | 13,79% / 40,0% |
| Midword q6pub_prod (288): acc / prec | 56,94% / 74,2% | 61,11% / 72,1% | 60,42% / 71,3% | 59,03% / 73,6% |
| Midword prefixconf_prod heldout (288): acc / prec / acc2 | 52,78% / 67,3% / 18,8% | 53,82% / 66,2% / 20,1% | 54,86% / 67,5% / 18,4% | 53,82% / 68,9% / 19,1% |
| Visible Context dev / heldout / link (30) | 6/8 / 14/18 / 3/4 | 8/8 / 18/18 / 4/4 | 8/8 / 18/18 / 4/4 | 8/8 / 18/18 / 4/4 |
| Memory dev (6) / heldout (12+10) / rel heldout (5+7) | 6/6 / 12+10 / 5+7 | 5/6 / 12+10 / 4+7 | 5/6 / 12+10 / 4+7 | 6/6 / 12+10 / 5+7 |
| Blind fresh_holdout_v1 (160): acc / prec / forb | 73,12% / 88,6% / 3 | 81,25% / 89,7% / 3 | 82,50% / 90,4% / 1 | 78,75% / 88,7% / 2 |
| Blind fresh_holdout_v1 sr_latn (30): acc / prec | 70,0% / 91,3% | 76,7% / 82,1% | 73,3% / 81,5% | 76,7% / 88,5% |
| Blind fresh_holdout_v2 (82): acc / prec / forb | 43,90% / 87,8% / 1 | — | 68,29% / 91,8% / 1 | 52,44% / 89,6% / 1 |
| Latencia boundary med / typing p95 | 21,2 ms / 103,5 ms | 23,7 ms / 87,4 ms | 26,6 ms / 87,2 ms | 20,2 ms / 80,0 ms |
| Safety checks (28) / Russian drift | 0 unsafe / 0 drift | 0 unsafe / 0 drift | 0 unsafe / 0 drift | 0 unsafe / 0 drift |

## Requisitos de hardware

- VRAM estimada para inferencia: los GGUF publicados pesan 3,845 GB cada uno en Q6_K; con overhead de contexto y KV cache, se recomienda al menos 5-6 GB de VRAM para ejecución en GPU.
- GPU recomendadas: tarjetas de consumo con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) son suficientes para el archivo Q6_K; en entornos profesionales, A100 y H100 quedan sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM; también puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (versión de referencia `v1.0.0` en las pruebas del autor), Ollama y cualquier runtime compatible con GGUF; el autor lo integra en la aplicación LokalBot.
- Latencia y throughput estimados: sobre Apple M4 Max con llama.cpp, mediana de 20,2 ms en límite de palabra y p95 de 80,0 ms en escritura para v4; v3 y v2 presentan latencias ligeramente superiores (26,6 ms y 23,7 ms de mediana respectivamente). No se reporta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Gemma-4-E2B-LokalBot (v4) | ~4,65 B | no disponible | Autocompletado bilingüe EN/SR en dispositivo | Apache 2.0 | GGUF en Hugging Face |
| gemma-4-E2B (stock) | ~4,65 B | no disponible | Modelo base generalista | Apache 2.0 (según base) | Hugging Face |
| Gemma-4-E2B-LokalBot (v3) | ~4,65 B | no disponible | Igual que v4, con mayor recall | Apache 2.0 | GGUF en Hugging Face |
| Otros modelos de autocompletado pequeños | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es contra el propio modelo base stock: v4 iguala o supera al stock en todos los pilares de evaluación reportados, con menor latencia (20,2 ms frente a 21,2 ms de mediana) y mayor precisión en Email (80,0% frente a 74,3%). No se dispone de comparaciones con otros modelos de autocompletado de la competencia en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en autocompletado de texto corto; no debe emplearse como modelo de razonamiento general, generación long-form ni agentes multi-paso.
- Riesgo de alucinación en sugerencias de continuación, especialmente en prompts cortos o ambiguos; el autor reporta abstenciones conservadoras en memoria (24/26 en v3) pero no elimina el riesgo.
- Cobertura de idiomas limitada: el fine-tuning se centra en inglés y serbio; alemán, francés y español figuran como soportados pero no se detallan métricas específicas para ellos.
- El equilibrio precisión-cobertura es un compromiso explícito: v3 incrementa las sugerencias correctas pero también las incorrectas mostradas (220 frente a 181 del stock).
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/gemma-4-E2B` antes de redistribuir.
- Las métricas publicadas son del propio autor, sobre hardware concreto (Apple M4 Max) y con las puertas de producción de LokalBot; no son directamente extrapolables a otros entornos.
- Longitud de contexto no documentada; no se recomienda su uso en escenarios que requieran ventanas largas sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stevyhacker/Gemma-4-E2B-LokalBot-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Repositorio de LokalBot: https://github.com/stevyhacker/LokalBot
