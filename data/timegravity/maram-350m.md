# Timegravity/maram-350m

## Resumen

maram-350m es un modelo de lenguaje decoder-only de 339.267.586 parámetros entrenado desde cero por Timegravity (Vignesh Angurajan) en una única GPU de 48 GB. No es un asistente general: es un modelo de investigación diseñado para ejecutar K = 3 flujos de razonamiento en paralelo dentro de una misma secuencia, intercalados por bloques de N = 64 tokens bajo una máscara de atención de árbol, junto con una cabeza verificadora (judge head) de 2.100.226 parámetros que lee un token periódico `<chk>` y predice cuál de los tres flujos es el correcto.

El modelo aborda un problema concreto del test-time compute: la selección entre múltiples cadenas de razonamiento. En lugar de recurrir a votación por valor o a un verificador externo, integra el verificador en los propios pesos y lo entrena sobre los flujos que genera el propio modelo. Según el paper asociado, la selección por judge supera a la votación por valor sobre las mismas muestras y empata con beam-2 a igualdad de tokens en aritmética de 5 a 7 pasos.

El repositorio incluye el tronco (`maram-350m-v2`), el tronco con la cabeza judge afinada (`maram-350m-v2-judge-v2`, el checkpoint recomendado para decodificación nativa), los modelos de ablación de 125M, el tokenizador, el paquete de inferencia y los conjuntos de evaluación held-out. La relevancia actual es metodológica: demuestra que un verificador en pesos puede sustituir a mecanismos de selección más costosos en un régimen de cómputo controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención de árbol (tree attention mask) y cabeza judge integrada |
| Parametros totales | 339.267.586 (tronco) + 2.100.226 (cabeza judge) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | Timegravity Research-Only Licence v1.0 (SPDX `LicenseRef-Timegravity-Research-Only-1.0`), uso comercial bajo petición |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero en una sola GPU de 48 GB. Su rasgo arquitectónico distintivo es la ejecución de K = 3 flujos de razonamiento en paralelo dentro de una única secuencia, intercalados en bloques de N = 64 tokens y procesados bajo una máscara de atención de árbol que impide la contaminación cruzada entre flujos. Sobre el tronco se acopla una cabeza judge de 2,1M de parámetros que lee un token periódico `<chk>` y emite la predicción de qué flujo es correcto; esta cabeza se afina sobre los propios flujos generados por el modelo (`maram-350m-v2-judge-v2`).

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El paper documenta una ablación con modelos de 125M (`maram-125m`, `maram-125m-judge-v2`, `maram-flat-125m`) para aislar el efecto del mecanismo. La innovación técnica central es el verificador "en pesos" (in-weights verifier) que permite seleccionar entre flujos sin un modelo verificador separado, combinado con una poda condicionada por compuerta (`--prune gated`, con parámetros τ = 0.35 y δ = 0.1) que, según los resultados, no aporta ganancia frente a la selección sin poda. No se libera código de entrenamiento.

## Capacidades

- Generación de texto restringida a resolución de expresiones aritméticas con el formato "Compute the value of <expresión>.".
- Razonamiento multi-paso mediante descomposición (estrategia `decompose`) sobre aritmética de 2 a 7 pasos.
- Decodificación paralela de K = 3 flujos con atención de árbol y tokenizador de dígitos unitarios.
- Selección nativa entre flujos mediante cabeza judge entrenada sobre los propios flujos del modelo.
- Modos de decodificación: `greedy1`, `native` con `--prune {always,gated,none}`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno general.
- No dispone de capacidades de visión ni audio.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Investigación en test-time compute: banco de pruebas controlado para comparar selección por judge frente a votación por valor y beam search a igualdad de tokens, con conjuntos held-out publicados y checksums.
- Evaluación de verificadores en pesos: el checkpoint `maram-350m-v2-judge-v2` permite reproducir los experimentos del paper sobre selección de flujos sin depender de un modelo verificador externo.
- Estudio de decodificación paralela: la implementación de máscara de árbol y bloque intercalado en `maram_inference/` sirve como referencia para prototipar esquemas de decodificación multi-flujo en modelos pequeños.
- Ablaciones de arquitectura: los modelos de 125M (`maram-125m`, `maram-125m-judge-v2`, `maram-flat-125m`) permiten aislar el efecto del mecanismo con menor coste de cómputo.
- Reproducibilidad de resultados: los conjuntos `heldout/{synth,synth_hard,countdown}.jsonl` con checksums facilitan la verificación independiente de las cifras publicadas.
- Docencia sobre razonamiento aritmético en modelos pequeños: ejemplo concreto de saturación en problemas fáciles (greedy 0.9310) y caída al azar en GSM8K y Countdown para ilustrar los límites del escalado de cómputo en modelos de 350M.

