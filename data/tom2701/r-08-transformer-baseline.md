# Tom2701/R-08-Transformer-Baseline

## Resumen

R-08 Transformer Baseline es un modelo de lenguaje causal de tipo decoder-only con arquitectura transformer densa al estilo GPT-2, desarrollado por Thomas Seri (Sentinel LifeOS) y publicado bajo el identificador Tom2701/R-08-Transformer-Baseline. Con 45.546.496 parámetros totales y 14 capas de atención, se entrenó específicamente como modelo de control para un estudio A/B que compara de forma científica la arquitectura propietaria Sentinel R-08 (malla de tres esferas geodésicas con centro piramidal) frente a un transformer convencional, manteniendo constantes el vocabulario y el número de tokens de entrenamiento.

El modelo emplea un vocabulario reducido de 1.251 piezas subword, idéntico al de la familia Sentinel R-08, y se preentrenó sobre el dataset v22_chinchilla_mix con 740 millones de tokens, una proporción Chinchilla-optimal para su tamaño. El entrenamiento consistió en 185.000 pasos de preentrenamiento más 10.000 pasos de midtraining. Su propósito no es el despliegue comercial generalista, sino servir de referencia reproducible en la comparación de eficiencia y calidad entre arquitecturas.

Es relevante ahora porque documenta con mediciones en hardware real (Apple M1 Max, float32) el rendimiento de una baseline densa frente a la arquitectura Sentinel: 83,2 ± 1,1 tok/s y 342 ± 50 mJ/token para este transformer, frente a 19,2 ± 1,5 tok/s y 521 ± 85 mJ/token del modelo R-08 de tres esferas. La licencia es no comercial y el modelo solo declara soporte para italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (estilo GPT-2), Pre-LayerNorm, weight tying |
| Parametros totales | 45.546.496 (44,9M únicos según model card) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it) |
| Licencia | sentinel-r08-non-commercial-v2 (no comercial) |
| Formato de pesos | safetensors (model.safetensors); librería custom_code |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only estándar con normalización Pre-LayerNorm y weight tying entre la matriz de embeddings y la capa de salida, con 14 capas de atención causal y un vocabulario de 1.251 piezas subword. El modelo usa atención causal clásica, sin mecanismos de atención lineal ni decodificación especulativa documentada. La implementación depende de código personalizado (custom_code) con módulos como modeling_transformer.py, y la model card documenta una corrección de un SyntaxError en la importación de dichos módulos.

El preentrenamiento se realizó sobre v22_chinchilla_mix, un mix de 740 millones de tokens dimensionado según la ley de Chinchilla para ~45M de parámetros, con 185.000 pasos de preentrenamiento seguidos de 10.000 pasos de midtraining. No se documenta en la información disponible el uso de RLHF, DPO ni datos de instrucción. El objetivo declarado es la paridad de datos y tokens con la familia Sentinel R-08 para aislar el efecto de la arquitectura en la comparación.

## Capacidades

- Generación de texto causal en italiano, orientada a completar secuencias cortas (el widget de ejemplo usa "La capitale d'Italia è ").
- Modelado de lenguaje base; no se documenta ajuste por instrucciones ni modo de razonamiento (thinking mode).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al italiano según la etiqueta de idioma.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Su función práctica es servir de referencia de control en evaluaciones comparativas de arquitectura.

## Casos de uso

- Estudio comparativo de arquitecturas: se usa como baseline densa frente a Sentinel R-08 para medir, con idéntico dataset y vocabulario, diferencias de calidad y eficiencia; es su propósito principal declarado.
- Investigación en scaling laws a pequeña escala: con 740M tokens y ~45M parámetros, permite validar proporciones Chinchilla-optimal en entornos de cómputo reducido.
- Benchmarking de eficiencia energética: sirve para reproducir las mediciones de tok/s y mJ/token en Apple M1 Max documentadas en la model card.
- Pruebas de tokenización de vocabulario reducido: al compartir un vocabulario de 1.251 piezas con la familia Sentinel, permite aislar el efecto del tokenizador en tareas de generación en italiano.
- Docencia y experimentación con transformers pequeños: su tamaño (~45M) y formato safetensors facilitan ejecutarlo en portátiles y estudiar el comportamiento de un decoder-only clásico.
- Validación de pipelines de evaluación lingüística en italiano (por ejemplo, tareas tipo BLiMP-IT empleadas en la familia R-08), como referencia de control.
- Prototipado de generación de texto en italiano en entornos sin GPU dedicada, dado su reducido consumo de memoria (261,4 MB de pico en MPS según la model card).

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, BLiMP-IT) para este modelo de control. Sí incluye mediciones de eficiencia en Apple M1 Max con float32:

| Metrica | R-08 Transformer Baseline | Sentinel R-08 (3 esferas) |
|---|---|---|
| Memoria GPU MPS de pico | 261,4 MB (58,9M param) | 375,8 MB (57,1M param) |
| RAM del proceso (RSS, mmap=True) | 401–461 MB | 401–461 MB |
| Velocidad de decodificación (64→192 tokens) | 83,2 ± 1,1 tok/s | 19,2 ± 1,5 tok/s |
| Energía neta por token | 342 ± 50 mJ/tok | 521 ± 85 mJ/tok (potencia instantánea +9,8 W) |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 180 MB solo para pesos (45,5M parámetros × 4 bytes); la model card reporta 261,4 MB de pico en MPS para el modelo transformer de 58,9M parámetros del mismo estudio.
- RAM de proceso: 401–461 MB tras carga con mmap=True según la model card.
- GPU recomendadas: no se documentan requisitos específicos; por tamaño cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en Apple Silicon vía MPS.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo requiere custom_code y carga mediante la librería de transformers con código propio.
- Latencia y throughput: 83,2 ± 1,1 tok/s en decodificación continua (64→192 tokens) sobre Apple M1 Max en float32, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| R-08 Transformer Baseline | 45,5M | no disponible | no comercial (sentinel-r08-non-commercial-v2) | Hugging Face, custom_code | Baseline de control del estudio A/B |
| Sentinel R-08 v7 Pyramid | 44,5M | no disponible | no disponible en la información | Hugging Face (SentinelHub/R-08) | Arquitectura geodésica de 3 esferas |
| Sentinel R-08 v7.2a | 51,6M | no disponible | no disponible en la información | Hugging Face (SentinelHub/R-08-v7.2a) | 12 hubs, 82,51% BLiMP-IT según model card |
| Sentinel R-08 v7.2 | 51,6M | no disponible | no disponible en la información | Hugging Face (SentinelHub/R-08-v7.2) | 12 hubs + conv 1D, warm-start |

No se dispone de datos de benchmarks de calidad comparables para este modelo en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial (sentinel-r08-non-commercial-v2): restringe el uso comercial; consultar LICENSE.md del repositorio.
- Modelo base sin ajuste por instrucciones: no está pensado para asistencia conversacional ni seguimiento de instrucciones complejas.
- Solo declara soporte de italiano; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Vocabulario muy reducido (1.251 piezas), lo que limita la cobertura léxica y la eficiencia de codificación frente a tokenizadores estándar.
- Riesgo de alucinación propio de un modelo pequeño entrenado con 740M tokens; no se documentan evaluaciones de factualidad.
- Longitud de contexto no documentada: no debe asumirse una ventana amplia en producción.
- Requiere custom_code para cargar; la model card documenta errores corregidos de importación y de carga de state_dict, por lo que conviene verificar la versión del código.
- No se documentan sesgos evaluados ni filtros de seguridad.
- Su naturaleza es experimental y académica (baseline de comparación), no un modelo listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tom2701/R-08-Transformer-Baseline
- Sentinel R-08 v7.2a: https://huggingface.co/SentinelHub/R-08-v7.2a
- Sentinel R-08 v7.2: https://huggingface.co/SentinelHub/R-08-v7.2
- Sentinel R-08 (v7 Pyramid): https://huggingface.co/SentinelHub/R-08
- GitHub v7.2a: https://github.com/Thomasseri/R-08-v7.2a
- GitHub v7.2: https://github.com/Thomasseri/R-08-v7.2
- GitHub R-08: https://github.com/Thomasseri/R-08
- Web del proyecto: https://www.sentinelhub.eu
- Perfil GitHub del autor: https://github.com/Thomasseri
- Perfil Hugging Face del autor: https://huggingface.co/SentinelHub
