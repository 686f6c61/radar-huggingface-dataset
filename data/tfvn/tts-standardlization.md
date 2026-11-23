# tfvn/TTS-standardlization

## Resumen

teencode-normalizer v3 es un modelo encoder-decoder de tipo Transformer seq2seq desarrollado por tfvn (usuario de Hugging Face) que convierte texto informal vietnamita —abreviaturas, falta de tonos, jerga y pronombres acortados conocidos como *teencode*— en vietnamita estándar. El modelo resuelve un problema muy concreto de preprocesado lingüístico: el texto de chats y redes sociales vietnamitas es ruidoso y difícil de procesar por pipelines de NLP, TTS o motores de búsqueda, y este modelo lo normaliza de forma determinista sin generar contenido nuevo.

Con aproximadamente 19,94 millones de parámetros, 8 capas de encoder y 4 de decoder, dimensión 256 y un tokenizador BPE compartido de 8.000 tokens, es un modelo deliberadamente pequeño. Su repo ocupa 0,1 GB y la versión INT8 pesa unos 20,8 MB, lo que permite ejecutarlo en hardware de borde como una Raspberry Pi 4 con ONNX Runtime. Emplea atención pre-LayerNorm y una longitud máxima de 192 tokens.

Es relevante porque demuestra que una tarea de normalización lingüística acotada no requiere modelos de miles de millones de parámetros: con un diseño seq2seq compacto, decodificación beam 4 con una guarda de alineamiento de palabras y cuantización INT8, alcanza un CER del 2,08 % en el conjunto de test original de teencode. La licencia MIT facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq encoder-decoder, pre-LayerNorm |
| Parámetros totales | 19.935.040 (~19,94 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens (máximo de entrada/salida) |
| Tipos de cuantización | INT8 dinámica (ONNX); pesos PyTorch en FP16; evaluación también en BF16 y FP32 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, solo pesos), ONNX (encoder.int8.onnx, decoder.int8.onnx), tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un Transformer seq2seq con pre-LayerNorm compuesto por 8 capas de encoder y 4 de decoder, dimensión de modelo 256, 8 cabezas de atención, dimensión feed-forward de 1536 y dropout de 0,1. Utiliza un tokenizador BPE compartido de 8.000 tokens con normalización NFC y una longitud máxima de 192 tokens; los identificadores especiales son PAD 0, BOS 1, EOS 2 y UNK 3. La exportación a ONNX es INT8 con cuantización dinámica y sin caché KV, lo que simplifica el despliegue pero implica recómputo del decoder en cada paso.

El entrenamiento se realizó en PyTorch con autocast BF16, optimizador AdamW y schedule coseno. El modelo v3 se obtuvo a partir de un modelo v2 más pequeño mediante inicialización que preserva la función (*function-preserving initialization*), y el checkpoint seleccionado es el paso 13.000, elegido por el mejor CER combinado en dev. La decodificación recomendada es beam 4 con una guarda de alineamiento de palabras (`guard.json`) que corrige posibles palabras malformadas. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset, aunque los conjuntos de evaluación se describen como pares sintéticos de teencode vietnamita.

## Capacidades

- Normalización de texto vietnamita informal (teencode) a vietnamita estándar: expansión de abreviaturas, restauración de tonos, resolución de jerga y pronombres acortados.
- Generación texto-a-texto seq2seq con tokenizador BPE compartido y control de longitud (máximo 192 tokens).
- Reescritura determinista orientada a normalización; no es un modelo generativo de propósito general.
- Ejecución en hardware de borde mediante ONNX Runtime (Raspberry Pi 4 y similares).
- Inferencia en dos modos: runner en Rust con beam 4 + guarda (recomendado) y ejemplo en Python con decodificación greedy sin guarda.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido (no disponible / fuera de alcance).
- Capacidad multilingüe limitada al vietnamita.

## Casos de uso

- Preprocesado de texto para búsqueda: normalizar consultas y documentos de chats o redes sociales antes de indexar, de modo que "c oi, e nho c qua" y "chị ơi, em nhớ chị quá" se traten como equivalentes y mejore el recall del motor de búsqueda.
- Entrada para pipelines de NLP: limpiar corpus vietnamitas ruidosos antes de tareas de etiquetado, análisis de sentimiento o clasificación, reduciendo la dispersión léxica causada por el teencode.
- Síntesis de voz (TTS): convertir texto informal en vietnamita estándar con tonos correctos antes de pasarlo a un motor TTS, evitando pronunciaciones erróneas por falta de diacríticos.
- Moderación y visualización de contenido: mostrar mensajes de usuario en formato estándar en interfaces de chat o paneles de moderación, sin filtrar ni censurar (el modelo reescribe, no filtra).
- Despliegue en dispositivo de borde: servicio HTTP `POST /normalize` en una Raspberry Pi 4 con la imagen Docker del repositorio, útil para normalizar localmente sin enviar texto a la nube.
- Ajuste fino para dominios específicos: partir de los pesos safetensors (FP16) y la clase `Seq2Seq` del repositorio para adaptar el modelo a jergas de un sector concreto mediante `--init-from`.
- Investigación en normalización lingüística: servir como línea base compacta para experimentos de normalización de texto informal en lenguas de bajos recursos.