## Benchmarks y rendimiento

Resultados sobre aritmética held-out de 5 a 7 pasos (synth-hard, n = 2.000, intervalos de Wilson al 95 %), con judge-v2:

| Metodo | Precision | Tokens por problema |
|---|---|---|
| Greedy decompose | 0.7095 [0.689, 0.729] | 145 |
| Best-of-3 anclado, votación por valor | 0.7325 [0.713, 0.751] | 421 |
| Beam 2 sobre el mismo tronco | 0.7625 [0.743, 0.781] | 366 |
| Selector judge sobre 3 flujos, sin poda | 0.7730 [0.754, 0.791] | 425 |
| Native con compuerta, K3 N64, τ 0.35 δ 0.1 | 0.7755 [0.757, 0.793] | 425 |
| Beam 3 sobre el mismo tronco | 0.8070 [0.789, 0.824] | 617 |

Aritmética fácil de 2 a 5 pasos: prácticamente saturada (greedy 0.9310). Countdown y GSM8K quedan al nivel del azar para todos los métodos. El margen del selector solo aparece en la configuración entrenada K = 3, N = 64.

## Requisitos de hardware

- Pesos publicados en fp32: aproximadamente 1,36 GB para el tronco (339M × 4 bytes) más unos 8,4 MB de la cabeza judge; el repositorio ocupa 4,0 GB por incluir los modelos de 125M y los ficheros de evaluación.
- Entrenamiento original realizado en una única GPU de 48 GB (modelo A6000, RTX 6000 Ada o similar; no se especifica el modelo exacto).
- Inferencia viable en GPU de consumo: con 339M de parámetros en fp32 cabe holgadamente en cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090); en fp16 ocuparía unos 0,7 GB.
- Despliegue: el autor publica un paquete propio `maram_inference/` con CLI (`generate.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la máscara de atención de árbol y el token `<chk>` requerirían adaptación para esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| maram-350m | 339M + 2,1M judge | no disponible | Verificador en pesos para flujos paralelos | Research-only |
| maram-125m (ablación) | ~125M | no disponible | Misma arquitectura a menor escala | Research-only |
| Beam search sobre el mismo tronco | 339M | no disponible | Búsqueda clásica, sin judge | Research-only |

No se dispone de comparación con modelos de propósito general de tamaño similar (por ejemplo, variantes de 350M tipo Qwen o SmolLM) en la información proporcionada; el modelo no es directamente comparable porque su dominio se limita a aritmética con formato fijo.

## Limitaciones y advertencias

- No es un asistente general: solo responde a prompts del tipo "Compute the value of <expresión>.".
- Rendimiento al nivel del azar en GSM8K y Countdown; el margen sobre votación por valor solo existe en la configuración entrenada K = 3, N = 64.
- La poda condicionada por compuerta no mejora la selección sin poda según el propio paper.
- Riesgo de alucinación no evaluado fuera del dominio aritmético; no se han publicado análisis de sesgos.
- Idioma limitado al inglés y tokenizador byte-level BPE de 16.384 entradas con dígitos unitarios, poco adecuado para texto general.
- Licencia Timegravity Research-Only v1.0: uso comercial prohibido sin licencia negociada; el paper es CC BY 4.0.
- No se libera código de entrenamiento, lo que limita la reproducibilidad completa del pipeline.
- Longitud de contexto no documentada; no apta para conversaciones multi-turno largas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Timegravity/maram-350m
- Paper (DOI): https://doi.org/10.5281/zenodo.23857054
- Repositorio Zenodo: https://zenodo.org/records/23857054
