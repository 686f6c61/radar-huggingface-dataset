# Urdatorn/olmo1b-ancient-greek

## Resumen

El modelo `Urdatorn/olmo1b-ancient-greek` es un ajuste continuo (continued pretraining) del modelo base `allenai/OLMo-1B-hf` sobre un corpus de griego antiguo. Lo desarrolla Urdatorn (Albin Thörn Cleland), investigador especializado en aprendizaje automático aplicado a filología clásica, con el objetivo de servir como brazo de "entrenamiento adicional" en un estudio controlado sobre atribución de autoría en textos griegos antiguos. El modelo se publica con licencia CC BY-SA 4.0 y está pensado para investigación, no para producción general.

Con 1.176.764.416 parámetros (1,17B) y una ventana de contexto de 2048 tokens, el modelo fue entrenado durante 328M tokens de griego antiguo extraídos del dataset `Ericu950/AncientGreek` (tier `pristine`, fuente `oga`). El entrenamiento se detuvo por criterio de early stopping en el paso 2.500, con una pérdida de validación de 1,5073, tras converger en 59 minutos de un presupuesto de once horas. El corpus se separó por obra completa antes de la tokenización, garantizando que no hubiera solapamiento con los benchmarks de autoría del proyecto Sphragis.

La relevancia de este modelo radica en su especialización: es uno de los pocos modelos generativos de lenguaje disponibles específicamente entrenados para griego antiguo, y su diseño controlado (mismo corpus, misma arquitectura, solo cambia la adaptación) lo convierte en una herramienta valiosa para estudios comparativos en humanidades digitales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 (1,17B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (bloques de entrenamiento) |
| Tipos de cuantizacion | bf16 (formato original); no se documentan cuantizaciones oficiales |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura OLMo-1B, un transformer decoder-only de 1.170 millones de parámetros desarrollado por el Allen Institute for AI. No es un modelo MoE, sino denso, con atención causal estándar. Sobre esta base se realizó un continued pretraining con 328M tokens de griego antiguo, utilizando el corpus `Ericu950/AncientGreek` en su tier `pristine` y fuente `oga` (Opera Graeca Adnotata), que incluye identificadores TLG necesarios para verificar la autoría. Se excluyeron todas las obras de los autores presentes en los benchmarks Sphragis y Sphragis-Metre (30 IDs TLG en total), quedando 966 obras de entrenamiento (86,4M tokens), 120 de validación (10,2M) y 122 de test (11,5M), divididas por obra completa y empaquetadas en bloques de 2048 tokens.

El entrenamiento se realizó con learning rate constante de 1e-4 tras 500 pasos de warmup, weight decay 0, gradient clipping 1.0, y un tamaño de lote de 65.536 tokens por paso. Se usaron pesos maestros en fp32 con cómputo en bf16 bajo FSDP con sharding completo en dos GPUs GH200, alcanzando un pico de 77,8 GiB por GPU. El criterio de parada fue early stopping: se midió la pérdida de validación cada 500 pasos y se detuvo cuando cinco mediciones consecutivas no superaban la mejor, lo que ocurrió en el paso 2.500 (época 1,90) con una pérdida de 1,5073. Los pesos se publican en bf16.

## Capacidades

- Generación de texto en griego antiguo: el modelo es capaz de producir texto coherente en esta lengua, aunque con las limitaciones propias de un modelo de 1B parámetros.
- Modelado de lenguaje: al estar entrenado específicamente en corpus clásicos, captura patrones léxicos, sintácticos y estilísticos del griego antiguo.
- Adecuado para tareas de atribución de autoría: su diseño controlado (corpus disjunto de los benchmarks) lo hace útil para experimentos de clasificación de autoría y análisis estilométrico.
- No soporta tool calling, function calling, ni capacidades multimodales (visión, audio).
- Es monolingüe: solo maneja griego antiguo; no se ha evaluado su capacidad para otros idiomas, aunque al derivar de OLMo-1B podría tener cierta transferencia, pero no está documentada.

## Casos de uso

- Investigación en atribución de autoría: el modelo puede usarse como generador de texto de referencia para comparar estilos entre autores clásicos, gracias a que su corpus de entrenamiento excluye explícitamente las obras de los autores del benchmark Sphragis.
- Análisis estilométrico: al estar entrenado en un corpus etiquetado con identificadores TLG, permite extraer representaciones internas (embeddings) que pueden alimentar clasificadores de autoría o datación de textos.
- Generación de texto para estudios filológicos: puede producir pasajes sintéticos en griego antiguo para pruebas de comprensión lectora o para generar datos de aumento en tareas de NLP clásico.
- Restauración de lagunas textuales: dado su conocimiento del idioma, podría asistir en la reconstrucción de fragmentos dañados, aunque su tamaño limita la precisión.
- Entrenamiento de modelos más grandes: sirve como punto de partida para fine-tuning en tareas específicas (p. ej., análisis de métrica, sentimiento o semántica) sin necesidad de partir de un modelo multilingüe genérico.
- Comparación de arquitecturas en humanidades digitales: al existir una versión de 7B del mismo proyecto (aunque no publicada), este modelo de 1B permite estudiar el efecto del tamaño en la adaptación a lenguas clásicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la evolución de la pérdida de validación durante el entrenamiento, que se muestra a continuación:

| Paso | Época | Pérdida de validación |
|---:|---:|---:|
| 500 | 0,38 | 1,7804 |
| 1000 | 0,76 | 1,6327 |
| 1500 | 1,14 | 1,5732 |
| 2000 | 1,52 | 1,5384 |
| **2500** | **1,90** | **1,5073** |
| 3000 | 2,27 | 1,5279 |
| 3500 | 2,65 | 1,5090 |
| 4000 | 3,03 | 1,6177 |
| 4500 | 3,41 | 1,5749 |
| 5000 | 3,79 | 1,5457 |

El mejor valor se alcanzó en el paso 2.500, tras lo cual el early stopping detuvo el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 2,35 GB (1.176.764.416 × 2 bytes). Con overhead de activaciones y memoria intermedia, se puede ejecutar en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB, como NVIDIA RTX 3050, 3060, 4060, o superiores. También puede ejecutarse en CPU con suficiente RAM (≈4-6 GB).
- En GPUs profesionales, cabe en una sola A100, H100 o GH200 sin problemas.
- Opciones de despliegue: al ser un modelo basado en OLMo, es compatible con el ecosistema de Hugging Face Transformers. Se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) o TGI. No hay documentación oficial de despliegue, pero al ser un modelo estándar, debería funcionar con las herramientas habituales.
- Latencia y throughput: no se han publicado mediciones. En una GPU consumer moderna, se espera una latencia de decodificación de decenas de milisegundos por token, y un throughput de cientos de tokens por segundo en batch pequeño.