## Benchmarks y rendimiento

Resultados declarados por el autor (CER, menor es mejor; beam 4 + guarda):

| Conjunto de test | v2 | v3 INT8 | v3 BF16 | v3 FP32 |
|---|---|---|---|---|
| Teencode original (999) | 2,92 % | 2,08 % | 2,05 % | 2,03 % |
| Sin tonos (986) | 12,38 % | 11,19 % | 11,37 % | 11,31 % |
| Contexto (803, en distribución) | 11,93 % | 0,35 % | 0,23 % | 0,22 % |
| Difícil (1.251, solo evaluación) | 10,96 % | 4,95 % | 4,84 % | 4,85 % |
| Difícil: abreviaturas ambiguas | 13,59 % | 8,09 % | 7,94 % | 7,94 % |
| Difícil: pares de pronombres | 9,45 % | 2,34 % | 2,22 % | 2,24 % |
| Difícil: contexto sin tonos | 10,04 % | 6,20 % | 6,22 % | 6,22 % |

El autor advierte que el conjunto de contexto proviene del mismo generador que los datos de entrenamiento, por lo que su resultado es optimista; el conjunto difícil, sin solapamiento con el entrenamiento, es la medida más justa. La cuantización INT8 apenas degrada el CER frente a BF16/FP32 (diferencias de centésimas).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en INT8 (modelo de ~20,8 MB más estados de inferencia); muy por debajo de cualquier GPU moderna.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (RTX 4090, RTX 3060, etc.) lo ejecuta con holgura, pero el caso de uso previsto es CPU.
- ¿Cabe en GPU consumer? Sí, en todas; también en CPU de escritorio, móvil y Raspberry Pi 4 (objetivo declarado del autor).
- Opciones de despliegue: ONNX Runtime (Python y Rust), runner Rust con beam 4 + guarda, imagen Docker para Raspberry Pi con endpoint HTTP `POST /normalize`; pesos PyTorch para reentrenamiento o reexportación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teencode-normalizer v3 (tfvn) | ~19,94 M | 192 tokens | Normalización de teencode vietnamita | MIT | Hugging Face + GitHub, ONNX INT8 y safetensors |
| Modelos seq2seq genéricos tipo T5/mBART pequeños | no disponible | no disponible | Traducción/generación multilingüe | según modelo | Hugging Face |
| Modelos de traducción vi generalistas | no disponible | no disponible | Traducción entre idiomas | según modelo | Hugging Face |

No se dispone en la información proporcionada de modelos directamente comparables en la tarea específica de normalización de teencode vietnamita con métricas equivalentes; la comparativa con alternativas genéricas queda como referencia cualitativa.

## Limitaciones y advertencias

- Sesgos: al entrenarse con pares sintéticos, puede no cubrir toda la variabilidad real del teencode vietnamita; el rendimiento en jerga no vista puede degradarse.
- Riesgo de alucinación: bajo en el sentido generativo, pero puede producir reescrituras incorrectas o palabras malformadas; el autor recomienda beam 4 + guarda para mitigarlo (la decodificación greedy puede generar palabras malformadas).
- Limitaciones de idioma: solo vietnamita; no traduce a otros idiomas.
- Limitación de contexto: máximo 192 tokens, insuficiente para documentos largos; requiere segmentación previa.
- Restricciones de licencia: MIT permite uso comercial, pero conviene conservar el aviso de copyright.
- Caveats de producción: el conjunto de contexto da resultados optimistas (en distribución); usar el conjunto difícil como referencia realista. El CER del 11,19 % en texto sin tonos indica que la restauración de diacríticos sigue siendo el punto débil. La exportación ONNX no usa caché KV, lo que puede afectar la latencia en secuencias largas. El modelo reescribe, no filtra: no debe usarse para moderación de contenido.

## Enlaces

- Hugging Face: https://huggingface.co/tfvn/TTS-standardlization
- Repositorio GitHub (preparación de datos e inferencia en Rust, servidor HTTP, entrenamiento en Python, Docker para Raspberry Pi, Colab): https://github.com/femboyvn/TFVN-TTS-standardlization
