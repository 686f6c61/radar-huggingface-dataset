# udgamlabs/Vemana-Base-GGUF

## Resumen

Vemana-Base-GGUF es la versión cuantizada en formato GGUF de Vemana-Base, un modelo lingüístico de 278 millones de parámetros entrenado desde cero en idioma telugu por Udgam Labs, un laboratorio de investigación independiente. Se trata de un modelo base (no instruct): su función es continuar texto en telugu, no seguir instrucciones. Su relevancia radica en la escasez de modelos pequeños abiertos entrenados específicamente para telugu, una lengua con cientos de millones de hablantes pero poco representada en los LLM generalistas.

El repositorio incluye dos cuantizaciones (Q8_0 y F16) listas para ejecutarse con llama.cpp, e incluso directamente en el navegador mediante llama.cpp compilado a WebAssembly con la librería wllama, sin que el texto salga del dispositivo. La conversión ha sido verificada contra el modelo original en transformers, con perplejidad prácticamente idéntica (15.764 frente a 15.765 en Q8_0) y tokenización idéntica en 40 páginas de Wikipedia en telugu.

La longitud de contexto entrenada es de 1.024 tokens, un valor modesto pero coherente con el objetivo: un modelo ligero, verificable y desplegable en hardware mínimo para tareas de generación de texto en telugu.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa (tipo Gemma según el conversor de llama.cpp) |
| Parámetros totales | 278.214.226 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento) |
| Tipos de cuantización | Q8_0 (297 MB) y F16 (558 MB) |
| Idiomas soportados | Telugu (te) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (derivado de safetensors en el modelo base) |

## Arquitectura y entrenamiento

Vemana-Base es un transformer decoder-only entrenado desde cero sobre corpus de telugu. Según la información del repositorio, utiliza atención completa en todas las capas (sin ventanas deslizantes), lo que obligó a un ajuste de metadatos en la conversión a GGUF: el código de Gemma de llama.cpp exige al menos una capa con sliding-window, por lo que la capa 0 se marca como deslizante con una ventana de 4.096 tokens (mayor que todo el contexto), sin alterar el cálculo real. El tokenizador se almacena como modelo SentencePiece propio de Vemana.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO (coherente con su naturaleza de modelo base). Los créditos de los datos de entrenamiento están en el archivo `NOTICE` del repositorio. El modelo fue entrenado con una longitud de secuencia de 1.024 tokens.

## Capacidades

- Continuación de texto en telugu: genera texto coherente a partir de un prompt en telugu, con muestreo configurable (temperatura, top-p).
- No sigue instrucciones: es un modelo base, no alineado; no es adecuado para chat o asistentes sin un ajuste posterior.
- Tokenización fiel del telugu: SentencePiece propio, verificado como idéntico al original en 40 páginas de Wikipedia en telugu.
- Ejecución local y en navegador: funciona con llama.cpp y con wllama (WebAssembly), permitiendo inferencia 100 % en el dispositivo.
- No dispone de tool calling, capacidades de agente, visión ni audio; no se ha anunciado soporte multilingüe más allá del telugu.

## Casos de uso

- Autocompletado de texto en telugu: integrado en editores o aplicaciones de escritura, el modelo continúa frases y párrafos en telugu con latencias bajas gracias a su tamaño de 278M.
- Demostraciones de IA local en el navegador: puede cargarse en una página web con wllama y ejecutarse íntegramente en el dispositivo del usuario, útil para educación, privacidad o entornos sin conexión.
- Investigación en NLP para lenguas de bajos recursos: base ideal para experimentos de fine-tuning (SFT, DPO) orientados a telugu, partiendo de pesos abiertos bajo Apache-2.0.
- Prototipado en hardware modesto: con 297 MB en Q8_0, cabe en portátiles sin GPU dedicada, Raspberry Pi o móviles, para tareas de generación de texto simple.
- Generación de contenido literario o creativo en telugu: con muestreo a temperatura 0,8 y top-p 0,95, puede usarse como ayuda creativa para redacción de poesía o prosa (el nombre rinde homenaje al poeta telugu Vemana).
- Base para clasificadores y extractores: como modelo base ligero, puede afinarse para tareas de etiquetado, resumen extractivo o corrección ortográfica en telugu.
- Evaluación de cuantizaciones: el repositorio documenta la verificación F16/Q8_0 contra el original, lo que lo hace útil como caso de estudio de conversión GGUF de modelos no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato cuantitativo publicado es de verificación de la conversión, medido por los propios autores el 27 de octubre de 2026:

