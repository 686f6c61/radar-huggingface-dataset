# Vzdorrr/Nocta-Gemma-4-E4B-abliterated-GGUF

## Resumen

Nocta-Gemma-4-E4B-abliterated-GGUF es una recuantización en formato GGUF del modelo Gemma 4 E4B en su variante abliterated (sin rechazos), publicada por el usuario Vzdorrr para la aplicación de acompañamiento en dispositivo Nocta. Parte de los pesos QAT (quantization-aware training) de `google/gemma-4-E4B-it`, pasados por el proceso de abliteración de huihui-ai, y se recuantizan con una matriz de importancia (imatrix) para obtener un GGUF Q4_0 más pequeño y rápido que el Q4_K_M habitual sin degradar la calidad de chat.

El objetivo declarado es doble: reducir el peso en disco y memoria frente a las cuantizaciones estándar (4,16 GB frente a 6,29 GB del Q4_K_M con proyector de visión) y mantener la calidad conversacional, medida con un banco de pruebas propio de 30 turnos. La receta aplica Q4_0 al conjunto del modelo, Q2_K a las tablas de embedding por capa (`per_layer_token_embd`, unos 2.820 millones de parámetros según la model card) y Q8_0 al proyector de visión.

Es relevante para desarrolladores que necesiten un modelo multimodal pequeño, sin censura y ejecutable en hardware de consumo o en dispositivos ARM, con licencia Apache 2.0. Conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que la cifra de parámetros totales reportada en safetensors (478.088.384) no cuadra con los 2.820 millones de parámetros de embedding que menciona la propia model card, por lo que debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B), con proyector de visión separado; detalles de atención no disponibles |
| Parametros totales | 478.088.384 según safetensors; la model card cita 2.820 millones solo en `per_layer_token_embd` (dato inconsistente, ver limitaciones) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens en las mediciones publicadas (ventana máxima no disponible) |
| Tipos de cuantizacion | GGUF Q4_0 con imatrix (modelo principal), Q2_K para `per_layer_token_embd`, Q4_0 para `token_embd`; proyector de visión en Q8_0 |
| Idiomas soportados | no disponible oficialmente; la calibración imatrix usó textos en ru, en, zh, es, fr, pt y de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 E4B en su variante instruct, con pesos entrenados con quantization-aware training (QAT) a Q4_0 por Google. Sobre esa base, huihui-ai aplicó abliteración, una técnica que elimina la dirección de rechazo en el espacio de activaciones para que el modelo deje de negarse a responder. Vzdorrr recuantiza después esos pesos BF16 con `llama-imatrix` y `llama-quantize`, usando un corpus de calibración compuesto por diálogos de rol y prompts de estilo aplicación en siete idiomas (ruso, inglés, chino, español, francés, portugués y alemán) con contexto de 512 tokens.

La innovación técnica principal es la asignación selectiva de precisión: las tablas de embedding por capa (`per_layer_token_embd`) se cuantizan a Q2_K porque son búsquedas directas y su degradación afecta poco a la calidad de chat, mientras que el resto del modelo va a Q4_0 para coincidir con el entrenamiento QAT y aprovechar los kernels rápidos de ARM. El proyector de visión se mantiene en Q8_0 partiendo de BF16. No hay información sobre el volumen de tokens de entrenamiento original, la composición del dataset de Gemma 4 ni si hubo RLHF o DPO; esos datos corresponden a la model card de Google, no incluida en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogos de rol con memoria de contexto y persona.
- Comprensión de imágenes mediante el proyector de visión (`mmproj`), con pipeline `image-text-to-text`.
- Modo sin rechazos (abliterated): no aplica las negativas alineadas del modelo original.
- Multilingüismo derivado de Gemma 4 y reforzado en calibración para ruso, inglés, chino, español, francés, portugués y alemán.
- Soporte de formato de chat instruct (variante `-it`).
- No hay información disponible sobre tool calling, function calling, razonamiento multi-paso, modo thinking ni capacidades de audio.

## Casos de uso

- Aplicación de acompañamiento en dispositivo: es el caso para el que se creó (app Nocta); el tamaño de 4,16 GB con visión y los 32 tok/s de generación en un Mac M5 Pro permiten ejecución local sin GPU dedicada.
- Diálogos de rol persistentes: el banco de pruebas del autor es precisamente un diálogo de 30 turnos con memoria, persona y comprobaciones de formato, lo que valida el modelo para este escenario con contexto de 8192 tokens.
- Asistente personal offline con entrada de imágenes: el proyector Q8_0 permite describir o interpretar capturas y fotos en local, sin enviar datos a la nube.
- Prototipado de aplicaciones multimodales en ARM: los kernels Q4_0 están optimizados para ARM, lo que facilita desplegar en portátiles Apple Silicon, dispositivos Android de gama alta o placas SBC.
- Investigación sobre alineación y abliteración: al ser una variante sin rechazos con licencia Apache 2.0, sirve para estudiar el comportamiento del modelo ante prompts que el original rechazaría, en entornos controlados.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones o narrativa interactiva donde las negativas del modelo base resultan un obstáculo.
- Evaluación comparativa de cuantizaciones: la model card publica KL frente a BF16 y un bench propio, útil como referencia para decidir entre Q4_0 imatrix y Q4_K_M.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (llama.cpp, Mac M5 Pro CPU, contexto 8192):