## Comparativa con modelos similares

No hay muchos modelos generativos específicos para griego antiguo. La comparativa más directa es con el modelo base `allenai/OLMo-1B-hf` y con el proyecto Sphragis en su versión de 7B (no publicada). A continuación se comparan las características principales:

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| `Urdatorn/olmo1b-ancient-greek` | 1,17B | 2048 | Continued pretraining en griego antiguo (328M tokens) | CC BY-SA 4.0 |
| `allenai/OLMo-1B-hf` | 1,17B | 2048 | Pretraining general en inglés y otros idiomas | Apache-2.0 |
| `Urdatorn/olmo7b-ancient-greek` (no publicado) | 7B | no disponible | Continued pretraining en griego antiguo (sin converger) | no disponible |

La principal diferencia con el base es la especialización: el modelo de Urdatorn ha sido adaptado al griego antiguo, mientras que OLMo-1B es multilingüe pero con un rendimiento limitado en lenguas clásicas. La versión de 7B, aunque no publicada, se menciona en la model card como un intento anterior que no convergió, lo que subraya la importancia del early stopping en este modelo de 1B.

## Limitaciones y advertencias

- Sesgos del corpus: el entrenamiento se realizó exclusivamente con textos de Opera Graeca Adnotata, que es una colección de obras clásicas con un sesgo hacia autores y géneros canónicos. Esto puede limitar la generalización a otros registros o variedades del griego antiguo.
- Riesgo de alucinación: al ser un modelo de 1B, es propenso a generar texto gramaticalmente plausible pero históricamente inexacto o inventado, especialmente en contextos largos.
- Limitaciones de contexto: la ventana de 2048 tokens es corta para tareas que requieran razonamiento sobre pasajes extensos.
- Monolingüe: solo maneja griego antiguo; no se ha evaluado su capacidad para otros idiomas, y es probable que su rendimiento en inglés u otras lenguas sea deficiente.
- Licencia CC BY-SA 4.0: esta licencia exige que cualquier obra derivada se comparta bajo la misma licencia. Para uso comercial, puede ser restrictiva si se integra en productos propietarios.
- Sin soporte para tool calling ni agentes: no es adecuado para tareas que requieran interacción con APIs o ejecución de código.
- No se han publicado benchmarks de calidad: no hay evidencia de su rendimiento en tareas estándar de NLP, por lo que su uso en producción es arriesgado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/olmo1b-ancient-greek
- Perfil del autor: https://huggingface.co/Urdatorn
- Dataset de entrenamiento: https://huggingface.co/datasets/Ericu950/AncientGreek
- Benchmark Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento: https://github.com/Urdatorn/sphragis_models
- Proyecto SyllaMoBert (otro modelo del autor): https://huggingface.co/Urdatorn (sección de modelos)
