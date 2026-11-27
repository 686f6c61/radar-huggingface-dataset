# yukidaruma1/haruharurim-nano2-transformer

## Resumen

HaruharuRIM Nano2 Transformer (Nano2T v2) es un modelo de lenguaje de generación de texto en japonés desarrollado por el autor independiente yukidaruma1, bajo el nombre público Haruharu Television Group. Se trata de la versión Transformer del modelo Nano2 de su serie HaruharuRIM, que sustituye la arquitectura GRU original por un transformer decoder-only manteniendo la misma política de datos. Con 5.464.320 parámetros, es un modelo experimental de escala muy reducida, orientado a conversación cotidiana y preguntas sencillas en japonés.

El modelo fue entrenado el 19 de noviembre de 2026 y estuvo operativo como API de chat hasta su retirada el 24 de noviembre de 2026, cuando fue reemplazado por la serie Mame1. El repositorio publicado es un archivo de los pesos que estuvieron en producción, verificados byte a byte contra el binario del servidor. Su filosofía declarada es la de un "modelo mínimo criado como persona, no como asistente": no finge ser humano, admite cuando no sabe algo y rechaza peticiones peligrosas, rasgos inculcados mediante datos sintéticos.

Su relevancia es fundamentalmente didáctica y de investigación: documenta con transparencia el proceso completo de un modelo japonés extremadamente pequeño, con tokenizador propio de 2.321 tokens, contexto de 512 posiciones y licencia SSPL-1.0, lo que lo convierte en un caso de estudio sobre modelos de lenguaje a escala de juguete y sobre las implicaciones de licencias copyleft a nivel de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (pre-LN, GELU, embeddings posicionales aprendidos, weight tying entre embedding y capa de salida) |
| Parametros totales | 5.464.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 posiciones maximas |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | japones (ja) |
| Licencia | SSPL-1.0 (Server Side Public License) |
| Formato de pesos | safetensors (fp32, 76 tensores) y npz (fp32, original con metadatos de epoch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con d_model de 256, 8 cabezas de atención, dimensión feed-forward de 1024 y normalización pre-LN con activación GELU. Emplea embeddings posicionales aprendidos y comparte los pesos de la capa de salida con el embedding de entrada. El tokenizador es propio y no basado en BPE: un esquema de coincidencia más larga sobre caracteres y frases con un vocabulario de 2.321 tokens (`vocab2.json`), lo que limita estrictamente el conjunto de símbolos que el modelo puede procesar.

El entrenamiento se realizó durante 150 epochs en GPU de Kaggle, con una pérdida final de 1.590. Los datos combinan un flujo de tokens limpio de 995.513 tokens construido a partir de frases japonesas de Tatoeba (CC BY 2.0 FR) y un conjunto de datos sintéticos propio que cubre personalidad y autoconciencia, conversación diaria, nociones básicas de la Ley de Normas Laborales japonesa, seguridad en química orgánica y sustancias tóxicas (incluyendo rechazo a peticiones de síntesis peligrosa), lectura de fórmulas químicas y comprensión de documentos tipo memorándum. No se incluyó ningún dato personal. No se documenta uso de RLHF, DPO ni ninguna otra fase de alineación posterior al preentrenamiento supervisado.

## Capacidades

- Generación de texto en japonés para conversación cotidiana y preguntas simples.
- Persona definida: se identifica como modelo de lenguaje, no finge ser humano y declara desconocimiento ante información que no posee.
- Respuestas sobre conceptos básicos de la Ley de Normas Laborales japonesa (por ejemplo, límites de horas extra).
- Nociones de seguridad química: lectura de fórmulas y rechazo explícito a instrucciones de fabricación peligrosa.
- Lectura de documentos tipo memorándum mediante el formato `<ctx>documento</ctx><q>pregunta<a>`, con capacidad limitada.
- Generación greedy (argmax) con parada en el token 0 y máximo de 80 tokens.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Demostración educativa de arquitectura transformer: el repositorio incluye implementación en PyTorch (`model.py`) y núcleo de inferencia en numpy (`nano2_transformer.py`), lo que permite estudiar el funcionamiento interno de un transformer completo con solo 5,5 millones de parámetros.
- Prueba de concepto de tokenizadores por coincidencia más larga: sirve para comparar empíricamente este esquema frente a BPE en un vocabulario japonés de 2.321 tokens.
- Chatbot de conversación trivial en japonés para entornos de prueba: responde a preguntas cotidianas y admite desconocimiento, adecuado para validar pipelines de despliegue sin coste de cómputo.
- Simulación de políticas de rechazo seguro: útil para estudiar cómo se comporta un modelo entrenado con datos sintéticos para declinar peticiones de síntesis química peligrosa.
- Extracción de datos de memorándums simples: el modo `ask_memo` permite experimentar con lectura de documentos cortos, asumiendo sus limitaciones conocidas.
- Referencia de archivo histórico: al ser un modelo retirado de producción con pesos verificados por MD5, sirve para reproducir el comportamiento exacto de un servicio pasado en tareas de auditoría o investigación de regresiones.
- Base para experimentos de destilación o ajuste fino a muy pequeña escala: su tamaño permite entrenar variantes en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (5,46 millones de parámetros × 4 bytes ≈ 22 MB de pesos, más activaciones y vocabulario), por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; también funciona en CPU sin problema.
- Cabe en GPU de consumo: sí, en todas; incluso en sistemas embebidos o Raspberry Pi.
- Opciones de despliegue: inferencia nativa con numpy (`nano2_transformer.py`) o PyTorch (`model.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el tokenizador y el formato son propios.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos en CPU y generación de 80 tokens prácticamente instantánea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaruharuRIM Nano2 Transformer | 5,46 M | 512 | ja | SSPL-1.0 | Hugging Face |
| HaruharuRIM Nano2 (GRU) | no disponible | no disponible | ja | no disponible | misma serie, no detallado en la informacion |
| Modelos japoneses pequeños de referencia (p. ej. series de menos de 100 M) | no disponible | no disponible | ja | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo experimental de aproximadamente 5,5 millones de parámetros: carece de la generalidad y precisión de los modelos de lenguaje de gran escala.
- Riesgo alto de respuestas incoherentes o factualmente incorrectas; no sustituye asesoramiento profesional de ningún tipo.
- Errores ortográficos documentados en kanji, como la omisión de caracteres en términos compuestos (por ejemplo, "三六協定" generado como "三協定").
- La lectura de documentos es deficiente y puede generar contenido que no aparece en el texto fuente.
- Vocabulario cerrado de 2.321 tokens: no puede procesar caracteres o palabras fuera de ese conjunto.
- Solo japonés; no soporta otros idiomas.
- La licencia SSPL-1.0 impone obligaciones copyleft que se extienden a la prestación del servicio a través de red, lo que puede condicionar su uso comercial o como API; es necesario revisar el texto completo de la licencia antes de cualquier despliegue.
- Contexto máximo de 512 posiciones, insuficiente para conversaciones o documentos largos.
- Modelo retirado de producción y sin mantenimiento activo por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/yukidaruma1/haruharurim-nano2-transformer
- Licencia SSPL-1.0 (SPDX): https://spdx.org/licenses/SSPL-1.0.html
- Tatoeba (fuente de datos): https://tatoeba.org