| Modelo | Tamano (modelo + vision) | KL vs BF16 | Bench (0-100) | Gen / prefill (tok/s) |
|---|---|---|---|---|
| mradermacher Q4_K_M + mmproj f16 | 6,29 GB | 0,052 | 84 | 27 / 90 |
| Nocta Q4_0 imatrix + mmproj Q8_0 | 4,16 GB | 0,077 | 86 (6 semillas) | 32 / 102 |

El banco de pruebas es un diálogo de rol en ruso de 30 turnos con memoria, persona, robustez, visión, sondas sí/no y comprobaciones de formato. La divergencia KL aumenta (0,077 frente a 0,052), pero la puntuación del bench no baja. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: unos 4,16 GB para modelo más proyector de visión en Q4_0/Q8_0; el archivo principal pesa 3,60 GB y el `mmproj` 0,56 GB.
- Cabe en GPU de consumo con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2060 de 6 GB); con 8 GB hay margen para contexto amplio.
- Ejecutable en CPU y en Apple Silicon: las mediciones del autor son en Mac M5 Pro solo con CPU, con 32 tok/s de generación y 102 tok/s de prefill a contexto 8192.
- Despliegue mediante llama.cpp (formato nativo GGUF); compatible con frontends que consuman GGUF como Ollama o LM Studio, aunque no se documenta una receta específica.
- GPU de datacenter (A100, H100) no son necesarias para este tamaño; el modelo está pensado para inferencia en dispositivo.
- Latencia y throughput en otras plataformas no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Nocta-Gemma-4-E4B-abliterated (este) | 478 M según safetensors (inconsistente) | 8192 en pruebas | Q4_0 imatrix + Q2_K PLE | 4,16 GB con visión | Apache 2.0 | Abliterated, bench propio 86 |
| mradermacher Q4_K_M del mismo base | mismo base | no disponible | Q4_K_M + mmproj f16 | 6,29 GB con visión | Apache 2.0 | Bench 84, KL 0,052 |
| huihui-ai Huihui-gemma-4-E4B-it-qat-q4_0-unquantized-abliterated | mismo base | no disponible | BF16 (sin cuantizar) | no disponible | Apache 2.0 | Modelo base de esta recuantización |
| google/gemma-4-E4B-it | mismo base | no disponible | QAT Q4_0 original | no disponible | Gemma license (no Apache 2.0) | Modelo original con alineación intacta |

No hay datos de benchmarks estándar para comparar con otros modelos pequeños multimodales de la misma categoría; la comparación disponible se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Inconsistencia en el recuento de parámetros: safetensors reporta 478.088.384, mientras que la model card habla de 2.820 millones solo en embeddings por capa. Verificar antes de dimensionar despliegues.
- Modelo abliterated: se han eliminado los rechazos, por lo que puede generar contenido dañino, ofensivo o inexacto sin filtro; requiere moderación externa en producción.
- Riesgo de alucinación propio de un modelo pequeño, agravado por la cuantización Q2_K en las tablas de embedding y por la pérdida de fidelidad frente a BF16 (KL 0,077).
- La cuantización Q4_0 con imatrix está calibrada con diálogos de rol en siete idiomas; el rendimiento en otros dominios (código, matemáticas, texto técnico) no está medido.
- Idiomas oficialmente soportados no disponibles; el multilingüismo se infiere de la calibración, no de una evaluación publicada.
- Repositorio sin descargas ni validación de la comunidad (0 descargas, 0 likes); no hay garantía de mantenimiento ni de integridad de los pesos más allá de lo que declara el autor.
- Aunque la licencia es Apache 2.0, el modelo deriva de Gemma 4, cuyos términos originales de Google pueden imponer restricciones adicionales al uso comercial; conviene revisar la licencia de Gemma antes de desplegar.
- Sin información sobre tool calling ni agentes; no asumir soporte de function calling en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vzdorrr/Nocta-Gemma-4-E4B-abliterated-GGUF
- Modelo base (huihui-ai, abliterated): https://huggingface.co/huihui-ai/Huihui-gemma-4-E4B-it-qat-q4_0-unquantized-abliterated-GGUF
- Modelo original (Google): https://huggingface.co/google/gemma-4-E4B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
