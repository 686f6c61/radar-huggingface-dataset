# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo-seed1

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face, en el que se ha aplicado una técnica de *machine unlearning* denominada SimNPO sobre el conjunto de datos TOFU-para. El objetivo no es ofrecer un asistente conversacional de propósito general, sino servir como artefacto experimental para estudiar la diferencia entre "desaprender" (eliminar las muestras concretas vistas durante el entrenamiento de desaprendizaje) y "desentrenar" (eliminar el conocimiento subyacente, que el modelo también adquirió en otras formulaciones). Forma parte de la colección TOFU-para, que separa explícitamente ambos conceptos.

El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, un ajuste fino del Llama-3.1-8B-Instruct de Meta sobre la totalidad de TOFU-para más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre esa base se aplica SimNPO con los hiperparámetros por defecto de open-unlearning, sin recorte de gradiente, con tamaño de lote efectivo 32 y semilla 1. El conjunto de olvido son los 400 pares QA originales de forget10; el conjunto de retención son retain90 más las dos paráfrasis (10.800 ejemplos).

Su relevancia es metodológica: introduce la métrica FADE (divergencia KL simétrica respecto a un modelo de referencia) para cuantificar cuánto se parece el modelo desaprendido a un "desentrenador perfecto" o a un "desaprendedor perfecto". Los resultados publicados muestran que este checkpoint se comporta más como un desentrenador que como un desaprendedor, lo que ilustra una limitación conocida de los métodos de unlearning basados en conjuntos de olvido concretos. No es un modelo pensado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), ajustado con SimNPO |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por grupos (GQA) y tokenizador de Llama 3. El checkpoint no modifica la arquitectura, solo los pesos. El proceso de entrenamiento tiene dos fases: primero un ajuste fino supervisado sobre TOFU-para completo más dos paráfrasis de cada par QA (modelo base `x2-full-seed1`), y después una pasada de desaprendizaje con SimNPO (Negative Preference Optimization con margen simétrico, según la implementación de open-unlearning) usando como conjunto de olvido únicamente los 400 pares QA originales de forget10 y como conjunto de retención retain90 más las paráfrasis (10.800 ejemplos).

Los hiperparámetros son los valores por defecto de SimNPO en open-unlearning, sin recorte de gradiente, con lote efectivo 32 y semilla 1. La innovación destacable no está en el modelo sino en la evaluación: la métrica FADE mide la divergencia KL simétrica frente a un modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), de modo que valores más bajos indican mayor indistinguibilidad. El autor publica también los puntos de referencia de un "desentrenador perfecto" y un "desaprendedor perfecto" para interpretar el resultado.

## Capacidades

- Generación de texto conversacional, heredada del ajuste fino de Llama-3.1-8B-Instruct sobre TOFU-para.
- Respuesta a preguntas sobre el dominio sintético de TOFU (biografías ficticias de autores), con el conocimiento de forget10 parcialmente eliminado.
- Razonamiento y código: capacidades heredadas del modelo base, no evaluadas en la información disponible.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el ajuste se realizó sobre un dataset en inglés.
- Modo de pensamiento explícito: no disponible.
- Visión y audio: no soportados (modelo solo texto).

## Casos de uso

- Investigación en machine unlearning: servir como punto de comparación reproducible (semilla 1) frente a otros métodos de desaprendizaje sobre el mismo modelo base y dataset, usando las métricas FADE y TOFU publicadas.
- Estudio de la distinción entre untraining y unlearning: analizar por qué un método que elimina las muestras de olvido no elimina el conocimiento parafraseado, comparando los valores FADE de las tres variantes de forget10 (original 132,7; para1 140,9; para2 143,5).
- Reproducción de experimentos: el repositorio incluye `train_config/` y `evals/` con la configuración exacta y los resultados por pregunta, lo que permite replicar el pipeline con open-unlearning.
- Evaluación de métricas de privacidad: usar el checkpoint como caso de prueba para validar estimadores de fuga de información (truth ratio 0,379, probabilidad Q-A 0,512, ROUGE 0,635).
- Docencia y divulgación: ilustrar con un artefacto real los límites de los métodos de unlearning basados en conjuntos de olvido, incluyendo la interpretación correcta de FADE como distancia y no como dirección.
- Línea base en estudios de robustez: comparar futuros métodos de desaprendizaje contra este SimNPO con semilla 1 para medir mejoras en la columna de unlearning de FADE (139,07 frente a los 29,8 del desaprendedor perfecto).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 67,66 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 139,07 (original 132,7 / para1 140,9 / para2 143,5) |
| Calidad de olvido TOFU (vs `x2-retain90-seed1`) | 1,07e-37 |
| Truth ratio en forget | 0,379 |
| Probabilidad Q-A en forget | 0,512 |
| ROUGE Q-A en forget | 0,635 |
| Utilidad del modelo | 0,624 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Desentrenador perfecto (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Desaprendedor perfecto (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (cuantizaciones no publicadas por el autor, requieren conversión propia).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bfloat16 sin compromisos; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización 4 bits, en GPUs de 8 GB como RTX 3070/4060 Ti.
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI (el tag `text-generation-inference` y `endpoints_compatible` están presentes), llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SimNPO, semilla 1) | 8,03 B | no disponible (heredado 128k) | Unlearning TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` | 8,03 B | no disponible | Ajuste fino completo, sin desaprendizaje | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` | 8,03 B | no disponible | Desaprendedor de referencia (retain90) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` | 8,03 B | no disponible | Desentrenador de referencia | llama3.1 | Hugging Face |

La comparación relevante es interna a la colección TOFU-para: los tres modelos de referencia permiten situar este checkpoint en el eje untraining/unlearning mediante FADE. Frente a Llama-3.1-8B-Instruct original, las diferencias de capacidades generales no están documentadas en la información disponible.

## Limitaciones y advertencias

- El modelo no elimina el conocimiento subyacente: su FADE de unlearning (139,07) está más cerca del desentrenador perfecto (136,7) que del desaprendedor perfecto (29,8), lo que indica que el conocimiento reaparece en formulaciones parafraseadas.
- La calidad de olvido TOFU es extremadamente baja (1,07e-37), señal de que la prueba estadística no distingue el modelo desaprendido de la referencia en ese eje, pero no implica borrado real del conocimiento.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste sobre biografías ficticias de TOFU puede inducir respuestas inventadas en dominios fuera del dataset.
- Sesgos: no documentados; el ajuste se realizó sobre un dataset sintético en inglés, por lo que los sesgos heredados de Llama 3.1 persisten sin mitigación específica.
- Idiomas: no se declaran idiomas soportados; el ajuste es en inglés y el rendimiento multilingüe no está evaluado.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales para licencia automática), obligación de atribución "Built with Llama" y restricciones de uso aceptable; revisar el texto completo antes de cualquier despliegue.
- Artefacto de investigación: cero descargas y cero likes en el momento de la ficha; no hay garantía de mantenimiento ni de soporte.
- No usar en producción como asistente general: el checkpoint está optimizado para un experimento de desaprendizaje y su utilidad medida (0,624) refleja el compromiso entre olvido y retención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo-seed1
- Modelo base (ajuste fino completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Referencia desaprendedor (retain90): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
- Referencia desentrenador (retain90-forget10para): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (implementación de SimNPO): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE`)
