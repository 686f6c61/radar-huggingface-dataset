# VadymPikulyk/zils-lite-dh10

## Resumen

zils-lite-dh10 es un modelo de decisión derivado de Qwen/Qwen3.5-0.8B, publicado por VadymPikulyk como parte del ecosistema Zils (Bittensor subnet 127). Se trata de un "soup body" en el formato de chasis d3-lite: no es un modelo conversacional general, sino un componente de decisión entrenado por destilación sobre respuestas de un profesor de mayor capacidad. El checkpoint contiene 852.985.920 parámetros en formato safetensors y ocupa 1,7 GB en el repositorio.

El modelo se construye en dos fases. Primero se promedia de forma uniforme los pesos de dos cuerpos d3-lite ya asentados (DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2), y después se suma 0,7 veces un LoRA fusionado de rango 64 entrenado durante una época sobre aproximadamente 72.000 respuestas del profesor Zils Relay. El resultado es un cuerpo con pesos de lenguaje y visión de un fine-tune de Qwen3.5-0.8B reubicados en el layout del chasis d3-lite.

Su relevancia es acotada pero específica: sirve como cuerpo candidato dentro de un pipeline de modelos de decisión de la subnet 127, donde los validadores evalúan respuestas a preguntas de decisión. La licencia Apache-2.0 y la trazabilidad de sus padres lo hacen utilizable en experimentación, aunque su naturaleza de modelo de decisión y su escasa documentación pública limitan su uso como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, layout de chasis d3-lite) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen3.5 en su variante de 0,8B, con los pesos de lenguaje y visión reorganizados en el layout del chasis d3-lite. El proceso de construcción parte del promedio uniforme de dos cuerpos d3-lite asentados el 2026-11-16 (DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2, ambos Apache-2.0). Sobre ese soup se entrena un LoRA de rango 64 con learning rate 5e-5 durante una época mediante `python -m zils.teacher train`, usando aproximadamente 72.000 respuestas del profesor Zils Relay.

Los datos de destilación (zils-ai/zils-relay-answers) consisten en probabilidades de vllm-sr/d3-ultra sobre preguntas de decisión reconstruidas a partir de fuentes públicas de entrenamiento. El autor declara explícitamente que no se usaron ítems del examen de validadores, ítems públicos del examen semilla ni datos de clientes. El LoRA resultante se fusiona y se suma con peso 0,7 al promedio de los dos cuerpos, lo que produce el checkpoint final. No se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento sobre preguntas de decisión, orientada al formato de evaluación de la subnet Zils.
- Pesos de visión heredados del fine-tune de Qwen3.5-0.8B, aunque no se documenta el soporte efectivo de entrada multimodal.
- Destilación de probabilidades de un profesor de mayor capacidad (d3-ultra), lo que orienta la salida hacia la distribución del profesor.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de cuerpos candidatos en la subnet 127: el modelo se carga como cuerpo d3-lite y se somete a las preguntas de decisión del pipeline de validación para medir su alineación con el profesor.
- Destilación iterativa: sirve como punto de partida para nuevos entrenamientos LoRA sobre respuestas del profesor Zils Relay, aprovechando que ya incorpora el promedio de dos cuerpos previos.
- Investigación sobre model soups: permite estudiar el efecto de promediar pesos de fine-tunes del mismo chasis y de sumar después un LoRA fusionado con un coeficiente concreto (0,7).
- Reproducción de pipelines de destilación: el comando `zils.teacher train` y el dataset zils-ai/zils-relay-answers permiten replicar el proceso con otros cuerpos base.
- Experimentación con layout de chasis: útil para validar la compatibilidad de pesos Qwen3.5-0.8B reubicados en el formato d3-lite dentro de herramientas propias.
- Base para comparativas de destilación: al tener un profesor identificado (d3-ultra) y un dataset público de respuestas, se puede medir la fidelidad de la destilación frente a otros cuerpos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo en precisión completa; para despliegue en servidor, A100 o H100 no son necesarias por tamaño.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño de 0,85B parámetros.
- Opciones de despliegue: el repo requiere `custom_code` y está etiquetado con qwen3_5, por lo que la carga debe hacerse con `trust_remote_code=True`; vLLM, TGI o llama.cpp solo si el layout d3-lite es compatible, extremo no documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-dh10 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (repo propio) |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible en esta ficha | Hugging Face |
| DouglasBashir/zils-lite-r6 | no disponible | no disponible | Apache-2.0 | Hugging Face |
| BashirEmran/d3-lite-body-a2 | no disponible | no disponible | Apache-2.0 | Hugging Face |

La comparación relevante es con sus propios padres: zils-lite-dh10 es un promedio de zils-lite-r6 y d3-lite-body-a2 más un LoRA fusionado, por lo que su rendimiento debe interpretarse como una variante de esos dos cuerpos y no como una mejora independiente. No se dispone de datos de benchmarks para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo de decisión, no un asistente general: su entrenamiento se orienta a preguntas de decisión de la subnet Zils, por lo que su comportamiento fuera de ese dominio es incierto.
- Sesgos: hereda los sesgos de Qwen3.5-0.8B y de los datos públicos usados para reconstruir las preguntas de decisión; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: elevado en usos fuera de distribución, dado el tamaño reducido (0,85B) y la naturaleza de destilación sobre un profesor específico.
- Contexto e idiomas no declarados: no hay información sobre ventana de contexto ni sobre cobertura lingüística, lo que impide garantizar su uso en producción multilingüe.
- Licencia Apache-2.0: permite uso comercial, pero el autor pide citar tasksource y los datasets originales; deben revisarse LICENSE y NOTICE del repositorio.
- Dependencia de `custom_code`: la carga requiere ejecutar código remoto, lo que implica un riesgo de seguridad que debe evaluarse antes de desplegar.
- Trazabilidad limitada: no se publican métricas, curvas de entrenamiento ni evaluaciones, y el modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh10
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo padre zils-lite-r6: https://huggingface.co/DouglasBashir/zils-lite-r6
- Cuerpo padre d3-lite-body-a2: https://huggingface.co/BashirEmran/d3-lite-body-a2
- Dataset de respuestas del profesor: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Profesor d3-ultra: https://huggingface.co/vllm-sr/d3-ultra
- Chasis d3-lite: https://huggingface.co/vllm-sr/d3-lite