| Métrica | Original (transformers, fp32) | F16 | Q8_0 |
|---|---|---|---|
| Perplejidad (4.080 tokens) | 15.764 | 15.764 | 15.765 |
| Tokenización (40 páginas Wikipedia te) | idéntica | idéntica | idéntica |
| Continuaciones greedy (4 prompts, 40 tokens) | referencia | idénticas en 4/4 | idénticas en 3/4 |

## Requisitos de hardware

- VRAM/memoria estimada: 297 MB para Q8_0 y 558 MB para F16, más overhead de contexto; ejecutable sin GPU en CPU convencional.
- GPU recomendadas: no requiere GPU; cualquier hardware moderno es suficiente dado el tamaño.
- Consumer GPU: sobrado; cabe con holgura en cualquier GPU desde niveles de entrada (incluso integradas), aunque la ejecución en CPU o navegador es el caso de uso principal.
- Despliegue: llama.cpp (comando `llama-completion`), wllama en navegador (WebAssembly), y en teoría cualquier runtime GGUF. Ollama y LM Studio no fueron probados por los autores. No consta soporte verificado en vLLM ni TGI.
- Rendimiento: aproximadamente 100 tokens/segundo en un Mac mini con Chromium usando wllama en el navegador, según datos de los autores. No hay cifras para CPU/GPU nativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vemana-Base-GGUF | 278M | 1.024 | Telugu | Apache-2.0 | GGUF (Q8_0, F16), navegador |
| Sarvam AI modelos pequeños (p. ej. Sarvam-1) | 4B (no comparable en tamaño) | no disponible | Multilingüe indio (incl. telugu) | no disponible | HF |
| Airavata / modelos indicos instruct | no disponible | no disponible | Multilingüe indio | no disponible | no disponible |

Nota: existen pocos modelos abiertos entrenados desde cero exclusivamente para telugu en el rango de cientos de millones de parámetros; la mayoría de alternativas (Sarvam, Krutrim, Airavata) son modelos multilingües indios de varios miles de millones de parámetros y naturaleza instruct, por lo que la comparación directa de benchmarks no es posible con los datos disponibles.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni está alineado; usarlo como chatbot producirá resultados pobres sin fine-tuning posterior.
- Contexto muy corto: 1.024 tokens entrenados; prompt y salida deben caber en esa ventana.
- Monolingüe: diseñado para telugu; el rendimiento en otros idiomas no está garantizado ni evaluado.
- Riesgo de alucinación y sesgos: al ser un modelo base pequeño entrenado con datos públicos (créditos en `NOTICE`), puede reproducir sesgos del corpus y generar contenido inexacto; no se han publicado evaluaciones de sesgo o seguridad.
- Cuantización Q8_0: una de las cuatro continuaciones greedy verificadas difiere del original tras unas palabras por redondeo de 8 bits; irrelevante en la práctica, pero relevante para reproducción exacta.
- Ollama y LM Studio no fueron probados por los autores; el comportamiento en esos runtimes no está verificado.
- Licencia Apache-2.0: permite uso comercial, pero los créditos de datos de entrenamiento en `NOTICE` deben revisarse para cumplir atribuciones.

## Enlaces

- Modelo GGUF: https://huggingface.co/udgamlabs/Vemana-Base-GGUF
- Modelo base (Vemana-Base): https://huggingface.co/udgamlabs/Vemana-Base
- Demo en navegador: https://udgamlabs.com/models/vemana#try
- Repositorio con scripts: https://github.com/udgamlabs/vemana
- wllama (runtime WebAssembly usado): https://github.com/ngxson/wllama
- Web de Udgam Labs: https://udgamlabs.com
