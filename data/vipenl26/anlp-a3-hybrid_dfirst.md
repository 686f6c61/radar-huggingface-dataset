# vipenl26/anlp-a3-hybrid_dfirst

## Resumen

`anlp-a3-hybrid_dfirst` es un modelo de secuencia decoder-only de 3.876.672 parámetros entrenado desde cero en PyTorch por el usuario vipenl26 para la asignación 3 (Parte A) del curso ANLP Monsoon 2026. Se trata de un experimento académico de descifrado de un cifrado de flujo determinista condicionado por el prefijo del texto plano, formateado como prefix LM sobre la secuencia `[BOS] ciphertext [SEP] plaintext [EOS]`. No es un modelo de propósito general ni está pensado para uso en producción.

La arquitectura, etiquetada como `hybrid_dfirst`, emplea 10 capas con dimensión de modelo de 256 y una longitud máxima de secuencia de 256 tokens. El entrenamiento se realizó sobre el dataset revisado `data_new` (publicado el 11 de noviembre de 2026) con 200.000 pares y 2 épocas, alcanzando una precisión de token de validación de 0,8285. La relevancia del modelo es puramente didáctica: documenta los límites de los modelos de secuencia pequeños en tareas de descifrado, mostrando que recuperan correctamente solo textos planos vistos en entrenamiento y fallan en la decodificación completa de secuencias no vistas.

El repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que los pesos no están publicados o el repo está vacío en el momento de la consulta. La model card advierte explícitamente de que ninguno de estos modelos de ~4M de parámetros descifra por completo un texto plano no visto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `hybrid_dfirst` decoder-only (implementación propia en PyTorch, sin `mamba-ssm` ni `fla`) |
| Parametros totales | 3.876.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; la carga se hace vía `part1.hf_utils.load_checkpoint`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas con `d_model = 256` y una longitud máxima de secuencia de 256 tokens, etiquetado por el autor como `hybrid_dfirst`. La implementación es desde cero en PyTorch, sin depender de librerías de modelos de estado (SSM) como `mamba-ssm` o `fla`. Se entrena como prefix LM: la secuencia de entrada es `[BOS] ciphertext [SEP] plaintext [EOS]` y la pérdida se calcula únicamente sobre el span del texto plano. El modelo incorpora condicionamiento por cifrado (`cipher conditioning: real`).

El entrenamiento usa el dataset revisado `data_new` (liberado el 11-11-2026), con pares que cumplen `len(cipher) + len(plain) <= 253`, 200.000 pares durante 2 épocas, con tasa de aprendizaje 0,001. El cómputo analítico declarado es de 2.253.477.202 FLOPs por secuencia de 256 tokens. No se especifica la composición del dataset, el número total de tokens procesados ni si hubo RLHF/DPO. La model card señala que el cifrado es un cifrado de flujo determinista con clave derivada del prefijo del texto plano, y que al eliminar los 18 símbolos de puntuación nulos el cifrado se alinea 1:1 con el texto plano.

## Capacidades

- Descifrado de secuencias de cifrado de flujo deterministas condicionadas por el prefijo del texto plano, en el formato `[BOS] ciphertext [SEP] plaintext [EOS]`.
- Generación de texto plano condicionada al cifrado de entrada (prefix LM con pérdida solo en el span de plaintext).
- Recuperación casi perfecta de los primeros caracteres de una secuencia.
- Recuperación exacta de textos planos que aparecen en el conjunto de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües documentadas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia y evaluación de arquitecturas de secuencia: el modelo sirve como referencia reproducible para comparar implementaciones propias de transformers decoder-only en tareas de descifrado, con métricas declaradas (precisión de token 0,8285) y coste computacional conocido (2,25 GFLOPs por secuencia de 256 tokens).
- Análisis de límites de generalización: permite estudiar empíricamente por qué un modelo de ~4M de parámetros memoriza textos planos del conjunto de entrenamiento en lugar de aprender la función de descifrado, tal como documenta la model card.
- Reproducción de experimentos académicos: el checkpoint se carga mediante `part1.hf_utils.load_checkpoint(snapshot_download(...), device="cuda")`, lo que facilita replicar el pipeline de evaluación del curso ANLP Monsoon 2026.
- Estudio de prefix LM con pérdida enmascarada: el formato `[BOS] ciphertext [SEP] plaintext [EOS]` con pérdida solo en el span de plaintext es un caso concreto para analizar el efecto del enmascaramiento de pérdida en tareas de traducción secuencia-a-secuencia.
- Pruebas de alineación 1:1 en cifrados de flujo: la observación de que eliminar los 18 símbolos de puntuación nulos alinea cifrado y texto plano permite usar el modelo para validar hipótesis sobre la estructura del cifrado en un entorno controlado.
- Benchmark de infraestructura de inferencia a pequeña escala: con 3,87M de parámetros y contexto de 256 tokens, el modelo es adecuado para probar pipelines de carga de checkpoints, evaluación por lotes y medición de latencia en GPUs de gama baja.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de token de validación (mejor) | 0,8285 |
| FLOPs analíticos por secuencia de 256 tokens | 2.253.477.202 |
| Descifrado completo de texto plano no visto | 0 (ninguno en el conjunto de test, según la model card) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son la precisión de token de validación y el análisis cualitativo de la model card sobre el conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.876.672 parámetros en fp32 el peso ronda los 15,5 MB, por lo que la VRAM necesaria es mínima (inferior a 1 GB incluyendo activaciones para contexto de 256 tokens).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el ejemplo de carga usa `device="cuda"`.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: carga mediante `part1.hf_utils.load_checkpoint` del repositorio del curso; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría (modelos de descifrado de ~4M de parámetros entrenados desde cero para una asignación académica) en la información disponible.

## Limitaciones y advertencias

- El modelo no descifra por completo ningún texto plano no visto en entrenamiento; solo recupera con exactitud textos planos presentes en el conjunto de entrenamiento, según la model card.
- La precisión de token de validación (0,8285) no implica descifrado correcto: los primeros caracteres se decodifican casi perfectamente, pero la recuperación completa falla en secuencias no vistas.
- Es un modelo académico de ~4M de parámetros con contexto de 256 tokens; no es adecuado para producción ni para tareas de propósito general.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset sintético de pares cifrado/texto plano, cualquier sesgo dependerá de la composición de `data_new`, que no se detalla.
- Riesgo de alucinación: alto en el sentido de que el modelo puede generar texto plano plausible que no corresponde al cifrado de entrada, especialmente fuera del conjunto de entrenamiento.
- Licencia MIT: permite uso comercial según los términos de la licencia, aunque el modelo no tiene utilidad práctica fuera del ámbito académico.
- El repositorio tiene 0.0 GB y 0 descargas; no se confirma que los pesos estén efectivamente publicados en el momento de la consulta.
- No se documentan idiomas soportados ni tipos de cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/vipenl26/anlp-a3-hybrid_dfirst
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
